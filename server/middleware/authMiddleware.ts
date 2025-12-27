import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { verifyFirebaseToken } from "../firebaseAdmin";
import { unauthorized, forbidden, serverError } from "../utils/sendError";
import { insertUserSchema } from "@shared/schema";

// Firebase Authentication middleware
export const requireFirebaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, "Authentication required");
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyFirebaseToken(token);
    
    // Add Firebase user to request
    (req as any).firebaseUser = {
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

// Unified authentication middleware - supports both Firebase tokens AND session
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Try Firebase token first (preferred method)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await verifyFirebaseToken(token);
      
      console.log(`✅ Firebase auth successful for ${decodedToken.email}`);
      
      // Add Firebase user to request
      (req as any).firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
      
      // Resolve user's active company using Firebase UID (owner link) or legacy mapping
      const userCompanies = await storage.getCompaniesByUserId(decodedToken.uid);
      console.log(`📦 Found ${userCompanies.length} companies for user ${decodedToken.email}`);

      // IMPORTANT: Session.userId should be our internal users.id, not Firebase UID
      // Try to find an existing user record by email FIRST
      let userRecord = decodedToken.email
        ? await storage.getUserByEmail(decodedToken.email)
        : undefined;

      // If user record exists, use THEIR company_id (they might have switched companies)
      if (userRecord) {
        const companyId = userRecord.company_id;
        
        // Populate the existing express-session object
        if (!(req as any).session) (req as any).session = {} as any;
        (req as any).session.userId = userRecord.id;
        (req as any).session.companyId = companyId;
        (req as any).session.userRole = userRecord.role || 'owner';
        console.log(`🏢 Set company context from user record: ${companyId}, userId: ${userRecord.id}, role: ${userRecord.role}`);
        return next();
      }

      // No user record - need to create one
      if (userCompanies.length > 0) {
        const companyId = userCompanies[0].id;

        // Auto-provision a lightweight profile for first-time users
        try {
          const base = (decodedToken.email?.split('@')[0]) || 'user';
          const fullName = decodedToken.name || decodedToken.displayName || base;
          let username = base;
          // Attempt a couple of times to avoid username collisions if helper exists
          try {
            const existing = await (storage as any).getUserByUsername?.(username);
            if (existing) username = `${base}${Math.floor(Math.random() * 10000)}`;
          } catch {}

          userRecord = await storage.createUser({
            company_id: companyId,
            username,
            email: decodedToken.email || `${decodedToken.uid}@autogen.local`,
            full_name: fullName,
            password: decodedToken.uid,
            role: 'owner',
            language: 'en',
            timezone: 'UTC',
            theme: 'auto',
            is_active: true,
          } as any);
          console.log(`👤 Auto-provisioned user ${userRecord.id} (${fullName}) for ${decodedToken.email}`);
          
          // Populate the session
          if (!(req as any).session) (req as any).session = {} as any;
          (req as any).session.userId = userRecord.id;
          (req as any).session.companyId = companyId;
          (req as any).session.userRole = userRecord.role || 'owner';
          console.log(`🏢 Set company context for new user: ${companyId}, userId: ${userRecord.id}`);
          return next();
        } catch (provisionErr) {
          console.error('❌ Auto-provision user failed:', provisionErr);
          return unauthorized(res, 'User not found');
        }
      } else {
        // User authenticated but has no company - they need to complete onboarding
        console.warn(`⚠️ No companies found for user ${decodedToken.email}`);
        return forbidden(res, "User authenticated but no company found. Please complete onboarding.", { needsOnboarding: true });
      }
    } catch (error) {
      console.error('❌ Firebase token verification failed:', error);
      return unauthorized(res, "Invalid authentication token");
    }
  }
  
  // Fallback to session-based auth (legacy)
  console.log('DEBUG: requireAuth session check:', {
    hasSession: !!(req as any).session,
    userId: (req as any).session?.userId,
    companyId: (req as any).session?.companyId
  });
  if ((req as any).session?.userId && (req as any).session?.companyId) {
    // console.log(`✅ Session auth successful for user ${req.session.userId}`);
    return next();
  }
  
  // No valid authentication found
  console.warn(`⚠️ Authentication failed for ${req.method} ${req.path}:`, {
    hasAuthHeader: !!authHeader,
    hasSession: !!(req as any).session,
    hasUserId: !!(req as any).session?.userId,
    hasCompanyId: !!(req as any).session?.companyId,
  });
  return unauthorized(res, "Authentication required");
};

// Simple role-based access control middleware
export const requireRole = (roles: Array<'owner' | 'admin' | 'accountant' | 'viewer'>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) return unauthorized(res, 'Authentication required');
      const user = await storage.getUserById(userId);
      if (!user) return unauthorized(res, 'User not found');
      if (!roles.includes(user.role as any)) {
        return forbidden(res, 'Insufficient permissions');
      }
      next();
    } catch (e) {
      console.error('RBAC error:', e);
      return serverError(res, 'Authorization error');
    }
  };
};
