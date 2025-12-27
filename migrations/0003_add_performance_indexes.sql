-- Migration: Add Performance Indexes for Query Optimization
-- Created: 2025-11-10
-- Purpose: Optimize queries by adding indexes on frequently filtered columns
-- Target: Support 100K users with efficient query performance

-- ============================================
-- CORE TABLE INDEXES (Verified columns)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_companies_firebase_user_id ON companies(firebase_user_id);

-- ============================================
-- SALES MODULE INDEXES (Verified columns)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sales_invoices_company_id ON sales_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_status ON sales_invoices(status);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_date ON sales_invoices(date);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_due_date ON sales_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_customer_id ON sales_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_company_status_date ON sales_invoices(company_id, status, date);

CREATE INDEX IF NOT EXISTS idx_sales_quotes_company_id ON sales_quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_quotes_status ON sales_quotes(status);
CREATE INDEX IF NOT EXISTS idx_sales_quotes_date ON sales_quotes(date);
CREATE INDEX IF NOT EXISTS idx_sales_quotes_customer_id ON sales_quotes(customer_id);

CREATE INDEX IF NOT EXISTS idx_sales_orders_company_id ON sales_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_date ON sales_orders(date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders(customer_id);

-- ============================================
-- PURCHASES MODULE INDEXES (Verified columns)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bills_company_id ON bills(company_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(date);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_supplier_id ON bills(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bills_company_status_date ON bills(company_id, status, date);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_company_id ON purchase_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(date);

CREATE INDEX IF NOT EXISTS idx_expenses_company_id ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- ============================================
-- BANKING MODULE INDEXES (Verified columns)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bank_accounts_company_id ON bank_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_currency ON bank_accounts(currency);

CREATE INDEX IF NOT EXISTS idx_payments_company_id ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
CREATE INDEX IF NOT EXISTS idx_payments_vendor_id ON payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payments_bank_account_id ON payments(bank_account_id);

CREATE INDEX IF NOT EXISTS idx_receipts_company_id ON receipts(company_id);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date);
CREATE INDEX IF NOT EXISTS idx_receipts_customer_id ON receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_receipts_bank_account_id ON receipts(bank_account_id);

-- ============================================
-- ACCOUNTING MODULE INDEXES (Verified columns)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_accounts_company_id ON accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_accounts_code ON accounts(code);
CREATE INDEX IF NOT EXISTS idx_accounts_account_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_parent_id ON accounts(parent_id);

CREATE INDEX IF NOT EXISTS idx_journals_company_id ON journals(company_id);
CREATE INDEX IF NOT EXISTS idx_journals_date ON journals(date);
CREATE INDEX IF NOT EXISTS idx_journals_company_date ON journals(company_id, date);

CREATE INDEX IF NOT EXISTS idx_journal_lines_journal_id ON journal_lines(journal_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account_id ON journal_lines(account_id);

-- ============================================
-- MASTER DATA INDEXES (Verified columns)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_company_type ON contacts(company_id, type);

CREATE INDEX IF NOT EXISTS idx_items_company_id ON items(company_id);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_sku ON items(sku);

CREATE INDEX IF NOT EXISTS idx_taxes_company_id ON taxes(company_id);

-- ============================================
-- DOCUMENT LINES INDEX (Verified)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_document_lines_document ON document_lines(document_type, document_id);
CREATE INDEX IF NOT EXISTS idx_document_lines_item_id ON document_lines(item_id);

-- ============================================
-- AUDIT & SECURITY INDEXES (Verified)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_resource_action ON role_permissions(resource, action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_lookup ON role_permissions(role, resource, action);

-- ============================================
-- ADDITIONAL TABLES (Verified)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_budgets_company_id ON budgets(company_id);

CREATE INDEX IF NOT EXISTS idx_fixed_assets_company_id ON fixed_assets(company_id);

CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE INDEX IF NOT EXISTS idx_warehouses_company_id ON warehouses(company_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_id ON stock_movements(warehouse_id);

-- ============================================
-- VERIFICATION QUERY
-- ============================================

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
