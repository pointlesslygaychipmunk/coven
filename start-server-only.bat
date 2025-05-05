@echo off
REM Script to just start the server without ngrok

echo === Starting Witch's Coven Server ===

REM Check if backend exists
if not exist "backend" (
  echo Error: backend directory not found!
  exit /b 1
)

REM Check if dist exists, if not, build
if not exist "backend\dist" (
  echo Building backend first...
  cd backend
  call npm run build
  cd ..
)

REM Start the server
echo Starting server on port 8080...
cd backend
node dist/server.js

echo Server stopped.
pause