/**
 * Emergency Ultra-Simple Socket Service - Complete Rewrite - v2
 * 
 * A single-purpose minimal Socket.IO wrapper for production use ONLY.
 * Designed with absolute simplicity and reliability.
 */

import { io, Socket } from 'socket.io-client';
import { GameState } from 'coven-shared';
import { clearAllStorageValues, debugSocketConnection, testServerConnection } from './connectionDebugger';

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
  
  // ENHANCED CONNECTION FUNCTION WITH CLOUDFLARE COMPATIBILITY
  public async init(retryCount = 0): Promise<boolean> {
    // Max retries to avoid infinite loops
    const MAX_RETRIES = 3;
    
    // Clear session storage but preserve player data in local storage
    try {
      // Only clear session storage on first attempt to avoid losing state during retries
      if (retryCount === 0) {
        console.log('[Socket:EMERGENCY] Clearing session storage for clean connection');
        sessionStorage.clear();
      }
    } catch (err) {
      console.warn('[Socket] Error clearing session storage:', err);
    }
    
    // If already connected, return immediately
    if (this._connected && this._socket) {
      console.log('[Socket] Already connected');
      return true;
    }
    
    // If connecting, wait briefly then return current state
    if (this._connecting) {
      console.log('[Socket] Connection in progress, waiting...');
      return new Promise(resolve => 
        setTimeout(() => resolve(this._connected), 100)
      );
    }
    
    // Start connecting
    this._connecting = true;
    
    // Clean up any existing connection
    if (retryCount === 0) { // Only disconnect on first try
      this.disconnect();
    } else {
      console.log(`[Socket:EMERGENCY] Retry attempt ${retryCount} of ${MAX_RETRIES}`);
    }
    
    // Production fix: Always use the current page origin
    const serverUrl = window.location.origin;
    console.log(`[Socket] Connecting to server at ${serverUrl} (retry: ${retryCount})`);
    
    // For Cloudflare, add a cache-busting query parameter to avoid cached responses
    const timestamp = Date.now().toString();
    
    // Attempt to create a socket connection with production-optimized settings
    try {
      // Create socket with Cloudflare Tunnel compatible settings with enhanced stability
      // CRITICAL FIX: Cloudflare Tunnels require polling transport with specific settings
      this._socket = io(serverUrl, {
        transports: ['polling'],              // POLLING ONLY - critical for Cloudflare Tunnels
        reconnection: false,                  // We handle reconnection ourselves
        timeout: 120000,                      // DOUBLED timeout for Cloudflare (120 seconds)
        forceNew: true,                       // Always create a new connection
        autoConnect: true,                    // Connect immediately
        path: '/socket.io/',                  // Default Socket.IO path
        extraHeaders: {                       // Add extra headers for Cloudflare
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Cloudflare-Skip-Cache': 'true',
          'X-Socket-Retry': retryCount.toString()
        },
        query: {                              // Query params with cache busting
          client: 'cloudflare-fix-v2',        // Identify as new client version 
          retry: retryCount.toString(),       // Track retry attempts
          time: timestamp,                    // Cache-busting timestamp
          nocache: timestamp,                 // Explicit cache busting
          // Add browser and environment info to help with debugging
          ua: encodeURIComponent(navigator.userAgent.substring(0, 50)),
          protocol: window.location.protocol,
          host: window.location.host
        },
        // Disable features that might cause issues with Cloudflare Tunnels
        upgrade: false,                       // Disable transport upgrade attempts
        rememberUpgrade: false,               // Don't remember transport upgrades
        timestampRequests: true,              // Add timestamps to requests to avoid caching
        rejectUnauthorized: false            // Accept self-signed certs through Cloudflare
        
        // NOTE: The polling property was removed because it's not supported by Socket.IO TypeScript types
        // Headers will be set via extraHeaders instead
      });
      
      console.log('[Socket] Socket connection created, waiting for connection...');
    } catch (err) {
      console.error('[Socket] Failed to create socket connection:', err);
      this._connecting = false;
      this._notifyConnectionStatus(false);
      this._notifyError({ message: 'Failed to create connection: ' + (err instanceof Error ? err.message : 'Unknown error') });
      return false;
    }
    
    // Return a promise that resolves when connected
    return new Promise(resolve => {
      if (!this._socket) {
        console.error('[Socket:EMERGENCY] Socket object is null after creation attempt');
        this._connecting = false;
        resolve(false);
        return;
      }
      
      // Log detailed debugging info
      console.log('[Socket:EMERGENCY] Socket connection attempt in progress...');
      
      // Add timeout to prevent hanging forever (30 seconds)
      const connectionTimeout = setTimeout(() => {
        if (!this._connected && this._socket) {
          console.error('[Socket:EMERGENCY] Connection timeout after 30 seconds');
          
          // Debug the socket object state
          debugSocketConnection(this._socket);
          
          // Force disconnect and cleanup
          this.disconnect();
          
          // Notify about timeout
          this._notifyConnectionStatus(false);
          this._notifyError({ message: 'Connection timed out. Please try refreshing the page.' });
          
          resolve(false);
        }
      }, 30000);
      
      // Debug socket transport selection
      if (this._socket.io && this._socket.io.engine) {
        console.log(`[Socket:EMERGENCY] Initial transport: ${this._socket.io.engine.transport.name}`);
        
        // Listen for transport changes
        this._socket.io.engine.on('upgrade', (transport) => {
          // Using any type to avoid type errors with Socket.IO Transport type
          console.log(`[Socket:EMERGENCY] Transport upgraded to: ${typeof transport === 'string' ? transport : 'unknown'}`);
        });
      }
      
      // Connection successful event
      this._socket.on('connect', () => {
        // Clear timeout
        clearTimeout(connectionTimeout);
        
        console.log(`[Socket:EMERGENCY] Connected successfully with ID: ${this._socket?.id}`);
        this._connected = true;
        this._connecting = false;
        
        // Log detailed connection info
        if (this._socket.io && this._socket.io.engine) {
          console.log(`[Socket:EMERGENCY] Connected using transport: ${this._socket.io.engine.transport.name}`);
        }
        
        // Set up all event listeners
        this._setupEventListeners();
        
        // Notify about connection
        this._notifyConnectionStatus(true);
        this._notifyError({ message: 'Connected successfully' });
        
        // Full debug of socket object for reference
        debugSocketConnection(this._socket);
        
        resolve(true);
      });
      
      // Connection error event with enhanced recovery
      this._socket.on('connect_error', (err) => {
        console.error(`[Socket:EMERGENCY] Connection error:`, err);
        
        // Try to get more debug info
        console.log(`[Socket:EMERGENCY] Connection error details:`);
        console.log(`- Message: ${err.message || 'Unknown error'}`);
        // Use safe property access for type - might not exist on all errors
        console.log(`- Type: ${(err as any).type || 'N/A'}`);
        console.log(`- Online: ${navigator.onLine}`);
        
        // Clear timeout
        clearTimeout(connectionTimeout);
        
        // Don't immediately set connected to false - we'll try recovery first
        this._connecting = false;
        
        // Debug socket object state
        debugSocketConnection(this._socket);
        
        // SPECIAL HANDLING FOR "server error" or "xhr poll error"
        // These are typical Cloudflare errors
        if (err.message === 'server error' || err.message.includes('xhr poll error')) {
          console.log('[Socket:EMERGENCY] Server/XHR error detected - trying alternate connection strategy');
          
          // Cleanup current socket but keep _connected true until we've tried all options
          if (this._socket) {
            // Don't emit any events, just clean up the socket object
            this._socket.removeAllListeners();
            this._socket.close();
            this._socket = null;
          }
          
          // Try to connect with hyper-aggressive Cloudflare-optimized settings
          try {
            console.log('[Socket:EMERGENCY] Attempting connection with ultra-aggressive Cloudflare settings');
            
            // Attempt to bypass potential caching issues with a completely fresh URL
            const freshUrl = `${serverUrl}?nocache=${Date.now()}&rand=${Math.random().toString().substring(2)}`;
            console.log('[Socket:EMERGENCY] Using fresh URL:', freshUrl);
            
            this._socket = io(freshUrl, {
              transports: ['polling'],         // Polling only - REQUIRED for Cloudflare Tunnels
              reconnection: false,
              timeout: 180000,                 // 3 minutes timeout for extreme patience
              forceNew: true,
              autoConnect: true,
              path: '/socket.io/',
              extraHeaders: {                  // Add extra headers for Cloudflare
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'X-Cloudflare-Skip-Cache': 'true',
                'X-Socket-Retry': 'emergency'  // Flag this as an emergency attempt
              },
              query: {
                client: 'cloudflare-emergency', // Emergency client identifier
                time: Date.now().toString(),   // Timestamp for cache busting
                random: Math.random().toString().substring(2),
                // Add minimal diagnostic info (avoid large headers)
                ua: encodeURIComponent(navigator.userAgent.substring(0, 50)),
                emergency: 'true',
                fallback: 'true'
              },
              // Disable all features that might cause issues
              upgrade: false,                  // Disable transport upgrade attempts
              rememberUpgrade: false,          // Don't remember transport upgrades
              timestampRequests: true,         // Add timestamps to requests to avoid caching
              rejectUnauthorized: false,       // Accept self-signed certs through Cloudflare
              withCredentials: false           // Don't send cookies
              
              // NOTE: The polling property was removed because it's not supported by Socket.IO TypeScript types
              // Headers need to be set via extraHeaders instead
            });
            
            // Setup this new socket
            this._setupEmergencySocket(this._socket, resolve);
            
            // Don't resolve yet - let the new socket's handlers do it
            return;
          } catch (pollingError) {
            console.error('[Socket:EMERGENCY] Polling transport attempt failed:', pollingError);
            this._notifyError({ message: 'Unable to connect to server: ' + pollingError.message });
          }
        } else if (err.message && err.message.includes('CORS')) {
          console.error('[Socket:EMERGENCY] CORS ERROR DETECTED. Check server configuration.');
          this._notifyError({ message: 'Server connection blocked by CORS policy. Please contact support.' });
        } else {
          // Notify about generic error
          this._notifyError({ message: 'Unable to connect to server: ' + err.message });
        }
        
        // Update connection status
        this._notifyConnectionStatus(false);
        
        // Resolve promise with failure
        resolve(false);
      });
      
      // Disconnection event
      this._socket.on('disconnect', (reason) => {
        console.log(`[Socket:EMERGENCY] Disconnected: ${reason}`);
        this._connected = false;
        
        // Notify about disconnection
        this._notifyConnectionStatus(false);
        
        // If connection was never established, resolve with false
        if (this._connecting) {
          this._connecting = false;
          resolve(false);
        }
      });
      
      // Additional error event
      this._socket.on('error', (error: any) => {
        console.error('[Socket:EMERGENCY] Socket error:', error);
        this._notifyError({ message: 'Socket error: ' + (error?.message || 'Unknown error') });
      });
    });
  }
  
  // Emergency socket setup for fallback connection attempts
  private _setupEmergencySocket(socket: Socket, resolve: (value: boolean) => void): void {
    if (!socket) {
      console.error('[Socket:EMERGENCY] Invalid socket object in emergency setup');
      resolve(false);
      return;
    }
    
    console.log('[Socket:EMERGENCY] Setting up emergency socket handlers');
    
    // Connection success
    socket.on('connect', () => {
      console.log(`[Socket:EMERGENCY] EMERGENCY SOCKET CONNECTED! ID: ${socket.id}`);
      
      // Set connected state
      this._connected = true;
      this._connecting = false;
      
      // Set up event listeners
      this._setupEventListeners();
      
      // Notify about successful connection
      this._notifyConnectionStatus(true);
      this._notifyError({ message: 'Connected to server (fallback method)' });
      
      resolve(true);
    });
    
    // Connection error
    socket.on('connect_error', (fallbackErr) => {
      console.error('[Socket:EMERGENCY] Emergency socket also failed:', fallbackErr);
      
      // Clean up
      socket.close();
      this._socket = null;
      this._connected = false;
      this._connecting = false;
      
      // Notify about error
      this._notifyConnectionStatus(false);
      this._notifyError({ 
        message: 'Unable to connect using any method. Please check your internet connection and try again.' 
      });
      
      resolve(false);
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