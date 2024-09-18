// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensure the base path is set correctly for GitHub Pages
  build: {
    outDir: 'dist', // Default output directory
  },
  server: {
    watch: {
      usePolling: true
    }
  }
});
