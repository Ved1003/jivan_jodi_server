import './src/config/env.js';
import { pool } from './src/config/database.js';

const checkUsers = async () => {
    try {
        console.log('\n🔍 Checking users in database...\n');

        const [users] = await pool.query('SELECT id, email, role, status FROM users');

        console.log(`Found ${users.length} users:\n`);
        users.forEach(user => {
            console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Status: ${user.status}`);
        });

        if (users.length === 0) {
            console.log('\n⚠️  No users found! You need to:');
            console.log('1. Register a new user via API');
            console.log('2. Or run insert_admin.sql to create admin user');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkUsers();
