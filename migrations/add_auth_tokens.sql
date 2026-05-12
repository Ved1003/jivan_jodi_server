-- Add email verification and password reset token columns
-- Run this in your MySQL client

USE jivan_jodi;

ALTER TABLE users 
ADD COLUMN verification_token VARCHAR(255),
ADD COLUMN verification_token_expires TIMESTAMP NULL,
ADD COLUMN password_reset_token VARCHAR(255),
ADD COLUMN password_reset_expires TIMESTAMP NULL;

-- Verify the changes
DESCRIBE users;
