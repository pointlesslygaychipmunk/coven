// frontend/src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App90s from './components/App90s'; 
import './index.css'; // Import global styles
import SimpleApp from './components/SimpleApp';

// Set up error tracking for React rendering errors
const originalConsoleError = console.error;
console.error = function(...args) {
  // Check for maximum update depth error or other serious issues
  if (args[0] && typeof args[0] === 'string' && 
      (args[0].includes('Maximum update depth exceeded') || 
       args[0].includes('Too many re-renders') ||
       args[0].includes('Minified React error #310'))) {
    console.warn('Infinite render loop detected!');
    
    // Automatically redirect to standalone mode as last resort
    console.warn('Redirecting to standalone mode due to render loop...');
    window.location.href = '/?standalone=true';
    return;
  }
  
  // Call original for other errors
  originalConsoleError.apply(console, args);
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Fatal Error: Root element with ID 'root' not found in the DOM. Cannot render the application.");
  document.body.innerHTML = '<div style="color: #c75e54; background: #2d2038; font-family: \'Courier New\', monospace; padding: 30px; border: 4px solid #483d66; text-align: center;"><strong>Fatal Error!</strong><br><br>The Coven\'s portal could not open.<br>(Missing #root element in HTML document).<br><br>Please check the console.</div>';
  throw new Error("Root element '#root' not found.");
}

// Check for special mode parameters
const urlParams = new URLSearchParams(window.location.search);
const useModernUI = urlParams.get('modern') === 'true';
const useStandalone = urlParams.get('standalone') === 'true';
const useMinimal = urlParams.get('minimal') === 'true';

// Create the React root
const root = ReactDOM.createRoot(rootElement);

// Determine which version to render
if (useStandalone) {
  console.log('Starting in standalone test mode');
  // Import dynamically to avoid loading unnecessary code
  import('./standalone').then(module => {
    module.renderStandaloneApp();
  });
} else if (useMinimal) {
  console.log('Starting in minimal mode');
  // Import dynamically to avoid loading unnecessary code
  import('./minimal').then(module => {
    module.renderMinimalApp();
  });
} else if (useModernUI) {
  console.log('Starting in modern UI mode');
  // Render SimpleApp (original modern UI)
  root.render(
    <React.StrictMode>
      <SimpleApp />
    </React.StrictMode>
  );
} else {
  // Default to 90s UI
  console.log('Starting in 90s UI mode (default)');
  root.render(
    <React.StrictMode>
      <App90s />
    </React.StrictMode>
  );
}