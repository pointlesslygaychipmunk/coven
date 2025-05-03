# Deployment Instructions for Coven Game

This document outlines how to deploy the Coven game with the 90s UI as the default interface.

## Default UI Mode

The application now uses the 90s UI (DOS/ASCII aesthetic) as the default interface. This is the version that will be shown to players when they access the deployed application.

## Alternative UI Modes

The application supports several UI modes that can be accessed via URL parameters:

- **90s UI (Default)**: No parameters needed, this is the default UI
- **Modern UI**: `?modern=true` - Uses the modern SimpleApp interface
- **Standalone Mode**: `?standalone=true` - A simplified version for troubleshooting
- **Minimal Mode**: `?minimal=true` - Bare-bones version for severe compatibility issues

## Deployment Steps

### 1. Building the Application

To build the application for deployment:

```bash
npm run build
```

This will create a production build in the `dist` directory with the 90s UI as the default interface.

### 2. Testing the Build

To test the production build locally before deployment:

```bash
npm run preview
```

### 3. Deploying to a Hosting Service

The `dist` directory contains all the files needed for deployment. You can deploy this to any static hosting service such as:

- Netlify
- Vercel
- GitHub Pages
- Amazon S3
- Firebase Hosting

#### Example: Netlify Deployment

1. Create a `netlify.toml` file in the project root:

```toml
[build]
  publish = "frontend/dist"
  command = "cd frontend && npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Deploy using the Netlify CLI or connect your repository on netlify.com

### 4. Environment Configuration

For backend API connections, make sure to:

1. Configure your backend URL in production
2. Set any necessary environment variables
3. Update CORS settings on your backend to allow requests from your deployed frontend

## Multiplayer Testing

For testing multiplayer functionality with your cousin:

1. The deployed version will use the 90s UI by default
2. Make sure both players have good internet connections
3. Share the deployment URL with your cousin
4. Consider using a voice chat service while playing to coordinate

## Troubleshooting

If players encounter issues:

1. They can try the modern UI with `?modern=true` added to the URL
2. For serious rendering issues, try `?standalone=true`
3. Check browser console for errors
4. Ensure backend is accessible from their location