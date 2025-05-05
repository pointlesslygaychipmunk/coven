#!/bin/bash
# Script to update backend configuration for ngrok use

# Make script executable
chmod +x "$0"

# Ensure we're in the right directory
cd "$(dirname "$0")" || exit 1

echo "=== Preparing server for ngrok ==="

# Install ngrok if not already installed
if ! command -v ngrok &> /dev/null; then
  echo "ngrok not found. Please install ngrok from https://ngrok.com/download"
  echo "After installing, run 'ngrok authtoken YOUR_AUTH_TOKEN' to connect your account"
  echo "Then restart this script"
  exit 1
fi

# Check if backend exists
if [ ! -d "backend" ]; then
  echo "Error: backend directory not found!"
  exit 1
fi

# Build the backend
echo "Building backend..."
cd backend || exit 1
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
  echo "Error: Build failed!"
  exit 1
fi

echo "Backend built successfully."

# Start the server
echo "Starting server..."
NODE_ENV=production node dist/server.js &
SERVER_PID=$!

# Give server time to start
sleep 3

# Check if server is running
if ! ps -p $SERVER_PID > /dev/null; then
  echo "Error: Server failed to start!"
  exit 1
fi

echo "Server running with PID: $SERVER_PID"

# Start ngrok tunnel
echo "Starting ngrok tunnel..."
echo "The server will now be available via HTTPS through ngrok."
echo "Copy the https URL from below and use it to connect to your server."
echo "----------------------------------------"

# Run ngrok in the foreground
ngrok http 8080

# Clean up when ngrok is closed
echo "Stopping server (PID: $SERVER_PID)..."
kill $SERVER_PID

echo "Done!"