import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFile } from 'fs/promises';

// Single source of truth: the round, transparent Homefront badge.
// Every favicon is just this logo resized — same artwork, transparent
// background, no cropping — so the browser URL bar and Google search
// results all show the full round logo consistently.
const SRC = 'public/logo-round.png';
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

const resizeRound = (size) =>
  sharp(SRC).resize(size, size, { fit: 'contain', background: TRANSPARENT });

// PNG favicons referenced from index.html (browser tabs / URL bar).
const pngJobs = [
  { size: 16, out: 'public/favicon-16x16.png' },
  { size: 32, out: 'public/favicon-32x32.png' },
  { size: 48, out: 'public/favicon-48x48.png' },
  { size: 192, out: 'public/favicon-192x192.png' },
];
for (const job of pngJobs) {
  await resizeRound(job.size).png().toFile(job.out);
  console.log(`OK (round): ${job.out} (${job.size}x${job.size})`);
}

// Touch / PWA icons — same round transparent badge.
const touchJobs = [
  { size: 180, out: 'public/apple-touch-icon.png' },
  { size: 192, out: 'public/android-chrome-192x192.png' },
  { size: 512, out: 'public/android-chrome-512x512.png' },
];
for (const job of touchJobs) {
  await resizeRound(job.size).png().toFile(job.out);
  console.log(`OK (round): ${job.out} (${job.size}x${job.size})`);
}

// Multi-resolution .ico (16/32/48). Google Search frequently fetches the
// .ico for the result favicon, so keep it identical to the PNGs.
const icoSizes = [16, 32, 48];
const icoBuffers = await Promise.all(
  icoSizes.map((size) => resizeRound(size).png().toBuffer())
);
await writeFile('public/favicon.ico', await pngToIco(icoBuffers));
console.log('OK (round): public/favicon.ico (16/32/48)');
