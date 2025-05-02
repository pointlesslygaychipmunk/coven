import React, { useState } from 'react'; // React import needed for JSX

// Explicitly use React to satisfy TypeScript
const element = React.createElement('div', null, 'Using React explicitly');
// Adding a console.log to debug import issues
console.log('SimpleApp component is being loaded');

// Skip CSS imports entirely to avoid potential issues
// We'll use inline styles exclusively for this troubleshooting component

const SimpleApp: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="simple-container" style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#27224a',
      color: '#e2dbff',
      fontFamily: 'sans-serif'
    }}>
      <h1>Witch Coven - Simple Version</h1>
      <p>This is a simplified version to troubleshoot rendering issues.</p>
      <div style={{ marginTop: '20px' }}>
        <button 
          style={{
            padding: '10px 20px',
            backgroundColor: '#4a3674',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
          onClick={() => setCount(count + 1)}
        >
          Count: {count}
        </button>
        <button 
          style={{
            padding: '10px 20px',
            backgroundColor: '#7952b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default SimpleApp;