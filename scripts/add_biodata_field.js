import { pool } from '../src/config/database.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function addBiodataField() {
    const connection = await pool.getConnection();
    try {
        console.log('🚀 Starting to add biodata_url field to profiles table...');

        // Check if column already exists
        const [columns] = await connection.query('SHOW COLUMNS FROM profiles LIKE "biodata_url"');

        if (columns.length === 0) {
            const query = `
        ALTER TABLE profiles 
        ADD COLUMN biodata_url VARCHAR(255) DEFAULT NULL
      `;

            await connection.query(query);
            console.log('✅ Successfully added biodata_url to profiles table.');
        } else {
            console.log('⚠️ biodata_url column already exists.');
        }

    } catch (error) {
        console.error('❌ Error adding field:', error.message);
    } finally {
        connection.release();
        process.exit(0);
    }
}

addBiodataField();
