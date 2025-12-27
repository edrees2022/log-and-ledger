-- Add new settings columns to companies table
-- This migration adds company settings, invoice settings, notification settings, and security settings

-- Company profile settings
ALTER TABLE companies ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United Arab Emirates';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Asia/Dubai';

-- Invoice settings
ALTER TABLE companies ADD COLUMN IF NOT EXISTS invoice_prefix TEXT DEFAULT 'INV-';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS next_invoice_number INTEGER DEFAULT 1;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS payment_terms_days INTEGER DEFAULT 30;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS default_tax_rate DECIMAL(5,2) DEFAULT 5.00;

-- Notification settings
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS invoice_reminders BOOLEAN DEFAULT true;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS payment_alerts BOOLEAN DEFAULT true;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS low_stock_alerts BOOLEAN DEFAULT true;

-- Security settings
ALTER TABLE companies ADD COLUMN IF NOT EXISTS two_factor_required BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER DEFAULT 480;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS password_expiry_days INTEGER DEFAULT 365;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS ip_restriction_enabled BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS allowed_ips JSONB DEFAULT '[]'::jsonb;

-- Update existing date_format default
ALTER TABLE companies ALTER COLUMN date_format SET DEFAULT 'DD/MM/YYYY';
