import express from 'express';
import {
  getListings,
  getGeneralListings,
  getCollegeListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  contactListingSeller,
  saveListing,
  renewListing,
  reportListing
} from '../controllers/listingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { verifiedOnly } from '../middleware/verifiedMiddleware.js';
import { handleMultipleUpload } from '../middleware/uploadMiddleware.js';
import { checkListingLimit } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.get('/', getListings);
router.get('/general', getGeneralListings);
router.get('/college', protect, getCollegeListings);
router.get('/:id', getListingById);

// Creation, edits, and contact actions require verification
router.post('/', protect, verifiedOnly, checkListingLimit, handleMultipleUpload('images', 5), createListing);
router.put('/:id', protect, verifiedOnly, handleMultipleUpload('images', 5), updateListing);
router.delete('/:id', protect, verifiedOnly, deleteListing);
router.post('/:id/contact', protect, verifiedOnly, contactListingSeller);

// Saving listing only requires login
router.post('/:id/save', protect, saveListing);

// Reporting listing only requires login
router.post('/:id/report', protect, reportListing);

// Renewing listing requires verification
router.post('/:id/renew', protect, verifiedOnly, renewListing);

export default router;
