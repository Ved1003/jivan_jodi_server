import { pool } from './src/config/database.js';

const fixBlogSchema = async () => {
    try {
        console.log('🔍 Checking blogs table schema...');

        // Get current columns
        const [columns] = await pool.query('DESCRIBE blogs');
        const columnNames = columns.map(c => c.Field);
        console.log('Current columns:', columnNames);

        // Check for 'image' column
        if (!columnNames.includes('image')) {
            console.log('⚠️ Column "image" missing. Adding it...');
            await pool.query('ALTER TABLE blogs ADD COLUMN image VARCHAR(255) AFTER author');
            console.log('✅ Column "image" added.');
        }

        // Check for 'tags' column
        if (!columnNames.includes('tags')) {
            console.log('⚠️ Column "tags" missing. Adding it...');
            await pool.query('ALTER TABLE blogs ADD COLUMN tags VARCHAR(255) AFTER image');
            console.log('✅ Column "tags" added.');
        }

        // Check for 'slug' column (just in case)
        if (!columnNames.includes('slug')) {
            console.log('⚠️ Column "slug" missing. Adding it...');
            await pool.query('ALTER TABLE blogs ADD COLUMN slug VARCHAR(255) NOT NULL UNIQUE AFTER title');
            console.log('✅ Column "slug" added.');
        }

        console.log('🎉 Schema check complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Schema fix failed:', error);
        process.exit(1);
    }
};

fixBlogSchema();
