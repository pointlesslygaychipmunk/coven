// frontend/src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Fatal Error: Root element '#root' not found.");
  throw new Error("Root element '#root' not found.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);