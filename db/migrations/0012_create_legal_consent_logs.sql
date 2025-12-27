-- Migration: Create legal_consent_logs table for audit trail
-- This table stores legal consent acceptance records for compliance and legal protection

CREATE TABLE IF NOT EXISTS "legal_consent_logs" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "company_id" VARCHAR NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "consent_version" TEXT NOT NULL,
  "terms_accepted" BOOLEAN NOT NULL DEFAULT TRUE,
  "privacy_accepted" BOOLEAN NOT NULL DEFAULT TRUE,
  "disclaimer_accepted" BOOLEAN NOT NULL DEFAULT TRUE,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "accepted_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups by user
CREATE INDEX IF NOT EXISTS "legal_consent_logs_user_id_idx" ON "legal_consent_logs"("user_id");

-- Create index for faster lookups by company
CREATE INDEX IF NOT EXISTS "legal_consent_logs_company_id_idx" ON "legal_consent_logs"("company_id");

-- Create index for faster lookups by acceptance date
CREATE INDEX IF NOT EXISTS "legal_consent_logs_accepted_at_idx" ON "legal_consent_logs"("accepted_at");

-- Add comment to table
COMMENT ON TABLE "legal_consent_logs" IS 'Audit trail for legal consent acceptance - stores timestamped records for compliance';
