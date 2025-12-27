-- Migration: Add Legal Consent Columns to Users Table
-- Date: 2025-11-10
-- Purpose: Add legal consent tracking fields (legal_consent_accepted, legal_consent_date, legal_consent_version)

-- ================================
-- Add Legal Consent Columns
-- ================================

DO $$
BEGIN
  -- Add legal_consent_accepted column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'legal_consent_accepted') THEN
    ALTER TABLE users ADD COLUMN legal_consent_accepted BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE '✓ Added legal_consent_accepted column';
  ELSE
    RAISE NOTICE 'ℹ legal_consent_accepted column already exists';
  END IF;

  -- Add legal_consent_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'legal_consent_date') THEN
    ALTER TABLE users ADD COLUMN legal_consent_date TIMESTAMP;
    RAISE NOTICE '✓ Added legal_consent_date column';
  ELSE
    RAISE NOTICE 'ℹ legal_consent_date column already exists';
  END IF;

  -- Add legal_consent_version column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'legal_consent_version') THEN
    ALTER TABLE users ADD COLUMN legal_consent_version TEXT;
    RAISE NOTICE '✓ Added legal_consent_version column';
  ELSE
    RAISE NOTICE 'ℹ legal_consent_version column already exists';
  END IF;

END $$;

-- ================================
-- Create Index for Legal Consent Queries
-- ================================

CREATE INDEX IF NOT EXISTS idx_users_legal_consent 
  ON users(legal_consent_accepted, legal_consent_version);

-- ================================
-- Verify Migration
-- ================================

DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'users' 
    AND column_name IN ('legal_consent_accepted', 'legal_consent_date', 'legal_consent_version');
  
  IF col_count = 3 THEN
    RAISE NOTICE '✅ Migration successful! All 3 legal consent columns added to users table';
  ELSE
    RAISE WARNING '⚠️ Migration incomplete: only % columns found', col_count;
  END IF;
END $$;
