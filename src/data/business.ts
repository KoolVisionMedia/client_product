/**
 * The business, as structured data (schema.org). One definition, used by every
 * page that describes the business (home, contact), so name / phone / email /
 * area served / hours can never drift apart between pages. Other pages point at
 * it by its @id.
 *
 * Facts here must match what the site says (address and map pin: the contact
 * page's location map). Not included until confirmed by the client: a founding
 * year and named founders.
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
  // The office location shown on the contact page's map (ContactSection.tsx).
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1811 Memorial Cir',
    addressLocality: 'Clarksville',
    addressRegion: 'TN',
    postalCode: '37043',
    addressCountry: 'US',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 36.515362, longitude: -87.310433 },
  hasMap: 'https://www.google.com/maps/place/?q=place_id:ChIJwVyv3y2CFIERnnSRyihCJmo',
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
