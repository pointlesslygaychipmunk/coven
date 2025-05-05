/**
 * Socket.IO Connection Fix Utilities for ngrok
 * 
 * Special utilities to fix Socket.IO connection issues when using ngrok HTTPS tunnels.
 */

import { io, Socket } from 'socket.io-client';
import { NGROK_URL, socketOptions } from './ngrokSocketConfig';

// Connection state tracking
let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Creates or returns an existing Socket.IO connection
 * Optimized for ngrok tunneling with HTTPS
 */
export function getSocketConnection(): Socket {
  // Return existing socket if it's connected
  if (socket && socket.connected) {
    return socket;
  }
  
  // Close existing socket if it exists but is disconnected
  if (socket) {
    try {
      socket.close();
    } catch (e) {
      console.warn('Error closing existing socket:', e);
    }
  }
  
  // Create new connection using ngrok URL
  console.log(`[ConnectionFix] Creating connection to ${NGROK_URL}`);
  socket = io(NGROK_URL, socketOptions);
  
  // Set up enhanced error handling
  setupErrorHandling(socket);
  
  return socket;
}

/**
 * Sets up enhanced error handling for Socket.IO connection
 */
function setupErrorHandling(socket: Socket): void {
  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('[ConnectionFix] Socket connection error:', error.message);
    
    // Increment attempt counter
    reconnectAttempts++;
    
    if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
      console.error(`[ConnectionFix] Failed to connect after ${MAX_RECONNECT_ATTEMPTS} attempts.`);
      
      // Display user-friendly error in console
      console.warn('=== CONNECTION TROUBLESHOOTING ===');
      console.warn('1. Check that the ngrok URL is correct in ngrokSocketConfig.ts');
      console.warn('2. Verify that the backend server is running');
      console.warn('3. Make sure ngrok is running and the tunnel is active');
      console.warn('4. Check browser console for CORS or certificate errors');
      
      // Reset counter after providing help
      reconnectAttempts = 0;
    }
  });
  
  // Reset counter on successful connection
  socket.on('connect', () => {
    reconnectAttempts = 0;
    console.log(`[ConnectionFix] Connected to server via ngrok with socket ID: ${socket?.id}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`[ConnectionFix] Disconnected: ${reason}`);
    
    // Socket.IO has automatic reconnection, but we can add custom logic
    if (reason === 'io server disconnect') {
      // Server disconnected us, we need to manually reconnect
      socket.connect();
    }
  });
}

/**
 * Checks the health of the current Socket.IO connection
 * @returns Connection details object
 */
export function checkConnectionHealth(): {
  connected: boolean;
  reconnecting: boolean;
  attempts: number;
  transport?: string;
} {
  if (!socket) {
    return {
      connected: false,
      reconnecting: false,
      attempts: 0
    };
  }
  
  return {
    connected: socket.connected,
    reconnecting: socket.disconnected,
    attempts: reconnectAttempts,
    transport: socket.connected ? socket.io.engine.transport.name : undefined
  };
}

/**
 * Forcefully reconnects the socket
 */
export function forceReconnect(): void {
  if (socket) {
    socket.disconnect();
    socket.connect();
    console.log('[ConnectionFix] Forced reconnection attempt initiated');
  } else {
    socket = getSocketConnection();
    console.log('[ConnectionFix] New connection initiated');
  }
}

/**
 * Closes the socket connection
 */
export function closeConnection(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[ConnectionFix] Connection closed');
  }
}

/**
 * Reset connection status and try joining game
 */
export function resetConnectionAndJoin(playerId?: string, playerName?: string): void {
  if (!socket || !socket.connected) {
    console.error("[ConnectionFix] Cannot rejoin - socket not connected");
    socket = getSocketConnection();
  }
  
  try {
    // Get saved player info from local storage
    const savedPlayerId = playerId || localStorage.getItem('coven_player_id');
    const savedPlayerName = playerName || localStorage.getItem('coven_player_name');
    
    if (savedPlayerId && savedPlayerName && socket) {
      console.log(`[ConnectionFix] Attempting to rejoin as ${savedPlayerName}`);
      socket.emit('player:join', { playerName: savedPlayerName, playerId: savedPlayerId });
    } else {
      console.log("[ConnectionFix] No saved player info found - cannot auto-rejoin");
    }
  } catch (err) {
    console.error("[ConnectionFix] Error rejoining:", err);
  }
}