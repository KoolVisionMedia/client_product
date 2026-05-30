import Hero from '../components/Hero';
import About from '../components/About';
import CoreValues from '../components/CoreValues';
import Process from '../components/Process';
import Portfolio from '../components/Portfolio';
import CustomCare from '../components/CustomCare';
import StayConnected from '../components/StayConnected';
import SEO from '../components/SEO';

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "Homefront Builders",
  "description": "Luxury custom home builder in Clarksville, TN and Middle Tennessee. Specializing in high-end custom home construction with transparent budgeting and superior craftsmanship.",
  "url": "https://www.homefrontbuilders.com",
  "telephone": "(555) 123-4567",
  "email": "info@homefrontbuilders.com",
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
  "sameAs": []
};

export default function Home() {
  return (
    <>
      <SEO
        title="Custom Home Builder in Clarksville, TN"
        description="Homefront Builders crafts luxury custom homes in Clarksville, TN and Middle Tennessee. Transparent budgeting, superior craftsmanship, and 20+ years of expertise. Start your build today."
        path="/"
        schema={localBusinessSchema}
      />
      <Hero />
      <About />
      <CoreValues />
      <Process />
      <Portfolio />
      <CustomCare />
      <StayConnected />
    </>
  );
}
