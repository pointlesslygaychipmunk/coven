// backend/src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { GameHandler } from './gameHandler.js'; // Ensure .js extension

// Handle ES Module file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const gameHandler = new GameHandler();

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Parse JSON request bodies

// Serve static files from the frontend build directory
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
console.log(`[Server] Serving static files from: ${frontendDistPath}`);
app.use(express.static(frontendDistPath));

// Logging Middleware (Simple)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[Server] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// --- API Routes ---

// Helper function for API responses
const handleRequest = (handlerFn: () => any, res: Response, actionName: string) => {
    try {
        const result = handlerFn();
        res.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown server error';
        console.error(`[Server] Error during ${actionName}:`, error);
        res.status(500).json({ error: `Failed to ${actionName}: ${message}` });
    }
};

// GET Current Game State
app.get('/api/state', (req: Request, res: Response) => {
  handleRequest(() => gameHandler.getState(), res, 'get game state');
});

// POST Garden actions
app.post('/api/plant', (req: Request, res: Response) => {
    const { playerId, slotId, seedItemId } = req.body; // Expect seedItemId (Inventory ID)
    if (playerId === undefined || slotId === undefined || seedItemId === undefined) {
       return res.status(400).json({ error: 'Missing parameters (playerId, slotId, seedItemId)' });
    }
    handleRequest(() => gameHandler.plantSeed(playerId, Number(slotId), seedItemId), res, 'plant seed');
});

app.post('/api/water', (req: Request, res: Response) => {
  const { playerId } = req.body; // Only need playerId now
   if (playerId === undefined) {
      return res.status(400).json({ error: 'Missing parameters (playerId)' });
   }
  handleRequest(() => gameHandler.waterPlants(playerId, true), res, 'water plants'); // Pass success=true
});

app.post('/api/harvest', (req: Request, res: Response) => {
  const { playerId, slotId } = req.body;
   if (playerId === undefined || slotId === undefined) {
      return res.status(400).json({ error: 'Missing parameters (playerId, slotId)' });
   }
  handleRequest(() => gameHandler.harvestPlant(playerId, Number(slotId)), res, 'harvest plant');
});

// POST Brewing actions
app.post('/api/brew', (req: Request, res: Response) => {
  const { playerId, ingredientInvItemIds } = req.body; // Expect array of inventory IDs
   if (playerId === undefined || !Array.isArray(ingredientInvItemIds) || ingredientInvItemIds.length !== 2) {
      return res.status(400).json({ error: 'Missing or invalid parameters (playerId, ingredientInvItemIds[2])' });
   }
  handleRequest(() => gameHandler.brewPotion(playerId, ingredientInvItemIds as [string, string]), res, 'brew potion');
});

// POST Market actions
app.post('/api/market/buy', (req: Request, res: Response) => {
  const { playerId, itemId } = req.body; // itemId is the MarketItem ID
   if (playerId === undefined || itemId === undefined) {
      return res.status(400).json({ error: 'Missing parameters (playerId, itemId)' });
   }
  handleRequest(() => gameHandler.buyItem(playerId, itemId), res, 'buy item');
});

app.post('/api/market/sell', (req: Request, res: Response) => {
  const { playerId, itemId } = req.body; // Rename for clarity: this is inventoryItemId
   if (playerId === undefined || itemId === undefined) { // Check for itemId (which is inventoryItemId)
      return res.status(400).json({ error: 'Missing parameters (playerId, itemId=inventoryItemId)' });
   }
  handleRequest(() => gameHandler.sellItem(playerId, itemId), res, 'sell item');
});

// POST Town request actions
app.post('/api/fulfill', (req: Request, res: Response) => {
  const { playerId, requestId } = req.body;
  if (playerId === undefined || requestId === undefined) {
     return res.status(400).json({ error: 'Missing parameters (playerId, requestId)' });
  }
  handleRequest(() => gameHandler.fulfillRequest(playerId, requestId), res, 'fulfill request');
});

// POST Ritual actions
app.post('/api/ritual/claim', (req: Request, res: Response) => {
    const { playerId, ritualId } = req.body;
     if (playerId === undefined || ritualId === undefined) {
        return res.status(400).json({ error: 'Missing parameters (playerId, ritualId)' });
     }
    handleRequest(() => gameHandler.claimRitualReward(playerId, ritualId), res, 'claim ritual reward');
});

// POST Game turn management
app.post('/api/end-turn', (req: Request, res: Response) => {
  const { playerId } = req.body;
   if (playerId === undefined) {
      return res.status(400).json({ error: 'Missing parameters (playerId)' });
   }
  handleRequest(() => gameHandler.endTurn(playerId), res, 'end turn');
});

// POST Save/Load game
app.post('/api/save', (req: Request, res: Response) => {
  handleRequest(() => {
      const saveData = gameHandler.saveGame();
      return { success: true, saveData }; // Wrap response
  }, res, 'save game');
});

app.post('/api/load', (req: Request, res: Response) => {
  const { saveData } = req.body;
   if (saveData === undefined) {
      return res.status(400).json({ error: 'Missing parameters (saveData)' });
   }
  handleRequest(() => {
      const success = gameHandler.loadGame(saveData);
      if (success) {
          return { success: true, state: gameHandler.getState() }; // Return new state on load
      } else {
          // Throw error to be caught by handleRequest
          throw new Error("Failed to load game data from provided save.");
      }
  }, res, 'load game');
});


// --- Serve Frontend ---
// Needs to be defined AFTER all API routes
app.get('*', (req: Request, res: Response) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  // console.log(`[Server] Serving index.html for ${req.url} from: ${indexPath}`);
  res.sendFile(indexPath, (err) => {
      if (err) {
          console.error("[Server] Error sending index.html:", err);
          res.status(500).send("Error serving application.");
      }
  });
});

// --- Start Server ---
// Use PORT environment variable or default to 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(` Backend server running on http://localhost:${PORT}`);
  console.log(`--------------------------------------------------`);
});

export default app; // Export for potential testing