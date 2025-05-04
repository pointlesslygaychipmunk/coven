/**
 * Simple connection debugger to help diagnose Socket.IO connection issues
 */

export function diagnoseConnection() {
  console.log('=== CONNECTION DIAGNOSTICS ===');
  
  // Basic browser environment info
  console.log('Browser Environment:');
  console.log(`- Online: ${navigator.onLine}`);
  console.log(`- User Agent: ${navigator.userAgent}`);
  console.log(`- Secure Context: ${window.isSecureContext}`);
  console.log(`- Page Protocol: ${window.location.protocol}`);
  console.log(`- Page Origin: ${window.location.origin}`);
  
  // Check for supported WebSocket
  console.log('\nWebSocket Support:');
  console.log(`- WebSocket Available: ${'WebSocket' in window}`);
  if ('WebSocket' in window) {
    try {
      const testSocket = new WebSocket('wss://echo.websocket.org');
      console.log(`- Test WebSocket Created: true`);
      testSocket.onopen = () => {
        console.log(`- Test WebSocket Connection: SUCCESS`);
        testSocket.close();
      };
      testSocket.onerror = (error) => {
        console.log(`- Test WebSocket Connection: FAILED`, error);
      };
    } catch (err) {
      console.log(`- Test WebSocket Creation: FAILED`, err);
    }
  }
  
  // Check for Socket.IO library
  console.log('\nSocket.IO:');
  if ('io' in window) {
    console.log(`- Socket.IO Available: true`);
  } else {
    console.log(`- Socket.IO Available: false (not loaded)`);
  }
  
  // Check for browser storage
  console.log('\nStorage:');
  try {
    localStorage.setItem('test', 'test');
    console.log(`- localStorage: AVAILABLE`);
    localStorage.removeItem('test');
  } catch (err) {
    console.log(`- localStorage: NOT AVAILABLE`, err);
  }
  
  try {
    sessionStorage.setItem('test', 'test');
    console.log(`- sessionStorage: AVAILABLE`);
    sessionStorage.removeItem('test');
  } catch (err) {
    console.log(`- sessionStorage: NOT AVAILABLE`, err);
  }
  
  // Check for network connectivity
  console.log('\nNetwork Check:');
  fetch(window.location.origin, { method: 'HEAD' })
    .then(() => console.log(`- Origin fetch: SUCCESS`))
    .catch(err => console.log(`- Origin fetch: FAILED`, err));
  
  // Test the socket endpoint directly (with respect to CORS)
  const socketUrl = window.location.origin;
  console.log(`- Testing socket endpoint: ${socketUrl}`);
  
  fetch(socketUrl, { method: 'GET' })
    .then(response => console.log(`- Socket URL fetch: ${response.status} ${response.statusText}`))
    .catch(err => console.log(`- Socket URL fetch: FAILED`, err));
  
  // Console message
  console.log('\nTo debug further, copy this output and provide it to the developer.');
  console.log('=== END DIAGNOSTICS ===');
}

export function clearAllStorageValues(): void {
  console.log('Clearing ALL browser storage values...');
  
  try {
    // Clear session storage
    console.log('Clearing session storage...');
    sessionStorage.clear();
    
    // Clear local storage 
    console.log('Clearing local storage...');
    localStorage.clear();
    
    // Clear specific keys related to socket connections
    const keysToCheck = [
      'coven_reconnect_attempt_counter',
      'coven_reconnect_start_time',
      'coven_reconnect_start_time_v2',
      'coven_socket_last_url',
      'coven_player_id',
      'coven_player_name'
    ];
    
    keysToCheck.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`Removed localStorage key: ${key}`);
        localStorage.removeItem(key);
      }
      
      if (sessionStorage.getItem(key)) {
        console.log(`Removed sessionStorage key: ${key}`);
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('ALL storage values cleared. Please refresh the page.');
  } catch (err) {
    console.error('Error clearing storage:', err);
  }
}

// Helper function to log Socket.IO-specific information
export function debugSocketConnection(socket: any) {
  if (!socket) {
    console.log('Socket object is not available');
    return;
  }
  
  console.log('=== SOCKET.IO CONNECTION DEBUG ===');
  console.log(`Connected: ${socket.connected}`);
  console.log(`ID: ${socket.id || 'Not connected'}`);
  console.log(`Namespace: ${socket.nsp || '/'}`);
  
  if (socket.io) {
    console.log(`Engine: ${socket.io.engine?.transport?.name || 'unknown'}`);
    console.log(`URI: ${socket.io.uri || 'unknown'}`);
    console.log(`Reconnection attempts: ${socket.io.reconnectionAttempts || 0}`);
    console.log(`Backoff delay: ${socket.io.backoff?.duration || 0}ms`);
  }
  
  if (socket.auth) {
    console.log(`Auth: ${JSON.stringify(socket.auth)}`);
  }
  
  console.log('=== END SOCKET DEBUG ===');
}

// Test server connection before attempting WebSocket
export async function testServerConnection(serverUrl: string): Promise<boolean> {
  console.log(`Testing server connection to ${serverUrl}/api/connection-test/status...`);
  
  try {
    // Add timestamp to prevent caching
    const testUrl = `${serverUrl}/api/connection-test/status?_=${Date.now()}`;
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Server connection test successful:', data);
      return true;
    } else {
      console.error(`Server connection test failed: HTTP ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error('Server connection test failed with error:', error);
    return false;
  }
}

// Execute diagnostics automatically
diagnoseConnection();