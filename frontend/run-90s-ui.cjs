/**
 * Run 90s UI Helper Script
 * 
 * This script temporarily modifies vite.config.ts to use the 90s UI version
 * of the game as the entry point. Run with:
 * 
 * node run-90s-ui.cjs
 * 
 * This will start the development server with the 90s UI.
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Path to vite.config.ts
const configPath = path.join(__dirname, 'vite.config.ts');

// Read the current config
const originalConfig = fs.readFileSync(configPath, 'utf8');

// Make a backup of the original config
const backupPath = path.join(__dirname, 'vite.config.backup.ts');
fs.writeFileSync(backupPath, originalConfig);
console.log('✓ Original vite.config.ts backed up');

// Modify the config to use the 90s UI entry point
let modifiedConfig = originalConfig;
if (originalConfig.includes('main: path.resolve(__dirname, "src/index.tsx")')) {
  modifiedConfig = originalConfig.replace(
    'main: path.resolve(__dirname, "src/index.tsx")',
    'main: path.resolve(__dirname, "src/index90s.tsx")'
  );
} else {
  // If the specific pattern isn't found, try to add it
  if (originalConfig.includes('build: {')) {
    modifiedConfig = originalConfig.replace(
      'build: {',
      'build: {\n    rollupOptions: {\n      input: {\n        main: path.resolve(__dirname, "src/index90s.tsx"),\n      },\n    },'
    );
  } else {
    console.error('Could not find a suitable location to modify in vite.config.ts');
    process.exit(1);
  }
}

// Write the modified config
fs.writeFileSync(configPath, modifiedConfig);
console.log('✓ Modified vite.config.ts to use 90s UI');

// Run npm dev with a trap to restore the original config on exit
console.log('Starting development server with 90s UI...');
console.log('Press Ctrl+C to stop and restore original config');

try {
  // Start the dev server
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.log('Development server stopped or error occurred');
} finally {
  // Restore the original config
  fs.copyFileSync(backupPath, configPath);
  fs.unlinkSync(backupPath);
  console.log('✓ Restored original vite.config.ts');
}