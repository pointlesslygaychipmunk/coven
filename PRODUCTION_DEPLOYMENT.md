# Production Deployment Guide - playcoven.com

This guide contains specific instructions for deploying the game to playcoven.com and fixing the current connection issues.

## Critical Issues Fixed

1. **CORS Configuration**: The server was blocking connections from the client domain
2. **Socket.IO Transport**: The server was preferring WebSocket when polling is more reliable
3. **Connection Timeouts**: Timeouts were too short for production environments
4. **Error Handling**: Better error handling and diagnostics for production

## Deployment Steps

### 1. Update Backend CORS Configuration

In `backend/src/server.ts`, ensure your CORS configuration matches:

```typescript
// PRODUCTION CORS CONFIGURATION - FIXED FOR PLAYCOVEN.COM
const corsOptions = {
  // Set specific allowed origins for production
  origin: isProduction ? 
    // Production domains - MUST match your actual domain exactly
    [
      'https://playcoven.com',
      'http://playcoven.com',
      'https://www.playcoven.com',
      'http://www.playcoven.com',
      // Allow direct IP access if needed
      'http://localhost:3000',
      'http://localhost:8080',
      'https://localhost:8443'
    ] : 
    '*', // In development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  // Add cache control for preflight requests in production
  maxAge: isProduction ? 86400 : 3600 // 24 hours in production, 1 hour in development
};
```

### 2. Update Socket.IO Server Configuration

In `backend/src/multiplayer.ts`, update the Socket.IO configuration:

```typescript
// Initialize Socket.IO with enhanced configuration for production
this.io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Same origins as above
    methods: ["GET", "POST"],
    credentials: true,
    maxAge: isProduction ? 86400 : 3600 
  },
  // Increase timeouts for more reliability in production
  pingTimeout: 60000,                  // 60 seconds ping timeout
  pingInterval: 25000,                 // 25 seconds ping interval
  connectTimeout: 60000,               // 60 seconds connection timeout
  upgradeTimeout: 30000,               // 30 seconds upgrade timeout
  maxHttpBufferSize: 1e8,              // 100 MB buffer size
  // CRITICAL: Allow both transport types but prefer POLLING in production
  transports: ['polling', 'websocket'], // Polling first is more compatible
  allowEIO3: true,                      // Allow both v3 and v4 clients
  serveClient: false,                   // Don't serve client files
});
```

### 3. Update Client Socket.IO Configuration

In `frontend/src/services/socketService.ts`, ensure the client configuration matches the server:

```typescript
// Create socket with settings matching server configuration
this._socket = io(serverUrl, {
  transports: ['polling', 'websocket'], // Must match server configuration
  reconnection: false,                  // We handle reconnection ourselves
  timeout: 60000,                       // Match server timeout
  forceNew: true,                       
  autoConnect: true,                    
  path: '/socket.io/',                  
  query: {                              
    client: 'production',
    time: Date.now().toString()
  }
});
```

### 4. Build and Deploy

1. **Build the frontend**:
   ```
   cd frontend
   npm run build
   ```

2. **Build the backend**:
   ```
   cd backend
   npm run build
   ```

3. **Deploy to your server**:
   ```
   # Copy the dist folders to your server
   ```

4. **Restart the server**:
   ```
   # On your server
   pm2 restart server.js  # or whatever process manager you use
   ```

## Troubleshooting

If you still experience connection issues:

1. **Check the browser console** for any errors related to CORS or connection failures
2. **Verify your server logs** for any error messages
3. **Ensure your server's firewall** allows connections on the required ports
4. **Test with a basic HTTP request** to ensure the server is reachable
5. **Check your domain DNS configuration** is pointing to the correct server IP

## Verifying the Fix

1. Load the site at https://playcoven.com
2. Open the browser console (F12)
3. Look for successful connection messages
4. The game should connect automatically without infinite loops

If issues persist, please provide more specific error messages from both the client console and server logs.