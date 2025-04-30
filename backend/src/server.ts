// backend/src/server.ts
import express, { Request, Response, NextFunction } from 'express'; // Assuming @types/express will be found eventually
import cors from 'cors'; // Assuming @types/cors will be found eventually
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { GameHandler } from './gameHandler.js';

// --- (Setup code remains the same) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const gameHandler = new GameHandler();
app.use(cors()); app.use(express.json());
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) { app.use(express.static(frontendDistPath)); } else { console.error(`Frontend build not found: ${frontendDistPath}`); }
app.use((req: Request, res: Response, next: NextFunction) => { /* ... logging middleware ... */ next(); });
const handleRequest = (handlerFn: () => any, res: Response, actionName: string) => { /* ... error handling ... */ try { res.json(handlerFn()); } catch (e) { /*...*/ } };

// --- API Routes ---
app.get('/api/state', (_req: Request, res: Response) => handleRequest(gameHandler.getState.bind(gameHandler), res, 'get state'));
app.post('/api/plant', (req: Request, res: Response) => { const { playerId, slotId, seedItemId } = req.body; if (!playerId || slotId === undefined || !seedItemId) return res.status(400).json({ error: 'Missing params' }); handleRequest(() => gameHandler.plantSeed(playerId, Number(slotId), seedItemId), res, 'plant'); });
app.post('/api/water', (req: Request, res: Response) => { const { playerId } = req.body; if (!playerId) return res.status(400).json({ error: 'Missing params' }); handleRequest(() => gameHandler.waterPlants(playerId), res, 'water'); }); // Correct call arity
app.post('/api/harvest', (req: Request, res: Response) => { const { playerId, slotId } = req.body; if (!playerId || slotId === undefined) return res.status(400).json({ error: 'Missing params' }); handleRequest(() => gameHandler.harvestPlant(playerId, Number(slotId)), res, 'harvest'); });
app.post('/api/brew', (req: Request, res: Response) => { const { playerId, ingredientInvItemIds } = req.body; if (!playerId || !Array.isArray(ingredientInvItemIds) || ingredientInvItemIds.length !== 2) return res.status(400).json({ error: 'Missing/invalid params' }); handleRequest(() => gameHandler.brewPotion(playerId, ingredientInvItemIds as string[]), res, 'brew'); });
app.post('/api/market/buy', (req: Request, res: Response) => { const { playerId, itemId } = req.body; if (!playerId || !itemId) return res.status(400).json({ error: 'Missing params' }); handleRequest(() => gameHandler.buyItem(playerId, itemId), res, 'buy'); });
app.post('/api/market/sell', (req: Request, res: Response) => { const { playerId, itemId } = req.body; if (!playerId || !itemId) return res.status(400).json({ error: 'Missing params' }); handleRequest(() => gameHandler.sellItem(playerId, itemId), res, 'sell'); });
app.post('/api/fulfill', (req: Request, res: Response) => { const { playerId, requestId } = req.body; if (!playerId || !requestId) return res.status(400).json({ error: 'Missing params' }); handleRequest(() => gameHandler.fulfillRequest(playerId, requestId), res, 'fulfill'); });
app.post('/api/ritual/claim', (req: Request, res: Response) => { const { playerId, ritualId } = req.body; if (!playerId || !ritualId) return res.status(400).json({ error: 'Missing params' }); handleRequest(() => gameHandler.claimRitualReward(playerId, ritualId), res, 'claim'); });
app.post('/api/end-turn', (req: Request, res: Response) => { const { playerId } = req.body; if (!playerId) return res.status(400).json({ error: 'Missing params' }); handleRequest(() => gameHandler.endTurn(playerId), res, 'end turn'); });
app.post('/api/save', (_req: Request, res: Response) => handleRequest(() => ({ success: true, saveData: gameHandler.saveGame() }), res, 'save'));
app.post('/api/load', (req: Request, res: Response) => { const { saveData } = req.body; if (saveData === undefined) return res.status(400).json({ error: 'Missing params' }); handleRequest(() => { const success = gameHandler.loadGame(saveData); if (success) return { success: true, state: gameHandler.getState() }; else throw new Error("Load failed."); }, res, 'load'); });

// Serve Frontend
if (fs.existsSync(frontendDistPath)) { app.get('*', (_req: Request, res: Response) => { const indexPath = path.join(frontendDistPath, 'index.html'); res.sendFile(indexPath, (err: any) => { if (err && !res.headersSent) res.status(500).send("Error serving app."); }); }); }

// --- (SSL and Server Start code remains the same) ---
let sslOptions: https.ServerOptions | undefined = undefined; /* ... */
const HTTP_PORT = process.env.PORT || 8080; const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
http.createServer(app).listen(HTTP_PORT, () => console.log(`HTTP Server on ${HTTP_PORT}`));
if (sslOptions) https.createServer(sslOptions, app).listen(HTTPS_PORT, () => console.log(`HTTPS Server on ${HTTPS_PORT}`));

export default app;