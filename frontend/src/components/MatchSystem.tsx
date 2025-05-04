import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
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

  // Get username from local storage
  useEffect(() => {
    const savedUsername = localStorage.getItem('covenUsername');
    if (!savedUsername) {
      navigate('/');
      return;
    }
    setUsername(savedUsername);
  }, [navigate]);

  // Initialize or join game
  const initializeGame = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
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
        // In a real app, save this game to the server
        
        // Update the URL without reloading the page
        window.history.pushState({}, '', `/game/${newGameId}`);
      } else if (gameId) {
        // Join an existing game
        // In a real app, fetch the game data from the server
        
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
  }, [gameId, isHost, username, gameName, maxPlayers, navigate]);

  useEffect(() => {
    if (username) {
      initializeGame();
    }
  }, [username, initializeGame]);

  // Simulate real-time updates
  useEffect(() => {
    if (!game) return;
    
    // Simulate other players joining
    const playerJoinTimeout = setTimeout(() => {
      if (game.players.length < game.maxPlayers && Math.random() > 0.5) {
        const playerNames = ['MysticBrewer', 'SageCraft', 'LunarBotanist', 'WillowWitch'];
        const randomName = playerNames[Math.floor(Math.random() * playerNames.length)];
        
        setGame(prevGame => {
          if (!prevGame) return null;
          
          const updatedGame = { ...prevGame };
          
          // Add new player
          updatedGame.players = [
            ...updatedGame.players,
            {
              id: `ai-${Math.random().toString(36).substring(2, 9)}`,
              name: randomName,
              status: 'connected',
              isHost: false,
              isReady: false,
              joinedAt: new Date()
            }
          ];
          
          // Add system message
          updatedGame.messages = [
            ...updatedGame.messages,
            {
              id: `msg-${Math.random().toString(36).substring(2, 9)}`,
              senderId: 'system',
              senderName: 'System',
              content: `${randomName} joined the game.`,
              timestamp: new Date(),
              type: 'system'
            }
          ];
          
          return updatedGame;
        });
      }
    }, 15000); // Simulate player joining after 15 seconds
    
    // Simulate players setting ready status
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
      clearTimeout(playerJoinTimeout);
      clearTimeout(playerReadyTimeout);
    };
  }, [game, username]);

  // Handle chat messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !game) return;
    
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
    
    // In a real app, this would start the actual game
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
    }
  };

  // Leave game
  const handleLeaveGame = () => {
    // In a real app, notify the server that the player is leaving
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
                disabled={!allPlayersReady || game.players.length < 2}
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