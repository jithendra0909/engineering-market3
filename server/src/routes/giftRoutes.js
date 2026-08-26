import express from 'express';
import {
  getGiftProducts,
  getGiftProductById,
  createGiftProduct,
  updateGiftProduct,
  deleteGiftProduct,
  toggleFeatured,
  getGiftImageCloudinarySignature
} from '../controllers/giftProductController.js';
import {
  getGiftCategories,
  createGiftCategory,
  updateGiftCategory,
  deleteGiftCategory
} from '../controllers/giftCategoryController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { handleMultipleUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Conditional multer middleware: only process multipart/form-data (local dev fallback).
// When the client sends JSON (production direct-to-Cloudinary flow), skip multer entirely.
const conditionalMultipleUpload = (fieldName, maxCount) => {
  const multerMiddleware = handleMultipleUpload(fieldName, maxCount);
  return (req, res, next) => {
    const ct = req.headers['content-type'] || '';
    if (ct.includes('multipart/form-data')) {
      // Local dev fallback: run multer to handle file buffers
      return multerMiddleware(req, res, next);
    }
    // Production path: body is JSON with Cloudinary URLs, no files to process
    next();
  };
};

// Direct-to-Cloudinary upload signature (bypasses Vercel 4.5MB body limit)
router.get('/cloudinary-sign', protect, adminOnly, getGiftImageCloudinarySignature);

// Product routes
router.get('/products', optionalProtect, getGiftProducts);
router.get('/products/:id', optionalProtect, getGiftProductById);
router.post('/products', protect, adminOnly, conditionalMultipleUpload('images', 20), createGiftProduct);
router.put('/products/:id', protect, adminOnly, conditionalMultipleUpload('images', 20), updateGiftProduct);
router.delete('/products/:id', protect, adminOnly, deleteGiftProduct);
router.post('/products/:id/toggle-featured', protect, adminOnly, toggleFeatured);

// Category routes
router.get('/categories', optionalProtect, getGiftCategories);
router.post('/categories', protect, adminOnly, createGiftCategory);
router.put('/categories/:id', protect, adminOnly, updateGiftCategory);
router.delete('/categories/:id', protect, adminOnly, deleteGiftCategory);

export default router;

