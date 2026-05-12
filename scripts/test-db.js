import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const testDB = async () => {
    console.log('\n🔍 Testing MySQL Connection...\n');
    console.log('Credentials:');
    console.log(`  Host: ${process.env.DB_HOST}`);
    console.log(`  User: ${process.env.DB_USER}`);
    console.log(`  Password: ${process.env.DB_PASSWORD ? '***SET***' : 'NOT SET'}`);
    console.log(`  Database: ${process.env.DB_NAME}`);
    console.log(`  Port: ${process.env.DB_PORT}\n`);

    try {
        // First, try connecting WITHOUT specifying database
        console.log('Step 1: Testing MySQL server connection...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT)
        });
        console.log('✅ MySQL server is running and credentials are correct!\n');

        // Check if database exists
        console.log('Step 2: Checking if database exists...');
        const [databases] = await connection.query('SHOW DATABASES');
        const dbExists = databases.some(db => db.Database === process.env.DB_NAME);

        if (dbExists) {
            console.log(`✅ Database '${process.env.DB_NAME}' exists!\n`);
        } else {
            console.log(`❌ Database '${process.env.DB_NAME}' does NOT exist!`);
            console.log(`\n📝 Please create it by running:`);
            console.log(`   CREATE DATABASE ${process.env.DB_NAME};\n`);
        }

        await connection.end();

        // Now try connecting WITH database
        if (dbExists) {
            console.log('Step 3: Testing connection to database...');
            const dbConnection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: parseInt(process.env.DB_PORT)
            });
            console.log(`✅ Successfully connected to database '${process.env.DB_NAME}'!\n`);
            await dbConnection.end();
        }

    } catch (error) {
        console.error('❌ Connection failed!');
        console.error(`Error: ${error.message}`);
        console.error(`Code: ${error.code}\n`);

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 This means your username or password is incorrect.');
            console.log('   Please check your .env file.\n');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 This means MySQL server is not running.');
            console.log('   Please start MySQL server.\n');
        }
    }
};

testDB();
