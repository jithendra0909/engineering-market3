import { normalizeText } from "./normalizeText.js";
import { isFuzzyMatch } from "./fuzzyMatcher.js";

export const verifyFields = (userData, ocrData) => {

  const result = {
    verified: true,
    nameMatched: false,
    registrationMatched: false,
    errors: []
  };

  // Name
  const nameResult = isFuzzyMatch(
    userData.name,
    ocrData.name,
    0.90
  );

  result.nameMatched = nameResult.matched;

  if (!result.nameMatched) {
    result.errors.push("Name does not match");
  }

  // Registration Number
  const regUser = normalizeText(userData.registrationNumber);
  const regOCR = normalizeText(ocrData.registrationNumber);

  result.registrationMatched = regUser === regOCR;

  if (!result.registrationMatched) {
    result.errors.push("Registration Number does not match");
  }

  result.verified =
    result.nameMatched &&
    result.registrationMatched;

  return result;
};