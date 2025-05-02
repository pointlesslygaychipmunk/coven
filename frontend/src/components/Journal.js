import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import './Journal.css';
const Journal = ({ journal = [], rumors = [], rituals = [], time, onMarkRead, player, onClaimRitual }) => {
    // State
    const [currentTab, setCurrentTab] = useState('entries');
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedEntryId, setExpandedEntryId] = useState(null);
    const [bookmarkedEntryIds, setBookmarkedEntryIds] = useState(new Set());
    const [bookmarkView, setBookmarkView] = useState(false);
    const [activePage, setActivePage] = useState(0); // For book view
    const [turnMode, setTurnMode] = useState(false); // true for book view
    const [isSearching, setIsSearching] = useState(false);
    const [focusedRitual, setFocusedRitual] = useState(null);
    const [pageTransition, setPageTransition] = useState('none');
    const [lastDirection, setLastDirection] = useState('next');
    // 90s Easter Egg: Secret journal entry
    const [secretCodeActive, setSecretCodeActive] = useState(false);
    const [secretCodeProgress, setSecretCodeProgress] = useState('');
    const secretCode = "witch"; // The secret word
    // Refs
    const bookRef = useRef(null);
    const pageRefs = useRef([]);
    const entriesListRef = useRef(null);
    // Constants
    const entriesPerPage = 8; // Entries per page in list view
    // Calculate unread count for the badge
    const unreadCount = journal.filter(entry => !entry.readByPlayer).length;
    // 90s Easter Egg: Secret code detection
    useEffect(() => {
        const handleKeyDown = (e) => {
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
            }
            else {
                // Reset progress if wrong key is pressed, starting with the current key if it matches the beginning
                if (secretCode[0] === key) {
                    setSecretCodeProgress(key);
                }
                else {
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
                    if (onMarkRead)
                        onMarkRead(unreadIdsToMark);
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
            if (page)
                page.style.transform = 'rotateY(0deg)';
        });
        setActivePage(0);
    };
    // Handle search query change
    const handleSearchChange = (e) => {
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
        }
        else if (filter !== 'all') {
            entries = entries.filter(entry => entry.category === filter);
        }
        if (isSearching) {
            const queryLower = searchQuery.toLowerCase();
            entries = entries.filter(entry => entry.text.toLowerCase().includes(queryLower) ||
                (entry.title && entry.title.toLowerCase().includes(queryLower)) || // Check title if it exists
                entry.category.toLowerCase().includes(queryLower));
        }
        // Add in the secret easter egg entry when code is active
        if (secretCodeActive && !isSearching && filter === 'all' && !bookmarkView) {
            const secretEntry = {
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
        return filteredEntries.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
    };
    // Get entries for book mode (split across pages)
    const getBookPageEntries = (pageIndex) => {
        const entriesPerBookPage = 4;
        const startIdx = pageIndex * entriesPerBookPage;
        return filteredEntries.slice(startIdx, startIdx + entriesPerBookPage);
    };
    // Format date (simple version)
    const formatDate = (dateStr) => {
        // Attempt to extract just the season/year part if available
        const parts = dateStr?.split(',');
        if (parts && parts.length >= 2) {
            return parts[1].trim(); // e.g., "Spring Y1"
        }
        return dateStr || "Unknown Date"; // Fallback
    };
    const getSeasonIcon = (season) => {
        if (!season)
            return '?';
        const icons = { 'Spring': '🌱', 'Summer': '☀️', 'Fall': '🍂', 'Winter': '❄️' };
        return icons[season] || '?';
    };
    const getCategoryIcon = (category) => {
        const icons = {
            'event': '📜', 'ritual': '✨', 'market': '💰', 'moon': '🌙',
            'season': getSeasonIcon(time.season), // Dynamic season icon
            'brewing': '🧪', 'garden': '🌿', 'quest': '📝', 'debug': '🐞',
            'discovery': '💡', 'error': '❌', 'skill': '⭐', 'weather': '🌤️',
            'reward': '🎁', 'easter egg': '🎮'
        };
        return icons[category] || '•'; // Default bullet
    };
    // Importance class for border
    const getEntryClass = (importance) => {
        if (importance >= 5)
            return 'very-important';
        if (importance >= 4)
            return 'important';
        if (importance >= 3)
            return 'standard';
        if (importance >= 2)
            return 'minor';
        return 'trivial';
    };
    // Toggle bookmark
    const toggleBookmark = (entryId, e) => {
        if (e)
            e.stopPropagation();
        setBookmarkedEntryIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(entryId))
                newSet.delete(entryId);
            else
                newSet.add(entryId);
            return newSet;
        });
    };
    // Toggle expanded entry
    const toggleExpanded = (entryId) => {
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
    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, pageCount || 1))); // Ensure page is valid
        setExpandedEntryId(null); // Collapse entries when changing pages
    };
    // Book mode page turning with animation
    const turnPage = (direction) => {
        const maxPageIndex = Math.max(0, bookPageCount - 1); // Calculate max index for book view
        // Prevent turning if already at boundary or mid-transition
        if (pageTransition === 'turning')
            return;
        if (direction === 'prev' && activePage <= 0)
            return;
        if (direction === 'next' && activePage >= maxPageIndex)
            return;
        setLastDirection(direction);
        setPageTransition('turning'); // Start animation
        // Update active page after a delay (half animation time)
        setTimeout(() => {
            setActivePage(prev => {
                let nextPage = prev;
                if (direction === 'next')
                    nextPage = Math.min(maxPageIndex, prev + 1);
                else
                    nextPage = Math.max(0, prev - 1);
                return nextPage;
            });
            // Animation cleanup happens in useEffect based on pageTransition state
        }, 400);
    };
    // Ritual helper: Check if claimed by the current player
    const isRitualClaimed = (ritual) => {
        return player.completedRituals.includes(ritual.id);
    };
    // Ritual helpers
    const getRitualCompletion = (ritual) => {
        if (!ritual || ritual.totalSteps <= 0)
            return 0;
        return Math.min(100, Math.round((ritual.stepsCompleted / ritual.totalSteps) * 100));
    };
    const getRitualClass = (ritual) => {
        if (isRitualClaimed(ritual))
            return 'claimed';
        const completion = getRitualCompletion(ritual);
        if (completion >= 100)
            return 'completed'; // Changed to >= 100
        if (completion > 50)
            return 'advanced';
        if (completion > 0)
            return 'in-progress';
        return 'not-started';
    };
    const handleClaimClick = (e, ritualId) => {
        e.stopPropagation();
        if (onClaimRitual) {
            onClaimRitual(ritualId);
            setFocusedRitual(null); // Close modal after claiming
        }
    };
    // ---- Render Functions ----
    // Render categories sidebar
    const renderCategorySidebar = () => {
        const categoriesMap = {
            all: { name: 'All Entries', icon: '📚', count: 0 }, // Start count at 0
        };
        // Count entries per category, considering search results if active
        const entriesToCount = isSearching ? filteredEntries : journal;
        let totalCount = 0;
        entriesToCount.forEach(entry => {
            // Exclude secret entry from counts unless specifically searching for it
            if (entry.id === 'secret-90s-entry' && !isSearching)
                return;
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
        return (_jsxs("div", { className: "journal-categories", children: [_jsx("div", { className: "categories-header", children: _jsx("h3", { children: "Categories" }) }), _jsxs("div", { className: "category-list", children: [sortedCategories.map(category => (_jsxs("div", { className: `category-item ${filter === category.id && !bookmarkView && !isSearching ? 'active' : ''}`, onClick: () => {
                                setFilter(category.id);
                                setCurrentPage(1);
                                setBookmarkView(false);
                                setIsSearching(false);
                                setSearchQuery(''); // Clear search on category click
                            }, role: "button", children: [_jsx("span", { className: "category-icon", children: category.icon }), _jsx("span", { className: "category-name", children: category.name }), _jsx("span", { className: "category-count", children: category.count })] }, category.id))), _jsxs("div", { className: `category-item ${bookmarkView ? 'active' : ''}`, onClick: () => {
                                setBookmarkView(true);
                                setFilter('all');
                                setCurrentPage(1);
                                setIsSearching(false);
                                setSearchQuery(''); // Clear search
                            }, role: "button", children: [_jsx("span", { className: "category-icon", children: "\uD83D\uDD16" }), _jsx("span", { className: "category-name", children: "Bookmarked" }), _jsx("span", { className: "category-count", children: bookmarkedEntryIds.size })] })] })] }));
    };
    // Render entries list (standard mode)
    const renderEntriesList = () => {
        const entries = getCurrentPageEntries();
        const isDisplayingSearchResults = isSearching && searchQuery.length > 0;
        return (_jsxs("div", { className: "journal-entries", children: [_jsxs("div", { className: "entries-header", children: [_jsxs("div", { className: "header-title", children: [_jsx("h3", { children: isDisplayingSearchResults ? `Search Results` :
                                        bookmarkView ? 'Bookmarked Entries' :
                                            filter === 'all' ? 'All Journal Entries' :
                                                `${filter.charAt(0).toUpperCase() + filter.slice(1)} Entries` }), unreadCount > 0 && !bookmarkView && filter === 'all' && !isDisplayingSearchResults && (_jsxs("div", { className: "unread-badge", children: [unreadCount, " unread"] }))] }), _jsx("div", { className: "search-container", children: _jsx("input", { type: "text", value: searchQuery, onChange: handleSearchChange, placeholder: "Search journal...", className: "search-input" }) })] }), isDisplayingSearchResults && filteredEntries.length > 0 && (_jsxs("div", { className: "search-results-header", children: ["Found ", filteredEntries.length, " entries matching \"", searchQuery, "\""] })), entries.length === 0 ? (_jsx("div", { className: "empty-entries", children: isDisplayingSearchResults ? _jsx("p", { children: "No entries match your search." }) :
                        bookmarkView ? _jsx("p", { children: "You haven't bookmarked any entries yet." }) :
                            _jsx("p", { children: "No entries found in this category." }) })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "entries-list", ref: entriesListRef, children: entries.map(entry => (_jsxs("div", { 
                                // Apply secret-entry class conditionally
                                className: `journal-entry ${getEntryClass(entry.importance)} ${!entry.readByPlayer ? 'unread' : ''} ${expandedEntryId === entry.id ? 'expanded' : ''} ${entry.id === 'secret-90s-entry' ? 'secret-entry' : ''}`, children: [_jsxs("div", { className: "entry-header", onClick: () => toggleExpanded(entry.id), role: "button", "aria-expanded": expandedEntryId === entry.id, children: [_jsx("div", { className: "entry-category", title: entry.category, children: _jsx("span", { className: "entry-icon", children: getCategoryIcon(entry.category) }) }), _jsx("div", { className: "entry-title", children: entry.title || entry.text.substring(0, 50) + (entry.text.length > 50 ? '...' : '') }), _jsxs("div", { className: "entry-meta", children: [_jsx("span", { className: "entry-date", title: entry.date, children: formatDate(entry.date) }), _jsxs("span", { className: "entry-turn", children: ["T", entry.turn] })] }), _jsxs("div", { className: "entry-actions", children: [_jsx("button", { className: `bookmark-btn ${bookmarkedEntryIds.has(entry.id) ? 'bookmarked' : ''}`, onClick: (e) => toggleBookmark(entry.id, e), title: bookmarkedEntryIds.has(entry.id) ? 'Remove bookmark' : 'Bookmark entry', "aria-label": bookmarkedEntryIds.has(entry.id) ? 'Remove bookmark' : 'Bookmark entry', children: "\uD83D\uDD16" }), _jsx("button", { className: "expand-btn", onClick: (e) => { e.stopPropagation(); toggleExpanded(entry.id); }, title: expandedEntryId === entry.id ? 'Collapse' : 'Expand', "aria-label": expandedEntryId === entry.id ? 'Collapse' : 'Expand', children: expandedEntryId === entry.id ? '▼' : '▶' })] })] }), expandedEntryId === entry.id && (_jsxs("div", { className: "entry-content", children: [entry.title && _jsx("h4", { style: { marginTop: 0, marginBottom: '10px', fontSize: '16px', color: '#4e342e' }, children: entry.title }), _jsx("p", { className: "entry-text", children: entry.text })] }))] }, entry.id))) }), pageCount > 1 && (_jsxs("div", { className: "pagination", children: [_jsx("button", { className: "pagination-btn", onClick: () => goToPage(1), disabled: currentPage === 1, children: "\u00AB" }), _jsx("button", { className: "pagination-btn", onClick: () => goToPage(currentPage - 1), disabled: currentPage === 1, children: "\u2039" }), _jsxs("div", { className: "page-info", children: ["Page ", currentPage, " of ", pageCount] }), _jsx("button", { className: "pagination-btn", onClick: () => goToPage(currentPage + 1), disabled: currentPage === pageCount, children: "\u203A" }), _jsx("button", { className: "pagination-btn", onClick: () => goToPage(pageCount), disabled: currentPage === pageCount, children: "\u00BB" })] }))] }))] }));
    };
    // Render rituals section
    const renderRituals = () => {
        const unlockedRituals = rituals.filter(ritual => ritual.unlocked);
        return (_jsxs("div", { className: "journal-rituals", children: [_jsx("div", { className: "rituals-header", children: _jsx("h3", { children: "Ritual Quests" }) }), unlockedRituals.length === 0 ? (_jsx("div", { className: "empty-rituals", children: _jsx("p", { children: "No active rituals found." }) })) : (_jsx("div", { className: "rituals-grid", children: unlockedRituals.map(ritual => (_jsxs("div", { className: `ritual-card ${getRitualClass(ritual)}`, onClick: () => setFocusedRitual(ritual), role: "button", tabIndex: 0, children: [_jsxs("div", { className: "ritual-card-header", children: [_jsx("div", { className: "ritual-name", children: ritual.name }), getRitualCompletion(ritual) >= 100 && !isRitualClaimed(ritual) && ( // Changed to >= 100
                                    _jsx("button", { className: "claim-reward-button", onClick: (e) => handleClaimClick(e, ritual.id), title: "Claim Reward", children: "Claim!" })), getRitualCompletion(ritual) >= 100 && isRitualClaimed(ritual) && ( // Changed to >= 100
                                    _jsx("span", { className: "claimed-badge", title: "Reward Claimed", children: "\u2713" })), getRitualCompletion(ritual) < 100 && (_jsxs("div", { className: "ritual-completion", children: [getRitualCompletion(ritual), "%"] }))] }), _jsx("div", { className: "ritual-progress-bar", children: _jsx("div", { className: "ritual-progress-fill", style: { width: `${getRitualCompletion(ritual)}%` } }) }), _jsxs("div", { className: "ritual-description", children: [ritual.description.substring(0, 80), "..."] }), _jsxs("div", { className: "ritual-requirements", children: [ritual.requiredMoonPhase && _jsx("div", { className: "ritual-requirement moon", title: `Requires ${ritual.requiredMoonPhase}`, children: _jsx("span", { className: "requirement-icon", children: "\uD83C\uDF19" }) }), ritual.requiredSeason && _jsx("div", { className: "ritual-requirement season", title: `Requires ${ritual.requiredSeason}`, children: _jsx("span", { className: "requirement-icon", children: getSeasonIcon(ritual.requiredSeason) }) })] })] }, ritual.id))) })), focusedRitual && (_jsx("div", { className: "ritual-modal-overlay", onClick: () => setFocusedRitual(null), children: _jsxs("div", { className: "ritual-modal", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "ritual-modal-header", children: [_jsx("h3", { children: focusedRitual.name }), _jsx("button", { className: "close-modal", onClick: () => setFocusedRitual(null), children: "\u00D7" })] }), _jsxs("div", { className: "ritual-modal-content", children: [_jsxs("div", { className: "ritual-progress-section", children: [_jsxs("div", { className: "ritual-progress-circle", children: [_jsxs("svg", { className: "progress-ring", width: "90", height: "90", children: [" ", _jsx("circle", { className: "progress-ring-bg", r: "40", cx: "45", cy: "45" }), " ", _jsx("circle", { className: "progress-ring-circle", r: "40", cx: "45", cy: "45", strokeDasharray: `${2 * Math.PI * 40}`, strokeDashoffset: `${2 * Math.PI * 40 * (1 - getRitualCompletion(focusedRitual) / 100)}` })] }), _jsxs("div", { className: "progress-text", children: [getRitualCompletion(focusedRitual), "%"] })] }), _jsxs("div", { className: "ritual-completion-text", children: [focusedRitual.stepsCompleted, " / ", focusedRitual.totalSteps, " steps"] })] }), _jsx("div", { className: "ritual-description-full", children: focusedRitual.description }), _jsxs("div", { className: "ritual-steps", children: [_jsx("h4", { children: "Steps:" }), _jsx("ul", { className: "steps-list", children: focusedRitual.steps.map((step, index) => (_jsxs("li", { className: `ritual-step ${step.completed ? 'completed' : ''}`, children: [_jsx("div", { className: "step-check", children: step.completed ? '✓' : '○' }), _jsxs("div", { className: "step-details", children: [_jsx("div", { className: "step-description", children: step.description }), step.completedDate && (_jsxs("div", { className: "step-completed-date", children: ["Completed: ", step.completedDate] }))] })] }, index))) })] }), _jsxs("div", { className: "ritual-requirements-full", children: [_jsx("h4", { children: "Requirements:" }), _jsxs("div", { className: "requirements-list", children: [!focusedRitual.requiredMoonPhase && !focusedRitual.requiredSeason && !focusedRitual.requiredItems && (_jsx("div", { className: "ritual-requirement", children: "None" })), focusedRitual.requiredMoonPhase && (_jsxs("div", { className: "ritual-requirement", children: [_jsx("span", { className: "requirement-icon", children: "\uD83C\uDF19" }), _jsx("span", { className: "requirement-label", children: "Moon Phase:" }), _jsxs("span", { className: "requirement-text", children: [focusedRitual.requiredMoonPhase, time.phaseName === focusedRitual.requiredMoonPhase && (_jsx("span", { className: 'req-met', children: "(Active)" }))] })] })), focusedRitual.requiredSeason && (_jsxs("div", { className: "ritual-requirement", children: [_jsx("span", { className: "requirement-icon", children: getSeasonIcon(focusedRitual.requiredSeason) }), _jsx("span", { className: "requirement-label", children: "Season:" }), _jsxs("span", { className: "requirement-text", children: [focusedRitual.requiredSeason, time.season === focusedRitual.requiredSeason && (_jsx("span", { className: 'req-met', children: "(Active)" }))] })] }))] })] }), _jsxs("div", { className: "ritual-rewards", children: [_jsx("h4", { children: "Rewards:" }), _jsx("ul", { className: "rewards-list", children: focusedRitual.rewards.map((reward, index) => (_jsx("li", { className: "reward-item", children: `${reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}: ${reward.value} ${reward.quantity ? `(x${reward.quantity})` : ''}` }, index))) })] }), getRitualCompletion(focusedRitual) >= 100 && !isRitualClaimed(focusedRitual) && ( // Changed to >= 100
                                    _jsx("button", { className: "claim-reward-button modal-claim", onClick: (e) => handleClaimClick(e, focusedRitual.id), children: "Claim Reward" })), getRitualCompletion(focusedRitual) >= 100 && isRitualClaimed(focusedRitual) && ( // Changed to >= 100
                                    _jsx("div", { className: "claimed-badge modal-claimed", children: "Reward Claimed \u2713" }))] })] }) }))] }));
    };
    // Render rumors section
    const renderRumors = () => {
        const sortedRumors = [...rumors].sort((a, b) => (b.spread ?? 0) - (a.spread ?? 0));
        return (_jsxs("div", { className: "journal-rumors", children: [_jsx("div", { className: "rumors-header", children: _jsx("h3", { children: "Market Whispers" }) }), sortedRumors.length === 0 ? (_jsx("div", { className: "empty-rumors", children: _jsx("p", { children: "The market is quiet today." }) })) : (_jsx("div", { className: "rumors-list", children: sortedRumors.map(rumor => {
                        const spreadClass = (rumor.spread ?? 0) > 70 ? 'widespread' : (rumor.spread ?? 0) > 40 ? 'common' : 'rare';
                        const priceEffectDirection = rumor.priceEffect ? (rumor.priceEffect > 0 ? 'up' : 'down') : '';
                        return (_jsxs("div", { className: `rumor-card ${spreadClass}`, style: { '--rumor-spread': `${rumor.spread ?? 0}` }, children: [_jsx("div", { className: "rumor-content", children: rumor.content }), _jsxs("div", { className: "rumor-meta", children: [_jsx("span", { className: "rumor-source", children: rumor.origin }), _jsxs("span", { className: "rumor-age", children: ["~", rumor.turnsActive || 0, "d ago"] })] }), _jsxs("div", { className: "rumor-spread", title: `Spread: ${rumor.spread?.toFixed(0) ?? 0}%`, children: [_jsx("div", { className: "spread-label", children: spreadClass }), _jsx("div", { className: "spread-bar", children: _jsx("div", { className: "spread-fill", style: { width: `${rumor.spread ?? 0}%` } }) })] }), rumor.verified && (_jsxs("div", { className: "rumor-verified", title: "Verified", children: [_jsx("span", { className: "verified-icon", children: "\u2713" }), " Verified"] })), rumor.affectedItem && rumor.priceEffect && (_jsxs("div", { className: "rumor-effect", title: `Price Effect: ${(rumor.priceEffect * 100).toFixed(0)}%`, children: [_jsx("span", { className: "effect-label", children: "Affects:" }), _jsx("span", { className: "effect-value", children: rumor.affectedItem }), _jsx("span", { className: `effect-direction ${priceEffectDirection}`, children: priceEffectDirection === 'up' ? '▲' : priceEffectDirection === 'down' ? '▼' : '' })] }))] }, rumor.id));
                    }) }))] }));
    };
    // Render codex section
    const renderCodex = () => {
        return (_jsxs("div", { className: "journal-codex", children: [_jsx("div", { className: "codex-header", children: _jsx("h3", { children: "Witch's Codex" }) }), _jsx("div", { className: "codex-intro", children: _jsx("p", { children: "Recorded secrets of the craft. More reveals itself as you discover..." }) }), _jsxs("div", { className: "codex-categories", children: [_jsxs("div", { className: "codex-category", children: [_jsxs("h4", { children: [_jsx("span", { className: "category-icon", children: "\uD83C\uDF3F" }), "Ingredients"] }), _jsx("div", { className: "codex-entries", children: _jsx("p", { className: "unlockable", children: "Discover ingredients to reveal properties." }) })] }), _jsxs("div", { className: "codex-category", children: [_jsxs("h4", { children: [_jsx("span", { className: "category-icon", children: "\uD83C\uDF19" }), "Lunar Influences"] }), _jsxs("div", { className: "codex-entries", children: [_jsxs("div", { className: "codex-entry", children: [_jsx("h5", { children: "Full Moon" }), _jsx("p", { children: "Amplifies potency, aids renewal & clarifying brews." })] }), _jsxs("div", { className: "codex-entry", children: [_jsx("h5", { children: "New Moon" }), _jsx("p", { children: "Favors beginnings, banishing, protection." })] }), _jsx("p", { className: "unlockable", children: "More lunar knowledge awaits..." })] })] }), _jsxs("div", { className: "codex-category", children: [_jsxs("h4", { children: [_jsx("span", { className: "category-icon", children: "\uD83E\uDDEA" }), "Brewing Techniques"] }), _jsx("div", { className: "codex-entries", children: _jsx("p", { className: "unlockable", children: "Master brewing to unlock techniques." }) })] }), secretCodeActive && (_jsxs("div", { className: "codex-category secret-category", children: [_jsxs("h4", { children: [_jsx("span", { className: "category-icon", children: "\uD83C\uDFAE" }), "Totally Radical 90s Magic"] }), _jsx("div", { className: "codex-entries", children: _jsxs("div", { className: "codex-entry secret-entry", children: [_jsx("h5", { className: "blink-text", children: "AWESOME 90s SPELLS DUDE!" }), _jsxs("div", { className: "secret-content", children: [_jsx("p", { children: "Dial-Up Summoning: Requires patience and tolerating BEEPS and BOOPS." }), _jsx("p", { children: "Rewind Spell: Returns enchanted tapes to the start. Be kind, rewind!" }), _jsx("p", { children: "Pog Collection: Trade circular talismans for POWER!" })] })] }) })] }))] })] }));
    };
    // Render book mode
    const renderBookMode = () => {
        const entriesLeft = getBookPageEntries(activePage * 2); // Left page: 0, 2, 4...
        const entriesRight = getBookPageEntries(activePage * 2 + 1); // Right page: 1, 3, 5...
        const maxBookIndex = Math.ceil(filteredEntries.length / 8) - 1; // 8 entries per 2-page spread
        return (_jsxs("div", { className: "journal-book", ref: bookRef, children: [_jsxs("div", { className: "book-pages", children: [_jsx("div", { className: `book-page page-left ${pageTransition === 'turning' && lastDirection === 'next' ? 'turning' : ''}`, ref: el => pageRefs.current[0] = el, children: _jsx("div", { className: "page-content", children: entriesLeft.length > 0 ? entriesLeft.map(entry => (_jsxs("div", { className: `book-entry-short ${entry.id === 'secret-90s-entry' ? 'secret-book-entry' : ''}`, children: [_jsxs("strong", { children: ["T", entry.turn, ":"] }), " ", entry.title || entry.text.substring(0, 80), entry.text.length > 80 ? '...' : '', entry.id === 'secret-90s-entry' && _jsx("style", { children: `.secret-book-entry { font-family: "Comic Sans MS", cursive; background: linear-gradient(45deg, rgba(255,0,255,0.1), rgba(0,255,255,0.1)); border: 1px dashed #ff00ff; }` })] }, entry.id))) : _jsx("p", { children: "..." }) }) }), _jsx("div", { className: `book-page page-right ${pageTransition === 'turning' && lastDirection === 'prev' ? 'turning' : ''}`, ref: el => pageRefs.current[1] = el, children: _jsx("div", { className: "page-content", children: entriesRight.length > 0 ? entriesRight.map(entry => (_jsxs("div", { className: `book-entry-short ${entry.id === 'secret-90s-entry' ? 'secret-book-entry' : ''}`, children: [_jsxs("strong", { children: ["T", entry.turn, ":"] }), " ", entry.title || entry.text.substring(0, 80), entry.text.length > 80 ? '...' : '', entry.id === 'secret-90s-entry' && _jsx("style", { children: `.secret-book-entry { font-family: "Comic Sans MS", cursive; background: linear-gradient(-45deg, rgba(255,0,255,0.1), rgba(0,255,255,0.1)); border: 1px dashed #00ffff; } ` })] }, entry.id))) : _jsx("p", { children: "..." }) }) })] }), _jsxs("div", { className: "book-controls", children: [_jsx("button", { className: "page-turn", onClick: () => turnPage('prev'), disabled: activePage <= 0 || pageTransition === 'turning', "aria-label": "Previous page", children: "\u25C2" }), _jsxs("div", { className: "page-indicator", children: [activePage * 2 + 1, "-", activePage * 2 + 2] }), _jsx("button", { className: "page-turn", onClick: () => turnPage('next'), disabled: activePage >= maxBookIndex || pageTransition === 'turning', "aria-label": "Next page", children: "\u25B8" })] })] }));
    };
    return (_jsxs("div", { className: "journal-container", children: [_jsxs("div", { className: "journal-header", children: [_jsxs("h2", { children: [_jsx("span", { className: "section-icon", children: "\uD83D\uDCD6" }), " Witch's Journal"] }), _jsxs("div", { className: "journal-tabs", children: [_jsxs("button", { className: `journal-tab ${currentTab === 'entries' ? 'active' : ''}`, onClick: () => setCurrentTab('entries'), children: ["Entries ", unreadCount > 0 && _jsx("span", { className: "unread-count", children: unreadCount })] }), _jsxs("button", { className: `journal-tab ${currentTab === 'rituals' ? 'active' : ''}`, onClick: () => setCurrentTab('rituals'), children: ["Rituals ", rituals.filter(r => r.unlocked).length > 0 && _jsx("span", { className: "badge", children: rituals.filter(r => r.unlocked).length })] }), _jsxs("button", { className: `journal-tab ${currentTab === 'rumors' ? 'active' : ''}`, onClick: () => setCurrentTab('rumors'), children: ["Rumors ", rumors.length > 0 && _jsx("span", { className: "badge", children: rumors.length })] }), _jsx("button", { className: `journal-tab ${currentTab === 'codex' ? 'active' : ''}`, onClick: () => setCurrentTab('codex'), children: "Codex" })] }), _jsxs("div", { className: "journal-view-toggle", children: [_jsx("button", { className: `view-toggle-btn ${!turnMode ? 'active' : ''}`, onClick: () => setTurnMode(false), title: "List View", "aria-label": "List View", children: "\u2630" }), _jsx("button", { className: `view-toggle-btn ${turnMode ? 'active' : ''}`, onClick: () => setTurnMode(true), title: "Book View", "aria-label": "Book View", children: "\uD83D\uDCD6" })] })] }), _jsx("div", { className: "journal-main", children: turnMode && currentTab === 'entries' ? renderBookMode() : ( // Book mode only for Entries tab for now
                _jsxs("div", { className: "journal-content", children: [currentTab === 'entries' && renderCategorySidebar(), _jsxs("div", { className: "journal-main-content", children: [currentTab === 'entries' && renderEntriesList(), currentTab === 'rituals' && renderRituals(), currentTab === 'rumors' && renderRumors(), currentTab === 'codex' && renderCodex()] })] })) }), secretCodeActive && (_jsx("style", { children: `
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
         ` }))] }));
};
export default Journal;
//# sourceMappingURL=Journal.js.map