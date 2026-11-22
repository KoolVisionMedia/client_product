import { useEffect, useRef } from 'react';

/**
 * The graphite line the pencil cursor leaves behind it.
 *
 * The pencil itself (a blue drafting pencil) is a native CSS cursor (see "Pencil cursor" in
 * index.css), so it tracks the mouse with zero lag and can never freeze. This
 * component only draws the mark: a full-viewport, click-through canvas.
 *
 *  - The line is stroked with a slightly oval pen held at a fixed angle, like
 *    a worn pencil point: a touch broader one way than the other. A second,
 *    softer pass under it gives the edge a graphite smudge.
 *  - A fixed speckle ("paper tooth") is knocked out of the marks so they read
 *    as graphite on paper rather than as a vector line.
 *  - Marks are stored in page coordinates, so they stay on the "plans" when the
 *    page scrolls. Each one holds for HOLD_MS, then eases out over FADE_MS:
 *    about half a second in all, so the line is a brief wake, not a drawing.
 *  - Over dark surfaces the mark turns silvery so it stays visible.
 *  - Mouse / trackpad only, off for reduced-motion users, and the frame loop
 *    stops entirely once the last mark has faded.
 *
 * Cost: a few dozen canvas strokes per frame while a line is on screen (well
 * under 1ms), nothing at all otherwise.
 */

const HOLD_MS = 150; // how long a mark stays before it starts to fade
const FADE_MS = 400; // how long the fade takes
const LIFE_MS = HOLD_MS + FADE_MS;
const SPACING = 1.5; // px between stored points
const MAX_POINTS = 4096; // about 6000px of line on screen at once
const TAIL = 600; // when the buffer is full, the oldest points thin out over this many
const MAX_JUMP = 320; // px: a bigger gap between two samples is a new line
const LEAD = 1.8; // px: the point's wide side
const LEAD_FLAT = 0.7; // its narrow side, as a fraction of the wide one
const NIB_ANGLE = -0.6; // rad: how the point is held
const NIB_COS = Math.cos(NIB_ANGLE);
const NIB_SIN = Math.sin(NIB_ANGLE);
const LEVELS = 28; // opacity steps; neighbours on the same step share one stroke
const TOOTH = 128; // paper-grain tile, device px

const DARK_INK = 'rgb(48,49,52)';
const LIGHT_INK = 'rgb(226,224,214)';
const DARK_ALPHA = 0.7;
const LIGHT_ALPHA = 0.66;

const smooth = (u: number) => u * u * (3 - 2 * u);

/** Speckle that gets erased from the marks: the tooth of the paper. */
function makeTooth(dpr: number) {
  const c = document.createElement('canvas');
  c.width = c.height = TOOTH;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(TOOTH, TOOTH);
  const cell = Math.max(1, Math.round(dpr)); // grain is about 1 CSS px
  let seed = 0x2f6e2b1;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let y = 0; y < TOOTH; y += cell) {
    for (let x = 0; x < TOOTH; x += cell) {
      const n = rand();
      const coarse = n > 0.66 ? (n - 0.66) / 0.34 : 0;
      for (let dy = 0; dy < cell; dy++) {
        for (let dx = 0; dx < cell; dx++) {
          const fine = rand();
          const a = Math.min(1, coarse * 0.7 + fine * fine * 0.28);
          img.data[((y + dy) * TOOTH + x + dx) * 4 + 3] = a * 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/* ---- Is the surface under the pointer dark? ------------------------------ */

const parseColor = (s: string) => {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[\s,/]+/).map(parseFloat);
  return { l: (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255, a: p[3] ?? 1 };
};

const mediaCache = new WeakMap<Element, { key: string; at: number; grid: Float32Array | null }>();
let probe: CanvasRenderingContext2D | null = null;
const GRID = 4;

/** Brightness of a photo / video around the pointer (coarse 4x4 sample). */
function mediaLuminance(el: HTMLImageElement | HTMLVideoElement, cx: number, cy: number, now: number) {
  const isVideo = el instanceof HTMLVideoElement;
  const key = isVideo ? el.currentSrc : (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src;
  let hit = mediaCache.get(el);
  if (!hit || hit.key !== key || (isVideo && now - hit.at > 800)) {
    let grid: Float32Array | null = null;
    try {
      probe ??= Object.assign(document.createElement('canvas'), { width: GRID, height: GRID }).getContext('2d', {
        willReadFrequently: true,
      });
      if (probe) {
        probe.clearRect(0, 0, GRID, GRID);
        probe.drawImage(el, 0, 0, GRID, GRID);
        const d = probe.getImageData(0, 0, GRID, GRID).data;
        grid = new Float32Array(GRID * GRID);
        for (let i = 0; i < grid.length; i++) {
          grid[i] = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
        }
      }
    } catch {
      grid = null; // not decoded yet, or cross-origin
    }
    hit = { key, at: now, grid };
    mediaCache.set(el, hit);
  }
  if (!hit.grid) return null;
  const r = el.getBoundingClientRect();
  const gx = Math.min(GRID - 1, Math.max(0, Math.floor(((cx - r.left) / r.width) * GRID)));
  const gy = Math.min(GRID - 1, Math.max(0, Math.floor(((cy - r.top) / r.height) * GRID)));
  return hit.grid[gy * GRID + gx];
}

function surfaceIsDark(target: Element, cx: number, cy: number, now: number) {
  if (target instanceof HTMLImageElement || target instanceof HTMLVideoElement) {
    const l = mediaLuminance(target, cx, cy, now);
    if (l !== null) return l < 0.45;
  }
  // Light text means whoever styled this spot already decided it is dark.
  const ink = parseColor(getComputedStyle(target).color);
  if (ink && ink.l > 0.6) return true;
  // Otherwise the nearest solid background decides.
  for (let n: Element | null = target; n; n = n.parentElement) {
    const cs = getComputedStyle(n);
    const bg = parseColor(cs.backgroundColor);
    if (bg && bg.a > 0.6) return bg.l < 0.4;
    if (cs.backgroundImage !== 'none') {
      const first = parseColor(cs.backgroundImage);
      if (first && first.a > 0.6) return first.l < 0.4;
    }
  }
  return false;
}

export default function PencilCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // The line lives in a ring buffer of points: page x/y, birth time,
    // strength, tone, and whether the point starts a new line.
    const xs = new Float32Array(MAX_POINTS);
    const ys = new Float32Array(MAX_POINTS);
    const born = new Float64Array(MAX_POINTS);
    const strength = new Float32Array(MAX_POINTS);
    const tone = new Uint8Array(MAX_POINTS);
    const starts = new Uint8Array(MAX_POINTS);
    let head = 0;
    let count = 0;

    let dpr = 0;
    let vw = 0;
    let vh = 0;
    let tooth: CanvasPattern | null = null;

    // Pen state. The line runs through the midpoints of the raw samples with
    // each sample as a curve control point, which rounds off the corners.
    let penDown = false;
    let fresh = false; // the next stored point starts a new line
    let lastX = 0;
    let lastY = 0;
    let midX = 0;
    let midY = 0;
    let lastT = 0;
    let carry = 0;
    let travelled = 0;
    let speed = 0;
    let dark = false;
    let toneAt = -1e9;
    let toneFor: EventTarget | null = null;

    let raf = 0;
    let dirty: [number, number, number, number] | null = null;

    const fit = () => {
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = document.documentElement.clientWidth;
      const h = document.documentElement.clientHeight;
      if (nextDpr !== dpr) {
        dpr = nextDpr;
        tooth = ctx.createPattern(makeTooth(dpr), 'repeat');
      }
      if (w !== vw || h !== vh || canvas.width !== Math.round(w * dpr)) {
        vw = w;
        vh = h;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        dirty = null;
      }
    };

    // Fast strokes skip lightly over the paper.
    const lightness = () => Math.max(0.55, 1 - speed * 0.085);

    const point = (x: number, y: number, now: number) => {
      const i = (head + count) % MAX_POINTS;
      if (count === MAX_POINTS) {
        head = (head + 1) % MAX_POINTS;
        starts[head] = 1;
      } else count++;
      // A hand never holds a line perfectly: a little tremble, and pressure
      // that wanders slowly along the stroke.
      xs[i] = x + (Math.random() - 0.5) * 0.36;
      ys[i] = y + (Math.random() - 0.5) * 0.36;
      born[i] = now;
      strength[i] =
        (0.82 + 0.18 * Math.sin(travelled * 0.021) * Math.sin(travelled * 0.0073 + 1.7)) * lightness();
      tone[i] = dark ? 1 : 0;
      starts[i] = fresh ? 1 : 0;
      fresh = false;
      travelled += SPACING;
    };

    /** Lay points along a curve from (x0,y0) to (x1,y1) with control (cx,cy). */
    const draw = (x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, now: number) => {
      const len = Math.hypot(cx - x0, cy - y0) + Math.hypot(x1 - cx, y1 - cy);
      const steps = Math.max(1, Math.ceil(len / 2));
      let px = x0;
      let py = y0;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const u = 1 - t;
        const qx = u * u * x0 + 2 * u * t * cx + t * t * x1;
        const qy = u * u * y0 + 2 * u * t * cy + t * t * y1;
        const d = Math.hypot(qx - px, qy - py);
        let at = SPACING - carry;
        while (at <= d) {
          const f = at / d;
          point(px + (qx - px) * f, py + (qy - py) * f, now);
          at += SPACING;
        }
        carry = d - (at - SPACING);
        px = qx;
        py = qy;
      }
    };

    const lift = () => {
      penDown = false;
    };

    const sample = (x: number, y: number, now: number) => {
      if (!penDown || Math.hypot(x - lastX, y - lastY) > MAX_JUMP) {
        penDown = true;
        fresh = true;
        lastX = midX = x;
        lastY = midY = y;
        lastT = now;
        carry = SPACING; // put a point right where the pencil lands
        speed = 0;
        return;
      }
      const dist = Math.hypot(x - lastX, y - lastY);
      if (dist < 0.01) return;
      const dt = Math.max(1, now - lastT);
      speed += (dist / dt - speed) * 0.35;
      const mx = (lastX + x) / 2;
      const my = (lastY + y) / 2;
      draw(midX, midY, lastX, lastY, mx, my, now);
      midX = mx;
      midY = my;
      lastX = x;
      lastY = y;
      lastT = now;
    };

    const fadeAt = (age: number) => (age <= HOLD_MS ? 1 : age >= LIFE_MS ? 0 : 1 - smooth((age - HOLD_MS) / FADE_MS));

    const frame = (now: number) => {
      raf = 0;
      while (count && now - born[head] >= LIFE_MS) {
        head = (head + 1) % MAX_POINTS;
        count--;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (dirty) ctx.clearRect(dirty[0], dirty[1], dirty[2] - dirty[0], dirty[3] - dirty[1]);
      dirty = null;
      const rest = now - lastT;
      const tipLive = penDown && rest < LIFE_MS;
      if (!count && !tipLive) return; // all faded: stop until the next move

      const sx = window.scrollX;
      const sy = window.scrollY;
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'butt';

      // The path is built in page pixels, then stroked through a squashed,
      // rotated transform: that makes the pen an ellipse (a worn point).
      let open = false;
      let level = 0;
      let light = 0;
      const stroke = () => {
        if (!open) return;
        open = false;
        if (!level) return;
        const a = level / LEVELS;
        ctx.setTransform(dpr * NIB_COS, dpr * NIB_SIN, -dpr * NIB_SIN * LEAD_FLAT, dpr * NIB_COS * LEAD_FLAT, 0, 0);
        ctx.strokeStyle = light ? LIGHT_INK : DARK_INK;
        ctx.globalAlpha = a * 0.22;
        ctx.lineWidth = LEAD * 1.9;
        ctx.stroke();
        ctx.globalAlpha = a;
        ctx.lineWidth = LEAD;
        ctx.stroke();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      let px = 0;
      let py = 0;
      for (let n = 0, i = head; n < count; n++, i = i + 1 === MAX_POINTS ? 0 : i + 1) {
        const x = xs[i] - sx;
        const y = ys[i] - sy;
        if (starts[i] || n === 0) {
          stroke();
        } else {
          let a = (tone[i] ? LIGHT_ALPHA : DARK_ALPHA) * strength[i] * fadeAt(now - born[i]);
          // Frantic scribbling can outrun the buffer; thin the far end out instead of cutting it.
          const room = MAX_POINTS - count + n;
          if (room < TAIL) a *= room / TAIL;
          const lv = Math.round(a * LEVELS);
          if (!open || lv !== level || tone[i] !== light) {
            stroke();
            level = lv;
            light = tone[i];
            open = true;
            ctx.beginPath();
            ctx.moveTo(px, py);
          }
          ctx.lineTo(x, y);
          if (lv) {
            if (x < x0) x0 = x;
            if (y < y0) y0 = y;
            if (x > x1) x1 = x;
            if (y > y1) y1 = y;
            if (px < x0) x0 = px;
            if (py < y0) y0 = py;
            if (px > x1) x1 = px;
            if (py > y1) y1 = py;
          }
        }
        px = x;
        py = y;
      }
      stroke();

      // Join the last stored point to the pencil tip itself.
      if (tipLive) {
        const tx = lastX - sx;
        const ty = lastY - sy;
        const fromX = count && !fresh ? px : midX - sx;
        const fromY = count && !fresh ? py : midY - sy;
        level = Math.round((dark ? LIGHT_ALPHA : DARK_ALPHA) * 0.82 * lightness() * fadeAt(rest) * LEVELS);
        light = dark ? 1 : 0;
        if (level && Math.hypot(tx - fromX, ty - fromY) > 0.3) {
          open = true;
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(tx, ty);
          stroke();
          x0 = Math.min(x0, fromX, tx);
          y0 = Math.min(y0, fromY, ty);
          x1 = Math.max(x1, fromX, tx);
          y1 = Math.max(y1, fromY, ty);
        }
      }
      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      if (x1 >= x0) {
        const pad = LEAD * 2 + 1;
        const rx0 = Math.max(0, Math.floor((x0 - pad) * dpr));
        const ry0 = Math.max(0, Math.floor((y0 - pad) * dpr));
        const rx1 = Math.min(canvas.width, Math.ceil((x1 + pad) * dpr));
        const ry1 = Math.min(canvas.height, Math.ceil((y1 + pad) * dpr));
        if (rx1 > rx0 && ry1 > ry0) {
          dirty = [rx0, ry0, rx1, ry1];
          if (tooth) {
            // The grain belongs to the page, so it is anchored to the scroll position.
            const ox = -((((sx * dpr) % TOOTH) + TOOTH) % TOOTH);
            const oy = -((((sy * dpr) % TOOTH) + TOOTH) % TOOTH);
            ctx.setTransform(1, 0, 0, 1, ox, oy);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = tooth;
            ctx.fillRect(rx0 - ox, ry0 - oy, rx1 - rx0, ry1 - ry0);
            ctx.globalCompositeOperation = 'source-over';
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !finePointer.matches || reducedMotion.matches) return;
      const now = performance.now();
      if (!dpr) fit(); // the canvas is only sized once a mouse actually shows up
      if (e.target instanceof Element && (e.target !== toneFor || now - toneAt > 300)) {
        toneFor = e.target;
        toneAt = now;
        dark = surfaceIsDark(e.target, e.clientX, e.clientY, now);
      }
      const sx = window.scrollX;
      const sy = window.scrollY;
      const batch = e.getCoalescedEvents?.() ?? [];
      if (batch.length > 1) {
        // Spread the batch over the time since the last sample so speed stays honest.
        const t0 = Math.min(lastT, now);
        batch.forEach((c, k) =>
          sample(c.clientX + sx, c.clientY + sy, penDown ? t0 + ((now - t0) * (k + 1)) / batch.length : now),
        );
      } else {
        sample(e.clientX + sx, e.clientY + sy, now);
      }
      if (penDown && !raf) raf = requestAnimationFrame(frame);
    };

    const onResize = () => {
      if (dpr) fit();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', lift, { passive: true });
    window.addEventListener('blur', lift);
    document.documentElement.addEventListener('pointerleave', lift);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', lift);
      window.removeEventListener('blur', lift);
      document.documentElement.removeEventListener('pointerleave', lift);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pencil-trail" />;
}
