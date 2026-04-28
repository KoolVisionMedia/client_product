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
      </div>
    </section>
  );
}
