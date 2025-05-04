import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { useMultiplayer } from '../contexts/MultiplayerContext';

// Interface for active games
interface Game {
  id: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
  status: 'waiting' | 'in-progress' | 'finished';
  createdAt: Date;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'join' | 'create' | 'about'>('join');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [gameName, setGameName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('4');
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Get multiplayer context
  const { 
    isConnected, 
    isJoined,
    connecting,
    currentPlayer,
    players: onlinePlayers,
    connect,
    joinGame: joinMultiplayerGame,
    error
  } = useMultiplayer();

  // Update errors from the multiplayer context
  useEffect(() => {
    if (error) {
      setLastError(error);
      setLoading(false);
    }
  }, [error]);

  // Attempt connection when component mounts
  useEffect(() => {
    // Check if user has saved username
    const savedUsername = localStorage.getItem('covenUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setAuthenticated(true);
      
      // Try to connect to the server
      setLoading(true);
      connect().then(success => {
        setLoading(false);
        if (success && !isJoined) {
          joinMultiplayerGame(savedUsername);
        }
      }).catch(err => {
        console.error("Connection failed:", err);
        setLoading(false);
        setLastError("Failed to connect to server. Please try again later.");
      });
    } else {
      setLoading(false);
    }
  }, [connect, joinMultiplayerGame, isJoined]);

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLastError(null);
    
    if (username.trim()) {
      localStorage.setItem('covenUsername', username);
      setAuthenticated(true);
      
      // Connect to the multiplayer server
      setLoading(true);
      connect().then(success => {
        setLoading(false);
        if (success) {
          joinMultiplayerGame(username);
        } else {
          setLastError("Failed to connect to the server. Please try again.");
        }
      }).catch(err => {
        console.error("Login connection error:", err);
        setLoading(false);
        setLastError("Failed to connect to server. Please try again later.");
      });
    }
  };

  // Handle game creation
  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    setLastError(null);
    
    if (!authenticated) {
      setLastError('Please enter your coven name first!');
      return;
    }
    
    if (gameName.trim()) {
      // First, ensure we're connected to the multiplayer server
      if (!isConnected) {
        setLoading(true);
        connect().then(success => {
          setLoading(false);
          if (success) {
            joinMultiplayerGame(username);
            proceedToCreateGame();
          } else {
            setLastError("Failed to connect to the server. Please try again.");
          }
        }).catch(() => {
          setLoading(false);
          setLastError("Failed to connect to server. Please try again later.");
        });
      } else {
        proceedToCreateGame();
      }
    }
  };
  
  // Helper function to create game after connection is established
  const proceedToCreateGame = () => {
    // Navigate to the game setup page
    navigate('/game/setup', { 
      state: { 
        isHost: true, 
        gameName, 
        maxPlayers: parseInt(maxPlayers)
      } 
    });
  };

  // Handle joining a game
  const handleJoinGame = (gameId: string) => {
    setLastError(null);
    
    if (!authenticated) {
      setLastError('Please enter your coven name first!');
      return;
    }
    
    const game = games.find(g => g.id === gameId);
    if (!game) return;
    
    // First, ensure we're connected to the multiplayer server
    if (!isConnected) {
      setLoading(true);
      connect().then(success => {
        setLoading(false);
        if (success) {
          joinMultiplayerGame(username);
          proceedToJoinGame(gameId, game.name);
        } else {
          setLastError("Failed to connect to the server. Please try again.");
        }
      }).catch(() => {
        setLoading(false);
        setLastError("Failed to connect to server. Please try again later.");
      });
    } else {
      proceedToJoinGame(gameId, game.name);
    }
  };
  
  // Helper function to join game after connection is established
  const proceedToJoinGame = (gameId: string, gameName: string) => {
    // Navigate to the game page
    navigate(`/game/${gameId}`, { 
      state: { 
        isHost: false, 
        gameName
      } 
    });
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="landing-container">
      <div className="landing-bg-overlay"></div>
      <div className="scanlines"></div>
      
      <div className="landing-content">
        <h1 className="landing-title">New Coven</h1>
        <p className="landing-subtitle">
          Brew magical potions, cultivate mystical plants, and build your coven's reputation
          in this enchanting multiplayer crafting game.
        </p>
        
        {lastError && (
          <div className="error-message">
            {lastError}
          </div>
        )}
        
        {!authenticated ? (
          <div className="credentials-section">
            <div className="credentials-label">Enter your coven name to continue:</div>
            <form className="credentials-form" onSubmit={handleLogin}>
              <input 
                type="text"
                className="credentials-input form-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your coven name"
                required
                disabled={loading}
              />
              <button type="submit" className="landing-button" disabled={loading}>
                {loading ? 'Connecting...' : 'Enter'}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="connection-status">
              {isConnected ? 
                <span className="status-connected">Connected to Server</span> : 
                <span className="status-disconnected">Disconnected</span>
              }
            </div>
            
            <div className="landing-buttons">
              <button 
                className="landing-button primary"
                onClick={() => setActiveTab('join')}
                disabled={loading}
              >
                Join Game
              </button>
              <button 
                className="landing-button secondary"
                onClick={() => setActiveTab('create')}
                disabled={loading}
              >
                Create Game
              </button>
            </div>
            
            <div className="lobby-panel">
              <div className="lobby-tabs">
                <button 
                  className={`lobby-tab ${activeTab === 'join' ? 'active' : ''}`}
                  onClick={() => setActiveTab('join')}
                >
                  Join Game
                </button>
                <button 
                  className={`lobby-tab ${activeTab === 'create' ? 'active' : ''}`}
                  onClick={() => setActiveTab('create')}
                >
                  Create Game
                </button>
                <button 
                  className={`lobby-tab ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  About
                </button>
              </div>
              
              <div className="lobby-content">
                {activeTab === 'join' && (
                  <>
                    {loading ? (
                      <div className="loading-indicator">
                        <div className="spinner"></div>
                        <div className="loading-text">Connecting to server...</div>
                      </div>
                    ) : !isConnected ? (
                      <div className="connection-error">
                        <div className="error-icon">⚠️</div>
                        <div className="error-text">
                          Not connected to server. Please try refreshing the page.
                        </div>
                        <button 
                          className="landing-button"
                          onClick={() => {
                            setLoading(true);
                            connect()
                              .then(success => {
                                setLoading(false);
                                if (success) {
                                  joinMultiplayerGame(username);
                                } else {
                                  setLastError("Failed to connect to the server. Please try again.");
                                }
                              })
                              .catch(() => {
                                setLoading(false);
                                setLastError("Failed to connect to server. Please try again later.");
                              });
                          }}
                        >
                          Try Reconnecting
                        </button>
                      </div>
                    ) : games.length > 0 ? (
                      <ul className="game-list">
                        {games.map(game => (
                          <li key={game.id} className="game-item">
                            <div className="game-info">
                              <div className="game-name">{game.name}</div>
                              <div className="game-details">
                                <span>Host: {game.host}</span>
                                <span>Players: {game.players}/{game.maxPlayers}</span>
                                <span>Created: {formatTimeAgo(game.createdAt)}</span>
                                <span className={`game-status status-${game.status}`}>
                                  {game.status === 'waiting' ? 'Waiting' : 
                                   game.status === 'in-progress' ? 'In Progress' : 'Finished'}
                                </span>
                              </div>
                            </div>
                            <div className="game-actions">
                              <button 
                                className="landing-button"
                                onClick={() => handleJoinGame(game.id)}
                                disabled={game.status !== 'waiting' || game.players >= game.maxPlayers}
                              >
                                Join
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <div className="empty-state-text">
                          No games available. Why not create one?
                        </div>
                        <button 
                          className="landing-button"
                          onClick={() => setActiveTab('create')}
                        >
                          Create Game
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                {activeTab === 'create' && (
                  <form className="create-game-form" onSubmit={handleCreateGame}>
                    <div className="form-group">
                      <label className="form-label">Game Name</label>
                      <input 
                        type="text"
                        className="form-input"
                        value={gameName}
                        onChange={e => setGameName(e.target.value)}
                        placeholder="Enter a name for your game"
                        required
                        disabled={loading || !isConnected}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Maximum Players</label>
                      <select 
                        className="form-select"
                        value={maxPlayers}
                        onChange={e => setMaxPlayers(e.target.value)}
                        disabled={loading || !isConnected}
                      >
                        <option value="2">2 Players</option>
                        <option value="3">3 Players</option>
                        <option value="4">4 Players</option>
                        <option value="5">5 Players</option>
                      </select>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="landing-button primary"
                        disabled={loading || !isConnected}
                      >
                        {loading ? 'Connecting...' : 'Create Game'}
                      </button>
                    </div>
                  </form>
                )}
                
                {activeTab === 'about' && (
                  <div className="about-content">
                    <p>
                      In New Coven, you'll join a mystical world where players cultivate magical
                      herbs, brew powerful potions, and create enchanted items in a cozy 
                      crafting-focused experience.
                    </p>
                    <p>
                      Collaborate with friends to discover new recipes, trade rare ingredients,
                      and compete in seasonal festivals to earn prestige for your coven.
                    </p>
                    <p>
                      Features:
                    </p>
                    <ul>
                      <li>Cultivate magical plants in your enchanted garden</li>
                      <li>Brew mystical potions with unique effects</li>
                      <li>Design beautiful packaging for your creations</li>
                      <li>Trade with other players in the marketplace</li>
                      <li>Participate in seasonal events and festivals</li>
                    </ul>
                  </div>
                )}
              </div>
              
              {activeTab === 'join' && !loading && isConnected && (
                <div className="player-list">
                  <h3>Online Players</h3>
                  {onlinePlayers.length > 0 ? (
                    <>
                      {currentPlayer && (
                        <div className="player-item">
                          <div className="player-status"></div>
                          <div>{currentPlayer.playerName} (You)</div>
                        </div>
                      )}
                      {onlinePlayers
                        .filter(p => currentPlayer && p.playerName !== currentPlayer.playerName)
                        .map(player => (
                          <div key={player.playerId} className="player-item">
                            <div className="player-status"></div>
                            <div>{player.playerName}</div>
                          </div>
                      ))}
                    </>
                  ) : (
                    <div className="empty-players">No other players online</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="landing-footer">
        <div className="footer-links">
          <a href="#about" className="footer-link">About</a>
          <a href="#how-to-play" className="footer-link">How to Play</a>
          <a href="#credits" className="footer-link">Credits</a>
        </div>
        <div className="copyright">New Coven &copy; 2025 - A mystical crafting experience</div>
      </div>
    </div>
  );
};

export default LandingPage;