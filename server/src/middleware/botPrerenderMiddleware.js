import Listing from '../models/Listing.js';
import GiftProduct from '../models/GiftProduct.js';
import connectDB from '../config/db.js';

// List of known social & search crawler user-agent substrings
const BOT_USER_AGENT_REGEX = /(WhatsApp|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Googlebot|bingbot|Applebot|Discordbot|SkypeUriPreview|YandexBot|DuckDuckBot)/i;

// HTML escape helper
const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe.toString().replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&#39;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

/**
 * Generate a pre-rendered HTML page with rich Open Graph / Twitter card tags
 * and a client-side redirect fallback for browsers.
 */
const renderOgHtml = ({ title, description, image, url, type = 'website' }) => {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeUrl = escapeHtml(url);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${safeTitle}</title>
    <meta name="title" content="${safeTitle}" />
    <meta name="description" content="${safeDesc}" />

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="Engineering Market" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${safeUrl}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />

    <!-- Fallback redirect for human visitors hitting preview endpoint -->
    <meta http-equiv="refresh" content="0;url=${safeUrl}" />
    <script type="text/javascript">
      window.location.replace("${safeUrl}");
    </script>
  </head>
  <body style="font-family: system-ui, sans-serif; background: #0a0a0f; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
    <div style="text-align: center; padding: 2rem;">
      <h2>${safeTitle}</h2>
      <p style="color: #9CA3AF;">Loading Engineering Market...</p>
      <p><a href="${safeUrl}" style="color: #6C4EFF;">Click here if not redirected automatically</a></p>
    </div>
  </body>
</html>`;
};

/**
 * Middleware: Detects crawlers and pre-renders dynamic Open Graph HTML
 * for shareable routes (/listing/:id, /gift-studio/product/:id).
 */
export const botPrerenderMiddleware = async (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';

  // Only intercept if user-agent is a known crawler / preview scraper
  if (!BOT_USER_AGENT_REGEX.test(userAgent)) {
    return next();
  }

  // Check path patterns
  const urlPath = req.path || req.url;
  const listingMatch = urlPath.match(/^\/listing\/([a-f\d]{24})(?:\/[^\s?]*)?/i);
  const giftMatch = urlPath.match(/^\/gift-studio\/product\/([a-f\d]{24})(?:\/[^\s?]*)?/i);

  if (!listingMatch && !giftMatch) {
    return next();
  }

  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.replace(/\/$/, '')
    : `${proto}://${host}`;

  const defaultBanner = `${baseUrl}/images/em_gift_studio_hero_banner.png`;

  try {
    await connectDB();

    // 1. Listing Bot Preview
    if (listingMatch) {
      const listingId = listingMatch[1];
      const listing = await Listing.findById(listingId).lean();

      if (!listing || listing.status === 'removed' || listing.marketType === 'college') {
        // Fallback for private college listing or not found
        const fallbackHtml = renderOgHtml({
          title: 'Engineering Market — Student Campus Marketplace',
          description: 'Buy, sell, and donate engineering essentials within your college community.',
          image: defaultBanner,
          url: `${baseUrl}/listing/${listingId}`,
        });
        res.header('Content-Type', 'text/html; charset=utf-8');
        return res.send(fallbackHtml);
      }

      const priceStr = listing.listingType === 'donate' ? 'Free / Donation' : `₹${listing.price}`;
      const title = `${listing.title} — ${priceStr} | Engineering Market`;
      const descSnippet = listing.description
        ? listing.description.slice(0, 150) + (listing.description.length > 150 ? '...' : '')
        : 'Available on Engineering Market';
      const description = `${descSnippet} — Condition: ${listing.condition || 'Good'} · Campus Marketplace`;
      const image = (listing.images && listing.images.length > 0) ? listing.images[0] : defaultBanner;
      const canonicalUrl = `${baseUrl}/listing/${listing._id}${listing.slug ? '/' + listing.slug : ''}`;

      const html = renderOgHtml({
        title,
        description,
        image,
        url: canonicalUrl,
        type: 'product',
      });

      res.header('Content-Type', 'text/html; charset=utf-8');
      res.header('Cache-Control', 'public, max-age=600');
      return res.send(html);
    }

    // 2. Gift Studio Product Bot Preview
    if (giftMatch) {
      const productId = giftMatch[1];
      const product = await GiftProduct.findById(productId).lean();

      if (!product || !product.isActive) {
        const fallbackHtml = renderOgHtml({
          title: 'EM Gift Studio — Personalized Photo Frames & Gifts',
          description: 'Custom photo frames, personalized gifts, and campus creations on Engineering Market.',
          image: defaultBanner,
          url: `${baseUrl}/gift-studio/product/${productId}`,
        });
        res.header('Content-Type', 'text/html; charset=utf-8');
        return res.send(fallbackHtml);
      }

      let discountText = '';
      if (product.mrpPrice && product.mrpPrice > product.basePrice) {
        const discountPct = Math.round(((product.mrpPrice - product.basePrice) / product.mrpPrice) * 100);
        discountText = `${discountPct}% OFF (was ₹${product.mrpPrice}, now ₹${product.basePrice}) — `;
      }

      const title = `${product.title} — ₹${product.basePrice} | EM Gift Studio`;
      const descSnippet = product.description
        ? product.description.slice(0, 140) + (product.description.length > 140 ? '...' : '')
        : 'Personalized gift crafted for students.';
      const description = `${discountText}${descSnippet}`;
      const image = (product.images && product.images.length > 0) ? product.images[0] : defaultBanner;
      const canonicalUrl = `${baseUrl}/gift-studio/product/${product._id}${product.slug ? '/' + product.slug : ''}`;

      const html = renderOgHtml({
        title,
        description,
        image,
        url: canonicalUrl,
        type: 'product',
      });

      res.header('Content-Type', 'text/html; charset=utf-8');
      res.header('Cache-Control', 'public, max-age=600');
      return res.send(html);
    }
  } catch (err) {
    console.error('Error pre-rendering bot preview:', err);
    return next();
  }
};
