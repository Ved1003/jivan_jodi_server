import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkFemales() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'jivan_jodi',
            port: 3306
        });

        console.log('Connected to database.\n');

        // Check all female users
        const [females] = await connection.query(`
            SELECT 
                u.id, 
                u.email, 
                u.gender, 
                u.looking_for,
                u.status,
                u.role,
                CASE WHEN p.id IS NULL THEN 'NO PROFILE' ELSE 'HAS PROFILE' END as profile_status,
                p.first_name,
                p.last_name,
                p.city
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.gender = 'female'
            ORDER BY u.id
        `);

        console.log('=== ALL FEMALE USERS IN DATABASE ===\n');
        console.table(females);

        const withProfile = females.filter(f => f.profile_status === 'HAS PROFILE');
        const withoutProfile = females.filter(f => f.profile_status === 'NO PROFILE');

        console.log(`\nTotal Females: ${females.length}`);
        console.log(`With Profile: ${withProfile.length}`);
        console.log(`Without Profile: ${withoutProfile.length}`);

        if (withoutProfile.length > 0) {
            console.log('\n=== FEMALES WITHOUT PROFILES ===');
            console.table(withoutProfile.map(f => ({
                id: f.id,
                email: f.email,
                status: f.status,
                looking_for: f.looking_for
            })));
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkFemales();
