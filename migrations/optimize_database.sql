-- Database Optimization: Remove Unused Tables
-- This script removes contact_requests and notifications tables that are not being used

-- Step 1: Create backups (just in case there's any data)
CREATE TABLE IF NOT EXISTS contact_requests_backup AS SELECT * FROM contact_requests;
CREATE TABLE IF NOT EXISTS notifications_backup AS SELECT * FROM notifications;

-- Step 2: Drop unused tables
DROP TABLE IF EXISTS contact_requests;
DROP TABLE IF EXISTS notifications;

-- Step 3: Add indexes to profile_boosts for better performance
ALTER TABLE profile_boosts 
ADD INDEX IF NOT EXISTS idx_status_end_date (status, end_date);

-- Step 4: Add indexes to admin_actions for better performance
ALTER TABLE admin_actions 
ADD INDEX IF NOT EXISTS idx_action_type (action_type),
ADD INDEX IF NOT EXISTS idx_created_at (created_at);

-- Step 5: Verify remaining tables
SELECT 'Database optimization complete!' AS message;
SELECT 'Removed tables: contact_requests, notifications' AS removed;
SELECT 'Remaining tables ready for integration: profile_boosts, admin_actions' AS ready;
