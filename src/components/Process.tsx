import { motion } from 'motion/react';
import { Home, PenTool, Ruler, ShieldCheck } from 'lucide-react';

const processSteps = [
  {
    title: 'Site Analysis & Design',
    description: 'We collaborate with the region’s premier architects to ensure your vision is buildable, elegant, and perfectly suited for your land.',
    icon: <PenTool className="w-8 h-8 text-accent" strokeWidth={1.5} />,
  },
  {
    title: 'Strategic Budgeting',
    description: 'Transparency is our foundation. We provide detailed line-item budgets before construction, eliminating surprises and ensuring value.',
    icon: <Ruler className="w-8 h-8 text-accent" strokeWidth={1.5} />,
  },
  {
    title: 'Construction Management',
    description: 'Our proprietary management system provides you with weekly photo updates, schedule tracking, and rigorous quality control.',
    icon: <Home className="w-8 h-8 text-accent" strokeWidth={1.5} />,
  },
  {
    title: 'Project Closeout',
    description: 'A meticulous final walkthrough and turnover process ensures everything is perfect before your move-in day.',
    icon: <ShieldCheck className="w-8 h-8 text-accent" strokeWidth={1.5} />,
  },
];

export default function Process() {
  return (
    <section id="process" className="py-32 bg-white px-6 md:px-12 border-t border-gray-100 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-[10px] font-sans tracking-[0.3em] uppercase text-accent mb-4">Our Methodology</h2>
          <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary">The Homefront Process</h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((step, index) => (
             <motion.div
              key={index}
              className="group relative bg-surface-alt p-10 h-full flex flex-col justify-between overflow-hidden"
              initial={{ opacity: 0, y: 150, x: (index % 2 === 0 ? -50 : 50) }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              transition={{ duration: 1.2, delay: 0.15 * index, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 w-0 h-1 bg-accent transition-all duration-700 ease-out group-hover:w-full"></div>
              
              <div>
                <motion.div 
                  className="mb-8 p-4 bg-white inline-block shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  {step.icon}
                </motion.div>
                <h4 className="font-serif text-2xl text-primary mb-4">{step.title}</h4>
                <p className="text-primary-light font-sans leading-loose text-sm">
                  {step.description}
                </p>
              </div>

              <div className="mt-12 flex justify-end overflow-hidden">
                <span className="text-accent text-[10px] font-sans uppercase tracking-[0.2em] font-semibold translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[0.16,1,0.3,1]">
                  Learn More &rarr;
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
