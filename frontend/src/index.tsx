// frontend/src/index.tsx
import * as ReactDOM from 'react-dom/client';
// @ts-ignore -- React is used in JSX even if not directly referenced
import * as React from 'react';
import App from './components/App';
import { renderMinimalApp } from './minimal';
import { renderStandaloneApp } from './standalone';
import './index.css';

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

// Enable React DevTools
if (process.env.NODE_ENV !== 'production') {
  // @ts-ignore
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: false };
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Fatal Error: Root element '#root' not found.");
  throw new Error("Root element '#root' not found.");
}

// Check for special mode parameter to enable minimal app
const urlParams = new URLSearchParams(window.location.search);
const minimalMode = urlParams.get('minimal') === 'true';
const debugMode = urlParams.get('debug') === 'true';

// Type guard to assert rootElement is not null
function assertNonNull<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined");
  }
}

// Function to render the main app with error handling
function renderMainApp() {
  try {
    console.log('Attempting to render main App component...');
    assertNonNull(rootElement);
    const root = ReactDOM.createRoot(rootElement);
    
    // Add global error handler for React errors that happen during rendering
    window.addEventListener('error', function(event) {
      console.error('Global error caught:', event.error);
      if (event.error && event.error.message && 
          (event.error.message.includes('Maximum update') || 
           event.error.message.includes('Too many re-renders') ||
           event.error.message.includes('React error #310'))) {
        console.error('Detected render loop, switching to standalone mode...');
        // Go to standalone mode which is a simplified React app
        window.location.href = '/?standalone=true';
      }
    });
    
    // Use StrictMode only in debug mode
    if (debugMode) {
      console.log('Using React StrictMode (debug mode)');
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } else {
      // Remove StrictMode to avoid unnecessary double renders in production
      root.render(<App />);
    }
    
    return true;
  } catch (error) {
    console.error('Fatal error rendering main App:', error);
    // Try standalone mode first
    if (!renderStandaloneApp()) {
      // If standalone mode fails, go to minimal as last resort
      return renderMinimalApp();
    }
    return true;
  }
}

// Check mode parameters
const standaloneMode = urlParams.get('standalone') === 'true';

// Render appropriate version based on URL parameters
if (standaloneMode) {
  console.log('Starting in standalone mode');
  renderStandaloneApp();
} else if (minimalMode) {
  console.log('Starting in minimal mode');
  renderMinimalApp();
} else {
  console.log('Starting in normal mode');
  try {
    renderMainApp();
  } catch (err) {
    console.error('Critical failure in main app render, trying standalone mode:', err);
    renderStandaloneApp();
  }
}