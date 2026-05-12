import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

const app = express();

// Security middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all requests
app.use(limiter);

// CORS configuration
// FRONTEND_URL can be a comma-separated list of allowed origins
// e.g. FRONTEND_URL=https://my-app.vercel.app,https://staging.myapp.com
const getFrontendOrigins = () => {
    const envUrls = process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map(u => u.trim()).filter(Boolean)
        : [];
    return [
        'http://192.168.0.11:8080',
        'http://localhost:8080',
        'http://localhost:5173',
        'http://localhost:4173',
        ...envUrls
    ].filter(Boolean);
};

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = getFrontendOrigins();

        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);

        if (!allowedOrigins.includes(origin)) {
            if (process.env.NODE_ENV === 'development') {
                console.log('CORS blocked origin:', origin);
            }
            return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    // Debug middleware to log request body
    app.use((req, res, next) => {
        if (req.method === 'POST' || req.method === 'PUT') {
            console.log('📥 Request Body:', req.body);
        }
        next();
    });
}

// Health check route with detailed metrics
app.get('/health', async (req, res) => {
    const healthcheck = {
        success: true,
        message: 'Jivan Jodi API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid,
        memory: {
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`
        },
        database: 'checking...'
    };

    try {
        // Check database connection
        const { pool } = await import('./config/database.js');
        const connection = await pool.getConnection();
        connection.release();
        healthcheck.database = 'connected';

        res.status(200).json(healthcheck);
    } catch (error) {
        healthcheck.success = false;
        healthcheck.database = 'disconnected';
        healthcheck.error = error.message;
        res.status(503).json(healthcheck);
    }
});

// Import routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';
import browseRoutes from './routes/browse.js';
import publicRoutes from './routes/public.js';
import uploadRoutes from './routes/upload.js'; // Import upload routes
import paymentRoutes from './routes/payment.js';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/browse', browseRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/upload', uploadRoutes); // Admin upload routes
app.use('/api/payment', paymentRoutes); // Add payment routes


// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        console.error('💥 Error:', err);

        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production: Minimal info
        if (err.isOperational) {
            // Trusted operational error: send message to client
            res.status(err.statusCode).json({
                success: false,
                status: err.status,
                message: err.message
            });
        } else {
            // Programming or other unknown error: don't leak details
            console.error('ERROR 💥', err);
            res.status(500).json({
                success: false,
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
});

export default app;
