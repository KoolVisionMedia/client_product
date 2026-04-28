import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const floorPlans = [
  {
    id: 'cypress',
    title: 'The Cypress',
    exterior: '/assets/floorplans/Cypress.jpg',
    plans: ['/assets/floorplans/cypress_main_fp.jpg']
  },
  {
    id: 'dogwood',
    title: 'The Dogwood',
    exterior: '/assets/floorplans/Dogwood.jpg',
    plans: ['/assets/floorplans/dogwood_main_fp2.jpg', '/assets/floorplans/dogwood_upper_fp2.jpg']
  },
  {
    id: 'harmony',
    title: 'The Harmony',
    exterior: '/assets/floorplans/Harmony.jpg',
    plans: ['/assets/floorplans/harmony_main_fp2.jpg', '/assets/floorplans/harmony_fp2.jpg']
  },
  {
    id: 'magnolia',
    title: 'The Magnolia',
    exterior: '/assets/floorplans/Magnolia.jpg',
    plans: ['/assets/floorplans/magnolia_main_fp2.jpg', '/assets/floorplans/magnolia_upper_fp2.jpg']
  },
  {
    id: 'myrtle',
    title: 'The Myrtle',
    exterior: '/assets/floorplans/Myrtle.jpg',
    plans: ['/assets/floorplans/myrtle_main_fp2.jpg', '/assets/floorplans/myrtle_upper_fp2.jpg']
  }
];

const FloorPlanCard = ({ plan, index, total }: { plan: any, index: number, total: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Track this card's scroll to scale it down slightly when the next card covers it
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start start", "end start"]
  });

  // Shrink slightly but only if it's not the last card
  const scale = useTransform(scrollYProgress, [0, 1], [1, index === total - 1 ? 1 : 0.93]);

  return (
    <div 
      ref={cardRef} 
      className="sticky top-0 h-screen w-full flex items-center justify-center p-6 md:p-12 lg:p-24 origin-top"
      style={{ zIndex: index + 10 }}
    >
      <motion.div 
        style={{ scale }}
        className="w-full h-full max-h-[900px] bg-white shadow-[0_-30px_60px_rgba(0,0,0,0.25)] rounded-[30px] overflow-hidden flex flex-col md:flex-row relative"
      >
        {/* Left: Exterior Rendering */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden group">
          <img 
            src={plan.exterior} 
            alt={`${plan.title} Exterior`}
            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b2518]/90 via-[#1b2518]/40 to-[#1b2518]/10" />
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white p-4">
            <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent mb-2">Exterior Rendering</p>
            <h3 className="font-serif text-4xl md:text-5xl lg:text-7xl text-white drop-shadow-lg">{plan.title}</h3>
          </div>
        </div>

        {/* Right: Floor Plan Layouts */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full p-6 md:p-10 lg:p-12 flex flex-col bg-[#F8F8F8]">
          <div className="flex items-center gap-4 mb-6 shrink-0">
            <span className="w-8 h-[1px] bg-primary/30"></span>
            <h4 className="font-sans text-xs uppercase tracking-[0.3em] text-primary font-semibold">Layout Details</h4>
          </div>
          
          {/* Floor plans: side by side (left to right), single plan fills the space */}
          <div className="flex-grow min-h-0 flex flex-row gap-4 items-stretch">
            {plan.plans.map((p: string, i: number) => (
              <div 
                key={i} 
                className="flex-1 min-w-0 min-h-0 bg-white rounded-[20px] shadow-sm border border-gray-100 flex items-center justify-center p-4 hover:shadow-lg transition-shadow duration-500"
              >
                <img 
                  src={p} 
                  alt={`${plan.title} Floor Plan ${i + 1}`} 
                  className="max-w-full max-h-full w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function Portfolio() {
  return (
    <section id="portfolio" className="bg-surface relative">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto pt-32 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-[10px] font-sans tracking-[0.3em] uppercase text-accent mb-4">Our Work</h2>
            <h3 className="font-serif text-5xl lg:text-7xl text-primary">Featured Floor Plans</h3>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-2"
          >
            <p className="text-primary-light font-sans max-w-sm text-sm leading-relaxed mb-6">Explore our curated collection of architectural masterpieces, featuring stunning exteriors and highly functional layouts.</p>
          </motion.div>
        </div>
      </div>

      {/* Vertical Stacking / Folding Scroll Jacking */}
      <div className="relative pb-20">
        {floorPlans.map((plan, index) => (
          <FloorPlanCard 
            key={plan.id} 
            plan={plan} 
            index={index} 
            total={floorPlans.length} 
          />
        ))}
      </div>
    </section>
  );
}
