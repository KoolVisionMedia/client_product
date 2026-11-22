/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ChatWidget from './components/ChatWidget';
import PencilCursor from './components/PencilCursor';

import { useEffect } from 'react';
import { MotionConfig } from 'motion/react';

// Google Analytics Route Tracker for SPAs
const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.gtag) {
      // @ts-ignore
      window.gtag('config', 'G-CZDZM04DYL', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
};

// Pages are code-split per route via src/routes.tsx. The registry guarantees
// the initial route's chunk is loaded BEFORE the first render (see main.tsx),
// which avoids the historical bug where naive React.lazy swapped the
// prerendered page for a Suspense spinner and caused a large layout shift.
// On client-side navigations react-router v7's startTransition keeps the
// current page visible until the next page's chunk is ready.
import { pageRoutes } from './routes';

export default function App() {
  return (
    // reducedMotion="user": visitors whose device asks for less motion get the
    // site's motion-library animations without movement (fades only).
    <MotionConfig reducedMotion="user">
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Keyboard users can jump past the navigation straight to the page. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:font-sans focus:text-xs focus:font-semibold focus:uppercase focus:tracking-[0.2em] focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
      >
        Skip to content
      </a>
      <RouteTracker />
      <ScrollToTop />
      <Navbar />

      <main id="main" tabIndex={-1} className="flex-grow outline-none">
        <Routes>
          {pageRoutes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Routes>
      </main>

      <Footer />
      <Analytics />
      <SpeedInsights />
      <ChatWidget />
      <PencilCursor />
    </div>
    </MotionConfig>
  );
}
