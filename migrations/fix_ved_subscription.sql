-- Fix subscription and boost data for ved@gmail.com
-- Run this in MySQL Workbench or phpMyAdmin

USE jivan_jodi;

-- Add the boost_started_at column (ignore error if it already exists)
-- If you get an error that the column already exists, that's fine - just continue with the rest
ALTER TABLE users 
ADD COLUMN boost_started_at DATETIME NULL 
AFTER is_boosted;

-- Get the user ID for ved@gmail.com
SET @ved_user_id = (SELECT id FROM users WHERE email = 'ved@gmail.com');

-- Insert a premium subscription for ved@gmail.com (1 year from today)
INSERT INTO subscriptions (user_id, plan_id, amount, status, start_date, end_date, payment_id)
VALUES (
    @ved_user_id,
    'premium_yearly',
    365,
    'active',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 1 YEAR),
    CONCAT('pay_', SUBSTRING(MD5(RAND()), 1, 9))
)
ON DUPLICATE KEY UPDATE
    status = 'active',
    start_date = NOW(),
    end_date = DATE_ADD(NOW(), INTERVAL 1 YEAR);

-- Set boost data for ved@gmail.com (1 month from today)
UPDATE users 
SET is_boosted = TRUE,
    boost_started_at = NOW(),
    boost_expires_at = DATE_ADD(NOW(), INTERVAL 1 MONTH)
WHERE id = @ved_user_id;

-- Verify the changes
SELECT 
    u.id,
    u.email,
    u.is_boosted,
    u.boost_started_at,
    u.boost_expires_at,
    s.start_date as subscription_start,
    s.end_date as subscription_end,
    s.status as subscription_status
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
WHERE u.email = 'ved@gmail.com';

-- Get the user ID for ved@gmail.com
SET @ved_user_id = (SELECT id FROM users WHERE email = 'ved@gmail.com');

-- Insert a premium subscription for ved@gmail.com (1 year from today)
INSERT INTO subscriptions (user_id, plan_id, amount, status, start_date, end_date, payment_id)
VALUES (
    @ved_user_id,
    'premium_yearly',
    365,
    'active',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 1 YEAR),
    CONCAT('pay_', SUBSTRING(MD5(RAND()), 1, 9))
)
ON DUPLICATE KEY UPDATE
    status = 'active',
    start_date = NOW(),
    end_date = DATE_ADD(NOW(), INTERVAL 1 YEAR);

-- Set boost data for ved@gmail.com (1 month from today)
UPDATE users 
SET is_boosted = TRUE,
    boost_started_at = NOW(),
    boost_expires_at = DATE_ADD(NOW(), INTERVAL 1 MONTH)
WHERE id = @ved_user_id;

-- Verify the changes
SELECT 
    u.id,
    u.email,
    u.is_boosted,
    u.boost_started_at,
    u.boost_expires_at,
    s.start_date as subscription_start,
    s.end_date as subscription_end,
    s.status as subscription_status
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
WHERE u.email = 'ved@gmail.com';
