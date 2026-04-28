import { motion } from 'motion/react';

const reviews = [
  {
    name: 'Sarah & Michael Thompson',
    location: 'Legacy Court Residence',
    text: 'Building our forever home with Homefront Builders was an absolute dream. From the first sketch to the final walkthrough, the attention to detail was breathtaking. They didn\'t just build a house; they understood exactly how we wanted to live.',
    image: '/assets/DSC04388-Edit.jpg'
  },
  {
    name: 'David Richardson',
    location: 'Riverwood Estate',
    text: 'The transparency in their process is what set them apart. I always knew exactly where we were in the timeline and budget. The craftsmanship of the custom millwork is something our guests comment on every single time they visit.',
    image: '/assets/Cypress.jpg'
  },
  {
    name: 'The Henderson Family',
    location: 'Heritage Way',
    text: 'We interviewed four builders, but Homefront was the only one who truly listened to our specific needs for a multi-generational layout. The result is a stunning home that functions perfectly for our entire family.',
    image: '/assets/Magnolia.jpg'
  }
];

export default function Testimonials() {
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
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#c9a96e] mb-4">Client Stories</p>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white tracking-wide">
              Kind Words From Our Families
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img src="/assets/about-hero.jpg" alt="Luxury Interior" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1b2518]/60 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 text-white">
              <p className="font-serif text-2xl italic">"We don't just build houses; we curate the backdrop for your family's most cherished memories."</p>
            </div>
          </motion.div>
          
          <div className="space-y-12">
            {reviews.map((review, i) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="border-b border-gray-100 pb-12 last:border-0"
              >
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#c9a96e" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <p className="font-sans text-lg text-primary-light leading-relaxed mb-6 italic">"{review.text}"</p>
                <div>
                  <h4 className="font-serif text-xl text-primary">{review.name}</h4>
                  <p className="text-[10px] font-sans tracking-widest text-[#c9a96e] uppercase mt-1">{review.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
