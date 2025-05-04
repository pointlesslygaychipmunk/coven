/**
 * Connection Diagnostics Utility
 * 
 * This file provides tools for monitoring and diagnosing WebSocket connection
 * issues in the browser environment. It's useful for production troubleshooting.
 */

// Interface for connection test results
interface ConnectionTestResult {
  success: boolean;
  latency?: number;
  error?: string;
  details?: any;
}

// Interface for connection diagnostic report
export interface ConnectionDiagnosticsReport {
  timestamp: number;
  navigatorOnline: boolean;
  secureContext: boolean;
  webSocketSupport: boolean;
  userAgent: string;
  connectionInfo: {
    protocol: string;
    hostname: string;
    port: string;
    pathname: string;
  };
  networkInfo: {
    type?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
  tests: {
    httpRequest?: ConnectionTestResult;
    socketIoConnection?: ConnectionTestResult;
    webSocketConnection?: ConnectionTestResult;
    corsTest?: ConnectionTestResult;
  };
  connectionHistory: Array<{
    event: string;
    timestamp: number;
    details?: any;
  }>;
}

// In-memory history of connection events for diagnostics
const connectionHistory: Array<{
  event: string;
  timestamp: number;
  details?: any;
}> = [];

// Maximum number of history items to keep
const MAX_HISTORY_ITEMS = 50;

/**
 * Log a connection event to the history
 */
export function logConnectionEvent(event: string, details?: any): void {
  connectionHistory.unshift({
    event,
    timestamp: Date.now(),
    details
  });
  
  // Trim history if needed
  if (connectionHistory.length > MAX_HISTORY_ITEMS) {
    connectionHistory.pop();
  }
  
  // Also log to console for debugging
  console.log(`[ConnectionDiagnostics] ${event}`, details);
}

/**
 * Get network information if available
 */
function getNetworkInfo(): any {
  // Check if the Network Information API is available
  // @ts-ignore - Navigator connection property is not in standard types
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection) {
    return {
      type: connection.type,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    };
  }
  
  return {};
}

/**
 * Test HTTP connectivity to the server
 */
async function testHttpConnectivity(url: string): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  try {
    // Send a request to the health endpoint
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      return {
        success: false,
        latency: Date.now() - startTime,
        error: `HTTP Error: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    
    return {
      success: true,
      latency: Date.now() - startTime,
      details: data
    };
  } catch (error) {
    return {
      success: false,
      latency: Date.now() - startTime,
      error: error.message || 'Unknown HTTP request error'
    };
  }
}

/**
 * Test a raw WebSocket connection
 */
async function testWebSocketConnection(url: string): Promise<ConnectionTestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let timeoutId: number | null = null;
    
    try {
      // Convert http/https to ws/wss
      const wsUrl = url.replace(/^http/, 'ws');
      const ws = new WebSocket(`${wsUrl}/socket.io/?EIO=4&transport=websocket`);
      
      // Set a timeout in case the connection hangs
      timeoutId = window.setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          resolve({
            success: false,
            latency: Date.now() - startTime,
            error: 'WebSocket connection timed out after 5 seconds'
          });
        }
      }, 5000);
      
      ws.onopen = () => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve({
          success: true,
          latency: Date.now() - startTime,
          details: {
            readyState: ws.readyState,
            protocol: ws.protocol
          }
        });
        
        // Send a close message and terminate the test socket
        ws.close();
      };
      
      ws.onerror = (error) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve({
          success: false,
          latency: Date.now() - startTime,
          error: 'WebSocket error: Unable to establish connection'
        });
      };
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({
        success: false,
        latency: Date.now() - startTime,
        error: error.message || 'Unknown WebSocket error'
      });
    }
  });
}

/**
 * Generate a comprehensive connection diagnostics report
 */
export async function generateConnectionReport(serverUrl?: string): Promise<ConnectionDiagnosticsReport> {
  // Use current origin if no URL provided
  const url = serverUrl || window.location.origin;
  
  // Log that we're running diagnostics
  logConnectionEvent('running_diagnostics', { url });
  
  // Get basic browser information
  const report: ConnectionDiagnosticsReport = {
    timestamp: Date.now(),
    navigatorOnline: navigator.onLine,
    secureContext: window.isSecureContext,
    webSocketSupport: 'WebSocket' in window,
    userAgent: navigator.userAgent,
    connectionInfo: {
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80'),
      pathname: window.location.pathname
    },
    networkInfo: getNetworkInfo(),
    tests: {},
    connectionHistory: [...connectionHistory]
  };
  
  // Run connection tests
  try {
    // Test HTTP connectivity first
    report.tests.httpRequest = await testHttpConnectivity(url);
    logConnectionEvent('http_test_completed', { 
      success: report.tests.httpRequest.success,
      latency: report.tests.httpRequest.latency
    });
    
    // Only run WebSocket tests if HTTP test succeeded
    if (report.tests.httpRequest.success) {
      // Test raw WebSocket
      report.tests.webSocketConnection = await testWebSocketConnection(url);
      logConnectionEvent('websocket_test_completed', { 
        success: report.tests.webSocketConnection.success,
        latency: report.tests.webSocketConnection.latency
      });
    }
  } catch (e) {
    logConnectionEvent('diagnostics_error', { error: e.message });
  }
  
  return report;
}

/**
 * Utility function to check if connection failures are likely due to CORS issues
 */
export function isCORSIssue(report: ConnectionDiagnosticsReport): boolean {
  const httpSuccess = report.tests.httpRequest?.success;
  const wsFailure = report.tests.webSocketConnection && !report.tests.webSocketConnection.success;
  
  // If HTTP works but WebSocket doesn't, it might be a CORS issue
  // especially if we're in a secure context
  return httpSuccess && wsFailure && report.secureContext && 
    window.location.protocol === 'https:';
}

/**
 * Get a human-readable summary of connection issues
 */
export function getConnectionIssuesSummary(report: ConnectionDiagnosticsReport): string {
  if (!report.navigatorOnline) {
    return "Your device appears to be offline. Please check your internet connection.";
  }
  
  if (!report.webSocketSupport) {
    return "Your browser doesn't support WebSockets, which are required for real-time gameplay.";
  }
  
  if (!report.tests.httpRequest?.success) {
    return "Unable to connect to the game server. Please check your internet connection or try again later.";
  }
  
  if (!report.tests.webSocketConnection?.success) {
    if (isCORSIssue(report)) {
      return "Your connection appears to be blocked by security settings (CORS). Try using the same protocol (HTTP/HTTPS) as the server.";
    }
    return "Unable to establish a real-time connection. Your network may be blocking WebSocket connections.";
  }
  
  return "No connection issues detected.";
}

// Export the utility
export default {
  logConnectionEvent,
  generateConnectionReport,
  getConnectionIssuesSummary
};