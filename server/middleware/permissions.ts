import { db } from '../db';
import { sql, eq } from 'drizzle-orm';
import { user_permissions } from '@shared/schema';
import { forbidden, unauthorized } from '../utils/sendError';
import type { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../firebaseAdmin';

/**
 * Cache for permissions to avoid database queries on every request
 * Structure: Map<userId, Map<module:action, boolean>>
 */
const permissionsCache = new Map<string, Map<string, boolean>>();

/**
 * Check if a user has permission for a specific module and action
 */
export async function checkUserPermission(
  userId: string,
  userRole: string,
  module: string,
  action: 'view' | 'create' | 'edit' | 'delete'
): Promise<boolean> {
  // Owner always has full access
  if (userRole === 'owner') return true;

  // Check cache first
  const cacheKey = `${module}:${action}`;
  const userCache = permissionsCache.get(userId);
  if (userCache?.has(cacheKey)) {
    return userCache.get(cacheKey) || false;
  }

  try {
    // Query database for user-specific permissions
    const permissions = await db.query.user_permissions.findMany({
      where: eq(user_permissions.user_id, userId)
    });

    const modulePermission = permissions.find(p => p.module === module);
    
    let hasPermission = false;
    if (modulePermission) {
      switch (action) {
        case 'view':
          hasPermission = modulePermission.can_view;
          break;
        case 'create':
          hasPermission = modulePermission.can_create;
          break;
        case 'edit':
          hasPermission = modulePermission.can_edit;
          break;
        case 'delete':
          hasPermission = modulePermission.can_delete;
          break;
      }
    } else {
      // Fallback to role-based permissions
      hasPermission = checkRolePermission(userRole, module, action);
    }

    // Cache the result
    if (!permissionsCache.has(userId)) {
      permissionsCache.set(userId, new Map());
    }
    permissionsCache.get(userId)!.set(cacheKey, hasPermission);

    return hasPermission;
  } catch (error) {
    console.error('Error checking permission:', error);
    // Fallback to role-based
    return checkRolePermission(userRole, module, action);
  }
}

/**
 * Fallback role-based permission check (backward compatibility)
 */
function checkRolePermission(role: string, module: string, action: string): boolean {
  if (role === 'owner') return true;
  
  if (role === 'admin') {
    if (module === 'users' && action === 'delete') return false;
    if (module === 'accounts' && action === 'delete') return false;
    return true;
  }
  
  if (role === 'accountant') {
    if (['sales', 'purchases'].includes(module) && action === 'view') return true;
    if (['banking', 'accounts', 'reports'].includes(module)) return true;
    return false;
  }
  
  if (role === 'sales') {
    if (module === 'sales' && action === 'view') return true;
    if (module === 'contacts' && ['create', 'edit', 'view'].includes(action)) return true;
    if (module === 'items' && action === 'view') return true;
    return false;
  }
  
  if (role === 'viewer') {
    return action === 'view';
  }
  
  return false;
}

/**
 * Clear permissions cache (call after updating permissions)
 */
export function clearPermissionsCache(userId?: string) {
  if (userId) {
    permissionsCache.delete(userId);
  } else {
    permissionsCache.clear();
  }
}

/**
 * Middleware to require specific permission for a route
 * 
 * Usage:
 * app.delete('/api/users/:id', requireAuth, requirePermission('users', 'delete'), async (req, res) => {
 *   // Only users with 'users:delete' permission can access
 * });
 */
export function requirePermission(module: string, action: 'view' | 'create' | 'edit' | 'delete') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = (req as any).session;
      
      if (!session || !session.userId) {
        return forbidden(res, 'Authentication required');
      }

      const userId = session.userId;
      const userRole = session.userRole || 'viewer';

      // Check if user has permission
      const hasPermission = await checkUserPermission(userId, userRole, module, action);

      if (!hasPermission) {
        console.warn(`Permission denied: ${userRole} attempted ${action} on ${module}`, {
          userId: session.userId,
          role: userRole,
          module,
          action,
          ip: req.ip,
        });

        return forbidden(res, `Insufficient permissions: ${userRole} cannot ${action} ${module}`);
      }

      // Permission granted, proceed
      next();
    } catch (error) {
      console.error('Error in requirePermission middleware:', error);
      return forbidden(res, 'Permission check failed');
    }
  };
}

/**
 * Middleware to require any of multiple permissions (OR logic)
 * 
 * Usage:
 * app.get('/api/reports/sales', requireAuth, requireAnyPermission([
 *   { module: 'reports', action: 'view' },
 *   { module: 'sales', action: 'view' }
 * ]), async (req, res) => {
 *   // User needs either 'reports:view' OR 'sales:view'
 * });
 */
export function requireAnyPermission(permissions: Array<{ module: string; action: 'view' | 'create' | 'edit' | 'delete' }>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = (req as any).session;
      
      if (!session || !session.userId) {
        return forbidden(res, 'Authentication required');
      }

      const userId = session.userId;
      const userRole = session.userRole || 'viewer';

      // Check if user has any of the required permissions
      for (const perm of permissions) {
        const hasPermission = await checkUserPermission(userId, userRole, perm.module, perm.action);
        if (hasPermission) {
          // Permission granted, proceed
          return next();
        }
      }

      // No permission found
      console.warn(`Permission denied: ${userRole} attempted multiple permissions`, {
        userId: session.userId,
        role: userRole,
        permissions,
        ip: req.ip,
      });

      return forbidden(res, 'Insufficient permissions');
    } catch (error) {
      console.error('Error in requireAnyPermission middleware:', error);
      return forbidden(res, 'Permission check failed');
    }
  };
}

/**
 * Middleware to require all of multiple permissions (AND logic)
 */
export function requireAllPermissions(permissions: Array<{ module: string; action: 'view' | 'create' | 'edit' | 'delete' }>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = (req as any).session;
      
      if (!session || !session.userId) {
        return forbidden(res, 'Authentication required');
      }

      const userId = session.userId;
      const userRole = session.userRole || 'viewer';

      // Check if user has all of the specified permissions
      for (const perm of permissions) {
        const hasPermission = await checkUserPermission(userId, userRole, perm.module, perm.action);
        if (!hasPermission) {
          return forbidden(res, `Insufficient permissions: missing ${perm.module}:${perm.action}`);
        }
      }

      // User has all permissions
      next();
    } catch (error) {
      console.error('Error in requireAllPermissions middleware:', error);
      return forbidden(res, 'Permission check failed');
    }
  };
}

/**
 * Get all permissions for a specific role (for UI display)
 */
export async function getRolePermissions(role: string): Promise<Array<{
  resource: string;
  action: string;
  allowed: boolean;
}>> {
  try {
    const result = await db.execute(sql`
      SELECT resource, action, allowed 
      FROM role_permissions 
      WHERE role = ${role}
      ORDER BY resource, action
    `);

    return result.rows as Array<{ resource: string; action: string; allowed: boolean }>;
  } catch (error) {
    console.error('Error getting role permissions:', error);
    return [];
  }
}

/**
 * Middleware to require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).session || !(req as any).session.userId) {
    return forbidden(res, 'Authentication required');
  }
  next();
}

/**
 * Middleware to require specific role
 */
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).session?.userRole;
    if (!userRole || !roles.includes(userRole)) {
      return forbidden(res, 'Insufficient role permissions');
    }
    next();
  };
}

/**
 * Middleware to require Firebase authentication
 */
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
