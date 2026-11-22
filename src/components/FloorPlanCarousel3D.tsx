import { createElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { floorPlans } from '../data/floorPlans';

/**
 * 3D floor-plan carousel (ported from the Rustic Pines Builds page).
 *
 * One plan on stage at a time, with the neighbours bled in at the edges. Only
 * the plan on stage carries a live <model-viewer>; the rest are posters, so
 * the page never holds more than one WebGL context. The viewer script is
 * fetched only once the carousel scrolls near the screen.
 */

type Floor = { label: string; glb: string; poster: string };
type Model = { floors: Floor[]; meshy: boolean };

const M = (id: string, n: number): Floor[] =>
  Array.from({ length: n }, (_, k) => ({
    label: k ? 'Upper floor' : 'Main floor',
    glb: `/models/floorplans/${id}-${k}.glb`,
    poster: `/assets/floorplans/3d/${id}-${k}.webp`,
  }));

const MODELS: Record<string, Model> = {
  cypress: { floors: M('cypress', 1), meshy: true },
  dogwood: { floors: M('dogwood', 2), meshy: true },
  harmony: { floors: M('harmony', 2), meshy: true },
  magnolia: { floors: M('magnolia', 2), meshy: false }, // older extruded model, no Meshy scan
  myrtle: { floors: M('myrtle', 2), meshy: true },
};

const plans = floorPlans.filter((p) => MODELS[p.id]);

// The live canvas is 1.8x the stage so a zoomed model bleeds out past the box
// instead of hitting an edge; these radii already account for that, so the
// resting framing matches the poster exactly.
const CAMERA = {
  meshy: { orbit: '-18deg 44deg 169%', min: 'auto 0deg 40%', max: 'auto 72deg 320%' },
  flat: { orbit: '0deg 11deg 140%', min: 'auto 4deg 40%', max: 'auto 30deg 320%' },
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

const pad = (n: number) => String(n).padStart(2, '0');

export default function FloorPlanCarousel3D() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [cur, setCur] = useState(0);
  const [floorIdx, setFloorIdx] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false); // viewer script loaded and carousel on screen
  const [loaded, setLoaded] = useState<string | null>(null); // glb currently drawn; the poster holds until then

  // model-viewer fires a plain DOM 'load' event once the model is drawn.
  const mvRef = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const src = el.getAttribute('src');
    el.addEventListener('load', () => setLoaded(src), { once: true });
  }, []);

  const show = useCallback((i: number) => setCur(Math.max(0, Math.min(plans.length - 1, i))), []);

  // Centre the active plan in the viewport.
  const place = useCallback(() => {
    const root = rootRef.current, track = trackRef.current, it = itemRefs.current[cur];
    if (!root || !track || !it) return;
    track.style.transform = `translate3d(${root.clientWidth / 2 - it.offsetLeft - it.offsetWidth / 2}px,0,0)`;
  }, [cur]);
  useLayoutEffect(place, [place]);
  useEffect(() => {
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [place]);

  // Hold the WebGL context (and the 1 MB viewer script) back until the set is near the screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const go = () => loadModelViewer().then(() => setReady(true)).catch(() => {});
    if (!('IntersectionObserver' in window)) { go(); return; }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { go(); io.disconnect(); }
    }, { rootMargin: '300px' });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  // Swipe: the stage itself orbits the model, so only the gutters drag the set.
  const touch = useRef({ x: 0, y: 0, ok: false });
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, ok: !(e.target as HTMLElement).closest('[data-stage]') };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current.ok) return;
    const t = e.changedTouches[0], dx = t.clientX - touch.current.x;
    if (Math.abs(dx) > 48 && Math.abs(t.clientY - touch.current.y) < 60) show(cur + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      aria-labelledby="fp3d-h"
      className="relative mb-28 overflow-hidden bg-[#1b2518] py-20 text-white md:py-28"
    >
      {/* soft gold pool behind the stage */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(201,169,110,0.14),rgba(201,169,110,0)_72%)]" />

      <div className="relative z-10 mx-auto max-w-site px-6 md:px-12">
        <header className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <span className="mb-4 block font-sans text-[10px] uppercase tracking-[0.3em] text-[#c9a96e] md:text-xs">Explore in 3D</span>
          <h2 id="fp3d-h" className="mb-5 font-serif text-4xl leading-tight md:text-6xl">
            Five plans. <em className="font-light text-[#c9a96e]">Pick one up.</em>
          </h2>
          <p className="font-sans text-base leading-relaxed text-white/75 md:text-lg">
            Every featured plan, modelled room by room from our own drawings with the roof lifted off.
            Drag to look in, scroll or pinch to zoom, switch floors, and step through the set.
          </p>
        </header>

        <nav aria-label="Choose a plan" className="flex flex-wrap justify-center gap-1 md:gap-6">
          {plans.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => show(i)}
              aria-current={i === cur ? 'true' : 'false'}
              className={`relative px-2 py-4 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors md:py-2 ${i === cur ? 'text-white' : 'text-white/50 hover:text-white'}`}
            >
              {p.title.replace(/^The /, '')}
              <span aria-hidden="true" className={`absolute inset-x-2 bottom-3 h-px origin-left bg-[#c9a96e] transition-transform duration-300 md:bottom-0 ${i === cur ? 'scale-x-100' : 'scale-x-0'}`} />
            </button>
          ))}
        </nav>
      </div>

      <div
        ref={rootRef}
        className="relative z-10 mt-8 md:mt-12 [--gap:clamp(20px,3vw,46px)] [--pw:84vw] md:[--pw:min(62vw,780px)]"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') { show(cur - 1); e.preventDefault(); }
          if (e.key === 'ArrowRight') { show(cur + 1); e.preventDefault(); }
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="overflow-x-clip py-1.5">
          <ul ref={trackRef} className="m-0 flex list-none gap-[var(--gap)] p-0 transition-transform duration-[620ms] ease-[cubic-bezier(.22,.61,.28,1)] will-change-transform motion-reduce:transition-none">
            {plans.map((p, i) => {
              const model = MODELS[p.id];
              const fi = floorIdx[p.id] ?? 0;
              const floor = model.floors[fi];
              const on = i === cur;
              const live = on && ready;
              const cam = model.meshy ? CAMERA.meshy : CAMERA.flat;
              return (
                <li
                  key={p.id}
                  ref={(el) => { itemRefs.current[i] = el; }}
                  aria-hidden={!on}
                  onClick={on ? undefined : () => show(i)}
                  className={`w-[var(--pw)] flex-[0_0_var(--pw)] origin-[50%_46%] transition-[opacity,transform] duration-[620ms] ease-[cubic-bezier(.22,.61,.28,1)] motion-reduce:transition-none ${on ? 'scale-100 opacity-100' : 'cursor-pointer scale-[.86] opacity-30 md:scale-[.8]'}`}
                >
                  <div data-stage className="relative aspect-[16/10] max-h-[62svh]">
                    <img
                      src={floor.poster}
                      alt={`${p.title} ${floor.label.toLowerCase()} by Homefront Builders, seen from above`}
                      loading="lazy"
                      decoding="async"
                      className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${live && loaded === floor.glb ? 'opacity-0 delay-100' : 'opacity-100'}`}
                    />
                    {live && createElement('model-viewer', {
                      key: floor.glb,
                      ref: mvRef,
                      src: floor.glb,
                      alt: `Interactive 3D model of the ${p.title} ${floor.label.toLowerCase()}`,
                      'camera-controls': '',
                      'touch-action': 'pan-y',
                      'interaction-prompt': 'none',
                      'shadow-intensity': '1.15',
                      'shadow-softness': '0.7',
                      exposure: '1.02',
                      'camera-orbit': cam.orbit,
                      'min-camera-orbit': cam.min,
                      'max-camera-orbit': cam.max,
                      ...(model.meshy ? { 'environment-image': 'neutral' } : {}),
                      bounds: 'tight',
                      'field-of-view': '26deg',
                      className: `fp3d-mv absolute -inset-[40%] z-[1] h-[180%] w-[180%] cursor-grab active:cursor-grabbing transition-opacity duration-500 ${loaded === floor.glb ? 'opacity-100' : 'opacity-0'}`,
                    })}
                  </div>

                  <div className={`relative z-[2] mt-4 grid justify-items-center gap-2.5 text-center transition-opacity duration-400 md:mt-6 ${on ? 'opacity-100 delay-100' : 'opacity-0'}`}>
                    <p className="m-0 font-sans text-[11px] font-medium tracking-[0.18em] text-white/55">
                      <b className="font-medium text-[#c9a96e]">{pad(i + 1)}</b>
                      <i className="px-1.5 not-italic opacity-50">/</i>
                      {pad(plans.length)}
                    </p>
                    <h3 className="m-0 font-serif text-3xl leading-none md:text-5xl">{p.title}</h3>
                    <ul className="m-0 mt-0.5 flex list-none flex-wrap justify-center p-0">
                      {[
                        [p.sqft, 'Sq ft'],
                        [String(p.beds), 'Bed'],
                        [String(p.baths), 'Bath'],
                        [String(model.floors.length), model.floors.length > 1 ? 'Floors' : 'Floor'],
                      ].map(([v, k], n) => (
                        <li key={k} className={`flex items-baseline gap-1.5 px-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-white/60 md:px-5 ${n ? 'border-l border-white/20' : ''}`}>
                          <span className="text-base tracking-[0.02em] text-white">{v}</span>{k}
                        </li>
                      ))}
                    </ul>
                    {model.floors.length > 1 ? (
                      <div role="group" aria-label={`${p.title} floors`} className="mt-1.5 inline-flex gap-1 rounded-sm border border-white/15 bg-black/30 p-[3px]">
                        {model.floors.map((f, k) => (
                          <button
                            key={f.label}
                            type="button"
                            tabIndex={on ? 0 : -1}
                            aria-pressed={k === fi}
                            onClick={() => setFloorIdx((s) => ({ ...s, [p.id]: k }))}
                            className={`min-h-11 rounded-sm px-4 font-sans text-[11px] font-medium uppercase tracking-[0.12em] transition-colors md:min-h-[34px] ${k === fi ? 'bg-[#c9a96e] text-[#1b2518]' : 'text-white/65 hover:text-white'}`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1.5 font-sans text-[11px] uppercase tracking-[0.12em] text-white/50">Single-level plan</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {(['prev', 'next'] as const).map((d) => {
          const disabled = d === 'prev' ? cur === 0 : cur === plans.length - 1;
          return (
            <button
              key={d}
              type="button"
              aria-label={d === 'prev' ? 'Previous plan' : 'Next plan'}
              disabled={disabled}
              onClick={() => show(cur + (d === 'prev' ? -1 : 1))}
              className={`absolute top-[clamp(90px,30vw,150px)] z-[3] grid h-[46px] w-[46px] place-items-center rounded-full border border-white/30 bg-black/40 text-white transition-[background,border-color,color,transform,opacity] duration-200 hover:scale-105 hover:border-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#1b2518] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#c9a96e] disabled:pointer-events-none disabled:opacity-25 md:top-[clamp(120px,20vw,230px)] md:h-[58px] md:w-[58px] ${d === 'prev' ? 'left-[clamp(10px,3vw,46px)]' : 'right-[clamp(10px,3vw,46px)]'}`}
            >
              {d === 'prev' ? <ChevronLeft className="h-6 w-6" aria-hidden="true" /> : <ChevronRight className="h-6 w-6" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <p className="relative z-10 mx-auto mt-10 max-w-3xl px-6 text-center font-sans text-xs leading-relaxed text-white/50 md:mt-14">
        Models are built from our plan drawings to give a feel for the layout; furniture and finishes are illustrative.
        They are not construction drawings, and dimensions are approximate and subject to change.
      </p>
    </section>
  );
}
