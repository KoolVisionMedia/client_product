import { useEffect, useRef, useState } from 'react';

interface FloatingLogo3DProps {
  className?: string;
  /** Flat image shown while the model loads, and kept if WebGL is unavailable. */
  fallbackSrc?: string;
  alt?: string;
}

const MODEL_URL = '/models/homefront-logo.glb';
const IDLE_SPIN = 0.45; // radians per second when nobody is dragging
const DRAG_SENSITIVITY = 0.012; // radians per pixel of pointer movement
const MAX_TILT = 0.6;

/**
 * The Homefront badge as a floating 3D model. It bobs and slowly turns on its own,
 * and can be grabbed and spun with the mouse or a finger (momentum carries on release).
 * three.js is loaded lazily, only when the logo scrolls near the viewport, and the
 * render loop pauses whenever it is off-screen.
 */
export default function FloatingLogo3D({
  className = '',
  fallbackSrc = '/logo-round.webp',
  alt = 'Homefront Builders logo',
}: FloatingLogo3DProps) {
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
      const [THREE, { GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/libs/meshopt_decoder.module.js'),
      ]);
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      } catch {
        return; // No WebGL: the fallback image stays visible.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0, 4);

      scene.add(new THREE.HemisphereLight(0xffffff, 0xd8cfc0, 1.4));
      const key = new THREE.DirectionalLight(0xffffff, 1.8);
      key.position.set(1.5, 2, 3);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.6);
      rim.position.set(-2, -1, -2);
      scene.add(rim);

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
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);

      let running = false;
      let frame = 0;
      let last = performance.now();
      let elapsed = 0;
      const idle = reduceMotion ? 0 : IDLE_SPIN;

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        elapsed += dt;

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
  }, []);

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
        aria-label={`${alt} (drag to spin)`}
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 select-none ${ready ? 'opacity-100' : 'opacity-0'} ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ touchAction: 'pan-y' }}
      />
    </div>
  );
}
