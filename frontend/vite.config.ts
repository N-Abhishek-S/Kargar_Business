import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
