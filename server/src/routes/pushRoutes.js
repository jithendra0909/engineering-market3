import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { savePushSubscription, removePushSubscription } from '../utils/pushNotification.js';

const router = express.Router();

// GET /api/push/vapid-public-key — get the public VAPID key (no auth needed)
router.get('/vapid-public-key', (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(503).json({ message: 'Push notifications not configured' });
  }
  res.json({ publicKey });
});

// POST /api/push/subscribe — save a push subscription (auth required)
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ message: 'Invalid subscription object' });
    }

    await savePushSubscription(req.user._id, subscription);
    res.status(201).json({ message: 'Push subscription saved' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save subscription', error: error.message });
  }
});

// DELETE /api/push/unsubscribe — remove a push subscription (auth required)
router.delete('/unsubscribe', protect, async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ message: 'Endpoint is required' });
    }

    await removePushSubscription(req.user._id, endpoint);
    res.json({ message: 'Push subscription removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove subscription', error: error.message });
  }
});

export default router;
