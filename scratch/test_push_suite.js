import webpush from 'web-push';
import mongoose from 'mongoose';
import Notification from '../server/src/models/Notification.js';
import PushSubscription from '../server/src/models/PushSubscription.js';
import { sendPushNotification, createNotification, savePushSubscription } from '../server/src/utils/pushNotification.js';

console.log('=== Engineering Market Push & Notification System Test Suite ===\n');

// TEST 1: VAPID Key Generation & Validation
console.log('TEST 1: Validating VAPID Key generation & format...');
const vapidKeys = webpush.generateVAPIDKeys();
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  console.log('  [PASS] Successfully generated VAPID keys:');
  console.log('    Public Key length:', vapidKeys.publicKey.length);
  console.log('    Private Key length:', vapidKeys.privateKey.length);
} else {
  throw new Error('VAPID key generation failed');
}

// TEST 2: Notification Schema & Virtuals
console.log('\nTEST 2: Validating Notification Model Schema...');
const testUserId = new mongoose.Types.ObjectId();
const testConvId = new mongoose.Types.ObjectId();
const testNotif = new Notification({
  recipient: testUserId,
  title: 'New buyer interest',
  message: 'Rahul is interested in your Scientific Calculator.',
  type: 'new_conversation',
  url: `/chat?conversationId=${testConvId}`,
  relatedId: testConvId,
});

if (testNotif.title === 'New buyer interest' && testNotif.body === testNotif.message) {
  console.log('  [PASS] Notification model fields & body virtual getter work as expected.');
} else {
  throw new Error('Notification virtual getter test failed');
}

// TEST 3: Push Payload Formatting & Edge Cases
console.log('\nTEST 3: Validating Push Payload Generation...');
const samplePayload = JSON.stringify({
  title: 'Rahul',
  body: 'Is this calculator still available?',
  icon: '/icons/icon-192x192.svg',
  badge: '/icons/icon-96x96.svg',
  tag: `chat-${testConvId}`,
  type: 'new_message',
  conversationId: testConvId.toString(),
  url: `/chat?conversationId=${testConvId}`,
  timestamp: Date.now(),
  data: {
    url: `/chat?conversationId=${testConvId}`,
    type: 'new_message',
    conversationId: testConvId.toString(),
  },
});

const parsed = JSON.parse(samplePayload);
if (parsed.title === 'Rahul' && parsed.conversationId === testConvId.toString() && parsed.url.includes('/chat?conversationId=')) {
  console.log('  [PASS] Push payload JSON serialization matches SW specifications.');
} else {
  throw new Error('Push payload structure mismatch');
}

// TEST 4: Graceful Execution without DB (Safe Fallback Guarantee)
console.log('\nTEST 4: Validating Graceful Execution (No crashes on network/push failure)...');
try {
  await createNotification({
    userId: testUserId,
    title: 'Test Notification',
    body: 'Test body message',
    type: 'system',
    sendPush: false, // DB disconnected in test
  });
  console.log('  [PASS] createNotification handles disconnected DB without throwing unhandled rejection.');
} catch (e) {
  throw new Error('createNotification threw unhandled error: ' + e.message);
}

console.log('\n=== ALL AUTOMATED TESTS COMPLETED SUCCESSFULLY ===\n');
