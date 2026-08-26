/**
 * Utility to optimize image URLs on the client.
 * For Cloudinary URLs, injects dynamic auto-format, auto-quality, and resizing parameters.
 *
 * @param {string} url - Original image URL
 * @param {object} options - Transformation options
 * @param {number} [options.width] - Target max width in pixels
 * @param {string} [options.quality='auto'] - Compression quality ('auto', 'eco', 'good', 'best', or 1-100)
 * @param {string} [options.format='auto'] - Target format ('auto', 'webp', 'avif', 'jpg')
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') {
    return '/images/placeholder.jpg';
  }

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  const { width, quality = 'auto', format = 'auto' } = options;

  // Build transformation params
  const transforms = [`f_${format}`, `q_${quality}`];
  if (width && typeof width === 'number') {
    transforms.push(`w_${width}`, 'c_limit');
  }

  const transformString = transforms.join(',');

  // If already transformed with /upload/..., avoid duplicating
  if (url.includes('/upload/f_') || url.includes('/upload/w_') || url.includes('/upload/q_')) {
    return url;
  }

  return url.replace('/upload/', `/upload/${transformString}/`);
};

export default getOptimizedImageUrl;
