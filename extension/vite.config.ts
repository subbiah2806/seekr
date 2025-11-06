import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import path from 'path';
import type { ManifestV3Export } from '@crxjs/vite-plugin';
import manifest from './src/chrome/manifest.json';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from parent directory
  const env = loadEnv(mode, '../', '');

  return {
    plugins: [react(), crx({ manifest: manifest as ManifestV3Export })],
    build: {
      outDir: './dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: path.resolve(__dirname, './src/popup.html'),
        },
      },
    },
    publicDir: path.resolve(__dirname, './public'),
    server: {
      port: parseInt(env.VITE_EXTENSION_PORT) || 4101,
    },
    envDir: '../', // Load .env from parent directory
  };
});
