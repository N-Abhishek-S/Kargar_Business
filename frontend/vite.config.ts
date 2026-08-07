import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { copyFileSync, existsSync } from 'fs';

function generate404HtmlPlugin(): Plugin {
  return {
    name: 'generate-404-html',
    writeBundle() {
      const distIndex = resolve(__dirname, 'dist/index.html');
      const dist404 = resolve(__dirname, 'dist/404.html');
      if (existsSync(distIndex)) {
        copyFileSync(distIndex, dist404);
        console.log('[build] Successfully generated dist/404.html for Vercel 404 HTTP status handling');
      } else {
        console.error('[build] Error: dist/index.html does not exist during writeBundle');
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), generate404HtmlPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  css: {
    // Disable PostCSS config file discovery to avoid parent-dir tailwind.config.js conflicts
    postcss: {},
  },
  build: {
    target: 'es2022',
    cssMinify: true,
    chunkSizeWarningLimit: 650,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});