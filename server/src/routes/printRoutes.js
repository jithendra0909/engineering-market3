import express from 'express';
import {
  createPrintOrder,
  getMyPrintOrders,
  getAllPrintOrders,
  updatePrintOrderStatus
} from '../controllers/printController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handlePdfUpload, handleSingleUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Student routes
router.post('/order', protect, createPrintOrder);
router.get('/my-orders', protect, getMyPrintOrders);

// Upload endpoints
router.post('/upload-pdf', protect, handlePdfUpload('pdf'), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'PDF upload failed' });
  }
  res.json({ url: req.file.path, name: req.file.originalname, pagesCount: req.file.pagesCount });
});

router.post('/upload-screenshot', protect, handleSingleUpload('screenshot'), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'Screenshot upload failed' });
  }
  res.json({ url: req.file.path });
});

// Admin/Vendor routes
router.get('/all-orders', protect, getAllPrintOrders);
router.put('/orders/:id/status', protect, updatePrintOrderStatus);

export default router;
