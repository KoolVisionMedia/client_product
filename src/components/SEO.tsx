import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Homefront Builders';
const BASE_URL = 'https://www.homefrontbuilderstn.com';

interface SEOProps {
  title: string;
  description: string;
  path: string;
  schema?: object | object[];
}

export default function SEO({ title, description, path, schema }: SEOProps) {
  const fullTitle = path === '/'
    ? `${title} | ${SITE_NAME}`
    : `${title} | ${SITE_NAME}`;
  const canonical = `${BASE_URL}${path}`;

  const breadcrumbSchema = path !== '/' ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": BASE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": title.split('—')[0].trim(),
        "item": canonical
      }
    ]
  } : null;

  const schemas = [
    ...(schema ? (Array.isArray(schema) ? schema : [schema]) : []),
    ...(breadcrumbSchema ? [breadcrumbSchema] : [])
  ];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:image" content={`${BASE_URL}/og-image.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="A luxury custom home built by Homefront Builders in Clarksville, TN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${BASE_URL}/og-image.jpg`} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}
