@echo off
REM Master script to deploy both backend and frontend to production

echo === EASY PRODUCTION DEPLOYMENT ===
echo This script will guide you through deploying your game to production.
echo.
echo This will deploy:
echo  1. Backend to Railway (with HTTPS)
echo  2. Frontend to Netlify (with HTTPS)
echo.
echo Both services offer free plans suitable for small projects.
echo.

REM Check if needed CLIs are installed
set MISSING_CLI=0

where railway >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Railway CLI not found. Will install when needed.
  set MISSING_CLI=1
)

where netlify >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Netlify CLI not found. Will install when needed.
  set MISSING_CLI=1
)

if %MISSING_CLI%==1 (
  echo.
  echo Don't worry! The required tools will be installed automatically.
  echo.
)

echo Ready to deploy to production? This process will:
echo  - Deploy your backend to Railway
echo  - Deploy your frontend to Netlify
echo  - Set up HTTPS automatically
echo  - Give you permanent URLs (no more changing ngrok URLs!)
echo.
set /p CONTINUE="Continue? (y/n): "

if /i not "%CONTINUE%"=="y" (
  echo Deployment cancelled.
  pause
  exit /b 0
)

echo.
echo === STEP 1: DEPLOYING BACKEND TO RAILWAY ===
echo.

REM Check if Railway CLI is installed
where railway >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Installing Railway CLI...
  npm i -g @railway/cli
  
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Railway CLI.
    echo Please try running: npm i -g @railway/cli
    echo Then run this script again.
    pause
    exit /b 1
  )
)

REM Login to Railway
echo You'll need to log in to Railway.
echo IMPORTANT: After logging in, type 'exit' to return to this script.
cmd /k "railway login && echo Now type 'exit' to continue"

REM Deploy backend
cd backend
echo Building and deploying backend to Railway...
railway up

if %ERRORLEVEL% NEQ 0 (
  echo Backend deployment failed. Please check the error messages above.
  pause
  exit /b 1
)

echo.
echo Backend successfully deployed to Railway!
echo.
echo IMPORTANT: Note your Railway URL. You'll need it for the frontend.
echo You can find it in the Railway dashboard or in the output above.
echo.
set /p BACKEND_URL="Enter your Railway backend URL: "

echo.
echo === STEP 2: UPDATING FRONTEND CONFIGURATION ===
echo.

REM Update frontend config
cd ..
echo Updating frontend configuration with backend URL...
(
  echo // frontend/src/services/productionConfig.ts
  echo import { Socket, io } from 'socket.io-client';
  echo.
  echo /**
  echo  * Socket.IO client configuration for production
  echo  */
  echo.
  echo // Production backend URL
  echo export const BACKEND_URL = '%BACKEND_URL%';
  echo.
  echo // Connection options for production
  echo export const socketOptions = {
  echo   transports: ['websocket', 'polling'],
  echo   forceNew: false,
  echo   reconnection: true,
  echo   reconnectionAttempts: 10,
  echo   reconnectionDelay: 1000,
  echo   reconnectionDelayMax: 10000,
  echo   randomizationFactor: 0.5,
  echo   timeout: 20000,
  echo   secure: true,
  echo   path: '/socket.io/'
  echo };
  echo.
  echo // Create connection function
  echo export function connectToProductionServer(): Socket {
  echo   console.log(`Connecting to production server at ${BACKEND_URL}`);
  echo   
  echo   const socket = io(BACKEND_URL, socketOptions);
  echo   
  echo   socket.on('connect', () => {
  echo     console.log(`✅ Connected to production server with ID: ${socket.id}`);
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
) > "frontend\src\services\productionConfig.ts"

REM Update main socket service to use production config
echo import { connectToProductionServer } from './productionConfig'; > temp.txt
type "frontend\src\services\socketService.ts" | findstr /v "ngrok" >> temp.txt
move /y temp.txt "frontend\src\services\socketService.ts"

echo Frontend configuration updated!

echo.
echo === STEP 3: DEPLOYING FRONTEND TO NETLIFY ===
echo.

REM Check if Netlify CLI is installed
where netlify >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Installing Netlify CLI...
  npm i -g netlify-cli
  
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Netlify CLI.
    echo Please try running: npm i -g netlify-cli
    echo Then run deploy-netlify.bat
    pause
    exit /b 1
  )
)

REM Login to Netlify
echo You'll need to log in to Netlify.
echo IMPORTANT: After logging in, type 'exit' to return to this script.
cmd /k "netlify login && echo Now type 'exit' to continue"

REM Build and deploy frontend
cd frontend
echo Building frontend...
call npm run build

if %ERRORLEVEL% NEQ 0 (
  echo Frontend build failed. Please check the error messages above.
  pause
  exit /b 1
)

echo Deploying frontend to Netlify...
netlify deploy --prod

if %ERRORLEVEL% NEQ 0 (
  echo Frontend deployment failed. Please check the error messages above.
  pause
  exit /b 1
)

echo.
echo === DEPLOYMENT COMPLETE! ===
echo.
echo Your game is now deployed to production with:
echo  - Secure HTTPS connections
echo  - WebSocket support
echo  - Permanent URLs (no more ngrok!)
echo.
echo Your game is now live at the Netlify URL shown above.
echo.
echo Enjoy your production deployment!

pause