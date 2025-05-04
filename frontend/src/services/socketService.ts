/**
 * Production Socket Service
 * 
 * This service provides a production-ready wrapper around the WebSocket connection
 * to the backend, handling events, reconnection, and message passing.
 * 
 * IMPORTANT: This version is configured for LIVE PRODUCTION DEPLOYMENT.
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
  // Expose socket as a read-only property
  private _socket: Socket | null = null;
  
  get socket(): Socket | null {
    return this._socket;
  }
  
  // Connection states
  private connected: boolean = false;
  private connecting: boolean = false;
  
  // Production configuration constants
  private readonly PRODUCTION_RECONNECT_ATTEMPTS = 3; // Only try 3 times in production
  private readonly PRODUCTION_CONNECT_TIMEOUT = 30000; // 30 seconds timeout for production
  private readonly PRODUCTION_PING_INTERVAL = 20000; // 20 seconds ping interval
  
  // Reconnection variables
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3; // Reduced for production reliability
  private baseReconnectInterval: number = 5000; // 5 seconds base in production
  
  // Legacy variables kept for compatibility
  private _recoveryIntervalId: number | null = null;
  private _reconnectTimeoutId: number | null = null;
  private _totalRecoveryAttempts: number = 0;
  private _firstReconnectTime: number | null = null;
  private urlAttempt: number = 0;
  private alternativeUrls: string[] = [];
  
  // Event callbacks
  private gameStateCallbacks: Set<GameStateCallback> = new Set();
  private playerJoinedCallbacks: Set<PlayerJoinedCallback> = new Set();
  private playerDisconnectedCallbacks: Set<PlayerDisconnectedCallback> = new Set();
  private chatMessageCallbacks: Set<ChatMessageCallback> = new Set();
  private playerListCallbacks: Set<PlayerListCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private connectionStatusCallbacks: Set<ConnectionStatusCallback> = new Set();
  
  // Infrastructure variables
  private connectionTimeoutId: number | null = null;
  private pingIntervalId: number | null = null;
  private lastSuccessfulUrl: string | null = null;
  
  // SIMPLIFIED PRODUCTION VARIABLES
  // We're removing all URL tracking and alternatives
  // In production, we only use the current origin
    
  /**
   * Initialize and connect to the Socket.IO server
   * COMPLETELY REWRITTEN FOR PRODUCTION
   */
  public init(): Promise<boolean> {
    if (this.connected) {
      return Promise.resolve(true);
    }
    
    if (this.connecting) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.connected), 500);
      });
    }
    
    this.connecting = true;
    
    // PRODUCTION CONNECTION CODE
    // In production, we connect ONLY to the current origin
    const socketUrl = window.location.origin;
    
    console.log(`[Socket] PRODUCTION MODE: Using server URL ${socketUrl}`);
    
    // Clean up any existing connection
    this.cleanupExistingConnection();
    
    // Set a connection timeout
    this.connectionTimeoutId = window.setTimeout(() => {
      console.error(`[Socket] Connection attempt to server timed out`);
      
      if (this._socket) {
        this._socket.close();
        this._socket = null;
      }
      
      this.connecting = false;
      this.connected = false;
      this.notifyConnectionStatus(false);
      
      // Set a clear user message
      this.notifyError({
        message: `Unable to connect to the game server. The server may be temporarily unavailable.`
      });
      
      // EMERGENCY CONNECTION LIMIT RESET
      // Clear session storage counters to avoid reconnection limits
      try {
        sessionStorage.removeItem('coven_reconnect_attempt_counter');
        sessionStorage.removeItem('coven_reconnect_start_time');
        sessionStorage.removeItem('coven_reconnect_start_time_v2');
      } catch (storageErr) {
        console.error('[Socket] Error clearing session storage:', storageErr);
      }
      
      // Only retry once in production to avoid excessive attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`[Socket] Timeout recovery, attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        setTimeout(() => this.attemptReconnect(), 5000);
      } else {
        console.log(`[Socket] Maximum reconnection attempts reached (${this.maxReconnectAttempts}). No further automatic reconnection.`);
      }
    }, this.PRODUCTION_CONNECT_TIMEOUT);
    
    // Connect to the Socket.IO server
    try {
      console.log(`[Socket] Connecting to ${socketUrl}`);
      
      // MINIMAL PRODUCTION CONFIG
      // Using simplified connection options for production reliability
      this._socket = io(socketUrl, {
        reconnection: false,              // Important: We handle reconnection ourselves
        autoConnect: true,                // Connect immediately
        transports: ['websocket'],        // WEBSOCKET ONLY in production for reliability
        timeout: this.PRODUCTION_CONNECT_TIMEOUT,
        forceNew: true,                   // Always create a new connection
        upgrade: false,                   // Don't try to upgrade transport
        rememberUpgrade: false,           // Don't remember upgrades
        transportOptions: {               // Additional transport options for stability
          websocket: {
            maxPayload: 1024 * 1024,      // Limit frame size to 1MB 
            timeout: this.PRODUCTION_CONNECT_TIMEOUT
          }
        },
        query: { 
          time: Date.now().toString(),    // For connection debugging
          client: 'production',           // Identify as production client
          v: '1'                          // Add version to force fresh connection
        }
      });
    } catch (err: any) {
      console.error(`[Socket] Socket creation error: ${err?.message || 'Unknown error'}`);
      this._socket = null;
      this.connecting = false;
      this.notifyError({ message: `Connection error: ${err?.message || 'Unknown error'}` });
      this.notifyConnectionStatus(false);
      
      // Try to reconnect once
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.attemptReconnect(), 5000);
      }
      
      return Promise.resolve(false);
    }
    
    // Set up connection event listeners
    return new Promise((resolve) => {
      if (!this._socket) {
        this.clearConnectionTimeout();
        this.connecting = false;
        resolve(false);
        return;
      }
      
      // Connection succeeded
      this._socket.on('connect', () => {
        console.log(`[Socket] Connected successfully with ID: ${this._socket?.id}`);
        this.clearConnectionTimeout();
        this.connected = true;
        this.connecting = false;
        this.reconnectAttempts = 0;
        this.lastSuccessfulUrl = socketUrl;
        
        // Start ping interval to keep connection alive
        this.setupPingInterval();
        
        // Set up game event listeners
        this.setupEventListeners();
        
        // Notify components of connection
        this.notifyConnectionStatus(true);
        
        resolve(true);
      });
      
      // Connection error
      this._socket.on('connect_error', (error: any) => {
        console.error(`[Socket] Connection error: ${error?.message || 'Unknown error'}`);
        
        this.clearConnectionTimeout();
        this.connected = false;
        this.connecting = false;
        
        // Log detailed diagnostics
        console.log(`[Socket] Diagnostics:
          - Server: ${socketUrl}
          - Protocol: ${window.location.protocol}
          - Secure: ${window.isSecureContext}
          - Online: ${navigator.onLine}
          - Error: ${error?.message || 'Unknown'}
        `);
        
        // Simple error message for user
        const userMessage = navigator.onLine
          ? `Unable to connect to game server. Please try again later.`
          : `You appear to be offline. Please check your internet connection.`;
        
        this.notifyError({ message: userMessage });
        this.notifyConnectionStatus(false);
        
        // EMERGENCY CONNECTION LIMIT RESET
        // Clear session storage counters to avoid reconnection limits
        // This fixes the "maximum reconnection attempts reached" issue
        try {
          sessionStorage.removeItem('coven_reconnect_attempt_counter');
          sessionStorage.removeItem('coven_reconnect_start_time');
          sessionStorage.removeItem('coven_reconnect_start_time_v2');
        } catch (storageErr) {
          console.error('[Socket] Error clearing session storage:', storageErr);
        }
        
        // Only retry if we haven't reached max attempts
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          // Use a non-recursive approach with a simple setTimeout
          setTimeout(() => this.attemptReconnect(), 5000);
        }
        
        resolve(false);
      });
      
      // Disconnection
      this._socket.on('disconnect', (reason: string) => {
        console.log(`[Socket] Disconnected: ${reason}`);
        this.clearPingInterval();
        this.connected = false;
        this.notifyConnectionStatus(false);
        
        // Only attempt reconnection for non-intentional disconnects
        if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          this.attemptReconnect();
        }
      });
      
      // Socket error
      this._socket.on('error', (error: any) => {
        console.error('[Socket] Socket error:', error);
        this.notifyError({ message: `Connection error. Please try again later.` });
      });
    });
  }
  
  /**
   * Clean up any existing connection resources
   * Simplified for production
   */
  private cleanupExistingConnection(): void {
    // Clear all timeouts
    this.clearConnectionTimeout();
    this.clearPingInterval();
    
    // Close and clean up socket
    if (this._socket) {
      try {
        console.log('[Socket] Cleaning up existing socket connection');
        this._socket.removeAllListeners();
        this._socket.close();
      } catch (err) {
        console.error('[Socket] Error during socket cleanup:', err);
      } finally {
        this._socket = null;
      }
    }
  }
  
  /**
   * Clear connection timeout
   */
  private clearConnectionTimeout(): void {
    if (this.connectionTimeoutId !== null) {
      window.clearTimeout(this.connectionTimeoutId);
      this.connectionTimeoutId = null;
    }
  }
  
  /**
   * Setup ping interval to keep connection alive
   */
  private setupPingInterval(): void {
    this.clearPingInterval();
    
    // Send a ping to keep the connection alive
    this.pingIntervalId = window.setInterval(() => {
      if (this._socket && this.connected) {
        this._socket.emit('ping', { timestamp: Date.now() });
      }
    }, this.PRODUCTION_PING_INTERVAL);
  }
  
  /**
   * Clear ping interval
   */
  private clearPingInterval(): void {
    if (this.pingIntervalId !== null) {
      window.clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }
  
  /**
   * Close the socket connection and clean up all resources
   * COMPLETELY SIMPLIFIED for maximum reliability
   */
  public disconnect(): void {
    // Log disconnect attempt
    console.log('[Socket] Disconnecting...');
    
    // First, clean up the socket
    this.cleanupExistingConnection();
    
    // Clear ALL timeouts and intervals to prevent memory leaks
    // and prevent unwanted reconnection attempts
    
    // Clear connection timeout
    if (this.connectionTimeoutId !== null) {
      window.clearTimeout(this.connectionTimeoutId);
      this.connectionTimeoutId = null;
    }
    
    // Clear ping interval
    if (this.pingIntervalId !== null) {
      window.clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
    
    // Clear the reconnect timeout if exists
    if (this._reconnectTimeoutId !== null) {
      window.clearTimeout(this._reconnectTimeoutId);
      this._reconnectTimeoutId = null;
    }
    
    // Clear recovery interval if exists
    if (this._recoveryIntervalId !== null) {
      window.clearInterval(this._recoveryIntervalId);
      this._recoveryIntervalId = null;
    }
    
    // Reset ALL connection states to prevent future reconnection attempts
    this.connected = false;
    this.connecting = false;
    this.reconnectAttempts = 0;
    this._totalRecoveryAttempts = 0;
    this._firstReconnectTime = null;
    this.urlAttempt = 0;
    this.alternativeUrls = [];
    this.lastSuccessfulUrl = null;
    
    // Clear ALL session storage counters to ensure clean future connections
    try {
      sessionStorage.removeItem('coven_reconnect_attempt_counter');
      sessionStorage.removeItem('coven_reconnect_start_time');
      sessionStorage.removeItem('coven_reconnect_start_time_v2');
    } catch (err) {
      console.error('[Socket] Error clearing session storage:', err);
    }
    
    // Notify of disconnection
    this.notifyConnectionStatus(false);
    console.log('[Socket] Disconnected and all resources cleaned up');
  }
  
  /**
   * Ultra-simplified reconnection method for production
   * This version is rewritten to be extremely simple and more reliable
   */
  private attemptReconnect(): void {
    console.log(`[Socket] Production reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    // EXTREMELY SIMPLIFIED: 
    // If we're offline, just wait for online status
    // Otherwise make ONE attempt with a fixed delay
    // No recursive calls or complex logic that could lead to infinite loops
    
    // Check if the browser is offline
    if (!navigator.onLine) {
      console.log('[Socket] Device is offline. Waiting for online status...');
      
      // Show a clear message to the user
      this.notifyError({ 
        message: "You appear to be offline. Please check your internet connection."
      });
      
      // Set up a listener for when we come back online
      const onlineHandler = () => {
        console.log('[Socket] Device is back online. Attempting reconnection...');
        window.removeEventListener('online', onlineHandler);
        
        // Wait a moment for the connection to stabilize
        setTimeout(() => {
          // Reset attempt counter on network change
          this.reconnectAttempts = 0;
          this.init();
        }, 2000);
      };
      
      window.addEventListener('online', onlineHandler);
      return;
    }
    
    // Check if we've reached the maximum number of attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[Socket] Maximum reconnection attempts (${this.maxReconnectAttempts}) reached`);
      
      // Show a final error message to the user
      this.notifyError({
        message: "Unable to connect after multiple attempts. Please refresh the page to try again."
      });
      
      return;
    }
    
    // Use a fixed delay - no randomization, extremely simple approach
    const RECONNECT_DELAY = 5000; // 5 seconds
    
    console.log(`[Socket] Will attempt to reconnect in ${RECONNECT_DELAY/1000} seconds...`);
    
    // Set up a single attempt after the delay
    // IMPORTANT: We're using a local variable for the timeout ID so we can cancel it
    const timeoutId = setTimeout(() => {
      // Try to connect again
      this.init().then(success => {
        if (success) {
          console.log('[Socket] Reconnection successful!');
          
          // Reset attempt counter on success
          this.reconnectAttempts = 0;
          
          // Clear the session storage counters to avoid issues in MultiplayerContext
          sessionStorage.removeItem('coven_reconnect_attempt_counter');
          sessionStorage.removeItem('coven_reconnect_start_time');
          sessionStorage.removeItem('coven_reconnect_start_time_v2');
          
          // Show success message
          this.notifyError({ message: "Connected to server successfully!" });
        }
        // We do NOT recursively call attemptReconnect here - the MultiplayerContext 
        // will handle future reconnection attempts if needed
      }).catch((err) => {
        // Just log the error - no recursive calls
        console.error('[Socket] Reconnection error:', err?.message || 'Unknown');
      });
    }, RECONNECT_DELAY);
    
    // Add one to the attempt counter
    this.reconnectAttempts++;
    
    // Store the timeout ID in a class property so we can cancel it later if needed
    this._reconnectTimeoutId = timeoutId as any;
  }
  
  // Simple tracking properties
  private _socketInitTime: number = 0;
  
  /**
   * Set up all event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    // First, ensure we remove any duplicate listeners
    this.socket.removeAllListeners('game:state');
    this.socket.removeAllListeners('game:update');
    this.socket.removeAllListeners('player:joined');
    this.socket.removeAllListeners('player:disconnected');
    this.socket.removeAllListeners('player:list');
    this.socket.removeAllListeners('player:reconnected');
    this.socket.removeAllListeners('chat:message');
    this.socket.removeAllListeners('error');
    this.socket.removeAllListeners('player:forced-disconnect');
    this.socket.removeAllListeners('pong');
    
    // Game state events
    this.socket.on('game:state', (state: GameState) => {
      console.log('[Socket] Received initial game state');
      if (state) {
        this.notifyGameState(state);
      } else {
        console.warn('[Socket] Received empty game state');
      }
    });
    
    this.socket.on('game:update', (state: GameState) => {
      console.log('[Socket] Received game state update');
      if (state) {
        this.notifyGameState(state);
      } else {
        console.warn('[Socket] Received empty game state update');
      }
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
    
    this.socket.on('player:reconnected', (data: { playerId: string, playerName: string }) => {
      console.log(`[Socket] Player reconnected: ${data.playerName} (${data.playerId})`);
      // Handle player reconnection - could use the same handler as player:joined for simplicity
      this.notifyPlayerJoined({
        success: true,
        playerId: data.playerId,
        playerName: data.playerName,
        message: 'Player reconnected'
      });
    });
    
    this.socket.on('player:list', (players: PlayerListEvent[]) => {
      console.log(`[Socket] Received player list (${players.length} players)`);
      if (Array.isArray(players)) {
        this.notifyPlayerList(players);
      } else {
        console.warn('[Socket] Received invalid player list');
        this.notifyPlayerList([]);
      }
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
    
    // Handle pong response (keep-alive)
    this.socket.on('pong', (data: { serverTime: number, clientTime: number }) => {
      const roundTripTime = Date.now() - data.clientTime;
      console.log(`[Socket] Pong received. Round trip time: ${roundTripTime}ms`);
    });
  }
  
  /**
   * Join the game as a player
   */
  public joinGame(playerName: string, playerId?: string): void {
    if (!this._socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('player:join', { playerName, playerId });
  }
  
  /**
   * Send a chat message
   */
  public sendChatMessage(message: string): void {
    if (!this._socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('chat:message', { message });
  }
  
  /**
   * Plant a seed
   */
  public plantSeed(slotId: number, seedItemId: string): void {
    if (!this._socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:plant', { slotId, seedItemId });
  }
  
  /**
   * Water plants
   */
  public waterPlants(puzzleBonus: number = 0): void {
    if (!this._socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:water', { puzzleBonus });
  }
  
  /**
   * Harvest a plant
   */
  public harvestPlant(slotId: number): void {
    if (!this._socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:harvest', { slotId });
  }
  
  /**
   * Brew a potion
   */
  public brewPotion(ingredientInvItemIds: string[], puzzleBonus: number = 0): void {
    if (!this._socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:brew', { ingredientInvItemIds, puzzleBonus });
  }
  
  /**
   * Buy an item
   */
  public buyItem(itemId: string): void {
    if (!this._socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:buy', { itemId });
  }
  
  /**
   * Sell an item
   */
  public sellItem(itemId: string): void {
    if (!this._socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:sell', { itemId });
  }
  
  /**
   * Fulfill a request
   */
  public fulfillRequest(requestId: string): void {
    if (!this._socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:fulfill', { requestId });
  }
  
  /**
   * Claim a ritual reward
   */
  public claimRitualReward(ritualId: string): void {
    if (!this._socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:claim-ritual', { ritualId });
  }
  
  /**
   * End the current turn
   */
  public endTurn(): void {
    if (!this._socket || !this.connected) {
      this.notifyError({ message: 'Not connected to server' });
      return;
    }
    
    this._socket.emit('game:end-turn');
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
  
  public onPlayerReconnected(callback: PlayerDisconnectedCallback): () => void {
    // We can reuse the PlayerDisconnectedCallback type since it has the same shape
    if (this._socket) {
      // Add a direct event listener for this specific callback
      this._socket.on('player:reconnected', callback);
      // Return a cleanup function
      return () => {
        if (this._socket) {
          this._socket.off('player:reconnected', callback);
        }
      };
    }
    // Return a no-op if socket isn't available
    return () => {};
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