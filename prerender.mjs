import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const rawTemplate = fs.readFileSync(path.resolve(__dirname, 'dist/index.html'), 'utf-8');
const serverEntry = path.resolve(__dirname, 'dist/server/entry-server.js');

const { render } = await import(serverEntry);

// Strip static og:/twitter: meta tags from template — prerender injects page-specific ones
const templateBase = rawTemplate
  .replace(/<meta property="og:[^>]*>\s*/g, '')
  .replace(/<meta name="twitter:[^>]*>\s*/g, '');

for (const route of routes) {
  try {
    const { html: appHtml } = render(route);

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

console.log('Prerendering complete.');
