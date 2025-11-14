import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      electron({
        entry: 'electron/main.ts',
      }),
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
    envDir: '../', // Load .env from parent directory
  };
});
