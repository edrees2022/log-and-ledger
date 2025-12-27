-- Add account_id column to document_lines for line-level account override
ALTER TABLE document_lines 
ADD COLUMN IF NOT EXISTS account_id VARCHAR REFERENCES accounts(id);

-- Add comment for documentation
COMMENT ON COLUMN document_lines.account_id IS 'Revenue/expense account for this line item - overrides item default account';
