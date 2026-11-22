import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Blog articles open as an overlay at /blog/<slug>; opening or closing one keeps the list's
// scroll position instead of jumping to the top.
const isBlog = (path: string) => path === '/blog' || path.startsWith('/blog/');

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const prev = useRef(pathname);

  useEffect(() => {
    const from = prev.current;
    prev.current = pathname;
    if (from !== pathname && isBlog(from) && isBlog(pathname)) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
