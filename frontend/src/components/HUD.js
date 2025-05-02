import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import './HUD.css';
const HUD = ({ playerName = "Willow", gold = 100, day = 1, lunarPhase = "Waxing Crescent", reputation = 5, playerLevel = 1, onChangeLocation, onAdvanceDay }) => {
    // State
    const [activeLocation, setActiveLocation] = useState('garden');
    const [confirmEndDay, setConfirmEndDay] = useState(false);
    const [confirmTimeoutId, setConfirmTimeoutId] = useState(null);
    // Portrait Easter Egg
    const [portraitClicks, setPortraitClicks] = useState(0);
    const [showSparkle, setShowSparkle] = useState(false);
    const [levelBoost, setLevelBoost] = useState(0);
    const [statusMessage, setStatusMessage] = useState(null);
    const portraitClickTimeoutRef = useRef(null);
    // Handle location change
    const handleLocationClick = (location) => {
        setActiveLocation(location);
        onChangeLocation(location);
        resetEndDayConfirm(); // Reset confirm state when changing location
    };
    // Handle end day click with confirmation step
    const handleEndDayClick = () => {
        if (confirmEndDay) {
            if (confirmTimeoutId)
                clearTimeout(confirmTimeoutId);
            onAdvanceDay();
            setConfirmEndDay(false);
            setConfirmTimeoutId(null);
        }
        else {
            setConfirmEndDay(true);
            // Set timeout to auto-cancel confirmation
            const timeoutId = setTimeout(() => {
                setConfirmEndDay(false);
                setConfirmTimeoutId(null);
            }, 5000); // 5 seconds
            setConfirmTimeoutId(timeoutId);
        }
    };
    // Helper to reset end day confirmation state
    const resetEndDayConfirm = () => {
        if (confirmTimeoutId) {
            clearTimeout(confirmTimeoutId);
            setConfirmTimeoutId(null);
        }
        setConfirmEndDay(false);
    };
    // Easter Egg: Player Portrait Click
    const handlePortraitClick = () => {
        // Clear existing timeout
        if (portraitClickTimeoutRef.current) {
            clearTimeout(portraitClickTimeoutRef.current);
        }
        const newClicks = portraitClicks + 1;
        setPortraitClicks(newClicks);
        if (newClicks >= 5) {
            setShowSparkle(true);
            setLevelBoost(1); // Temporary visual level boost effect
            setStatusMessage(`${playerName} feels particularly determined! ✨`);
            // Play a subtle sound effect
            const sparkleSound = new Audio('data:audio/wav;base64,UklGRroYAABXQVZFZm10IBAAAAABAAEAESsAACJWAAABAAgAZGF0YZYYAAAAAFf/Vzb/No3+jQT+BKL9osH9wSL+IpT+lO/+70v/SzP/M3X+dVf+Vzb+NjD+MH3+ff/9/8/9z9f91y3+LcH+wWf/Z4n/ifj++AH+Ae397bT9tGP+Y5n+mZP+kxT/FK//r5j/mC3/LT3/Pf/+/4D+gHn+ef/9/wT+BPb99g==');
            sparkleSound.volume = 0.2;
            sparkleSound.play().catch(() => { });
            setTimeout(() => {
                setShowSparkle(false);
                setLevelBoost(0);
            }, 3000); // Sparkle effect duration
            setTimeout(() => {
                setStatusMessage(null);
            }, 4000); // Message duration
            setPortraitClicks(0); // Reset clicks after activation
        }
        else {
            // Set a timeout to reset clicks if not clicked again quickly
            portraitClickTimeoutRef.current = setTimeout(() => {
                setPortraitClicks(0);
            }, 800); // Reset after 0.8 seconds of inactivity
        }
    };
    // Cleanup portrait click timeout on unmount
    useEffect(() => {
        return () => {
            if (portraitClickTimeoutRef.current) {
                clearTimeout(portraitClickTimeoutRef.current);
            }
        };
    }, []);
    // Navigation items
    const navItems = [
        { id: 'garden', name: 'Garden', icon: '🌿' },
        { id: 'brewing', name: 'Brewing', icon: '🧪' },
        { id: 'atelier', name: 'Atelier', icon: '✨' },
        { id: 'market', name: 'Market', icon: '💰' },
        { id: 'journal', name: 'Journal', icon: '📖' }
    ];
    // Generate ASCII moon phases
    const getMoonASCII = (phase) => {
        switch (phase) {
            case 'New Moon': return '   ______\n  /      \\\n |        |\n |        |\n  \\______/';
            case 'Waxing Crescent': return '   ______\n  /   |  \\\n |    |   |\n |    |   |\n  \\___l__/';
            case 'First Quarter': return '   ______\n  /|     \\\n | |      |\n | |      |\n  \\|_____/';
            case 'Waxing Gibbous': return '   ______\n  /\\\\    \\\n | \\\\     |\n | \\\\     |\n  \\\\\\____/';
            case 'Full Moon': return '   ______\n  /      \\\n |  ****  |\n |  ****  |\n  \\______/';
            case 'Waning Gibbous': return '   ______\n  /    //\\\n |     // |\n |     // |\n  \\____///';
            case 'Last Quarter': return '   ______\n  /     |\\\n |      | |\n |      | |\n  \\_____|/';
            case 'Waning Crescent': return '   ______\n  /  |   \\\n |   |    |\n |   |    |\n  \\__l___/';
            default: return '   ______\n  /      \\\n |   ?    |\n |   ?    |\n  \\______/';
        }
    };
    return (_jsxs("div", { className: "hud-wrapper", children: [_jsxs("aside", { className: "hud-container", children: [_jsxs("div", { className: "hud-top-section", children: [_jsxs("div", { className: "panel player-panel", children: [_jsx("div", { className: "panel-header", children: _jsx("h3", { children: "Character" }) }), _jsxs("div", { className: "panel-content", children: [_jsxs("div", { className: `player-portrait ${showSparkle ? 'sparkling' : ''}`, onClick: handlePortraitClick, children: [_jsx("div", { className: "portrait-frame" }), _jsx("div", { className: "player-avatar", "data-initial": playerName.charAt(0).toUpperCase() })] }), _jsx("div", { className: "player-name", children: playerName }), _jsxs("div", { className: "player-level", children: [_jsx("span", { children: "Level " }), _jsx("span", { className: "level-number", children: playerLevel + levelBoost })] })] })] }), _jsxs("div", { className: "panel moon-panel", children: [_jsx("div", { className: "panel-header", children: _jsx("h3", { children: "Moon Phase" }) }), _jsx("div", { className: "panel-content", children: _jsxs("div", { className: "lunar-display", children: [_jsx("div", { className: "lunar-icon", children: _jsx("pre", { children: getMoonASCII(lunarPhase) }) }), _jsxs("div", { className: "lunar-info", children: [_jsx("div", { className: "lunar-phase", children: lunarPhase }), _jsxs("div", { className: "day-count", children: ["Day ", day] })] })] }) })] })] }), _jsx("div", { className: "hud-middle-section", children: _jsxs("div", { className: "panel resources-panel", children: [_jsx("div", { className: "panel-header", children: _jsx("h3", { children: "Resources" }) }), _jsxs("div", { className: "panel-content", children: [_jsxs("div", { className: "resource-item gold", children: [_jsx("div", { className: "resource-icon", children: _jsx("div", { className: "coin-icon" }) }), _jsx("div", { className: "resource-label", children: "Gold" }), _jsx("div", { className: "resource-value", children: gold })] }), _jsxs("div", { className: "resource-item reputation", children: [_jsx("div", { className: "resource-icon", children: _jsx("div", { className: "rep-icon" }) }), _jsx("div", { className: "resource-label", children: "Reputation" }), _jsx("div", { className: "resource-value", children: reputation })] })] })] }) }), _jsx("div", { className: "hud-bottom-section", children: _jsxs("div", { className: "nav-bar", children: [navItems.map(loc => (_jsx("button", { className: `nav-button ${activeLocation === loc.id ? 'active' : ''}`, onClick: () => handleLocationClick(loc.id), title: loc.name, children: _jsxs("div", { className: "button-content", children: [_jsx("div", { className: "button-icon", children: loc.icon }), _jsx("span", { className: "button-label", children: loc.name })] }) }, loc.id))), _jsx("button", { className: `end-day-button ${confirmEndDay ? 'confirm' : ''}`, onClick: handleEndDayClick, disabled: confirmEndDay && !confirmTimeoutId, children: _jsx("span", { children: confirmEndDay ? 'Confirm End Day?' : 'End Day' }) })] }) })] }), statusMessage && (_jsx("div", { className: "status-message", children: statusMessage }))] }));
};
export default HUD;
//# sourceMappingURL=HUD.js.map