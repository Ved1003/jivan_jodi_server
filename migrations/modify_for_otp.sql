-- Modify password reset token to store OTP (6 digits)
-- Run this in your MySQL client

USE jivan_jodi;

-- Change password_reset_token to store 6-digit OTP
ALTER TABLE users MODIFY COLUMN password_reset_token VARCHAR(10);

-- Verify the change
DESCRIBE users;
