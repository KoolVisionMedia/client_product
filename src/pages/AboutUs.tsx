import { useState } from 'react';
import { motion } from 'motion/react';
import ContactSection from '../components/ContactSection';

const partners = [
  {
    name: 'Carissa Ockey',
    title: 'New Construction Specialist',
    image: '/assets/team/Carissa Ockey.jpeg',
    bio: `I grew up around construction, so I've always seen homes a little differently. Over the past 6.5 years, I've built my career around new construction: guiding projects from concept to completion with a strong focus on both design and functionality.\n\nMy background in interior design allows me to look beyond the floorplans and think about how a home will actually feel to live in. As a mom, I appreciate a home that's not just beautiful, but functions day to day. Elevated but practical.\n\nI'm big on relationships and believe the best projects come from collaboration and trust. The end goal is always the same: a home that feels as good as it looks.`,
    social: { facebook: '#', instagram: '#', linkedin: '#' },
  },
  {
    name: 'Kyla',
    title: 'Lead Agent',
    image: '/assets/team/Kelsey Michaud.jpg',
    bio: `Kyla left the corporate world in 2019 and jumped headfirst into real estate sales and investing. She started as an associate agent in Middle Tennessee and quickly rose to lead agent, closing 49 deals in her first year while earning exceptional client reviews. In August 2021, she joined Heather Eisenmann's team at ClarksvilleHomeowner.com, where she has loved being part of a strong, supportive team. She became licensed in Kentucky in 2022 and now has four years of experience serving clients there as well.\n\nKyla's business has continued to grow year after year. In 2025 alone, she closed 90 transactions with a $31 million sales volume, reflecting her dedication, market knowledge, and commitment to delivering results for her clients.\n\nWith a strong understanding of the local market and a genuine passion for helping others, Kyla is committed to guiding buyers, sellers, and investors through every step of the process. She has built a proven track record through hard work, consistency, and care, and she works tirelessly to help her clients achieve the best possible outcome.\n\nMore than anything, Kyla becomes personally invested in the happiness of each client she serves. She believes there is no better feeling than handing someone the keys to their dream home on closing day.`,
    social: { facebook: '#', instagram: '#', linkedin: '#' },
  },
  {
    name: 'Hannah Myers',
    title: 'Founder, The Home Alchemist™',
    image: '/assets/team/Hannah Myers.jpeg',
    bio: `Hannah Myers is a trusted Realtor and founder of The Home Alchemist™ Exclusive, known for delivering a highly intentional and client-focused experience. With over a decade in real estate, she brings a thoughtful, strategic approach to every transaction—grounded in patience, transparency, and deep market knowledge.\n\nHannah is highly selective about the builders she partners with, choosing only those whose quality, integrity, and craftsmanship she can stand behind with complete confidence. Her alignment with HomeFront reflects that standard.\n\nWith a natural eye for design, Hannah is drawn to warm, timeless aesthetics—rich browns, layered linens, and elevated finishes that create a luxury feel without unnecessary price inflation. She believes beautiful homes should feel both refined and attainable, and she takes pride in helping clients achieve that balance.\n\nAbove all, Hannah is committed to creating a seamless, informed, and elevated experience for every client she serves.`,
    social: { facebook: '#', instagram: '#', linkedin: '#' },
  },
  {
    name: 'Colleen Marquez',
    title: 'Visionary Realtor & Creative Strategist',
    image: '/assets/team/Colleen Marquez 2.jpg',
    bio: `Colleen Marquez is the founder of the Home on the Rock Real Estate Team and a listing agent for Homefront Builders, where she blends real estate expertise, design intelligence, and development strategy to serve clients across Middle Tennessee.\n\nColleen specializes in custom home builds, land sourcing, greenfield development, and home design, including interior selections, floorplan planning, and architectural modifications. Her hands-on experience working alongside builders, architects, and design teams allows her to translate a client's vision into a functional, beautiful, and investment-smart home.\n\nProudly featured on Inside Success Network's Women in Power series, Colleen is recognized for her leadership, innovation, and influence in real estate, construction, and community development.\n\nAs a Certified Seller Representative Specialist (SRS) and Military Relocation Professional (MRP), Colleen brings advanced training in negotiation, pricing strategy, and client advocacy. She also provides professional staging services, ensuring every listing enters the market with editorial-quality presentation and maximum buyer appeal.\n\nServing Clarksville, Springfield, Nashville and the surrounding Middle Tennessee region, Colleen is the trusted partner for clients seeking land, custom construction, new development, or elevated residential real estate representation.`,
    social: { facebook: '#', instagram: '#', linkedin: '#' },
  },
  {
    name: 'Patricia Shipley',
    title: 'Director of Sales, Homefront Builders',
    image: '/assets/team/Patricia Shipley.webp',
    bio: `Patricia Shipley has been a realtor for 9 years and she has always dedicated her and her team to provide exceptional service. She works with land, new construction and existing homes in Clarksville and all Mid TN. She is the Director of Sales and her role is dedicated to create an exceptional client experience from first contact through project completion. She oversees and develops high-performing sales teams, implements data-driven processes, and cultivates strong relationships with clients, partners, and other Realtors in the Mid TN area. Using local trends and customer needs, she aligns sales strategies with the company's mission to deliver quality craftsmanship and personalize homebuilding solutions. Her role combines leadership, operational insight, and a commitment to excellence to support long-term business growth.`,
    social: { facebook: '#', instagram: '#', linkedin: '#' },
  },
  {
    name: 'Karen Grimes',
    title: 'Licensed Real Estate Broker',
    image: '/assets/team/Karen Grimes.jpeg',
    bio: `Karen Grimes is a licensed real estate Broker who has been actively practicing Real Estate since 2012, bringing over a decade of experience to the industry. With a strong foundation in contract strategy, negotiation, and transaction management, she is known for delivering a high level of professionalism and precision in every deal.\n\nSpecializing in luxury new construction, Karen has developed a niche working with discerning buyers, builders, and investors who expect both elevated service and expert guidance. She understands the complexities of new construction transactions—from builder contracts and customization phases to timelines and final delivery—allowing her clients to move forward with clarity and confidence.\n\nKaren's approach is strategic and client-focused. She prioritizes protecting her clients' interests while creating a seamless, efficient experience from contract to closing. Her ability to anticipate challenges, communicate clearly, and execute at a high level has made her a trusted resource for those navigating competitive and high-value real estate markets.\n\nWhether representing buyers, sellers, or builders, Karen is committed to delivering results while building lasting relationships grounded in trust, discretion, and performance.`,
    social: { facebook: '#', instagram: '#', linkedin: '#' },
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
function PartnerCard({ partner, index }: { partner: typeof partners[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-3xl overflow-hidden cursor-pointer"
      style={{ aspectRatio: '3 / 4' }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Background Image */}
      <motion.img
        src={partner.image}
        alt={partner.name}
        className="absolute inset-0 w-full h-full object-cover object-top"
        animate={{ scale: expanded ? 1.08 : 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />

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
          <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {partner.bio.split('\\n\\n').map((para, i) => (
              <p key={i} className="font-sans text-[12px] leading-relaxed text-white/70 mb-2.5 last:mb-0">
                {para}
              </p>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-4 mt-3 border-t border-white/10">
            <a href={partner.social.facebook} aria-label={`${partner.name} Facebook`}
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-[#c9a96e] hover:border-[#c9a96e] transition-all duration-300">
              <FacebookIcon />
            </a>
            <a href={partner.social.instagram} aria-label={`${partner.name} Instagram`}
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-[#c9a96e] hover:border-[#c9a96e] transition-all duration-300">
              <InstagramIcon />
            </a>
            <a href={partner.social.linkedin} aria-label={`${partner.name} LinkedIn`}
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-[#c9a96e] hover:border-[#c9a96e] transition-all duration-300">
              <LinkedInIcon />
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Page ── */
export default function AboutUs() {
  return (
    <div>
      {/* ─── Hero Banner ─── */}
      <section className="relative h-[400px] md:h-[450px] overflow-hidden">
        <img
          src="/assets/about-hero.jpg"
          alt="Homefront Builders Interior"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#1b2518]/60" />
        <div className="relative z-10 h-full flex items-center justify-center pt-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl text-white text-center tracking-wide"
          >
            Meet the Homefront Builders Team
          </motion.h1>
        </div>
      </section>

      {/* ─── Video Introduction + Company Description ─── */}
      <section className="bg-white py-20 md:py-28 px-6 md:px-12">
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
              <source src="/assets/homefront-planning-stage.mp4" type="video/mp4" />
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
                  viewport={{ once: true }}
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
                The dedicated professionals behind every home we build — committed to craftsmanship, integrity, and your vision.
              </p>
            </div>
            <div className="mt-8 h-[1px] bg-primary/10 w-full" />
          </motion.div>

          {/* Cards — 3 per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-6">
            {partners.map((partner, i) => (
              <PartnerCard key={partner.name} partner={partner} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact Us Section ─── */}
      <ContactSection />

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(201, 169, 110, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 169, 110, 0.6);
        }
      `}</style>
    </div>
  );
}
