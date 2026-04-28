import { motion } from 'motion/react';
import { ShieldCheck, Heart, Clock } from 'lucide-react';

export default function CustomCare() {
  return (
    <section id="custom-care" className="py-32 bg-surface px-6 md:px-12 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Image side */}
          <div className="flex-1 relative w-full h-[500px] md:h-[600px]">
             <motion.div 
               className="w-full h-full overflow-hidden"
               initial={{ opacity: 0, scale: 1.1 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
             >
                <img 
                  src="/assets/about-hero.jpg" 
                  alt="Custom Care Maintenance" 
                  className="w-full h-full object-cover"
                />
             </motion.div>
             <motion.div 
               className="absolute -bottom-8 -right-8 bg-primary p-12 text-white hidden md:block"
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 1, delay: 0.5 }}
             >
                <p className="font-serif text-3xl">Turn-Key <br/> Peace of Mind.</p>
             </motion.div>
          </div>

          {/* Text side */}
          <div className="flex-1 space-y-10">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-[10px] font-sans tracking-[0.3em] uppercase text-accent mb-6 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-accent"></span>
                Beyond the Build
              </h2>
              <h3 className="font-serif text-5xl md:text-6xl text-primary leading-[1.1]">
                Custom Care <br/> Program.
              </h3>
            </motion.div>

            <motion.p
              className="text-primary-light font-sans leading-loose text-lg max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Our relationship doesn’t end when we hand over the keys. Homefront Builders offers a comprehensive Custom Care program—a proactive maintenance service designed to protect your investment and keep your home performing at its peak for years to come.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
               <motion.div 
                 className="flex gap-4"
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 1, delay: 0.3 }}
               >
                  <ShieldCheck className="w-6 h-6 text-accent shrink-0" />
                  <div>
                    <h4 className="font-serif text-xl text-primary mb-2">Warranty Support</h4>
                    <p className="text-primary-light text-sm leading-relaxed">Dedicated rapid-response team for all warranty inquiries.</p>
                  </div>
               </motion.div>
               <motion.div 
                 className="flex gap-4"
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 1, delay: 0.4 }}
               >
                  <Clock className="w-6 h-6 text-accent shrink-0" />
                  <div>
                    <h4 className="font-serif text-xl text-primary mb-2">Maintenance</h4>
                    <p className="text-primary-light text-sm leading-relaxed">Scheduled inspections to ensure every system is flawless.</p>
                  </div>
               </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="pt-8"
            >
              <button className="bg-primary hover:bg-primary-dark text-white px-10 py-4 font-sans text-xs tracking-[0.2em] uppercase transition-all duration-300">
                Explore Custom Care
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
