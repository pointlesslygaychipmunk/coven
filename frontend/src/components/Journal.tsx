import React, { useState, useEffect, useRef } from 'react';
import './Journal.css';
import { JournalEntry, Rumor, RitualQuest, GameTime, Season, Player } from 'coven-shared';

interface JournalProps {
  journal: JournalEntry[];
  rumors: Rumor[];
  rituals: RitualQuest[];
  time: GameTime;
  onMarkRead?: (entryIds: (string | number)[]) => void;
  player: Player;
  onClaimRitual?: (ritualId: string) => void;
}

const Journal: React.FC<JournalProps> = ({
  journal = [],
  rumors = [],
  rituals = [],
  time,
  onMarkRead,
  player,
  onClaimRitual
}) => {
  // State
  const [currentTab, setCurrentTab] = useState<'entries' | 'rituals' | 'rumors' | 'codex'>('entries');
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedEntryId, setExpandedEntryId] = useState<string | number | null>(null);
  const [bookmarkedEntryIds, setBookmarkedEntryIds] = useState<Set<string | number>>(new Set());
  const [bookmarkView, setBookmarkView] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<number>(0);
  const [turnMode, setTurnMode] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [focusedRitual, setFocusedRitual] = useState<RitualQuest | null>(null);
  const [pageTransition, setPageTransition] = useState<'none' | 'turning'>('none');
  const [lastDirection, setLastDirection] = useState<'next' | 'prev'>('next');
  
  // 90s Easter Egg: Secret journal entry
  const [secretCodeActive, setSecretCodeActive] = useState<boolean>(false);
  const [secretCodeProgress, setSecretCodeProgress] = useState<string>('');
  const secretCode = "witch";

  // Refs
  const bookRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const entriesListRef = useRef<HTMLDivElement>(null);

  // Constants
  const entriesPerPage = 8;

  // Calculate unread count
  const unreadCount = journal.filter(entry => !entry.readByPlayer).length;

  // 90s Easter Egg: Secret code detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Add the key to our progress if it matches the next letter in the secret code
      if (secretCode[secretCodeProgress.length] === key) {
        const newProgress = secretCodeProgress + key;
        setSecretCodeProgress(newProgress);
        
        // Check if we've completed the code
        if (newProgress === secretCode) {
          setSecretCodeActive(true);
          setSecretCodeProgress(''); // Reset for next time
          console.log("🔮 SECRET JOURNAL ENTRY UNLOCKED! 🔮");
          
          // Reset after 30 seconds
          setTimeout(() => {
            setSecretCodeActive(false);
          }, 30000);
        }
      } else {
        // Reset progress if wrong key is pressed
        setSecretCodeProgress('');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [secretCodeProgress]);

  // Mark entries as read when they become visible
  useEffect(() => {
    if (currentTab === 'entries' && !turnMode && onMarkRead) {
      const listElement = entriesListRef.current;
      if (!listElement) return;

      const entriesOnPage = getCurrentPageEntries();
      const unreadIdsToMark: (string | number)[] = [];

      entriesOnPage.forEach(entry => {
        if (!entry.readByPlayer) {
          unreadIdsToMark.push(entry.id);
        }
      });

      if (unreadIdsToMark.length > 0 && onMarkRead) {
        onMarkRead(unreadIdsToMark);
      }
    }
    
    // Added return function to fix TypeScript error
    return () => {};
  }, [journal, currentTab, currentPage, turnMode, onMarkRead]);

  // Handle page transition animation
  useEffect(() => {
    if (pageTransition === 'turning') {
      const timer = setTimeout(() => {
        setPageTransition('none');
      }, 800); // Match this with CSS animation duration

      return () => clearTimeout(timer);
    }
    
    // Added return function to fix TypeScript error when no timer is set
    return () => {};
  }, [pageTransition]);

  // Reset pages when not in turn mode or tab changes
  useEffect(() => {
    resetPages();
    
    // Return function needed
    return () => {};
  }, [turnMode, currentTab]);

  const resetPages = () => {
    pageRefs.current.forEach((page) => {
      if (page) page.style.transform = 'rotateY(0deg)';
    });
    setActivePage(0);
  };

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(query.length > 0);
    setCurrentPage(1);
  };

  // Filter and sort logic
  const getFilteredAndSortedEntries = () => {
    let entries = journal;

    if (bookmarkView) {
      entries = entries.filter(entry => bookmarkedEntryIds.has(entry.id));
    } else if (filter !== 'all') {
      entries = entries.filter(entry => entry.category === filter);
    }

    if (isSearching) {
      const queryLower = searchQuery.toLowerCase();
      entries = entries.filter(entry =>
        entry.text.toLowerCase().includes(queryLower) ||
        (entry.title?.toLowerCase().includes(queryLower)) ||
        entry.category.toLowerCase().includes(queryLower)
      );
    }

    // Add in the secret easter egg entry when code is active
    if (secretCodeActive && !isSearching && filter === 'all' && !bookmarkView) {
      const secretEntry: JournalEntry = {
        id: "secret-90s-entry",
        turn: 90,
        date: "HIDDEN DATE",
        text: "🎮 You have discovered the secret journal page! This special entry was written by the ancient witches of the 90s. They speak of legends like 'pogs', 'tamagotchis', and strange rituals involving 'dial-up internet'. Their wisdom suggests speaking the magic word 'RadicalWitch' to the market vendor may yield unexpected results... 🎮",
        category: "easter egg",
        importance: 5,
        readByPlayer: true,
        title: "TOTALLY RADICAL SECRET ENTRY"
      };
      entries = [secretEntry, ...entries];
    }

    // Sort newest first
    return entries.sort((a, b) => b.turn - a.turn);
  };

  const filteredEntries = getFilteredAndSortedEntries();
  const pageCount = Math.ceil(filteredEntries.length / entriesPerPage);

  const getCurrentPageEntries = () => {
    return filteredEntries.slice(
      (currentPage - 1) * entriesPerPage,
      currentPage * entriesPerPage
    );
  };

  // Get entries for book mode (split across pages)
  const getBookPageEntries = (pageIndex: number) => {
    const entriesPerBookPage = 4; // Fewer entries per page for book mode
    const startIdx = pageIndex * entriesPerBookPage;
    return filteredEntries.slice(startIdx, startIdx + entriesPerBookPage);
  };

  // Format date
  const formatDate = (dateStr: string) => dateStr;

  // Fixed getSeasonIcon function in Journal.tsx with fallback
  const getSeasonIcon = (season: Season): string => {
    const icons: Record<Season, string> = {
      'Spring': '🌱', 
      'Summer': '☀️', 
      'Fall': '🍂', 
      'Winter': '❄️'
    };
    return icons[season] || '?'; // Add fallback return value
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'event': '📜',
      'ritual': '✨',
      'market': '💰',
      'moon': '🌙',
      'season': getSeasonIcon(time.season),
      'brewing': '🧪',
      'garden': '🌿',
      'quest': '📝',
      'debug': '🐞',
      'discovery': '💡',
      'error': '❌',
      'skill': '⭐',
      'weather': '🌤️',
      'reward': '🎁',
      'easter egg': '🎮' // For our secret entry
    };
    return icons[category] || '•';
  };

  // Importance class
  const getEntryClass = (importance: number): string => {
    if (importance >= 5) return 'very-important';
    if (importance >= 4) return 'important';
    if (importance >= 3) return 'standard';
    if (importance >= 2) return 'minor';
    return 'trivial';
  };

  // Toggle bookmark
  const toggleBookmark = (entryId: string | number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setBookmarkedEntryIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  // Toggle expanded entry
  const toggleExpanded = (entryId: string | number) => {
    setExpandedEntryId(prevId => prevId === entryId ? null : entryId);
    
    // Mark as read when expanded
    if (onMarkRead && expandedEntryId !== entryId) {
      const entry = journal.find(e => e.id === entryId);
      if (entry && !entry.readByPlayer) {
        onMarkRead([entryId]);
      }
    }
  };

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pageCount)));
    setExpandedEntryId(null);
  };

  // Book mode page turning with animation
  const turnPage = (direction: 'next' | 'prev') => {
    const numPages = Math.ceil(filteredEntries.length / 4); // Entries per book page
    const maxPageIndex = Math.max(0, numPages - 1);

    setLastDirection(direction);
    setPageTransition('turning');

    setTimeout(() => {
      setActivePage(prev => {
        let nextPage = prev;
        if (direction === 'next') {
          nextPage = Math.min(maxPageIndex, prev + 1);
        } else {
          nextPage = Math.max(0, prev - 1);
        }
        return nextPage;
      });
    }, 400); // Half the animation duration
  };

  // Ritual helper: Check if claimed by the current player
  const isRitualClaimed = (ritual: RitualQuest): boolean => {
    return player.completedRituals.includes(ritual.id);
  };

  // Ritual helpers
  const getRitualCompletion = (ritual: RitualQuest): number => {
    return Math.round((ritual.stepsCompleted / ritual.totalSteps) * 100);
  };
  
  const getRitualClass = (ritual: RitualQuest): string => {
    if (isRitualClaimed(ritual)) return 'claimed';
    const completion = getRitualCompletion(ritual);
    if (completion === 100) return 'completed';
    if (completion > 50) return 'advanced';
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

  // Render functions for each tab content
  // Render categories sidebar
  const renderCategorySidebar = () => {
    const categoriesMap: { [key: string]: { name: string; icon: string; count: number } } = {
      all: { name: 'All Entries', icon: '📚', count: journal.length },
    };

    journal.forEach(entry => {
      if (!categoriesMap[entry.category]) {
        categoriesMap[entry.category] = {
          name: entry.category.charAt(0).toUpperCase() + entry.category.slice(1),
          icon: getCategoryIcon(entry.category),
          count: 0
        };
      }
      categoriesMap[entry.category].count++;
    });

    // Convert map to array and sort
    const sortedCategories = Object.entries(categoriesMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (a.id === 'all' ? -1 : b.id === 'all' ? 1 : a.name.localeCompare(b.name)));

    return (
      <div className="journal-categories">
        <div className="categories-header">
          <h3>Categories</h3>
        </div>
        <div className="category-list">
          {sortedCategories.map(category => (
            <div
              key={category.id}
              className={`category-item ${filter === category.id && !bookmarkView ? 'active' : ''}`}
              onClick={() => {
                setFilter(category.id);
                setCurrentPage(1);
                setBookmarkView(false);
                setIsSearching(false);
                setSearchQuery('');
              }}
              role="button"
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <span className="category-count">{category.count}</span>
            </div>
          ))}
          {/* Bookmark Filter */}
          <div
            className={`category-item ${bookmarkView ? 'active' : ''}`}
            onClick={() => {
              setBookmarkView(true);
              setFilter('all');
              setCurrentPage(1);
              setIsSearching(false);
              setSearchQuery('');
            }}
            role="button"
          >
            <span className="category-icon">🔖</span>
            <span className="category-name">Bookmarked</span>
            <span className="category-count">{bookmarkedEntryIds.size}</span>
          </div>
        </div>
      </div>
    );
  };

  // Render entries list (standard mode)
  const renderEntriesList = () => {
    const entries = getCurrentPageEntries();
    const isDisplayingSearchResults = isSearching && searchQuery.length > 0;

    return (
      <div className="journal-entries">
        <div className="entries-header">
          <div className="header-title">
            <h3>
              {isDisplayingSearchResults ? `Search Results` :
               bookmarkView ? 'Bookmarked Entries' :
               filter === 'all' ? 'All Journal Entries' :
               `${filter.charAt(0).toUpperCase() + filter.slice(1)} Entries`}
            </h3>
            {unreadCount > 0 && !bookmarkView && filter === 'all' && !isDisplayingSearchResults && (
              <div className="unread-badge">{unreadCount} unread</div>
            )}
          </div>
          <div className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search journal..."
              className="search-input"
            />
          </div>
        </div>

        {isDisplayingSearchResults && (
          <div className="search-results-header">
            Found {filteredEntries.length} entries matching "{searchQuery}"
          </div>
        )}

        {entries.length === 0 ? (
          <div className="empty-entries">
            {isDisplayingSearchResults ? <p>No entries match your search.</p> :
             bookmarkView ? <p>You haven't bookmarked any entries yet.</p> :
             <p>No entries found in this category.</p>}
          </div>
        ) : (
          <>
            <div className="entries-list" ref={entriesListRef}>
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className={`journal-entry ${getEntryClass(entry.importance)} ${!entry.readByPlayer ? 'unread' : ''} ${expandedEntryId === entry.id ? 'expanded' : ''} ${entry.id === 'secret-90s-entry' ? 'secret-entry' : ''}`}
                >
                  <div
                    className="entry-header"
                    onClick={() => toggleExpanded(entry.id)}
                    role="button"
                    aria-expanded={expandedEntryId === entry.id}
                  >
                    <div className="entry-category" title={entry.category}>
                      <span className="entry-icon">{getCategoryIcon(entry.category)}</span>
                    </div>
                    <div className="entry-title">
                      {entry.title || entry.text.substring(0, 50) + (entry.text.length > 50 ? '...' : '')}
                    </div>
                    <div className="entry-meta">
                      <span className="entry-date" title={entry.date}>{formatDate(entry.date).split(',')[0]}</span>
                      <span className="entry-turn">T{entry.turn}</span>
                    </div>
                    <div className="entry-actions">
                      <button
                        className={`bookmark-btn ${bookmarkedEntryIds.has(entry.id) ? 'bookmarked' : ''}`}
                        onClick={(e) => toggleBookmark(entry.id, e)}
                        title={bookmarkedEntryIds.has(entry.id) ? 'Remove bookmark' : 'Bookmark entry'}
                        aria-label={bookmarkedEntryIds.has(entry.id) ? 'Remove bookmark' : 'Bookmark entry'}
                      >
                        🔖
                      </button>
                      <button
                        className="expand-btn"
                        onClick={(e) => { e.stopPropagation(); toggleExpanded(entry.id); }}
                        title={expandedEntryId === entry.id ? 'Collapse' : 'Expand'}
                        aria-label={expandedEntryId === entry.id ? 'Collapse' : 'Expand'}
                      >
                        {expandedEntryId === entry.id ? '▼' : '▶'}
                      </button>
                    </div>
                  </div>
                  {expandedEntryId === entry.id && (
                    <div className="entry-content">
                      <p className="entry-text">{entry.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {pageCount > 1 && (
              <div className="pagination">
                <button className="pagination-btn" onClick={() => goToPage(1)} disabled={currentPage === 1}>
                  «
                </button>
                <button className="pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                  ‹
                </button>
                <div className="page-info">Page {currentPage} of {pageCount}</div>
                <button className="pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === pageCount}>
                  ›
                </button>
                <button className="pagination-btn" onClick={() => goToPage(pageCount)} disabled={currentPage === pageCount}>
                  »
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Render rituals section
  const renderRituals = () => {
    const unlockedRituals = rituals.filter(ritual => ritual.unlocked);

    return (
      <div className="journal-rituals">
        <div className="rituals-header"><h3>Ritual Quests</h3></div>
        {unlockedRituals.length === 0 ? (
          <div className="empty-rituals"><p>No active rituals found.</p></div>
        ) : (
          <div className="rituals-grid">
            {unlockedRituals.map(ritual => (
              <div
                key={ritual.id}
                className={`ritual-card ${getRitualClass(ritual)}`}
                onClick={() => setFocusedRitual(ritual)}
                role="button"
                tabIndex={0}
              >
                <div className="ritual-card-header">
                  <div className="ritual-name">{ritual.name}</div>
                  {getRitualCompletion(ritual) === 100 && !isRitualClaimed(ritual) && (
                    <button
                      className="claim-reward-button"
                      onClick={(e) => handleClaimClick(e, ritual.id)}
                      title="Claim Reward"
                    >
                      Claim!
                    </button>
                  )}
                  {getRitualCompletion(ritual) === 100 && isRitualClaimed(ritual) && (
                    <span className="claimed-badge">✓</span>
                  )}
                  {getRitualCompletion(ritual) < 100 && (
                    <div className="ritual-completion">{getRitualCompletion(ritual)}%</div>
                  )}
                </div>
                <div className="ritual-progress-bar">
                  <div className="ritual-progress-fill" style={{ width: `${getRitualCompletion(ritual)}%` }}></div>
                </div>
                <div className="ritual-description">{ritual.description.substring(0, 80)}...</div>
                <div className="ritual-requirements">
                  {ritual.requiredMoonPhase && (
                    <div className="ritual-requirement moon" title={`Requires ${ritual.requiredMoonPhase}`}>
                      <span className="requirement-icon">🌙</span>
                    </div>
                  )}
                  {ritual.requiredSeason && (
                    <div className="ritual-requirement season" title={`Requires ${ritual.requiredSeason}`}>
                      <span className="requirement-icon">{getSeasonIcon(ritual.requiredSeason)}</span>
                    </div>
                  )}
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
                {/* Progress Circle */}
                <div className="ritual-progress-section">
                  <div className="ritual-progress-circle">
                    <svg className="progress-ring" width="100" height="100">
                      <circle className="progress-ring-bg" r="45" cx="50" cy="50" />
                      <circle 
                        className="progress-ring-circle" 
                        r="45" 
                        cx="50" 
                        cy="50"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - getRitualCompletion(focusedRitual) / 100)}`}
                      />
                    </svg>
                    <div className="progress-text">{getRitualCompletion(focusedRitual)}%</div>
                  </div>
                  <div className="ritual-completion-text">
                    {focusedRitual.stepsCompleted} / {focusedRitual.totalSteps} steps
                  </div>
                </div>

                {/* Description */}
                <div className="ritual-description-full">{focusedRitual.description}</div>

                {/* Steps */}
                <div className="ritual-steps">
                  <h4>Steps:</h4>
                  <ul className="steps-list">
                    {focusedRitual.steps.map((step, index) => (
                      <li key={index} className={`ritual-step ${step.completed ? 'completed' : ''}`}>
                        <div className="step-check">{step.completed ? '✓' : '○'}</div>
                        <div className="step-details">
                          <div className="step-description">{step.description}</div>
                          {step.completedDate && (
                            <div className="step-completed-date">Completed: {step.completedDate}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div className="ritual-requirements-full">
                  <h4>Requirements:</h4>
                  <div className="requirements-list">
                    {!focusedRitual.requiredMoonPhase && !focusedRitual.requiredSeason && !focusedRitual.requiredItems && (
                      <div className="ritual-requirement">None</div>
                    )}
                    
                    {focusedRitual.requiredMoonPhase && (
                      <div className="ritual-requirement">
                        <span className="requirement-icon">🌙</span>
                        <span className="requirement-label">Moon Phase:</span>
                        <span className="requirement-text">
                          {focusedRitual.requiredMoonPhase}
                          {time.phaseName === focusedRitual.requiredMoonPhase && (
                            <span className='req-met'>(Active)</span>
                          )}
                        </span>
                      </div>
                    )}
                    
                    {focusedRitual.requiredSeason && (
                      <div className="ritual-requirement">
                        <span className="requirement-icon">{getSeasonIcon(focusedRitual.requiredSeason)}</span>
                        <span className="requirement-label">Season:</span>
                        <span className="requirement-text">
                          {focusedRitual.requiredSeason}
                          {time.season === focusedRitual.requiredSeason && (
                            <span className='req-met'>(Active)</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rewards */}
                <div className="ritual-rewards">
                  <h4>Rewards:</h4>
                  <ul className="rewards-list">
                    {focusedRitual.rewards.map((reward, index) => (
                      <li key={index} className="reward-item">
                        {`${reward.type === 'gold' ? 'Gold' : 
                           reward.type === 'item' ? 'Item' : 
                           reward.type === 'skill' ? 'Skill' : 
                           reward.type === 'reputation' ? 'Reputation' : 
                           reward.type === 'recipe' ? 'Recipe' : 
                           reward.type === 'blueprint' ? 'Blueprint' : 
                           reward.type === 'garden_slot' ? 'Garden Slot' : 
                           reward.type}: ${reward.value} ${reward.quantity ? `(x${reward.quantity})` : ''}`}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Claim Button */}
                {getRitualCompletion(focusedRitual) === 100 && !isRitualClaimed(focusedRitual) && (
                  <button
                    className="claim-reward-button modal-claim"
                    onClick={(e) => handleClaimClick(e, focusedRitual.id)}
                  >
                    Claim Reward
                  </button>
                )}
                
                {getRitualCompletion(focusedRitual) === 100 && isRitualClaimed(focusedRitual) && (
                  <div className="claimed-badge modal-claimed">Reward Claimed ✓</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render rumors section
  const renderRumors = () => {
    const sortedRumors = [...rumors].sort((a, b) => (b.spread ?? 0) - (a.spread ?? 0));

    return (
      <div className="journal-rumors">
        <div className="rumors-header"><h3>Market Whispers</h3></div>
        {sortedRumors.length === 0 ? (
          <div className="empty-rumors"><p>The market is quiet today.</p></div>
        ) : (
          <div className="rumors-list">
            {sortedRumors.map(rumor => {
              const spreadClass = (rumor.spread ?? 0) > 70 ? 'widespread' : (rumor.spread ?? 0) > 40 ? 'common' : 'rare';
              const priceEffectDirection = rumor.priceEffect ? (rumor.priceEffect > 0 ? 'up' : 'down') : '';
              
              return (
                <div 
                  key={rumor.id} 
                  className={`rumor-card ${spreadClass}`} 
                  style={{'--rumor-spread': `${rumor.spread ?? 0}` } as React.CSSProperties}
                >
                  <div className="rumor-content">{rumor.content}</div>
                  <div className="rumor-meta">
                    <span className="rumor-source">{rumor.origin}</span>
                    <span className="rumor-age">~{rumor.turnsActive || 0}d ago</span>
                  </div>
                  <div className="rumor-spread" title={`Spread: ${rumor.spread?.toFixed(0) ?? 0}%`}>
                    <div className="spread-label">{spreadClass.toUpperCase()}</div>
                    <div className="spread-bar">
                      <div className="spread-fill" style={{ width: `${rumor.spread ?? 0}%` }}></div>
                    </div>
                  </div>
                  {rumor.verified && (
                    <div className="rumor-verified" title="Verified">
                      <span className="verified-icon">✓</span> Verified
                    </div>
                  )}
                  {rumor.affectedItem && rumor.priceEffect && (
                    <div className="rumor-effect" title={`Price Effect: ${(rumor.priceEffect * 100).toFixed(0)}%`}>
                      <span className="effect-label">Affects:</span>
                      <span className="effect-value">{rumor.affectedItem}</span>
                      <span className={`effect-direction ${priceEffectDirection}`}>
                        {priceEffectDirection === 'up' ? '▲' : priceEffectDirection === 'down' ? '▼' : ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render codex section
  const renderCodex = () => {
    // Placeholder - Needs actual content generation based on game discoveries
    return (
      <div className="journal-codex">
        <div className="codex-header"><h3>Witch's Codex</h3></div>
        <div className="codex-intro">
          <p>The secrets and knowledge of witchcraft recorded in these pages shall guide you through your journey. More entries will be revealed as you discover the secrets of your craft.</p>
        </div>
        <div className="codex-categories">
          <div className="codex-category">
            <h4><span className="category-icon">🌿</span>Ingredients</h4>
            <div className="codex-entries">
              <p className="unlockable">Discover ingredients to reveal their properties and uses.</p>
            </div>
          </div>
          <div className="codex-category">
            <h4><span className="category-icon">🌙</span>Lunar Influences</h4>
            <div className="codex-entries">
              <div className="codex-entry">
                <h5>Full Moon</h5>
                <p>The Full Moon amplifies magical potency, especially for renewal and clarifying potions. Plants harvested during this phase contain enhanced magical properties.</p>
              </div>
              <div className="codex-entry">
                <h5>New Moon</h5>
                <p>The New Moon is ideal for beginnings and banishing brews. Herbs collected during this phase are particularly potent for protective concoctions.</p>
              </div>
              <p className="unlockable">More lunar knowledge awaits discovery...</p>
            </div>
          </div>
          <div className="codex-category">
            <h4><span className="category-icon">🧪</span>Brewing Techniques</h4>
            <div className="codex-entries">
              <p className="unlockable">Master your brewing skills to unlock advanced techniques.</p>
            </div>
          </div>
          
          {/* Easter Egg: Secret 90s page in the codex */}
          {secretCodeActive && (
            <div className="codex-category secret-category">
              <h4><span className="category-icon">🎮</span>Totally Radical 90s Magic</h4>
              <div className="codex-entries">
                <div className="codex-entry secret-entry">
                  <h5 className="blink-text">AWESOME SPELLS FROM THE 90s</h5>
                  <div className="secret-content">
                    <p>The Dial-Up Summoning: A long forgotten ritual requiring patience as mystical energies connect through the sounds of screeching and beeping.</p>
                    <p>The Rewind Spell: A powerful incantation used to return magical cassette tapes to their starting position.</p>
                    <p>The Pog Collection Expansion: Ancient witches would trade circular talismans for power and prestige in the schoolyard realm.</p>
                  </div>
                </div>
                <style>{`
                  .secret-category {
                    border: 2px dashed #ff00ff;
                    background: radial-gradient(circle, rgba(0,250,255,0.2) 0%, rgba(255,0,255,0.1) 100%);
                    animation: glow 2s infinite alternate;
                    transform: rotate(-1deg);
                  }
                  
                  .secret-entry {
                    font-family: "Comic Sans MS", cursive;
                  }
                  
                  .blink-text {
                    animation: blink 1s infinite;
                    color: #ff00ff;
                    text-shadow: 2px 2px 0 yellow;
                    text-transform: uppercase;
                  }
                  
                  .secret-content {
                    background: repeating-linear-gradient(
                      45deg,
                      #000000,
                      #000000 10px,
                      #222222 10px,
                      #222222 20px
                    );
                    color: #00ff00;
                    padding: 10px;
                    border-radius: 5px;
                    text-shadow: 1px 1px 0 black;
                    box-shadow: 0 0 10px lime;
                  }
                  
                  @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                  }
                  
                  @keyframes glow {
                    from { box-shadow: 0 0 10px #ff00ff; }
                    to { box-shadow: 0 0 20px #00ffff; }
                  }
                `}</style>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render book mode
  const renderBookMode = () => {
    const bookPageEntries = getBookPageEntries(activePage);
    const activeRituals = rituals
      .filter(r => r.unlocked && !isRitualClaimed(r))
      .slice(0, 3);
    const recentRumors = rumors.slice(0, 3);
    const maxPages = Math.ceil(filteredEntries.length / 4);

    return (
      <div className="journal-book" ref={bookRef}>
        <div className="book-pages">
          {/* Left Page */}
          <div 
            className={`book-page page-left ${pageTransition === 'turning' && lastDirection === 'next' ? 'turning' : ''}`}
            ref={el => pageRefs.current[0] = el}
          >
            <div className="page-content">
              <h2>Recent Journal Entries</h2>
              {bookPageEntries.length === 0 ? (
                <p>No entries to display.</p>
              ) : (
                bookPageEntries.map(entry => (
                  <div 
                    key={entry.id} 
                    className={`book-entry-short ${entry.id === 'secret-90s-entry' ? 'secret-book-entry' : ''}`}
                  >
                    <strong>T{entry.turn}:</strong> {entry.text.substring(0, 80)}...
                    {entry.id === 'secret-90s-entry' && (
                      <style>{`
                        .secret-book-entry {
                          font-family: "Comic Sans MS", cursive;
                          background: linear-gradient(45deg, rgba(255,0,255,0.1), rgba(0,255,255,0.1));
                          border: 1px dashed #ff00ff;
                          animation: rainbow-bg 3s infinite;
                        }
                        @keyframes rainbow-bg {
                          0% { background-position: 0% 50%; }
                          50% { background-position: 100% 50%; }
                          100% { background-position: 0% 50%; }
                        }
                      `}</style>
                    )}
                  </div>
                ))
              )}
              <h2>Active Rituals</h2>
              {activeRituals.length === 0 ? (
                <p>No active rituals.</p>
              ) : (
                activeRituals.map(ritual => (
                  <div key={ritual.id} className="book-ritual-short">
                    <strong>{ritual.name}</strong> ({getRitualCompletion(ritual)}%)
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Right Page */}
          <div 
            className={`book-page page-right ${pageTransition === 'turning' && lastDirection === 'prev' ? 'turning' : ''}`}
            ref={el => pageRefs.current[1] = el}
          >
            <div className="page-content">
              <h2>Latest Rumors</h2>
              {recentRumors.length === 0 ? (
                <p>Market is quiet.</p>
              ) : (
                recentRumors.map(rumor => (
                  <div key={rumor.id} className="book-rumor-short">
                    {rumor.content.substring(0, 90)}...
                    <span className="source">— {rumor.origin}</span>
                  </div>
                ))
              )}
              <h2>Current Conditions</h2>
              <div><strong>Moon:</strong> {time.phaseName}</div>
              <div><strong>Season:</strong> {time.season} ({getSeasonIcon(time.season)})</div>
              <div><strong>Weather:</strong> {time.weatherFate}</div>
              <div><strong>Day:</strong> {time.dayCount} of Year {time.year}</div>
            </div>
          </div>
        </div>
        
        {/* Page turning controls */}
        <div className="book-controls">
          <button 
            className="page-turn" 
            onClick={() => turnPage('prev')} 
            disabled={activePage <= 0 || pageTransition === 'turning'}
            aria-label="Previous page"
          >
            ◂
          </button>
          <div className="page-indicator">
            {activePage + 1} / {Math.max(1, maxPages)}
          </div>
          <button 
            className="page-turn" 
            onClick={() => turnPage('next')} 
            disabled={activePage >= maxPages - 1 || pageTransition === 'turning'}
            aria-label="Next page"
          >
            ▸
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="journal-container">
      <div className="journal-header">
        <h2><span className="section-icon">📖</span> Witch's Journal</h2>
        <div className="journal-tabs">
          <button 
            className={`journal-tab ${currentTab === 'entries' ? 'active' : ''}`} 
            onClick={() => setCurrentTab('entries')}
          >
            Entries {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
          </button>
          <button 
            className={`journal-tab ${currentTab === 'rituals' ? 'active' : ''}`} 
            onClick={() => setCurrentTab('rituals')}
          >
            Rituals {rituals.filter(r=>r.unlocked).length > 0 && <span className="badge">{rituals.filter(r=>r.unlocked).length}</span>}
          </button>
          <button 
            className={`journal-tab ${currentTab === 'rumors' ? 'active' : ''}`} 
            onClick={() => setCurrentTab('rumors')}
          >
            Rumors {rumors.length > 0 && <span className="badge">{rumors.length}</span>}
          </button>
          <button 
            className={`journal-tab ${currentTab === 'codex' ? 'active' : ''}`} 
            onClick={() => setCurrentTab('codex')}
          >
            Codex
          </button>
        </div>
        <div className="journal-view-toggle">
          <button 
            className={`view-toggle-btn ${!turnMode ? 'active' : ''}`} 
            onClick={() => setTurnMode(false)} 
            title="List View"
            aria-label="List View"
          >
            ☰
          </button>
          <button 
            className={`view-toggle-btn ${turnMode ? 'active' : ''}`} 
            onClick={() => setTurnMode(true)} 
            title="Book View"
            aria-label="Book View"
          >
            📖
          </button>
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
      
      {/* Easter Egg: 90s styling for secret entry */}
      {secretCodeActive && (
        <style>{`
          .secret-entry {
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAOklEQVQYlWNkYGD4z0AEYGQwZGBgCGZAB4xoAiA5w4dCFBvRNcG8DTMJZhDMUHS/YFOIzY3ozmRAVwgA6gYPwm5CV5AAAAAASUVORK5CYII=') !important;
            border: 2px ridge #ff00ff !important;
            font-family: "Comic Sans MS", cursive !important;
            position: relative;
            overflow: hidden;
          }
          
          .secret-entry:before {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(
              to right,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.3) 50%,
              rgba(255, 255, 255, 0) 100%
            );
            transform: skewX(-25deg);
            animation: shimmer 3s infinite;
            z-index: 1;
          }
          
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 200%; }
          }
        `}</style>
      )}
    </div>
  );
};

export default Journal;