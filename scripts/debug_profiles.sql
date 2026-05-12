SELECT 
    u.gender, 
    u.looking_for,
    COUNT(*) as total_users,
    SUM(CASE WHEN u.status = 'active' THEN 1 ELSE 0 END) as active_users,
    COUNT(p.id) as users_with_profiles,
    SUM(CASE WHEN u.status = 'active' AND p.id IS NOT NULL THEN 1 ELSE 0 END) as browseable_profiles
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
GROUP BY u.gender, u.looking_for;
