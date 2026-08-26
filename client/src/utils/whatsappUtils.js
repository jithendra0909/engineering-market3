/**
 * WhatsApp Integration Utilities for EM Gift Studio
 * 
 * Centralized WhatsApp business number and message generation.
 * All WhatsApp links use this single source of truth.
 */

// ─── SINGLE SOURCE OF TRUTH FOR BUSINESS WHATSAPP NUMBER ───
export const BUSINESS_WHATSAPP_NUMBER = '919391461855';

/**
 * Generate a WhatsApp message for a single Buy Now item.
 */
export function generateBuyNowMessage(item) {
  const lines = [
    `Hello EM Gift Studio! 👋`,
    ``,
    `I would like to order this customized frame:`,
    ``,
    `• Product: ${item.productName}`,
    `• Size: ${item.frameSize}`,
    `• Quantity: ${item.quantity}`,
    `• Price: ₹${item.unitPrice * item.quantity}`,
    ``,
    `I would like to share my photo and customization requirements here on WhatsApp.`,
    ``,
    `Please confirm the availability and customization details.`,
    ``,
    `Thank you!`,
    `Engineering Market`
  ];

  return lines.join('\n');
}

/**
 * Generate a WhatsApp message for the entire cart.
 */
export function generateCartMessage(items, total) {
  const lines = [
    `Hello EM Gift Studio! 👋`,
    ``,
    `I would like to order the following customized items:`,
    ``,
  ];

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.productName}`);
    lines.push(`   Size: ${item.frameSize}`);
    lines.push(`   Quantity: ${item.quantity}`);
    lines.push(`   Unit Price: ₹${item.unitPrice} (Subtotal: ₹${item.unitPrice * item.quantity})`);
    lines.push(``);
  });

  lines.push(
    `Total: ₹${total}`,
    ``,
    `I will share the photos and customization details for these items here.`,
    ``,
    `Please confirm availability and the final customization details.`,
    ``,
    `Thank you!`,
    `Engineering Market`
  );

  return lines.join('\n');
}

/**
 * Generate a WhatsApp message for customizing a Gift Studio product.
 * Used on the product detail page "Customize on WhatsApp" CTA.
 */
export function generateCustomizeMessage(product, selectedSize) {
  const productUrl = `${window.location.origin}/gift-studio/product/${product._id}`;
  const finalPrice = selectedSize
    ? product.basePrice + (selectedSize.priceModifier || 0)
    : product.basePrice;

  const lines = [
    `Hello EM Gift Studio! 👋`,
    ``,
    `I'd like to customize this product:`,
    ``,
    `• Product: ${product.title}`,
    `• Category: ${product.category}`,
  ];

  if (selectedSize) {
    lines.push(`• Size: ${selectedSize.label}`);
  }

  lines.push(
    `• Price: ₹${finalPrice}`,
    ``,
    `Product link: ${productUrl}`,
    ``,
    `I'll share my photos and customization details here on WhatsApp.`,
    ``,
    `Thank you!`,
    `Engineering Market`
  );

  return lines.join('\n');
}

/**
 * Open WhatsApp with a pre-filled message.
 * Uses the official wa.me click-to-chat mechanism.
 */
export function openWhatsApp(message) {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

