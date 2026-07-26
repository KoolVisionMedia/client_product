import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';

/**
 * Events card rail — the visual proof for the Community & Education section on
 * the testimonials page, which it renders inside. It is deliberately just the
 * rail: no section wrapper and no heading of its own, so it sits under that
 * section's existing copy rather than competing with it.
 *
 * All cards sit on a single baseline (the foot of the stage) at a matching
 * resting size, and rise from behind it on scroll-in. Hovering one card does
 * two things at once: the hovered card grows upward off the line, and every
 * other card sinks below it, so roughly half of each gets clipped away by the
 * stage. Only the hovered card is fully above the baseline.
 *
 * The hovered index lives here in the parent rather than in each card, because
 * a card has to react to a sibling being hovered, not just itself.
 *
 * Touch devices (no hover) get poster + caption only — deliberate, so we never
 * composite several videos at once on a phone.
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
 * 2. Add an entry to `events` below. The rail scrolls horizontally once there
 *    are more cards than fit.
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

// GEOMETRY — read this before touching any number here.
//
// The card box is laid out ONCE at its largest extent in each axis (landscape
// width x portrait height) and its size never changes. Both states are reached
// with transforms alone, so the browser never re-runs layout mid-animation.
// Animating width/height instead forces a re-layout every frame, which visibly
// stutters on lower-powered machines — that was a real regression, don't
// reintroduce it.
//
// The contents are counter-scaled by the inverse, about the same origin, so the
// net transform on them is identity: they always render at base size, undistorted,
// and the box simply clips more or less of them. That crop change IS the
// portrait -> landscape morph.
const BASE_W = 'w-[407px] sm:w-[488px] lg:w-[555px]';
const BASE_H = 'h-[300px] sm:h-[360px] lg:h-[386px]';

// The layout slot only reserves the RESTING footprint (BASE_W * REST_SX).
const SLOT_W = 'w-[202px] sm:w-[243px] lg:w-[276px]';
const SLOT_H = BASE_H;

// Stage must clear (BASE_H * HOVER_SY) + LIFT.
const STAGE_H = 'h-[380px] sm:h-[460px] lg:h-[500px]';

// The media is stored landscape (1280x720); the portrait rest state is a crop
// OF that frame, so the hover reveals the full frame rather than upscaling a
// slice of an already-cropped file.
//
// Visible fraction of the base box per state. Pure ratios, so they hold at
// every breakpoint. Everything scales about 'bottom center', which is why the
// card stays welded to the baseline while it grows.
const REST_SX = 0.497;   // 276 of 555 at lg — portrait
const REST_SY = 1;
const HOVER_SX = 1;      // full width — landscape
const HOVER_SY = 0.87;   // 336 of 386 at lg, cropped off the top

// The raised card lifts clear of the baseline. Percentage of BASE_H, so
// 32.6% ≈ 126px at lg.
const LIFT = '-32.6%';

// Contents are counter-scaled, so chrome anchored to the base box's edges would
// sit outside the visible crop. These nudge it back onto the visible edge.
const REST_CHROME_X = '25.15%';   // (1 - REST_SX) / 2
const HOVER_CHROME_Y = '12.95%';  // (1 - HOVER_SY), for top-anchored chrome

const PARKED_Y = '115%';   // fully below the baseline, before the reveal
const SUNK_Y = '50%';      // a sibling is hovered — drop under the line

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

  // Hovered card rides up off the baseline; its siblings drop under it.
  const y = !revealed ? PARKED_Y : active || !anyActive ? '0%' : SUNK_Y;

  return (
    <motion.article
      // NB: this deliberately does NOT use whileInView. The card starts parked
      // outside an overflow-hidden ancestor, and IntersectionObserver clips a
      // target against its ancestors' clip rects — so the observer would never
      // see this element and the reveal could never fire. The parent watches
      // the (always visible) stage instead and hands us `revealed`.
      initial={{ y: PARKED_Y }}
      animate={{ y }}
      transition={{
        duration: revealed ? 0.6 : 1.1,
        delay: revealed && !anyActive ? index * 0.14 : 0,
        ease: EASE,
      }}
      className={`relative flex-none self-end ${SLOT_W} ${SLOT_H} snap-center`}
      style={{ zIndex: active ? 20 : 10 }}
    >
      <motion.div
        tabIndex={0}
        role="group"
        aria-label={`${event.title} — ${event.role}`}
        onMouseEnter={() => onEnter(index)}
        onMouseLeave={() => onLeave(index)}
        onFocus={() => onEnter(index)}
        onBlur={() => onLeave(index)}
        initial={{ scaleX: REST_SX, scaleY: REST_SY, y: 0 }}
        animate={{
          scaleX: active ? HOVER_SX : REST_SX,
          scaleY: active ? HOVER_SY : REST_SY,
          y: active ? LIFT : 0,
        }}
        transition={{ duration: 0.6, ease: EASE }}
        // Transform-only. Origin 'bottom center' keeps the card welded to the
        // baseline as it grows, and centred on its slot so it expands over its
        // neighbours without shifting the row.
        style={{ transformOrigin: 'bottom center' }}
        className={`absolute bottom-0 left-1/2 -ml-[50%] ${BASE_W} ${BASE_H} overflow-hidden rounded-xl bg-[#1b2518] shadow-[0_18px_45px_rgba(27,37,24,0.22)] outline-none ring-1 ring-transparent focus-visible:ring-[#c9a96e] cursor-default`}
      >
        {/* Counter-scale layer — inverse of the box, about the same origin, so
            the net transform is identity and nothing inside distorts. The media
            always renders at base size; the box just clips more or less of it. */}
        <motion.div
          initial={{ scaleX: 1 / REST_SX, scaleY: 1 / REST_SY }}
          animate={{
            scaleX: active ? 1 / HOVER_SX : 1 / REST_SX,
            scaleY: active ? 1 / HOVER_SY : 1 / REST_SY,
          }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ transformOrigin: 'bottom center' }}
          className="absolute inset-0"
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

          {/* Dark filter — clears on hover, deepens while a sibling is hovered */}
          <div
            className="absolute inset-0 bg-[#1b2518] transition-opacity duration-500"
            style={{ opacity: active ? 0 : anyActive ? 0.72 : 0.55 }}
          />
          {/* Caption scrim — always on, keeps the type legible over the footage */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#1b2518]/90 via-[#1b2518]/35 to-transparent" />
        </motion.div>

        {/* Chrome layer — counter-scaled like the media, then nudged inward so
            the tag and caption hug the VISIBLE crop rather than the base box. */}
        <motion.div
          initial={{ scaleX: 1 / REST_SX, scaleY: 1 / REST_SY, x: REST_CHROME_X }}
          animate={{
            scaleX: active ? 1 / HOVER_SX : 1 / REST_SX,
            scaleY: active ? 1 / HOVER_SY : 1 / REST_SY,
            x: active ? '0%' : REST_CHROME_X,
          }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ transformOrigin: 'bottom center' }}
          className="pointer-events-none absolute inset-0"
        >
          {/* Role tag — anchored to the top, which the landscape crop eats into,
              so it shifts down by exactly what gets cropped. */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: active ? HOVER_CHROME_Y : 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute left-4 top-4"
          >
            <span className="inline-block rounded-full border border-white/25 bg-[#1b2518]/60 px-3 py-1 font-sans text-[9px] uppercase tracking-[0.25em] text-white/85">
              {event.role}
            </span>
          </motion.div>

          {/* Preview affordance — fades out as the clip takes over */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-[400ms]"
            style={{ opacity: active ? 0 : 1 }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-[#1b2518]/40">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#FAFAF5" aria-hidden="true">
                <polygon points="7 4 20 12 7 20" />
              </svg>
            </span>
          </div>

          {/* Caption — bottom-anchored, and the crop is bottom-anchored too, so
              this needs no vertical nudge. Capped so it doesn't run the full
              width once the card turns landscape. */}
          <div className="absolute inset-x-0 bottom-0 max-w-md p-5">
            <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#c9a96e]">{event.date}</p>
            {/* h4: the host section owns the h2, the rail label owns the h3 */}
            <h4 className="mt-2 font-serif text-lg leading-snug text-white lg:text-xl">{event.title}</h4>
            <p className="mt-1.5 font-sans text-[11px] text-white/60">{event.meta}</p>
            {/* Height animation is confined to this one text block — it must
                not reserve space at rest or it pushes the title up. Cheap
                enough here; the card itself stays transform-only. */}
            <motion.p
              animate={{ opacity: active ? 1 : 0, height: active ? 'auto' : 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="overflow-hidden font-sans text-[12px] leading-relaxed text-white/80"
            >
              <span className="mt-3 block">{event.blurb}</span>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

export default function EventsShowcase() {
  // Watched instead of the cards themselves — see the note in EventCard.
  const stageRef = useRef<HTMLDivElement>(null);
  const revealed = useInView(stageRef, { once: true, margin: '-80px' });
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
    <div className="relative z-10">
      {/* Label — h3 under the host section's h2. Padding matches the section's
          two-column block above so it lines up with "Community & Education". */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: EASE }}
        className="mx-auto mb-12 max-w-[1400px] px-6 md:px-12"
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

      {/* Stage — cards are clipped to this band and bottom-aligned on the
          baseline, so they rise out of it and sink back under it. The rail
          scrolls horizontally once the cards outgrow the viewport. */}
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative w-max min-w-full">
          <div
            ref={stageRef}
            // lg:px-36 is the room the widened landscape card expands into —
            // it must be at least (BASE_W - slot width) / 2 (140px at lg), or
            // the outermost cards get clipped when raised.
            className={`flex ${STAGE_H} snap-x snap-mandatory items-end justify-start gap-5 overflow-hidden px-6 md:gap-7 md:px-16 lg:justify-center lg:px-36`}
          >
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
          {/* The baseline every card stands on */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-primary/20" />
        </div>
      </div>
    </div>
  );
}
