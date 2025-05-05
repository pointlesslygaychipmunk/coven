# Windows Setup Guide for Ngrok

This guide explains how to set up your Witch's Coven game server with ngrok on Windows.

## Prerequisites

1. **Install Node.js**: Download from https://nodejs.org/ (LTS version recommended)
2. **Install ngrok**: Download from https://ngrok.com/download
3. **Create ngrok account**: Sign up at https://dashboard.ngrok.com/signup

## Setup Steps

### 1. Install ngrok

1. Download the Windows ZIP file from ngrok.com/download
2. Extract the ZIP file to a folder on your computer
3. Add the folder to your PATH or use the full path when running ngrok
4. Open Command Prompt and run:
   ```
   ngrok authtoken YOUR_AUTH_TOKEN
   ```
   Replace `YOUR_AUTH_TOKEN` with the token from your ngrok dashboard

### 2. Build and Run the Server

1. Open Command Prompt in your project folder
2. Run the provided Windows script:
   ```
   update-for-ngrok.bat
   ```
   This will:
   - Build the backend
   - Start the server on port 8080
   - Open a new Command Prompt window with ngrok running

3. Look for your ngrok URL in the ngrok window. It will look like:
   ```
   Forwarding https://abc123.ngrok.io -> http://localhost:8080
   ```

### 3. Configure the Frontend

1. Copy the HTTPS URL from ngrok (like `https://abc123.ngrok.io`)
2. Run the configuration utility:
   ```
   update-frontend-config.bat
   ```
3. Paste your ngrok URL when prompted
4. Build the frontend:
   ```
   cd frontend
   npm run build
   npm run preview
   ```

## Testing the Connection

1. Open your browser to the frontend URL (shown when you run npm run preview)
2. Check the browser console (F12) for connection messages
3. You should see: "Connected to server via ngrok with socket ID: [ID]"

## Troubleshooting

### Connection Issues

- **Error: "Failed to connect to server"**
  - Make sure your backend server is running
  - Check that you've entered the correct ngrok URL
  - Verify that ngrok is still running in its window

- **WebSocket Errors**
  - Check the browser console for error messages
  - Some networks block WebSocket connections, try using a different network

### Common Problems

- **Ngrok URL changes**: Free accounts get a new URL each time you restart ngrok
- **Connection timeouts**: Free accounts have a 2-hour session limit
- **Rate limiting**: Free accounts have a connection/minute limit

## Starting Over

If you need to start over:

1. Close all Command Prompt windows running your server and ngrok
2. Run `update-for-ngrok.bat` again to get a fresh start
3. Update the frontend configuration with the new URL

## For Production

For a production environment, consider:

1. Upgrade to ngrok Pro for persistent URLs
2. Set up a VPS with a proper domain and SSL certificates
3. Use a hosting service that supports WebSockets