@echo off
REM Script to update the frontend ngrok URL configuration

echo === Frontend ngrok Configuration Updater ===

REM Get ngrok URL from user
set /p NGROK_URL="Enter your ngrok HTTPS URL (e.g., https://abc123.ngrok.io): "

REM Validate input starts with https://
echo %NGROK_URL% | findstr /r "^https://" >nul
if %ERRORLEVEL% NEQ 0 (
  echo Error: URL must start with https://
  exit /b 1
)

REM Check if services directory exists
if not exist "frontend\src\services" (
  echo Error: frontend\src\services directory not found!
  exit /b 1
)

echo Updating frontend configuration with URL: %NGROK_URL%

REM Create backup of the config file if it exists
if exist "frontend\src\services\ngrokSocketConfig.ts" (
  copy "frontend\src\services\ngrokSocketConfig.ts" "frontend\src\services\ngrokSocketConfig.ts.bak"
)

REM Write updated config file with the new URL
(
  echo // frontend/src/services/ngrokSocketConfig.ts
  echo import { Socket, io } from 'socket.io-client';
  echo.
  echo /**
  echo  * Socket.IO client configuration for connecting to a server via ngrok
  echo  */
  echo.
  echo // Updated with the current ngrok URL
  echo export const NGROK_URL = '%NGROK_URL%';
  echo.
  echo // Connection options optimized for ngrok
  echo export const socketOptions = {
  echo   // Important: Always use secure WebSocket (wss://^) when connecting via HTTPS
  echo   transports: ['websocket', 'polling'],
  echo   forceNew: false,
  echo   // Reconnection settings
  echo   reconnection: true,
  echo   reconnectionAttempts: 10,
  echo   reconnectionDelay: 1000,
  echo   reconnectionDelayMax: 10000,
  echo   randomizationFactor: 0.5,
  echo   // Timeouts
  echo   timeout: 20000,
  echo   // Always use HTTPS with ngrok
  echo   secure: true,
  echo   // Path must match server configuration
  echo   path: '/socket.io/'
  echo };
  echo.
  echo // Create connection function
  echo export function connectToNgrokServer(): Socket {
  echo   console.log(`Connecting to Socket.IO server at ${NGROK_URL}`);
  echo   
  echo   // Create and configure the socket
  echo   const socket = io(NGROK_URL, socketOptions);
  echo   
  echo   // Setup event handlers
  echo   socket.on('connect', () => {
  echo     console.log(`✅ Connected to server via ngrok with socket ID: ${socket.id}`);
  echo   });
  echo   
  echo   socket.on('disconnect', (reason) => {
  echo     console.log(`❌ Disconnected from server: ${reason}`);
  echo   });
  echo   
  echo   socket.on('connect_error', (error) => {
  echo     console.error('Socket connection error:', error);
  echo   });
  echo   
  echo   return socket;
  echo }
  echo.
  echo // Helper to check connection health
  echo export function checkConnectionHealth(socket: Socket): {
  echo   connected: boolean,
  echo   transport: string | null,
  echo   ping: number | null
  echo } {
  echo   const transport = socket.connected ? socket.io.engine.transport.name : null;
  echo   const ping = socket.connected ? socket.io.engine.pingTimeout : null;
  echo   
  echo   return {
  echo     connected: socket.connected,
  echo     transport,
  echo     ping
  echo   };
  echo }
) > "frontend\src\services\ngrokSocketConfig.ts"

echo.
echo Configuration updated successfully!
echo.
echo Next steps:
echo 1. Build the frontend with: cd frontend ^& npm run build
echo 2. Run the ngrok server with: update-for-ngrok.bat
echo 3. Test your connection

pause