CREATE TABLE "landed_cost_bills" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voucher_id" varchar NOT NULL,
	"bill_id" varchar NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "landed_cost_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voucher_id" varchar NOT NULL,
	"stock_movement_id" varchar NOT NULL,
	"original_cost" numeric(15, 2) NOT NULL,
	"allocated_cost" numeric(15, 2) NOT NULL,
	"new_unit_cost" numeric(15, 4) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "landed_cost_vouchers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"voucher_number" text NOT NULL,
	"date" timestamp NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"allocation_method" text DEFAULT 'value' NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "landed_cost_bills" ADD CONSTRAINT "landed_cost_bills_voucher_id_landed_cost_vouchers_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."landed_cost_vouchers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landed_cost_bills" ADD CONSTRAINT "landed_cost_bills_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landed_cost_items" ADD CONSTRAINT "landed_cost_items_voucher_id_landed_cost_vouchers_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."landed_cost_vouchers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landed_cost_items" ADD CONSTRAINT "landed_cost_items_stock_movement_id_stock_movements_id_fk" FOREIGN KEY ("stock_movement_id") REFERENCES "public"."stock_movements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landed_cost_vouchers" ADD CONSTRAINT "landed_cost_vouchers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landed_cost_vouchers" ADD CONSTRAINT "landed_cost_vouchers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;