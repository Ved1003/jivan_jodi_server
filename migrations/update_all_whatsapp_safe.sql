-- Disable safe update mode temporarily
SET SQL_SAFE_UPDATES = 0;

-- Update ALL profiles with demo WhatsApp numbers
UPDATE profiles 
SET whatsapp_number = CONCAT('91987654', LPAD(user_id, 4, '0'))
WHERE whatsapp_number IS NULL;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Verify all profiles now have WhatsApp numbers
SELECT user_id, first_name, last_name, whatsapp_number 
FROM profiles 
ORDER BY user_id;

-- Check statistics
SELECT 
    COUNT(*) as total_profiles,
    SUM(CASE WHEN whatsapp_number IS NOT NULL THEN 1 ELSE 0 END) as with_whatsapp,
    SUM(CASE WHEN whatsapp_number IS NULL THEN 1 ELSE 0 END) as without_whatsapp
FROM profiles;
