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

export default function ScrollThreadLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const reduce = useReducedMotion();
  const [len, setLen] = useState(0);

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, []);

  // Progress runs 0 -> 1 from "seam at viewport center" to "region bottom at
  // viewport bottom", so the line starts drawing right as the hero/About seam
  // passes the middle of the screen.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end end'],
  });
  const drawn = useSpring(scrollYProgress, {
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
        </defs>
        <motion.path
          ref={pathRef}
          d="M 1150 -20
             C 1300 360, 980 580, 760 880
             C 620 1150, 700 1450, 970 1710
             C 1230 1950, 1370 2190, 1250 2520
             C 1140 2840, 800 3010, 720 3350
             C 650 3670, 900 3940, 1180 4190
             C 1370 4410, 1380 4710, 1220 5000
             C 1150 5160, 1050 5300, 1120 5420"
          stroke="url(#threadGradient)"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={len || undefined}
          style={{
            strokeDashoffset: reduce ? 0 : dashOffset,
            // Soft dark-olive halo gives the thread a little depth on the
            // light page background.
            filter:
              'drop-shadow(0 0 5px rgba(45, 54, 44, 0.45)) drop-shadow(0 0 1px rgba(255, 255, 255, 0.25))',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: len ? 0.9 : 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
}
