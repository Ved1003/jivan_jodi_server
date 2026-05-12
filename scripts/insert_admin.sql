-- Insert admin user (if not exists)
-- This fixes the error you got
INSERT IGNORE INTO users (email, phone, password_hash, looking_for, role, status, email_verified)
VALUES (
  'admin@jivanjodi.com',
  '9999999999',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHNgm8i',
  'bride',
  'admin',
  'active',
  TRUE
);

SELECT 'Admin user created successfully!' AS message;
