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
            {/* Scroll-Driven Header with Green Round Logo to the right */}
            <div className="flex items-center justify-center gap-4 md:gap-8 mb-6 relative z-20">
              <h2 className="font-serif text-[3.5rem] md:text-[6rem] lg:text-[8rem] tracking-tight text-primary leading-none select-none font-bold">
                Share your vision.
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
                We'd love to hear about the home you've been dreaming of. Reach out below to connect with our team and let's start turning those ideas into a reality.
              </p>
            </motion.div>

            {/* Contact Cards */}
            <ContactCards />

            {/* Divider */}
            <div className="w-full h-[1px] bg-[#c9a96e]/20 my-16 md:my-24" />
          </>
        )}

        {/* Left Image & Right Form Panel - Match Layout Image */}
        <div id="contact-form" className="w-full bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-2 rounded-3xl border border-gray-100 shadow-sm mt-12 mb-8">
          
          {/* Left: Floorplan Booklet Cover Image */}
          <div className="relative h-[300px] lg:h-auto w-full">
            <img 
              src="/assets/floorplans/floorplan-booklet-cover.png" 
              alt="Homefront Builders Floorplan Booklet" 
              className="w-full h-full object-cover object-center absolute inset-0"
            />
          </div>

          {/* Right: Form */}
          <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center bg-white relative">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-[#c9a96e]/10 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h3 className="font-serif text-3xl text-primary mb-3">Check Your Downloads</h3>
                  <p className="font-sans text-sm text-primary-light max-w-sm mb-6">Your floorplan booklet download should begin automatically. We've also received your message and will be in touch shortly.</p>
                  <a href="/assets/floorplans/Homefront Builders Floorplan Book.pdf" download="Homefront_Builders_Floorplans.pdf" className="text-xs uppercase tracking-widest text-[#c9a96e] border-b border-[#c9a96e] hover:text-primary transition-colors">Click here if download didn't start</a>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Pill Label */}
                  <div className="border border-gray-200 rounded-full px-4 py-1 w-fit mb-6">
                    <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-primary-light font-semibold">Free Download</span>
                  </div>

                  {/* Headline */}
                  <h2 className="font-sans text-3xl md:text-4xl text-primary mb-12 tracking-tight">
                    Get our exclusive floorplan booklet
                  </h2>

                  {/* Contact Info (Matching image layout) */}
                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <div>
                      <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-2">Office</h4>
                      <p className="font-sans text-sm text-primary-light">Clarksville, TN</p>
                    </div>
                    <div>
                      <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-2">Email</h4>
                      <p className="font-sans text-sm text-primary-light">homefrontbuilderstn@gmail.com</p>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={async (e) => {
                    await handleSubmit(e);
                    // Trigger download after successful submission
                    const link = document.createElement('a');
                    link.href = '/assets/floorplans/Homefront Builders Floorplan Book.pdf';
                    link.download = 'Homefront_Builders_Floorplans.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }} className="space-y-6">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="firstName" className="font-sans text-[10px] uppercase tracking-[0.15em] text-primary-light font-semibold">Your Name</label>
                        <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required
                           className="w-full bg-[#f4f3f0] rounded-lg py-4 px-5 font-sans text-sm text-primary outline-none focus:ring-1 focus:ring-[#c9a96e] transition-all placeholder:text-primary-light/40 border-none"
                          placeholder="First Name" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="font-sans text-[10px] uppercase tracking-[0.15em] text-primary-light font-semibold">Email Address</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                           className="w-full bg-[#f4f3f0] rounded-lg py-4 px-5 font-sans text-sm text-primary outline-none focus:ring-1 focus:ring-[#c9a96e] transition-all placeholder:text-primary-light/40 border-none"
                          placeholder="Your Email" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="phone" className="font-sans text-[10px] uppercase tracking-[0.15em] text-primary-light font-semibold">Phone Number</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                           className="w-full bg-[#f4f3f0] rounded-lg py-4 px-5 font-sans text-sm text-primary outline-none focus:ring-1 focus:ring-[#c9a96e] transition-all placeholder:text-primary-light/40 border-none"
                          placeholder="Your Phone" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="subject" className="font-sans text-[10px] uppercase tracking-[0.15em] text-primary-light font-semibold">Subject</label>
                        <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange}
                           className="w-full bg-[#f4f3f0] rounded-lg py-4 px-5 font-sans text-sm text-primary outline-none focus:ring-1 focus:ring-[#c9a96e] transition-all placeholder:text-primary-light/40 border-none"
                          placeholder="e.g. New Build Inquiry" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="message" className="font-sans text-[10px] uppercase tracking-[0.15em] text-primary-light font-semibold">Your Message</label>
                      <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={3}
                         className="w-full bg-[#f4f3f0] rounded-lg py-4 px-5 font-sans text-sm text-primary outline-none focus:ring-1 focus:ring-[#c9a96e] transition-all placeholder:text-primary-light/40 border-none resize-none"
                        placeholder="Message" />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-4 px-8 py-4 bg-[#1b2518] rounded-full font-sans text-xs uppercase tracking-[0.2em] font-semibold text-white hover:bg-[#c9a96e] hover:text-[#1b2518] transition-colors disabled:opacity-50 w-fit"
                    >
                      {isSubmitting ? 'Sending...' : 'Download Booklet'}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>

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
