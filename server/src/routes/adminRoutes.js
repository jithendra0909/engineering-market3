import express from 'express';
import {
  getUsersByStatus,
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllListingsAdmin,
  deleteListingAdmin,
  dismissReports,
  getReportedConversations,
  dismissConversationReports,
  updateFeedbackStatus,
  deleteFeedbackAdmin
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/users', protect, adminOnly, getUsersByStatus);
router.get('/users/pending', protect, adminOnly, getPendingUsers);
router.post('/users/:id/approve', protect, adminOnly, approveUser);
router.post('/users/:id/reject', protect, adminOnly, rejectUser);

router.get('/listings', protect, adminOnly, getAllListingsAdmin);
router.delete('/listings/:id', protect, adminOnly, deleteListingAdmin);
router.post('/listings/:id/dismiss-reports', protect, adminOnly, dismissReports);

router.get('/chats', protect, adminOnly, getReportedConversations);
router.post('/chats/:id/dismiss-reports', protect, adminOnly, dismissConversationReports);

router.post('/feedback/:id/status', protect, adminOnly, updateFeedbackStatus);
router.delete('/feedback/:id', protect, adminOnly, deleteFeedbackAdmin);

export default router;
