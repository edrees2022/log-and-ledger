-- Add Multi-Entity columns
DO $$ BEGIN
 ALTER TABLE "companies" ADD COLUMN "parent_company_id" varchar;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "contacts" ADD COLUMN "linked_company_id" varchar;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

-- Add User Permissions columns
DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD COLUMN "module" text;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD COLUMN "can_view" boolean DEFAULT false NOT NULL;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD COLUMN "can_create" boolean DEFAULT false NOT NULL;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD COLUMN "can_edit" boolean DEFAULT false NOT NULL;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD COLUMN "can_delete" boolean DEFAULT false NOT NULL;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

-- Create missing tables
CREATE TABLE IF NOT EXISTS "asset_depreciation_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"journal_id" varchar,
	"fiscal_year" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "bank_reconciliation_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reconciliation_id" varchar NOT NULL,
	"transaction_type" text NOT NULL,
	"transaction_id" varchar,
	"amount" numeric(15, 2) NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"description" text,
	"cleared" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "bank_statement_lines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"bank_account_id" varchar,
	"date" timestamp NOT NULL,
	"description" text,
	"reference" text,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"matched" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "purchase_debit_notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"debit_note_number" text NOT NULL,
	"vendor_id" varchar NOT NULL,
	"vendor_name" text NOT NULL,
	"bill_id" varchar,
	"bill_number" text,
	"issue_date" timestamp NOT NULL,
	"reason" text,
	"subtotal" numeric(15, 2) DEFAULT '0' NOT NULL,
	"tax_total" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total" numeric(15, 2) DEFAULT '0' NOT NULL,
	"remaining_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"fx_rate" numeric(10, 6) DEFAULT '1' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "sales_credit_notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"credit_note_number" text NOT NULL,
	"customer_id" varchar NOT NULL,
	"customer_name" text NOT NULL,
	"invoice_id" varchar,
	"invoice_number" text,
	"issue_date" timestamp NOT NULL,
	"reason" text,
	"subtotal" numeric(15, 2) DEFAULT '0' NOT NULL,
	"tax_total" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total" numeric(15, 2) DEFAULT '0' NOT NULL,
	"remaining_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"fx_rate" numeric(10, 6) DEFAULT '1' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint

-- Add constraints (wrapped in DO blocks)
DO $$ BEGIN
 ALTER TABLE "companies" ADD CONSTRAINT "companies_parent_company_id_companies_id_fk" FOREIGN KEY ("parent_company_id") REFERENCES "companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "contacts" ADD CONSTRAINT "contacts_linked_company_id_companies_id_fk" FOREIGN KEY ("linked_company_id") REFERENCES "companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Add constraints for new tables (if they don't exist)
DO $$ BEGIN
 ALTER TABLE "asset_depreciation_entries" ADD CONSTRAINT "asset_depreciation_entries_asset_id_fixed_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "fixed_assets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "bank_reconciliation_items" ADD CONSTRAINT "bank_reconciliation_items_reconciliation_id_bank_reconciliations_id_fk" FOREIGN KEY ("reconciliation_id") REFERENCES "bank_reconciliations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "bank_statement_lines" ADD CONSTRAINT "bank_statement_lines_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "purchase_debit_notes" ADD CONSTRAINT "purchase_debit_notes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "sales_credit_notes" ADD CONSTRAINT "sales_credit_notes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
