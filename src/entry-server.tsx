import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider, HelmetServerState } from 'react-helmet-async';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

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

import { Routes, Route } from 'react-router-dom';

export function render(url: string) {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
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
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </StaticRouter>
    </HelmetProvider>
  );

  return { html, helmet: helmetContext.helmet };
}
