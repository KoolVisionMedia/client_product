import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from 'motion/react';
import { useRef, useState, useEffect } from 'react';

/**
 * A decorative gradient "thread" that draws itself down the homepage as the
 * user scrolls (Framer Motion `useScroll` -> the path's stroke-dashoffset).
 *
 * Placement / layering:
 *  - Rendered inside the below-hero wrapper in Home.tsx, so it spans the
 *    About -> StayConnected region and *starts at the hero/About seam* (it
 *    never touches the hero).
 *  - `-z-10` inside that wrapper's isolated stacking context puts it BEHIND
 *    all section content. The below-hero sections are made transparent so the
 *    shared page background shows the thread on open background and tucks it
 *    behind every photo, card, and text block.
 *  - pointer-events: none (never blocks clicks/hovers/forms); desktop only;
 *    static (fully drawn, no motion) for reduced-motion users.
 *
 * The draw begins when the seam (wrapper top) reaches the middle of the
 * viewport (`offset: ['start center', ...]`) and completes as the region's
 * bottom reaches the bottom of the viewport.
 *
 * The draw uses the classic stroke-dash technique in REAL path units: we
 * measure the path length once with getTotalLength() and set both the dash
 * and the gap to that length, then animate stroke-dashoffset from L (hidden)
 * to 0 (fully drawn). We deliberately avoid `pathLength` normalization here —
 * it is not reliably applied to attribute dash arrays under this SVG's
 * non-uniform (`preserveAspectRatio="none"`) scaling.
 */

// motion-wrapped <linearGradient> so its gradientTransform can be scroll-driven
const MotionLinearGradient = motion.create('linearGradient');

// Thread path body. Every segment after the first uses the SVG "S" (smooth
// cubic) command, which mirrors the previous control point — this makes each
// joint tangent-continuous, so the line is one clean, kink-free curve.
// The final segments (added at runtime) sweep left after the Portfolio
// section and land on the Custom Care image, where the image blooms out of
// the line's endpoint (see CustomCare.tsx).
const THREAD_BODY = `M 1150 -20
   C 1300 360, 1000 560, 780 860
   S 700 1440, 960 1700
   S 1360 2200, 1250 2520
   S 810 3000, 725 3345
   S 890 3925, 1170 4180
   S 1330 4480, 1120 4620`;
const DEFAULT_END = { x: 560, y: 4820 };

export default function ScrollThreadLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const reduce = useReducedMotion();
  const [len, setLen] = useState(0);
  // The Process section's vertical bounds in viewBox units — the thread is
  // masked out (invisible) while crossing it, then re-emerges below,
  // continuing exactly as if it had run underneath the section.
  const [gap, setGap] = useState<{ y0: number; y1: number } | null>(null);
  // Where the thread ends: a fixed point on the Custom Care image (measured
  // from the live layout), and the scroll progress at which the tip should
  // arrive there (when that point reaches ~75% of the viewport height).
  const [endPt, setEndPt] = useState<{ x: number; y: number } | null>(null);
  const [pEnd, setPEnd] = useState(1);

  // Final approach: sweep left off the Portfolio section and land on the
  // image. "S" keeps the joint tangents smooth; the last control point makes
  // the tip arrive flowing down-and-left onto the image.
  const e = endPt ?? DEFAULT_END;
  const d = `${THREAD_BODY}
   S ${Math.round(e.x + 190)} ${Math.round(e.y - 150)}, ${Math.round(e.x)} ${Math.round(e.y)}`;

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, [d]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const c = container.getBoundingClientRect();
      if (c.height <= 0) return;
      // px -> viewBox units (viewBox 1440x5400 stretches over the container)
      const toVbY = (px: number) => ((px - c.top) / c.height) * 5400;

      const section = document.getElementById('process');
      setGap(section ? { y0: toVbY(section.getBoundingClientRect().top), y1: toVbY(section.getBoundingClientRect().bottom) } : null);

      // Land on the Custom Care visual at 68% of its width, just below its
      // top edge — the image blooms from this same origin (CustomCare.tsx).
      const visual = document.getElementById('custom-care-visual');
      if (visual) {
        const v = visual.getBoundingClientRect();
        const exVb = (((v.left - c.left) + v.width * 0.68) / c.width) * 1440;
        const eyPx = (v.top - c.top) + v.height * 0.06;
        setEndPt({ x: exVb, y: (eyPx / c.height) * 5400 });
        // scrollYProgress hits 1 when the container bottom meets the viewport
        // bottom; solve for the progress at which the endpoint sits at 75% of
        // the viewport height, so the draw completes right there.
        const vh = window.innerHeight;
        const span = c.height - vh / 2;
        if (span > 0) setPEnd(Math.min(1, Math.max(0.5, (eyPx - vh * 0.25) / span)));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Progress runs 0 -> 1 from "seam at viewport center" to "region bottom at
  // viewport bottom", so the line starts drawing right as the hero/About seam
  // passes the middle of the screen.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end end'],
  });
  // Complete the draw at pEnd (tip lands on the Custom Care image) rather
  // than at the bottom of the region; clamped, so it then holds there.
  const led = useTransform(scrollYProgress, [0, pEnd], [0, 1]);
  const drawn = useSpring(led, {
    stiffness: 90,
    damping: 30,
    restDelta: 0.001,
  });
  const dashOffset = useTransform(drawn, (v) => len * (1 - v));

  // Scroll-driven colour flow: slide the gradient down the path as the user
  // scrolls so the olive/gold bands travel along the line.
  const gradShift = useTransform(scrollYProgress, [0, 1], [0, 1600]);
  const gradTransform = useMotionTemplate`translate(0 ${gradShift})`;

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
          <MotionLinearGradient
            id="threadGradient"
            gradientUnits="userSpaceOnUse"
            x1="720"
            y1="0"
            x2="720"
            y2="2000"
            gradientTransform={reduce ? undefined : gradTransform}
          >
            <stop offset="0%" stopColor="#8fa06a" />
            <stop offset="30%" stopColor="#c69a3d" />
            <stop offset="55%" stopColor="#63734a" />
            <stop offset="80%" stopColor="#c69a3d" />
            <stop offset="100%" stopColor="#8fa06a" />
          </MotionLinearGradient>
          {gap && (
            <mask id="threadMask" maskUnits="userSpaceOnUse">
              <rect x="0" y="-200" width="1440" height="5800" fill="white" />
              <rect x="0" y={gap.y0} width="1440" height={Math.max(0, gap.y1 - gap.y0)} fill="black" />
            </mask>
          )}
        </defs>
        {/* One clean stroke — no halo/underlays and no CSS filters (filters
            forced a page-height re-rasterization every frame while the dash
            animates, causing scroll jank). */}
        <motion.path
          ref={pathRef}
          d={d}
          stroke="url(#threadGradient)"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={len || undefined}
          mask={gap ? 'url(#threadMask)' : undefined}
          style={{ strokeDashoffset: reduce ? 0 : dashOffset }}
          initial={{ opacity: 0 }}
          animate={{ opacity: len ? 0.9 : 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
}
