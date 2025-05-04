import React, { useState, useRef, useEffect } from 'react';
import './MultiplayerMail.css';
import { useMultiplayer } from '../contexts/MultiplayerContext';

// Type imports from MultiplayerContext
interface MailAttachment {
  id: string;
  type: 'item' | 'recipe' | 'gold' | 'image';
  data: any;
}

interface MailMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  subject: string;
  content: string;
  attachments?: MailAttachment[];
  isRead: boolean;
  timestamp: number;
  expiresAt?: number;
}

interface MultiplayerMailProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const MultiplayerMail: React.FC<MultiplayerMailProps> = ({ 
  isExpanded = false, 
  onToggleExpand = () => {}
}) => {
  const { 
    isConnected, 
    isJoined,
    currentPlayer, 
    players, 
    mailbox, 
    unreadMailCount,
    sendMail, 
    readMail, 
    deleteMail 
  } = useMultiplayer();
  
  // Component state
  const [view, setView] = useState<'inbox' | 'compose' | 'read'>('inbox');
  const [selectedMail, setSelectedMail] = useState<MailMessage | null>(null);
  const [composeData, setComposeData] = useState({
    recipientId: '',
    subject: '',
    content: '',
    attachments: [] as MailAttachment[]
  });
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'unread'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  // Format timestamp to a readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Handle mail selection
  const handleSelectMail = (mail: MailMessage) => {
    setSelectedMail(mail);
    setView('read');
    
    if (!mail.isRead) {
      readMail(mail.id);
    }
  };
  
  // Handle sending mail
  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!composeData.recipientId || !composeData.subject || !composeData.content) {
      return; // Required fields missing
    }
    
    sendMail(
      composeData.recipientId,
      composeData.subject,
      composeData.content,
      composeData.attachments.length > 0 ? composeData.attachments : undefined
    );
    
    // Reset form and go back to inbox
    setComposeData({
      recipientId: '',
      subject: '',
      content: '',
      attachments: []
    });
    setView('inbox');
  };
  
  // Handle deleting mail
  const handleDeleteMail = () => {
    if (selectedMail) {
      deleteMail(selectedMail.id);
      setSelectedMail(null);
      setView('inbox');
    }
  };
  
  // Filter and sort mailbox
  const getFilteredMails = () => {
    let filtered = [...mailbox];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(mail => 
        mail.subject.toLowerCase().includes(term) || 
        mail.content.toLowerCase().includes(term) ||
        mail.senderName.toLowerCase().includes(term)
      );
    }
    
    // Apply sort
    switch (sortOrder) {
      case 'newest':
        return filtered.sort((a, b) => b.timestamp - a.timestamp);
      case 'oldest':
        return filtered.sort((a, b) => a.timestamp - b.timestamp);
      case 'unread':
        return filtered.sort((a, b) => {
          // First sort by read status
          if (a.isRead !== b.isRead) {
            return a.isRead ? 1 : -1;
          }
          // Then by date (newest first)
          return b.timestamp - a.timestamp;
        });
      default:
        return filtered;
    }
  };
  
  // Effect to resize compose content textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [composeData.content]);
  
  // Render the mail inbox view
  const renderInbox = () => {
    const filteredMails = getFilteredMails();
    
    return (
      <div className="mail-inbox">
        <div className="mail-toolbar">
          <div className="search-bar">
            <input
              type="text"
              placeholder="SEARCH.COM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search" 
                onClick={() => setSearchTerm('')}
              >
                X
              </button>
            )}
          </div>
          
          <div className="sort-options">
            <span>SORT:</span>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="sort-select"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="unread">Unread First</option>
            </select>
          </div>
          
          <button
            className="compose-button"
            onClick={() => setView('compose')}
            disabled={!isConnected || !isJoined}
          >
            COMPOSE
          </button>
        </div>
        
        <div className="mail-list">
          {filteredMails.length === 0 ? (
            <div className="empty-mailbox">
              <p>NO MAIL FOUND. YOUR INBOX IS EMPTY.</p>
            </div>
          ) : (
            filteredMails.map(mail => (
              <div
                key={mail.id}
                className={`mail-item ${mail.isRead ? '' : 'unread'}`}
                onClick={() => handleSelectMail(mail)}
              >
                <div className="mail-item-header">
                  <div className="mail-sender">{mail.senderName}</div>
                  <div className="mail-date">{formatDate(mail.timestamp)}</div>
                </div>
                <div className="mail-subject">{mail.subject}</div>
                <div className="mail-preview">
                  {mail.content.substring(0, 60)}
                  {mail.content.length > 60 ? '...' : ''}
                </div>
                {!mail.isRead && <div className="unread-indicator">NEW</div>}
                {mail.attachments && mail.attachments.length > 0 && (
                  <div className="attachment-indicator">📎</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };
  
  // Render the mail composition view
  const renderComposeView = () => {
    const availableRecipients = players.filter(
      player => currentPlayer && player.playerId !== currentPlayer.playerId
    );
    
    return (
      <div className="mail-compose">
        <div className="compose-header">
          <h3>COMPOSE NEW MESSAGE</h3>
          <button 
            className="back-button" 
            onClick={() => setView('inbox')}
          >
            BACK
          </button>
        </div>
        
        <form onSubmit={handleSendMail} className="compose-form">
          <div className="form-group">
            <label htmlFor="recipient">TO:</label>
            <select
              id="recipient"
              value={composeData.recipientId}
              onChange={(e) => setComposeData({...composeData, recipientId: e.target.value})}
              required
              className="recipient-select"
            >
              <option value="">Select recipient...</option>
              {availableRecipients.map(player => (
                <option key={player.playerId} value={player.playerId}>
                  {player.playerName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">SUBJECT:</label>
            <input
              id="subject"
              type="text"
              value={composeData.subject}
              onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
              required
              className="subject-input"
              placeholder="Enter subject..."
              maxLength={50}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">MESSAGE:</label>
            <textarea
              id="content"
              ref={contentRef}
              value={composeData.content}
              onChange={(e) => setComposeData({...composeData, content: e.target.value})}
              required
              className="content-textarea"
              placeholder="Enter your message..."
              rows={5}
            />
          </div>
          
          {/* Attachments would go here in a full implementation */}
          
          <div className="compose-actions">
            <button 
              type="submit" 
              className="send-button"
              disabled={!composeData.recipientId || !composeData.subject || !composeData.content}
            >
              SEND MESSAGE
            </button>
            <button 
              type="button" 
              className="cancel-button" 
              onClick={() => setView('inbox')}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  // Render the mail reading view
  const renderReadView = () => {
    if (!selectedMail) return null;
    
    return (
      <div className="mail-read">
        <div className="read-header">
          <button 
            className="back-button" 
            onClick={() => {
              setSelectedMail(null);
              setView('inbox');
            }}
          >
            BACK TO INBOX
          </button>
          <button 
            className="delete-button" 
            onClick={handleDeleteMail}
          >
            DELETE
          </button>
        </div>
        
        <div className="mail-details">
          <h3 className="mail-subject">{selectedMail.subject}</h3>
          
          <div className="mail-metadata">
            <div className="metadata-row">
              <span className="metadata-label">FROM:</span>
              <span className="metadata-value">{selectedMail.senderName}</span>
            </div>
            <div className="metadata-row">
              <span className="metadata-label">DATE:</span>
              <span className="metadata-value">{formatDate(selectedMail.timestamp)}</span>
            </div>
          </div>
          
          <div className="mail-content">
            {selectedMail.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {selectedMail.attachments && selectedMail.attachments.length > 0 && (
            <div className="mail-attachments">
              <h4>ATTACHMENTS:</h4>
              <div className="attachments-list">
                {selectedMail.attachments.map(attachment => (
                  <div key={attachment.id} className="attachment-item">
                    {renderAttachment(attachment)}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="reply-actions">
            <button 
              className="reply-button" 
              onClick={() => {
                setComposeData({
                  recipientId: selectedMail.senderId,
                  subject: `RE: ${selectedMail.subject}`,
                  content: '',
                  attachments: []
                });
                setView('compose');
              }}
            >
              REPLY
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Helper to render attachments based on their type
  const renderAttachment = (attachment: MailAttachment) => {
    switch (attachment.type) {
      case 'item':
        return (
          <div className="item-attachment">
            <div className="item-icon">📦</div>
            <div className="item-name">{attachment.data.name || 'Item'}</div>
          </div>
        );
      case 'recipe':
        return (
          <div className="recipe-attachment">
            <div className="recipe-icon">📜</div>
            <div className="recipe-name">{attachment.data.name || 'Recipe'}</div>
          </div>
        );
      case 'gold':
        return (
          <div className="gold-attachment">
            <div className="gold-icon">💰</div>
            <div className="gold-amount">{attachment.data} gold</div>
          </div>
        );
      case 'image':
        return (
          <div className="image-attachment">
            <img 
              src={attachment.data} 
              alt="Attached image" 
              className="attachment-image"
            />
          </div>
        );
      default:
        return (
          <div className="unknown-attachment">
            <div className="unknown-icon">❓</div>
            <div className="unknown-name">Unknown Attachment</div>
          </div>
        );
    }
  };
  
  // Main render
  return (
    <div className={`multiplayer-mail ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="mail-header" onClick={onToggleExpand}>
        <div className="header-title">
          <div className="pixel-icon pixel-icon-mail"></div>
          <h3>MAIL.SYS {isExpanded ? '[▼]' : '[▲]'}</h3>
        </div>
        <div className="mail-status">
          <span className={`connection-dot ${isConnected ? 'online' : 'offline'}`}></span>
          {unreadMailCount > 0 && (
            <span className="unread-count">{unreadMailCount}</span>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="mail-content-container">
          {!isConnected ? (
            <div className="mail-disconnected">
              <p>NOT CONNECTED TO MAIL SERVER</p>
              <p>PLEASE ESTABLISH CONNECTION FIRST</p>
            </div>
          ) : !isJoined ? (
            <div className="mail-not-joined">
              <p>PLEASE JOIN THE NETWORK TO ACCESS MAIL SYSTEM</p>
            </div>
          ) : (
            <>
              {view === 'inbox' && renderInbox()}
              {view === 'compose' && renderComposeView()}
              {view === 'read' && renderReadView()}
            </>
          )}
          
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

export default MultiplayerMail;