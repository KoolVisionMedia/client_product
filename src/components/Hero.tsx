import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export default function Hero() {
  // Only load the hero video on larger screens (and when motion is allowed).
  // Mobile visitors get the lightweight poster image instead, which avoids a
  // multi-MB video download — the biggest mobile performance win on this page.
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const canPlay =
      window.matchMedia('(min-width: 768px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (canPlay) setShowVideo(true);
  }, []);

  // The hero video plays continuously while it's on screen. We only pause it
  // once it's fully scrolled out of view (nothing visible, no reason to keep
  // decoding) and resume when it scrolls back — so it never freezes mid-view.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.05 }
    );
    io.observe(v);

    return () => io.disconnect();
  }, [showVideo]);

  return (
    <section className="relative pt-[100px] bg-white overflow-hidden" id="home">
      {/* Full Width Video Container */}
      <div className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden shadow-sm">
        {/* Hero Background */}
        <div className="absolute inset-0 w-full h-full bg-black/50">
          {/* Poster image — the LCP element; loads instantly on every device */}
          <img
            src="/assets/hero-poster.webp"
            alt="Luxury custom home built by Homefront Builders"
            className="absolute inset-0 w-full h-full object-cover z-0"
            fetchPriority="high"
          />
          {showVideo && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              poster="/assets/hero-poster.webp"
              className="absolute inset-0 w-full h-full object-cover z-0"
            >
              <source src="/background-video-v3.mp4" type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-black/40 z-10"></div> {/* Dark Overlay */}
        </div>

        {/* Content - Left Aligned to match Patterson */}
        <div className="relative z-20 h-full flex flex-col items-start justify-center text-left px-6 md:px-24">
          <motion.h1 
            className="font-serif text-5xl md:text-7xl lg:text-[6rem] text-white mb-6 max-w-4xl leading-[1.1]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            Clarksville’s Premier <br/> Custom Home Builder
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="mb-10"
          >
            <div className="text-white text-xs md:text-sm tracking-[0.4em] uppercase font-sans font-medium opacity-90">
              Setting the Gold Standard for Home Construction
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          >
            <Link
              to="/listings"
              className="inline-block bg-accent hover:bg-accent-dark text-primary-dark px-10 py-5 font-sans text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105 font-bold"
            >
              View Our Builds
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <ScrollIndicator />
      </div>
    </section>
  );
}

function ScrollIndicator() {
  return (
    <motion.div 
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1 }}
    >
      <span className="text-white text-[10px] tracking-[0.3em] uppercase font-sans">Scroll</span>
      <div className="w-[1px] h-16 bg-white/20 relative overflow-hidden">
        <motion.div 
          className="w-full h-full bg-white absolute top-0 left-0"
          animate={{
            y: ['-100%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </motion.div>
  );
}
