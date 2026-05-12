import { pool } from '../src/config/database.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSql() {
    try {
        console.log('Connecting to database via pool...');

        // Path to the new migration file
        const sqlPath = path.join(__dirname, '../migrations/add_features_tables.sql');
        const sql = await fs.readFile(sqlPath, 'utf8');

        console.log('Executing SQL migration from:', sqlPath);

        // Split by semicolon to handle multiple statements if pool.query doesn't support multipleStatements by default 
        // (mysql2 pool usually does if configured, but let's check or just try)
        // Actually, the config/database.js might not have multipleStatements: true. 
        // Safest is to read the file and split, or just use the pool if we trust it.
        // Let's look at the sql file: it has DELIMITER and stored procedures. 
        // Running stored proc creation via simple query might be tricky without multipleStatements: true.

        // Let's try to get a connection and set multipleStatements if possible, 
        // or just use the existing pool and hope it works or modify config.
        // The previous run_sql.js had multipleStatements: true.

        // OPTION 2: Create a fresh connection like before but using process.env from the loaded config/env.js
        // The config/database.js imports config/env.js which loads dotenv.

        // Let's stick to the previous approach of making a new connection BUT using the environment variables
        // that are loaded when we import '../src/config/env.js' (indirectly via database.js or directly).
    } catch (error) {
        console.error('Setup error:', error);
    }
}

// Re-writing the whole file to be cleaner and robust
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Manually load .env since we are in scripts folder and .env is in Server root
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
    let connection;
    try {
        console.log('Creating connection...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '', // Default to empty string if undefined
            database: process.env.DB_NAME || 'jivan_jodi',
            port: parseInt(process.env.DB_PORT) || 3306,
            multipleStatements: true
        });

        console.log('Connected to database.');

        // Debug: Check table structure
        const [rows] = await connection.query('DESCRIBE subscriptions');
        console.log('Table Structure:', rows);

        /* 
        const sqlPath = path.join(__dirname, '../migrations/add_features_tables.sql');
        const sql = await fs.readFile(sqlPath, 'utf8');

        console.log('Executing SQL...');
        const [result] = await connection.query(sql);
        console.log("Migration executed successfully.");
        console.log("Result summary:", Array.isArray(result) ? `${result.length} statements executed` : 'Executed');
        */

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

runMigration();
