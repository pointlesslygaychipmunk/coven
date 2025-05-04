import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../contexts/MultiplayerContext';
import './MatchSystem.css';

// Types
interface GameState {
  id: string;
  name: string;
  host: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'in-progress' | 'finished';
  startedAt?: Date;
  settings: {
    difficulty: 'easy' | 'normal' | 'hard';
    seasonStartingPoint: 'spring' | 'summer' | 'autumn' | 'winter';
    tradingEnabled: boolean;
    pvpEnabled: boolean;
  };
  messages: ChatMessage[];
}

interface Player {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'away';
  isHost: boolean;
  isReady: boolean;
  joinedAt: Date;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'chat' | 'system' | 'private';
  recipient?: string;
}

interface LocationState {
  isHost?: boolean;
  gameName?: string;
  maxPlayers?: number;
}

const MatchSystem: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState || {};
  
  const { isHost = false, gameName = '', maxPlayers = 4 } = locationState;
  
  // Get multiplayer context
  const { 
    isConnected, 
    isJoined,
    currentPlayer,
    players: onlinePlayers,
    messages: chatMessages,
    gameState: multiplayerGameState,
    connect,
    joinGame: joinMultiplayerGame,
    sendMessage: sendChatMessage,
    error: connectionError
  } = useMultiplayer();
  
  // State
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [settings, setSettings] = useState({
    difficulty: 'normal' as const,
    seasonStartingPoint: 'spring' as const,
    tradingEnabled: true,
    pvpEnabled: false
  });

  // Get username from local storage and connect to server
  useEffect(() => {
    const savedUsername = localStorage.getItem('covenUsername');
    if (!savedUsername) {
      navigate('/');
      return;
    }
    
    setUsername(savedUsername);
    
    // Connect to the server if not already connected
    if (!isConnected) {
      connect().then(success => {
        if (success && !isJoined) {
          joinMultiplayerGame(savedUsername);
        }
      });
    }
  }, [navigate, isConnected, isJoined, connect, joinMultiplayerGame]);

  // Add connection error to our error state
  useEffect(() => {
    if (connectionError) {
      setError(connectionError);
    }
  }, [connectionError]);

  // Update chat messages when they come in through WebSocket
  useEffect(() => {
    if (chatMessages.length > 0 && game) {
      // Convert WebSocket chat message format to our game's format
      const formattedMessages: ChatMessage[] = chatMessages.map(msg => ({
        id: `ws-${msg.timestamp}`,
        senderId: msg.senderId,
        senderName: msg.senderName,
        content: msg.message,
        timestamp: new Date(msg.timestamp),
        type: 'chat'
      }));
      
      // Update game with new messages
      setGame(prevGame => {
        if (!prevGame) return null;
        
        // Filter out messages we already have by comparing content and sender
        const existingMessageSignatures = new Set(prevGame.messages.map(m => 
          `${m.senderId}-${m.content.substring(0, 20)}-${m.timestamp.getTime()}`
        ));
        
        const newMessages = formattedMessages.filter(m => 
          !existingMessageSignatures.has(`${m.senderId}-${m.content.substring(0, 20)}-${m.timestamp.getTime()}`)
        );
        
        if (newMessages.length === 0) return prevGame;
        
        return {
          ...prevGame,
          messages: [...prevGame.messages, ...newMessages]
        };
      });
    }
  }, [chatMessages, game]);

  // Initialize or join game
  const initializeGame = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call through WebSocket
      // For now, use the mock version but initialize a WebSocket connection in parallel
      
      // Ensure we're connected
      if (!isConnected) {
        await connect();
        if (username) {
          joinMultiplayerGame(username);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isHost && !gameId) {
        // Create a new game
        const newGameId = Math.random().toString(36).substring(2, 9);
        const newGame: GameState = {
          id: newGameId,
          name: gameName || `${username}'s Game`,
          host: username,
          players: [
            {
              id: '1',
              name: username,
              status: 'connected',
              isHost: true,
              isReady: false,
              joinedAt: new Date()
            }
          ],
          maxPlayers: maxPlayers,
          status: 'waiting',
          settings: {
            difficulty: 'normal',
            seasonStartingPoint: 'spring',
            tradingEnabled: true,
            pvpEnabled: false
          },
          messages: [
            {
              id: '1',
              senderId: 'system',
              senderName: 'System',
              content: `Game "${gameName}" created. Waiting for players to join...`,
              timestamp: new Date(),
              type: 'system'
            }
          ]
        };
        
        setGame(newGame);
        
        // Update the URL without reloading the page
        window.history.pushState({}, '', `/game/${newGameId}`);
      } else if (gameId) {
        // Join an existing game
        // In a real app, fetch the game data from the server via WebSocket
        
        // Mock data for an existing game
        const existingGame: GameState = {
          id: gameId,
          name: gameName || `Game #${gameId}`,
          host: isHost ? username : 'OtherPlayer',
          players: [
            {
              id: '1',
              name: isHost ? username : 'OtherPlayer',
              status: 'connected',
              isHost: isHost,
              isReady: false,
              joinedAt: new Date(Date.now() - 300000) // 5 minutes ago
            }
          ],
          maxPlayers: maxPlayers,
          status: 'waiting',
          settings: {
            difficulty: 'normal',
            seasonStartingPoint: 'spring',
            tradingEnabled: true,
            pvpEnabled: false
          },
          messages: [
            {
              id: '1',
              senderId: 'system',
              senderName: 'System',
              content: `Game "${gameName || `Game #${gameId}`}" created.`,
              timestamp: new Date(Date.now() - 300000),
              type: 'system'
            }
          ]
        };
        
        // If not the host, add the player to the game
        if (!isHost) {
          existingGame.players.push({
            id: '2',
            name: username,
            status: 'connected',
            isHost: false,
            isReady: false,
            joinedAt: new Date()
          });
          
          existingGame.messages.push({
            id: '2',
            senderId: 'system',
            senderName: 'System',
            content: `${username} joined the game.`,
            timestamp: new Date(),
            type: 'system'
          });
        }
        
        setGame(existingGame);
      }
    } catch (err) {
      console.error('Error initializing game:', err);
      setError('Failed to initialize or join game. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [gameId, isHost, username, gameName, maxPlayers, isConnected, connect, joinMultiplayerGame]);

  useEffect(() => {
    if (username) {
      initializeGame();
    }
  }, [username, initializeGame]);

  // Update player list from connected players
  useEffect(() => {
    if (game && onlinePlayers.length > 0) {
      setGame(prevGame => {
        if (!prevGame) return null;
        
        // Convert WebSocket player format to our game's format
        const connectedPlayers = onlinePlayers.map(p => {
          const existingPlayer = prevGame.players.find(player => player.name === p.playerName);
          return {
            id: p.playerId,
            name: p.playerName,
            status: 'connected' as const,
            isHost: p.playerName === prevGame.host,
            isReady: existingPlayer?.isReady || false,
            joinedAt: new Date(p.joinedAt)
          };
        });
        
        // Keep existing players that aren't in the WebSocket list
        const existingPlayers = prevGame.players.filter(player => 
          !onlinePlayers.some(p => p.playerName === player.name)
        );
        
        const updatedPlayers = [...connectedPlayers, ...existingPlayers];
        
        // If player counts changed, add system message
        if (connectedPlayers.length !== prevGame.players.length) {
          const newPlayerNames = connectedPlayers
            .filter(p => !prevGame.players.some(player => player.name === p.name))
            .map(p => p.name);
          
          const disconnectedPlayerNames = prevGame.players
            .filter(player => !connectedPlayers.some(p => p.name === player.name))
            .map(player => player.name);
          
          const updatedMessages = [...prevGame.messages];
          
          // Add join messages
          newPlayerNames.forEach(name => {
            updatedMessages.push({
              id: `msg-${Math.random().toString(36).substring(2, 9)}`,
              senderId: 'system',
              senderName: 'System',
              content: `${name} joined the game.`,
              timestamp: new Date(),
              type: 'system'
            });
          });
          
          // Add disconnect messages
          disconnectedPlayerNames.forEach(name => {
            updatedMessages.push({
              id: `msg-${Math.random().toString(36).substring(2, 9)}`,
              senderId: 'system',
              senderName: 'System',
              content: `${name} disconnected.`,
              timestamp: new Date(),
              type: 'system'
            });
          });
          
          return {
            ...prevGame,
            players: updatedPlayers,
            messages: updatedMessages
          };
        }
        
        return {
          ...prevGame,
          players: updatedPlayers
        };
      });
    }
  }, [onlinePlayers, game]);

  // Simulate real-time updates (for demo purposes)
  // In a real app, these would come from WebSocket events
  useEffect(() => {
    if (!game) return;
    
    // Simulate AI players setting ready status only
    // Player joining is now handled by the WebSocket
    const playerReadyTimeout = setTimeout(() => {
      setGame(prevGame => {
        if (!prevGame) return null;
        
        const updatedGame = { ...prevGame };
        
        // Randomly set AI players to ready
        updatedGame.players = updatedGame.players.map(player => {
          if (player.name !== username && !player.isReady && Math.random() > 0.3) {
            return { ...player, isReady: true };
          }
          return player;
        });
        
        return updatedGame;
      });
    }, 5000);
    
    return () => {
      clearTimeout(playerReadyTimeout);
    };
  }, [game, username]);

  // Handle chat messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !game) return;
    
    // Send via WebSocket if connected
    if (isConnected && isJoined) {
      sendChatMessage(chatMessage);
    }
    
    // Also update local state for immediate feedback
    const newMessage: ChatMessage = {
      id: `msg-${Math.random().toString(36).substring(2, 9)}`,
      senderId: username,
      senderName: username,
      content: chatMessage,
      timestamp: new Date(),
      type: 'chat'
    };
    
    setGame(prevGame => {
      if (!prevGame) return null;
      return {
        ...prevGame,
        messages: [...prevGame.messages, newMessage]
      };
    });
    
    setChatMessage('');
  };

  // Handle ready status toggle
  const handleReadyToggle = () => {
    setIsReady(prev => !prev);
    
    setGame(prevGame => {
      if (!prevGame) return null;
      
      const updatedGame = { ...prevGame };
      
      // Update player ready status
      updatedGame.players = updatedGame.players.map(player => {
        if (player.name === username) {
          return { ...player, isReady: !isReady };
        }
        return player;
      });
      
      // Add system message
      updatedGame.messages = [
        ...updatedGame.messages,
        {
          id: `msg-${Math.random().toString(36).substring(2, 9)}`,
          senderId: 'system',
          senderName: 'System',
          content: `${username} is ${!isReady ? 'ready' : 'not ready'}.`,
          timestamp: new Date(),
          type: 'system'
        }
      ];
      
      return updatedGame;
    });
    
    // In a real app, send ready status via WebSocket
    // For now, just log it
    console.log(`[WebSocket] Sending ready status: ${!isReady}`);
  };

  // Handle game start
  const handleStartGame = () => {
    if (!game) return;
    
    // Check if all players are ready
    const allPlayersReady = game.players.every(player => player.isReady || player.isHost);
    
    if (!allPlayersReady) {
      alert('Not all players are ready yet!');
      return;
    }
    
    setGame(prevGame => {
      if (!prevGame) return null;
      
      const updatedGame = { ...prevGame };
      updatedGame.status = 'in-progress';
      updatedGame.startedAt = new Date();
      
      // Add system message
      updatedGame.messages = [
        ...updatedGame.messages,
        {
          id: `msg-${Math.random().toString(36).substring(2, 9)}`,
          senderId: 'system',
          senderName: 'System',
          content: 'Game has started. Preparing your mystical journey...',
          timestamp: new Date(),
          type: 'system'
        }
      ];
      
      return updatedGame;
    });
    
    // In a real app, this would start the actual game via WebSocket
    console.log('[WebSocket] Starting game:', game.id);
    
    // For now, redirect to the main game component after a delay
    setTimeout(() => {
      navigate('/game/active', { 
        state: { 
          gameId: game.id,
          players: game.players,
          settings: game.settings
        } 
      });
    }, 3000);
  };

  // Handle game settings change
  const handleSettingChange = (setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // Update game settings if host
    if (isHost && game) {
      setGame(prevGame => {
        if (!prevGame) return null;
        
        const updatedGame = { ...prevGame };
        updatedGame.settings = {
          ...updatedGame.settings,
          [setting]: value
        };
        
        return updatedGame;
      });
      
      // In a real app, broadcast settings change via WebSocket
      console.log(`[WebSocket] Updating game setting: ${setting}=${value}`);
    }
  };

  // Leave game
  const handleLeaveGame = () => {
    // In a real app, notify the server that the player is leaving via WebSocket
    console.log('[WebSocket] Leaving game');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="match-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">
          {isHost ? 'Creating your mystical gathering...' : 'Joining the magical circle...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="match-error">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <button className="match-button" onClick={() => navigate('/')}>
          Return to Lobby
        </button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="match-error">
        <div className="error-icon">⚠️</div>
        <div className="error-message">Game not found or has ended.</div>
        <button className="match-button" onClick={() => navigate('/')}>
          Return to Lobby
        </button>
      </div>
    );
  }

  const allPlayersReady = game.players.every(player => player.isReady || player.isHost);
  const currentPlayerIsHost = game.players.find(p => p.name === username)?.isHost || false;

  return (
    <div className="match-container">
      <div className="match-header">
        <h1 className="match-title">{game.name}</h1>
        <div className="match-status">
          Status: <span className="status-text">{game.status.charAt(0).toUpperCase() + game.status.slice(1)}</span>
        </div>
      </div>
      
      <div className="match-content">
        <div className="match-left-panel">
          <div className="player-list-container">
            <h2 className="panel-title">Players ({game.players.length}/{game.maxPlayers})</h2>
            <ul className="player-list">
              {game.players.map(player => (
                <li key={player.id} className="player-item">
                  <div className="player-status-indicator" 
                       data-status={player.status}
                       data-ready={player.isReady}></div>
                  <div className="player-name">
                    {player.name} {player.isHost && '(Host)'} {player.name === username && '(You)'}
                  </div>
                  <div className="player-ready-status">
                    {player.isReady ? 'Ready' : player.isHost ? 'Host' : 'Not Ready'}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {isHost && (
            <div className="game-settings">
              <h2 className="panel-title">Game Settings</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select 
                    className="form-select"
                    value={settings.difficulty}
                    onChange={e => handleSettingChange('difficulty', e.target.value)}
                    disabled={game.status === 'in-progress'}
                  >
                    <option value="easy">Easy</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Starting Season</label>
                  <select 
                    className="form-select"
                    value={settings.seasonStartingPoint}
                    onChange={e => handleSettingChange('seasonStartingPoint', e.target.value)}
                    disabled={game.status === 'in-progress'}
                  >
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="autumn">Autumn</option>
                    <option value="winter">Winter</option>
                  </select>
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={settings.tradingEnabled}
                      onChange={e => handleSettingChange('tradingEnabled', e.target.checked)}
                      disabled={game.status === 'in-progress'}
                    />
                    Enable Trading
                  </label>
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={settings.pvpEnabled}
                      onChange={e => handleSettingChange('pvpEnabled', e.target.checked)}
                      disabled={game.status === 'in-progress'}
                    />
                    Enable Competitive Mode
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {!isHost && (
            <div className="game-settings view-only">
              <h2 className="panel-title">Game Settings</h2>
              <div className="settings-info">
                <div className="setting-item">
                  <span className="setting-label">Difficulty:</span>
                  <span className="setting-value">{game.settings.difficulty.charAt(0).toUpperCase() + game.settings.difficulty.slice(1)}</span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">Starting Season:</span>
                  <span className="setting-value">{game.settings.seasonStartingPoint.charAt(0).toUpperCase() + game.settings.seasonStartingPoint.slice(1)}</span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">Trading:</span>
                  <span className="setting-value">{game.settings.tradingEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">Competitive Mode:</span>
                  <span className="setting-value">{game.settings.pvpEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="match-actions">
            {game.status === 'waiting' && !currentPlayerIsHost && (
              <button 
                className={`match-button ${isReady ? 'ready' : 'not-ready'}`}
                onClick={handleReadyToggle}
              >
                {isReady ? 'Not Ready' : 'Ready'}
              </button>
            )}
            
            {game.status === 'waiting' && currentPlayerIsHost && (
              <button 
                className="match-button start-game"
                onClick={handleStartGame}
                // Allow single player mode by not requiring multiple players
                disabled={!allPlayersReady}
              >
                Start Game
              </button>
            )}
            
            <button className="match-button leave-game" onClick={handleLeaveGame}>
              Leave Game
            </button>
          </div>
        </div>
        
        <div className="match-right-panel">
          <div className="chat-container">
            <h2 className="panel-title">Game Chat</h2>
            <div className="chat-messages">
              {game.messages.map(message => (
                <div 
                  key={message.id} 
                  className={`chat-message ${message.type} ${message.senderName === username ? 'self' : ''}`}
                >
                  <div className="message-header">
                    <span className="sender-name">{message.senderName}</span>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="message-content">{message.content}</div>
                </div>
              ))}
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input 
                type="text"
                className="chat-input"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button type="submit" className="chat-send-button">Send</button>
            </form>
          </div>
          
          <div className="game-info">
            <h2 className="panel-title">Game Information</h2>
            <div className="info-content">
              <p>
                Gather your ingredients, perfect your recipes, and prepare for a journey
                into the mystical arts of potion brewing and enchanted gardening.
              </p>
              
              {game.status === 'waiting' && (
                <div className="waiting-info">
                  {isHost ? (
                    <p>
                      As the host, you can adjust game settings and start the game once
                      all players are ready.
                    </p>
                  ) : (
                    <p>
                      Please mark yourself as ready when you're prepared to begin the
                      magical journey. The host will start the game once everyone is ready.
                    </p>
                  )}
                  
                  {!allPlayersReady && (
                    <p className="waiting-status">
                      Waiting for all players to be ready...
                    </p>
                  )}
                </div>
              )}
              
              {game.status === 'in-progress' && (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <div className="loading-text">Preparing your mystical journey...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchSystem;