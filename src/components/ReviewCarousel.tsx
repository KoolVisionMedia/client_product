import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import { RECENT_REVIEWS as REVIEWS } from '../data/recentReviews';

/**
 * Auto-advancing carousel of recent 5-star reviews (contact page).
 *
 * Every few seconds the current review drifts left and fades out while the
 * next drifts in from the right and fades in; a thin gold bar under the quote
 * counts down to the next one. Hovering or focusing it pauses; the dots jump to
 * a review; the pause button stops auto-advance for good (WCAG 2.2.2).
 * Reduced-motion visitors get a plain cross-fade and no auto-advance.
 *
 * All slides sit stacked in ONE grid cell, so the card is always as tall as the
 * longest quote: no height jump (layout shift) when a shorter review comes in.
 * Only transform and opacity animate.
 */

const INTERVAL_MS = 6500;
const EASE = [0.16, 1, 0.3, 1] as const;

function Stars() {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill="#c9a96e">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function ReviewCarousel({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [hovering, setHovering] = useState(false);
  const [stopped, setStopped] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const n = REVIEWS.length;
  const auto = !reduce && !stopped;
  const running = auto && !hovering;

  const go = (next: number) => {
    setPrev(index);
    setIndex(((next % n) + n) % n);
  };

  // Advance on a timer while running. Restarts whenever the review changes.
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => go(index + 1), INTERVAL_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, running]);

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Recent five-star reviews"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setHovering(false);
      }}
      className={`relative overflow-hidden rounded-2xl border border-primary/5 bg-[#f4f3f0] p-7 md:p-8 shadow-sm ${className}`}
    >
      {/* oversized quote mark, decorative */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-3 right-5 select-none font-serif text-[120px] leading-none text-[#c9a96e]/15"
      >
        &ldquo;
      </span>

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Stars />
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-primary-light/80">
            5.0 · Google Reviews
          </span>
        </div>
      </div>

      {/* All slides share one grid cell: the card is as tall as the longest. */}
      <div className="relative mt-5 grid" aria-live={running ? 'off' : 'polite'}>
        {REVIEWS.map((r, k) => {
          const active = k === index;
          const leaving = k === prev;
          return (
            <motion.figure
              key={r.name}
              aria-hidden={!active}
              initial={false}
              animate={
                active
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: reduce ? 0 : leaving ? -36 : 36 }
              }
              transition={
                active
                  ? { duration: 0.9, delay: reduce ? 0 : 0.18, ease: EASE }
                  : leaving
                    ? { duration: 0.55, ease: EASE }
                    : { duration: 0 }
              }
              className={`[grid-area:1/1] flex flex-col ${active ? '' : 'pointer-events-none'}`}
            >
              <blockquote className="font-serif text-[19px] md:text-xl italic leading-relaxed text-primary">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-6">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#1b2518] font-serif text-[12px] text-[#c9a96e] select-none" aria-hidden="true">
                  {initials(r.name)}
                </span>
                <span>
                  <span className="block font-sans text-sm font-semibold text-primary">{r.name}</span>
                  <span className="block font-sans text-[11px] text-primary-light/70">
                    {r.role} · {r.when}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          );
        })}
      </div>

      {/* Countdown bar + controls */}
      <div className="relative mt-6 flex items-center gap-4">
        <div className="relative h-px flex-1 overflow-hidden bg-primary/10" aria-hidden="true">
          {auto && (
            <motion.div
              key={`${index}-${hovering}`}
              className="absolute inset-0 origin-left bg-[#c9a96e]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: hovering ? 0 : 1 }}
              transition={{ duration: hovering ? 0.2 : INTERVAL_MS / 1000, ease: 'linear' }}
            />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {REVIEWS.map((r, k) => (
            <button
              key={r.name}
              type="button"
              onClick={() => k !== index && go(k)}
              aria-label={`Show review ${k + 1} of ${n}, from ${r.name}`}
              aria-current={k === index}
              className="group flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  k === index ? 'w-4 bg-[#c9a96e]' : 'w-1.5 bg-primary/20 group-hover:bg-primary/40'
                }`}
              />
            </button>
          ))}
        </div>
        {!reduce && (
          <button
            type="button"
            onClick={() => setStopped((s) => !s)}
            aria-label={stopped ? 'Play the review carousel' : 'Pause the review carousel'}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/15 text-primary/60 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]"
          >
            {stopped ? <Play className="h-3 w-3" fill="currentColor" aria-hidden="true" /> : <Pause className="h-3 w-3" fill="currentColor" aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
}
