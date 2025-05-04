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
  
  // ULTRA-SIMPLIFIED SINGLE-PURPOSE CONNECTION FUNCTION WITH ENHANCED DEBUGGING
  public async init(): Promise<boolean> {
    // Clear ALL storage to start fresh
    clearAllStorageValues();
    
    // If already connected, return immediately
    if (this._connected && this._socket) {
      console.log('[Socket:EMERGENCY] Already connected, returning true');
      return true;
    }
    
    // If connecting, wait briefly then return current state
    if (this._connecting) {
      console.log('[Socket:EMERGENCY] Connection in progress, waiting...');
      return new Promise(resolve => 
        setTimeout(() => resolve(this._connected), 100)
      );
    }
    
    // Start connecting
    this._connecting = true;
    
    // Clean up any existing connection
    this.disconnect();
    
    // Get server URL - always use the current page origin
    let serverUrl = window.location.origin;
    
    // CRITICAL FIX: Override serverUrl if we're on localhost to use correct port
    if (serverUrl.includes('localhost') && !serverUrl.includes(':8080')) {
      serverUrl = 'http://localhost:8080';
      console.log(`[Socket:EMERGENCY] Overriding server URL to use correct port: ${serverUrl}`);
    }
    
    // Try alternative URLs in last-resort situations
    const backupUrls = [serverUrl];
    
    // If not localhost, also try explicit HTTP and HTTPS versions
    if (!serverUrl.includes('localhost')) {
      const hostname = window.location.hostname;
      backupUrls.push(`https://${hostname}:443`);
      backupUrls.push(`http://${hostname}:80`);
      backupUrls.push(`https://${hostname}:8443`);
      backupUrls.push(`http://${hostname}:8080`);
    }
    
    // First test server connectivity before attempting Socket.IO connection
    let serverConnected = false;
    let workingUrl = '';
    
    // Try each URL until we find one that works
    for (const url of backupUrls) {
      console.log(`[Socket:EMERGENCY] Testing server connection to ${url}...`);
      
      try {
        const connectionTest = await testServerConnection(url);
        if (connectionTest) {
          console.log(`[Socket:EMERGENCY] Successfully connected to server at ${url}`);
          serverConnected = true;
          workingUrl = url;
          break;
        }
      } catch (e) {
        console.log(`[Socket:EMERGENCY] Failed to connect to ${url}:`, e);
      }
    }
    
    if (!serverConnected) {
      console.error('[Socket:EMERGENCY] Failed to connect to any server endpoint.');
      this._connecting = false;
      this._notifyConnectionStatus(false);
      this._notifyError({ message: 'Unable to reach the game server. Please check your internet connection.' });
      return false;
    }
    
    // Use the working URL for socket connection
    serverUrl = workingUrl;
    
    // Log connection attempt with detailed debug info
    console.log(`[Socket:EMERGENCY] Connecting to server at ${serverUrl}`);
    console.log(`[Socket:EMERGENCY] Protocol: ${window.location.protocol}`);
    console.log(`[Socket:EMERGENCY] Online status: ${navigator.onLine}`);
    
    // Attempt to create a socket connection
    try {
      // Create a new socket with MAXIMUM compatibility settings
      console.log('[Socket:EMERGENCY] Creating socket with MAXIMUM COMPATIBILITY mode');
      this._socket = io(serverUrl, {
        transports: ['polling', 'websocket'], // Allow polling AND websocket - try both
        reconnection: false,                  // We handle reconnection ourselves
        timeout: 30000,                       // Longer timeout (30sec)
        forceNew: true,                       // Always create a new connection
        autoConnect: true,                    // Connect immediately
        withCredentials: false,               // Don't send cookies - can cause CORS issues
        path: '/socket.io/',                  // Use default Socket.IO path
        query: {                              // Query params for debugging
          client: 'emergency-v3',
          time: Date.now().toString(),
          transport: 'compatibility-mode'
        }
      });
      
      // Log success creating socket object
      console.log('[Socket:EMERGENCY] Socket object created successfully');
    } catch (err) {
      console.error('[Socket:EMERGENCY] Failed to create socket:', err);
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
      
      // Connection error event
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
        
        this._connected = false;
        this._connecting = false;
        
        // Debug socket object state
        debugSocketConnection(this._socket);
        
        // Handle CORS errors specially
        if (err.message && err.message.includes('CORS')) {
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