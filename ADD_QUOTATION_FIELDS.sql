-- Add terms field to sales_quotes table
ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS terms TEXT;

-- Add project_id field to sales_quotes table
ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS project_id VARCHAR REFERENCES projects(id);
