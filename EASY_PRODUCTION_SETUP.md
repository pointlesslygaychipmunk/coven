# Easy Production Deployment Guide

This guide shows how to deploy your Witch's Coven game to production with minimal effort and free hosting.

## Option 1: Netlify + Railway (Recommended)

### Step 1: Deploy Backend to Railway

1. Create an account on [Railway](https://railway.app/)
2. Install Railway CLI: `npm i -g @railway/cli`
3. Login: `railway login`
4. Navigate to your backend folder: `cd backend`
5. Deploy: `railway up`
6. Note the URL Railway provides (e.g., `https://witchscoven-production.up.railway.app`)

### Step 2: Update Frontend Config

1. Edit `frontend/src/services/ngrokSocketConfig.ts`
2. Replace ngrok URL with your Railway URL

### Step 3: Deploy Frontend to Netlify

1. Create an account on [Netlify](https://www.netlify.com/)
2. Install Netlify CLI: `npm install -g netlify-cli`
3. Login: `netlify login`
4. Navigate to your frontend folder: `cd frontend`
5. Build: `npm run build`
6. Deploy: `netlify deploy --prod`

Your game is now deployed with:
- HTTPS on both frontend and backend
- Free hosting
- Automatic builds on code changes (if you connect to GitHub)
- Custom domain support

## Option 2: Render.com (One-stop Solution)

Render.com can host both frontend and backend with free HTTPS:

1. Create an account on [Render](https://render.com/)
2. Create a new Web Service for your backend
   - Choose your repository
   - Set build command: `cd backend && npm install && npm run build`
   - Set start command: `cd backend && node dist/server.js`
3. Create a new Static Site for your frontend
   - Choose your repository
   - Set build command: `cd frontend && npm install && npm run build`
   - Set publish directory: `frontend/dist`
   - Add environment variable with your backend URL

## Option 3: Simplified Vercel Deployment

Vercel is extremely easy for frontend deployment:

1. Create an account on [Vercel](https://vercel.com/)
2. Install Vercel CLI: `npm i -g vercel`
3. Login: `vercel login`
4. Deploy frontend: `cd frontend && vercel --prod`
5. Deploy backend to Railway as in Option 1

## One-Click Deployment Scripts

### Railway Backend Deployment

Create a file named `deploy-backend.bat`:

```batch
@echo off
cd backend
railway up
pause
```

### Netlify Frontend Deployment

Create a file named `deploy-frontend.bat`:

```batch
@echo off
cd frontend
npm run build
netlify deploy --prod
pause
```

## Custom Domain Setup

For a professional experience, you can add a custom domain:

1. Purchase a domain (Namecheap, GoDaddy, etc.)
2. Add the domain in Netlify/Vercel/Render dashboard
3. Update DNS settings as instructed
4. Update backend URL in your frontend configuration

All these options provide:
- HTTPS by default
- WebSocket support
- Automatic scaling
- No need to manage infrastructure