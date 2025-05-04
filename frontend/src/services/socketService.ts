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
  // Expose socket as a read-only property
  private _socket: Socket | null = null;
  
  get socket(): Socket | null {
    return this._socket;
  }
  private connected: boolean = false;
  private connecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 15; // Increased from 10 to 15
  private baseReconnectInterval: number = 1000; // Base interval for exponential backoff
  private gameStateCallbacks: Set<GameStateCallback> = new Set();
  private playerJoinedCallbacks: Set<PlayerJoinedCallback> = new Set();
  private playerDisconnectedCallbacks: Set<PlayerDisconnectedCallback> = new Set();
  private chatMessageCallbacks: Set<ChatMessageCallback> = new Set();
  private playerListCallbacks: Set<PlayerListCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private connectionStatusCallbacks: Set<ConnectionStatusCallback> = new Set();
  
  // Track current URL and connection attempts
  private urlAttempt: number = 0;
  private alternativeUrls: string[] = [];
  private connectionTimeoutId: number | null = null;
  private pingIntervalId: number | null = null;
  private lastSuccessfulUrl: string | null = null;
    
  public init(): Promise<boolean> {
    if (this.connected) {
      return Promise.resolve(true);
    }
    
    if (this.connecting) {
      return new Promise((resolve) => {
        // Check again in a short time if we're still connecting
        setTimeout(() => {
          resolve(this.connected);
        }, 500);
      });
    }
    
    this.connecting = true;
    
    // Reset URL attempt if this is a fresh connection attempt
    if (this.reconnectAttempts === 0) {
      this.urlAttempt = 0;
      
      // Determine the backend URL based on the environment
      // Use the same domain and protocol as the frontend
      const host = window.location.hostname;
      const protocol = window.location.protocol;
      const useSecure = protocol === 'https:';
      
      // Set up all possible URLs to try
      this.alternativeUrls = [];
      
      // If we have a previously successful URL, try that first
      if (this.lastSuccessfulUrl) {
        this.alternativeUrls.push(this.lastSuccessfulUrl);
      }
      
      // IMPORTANT: In production with HTTPS, only use secure WebSockets (WSS)
      // otherwise browsers will block mixed content
      
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
        
        // Add specific port alternatives
        this.alternativeUrls.push(`http://${host}:3000`); // Common Vite dev server port
        this.alternativeUrls.push(`http://${host}:5000`); // Another common port
        
        // Finally try the opposite security protocol (only if not HTTPS)
        if (!useSecure) {
          this.alternativeUrls.push(`https://${host}:8443`); // Try secure if we started with non-secure
        }
      } else {
        // For production, only use the current protocol to avoid mixed content warnings
        // Try current origin first (best option)
        this.alternativeUrls.push(window.location.origin);
        
        // Then try standard ports with same protocol
        if (useSecure) {
          // Only add HTTPS options if we're on HTTPS
          this.alternativeUrls.push(`https://${host}`); // Standard HTTPS port
          this.alternativeUrls.push(`https://${host}:443`); // Explicit HTTPS port
          this.alternativeUrls.push(`https://${host}:8443`); // Alternative HTTPS port
          
          // Try adding an explicit path
          this.alternativeUrls.push(`${window.location.origin}/socket.io`);
        } else {
          // Only add HTTP options if we're on HTTP
          this.alternativeUrls.push(`http://${host}`); // Standard HTTP port
          this.alternativeUrls.push(`http://${host}:80`); // Explicit HTTP port
          this.alternativeUrls.push(`http://${host}:8080`); // Alternative HTTP port
        }
      }
      
      // Remove duplicates and ensure protocol compatibility
      this.alternativeUrls = [...new Set(this.alternativeUrls)].filter(url => {
        // If we're on HTTPS, only allow HTTPS URLs to avoid mixed content
        if (useSecure) {
          return url.startsWith('https:');
        }
        return true;
      });
      
      console.log(`[Socket] Will try the following URLs: ${this.alternativeUrls.join(', ')}`);
    }
    
    // Get the next URL to try
    const url = this.alternativeUrls[this.urlAttempt % this.alternativeUrls.length];
    this.urlAttempt++;
    
    console.log(`[Socket] Connecting to ${url} (attempt ${this.urlAttempt}/${this.alternativeUrls.length})`);
    
    // Clear any existing socket and timeout
    this.cleanupExistingConnection();
    
    // Create connection timeout to prevent hanging indefinitely
    this.connectionTimeoutId = window.setTimeout(() => {
      console.error(`[Socket] Connection attempt to ${url} timed out`);
      if (this._socket) {
        this._socket.close();
        this._socket = null;
      }
      this.connecting = false;
      this.connected = false;
      this.notifyConnectionStatus(false);
      this.attemptReconnect();
    }, 15000); // 15 second timeout
    
    // Initialize socket connection
    try {
      console.log(`[Socket] Creating connection to ${url}`);
      
      // Determine if we're using /socket.io path explicitly in the URL
      const hasExplicitPath = url.includes('/socket.io');
      
      this._socket = io(url, {
        reconnection: false, // We'll handle reconnection manually
        autoConnect: true, // Connect immediately
        transports: ['polling', 'websocket'], // Start with polling for more reliable initial connection
        path: hasExplicitPath ? undefined : '/socket.io', // Only set path if not in URL already
        timeout: 15000, // Increase timeout to 15 seconds for more reliability
        forceNew: true, // Force a new connection
        query: { clientTime: Date.now().toString() }, // Add timestamp to prevent caching issues
        withCredentials: false, // Don't send cookies for cross-origin requests
        extraHeaders: {
          'Cache-Control': 'no-cache'
        }
      });
    } catch (err) {
      console.error(`[Socket] Error creating socket: ${err.message}`);
      this._socket = null;
      this.connecting = false;
      this.notifyError({ message: `Failed to create socket connection: ${err.message}` });
      this.notifyConnectionStatus(false);
      this.attemptReconnect();
      return Promise.resolve(false);
    }
    
    // Set up event listeners
    return new Promise((resolve) => {
      if (!this._socket) {
        this.clearConnectionTimeout();
        this.connecting = false;
        resolve(false);
        return;
      }
      
      this._socket.on('connect', () => {
        console.log(`[Socket] Connected with ID: ${this._socket?.id}`);
        this.clearConnectionTimeout();
        this.connected = true;
        this.connecting = false;
        this.reconnectAttempts = 0;
        this.lastSuccessfulUrl = url; // Remember the successful URL
        
        // Setup ping interval to keep connection alive
        this.setupPingInterval();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Notify connection status AFTER event listeners are set up
        this.notifyConnectionStatus(true);
        
        resolve(true);
      });
      
      this._socket.on('connect_error', (error) => {
        console.error(`[Socket] Connection error: ${error.message}`, error);
        console.error(`[Socket] Failed to connect to server at ${url}`);
        this.clearConnectionTimeout();
        this.connected = false;
        this.connecting = false;
        
        // Simplify error message for the user
        let userMessage;
        if (error.message.includes('xhr poll error') || error.message.includes('websocket error')) {
          userMessage = 'Could not reach the game server. Please check your connection or try again later.';
        } else if (error.message.includes('timeout')) {
          userMessage = 'Connection to server timed out. Please try again later.';
        } else {
          userMessage = `Connection error: ${error.message}`;
        }
        
        this.notifyError({ message: userMessage });
        this.notifyConnectionStatus(false);
        this.attemptReconnect();
        resolve(false);
      });
      
      this._socket.on('disconnect', (reason) => {
        console.log(`[Socket] Disconnected: ${reason}`);
        this.clearPingInterval();
        this.connected = false;
        this.notifyConnectionStatus(false);
        
        // Attempt to reconnect if not intentionally closed
        if (reason !== 'io client disconnect') {
          this.attemptReconnect();
        }
      });
      
      this._socket.on('error', (error) => {
        console.error('[Socket] Socket error:', error);
        this.notifyError({ message: `Socket error: ${error}` });
      });
    });
  }
  
  /**
   * Clean up any existing connection resources
   */
  private cleanupExistingConnection(): void {
    this.clearConnectionTimeout();
    this.clearPingInterval();
    
    if (this._socket) {
      this._socket.removeAllListeners();
      this._socket.close();
      this._socket = null;
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
    
    // Send a ping every 30 seconds to keep the connection alive
    this.pingIntervalId = window.setInterval(() => {
      if (this._socket && this.connected) {
        this._socket.emit('ping', { timestamp: Date.now() });
      }
    }, 30000);
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
   * Close the socket connection
   */
  public disconnect(): void {
    this.cleanupExistingConnection();
    this.connected = false;
    this.notifyConnectionStatus(false);
  }
  
  /**
   * Attempt to reconnect to the server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[Socket] Max reconnect attempts (${this.maxReconnectAttempts}) reached`);
      
      // Check if we can fallback to REST API mode
      this.notifyError({ 
        message: `Unable to establish a real-time connection. The game will use a limited mode that requires refreshing to see updates.` 
      });
      
      // If you have a REST API fallback, you could enable it here
      // this.enableRestApiFallback();
      
      return;
    }
    
    this.reconnectAttempts++;
    
    // Use a more gentle backoff strategy to improve UX
    // Start with quick retries, then get slower
    let reconnectInterval;
    
    if (this.reconnectAttempts <= 3) {
      // Quick retries for the first few attempts (2-3 seconds)
      reconnectInterval = 2000 + (this.reconnectAttempts * 500);
    } else if (this.reconnectAttempts <= 6) {
      // Medium delay for next few attempts (5-8 seconds)
      reconnectInterval = 5000 + ((this.reconnectAttempts - 3) * 1000);
    } else {
      // Longer delays for later attempts, capped at 30 seconds
      reconnectInterval = Math.min(10000 + ((this.reconnectAttempts - 6) * 2000), 30000);
    }
    
    // Add a small random jitter to prevent thundering herd
    const jitter = Math.random() * 0.2 * reconnectInterval;
    reconnectInterval = Math.round(reconnectInterval + jitter);
    
    console.log(`[Socket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${Math.round(reconnectInterval/1000)}s...`);
    
    // Show fewer messages to the user to avoid spam
    if (this.reconnectAttempts % 3 === 1 || this.reconnectAttempts === this.maxReconnectAttempts - 1) {
      this.notifyError({ 
        message: `Still trying to connect to the game server (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...` 
      });
    }
    
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