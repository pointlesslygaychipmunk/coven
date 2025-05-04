/**
 * Socket Service
 * 
 * This service provides a wrapper around the WebSocket connection
 * to the backend, handling events, reconnection, and message passing.
 */

import { io, Socket } from 'socket.io-client';
import { GameState, Player } from 'coven-shared';

// Types for events
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

// Socket service class
class SocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private connecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 3000;
  private gameStateCallbacks: Set<GameStateCallback> = new Set();
  private playerJoinedCallbacks: Set<PlayerJoinedCallback> = new Set();
  private playerDisconnectedCallbacks: Set<PlayerDisconnectedCallback> = new Set();
  private chatMessageCallbacks: Set<ChatMessageCallback> = new Set();
  private playerListCallbacks: Set<PlayerListCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private connectionStatusCallbacks: Set<ConnectionStatusCallback> = new Set();
  
  /**
   * Initialize the socket connection
   */
  public init(): Promise<boolean> {
    if (this.connected || this.connecting) {
      return Promise.resolve(this.connected);
    }
    
    this.connecting = true;
    
    // Determine the backend URL based on the environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = window.location.port || (protocol === 'wss:' ? '443' : '80');
    const url = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8080' // Local development server
      : `${window.location.protocol}//${host}:${port}`; // Production/deployed server
      
    console.log(`[Socket] Connecting to ${url}`);
    
    this.socket = io(url, {
      reconnection: false, // We'll handle reconnection manually
      autoConnect: true, // Connect immediately
      transports: ['websocket', 'polling'], // Prefer WebSocket but fall back to polling
    });
    
    // Set up event listeners
    return new Promise((resolve) => {
      if (!this.socket) {
        this.connecting = false;
        resolve(false);
        return;
      }
      
      this.socket.on('connect', () => {
        console.log(`[Socket] Connected with ID: ${this.socket?.id}`);
        this.connected = true;
        this.connecting = false;
        this.reconnectAttempts = 0;
        this.notifyConnectionStatus(true);
        resolve(true);
      });
      
      this.socket.on('connect_error', (error) => {
        console.error(`[Socket] Connection error: ${error.message}`);
        this.connected = false;
        this.connecting = false;
        this.notifyConnectionStatus(false);
        this.attemptReconnect();
        resolve(false);
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log(`[Socket] Disconnected: ${reason}`);
        this.connected = false;
        this.notifyConnectionStatus(false);
        
        // Attempt to reconnect if not intentionally closed
        if (reason !== 'io client disconnect') {
          this.attemptReconnect();
        }
      });
      
      // Set up game event listeners
      this.setupEventListeners();
    });
  }
  
  /**
   * Close the socket connection
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.notifyConnectionStatus(false);
    }
  }
  
  /**
   * Attempt to reconnect to the server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[Socket] Max reconnect attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`[Socket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.init().then((success) => {
        if (!success && this.reconnectAttempts < this.maxReconnectAttempts) {
          // Continue trying to reconnect
          this.attemptReconnect();
        }
      });
    }, this.reconnectInterval);
  }
  
  /**
   * Set up all event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    // Game state events
    this.socket.on('game:state', (state: GameState) => {
      console.log('[Socket] Received initial game state');
      this.notifyGameState(state);
    });
    
    this.socket.on('game:update', (state: GameState) => {
      console.log('[Socket] Received game state update');
      this.notifyGameState(state);
    });
    
    // Player events
    this.socket.on('player:joined', (data: PlayerJoinedEvent) => {
      console.log(`[Socket] Player joined: ${data.playerName} (${data.playerId})`);
      this.notifyPlayerJoined(data);
    });
    
    this.socket.on('player:disconnected', (data: { playerId: string, playerName: string }) => {
      console.log(`[Socket] Player disconnected: ${data.playerName} (${data.playerId})`);
      this.notifyPlayerDisconnected(data);
    });
    
    this.socket.on('player:list', (players: PlayerListEvent[]) => {
      console.log(`[Socket] Received player list (${players.length} players)`);
      this.notifyPlayerList(players);
    });
    
    // Chat events
    this.socket.on('chat:message', (message: ChatMessageEvent) => {
      console.log(`[Socket] Chat message from ${message.senderName}: ${message.message}`);
      this.notifyChatMessage(message);
    });
    
    // Error events
    this.socket.on('error', (error: ErrorEvent) => {
      console.error(`[Socket] Error: ${error.message}`);
      this.notifyError(error);
    });
    
    this.socket.on('player:forced-disconnect', (data: { reason: string }) => {
      console.warn(`[Socket] Forced disconnect: ${data.reason}`);
      // No need to attempt reconnection here, as this is an intentional disconnect
      this.notifyError({ message: `You were disconnected: ${data.reason}` });
    });
  }
  
  /**
   * Join the game as a player
   */
  public joinGame(playerName: string, playerId?: string): void {
    if (!this.socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('player:join', { playerName, playerId });
  }
  
  /**
   * Send a chat message
   */
  public sendChatMessage(message: string): void {
    if (!this.socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('chat:message', { message });
  }
  
  /**
   * Plant a seed
   */
  public plantSeed(slotId: number, seedItemId: string): void {
    if (!this.socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('game:plant', { slotId, seedItemId });
  }
  
  /**
   * Water plants
   */
  public waterPlants(puzzleBonus: number = 0): void {
    if (!this.socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('game:water', { puzzleBonus });
  }
  
  /**
   * Harvest a plant
   */
  public harvestPlant(slotId: number): void {
    if (!this.socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('game:harvest', { slotId });
  }
  
  /**
   * Brew a potion
   */
  public brewPotion(ingredientInvItemIds: string[], puzzleBonus: number = 0): void {
    if (!this.socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('game:brew', { ingredientInvItemIds, puzzleBonus });
  }
  
  /**
   * Buy an item
   */
  public buyItem(itemId: string): void {
    if (!this.socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('game:buy', { itemId });
  }
  
  /**
   * Sell an item
   */
  public sellItem(itemId: string): void {
    if (!this.socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('game:sell', { itemId });
  }
  
  /**
   * Fulfill a request
   */
  public fulfillRequest(requestId: string): void {
    if (!this.socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('game:fulfill', { requestId });
  }
  
  /**
   * Claim a ritual reward
   */
  public claimRitualReward(ritualId: string): void {
    if (!this.socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('game:claim-ritual', { ritualId });
  }
  
  /**
   * End the current turn
   */
  public endTurn(): void {
    if (!this.socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('game:end-turn');
  }
  
  // Event subscription methods
  public onGameState(callback: GameStateCallback): () => void {
    this.gameStateCallbacks.add(callback);
    return () => this.gameStateCallbacks.delete(callback);
  }
  
  public onPlayerJoined(callback: PlayerJoinedCallback): () => void {
    this.playerJoinedCallbacks.add(callback);
    return () => this.playerJoinedCallbacks.delete(callback);
  }
  
  public onPlayerDisconnected(callback: PlayerDisconnectedCallback): () => void {
    this.playerDisconnectedCallbacks.add(callback);
    return () => this.playerDisconnectedCallbacks.delete(callback);
  }
  
  public onChatMessage(callback: ChatMessageCallback): () => void {
    this.chatMessageCallbacks.add(callback);
    return () => this.chatMessageCallbacks.delete(callback);
  }
  
  public onPlayerList(callback: PlayerListCallback): () => void {
    this.playerListCallbacks.add(callback);
    return () => this.playerListCallbacks.delete(callback);
  }
  
  public onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }
  
  public onConnectionStatus(callback: ConnectionStatusCallback): () => void {
    this.connectionStatusCallbacks.add(callback);
    return () => this.connectionStatusCallbacks.delete(callback);
  }
  
  // Event notification methods
  private notifyGameState(state: GameState): void {
    this.gameStateCallbacks.forEach(callback => callback(state));
  }
  
  private notifyPlayerJoined(data: PlayerJoinedEvent): void {
    this.playerJoinedCallbacks.forEach(callback => callback(data));
  }
  
  private notifyPlayerDisconnected(data: { playerId: string, playerName: string }): void {
    this.playerDisconnectedCallbacks.forEach(callback => callback(data));
  }
  
  private notifyChatMessage(message: ChatMessageEvent): void {
    this.chatMessageCallbacks.forEach(callback => callback(message));
  }
  
  private notifyPlayerList(players: PlayerListEvent[]): void {
    this.playerListCallbacks.forEach(callback => callback(players));
  }
  
  private notifyError(error: ErrorEvent): void {
    this.errorCallbacks.forEach(callback => callback(error));
  }
  
  private notifyConnectionStatus(status: boolean): void {
    this.connectionStatusCallbacks.forEach(callback => callback(status));
  }
  
  // Utility methods
  public isConnected(): boolean {
    return this.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;