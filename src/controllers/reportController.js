import { pool } from '../config/database.js';
import { sendReportAcknowledgmentEmail } from '../utils/email.js';

// Create a new report
export const createReport = async (req, res) => {
    try {
        const reporterId = req.user.id;
        const { reportedId, reason } = req.body;

        if (!reportedId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Reported user ID and reason are required'
            });
        }

        if (parseInt(reporterId) === parseInt(reportedId)) {
            return res.status(400).json({
                success: false,
                message: 'You cannot report yourself'
            });
        }

        await pool.query(
            `INSERT INTO reports (reporter_id, reported_id, reason) 
             VALUES (?, ?, ?)`,
            [reporterId, reportedId, reason]
        );

        // Get reporter and reported user details for email
        const [reporterDetails] = await pool.query(
            'SELECT u.email, p.first_name FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = ?',
            [reporterId]
        );

        const [reportedDetails] = await pool.query(
            'SELECT p.first_name FROM profiles p WHERE p.user_id = ?',
            [reportedId]
        );

        const reporterName = reporterDetails.length > 0 ? reporterDetails[0].first_name : 'User';
        const reporterEmail = reporterDetails.length > 0 ? reporterDetails[0].email : null;
        const reportedName = reportedDetails.length > 0 ? reportedDetails[0].first_name : 'User';

        // Send acknowledgment email
        if (reporterEmail) {
            try {
                await sendReportAcknowledgmentEmail(reporterEmail, reporterName, reportedName);
            } catch (emailError) {
                console.error('Failed to send report acknowledgment email:', emailError);
                // Don't fail the report submission if email fails
            }
        }

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully. We will review it shortly.'
        });

    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit report'
        });
    }
};
