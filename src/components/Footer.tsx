import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0f1a0c] text-white pt-24 pb-8 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">

          {/* Brand Column */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-8">
              <img
                src="/logo-round.png"
                alt="Homefront Builders"
                className="w-14 h-14 object-contain filter invert brightness-0"
                onError={(e) => {
                  if (e.currentTarget.getAttribute('data-fallback') !== 'true') {
                    e.currentTarget.setAttribute('data-fallback', 'true');
                    e.currentTarget.src = "/logo-round.png.png";
                  }
                }}
              />
              <div>
                <h3 className="font-serif text-xl text-white leading-tight">Homefront Builders</h3>
                <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#c9a96e]">Custom Homes</p>
              </div>
            </div>
            <p className="text-white/50 max-w-sm font-sans leading-loose text-sm mb-8">
              Based in Clarksville, Tennessee, Homefront Builders specializes in
              the construction of luxury custom homes tailored entirely to your vision.
              Every detail, every finish, built to last.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:text-[#c9a96e] hover:border-[#c9a96e] transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:text-[#c9a96e] hover:border-[#c9a96e] transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="Houzz" className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:text-[#c9a96e] hover:border-[#c9a96e] transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6 3v6l-6 3-6-3v-6l6-3z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-sans uppercase tracking-[0.3em] text-[10px] text-white/30 mb-8 border-b border-white/10 pb-4">Navigate</h4>
            <ul className="space-y-4 font-sans text-xs text-white/60 tracking-widest uppercase">
              <li><Link to="/" className="hover:text-[#c9a96e] transition-colors">Home</Link></li>
              <li><Link to="/about-us" className="hover:text-[#c9a96e] transition-colors">About Us</Link></li>
              <li><Link to="/portfolio" className="hover:text-[#c9a96e] transition-colors">Portfolio</Link></li>
              <li><Link to="/testimonials" className="hover:text-[#c9a96e] transition-colors">Testimonials</Link></li>
              <li><Link to="/blog" className="hover:text-[#c9a96e] transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2">
            <h4 className="font-sans uppercase tracking-[0.3em] text-[10px] text-white/30 mb-8 border-b border-white/10 pb-4">Resources</h4>
            <ul className="space-y-4 font-sans text-xs text-white/60 tracking-widest uppercase">
              <li><Link to="/warranties" className="hover:text-[#c9a96e] transition-colors">Warranties</Link></li>
              <li><Link to="/contact-us" className="hover:text-[#c9a96e] transition-colors">Contact</Link></li>
              <li><a href="/#process" className="hover:text-[#c9a96e] transition-colors">Our Process</a></li>
              <li><a href="/#portfolio" className="hover:text-[#c9a96e] transition-colors">Floor Plans</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3">
            <h4 className="font-sans uppercase tracking-[0.3em] text-[10px] text-white/30 mb-8 border-b border-white/10 pb-4">Contact</h4>
            <ul className="space-y-5 font-sans text-xs text-white/60 tracking-wide leading-loose">
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Clarksville, Tennessee</span>
              </li>
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <a href="mailto:info@homefrontbuilders.com" className="hover:text-[#c9a96e] transition-colors">info@homefrontbuilders.com</a>
              </li>
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <a href="tel:5551234567" className="hover:text-[#c9a96e] transition-colors">(555) 123-4567</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-6">
          <p className="font-sans text-[10px] text-white/25 tracking-[0.2em] uppercase">
            &copy; {new Date().getFullYear()} Homefront Builders. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="font-sans text-[10px] text-white/25 tracking-[0.15em] uppercase hover:text-white/50 transition-colors">Privacy Policy</a>
            <a href="#" className="font-sans text-[10px] text-white/25 tracking-[0.15em] uppercase hover:text-white/50 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
