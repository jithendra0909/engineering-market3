/**
 * Generates a URL-safe kebab-case slug from a title
 * Example: "Casio FX-991EX Scientific Calculator!" -> "casio-fx-991ex-scientific-calculator"
 */
export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-')     // Replace spaces, underscores, multiple hyphens with single -
    .replace(/^-+|-+$/g, '');     // Trim leading/trailing hyphens
};
