/**
 * Centralized Push & In-App Notification Utility
 * Handles Web Push delivery via VAPID, multi-device subscriptions,
 * dead subscription cleanup, and synchronized in-app Notification records.
 */
import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';
import Notification from '../models/Notification.js';

// Configure VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:engineering.market@gmail.com';

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
    console.log('[Push] Web Push VAPID keys configured successfully');
  } catch (err) {
    console.error('[Push] Failed to initialize VAPID details:', err.message);
  }
} else {
  console.warn('[Push] VAPID keys not configured — browser push notifications disabled');
}

/**
 * Send a web push notification to all active devices of a specific user
 *
 * @param {Object} options
 * @param {string|mongoose.Types.ObjectId} options.userId - Recipient user ID
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body preview
 * @param {string} [options.icon] - Icon URL
 * @param {string} [options.badge] - Badge icon URL
 * @param {string} [options.url] - Target URL to open on click
 * @param {string} [options.tag] - Notification tag for device grouping
 * @param {string} [options.type] - Notification category / event type
 * @param {string} [options.conversationId] - Related chat conversation ID
 * @param {string} [options.listingId] - Related marketplace listing ID
 * @param {Object} [options.data] - Additional metadata for the service worker
 * @returns {Promise<{success: boolean, sentCount: number}>}
 */
export const sendPushNotification = async ({
  userId,
  title,
  body,
  icon = '/icons/icon-192x192.svg',
  badge = '/icons/icon-96x96.svg',
  url = '/notifications',
  tag,
  type = 'system',
  conversationId,
  listingId,
  data = {},
}) => {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.log('[Push] VAPID keys not configured, skipping browser push dispatch');
    return { success: false, sentCount: 0 };
  }

  if (!userId) {
    console.warn('[Push] sendPushNotification called without userId');
    return { success: false, sentCount: 0 };
  }

  try {
    // Find all push subscriptions across all devices for this user
    const subscriptions = await PushSubscription.find({ user: userId });

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`[Push] No push subscriptions found for user ${userId}`);
      return { success: true, sentCount: 0 };
    }

    const payload = JSON.stringify({
      title: title || 'Engineering Market',
      body: body || '',
      icon: icon || '/icons/icon-192x192.svg',
      badge: badge || '/icons/icon-96x96.svg',
      url: url || '/notifications',
      tag: tag || type || 'em-notification',
      type: type || 'system',
      conversationId: conversationId ? conversationId.toString() : undefined,
      listingId: listingId ? listingId.toString() : undefined,
      timestamp: Date.now(),
      data: {
        url: url || '/notifications',
        type: type || 'system',
        conversationId: conversationId ? conversationId.toString() : undefined,
        listingId: listingId ? listingId.toString() : undefined,
        timestamp: Date.now(),
        ...data,
      },
    });

    // Send to all active subscriptions in parallel without failing on single device error
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          return { success: true, id: sub._id };
        } catch (error) {
          // If subscription is expired or unregistered (HTTP 404 or 410), delete from DB
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`[Push] Pruning expired subscription ${sub._id} (${error.statusCode})`);
            await PushSubscription.findByIdAndDelete(sub._id).catch(() => {});
          }
          return { success: false, id: sub._id, error: error.message };
        }
      })
    );

    const sentCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;

    console.log(`[Push] Sent ${sentCount}/${subscriptions.length} push notification(s) to user ${userId}`);
    return { success: true, sentCount };
  } catch (error) {
    console.error('[Push] Failed to dispatch push notification:', error.message);
    return { success: false, sentCount: 0, error: error.message };
  }
};

/**
 * Centralized Notification Function
 * Persists an in-app Notification record AND optionally sends a Web Push notification.
 * Safe asynchronous execution: Never throws or interrupts core marketplace features.
 *
 * @param {Object} options
 * @param {string|mongoose.Types.ObjectId} options.userId - Recipient user ID (alias: recipient)
 * @param {string|mongoose.Types.ObjectId} [options.recipient] - Recipient user ID
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body/message text
 * @param {string} [options.message] - Notification message alias
 * @param {string} [options.type='system'] - Event type ('new_message', 'new_conversation', 'new_listing', 'profile_verified', etc.)
 * @param {string} [options.url] - Destination URL to navigate on click
 * @param {string} [options.tag] - Notification tag
 * @param {string} [options.conversationId] - Related conversation ID
 * @param {string} [options.listingId] - Related listing ID
 * @param {boolean} [options.sendPush=true] - Whether to also dispatch a push notification
 * @param {Object} [options.data] - Extra data payload
 * @returns {Promise<Object|null>} Saved in-app notification document
 */
export const createNotification = async ({
  userId,
  recipient,
  title,
  body,
  message,
  type = 'system',
  url = '',
  tag,
  conversationId,
  listingId,
  sendPush = true,
  data = {},
}) => {
  const targetUserId = userId || recipient;
  const contentText = body || message || '';

  if (!targetUserId || !title) {
    console.warn('[Notification] createNotification called without valid targetUserId or title');
    return null;
  }

  let inAppNotification = null;

  // 1. Create in-app notification record in MongoDB
  try {
    inAppNotification = await Notification.create({
      recipient: targetUserId,
      title,
      message: contentText,
      type,
      url: url || '',
      relatedId: conversationId || listingId || null,
      isRead: false,
    });
  } catch (dbErr) {
    console.error('[Notification] Error saving in-app notification:', dbErr.message);
  }

  // 2. Dispatch browser push notification asynchronously
  if (sendPush !== false) {
    sendPushNotification({
      userId: targetUserId,
      title,
      body: contentText,
      type,
      url,
      tag: tag || type || 'em-notification',
      conversationId,
      listingId,
      data,
    }).catch((pushErr) => {
      console.error('[Notification] Push dispatch error:', pushErr.message);
    });
  }

  return inAppNotification;
};

/**
 * Send notification to multiple users (e.g. for new listing alerts or announcements)
 *
 * @param {Object} options
 * @param {Array<string|mongoose.Types.ObjectId>} options.userIds - Array of recipient user IDs
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {string} [options.message] - Notification message alias
 * @param {string} [options.type='system'] - Notification type
 * @param {string} [options.url] - Destination URL
 * @param {string} [options.listingId] - Related listing ID
 * @param {string} [options.conversationId] - Related conversation ID
 * @param {boolean} [options.sendPush=true] - Whether to send push notifications
 * @param {Object} [options.data] - Extra data
 */
export const sendNotificationToMultipleUsers = async ({
  userIds = [],
  title,
  body,
  message,
  type = 'system',
  url = '',
  tag,
  listingId,
  conversationId,
  sendPush = true,
  data = {},
}) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return;

  const contentText = body || message || '';

  // 1. Bulk insert in-app notifications
  try {
    const docs = userIds.map((uId) => ({
      recipient: uId,
      title,
      message: contentText,
      type,
      url: url || '',
      relatedId: listingId || conversationId || null,
      isRead: false,
    }));
    await Notification.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error('[Notification] Batch in-app insert error:', err.message);
  }

  // 2. Dispatch push notifications to all recipients in parallel
  if (sendPush !== false) {
    Promise.allSettled(
      userIds.map((uId) =>
        sendPushNotification({
          userId: uId,
          title,
          body: contentText,
          type,
          url,
          tag: tag || type || 'em-notification',
          listingId,
          conversationId,
          data,
        })
      )
    ).catch((err) => {
      console.error('[Notification] Batch push dispatch error:', err.message);
    });
  }
};

/**
 * Save or update a push subscription for a user
 * Ensures each device/endpoint is unique and avoids duplicates
 *
 * @param {string|mongoose.Types.ObjectId} userId - Authenticated user ID
 * @param {Object} subscription - Push subscription object from PushManager
 */
export const savePushSubscription = async (userId, subscription) => {
  if (!userId || !subscription?.endpoint || !subscription?.keys) {
    throw new Error('Invalid userId or subscription payload');
  }

  try {
    // Check if this exact subscription endpoint already exists for the user
    const existing = await PushSubscription.findOne({
      user: userId,
      'subscription.endpoint': subscription.endpoint,
    });

    if (existing) {
      existing.subscription = subscription;
      await existing.save();
      console.log(`[Push] Updated existing subscription for user ${userId}`);
      return existing;
    }

    // Save as a new device subscription
    const newSub = new PushSubscription({
      user: userId,
      subscription,
    });
    await newSub.save();
    console.log(`[Push] Registered new subscription for user ${userId}`);
    return newSub;
  } catch (error) {
    // Handle duplicate key error gracefully
    if (error.code === 11000) {
      console.log(`[Push] Subscription already recorded for user ${userId}`);
      return await PushSubscription.findOne({
        user: userId,
        'subscription.endpoint': subscription.endpoint,
      });
    }
    console.error('[Push] Failed to save subscription:', error.message);
    throw error;
  }
};

/**
 * Remove a push subscription for a user device
 *
 * @param {string|mongoose.Types.ObjectId} userId - Authenticated user ID
 * @param {string} endpoint - Subscription endpoint URL
 */
export const removePushSubscription = async (userId, endpoint) => {
  if (!userId || !endpoint) {
    throw new Error('UserId and endpoint are required');
  }

  try {
    const result = await PushSubscription.findOneAndDelete({
      user: userId,
      'subscription.endpoint': endpoint,
    });
    if (result) {
      console.log(`[Push] Removed subscription endpoint for user ${userId}`);
    }
    return result;
  } catch (error) {
    console.error('[Push] Failed to remove subscription:', error.message);
    throw error;
  }
};

export default sendPushNotification;
