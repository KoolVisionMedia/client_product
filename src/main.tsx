import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { preloadRoute, preloadAllRoutes } from './routes';
import './index.css';

// Load the current route's code-split chunk BEFORE the first render. Until
// then the prerendered HTML stays untouched on screen, so there is no
// spinner, blank frame, or layout shift — the first client render swaps in
// pixel-identical markup, exactly like the previous eager-import setup.
preloadRoute(window.location.pathname).finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </StrictMode>,
  );

  // Once the page is interactive and the browser is idle, prefetch the other
  // page chunks so in-site navigation is instant.
  const idle: (cb: () => void) => void =
    'requestIdleCallback' in window
      ? (cb) => (window as Window & typeof globalThis).requestIdleCallback(cb, { timeout: 4000 })
      : (cb) => setTimeout(cb, 2500);
  idle(() => { void preloadAllRoutes(); });
});
