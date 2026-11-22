/**
 * The business, as structured data (schema.org). One definition, used by every
 * page that describes the business (home, contact), so name / phone / email /
 * area served / hours can never drift apart between pages. Other pages point at
 * it by its @id.
 *
 * Facts here must match what the site says. Not included until confirmed by
 * the client: a street address (the site publishes none, so this reads as a
 * service-area business), a founding year, and named founders.
 */
export const SITE = 'https://www.homefrontbuilderstn.com';
export const BUSINESS_ID = `${SITE}/#business`;
export const WEBSITE_ID = `${SITE}/#website`;

export const BUSINESS = {
  '@type': 'HomeAndConstructionBusiness',
  '@id': BUSINESS_ID,
  name: 'Homefront Builders',
  url: SITE,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE}/logo-main.png`,
    width: 1500,
    height: 591,
  },
  image: `${SITE}/og-image.jpg`,
  description:
    'Luxury custom home builder in Clarksville, TN and Middle Tennessee with 20+ years of experience: custom homes, ready-to-build floor plans, transparent budgeting, and a 10-year Quality Builders Warranty backed by Liberty Mutual.',
  telephone: '+1-931-221-2566',
  email: 'homefrontsalesTN@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Clarksville',
    addressRegion: 'TN',
    addressCountry: 'US',
  },
  areaServed: [
    { '@type': 'City', name: 'Clarksville, Tennessee' },
    { '@type': 'AdministrativeArea', name: 'Montgomery County, Tennessee' },
    { '@type': 'AdministrativeArea', name: 'Stewart County, Tennessee' },
    { '@type': 'AdministrativeArea', name: 'Middle Tennessee' },
  ],
  knowsAbout: [
    'Custom home building',
    'New construction homes',
    'Luxury custom homes',
    'Home floor plans',
    'Choosing land for a custom home',
    'Home warranties',
  ],
  priceRange: '$$$',
  openingHours: 'Mo-Fr 08:00-17:00',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    telephone: '+1-931-221-2566',
    email: 'homefrontsalesTN@gmail.com',
    areaServed: 'US-TN',
    availableLanguage: 'English',
  },
  sameAs: [
    'https://www.facebook.com/HomeFrontBuilderstn/',
    'https://www.instagram.com/homefrontbuilderstn/',
    'https://www.tiktok.com/@homefront.builder',
  ],
};

export const WEBSITE = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE,
  name: 'Homefront Builders',
  inLanguage: 'en-US',
  publisher: { '@id': BUSINESS_ID },
};
