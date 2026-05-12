-- Check all female users
SELECT 
    u.id, 
    u.email, 
    u.gender, 
    u.looking_for,
    u.status,
    u.role,
    CASE WHEN p.id IS NULL THEN 'NO PROFILE' ELSE 'HAS PROFILE' END as profile_status,
    p.first_name,
    p.last_name,
    p.city
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.gender = 'female'
ORDER BY u.id;
