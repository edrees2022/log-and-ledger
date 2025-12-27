-- Add default account columns to companies table for accounting integration
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS default_sales_account_id VARCHAR REFERENCES accounts(id),
ADD COLUMN IF NOT EXISTS default_purchase_account_id VARCHAR REFERENCES accounts(id),
ADD COLUMN IF NOT EXISTS default_inventory_account_id VARCHAR REFERENCES accounts(id),
ADD COLUMN IF NOT EXISTS default_receivable_account_id VARCHAR REFERENCES accounts(id),
ADD COLUMN IF NOT EXISTS default_payable_account_id VARCHAR REFERENCES accounts(id),
ADD COLUMN IF NOT EXISTS default_bank_account_id VARCHAR REFERENCES accounts(id),
ADD COLUMN IF NOT EXISTS default_cash_account_id VARCHAR REFERENCES accounts(id),
ADD COLUMN IF NOT EXISTS default_expense_account_id VARCHAR REFERENCES accounts(id);

-- Add comments for documentation
COMMENT ON COLUMN companies.default_sales_account_id IS 'Default income/revenue account for sales';
COMMENT ON COLUMN companies.default_purchase_account_id IS 'Default cost of goods sold account for purchases';
COMMENT ON COLUMN companies.default_inventory_account_id IS 'Default inventory asset account';
COMMENT ON COLUMN companies.default_receivable_account_id IS 'Default accounts receivable account';
COMMENT ON COLUMN companies.default_payable_account_id IS 'Default accounts payable account';
COMMENT ON COLUMN companies.default_bank_account_id IS 'Default bank account for transactions';
COMMENT ON COLUMN companies.default_cash_account_id IS 'Default cash account for transactions';
COMMENT ON COLUMN companies.default_expense_account_id IS 'Default expense account';
