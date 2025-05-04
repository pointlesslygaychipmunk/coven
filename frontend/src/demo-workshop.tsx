import React from 'react';
import ReactDOM from 'react-dom/client';
import SimplifiedWorkshop from './components/SimplifiedWorkshop';
import './components/pixelatedSierra.css';

// Demo standalone page for the combined workshop with pixelated Sierra style
const Demo = () => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#e8d5b0',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '1024px',
        height: '768px',
        border: '3px outset #8b6d45',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
      }} className="pixelated">
        <SimplifiedWorkshop />
      </div>
    </div>
  );
};

// Create root element if it doesn't exist (for direct loading)
if (!document.getElementById('root')) {
  const rootDiv = document.createElement('div');
  rootDiv.id = 'root';
  document.body.appendChild(rootDiv);
}

// Render directly to the page
const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);
root.render(<Demo />);

export default Demo;