import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import type { MotionValue } from 'motion/react';
import { ArrowRight, Layers, MapPin, Ruler, Send, Tag, Trees, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { lots, MAP_VIEWBOX } from '../data/rusticPines';
import type { Lot, LotStatus } from '../data/rusticPines';

const PATH = '/rustic-pines';
const NAME = 'Rustic Pines at Paris Landing';
const W = MAP_VIEWBOX.width;
const H = MAP_VIEWBOX.height;

const aerial = (w: number) => `/assets/rustic-pines/aerial-${w}.webp`;
const MAP_SRCSET = [1000, 1400, 1800, 2400].map((w) => `${aerial(w)} ${w}w`).join(', ');
const HERO_SRC = '/assets/rustic-pines/hero-1400.webp';
const HERO_SRCSET = '/assets/rustic-pines/hero-800.webp 800w, /assets/rustic-pines/hero-1400.webp 1400w';
const SITE = 'https://www.homefrontbuilderstn.com';
const PAGE_URL = `${SITE}${PATH}`;
const OG_URL = `${SITE}/assets/rustic-pines/rustic-pines-og.jpg`;
const OG_ALT = 'Aerial site plan of Rustic Pines at Paris Landing in Stewart County, Tennessee';
/** Phone/tablet zoom level for the map (desktop never zooms). */
const ZOOM = 2.3;

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;
const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;

/*
 * Map geometry. Every lot is drawn twice:
 *  - flat, as an SVG polygon over the aerial photo (outline, label, hit area);
 *  - lifted, as a small stack of clip-path'd divs sized to the lot's OWN bounding box
 *    (photo piece on top, soil layers underneath, the dark hole it leaves behind).
 * Sizing the lifted layers to the lot's box, not the whole map, keeps each composited
 * layer small. Only transform and opacity animate: no blur, filters, or masks, because
 * those have failed on the owner's GPU before.
 */
interface LotGeo extends Lot {
  box: CSSProperties;
  clip: string;
  origin: string;
  mapOrigin: string;
  ox: number;
  oy: number;
  bgSize: string;
  bgPos: string;
  viewBox: string;
}

const geo: LotGeo[] = lots.map((lot) => {
  const pts = lot.points.split(' ').map((p) => p.split(',').map(Number) as [number, number]);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  const bw = Math.max(...xs) - x0;
  const bh = Math.max(...ys) - y0;
  const [lx, ly] = lot.label;
  return {
    ...lot,
    box: { left: pct(x0, W), top: pct(y0, H), width: pct(bw, W), height: pct(bh, H) },
    clip: `polygon(${pts.map(([x, y]) => `${pct(x - x0, bw)} ${pct(y - y0, bh)}`).join(', ')})`,
    origin: `${pct(lx - x0, bw)} ${pct(ly - y0, bh)}`,
    mapOrigin: `${pct(lx, W)} ${pct(ly, H)}`,
    ox: (lx / W) * 100,
    oy: (ly / H) * 100,
    bgSize: `${pct(W, bw)} ${pct(H, bh)}`,
    bgPos: `${pct(x0, W - bw)} ${pct(y0, H - bh)}`,
    viewBox: `${x0} ${y0} ${bw} ${bh}`,
  };
});
const byNumber = new Map(geo.map((l) => [l.number, l]));

const STATUS_LABEL: Record<LotStatus, string> = { available: 'Available', pending: 'Pending', sold: 'Sold' };
const STATUS_DOT: Record<LotStatus, string> = {
  available: 'bg-emerald-400',
  pending: 'bg-amber-400',
  sold: 'bg-red-400',
};

type PhaseFilter = 'all' | 1 | 2 | 3;
type PriceFilter = 'all' | 'under100' | '100to150' | 'over150';
const PRICE_FILTERS: { key: PriceFilter; label: string; test: (p: number) => boolean }[] = [
  { key: 'all', label: 'Any Price', test: () => true },
  { key: 'under100', label: 'Under $100K', test: (p) => p < 100000 },
  { key: '100to150', label: '$100K – $150K', test: (p) => p >= 100000 && p <= 150000 },
  { key: 'over150', label: '$150K+', test: (p) => p > 150000 },
];

// Lot-specific notes, straight from the survey's general notes.
const LOT_NOTES: Record<number, string> = {
  18: 'Shares a 20-ft ingress/egress easement with Lot 19 along their common boundary line.',
  19: 'Shares a 20-ft ingress/egress easement with Lot 18 along their common boundary line.',
};

const available = lots.filter((l) => l.status === 'available');
const MIN_ACRES = Math.min(...lots.map((l) => l.acres));
const MAX_ACRES = Math.max(...lots.map((l) => l.acres));
const FROM_PRICE = Math.min(...(available.length ? available : lots).map((l) => l.price));
const TOTAL_ACRES = Math.round(lots.reduce((s, l) => s + l.acres, 0));

const schema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': `${PAGE_URL}#lots`,
  name: `${NAME} — Homesites for Sale`,
  numberOfItems: lots.length,
  itemListElement: lots.map((l, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Product',
      name: `Lot ${l.number}, ${NAME}`,
      description: `${l.acres}-acre wooded homesite in Phase ${l.phase} of ${NAME}, Stewart County, Tennessee.`,
      image: OG_URL,
      category: 'Land',
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Lot size', value: l.acres, unitCode: 'ACR', unitText: 'acres' },
        { '@type': 'PropertyValue', name: 'Phase', value: l.phase },
      ],
      offers: {
        '@type': 'Offer',
        price: l.price,
        priceCurrency: 'USD',
        availability:
          l.status === 'sold'
            ? 'https://schema.org/SoldOut'
            : l.status === 'pending'
              ? 'https://schema.org/LimitedAvailability'
              : 'https://schema.org/InStock',
        url: PAGE_URL,
      },
    },
  })),
};

const MAX_PRICE = Math.max(...lots.map((l) => l.price));
const TITLE = 'Rustic Pines Lots for Sale in Stewart County, TN | Homefront Builders';
const DESCRIPTION = `${lots.length} wooded lots for sale at Rustic Pines at Paris Landing, Stewart County, TN (Dover area): ${MIN_ACRES}–${MAX_ACRES} acres from ${usd(FROM_PRICE)}. See the interactive lot map.`;

/** Shown on the page AND emitted as FAQPage data. Every answer comes from the survey or the lot schedule. */
const FAQS: [string, string][] = [
  [
    'Where is Rustic Pines at Paris Landing?',
    'Rustic Pines at Paris Landing is in Stewart County, Tennessee, east of State Highway 232 in the 11th Civil District (Dover area), near Paris Landing and Kentucky Lake.',
  ],
  [
    'How large are the lots at Rustic Pines?',
    `There are ${lots.length} wooded homesites ranging from ${MIN_ACRES} to ${MAX_ACRES} acres, about ${TOTAL_ACRES} acres in all.`,
  ],
  [
    'How much do lots at Rustic Pines cost?',
    `Lots are listed from ${usd(FROM_PRICE)} to ${usd(MAX_PRICE)}, depending on size and location. Every lot's list price is shown on the interactive map and in the lot schedule.`,
  ],
  [
    'Is Rustic Pines being developed in phases?',
    'Yes. Phase 1 includes Lots 1–11, Phase 2 includes Lots 12–28, and Phase 3 includes Lots 29–41.',
  ],
  [
    'Are there building setbacks or easements?',
    'The recorded survey sets a 75-foot minimum front building setback along all road frontage, plus a 50-foot ingress/egress and public utility easement centered on the main road.',
  ],
  [
    'Can Homefront Builders build my home on a Rustic Pines lot?',
    'Yes. Pair your homesite with a Homefront Builders floor plan and our team can build your custom home on it. Contact us to start planning.',
  ],
  [
    'How do I inquire about a specific lot?',
    'Select the lot on the interactive map and use the Inquire button, or contact Homefront Builders directly, and we will follow up with availability and next steps.',
  ],
];

const STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: 'en-US',
    isPartOf: { '@type': 'WebSite', name: 'Homefront Builders', url: SITE },
    publisher: { '@id': `${SITE}/#business` },
    primaryImageOfPage: { '@type': 'ImageObject', url: OG_URL, width: 1200, height: 630 },
    about: {
      '@type': 'Place',
      name: NAME,
      description: `${lots.length}-lot wooded subdivision east of State Highway 232 in Stewart County, Tennessee.`,
      address: { '@type': 'PostalAddress', addressLocality: 'Dover', addressRegion: 'TN', addressCountry: 'US' },
      containedInPlace: { '@type': 'AdministrativeArea', name: 'Stewart County, Tennessee' },
    },
    mainEntity: { '@id': `${PAGE_URL}#lots` },
  },
  schema,
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: NAME, item: PAGE_URL },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  },
];

// ─── Lifted lot ────────────────────────────────────────────────────────────────

const RISE = 26;
const SOIL = ['#1f150b', '#2b1d10', '#372615', '#432f19', '#4f381e', '#5a4023'];
/** Rising: a quick, well-damped spring (settles in ~0.35s, no wobble). */
const liftSpring = { type: 'spring', stiffness: 340, damping: 32, mass: 0.8 } as const;
/** Dropping back: a short fixed-length tween, so a lot you've left never lingers. */
const dropTween = { type: 'tween', duration: 0.2, ease: [0.4, 0, 0.2, 1] } as const;
const tiltSpring = { stiffness: 150, damping: 20, mass: 0.6 };
/** How many lots may still be finishing their drop at once while you sweep across the map. */
const MAX_DROPPING = 3;

function LiftedLot({
  lot,
  src,
  raised,
  targetX,
  targetY,
  reduce,
  onDropped,
}: {
  lot: LotGeo;
  src: string;
  raised: boolean;
  targetX: MotionValue<number>;
  targetY: MotionValue<number>;
  reduce: boolean;
  onDropped: (n: number) => void;
}) {
  // Each lifted lot owns its tilt spring: it follows the cursor while raised and
  // eases back to flat on its own once the pointer moves to another lot.
  const rotateX = useSpring(0, tiltSpring);
  const rotateY = useSpring(0, tiltSpring);
  useEffect(() => {
    if (!raised || reduce) {
      rotateX.set(0);
      rotateY.set(0);
      return;
    }
    rotateX.set(targetX.get());
    rotateY.set(targetY.get());
    const offX = targetX.on('change', (v) => rotateX.set(v));
    const offY = targetY.on('change', (v) => rotateY.set(v));
    return () => {
      offX();
      offY();
    };
  }, [raised, reduce, targetX, targetY, rotateX, rotateY]);

  const rise = reduce ? 0 : RISE;
  const t = raised ? liftSpring : dropTween;
  const layer: CSSProperties = {
    ...lot.box,
    clipPath: lot.clip,
    WebkitClipPath: lot.clip,
    transformOrigin: lot.origin,
    willChange: 'transform',
  };

  return (
    <motion.div
      data-lifted={lot.number}
      className="absolute inset-0 pointer-events-none"
      style={{ rotateX, rotateY, transformPerspective: 1100, transformOrigin: lot.mapOrigin, zIndex: raised ? 2 : 1 }}
    >
      {/* cast shadow on the ground */}
      <motion.div
        className="absolute bg-black"
        style={layer}
        initial={{ opacity: 0, x: 0, y: 0 }}
        animate={raised && !reduce ? { opacity: 0.42, x: 12, y: 16 } : { opacity: 0, x: 0, y: 0 }}
        transition={t}
      />
      {/* the hole the lot leaves behind */}
      <motion.div
        className="absolute bg-[#060905]"
        style={{ ...layer, willChange: 'opacity' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: raised ? 0.92 : 0 }}
        transition={raised ? { duration: 0.2 } : dropTween}
      />
      {/* soil strata: stacked copies that fan out between the hole and the raised piece */}
      {!reduce &&
        SOIL.map((color, i) => {
          const k = (i + 1) / (SOIL.length + 1);
          return (
            <motion.div
              key={color}
              className="absolute"
              style={{ ...layer, background: color }}
              initial={{ y: 0, scale: 1 }}
              animate={raised ? { y: -rise * k, scale: 1 + 0.035 * k } : { y: 0, scale: 1 }}
              transition={t}
            />
          );
        })}
      {/* the lot itself, cut out of the aerial */}
      <motion.div
        className="absolute"
        style={{ ...layer, backgroundImage: `url(${src})`, backgroundSize: lot.bgSize, backgroundPosition: lot.bgPos }}
        initial={{ y: 0, scale: 1 }}
        animate={raised ? { y: -rise, scale: reduce ? 1 : 1.035 } : { y: 0, scale: 1 }}
        transition={t}
        onAnimationComplete={() => {
          if (!raised) onDropped(lot.number);
        }}
      >
        <svg viewBox={lot.viewBox} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id={`sheen-${lot.number}`} x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.26" />
              <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={lot.points}
            fill={`url(#sheen-${lot.number})`}
            stroke="#f3e2bd"
            strokeWidth={3}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </motion.div>
      {/* the lot number rides up and down with the piece */}
      <div className="absolute" style={{ left: `${lot.ox}%`, top: `${lot.oy}%`, transform: 'translate(-50%, -50%)' }}>
        <motion.div
          className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#B48C36] ring-2 ring-white flex items-center justify-center text-white text-xs md:text-sm font-semibold shadow-lg"
          initial={{ y: 0, opacity: 0 }}
          animate={raised ? { y: -rise, opacity: 1 } : { y: 0, opacity: 0 }}
          transition={t}
        >
          {lot.number}
        </motion.div>
      </div>
    </motion.div>
  );
}

function LotBadge({ lot, dim = false }: { lot: Lot; dim?: boolean }) {
  const [x, y] = lot.label;
  return (
    <g opacity={dim ? 0.3 : 1} style={{ transition: 'opacity 0.4s' }}>
      <circle cx={x} cy={y} r={15} fill="rgba(27,37,24,0.85)" stroke="rgba(201,169,110,0.95)" strokeWidth={1.5} />
      <text
        x={x}
        y={y}
        dy="0.35em"
        textAnchor="middle"
        fontSize={15}
        fontWeight={600}
        fill="#fff"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
      >
        {lot.number}
      </text>
    </g>
  );
}

// ─── Panels ────────────────────────────────────────────────────────────────────

const panelIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
} as const;

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.05] ring-1 ring-white/10 px-4 py-3">
      <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-white/50">
        <Icon className="w-3.5 h-3.5" /> {label}
      </dt>
      <dd className="mt-1 text-lg font-medium text-white">{value}</dd>
    </div>
  );
}

function LotDetails({ lot, onInquire }: { lot: Lot; onInquire: (n: number) => void }) {
  const perAcre = Math.round(lot.price / lot.acres);
  return (
    <motion.div {...panelIn}>
      <div className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.3em] text-[#c9a96e]">
        <span>Phase {lot.phase}</span>
        <span className="w-1 h-1 rounded-full bg-white/30" />
        <span className="inline-flex items-center gap-1.5 text-white/80">
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[lot.status]}`} />
          {STATUS_LABEL[lot.status]}
        </span>
      </div>
      <h3 className="font-serif text-5xl md:text-6xl text-white mt-3 leading-none">Lot {lot.number}</h3>
      <p className="font-serif text-3xl text-[#c9a96e] mt-3">{usd(lot.price)}</p>
      <dl className="grid grid-cols-2 gap-3 mt-7">
        <Stat icon={Ruler} label="Acreage" value={`${lot.acres.toFixed(2)} ac`} />
        <Stat icon={Tag} label="Per Acre" value={usd(perAcre)} />
        <Stat icon={Layers} label="Phase" value={`Phase ${lot.phase}`} />
        <Stat icon={Trees} label="Setting" value="Wooded" />
      </dl>
      <ul className="mt-6 space-y-2 text-sm text-white/65 leading-relaxed">
        <li className="flex gap-2">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#c9a96e]" />
          75-ft minimum front building setback from the road.
        </li>
        {LOT_NOTES[lot.number] && (
          <li className="flex gap-2">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#c9a96e]" />
            {LOT_NOTES[lot.number]}
          </li>
        )}
      </ul>
      {lot.status !== 'sold' && (
        <button
          type="button"
          onClick={() => onInquire(lot.number)}
          className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#B48C36] hover:bg-[#967226] text-white text-xs font-semibold uppercase tracking-[0.2em] py-4 transition-colors"
        >
          Inquire About Lot {lot.number} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

function Overview({ canHover }: { canHover: boolean }) {
  return (
    <motion.div {...panelIn}>
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a96e]">Interactive Site Plan</p>
      <h3 className="font-serif text-4xl text-white mt-3 leading-tight">Find your piece of the woods.</h3>
      <p className="mt-4 text-sm text-white/65 leading-relaxed">
        {canHover ? 'Hover over' : 'Tap'} any lot to lift it off the map and see its acreage, price, and phase.
        {canHover && ' Click a lot to keep it selected.'}
      </p>
      <dl className="grid grid-cols-2 gap-3 mt-8">
        <Stat icon={Trees} label="Homesites" value={String(lots.length)} />
        <Stat icon={Tag} label="Lots From" value={usd(FROM_PRICE)} />
        <Stat icon={Ruler} label="Lot Sizes" value={`${Math.floor(MIN_ACRES)}–${Math.ceil(MAX_ACRES)} ac`} />
        <Stat icon={Layers} label="Phases" value="3" />
      </dl>
      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60">
        {(Object.keys(STATUS_LABEL) as LotStatus[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`} />
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Inquiry form ──────────────────────────────────────────────────────────────

function InquiryModal({ lotNumber, onClose }: { lotNumber: number; onClose: () => void }) {
  const lot = byNumber.get(lotNumber)!;
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('loading');
    const fd = new FormData(e.currentTarget);
    fd.append('access_key', '6734d3d0-0e39-4112-b5b6-3247d6699948');
    fd.append('subject', `Rustic Pines Lot ${lot.number} Inquiry - ${fd.get('name')}`);
    fd.append('from_name', 'Homefront Builders Website');
    fd.append('Request Type', 'Rustic Pines Lot Inquiry');
    fd.append('Lot', `Lot ${lot.number} — ${lot.acres} ac — ${usd(lot.price)} (Phase ${lot.phase})`);
    fd.append('Requested Via', 'Rustic Pines page');
    const email = fd.get('email');
    if (email) fd.append('replyto', String(email));
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
      const json = await res.json();
      setState(json.success ? 'success' : 'error');
    } catch {
      setState('error');
    }
  };

  const field =
    'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-base md:text-sm text-primary placeholder:text-neutral-400 focus:outline-none focus:border-[#B48C36] focus:ring-2 focus:ring-[#B48C36]/20 transition';

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-[#0b1009]/75" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lot-inquiry-title"
        className="relative w-full sm:max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl p-7 md:p-9 max-h-[92vh] overflow-y-auto overscroll-contain"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-primary/60 hover:text-primary hover:bg-black/5 transition"
        >
          <X className="w-5 h-5" />
        </button>
        {state === 'success' ? (
          <div className="text-center py-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Request Received</p>
            <h3 className="font-serif text-3xl text-primary mt-3">Thank you!</h3>
            <p className="mt-4 text-sm text-primary/70 leading-relaxed">
              We&apos;ve got your interest in Lot {lot.number}. A member of the Homefront team will reach out shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 rounded-full bg-[#1b2518] text-white text-xs font-semibold uppercase tracking-[0.2em] px-8 py-3.5"
            >
              Back to the Map
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent">
              Phase {lot.phase} · {lot.acres.toFixed(2)} Acres · {usd(lot.price)}
            </p>
            <h3 id="lot-inquiry-title" className="font-serif text-3xl text-primary !mt-2">
              Inquire About Lot {lot.number}
            </h3>
            <input type="hidden" name="Lot Number" value={lot.number} />
            <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
            <input required name="name" placeholder="Full name" autoComplete="name" className={field} />
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                type="email"
                name="email"
                placeholder="Email"
                autoComplete="email"
                inputMode="email"
                className={field}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone (optional)"
                autoComplete="tel"
                inputMode="tel"
                className={field}
              />
            </div>
            <textarea
              name="message"
              rows={4}
              className={field}
              defaultValue={`I'm interested in Lot ${lot.number} at Rustic Pines at Paris Landing. Please send me more information.`}
            />
            {state === 'error' && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#1b2518] hover:bg-[#2E362C] disabled:opacity-60 text-white text-xs font-semibold uppercase tracking-[0.2em] py-4 transition-colors"
            >
              {state === 'loading' ? 'Sending…' : 'Send Inquiry'} <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type SortKey = 'number' | 'acres' | 'price';
const SORT_LABEL: Record<SortKey, string> = { number: 'Lot #', acres: 'Acres', price: 'Price' };

/** Grace period before "pointer left a lot" counts, so crossing a road between lots doesn't flicker. */
const LEAVE_GRACE_MS = 90;

/** A chip row that wraps on desktop and becomes one swipeable line on phones. */
const CHIP_ROW =
  'flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export default function RusticPines() {
  const reduce = !!useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<PhaseFilter>('all');
  const [price, setPrice] = useState<PriceFilter>('all');
  const [inquiry, setInquiry] = useState<number | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'number', dir: 1 });
  const [canHover, setCanHover] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const [pieceSrc, setPieceSrc] = useState(aerial(1400));
  const mapRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const leaveTimer = useRef<number | undefined>(undefined);

  const active = hovered ?? selected;
  const activeLot = active != null ? (byNumber.get(active) ?? null) : null;
  const selectedLot = selected != null ? (byNumber.get(selected) ?? null) : null;

  /*
   * Which lifted stacks are on screen: the one raised lot, plus up to MAX_DROPPING lots still
   * finishing their drop. Updated during render (React's "adjust state on prop change" pattern)
   * so the swap lands in the same frame as the hover. A dropping lot you return to keeps its
   * element and simply reverses; a lot is removed the moment its drop finishes.
   */
  const [shown, setShown] = useState<{ current: number | null; dropping: number[] }>({ current: null, dropping: [] });
  if (shown.current !== active) {
    const dropping = [...shown.dropping, ...(shown.current != null ? [shown.current] : [])]
      .filter((n) => n !== active)
      .slice(-MAX_DROPPING);
    setShown({ current: active, dropping });
  }
  const onDropped = useCallback(
    (n: number) =>
      setShown((s) => (s.dropping.includes(n) ? { ...s, dropping: s.dropping.filter((x) => x !== n) } : s)),
    [],
  );
  const stacks = [...shown.dropping, ...(shown.current != null ? [shown.current] : [])];

  // Cursor-driven tilt target for whichever lot is raised.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const onMapMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || reduce || !activeLot || !mapRef.current) return;
    const r = mapRef.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    tiltY.set(clamp((px - activeLot.ox) / 10) * 8);
    tiltX.set(clamp((py - activeLot.oy) / 10) * -8);
  };

  const enterLot = useCallback((n: number) => {
    window.clearTimeout(leaveTimer.current);
    setHovered(n);
  }, []);
  const leaveLot = useCallback((n: number) => {
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setHovered((h) => (h === n ? null : h)), LEAVE_GRACE_MS);
  }, []);
  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // The raised piece reuses whichever aerial size the browser picked for the map, and we decode
  // that file up front so the very first hover doesn't stall on an image decode.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const sync = () => {
      if (!img.currentSrc) return;
      setPieceSrc(img.currentSrc);
      const warm = new Image();
      warm.src = img.currentSrc;
      warm.decode?.().catch(() => {});
    };
    if (img.complete) sync();
    img.addEventListener('load', sync);
    return () => img.removeEventListener('load', sync);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (inquiry != null) setInquiry(null);
      else setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inquiry]);

  useEffect(() => {
    if (inquiry == null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [inquiry]);

  // On zoom-in, centre the view on the selected lot (or the middle of the map).
  useEffect(() => {
    const sc = scrollerRef.current;
    if (!zoomed || !sc) return;
    const focus = selected != null ? byNumber.get(selected) : undefined;
    const fx = focus ? focus.ox / 100 : 0.5;
    const fy = focus ? focus.oy / 100 : 0.5;
    const id = requestAnimationFrame(() =>
      sc.scrollTo({ left: fx * sc.scrollWidth - sc.clientWidth / 2, top: fy * sc.scrollHeight - sc.clientHeight / 2 }),
    );
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomed]);

  const matches = useCallback(
    (l: Lot) => (phase === 'all' || l.phase === phase) && PRICE_FILTERS.find((f) => f.key === price)!.test(l.price),
    [phase, price],
  );

  const tableLots = useMemo(
    () =>
      lots
        .filter(matches)
        .slice()
        .sort((a, b) => (a[sort.key] - b[sort.key]) * sort.dir),
    [matches, sort],
  );

  const showOnMap = useCallback(
    (n: number) => {
      setSelected(n);
      mapSectionRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    },
    [reduce],
  );

  /*
   * The heavy, mostly-static parts of the map (41 outlines + badges, 41 hit areas) and the lot
   * list are memoised, so hovering a lot re-renders only the lifted stack and the side panel.
   */
  const flatLayer = useMemo(
    () => (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        {geo.map((l) => {
          const on = matches(l);
          const fill =
            l.status === 'sold'
              ? 'rgba(127,29,29,0.55)'
              : l.status === 'pending'
                ? 'rgba(217,119,6,0.3)'
                : on
                  ? 'rgba(201,169,110,0.07)'
                  : 'rgba(8,12,7,0.6)';
          return (
            <polygon
              key={l.number}
              points={l.points}
              fill={fill}
              stroke={on ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)'}
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
              style={{ transition: 'fill 0.4s, stroke 0.4s' }}
            />
          );
        })}
        <g className={zoomed ? '' : 'hidden sm:inline'}>
          {geo.map((l) => (
            <LotBadge key={l.number} lot={l} dim={!matches(l)} />
          ))}
        </g>
      </svg>
    ),
    [matches, zoomed],
  );

  const hitLayer = useMemo(
    () => (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
        role="group"
        aria-label="Rustic Pines lot map"
      >
        {geo.map((l) => (
          <polygon
            key={l.number}
            points={l.points}
            fill="transparent"
            className="cursor-pointer focus:outline-none"
            role="button"
            tabIndex={0}
            aria-label={`Lot ${l.number}: ${l.acres} acres, ${usd(l.price)}, ${STATUS_LABEL[l.status]}`}
            aria-pressed={selected === l.number}
            onPointerEnter={(e) => e.pointerType === 'mouse' && enterLot(l.number)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && leaveLot(l.number)}
            onClick={() => setSelected((s) => (s === l.number && canHover ? null : l.number))}
            onFocus={(e) => e.currentTarget.matches(':focus-visible') && enterLot(l.number)}
            onBlur={() => setHovered((h) => (h === l.number ? null : h))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelected(l.number);
              }
            }}
          />
        ))}
      </svg>
    ),
    [selected, canHover, enterLot, leaveLot],
  );

  const lotList = useMemo(() => {
    const toggleSort = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : 1 }));
    const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === 1 ? '↑' : '↓') : '');
    const sortHeader = (key: SortKey, label: string) => (
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className="inline-flex items-center gap-1 uppercase tracking-[0.15em] hover:text-primary"
      >
        {label}
        <span className="text-accent">{arrow(key)}</span>
      </button>
    );
    return (
      <>
        {/* phones: sort chips + tappable cards */}
        <div className={`${CHIP_ROW} md:hidden mb-4`}>
          {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => toggleSort(k)}
              className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-semibold border transition-colors ${
                sort.key === k ? 'bg-[#1b2518] text-white border-[#1b2518]' : 'border-neutral-200 text-primary/70'
              }`}
            >
              Sort: {SORT_LABEL[k]} {arrow(k)}
            </button>
          ))}
        </div>
        <ul className="md:hidden rounded-2xl border border-neutral-200 bg-white overflow-hidden divide-y divide-neutral-100">
          {tableLots.map((l) => (
            <li key={l.number}>
              <button
                type="button"
                onClick={() => showOnMap(l.number)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left active:bg-surface transition-colors"
              >
                <span>
                  <span className="block font-serif text-lg text-primary">Lot {l.number}</span>
                  <span className="block text-xs text-primary/55 mt-0.5">
                    Phase {l.phase} · {l.acres.toFixed(2)} ac
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-medium text-primary">{usd(l.price)}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-primary/60 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[l.status]}`} />
                    {STATUS_LABEL[l.status]}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* tablet + desktop: full table */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[720px] text-sm whitespace-nowrap">
            <thead className="text-[10px] text-primary/50 bg-surface-alt">
              <tr className="text-left">
                <th className="px-5 py-4 font-semibold">{sortHeader('number', 'Lot')}</th>
                <th className="px-5 py-4 font-semibold uppercase tracking-[0.15em]">Phase</th>
                <th className="px-5 py-4 font-semibold">{sortHeader('acres', 'Acres')}</th>
                <th className="px-5 py-4 font-semibold">{sortHeader('price', 'List Price')}</th>
                <th className="px-5 py-4 font-semibold uppercase tracking-[0.15em]">Per Acre</th>
                <th className="px-5 py-4 font-semibold uppercase tracking-[0.15em]">Status</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody>
              {tableLots.map((l) => (
                <tr key={l.number} className="border-t border-neutral-100 hover:bg-surface transition-colors">
                  <td className="px-5 py-4 font-serif text-lg text-primary">Lot {l.number}</td>
                  <td className="px-5 py-4 text-primary/70">Phase {l.phase}</td>
                  <td className="px-5 py-4 text-primary">{l.acres.toFixed(2)}</td>
                  <td className="px-5 py-4 font-medium text-primary">{usd(l.price)}</td>
                  <td className="px-5 py-4 text-primary/60">{usd(Math.round(l.price / l.acres))}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 text-primary/80">
                      <span className={`w-2 h-2 rounded-full ${STATUS_DOT[l.status]}`} />
                      {STATUS_LABEL[l.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => showOnMap(l.number)}
                      className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent hover:text-accent-dark"
                    >
                      View on Map <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }, [tableLots, sort, showOnMap]);

  const chip = (on: boolean) =>
    `shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-semibold transition-colors duration-300 ${
      on
        ? 'bg-[#c9a96e] text-[#1b2518] border border-[#c9a96e]'
        : 'bg-transparent text-white/70 border border-white/15 hover:border-white/50 hover:text-white'
    }`;

  return (
    <div className="bg-surface">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="geo.region" content="US-TN" />
        <meta name="geo.placename" content="Dover, Stewart County, Tennessee" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Homefront Builders" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content={OG_URL} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={OG_ALT} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={OG_URL} />
        <meta name="twitter:image:alt" content={OG_ALT} />
        {STRUCTURED_DATA.map((d, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(d)}
          </script>
        ))}
      </Helmet>

      {/* Hero */}
      <section className="relative h-[480px] md:h-[580px] overflow-hidden bg-[#1b2518]">
        <img
          src={HERO_SRC}
          srcSet={HERO_SRCSET}
          sizes="100vw"
          alt="Aerial view of the wooded Rustic Pines at Paris Landing subdivision in Stewart County, Tennessee"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b2518]/80 via-[#1b2518]/55 to-[#1b2518]" />
        <div className="relative z-10 h-full flex items-center justify-center pt-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl"
          >
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#c9a96e] mb-5">Now Selling · Stewart County, TN</p>
            <h1 className="font-serif text-5xl md:text-7xl text-white tracking-wide leading-[1.02]">
              Rustic Pines
              <span className="block text-2xl md:text-4xl mt-3 text-white/85 italic">at Paris Landing</span>
            </h1>
            <p className="mt-6 text-white/75 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              {lots.length} wooded homesites for sale, from {MIN_ACRES} to {MAX_ACRES} acres, east of State Highway 232
              in Stewart County near Paris Landing. Choose your lot on the map below.
            </p>
            <button
              type="button"
              onClick={() => mapSectionRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })}
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#B48C36] hover:bg-[#967226] text-white text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 transition-colors"
            >
              Explore the Lots <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#1b2518] border-y border-white/10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            [String(lots.length), 'Homesites'],
            [`${Math.floor(MIN_ACRES)}–${Math.ceil(MAX_ACRES)}`, 'Acres per Lot'],
            [usd(FROM_PRICE), 'Lots From'],
            [`${TOTAL_ACRES}`, 'Total Acres'],
          ].map(([value, label], i) => (
            <div
              key={label}
              className={`py-7 md:py-9 text-center ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t md:border-t-0' : ''} md:border-l first:md:border-l-0 border-white/10`}
            >
              <p className="font-serif text-3xl md:text-4xl text-white">{value}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/50">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive map */}
      <section ref={mapSectionRef} id="lot-map" className="bg-[#1b2518] px-4 md:px-8 pb-20 md:pb-28 scroll-mt-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="pt-12 md:pt-16 pb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#c9a96e]">The Site Plan</p>
              <h2 className="font-serif text-3xl md:text-5xl text-white mt-3">Choose Your Homesite</h2>
            </div>
            <div className="flex flex-col gap-3 min-w-0">
              <div className={CHIP_ROW}>
                {(['all', 1, 2, 3] as PhaseFilter[]).map((p) => (
                  <button key={p} type="button" onClick={() => setPhase(p)} className={chip(phase === p)}>
                    {p === 'all' ? 'All Phases' : `Phase ${p}`}
                  </button>
                ))}
              </div>
              <div className={CHIP_ROW}>
                {PRICE_FILTERS.map((f) => (
                  <button key={f.key} type="button" onClick={() => setPrice(f.key)} className={chip(price === f.key)}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start">
            {/* map frame: overlays (hint, zoom, compass, credit) stay put while the map itself can pan */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10 select-none">
              <div
                ref={scrollerRef}
                className={`w-full ${zoomed ? 'overflow-auto overscroll-contain lg:overflow-hidden' : 'overflow-hidden'} [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
                style={{ aspectRatio: `${W} / ${H}` }}
              >
                <div
                  ref={mapRef}
                  className={`relative ${zoomed ? 'w-[230%] lg:w-full' : 'w-full'}`}
                  style={{ aspectRatio: `${W} / ${H}` }}
                  onPointerMove={onMapMove}
                  onPointerLeave={() => {
                    window.clearTimeout(leaveTimer.current);
                    setHovered(null);
                    tiltX.set(0);
                    tiltY.set(0);
                  }}
                >
                  <img
                    ref={imgRef}
                    src={aerial(1400)}
                    srcSet={MAP_SRCSET}
                    sizes={zoomed ? `${ZOOM * 100}vw` : '(min-width: 1024px) 1000px, 100vw'}
                    alt="Aerial site plan of Rustic Pines at Paris Landing showing all 41 lots"
                    decoding="async"
                    fetchPriority="low"
                    draggable={false}
                    className="absolute inset-0 w-full h-full"
                  />

                  {flatLayer}

                  {/* dim the rest of the map while a lot is raised */}
                  <motion.div
                    className="absolute inset-0 bg-[#0b1009] pointer-events-none"
                    style={{ willChange: 'opacity' }}
                    initial={false}
                    animate={{ opacity: activeLot ? 0.5 : 0 }}
                    transition={{ duration: activeLot ? 0.22 : 0.3 }}
                  />

                  {stacks.map((n) => (
                    <LiftedLot
                      key={n}
                      lot={byNumber.get(n)!}
                      src={pieceSrc}
                      raised={n === shown.current}
                      targetX={tiltX}
                      targetY={tiltY}
                      reduce={reduce}
                      onDropped={onDropped}
                    />
                  ))}

                  {/* hit areas: always flat, always on top, so hover never flickers while a lot moves */}
                  {hitLayer}
                </div>
              </div>

              <AnimatePresence>
                {!activeLot && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute left-3 bottom-3 md:left-5 md:bottom-5 pointer-events-none rounded-full bg-[#1b2518]/85 ring-1 ring-white/15 px-4 py-2 text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/85"
                  >
                    {canHover ? 'Hover a lot to explore' : zoomed ? 'Drag to pan · Tap a lot' : 'Tap a lot for details'}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                aria-pressed={zoomed}
                className="lg:hidden absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#1b2518]/90 ring-1 ring-white/20 px-3.5 py-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-white active:bg-[#2E362C]"
              >
                {zoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                {zoomed ? 'Zoom Out' : 'Zoom In'}
              </button>
              <p className="absolute right-2 bottom-1.5 md:right-3 md:bottom-2 pointer-events-none text-[8px] md:text-[9px] text-white/55">
                Imagery ©2025 Airbus, Maxar Technologies · Google
              </p>
              <div className="absolute right-3 top-3 md:right-5 md:top-5 pointer-events-none w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#1b2518]/85 ring-1 ring-white/15 flex flex-col items-center justify-center text-white">
                <span className="block w-0 h-0 border-x-[4px] border-x-transparent border-b-[7px] border-b-[#c9a96e]" />
                <span className="text-[9px] md:text-[10px] font-semibold leading-none mt-0.5">N</span>
              </div>
            </div>

            {/* desktop details panel: swaps instantly (keyed), no stacked cross-fades */}
            <aside className="hidden lg:block sticky top-28">
              <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-8 min-h-[560px]">
                {activeLot ? (
                  <LotDetails key={activeLot.number} lot={activeLot} onInquire={setInquiry} />
                ) : (
                  <Overview key="overview" canHover={canHover} />
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Every lot */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Lot Schedule</p>
              <h2 className="font-serif text-3xl md:text-5xl text-primary mt-3">Every Homesite</h2>
            </div>
            <p className="text-sm text-primary/60">
              Showing {tableLots.length} of {lots.length} lots
              {phase !== 'all' || price !== 'all' ? ' matching your filters' : ''}
            </p>
          </div>
          {lotList}
        </div>
      </section>

      {/* Community details */}
      <section className="pb-20 md:pb-28 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-accent">The Community</p>
            <h2 className="font-serif text-3xl md:text-5xl text-primary mt-3 leading-tight">
              Room to breathe, built your way.
            </h2>
            <p className="mt-6 text-primary/70 leading-relaxed">
              Rustic Pines at Paris Landing is a {TOTAL_ACRES}-acre wooded subdivision in Stewart County, Tennessee, in
              the Dover area near Paris Landing and Kentucky Lake, laid out as {lots.length} homesites across three phases. Every lot is served by the community&apos;s own
              road network, Rustic Pine Road, Bramble Lane, Coyote Lane, and Harvest Moon Drive, or fronts State
              Highway 232.
            </p>
            <p className="mt-4 text-primary/70 leading-relaxed">
              Pair your homesite with a Homefront plan, and we&apos;ll build the home to match the land.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/floorplans"
                className="inline-flex items-center gap-2 rounded-full bg-[#1b2518] hover:bg-[#2E362C] text-white text-xs font-semibold uppercase tracking-[0.2em] px-7 py-4 transition-colors"
              >
                Browse Floor Plans <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact-us"
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 hover:border-primary text-primary text-xs font-semibold uppercase tracking-[0.2em] px-7 py-4 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <dl className="grid sm:grid-cols-2 gap-4">
            {[
              ['Location', 'East of State Highway 232, 11th Civil District, Stewart County, TN'],
              ['Phases', 'Phase 1: Lots 1–11 · Phase 2: Lots 12–28 · Phase 3: Lots 29–41'],
              ['Building Setback', '75-ft minimum front building setback along all road frontage'],
              ['Road Easement', '50-ft ingress/egress and public utility easement centered on the main road'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-white border border-neutral-200 p-6">
                <dt className="text-[10px] uppercase tracking-[0.25em] text-accent">{k}</dt>
                <dd className="mt-2 text-primary/80 leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FAQ: the visible copy of the FAQPage structured data */}
      <section className="pb-20 md:pb-28 px-4 md:px-8">
        <div className="max-w-[900px] mx-auto">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent text-center">Questions</p>
          <h2 className="font-serif text-3xl md:text-5xl text-primary mt-3 text-center">Rustic Pines FAQ</h2>
          <div className="mt-10 rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-100">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-serif text-lg md:text-xl text-primary">
                  {q}
                  <span className="shrink-0 w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center text-accent text-lg leading-none transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-primary/70 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* mobile / tablet details sheet */}
      <AnimatePresence>
        {selectedLot && inquiry == null && (
          <motion.div
            key="sheet"
            className="lg:hidden fixed inset-x-0 bottom-0 z-[55] rounded-t-3xl bg-[#1b2518] ring-1 ring-white/10 shadow-[0_-24px_60px_rgba(0,0,0,0.5)] px-6 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))] max-h-[80vh] overflow-y-auto overscroll-contain"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => info.offset.y > 80 && setSelected(null)}
          >
            <div className="flex justify-center mb-4">
              <span className="w-10 h-1 rounded-full bg-white/25" />
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close lot details"
              className="absolute top-4 right-5 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/5 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-4">
              <LotDetails key={selectedLot.number} lot={selectedLot} onInquire={setInquiry} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {inquiry != null && <InquiryModal key="inquiry" lotNumber={inquiry} onClose={() => setInquiry(null)} />}
      </AnimatePresence>
    </div>
  );
}
