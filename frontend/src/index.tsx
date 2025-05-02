// frontend/src/index.tsx
import React from 'react'; // Required for JSX transform
import ReactDOM from 'react-dom/client';
// Import our simple troubleshooting apps - with both JSX and non-JSX versions for fallback
import SimpleApp from './components/SimpleApp';
// Fallback that doesn't use JSX in case there are JSX transform issues
// Use .js extension explicitly for TypeScript to find it
import NoJsxApp from './components/NoJsxApp.js';
import './index.css'; // Import global styles

// Explicitly use React to satisfy TypeScript
// Using underscore prefix to indicate intentionally unused variable
const _jsx = React.createElement('div', null, 'This is JSX');
// @ts-ignore - this is just to make TypeScript recognize React import

// Unregister any existing service workers to fix "Frame with ID 0 was removed" errors
// This is a common issue when service workers aren't properly maintained
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('Service worker unregistered to prevent errors');
    }
  });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  // Use console.error for clarity in developer console
  console.error("Fatal Error: Root element with ID 'root' not found in the DOM. Cannot render the application.");
  // Optionally display a message to the user in the body
  document.body.innerHTML = '<div style="color: #c75e54; background: #2d2038; font-family: \'Courier New\', monospace; padding: 30px; border: 4px solid #483d66; text-align: center;"><strong>Fatal Error!</strong><br><br>The Coven\'s portal could not open.<br>(Missing #root element in HTML document).<br><br>Please check the console.</div>';
  // Throwing an error might still be useful to halt execution script loaders etc.
  throw new Error("Root element '#root' not found.");
}

// Add a fallback content in case React rendering fails
console.log('Creating fallback content');
rootElement.innerHTML = '<div style="padding: 20px; text-align: center;">' +
  '<p style="color: #e2dbff; font-family: sans-serif;">Loading app...</p>' +
  '</div>';

try {
  // Create the React root
  console.log('Creating React root');
  const root = ReactDOM.createRoot(rootElement);

  // Try to render using JSX first
  console.log('First trying JSX version (SimpleApp)');
  try {
    root.render(
      <SimpleApp />
    );
    console.log('JSX render attempt completed');
  } catch (jsxError) {
    // If JSX fails, fall back to non-JSX version
    console.error('JSX rendering failed, trying non-JSX fallback', jsxError);
    try {
      // Try the non-JSX version
      root.render(
        React.createElement(NoJsxApp, null)
      );
      console.log('Non-JSX render attempt completed');
    } catch (fallbackError) {
      console.error('Both rendering approaches failed', fallbackError);
      throw fallbackError; // Let the outer catch handle this
    }
  }
} catch (error) {
  console.error('Failed to render React component:', error);
  rootElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #ff857b; font-family: sans-serif;">' +
    '<h2>React Rendering Error</h2>' +
    '<p>Failed to render the application. Please check the console for details.</p>' +
    '<button onclick="window.location.reload()">Reload Page</button>' +
    '</div>';
}