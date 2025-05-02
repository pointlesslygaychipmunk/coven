import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './Journal90s.css';
const Journal90s = ({ journal = [], quests = [], rituals = [], time, player, onClaimRitual }) => {
    // State for active journal section
    const [activeSection, setActiveSection] = useState('journal');
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [selectedQuest, setSelectedQuest] = useState(null);
    const [selectedRitual, setSelectedRitual] = useState(null);
    const [filterTag, setFilterTag] = useState('all');
    const [journalPageEffect, setJournalPageEffect] = useState(false);
    // All available tags from journal entries
    const allTags = Array.from(new Set(journal.flatMap(entry => entry.tags || [])));
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
    const handleEntrySelect = (entry) => {
        setSelectedEntry(prev => prev?.id === entry.id ? null : entry);
    };
    // Handle quest selection
    const handleQuestSelect = (quest) => {
        setSelectedQuest(prev => prev?.id === quest.id ? null : quest);
    };
    // Handle ritual selection
    const handleRitualSelect = (ritual) => {
        setSelectedRitual(prev => prev?.id === ritual.id ? null : ritual);
    };
    // Handle claiming a ritual reward
    const handleClaimRitual = () => {
        if (!selectedRitual || !selectedRitual.available || selectedRitual.completed)
            return;
        onClaimRitual(selectedRitual.id);
    };
    // Helper to format a date string - ignores timestamp and uses game time
    const formatDate = (_) => {
        // In a real game, we'd use the timestamp
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
            return (_jsx("div", { className: "empty-entries", children: _jsx("p", { children: "No journal entries found. Your journey has just begun..." }) }));
        }
        return (_jsx("div", { className: "journal-entries", children: filteredEntries.map(entry => (_jsxs("div", { className: `journal-entry ${selectedEntry?.id === entry.id ? 'selected' : ''} ${entry.type}`, onClick: () => handleEntrySelect(entry), children: [_jsxs("div", { className: "entry-header", children: [_jsx("div", { className: "entry-title", children: entry.title }), _jsx("div", { className: "entry-date", children: formatDate(entry.date) })] }), _jsxs("div", { className: "entry-preview", children: [entry.content.substring(0, 80), "..."] }), entry.tags && entry.tags.length > 0 && (_jsx("div", { className: "entry-tags", children: entry.tags.map(tag => (_jsx("span", { className: "entry-tag", children: tag }, tag))) }))] }, entry.id))) }));
    };
    // Render quests list
    const renderQuests = () => {
        if (quests.length === 0) {
            return (_jsx("div", { className: "empty-quests", children: _jsx("p", { children: "No active quests. Visit the town to find opportunities." }) }));
        }
        // Group quests by status
        const activeQuests = quests.filter(q => q.status === 'active');
        const completedQuests = quests.filter(q => q.status === 'completed');
        const failedQuests = quests.filter(q => q.status === 'failed');
        return (_jsxs("div", { className: "quests-list", children: [_jsxs("div", { className: "quest-section", children: [_jsx("div", { className: "section-header", children: "Active Quests" }), activeQuests.length === 0 ? (_jsx("p", { className: "empty-section", children: "No active quests." })) : (activeQuests.map(quest => (_jsxs("div", { className: `quest-item active ${selectedQuest?.id === quest.id ? 'selected' : ''}`, onClick: () => handleQuestSelect(quest), children: [_jsx("div", { className: "quest-title", children: quest.title }), quest.progress !== undefined && (_jsxs("div", { className: "quest-progress", children: [_jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${quest.progress}%` } }) }), _jsxs("div", { className: "progress-value", children: [quest.progress, "%"] })] }))] }, quest.id))))] }), completedQuests.length > 0 && (_jsxs("div", { className: "quest-section", children: [_jsx("div", { className: "section-header", children: "Completed Quests" }), completedQuests.map(quest => (_jsx("div", { className: `quest-item completed ${selectedQuest?.id === quest.id ? 'selected' : ''}`, onClick: () => handleQuestSelect(quest), children: _jsx("div", { className: "quest-title", children: quest.title }) }, quest.id)))] })), failedQuests.length > 0 && (_jsxs("div", { className: "quest-section", children: [_jsx("div", { className: "section-header", children: "Failed Quests" }), failedQuests.map(quest => (_jsx("div", { className: `quest-item failed ${selectedQuest?.id === quest.id ? 'selected' : ''}`, onClick: () => handleQuestSelect(quest), children: _jsx("div", { className: "quest-title", children: quest.title }) }, quest.id)))] }))] }));
    };
    // Render rituals list
    const renderRituals = () => {
        if (rituals.length === 0) {
            return (_jsx("div", { className: "empty-rituals", children: _jsx("p", { children: "No rituals discovered yet. Explore and learn from the townsfolk." }) }));
        }
        // Group rituals by availability
        const availableRituals = rituals.filter(r => r.available && !r.completed);
        const completedRituals = rituals.filter(r => r.completed);
        const lockedRituals = rituals.filter(r => !r.available && !r.completed);
        return (_jsxs("div", { className: "rituals-list", children: [_jsxs("div", { className: "ritual-points", children: [_jsx("span", { className: "points-label", children: "Ritual Points:" }), _jsx("span", { className: "points-value", children: player.ritualPoints })] }), _jsxs("div", { className: "ritual-section", children: [_jsx("div", { className: "section-header", children: "Available Rituals" }), availableRituals.length === 0 ? (_jsx("p", { className: "empty-section", children: "No available rituals." })) : (availableRituals.map(ritual => (_jsx("div", { className: `ritual-item available ${selectedRitual?.id === ritual.id ? 'selected' : ''}`, onClick: () => handleRitualSelect(ritual), children: _jsx("div", { className: "ritual-title", children: ritual.name }) }, ritual.id))))] }), completedRituals.length > 0 && (_jsxs("div", { className: "ritual-section", children: [_jsx("div", { className: "section-header", children: "Completed Rituals" }), completedRituals.map(ritual => (_jsx("div", { className: `ritual-item completed ${selectedRitual?.id === ritual.id ? 'selected' : ''}`, onClick: () => handleRitualSelect(ritual), children: _jsx("div", { className: "ritual-title", children: ritual.name }) }, ritual.id)))] })), lockedRituals.length > 0 && (_jsxs("div", { className: "ritual-section", children: [_jsx("div", { className: "section-header", children: "Locked Rituals" }), lockedRituals.map(ritual => (_jsx("div", { className: `ritual-item locked ${selectedRitual?.id === ritual.id ? 'selected' : ''}`, onClick: () => handleRitualSelect(ritual), children: _jsx("div", { className: "ritual-title", children: ritual.name }) }, ritual.id)))] }))] }));
    };
    // Render journal entry details
    const renderJournalEntryDetails = () => {
        if (!selectedEntry) {
            return (_jsx("div", { className: "journal-page empty", children: _jsx("p", { children: "Select an entry to read." }) }));
        }
        return (_jsxs("div", { className: `journal-page ${journalPageEffect ? 'page-turn' : ''}`, children: [_jsx("div", { className: "journal-page-date", children: formatDate(selectedEntry.date) }), _jsx("h3", { className: "journal-page-title", children: selectedEntry.title }), _jsx("div", { className: "journal-page-content", children: selectedEntry.content }), selectedEntry.tags && selectedEntry.tags.length > 0 && (_jsx("div", { className: "journal-page-tags", children: selectedEntry.tags.map(tag => (_jsx("span", { className: "page-tag", children: tag }, tag))) }))] }));
    };
    // Render quest details
    const renderQuestDetails = () => {
        if (!selectedQuest) {
            return (_jsx("div", { className: "journal-page empty", children: _jsx("p", { children: "Select a quest to view details." }) }));
        }
        return (_jsxs("div", { className: `journal-page ${journalPageEffect ? 'page-turn' : ''}`, children: [_jsx("div", { className: "quest-status-badge", children: selectedQuest.status }), _jsx("h3", { className: "journal-page-title", children: selectedQuest.title }), _jsx("div", { className: "journal-page-content", children: selectedQuest.description }), selectedQuest.steps && selectedQuest.steps.length > 0 && (_jsxs("div", { className: "quest-steps", children: [_jsx("h4", { children: "Quest Steps:" }), _jsx("ul", { className: "steps-list", children: selectedQuest.steps.map((step, index) => (_jsx("li", { className: step.completed ? 'completed' : '', children: step.description }, index))) })] })), selectedQuest.rewards && selectedQuest.rewards.length > 0 && (_jsxs("div", { className: "quest-rewards", children: [_jsx("h4", { children: "Rewards:" }), _jsx("ul", { className: "rewards-list", children: selectedQuest.rewards.map((reward, index) => (_jsx("li", { children: reward }, index))) })] }))] }));
    };
    // Render ritual details
    const renderRitualDetails = () => {
        if (!selectedRitual) {
            return (_jsx("div", { className: "journal-page empty", children: _jsx("p", { children: "Select a ritual to view details." }) }));
        }
        return (_jsxs("div", { className: `journal-page ${journalPageEffect ? 'page-turn' : ''}`, children: [_jsx("div", { className: `ritual-status-badge ${selectedRitual.completed ? 'completed' : selectedRitual.available ? 'available' : 'locked'}`, children: selectedRitual.completed ? 'Completed' : selectedRitual.available ? 'Available' : 'Locked' }), _jsx("h3", { className: "journal-page-title", children: selectedRitual.name }), _jsx("div", { className: "journal-page-content", children: selectedRitual.description }), _jsxs("div", { className: "ritual-details", children: [_jsxs("div", { className: "ritual-requirements", children: [_jsx("h4", { children: "Requirements:" }), _jsx("ul", { className: "requirements-list", children: selectedRitual.requirements.map((req, index) => (_jsx("li", { children: req }, index))) })] }), _jsxs("div", { className: "ritual-rewards", children: [_jsx("h4", { children: "Rewards:" }), _jsx("ul", { className: "rewards-list", children: selectedRitual.rewards.map((reward, index) => (_jsx("li", { children: reward }, index))) })] })] }), selectedRitual.available && !selectedRitual.completed && (_jsx("button", { className: "journal-button claim-ritual", onClick: handleClaimRitual, children: "Perform Ritual" }))] }));
    };
    return (_jsxs("div", { className: "journal90s-container", children: [_jsxs("div", { className: "journal-header", children: [_jsx("h2", { children: "Witch's Journal" }), _jsx("div", { className: "journal-date", children: formatDate(Date.now()) })] }), _jsxs("div", { className: "journal-tabs", children: [_jsx("button", { className: `journal-tab ${activeSection === 'journal' ? 'active' : ''}`, onClick: () => setActiveSection('journal'), children: "Journal" }), _jsx("button", { className: `journal-tab ${activeSection === 'quests' ? 'active' : ''}`, onClick: () => setActiveSection('quests'), children: "Quests" }), _jsx("button", { className: `journal-tab ${activeSection === 'rituals' ? 'active' : ''}`, onClick: () => setActiveSection('rituals'), children: "Rituals" })] }), _jsxs("div", { className: "journal-main", children: [_jsxs("div", { className: "journal-sidebar", children: [activeSection === 'journal' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "filter-container", children: [_jsx("label", { className: "filter-label", children: "Filter:" }), _jsxs("select", { className: "filter-dropdown", value: filterTag, onChange: (e) => setFilterTag(e.target.value), children: [_jsx("option", { value: "all", children: "All Entries" }), allTags.map(tag => (_jsx("option", { value: tag, children: tag }, tag)))] })] }), renderJournalEntries()] })), activeSection === 'quests' && renderQuests(), activeSection === 'rituals' && renderRituals()] }), _jsxs("div", { className: "journal-content", children: [activeSection === 'journal' && renderJournalEntryDetails(), activeSection === 'quests' && renderQuestDetails(), activeSection === 'rituals' && renderRitualDetails()] })] }), _jsx("div", { className: "corner-decoration top-left" }), _jsx("div", { className: "corner-decoration top-right" }), _jsx("div", { className: "corner-decoration bottom-left" }), _jsx("div", { className: "corner-decoration bottom-right" })] }));
};
export default Journal90s;
//# sourceMappingURL=Journal90s.js.map