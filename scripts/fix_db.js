import { pool } from './src/config/database.js';

const fixDatabase = async () => {
    try {
        console.log('🚀 Starting database schema fix...');

        // 1. Fix users table
        console.log('👤 Checking "users" table...');
        const [userCols] = await pool.query("SHOW COLUMNS FROM users");
        const userColNames = userCols.map(c => c.Field);

        if (!userColNames.includes('gender')) {
            console.log('➕ Adding "gender" to users...');
            await pool.query("ALTER TABLE users ADD COLUMN gender ENUM('male', 'female') AFTER looking_for");

            // Update existing users' gender based on looking_for
            await pool.query(`
                UPDATE users 
                SET gender = CASE 
                    WHEN looking_for = 'bride' THEN 'male' 
                    WHEN looking_for = 'groom' THEN 'female' 
                    ELSE NULL 
                END 
                WHERE gender IS NULL
            `);
        }

        const missingUserTokens = [
            { name: 'verification_token', type: 'VARCHAR(255)' },
            { name: 'verification_token_expires', type: 'TIMESTAMP NULL' },
            { name: 'password_reset_token', type: 'VARCHAR(255)' },
            { name: 'password_reset_expires', type: 'TIMESTAMP NULL' }
        ];

        for (const token of missingUserTokens) {
            if (!userColNames.includes(token.name)) {
                console.log(`➕ Adding "${token.name}" to users...`);
                await pool.query(`ALTER TABLE users ADD COLUMN ${token.name} ${token.type}`);
            }
        }

        // 2. Fix blogs table
        console.log('📝 Checking "blogs" table...');
        const [blogCols] = await pool.query("SHOW COLUMNS FROM blogs");
        const blogColNames = blogCols.map(c => c.Field);

        if (!blogColNames.includes('image')) {
            if (blogColNames.includes('image_url')) {
                console.log('🔄 Renaming "image_url" to "image" in blogs...');
                await pool.query("ALTER TABLE blogs CHANGE COLUMN image_url image VARCHAR(500)");
            } else {
                console.log('➕ Adding "image" column to blogs...');
                await pool.query("ALTER TABLE blogs ADD COLUMN image VARCHAR(500) AFTER status");
            }
        }

        if (!blogColNames.includes('tags')) {
            console.log('➕ Adding "tags" column to blogs...');
            await pool.query("ALTER TABLE blogs ADD COLUMN tags TEXT AFTER image");
        }

        // 3. Fix profiles table (gallery_photos type)
        console.log('🖼️ Checking "profiles" table...');
        const [profileCols] = await pool.query("SHOW COLUMNS FROM profiles WHERE Field = 'gallery_photos'");
        if (profileCols.length > 0 && profileCols[0].Type.toLowerCase() !== 'text') {
            console.log('🔄 Changing "gallery_photos" type to TEXT in profiles...');
            await pool.query("ALTER TABLE profiles MODIFY COLUMN gallery_photos TEXT");
        }

        // 4. Create profile_interactions table if missing
        console.log('🤝 Checking "profile_interactions" table...');
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS profile_interactions (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    target_user_id INT NOT NULL,
                    interaction_type ENUM('view', 'like', 'shortlist', 'contact') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_interaction (user_id, target_user_id, interaction_type),
                    INDEX idx_user_interactions (user_id, interaction_type),
                    INDEX idx_target_user (target_user_id, interaction_type),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ "profile_interactions" table is ready.');
        } catch (err) {
            console.error('⚠️ Could not create profile_interactions table:', err.message);
        }

        console.log('✅ Database schema fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing database:', error);
        process.exit(1);
    }
};

fixDatabase();
