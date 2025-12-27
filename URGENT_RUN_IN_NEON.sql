-- ================================
-- URGENT: Add Legal Consent Columns
-- Run this NOW in Neon Console
-- ================================

-- Add the 3 missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS legal_consent_accepted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS legal_consent_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS legal_consent_version TEXT;

-- Add performance index
CREATE INDEX IF NOT EXISTS idx_users_legal_consent ON users(legal_consent_accepted, legal_consent_version);

-- Verify columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('legal_consent_accepted', 'legal_consent_date', 'legal_consent_version')
ORDER BY column_name;
