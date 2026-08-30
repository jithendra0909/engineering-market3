/**
 * Server-side image optimization utility for Open Graph / social preview images.
 *
 * For Cloudinary URLs, injects transformation parameters optimized for
 * WhatsApp / Facebook / Twitter / LinkedIn preview cards:
 *   - f_jpg   → Force JPEG (most reliable format for social scrapers)
 *   - q_auto  → Automatic quality compression
 *   - w_1200  → 1200px wide (OG standard)
 *   - h_630   → 630px tall (OG standard)
 *   - c_fill  → Crop-fill to exact dimensions (no letterboxing)
 *
 * Returns the original URL unchanged for non-Cloudinary images.
 *
 * @param {string} url - Raw Cloudinary image URL from the database
 * @returns {string} Optimized image URL suitable for og:image tags
 */
export const getOptimizedOgImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return url || '';
  }

  // Only transform Cloudinary URLs with the /upload/ path
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  // Don't double-transform if already optimized
  if (url.includes('/upload/f_') || url.includes('/upload/w_') || url.includes('/upload/q_')) {
    return url;
  }

  const ogTransforms = 'f_jpg,q_auto,w_1200,h_630,c_fill';
  return url.replace('/upload/', `/upload/${ogTransforms}/`);
};

export default getOptimizedOgImageUrl;
