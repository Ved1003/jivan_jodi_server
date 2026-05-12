import { pool } from '../src/config/database.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixProfileColumns() {
    const connection = await pool.getConnection();
    try {
        console.log('🚀 Checking for missing columns in profiles table...');

        const columnsToAdd = [
            { name: 'complexion', type: 'VARCHAR(50)' },
            { name: 'weight', type: 'VARCHAR(20)' },
            { name: 'caste', type: 'VARCHAR(100)' },
            { name: 'sub_caste', type: 'VARCHAR(100)' },
            { name: 'diet', type: 'VARCHAR(50)' },
            { name: 'drinking', type: 'VARCHAR(50)' },
            { name: 'smoking', type: 'VARCHAR(50)' },
            { name: 'horoscope', type: 'TEXT' },
            { name: 'whatsapp_number', type: 'VARCHAR(20)' }
        ];

        for (const col of columnsToAdd) {
            const [columns] = await connection.query(`SHOW COLUMNS FROM profiles LIKE "${col.name}"`);

            if (columns.length === 0) {
                console.log(`➕ Adding column ${col.name}...`);
                await connection.query(`ALTER TABLE profiles ADD COLUMN ${col.name} ${col.type} DEFAULT NULL`);
                console.log(`✅ Added ${col.name}`);
            } else {
                console.log(`ℹ️ Column ${col.name} already exists.`);
            }
        }

        console.log('✨ All columns verified!');

    } catch (error) {
        console.error('❌ Error fixing columns:', error.message);
    } finally {
        connection.release();
        process.exit(0);
    }
}

fixProfileColumns();
