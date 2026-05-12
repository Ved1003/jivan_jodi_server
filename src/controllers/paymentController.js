import { pool } from '../config/database.js';

// Simulate payment processing
export const simulatePayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { planId, amount, type } = req.body; // type: 'subscription' | 'boost'

        if (!planId || !amount || !type) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment details'
            });
        }

        // 1. Create a "fake" payment ID
        const paymentId = 'pay_' + Math.random().toString(36).substr(2, 9);

        // 2. Calculate dates
        const startDate = new Date();
        const endDate = new Date();

        let durationMonths = 0;
        if (type === 'subscription') {
            durationMonths = 12; // Yearly plan - ₹365
        } else if (type === 'boost') {
            durationMonths = 3; // 3 months boost - ₹500 (available to all users)
        }

        endDate.setMonth(endDate.getMonth() + durationMonths);

        // 3. Start a transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Record subscription/payment
            await connection.query(
                `INSERT INTO subscriptions 
                (user_id, plan_id, amount, status, start_date, end_date, payment_id) 
                VALUES (?, ?, ?, 'active', ?, ?, ?)`,
                [userId, planId, amount, startDate, endDate, paymentId]
            );

            // Update user status based on plan type
            if (type === 'boost') {
                await connection.query(
                    `UPDATE users 
                     SET is_boosted = TRUE, 
                         boost_expires_at = ?,
                         boost_started_at = ?
                     WHERE id = ?`,
                    [endDate, startDate, userId]
                );
            }
            // If it's a regular subscription, we don't need to change a flag on users table
            // because we check the subscriptions table directly for access.
            // BUT, for easier frontend logic, we might want to ensure 'is_subscribed' is reflected if we had such a column.
            // Our current implementation checks `checkSubscriptionStatus` which queries the subscription table, so we are good.

            await connection.commit();

            res.json({
                success: true,
                message: 'Payment simulation successful',
                data: {
                    paymentId,
                    status: 'active',
                    expiresAt: endDate
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Payment simulation error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment processing failed'
        });
    }
};
