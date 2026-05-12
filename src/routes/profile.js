import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { upload, biodataUpload } from '../utils/cloudinary.js';
import { validate, profileSchema, partnerPreferencesSchema } from '../validators/profileValidator.js';
import {
    createOrUpdateProfile,
    getProfile,
    uploadProfilePhoto,
    uploadBiodata,
    uploadGalleryPhotos,
    deleteGalleryPhoto,
    updatePartnerPreferences,
    getPartnerPreferences,
    deleteProfile
} from '../controllers/profileController.js';
import { createReport } from '../controllers/reportController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Profile routes
router.post('/', validate(profileSchema), createOrUpdateProfile);
router.get('/me', getProfile);
router.get('/:userId', getProfile);

// Photo upload routes
router.post('/photo', upload.single('photo'), uploadProfilePhoto);
router.post('/biodata', biodataUpload.single('biodata'), uploadBiodata);
router.post('/gallery', upload.array('photos', 6), uploadGalleryPhotos);
router.delete('/gallery/photo', deleteGalleryPhoto);

// Partner preferences routes
router.post('/preferences', validate(partnerPreferencesSchema), updatePartnerPreferences);
router.get('/preferences/me', getPartnerPreferences);
router.get('/preferences/:userId', getPartnerPreferences);

// Report a profile
router.post('/report', createReport);

// Delete profile (soft delete)
router.delete('/delete', deleteProfile);

export default router;
