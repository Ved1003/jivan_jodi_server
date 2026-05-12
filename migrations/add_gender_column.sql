-- Add gender column to users table
-- Run this in your MySQL client

USE jivan_jodi;

-- Add gender column
ALTER TABLE users 
ADD COLUMN gender ENUM('male', 'female') AFTER looking_for;

-- Update existing users based on lookingFor
UPDATE users 
SET gender = CASE 
    WHEN looking_for = 'bride' THEN 'male'
    WHEN looking_for = 'groom' THEN 'female'
END
WHERE gender IS NULL;

-- Verify the change
SELECT id, email, looking_for, gender FROM users;
