import { defineConfig } from 'vite';
import { resolve } from 'path';
import { gamePwaPlugin } from './scripts/pwa-build.mjs';

export default defineConfig({
  plugins: [gamePwaPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        viewer: resolve(__dirname, 'viewer_tuku.html'),
        kit_viewer: resolve(__dirname, 'viewer_kathmandu_kit.html'),
        lakhey_viewer: resolve(__dirname, 'viewer_lakhey.html'),
      },
    },
  },
});
