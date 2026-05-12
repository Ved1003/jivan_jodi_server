-- Migration: Add default names for existing users without profile names
-- This ensures all users have at least a placeholder name in their profile
-- Run this migration once to fix existing data

-- Step 1: Create profiles for users who don't have one at all
INSERT INTO profiles (user_id, first_name, last_name, profile_completion)
SELECT 
    u.id,
    'User',
    CONCAT('#', u.id),
    0
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = u.id
);

-- Step 2: Update existing profiles that have NULL or empty first_name
UPDATE profiles p
JOIN users u ON p.user_id = u.id
SET 
    p.first_name = 'User',
    p.last_name = CONCAT('#', u.id)
WHERE 
    (p.first_name IS NULL OR p.first_name = '')
    AND (p.last_name IS NULL OR p.last_name = '');

-- Step 3: Verify the changes
SELECT 
    u.id,
    u.email,
    p.first_name,
    p.last_name,
    u.created_at
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.id;

-- Note: Users will see names like "User #37" in their profile form
-- They can update these to their real names when they edit their profile
