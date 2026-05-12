import express from 'express';
import {
    register,
    login,
    adminLogin,
    getMe,
    refreshAccessToken,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema } from '../validators/authValidator.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/admin/login', validate(loginSchema), adminLogin);
router.post('/refresh-token', refreshAccessToken);

// Email verification routes
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// Password reset routes (OTP-based)
router.post('/send-reset-otp', forgotPassword);
router.post('/verify-otp-reset-password', resetPassword);

// Protected routes
router.get('/me', authenticateUser, getMe);
router.post('/change-password', authenticateUser, changePassword);

export default router;
