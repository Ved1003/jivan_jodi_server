-- Copy first_name and last_name from profiles to users for existing users

-- Update users table with names from profiles table
UPDATE users u
INNER JOIN profiles p ON u.id = p.user_id
SET u.first_name = p.first_name,
    u.last_name = p.last_name
WHERE p.first_name IS NOT NULL AND p.last_name IS NOT NULL;

-- Verify the update
SELECT u.id, u.email, u.first_name, u.last_name, p.first_name as profile_first, p.last_name as profile_last
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.id
LIMIT 20;
