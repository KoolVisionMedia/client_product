import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const posts = [
  {
    title: 'The Art of Modern Farmhouse Design',
    excerpt: 'Exploring the timeless elements that make the modern farmhouse a favorite for Middle Tennessee families.',
    date: 'May 12, 2024',
    category: 'Design Trends',
    image: '/assets/Harmony.jpg',
    slug: 'modern-farmhouse-design'
  },
  {
    title: '5 Things to Know Before Building Custom',
    excerpt: 'A comprehensive guide to preparing for your custom home journey, from land acquisition to final selections.',
    date: 'April 28, 2024',
    category: 'Guides',
    image: '/assets/Cypress.jpg',
    slug: 'before-building-custom'
  },
  {
    title: 'Why Quality Matters in Construction',
    excerpt: 'Why we choose premium materials and craftsmen for every Homefront Builders project.',
    date: 'April 15, 2024',
    category: 'Quality',
    image: '/assets/Magnolia.jpg',
    slug: 'why-quality-matters'
  }
];

export default function Blog() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[400px] md:h-[450px] overflow-hidden">
        <div className="absolute inset-0 bg-[#1b2518]" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center pt-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#c9a96e] mb-4">The Journal</p>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white tracking-wide">
              Insights & Inspiration
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-6">
                <motion.img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8 }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-sans tracking-widest uppercase font-semibold text-primary">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-sans tracking-widest text-[#c9a96e] uppercase">{post.date}</p>
                <h3 className="font-serif text-2xl text-primary group-hover:text-[#c9a96e] transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="text-primary-light/70 font-sans text-sm leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="pt-4 flex items-center gap-2 text-[10px] font-sans tracking-[0.2em] uppercase font-bold text-primary">
                  Read Article
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-2 transition-transform duration-300">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
