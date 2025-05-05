@echo off
REM Simple script to deploy to Railway without login window issues

echo === Quick Railway Deployment ===
echo.
echo STEP 1: First log in to Railway in a separate window.
echo.
echo Open a Command Prompt and run:
echo   railway login
echo.
echo Press any key once you've logged in...
pause >nul

echo.
echo STEP 2: Deploying to Railway...
echo.

cd backend
railway up

echo.
echo Deployment complete!
echo.
echo Copy your Railway URL and update the frontend configuration.
echo Then deploy your frontend with: deploy-netlify.bat
echo.
pause