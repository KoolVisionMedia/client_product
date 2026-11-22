// Blog post metadata. Article bodies live in ./blogArticles.ts, keyed by slug.
//
// Each post is published at /blog/<slug> (prerendered, in the sitemap and llms.txt — see
// prerender.mjs). The list is sorted newest-first by `published`, so a new post takes the
// featured slot automatically: add it here and its body in blogArticles.ts, nothing else.

export interface BlogPost {
  slug: string;
  title: string;
  /** Shorter <title> for search results; falls back to `title`. */
  seoTitle?: string;
  /** Card excerpt and meta description (~155 characters). */
  excerpt: string;
  /** Display date shown on the card. */
  date: string;
  /** ISO publish date (YYYY-MM-DD): drives ordering, schema and the sitemap. */
  published: string;
  /** ISO date of the last substantive edit, if any. */
  updated?: string;
  category: string;
  image: string;
  keywords?: string[];
}

const posts: BlogPost[] = [
  {
    slug: 'buying-land-to-build-a-house-in-tennessee',
    title: 'Buying Land to Build a House in Tennessee: 7 Hidden Lot Costs to Check Before You Close',
    seoTitle: 'Buying Land to Build a House in Tennessee: Hidden Lot Costs',
    excerpt:
      'Buying land to build on in Tennessee? Septic soil tests, wells, power, driveways and clearing can add $30K–$100K. Here’s what to check before you close.',
    date: 'November 22, 2026',
    published: '2026-11-22',
    category: 'Guides',
    image: '/assets/rustic-pines/hero-1400.webp',
    keywords: [
      'buying land to build a house in Tennessee',
      'lot prep costs Tennessee',
      'septic permit Tennessee',
      'perc test Tennessee',
      'well drilling cost Tennessee',
      'building on acreage Middle Tennessee',
      'Stewart County land',
    ],
  },
  {
    slug: 'how-to-choose-a-custom-home-builder-clarksville-tn',
    title: 'How to Choose a Custom Home Builder in Clarksville, TN: Questions to Ask and Red Flags to Watch',
    seoTitle: 'How to Choose a Custom Home Builder in Clarksville, TN',
    excerpt:
      "Comparing home builders in Clarksville? Here's how to verify a Tennessee contractor license in thirty seconds, the six questions that actually reveal something, and the red flags that predict a difficult build.",
    date: 'August 1, 2026',
    published: '2026-08-01',
    category: 'Guides',
    image: '/assets/beyond-the-build.webp',
  },
  {
    slug: 'luxury-custom-home-features-middle-tennessee',
    title: 'Luxury Custom Home Features Worth Every Penny in Middle Tennessee',
    excerpt:
      'When building a luxury custom home in Middle Tennessee, some upgrades deliver outsized returns — in daily enjoyment and resale value. Here are the ones our clients love most.',
    date: 'July 1, 2026',
    published: '2026-07-01',
    category: 'Design Trends',
    image: '/assets/Magnolia.jpg',
  },
  {
    slug: 'new-construction-homes-clarksville-tn-2026',
    title: 'New Construction Homes in Clarksville, TN: What to Expect in 2026',
    excerpt:
      "Clarksville's housing market continues to grow. Here's what buyers and families should know about new construction timelines, costs, and the custom build process in 2026.",
    date: 'June 20, 2026',
    published: '2026-06-20',
    category: 'Market Insights',
    image: '/assets/Cypress.jpg',
  },
  {
    slug: 'choose-custom-home-builder-clarksville-tn',
    title: 'How to Choose the Right Custom Home Builder in Clarksville, TN',
    excerpt:
      "Not all custom home builders operate the same way. Here's what to look for — and what questions to ask — before signing a contract with a builder in the Clarksville, TN area.",
    date: 'June 3, 2026',
    published: '2026-06-03',
    category: 'Guides',
    image: '/assets/DSC04388-Edit.webp',
  },
  {
    slug: 'modern-farmhouse-design',
    title: 'The Art of Modern Farmhouse Design',
    excerpt:
      'Exploring the timeless elements that make the modern farmhouse a favorite for Middle Tennessee families. From wrap-around porches to soaring vaulted ceilings, discover how we blend rustic charm with modern luxury.',
    date: 'May 12, 2024',
    published: '2024-05-12',
    category: 'Design Trends',
    image: '/assets/Harmony.webp',
  },
  {
    slug: 'before-building-custom',
    title: '5 Things to Know Before Building Custom',
    excerpt:
      'A comprehensive guide to preparing for your custom home journey, from land acquisition to final selections.',
    date: 'April 28, 2024',
    published: '2024-04-28',
    category: 'Guides',
    image: '/assets/Myrtle.jpg',
  },
];

/** All posts, newest first. */
export const blogPosts: BlogPost[] = [...posts].sort((a, b) => b.published.localeCompare(a.published));

export const blogPostPath = (slug: string) => `/blog/${slug}`;
