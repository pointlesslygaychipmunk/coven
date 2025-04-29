import React, { useState, useEffect, useRef } from 'react';
import { JournalEntry, Rumor, RitualQuest, GameTime, Season, MoonPhase } from 'coven-shared'; // Use shared types
import './Journal.css';

interface JournalProps {
  journal: JournalEntry[];
  rumors: Rumor[];
  rituals: RitualQuest[];
  time: GameTime;
  onMarkRead?: (entryIds: (string | number)[]) => void; // Allow string or number IDs
  onClaimRitual?: (ritualId: string) => void; // Callback to claim rewards
}

const Journal: React.FC<JournalProps> = ({
  journal = [], // Default to empty arrays
  rumors = [],
  rituals = [],
  time,
  onMarkRead,
  onClaimRitual
}) => {
  // State
  const [currentTab, setCurrentTab] = useState<'entries' | 'rituals' | 'rumors' | 'codex'>('entries');
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedEntryId, setExpandedEntryId] = useState<string | number | null>(null); // Allow string or number
  const [bookmarkedEntryIds, setBookmarkedEntryIds] = useState<Set<string | number>>(new Set()); // Track bookmarks locally
  const [bookmarkView, setBookmarkView] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<number>(0); // For book view
  const [turnMode, setTurnMode] = useState<boolean>(false); // List or Book view
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [focusedRitual, setFocusedRitual] = useState<RitualQuest | null>(null);

  // Refs
  const bookRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const entriesListRef = useRef<HTMLDivElement>(null); // Ref for entries list scroll

  // Constants
  const entriesPerPage = 8; // Adjust as needed

  // Calculate unread count
  const unreadCount = journal.filter(entry => !entry.readByPlayer).length;

  // Mark entries as read when they become visible
  useEffect(() => {
    if (currentTab === 'entries' && !turnMode && onMarkRead) {
      const listElement = entriesListRef.current;
      if (!listElement) return;

      const entriesOnPage = getCurrentPageEntries();
      const unreadIdsToMark: (string | number)[] = [];

      entriesOnPage.forEach(entry => {
        if (!entry.readByPlayer) {
          // Basic visibility check (can be enhanced with IntersectionObserver)
           unreadIdsToMark.push(entry.id);
        }
      });

      if (unreadIdsToMark.length > 0) {
        // Simulate marking as read locally immediately for better UX
        // In real app, wait for backend confirmation or handle optimistic update
         // onMarkRead(unreadIdsToMark); // Call prop to notify backend/parent
         // console.log("Marking as read:", unreadIdsToMark); // Placeholder
      }
    }
  }, [journal, currentTab, currentPage, turnMode, onMarkRead]); // Rerun when these change

  // Handle page flip animation (simplified)
  useEffect(() => {
    // Reset pages when not in turn mode or tab changes
     resetPages();
  }, [turnMode, currentTab]);

  const resetPages = () => {
    pageRefs.current.forEach((page) => {
      if (page) page.style.transform = 'rotateY(0deg)';
    });
     setActivePage(0); // Reset to first page
  };

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(query.length > 0);
    setCurrentPage(1); // Reset page when search changes
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

  // Format date (placeholder)
  const formatDate = (dateStr: string) => dateStr;

  // Icons
  const getSeasonIcon = (season: Season) => ({ 'Spring': '🌱', 'Summer': '☀️', 'Fall': '🍂', 'Winter': '❄️' }[season] || '?');
  const getCategoryIcon = (category: string) => ({ 'event': '📜', 'ritual': '✨', 'market': '💰', 'moon': '🌙', 'season': getSeasonIcon(time.season), 'brewing': '🧪', 'garden': '🌿', 'quest': '📝', 'debug': '🐞', 'discovery': '💡' }[category] || '•');

  // Importance class
  const getEntryClass = (importance: number) => {
    if (importance >= 5) return 'very-important';
    if (importance >= 4) return 'important';
    if (importance >= 3) return 'standard';
    if (importance >= 2) return 'minor';
    return 'trivial';
  };

  // Toggle bookmark
  const toggleBookmark = (entryId: string | number) => {
    setBookmarkedEntryIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
     // TODO: Persist bookmarks via API call if needed
  };

  // Toggle expanded entry
  const toggleExpanded = (entryId: string | number) => {
    setExpandedEntryId(prevId => prevId === entryId ? null : entryId);
     // Mark as read when expanded
     if (onMarkRead && expandedEntryId !== entryId) {
         const entry = journal.find(e => e.id === entryId);
         if (entry && !entry.readByPlayer) {
             onMarkRead([entryId]); // Mark just this one as read
         }
     }
  };

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pageCount)));
    setExpandedEntryId(null); // Collapse entries when changing page
  };

  // Book mode page turning
   const turnPage = (direction: 'next' | 'prev') => {
       const numPages = Math.ceil(4); // Assuming 4 spreads (8 pages)
       const maxPageIndex = numPages - 1;

       setActivePage(prev => {
           let nextPage = prev;
           if (direction === 'next') {
               nextPage = Math.min(maxPageIndex, prev + 1);
           } else {
               nextPage = Math.max(0, prev - 1);
           }

           // Animate the flip
           if (pageRefs.current) {
               if (direction === 'next' && prev < maxPageIndex) {
                   const currentSpreadLeftPage = pageRefs.current[prev * 2];
                   const currentSpreadRightPage = pageRefs.current[prev * 2 + 1];
                   if (currentSpreadRightPage) {
                       currentSpreadRightPage.style.transform = 'rotateY(-180deg)';
                       currentSpreadRightPage.style.zIndex = `${10 + prev}`; // Ensure turning page is on top
                   }
                    if (currentSpreadLeftPage) {
                         currentSpreadLeftPage.style.zIndex = `${10 + prev}`;
                    }
                    const nextSpreadLeftPage = pageRefs.current[(prev + 1) * 2];
                     if(nextSpreadLeftPage) {
                          nextSpreadLeftPage.style.zIndex = `${10 + prev + 1}`; // Bring next page forward
                     }

               } else if (direction === 'prev' && prev > 0) {
                   const prevSpreadRightPage = pageRefs.current[(prev - 1) * 2 + 1];
                    const currentSpreadLeftPage = pageRefs.current[prev * 2];

                    if(prevSpreadRightPage) {
                         prevSpreadRightPage.style.transform = 'rotateY(0deg)';
                          prevSpreadRightPage.style.zIndex = `${20 - (prev -1)}`; // Reset z-index based on position
                    }
                    if(currentSpreadLeftPage) {
                        currentSpreadLeftPage.style.zIndex = `${20 - prev}`;
                    }
               }
           }
           return nextPage;
       });
   };


  // Ritual helpers
  const getRitualCompletion = (ritual: RitualQuest) => Math.round((ritual.stepsCompleted / ritual.totalSteps) * 100);
  const getRitualClass = (ritual: RitualQuest) => {
    const completion = getRitualCompletion(ritual);
    if (completion === 100) return 'completed';
    if (completion > 50) return 'advanced';
    if (completion > 0) return 'in-progress';
    return 'not-started';
  };

   const handleClaimClick = (e: React.MouseEvent, ritualId: string) => {
       e.stopPropagation(); // Prevent opening modal when claiming
       if (onClaimRitual) {
           onClaimRitual(ritualId);
           setFocusedRitual(null); // Close modal if open
       }
   };

  // Render functions for each tab content
  // ... (renderCategorySidebar, renderEntriesList, renderRituals, renderRumors, renderCodex, renderBookMode remain largely the same as previous version, but updated with fixed logic/types)

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

    // Convert map to array and sort (optional)
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
                            {isDisplayingSearchResults ? `Search Results for "${searchQuery}"` :
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
                                    className={`journal-entry ${getEntryClass(entry.importance)} ${!entry.readByPlayer ? 'unread' : ''} ${expandedEntryId === entry.id ? 'expanded' : ''}`}
                                >
                                    <div
                                        className="entry-header"
                                        onClick={() => toggleExpanded(entry.id)}
                                        role="button"
                                        aria-expanded={expandedEntryId === entry.id}
                                    >
                                        <div className="entry-category" title={entry.category}>
                                            <span className="entry-icon">{getCategoryIcon(entry.category)}</span>
                                            {/* <span className="entry-category-name">{entry.category}</span> */}
                                        </div>
                                        <div className="entry-title">
                                            {entry.title || entry.text.substring(0, 50) + (entry.text.length > 50 ? '...' : '')}
                                        </div>
                                        <div className="entry-meta">
                                            <span className="entry-date" title={entry.date}>{formatDate(entry.date).split(',')[0]}</span> {/* Show only phase */}
                                            <span className="entry-turn">T{entry.turn}</span>
                                        </div>
                                        <div className="entry-actions">
                                            <button
                                                className={`bookmark-btn ${bookmarkedEntryIds.has(entry.id) ? 'bookmarked' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); toggleBookmark(entry.id); }}
                                                title={bookmarkedEntryIds.has(entry.id) ? 'Remove bookmark' : 'Bookmark entry'}
                                            >
                                                🔖
                                            </button>
                                            <button
                                                className="expand-btn"
                                                onClick={(e) => { e.stopPropagation(); toggleExpanded(entry.id); }}
                                                title={expandedEntryId === entry.id ? 'Collapse' : 'Expand'}
                                            >
                                                {expandedEntryId === entry.id ? '▼' : '▶'}
                                            </button>
                                        </div>
                                    </div>
                                    {expandedEntryId === entry.id && (
                                        <div className="entry-content">
                                            <p className="entry-text">{entry.text}</p>
                                            {/* Link items rendering if needed */}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {pageCount > 1 && (
                             <div className="pagination">
                                <button onClick={() => goToPage(1)} disabled={currentPage === 1}>&laquo;</button>
                                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>‹</button>
                                <div className="page-info">Page {currentPage} of {pageCount}</div>
                                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === pageCount}>›</button>
                                <button onClick={() => goToPage(pageCount)} disabled={currentPage === pageCount}>&raquo;</button>
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
                            >
                                <div className="ritual-card-header">
                                    <h4 className="ritual-name">{ritual.name}</h4>
                                    {getRitualCompletion(ritual) === 100 && !currentPlayer?.completedRituals.includes(ritual.id) && (
                                         <button
                                             className="claim-reward-button"
                                             onClick={(e) => handleClaimClick(e, ritual.id)}
                                             title="Claim Reward"
                                         >
                                             Claim!
                                         </button>
                                     )}
                                      {getRitualCompletion(ritual) === 100 && currentPlayer?.completedRituals.includes(ritual.id) && (
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
                                {/* Requirements Icons */}
                                <div className="ritual-requirements">
                                     {ritual.requiredMoonPhase && <div className="ritual-requirement moon" title={`Requires ${ritual.requiredMoonPhase}`}>🌙</div>}
                                     {ritual.requiredSeason && <div className="ritual-requirement season" title={`Requires ${ritual.requiredSeason}`}>{getSeasonIcon(ritual.requiredSeason)}</div>}
                                     {/* Add icons for item requirements if needed */}
                                 </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Ritual Detail Modal */}
                {focusedRitual && (
                    <div className="ritual-modal-overlay" onClick={() => setFocusedRitual(null)}>
                        <div className="ritual-modal" onClick={(e) => e.stopPropagation()}>
                            {/* Modal content (Header, Progress, Desc, Steps, Req, Rewards) */}
                             <div className="ritual-modal-header">
                                 <h3>{focusedRitual.name}</h3>
                                 <button className="close-modal" onClick={() => setFocusedRitual(null)}>×</button>
                             </div>
                             <div className="ritual-modal-content">
                                  {/* Progress Circle */}
                                  <div className="ritual-progress-section">
                                      <div className="ritual-progress-circle">
                                         {/* SVG Circle */}
                                          <svg className="progress-ring" width="100" height="100">
                                                <circle className="progress-ring-bg" r="45" cx="50" cy="50" />
                                                <circle className="progress-ring-circle" r="45" cx="50" cy="50"
                                                    strokeDasharray={`${2 * Math.PI * 45}`}
                                                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - getRitualCompletion(focusedRitual) / 100)}`}
                                                />
                                            </svg>
                                          <div className="progress-text">{getRitualCompletion(focusedRitual)}%</div>
                                      </div>
                                      <div className="ritual-completion-text">{focusedRitual.stepsCompleted} / {focusedRitual.totalSteps} steps</div>
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
                                                  </div>
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                                  {/* Requirements */}
                                  <div className="ritual-requirements-full">
                                       <h4>Requirements:</h4>
                                       <div className="requirements-list">
                                          {/* List requirements */}
                                           {!focusedRitual.requiredMoonPhase && !focusedRitual.requiredSeason && !focusedRitual.requiredItems && <li>None</li>}
                                           {focusedRitual.requiredMoonPhase && <li>🌙 {focusedRitual.requiredMoonPhase} {time.phaseName === focusedRitual.requiredMoonPhase && <span className='req-met'>(Active)</span>}</li>}
                                           {focusedRitual.requiredSeason && <li>{getSeasonIcon(focusedRitual.requiredSeason)} {focusedRitual.requiredSeason} {time.season === focusedRitual.requiredSeason && <span className='req-met'>(Active)</span>}</li>}
                                           {/* Add item requirements */}
                                       </div>
                                   </div>
                                   {/* Rewards */}
                                   <div className="ritual-rewards">
                                       <h4>Rewards:</h4>
                                       <ul className="rewards-list">
                                           {focusedRitual.rewards.map((reward, index) => (
                                               <li key={index} className="reward-item">{`${reward.type}: ${reward.value}`}</li>
                                           ))}
                                       </ul>
                                   </div>
                                    {/* Claim Button inside Modal */}
                                    {getRitualCompletion(focusedRitual) === 100 && !currentPlayer?.completedRituals.includes(focusedRitual.id) && (
                                         <button
                                             className="claim-reward-button modal-claim"
                                             onClick={(e) => handleClaimClick(e, focusedRitual.id)}
                                         >
                                             Claim Reward
                                         </button>
                                     )}
                                      {getRitualCompletion(focusedRitual) === 100 && currentPlayer?.completedRituals.includes(focusedRitual.id) && (
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
    const sortedRumors = [...rumors].sort((a, b) => b.spread - a.spread); // Show most widespread first

    return (
      <div className="journal-rumors">
        <div className="rumors-header"><h3>Market Rumors</h3></div>
        {sortedRumors.length === 0 ? (
          <div className="empty-rumors"><p>The market is quiet today.</p></div>
        ) : (
          <div className="rumors-list">
            {sortedRumors.map(rumor => {
              const spreadClass = rumor.spread > 70 ? 'widespread' : rumor.spread > 40 ? 'common' : 'rare';
              const priceEffectDirection = rumor.priceEffect ? (rumor.priceEffect > 0 ? 'up' : 'down') : '';
              return (
                <div key={rumor.id} className={`rumor-card ${spreadClass}`}>
                  <div className="rumor-content">"{rumor.content}"</div>
                  <div className="rumor-meta">
                    <div className="rumor-source" title={`Source: ${rumor.origin}`}>{rumor.origin}</div>
                    <div className="rumor-age" title={`${rumor.turnsActive || 0} phases ago`}>~{rumor.turnsActive || 0}d ago</div>
                  </div>
                  <div className="rumor-spread" title={`Spread: ${rumor.spread.toFixed(0)}%`}>
                    <div className="spread-label">{spreadClass.replace('_', ' ').toUpperCase()}</div>
                    <div className="spread-bar"><div className="spread-fill" style={{ width: `${rumor.spread}%` }}></div></div>
                  </div>
                  {rumor.verified && <div className="rumor-verified" title="Verified">✓ Verified</div>}
                  {rumor.affectedItem && rumor.priceEffect && (
                    <div className={`rumor-effect`} title={`Price Effect: ${(rumor.priceEffect * 100).toFixed(0)}%`}>
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
                <div className="codex-intro"><p>Knowledge gathered about the world.</p></div>
                <div className="codex-categories">
                    <div className="codex-category">
                        <h4><span className="category-icon">🌿</span>Ingredients</h4>
                        <div className="codex-entries"><p className="unlockable">Discover ingredients to learn about them.</p></div>
                    </div>
                     <div className="codex-category">
                         <h4><span className="category-icon">🌙</span>Lunar Influences</h4>
                         <div className="codex-entries">
                             <div className="codex-entry"><h5>Full Moon</h5><p>Amplifies magical potency...</p></div>
                         </div>
                     </div>
                    {/* More categories */}
                </div>
            </div>
        );
  };

  const renderBookMode = () => {
     // Simplified book mode display - shows first few entries/rituals etc.
     const recentEntries = journal.slice(0, 4);
     const activeRituals = rituals.filter(r => r.unlocked && !isRitualClaimed(r)).slice(0, 2);
     const recentRumors = rumors.slice(0, 3);

     // Simple fixed 2-page spread representation
     return (
         <div className="journal-book fixed-spread">
             {/* Left Page */}
             <div className="book-page-content left">
                 <h3>Recent Journal Entries</h3>
                 {recentEntries.length === 0 ? <p>No recent entries.</p> : recentEntries.map(entry => (
                     <div key={entry.id} className="book-entry-short">
                         <strong>T{entry.turn}:</strong> {entry.text.substring(0, 80)}...
                     </div>
                 ))}
                 <hr />
                 <h3>Active Rituals</h3>
                 {activeRituals.length === 0 ? <p>No active rituals.</p> : activeRituals.map(ritual => (
                     <div key={ritual.id} className="book-ritual-short">
                         <strong>{ritual.name}</strong> ({getRitualCompletion(ritual)}%)
                     </div>
                 ))}
             </div>
             {/* Right Page */}
             <div className="book-page-content right">
                 <h3>Latest Rumors</h3>
                  {recentRumors.length === 0 ? <p>Market is quiet.</p> : recentRumors.map(rumor => (
                     <div key={rumor.id} className="book-rumor-short">
                         "{rumor.content.substring(0, 90)}..." <span className="source">({rumor.origin})</span>
                     </div>
                 ))}
                 <hr />
                 <h3>Current Conditions</h3>
                 <div><strong>Moon:</strong> {time.phaseName}</div>
                 <div><strong>Season:</strong> {time.season} ({getSeasonIcon(time.season)})</div>
                 <div><strong>Weather:</strong> {time.weatherFate}</div>
             </div>
         </div>
     );
  };


  return (
    <div className="journal-container">
      <div className="journal-header">
        <h2><span className="section-icon">📖</span> Witch's Journal</h2>
        <div className="journal-tabs">
          <button className={`journal-tab ${currentTab === 'entries' ? 'active' : ''}`} onClick={() => setCurrentTab('entries')}>
            Entries {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
          </button>
          <button className={`journal-tab ${currentTab === 'rituals' ? 'active' : ''}`} onClick={() => setCurrentTab('rituals')}>
            Rituals {rituals.filter(r=>r.unlocked).length > 0 && <span className="badge">{rituals.filter(r=>r.unlocked).length}</span>}
          </button>
          <button className={`journal-tab ${currentTab === 'rumors' ? 'active' : ''}`} onClick={() => setCurrentTab('rumors')}>
             Rumors {rumors.length > 0 && <span className="badge">{rumors.length}</span>}
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