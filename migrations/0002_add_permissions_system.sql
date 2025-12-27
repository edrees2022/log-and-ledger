-- Migration: Add Role-Based Permissions System
-- Created: 2025-11-10
-- Purpose: Enable granular access control for different user roles

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_permission UNIQUE(role, resource, action)
);

-- Create index for fast permission lookups
CREATE INDEX IF NOT EXISTS idx_role_permissions_lookup ON role_permissions(role, resource, action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);

-- Insert default permissions for each role
-- Owner: Full access to everything
INSERT INTO role_permissions (role, resource, action, allowed) VALUES
  ('owner', '*', '*', true)
ON CONFLICT (role, resource, action) DO NOTHING;

-- Admin: Almost everything except critical user management
INSERT INTO role_permissions (role, resource, action, allowed) VALUES
  ('admin', 'dashboard', 'view', true),
  ('admin', 'sales', 'view', true),
  ('admin', 'sales', 'create', true),
  ('admin', 'sales', 'update', true),
  ('admin', 'sales', 'delete', true),
  ('admin', 'purchases', 'view', true),
  ('admin', 'purchases', 'create', true),
  ('admin', 'purchases', 'update', true),
  ('admin', 'purchases', 'delete', true),
  ('admin', 'banking', 'view', true),
  ('admin', 'banking', 'create', true),
  ('admin', 'banking', 'update', true),
  ('admin', 'banking', 'delete', true),
  ('admin', 'reports', 'view', true),
  ('admin', 'reports', 'create', true),
  ('admin', 'settings', 'view', true),
  ('admin', 'settings', 'update', true),
  ('admin', 'users', 'view', true),
  ('admin', 'users', 'create', true),
  ('admin', 'users', 'update', true),
  ('admin', 'users', 'delete', false), -- Cannot delete users
  ('admin', 'contacts', 'view', true),
  ('admin', 'contacts', 'create', true),
  ('admin', 'contacts', 'update', true),
  ('admin', 'contacts', 'delete', true),
  ('admin', 'items', 'view', true),
  ('admin', 'items', 'create', true),
  ('admin', 'items', 'update', true),
  ('admin', 'items', 'delete', true),
  ('admin', 'accounts', 'view', true),
  ('admin', 'accounts', 'create', true),
  ('admin', 'accounts', 'update', true),
  ('admin', 'accounts', 'delete', false) -- Cannot delete accounts
ON CONFLICT (role, resource, action) DO NOTHING;

-- Accountant: Financial operations and reporting
INSERT INTO role_permissions (role, resource, action, allowed) VALUES
  ('accountant', 'dashboard', 'view', true),
  ('accountant', 'sales', 'view', true),
  ('accountant', 'sales', 'create', false),
  ('accountant', 'sales', 'update', false),
  ('accountant', 'purchases', 'view', true),
  ('accountant', 'purchases', 'create', false),
  ('accountant', 'purchases', 'update', false),
  ('accountant', 'banking', 'view', true),
  ('accountant', 'banking', 'create', true),
  ('accountant', 'banking', 'update', true),
  ('accountant', 'banking', 'delete', false),
  ('accountant', 'reports', 'view', true),
  ('accountant', 'reports', 'create', true),
  ('accountant', 'accounts', 'view', true),
  ('accountant', 'accounts', 'create', true),
  ('accountant', 'accounts', 'update', true),
  ('accountant', 'contacts', 'view', true),
  ('accountant', 'items', 'view', true)
ON CONFLICT (role, resource, action) DO NOTHING;

-- Sales: Sales operations and customer management
INSERT INTO role_permissions (role, resource, action, allowed) VALUES
  ('sales', 'dashboard', 'view', true),
  ('sales', 'sales', 'view', true),
  ('sales', 'sales', 'create', true),
  ('sales', 'sales', 'update', true),
  ('sales', 'sales', 'delete', false),
  ('sales', 'contacts', 'view', true),
  ('sales', 'contacts', 'create', true),
  ('sales', 'contacts', 'update', true),
  ('sales', 'contacts', 'delete', false),
  ('sales', 'items', 'view', true),
  ('sales', 'items', 'create', true),
  ('sales', 'items', 'update', true),
  ('sales', 'reports', 'view', true)
ON CONFLICT (role, resource, action) DO NOTHING;

-- Viewer: Read-only access
INSERT INTO role_permissions (role, resource, action, allowed) VALUES
  ('viewer', 'dashboard', 'view', true),
  ('viewer', 'sales', 'view', true),
  ('viewer', 'purchases', 'view', true),
  ('viewer', 'banking', 'view', true),
  ('viewer', 'reports', 'view', true),
  ('viewer', 'contacts', 'view', true),
  ('viewer', 'items', 'view', true),
  ('viewer', 'accounts', 'view', true)
ON CONFLICT (role, resource, action) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE role_permissions IS 'Stores granular permissions for each user role. Wildcard (*) means all resources/actions.';
COMMENT ON COLUMN role_permissions.role IS 'User role: owner, admin, accountant, sales, viewer';
COMMENT ON COLUMN role_permissions.resource IS 'Resource name (e.g., sales, purchases, users) or * for all';
COMMENT ON COLUMN role_permissions.action IS 'Action type (view, create, update, delete) or * for all';
COMMENT ON COLUMN role_permissions.allowed IS 'Whether this permission is granted (true) or explicitly denied (false)';
