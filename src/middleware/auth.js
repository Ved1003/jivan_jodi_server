import { verifyAccessToken } from '../utils/jwt.js';
import { pool } from '../config/database.js';

// Authenticate user middleware
export const authenticateUser = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please login.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = verifyAccessToken(token);

        // Get user from database
        const [users] = await pool.query(
            'SELECT id, email, phone, role, status FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // Check if user is active
        if (user.status === 'blocked' || user.status === 'suspended') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been ' + user.status
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Optional authentication middleware
export const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = undefined;
        return next();
    }
    // If token exists, use standard authentication
    authenticateUser(req, res, next);
};

// Authenticate admin middleware
export const authenticateAdmin = async (req, res, next) => {
    try {
        // First authenticate as user
        await authenticateUser(req, res, () => { });

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

// Check subscription status
export const checkSubscription = async (req, res, next) => {
    try {
        const [subscriptions] = await pool.query(
            `SELECT * FROM subscriptions 
       WHERE user_id = ? 
       AND status = 'active' 
       AND end_date >= CURDATE()
       ORDER BY end_date DESC 
       LIMIT 1`,
            [req.user.id]
        );

        if (subscriptions.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Premium subscription required',
                requiresSubscription: true
            });
        }

        req.subscription = subscriptions[0];
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking subscription status'
        });
    }
};
