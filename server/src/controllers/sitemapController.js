import Listing from '../models/Listing.js';
import GiftProduct from '../models/GiftProduct.js';

// XML entity escaping helper
const escapeXml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe.toString().replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

/**
 * @desc    Generate dynamic XML sitemap
 * @route   GET /api/sitemap.xml or GET /sitemap.xml
 * @access  Public
 */
export const getSitemapXml = async (req, res) => {
  try {
    // Determine current protocol & host for absolute canonical URLs
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = process.env.CLIENT_URL
      ? process.env.CLIENT_URL.replace(/\/$/, '')
      : `${proto}://${host}`;

    // Static crawlable pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/general-market', priority: '0.9', changefreq: 'daily' },
      { url: '/vendors', priority: '0.7', changefreq: 'weekly' },
      { url: '/vendors/gift-studio', priority: '0.7', changefreq: 'weekly' },
      { url: '/gift-studio/products', priority: '0.8', changefreq: 'daily' },
    ];

    // Fetch active general market listings (NEVER include private college-market listings)
    const listings = await Listing.find({
      marketType: 'general',
      status: 'available',
    })
      .select('_id title slug updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    // Fetch active gift products
    const giftProducts = await GiftProduct.find({
      isActive: true,
    })
      .select('_id title slug updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Add static pages
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${baseUrl}${page.url}`)}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // 2. Add dynamic general listings
    for (const item of listings) {
      const date = item.updatedAt || item.createdAt || new Date();
      const lastmod = new Date(date).toISOString().split('T')[0];
      const slugPath = item.slug ? `/${item.slug}` : '';
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${baseUrl}/listing/${item._id}${slugPath}`)}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    // 3. Add dynamic gift products
    for (const item of giftProducts) {
      const date = item.updatedAt || item.createdAt || new Date();
      const lastmod = new Date(date).toISOString().split('T')[0];
      const slugPath = item.slug ? `/${item.slug}` : '';
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${baseUrl}/gift-studio/product/${item._id}${slugPath}`)}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=1800, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
};
