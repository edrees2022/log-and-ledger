import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { verifyFirebaseToken } from "../firebaseAdmin";
import { 
  insertUserSchema, 
  user_permissions, 
  legal_consent_logs,
  ai_consent
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requirePermission, clearPermissionsCache } from "../middleware/permissions";
import { logCreate, logDelete, logUpdate } from "../utils/auditLog";
import { getCache, setCache, deleteCache, deleteCachePattern } from "../redis";
import { normalize } from "../utils/sanitize";
import { badRequest, unauthorized, forbidden, notFound, serverError } from '../utils/sendError';
import { and, eq, desc } from 'drizzle-orm';

const router = Router();

// Helper to sanitize user data (remove password_hash for security)
function sanitizeUser(user: any) {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}

// Firebase Authentication middleware (local to this router if needed, or imported)
// Since it's used in routes.ts, we might need to duplicate or export it.
// For now, I'll assume we can use a simplified version or rely on the one passed from app if we were using app.use
// But here we are defining a router. We should probably export the middleware from a common place.
// However, to avoid changing too many files at once, I will redefine a simple version here or import if available.
// Looking at routes.ts, requireAuth is defined inside registerRoutes. This is a problem for extraction.
// I should probably move requireAuth to a middleware file first?
// Wait, requireAuth is already used in other files (ai.ts) and imported from "../middleware/permissions".
// Let's check "../middleware/permissions".

import { requireAuth } from "../middleware/permissions";

// We also need requireFirebaseAuth. It seems it was defined inline in routes.ts.
// I will define it here for now.

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
    return unauthorized(res, "Authentication required");
  }
};

// Middleware that accepts either Session Cookie OR Firebase Token
const requireAuthWithFallback = async (req: any, res: any, next: any) => {
  // 1. Check session
  if (req.session && req.session.userId) {
    return next();
  }

  // 2. Check Firebase Token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await verifyFirebaseToken(token);
      
      if (!decodedToken.email) {
         return unauthorized(res, "Invalid token: email missing");
      }

      const user = await storage.getUserByEmail(decodedToken.email);
      if (!user) {
        return unauthorized(res, "User not found");
      }

      // Populate req.user to mimic session
      req.user = {
        id: user.id,
        userId: user.id,
        companyId: user.company_id,
        userRole: user.role,
        role: user.role,
        email: user.email,
        full_name: user.full_name
      };
      
      return next();
    } catch (error) {
      console.error('Firebase token verification failed in fallback:', error);
    }
  }

  return forbidden(res, "Authentication required");
};

// ===== USER ROUTES =====

// List users in active company
router.get("/", requireAuthWithFallback, async (req, res) => {
  try {
    const companyId = (req as any).session?.companyId || (req as any).user?.companyId;
    
    if (!companyId) {
      return badRequest(res, "Company ID required");
    }
    
    // Try cache first (2 minutes TTL)
    const cacheKey = `users:${companyId}`;
    const cached = await getCache<any[]>(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const users = await storage.getUsersByCompany(companyId);
    const sanitizedUsers = users.map(u => sanitizeUser(u));
    
    // Cache for 2 minutes
    await setCache(cacheKey, sanitizedUsers, 120);
    
    res.json(sanitizedUsers);
  } catch (error: any) {
    console.error("Error listing users:", error);
    return serverError(res, "Failed to list users");
  }
});

// Create user (for creating additional users in existing company)
router.post("/", requireAuthWithFallback, async (req, res) => {
  try {
    console.log('📝 Creating new user - Session:', {
      userId: (req as any).session?.userId,
      companyId: (req as any).session?.companyId,
      hasSession: !!(req as any).session,
      firebaseUser: (req as any).firebaseUser?.email,
    });
    
    // Get current user and check if owner
    const currentUserId = (req as any).session?.userId || (req as any).user?.userId;
    if (!currentUserId) {
      return unauthorized(res, "Authentication required");
    }
    
    const currentUser = await storage.getUserById(currentUserId);
    if (!currentUser || currentUser.role !== 'owner') {
      return forbidden(res, "Only owners can create new users");
    }
    
    const validatedData = insertUserSchema.parse(req.body);
    
    // Get company_id from session first, fallback to firebaseUser's companies
    let companyId = (req as any).session?.companyId || (req as any).user?.companyId;
    
    // If session doesn't have companyId (common with Firebase auth), get from firebaseUser
    if (!companyId && (req as any).firebaseUser) {
      const firebaseUser = (req as any).firebaseUser;
      const userCompanies = await storage.getCompaniesByUserId(firebaseUser.uid);
      
      if (userCompanies.length > 0) {
        companyId = userCompanies[0].id;
        console.log(`🏢 Got companyId from Firebase user's companies: ${companyId}`);
      }
    }
    
    if (!companyId) {
      console.error('❌ No companyId found!', {
        session: (req as any).session,
        firebaseUser: (req as any).firebaseUser,
      });
      return badRequest(res, 'Company context not found. Please refresh and try again.');
    }
    
    // Ensure the new user is created in the same company
    // Default role is 'viewer' unless explicitly specified
    const userData = {
      ...validatedData,
      company_id: companyId,
      role: validatedData.role || 'viewer', // Default to viewer for new users
    };
    
    console.log('✅ Creating user with data:', {
      email: userData.email,
      role: userData.role,
      company_id: userData.company_id,
    });
    
    const user = await storage.createUser(userData);
    
    // Log user creation (use the companyId we resolved above)
    await logCreate({
      companyId: companyId, // Use the resolved companyId
      entityType: 'users',
      entityId: user.id,
      createdData: sanitizeUser(user),
      actorId: (req as any).session?.userId || user.id,
      actorName: (req as any).session?.userName || 'System',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string | undefined
    });
    
    // Invalidate users cache (use resolved companyId)
    await deleteCache(`users:${companyId}`);
    
    // CRITICAL: Remove password_hash from response for security
    res.status(201).json(sanitizeUser(user));
  } catch (error: any) {
    console.error("❌ Error creating user:", error);
    
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else if (error.message?.includes('company_id')) {
      // Our validation error from storage.ts
      return badRequest(res, 'Company context is required. Please refresh and try again.');
    } else if (error.code === '23505') {
      // PostgreSQL unique constraint violation
      if (error.constraint === 'users_email_unique') {
        return badRequest(res, 'This email address is already registered. Please use a different email.');
      } else if (error.constraint === 'users_username_unique') {
        return badRequest(res, 'This username is already taken. Please try again.');
      } else {
        return badRequest(res, 'A user with this information already exists.');
      }
    } else {
      return serverError(res, `Failed to create user: ${error.message}`);
    }
  }
});

// Accept legal consent (Terms, Privacy, Disclaimer)
router.post("/accept-legal-consent", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).session.userId;
    const companyId = (req as any).session.companyId;
    
    console.log('📨 Legal consent request received:', { 
      userId, 
      companyId,
      hasSession: !!(req as any).session,
      firebaseUser: (req as any).firebaseUser?.email,
      authHeader: req.headers.authorization ? 'present' : 'missing'
    });
    
    if (!userId) {
      console.error('❌ No userId in session:', {
        session: (req as any).session,
        firebaseUser: (req as any).firebaseUser
      });
      return unauthorized(res, "User ID not found in session");
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      console.error('❌ User not found in database:', userId);
      return notFound(res, "User not found");
    }
    
    console.log('👤 Current user:', { 
      id: user.id, 
      email: user.email,
      legal_consent_accepted: user.legal_consent_accepted 
    });
    
    const consentVersion = process.env.LEGAL_CONSENT_VERSION || '2025-11-01';
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] as string | undefined;
    
    // Update user to mark legal consent as accepted
    const updatedUser = await storage.updateUser(userId, {
      legal_consent_accepted: true,
      legal_consent_date: new Date(),
      legal_consent_version: consentVersion,
    });
    
    if (!updatedUser) {
      console.error('❌ Failed to update user:', userId);
      return serverError(res, "Failed to update user");
    }
    
    console.log('✅ User updated:', {
      id: updatedUser.id,
      legal_consent_accepted: updatedUser.legal_consent_accepted,
      legal_consent_date: updatedUser.legal_consent_date,
    });
    
    // Create audit log entry for legal proof (non-blocking)
    try {
      await db.insert(legal_consent_logs).values({
        user_id: userId,
        company_id: companyId,
        consent_version: consentVersion,
        terms_accepted: true,
        privacy_accepted: true,
        disclaimer_accepted: true,
        ip_address: typeof ipAddress === 'string' ? ipAddress : (Array.isArray(ipAddress) ? ipAddress[0] : null),
        user_agent: userAgent || null,
      });
      console.log('📝 Audit log created successfully');
    } catch (auditError: any) {
      console.error('⚠️ Failed to create audit log (non-critical):', auditError.message);
      // Continue anyway - audit log is nice-to-have but not critical
    }
    
    // Log this important action (non-blocking)
    try {
      await logUpdate({
        companyId,
        entityType: 'users',
        entityId: userId,
        oldData: { legal_consent_accepted: false },
        newData: { 
          legal_consent_accepted: true, 
          legal_consent_date: new Date(), 
          legal_consent_version: consentVersion,
          ip_address: ipAddress,
        },
        actorId: userId,
        actorName: user.full_name,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string | undefined
      });
      console.log('📋 Update logged successfully');
    } catch (logError: any) {
      console.error('⚠️ Failed to log update (non-critical):', logError.message);
      // Continue anyway
    }
    
    // Return updated user data
    const sanitizedUser = sanitizeUser(updatedUser);
    console.log('📤 Sending response:', { 
      success: true,
      user_legal_consent_accepted: sanitizedUser.legal_consent_accepted,
    });
    
    res.json({ success: true, message: "Legal consent accepted", user: sanitizedUser });
  } catch (error: any) {
    console.error("❌ Error accepting legal consent:", error);
    return serverError(res, "Failed to accept legal consent");
  }
});

// Get legal consent history for current user
router.get("/consent-history", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).session.userId;
    const companyId = (req as any).session.companyId;
    
    console.log('📋 Fetching consent history for user:', userId);
    
    // Get all consent records for this user
    const consentRecords = await db.query.legal_consent_logs.findMany({
      where: (legal_consent_logs, { eq, and }) => and(
        eq(legal_consent_logs.user_id, userId),
        eq(legal_consent_logs.company_id, companyId)
      ),
      orderBy: (legal_consent_logs, { desc }) => [desc(legal_consent_logs.accepted_at)],
      limit: 10, // Last 10 records
    });
    
    console.log(`✅ Found ${consentRecords.length} consent records`);
    
    res.json({ 
      success: true, 
      records: consentRecords,
      count: consentRecords.length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching consent history:", error);
    return serverError(res, "Failed to fetch consent history");
  }
});

// Get current user's legal consent status
router.get("/consent", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).session.userId;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return notFound(res, "User not found");
    }
    
    res.json({
      accepted: user.legal_consent_accepted,
      date: user.legal_consent_date,
      version: user.legal_consent_version
    });
  } catch (error: any) {
    console.error("Error fetching consent status:", error);
    return serverError(res, "Failed to fetch consent status");
  }
});

// Update user profile from Firebase (refresh name and email)
router.post("/sync-from-firebase", requireFirebaseAuth, async (req, res) => {
  try {
    const { uid, email, name } = (req as any).firebaseUser!;
    
    console.log('🔄 Syncing user data from Firebase:', {
      uid,
      email,
      name,
    });
    
    // Find user by Firebase UID or email
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Try to find by Firebase companies
      const companies = await storage.getCompaniesByUserId(uid);
      if (companies.length > 0) {
        // Get all users in this company to find the matching one
        const companyUsers = await db.query.users.findMany({
          where: (users, { eq }) => eq(users.company_id, companies[0].id),
        });
        user = companyUsers.find(u => u.email === email);
      }
    }
    
    if (!user) {
      return notFound(res, "User not found. Please sign in again.");
    }
    
    console.log('👤 Found user:', { id: user.id, current_name: user.full_name, current_email: user.email });
    
    // Update user with data from Firebase
    const updates: any = {};
    if (email && email !== user.email) {
      updates.email = email;
    }
    if (name && name !== user.full_name) {
      updates.full_name = name;
    }
    
    if (Object.keys(updates).length > 0) {
      console.log('✏️ Updating user with:', updates);
      const updatedUser = await storage.updateUser(user.id, updates);
      
      if (updatedUser) {
        console.log('✅ User updated successfully');
        // Build explicit response object
        const userResponse = {
          id: updatedUser.id,
          company_id: updatedUser.company_id,
          username: updatedUser.username,
          email: updatedUser.email,
          full_name: updatedUser.full_name,
          role: updatedUser.role,
          language: updatedUser.language,
          timezone: updatedUser.timezone,
          theme: updatedUser.theme,
          is_active: updatedUser.is_active,
          legal_consent_accepted: updatedUser.legal_consent_accepted,
          legal_consent_date: updatedUser.legal_consent_date,
          legal_consent_version: updatedUser.legal_consent_version,
          last_login_at: updatedUser.last_login_at,
          created_at: updatedUser.created_at,
          updated_at: updatedUser.updated_at,
        };
        res.json({ success: true, user: userResponse });
      } else {
        return serverError(res, "Failed to update user");
      }
    } else {
      console.log('ℹ️ No updates needed');
      // Build explicit response object
      const userResponse = {
        id: user.id,
        company_id: user.company_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        language: user.language,
        timezone: user.timezone,
        theme: user.theme,
        is_active: user.is_active,
        legal_consent_accepted: user.legal_consent_accepted,
        legal_consent_date: user.legal_consent_date,
        legal_consent_version: user.legal_consent_version,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
      res.json({ success: true, user: userResponse });
    }
  } catch (error: any) {
    console.error("❌ Error syncing user data:", error);
    return serverError(res, "Failed to sync user data");
  }
});

// Get user permissions
router.get("/:id/permissions", requireAuthWithFallback, async (req, res) => {
  try {
    // Prioritize the source that actually has the userId
    const session = (req as any).session;
    const sessionUser = (session && session.userId) ? session : null;
    const tokenUser = (req as any).user;
    
    const currentUser = sessionUser || tokenUser;
    
    if (!currentUser) {
      return unauthorized(res, "Authentication required");
    }
    
    // Only owner can view permissions management
    // ALLOW SELF-VIEW: Users should be able to see their own permissions
    const userId = req.params.id;
    const userRole = currentUser.userRole || currentUser.role;
    const currentUserId = currentUser.userId || currentUser.id;
    const isSelf = String(userId) === String(currentUserId);
    
    if (userRole !== 'owner' && !isSelf) {
      console.log('[Permissions] Access denied - user role:', userRole, 'target:', userId, 'current:', currentUserId);
      return forbidden(res, "Only owners can view user permissions");
    }
    
    const companyId = currentUser.companyId || currentUser.company_id;
    
    // Verify user exists and belongs to same company
    const user = await storage.getUser(userId);
    if (!user) {
      return notFound(res, "User not found");
    }
    
    if (user.company_id !== companyId) {
      return forbidden(res, "Cannot access permissions for user from different company");
    }
    
    // TEMPORARY: Return empty array until permissions system is fully implemented
    console.log('[Permissions] Returning empty permissions array (table not yet active)');
    return res.json([]);
    
    // TODO: Uncomment when user_permissions table is ready
    // Get permissions from database - return empty array if table doesn't exist
    // try {
    //   const permissions = await db
    //     .select()
    //     .from(user_permissions)
    //     .where(eq(user_permissions.user_id, userId));
    //   
    //   res.json(permissions);
    // } catch (dbError: any) {
    //   // If table doesn't exist (42P01), return empty array instead of error
    //   if (dbError.code === '42P01') {
    //     console.warn('[Permissions] user_permissions table not found - returning empty array');
    //     return res.json([]);
    //   }
    //   // For other errors, re-throw
    //   throw dbError;
    // }
  } catch (error: any) {
    console.error("Error fetching user permissions:", error);
    console.error("Error stack:", error.stack);
    return serverError(res, "Failed to fetch user permissions");
  }
});

// Update user permissions
router.put("/:id/permissions", requireAuthWithFallback, async (req, res) => {
  try {
    // Prioritize the source that actually has the userId
    const session = (req as any).session;
    const sessionUser = (session && session.userId) ? session : null;
    const tokenUser = (req as any).user;
    
    const currentUser = sessionUser || tokenUser;

    if (!currentUser) {
      return unauthorized(res, "Authentication required");
    }
    
    // Only owner can manage permissions
    if (currentUser.userRole !== 'owner') {
      return forbidden(res, "Only owners can manage user permissions");
    }
    
    const userId = req.params.id;
    const companyId = currentUser.companyId;
    const { permissions } = req.body; // Array of permission objects
    
    console.log('Updating permissions for user:', userId);
    console.log('Permissions received:', JSON.stringify(permissions, null, 2));
    
    // Verify user exists and belongs to same company
    const user = await storage.getUser(userId);
    if (!user) {
      return notFound(res, "User not found");
    }
    
    if (user.company_id !== companyId) {
      return forbidden(res, "Cannot update permissions for user from different company");
    }
    
    // Delete existing permissions
    await db.delete(user_permissions).where(eq(user_permissions.user_id, userId));
    
    // Insert new permissions (filter out modules with all false permissions)
    if (permissions && permissions.length > 0) {
      const permissionsToInsert = permissions
        .filter((perm: any) => 
          perm.can_view || perm.can_create || perm.can_edit || perm.can_delete
        )
        .map((perm: any) => ({
          user_id: userId,
          module: perm.module,
          can_view: Boolean(perm.can_view),
          can_create: Boolean(perm.can_create),
          can_edit: Boolean(perm.can_edit),
          can_delete: Boolean(perm.can_delete),
        }));
      
      if (permissionsToInsert.length > 0) {
        await db.insert(user_permissions).values(permissionsToInsert);
      }
    }
    
    // Log the update
    await logUpdate({
      companyId,
      entityType: 'user_permissions',
      entityId: userId,
      oldData: { permissions: 'previous' },
      newData: { permissions },
      actorId: (req as any).session.userId,
      actorName: (req as any).session.userName || 'Unknown',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string | undefined
    });
    
    // Invalidate cache
    await deleteCachePattern(`permissions:${userId}:*`);
    
    // Clear permissions cache in middleware
    const { clearPermissionsCache } = await import('../middleware/permissions');
    clearPermissionsCache(userId);
    
    console.log('Permissions updated successfully');
    
    res.json({ success: true, message: "Permissions updated successfully" });
  } catch (error: any) {
    console.error("Error updating user permissions:", error);
    console.error("Error stack:", error.stack);
    return serverError(res, `Failed to update user permissions: ${error.message}`);
  }
});

// Get user by ID
router.get("/:id", requireAuthWithFallback, async (req, res) => {
  try {
    const currentUserId = (req as any).session?.userId || (req as any).user?.userId;
    let companyId = (req as any).session?.companyId || (req as any).user?.companyId;
    const userId = req.params.id;

    // Debug logging
    console.log(`[GET /users/${userId}] Requesting user details. CurrentUser: ${currentUserId}, SessionCompany: ${companyId}`);

    // Fallback: if companyId is missing but we have a userId, fetch the user to get the companyId
    if (!companyId && currentUserId) {
        console.log(`[GET /users/${userId}] Company ID missing in session, fetching from DB for user ${currentUserId}`);
        const currentUser = await storage.getUser(currentUserId);
        if (currentUser) {
            companyId = currentUser.company_id;
            console.log(`[GET /users/${userId}] Found company ID: ${companyId}`);
        }
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return notFound(res, "User not found");
    }

    // Check permissions:
    // 1. User can view themselves
    // 2. Users in the same company can view each other (basic info)
    // 3. Owners can view users in their company
    
    const isSelf = String(currentUserId) === String(userId);

    // FAST PATH: If user is viewing their own profile, allow immediately
    if (isSelf) {
      const userResponse = {
        id: user.id,
        company_id: user.company_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        language: user.language,
        timezone: user.timezone,
        theme: user.theme,
        is_active: user.is_active,
        legal_consent_accepted: user.legal_consent_accepted,
        legal_consent_date: user.legal_consent_date,
        legal_consent_version: user.legal_consent_version,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
      return res.json(userResponse);
    }

    // Ensure we have a companyId to compare against
    if (!companyId) {
         console.error(`[GET /users/${userId}] No company ID context available for authorization`);
         return forbidden(res, "Company context required");
    }

    if (user.company_id !== companyId) {
      console.warn(`[GET /users/${userId}] Company mismatch. User: ${user.company_id}, Session: ${companyId}`);
      return forbidden(res, "Cannot view user from different company");
    }
    
    // Build explicit response (avoid Drizzle proxy issues)
    const userResponse = {
      id: user.id,
      company_id: user.company_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      language: user.language,
      timezone: user.timezone,
      theme: user.theme,
      is_active: user.is_active,
      legal_consent_accepted: user.legal_consent_accepted,
      legal_consent_date: user.legal_consent_date,
      legal_consent_version: user.legal_consent_version,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
    res.json(userResponse);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return serverError(res, "Failed to fetch user");
  }
});

// Update user
router.put("/:id", requireAuthWithFallback, async (req, res) => {
  try {
    const currentUserId = (req as any).session?.userId || (req as any).user?.userId;
    const userId = req.params.id;
    const companyId = (req as any).session?.companyId || (req as any).user?.companyId;
    
    // Allow users to update their own profile, or require owner role for updating others
    if (userId !== currentUserId) {
      const currentUser = await storage.getUserById(currentUserId);
      if (!currentUser || currentUser.role !== 'owner') {
        return forbidden(res, "Only owners can update other users");
      }
    }
    
    // Verify user exists and belongs to same company
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return notFound(res, "User not found");
    }
    
    if (existingUser.company_id !== companyId) {
      return forbidden(res, "Cannot update user from different company");
    }
    
    // If password is being updated, hash it first
    const updateData = { ...req.body };
    if (updateData.password_hash) {
      updateData.password_hash = await bcrypt.hash(updateData.password_hash, 10);
    }
    
    const updatedUser = await storage.updateUser(userId, updateData);
    if (!updatedUser) {
      return notFound(res, "User not found");
    }
    
    // Log the update
    await logUpdate({
      companyId,
      entityType: 'users',
      entityId: userId,
      oldData: sanitizeUser(existingUser),
      newData: sanitizeUser(updatedUser),
      actorId: (req as any).session.userId,
      actorName: (req as any).session.userName || 'Unknown',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string | undefined
    });
    
    // Build explicit response object
    const userResponse = {
      id: updatedUser.id,
      company_id: updatedUser.company_id,
      username: updatedUser.username,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      role: updatedUser.role,
      language: updatedUser.language,
      timezone: updatedUser.timezone,
      theme: updatedUser.theme,
      is_active: updatedUser.is_active,
      legal_consent_accepted: updatedUser.legal_consent_accepted,
      legal_consent_date: updatedUser.legal_consent_date,
      legal_consent_version: updatedUser.legal_consent_version,
      last_login_at: updatedUser.last_login_at,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
    };
    res.json(userResponse);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return serverError(res, "Failed to update user");
  }
});

// Delete user
router.delete("/:id", requireAuthWithFallback, async (req, res) => {
  try {
    const currentUserId = (req as any).session?.userId || (req as any).user?.userId;
    const companyId = (req as any).session?.companyId || (req as any).user?.companyId;
    
    // Only owner can delete users
    const user = await storage.getUserById(currentUserId);
    if (!user || user.role !== 'owner') {
      return forbidden(res, "Only owners can delete users");
    }
    
    const userId = req.params.id;
    
    // Verify user exists and belongs to same company
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return notFound(res, "User not found");
    }
    
    if (existingUser.company_id !== companyId) {
      return forbidden(res, "Cannot delete user from different company");
    }
    
    // Prevent deleting yourself
    if (userId === currentUserId) {
      return badRequest(res, "Cannot delete your own account");
    }
    
    // Soft delete by setting is_active to false
    const deletedUser = await storage.updateUser(userId, { is_active: false });
    
    // Log the deletion
    await logDelete({
      companyId,
      entityType: 'users',
      entityId: userId,
      deletedData: sanitizeUser(existingUser),
      actorId: (req as any).session.userId,
      actorName: (req as any).session.userName || 'Unknown',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string | undefined
    });
    
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return serverError(res, "Failed to delete user");
  }
});

export default router;
