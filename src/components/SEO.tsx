import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Homefront Builders';
const BASE_URL = 'https://www.homefrontbuilderstn.com';

interface SEOProps {
  title: string;
  description: string;
  path: string;
  schema?: object | object[];
  /** Social share image (site-relative path). Defaults to the site-wide og-image.jpg. */
  image?: string;
  imageAlt?: string;
  /** Pixel size of a custom `image`, when known (the default image is 1200x630). */
  imageWidth?: number;
  imageHeight?: number;
  /** 'article' adds article:published_time / modified_time. */
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  /** Breadcrumb trail between Home and this page, e.g. [{ name: 'Blog', path: '/blog' }]. */
  parents?: { name: string; path: string }[];
}

export default function SEO({
  title,
  description,
  path,
  schema,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  type = 'website',
  publishedTime,
  modifiedTime,
  parents = [],
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonical = `${BASE_URL}${path}`;

  const breadcrumbSchema = path !== '/' ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { name: 'Home', item: BASE_URL },
      ...parents.map((p) => ({ name: p.name, item: `${BASE_URL}${p.path}` })),
      { name: title.split('—')[0].trim(), item: canonical },
    ].map((crumb, i) => ({ "@type": "ListItem", "position": i + 1, ...crumb }))
  } : null;

  const ogImage = `${BASE_URL}${image ?? '/og-image.jpg'}`;
  const ogImageAlt = imageAlt ?? 'A luxury custom home built by Homefront Builders in Clarksville, TN';

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
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:image" content={ogImage} />
      {(image ? imageWidth : 1200) && <meta property="og:image:width" content={String(image ? imageWidth : 1200)} />}
      {(image ? imageHeight : 630) && <meta property="og:image:height" content={String(image ? imageHeight : 630)} />}
      <meta property="og:image:alt" content={ogImageAlt} />
      {type === 'article' && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {type === 'article' && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}
