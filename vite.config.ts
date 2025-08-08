import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Pre-bundle lucide-react to avoid thousands of on-demand icon requests in dev
    include: ['lucide-react'],
  },
  build: {
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          convex: ['convex/react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
  },
});
