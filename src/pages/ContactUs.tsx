import { motion } from 'motion/react';
import ContactSection from '../components/ContactSection';
import SEO from '../components/SEO';
import { BUSINESS } from '../data/business';

// The contact page's main entity is the business itself: the same shared
// definition as the home page (src/data/business.ts), so the details match.
const contactSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Homefront Builders',
    url: 'https://www.homefrontbuilderstn.com/contact-us',
    isPartOf: { '@id': 'https://www.homefrontbuilderstn.com/#website' },
    mainEntity: BUSINESS,
  },
];

export default function ContactUs() {
  return (
    <div>
      <SEO
        title="Contact Us"
        description="Ready to build your dream home in Clarksville, TN? Contact Homefront Builders to start your custom home journey today."
        path="/contact-us"
        schema={contactSchema}
      />
      {/* Hero Banner */}
      <section className="relative h-[400px] md:h-[450px] overflow-hidden">
        <img fetchPriority="high" decoding="async" src="/assets/content2.jpg"
          alt="Contact Homefront Builders, custom home builder in Clarksville, Tennessee"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#1b2518]/60" />
        <div className="relative z-10 h-full flex items-center justify-center pt-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#c9a96e] mb-4">Get In Touch</p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white tracking-wide text-balance">
              Let's Build Your Dream Home
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <ContactSection />
    </div>
  );
}
