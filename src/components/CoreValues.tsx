import { motion } from 'motion/react';
import { PenTool, Ruler, Home, ShieldCheck, Palette, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

const values = [
  {
    title: 'Site Analysis & Design',
    description: "We collaborate with the region's premier architects to ensure your vision is buildable, elegant, and perfectly suited for your land.",
    color: 'bg-primary', 
    textColor: 'text-white',
    icon: PenTool,
    finalRotate: -6,
    finalY: -60,
    finalX: -20
  },
  {
    title: 'Strategic Budgeting',
    description: 'Transparency is our foundation. We provide detailed line-item budgets before construction, eliminating surprises and ensuring value.',
    color: 'bg-white', 
    textColor: 'text-primary',
    icon: Ruler,
    finalRotate: 4,
    finalY: -20,
    finalX: 20
  },
  {
    title: 'Construction Management',
    description: 'Our proprietary management system provides you with weekly photo updates, schedule tracking, and rigorous quality control.',
    color: 'bg-[#4A5D4E]', 
    textColor: 'text-white',
    icon: Home,
    finalRotate: -3,
    finalY: 20,
    finalX: -10
  },
  {
    title: 'Project Closeout',
    description: 'A meticulous final walkthrough and turnover process ensures everything is perfect before your move-in day.',
    color: 'bg-accent', 
    textColor: 'text-white',
    icon: ShieldCheck,
    finalRotate: 5,
    finalY: 60,
    finalX: 15
  }
];

export default function CoreValues() {
  return (
    <section className="relative py-24 lg:py-32 border-y border-[#c9a96e]/30 overflow-hidden">
      {/* Parallax Background Image */}
      <div 
        className="absolute inset-0 bg-fixed bg-center bg-cover bg-no-repeat blur-[4px] transform scale-[1.05]"
        style={{ backgroundImage: 'url(/assets/core-values-bg.jpg)' }}
      ></div>
      {/* Color Shade / Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a3826]/85 to-[#121c10]/95 z-0"></div>

      <div className="flex flex-col lg:flex-row items-start justify-between px-6 md:px-12 max-w-[1400px] mx-auto relative z-10">
        
        {/* Left Content - Pinned */}
        <div className="w-full lg:w-5/12 lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center py-16 lg:py-0 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10C5 10 5 0 10 0C15 0 15 20 20 20C25 20 25 10 30 10C35 10 35 15 40 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"/>
              </svg>
              <span className="font-sans text-sm md:text-base font-semibold text-accent uppercase tracking-widest">Our Methodology</span>
            </div>
            
            <h2 className="font-serif text-5xl md:text-[72px] text-white leading-[1.1] tracking-tight mb-8">
              The Homefront <br/> Process
            </h2>
            
            <p className="font-sans text-lg md:text-xl text-white/80 max-w-lg leading-relaxed mb-10">
              From the initial site visit to the final walkthrough, our proven process ensures that every stage of your custom home build is executed with precision, transparency, and care.
            </p>
            
            <Link to="/contact-us" className="flex items-center gap-4 px-6 py-4 bg-accent/20 rounded-full font-sans text-xs uppercase tracking-[0.2em] font-bold text-accent hover:bg-accent hover:text-white transition-all duration-300 w-fit group">
              START YOUR BUILD
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center group-hover:bg-white group-hover:text-accent transition-all duration-300">
                &rarr;
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Right Content - CSS Sticky Stacking Cards */}
        <div className="w-full lg:w-7/12 flex flex-col gap-[10vh] md:gap-[30vh] lg:pt-[25vh] pb-[10vh] lg:pb-[25vh]">
           {values.map((val, i) => {
             const Icon = val.icon;
             return (
               <div 
                 key={i} 
                 className="sticky w-full flex justify-end"
                 style={{ top: `${15 + i * 4}vh`, zIndex: i }}
               >
                 <motion.div 
                   initial={{ opacity: 0, y: 50 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ duration: 0.6, ease: "easeOut" }}
                   className={`w-full max-w-[500px] p-8 md:p-12 rounded-2xl shadow-2xl ${val.color} ${val.textColor} border border-white/10`}
                 >
                   <div className="flex items-center gap-4 mb-6">
                     <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${val.textColor === 'text-white' ? 'border-white/30 bg-white/10' : 'border-primary/20 bg-primary/5'}`}>
                       <Icon size={24} className={val.textColor === 'text-white' ? 'text-white' : 'text-accent'} />
                     </div>
                     <h3 className="font-serif text-3xl font-medium tracking-wide">{val.title}</h3>
                   </div>
                   <p className="font-sans text-base md:text-lg leading-relaxed opacity-90">
                     {val.description}
                   </p>
                 </motion.div>
               </div>
             );
           })}
        </div>
      </div>
    </section>
  );
}
