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
import connectionTestRoutes from './routes/connectionTestRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app: Application = express();

// Initialize game handler
const gameHandler = new GameHandler();

// Set up middleware with production-ready CORS settings
const isProduction = process.env.NODE_ENV === 'production';
console.log(`[Server] Running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);

// PRODUCTION CORS CONFIGURATION - FIXED FOR PLAYCOVEN.COM
const corsOptions = {
  // Set specific allowed origins for production
  origin: isProduction ? 
    // Production domains - MUST match your actual domain exactly
    [
      'https://playcoven.com',
      'http://playcoven.com',
      'https://www.playcoven.com',
      'http://www.playcoven.com',
      // Allow direct IP access if needed
      'http://localhost:3000',
      'http://localhost:8080',
      'https://localhost:8443'
    ] : 
    '*', // In development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  // Add cache control for preflight requests in production
  maxAge: isProduction ? 86400 : 3600 // 24 hours in production, 1 hour in development
};

// Log CORS configuration
console.log(`[Server] CORS configuration: ${isProduction ? 'Restricted to specific origins' : 'Open to all origins'}`);

app.use(cors(corsOptions));

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

// Enhanced health check endpoints
// Quick simple health endpoint (for load balancers)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// Detailed server health endpoint with system metrics
app.get('/server-health', (_req, res) => {
  try {
    // Calculate memory usage statistics
    const memUsage = process.memoryUsage();
    const formatMemory = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
    
    // Calculate uptime info
    const uptimeSeconds = process.uptime();
    const uptimeFormatted = {
      days: Math.floor(uptimeSeconds / 86400),
      hours: Math.floor((uptimeSeconds % 86400) / 3600),
      minutes: Math.floor((uptimeSeconds % 3600) / 60),
      seconds: Math.floor(uptimeSeconds % 60)
    };
    
    // Get connection counts
    const httpConnections = multiplayerManager ? 
      Array.from(multiplayerManager['connectedPlayers'].values()).length : 0;
    
    const httpsConnections = httpsMultiplayerManager ? 
      Array.from(httpsMultiplayerManager['connectedPlayers'].values()).length : 0;
    
    // Create detailed health report
    const healthReport = {
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      timestamp: Date.now(),
      server: {
        uptime: uptimeFormatted,
        uptimeSeconds: uptimeSeconds,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      memory: {
        rss: formatMemory(memUsage.rss),
        heapTotal: formatMemory(memUsage.heapTotal),
        heapUsed: formatMemory(memUsage.heapUsed),
        external: formatMemory(memUsage.external),
        percentage: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2) + '%'
      },
      connections: {
        http: httpConnections,
        https: httpsConnections,
        total: httpConnections + httpsConnections
      }
    };
    
    res.status(200).json(healthReport);
  } catch (error) {
    console.error('[Server] Error getting server health:', error);
    res.status(500).json({ status: 'error', error: 'Error getting server health', timestamp: Date.now() });
  }
});

// Enhanced WebSocket status endpoint with detailed connection statistics
app.get('/websocket-status', (_req, res) => {
  try {
    // Get HTTP socket details with player info
    const getPlayerStatistics = (manager: any) => {
      if (!manager) return { connected: false, playerCount: 0, players: [] };
      
      const players = Array.from(manager['connectedPlayers'].values());
      const now = Date.now();
      
      // Collect activity statistics
      let totalActivity = 0;
      let minActivity = now;
      let maxActivity = 0;
      
      players.forEach((player: any) => {
        const lastActivity = player?.lastActivity || 0;
        totalActivity += (now - lastActivity);
        minActivity = Math.min(minActivity, lastActivity);
        maxActivity = Math.max(maxActivity, lastActivity);
      });
      
      // Calculate player activity stats
      const avgActivityTime = players.length ? Math.round(totalActivity / players.length) : 0;
      
      return {
        connected: Boolean(manager),
        playerCount: players.length,
        // Anonymize player data for privacy but retain useful info
        players: players.map((p: any) => ({
          id: p?.playerId?.substring(0, 8) + '...', // Only show first 8 chars of ID
          connectionTime: now - (p?.joinedAt || now),
          lastActiveSeconds: Math.round((now - (p?.lastActivity || now)) / 1000),
          pingCount: p?.pingCount || 0
        })),
        activity: {
          avgIdleTimeMs: avgActivityTime,
          oldestActivityMs: now - minActivity,
          mostRecentActivityMs: now - maxActivity
        }
      };
    };
    
    // Get stats for HTTP and HTTPS servers
    const httpStatus = getPlayerStatistics(multiplayerManager);
    const httpsStatus = getPlayerStatistics(httpsMultiplayerManager);
    
    // Get Socket.IO server statistics if available
    const getSocketStats = (manager: any) => {
      if (!manager || !manager.io) return null;
      
      try {
        // Get Socket.IO server statistics
        const io = manager.io;
        return {
          clientsCount: io.engine ? io.engine.clientsCount : 'N/A',
          rooms: Array.from(io.sockets.adapter.rooms.keys()),
          middlewareCount: io.engine?.middlewares?.length || 0,
        };
      } catch (e) {
        console.error('[Server] Error getting Socket.IO stats:', e);
        return null;
      }
    };
    
    // Prepare detailed response
    res.status(200).json({ 
      status: 'ok',
      timestamp: Date.now(),
      http: {
        ...httpStatus,
        socketStats: getSocketStats(multiplayerManager)
      },
      https: {
        ...httpsStatus,
        socketStats: getSocketStats(httpsMultiplayerManager)
      },
      totalPlayers: httpStatus.playerCount + httpsStatus.playerCount,
      serverUptime: process.uptime()
    });
  } catch (error) {
    console.error('[Server] Error getting WebSocket status:', error);
    res.status(500).json({ 
      status: 'error', 
      error: 'Error getting WebSocket status',
      timestamp: Date.now() 
    });
  }
});

// New detailed diagnostic endpoint that exposes enhanced multiplayer statistics
app.get('/multiplayer-diagnostics', (_req, res) => {
  try {
    // Get detailed statistics from the multiplayer managers
    const httpDiagnostics = multiplayerManager ? multiplayerManager.getStats() : null;
    const httpsDiagnostics = httpsMultiplayerManager ? httpsMultiplayerManager.getStats() : null;
    
    // Get overall system stats
    const memUsage = process.memoryUsage();
    const formatMemory = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
    
    // Prepare the comprehensive diagnostics report
    const diagnosticsReport = {
      timestamp: Date.now(),
      serverInfo: {
        uptime: process.uptime(),
        memory: {
          rss: formatMemory(memUsage.rss),
          heapUsed: formatMemory(memUsage.heapUsed),
          heapTotal: formatMemory(memUsage.heapTotal)
        },
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
      },
      connections: {
        http: {
          active: httpDiagnostics ? httpDiagnostics.stats.activeConnections : 0,
          total: httpDiagnostics ? httpDiagnostics.stats.totalConnections : 0,
          disconnections: httpDiagnostics ? httpDiagnostics.stats.disconnections : 0,
          reconnections: httpDiagnostics ? httpDiagnostics.stats.reconnections : 0,
          errors: httpDiagnostics ? httpDiagnostics.stats.connectionErrors : 0
        },
        https: {
          active: httpsDiagnostics ? httpsDiagnostics.stats.activeConnections : 0,
          total: httpsDiagnostics ? httpsDiagnostics.stats.totalConnections : 0,
          disconnections: httpsDiagnostics ? httpsDiagnostics.stats.disconnections : 0,
          reconnections: httpsDiagnostics ? httpsDiagnostics.stats.reconnections : 0,
          errors: httpsDiagnostics ? httpsDiagnostics.stats.connectionErrors : 0
        }
      },
      recentEvents: {
        http: httpDiagnostics ? httpDiagnostics.recentEvents : [],
        https: httpsDiagnostics ? httpsDiagnostics.recentEvents : []
      },
      errors: {
        http: httpDiagnostics ? httpDiagnostics.stats.lastError : null,
        https: httpsDiagnostics ? httpsDiagnostics.stats.lastError : null
      },
      socketInfo: {
        http: httpDiagnostics ? httpDiagnostics.socketServerInfo : null,
        https: httpsDiagnostics ? httpsDiagnostics.socketServerInfo : null
      }
    };
    
    res.status(200).json(diagnosticsReport);
  } catch (error) {
    console.error('[Server] Error getting multiplayer diagnostics:', error);
    res.status(500).json({ 
      status: 'error', 
      error: 'Error getting multiplayer diagnostics',
      timestamp: Date.now(),
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
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

// Add connection test routes with VERY permissive CORS for emergency debugging
app.use('/api/connection-test', connectionTestRoutes);

// EMERGENCY: Add socket.io debug endpoint with permissive CORS
app.get('/socketio-debug', (_req: Request, res: Response) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  // Return detailed socket.io info
  res.json({
    status: 'online',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    hostname: require('os').hostname(),
    socketio: {
      http: multiplayerManager ? {
        connected: true,
        // Use getStats() method instead of accessing private property
        stats: multiplayerManager.getStats ? multiplayerManager.getStats() : null
      } : null,
      https: httpsMultiplayerManager ? {
        connected: true,
        // Use getStats() method instead of accessing private property
        stats: httpsMultiplayerManager.getStats ? httpsMultiplayerManager.getStats() : null
      } : null
    }
  });
});

// EMERGENCY: Add very simple health check endpoint
app.get('/health-check', (_req: Request, res: Response) => {
  // Set CORS headers for maximum compatibility
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  // Basic OK response
  res.send('OK');
});

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
        return res.sendFile(indexPath, (err: any) => {
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
      return res.status(500).send('Frontend build not found. Please run `npm run build` in the frontend directory.');
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
const httpServer = http.createServer(app);

// Configure server timeouts
if ('keepAliveTimeout' in httpServer) {
  httpServer.keepAliveTimeout = 30000; // 30 seconds
}
if ('requestTimeout' in httpServer) {
  (httpServer as any).requestTimeout = 300000; // 5 minutes
}

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
  httpsServer = https.createServer(sslOptions, app);
  
  // Configure server timeouts (same as HTTP)
  if (httpsServer && 'keepAliveTimeout' in httpsServer) {
    httpsServer.keepAliveTimeout = 30000; // 30 seconds
  }
  if (httpsServer && 'requestTimeout' in httpsServer) {
    (httpsServer as any).requestTimeout = 300000; // 5 minutes
  }
  
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