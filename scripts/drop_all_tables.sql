-- Drop all tables from wrong database
-- Run this in the WRONG database to clean it up

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS admin_actions;
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS contact_requests;
DROP TABLE IF EXISTS shortlists;
DROP TABLE IF EXISTS profile_boosts;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS partner_preferences;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'All tables dropped successfully!' AS message;
