# Witch's Coven Game Server

This repository contains the Witch's Coven game server with ngrok-based deployment for HTTPS support.

## Quick Start

1. Install ngrok from https://ngrok.com/download
2. Run `./update-for-ngrok.sh` to build and deploy with ngrok
3. Update the frontend config with your ngrok URL

## Documentation

- **[NGROK_SETUP_GUIDE.md](NGROK_SETUP_GUIDE.md)**: Detailed guide for setting up ngrok
- **[ngrok-setup.md](ngrok-setup.md)**: Quick reference for ngrok configuration

## Architecture

The codebase consists of:

- **backend**: Node.js server with Socket.IO for real-time communication
- **frontend**: React-based game client
- **shared**: Common code shared between frontend and backend

## Running the Server

The `update-for-ngrok.sh` script handles everything:
1. Builds the backend
2. Starts the server
3. Creates an ngrok tunnel with HTTPS

## Connecting the Frontend

After running the server with ngrok:

1. Copy the https URL provided by ngrok
2. Update `frontend/src/services/ngrokSocketConfig.ts` with the URL
3. Build and run the frontend

## Security

- All connections use HTTPS by default with ngrok
- WebSockets are secured with WSS protocol
- Valid SSL certificates are provided by ngrok

## Troubleshooting

If you encounter connection issues:

1. Check ngrok is running and the tunnel is active
2. Verify the ngrok URL is correctly set in the frontend config
3. Use the Connection Status component in the UI for diagnostics
4. Check browser console for WebSocket connection errors