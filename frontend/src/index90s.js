import { jsx as _jsx } from "react/jsx-runtime";
// frontend/src/index90s.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App90s from './components/App90s';
import './index.css'; // Import global styles
const rootElement = document.getElementById('root');
if (!rootElement) {
    console.error("Fatal Error: Root element with ID 'root' not found in the DOM. Cannot render the application.");
    document.body.innerHTML = '<div style="color: #c75e54; background: #2d2038; font-family: \'Courier New\', monospace; padding: 30px; border: 4px solid #483d66; text-align: center;"><strong>Fatal Error!</strong><br><br>The Coven\'s portal could not open.<br>(Missing #root element in HTML document).<br><br>Please check the console.</div>';
    throw new Error("Root element '#root' not found.");
}
// Create the React root
const root = ReactDOM.createRoot(rootElement);
// Render the App90s component
root.render(_jsx(React.StrictMode, { children: _jsx(App90s, {}) }));
//# sourceMappingURL=index90s.js.map