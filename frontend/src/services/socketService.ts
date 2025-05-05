/**
 * Socket Service - Ngrok Edition
 * 
 * A Socket.IO wrapper optimized for connecting through ngrok tunnels.
 * Provides secure WebSocket connections with fallback to polling.
 */

import { io, Socket } from 'socket.io-client';
import { GameState } from 'coven-shared';
import { clearAllStorageValues, debugSocketConnection, testServerConnection } from './connectionDebugger';
import { getSocketConnection, checkConnectionHealth, forceReconnect } from './connectionFix';

// Minimal type definitions
export interface PlayerJoinedEvent {
  success: boolean;
  playerId: string;
  playerName: string;
  message: string;
}

export interface ChatMessageEvent {
  playerId: string;
  playerName: string;
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

// SOCKET SERVICE IMPLEMENTATION
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
  
  // Constructor - initialize any state
  constructor() {
    console.log('[Socket] Service initialized, ready to connect via ngrok');
  }
  
  // CONNECTION FUNCTION OPTIMIZED FOR NGROK
  public async init(): Promise<boolean> {
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
    this.disconnect();
    
    try {
      console.log('[Socket] Connecting via ngrok');
      
      // Get the socket connection from our connection fix utility
      this._socket = getSocketConnection();
      
      // Return a promise that resolves when connected
      return new Promise(resolve => {
        if (!this._socket) {
          console.error('[Socket] Socket object is null after creation attempt');
          this._connecting = false;
          resolve(false);
          return;
        }
        
        console.log('[Socket] Socket connection attempt in progress...');
        
        // Add timeout to prevent hanging forever (20 seconds)
        const connectionTimeout = setTimeout(() => {
          if (!this._connected && this._socket) {
            console.error('[Socket] Connection timeout after 20 seconds');
            
            // Force disconnect and cleanup
            this.disconnect();
            
            // Notify about timeout
            this._notifyConnectionStatus(false);
            this._notifyError({ 
              message: 'Connection timed out. Check if ngrok tunnel is running and URL is correct.'
            });
            
            resolve(false);
          }
        }, 20000);
        
        // Connection successful event
        this._socket.on('connect', () => {
          // Clear timeout
          clearTimeout(connectionTimeout);
          
          console.log(`[Socket] Connected successfully with ID: ${this._socket?.id}`);
          this._connected = true;
          this._connecting = false;
          
          // Log transport info
          const health = checkConnectionHealth();
          console.log(`[Socket] Connected using transport: ${health.transport || 'unknown'}`);
          
          // Set up all event listeners
          this._setupEventListeners();
          
          // Notify about connection
          this._notifyConnectionStatus(true);
          
          resolve(true);
        });
        
        // Connection error event
        this._socket.on('connect_error', (err) => {
          console.error(`[Socket] Connection error:`, err);
          console.log(`- Message: ${err.message || 'Unknown error'}`);
          console.log(`- Online: ${navigator.onLine}`);
          
          // Clear timeout
          clearTimeout(connectionTimeout);
          
          // Only notify on first error
          if (this._connecting) {
            this._notifyConnectionStatus(false);
            this._notifyError({ message: `Connection error: ${err.message}` });
          }
          
          // Mark as not connecting so we can try again
          this._connecting = false;
          
          // Resolve the promise with failure
          resolve(false);
        });
      });
      
    } catch (err) {
      console.error('[Socket] Failed to create socket connection:', err);
      this._connecting = false;
      this._notifyConnectionStatus(false);
      this._notifyError({ message: 'Failed to create connection: ' + (err instanceof Error ? err.message : 'Unknown error') });
      return false;
    }
  }
  
  // Set up all event listeners
  private _setupEventListeners(): void {
    if (!this._socket) return;
    
    // Connection lost event
    this._socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${reason}`);
      this._connected = false;
      this._notifyConnectionStatus(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected us - can try to reconnect
        this._notifyError({ message: 'Server disconnected' });
      } else if (reason === 'transport close') {
        this._notifyError({ message: 'Connection to server lost' });
      } else {
        this._notifyError({ message: `Disconnected: ${reason}` });
      }
    });
    
    // Game state update event
    this._socket.on('game:state', (state: GameState) => {
      this._gameStateCallbacks.forEach((cb) => cb(state));
    });
    
    // Player joined event
    this._socket.on('player:joined', (data: PlayerJoinedEvent) => {
      this._playerJoinedCallbacks.forEach((cb) => cb(data));
    });
    
    // Player disconnected event
    this._socket.on('player:disconnected', (data: { playerId: string, playerName: string }) => {
      this._playerDisconnectedCallbacks.forEach((cb) => cb(data));
    });
    
    // Chat message event
    this._socket.on('chat:message', (data: ChatMessageEvent) => {
      this._chatMessageCallbacks.forEach((cb) => cb(data));
    });
    
    // Player list event
    this._socket.on('player:list', (data: PlayerListEvent[]) => {
      this._playerListCallbacks.forEach((cb) => cb(data));
    });
    
    // Error event
    this._socket.on('error', (data: ErrorEvent) => {
      this._notifyError(data);
    });
  }
  
  // Join a game
  public joinGame(playerName: string, playerId?: string): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Cannot join game: Not connected to server' });
      return;
    }
    
    console.log(`[Socket] Joining game as ${playerName}${playerId ? ` (${playerId})` : ''}`);
    
    // Save player info for reconnections
    try {
      localStorage.setItem('coven_player_name', playerName);
      if (playerId) {
        localStorage.setItem('coven_player_id', playerId);
      }
    } catch (err) {
      console.warn('[Socket] Could not save player info to localStorage:', err);
    }
    
    // Send join event
    this._socket.emit('player:join', { playerName, playerId });
  }
  
  // Send chat message
  public sendChatMessage(message: string): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Cannot send message: Not connected to server' });
      return;
    }
    
    this._socket.emit('chat:message', { message });
  }
  
  // Request current player list
  public requestPlayerList(): void {
    if (!this._socket || !this._connected) {
      this._notifyError({ message: 'Cannot request player list: Not connected to server' });
      return;
    }
    
    this._socket.emit('player:list');
  }
  
  // Reconnect to the server
  public async reconnect(): Promise<boolean> {
    this.disconnect();
    return this.init();
  }
  
  // Force reconnect using the connection fix utility
  public forceReconnect(): void {
    forceReconnect();
    this._socket = getSocketConnection();
    this._connected = this._socket?.connected || false;
    
    if (this._connected) {
      this._setupEventListeners();
      this._notifyConnectionStatus(true);
    } else {
      this._notifyConnectionStatus(false);
    }
  }
  
  // Disconnect from the server
  public disconnect(): void {
    if (this._socket) {
      try {
        this._socket.disconnect();
      } catch (err) {
        console.warn('[Socket] Error disconnecting socket:', err);
      }
      
      this._socket = null;
    }
    
    this._connected = false;
    this._connecting = false;
    this._notifyConnectionStatus(false);
  }
  
  // Is connected to the server
  public isConnected(): boolean {
    return this._connected && this._socket?.connected || false;
  }
  
  // Get the socket ID if connected
  public getSocketId(): string | null {
    return this._socket?.id || null;
  }
  
  // Get transport type
  public getTransportType(): string | null {
    return this._socket?.io?.engine?.transport?.name || null;
  }
  
  // Get the socket for direct use
  public get socket(): Socket | null {
    return this._socket;
  }
  
  // Register for game state updates
  public onGameState(callback: GameStateCallback): () => void {
    this._gameStateCallbacks.push(callback);
    return () => {
      this._gameStateCallbacks = this._gameStateCallbacks.filter((cb) => cb !== callback);
    };
  }
  
  // Register for player joined events
  public onPlayerJoined(callback: PlayerJoinedCallback): () => void {
    this._playerJoinedCallbacks.push(callback);
    return () => {
      this._playerJoinedCallbacks = this._playerJoinedCallbacks.filter((cb) => cb !== callback);
    };
  }
  
  // Register for player disconnected events
  public onPlayerDisconnected(callback: PlayerDisconnectedCallback): () => void {
    this._playerDisconnectedCallbacks.push(callback);
    return () => {
      this._playerDisconnectedCallbacks = this._playerDisconnectedCallbacks.filter((cb) => cb !== callback);
    };
  }
  
  // Register for chat message events
  public onChatMessage(callback: ChatMessageCallback): () => void {
    this._chatMessageCallbacks.push(callback);
    return () => {
      this._chatMessageCallbacks = this._chatMessageCallbacks.filter((cb) => cb !== callback);
    };
  }
  
  // Register for player list events
  public onPlayerList(callback: PlayerListCallback): () => void {
    this._playerListCallbacks.push(callback);
    return () => {
      this._playerListCallbacks = this._playerListCallbacks.filter((cb) => cb !== callback);
    };
  }
  
  // Register for error events
  public onError(callback: ErrorCallback): () => void {
    this._errorCallbacks.push(callback);
    return () => {
      this._errorCallbacks = this._errorCallbacks.filter((cb) => cb !== callback);
    };
  }
  
  // Register for connection status changes
  public onConnectionStatus(callback: ConnectionStatusCallback): () => void {
    this._connectionStatusCallbacks.push(callback);
    return () => {
      this._connectionStatusCallbacks = this._connectionStatusCallbacks.filter((cb) => cb !== callback);
    };
  }
  
  // Notify all error callbacks
  private _notifyError(error: ErrorEvent): void {
    this._errorCallbacks.forEach((cb) => cb(error));
  }
  
  // Notify all connection status callbacks
  private _notifyConnectionStatus(status: boolean): void {
    this._connectionStatusCallbacks.forEach((cb) => cb(status));
  }
}

// Create and export singleton
const socketService = new SocketService();
export default socketService;