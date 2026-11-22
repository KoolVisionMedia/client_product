import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { RUSTIC_PINES_PROMO as PROMO } from '../data/rusticPinesPromo';
import ButtonGlow from './ui/ButtonGlow';

/**
 * Home page announcement for Rustic Pines at Paris Landing.
 *
 * Sits between About and "The Homefront Process". A band, not a full screen.
 * Desktop layout, left to right:
 *
 *     [ heading + CTA, over the film's faded edge ][ film -> full film ]
 *
 * The promo film autoplays like a background, pinned to the right (from about
 * a third of the way across) and fading into the page on its left edge. It
 * fills nearly the whole band, and the site's scroll thread (ScrollThreadLine)
 * passes BEHIND it: in at its top edge, out at its bottom edge, then on along
 * its original course. Kept short on words; the CTA sends people to
 * /rustic-pines.
 * Phones/tablets: the film runs full width on top and fades into the page at
 * its bottom edge, where the heading picks up (the thread is desktop-only).
 *
 * Fits the page's existing systems:
 *  - Scroll thread: the section background is transparent like its
 *    neighbours. ScrollThreadLine measures #rustic-pines-intro and splices the
 *    thread through it, keeping its direction; the opaque film panel sits above
 *    the thread, so the thread runs behind the film. (ScrollThreadLine can also
 *    route the thread down an open lane instead, if a section marks one with
 *    #rustic-pines-intro-rail; this one doesn't.)
 *  - Motion: same ease curve and whileInView reveals as About / CoreValues;
 *    the film's scroll zoom is a transform only (GPU, no repaint).
 *  - GPU: no CSS masks, filters or backdrop blur (they've failed on the owner's
 *    GPU before; see RusticPines.tsx). The fade is a plain gradient overlay.
 *
 * Loading: nothing video-related is fetched until the section is within about
 * one screen of the viewport, so the home page's first load is unchanged. The
 * panel has a fixed size, so poster and video swap in without layout shift.
 * Phones get the 720p file. The film autoplays muted for everyone (Save-Data
 * visitors get the poster and a play button); pause and sound controls stay
 * available, and it pauses itself once fully scrolled out of view.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const PAGE_BG = '#FAFAF5'; // --color-surface
// Desktop: the film panel spans 32% -> 100% of the section width (lg:left-[32%]
// below). The text column overlaps its first ~12%, so the fade stays close to
// page colour there (text stays readable), then eases out to the full film.
// Eased in (no hard start), so the film has no visible left edge.
const FADE_LEFT = `linear-gradient(to right, ${PAGE_BG} 0%, rgba(250,250,245,0.97) 6%, rgba(250,250,245,0.88) 14%, rgba(250,250,245,0.68) 22%, rgba(250,250,245,0.42) 30%, rgba(250,250,245,0.18) 38%, rgba(250,250,245,0) 46%)`;
const FADE_BOTTOM = `linear-gradient(to top, ${PAGE_BG} 0%, rgba(250,250,245,0.9) 12%, rgba(250,250,245,0.45) 30%, rgba(250,250,245,0) 55%)`;

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px' },
  transition: { duration: 1, delay, ease: EASE },
});

// The film panel is under ~900px wide below 1280px screens: 720p is plenty
// there and roughly halves the download and decode work.
const pickSrc = () =>
  window.matchMedia('(min-width: 1280px)').matches ? PROMO.src1080 : PROMO.src720;

const controlBtn =
  'h-9 lg:h-10 rounded-full bg-black/45 ring-1 ring-white/25 text-white inline-flex items-center justify-center hover:bg-[#c9a96e] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';

export default function RusticPinesIntro() {
  const reduce = useReducedMotion();
  // The film panel. Never transformed itself (the zoom is on its child), so it
  // is safe to observe and to measure for the scroll thread.
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  // Current sound setting for the observer callback below (state would be stale there).
  const mutedRef = useRef(true);
  // Whether the film should play whenever it's on screen: off for Save-Data
  // until the visitor presses play, and off after they pause it.
  const autoRef = useRef(true);

  const { scrollYProgress } = useScroll({ target: frameRef, offset: ['start end', 'end start'] });
  const filmScale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);

  // Attach the video source once the panel is near the viewport.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || !PROMO.filmReady) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    // Save-Data, or a device asking for reduced motion: no autoplay. The poster
    // and play button show instead (nothing downloads until they press play).
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (saveData || reducedMotion) {
      autoRef.current = false;
      return; // poster + play button; nothing downloads until they press play
    }
    const io = new IntersectionObserver(
      (entries) => {
        // A callback can carry several entries for the same element (fast
        // scrolling); the last one is the current state.
        if (entries[entries.length - 1].isIntersecting) {
          setSrc(pickSrc());
          io.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Start once a quarter of the film is on screen; like the hero video, only
  // pause once it's fully scrolled out of view, so it never freezes mid-view.
  useEffect(() => {
    const v = videoRef.current;
    const el = frameRef.current;
    if (!v || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]; // latest state (see above)
        if (!entry.isIntersecting) v.pause();
        else if (entry.intersectionRatio >= 0.25 && autoRef.current) {
          // Keep the visitor's sound choice. Muted autoplay is always allowed;
          // unmuted is allowed once they've turned sound on (a user gesture).
          v.muted = mutedRef.current;
          v.play().catch(() => {});
        }
      },
      { threshold: [0, 0.25] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  // React doesn't keep the `muted` DOM property in sync after mount; do it here.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted, src]);

  const start = () => {
    autoRef.current = true;
    if (!src) setSrc(pickSrc()); // the observer above plays it once attached
    else videoRef.current?.play().catch(() => {});
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || v.paused) start();
    else {
      autoRef.current = false;
      v.pause();
    }
  };

  const toggleMute = () => {
    const next = !muted;
    mutedRef.current = next;
    setMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
    if (!next && (!videoRef.current || videoRef.current.paused)) start();
  };

  const showVideo = PROMO.filmReady && src && !failed;
  const showControls = PROMO.filmReady && !failed;

  return (
    <section
      id="rustic-pines-intro"
      aria-labelledby="rp-intro-title"
      className="relative pt-12 md:pt-16 lg:pt-12 pb-12 lg:pb-3"
    >
      <div className="relative lg:h-[clamp(520px,76vh,760px)]">
        {/* Film panel: full width on top below lg; pinned right, full band height
            on lg+, over the scroll thread (the thread passes behind it). */}
        <div
          ref={frameRef}
          id="rustic-pines-intro-frame"
          className="relative w-full aspect-video md:aspect-[16/7] lg:aspect-auto lg:absolute lg:inset-y-0 lg:right-0 lg:left-[32%] lg:w-auto overflow-hidden bg-surface"
        >
          <div className="absolute inset-0">
          <motion.div
            style={reduce ? undefined : { scale: filmScale }}
            className="absolute inset-0 will-change-transform"
          >
            <img
              src={PROMO.poster}
              srcSet={PROMO.posterSrcSet}
              sizes="(min-width: 1024px) 68vw, 100vw"
              width={PROMO.width}
              height={PROMO.height}
              alt={PROMO.posterAlt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {showVideo && (
              <video
                ref={videoRef}
                src={src}
                muted
                loop
                playsInline
                preload="metadata"
                poster={PROMO.poster}
                aria-label="Rustic Pines at Paris Landing promo film"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
                onLoadedData={() => setReady(true)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onError={() => setFailed(true)}
              />
            )}
          </motion.div>

          {/* Fade into the page: left edge on desktop, bottom edge below lg. */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none hidden lg:block" style={{ background: FADE_LEFT }} />
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none lg:hidden" style={{ background: FADE_BOTTOM }} />
          </div>

          {showControls && (
            <div className="absolute top-3 right-3 md:top-5 md:right-5 lg:top-6 lg:right-6 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? 'Pause the promo film' : 'Play the promo film'}
                className={`${controlBtn} w-9 lg:w-10`}
              >
                {playing ? (
                  <Pause className="w-4 h-4" fill="currentColor" aria-hidden="true" />
                ) : (
                  <Play className="w-4 h-4 translate-x-px" fill="currentColor" aria-hidden="true" />
                )}
              </button>
              {PROMO.hasAudio && (
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
                  aria-pressed={!muted}
                  className={`${controlBtn} pl-3 pr-4 gap-2 text-[10px] font-sans font-semibold uppercase tracking-[0.2em]`}
                >
                  {muted ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
                  <span className="hidden sm:inline">{muted ? 'Sound On' : 'Sound Off'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Text: over the film's faded edge. */}
        {/* The wrapper spans the band (over the film on desktop), so it passes
            clicks through; only the text column itself takes them. */}
        <div className="relative z-10 pointer-events-none max-w-site mx-auto px-6 md:px-12 -mt-8 md:-mt-14 lg:mt-0 lg:h-full lg:flex lg:items-center">
          <div className="pointer-events-auto lg:w-[44%] max-w-[33.75rem]">
            <motion.div
              {...reveal()}
              className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-3 mb-4 md:mb-6 text-[10px] font-sans tracking-[0.25em] sm:tracking-[0.3em] uppercase text-accent"
            >
              <span className="flex items-center gap-4">
                <span className="hidden sm:block w-12 h-[1px] bg-accent" aria-hidden="true" />
                Now Introducing
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 tracking-[0.2em] text-primary font-semibold">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                Now Selling
              </span>
            </motion.div>

            <motion.h2
              id="rp-intro-title"
              {...reveal(0.1)}
              className="font-serif text-[44px] md:text-6xl lg:text-[64px] xl:text-[80px] text-primary leading-[1.02] tracking-tight"
            >
              Rustic Pines{' '}
              <span className="block italic text-accent text-[28px] md:text-4xl lg:text-[40px] xl:text-[50px] mt-1.5 md:mt-3">
                at Paris Landing
              </span>
            </motion.h2>

            <motion.p
              {...reveal(0.2)}
              className="mt-4 md:mt-7 font-sans text-base md:text-lg text-primary-light max-w-md leading-relaxed"
            >
              41 wooded homesites near Kentucky Lake, headlined by Homefront Builders.
            </motion.p>

            <motion.div {...reveal(0.3)} className="mt-6 md:mt-9">
              <Link
                to="/rustic-pines"
                aria-label="Explore Rustic Pines at Paris Landing homesites"
                className="flex items-center gap-4 pl-6 pr-2 py-2 bg-primary rounded-full font-sans text-xs uppercase tracking-[0.2em] font-bold text-white hover:bg-accent transition-all duration-300 w-fit group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-surface btn-glow"
              >
                <ButtonGlow />
                Explore Rustic Pines
                <span className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center group-hover:bg-white group-hover:text-accent transition-all duration-300">
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
