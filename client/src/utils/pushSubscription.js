/**
 * Push Subscription Utility
 * Handles requesting notification permission, subscribing to push,
 * and sending the subscription to the server.
 */
import api from '../api/axios';

/**
 * Convert a base64 URL-encoded string to a Uint8Array
 * (needed for applicationServerKey)
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe the user to push notifications
 * 1. Check browser support
 * 2. Request permission
 * 3. Get VAPID public key from server
 * 4. Subscribe via service worker
 * 5. Send subscription to server
 * 
 * @returns {boolean} true if subscribed successfully
 */
export async function subscribeToPush() {
  try {
    // Check if push is supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('[Push] Push notifications not supported in this browser');
      return false;
    }

    // Check/request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[Push] Notification permission denied');
      return false;
    }

    // Get the service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      // Send to server in case it's a new device/session
      await sendSubscriptionToServer(existingSubscription);
      console.log('[Push] Already subscribed, updated server');
      return true;
    }

    // Get VAPID public key from server
    const { data } = await api.get('/push/vapid-public-key');
    const vapidPublicKey = data.publicKey;

    if (!vapidPublicKey) {
      console.log('[Push] No VAPID key available from server');
      return false;
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Send subscription to server
    await sendSubscriptionToServer(subscription);
    console.log('[Push] Successfully subscribed to push notifications');
    return true;
  } catch (error) {
    console.error('[Push] Failed to subscribe:', error);
    return false;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Remove from server
      await api.delete('/push/unsubscribe', {
        data: { endpoint: subscription.endpoint },
      });

      // Unsubscribe locally
      await subscription.unsubscribe();
      console.log('[Push] Unsubscribed from push notifications');
    }
  } catch (error) {
    console.error('[Push] Failed to unsubscribe:', error);
  }
}

/**
 * Send a push subscription to the server
 */
async function sendSubscriptionToServer(subscription) {
  try {
    await api.post('/push/subscribe', {
      subscription: subscription.toJSON(),
    });
  } catch (error) {
    console.error('[Push] Failed to send subscription to server:', error);
  }
}

export default subscribeToPush;
