/**
 * Push Subscription Utility
 * Handles requesting notification permission, subscribing to web push,
 * sync with server, and safe graceful cleanup.
 */
import api from '../api/axios';

let isSubscribing = false;

/**
 * Convert a base64 URL-encoded string to a Uint8Array
 * (required for PushManager.subscribe applicationServerKey)
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
 * Subscribe the user to push notifications after authentication
 * 1. Verify browser and service worker push support
 * 2. Check permission state (granted -> silent ensure, default -> prompt, denied -> quiet exit)
 * 3. Obtain subscription and send to server
 *
 * @returns {Promise<boolean>} true if subscribed or synced successfully
 */
export async function subscribeToPush() {
  if (typeof window === 'undefined') return false;

  // Verify browser capability
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    console.log('[Push] Push notifications not supported in this browser');
    return false;
  }

  // Prevent concurrent duplicate subscription triggers (e.g. React StrictMode)
  if (isSubscribing) {
    return false;
  }

  // If user previously denied, do not repeatedly nag or trigger prompt
  if (Notification.permission === 'denied') {
    console.log('[Push] Notification permission denied by user settings');
    return false;
  }

  isSubscribing = true;

  try {
    let permission = Notification.permission;

    // If permission is default, request it once
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      console.log('[Push] Notification permission not granted:', permission);
      return false;
    }

    // Wait for the active service worker registration
    const registration = await navigator.serviceWorker.ready;
    if (!registration || !registration.pushManager) {
      console.log('[Push] Service worker push manager not ready');
      return false;
    }

    // Check if browser already has an active push subscription
    let subscription = await registration.pushManager.getSubscription();

    // If no existing subscription, register with VAPID key
    if (!subscription) {
      const { data } = await api.get('/push/vapid-public-key');
      const vapidPublicKey = data?.publicKey;

      if (!vapidPublicKey) {
        console.warn('[Push] VAPID public key unavailable from server');
        return false;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    // Sync subscription with server for the logged-in user
    if (subscription) {
      await sendSubscriptionToServer(subscription);
      console.log('[Push] Push subscription active and synced with server');
      return true;
    }

    return false;
  } catch (error) {
    console.warn('[Push] Push subscription setup handled gracefully:', error?.message || error);
    return false;
  } finally {
    isSubscribing = false;
  }
}

/**
 * Unsubscribe from push notifications on logout or settings change
 */
export async function unsubscribeFromPush() {
  if (typeof window === 'undefined') return;

  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const registration = await navigator.serviceWorker.ready;
    if (!registration || !registration.pushManager) return;

    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Remove endpoint from backend for this user
      try {
        await api.delete('/push/unsubscribe', {
          data: { endpoint: subscription.endpoint },
        });
      } catch (err) {
        console.warn('[Push] Server unsubscribe warning:', err?.message || err);
      }

      // Unsubscribe locally
      await subscription.unsubscribe();
      console.log('[Push] Successfully unsubscribed from push notifications');
    }
  } catch (error) {
    console.warn('[Push] Unsubscribe handled gracefully:', error?.message || error);
  }
}

/**
 * Send a push subscription to the server
 */
async function sendSubscriptionToServer(subscription) {
  try {
    const subJson = subscription.toJSON ? subscription.toJSON() : subscription;
    await api.post('/push/subscribe', {
      subscription: subJson,
    });
  } catch (error) {
    console.warn('[Push] Failed to send subscription to server:', error?.message || error);
  }
}

export default subscribeToPush;
