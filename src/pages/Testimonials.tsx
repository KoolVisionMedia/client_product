import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

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
    text: '"HomeFront Builders and their team are hands down the best in middle Tennessee. They truly care about delivering a quality product to each and every client. Amber is an incredible architect who can take napkin drawings and turn them into the floorplan of your dreams. 10 out of 10 recommend!"',
  },
  {
    initials: 'K.G.',
    image: '/assets/Karen Grimes.jpeg',
    date: 'Jul 16, 2025',
    text: '"I\'ve worked with this builder many times and my clients have raved about the professionalism and focus on customer satisfaction and appreciation. They also love that the options are far and above most if not all in the area."',
  },
  {
    initials: 'P.S.',
    image: '/assets/Patricia Shipley.webp',
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

const tiktokVideos = [
  '7575161196769266999',
  '7559654166126152974',
];

const instagramPosts = [
  'https://www.instagram.com/reel/DQrd1KjDgly/',
  'https://www.instagram.com/p/DPNpS6BDWvO/',
];

// ── Sticky Review Card (Webflow-style stacked scroll) ─────────────────
type FeaturedReview = typeof featuredReviews[0];

const ReviewCard = ({ review, index, total }: { review: FeaturedReview; index: number; total: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start start', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, index === total - 1 ? 1 : 0.93]);
  const opacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 1, index === total - 1 ? 1 : 0.55]);

  return (
    <div
      ref={cardRef}
      className="sticky top-0 h-screen flex items-center justify-center px-4 md:px-16 lg:px-24 py-6"
      style={{ zIndex: index + 10 }}
    >
      <motion.div
        style={{ scale, opacity }}
        className="w-full max-w-6xl h-[82vh] max-h-[740px] bg-white rounded-[28px] overflow-hidden shadow-[0_-24px_60px_rgba(0,0,0,0.22)] flex flex-col md:flex-row"
      >
        {/* Image panel */}
        <div className="w-full md:w-[48%] h-52 md:h-full relative overflow-hidden group">
          <img
            src={review.image}
            alt={review.name}
            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b2518]/85 via-[#1b2518]/25 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="font-sans text-[10px] uppercase tracking-[0.35em] text-[#c9a96e] mb-2">{review.location}</p>
            <h3 className="font-serif text-3xl md:text-4xl leading-snug">{review.name}</h3>
          </div>
        </div>

        {/* Content panel */}
        <div className="w-full md:w-[52%] flex flex-col justify-center px-8 md:px-14 py-10 bg-[#FAFAF5]">
          <div className="flex items-center gap-2 mb-5">
            {review.platform === 'Google' ? <GoogleLogo /> : <FacebookLogo />}
            <span className="font-sans text-xs text-gray-400 tracking-wide">{review.platform} Review</span>
          </div>
          <Stars size={16} />
          <blockquote className="font-serif text-xl md:text-2xl lg:text-[26px] text-[#2E362C] leading-relaxed italic mt-7">
            "{review.text}"
          </blockquote>
          <div className="mt-10 flex items-center gap-4">
            <div className="h-[1px] w-10 bg-[#B48C36]" />
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#B48C36]">{review.date}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────
export default function Testimonials() {
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
      <section ref={heroRef} className="relative h-[72vh] min-h-[520px] overflow-hidden">
        {/* Parallax background */}
        <motion.div className="absolute inset-0 scale-110" style={{ y: heroImageY }}>
          <img
            src="/assets/DSC04388-Edit.jpg"
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

      {/* ── Platform Rating Bar ─────────────────────────────────────── */}
      <section className="bg-[#1b2518] py-14 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: 'Google',   rating: '5.0', sub: '15+ Verified Reviews',  Logo: GoogleLogo   },
            { label: 'Facebook', rating: '5.0', sub: '6+ Community Reviews',  Logo: FacebookLogo },
            { label: 'Houzz',    rating: '5.0', sub: 'Certified Professional', Logo: null         },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-5 border border-white/10 rounded-xl px-7 py-6 bg-white/[0.03]"
            >
              <span className="font-serif text-4xl text-[#c9a96e] leading-none tabular-nums">{item.rating}</span>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Stars size={13} />
                  {item.Logo && <item.Logo />}
                </div>
                <p className="font-sans text-[11px] text-white/50 tracking-wide">
                  {item.label} · {item.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Reviews — sticky scroll stack ─────────────────── */}
      <section>
        <div className="px-6 md:px-12 max-w-7xl mx-auto pt-24 pb-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#B48C36] mb-4">Verified</p>
            <h2 className="font-serif text-5xl md:text-6xl text-[#2E362C]">Featured Reviews</h2>
          </motion.div>
        </div>

        <div className="relative bg-[#F3F3ED]">
          {featuredReviews.map((review, index) => (
            <ReviewCard key={review.name} review={review} index={index} total={featuredReviews.length} />
          ))}
          <div className="h-24" />
        </div>
      </section>

      {/* ── Facebook Reviews Strip ──────────────────────────────────── */}
      <section className="py-24 bg-[#1b2518]">
        <div className="px-6 md:px-12 max-w-7xl mx-auto mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#c9a96e] mb-4">Community Voices</p>
            <h2 className="font-serif text-5xl md:text-6xl text-white">From Our Community</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center gap-2 text-white/40 text-[11px] font-sans tracking-widest uppercase"
          >
            <FacebookLogo />
            <span>Facebook Reviews</span>
          </motion.div>
        </div>

        {/* Horizontal scroll strip */}
        <div className="flex gap-5 px-6 md:px-12 overflow-x-auto scrollbar-none pb-2">
          {facebookReviews.map((r, i) => (
            <motion.div
              key={r.initials}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex-none w-[300px] md:w-[340px] bg-white/[0.05] border border-white/10 rounded-2xl p-7 flex flex-col gap-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-none bg-[#2a3628] border border-white/10 flex items-center justify-center">
                  {r.image
                    ? <img src={r.image} alt={r.initials} className="w-full h-full object-cover" />
                    : <span className="font-serif text-[#c9a96e] text-sm select-none">{r.initials}</span>
                  }
                </div>
                <div>
                  <p className="font-serif text-white text-lg">{r.initials}</p>
                  <Stars size={11} />
                </div>
              </div>
              <p className="font-sans text-sm text-white/70 leading-relaxed flex-1">{r.text}</p>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <p className="font-sans text-[10px] text-white/30 uppercase tracking-widest">{r.date}</p>
                <FacebookLogo />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Social Feed ─────────────────────────────────────────────── */}
      <section className="py-28 bg-[#FAFAF5]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16"
          >
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#B48C36] mb-4">Follow Along</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h2 className="font-serif text-5xl md:text-6xl text-[#2E362C]">Find Us Online</h2>
              <div className="flex items-center gap-5">
                {[
                  { label: 'Facebook', url: 'https://www.facebook.com/HomeFrontBuilderstn/', color: '#1877F2' },
                  { label: 'Instagram', url: 'https://www.instagram.com/homefrontbuilderstn/', color: '#E1306C' },
                  { label: 'TikTok', url: 'https://www.tiktok.com/@homefront.builder', color: '#010101' },
                ].map(p => (
                  <a
                    key={p.label}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-[11px] tracking-[0.2em] uppercase text-[#596652] hover:text-[#B48C36] transition-colors duration-300"
                  >
                    {p.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Feed Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ── Facebook Page Plugin ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="font-sans text-xs tracking-[0.2em] uppercase text-[#596652]">Facebook</span>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                <iframe
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FHomeFrontBuilderstn%2F&tabs=timeline&width=500&height=680&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false"
                  width="100%"
                  height="680"
                  style={{ border: 'none', overflow: 'hidden', display: 'block' }}
                  scrolling="no"
                  frameBorder={0}
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>
            </motion.div>

            {/* ── TikTok Videos ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.3 8.3 0 004.86 1.55V6.78a4.85 4.85 0 01-1.09-.09z"/>
                </svg>
                <span className="font-sans text-xs tracking-[0.2em] uppercase text-[#596652]">TikTok</span>
              </div>
              {tiktokVideos.map((id, i) => (
                <div key={id} className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                  <iframe
                    src={`https://www.tiktok.com/embed/v2/${id}`}
                    width="100%"
                    height="580"
                    style={{ border: 'none', display: 'block' }}
                    allowFullScreen
                    allow="encrypted-media"
                    title={`TikTok video ${i + 1}`}
                  />
                </div>
              ))}
            </motion.div>

            {/* ── Instagram Posts ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#E1306C">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="font-sans text-xs tracking-[0.2em] uppercase text-[#596652]">Instagram</span>
              </div>
              {instagramPosts.map((url, i) => (
                <div key={i} className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                  <blockquote
                    className="instagram-media"
                    data-instgrm-permalink={url}
                    data-instgrm-version="14"
                    style={{ background: '#FFF', border: 0, margin: 0, maxWidth: '100%', minWidth: 0, padding: 0, width: '100%' }}
                  />
                </div>
              ))}
              <a
                href="https://www.instagram.com/homefrontbuilderstn/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-gray-200 font-sans text-[11px] uppercase tracking-[0.2em] text-[#596652] hover:text-[#E1306C] hover:border-[#E1306C]/30 transition-all duration-300"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                View All Posts · @homefrontbuilderstn
              </a>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Client Moments Gallery ──────────────────────────────────── */}
      <section className="py-28 px-6 md:px-12 bg-[#F3F3ED]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
                viewport={{ once: true }}
                transition={{ duration: 0.85, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative overflow-hidden rounded-xl ${item.className}`}
              >
                <img
                  src={item.src}
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
          viewport={{ once: true }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -right-48 -top-48 w-[700px] h-[700px] rounded-full bg-[#B48C36]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 0.04, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -left-32 -bottom-32 w-[500px] h-[500px] rounded-full bg-[#B48C36]"
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
