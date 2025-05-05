#!/bin/bash
# Start both the backend server and Cloudflare Tunnel
# Usage: ./start-production.sh <tunnel_id>

# Exit on error
set -e

# Check required argument
if [ -z "$1" ]; then
  echo "Error: Tunnel ID is required"
  echo "Usage: $0 <tunnel_id>"
  exit 1
fi

TUNNEL_ID="$1"
SERVER_PORT=8080
ENV_FILE="$(pwd)/.env.production"

# Create .env.production if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
  echo "Creating .env.production file..."
  cat > "$ENV_FILE" << EOL
NODE_ENV=production
PORT=$SERVER_PORT
EOL
fi

# Set environment variables
export NODE_ENV=production
export PORT=$SERVER_PORT

# Check if backend is built
if [ ! -d "./backend/dist" ]; then
  echo "Building backend..."
  cd backend
  npm run build
  cd ..
fi

# Function to stop all processes on exit
cleanup() {
  echo "Stopping all processes..."
  kill $(jobs -p) 2>/dev/null || true
}

# Set trap to ensure cleanup on exit
trap cleanup EXIT INT TERM

# Start the backend server in the background
echo "Starting backend server on port $SERVER_PORT..."
cd backend
NODE_ENV=production node dist/server.js &
BACKEND_PID=$!
cd ..

# Give the server a moment to start
sleep 3

# Check if server started successfully
if ! ps -p $BACKEND_PID > /dev/null; then
  echo "Error: Backend server failed to start"
  exit 1
fi

echo "Backend server started with PID $BACKEND_PID"

# Start the Cloudflare tunnel
echo "Starting Cloudflare tunnel..."
cd cloudflare-tunnel
./start-tunnel.sh "$TUNNEL_ID" &
TUNNEL_PID=$!
cd ..

# Wait for both processes
wait $BACKEND_PID $TUNNEL_PID