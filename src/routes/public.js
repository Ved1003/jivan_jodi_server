import express from 'express';
import { getAllBlogs } from '../controllers/blogController.js';
import { getFeaturedProfiles, getAllMembers } from '../controllers/browseController.js';
import { submitTestimonial, getApprovedTestimonials } from '../controllers/testimonialsController.js';

const router = express.Router();

// Public blog routes
router.get('/blogs', getAllBlogs);

// Public Featured Profiles
router.get('/featured-profiles', getFeaturedProfiles);

// Public All Members
router.get('/all-members', getAllMembers);

// Public testimonials routes
router.post('/testimonials', submitTestimonial);
router.get('/testimonials/approved', getApprovedTestimonials);

export default router;
