import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Enable minification (default is 'esbuild' which is fast and effective)
    minify: 'esbuild',
    // Enable CSS minification
    cssMinify: true,
    // Generate source maps for debugging (set to false for smaller builds)
    sourcemap: false,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries into their own chunk
          vendor: ['react', 'react-dom', 'react-router-dom'],
          convex: ['convex/react'],
          icons: ['lucide-react'],
        },
      },
    },
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable tree shaking
    target: 'esnext',
  },
});
