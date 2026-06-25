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

import { Suspense, lazy, useEffect } from 'react';

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

// Pages
const Home = lazy(() => import('./pages/Home'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const Listings = lazy(() => import('./pages/Listings'));
const Floorplans = lazy(() => import('./pages/Floorplans'));
const Blog = lazy(() => import('./pages/Blog'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Warranties = lazy(() => import('./pages/Warranties'));
const ProcessPage = lazy(() => import('./pages/ProcessPage'));

export default function App() {
  return (
    <div className="bg-surface min-h-screen flex flex-col">
      <RouteTracker />
      <ScrollToTop />
      <Navbar />
      
      <main className="flex-grow">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        }>
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
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <Analytics />
      <SpeedInsights />
      <ChatWidget />
    </div>
  );
}
