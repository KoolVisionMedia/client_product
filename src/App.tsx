/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Testimonials from './pages/Testimonials';
import Listings from './pages/Listings';
import Blog from './pages/Blog';
import ContactUs from './pages/ContactUs';
import Warranties from './pages/Warranties';

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
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/warranties" element={<Warranties />} />
        </Routes>
      </main>

      <Footer />
      <Analytics />
    </div>
  );
}
