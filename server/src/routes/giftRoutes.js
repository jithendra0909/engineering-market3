import express from 'express';
import {
  getGiftProducts,
  getGiftProductById,
  createGiftProduct,
  updateGiftProduct,
  deleteGiftProduct,
  toggleFeatured
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

// Product routes
router.get('/products', optionalProtect, getGiftProducts);
router.get('/products/:id', optionalProtect, getGiftProductById);
router.post('/products', protect, adminOnly, handleMultipleUpload('images', 6), createGiftProduct);
router.put('/products/:id', protect, adminOnly, handleMultipleUpload('images', 6), updateGiftProduct);
router.delete('/products/:id', protect, adminOnly, deleteGiftProduct);
router.post('/products/:id/toggle-featured', protect, adminOnly, toggleFeatured);

// Category routes
router.get('/categories', optionalProtect, getGiftCategories);
router.post('/categories', protect, adminOnly, createGiftCategory);
router.put('/categories/:id', protect, adminOnly, updateGiftCategory);
router.delete('/categories/:id', protect, adminOnly, deleteGiftCategory);

export default router;
