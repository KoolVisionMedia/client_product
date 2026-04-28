import { motion } from 'motion/react';

const listings = [
  {
    name: 'The Patterson',
    location: '124 Legacy Court, Clarksville',
    price: '$1,150,000',
    stats: '5 beds • 4.5 baths • 4,200 sqft',
    image: '/assets/DSC04388-Edit.jpg',
    status: 'Available',
  },
  {
    name: 'The Ellison',
    location: '88 Heritage Way, Nashville',
    price: '$925,000',
    stats: '4 beds • 3.5 baths • 3,600 sqft',
    image: '/assets/about-hero.jpg',
    status: 'Pending',
  },
  {
    name: 'The Cypress',
    location: '32 Riverwood Dr, Clarksville',
    price: '$849,000',
    stats: '4 beds • 3 baths • 3,200 sqft',
    image: '/assets/Cypress.jpg',
    status: 'Available',
  },
  {
    name: 'The Nolan',
    location: '215 Oakheart Lane, Springfield',
    price: '$785,000',
    stats: '3 beds • 2.5 baths • 2,900 sqft',
    image: '/assets/Harmony.jpg',
    status: 'Available',
  },
  {
    name: 'The Willow Custom',
    location: '56 Pineview Ridge, Middle TN',
    price: '$1,250,000',
    stats: '5 beds • 5 baths • 4,800 sqft',
    image: '/assets/Magnolia.jpg',
    status: 'Coming Soon',
  },
  {
    name: 'The Juniper Estate',
    location: '12 Elderberry Path, Clarksville',
    price: '$890,000',
    stats: '4 beds • 4 baths • 3,800 sqft',
    image: '/assets/content2.jpg',
    status: 'Available',
  },
];

export default function Listings() {
  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="relative h-[400px] md:h-[450px] overflow-hidden">
        <img
          src="/assets/DSC04388-Edit.jpg"
          alt="Luxury Listing"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#1b2518]/60" />
        <div className="relative z-10 h-full flex items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#c9a96e] mb-4">Current Availability</p>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white tracking-wide">
              View Our Active Listings
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 md:py-32 px-4 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
            {listings.map((listing, i) => (
              <motion.div
                key={listing.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -60px 0px' }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl mb-5">
                  <motion.img
                    src={listing.image}
                    alt={listing.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase font-sans tracking-widest font-semibold backdrop-blur-md ${
                      listing.status === 'Available' ? 'bg-[#c9a96e] text-white' : 
                      listing.status === 'Pending' ? 'bg-black/60 text-white' : 
                      'bg-white/90 text-primary'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1.5 md:gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-xl md:text-2xl text-primary group-hover:text-[#c9a96e] transition-colors">{listing.name}</h3>
                    <span className="font-serif text-lg md:text-xl text-[#c9a96e]">{listing.price}</span>
                  </div>
                  <p className="font-sans text-[10px] md:text-xs text-primary-light/60 uppercase tracking-widest">{listing.location}</p>
                  <p className="font-sans text-[10px] md:text-xs text-primary-light italic">{listing.stats}</p>
                  
                  <div className="mt-3 pt-4 border-t border-primary/5 flex justify-between items-center opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-[10px] font-sans tracking-widest uppercase text-primary font-bold">View Full Details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#c9a96e] transform lg:translate-x-[-10px] lg:group-hover:translate-x-0 transition-transform">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="bg-[#F4F3F0] py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="font-serif text-2xl md:text-3xl text-primary/80 leading-relaxed italic">
            "We don't just build houses; we curate the backdrop for your family's most cherished memories."
          </p>
          <div className="mt-8 flex justify-center gap-1">
            {[1,2,3,4,5].map(i => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#c9a96e" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
