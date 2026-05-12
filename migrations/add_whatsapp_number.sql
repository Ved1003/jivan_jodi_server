-- Add whatsapp_number column to profiles table
ALTER TABLE profiles 
ADD COLUMN whatsapp_number VARCHAR(20) NULL AFTER profile_photo;

-- Add index for faster lookups
CREATE INDEX idx_whatsapp_number ON profiles(whatsapp_number);
