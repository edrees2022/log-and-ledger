-- Add quotation settings columns to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS quote_prefix TEXT DEFAULT 'QT-';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS next_quote_number INTEGER DEFAULT 1;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS quote_validity_days INTEGER DEFAULT 30;
