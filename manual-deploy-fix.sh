#!/bin/bash
# Script to prepare backend files for manual upload to Railway

# Create deploy directory if it doesn't exist
mkdir -p backend-deploy

# Copy necessary backend files
cp -r backend/src backend-deploy/
cp -r backend/certs backend-deploy/ 2>/dev/null || true
cp backend/package.json backend-deploy/
cp backend/tsconfig.json backend-deploy/

# Create simplified package.json without workspace dependencies
cat > backend-deploy/package.json << EOL
{
  "name": "coven-backend",
  "version": "1.0.0",
  "description": "Backend server for Coven game",
  "type": "module",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "dev": "tsc -p tsconfig.json --watch & node --watch dist/server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "socket.io": "^4.8.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.0",
    "@types/socket.io": "^3.0.2",
    "typescript": "^5.5.4"
  }
}
EOL

# Copy shared types into backend deploy
mkdir -p backend-deploy/src/shared
cp -r shared/src/* backend-deploy/src/shared/

# Create a zip file for easy upload
zip -r backend-deploy.zip backend-deploy

echo "==============================================="
echo "Files prepared for manual Railway deployment!"
echo "==============================================="
echo ""
echo "Upload backend-deploy.zip to Railway using their dashboard"
echo "or use the files in backend-deploy/ directory."
echo ""
echo "STEPS:"
echo "1. Go to Railway dashboard"
echo "2. Create new project"
echo "3. Choose 'Deploy from GitHub' or 'Upload files'"
echo "4. Set ROOT DIRECTORY to '/' (blank)"
echo "5. Set BUILD COMMAND to 'npm install && npm run build'"
echo "6. Set START COMMAND to 'npm start'"
echo ""
echo "Your backend-deploy.zip file is ready for upload"