import { pool } from '../src/config/database.js';
import '../src/config/env.js';

async function checkStatus() {
    try {
        const [users] = await pool.query('SELECT id, email, is_boosted, boost_expires_at FROM users');
        console.log('--- Users ---');
        console.table(users);

        const [subs] = await pool.query('SELECT * FROM subscriptions');
        console.log('\n--- Subscriptions ---');
        console.table(subs);

        const [boosts] = await pool.query('SELECT * FROM profile_boosts');
        console.log('\n--- Boosts ---');
        console.table(boosts);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStatus();
