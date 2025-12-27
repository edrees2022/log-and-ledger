import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SessionData {
  userRole?: string;
  userName?: string;
  username?: string;
  userId?: string;
  companyId?: string;
}

interface Permission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

/**
 * Hook to check user permissions
 * Returns permission checking functions based on current user's custom permissions
 */
export function usePermissions() {
  // Get current user info from session
  const { data: session } = useQuery<SessionData>({
    queryKey: ['/api/session'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const userRole = session?.userRole || 'viewer';
  const userName = session?.userName || session?.username || 'User';
  const userId = session?.userId;

  // Fetch user permissions from database
  const { data: userPermissions = [] } = useQuery<Permission[]>({
    queryKey: [`/api/users/${userId}/permissions`],
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  /**
   * Get permission for a specific module
   */
  const getModulePermission = (module: string): Permission | undefined => {
    return userPermissions.find(p => p.module === module);
  };

  /**
   * Check if user has permission for a specific action on a module
   * Now checks database permissions first, then falls back to role-based
   * @param module - Module name (e.g., 'sales', 'users', 'dashboard')
   * @param action - Action name: 'view', 'create', 'edit', 'delete'
   */
  const hasPermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    // Owner always has all permissions
    if (userRole === 'owner') return true;

    // Check custom permissions from database first
    const modulePermission = getModulePermission(module);
    if (modulePermission) {
      switch (action) {
        case 'view':
          return modulePermission.can_view;
        case 'create':
          return modulePermission.can_create;
        case 'edit':
          return modulePermission.can_edit;
        case 'delete':
          return modulePermission.can_delete;
        default:
          return false;
      }
    }

    // Fallback to role-based permissions (backward compatibility)
    // Admin has most permissions
    if (userRole === 'admin') {
      if (module === 'users' && action === 'delete') return false;
      if (module === 'accounts' && action === 'delete') return false;
      return true;
    }

    // Accountant permissions
    if (userRole === 'accountant') {
      if (['sales', 'purchases'].includes(module) && action === 'view') return true;
      if (['banking', 'accounts', 'reports'].includes(module)) return true;
      return false;
    }

    // Sales permissions
    if (userRole === 'sales') {
      if (module === 'sales') return true;
      if (module === 'contacts' && ['create', 'edit', 'view'].includes(action)) return true;
      if (module === 'items' && action === 'view') return true;
      return false;
    }

    // Viewer has read-only access
    if (userRole === 'viewer') {
      return action === 'view';
    }

    // Default: no permission
    return false;
  };

  /**
   * Legacy hasPermission function for backward compatibility
   * Maps old resource names to new module names and actions
   */
  const hasPermissionLegacy = (resource: string, action: string): boolean => {
    // Map old action names to new ones
    const actionMap: { [key: string]: 'view' | 'create' | 'edit' | 'delete' } = {
      'read': 'view',
      'create': 'create',
      'update': 'edit',
      'delete': 'delete',
    };

    const mappedAction = actionMap[action] || 'view';
    return hasPermission(resource, mappedAction);
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasRole = (...roles: string[]): boolean => {
    return roles.includes(userRole);
  };

  /**
   * Check if user can manage users
   */
  const canManageUsers = (): boolean => {
    return hasPermission('users', 'edit') || hasRole('owner', 'admin');
  };

  /**
   * Check if user can delete users
   */
  const canDeleteUsers = (): boolean => {
    return hasPermission('users', 'delete') || hasRole('owner');
  };

  /**
   * Check if user can manage settings
   */
  const canManageSettings = (): boolean => {
    return hasPermission('settings', 'edit') || hasRole('owner', 'admin');
  };

  /**
   * Check if user can create financial documents
   */
  const canCreateFinancialDocs = (): boolean => {
    return hasPermission('sales', 'create') || 
           hasPermission('purchases', 'create') ||
           hasRole('owner', 'admin', 'accountant', 'sales');
  };

  /**
   * Check if user can delete financial documents
   */
  const canDeleteFinancialDocs = (): boolean => {
    return hasPermission('sales', 'delete') || 
           hasPermission('purchases', 'delete') ||
           hasRole('owner', 'admin', 'accountant');
  };

  /**
   * Check if user can manage banking
   */
  const canManageBanking = (): boolean => {
    return hasPermission('banking', 'edit') || hasRole('owner', 'admin', 'accountant');
  };

  return {
    userRole,
    userName,
    userId,
    userPermissions,
    hasPermission,
    hasPermissionLegacy, // For backward compatibility
    getModulePermission,
    hasRole,
    canManageUsers,
    canDeleteUsers,
    canManageSettings,
    canCreateFinancialDocs,
    canDeleteFinancialDocs,
    canManageBanking,
  };
}
