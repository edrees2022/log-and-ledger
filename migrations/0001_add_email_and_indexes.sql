-- Migration: Add users.email and critical indexes
-- Generated: 2025-11-09
-- Priority: CRITICAL

-- 1. Add users.email column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='email'
    ) THEN
        ALTER TABLE users ADD COLUMN email TEXT;
        
        -- Backfill from username
        UPDATE users SET email = COALESCE(email, username) WHERE email IS NULL;
        
        -- Add NOT NULL constraint after backfill
        ALTER TABLE users ALTER COLUMN email SET NOT NULL;
        
        RAISE NOTICE 'Added users.email column and backfilled data';
    END IF;
END $$;

-- 2. Add indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 3. Add critical indexes for companies
CREATE INDEX IF NOT EXISTS idx_companies_firebase_user ON companies(firebase_user_id);
CREATE INDEX IF NOT EXISTS idx_companies_created ON companies(created_at DESC);

-- 4. Add indexes for journals (for reports performance)
CREATE INDEX IF NOT EXISTS idx_journals_company_date ON journals(company_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journals_source ON journals(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_journals_created ON journals(created_at DESC);

-- 5. Add indexes for journal_lines
CREATE INDEX IF NOT EXISTS idx_journal_lines_journal ON journal_lines(journal_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_lines(account_id);

-- 6. Add indexes for accounts
CREATE INDEX IF NOT EXISTS idx_accounts_company_code ON accounts(company_id, code);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type, account_subtype);
CREATE INDEX IF NOT EXISTS idx_accounts_parent ON accounts(parent_id) WHERE parent_id IS NOT NULL;

-- 7. Add indexes for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_company_type ON contacts(company_id, type);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email) WHERE email IS NOT NULL;

-- 8. Add indexes for items
CREATE INDEX IF NOT EXISTS idx_items_company_sku ON items(company_id, sku);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);

-- 9. Add indexes for sales documents
CREATE INDEX IF NOT EXISTS idx_sales_invoices_company_date ON sales_invoices(company_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_customer ON sales_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_status ON sales_invoices(status, date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_due ON sales_invoices(due_date) WHERE status IN ('draft', 'sent');

CREATE INDEX IF NOT EXISTS idx_sales_orders_company_date ON sales_orders(company_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);

-- 10. Add indexes for purchase documents
CREATE INDEX IF NOT EXISTS idx_bills_company_date ON bills(company_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_bills_supplier ON bills(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status, date DESC);
CREATE INDEX IF NOT EXISTS idx_bills_due ON bills(due_date) WHERE status IN ('draft', 'approved');

CREATE INDEX IF NOT EXISTS idx_purchase_orders_company_date ON purchase_orders(company_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);

-- 11. Add indexes for document_lines
CREATE INDEX IF NOT EXISTS idx_document_lines_document ON document_lines(document_type, document_id);
CREATE INDEX IF NOT EXISTS idx_document_lines_item ON document_lines(item_id) WHERE item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_document_lines_tax ON document_lines(tax_id) WHERE tax_id IS NOT NULL;

-- 12. Add indexes for payments and receipts
CREATE INDEX IF NOT EXISTS idx_payments_company_date ON payments(company_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_vendor ON payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status, date DESC);

CREATE INDEX IF NOT EXISTS idx_receipts_company_date ON receipts(company_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_customer ON receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status, date DESC);

-- 13. Add indexes for taxes
CREATE INDEX IF NOT EXISTS idx_taxes_company_active ON taxes(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_taxes_effective ON taxes(effective_from, effective_to);

-- 14. Add indexes for bank accounts and statements
CREATE INDEX IF NOT EXISTS idx_bank_accounts_company ON bank_accounts(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_bank_statement_lines_bank_date ON bank_statement_lines(bank_account_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_statement_lines_matched ON bank_statement_lines(matched) WHERE matched = false;

-- Performance Analysis
-- Run ANALYZE to update statistics for query planner
ANALYZE users;
ANALYZE companies;
ANALYZE journals;
ANALYZE journal_lines;
ANALYZE accounts;
ANALYZE sales_invoices;
ANALYZE bills;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully';
    RAISE NOTICE '✅ Added users.email column';
    RAISE NOTICE '✅ Created % indexes for optimal performance', (
        SELECT COUNT(*) FROM pg_indexes 
        WHERE indexname LIKE 'idx_%' 
        AND schemaname = 'public'
    );
END $$;
