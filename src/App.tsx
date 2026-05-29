/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ChatWidget from './components/ChatWidget';

// Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Testimonials from './pages/Testimonials';
import Listings from './pages/Listings';
import Floorplans from './pages/Floorplans';
import Blog from './pages/Blog';
import ContactUs from './pages/ContactUs';
import Warranties from './pages/Warranties';
import ProcessPage from './pages/ProcessPage';

export default function App() {
  return (
    <div className="bg-surface min-h-screen flex flex-col">
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
        </Routes>
      </main>

      <Footer />
      <Analytics />
      <SpeedInsights />
      <ChatWidget />
    </div>
  );
}
