import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';

/**
 * Events card rail — the visual proof for the Community & Education section on
 * the testimonials page, which it renders inside. It is deliberately just the
 * rail: no section wrapper and no heading of its own, so it sits under that
 * section's existing copy rather than competing with it.
 *
 * Three clips side by side at their native 16:9, captions below the video
 * rather than over it. On scroll-in each frame is uncovered by a panel that
 * wipes upward off it, staggered across the row. On hover the footage pushes in
 * slightly, its scrim clears, a silent 3-second preview loops, and a rule draws
 * under the caption.
 *
 * Everything animated here is transform or opacity only — no width, height, or
 * position properties — so none of it triggers layout mid-animation. An earlier
 * version animated size directly and stuttered badly on lower-powered machines.
 * Don't reintroduce that.
 *
 * The hovered index lives in the parent rather than each card so a card can
 * react to a sibling being hovered.
 *
 * Touch devices (no hover) get poster + caption only — deliberate, so we never
 * composite several videos at once on a phone.
 *
 * ── Adding an event ────────────────────────────────────────────────────
 * 1. Cut a 3s poster+preview pair from the master file. Keep it 16:9 — these
 *    are shown at their native ratio, uncropped:
 *
 *    ffmpeg -ss <SECONDS> -i "master.mp4" -t 3 \
 *      -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" \
 *      -c:v libx264 -profile:v main -preset slow -crf 27 -pix_fmt yuv420p \
 *      -g 45 -an -movflags +faststart public/assets/events/<slug>.mp4
 *
 *    ffmpeg -ss <SECONDS> -i "master.mp4" -frames:v 1 \
 *      -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" \
 *      -quality 72 public/assets/events/<slug>.webp
 *
 * 2. Add an entry to `events` below.
 */

type EventItem = {
  slug: string;
  title: string;
  role: string;      // Seminar / Class / Community — shown as the corner tag
  meta: string;      // venue · city
  date: string;
  blurb: string;
  // Facebook link for the icon under the caption. Currently Homefront's own
  // page on every card — swap in the individual event/organiser post or page
  // as those are confirmed.
  facebookUrl: string;
};

const HOMEFRONT_FACEBOOK = 'https://www.facebook.com/HomeFrontBuilderstn/';

// Education leads — put seminars and classes first as they're added.
const events: EventItem[] = [
  {
    slug: 'holiday-seminar-event',
    title: 'Holiday Design Seminar',
    role: 'Seminar',
    meta: 'Homefront Design Studio',
    date: 'December 2025',
    blurb: 'An evening of design education — seasonal styling, material selections, and an open floor for questions about building custom.',
    facebookUrl: HOMEFRONT_FACEBOOK,
  },
  {
    slug: 'golf-tournament',
    title: "SAFE's Healing Heroes Golf Tournament",
    role: 'Community',
    meta: 'Clarksville, TN',
    date: 'Summer 2026',
    blurb: 'The annual tournament benefiting local veterans and their families — one of the causes we show up for every year.',
    facebookUrl: HOMEFRONT_FACEBOOK,
  },
  {
    slug: 'shoot-competition',
    title: 'Night Stalker & Legion Memorial Shoot',
    role: 'Community',
    meta: 'Cross Creek Clays · Clarksville, TN',
    date: 'June 2026',
    blurb: 'A three-day memorial shoot honoring the 160th SOAR and the families they leave behind.',
    facebookUrl: HOMEFRONT_FACEBOOK,
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

type CardProps = {
  event: EventItem;
  index: number;
  revealed: boolean;
  active: boolean;
  anyActive: boolean;
  onEnter: (index: number) => void;
  onLeave: (index: number) => void;
};

function EventCard({ event, index, revealed, active, anyActive, onEnter, onLeave }: CardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Playback follows `active`, which the parent owns.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      try { v.currentTime = 0; } catch { /* not seekable yet — fine */ }
      v.play().catch(() => { /* autoplay blocked or aborted; poster stays */ });
    } else {
      v.pause();
      try { v.currentTime = 0; } catch { /* ignore */ }
      setPlaying(false);
    }
  }, [active]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.9, delay: index * 0.12, ease: EASE }}
      onMouseEnter={() => onEnter(index)}
      onMouseLeave={() => onLeave(index)}
      className="group"
    >
      {/* Media frame — fixed 16:9, never resizes. Everything inside moves by
          transform only. */}
      <motion.div
        tabIndex={0}
        role="group"
        aria-label={`${event.title} — ${event.role}`}
        onFocus={() => onEnter(index)}
        onBlur={() => onLeave(index)}
        animate={{ y: active ? -6 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#1b2518] shadow-[0_14px_34px_rgba(27,37,24,0.16)] outline-none ring-1 ring-transparent focus-visible:ring-2 focus-visible:ring-[#c9a96e]"
      >
        {/* Footage pushes in slightly on hover — uniform scale, so nothing
            distorts and no layout is touched. */}
        <motion.div
          animate={{ scale: active ? 1.06 : 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="absolute inset-0"
        >
          <img
            src={`/assets/events/${event.slug}.webp`}
            alt={event.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Silent 3s preview. preload="none" so nothing downloads until hover. */}
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            poster={`/assets/events/${event.slug}.webp`}
            onPlaying={() => setPlaying(true)}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            style={{ opacity: active && playing ? 1 : 0 }}
          >
            <source src={`/assets/events/${event.slug}.mp4`} type="video/mp4" />
          </video>
        </motion.div>

        {/* Dark filter — clears on hover, deepens while a sibling is hovered */}
        <div
          className="pointer-events-none absolute inset-0 bg-[#1b2518] transition-opacity duration-500"
          style={{ opacity: active ? 0 : anyActive ? 0.62 : 0.45 }}
        />

        {/* Role tag */}
        <span className="absolute left-4 top-4 inline-block rounded-full border border-white/25 bg-[#1b2518]/60 px-3 py-1 font-sans text-[9px] uppercase tracking-[0.25em] text-white/85">
          {event.role}
        </span>

        {/* Preview affordance — fades out as the clip takes over */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-[400ms]"
          style={{ opacity: active ? 0 : 1 }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-[#1b2518]/40">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#FAFAF5" aria-hidden="true">
              <polygon points="7 4 20 12 7 20" />
            </svg>
          </span>
        </div>

        {/* Reveal shutter — a page-coloured panel that wipes up off the frame as
            the row scrolls in. Transform only, so it costs nothing. */}
        <motion.div
          initial={{ y: '0%' }}
          animate={{ y: revealed ? '-101%' : '0%' }}
          transition={{ duration: 1, delay: 0.15 + index * 0.12, ease: EASE }}
          className="pointer-events-none absolute inset-0 bg-[#FAFAF5]"
        />
      </motion.div>

      {/* Caption — below the video, not over it */}
      <div className="pt-5">
        {/* Rule draws left to right on hover */}
        <motion.div
          animate={{ scaleX: active ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-4 h-px origin-left bg-[#c9a96e]"
        />
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#c9a96e]">{event.date}</p>
        {/* h4: the host section owns the h2, the rail label owns the h3 */}
        <h4 className="mt-2 font-serif text-xl leading-snug text-primary">{event.title}</h4>
        <p className="mt-1.5 font-sans text-[11px] uppercase tracking-[0.15em] text-primary-light/50">
          {event.meta}
        </p>
        <p className="mt-3 font-sans text-sm leading-relaxed text-primary-light/80">{event.blurb}</p>

        <a
          href={event.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${event.title} on Facebook`}
          className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary transition-colors hover:border-[#c9a96e] hover:bg-[#c9a96e] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
      </div>
    </motion.article>
  );
}

export default function EventsShowcase() {
  const gridRef = useRef<HTMLDivElement>(null);
  const revealed = useInView(gridRef, { once: true, margin: '-80px' });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleEnter = useCallback((index: number) => setActiveIndex(index), []);
  // Guarded so moving the pointer straight from one card to the next doesn't
  // clear the incoming card's hover with the outgoing card's leave event.
  const handleLeave = useCallback(
    (index: number) => setActiveIndex(prev => (prev === index ? null : prev)),
    [],
  );

  return (
    // z-10 keeps the rail above the host section's blueprint background wash.
    <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
      {/* Label — h3 under the host section's h2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: EASE }}
        className="mb-12"
      >
        <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.35em] text-[#c9a96e]">
          Where You&rsquo;ll Find Us
        </p>
        <h3 className="mb-4 font-serif text-3xl leading-tight text-primary md:text-4xl">
          Recent Seminars &amp; Events
        </h3>
        <p className="max-w-xl font-sans leading-relaxed text-primary-light/80">
          A closer look at the evenings we host and the Middle Tennessee causes we show up
          for year after year. Hover any card for a preview.
        </p>
      </motion.div>

      <div ref={gridRef} className="grid gap-x-8 gap-y-14 md:grid-cols-3">
        {events.map((event, i) => (
          <EventCard
            key={event.slug}
            event={event}
            index={i}
            revealed={revealed}
            active={activeIndex === i}
            anyActive={activeIndex !== null}
            onEnter={handleEnter}
            onLeave={handleLeave}
          />
        ))}
      </div>
    </div>
  );
}
