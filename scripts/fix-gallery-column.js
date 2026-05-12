import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function checkAndFixSchema() {
    try {
        // Check current column type
        const [columns] = await pool.query(
            `SHOW COLUMNS FROM profiles WHERE Field = 'gallery_photos'`
        );

        console.log('\n=== Current Schema ===');
        console.log(columns[0]);

        // Change to TEXT to store longer JSON arrays
        console.log('\n=== Changing column type to TEXT ===');
        await pool.query(
            `ALTER TABLE profiles MODIFY COLUMN gallery_photos TEXT`
        );

        console.log('✅ Column type changed successfully!');

        // Check again
        const [newColumns] = await pool.query(
            `SHOW COLUMNS FROM profiles WHERE Field = 'gallery_photos'`
        );

        console.log('\n=== New Schema ===');
        console.log(newColumns[0]);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAndFixSchema();
