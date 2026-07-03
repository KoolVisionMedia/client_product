import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ContactSection from '../components/ContactSection';
import { X, Send, Video, Phone, Mail, Award } from 'lucide-react';
import SEO from '../components/SEO';

const partners = [
  {
    name: 'Amber Wotring',
    title: 'Custom Home Builder, Architectural Designer & Realtor',
    image: '/assets/team/Amber Wotring.jpg',
    bio: `Amber Wotring is one of the top female builders in Middle Tennessee, bringing over 25 years of experience in custom home design and construction. Her journey in the building industry began at an early age. Surrounded by craftsmanship, planning, and design, Amber developed a passion for creating homes that are both beautiful and functional.\n\nWhile pursuing her degree in Architectural Design, Amber began designing homes for multiple builders, gaining hands-on experience and establishing herself early as a talented and trusted designer turning visions into architectural reality.\n\nAmber's professional path has taken her across the country with military relocation. Eventually, she and her family settled in Clarksville, Tennessee, where Amber began building and designing custom homes throughout Middle TN.\n\nToday, Amber is known for her innovative designs, attention to detail, and forward-thinking approach to custom homebuilding. She is constantly creating new plans, refining ideas, and pushing boundaries to deliver homes that reflect each client's lifestyle and vision.\n\nAmber believes the process of building a home should be exciting and enjoyable—not overwhelming. By offering everything in-house, her company provides a seamless, stress-free experience from initial concept to final completion.\n\nAmber continues to shape the future of the construction industry one blueprint at a time, focused on building not just houses, but lasting homes and meaningful experiences for families. Her story stands as a testament to what passion, vision, and determination can build.`,
    social: { facebook: 'https://www.facebook.com/HomeFrontBuilderstn/', instagram: 'https://www.instagram.com/homefrontbuilderstn/', linkedin: '#' },
    video: '',
  },
  {
    name: 'Carissa Ockey',
    title: 'Designer',
    image: '/assets/team/Carissa Ockey.jpeg',
    bio: `I grew up around construction, so I've always seen homes a little differently. Over the past 6.5 years, I've built my career around new construction: guiding projects from concept to completion with a strong focus on both design and functionality.\n\nMy background in interior design allows me to look beyond the floorplans and think about how a home will actually feel to live in. As a mom, I appreciate a home that's not just beautiful, but functions day to day. Elevated but practical.\n\nI'm big on relationships and believe the best projects come from collaboration and trust. The end goal is always the same: a home that feels as good as it looks.`,
    social: { facebook: 'https://www.facebook.com/HomeFrontBuilderstn/', instagram: 'https://www.instagram.com/homefrontbuilderstn/', linkedin: '#' },
    video: '',
  },
  {
    name: 'Patricia Shipley',
    title: 'Director of Sales / Realtor',
    image: '/assets/team/Patricia Shipley.webp',
    bio: `Patricia Shipley has been a realtor for 9 years and she has always dedicated her and her team to provide exceptional service. She works with land, new construction and existing homes in Clarksville and all Mid TN. She is the Director of Sales and her role is dedicated to create an exceptional client experience from first contact through project completion. She oversees and develops high-performing sales teams, implements data-driven processes, and cultivates strong relationships with clients, partners, and other Realtors in the Mid TN area. Using local trends and customer needs, she aligns sales strategies with the company's mission to deliver quality craftsmanship and personalize homebuilding solutions. Her role combines leadership, operational insight, and a commitment to excellence to support long-term business growth.`,
    social: { facebook: 'https://www.facebook.com/HomeFrontBuilderstn/', instagram: 'https://www.instagram.com/homefrontbuilderstn/', linkedin: '#' },
    video: 'https://www.youtube.com/embed/YUHia0wL22M',
  },
  {
    name: 'Kenneth Wotring',
    title: 'New Construction Specialist/Realtor',
    image: '/assets/team/Kenneth Wotring.JPG',
    bio: `Kenneth Wotring is a dedicated real estate professional who is committed to helping buyers find the perfect place to call home and assisting sellers in marketing and selling their properties quickly and efficiently. With extensive experience working alongside home builders and specializing in new construction, Kenneth guides clients through every stage of the home-building process—from selecting a floor plan to the exciting day they receive the keys to their brand-new home.\n\nAfter serving 13 years in the United States Military, Kenneth chose to put down roots in Clarksville, Tennessee, with his wife and son. His own experience building a home sparked a passion for real estate and inspired him to help others navigate one of the most important investments of their lives.\n\n"My enthusiasm for helping others find the perfect home for their family's future allows me to connect with clients and provide the highest level of service possible."\n\nHe is especially passionate about helping active-duty military members, veterans, and their families successfully navigate the home-buying process. Having personally experienced the challenges and stress that come with military relocations, he understands the unique needs of service members and is dedicated to making each transition as smooth and stress-free as possible.\n\nWhether you're purchasing your first home, building your dream home from the ground up, relocating to the area, or preparing to sell your current property, Kenneth is committed to providing expert guidance, exceptional service, and a seamless real estate experience from start to finish.`,
    social: { facebook: 'https://www.facebook.com/HomeFrontBuilderstn/', instagram: 'https://www.instagram.com/homefrontbuilderstn/', linkedin: '#' },
    video: 'https://www.youtube.com/embed/Syts_xMpWGo',
  },
  {
    name: 'Kyla',
    title: 'Realtor',
    image: '/assets/team/Kelsey Michaud.jpg',
    bio: `Kyla left the corporate world in 2019 and jumped headfirst into real estate sales and investing. She started as an associate agent in Middle Tennessee and quickly rose to lead agent, closing 49 deals in her first year while earning exceptional client reviews. In August 2021, she joined Heather Eisenmann's team at ClarksvilleHomeowner.com, where she has loved being part of a strong, supportive team. She became licensed in Kentucky in 2022 and now has four years of experience serving clients there as well.\n\nKyla's business has continued to grow year after year. In 2025 alone, she closed 90 transactions with a $31 million sales volume, reflecting her dedication, market knowledge, and commitment to delivering results for her clients.\n\nWith a strong understanding of the local market and a genuine passion for helping others, Kyla is committed to guiding buyers, sellers, and investors through every step of the process. She has built a proven track record through hard work, consistency, and care, and she works tirelessly to help her clients achieve the best possible outcome.\n\nMore than anything, Kyla becomes personally invested in the happiness of each client she serves. She believes there is no better feeling than handing someone the keys to their dream home on closing day.`,
    social: { facebook: 'https://www.facebook.com/HomeFrontBuilderstn/', instagram: 'https://www.instagram.com/homefrontbuilderstn/', linkedin: '#' },
    video: '',
  },
  {
    name: 'Chris Hodges',
    title: 'Realtor/Investor',
    image: '/assets/team/Chris Hodges.jpg',
    bio: `As a proud husband and father, my family is my "why," but my path to real estate began long before them. As a child, I experienced the instability of multiple evictions and spent my entire 7th-grade year living in a car. As a first-generation homeowner, I turned those hardships into a mission: ensuring others find the stability and pride of homeownership that my family once lacked.\n\nSince 2022, I’ve helped more than 210 families navigate the market. My approach is rooted in my 8 years of military service and 6 overseas deployments, which instilled in me the discipline, calm under pressure, and ferocious work ethic I bring to every client.\n\nMy Philosophy:\n\nService over Sales: I’ll never "convince" you to act; I’m here to guide your decision-making with total transparency.\n\nHonesty over Commissions: Because of my high volume, I’m never desperate for a deal. This allows me to focus on what is right for you, not just what closes.\n\nClear Communication: My business is built on expectation management and military-grade accountability.\n\nI don’t just sell houses—I help families build the foundation I once dreamed of. I can't wait to meet you.`,
    social: { facebook: 'https://www.facebook.com/HomeFrontBuilderstn/', instagram: 'https://www.instagram.com/homefrontbuilderstn/', linkedin: '#' },
    video: '',
  },
  {
    name: 'Karen Grimes',
    title: 'Broker',
    image: '/assets/team/Karen Grimes.jpeg',
    bio: `Karen Grimes is a licensed real estate Broker who has been actively practicing Real Estate since 2012, bringing over a decade of experience to the industry. With a strong foundation in contract strategy, negotiation, and transaction management, she is known for delivering a high level of professionalism and precision in every deal.\n\nSpecializing in luxury new construction, Karen has developed a niche working with discerning buyers, builders, and investors who expect both elevated service and expert guidance. She understands the complexities of new construction transactions—from builder contracts and customization phases to timelines and final delivery—allowing her clients to move forward with clarity and confidence.\n\nKaren's approach is strategic and client-focused. She prioritizes protecting her clients' interests while creating a seamless, efficient experience from contract to closing. Her ability to anticipate challenges, communicate clearly, and execute at a high level has made her a trusted resource for those navigating competitive and high-value real estate markets.\n\nWhether representing buyers, sellers, or builders, Karen is committed to delivering results while building lasting relationships grounded in trust, discretion, and performance.`,
    social: { facebook: 'https://www.facebook.com/HomeFrontBuilderstn/', instagram: 'https://www.instagram.com/homefrontbuilderstn/', linkedin: '#' },
    video: '',
  },
  {
    name: 'Hannah Myers',
    title: 'Realtor',
    image: '/assets/team/Hannah Myers.jpeg',
    bio: `Hannah Myers is a trusted Realtor and founder of The Home Alchemist™ Exclusive, known for delivering a highly intentional and client-focused experience. With over a decade in real estate, she brings a thoughtful, strategic approach to every transaction—grounded in patience, transparency, and deep market knowledge.\n\nHannah is highly selective about the builders she partners with, choosing only those whose quality, integrity, and craftsmanship she can stand behind with complete confidence. Her alignment with HomeFront reflects that standard.\n\nWith a natural eye for design, Hannah is drawn to warm, timeless aesthetics—rich browns, layered linens, and elevated finishes that create a luxury feel without unnecessary price inflation. She believes beautiful homes should feel both refined and attainable, and she takes pride in helping clients achieve that balance.\n\nAbove all, Hannah is committed to creating a seamless, informed, and elevated experience for every client she serves.`,
    social: { facebook: 'https://www.facebook.com/HomeFrontBuilderstn/', instagram: 'https://www.instagram.com/homefrontbuilderstn/', linkedin: '#' },
    video: '',
  },
  {
    name: 'Carrie Roseberry',
    title: 'Realtor',
    image: '/assets/team/Carrie Roseberry.png',
    bio: `Carrie is a dedicated real estate professional with a passion for helping clients find their dream homes and achieve their real estate goals. Having lived in the Clarksville area since 1979, Carrie brings decades of local knowledge and insight to every transaction. Coming from a military family, Carrie's father was stationed here, giving her firsthand experience with military relocations and the unique challenges that come with PCS moves.\n\nWith years of real estate experience and a deep understanding of the local market, Carrie is committed to providing exceptional service to buyers, sellers, and investors alike. Whether you're purchasing your first home, selling a property, relocating to the area, or building an investment portfolio, Carrie will guide you through every step of the process. Known for being trustworthy, approachable, and attentive to clients' needs, she strives to make every real estate experience as smooth and successful as possible.\n\nWhen you work with Carrie, you're partnering with a knowledgeable local expert who understands both the community and the importance of finding the perfect place to call home.`,
    social: { facebook: 'https://www.facebook.com/HomeFrontBuilderstn/', instagram: 'https://www.instagram.com/homefrontbuilderstn/', linkedin: '#' },
    video: 'https://www.youtube.com/embed/0RA_NdXA0rg',
  },
  {
    name: 'Colleen Marquez',
    title: 'Realtor',
    image: '/assets/team/Colleen Marquez 2.jpg',
    bio: `Colleen Marquez is the founder of the Home on the Rock Real Estate Team and a listing agent for Homefront Builders, where she blends real estate expertise, design intelligence, and development strategy to serve clients across Middle Tennessee.\n\nColleen specializes in custom home builds, land sourcing, greenfield development, and home design, including interior selections, floorplan planning, and architectural modifications. Her hands-on experience working alongside builders, architects, and design teams allows her to translate a client's vision into a functional, beautiful, and investment-smart home.\n\nProudly featured on Inside Success Network's Women in Power series, Colleen is recognized for her leadership, innovation, and influence in real estate, construction, and community development.\n\nAs a Certified Seller Representative Specialist (SRS) and Military Relocation Professional (MRP), Colleen brings advanced training in negotiation, pricing strategy, and client advocacy. She also provides professional staging services, ensuring every listing enters the market with editorial-quality presentation and maximum buyer appeal.\n\nServing Clarksville, Springfield, Nashville and the surrounding Middle Tennessee region, Colleen is the trusted partner for clients seeking land, custom construction, new development, or elevated residential real estate representation.`,
    social: { facebook: 'https://www.facebook.com/HomeFrontBuilderstn/', instagram: 'https://www.instagram.com/homefrontbuilderstn/', linkedin: '#' },
    video: 'https://www.youtube.com/embed/og0a61CUdUQ',
  },
];

/* ── Inline SVG Icons ── */
function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}

/* ── Partner Card ── */
function PartnerCard({ partner, index, onClick }: { key?: any; partner: typeof partners[0]; index: number; onClick: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
      style={{ aspectRatio: '3 / 4' }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onClick={onClick}
    >
      {/* Background Image or Initials Fallback */}
      {partner.image ? (
        <motion.img
          src={partner.image}
          alt={partner.name}
          className="absolute inset-0 w-full h-full object-cover object-top"
          animate={{ scale: expanded ? 1.05 : 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#1b2518] flex flex-col items-center justify-center border border-gray-100">
          <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center border border-[#c9a96e]/20 mb-2">
            <span className="font-serif text-3xl text-[#c9a96e] font-bold tracking-widest uppercase">
              {partner.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="font-sans text-[10px] uppercase tracking-widest text-[#c9a96e]/60">Click to View Profile</span>
        </div>
      )}

      {/* Gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: expanded
            ? 'linear-gradient(to top, rgba(15,20,12,0.97) 0%, rgba(15,20,12,0.92) 45%, rgba(15,20,12,0.6) 70%, rgba(15,20,12,0.1) 100%)'
            : 'linear-gradient(to top, rgba(15,20,12,0.85) 0%, rgba(15,20,12,0.3) 40%, rgba(15,20,12,0.0) 70%)',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-8">
        <motion.div
          animate={{ y: expanded ? -8 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
        >
          <motion.span
            className="block h-[1px] bg-[#c9a96e] mb-3"
            animate={{ width: expanded ? 40 : 24 }}
            transition={{ duration: 0.5 }}
          />
          <h3 className="font-serif text-2xl md:text-3xl text-white leading-tight">{partner.name}</h3>
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#c9a96e] mt-1.5">{partner.title}</p>
        </motion.div>

        {/* Bio reveal */}
        <motion.div
          initial={false}
          animate={{
            height: expanded ? 'auto' : 0,
            opacity: expanded ? 1 : 0,
            marginTop: expanded ? 16 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
            {partner.bio.split('\n\n').map((para, i) => (
              <p key={i} className="font-sans text-[12px] leading-relaxed text-white/70 mb-2.5 last:mb-0">
                {para}
              </p>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              <a href={partner.social.facebook} target="_blank" rel="noopener noreferrer" aria-label={`${partner.name} Facebook`} onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-[#c9a96e] hover:border-[#c9a96e] transition-all duration-300">
                <FacebookIcon />
              </a>
              <a href={partner.social.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${partner.name} Instagram`} onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-[#c9a96e] hover:border-[#c9a96e] transition-all duration-300">
                <InstagramIcon />
              </a>
            </div>
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#c9a96e] group-hover:underline">
              View Interview
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Partner Modal Component ── */
function PartnerModal({ partner, onClose }: { partner: typeof partners[0]; onClose: () => void }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(false);

    try {
      // Build the payload explicitly from state. The inputs are controlled
      // and have no `name` attributes, so `new FormData(form)` would be empty —
      // that bug is why these submissions were arriving blank.
      const data = new FormData();
      data.append("access_key", "6734d3d0-0e39-4112-b5b6-3247d6699948");
      data.append("subject", `New Inquiry via ${partner.name}'s profile — from ${formData.name}`);
      data.append("from_name", "Homefront Builders Website");
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone || "Not provided");
      data.append("message", formData.message);
      data.append("replyto", formData.email);
      data.append("Inquiry via profile", partner.name);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        console.error("Partner form submission error:", result);
        setError(true);
      }
    } catch (error) {
      console.error("Partner form submission failed:", error);
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/75 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Part: Full-Width 16:9 Video Player */}
        <div className="w-full relative aspect-video bg-black shrink-0">
          {partner.video ? (
            <iframe
              src={`${partner.video}?autoplay=1`}
              title={`${partner.name} Interview`}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center text-center p-8">
              <Video className="w-16 h-16 text-[#c9a96e] mb-4" strokeWidth={1} />
              <h4 className="font-serif text-2xl text-white">Interview Coming Soon</h4>
            </div>
          )}
        </div>

        {/* Bottom Part: Content Area */}
        <div className="w-full p-6 md:p-10 overflow-y-auto bg-surface/30 flex-grow custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            
            {/* Left Col (Bio) — 3 cols wide on large screens */}
            <div className="lg:col-span-3">
              {/* Header */}
              <div className="mb-6">
                <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-[#c9a96e] flex items-center gap-1.5 mb-1.5">
                  <Award className="w-3.5 h-3.5" /> Featured Partner
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-primary leading-tight">{partner.name}</h2>
                <p className="font-sans text-xs uppercase tracking-widest text-[#c9a96e] mt-1">{partner.title}</p>
              </div>

              {/* Description */}
              <div className="font-sans text-sm text-primary-light leading-relaxed space-y-4">
                {partner.bio.split('\n\n').map((para, i) => (
                  <p key={i} className="mb-3 last:mb-0">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Right Col (Form) — 2 cols wide on large screens */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-primary/5 rounded-2xl p-5 md:p-6 shadow-sm">
                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <Send className="w-5 h-5 text-accent animate-pulse" />
                    </div>
                    <h4 className="font-serif text-xl text-primary mb-2">Message Sent</h4>
                    <p className="font-sans text-xs text-primary-light max-w-xs mx-auto">
                      Thank you! Your message has been sent to Homefront Builders. The team will get back to you soon.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h4 className="font-serif text-lg text-primary mb-1">Contact Homefront Builders</h4>
                    <p className="font-sans text-[11px] text-primary-light/70 leading-relaxed mb-3">
                      Interested in working together or have a question? Send a message below and the Homefront Builders team will get back to you.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-surface border border-primary/10 rounded-xl px-4 py-2.5 font-sans text-xs text-primary outline-none focus:border-[#c9a96e]"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-surface border border-primary/10 rounded-xl px-4 py-2.5 font-sans text-xs text-primary outline-none focus:border-[#c9a96e]"
                      />
                    </div>

                    <input
                      type="tel"
                      placeholder="Phone Number (Optional)"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-surface border border-primary/10 rounded-xl px-4 py-2.5 font-sans text-xs text-primary outline-none focus:border-[#c9a96e]"
                    />

                    <textarea
                      required
                      placeholder="Type your message..."
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-surface border border-primary/10 rounded-xl px-4 py-2.5 font-sans text-xs text-primary outline-none focus:border-[#c9a96e] resize-none"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-primary text-white font-sans text-[10px] uppercase tracking-widest hover:bg-[#c9a96e] transition-all rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>

                    {error && (
                      <p className="font-sans text-[11px] text-red-600 text-center">
                        Something went wrong sending your message. Please try again or call us at (931) 221-2566.
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}

/* ── Page ── */
export default function AboutUs() {
  const [selectedPartner, setSelectedPartner] = useState<typeof partners[0] | null>(null);

  return (
    <div>
      <SEO
        title="About Us — Luxury Custom Homes in Middle Tennessee"
        description="Learn about Homefront Builders — Clarksville's premier luxury custom home builder with over two decades of expertise in Middle Tennessee design and construction."
        path="/about-us"
      />
      {/* ─── Hero Banner ─── */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden flex items-center justify-center">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="/assets/about-hero-new.webp"
          alt="Homefront Builders Interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1b2518]/40" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-10 md:p-16 rounded-3xl text-center max-w-3xl mx-4 shadow-2xl"
        >
          <p className="text-xs md:text-sm font-sans tracking-[0.4em] uppercase text-[#c9a96e] mb-4 drop-shadow-md">Our People</p>
          <h1 className="font-serif text-4xl md:text-6xl text-white tracking-wide drop-shadow-lg leading-tight">
            Meet the Homefront Builders Team
          </h1>
        </motion.div>
      </section>

      {/* ─── Video Introduction + Company Description ─── */}
      <section className="pb-20 md:pb-28 px-6 md:px-12 relative z-20 -mt-16 md:-mt-24">
        <div className="max-w-[1000px] mx-auto">

          {/* Homefront Planning Stage Video */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -80px 0px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full rounded-2xl overflow-hidden shadow-xl mb-16 group"
          >
            <video
              id="about-video"
              controls
              preload="metadata"
              poster="/assets/about-hero.jpg"
              className="w-full rounded-2xl"
              style={{ aspectRatio: '16 / 9', objectFit: 'cover' }}
              onClick={(e) => {
                const video = e.currentTarget;
                if (video.paused) {
                  video.play();
                } else {
                  video.pause();
                }
              }}
              onPlay={(e) => {
                const overlay = e.currentTarget.parentElement?.querySelector('.play-overlay');
                if (overlay) overlay.classList.add('hidden');
              }}
              onPause={(e) => {
                const overlay = e.currentTarget.parentElement?.querySelector('.play-overlay');
                if (overlay) overlay.classList.remove('hidden');
              }}
            >
              <source src="https://www.dropbox.com/scl/fi/c9p6d770o9yw3npugsmql/Hardwood-Dr.mp4?rlkey=xlvao3qiz0h9vtytlgs0p34py&raw=1" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Custom Play Overlay */}
            <div 
              className="play-overlay absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors pointer-events-none"
            >
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center translate-y-0 group-hover:scale-110 transition-transform duration-500">
                <PlayIcon />
              </div>
            </div>
          </motion.div>

          {/* Company Description */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -60px 0px' }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <p className="font-sans text-base md:text-lg leading-loose text-primary-light">
              Specializing exclusively in building custom homes and luxury residences across Middle Tennessee, Homefront Builders is not your typical general contractor. With over two decades of expertise in the region, we've transformed the visions of hundreds of families into beautifully appointed dream homes that are built to stand the test of time, both structurally and conceptually.
            </p>
            <p className="font-sans text-base md:text-lg leading-loose text-primary-light">
              Some of the reasons why so many families have chosen to build with Homefront include:
            </p>
            <ul className="space-y-4 pl-1">
              {[
                'Unmatched quality craftsmanship and attention to detail in every build',
                'Transparent project management from foundation to final walkthrough',
                'A dedicated team of design professionals who curate spaces that feel as good as they look',
                'Deep roots in Middle Tennessee — we build where we live, and we stand behind every home',
                'Flexible floor plans and customization options tailored to your family\'s lifestyle',
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-4 text-primary-light font-sans text-base leading-relaxed"
                >
                  <span className="mt-2 w-2 h-2 rounded-full bg-[#c9a96e] shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ─── Meet Our Partners ─── */}
      <section className="bg-[#F4F3F0] py-20 px-6 md:px-12 overflow-hidden">
        <div className="max-w-[1300px] mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -80px 0px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#c9a96e] mb-4">The Team</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h2 className="font-serif text-5xl lg:text-6xl text-primary">Meet Our Partners</h2>
              <p className="text-primary-light font-sans max-w-xs text-xs leading-relaxed">
                Click any partner to watch their featured interview video and get in direct contact with them.
              </p>
            </div>
            <div className="mt-8 h-[1px] bg-primary/10 w-full" />
          </motion.div>

          {/* Cards — 3 per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-6">
            {partners.map((partner, i) => (
              <PartnerCard 
                key={partner.name} 
                partner={partner} 
                index={i} 
                onClick={() => setSelectedPartner(partner)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Partner Detail Modal Overlay */}
      <AnimatePresence>
        {selectedPartner && (
          <PartnerModal 
            partner={selectedPartner} 
            onClose={() => setSelectedPartner(null)} 
          />
        )}
      </AnimatePresence>

      {/* ─── Contact Us Section ─── */}
      <ContactSection showWhyUs={false} />

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(201, 169, 110, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 169, 110, 0.5);
        }
      `}</style>
    </div>
  );
}
