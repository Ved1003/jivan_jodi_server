// Load environment variables FIRST
import '../config/env.js';
import mysql from 'mysql2/promise';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jivan_jodi',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    console.log(`📊 Connected to: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔍 Debug info:');
    console.error(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.error(`   User: ${process.env.DB_USER || 'root'}`);
    console.error(`   Database: ${process.env.DB_NAME || 'jivan_jodi'}`);
    console.error(`   Password set: ${process.env.DB_PASSWORD ? 'YES' : 'NO'}`);
    return false;
  }
};

export { pool, testConnection };
