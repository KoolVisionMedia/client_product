import { ComponentType, lazy, Suspense } from 'react';
import Home from './pages/Home';

/**
 * Route registry with code-split pages.
 *
 * Home is imported eagerly: it's the most common entry point and keeping it
 * in the main bundle guarantees the prerendered homepage is re-rendered with
 * identical markup immediately on hydration.
 *
 * Every other page is code-split. A NAIVE React.lazy setup here caused a bug
 * in the past (see App.tsx history): on first load of a prerendered page the
 * client render suspended, swapped the full prerendered HTML for a Suspense
 * fallback, and produced a huge layout shift. `lazyPage` avoids that:
 *
 *  - `preload()` fetches the chunk and caches the resolved component.
 *  - Once preloaded, the page renders 100% synchronously (no Suspense pass).
 *  - main.tsx awaits `preloadRoute(location.pathname)` BEFORE the first
 *    render, so the initial route is always the synchronous path and the
 *    prerendered HTML is never replaced by a fallback.
 *  - entry-server.tsx awaits `preloadAllRoutes()` before renderToString, so
 *    prerendering renders full page HTML exactly as before.
 *  - Client-side navigations to a not-yet-loaded page go through React.lazy
 *    inside <Suspense>; react-router v7 wraps navigation in startTransition,
 *    so the previous page stays visible until the chunk arrives (no spinner,
 *    no blank flash). Chunks are also prefetched when the browser goes idle.
 */
type PageModule = { default: ComponentType };

export function lazyPage(load: () => Promise<PageModule>) {
  let Loaded: ComponentType | null = null;
  let promise: Promise<unknown> | null = null;

  const preload = () =>
    (promise ??= load().then((m) => {
      Loaded = m.default;
    }));

  const Lazy = lazy(() => preload().then(() => ({ default: Loaded! })));

  function Page() {
    if (Loaded) {
      const C = Loaded;
      return <C />;
    }
    return (
      <Suspense fallback={null}>
        <Lazy />
      </Suspense>
    );
  }
  Page.preload = preload;
  return Page;
}

const AboutUs = lazyPage(() => import('./pages/AboutUs'));
const Testimonials = lazyPage(() => import('./pages/Testimonials'));
const Listings = lazyPage(() => import('./pages/Listings'));
const Floorplans = lazyPage(() => import('./pages/Floorplans'));
const Blog = lazyPage(() => import('./pages/Blog'));
const ContactUs = lazyPage(() => import('./pages/ContactUs'));
const Warranties = lazyPage(() => import('./pages/Warranties'));
const ProcessPage = lazyPage(() => import('./pages/ProcessPage'));
const PrivacyPolicy = lazyPage(() => import('./pages/PrivacyPolicy'));
const Terms = lazyPage(() => import('./pages/Terms'));
const NotFound = lazyPage(() => import('./pages/NotFound'));

export const pageRoutes = [
  { path: '/', Component: Home, preload: undefined },
  { path: '/about-us', Component: AboutUs, preload: AboutUs.preload },
  { path: '/testimonials', Component: Testimonials, preload: Testimonials.preload },
  { path: '/listings', Component: Listings, preload: Listings.preload },
  { path: '/floorplans', Component: Floorplans, preload: Floorplans.preload },
  { path: '/blog', Component: Blog, preload: Blog.preload },
  { path: '/contact-us', Component: ContactUs, preload: ContactUs.preload },
  { path: '/warranties', Component: Warranties, preload: Warranties.preload },
  { path: '/process', Component: ProcessPage, preload: ProcessPage.preload },
  { path: '/privacy-policy', Component: PrivacyPolicy, preload: PrivacyPolicy.preload },
  { path: '/terms', Component: Terms, preload: Terms.preload },
  { path: '*', Component: NotFound, preload: NotFound.preload },
] as const;

/** Preload the chunk for the page matching `pathname` (no-op for eager Home). */
export function preloadRoute(pathname: string): Promise<unknown> {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const match =
    pageRoutes.find((r) => r.path === normalized) ??
    pageRoutes.find((r) => r.path === '*')!;
  return match.preload ? match.preload() : Promise.resolve();
}

/** Preload every page chunk (used by the prerenderer and idle prefetch). */
export function preloadAllRoutes(): Promise<unknown> {
  return Promise.all(pageRoutes.map((r) => (r.preload ? r.preload() : null)));
}
