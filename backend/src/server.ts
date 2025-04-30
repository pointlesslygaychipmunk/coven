// backend/src/server.ts
import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { GameHandler } from './gameHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add explicit type annotation for app
const app: Application = express();
const gameHandler = new GameHandler();

app.use(cors());
app.use(express.json());

const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (!fs.existsSync(frontendDistPath)) {
    console.error(`[Server ERROR] Frontend build directory not found: ${frontendDistPath}`);
} else {
    console.log(`[Server] Serving static files from: ${frontendDistPath}`);
    app.use(express.static(frontendDistPath));
}

// Logging Middleware (Simple) - Mark req as unused with _
app.use((_req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[Server] ${_req.method} ${_req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Handle 404 for /wordpress routes
app.use('/wordpress', (_req, res) => {
    res.status(403).send('Forbidden');
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

app.post('/api/plant', (req: Request, res: Response): void => { 
    const { playerId, slotId, seedItemId } = req.body; 
    if (playerId === undefined || slotId === undefined || seedItemId === undefined) {
        res.status(400).json({ error: 'Missing params' });
        return;
    }
    handleRequest(() => gameHandler.plantSeed(playerId, Number(slotId), seedItemId), res, 'plant'); 
});

app.post('/api/water', (req: Request, res: Response): void => { 
    const { playerId } = req.body; 
    if (playerId === undefined) {
        res.status(400).json({ error: 'Missing params' });
        return;
    }
    handleRequest(() => gameHandler.waterPlants(playerId), res, 'water'); 
});

app.post('/api/harvest', (req: Request, res: Response): void => { 
    const { playerId, slotId } = req.body; 
    if (playerId === undefined || slotId === undefined) {
        res.status(400).json({ error: 'Missing params' });
        return;
    }
    handleRequest(() => gameHandler.harvestPlant(playerId, Number(slotId)), res, 'harvest'); 
});

app.post('/api/brew', (req: Request, res: Response): void => { 
    const { playerId, ingredientInvItemIds } = req.body; 
    if (!playerId || !Array.isArray(ingredientInvItemIds) || ingredientInvItemIds.length !== 2) {
        res.status(400).json({ error: 'Missing/invalid params' });
        return;
    }
    handleRequest(() => gameHandler.brewPotion(playerId, ingredientInvItemIds as string[]), res, 'brew'); 
});

app.post('/api/market/buy', (req: Request, res: Response): void => { 
    const { playerId, itemId } = req.body; 
    if (!playerId || !itemId) {
        res.status(400).json({ error: 'Missing params' });
        return;
    }
    handleRequest(() => gameHandler.buyItem(playerId, itemId), res, 'buy'); 
});

app.post('/api/market/sell', (req: Request, res: Response): void => { 
    const { playerId, itemId } = req.body; 
    if (!playerId || !itemId) {
        res.status(400).json({ error: 'Missing params' });
        return;
    }
    handleRequest(() => gameHandler.sellItem(playerId, itemId), res, 'sell'); 
});

app.post('/api/fulfill', (req: Request, res: Response): void => { 
    const { playerId, requestId } = req.body; 
    if (!playerId || !requestId) {
        res.status(400).json({ error: 'Missing params' });
        return;
    }
    handleRequest(() => gameHandler.fulfillRequest(playerId, requestId), res, 'fulfill'); 
});

app.post('/api/ritual/claim', (req: Request, res: Response): void => { 
    const { playerId, ritualId } = req.body; 
    if (!playerId || !ritualId) {
        res.status(400).json({ error: 'Missing params' });
        return;
    }
    handleRequest(() => gameHandler.claimRitualReward(playerId, ritualId), res, 'claim'); 
});

app.post('/api/end-turn', (req: Request, res: Response): void => { 
    const { playerId } = req.body; 
    if (!playerId) {
        res.status(400).json({ error: 'Missing params' });
        return;
    }
    handleRequest(() => gameHandler.endTurn(playerId), res, 'end turn'); 
});

app.post('/api/save', (_req: Request, res: Response): void => handleRequest(() => ({ success: true, saveData: gameHandler.saveGame() }), res, 'save'));

app.post('/api/load', (req: Request, res: Response): void => { 
    const { saveData } = req.body; 
    if (saveData === undefined) {
        res.status(400).json({ error: 'Missing params' });
        return;
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

// Serve Frontend
if (fs.existsSync(frontendDistPath)) {
    app.get('*', (_req: Request, res: Response) => { // Use _req for unused parameter
        const indexPath = path.join(frontendDistPath, 'index.html');
        res.sendFile(indexPath, (err: any) => { // Explicitly type err as any
            if (err) {
                console.error("[Server] Error sending index.html:", err);
                if (!res.headersSent) res.status(500).send("Error serving application.");
            }
        });
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

// Start Server
const HTTP_PORT = process.env.PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
http.createServer(app).listen(HTTP_PORT, () => {
  console.log(` Backend server listening at http://localhost:${HTTP_PORT} ✨`);
  console.log(`--------------------------------------------------`);
});
if (sslOptions) {
  https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(` Backend server (HTTPS) listening at https://localhost:${HTTPS_PORT} 🌙`);
    console.log(`--------------------------------------------------`);
  });
} else {
     console.log(` (HTTPS server not started)`);
}

export default app;