/**
 * Email Notification Utility
 * Sends email notifications for new chat messages using Gmail SMTP.
 * Rate-limited: max 1 email per conversation per 5 minutes to avoid spam.
 */
import nodemailer from 'nodemailer';

// In-memory rate limiter: conversationId -> last email timestamp
const emailCooldowns = new Map();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Send a chat message notification email to the recipient
 * @param {Object} options
 * @param {string} options.recipientEmail - Recipient's email
 * @param {string} options.recipientName - Recipient's name
 * @param {string} options.senderName - Name of the person who sent the message
 * @param {string} options.messagePreview - Preview of the message text
 * @param {string} options.itemTitle - Title of the listing
 * @param {string} options.conversationId - Conversation ID (for rate limiting)
 */
export const sendChatEmailNotification = async ({
  recipientEmail,
  recipientName,
  senderName,
  messagePreview,
  itemTitle,
  conversationId,
}) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.log('[Email] SMTP credentials not configured, skipping email notification');
    return;
  }

  // Rate limiting — max 1 email per conversation per 5 minutes
  const lastSent = emailCooldowns.get(conversationId);
  if (lastSent && Date.now() - lastSent < COOLDOWN_MS) {
    console.log(`[Email] Cooldown active for conversation ${conversationId}, skipping`);
    return;
  }

  try {
    const cleanPass = smtpPass.replace(/\s+/g, '');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: cleanPass,
      },
    });

    // Truncate message preview
    const preview = messagePreview.length > 100
      ? messagePreview.substring(0, 100) + '...'
      : messagePreview;

    const clientUrl = process.env.CLIENT_URL || 'https://engineering-market.vercel.app';

    const mailOptions = {
      from: `"Engineering Market" <${smtpUser}>`,
      to: recipientEmail,
      subject: `💬 New message from ${senderName} — Engineering Market`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 0; background-color: #f8f7ff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6C4EFF 0%, #8A72FF 100%); padding: 24px 24px 20px; border-radius: 20px 20px 0 0;">
            <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">
              Engineering Market
            </h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: rgba(255,255,255,0.7);">New Chat Message</p>
          </div>

          <!-- Body -->
          <div style="background-color: #ffffff; padding: 24px; border: 1px solid #E9E6F8; border-top: none;">
            <p style="margin: 0 0 16px; font-size: 14px; color: #374151; line-height: 1.6;">
              Hi <strong>${recipientName}</strong>,
            </p>
            <p style="margin: 0 0 20px; font-size: 14px; color: #374151; line-height: 1.6;">
              <strong>${senderName}</strong> sent you a message about <strong>"${itemTitle}"</strong>:
            </p>

            <!-- Message Preview Card -->
            <div style="background-color: #F4F1FF; border-radius: 12px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #6C4EFF;">
              <p style="margin: 0; font-size: 14px; color: #4B5563; line-height: 1.6; font-style: italic;">
                "${preview}"
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 24px 0;">
              <a href="${clientUrl}/chat" style="display: inline-block; background: linear-gradient(135deg, #6C4EFF 0%, #8A72FF 100%); color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 9999px; font-size: 14px; font-weight: 700; letter-spacing: -0.2px;">
                Reply Now
              </a>
            </div>

            <p style="margin: 0; font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.5;">
              Open the app to view the full conversation and reply.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding: 16px 24px; text-align: center; border-radius: 0 0 20px 20px; background-color: #ffffff; border: 1px solid #E9E6F8; border-top: none;">
            <p style="margin: 0; font-size: 11px; color: #9CA3AF; line-height: 1.5;">
              You're receiving this because someone messaged you on Engineering Market.
              <br />This is an automated notification.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    emailCooldowns.set(conversationId, Date.now());
    console.log(`[Email] Notification sent to ${recipientEmail} for conversation ${conversationId}`);
  } catch (error) {
    console.error('[Email] Failed to send notification:', error.message);
  }
};

export default sendChatEmailNotification;
