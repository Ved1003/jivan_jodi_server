import { pool } from './src/config/database.js';

const checkData = async () => {
    try {
        console.log('🕵️ Checking "blogs" table data...');
        const [rows] = await pool.query("SELECT * FROM blogs ORDER BY id DESC LIMIT 5");
        console.log('📋 Recent 5 Blogs:', rows);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking data:', error);
        process.exit(1);
    }
};

checkData();
