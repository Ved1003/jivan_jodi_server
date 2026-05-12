-- Add deletion tracking columns to users table
-- This allows soft delete with reason tracking

ALTER TABLE users 
ADD COLUMN deletion_reason VARCHAR(500) NULL COMMENT 'Reason why user deleted their profile',
ADD COLUMN deleted_at TIMESTAMP NULL COMMENT 'When the profile was deleted';

-- Add index for better query performance on deleted users
CREATE INDEX idx_users_deleted ON users(status, deleted_at);
