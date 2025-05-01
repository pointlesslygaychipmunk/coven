// frontend/src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@components/App'; // Using alias configured in Vite/TSConfig
import './index.css'; // Import global styles

const rootElement = document.getElementById('root');

if (!rootElement) {
  // Use console.error for clarity in developer console
  console.error("Fatal Error: Root element with ID 'root' not found in the DOM. Cannot render the application.");
  // Optionally display a message to the user in the body
  document.body.innerHTML = '<div style="color: #c75e54; background: #2d2038; font-family: \'Courier New\', monospace; padding: 30px; border: 4px solid #483d66; text-align: center;"><strong>Fatal Error!</strong><br><br>The Coven\'s portal could not open.<br>(Missing #root element in HTML document).<br><br>Please check the console.</div>';
  // Throwing an error might still be useful to halt execution script loaders etc.
  throw new Error("Root element '#root' not found.");
}

// Create the React root
const root = ReactDOM.createRoot(rootElement);

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);