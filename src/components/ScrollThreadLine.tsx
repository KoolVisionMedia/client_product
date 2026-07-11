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
 * Purely additive and non-interactive:
 *  - pointer-events: none  (never blocks clicks/hovers/forms)
 *  - absolute overlay, no `overflow` set  (keeps the sticky homepage
 *    sections in CoreValues/Portfolio working)
 *  - z-40: over section imagery, under the navbar/chat/modals (z-50+)
 *  - mix-blend-mode so the line composites *into* the content it crosses
 *    (reads as woven behind the page rather than pasted flatly on top).
 *    A true z-behind isn't possible for one continuous line because every
 *    homepage section has an opaque background that would hide it.
 *  - desktop only, and static (no draw) for reduced-motion users
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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  // Lead the draw ~one viewport ahead of the scroll position so the line is
  // always visible flowing down through the current viewport, finishing at the
  // bottom of the page.
  const led = useTransform(scrollYProgress, [0, 1], [0.12, 1]);
  const drawn = useSpring(led, { stiffness: 90, damping: 30, restDelta: 0.001 });
  const dashOffset = useTransform(drawn, (v) => len * (1 - v));

  // Scroll-driven colour flow: slide the gradient down the path as the user
  // scrolls so the olive/gold bands travel along the line.
  const gradShift = useTransform(scrollYProgress, [0, 1], [0, 1600]);
  const gradTransform = useMotionTemplate`translate(0 ${gradShift})`;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-40 hidden lg:block"
      style={{ mixBlendMode: 'multiply' }}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 6000"
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
            <stop offset="0%" stopColor="#7f9160" />
            <stop offset="30%" stopColor="#b48c36" />
            <stop offset="55%" stopColor="#3e4a32" />
            <stop offset="80%" stopColor="#b48c36" />
            <stop offset="100%" stopColor="#7f9160" />
          </MotionLinearGradient>
        </defs>
        <motion.path
          ref={pathRef}
          d="M 1180 -40
             C 1290 420, 1010 650, 830 960
             C 700 1230, 770 1520, 990 1790
             C 1190 2030, 1310 2270, 1220 2600
             C 1140 2920, 850 3120, 790 3460
             C 730 3790, 910 4070, 1130 4330
             C 1300 4550, 1320 4840, 1190 5150
             C 1090 5450, 900 5770, 1090 6260"
          stroke="url(#threadGradient)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={len || undefined}
          style={{
            strokeDashoffset: reduce ? 0 : dashOffset,
            filter: 'drop-shadow(0 0 4px rgba(89, 102, 82, 0.35))',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: len ? 0.9 : 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
}
