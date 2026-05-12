SELECT 
    u.id, 
    u.email, 
    u.gender, 
    u.looking_for,
    u.status,
    CASE WHEN p.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as profile_status
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.status = 'active' AND u.role = 'user';
