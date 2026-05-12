import { pool } from '../config/database.js';

/**
 * Check if a user has an active subscription
 * @param {number} userId 
 * @returns {Promise<boolean>}
 */
export const checkSubscriptionStatus = async (userId) => {
    try {
        const [rows] = await pool.query(
            `SELECT id FROM subscriptions 
             WHERE user_id = ? 
             AND status = 'active' 
             AND end_date > NOW()
             LIMIT 1`,
            [userId]
        );
        return rows.length > 0;
    } catch (error) {
        console.error('Check subscription status error:', error);
        return false;
    }
};

/**
 * Get user's active subscription details
 * @param {number} userId 
 * @returns {Promise<Object|null>}
 */
export const getActiveSubscription = async (userId) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM subscriptions 
             WHERE user_id = ? 
             AND status = 'active' 
             AND end_date > NOW()
             LIMIT 1`,
            [userId]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Get active subscription error:', error);
        return null;
    }
};
