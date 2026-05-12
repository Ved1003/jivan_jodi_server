// Load environment variables FIRST before any imports
import dotenv from 'dotenv';
dotenv.config();

// Now import other modules
import app from './src/app.js';
import { testConnection, pool } from './src/config/database.js';

const PORT = process.env.PORT || 5000;
let server = null;

// Database connection retry configuration
const DB_RETRY_ATTEMPTS = 5;
const DB_RETRY_DELAY = 5000; // 5 seconds

/**
 * Attempt to connect to database with retry logic
 */
const connectWithRetry = async (attempt = 1) => {
    try {
        console.log(`🔄 Database connection attempt ${attempt}/${DB_RETRY_ATTEMPTS}...`);
        const dbConnected = await testConnection();

        if (!dbConnected) {
            throw new Error('Database connection failed');
        }

        console.log('✅ Database connected successfully');
        return true;

    } catch (error) {
        console.error(`❌ Database connection attempt ${attempt} failed:`, error.message);

        if (attempt < DB_RETRY_ATTEMPTS) {
            console.log(`⏳ Retrying in ${DB_RETRY_DELAY / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, DB_RETRY_DELAY));
            return connectWithRetry(attempt + 1);
        } else {
            console.error('⚠️  Failed to connect to database after multiple attempts.');
            console.log('\n📝 Required steps:');
            console.log('1. Make sure MySQL is running');
            console.log('2. Update .env file with your MySQL credentials');
            console.log('3. Create database: CREATE DATABASE jivan_jodi;');
            return false;
        }
    }
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

    // Stop accepting new connections
    if (server) {
        server.close(async () => {
            console.log('✅ HTTP server closed');

            try {
                // Close database connections
                if (pool) {
                    await pool.end();
                    console.log('✅ Database connections closed');
                }

                console.log('✅ Graceful shutdown completed');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        });

        // Force shutdown after timeout
        setTimeout(() => {
            console.error('⚠️  Forced shutdown after timeout');
            process.exit(1);
        }, 10000); // 10 seconds timeout
    } else {
        process.exit(0);
    }
};

/**
 * Start server with enhanced error handling
 */
const startServer = async () => {
    try {
        // Test database connection with retry
        const dbConnected = await connectWithRetry();

        if (!dbConnected) {
            console.error('❌ Unable to establish database connection. Exiting...');
            process.exit(1);
        }

        // Start Express server
        server = app.listen(PORT, () => {
            console.log('\n🚀 Server is running!');
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✅ Health check: http://localhost:${PORT}/health`);
            console.log(`🔧 Process ID: ${process.pid}`);
            console.log(`💾 Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n`);

            // Send ready signal to PM2
            if (process.send) {
                process.send('ready');
                console.log('📡 Ready signal sent to PM2\n');
            }
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use`);
            } else {
                console.error('❌ Server error:', error);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

// ============================================
// Process Event Handlers
// ============================================

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
    console.error('Error:', error.name, error.message);
    console.error('Stack:', error.stack);

    // Log to file or monitoring service here

    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 UNHANDLED REJECTION! Shutting down...');
    console.error('Reason:', reason);
    console.error('Promise:', promise);

    // Log to file or monitoring service here

    process.exit(1);
});

// Handle graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle PM2 graceful reload
process.on('message', (msg) => {
    if (msg === 'shutdown') {
        gracefulShutdown('PM2 SHUTDOWN');
    }
});

// Monitor memory usage (optional - for debugging)
if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
        const memUsage = process.memoryUsage();
        console.log(`💾 Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
    }, 60000); // Log every minute
}

// Start the server
startServer();

