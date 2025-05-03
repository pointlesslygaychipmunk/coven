// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Using the default export
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Fix for MIME type issues - ensure proper content type headers
    middlewareMode: false,
    // Proxy API requests to the backend server during development
    proxy: {
      '/api': {
        // Target your backend server (running on port 8080 by default)
        target: 'http://localhost:8080',
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,      // Allow self-signed certs if backend uses HTTPS locally
      },
    },
  },
  resolve: {
    alias: {
      // Ensure these aliases match tsconfig.json paths
      // Note: '../shared/src' points correctly from frontend/ to shared/src/
      '@shared': path.resolve(__dirname, '../shared/src'), // Keep original format if preferred
      'coven-shared': path.resolve(__dirname, '../shared/src/index.ts'), // Resolve package import
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'), // Keep even if empty for now
      '@images': path.resolve(__dirname, './src/images') // Keep even if empty for now
    }
  },
  // Optimize dependencies from the shared package
  optimizeDeps: {
    include: ['coven-shared'],
  },
  build: {
    outDir: 'dist', // Ensure output directory is standard
    // Ensure shared package changes trigger rebuilds correctly
    commonjsOptions: {
      include: [/shared/, /node_modules/], // Regex to include files from shared and node_modules
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          shared: ['../shared/src'],
        },
        // Ensure assets have the correct MIME types
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
});