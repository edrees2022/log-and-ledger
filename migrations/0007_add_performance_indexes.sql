-- Migration: Add Performance Indexes for Large Scale Operations
-- Purpose: Optimize queries for millions of users/transactions

-- ==== JOURNALS & JOURNAL LINES ====
-- Index for date-range queries on journals (reports, archiving)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "journals_created_at_idx" 
  ON "journals" ("created_at");

-- Index for source lookups (finding journals by invoice/bill)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "journals_source_idx" 
  ON "journals" ("source_type", "source_id") 
  WHERE "source_type" IS NOT NULL;

-- Composite index for account balance queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "journal_lines_account_date_idx" 
  ON "journal_lines" ("account_id", "journal_id");

-- ==== PAYMENT ALLOCATIONS ====
-- Index for document lookups (find allocations for an invoice/bill)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "payment_allocations_document_idx" 
  ON "payment_allocations" ("document_type", "document_id");

-- Index for payment lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS "payment_allocations_payment_idx" 
  ON "payment_allocations" ("payment_type", "payment_id");

-- ==== STOCK MOVEMENTS ====
-- Index for inventory reports by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS "stock_movements_date_idx" 
  ON "stock_movements" ("transaction_date");

-- Composite index for item stock queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "stock_movements_item_warehouse_idx" 
  ON "stock_movements" ("item_id", "warehouse_id");

-- ==== AUDIT LOGS ====
-- Index for audit trail queries by entity
CREATE INDEX CONCURRENTLY IF NOT EXISTS "audit_logs_entity_idx" 
  ON "audit_logs" ("entity_type", "entity_id");

-- Index for audit timeline queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "audit_logs_timestamp_idx" 
  ON "audit_logs" ("timestamp" DESC);

-- Index for user activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS "audit_logs_actor_idx" 
  ON "audit_logs" ("actor_id", "timestamp" DESC) 
  WHERE "actor_id" IS NOT NULL;

-- ==== RECURRING TEMPLATES ====
-- Index for scheduling queries (find templates due to run)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "recurring_templates_next_run_idx" 
  ON "recurring_templates" ("next_run_date") 
  WHERE "is_active" = true;

-- ==== DOCUMENT SEQUENCES ====
-- Unique index to prevent duplicate sequences
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "document_sequences_unique_idx" 
  ON "document_sequences" ("company_id", "document_type", "fiscal_year");

-- ==== FISCAL PERIODS ====
-- Index for period lookup queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "fiscal_periods_company_year_idx" 
  ON "fiscal_periods" ("company_id", "fiscal_year");

-- Index for date overlap checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS "fiscal_periods_dates_idx" 
  ON "fiscal_periods" ("company_id", "start_date", "end_date");

-- ==== BUDGETS ====
-- Index for budget vs actual reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS "budgets_account_year_idx" 
  ON "budgets" ("company_id", "account_id", "fiscal_year");

-- ==== BANK STATEMENT LINES ====
-- Index for reconciliation queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "bank_statement_lines_account_date_idx" 
  ON "bank_statement_lines" ("bank_account_id", "date");

-- Index for unmatched lines
CREATE INDEX CONCURRENTLY IF NOT EXISTS "bank_statement_lines_unmatched_idx" 
  ON "bank_statement_lines" ("company_id", "matched") 
  WHERE "matched" = false;

-- ==== EXPENSES ====
-- Index for ESG carbon calculations
CREATE INDEX CONCURRENTLY IF NOT EXISTS "expenses_esg_idx" 
  ON "expenses" ("company_id", "date") 
  WHERE "carbon_factor" IS NOT NULL;

-- ==== PRODUCTION ORDERS ====
-- Index for manufacturing scheduling
CREATE INDEX CONCURRENTLY IF NOT EXISTS "production_orders_status_idx" 
  ON "production_orders" ("company_id", "status", "start_date");

-- ==== PAYROLL ====
-- Index for payslip queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "payslips_employee_idx" 
  ON "payslips" ("employee_id", "payroll_run_id");

-- ==== APPROVAL REQUESTS ====
-- Index for pending approvals dashboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS "approval_requests_pending_idx" 
  ON "approval_requests" ("company_id", "status", "created_at" DESC) 
  WHERE "status" = 'pending';

-- ==== AI FEEDBACK ====
-- Index for AI analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS "ai_feedback_analytics_idx" 
  ON "ai_feedback" ("company_id", "source", "accepted", "created_at");

-- ==== LANDED COST ====
-- Index for landed cost voucher queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "landed_cost_items_voucher_idx" 
  ON "landed_cost_items" ("voucher_id");

-- ==== CHECKS ====
-- Index for check status tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS "checks_status_date_idx" 
  ON "checks" ("company_id", "status", "date");

-- ==== Analyze tables after index creation ====
ANALYZE journals;
ANALYZE journal_lines;
ANALYZE payment_allocations;
ANALYZE stock_movements;
ANALYZE audit_logs;
ANALYZE recurring_templates;
ANALYZE document_sequences;
ANALYZE fiscal_periods;
ANALYZE budgets;
ANALYZE bank_statement_lines;
ANALYZE expenses;
ANALYZE production_orders;
ANALYZE payslips;
ANALYZE approval_requests;
ANALYZE ai_feedback;
ANALYZE landed_cost_items;
ANALYZE checks;
