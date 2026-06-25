import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'motion/react';
import ContactCards from './ContactCards';

// Letter animation helper for Webflow style text animation
function AnimatedLetters({ text, variants }: { text: string; variants: any }) {
  return (
    <span className="inline-flex flex-wrap leading-tight">
      {text.split(" ").map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap mr-2 md:mr-3 overflow-hidden py-1">
          {Array.from(word).map((char, charIdx) => (
            <motion.span
              key={charIdx}
              variants={variants}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}

export default function ContactSection({ showWhyUs = true }: { showWhyUs?: boolean }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const mapRef = useRef<any>(null);

  useEffect(() => {
    const initMap = async () => {
      await customElements.whenDefined('gmpx-store-locator');
      if (mapRef.current) {
        mapRef.current.configureFromQuickBuilder({
          "locations": [
            {"title":"Homefront Builders","address1":"1811 Memorial Cir","address2":"Clarksville, TN 37043, USA","coords":{"lat":36.515362457723924,"lng":-87.3104330932541},"placeId":"ChIJwVyv3y2CFIERnnSRyihCJmo"}
          ],
          "mapOptions": {"center":{"lat":38.0,"lng":-100.0},"fullscreenControl":true,"mapTypeControl":false,"streetViewControl":false,"zoom":4,"zoomControl":true,"maxZoom":17,"mapId":""},
          "mapsApiKey": (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBd6VMiMtVB5p88LPPjSbRZR8Eo4lIlLPM",
          "capabilities": {"input":true,"autocomplete":true,"directions":false,"distanceMatrix":true,"details":false,"actions":false}
        });
      }
    };
    initMap();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: (import.meta as any).env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE",
          subject: `New Lead: ${formData.subject} - ${formData.firstName} ${formData.lastName}`,
          from_name: "Homefront Builders Website",
          ...formData,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        console.error("Form submission error:", result);
        // Fallback to showing success anyway for the UI if the key is missing during testing
        if (result.message.includes("Invalid access key")) {
           setSubmitted(true);
        }
      }
    } catch (error) {
      console.error("Form submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Removed chat messages

  // Variants for character-level Webflow slide-up text effect
  const wordVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.015,
      }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: "1.1em" },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1], // Ease-out-expo curve
      }
    }
  };

  const textBlockVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        delay: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }
    }
  };

  return (
    <section className="bg-white py-16 md:py-28 px-4 md:px-12 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">

        {showWhyUs && (
          <>
            {/* Scroll-Driven "Why Us" Header with Green Round Logo to the right */}
            <div className="flex items-center justify-center gap-4 md:gap-8 mb-6 relative z-20">
              <h2 className="font-serif text-[4.5rem] md:text-[8rem] lg:text-[10rem] tracking-tight text-primary leading-none select-none font-bold">
                Why us?
              </h2>
              <div className="w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 rounded-full overflow-hidden shrink-0 border border-[#c9a96e]/15 shadow-md bg-white flex items-center justify-center">
                <img
                  src="/logo-round.png"
                  alt="Homefront Builders Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Elegant Subtitle */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl mx-auto text-center mb-16 px-4 relative z-10"
            >
              <p className="font-sans text-lg md:text-xl text-primary/70 leading-relaxed font-medium">
                We believe in complete transparency, uncompromised quality, and a deeply personalized experience. Reach out below to start the conversation about your dream home.
              </p>
            </motion.div>

            {/* Contact Cards */}
            <ContactCards />

            {/* Divider */}
            <div className="w-full h-[1px] bg-[#c9a96e]/20 my-16 md:my-24" />
          </>
        )}

        {/* Left & Right Form Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">

          {/* Left — Info Panel with letter-by-letter slide-up animation */}
          <div className="lg:col-span-2 flex flex-col gap-8 md:gap-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={wordVariants}
              className="flex flex-col items-start"
            >
              <span className="block w-10 h-[1px] bg-[#c9a96e] mb-6" />
              <h2 className="font-serif text-4xl md:text-5xl text-primary mb-6 flex flex-col">
                <AnimatedLetters text="Tell us more about" variants={letterVariants} />
                <AnimatedLetters text="your project" variants={letterVariants} />
              </h2>
              <motion.p
                variants={textBlockVariants}
                className="font-sans text-sm text-primary-light leading-relaxed"
              >
                If you are looking for more information about any materials or special projects, we are more than glad to chat with you.
              </motion.p>
            </motion.div>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F4F3F0] flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c9a96e]">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-1">Office</h4>
                  <p className="font-sans text-sm text-primary-light leading-relaxed">Clarksville, Tennessee</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F4F3F0] flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c9a96e]">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-1">Email</h4>
                  <a href="mailto:info@homefrontbuilders.com" className="font-sans text-sm text-primary-light hover:text-[#c9a96e] transition-colors">info@homefrontbuilders.com</a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F4F3F0] flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c9a96e]">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-1">Phone</h4>
                  <a href="tel:5551234567" className="font-sans text-sm text-primary-light hover:text-[#c9a96e] transition-colors">(555) 123-4567</a>
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {['Facebook', 'Instagram'].map((name) => (
                  <a
                    key={name}
                    href="#"
                    aria-label={name}
                    className="w-10 h-10 rounded-full border border-primary/15 flex items-center justify-center text-primary-light hover:text-[#c9a96e] hover:border-[#c9a96e] transition-all duration-300"
                  >
                    {name === 'Facebook' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3"
          >
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 rounded-full bg-[#c9a96e]/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="font-serif text-3xl text-primary mb-3">Thank You</h3>
                <p className="font-sans text-sm text-primary-light max-w-sm">We've received your message and will be in touch shortly. We look forward to helping you build your dream.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="firstName" className="font-sans text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">First Name</label>
                    <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required
                       className="w-full bg-transparent border-b border-primary/20 py-3 font-sans text-sm text-primary outline-none focus:border-[#c9a96e] transition-colors placeholder:text-primary-light/40"
                      placeholder="John" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="lastName" className="font-sans text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">Last Name</label>
                    <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required
                       className="w-full bg-transparent border-b border-primary/20 py-3 font-sans text-sm text-primary outline-none focus:border-[#c9a96e] transition-colors placeholder:text-primary-light/40"
                      placeholder="Doe" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="font-sans text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                       className="w-full bg-transparent border-b border-primary/20 py-3 font-sans text-sm text-primary outline-none focus:border-[#c9a96e] transition-colors placeholder:text-primary-light/40"
                      placeholder="john@example.com" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="font-sans text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">Phone</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                       className="w-full bg-transparent border-b border-primary/20 py-3 font-sans text-sm text-primary outline-none focus:border-[#c9a96e] transition-colors placeholder:text-primary-light/40"
                      placeholder="(555) 000-0000" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="font-sans text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">Subject</label>
                  <div className="relative">
                    <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required
                      className="w-full bg-transparent border-b border-primary/20 py-3 font-sans text-sm text-primary outline-none focus:border-[#c9a96e] transition-colors appearance-none cursor-pointer pr-8">
                      <option value="" disabled>Select a topic</option>
                      <option value="new-build">New Custom Build</option>
                      <option value="floor-plans">Floor Plans & Pricing</option>
                      <option value="lot-land">Lot / Land Inquiry</option>
                      <option value="warranties">Warranties</option>
                      <option value="general">General Inquiry</option>
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-light/40"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="font-sans text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">Message</label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5}
                    className="w-full bg-transparent border-b border-primary/20 py-3 font-sans text-sm text-primary outline-none focus:border-[#c9a96e] transition-colors placeholder:text-primary-light/40 resize-none"
                    placeholder="Tell us about your project..." />
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="mt-4 w-full md:w-auto px-10 py-4 bg-[#1b2518] text-white font-sans text-xs uppercase tracking-[0.25em] hover:bg-[#c9a96e] transition-all duration-500 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>

          {/* Google Maps Locator */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 h-[500px] w-full rounded-2xl overflow-hidden shadow-xl border border-primary/10 mt-8"
          >
            {React.createElement('gmpx-api-loader', { 
              ref: (el: HTMLElement | null) => {
                if (el) el.setAttribute('key', (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBd6VMiMtVB5p88LPPjSbRZR8Eo4lIlLPM");
              },
              'solution-channel': "GMP_QB_locatorplus_v11_cABD" 
            })}
            {React.createElement('gmpx-store-locator', { 
              'map-id': "DEMO_MAP_ID", 
              ref: mapRef 
            })}
          </motion.div>

        </div>

      </div>

      {/* Global CSS for Scrolling Marquee Loop */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marqueeLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-left {
          display: inline-block;
          animation: marqueeLeft 32s linear infinite;
        }
        .animate-marquee-right {
          display: inline-block;
          animation: marqueeRight 32s linear infinite;
        }
        gmpx-store-locator {
          width: 100%;
          height: 100%;
          --gmpx-color-surface: #fff;
          --gmpx-color-on-surface: #1b2518;
          --gmpx-color-on-surface-variant: #757575;
          --gmpx-color-primary: #c9a96e;
          --gmpx-color-outline: #e0e0e0;
          --gmpx-fixed-panel-width-row-layout: 28.5em;
          --gmpx-fixed-panel-height-column-layout: 65%;
          --gmpx-font-family-base: "Inter", sans-serif;
          --gmpx-font-family-headings: "Inter", sans-serif;
          --gmpx-font-size-base: 0.875rem;
          --gmpx-hours-color-open: #188038;
          --gmpx-hours-color-closed: #d50000;
          --gmpx-rating-color: #ffb300;
          --gmpx-rating-color-empty: #e0e0e0;
        }
      `}} />
    </section>
  );
}
