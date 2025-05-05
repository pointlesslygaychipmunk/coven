// frontend/src/services/ngrokSocketConfig.ts
import { Socket, io } from 'socket.io-client';

/**
 * Socket.IO client configuration for connecting to a server via ngrok
 * 
 * IMPORTANT: Replace NGROK_URL with your actual ngrok URL (https://xxxx.ngrok.io)
 */

// URL from your current ngrok tunnel
export const NGROK_URL = 'https://5549-73-162-3-49.ngrok-free.app';

// Connection options optimized for ngrok
export const socketOptions = {
  // Important: Always use secure WebSocket (wss://) when connecting via HTTPS
  transports: ['websocket', 'polling'],
  forceNew: false,
  // Reconnection settings
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  randomizationFactor: 0.5,
  // Timeouts
  timeout: 20000,
  // Always use HTTPS with ngrok
  secure: true,
  // Path must match server configuration
  path: '/socket.io/'
};

// Create connection function
export function connectToNgrokServer(): Socket {
  // Validate URL
  if (NGROK_URL === 'https://xxxx.ngrok.io') {
    console.error('⚠️ ERROR: You must update the NGROK_URL in ngrokSocketConfig.ts with your actual ngrok URL!');
    alert('Socket.IO Configuration Error: Please update the ngrok URL in ngrokSocketConfig.ts');
  }
  
  console.log(`Connecting to Socket.IO server at ${NGROK_URL}`);
  
  // Create and configure the socket
  const socket = io(NGROK_URL, socketOptions);
  
  // Setup event handlers
  socket.on('connect', () => {
    console.log(`✅ Connected to server via ngrok with socket ID: ${socket.id}`);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`❌ Disconnected from server: ${reason}`);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  return socket;
}

// Helper to check connection health
export function checkConnectionHealth(socket: Socket): {
  connected: boolean,
  transport: string | null,
  ping: number | null
} {
  const transport = socket.connected ? socket.io.engine.transport.name : null;
  const ping = socket.connected ? socket.io.engine.pingTimeout : null;
  
  return {
    connected: socket.connected,
    transport,
    ping
  };
}