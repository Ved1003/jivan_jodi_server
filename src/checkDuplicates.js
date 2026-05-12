// Script to check for duplicate users in the database
import { pool } from './config/database.js';
import fs from 'fs';

async function checkDuplicateUsers() {
    const results = [];
    const log = (msg) => {
        console.log(msg);
        results.push(msg);
    };

    try {
        log('🔍 Checking for duplicate users...\n');

        // Check for duplicate emails
        const [duplicateEmails] = await pool.query(`
            SELECT email, COUNT(*) as count, GROUP_CONCAT(id) as user_ids
            FROM users
            GROUP BY email
            HAVING count > 1
            ORDER BY count DESC
        `);

        if (duplicateEmails.length > 0) {
            log('❌ Found duplicate emails:');
            log(JSON.stringify(duplicateEmails, null, 2));
        } else {
            log('✅ No duplicate emails found');
        }

        // Check ved@gmail.com specifically
        log('\n📧 Checking ved@gmail.com specifically...\n');
        const [vedUsers] = await pool.query(`
            SELECT id, email, phone, role, status, created_at, email_verified
            FROM users
            WHERE email = 'ved@gmail.com'
            ORDER BY id
        `);

        if (vedUsers.length > 0) {
            log(`Found ${vedUsers.length} user(s) with email ved@gmail.com:`);
            log(JSON.stringify(vedUsers, null, 2));

            // Check subscriptions for each user
            log('\n💎 Checking subscriptions for these users...\n');
            for (const user of vedUsers) {
                const [subs] = await pool.query(`
                    SELECT id, user_id, plan_id, status, start_date, end_date
                    FROM subscriptions
                    WHERE user_id = ?
                `, [user.id]);

                log(`\nUser ID ${user.id} subscriptions:`);
                if (subs.length > 0) {
                    log(JSON.stringify(subs, null, 2));
                } else {
                    log('  No subscriptions found');
                }
            }
        } else {
            log('No users found with email ved@gmail.com');
        }

        await pool.end();
        log('\n✅ Database check complete');

        // Write results to file
        fs.writeFileSync('duplicate_check_results.txt', results.join('\n'));
        console.log('\n📄 Results saved to duplicate_check_results.txt');
    } catch (error) {
        console.error('❌ Error checking database:', error);
        process.exit(1);
    }
}

checkDuplicateUsers();
