import { pool } from '../config/database.js';

// Public: Submit testimonial
export const submitTestimonial = async (req, res) => {
    try {
        const { couple_name, wedding_year, rating, story } = req.body;

        // Validation
        if (!couple_name || !wedding_year || !story) {
            return res.status(400).json({
                success: false,
                message: 'Couple name, wedding year, and story are required'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO testimonials (couple_name, wedding_year, rating, story, status)
             VALUES (?, ?, ?, ?, 'pending')`,
            [couple_name, wedding_year, rating || 5, story]
        );

        res.status(201).json({
            success: true,
            message: 'Thank you! Your story has been submitted for review.',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Submit testimonial error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit testimonial'
        });
    }
};

// Public: Get approved testimonials (latest 3)
export const getApprovedTestimonials = async (req, res) => {
    try {
        const [testimonials] = await pool.query(
            `SELECT id, couple_name, wedding_year, rating, story, created_at
             FROM testimonials
             WHERE status = 'approved'
             ORDER BY created_at DESC
             LIMIT 3`
        );

        res.json({
            success: true,
            data: testimonials
        });
    } catch (error) {
        console.error('Get approved testimonials error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch testimonials'
        });
    }
};

// Admin: Get all testimonials with filters
export const getAllTestimonials = async (req, res) => {
    try {
        const { status } = req.query;

        let query = 'SELECT * FROM testimonials';
        const params = [];

        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const [testimonials] = await pool.query(query, params);

        // Get counts for each status
        const [counts] = await pool.query(
            `SELECT 
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
             FROM testimonials`
        );

        res.json({
            success: true,
            data: testimonials,
            counts: counts[0] || { pending: 0, approved: 0, rejected: 0 }
        });
    } catch (error) {
        console.error('Get all testimonials error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch testimonials'
        });
    }
};

// Admin: Create testimonial directly
export const createTestimonial = async (req, res) => {
    try {
        const { couple_name, wedding_year, rating, story } = req.body;

        // Validation
        if (!couple_name || !wedding_year || !story) {
            return res.status(400).json({
                success: false,
                message: 'Couple name, wedding year, and story are required'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO testimonials (couple_name, wedding_year, rating, story, status)
             VALUES (?, ?, ?, ?, 'approved')`,
            [couple_name, wedding_year, rating || 5, story]
        );

        res.status(201).json({
            success: true,
            message: 'Testimonial created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Create testimonial error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create testimonial'
        });
    }
};

// Admin: Update testimonial status
export const updateTestimonialStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        await pool.query(
            'UPDATE testimonials SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({
            success: true,
            message: `Testimonial ${status} successfully`
        });
    } catch (error) {
        console.error('Update testimonial status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update testimonial status'
        });
    }
};

// Admin: Update testimonial
export const updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const { couple_name, wedding_year, rating, story } = req.body;

        await pool.query(
            `UPDATE testimonials 
             SET couple_name = ?, wedding_year = ?, rating = ?, story = ?
             WHERE id = ?`,
            [couple_name, wedding_year, rating, story, id]
        );

        res.json({
            success: true,
            message: 'Testimonial updated successfully'
        });
    } catch (error) {
        console.error('Update testimonial error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update testimonial'
        });
    }
};

// Admin: Delete testimonial
export const deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM testimonials WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Testimonial deleted successfully'
        });
    } catch (error) {
        console.error('Delete testimonial error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete testimonial'
        });
    }
};


