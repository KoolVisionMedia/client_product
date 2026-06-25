import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFile } from 'fs/promises';

const SRC = 'public/logo-round.png';
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

// Tight crop on the Tennessee tri-star (center of the badge).
// Used for small browser-tab icons where the badge ring text is illegible.
const STAR_CROP = { left: 52, top: 54, width: 124, height: 124 };
const star = () => sharp(SRC).extract(STAR_CROP);

// Small browser-tab favicons: tri-star reads clearly at 16/32px.
const starPngJobs = [
  { size: 16, out: 'public/favicon-16x16.png' },
  { size: 32, out: 'public/favicon-32x32.png' },
];
for (const job of starPngJobs) {
  await star()
    .resize(job.size, job.size, { fit: 'contain', background: WHITE })
    .flatten({ background: WHITE })
    .png()
    .toFile(job.out);
  console.log(`OK (tri-star): ${job.out} (${job.size}x${job.size})`);
}

// Larger touch/PWA icons: keep the full badge — looks complete on a home screen.
const fullBadgeJobs = [
  { size: 180, out: 'public/apple-touch-icon.png' },
  { size: 192, out: 'public/android-chrome-192x192.png' },
  { size: 512, out: 'public/android-chrome-512x512.png' },
];
for (const job of fullBadgeJobs) {
  await sharp(SRC)
    .resize(job.size, job.size, { fit: 'contain', background: WHITE })
    .flatten({ background: WHITE })
    .png()
    .toFile(job.out);
  console.log(`OK (full badge): ${job.out} (${job.size}x${job.size})`);
}

// Multi-resolution .ico (16/32/48) from the tri-star crop.
const icoSizes = [16, 32, 48];
const icoBuffers = await Promise.all(
  icoSizes.map((size) =>
    star()
      .resize(size, size, { fit: 'contain', background: WHITE })
      .flatten({ background: WHITE })
      .png()
      .toBuffer()
  )
);
await writeFile('public/favicon.ico', await pngToIco(icoBuffers));
console.log('OK (tri-star): public/favicon.ico (16/32/48)');
