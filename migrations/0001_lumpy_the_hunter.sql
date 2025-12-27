CREATE TABLE "legal_consent_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"company_id" varchar NOT NULL,
	"consent_version" text NOT NULL,
	"terms_accepted" boolean DEFAULT true NOT NULL,
	"privacy_accepted" boolean DEFAULT true NOT NULL,
	"disclaimer_accepted" boolean DEFAULT true NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"accepted_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "legal_consent_logs" ADD CONSTRAINT "legal_consent_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_consent_logs" ADD CONSTRAINT "legal_consent_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;