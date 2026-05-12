-- Update ALL profiles with demo WhatsApp numbers
-- This will add WhatsApp numbers to all existing profiles

-- First, let's see how many profiles we have
SELECT COUNT(*) as total_profiles FROM profiles;

-- Update all profiles with sequential WhatsApp numbers
-- Starting from 919876543210

UPDATE profiles 
SET whatsapp_number = CONCAT('91987654', LPAD(user_id, 4, '0'))
WHERE whatsapp_number IS NULL;

-- Alternative: Update with random-looking numbers
-- UPDATE profiles 
-- SET whatsapp_number = CONCAT('91', 
--     FLOOR(9000000000 + (RAND() * 1000000000)))
-- WHERE whatsapp_number IS NULL;

-- Verify all profiles now have WhatsApp numbers
SELECT user_id, first_name, last_name, whatsapp_number 
FROM profiles 
ORDER BY user_id;

-- Check how many profiles have WhatsApp numbers
SELECT 
    COUNT(*) as total_profiles,
    SUM(CASE WHEN whatsapp_number IS NOT NULL THEN 1 ELSE 0 END) as with_whatsapp,
    SUM(CASE WHEN whatsapp_number IS NULL THEN 1 ELSE 0 END) as without_whatsapp
FROM profiles;
