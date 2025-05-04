import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

// Define types
interface Game {
  id: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
  status: 'waiting' | 'in-progress' | 'finished';
  createdAt: Date;
}

interface Player {
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'join' | 'create' | 'about'>('join');
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [gameName, setGameName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('4');

  // Mock API call to fetch games
  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - would be replaced with actual API call
      const mockGames: Game[] = [
        {
          id: '1',
          name: 'Twilight Brewing Circle',
          host: 'MysticAlder',
          players: 2,
          maxPlayers: 4,
          status: 'waiting',
          createdAt: new Date(Date.now() - 15 * 60000)
        },
        {
          id: '2',
          name: 'Herbal Moon Society',
          host: 'RavenCraft',
          players: 3,
          maxPlayers: 3,
          status: 'in-progress',
          createdAt: new Date(Date.now() - 45 * 60000)
        },
        {
          id: '3',
          name: 'Mistletoe Gardens',
          host: 'WillowWitch',
          players: 1,
          maxPlayers: 5,
          status: 'waiting',
          createdAt: new Date(Date.now() - 5 * 60000)
        },
      ];
      
      setGames(mockGames);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mock API call to fetch online players
  const fetchPlayers = useCallback(async () => {
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock data - would be replaced with actual API call
      const mockPlayers: Player[] = [
        { id: '1', name: 'MysticAlder', status: 'online' },
        { id: '2', name: 'RavenCraft', status: 'online' },
        { id: '3', name: 'WillowWitch', status: 'online' },
        { id: '4', name: 'LunarBotanist', status: 'away' },
        { id: '5', name: 'SageBrewMaster', status: 'online' },
        { id: '6', name: 'MidnightHerbalist', status: 'offline' },
      ];
      
      setPlayers(mockPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchGames();
    fetchPlayers();
    
    // Check if user has saved username
    const savedUsername = localStorage.getItem('covenUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setAuthenticated(true);
    }
    
    // Set up polling for game list updates
    const gamesInterval = setInterval(fetchGames, 15000);
    const playersInterval = setInterval(fetchPlayers, 30000);
    
    return () => {
      clearInterval(gamesInterval);
      clearInterval(playersInterval);
    };
  }, [fetchGames, fetchPlayers]);

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('covenUsername', username);
      setAuthenticated(true);
    }
  };

  // Handle game creation
  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated) {
      alert('Please enter your coven name first!');
      return;
    }
    
    if (gameName.trim()) {
      // In a real app, this would create the game via API
      console.log('Creating game:', {
        name: gameName,
        host: username,
        maxPlayers: parseInt(maxPlayers)
      });
      
      // Navigate to the game setup page
      navigate('/game/setup', { 
        state: { 
          isHost: true, 
          gameName, 
          maxPlayers: parseInt(maxPlayers)
        } 
      });
    }
  };

  // Handle joining a game
  const handleJoinGame = (gameId: string) => {
    if (!authenticated) {
      alert('Please enter your coven name first!');
      return;
    }
    
    const game = games.find(g => g.id === gameId);
    if (!game) return;
    
    // In a real app, this would join the game via API
    console.log('Joining game:', gameId);
    
    // Navigate to the game page
    navigate(`/game/${gameId}`, { 
      state: { 
        isHost: false, 
        gameName: game.name
      } 
    });
  };

  // Handle starting the game in single-player mode
  const handleStartSinglePlayer = () => {
    if (!authenticated) {
      alert('Please enter your coven name first!');
      return;
    }
    
    navigate('/game/single-player');
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
              />
              <button type="submit" className="landing-button">Enter</button>
            </form>
          </div>
        ) : (
          <>
            <div className="landing-buttons">
              <button 
                className="landing-button primary"
                onClick={() => {
                  setActiveTab('join');
                  fetchGames();
                }}
              >
                Join Game
              </button>
              <button 
                className="landing-button secondary"
                onClick={() => setActiveTab('create')}
              >
                Create Game
              </button>
              <button 
                className="landing-button"
                onClick={handleStartSinglePlayer}
              >
                Single Player
              </button>
            </div>
            
            <div className="lobby-panel">
              <div className="lobby-tabs">
                <button 
                  className={`lobby-tab ${activeTab === 'join' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('join');
                    fetchGames();
                  }}
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
                        <div className="loading-text">Loading games...</div>
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
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Maximum Players</label>
                      <select 
                        className="form-select"
                        value={maxPlayers}
                        onChange={e => setMaxPlayers(e.target.value)}
                      >
                        <option value="2">2 Players</option>
                        <option value="3">3 Players</option>
                        <option value="4">4 Players</option>
                        <option value="5">5 Players</option>
                      </select>
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="landing-button primary">
                        Create Game
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
              
              {activeTab === 'join' && !loading && (
                <div className="player-list">
                  <div className="player-item">
                    <div className="player-status"></div>
                    <div>{username} (You)</div>
                  </div>
                  {players.filter(p => p.name !== username).map(player => (
                    <div key={player.id} className="player-item">
                      <div className={`player-status ${player.status === 'away' ? 'away' : player.status === 'offline' ? 'offline' : ''}`}></div>
                      <div>{player.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="landing-footer">
        <div className="footer-links">
          <a href="#" className="footer-link">About</a>
          <a href="#" className="footer-link">How to Play</a>
          <a href="#" className="footer-link">Credits</a>
        </div>
        <div className="copyright">New Coven &copy; 2025 - A mystical crafting experience</div>
      </div>
    </div>
  );
};

export default LandingPage;