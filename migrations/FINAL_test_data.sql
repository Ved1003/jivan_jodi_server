-- =====================================================
-- FINAL WORKING TEST DATA
-- Corrected with JSON format for partner_preferences
-- =====================================================

USE jivan_jodi;

-- Cleanup
DELETE FROM users WHERE email IN ('rahul.sharma@example.com', 'amit.patel@example.com', 'vikram.singh@example.com', 'arjun.reddy@example.com', 'karan.mehta@example.com', 'priya.gupta@example.com', 'sneha.iyer@example.com', 'anjali.desai@example.com', 'divya.nair@example.com', 'riya.kapoor@example.com');

-- Male User 1: Rahul Sharma
INSERT INTO users (email, phone, password_hash, looking_for, gender, role, status, email_verified) VALUES ('rahul.sharma@example.com', '+919876543201', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEm8Tq', 'bride', 'male', 'user', 'active', TRUE);
SET @rahul_id = LAST_INSERT_ID();
INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, height, blood_group, complexion, gender, marital_status, religion, caste, sub_caste, mother_tongue, education, profession, company, annual_income, father_name, father_occupation, mother_name, mother_occupation, siblings, family_type, diet, drinking, smoking, city, state, country, bio) VALUES (@rahul_id, 'Rahul', 'Sharma', '1995-03-15', '5.10', 'O+', 'Fair', 'male', 'Never Married', 'Hindu', 'Brahmin', 'Sharma', 'Hindi', 'B.Tech in Computer Science', 'Software Engineer', 'Google India', '20-25 Lakhs', 'Mr. Rajesh Sharma', 'Business', 'Mrs. Sunita Sharma', 'Homemaker', '1 Sister', 'Nuclear', 'Vegetarian', 'No', 'No', 'Mumbai', 'Maharashtra', 'India', 'Software engineer at Google.');
INSERT INTO partner_preferences (user_id, age_min, age_max, height_min, height_max, education, profession, religion, location) VALUES (@rahul_id, 24, 30, '5.2', '5.8', '["Bachelors","Masters"]', '["Engineer","Doctor","Teacher"]', '["Hindu"]', '["Mumbai","Pune","Delhi"]');

-- Male User 2: Amit Patel
INSERT INTO users (email, phone, password_hash, looking_for, gender, role, status, email_verified) VALUES ('amit.patel@example.com', '+919876543202', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEm8Tq', 'bride', 'male', 'user', 'active', TRUE);
SET @amit_id = LAST_INSERT_ID();
INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, height, blood_group, complexion, gender, marital_status, religion, caste, mother_tongue, education, profession, company, annual_income, father_name, father_occupation, mother_name, mother_occupation, siblings, family_type, diet, drinking, smoking, city, state, country, bio) VALUES (@amit_id, 'Amit', 'Patel', '1993-07-22', '5.9', 'A+', 'Wheatish', 'male', 'Never Married', 'Hindu', 'Patel', 'Gujarati', 'MBA', 'Business Analyst', 'Infosys', '15-20 Lakhs', 'Mr. Kiran Patel', 'Doctor', 'Mrs. Meera Patel', 'Teacher', '1 Brother', 'Joint', 'Vegetarian', 'Occasionally', 'No', 'Pune', 'Maharashtra', 'India', 'MBA graduate working in IT.');
INSERT INTO partner_preferences (user_id, age_min, age_max, height_min, height_max, education, profession, religion, location) VALUES (@amit_id, 22, 28, '5.0', '5.6', '["Bachelors","Masters"]', '["Any"]', '["Hindu"]', '["Pune","Mumbai","Ahmedabad"]');

-- Male User 3: Vikram Singh
INSERT INTO users (email, phone, password_hash, looking_for, gender, role, status, email_verified) VALUES ('vikram.singh@example.com', '+919876543203', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEm8Tq', 'bride', 'male', 'user', 'active', TRUE);
SET @vikram_id = LAST_INSERT_ID();
INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, height, blood_group, complexion, gender, marital_status, religion, caste, mother_tongue, education, profession, company, annual_income, father_name, father_occupation, mother_name, mother_occupation, siblings, family_type, diet, drinking, smoking, city, state, country, bio) VALUES (@vikram_id, 'Vikram', 'Singh', '1992-11-10', '6.0', 'B+', 'Fair', 'male', 'Never Married', 'Hindu', 'Rajput', 'Hindi', 'CA', 'Chartered Accountant', 'Deloitte', '25-30 Lakhs', 'Mr. Rajendra Singh', 'Army Officer', 'Mrs. Kavita Singh', 'Homemaker', '2 Sisters', 'Nuclear', 'Non-Vegetarian', 'Socially', 'No', 'Delhi', 'Delhi', 'India', 'CA working at Deloitte.');
INSERT INTO partner_preferences (user_id, age_min, age_max, height_min, height_max, education, profession, religion, location) VALUES (@vikram_id, 23, 29, '5.3', '5.9', '["Bachelors","Masters","CA"]', '["Any"]', '["Hindu"]', '["Delhi","Gurgaon","Noida"]');

-- Male User 4: Arjun Reddy
INSERT INTO users (email, phone, password_hash, looking_for, gender, role, status, email_verified) VALUES ('arjun.reddy@example.com', '+919876543204', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEm8Tq', 'bride', 'male', 'user', 'active', TRUE);
SET @arjun_id = LAST_INSERT_ID();
INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, height, blood_group, complexion, gender, marital_status, religion, caste, mother_tongue, education, profession, company, annual_income, father_name, father_occupation, mother_name, mother_occupation, siblings, family_type, diet, drinking, smoking, city, state, country, bio) VALUES (@arjun_id, 'Arjun', 'Reddy', '1994-05-18', '5.11', 'O-', 'Wheatish', 'male', 'Never Married', 'Hindu', 'Reddy', 'Telugu', 'MBBS, MD', 'Doctor', 'Apollo Hospital', '30-35 Lakhs', 'Dr. Venkat Reddy', 'Doctor', 'Mrs. Lakshmi Reddy', 'Doctor', '1 Sister', 'Nuclear', 'Non-Vegetarian', 'No', 'No', 'Hyderabad', 'Telangana', 'India', 'Doctor at Apollo Hospital.');
INSERT INTO partner_preferences (user_id, age_min, age_max, height_min, height_max, education, profession, religion, location) VALUES (@arjun_id, 24, 30, '5.2', '5.7', '["MBBS","Masters","Bachelors"]', '["Doctor","Engineer","Teacher"]', '["Hindu"]', '["Hyderabad","Bangalore","Chennai"]');

-- Male User 5: Karan Mehta
INSERT INTO users (email, phone, password_hash, looking_for, gender, role, status, email_verified) VALUES ('karan.mehta@example.com', '+919876543205', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEm8Tq', 'bride', 'male', 'user', 'active', TRUE);
SET @karan_id = LAST_INSERT_ID();
INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, height, blood_group, complexion, gender, marital_status, religion, caste, mother_tongue, education, profession, company, annual_income, father_name, father_occupation, mother_name, mother_occupation, siblings, family_type, diet, drinking, smoking, city, state, country, bio) VALUES (@karan_id, 'Karan', 'Mehta', '1996-09-25', '5.8', 'AB+', 'Fair', 'male', 'Never Married', 'Hindu', 'Agarwal', 'Hindi', 'B.Com, MBA', 'Marketing Manager', 'Unilever', '18-22 Lakhs', 'Mr. Suresh Mehta', 'Business', 'Mrs. Anjali Mehta', 'Homemaker', 'Only Child', 'Nuclear', 'Vegetarian', 'Socially', 'No', 'Bangalore', 'Karnataka', 'India', 'Marketing professional.');
INSERT INTO partner_preferences (user_id, age_min, age_max, height_min, height_max, education, profession, religion, location) VALUES (@karan_id, 23, 28, '5.0', '5.6', '["Bachelors","Masters"]', '["Any"]', '["Hindu"]', '["Bangalore","Mumbai","Delhi"]');

-- Female User 1: Priya Gupta
INSERT INTO users (email, phone, password_hash, looking_for, gender, role, status, email_verified) VALUES ('priya.gupta@example.com', '+919876543206', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEm8Tq', 'groom', 'female', 'user', 'active', TRUE);
SET @priya_id = LAST_INSERT_ID();
INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, height, blood_group, complexion, gender, marital_status, religion, caste, mother_tongue, education, profession, company, annual_income, father_name, father_occupation, mother_name, mother_occupation, siblings, family_type, diet, drinking, smoking, city, state, country, bio) VALUES (@priya_id, 'Priya', 'Gupta', '1997-02-14', '5.4', 'A+', 'Fair', 'female', 'Never Married', 'Hindu', 'Gupta', 'Hindi', 'B.Tech in IT', 'Software Developer', 'TCS', '12-15 Lakhs', 'Mr. Ramesh Gupta', 'Businessman', 'Mrs. Seema Gupta', 'Teacher', '1 Brother', 'Nuclear', 'Vegetarian', 'No', 'No', 'Mumbai', 'Maharashtra', 'India', 'Software developer.');
INSERT INTO partner_preferences (user_id, age_min, age_max, height_min, height_max, education, profession, religion, location) VALUES (@priya_id, 26, 32, '5.8', '6.2', '["B.Tech","Masters","MBA"]', '["Engineer","Doctor","CA"]', '["Hindu"]', '["Mumbai","Pune","Delhi"]');

-- Female User 2: Sneha Iyer
INSERT INTO users (email, phone, password_hash, looking_for, gender, role, status, email_verified) VALUES ('sneha.iyer@example.com', '+919876543207', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEm8Tq', 'groom', 'female', 'user', 'active', TRUE);
SET @sneha_id = LAST_INSERT_ID();
INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, height, blood_group, complexion, gender, marital_status, religion, caste, mother_tongue, education, profession, company, annual_income, father_name, father_occupation, mother_name, mother_occupation, siblings, family_type, diet, drinking, smoking, city, state, country, bio) VALUES (@sneha_id, 'Sneha', 'Iyer', '1996-06-20', '5.5', 'O+', 'Wheatish', 'female', 'Never Married', 'Hindu', 'Iyer', 'Tamil', 'MBA in Finance', 'Financial Analyst', 'HDFC Bank', '15-18 Lakhs', 'Mr. Krishnan Iyer', 'Bank Manager', 'Mrs. Lakshmi Iyer', 'Homemaker', '1 Sister', 'Nuclear', 'Vegetarian', 'No', 'No', 'Chennai', 'Tamil Nadu', 'India', 'Finance professional.');
INSERT INTO partner_preferences (user_id, age_min, age_max, height_min, height_max, education, profession, religion, location) VALUES (@sneha_id, 27, 33, '5.9', '6.1', '["MBA","B.Tech","CA"]', '["Any"]', '["Hindu"]', '["Chennai","Bangalore","Hyderabad"]');

-- Female User 3: Anjali Desai
INSERT INTO users (email, phone, password_hash, looking_for, gender, role, status, email_verified) VALUES ('anjali.desai@example.com', '+919876543208', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEm8Tq', 'groom', 'female', 'user', 'active', TRUE);
SET @anjali_id = LAST_INSERT_ID();
INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, height, blood_group, complexion, gender, marital_status, religion, caste, mother_tongue, education, profession, company, annual_income, father_name, father_occupation, mother_name, mother_occupation, siblings, family_type, diet, drinking, smoking, city, state, country, bio) VALUES (@anjali_id, 'Anjali', 'Desai', '1995-12-08', '5.6', 'B+', 'Fair', 'female', 'Never Married', 'Hindu', 'Desai', 'Gujarati', 'M.Sc in Biotechnology', 'Research Scientist', 'Biocon', '10-12 Lakhs', 'Mr. Mahesh Desai', 'Engineer', 'Mrs. Nita Desai', 'Teacher', '2 Brothers', 'Joint', 'Vegetarian', 'No', 'No', 'Pune', 'Maharashtra', 'India', 'Research scientist.');
INSERT INTO partner_preferences (user_id, age_min, age_max, height_min, height_max, education, profession, religion, location) VALUES (@anjali_id, 26, 32, '5.8', '6.0', '["Masters","B.Tech","PhD"]', '["Engineer","Scientist","Doctor"]', '["Hindu"]', '["Pune","Mumbai","Bangalore"]');

-- Female User 4: Divya Nair
INSERT INTO users (email, phone, password_hash, looking_for, gender, role, status, email_verified) VALUES ('divya.nair@example.com', '+919876543209', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEm8Tq', 'groom', 'female', 'user', 'active', TRUE);
SET @divya_id = LAST_INSERT_ID();
INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, height, blood_group, complexion, gender, marital_status, religion, caste, mother_tongue, education, profession, company, annual_income, father_name, father_occupation, mother_name, mother_occupation, siblings, family_type, diet, drinking, smoking, city, state, country, bio) VALUES (@divya_id, 'Divya', 'Nair', '1998-04-30', '5.3', 'A-', 'Fair', 'female', 'Never Married', 'Hindu', 'Nair', 'Malayalam', 'BDS', 'Dentist', 'Private Practice', '8-10 Lakhs', 'Dr. Suresh Nair', 'Doctor', 'Mrs. Maya Nair', 'Homemaker', '1 Brother', 'Nuclear', 'Non-Vegetarian', 'No', 'No', 'Kochi', 'Kerala', 'India', 'Dentist with own practice.');
INSERT INTO partner_preferences (user_id, age_min, age_max, height_min, height_max, education, profession, religion, location) VALUES (@divya_id, 28, 34, '5.9', '6.2', '["MBBS","B.Tech","MBA"]', '["Doctor","Engineer","Business"]', '["Hindu"]', '["Kochi","Bangalore","Chennai"]');

-- Female User 5: Riya Kapoor
INSERT INTO users (email, phone, password_hash, looking_for, gender, role, status, email_verified) VALUES ('riya.kapoor@example.com', '+919876543210', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEm8Tq', 'groom', 'female', 'user', 'active', TRUE);
SET @riya_id = LAST_INSERT_ID();
INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, height, blood_group, complexion, gender, marital_status, religion, caste, mother_tongue, education, profession, company, annual_income, father_name, father_occupation, mother_name, mother_occupation, siblings, family_type, diet, drinking, smoking, city, state, country, bio) VALUES (@riya_id, 'Riya', 'Kapoor', '1997-08-12', '5.7', 'O+', 'Wheatish', 'female', 'Never Married', 'Hindu', 'Kapoor', 'Hindi', 'M.A in English', 'Content Writer', 'Freelance', '6-8 Lakhs', 'Mr. Anil Kapoor', 'Businessman', 'Mrs. Pooja Kapoor', 'Designer', 'Only Child', 'Nuclear', 'Vegetarian', 'No', 'No', 'Delhi', 'Delhi', 'India', 'Creative writer and blogger.');
INSERT INTO partner_preferences (user_id, age_min, age_max, height_min, height_max, education, profession, religion, location) VALUES (@riya_id, 27, 33, '5.10', '6.2', '["Bachelors","Masters","MBA"]', '["Any"]', '["Hindu"]', '["Delhi","Gurgaon","Mumbai"]');

-- Interactions
INSERT INTO profile_interactions (user_id, target_user_id, interaction_type) VALUES (@rahul_id, @priya_id, 'view'), (@rahul_id, @priya_id, 'like'), (@rahul_id, @priya_id, 'shortlist'), (@rahul_id, @sneha_id, 'view'), (@rahul_id, @anjali_id, 'view'), (@rahul_id, @anjali_id, 'shortlist'), (@amit_id, @anjali_id, 'view'), (@amit_id, @anjali_id, 'like'), (@priya_id, @rahul_id, 'view'), (@priya_id, @rahul_id, 'like'), (@priya_id, @vikram_id, 'shortlist'), (@sneha_id, @arjun_id, 'view'), (@sneha_id, @arjun_id, 'like'), (@sneha_id, @arjun_id, 'shortlist');

-- Success!
SELECT 'SUCCESS! 10 users created!' as Message, (SELECT COUNT(*) FROM users WHERE role = 'user') as Users, (SELECT COUNT(*) FROM profiles) as Profiles, (SELECT COUNT(*) FROM partner_preferences) as Preferences, (SELECT COUNT(*) FROM profile_interactions) as Interactions;
