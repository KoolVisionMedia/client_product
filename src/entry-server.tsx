import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider, HelmetServerState } from 'react-helmet-async';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { pageRoutes, preloadAllRoutes } from './routes';
import { blogPosts, postAuthor, type BlogPost } from './data/blogPosts';
import { blogArticles } from './data/blogArticles';

/** Published blog posts (newest first), for prerender.mjs: article routes, sitemap, llms.txt. */
export const publishedPosts = blogPosts.filter((p) => blogArticles[p.slug]);

/** The post's author name and role, for the llms.txt blog list. */
export const authorLine = (p: BlogPost) => {
  const a = postAuthor(p);
  return `${a.name}, ${a.role} at Homefront Builders`;
};

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
