import { pool } from '../config/database.js';
import { sendApprovalEmail, sendRejectionEmail } from '../utils/email.js';

// Helper function to log admin actions
const logAdminAction = async (adminId, actionType, targetUserId, reason = null) => {
    try {
        await pool.query(
            'INSERT INTO admin_actions (admin_id, action_type, target_user_id, reason) VALUES (?, ?, ?, ?)',
            [adminId, actionType, targetUserId, reason]
        );
        console.log(`✅ Admin action logged: ${actionType} by admin ${adminId} on user ${targetUserId}`);
    } catch (error) {
        console.error('Failed to log admin action:', error);
        // Don't throw error - logging failure shouldn't break the main operation
    }
};

// Get all users with filters
export const getAllUsers = async (req, res) => {
    try {
        const { status, role } = req.query;

        let query = `
            SELECT 
                u.id as userId,
                u.email,
                u.phone,
                u.gender,
                u.looking_for as lookingFor,
                u.role,
                u.status,
                u.email_verified as emailVerified,
                u.created_at as createdAt,
                p.first_name as firstName,
                p.last_name as lastName,
                p.city,
                p.state,
                p.profile_photo as profilePhoto,
                (u.is_boosted = 1 AND u.boost_expires_at > NOW()) as isBoosted,
                u.boost_expires_at as boostExpiresAt,
                (
                    SELECT s.plan_id 
                    FROM subscriptions s 
                    WHERE s.user_id = u.id 
                    AND s.status = 'active' 
                    AND s.end_date > NOW()
                    ORDER BY s.end_date DESC
                    LIMIT 1
                ) as premiumPlan
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE 1=1
        `;

        const params = [];

        if (status) {
            query += ' AND u.status = ?';
            params.push(status);
        }

        if (role) {
            query += ' AND u.role = ?';
            params.push(role);
        }

        query += ' ORDER BY u.created_at DESC';

        const [users] = await pool.query(query, params);


        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

// Block user
export const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        // Get user details
        const [users] = await pool.query(
            'SELECT id, email, status FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user status to blocked
        await pool.query(
            'UPDATE users SET status = ? WHERE id = ?',
            ['blocked', userId]
        );

        // Log admin action
        await logAdminAction(req.user.id, 'block', userId, reason);

        res.json({
            success: true,
            message: 'User blocked successfully'
        });

    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to block user'
        });
    }
};

// Unblock user
export const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user details
        const [users] = await pool.query(
            'SELECT id, email, status FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user status to active
        await pool.query(
            'UPDATE users SET status = ? WHERE id = ?',
            ['active', userId]
        );

        // Log admin action
        await logAdminAction(req.user.id, 'unblock', userId);

        res.json({
            success: true,
            message: 'User unblocked successfully'
        });

    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unblock user'
        });
    }
};

// Get all reports
export const getReports = async (req, res) => {
    try {
        const [reports] = await pool.query(`
            SELECT 
                r.id,
                r.reason,
                r.status,
                r.created_at as createdAt,
                u1.id as reporterId,
                p1.first_name as reporterName,
                u2.id as reportedId,
                p2.first_name as reportedName,
                p2.last_name as reportedLastName,
                u2.status as reportedUserStatus
            FROM reports r
            JOIN users u1 ON r.reporter_id = u1.id
            LEFT JOIN profiles p1 ON u1.id = p1.user_id
            JOIN users u2 ON r.reported_id = u2.id
            LEFT JOIN profiles p2 ON u2.id = p2.user_id
            ORDER BY r.created_at DESC
        `);

        res.json({
            success: true,
            data: reports
        });

    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports'
        });
    }
};

// Handle report (dismiss or resolve/block)
export const handleReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { action } = req.body; // 'dismiss' or 'block'

        if (!reportId || !action) {
            return res.status(400).json({
                success: false,
                message: 'Report ID and action are required'
            });
        }

        const [reports] = await pool.query('SELECT reported_id FROM reports WHERE id = ?', [reportId]);

        if (reports.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        const reportedId = reports[0].reported_id;

        if (action === 'block') {
            // Block the user
            await pool.query("UPDATE users SET status = 'blocked' WHERE id = ?", [reportedId]);
            // Mark report resolved
            await pool.query("UPDATE reports SET status = 'resolved' WHERE id = ?", [reportId]);

            res.json({
                success: true,
                message: 'User blocked and report resolved'
            });
        } else if (action === 'dismiss') {
            // Dismiss report
            await pool.query("UPDATE reports SET status = 'dismissed' WHERE id = ?", [reportId]);

            res.json({
                success: true,
                message: 'Report dismissed'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid action'
            });
        }

    } catch (error) {
        console.error('Handle report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to handle report'
        });
    }
};

// Manual boost user (Test only)
export const manualBoost = async (req, res) => {
    try {
        const { userId } = req.body;
        const durationMonths = 3;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

        // Update user
        await pool.query(
            `UPDATE users 
             SET is_boosted = TRUE, 
             boost_expires_at = ? 
             WHERE id = ?`,
            [expiresAt, userId]
        );

        res.json({
            success: true,
            message: `User boosted for ${durationMonths} months`,
            data: { expiresAt }
        });

    } catch (error) {
        console.error('Manual boost error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to boost user'
        });
    }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Get user counts by status
        const [statusCounts] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked,
                SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended,
                SUM(CASE WHEN is_boosted = 1 AND boost_expires_at > NOW() THEN 1 ELSE 0 END) as boosted
            FROM users
            WHERE role = 'user'
        `);

        // Get total reports count
        const [reportsCount] = await pool.query(`
            SELECT 
                COUNT(*) as totalReports,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as newReportsToday
            FROM reports
        `);

        // Get time-based registration counts
        const [timeCounts] = await pool.query(`
            SELECT 
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as newUsersToday,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as newUsersThisWeek,
                SUM(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) THEN 1 ELSE 0 END) as newUsersThisMonth
            FROM users
            WHERE role = 'user'
        `);

        // Get recent registrations (last 10)
        const [recentUsers] = await pool.query(`
            SELECT 
                id as userId,
                email,
                status,
                is_boosted as isBoosted,
                created_at as createdAt
            FROM users
            WHERE role = 'user'
            ORDER BY created_at DESC
            LIMIT 10
        `);

        // Get registrations by date (last 7 days)
        const [registrationsByDate] = await pool.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM users
            WHERE role = 'user'
            AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);

        // Get user counts by looking_for preference (Active users only for better correlation with Browse)
        const [lookingForCounts] = await pool.query(`
            SELECT 
                SUM(CASE WHEN looking_for = 'bride' THEN 1 ELSE 0 END) as lookingForBride,
                SUM(CASE WHEN looking_for = 'groom' THEN 1 ELSE 0 END) as lookingForGroom
            FROM users
            WHERE role = 'user' AND status = 'active'
        `);

        res.json({
            success: true,
            data: {
                totalUsers: statusCounts[0].total,
                pendingUsers: statusCounts[0].pending,
                activeUsers: statusCounts[0].active,
                blockedUsers: statusCounts[0].blocked,
                suspendedUsers: statusCounts[0].suspended,
                boostedUsers: statusCounts[0].boosted,
                totalReports: reportsCount[0].totalReports || 0,
                newReportsToday: reportsCount[0].newReportsToday || 0,
                newUsersToday: timeCounts[0].newUsersToday || 0,
                newUsersThisWeek: timeCounts[0].newUsersThisWeek || 0,
                newUsersThisMonth: timeCounts[0].newUsersThisMonth || 0,
                lookingForBride: lookingForCounts[0].lookingForBride || 0,
                lookingForGroom: lookingForCounts[0].lookingForGroom || 0,
                recentRegistrations: recentUsers,
                registrationsByDate
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
};
// Get analytics with date range filters
export const getAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, period = 'daily' } = req.query;

        // Default to last 30 days if no dates provided
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];

        // Determine date format based on period
        let dateFormat;
        let groupBy;
        switch (period) {
            case 'yearly':
                dateFormat = '%Y';
                groupBy = 'YEAR(created_at)';
                break;
            case 'monthly':
                dateFormat = '%Y-%m';
                groupBy = 'YEAR(created_at), MONTH(created_at)';
                break;
            case 'weekly':
                dateFormat = '%Y-%u';
                groupBy = 'YEAR(created_at), WEEK(created_at)';
                break;
            case 'daily':
            default:
                dateFormat = '%Y-%m-%d';
                groupBy = 'DATE(created_at)';
        }

        // Get user registrations by period
        const [registrations] = await pool.query(`
            SELECT 
                DATE_FORMAT(created_at, ?) as period,
                COUNT(*) as count,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked
            FROM users
            WHERE role = 'user'
            AND DATE(created_at) BETWEEN ? AND ?
            GROUP BY ${groupBy}
            ORDER BY period ASC
        `, [dateFormat, start, end]);

        // Get status breakdown for the period
        const [statusBreakdown] = await pool.query(`
            SELECT 
                COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked,
            SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended
            FROM users
            WHERE role = 'user'
            AND DATE(created_at) BETWEEN ? AND ?
        `, [start, end]);

        // Get reports statistics for the period
        const [reportsStats] = await pool.query(`
            SELECT 
                COUNT(*) as totalReports,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingReports,
            SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolvedReports
            FROM reports
            WHERE DATE(created_at) BETWEEN ? AND ?
        `, [start, end]);

        res.json({
            success: true,
            data: {
                period,
                startDate: start,
                endDate: end,
                registrations,
                statusBreakdown: statusBreakdown[0],
                reportsStats: reportsStats[0]
            }
        });

    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics'
        });
    }
};

// Get admin actions history
export const getAdminActions = async (req, res) => {
    try {
        const { adminId, actionType, startDate, endDate, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                aa.id,
                aa.action_type as actionType,
                aa.reason,
                aa.created_at as createdAt,
                admin.id as adminId,
                admin.email as adminEmail,
                target.id as targetUserId,
                target.email as targetEmail,
                CONCAT(p.first_name, ' ', p.last_name) as targetName,
                p.profile_photo as targetPhoto
            FROM admin_actions aa
            JOIN users admin ON aa.admin_id = admin.id
            JOIN users target ON aa.target_user_id = target.id
            LEFT JOIN profiles p ON target.id = p.user_id
            WHERE 1=1
        `;

        const params = [];

        if (adminId) {
            query += ' AND aa.admin_id = ?';
            params.push(adminId);
        }

        if (actionType) {
            query += ' AND aa.action_type = ?';
            params.push(actionType);
        }

        if (startDate) {
            query += ' AND DATE(aa.created_at) >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND DATE(aa.created_at) <= ?';
            params.push(endDate);
        }

        // Get total count for pagination before limit
        const countQuery = query.replace('SELECT \n                aa.id,\n                aa.action_type as actionType,\n                aa.reason,\n                aa.created_at as createdAt,\n                admin.id as adminId,\n                admin.email as adminEmail,\n                target.id as targetUserId,\n                target.email as targetEmail,\n                CONCAT(p.first_name, \' \', p.last_name) as targetName,\n                p.profile_photo as targetPhoto', 'SELECT COUNT(*) as total');

        const [totalRows] = await pool.query(countQuery, params);
        const totalItems = totalRows[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        query += ' ORDER BY aa.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [actions] = await pool.query(query, params);

        // Get summary stats (independent of pagination filters, but respects other filters)
        // We need to re-build params for the stats query because the main params array now includes limit/offset
        const statsParams = params.slice(0, params.length - 2);

        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN action_type = 'approve' THEN 1 ELSE 0 END) as approvals,
                SUM(CASE WHEN action_type = 'reject' THEN 1 ELSE 0 END) as rejections,
                SUM(CASE WHEN action_type = 'block' THEN 1 ELSE 0 END) as blocks,
                SUM(CASE WHEN action_type = 'unblock' THEN 1 ELSE 0 END) as unblocks
            FROM admin_actions aa
            WHERE 1=1
            ${adminId ? 'AND aa.admin_id = ?' : ''}
            ${actionType ? 'AND aa.action_type = ?' : ''} -- Include action filter in stats too if present
            ${startDate ? 'AND DATE(aa.created_at) >= ?' : ''}
            ${endDate ? 'AND DATE(aa.created_at) <= ?' : ''}
        `, statsParams);

        res.json({
            success: true,
            data: {
                actions,
                stats: stats[0],
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get admin actions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin actions'
        });
    }
};
