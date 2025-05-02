import React from 'react';
import './OnlinePlayers.css';
import { useMultiplayer } from '../contexts/MultiplayerContext';

interface OnlinePlayersProps {
  showDetailed?: boolean;
}

const OnlinePlayers: React.FC<OnlinePlayersProps> = ({ showDetailed = false }) => {
  const { isConnected, currentPlayer, players } = useMultiplayer();
  
  // Format the time since join
  const getTimeSinceJoin = (joinedAt: number) => {
    const now = Date.now();
    const diffMs = now - joinedAt;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };
  
  if (!isConnected) {
    return (
      <div className="online-players">
        <div className="players-header">
          <h3>NETWORK.SYS</h3>
          <div className="connection-indicator offline">NOT CONNECTED</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`online-players ${showDetailed ? 'detailed' : 'compact'}`}>
      <div className="players-header">
        <h3>NETWORK.SYS</h3>
        <div className="connection-indicator online">
          USERS: {players.length}
        </div>
      </div>
      
      {showDetailed && (
        <div className="players-list">
          {players.map(player => (
            <div 
              key={player.playerId} 
              className={`player-item ${currentPlayer?.playerId === player.playerId ? 'current-player' : ''}`}
            >
              <div className="player-avatar">
                {player.playerName.charAt(0).toUpperCase()}
              </div>
              <div className="player-info">
                <div className="player-name">
                  {player.playerName}
                  {currentPlayer?.playerId === player.playerId && <span className="you-indicator">[YOU]</span>}
                </div>
                <div className="player-joined">
                  ONLINE: {getTimeSinceJoin(player.joinedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!showDetailed && players.length > 0 && (
        <div className="players-avatars">
          {players.slice(0, 5).map(player => (
            <div 
              key={player.playerId} 
              className={`player-avatar-small ${currentPlayer?.playerId === player.playerId ? 'current-player' : ''}`}
              title={player.playerName}
            >
              {player.playerName.charAt(0).toUpperCase()}
            </div>
          ))}
          {players.length > 5 && (
            <div className="player-avatar-small more">
              +{players.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OnlinePlayers;