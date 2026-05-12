-- Check all users and their profiles
SELECT 
    u.id, 
    u.email, 
    u.gender, 
    u.looking_for,
    u.status,
    u.role,
    CASE WHEN p.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as profile_status,
    p.first_name,
    p.last_name
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.id;
