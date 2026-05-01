import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'motion-dom': path.resolve(__dirname, 'node_modules/motion-dom/dist/cjs/index.js'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
