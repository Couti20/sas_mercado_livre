-- Migration: Add discount/promotional price fields to products table
-- Run this if Hibernate doesn't auto-create the columns

-- Add original_price column (preço original antes do desconto)
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DOUBLE PRECISION;

-- Add discount_percent column (percentual de desconto, ex: 15 para 15%)
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('original_price', 'discount_percent');
