/**
 * Emergency Ultra-Simple Socket Service - Complete Rewrite
 * 
 * A single-purpose minimal Socket.IO wrapper for production use ONLY.
 * Designed with absolute simplicity and reliability.
 */

import { io, Socket } from 'socket.io-client';
import { GameState } from 'coven-shared';

// Minimal type definitions
export interface PlayerJoinedEvent {
  success: boolean;
  playerId: string;
  playerName: string;
  message: string;
}

export interface ChatMessageEvent {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
}

export interface PlayerListEvent {
  playerId: string;
  playerName: string;
  joinedAt: number;
}

export interface ErrorEvent {
  message: string;
}

// Event callback types
type GameStateCallback = (state: GameState) => void;
type PlayerJoinedCallback = (event: PlayerJoinedEvent) => void;
type PlayerDisconnectedCallback = (data: { playerId: string, playerName: string }) => void;
type ChatMessageCallback = (message: ChatMessageEvent) => void;
type PlayerListCallback = (players: PlayerListEvent[]) => void;
type ErrorCallback = (error: ErrorEvent) => void;
type ConnectionStatusCallback = (status: boolean) => void;

// MINIMAL SERVICE IMPLEMENTATION
class SocketService {
  // Core socket
  private _socket: Socket | null = null;
  
  // Basic state
  private _connected = false;
  private _connecting = false;
  
  // Callback storage
  private _gameStateCallbacks: Array<GameStateCallback> = [];
  private _playerJoinedCallbacks: Array<PlayerJoinedCallback> = [];
  private _playerDisconnectedCallbacks: Array<PlayerDisconnectedCallback> = [];
  private _chatMessageCallbacks: Array<ChatMessageCallback> = [];
  private _playerListCallbacks: Array<PlayerListCallback> = [];
  private _errorCallbacks: Array<ErrorCallback> = [];
  private _connectionStatusCallbacks: Array<ConnectionStatusCallback> = [];
  
  // EMERGENCY: Clear ALL session storage connection counters
  constructor() {
    try {
      sessionStorage.removeItem('coven_reconnect_attempt_counter');
      sessionStorage.removeItem('coven_reconnect_start_time');
      sessionStorage.removeItem('coven_reconnect_start_time_v2');
      console.log('[Socket:EMERGENCY] All reconnection counters cleared on initialization');
    } catch (err) {
      // Ignore storage errors
    }
  }
  
  // ULTRA-SIMPLE SINGLE-PURPOSE CONNECTION FUNCTION
  public init(): Promise<boolean> {
    // If already connected, return immediately
    if (this._connected && this._socket) {
      return Promise.resolve(true);
    }
    
    // If connecting, wait briefly then return current state
    if (this._connecting) {
      return new Promise(resolve => 
        setTimeout(() => resolve(this._connected), 100)
      );
    }
    
    // Start connecting
    this._connecting = true;
    
    // Clean up any existing connection
    this.disconnect();
    
    // Get server URL - always use the current page origin
    const serverUrl = window.location.origin;
    
    // Log connection attempt
    console.log(`[Socket:EMERGENCY] Connecting to WebSocket server at ${serverUrl}`);
    
    // Attempt to create a socket connection
    try {
      // Create a new socket with minimal options
      this._socket = io(serverUrl, {
        transports: ['websocket'], // WebSocket only
        reconnection: false,       // We handle reconnection
        timeout: 10000,            // 10 second timeout
        forceNew: true,            // Always create a new connection
        query: {                   // Query params to help debug
          client: 'emergency-mode',
          time: Date.now().toString()
        }
      });
    } catch (err) {
      console.error('[Socket:EMERGENCY] Failed to create socket:', err);
      this._connecting = false;
      this._notifyConnectionStatus(false);
      this._notifyError({ message: 'Failed to create connection' });
      return Promise.resolve(false);
    }
    
    // Return a promise that resolves when connected
    return new Promise(resolve => {
      if (!this._socket) {
        this._connecting = false;
        resolve(false);
        return;
      }
      
      // Set up connection event
      this._socket.on('connect', () => {
        console.log(`[Socket:EMERGENCY] Connected successfully!`);
        this._connected = true;
        this._connecting = false;
        
        // Set up all event listeners
        this._setupEventListeners();
        
        // Notify about connection
        this._notifyConnectionStatus(true);
        this._notifyError({ message: 'Connected successfully' });
        
        resolve(true);
      });
      
      // Handle connection error
      this._socket.on('connect_error', (err) => {
        console.error(`[Socket:EMERGENCY] Connection error:`, err);
        this._connected = false;
        this._connecting = false;
        
        // Notify about error
        this._notifyConnectionStatus(false);
        this._notifyError({ message: 'Unable to connect to server' });
        
        resolve(false);
      });
      
      // Handle disconnection
      this._socket.on('disconnect', (reason) => {
        console.log(`[Socket:EMERGENCY] Disconnected: ${reason}`);
        this._connected = false;
        
        // Notify about disconnection
        this._notifyConnectionStatus(false);
      });
    });
  }
  
  // Simple event setup
  private _setupEventListeners(): void {
    if (!this._socket) return;
    
    // Clear existing listeners
    this._socket.removeAllListeners('game:state');
    this._socket.removeAllListeners('game:update');
    this._socket.removeAllListeners('player:joined');
    this._socket.removeAllListeners('player:disconnected'); 
    this._socket.removeAllListeners('player:list');
    this._socket.removeAllListeners('player:reconnected');
    this._socket.removeAllListeners('chat:message');
    this._socket.removeAllListeners('error');
    
    // Set game state listeners
    this._socket.on('game:state', (state: GameState) => {
      this._notifyGameState(state);
    });
    
    this._socket.on('game:update', (state: GameState) => {
      this._notifyGameState(state);
    });
    
    // Set player listeners
    this._socket.on('player:joined', (data: PlayerJoinedEvent) => {
      this._notifyPlayerJoined(data);
    });
    
    this._socket.on('player:disconnected', (data: { playerId: string, playerName: string }) => {
      this._notifyPlayerDisconnected(data);
    });
    
    this._socket.on('player:reconnected', (data: { playerId: string, playerName: string }) => {
      this._notifyPlayerJoined({
        success: true,
        playerId: data.playerId,
        playerName: data.playerName,
        message: 'Player reconnected'
      });
    });
    
    this._socket.on('player:list', (players: PlayerListEvent[]) => {
      if (Array.isArray(players)) {
        this._notifyPlayerList(players);
      } else {
        console.warn('[Socket:EMERGENCY] Invalid player list received');
        this._notifyPlayerList([]);
      }
    });
    
    // Set chat listener
    this._socket.on('chat:message', (message: ChatMessageEvent) => {
      this._notifyChatMessage(message);
    });
    
    // Set error listener
    this._socket.on('error', (error: ErrorEvent) => {
      this._notifyError(error);
    });
    
    // Set ping/pong for keep-alive
    this._socket.on('pong', () => {
      // Just a heartbeat
    });
    
    // Send periodic pings
    setInterval(() => {
      if (this._socket && this._connected) {
        this._socket.emit('ping', { time: Date.now() });
      }
    }, 30000);
  }
  
  // Disconnect and cleanup
  public disconnect(): void {
    console.log('[Socket:EMERGENCY] Disconnecting...');
    
    // Clean up socket if it exists
    if (this._socket) {
      try {
        this._socket.removeAllListeners();
        this._socket.disconnect();
      } catch (err) {
        // Ignore errors during disconnect
      }
      this._socket = null;
    }
    
    // Reset state
    this._connected = false;
    this._connecting = false;
    
    // Notify about disconnection
    this._notifyConnectionStatus(false);
  }
  
  // Simple getter for connected state
  public isConnected(): boolean {
    return this._connected;
  }
  
  // Socket accessor
  get socket(): Socket | null {
    return this._socket;
  }
  
  // GAME ACTIONS
  
  // Join game
  public joinGame(playerName: string, playerId?: string): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('player:join', { playerName, playerId });
  }
  
  // Chat message
  public sendChatMessage(message: string): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('chat:message', { message });
  }
  
  // Plant a seed
  public plantSeed(slotId: number, seedItemId: string): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:plant', { slotId, seedItemId });
  }
  
  // Water plants
  public waterPlants(puzzleBonus: number = 0): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:water', { puzzleBonus });
  }
  
  // Harvest a plant
  public harvestPlant(slotId: number): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:harvest', { slotId });
  }
  
  // Brew a potion
  public brewPotion(ingredientInvItemIds: string[], puzzleBonus: number = 0): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:brew', { ingredientInvItemIds, puzzleBonus });
  }
  
  // Buy an item
  public buyItem(itemId: string): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:buy', { itemId });
  }
  
  // Sell an item
  public sellItem(itemId: string): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:sell', { itemId });
  }
  
  // Fulfill a request
  public fulfillRequest(requestId: string): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:fulfill', { requestId });
  }
  
  // Claim a ritual reward
  public claimRitualReward(ritualId: string): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:claim-ritual', { ritualId });
  }
  
  // End the current turn
  public endTurn(): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:end-turn');
  }
  
  // SIMPLIFIED EVENT NOTIFICATIONS
  
  // Game state notification
  private _notifyGameState(state: GameState): void {
    for (const callback of this._gameStateCallbacks) {
      try {
        callback(state);
      } catch (err) {
        console.error('[Socket:EMERGENCY] Error in game state callback', err);
      }
    }
  }
  
  // Player joined notification
  private _notifyPlayerJoined(data: PlayerJoinedEvent): void {
    for (const callback of this._playerJoinedCallbacks) {
      try {
        callback(data);
      } catch (err) {
        console.error('[Socket:EMERGENCY] Error in player joined callback', err);
      }
    }
  }
  
  // Player disconnected notification
  private _notifyPlayerDisconnected(data: { playerId: string, playerName: string }): void {
    for (const callback of this._playerDisconnectedCallbacks) {
      try {
        callback(data);
      } catch (err) {
        console.error('[Socket:EMERGENCY] Error in player disconnected callback', err);
      }
    }
  }
  
  // Chat message notification
  private _notifyChatMessage(message: ChatMessageEvent): void {
    for (const callback of this._chatMessageCallbacks) {
      try {
        callback(message);
      } catch (err) {
        console.error('[Socket:EMERGENCY] Error in chat message callback', err);
      }
    }
  }
  
  // Player list notification
  private _notifyPlayerList(players: PlayerListEvent[]): void {
    for (const callback of this._playerListCallbacks) {
      try {
        callback(players);
      } catch (err) {
        console.error('[Socket:EMERGENCY] Error in player list callback', err);
      }
    }
  }
  
  // Error notification
  private _notifyError(error: ErrorEvent): void {
    for (const callback of this._errorCallbacks) {
      try {
        callback(error);
      } catch (err) {
        console.error('[Socket:EMERGENCY] Error in error callback', err);
      }
    }
  }
  
  // Connection status notification
  private _notifyConnectionStatus(status: boolean): void {
    for (const callback of this._connectionStatusCallbacks) {
      try {
        callback(status);
      } catch (err) {
        console.error('[Socket:EMERGENCY] Error in connection status callback', err);
      }
    }
  }
  
  // SIMPLIFIED EVENT SUBSCRIPTION
  
  // Game state subscription
  public onGameState(callback: GameStateCallback): () => void {
    this._gameStateCallbacks.push(callback);
    return () => {
      this._gameStateCallbacks = this._gameStateCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Player joined subscription
  public onPlayerJoined(callback: PlayerJoinedCallback): () => void {
    this._playerJoinedCallbacks.push(callback);
    return () => {
      this._playerJoinedCallbacks = this._playerJoinedCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Player disconnected subscription
  public onPlayerDisconnected(callback: PlayerDisconnectedCallback): () => void {
    this._playerDisconnectedCallbacks.push(callback);
    return () => {
      this._playerDisconnectedCallbacks = this._playerDisconnectedCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Player reconnected subscription (direct socket event)
  public onPlayerReconnected(callback: PlayerDisconnectedCallback): () => void {
    if (this._socket) {
      this._socket.on('player:reconnected', callback);
      return () => {
        if (this._socket) {
          this._socket.off('player:reconnected', callback);
        }
      };
    }
    return () => {}; // No-op if no socket
  }
  
  // Chat message subscription
  public onChatMessage(callback: ChatMessageCallback): () => void {
    this._chatMessageCallbacks.push(callback);
    return () => {
      this._chatMessageCallbacks = this._chatMessageCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Player list subscription
  public onPlayerList(callback: PlayerListCallback): () => void {
    this._playerListCallbacks.push(callback);
    return () => {
      this._playerListCallbacks = this._playerListCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Error subscription
  public onError(callback: ErrorCallback): () => void {
    this._errorCallbacks.push(callback);
    return () => {
      this._errorCallbacks = this._errorCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Connection status subscription
  public onConnectionStatus(callback: ConnectionStatusCallback): () => void {
    this._connectionStatusCallbacks.push(callback);
    return () => {
      this._connectionStatusCallbacks = this._connectionStatusCallbacks.filter(cb => cb !== callback);
    };
  }
}

// Create and export singleton
const socketService = new SocketService();
export default socketService;