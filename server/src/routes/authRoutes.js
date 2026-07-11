import express from 'express';
import { registerStudent, loginUser, getUserProfile, forgotPassword, resetPassword, updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handleSingleUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/signup', handleSingleUpload('idCardImage'), registerStudent);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, handleSingleUpload('idCardImage'), updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
