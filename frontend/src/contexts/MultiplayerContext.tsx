import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
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

interface MultiplayerContextType {
  // Connection state
  isConnected: boolean;
  isJoined: boolean;
  
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
  
  // Error handling
  error: string | null;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  joinGame: (playerName: string, playerId?: string) => void;
  sendMessage: (message: string) => void;
  
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
  // Socket instance
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  
  // Player info
  const [currentPlayer, setCurrentPlayer] = useState<{ playerId: string; playerName: string } | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  
  // Connect to the WebSocket server
  const connect = () => {
    // Check if we're already connected
    if (socket) return;
    
    // Get the server URL (same as the API URL)
    const serverUrl = window.location.origin;
    
    // Create socket connection
    const newSocket = io(serverUrl);
    
    // Set up event handlers
    newSocket.on('connect', () => {
      console.log('Connected to multiplayer server');
      setIsConnected(true);
      setError(null);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from multiplayer server');
      setIsConnected(false);
      setIsJoined(false);
    });
    
    newSocket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
      setError(data.message);
    });
    
    newSocket.on('player:joined', (data: { success: boolean; playerId: string; playerName: string; message: string }) => {
      if (data.success) {
        setCurrentPlayer({
          playerId: data.playerId,
          playerName: data.playerName
        });
        setIsJoined(true);
        setError(null);
        
        // Store player ID in local storage for potential reconnection
        localStorage.setItem('coven_player_id', data.playerId);
        localStorage.setItem('coven_player_name', data.playerName);
      } else {
        setError(data.message || 'Failed to join game');
      }
    });
    
    newSocket.on('player:list', (data: Player[]) => {
      setPlayers(data);
    });
    
    newSocket.on('player:forced-disconnect', (data: { reason: string }) => {
      setError(data.reason);
      newSocket.disconnect();
    });
    
    newSocket.on('game:state', (data: GameState) => {
      setGameState(data);
    });
    
    newSocket.on('game:update', (data: GameState) => {
      setGameState(data);
    });
    
    newSocket.on('chat:message', (data: ChatMessage) => {
      setMessages(prev => [...prev, data]);
    });
    
    // Save the socket instance
    setSocket(newSocket);
    
    // Return cleanup function
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  };
  
  // Disconnect from the WebSocket server
  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setIsJoined(false);
    }
  };
  
  // Join a game
  const joinGame = (playerName: string, playerId?: string) => {
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return;
    }
    
    socket.emit('player:join', { playerName, playerId });
  };
  
  // Send a chat message
  const sendMessage = (message: string) => {
    if (!socket || !isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socket.emit('chat:message', { message });
  };
  
  // Game actions (proxied through WebSocket)
  const plantSeed = (slotId: number, seedItemId: string) => {
    if (!socket || !isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socket.emit('game:plant', { slotId, seedItemId });
  };
  
  const waterPlants = (puzzleBonus?: number) => {
    if (!socket || !isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socket.emit('game:water', { puzzleBonus });
  };
  
  const harvestPlant = (slotId: number) => {
    if (!socket || !isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socket.emit('game:harvest', { slotId });
  };
  
  const brewPotion = (ingredientInvItemIds: string[], puzzleBonus?: number) => {
    if (!socket || !isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socket.emit('game:brew', { ingredientInvItemIds, puzzleBonus });
  };
  
  const buyItem = (itemId: string) => {
    if (!socket || !isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socket.emit('game:buy', { itemId });
  };
  
  const sellItem = (itemId: string) => {
    if (!socket || !isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socket.emit('game:sell', { itemId });
  };
  
  const fulfillRequest = (requestId: string) => {
    if (!socket || !isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socket.emit('game:fulfill', { requestId });
  };
  
  const claimRitualReward = (ritualId: string) => {
    if (!socket || !isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socket.emit('game:claim-ritual', { ritualId });
  };
  
  const endTurn = () => {
    if (!socket || !isConnected || !isJoined) {
      setError('Not connected to server or not joined to game');
      return;
    }
    
    socket.emit('game:end-turn');
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
        if (socket && isConnected && !isJoined) {
          joinGame(savedPlayerName, savedPlayerId);
        }
      }, 1000);
      
      return () => clearTimeout(reconnectTimeout);
    }
    
    // If there are no saved credentials, still need to return a cleanup function
    return () => {}; // Empty cleanup function
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Context value
  const value: MultiplayerContextType = {
    isConnected,
    isJoined,
    currentPlayer,
    players,
    gameState,
    messages,
    error,
    connect,
    disconnect,
    joinGame,
    sendMessage,
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