import sharp from "sharp";

export const preprocessImage = async (imageBuffer) => {
  return await sharp(imageBuffer)
    .resize({ width: 1500 })
    .grayscale()
    .normalize()
    .sharpen()
    .toBuffer();
};