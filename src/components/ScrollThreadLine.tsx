import { useRef, useState, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * A decorative gradient "thread" that draws itself down the homepage as the
 * user scrolls.
 *
 * Placement / layering:
 *  - Rendered inside the below-hero wrapper in Home.tsx, so it spans the
 *    About -> StayConnected region and *starts at the hero/About seam*.
 *  - `-z-10` inside that wrapper's isolated stacking context puts it BEHIND
 *    all section content. The below-hero sections are transparent so the
 *    shared page background shows the thread on open background.
 *  - pointer-events: none; desktop only; static for reduced-motion users.
 *
 * PERFORMANCE — how the "draw" is done without per-frame repaint:
 *  Animating stroke-dashoffset repaints the whole (page-height) SVG every
 *  scroll frame, which was the dominant scroll-jank source (a fully static
 *  line scrolls at 60fps; the stroke detail is irrelevant — it's the repaint).
 *  So the gradient line is painted ONCE, fully drawn and static, and the draw
 *  is faked by an opaque page-coloured COVER that hides the not-yet-drawn
 *  part. The cover is moved with a CSS `transform: translateY()` — a GPU
 *  compositor operation with NO repaint — following the tip's Y via a small
 *  precomputed lookup table. Result: buttery scrolling, identical look.
 */

const THREAD_BODY = `M 1150 -20
   C 1300 360, 1000 560, 780 860
   S 700 1440, 960 1700
   S 1360 2200, 1250 2520
   S 810 3000, 725 3345
   S 890 3925, 1170 4180`;
const DEFAULT_END = { x: 470, y: 4820 };
const PAGE_BG = '#FAFAF5'; // matches --color-surface (the page background)
const LUT_N = 64;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function ScrollThreadLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const [len, setLen] = useState(0);
  const [gap, setGap] = useState<{ y0: number; y1: number } | null>(null);
  const [endPt, setEndPt] = useState<{ x: number; y: number } | null>(null);

  // Values the rAF loop reads (refs, so it never needs to restart).
  const geom = useRef({ top: 0, height: 1, vh: 1 });
  const hookFracRef = useRef(0.75);
  const pEndRef = useRef(1);
  const drawnRef = useRef(0);
  // tipY lookup table: fraction-of-length -> tip Y in container px.
  const lut = useRef<number[]>([]);

  const e = endPt ?? DEFAULT_END;
  const ex = Math.round(e.x);
  const ey = Math.round(e.y);
  const r = 90;
  const runY = Math.round(Math.max(e.y - 170, 4330));
  const d = `${THREAD_BODY}
   C 1450 4435, 1220 ${runY - 300}, 1220 ${runY - r}
   Q 1220 ${runY}, ${1220 - r} ${runY}
   L ${ex + r} ${runY}
   Q ${ex} ${runY}, ${ex} ${runY + r}
   L ${ex} ${ey}`;

  // Measure length + build the fraction->tipY lookup table.
  useEffect(() => {
    const el = pathRef.current;
    const c = containerRef.current;
    if (!el || !c) return;
    const total = el.getTotalLength();
    setLen(total);
    const h = c.getBoundingClientRect().height || 1;
    const table: number[] = [];
    for (let i = 0; i <= LUT_N; i++) {
      const pt = el.getPointAtLength((i / LUT_N) * total);
      table.push((pt.y / 5400) * h); // viewBox Y -> container px
    }
    lut.current = table;
    try {
      const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tmp.setAttribute('d', THREAD_BODY);
      const bodyLen = tmp.getTotalLength();
      if (total > 0 && bodyLen > 0) hookFracRef.current = Math.min(0.9, Math.max(0.4, bodyLen / total));
    } catch {
      /* keep default */
    }
  }, [d]);

  // Cache geometry (container position/size, viewport, Process gap, endpoint).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const c = container.getBoundingClientRect();
      if (c.height <= 0) return;
      geom.current = { top: c.top + window.scrollY, height: c.height, vh: window.innerHeight };
      const toVbY = (px: number) => ((px - c.top) / c.height) * 5400;
      const section = document.getElementById('process');
      setGap(
        section
          ? {
              y0: toVbY(section.getBoundingClientRect().top),
              y1: toVbY(section.getBoundingClientRect().bottom),
            }
          : null
      );
      const visual = document.getElementById('custom-care-visual');
      if (visual) {
        const v = visual.getBoundingClientRect();
        const exVb = (((v.left - c.left) + v.width * 0.48) / c.width) * 1440;
        const eyPx = (v.top - c.top) + v.height * 0.06;
        setEndPt({ x: exVb, y: (eyPx / c.height) * 5400 });
        const span = c.height - window.innerHeight / 2;
        if (span > 0) pEndRef.current = Math.min(1, Math.max(0.5, (eyPx - window.innerHeight * 0.25) / span));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Draw loop: arithmetic + ONE transform write per frame (GPU, no repaint).
  // The loop only runs WHILE it has work to do — it's kicked by scroll/resize
  // and stops once the eased draw has settled on its target. This means zero
  // animation frames while the page is idle (previously it ran 60fps forever,
  // keeping the CPU/GPU pegged even when the user wasn't scrolling).
  useEffect(() => {
    const cover = coverRef.current;
    if (!cover) return;
    if (reduce) {
      cover.style.transform = 'translate3d(0, 200%, 0)'; // fully revealed
      return;
    }
    let raf = 0;
    let running = false;

    const frame = () => {
      const { top, height, vh } = geom.current;
      const denom = height - vh / 2;
      const p = clamp01(denom > 0 ? (window.scrollY - top + vh / 2) / denom : 0);

      const hf = hookFracRef.current;
      const pe = pEndRef.current;
      const hookScrollFrac = Math.min(0.5, (1 - hf) * 1.9);
      const aScroll = pe * (1 - hookScrollFrac);
      let target: number;
      if (p >= pe) target = 1;
      else if (p <= 0) target = 0;
      else if (p < aScroll) target = (p / aScroll) * hf;
      else target = hf + ((p - aScroll) / (pe - aScroll)) * (1 - hf);

      drawnRef.current += (target - drawnRef.current) * 0.12;
      const settled = Math.abs(target - drawnRef.current) < 0.0002;
      if (settled) drawnRef.current = target;

      // tipY via the LUT (fraction -> px), then position the cover so it hides
      // everything below the tip.
      const table = lut.current;
      let tipY = height;
      if (table.length) {
        const f = clamp01(drawnRef.current) * LUT_N;
        const i = Math.min(LUT_N - 1, Math.floor(f));
        tipY = table[i] + (table[i + 1] - table[i]) * (f - i);
      }
      cover.style.transform = `translate3d(0, ${Math.max(0, tipY)}px, 0)`;

      // Keep going only until the draw catches up; then stop until the next
      // scroll/resize so we don't burn frames while idle.
      if (settled) running = false;
      else raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    kick(); // position on mount / when geometry changes
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    return () => {
      cancelAnimationFrame(raf);
      running = false;
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
    };
  }, [reduce, len, gap, endPt]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 5400"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient
            id="threadGradient"
            gradientUnits="userSpaceOnUse"
            x1="720"
            y1="0"
            x2="720"
            y2="5400"
          >
            <stop offset="0%" stopColor="#8fa06a" />
            <stop offset="25%" stopColor="#c69a3d" />
            <stop offset="50%" stopColor="#63734a" />
            <stop offset="75%" stopColor="#c69a3d" />
            <stop offset="100%" stopColor="#8fa06a" />
          </linearGradient>
          {gap && (
            <clipPath id="threadClip" clipPathUnits="userSpaceOnUse">
              <rect x="0" y="-200" width="1440" height={Math.max(0, gap.y0 + 200)} />
              <rect x="0" y={gap.y1} width="1440" height={6000} />
            </clipPath>
          )}
        </defs>
        {/* Fully drawn, STATIC line — painted once, never repainted on scroll. */}
        <path
          d={d}
          stroke="url(#threadGradient)"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath={gap ? 'url(#threadClip)' : undefined}
          style={{ opacity: len ? 0.9 : 0, transition: 'opacity 0.8s ease-out' }}
        />
        {/* pathRef used only for measurement (length + tipY LUT); not drawn. */}
        <path ref={pathRef} d={d} fill="none" stroke="none" />
      </svg>
      {/* Cover that hides the not-yet-"drawn" part. Page-coloured, sits above
          the line but below content, and is moved purely by transform. */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={coverRef}
          className="absolute inset-0 will-change-transform"
          style={{ backgroundColor: PAGE_BG }}
        />
      </div>
    </div>
  );
}
