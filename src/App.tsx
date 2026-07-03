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

import { useEffect } from 'react';

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

// Pages — imported eagerly (not lazy) so the client hydrates the exact
// markup the build prerendered. Lazy-loading here made hydration swap the
// prerendered page for a Suspense spinner, collapsing the layout and causing
// a large Cumulative Layout Shift (the footer jumped) plus a content flash.
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Testimonials from './pages/Testimonials';
import Listings from './pages/Listings';
import Floorplans from './pages/Floorplans';
import Blog from './pages/Blog';
import ContactUs from './pages/ContactUs';
import Warranties from './pages/Warranties';
import ProcessPage from './pages/ProcessPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="bg-surface min-h-screen flex flex-col">
      <RouteTracker />
      <ScrollToTop />
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/floorplans" element={<Floorplans />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/warranties" element={<Warranties />} />
          <Route path="/process" element={<ProcessPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <Analytics />
      <SpeedInsights />
      <ChatWidget />
    </div>
  );
}
