@echo off
REM Script to just start ngrok for an already running server

echo === Starting ngrok tunnel ===

REM Check if ngrok is installed
where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ngrok not found. Please install ngrok from https://ngrok.com/download
  echo After installing, run 'ngrok authtoken YOUR_AUTH_TOKEN' to connect your account
  echo Then restart this script
  pause
  exit /b 1
)

echo Starting ngrok tunnel to localhost:8080...
echo The server will now be available via HTTPS through ngrok.
echo Copy the https URL displayed and update your frontend configuration.
echo ----------------------------------------

REM Run ngrok and keep window open
echo Press Ctrl+C to stop the tunnel when you're finished
cmd /k ngrok http 8080