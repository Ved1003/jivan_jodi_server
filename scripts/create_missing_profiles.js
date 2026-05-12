import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createMissingProfiles() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'jivan_jodi',
            port: 3306
        });

        console.log('Connected to database.\n');

        // Find users without profiles
        const [usersWithoutProfiles] = await connection.query(`
            SELECT u.id, u.email, u.gender, u.looking_for
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE p.id IS NULL AND u.role = 'user' AND u.status = 'active'
        `);

        if (usersWithoutProfiles.length === 0) {
            console.log('✅ All users have profiles!');
            await connection.end();
            return;
        }

        console.log(`Found ${usersWithoutProfiles.length} users without profiles:\n`);
        usersWithoutProfiles.forEach(u => {
            console.log(`- User ID ${u.id}: ${u.email} (${u.gender}, looking for ${u.looking_for})`);
        });

        console.log('\n⚠️  Creating basic profiles for these users...\n');

        // Create basic profiles for each user
        for (const user of usersWithoutProfiles) {
            // Extract name from email (before @)
            const emailName = user.email.split('@')[0];
            const firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
            const lastName = 'User'; // Default last name

            // Create a basic profile with minimal required fields
            const [result] = await connection.query(`
                INSERT INTO profiles (
                    user_id,
                    first_name,
                    last_name,
                    date_of_birth,
                    gender,
                    height,
                    marital_status,
                    religion,
                    education,
                    profession,
                    city,
                    state,
                    country,
                    profile_completion,
                    bio
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                user.id,
                firstName,
                lastName,
                '1995-01-01', // Default DOB (will make them ~29 years old)
                user.gender,
                user.gender === 'male' ? '5.8' : '5.4', // Default height
                'Never Married',
                'Hindu', // Default religion
                'Graduate', // Default education
                'Professional', // Default profession
                'Mumbai', // Default city
                'Maharashtra', // Default state
                'India',
                30, // 30% profile completion (needs update)
                'Profile created by admin. Please update your information.' // Bio note
            ]);

            console.log(`✅ Created profile for User ID ${user.id} (${user.email})`);
        }

        // Verify all users now have profiles
        const [verification] = await connection.query(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN p.id IS NOT NULL THEN 1 ELSE 0 END) as users_with_profiles
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.role = 'user' AND u.status = 'active'
        `);

        console.log('\n=== VERIFICATION ===');
        console.log(`Total Active Users: ${verification[0].total_users}`);
        console.log(`Users with Profiles: ${verification[0].users_with_profiles}`);

        if (verification[0].total_users === verification[0].users_with_profiles) {
            console.log('✅ SUCCESS! All users now have profiles.');
        } else {
            console.log('⚠️  WARNING: Some users still don\'t have profiles.');
        }

        // Show female users specifically
        const [females] = await connection.query(`
            SELECT 
                u.id,
                u.email,
                p.first_name,
                p.last_name,
                p.city
            FROM users u
            INNER JOIN profiles p ON u.id = p.user_id
            WHERE u.gender = 'female' AND u.status = 'active'
            ORDER BY u.id
        `);

        console.log('\n=== FEMALE USERS NOW VISIBLE IN BROWSE ===');
        console.log(`Total: ${females.length}\n`);
        females.forEach((f, i) => {
            console.log(`${i + 1}. ${f.first_name} ${f.last_name} (ID: ${f.id}) - ${f.city}`);
            console.log(`   Email: ${f.email}\n`);
        });

        await connection.end();
        console.log('✅ Migration completed successfully!');
        console.log('\n📝 NOTE: Users should be prompted to complete their profiles with accurate information.');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createMissingProfiles();
