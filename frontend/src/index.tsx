// frontend/src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@components/App'; // Use alias (Vite usually handles .tsx/.ts)
import './index.css'; // Import global styles

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Fatal Error: Root element with ID 'root' not found in the DOM.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);