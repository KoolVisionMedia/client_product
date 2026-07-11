/**
 * One-shot, in-place photo recompression for public/assets.
 *
 * Goal: shrink oversized photos without changing a single reference —
 * filenames, extensions, and aspect ratios are preserved, so no code changes.
 *
 * Rules:
 *  - JPEG photos (including .png files whose content is actually JPEG — this
 *    repo has several): auto-orient (bake EXIF rotation), resize to fit
 *    MAX_W, re-encode with mozjpeg.
 *  - Floorplan images get a higher cap + quality so line detail stays crisp
 *    when zoomed.
 *  - WebP photos: same resize, re-encode as WebP.
 *  - Real PNGs, SVGs, GIFs, videos, favicons: untouched.
 *  - A file is only overwritten when the new version is >10% smaller.
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT = path.resolve('public/assets');
const MIN_BYTES = 150 * 1024;

const isFloorplan = (p) => /floorplan|floor.?plan|_fp\d?\.|_fp2?\.|_main_fp|_upper_fp/i.test(p);

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const isJpegContent = (file) => {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(3);
  fs.readSync(fd, buf, 0, 3, 0);
  fs.closeSync(fd);
  return buf.equals(JPEG_MAGIC);
};

let scanned = 0, rewritten = 0, savedBytes = 0, skipped = 0;

for (const file of walk(ROOT)) {
  const ext = path.extname(file).toLowerCase();
  const size = fs.statSync(file).size;
  if (size < MIN_BYTES) continue;

  const jpegLike =
    ext === '.jpg' || ext === '.jpeg' || (ext === '.png' && isJpegContent(file));
  const webpLike = ext === '.webp';
  if (!jpegLike && !webpLike) continue;

  scanned++;
  const fp = isFloorplan(file);
  const maxW = fp ? 2400 : 1920;
  const quality = fp ? 85 : 80;

  try {
    const input = fs.readFileSync(file);
    const meta = await sharp(input).metadata();
    let img = sharp(input).rotate(); // bake EXIF orientation
    const displayW =
      meta.orientation && meta.orientation >= 5 ? meta.height : meta.width;
    if (displayW > maxW) img = img.resize({ width: maxW, withoutEnlargement: true });

    const out = jpegLike
      ? await img.jpeg({ quality, mozjpeg: true }).toBuffer()
      : await img.webp({ quality }).toBuffer();

    if (out.length < size * 0.9) {
      fs.writeFileSync(file, out);
      rewritten++;
      savedBytes += size - out.length;
    } else {
      skipped++;
    }
  } catch (err) {
    console.error('FAILED', file, err.message);
  }
}

console.log(
  `scanned=${scanned} rewritten=${rewritten} skipped(already small)=${skipped} saved=${(savedBytes / 1024 / 1024).toFixed(1)}MB`
);
