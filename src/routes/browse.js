import express from 'express';
import {
    browseProfiles,
    getProfileDetails,
    addToShortlist,
    removeFromShortlist,
    getShortlist,
    sendLike,
    getSentLikes,
    getReceivedLikes
} from '../controllers/browseController.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Browse profiles with filters
router.get('/profiles', authenticateUser, browseProfiles);

// Get detailed profile (Optional Auth)
router.get('/profile/:userId', optionalAuth, getProfileDetails);

// Shortlist management
router.post('/shortlist/:userId', authenticateUser, addToShortlist);
router.delete('/shortlist/:userId', authenticateUser, removeFromShortlist);
router.get('/shortlist', authenticateUser, getShortlist);

// Interest/Like management
router.post('/like/:userId', authenticateUser, sendLike);
router.get('/likes/sent', authenticateUser, getSentLikes);
router.get('/likes/received', authenticateUser, getReceivedLikes);

export default router;
