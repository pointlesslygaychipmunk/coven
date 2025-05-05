@echo off
REM Script to update backend configuration for ngrok use on Windows

echo === Preparing server for ngrok ===

REM Check if ngrok is installed
where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ngrok not found. Please install ngrok from https://ngrok.com/download
  echo After installing, run 'ngrok authtoken YOUR_AUTH_TOKEN' to connect your account
  echo Then restart this script
  pause
  exit /b 1
)

REM Check if backend exists
if not exist "backend" (
  echo Error: backend directory not found!
  pause
  exit /b 1
)

REM Build the backend
echo Building backend...
cd backend
call npm run build
cd ..

REM Check if build was successful
if not exist "backend\dist" (
  echo Error: Build failed!
  pause
  exit /b 1
)

echo Backend built successfully.

REM Start the server
echo Starting server...
start "Witch's Coven Server" cmd /k "cd backend && node dist/server.js"

REM Give server time to start
timeout /t 3 /nobreak

echo Server running in a separate window.

REM Start ngrok tunnel
echo Starting ngrok tunnel...
echo The server will now be available via HTTPS through ngrok.
echo Copy the https URL displayed below and use it to connect to your server.
echo ----------------------------------------

REM Run ngrok in a new window with cmd /k to keep it open
start "Ngrok Tunnel" cmd /k "ngrok http 8080"

echo.
echo When you're done, close the server and ngrok windows.
echo Done!
pause