import express from 'express';
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  getUnreadCount
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { verifiedOnly } from '../middleware/verifiedMiddleware.js';

const router = express.Router();

// Apply authentication to all chat routes
router.use(protect);
router.use(verifiedOnly);

router.route('/')
  .get(getConversations)
  .post(createConversation);

router.get('/unread/count', getUnreadCount);

router.route('/:id/messages')
  .get(getMessages)
  .post(sendMessage);

export default router;
