import { registrationPatterns } from "../utils/regexPatterns.js";

export const extractFields = (ocrText) => {

  const lines = ocrText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length);

  let extracted = {
    name: "",
    registrationNumber: ""
  };

  // -------------------------
  // Registration Number
  // -------------------------

  for (const line of lines) {

    const lower = line.toLowerCase();

    if (
      lower.includes("register") ||
      lower.includes("registration") ||
      lower.includes("reg no") ||
      lower.includes("roll")
    ) {

      for (const pattern of registrationPatterns) {

        const match = line.match(pattern);

        if (match) {

          extracted.registrationNumber = match[0]
            .replace(/\./g, "")
            .replace(/\s/g, "");

          break;
        }

      }

    }

  }

  // -------------------------
  // Name
  // -------------------------

  const regIndex = lines.findIndex(line =>
    line.toLowerCase().includes("register") ||
    line.toLowerCase().includes("registration")
  );

  if (regIndex > 0) {

    extracted.name = lines[regIndex - 1]
      .replace(/\./g, "")
      .trim();

  }

  return extracted;

};