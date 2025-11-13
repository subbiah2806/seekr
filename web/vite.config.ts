import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file from parent directory
  const env = loadEnv(mode, '../', '');

  return {
    plugins: [react()],
    resolve: {
      // CRITICAL: Prevents React duplication in monorepo - DO NOT REMOVE
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
    server: {
      port: parseInt(env.VITE_WEB_PORT) || 4100,
    },
    envDir: '../', // Load .env from parent directory
  };
});
