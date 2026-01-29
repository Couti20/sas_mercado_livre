-- Add status column to products table
-- Run this migration on your database

-- Add the column
ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';

-- Update existing products to ACTIVE (they were already scraped successfully)
UPDATE products SET status = 'ACTIVE' WHERE status IS NULL;

-- Done!
