const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');
const htmlFile = path.join(__dirname, 'public', 'gallery.html');

try {
  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.svg';
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Image Gallery</title>
  <style>
    body { font-family: sans-serif; background: #fafaff; padding: 20px; color: #111827; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .card { background: white; border: 1px solid #e9e6f8; border-radius: 12px; padding: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    img { max-width: 100%; border-radius: 8px; display: block; margin-top: 10px; border: 1px solid #eee; }
    h3 { font-size: 14px; margin: 0; word-break: break-all; }
    p { font-size: 12px; color: #6b7280; margin: 5px 0 0 0; }
  </style>
</head>
<body>
  <h1>Engineering Market - public/images Gallery</h1>
  <div class="grid">
    ${imageFiles.map(file => {
      const filePath = path.join(imagesDir, file);
      const stat = fs.statSync(filePath);
      const sizeKB = (stat.size / 1024).toFixed(1);
      return `
        <div class="card">
          <h3>${file}</h3>
          <p>Size: ${sizeKB} KB</p>
          <img src="images/${file}" alt="${file}" />
        </div>
      `;
    }).join('\n')}
  </div>
</body>
</html>
  `;

  fs.writeFileSync(htmlFile, htmlContent);
  console.log('Gallery HTML generated successfully at public/gallery.html');
} catch (err) {
  console.error('Error generating gallery:', err);
}
