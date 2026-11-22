import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, MapPin, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { RUSTIC_PINES_PROMO as PROMO } from '../data/rusticPinesPromo';

/**
 * Home page announcement for Rustic Pines at Paris Landing.
 *
 * Sits between About and "The Homefront Process". Kept deliberately short on
 * words: the promo film does the talking, and the CTA sends people to
 * /rustic-pines for the details.
 *
 * Fits the page's existing systems:
 *  - Scroll thread: the section background is transparent, like its
 *    neighbours, so the gold thread (ScrollThreadLine) shows on the page
 *    background. ScrollThreadLine measures #rustic-pines-intro and the
 *    untransformed #rustic-pines-intro-frame wrapper and routes its own curve
 *    through the open space right of the heading, then behind the film.
 *  - Motion: same ease curve and whileInView reveals as About / CoreValues.
 *    The film frame's scroll scale is a transform only (GPU, no repaint).
 *
 * Loading: nothing video-related is fetched until the section is within
 * ~1 screen of the viewport, so the home page's first load is unchanged. The
 * frame has a fixed 16:9 box, so the poster and video swap in without layout
 * shift. Phones get a 720p file. Reduced-motion or Save-Data visitors get the
 * poster and a play button instead of autoplay.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const FILM_LABEL_ID = 'rp-intro-film-label';

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px' },
  transition: { duration: 1, delay, ease: EASE },
});

const pickSrc = () =>
  window.matchMedia('(min-width: 768px)').matches ? PROMO.src1080 : PROMO.src720;

export default function RusticPinesIntro() {
  const reduce = useReducedMotion();
  // Untransformed wrapper: observed for lazy loading / autoplay, and measured by
  // ScrollThreadLine (getBoundingClientRect on a scaled element would vary with scroll).
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  // Whether the film should play whenever it's on screen. Off for reduced
  // motion / Save-Data until the visitor presses play, and off after they pause.
  // State drives the big play button; the ref is read inside observers.
  const [auto, setAutoState] = useState(true);
  const autoRef = useRef(true);
  const setAuto = (on: boolean) => {
    autoRef.current = on;
    setAutoState(on);
  };

  const { scrollYProgress } = useScroll({ target: frameRef, offset: ['start end', 'start 0.25'] });
  const frameScale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const filmScale = useTransform(scrollYProgress, [0, 1], [1.14, 1]);

  // Attach the video source once the frame is near the viewport.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    if (!PROMO.filmReady) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (reduce || saveData) {
      setAuto(false);
      return; // wait for the play button
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSrc(pickSrc());
          io.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  // Start once a quarter of the film is on screen; like the hero video, only
  // pause once it's fully scrolled out of view, so it never freezes mid-view.
  useEffect(() => {
    const v = videoRef.current;
    const el = frameRef.current;
    if (!v || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) v.pause();
        else if (entry.intersectionRatio >= 0.25 && autoRef.current) v.play().catch(() => {});
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
    setAuto(true);
    if (!src) setSrc(pickSrc()); // the effect above plays it once attached
    else videoRef.current?.play().catch(() => {});
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || v.paused) start();
    else {
      setAuto(false);
      v.pause();
    }
  };

  const toggleMute = () => {
    const next = !muted;
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
      className="relative pt-28 md:pt-40 pb-24 md:pb-40 px-6 md:px-12"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Heading block: left 7/12 on desktop. The right side stays open on
            purpose: the scroll thread curves through it into the film. */}
        <div className="lg:w-7/12">
          <motion.div
            {...reveal()}
            className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-6 text-[10px] font-sans tracking-[0.3em] uppercase text-accent"
          >
            <span className="flex items-center gap-4">
              <span className="w-12 h-[1px] bg-accent" aria-hidden="true" />
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
            className="font-serif text-5xl md:text-7xl lg:text-[88px] text-primary leading-[1.02] tracking-tight"
          >
            Rustic Pines{' '}
            <span className="block italic text-accent text-3xl md:text-5xl lg:text-[56px] mt-2 md:mt-3">
              at Paris Landing
            </span>
          </motion.h2>

          <motion.p
            {...reveal(0.2)}
            className="mt-8 font-sans text-lg md:text-xl text-primary-light max-w-lg leading-relaxed"
          >
            A new wooded community near Kentucky Lake, headlined by Homefront Builders.
          </motion.p>

          <motion.div {...reveal(0.3)} className="mt-10">
            <Link
              to="/rustic-pines"
              aria-label="Explore Rustic Pines at Paris Landing homesites"
              className="flex items-center gap-4 pl-6 pr-2 py-2 bg-primary rounded-full font-sans text-xs uppercase tracking-[0.2em] font-bold text-white hover:bg-accent transition-all duration-300 w-fit group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-surface"
            >
              Explore Rustic Pines
              <span className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center group-hover:bg-white group-hover:text-accent transition-all duration-300">
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Film */}
        <div ref={frameRef} id="rustic-pines-intro-frame" className="relative mt-14 md:mt-20">
          <motion.div
            style={reduce ? undefined : { scale: frameScale }}
            className="relative aspect-video rounded-2xl md:rounded-[28px] overflow-hidden bg-primary-dark shadow-2xl ring-1 ring-black/5 will-change-transform"
          >
            <motion.div style={reduce ? undefined : { scale: filmScale }} className="absolute inset-0 will-change-transform">
              <img
                src={PROMO.poster}
                srcSet={PROMO.posterSrcSet}
                sizes="(min-width: 1440px) 1344px, 92vw"
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
                  preload="auto"
                  poster={PROMO.poster}
                  aria-labelledby={FILM_LABEL_ID}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
                  onLoadedData={() => setReady(true)}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onError={() => setFailed(true)}
                />
              )}
            </motion.div>

            {/* Legibility shading for the overlays */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/65 via-black/0 to-black/25"
            />

            <p
              id={FILM_LABEL_ID}
              className="absolute top-4 left-4 md:top-7 md:left-7 inline-flex items-center gap-2 rounded-full bg-black/35 backdrop-blur-sm ring-1 ring-white/15 px-3 py-1.5 md:px-4 md:py-2 text-[9px] md:text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-white"
            >
              <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#c9a96e]" aria-hidden="true" />
              <span>
                <span className="sr-only">Rustic Pines promo film, </span>
                Stewart County, TN
              </span>
            </p>

            {showControls && !playing && !auto && (
              <button
                type="button"
                onClick={start}
                aria-label="Play the Rustic Pines promo film"
                className="group absolute inset-0 m-auto w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center text-white transition-all duration-500 hover:scale-105 hover:bg-[#c9a96e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Play className="w-6 h-6 md:w-8 md:h-8 translate-x-0.5" fill="currentColor" aria-hidden="true" />
              </button>
            )}

            <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 flex items-end justify-between gap-4">
              <dl className="hidden md:flex items-end gap-10 text-white">
                <div>
                  <dt className="text-[10px] font-sans uppercase tracking-[0.3em] text-white/65">Homesites</dt>
                  <dd className="font-serif text-4xl lg:text-5xl leading-none mt-2">41</dd>
                </div>
                <div className="w-px h-12 bg-white/25" aria-hidden="true" />
                <div>
                  <dt className="text-[10px] font-sans uppercase tracking-[0.3em] text-white/65">Acres Each</dt>
                  <dd className="font-serif text-4xl lg:text-5xl leading-none mt-2">5–24</dd>
                </div>
              </dl>

              {showControls && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={playing ? 'Pause the promo film' : 'Play the promo film'}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/35 backdrop-blur-sm ring-1 ring-white/25 text-white flex items-center justify-center hover:bg-[#c9a96e] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
                    className="h-10 md:h-11 pl-3 pr-4 rounded-full bg-black/35 backdrop-blur-sm ring-1 ring-white/25 text-white inline-flex items-center gap-2 text-[10px] font-sans font-semibold uppercase tracking-[0.2em] hover:bg-[#c9a96e] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {muted ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
                    <span className="hidden sm:inline">{muted ? 'Sound On' : 'Sound Off'}</span>
                  </button>
                )}
              </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Phone: the stats move below the film so they don't cover it. */}
        <dl className="md:hidden mt-6 flex items-end gap-8 text-primary">
          <div>
            <dt className="text-[10px] font-sans uppercase tracking-[0.3em] text-primary-light">Homesites</dt>
            <dd className="font-serif text-4xl leading-none mt-2">41</dd>
          </div>
          <div className="w-px h-10 bg-primary/15" aria-hidden="true" />
          <div>
            <dt className="text-[10px] font-sans uppercase tracking-[0.3em] text-primary-light">Acres Each</dt>
            <dd className="font-serif text-4xl leading-none mt-2">5–24</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
