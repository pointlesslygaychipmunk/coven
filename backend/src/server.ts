// backend/src/server.ts
import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { GameHandler } from './gameHandler.js';
import { MultiplayerManager } from './multiplayer.js';
import gardenRoutes from './routes/gardenRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app: Application = express();

// Initialize game handler
const gameHandler = new GameHandler();

// Set up middleware
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); // Increase payload limit for larger data transfers
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from frontend build
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (!fs.existsSync(frontendDistPath)) {
    console.error(`[Server ERROR] Frontend build directory not found: ${frontendDistPath}`);
} else {
    console.log(`[Server] Serving static files from: ${frontendDistPath}`);
    app.use(express.static(frontendDistPath, {
      maxAge: '1h', // Cache static assets for 1 hour
      etag: true,   // Enable etag for caching
    }));
}

// Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[Server] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Security middleware - block common attack paths
app.use('/wordpress', (_req, res) => {
  res.status(403).send('Forbidden');
});

app.use('/wp-admin', (_req, res) => {
  res.status(403).send('Forbidden');
});

app.use('/wp-login', (_req, res) => {
  res.status(403).send('Forbidden');
});

// Add a health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// WebSocket status endpoint
app.get('/websocket-status', (_req, res) => {
  try {
    const httpStatus = {
      connected: Boolean(multiplayerManager),
      playerCount: multiplayerManager ? Array.from(multiplayerManager['connectedPlayers'].values()).length : 0
    };
    
    const httpsStatus = {
      connected: Boolean(httpsMultiplayerManager),
      playerCount: httpsMultiplayerManager ? Array.from(httpsMultiplayerManager['connectedPlayers'].values()).length : 0
    };
    
    res.status(200).json({ 
      http: httpStatus,
      https: httpsStatus,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[Server] Error getting WebSocket status:', error);
    res.status(500).json({ error: 'Error getting WebSocket status' });
  }
});

// Helper function for API responses
const handleRequest = (handlerFn: () => any, res: Response, actionName: string): void => {
    try {
        res.json(handlerFn());
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown server error';
        console.error(`[Server] Error ${actionName}:`, error);
        res.status(500).json({ error: `Failed to ${actionName}: ${message}` });
    }
};

// --- API Routes ---
app.get('/api/state', (_req: Request, res: Response): void => handleRequest(gameHandler.getState.bind(gameHandler), res, 'get state'));

// Add interactive garden routes
app.use('/api/garden', gardenRoutes);

app.post('/api/plant', (req: Request, res: Response): void => {
    const { playerId, slotId, seedItemId } = req.body;
    if (playerId === undefined || slotId === undefined || seedItemId === undefined) {
        res.status(400).json({ error: 'Missing params: playerId, slotId, seedItemId required' }); return;
    }
    handleRequest(() => gameHandler.plantSeed(playerId, Number(slotId), seedItemId), res, 'plant');
});

// MODIFIED: Accept puzzleBonus
app.post('/api/water', (req: Request, res: Response): void => {
    const { playerId, puzzleBonus } = req.body; // Extract puzzleBonus
    if (playerId === undefined) {
        res.status(400).json({ error: 'Missing params: playerId required' }); return;
    }
    // Parse bonus, default to 0
    const bonus = typeof puzzleBonus === 'number' ? puzzleBonus : 0;
    handleRequest(() => gameHandler.waterPlants(playerId, bonus), res, 'water'); // Pass bonus
});


app.post('/api/harvest', (req: Request, res: Response): void => {
    const { playerId, slotId } = req.body;
    if (playerId === undefined || slotId === undefined) {
        res.status(400).json({ error: 'Missing params: playerId, slotId required' }); return;
    }
    handleRequest(() => gameHandler.harvestPlant(playerId, Number(slotId)), res, 'harvest');
});

// MODIFIED: Accept puzzleBonus for brewing
app.post('/api/brew', (req: Request, res: Response): void => {
    const { playerId, ingredientInvItemIds, puzzleBonus } = req.body; // Extract puzzleBonus
    if (!playerId || !Array.isArray(ingredientInvItemIds) || ingredientInvItemIds.length !== 2) {
        res.status(400).json({ error: 'Missing/invalid params: requires playerId, and array of 2 ingredientInvItemIds' }); return;
    }
     // Parse bonus, default to 0
    const bonus = typeof puzzleBonus === 'number' ? puzzleBonus : 0;
    handleRequest(() => gameHandler.brewPotion(playerId, ingredientInvItemIds as string[], bonus), res, 'brew'); // Pass bonus
});


app.post('/api/market/buy', (req: Request, res: Response): void => {
    const { playerId, itemId } = req.body;
    if (!playerId || !itemId) {
        res.status(400).json({ error: 'Missing params: playerId, itemId required' }); return;
    }
    handleRequest(() => gameHandler.buyItem(playerId, itemId), res, 'buy');
});

app.post('/api/market/sell', (req: Request, res: Response): void => {
    const { playerId, itemId } = req.body;
    if (!playerId || !itemId) {
        res.status(400).json({ error: 'Missing params: playerId, itemId required' }); return;
    }
    handleRequest(() => gameHandler.sellItem(playerId, itemId), res, 'sell');
});

app.post('/api/fulfill', (req: Request, res: Response): void => {
    const { playerId, requestId } = req.body;
    if (!playerId || !requestId) {
        res.status(400).json({ error: 'Missing params: playerId, requestId required' }); return;
    }
    handleRequest(() => gameHandler.fulfillRequest(playerId, requestId), res, 'fulfill');
});

app.post('/api/ritual/claim', (req: Request, res: Response): void => {
    const { playerId, ritualId } = req.body;
    if (!playerId || !ritualId) {
        res.status(400).json({ error: 'Missing params: playerId, ritualId required' }); return;
    }
    handleRequest(() => gameHandler.claimRitualReward(playerId, ritualId), res, 'claim ritual reward');
});

// New endpoints for ritual system
app.post('/api/ritual/perform', (req: Request, res: Response): void => {
    const { playerId, ritualId, cardPlacements } = req.body;
    if (!playerId || !ritualId || !cardPlacements) {
        res.status(400).json({ error: 'Missing params: playerId, ritualId, cardPlacements required' }); return;
    }
    handleRequest(() => gameHandler.performRitual(playerId, ritualId, cardPlacements), res, 'perform ritual');
});

app.post('/api/ritual/rewards', (req: Request, res: Response): void => {
    const { playerId, ritualId, ritualPower } = req.body;
    if (!playerId || !ritualId || ritualPower === undefined) {
        res.status(400).json({ error: 'Missing params: playerId, ritualId, ritualPower required' }); return;
    }
    handleRequest(() => gameHandler.claimRitualRewards(playerId, ritualId, Number(ritualPower)), res, 'claim ritual rewards');
});

app.post('/api/end-turn', (req: Request, res: Response): void => {
    const { playerId } = req.body;
    if (!playerId) {
        res.status(400).json({ error: 'Missing params: playerId required' }); return;
    }
    handleRequest(() => gameHandler.endTurn(playerId), res, 'end turn');
});

app.post('/api/save', (_req: Request, res: Response): void => handleRequest(() => ({ success: true, saveData: gameHandler.saveGame() }), res, 'save'));

app.post('/api/load', (req: Request, res: Response): void => {
    const { saveData } = req.body;
    if (saveData === undefined) {
        res.status(400).json({ error: 'Missing params: saveData required' }); return;
    }
    handleRequest(() => {
        const success = gameHandler.loadGame(saveData);
        if (success) {
            return { success: true, state: gameHandler.getState() };
        } else {
            throw new Error("Load failed.");
        }
    }, res, 'load');
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log(`[Server] 404 Not Found: ${req.originalUrl}`);
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve Frontend
if (fs.existsSync(frontendDistPath)) {
    app.get('*', (req: Request, res: Response) => {
        // Prevent serving API routes as static files
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(404).json({ error: 'API route not found' });
        }
        const indexPath = path.join(frontendDistPath, 'index.html');
        res.sendFile(indexPath, (err: any) => {
            if (err) {
                console.error("[Server] Error sending index.html:", err);
                if (!res.headersSent) {
                    res.status(500).send("Error serving application.");
                }
            }
        });
    });
} else {
    // Fallback if dist not found
    app.get('*', (_req, res) => {
      res.status(500).send('Frontend build not found. Please run `npm run build` in the frontend directory.');
    });
}

// SSL Certificates
let sslOptions: https.ServerOptions | undefined = undefined;
const keyPath = path.join(__dirname, '../certs/key.pem');
const certPath = path.join(__dirname, '../certs/cert.pem');
try {
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        sslOptions = { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
        console.log("[Server] SSL certificates loaded.");
    } else {
        console.log("[Server] SSL certificates not found. Starting HTTP only.");
    }
} catch (err) {
    console.error("[Server] Error reading SSL certificates:", err);
    console.log("[Server] HTTP only.");
}

// Configure HTTP server
const HTTP_PORT = process.env.PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;

// Create HTTP server with proper timeouts
const httpServer = http.createServer({
  // Configure server timeouts
  keepAlive: true,
  keepAliveTimeout: 30000, // 30 seconds
  headersTimeout: 65000, // 65 seconds (slightly higher than keepAliveTimeout)
  requestTimeout: 300000, // 5 minutes for long-running requests
}, app);

// Add error handling for HTTP server
httpServer.on('error', (error) => {
  console.error('[Server] HTTP server error:', error);
});

// Initialize multiplayer managers
export const multiplayerManager = new MultiplayerManager(httpServer, gameHandler);

// Create a variable for the HTTPS multiplayer manager that we can export
let httpsMultiplayerManager: MultiplayerManager | null = null;
let httpsServer: https.Server | null = null;

// Start HTTP server
httpServer.listen(HTTP_PORT, () => {
  console.log(`\n Backend server listening at http://localhost:${HTTP_PORT} ✨`);
  console.log(`\n Multiplayer WebSocket server running on ws://localhost:${HTTP_PORT} 🌐`);
  console.log(`--------------------------------------------------`);
});

// If SSL is configured, set up HTTPS server as well
if (sslOptions) {
  httpsServer = https.createServer({
    ...sslOptions,
    // Configure server timeouts (same as HTTP)
    keepAlive: true,
    keepAliveTimeout: 30000, // 30 seconds
    headersTimeout: 65000, // 65 seconds
    requestTimeout: 300000, // 5 minutes
  }, app);
  
  // Add error handling for HTTPS server
  httpsServer.on('error', (error) => {
    console.error('[Server] HTTPS server error:', error);
  });
  
  // Initialize another multiplayer manager for HTTPS
  httpsMultiplayerManager = new MultiplayerManager(httpsServer, gameHandler);
  
  httpsServer.listen(HTTPS_PORT, () => {
    console.log(` Backend server (HTTPS) listening at https://localhost:${HTTPS_PORT} 🌙`);
    console.log(` Secure WebSocket server running on wss://localhost:${HTTPS_PORT} 🔒`);
    console.log(`--------------------------------------------------`);
  });
} else {
  console.log(` (HTTPS server not started)`);
}

// Setup graceful shutdown
const gracefulShutdown = () => {
  console.log('\n[Server] Shutting down gracefully...');
  
  // First attempt to shut down HTTP server
  let httpClosed = false;
  let httpTimeout = setTimeout(() => {
    if (!httpClosed) {
      console.log('[Server] HTTP server failed to close in time, forcing shutdown');
    }
  }, 10000);
  
  httpServer.close(() => {
    clearTimeout(httpTimeout);
    httpClosed = true;
    console.log('[Server] HTTP server closed');
  });
  
  // Shut down the multiplayer manager for HTTP
  if (multiplayerManager) {
    try {
      multiplayerManager.shutdown();
      console.log('[Server] HTTP multiplayer manager shut down');
    } catch (error) {
      console.error('[Server] Error shutting down HTTP multiplayer manager:', error);
    }
  }
  
  // If HTTPS server exists, shut it down too
  if (httpsServer) {
    let httpsClosed = false;
    let httpsTimeout = setTimeout(() => {
      if (!httpsClosed) {
        console.log('[Server] HTTPS server failed to close in time, forcing shutdown');
      }
    }, 10000);
    
    httpsServer.close(() => {
      clearTimeout(httpsTimeout);
      httpsClosed = true;
      console.log('[Server] HTTPS server closed');
    });
    
    // Shut down the multiplayer manager for HTTPS
    if (httpsMultiplayerManager) {
      try {
        httpsMultiplayerManager.shutdown();
        console.log('[Server] HTTPS multiplayer manager shut down');
      } catch (error) {
        console.error('[Server] Error shutting down HTTPS multiplayer manager:', error);
      }
    }
  }
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Export the HTTPS multiplayer manager if it was created
export { httpsMultiplayerManager };

export default app;