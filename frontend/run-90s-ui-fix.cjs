/**
 * Run 90s UI Helper Script (Fixed version)
 * 
 * This script correctly modifies vite.config.ts to use the 90s UI version
 * and directly opens the browser to the correct URL.
 * 
 * Run with:
 * node run-90s-ui-fix.cjs
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

// Path to vite.config.ts
const configPath = path.join(__dirname, 'vite.config.ts');

// Read the original config
const originalConfig = fs.readFileSync(configPath, 'utf8');

// Make a backup
const backupPath = path.join(__dirname, 'vite.config.backup.ts');
fs.writeFileSync(backupPath, originalConfig);
console.log('✓ Original vite.config.ts backed up');

// Create a completely new simplified config that specifically uses index90s.tsx
const newConfig = `
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
`;

// Write the new config
fs.writeFileSync(configPath, newConfig);
console.log('✓ Created 90s UI specific config');

// Function to open a URL in the default browser
function openBrowser(url) {
  const platform = os.platform();
  try {
    switch (platform) {
      case 'darwin': // macOS
        execSync(`open "${url}"`);
        break;
      case 'win32': // Windows
        execSync(`start "${url}"`);
        break;
      default: // Linux and others
        execSync(`xdg-open "${url}"`);
        break;
    }
    console.log(`✓ Opened browser to ${url}`);
  } catch (error) {
    console.error(`Failed to open browser: ${error.message}`);
  }
}

// Run the dev server
console.log('Starting development server with 90s UI...');
console.log('Press Ctrl+C to stop and restore original config');

try {
  // Start the dev server - use execSync first to make sure port is available
  execSync('npx kill-port 3000', { stdio: 'inherit' });
  
  // Use exec to start the dev server and not block this script
  const { exec } = require('child_process');
  const devServer = exec('npm run dev', { stdio: 'inherit' });
  
  // Give the server time to start up
  setTimeout(() => {
    openBrowser('http://localhost:3000');
    console.log('If browser doesn\'t open automatically, visit http://localhost:3000');
  }, 3000);
  
  // Set up cleanup on exit
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  function cleanup() {
    console.log('\nShutting down dev server...');
    // Kill the dev server process
    devServer.kill();
    // Restore the original config
    fs.copyFileSync(backupPath, configPath);
    fs.unlinkSync(backupPath);
    console.log('✓ Restored original vite.config.ts');
    process.exit(0);
  }
  
} catch (error) {
  console.error('Error running development server:', error);
  // Restore the original config on error
  fs.copyFileSync(backupPath, configPath);
  fs.unlinkSync(backupPath);
  console.log('✓ Restored original vite.config.ts due to error');
}