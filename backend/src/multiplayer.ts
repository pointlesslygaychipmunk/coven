// backend/src/multiplayer.ts
import { Server, Socket } from 'socket.io';
import http from 'http';
import { GameHandler } from './gameHandler.js';
import { GameState, Player } from 'coven-shared';

// Interface for tracking connected players
interface ConnectedPlayer {
  socketId: string;
  playerId: string;
  playerName: string;
  joinedAt: number;
  lastActivity: number;
  pingCount?: number;
  lastPing?: number;
}

// Main multiplayer handler class
export class MultiplayerManager {
  private io: Server;
  private gameHandler: GameHandler;
  private connectedPlayers: Map<string, ConnectedPlayer> = new Map(); // socketId -> player info
  private playerIdToSocketId: Map<string, string> = new Map(); // playerId -> socketId (for quick lookups)
  private connectionCheckIntervalId: NodeJS.Timeout | null = null;
  
  constructor(server: http.Server, gameHandler: GameHandler) {
    this.gameHandler = gameHandler;
    
    // Get production mode from environment
    const isProduction = process.env.NODE_ENV === 'production';
    console.log(`[Multiplayer] Initializing in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
    
    // Determine allowed origins based on environment
    const allowedOrigins = isProduction ? 
      // Production-specific allowed origins
      [
        'https://witchscoven.game', 
        'https://www.witchscoven.game',
        // Add other production domains as needed
        'http://localhost:3000', 
        'http://localhost:8080',
        'https://localhost:8443'
      ] : 
      "*"; // In development, allow all origins
    
    // Initialize Socket.IO with enhanced configuration
    this.io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
        // Add cache control for preflight requests in production
        maxAge: isProduction ? 86400 : 3600 // 24 hours in production, 1 hour in development
      },
      // Increase timeouts for more reliability in production
      pingTimeout: isProduction ? 40000 : 30000, // Increase ping timeout for production
      pingInterval: isProduction ? 20000 : 25000, // More frequent pings in production
      connectTimeout: 20000, // Connection timeout
      upgradeTimeout: isProduction ? 20000 : 15000, // Increase upgrade timeout for production
      maxHttpBufferSize: 1e8, // 100 MB (default 1e6, or 1 MB)
      // In production, prefer WebSocket for better performance
      // In development, support both with preference order
      transports: isProduction ? 
        ['websocket', 'polling'] : // Production: prefer WebSocket for better performance
        ['polling', 'websocket'], // Development: start with polling for better compatibility
      allowEIO3: true, // Allow both v3 and v4 clients to connect
      serveClient: false, // Don't serve client files in production
    });
    
    this.setupSocketHandlers();
    this.startConnectionHealthCheck();
    console.log("[Multiplayer] WebSocket server initialized");
  }
  
  // Set up all socket event handlers
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[Multiplayer] New connection: ${socket.id}`);
      
      // Log socket transport method
      const transport = socket.conn.transport.name; // 'websocket' or 'polling'
      console.log(`[Multiplayer] Client ${socket.id} connected using: ${transport}`);
      
      // Handle transport upgrade (polling -> websocket)
      socket.conn.on('upgrade', (newTransport: string) => {
        console.log(`[Multiplayer] Client ${socket.id} upgraded transport: ${newTransport}`);
      });
      
      // Handle player login/join
      socket.on('player:join', (data: { playerName: string, playerId?: string }) => {
        const { playerName, playerId } = data;
        
        try {
          if (!playerName || playerName.trim() === '') {
            socket.emit('error', { message: 'Player name is required' });
            return;
          }
          
          // If a playerId was provided, try to rejoin as that player
          if (playerId) {
            const gameState = this.gameHandler.getState();
            const existingPlayer = gameState.players.find(p => p.id === playerId);
            
            if (existingPlayer) {
              // Player exists, reconnect them
              this.handlePlayerReconnect(socket, existingPlayer, playerName);
              return;
            }
          }
          
          // Otherwise create a new player
          this.handleNewPlayer(socket, playerName);
        } catch (error) {
          console.error('[Multiplayer] Error in player:join:', error);
          socket.emit('error', { message: 'Failed to join game' });
        }
      });
      
      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`[Multiplayer] Socket ${socket.id} disconnected: ${reason}`);
        this.handlePlayerDisconnect(socket.id);
      });
      
      // Handle connection errors
      socket.on('error', (error) => {
        console.error(`[Multiplayer] Socket ${socket.id} error:`, error);
      });
      
      // Handle client pings (keep-alive)
      socket.on('ping', (data: { timestamp: number }) => {
        const player = this.connectedPlayers.get(socket.id);
        if (player) {
          player.lastActivity = Date.now();
          player.lastPing = data.timestamp;
          player.pingCount = (player.pingCount || 0) + 1;
          
          // Respond with pong
          socket.emit('pong', { 
            serverTime: Date.now(),
            clientTime: data.timestamp
          });
        }
      });
      
      // Handle messages in the chat
      socket.on('chat:message', (data: { message: string }) => {
        const player = this.connectedPlayers.get(socket.id);
        if (!player) {
          socket.emit('error', { message: 'You must join the game before sending messages' });
          return;
        }
        
        // Update last activity timestamp for this player
        player.lastActivity = Date.now();
        
        this.io.emit('chat:message', {
          senderId: player.playerId,
          senderName: player.playerName,
          message: data.message,
          timestamp: Date.now()
        });
      });
      
      // Handle game actions (we'll proxy all game actions through WebSockets)
      this.setupGameActionHandlers(socket);
    });
  }
  
  /**
   * Starts a periodic check for inactive connections
   */
  private startConnectionHealthCheck(): void {
    // Clear any existing interval
    if (this.connectionCheckIntervalId) {
      clearInterval(this.connectionCheckIntervalId);
    }
    
    // Check for stale connections every 60 seconds
    this.connectionCheckIntervalId = setInterval(() => {
      const now = Date.now();
      const inactivityThreshold = 5 * 60 * 1000; // 5 minutes of inactivity
      
      for (const [socketId, player] of this.connectedPlayers.entries()) {
        const timeSinceActivity = now - player.lastActivity;
        
        // If player has been inactive for too long
        if (timeSinceActivity > inactivityThreshold) {
          console.log(`[Multiplayer] Player ${player.playerName} (${player.playerId}) inactive for ${Math.round(timeSinceActivity/1000)}s, disconnecting`);
          
          const socket = this.io.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit('player:forced-disconnect', { reason: 'Connection timed out due to inactivity' });
            socket.disconnect(true);
          }
          
          this.handlePlayerDisconnect(socketId);
        }
      }
    }, 60000); // Check every minute
  }
  
  // Handle reconnecting an existing player
  private handlePlayerReconnect(socket: Socket, player: Player, newPlayerName: string): void {
    console.log(`[Multiplayer] Reconnecting player: ${player.name} (${player.id}) as ${newPlayerName}`);
    
    try {
      // Remove any existing connection for this player
      const existingSocketId = this.playerIdToSocketId.get(player.id);
      if (existingSocketId && existingSocketId !== socket.id) {
        console.log(`[Multiplayer] Player ${player.id} has an existing socket connection (${existingSocketId}), disconnecting it`);
        const existingSocket = this.io.sockets.sockets.get(existingSocketId);
        if (existingSocket) {
          existingSocket.emit('player:forced-disconnect', { reason: 'You connected from another device or browser' });
          existingSocket.disconnect(true);
        }
        this.connectedPlayers.delete(existingSocketId);
      }
      
      // Update player name if it changed
      if (player.name !== newPlayerName) {
        // In a real implementation, you'd update the player's name in the game state
        // For now, we'll just update our local tracking
        console.log(`[Multiplayer] Player ${player.id} renamed from ${player.name} to ${newPlayerName}`);
      }
      
      // Register the reconnection
      const now = Date.now();
      this.connectedPlayers.set(socket.id, {
        socketId: socket.id,
        playerId: player.id,
        playerName: newPlayerName,
        joinedAt: now,
        lastActivity: now,
        pingCount: 0,
        lastPing: now
      });
      this.playerIdToSocketId.set(player.id, socket.id);
      
      // Join player to game rooms
      socket.join('game');
      socket.join(`player:${player.id}`);
      
      // Notify everyone of the reconnection
      this.io.to('game').emit('player:reconnected', {
        playerId: player.id,
        playerName: newPlayerName
      });
      
      // Send current game state to the reconnected player
      const currentState = this.gameHandler.getState();
      if (currentState) {
        socket.emit('game:state', currentState);
      } else {
        console.error('[Multiplayer] Failed to get game state for reconnected player');
        socket.emit('error', { message: 'Error retrieving game state' });
      }
      
      socket.emit('player:joined', { 
        success: true, 
        playerId: player.id,
        playerName: newPlayerName,
        message: 'Reconnected to game session'
      });
      
      // Broadcast updated player list
      this.broadcastPlayerList();
    } catch (error) {
      console.error('[Multiplayer] Error reconnecting player:', error);
      socket.emit('error', { message: 'Failed to reconnect to the game session' });
    }
  }
  
  // Handle adding a new player to the game
  private handleNewPlayer(socket: Socket, playerName: string): void {
    try {
      // In a real implementation, you'd add the player to the game state
      // For now, we'll create a placeholder that would be replaced with actual logic
      // that adds a new player to gameHandler
      
      // For demo purposes, we'll generate a random ID with better uniqueness
      const playerId = `player_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      
      console.log(`[Multiplayer] New player joined: ${playerName} (${playerId})`);
      
      // Register the new player connection
      const now = Date.now();
      this.connectedPlayers.set(socket.id, {
        socketId: socket.id,
        playerId: playerId,
        playerName: playerName,
        joinedAt: now,
        lastActivity: now,
        pingCount: 0,
        lastPing: now
      });
      this.playerIdToSocketId.set(playerId, socket.id);
      
      // Join player to game rooms
      socket.join('game');
      socket.join(`player:${playerId}`);
      
      // Notify everyone of the new player
      this.io.to('game').emit('player:joined', {
        playerId: playerId,
        playerName: playerName
      });
      
      // Send current game state to the new player
      const currentState = this.gameHandler.getState();
      if (currentState) {
        socket.emit('game:state', currentState);
      } else {
        console.error('[Multiplayer] Failed to get game state for new player');
        socket.emit('error', { message: 'Error retrieving game state' });
      }
      
      socket.emit('player:joined', { 
        success: true, 
        playerId: playerId,
        playerName: playerName,
        message: 'Successfully joined game session'
      });
      
      // Broadcast updated player list
      this.broadcastPlayerList();
    } catch (error) {
      console.error('[Multiplayer] Error creating new player:', error);
      socket.emit('error', { message: 'Failed to create new player' });
    }
  }
  
  // Handle player disconnection
  private handlePlayerDisconnect(socketId: string): void {
    const player = this.connectedPlayers.get(socketId);
    if (player) {
      console.log(`[Multiplayer] Player disconnected: ${player.playerName} (${player.playerId})`);
      
      try {
        // Remove from socket rooms
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave('game');
          socket.leave(`player:${player.playerId}`);
        }
        
        // Remove from tracking maps
        this.connectedPlayers.delete(socketId);
        this.playerIdToSocketId.delete(player.playerId);
        
        // Notify other players
        this.io.to('game').emit('player:disconnected', {
          playerId: player.playerId,
          playerName: player.playerName
        });
        
        // Broadcast updated player list
        this.broadcastPlayerList();
      } catch (error) {
        console.error('[Multiplayer] Error handling player disconnect:', error);
      }
    }
  }
  
  // Set up handlers for all game actions
  private setupGameActionHandlers(socket: Socket): void {
    // Plant seed action
    socket.on('game:plant', (data: { slotId: number, seedItemId: string }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        if (data === null || data === undefined) {
          this.handleGameActionError(socket, 'plant seed', new Error('Invalid data provided'));
          return;
        }
        
        const { slotId, seedItemId } = data;
        
        if (slotId === undefined || seedItemId === undefined) {
          this.handleGameActionError(socket, 'plant seed', new Error('Missing required parameters'));
          return;
        }
        
        const gameState = this.gameHandler.plantSeed(player.playerId, slotId, seedItemId);
        if (gameState) {
          this.broadcastGameUpdate(gameState);
        } else {
          this.handleGameActionError(socket, 'plant seed', new Error('Failed to update game state'));
        }
      } catch (error) {
        this.handleGameActionError(socket, 'plant seed', error);
      }
    });
    
    // Water plants action
    socket.on('game:water', (data: { puzzleBonus?: number }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        // Ensure data is not null
        if (data === null || data === undefined) {
          data = {}; // Default to empty object if data is null
        }
        
        const puzzleBonus = data.puzzleBonus || 0;
        const gameState = this.gameHandler.waterPlants(player.playerId, puzzleBonus);
        if (gameState) {
          this.broadcastGameUpdate(gameState);
        } else {
          this.handleGameActionError(socket, 'water plants', new Error('Failed to update game state'));
        }
      } catch (error) {
        this.handleGameActionError(socket, 'water plants', error);
      }
    });
    
    // Harvest plant action
    socket.on('game:harvest', (data: { slotId: number }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        if (data === null || data === undefined || data.slotId === undefined) {
          this.handleGameActionError(socket, 'harvest plant', new Error('Invalid slot ID provided'));
          return;
        }
        
        const { slotId } = data;
        const gameState = this.gameHandler.harvestPlant(player.playerId, slotId);
        if (gameState) {
          this.broadcastGameUpdate(gameState);
        } else {
          this.handleGameActionError(socket, 'harvest plant', new Error('Failed to update game state'));
        }
      } catch (error) {
        this.handleGameActionError(socket, 'harvest plant', error);
      }
    });
    
    // Brew potion action
    socket.on('game:brew', (data: { ingredientInvItemIds: string[], puzzleBonus?: number }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        if (data === null || data === undefined || !Array.isArray(data.ingredientInvItemIds)) {
          this.handleGameActionError(socket, 'brew potion', new Error('Invalid ingredients provided'));
          return;
        }
        
        const { ingredientInvItemIds, puzzleBonus } = data;
        
        // Check that we have exactly the correct number of ingredients
        if (ingredientInvItemIds.length !== 2) {
          this.handleGameActionError(socket, 'brew potion', new Error('Potion brewing requires exactly 2 ingredients'));
          return;
        }
        
        const gameState = this.gameHandler.brewPotion(player.playerId, ingredientInvItemIds, puzzleBonus || 0);
        if (gameState) {
          this.broadcastGameUpdate(gameState);
        } else {
          this.handleGameActionError(socket, 'brew potion', new Error('Failed to update game state'));
        }
      } catch (error) {
        this.handleGameActionError(socket, 'brew potion', error);
      }
    });
    
    // Buy item action
    socket.on('game:buy', (data: { itemId: string }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        if (data === null || data === undefined || !data.itemId) {
          this.handleGameActionError(socket, 'buy item', new Error('Invalid item ID provided'));
          return;
        }
        
        const { itemId } = data;
        const gameState = this.gameHandler.buyItem(player.playerId, itemId);
        if (gameState) {
          this.broadcastGameUpdate(gameState);
        } else {
          this.handleGameActionError(socket, 'buy item', new Error('Failed to update game state'));
        }
      } catch (error) {
        this.handleGameActionError(socket, 'buy item', error);
      }
    });
    
    // Sell item action
    socket.on('game:sell', (data: { itemId: string }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        if (data === null || data === undefined || !data.itemId) {
          this.handleGameActionError(socket, 'sell item', new Error('Invalid item ID provided'));
          return;
        }
        
        const { itemId } = data;
        const gameState = this.gameHandler.sellItem(player.playerId, itemId);
        if (gameState) {
          this.broadcastGameUpdate(gameState);
        } else {
          this.handleGameActionError(socket, 'sell item', new Error('Failed to update game state'));
        }
      } catch (error) {
        this.handleGameActionError(socket, 'sell item', error);
      }
    });
    
    // Fulfill request action
    socket.on('game:fulfill', (data: { requestId: string }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        if (data === null || data === undefined || !data.requestId) {
          this.handleGameActionError(socket, 'fulfill request', new Error('Invalid request ID provided'));
          return;
        }
        
        const { requestId } = data;
        const gameState = this.gameHandler.fulfillRequest(player.playerId, requestId);
        if (gameState) {
          this.broadcastGameUpdate(gameState);
        } else {
          this.handleGameActionError(socket, 'fulfill request', new Error('Failed to update game state'));
        }
      } catch (error) {
        this.handleGameActionError(socket, 'fulfill request', error);
      }
    });
    
    // Claim ritual reward action
    socket.on('game:claim-ritual', (data: { ritualId: string }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        if (data === null || data === undefined || !data.ritualId) {
          this.handleGameActionError(socket, 'claim ritual', new Error('Invalid ritual ID provided'));
          return;
        }
        
        const { ritualId } = data;
        const gameState = this.gameHandler.claimRitualReward(player.playerId, ritualId);
        if (gameState) {
          this.broadcastGameUpdate(gameState);
        } else {
          this.handleGameActionError(socket, 'claim ritual', new Error('Failed to update game state'));
        }
      } catch (error) {
        this.handleGameActionError(socket, 'claim ritual', error);
      }
    });
    
    // End turn action
    socket.on('game:end-turn', () => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        const gameState = this.gameHandler.endTurn(player.playerId);
        if (gameState) {
          this.broadcastGameUpdate(gameState);
        } else {
          this.handleGameActionError(socket, 'end turn', new Error('Failed to update game state'));
        }
      } catch (error) {
        this.handleGameActionError(socket, 'end turn', error);
      }
    });
  }
  
  // Helper to get player info from socket
  private getPlayerFromSocket(socket: Socket): ConnectedPlayer | null {
    const player = this.connectedPlayers.get(socket.id);
    if (!player) {
      socket.emit('error', { message: 'You must join the game first' });
      return null;
    }
    
    // Update last activity timestamp
    player.lastActivity = Date.now();
    return player;
  }
  
  // Handle errors in game actions
  private handleGameActionError(socket: Socket, action: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`[Multiplayer] Error performing ${action}:`, error);
    socket.emit('error', { message: `Failed to ${action}: ${errorMessage}` });
    
    // Resend the current game state to ensure client is in sync
    try {
      const currentState = this.gameHandler.getState();
      if (currentState) {
        socket.emit('game:state', currentState);
      }
    } catch (stateError) {
      console.error('[Multiplayer] Error getting game state after action error:', stateError);
    }
  }
  
  // Broadcast game state updates to all connected players
  private broadcastGameUpdate(gameState: GameState): void {
    if (!gameState) {
      console.error('[Multiplayer] Attempted to broadcast invalid game state');
      return;
    }
    
    try {
      this.io.to('game').emit('game:update', gameState);
    } catch (error) {
      console.error('[Multiplayer] Error broadcasting game update:', error);
    }
  }
  
  // Broadcast the list of connected players to all clients
  private broadcastPlayerList(): void {
    try {
      const playerList = Array.from(this.connectedPlayers.values()).map(player => ({
        playerId: player.playerId,
        playerName: player.playerName,
        joinedAt: player.joinedAt
      }));
      
      // Sort player list by joined time (oldest first)
      playerList.sort((a, b) => a.joinedAt - b.joinedAt);
      
      console.log(`[Multiplayer] Broadcasting player list with ${playerList.length} players`);
      this.io.to('game').emit('player:list', playerList);
    } catch (error) {
      console.error('[Multiplayer] Error broadcasting player list:', error);
    }
  }
  
  // Clean up resources on server shutdown
  public shutdown(): void {
    console.log('[Multiplayer] Shutting down multiplayer manager');
    
    // Clear any intervals
    if (this.connectionCheckIntervalId) {
      clearInterval(this.connectionCheckIntervalId);
      this.connectionCheckIntervalId = null;
    }
    
    // Disconnect all clients
    for (const [socketId, player] of this.connectedPlayers.entries()) {
      try {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit('player:forced-disconnect', { reason: 'Server is shutting down' });
          socket.disconnect(true);
        }
      } catch (error) {
        console.error(`[Multiplayer] Error disconnecting player ${player.playerName}:`, error);
      }
    }
    
    // Clear player maps
    this.connectedPlayers.clear();
    this.playerIdToSocketId.clear();
    
    // Close the socket.io server
    try {
      this.io.close();
    } catch (error) {
      console.error('[Multiplayer] Error closing Socket.IO server:', error);
    }
  }
}