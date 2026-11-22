import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll } from 'motion/react';
import { ChevronDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { RUSTIC_PINES_LIVE } from '../data/rusticPinesLaunch';
import ButtonGlow from './ui/ButtonGlow';

/**
 * Site navigation. Same layout as always: logo left, links right (a menu
 * button on phones/tablets), and the same bar heights, so page heroes that
 * clear the bar are unaffected.
 *
 * Desktop details:
 *  - links are set in the site's serif (Playfair Display, already loaded for
 *    headings: no extra font download); on hover the label rolls up and an
 *    italic gold copy rolls in;
 *  - a soft gold pill glides to whichever link the cursor is on and rests on
 *    the current page's link otherwise (one shared element, moved by transform);
 *  - menus open on hover, click or keyboard (Escape closes), as cards with a
 *    one-line description per page;
 *  - "Contact" is the call to action at the end, with the site's button glow;
 *  - once scrolled, the bar tightens, gains a soft shadow, and a thin gold line
 *    along its bottom edge shows how far down the page you are.
 * Phones/tablets: the menu icon morphs into a close icon; the full-screen menu
 * marks the current page, locks the page behind it, and closes on Escape or
 * when a page is chosen.
 * Only transform and opacity animate (no blur or filters; see RusticPines.tsx).
 */

type NavLink = { name: string; href: string; desc?: string };
type NavItem = { name: string; href?: string; dropdown?: NavLink[] };

const EASE = [0.16, 1, 0.3, 1] as const;

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/' },
  {
    name: 'Company',
    dropdown: [
      { name: 'About Us', href: '/about-us', desc: 'Our story, our team, and how we build' },
      { name: 'Testimonials', href: '/testimonials', desc: 'Reviews, seminars and events' },
    ],
  },
  { name: 'Our Process', href: '/process' },
  {
    name: 'Current Builds',
    dropdown: [
      { name: 'Current Builds', href: '/listings', desc: 'Homes for sale and under construction' },
      { name: 'Floorplans', href: '/floorplans', desc: 'Plans ready to build or make your own' },
      // Hidden until the launch switch is on (RUSTIC_PINES_LIVE in src/data/rusticPinesLaunch.ts).
      ...(RUSTIC_PINES_LIVE
        ? [{ name: 'Rustic Pines', href: '/rustic-pines', desc: '41 wooded homesites at Paris Landing' }]
        : []),
    ],
  },
  { name: 'Warranties', href: '/warranties' },
  { name: 'Blog', href: '/blog' },
];
const CONTACT: NavLink = { name: 'Contact', href: '/contact-us' };

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
const itemActive = (pathname: string, item: NavItem) =>
  item.href ? isActive(pathname, item.href) : !!item.dropdown?.some((d) => isActive(pathname, d.href));

/** Label that rolls up on hover, swapping in an italic gold copy of itself. */
function RollLabel({ children, on }: { children: ReactNode; on: boolean }) {
  const t = 'block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none';
  return (
    <span className="relative block overflow-y-clip leading-[1.45]">
      <span className={`${t} ${on ? '-translate-y-full' : 'translate-y-0'}`}>{children}</span>
      <span aria-hidden="true" className={`${t} absolute left-0 top-0 whitespace-nowrap italic text-accent ${on ? 'translate-y-0' : 'translate-y-full'}`}>
        {children}
      </span>
    </span>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Where the menu button sits, so the menu's own close button lands exactly on it.
  const [burgerBox, setBurgerBox] = useState<{ top: number; left: number } | null>(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // A new page closes any open menu.
  useEffect(() => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Escape closes the open desktop menu (focus back on its button) or the mobile menu.
  useEffect(() => {
    if (!openMenu && !mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (openMenu) {
        triggerRefs.current[openMenu]?.focus();
        setOpenMenu(null);
      }
      setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openMenu, mobileMenuOpen]);

  // Focus moves into the open menu (its close button) and back to the menu button after.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (mobileMenuOpen) closeRef.current?.focus({ preventScroll: true });
    else if (wasOpen.current) burgerRef.current?.focus({ preventScroll: true });
    wasOpen.current = mobileMenuOpen;
  }, [mobileMenuOpen]);

  // The full-screen mobile menu holds the page still behind it.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const activeItem = NAV_ITEMS.find((item) => itemActive(pathname, item))?.name ?? null;
  // The pill follows the cursor, an open menu, or else rests on the current page.
  const pillOn = hovered ?? openMenu ?? activeItem;
  const contactActive = isActive(pathname, CONTACT.href);

  const pill = (name: string) =>
    pillOn === name && (
      <motion.span
        layoutId="nav-pill"
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-accent/10 ring-1 ring-accent/20"
        style={{ borderRadius: 9999 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
      />
    );

  const linkBase =
    'relative isolate flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 xl:px-4 py-1.5 text-primary transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60';

  return (
    <>
      <motion.nav
        aria-label="Main"
        className={`fixed top-0 w-full z-50 bg-white border-b transition-[padding,box-shadow,border-color] duration-500 ${
          isScrolled
            ? 'py-4 border-transparent shadow-[0_12px_32px_-16px_rgba(27,37,24,0.3)]'
            : 'py-6 border-gray-100 shadow-none'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex justify-between items-center">
          {/* Logo container */}
          <div className="flex items-center gap-3 relative z-[70]">
            <Link
              to="/"
              className="flex flex-col items-center group rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-4"
            >
              <img
                src="/logo-main.webp"
                alt="Homefront Builders — custom home builder in Clarksville, TN"
                width="1500"
                height="591"
                className={`transition-all duration-500 w-auto group-hover:scale-[1.035] ${isScrolled ? 'h-10 md:h-12' : 'h-14 md:h-16'}`}
                onError={(e) => {
                  if (e.currentTarget.getAttribute('data-fallback') !== 'true') {
                    e.currentTarget.setAttribute('data-fallback', 'true');
                    e.currentTarget.src = "/logo-main.png";
                  }
                }}
              />
            </Link>
          </div>

          {/* Desktop Links */}
          <ul
            className="hidden lg:flex items-center font-serif text-[14px] xl:text-[15px]"
            onMouseLeave={() => setHovered(null)}
          >
            {NAV_ITEMS.map((item) => {
              const active = itemActive(pathname, item);
              const lit = hovered === item.name || openMenu === item.name;
              return (
                <li
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => {
                    setHovered(item.name);
                    if (item.dropdown) setOpenMenu(item.name);
                  }}
                  onMouseLeave={() => {
                    if (item.dropdown) setOpenMenu((m) => (m === item.name ? null : m));
                  }}
                  onBlur={(e) => {
                    if (item.dropdown && !e.currentTarget.contains(e.relatedTarget as Node)) {
                      setOpenMenu((m) => (m === item.name ? null : m));
                    }
                  }}
                >
                  {item.href ? (
                    <Link
                      to={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={linkBase}
                      onFocus={() => setHovered(item.name)}
                      onBlur={() => setHovered(null)}
                    >
                      {pill(item.name)}
                      <RollLabel on={lit}>{item.name}</RollLabel>
                    </Link>
                  ) : (
                    <button
                      ref={(el) => {
                        triggerRefs.current[item.name] = el;
                      }}
                      type="button"
                      aria-expanded={openMenu === item.name}
                      aria-haspopup="true"
                      className={linkBase}
                      onClick={(e) => {
                        // Keyboard (detail 0) toggles. A mouse or tap click on a menu
                        // the hover already opened leaves it open.
                        if (e.detail === 0) setOpenMenu((m) => (m === item.name ? null : item.name));
                        else setOpenMenu(item.name);
                      }}
                    >
                      {pill(item.name)}
                      <RollLabel on={lit}>{item.name}</RollLabel>
                      <ChevronDown
                        size={14}
                        aria-hidden="true"
                        className={`transition-transform duration-300 ${lit ? 'rotate-180 text-accent' : 'text-primary-light'}`}
                      />
                    </button>
                  )}

                  {/* Dropdown card */}
                  <AnimatePresence>
                    {item.dropdown && openMenu === item.name && (
                      <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                        <motion.ul
                          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.32, ease: EASE }}
                          style={{ transformOrigin: 'top center' }}
                          className="w-[300px] rounded-2xl bg-white p-2 ring-1 ring-black/5 shadow-[0_28px_56px_-20px_rgba(27,37,24,0.38)]"
                        >
                          {item.dropdown.map((d, i) => {
                            const here = isActive(pathname, d.href);
                            return (
                              <motion.li
                                key={d.href}
                                initial={reduce ? false : { opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.04 + i * 0.05, ease: EASE }}
                              >
                                <Link
                                  to={d.href}
                                  aria-current={here ? 'page' : undefined}
                                  className="group/item flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-300 hover:bg-surface-alt focus-visible:bg-surface-alt focus-visible:outline-none"
                                >
                                  <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2 font-serif text-[17px] leading-snug text-primary transition-colors group-hover/item:text-accent">
                                      {d.name}
                                      {here && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />}
                                    </span>
                                    {d.desc && (
                                      <span className="mt-0.5 block font-sans text-[12px] leading-snug text-primary-light/80">{d.desc}</span>
                                    )}
                                  </span>
                                  <ArrowRight
                                    aria-hidden="true"
                                    className="h-4 w-4 flex-none -translate-x-1.5 text-accent opacity-0 transition-all duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-visible/item:translate-x-0 group-focus-visible/item:opacity-100"
                                  />
                                </Link>
                              </motion.li>
                            );
                          })}
                        </motion.ul>
                      </div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}

            {/* Call to action */}
            <li className="ml-2 xl:ml-4">
              <Link
                to={CONTACT.href}
                aria-current={contactActive ? 'page' : undefined}
                onMouseEnter={() => setHovered(null)}
                className={`btn-glow group inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 ${
                  contactActive ? 'bg-accent' : 'bg-primary'
                }`}
              >
                <ButtonGlow />
                {CONTACT.name}
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </li>
          </ul>

          {/* Mobile Menu Toggle: two lines that cross into an X */}
          <button
            className="lg:hidden relative z-[70] -mr-2 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            ref={burgerRef}
            onClick={() => {
              const r = burgerRef.current?.getBoundingClientRect();
              if (r) setBurgerBox({ top: r.top, left: r.left });
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <span className="relative block h-4 w-7" aria-hidden="true">
              <span
                className={`absolute left-0 block h-[2px] w-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  mobileMenuOpen ? 'top-[7px] rotate-45 bg-white' : 'top-0.5 bg-primary'
                }`}
              />
              <span
                className={`absolute left-0 block h-[2px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  mobileMenuOpen ? 'top-[7px] w-full -rotate-45 bg-white' : 'top-[12px] w-[70%] bg-primary'
                }`}
              />
            </span>
          </button>
        </div>

        {/* How far down the page you are: a thin gold line along the bar's bottom edge. */}
        <motion.span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 -bottom-px h-[2px] origin-left bg-gradient-to-r from-[#c9a96e] via-accent to-[#c9a96e] transition-opacity duration-500 ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ scaleX: scrollYProgress }}
        />
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
            {/* Close button, on the exact spot of the menu button (which the menu
                covers): the menu button's two lines, crossed into an X. */}
            <motion.button
              ref={closeRef}
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              initial={{ rotate: reduce ? 0 : -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
              className="absolute z-10 flex h-11 w-11 items-center justify-center rounded-full text-white hover:text-[#c9a96e] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]"
              style={burgerBox ? { top: burgerBox.top, left: burgerBox.left } : { top: 24, right: 8 }}
            >
              <span className="relative block h-4 w-7" aria-hidden="true">
                <span className="absolute left-0 top-[7px] block h-[2px] w-full rotate-45 rounded-full bg-current" />
                <span className="absolute left-0 top-[7px] block h-[2px] w-full -rotate-45 rounded-full bg-current" />
              </span>
            </motion.button>

            <nav aria-label="Menu" className="flex flex-col gap-6 text-center mt-20 w-full overflow-y-auto pb-32">
              {[...NAV_ITEMS, CONTACT as NavItem].map((item, i) => {
                const active = itemActive(pathname, item);
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: EASE }}
                    className="flex flex-col items-center gap-4"
                  >
                    {item.href ? (
                      <Link
                        to={item.href}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`font-serif text-3xl md:text-4xl transition-colors block ${
                          active ? 'italic text-[#c9a96e]' : 'text-white hover:text-[#c9a96e]'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <div className="w-full">
                        <div className="font-serif text-3xl md:text-4xl text-white/90 cursor-default mb-4 flex items-center justify-center gap-2">
                          {item.name} <ChevronDown size={20} className="opacity-50" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col gap-4">
                          {item.dropdown?.map((dropItem) => {
                            const here = isActive(pathname, dropItem.href);
                            return (
                              <Link
                                key={dropItem.href}
                                to={dropItem.href}
                                aria-current={here ? 'page' : undefined}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`inline-flex items-center justify-center gap-2 font-sans text-sm tracking-[0.2em] uppercase transition-colors ${
                                  here ? 'text-white' : 'text-accent hover:text-white'
                                }`}
                              >
                                {here && <span className="h-1.5 w-1.5 rounded-full bg-[#c9a96e]" aria-hidden="true" />}
                                {dropItem.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </nav>

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
