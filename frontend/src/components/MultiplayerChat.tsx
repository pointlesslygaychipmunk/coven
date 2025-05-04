import React, { useState, useEffect, useRef } from 'react';
import './MultiplayerChat.css';
import './pixelIcons.css';
import { useMultiplayer } from '../contexts/MultiplayerContext';

interface MultiplayerChatProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const MultiplayerChat: React.FC<MultiplayerChatProps> = ({ 
  isExpanded = false, 
  onToggleExpand = () => {} 
}) => {
  const { isConnected, isJoined, currentPlayer, players, messages, sendMessage } = useMultiplayer();
  const [inputMessage, setInputMessage] = useState('');
  const [chatFilter, setChatFilter] = useState<'all' | 'direct'>('all');
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
    
    // Support whisper commands with format: "@username message"
    if (inputMessage.startsWith('@')) {
      const spaceIndex = inputMessage.indexOf(' ');
      if (spaceIndex > 1) {
        const recipient = inputMessage.substring(1, spaceIndex);
        const whisperMessage = inputMessage.substring(spaceIndex + 1);
        
        // Find recipient player
        const recipientPlayer = players.find(p => 
          p.playerName.toLowerCase() === recipient.toLowerCase()
        );
        
        if (recipientPlayer && whisperMessage.trim()) {
          // In a real implementation, we would send a direct message
          // For now, just send it as a regular message with a whisper prefix
          sendMessage(`[WHISPER TO ${recipient}] ${whisperMessage}`);
          setInputMessage('');
          return;
        }
      }
    }
    
    // Regular message
    sendMessage(inputMessage);
    setInputMessage('');
  };
  
  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Filter messages based on selection
  const getFilteredMessages = () => {
    if (chatFilter === 'all') {
      return messages;
    }
    
    // Only show direct messages (whispers)
    return messages.filter(msg => {
      const isWhisper = msg.message.startsWith('[WHISPER');
      const isCurrentUserInvolved = 
        (isWhisper && currentPlayer && 
         (msg.senderId === currentPlayer.playerId || 
          msg.message.includes(`[WHISPER TO ${currentPlayer.playerName}]`)));
      
      return isWhisper && isCurrentUserInvolved;
    });
  };
  
  return (
    <div className={`multiplayer-chat pixelated ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="chat-header" onClick={onToggleExpand}>
        <div className="header-title">
          <div className="pixel-icon pixel-icon-chat"></div>
          <h3>CHAT.SYS {isExpanded ? '[▼]' : '[▲]'}</h3>
        </div>
        <div className="online-indicator">
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
          <span className="online-count">{players.length}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="chat-container">
          <div className="chat-options">
            <div className="chat-filter">
              <span>FILTER:</span>
              <select 
                value={chatFilter}
                onChange={(e) => setChatFilter(e.target.value as 'all' | 'direct')}
                className="filter-select"
              >
                <option value="all">All Messages</option>
                <option value="direct">Direct Messages</option>
              </select>
            </div>
            
            <div className="chat-users-dropdown">
              <span>USERS:</span>
              <select className="users-select">
                <option value="">Select to whisper...</option>
                {players
                  .filter(p => currentPlayer && p.playerId !== currentPlayer.playerId)
                  .map(player => (
                    <option 
                      key={player.playerId} 
                      value={player.playerName}
                      onClick={() => setInputMessage(`@${player.playerName} `)}
                    >
                      {player.playerName}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>
          
          <div className="messages-container">
            {getFilteredMessages().length === 0 ? (
              <div className="empty-chat">
                <p>NO MESSAGES FOUND. SYSTEM AWAITING INPUT...</p>
              </div>
            ) : (
              getFilteredMessages().map((msg, index) => {
                const isCurrentUser = currentPlayer && msg.senderId === currentPlayer.playerId;
                const isWhisper = msg.message.startsWith('[WHISPER');
                
                return (
                  <div
                    key={`${msg.senderId}-${msg.timestamp}-${index}`}
                    className={`message-bubble ${isCurrentUser ? 'self' : 'other'} ${isWhisper ? 'whisper' : ''}`}
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
              placeholder="ENTER MESSAGE... (@USERNAME FOR WHISPER)"
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
          
          <div className="chat-help">
            <div className="help-title">CHAT COMMANDS:</div>
            <div className="help-command">@username [message] - Send direct message</div>
          </div>
          
          {/* Decorative corners for Sierra aesthetic */}
          <div className="corner-decoration top-left"></div>
          <div className="corner-decoration top-right"></div>
          <div className="corner-decoration bottom-left"></div>
          <div className="corner-decoration bottom-right"></div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerChat;