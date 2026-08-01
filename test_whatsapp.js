// Quick WhatsApp API test - no dependencies needed
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env manually
const envContent = fs.readFileSync(path.join(__dirname, 'server', '.env'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      envVars[trimmed.substring(0, eqIdx)] = trimmed.substring(eqIdx + 1);
    }
  }
});

const phoneNumberId = envVars.WHATSAPP_PHONE_NUMBER_ID;
const accessToken = envVars.WHATSAPP_ACCESS_TOKEN;
const templateName = envVars.WHATSAPP_TEMPLATE_NAME;

console.log('=== WhatsApp API Test ===');
console.log('Phone Number ID:', phoneNumberId);
console.log('Token (first 20 chars):', accessToken ? accessToken.substring(0, 20) + '...' : 'MISSING');
console.log('Template Name:', templateName);
console.log('');

const testPhone = '919032906509';

const url = 'https://graph.facebook.com/v19.0/' + phoneNumberId + '/messages';

const payload = {
  messaging_product: 'whatsapp',
  to: testPhone,
  type: 'template',
  template: {
    name: templateName,
    language: { code: 'en' },
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: 'Test User' },
          { type: 'text', text: 'Test Listing Item' },
          { type: 'text', text: 'https://engineering-market.vercel.app' }
        ]
      }
    ]
  }
};

console.log('Sending to:', url);
console.log('');

try {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('ERROR (HTTP ' + response.status + '):');
    console.error('  Type:', data.error?.type || 'unknown');
    console.error('  Code:', data.error?.code || 'unknown');
    console.error('  Subcode:', data.error?.error_subcode || 'none');
    console.error('  Message:', data.error?.message || JSON.stringify(data));
    if (data.error?.error_data?.details) {
      console.error('  Details:', data.error.error_data.details);
    }
    console.error('');
    console.error('Full response:', JSON.stringify(data, null, 2));
  } else {
    console.log('SUCCESS! Message sent!');
    console.log('  Message ID:', data.messages?.[0]?.id);
    console.log('Full response:', JSON.stringify(data, null, 2));
  }
} catch (error) {
  console.error('Network Error:', error.message);
}
