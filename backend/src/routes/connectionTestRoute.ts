// Simple connection test route for diagnosing production issues
import express, { Request, Response, Router } from 'express';

// Use explicit type annotation for router
const router: Router = express.Router();

router.get('/status', (req: Request, res: Response) => {
  // Return server status with CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  res.json({
    status: 'online',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    protocol: req.protocol,
    host: req.get('host') || 'unknown',
    socketio: true,
    version: '1.0.0'
  });
});

router.options('/status', (_req: Request, res: Response) => {
  // Handle CORS preflight requests
  // Use _req to indicate the parameter is not used
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).end();
});

export default router;