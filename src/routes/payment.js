import express from 'express';
import { simulatePayment } from '../controllers/paymentController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All payment routes require authentication
router.use(authenticateUser);

// Simulate payment
router.post('/simulate', simulatePayment);

export default router;
