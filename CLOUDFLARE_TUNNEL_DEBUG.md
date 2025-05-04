# Debugging Socket.IO Connection Issues with Cloudflare Tunnels

This document provides instructions for troubleshooting Socket.IO connection issues when using Cloudflare Tunnels with the Witch's Coven game.

## Cloudflare Tunnel Configuration Issues

Cloudflare Tunnels can cause connection issues with WebSockets. The primary issues and solutions are:

### 1. Transport Incompatibility

**Problem**: Cloudflare Tunnels may block WebSocket connections, causing "server error" messages.

**Solution**: The codebase has been updated to use Socket.IO's HTTP long-polling transport instead of WebSockets, which is more compatible with Cloudflare Tunnels.

### 2. Verifying Your Configuration

To ensure your Cloudflare Tunnel is properly configured for Socket.IO:

1. Check that your Cloudflare Tunnel configuration allows WebSockets or HTTP long-polling.
2. Make sure your application is configured to use only HTTP long-polling (already done in the code).

## Checking Connection Status

When experiencing connection issues:

1. Open your browser's Developer Tools (F12 or Ctrl+Shift+I)
2. Go to the Console tab
3. Look for messages starting with `[Socket:EMERGENCY]` which contain diagnostic information
4. Check for errors like "server error" or "Connection error"

## Manual Connection Test

You can test the connection directly using the browser console:

```javascript
// Paste this in browser console when on playcoven.com
console.log("Testing emergency direct connection to server");
const socket = io(window.location.origin, {
  transports: ['polling'],
  reconnection: false,
  timeout: 60000,
  forceNew: true,
  path: '/socket.io/',
  query: {
    client: 'manual-test',
    time: Date.now().toString()
  }
});

socket.on('connect', () => {
  console.log("✅ CONNECTED SUCCESSFULLY", socket.id);
});

socket.on('connect_error', (err) => {
  console.error("❌ CONNECTION ERROR", err);
});
```

## Additional Cloudflare Configuration Tips

If you continue experiencing issues, try these Cloudflare configuration adjustments:

1. **Increase timeouts in Cloudflare**:
   - Go to Cloudflare Dashboard > Your Domain > Network
   - Increase the "WebSockets Connection Timeout" setting if available

2. **Enable WebSockets in Cloudflare Tunnel**:
   - In your Cloudflare Tunnel configuration, add or modify the "Additional application settings" to include:
   ```
   noTLSVerify: true
   originRequest:
     connectTimeout: 60s
     idleTimeout: 120s
     enableWebSockets: true
   ```

3. **Test Bypassing Cloudflare Temporarily**:
   - If possible, temporarily create a direct connection to your server (not through Cloudflare) to confirm if Cloudflare is the issue

## Emergency Connection Script

For quick troubleshooting when facing connection issues, the following script can be pasted into the browser console:

```javascript
// EMERGENCY CONNECTION HELPER
// Paste this in browser console when connection fails
(async function() {
  console.log("🔧 EMERGENCY SOCKET.IO CONNECTION HELPER");
  console.log("🧹 Clearing all coven session storage...");
  
  // Clear session storage
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('coven_')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Get saved player info
  const playerId = localStorage.getItem('coven_player_id');
  const playerName = localStorage.getItem('coven_player_name');
  
  console.log(`ℹ️ Saved player: ${playerName || 'Unknown'} (${playerId || 'No ID'})`);
  console.log("🔄 Attempting direct server connection with polling transport...");
  
  // Create direct socket connection
  const socket = io(window.location.origin, {
    transports: ['polling'],
    reconnection: false,
    timeout: 60000,
    forceNew: true,
    path: '/socket.io/',
    query: {
      client: 'emergency-script',
      time: Date.now().toString()
    }
  });
  
  // Handle connection events
  socket.on('connect', () => {
    console.log("✅ CONNECTED SUCCESSFULLY", socket.id);
    
    // Try to rejoin if we have player info
    if (playerId && playerName) {
      console.log("👤 Attempting to rejoin as", playerName);
      socket.emit('player:join', { playerName, playerId });
    } else {
      console.log("❌ No saved player info - cannot auto-rejoin");
      console.log("Please refresh the page and try again");
    }
  });
  
  socket.on('connect_error', (err) => {
    console.error("❌ CONNECTION ERROR", err);
    console.log("Connection details:");
    console.log("- Browser online:", navigator.onLine);
    console.log("- Protocol:", window.location.protocol);
    console.log("- Host:", window.location.host);
    console.log("Try refreshing the page to see if it resolves the issue");
  });
  
  socket.on('player:joined', (data) => {
    console.log("✅ PLAYER JOINED:", data);
    console.log("🎮 You can now continue playing");
    console.log("If the game UI doesn't update, please refresh the page");
  });
  
  socket.on('error', (error) => {
    console.error("❌ SERVER ERROR:", error);
  });
  
  // Return the socket for further testing
  return socket;
})();
```

## Contact Support

If you continue to experience connection issues after trying these solutions, please contact support with the following information:

1. Screenshots of any error messages from the browser console
2. Your Cloudflare Tunnel configuration (with sensitive information redacted)
3. Time and date of connection attempts

## Updates Made to Fix Cloudflare Tunnel Issues

The following changes have been implemented specifically to address Cloudflare Tunnel compatibility:

1. **Client-side changes**:
   - Socket.IO configured to use polling transport only
   - Increased connection timeouts
   - Added special handling for "server error" messages
   - Implemented fallback connection strategies

2. **Server-side changes**:
   - Socket.IO configured to use polling transport only
   - Added secure cookie configuration
   - Updated CORS settings for tighter security
   - Enhanced error handling and logging

These changes should resolve the primary issues with Cloudflare Tunnels while maintaining all game functionality.