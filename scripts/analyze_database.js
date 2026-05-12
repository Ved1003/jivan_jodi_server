import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

async function analyzeDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'jivan_jodi',
            port: 3306
        });

        let report = '=== JIVAN JODI DATABASE ANALYSIS ===\n\n';

        // 1. Check all female users
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

        report += `TOTAL FEMALE USERS: ${females.length}\n\n`;

        females.forEach((f, i) => {
            report += `${i + 1}. User ID: ${f.id}\n`;
            report += `   Email: ${f.email}\n`;
            report += `   Status: ${f.status}\n`;
            report += `   Looking For: ${f.looking_for}\n`;
            report += `   Profile Status: ${f.profile_status}\n`;
            if (f.first_name) {
                report += `   Name: ${f.first_name} ${f.last_name}\n`;
                report += `   City: ${f.city}\n`;
            }
            report += '\n';
        });

        // 2. Check what the browse API would return
        const [browseResults] = await connection.query(`
            SELECT 
                u.id as userId,
                p.first_name as firstName,
                p.last_name as lastName,
                TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
                p.height,
                p.education,
                p.profession,
                p.city,
                p.state,
                p.religion,
                p.caste,
                p.marital_status as maritalStatus,
                p.profile_photo as profilePhoto,
                u.created_at as createdAt,
                u.gender,
                u.status
            FROM users u
            INNER JOIN profiles p ON u.id = p.user_id
            WHERE u.status = 'active'
            AND u.gender = 'female'
            ORDER BY u.created_at DESC
        `);

        report += `\n=== BROWSE API RESULTS (INNER JOIN) ===\n`;
        report += `Total Profiles Returned: ${browseResults.length}\n\n`;

        browseResults.forEach((p, i) => {
            report += `${i + 1}. ${p.firstName} ${p.lastName} (ID: ${p.userId})\n`;
            report += `   Age: ${p.age}, City: ${p.city}\n`;
            report += `   Status: ${p.status}\n\n`;
        });

        // 3. Identify the problem
        const withProfile = females.filter(f => f.profile_status === 'HAS PROFILE');
        const withoutProfile = females.filter(f => f.profile_status === 'NO PROFILE');

        report += `\n=== PROBLEM ANALYSIS ===\n`;
        report += `Females WITH profiles: ${withProfile.length}\n`;
        report += `Females WITHOUT profiles: ${withoutProfile.length}\n\n`;

        if (withoutProfile.length > 0) {
            report += `MISSING PROFILES FOR:\n`;
            withoutProfile.forEach(f => {
                report += `- User ID ${f.id} (${f.email}) - Status: ${f.status}\n`;
            });
        }

        report += `\n=== ROOT CAUSE ===\n`;
        report += `The browseController.js uses INNER JOIN between users and profiles tables.\n`;
        report += `INNER JOIN only returns rows where BOTH tables have matching records.\n`;
        report += `Users without profile records are excluded from the results.\n\n`;

        report += `SOLUTION:\n`;
        report += `1. Create profiles for the ${withoutProfile.length} users without profiles, OR\n`;
        report += `2. Change INNER JOIN to LEFT JOIN in browseController.js (not recommended)\n`;
        report += `3. Ensure all users complete their profiles during registration\n`;

        await fs.writeFile('database_analysis_report.txt', report);
        console.log(report);
        console.log('\nReport saved to database_analysis_report.txt');

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

analyzeDatabase();
