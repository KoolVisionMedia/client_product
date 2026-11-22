import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const routes = [
  '/',
  '/about-us',
  '/process',
  '/listings',
  '/floorplans',
  '/warranties',
  '/testimonials',
  '/blog',
  '/contact-us',
  '/privacy-policy',
  '/terms',
];

// Rustic Pines is only built while its launch switch is on (RUSTIC_PINES_LIVE in src/data/rusticPinesLaunch.ts).
const rusticPinesLive = /RUSTIC_PINES_LIVE\s*=\s*true/.test(
  fs.readFileSync(path.resolve(__dirname, 'src/data/rusticPinesLaunch.ts'), 'utf-8')
);
if (rusticPinesLive) routes.splice(routes.indexOf('/floorplans') + 1, 0, '/rustic-pines');

const rawTemplate = fs.readFileSync(path.resolve(__dirname, 'dist/index.html'), 'utf-8');
const serverEntry = path.resolve(__dirname, 'dist/server/entry-server.js');

// import() requires a file:// URL on Windows (a raw C:\ path throws
// ERR_UNSUPPORTED_ESM_URL_SCHEME). pathToFileURL is a no-op difference on
// Linux/Vercel, so this is safe cross-platform.
const { render, publishedPosts } = await import(pathToFileURL(serverEntry).href);

// Every blog article gets its own prerendered page at /blog/<slug>.
routes.splice(routes.indexOf('/blog') + 1, 0, ...publishedPosts.map((p) => `/blog/${p.slug}`));

// Map each route to its code-split page module so we can inject
// <link rel="modulepreload"> into that route's prerendered HTML — the page
// chunk then downloads in parallel with the main bundle instead of waiting
// for the main bundle to execute and request it.
const routeSources = {
  '/about-us': 'src/pages/AboutUs.tsx',
  '/process': 'src/pages/ProcessPage.tsx',
  '/listings': 'src/pages/Listings.tsx',
  '/floorplans': 'src/pages/Floorplans.tsx',
  '/rustic-pines': 'src/pages/RusticPines.tsx',
  '/warranties': 'src/pages/Warranties.tsx',
  '/testimonials': 'src/pages/Testimonials.tsx',
  '/blog': 'src/pages/Blog.tsx',
  '/contact-us': 'src/pages/ContactUs.tsx',
  '/privacy-policy': 'src/pages/PrivacyPolicy.tsx',
  '/terms': 'src/pages/Terms.tsx',
};
let manifest = {};
try {
  manifest = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'dist/.vite/manifest.json'), 'utf-8')
  );
} catch {
  console.warn('No client manifest found — skipping modulepreload injection.');
}
function preloadTagsFor(route) {
  const src = routeSources[route] ?? (route.startsWith('/blog/') ? routeSources['/blog'] : undefined);
  const entry = src && manifest[src];
  if (!entry) return '';
  const tags = [`<link rel="modulepreload" crossorigin href="/${entry.file}" />`];
  for (const dep of entry.imports || []) {
    const depFile = manifest[dep]?.file;
    if (depFile) tags.push(`<link rel="modulepreload" crossorigin href="/${depFile}" />`);
  }
  for (const css of entry.css || []) {
    tags.push(`<link rel="stylesheet" crossorigin href="/${css}" />`);
  }
  return tags.join('\n    ');
}

// Strip static og:/twitter: meta tags from template — prerender injects page-specific ones
const templateBase = rawTemplate
  .replace(/<meta property="og:[^>]*>\s*/g, '')
  .replace(/<meta name="twitter:[^>]*>\s*/g, '');

for (const route of routes) {
  try {
    const { html: appHtml } = await render(route);

    // react-helmet-async v3 renders head tags inline at the start of the component output.
    // Split on the first <div to separate head tags from body content.
    const firstDivIndex = appHtml.indexOf('<div');
    const headTags = firstDivIndex > 0 ? appHtml.substring(0, firstDivIndex) : '';
    const bodyContent = firstDivIndex > 0 ? appHtml.substring(firstDivIndex) : appHtml;

    let pageHtml = templateBase;

    // Replace placeholder title with actual page head tags (title + meta + canonical)
    if (headTags) {
      pageHtml = pageHtml.replace('<title>Homefront Builders</title>', headTags);
    }

    // Inject rendered body into root div
    pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${bodyContent}</div>`);

    // Preload this route's code-split chunk in parallel with the main bundle
    const preloadTags = preloadTagsFor(route);
    if (preloadTags) {
      pageHtml = pageHtml.replace('</head>', `    ${preloadTags}\n  </head>`);
    }

    const outDir = route === '/'
      ? path.resolve(__dirname, 'dist')
      : path.resolve(__dirname, 'dist', route.slice(1));
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.resolve(outDir, 'index.html'), pageHtml);

    console.log(`✓ Prerendered: ${route}`);
  } catch (err) {
    console.error(`✗ Failed to prerender ${route}:`, err);
  }
}

// Blog article URLs are generated into the sitemap and llms.txt from src/data/blogPosts.ts, so a
// new post only needs its data entry. Each file holds a marker line that is replaced here.
const SITE = 'https://www.homefrontbuilderstn.com';
const xml = (v) =>
  String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
function injectBlogPosts(file, marker, entries) {
  const target = path.resolve(__dirname, 'dist', file);
  const text = fs.readFileSync(target, 'utf-8');
  const line = text.split('\n').find((l) => l.includes(marker));
  if (!line) {
    console.warn(`✗ ${file}: no ${marker} marker — blog posts not listed.`);
    return;
  }
  fs.writeFileSync(target, text.replace(line, entries.join('\n')));
  console.log(`✓ ${file}: listed ${publishedPosts.length} blog posts`);
}
injectBlogPosts(
  'sitemap.xml',
  'BLOG_POSTS',
  publishedPosts.map(
    (p) => `  <url>
    <loc>${SITE}/blog/${p.slug}</loc>
    <lastmod>${p.updated ?? p.published}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${xml(SITE + encodeURI(p.image))}</image:loc>
      <image:title>${xml(p.title)}</image:title>
    </image:image>
  </url>`
  )
);
injectBlogPosts(
  'llms.txt',
  'BLOG_POSTS',
  publishedPosts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}): ${p.excerpt}`)
);

// Remove the server-only SSR bundle so it isn't deployed/served publicly.
// (It is only needed at build time, by this script.)
try {
  fs.rmSync(path.resolve(__dirname, 'dist/server'), { recursive: true, force: true });
} catch {}

console.log('Prerendering complete.');
