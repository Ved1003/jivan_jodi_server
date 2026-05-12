CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  author VARCHAR(100) DEFAULT 'Admin',
  category VARCHAR(50) NOT NULL,
  status ENUM('draft', 'published') DEFAULT 'draft',
  image VARCHAR(255),
  tags VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  setting_value TEXT,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('maintenance_mode', 'false', 'Enable maintenance mode to disable user access'),
('allow_registration', 'true', 'Allow new user registrations'),
('admin_email', 'admin@jivanjodi.com', 'Contact email for admin notifications'),
('site_name', 'Jivan Jodi', 'Global site name');
