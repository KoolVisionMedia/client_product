import { useRef, useState } from 'react';
import { motion } from 'motion/react';

/**
 * Events & Sponsorships showcase.
 *
 * Cards sit shrunk (scale .94) behind a dark scrim. On hover/focus the card
 * grows, the scrim clears, and a silent 3-second preview loops. Touch devices
 * (no hover) just get the poster + caption — deliberate, so we never composite
 * several videos at once on a phone.
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
 * 2. Add an entry to `events` below. That's it — the row scrolls horizontally
 *    once there are more cards than fit.
 */

type EventItem = {
  slug: string;
  title: string;
  role: string;      // Sponsor / Host / Partner — shown as the corner tag
  meta: string;      // venue · city
  date: string;
  blurb: string;
};

const events: EventItem[] = [
  {
    slug: 'golf-tournament',
    title: "SAFE's Healing Heroes Golf Tournament",
    role: 'Sponsor',
    meta: 'Clarksville, TN',
    date: 'Summer 2026',
    blurb: 'Supporting the annual tournament benefiting local veterans and their families.',
  },
  {
    slug: 'shoot-competition',
    title: 'Night Stalker & Legion Memorial Shoot',
    role: 'Sponsor',
    meta: 'Cross Creek Clays · Clarksville, TN',
    date: 'June 2026',
    blurb: 'A three-day memorial shoot honoring the 160th SOAR and the families they leave behind.',
  },
  {
    slug: 'holiday-seminar-event',
    title: 'Holiday Design Seminar',
    role: 'Host',
    meta: 'Homefront Design Studio',
    date: 'December 2025',
    blurb: 'An evening of design education, seasonal styling, and conversation with our team.',
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

function EventCard({ event, index }: { event: EventItem; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);

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
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1, delay: index * 0.12, ease: EASE }}
      className={`relative flex-none w-[248px] sm:w-[280px] lg:w-[320px] snap-center ${
        index % 2 === 1 ? 'lg:mt-14' : ''
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
        className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#1b2518] shadow-[0_18px_45px_rgba(27,37,24,0.22)] outline-none ring-1 ring-transparent focus-visible:ring-[#c9a96e] cursor-default"
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
          <h3 className="mt-2 font-serif text-xl leading-snug text-white">{event.title}</h3>
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
            Out in the Community
          </p>
          <h2 className="mb-6 font-serif text-5xl leading-tight text-primary md:text-6xl">
            Events &amp; Sponsorships
          </h2>
          <p className="mx-auto font-sans text-lg leading-relaxed text-primary-light/80 md:mx-0">
            Tournaments, memorial shoots, and seminars we sponsor, host, and show up for —
            because being a Middle Tennessee builder means more than breaking ground.
          </p>
        </motion.div>
      </div>

      {/* Card rail — centers while the cards fit, scrolls once they don't */}
      <div className="mt-14 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max min-w-full snap-x snap-mandatory items-start justify-start gap-5 px-6 py-10 md:gap-7 md:px-12 lg:justify-center">
          {events.map((event, i) => (
            <EventCard key={event.slug} event={event} index={i} />
          ))}
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4 }}
        className="mx-auto max-w-7xl px-6 font-sans text-[10px] uppercase tracking-[0.3em] text-primary-light/40 md:px-12"
      >
        Hover a card for a preview
      </motion.p>
    </section>
  );
}
