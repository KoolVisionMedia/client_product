// Blog post metadata. Article bodies live in ./blogArticles.ts, keyed by slug.
//
// Each post is published at /blog/<slug> (prerendered, in the sitemap and llms.txt — see
// prerender.mjs). The list is sorted newest-first by `published`, so a new post takes the
// featured slot automatically: add it here and its body in blogArticles.ts, nothing else.

export interface BlogPost {
  slug: string;
  /** Card title; the article body opens with the same text as its <h1>. */
  title: string;
  /** Shorter <title> for search results (~60 characters); falls back to `title`. */
  seoTitle?: string;
  /** Card excerpt and meta description (~155 characters). */
  excerpt: string;
  /** ISO publish date (YYYY-MM-DD): drives ordering, schema and the sitemap. */
  published: string;
  /** ISO date of the last substantive edit; shown as "Updated …" and used as dateModified. */
  updated?: string;
  category: string;
  image: string;
  keywords?: string[];
  /** Who wrote it (a key of BLOG_AUTHORS). */
  author?: AuthorId;
}

/**
 * Bylines: Homefront team members (the same people as the About page's team).
 * Each post names the one whose work the topic belongs to. `photo` is a small
 * square crop of their About-page photo.
 */
export const BLOG_AUTHORS = {
  'amber-wotring': { name: 'Amber Wotring', role: 'Custom Home Builder & Architectural Designer' },
  'carissa-ockey': { name: 'Carissa Ockey', role: 'Designer' },
  'kenneth-wotring': { name: 'Kenneth Wotring', role: 'New Construction Specialist' },
  'patricia-shipley': { name: 'Patricia Shipley', role: 'Director of Sales' },
  'karen-grimes': { name: 'Karen Grimes', role: 'Broker' },
} as const;
export type AuthorId = keyof typeof BLOG_AUTHORS;
export const DEFAULT_AUTHOR: AuthorId = 'amber-wotring';
export const postAuthor = (post: BlogPost) => {
  const id = post.author ?? DEFAULT_AUTHOR;
  return { id, ...BLOG_AUTHORS[id], photo: `/assets/team/avatars/${id}.webp` };
};

const posts: BlogPost[] = [
  {
    slug: 'buying-land-to-build-a-house-in-tennessee',
    author: 'kenneth-wotring',
    title: 'Buying Land to Build a House in Tennessee: 7 Hidden Lot Costs to Check Before You Close',
    seoTitle: 'Buying Land to Build a House in Tennessee: Hidden Lot Costs',
    excerpt:
      'Buying land to build on in Tennessee? Septic soil tests, wells, power, driveways and clearing can add $30K–$100K. Here’s what to check before you close.',
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
    slug: 'va-loan-new-construction-clarksville-tn',
    author: 'patricia-shipley',
    title: 'Building a New Home With a VA Loan in Clarksville, TN: What Fort Campbell Families Need to Know',
    seoTitle: 'VA Construction Loans in Clarksville, TN: Fort Campbell Guide',
    excerpt:
      'You can build a new home with a VA loan. How VA construction loans work near Fort Campbell, the 2025 rule change most sites miss, and what to ask lenders.',
    published: '2026-11-22',
    category: 'Financing',
    image: '/assets/about-hero-new.webp',
    keywords: [
      'VA loan new construction',
      'VA construction loan Tennessee',
      'build a house with a VA loan',
      'VA builder ID',
      'VA funding fee',
      'Fort Campbell',
      'Clarksville TN',
    ],
  },
  {
    slug: 'how-to-choose-a-custom-home-builder-clarksville-tn',
    author: 'amber-wotring',
    title: 'How to Choose a Custom Home Builder in Clarksville, TN: Questions to Ask and Red Flags to Watch',
    seoTitle: 'How to Choose a Custom Home Builder in Clarksville, TN',
    excerpt:
      'Comparing builders in Clarksville? Verify a Tennessee contractor license in 30 seconds, ask the 8 questions that reveal the most, and spot the red flags.',
    published: '2026-08-01',
    updated: '2026-11-22',
    category: 'Guides',
    image: '/assets/beyond-the-build.webp',
    keywords: [
      'custom home builder Clarksville TN',
      'how to choose a home builder',
      'questions to ask a home builder',
      'Tennessee contractor license lookup',
      'home builder red flags',
    ],
  },
  {
    slug: 'luxury-custom-home-features-middle-tennessee',
    author: 'carissa-ockey',
    title: 'Luxury Custom Home Features Worth Every Penny in Middle Tennessee',
    seoTitle: 'Luxury Custom Home Features Worth It in Middle Tennessee',
    excerpt:
      'The luxury custom home features Middle Tennessee owners say are worth every penny: kitchens, primary suites, smart homes, outdoor living and efficiency.',
    published: '2026-07-01',
    updated: '2026-11-22',
    category: 'Design Trends',
    image: '/assets/Magnolia.jpg',
    keywords: [
      'luxury custom home features',
      'luxury home builder Middle Tennessee',
      'custom home upgrades worth it',
      'spray foam insulation Tennessee',
      'outdoor living Tennessee',
    ],
  },
  {
    slug: 'new-construction-homes-clarksville-tn',
    author: 'karen-grimes',
    title: 'New Construction Homes in Clarksville, TN: Costs, Timelines, and Your Options (2026 Guide)',
    seoTitle: 'New Construction in Clarksville, TN: 2026 Costs & Timelines',
    excerpt:
      'New construction in Clarksville, TN: 2026 prices, realistic timelines for spec, semi-custom and custom homes, financing options, and how to pick a builder.',
    published: '2026-06-20',
    updated: '2026-11-22',
    category: 'Market Insights',
    image: '/assets/Cypress.jpg',
    keywords: [
      'new construction homes Clarksville TN',
      'cost to build a house Clarksville TN',
      'new homes Clarksville',
      'custom home timeline',
      'Montgomery County new construction',
    ],
  },
  {
    slug: 'building-a-custom-home-in-tennessee-what-to-know',
    author: 'amber-wotring',
    title: 'Building a Custom Home in Tennessee: 5 Things to Know Before You Start',
    seoTitle: 'Building a Custom Home in Tennessee: 5 Things to Know First',
    excerpt:
      'Planning a custom home in Tennessee? Land, the real budget, construction loans, timelines and choosing a builder: five things to know before you start.',
    published: '2024-04-28',
    updated: '2026-11-22',
    category: 'Guides',
    image: '/assets/Myrtle.jpg',
    keywords: [
      'building a custom home in Tennessee',
      'custom home building process',
      'construction loan',
      'custom home budget',
      'how long to build a custom home',
    ],
  },
  {
    slug: 'modern-farmhouse-homes-middle-tennessee',
    author: 'carissa-ockey',
    title: 'Modern Farmhouse Homes in Middle Tennessee: A Design Guide for Your Custom Build',
    seoTitle: 'Modern Farmhouse Home Design Guide for Middle Tennessee',
    excerpt:
      'Modern farmhouse design for Middle Tennessee: defining features, a real floor plan example, materials that hold up in our climate, and where it costs more.',
    published: '2024-05-12',
    updated: '2026-11-22',
    category: 'Design Trends',
    image: '/assets/Harmony.webp',
    keywords: [
      'modern farmhouse homes',
      'modern farmhouse design',
      'farmhouse floor plans Tennessee',
      'board and batten siding',
      'custom farmhouse builder Clarksville',
    ],
  },
];

/** All posts, newest first. */
export const blogPosts: BlogPost[] = [...posts].sort((a, b) => b.published.localeCompare(a.published));

export const blogPostPath = (slug: string) => `/blog/${slug}`;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "2026-11-22" -> "November 22, 2026" (no Date parsing, so no timezone drift). */
export function formatPostDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** The date line shown for a post: its publish date, or "Updated …" once it has been revised. */
export const postDateLabel = (post: BlogPost) =>
  post.updated ? `Updated ${formatPostDate(post.updated)}` : formatPostDate(post.published);
