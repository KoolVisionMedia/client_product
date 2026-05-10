import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'HOME', href: '/' },
    { 
      name: 'COMPANY', 
      dropdown: [
        { name: 'About Us', href: '/about-us' },
        { name: 'Testimonials', href: '/testimonials' }
      ]
    },
    { name: 'OUR PROCESS', href: '/#process' },
    { 
      name: 'LISTINGS', 
      dropdown: [
        { name: 'Active Listings', href: '/listings' }
      ]
    },
    { name: 'WARRANTIES', href: '/warranties' },
    { name: 'BLOG', href: '/blog' },
    { name: 'CONTACT', href: '/contact-us' },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 bg-white border-b border-gray-100 ${
          isScrolled ? 'py-4 shadow-sm' : 'py-6'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex justify-between items-center">
          {/* Logo container */}
          <div className="flex items-center gap-3 relative z-[70]">
            <Link to="/" className="flex flex-col items-center group">
              <img 
                src="/logo-main.png" 
                alt="Homefront Builders Logo" 
                className={`transition-all duration-500 w-auto ${isScrolled ? 'h-10 md:h-12' : 'h-14 md:h-16'}`} 
                onError={(e) => {
                  if (e.currentTarget.getAttribute('data-fallback') !== 'true') {
                    e.currentTarget.setAttribute('data-fallback', 'true');
                    e.currentTarget.src = "/logo-main.png.png";
                  }
                }}
              />
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-sans tracking-[0.15em] uppercase font-medium">
            {navItems.map((item) => (
              <div key={item.name} className="relative group/nav py-2 text-primary">
                {item.href ? (
                  item.href.startsWith('/') && !item.href.includes('#') ? (
                    <Link to={item.href} className="relative group px-1 py-2 hover:text-accent transition-colors flex items-center gap-1">
                      {item.name}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  ) : (
                    <a href={item.href} className="relative group px-1 py-2 hover:text-accent transition-colors flex items-center gap-1">
                      {item.name}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  )
                ) : (
                  <div className="relative group px-1 py-2 hover:text-accent transition-colors flex items-center gap-1 cursor-default">
                    {item.name}
                    <ChevronDown size={14} className="text-primary-light group-hover:text-accent transition-colors" />
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full"></span>
                  </div>
                )}

                {/* Dropdown Menu */}
                {item.dropdown && (
                  <div className="absolute top-full left-0 pt-4 opacity-0 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto transition-all duration-300 translate-y-2 group-hover/nav:translate-y-0 z-50">
                    <div className="bg-white border border-gray-100 shadow-xl py-4 min-w-[200px] flex flex-col">
                      {item.dropdown.map((dropItem) => (
                        <Link 
                          key={dropItem.name} 
                          to={dropItem.href}
                          className="px-6 py-3 hover:bg-surface-alt hover:text-accent transition-colors text-[10px] tracking-[0.2em] uppercase font-sans font-medium text-primary"
                        >
                          {dropItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden relative z-[70] p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="text-white" size={28} />
            ) : (
              <Menu className="text-primary" size={28} />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-primary z-[60] flex flex-col justify-center items-center"
            initial={{ opacity: 0, clipPath: 'circle(0% at right 40px top 40px)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at right 40px top 40px)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at right 40px top 40px)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex flex-col gap-6 text-center mt-20 w-full overflow-y-auto pb-32">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                  className="flex flex-col items-center gap-4"
                >
                  {item.href ? (
                    item.href.startsWith('/') && !item.href.includes('#') ? (
                      <Link
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-serif text-3xl md:text-4xl text-white hover:text-accent transition-colors block"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-serif text-3xl md:text-4xl text-white hover:text-accent transition-colors block"
                      >
                        {item.name}
                      </a>
                    )
                  ) : (
                    <div className="w-full">
                      <div className="font-serif text-3xl md:text-4xl text-white/90 cursor-default mb-4 flex items-center justify-center gap-2">
                        {item.name} <ChevronDown size={20} className="opacity-50" />
                      </div>
                      <div className="flex flex-col gap-4">
                        {item.dropdown?.map((dropItem) => (
                          <Link
                            key={dropItem.name}
                            to={dropItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="font-sans text-sm tracking-[0.2em] uppercase text-accent hover:text-white transition-colors"
                          >
                            {dropItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="absolute bottom-12 flex gap-3 text-accent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="-mt-2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
               <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="mt-2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
