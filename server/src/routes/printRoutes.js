import express from 'express';
import {
  createPrintOrder,
  getMyPrintOrders,
  getAllPrintOrders,
  updatePrintOrderStatus,
  getCloudinarySignature,
  registerPdf,
  getSignedPdfUrl
} from '../controllers/printController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handlePdfUpload, handleSingleUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Student routes
router.post('/order', protect, createPrintOrder);
router.get('/my-orders', protect, getMyPrintOrders);

// Direct-to-Cloudinary upload flow (bypasses Vercel 4.5MB body limit)
router.get('/cloudinary-sign', protect, getCloudinarySignature);  // Step 1: get signature
router.post('/register-pdf', protect, registerPdf);               // Step 2: register after client upload

// Signed URL for PDF download/view (handles restricted Cloudinary resources)
router.get('/signed-url', protect, getSignedPdfUrl);

// Legacy server-side upload (kept for local dev fallback)
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
