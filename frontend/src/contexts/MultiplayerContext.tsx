import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import socketService, { PlayerJoinedEvent, PlayerListEvent, ChatMessageEvent, ErrorEvent } from '../services/socketService';
import { GameState } from 'coven-shared';
import connectionDiagnostics, { ConnectionDiagnosticsReport } from '../utils/connectionDiagnostics';

// Types for our MultiplayerContext
interface Player {
  playerId: string;
  playerName: string;
  joinedAt: number;
}

interface ChatMessage {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
}

interface MailAttachment {
  id: string;
  type: 'item' | 'recipe' | 'gold' | 'image';
  data: any; // Could be an item, gold amount, image URL, etc.
}

interface MailMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  subject: string;
  content: string;
  attachments?: MailAttachment[];
  isRead: boolean;
  timestamp: number;
  expiresAt?: number; // Optional expiration timestamp
}

interface MultiplayerContextType {
  // Connection state
  isConnected: boolean;
  isJoined: boolean;
  connecting: boolean;
  
  // Player info
  currentPlayer: {
    playerId: string;
    playerName: string;
  } | null;
  players: Player[];
  
  // Game state
  gameState: GameState | null;
  
  // Chat
  messages: ChatMessage[];
  
  // Mail
  mailbox: MailMessage[];
  unreadMailCount: number;
  
  // Error handling
  error: string | null;
  
  // Connection Actions
  connect: () => Promise<boolean>;
  disconnect: () => void;
  joinGame: (playerName: string, playerId?: string) => void;
  
  // Diagnostics - Added for connection troubleshooting
  runConnectionDiagnostics: () => Promise<ConnectionDiagnosticsReport>;
  getLastDiagnosticsReport: () => ConnectionDiagnosticsReport | null;
  
  // Chat Actions
  sendMessage: (message: string) => void;
  
  // Mail Actions
  sendMail: (recipientId: string, subject: string, content: string, attachments?: MailAttachment[]) => void;
  readMail: (mailId: string) => void;
  deleteMail: (mailId: string) => void;
  
  // Game actions (proxied through WebSocket)
  plantSeed: (slotId: number, seedItemId: string) => void;
  waterPlants: (puzzleBonus?: number) => void;
  harvestPlant: (slotId: number) => void;
  brewPotion: (ingredientInvItemIds: string[], puzzleBonus?: number) => void;
  buyItem: (itemId: string) => void;
  sellItem: (itemId: string) => void;
  fulfillRequest: (requestId: string) => void;
  claimRitualReward: (ritualId: string) => void;
  endTurn: () => void;
}

// Create the context with a default value
const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

// Provider component
export const MultiplayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  
  // Player info
  const [currentPlayer, setCurrentPlayer] = useState<{ playerId: string; playerName: string } | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Mail
  const [mailbox, setMailbox] = useState<MailMessage[]>([]);
  const [unreadMailCount, setUnreadMailCount] = useState<number>(0);
  
  // Diagnostics
  const [lastDiagnosticsReport, setLastDiagnosticsReport] = useState<ConnectionDiagnosticsReport | null>(null);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  
  // Create a function to add a connection status message
  const addStatusMessage = useCallback((message: string, isError: boolean = false) => {
    // Add a system message to the chat
    const systemMessage: ChatMessage = {
      senderId: 'system',
      senderName: 'System',
      message: message,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, systemMessage]);
    
    if (isError) {
      setError(message);
    }
  }, []);
  
  // Initialize socket event listeners
  useEffect(() => {
    // Set up connection status listener
    const connectionStatusUnsubscribe = socketService.onConnectionStatus((status) => {
      console.log(`[MultiplayerContext] Connection status changed: ${status}`);
      
      const wasConnected = isConnected;
      setIsConnected(status);
      setConnecting(false);
      
      // Handle connection state change
      if (status && !wasConnected) {
        // Connection established
        addStatusMessage('Connected to server');
        setError(null);
      } else if (!status && wasConnected) {
        // Connection lost
        addStatusMessage('Connection to server lost. The game will automatically try to reconnect...', true);
        setIsJoined(false);
      } else if (!status && !wasConnected && connecting) {
        // Initial connection failed
        addStatusMessage('Unable to connect to the game server. Please check your internet connection.', true);
      }
    });

    // Set up game state listener
    const gameStateUnsubscribe = socketService.onGameState((state) => {
      console.log('[MultiplayerContext] Game state update received');
      if (state) {
        setGameState(state);
      } else {
        console.warn('[MultiplayerContext] Received empty game state');
      }
    });

    // Set up player joined listener
    const playerJoinedUnsubscribe = socketService.onPlayerJoined((event: PlayerJoinedEvent) => {
      console.log(`[MultiplayerContext] Player joined: ${event.playerName}`);
      
      if (event.success) {
        setCurrentPlayer({
          playerId: event.playerId,
          playerName: event.playerName
        });
        setIsJoined(true);
        setError(null);
        
        // Store player ID in local storage for potential reconnection
        localStorage.setItem('coven_player_id', event.playerId);
        localStorage.setItem('coven_player_name', event.playerName);
        
        // Add a system message
        addStatusMessage(`Successfully joined as ${event.playerName}`);
      } else {
        setError(event.message || 'Failed to join game');
        addStatusMessage(`Failed to join game: ${event.message}`, true);
      }
    });

    // Set up player list listener
    const playerListUnsubscribe = socketService.onPlayerList((playerList: PlayerListEvent[]) => {
      console.log(`[MultiplayerContext] Player list updated: ${playerList.length} players`);
      if (Array.isArray(playerList)) {
        setPlayers(playerList.map(p => ({
          playerId: p.playerId,
          playerName: p.playerName,
          joinedAt: p.joinedAt
        })));
      } else {
        console.warn('[MultiplayerContext] Received invalid player list');
        setPlayers([]);
      }
    });

    // Set up chat message listener
    const chatMessageUnsubscribe = socketService.onChatMessage((message: ChatMessageEvent) => {
      console.log(`[MultiplayerContext] Chat message received from ${message.senderName}`);
      setMessages(prev => [...prev, {
        senderId: message.senderId,
        senderName: message.senderName,
        message: message.message,
        timestamp: message.timestamp
      }]);
    });

    // Set up error listener
    const errorUnsubscribe = socketService.onError((error: ErrorEvent) => {
      console.error(`[MultiplayerContext] Error: ${error.message}`);
      if (error.message) {
        setError(error.message);
        
        // Only add a system message if it's a meaningful error
        // (not connection update messages which can be frequent during reconnection)
        if (error.message !== 'Connected to server successfully!') {
          addStatusMessage(`Error: ${error.message}`, true);
        }
      }
    });

    // Set up player disconnected listener
    const playerDisconnectedUnsubscribe = socketService.onPlayerDisconnected((data) => {
      console.log(`[MultiplayerContext] Player disconnected: ${data.playerName}`);
      addStatusMessage(`Player ${data.playerName} disconnected`);
    });

    // Set up player reconnected listener
    const playerReconnectedCallback = (data: { playerId: string, playerName: string }) => {
      console.log(`[MultiplayerContext] Player reconnected: ${data.playerName}`);
      addStatusMessage(`Player ${data.playerName} reconnected`);
    };
    
    // Use the dedicated handler for player reconnection events
    const playerReconnectedUnsubscribe = socketService.onPlayerReconnected(playerReconnectedCallback);

    // Mail events - Placeholder for future implementation
    // Currently the backend doesn't support mail features,
    // but we'll keep the interface consistent for future addition

    // Cleanup function to remove event listeners
    return () => {
      connectionStatusUnsubscribe();
      gameStateUnsubscribe();
      playerJoinedUnsubscribe();
      playerListUnsubscribe();
      chatMessageUnsubscribe();
      errorUnsubscribe();
      playerDisconnectedUnsubscribe();
      playerReconnectedUnsubscribe();
    };
  }, [isConnected, addStatusMessage]);
  
  // Run connection diagnostics
  const runConnectionDiagnostics = async (): Promise<ConnectionDiagnosticsReport> => {
    console.log('[MultiplayerContext] Running connection diagnostics...');
    
    try {
      // We'll log an event anytime we do diagnostics
      connectionDiagnostics.logConnectionEvent('diagnostics_requested_from_context', {
        isConnected,
        isJoined,
        connecting,
        hasError: error !== null
      });
      
      // Run the diagnostics
      const report = await connectionDiagnostics.generateConnectionReport();
      
      // Store the report for future reference
      setLastDiagnosticsReport(report);
      
      // Log a summary to the console
      console.log('[MultiplayerContext] Diagnostics completed:', 
        connectionDiagnostics.getConnectionIssuesSummary(report));
      
      // Add a status message with the result
      const summary = connectionDiagnostics.getConnectionIssuesSummary(report);
      if (summary !== "No connection issues detected.") {
        addStatusMessage(`Diagnostics: ${summary}`, true);
      }
      
      return report;
    } catch (err) {
      console.error('[MultiplayerContext] Error running diagnostics:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Add error to diagnostics log
      connectionDiagnostics.logConnectionEvent('diagnostics_error', { error: errorMessage });
      
      // Create a basic report with the error
      const errorReport: ConnectionDiagnosticsReport = {
        timestamp: Date.now(),
        navigatorOnline: navigator.onLine,
        secureContext: window.isSecureContext,
        webSocketSupport: 'WebSocket' in window,
        userAgent: navigator.userAgent,
        connectionInfo: {
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80'),
          pathname: window.location.pathname
        },
        networkInfo: {},
        tests: {
          httpRequest: {
            success: false,
            error: `Diagnostics error: ${errorMessage}`
          }
        },
        connectionHistory: []
      };
      
      // Store the error report
      setLastDiagnosticsReport(errorReport);
      
      return errorReport;
    }
  };
  
  // Get the most recent diagnostics report
  const getLastDiagnosticsReport = (): ConnectionDiagnosticsReport | null => {
    return lastDiagnosticsReport;
  };
  
  // Connect to the WebSocket server with enhanced diagnostics
  const connect = async (): Promise<boolean> => {
    if (isConnected) return true;
    if (connecting) return false;
    
    setConnecting(true);
    setError("Connecting to server...");
    
    // Log connection attempt in the diagnostics system
    connectionDiagnostics.logConnectionEvent('connection_attempt', {
      timestamp: Date.now(),
      currentOrigin: window.location.origin
    });
    
    try {
      console.log('[MultiplayerContext] Attempting to connect to server...');
      const success = await socketService.init();
      console.log(`[MultiplayerContext] Connection ${success ? 'successful' : 'failed'}`);
      
      // Log the result
      connectionDiagnostics.logConnectionEvent(
        success ? 'connection_success' : 'connection_failure',
        { timestamp: Date.now() }
      );
      
      if (success) {
        setError(null);
      } else {
        setError("Not connected to server. Please try refreshing the page or check your internet connection.");
        
        // If connection failed, automatically run diagnostics to help troubleshoot
        runConnectionDiagnostics().catch(() => {
          // Catch errors from diagnostics to prevent them from affecting the connection flow
          console.error('[MultiplayerContext] Failed to run automatic diagnostics');
        });
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
      console.error('[MultiplayerContext] Connection error:', errorMessage);
      
      // Log error details
      connectionDiagnostics.logConnectionEvent('connection_error', {
        error: errorMessage,
        timestamp: Date.now()
      });
      
      setError(`Connection error: ${errorMessage}. Please check your internet connection and try again.`);
      setConnecting(false);
      return false;
    }
  };
  
  // Disconnect from the WebSocket server
  const disconnect = () => {
    socketService.disconnect();
    setIsConnected(false);
    setIsJoined(false);
    setCurrentPlayer(null);
  };
  
  // Join a game
  const joinGame = (playerName: string, playerId?: string) => {
    if (!isConnected) {
      connect().then((success) => {
        if (success) {
          socketService.joinGame(playerName, playerId);
        } else {
          setError('Failed to connect to server');
        }
      });
    } else {
      socketService.joinGame(playerName, playerId);
    }
  };
  
  // Send a chat message
  const sendMessage = (message: string) => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socketService.sendChatMessage(message);
  };
  
  // Send a mail message - Placeholder for future implementation
  const sendMail = (recipientId: string, subject: string, content: string, attachments?: MailAttachment[]) => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    setError('Mail system not yet implemented in the backend');
    // For future implementation:
    // socket.emit('mail:send', { recipientId, subject, content, attachments });
  };
  
  // Mark a mail as read - Placeholder for future implementation
  const readMail = (mailId: string) => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    // Update locally for immediate UI feedback
    setMailbox(prev => {
      const updatedMailbox = prev.map(mail => 
        mail.id === mailId ? { ...mail, isRead: true } : mail
      );
      return updatedMailbox;
    });
    
    // Update unread count
    setUnreadMailCount(prev => Math.max(0, prev - 1));
    
    setError('Mail system not yet implemented in the backend');
    // For future implementation:
    // socket.emit('mail:read', { mailId });
  };
  
  // Delete a mail - Placeholder for future implementation
  const deleteMail = (mailId: string) => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    // Check if mail is unread first
    const mailToDelete = mailbox.find(mail => mail.id === mailId);
    if (mailToDelete && !mailToDelete.isRead) {
      setUnreadMailCount(prev => Math.max(0, prev - 1));
    }
    
    // Update locally for immediate UI feedback
    setMailbox(prev => prev.filter(mail => mail.id !== mailId));
    
    setError('Mail system not yet implemented in the backend');
    // For future implementation:
    // socket.emit('mail:delete', { mailId });
  };
  
  // Game actions (proxied through WebSocket)
  const plantSeed = (slotId: number, seedItemId: string) => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socketService.plantSeed(slotId, seedItemId);
  };
  
  const waterPlants = (puzzleBonus?: number) => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socketService.waterPlants(puzzleBonus);
  };
  
  const harvestPlant = (slotId: number) => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socketService.harvestPlant(slotId);
  };
  
  const brewPotion = (ingredientInvItemIds: string[], puzzleBonus?: number) => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socketService.brewPotion(ingredientInvItemIds, puzzleBonus);
  };
  
  const buyItem = (itemId: string) => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socketService.buyItem(itemId);
  };
  
  const sellItem = (itemId: string) => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socketService.sellItem(itemId);
  };
  
  const fulfillRequest = (requestId: string) => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socketService.fulfillRequest(requestId);
  };
  
  const claimRitualReward = (ritualId: string) => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socketService.claimRitualReward(ritualId);
  };
  
  const endTurn = () => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socketService.endTurn();
  };
  
  // Handle automatic reconnection
  const attemptReconnection = useCallback(() => {
    // Try to reconnect if we have saved credentials
    const savedPlayerId = localStorage.getItem('coven_player_id');
    const savedPlayerName = localStorage.getItem('coven_player_name');
    
    if (savedPlayerId && savedPlayerName) {
      console.log(`[MultiplayerContext] Attempting to reconnect player: ${savedPlayerName} (${savedPlayerId})`);
      joinGame(savedPlayerName, savedPlayerId);
      return true;
    }
    
    return false;
  }, [joinGame]);
  
  // Try to auto-connect on first render and set up auto-reconnect
  useEffect(() => {
    // Auto-connect to the server
    connect().then((connected) => {
      if (connected) {
        // Try to reconnect immediately if we're connected
        attemptReconnection();
      }
    });
    
    // Set up a reconnection handler for when connection status changes
    const handleConnectionChange = (status: boolean) => {
      if (status && !isJoined) {
        // If we get connected but aren't joined yet, try to reconnect
        console.log('[MultiplayerContext] Connection established, attempting reconnection...');
        const reconnectTimeout = setTimeout(() => {
          attemptReconnection();
        }, 500);
        return () => clearTimeout(reconnectTimeout);
      }
    };
    
    // Register the connection status listener
    const unsubscribe = socketService.onConnectionStatus(handleConnectionChange);
    
    // Clean up when component unmounts
    return () => {
      unsubscribe();
    };
  }, [connect, isJoined, attemptReconnection]);
  
  // ULTRA-SIMPLIFIED reconnection system with absolute minimal complexity
  useEffect(() => {
    // EMERGENCY: Clear ALL connection counters on every render
    // This ensures we never get stuck in a "too many attempts" scenario
    
    // Define all key names in one place
    const ALL_COUNTER_KEYS = [
      'coven_reconnect_attempt_counter',
      'coven_reconnect_start_time',
      'coven_reconnect_start_time_v2'
    ];
    
    // Clear ALL counters unconditionally to avoid potential infinite loops
    ALL_COUNTER_KEYS.forEach(key => {
      try {
        sessionStorage.removeItem(key);
      } catch (err) {
        console.error(`[MultiplayerContext] Error clearing ${key}:`, err);
      }
    });
    
    console.log('[MultiplayerContext] EMERGENCY: Cleared all reconnection counters');
    
    // Handle online/offline detection - this is the most reliable approach
    let onlineHandler: (() => void) | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    
    // Register for online events only - this is the most important case
    onlineHandler = () => {
      console.log('[MultiplayerContext] Network came online, attempting reconnection');
      
      // Wait for network to stabilize
      setTimeout(() => {
        // Only attempt if we're not already connected
        if (!isConnected) {
          connect().then(success => {
            if (success) {
              // Reset counters
              ALL_COUNTER_KEYS.forEach(key => sessionStorage.removeItem(key));
              // Attempt to rejoin if needed
              attemptReconnection();
            }
          }).catch(err => {
            console.error('[MultiplayerContext] Reconnection error:', err);
          });
        }
      }, 2000);
    };
    
    // Add online listener
    window.addEventListener('online', onlineHandler);
    
    // Set up a single reconnection attempt if we're not connected
    // This is extremely simple - just ONE attempt with a fixed delay
    if (!isConnected && navigator.onLine) {
      // Use a simple fixed delay - no complexity
      const FIXED_RECONNECT_DELAY = 20000; // 20 seconds
      
      console.log(`[MultiplayerContext] Will attempt reconnection in ${FIXED_RECONNECT_DELAY/1000} seconds`);
      
      reconnectTimer = setTimeout(() => {
        console.log('[MultiplayerContext] Attempting single reconnection...');
        
        // Make sure we're still not connected and online before trying
        if (!isConnected && navigator.onLine) {
          connect().then(success => {
            if (success) {
              // Reset counters
              ALL_COUNTER_KEYS.forEach(key => sessionStorage.removeItem(key));
              // Attempt to rejoin
              attemptReconnection();
            }
          }).catch(err => {
            console.error('[MultiplayerContext] Reconnection error:', err);
          });
        }
      }, FIXED_RECONNECT_DELAY);
    }
    
    // Clear everything on unmount or when dependencies change
    return () => {
      if (onlineHandler) {
        window.removeEventListener('online', onlineHandler);
      }
      
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [isConnected, connect, attemptReconnection]);
  
  // Context value
  const value: MultiplayerContextType = {
    isConnected,
    isJoined,
    connecting,
    currentPlayer,
    players,
    gameState,
    messages,
    mailbox,
    unreadMailCount,
    error,
    connect,
    disconnect,
    joinGame,
    // Include new diagnostics functions
    runConnectionDiagnostics,
    getLastDiagnosticsReport,
    sendMessage,
    sendMail,
    readMail,
    deleteMail,
    plantSeed,
    waterPlants,
    harvestPlant,
    brewPotion,
    buyItem,
    sellItem,
    fulfillRequest,
    claimRitualReward,
    endTurn
  };
  
  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
};

// Hook for using the multiplayer context
export const useMultiplayer = (): MultiplayerContextType => {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};