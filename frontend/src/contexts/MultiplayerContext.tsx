/**
 * EMERGENCY MULTIPLAYER CONTEXT
 * 
 * Complete rewrite to be as simple and reliable as possible
 * For production use only
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import socketService, { PlayerJoinedEvent, PlayerListEvent, ChatMessageEvent, ErrorEvent } from '../services/socketService';
import { GameState } from 'coven-shared';

// Basic types
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

// Mail types (not implemented in backend yet)
interface MailAttachment {
  id: string;
  type: 'item' | 'recipe' | 'gold' | 'image';
  data: any;
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
  expiresAt?: number;
}

// Context interface
interface MultiplayerContextType {
  // Connection state
  isConnected: boolean;
  isJoined: boolean;
  connecting: boolean;
  
  // Player info
  currentPlayer: { playerId: string; playerName: string } | null;
  players: Player[];
  
  // Game state
  gameState: GameState | null;
  
  // Chat
  messages: ChatMessage[];
  
  // Mail (placeholder)
  mailbox: MailMessage[];
  unreadMailCount: number;
  
  // Error handling
  error: string | null;
  
  // Connection actions
  connect: () => Promise<boolean>;
  disconnect: () => void;
  joinGame: (playerName: string, playerId?: string) => void;
  
  // Diagnostics (simplified)
  runConnectionDiagnostics: () => Promise<any>;
  getLastDiagnosticsReport: () => any | null;
  
  // Chat action
  sendMessage: (message: string) => void;
  
  // Mail actions (placeholders)
  sendMail: (recipientId: string, subject: string, content: string, attachments?: MailAttachment[]) => void;
  readMail: (mailId: string) => void;
  deleteMail: (mailId: string) => void;
  
  // Game actions
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

// Create context
const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

// Provider component - SIMPLIFIED FOR RELIABILITY
export const MultiplayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // PRODUCTION ENVIRONMENT CHECK
  const isProduction = window.location.hostname === 'playcoven.com' || 
                      window.location.hostname === 'www.playcoven.com';
  console.log(`[MultiplayerContext] Running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} environment`);
  console.log(`[MultiplayerContext] Hostname: ${window.location.hostname}`);
  console.log(`[MultiplayerContext] Origin: ${window.location.origin}`);
  
  // Clear session storage but preserve player data
  try {
    sessionStorage.clear();
    console.log('[MultiplayerContext] Session storage cleared for clean connection');
  } catch (err) {
    // Ignore storage errors
  }
  
  // Basic state
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<{ playerId: string; playerName: string } | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Mail (not used but required by interface)
  const [mailbox] = useState<MailMessage[]>([]);
  const [unreadMailCount] = useState<number>(0);
  const [diagnosticsReport, setDiagnosticsReport] = useState<any>(null);
  
  // Add system message helper
  const addSystemMessage = (message: string, isError = false) => {
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
  };
  
  // ULTRA-SIMPLIFIED CONNECT FUNCTION
  const connect = async (): Promise<boolean> => {
    if (isConnected) return true;
    
    setConnecting(true);
    setError("Connecting to server...");
    
    try {
      console.log('[MultiplayerContext:EMERGENCY] Attempting server connection...');
      const success = await socketService.init();
      
      setConnecting(false);
      
      if (success) {
        console.log('[MultiplayerContext:EMERGENCY] Connection success!');
        setError(null);
        return true;
      } else {
        console.error('[MultiplayerContext:EMERGENCY] Connection failed');
        setError("Unable to connect to server. Please refresh the page.");
        return false;
      }
    } catch (err) {
      console.error('[MultiplayerContext:EMERGENCY] Connection error:', err);
      setConnecting(false);
      setError("Connection error. Please refresh the page.");
      return false;
    }
  };
  
  // Disconnect function
  const disconnect = () => {
    socketService.disconnect();
    setIsConnected(false);
    setIsJoined(false);
    setCurrentPlayer(null);
  };
  
  // Set up all event listeners - ONCE
  useEffect(() => {
    console.log('[MultiplayerContext:EMERGENCY] Setting up event listeners');
    
    // Set up connection status listener
    const connectionStatusUnsubscribe = socketService.onConnectionStatus((status) => {
      console.log(`[MultiplayerContext:EMERGENCY] Connection status: ${status}`);
      setIsConnected(status);
      setConnecting(false);
      
      if (status) {
        addSystemMessage('Connected to server');
        setError(null);
      } else {
        addSystemMessage('Connection lost. The game will try to reconnect.', true);
        setIsJoined(false);
      }
    });
    
    // Set up game state listener
    const gameStateUnsubscribe = socketService.onGameState((state) => {
      if (state) {
        setGameState(state);
      }
    });
    
    // Set up player joined listener
    const playerJoinedUnsubscribe = socketService.onPlayerJoined((event) => {
      if (event.success) {
        setCurrentPlayer({
          playerId: event.playerId,
          playerName: event.playerName
        });
        setIsJoined(true);
        setError(null);
        
        // Store player info for reconnection
        localStorage.setItem('coven_player_id', event.playerId);
        localStorage.setItem('coven_player_name', event.playerName);
        
        addSystemMessage(`Joined as ${event.playerName}`);
      } else {
        setError(event.message || 'Failed to join');
        addSystemMessage(`Failed to join: ${event.message}`, true);
      }
    });
    
    // Set up player list listener
    const playerListUnsubscribe = socketService.onPlayerList((playerList) => {
      if (Array.isArray(playerList)) {
        setPlayers(playerList.map(p => ({
          playerId: p.playerId,
          playerName: p.playerName,
          joinedAt: p.joinedAt
        })));
      }
    });
    
    // Set up chat message listener
    const chatMessageUnsubscribe = socketService.onChatMessage((message) => {
      setMessages(prev => [...prev, {
        senderId: message.senderId,
        senderName: message.senderName,
        message: message.message,
        timestamp: message.timestamp
      }]);
    });
    
    // Set up error listener
    const errorUnsubscribe = socketService.onError((error) => {
      if (error.message && error.message !== 'Connected successfully') {
        setError(error.message);
        addSystemMessage(`Error: ${error.message}`, true);
      }
    });
    
    // Set up player disconnected listener
    const playerDisconnectedUnsubscribe = socketService.onPlayerDisconnected((data) => {
      addSystemMessage(`Player ${data.playerName} disconnected`);
    });
    
    // Basic reconnection function
    const attemptReconnection = () => {
      // Try to reconnect if we have saved credentials
      const savedPlayerId = localStorage.getItem('coven_player_id');
      const savedPlayerName = localStorage.getItem('coven_player_name');
      
      if (savedPlayerId && savedPlayerName && isConnected) {
        console.log('[MultiplayerContext:EMERGENCY] Attempting to rejoin as saved player');
        socketService.joinGame(savedPlayerName, savedPlayerId);
      }
    };
    
    // Try to connect automatically on first render
    connect().then(success => {
      if (success) {
        attemptReconnection();
      }
    });
    
    // Online event listener for reconnection 
    const handleOnline = () => {
      console.log('[MultiplayerContext:EMERGENCY] Network came online');
      
      // Wait for network to stabilize
      setTimeout(() => {
        connect().then(success => {
          if (success && !isJoined) {
            attemptReconnection();
          }
        });
      }, 2000);
    };
    
    // Add online listener
    window.addEventListener('online', handleOnline);
    
    // Clean up all listeners
    return () => {
      connectionStatusUnsubscribe();
      gameStateUnsubscribe();
      playerJoinedUnsubscribe();
      playerListUnsubscribe();
      chatMessageUnsubscribe();
      errorUnsubscribe();
      playerDisconnectedUnsubscribe();
      window.removeEventListener('online', handleOnline);
    };
  }, []); // Empty dependency array - we only set this up ONCE
  
  // Join game function
  const joinGame = (playerName: string, playerId?: string) => {
    if (!isConnected) {
      connect().then((success) => {
        if (success) {
          socketService.joinGame(playerName, playerId);
        } else {
          setError('Not connected to server');
        }
      });
    } else {
      socketService.joinGame(playerName, playerId);
    }
  };
  
  // SIMPLIFIED DIAGNOSTICS
  const runConnectionDiagnostics = async (): Promise<any> => {
    const report = {
      timestamp: Date.now(),
      isConnected,
      isJoined,
      online: navigator.onLine,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      userAgent: navigator.userAgent
    };
    
    setDiagnosticsReport(report);
    return report;
  };
  
  const getLastDiagnosticsReport = () => diagnosticsReport;
  
  // Game Action Methods - Basic Wrappers
  
  // Chat message
  const sendMessage = (message: string) => {
    if (!isConnected || !isJoined) {
      setError('Not connected to server');
      return;
    }
    socketService.sendChatMessage(message);
  };
  
  // Mail placeholders
  const sendMail = () => setError('Mail not implemented');
  const readMail = () => setError('Mail not implemented');
  const deleteMail = () => setError('Mail not implemented');
  
  // Game actions
  const plantSeed = (slotId: number, seedItemId: string) => {
    if (!isConnected || !isJoined) return;
    socketService.plantSeed(slotId, seedItemId);
  };
  
  const waterPlants = (puzzleBonus?: number) => {
    if (!isConnected || !isJoined) return;
    socketService.waterPlants(puzzleBonus);
  };
  
  const harvestPlant = (slotId: number) => {
    if (!isConnected || !isJoined) return;
    socketService.harvestPlant(slotId);
  };
  
  const brewPotion = (ingredientInvItemIds: string[], puzzleBonus?: number) => {
    if (!isConnected || !isJoined) return;
    socketService.brewPotion(ingredientInvItemIds, puzzleBonus);
  };
  
  const buyItem = (itemId: string) => {
    if (!isConnected || !isJoined) return;
    socketService.buyItem(itemId);
  };
  
  const sellItem = (itemId: string) => {
    if (!isConnected || !isJoined) return;
    socketService.sellItem(itemId);
  };
  
  const fulfillRequest = (requestId: string) => {
    if (!isConnected || !isJoined) return;
    socketService.fulfillRequest(requestId);
  };
  
  const claimRitualReward = (ritualId: string) => {
    if (!isConnected || !isJoined) return;
    socketService.claimRitualReward(ritualId);
  };
  
  const endTurn = () => {
    if (!isConnected || !isJoined) return;
    socketService.endTurn();
  };
  
  // Create context value
  const value: MultiplayerContextType = {
    isConnected,
    isJoined,
    connecting,
    currentPlayer,
    players,
    gameState,
    messages,
    error,
    mailbox,
    unreadMailCount,
    connect,
    disconnect,
    joinGame,
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
  
  // Return the provider
  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
};

// Hook for accessing context
export const useMultiplayer = (): MultiplayerContextType => {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};