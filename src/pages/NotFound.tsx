import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <div className="bg-surface min-h-[70vh] flex items-center justify-center px-6 pt-32 pb-24">
      <Helmet>
        <title>Page Not Found | Homefront Builders</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="text-center max-w-xl">
        <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent mb-4">404 — Page Not Found</p>
        <h1 className="font-serif text-5xl md:text-7xl text-primary mb-6 leading-tight">
          This Lot Is<br />Still Undeveloped
        </h1>
        <p className="font-sans text-primary-light text-base leading-relaxed mb-10">
          The page you're looking for doesn't exist or may have moved.
          Let's get you back to solid ground.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-accent text-white font-sans text-xs uppercase tracking-[0.2em] font-semibold rounded-full hover:bg-primary transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Back to Home
          </Link>
          <Link
            to="/contact-us"
            className="inline-flex items-center justify-center px-8 py-4 border border-primary/20 text-primary font-sans text-xs uppercase tracking-[0.2em] font-semibold rounded-full hover:bg-white transition-all duration-300"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
