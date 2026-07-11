import Hero from '../components/Hero';
import About from '../components/About';
import CoreValues from '../components/CoreValues';
import Process from '../components/Process';
import Portfolio from '../components/Portfolio';
import CustomCare from '../components/CustomCare';
import StayConnected from '../components/StayConnected';
import ScrollThreadLine from '../components/ScrollThreadLine';
import SEO from '../components/SEO';

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "Homefront Builders",
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
      <ScrollThreadLine />
      <Hero />
      <About />
      <CoreValues />
      <Process />
      <Portfolio />
      <CustomCare />
      <StayConnected />
    </div>
  );
}
