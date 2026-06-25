import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, DollarSign, ClipboardList, MapPin, FileText, Palette, Heart, Key, ArrowRight } from 'lucide-react';

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
    link: { url: '/floorplans', text: 'Browse Floor Plans' }
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

                      {step.link && (
                        <div className="mt-6">
                          <Link 
                            to={step.link.url}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 shadow-sm rounded-full text-primary font-medium hover:bg-gray-50 hover:border-accent hover:shadow-md transition-all group/btn"
                          >
                            {step.link.text}
                            <ArrowRight className="w-4 h-4 text-accent group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
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

      {/* Fades for timeline ends */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent pointer-events-none z-20"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none z-20"></div>

    </div>
  );
}
