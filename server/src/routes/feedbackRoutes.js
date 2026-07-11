import express from 'express';
import {
  createFeedback,
  getFeedbackList,
  toggleUpvote
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';
import { verifiedOnly } from '../middleware/verifiedMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(verifiedOnly);

router.route('/')
  .get(getFeedbackList)
  .post(createFeedback);

router.post('/:id/upvote', toggleUpvote);

export default router;
