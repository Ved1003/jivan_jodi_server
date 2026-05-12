-- Update existing profiles with demo WhatsApp numbers
-- Using Indian format: +91XXXXXXXXXX

UPDATE profiles SET whatsapp_number = '919876543210' WHERE user_id = 2;
UPDATE profiles SET whatsapp_number = '919876543211' WHERE user_id = 3;
UPDATE profiles SET whatsapp_number = '919876543212' WHERE user_id = 4;
UPDATE profiles SET whatsapp_number = '919876543213' WHERE user_id = 5;
UPDATE profiles SET whatsapp_number = '919876543214' WHERE user_id = 6;
UPDATE profiles SET whatsapp_number = '919876543215' WHERE user_id = 7;
UPDATE profiles SET whatsapp_number = '919876543216' WHERE user_id = 8;
UPDATE profiles SET whatsapp_number = '919876543217' WHERE user_id = 9;
UPDATE profiles SET whatsapp_number = '919876543218' WHERE user_id = 10;
UPDATE profiles SET whatsapp_number = '919876543219' WHERE user_id = 11;

-- Verify the updates
SELECT user_id, first_name, last_name, whatsapp_number 
FROM profiles 
WHERE whatsapp_number IS NOT NULL;
