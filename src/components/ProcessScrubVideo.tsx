import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-scrubbed build animation for the Building Process page.
 *
 * The video is never played — it stays paused and its currentTime is driven by
 * how far the visitor has scrolled through the nine process steps, so the house
 * appears to build itself as they read down the page.
 *
 * ── Why the mapping is per-step, not linear ──────────────────────────────
 * The animation's nine scenes have DIFFERENT durations (2.5s to 4.5s) while the
 * nine step blocks on the page have different heights. A single linear
 * scroll->time mapping would drift, so step 6 might be showing scene 5. Instead
 * each step block owns its scene's slice of the timeline: we find which block
 * the reference line is currently inside, and map progress through THAT block
 * onto THAT scene's time range. Step N is therefore always showing scene N,
 * whatever the block heights are.
 *
 * Scene durations come from the source animation's own timeline (OM_SCENES in
 * the House Build project) — do not guess these; they must sum to the video's
 * 30s duration or the last step won't land on the final frame.
 *
 * ── Why the video is encoded the way it is ───────────────────────────────
 * public/assets/process/house-build-scrub.mp4 is encoded with a keyframe every
 * 5 frames (-g 5 -keyint_min 5 -sc_threshold 0). Seeking a normally-encoded
 * file has to decode from the previous keyframe, which can be dozens of frames
 * away and makes scrubbing lurch. With a 5-frame GOP any seek decodes at most 4
 * small P-frames. If it ever needs to be re-cut, keep that flag set or scrubbing
 * will regress.
 */

// From the source animation's OM_SCENES. Must stay in the page's step order.
const SCENES = [
  { name: 'Foundation', dur: 3.5 },  // H — Have you met with us?
  { name: 'Framing',    dur: 4.5 },  // O — Outstanding Realtor
  { name: 'Roof',       dur: 3.0 },  // M — Money, assess your buying power
  { name: 'Sheathing',  dur: 3.5 },  // E — Evaluating your wants and needs
  { name: 'Openings',   dur: 3.5 },  // F — Floor plan and Land
  { name: 'Insulation', dur: 3.0 },  // R — Rounding it out
  { name: 'Interior',   dur: 2.5 },  // O — Options for Selections
  { name: 'Exterior',   dur: 3.0 },  // N — No Freaking Out
  { name: 'Landscape',  dur: 3.5 },  // T — TADA! Time to close
];

// Cumulative start time of each scene, and the total (30s).
const STARTS = SCENES.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].dur);
  return acc;
}, []);
const TOTAL = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1].dur;

// Where in the viewport a step counts as "current". 0.45 keeps the active step
// just above centre, which reads naturally while scrolling down.
const REFERENCE_LINE = 0.45;
// Seeks smaller than this aren't worth the decode.
const MIN_SEEK_DELTA = 1 / 60;

type Props = {
  /** Container holding the elements marked with data-step-index. */
  stepsRef: React.RefObject<HTMLElement | null>;
  className?: string;
  onStepChange?: (index: number) => void;
};

export default function ProcessScrubVideo({ stepsRef, className = '', onStepChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  // Vertical position of the panel, so it travels down the column and parks
  // beside whichever step is being read rather than pinning to the viewport.
  const targetYRef = useRef(0);
  const currentYRef = useRef(0);
  const yInitialisedRef = useRef(false);
  const readyRef = useRef(false);
  const lastStepRef = useRef(-1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Panel travel is a two-column behaviour. Below lg the panel is sticky and
    // CSS owns its position, so the transform must stay off.
    const lgUp = window.matchMedia('(min-width: 1024px)');
    const tracks = () => lgUp.matches;

    const computeTarget = () => {
      const container = stepsRef.current;
      if (!container) return;
      const steps = Array.from(
        container.querySelectorAll<HTMLElement>('[data-step-index]'),
      );
      if (!steps.length) return;

      const line = window.innerHeight * REFERENCE_LINE;

      // Before the first step / after the last: pin to the ends of the timeline.
      const firstRect = steps[0].getBoundingClientRect();
      const lastRect = steps[steps.length - 1].getBoundingClientRect();
      if (firstRect.top > line) { targetRef.current = 0; reportStep(0); return; }
      if (lastRect.bottom < line) { targetRef.current = TOTAL; reportStep(steps.length - 1); return; }

      for (let i = 0; i < steps.length; i++) {
        const rect = steps[i].getBoundingClientRect();
        if (line >= rect.top && line <= rect.bottom) {
          const local = rect.height > 0 ? (line - rect.top) / rect.height : 0;
          const scene = SCENES[Math.min(i, SCENES.length - 1)];
          const start = STARTS[Math.min(i, STARTS.length - 1)];
          targetRef.current = start + Math.min(Math.max(local, 0), 1) * scene.dur;
          setPanelTarget(steps[i]);
          reportStep(i);
          return;
        }
      }
      // Between two blocks (in a gap) — hold at the boundary of the nearer one.
      for (let i = 0; i < steps.length - 1; i++) {
        const a = steps[i].getBoundingClientRect();
        const b = steps[i + 1].getBoundingClientRect();
        if (line > a.bottom && line < b.top) {
          targetRef.current = STARTS[i] + SCENES[i].dur;
          setPanelTarget(steps[i]);
          reportStep(i);
          return;
        }
      }
    };

    /**
     * Park the panel alongside the given step block.
     *
     * Measured as a delta between two viewport rects rather than from
     * offsetTop, so it stays correct regardless of which ancestor happens to be
     * the offsetParent. The value is a document-space offset within the panel's
     * column, so while a step is active the panel scrolls WITH the page (staying
     * beside its step) and only travels when a new step takes over.
     */
    const setPanelTarget = (stepEl: HTMLElement) => {
      const panel = panelRef.current;
      const column = panel?.offsetParent as HTMLElement | null;
      if (!panel || !column) return;
      const columnRect = column.getBoundingClientRect();
      const stepRect = stepEl.getBoundingClientRect();
      const panelH = panel.offsetHeight;
      // Centre the panel on the step block so it reads as "beside this step".
      let y = stepRect.top - columnRect.top + (stepRect.height - panelH) / 2;
      // Never let it run past the ends of its column.
      y = Math.max(0, Math.min(y, column.offsetHeight - panelH));
      targetYRef.current = y;
      if (!yInitialisedRef.current) {
        yInitialisedRef.current = true;
        currentYRef.current = y;
      }
    };

    const reportStep = (i: number) => {
      if (lastStepRef.current !== i) {
        lastStepRef.current = i;
        onStepChange?.(i);
      }
    };

    const draw = () => {
      const target = targetRef.current;
      // Ease toward the target so a fast flick doesn't demand a huge seek chain.
      // Reduced-motion users get a direct cut instead of the eased follow.
      const next = prefersReducedMotion
        ? target
        : currentRef.current + (target - currentRef.current) * 0.18;
      const timeSettled = Math.abs(target - next) < 0.004;
      currentRef.current = timeSettled ? target : next;

      if (readyRef.current && Math.abs(video.currentTime - currentRef.current) > MIN_SEEK_DELTA) {
        try { video.currentTime = currentRef.current; } catch { /* not seekable yet */ }
      }

      // Panel travel. Only on the two-column layout — below lg the panel is
      // pinned by CSS sticky instead and must not be transformed.
      let ySettled = true;
      const panel = panelRef.current;
      if (panel) {
        if (tracks()) {
          const ty = targetYRef.current;
          const ny = prefersReducedMotion
            ? ty
            : currentYRef.current + (ty - currentYRef.current) * 0.12;
          ySettled = Math.abs(ty - ny) < 0.5;
          currentYRef.current = ySettled ? ty : ny;
          panel.style.transform = `translate3d(0, ${currentYRef.current.toFixed(1)}px, 0)`;
        } else if (panel.style.transform) {
          panel.style.transform = '';
        }
      }

      if (timeSettled && ySettled) {
        runningRef.current = false;
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    // The loop idles when nothing is moving rather than burning a permanent
    // 60fps rAF — same approach as ScrollThreadLine.
    const kick = () => {
      computeTarget();
      if (!runningRef.current) {
        runningRef.current = true;
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    const onMeta = () => {
      readyRef.current = true;
      setReady(true);
      // Some mobile browsers won't honour a seek until the element has been
      // told to play once. Kick it and immediately pause — muted+playsInline
      // means this never actually shows motion or makes sound.
      video.play().then(() => video.pause()).catch(() => { /* fine, desktop seeks anyway */ });
      kick();
    };

    if (video.readyState >= 1) onMeta();
    else video.addEventListener('loadedmetadata', onMeta, { once: true });

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);

    return () => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
      video.removeEventListener('loadedmetadata', onMeta);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
    };
  }, [stepsRef, onStepChange]);

  return (
    // The panel is what travels. willChange keeps it on its own layer so the
    // move is composited rather than repainting the column each frame.
    <div ref={panelRef} className={className} style={{ willChange: 'transform' }}>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          poster="/assets/process/house-build-poster.webp"
          className="block h-full w-full object-cover"
        >
          <source src="/assets/process/house-build-scrub.mp4" type="video/mp4" />
        </video>

        {/* Holds the poster steady until the file can actually be seeked, so the
            first paint isn't a black frame. */}
        <div
          className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-500"
          style={{ opacity: ready ? 0 : 1 }}
        />
      </div>

      <p className="mt-3 hidden lg:block font-sans text-[10px] uppercase tracking-[0.3em] text-primary/35">
        Your home, built step by step as you scroll
      </p>
    </div>
  );
}
