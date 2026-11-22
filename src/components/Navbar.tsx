import { useState, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll } from 'motion/react';
import { ChevronDown, ArrowUpRight, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { RUSTIC_PINES_LIVE } from '../data/rusticPinesLaunch';
import { blogPosts, blogPostPath } from '../data/blogPosts';
import ButtonGlow from './ui/ButtonGlow';
import { useDialog } from '../hooks/useDialog';

/**
 * Site navigation: a floating, rounded dark bar.
 *
 *     [ Company  Homes  Our Process  Resources ]   [ logo ]   [ Contact Us ]
 *
 * Desktop:
 *  - the bar floats a little in from the screen edges, as wide as the page
 *    content; it deepens and gains a thin gold scroll-progress line once the
 *    page is scrolled;
 *  - a soft pill glides to the link under the cursor and rests on the current
 *    section otherwise (one shared element, moved by transform);
 *  - Company, Homes and Resources open a cream panel under the bar, as wide
 *    as the bar: the section's pages with a one-line description on the left,
 *    picture cards on the right (featured pages; the latest articles under
 *    Resources). Hover, click or keyboard open it; Escape closes it; Tab moves
 *    from the button into the panel and on to the next link.
 * Phones / tablets: menu button left, logo centre, call button right; the menu
 * opens full screen (a modal dialog: focus moves in, Escape closes it).
 *
 * The bar is solid colour, not frosted glass: no blur, masks or filters (they
 * have failed on the owner's GPU; see RusticPines.tsx). Only transform and
 * opacity animate. Card images are small WebP copies (public/assets/menu/),
 * loaded only when a panel first opens (960px wide, for sharp 2x screens).
 */

type NavLink = { name: string; href: string; desc?: string };
type Feature = { title: string; href: string; image: string; fallback?: string };
type NavItem = { name: string; href?: string; dropdown?: NavLink[]; featuredLabel?: string; featured?: Feature[] };

const EASE = [0.16, 1, 0.3, 1] as const;
const PHONE = { label: '(931) 221-2566', href: 'tel:9312212566' };

const menuImage = (slug: string) => `/assets/menu/blog-${slug}.webp`;
// Newest two posts. Each uses a small copy in public/assets/menu/ (blog-<slug>.webp);
// a new post without one yet falls back to its full-size image.
const LATEST_POSTS: Feature[] = blogPosts.slice(0, 2).map((p) => ({
  title: p.title,
  href: blogPostPath(p.slug),
  image: menuImage(p.slug),
  fallback: p.image,
}));

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Company',
    dropdown: [
      { name: 'About Us', href: '/about-us', desc: 'Our story, our team, and the partners we build with.' },
      { name: 'Testimonials', href: '/testimonials', desc: 'Reviews from our homeowners, plus seminars and community events.' },
    ],
    featuredLabel: 'Featured',
    featured: [
      { title: 'Meet the Homefront Builders team', href: '/about-us', image: '/assets/menu/team.webp' },
      { title: "Sip N' Swag: Thanksgiving, and our other community events", href: '/testimonials', image: '/assets/menu/sip-n-swag.webp' },
    ],
  },
  {
    name: 'Homes',
    dropdown: [
      { name: 'Current Builds', href: '/listings', desc: 'Homes for sale now and homes under construction.' },
      { name: 'Floorplans', href: '/floorplans', desc: 'Plans ready to build as drawn, or to make your own.' },
      // Hidden until the launch switch is on (RUSTIC_PINES_LIVE in src/data/rusticPinesLaunch.ts).
      ...(RUSTIC_PINES_LIVE
        ? [{ name: 'Rustic Pines', href: '/rustic-pines', desc: '41 wooded homesites at Paris Landing, near Kentucky Lake.' }]
        : []),
    ],
    featuredLabel: RUSTIC_PINES_LIVE ? 'Now selling' : 'Featured',
    featured: [
      ...(RUSTIC_PINES_LIVE
        ? [{ title: 'Rustic Pines at Paris Landing: lots from $79,000', href: '/rustic-pines', image: '/assets/menu/rustic-pines.webp' }]
        : []),
      { title: 'The Harmony: 4 bedrooms, 3.5 baths, from 2,860 sq ft', href: '/floorplans', image: '/assets/menu/harmony.webp' },
    ],
  },
  { name: 'Our Process', href: '/process' },
  {
    name: 'Resources',
    dropdown: [
      { name: 'Blog', href: '/blog', desc: 'Guides to land, loans, costs and design for building in Middle Tennessee.' },
      { name: 'Warranties', href: '/warranties', desc: 'A 10-year Quality Builders Warranty, backed by Liberty Mutual.' },
    ],
    featuredLabel: 'Latest articles',
    featured: LATEST_POSTS,
  },
];
const HOME: NavLink = { name: 'Home', href: '/' };
const CONTACT: NavLink = { name: 'Contact Us', href: '/contact-us' };

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
const itemActive = (pathname: string, item: NavItem) =>
  item.href ? isActive(pathname, item.href) : !!item.dropdown?.some((d) => isActive(pathname, d.href));
const panelId = (name: string) => `nav-panel-${name.toLowerCase().replace(/\s+/g, '-')}`;

export default function Navbar() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  // Where the menu button sits, so the full-screen menu's close button lands on it
  // and its opening circle grows from it.
  const [burgerBox, setBurgerBox] = useState<{ top: number; left: number } | null>(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // A new page closes any open menu.
  useEffect(() => {
    setOpenMenu(null);
    setHovered(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Escape closes the open panel (focus back on its button).
  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      triggerRefs.current[openMenu]?.focus();
      setOpenMenu(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openMenu]);

  // The full-screen mobile menu is a modal dialog (focus in and back, Tab kept
  // inside, Escape closes it, the page behind holds still).
  const overlayRef = useRef<HTMLDivElement>(null);
  useDialog(mobileMenuOpen, () => setMobileMenuOpen(false), overlayRef);

  const activeItem = NAV_ITEMS.find((item) => itemActive(pathname, item))?.name ?? null;
  // The pill follows the cursor or the open panel, else rests on the current section.
  const pillOn = hovered ?? openMenu ?? activeItem;
  const openItem = NAV_ITEMS.find((i) => i.name === openMenu && i.dropdown);

  const focusables = () =>
    panelRef.current ? [...panelRef.current.querySelectorAll<HTMLElement>('a[href]')] : [];

  // Keyboard flow: Tab from an open menu's button goes into its panel; Tab past
  // the panel's last link goes on to the next top-level link (closing it), and
  // Shift+Tab from its first link goes back to the button.
  const onTriggerKeyDown = (e: ReactKeyboardEvent, name: string) => {
    if (e.key === 'Tab' && !e.shiftKey && openMenu === name) {
      const first = focusables()[0];
      if (first) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  const onPanelKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Tab' || !openItem) return;
    const items = focusables();
    const index = NAV_ITEMS.indexOf(openItem);
    if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
      e.preventDefault();
      setOpenMenu(null);
      (itemRefs.current[index + 1] ?? document.getElementById('nav-cta'))?.focus();
    } else if (e.shiftKey && document.activeElement === items[0]) {
      e.preventDefault();
      triggerRefs.current[openItem.name]?.focus();
    }
  };

  const pill = (name: string) =>
    pillOn === name && (
      <motion.span
        layoutId="nav-pill"
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-white/[0.11]"
        style={{ borderRadius: 10 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 460, damping: 38 }}
      />
    );

  const linkCls =
    'relative isolate flex items-center gap-1.5 whitespace-nowrap rounded-[10px] px-3 xl:px-3.5 py-2 font-sans text-sm text-white/80 transition-colors duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]/70';

  const overlayOrigin = burgerBox ? `${burgerBox.left + 22}px ${burgerBox.top + 22}px` : '40px 40px';

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
        <motion.div
          className="pointer-events-auto relative mx-auto max-w-site"
          initial={{ y: -110 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          onMouseLeave={() => {
            setHovered(null);
            setOpenMenu(null);
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenMenu(null);
          }}
        >
          <nav
            aria-label="Main"
            className={`relative grid h-14 grid-cols-[1fr_auto_1fr] items-center rounded-2xl px-2 ring-1 ring-white/10 transition-[background-color,box-shadow] duration-500 md:h-16 md:px-3 ${
              isScrolled || openMenu
                ? 'bg-[#1b2518] shadow-[0_22px_46px_-22px_rgba(8,12,6,0.75)]'
                : 'bg-[#1b2518]/90 shadow-[0_16px_38px_-22px_rgba(8,12,6,0.6)]'
            }`}
          >
            {/* Left: menu button (phones/tablets) / links (desktop) */}
            <div className="flex items-center">
              <button
                ref={burgerRef}
                type="button"
                className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]/70"
                onClick={() => {
                  const r = burgerRef.current?.getBoundingClientRect();
                  if (r) setBurgerBox({ top: r.top, left: r.left });
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                <span className="relative block h-3.5 w-6" aria-hidden="true">
                  <span className="absolute left-0 top-0 block h-[1.5px] w-full rounded-full bg-current" />
                  <span className="absolute left-0 top-[12px] block h-[1.5px] w-[65%] rounded-full bg-current" />
                </span>
              </button>

              <ul className="hidden lg:flex items-center gap-0.5" onMouseLeave={() => setHovered(null)}>
                {NAV_ITEMS.map((item, i) => {
                  const active = itemActive(pathname, item);
                  const open = openMenu === item.name;
                  return (
                    <li
                      key={item.name}
                      onMouseEnter={() => {
                        setHovered(item.name);
                        setOpenMenu(item.dropdown ? item.name : null);
                      }}
                    >
                      {item.href ? (
                        <Link
                          ref={(el) => {
                            itemRefs.current[i] = el;
                          }}
                          to={item.href}
                          aria-current={active ? 'page' : undefined}
                          className={`${linkCls} ${active ? 'text-white' : ''}`}
                          onFocus={() => {
                            setHovered(item.name);
                            setOpenMenu(null);
                          }}
                          onBlur={() => setHovered(null)}
                        >
                          {pill(item.name)}
                          {item.name}
                        </Link>
                      ) : (
                        <button
                          ref={(el) => {
                            triggerRefs.current[item.name] = el;
                            itemRefs.current[i] = el;
                          }}
                          type="button"
                          aria-expanded={open}
                          aria-controls={open ? panelId(item.name) : undefined}
                          className={`${linkCls} ${active || open ? 'text-white' : ''}`}
                          onClick={(e) => {
                            // Keyboard (detail 0) toggles; a mouse click or tap on a panel
                            // the hover already opened leaves it open.
                            if (e.detail === 0) setOpenMenu((m) => (m === item.name ? null : item.name));
                            else setOpenMenu(item.name);
                          }}
                          onKeyDown={(e) => onTriggerKeyDown(e, item.name)}
                        >
                          {pill(item.name)}
                          {item.name}
                          <ChevronDown
                            size={14}
                            aria-hidden="true"
                            className={`opacity-70 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                          />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Centre: logo */}
            <Link
              to="/"
              aria-label="Homefront Builders home"
              className="group flex items-center justify-center rounded-lg px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]/70"
              onMouseEnter={() => setOpenMenu(null)}
            >
              <img
                src="/logo-light.webp"
                alt="Homefront Builders, custom home builder in Clarksville, TN"
                width={381}
                height={150}
                className="h-8 w-auto transition-transform duration-500 group-hover:scale-[1.04] md:h-10 xl:h-11"
              />
            </Link>

            {/* Right: call (phones/tablets) / contact (desktop) */}
            <div className="flex items-center justify-end gap-2">
              <a
                href={PHONE.href}
                aria-label={`Call Homefront Builders at ${PHONE.label}`}
                className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]/70"
              >
                <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
              </a>
              <a
                href={PHONE.href}
                className="hidden xl:inline-flex rounded-lg px-3 py-2 font-sans text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]/70"
                onMouseEnter={() => setOpenMenu(null)}
              >
                {PHONE.label}
              </a>
              <Link
                id="nav-cta"
                to={CONTACT.href}
                aria-current={isActive(pathname, CONTACT.href) ? 'page' : undefined}
                onMouseEnter={() => {
                  setHovered(null);
                  setOpenMenu(null);
                }}
                className="btn-glow group hidden lg:inline-flex items-center gap-2 rounded-full bg-[#c9a96e] px-5 py-2.5 font-sans text-sm font-medium text-[#1b2518] hover:bg-[#d8bb84] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b2518]"
              >
                <ButtonGlow />
                {CONTACT.name}
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>

            {/* How far down the page you are: a thin gold line along the bar's bottom. */}
            <motion.span
              aria-hidden="true"
              className={`pointer-events-none absolute bottom-0 left-5 right-5 h-px origin-left bg-gradient-to-r from-[#c9a96e] via-[#e2c991] to-[#c9a96e] transition-opacity duration-500 ${
                isScrolled && !openMenu ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ scaleX: scrollYProgress }}
            />
          </nav>

          {/* Desktop panel for the open section (padding, not margin, above it so
              the cursor can cross from the bar without the panel closing). */}
          <AnimatePresence>
            {openItem && (
              <div className="absolute inset-x-0 top-full hidden pt-2 lg:block">
                <motion.div
                  key={openItem.name}
                  ref={panelRef}
                  id={panelId(openItem.name)}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  onKeyDown={onPanelKeyDown}
                  className="grid grid-cols-12 gap-8 rounded-2xl bg-[#F7F5EF] p-7 shadow-[0_34px_80px_-30px_rgba(8,12,6,0.6)] ring-1 ring-black/5 xl:p-8"
                >
                  <ul className="col-span-4 -m-2 space-y-1">
                    {openItem.dropdown!.map((d, i) => {
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
                            className="group block rounded-xl px-4 py-3 transition-colors duration-300 hover:bg-white focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]"
                          >
                            <span className="flex items-center gap-2 font-sans text-base font-medium text-primary transition-colors group-hover:text-accent-dark">
                              {d.name}
                              {here && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />}
                            </span>
                            {d.desc && (
                              <span className="mt-1 block font-sans text-sm leading-snug text-primary-light">{d.desc}</span>
                            )}
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>

                  <div className="col-span-8">
                    <p className="mb-4 font-sans text-sm text-primary-light">{openItem.featuredLabel}</p>
                    <ul className="grid grid-cols-2 gap-6">
                      {openItem.featured!.map((f, i) => (
                        <motion.li
                          key={f.href + f.title}
                          initial={reduce ? false : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.08 + i * 0.06, ease: EASE }}
                        >
                          <Link
                            to={f.href}
                            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F7F5EF]"
                          >
                            <span className="block aspect-[2/1] overflow-hidden rounded-xl bg-surface-alt">
                              <img
                                src={f.image}
                                alt=""
                                width={960}
                                height={480}
                                decoding="async"
                                onError={(e) => {
                                  if (f.fallback && !e.currentTarget.src.endsWith(f.fallback)) e.currentTarget.src = f.fallback;
                                }}
                                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                              />
                            </span>
                            <span className="mt-3 block font-sans text-[0.9375rem] font-medium leading-snug text-primary transition-colors group-hover:text-accent-dark">
                              {f.title}
                            </span>
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 bg-primary z-[60] flex flex-col justify-center items-center"
            initial={{ opacity: 0, clipPath: `circle(0% at ${overlayOrigin})` }}
            animate={{ opacity: 1, clipPath: `circle(150% at ${overlayOrigin})` }}
            exit={{ opacity: 0, clipPath: `circle(0% at ${overlayOrigin})` }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Close button, on the exact spot of the menu button (which the menu covers). */}
            <motion.button
              data-autofocus
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              initial={{ rotate: reduce ? 0 : -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
              className="absolute z-10 flex h-11 w-11 items-center justify-center rounded-xl text-white hover:text-[#c9a96e] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]"
              style={burgerBox ? { top: burgerBox.top, left: burgerBox.left } : { top: 24, left: 16 }}
            >
              <span className="relative block h-4 w-6" aria-hidden="true">
                <span className="absolute left-0 top-[7px] block h-[1.5px] w-full rotate-45 rounded-full bg-current" />
                <span className="absolute left-0 top-[7px] block h-[1.5px] w-full -rotate-45 rounded-full bg-current" />
              </span>
            </motion.button>

            <nav aria-label="Menu" className="flex flex-col gap-6 text-center mt-20 w-full overflow-y-auto pb-32">
              {[HOME as NavItem, ...NAV_ITEMS, CONTACT as NavItem].map((item, i) => {
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
                        <div className="flex flex-col gap-1">
                          {item.dropdown?.map((dropItem) => {
                            const here = isActive(pathname, dropItem.href);
                            return (
                              <Link
                                key={dropItem.href}
                                to={dropItem.href}
                                aria-current={here ? 'page' : undefined}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`inline-flex items-center justify-center gap-2 py-2 font-sans text-sm tracking-[0.2em] uppercase transition-colors ${
                                  here ? 'text-white' : 'text-[#c9a96e] hover:text-white'
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
