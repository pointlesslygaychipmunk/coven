// frontend/src/index.tsx
import * as ReactDOM from 'react-dom/client';
// @ts-ignore -- React is used in JSX even if not directly referenced
import * as React from 'react';
import App from './components/App';
import { renderMinimalApp } from './minimal';
import './index.css';

// Set up error tracking for React rendering errors
const originalConsoleError = console.error;
console.error = function(...args) {
  // Check for maximum update depth error
  if (args[0] && typeof args[0] === 'string' && 
      (args[0].includes('Maximum update depth exceeded') || 
       args[0].includes('Too many re-renders'))) {
    console.warn('Infinite render loop detected!');
    
    // Automatically switch to minimal mode
    if (!window.location.search.includes('minimal=true')) {
      console.warn('Redirecting to minimal mode due to render loop...');
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('minimal', 'true');
      window.location.search = urlParams.toString();
      return;
    }
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
    // Fall back to minimal app on error
    return renderMinimalApp();
  }
}

// Render minimal app if in minimal mode, otherwise try main app
if (minimalMode) {
  console.log('Starting in minimal mode');
  renderMinimalApp();
} else {
  console.log('Starting in normal mode');
  renderMainApp();
}