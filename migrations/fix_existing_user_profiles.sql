-- This script helps fix existing users who registered before the profile creation feature
-- It creates profile entries for users who don't have one yet

-- Check users without profiles
SELECT u.id, u.email, u.created_at
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.id IS NULL;

-- For the specific test user (divinex802@gmail.com), update their profile with a name
-- Replace 'Divine' and 'X' with the actual name if you know it
UPDATE profiles 
SET first_name = 'Divine', last_name = 'X'
WHERE user_id = (SELECT id FROM users WHERE email = 'divinex802@gmail.com')
AND (first_name IS NULL OR first_name = '');

-- If the profile doesn't exist at all for this user, create it:
INSERT INTO profiles (user_id, first_name, last_name, profile_completion)
SELECT u.id, 'Divine', 'X', 0
FROM users u
WHERE u.email = 'divinex802@gmail.com'
AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id);
