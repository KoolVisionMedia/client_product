import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider, HelmetServerState } from 'react-helmet-async';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { pageRoutes, preloadAllRoutes } from './routes';

export async function render(url: string) {
  // Resolve every code-split page first (cached after the first call), so
  // renderToString below renders each page synchronously and emits the full
  // page HTML — never a Suspense fallback.
  await preloadAllRoutes();

  const helmetContext: { helmet?: HelmetServerState } = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <div className="bg-surface min-h-screen flex flex-col">
          <ScrollToTop />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {pageRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Routes>
          </main>
          <Footer />
        </div>
      </StaticRouter>
    </HelmetProvider>
  );

  return { html, helmet: helmetContext.helmet };
}
