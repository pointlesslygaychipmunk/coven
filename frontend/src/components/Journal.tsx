import React, { useState, useEffect, useRef } from 'react';
import './Journal.css';
import { JournalEntry, Rumor, RitualQuest, GameTime, Season, Player } from 'coven-shared'; // Added BasicRecipeInfo

interface JournalProps {
  journal: JournalEntry[];
  rumors: Rumor[];
  rituals: RitualQuest[];
  time: GameTime;
  onMarkRead?: (entryIds: (string | number)[]) => void; // Optional callback
  player: Player;
  onClaimRitual?: (ritualId: string) => void; // Optional callback
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
  const [activePage, setActivePage] = useState<number>(0); // For book view
  const [turnMode, setTurnMode] = useState<boolean>(false); // true for book view
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [focusedRitual, setFocusedRitual] = useState<RitualQuest | null>(null);
  const [pageTransition, setPageTransition] = useState<'none' | 'turning'>('none');
  const [lastDirection, setLastDirection] = useState<'next' | 'prev'>('next');

  // 90s Easter Egg: Secret journal entry
  const [secretCodeActive, setSecretCodeActive] = useState<boolean>(false);
  const [secretCodeProgress, setSecretCodeProgress] = useState<string>('');
  const secretCode = "witch"; // The secret word

  // Refs
  const bookRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const entriesListRef = useRef<HTMLDivElement>(null);

  // Constants
  const entriesPerPage = 8; // Entries per page in list view

  // Calculate unread count for the badge
  const unreadCount = journal.filter(entry => !entry.readByPlayer).length;

  // 90s Easter Egg: Secret code detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore input if focused on search or other inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
          return;
      }

      const key = e.key.toLowerCase();
      // Allow only letters for the code
      if (key.length !== 1 || !key.match(/[a-z]/i)) {
          // Reset progress if non-letter key (except allowed like Shift, etc.)
          if (!['shift', 'control', 'alt', 'meta', 'capslock', 'tab', 'enter', 'escape'].includes(key)) {
            setSecretCodeProgress('');
          }
          return;
      }


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
        // Reset progress if wrong key is pressed, starting with the current key if it matches the beginning
        if (secretCode[0] === key) {
           setSecretCodeProgress(key);
        } else {
           setSecretCodeProgress('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [secretCodeProgress]); // Depend on progress

  // Mark entries as read when they become visible (simplified)
  useEffect(() => {
    if (currentTab === 'entries' && !turnMode && onMarkRead) {
      const entriesOnPage = getCurrentPageEntries();
      const unreadIdsToMark = entriesOnPage
        .filter(entry => !entry.readByPlayer)
        .map(entry => entry.id);

      if (unreadIdsToMark.length > 0) {
        // Delay marking slightly to ensure they rendered
        const markTimer = setTimeout(() => {
             if (onMarkRead) onMarkRead(unreadIdsToMark);
        }, 500);
        return () => clearTimeout(markTimer);
      }
    }
     // Add explicit return for other cases
     return undefined;
  }, [journal, currentTab, currentPage, turnMode, onMarkRead]); // Re-check when these change

  // Handle page transition animation cleanup
  useEffect(() => {
    if (pageTransition === 'turning') {
      const timer = setTimeout(() => {
        setPageTransition('none');
      }, 800); // Match CSS animation duration
      return () => clearTimeout(timer);
    }
     // Add explicit return for other cases
     return undefined;
  }, [pageTransition]);

  // Reset book pages when view mode changes or tab changes
  useEffect(() => {
    if (!turnMode || currentTab !== 'entries') { // Only reset when not in book mode or tab changes
        resetPages();
    }
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
    setCurrentPage(1); // Reset page on new search
    setBookmarkView(false); // Exit bookmark view when searching
    setFilter('all'); // Reset category filter when searching
  };

  // Filter and sort logic
  const getFilteredAndSortedEntries = () => {
    let entries = [...journal]; // Create a copy to avoid mutating original state

    if (bookmarkView) {
      entries = entries.filter(entry => bookmarkedEntryIds.has(entry.id));
    } else if (filter !== 'all') {
      entries = entries.filter(entry => entry.category === filter);
    }

    if (isSearching) {
      const queryLower = searchQuery.toLowerCase();
      entries = entries.filter(entry =>
        entry.text.toLowerCase().includes(queryLower) ||
        (entry.title && entry.title.toLowerCase().includes(queryLower)) || // Check title if it exists
        entry.category.toLowerCase().includes(queryLower)
      );
    }

    // Add in the secret easter egg entry when code is active
    if (secretCodeActive && !isSearching && filter === 'all' && !bookmarkView) {
      const secretEntry: JournalEntry = {
        id: "secret-90s-entry", // Unique ID
        turn: 999, // High turn number to appear near top if sorting by turn desc
        date: "Yr ??, ?? ??", // Mysterious date
        text: "You found a totally tubular secret page! It mentions something called a 'Floppy Disk' ritual and warns against 'Y2K bugs'. Ancient witches apparently used 'Cheat Codes' to gain infinite Moonbuds. Try whispering 'RADICAL魔女' (Radical Majo) at the market... maybe?",
        category: "easter egg", // Use the specific category
        importance: 5,
        readByPlayer: true, // Mark as read immediately
        title: "SECRET 90s PAGE!!" // Use title field
      };
      // Add to the beginning of the list if not already there
       if (!entries.some(e => e.id === secretEntry.id)) {
            entries.unshift(secretEntry);
       }
    }

    // Sort newest first by turn number
    return entries.sort((a, b) => b.turn - a.turn);
  };

  const filteredEntries = getFilteredAndSortedEntries();
  const pageCount = Math.ceil(filteredEntries.length / entriesPerPage);
  const bookPageCount = Math.ceil(filteredEntries.length / 4); // Entries per book page (4)

  const getCurrentPageEntries = () => {
    return filteredEntries.slice(
      (currentPage - 1) * entriesPerPage,
      currentPage * entriesPerPage
    );
  };

  // Get entries for book mode (split across pages)
  const getBookPageEntries = (pageIndex: number) => {
    const entriesPerBookPage = 4;
    const startIdx = pageIndex * entriesPerBookPage;
    return filteredEntries.slice(startIdx, startIdx + entriesPerBookPage);
  };

  // Format date (simple version)
  const formatDate = (dateStr: string): string => {
      // Attempt to extract just the season/year part if available
      const parts = dateStr?.split(',');
      if (parts && parts.length >= 2) {
          return parts[1].trim(); // e.g., "Spring Y1"
      }
      return dateStr || "Unknown Date"; // Fallback
  };


  const getSeasonIcon = (season: Season | undefined): string => {
     if (!season) return '?';
    const icons: Record<Season, string> = { 'Spring': '🌱', 'Summer': '☀️', 'Fall': '🍂', 'Winter': '❄️' };
    return icons[season] || '?';
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'event': '📜', 'ritual': '✨', 'market': '💰', 'moon': '🌙',
      'season': getSeasonIcon(time.season), // Dynamic season icon
      'brewing': '🧪', 'garden': '🌿', 'quest': '📝', 'debug': '🐞',
      'discovery': '💡', 'error': '❌', 'skill': '⭐', 'weather': '🌤️',
      'reward': '🎁', 'easter egg': '🎮'
    };
    return icons[category] || '•'; // Default bullet
  };

  // Importance class for border
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
      if (newSet.has(entryId)) newSet.delete(entryId);
      else newSet.add(entryId);
      return newSet;
    });
  };

  // Toggle expanded entry
  const toggleExpanded = (entryId: string | number) => {
      const currentlyExpanded = expandedEntryId === entryId;
      setExpandedEntryId(currentlyExpanded ? null : entryId);

      // Mark as read when expanding, if needed
      if (!currentlyExpanded && onMarkRead) {
          const entry = journal.find(e => e.id === entryId);
          if (entry && !entry.readByPlayer) {
              onMarkRead([entryId]);
          }
      }
  };


  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pageCount || 1))); // Ensure page is valid
    setExpandedEntryId(null); // Collapse entries when changing pages
  };

  // Book mode page turning with animation
  const turnPage = (direction: 'next' | 'prev') => {
    const maxPageIndex = Math.max(0, bookPageCount - 1); // Calculate max index for book view

    // Prevent turning if already at boundary or mid-transition
    if (pageTransition === 'turning') return;
    if (direction === 'prev' && activePage <= 0) return;
    if (direction === 'next' && activePage >= maxPageIndex) return;

    setLastDirection(direction);
    setPageTransition('turning'); // Start animation

    // Update active page after a delay (half animation time)
    setTimeout(() => {
      setActivePage(prev => {
        let nextPage = prev;
        if (direction === 'next') nextPage = Math.min(maxPageIndex, prev + 1);
        else nextPage = Math.max(0, prev - 1);
        return nextPage;
      });
       // Animation cleanup happens in useEffect based on pageTransition state
    }, 400);
  };

   // Ritual helper: Check if claimed by the current player
   const isRitualClaimed = (ritual: RitualQuest): boolean => {
       return player.completedRituals.includes(ritual.id);
   };


  // Ritual helpers
  const getRitualCompletion = (ritual: RitualQuest): number => {
    if (!ritual || ritual.totalSteps <= 0) return 0;
    return Math.min(100, Math.round((ritual.stepsCompleted / ritual.totalSteps) * 100));
  };

  const getRitualClass = (ritual: RitualQuest): string => {
    if (isRitualClaimed(ritual)) return 'claimed';
    const completion = getRitualCompletion(ritual);
    if (completion >= 100) return 'completed'; // Changed to >= 100
    if (completion > 50) return 'advanced';
    if (completion > 0) return 'in-progress';
    return 'not-started';
  };

  const handleClaimClick = (e: React.MouseEvent, ritualId: string) => {
    e.stopPropagation();
    if (onClaimRitual) {
      onClaimRitual(ritualId);
      setFocusedRitual(null); // Close modal after claiming
    }
  };

  // ---- Render Functions ----

  // Render categories sidebar
  const renderCategorySidebar = () => {
    const categoriesMap: { [key: string]: { name: string; icon: string; count: number } } = {
      all: { name: 'All Entries', icon: '📚', count: 0 }, // Start count at 0
    };

    // Count entries per category, considering search results if active
    const entriesToCount = isSearching ? filteredEntries : journal;
    let totalCount = 0;

    entriesToCount.forEach(entry => {
        // Exclude secret entry from counts unless specifically searching for it
        if(entry.id === 'secret-90s-entry' && !isSearching) return;

        totalCount++; // Count total visible entries
        const categoryKey = entry.category || 'misc'; // Handle potential undefined category
        if (!categoriesMap[categoryKey]) {
            categoriesMap[categoryKey] = {
            name: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
            icon: getCategoryIcon(categoryKey),
            count: 0
            };
        }
        categoriesMap[categoryKey].count++;
    });
     categoriesMap.all.count = totalCount; // Update total count


    const sortedCategories = Object.entries(categoriesMap)
      .filter(([id, data]) => data.count > 0 || id === 'all') // Only show categories with entries (or 'all')
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (a.id === 'all' ? -1 : b.id === 'all' ? 1 : a.name.localeCompare(b.name)));

    return (
      <div className="journal-categories">
        <div className="categories-header"><h3>Categories</h3></div>
        <div className="category-list">
          {sortedCategories.map(category => (
            <div
              key={category.id}
              className={`category-item ${filter === category.id && !bookmarkView && !isSearching ? 'active' : ''}`}
              onClick={() => {
                setFilter(category.id); setCurrentPage(1); setBookmarkView(false);
                setIsSearching(false); setSearchQuery(''); // Clear search on category click
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
              setBookmarkView(true); setFilter('all'); setCurrentPage(1);
              setIsSearching(false); setSearchQuery(''); // Clear search
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
             {/* Show unread badge only in 'All Entries' view when not searching/bookmarking */}
            {unreadCount > 0 && !bookmarkView && filter === 'all' && !isDisplayingSearchResults && (
              <div className="unread-badge">{unreadCount} unread</div>
            )}
          </div>
          <div className="search-container">
            <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Search journal..." className="search-input" />
          </div>
        </div>

        {isDisplayingSearchResults && filteredEntries.length > 0 && (
          <div className="search-results-header">Found {filteredEntries.length} entries matching "{searchQuery}"</div>
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
                  // Apply secret-entry class conditionally
                  className={`journal-entry ${getEntryClass(entry.importance)} ${!entry.readByPlayer ? 'unread' : ''} ${expandedEntryId === entry.id ? 'expanded' : ''} ${entry.id === 'secret-90s-entry' ? 'secret-entry' : ''}`}
                >
                  <div className="entry-header" onClick={() => toggleExpanded(entry.id)} role="button" aria-expanded={expandedEntryId === entry.id}>
                    <div className="entry-category" title={entry.category}>
                      <span className="entry-icon">{getCategoryIcon(entry.category)}</span>
                    </div>
                    <div className="entry-title">
                      {entry.title || entry.text.substring(0, 50) + (entry.text.length > 50 ? '...' : '')}
                    </div>
                    <div className="entry-meta">
                      <span className="entry-date" title={entry.date}>{formatDate(entry.date)}</span>
                      <span className="entry-turn">T{entry.turn}</span>
                    </div>
                    <div className="entry-actions">
                      <button className={`bookmark-btn ${bookmarkedEntryIds.has(entry.id) ? 'bookmarked' : ''}`} onClick={(e) => toggleBookmark(entry.id, e)} title={bookmarkedEntryIds.has(entry.id) ? 'Remove bookmark' : 'Bookmark entry'} aria-label={bookmarkedEntryIds.has(entry.id) ? 'Remove bookmark' : 'Bookmark entry'}>🔖</button>
                      <button className="expand-btn" onClick={(e) => { e.stopPropagation(); toggleExpanded(entry.id); }} title={expandedEntryId === entry.id ? 'Collapse' : 'Expand'} aria-label={expandedEntryId === entry.id ? 'Collapse' : 'Expand'}>{expandedEntryId === entry.id ? '▼' : '▶'}</button>
                    </div>
                  </div>
                  {expandedEntryId === entry.id && (
                    <div className="entry-content">
                       {/* Render title inside content if it exists and is expanded */}
                       {entry.title && <h4 style={{marginTop: 0, marginBottom: '10px', fontSize: '16px', color: '#4e342e'}}>{entry.title}</h4>}
                       <p className="entry-text">{entry.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {pageCount > 1 && (
              <div className="pagination">
                <button className="pagination-btn" onClick={() => goToPage(1)} disabled={currentPage === 1}>«</button>
                <button className="pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>‹</button>
                <div className="page-info">Page {currentPage} of {pageCount}</div>
                <button className="pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === pageCount}>›</button>
                <button className="pagination-btn" onClick={() => goToPage(pageCount)} disabled={currentPage === pageCount}>»</button>
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
              <div key={ritual.id} className={`ritual-card ${getRitualClass(ritual)}`} onClick={() => setFocusedRitual(ritual)} role="button" tabIndex={0}>
                <div className="ritual-card-header">
                  <div className="ritual-name">{ritual.name}</div>
                  {getRitualCompletion(ritual) >= 100 && !isRitualClaimed(ritual) && ( // Changed to >= 100
                    <button className="claim-reward-button" onClick={(e) => handleClaimClick(e, ritual.id)} title="Claim Reward">Claim!</button>
                  )}
                  {getRitualCompletion(ritual) >= 100 && isRitualClaimed(ritual) && ( // Changed to >= 100
                    <span className="claimed-badge" title="Reward Claimed">✓</span>
                  )}
                  {getRitualCompletion(ritual) < 100 && (
                    <div className="ritual-completion">{getRitualCompletion(ritual)}%</div>
                  )}
                </div>
                <div className="ritual-progress-bar"><div className="ritual-progress-fill" style={{ width: `${getRitualCompletion(ritual)}%` }}></div></div>
                <div className="ritual-description">{ritual.description.substring(0, 80)}...</div>
                <div className="ritual-requirements">
                  {ritual.requiredMoonPhase && <div className="ritual-requirement moon" title={`Requires ${ritual.requiredMoonPhase}`}><span className="requirement-icon">🌙</span></div>}
                  {ritual.requiredSeason && <div className="ritual-requirement season" title={`Requires ${ritual.requiredSeason}`}><span className="requirement-icon">{getSeasonIcon(ritual.requiredSeason)}</span></div>}
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
                    <svg className="progress-ring" width="90" height="90"> {/* Adjusted size */}
                      <circle className="progress-ring-bg" r="40" cx="45" cy="45" /> {/* Adjusted radius/center */}
                      <circle className="progress-ring-circle" r="40" cx="45" cy="45" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - getRitualCompletion(focusedRitual) / 100)}`} />
                    </svg>
                    <div className="progress-text">{getRitualCompletion(focusedRitual)}%</div>
                  </div>
                  <div className="ritual-completion-text">{focusedRitual.stepsCompleted} / {focusedRitual.totalSteps} steps</div>
                </div>
                <div className="ritual-description-full">{focusedRitual.description}</div>
                <div className="ritual-steps"><h4>Steps:</h4><ul className="steps-list">{focusedRitual.steps.map((step, index) => (<li key={index} className={`ritual-step ${step.completed ? 'completed' : ''}`}><div className="step-check">{step.completed ? '✓' : '○'}</div><div className="step-details"><div className="step-description">{step.description}</div>{step.completedDate && (<div className="step-completed-date">Completed: {step.completedDate}</div>)}</div></li>))}</ul></div>
                <div className="ritual-requirements-full"><h4>Requirements:</h4><div className="requirements-list">{!focusedRitual.requiredMoonPhase && !focusedRitual.requiredSeason && !focusedRitual.requiredItems && (<div className="ritual-requirement">None</div>)}{focusedRitual.requiredMoonPhase && (<div className="ritual-requirement"><span className="requirement-icon">🌙</span><span className="requirement-label">Moon Phase:</span><span className="requirement-text">{focusedRitual.requiredMoonPhase}{time.phaseName === focusedRitual.requiredMoonPhase && (<span className='req-met'>(Active)</span>)}</span></div>)}{focusedRitual.requiredSeason && (<div className="ritual-requirement"><span className="requirement-icon">{getSeasonIcon(focusedRitual.requiredSeason)}</span><span className="requirement-label">Season:</span><span className="requirement-text">{focusedRitual.requiredSeason}{time.season === focusedRitual.requiredSeason && (<span className='req-met'>(Active)</span>)}</span></div>)}</div></div>
                <div className="ritual-rewards"><h4>Rewards:</h4><ul className="rewards-list">{focusedRitual.rewards.map((reward, index) => (<li key={index} className="reward-item">{`${reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}: ${reward.value} ${reward.quantity ? `(x${reward.quantity})` : ''}`}</li>))}</ul></div>
                {getRitualCompletion(focusedRitual) >= 100 && !isRitualClaimed(focusedRitual) && ( // Changed to >= 100
                  <button className="claim-reward-button modal-claim" onClick={(e) => handleClaimClick(e, focusedRitual.id)}>Claim Reward</button>
                )}
                {getRitualCompletion(focusedRitual) >= 100 && isRitualClaimed(focusedRitual) && ( // Changed to >= 100
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
                <div key={rumor.id} className={`rumor-card ${spreadClass}`} style={{'--rumor-spread': `${rumor.spread ?? 0}` } as React.CSSProperties}>
                  <div className="rumor-content">{rumor.content}</div>
                  <div className="rumor-meta">
                    <span className="rumor-source">{rumor.origin}</span>
                    <span className="rumor-age">~{rumor.turnsActive || 0}d ago</span>
                  </div>
                  <div className="rumor-spread" title={`Spread: ${rumor.spread?.toFixed(0) ?? 0}%`}>
                    <div className="spread-label">{spreadClass}</div>
                    <div className="spread-bar"><div className="spread-fill" style={{ width: `${rumor.spread ?? 0}%` }}></div></div>
                  </div>
                  {rumor.verified && (<div className="rumor-verified" title="Verified"><span className="verified-icon">✓</span> Verified</div>)}
                  {rumor.affectedItem && rumor.priceEffect && (<div className="rumor-effect" title={`Price Effect: ${(rumor.priceEffect * 100).toFixed(0)}%`}><span className="effect-label">Affects:</span><span className="effect-value">{rumor.affectedItem}</span><span className={`effect-direction ${priceEffectDirection}`}>{priceEffectDirection === 'up' ? '▲' : priceEffectDirection === 'down' ? '▼' : ''}</span></div>)}
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
    return (
      <div className="journal-codex">
        <div className="codex-header"><h3>Witch's Codex</h3></div>
        <div className="codex-intro"><p>Recorded secrets of the craft. More reveals itself as you discover...</p></div>
        <div className="codex-categories">
          <div className="codex-category"><h4><span className="category-icon">🌿</span>Ingredients</h4><div className="codex-entries"><p className="unlockable">Discover ingredients to reveal properties.</p></div></div>
          <div className="codex-category"><h4><span className="category-icon">🌙</span>Lunar Influences</h4><div className="codex-entries"><div className="codex-entry"><h5>Full Moon</h5><p>Amplifies potency, aids renewal & clarifying brews.</p></div><div className="codex-entry"><h5>New Moon</h5><p>Favors beginnings, banishing, protection.</p></div><p className="unlockable">More lunar knowledge awaits...</p></div></div>
          <div className="codex-category"><h4><span className="category-icon">🧪</span>Brewing Techniques</h4><div className="codex-entries"><p className="unlockable">Master brewing to unlock techniques.</p></div></div>
          {/* Easter Egg Codex Page */}
          {secretCodeActive && (
             <div className="codex-category secret-category">
               <h4><span className="category-icon">🎮</span>Totally Radical 90s Magic</h4>
               <div className="codex-entries">
                 <div className="codex-entry secret-entry">
                   <h5 className="blink-text">AWESOME 90s SPELLS DUDE!</h5>
                   <div className="secret-content">
                     <p>Dial-Up Summoning: Requires patience and tolerating BEEPS and BOOPS.</p>
                     <p>Rewind Spell: Returns enchanted tapes to the start. Be kind, rewind!</p>
                     <p>Pog Collection: Trade circular talismans for POWER!</p>
                   </div>
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>
    );
  };


  // Render book mode
  const renderBookMode = () => {
    const entriesLeft = getBookPageEntries(activePage * 2); // Left page: 0, 2, 4...
    const entriesRight = getBookPageEntries(activePage * 2 + 1); // Right page: 1, 3, 5...
    const maxBookIndex = Math.ceil(filteredEntries.length / 8) -1; // 8 entries per 2-page spread

    return (
      <div className="journal-book" ref={bookRef}>
        <div className="book-pages">
          {/* Left Page */}
          <div className={`book-page page-left ${pageTransition === 'turning' && lastDirection === 'next' ? 'turning' : ''}`} ref={el => pageRefs.current[0] = el}>
            <div className="page-content">
              {entriesLeft.length > 0 ? entriesLeft.map(entry => (
                 <div key={entry.id} className={`book-entry-short ${entry.id === 'secret-90s-entry' ? 'secret-book-entry' : ''}`}>
                    <strong>T{entry.turn}:</strong> {entry.title || entry.text.substring(0, 80)}{entry.text.length > 80 ? '...' : ''}
                    {entry.id === 'secret-90s-entry' && <style>{`.secret-book-entry { font-family: "Comic Sans MS", cursive; background: linear-gradient(45deg, rgba(255,0,255,0.1), rgba(0,255,255,0.1)); border: 1px dashed #ff00ff; }`}</style>}
                  </div>
              )) : <p>...</p>}
            </div>
          </div>
          {/* Right Page */}
          <div className={`book-page page-right ${pageTransition === 'turning' && lastDirection === 'prev' ? 'turning' : ''}`} ref={el => pageRefs.current[1] = el}>
            <div className="page-content">
             {entriesRight.length > 0 ? entriesRight.map(entry => (
                 <div key={entry.id} className={`book-entry-short ${entry.id === 'secret-90s-entry' ? 'secret-book-entry' : ''}`}>
                    <strong>T{entry.turn}:</strong> {entry.title || entry.text.substring(0, 80)}{entry.text.length > 80 ? '...' : ''}
                    {entry.id === 'secret-90s-entry' && <style>{`.secret-book-entry { font-family: "Comic Sans MS", cursive; background: linear-gradient(-45deg, rgba(255,0,255,0.1), rgba(0,255,255,0.1)); border: 1px dashed #00ffff; } `}</style>}
                  </div>
              )) : <p>...</p>}
            </div>
          </div>
        </div>
        {/* Page turning controls */}
        <div className="book-controls">
          <button className="page-turn" onClick={() => turnPage('prev')} disabled={activePage <= 0 || pageTransition === 'turning'} aria-label="Previous page">◂</button>
          <div className="page-indicator">{activePage * 2 + 1}-{activePage * 2 + 2}</div>
          <button className="page-turn" onClick={() => turnPage('next')} disabled={activePage >= maxBookIndex || pageTransition === 'turning'} aria-label="Next page">▸</button>
        </div>
      </div>
    );
  };


  return (
    <div className="journal-container">
      <div className="journal-header">
        <h2><span className="section-icon">📖</span> Witch's Journal</h2>
        <div className="journal-tabs">
          <button className={`journal-tab ${currentTab === 'entries' ? 'active' : ''}`} onClick={() => setCurrentTab('entries')}>Entries {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}</button>
          <button className={`journal-tab ${currentTab === 'rituals' ? 'active' : ''}`} onClick={() => setCurrentTab('rituals')}>Rituals {rituals.filter(r=>r.unlocked).length > 0 && <span className="badge">{rituals.filter(r=>r.unlocked).length}</span>}</button>
          <button className={`journal-tab ${currentTab === 'rumors' ? 'active' : ''}`} onClick={() => setCurrentTab('rumors')}>Rumors {rumors.length > 0 && <span className="badge">{rumors.length}</span>}</button>
          <button className={`journal-tab ${currentTab === 'codex' ? 'active' : ''}`} onClick={() => setCurrentTab('codex')}>Codex</button>
        </div>
        <div className="journal-view-toggle">
          <button className={`view-toggle-btn ${!turnMode ? 'active' : ''}`} onClick={() => setTurnMode(false)} title="List View" aria-label="List View">☰</button>
          <button className={`view-toggle-btn ${turnMode ? 'active' : ''}`} onClick={() => setTurnMode(true)} title="Book View" aria-label="Book View">📖</button>
        </div>
      </div>

      <div className="journal-main">
        {turnMode && currentTab === 'entries' ? renderBookMode() : ( // Book mode only for Entries tab for now
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
             background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAOklEQVQYlWNkYGD4z0AEYGQwZGBgCGZAB4xoAiA5w4dCFBvRNcG8DTMJZhDMUHS/YFOIzY3ozmRAVwgA6gYPwm5CV5AAAAAASUVORK5CYII=') !important; /* Tiny repeating pattern */
             border: 2px ridge #ff00ff !important;
             font-family: "Comic Sans MS", cursive, sans-serif !important;
             position: relative;
             overflow: hidden;
           }
           .secret-entry .entry-header { background: none !important; } /* Override header style */
           .secret-entry .entry-title { color: lime !important; text-shadow: 1px 1px 0 #ff00ff !important; font-size: 18px !important; }
           .secret-entry .entry-content { background-color: rgba(17, 17, 17, 0.8) !important; color: lime !important; border-top-color: #ff00ff !important; font-size: 15px !important;}
           /* Add a subtle shimmer */
           .secret-entry::after {
             content: ""; position: absolute; top: 0; left: -150%; width: 100%; height: 100%;
             background: linear-gradient( to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 100% );
             transform: skewX(-25deg); animation: secretShimmer 4s infinite; z-index: 1;
           }
           @keyframes secretShimmer { 0% { left: -150%; } 100% { left: 150%; } }
         `}</style>
       )}

    </div>
  );
};

export default Journal;