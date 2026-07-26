import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';

/**
 * Seminars & Events showcase.
 *
 * Framed around education first — the classes and seminars Homefront teaches —
 * with the community events they host and support alongside them.
 *
 * The cards live inside a clipped "stage" bounded by a hairline at the top and
 * bottom. On scroll-in they slide in from alternating borders — odd cards rise
 * up from behind the bottom line, even cards drop down from behind the top one.
 * Heights are staggered so the tops/bottoms don't line up.
 *
 * On hover/focus a card grows from the border it entered from and its dark
 * scrim clears while a silent 3-second preview loops. Touch devices (no hover)
 * get poster + caption only — deliberate, so we never composite several videos
 * at once on a phone.
 *
 * ── Adding an event ────────────────────────────────────────────────────
 * 1. Cut a 3s poster+preview pair from the master file:
 *
 *    ffmpeg -ss <SECONDS> -i "master.mp4" -t 3 \
 *      -vf "crop=ih*3/4:ih,scale=720:960:flags=lanczos" \
 *      -c:v libx264 -profile:v main -preset slow -crf 26 -pix_fmt yuv420p \
 *      -g 45 -an -movflags +faststart public/assets/events/<slug>.mp4
 *
 *    ffmpeg -ss <SECONDS> -i "master.mp4" -frames:v 1 \
 *      -vf "crop=ih*3/4:ih,scale=720:960:flags=lanczos" -quality 74 \
 *      public/assets/events/<slug>.webp
 *
 * 2. Add an entry to `events` below. Anchor + height cycle automatically, and
 *    the rail scrolls horizontally once there are more cards than fit.
 */

type EventItem = {
  slug: string;
  title: string;
  role: string;      // Seminar / Class / Community — shown as the corner tag
  meta: string;      // venue · city
  date: string;
  blurb: string;
};

// Education leads — put seminars and classes first as they're added.
const events: EventItem[] = [
  {
    slug: 'holiday-seminar-event',
    title: 'Holiday Design Seminar',
    role: 'Seminar',
    meta: 'Homefront Design Studio',
    date: 'December 2025',
    blurb: 'An evening of design education — seasonal styling, material selections, and an open floor for questions about building custom.',
  },
  {
    slug: 'golf-tournament',
    title: "SAFE's Healing Heroes Golf Tournament",
    role: 'Community',
    meta: 'Clarksville, TN',
    date: 'Summer 2026',
    blurb: 'The annual tournament benefiting local veterans and their families — one of the causes we show up for every year.',
  },
  {
    slug: 'shoot-competition',
    title: 'Night Stalker & Legion Memorial Shoot',
    role: 'Community',
    meta: 'Cross Creek Clays · Clarksville, TN',
    date: 'June 2026',
    blurb: 'A three-day memorial shoot honoring the 160th SOAR and the families they leave behind.',
  },
];

/**
 * Per-card stage placement. Cycles, so any number of events keeps the
 * alternating rhythm. `h` is the card's resting height — staggered on purpose
 * so the row reads as a gallery rather than a grid. Every height must leave
 * ~6% headroom inside STAGE_H for the hover growth.
 */
const LAYOUT = [
  { anchor: 'bottom', h: 'h-[300px] sm:h-[360px] lg:h-[420px]' },
  { anchor: 'top',    h: 'h-[340px] sm:h-[410px] lg:h-[500px]' },
  { anchor: 'bottom', h: 'h-[320px] sm:h-[385px] lg:h-[455px]' },
  { anchor: 'top',    h: 'h-[290px] sm:h-[350px] lg:h-[415px]' },
] as const;

const STAGE_H = 'h-[420px] sm:h-[500px] lg:h-[600px]';

const EASE = [0.16, 1, 0.3, 1] as const;

function EventCard({ event, index, revealed }: { event: EventItem; index: number; revealed: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);

  const { anchor, h } = LAYOUT[index % LAYOUT.length];
  const fromBottom = anchor === 'bottom';
  // Parked fully outside the clipped stage, so it's hidden behind the border.
  const parked = fromBottom ? '115%' : '-115%';

  const start = () => {
    setActive(true);
    const v = videoRef.current;
    if (!v) return;
    try { v.currentTime = 0; } catch { /* not seekable yet — fine */ }
    v.play().catch(() => { /* autoplay blocked or aborted; poster stays */ });
  };

  const stop = () => {
    setActive(false);
    setPlaying(false);
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    try { v.currentTime = 0; } catch { /* ignore */ }
  };

  return (
    <motion.article
      // Slides in from behind whichever border it's anchored to.
      //
      // NB: this deliberately does NOT use whileInView. The card starts parked
      // outside an overflow-hidden ancestor, and IntersectionObserver clips a
      // target against its ancestors' clip rects — so the observer would never
      // see this element and the reveal could never fire. The parent watches
      // the (always visible) stage instead and hands us `revealed`.
      initial={{ y: parked }}
      animate={{ y: revealed ? '0%' : parked }}
      transition={{ duration: 1.1, delay: index * 0.14, ease: EASE }}
      className={`relative flex-none w-[220px] sm:w-[264px] lg:w-[310px] snap-center ${h} ${
        fromBottom ? 'self-end' : 'self-start'
      }`}
      style={{ zIndex: active ? 20 : 10 }}
    >
      <motion.div
        tabIndex={0}
        role="group"
        aria-label={`${event.title} — ${event.role}`}
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
        initial={{ scale: 0.94 }}
        animate={{ scale: active ? 1.06 : 0.94 }}
        transition={{ duration: 0.7, ease: EASE }}
        // Grows out of the border it arrived from, not from the centre.
        style={{ transformOrigin: fromBottom ? 'bottom center' : 'top center' }}
        className="relative h-full w-full overflow-hidden rounded-2xl bg-[#1b2518] shadow-[0_18px_45px_rgba(27,37,24,0.22)] outline-none ring-1 ring-transparent focus-visible:ring-[#c9a96e] cursor-default"
      >
        {/* Poster — always mounted, sits under the video */}
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

        {/* Dark filter — clears on hover */}
        <div
          className="absolute inset-0 bg-[#1b2518]/55 transition-opacity duration-500"
          style={{ opacity: active ? 0 : 1 }}
        />
        {/* Caption scrim — always on, keeps the type legible over the footage */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#1b2518]/90 via-[#1b2518]/35 to-transparent" />

        {/* Role tag */}
        <div className="absolute left-4 top-4">
          <span className="inline-block rounded-full border border-white/25 bg-[#1b2518]/45 px-3 py-1 font-sans text-[9px] uppercase tracking-[0.25em] text-white/85 backdrop-blur-sm">
            {event.role}
          </span>
        </div>

        {/* Preview affordance — fades out as the clip takes over */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-[400ms]"
          style={{ opacity: active ? 0 : 1 }}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-[#1b2518]/25 backdrop-blur-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#FAFAF5" aria-hidden="true">
              <polygon points="7 4 20 12 7 20" />
            </svg>
          </span>
        </div>

        {/* Caption */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#c9a96e]">{event.date}</p>
          <h3 className="mt-2 font-serif text-lg leading-snug text-white lg:text-xl">{event.title}</h3>
          <p className="mt-1.5 font-sans text-[11px] text-white/60">{event.meta}</p>
          <motion.p
            animate={{ opacity: active ? 1 : 0, height: active ? 'auto' : 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden font-sans text-[12px] leading-relaxed text-white/80"
          >
            <span className="mt-3 block">{event.blurb}</span>
          </motion.p>
        </div>
      </motion.div>
    </motion.article>
  );
}

export default function EventsShowcase() {
  // Watched instead of the cards themselves — see the note in EventCard.
  const stageRef = useRef<HTMLDivElement>(null);
  const revealed = useInView(stageRef, { once: true, margin: '-80px' });

  return (
    <section className="relative overflow-hidden bg-[#FAFAF5] py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: EASE }}
          className="max-w-2xl text-center md:text-left"
        >
          <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.35em] text-[#c9a96e]">
            Learn With Us
          </p>
          <h2 className="mb-6 font-serif text-5xl leading-tight text-primary md:text-6xl">
            Seminars &amp; Events
          </h2>
          <p className="mx-auto font-sans text-lg leading-relaxed text-primary-light/80 md:mx-0">
            Design seminars, hands-on classes, and open evenings built to demystify custom home
            building long before you break ground — alongside the Middle Tennessee causes we
            show up for year after year.
          </p>
        </motion.div>
      </div>

      {/* Stage — cards are clipped to this band so they emerge from its borders.
          The rail scrolls horizontally once the cards outgrow the viewport. */}
      <div className="mt-16 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative w-max min-w-full">
          {/* Top / bottom borders the cards slide out of */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/15" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-primary/15" />

          <div
            ref={stageRef}
            className={`flex ${STAGE_H} snap-x snap-mandatory items-stretch justify-start gap-5 overflow-hidden px-6 md:gap-7 md:px-12 lg:justify-center`}
          >
            {events.map((event, i) => (
              <EventCard key={event.slug} event={event} index={i} revealed={revealed} />
            ))}
          </div>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4 }}
        className="mx-auto mt-6 max-w-7xl px-6 font-sans text-[10px] uppercase tracking-[0.3em] text-primary-light/40 md:px-12"
      >
        Hover a card for a preview
      </motion.p>
    </section>
  );
}
