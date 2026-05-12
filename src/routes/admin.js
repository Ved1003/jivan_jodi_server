import express from 'express';
import {
    getAllUsers,
    blockUser,
    unblockUser,
    getDashboardStats,
    getAnalytics,
    manualBoost,
    getReports,
    handleReport,
    getAdminActions
} from '../controllers/adminController.js';
import {
    getAllBlogs,
    createBlog,
    updateBlog,
    deleteBlog
} from '../controllers/blogController.js';
import {
    getSettings,
    updateSettings
} from '../controllers/settingsController.js';
import {
    getAllTestimonials,
    createTestimonial,
    updateTestimonialStatus,
    updateTestimonial,
    deleteTestimonial
} from '../controllers/testimonialsController.js';

import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticateAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId/block', blockUser);
router.put('/users/:userId/unblock', unblockUser);
router.post('/users/manual-boost', manualBoost);

// Blog management
router.get('/blogs', getAllBlogs);
router.post('/blogs', createBlog);
router.put('/blogs/:id', updateBlog);
router.delete('/blogs/:id', deleteBlog);

// Testimonials management
router.get('/testimonials', getAllTestimonials);
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id/status', updateTestimonialStatus);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);


// System Settings
router.get('/settings', getSettings);
router.post('/settings', updateSettings);

// Report management
router.get('/reports', getReports);
router.put('/reports/:reportId', handleReport);

// Admin actions history
router.get('/actions', getAdminActions);

export default router;
