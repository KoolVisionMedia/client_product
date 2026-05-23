import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bed, Bath, Square, Home as HomeIcon, FileText } from 'lucide-react';

const floorPlans = [
  {
    id: 'cypress',
    title: 'The Cypress',
    exterior: '/assets/floorplans/Cypress.jpg',
    plans: ['/assets/floorplans/cypress_main_fp.jpg'],
    beds: 3,
    baths: 2.5,
    sqft: '2,100',
    description: 'The Cypress features a thoughtful open-concept main living area, perfect for entertaining. With natural light flooding the primary spaces and a beautifully appointed kitchen, this home balances elegance and everyday practicality.'
  },
  {
    id: 'dogwood',
    title: 'The Dogwood',
    exterior: '/assets/floorplans/Dogwood.jpg',
    plans: ['/assets/floorplans/dogwood_main_fp2.jpg', '/assets/floorplans/dogwood_upper_fp2.jpg'],
    beds: 4,
    baths: 3,
    sqft: '2,850',
    description: 'The Dogwood offers generous living space spread across two levels. The main floor boasts a grand entry and open living area, while the upper floor provides private retreats with spacious bedrooms and luxurious bathrooms.'
  },
  {
    id: 'harmony',
    title: 'The Harmony',
    exterior: '/assets/floorplans/Harmony.jpg',
    plans: ['/assets/floorplans/harmony_main_fp2.jpg', '/assets/floorplans/harmony_fp2.jpg'],
    beds: 4,
    baths: 3.5,
    sqft: '3,100',
    description: 'Experience balanced living in The Harmony. This plan is designed for modern families who desire both collaborative spaces and quiet corners. Featuring a gourmet kitchen and a stunning primary suite.'
  },
  {
    id: 'magnolia',
    title: 'The Magnolia',
    exterior: '/assets/floorplans/Magnolia.jpg',
    plans: ['/assets/floorplans/magnolia_main_fp2.jpg', '/assets/floorplans/magnolia_upper_fp2.jpg'],
    beds: 5,
    baths: 4,
    sqft: '3,500',
    description: 'The Magnolia is a testament to Southern charm and luxury. A sprawling two-story layout with soaring ceilings, a chef\'s dream kitchen, and ample outdoor living space makes it perfect for hosting.'
  },
  {
    id: 'myrtle',
    title: 'The Myrtle',
    exterior: '/assets/floorplans/Myrtle.jpg',
    plans: ['/assets/floorplans/myrtle_main_fp2.jpg', '/assets/floorplans/myrtle_upper_fp2.jpg'],
    beds: 3,
    baths: 2,
    sqft: '1,950',
    description: 'The Myrtle is a streamlined, highly functional single-level living space with an optional upper loft. It maximizes every square foot, offering a cozy yet open environment with premium finishes throughout.'
  }
];

export default function Floorplans() {
  const [selectedPlan, setSelectedPlan] = useState<typeof floorPlans[0] | null>(null);

  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (selectedPlan) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPlan]);

  return (
    <div className="bg-surface min-h-screen pt-32 pb-24">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent mb-4 block">Our Portfolio</span>
          <h1 className="font-serif text-5xl md:text-7xl text-primary mb-6">Featured Floorplans</h1>
          <p className="font-sans text-primary-light max-w-2xl mx-auto leading-relaxed">
            Explore our curated collection of architectural masterpieces. Each of our custom floorplans is designed with
            flow, functionality, and timeless aesthetics in mind. Select a plan to view detailed layouts and information.
          </p>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {floorPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col"
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={plan.exterior} 
                  alt={plan.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="font-serif text-3xl text-primary mb-4">{plan.title}</h3>
                <div className="flex gap-4 mb-6 text-primary/60 font-sans text-xs uppercase tracking-widest border-b border-gray-100 pb-6">
                  <span className="flex items-center gap-1"><Bed size={14} className="text-accent" /> {plan.beds}</span>
                  <span className="flex items-center gap-1"><Bath size={14} className="text-accent" /> {plan.baths}</span>
                  <span className="flex items-center gap-1"><Square size={14} className="text-accent" /> {plan.sqft}</span>
                </div>
                <button className="mt-auto font-sans text-xs tracking-[0.2em] uppercase text-accent font-medium flex items-center gap-2 group-hover:text-primary transition-colors">
                  View Layouts
                  <span className="w-6 h-[1px] bg-accent group-hover:w-10 group-hover:bg-primary transition-all duration-300"></span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-[#0f1a0c]/80 backdrop-blur-sm cursor-pointer"
              onClick={() => setSelectedPlan(null)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[1200px] max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedPlan(null)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-primary hover:bg-accent hover:text-white transition-all duration-300 shadow-sm"
              >
                <X size={24} />
              </button>

              <div className="overflow-y-auto flex-grow flex flex-col lg:flex-row">
                {/* Left side: Exterior & Info */}
                <div className="w-full lg:w-2/5 bg-surface p-8 md:p-12 flex flex-col">
                  <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden mb-8 shrink-0">
                    <img 
                      src={selectedPlan.exterior} 
                      alt={selectedPlan.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h2 className="font-serif text-4xl md:text-5xl text-primary mb-2">{selectedPlan.title}</h2>
                  <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-accent mb-4">Custom Home Plan</p>
                  
                  <a
                    href="/assets/floorplans/Homefront Builders Floorplan Book.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mb-8 font-sans text-xs tracking-wider text-accent hover:text-primary transition-all duration-300 group/pdf w-fit"
                  >
                    <FileText size={16} className="text-accent group-hover/pdf:text-primary transition-colors duration-300" />
                    <span className="border-b border-accent/20 group-hover/pdf:border-primary/50 transition-all duration-300 pb-0.5 font-medium">
                      Homefront Builders Floorplan Book.pdf
                    </span>
                  </a>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8 border-y border-gray-200 py-8">
                    <div className="flex flex-col gap-2">
                      <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-primary/40">Bedrooms</span>
                      <span className="font-sans text-xl text-primary flex items-center gap-2">
                        <Bed size={20} className="text-accent" /> {selectedPlan.beds}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-primary/40">Bathrooms</span>
                      <span className="font-sans text-xl text-primary flex items-center gap-2">
                        <Bath size={20} className="text-accent" /> {selectedPlan.baths}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-primary/40">Square Feet</span>
                      <span className="font-sans text-xl text-primary flex items-center gap-2">
                        <Square size={20} className="text-accent" /> {selectedPlan.sqft}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-primary/40">Type</span>
                      <span className="font-sans text-lg text-primary flex items-center gap-2">
                        <HomeIcon size={20} className="text-accent" /> Custom
                      </span>
                    </div>
                  </div>
                  
                  <p className="font-sans text-sm leading-relaxed text-primary/70">
                    {selectedPlan.description}
                  </p>
                </div>

                {/* Right side: Floorplans */}
                <div className="w-full lg:w-3/5 p-8 md:p-12 bg-white flex flex-col gap-8 justify-center items-center">
                  <h3 className="font-sans text-xs uppercase tracking-[0.3em] text-primary w-full text-center lg:text-left mb-4">Floorplan Layouts</h3>
                  {selectedPlan.plans.map((planImg, i) => (
                    <div key={i} className="w-full max-w-xl bg-surface rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <img 
                        src={planImg} 
                        alt={`${selectedPlan.title} Layout ${i + 1}`} 
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
