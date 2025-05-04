# Production Debugging Guide

This guide contains specific steps to diagnose and fix Socket.IO connection issues in your production environment at playcoven.com.

## 1. Check Server Socket.IO Version

The "server error" message typically indicates a Socket.IO version mismatch or configuration issue. First, check your server's Socket.IO version:

```bash
# On your server
cd /path/to/backend
npm ls socket.io
npm ls socket.io-client
```

Make sure both the client and server are using compatible versions. Socket.IO has strict version compatibility requirements.

## 2. Run the Diagnostics Script

We've included a diagnostics script to help identify server issues:

```bash
# On your server
cd /path/to/backend
node src/diagnostics.js
```

This will show details about your server environment, network, and Socket.IO configuration.

## 3. Check Server Logs

Look for any errors in your server logs that might indicate the source of the "server error":

```bash
# If you're using PM2
pm2 logs

# If you're using systemd
journalctl -u your-service-name

# Direct log files
cat /path/to/your/backend.log
```

Key errors to look for:
- CORS errors
- Socket.IO connection failures
- Transport errors

## 4. Test Basic HTTP Connectivity

Make sure the server can handle basic HTTP requests:

```bash
curl http://playcoven.com/health-check
```

This should return "OK" if the server is running and reachable.

## 5. Check Server Firewall and Proxy Settings

If you're using a proxy like Nginx or Apache, make sure it's configured to pass WebSocket connections:

### Nginx Example:
```
location /socket.io/ {
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

### Apache Example:
```
ProxyPass /socket.io/ ws://localhost:8080/socket.io/
ProxyPassReverse /socket.io/ ws://localhost:8080/socket.io/
```

## 6. Test With Socket.IO Client

Try connecting with a simple Socket.IO client to isolate the issue:

```javascript
// Save as test.js
const io = require('socket.io-client');
const socket = io('https://playcoven.com', {
  transports: ['polling', 'websocket']
});

socket.on('connect', () => {
  console.log('Connected with ID:', socket.id);
  socket.close();
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err);
});
```

Run with: `node test.js`

## 7. Emergency Server Fix

If none of the above steps help, we can temporarily modify the server code to use a simpler Socket.IO configuration:

```javascript
// Minimum Socket.IO server configuration
this.io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins temporarily
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling'], // Polling only for maximum compatibility
  pingTimeout: 60000,
  pingInterval: 25000,
});
```

## 8. Client-Side Workaround

For an immediate client-side fix, users can run this in their browser console:

```javascript
// Emergency direct connection
(function() {
  try {
    const socketUrl = window.location.origin;
    const socket = io(socketUrl, {
      transports: ['polling'], 
      reconnection: false,
      timeout: 60000,
      forceNew: true
    });
    
    socket.on('connect', () => {
      console.log('EMERGENCY CONNECTION SUCCESSFUL!');
      window._emergencySocket = socket;
    });
    
    socket.on('connect_error', (err) => {
      console.error('Emergency connection error:', err);
    });
  } catch (e) {
    console.error('Error in emergency connection:', e);
  }
})();
```

## Next Steps

If you install Claude on your server, I can help you:

1. Examine the detailed server logs
2. Fix any configuration issues 
3. Identify version compatibility problems
4. Implement the optimal Socket.IO setup for your environment

The most important thing is to get detailed error logs from the server to understand exactly why the "server error" is occurring.