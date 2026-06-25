import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, DollarSign, ClipboardList, MapPin, FileText, Palette, Heart, Key, ArrowRight, Download, X } from 'lucide-react';

const processSteps = [
  {
    letter: 'H',
    date: 'Step 1',
    title: 'Have you met with us?',
    description: "This meeting lays the foundation for your new build. It's our opportunity to truly get to know you and your family, your wants and needs, the best way to communicate, and to establish clear expectations while building a strong connection.",
    image: '/assets/process/process_meeting.png',
    icon: <Users className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />,
    link: { url: '/about-us', text: 'Learn About Us' }
  },
  {
    letter: 'O',
    date: 'Step 2',
    title: 'Outstanding Realtor',
    description: "Realtors play a key role in the home-building process. They can guide you on market conditions, property values, and finding the perfect location for your new home. Our sales team will ensure your decisions align with your long-term goals.",
    image: '/assets/process/process_realtor.png',
    icon: <Award className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />,
    link: { url: '/about-us', text: 'Meet Our Team' }
  },
  {
    letter: 'M',
    date: 'Step 3',
    title: 'Money - Assess your Buying Power',
    description: "Working with your lender to get pre-approved for a mortgage. Whether financing, using a traditional loan or getting on board with a construction loan, finding what fits your family's financial needs keeps us on track throughout the process.",
    image: '/assets/process/process_finance.png',
    icon: <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />,
  },
  {
    letter: 'E',
    date: 'Step 4',
    title: 'Evaluating your wants and needs',
    description: "Create a detailed list of must-haves and nice-to-haves for your home. This step helps clarify your priorities, from layout preferences to specific features like a large kitchen or extra storage.",
    image: '/assets/process/process_checklist.png',
    icon: <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />,
    link: { url: '/warranties', text: 'View Our Warranties' }
  },
  {
    letter: 'F',
    date: 'Step 5',
    title: 'Floor plan and Land',
    description: "At this stage, you'll make key decisions about your home's design and location. A deposit is required as we begin customizing your floor plan with Homefront and decide on the land for your build.",
    image: '/assets/process/process_lot.png',
    icon: <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />,
    link: { url: '/floorplans', text: 'Browse Floor Plans' },
    secondaryButton: { text: 'Download Free Floor Plan Book', action: 'download' }
  },
  {
    letter: 'R',
    date: 'Step 6',
    title: 'Rounding it out',
    description: "Once all preliminary decisions are made, we'll create a contract to officially start the building process. Construction typically takes at least eight months from groundbreaking, but timelines may vary.",
    image: '/assets/process/process_contract.png',
    icon: <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />,
  },
  {
    letter: 'O',
    date: 'Step 7',
    title: 'Options for Selections',
    description: "See your floor plan come to life with our 3D program. Walk through your home virtually with our in-house designer. Save inspiration images to guide your selections for finishes, colors, and fixtures.",
    image: '/assets/process/process_selections.png',
    icon: <Palette className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />,
    secondaryButton: { text: 'View Home Models in Booklet', action: 'download' }
  },
  {
    letter: 'N',
    date: 'Step 8',
    title: 'No Freaking Out',
    description: "Building a home can be stressful and unpredictable, but staying calm and flexible is essential. There are many moving parts. As the home nears completion, ensure your lender is tracking the progress and order necessary inspections.",
    image: '/assets/process/process_construction.png',
    icon: <Heart className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />,
  },
  {
    letter: 'T',
    date: 'Step 9',
    title: 'TADA! Time to close',
    description: "Your dream home is ready! Before closing, we'll conduct a final walkthrough to confirm everything is in order. Once the paperwork is signed, you can officially move into your new home.",
    image: '/assets/process/process_keys.png',
    icon: <Key className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />,
  },
];

export default function ProcessPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState({ status: 'idle', message: '' });
  
  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState({ status: 'loading', message: '' });

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: (import.meta as any).env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE",
          subject: `Floor Plan Booklet Download - ${data.name}`,
          from_name: "Homefront Builders Website",
          ...data,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setFormState({ status: 'success', message: 'Success! Your download is starting.' });
        // Trigger download
        const link = document.createElement('a');
        link.href = '/assets/floor-plan-book.pdf';
        link.download = 'Homefront_Builders_Floor_Plan_Book.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          setIsModalOpen(false);
          setFormState({ status: 'idle', message: '' });
        }, 3000);
      } else {
        setFormState({ status: 'error', message: 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setFormState({ status: 'error', message: 'An error occurred. Please try again later.' });
    }
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end 80%"]
  });

  const progressBarHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="pt-32 md:pt-40 bg-white pb-24 md:pb-32 overflow-hidden relative">
      
      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]">
        <div 
          className="absolute inset-0"
          style={{ backgroundImage: 'url(/assets/blueprint_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        ></div>
      </div>

      {/* Hero Section */}
      <section className="text-center px-4 md:px-12 max-w-4xl mx-auto mb-20 md:mb-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-serif text-5xl md:text-7xl text-primary mb-6">
            The Building <span className="text-accent underline decoration-4 underline-offset-8">Process</span>
          </h1>
          <h4 className="font-sans text-lg md:text-xl text-primary-light font-medium tracking-wide mb-6">
            The story of how we build your dream home
          </h4>
          <p className="font-sans text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            We use this timeline to walk you through our proven building method. From the first meeting to handing over the keys, here is what you can expect when you build with Homefront.
          </p>
        </motion.div>
      </section>

      {/* Timeline Section */}
      <section className="px-4 md:px-12 relative z-10" ref={containerRef}>
        <div className="max-w-6xl mx-auto relative">
          
          {/* Vertical Progress Line Background */}
          <div className="absolute left-[34px] md:left-[20%] lg:left-[25%] top-0 bottom-0 w-[2px] bg-gray-100 transform -translate-x-1/2">
            {/* Active Progress Line */}
            <motion.div 
              className="absolute top-0 left-0 right-0 bg-accent w-full"
              style={{ height: progressBarHeight, transformOrigin: 'top' }}
            />
          </div>

          <div className="flex flex-col gap-0 md:gap-0 relative z-10">
            {processSteps.map((step, index) => {
              
              return (
                <div key={index} className="flex flex-col md:flex-row w-full mb-16 md:mb-32 relative group">
                  
                  {/* Left: Date */}
                  <div className="hidden md:block md:w-[20%] lg:w-[25%] text-right pr-12 lg:pr-16 py-4">
                    <motion.span 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5 }}
                      className="font-sans text-xl md:text-2xl font-bold text-primary/30 tracking-tight block transition-colors group-hover:text-accent/60"
                    >
                      {step.date}
                    </motion.span>
                  </div>

                  {/* Center: Node */}
                  <div className="absolute left-[34px] md:left-[20%] lg:left-[25%] transform -translate-x-1/2 w-16 h-16 bg-white border-4 border-gray-50 rounded-full flex items-center justify-center shadow-[0_4px_10px_rgb(0,0,0,0.05)] z-20 group-hover:border-accent/10 transition-colors duration-300">
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-inner group-hover:bg-accent transition-colors duration-500"
                    >
                      {step.icon}
                    </motion.div>
                  </div>

                  {/* Right: Content */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="w-full md:w-[80%] lg:w-[75%] pl-[80px] md:pl-12 lg:pl-16 pt-3 md:pt-0"
                  >
                    <div className="md:hidden mb-4">
                       <span className="font-sans text-lg font-bold text-primary/40 tracking-tight">{step.date}</span>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="font-serif text-3xl md:text-4xl text-primary mb-4 flex items-center gap-4">
                        <span className="text-4xl md:text-5xl text-accent font-bold drop-shadow-sm">{step.letter}</span>
                        <span className="leading-tight">{step.title}</span>
                      </h3>
                      <p className="font-sans text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl">
                        {step.description}
                      </p>

                      {(step.link || (step as any).secondaryButton) && (
                        <div className="mt-6 flex flex-wrap gap-4">
                          {step.link && (
                            <Link 
                              to={step.link.url}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 shadow-sm rounded-full text-primary font-medium hover:bg-gray-50 hover:border-accent hover:shadow-md transition-all group/btn"
                            >
                              {step.link.text}
                              <ArrowRight className="w-4 h-4 text-accent group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          )}
                          {(step as any).secondaryButton && (
                             <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white shadow-sm rounded-full font-medium hover:bg-accent transition-all group/btn2">
                               {(step as any).secondaryButton.text}
                               <Download className="w-4 h-4 text-white group-hover/btn2:translate-y-0.5 transition-transform" />
                             </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 aspect-[16/9] md:aspect-[3/2] max-w-3xl">
                      <img loading="lazy" decoding="async" src={step.image} 
                        alt={step.title} 
                        className="w-full h-full object-cover transition-transform duration-[1s] ease-out hover:scale-[1.03]"
                      />
                    </div>
                  </motion.div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Floor Plan Booklet Funnel Section */}
      <section className="relative py-28 bg-[#1b2518] text-white overflow-hidden z-30">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
             style={{ backgroundImage: 'url(/assets/blueprint_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#c9a96e] mb-4">Plan Your Dream Home</p>
            <h2 className="font-serif text-5xl md:text-6xl text-white leading-tight mb-6">
              Download Our Free <br />Floor Plan Booklet
            </h2>
            <p className="font-sans text-white/70 leading-relaxed text-lg max-w-2xl mx-auto mb-10">
              Explore our collection of fully customizable luxury floor plans and home models. Get inspired and discover the perfect layout for your family's lifestyle.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#c9a96e] text-white rounded-full font-sans font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-[#1b2518] transition-all duration-300 shadow-xl group"
            >
              Get The Free Booklet
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Modal Popup */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl z-10"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors text-primary"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 md:p-10">
                <div className="w-12 h-12 bg-[#c9a96e]/10 rounded-full flex items-center justify-center mb-6">
                  <Download className="w-6 h-6 text-[#c9a96e]" />
                </div>
                <h3 className="font-serif text-3xl text-primary mb-2">Get Your Booklet</h3>
                <p className="font-sans text-primary-light/80 text-sm mb-8">
                  Enter your details below to instantly download the Homefront Builders Floor Plan Book PDF.
                </p>
                
                <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                  <input type="text" name="name" required placeholder="Your Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-primary placeholder:text-primary-light/40 focus:outline-none focus:border-[#c9a96e] transition-colors" />
                  <input type="email" name="email" required placeholder="Your Email Address" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-primary placeholder:text-primary-light/40 focus:outline-none focus:border-[#c9a96e] transition-colors" />
                  <input type="tel" name="phone" placeholder="Phone Number (Optional)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-primary placeholder:text-primary-light/40 focus:outline-none focus:border-[#c9a96e] transition-colors" />
                  
                  <button disabled={formState.status === 'loading' || formState.status === 'success'} type="submit" className="w-full bg-[#1b2518] text-white font-sans font-bold py-4 rounded-xl hover:bg-[#c9a96e] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                    {formState.status === 'loading' ? 'Processing...' : formState.status === 'success' ? 'Downloading...' : 'Download PDF Now'}
                  </button>
                  {formState.message && (
                    <p className={`text-sm text-center mt-2 font-medium ${formState.status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                      {formState.message}
                    </p>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fades for timeline ends */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent pointer-events-none z-20"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#1b2518] to-transparent pointer-events-none z-20"></div>

    </div>
  );
}
