@echo off
REM Script to prepare backend files for manual upload to Railway

ECHO === Preparing Files for Railway ===
ECHO.

REM Create deploy directory if it doesn't exist
IF NOT EXIST backend-deploy mkdir backend-deploy

REM Copy necessary backend files
ECHO Copying backend files...
xcopy /s /y /q backend\src backend-deploy\src\
IF EXIST backend\certs xcopy /s /y /q backend\certs backend-deploy\certs\
copy /y backend\package.json backend-deploy\
copy /y backend\tsconfig.json backend-deploy\

REM Create simplified package.json without workspace dependencies
ECHO Creating simplified package.json...
(
  ECHO {
  ECHO   "name": "coven-backend",
  ECHO   "version": "1.0.0",
  ECHO   "description": "Backend server for Coven game",
  ECHO   "type": "module",
  ECHO   "main": "dist/server.js",
  ECHO   "scripts": {
  ECHO     "build": "tsc -p tsconfig.json",
  ECHO     "start": "node dist/server.js",
  ECHO     "dev": "tsc -p tsconfig.json --watch ^& node --watch dist/server.js"
  ECHO   },
  ECHO   "dependencies": {
  ECHO     "cors": "^2.8.5",
  ECHO     "express": "^4.18.2",
  ECHO     "socket.io": "^4.8.1"
  ECHO   },
  ECHO   "devDependencies": {
  ECHO     "@types/cors": "^2.8.17",
  ECHO     "@types/express": "^4.17.21",
  ECHO     "@types/node": "^20.11.0",
  ECHO     "@types/socket.io": "^3.0.2",
  ECHO     "typescript": "^5.5.4"
  ECHO   }
  ECHO }
) > backend-deploy\package.json

REM Copy shared types into backend deploy
ECHO Copying shared types...
IF NOT EXIST backend-deploy\src\shared mkdir backend-deploy\src\shared
IF EXIST shared\src xcopy /s /y /q shared\src\* backend-deploy\src\shared\

ECHO Files prepared for manual Railway deployment!
ECHO.
ECHO ===============================================
ECHO.
ECHO STEPS:
ECHO 1. Go to Railway dashboard
ECHO 2. Create new project
ECHO 3. Choose "Empty Project"
ECHO 4. Choose "Deploy from GitHub" or manually upload files from backend-deploy folder
ECHO 5. Set ROOT DIRECTORY to "/" (blank)
ECHO 6. Set BUILD COMMAND to "npm install ^&^& npm run build"
ECHO 7. Set START COMMAND to "npm start"
ECHO.
ECHO Your files are in the backend-deploy directory
ECHO.
ECHO TIP: If uploading manually through Railway dashboard, zip the contents of
ECHO      backend-deploy folder first.
ECHO.

PAUSE