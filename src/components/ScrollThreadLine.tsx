import { useRef, useState, useEffect, useMemo } from 'react';
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
const VB_W = 1440;
const VB_H = 5400; // the thread's own height; see INSERTED SECTIONS below
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/*
 * INSERTED SECTIONS (the Rustic Pines announcement, #rustic-pines-intro)
 *
 * The SVG is stretched over the whole below-hero region, and THREAD_BODY was
 * tuned by eye against the sections as they were. Simply adding a section
 * would stretch the whole thread and drift every curve away from the content
 * it was placed around. So instead:
 *  - the viewBox keeps the same px-per-unit scale as before the section
 *    existed (scale = (container height - section height) / 5400);
 *  - the thread is cut at the section's top edge (exact Bezier split, so the
 *    part above is untouched), everything below is shifted down by exactly the
 *    section's height, and a new curve is spliced into the gap.
 * Result: the thread over About, the Process, the floor plans and Custom Care
 * is pixel-identical to before at every width, and the new section gets its
 * own curve, routed from the measured layout: it runs down behind the opaque
 * part of the film panel and re-joins the original thread with the same
 * direction it left with (no kinks).
 * If the section isn't on the page, everything falls back to the original.
 */
type Pt = [number, number];
type Seg = [Pt, Pt, Pt, Pt];
type Insert = {
  /** section top, in the thread's original (unshifted) units */
  at: number;
  /** section height, in units */
  h: number;
  /** film panel: left/right x, and top/bottom offsets from the section top (units) */
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  pad?: number;
};

/** Expand an absolute M/C/S path into explicit cubic segments. */
function toSegments(path: string): Seg[] {
  const tok = path.match(/[MCS]|-?\d*\.?\d+/g) ?? [];
  const segs: Seg[] = [];
  let i = 0;
  let cmd = '';
  let cur: Pt = [0, 0];
  let lastC2: Pt | null = null;
  const n = () => Number(tok[i++]);
  while (i < tok.length) {
    if (/[MCS]/.test(tok[i])) cmd = tok[i++];
    if (cmd === 'M') {
      cur = [n(), n()];
      lastC2 = null;
    } else {
      const c1: Pt =
        cmd === 'C' ? [n(), n()] : lastC2 ? [2 * cur[0] - lastC2[0], 2 * cur[1] - lastC2[1]] : cur;
      const c2: Pt = [n(), n()];
      const p: Pt = [n(), n()];
      segs.push([cur, c1, c2, p]);
      lastC2 = c2;
      cur = p;
    }
  }
  return segs;
}

const BODY_SEGS = toSegments(THREAD_BODY);
const BODY_Y0 = BODY_SEGS[0][0][1];
const BODY_Y1 = BODY_SEGS[BODY_SEGS.length - 1][3][1];

const r2 = (v: number) => Math.round(v * 100) / 100;
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const bezY = (s: Seg, t: number) => {
  const m = 1 - t;
  return m * m * m * s[0][1] + 3 * m * m * t * s[1][1] + 3 * m * t * t * s[2][1] + t * t * t * s[3][1];
};
const shiftSeg = (s: Seg, dy: number): Seg => s.map(([x, y]) => [x, y + dy]) as Seg;
const segsToD = (segs: Seg[]) =>
  `M ${r2(segs[0][0][0])} ${r2(segs[0][0][1])} ` +
  segs.map(([, a, b, c]) => `C ${r2(a[0])} ${r2(a[1])}, ${r2(b[0])} ${r2(b[1])}, ${r2(c[0])} ${r2(c[1])}`).join(' ');

/** Whether a section starting at `at` (original units) can be spliced into the body. */
const canInsertAt = (at: number) => at > BODY_Y0 && at < BODY_Y1;

/** The thread body, with the inserted section's curve spliced in (or the original). */
function buildBody(ins: Insert | null): { body: string; shift: number } {
  if (!ins || !canInsertAt(ins.at)) return { body: THREAD_BODY, shift: 0 };
  const { at, h } = ins;

  // First segment that crosses y = at, and the t where it does.
  let k = -1;
  let t = 0;
  for (let s = 0; s < BODY_SEGS.length && k < 0; s++) {
    const seg = BODY_SEGS[s];
    let prev = bezY(seg, 0) - at;
    for (let j = 1; j <= 64; j++) {
      const cur = bezY(seg, j / 64) - at;
      if (prev === 0 || prev * cur < 0) {
        let lo = (j - 1) / 64;
        let hi = j / 64;
        for (let it = 0; it < 32; it++) {
          const mid = (lo + hi) / 2;
          if ((bezY(seg, lo) - at) * (bezY(seg, mid) - at) <= 0) hi = mid;
          else lo = mid;
        }
        k = s;
        t = (lo + hi) / 2;
        break;
      }
      prev = cur;
    }
  }
  if (k < 0) return { body: THREAD_BODY, shift: 0 };

  // Exact de Casteljau split of that segment.
  const [p0, p1, p2, p3] = BODY_SEGS[k];
  const a = lerp(p0, p1, t), b = lerp(p1, p2, t), c = lerp(p2, p3, t);
  const d = lerp(a, b, t), e = lerp(b, c, t);
  const m = lerp(d, e, t);
  const left: Seg = [p0, a, d, m];
  const right: Seg = [m, e, c, p3];

  // Direction of travel at the cut (unit, pointing down the page).
  let tx = e[0] - d[0];
  let ty = e[1] - d[1];
  const len = Math.hypot(tx, ty) || 1;
  tx /= len;
  ty /= len;
  if (ty < 0.25) {
    tx = 0;
    ty = 1;
  }
  const slope = Math.max(-1.5, Math.min(1.5, tx / ty)); // dx per unit of dy along the tangent
  const P0: Pt = m;
  const P3: Pt = [m[0], m[1] + h];
  const out = (dy: number): Pt => [P0[0] + slope * dy, P0[1] + dy];
  const into = (dy: number): Pt => [P3[0] - slope * dy, P3[1] - dy];

  let bridge: Seg[];
  const { left: panelL, right: panelR, top, bottom, pad = 0 } = ins;
  const A1y = top != null ? at + top + pad : NaN;
  const B1y = bottom != null ? at + bottom - pad : NaN;
  // Rail: inside the film's opaque part (its left half fades into the page),
  // as close to the line's own x as that allows, so the bends stay gentle.
  const railX =
    panelL != null && panelR != null
      ? Math.min(panelR - (panelR - panelL) * 0.06, Math.max(P0[0], panelL + (panelR - panelL) * 0.62))
      : NaN;
  if (Number.isFinite(railX) && A1y > P0[1] && B1y > A1y && P3[1] > B1y) {
    // Run down behind the film (hidden by it), then ease back onto the
    // original line with the direction it left with.
    const dyA = A1y - P0[1];
    const dyC = P3[1] - B1y;
    const A1: Pt = [railX, A1y];
    const B1: Pt = [railX, B1y];
    const run = B1y - A1y;
    bridge = [
      [P0, out(dyA * 0.45), [railX, A1y - dyA * 0.45], A1],
      [A1, [railX, A1y + run / 3], [railX, A1y + (run * 2) / 3], B1],
      [B1, [railX, B1y + dyC * 0.45], into(dyC * 0.45), P3],
    ];
  } else {
    bridge = [[P0, out(h * 0.33), into(h * 0.33), P3]];
  }

  const segs: Seg[] = [
    ...BODY_SEGS.slice(0, k),
    left,
    ...bridge,
    shiftSeg(right, h),
    ...BODY_SEGS.slice(k + 1).map((s) => shiftSeg(s, h)),
  ];
  return { body: segsToD(segs), shift: h };
}

/* Gradient stops, in thread units. With an inserted section the stops below it
   move down with the thread (so colours over the old sections are unchanged)
   and the new stretch warms to gold as it passes the announcement. */
const BASE_STOPS: [number, string][] = [
  [0, '#8fa06a'],
  [1350, '#c69a3d'],
  [2700, '#63734a'],
  [4050, '#c69a3d'],
  [5400, '#8fa06a'],
];
const INSERT_GLOW = '#c9a96e';
const hexMix = (h1: string, h2: string, t: number) => {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return (
    '#' +
    [0, 1, 2].map((i) => Math.round(p(h1, i) + (p(h2, i) - p(h1, i)) * t).toString(16).padStart(2, '0')).join('')
  );
};
function gradientStops(ins: Insert | null, shift: number): { y: number; color: string }[] {
  if (!ins || !shift) return BASE_STOPS.map(([y, color]) => ({ y, color }));
  const at = ins.at;
  const i = Math.max(1, BASE_STOPS.findIndex(([y]) => y > at));
  const [ya, ca] = BASE_STOPS[i - 1];
  const [yb, cb] = BASE_STOPS[i];
  const cAt = hexMix(ca, cb, (at - ya) / (yb - ya));
  return [
    ...BASE_STOPS.slice(0, i).map(([y, color]) => ({ y, color })),
    { y: at, color: cAt },
    { y: at + shift * 0.5, color: INSERT_GLOW },
    { y: at + shift, color: cAt },
    ...BASE_STOPS.slice(i).map(([y, color]) => ({ y: y + shift, color })),
  ];
}
const sameInsert = (a: Insert | null, b: Insert | null) => {
  if (!a || !b) return a === b;
  const q = (v?: number) => (v == null ? 'x' : Math.round(v * 2));
  return (
    q(a.at) === q(b.at) && q(a.h) === q(b.h) && q(a.left) === q(b.left) && q(a.right) === q(b.right) &&
    q(a.top) === q(b.top) && q(a.bottom) === q(b.bottom) && q(a.pad) === q(b.pad)
  );
};

export default function ScrollThreadLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const [len, setLen] = useState(0);
  const [gap, setGap] = useState<{ y0: number; y1: number } | null>(null);
  const [endPt, setEndPt] = useState<{ x: number; y: number } | null>(null);
  const [ins, setIns] = useState<Insert | null>(null);

  // Values the rAF loop reads (refs, so it never needs to restart).
  const geom = useRef({ top: 0, height: 1, vh: 1 });
  const hookFracRef = useRef(0.75);
  const pEndRef = useRef(1);
  const drawnRef = useRef(0);
  // tipY lookup table: fraction-of-length -> tip Y in container px.
  const lut = useRef<number[]>([]);

  const { body, shift } = useMemo(() => buildBody(ins), [ins]);
  const vbH = VB_H + shift;
  const stops = useMemo(() => gradientStops(ins, shift), [ins, shift]);

  const e = endPt ?? { x: DEFAULT_END.x, y: DEFAULT_END.y + shift };
  const ex = Math.round(e.x);
  const ey = Math.round(e.y);
  const r = 90;
  const runY = Math.round(Math.max(e.y - 170, 4330 + shift));
  const d = `${body}
   C 1450 ${4435 + shift}, 1220 ${runY - 300}, 1220 ${runY - r}
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
      table.push((pt.y / vbH) * h); // viewBox Y -> container px
    }
    lut.current = table;
    try {
      const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tmp.setAttribute('d', body);
      const bodyLen = tmp.getTotalLength();
      if (total > 0 && bodyLen > 0) hookFracRef.current = Math.min(0.9, Math.max(0.4, bodyLen / total));
    } catch {
      /* keep default */
    }
  }, [d, body, vbH]);

  // Cache geometry (container position/size, viewport, Process gap, endpoint).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const c = container.getBoundingClientRect();
      if (c.height <= 0) return;
      geom.current = { top: c.top + window.scrollY, height: c.height, vh: window.innerHeight };

      // px per thread unit (Y). With the announcement on the page, keep the
      // scale the region had without it (see INSERTED SECTIONS above).
      let sy = c.height / VB_H;
      let nextIns: Insert | null = null;
      const intro = document.getElementById('rustic-pines-intro');
      if (intro) {
        const s = intro.getBoundingClientRect();
        const base = c.height - s.height;
        if (s.height > 0 && base > 0 && canInsertAt((s.top - c.top) / (base / VB_H))) {
          sy = base / VB_H;
          nextIns = { at: (s.top - c.top) / sy, h: s.height / sy };
          // The film panel is never transformed (the zoom is on its child), so
          // this rect doesn't change with scroll position.
          const f = document.getElementById('rustic-pines-intro-frame')?.getBoundingClientRect();
          if (f && f.height > 0) {
            nextIns.left = ((f.left - c.left) / c.width) * VB_W;
            nextIns.right = ((f.right - c.left) / c.width) * VB_W;
            nextIns.top = (f.top - s.top) / sy;
            nextIns.bottom = (f.bottom - s.top) / sy;
            nextIns.pad = Math.min(56, f.height * 0.12) / sy;
          }
        }
      }
      setIns((prev) => (sameInsert(prev, nextIns) ? prev : nextIns));

      const toVbY = (px: number) => (px - c.top) / sy;
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
        const exVb = (((v.left - c.left) + v.width * 0.48) / c.width) * VB_W;
        const eyPx = (v.top - c.top) + v.height * 0.06;
        setEndPt({ x: exVb, y: eyPx / sy });
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
        viewBox={`0 0 ${VB_W} ${vbH}`}
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
            y2={vbH}
          >
            {stops.map(({ y, color }) => (
              <stop key={y} offset={`${r2((y / vbH) * 100)}%`} stopColor={color} />
            ))}
          </linearGradient>
          {gap && (
            <clipPath id="threadClip" clipPathUnits="userSpaceOnUse">
              <rect x="0" y="-200" width={VB_W} height={Math.max(0, gap.y0 + 200)} />
              <rect x="0" y={gap.y1} width={VB_W} height={vbH + 1000} />
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
