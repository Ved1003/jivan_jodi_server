import '../src/config/env.js';
import { pool } from '../src/config/database.js';
import bcrypt from 'bcryptjs';

const createTestUser = async () => {
    try {
        console.log('\n🔧 Creating test user with known credentials...\n');

        const testEmail = 'testuser@jivanjodi.com';
        const testPassword = 'Test@123';
        const testPhone = '8888888888';

        // Check if user exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [testEmail]);

        if (existing.length > 0) {
            console.log('⚠️  Test user already exists. Deleting...');
            await pool.query('DELETE FROM users WHERE email = ?', [testEmail]);
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(testPassword, salt);

        // Create user
        const [userResult] = await pool.query(
            `INSERT INTO users (email, phone, password_hash, looking_for, role, gender, status, email_verified)
       VALUES (?, ?, ?, 'bride', 'user', 'male', 'active', TRUE)`,
            [testEmail, testPhone, passwordHash]
        );

        const userId = userResult.insertId;

        // Create profile
        await pool.query(
            `INSERT INTO profiles (
                user_id, first_name, last_name, date_of_birth, gender, 
                marital_status, religion, caste, education, profession, 
                annual_income, city, state, height, 
                diet, smoking, drinking, bio, 
                profile_photo, gallery_photos
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, 'Test', 'User', '1995-05-15', 'male',
                'never_married', 'Hindu', 'Maratha', 'B.Tech CS', 'Software Engineer',
                '15 LPA', 'Pune', 'Maharashtra', '5\'10"',
                'veg', 'no', 'no', 'This is a test profile created for verifying features.',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60',
                JSON.stringify([
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60'
                ])
            ]
        );

        // Create partner preferences
        await pool.query(
            `INSERT INTO partner_preferences (
                user_id, age_min, age_max, height_min, height_max,
                education, profession, religion, marital_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, 20, 30, "5'0\"", "6'0\"",
                JSON.stringify(['Any']), JSON.stringify(['Any']),
                JSON.stringify(['Hindu']), JSON.stringify(['never_married'])
            ]
        );

        console.log('✅ Test user created successfully!\n');
        console.log('📧 Email:', testEmail);
        console.log('🔑 Password:', testPassword);
        console.log('📱 Phone:', testPhone);
        console.log('✅ Status: active');
        console.log('\n💡 You can now test login with these credentials!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createTestUser();
