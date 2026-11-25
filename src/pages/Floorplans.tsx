import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send } from 'lucide-react';
import SEO from '../components/SEO';
import ButtonGlow from '../components/ui/ButtonGlow';
import { useDialog } from '../hooks/useDialog';
import { floorPlans } from '../data/floorPlans';
import FloorPlanExplorer from '../components/FloorPlanExplorer';
import { sendToFrontDesk } from '../lib/frontDesk';

const SITE = 'https://www.homefrontbuilderstn.com';

// Only the plans published on this page are described here — the full booklet
// stays gated behind the request form.
// Typed as schema.org FloorPlan, not Product: these are build-on-your-lot designs,
// not shippable retail goods, so Product made Google demand reviews/ratings/offers.
const floorPlansSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Homefront Builders Custom Home Floor Plans',
    description: 'Custom home floor plans available from Homefront Builders in Clarksville and Middle Tennessee.',
    numberOfItems: floorPlans.length,
    itemListElement: floorPlans.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'FloorPlan',
        name: p.title,
        description: p.description,
        image: `${SITE}${p.exterior}`,
        layoutImage: `${SITE}${p.blueprints[0]}`,
        numberOfBedrooms: p.beds,
        numberOfBathroomsTotal: p.baths,
        floorSize: {
          '@type': 'QuantitativeValue',
          value: Number(p.sqft.replace(/,/g, '')),
          unitCode: 'FTK',
          unitText: 'sq ft',
        },
      },
    })),
  },
];

export default function Floorplans() {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadFormState, setLeadFormState] = useState({ status: 'idle', message: '' });

  // /floorplans?plan=cypress opens that plan in the explorer straight away (the
  // home page shelf links here this way).
  const [searchParams] = useSearchParams();
  const requestedPlan = searchParams.get('plan');

  const closeLeadModal = () => {
    setIsLeadModalOpen(false);
    setLeadFormState({ status: 'idle', message: '' });
  };

  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLeadFormState({ status: 'loading', message: '' });
    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "6734d3d0-0e39-4112-b5b6-3247d6699948");
    formData.append("subject", `Floor Plan Booklet Request - ${formData.get("name")}`);
    formData.append("from_name", "Homefront Builders Website");
    formData.append("Request Type", "Floor Plan Booklet Request");
    formData.append("Requested Via", "Floorplans page");
    const email = formData.get("email");
    if (email) formData.append("replyto", email as string);
    try {
      sendToFrontDesk(formData, 'Floor plan request');
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
      const result = await response.json();
      if (result.success) {
        // No PDF download — Homefront sends the booklet manually after the request.
        setLeadFormState({ status: 'success', message: '' });
      } else {
        setLeadFormState({ status: 'error', message: 'Something went wrong. Please try again.' });
      }
    } catch {
      setLeadFormState({ status: 'error', message: 'An error occurred. Please try again.' });
    }
  };

  // Escape, focus in/out, Tab kept inside, page behind held still.
  const leadDialogRef = useRef<HTMLDivElement>(null);
  useDialog(isLeadModalOpen, closeLeadModal, leadDialogRef);

  return (
    <div className="bg-surface min-h-screen pt-32 pb-24">
      <SEO
        title="Custom Home Floor Plans"
        description="Explore Homefront Builders' custom floor plans — the Cypress, Dogwood, Harmony, Magnolia, and Myrtle. Stunning exteriors, highly functional layouts."
        path="/floorplans"
        schema={floorPlansSchema}
      />
      {/* Booklet Hero Section */}
      <div className="max-w-site mx-auto px-6 md:px-12 mb-16 mt-4">
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
              thoughtfully designed with flow, natural lighting, and timeless luxury in mind. Open the booklet
              below to request the complete catalog, then step into the Plan Explorer to turn each home in 3D,
              study its layout, and walk through photos of the finished build.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="inline-flex items-center justify-center px-8 py-4 bg-accent text-white font-sans text-xs uppercase tracking-[0.2em] font-semibold rounded-lg hover:bg-primary transition-all duration-300 shadow-md hover:shadow-lg group btn-glow"
            >
              <ButtonGlow />
              Request the Booklet
              <span className="w-4 h-[1px] bg-white ml-2 group-hover:w-8 transition-all duration-300"></span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('plan-explorer');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center px-8 py-4 border border-primary/20 text-primary font-sans text-xs uppercase tracking-[0.2em] font-semibold rounded-lg hover:bg-white transition-all duration-300 btn-glow"
            >
              <ButtonGlow />
              Explore the Plans in 3D
            </button>
          </motion.div>
        </div>
      </div>

      {/* 3D Bookshelf Slider Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="w-full max-w-site-1450 mx-auto px-4 md:px-12 relative mb-28 overflow-hidden"
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
            onClick={() => setIsLeadModalOpen(true)}
          >
            <div 
              className="w-full h-full relative bookshelf-book transition-transform duration-[0.8s] ease-[cubic-bezier(0.25,1,0.5,1)]"
            >
              {/* Spine */}
              <div className="absolute bg-accent rounded-l-[3px] shadow-[inset_-4px_0_10px_rgba(0,0,0,0.5)] z-20" style={{ width: '20px', left: '-10px', height: '100%', transform: 'rotateY(-90deg)', transformOrigin: 'left center' }} />
              {/* Back Cover Shadow */}
              <div className="absolute inset-0 bg-accent-dark -translate-z-[12px] shadow-[5px_10px_25px_rgba(0,0,0,0.3)] rounded-r-[4px]" />
              
              {/* Inside Page (Request Booklet prompt) */}
              <div className="bookshelf-book-pages bg-primary shadow-[2px_2px_8px_rgba(0,0,0,0.15)] book-page-stack">
                <div className="w-full h-full overflow-hidden p-6 flex flex-col items-center justify-center text-center gap-4 bg-primary text-white rounded-r-[4px]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span className="font-sans text-[10px] font-semibold tracking-[0.1em] uppercase text-accent leading-relaxed">Request the Complete Booklet</span>
                </div>
              </div>
              
              {/* Cover Page (Booklet Cover Image) */}
              <div className="bookshelf-book-cover shadow-[4px_4px_15px_rgba(0,0,0,0.25)] rounded-r-[4px]">
                <div className="absolute inset-0 z-10 backface-hidden rounded-r-[4px] overflow-hidden">
                  <img loading="lazy" decoding="async" src="/assets/floorplans/floorplan-booklet-cover.png" alt="Homefront Builders custom home floor plan booklet cover"className="w-full h-full object-cover object-top" />
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
              <span className="font-sans text-xs text-primary font-medium">Request Your Copy</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plan Explorer: 3D models, layouts, photos and facts for every plan */}
      <FloorPlanExplorer initialPlan={requestedPlan} onRequestBooklet={() => setIsLeadModalOpen(true)} />

      {/* Steps to Building Section */}
      <section className="py-24 bg-white border-t border-gray-100 overflow-hidden">
        <div className="max-w-site mx-auto px-6 md:px-12">
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

      {/* Lead Capture Modal */}
      <AnimatePresence>
        {isLeadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLeadModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              ref={leadDialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Request the floor plan booklet"
              className="relative w-full max-w-lg bg-white rounded-3xl overflow-y-auto max-h-[90vh] shadow-2xl z-10"
            >
              <button
                type="button"
                aria-label="Close"
                onClick={closeLeadModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors text-primary"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-8 md:p-10">
                {leadFormState.status === 'success' ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-[#c9a96e]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                      <Send className="w-6 h-6 text-[#c9a96e]" />
                    </div>
                    <h3 className="font-serif text-3xl text-primary mb-3">Request Received</h3>
                    <p className="font-sans text-primary-light/80 text-sm max-w-sm mx-auto">
                      Thank you for requesting the Homefront Builders floor plan booklet. Our team will send it to you soon.
                    </p>
                    <button
                      onClick={closeLeadModal}
                      className="mt-8 inline-flex items-center justify-center px-8 py-3 bg-[#1b2518] text-white font-sans text-xs uppercase tracking-[0.2em] font-semibold rounded-xl hover:bg-[#c9a96e] transition-colors btn-glow"
                    >
                      <ButtonGlow />
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-[#c9a96e]/10 rounded-full flex items-center justify-center mb-6">
                      <Send className="w-6 h-6 text-[#c9a96e]" />
                    </div>
                    <h3 className="font-serif text-3xl text-primary mb-2">Request the Floor Plan Booklet</h3>
                    <p className="font-sans text-primary-light/80 text-sm mb-8">
                      Enter your details below and the Homefront Builders team will send you the floor plan booklet.
                    </p>
                    <form onSubmit={handleLeadSubmit} className="flex flex-col gap-4">
                      <input type="text" name="name" required autoComplete="name" aria-label="Your name" placeholder="Your Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-primary placeholder:text-primary-light/40 focus:outline-none focus:border-[#c9a96e] transition-colors" />
                      <input type="email" name="email" required autoComplete="email" aria-label="Your email address" placeholder="Your Email Address" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-primary placeholder:text-primary-light/40 focus:outline-none focus:border-[#c9a96e] transition-colors" />
                      <input type="tel" name="phone" autoComplete="tel" inputMode="tel" aria-label="Phone number (optional)" placeholder="Phone Number (Optional)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-primary placeholder:text-primary-light/40 focus:outline-none focus:border-[#c9a96e] transition-colors" />
                      <button
                        disabled={leadFormState.status === 'loading'}
                        type="submit"
                        className="w-full bg-[#1b2518] text-white font-sans font-bold py-4 rounded-xl hover:bg-[#c9a96e] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2 btn-glow"
                      >
                        <ButtonGlow />
                        {leadFormState.status === 'loading' ? 'Sending...' : 'Request Booklet'}
                      </button>
                      {leadFormState.status === 'error' && (
                        <p role="alert" className="text-sm text-center mt-2 font-medium text-red-600">
                          {leadFormState.message}
                        </p>
                      )}
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
