-- ==========================================
-- FIX BANKING SCHEMA (Run in Neon Console)
-- ==========================================

-- 1. Create Bank Reconciliations Table
CREATE TABLE IF NOT EXISTS "bank_reconciliations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
	"bank_account_id" varchar NOT NULL REFERENCES "bank_accounts"("id") ON DELETE cascade,
	"reconciliation_date" timestamp NOT NULL,
	"statement_balance" numeric(15, 2) NOT NULL,
	"book_balance" numeric(15, 2) NOT NULL,
	"difference" numeric(15, 2) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"notes" text,
	"created_by" varchar REFERENCES "users"("id"),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Create Bank Reconciliation Items Table
CREATE TABLE IF NOT EXISTS "bank_reconciliation_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reconciliation_id" varchar NOT NULL REFERENCES "bank_reconciliations"("id") ON DELETE cascade,
	"transaction_type" text NOT NULL,
	"transaction_id" varchar,
	"amount" numeric(15, 2) NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"description" text,
	"cleared" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Add columns to Payments
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "reconciled" boolean DEFAULT false NOT NULL;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "reconciliation_id" varchar REFERENCES "bank_reconciliations"("id");

-- 4. Add columns to Receipts
ALTER TABLE "receipts" ADD COLUMN IF NOT EXISTS "reconciled" boolean DEFAULT false NOT NULL;
ALTER TABLE "receipts" ADD COLUMN IF NOT EXISTS "reconciliation_id" varchar REFERENCES "bank_reconciliations"("id");

-- Verify
SELECT table_name FROM information_schema.tables WHERE table_name IN ('bank_reconciliations', 'bank_reconciliation_items');
SELECT column_name FROM information_schema.columns WHERE table_name = 'payments' AND column_name IN ('reconciled', 'reconciliation_id');
