import { useEffect, useRef, useState } from 'react';

interface FloatingLogo3DProps {
  className?: string;
  /** Flat image shown while the model loads, and kept if WebGL is unavailable. */
  fallbackSrc?: string;
  alt?: string;
  /**
   * 'spin': turns on its own and can be dragged to spin.
   * 'scrollTilt': always shows its front, tilting gently on a diagonal as the page scrolls.
   */
  motion?: 'spin' | 'scrollTilt';
}

const MODEL_URL = '/models/homefront-logo.glb';
const IDLE_SPIN = 0.45; // radians per second when nobody is dragging
const DRAG_SENSITIVITY = 0.012; // radians per pixel of pointer movement
const MAX_TILT = 0.6;
const SCROLL_TILT = 0.55; // radians of tilt at the top/bottom of the viewport (~32°)
const SCROLL_TILT_EASE = 2.2; // lower = lazier follow
const SWAY = 0.14; // radians of slow idle sway layered on top, so it never sits dead still
const CURSOR_TILT = 0.5; // radians the badge turns toward a hovering mouse at the rim
const CURSOR_REACH = 1.6; // how far out (in badge radii) the mouse still pulls on it
const SHEEN_EVERY = 6.5; // seconds between automatic shine sweeps
const SHEEN_DURATION = 1.4; // seconds for one sweep to cross the face

/**
 * The Homefront badge as a floating 3D model. In 'spin' mode it bobs and slowly turns
 * on its own, and can be grabbed and spun (momentum carries on release). In 'scrollTilt'
 * mode it faces forward and eases into a diagonal tilt driven by its scroll position.
 * three.js is loaded lazily, only when the logo scrolls near the viewport, and the
 * render loop pauses whenever it is off-screen.
 */
export default function FloatingLogo3D({
  className = '',
  fallbackSrc = '/logo-round.webp',
  alt = 'Homefront Builders logo',
  motion = 'spin',
}: FloatingLogo3DProps) {
  const scrollTilt = motion === 'scrollTilt';
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let disposed = false;
    let cleanupScene: (() => void) | undefined;
    let visible = false;
    let startLoop: (() => void) | undefined;

    const init = async () => {
      const [THREE, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/libs/meshopt_decoder.module.js'),
        import('three/examples/jsm/environments/RoomEnvironment.js'),
      ]);
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      } catch {
        return; // No WebGL: the fallback image stays visible.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      // Neutral keeps the brand orange saturated (ACES washed it out to peach).
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 0.93;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0, 4);

      // A soft studio room for the glossy finish to reflect; this is what makes highlights
      // slide across the face as the badge tilts.
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envMap;
      scene.environmentIntensity = 0.55;

      scene.add(new THREE.HemisphereLight(0xffffff, 0xd8cfc0, 0.35));
      // Key light from the upper right at a raking angle for a strong specular glint.
      const key = new THREE.DirectionalLight(0xfff6e8, 2.0);
      key.position.set(2.5, 2.5, 2);
      scene.add(key);
      // Cool fill from the lower left keeps the shadow side from going muddy.
      const fill = new THREE.DirectionalLight(0xe8f0ff, 0.6);
      fill.position.set(-2, -1.5, 2);
      scene.add(fill);
      // Rim light from behind catches the coin's edge so its thickness reads.
      const rim = new THREE.DirectionalLight(0xffffff, 1.6);
      rim.position.set(-2.5, 1.5, -2.5);
      scene.add(rim);

      // Shine sweep + cursor glint, added in the surface shader (a real light this close
      // just washes the whole face out). The band's position is nudged by the surface normal,
      // so it bends and sparkles over the raised stars and lettering like a true reflection.
      const shine = {
        uSheenPos: { value: -10 }, // position along the diagonal, in model units (badge radius 0.5)
        uSheenStrength: { value: 0 },
        uCursor: { value: new THREE.Vector2() },
        uGlint: { value: 0 },
      };
      const addShine = (material: InstanceType<typeof THREE.MeshPhysicalMaterial>) => {
        material.onBeforeCompile = (shader) => {
          Object.assign(shader.uniforms, shine);
          shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\nvarying vec3 vShineWorld;')
            .replace(
              '#include <project_vertex>',
              '#include <project_vertex>\nvShineWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;'
            );
          shader.fragmentShader = shader.fragmentShader
            .replace(
              '#include <common>',
              `#include <common>
              varying vec3 vShineWorld;
              uniform float uSheenPos;
              uniform float uSheenStrength;
              uniform vec2 uCursor;
              uniform float uGlint;`
            )
            .replace(
              '#include <dithering_fragment>',
              `{
                vec2 dir = vec2(0.7071, 0.7071);
                float coord = dot(vShineWorld.xy, dir) + dot(normal.xy, dir) * 0.08;
                // x*x, not pow(x, 2.0): pow is undefined for negative x in GLSL.
                float a = (coord - uSheenPos) / 0.035;
                float b = (coord - uSheenPos) / 0.14;
                float core = exp(-a * a);
                float halo = exp(-b * b);
                vec2 toCursor = vShineWorld.xy - uCursor;
                float glint = exp(-dot(toCursor, toCursor) / 0.018);
                vec3 tint = vec3(1.0, 0.98, 0.93);
                gl_FragColor.rgb += tint * ((core * 0.7 + halo * 0.2) * uSheenStrength + glint * uGlint);
              }
              #include <dithering_fragment>`
            );
        };
      };

      const pivot = new THREE.Group();
      scene.add(pivot);

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      const gltf = await loader.loadAsync(MODEL_URL);
      if (disposed) {
        renderer.dispose();
        return;
      }

      // Normalise: centre the model and scale its largest dimension to 1 unit.
      const model = gltf.scene;
      // The exported material is matte (roughness 0.75, no clearcoat). Swap in a glossy,
      // enamel-coin finish over the same artwork so it picks up highlights.
      model.traverse((obj) => {
        const mesh = obj as InstanceType<typeof THREE.Mesh>;
        if (!mesh.isMesh) return;
        const old = mesh.material as InstanceType<typeof THREE.MeshStandardMaterial>;
        if (old.map) old.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const glossy = new THREE.MeshPhysicalMaterial({
          map: old.map,
          color: old.color,
          roughness: 0.32,
          metalness: 0.15,
          clearcoat: 0.6,
          clearcoatRoughness: 0.14,
        });
        if (scrollTilt) addShine(glossy);
        mesh.material = glossy;
        old.dispose();
      });
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      const holder = new THREE.Group();
      holder.add(model);
      holder.scale.setScalar(1 / Math.max(size.x, size.y, size.z));
      pivot.add(holder);

      // Fit the camera so the badge fills the canvas with a little room to float.
      const fitHeight = 1.3;
      camera.position.z = fitHeight / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = container;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Spin state
      let velocity = reduceMotion ? 0 : IDLE_SPIN;
      let tilt = 0;
      let tiltVelocity = 0;
      let isDragging = false;
      let lastX = 0;
      let lastY = 0;
      let lastMoveTime = 0;

      const onPointerDown = (e: PointerEvent) => {
        isDragging = true;
        setDragging(true);
        lastX = e.clientX;
        lastY = e.clientY;
        lastMoveTime = performance.now();
        velocity = 0;
        tiltVelocity = 0;
        canvas.setPointerCapture(e.pointerId);
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        const now = performance.now();
        const dt = Math.max((now - lastMoveTime) / 1000, 1 / 240);
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        pivot.rotation.y += dx * DRAG_SENSITIVITY;
        tilt = THREE.MathUtils.clamp(tilt + dy * DRAG_SENSITIVITY, -MAX_TILT, MAX_TILT);
        // Remember how fast they were flicking so the spin carries on after release.
        velocity = (dx * DRAG_SENSITIVITY) / dt;
        tiltVelocity = (dy * DRAG_SENSITIVITY) / dt;
        lastX = e.clientX;
        lastY = e.clientY;
        lastMoveTime = now;
        if (!running) startLoop?.();
      };
      const onPointerUp = (e: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;
        setDragging(false);
        // A pause before letting go means no flick.
        if (performance.now() - lastMoveTime > 80) {
          velocity = 0;
          tiltVelocity = 0;
        }
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      };
      if (!scrollTilt) {
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', onPointerUp);
      }

      // Scroll-tilt state: -1 when the logo sits at the bottom of the viewport, +1 at the top.
      const scrollTarget = () => {
        const r = container.getBoundingClientRect();
        const p = (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight;
        return THREE.MathUtils.clamp(p, -1, 1) * SCROLL_TILT;
      };
      let tiltAmount = reduceMotion ? 0 : scrollTarget();

      // Mouse hover: the canvas ignores pointer events (so the photos underneath keep theirs),
      // so track the mouse on the window and measure it against the badge's bounds.
      let mouseX = 0;
      let mouseY = 0;
      let hasMouse = false;
      const onWindowPointerMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        mouseX = e.clientX;
        mouseY = e.clientY;
        hasMouse = true;
      };
      const onWindowPointerLeave = () => {
        hasMouse = false;
      };
      if (scrollTilt && !reduceMotion) {
        window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onWindowPointerLeave);
      }
      let cursorX = 0; // eased, -1..1 across the badge
      let cursorY = 0;
      let hover = 0; // eased 0..1 strength of the mouse's pull
      let wasNear = false;
      let sheenStart = 1.5; // first sweep shortly after it appears

      let running = false;
      let frame = 0;
      let last = performance.now();
      let elapsed = 0;
      const idle = reduceMotion ? 0 : IDLE_SPIN;

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        elapsed += dt;

        if (scrollTilt) {
          // Ease toward the scroll-driven tilt; the same amount on both axes gives a diagonal tip.
          if (!reduceMotion) tiltAmount += (scrollTarget() - tiltAmount) * (1 - Math.exp(-dt * SCROLL_TILT_EASE));
          // Mouse pull: where the cursor sits relative to the badge, in badge radii.
          let targetX = 0;
          let targetY = 0;
          let near = false;
          if (hasMouse && !reduceMotion) {
            const r = container.getBoundingClientRect();
            const radius = (r.width / 2) * 0.77; // the badge fills ~77% of its box
            const rx = (mouseX - (r.left + r.width / 2)) / radius;
            const ry = (mouseY - (r.top + r.height / 2)) / radius;
            near = Math.hypot(rx, ry) < CURSOR_REACH;
            if (near) {
              targetX = THREE.MathUtils.clamp(rx, -1, 1);
              targetY = THREE.MathUtils.clamp(ry, -1, 1);
            }
          }
          const follow = 1 - Math.exp(-dt * 5);
          cursorX += (targetX - cursorX) * follow;
          cursorY += (targetY - cursorY) * follow;
          hover += ((near ? 1 : 0) - hover) * (1 - Math.exp(-dt * 4));
          // Moving onto the badge kicks off a shine sweep (unless one just ran).
          if (near && !wasNear && elapsed - sheenStart > SHEEN_DURATION + 0.4) sheenStart = elapsed;
          wasNear = near;

          // Slow figure-eight sway plus a slight roll, out of phase so highlights keep drifting.
          // It relaxes while the mouse is steering so the badge tracks the cursor cleanly.
          const sway = reduceMotion ? 0 : SWAY * (1 - hover * 0.6);
          pivot.rotation.x = -tiltAmount * 0.8 + Math.sin(elapsed * 0.55) * sway * 0.7 + cursorY * CURSOR_TILT;
          pivot.rotation.y = tiltAmount + Math.sin(elapsed * 0.4 + 1.2) * sway + cursorX * CURSOR_TILT;
          pivot.rotation.z = tiltAmount * -0.18 + Math.sin(elapsed * 0.3) * sway * 0.35;
          pivot.position.y = reduceMotion ? 0 : Math.sin(elapsed * 1.1) * 0.03;

          // Glint: a soft hotspot under the cursor's spot on the face.
          shine.uCursor.value.set(cursorX * 0.4, -cursorY * 0.4);
          shine.uGlint.value = hover * 0.28;

          // Shine sweep: glide the band diagonally from lower-left to upper-right.
          if (!reduceMotion) {
            if (elapsed - sheenStart > SHEEN_EVERY) sheenStart = elapsed;
            const t = (elapsed - sheenStart) / SHEEN_DURATION;
            if (t >= 0 && t <= 1) {
              const eased = t * t * (3 - 2 * t);
              shine.uSheenPos.value = -0.9 + eased * 1.8;
              shine.uSheenStrength.value = Math.sin(t * Math.PI);
            } else {
              shine.uSheenStrength.value = 0;
            }
          }
          renderer.render(scene, camera);
          if (visible && !reduceMotion) {
            frame = requestAnimationFrame(tick);
          } else {
            running = false;
          }
          return;
        }

        if (!isDragging) {
          // Momentum eases back toward the gentle idle spin (keeping the flick's direction).
          const target = Math.sign(velocity || 1) * idle;
          velocity += (target - velocity) * (1 - Math.exp(-dt * 1.6));
          pivot.rotation.y += velocity * dt;
          tiltVelocity *= Math.exp(-dt * 6);
          tilt += tiltVelocity * dt;
          tilt = THREE.MathUtils.clamp(tilt, -MAX_TILT, MAX_TILT);
          tilt += (0 - tilt) * (1 - Math.exp(-dt * 2.5));
        }

        pivot.rotation.x = tilt + (reduceMotion ? 0 : Math.sin(elapsed * 0.8) * 0.06);
        pivot.position.y = reduceMotion ? 0 : Math.sin(elapsed * 1.3) * 0.05;

        renderer.render(scene, camera);

        // With reduced motion there is nothing to animate once the flick settles.
        const settled = reduceMotion && !isDragging && Math.abs(velocity) < 0.001 && Math.abs(tilt) < 0.001;
        if (visible && !settled) {
          frame = requestAnimationFrame(tick);
        } else {
          running = false;
        }
      };

      startLoop = () => {
        if (running || disposed) return;
        running = true;
        last = performance.now();
        frame = requestAnimationFrame(tick);
      };

      renderer.render(scene, camera);
      setReady(true);
      if (visible) startLoop();

      cleanupScene = () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        window.removeEventListener('pointermove', onWindowPointerMove);
        document.documentElement.removeEventListener('pointerleave', onWindowPointerLeave);
        model.traverse((obj) => {
          const mesh = obj as InstanceType<typeof THREE.Mesh>;
          if (!mesh.isMesh) return;
          mesh.geometry.dispose();
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((m) => {
            const map = (m as InstanceType<typeof THREE.MeshStandardMaterial>).map;
            map?.dispose();
            m.dispose();
          });
        });
        envMap.dispose();
        pmrem.dispose();
        renderer.dispose();
      };
    };

    let initStarted = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !initStarted) {
          initStarted = true;
          // If the model fails to load, the fallback image simply stays visible.
          init().catch((err) => console.warn('FloatingLogo3D: 3D logo unavailable', err));
        }
        if (visible) startLoop?.();
      },
      { rootMargin: '200px' }
    );
    observer.observe(container);

    return () => {
      disposed = true;
      observer.disconnect();
      cleanupScene?.();
    };
  }, [scrollTilt]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <img
        src={fallbackSrc}
        alt={alt}
        aria-hidden={ready}
        className={`absolute inset-[11.5%] w-[77%] h-[77%] object-contain rounded-full transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
      />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={scrollTilt ? alt : `${alt} (drag to spin)`}
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 select-none ${ready ? 'opacity-100' : 'opacity-0'} ${scrollTilt ? 'pointer-events-none' : dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ touchAction: 'pan-y' }}
      />
    </div>
  );
}
