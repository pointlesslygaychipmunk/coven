# Simplest Setup for Windows

## Simple Local HTTPS Setup

1. **Generate SSL Certificates**:
   - Open Command Prompt as Administrator
   - Run these commands:

```
cd backend\certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem -subj "/CN=localhost"
```

2. **Start the HTTPS Server**:
   - Double-click `start-https-server.bat`
   - This runs your server on HTTPS port 8443

3. **Use The Frontend with HTTPS Server**:
   - Edit `frontend/src/services/socketService.ts`
   - Replace the socket connection URL with: `https://localhost:8443`
   - Build and run the frontend

## What Happens
- Your server will run on HTTPS (https://localhost:8443)
- Your frontend will connect to HTTPS
- You'll get browser warnings about self-signed certificates (click Advanced → Proceed)
- WebSockets will work over WSS (secure WebSockets)

## Why This Works
- Same computer, so no network issues
- Self-signed certificates work locally
- No ngrok, no external services required
- No deployment required
- SSL certificates last a year

## If You Want Simple External Access
Use localtunnel which is simpler than ngrok:

1. Install localtunnel: `npm install -g localtunnel`
2. Start your server
3. Run: `lt --port 8443`
4. Use the URL it gives you