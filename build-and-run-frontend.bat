@echo off
REM Script to build and run the frontend

echo === Building and Running Frontend ===

REM Check if frontend exists
if not exist "frontend" (
  echo Error: frontend directory not found!
  pause
  exit /b 1
)

cd frontend

REM Build the frontend
echo Building frontend...
call npm run build

REM Check if build was successful
if not exist "dist" (
  echo Error: Frontend build failed!
  pause
  exit /b 1
)

echo Frontend built successfully.

REM Run the frontend preview server
echo Starting frontend preview server...
call npm run preview

pause