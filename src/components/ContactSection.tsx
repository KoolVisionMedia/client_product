import { useState } from 'react';
import { motion } from 'motion/react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="bg-white py-16 md:py-28 px-4 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">

          {/* Left — Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 flex flex-col gap-8 md:gap-10"
          >
            <div>
              <span className="block w-10 h-[1px] bg-[#c9a96e] mb-6" />
              <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">We'd Love to Hear From You</h2>
              <p className="font-sans text-sm text-primary-light leading-relaxed">
                Whether you're ready to start building or simply exploring your options, our team is here to guide you through every step.
              </p>
            </div>

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
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
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

                <button type="submit"
                  className="mt-4 w-full md:w-auto px-10 py-4 bg-[#1b2518] text-white font-sans text-xs uppercase tracking-[0.25em] hover:bg-[#c9a96e] transition-all duration-500 rounded-sm">
                  Send Message
                </button>
              </form>
            )}
          </motion.div>

        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#c9a96e]/20 my-16 md:my-28" />

        {/* "Why Us" Staggered Chat Log Simulation */}
        <div className="max-w-[800px] mx-auto mb-20 md:mb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <span className="block w-10 h-[1px] bg-[#c9a96e] mx-auto mb-6" />
            <span className="font-sans text-[10px] uppercase tracking-[0.35em] text-[#c9a96e] block mb-3 font-semibold">Why Us</span>
            <h3 className="font-serif text-3xl md:text-4xl text-primary">The Homefront Builder Standard</h3>
          </motion.div>

          {/* Elegant mock messaging/chat UI panel */}
          <div className="bg-[#F8F7F4] border border-[#c9a96e]/15 rounded-2xl shadow-sm overflow-hidden backdrop-blur-sm">
            {/* Chat Header */}
            <div className="bg-[#1b2518] px-6 py-4 flex items-center gap-3 border-b border-[#c9a96e]/10">
              <div className="w-10 h-10 rounded-full bg-[#c9a96e]/10 flex items-center justify-center border border-[#c9a96e]/30">
                <span className="font-serif text-xs font-semibold text-[#c9a96e] tracking-wider">HB</span>
              </div>
              <div>
                <h4 className="font-sans text-xs font-semibold text-white tracking-wide">Homefront Builders</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-sans text-[9px] text-white/50 tracking-wider">Client Consultation (Online)</span>
                </div>
              </div>
            </div>

            {/* Chat Thread Area */}
            <div className="p-6 md:p-8 space-y-6">
              {[
                {
                  sender: 'client',
                  name: 'You / Future Homeowner',
                  initials: 'Y',
                  message: "Hi Homefront! We're looking to build a custom home in Clarksville. What makes you different from typical builders?",
                  time: "10:24 AM"
                },
                {
                  sender: 'business',
                  name: 'Homefront Builders',
                  initials: 'HB',
                  message: "Hi there! Unlike production builders who duplicate standard layouts, we build fully custom homes tailored precisely to your family's lifestyle, architectural tastes, and land requirements.",
                  time: "10:25 AM"
                },
                {
                  sender: 'client',
                  name: 'You / Future Homeowner',
                  initials: 'Y',
                  message: "That sounds beautiful. But how do we track updates, selections, and budgets during a long build?",
                  time: "10:26 AM"
                },
                {
                  sender: 'business',
                  name: 'Homefront Builders',
                  initials: 'HB',
                  message: "We integrate a state-of-the-art client portal. From your phone, you get real-time photos, checklist updates, selection builders, and transparent budget approvals so you're always in control.",
                  time: "10:28 AM"
                },
                {
                  sender: 'client',
                  name: 'You / Future Homeowner',
                  initials: 'Y',
                  message: "Incredible! How do we get started?",
                  time: "10:29 AM"
                },
                {
                  sender: 'business',
                  name: 'Homefront Builders',
                  initials: 'HB',
                  message: "Simply fill out our short contact form above! We will schedule an initial design consultation to explore your vision and map out your custom project plan.",
                  time: "10:30 AM"
                }
              ].map((chat, idx) => {
                const isClient = chat.sender === 'client';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 25, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.6,
                      delay: idx * 0.15,
                      type: "spring",
                      stiffness: 90,
                      damping: 14
                    }}
                    className={`flex items-start gap-3 ${isClient ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-sans font-semibold tracking-wider ${
                      isClient 
                        ? 'bg-[#c9a96e]/10 border-[#c9a96e]/25 text-[#c9a96e]' 
                        : 'bg-[#1b2518] border-[#c9a96e]/30 text-[#c9a96e]'
                    }`}>
                      {chat.initials}
                    </div>

                    {/* Bubble Content */}
                    <div className="max-w-[75%] md:max-w-[60%] flex flex-col gap-1">
                      <span className={`font-sans text-[9px] tracking-wider font-semibold text-primary/40 uppercase ${
                        isClient ? 'text-left' : 'text-right'
                      }`}>
                        {chat.name}
                      </span>
                      <div className={`p-4 rounded-2xl text-sm font-sans leading-relaxed shadow-sm ${
                        isClient
                          ? 'bg-white text-primary rounded-tl-none border border-primary/5'
                          : 'bg-[#1b2518] text-white rounded-tr-none border border-[#c9a96e]/20'
                      }`}>
                        {chat.message}
                      </div>
                      <span className={`font-sans text-[8px] text-primary/30 tracking-wider ${
                        isClient ? 'text-left' : 'text-right'
                      }`}>
                        {chat.time}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Infinite Logo Marquee */}
        <div className="w-full mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10"
          >
            <h4 className="font-serif text-lg md:text-xl text-primary tracking-wide italic mb-1">
              "These certifications show how serious we take our company's impact"
            </h4>
            <span className="block w-8 h-[1px] bg-[#c9a96e]/30 mx-auto mt-4" />
          </motion.div>

          {/* Scrolling Ticker Box */}
          <div className="relative overflow-hidden w-full py-8 border-y border-[#c9a96e]/15 bg-[#F8F7F4]/40">
            {/* Soft Gradient Overlay Left/Right */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div className="flex animate-marquee-scroll w-[200%] gap-12 md:gap-20 items-center justify-start whitespace-nowrap">
              {/* Emblems Array repeated twice to achieve seamless visual infinite looping */}
              {[1, 2].map((loopIdx) => (
                <div key={loopIdx} className="flex gap-12 md:gap-20 items-center shrink-0 min-w-full justify-around">
                  {/* Emblem 1: NAHB */}
                  <div className="flex items-center gap-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <svg className="w-8 h-8 text-[#c9a96e]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 9h3v13h14V9h3L12 2zm1 18h-2v-4h2v4zm4-6H7v-2h10v2zm0-4H7V8h10v2z"/>
                    </svg>
                    <span className="font-sans text-xs tracking-[0.25em] font-semibold text-primary uppercase">NAHB Member</span>
                  </div>

                  {/* Emblem 2: QBW */}
                  <div className="flex items-center gap-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <svg className="w-8 h-8 text-[#c9a96e]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <span className="font-sans text-xs tracking-[0.25em] font-semibold text-primary uppercase">QBW 10-Year Warranty</span>
                  </div>

                  {/* Emblem 3: Energy Star */}
                  <div className="flex items-center gap-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <svg className="w-8 h-8 text-[#c9a96e]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="font-sans text-xs tracking-[0.25em] font-semibold text-primary uppercase">Energy Star Partner</span>
                  </div>

                  {/* Emblem 4: EPA Lead-Safe */}
                  <div className="flex items-center gap-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <svg className="w-8 h-8 text-[#c9a96e]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 15l-3-3 1.41-1.41L11 13.17l4.59-4.59L17 10l-6 6z"/>
                    </svg>
                    <span className="font-sans text-xs tracking-[0.25em] font-semibold text-primary uppercase">EPA Certified</span>
                  </div>

                  {/* Emblem 5: Clarksville Chamber */}
                  <div className="flex items-center gap-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <svg className="w-8 h-8 text-[#c9a96e]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
                    </svg>
                    <span className="font-sans text-xs tracking-[0.25em] font-semibold text-primary uppercase">Chamber of Commerce</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Styles for Scrolling Marquee Loop */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marqueeScroll {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-scroll {
            animation: marqueeScroll 28s linear infinite;
          }
        `}} />

      </div>
    </section>
  );
}
