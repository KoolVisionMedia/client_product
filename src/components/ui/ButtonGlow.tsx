import { useEffect, useRef, useState } from 'react';

/**
 * Hover effect for every button and button-style link on the site (the
 * oldmain.net "glow" button, rebuilt GPU-safe):
 *  - a streak of light circles the button's edge while the cursor is on it
 *    (or while it has keyboard focus);
 *  - a glint sweeps across the face as the hover starts;
 *  - the button lifts a little, and presses in when clicked.
 *
 * Usage: add `btn-glow` to the button's className and render <ButtonGlow /> as
 * its FIRST child (first, so `space-x-*` and `:last-child` styling are
 * unaffected; it's absolutely positioned, so it takes no room in the layout).
 * Styles: "Button hover glow" in src/index.css.
 *
 * GPU-safe (see the note in RusticPines.tsx): no masks, filters, blur or blend
 * modes. The ring is a plain SVG stroke: a short dash that runs around a rounded
 * rect the size of the button (measured on hover; the corner radius is read
 * from the button's own border-radius, so pills, rounded and square buttons all
 * fit). Its soft glow is a wider, faint stroke instead of a drop-shadow, and
 * the glint is a background-position sweep. Nothing is measured or animated
 * until the first hover or focus; touch screens skip the hover-only parts, and
 * reduced-motion visitors get a still gold ring and no glint.
 */

type Box = { w: number; h: number; r: number; x: number; y: number };

// The streak, back to front: wide faint glow, then ever shorter and brighter
// strokes, so it fades out smoothly at both ends and burns white in the middle.
// Every dash is centred on the same point, because each pattern is
// "0, gap, dash, gap" with equal gaps over a path length of 100 (and all layers
// animate stroke-dashoffset 0 -> -100 together; see the CSS).
const LAYERS = [
  { k: 'halo', len: 26 },
  { k: 'l1', len: 48 },
  { k: 'l2', len: 32 },
  { k: 'l3', len: 20 },
  { k: 'l4', len: 10 },
  { k: 'l5', len: 4 },
] as const;

export default function ButtonGlow() {
  const ref = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    const measure = () => {
      const w = host.offsetWidth;
      const h = host.offsetHeight;
      if (!w || !h) return;
      const r = Math.min(parseFloat(getComputedStyle(host).borderTopLeftRadius) || 0, w / 2, h / 2);
      // The fx layer sits inside the border; the ring follows the outer edge.
      const x = -host.clientLeft;
      const y = -host.clientTop;
      setBox((b) => (b && b.w === w && b.h === h && b.r === r && b.x === x && b.y === y ? b : { w, h, r, x, y }));
    };
    host.addEventListener('pointerenter', measure);
    host.addEventListener('focusin', measure);
    return () => {
      host.removeEventListener('pointerenter', measure);
      host.removeEventListener('focusin', measure);
    };
  }, []);

  return (
    <span ref={ref} aria-hidden="true" className="glow-fx">
      <svg
        className="glow-ring"
        width={box?.w ?? 0}
        height={box?.h ?? 0}
        style={box ? { left: box.x, top: box.y } : undefined}
        focusable="false"
      >
        {box &&
          LAYERS.map(({ k, len }) => (
            <rect
              key={k}
              className={`glow-${k}`}
              x={0}
              y={0}
              width={box.w}
              height={box.h}
              rx={box.r}
              ry={box.r}
              pathLength={100}
              strokeDasharray={`0 ${50 - len / 2} ${len} ${50 - len / 2}`}
            />
          ))}
      </svg>
    </span>
  );
}
