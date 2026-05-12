import { pool } from '../config/database.js';

// Get all blogs
export const getAllBlogs = async (req, res) => {
    try {
        const [blogs] = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
        res.json({ success: true, data: blogs });
    } catch (error) {
        console.error('Get all blogs error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
    }
};

// Create a new blog
export const createBlog = async (req, res) => {
    try {
        const { title, content, category, author, image, tags, status } = req.body;

        // Generate base slug
        let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Check for existing slug and append suffix if needed
        const [existing] = await pool.query('SELECT id FROM blogs WHERE slug = ?', [slug]);
        if (existing.length > 0) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        const [result] = await pool.query(
            'INSERT INTO blogs (title, slug, content, category, author, image, tags, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, slug, content, category, author || 'Admin', image, tags || '', status || 'draft']
        );

        res.json({
            success: true,
            message: 'Blog created successfully',
            data: { id: result.insertId, ...req.body, slug }
        });
    } catch (error) {
        console.error('Create blog error:', error);
        // Return 400 for bad requests (like duplicates if slug logic fails) or 500 for server errors
        res.status(500).json({ success: false, message: 'Failed to create blog. ' + error.message });
    }
};

// Update a blog
export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, author, image, tags, status } = req.body;

        await pool.query(
            'UPDATE blogs SET title = ?, content = ?, category = ?, author = ?, image = ?, tags = ?, status = ? WHERE id = ?',
            [title, content, category, author, image, tags, status, id]
        );

        res.json({ success: true, message: 'Blog updated successfully' });
    } catch (error) {
        console.error('Update blog error:', error);
        res.status(500).json({ success: false, message: 'Failed to update blog' });
    }
};

// Delete a blog
export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM blogs WHERE id = ?', [id]);
        res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Delete blog error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete blog' });
    }
};
