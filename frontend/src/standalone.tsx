// standalone.tsx - A completely independent React component that doesn't depend on the main app
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

interface BranchState {
  name: string;
  status: 'untested' | 'success' | 'error';
  logs: string[];
}

function StandaloneApp() {
  const [branches, setBranches] = React.useState<BranchState[]>([
    { name: 'Basic React', status: 'untested', logs: [] },
    { name: 'useCallback', status: 'untested', logs: [] },
    { name: 'useMemo', status: 'untested', logs: [] },
    { name: 'useState', status: 'untested', logs: [] },
    { name: 'Multiple States', status: 'untested', logs: [] },
  ]);
  
  const [debugInfo, setDebugInfo] = React.useState<Record<string, any>>({});
  
  // Gather debug info about the environment
  React.useEffect(() => {
    try {
      // Get browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
      };
      
      // Check localStorage
      let storageInfo = {};
      try {
        const keys = Object.keys(localStorage);
        storageInfo = {
          keys,
          items: keys.reduce((acc, key) => {
            const value = localStorage.getItem(key);
            // Truncate long values
            acc[key] = value && value.length > 50 
              ? value.substring(0, 47) + '...' 
              : value;
            return acc;
          }, {} as Record<string, string | null>),
        };
      } catch (err) {
        storageInfo = { error: String(err) };
      }
      
      setDebugInfo({
        browser: browserInfo,
        localStorage: storageInfo,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error gathering debug info:', err);
    }
  }, []);
  
  const runTest = (index: number, testFn: () => void) => {
    try {
      console.log(`Running test: ${branches[index].name}`);
      
      // Update branch status
      setBranches(prev => {
        const newBranches = [...prev];
        newBranches[index] = {
          ...newBranches[index],
          status: 'untested', // Reset to untested
          logs: [...newBranches[index].logs, `Test started at ${new Date().toISOString()}`],
        };
        return newBranches;
      });
      
      // Run the test
      testFn();
      
      // Mark as success
      setBranches(prev => {
        const newBranches = [...prev];
        newBranches[index] = {
          ...newBranches[index],
          status: 'success',
          logs: [...newBranches[index].logs, 'Test completed successfully'],
        };
        return newBranches;
      });
    } catch (err) {
      console.error(`Test failed: ${branches[index].name}`, err);
      
      // Mark as error
      setBranches(prev => {
        const newBranches = [...prev];
        newBranches[index] = {
          ...newBranches[index],
          status: 'error',
          logs: [...newBranches[index].logs, `Error: ${err instanceof Error ? err.message : String(err)}`],
        };
        return newBranches;
      });
    }
  };
  
  // Test functions
  const tests = [
    // Basic React
    () => {
      console.log('Basic React test passed');
    },
    
    // useCallback
    () => {
      const callback = React.useCallback(() => {
        console.log('Callback called');
      }, []);
      
      callback();
    },
    
    // useMemo
    () => {
      const memoized = React.useMemo(() => {
        console.log('Computing memoized value');
        return 42;
      }, []);
      
      console.log('Memoized value:', memoized);
    },
    
    // useState
    () => {
      const [counter, setCounter] = React.useState(0);
      setCounter(1);
      console.log('State updated to:', counter);
    },
    
    // Multiple States
    () => {
      // Create multiple state variables
      const [counter, setCounter] = React.useState(0);
      const [text, setText] = React.useState('');
      const [list, setList] = React.useState<string[]>([]);
      
      // Update them
      setCounter(1);
      setText('test');
      setList(['a', 'b', 'c']);
      
      // Log the values (prevents unused variable warnings)
      console.log({ counter, text, list });
      
      console.log('Multiple states updated');
    },
  ];
  
  // Helper for branch status styling
  const getStatusColor = (status: 'untested' | 'success' | 'error') => {
    switch (status) {
      case 'untested': return '#695e9e';
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
    }
  };
  
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#27224a',
      color: '#e2dbff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      minHeight: '100vh',
    }}>
      <h1 style={{ color: '#c1b3ff', margin: '0 0 20px' }}>Witch Coven - Standalone Tester</h1>
      <p>This is a minimal React app independent of the main application code.</p>
      
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => window.location.href = '/emergency.html'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4a3674',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Emergency Page
        </button>
        
        <button
          onClick={() => window.location.href = '/test.html'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4a3674',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Test Page
        </button>
        
        <button
          onClick={() => window.location.href = '/?minimal=true'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4a3674',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Minimal Version
        </button>
        
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#643b68',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear Storage
        </button>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '30px',
      }}>
        {branches.map((branch, index) => (
          <div
            key={branch.name}
            style={{
              padding: '15px',
              backgroundColor: '#1f1a35',
              borderRadius: '4px',
              borderLeft: `4px solid ${getStatusColor(branch.status)}`,
            }}
          >
            <h3 style={{ margin: '0 0 10px', color: '#c1b3ff' }}>{branch.name}</h3>
            <div style={{ fontSize: '14px', marginBottom: '10px' }}>
              Status: <span style={{ color: getStatusColor(branch.status) }}>
                {branch.status === 'untested' ? 'Not Tested' : branch.status === 'success' ? 'Success' : 'Error'}
              </span>
            </div>
            <button
              onClick={() => runTest(index, tests[index])}
              style={{
                padding: '8px 15px',
                backgroundColor: '#4a3674',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Run Test
            </button>
            {branch.logs.length > 0 && (
              <div style={{
                marginTop: '10px',
                backgroundColor: '#12101d',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '12px',
                maxHeight: '100px',
                overflowY: 'auto',
              }}>
                {branch.logs.map((log, i) => (
                  <div key={i} style={{ marginBottom: '4px' }}>{log}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{
        backgroundColor: '#1f1a35',
        padding: '15px',
        borderRadius: '4px',
        marginTop: '20px',
      }}>
        <h2 style={{ margin: '0 0 10px', color: '#c1b3ff' }}>Debug Information</h2>
        <pre style={{
          backgroundColor: '#12101d',
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '200px',
          fontSize: '14px',
        }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export function renderStandaloneApp() {
  try {
    console.log('Rendering standalone app...');
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Root element not found');
      return false;
    }
    
    const root = ReactDOM.createRoot(rootElement);
    root.render(<StandaloneApp />);
    console.log('Standalone app rendered successfully');
    return true;
  } catch (err) {
    console.error('Failed to render standalone app:', err);
    return false;
  }
}

export default StandaloneApp;