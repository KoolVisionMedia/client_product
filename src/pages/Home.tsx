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

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  // Stable @id so every other page can point at this one business entity
  // instead of declaring competing copies of it.
  "@id": "https://www.homefrontbuilderstn.com/#business",
  "name": "Homefront Builders",
  "logo": "https://www.homefrontbuilderstn.com/logo-main.png",
  "image": "https://www.homefrontbuilderstn.com/og-image.jpg",
  "description": "Luxury custom home builders in Clarksville, TN and Middle Tennessee. Specializing in high-end custom home construction with transparent budgeting and superior craftsmanship.",
  "url": "https://www.homefrontbuilderstn.com",
  "telephone": "(931) 221-2566",
  "email": "homefrontsalesTN@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Clarksville",
    "addressRegion": "TN",
    "addressCountry": "US"
  },
  "areaServed": [
    { "@type": "City", "name": "Clarksville" },
    { "@type": "State", "name": "Tennessee" },
    { "@type": "AdministrativeArea", "name": "Middle Tennessee" }
  ],
  "priceRange": "$$$",
  "openingHours": "Mo-Fr 08:00-17:00",
  "sameAs": [
    "https://www.facebook.com/HomeFrontBuilderstn/",
    "https://www.instagram.com/homefrontbuilderstn/",
    "https://www.tiktok.com/@homefront.builder"
  ]
};

export default function Home() {
  return (
    <div className="relative">
      <SEO
        title="Custom Home Builders in Clarksville, TN"
        description="Homefront Builders — luxury custom home builders in Clarksville, TN with 20+ years of expertise. Transparent budgeting, weekly build updates, and superior craftsmanship. Call (931) 221-2566."
        path="/"
        schema={localBusinessSchema}
      />
      <Hero />
      {/* Below-hero region: the scroll thread line lives here so it starts at
          the hero/About seam and sits BEHIND the section content (-z-10 within
          this isolated stacking context; the sections are transparent so the
          shared page background reveals the thread). */}
      <div className="relative isolate">
        <ScrollThreadLine />
        <About />
        {/* Topographic background behind "The Homefront Process" (CoreValues) only.
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
          <CoreValues />
        </div>
        <Process />
        <Portfolio />
        <CustomCare />
        <StayConnected />
      </div>
    </div>
  );
}
