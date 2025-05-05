# Setting Up ngrok for Your Server with HTTPS

This guide explains how to use ngrok to expose your local server over HTTPS.

## What is ngrok?

ngrok is a cross-platform application that creates secure tunnels from public URLs to local servers. It provides HTTPS by default for all tunnels.

## Prerequisites

1. Download and install ngrok from https://ngrok.com/download
2. Create a free ngrok account to get your authtoken

## Setup Instructions

### 1. Install ngrok

- **Windows**: Download and extract the ZIP file
- **Mac**: `brew install ngrok/ngrok/ngrok` or download ZIP
- **Linux**: Download and extract or use package manager

### 2. Connect your account

After installing, run:

```bash
ngrok authtoken YOUR_AUTH_TOKEN
```

Replace `YOUR_AUTH_TOKEN` with the token from your ngrok dashboard.

### 3. Start the backend server

First, build and run your backend server locally:

```bash
cd backend
npm run build
npm start
```

This will start your server on port 8080.

### 4. Create ngrok tunnel

In a new terminal window, run:

```bash
ngrok http 8080
```

ngrok will display a dashboard showing:
- The public HTTPS URL (like `https://abc123.ngrok.io`)
- HTTP request logs
- Status information

The HTTPS URL is what you'll use to connect to your server securely from anywhere.

### 5. Configure frontend

Update your frontend connection URL to the ngrok HTTPS URL:

```typescript
// In frontend/src/services/socketService.ts
const SOCKET_URL = 'https://your-ngrok-url.ngrok.io';
```

## Benefits of ngrok

- **HTTPS by default**: All tunnels are secured with valid SSL certificates
- **Real-time traffic inspection**: View all requests in the dashboard
- **No router configuration**: Works behind firewalls and NATs
- **Custom domains**: Paid plans support custom domains

## Limitations

- Free tier URLs change each time you restart ngrok
- Limited to 40 connections per minute on free plan
- Tunnels disconnect after 1-2 hours on free plan

## Troubleshooting

- **Connection refused**: Make sure your local server is running
- **Too many connections**: Upgrade plan or implement rate limiting
- **Tunnel closed**: Restart ngrok when it disconnects (paid plans offer more stability)

For persistence, consider upgrading to a paid plan or deploying to a VPS once development is complete.