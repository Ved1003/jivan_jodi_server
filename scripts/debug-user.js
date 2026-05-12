import '../src/config/env.js';
import { pool } from '../src/config/database.js';

const checkUser = async () => {
    try {
        const email = 'ved@gmail.com';
        console.log(`Checking user: ${email}`);

        // Check user table
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            console.log('❌ User not found in users table.');
            process.exit(0);
        }

        const user = users[0];
        console.log('✅ User found:', user);

        // Check profiles table
        const [profiles] = await pool.query('SELECT * FROM profiles WHERE user_id = ?', [user.id]);

        if (profiles.length === 0) {
            console.log('❌ User has NO PROFILE record. This is why they are not showing up.');
        } else {
            console.log('✅ User has profile record:', profiles[0]);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
