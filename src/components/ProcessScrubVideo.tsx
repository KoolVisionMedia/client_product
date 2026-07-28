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

// Two encodes of the same 30s animation. Phones render the panel around 343px
// wide, so the 960px file is ~2.8x oversampled there — wasted bytes on cellular
// and wasted decode work per seek on the weakest hardware. The source is chosen
// once at mount and is the ONLY file fetched (see the load() in the effect).
const SRC_DESKTOP = '/assets/process/house-build-scrub.mp4';   // 960x540, 2.6MB
const SRC_MOBILE = '/assets/process/house-build-scrub-sm.mp4'; // 560x316, 1.3MB

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
  const readyRef = useRef(false);
  const lastStepRef = useRef(-1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lgUp = window.matchMedia('(min-width: 1024px)');

    /**
     * Park the panel at the same height as the reference line that decides
     * which step is active, so the animation sits beside the heading currently
     * being read.
     *
     * This is CSS sticky, not a JS-driven transform. Sticky is resolved by the
     * compositor on every scroll tick, so the panel holds an exactly constant
     * screen position — it can never lag behind or snap between anchor points
     * the way an eased per-step transform does.
     */
    const positionPanel = () => {
      const panel = panelRef.current;
      if (!panel) return;
      if (!lgUp.matches) { panel.style.top = ''; return; }
      const top = window.innerHeight * REFERENCE_LINE - panel.offsetHeight / 2;
      panel.style.top = `${Math.max(96, Math.round(top))}px`;
    };

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
          reportStep(i);
          return;
        }
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

      if (timeSettled) {
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

    positionPanel();

    // Source is assigned here rather than in markup so exactly one file is
    // fetched: the element ships with preload="none" and no <source>, so nothing
    // downloads until this picks the right encode for the viewport.
    video.src = lgUp.matches ? SRC_DESKTOP : SRC_MOBILE;
    video.preload = 'auto';
    video.load();

    if (video.readyState >= 1) onMeta();
    else video.addEventListener('loadedmetadata', onMeta, { once: true });

    const onResize = () => { positionPanel(); kick(); };
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', onResize);
      video.removeEventListener('loadedmetadata', onMeta);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
    };
  }, [stepsRef, onStepChange]);

  return (
    <div ref={panelRef} className={className}>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        {/* No src / no <source> here on purpose — the effect assigns the encode
            that matches the viewport, so a phone never downloads the desktop
            file. preload="none" keeps it inert until then. */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="none"
          aria-hidden="true"
          poster="/assets/process/house-build-poster.webp"
          className="block h-full w-full object-cover"
        />

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
