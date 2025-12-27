import { Router } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import { storage } from "../storage";
import { loginSchema, registrationSchema, insertCompanySchema, insertUserSchema } from "@shared/schema";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter";
import { requireAuth } from "../middleware/permissions";
import { verifyFirebaseToken } from "../firebaseAdmin";
import { logLogin, logLogout, logCreate } from "../utils/auditLog";
import { badRequest, unauthorized, forbidden, notFound, serverError } from "../utils/sendError";
import { normalize } from "../utils/sanitize";
import { deleteCache, getCache, setCache } from "../redis";

const router = Router();

// Helper to sanitize user data (remove password_hash for security)
function sanitizeUser(user: any) {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}

// Firebase Authentication middleware
const requireFirebaseAuth = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, "Authentication required");
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyFirebaseToken(token);
    
    // Add Firebase user to request
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.displayName || null,
      picture: decodedToken.picture || null
    };
    
    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return unauthorized(res, "Invalid authentication token");
  }
};

// Authentication routes
router.post("/login", loginLimiter, async (req, res) => {
  try {
    // Use the dedicated login schema
    const { email, password, code } = loginSchema.parse(req.body);
    
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return unauthorized(res, "Invalid credentials");
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return unauthorized(res, "Invalid credentials");
    }
    
    if (!user.is_active) {
      return forbidden(res, "Account is inactive");
    }

    // 2FA Check
    if (user.two_factor_enabled) {
      if (!code) {
        return res.status(403).json({ error: "2FA required", require2fa: true });
      }

      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret!,
        encoding: 'base32',
        token: code
      });

      if (!verified) {
        return unauthorized(res, "Invalid 2FA code");
      }
    }
    
    // Set session
    (req as any).session.userId = user.id;
    (req as any).session.companyId = user.company_id;
    (req as any).session.userRole = user.role;
    (req as any).session.userName = user.full_name;
    
    // Log login
    await logLogin({
      userId: user.id,
      companyId: user.company_id,
      userName: user.full_name,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Save session
    (req as any).session.save((err: any) => {
      if (err) {
        console.error('Session save error:', err);
        return serverError(res, "Session error");
      }
      res.json(sanitizeUser(user));
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error during login:", error);
      return serverError(res, "Failed to login");
    }
  }
});

// SSO Login (Google/Firebase)
router.post("/sso-login", requireFirebaseAuth, async (req, res) => {
  try {
    const firebaseUser = (req as any).firebaseUser;
    
    // Find user by email
    let user = await storage.getUserByEmail(firebaseUser.email);
    
    if (!user) {
      // If user doesn't exist, check if there's a company linked to this Firebase UID
      const companies = await storage.getCompaniesByUserId(firebaseUser.uid);
      
      if (companies.length > 0) {
        // Create user for existing company
        const company = companies[0];
        const randomPassword = Math.random().toString(36).slice(-10);
        
        user = await storage.createUser({
          company_id: company.id,
          username: firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          password: randomPassword,
          full_name: firebaseUser.name || firebaseUser.email.split('@')[0],
          role: "owner",
          language: "en",
          timezone: "UTC",
          theme: "auto",
          is_active: true,
        });
      } else {
        // No user and no company - client should redirect to registration
        return res.status(404).json({ 
          message: "User not found", 
          requiresRegistration: true,
          email: firebaseUser.email,
          name: firebaseUser.name
        });
      }
    }
    
    if (!user.is_active) {
      return forbidden(res, "Account is inactive");
    }
    
    // Set session
    (req as any).session.userId = user.id;
    (req as any).session.companyId = user.company_id;
    (req as any).session.userRole = user.role;
    (req as any).session.userName = user.full_name;
    
    // Log login
    await logLogin({
      userId: user.id,
      companyId: user.company_id,
      userName: user.full_name,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Save session
    (req as any).session.save((err: any) => {
      if (err) {
        console.error('Session save error:', err);
        return serverError(res, "Session error");
      }
      res.json(sanitizeUser(user));
    });
  } catch (error: any) {
    console.error("Error during SSO login:", error);
    return serverError(res, "Failed to login with SSO");
  }
});

router.post("/logout", async (req, res) => {
  if ((req as any).session.userId) {
    await logLogout({
      userId: (req as any).session.userId,
      companyId: (req as any).session.companyId,
      userName: (req as any).session.userName || 'Unknown',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
  }
  
  (req as any).session.destroy((err: any) => {
    if (err) {
      console.error('Session destroy error:', err);
      return serverError(res, "Logout failed");
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Registration endpoint - creates company and user together
router.post("/register", registerLimiter, async (req, res) => {
  try {
    const validatedData = registrationSchema.parse(req.body);
    
    // Check if email or username already exists
    const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
    if (existingUserByEmail) {
      return badRequest(res, "Email already registered");
    }
    
    const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
    if (existingUserByUsername) {
      return badRequest(res, "Username already taken");
    }
    
    // Create company first
    const company = await storage.createCompany({
      name: validatedData.companyName,
      base_currency: validatedData.baseCurrency,
      fiscal_year_start: validatedData.fiscalYearStart,
      date_format: "dd/MM/yyyy",
      number_format: "1,234.56",
    });
    
    // Create user with the company
    const user = await storage.createUser({
      company_id: company.id,
      username: validatedData.username,
      email: validatedData.email,
      password: validatedData.password,
      full_name: validatedData.fullName,
      role: "owner", // First user is owner
      language: "en",
      timezone: "UTC",
      theme: "auto",
      is_active: true,
    });
    
    // Set session
    (req as any).session.userId = user.id;
    (req as any).session.companyId = company.id;
    (req as any).session.userRole = user.role;
    (req as any).session.userName = user.full_name;
    
    // Save session
    (req as any).session.save((err: any) => {
      if (err) {
        console.error('Session save error:', err);
        return serverError(res, "Session error");
      }
      res.status(201).json({
        user: sanitizeUser(user),
        company: company,
      });
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error during registration:", error);
      return serverError(res, "Failed to register");
    }
  }
});

// Switch active company
router.post("/switch-company", requireAuth, async (req, res) => {
  try {
    const { companyId } = req.body;
    const userId = (req as any).session?.userId;
    
    console.log('Switch company request:', { companyId, userId, sessionExists: !!(req as any).session });
    
    if (!companyId) {
      return badRequest(res, "Company ID required");
    }
    
    if (!userId) {
      console.error('Switch company: No userId in session');
      return badRequest(res, "User session invalid");
    }
    
    // Verify user has access to this company
    const company = await storage.getCompanyById(companyId);
    if (!company) {
      return notFound(res, "Company not found");
    }
    
    // Update session with new company
    (req as any).session.companyId = companyId;
    
    // Also update user's default company
    try {
      await storage.updateUser(userId, { company_id: companyId });
    } catch (updateError: any) {
      console.error('Failed to update user company_id:', updateError);
      // Continue anyway - session update is more important
    }
    
    // Get updated user
    const updatedUser = await storage.getUserById(userId);
    
    (req as any).session.save((err: any) => {
      if (err) {
        console.error('Session save error:', err);
        return serverError(res, "Session error");
      }
      res.json({ 
        message: "Company switched successfully", 
        company,
        user: updatedUser ? {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          full_name: updatedUser.full_name,
          role: updatedUser.role,
          company_id: companyId,
          legal_consent_accepted: updatedUser.legal_consent_accepted,
          legal_consent_date: updatedUser.legal_consent_date,
          legal_consent_version: updatedUser.legal_consent_version,
        } : null
      });
    });
  } catch (error: any) {
    console.error('Switch company error:', error?.message || error);
    return serverError(res, "Failed to switch company");
  }
});

export default router;
