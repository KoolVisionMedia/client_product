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
 *  - everything below the section is shifted down by exactly its height;
 *  - the stretch around the section is re-routed so the thread stays IN VIEW
 *    through it. The section marks a lane (#rustic-pines-intro-rail: the open
 *    strip between its text and where the film fades in). The thread leaves
 *    its old course behind the About photos (exact Bezier split, so everything
 *    above is untouched), sweeps across to that lane with the same lazy slope
 *    as its other curves, runs down the lane beside the film, and re-joins the
 *    original thread near its leftmost point in "The Homefront Process" (again
 *    an exact split, same direction: no kinks).
 * Result: the hero seam, the lower Process stretch, the floor plans and Custom
 * Care are pixel-identical to before at every width; only the right-to-centre
 * crossing moved up, so it now happens through the announcement instead of
 * behind the first Process card.
 * If the section isn't on the page, everything falls back to the original.
 */
type Pt = [number, number];
type Seg = [Pt, Pt, Pt, Pt];
type Insert = {
  /** section top, in the thread's original (unshifted) units */
  at: number;
  /** section height, in units */
  h: number;
  /** the lane the section wants the thread in: x, and where it starts (offset from the section top) */
  railX?: number;
  railTop?: number;
  /** px per unit */
  sx: number;
  sy: number;
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

/** Exact split of the original body where it crosses y (original units). */
function splitAtY(y: number): { k: number; left: Seg; right: Seg; pt: Pt; slope: number } | null {
  for (let k = 0; k < BODY_SEGS.length; k++) {
    const seg = BODY_SEGS[k];
    let prev = bezY(seg, 0) - y;
    for (let j = 1; j <= 64; j++) {
      const cur = bezY(seg, j / 64) - y;
      if (prev === 0 || prev * cur < 0) {
        let lo = (j - 1) / 64;
        let hi = j / 64;
        for (let it = 0; it < 32; it++) {
          const mid = (lo + hi) / 2;
          if ((bezY(seg, lo) - y) * (bezY(seg, mid) - y) <= 0) hi = mid;
          else lo = mid;
        }
        const t = (lo + hi) / 2;
        // de Casteljau
        const [p0, p1, p2, p3] = seg;
        const a = lerp(p0, p1, t), b = lerp(p1, p2, t), c = lerp(p2, p3, t);
        const d = lerp(a, b, t), e = lerp(b, c, t);
        const m = lerp(d, e, t);
        // direction of travel at the cut, as dx per unit of dy (pointing down the page)
        const tx = e[0] - d[0];
        const ty = e[1] - d[1];
        const slope = ty > 1e-6 ? Math.max(-1.5, Math.min(1.5, tx / ty)) : 0;
        return { k, left: [p0, a, d, m], right: [m, e, c, p3], pt: m, slope };
      }
      prev = cur;
    }
  }
  return null;
}

// Re-route tuning (see INSERTED SECTIONS).
const GENTLE = 2; // vertical px the crossing takes per px it moves sideways
const KEEP_TOP_PX = 140; // the visible start at the hero seam is never touched
const REJOIN_Y = 1040; // original units: just above the thread's leftmost point in the Process

/** The thread body, re-routed around / through the inserted section (or the original). */
function buildBody(ins: Insert | null): { body: string; shift: number } {
  if (!ins || !canInsertAt(ins.at)) return { body: THREAD_BODY, shift: 0 };
  const { at, h, railX, railTop, sx, sy } = ins;
  const cut = splitAtY(at);
  if (!cut) return { body: THREAD_BODY, shift: 0 };

  if (railX != null && railTop != null && REJOIN_Y > at + 200 / sy) {
    // W: where the thread arrives in the lane (top of the film), heading straight down.
    const W: Pt = [railX, at + railTop];
    // A: where it leaves its old course. Far enough up that the crossing is lazy.
    const acrossPx = Math.abs(cut.pt[0] - railX) * sx;
    const yA = Math.min(at - 40 / sy, Math.max(KEEP_TOP_PX / sy, W[1] - (GENTLE * acrossPx) / sy));
    const A = splitAtY(yA);
    const B = splitAtY(REJOIN_Y);
    if (A && B && A.pt[1] < W[1] - 1) {
      const s1 = W[1] - A.pt[1];
      const Bp: Pt = [B.pt[0], B.pt[1] + h];
      const s2 = Bp[1] - W[1];
      const bridge: Seg[] = [
        // old course -> lane: leaves along its own direction, lands vertical
        [A.pt, [A.pt[0] + A.slope * s1 * 0.35, A.pt[1] + s1 * 0.35], [railX, W[1] - s1 * 0.45], W],
        // down the lane beside the film, then a slow bow back onto the old course
        [W, [railX, W[1] + s2 * 0.45], [Bp[0] - B.slope * s2 * 0.3, Bp[1] - s2 * 0.3], Bp],
      ];
      const segs: Seg[] = [
        ...BODY_SEGS.slice(0, A.k),
        A.left,
        ...bridge,
        shiftSeg(B.right, h),
        ...BODY_SEGS.slice(B.k + 1).map((s) => shiftSeg(s, h)),
      ];
      return { body: segsToD(segs), shift: h };
    }
  }

  // No lane marked: plain splice. Cut at the section top, shift the rest down,
  // and bridge the gap with one curve that keeps the thread's direction.
  const P0 = cut.pt;
  const P3: Pt = [P0[0], P0[1] + h];
  const segs: Seg[] = [
    ...BODY_SEGS.slice(0, cut.k),
    cut.left,
    [P0, [P0[0] + cut.slope * h * 0.33, P0[1] + h * 0.33], [P3[0] - cut.slope * h * 0.33, P3[1] - h * 0.33], P3],
    shiftSeg(cut.right, h),
    ...BODY_SEGS.slice(cut.k + 1).map((s) => shiftSeg(s, h)),
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
const INSERT_GLOW = '#c69a3d'; // the thread's own gold
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
  const near = (x?: number, y?: number, tol = 0.25) =>
    x == null || y == null ? x === y : Math.abs(x - y) < tol;
  return (
    near(a.at, b.at) && near(a.h, b.h) && near(a.railX, b.railX) && near(a.railTop, b.railTop) &&
    near(a.sx, b.sx, 0.002) && near(a.sy, b.sy, 0.002)
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

  const timingPathRef = useRef<SVGPathElement>(null);

  // Values the rAF loop reads (refs, so it never needs to restart).
  // secTop / secH: the inserted section's top (px from the container top) and
  // height, or 0 / 0 when there is none.
  const geom = useRef({ top: 0, height: 1, vh: 1, secTop: 0, secH: 0 });
  const hookFracRef = useRef(0.75);
  const pEndRef = useRef(1);
  const drawnRef = useRef(0);
  const offRef = useRef(0);
  // tipY lookup table: fraction-of-length -> tip Y in px, for the thread as it
  // is WITHOUT the inserted section (see DRAW TIMING below).
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

  /*
   * DRAW TIMING
   * How far the thread has "drawn" for a given scroll position was tuned on the
   * page as it was: the tip leads the reader by a set amount at every point.
   * A re-routed, longer path would change that everywhere (the draw is paced by
   * path length). So the pacing is always computed on the thread as it is
   * WITHOUT the inserted section (`d0`, never drawn), exactly as before, and the
   * section is then accounted for in plain pixels: while the middle of the
   * screen is passing through the section the tip simply moves with the scroll,
   * and below it everything is offset by the section's height. The cover only
   * needs the tip's Y, so the visible path can take any route.
   * With no inserted section d0 === d and this is the original behaviour.
   */
  const end0 = e.y - shift;
  const runY0 = Math.round(Math.max(end0 - 170, 4330));
  const d0 = shift
    ? `${THREAD_BODY}
   C 1450 4435, 1220 ${runY0 - 300}, 1220 ${runY0 - r}
   Q 1220 ${runY0}, ${1220 - r} ${runY0}
   L ${ex + r} ${runY0}
   Q ${ex} ${runY0}, ${ex} ${runY0 + r}
   L ${ex} ${Math.round(end0)}`
    : d;

  // Measure length + build the fraction->tipY lookup table (on d0).
  useEffect(() => {
    const el = pathRef.current;
    const timing = timingPathRef.current;
    const c = containerRef.current;
    if (!el || !timing || !c) return;
    setLen(el.getTotalLength());
    const total = timing.getTotalLength();
    // px per unit as it is without the inserted section
    const sy = ins ? ins.sy : (c.getBoundingClientRect().height || 1) / VB_H;
    const table: number[] = [];
    for (let i = 0; i <= LUT_N; i++) {
      const pt = timing.getPointAtLength((i / LUT_N) * total);
      table.push(pt.y * sy); // thread units -> px
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
  }, [d, d0, ins]);

  // Cache geometry (container position/size, viewport, Process gap, endpoint).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const c = container.getBoundingClientRect();
      if (c.height <= 0) return;

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
          nextIns = { at: (s.top - c.top) / sy, h: s.height / sy, sx: c.width / VB_W, sy };
          // The lane the section marks for the thread (an untransformed, 1px-wide
          // strip between its text and its film).
          const lane = document.getElementById('rustic-pines-intro-rail')?.getBoundingClientRect();
          if (lane && lane.height > 0) {
            nextIns.railX = ((lane.left + lane.width / 2 - c.left) / c.width) * VB_W;
            nextIns.railTop = Math.max(0, (lane.top - s.top) / sy);
          }
        }
      }
      const secH = nextIns ? nextIns.h * sy : 0;
      const secTop = nextIns ? nextIns.at * sy : 0;
      geom.current = { top: c.top + window.scrollY, height: c.height, vh: window.innerHeight, secTop, secH };
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
        // Paced on the page without the inserted section (see DRAW TIMING).
        const span = c.height - secH - window.innerHeight / 2;
        if (span > 0) pEndRef.current = Math.min(1, Math.max(0.5, (eyPx - secH - window.innerHeight * 0.25) / span));
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
      const { top, height, vh, secTop, secH } = geom.current;
      // Middle of the screen, in container px; `off` is how much of the inserted
      // section it has passed (0 when there is none). See DRAW TIMING.
      const mid = window.scrollY - top + vh / 2;
      const off = secH > 0 ? Math.min(secH, Math.max(0, mid - secTop)) : 0;
      const denom = height - secH - vh / 2;
      const p = clamp01(denom > 0 ? (mid - off) / denom : 0);

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
      offRef.current += (off - offRef.current) * 0.12;
      const settled = Math.abs(target - drawnRef.current) < 0.0002 && Math.abs(off - offRef.current) < 0.5;
      if (settled) {
        drawnRef.current = target;
        offRef.current = off;
      }

      // tipY via the LUT (fraction -> px), then position the cover so it hides
      // everything below the tip.
      const table = lut.current;
      let tipY = height;
      if (table.length) {
        const f = clamp01(drawnRef.current) * LUT_N;
        const i = Math.min(LUT_N - 1, Math.floor(f));
        tipY = table[i] + (table[i + 1] - table[i]) * (f - i) + offRef.current;
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
  }, [reduce, len, gap, endPt, ins]);

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
        {/* Measurement only, not drawn: the path's length, and the pacing path (see DRAW TIMING). */}
        <path ref={pathRef} d={d} fill="none" stroke="none" />
        <path ref={timingPathRef} d={d0} fill="none" stroke="none" />
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
