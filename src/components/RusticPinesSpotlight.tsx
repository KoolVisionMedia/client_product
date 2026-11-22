import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, MapPin } from 'lucide-react';
import { lots } from '../data/rusticPines';
import ButtonGlow from './ui/ButtonGlow';

/**
 * "Also available" announcement for Rustic Pines at Paris Landing, shown on the
 * Current Builds page above the listings. A dark band that overlaps the bottom
 * of the page banner:
 *
 *   [ silent clip from the promo film + spinning "Now selling" seal ][ headline, live numbers, CTA ]
 *   [ gold ticker: every available lot, its acreage and price ................................ ]
 *
 * Every number comes from src/data/rusticPines.ts (lots, prices, home packages),
 * so it stays right as lots sell. The clip is a 10s montage cut from the promo
 * film (aerial over the homesites, the drive up to a finished home, the cabins);
 * nothing loads until the band is near the screen, phones get a lighter copy,
 * and Save-Data / reduced-motion visitors get the still poster instead.
 * Only transform and opacity animate (no blur, masks or filters: see
 * RusticPines.tsx).
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const CLIP = {
  src720: '/assets/rustic-pines/promo/rustic-pines-loop-720.mp4',
  src480: '/assets/rustic-pines/promo/rustic-pines-loop-480.mp4',
  poster: '/assets/rustic-pines/promo/rustic-pines-loop-poster.webp',
};

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;
const available = lots.filter((l) => l.status === 'available');
const homes = available.filter((l) => l.home);
const LOT_FROM = Math.min(...available.map((l) => l.price));
const HOME_FROM = homes.length ? Math.min(...homes.map((l) => l.home!.price)) : null;
const ACRES = [Math.min(...lots.map((l) => l.acres)), Math.max(...lots.map((l) => l.acres))];
const TICKER = [...available]
  .sort((a, b) => a.number - b.number)
  .map((l) =>
    l.home
      ? { lot: l.number, detail: `Home + ${l.acres} acres`, price: usd(l.home.price) }
      : { lot: l.number, detail: `${l.acres} acres`, price: usd(l.price) }
  );

/** Circular "Now selling" seal: text set on a circle, turned slowly. */
function Seal() {
  return (
    <span className="pointer-events-none absolute -right-3 -top-3 z-10 block h-24 w-24 md:-right-5 md:-top-5 md:h-28 md:w-28 xl:h-32 xl:w-32" aria-hidden="true">
      <span className="absolute inset-0 rounded-full bg-[#c9a96e] shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6)]" />
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full animate-spin-slow motion-reduce:animate-none">
        <defs>
          <path id="rp-seal-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text className="fill-[#1b2518]" style={{ fontSize: 11, letterSpacing: '0.32em', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          <textPath href="#rp-seal-circle">NOW SELLING · RUSTIC PINES · </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-7 w-7 md:h-9 md:w-9 fill-[#1b2518]">
          {/* a pine */}
          <path d="M12 2 6.5 9.5h3L5 15h4.5L5 20.5h6V23h2v-2.5h6L14.5 15H19l-4.5-5.5h3z" />
        </svg>
      </span>
    </span>
  );
}

export default function RusticPinesSpotlight() {
  const reduce = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Attach the clip once the band is near the screen (never for Save-Data or
  // reduced motion), then play it only while it is on screen.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (saveData || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[entries.length - 1].isIntersecting) {
          setSrc(window.matchMedia('(min-width: 768px)').matches ? CLIP.src720 : CLIP.src480);
          io.disconnect();
        }
      },
      { rootMargin: '500px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    const el = frameRef.current;
    if (!v || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[entries.length - 1].isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  return (
    <section aria-labelledby="rp-spotlight-title" className="relative z-20 -mt-12 px-4 md:-mt-20 md:px-12">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -60px 0px' }}
        transition={{ duration: 1, ease: EASE }}
        className="relative mx-auto max-w-site overflow-hidden rounded-[1.75rem] bg-[#1b2518] text-white shadow-[0_40px_90px_-40px_rgba(15,22,12,0.85)] ring-1 ring-white/10"
      >
        {/* Faint contour lines, the land's own topography motif (static SVG). */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" preserveAspectRatio="none" viewBox="0 0 800 400">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M-20 ${60 + i * 48} C 160 ${20 + i * 48}, 300 ${130 + i * 44}, 460 ${70 + i * 48} S 720 ${10 + i * 52}, 840 ${80 + i * 46}`}
              fill="none"
              stroke="#c9a96e"
              strokeWidth="1.2"
            />
          ))}
        </svg>

        <div className="relative grid gap-7 p-4 sm:p-6 md:p-8 lg:grid-cols-12 lg:items-center lg:gap-9">
          {/* Clip */}
          <div className="relative lg:col-span-6 xl:col-span-7">
            <div
              ref={frameRef}
              className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#0f1a0c] ring-1 ring-white/10 lg:aspect-[16/9]"
            >
              <img
                src={CLIP.poster}
                alt=""
                width={1280}
                height={720}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {src && (
                <video
                  ref={videoRef}
                  src={src}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                  onLoadedData={() => setReady(true)}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
                />
              )}
              {/* legibility for the caption chip */}
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 font-sans text-[11px] font-medium text-white ring-1 ring-white/20 md:bottom-4 md:left-4">
                <MapPin className="h-3.5 w-3.5 text-[#c9a96e]" aria-hidden="true" />
                Paris Landing · Stewart County, TN
              </span>
            </div>
            <Seal />
          </div>

          {/* Copy */}
          <div className="lg:col-span-6 xl:col-span-5">
            <p className="flex items-center gap-3 font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c9a96e]">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#c9a96e] opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c9a96e]" />
              </span>
              Also available from Homefront
            </p>
            <h2 id="rp-spotlight-title" className="mt-3 font-serif text-[2rem] leading-[1.06] tracking-tight sm:text-[2.6rem] lg:text-[2.4rem] xl:text-[2.85rem]">
              Your own piece of the woods,{' '}
              <span className="italic text-[#c9a96e]">near Kentucky Lake.</span>
            </h2>
            <p className="mt-3 max-w-md font-sans text-[0.95rem] leading-relaxed text-white/75">
              Rustic Pines at Paris Landing: {lots.length} wooded homesites from {ACRES[0]} to {ACRES[1]} acres. Buy the land
              on its own, or a finished Homefront home with the lot.
            </p>

            <dl className="mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
              <div className="px-3 py-3.5 sm:px-4">
                <dt className="font-sans text-[10px] uppercase tracking-[0.18em] text-white/60">Homesites open</dt>
                <dd className="mt-1 font-serif text-2xl text-white sm:text-3xl">{available.length}</dd>
              </div>
              <div className="px-3 py-3.5 sm:px-4">
                <dt className="font-sans text-[10px] uppercase tracking-[0.18em] text-white/60">Lots from</dt>
                <dd className="mt-1 font-serif text-2xl text-[#c9a96e] sm:text-3xl">{usd(LOT_FROM / 1000)}K</dd>
              </div>
              {HOME_FROM && (
                <div className="px-3 py-3.5 sm:px-4">
                  <dt className="font-sans text-[10px] uppercase tracking-[0.18em] text-white/60">Home + lot from</dt>
                  <dd className="mt-1 font-serif text-2xl text-white sm:text-3xl">{usd(HOME_FROM / 1000)}K</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                to="/rustic-pines"
                className="btn-glow group inline-flex items-center gap-3 rounded-full bg-[#c9a96e] py-2 pl-6 pr-2 font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#1b2518] hover:bg-[#d8bb84] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b2518]"
              >
                <ButtonGlow />
                Explore Rustic Pines
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1b2518] text-[#c9a96e] transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
              {homes.length > 0 && (
                <Link
                  to="/rustic-pines"
                  className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white/75 underline decoration-[#c9a96e]/60 underline-offset-[6px] transition-colors hover:text-white"
                >
                  {homes.length} home + lot packages listed
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Ticker: every open lot, its size and price (the same details are on the
            Rustic Pines page, so it's decorative for screen readers). */}
        <div aria-hidden="true" className="group relative overflow-hidden border-t border-[#c9a96e]/30 bg-[#c9a96e] text-[#1b2518]">
          <div className="flex w-max animate-ticker whitespace-nowrap py-2.5 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex">
                {TICKER.map((t) => (
                  <span key={`${copy}-${t.lot}`} className="flex items-center gap-2.5 px-5 font-sans text-[11px] font-semibold uppercase tracking-[0.18em]">
                    <span className="font-serif text-sm normal-case tracking-normal">Lot {t.lot}</span>
                    <span className="opacity-70">{t.detail}</span>
                    <span>{t.price}</span>
                    <span className="pl-3 text-[#1b2518]/40">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
