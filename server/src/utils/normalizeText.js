export const normalizeText = (text) => {

  if (!text) return "";

  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")          // Remove all spaces
    .replace(/[^\w]/g, "")        // Remove punctuation/special characters
    .normalize("NFKD");           // Normalize Unicode characters

};