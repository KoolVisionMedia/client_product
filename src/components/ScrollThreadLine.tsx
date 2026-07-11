import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { useRef, useState, useEffect } from 'react';

/**
 * A decorative olive line that "draws" itself down the homepage as the user
 * scrolls (Framer Motion `useScroll` -> the path's stroke-dashoffset).
 *
 * Purely additive and non-interactive:
 *  - pointer-events: none  (never blocks clicks/hovers/forms)
 *  - absolute overlay, no `overflow` set  (keeps the sticky homepage
 *    sections in CoreValues/Portfolio working)
 *  - z-40: over section imagery, under the navbar/chat/modals (z-50+)
 *  - desktop only, and static (no draw) for reduced-motion users
 *
 * The draw uses the classic stroke-dash technique in REAL path units: we
 * measure the path length once with getTotalLength() and set both the dash
 * and the gap to that length, then animate stroke-dashoffset from L (hidden)
 * to 0 (fully drawn). We deliberately avoid `pathLength` normalization here —
 * it is not reliably applied to attribute dash arrays under this SVG's
 * non-uniform (`preserveAspectRatio="none"`) scaling.
 */
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

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-40 hidden lg:block"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 6000"
        preserveAspectRatio="none"
        fill="none"
      >
        <motion.path
          ref={pathRef}
          d="M 1150 -60
             C 1250 460, 1240 900, 1120 1360
             C 1000 1820, 1010 2260, 1120 2720
             C 1230 3180, 1230 3620, 1100 4080
             C 980 4540, 990 4980, 1100 5440
             C 1180 5820, 1150 6060, 1150 6220"
          stroke="#596652"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={len || undefined}
          style={{
            strokeDashoffset: reduce ? 0 : dashOffset,
            filter: 'drop-shadow(0 0 3px rgba(89, 102, 82, 0.45))',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: len ? 0.6 : 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
}
