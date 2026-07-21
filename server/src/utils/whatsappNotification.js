/**
 * Send an automated WhatsApp notification to a user using Meta WhatsApp Cloud API.
 * 
 * @param {Object} params
 * @param {string} params.recipientPhone - Recipient's phone/WhatsApp number
 * @param {string} params.recipientName - Recipient's full name
 * @param {string} params.itemTitle - Title of the listing being inquired about
 * @param {string} [params.customMessage] - Fallback message text if template isn't configured
 */
export const sendWhatsAppNotification = async ({ recipientPhone, recipientName, itemTitle, chatUrl, customMessage }) => {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'new_message_alert';

  // Sanitize and format phone number (defaults to India country code +91 for 10-digit numbers)
  let cleanPhone = (recipientPhone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  if (!cleanPhone) {
    console.warn('[WhatsApp Notification] Warning: No valid recipient phone number provided.');
    return;
  }

  // Graceful fallback when API keys are not yet configured in environment variables
  if (!phoneNumberId || !accessToken || phoneNumberId === 'your_whatsapp_phone_number_id') {
    console.log(`[WhatsApp Notification Log - Simulated] Notification for ${recipientName} (${cleanPhone}):`);
    console.log(`> "🔔 Hi ${recipientName}! You have a new buyer message for your item '${itemTitle}' on Engineering Market."`);
    console.log(`> Add WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to server/.env to send real WhatsApp messages.`);
    return;
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    
    const isHelloWorld = templateName === 'hello_world';
    const langCode = process.env.WHATSAPP_TEMPLATE_LANG || (isHelloWorld ? 'en_US' : 'en');

    const templateObj = {
      name: templateName,
      language: { code: langCode }
    };

    if (!isHelloWorld) {
      templateObj.components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: recipientName || 'Seller' },
            { type: 'text', text: itemTitle || 'your listing' },
            { type: 'text', text: chatUrl || 'https://engineeringmarket.vercel.app/chat' }
          ]
        }
      ];
    }

    // Template payload structure
    const payload = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: templateObj
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp Notification] Error sending message via Meta API:', data);
    } else {
      console.log(`[WhatsApp Notification] Successfully sent notification to ${cleanPhone} (Message ID: ${data.messages?.[0]?.id})`);
    }
  } catch (error) {
    console.error('[WhatsApp Notification] Network/Server Error:', error.message);
  }
};
