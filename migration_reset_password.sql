-- ====================================
-- MIGRATION: Add Password Reset columns to users table
-- Run this if you already have the users table
-- ====================================

USE price_monitor_db;

-- Add reset_password_token column if not exists
SET @dbname = DATABASE();
SET @tablename = "users";
SET @columnname = "reset_password_token";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 'Column already exists'",
  "ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255)"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add reset_password_token_expires column if not exists
SET @columnname = "reset_password_token_expires";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 'Column already exists'",
  "ALTER TABLE users ADD COLUMN reset_password_token_expires TIMESTAMP NULL"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index on reset_password_token for faster lookups
-- CREATE INDEX IF NOT EXISTS idx_reset_token ON users(reset_password_token);

-- Verify columns were added
DESCRIBE users;
