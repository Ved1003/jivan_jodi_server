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

async function checkGallery() {
    try {
        const [rows] = await pool.query(
            'SELECT user_id, gallery_photos FROM profiles WHERE gallery_photos IS NOT NULL'
        );

        console.log('\n=== Gallery Photos in Database ===\n');

        rows.forEach(row => {
            console.log(`User ID: ${row.user_id}`);
            console.log(`Raw value: ${row.gallery_photos}`);
            console.log(`Type: ${typeof row.gallery_photos}`);

            try {
                const parsed = JSON.parse(row.gallery_photos);
                console.log(`Parsed array length: ${parsed.length}`);
                console.log(`Photos:`, parsed);
            } catch (e) {
                console.log(`Error parsing: ${e.message}`);
            }
            console.log('---\n');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkGallery();
