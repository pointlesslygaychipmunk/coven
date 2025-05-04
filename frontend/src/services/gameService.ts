/**
 * Game Service
 * 
 * This service provides functions for managing the game state,
 * including creating and joining games, managing players,
 * and communicating between components.
 * 
 * Since we don't have a real backend, this service uses localStorage
 * to persist game data and simulate a multi-user environment.
 */

import { v4 as uuidv4 } from 'uuid';

// Types
export interface Game {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'in-progress' | 'finished';
  createdAt: number; // timestamp
  startedAt?: number; // timestamp when game started
  settings: GameSettings;
  messages: ChatMessage[];
}

export interface Player {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'away';
  isHost: boolean;
  isReady: boolean;
  joinedAt: number; // timestamp
}

export interface GameSettings {
  difficulty: 'easy' | 'normal' | 'hard';
  seasonStartingPoint: 'spring' | 'summer' | 'autumn' | 'winter';
  tradingEnabled: boolean;
  pvpEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number; // timestamp
  type: 'chat' | 'system' | 'private';
  recipientId?: string;
}

// LocalStorage keys
const STORAGE_KEYS = {
  GAMES: 'newcoven_games',
  PLAYERS: 'newcoven_players',
  CURRENT_USER: 'covenUsername',
  CURRENT_PLAYER_ID: 'newcoven_player_id',
  CURRENT_GAME: 'newcoven_current_game',
};

// Default game settings
const DEFAULT_GAME_SETTINGS: GameSettings = {
  difficulty: 'normal',
  seasonStartingPoint: 'spring',
  tradingEnabled: true,
  pvpEnabled: false,
};

/**
 * Checks if the current user has a player ID
 */
export const hasPlayerIdentity = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEYS.CURRENT_USER) && 
         !!localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYER_ID);
};

/**
 * Creates a player identity for the current user
 */
export const createPlayerIdentity = (username: string): { playerId: string, username: string } => {
  const playerId = uuidv4();
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
  localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYER_ID, playerId);
  
  // Also update the player list to include this player
  const players = getPlayerList();
  players.push({
    id: playerId,
    name: username,
    status: 'connected',
    isHost: false,
    isReady: false,
    joinedAt: Date.now(),
  });
  savePlayerList(players);
  
  return { playerId, username };
};

/**
 * Gets the current user's player ID and username
 */
export const getCurrentPlayer = (): { playerId: string | null, username: string | null } => {
  const username = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  const playerId = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYER_ID);
  return { playerId, username };
};

/**
 * Gets all games from storage
 */
export const getGameList = (): Game[] => {
  const gamesJson = localStorage.getItem(STORAGE_KEYS.GAMES);
  if (!gamesJson) return [];
  return JSON.parse(gamesJson);
};

/**
 * Saves the games list to storage
 */
export const saveGameList = (games: Game[]): void => {
  localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
};

/**
 * Gets all players from storage
 */
export const getPlayerList = (): Player[] => {
  const playersJson = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  if (!playersJson) return [];
  return JSON.parse(playersJson);
};

/**
 * Saves the player list to storage
 */
export const savePlayerList = (players: Player[]): void => {
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
};

/**
 * Gets a specific game by ID
 */
export const getGameById = (gameId: string): Game | null => {
  const games = getGameList();
  return games.find(game => game.id === gameId) || null;
};

/**
 * Creates a new game
 */
export const createGame = (
  gameName: string,
  maxPlayers: number,
  settings?: Partial<GameSettings>
): Game | null => {
  const { playerId, username } = getCurrentPlayer();
  if (!playerId || !username) return null;
  
  const gameId = uuidv4();
  const gameSettings = { ...DEFAULT_GAME_SETTINGS, ...settings };
  
  const newGame: Game = {
    id: gameId,
    name: gameName,
    hostId: playerId,
    hostName: username,
    players: [
      {
        id: playerId,
        name: username,
        status: 'connected',
        isHost: true,
        isReady: true, // Host is always ready
        joinedAt: Date.now(),
      }
    ],
    maxPlayers,
    status: 'waiting',
    createdAt: Date.now(),
    settings: gameSettings,
    messages: [
      {
        id: uuidv4(),
        senderId: 'system',
        senderName: 'System',
        content: `Game "${gameName}" created. Waiting for players to join...`,
        timestamp: Date.now(),
        type: 'system',
      }
    ],
  };
  
  // Add to the games list
  const games = getGameList();
  games.push(newGame);
  saveGameList(games);
  
  // Set this as the current game for this player
  localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, gameId);
  
  return newGame;
};

/**
 * Joins a game
 */
export const joinGame = (gameId: string): Game | null => {
  const { playerId, username } = getCurrentPlayer();
  if (!playerId || !username) return null;
  
  const games = getGameList();
  const gameIndex = games.findIndex(game => game.id === gameId);
  if (gameIndex === -1) return null;
  
  const game = games[gameIndex];
  
  // Check if this player is already in the game
  const existingPlayerIndex = game.players.findIndex(p => p.id === playerId);
  if (existingPlayerIndex !== -1) {
    // Update player status
    game.players[existingPlayerIndex].status = 'connected';
    games[gameIndex] = game;
    saveGameList(games);
    
    // Set this as the current game for this player
    localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, gameId);
    
    return game;
  }
  
  // Check if the game is full
  if (game.players.length >= game.maxPlayers) {
    return null;
  }
  
  // Add player to the game
  const newPlayer: Player = {
    id: playerId,
    name: username,
    status: 'connected',
    isHost: false,
    isReady: false,
    joinedAt: Date.now(),
  };
  
  game.players.push(newPlayer);
  
  // Add system message
  game.messages.push({
    id: uuidv4(),
    senderId: 'system',
    senderName: 'System',
    content: `${username} joined the game.`,
    timestamp: Date.now(),
    type: 'system',
  });
  
  games[gameIndex] = game;
  saveGameList(games);
  
  // Set this as the current game for this player
  localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, gameId);
  
  return game;
};

/**
 * Leaves a game
 */
export const leaveGame = (gameId: string): boolean => {
  const { playerId, username } = getCurrentPlayer();
  if (!playerId || !username) return false;
  
  const games = getGameList();
  const gameIndex = games.findIndex(game => game.id === gameId);
  if (gameIndex === -1) return false;
  
  const game = games[gameIndex];
  
  // Find this player
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return false;
  
  const player = game.players[playerIndex];
  
  // If this is the host, the game is disbanded
  if (player.isHost) {
    // Add system message to all players in the game
    game.players.forEach(p => {
      if (p.id !== playerId) {
        // Notify player that the game was disbanded
        // In a real system, this would be handled by a notification system
      }
    });
    
    // Remove the game
    games.splice(gameIndex, 1);
    saveGameList(games);
  } else {
    // Remove the player from the game
    game.players.splice(playerIndex, 1);
    
    // Add system message
    game.messages.push({
      id: uuidv4(),
      senderId: 'system',
      senderName: 'System',
      content: `${username} left the game.`,
      timestamp: Date.now(),
      type: 'system',
    });
    
    games[gameIndex] = game;
    saveGameList(games);
  }
  
  // Clear current game
  localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
  
  return true;
};

/**
 * Updates a player's ready status
 */
export const setPlayerReady = (gameId: string, isReady: boolean): Game | null => {
  const { playerId } = getCurrentPlayer();
  if (!playerId) return null;
  
  const games = getGameList();
  const gameIndex = games.findIndex(game => game.id === gameId);
  if (gameIndex === -1) return null;
  
  const game = games[gameIndex];
  
  // Find this player
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return null;
  
  // Update ready status
  game.players[playerIndex].isReady = isReady;
  
  // Add system message
  game.messages.push({
    id: uuidv4(),
    senderId: 'system',
    senderName: 'System',
    content: `${game.players[playerIndex].name} is ${isReady ? 'ready' : 'not ready'}.`,
    timestamp: Date.now(),
    type: 'system',
  });
  
  games[gameIndex] = game;
  saveGameList(games);
  
  return game;
};

/**
 * Updates game settings
 */
export const updateGameSettings = (
  gameId: string,
  settings: Partial<GameSettings>
): Game | null => {
  const { playerId } = getCurrentPlayer();
  if (!playerId) return null;
  
  const games = getGameList();
  const gameIndex = games.findIndex(game => game.id === gameId);
  if (gameIndex === -1) return null;
  
  const game = games[gameIndex];
  
  // Only the host can update settings
  if (game.hostId !== playerId) return null;
  
  // Update settings
  game.settings = { ...game.settings, ...settings };
  
  // Add system message
  game.messages.push({
    id: uuidv4(),
    senderId: 'system',
    senderName: 'System',
    content: 'Game settings updated.',
    timestamp: Date.now(),
    type: 'system',
  });
  
  games[gameIndex] = game;
  saveGameList(games);
  
  return game;
};

/**
 * Starts a game
 */
export const startGame = (gameId: string): Game | null => {
  const { playerId } = getCurrentPlayer();
  if (!playerId) return null;
  
  const games = getGameList();
  const gameIndex = games.findIndex(game => game.id === gameId);
  if (gameIndex === -1) return null;
  
  const game = games[gameIndex];
  
  // Only the host can start the game
  if (game.hostId !== playerId) return null;
  
  // Check if all players are ready
  const allReady = game.players.every(p => p.isReady || p.isHost);
  if (!allReady) return null;
  
  // Update game status
  game.status = 'in-progress';
  game.startedAt = Date.now();
  
  // Add system message
  game.messages.push({
    id: uuidv4(),
    senderId: 'system',
    senderName: 'System',
    content: 'Game has started. Preparing your mystical journey...',
    timestamp: Date.now(),
    type: 'system',
  });
  
  games[gameIndex] = game;
  saveGameList(games);
  
  return game;
};

/**
 * Sends a chat message
 */
export const sendChatMessage = (
  gameId: string,
  content: string,
  recipientId?: string
): Game | null => {
  const { playerId, username } = getCurrentPlayer();
  if (!playerId || !username) return null;
  
  const games = getGameList();
  const gameIndex = games.findIndex(game => game.id === gameId);
  if (gameIndex === -1) return null;
  
  const game = games[gameIndex];
  
  // Ensure player is in the game
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return null;
  
  // Create message
  const newMessage: ChatMessage = {
    id: uuidv4(),
    senderId: playerId,
    senderName: username,
    content,
    timestamp: Date.now(),
    type: recipientId ? 'private' : 'chat',
    recipientId,
  };
  
  // Add message to game
  game.messages.push(newMessage);
  
  games[gameIndex] = game;
  saveGameList(games);
  
  return game;
};

/**
 * Gets the current game the player is in
 */
export const getCurrentGame = (): Game | null => {
  const currentGameId = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
  if (!currentGameId) return null;
  
  return getGameById(currentGameId);
};

/**
 * Poll for game updates
 * This simulates real-time updates by checking for changes to the game
 * in localStorage at regular intervals.
 */
export const pollGameUpdates = (
  gameId: string,
  callback: (game: Game | null) => void,
  interval: number = 2000
): { stop: () => void } => {
  let intervalId: number | null = null;
  
  const poll = () => {
    const game = getGameById(gameId);
    callback(game);
  };
  
  // Initial poll
  poll();
  
  // Set up interval
  intervalId = window.setInterval(poll, interval);
  
  // Return function to stop polling
  return {
    stop: () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }
  };
};

/**
 * Initializes the game service
 * This should be called when the app starts
 */
export const initGameService = (): void => {
  // Create initial data structures if they don't exist
  if (!localStorage.getItem(STORAGE_KEYS.GAMES)) {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify([]));
  }
  
  // Simulate some initial games if none exist
  const games = getGameList();
  if (games.length === 0) {
    const mockGames: Partial<Game>[] = [
      {
        id: uuidv4(),
        name: 'Twilight Brewing Circle',
        hostId: 'system-1',
        hostName: 'MysticAlder',
        players: [
          {
            id: 'system-1',
            name: 'MysticAlder',
            status: 'connected',
            isHost: true,
            isReady: true,
            joinedAt: Date.now() - 15 * 60000,
          },
          {
            id: 'system-2',
            name: 'RavenCraft',
            status: 'connected',
            isHost: false,
            isReady: true,
            joinedAt: Date.now() - 10 * 60000,
          },
        ],
        maxPlayers: 4,
        status: 'waiting',
        createdAt: Date.now() - 15 * 60000,
        settings: DEFAULT_GAME_SETTINGS,
        messages: [
          {
            id: uuidv4(),
            senderId: 'system',
            senderName: 'System',
            content: 'Game "Twilight Brewing Circle" created. Waiting for players to join...',
            timestamp: Date.now() - 15 * 60000,
            type: 'system',
          },
          {
            id: uuidv4(),
            senderId: 'system-2',
            senderName: 'RavenCraft',
            content: 'Hello! Anyone want to join our magical brewing session?',
            timestamp: Date.now() - 8 * 60000,
            type: 'chat',
          },
        ],
      },
      {
        id: uuidv4(),
        name: 'Herbal Moon Society',
        hostId: 'system-3',
        hostName: 'WillowWitch',
        players: [
          {
            id: 'system-3',
            name: 'WillowWitch',
            status: 'connected',
            isHost: true,
            isReady: true,
            joinedAt: Date.now() - 45 * 60000,
          },
          {
            id: 'system-4',
            name: 'LunarBotanist',
            status: 'connected',
            isHost: false,
            isReady: true,
            joinedAt: Date.now() - 40 * 60000,
          },
          {
            id: 'system-5',
            name: 'SageBrewMaster',
            status: 'away',
            isHost: false,
            isReady: false,
            joinedAt: Date.now() - 30 * 60000,
          },
        ],
        maxPlayers: 3,
        status: 'in-progress',
        createdAt: Date.now() - 45 * 60000,
        startedAt: Date.now() - 20 * 60000,
        settings: {
          ...DEFAULT_GAME_SETTINGS,
          difficulty: 'hard',
          seasonStartingPoint: 'winter',
        },
        messages: [
          {
            id: uuidv4(),
            senderId: 'system',
            senderName: 'System',
            content: 'Game "Herbal Moon Society" created. Waiting for players to join...',
            timestamp: Date.now() - 45 * 60000,
            type: 'system',
          },
          {
            id: uuidv4(),
            senderId: 'system',
            senderName: 'System',
            content: 'Game has started. Preparing your mystical journey...',
            timestamp: Date.now() - 20 * 60000,
            type: 'system',
          },
        ],
      },
      {
        id: uuidv4(),
        name: 'Mystical Gardens',
        hostId: 'system-6',
        hostName: 'HerbalWhisper',
        players: [
          {
            id: 'system-6',
            name: 'HerbalWhisper',
            status: 'connected',
            isHost: true,
            isReady: true,
            joinedAt: Date.now() - 5 * 60000,
          },
        ],
        maxPlayers: 5,
        status: 'waiting',
        createdAt: Date.now() - 5 * 60000,
        settings: {
          ...DEFAULT_GAME_SETTINGS,
          tradingEnabled: false,
        },
        messages: [
          {
            id: uuidv4(),
            senderId: 'system',
            senderName: 'System',
            content: 'Game "Mystical Gardens" created. Waiting for players to join...',
            timestamp: Date.now() - 5 * 60000,
            type: 'system',
          },
        ],
      },
    ];
    
    saveGameList(mockGames as Game[]);
    
    // Add some mock players
    const mockPlayers: Player[] = [
      {
        id: 'system-1',
        name: 'MysticAlder',
        status: 'connected',
        isHost: true,
        isReady: true,
        joinedAt: Date.now() - 60 * 60000,
      },
      {
        id: 'system-2',
        name: 'RavenCraft',
        status: 'connected',
        isHost: false,
        isReady: true,
        joinedAt: Date.now() - 55 * 60000,
      },
      {
        id: 'system-3',
        name: 'WillowWitch',
        status: 'connected',
        isHost: true,
        isReady: true,
        joinedAt: Date.now() - 50 * 60000,
      },
      {
        id: 'system-4',
        name: 'LunarBotanist',
        status: 'connected',
        isHost: false,
        isReady: true,
        joinedAt: Date.now() - 45 * 60000,
      },
      {
        id: 'system-5',
        name: 'SageBrewMaster',
        status: 'away',
        isHost: false,
        isReady: false,
        joinedAt: Date.now() - 40 * 60000,
      },
      {
        id: 'system-6',
        name: 'HerbalWhisper',
        status: 'connected',
        isHost: true,
        isReady: true,
        joinedAt: Date.now() - 35 * 60000,
      },
    ];
    
    savePlayerList(mockPlayers);
  }
};

// Initialize the service on import
initGameService();

export default {
  getCurrentPlayer,
  createPlayerIdentity,
  getGameList,
  getGameById,
  createGame,
  joinGame,
  leaveGame,
  setPlayerReady,
  updateGameSettings,
  startGame,
  sendChatMessage,
  getCurrentGame,
  pollGameUpdates,
};