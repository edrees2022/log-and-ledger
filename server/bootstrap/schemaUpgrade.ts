import { Pool } from '@neondatabase/serverless';
import pg from 'pg';

interface MigrationResult {
  success: boolean;
  applied: string[];
  errors: string[];
}

export async function ensureSchemaUpgrades(pool: Pool | pg.Pool): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    applied: [],
    errors: []
  };

  console.log('[Migration] Starting schema upgrades...');

  // 0. Ensure Companies table exists first (required by all other tables)
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        legal_name text,
        tax_number text,
        registration_number text,
        logo_url text,
        address jsonb,
        contacts jsonb,
        base_currency varchar(3) NOT NULL DEFAULT 'USD',
        fiscal_year_start integer NOT NULL DEFAULT 1,
        date_format text NOT NULL DEFAULT 'dd/MM/yyyy',
        number_format text NOT NULL DEFAULT '1,234.56',
        declaration_text text,
        firebase_user_id text,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('companies table (core)');
  } catch (e: any) {
    console.error(`[Migration] Failed to create companies: ${e.message}`);
    result.errors.push(`companies: ${e.message}`);
  }

  // 1. Ensure Users table exists (required by many tables)
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        username text NOT NULL UNIQUE,
        email text,
        password_hash text NOT NULL,
        full_name text NOT NULL,
        role text NOT NULL DEFAULT 'viewer',
        language text NOT NULL DEFAULT 'en',
        timezone text NOT NULL DEFAULT 'UTC',
        theme text NOT NULL DEFAULT 'auto',
        is_active boolean NOT NULL DEFAULT true,
        legal_consent_accepted boolean NOT NULL DEFAULT false,
        legal_consent_date timestamp,
        legal_consent_version text,
        last_login_at timestamp,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('users table (core)');
  } catch (e: any) {
    console.error(`[Migration] Failed to create users: ${e.message}`);
    result.errors.push(`users: ${e.message}`);
  }

  // Ensure users.email column exists (SSO fetch-user-by-email depends on it)
  try {
    const checkUsersTable = await pool.query(
      "SELECT 1 FROM information_schema.tables WHERE table_name='users' LIMIT 1"
    );
    const hasUsersTable = (checkUsersTable.rowCount || 0) > 0;
    
    if (hasUsersTable) {
      const checkEmailCol = await pool.query(
        "SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email' LIMIT 1"
      );
      const hasEmailCol = (checkEmailCol.rowCount || 0) > 0;
      
      if (!hasEmailCol) {
        console.log('[Migration] Adding users.email column...');
        
        // Add column as nullable first
        await pool.query("ALTER TABLE users ADD COLUMN email text");
        
        // Backfill: default email from username
        await pool.query(
          "UPDATE users SET email = CASE WHEN position('@' in username) > 1 THEN username ELSE username END WHERE email IS NULL"
        );
        
        // Create indexes
        await pool.query("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
        await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users(email) WHERE email IS NOT NULL");
        
        result.applied.push('users.email column with indexes');
        console.log('[Migration] ✅ users.email column added successfully');
      } else {
        console.log('[Migration] ✓ users.email column already exists');
      }
    } else {
      console.warn('[Migration] ⚠️  users table not found - skipping email migration');
    }
  } catch (error: any) {
    const errMsg = `Failed to add users.email: ${error.message} (code: ${error.code})`;
    console.error(`[Migration] ❌ ${errMsg}`);
    result.errors.push(errMsg);
    result.success = false;
    
    // In production, this is critical - re-throw
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`CRITICAL: ${errMsg}`);
    }
  }

  // Add document_lines.tax_id if missing
  try {
    const checkCol = await pool.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name='document_lines' AND column_name='tax_id' LIMIT 1"
    );
    const hasTaxId = (checkCol.rowCount || 0) > 0;
    
    if (!hasTaxId) {
      console.log('[Migration] Adding document_lines.tax_id column...');
      
      await pool.query("ALTER TABLE document_lines ADD COLUMN tax_id varchar");
      
      try { 
        await pool.query("ALTER TABLE document_lines ADD CONSTRAINT document_lines_tax_id_fkey FOREIGN KEY (tax_id) REFERENCES taxes(id)");
      } catch (e) {
        console.warn('[Migration] FK constraint already exists or failed - continuing');
      }
      
      await pool.query("CREATE INDEX IF NOT EXISTS idx_document_lines_tax_id ON document_lines(tax_id)");
      
      // Backfill from items.default_tax_id
      const backfillResult = await pool.query(
        `UPDATE document_lines dl
         SET tax_id = i.default_tax_id
         FROM items i
         WHERE dl.item_id = i.id AND dl.tax_id IS NULL`
      );
      
      result.applied.push(`document_lines.tax_id (backfilled ${backfillResult.rowCount || 0} rows)`);
      console.log(`[Migration] ✅ document_lines.tax_id added and backfilled`);
    } else {
      console.log('[Migration] ✓ document_lines.tax_id already exists');
    }
  } catch (error: any) {
    const errMsg = `Failed to add document_lines.tax_id: ${error.message}`;
    console.error(`[Migration] ❌ ${errMsg}`);
    result.errors.push(errMsg);
    // Non-critical, continue
  }

  // Create ai_providers table if missing
  try {
    const checkTable = await pool.query(
      "SELECT 1 FROM information_schema.tables WHERE table_name='ai_providers' LIMIT 1"
    );
    const hasTable = (checkTable.rowCount || 0) > 0;
    
    if (!hasTable) {
      console.log('[Migration] Creating ai_providers table...');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ai_providers (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id varchar REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
          provider varchar(64) NOT NULL,
          label varchar(128),
          base_url text,
          api_key text,
          organization varchar(128),
          default_model varchar(256),
          embeddings_model varchar(256),
          vision_model varchar(256),
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      await pool.query("CREATE INDEX IF NOT EXISTS idx_ai_providers_company ON ai_providers(company_id)");
      await pool.query("CREATE INDEX IF NOT EXISTS idx_ai_providers_provider ON ai_providers(provider)");
      
      result.applied.push('ai_providers table');
      console.log('[Migration] ✅ ai_providers table created');
    } else {
      console.log('[Migration] ✓ ai_providers table already exists');
    }
  } catch (error: any) {
    const errMsg = `Failed to create ai_providers table: ${error.message}`;
    console.error(`[Migration] ❌ ${errMsg}`);
    result.errors.push(errMsg);
    // Non-critical for core functionality
  }

  // Create ai_feedback table if missing
  try {
    const checkTable = await pool.query(
      "SELECT 1 FROM information_schema.tables WHERE table_name='ai_feedback' LIMIT 1"
    );
    const hasTable = (checkTable.rowCount || 0) > 0;
    
    if (!hasTable) {
      console.log('[Migration] Creating ai_feedback table...');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ai_feedback (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id varchar REFERENCES companies(id) ON DELETE CASCADE,
          user_id varchar REFERENCES users(id),
          source text,
          transaction_id varchar,
          accepted boolean NOT NULL,
          category text,
          confidence numeric(10,6),
          suggested_accounts jsonb,
          notes text,
          description text,
          amount numeric(15,2),
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      await pool.query("CREATE INDEX IF NOT EXISTS idx_ai_feedback_company_created ON ai_feedback(company_id, created_at)");
      
      result.applied.push('ai_feedback table');
      console.log('[Migration] ✅ ai_feedback table created');
    } else {
      console.log('[Migration] ✓ ai_feedback table already exists');
    }
  } catch (error: any) {
    const errMsg = `Failed to create ai_feedback table: ${error.message}`;
    console.error(`[Migration] ❌ ${errMsg}`);
    result.errors.push(errMsg);
  }

  // Create legal_consent_logs table if missing (for audit trail)
  try {
    const checkTable = await pool.query(
      "SELECT 1 FROM information_schema.tables WHERE table_name='legal_consent_logs' LIMIT 1"
    );
    const hasTable = (checkTable.rowCount || 0) > 0;
    
    if (!hasTable) {
      console.log('[Migration] Creating legal_consent_logs table...');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS legal_consent_logs (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          consent_version text NOT NULL,
          terms_accepted boolean NOT NULL DEFAULT true,
          privacy_accepted boolean NOT NULL DEFAULT true,
          disclaimer_accepted boolean NOT NULL DEFAULT true,
          ip_address text,
          user_agent text,
          accepted_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      await pool.query("CREATE INDEX IF NOT EXISTS legal_consent_logs_user_id_idx ON legal_consent_logs(user_id)");
      await pool.query("CREATE INDEX IF NOT EXISTS legal_consent_logs_company_id_idx ON legal_consent_logs(company_id)");
      await pool.query("CREATE INDEX IF NOT EXISTS legal_consent_logs_accepted_at_idx ON legal_consent_logs(accepted_at)");
      
      result.applied.push('legal_consent_logs table');
      console.log('[Migration] ✅ legal_consent_logs table created');
    } else {
      console.log('[Migration] ✓ legal_consent_logs table already exists');
    }
  } catch (error: any) {
    const errMsg = `Failed to create legal_consent_logs table: ${error.message}`;
    console.error(`[Migration] ❌ ${errMsg}`);
    result.errors.push(errMsg);
    // Non-critical - consent can still be stored in users table
  }

  // Create user_permissions table if missing (for granular access control)
  try {
    const checkTable = await pool.query(
      "SELECT 1 FROM information_schema.tables WHERE table_name='user_permissions' LIMIT 1"
    );
    const hasTable = (checkTable.rowCount || 0) > 0;
    
    if (!hasTable) {
      console.log('[Migration] Creating user_permissions table...');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_permissions (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          resource varchar(100) NOT NULL,
          action varchar(50) NOT NULL,
          allowed boolean DEFAULT true,
          created_at timestamp DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_user_permission UNIQUE(user_id, resource, action)
        );
      `);
      
      await pool.query("CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id)");
      await pool.query("CREATE INDEX IF NOT EXISTS idx_user_permissions_lookup ON user_permissions(user_id, resource, action)");
      
      result.applied.push('user_permissions table');
      console.log('[Migration] ✅ user_permissions table created');
    } else {
      console.log('[Migration] ✓ user_permissions table already exists');
    }
  } catch (error: any) {
    const errMsg = `Failed to create user_permissions table: ${error.message}`;
    console.error(`[Migration] ❌ ${errMsg}`);
    result.errors.push(errMsg);
  }

  // === URGENT: Add missing tables for new features ===

  // 1. Items tracking_type
  try {
    const checkCol = await pool.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name='items' AND column_name='tracking_type' LIMIT 1"
    );
    if ((checkCol.rowCount || 0) === 0) {
      console.log('[Migration] Adding items.tracking_type column...');
      await pool.query("ALTER TABLE items ADD COLUMN tracking_type text NOT NULL DEFAULT 'none'");
      result.applied.push('items.tracking_type');
    }
  } catch (e: any) {
    console.error(`[Migration] Failed to add items.tracking_type: ${e.message}`);
    result.errors.push(`items.tracking_type: ${e.message}`);
  }

  // 2. Cost Centers
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cost_centers (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code text NOT NULL,
        name text NOT NULL,
        parent_id varchar,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('cost_centers table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create cost_centers: ${e.message}`);
    result.errors.push(`cost_centers: ${e.message}`);
  }

  // 3. Checks
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS checks (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        type text NOT NULL,
        check_number text NOT NULL,
        bank_name text,
        amount numeric(15,2) NOT NULL,
        currency varchar(3) NOT NULL DEFAULT 'USD',
        issue_date timestamp NOT NULL,
        due_date timestamp NOT NULL,
        contact_id varchar REFERENCES contacts(id),
        status text NOT NULL DEFAULT 'on_hand',
        description text,
        image_url text,
        bank_account_id varchar REFERENCES bank_accounts(id),
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('checks table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create checks: ${e.message}`);
    result.errors.push(`checks: ${e.message}`);
  }

  // 4. Departments
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name text NOT NULL,
        manager_id varchar,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('departments table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create departments: ${e.message}`);
    result.errors.push(`departments: ${e.message}`);
  }

  // 5. Employees
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        first_name text NOT NULL,
        last_name text NOT NULL,
        email text,
        phone text,
        department_id varchar REFERENCES departments(id),
        job_title text,
        hire_date timestamp NOT NULL,
        salary numeric(15,2) NOT NULL DEFAULT 0,
        status text NOT NULL DEFAULT 'active',
        user_id varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('employees table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create employees: ${e.message}`);
    result.errors.push(`employees: ${e.message}`);
  }

  // 6. Payroll Runs
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payroll_runs (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        period_start timestamp NOT NULL,
        period_end timestamp NOT NULL,
        payment_date timestamp NOT NULL,
        status text NOT NULL DEFAULT 'draft',
        total_amount numeric(15,2) NOT NULL DEFAULT 0,
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('payroll_runs table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create payroll_runs: ${e.message}`);
    result.errors.push(`payroll_runs: ${e.message}`);
  }

  // 7. Payslips
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payslips (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        payroll_run_id varchar NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
        employee_id varchar NOT NULL REFERENCES employees(id),
        basic_salary numeric(15,2) NOT NULL,
        allowances numeric(15,2) NOT NULL DEFAULT 0,
        deductions numeric(15,2) NOT NULL DEFAULT 0,
        net_salary numeric(15,2) NOT NULL,
        details jsonb,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('payslips table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create payslips: ${e.message}`);
    result.errors.push(`payslips: ${e.message}`);
  }

  // 8. Manufacturing BOMs
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manufacturing_boms (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        item_id varchar NOT NULL REFERENCES items(id),
        name text NOT NULL,
        version text NOT NULL DEFAULT '1.0',
        is_active boolean NOT NULL DEFAULT true,
        labor_cost numeric(15,2) DEFAULT 0,
        overhead_cost numeric(15,2) DEFAULT 0,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('manufacturing_boms table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create manufacturing_boms: ${e.message}`);
    result.errors.push(`manufacturing_boms: ${e.message}`);
  }

  // 9. Manufacturing BOM Items
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manufacturing_bom_items (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        bom_id varchar NOT NULL REFERENCES manufacturing_boms(id) ON DELETE CASCADE,
        item_id varchar NOT NULL REFERENCES items(id),
        quantity numeric(15,4) NOT NULL,
        wastage_percent numeric(5,2) DEFAULT 0
      );
    `);
    result.applied.push('manufacturing_bom_items table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create manufacturing_bom_items: ${e.message}`);
    result.errors.push(`manufacturing_bom_items: ${e.message}`);
  }

  // 10. Production Orders
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS production_orders (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        order_number text NOT NULL,
        bom_id varchar REFERENCES manufacturing_boms(id),
        item_id varchar NOT NULL REFERENCES items(id),
        quantity numeric(15,4) NOT NULL,
        start_date timestamp NOT NULL,
        due_date timestamp,
        status text NOT NULL DEFAULT 'planned',
        warehouse_id varchar REFERENCES warehouses(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('production_orders table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create production_orders: ${e.message}`);
    result.errors.push(`production_orders: ${e.message}`);
  }

  // 11. Inventory Batches
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_batches (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        item_id varchar NOT NULL REFERENCES items(id),
        batch_number text NOT NULL,
        expiry_date timestamp,
        quantity numeric(15,4) NOT NULL DEFAULT 0,
        warehouse_id varchar REFERENCES warehouses(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('inventory_batches table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create inventory_batches: ${e.message}`);
    result.errors.push(`inventory_batches: ${e.message}`);
  }

  // 12. Inventory Serials
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_serials (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        item_id varchar NOT NULL REFERENCES items(id),
        serial_number text NOT NULL,
        status text NOT NULL DEFAULT 'available',
        warehouse_id varchar REFERENCES warehouses(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('inventory_serials table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create inventory_serials: ${e.message}`);
    result.errors.push(`inventory_serials: ${e.message}`);
  }

  // 13. Approval Workflows
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS approval_workflows (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        entity_type text NOT NULL,
        trigger_amount numeric(15,2) NOT NULL DEFAULT 0,
        approver_role text NOT NULL DEFAULT 'admin',
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('approval_workflows table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create approval_workflows: ${e.message}`);
    result.errors.push(`approval_workflows: ${e.message}`);
  }

  // 14. Approval Requests
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS approval_requests (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        workflow_id varchar REFERENCES approval_workflows(id),
        entity_type text NOT NULL,
        entity_id varchar NOT NULL,
        requester_id varchar REFERENCES users(id),
        status text NOT NULL DEFAULT 'pending',
        approver_id varchar REFERENCES users(id),
        comments text,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('approval_requests table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create approval_requests: ${e.message}`);
    result.errors.push(`approval_requests: ${e.message}`);
  }

  // 15. Payments reconciliation_id
  try {
    const checkCol = await pool.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='reconciliation_id' LIMIT 1"
    );
    if ((checkCol.rowCount || 0) === 0) {
      console.log('[Migration] Adding payments.reconciliation_id column...');
      await pool.query("ALTER TABLE payments ADD COLUMN reconciliation_id varchar");
      result.applied.push('payments.reconciliation_id');
    }
  } catch (e: any) {
    console.error(`[Migration] Failed to add payments.reconciliation_id: ${e.message}`);
    result.errors.push(`payments.reconciliation_id: ${e.message}`);
  }

  // 16. Receipts reconciliation_id
  try {
    const checkCol = await pool.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name='receipts' AND column_name='reconciliation_id' LIMIT 1"
    );
    if ((checkCol.rowCount || 0) === 0) {
      console.log('[Migration] Adding receipts.reconciliation_id column...');
      await pool.query("ALTER TABLE receipts ADD COLUMN reconciliation_id varchar");
      result.applied.push('receipts.reconciliation_id');
    }
  } catch (e: any) {
    console.error(`[Migration] Failed to add receipts.reconciliation_id: ${e.message}`);
    result.errors.push(`receipts.reconciliation_id: ${e.message}`);
  }

  // 17. Currencies (already created companies and users above)
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS currencies (
        code varchar(3) PRIMARY KEY,
        name text NOT NULL,
        symbol text NOT NULL,
        is_active boolean NOT NULL DEFAULT true
      );
    `);
    // Seed default currencies
    await pool.query(`
      INSERT INTO currencies (code, name, symbol) VALUES 
      ('USD', 'US Dollar', '$'),
      ('EUR', 'Euro', '€'),
      ('GBP', 'British Pound', '£'),
      ('SAR', 'Saudi Riyal', '﷼'),
      ('AED', 'UAE Dirham', 'د.إ')
      ON CONFLICT (code) DO NOTHING;
    `);
    result.applied.push('currencies table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create currencies: ${e.message}`);
    result.errors.push(`currencies: ${e.message}`);
  }

  // 19. Accounts (Chart of Accounts)
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code text NOT NULL,
        name text NOT NULL,
        account_type text NOT NULL,
        account_subtype text NOT NULL,
        parent_id varchar,
        is_system boolean NOT NULL DEFAULT false,
        is_active boolean NOT NULL DEFAULT true,
        description text,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('accounts table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create accounts: ${e.message}`);
    result.errors.push(`accounts: ${e.message}`);
  }

  // 20. Taxes
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS taxes (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code text NOT NULL,
        name text NOT NULL,
        rate numeric(10,4) NOT NULL,
        tax_type text NOT NULL,
        calculation_type text NOT NULL,
        liability_account_id varchar REFERENCES accounts(id),
        jurisdiction text,
        threshold_amount numeric(15,2),
        threshold_period text,
        threshold_applies_to text,
        effective_from timestamp NOT NULL,
        effective_to timestamp,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('taxes table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create taxes: ${e.message}`);
    result.errors.push(`taxes: ${e.message}`);
  }

  // 21. Items
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        type text NOT NULL,
        sku text NOT NULL,
        name text NOT NULL,
        description text,
        unit_of_measure text NOT NULL DEFAULT 'pcs',
        sales_price numeric(15,2),
        cost_price numeric(15,2),
        stock_quantity numeric(15,4) NOT NULL DEFAULT 0,
        reorder_level numeric(15,4) DEFAULT 0,
        sales_account_id varchar REFERENCES accounts(id),
        cost_account_id varchar REFERENCES accounts(id),
        inventory_account_id varchar REFERENCES accounts(id),
        default_tax_id varchar REFERENCES taxes(id),
        is_active boolean NOT NULL DEFAULT true,
        tracking_type text NOT NULL DEFAULT 'none',
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('items table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create items: ${e.message}`);
    result.errors.push(`items: ${e.message}`);
  }

  // 22. Exchange Rates
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        from_currency varchar(3) NOT NULL REFERENCES currencies(code),
        to_currency varchar(3) NOT NULL REFERENCES currencies(code),
        rate numeric(15,6) NOT NULL,
        date timestamp NOT NULL,
        source text,
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('exchange_rates table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create exchange_rates: ${e.message}`);
    result.errors.push(`exchange_rates: ${e.message}`);
  }

  // 23. Warehouses
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS warehouses (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code text NOT NULL,
        name text NOT NULL,
        address jsonb,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('warehouses table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create warehouses: ${e.message}`);
    result.errors.push(`warehouses: ${e.message}`);
  }

  // 24. Contacts
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        type text NOT NULL,
        code text,
        name text NOT NULL,
        display_name text,
        email text,
        phone text,
        website text,
        tax_number text,
        registration_number text,
        billing_address jsonb,
        shipping_address jsonb,
        currency varchar(3) NOT NULL DEFAULT 'USD',
        payment_terms_days integer NOT NULL DEFAULT 30,
        credit_limit numeric(15,2),
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('contacts table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create contacts: ${e.message}`);
    result.errors.push(`contacts: ${e.message}`);
  }

  // 25. Projects
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code text NOT NULL,
        name text NOT NULL,
        description text,
        budget numeric(15,2),
        start_date timestamp,
        end_date timestamp,
        status text NOT NULL DEFAULT 'active',
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('projects table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create projects: ${e.message}`);
    result.errors.push(`projects: ${e.message}`);
  }

  // 26. Bank Accounts
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        account_id varchar NOT NULL REFERENCES accounts(id),
        name text NOT NULL,
        bank_name text,
        account_number text,
        currency varchar(3) NOT NULL DEFAULT 'USD',
        opening_balance numeric(15,2) NOT NULL DEFAULT 0,
        opening_balance_date timestamp NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('bank_accounts table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create bank_accounts: ${e.message}`);
    result.errors.push(`bank_accounts: ${e.message}`);
  }

  // 27. Bank Reconciliations
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bank_reconciliations (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        bank_account_id varchar NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
        reconciliation_date timestamp NOT NULL,
        statement_balance numeric(15,2) NOT NULL,
        book_balance numeric(15,2) NOT NULL,
        difference numeric(15,2) NOT NULL DEFAULT 0,
        status text NOT NULL DEFAULT 'in_progress',
        notes text,
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('bank_reconciliations table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create bank_reconciliations: ${e.message}`);
    result.errors.push(`bank_reconciliations: ${e.message}`);
  }

  // 28. Journals
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS journals (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        journal_number text NOT NULL,
        date timestamp NOT NULL,
        description text,
        reference text,
        source_type text,
        source_id varchar,
        total_amount numeric(15,2) NOT NULL,
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('journals table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create journals: ${e.message}`);
    result.errors.push(`journals: ${e.message}`);
  }

  // 29. Sales Quotes
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales_quotes (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        quote_number text NOT NULL,
        customer_id varchar NOT NULL REFERENCES contacts(id),
        date timestamp NOT NULL,
        valid_until timestamp,
        status text NOT NULL DEFAULT 'draft',
        currency varchar(3) NOT NULL,
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        subtotal numeric(15,2) NOT NULL DEFAULT 0,
        tax_total numeric(15,2) NOT NULL DEFAULT 0,
        total numeric(15,2) NOT NULL DEFAULT 0,
        notes text,
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('sales_quotes table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create sales_quotes: ${e.message}`);
    result.errors.push(`sales_quotes: ${e.message}`);
  }

  // 30. Sales Orders
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales_orders (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        order_number text NOT NULL,
        quote_id varchar REFERENCES sales_quotes(id),
        customer_id varchar NOT NULL REFERENCES contacts(id),
        date timestamp NOT NULL,
        delivery_date timestamp,
        status text NOT NULL DEFAULT 'pending',
        currency varchar(3) NOT NULL,
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        subtotal numeric(15,2) NOT NULL DEFAULT 0,
        tax_total numeric(15,2) NOT NULL DEFAULT 0,
        total numeric(15,2) NOT NULL DEFAULT 0,
        notes text,
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('sales_orders table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create sales_orders: ${e.message}`);
    result.errors.push(`sales_orders: ${e.message}`);
  }

  // 31. Sales Invoices
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales_invoices (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        invoice_number text NOT NULL,
        order_id varchar REFERENCES sales_orders(id),
        customer_id varchar NOT NULL REFERENCES contacts(id),
        date timestamp NOT NULL,
        due_date timestamp NOT NULL,
        status text NOT NULL DEFAULT 'draft',
        currency varchar(3) NOT NULL,
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        subtotal numeric(15,2) NOT NULL DEFAULT 0,
        tax_total numeric(15,2) NOT NULL DEFAULT 0,
        total numeric(15,2) NOT NULL DEFAULT 0,
        paid_amount numeric(15,2) NOT NULL DEFAULT 0,
        notes text,
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('sales_invoices table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create sales_invoices: ${e.message}`);
    result.errors.push(`sales_invoices: ${e.message}`);
  }

  // 32. Document Lines (for quotes, orders, invoices, bills)
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS document_lines (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        document_type text NOT NULL,
        document_id varchar NOT NULL,
        item_id varchar REFERENCES items(id),
        tax_id varchar REFERENCES taxes(id),
        description text NOT NULL,
        quantity numeric(15,4) NOT NULL,
        unit_price numeric(15,2) NOT NULL,
        discount_percentage numeric(5,2) NOT NULL DEFAULT 0,
        line_total numeric(15,2) NOT NULL,
        tax_amount numeric(15,2) NOT NULL DEFAULT 0,
        line_number integer NOT NULL,
        project_id varchar REFERENCES projects(id)
      );
    `);
    result.applied.push('document_lines table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create document_lines: ${e.message}`);
    result.errors.push(`document_lines: ${e.message}`);
  }

  // 33. Bills
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        bill_number text NOT NULL,
        supplier_reference text,
        po_id varchar REFERENCES purchase_orders(id),
        supplier_id varchar NOT NULL REFERENCES contacts(id),
        date timestamp NOT NULL,
        due_date timestamp NOT NULL,
        status text NOT NULL DEFAULT 'draft',
        currency varchar(3) NOT NULL,
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        subtotal numeric(15,2) NOT NULL DEFAULT 0,
        tax_total numeric(15,2) NOT NULL DEFAULT 0,
        total numeric(15,2) NOT NULL DEFAULT 0,
        paid_amount numeric(15,2) NOT NULL DEFAULT 0,
        notes text,
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('bills table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create bills: ${e.message}`);
    result.errors.push(`bills: ${e.message}`);
  }

  // 34. Expenses
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        expense_number text NOT NULL,
        payee text NOT NULL,
        date timestamp NOT NULL,
        amount numeric(15,2) NOT NULL,
        tax_amount numeric(15,2) NOT NULL DEFAULT 0,
        category text,
        description text,
        paid_from_account_id varchar REFERENCES bank_accounts(id),
        expense_account_id varchar REFERENCES accounts(id),
        project_id varchar REFERENCES projects(id),
        status text NOT NULL DEFAULT 'pending',
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('expenses table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create expenses: ${e.message}`);
    result.errors.push(`expenses: ${e.message}`);
  }

  // 35. Purchase Orders
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        po_number text NOT NULL,
        supplier_id varchar NOT NULL REFERENCES contacts(id),
        date timestamp NOT NULL,
        delivery_date timestamp,
        status text NOT NULL DEFAULT 'pending',
        currency varchar(3) NOT NULL,
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        subtotal numeric(15,2) NOT NULL DEFAULT 0,
        tax_total numeric(15,2) NOT NULL DEFAULT 0,
        total numeric(15,2) NOT NULL DEFAULT 0,
        notes text,
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('purchase_orders table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create purchase_orders: ${e.message}`);
    result.errors.push(`purchase_orders: ${e.message}`);
  }

  // 36. Payments
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        payment_number text NOT NULL,
        vendor_id varchar NOT NULL REFERENCES contacts(id),
        vendor_name text NOT NULL,
        date timestamp NOT NULL,
        amount numeric(15,2) NOT NULL,
        payment_method text NOT NULL,
        reference text,
        description text,
        bank_account_id varchar REFERENCES bank_accounts(id),
        status text NOT NULL DEFAULT 'pending',
        currency varchar(3) NOT NULL DEFAULT 'USD',
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        reconciled boolean NOT NULL DEFAULT false,
        reconciliation_id varchar REFERENCES bank_reconciliations(id),
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('payments table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create payments: ${e.message}`);
    result.errors.push(`payments: ${e.message}`);
  }

  // 37. Receipts
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS receipts (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        receipt_number text NOT NULL,
        customer_id varchar NOT NULL REFERENCES contacts(id),
        customer_name text NOT NULL,
        date timestamp NOT NULL,
        amount numeric(15,2) NOT NULL,
        payment_method text NOT NULL,
        reference text,
        description text,
        bank_account_id varchar REFERENCES bank_accounts(id),
        status text NOT NULL DEFAULT 'received',
        currency varchar(3) NOT NULL DEFAULT 'USD',
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        reconciled boolean NOT NULL DEFAULT false,
        reconciliation_id varchar REFERENCES bank_reconciliations(id),
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push('receipts table');
  } catch (e: any) {
    console.error(`[Migration] Failed to create receipts: ${e.message}`);
    result.errors.push(`receipts: ${e.message}`);
  }

  // Summary
  console.log(`[Migration] Completed: ${result.applied.length} upgrades applied, ${result.errors.length} errors`);
  if (result.applied.length > 0) {
    console.log('[Migration] Applied:', result.applied.join(', '));
  }
  if (result.errors.length > 0) {
    console.error('[Migration] Errors:', result.errors.join('; '));
  }

  return result;
}
