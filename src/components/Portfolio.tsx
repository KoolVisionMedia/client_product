import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useAnimate, usePresence, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bath, Bed, RotateCw, Square, X } from 'lucide-react';
import ButtonGlow from './ui/ButtonGlow';
import { floorPlans, type FloorPlan } from '../data/floorPlans';

/**
 * "Featured Floor Plans" on the home page: a shelf of homes.
 *
 * Each floor plan stands on the shelf as a cover (its exterior photo over a
 * coloured title band). Picking one takes it off the shelf: it flies to the
 * middle of the screen and enlarges, with the home's details beside it. The
 * cover can be flipped over to show the floor plan drawings on its back
 * (clicking a drawing enlarges it; clicking again puts it back), and the list
 * on the right (or the arrow keys) moves along the shelf.
 *
 * Fits the page's existing systems:
 *  - Scroll thread: the section is transparent like its neighbours, so the
 *    thread shows in the gaps between the covers and passes BEHIND the covers,
 *    the shelf and the button. ScrollThreadLine measures #portfolio (and the
 *    [data-thread-lane] gaps) to route itself; this section used to be a
 *    five-screen stack of cards, so see SHORTENED SECTIONS there before
 *    changing the id.
 *  - GPU: transforms and opacity only. No CSS masks, filters or backdrop blur
 *    (they've failed on the owner's GPU before; see RusticPines.tsx), so the
 *    page behind an open home is veiled with a plain page-coloured layer.
 *  - Covers are sized in container units (cqw), so the small cover on the
 *    shelf and the large one in the middle of the screen are the same design
 *    at any size, which is what lets one fly into the other seamlessly.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

type Tone = { bg: string; ink: string; soft: string };
// One cover colour per home, all from the site's palette.
const TONES: Tone[] = [
  { bg: '#2E362C', ink: '#FAFAF5', soft: '#C9A96E' }, // olive
  { bg: '#EFEADB', ink: '#2E362C', soft: '#967226' }, // linen
  { bg: '#B48C36', ink: '#FFFFFF', soft: '#2E362C' }, // gold
  { bg: '#DDE5CE', ink: '#2E362C', soft: '#596652' }, // sage
  { bg: '#596652', ink: '#FAFAF5', soft: '#E9D9AE' }, // moss
];
const toneOf = (index: number) => TONES[index % TONES.length];
const num = (index: number) => String(index + 1).padStart(2, '0');
const specLine = (p: FloorPlan) => `${p.beds} Bed · ${p.baths} Bath · ${p.sqft} sq ft`;

/** The front of a cover. Fills its parent; everything scales with its width. */
function CoverFront({ plan, index, eager = false }: { plan: FloorPlan; index: number; eager?: boolean }) {
  const tone = toneOf(index);
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.4cqw] text-center"
      style={{ backgroundColor: tone.bg, color: tone.ink }}
    >
      <div className="relative h-[61%] shrink-0 overflow-hidden">
        <img
          src={plan.exterior}
          alt={`${plan.title} exterior`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-between" style={{ padding: '5cqw 6.5cqw 6cqw' }}>
        <div
          className="flex items-baseline justify-between font-sans font-semibold uppercase"
          style={{ fontSize: '3cqw', letterSpacing: '0.28em', color: tone.soft }}
        >
          <span>Floor Plan</span>
          <span>N° {num(index)}</span>
        </div>
        <div>
          <p className="font-serif" style={{ fontSize: '12cqw', lineHeight: 1 }}>
            {plan.title}
          </p>
          <p className="font-sans" style={{ fontSize: '3.5cqw', marginTop: '2.6cqw', opacity: 0.78 }}>
            {specLine(plan)}
          </p>
        </div>
      </div>
      {/* a soft highlight down the bound edge, like the spine of a book */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[4%]"
        style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.22), rgba(255,255,255,0))' }}
      />
    </div>
  );
}

/**
 * The back of a cover: the floor plan drawing, one level at a time so it gets
 * the whole cover. Clicking the drawing enlarges it (see PlanZoom).
 */
function CoverBack({
  plan,
  level,
  onLevel,
  onZoom,
}: {
  plan: FloorPlan;
  level: number;
  onLevel: (level: number) => void;
  /** called with the drawing's button, so the enlarged view can grow out of it */
  onZoom: (from: HTMLElement) => void;
}) {
  const many = plan.blueprints.length > 1;
  const levelName = (i: number) => (many ? (i === 0 ? 'Main Level' : 'Upper Level') : 'Floor Plan');
  const small: CSSProperties = { fontSize: 'max(9px, 2.3cqw)', letterSpacing: '0.24em' };
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.4cqw] bg-white text-primary">
      <div className="flex shrink-0 items-center justify-between gap-3" style={{ padding: '4cqw 5cqw 0' }}>
        <span className="whitespace-nowrap font-sans font-semibold uppercase text-accent" style={small}>
          {plan.title}
        </span>
        {many ? (
          <span className="flex rounded-full bg-surface-alt p-[3px]">
            {plan.blueprints.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => onLevel(i)}
                aria-pressed={level === i}
                aria-label={levelName(i)}
                className={`cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 font-sans font-semibold uppercase transition-colors duration-300 ${
                  level === i ? 'bg-primary text-white' : 'text-primary/55 hover:text-primary'
                }`}
                style={small}
              >
                {i === 0 ? 'Main' : 'Upper'}
              </button>
            ))}
          </span>
        ) : (
          <span className="font-sans font-semibold uppercase text-primary/50" style={small}>
            Single Level
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={(ev) => onZoom(ev.currentTarget)}
        aria-label={`Enlarge the ${plan.title} ${levelName(level).toLowerCase()} drawing`}
        className="relative min-h-0 flex-1 cursor-zoom-in rounded-[1cqw] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
        style={{ margin: '2cqw 4cqw 4cqw' }}
      >
        {plan.blueprints.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${plan.title} ${levelName(i).toLowerCase()} drawing`}
            decoding="async"
            draggable={false}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
              level === i ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </button>
    </div>
  );
}

const cq: CSSProperties = { containerType: 'inline-size' };
const COVER_SHADOW = '0 22px 28px -18px rgba(26,33,24,0.55), 0 2px 6px rgba(26,33,24,0.14)';
const OPEN_SHADOW = '0 40px 60px -30px rgba(26,33,24,0.55), 0 6px 18px rgba(26,33,24,0.16)';

/**
 * A floor plan drawing, enlarged to fill the screen. It grows out of the
 * drawing on the back of the cover and shrinks back into it; a click anywhere
 * (or Escape) puts it back.
 */
function PlanZoom({ src, alt, from, onClose }: { src: string; alt: string; from: DOMRect; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [isPresent, safeToRemove] = usePresence();
  const [scope, animate] = useAnimate<HTMLButtonElement>();

  // How the enlarged sheet has to be moved/scaled to sit on the small drawing.
  // (Both are as tall as their drawing, so heights give the scale.)
  const toSmall = () => {
    const to = scope.current?.getBoundingClientRect();
    if (!to || !to.height || !from.height) return null;
    return {
      x: from.left + from.width / 2 - (to.left + to.width / 2),
      y: from.top + from.height / 2 - (to.top + to.height / 2),
      scale: from.height / to.height,
    };
  };

  useLayoutEffect(() => {
    const start = reduce ? null : toSmall();
    if (start) {
      animate(scope.current, { x: [start.x, 0], y: [start.y, 0], scale: [start.scale, 1] }, { duration: 0.5, ease: EASE });
    } else {
      animate(scope.current, { opacity: [0, 1] }, { duration: 0.25 });
    }
    scope.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPresent) return;
    const end = reduce ? null : toSmall();
    const done = end
      ? animate(scope.current, { x: end.x, y: end.y, scale: end.scale }, { duration: 0.4, ease: EASE })
      : animate(scope.current, { opacity: 0 }, { duration: 0.2 });
    done.then(() => safeToRemove?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent]);

  return (
    <div className="fixed inset-0 z-[110] flex cursor-zoom-out items-center justify-center p-3 md:p-6" onClick={onClose}>
      <motion.div
        className="absolute inset-0 bg-surface"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPresent ? 0.94 : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      <button
        ref={scope}
        type="button"
        aria-label="Put the floor plan back"
        className="relative aspect-[4/5] h-[min(94vh,calc((100vw-1.5rem)*1.25))] cursor-zoom-out rounded-[10px] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
        style={{ boxShadow: OPEN_SHADOW, willChange: 'transform' }}
      >
        <img src={src} alt={alt} decoding="async" draggable={false} className="h-full w-full object-contain p-[2.5%]" />
      </button>
    </div>
  );
}

type SpotlightProps = {
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  /** where this home's cover sits on the shelf right now */
  slotRect: (id: string) => DOMRect | null;
};

/**
 * The opened home. Fixed over the page; the cover flies in from its place on
 * the shelf and flies back there when closed.
 */
function Spotlight({ index, onIndex, onClose, slotRect }: SpotlightProps) {
  const plan = floorPlans[index];
  const reduce = useReducedMotion();
  const [isPresent, safeToRemove] = usePresence();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [level, setLevel] = useState(0);
  const [dir, setDir] = useState(1);
  // The enlarged drawing: where it grows from, and what to refocus afterwards.
  const [zoom, setZoom] = useState<DOMRect | null>(null);
  const zoomOpener = useRef<HTMLElement | null>(null);
  const openZoom = (from: HTMLElement) => {
    zoomOpener.current = from;
    setZoom(from.getBoundingClientRect());
  };
  const closeZoom = useCallback(() => {
    setZoom(null);
    zoomOpener.current?.focus({ preventScroll: true });
  }, []);
  const flip = () => setFlipped((f) => !f);
  const [, lead, name] = plan.title.match(/^(The)\s+(.+)$/) ?? ['', '', plan.title];

  const go = useCallback(
    (next: number) => {
      const n = floorPlans.length;
      const to = ((next % n) + n) % n;
      if (to === index) return;
      setDir(to > index ? 1 : -1);
      setFlipped(false);
      setLevel(0);
      onIndex(to);
    },
    [index, onIndex]
  );

  // How the stage has to be moved/scaled to sit exactly on the shelf cover.
  const toSlot = useCallback(
    (id: string) => {
      const from = slotRect(id);
      const stage = scope.current;
      if (!from || !stage) return null;
      const to = stage.getBoundingClientRect();
      if (!to.width || !from.width) return null;
      return {
        x: from.left + from.width / 2 - (to.left + to.width / 2),
        y: from.top + from.height / 2 - (to.top + to.height / 2),
        scale: from.width / to.width,
      };
    },
    [slotRect, scope]
  );

  // Fly in from the shelf.
  useLayoutEffect(() => {
    const start = reduce ? null : toSlot(plan.id);
    if (start) {
      animate(scope.current, { x: [start.x, 0], y: [start.y, 0], scale: [start.scale, 1] }, { duration: 0.75, ease: EASE });
    } else {
      animate(scope.current, { opacity: [0, 1] }, { duration: 0.3 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly back to the shelf, then let AnimatePresence remove us.
  useEffect(() => {
    if (isPresent) return;
    setFlipped(false);
    const end = reduce ? null : toSlot(plan.id);
    const done = end
      ? animate(scope.current, { x: end.x, y: end.y, scale: end.scale }, { duration: 0.55, ease: EASE })
      : animate(scope.current, { opacity: 0 }, { duration: 0.25 });
    done.then(() => safeToRemove?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent]);

  // Keyboard, focus, and no page scrolling behind the open home.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (zoom) {
        // an enlarged drawing takes Escape first; the shelf stays put behind it
        if (ev.key === 'Escape') closeZoom();
        return;
      }
      if (ev.key === 'Escape') onClose();
      else if (ev.key === 'ArrowRight') go(index + 1);
      else if (ev.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index, onClose, zoom, closeZoom]);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const { body, documentElement } = document;
    const bar = window.innerWidth - documentElement.clientWidth;
    const prev = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = 'hidden';
    if (bar > 0) body.style.paddingRight = `${bar}px`; // keep the page from shifting sideways
    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
    };
  }, []);

  const show = isPresent ? 1 : 0;
  const closeOnBackdrop = (ev: ReactMouseEvent) => {
    if (ev.target === ev.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={`${plan.title} floor plan`}>
      {/* page-coloured veil: the shelf it came from stays just visible behind */}
      <motion.div
        className="absolute inset-0 bg-surface"
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 0.965 : 0 }}
        transition={{ duration: show ? 0.45 : 0.4, ease: 'easeOut' }}
      />

      <div className="absolute inset-0 overflow-y-auto overscroll-contain" onClick={closeOnBackdrop}>
        <div
          className="mx-auto grid min-h-full w-full max-w-[1240px] grid-cols-1 content-center items-center gap-x-14 gap-y-8 px-6 pb-12 pt-24 md:px-12 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,0.62fr)] lg:py-16"
          onClick={closeOnBackdrop}
        >
          {/* Details */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: show, x: show ? 0 : -24 }}
            transition={{ duration: show ? 0.7 : 0.25, delay: show ? 0.18 : 0, ease: EASE }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <p className="mb-4 flex items-center gap-4 font-sans text-[10px] uppercase tracking-[0.3em] text-accent">
                  <span className="h-px w-10 bg-accent" />
                  Floor Plan N° {num(index)}
                </p>
                <h3 className="font-serif text-5xl leading-[1.05] text-primary md:text-6xl">
                  {lead && <span className="mb-1 block text-2xl italic text-primary-light md:text-3xl">{lead}</span>}
                  {name}
                </h3>
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm text-primary">
                  <li className="flex items-center gap-2">
                    <Bed size={16} className="text-accent" /> {plan.beds} Bedrooms
                  </li>
                  <li className="flex items-center gap-2">
                    <Bath size={16} className="text-accent" /> {plan.baths} Baths
                  </li>
                  <li className="flex items-center gap-2">
                    <Square size={16} className="text-accent" /> {plan.sqft} sq ft
                  </li>
                </ul>
                <p className="mt-6 max-w-md font-sans text-base leading-relaxed text-primary-light">{plan.description}</p>
                <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                  <Link
                    to={`/floorplans?plan=${plan.id}`}
                    className="btn-glow group inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-md hover:bg-accent"
                  >
                    <ButtonGlow />
                    View Full Plan
                    <span className="ml-2 h-px w-4 bg-white transition-all duration-300 group-hover:w-8" />
                  </Link>
                  <Link
                    to="/listings"
                    className="border-b border-accent/40 pb-0.5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-accent transition-colors hover:border-primary hover:text-primary"
                  >
                    See Current Builds
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* The cover */}
          <div className="order-1 flex flex-col items-center lg:order-2">
            <div
              ref={scope}
              className="relative aspect-square w-[min(520px,84vw,58vh)] [perspective:1800px]"
              style={{ willChange: 'transform' }}
            >
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.div
                  key={plan.id}
                  custom={dir}
                  className="absolute inset-0 [transform-style:preserve-3d]"
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: 48 * d }),
                    center: { opacity: 1, x: 0 },
                    exit: (d: number) => ({ opacity: 0, x: -48 * d }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <div
                    className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d]"
                    style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                  >
                    <button
                      type="button"
                      onClick={flip}
                      inert={flipped}
                      aria-label={`Show the ${plan.title} floor plan`}
                      className="absolute inset-0 block cursor-pointer rounded-[6px] [backface-visibility:hidden] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-4 focus-visible:ring-offset-surface"
                      style={{ ...cq, boxShadow: OPEN_SHADOW }}
                    >
                      <CoverFront plan={plan} index={index} eager />
                    </button>
                    <div
                      inert={!flipped}
                      className="absolute inset-0 rounded-[6px] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                      style={{ ...cq, boxShadow: OPEN_SHADOW }}
                    >
                      <CoverBack plan={plan} level={level} onLevel={setLevel} onZoom={openZoom} />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              className="mt-7 flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: show, y: show ? 0 : 10 }}
              transition={{ duration: show ? 0.6 : 0.2, delay: show ? 0.35 : 0, ease: EASE }}
            >
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous home"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/15 bg-white text-primary shadow-sm transition-colors hover:bg-primary hover:text-white lg:hidden"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={flip}
                className="btn-glow inline-flex min-h-11 items-center gap-2.5 rounded-full bg-primary px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-md hover:bg-accent"
              >
                <ButtonGlow />
                <RotateCw size={14} />
                {flipped ? 'Flip to Exterior' : 'Flip to Floor Plan'}
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next home"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/15 bg-white text-primary shadow-sm transition-colors hover:bg-primary hover:text-white lg:hidden"
              >
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>

          {/* Along the shelf */}
          <motion.nav
            aria-label="Floor plans"
            className="order-3 hidden lg:block"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: show, x: show ? 0 : 24 }}
            transition={{ duration: show ? 0.7 : 0.25, delay: show ? 0.24 : 0, ease: EASE }}
          >
            <p className="mb-5 font-sans text-[10px] uppercase tracking-[0.3em] text-primary/45">On the shelf</p>
            <ul className="border-l border-primary/15">
              {floorPlans.map((p, i) => {
                const current = i === index;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={current ? 'true' : undefined}
                      className={`-ml-px flex w-full items-baseline gap-4 border-l-2 py-2.5 pl-5 text-left transition-colors duration-300 ${
                        current ? 'border-accent text-primary' : 'border-transparent text-primary/45 hover:text-primary'
                      }`}
                    >
                      <span className="font-sans text-[10px] tracking-[0.2em] text-accent">{num(i)}</span>
                      <span className="font-serif text-xl">{p.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex gap-3 pl-5">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous home"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/15 bg-white text-primary shadow-sm transition-colors hover:bg-primary hover:text-white"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next home"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/15 bg-white text-primary shadow-sm transition-colors hover:bg-primary hover:text-white"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.nav>
        </div>
      </div>

      <AnimatePresence>
        {zoom && (
          <PlanZoom
            key="zoom"
            src={plan.blueprints[level] ?? plan.blueprints[0]}
            alt={`${plan.title} floor plan, enlarged`}
            from={zoom}
            onClose={closeZoom}
          />
        )}
      </AnimatePresence>

      <motion.button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Put the home back on the shelf"
        className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-md transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 md:right-8 md:top-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: show }}
        transition={{ duration: 0.3 }}
      >
        <X size={22} />
      </motion.button>
    </div>
  );
}

export default function Portfolio() {
  // open: the home taken off the shelf. away: the cover missing from the shelf
  // (stays missing until the opened cover has flown all the way back).
  const [open, setOpen] = useState<number | null>(null);
  const [away, setAway] = useState<string | null>(null);
  const [hot, setHot] = useState<string | null>(null);
  const slots = useRef<Record<string, HTMLElement | null>>({});
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});

  const slotRect = useCallback((id: string) => slots.current[id]?.getBoundingClientRect() ?? null, []);
  const show = useCallback((index: number) => {
    setOpen(index);
    setAway(floorPlans[index].id);
    setHot(null);
  }, []);
  const close = useCallback(() => setOpen(null), []);
  const landed = () => {
    if (away) triggers.current[away]?.focus({ preventScroll: true });
    setAway(null);
  };

  const count = floorPlans.length;

  // The opened home is rendered straight into <body>: this section sits inside
  // the home page's isolated stacking context (see Home.tsx), which would
  // otherwise keep it underneath the navbar.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section id="portfolio" className="relative">
      {/* Heading, centred over the shelf */}
      <div id="portfolio-header" className="px-6 md:px-12 max-w-site-1600 mx-auto pt-32 pb-14 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-[10px] font-sans tracking-[0.3em] uppercase text-accent mb-4">Our Work</h2>
          <h3 className="font-serif text-5xl md:text-6xl text-primary leading-[1.1]">Featured Floor Plans</h3>
          <p className="mx-auto mt-6 max-w-2xl text-primary-light font-sans text-lg leading-relaxed">Explore our curated collection of architectural masterpieces, featuring stunning exteriors and highly functional layouts.</p>
        </motion.div>
      </div>

      {/* The shelf. On phones and tablets it scrolls sideways. */}
      <div className="mx-auto max-w-site lg:px-12">
        <div className="scrollbar-none snap-x snap-mandatory overflow-x-auto px-6 pb-4 pt-8 md:px-12 lg:overflow-visible lg:px-0 lg:pb-0 lg:pt-2">
          <div
            className="grid w-max grid-cols-[repeat(var(--homes),64vw)] gap-x-5 sm:grid-cols-[repeat(var(--homes),38vw)] md:grid-cols-[repeat(var(--homes),29vw)] lg:w-auto lg:grid-cols-[repeat(var(--homes),minmax(0,1fr))] lg:gap-x-8"
            style={{ '--homes': count } as CSSProperties}
          >
            {floorPlans.map((plan, i) => {
              const lifted = hot === plan.id && away !== plan.id;
              return (
                <motion.div
                  key={plan.id}
                  className="snap-center"
                  style={{ gridRow: 1, gridColumn: i + 1 }}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -80px 0px' }}
                  transition={{ duration: 0.9, delay: i * 0.08, ease: EASE }}
                >
                  <button
                    type="button"
                    ref={(el) => {
                      triggers.current[plan.id] = el;
                    }}
                    onClick={() => show(i)}
                    onPointerEnter={(ev) => ev.pointerType === 'mouse' && setHot(plan.id)}
                    onPointerLeave={() => setHot((h) => (h === plan.id ? null : h))}
                    // keyboard focus lifts the cover like hover does; a click's focus doesn't
                    onFocus={(ev) => ev.currentTarget.matches(':focus-visible') && setHot(plan.id)}
                    onBlur={() => setHot((h) => (h === plan.id ? null : h))}
                    aria-haspopup="dialog"
                    aria-label={`${plan.title}: ${specLine(plan)}. Open this home.`}
                    className="group relative block aspect-square w-full cursor-pointer rounded-[4px] [perspective:1100px] focus-visible:outline-none"
                  >
                    <span
                      ref={(el) => {
                        slots.current[plan.id] = el;
                      }}
                      className="absolute inset-0 block origin-bottom rounded-[4px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-visible:ring-2 group-focus-visible:ring-accent/70 group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-surface"
                      style={{
                        ...cq,
                        boxShadow: COVER_SHADOW,
                        transform: lifted ? 'translateY(-7%) rotateX(5deg)' : 'translateY(0) rotateX(0deg)',
                        opacity: away === plan.id ? 0 : 1,
                      }}
                    >
                      <CoverFront plan={plan} index={i} />
                      <span
                        aria-hidden="true"
                        className={`absolute left-1/2 top-[61%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-4 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary shadow-lg transition-opacity duration-300 ${
                          lifted ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        Open
                      </span>
                    </span>
                  </button>
                </motion.div>
              );
            })}

            {/* the shelf itself */}
            <div
              aria-hidden="true"
              className="relative h-[14px] rounded-[3px] lg:-mx-8"
              style={{
                gridRow: 2,
                gridColumn: `1 / span ${count}`,
                background: 'linear-gradient(180deg, #ffffff 0%, #f0efe6 45%, #dcdbcf 100%)',
                boxShadow: '0 18px 26px -12px rgba(26,33,24,0.38), 0 2px 3px rgba(26,33,24,0.14)',
              }}
            />

            {/* index under the shelf, one entry per home */}
            {floorPlans.map((plan, i) => {
              const active = hot === plan.id || away === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => show(i)}
                  onPointerEnter={(ev) => ev.pointerType === 'mouse' && setHot(plan.id)}
                  onPointerLeave={() => setHot((h) => (h === plan.id ? null : h))}
                  className="group relative mt-9 cursor-pointer self-start text-left"
                  style={{ gridRow: 3, gridColumn: i + 1 }}
                >
                  {/* Marks the gap beside this entry for the scroll thread, which runs
                      down one of them (see SHORTENED SECTIONS in ScrollThreadLine).
                      Starts at the shelf, so the thread turns down as it leaves the covers. */}
                  {i < count - 1 && (
                    <span data-thread-lane="" className="pointer-events-none absolute -right-4 -top-12 bottom-0 hidden w-px lg:block" />
                  )}
                  <span
                    className={`block h-px origin-left transition-all duration-500 ${
                      active ? 'bg-accent' : 'bg-primary/20'
                    }`}
                  />
                  <span className="mt-4 block font-sans text-[10px] tracking-[0.3em] text-accent">{num(i)}</span>
                  <span
                    className={`mt-1 block font-serif text-xl leading-tight transition-colors duration-300 lg:text-[22px] ${
                      active ? 'text-accent-dark' : 'text-primary'
                    }`}
                  >
                    {plan.title}
                  </span>
                  <span className="mt-1.5 block font-sans text-xs leading-relaxed text-primary-light">
                    {specLine(plan)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 px-6 pb-8 pt-12 text-center lg:pb-28 lg:pt-14">
        {/* touch screens have no hover cue (and no scroll thread to cross this line) */}
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-primary/45 lg:hidden">
          Tap a home to take it off the shelf
        </p>
        <Link
          to="/floorplans"
          className="btn-glow group inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-md hover:bg-accent"
        >
          <ButtonGlow />
          Explore All Floor Plans
          <span className="ml-2 h-px w-4 bg-white transition-all duration-300 group-hover:w-8" />
        </Link>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence onExitComplete={landed}>
            {open !== null && (
              <Spotlight key="spotlight" index={open} onIndex={show} onClose={close} slotRect={slotRect} />
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
