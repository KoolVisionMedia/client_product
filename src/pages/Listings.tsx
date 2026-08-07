import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const listings = [
  {
    name: '5 Pace Road',
    location: '5 Pace Road',
    price: 'Coming Soon',
    stats: 'Under Construction',
    description: "Welcome to 5 Pace Road. This upcoming luxury property is currently under construction and will feature the highest standards of architectural design and premium craftsmanship. Stay tuned for full details, video tours, and a complete gallery as we progress toward completion.",
    // Progress photos, newest first. New drops go at the top of this list.
    // `image` is the card thumbnail (-card.jpg); `images` stays full resolution.
    image: '/assets/active_listings/5-pace-rd/progress-1-card.jpg',
    images: [
      '/assets/active_listings/5-pace-rd/progress-1.jpg',
      '/assets/active_listings/5-pace-rd/progress-2.jpg',
      '/assets/active_listings/5-pace-rd/progress-3.jpg',
      '/assets/active_listings/5-pace-rd/progress-4.jpg',
    ],
    status: 'Coming Soon',
  },
  {
    name: '1 Pace Rd',
    location: '1 Pace Rd',
    price: 'Coming Soon',
    stats: 'Under Construction',
    description: "1 Pace Road is currently under construction, with framing and roofing complete and exterior work underway. Follow the build from foundation to today — built to the same standards of architectural design and premium craftsmanship as every Homefront Builders home. Full details, specifications, and a complete gallery will follow as the build progresses.",
    // Gallery = most current shot first, then the build story in order (foundation -> framing),
    // each stage led by its top-down aerial. When new progress photos arrive, the newest
    // becomes the hero at position 1 and the previous stages follow behind it.
    image: '/assets/active_listings/1-pace-rd/stage2-framing-5-card.jpg',
    images: [
      '/assets/active_listings/1-pace-rd/stage2-framing-5.jpg',
      '/assets/active_listings/1-pace-rd/stage1-foundation-1.jpg',
      '/assets/active_listings/1-pace-rd/stage1-foundation-2.jpg',
      '/assets/active_listings/1-pace-rd/stage1-foundation-3.jpg',
      '/assets/active_listings/1-pace-rd/stage1-foundation-4.jpg',
      '/assets/active_listings/1-pace-rd/stage1-foundation-5.jpg',
      '/assets/active_listings/1-pace-rd/stage2-framing-1.jpg',
      '/assets/active_listings/1-pace-rd/stage2-framing-2.jpg',
      '/assets/active_listings/1-pace-rd/stage2-framing-3.jpg',
      '/assets/active_listings/1-pace-rd/stage2-framing-4.jpg',
    ],
    status: 'Coming Soon',
  },
  {
    name: '23 Pace Rd',
    location: '23 Pace Rd',
    price: 'Coming Soon',
    stats: 'Under Construction',
    description: "23 Pace Road is currently under construction, with the exterior nearly complete. Follow the build from foundation to today — built to the same standards of architectural design and premium craftsmanship as every Homefront Builders home. Full details, specifications, and a complete gallery will follow as the build progresses.",
    // Gallery = most current shot first, then the build story led by its top-down aerial.
    image: '/assets/active_listings/23-pace-rd/stage2-exterior-1-card.jpg',
    images: [
      '/assets/active_listings/23-pace-rd/stage2-exterior-1.jpg',
      '/assets/active_listings/23-pace-rd/stage1-foundation-1.jpg',
      '/assets/active_listings/23-pace-rd/stage1-foundation-2.jpg',
      '/assets/active_listings/23-pace-rd/stage1-foundation-3.jpg',
    ],
    status: 'Coming Soon',
  },
  {
    name: '2 Pace Rd, Lot 2',
    location: 'Holders Ridge, Clarksville TN 37043',
    price: '$1,200,000',
    // Floor plan not yet chosen — no bed/bath/sqft until it is.
    stats: '2.10 Acres',
    description: "An exceptional to-be-built custom estate in the Holders Ridge community, 2 Pace Road (Lot 2) sits on a generous 2.10-acre homesite in Montgomery County. The floor plan for this Homefront Builders new construction hasn't been selected yet — reach out and our team will walk you through the layouts, finishes, and timeline. (MLS# 3159639 · representative photo)",
    image: '/assets/to-be-built-bg.jpg',
    images: ['/assets/to-be-built-bg.jpg'],
    status: 'Coming Soon',
  },
  {
    name: '4 Pace Rd, Lot 4',
    location: 'Holders Ridge, Clarksville TN 37043',
    price: '$1,079,900',
    // Floor plan not yet chosen — no bed/bath/sqft until it is.
    stats: '1.85 Acres',
    description: "Now to be built in the sought-after Holders Ridge community, 4 Pace Road (Lot 4) sits on a 1.85-acre lot in Montgomery County. The floor plan hasn't been selected yet — reach out and our team will walk you through the layouts, finishes, and timeline. Built by Homefront Builders with the high-end finishes and superior craftsmanship the team is known for. Estimated completion December 2026. (MLS# 3158985 · representative photo)",
    image: '/assets/to-be-built-bg.jpg',
    images: ['/assets/to-be-built-bg.jpg'],
    status: 'Coming Soon',
  },
  {
    name: '3 Pace Rd',
    location: 'Holders Ridge, Clarksville TN 37043',
    price: '$799,900',
    // Floor plan not yet chosen — no bed/bath/sqft until it is.
    stats: '2.41 Acres',
    description: "To be built in the sought-after Holders Ridge community, 3 Pace Road sits on a private 2.41-acre homesite in Montgomery County. The floor plan hasn't been selected yet — reach out and our team will walk you through the layouts, finishes, and timeline. This Homefront Builders new construction blends premium craftsmanship with functional, modern living. Estimated completion December 2026. (MLS# 3152353 · representative photo)",
    image: '/assets/to-be-built-bg.jpg',
    images: ['/assets/to-be-built-bg.jpg'],
    status: 'Coming Soon',
  },
  {
    name: '0 Keystone Drive, Lot 2',
    location: 'Pleasant View, TN 37146',
    price: '$1,179,000',
    // Floor plan not yet chosen — no bed/bath/sqft until it is.
    stats: 'To Be Built',
    description: "Luxury new construction to be built in the Laurel Grove neighborhood of Pleasant View. The floor plan hasn't been selected yet — reach out and our team will walk you through the layouts, finishes, and timeline. Built by Homefront Builders with premium finishes throughout.",
    image: '/assets/to-be-built-bg.jpg',
    images: ['/assets/to-be-built-bg.jpg'],
    status: 'Coming Soon',
  },
  {
    name: '24 Solitude Way',
    location: '24 Solitude Way',
    price: '$1,150,000',
    stats: '5 Bed • 4.5 Bath • 4,200 SqFt',
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
    stats: '5 Bed • 5 Bath • 4,800 SqFt',
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
    stats: '4 Bed • 2 Bath • 2,650 SqFt • The Cypress',
    description: "A beautifully crafted Cypress model home at 1215 Hill Lane. This stunning property features an open-concept living space with premium finishes, a spacious chef's kitchen, elegant primary suite, and thoughtfully designed outdoor areas. Every detail reflects the hallmark quality and craftsmanship that Homefront Builders is known for.",
    image: '/assets/active_listings/1215-hill-ln/1-web-or-mls-1215-hill-ln.jpg',
    images: Array.from({length: 51}, (_, i) => `/assets/active_listings/1215-hill-ln/${i + 1}-web-or-mls-1215-hill-ln.jpg`),
    status: 'Under Contract',
  },
  {
    name: '1177 Gholson Rd',
    location: '1177 Gholson Rd',
    price: 'Available',
    stats: '4 Bed • 2.5 Bath • 2,600 SqFt • The Dogwood',
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
    stats: '4 Bed • 3.5 Bath • 2,860 SqFt • The Harmony',
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
    stats: '5 Bed • 3 Bath • 2,650 SqFt • The Magnolia',
    description: "This remarkable Magnolia model at 418 Blue Ridge Court is a true showpiece. Featuring an elegant open floor plan, designer finishes, custom lighting, and a gourmet kitchen with oversized island. The thoughtfully designed living spaces flow seamlessly, creating an atmosphere of refined luxury throughout. An impeccably built home with attention to every detail.",
    image: '/assets/active_listings/44-longview-magnolia/1-web-or-mls-418-blue-rdg-ct.jpg',
    images: Array.from({length: 50}, (_, i) => `/assets/active_listings/44-longview-magnolia/${i + 1}-web-or-mls-418-blue-rdg-ct.jpg`),
    status: 'Under Contract',
  },
  {
    name: '830 Willowicke Dr',
    location: '830 Willowicke Dr, Lot 52',
    price: 'Available',
    stats: '4 Bed • 2 Bath • 1,900 SqFt • The Myrtle',
    description: "Located at 830 Willowicke Drive, this beautiful Myrtle model home offers the perfect combination of elegance and everyday livability. Featuring a well-designed open floor plan, premium finishes, a stunning kitchen with custom cabinetry, and a generous primary suite. The outdoor entertaining spaces and professional landscaping complete this exceptional property.",
    image: '/assets/active_listings/52-longview-myrtle/1-web-or-mls-830-willowicke-dr-lot-52.jpg',
    images: Array.from({length: 39}, (_, i) => `/assets/active_listings/52-longview-myrtle/${i + 1}-web-or-mls-830-willowicke-dr-lot-52.jpg`),
    status: 'Available',
  },
  {
    name: '822 Willowicke Dr',
    location: '822 Willowicke Dr',
    price: 'Under Contract',
    stats: '4 Bed • 2 Bath • 2,650 SqFt • The Cypress',
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
    stats: '4 Bed • 2.5 Bath • 2,600 SqFt • The Dogwood',
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

const SITE = 'https://www.homefrontbuilderstn.com';

// Pull bed / bath / sqft back out of the `stats` string so structured data can
// only ever describe what the page actually shows. Lots with no plan chosen yet
// have no numbers in `stats`, so they correctly emit none.
function parseStats(stats: string) {
  const beds = stats.match(/([\d.]+)\s*Bed/i);
  const baths = stats.match(/([\d.]+)\s*Bath/i);
  const sqft = stats.match(/([\d,]+)\s*SqFt/i);
  return {
    ...(beds ? { numberOfBedrooms: Number(beds[1]) } : {}),
    ...(baths ? { numberOfBathroomsTotal: Number(baths[1]) } : {}),
    ...(sqft ? { floorSize: { '@type': 'QuantitativeValue', value: Number(sqft[1].replace(/,/g, '')), unitCode: 'FTK' } } : {}),
  };
}

// Alt text is what image search reads. Build one that names the property, the
// build stage and the builder rather than repeating the address on every frame.
function galleryAlt(listing: typeof listings[0], index: number) {
  const file = listing.images[index] ?? '';
  const stage = /foundation/.test(file) ? 'foundation stage'
    : /framing/.test(file) ? 'framing and roofing stage'
    : /exterior/.test(file) ? 'exterior nearing completion'
    : /progress/.test(file) ? 'construction progress'
    : 'completed home';
  return `${listing.name} — ${stage}, a custom home by Homefront Builders in Clarksville, TN (photo ${index + 1} of ${listing.images.length})`;
}

const listingsSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Custom Home Listings by Homefront Builders',
    description: 'Active and completed luxury custom homes built by Homefront Builders in Clarksville and Middle Tennessee.',
    numberOfItems: listings.length,
    itemListElement: listings.map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'SingleFamilyResidence',
        name: l.name,
        description: l.description,
        image: `${SITE}${l.image}`,
        url: `${SITE}/listings`,
        address: {
          '@type': 'PostalAddress',
          // `name` is the street address; `location` is the community, which
          // is where the town and ZIP live when they're known.
          streetAddress: l.name,
          addressLocality: /pleasant view/i.test(l.location) ? 'Pleasant View'
            : /woodlawn/i.test(l.location) ? 'Woodlawn'
            : 'Clarksville',
          addressRegion: 'TN',
          ...(l.location.match(/\b(\d{5})\b/) ? { postalCode: l.location.match(/\b(\d{5})\b/)![1] } : {}),
          addressCountry: 'US',
        },
        ...parseStats(l.stats),
      },
    })),
  },
];

// Inquiry CTA shown at the bottom of each listing's detail modal.
// - Builds in progress: an inline lead form (name/email/phone) -> Web3Forms, so
//   leads land in the same inbox as the rest of the site's forms.
// - Everything else: a prominent button linking to the contact page.
function ListingInquiry({ listing }: { listing: typeof listings[0] }) {
  const isBuildInProgress = listing.status === 'Coming Soon' || listing.status === 'Under Construction';
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isBuildInProgress) {
    return (
      <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-5 bg-[#F4F3F0] rounded-2xl p-6 md:p-8">
        <div className="text-center sm:text-left">
          <h3 className="font-serif text-xl md:text-2xl text-primary mb-1">Have questions about this home?</h3>
          <p className="font-sans text-sm text-primary/60">Our team is happy to walk you through the details.</p>
        </div>
        <Link
          to="/contact-us"
          onClick={() => window.scrollTo(0, 0)}
          className="shrink-0 inline-flex items-center gap-2 bg-[#1b2518] text-white px-7 py-4 rounded-full font-sans text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#c9a96e] transition-colors"
        >
          Have Questions About a Build?
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    const data = new FormData(e.currentTarget);
    data.append('access_key', '6734d3d0-0e39-4112-b5b6-3247d6699948');
    data.append('subject', `Listing Inquiry: ${listing.name}`);
    data.append('from_name', 'Homefront Builders Website');
    data.append('Property', `${listing.name} — ${listing.location}`);
    const email = data.get('email');
    if (email) data.append('replyto', email as string);
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const result = await res.json();
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('A network error occurred. Please try again.');
    }
  };

  return (
    <div className="mt-10 pt-8 border-t border-gray-200">
      <div className="bg-[#1b2518] rounded-2xl p-8 md:p-10 text-white">
        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-[#c9a96e]/15 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl mb-2">Thank you!</h3>
            <p className="font-sans text-sm text-white/70 max-w-sm mx-auto">We've received your inquiry about {listing.name} and our team will reach out shortly.</p>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#c9a96e] mb-3">Still Being Built</p>
            <h3 className="font-serif text-2xl md:text-3xl mb-2">Have questions about {listing.name}?</h3>
            <p className="font-sans text-sm text-white/70 mb-7 max-w-xl">Leave your details and our team will reach out with pricing, timelines, floor plans, and answers to anything you'd like to know about this home.</p>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" required placeholder="Your Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 font-sans text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#c9a96e] transition-colors" />
              <input type="email" name="email" required placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 font-sans text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#c9a96e] transition-colors" />
              <input type="tel" name="phone" required placeholder="Phone Number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 font-sans text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#c9a96e] transition-colors" />
              <input type="text" name="question" placeholder="Your question (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 font-sans text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#c9a96e] transition-colors" />
              <button type="submit" disabled={status === 'loading'} className="md:col-span-2 mt-1 bg-[#c9a96e] text-[#1b2518] font-sans font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-white transition-colors disabled:opacity-60">
                {status === 'loading' ? 'Sending...' : 'Ask About This Home'}
              </button>
              {status === 'error' && (
                <p className="md:col-span-2 text-sm text-red-300 text-center">{errorMsg}</p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function Listings() {
  useEffect(() => {
    document.title = "Current Builds | Homefront Builders";
  }, []);

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
    if (activeFilter === 'Completed Builds') {
      return item.status !== 'Coming Soon' && item.status !== 'Under Construction';
    }
    if (activeFilter === 'Builds in Progress') {
      return item.status === 'Coming Soon' || item.status === 'Under Construction';
    }
    return item.status === activeFilter;
  });

  // Sort status priority: Builds in Progress (Coming Soon/Under Construction) (1) -> Available (2) -> Under Contract (3) -> Sold (4)
  const statusOrder: Record<string, number> = {
    'Coming Soon': 1,
    'Under Construction': 1,
    'Available': 2,
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
      <SEO
        title="Custom Home Listings in Clarksville, TN"
        description="Browse active custom home listings in Clarksville, TN from Homefront Builders. Luxury new construction available now in Middle Tennessee."
        path="/listings"
        schema={listingsSchema}
      />
      {/* Hero Header */}
      <section className="relative h-[400px] md:h-[450px] overflow-hidden">
        <img fetchPriority="high" decoding="async" src="/assets/DSC04388-Edit.webp"
          alt="Luxury custom home built by Homefront Builders in Clarksville, Tennessee"
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
              Current Builds
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 md:py-32 px-4 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          {/* Elegant Filter & Sort Bar */}
          {/* Elegant Filter Bar */}
          <div className="flex flex-wrap gap-2 md:gap-3 mb-12 pb-8 border-b border-neutral-200">
            {['All', 'Completed Builds', 'Builds in Progress'].map((status) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
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
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
                  <motion.img
                    src={listing.image}
                    alt={`${listing.name} — ${listing.stats === 'Under Construction' || listing.stats === 'To Be Built' ? listing.stats.toLowerCase() : listing.stats.replace(/ • /g, ', ')} custom home by Homefront Builders in ${/pleasant view/i.test(listing.location) ? 'Pleasant View' : 'Clarksville'}, TN`}
                    // Cards render ~350px wide; only the first row is above the fold, so
                    // everything after it defers. Keeps the grid off the critical path.
                    loading={i < 3 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                  
                  {/* Status Badge */}
                  {(listing.status === 'Coming Soon' || listing.status === 'Under Construction') && (
                    <div className="absolute top-4 left-4 flex gap-2 z-20">
                      <span className="px-4 py-1.5 rounded-full text-[9px] uppercase font-sans tracking-widest font-semibold bg-[#c9a96e] text-white shadow-sm">
                        Build in Progress
                      </span>
                    </div>
                  )}

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none z-10" />

                  {/* Info Overlay at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1.5 z-20">
                    <div className="flex justify-between items-end gap-2">
                      <h3 className="font-serif text-xl md:text-2xl text-white group-hover:text-[#c9a96e] transition-colors">{listing.name}</h3>
                    </div>
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
                        alt={galleryAlt(selectedListing, currentImageIndex)}
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
                          <img
                            src={imgSrc}
                            alt={galleryAlt(selectedListing, idx)}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
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
                    {(selectedListing.status === 'Coming Soon' || selectedListing.status === 'Under Construction') && (
                      <span className="inline-block px-3 py-1 bg-[#c9a96e] text-white text-[10px] uppercase tracking-widest font-bold rounded-full mb-4">
                        Build in Progress
                      </span>
                    )}
                    <h2 className="text-3xl md:text-5xl font-serif text-primary mb-2">{selectedListing.name}</h2>
                    <p className="text-primary/60 font-sans tracking-wide uppercase text-sm">{selectedListing.location}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-sans font-medium text-primary/80">{selectedListing.stats}</p>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none prose-headings:font-serif prose-p:text-primary/70 prose-p:leading-relaxed">
                  <h3 className="text-xl font-serif text-primary mb-4">About this Property</h3>
                  <p>{selectedListing.description}</p>
                </div>

                <ListingInquiry key={selectedListing.name} listing={selectedListing} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
