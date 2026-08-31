import express from 'express';
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  getUnreadCount,
  reportConversation,
  ackDelivery
} from '../controllers/chatController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { verifiedOnly } from '../middleware/verifiedMiddleware.js';

const router = express.Router();

// Allow delivery acknowledgment (e.g. from background service worker) with optional auth
router.post('/delivery-ack', optionalProtect, ackDelivery);

// Apply authentication to all protected chat routes
router.use(protect);
router.use(verifiedOnly);

router.route('/')
  .get(getConversations)
  .post(createConversation);

router.get('/unread/count', getUnreadCount);

router.post('/:id/report', reportConversation);

router.route('/:id/messages')
  .get(getMessages)
  .post(sendMessage);

export default router;
