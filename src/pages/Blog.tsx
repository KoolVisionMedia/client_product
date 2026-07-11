import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Tilt from 'react-parallax-tilt';
import { ArrowRight, Calendar, Tag, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { blogArticles } from '../data/blogArticles';
import SEO from '../components/SEO';

const posts = [
  {
    title: 'The Art of Modern Farmhouse Design',
    excerpt: 'Exploring the timeless elements that make the modern farmhouse a favorite for Middle Tennessee families. From wrap-around porches to soaring vaulted ceilings, discover how we blend rustic charm with modern luxury.',
    date: 'May 12, 2024',
    category: 'Design Trends',
    image: '/assets/Harmony.webp',
    slug: 'modern-farmhouse-design'
  },
  {
    title: 'How to Choose the Right Custom Home Builder in Clarksville, TN',
    excerpt: 'Not all custom home builders operate the same way. Here\'s what to look for — and what questions to ask — before signing a contract with a builder in the Clarksville, TN area.',
    date: 'June 3, 2026',
    category: 'Guides',
    image: '/assets/DSC04388-Edit.webp',
    slug: 'choose-custom-home-builder-clarksville-tn'
  },
  {
    title: 'New Construction Homes in Clarksville, TN: What to Expect in 2025',
    excerpt: 'Clarksville\'s housing market continues to grow. Here\'s what buyers and families should know about new construction timelines, costs, and the custom build process in 2025.',
    date: 'June 20, 2026',
    category: 'Market Insights',
    image: '/assets/Cypress.jpg',
    slug: 'new-construction-homes-clarksville-tn-2025'
  },
  {
    title: 'Luxury Custom Home Features Worth Every Penny in Middle Tennessee',
    excerpt: 'When building a luxury custom home in Middle Tennessee, some upgrades deliver outsized returns — in daily enjoyment and resale value. Here are the ones our clients love most.',
    date: 'July 1, 2026',
    category: 'Design Trends',
    image: '/assets/Magnolia.jpg',
    slug: 'luxury-custom-home-features-middle-tennessee'
  },
  {
    title: '5 Things to Know Before Building Custom',
    excerpt: 'A comprehensive guide to preparing for your custom home journey, from land acquisition to final selections.',
    date: 'April 28, 2024',
    category: 'Guides',
    image: '/assets/Myrtle.jpg',
    slug: 'before-building-custom'
  },
  {
    title: 'Why Quality Matters in Construction',
    excerpt: 'Why we choose premium materials and craftsmen for every Homefront Builders project.',
    date: 'April 15, 2024',
    category: 'Quality',
    image: '/assets/about-hero.jpg',
    slug: 'why-quality-matters'
  }
];

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any } }
  };

  return (
    <div className="bg-[#F4F3F0] min-h-screen">
      <SEO
        title="Custom Home Building Blog | Tips & Insights"
        description="Custom home building tips, design trends, and Clarksville TN housing market insights from Homefront Builders — Middle Tennessee's premier luxury custom home builder."
        path="/blog"
      />
      {/* Hero with Parallax & Glassmorphism */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden flex items-center justify-center">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="/assets/DSC04388-Edit.webp"
          alt="Blog Hero Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1b2518]/40" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-10 md:p-16 rounded-3xl text-center max-w-3xl mx-4 shadow-2xl"
        >
          <p className="text-xs md:text-sm font-sans tracking-[0.4em] uppercase text-[#c9a96e] mb-4 drop-shadow-md">The Journal</p>
          <h1 className="font-serif text-4xl md:text-6xl text-white tracking-wide drop-shadow-lg">
            Insights & Inspiration
          </h1>
        </motion.div>
      </section>

      {/* Featured Post (Index 0) */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto -mt-16 md:-mt-24 relative z-20">
        <Tilt
          tiltMaxAngleX={3}
          tiltMaxAngleY={3}
          scale={1.02}
          transitionSpeed={2500}
          className="cursor-pointer"
          glareEnable={true}
          glareMaxOpacity={0.15}
          glarePosition="all"
        >
          <motion.article
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setSelectedPost(featuredPost.slug)}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row group"
          >
            {/* Image Half */}
            <div className="lg:w-3/5 relative overflow-hidden aspect-video lg:aspect-auto">
              <img loading="lazy" decoding="async" src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute top-6 left-6">
                <span className="bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-sans tracking-[0.2em] uppercase font-bold text-primary rounded-sm shadow-sm">
                  Featured Article
                </span>
              </div>
            </div>

            {/* Content Half */}
            <div className="lg:w-2/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-4 text-xs font-sans tracking-widest text-[#c9a96e] uppercase mb-4">
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {featuredPost.date}</span>
                <span className="hidden md:block w-1 h-1 rounded-full bg-primary/20" />
                <span className="flex items-center gap-1.5"><Tag size={14} /> {featuredPost.category}</span>
              </div>

              <h2 className="font-serif text-3xl md:text-4xl text-primary mb-6 leading-tight group-hover:text-[#c9a96e] transition-colors duration-500">
                {featuredPost.title}
              </h2>

              <p className="text-primary-light/80 font-sans text-base leading-relaxed mb-8">
                {featuredPost.excerpt}
              </p>

              <div className="mt-auto pt-8 border-t border-gray-100 flex items-center gap-3 text-sm font-sans tracking-[0.2em] uppercase font-bold text-primary">
                Read Full Story
                <ArrowRight size={18} className="text-[#c9a96e] transform group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>
          </motion.article>
        </Tilt>
      </section>

      {/* Standard Grid */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12"
        >
          {remainingPosts.map((post) => (
            <motion.div key={post.title} variants={itemVariants}>
              <Tilt
                tiltMaxAngleX={5}
                tiltMaxAngleY={5}
                scale={1.03}
                transitionSpeed={2000}
                className="cursor-pointer h-full"
                glareEnable={true}
                glareMaxOpacity={0.1}
                glarePosition="all"
              >
                <article
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500 h-full flex flex-col group"
                  onClick={() => setSelectedPost(post.slug)}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img loading="lazy" decoding="async" src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/95 px-3 py-1 text-[10px] font-sans tracking-widest uppercase font-bold text-primary rounded-sm shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <p className="text-[10px] font-sans tracking-widest text-[#c9a96e] uppercase mb-3 flex items-center gap-1.5">
                      <Calendar size={12} /> {post.date}
                    </p>
                    <h3 className="font-serif text-2xl text-primary mb-4 group-hover:text-[#c9a96e] transition-colors duration-500">
                      {post.title}
                    </h3>
                    <p className="text-primary-light/70 font-sans text-sm leading-relaxed line-clamp-3 mb-6">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center gap-2 text-[11px] font-sans tracking-[0.2em] uppercase font-bold text-primary">
                      Read Article
                      <ArrowRight size={14} className="text-[#c9a96e] transform group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </article>
              </Tilt>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Article Modal Overlay */}
      <AnimatePresence>
        {selectedPost && blogArticles[selectedPost] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-[#1A2118]/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-full bg-[#FAFAF5] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header with Close Button */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 sm:p-3 bg-white/90 hover:bg-white backdrop-blur-md rounded-full text-primary hover:text-[#c9a96e] transition-colors shadow-sm"
                  aria-label="Close article"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Article Content */}
              <div className="p-8 sm:p-12 md:p-16 overflow-y-auto">
                <article className="prose prose-stone prose-lg md:prose-xl max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-[#c9a96e] hover:prose-a:text-primary transition-colors prose-strong:text-primary">
                  <ReactMarkdown>
                    {blogArticles[selectedPost]}
                  </ReactMarkdown>
                </article>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
