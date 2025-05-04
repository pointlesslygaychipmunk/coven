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
  private maxReconnectAttempts: number = 10; // Increased from 5 to 10
  private baseReconnectInterval: number = 1000; // Base interval for exponential backoff
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
  // Track which URL attempt we're on
  private urlAttempt: number = 0;
  private alternativeUrls: string[] = [];
    
  public init(): Promise<boolean> {
    if (this.connected || this.connecting) {
      return Promise.resolve(this.connected);
    }
    
    this.connecting = true;
    
    // Reset URL attempt if this is a fresh connection attempt
    if (this.reconnectAttempts === 0) {
      this.urlAttempt = 0;
      
      // Determine the backend URL based on the environment
      // Use the same domain and protocol as the frontend
      const host = window.location.hostname;
      const useSecure = window.location.protocol === 'https:';
      
      // Set up all possible URLs to try
      this.alternativeUrls = [];
      
      // For development environment (localhost), try these URLs in order
      if (host === 'localhost' || host === '127.0.0.1') {
        // Try specific ports first
        this.alternativeUrls.push(useSecure 
          ? `https://${host}:8443` // Secure dev connection with specific port
          : `http://${host}:8080`  // Non-secure dev connection with specific port
        );
        
        // Then try default ports
        this.alternativeUrls.push(useSecure 
          ? `https://${host}` // Secure dev connection with default port
          : `http://${host}`  // Non-secure dev connection with default port
        );
        
        // Finally try the opposite security protocol
        this.alternativeUrls.push(!useSecure 
          ? `https://${host}:8443` // Try secure if we started with non-secure
          : `http://${host}:8080`  // Try non-secure if we started with secure
        );
      } else {
        // For production, try these URLs in order
        
        // First try with no specific port (most common in production)
        this.alternativeUrls.push(useSecure 
          ? `https://${host}` // Secure connection using default port
          : `http://${host}`  // Non-secure connection using default port
        );
        
        // Then try with specific ports (in case the server uses non-standard ports)
        this.alternativeUrls.push(useSecure 
          ? `https://${host}:8443` // Secure connection with specific port
          : `http://${host}:8080`  // Non-secure connection with specific port
        );
        
        // Finally try the opposite security protocol
        this.alternativeUrls.push(!useSecure 
          ? `https://${host}` // Try secure if we started with non-secure
          : `http://${host}` // Try non-secure if we started with secure
        );
      }
    }
    
    // Get the next URL to try
    const url = this.alternativeUrls[this.urlAttempt % this.alternativeUrls.length];
    this.urlAttempt++;
    
    console.log(`[Socket] Connecting to ${url} (attempt ${this.urlAttempt}/${this.alternativeUrls.length})`);
    
    this.socket = io(url, {
      reconnection: false, // We'll handle reconnection manually
      autoConnect: true, // Connect immediately
      transports: ['polling', 'websocket'], // Try polling first, then websocket for more reliable initial connection
      path: '/socket.io', // Ensure correct socket.io path
      timeout: 10000, // Increase timeout to 10 seconds (default is 5s)
      forceNew: true, // Force a new connection
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
        console.error(`[Socket] Connection error: ${error.message}`, error);
        // Don't try to access the private uri property
        console.error(`[Socket] Failed to connect to server`);
        this.connected = false;
        this.connecting = false;
        this.notifyError({ message: `Failed to connect to server: ${error.message}` });
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
      // Notify the user with a more helpful error
      this.notifyError({ 
        message: `Unable to connect to the server after ${this.maxReconnectAttempts} attempts. Please check your internet connection and refresh the page.` 
      });
      return;
    }
    
    this.reconnectAttempts++;
    
    // Use exponential backoff to increase wait time between attempts
    // Formula: baseInterval * 2^(attemptNumber-1) with a bit of randomness
    const exponentialInterval = this.baseReconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    // Add some jitter to prevent all clients reconnecting simultaneously
    const jitter = Math.random() * 0.3 * exponentialInterval; 
    const reconnectInterval = Math.min(exponentialInterval + jitter, 30000); // Cap at 30 seconds
    
    console.log(`[Socket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${Math.round(reconnectInterval/1000)}s...`);
    
    // Update the UI to show reconnection attempt
    this.notifyError({ 
      message: `Connection lost. Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...` 
    });
    
    setTimeout(() => {
      this.init().then((success) => {
        if (!success && this.reconnectAttempts < this.maxReconnectAttempts) {
          // Continue trying to reconnect
          this.attemptReconnect();
        } else if (success) {
          // Clear any error messages since we're connected now
          this.notifyError({ message: "Connected to server successfully!" });
        }
      });
    }, reconnectInterval);
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