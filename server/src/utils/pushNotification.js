/**
 * Web Push Notification Utility
 * Sends push notifications to subscribed users via the Web Push API.
 * Uses VAPID keys for authentication (free, no paid service needed).
 */
import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

// Configure VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:engineeering.market@gmail.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
  console.log('[Push] VAPID keys configured');
} else {
  console.warn('[Push] VAPID keys not configured — push notifications disabled');
}

/**
 * Send a push notification to a specific user
 * @param {Object} options
 * @param {string} options.userId - Recipient user ID
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body text
 * @param {string} options.icon - Icon URL (optional)
 * @param {string} options.url - URL to open on click (optional)
 * @param {string} options.tag - Notification tag for grouping (optional)
 */
export const sendPushNotification = async ({
  userId,
  title,
  body,
  icon = '/icons/icon-192x192.svg',
  url = '/chat',
  tag = 'chat-message',
}) => {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.log('[Push] VAPID keys not configured, skipping push');
    return;
  }

  try {
    // Find all push subscriptions for this user
    const subscriptions = await PushSubscription.find({ user: userId });

    if (subscriptions.length === 0) {
      console.log(`[Push] No subscriptions found for user ${userId}`);
      return;
    }

    const payload = JSON.stringify({
      title,
      body,
      icon,
      url,
      tag,
      timestamp: Date.now(),
    });

    // Send to all subscriptions (user may have multiple devices)
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          return { success: true, id: sub._id };
        } catch (error) {
          // If subscription is expired/invalid (410 Gone or 404), remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`[Push] Removing expired subscription ${sub._id}`);
            await PushSubscription.findByIdAndDelete(sub._id);
          }
          return { success: false, id: sub._id, error: error.message };
        }
      })
    );

    const sent = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;
    console.log(`[Push] Sent ${sent}/${subscriptions.length} notifications to user ${userId}`);
  } catch (error) {
    console.error('[Push] Failed to send notifications:', error.message);
  }
};

/**
 * Save or update a push subscription for a user
 * @param {string} userId - User ID
 * @param {Object} subscription - Push subscription object from the browser
 */
export const savePushSubscription = async (userId, subscription) => {
  try {
    // Check if this exact subscription already exists
    const existing = await PushSubscription.findOne({
      user: userId,
      'subscription.endpoint': subscription.endpoint,
    });

    if (existing) {
      // Update the existing subscription (keys may have changed)
      existing.subscription = subscription;
      await existing.save();
      console.log(`[Push] Updated subscription for user ${userId}`);
      return existing;
    }

    // Create new subscription
    const newSub = new PushSubscription({
      user: userId,
      subscription,
    });
    await newSub.save();
    console.log(`[Push] Saved new subscription for user ${userId}`);
    return newSub;
  } catch (error) {
    console.error('[Push] Failed to save subscription:', error.message);
    throw error;
  }
};

/**
 * Remove a push subscription
 * @param {string} userId - User ID
 * @param {string} endpoint - Subscription endpoint URL
 */
export const removePushSubscription = async (userId, endpoint) => {
  try {
    const result = await PushSubscription.findOneAndDelete({
      user: userId,
      'subscription.endpoint': endpoint,
    });
    if (result) {
      console.log(`[Push] Removed subscription for user ${userId}`);
    }
    return result;
  } catch (error) {
    console.error('[Push] Failed to remove subscription:', error.message);
    throw error;
  }
};

export default sendPushNotification;
