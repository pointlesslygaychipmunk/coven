// backend/src/ngrokConfig.ts
import { ServerOptions } from 'socket.io';
import { CorsOptions } from 'cors';

/**
 * Configuration optimized for Socket.IO behind ngrok tunnel
 */

// Get production mode from environment
const isProduction = process.env.NODE_ENV === 'production';

// Define allowed origins
export const corsOptions: CorsOptions = {
  // Allow all origins since ngrok URLs may change
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 'Authorization', 'X-Requested-With',
    'X-Forwarded-For', 'X-Forwarded-Proto'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Socket.IO server options optimized for ngrok
export const socketOptions: Partial<ServerOptions> = {
  cors: {
    origin: '*', // Allow all origins for ngrok flexibility
    methods: corsOptions.methods,
    credentials: corsOptions.credentials,
    allowedHeaders: corsOptions.allowedHeaders as string[]
  },
  // Longer timeouts for tunneled connections
  pingTimeout: 60000,         // 60 seconds ping timeout
  pingInterval: 25000,        // 25 seconds ping interval
  connectTimeout: 60000,      // 60 seconds connection timeout
  // Allow both transports with WebSocket strongly preferred
  transports: ['websocket', 'polling'],
  // Standard configuration
  path: '/socket.io/',
  serveClient: false,
  // Allow upgrades from polling to WebSocket
  allowUpgrades: true,
  // More forgiving connection parameters for tunnel
  forceNew: false,           // Don't force new connections
  reconnection: true,        // Enable reconnection
  reconnectionAttempts: 10,  // Try 10 times to reconnect
  reconnectionDelay: 1000,   // Start with 1s delay
  reconnectionDelayMax: 10000, // Max 10s delay between retries
  randomizationFactor: 0.5,  // Randomization factor for delay
  // Cookie settings
  cookie: {
    name: 'coven_io',
    httpOnly: true,
    secure: true, // Always secure with ngrok
    sameSite: 'none', // Required for cross-domain cookies
    maxAge: 86400 * 30 // 30 days
  }
};

// Function to log connection details
export function logConnectionDetails(req: any): void {
  if (!req || !req.headers) return;
  
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'Unknown';
    const host = req.headers['host'] || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    console.log(`[ConnectionDetails] Connection from IP: ${ip}`);
    console.log(`[ConnectionDetails] Protocol: ${proto}, Host: ${host}`);
    console.log(`[ConnectionDetails] User-Agent: ${userAgent.substring(0, 100)}`);
    
    // Log ngrok-specific headers if present
    if (req.headers['x-forwarded-host']) {
      console.log(`[ConnectionDetails] Forwarded Host: ${req.headers['x-forwarded-host']}`);
    }
  } catch (err) {
    // Ignore logging errors
  }
}