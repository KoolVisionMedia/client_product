import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Users, Award, DollarSign, ClipboardList, MapPin, FileText, Palette, Heart, Key } from 'lucide-react';

const processSteps = [
  {
    letter: 'H',
    title: 'Have you met with us?',
    description: "This meeting lays the foundation for your new build. It's our opportunity to truly get to know you and your family, your wants and needs, the best way to communicate, and to establish clear expectations while building a strong connection.",
    icon: <Users className="w-6 h-6 md:w-8 md:h-8 text-accent" strokeWidth={1.5} />,
  },
  {
    letter: 'O',
    title: 'Outstanding Realtor',
    description: "Realtors play a key role in the home-building process. They can guide you on market conditions, property values, and finding the perfect location for your new home. Our sales team will ensure your decisions align with your long-term goals.",
    icon: <Award className="w-6 h-6 md:w-8 md:h-8 text-accent" strokeWidth={1.5} />,
  },
  {
    letter: 'M',
    title: 'Money - Assess your Buying Power',
    description: "Working with your lender to get pre-approved for a mortgage. Whether financing, using a traditional loan or getting on board with a construction loan, finding what fits your family's financial needs keeps us on track throughout the process.",
    icon: <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-accent" strokeWidth={1.5} />,
  },
  {
    letter: 'E',
    title: 'Evaluating your wants and needs',
    description: "Create a detailed list of must-haves and nice-to-haves for your home. This step helps clarify your priorities, from layout preferences to specific features like a large kitchen or extra storage.",
    icon: <ClipboardList className="w-6 h-6 md:w-8 md:h-8 text-accent" strokeWidth={1.5} />,
  },
  {
    letter: 'F',
    title: 'Floor plan and Land',
    description: "At this stage, you'll make key decisions about your home's design and location. A deposit is required as we begin customizing your floor plan with Homefront and decide on the land for your build.",
    icon: <MapPin className="w-6 h-6 md:w-8 md:h-8 text-accent" strokeWidth={1.5} />,
  },
  {
    letter: 'R',
    title: 'Rounding it out',
    description: "Once all preliminary decisions are made, we'll create a contract to officially start the building process. Construction typically takes at least eight months from groundbreaking, but timelines may vary.",
    icon: <FileText className="w-6 h-6 md:w-8 md:h-8 text-accent" strokeWidth={1.5} />,
  },
  {
    letter: 'O',
    title: 'Options for Selections',
    description: "See your floor plan come to life with our 3D program. Walk through your home virtually with our in-house designer. Save inspiration images to guide your selections for finishes, colors, and fixtures.",
    icon: <Palette className="w-6 h-6 md:w-8 md:h-8 text-accent" strokeWidth={1.5} />,
  },
  {
    letter: 'N',
    title: 'No Freaking Out',
    description: "Building a home can be stressful and unpredictable, but staying calm and flexible is essential. There are many moving parts. As the home nears completion, ensure your lender is tracking the progress and order necessary inspections.",
    icon: <Heart className="w-6 h-6 md:w-8 md:h-8 text-accent" strokeWidth={1.5} />,
  },
  {
    letter: 'T',
    title: 'TADA! Time to close',
    description: "Your dream home is ready! Before closing, we'll conduct a final walkthrough to confirm everything is in order. Once the paperwork is signed, you can officially move into your new home.",
    icon: <Key className="w-6 h-6 md:w-8 md:h-8 text-accent" strokeWidth={1.5} />,
  },
];

export default function Process() {
  const headingText = "Steps to Building".split("");
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="process" className="py-24 lg:py-32 px-6 md:px-12 relative z-10 overflow-hidden border-t border-gray-100">
      
      {/* Blueprint background accent */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'url(/assets/blueprint_bg.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        ></div>
        {/* Subtle dark tint. A plain translucent fill, NOT mix-blend-multiply —
            the blend mode forced the whole section (including the blurred
            shapes below) to re-composite against its backdrop on every scroll
            frame, which tanked scroll performance through this section. */}
        <div className="absolute inset-0 bg-[rgba(46,54,44,0.06)]"></div>
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Header with Staggered Letter Reveal */}
        <div className="text-center mb-16 md:mb-24 flex flex-col items-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-[10px] md:text-xs font-sans tracking-[0.35em] uppercase text-accent mb-4 block"
          >
            Our Methodology
          </motion.h2>
          
          <div className="flex flex-wrap justify-center overflow-hidden font-serif text-5xl md:text-6xl lg:text-7xl text-primary leading-tight">
            {headingText.map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.03, ease: [0.33, 1, 0.68, 1] }}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Horizontal Row of Letters Spelling HOMEFRONT */}
        <div className="w-full flex justify-start lg:justify-center overflow-x-auto snap-x snap-mandatory pb-8 custom-scrollbar hide-scrollbar-on-desktop">
          <div className="flex flex-row items-center h-[130px] md:h-[160px] lg:h-[200px] gap-2 md:gap-3 lg:gap-4 px-4 md:px-8 mx-auto">
            {processSteps.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <Link to="/process" key={index} className="shrink-0 snap-center outline-none">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    onClick={() => setActiveStep(index)}
                    onMouseEnter={() => setActiveStep(index)}
                    className={`cursor-pointer rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group
                      w-[80px] md:w-[100px] lg:w-[120px] h-[110px] md:h-[135px] lg:h-[160px]
                      ${isActive 
                        ? 'bg-primary text-white border-primary shadow-xl scale-[1.12] z-10' 
                        : 'bg-surface/90 text-accent border-gray-100 hover:bg-white hover:shadow-md hover:scale-[1.05] hover:-translate-y-1 z-0'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent to-accent-dark"></div>
                    )}
                    <span className={`font-serif leading-none select-none drop-shadow-sm transition-all duration-300
                      ${isActive ? 'text-[60px] md:text-[80px] lg:text-[100px] text-white' : 'text-[50px] md:text-[60px] lg:text-[80px] text-accent'}
                    `}>
                      {step.letter}
                    </span>
                    <span className={`font-sans text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-semibold mt-1 lg:mt-2 px-2.5 py-1 rounded-full transition-colors
                      ${isActive ? 'bg-white/10 text-white/90' : 'bg-primary/5 text-primary/60 opacity-0 group-hover:opacity-100'}
                    `}>
                      0{index + 1}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Fancy Detail Area Below */}
        <div className="mt-4 md:mt-8 max-w-5xl mx-auto min-h-[300px] md:min-h-[250px] px-4 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                // No blur() filter here: a residual CSS filter on this large,
                // shadowed card kept it from caching, forcing a re-raster on
                // every scroll frame through this section. Opacity + scale give
                // an equivalent "focus in" without the per-frame filter cost.
                hidden: { opacity: 0, scale: 0.96 },
                visible: {
                  opacity: 1, scale: 1,
                  transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1], staggerChildren: 0.08 }
                },
                exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } }
              }}
              className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-gray-100 relative flex flex-col md:flex-row gap-8 items-center md:items-start min-h-[380px] sm:min-h-[340px] md:min-h-[280px] lg:min-h-[250px] w-full"
            >
              {/* Green round logo overlapping the upper right corner like a premium stamp */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.8, rotate: 15 },
                  visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 22, delay: 0.1 } }
                }}
                className="absolute -top-12 -right-12 md:-top-16 md:-right-16 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 md:border-4 border-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-white shrink-0 z-30 pointer-events-none"
              >
                <img
                  src="/logo-round.webp"
                  alt="Homefront Builders Logo"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Background clipping wrapper for shapes. Uses radial-gradient
                  tints instead of blur-3xl/blur-2xl elements: large CSS blur
                  filters are expensive to raster and kept this card from
                  caching during scroll. The soft radial gradients read the
                  same at these 5% opacities with no filter cost. */}
              <div
                className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none z-0"
                style={{
                  backgroundImage:
                    'radial-gradient(240px circle at top right, rgba(180,140,54,0.05), transparent 70%), radial-gradient(200px circle at bottom left, rgba(46,54,44,0.05), transparent 70%)',
                }}
              ></div>

              <motion.div 
                variants={{
                  hidden: { opacity: 0, scale: 0.5, rotate: -15 },
                  visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
                }}
                className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-white rounded-2xl flex items-center justify-center text-primary shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-50 relative z-10"
              >
                {processSteps[activeStep].icon}
              </motion.div>
              
              <div className="flex-1 text-center md:text-left relative z-10">
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                  }}
                  className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4"
                >
                  <span className="text-accent font-serif text-3xl md:text-5xl font-bold leading-none">{processSteps[activeStep].letter}</span>
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent/30"></div>
                  <span className="font-sans text-xs md:text-sm uppercase tracking-[0.2em] font-semibold text-primary/70 bg-primary/5 px-3 py-1 rounded-full">Step 0{activeStep + 1}</span>
                </motion.div>
                
                <motion.h4 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                  }}
                  className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4 leading-tight"
                >
                  {processSteps[activeStep].title}
                </motion.h4>
                
                <motion.p 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                  }}
                  className="font-sans text-sm md:text-base text-gray-600 leading-relaxed max-w-3xl"
                >
                  {processSteps[activeStep].description}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
