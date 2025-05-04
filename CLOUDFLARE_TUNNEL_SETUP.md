# Cloudflare Tunnel Setup for Witch's Coven

This guide explains how to configure Cloudflare Tunnels to work with the Socket.IO-based multiplayer system in Witch's Coven.

## Understanding the Issue

Cloudflare Tunnels can block WebSocket connections, causing issues with Socket.IO's default connection behavior. We've updated the codebase to use HTTP long-polling exclusively for Cloudflare compatibility, but you'll still need to configure your Cloudflare Tunnel correctly.

## Recommended Cloudflare Tunnel Configuration

### 1. Install and Configure Cloudflare Tunnel

If you haven't already, install and set up Cloudflare Tunnel:

```bash
# Download and install cloudflared
brew install cloudflared  # macOS
# Or for other platforms, see Cloudflare docs

# Authenticate
cloudflared tunnel login

# Create a tunnel
cloudflared tunnel create witches-coven

# Configure your tunnel
```

### 2. Create a Configuration File

Create a file named `config.yml` with the following content:

```yaml
tunnel: <YOUR-TUNNEL-ID>
credentials-file: /path/to/your/credentials/file.json

# Socket.IO compatibility settings - CRITICAL
ingress:
  - hostname: playcoven.com
    service: http://localhost:8080
    originRequest:
      connectTimeout: 60s
      idleTimeout: 120s
      noTLSVerify: true
      disableChunkedEncoding: true
      keepAliveConnections: 1024
      keepAliveTimeout: 30s
      httpHostHeader: playcoven.com
      proxyAddresses: true
      proxyPort: true

  # Catch-all rule at the end
  - service: http_status:404
```

The important options for Socket.IO compatibility are:
- `connectTimeout: 60s` - Longer connection timeout
- `idleTimeout: 120s` - Longer idle timeout for long-polling
- `disableChunkedEncoding: true` - Helps with certain Socket.IO payloads
- `keepAliveConnections: 1024` - Increase connection limit
- `proxyAddresses: true` and `proxyPort: true` - Pass client IP info

### 3. DNS Configuration

Ensure your DNS records are properly configured in Cloudflare:

1. Go to the Cloudflare dashboard
2. Select your domain
3. Go to DNS settings
4. Add a CNAME record:
   - Name: @ (or subdomain like "play")
   - Target: your-tunnel-id.cfargotunnel.com
   - Proxy status: Proxied (orange cloud)

### 4. HTTP Headers Configuration

For better compatibility, adjust the following settings in Cloudflare:

1. Go to Rules → Transform Rules
2. Create a new rule:
   - Name: "Socket.IO Compatibility"
   - Condition: Hostname is "playcoven.com"
   - Action: Add HTTP Response Headers:
     - `Access-Control-Allow-Origin: https://playcoven.com`
     - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
     - `Access-Control-Allow-Headers: Content-Type`
     - `Access-Control-Allow-Credentials: true`

### 5. Adjust SSL/TLS Settings

For optimal Socket.IO polling performance:

1. Go to SSL/TLS → Edge Certificates
2. Ensure "Always Use HTTPS" is enabled
3. Set "Minimum TLS Version" to TLS 1.2
4. Under "Origin Server":
   - Set "Authentication Type" to "No TLS Verification"

## Testing the Configuration

After setting up your Cloudflare Tunnel, test it by:

1. Starting your Witch's Coven game server
2. Running the Cloudflare Tunnel:
   ```bash
   cloudflared tunnel run witches-coven
   ```
3. Visit your site (e.g., https://playcoven.com)
4. Check the browser console for any Socket.IO connection errors

## Socket.IO Debug Mode

To enable more detailed Socket.IO debug logs:

1. Add this to your browser console:
   ```javascript
   localStorage.debug = 'socket.io-client:*';
   ```
2. Refresh the page
3. Check the console for detailed Socket.IO connection logs

## Diagnostic Endpoints

The server provides these diagnostic endpoints:

- `/health-check` - Simple server health check
- `/socketio-debug` - Socket.IO connection details
- `/multiplayer-diagnostics` - Detailed multiplayer statistics

## Manual Connection Test

If issues persist, paste this in the browser console:

```javascript
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
  console.log("Error details:", err.message);
});
```

## Still Having Issues?

If you're still experiencing problems:

1. Check server logs for detailed error information
2. Try accessing your site via direct IP (bypassing Cloudflare) to confirm if Cloudflare is the issue
3. Test with the emergency script in CLOUDFLARE_TUNNEL_DEBUG.md