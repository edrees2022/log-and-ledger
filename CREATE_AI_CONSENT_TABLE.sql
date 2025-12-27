-- ==========================================
-- RUN THIS IN NEON CONSOLE TO FIX 500 ERROR
-- ==========================================

CREATE TABLE IF NOT EXISTS ai_consent (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL DEFAULT 'ai',
  accepted BOOLEAN NOT NULL DEFAULT true,
  version TEXT,
  accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_ai_consent_user_company ON ai_consent(company_id, user_id);
