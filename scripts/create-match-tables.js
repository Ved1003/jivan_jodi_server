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

async function checkTables() {
    try {
        console.log('Checking tables...');

        // Check profile_interactions
        const [interactions] = await pool.query(
            "SHOW TABLES LIKE 'profile_interactions'"
        );
        if (interactions.length === 0) {
            console.log('Creating profile_interactions table...');
            await pool.query(`
                CREATE TABLE profile_interactions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    target_user_id INT NOT NULL,
                    interaction_type ENUM('view', 'like', 'shortlist', 'block') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_interaction (user_id, target_user_id, interaction_type),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ profile_interactions table created');
        } else {
            console.log('✅ profile_interactions table exists');
        }

        // Check partner_preferences
        const [preferences] = await pool.query(
            "SHOW TABLES LIKE 'partner_preferences'"
        );
        if (preferences.length === 0) {
            console.log('Creating partner_preferences table...');
            await pool.query(`
                CREATE TABLE partner_preferences (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL UNIQUE,
                    age_min INT DEFAULT 18,
                    age_max INT DEFAULT 60,
                    height_min DECIMAL(3,1),
                    height_max DECIMAL(3,1),
                    religion VARCHAR(255),
                    caste VARCHAR(255),
                    education VARCHAR(255),
                    profession VARCHAR(255),
                    location VARCHAR(255),
                    income_range VARCHAR(255),
                    marital_status VARCHAR(255),
                    diet VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ partner_preferences table created');
        } else {
            console.log('✅ partner_preferences table exists');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTables();
