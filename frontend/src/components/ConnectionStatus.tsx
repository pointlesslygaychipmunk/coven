import React, { useState, useEffect } from 'react';
import socketService from '../services/socketService';
import { getSocketConnection, checkConnectionHealth, forceReconnect, resetConnectionAndJoin } from '../services/connectionFix';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  showDetailed?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ showDetailed = false }) => {
  const [connected, setConnected] = useState<boolean>(socketService.isConnected());
  const [lastError, setLastError] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState<boolean>(false);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [transport, setTransport] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Listen for connection status changes
    const unsubscribe = socketService.onConnectionStatus((status) => {
      setConnected(status);
      if (status) {
        setLastError(null);
        // Update transport info when connected
        const health = checkConnectionHealth();
        setTransport(health.transport);
      }
    });

    // Listen for error messages
    const errorUnsubscribe = socketService.onError((error) => {
      setLastError(error.message);
    });

    return () => {
      unsubscribe();
      errorUnsubscribe();
    };
  }, []);

  // Handle reconnection using the updated connection fix
  const handleReconnect = async () => {
    setReconnecting(true);
    
    try {
      // Use the ngrok socket connection
      const socket = getSocketConnection();
      
      if (socket && socket.connected) {
        // Get saved player info from local storage
        const playerId = localStorage.getItem('coven_player_id');
        const playerName = localStorage.getItem('coven_player_name');
        
        if (playerId && playerName) {
          // Use standard socket service to join game
          socketService.joinGame(playerName, playerId);
          setConnected(true);
          setLastError(null);
          
          // Update transport info
          const health = checkConnectionHealth();
          setTransport(health.transport);
        }
      } else {
        setLastError('Could not connect. Please check if the ngrok tunnel is running.');
      }
    } catch (err) {
      console.error('Reconnection error:', err);
      setLastError('Failed to reconnect: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setReconnecting(false);
    }
  };

  // Handle forced reconnection
  const handleForceReconnect = async () => {
    setReconnecting(true);
    
    try {
      forceReconnect();
      
      // Wait a moment for connection to establish
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if we're connected
      const health = checkConnectionHealth();
      setConnected(health.connected);
      setTransport(health.transport);
      
      if (health.connected) {
        // Try to rejoin
        resetConnectionAndJoin();
        setLastError(null);
      } else {
        setLastError('Force reconnection failed. Please check if the ngrok tunnel is running.');
      }
    } catch (err) {
      console.error('Force reconnection error:', err);
      setLastError('Force reconnection failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setReconnecting(false);
    }
  };

  // Render a simple connection indicator or detailed status based on props
  if (!showDetailed) {
    return (
      <div className={`connection-indicator ${connected ? 'connected' : 'disconnected'}`} 
           title={connected ? 'Connected to server' : 'Disconnected from server'}>
        {connected ? '●' : '○'}
      </div>
    );
  }

  return (
    <div className="connection-status">
      <div className="connection-status-header">
        <div className={`connection-status-indicator ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? 'Connected' : 'Disconnected'}
          {connected && transport && <span className="transport-type"> ({transport})</span>}
        </div>
        
        {!connected && !reconnecting && (
          <div className="connection-actions">
            <button 
              onClick={handleReconnect}
              disabled={reconnecting}
              className="reconnect-button"
            >
              Reconnect
            </button>
            
            <button 
              onClick={handleForceReconnect}
              disabled={reconnecting}
              className="emergency-reconnect-button"
            >
              Force Reconnect
            </button>
          </div>
        )}
        
        {reconnecting && (
          <div className="reconnecting-indicator">
            Reconnecting...
          </div>
        )}
      </div>
      
      {lastError && (
        <div className="connection-error">
          {lastError}
        </div>
      )}
      
      <div className="connection-debug-toggle">
        <button onClick={() => setShowDebug(!showDebug)} className="debug-toggle-button">
          {showDebug ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {showDebug && (
        <div className="connection-debug-info">
          <div><strong>Status:</strong> {connected ? 'Connected' : 'Disconnected'}</div>
          <div><strong>Socket ID:</strong> {socketService.socket?.id || 'Not connected'}</div>
          <div><strong>Transport:</strong> {transport || 'N/A'}</div>
          <div><strong>Online:</strong> {navigator.onLine ? 'Yes' : 'No'}</div>
          <div><strong>Protocol:</strong> {window.location.protocol}</div>
          <div><strong>Host:</strong> {window.location.host}</div>
          <div><strong>ngrok URL:</strong> Check ngrokSocketConfig.ts</div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;