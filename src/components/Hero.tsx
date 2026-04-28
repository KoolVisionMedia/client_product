import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative pt-[100px] bg-white overflow-hidden" id="home">
      {/* Full Width Video Container */}
      <div className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden shadow-sm">
        {/* Hero Background Video */}
        <div className="absolute inset-0 w-full h-full bg-black/50">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src="/background-video.mp4" type="video/mp4" />
          </video>
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
              Setting The New Standard For Home Construction
            </div>
          </motion.div>

          <motion.button
            className="bg-accent hover:bg-accent-dark text-white px-10 py-5 font-sans text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105 font-bold"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          >
            View Our Work
          </motion.button>
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
