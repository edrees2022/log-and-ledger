-- ==========================================
-- FIX MISSING COLUMNS & TABLES
-- INSTRUCTIONS: Copy all content below and run in Neon Console
-- ==========================================

-- 1. Fix missing ESG columns in expenses table
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "quantity" numeric(15, 4);
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "unit" text;
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "carbon_factor" numeric(10, 4);

-- 2. Ensure Landed Cost tables exist (if migration 0004 was skipped)
CREATE TABLE IF NOT EXISTS "landed_cost_vouchers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
	"voucher_number" text NOT NULL,
	"date" timestamp NOT NULL,
	"description" text,
	"allocation_method" text DEFAULT 'value' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" varchar REFERENCES "users"("id"),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "landed_cost_bills" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voucher_id" varchar NOT NULL REFERENCES "landed_cost_vouchers"("id") ON DELETE cascade,
	"bill_id" varchar NOT NULL REFERENCES "bills"("id") ON DELETE cascade,
	"amount" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "landed_cost_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voucher_id" varchar NOT NULL REFERENCES "landed_cost_vouchers"("id") ON DELETE cascade,
	"stock_movement_id" varchar NOT NULL REFERENCES "stock_movements"("id") ON DELETE cascade,
	"original_cost" numeric(15, 2) NOT NULL,
	"allocated_cost" numeric(15, 2) NOT NULL,
	"new_cost" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Verify
SELECT column_name FROM information_schema.columns WHERE table_name = 'expenses' AND column_name IN ('quantity', 'unit', 'carbon_factor');
SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'landed_cost_%';
