import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const listings = [
  {
    name: '24 Solitude Way',
    location: '24 Solitude Way',
    price: '$1,150,000',
    stats: '5 beds • 4.5 baths • 4,200 sqft',
    description: "A stunning architectural masterpiece situated on a prime lot at 24 Solitude Way. This custom home features a grand open-concept layout, soaring ceilings, high-end designer finishes, a chef's kitchen with top-of-the-line appliances, and a luxurious primary suite. Experience true elegance and unparalleled craftsmanship in every detail.",
    image: '/assets/active_listings/24-solitude-way/KoolVisionMedia100.jpg',
    images: [
      '/assets/active_listings/24-solitude-way/KoolVisionMedia100.jpg',
      '/assets/active_listings/24-solitude-way/KoolVisionMedia101.jpg',
      '/assets/active_listings/24-solitude-way/KoolVisionMedia102.jpg',
      '/assets/active_listings/24-solitude-way/KoolVisionMedia103.jpg',
      '/assets/active_listings/24-solitude-way/KoolVisionMedia104.jpg'
    ],
    status: 'Available',
  },
  {
    name: '193 Solitude Way',
    location: '193 Solitude Way',
    price: '$1,250,000',
    stats: '5 beds • 5 baths • 4,800 sqft',
    description: "Welcome to 193 Solitude Way, an exquisite custom-built estate that blends modern luxury with timeless design. This spectacular property boasts an expansive floor plan with custom millwork, an oversized gourmet kitchen, multiple living areas perfect for entertaining, and a private backyard oasis. A rare opportunity in a highly sought-after neighborhood.",
    image: '/assets/active_listings/193-solitude-way/NEWKoolVisionMedia001.jpg',
    images: [
      '/assets/active_listings/193-solitude-way/NEWKoolVisionMedia001.jpg',
      '/assets/active_listings/193-solitude-way/NEWKoolVisionMedia002.jpg',
      '/assets/active_listings/193-solitude-way/NEWKoolVisionMedia003.jpg',
      '/assets/active_listings/193-solitude-way/NEWKoolVisionMedia004.jpg',
      '/assets/active_listings/193-solitude-way/NEWKoolVisionMedia005.jpg'
    ],
    status: 'Available',
  },
  {
    name: "413 Shea's Way",
    location: "413 Shea's Way, Clarksville",
    price: '$925,000',
    stats: '4 beds • 3.5 baths • 3,600 sqft',
    description: "Located at 413 Shea's Way in Clarksville, this exceptional home offers the perfect balance of comfort and sophistication. Featuring a bright, open interior, premium hardwood flooring, custom cabinetry, a beautifully appointed primary bathroom, and ample outdoor living space. Built to the highest standards, this home is ready for you to make lasting memories.",
    image: '/assets/active_listings/413-sheas-way/KoolVisionMedia001.jpg',
    images: [
      '/assets/active_listings/413-sheas-way/KoolVisionMedia001.jpg',
      '/assets/active_listings/413-sheas-way/KoolVisionMedia002.jpg',
      '/assets/active_listings/413-sheas-way/KoolVisionMedia003.jpg',
      '/assets/active_listings/413-sheas-way/KoolVisionMedia004.jpg',
      '/assets/active_listings/413-sheas-way/KoolVisionMedia005.jpg'
    ],
    status: 'Available',
  },
  {
    name: 'The Nolan',
    location: '215 Oakheart Lane, Springfield',
    price: '$785,000',
    stats: '3 beds • 2.5 baths • 2,900 sqft',
    description: "A gorgeous modern farmhouse design featuring a spacious wrap-around porch and a light-filled interior. Perfect for family gatherings.",
    image: '/assets/Harmony.jpg',
    images: ['/assets/Harmony.jpg'],
    status: 'Available',
  },
  {
    name: 'The Willow Custom',
    location: '56 Pineview Ridge, Middle TN',
    price: '$1,250,000',
    stats: '5 beds • 5 baths • 4,800 sqft',
    description: "Nestled on a wooded lot, The Willow Custom offers privacy and serenity with high-end luxury finishes throughout.",
    image: '/assets/Magnolia.jpg',
    images: ['/assets/Magnolia.jpg'],
    status: 'Coming Soon',
  },
  {
    name: 'The Juniper Estate',
    location: '12 Elderberry Path, Clarksville',
    price: '$890,000',
    stats: '4 beds • 4 baths • 3,800 sqft',
    description: "The Juniper Estate combines classic architecture with modern amenities, creating a timeless and elegant living space.",
    image: '/assets/content2.jpg',
    images: ['/assets/content2.jpg'],
    status: 'Available',
  },
];

export default function Listings() {
  const [selectedListing, setSelectedListing] = useState<typeof listings[0] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
                onClick={() => {
                  setSelectedListing(listing);
                  setCurrentImageIndex(0);
                }}
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

      {/* Listing Modal */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedListing(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedListing(null)}
                className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              {/* Gallery Slider */}
              <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={selectedListing.images[currentImageIndex]}
                    alt={`${selectedListing.name} - View ${currentImageIndex + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-contain"
                  />
                </AnimatePresence>

                {/* Slider Controls */}
                {selectedListing.images.length > 1 && (
                  <>
                    <button 
                      className="absolute left-4 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(prev => prev === 0 ? selectedListing.images.length - 1 : prev - 1);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button 
                      className="absolute right-4 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(prev => prev === selectedListing.images.length - 1 ? 0 : prev + 1);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {selectedListing.images.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-[#c9a96e]' : 'w-2 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Description & Details */}
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-8 border-b border-gray-200">
                  <div>
                    <span className="inline-block px-3 py-1 bg-[#F4F3F0] text-[#c9a96e] text-[10px] uppercase tracking-widest font-bold rounded-full mb-4">
                      {selectedListing.status}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif text-primary mb-2">{selectedListing.name}</h2>
                    <p className="text-primary/60 font-sans tracking-wide uppercase text-sm">{selectedListing.location}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-3xl md:text-4xl font-serif text-[#c9a96e] mb-2">{selectedListing.price}</div>
                    <p className="font-sans font-medium text-primary/80">{selectedListing.stats}</p>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none prose-headings:font-serif prose-p:text-primary/70 prose-p:leading-relaxed">
                  <h3 className="text-xl font-serif text-primary mb-4">About this Property</h3>
                  <p>{selectedListing.description}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
