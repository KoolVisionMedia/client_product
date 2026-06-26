import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const cardsData = [
  {
    id: 'phone',
    title: 'Phone',
    value: '+1 931 221 2566',
    icon: Phone,
    actionText: 'Call Now',
    actionHref: 'tel:9312212566',
  },
  {
    id: 'email',
    title: 'Email',
    value: 'homefrontsalesTN@gmail.com',
    icon: Mail,
    actionText: 'Send a Message',
    actionHref: 'mailto:homefrontsalesTN@gmail.com',
  },
  {
    id: 'address',
    title: 'Address',
    value: 'Clarksville, TN',
    icon: MapPin,
    actionText: 'View on Map',
    isMap: true,
  },
  {
    id: 'hours',
    title: 'Opening Hours',
    value: 'Mon - Fri: 8am - 5pm',
    icon: Clock,
    actionText: 'Schedule a Call',
    actionHref: '#contact-form',
  }
];

export default function ContactCards() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleScrollToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.currentTarget.getAttribute('href') === '#contact-form') {
      e.preventDefault();
      const form = document.getElementById('contact-form');
      if (form) {
        form.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px] mx-auto py-12 relative z-20">
      {cardsData.map((card) => {
        const Icon = card.icon;
        const isHovered = hoveredCard === card.id;

        return (
          <motion.div
            key={card.id}
            className="relative bg-surface rounded-3xl p-8 shadow-sm border border-[#c9a96e]/10 flex flex-col justify-between cursor-pointer"
            onHoverStart={() => setHoveredCard(card.id)}
            onHoverEnd={() => setHoveredCard(null)}
            whileHover={{ y: -5, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ minHeight: '280px' }}
          >
            {/* Top section with Icon */}
            <div>
              <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center mb-12 bg-white">
                <Icon size={20} className="text-primary/60" strokeWidth={1.5} />
              </div>
            </div>

            {/* Bottom section with Text and Reveal */}
            <div className="relative z-10 flex flex-col justify-end">
              <h3 className="font-sans text-xl text-primary font-medium mb-2">{card.title}</h3>
              <p className="font-sans text-sm text-primary-light mb-4">{card.value}</p>

              <div className="h-[50px] relative mt-2">
                <AnimatePresence>
                  {isHovered && !card.isMap && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-0 left-0 w-full"
                    >
                      <a 
                        href={card.actionHref}
                        onClick={handleScrollToForm}
                        className="block w-full py-3 bg-[#1b2518] text-white text-center font-sans text-xs uppercase tracking-widest rounded-xl hover:bg-[#c9a96e] hover:text-[#1b2518] transition-colors"
                      >
                        {card.actionText}
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Map Expansion in normal flow */}
              <AnimatePresence>
                {isHovered && card.isMap && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 180, marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full rounded-2xl overflow-hidden border border-gray-100 bg-white"
                  >
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102377.61633535942!2d-87.4206583594326!3d36.53696582522709!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8864d0dd882937af%3A0xc665181b5fbcf79b!2sClarksville%2C%20TN!5e0!3m2!1sen!2sus!4v1709664532585!5m2!1sen!2sus" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen={false} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full object-cover pointer-events-none"
                    ></iframe>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
