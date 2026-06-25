import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFile } from 'fs/promises';

const SRC = 'public/logo-round.png';
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

// PNG favicons + touch/PWA icons
const pngJobs = [
  { size: 16,  out: 'public/favicon-16x16.png' },
  { size: 32,  out: 'public/favicon-32x32.png' },
  { size: 180, out: 'public/apple-touch-icon.png' },
  { size: 192, out: 'public/android-chrome-192x192.png' },
  { size: 512, out: 'public/android-chrome-512x512.png' },
];

for (const job of pngJobs) {
  await sharp(SRC)
    .resize(job.size, job.size, { fit: 'contain', background: WHITE })
    .flatten({ background: WHITE })
    .png()
    .toFile(job.out);
  console.log(`OK: ${job.out} (${job.size}x${job.size})`);
}

// Multi-resolution .ico (16/32/48)
const icoSizes = [16, 32, 48];
const icoBuffers = await Promise.all(
  icoSizes.map((size) =>
    sharp(SRC)
      .resize(size, size, { fit: 'contain', background: WHITE })
      .flatten({ background: WHITE })
      .png()
      .toBuffer()
  )
);
const icoBuffer = await pngToIco(icoBuffers);
await writeFile('public/favicon.ico', icoBuffer);
console.log('OK: public/favicon.ico (16/32/48)');
