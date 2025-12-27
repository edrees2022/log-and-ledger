-- ==========================================
-- FIX CHECKS & BANK ACCOUNTS (COMPREHENSIVE)
-- INSTRUCTIONS: Copy all content below and run in Neon Console
-- ==========================================

-- 0. Ensure extensions exist
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Fix 'bank_accounts' table
CREATE TABLE IF NOT EXISTS "bank_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
	"account_id" varchar NOT NULL REFERENCES "accounts"("id"),
	"name" text NOT NULL,
	"bank_name" text,
	"account_number" text,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"opening_balance" numeric(15, 2) DEFAULT '0' NOT NULL,
	"opening_balance_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Ensure all columns exist in bank_accounts
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "account_id" varchar REFERENCES "accounts"("id");
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "bank_name" text;
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "account_number" text;
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "currency" varchar(3) DEFAULT 'USD' NOT NULL;
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "opening_balance" numeric(15, 2) DEFAULT '0' NOT NULL;
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "opening_balance_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- 2. Fix 'checks' table
CREATE TABLE IF NOT EXISTS "checks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
	"check_number" text NOT NULL,
	"bank_account_id" varchar NOT NULL REFERENCES "bank_accounts"("id"),
	"payee" text NOT NULL,
	"contact_id" varchar REFERENCES "contacts"("id"),
	"amount" numeric(15, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"issue_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"type" text DEFAULT 'standard' NOT NULL,
	"memo" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_by" varchar REFERENCES "users"("id"),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Ensure all columns exist in checks
ALTER TABLE "checks" ADD COLUMN IF NOT EXISTS "check_number" text;
ALTER TABLE "checks" ADD COLUMN IF NOT EXISTS "bank_account_id" varchar REFERENCES "bank_accounts"("id");
ALTER TABLE "checks" ADD COLUMN IF NOT EXISTS "payee" text;
ALTER TABLE "checks" ADD COLUMN IF NOT EXISTS "contact_id" varchar REFERENCES "contacts"("id");
ALTER TABLE "checks" ADD COLUMN IF NOT EXISTS "amount" numeric(15, 2);
ALTER TABLE "checks" ADD COLUMN IF NOT EXISTS "date" timestamp;
ALTER TABLE "checks" ADD COLUMN IF NOT EXISTS "issue_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "checks" ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'standard' NOT NULL;
ALTER TABLE "checks" ADD COLUMN IF NOT EXISTS "memo" text;
ALTER TABLE "checks" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'pending' NOT NULL;

-- 3. Verify
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_name IN ('checks', 'bank_accounts') 
ORDER BY table_name, column_name;
