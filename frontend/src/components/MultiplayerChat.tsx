import React, { useState, useEffect, useRef } from 'react';
import './MultiplayerChat.css';
import { useMultiplayer } from '../contexts/MultiplayerContext';

const MultiplayerChat: React.FC = () => {
  const { isConnected, isJoined, currentPlayer, players, messages, sendMessage } = useMultiplayer();
  const [inputMessage, setInputMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !isConnected || !isJoined) {
      return;
    }
    
    sendMessage(inputMessage);
    setInputMessage('');
  };
  
  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`multiplayer-chat ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="chat-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>CHAT.SYS {isExpanded ? '[▼]' : '[▲]'}</h3>
        <div className="online-indicator">
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
          <span className="online-count">{players.length}</span>
        </div>
      </div>
      
      <div className="chat-content">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <p>NO MESSAGES FOUND. SYSTEM AWAITING INPUT...</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = currentPlayer && msg.senderId === currentPlayer.playerId;
              
              return (
                <div
                  key={`${msg.senderId}-${msg.timestamp}-${index}`}
                  className={`message-bubble ${isCurrentUser ? 'self' : 'other'}`}
                >
                  <div className="message-header">
                    <span className="sender-name">{isCurrentUser ? 'You' : msg.senderName}</span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="message-content">{msg.message}</div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="message-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="message-input"
            placeholder="ENTER MESSAGE..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!isConnected || !isJoined}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!inputMessage.trim() || !isConnected || !isJoined}
          >
            SEND
          </button>
        </form>
      </div>
      
      {isExpanded && (
        <div className="chat-players-list">
          <h4>USERS.LST - CONNECTED [{players.length}]</h4>
          <ul>
            {players.map(player => (
              <li key={player.playerId} className={currentPlayer?.playerId === player.playerId ? 'current-player' : ''}>
                {player.playerName} {currentPlayer?.playerId === player.playerId && ' [YOU]'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiplayerChat;