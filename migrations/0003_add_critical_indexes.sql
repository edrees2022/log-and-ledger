-- Migration: Add Critical Missing Indexes
-- Date: 2025-11-10
-- Purpose: Add essential indexes that are missing in production

-- ================================
-- Add Missing Indexes
-- ================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_firebase_login ON users(email, company_id, is_active);

-- Companies table indexes
CREATE INDEX IF NOT EXISTS idx_companies_firebase_user ON companies(firebase_user_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- Accounts table indexes
CREATE INDEX IF NOT EXISTS idx_accounts_company ON accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_accounts_code ON accounts(company_id, code);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(company_id, type);

-- Journals table indexes
CREATE INDEX IF NOT EXISTS idx_journals_company ON journals(company_id);
CREATE INDEX IF NOT EXISTS idx_journals_date ON journals(company_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_journals_reference ON journals(company_id, reference_number);

-- Journal Lines table indexes
CREATE INDEX IF NOT EXISTS idx_journal_lines_journal ON journal_lines(journal_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_lines(account_id);

-- Sales Invoices table indexes
CREATE INDEX IF NOT EXISTS idx_sales_invoices_company ON sales_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_customer ON sales_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_date ON sales_invoices(company_id, invoice_date);

-- Bills table indexes
CREATE INDEX IF NOT EXISTS idx_bills_company ON bills(company_id);
CREATE INDEX IF NOT EXISTS idx_bills_vendor ON bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(company_id, bill_date);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_company ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(company_id, payment_date);

-- Receipts table indexes
CREATE INDEX IF NOT EXISTS idx_receipts_company ON receipts(company_id);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(company_id, receipt_date);

-- Document Lines table indexes
CREATE INDEX IF NOT EXISTS idx_document_lines_invoice ON document_lines(sales_invoice_id);
CREATE INDEX IF NOT EXISTS idx_document_lines_bill ON document_lines(bill_id);

-- ================================
-- Verify Migration
-- ================================

DO $$
DECLARE
  idx_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO idx_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';
  
  RAISE NOTICE '✅ Migration successful! Total indexes: %', idx_count;
END $$;
