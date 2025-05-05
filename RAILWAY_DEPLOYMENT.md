# Railway Deployment Guide

## Simple One-Command Deployment

I've set up a Railway configuration file (`railway.json`) that will deploy your backend easily. Here's how to use it:

### Step 1: Install Railway CLI

Open a normal Command Prompt (not a batch file) and run:

```
npm install -g @railway/cli
```

### Step 2: Log in to Railway

In the same Command Prompt, run:

```
railway login
```

This will open a browser window. Log in or create an account.

### Step 3: Deploy

In the Command Prompt, navigate to your project root and run:

```
cd /mnt/c/new-coven
railway up
```

### Step 4: Get Your URL

After deployment completes, Railway will display your project URL. You can also find it in the Railway dashboard.

### Step 5: Update Frontend Configuration

1. Open this file: `/mnt/c/new-coven/frontend/src/services/socketService.ts`

2. Update the socket connection URL to use your Railway URL:

```typescript
// Replace this line
const serverUrl = window.location.origin;

// With this
const serverUrl = "https://your-railway-url.up.railway.app";
```

3. Build and deploy your frontend (you can use Netlify, Vercel, or any static hosting).

## What This Setup Does

- Deploys your backend to Railway with HTTPS
- Configures the server for production
- Provides WebSocket support through secure connections (WSS)
- Gives you a permanent URL (no more changing ngrok URLs)
- Runs on Railway's free tier

## Viewing Logs and Status

To check your deployment status and logs:

```
railway status
railway logs
```

## Benefits of This Approach

- Single-command deployment
- Automatic HTTPS
- WebSocket support works out of the box
- Free tier supports this use case well
- No server management required