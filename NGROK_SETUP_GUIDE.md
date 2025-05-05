# Using ngrok for Secure WebSocket Connections with HTTPS

This guide explains how to set up and use ngrok to expose your local Witch's Coven game server with HTTPS.

## What You'll Get

- A public HTTPS URL that securely tunnels to your local server
- WebSocket support via WSS (secure WebSockets)
- Real-time inspection of traffic for debugging
- No need for router configuration or port forwarding

## Setup Steps

### 1. Create ngrok Account

1. Visit https://ngrok.com/ and sign up for a free account
2. After registration, go to the dashboard and copy your authtoken

### 2. Install ngrok

**Windows:**
- Download the ZIP file from https://ngrok.com/download
- Extract the ZIP to a location on your computer
- Open Command Prompt and navigate to where you extracted ngrok
- Run: `ngrok authtoken YOUR_AUTH_TOKEN`

**Mac:**
```
brew install ngrok/ngrok/ngrok
ngrok authtoken YOUR_AUTH_TOKEN
```

**Linux:**
```
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
ngrok authtoken YOUR_AUTH_TOKEN
```

### 3. Run the Update Script

We've created a script that sets up the server and starts ngrok:

```
chmod +x update-for-ngrok.sh
./update-for-ngrok.sh
```

The script will:
1. Build your backend server
2. Start the server on port 8080
3. Create an ngrok tunnel to that port

### 4. Configure Frontend

After starting ngrok, you'll see a URL like `https://abc123.ngrok.io` displayed.

Open `/mnt/c/new-coven/frontend/src/services/ngrokSocketConfig.ts` and update:

```typescript
export const NGROK_URL = 'https://abc123.ngrok.io'; // Replace with your actual ngrok URL
```

### 5. Build and Run Frontend

```
cd frontend
npm run build
npm run preview
```

## Testing the Connection

1. Open your frontend application
2. Check the browser console for WebSocket connection status
3. Verify that you see "Connected to server via ngrok with socket ID: [ID]"

## Troubleshooting

### Connection Issues

- **Error: "Failed to connect to server"**
  - Make sure your backend server is running
  - Check that you've updated the NGROK_URL with the correct URL
  - Verify that ngrok is still running

- **WebSocket Errors**
  - Check the browser console for detailed error messages
  - Verify that the WebSocket (wss://) protocol is working by looking for "transport: websocket" in the logs

### ngrok Limitations (Free Plan)

- URLs change each time you restart ngrok
- Limited to 40 connections per minute
- Sessions last up to 2 hours
- For persistent URLs, consider upgrading to a paid plan

## For Production

While ngrok is excellent for development and testing, for production deployment consider:

1. A VPS with Nginx reverse proxy and Let's Encrypt certificates
2. Cloud platforms like AWS, Azure, or Google Cloud
3. Specialized game hosting services

## Additional Resources

- ngrok documentation: https://ngrok.com/docs
- Socket.IO with HTTPS: https://socket.io/docs/v4/using-multiple-nodes/
- Let's Encrypt for free SSL certificates: https://letsencrypt.org/