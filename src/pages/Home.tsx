import Hero from '../components/Hero';
import About from '../components/About';
import CoreValues from '../components/CoreValues';
import Process from '../components/Process';
import Portfolio from '../components/Portfolio';
import CustomCare from '../components/CustomCare';
import StayConnected from '../components/StayConnected';
import ScrollThreadLine from '../components/ScrollThreadLine';
import SEO from '../components/SEO';
import TopoField from '../components/ui/topo-field';
import RusticPinesIntro from '../components/RusticPinesIntro';
import { RUSTIC_PINES_LIVE } from '../data/rusticPinesLaunch';
import { RUSTIC_PINES_PROMO } from '../data/rusticPinesPromo';
import { BUSINESS, SITE, WEBSITE } from '../data/business';

// The business and the website, defined once in src/data/business.ts.
const localBusinessSchema = { '@context': 'https://schema.org', ...BUSINESS };
const websiteSchema = { '@context': 'https://schema.org', ...WEBSITE };



// The Rustic Pines promo film in the announcement section, described for
// search (Google video results / video carousels). Only emitted once the film
// files are in place and the Rustic Pines page is live.
const rusticPinesPromoSchema = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "@id": `${SITE}/#rustic-pines-promo`,
  "name": RUSTIC_PINES_PROMO.title,
  "description": RUSTIC_PINES_PROMO.description,
  "thumbnailUrl": [`${SITE}${RUSTIC_PINES_PROMO.thumbnailJpg}`],
  "uploadDate": RUSTIC_PINES_PROMO.uploadDate,
  "duration": RUSTIC_PINES_PROMO.duration,
  "contentUrl": `${SITE}${RUSTIC_PINES_PROMO.src1080}`,
  "width": RUSTIC_PINES_PROMO.width,
  "height": RUSTIC_PINES_PROMO.height,
  "inLanguage": "en-US",
  "isFamilyFriendly": true,
  "publisher": { "@id": `${SITE}/#business` },
  "about": {
    "@type": "Place",
    "name": "Rustic Pines at Paris Landing",
    "url": `${SITE}/rustic-pines`,
    "containedInPlace": { "@type": "AdministrativeArea", "name": "Stewart County, Tennessee" }
  }
};
const homeSchema =
  RUSTIC_PINES_LIVE && RUSTIC_PINES_PROMO.filmReady
    ? [localBusinessSchema, websiteSchema, rusticPinesPromoSchema]
    : [localBusinessSchema, websiteSchema];

export default function Home() {
  return (
    <div className="relative">
      <SEO
        title="Custom Home Builders in Clarksville, TN"
        description="Luxury custom home builder in Clarksville, TN: 20+ years of experience, transparent budgets, weekly build updates, a 10-year warranty. (931) 221-2566."
        path="/"
        schema={homeSchema}
      />
      <Hero />
      {/* Below-hero region: the scroll thread line lives here so it starts at
          the hero/About seam and sits BEHIND the section content (-z-10 within
          this isolated stacking context; the sections are transparent so the
          shared page background reveals the thread). */}
      <div className="relative isolate">
        <ScrollThreadLine />
        <About />
        {/* Rustic Pines announcement. Follows the same launch switch as the
            /rustic-pines page so it never points at a hidden page. The scroll
            thread routes its own curve through it (see ScrollThreadLine). */}
        {RUSTIC_PINES_LIVE && <RusticPinesIntro />}
        <CoreValues />
        <Process />
        {/* Topographic background behind "Featured Floor Plans" (Portfolio) only.
            The canvas is one viewport tall and sticky, so it stays put like a fixed backdrop
            while this stretch scrolls (a canvas spanning several screens would be far too
            costly to shade). -z-20 keeps it under the thread line (-z-10); the gradients
            fade it into the plain page background where the stretch starts and ends. */}
        <div className="relative">
          <div className="absolute inset-0 -z-20 pointer-events-none">
            <div className="sticky top-0 h-screen">
              <TopoField mode="light" paperColor="#FAFAF5" inkColor="#2E362C" opacity={0.35} />
            </div>
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-surface to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-surface to-transparent" />
          </div>
          <Portfolio />
        </div>
        <CustomCare />
        <StayConnected />
      </div>
    </div>
  );
}
