import '../src/config/env.js';
import { pool } from '../src/config/database.js';

const checkColumns = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM users LIMIT 1');
        if (rows.length > 0) {
            console.log('Columns in users table:', Object.keys(rows[0]));
        } else {
            console.log('No users found to check columns.');
            // If no users, we can describe
            const [columns] = await pool.query('DESCRIBE users');
            console.log('Columns:', columns.map(c => c.Field));
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkColumns();
