-- Add first_name and last_name columns to users table
-- This ensures names are always available even if profile creation fails

ALTER TABLE users 
ADD COLUMN first_name VARCHAR(100) AFTER phone,
ADD COLUMN last_name VARCHAR(100) AFTER first_name;

-- Update existing users from their profiles (if they have one)
UPDATE users u
INNER JOIN profiles p ON u.id = p.user_id
SET u.first_name = p.first_name,
    u.last_name = p.last_name
WHERE p.first_name IS NOT NULL;

-- Verify the changes
SELECT id, email, first_name, last_name FROM users LIMIT 10;
