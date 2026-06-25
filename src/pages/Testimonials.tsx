import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useVelocity, useSpring } from 'motion/react';

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

// ── Shared Components ─────────────────────────────────────────────────
const Stars = ({ size = 14 }: { size?: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="#c9a96e" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const FacebookLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// ── Data ──────────────────────────────────────────────────────────────

const featuredReviews = [
  {
    name: 'Jerry Turner',
    location: 'Clarksville (Lender Review)',
    platform: 'Google' as const,
    date: '2 weeks ago',
    text: "As a lender who specializes in construction loans, I've seen firsthand how important it is for buyers to choose the right builder... Their team takes the time to listen to what people want, work within their budget, and create a plan that fits their goals rather than trying to force a one-size-fits-all approach.",
    image: '/assets/about.jpg',
  },
  {
    name: 'bailey graven',
    location: 'Clarksville Custom Homeowner',
    platform: 'Google' as const,
    date: '2 weeks ago',
    text: "Homefront built us the custom home of our dreams! They kept us informed throughout the whole process, and always stayed ahead of things. the communication between the entire team as well as with us was great... The build quality is beautiful too. Unique and unlike other homes you find in Clarksville.",
    image: '/assets/content1.jpg',
  },
  {
    name: 'Sarah & Michael Thompson',
    location: 'Legacy Court Residence',
    platform: 'Google' as const,
    date: 'November 2024',
    text: "Building our forever home with Homefront Builders was an absolute dream. From the first sketch to the final walkthrough, the attention to detail was breathtaking. They didn't just build a house; they understood exactly how we wanted to live.",
    image: '/assets/DSC04388-Edit.jpg',
  },
  {
    name: 'David Richardson',
    location: 'Riverwood Estate',
    platform: 'Google' as const,
    date: 'January 2025',
    text: "The transparency in their process is what set them apart. I always knew exactly where we were in the timeline and budget. The craftsmanship of the custom millwork is something our guests comment on every single time they visit.",
    image: '/assets/Cypress.jpg',
  },
  {
    name: 'The Henderson Family',
    location: 'Heritage Way',
    platform: 'Google' as const,
    date: 'March 2025',
    text: "We interviewed four builders, but Homefront was the only one who truly listened to our specific needs for a multi-generational layout. The result is a stunning home that functions perfectly for our entire family.",
    image: '/assets/Magnolia.jpg',
  },
];

const googleReviews = [
  {
    name: 'Jerry Turner',
    role: 'Local Guide · Lender',
    image: null,
    date: '2 weeks ago',
    text: "As a lender who specializes in construction loans, I've seen firsthand how important it is for buyers to choose the right builder. Building a custom home is a much more involved process than purchasing an existing home, and not all builders are created equal when it comes to communication, organization, and helping clients navigate the many decisions along the way.\n\nI've gotten to know the team at Homefront Builders through several clients who have built with them, and I've been consistently impressed with how they handle the entire process. Their 'Trees to Keys' approach really reflects how involved they are from start to finish.",
  },
  {
    name: 'bailey graven',
    role: 'Clarksville Homeowner',
    image: null,
    date: '2 weeks ago',
    text: "Homefront built us the custom home of our dreams! They kept us informed throughout the whole process, and always stayed ahead of things. the communication between the entire team as well as with us was great. even after closing and moving in, they still answer our questions and emails promptly.\n\nThe build quality is beautiful too. Unique and unlike other homes you find in Clarksville. I’m very happy to have a Homefront home.",
  },
  {
    name: 'Mia Scimeca',
    role: 'Repeat Client',
    image: null,
    date: '2 weeks ago',
    text: "I’ve built many houses with homefront builders, their process is just so simplified. They understand that building a house is very scary and it’s not simple. But they are extremely comforting and easy to contact and they walk you through it step-by-step.",
  },
  {
    name: 'Tymberlan De Jesus-Alexander',
    role: 'Local Guide',
    image: null,
    date: '2 weeks ago',
    text: "So great and easy to work with! Very knowledgeable and communicative too!",
  },
  {
    name: 'Durrk Broham',
    role: 'Client',
    image: null,
    date: '1 week ago',
    text: "These guys are tubular. Super straightforward and easy communication throughout the build, and the price was great.",
  },
  {
    name: 'Karen Priest',
    role: 'Client',
    image: null,
    date: '1 week ago',
    text: "Highly professional custom home building experience in Clarksville. The team is very attentive and responsive to questions.",
  }
];

// Facebook reviews — names redacted to initials per client privacy
const facebookReviews = [
  {
    initials: 'A.S.',
    image: null,
    date: 'Sep 24, 2025',
    text: '"While custom homes can be costly, this builder offers great value. The quality, service, and attention to detail make every dollar worth it. You will be impressed with the high-quality materials and finishes used. The craftsmanship in details like cabinetry and overall design is exceptional."',
  },
  {
    initials: 'K.T.',
    image: null,
    date: 'Jul 16, 2025',
    text: '"Homefront Builders and their team are hands down the best in middle Tennessee. They truly care about delivering a quality product to each and every client. Amber is an incredible architect who can take napkin drawings and turn them into the floorplan of your dreams. 10 out of 10 recommend!"',
  },
  {
    initials: 'K.G.',
    image: null,
    date: 'Jul 16, 2025',
    text: '"I\'ve worked with this builder many times and my clients have raved about the professionalism and focus on customer satisfaction and appreciation. They also love that the options are far and above most if not all in the area."',
  },
  {
    initials: 'P.S.',
    image: null,
    date: 'Jul 16, 2025',
    text: '"I have worked with this builder for several years, and the professionalism and communication is unmatched. The homes are beautiful and well built, this builder takes the time with each home because they do a limited number of homes each year. SO when it comes to customization, hands down this is the team you want to work with."',
  },
];

const clientGallery = [
  { src: '/assets/Carissa Ockey.jpeg',    name: 'Carissa O.',    className: 'row-span-2' },
  { src: '/assets/Hannah Myers.jpeg',     name: 'Hannah M.',     className: '' },
  { src: '/assets/Karen Grimes.jpeg',     name: 'Karen G.',      className: '' },
  { src: '/assets/DSC04388-Edit.jpg',     name: 'Legacy Court',  className: 'col-span-2' },
  { src: '/assets/Colleen Marquez 2.jpg', name: 'Colleen M.',    className: '' },
  { src: '/assets/content2.jpg',          name: 'The Build',     className: 'row-span-2' },
  { src: '/assets/Kelsey Michaud.jpg',    name: 'Kelsey M.',     className: '' },
  { src: '/assets/Patricia Shipley.webp', name: 'Patricia S.',   className: '' },
  { src: '/assets/about-hero.jpg',        name: 'Our Work',      className: 'col-span-2' },
];

const communityImages = [
  '/assets/community/473338662_122097057008731378_6991236073360247651_n.webp',
  '/assets/community/473673644_122216376032074441_6291583575612602141_n.webp',
  '/assets/community/481763915_122225517866074441_5132558681301907346_n.webp',
  '/assets/community/491199204_1206729828120502_4021135175915967788_n.webp',
  '/assets/community/492365756_122234824814074441_1216855867914535668_n.webp',
  '/assets/community/518276642_122249563244074441_1457083503727355780_n.webp',
  '/assets/community/579413024_122270538680074441_5335348799522715425_n.webp',
  '/assets/community/580399179_122270538692074441_3941408381955964056_n.webp',
  '/assets/community/593969977_911586774526388_1583205593496869380_n.webp',
  '/assets/community/594126554_911561954528870_9202778842408553763_n.webp',
];

// ── Interactive Masonry Marquee ─────────────────────────────────
const allReviews = [
  ...featuredReviews.map(r => ({
    name: r.name,
    role: r.location || r.role,
    date: r.date,
    text: r.text,
    source: r.platform || 'Google',
    image: r.image,
  })),
  ...googleReviews.map(r => ({
    name: r.name,
    role: r.role,
    date: r.date,
    text: r.text,
    source: 'Google',
    image: r.image,
  })),
  ...facebookReviews.map(r => ({
    name: r.initials,
    role: 'Facebook Recommendation',
    date: r.date,
    text: r.text,
    source: 'Facebook',
    image: r.image,
  }))
];

const col1 = allReviews.filter((_, i) => i % 3 === 0);
const col2 = allReviews.filter((_, i) => i % 3 === 1);
const col3 = allReviews.filter((_, i) => i % 3 === 2);

const ReviewCard = ({ review }: { review: any }) => (
  <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-7 flex flex-col gap-5 hover:bg-white/[0.08] transition-all duration-300 w-full mb-6">
    <div className="flex items-center gap-4">
      {review.image ? (
        <img loading="lazy" src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover flex-none border border-white/10" />
      ) : (
        <div className="w-12 h-12 rounded-full overflow-hidden flex-none bg-[#2a3628] border border-white/10 flex items-center justify-center">
          <span className="font-serif text-[#c9a96e] text-sm select-none">
            {review.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
          </span>
        </div>
      )}
      <div>
        <p className="font-serif text-white text-lg leading-tight">{review.name}</p>
        <p className="font-sans text-[10px] text-[#c9a96e] tracking-wider mt-0.5">{review.role}</p>
        <div className="mt-1">
          <Stars size={10} />
        </div>
      </div>
    </div>
    <p className="font-sans text-xs md:text-sm text-white/70 leading-relaxed flex-1 whitespace-pre-line">{review.text}</p>
    <div className="flex items-center justify-between pt-2 border-t border-white/10">
      <p className="font-sans text-[10px] text-white/30 uppercase tracking-widest">{review.date}</p>
      {review.source === 'Google' ? <GoogleLogo /> : <FacebookLogo />}
    </div>
  </div>
);

const MasonryMarquee = () => {
  return (
    <div className="relative h-[900px] overflow-hidden scroll-mask flex gap-6 px-6 md:px-12 max-w-7xl mx-auto items-start pt-10">
      <div className="flex-1 flex flex-col animate-marquee-up pt-10">
        {[...col1, ...col1].map((review, i) => (
          <ReviewCard key={`col1-${i}`} review={review} />
        ))}
      </div>
      <div className="flex-1 flex flex-col animate-marquee-down hidden md:flex pb-10 mt-[-100px]">
        {[...col2, ...col2].map((review, i) => (
          <ReviewCard key={`col2-${i}`} review={review} />
        ))}
      </div>
      <div className="flex-1 flex flex-col animate-marquee-up hidden lg:flex pt-20">
        {[...col3, ...col3].map((review, i) => (
          <ReviewCard key={`col3-${i}`} review={review} />
        ))}
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────
export default function Testimonials() {
  const [formState, setFormState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error', message: string }>({ status: 'idle', message: '' });

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState({ status: 'loading', message: '' });
    const formData = new FormData(e.currentTarget);
    formData.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY);
    formData.append("subject", "New Community Update Subscription");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFormState({ status: 'success', message: 'Thank you! You are now subscribed to our updates.' });
        e.currentTarget.reset();
      } else {
        console.error("Web3Forms Error", data);
        setFormState({ status: 'error', message: data.message || "Something went wrong. Please try again." });
      }
    } catch (error) {
      console.error("Submission error", error);
      setFormState({ status: 'error', message: "A network error occurred. Please try again." });
    }
  };
  // Load Instagram embed script once
  useEffect(() => {
    if (document.getElementById('ig-embed-script')) {
      window.instgrm?.Embeds.process();
      return;
    }
    const s = document.createElement('script');
    s.id = 'ig-embed-script';
    s.src = 'https://www.instagram.com/embed.js';
    s.async = true;
    s.onload = () => window.instgrm?.Embeds.process();
    document.body.appendChild(s);
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(heroScroll, [0, 1], ['0%', '28%']);
  const heroTextY  = useTransform(heroScroll, [0, 1], ['0%', '16%']);

  return (
    <div className="bg-[#FAFAF5] min-h-screen overflow-x-hidden">

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-[400px] md:h-[450px] overflow-hidden">
        {/* Parallax background */}
        <motion.div className="absolute inset-0 scale-110" style={{ y: heroImageY }}>
          <img loading="lazy" decoding="async" src="/assets/DSC04388-Edit.jpg"
            alt="Luxury Home"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b2518]/55 via-[#1b2518]/50 to-[#1b2518]/85" />

        <motion.div
          style={{ y: heroTextY }}
          className="relative z-10 h-full flex flex-col items-center justify-center pt-20 px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="text-[10px] font-sans tracking-[0.45em] uppercase text-[#c9a96e] mb-5">Client Stories</p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white tracking-wide max-w-3xl leading-[1.15]">
              What Our Families<br />Are Saying
            </h1>
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-8 h-px w-20 bg-[#c9a96e] origin-left"
            />
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-white/40">Scroll</span>
          <motion.div
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-px h-8 bg-white/30 origin-top"
          />
        </motion.div>
      </section>

      {/* ── Video Card Rating Section ─────────────────────────────────────── */}
      <section className="bg-[#FAFAF5] py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto relative rounded-[2.5rem] overflow-hidden shadow-2xl">
          {/* Background Video */}
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/assets/holiday-seminar.mp4" type="video/mp4" />
          </video>
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1b2518]/95 via-[#1b2518]/70 to-transparent" />
          
          <div className="relative z-10 p-10 md:p-20 flex flex-col justify-end min-h-[500px]">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-5">
                Excellence in Every Detail
              </h2>
              <p className="font-sans text-white/80 text-lg mb-12 max-w-lg leading-relaxed">
                We transform visions into reality, but our commitment goes far beyond building homes. We are deeply invested in our Middle Tennessee footprint, actively sponsoring local initiatives and hosting community events. We go above and beyond because we care just as much about the people who live in our homes as the homes themselves.
              </p>
              
              {/* Merged Ratings */}
              <div className="flex flex-wrap items-center gap-8 md:gap-14">
                {[
                  { label: 'Google',   rating: '5.0', sub: '15+ Verified Reviews',  Logo: GoogleLogo   },
                  { label: 'Facebook', rating: '5.0', sub: '6+ Community Reviews',  Logo: FacebookLogo },
                  { label: 'Houzz',    rating: '5.0', sub: 'Certified Professional', Logo: null         },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="font-serif text-4xl text-white">{item.rating}</span>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Stars size={12} />
                        {item.Logo && <div className="ml-1"><item.Logo /></div>}
                      </div>
                      <p className="font-sans text-[10px] text-white/60 uppercase tracking-wider">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community Reviews Masonry ──────────────────────────────────── */}
      <section className="py-24 bg-[#1b2518] overflow-hidden">
        <div className="px-6 md:px-12 max-w-7xl mx-auto mb-6 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#c9a96e] mb-4">From Our Community</p>
            <h2 className="font-serif text-5xl md:text-6xl text-white">Community Voices</h2>
          </motion.div>
        </div>

        <div className="relative">
          <MasonryMarquee />
          {/* Subtle gradients to fade out the top and bottom of the masonry scroll */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#1b2518] to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1b2518] to-transparent pointer-events-none z-10" />
        </div>
      </section>

      {/* ── Community & Education ───────────────────────────────────── */}
      <section className="py-28 bg-[#1b2518] text-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Text Content */}
          <div className="w-full lg:w-5/12 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#c9a96e] mb-4">Building Together</p>
              <h2 className="font-serif text-5xl md:text-6xl text-white leading-tight mb-6">
                Community & <br /> Education
              </h2>
              <p className="font-sans text-white/70 leading-relaxed text-lg max-w-lg mb-6">
                We are deeply rooted in the Middle Tennessee community. By partnering with local artisans, visionary architects, and dear friends, we regularly host educational classes and exclusive events focused on custom home building. 
              </p>
              <p className="font-sans text-white/70 leading-relaxed text-lg max-w-lg mb-10">
                These gatherings are designed to demystify the construction process, answer your questions, and empower you with the knowledge to build your dream home with absolute confidence.
              </p>

              {/* Social Media & Updates */}
              <div className="pt-4 border-t border-white/10">
                <p className="font-serif text-2xl text-white mb-2">Join the Conversation</p>
                <p className="font-sans text-white/60 mb-6 text-sm">
                  Check out our social media for the latest project updates, behind-the-scenes content, and upcoming event announcements.
                </p>
                <div className="flex gap-4 mb-10">
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#c9a96e] transition-colors">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#c9a96e] transition-colors">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                  </a>
                </div>

                {/* Newsletter Funnel */}
                <div className="bg-white/[0.03] border border-[#c9a96e]/20 rounded-2xl p-6 md:p-8">
                  <p className="font-serif text-xl text-[#c9a96e] mb-2">Stay in the Loop</p>
                  <p className="font-sans text-white/70 text-sm mb-6">
                    If you would like updates for any of our upcoming educational classes, seminars, or exclusive events, send us your information below.
                  </p>
                  <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                    <input type="text" name="name" required placeholder="Your Name" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#c9a96e] transition-colors" />
                    <input type="email" name="email" required placeholder="Your Email Address" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#c9a96e] transition-colors" />
                    <button disabled={formState.status === 'loading'} type="submit" className="w-full bg-[#c9a96e] text-[#1b2518] font-sans font-bold py-3 rounded-lg hover:bg-[#b5955a] transition-colors disabled:opacity-50">
                      {formState.status === 'loading' ? 'Submitting...' : 'Sign Up for Updates'}
                    </button>
                    {formState.message && (
                      <p className={`text-sm mt-2 ${formState.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {formState.message}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Free-floating Animated Collage */}
          <div className="w-full lg:w-7/12 relative h-[600px] md:h-[800px] mt-16 lg:mt-0">
            {[
              { w: 'w-[45%] md:w-[38%]', top: 'top-[0%]', left: 'left-[0%]', rotate: -4, z: 10, delay: 0, duration: 6, yOffset: -15 },
              { w: 'w-[35%] md:w-[30%]', top: 'top-[5%]', left: 'left-[35%]', rotate: 6, z: 20, delay: 1, duration: 7, yOffset: 20 },
              { w: 'w-[28%] md:w-[24%]', top: 'top-[2%]', left: 'left-[70%]', rotate: -8, z: 5, delay: 0.8, duration: 7.5, yOffset: -10 },
              { w: 'w-[40%] md:w-[35%]', top: 'top-[30%]', left: 'left-[5%]', rotate: 3, z: 30, delay: 0.5, duration: 5.5, yOffset: 15 },
              { w: 'w-[48%] md:w-[42%]', top: 'top-[40%]', left: 'left-[38%]', rotate: -5, z: 40, delay: 1.5, duration: 8, yOffset: -20 },
              { w: 'w-[35%] md:w-[30%]', top: 'top-[35%]', left: 'left-[75%]', rotate: 8, z: 25, delay: 1.2, duration: 6, yOffset: 10 },
              { w: 'w-[30%] md:w-[25%]', top: 'top-[60%]', left: 'left-[10%]', rotate: -6, z: 15, delay: 2.5, duration: 7, yOffset: -12 },
              { w: 'w-[35%] md:w-[30%]', top: 'top-[75%]', left: 'left-[35%]', rotate: 5, z: 35, delay: 2, duration: 6.5, yOffset: 15 },
              { w: 'w-[40%] md:w-[35%]', top: 'top-[65%]', left: 'left-[65%]', rotate: -3, z: 30, delay: 1.8, duration: 7.5, yOffset: -18 },
              { w: 'w-[25%] md:w-[22%]', top: 'top-[85%]', left: 'left-[80%]', rotate: 7, z: 10, delay: 0.9, duration: 5, yOffset: 8 },
            ].map((config, i) => (
              <div
                key={i}
                className={`absolute ${config.w} ${config.top} ${config.left}`}
                style={{ zIndex: config.z }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 80 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, config.yOffset, 0], 
                      rotate: [config.rotate, config.rotate + (i % 2 === 0 ? 3 : -3), config.rotate] 
                    }}
                    transition={{ repeat: Infinity, duration: config.duration, ease: "easeInOut", delay: config.delay }}
                    className="relative w-full rounded-xl md:rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[6px] border-[#FAFAF5] group"
                  >
                    <img loading="lazy" decoding="async" src={communityImages[i]} 
                      alt={`Community Event ${i + 1}`} 
                      className="w-full h-full object-cover aspect-[4/5] md:aspect-[3/4] transition-transform duration-[2s] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-[#c9a96e]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay" />
                  </motion.div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Client Moments Gallery ──────────────────────────────────── */}
      <section className="py-28 px-6 md:px-12 bg-[#F3F3ED]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-14"
          >
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#B48C36] mb-4">The Real Moments</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h2 className="font-serif text-5xl md:text-6xl text-[#2E362C] leading-tight">
                Happy Clients &<br />Candid Stories
              </h2>
              <p className="font-sans text-[#596652] max-w-xs text-sm leading-relaxed">
                Real families. Real homes. Every photo is a story of trust, craft, and a dream realized.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px] md:auto-rows-[220px]">
            {clientGallery.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.85, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative overflow-hidden rounded-xl ${item.className}`}
              >
                <img loading="lazy" decoding="async" src={item.src}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-[1.8s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b2518]/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="font-sans text-white text-sm font-medium">{item.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="relative py-36 px-6 md:px-12 bg-[#1b2518] overflow-hidden">
        {/* Decorative circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 0.06, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -right-48 -top-48 w-[700px] h-[700px] rounded-full bg-[#B48C36]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 0.04, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 2.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -left-32 -bottom-32 w-[500px] h-[500px] rounded-full bg-[#B48C36]"
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-sans tracking-[0.45em] uppercase text-[#c9a96e] mb-7">Your Turn</p>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-8">
              Ready to Write<br />Your Story?
            </h2>
            <p className="font-sans text-white/55 max-w-md mx-auto text-sm leading-relaxed mb-14">
              Join the families who chose to build with intention. Let's create something extraordinary — together.
            </p>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.03, backgroundColor: '#967226' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-3 bg-[#B48C36] text-white px-14 py-5 font-sans text-[11px] tracking-[0.25em] uppercase font-semibold"
            >
              Start Your Journey
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.a>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
