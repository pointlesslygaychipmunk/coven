// fallback.tsx - A super minimal component that avoids all complex logic
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

/**
 * A very simple component with minimal logic and no dependencies on the game state
 * Used as a last resort when other components fail
 */
function FallbackApp() {
  const [showDebug, setShowDebug] = React.useState(false);
  const [debugLogs, setDebugLogs] = React.useState<string[]>([]);
  
  // Add debug log
  const addLog = (message: string) => {
    setDebugLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };
  
  // Attempt to diagnose environment
  React.useEffect(() => {
    addLog('Fallback app mounted');
    
    // Check React version
    try {
      // @ts-ignore
      addLog(`React version: ${React.version}`);
    } catch (err) {
      addLog('Could not determine React version');
    }
    
    // Check for query params
    try {
      const params = new URLSearchParams(window.location.search);
      const entries = Array.from(params.entries());
      addLog(`URL params: ${entries.length > 0 ? JSON.stringify(Object.fromEntries(entries)) : 'none'}`);
    } catch (err) {
      addLog('Error checking URL params');
    }
    
    // Check local storage
    try {
      const keys = Object.keys(localStorage);
      addLog(`LocalStorage keys: ${keys.length > 0 ? keys.join(', ') : 'none'}`);
    } catch (err) {
      addLog('Error accessing localStorage');
    }
    
    return () => {
      addLog('Fallback app unmounted');
    };
  }, []);

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
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
      <h1>Witch Coven - Emergency Fallback</h1>
      <p>This is a simplified version when the main app cannot render.</p>
      
      <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => window.location.href = "/?minimal=true"}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4a3674',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Minimal Version
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#643b68',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
        
        <button 
          onClick={() => setShowDebug(!showDebug)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showDebug ? 'Hide' : 'Show'} Debug Info
        </button>
      </div>
      
      <div style={{ marginTop: '20px', border: '1px solid #695e9e', padding: '20px', borderRadius: '4px', width: '90%' }}>
        <h2>Troubleshooting</h2>
        <p>The main Witch Coven application encountered a rendering issue.</p>
        <ul style={{ textAlign: 'left' }}>
          <li>Try clearing your browser cache and cookies</li>
          <li>Check developer console for specific errors (F12)</li>
          <li>Try using the minimal version link above</li>
          <li>If all else fails, contact support</li>
        </ul>
      </div>
      
      {showDebug && (
        <div style={{ marginTop: '20px', border: '1px solid #695e9e', padding: '20px', borderRadius: '4px', width: '90%', textAlign: 'left' }}>
          <h3>Debug Logs</h3>
          <pre style={{ 
            backgroundColor: '#1a1a2e', 
            padding: '10px', 
            borderRadius: '4px', 
            overflowX: 'auto',
            fontSize: '12px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {debugLogs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}

/**
 * Renders the fallback app to the root element
 * @returns {boolean} Success status of the render attempt
 */
export function renderFallbackApp(): boolean {
  try {
    console.log('Rendering emergency fallback app');
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Root element not found');
      return false;
    }
    
    const root = ReactDOM.createRoot(rootElement);
    root.render(<FallbackApp />);
    console.log('Fallback app rendered successfully');
    return true;
  } catch (err) {
    console.error('Failed to render fallback app:', err);
    return false;
  }
}

export default FallbackApp;