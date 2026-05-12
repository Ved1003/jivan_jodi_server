import './src/config/env.js';
import { pool } from './src/config/database.js';
import bcrypt from 'bcryptjs';

const createAdmin = async () => {
    try {
        console.log('\n🔧 Creating admin user...\n');

        const adminEmail = 'admin@jivanjodi.com';
        const adminPassword = 'admin123';
        const adminPhone = '9999999999';

        // Check if admin exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [adminEmail]);

        if (existing.length > 0) {
            console.log('⚠️  Admin user already exists. Updating password...');

            // Hash new password
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash(adminPassword, salt);

            // Update admin
            await pool.query(
                `UPDATE users SET password_hash = ?, role = 'admin', status = 'active', email_verified = TRUE WHERE email = ?`,
                [passwordHash, adminEmail]
            );

            console.log('✅ Admin user updated successfully!\n');
        } else {
            // Hash password
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash(adminPassword, salt);

            // Create admin
            await pool.query(
                `INSERT INTO users (email, phone, password_hash, looking_for, role, status, email_verified)
         VALUES (?, ?, ?, 'bride', 'admin', 'active', TRUE)`,
                [adminEmail, adminPhone, passwordHash]
            );

            console.log('✅ Admin user created successfully!\n');
        }

        console.log('📧 Email:', adminEmail);
        console.log('🔑 Password:', adminPassword);
        console.log('📱 Phone:', adminPhone);
        console.log('👤 Role: admin');
        console.log('✅ Status: active');
        console.log('\n💡 You can now login as admin with these credentials!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
