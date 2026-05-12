-- Jivan Jodi Matrimonial Platform Database Schema
-- Run this file to create all necessary tables

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  looking_for ENUM('bride', 'groom') NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  gender ENUM('male', 'female'),
  status ENUM('pending', 'active', 'suspended', 'blocked') DEFAULT 'pending',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_token_expires TIMESTAMP NULL,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_status (status)
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  height VARCHAR(10),
  blood_group VARCHAR(5),
  marital_status VARCHAR(30),
  weight VARCHAR(20),
  whatsapp_number VARCHAR(20),
  
  -- Religious Information
  religion VARCHAR(50),
  mother_tongue VARCHAR(50),
  
  -- Education & Career
  education VARCHAR(100),
  profession VARCHAR(100),
  company VARCHAR(200),
  annual_income VARCHAR(50),
  
  -- Family Information
  father_name VARCHAR(100),
  father_occupation VARCHAR(100),
  mother_name VARCHAR(100),
  mother_occupation VARCHAR(100),
  siblings VARCHAR(200),
  family_type VARCHAR(30),
  
  -- Lifestyle
  diet VARCHAR(30),
  drinking VARCHAR(30),
  smoking VARCHAR(30),
  hobbies JSON,
  
  -- Location
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  
  -- Photos (Cloudinary URLs)
  profile_photo VARCHAR(500),
  gallery_photos JSON,
  
  -- Meta
  is_verified BOOLEAN DEFAULT FALSE,
  profile_completion INT DEFAULT 0,
  bio TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_gender (gender),
  INDEX idx_religion (religion),
  INDEX idx_caste (caste),
  INDEX idx_city (city)
);

-- 3. Partner Preferences Table
CREATE TABLE IF NOT EXISTS partner_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  
  age_min INT,
  age_max INT,
  height_min VARCHAR(10),
  height_max VARCHAR(10),
  
  education JSON,
  profession JSON,
  religion JSON,
  location JSON,
  marital_status JSON,
  income_range VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- 4. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  plan_type VARCHAR(50) DEFAULT 'annual',
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT TRUE,
  
  payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_end_date (end_date)
);

-- 5. Profile Boosts Table
CREATE TABLE IF NOT EXISTS profile_boosts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  boost_type ENUM('basic', 'premium', 'ultra') DEFAULT 'basic',
  amount DECIMAL(10, 2) NOT NULL,
  duration_days INT NOT NULL,
  
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  
  status ENUM('active', 'expired') DEFAULT 'active',
  
  payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_end_date (end_date)
);

-- 6. Shortlists Table
CREATE TABLE IF NOT EXISTS shortlists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  shortlisted_user_id INT NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shortlisted_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_shortlist (user_id, shortlisted_user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_shortlisted_user_id (shortlisted_user_id)
);

-- 7. Contact Requests Table
CREATE TABLE IF NOT EXISTS contact_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  requester_id INT NOT NULL,
  requested_user_id INT NOT NULL,
  
  request_type ENUM('whatsapp', 'phone', 'email') DEFAULT 'whatsapp',
  status ENUM('sent', 'viewed', 'responded') DEFAULT 'sent',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (requested_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_requester_id (requester_id),
  INDEX idx_requested_user_id (requested_user_id)
);

-- 8. Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) DEFAULT 'Admin',
  category VARCHAR(100),
  status ENUM('draft', 'published') DEFAULT 'draft',
  image VARCHAR(500),
  tags TEXT,
  slug VARCHAR(255) UNIQUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_slug (slug)
);

-- 9. Admin Actions Table
CREATE TABLE IF NOT EXISTS admin_actions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL,
  action_type ENUM('approve', 'reject', 'block', 'unblock', 'verify') NOT NULL,
  target_user_id INT NOT NULL,
  reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_admin_id (admin_id),
  INDEX idx_target_user_id (target_user_id)
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  type ENUM('shortlist', 'contact_request', 'subscription', 'system') NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  
  related_user_id INT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read)
);

-- Create default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, phone, password_hash, looking_for, role, status, email_verified)
VALUES (
  'admin@jivanjodi.com',
  '9999999999',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHNgm8i',
  'bride',
  'admin',
  'active',
  TRUE
) ON DUPLICATE KEY UPDATE email=email;

SELECT 'Database schema created successfully!' AS message;
