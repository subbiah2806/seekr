import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // CRITICAL: Prevents React duplication in monorepo - DO NOT REMOVE
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  // Port is passed via CLI: npm run dev -- --port 4100
});
