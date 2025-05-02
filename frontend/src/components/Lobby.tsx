import React, { useState, useEffect } from 'react';
import './Lobby.css';
import { useMultiplayer } from '../contexts/MultiplayerContext';

interface LobbyProps {
  onEnterGame: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ onEnterGame }) => {
  const { 
    isConnected, 
    isJoined, 
    currentPlayer, 
    players, 
    error,
    joinGame
  } = useMultiplayer();
  
  // Local state for the form
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Check if we should skip the lobby (already joined)
  useEffect(() => {
    if (isJoined && currentPlayer) {
      onEnterGame();
    }
  }, [isJoined, currentPlayer, onEnterGame]);
  
  // Try to load saved player name
  useEffect(() => {
    const savedName = localStorage.getItem('coven_player_name');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate player name
    if (!playerName.trim()) {
      setLocalError('Please enter a name to join the coven');
      return;
    }
    
    // Check connection
    if (!isConnected) {
      setLocalError('Waiting for connection to server...');
      return;
    }
    
    // Join the game
    setIsLoading(true);
    setLocalError(null);
    
    // Call the joinGame function
    joinGame(playerName);
    
    // Show loading state for a bit
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };
  
  // Get the connection status message
  const getConnectionStatus = () => {
    if (!isConnected) return 'Connecting to the magical realm...';
    if (isLoading) return 'Joining the coven...';
    if (error) return error;
    if (localError) return localError;
    return 'Connected to the magical realm!';
  };
  
  return (
    <div className="lobby-container">
      <div className="lobby-backdrop"></div>
      
      <div className="lobby-content">
        <div className="lobby-header">COVEN MULTIPLAYER NETWORK v1.0</div>
        
        <div className="lobby-main">
          {/* ASCII art logo */}
          <pre className="dos-ascii-logo">
         ___ ___ _____ ___ ___ 
        |  _| . |     | -_|   |
        |___|___|_|_|_|___|_|_|
             WITCH NETWORK
          </pre>
          
          <h1 className="lobby-title">Welcome to the Coven</h1>
          <p className="lobby-subtitle">Enter your witch name to connect</p>
          
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'connecting'}`}></div>
            <span className="status-text">{getConnectionStatus()}</span>
          </div>
          
          <form className="join-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="name-input"
              placeholder="Enter your witch name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={isLoading || !isConnected}
            />
            
            <button 
              type="submit" 
              className="join-button"
              disabled={isLoading || !isConnected}
            >
              {isLoading ? 'CONNECTING...' : 'ENTER THE REALM'}
            </button>
          </form>
          
          {players.length > 0 && (
            <div className="players-online">
              <h3>WITCHES ONLINE [{players.length}]</h3>
              <ul className="players-list">
                {players.map((player) => (
                  <li key={player.playerId} className="player-item">
                    <span className="player-name">{player.playerName}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="lobby-footer">
          PRESS ENTER TO CONNECT - ESC TO CANCEL
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="corner-decoration top-left"></div>
      <div className="corner-decoration top-right"></div>
      <div className="corner-decoration bottom-left"></div>
      <div className="corner-decoration bottom-right"></div>
    </div>
  );
};

export default Lobby;