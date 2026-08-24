/**
 * PWA Icon Generator — generates PNG icons from SVG using sharp
 * Run: node generate_pwa_icons.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, 'client', 'public', 'icons');

// Ensure output dir exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create SVG content for the EM logo with purple background
function createIconSvg(size, isMaskable = false) {
  const borderRadius = isMaskable ? 0 : Math.round(size * 0.18);
  const bgColor = '#6C4EFF';
  
  // For maskable icons, use more padding (safe zone is 80% of total)
  const logoScale = isMaskable ? 0.5 : 0.6;
  const logoSize = Math.round(size * logoScale);
  const offset = Math.round((size - logoSize) / 2);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bgColor}" rx="${borderRadius}" ry="${borderRadius}" />
  <svg x="${offset}" y="${offset}" width="${logoSize}" height="${logoSize}" viewBox="0 0 100 100">
    <polygon
      points="50,6 88,28 88,72 50,94 12,72 12,28"
      stroke="white"
      stroke-width="7"
      stroke-linejoin="round"
      fill="none"
    />
    <text
      x="50"
      y="55"
      text-anchor="middle"
      dominant-baseline="central"
      fill="white"
      font-size="34"
      font-weight="bold"
      font-family="Arial, Helvetica, sans-serif"
    >EM</text>
  </svg>
</svg>`;
}

// Generate all sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Try to use sharp if available, otherwise save as SVG
async function generateIcons() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
    console.log('Using sharp for PNG conversion...');
  } catch {
    console.log('sharp not available, saving as SVG (will still work for PWA)...');
    sharp = null;
  }

  for (const size of sizes) {
    const svg = createIconSvg(size, false);
    const filename = `icon-${size}x${size}`;
    
    if (sharp) {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(path.join(outputDir, `${filename}.png`));
      console.log(`✓ Generated ${filename}.png`);
    } else {
      // Save as SVG but name it .png for the manifest
      // The browser will handle it
      fs.writeFileSync(path.join(outputDir, `${filename}.svg`), svg);
      console.log(`✓ Generated ${filename}.svg`);
    }
  }

  // Maskable icons (with safe zone padding)
  for (const size of [192, 512]) {
    const svg = createIconSvg(size, true);
    const filename = `icon-maskable-${size}x${size}`;
    
    if (sharp) {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(path.join(outputDir, `${filename}.png`));
      console.log(`✓ Generated ${filename}.png (maskable)`);
    } else {
      fs.writeFileSync(path.join(outputDir, `${filename}.svg`), svg);
      console.log(`✓ Generated ${filename}.svg (maskable)`);
    }
  }

  // Generate Apple touch icon (180x180)
  const appleSvg = createIconSvg(180, false);
  if (sharp) {
    await sharp(Buffer.from(appleSvg))
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png');
  } else {
    fs.writeFileSync(path.join(outputDir, 'apple-touch-icon.svg'), appleSvg);
    console.log('✓ Generated apple-touch-icon.svg');
  }

  console.log('\n✅ All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
