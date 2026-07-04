import express from 'express';
import {
  getUsersByStatus,
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllListingsAdmin,
  deleteListingAdmin
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

export default router;
