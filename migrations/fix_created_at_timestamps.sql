-- Fix missing created_at timestamps for existing users
-- This works around MySQL safe update mode by using the primary key

-- Option 1: Disable safe update mode temporarily (run these commands one by one)
SET SQL_SAFE_UPDATES = 0;

UPDATE users 
SET created_at = NOW() 
WHERE created_at IS NULL;

SET SQL_SAFE_UPDATES = 1;

-- Option 2: If you want to update specific users by ID
-- UPDATE users SET created_at = NOW() WHERE id IN (1, 37, 38);

-- Option 3: Update all users one by one (safer but slower)
-- UPDATE users SET created_at = NOW() WHERE id = 1 AND created_at IS NULL;
-- UPDATE users SET created_at = NOW() WHERE id = 37 AND created_at IS NULL;
-- UPDATE users SET created_at = NOW() WHERE id = 38 AND created_at IS NULL;

-- Verify the update
SELECT id, email, created_at 
FROM users 
ORDER BY id;
