@echo off
REM Script to deploy frontend to Netlify with one click

echo === Deploying Frontend to Netlify ===
echo This will deploy your frontend to Netlify with HTTPS support.

REM Check if Netlify CLI is installed
where netlify >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Netlify CLI not found. Installing...
  npm i -g netlify-cli
  
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Netlify CLI.
    echo Please install manually with: npm i -g netlify-cli
    pause
    exit /b 1
  )
)

REM Check if frontend exists
if not exist "frontend" (
  echo Error: frontend directory not found!
  pause
  exit /b 1
)

REM Login to Netlify if needed
echo IMPORTANT: After logging in, type 'exit' to return to this script.
cmd /k "netlify login && echo Now type 'exit' to continue"

REM Build and deploy to Netlify
cd frontend
echo Building frontend...
call npm run build

if %ERRORLEVEL% NEQ 0 (
  echo Build failed. Please check the error message above.
  pause
  exit /b 1
)

echo Deploying to Netlify...
netlify deploy --prod

if %ERRORLEVEL% NEQ 0 (
  echo Deployment failed. Please check the error message above.
) else (
  echo Deployment successful!
  echo.
  echo Your frontend is now hosted on Netlify with HTTPS!
)

pause