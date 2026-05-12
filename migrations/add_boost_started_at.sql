-- Add boost_started_at column to users table
ALTER TABLE users 
ADD COLUMN boost_started_at DATETIME NULL 
AFTER is_boosted;

-- Update existing boosted users to set their start date based on expiry
UPDATE users 
SET boost_started_at = DATE_SUB(boost_expires_at, INTERVAL 1 MONTH)
WHERE is_boosted = TRUE AND boost_expires_at IS NOT NULL AND boost_started_at IS NULL;
