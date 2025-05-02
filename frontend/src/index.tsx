// frontend/src/index.tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './components/App';
import { renderMinimalApp } from './minimal';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Fatal Error: Root element '#root' not found.");
  throw new Error("Root element '#root' not found.");
}

// Check for special mode parameter to enable minimal app
const urlParams = new URLSearchParams(window.location.search);
const minimalMode = urlParams.get('minimal') === 'true';

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
    
    // Remove StrictMode temporarily as it can cause double renders
    root.render(<App />);
    
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