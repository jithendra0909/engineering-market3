import { distance } from "fastest-levenshtein";
import { normalizeText } from "./normalizeText.js";

export const isFuzzyMatch = (text1, text2, threshold = 0.90) => {

  const normalized1 = normalizeText(text1 || "");
  const normalized2 = normalizeText(text2 || "");

  if (!normalized1 || !normalized2) {
    return {
      matched: false,
      similarity: 0,
    };
  }

  const maxLength = Math.max(normalized1.length, normalized2.length);

  const similarity =
    maxLength === 0
      ? 1
      : 1 - distance(normalized1, normalized2) / maxLength;

  return {
    matched: similarity >= threshold,
    similarity,
  };
};