import React, { useState, useEffect } from 'react';
import './Journal90s.css';

// Custom JournalEntry type for our UI component
// This differs from the shared type but works for our UI
interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: number;
  type: 'quest' | 'event' | 'discovery' | 'lore';
  tags?: string[];
}

interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  rewards?: string[];
  progress?: number;
  steps?: { description: string; completed: boolean }[];
}

interface Ritual {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  rewards: string[];
  completed: boolean;
  available: boolean;
}

interface PlayerData {
  id: string;
  name: string;
  atelierLevel: number;
  atelierSpecialization?: string;
  reputation: number;
  ritualPoints: number;
}

interface GameTime {
  dayCount: number;
  phaseName: string; // Moon phase
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter';
}

interface Journal90sProps {
  journal: JournalEntry[];
  quests: Quest[];
  rituals: Ritual[];
  time: GameTime;
  player: PlayerData;
  onClaimRitual: (ritualId: string) => void;
}

const Journal90s: React.FC<Journal90sProps> = ({
  journal = [],
  quests = [],
  rituals = [],
  time,
  player,
  onClaimRitual
}) => {
  // State for active journal section
  const [activeSection, setActiveSection] = useState<string>('journal');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);
  const [filterTag, setFilterTag] = useState<string>('all');
  const [journalPageEffect, setJournalPageEffect] = useState<boolean>(false);
  
  // All available tags from journal entries
  const allTags = Array.from(
    new Set(
      journal.flatMap(entry => entry.tags || [])
    )
  );
  
  // Reset selection when changing section
  useEffect(() => {
    setSelectedEntry(null);
    setSelectedQuest(null);
    setSelectedRitual(null);
    setFilterTag('all');
    
    // Page turning effect
    setJournalPageEffect(true);
    const timer = setTimeout(() => {
      setJournalPageEffect(false);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [activeSection]);
  
  // Handle journal entry selection
  const handleEntrySelect = (entry: JournalEntry) => {
    setSelectedEntry(prev => prev?.id === entry.id ? null : entry);
  };
  
  // Handle quest selection
  const handleQuestSelect = (quest: Quest) => {
    setSelectedQuest(prev => prev?.id === quest.id ? null : quest);
  };
  
  // Handle ritual selection
  const handleRitualSelect = (ritual: Ritual) => {
    setSelectedRitual(prev => prev?.id === ritual.id ? null : ritual);
  };
  
  // Handle claiming a ritual reward
  const handleClaimRitual = () => {
    if (!selectedRitual || !selectedRitual.available || selectedRitual.completed) return;
    
    onClaimRitual(selectedRitual.id);
  };
  
  // Helper to format a date string - ignores timestamp and uses game time
  const formatDate = (/* timestamp: number */) => {
    // In a real game, we'd use the timestamp (parameter commented out for linting)
    // For this demo, we'll just show the day and moon phase from game time
    return `Day ${time.dayCount}, ${time.phaseName}, ${time.season}`;
  };
  
  // Render filtered journal entries
  const renderJournalEntries = () => {
    let filteredEntries = journal;
    
    // Apply tag filter
    if (filterTag !== 'all') {
      filteredEntries = journal.filter(entry => entry.tags?.includes(filterTag));
    }
    
    // Sort by date, newest first
    filteredEntries = [...filteredEntries].sort((a, b) => b.date - a.date);
    
    if (filteredEntries.length === 0) {
      return (
        <div className="empty-entries">
          <p>No journal entries found. Your journey has just begun...</p>
        </div>
      );
    }
    
    return (
      <div className="journal-entries">
        {filteredEntries.map(entry => (
          <div 
            key={entry.id}
            className={`journal-entry ${selectedEntry?.id === entry.id ? 'selected' : ''} ${entry.type}`}
            onClick={() => handleEntrySelect(entry)}
          >
            <div className="entry-header">
              <div className="entry-title">{entry.title}</div>
              <div className="entry-date">{formatDate()}</div>
            </div>
            <div className="entry-preview">
              {entry.content.substring(0, 80)}...
            </div>
            {entry.tags && entry.tags.length > 0 && (
              <div className="entry-tags">
                {entry.tags.map(tag => (
                  <span key={tag} className="entry-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render quests list
  const renderQuests = () => {
    if (quests.length === 0) {
      return (
        <div className="empty-quests">
          <p>No active quests. Visit the town to find opportunities.</p>
        </div>
      );
    }
    
    // Group quests by status
    const activeQuests = quests.filter(q => q.status === 'active');
    const completedQuests = quests.filter(q => q.status === 'completed');
    const failedQuests = quests.filter(q => q.status === 'failed');
    
    return (
      <div className="quests-list">
        <div className="quest-section">
          <div className="section-header">Active Quests</div>
          {activeQuests.length === 0 ? (
            <p className="empty-section">No active quests.</p>
          ) : (
            activeQuests.map(quest => (
              <div 
                key={quest.id}
                className={`quest-item active ${selectedQuest?.id === quest.id ? 'selected' : ''}`}
                onClick={() => handleQuestSelect(quest)}
              >
                <div className="quest-title">{quest.title}</div>
                {quest.progress !== undefined && (
                  <div className="quest-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${quest.progress}%` }}></div>
                    </div>
                    <div className="progress-value">{quest.progress}%</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {completedQuests.length > 0 && (
          <div className="quest-section">
            <div className="section-header">Completed Quests</div>
            {completedQuests.map(quest => (
              <div 
                key={quest.id}
                className={`quest-item completed ${selectedQuest?.id === quest.id ? 'selected' : ''}`}
                onClick={() => handleQuestSelect(quest)}
              >
                <div className="quest-title">{quest.title}</div>
              </div>
            ))}
          </div>
        )}
        
        {failedQuests.length > 0 && (
          <div className="quest-section">
            <div className="section-header">Failed Quests</div>
            {failedQuests.map(quest => (
              <div 
                key={quest.id}
                className={`quest-item failed ${selectedQuest?.id === quest.id ? 'selected' : ''}`}
                onClick={() => handleQuestSelect(quest)}
              >
                <div className="quest-title">{quest.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render rituals list
  const renderRituals = () => {
    if (rituals.length === 0) {
      return (
        <div className="empty-rituals">
          <p>No rituals discovered yet. Explore and learn from the townsfolk.</p>
        </div>
      );
    }
    
    // Group rituals by availability
    const availableRituals = rituals.filter(r => r.available && !r.completed);
    const completedRituals = rituals.filter(r => r.completed);
    const lockedRituals = rituals.filter(r => !r.available && !r.completed);
    
    return (
      <div className="rituals-list">
        <div className="ritual-points">
          <span className="points-label">Ritual Points:</span>
          <span className="points-value">{player.ritualPoints}</span>
        </div>
        
        <div className="ritual-section">
          <div className="section-header">Available Rituals</div>
          {availableRituals.length === 0 ? (
            <p className="empty-section">No available rituals.</p>
          ) : (
            availableRituals.map(ritual => (
              <div 
                key={ritual.id}
                className={`ritual-item available ${selectedRitual?.id === ritual.id ? 'selected' : ''}`}
                onClick={() => handleRitualSelect(ritual)}
              >
                <div className="ritual-title">{ritual.name}</div>
              </div>
            ))
          )}
        </div>
        
        {completedRituals.length > 0 && (
          <div className="ritual-section">
            <div className="section-header">Completed Rituals</div>
            {completedRituals.map(ritual => (
              <div 
                key={ritual.id}
                className={`ritual-item completed ${selectedRitual?.id === ritual.id ? 'selected' : ''}`}
                onClick={() => handleRitualSelect(ritual)}
              >
                <div className="ritual-title">{ritual.name}</div>
              </div>
            ))}
          </div>
        )}
        
        {lockedRituals.length > 0 && (
          <div className="ritual-section">
            <div className="section-header">Locked Rituals</div>
            {lockedRituals.map(ritual => (
              <div 
                key={ritual.id}
                className={`ritual-item locked ${selectedRitual?.id === ritual.id ? 'selected' : ''}`}
                onClick={() => handleRitualSelect(ritual)}
              >
                <div className="ritual-title">{ritual.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render journal entry details
  const renderJournalEntryDetails = () => {
    if (!selectedEntry) {
      return (
        <div className="journal-page empty">
          <p>Select an entry to read.</p>
        </div>
      );
    }
    
    return (
      <div className={`journal-page ${journalPageEffect ? 'page-turn' : ''}`}>
        <div className="journal-page-date">{formatDate()}</div>
        <h3 className="journal-page-title">{selectedEntry.title}</h3>
        <div className="journal-page-content">{selectedEntry.content}</div>
        
        {selectedEntry.tags && selectedEntry.tags.length > 0 && (
          <div className="journal-page-tags">
            {selectedEntry.tags.map(tag => (
              <span key={tag} className="page-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render quest details
  const renderQuestDetails = () => {
    if (!selectedQuest) {
      return (
        <div className="journal-page empty">
          <p>Select a quest to view details.</p>
        </div>
      );
    }
    
    return (
      <div className={`journal-page ${journalPageEffect ? 'page-turn' : ''}`}>
        <div className="quest-status-badge">{selectedQuest.status}</div>
        <h3 className="journal-page-title">{selectedQuest.title}</h3>
        <div className="journal-page-content">{selectedQuest.description}</div>
        
        {selectedQuest.steps && selectedQuest.steps.length > 0 && (
          <div className="quest-steps">
            <h4>Quest Steps:</h4>
            <ul className="steps-list">
              {selectedQuest.steps.map((step, index) => (
                <li key={index} className={step.completed ? 'completed' : ''}>
                  {step.description}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {selectedQuest.rewards && selectedQuest.rewards.length > 0 && (
          <div className="quest-rewards">
            <h4>Rewards:</h4>
            <ul className="rewards-list">
              {selectedQuest.rewards.map((reward, index) => (
                <li key={index}>{reward}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  // Render ritual details
  const renderRitualDetails = () => {
    if (!selectedRitual) {
      return (
        <div className="journal-page empty">
          <p>Select a ritual to view details.</p>
        </div>
      );
    }
    
    return (
      <div className={`journal-page ${journalPageEffect ? 'page-turn' : ''}`}>
        <div className={`ritual-status-badge ${selectedRitual.completed ? 'completed' : selectedRitual.available ? 'available' : 'locked'}`}>
          {selectedRitual.completed ? 'Completed' : selectedRitual.available ? 'Available' : 'Locked'}
        </div>
        <h3 className="journal-page-title">{selectedRitual.name}</h3>
        <div className="journal-page-content">{selectedRitual.description}</div>
        
        <div className="ritual-details">
          <div className="ritual-requirements">
            <h4>Requirements:</h4>
            <ul className="requirements-list">
              {selectedRitual.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
          
          <div className="ritual-rewards">
            <h4>Rewards:</h4>
            <ul className="rewards-list">
              {selectedRitual.rewards.map((reward, index) => (
                <li key={index}>{reward}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {selectedRitual.available && !selectedRitual.completed && (
          <button 
            className="journal-button claim-ritual"
            onClick={handleClaimRitual}
          >
            Perform Ritual
          </button>
        )}
      </div>
    );
  };
  
  return (
    <div className="journal90s-container">
      <div className="journal-header">
        <h2>Witch's Journal</h2>
        <div className="journal-date">{formatDate()}</div>
      </div>
      
      <div className="journal-tabs">
        <button 
          className={`journal-tab ${activeSection === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveSection('journal')}
        >
          Journal
        </button>
        <button 
          className={`journal-tab ${activeSection === 'quests' ? 'active' : ''}`}
          onClick={() => setActiveSection('quests')}
        >
          Quests
        </button>
        <button 
          className={`journal-tab ${activeSection === 'rituals' ? 'active' : ''}`}
          onClick={() => setActiveSection('rituals')}
        >
          Rituals
        </button>
      </div>
      
      <div className="journal-main">
        <div className="journal-sidebar">
          {activeSection === 'journal' && (
            <>
              <div className="filter-container">
                <label className="filter-label">Filter:</label>
                <select 
                  className="filter-dropdown"
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                >
                  <option value="all">All Entries</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              {renderJournalEntries()}
            </>
          )}
          
          {activeSection === 'quests' && renderQuests()}
          
          {activeSection === 'rituals' && renderRituals()}
        </div>
        
        <div className="journal-content">
          {activeSection === 'journal' && renderJournalEntryDetails()}
          {activeSection === 'quests' && renderQuestDetails()}
          {activeSection === 'rituals' && renderRitualDetails()}
        </div>
      </div>
      
      {/* Decorative corners */}
      <div className="corner-decoration top-left"></div>
      <div className="corner-decoration top-right"></div>
      <div className="corner-decoration bottom-left"></div>
      <div className="corner-decoration bottom-right"></div>
    </div>
  );
};

export default Journal90s;