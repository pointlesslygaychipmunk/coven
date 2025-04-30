import React, { useState, useRef } from 'react'; // Removed unused useEffect
import './Journal.css'; // Ensure this uses new styles
import { JournalEntry, Rumor, RitualQuest, GameTime, Season, Player, MoonPhase } from 'coven-shared'; // Added MoonPhase

interface JournalProps {
  journal: JournalEntry[];
  rumors: Rumor[];
  rituals: RitualQuest[];
  time: GameTime;
  player: Player;
  onClaimRitual?: (ritualId: string) => void;
  onMarkRead?: (entryIds: (string | number)[]) => void; // Optional for now
}

// Helper to get season icon
const getSeasonIcon = (season: Season | undefined): string => {
    if (!season) return '?';
    return { 'Spring': '🌱', 'Summer': '☀️', 'Fall': '🍂', 'Winter': '❄️' }[season] || '?';
};

// Helper to get moon icon (simple version)
const getMoonIcon = (phase: MoonPhase | undefined): string => {
    if (!phase) return '❔';
    switch (phase) {
        case 'New Moon': return '🌑';
        case 'Waxing Crescent': return '🌒';
        case 'First Quarter': return '🌓';
        case 'Waxing Gibbous': return '🌔';
        case 'Full Moon': return '🌕';
        case 'Waning Gibbous': return '🌖';
        case 'Last Quarter': return '🌗';
        case 'Waning Crescent': return '🌘';
        default: return '❔';
    }
};


const Journal: React.FC<JournalProps> = ({
  journal = [],
  rumors = [],
  rituals = [],
  time,
  player,
  onClaimRitual,
  onMarkRead,
}) => {
  const [currentTab, setCurrentTab] = useState<'entries' | 'rituals' | 'rumors' | 'codex'>('entries');
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedEntryId, setExpandedEntryId] = useState<string | number | null>(null);
  const [bookmarkedEntryIds, setBookmarkedEntryIds] = useState<Set<string | number>>(new Set());
  const [bookmarkView, setBookmarkView] = useState<boolean>(false);
  const [turnMode, setTurnMode] = useState<boolean>(false); // List vs Book View
  const [focusedRitual, setFocusedRitual] = useState<RitualQuest | null>(null);

  const entriesListRef = useRef<HTMLDivElement>(null);
  // Refs for book mode (if animation needed later)
  // const bookRef = useRef<HTMLDivElement>(null);
  // const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  // const [activePage, setActivePage] = useState<number>(0); // For book view page turning

  const entriesPerPage = 8;

  // Calculate counts for badges
  const unreadCount = journal.filter(entry => !entry.readByPlayer).length;
  const activeRitualCount = rituals.filter(r => r.unlocked && !player.completedRituals.includes(r.id)).length;
  const rumorCount = rumors.length;

  // Filter and sort logic
  const getFilteredAndSortedEntries = () => {
    let entries = journal;
    const queryLower = searchQuery.toLowerCase();

    if (bookmarkView) {
      entries = entries.filter(entry => bookmarkedEntryIds.has(entry.id));
    } else if (filter !== 'all') {
      entries = entries.filter(entry => entry.category === filter);
    }

    if (searchQuery.length > 0) {
      entries = entries.filter(entry =>
        entry.text.toLowerCase().includes(queryLower) ||
        (entry.title?.toLowerCase().includes(queryLower)) ||
        entry.category.toLowerCase().includes(queryLower)
      );
    }
    return entries.sort((a, b) => b.turn - a.turn);
  };

  const filteredEntries = getFilteredAndSortedEntries();
  const pageCount = Math.ceil(filteredEntries.length / entriesPerPage);

  const getCurrentPageEntries = () => {
    return filteredEntries.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  };

  // Format date simply (e.g., "Phase, Day X")
  const formatDate = (dateStr: string, turn: number): string => {
      // Assuming dateStr is phase name from backend or similar
      return `${dateStr || `Day ${turn}`}`; // Simplified display
  };

  // Icons based on category
  const getCategoryIcon = (category: string): string => {
    return {
        'event': '📜', 'ritual': '✨', 'market': '💰', 'moon': '🌙',
        'season': getSeasonIcon(time.season), 'brewing': '🧪', 'garden': '🌿',
        'quest': '📝', 'debug': '🐞', 'discovery': '💡', 'error': '❌',
        'skill': '⭐', 'lore': '📖', 'town': '🏘️' // Added lore, town
    }[category] || '•';
  };

  // Entry importance class (simplified)
  const getEntryClass = (importance: number): string => {
    if (importance >= 4) return 'important'; // Combine very important and important visually
    if (importance >= 2) return 'standard'; // Combine standard and minor
    return 'trivial';
  };

  // Toggle bookmark
  const toggleBookmark = (entryId: string | number) => {
    setBookmarkedEntryIds(prev => {
      const newSet = new Set(prev);
      newSet.has(entryId) ? newSet.delete(entryId) : newSet.add(entryId);
      // TODO: Persist bookmarks if desired
      return newSet;
    });
  };

  // Toggle expanded entry
  const toggleExpanded = (entryId: string | number) => {
    setExpandedEntryId(prevId => prevId === entryId ? null : entryId);
     // Optional: Mark as read on expand
     if (onMarkRead && expandedEntryId !== entryId) {
         const entry = journal.find(e => e.id === entryId);
         if (entry && !entry.readByPlayer) {
             onMarkRead([entryId]);
         }
     }
  };

  // Pagination
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pageCount)));
    setExpandedEntryId(null);
    if (entriesListRef.current) entriesListRef.current.scrollTop = 0; // Scroll to top
  };

   // Ritual helpers
   const isRitualClaimed = (ritual: RitualQuest) => player.completedRituals.includes(ritual.id);
   const getRitualCompletion = (ritual: RitualQuest) => Math.round((ritual.stepsCompleted / ritual.totalSteps) * 100);
   const getRitualClass = (ritual: RitualQuest) => {
     if (isRitualClaimed(ritual)) return 'claimed';
     const completion = getRitualCompletion(ritual);
     if (completion === 100) return 'completed';
     if (completion > 0) return 'in-progress';
     return 'not-started';
   };

    const handleClaimClick = (e: React.MouseEvent, ritualId: string) => {
        e.stopPropagation();
        if (onClaimRitual) {
            onClaimRitual(ritualId);
            setFocusedRitual(null);
        }
    };

  // Render Functions

  const renderCategorySidebar = () => {
      const categoriesMap: { [key: string]: { name: string; icon: string; count: number } } = {
          all: { name: 'All Entries', icon: '📚', count: journal.length },
      };
      journal.forEach(entry => {
          if (!categoriesMap[entry.category]) {
              categoriesMap[entry.category] = { name: entry.category.charAt(0).toUpperCase() + entry.category.slice(1), icon: getCategoryIcon(entry.category), count: 0 };
          }
          categoriesMap[entry.category].count++;
      });
      const sortedCategories = Object.entries(categoriesMap).map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => (a.id === 'all' ? -1 : b.id === 'all' ? 1 : a.name.localeCompare(b.name)));

      return (
        <div className="journal-categories">
          <div className="categories-header"><h3>Categories</h3></div>
          <div className="category-list">
            {sortedCategories.map(category => (
              <div key={category.id} className={`category-item ${filter === category.id && !bookmarkView ? 'active' : ''}`}
                   onClick={() => { setFilter(category.id); setCurrentPage(1); setBookmarkView(false); setSearchQuery(''); }}>
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="category-count">{category.count}</span>
              </div>
            ))}
            <div className={`category-item ${bookmarkView ? 'active' : ''}`} onClick={() => { setBookmarkView(true); setFilter('all'); setCurrentPage(1); setSearchQuery(''); }}>
              <span className="category-icon">🔖</span>
              <span className="category-name">Bookmarked</span>
              <span className="category-count">{bookmarkedEntryIds.size}</span>
            </div>
          </div>
        </div>
      );
  };

  const renderEntriesList = () => {
      const entries = getCurrentPageEntries();
      const isSearching = searchQuery.length > 0;

      return (
          <div className="journal-entries">
              <div className="entries-header">
                  <div className="header-title">
                      <h3>
                          {isSearching ? `Search Results` :
                           bookmarkView ? 'Bookmarked' :
                           filter === 'all' ? 'All Entries' :
                           `${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
                      </h3>
                      {unreadCount > 0 && !bookmarkView && filter === 'all' && !isSearching && (
                          <div className="unread-badge">{unreadCount} New</div>
                      )}
                  </div>
                  <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                         placeholder="Search..." className="search-input" />
              </div>

              {entries.length === 0 ? (
                  <div className="empty-entries">
                      {isSearching ? <p>No matches found.</p> : bookmarkView ? <p>No bookmarks yet.</p> : <p>No entries here.</p>}
                  </div>
              ) : (
                  <>
                      <div className="entries-list" ref={entriesListRef}>
                          {entries.map(entry => (
                              <div key={entry.id} className={`journal-entry ${getEntryClass(entry.importance)} ${!entry.readByPlayer ? 'unread' : ''} ${expandedEntryId === entry.id ? 'expanded' : ''}`}>
                                  <div className="entry-header" onClick={() => toggleExpanded(entry.id)}>
                                      <div className="entry-category" title={entry.category}><span className="entry-icon">{getCategoryIcon(entry.category)}</span></div>
                                      <div className="entry-title">{entry.title || entry.text.substring(0, 40) + (entry.text.length > 40 ? '...' : '')}</div>
                                      <div className="entry-meta">
                                          <span className="entry-date" title={`Day ${entry.turn}, ${entry.date || ''}`}>{formatDate(entry.date, entry.turn)}</span>
                                      </div>
                                      <div className="entry-actions">
                                          <button className={`bookmark-btn ${bookmarkedEntryIds.has(entry.id) ? 'bookmarked' : ''}`}
                                                  onClick={(e) => { e.stopPropagation(); toggleBookmark(entry.id); }} title={bookmarkedEntryIds.has(entry.id) ? 'Unbookmark' : 'Bookmark'}>🔖</button>
                                          <button className="expand-btn" title={expandedEntryId === entry.id ? 'Collapse' : 'Expand'}>{expandedEntryId === entry.id ? '▼' : '▶'}</button>
                                      </div>
                                  </div>
                                  {expandedEntryId === entry.id && (
                                      <div className="entry-content"><p className="entry-text">{entry.text}</p></div>
                                  )}
                              </div>
                          ))}
                      </div>
                      {pageCount > 1 && (
                           <div className="pagination">
                              <button className="pagination-btn" onClick={() => goToPage(1)} disabled={currentPage === 1}>«</button>
                              <button className="pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>‹</button>
                              <span className="page-info">{currentPage} / {pageCount}</span>
                              <button className="pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === pageCount}>›</button>
                              <button className="pagination-btn" onClick={() => goToPage(pageCount)} disabled={currentPage === pageCount}>»</button>
                          </div>
                      )}
                  </>
              )}
          </div>
      );
  };

   const renderRituals = () => {
      const unlockedRituals = rituals.filter(ritual => ritual.unlocked);

      return (
          <div className="journal-rituals">
              <div className="rituals-header"><h3>Ritual Quests</h3></div>
              {unlockedRituals.length === 0 ? (
                  <div className="empty-rituals"><p>No active rituals.</p></div>
              ) : (
                  <div className="rituals-grid">
                      {unlockedRituals.map(ritual => (
                          <div key={ritual.id} className={`ritual-card ${getRitualClass(ritual)}`} onClick={() => setFocusedRitual(ritual)}>
                               <div className="ritual-card-header">
                                   <h4 className="ritual-name">{ritual.name}</h4>
                                   {getRitualCompletion(ritual) === 100 && !isRitualClaimed(ritual) && onClaimRitual && (
                                        <button className="claim-reward-button" onClick={(e) => handleClaimClick(e, ritual.id)} title="Claim Reward">Claim!</button>
                                   )}
                                  {isRitualClaimed(ritual) && <span className="claimed-badge" title="Claimed">✓</span>}
                                   {getRitualCompletion(ritual) < 100 && <div className="ritual-completion">{getRitualCompletion(ritual)}%</div>}
                              </div>
                              <div className="ritual-progress-bar"><div className="ritual-progress-fill" style={{ width: `${getRitualCompletion(ritual)}%` }}></div></div>
                              <div className="ritual-description">{ritual.description.substring(0, 70)}...</div>
                              <div className="ritual-requirements">
                                   {ritual.requiredMoonPhase && <div className="ritual-requirement" title={`Requires ${ritual.requiredMoonPhase}`}>{getMoonIcon(ritual.requiredMoonPhase)}</div>}
                                   {ritual.requiredSeason && <div className="ritual-requirement" title={`Requires ${ritual.requiredSeason}`}>{getSeasonIcon(ritual.requiredSeason)}</div>}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
              {/* Ritual Detail Modal */}
              {focusedRitual && (
                  <div className="ritual-modal-overlay" onClick={() => setFocusedRitual(null)}>
                      <div className="ritual-modal" onClick={(e) => e.stopPropagation()}>
                           <div className="ritual-modal-header">
                               <h3>{focusedRitual.name}</h3>
                               <button className="close-modal" onClick={() => setFocusedRitual(null)}>×</button>
                           </div>
                           <div className="ritual-modal-content">
                                <div className="ritual-progress-section">
                                    <div className="ritual-progress-circle">
                                         <svg className="progress-ring" width="60" height="60"> {/* Smaller circle */}
                                               <circle className="progress-ring-bg" r="27" cx="30" cy="30" />
                                               <circle className="progress-ring-circle" r="27" cx="30" cy="30" strokeDasharray={`${2 * Math.PI * 27}`} strokeDashoffset={`${2 * Math.PI * 27 * (1 - getRitualCompletion(focusedRitual) / 100)}`} />
                                           </svg>
                                         <div className="progress-text">{getRitualCompletion(focusedRitual)}%</div>
                                    </div>
                                    <div className="ritual-completion-text">{focusedRitual.stepsCompleted} / {focusedRitual.totalSteps} steps done</div>
                                </div>
                                <div className="ritual-description-full">{focusedRitual.description}</div>
                                 <div className="ritual-steps">
                                     <h4>Steps:</h4>
                                     <ul className="steps-list">
                                         {focusedRitual.steps.map((step, index) => (
                                             <li key={index} className={`ritual-step ${step.completed ? 'completed' : ''}`}>
                                                 <span className="step-check">{step.completed ? '✓' : '○'}</span>
                                                 <div className="step-details">
                                                     <span className="step-description">{step.description}</span>
                                                      {step.completedDate && <span className="step-completed-date">({step.completedDate})</span>}
                                                 </div>
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                                 <div className="ritual-requirements-full">
                                      <h4>Requires:</h4>
                                      <ul className="requirements-list">
                                         {!focusedRitual.requiredMoonPhase && !focusedRitual.requiredSeason && (!focusedRitual.requiredItems || focusedRitual.requiredItems.length === 0) && <li>None</li>}
                                         {focusedRitual.requiredMoonPhase && <li className="ritual-requirement"><span className="requirement-icon">{getMoonIcon(focusedRitual.requiredMoonPhase)}</span> <span className="requirement-label">Moon:</span><span className="requirement-text">{focusedRitual.requiredMoonPhase} {time.phaseName === focusedRitual.requiredMoonPhase && <span className='req-met'>(Active)</span>}</span></li>}
                                         {focusedRitual.requiredSeason && <li className="ritual-requirement"><span className="requirement-icon">{getSeasonIcon(focusedRitual.requiredSeason)}</span> <span className="requirement-label">Season:</span><span className="requirement-text">{focusedRitual.requiredSeason} {time.season === focusedRitual.requiredSeason && <span className='req-met'>(Active)</span>}</span></li>}
                                         {/* Add item requirements display */}
                                         {focusedRitual.requiredItems && focusedRitual.requiredItems.length > 0 && (
                                            <li className="ritual-requirement">
                                                <span className="requirement-icon">👜</span>
                                                <span className="requirement-label">Items:</span>
                                                <span className="requirement-text">
                                                    {focusedRitual.requiredItems.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                                                    {/* TODO: Add check if player has items */}
                                                </span>
                                            </li>
                                         )}
                                     </ul>
                                 </div>
                                  <div className="ritual-rewards">
                                      <h4>Rewards:</h4>
                                      <ul className="rewards-list">
                                          {focusedRitual.rewards.map((reward, index) => (
                                              <li key={index} className="reward-item">{`${reward.type}: ${reward.value} ${reward.quantity ? `(x${reward.quantity})` : ''}`}</li>
                                          ))}
                                      </ul>
                                  </div>
                                   {getRitualCompletion(focusedRitual) === 100 && !isRitualClaimed(focusedRitual) && onClaimRitual && (
                                        <button className="claim-reward-button modal-claim" onClick={(e) => handleClaimClick(e, focusedRitual.id)}>Claim Reward</button>
                                    )}
                                    {isRitualClaimed(focusedRitual) && (
                                         <div className="claimed-badge modal-claimed">✓ Reward Claimed</div>
                                    )}
                           </div>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const renderRumors = () => {
      const sortedRumors = [...rumors].sort((a, b) => (b.spread ?? 0) - (a.spread ?? 0));

      return (
        <div className="journal-rumors">
          <div className="rumors-header"><h3>Market Whispers</h3></div>
          {sortedRumors.length === 0 ? (
            <div className="empty-rumors"><p>The market is quiet...</p></div>
          ) : (
            <div className="rumors-list">
              {sortedRumors.map(rumor => {
                const spreadClass = (rumor.spread ?? 0) > 70 ? 'widespread' : (rumor.spread ?? 0) > 40 ? 'common' : 'rare';
                const priceEffectDirection = rumor.priceEffect ? (rumor.priceEffect > 0 ? 'up' : 'down') : '';
                return (
                  <div key={rumor.id} className={`rumor-card ${spreadClass}`}>
                    <p className="rumor-content">"{rumor.content}"</p>
                    <div className="rumor-meta">
                      <span className="rumor-source">— {rumor.origin}</span>
                      <span className="rumor-age">~{rumor.turnsActive || '?'}d ago</span>
                    </div>
                    {rumor.affectedItem && rumor.priceEffect && (
                      <div className={`rumor-effect`}>
                        <span className="effect-label">Affects:</span>
                        <span className="effect-value">{rumor.affectedItem}</span>
                        <span className={`effect-direction ${priceEffectDirection}`}>{priceEffectDirection === 'up' ? '▲' : priceEffectDirection === 'down' ? '▼' : ''}</span>
                      </div>
                    )}
                     {rumor.verified && <div className="rumor-verified" title="Verified">✓</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
  };

   const renderCodex = () => {
       // Placeholder - Needs real data structure for discovered items/lore
       return (
           <div className="journal-codex">
               <div className="codex-header"><h3>Witch's Codex</h3></div>
               <div className="codex-intro"><p>A collection of accumulated knowledge.</p></div>
               <div className="codex-categories">
                   <div className="codex-category">
                       <h4><span className="category-icon">🌿</span>Ingredients</h4>
                       <div className="codex-entries"><p className="unlockable">Discover ingredients...</p></div>
                   </div>
                   <div className="codex-category">
                        <h4><span className="category-icon">🧪</span>Potions</h4>
                        <div className="codex-entries"><p className="unlockable">Brew potions...</p></div>
                    </div>
                     <div className="codex-category">
                         <h4><span className="category-icon">✨</span>Charms & Talismans</h4>
                         <div className="codex-entries"><p className="unlockable">Craft items...</p></div>
                     </div>
                    {/* More categories */}
               </div>
           </div>
       );
   };

  const renderBookMode = () => {
       // Simple fixed 2-page spread representation
       const recentEntries = journal.slice(0, 4);
       const activeRituals = rituals.filter(r => r.unlocked && !isRitualClaimed(r)).slice(0, 2);
       const recentRumors = rumors.slice(0, 3);

       return (
           <div className="journal-book">
               {/* Left Page */}
               <div className="book-page-content left">
                   <h3>Recent Notes</h3>
                   {recentEntries.length === 0 ? <p>No recent entries.</p> : recentEntries.map(entry => (
                       <div key={entry.id} className="book-entry-short">
                           <strong>T{entry.turn}:</strong> {entry.text.substring(0, 70)}...
                       </div>
                   ))}
                   <hr style={{borderTop: '1px dashed #c8bba8', margin: '10px 0'}}/>
                   <h3>Active Rituals</h3>
                   {activeRituals.length === 0 ? <p>None active.</p> : activeRituals.map(ritual => (
                       <div key={ritual.id} className="book-ritual-short">
                           <strong>{ritual.name}</strong> ({getRitualCompletion(ritual)}% Complete)
                       </div>
                   ))}
               </div>
               {/* Right Page */}
               <div className="book-page-content right">
                   <h3>Market Whispers</h3>
                    {recentRumors.length === 0 ? <p>All quiet.</p> : recentRumors.map(rumor => (
                       <div key={rumor.id} className="book-rumor-short">
                           "{rumor.content.substring(0, 80)}..." <span className="source">({rumor.origin})</span>
                       </div>
                   ))}
                   <hr style={{borderTop: '1px dashed #c8bba8', margin: '10px 0'}}/>
                   <h3>Current Conditions</h3>
                   <div><strong>Moon:</strong> {time.phaseName} ({getMoonIcon(time.phaseName)})</div>
                   <div><strong>Season:</strong> {time.season} ({getSeasonIcon(time.season)})</div>
                   <div><strong>Weather:</strong> {time.weatherFate}</div>
               </div>
               {/* No page turning controls in this simple view */}
           </div>
       );
  };

  return (
    <div className="journal-container">
      <div className="journal-header">
        <h2><span className="section-icon">📖</span> Witch's Journal</h2>
         {/* Moved Toggles to the right */}
         <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
             <div className="journal-tabs">
               <button className={`journal-tab ${currentTab === 'entries' ? 'active' : ''}`} onClick={() => setCurrentTab('entries')}>
                 Entries {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
               </button>
               <button className={`journal-tab ${currentTab === 'rituals' ? 'active' : ''}`} onClick={() => setCurrentTab('rituals')}>
                 Rituals {activeRitualCount > 0 && <span className="badge">{activeRitualCount}</span>}
               </button>
               <button className={`journal-tab ${currentTab === 'rumors' ? 'active' : ''}`} onClick={() => setCurrentTab('rumors')}>
                  Rumors {rumorCount > 0 && <span className="badge">{rumorCount}</span>}
               </button>
               <button className={`journal-tab ${currentTab === 'codex' ? 'active' : ''}`} onClick={() => setCurrentTab('codex')}>
                  Codex
               </button>
             </div>
              <div className="journal-view-toggle">
                  <button className={`view-toggle-btn ${!turnMode ? 'active' : ''}`} onClick={() => setTurnMode(false)} title="List View">☰</button>
                  <button className={`view-toggle-btn ${turnMode ? 'active' : ''}`} onClick={() => setTurnMode(true)} title="Book View">📖</button>
              </div>
         </div>
      </div>

      <div className="journal-main">
        {turnMode ? renderBookMode() : (
          <div className="journal-content">
            {currentTab === 'entries' && renderCategorySidebar()}
            <div className="journal-main-content">
              {currentTab === 'entries' && renderEntriesList()}
              {currentTab === 'rituals' && renderRituals()}
              {currentTab === 'rumors' && renderRumors()}
              {currentTab === 'codex' && renderCodex()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;