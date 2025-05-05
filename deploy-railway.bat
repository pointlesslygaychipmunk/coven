@echo off
ECHO === Railway Deployment ===
ECHO.
ECHO IMPORTANT: This script assumes you've already logged in with 'railway login'
ECHO in a separate Command Prompt window.
ECHO.
ECHO If you haven't done that yet, press Ctrl+C to cancel this script,
ECHO open a Command Prompt, and run:
ECHO.
ECHO   npm install -g @railway/cli
ECHO   railway login
ECHO.
ECHO Then run this script again.
ECHO.
PAUSE

ECHO Deploying to Railway...
railway up

ECHO.
ECHO Deployment complete! Your app should now be live on Railway.
ECHO.
ECHO To find your URL, check the Railway dashboard or the output above.
ECHO.
ECHO Remember to update your frontend configuration with this URL.
ECHO.
PAUSE