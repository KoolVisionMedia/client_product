import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bed, Bath, Square, Home as HomeIcon, FileText } from 'lucide-react';
import SEO from '../components/SEO';

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
      <SEO
        title="Custom Home Floor Plans"
        description="Explore Homefront Builders' custom floor plans — the Cypress, Dogwood, Harmony, Magnolia, and Myrtle. Stunning exteriors, highly functional layouts."
        path="/floorplans"
      />
      {/* Booklet Hero Section */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16 mt-4">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent mb-4 block">Exclusive Catalog</span>
            <h1 className="font-serif text-5xl md:text-7xl text-primary mb-6 leading-tight">
              Featured Floorplans
            </h1>
            <p className="font-sans text-primary-light text-base md:text-lg leading-relaxed">
              Explore our curated collection of architectural masterpieces. Each custom home floorplan is 
              thoughtfully designed with flow, natural lighting, and timeless luxury in mind. Hover over 
              any book below to swing the cover open and preview its interior layout. Click any floor plan 
              to inspect detailed specifications, or select the central Booklet to download the offline-ready catalog.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <a
              href="/assets/floorplans/Homefront Builders Floorplan Book.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent text-white font-sans text-xs uppercase tracking-[0.2em] font-semibold rounded-full hover:bg-primary transition-all duration-300 shadow-md hover:shadow-lg group"
            >
              Download Booklet (PDF)
              <span className="w-4 h-[1px] bg-white ml-2 group-hover:w-8 transition-all duration-300"></span>
            </a>
            <button
              onClick={() => {
                const el = document.getElementById('floorplans-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center px-8 py-4 border border-primary/20 text-primary font-sans text-xs uppercase tracking-[0.2em] font-semibold rounded-full hover:bg-white transition-all duration-300"
            >
              Browse Interactive Grid
            </button>
          </motion.div>
        </div>
      </div>

      {/* 3D Bookshelf Slider Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="w-full max-w-[1450px] mx-auto px-4 md:px-12 relative mb-28 overflow-hidden"
      >
        {/* Soft decorative background blur shapes */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-accent/5 rounded-full blur-3xl blob-shape floating" />
        <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-primary/5 rounded-full blur-3xl blob-shape floating" style={{ animationDelay: '2s' }} />

        {/* Row 1: Prominent Master Booklet Catalog (Dedicated Prominent Hero Row) */}
        <div className="flex flex-col items-center justify-center text-center mb-4 relative pt-8">
          {/* Ambient Gold Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          
          <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent mb-6 block relative z-10">Complete Catalog</span>
          
          {/* Master Booklet 3D Book */}
          <div 
            className="bookshelf-book-wrapper bookshelf-book-wrapper--booklet group/book relative flex flex-col items-center select-none w-[210px] h-[340px] sm:w-[250px] sm:h-[400px] md:w-[300px] md:h-[490px] lg:w-[340px] lg:h-[560px] z-30 cursor-pointer"
            onClick={() => {
              window.open('/assets/floorplans/Homefront Builders Floorplan Book.pdf', '_blank');
            }}
          >
            <div 
              className="w-full h-full relative bookshelf-book transition-transform duration-[0.8s] ease-[cubic-bezier(0.25,1,0.5,1)]"
            >
              {/* Spine */}
              <div className="absolute bg-accent rounded-l-[3px] shadow-[inset_-4px_0_10px_rgba(0,0,0,0.5)] z-20" style={{ width: '20px', left: '-10px', height: '100%', transform: 'rotateY(-90deg)', transformOrigin: 'left center' }} />
              {/* Back Cover Shadow */}
              <div className="absolute inset-0 bg-accent-dark -translate-z-[12px] shadow-[5px_10px_25px_rgba(0,0,0,0.3)] rounded-r-[4px]" />
              
              {/* Inside Page (Download PDF Button) */}
              <div className="bookshelf-book-pages bg-primary shadow-[2px_2px_8px_rgba(0,0,0,0.15)] book-page-stack">
                <div className="w-full h-full overflow-hidden p-6 flex flex-col items-center justify-center text-center gap-4 bg-primary text-white rounded-r-[4px]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span className="font-sans text-[10px] font-semibold tracking-[0.1em] uppercase text-accent leading-relaxed">Download Complete PDF Catalog</span>
                </div>
              </div>
              
              {/* Cover Page (Booklet Cover Image) */}
              <div className="bookshelf-book-cover shadow-[4px_4px_15px_rgba(0,0,0,0.25)] rounded-r-[4px]">
                <div className="absolute inset-0 z-10 backface-hidden rounded-r-[4px] overflow-hidden">
                  <img loading="lazy" decoding="async" src="/assets/floorplans/floorplan-booklet-cover.png" alt="Booklet Cover" className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/95 via-primary/60 to-primary/20 flex flex-col justify-end p-6 text-white">
                    <span className="font-sans text-[8px] uppercase tracking-[0.2em] mb-1.5 text-white">Master Booklet</span>
                    <h4 className="font-serif text-lg md:text-xl text-white font-medium m-0 leading-tight">Floorplan Booklet</h4>
                  </div>
                </div>
                <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-l-[4px] bg-accent/90 border-r border-accent-dark/30" />
              </div>
            </div>
            <div className="mt-8 flex flex-col items-center text-center pointer-events-none group-hover/book:translate-y-2 transition-transform duration-500">
              <span className="font-serif text-base md:text-lg text-accent font-bold">Floor Plan Booklet</span>
              <span className="font-sans text-xs text-primary font-medium">Complete PDF Brochure</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid Section Header */}
      <div id="floorplans-grid" className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12 text-center scroll-mt-32">
        <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent mb-3 block">Selectable Options</span>
        <h2 className="font-serif text-3xl md:text-5xl text-primary mb-4 leading-tight">Featured Floorplans</h2>
        <div className="w-16 h-[2px] bg-accent mx-auto" />
      </div>

      {/* Grid Cards container */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-24">
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
                <img loading="lazy" decoding="async" src={plan.exterior} 
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

              <div className="h-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
                {/* Left Column: Info & Specs */}
                <div className="w-full lg:w-[38%] bg-surface p-5 md:p-7 flex flex-col gap-3 lg:overflow-y-auto shrink-0">
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden shadow-sm border border-gray-200/50 bg-white shrink-0">
                    <img loading="lazy" decoding="async" src={selectedPlan.exterior} 
                      alt={selectedPlan.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl text-primary mb-0.5 leading-tight">{selectedPlan.title}</h2>
                    <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-accent font-semibold">Custom Home Plan</p>
                  </div>
                  
                  <p className="font-sans text-sm leading-relaxed text-primary/80">
                    {selectedPlan.description}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 bg-white rounded-xl p-3 border border-gray-100">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-sans text-[8px] uppercase tracking-[0.2em] text-primary/40 font-semibold">Bedrooms</span>
                      <span className="font-sans text-sm text-primary flex items-center gap-1 font-bold">
                        <Bed size={14} className="text-accent" /> {selectedPlan.beds}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-sans text-[8px] uppercase tracking-[0.2em] text-primary/40 font-semibold">Bathrooms</span>
                      <span className="font-sans text-sm text-primary flex items-center gap-1 font-bold">
                        <Bath size={14} className="text-accent" /> {selectedPlan.baths}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-sans text-[8px] uppercase tracking-[0.2em] text-primary/40 font-semibold">Square Feet</span>
                      <span className="font-sans text-sm text-primary flex items-center gap-1 font-bold">
                        <Square size={14} className="text-accent" /> {selectedPlan.sqft}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-sans text-[8px] uppercase tracking-[0.2em] text-primary/40 font-semibold">Type</span>
                      <span className="font-sans text-sm text-primary flex items-center gap-1 font-bold">
                        <HomeIcon size={14} className="text-accent" /> Custom
                      </span>
                    </div>
                  </div>

                  <a
                    href="/assets/floorplans/Homefront Builders Floorplan Book.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 font-sans text-sm tracking-wide text-accent hover:text-primary transition-all duration-300 group/pdf w-fit"
                  >
                    <FileText size={18} className="text-accent group-hover/pdf:text-primary transition-colors duration-300" />
                    <span className="border-b-2 border-accent/20 group-hover/pdf:border-primary/50 transition-all duration-300 pb-0.5 font-bold">
                      Homefront Builders Floorplan Book.pdf
                    </span>
                  </a>
                </div>

                {/* Right Column: Blueprint Layouts (fills remaining height) */}
                <div className="w-full lg:w-[62%] p-5 md:p-7 bg-white flex flex-col gap-3 lg:h-full">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-gray-100 pb-1.5 shrink-0">
                    <h3 className="font-serif text-lg text-primary">Floorplan Layout Sheets</h3>
                    <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-accent font-semibold">
                      {selectedPlan.plans.length} {selectedPlan.plans.length > 1 ? 'Sheets' : 'Sheet'} Included
                    </span>
                  </div>
                  
                  <div className={`w-full flex-grow grid gap-3 ${selectedPlan.plans.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} min-h-0`}>
                    {selectedPlan.plans.map((planImg, i) => (
                      <div key={i} className="w-full bg-surface rounded-xl p-2 border border-gray-100 shadow-sm flex items-center justify-center relative group/blueprint overflow-hidden min-h-0">
                        <div className="absolute top-3 right-3 bg-primary/95 text-white text-[8px] uppercase tracking-widest font-semibold py-1 px-2.5 rounded-full shadow-md opacity-0 group-hover/blueprint:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                          {i === 0 && selectedPlan.plans.length > 1 ? 'Main Level' : i === 1 && selectedPlan.plans.length > 1 ? 'Upper Level' : 'Floor Plan'}
                        </div>
                        
                        <img loading="lazy" decoding="async" src={planImg} 
                          alt={`${selectedPlan.title} Layout ${i + 1}`} 
                          className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover/blueprint:scale-[1.01]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps to Building Section */}
      <section className="py-24 bg-white border-t border-gray-100 overflow-hidden mt-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* Left column: Infographic Image with 3D Depth */}
            <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
              <div className="perspective-1200 w-full max-w-lg">
                <div className="transform-style-3d shadow-2xl rounded-2xl overflow-hidden border border-gray-100 transition-all duration-500 hover:rotate-y-6 hover:rotate-x-3 bg-surface p-4">
                  <img loading="lazy" decoding="async" src="/assets/floorplans/steps-to-building-image.png" 
                    alt="Steps to Building Your Custom Home" 
                    className="w-full h-auto object-contain rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Right column: Infographic details with scroll scroller */}
            <div className="lg:col-span-6 space-y-8 order-1 lg:order-2">
              <div>
                <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent mb-4 block">Our Process</span>
                <h2 className="font-serif text-4xl md:text-6xl text-primary leading-tight">
                  The Steps to <br />Building Your Home
                </h2>
              </div>
              
              <p className="font-sans text-primary-light text-base leading-relaxed">
                Crafting a premium custom home is a highly structured journey. We have optimized 
                every milestone of the custom building lifecycle into a seamless process. Scroll 
                through our core phases below to see how we deliver unmatched quality at every stage.
              </p>

              {/* Custom scroller with scroll mask */}
              <div className="relative h-72 border border-gray-100 rounded-2xl bg-surface p-6 overflow-y-auto custom-scroller scroll-mask">
                <div className="space-y-8 pr-4">
                  <div className="relative pl-8 border-l-2 border-accent">
                    <div className="absolute left-[-6px] top-1 w-2.5 h-2.5 bg-accent rounded-full" />
                    <h4 className="font-serif text-lg text-primary font-bold mb-2">Phase 1: Initial Discovery & Consultation</h4>
                    <p className="font-sans text-xs text-primary-light leading-relaxed">
                      We meet to discuss your lifestyle, vision, timeline, and budget. This step establishes the foundation for your custom design goals and target layout.
                    </p>
                  </div>
                  
                  <div className="relative pl-8 border-l-2 border-accent/40 hover:border-accent transition-colors duration-300">
                    <div className="absolute left-[-6px] top-1 w-2.5 h-2.5 bg-accent/40 rounded-full" />
                    <h4 className="font-serif text-lg text-primary font-bold mb-2">Phase 2: Lot & Site Evaluation</h4>
                    <p className="font-sans text-xs text-primary-light leading-relaxed">
                      Our team analyzes your home site's topography, orientation, utilities, and soil conditions to optimize the placement of your preferred floorplan.
                    </p>
                  </div>

                  <div className="relative pl-8 border-l-2 border-accent/40 hover:border-accent transition-colors duration-300">
                    <div className="absolute left-[-6px] top-1 w-2.5 h-2.5 bg-accent/40 rounded-full" />
                    <h4 className="font-serif text-lg text-primary font-bold mb-2">Phase 3: Architectural Design & Floorplan Selection</h4>
                    <p className="font-sans text-xs text-primary-light leading-relaxed">
                      We customize your selected plan (such as The Cypress or The Magnolia) or draw a fully custom layout, optimizing room flows and sightlines.
                    </p>
                  </div>

                  <div className="relative pl-8 border-l-2 border-accent/40 hover:border-accent transition-colors duration-300">
                    <div className="absolute left-[-6px] top-1 w-2.5 h-2.5 bg-accent/40 rounded-full" />
                    <h4 className="font-serif text-lg text-primary font-bold mb-2">Phase 4: Detailed Specifications & Estimating</h4>
                    <p className="font-sans text-xs text-primary-light leading-relaxed">
                      We map out every finish selection, paint color, appliance tier, and electrical outline to prepare a highly precise build cost estimate.
                    </p>
                  </div>

                  <div className="relative pl-8 border-l-2 border-accent/40 hover:border-accent transition-colors duration-300">
                    <div className="absolute left-[-6px] top-1 w-2.5 h-2.5 bg-accent/40 rounded-full" />
                    <h4 className="font-serif text-lg text-primary font-bold mb-2">Phase 5: Permits & Groundbreaking</h4>
                    <p className="font-sans text-xs text-primary-light leading-relaxed">
                      Once contracts are signed and permits are secured, our excavation crew breaks ground, readying the site for the structural foundation.
                    </p>
                  </div>

                  <div className="relative pl-8 border-l-2 border-accent/40 hover:border-accent transition-colors duration-300">
                    <div className="absolute left-[-6px] top-1 w-2.5 h-2.5 bg-accent/40 rounded-full" />
                    <h4 className="font-serif text-lg text-primary font-bold mb-2">Phase 6: Framing & Structural Shell</h4>
                    <p className="font-sans text-xs text-primary-light leading-relaxed">
                      Watch your walls and roof rise. We frame the home using premium lumber, install structural sheathing, and dry-in the roof deck.
                    </p>
                  </div>

                  <div className="relative pl-8 border-l-2 border-accent/40 hover:border-accent transition-colors duration-300">
                    <div className="absolute left-[-6px] top-1 w-2.5 h-2.5 bg-accent/40 rounded-full" />
                    <h4 className="font-serif text-lg text-primary font-bold mb-2">Phase 7: Rough-Ins & Core Infrastructure</h4>
                    <p className="font-sans text-xs text-primary-light leading-relaxed">
                      We pull all the electrical wiring, run HVAC ductwork, layout PEX plumbing lines, and complete pre-drywall structural/municipal inspections.
                    </p>
                  </div>

                  <div className="relative pl-8 border-l-2 border-accent/40 hover:border-accent transition-colors duration-300">
                    <div className="absolute left-[-6px] top-1 w-2.5 h-2.5 bg-accent/40 rounded-full" />
                    <h4 className="font-serif text-lg text-primary font-bold mb-2">Phase 8: Insulation & Drywall</h4>
                    <p className="font-sans text-xs text-primary-light leading-relaxed">
                      We install high-efficiency thermal insulation and hang and tape drywall, instantly transforming the framed structure into distinct rooms.
                    </p>
                  </div>

                  <div className="relative pl-8 border-l-2 border-accent/40 hover:border-accent transition-colors duration-300">
                    <div className="absolute left-[-6px] top-1 w-2.5 h-2.5 bg-accent/40 rounded-full" />
                    <h4 className="font-serif text-lg text-primary font-bold mb-2">Phase 9: Interior Trim & Fine Finish Selections</h4>
                    <p className="font-sans text-xs text-primary-light leading-relaxed">
                      Craftsmen install your doors, baseboards, custom cabinetry, tiling, countertops, and lay down wood floors. Detail work shines here.
                    </p>
                  </div>

                  <div className="relative pl-8 border-l-2 border-accent/40 hover:border-accent transition-colors duration-300">
                    <div className="absolute left-[-6px] top-1 w-2.5 h-2.5 bg-accent/40 rounded-full" />
                    <h4 className="font-serif text-lg text-primary font-bold mb-2">Phase 10: The Keys & Final Handover</h4>
                    <p className="font-sans text-xs text-primary-light leading-relaxed">
                      After a thorough detailing clean and professional walkthrough with you, we finalize the warranty binder and hand you your new custom keys!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
