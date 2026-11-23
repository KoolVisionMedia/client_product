import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpRight, Bath, Bed, CarFront, ChevronLeft, ChevronRight, Clapperboard, FileText, Images,
  LoaderCircle, Pause, Play, RefreshCw, Rotate3d, RotateCcw, Ruler, Square, ZoomIn, ZoomOut,
} from 'lucide-react';
import { floorPlans } from '../data/floorPlans';
import { planMedia, planPhoto } from '../data/floorPlanMedia';
import ButtonGlow from './ui/ButtonGlow';

/**
 * The Plan Explorer: one stage per plan that switches between the interactive
 * 3D model, the layout sheets, photos of the finished home and a build clip,
 * with the plan's facts and room list beside it.
 *
 * Only one <model-viewer> (one WebGL context) is ever mounted, and its script
 * is fetched only once the explorer scrolls near the screen.
 */

type Mode = '3d' | 'layout' | 'photos' | 'film';
type ViewerKind = 'scan' | 'flat' | 'exterior';
type View = { label: string; orbit: [number, number, number] }; // heading°, tilt°, distance %

// `bleed`: the canvas is 1.8x a 16:10 frame so a zoomed model runs out to the
// stage edge instead of hitting a box; the distances below account for that,
// so the resting view matches the poster still exactly.
const VIEWER: Record<ViewerKind, {
  views: View[]; home: number; min: string; max: string; fov: string; neutral: boolean; bleed: boolean;
}> = {
  scan: {
    views: [
      { label: 'Top', orbit: [0, 0, 175] },
      { label: 'Angle', orbit: [-18, 44, 169] },
      { label: 'Low', orbit: [-34, 68, 150] },
    ],
    home: 1, min: 'auto 0deg 40%', max: 'auto 72deg 320%', fov: '26deg', neutral: true, bleed: true,
  },
  flat: {
    views: [
      { label: 'Top', orbit: [0, 4, 230] },
      { label: 'Angle', orbit: [0, 11, 230] },
      { label: 'Tilt', orbit: [-16, 30, 245] },
    ],
    home: 1, min: 'auto 4deg 60%', max: 'auto 30deg 420%', fov: '26deg', neutral: false, bleed: true,
  },
  exterior: {
    views: [
      { label: 'Street', orbit: [148, 76, 86] },
      { label: 'Above', orbit: [148, 42, 100] },
      { label: 'Rear', orbit: [328, 76, 86] },
    ],
    home: 0, min: 'auto 30deg 45%', max: 'auto 88deg 220%', fov: 'auto', neutral: true, bleed: false,
  },
};

const GOLD = '#c9a96e';
const plans = floorPlans.filter((p) => planMedia[p.id]);
const pad = (n: number) => String(n).padStart(2, '0');
// The colour renders ship as foo.jpg plus an 800w copy, foo-800.jpg.
const renderSrcSet = (src: string) => `${src.replace(/\.jpg$/, '-800.jpg')} 800w, ${src} 1500w`;

type ModelViewerEl = HTMLElement & {
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
  getCameraOrbit: () => { theta: number; phi: number; radius: number };
  resetTurntableRotation?: (theta?: number) => void;
};

let viewerLoading: Promise<void> | null = null;
function loadModelViewer() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (viewerLoading) return viewerLoading;
  viewerLoading = new Promise<void>((resolve, reject) => {
    if (customElements.get('model-viewer')) return resolve();
    // model-viewer bundles its own meshopt decoder; it only switches on once a location is set.
    const w = window as unknown as { ModelViewerElement?: Record<string, unknown> };
    w.ModelViewerElement = { ...(w.ModelViewerElement || {}), meshoptDecoderLocation: '/vendor/meshopt-on.js' };
    const s = document.createElement('script');
    s.type = 'module';
    s.src = '/vendor/model-viewer.min.js';
    s.onload = () => resolve();
    s.onerror = () => { viewerLoading = null; reject(new Error('model-viewer failed to load')); };
    document.head.appendChild(s);
  });
  return viewerLoading;
}

const chip = 'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md px-3 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e]';
const chipOn = 'bg-[#c9a96e] text-[#1b2518]';
const chipOff = 'text-white/70 hover:bg-white/10 hover:text-white';
const glass = 'rounded-lg border border-white/15 bg-[#10170e]/75 backdrop-blur-sm';
const iconBtn = 'grid h-9 w-9 place-items-center rounded-md text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e]';

type Props = {
  /** Plan id to open first (from /floorplans?plan=dogwood). */
  initialPlan?: string | null;
  onRequestBooklet: () => void;
};

export default function FloorPlanExplorer({ initialPlan, onRequestBooklet }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const mvEl = useRef<ModelViewerEl | null>(null);
  const tick = useRef(0);

  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<Mode>('3d');
  const [floor, setFloor] = useState(0);
  const [outside, setOutside] = useState(false);
  const [photo, setPhoto] = useState(0);
  const [blueprint, setBlueprint] = useState(false);
  const [ready, setReady] = useState(false); // viewer script loaded and explorer near the screen
  const [loaded, setLoaded] = useState<string | null>(null); // glb currently drawn; the poster holds until then
  const [zoomOn, setZoomOn] = useState(false); // wheel zoom armed (after a click on the model)
  const [spin, setSpin] = useState(false);
  const [touched, setTouched] = useState(false);
  const [canHover, setCanHover] = useState(true);
  const [lens, setLens] = useState({ on: false, x: 50, y: 50 });
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const plan = plans[idx];
  const media = planMedia[plan.id];
  const fl = media.floors[Math.min(floor, media.floors.length - 1)];
  const showOutside = outside && !!media.exterior;
  const kind: ViewerKind = showOutside ? 'exterior' : fl.scan ? 'scan' : 'flat';
  const level = showOutside ? media.exterior! : fl;
  const cfg = VIEWER[kind];
  const live = ready && mode === '3d';
  const drawn = live && loaded === level.glb;

  const select = useCallback((i: number) => {
    const n = (i + plans.length) % plans.length;
    setIdx(n);
    setFloor(0);
    setOutside(false);
    setPhoto(0);
    setBlueprint(false);
    setSpin(false);
    setLens((l) => ({ ...l, on: false }));
    setMode((m) => (m === 'film' && !planMedia[plans[n].id].film ? '3d' : m));
  }, []);

  const pickFloor = (k: number) => { setFloor(k); setOutside(false); setSpin(false); setLens((l) => ({ ...l, on: false })); };

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // /floorplans?plan=dogwood opens that plan and brings the explorer into view.
  useEffect(() => {
    const i = plans.findIndex((p) => p.id === initialPlan);
    if (i < 0) return;
    select(i);
    const t = window.setTimeout(() => rootRef.current?.scrollIntoView({ block: 'start' }), 80);
    return () => window.clearTimeout(t);
  }, [initialPlan, select]);

  // Hold the viewer script (about 1 MB) back until the explorer is near the screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const go = () => loadModelViewer().then(() => setReady(true)).catch(() => {});
    if (!('IntersectionObserver' in window)) { go(); return; }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { go(); io.disconnect(); }
    }, { rootMargin: '400px' });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  // model-viewer fires plain DOM events; hook them up when the element mounts.
  const mvRef = useCallback((el: HTMLElement | null) => {
    mvEl.current = el as ModelViewerEl | null;
    if (!el) return;
    const onLoad = () => setLoaded((el as unknown as { src: string }).src);
    const onDown = () => { setZoomOn(true); setTouched(true); };
    el.addEventListener('pointerdown', onDown);
    const onCam = (e: Event) => {
      if ((e as CustomEvent).detail?.source === 'user-interaction') setTouched(true);
    };
    el.addEventListener('load', onLoad);
    el.addEventListener('camera-change', onCam);
    return () => {
      el.removeEventListener('load', onLoad);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('camera-change', onCam);
    };
  }, []);

  /* ---- camera controls ---- */
  // The element ignores an orbit string it already holds, so a hair of distance
  // is added on alternate calls to make a repeated "Reset" or view button land.
  const flyTo = ([h, t, d]: [number, number, number]) => {
    const mv = mvEl.current;
    if (!mv) return;
    tick.current += 1;
    mv.cameraTarget = 'auto auto auto';
    mv.cameraOrbit = `${h}deg ${t}deg ${d + (tick.current % 2) * 0.01}%`;
  };
  const zoomBy = (f: number) => {
    const mv = mvEl.current;
    if (!mv) return;
    const o = mv.getCameraOrbit();
    mv.cameraOrbit = `${o.theta}rad ${o.phi}rad ${o.radius * f}m`;
  };
  const resetView = () => {
    setSpin(false);
    mvEl.current?.resetTurntableRotation?.(0);
    flyTo(cfg.views[cfg.home].orbit);
  };

  /* ---- photos ---- */
  const stepPhoto = (d: number) => setPhoto((p) => (p + d + media.photos.length) % media.photos.length);
  const swipe = useRef({ x: 0, y: 0 });

  /* ---- film ---- */
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };
  useEffect(() => { if (mode === 'film') setPlaying(true); }, [mode, idx]);

  const modes: { key: Mode; label: string; more?: string; icon: typeof Rotate3d; note?: string }[] = [
    { key: '3d', label: '3D', more: ' model', icon: Rotate3d },
    { key: 'layout', label: 'Layout', icon: Ruler },
    { key: 'photos', label: 'Photos', icon: Images, note: String(media.photos.length) },
    ...(media.film ? [{ key: 'film' as Mode, label: 'Film', more: ' of the build', icon: Clapperboard }] : []),
  ];

  const levelTabs = [
    ...(mode === '3d' && media.exterior ? [{ label: 'Outside', on: showOutside, go: () => { setOutside(true); setSpin(true); } }] : []),
    ...media.floors.map((f, k) => ({ label: f.label, on: !showOutside && k === floor, go: () => pickFloor(k) })),
  ];

  const hint = canHover
    ? 'Drag to rotate · click, then scroll to zoom · right-drag to move'
    : 'Drag to rotate · pinch to zoom · two fingers to move';

  return (
    <section
      ref={rootRef}
      id="plan-explorer"
      aria-labelledby="plan-explorer-h"
      className="relative scroll-mt-24 overflow-hidden bg-[#1b2518] py-16 text-white md:py-24"
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[38%] h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(201,169,110,0.12),rgba(201,169,110,0)_72%)]" />

      <div className="relative z-10 mx-auto max-w-site px-4 sm:px-6 md:px-12">
        <header className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <span className="mb-4 block font-sans text-[10px] uppercase tracking-[0.3em] text-[#c9a96e] md:text-xs">The Plan Explorer</span>
          <h2 id="plan-explorer-h" className="mb-5 font-serif text-4xl leading-tight md:text-6xl">
            Featured Floorplans. <em className="font-light text-[#c9a96e]">Step inside.</em>
          </h2>
          <p className="font-sans text-base leading-relaxed text-white/75 md:text-lg">
            Pick a plan, then explore it your way: turn the 3D model with the roof lifted off, study the layout
            and the measured drawing, and walk through photos of the finished home.
          </p>
        </header>

        {/* Plan rail */}
        <div role="tablist" aria-label="Choose a floor plan" className="-mx-4 mb-6 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:mb-8 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
          {plans.map((p, i) => {
            const on = i === idx;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => select(i)}
                className={`group relative aspect-[16/10] w-[58%] shrink-0 snap-center overflow-hidden rounded-xl text-left transition-[opacity,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e] sm:w-[38%] md:w-auto ${on ? 'opacity-100 shadow-[0_0_0_2px_#c9a96e]' : 'opacity-60 hover:opacity-100'}`}
              >
                <img
                  src={p.exterior}
                  alt={`${p.title} floor plan exterior, a ${p.beds} bedroom, ${p.baths} bathroom custom home from ${p.sqft} sq ft by Homefront Builders`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-3">
                  <span className="block font-serif text-lg leading-tight md:text-xl">{p.title}</span>
                  <span className="mt-0.5 block font-sans text-[10px] uppercase tracking-[0.14em] text-white/70">
                    {p.sqft} sq ft · {p.beds} bd · {p.baths} ba
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23.5rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_26rem]">
          {/* ------------------------------ Stage ------------------------------ */}
          <div className="min-w-0">
            <div role="tablist" aria-label="What to look at" className={`mb-3 inline-flex max-w-full gap-1 overflow-x-auto p-1 ${glass}`}>
              {modes.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  role="tab"
                  aria-selected={mode === m.key}
                  onClick={() => setMode(m.key)}
                  className={`${chip} min-h-11 shrink-0 px-2.5 sm:px-3.5 md:min-h-10 ${mode === m.key ? chipOn : chipOff}`}
                >
                  <m.icon className="h-4 w-4" aria-hidden="true" />
                  <span>{m.label}{m.more && <span className="hidden sm:inline">{m.more}</span>}</span>
                  {m.note && <span className={`hidden rounded-sm px-1 text-[9px] sm:inline ${mode === m.key ? 'bg-[#1b2518]/15' : 'bg-white/10'}`}>{m.note}</span>}
                </button>
              ))}
            </div>

            <div
              className={`relative aspect-square overflow-hidden rounded-2xl border border-white/10 transition-colors duration-500 [container-type:size] sm:aspect-[16/10] ${mode === 'layout' ? 'bg-[#f4f1e8]' : 'bg-[#141d11]'}`}
              onMouseLeave={() => setZoomOn(false)}
            >
              {/* ---- 3D ---- */}
              <div
                className={`absolute inset-0 grid place-items-center transition-opacity duration-500 ${mode === '3d' ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                aria-hidden={mode !== '3d'}
              >
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(201,169,110,0.16),rgba(201,169,110,0)_70%)]" />
                <div className={cfg.bleed ? 'relative aspect-[16/10] w-[min(100cqw,160cqh)]' : 'absolute inset-0'}>
                  <img
                    key={level.poster}
                    src={level.poster}
                    alt={`${plan.title} ${showOutside ? 'exterior' : fl.label.toLowerCase()} in 3D by Homefront Builders`}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${drawn ? 'opacity-0 delay-100' : 'opacity-100'}`}
                  />
                  {live && createElement('model-viewer', {
                    key: level.glb,
                    ref: mvRef,
                    src: level.glb,
                    alt: `Interactive 3D model of the ${plan.title} ${showOutside ? 'exterior' : fl.label.toLowerCase()}`,
                    'camera-controls': true,
                    'disable-zoom': canHover && !zoomOn,
                    'touch-action': 'pan-y',
                    'interaction-prompt': 'none',
                    'auto-rotate': spin,
                    'auto-rotate-delay': '0',
                    'rotation-per-second': '8deg',
                    'shadow-intensity': kind === 'exterior' ? '1.25' : '1.15',
                    'shadow-softness': kind === 'exterior' ? '0.85' : '0.7',
                    exposure: '1.02',
                    'camera-orbit': cfg.views[cfg.home].orbit.map((v, k) => `${v}${k < 2 ? 'deg' : '%'}`).join(' '),
                    'min-camera-orbit': cfg.min,
                    'max-camera-orbit': cfg.max,
                    ...(cfg.neutral ? { 'environment-image': 'neutral' } : {}),
                    bounds: 'tight',
                    'field-of-view': cfg.fov,
                    className: `fp3d-mv absolute z-[1] cursor-grab transition-opacity duration-500 active:cursor-grabbing ${cfg.bleed ? '-inset-[40%] h-[180%] w-[180%]' : 'inset-0 h-full w-full'} ${drawn ? 'opacity-100' : 'opacity-0'}`,
                  },
                  // Our own marker for "moving the model". The built-in one sits at dead
                  // centre and swallows clicks there, so a drag from the middle did nothing.
                  <span slot="pan-target" className="pointer-events-none block h-2.5 w-2.5 rounded-full border border-[#c9a96e] bg-[#c9a96e]/30" />,
                  )}
                </div>

                {live && !drawn && (
                  <p className={`absolute bottom-16 left-1/2 z-[3] flex -translate-x-1/2 items-center gap-2 px-3 py-2 font-sans text-[10px] uppercase tracking-[0.16em] text-white/80 ${glass}`}>
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Loading 3D model
                  </p>
                )}

                {/* how-to hint, until the model is first touched */}
                <p
                  aria-hidden={touched}
                  className={`pointer-events-none absolute right-3 top-3 z-[3] hidden max-w-[60%] px-3 py-2 text-right font-sans text-[10px] uppercase leading-relaxed tracking-[0.14em] text-white/80 transition-opacity duration-500 sm:block ${glass} ${drawn && !touched ? 'opacity-100' : 'opacity-0'}`}
                >
                  {hint}
                </p>

                {/* camera toolbar */}
                <div className={`absolute bottom-3 left-1/2 z-[3] flex -translate-x-1/2 items-center gap-1 p-1 transition-opacity duration-300 ${glass} ${drawn ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                  {cfg.views.map((v) => (
                    <button key={v.label} type="button" onClick={() => { setSpin(false); flyTo(v.orbit); }} className={`${chip} ${chipOff} px-2.5`}>
                      {v.label}
                    </button>
                  ))}
                  <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-white/15" />
                  <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1.25)} className={iconBtn}><ZoomOut className="h-4 w-4" aria-hidden="true" /></button>
                  <button type="button" aria-label="Zoom in" onClick={() => zoomBy(0.8)} className={iconBtn}><ZoomIn className="h-4 w-4" aria-hidden="true" /></button>
                  <button type="button" aria-label={spin ? 'Stop turning' : 'Turn slowly'} aria-pressed={spin} onClick={() => setSpin((s) => !s)} className={`${iconBtn} ${spin ? '!bg-[#c9a96e] !text-[#1b2518]' : ''}`}><RefreshCw className="h-4 w-4" aria-hidden="true" /></button>
                  <button type="button" aria-label="Reset view" onClick={resetView} className={iconBtn}><RotateCcw className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              </div>

              {/* ---- Layout sheets ---- */}
              <AnimatePresence>
                {mode === 'layout' && (
                  <motion.div
                    key="layout"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                    className={`absolute inset-0 overflow-hidden ${canHover ? (lens.on ? 'cursor-zoom-out' : 'cursor-zoom-in') : ''}`}
                    onClick={canHover ? (e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      setLens((l) => ({ on: !l.on, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }));
                    } : undefined}
                    onMouseMove={lens.on ? (e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      setLens({ on: true, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                    } : undefined}
                    onMouseLeave={() => setLens((l) => ({ ...l, on: false }))}
                  >
                    <div
                      className="absolute inset-0 transition-transform duration-300 ease-out"
                      style={{ transform: lens.on ? 'scale(2.4)' : 'scale(1)', transformOrigin: `${lens.x}% ${lens.y}%` }}
                    >
                      <img
                        key={plan.plans[floor]}
                        src={plan.plans[floor]}
                        srcSet={renderSrcSet(plan.plans[floor])}
                        sizes="(min-width: 1024px) 60vw, 95vw"
                        alt={`${plan.title} ${fl.label.toLowerCase()} layout, a ${plan.beds} bedroom custom home floor plan by Homefront Builders`}
                        decoding="async"
                        className={`absolute inset-0 h-full w-full object-contain p-3 pt-14 transition-opacity duration-500 sm:p-6 sm:pt-16 ${blueprint ? 'opacity-0' : 'opacity-100'}`}
                      />
                      {plan.blueprints[floor] && (
                        <img
                          key={plan.blueprints[floor]}
                          src={plan.blueprints[floor]}
                          alt={`${plan.title} ${fl.label.toLowerCase()} blueprint, the dimensioned floor plan drawing by Homefront Builders`}
                          loading="lazy"
                          decoding="async"
                          className={`absolute inset-0 h-full w-full object-contain p-3 pt-14 mix-blend-multiply transition-opacity duration-500 sm:p-6 sm:pt-16 ${blueprint ? 'opacity-100' : 'opacity-0'}`}
                        />
                      )}
                    </div>
                    <div className={`absolute right-3 top-3 z-[3] flex gap-1 p-1 ${glass}`} onClick={(e) => e.stopPropagation()}>
                      {['Color render', 'Blueprint'].map((l, k) => (
                        <button key={l} type="button" aria-pressed={blueprint === !!k} onClick={() => setBlueprint(!!k)} className={`${chip} ${blueprint === !!k ? chipOn : chipOff}`}>{l}</button>
                      ))}
                    </div>
                    {canHover && (
                      <p className={`pointer-events-none absolute bottom-3 left-1/2 z-[3] -translate-x-1/2 px-3 py-2 font-sans text-[10px] uppercase tracking-[0.14em] text-white/85 transition-opacity duration-300 ${glass} ${lens.on ? 'opacity-0' : 'opacity-100'}`}>
                        Click to zoom in, then move to look around
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ---- Photos ---- */}
              <AnimatePresence>
                {mode === 'photos' && (
                  <motion.div
                    key="photos"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-black"
                    tabIndex={0}
                    role="group"
                    aria-roledescription="carousel"
                    aria-label={`Photos of the finished ${plan.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft') { stepPhoto(-1); e.preventDefault(); }
                      if (e.key === 'ArrowRight') { stepPhoto(1); e.preventDefault(); }
                    }}
                    onTouchStart={(e) => { swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
                    onTouchEnd={(e) => {
                      const t = e.changedTouches[0], dx = t.clientX - swipe.current.x;
                      if (Math.abs(dx) > 44 && Math.abs(t.clientY - swipe.current.y) < 60) stepPhoto(dx < 0 ? 1 : -1);
                    }}
                  >
                    <AnimatePresence initial={false}>
                      <motion.img
                        key={`${plan.id}-${photo}`}
                        src={planPhoto(plan.id, photo, 1600)}
                        srcSet={`${planPhoto(plan.id, photo, 800)} 800w, ${planPhoto(plan.id, photo, 1600)} 1600w`}
                        sizes="(min-width: 1024px) 60vw, 95vw"
                        alt={media.photos[photo]}
                        decoding="async"
                        initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </AnimatePresence>
                    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 to-transparent" />
                    <p className={`absolute left-3 top-3 px-2.5 py-1.5 font-sans text-[10px] uppercase tracking-[0.16em] text-white/85 ${glass}`}>
                      <b className="font-semibold text-[#c9a96e]">{pad(photo + 1)}</b> / {pad(media.photos.length)}
                    </p>
                    {[-1, 1].map((d) => (
                      <button
                        key={d}
                        type="button"
                        aria-label={d < 0 ? 'Previous photo' : 'Next photo'}
                        onClick={() => stepPhoto(d)}
                        className={`absolute top-1/2 z-[3] grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/45 text-white transition-colors hover:border-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#1b2518] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e] ${d < 0 ? 'left-3' : 'right-3'}`}
                      >
                        {d < 0 ? <ChevronLeft className="h-5 w-5" aria-hidden="true" /> : <ChevronRight className="h-5 w-5" aria-hidden="true" />}
                      </button>
                    ))}
                    <div className="absolute inset-x-0 bottom-0 z-[2] p-3 sm:p-4">
                      <p aria-live="polite" className="mb-2.5 max-w-2xl font-sans text-xs leading-snug text-white/90 sm:text-sm">{media.photos[photo]}</p>
                      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                        {media.photos.map((alt, k) => (
                          <button
                            key={k}
                            type="button"
                            aria-label={`Photo ${k + 1}: ${alt}`}
                            aria-current={k === photo}
                            onClick={() => setPhoto(k)}
                            className={`relative h-10 w-[3.75rem] shrink-0 overflow-hidden rounded-sm transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e] sm:h-12 sm:w-[4.5rem] ${k === photo ? 'opacity-100 shadow-[0_0_0_2px_#c9a96e]' : 'opacity-55 hover:opacity-100'}`}
                          >
                            <img src={planPhoto(plan.id, k, 240)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ---- Build film ---- */}
              <AnimatePresence>
                {mode === 'film' && media.film && (
                  <motion.div
                    key="film"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-black"
                  >
                    <video
                      ref={videoRef}
                      src={media.film.src}
                      poster={media.film.poster}
                      autoPlay muted loop playsInline preload="metadata"
                      aria-label={media.film.caption}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-3 sm:p-4">
                      <button
                        type="button"
                        aria-label={playing ? 'Pause the film' : 'Play the film'}
                        onClick={togglePlay}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#c9a96e] text-[#1b2518] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        {playing ? <Pause className="h-4 w-4" fill="currentColor" aria-hidden="true" /> : <Play className="h-4 w-4 translate-x-px" fill="currentColor" aria-hidden="true" />}
                      </button>
                      <p className="font-sans text-xs leading-snug text-white/90 sm:text-sm">{media.film.caption}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* floor switch: shared by the 3D model and the layout sheets */}
              {(mode === '3d' || mode === 'layout') && levelTabs.length > 1 && (
                <div role="group" aria-label={`${plan.title} levels`} className={`absolute left-3 top-3 z-[4] flex gap-1 p-1 ${glass}`}>
                  {levelTabs.map((t) => (
                    <button key={t.label} type="button" aria-pressed={t.on} onClick={t.go} className={`${chip} ${t.on ? chipOn : chipOff}`}>{t.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ------------------------------ Plan panel ------------------------------ */}
          <motion.aside
            key={plan.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            aria-label={`${plan.title} details`}
            className="flex flex-col gap-5 lg:pt-1"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="m-0 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                <b className="font-medium text-[#c9a96e]">{pad(idx + 1)}</b><i className="px-1.5 not-italic opacity-50">/</i>{pad(plans.length)}
                <span className="ml-3 text-[#c9a96e]">{media.kind}</span>
              </p>
              <div className="flex gap-1.5">
                {[-1, 1].map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-label={d < 0 ? 'Previous plan' : 'Next plan'}
                    onClick={() => select(idx + d)}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#1b2518] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e]"
                  >
                    {d < 0 ? <ChevronLeft className="h-5 w-5" aria-hidden="true" /> : <ChevronRight className="h-5 w-5" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="m-0 font-serif text-4xl leading-none md:text-5xl">{plan.title}</h3>
              <p className="mt-4 font-sans text-sm leading-relaxed text-white/75 md:text-[15px]">{plan.description}</p>
            </div>

            <dl className="grid grid-cols-4 overflow-hidden rounded-xl border border-white/12 bg-white/[0.04]">
              {[
                { k: 'Sq ft', v: plan.sqft, icon: Square },
                { k: 'Beds', v: String(plan.beds), icon: Bed },
                { k: 'Baths', v: String(plan.baths), icon: Bath },
                { k: 'Garage', v: media.garage, icon: CarFront },
              ].map((s, n) => (
                <div key={s.k} className={`flex flex-col gap-1 px-2.5 py-3 sm:px-3.5 ${n ? 'border-l border-white/12' : ''}`}>
                  <dt className="flex items-center gap-1 font-sans text-[9px] font-semibold uppercase tracking-[0.16em] text-white/50">
                    <s.icon className="h-3 w-3" style={{ color: GOLD }} aria-hidden="true" />{s.k}
                  </dt>
                  <dd className="m-0 font-serif text-lg leading-none sm:text-xl">{s.v}</dd>
                </div>
              ))}
            </dl>

            <div>
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <h4 className="m-0 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Room by room</h4>
                {media.floors.length > 1 && (
                  <div role="group" aria-label="Show rooms on" className="flex gap-1 rounded-md border border-white/12 p-[3px]">
                    {media.floors.map((f, k) => (
                      <button key={f.label} type="button" aria-pressed={k === floor} onClick={() => pickFloor(k)} className={`${chip} min-h-8 px-2.5 ${k === floor ? chipOn : chipOff}`}>{f.label}</button>
                    ))}
                  </div>
                )}
              </div>
              <p className="mb-3 font-sans text-sm leading-relaxed text-white/70">{media.layout}</p>
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {fl.rooms.map((r) => (
                  <li key={r} className="rounded-md border border-white/12 bg-white/[0.04] px-2.5 py-1.5 font-sans text-xs text-white/85">{r}</li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setMode('photos')}
              className="group/ph flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.04] p-2.5 text-left transition-colors hover:border-[#c9a96e]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e]"
            >
              <img src={planPhoto(plan.id, 2, 240)} alt="" loading="lazy" decoding="async" className="h-14 w-20 shrink-0 rounded-md object-cover" />
              <span className="min-w-0">
                <span className="block font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9a96e]">Inside the finished home</span>
                <span className="mt-0.5 block font-sans text-sm leading-snug text-white/80">{media.photosNote}</span>
              </span>
              <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-white/50 transition-transform group-hover/ph:translate-x-0.5 group-hover/ph:text-[#c9a96e]" aria-hidden="true" />
            </button>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <button
                type="button"
                onClick={onRequestBooklet}
                className="btn-glow inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#c9a96e] px-5 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b2518] hover:bg-[#d8bb84]"
              >
                <ButtonGlow />
                <FileText className="h-4 w-4" aria-hidden="true" /> Request the booklet
              </button>
              <Link
                to="/contact-us"
                className="btn-glow inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-white/30 px-5 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:border-[#c9a96e] hover:bg-white/5"
              >
                <ButtonGlow />
                Ask about this plan <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.aside>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center font-sans text-xs leading-relaxed text-white/50 md:mt-14">
          3D models are built from our plan drawings to give a feel for the layout; furniture and finishes are illustrative
          and dimensions are approximate. Photos show finished Homefront homes; selections and options vary from home to home.
        </p>
      </div>
    </section>
  );
}
