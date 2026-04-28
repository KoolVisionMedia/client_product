import { motion } from 'motion/react';

export default function About() {
  return (
    <section id="about" className="py-32 md:py-40 bg-surface px-6 md:px-12 overflow-hidden">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-20 items-center">
        {/* Text Content */}
        <div className="flex-1 space-y-10 z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-[10px] font-sans tracking-[0.3em] uppercase text-accent mb-6 flex items-center gap-4">
              <span className="w-12 h-[1px] bg-accent"></span>
              The Homefront Legacy
            </h2>
            <h3 className="font-serif text-5xl md:text-6xl text-primary leading-[1.1]">
              Meet Your Custom <br/> Home Builder.
            </h3>
          </motion.div>

          <motion.p
            className="text-primary-light font-sans leading-loose text-lg max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            With over two decades of expertise in Middle Tennessee, Home Front Builders has redefined luxury living through a commitment to quality, transparency, and superior project management. We don't just build houses; we curate lifestyles for families who demand the absolute best in craftsmanship and design.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <a href="#about" className="inline-block border-b border-primary/30 pb-2 text-primary hover:text-accent hover:border-accent transition-all duration-300 font-sans uppercase tracking-[0.2em] text-xs font-semibold">
              More About Us
            </a>
          </motion.div>
        </div>

        {/* Image Collage */}
        <div className="flex-1 relative w-full h-[600px] lg:h-[800px] mt-12 lg:mt-0">
          <motion.div 
            className="absolute top-0 right-0 w-[85%] h-[75%] bg-surface-alt z-10 overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, x: 100, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.img 
              src="/assets/DSC04388-Edit.jpg" 
              alt="Luxury Home Exterior" 
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </motion.div>
          <motion.div 
            className="absolute bottom-0 left-0 w-[55%] h-[55%] bg-white p-2 z-20 shadow-2xl"
            initial={{ opacity: 0, x: -150, y: 150, rotate: -10 }}
            whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
             <div className="w-full h-full overflow-hidden">
                <motion.img 
                  src="/assets/Harmony.jpg" 
                  alt="Luxury Home Interior" 
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
