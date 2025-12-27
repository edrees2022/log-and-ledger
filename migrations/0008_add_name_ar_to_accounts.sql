-- Add Arabic name field to accounts table for bilingual support
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS name_ar TEXT;

-- Comment for documentation
COMMENT ON COLUMN accounts.name_ar IS 'Arabic name for the account, used for bilingual display';
