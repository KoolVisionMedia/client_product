import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const listings = [
  {
    name: '5 Pace Road',
    location: '5 Pace Road',
    price: 'Coming Soon',
    stats: 'Under Construction',
    description: "Welcome to 5 Pace Road. This upcoming luxury property is currently under construction and will feature the highest standards of architectural design and premium craftsmanship. Stay tuned for full details, video tours, and a complete gallery as we progress toward completion.",
    image: '/assets/active_listings/5-pace-rd/DJI_0030__1_.jpg',
    images: [
      '/assets/active_listings/5-pace-rd/DJI_0030__1_.jpg',
      '/assets/active_listings/5-pace-rd/KoolVisionMedia.jpg',
      '/assets/active_listings/5-pace-rd/KoolVisionMedia-2.jpg',
      '/assets/active_listings/5-pace-rd/KoolVisionMedia-3.jpg',
      '/assets/active_listings/5-pace-rd/KoolVisionMedia-4.jpg',
      '/assets/active_listings/5-pace-rd/KoolVisionMedia-5.jpg',
      '/assets/active_listings/5-pace-rd/KoolVisionMedia-6.jpg',
      '/assets/active_listings/5-pace-rd/KoolVisionMedia-7.jpg',
      '/assets/active_listings/5-pace-rd/KoolVisionMedia-8.jpg',
      '/assets/active_listings/5-pace-rd/KoolVisionMedia-9.jpg',
      '/assets/active_listings/5-pace-rd/KoolVisionMedia-10.jpg',
    ],
    status: 'Coming Soon',
  },
  {
    name: '24 Solitude Way',
    location: '24 Solitude Way',
    price: '$1,150,000',
    stats: '5 beds • 4.5 baths • 4,200 sqft',
    description: "A stunning architectural masterpiece situated on a prime lot at 24 Solitude Way. This custom home features a grand open-concept layout, soaring ceilings, high-end designer finishes, a chef's kitchen with top-of-the-line appliances, and a luxurious primary suite. Experience true elegance and unparalleled craftsmanship in every detail.",
    image: '/assets/active_listings/24-solitude-way/KoolVisionMedia001.jpg',
    images: Array.from({length: 81}, (_, i) => `/assets/active_listings/24-solitude-way/KoolVisionMedia${String(i + 1).padStart(3, '0')}.jpg`),
    video: 'https://youtube.com/shorts/QXDeAi2wibY?feature=share',
    status: 'Sold',
  },
  {
    name: '193 Solitude Way',
    location: '193 Solitude Way',
    price: '$1,250,000',
    stats: '5 beds • 5 baths • 4,800 sqft',
    description: "Welcome to 193 Solitude Way, an exquisite custom-built estate that blends modern luxury with timeless design. This spectacular property boasts an expansive floor plan with custom millwork, an oversized gourmet kitchen, multiple living areas perfect for entertaining, and a private backyard oasis. A rare opportunity in a highly sought-after neighborhood.",
    image: '/assets/active_listings/193-solitude-way/KoolVisionMedia001.jpg',
    images: Array.from({length: 85}, (_, i) => `/assets/active_listings/193-solitude-way/KoolVisionMedia${String(i + 1).padStart(3, '0')}.jpg`),
    video: 'https://youtube.com/shorts/HdOP20eKP74',
    status: 'Under Contract',
  },
  {
    name: '1215 Hill Ln',
    location: '1215 Hill Ln',
    price: 'Under Contract',
    stats: 'The Cypress',
    description: "A beautifully crafted Cypress model home at 1215 Hill Lane. This stunning property features an open-concept living space with premium finishes, a spacious chef's kitchen, elegant primary suite, and thoughtfully designed outdoor areas. Every detail reflects the hallmark quality and craftsmanship that Homefront Builders is known for.",
    image: '/assets/active_listings/1215-hill-ln/1-web-or-mls-1215-hill-ln.jpg',
    images: Array.from({length: 51}, (_, i) => `/assets/active_listings/1215-hill-ln/${i + 1}-web-or-mls-1215-hill-ln.jpg`),
    status: 'Under Contract',
  },
  {
    name: '1177 Gholson Rd',
    location: '1177 Gholson Rd',
    price: 'Available',
    stats: 'The Dogwood',
    description: "This exceptional Dogwood model at 1177 Gholson Road showcases the finest in custom home building. With a spacious layout featuring high ceilings, premium hardwood floors, designer lighting, and a gourmet kitchen with top-of-the-line finishes. The sprawling outdoor areas and meticulous landscaping complete this remarkable property.",
    image: '/assets/active_listings/16-gholson-rd/1-web-or-mls-1177-gholson-rd.jpg',
    images: Array.from({length: 74}, (_, i) => `/assets/active_listings/16-gholson-rd/${i + 1}-web-or-mls-1177-gholson-rd.jpg`)
      .filter(img => !img.endsWith('70-web-or-mls-1177-gholson-rd.jpg') && !img.endsWith('73-web-or-mls-1177-gholson-rd.jpg')),
    status: 'Sold',
  },
  {
    name: '183 Solitude Dr',
    location: '183 Solitude Dr',
    price: 'Under Contract',
    stats: 'The Birchwood',
    description: "Welcome to 183 Solitude Drive, a gorgeous Birchwood model home that perfectly balances modern luxury with warm, inviting design. Featuring an expansive open floor plan, designer finishes throughout, a stunning primary suite, and beautifully appointed living spaces ideal for both everyday comfort and elegant entertaining.",
    image: '/assets/active_listings/17-fawn-birchwood/1-web-or-mls-183-solitude-dr.jpg',
    images: Array.from({length: 54}, (_, i) => `/assets/active_listings/17-fawn-birchwood/${i + 1}-web-or-mls-183-solitude-dr.jpg`),
    status: 'Under Contract',
  },
  {
    name: '411 Blue Ridge Ct',
    location: '411 Blue Ridge Ct',
    price: 'Available',
    stats: 'The Harmony',
    description: "Situated at 411 Blue Ridge Court, this stunning Harmony model home showcases an exceptional blend of style and functionality. From the moment you step inside, you're greeted by a grand foyer, open-concept living areas, and a chef's kitchen with premium appliances. The spacious primary suite and beautifully finished lower level make this an ideal family home.",
    image: '/assets/active_listings/41-longview-harmony/1-web-or-mls-411-blue-rdg-ct.jpg',
    images: Array.from({length: 52}, (_, i) => `/assets/active_listings/41-longview-harmony/${i + 1}-web-or-mls-411-blue-rdg-ct.jpg`),
    video: 'https://www.youtube.com/embed/xR7JxTj79-o',
    status: 'Available',
  },
  {
    name: '418 Blue Ridge Ct',
    location: '418 Blue Ridge Ct',
    price: 'Under Contract',
    stats: 'The Magnolia',
    description: "This remarkable Magnolia model at 418 Blue Ridge Court is a true showpiece. Featuring an elegant open floor plan, designer finishes, custom lighting, and a gourmet kitchen with oversized island. The thoughtfully designed living spaces flow seamlessly, creating an atmosphere of refined luxury throughout. An impeccably built home with attention to every detail.",
    image: '/assets/active_listings/44-longview-magnolia/1-web-or-mls-418-blue-rdg-ct.jpg',
    images: Array.from({length: 50}, (_, i) => `/assets/active_listings/44-longview-magnolia/${i + 1}-web-or-mls-418-blue-rdg-ct.jpg`),
    status: 'Under Contract',
  },
  {
    name: '830 Willowicke Dr',
    location: '830 Willowicke Dr, Lot 52',
    price: 'Available',
    stats: 'The Myrtle',
    description: "Located at 830 Willowicke Drive, this beautiful Myrtle model home offers the perfect combination of elegance and everyday livability. Featuring a well-designed open floor plan, premium finishes, a stunning kitchen with custom cabinetry, and a generous primary suite. The outdoor entertaining spaces and professional landscaping complete this exceptional property.",
    image: '/assets/active_listings/52-longview-myrtle/1-web-or-mls-830-willowicke-dr-lot-52.jpg',
    images: Array.from({length: 39}, (_, i) => `/assets/active_listings/52-longview-myrtle/${i + 1}-web-or-mls-830-willowicke-dr-lot-52.jpg`),
    status: 'Available',
  },
  {
    name: '822 Willowicke Dr',
    location: '822 Willowicke Dr',
    price: 'Under Contract',
    stats: 'The Cypress',
    description: "This gorgeous Cypress model at 822 Willowicke Drive features an expansive open-concept design with soaring ceilings, a beautifully appointed kitchen, and premium finishes throughout. The spacious primary suite, covered outdoor living areas, and professionally landscaped yard create the perfect backdrop for comfortable, luxury living.",
    image: '/assets/active_listings/54-longview-cypress/1.jpg',
    images: [
      ...Array.from({length: 10}, (_, i) => `/assets/active_listings/54-longview-cypress/${i + 1}.jpg`).filter(img => !img.endsWith('/8.jpg')),
      ...Array.from({length: 41}, (_, i) => `/assets/active_listings/54-longview-cypress/${i + 7}-web-or-mls-822-willowicke.jpg`)
        .filter(img => !img.includes('8-web') && !img.includes('10-web') && !img.includes('13-web') && !img.includes('17-web') && !img.includes('21-web') && !img.includes('31-web') && !img.includes('42-web') && !img.includes('43-web') && !img.includes('44-web') && !img.includes('45-web')),
    ],
    status: 'Under Contract',
  },
  {
    name: '513 Foxglove Ln',
    location: '513 Foxglove Ln',
    price: 'Available',
    stats: 'The Dogwood',
    description: "Welcome to 513 Foxglove Lane, a meticulously crafted Dogwood model home that exemplifies Homefront Builders' commitment to quality. This beautiful property features a grand open layout, hardwood flooring, a designer kitchen with premium appliances, and a luxurious primary retreat. Every room has been thoughtfully designed for both beauty and functionality.",
    image: '/assets/active_listings/62-longview-dogwood/1-web-or-mls-513-foxglove-ln.jpg',
    images: Array.from({length: 45}, (_, i) => `/assets/active_listings/62-longview-dogwood/${i + 1}-web-or-mls-513-foxglove-ln.jpg`),
    status: 'Available',
  },
  {
    name: '3159 Lewis Atkins Rd',
    location: '3159 Lewis Atkins Rd, Woodlawn',
    price: 'Under Contract',
    stats: 'Custom Build',
    description: "Nestled on a scenic property at 3159 Lewis Atkins Road in Woodlawn, this custom-built home delivers the perfect blend of country charm and modern luxury. Featuring a spacious open-concept design, premium finishes, a gourmet kitchen, and expansive outdoor living areas that take full advantage of the beautiful surrounding landscape.",
    image: '/assets/active_listings/3159-lewis-atkins-rd/1-web-or-mls-3159-lewis-atkins-rd.jpg',
    images: Array.from({length: 44}, (_, i) => `/assets/active_listings/3159-lewis-atkins-rd/${i + 1}-web-or-mls-3159-lewis-atkins-rd.jpg`),
    status: 'Under Contract',
  },
  {
    name: '482 Ridge Top Ct',
    location: '482 Ridge Top Ct',
    price: 'Available',
    stats: 'Custom Build',
    description: "This elegant custom home at 482 Ridge Top Court showcases exceptional design and superior construction. With an inviting open floor plan, designer kitchen, custom millwork, and a stunning primary suite, every space has been crafted to the highest standards. The beautifully landscaped grounds and outdoor entertaining areas make this property truly special.",
    image: '/assets/active_listings/482-ridge-top-ct/1-web-or-mls-482-ridge-top-ct.jpg',
    images: Array.from({length: 35}, (_, i) => `/assets/active_listings/482-ridge-top-ct/${i + 1}-web-or-mls-482-ridge-top-ct.jpg`),
    status: 'Sold',
  },
];

export default function Listings() {
  const [selectedListing, setSelectedListing] = useState<typeof listings[0] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('default');

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Helper to parse price string to number
  const getPriceNumeric = (item: typeof listings[0]) => {
    const clean = item.price.replace(/[^0-9]/g, '');
    return clean ? parseInt(clean, 10) : 0;
  };

  // Filter listings
  const filteredListings = listings.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.status === activeFilter;
  });

  // Sort status priority: Available (1) -> Coming Soon (2) -> Under Contract (3) -> Sold (4)
  const statusOrder: Record<string, number> = {
    'Available': 1,
    'Coming Soon': 2,
    'Under Contract': 3,
    'Sold': 4,
  };

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortOption === 'price-asc') {
      const priceA = getPriceNumeric(a);
      const priceB = getPriceNumeric(b);
      // Put non-priced at the end
      if (priceA === 0 && priceB !== 0) return 1;
      if (priceB === 0 && priceA !== 0) return -1;
      return priceA - priceB;
    }
    if (sortOption === 'price-desc') {
      const priceA = getPriceNumeric(a);
      const priceB = getPriceNumeric(b);
      // Put non-priced at the end
      if (priceA === 0 && priceB !== 0) return 1;
      if (priceB === 0 && priceA !== 0) return -1;
      return priceB - priceA;
    }
    
    // Default: Sort by Status priority, then stable indexing
    const orderA = statusOrder[a.status] || 99;
    const orderB = statusOrder[b.status] || 99;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    return listings.indexOf(a) - listings.indexOf(b);
  });

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="relative h-[400px] md:h-[450px] overflow-hidden">
        <img loading="lazy" decoding="async" src="/assets/DSC04388-Edit.jpg"
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
          {/* Elegant Filter & Sort Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-neutral-200">
            {/* Filter Buttons / Chips */}
            <div className="flex flex-wrap gap-2 md:gap-3">
              {['All', 'Available', 'Coming Soon', 'Under Contract', 'Sold'].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-4 md:px-5 py-2 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-sans font-semibold transition-all duration-300 ${
                    activeFilter === status
                      ? 'bg-[#1b2518] text-white border border-[#1b2518] shadow-md'
                      : 'bg-transparent text-primary/70 border border-neutral-200 hover:border-neutral-800 hover:text-primary'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            
            {/* Sorting controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <span className="text-[10px] uppercase tracking-widest text-primary/50 font-sans font-bold">Sort By</span>
              <div className="relative min-w-[180px]">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full appearance-none bg-white border border-neutral-200 hover:border-neutral-800 transition-colors pl-4 pr-10 py-2.5 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-sans font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="default">Status (Default)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/60">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
            {sortedListings.map((listing, i) => (
              <motion.div
                layout
                key={listing.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -60px 0px' }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-pointer"
                onClick={() => {
                  setSelectedListing(listing);
                  setCurrentImageIndex(0);
                }}
              >
                {/* Image Container with Info Overlay */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-lg">
                  <motion.img
                    src={listing.image}
                    alt={listing.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 flex gap-2 z-20">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase font-sans tracking-widest font-semibold backdrop-blur-md shadow-sm ${
                      listing.status === 'Available' ? 'bg-[#c9a96e] text-white' : 
                      listing.status === 'Pending' ? 'bg-black/80 text-white' : 
                      listing.status === 'Coming Soon' ? 'bg-black/80 text-white' :
                      listing.status === 'Sold' ? 'bg-red-600 text-white' :
                      'bg-white/90 text-primary'
                    }`}>
                      {listing.status}
                    </span>
                  </div>

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none z-10" />

                  {/* Info Overlay at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1.5 z-20">
                    <div className="flex justify-between items-end gap-2">
                      <h3 className="font-serif text-xl md:text-2xl text-white group-hover:text-[#c9a96e] transition-colors">{listing.name}</h3>
                      <span className="font-serif text-lg text-[#c9a96e] whitespace-nowrap">{listing.price}</span>
                    </div>
                    <p className="font-sans text-[9px] md:text-[10px] text-white/70 uppercase tracking-widest">{listing.location}</p>
                    <p className="font-sans text-[10px] md:text-xs text-white/90 italic">{listing.stats}</p>
                    
                    <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-center opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500">
                      <span className="text-[10px] font-sans tracking-widest uppercase text-white font-bold">View Full Details</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#c9a96e] transform lg:translate-x-[-10px] lg:group-hover:translate-x-0 transition-transform">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </div>
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

              {/* Media Section */}
              <div className="flex flex-col md:flex-row bg-black overflow-hidden border-b border-gray-200">
                {/* Left 2/3: Image Gallery & Thumbnails */}
                <div className="w-full md:w-2/3 relative flex flex-col">
                  {/* Main Large Image */}
                  <div className="relative aspect-video flex-1 flex items-center justify-center bg-black overflow-hidden group">
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
                  </div>
                  
                  {/* Thumbnail Row (4 at a time) */}
                  {selectedListing.images.length > 1 && (
                    <div className="flex bg-neutral-900 p-2 gap-2 overflow-x-auto snap-x hide-scrollbar">
                      {selectedListing.images.map((imgSrc, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative flex-none w-[calc(25%-0.375rem)] aspect-[4/3] cursor-pointer rounded overflow-hidden snap-center ${idx === currentImageIndex ? 'ring-2 ring-[#c9a96e]' : 'opacity-40 hover:opacity-100 transition-opacity'}`}
                        >
                          <img src={imgSrc} loading="lazy" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right 1/3: Vertical Video */}
                <div className="w-full md:w-1/3 bg-[#0a0a0a] flex flex-col border-t md:border-t-0 md:border-l border-neutral-800">
                  {selectedListing.video ? (
                    selectedListing.video.includes('youtube.com') || selectedListing.video.includes('youtu.be') ? (
                      <iframe 
                        src={`https://www.youtube.com/embed/${getYouTubeId(selectedListing.video)}`} 
                        title="YouTube video player"
                        frameBorder="0"
                        className="w-full h-full min-h-[50vh] md:min-h-[60vh] object-cover"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                      />
                    ) : (
                      <video 
                        src={selectedListing.video} 
                        controls 
                        controlsList="nodownload"
                        className="w-full h-full object-contain max-h-[50vh] md:max-h-[60vh]"
                      />
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-600 font-sans text-sm p-10 text-center">
                      No video tour available for this property
                    </div>
                  )}
                </div>
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
