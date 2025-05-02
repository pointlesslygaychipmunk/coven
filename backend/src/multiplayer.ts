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
}

// Main multiplayer handler class
export class MultiplayerManager {
  private io: Server;
  private gameHandler: GameHandler;
  private connectedPlayers: Map<string, ConnectedPlayer> = new Map(); // socketId -> player info
  private playerIdToSocketId: Map<string, string> = new Map(); // playerId -> socketId (for quick lookups)
  
  constructor(server: http.Server, gameHandler: GameHandler) {
    this.gameHandler = gameHandler;
    
    // Initialize Socket.IO with CORS options
    this.io = new Server(server, {
      cors: {
        origin: "*", // For development, in production limit to your domain
        methods: ["GET", "POST"],
        credentials: true
      }
    });
    
    this.setupSocketHandlers();
    console.log("[Multiplayer] WebSocket server initialized");
  }
  
  // Set up all socket event handlers
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[Multiplayer] New connection: ${socket.id}`);
      
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
      socket.on('disconnect', () => {
        this.handlePlayerDisconnect(socket.id);
      });
      
      // Handle messages in the chat
      socket.on('chat:message', (data: { message: string }) => {
        const player = this.connectedPlayers.get(socket.id);
        if (!player) {
          socket.emit('error', { message: 'You must join the game before sending messages' });
          return;
        }
        
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
  
  // Handle reconnecting an existing player
  private handlePlayerReconnect(socket: Socket, player: Player, newPlayerName: string): void {
    // Remove any existing connection for this player
    const existingSocketId = this.playerIdToSocketId.get(player.id);
    if (existingSocketId && existingSocketId !== socket.id) {
      const existingSocket = this.io.sockets.sockets.get(existingSocketId);
      if (existingSocket) {
        existingSocket.emit('player:forced-disconnect', { reason: 'You connected from another device' });
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
      lastActivity: now
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
    socket.emit('game:state', this.gameHandler.getState());
    socket.emit('player:joined', { 
      success: true, 
      playerId: player.id,
      playerName: newPlayerName,
      message: 'Reconnected to game session'
    });
    
    // Broadcast updated player list
    this.broadcastPlayerList();
  }
  
  // Handle adding a new player to the game
  private handleNewPlayer(socket: Socket, playerName: string): void {
    try {
      // In a real implementation, you'd add the player to the game state
      // For now, we'll create a placeholder that would be replaced with actual logic
      // that adds a new player to gameHandler
      
      // For demo purposes, we'll generate a random ID
      // In reality, you'd use GameHandler's method to create a player
      const playerId = `player_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      console.log(`[Multiplayer] New player joined: ${playerName} (${playerId})`);
      
      // Register the new player connection
      const now = Date.now();
      this.connectedPlayers.set(socket.id, {
        socketId: socket.id,
        playerId: playerId,
        playerName: playerName,
        joinedAt: now,
        lastActivity: now
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
      socket.emit('game:state', this.gameHandler.getState());
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
    }
  }
  
  // Set up handlers for all game actions
  private setupGameActionHandlers(socket: Socket): void {
    // Plant seed action
    socket.on('game:plant', (data: { slotId: number, seedItemId: string }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        const { slotId, seedItemId } = data;
        const gameState = this.gameHandler.plantSeed(player.playerId, slotId, seedItemId);
        this.broadcastGameUpdate(gameState);
      } catch (error) {
        this.handleGameActionError(socket, 'plant seed', error);
      }
    });
    
    // Water plants action
    socket.on('game:water', (data: { puzzleBonus?: number }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        const puzzleBonus = data.puzzleBonus || 0;
        const gameState = this.gameHandler.waterPlants(player.playerId, puzzleBonus);
        this.broadcastGameUpdate(gameState);
      } catch (error) {
        this.handleGameActionError(socket, 'water plants', error);
      }
    });
    
    // Harvest plant action
    socket.on('game:harvest', (data: { slotId: number }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        const { slotId } = data;
        const gameState = this.gameHandler.harvestPlant(player.playerId, slotId);
        this.broadcastGameUpdate(gameState);
      } catch (error) {
        this.handleGameActionError(socket, 'harvest plant', error);
      }
    });
    
    // Brew potion action
    socket.on('game:brew', (data: { ingredientInvItemIds: string[], puzzleBonus?: number }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        const { ingredientInvItemIds, puzzleBonus } = data;
        const gameState = this.gameHandler.brewPotion(player.playerId, ingredientInvItemIds, puzzleBonus || 0);
        this.broadcastGameUpdate(gameState);
      } catch (error) {
        this.handleGameActionError(socket, 'brew potion', error);
      }
    });
    
    // Buy item action
    socket.on('game:buy', (data: { itemId: string }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        const { itemId } = data;
        const gameState = this.gameHandler.buyItem(player.playerId, itemId);
        this.broadcastGameUpdate(gameState);
      } catch (error) {
        this.handleGameActionError(socket, 'buy item', error);
      }
    });
    
    // Sell item action
    socket.on('game:sell', (data: { itemId: string }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        const { itemId } = data;
        const gameState = this.gameHandler.sellItem(player.playerId, itemId);
        this.broadcastGameUpdate(gameState);
      } catch (error) {
        this.handleGameActionError(socket, 'sell item', error);
      }
    });
    
    // Fulfill request action
    socket.on('game:fulfill', (data: { requestId: string }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        const { requestId } = data;
        const gameState = this.gameHandler.fulfillRequest(player.playerId, requestId);
        this.broadcastGameUpdate(gameState);
      } catch (error) {
        this.handleGameActionError(socket, 'fulfill request', error);
      }
    });
    
    // Claim ritual reward action
    socket.on('game:claim-ritual', (data: { ritualId: string }) => {
      const player = this.getPlayerFromSocket(socket);
      if (!player) return;
      
      try {
        const { ritualId } = data;
        const gameState = this.gameHandler.claimRitualReward(player.playerId, ritualId);
        this.broadcastGameUpdate(gameState);
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
        this.broadcastGameUpdate(gameState);
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
  }
  
  // Broadcast game state updates to all connected players
  private broadcastGameUpdate(gameState: GameState): void {
    this.io.to('game').emit('game:update', gameState);
  }
  
  // Broadcast the list of connected players to all clients
  private broadcastPlayerList(): void {
    const playerList = Array.from(this.connectedPlayers.values()).map(player => ({
      playerId: player.playerId,
      playerName: player.playerName,
      joinedAt: player.joinedAt
    }));
    
    this.io.to('game').emit('player:list', playerList);
  }
}