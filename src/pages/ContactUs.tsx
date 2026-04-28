import { motion } from 'motion/react';
import ContactSection from '../components/ContactSection';

export default function ContactUs() {
  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[400px] md:h-[450px] overflow-hidden">
        <img
          src="/assets/content2.jpg"
          alt="Homefront Builders"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#1b2518]/60" />
        <div className="relative z-10 h-full flex items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#c9a96e] mb-4">Get In Touch</p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white tracking-wide">
              Let's Build Your Dream Home
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <ContactSection />
    </div>
  );
}
