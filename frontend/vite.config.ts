
// frontend/vite.config.ts - 90s UI MODE
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true, // Auto-open browser
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared/src'),
      'coven-shared': path.resolve(__dirname, '../shared/src/index.ts'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@images': path.resolve(__dirname, './src/images')
    }
  },
  optimizeDeps: {
    include: ['coven-shared'],
  },
  build: {
    outDir: 'dist',
    commonjsOptions: {
      include: [/shared/, /node_modules/],
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/index90s.tsx'),
      },
    }
  },
});
