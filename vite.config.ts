import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    cacheDir: "C:/Users/kvpho/AppData/Local/Temp/vite-cache-real-estate",
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react-dom/client', 
        'react/jsx-dev-runtime', 
        'react-router-dom', 
        'motion/react',
        'lucide-react'
      ]
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      emptyOutDir: false,
      // Emit dist/.vite/manifest.json so prerender.mjs can inject
      // <link rel="modulepreload"> for each page's code-split chunk.
      manifest: true,
    },
  };
});
