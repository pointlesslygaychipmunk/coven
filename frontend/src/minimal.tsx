import * as React from 'react';
import { useState } from 'react';
import * as ReactDOM from 'react-dom/client';

// A minimal app component for testing
function MinimalApp() {
  const [counter, setCounter] = useState(0);

  return (
    <div style={{
      fontFamily: 'sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#27224a',
      color: '#e2dbff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <h1>Witch Coven - Minimal Version</h1>
      <p>This is a minimal version to test basic rendering.</p>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={() => setCounter(prev => prev + 1)}
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            backgroundColor: '#4a3674',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Count: {counter}
        </button>
        
        <button 
          onClick={() => window.location.href = "/"}
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            backgroundColor: '#643b68',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Main App
        </button>
      </div>
      
      <div style={{ marginTop: '40px', border: '1px solid #695e9e', padding: '20px', borderRadius: '4px' }}>
        <h2>Troubleshooting</h2>
        <p>If this minimal app renders but the main app doesn't, it suggests the issue is related to:</p>
        <ul style={{ textAlign: 'left' }}>
          <li>Component rendering logic in the main App component</li>
          <li>API data fetching or state management</li>
          <li>Circular dependencies in useEffect or useCallback hooks</li>
        </ul>
      </div>
    </div>
  );
}

// Create a function to render the minimal app
export function renderMinimalApp() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<MinimalApp />);
    console.log('Minimal app rendered successfully');
    return true;
  }
  console.error('Root element not found');
  return false;
}

// Export the minimal app for use in index.tsx
export default MinimalApp;