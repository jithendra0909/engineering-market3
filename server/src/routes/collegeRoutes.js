import express from 'express';
import { getColleges, createCollege, updateCollege, deleteCollege } from '../controllers/collegeController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getColleges);
router.post('/', protect, adminOnly, createCollege);
router.put('/:id', protect, adminOnly, updateCollege);
router.delete('/:id', protect, adminOnly, deleteCollege);

export default router;
