-- Add location column to warehouses table
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS location TEXT;
