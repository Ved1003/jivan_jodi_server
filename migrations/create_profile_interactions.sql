-- Create profile_interactions table for shortlist, likes, and views
USE jivan_jodi;

CREATE TABLE IF NOT EXISTS profile_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    target_user_id INT NOT NULL,
    interaction_type ENUM('view', 'like', 'shortlist', 'contact') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_interaction (user_id, target_user_id, interaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better query performance
CREATE INDEX idx_user_interactions ON profile_interactions(user_id, interaction_type);
CREATE INDEX idx_target_user ON profile_interactions(target_user_id, interaction_type);
CREATE INDEX idx_created_at ON profile_interactions(created_at);

-- Verify the table
DESCRIBE profile_interactions;
