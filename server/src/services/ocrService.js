import { createWorker } from "tesseract.js";

export const extractTextFromImage = async (imageBuffer) => {
  const worker = await createWorker("eng");

  try {
    const {
      data: { text },
    } = await worker.recognize(imageBuffer);

    await worker.terminate();

    return text;
  } catch (error) {
    await worker.terminate();
    throw error;
  }
};