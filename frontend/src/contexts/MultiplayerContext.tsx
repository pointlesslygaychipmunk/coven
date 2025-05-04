import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import socketService, { PlayerJoinedEvent, PlayerListEvent, ChatMessageEvent, ErrorEvent } from '../services/socketService';
import { GameState } from 'coven-shared';

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
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  
  // Initialize socket event listeners
  useEffect(() => {
    // Set up connection status listener
    const connectionStatusUnsubscribe = socketService.onConnectionStatus((status) => {
      console.log(`[MultiplayerContext] Connection status changed: ${status}`);
      setIsConnected(status);
      setConnecting(false);
      if (!status) {
        setIsJoined(false);
      }
    });

    // Set up game state listener
    const gameStateUnsubscribe = socketService.onGameState((state) => {
      console.log('[MultiplayerContext] Game state update received');
      setGameState(state);
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
      } else {
        setError(event.message || 'Failed to join game');
      }
    });

    // Set up player list listener
    const playerListUnsubscribe = socketService.onPlayerList((playerList: PlayerListEvent[]) => {
      console.log(`[MultiplayerContext] Player list updated: ${playerList.length} players`);
      setPlayers(playerList.map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        joinedAt: p.joinedAt
      })));
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
      setError(error.message);
    });

    // Set up player disconnected listener
    const playerDisconnectedUnsubscribe = socketService.onPlayerDisconnected((data) => {
      console.log(`[MultiplayerContext] Player disconnected: ${data.playerName}`);
    });

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
    };
  }, []);
  
  // Connect to the WebSocket server
  const connect = async (): Promise<boolean> => {
    if (isConnected) return true;
    if (connecting) return false;
    
    setConnecting(true);
    setError(null);
    
    try {
      console.log('[MultiplayerContext] Attempting to connect to server...');
      const success = await socketService.init();
      console.log(`[MultiplayerContext] Connection ${success ? 'successful' : 'failed'}`);
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
      console.error('[MultiplayerContext] Connection error:', errorMessage);
      setError(errorMessage);
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
  
  // Try to auto-connect on first render
  useEffect(() => {
    // Auto-connect to the server
    connect();
    
    // Try to reconnect if we have saved credentials
    const savedPlayerId = localStorage.getItem('coven_player_id');
    const savedPlayerName = localStorage.getItem('coven_player_name');
    
    if (savedPlayerId && savedPlayerName) {
      // We'll use a timeout to ensure the socket is connected first
      const reconnectTimeout = setTimeout(() => {
        if (isConnected && !isJoined) {
          joinGame(savedPlayerName, savedPlayerId);
        }
      }, 1000);
      
      return () => clearTimeout(reconnectTimeout);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);
  
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