import sharp from 'sharp';
import { existsSync } from 'fs';

const ASSETS = 'public/assets';
const PUBLIC = 'public';

const jobs = [
  // PageSpeed flagged: 395KB PNG → WebP (~60-80KB expected)
  { src: `${ASSETS}/blueprint_bg.png`,      out: `${ASSETS}/blueprint_bg.webp`,       opts: { quality: 80 } },
  // PageSpeed flagged: 234KB JPG → WebP (~60-80KB expected)
  { src: `${ASSETS}/DSC04388-Edit.jpg`,     out: `${ASSETS}/DSC04388-Edit.webp`,      opts: { quality: 82 } },
  // PageSpeed flagged: 132KB JPG → WebP (~35-50KB expected)
  { src: `${ASSETS}/Harmony.jpg`,           out: `${ASSETS}/Harmony.webp`,            opts: { quality: 82 } },
  // Largest image, not in PageSpeed list but 813KB
  { src: `${ASSETS}/about-hero-new.jpg`,    out: `${ASSETS}/about-hero-new.webp`,     opts: { quality: 82 } },
  // Background: 344KB
  { src: `${ASSETS}/core-values-bg.jpg`,    out: `${ASSETS}/core-values-bg.webp`,     opts: { quality: 82 } },
  // Logo: resize from 1500x591 to 325x128 (2x retina of 162x64 display size)
  { src: `${PUBLIC}/logo-main.png`,         out: `${PUBLIC}/logo-main.webp`,          resize: { width: 325, height: 128, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }, opts: { quality: 90 } },
  // Apple touch icon: resize from 225x225 to 180x180 (standard apple touch icon)
  { src: `${PUBLIC}/logo-round.png`,        out: `${PUBLIC}/logo-round.webp`,         resize: { width: 180, height: 180 }, opts: { quality: 90 } },
];

for (const job of jobs) {
  if (!existsSync(job.src)) {
    console.log(`SKIP (not found): ${job.src}`);
    continue;
  }
  try {
    let pipeline = sharp(job.src);
    if (job.resize) pipeline = pipeline.resize(job.resize);
    await pipeline.webp(job.opts).toFile(job.out);
    console.log(`OK: ${job.src} → ${job.out}`);
  } catch (err) {
    console.error(`FAIL: ${job.src}: ${err.message}`);
  }
}
