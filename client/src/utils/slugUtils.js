/**
 * Generates a URL-safe kebab-case slug from a title string
 */
export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Builds a canonical SEO URL path for a listing
 */
export const getListingUrl = (item) => {
  if (!item || !item._id) return '/general-market';
  const slug = item.slug || slugify(item.title);
  return slug ? `/listing/${item._id}/${slug}` : `/listing/${item._id}`;
};

/**
 * Builds a canonical SEO URL path for a gift product
 */
export const getGiftProductUrl = (item) => {
  if (!item || !item._id) return '/gift-studio/products';
  const slug = item.slug || slugify(item.title);
  return slug ? `/gift-studio/product/${item._id}/${slug}` : `/gift-studio/product/${item._id}`;
};
