import { pool } from './src/config/database.js';

const verifyAndFix = async () => {
    try {
        console.log('🕵️ Verifying "blogs" table schema...');

        const [rows] = await pool.query("SHOW COLUMNS FROM blogs");
        const columns = rows.map(r => r.Field);
        console.log('📋 Current Columns:', columns.join(', '));

        const missingImage = !columns.includes('image');
        const missingTags = !columns.includes('tags');

        if (missingImage) {
            console.log('⚠️ Missing "image" column. Adding it now...');
            await pool.query("ALTER TABLE blogs ADD COLUMN image VARCHAR(255) AFTER author");
            console.log('✅ Added "image" column.');
        } else {
            console.log('✅ "image" column exists.');
        }

        if (missingTags) {
            console.log('⚠️ Missing "tags" column. Adding it now...');
            await pool.query("ALTER TABLE blogs ADD COLUMN tags VARCHAR(255) AFTER image");
            console.log('✅ Added "tags" column.');
        } else {
            console.log('✅ "tags" column exists.');
        }

        console.log('🎉 Verification Complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during schema verification:', error);
        process.exit(1);
    }
};

verifyAndFix();
