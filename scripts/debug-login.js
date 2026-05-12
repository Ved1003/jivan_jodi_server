import './src/config/env.js';
import { pool } from './src/config/database.js';
import bcrypt from 'bcryptjs';

const debugLogin = async () => {
    try {
        console.log('\n🔍 Debugging Login Issue...\n');

        // Get all users
        const [users] = await pool.query('SELECT id, email, phone, password_hash, status FROM users');

        console.log(`Found ${users.length} users in database:\n`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}`);
            console.log(`   Phone: ${user.phone}`);
            console.log(`   Status: ${user.status}`);
            console.log(`   Password Hash: ${user.password_hash.substring(0, 20)}...`);
            console.log('');
        });

        // Test password for first user
        if (users.length > 0) {
            const testPassword = 'test123';
            console.log(`\n🧪 Testing password "${testPassword}" for ${users[0].email}...`);

            const isValid = await bcrypt.compare(testPassword, users[0].password_hash);
            console.log(`Result: ${isValid ? '✅ Password matches!' : '❌ Password does NOT match'}`);

            if (!isValid) {
                console.log('\n💡 Try these common passwords:');
                const commonPasswords = ['password', 'admin123', 'test123', '123456'];
                for (const pwd of commonPasswords) {
                    const match = await bcrypt.compare(pwd, users[0].password_hash);
                    if (match) {
                        console.log(`   ✅ Password is: "${pwd}"`);
                        break;
                    }
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

debugLogin();
