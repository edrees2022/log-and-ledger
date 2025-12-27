-- Add warehouse_id column to document_lines for inventory tracking
-- This allows tracking which warehouse items are sold from or received to

ALTER TABLE document_lines ADD COLUMN IF NOT EXISTS warehouse_id VARCHAR REFERENCES warehouses(id);

-- Also ensure warehouses has location column
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS location TEXT;
