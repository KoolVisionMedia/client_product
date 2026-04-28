import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assetsDir = 'public/assets';
const outputDir = 'public/assets/optimized';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function optimizeImage(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    console.log(`Optimizing ${fileName}...`);
    try {
      const info = await sharp(filePath)
        .resize(1920, null, { withoutEnlargement: true }) // Max width 1920
        .jpeg({ quality: 75, progressive: true })
        .toFile(path.join(outputDir, fileName));
      
      const originalSize = fs.statSync(filePath).size;
      const newSize = info.size;
      console.log(`  Done: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(newSize / 1024 / 1024).toFixed(2)}MB (${((1 - newSize/originalSize) * 100).toFixed(1)}% reduction)`);
    } catch (err) {
      console.error(`  Error optimizing ${fileName}:`, err);
    }
  }
}

async function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'optimized') {
        await processDirectory(fullPath);
      }
    } else {
      await optimizeImage(fullPath);
    }
  }
}

console.log('Starting optimization...');
processDirectory(assetsDir).then(() => {
  console.log('Optimization complete.');
});
