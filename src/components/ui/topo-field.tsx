import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * TopoField — an animated WebGL background: a faint 48px grid plus ultra-thin contour
 * ("topographic") lines drawn from 2D simplex noise, drifting slowly over time.
 *
 * Shader and knobs adapted from MengTo/threeui (MIT), `TopoField` in
 * src/shaders/neuform-isolated/NeuformBatchEffects.tsx. The original ships the effect as a
 * sandboxed iframe wrapping a whole demo page (Tailwind CDN, GSAP, Iconify, hidden marketing
 * markup) and then isolates just the canvas. This version renders the same shader directly
 * into a canvas: no iframe, no third-party scripts, sized to its container, paused while
 * off-screen, and with paper/ink colors that can match the site palette.
 */

type TopoFieldMode = "dark" | "light";

export type TopoFieldProps = {
  /** "auto" follows the page's light/dark scheme via prefers-color-scheme. */
  mode?: TopoFieldMode | "auto";
  /** Animation speed multiplier. */
  speed?: number;
  /** Stretches/compresses the noise field driving the contour bands. */
  length?: number;
  /** Multiplies the number of contour bands (visual density of lines). */
  density?: number;
  /** Line strength: fades the grid and contours toward the paper color. */
  opacity?: number;
  hue?: number;
  saturation?: number;
  brightness?: number;
  /** Background color (defaults: black in dark mode, #eef1f6 in light mode). */
  paperColor?: string;
  /** Line color (defaults: white in dark mode, a blue-black ink in light mode). */
  inkColor?: string;
  /** Frame-rate cap; the drift is slow, so 30fps is visually identical to 60. */
  maxFps?: number;
  className?: string;
  style?: CSSProperties;
};

const MODE_DEFAULTS: Record<TopoFieldMode, { paper: string; ink: string; grid: number; topo: number; width: number }> = {
  // Weights match the original shader and its light-mode patch.
  dark: { paper: "#000000", ink: "#ffffff", grid: 0.12, topo: 0.45, width: 0.02 },
  light: { paper: "#eef1f6", ink: "#1f242e", grid: 0.55, topo: 0.95, width: 0.03 },
};

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dpr;
uniform float u_noiseScale;
uniform float u_bands;
uniform float u_gridWeight;
uniform float u_topoWeight;
uniform float u_topoWidth;
uniform float u_strength;
uniform vec3 u_paper;
uniform vec3 u_ink;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox; m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  st.x *= u_resolution.x / u_resolution.y;

  // 1px physical grid
  float gridSize = 48.0 * u_dpr;
  vec2 gridFract = fract(gl_FragCoord.xy / gridSize);
  float lineThickness = 1.0 / gridSize;
  float gridLines = step(1.0 - lineThickness, gridFract.x) + step(1.0 - lineThickness, gridFract.y);
  gridLines = clamp(gridLines, 0.0, 1.0) * u_gridWeight;

  // Ultra-thin topographic lines
  vec2 noisePos = st * u_noiseScale + vec2(u_time * 0.015, u_time * 0.025);
  float n = snoise(noisePos) * 0.5 + 0.5;
  float triangleWave = abs(fract(n * u_bands) - 0.5) * 2.0;
  float topoLines = smoothstep(u_topoWidth, 0.0, triangleWave) * u_topoWeight;

  float lines = clamp((gridLines + topoLines) * u_strength, 0.0, 1.0);
  gl_FragColor = vec4(mix(u_paper, u_ink, lines), 1.0);
}
`;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function readAutomaticMode(): TopoFieldMode {
  if (typeof document === "undefined" || typeof window === "undefined") return "dark";
  const root = document.documentElement;
  const declared = root.dataset.scheme ?? root.dataset.theme;
  if (declared === "light" || declared === "dark") return declared;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useAutomaticMode(enabled: boolean) {
  const [autoMode, setAutoMode] = useState<TopoFieldMode>("dark");

  useEffect(() => {
    if (!enabled) return undefined;
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setAutoMode(readAutomaticMode());
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["data-scheme", "data-theme"] });
    media.addEventListener("change", update);
    update();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, [enabled]);

  return autoMode;
}

export default function TopoField({
  mode = "dark",
  speed = 1,
  length = 1,
  density = 1,
  opacity = 1,
  hue = 0,
  saturation = 1,
  brightness = 1,
  paperColor,
  inkColor,
  maxFps = 30,
  className,
  style,
}: TopoFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const automaticMode = useAutomaticMode(mode === "auto");
  const resolvedMode: TopoFieldMode = mode === "auto" ? automaticMode : mode === "light" ? "light" : "dark";
  const defaults = MODE_DEFAULTS[resolvedMode];
  const paper = paperColor ?? defaults.paper;
  const ink = inkColor ?? defaults.ink;

  // Live-tunable values read by the render loop without restarting WebGL.
  const knobs = useRef({ speed, length, density, opacity, paper, ink, defaults, maxFps });
  knobs.current = {
    speed: clamp(speed, 0, 3),
    length: clamp(length, 0.35, 2.5),
    density: clamp(density, 0.25, 2.5),
    opacity: clamp(opacity, 0.05, 1),
    paper,
    ink,
    defaults,
    maxFps: clamp(maxFps, 1, 120),
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false });
    if (!gl) return undefined; // No WebGL: the CSS paper background stays.

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("TopoField: shader failed to link", gl.getProgramInfoLog(program));
      return undefined;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uResolution = u("u_resolution");
    const uTime = u("u_time");
    const uDpr = u("u_dpr");
    const uNoiseScale = u("u_noiseScale");
    const uBands = u("u_bands");
    const uGridWeight = u("u_gridWeight");
    const uTopoWeight = u("u_topoWeight");
    const uTopoWidth = u("u_topoWidth");
    const uStrength = u("u_strength");
    const uPaper = u("u_paper");
    const uInk = u("u_ink");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uResolution, w, h);
      gl.uniform1f(uDpr, dpr);
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let virtualTime = 0;
    let lastReal = performance.now();
    let lastDraw = 0;
    let frame = 0;

    const draw = () => {
      const k = knobs.current;
      gl.uniform1f(uTime, virtualTime);
      gl.uniform1f(uNoiseScale, 1.4 * k.length);
      gl.uniform1f(uBands, 10 * k.density);
      gl.uniform1f(uGridWeight, k.defaults.grid);
      gl.uniform1f(uTopoWeight, k.defaults.topo);
      gl.uniform1f(uTopoWidth, k.defaults.width);
      gl.uniform1f(uStrength, k.opacity);
      gl.uniform3fv(uPaper, hexToRgb(k.paper));
      gl.uniform3fv(uInk, hexToRgb(k.ink));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const k = knobs.current;
      virtualTime += ((now - lastReal) / 1000) * k.speed;
      lastReal = now;
      if (now - lastDraw < 1000 / k.maxFps - 1) return;
      lastDraw = now;
      draw();
    };

    const start = () => {
      if (frame || reduceMotion) return;
      lastReal = performance.now();
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    resize();
    draw();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(canvas);

    // Only animate while on screen.
    const intersection = new IntersectionObserver(([entry]) => {

      if (entry.isIntersecting) start();
      else stop();
    });
    intersection.observe(canvas);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersection.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  const filter =
    hue === 0 && saturation === 1 && brightness === 1
      ? undefined
      : `hue-rotate(${clamp(hue, -180, 180)}deg) saturate(${clamp(saturation, 0, 2)}) brightness(${clamp(brightness, 0.35, 1.65)})`;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        background: paper,
        filter,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
