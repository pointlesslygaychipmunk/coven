import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
// Import Components
import Garden from './Garden';
import Brewing from './Brewing';
import Market from './Market';
import Journal from './Journal';
import HUD from './HUD';
import Atelier from './Atelier';
import WeatherEffectsOverlay from './WeatherEffectsOverlay';
// API Utility
const API_BASE_URL = '/api';
const apiCall = async (endpoint, method = 'GET', body) => {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json', },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.json();
    if (!response.ok) {
        console.error("API Error Response:", responseData);
        throw new Error(responseData.error || `API call failed: ${response.statusText}`);
    }
    return responseData;
};
// Main App Component
const App = () => {
    const [gameState, setGameState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageTransition, setPageTransition] = useState(false);
    const [currentView, setCurrentView] = useState('garden'); // Default view
    // Moonlight Meadow Easter Egg state
    const [moonlightMeadowActive, setMoonlightMeadowActive] = useState(false);
    const [spiritPositions, setSpiritPositions] = useState([]);
    // Konami Code Easter Egg state
    const konamiSequence = useRef([]);
    const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    const [konamiActivated, setKonamiActivated] = useState(false);
    // Viewport height fix for mobile browsers
    useEffect(() => {
        // Fix for mobile viewport height (100vh issue)
        const setVh = () => {
            // First we get the viewport height and multiply it by 1% to get a value for a vh unit
            let vh = window.innerHeight * 0.01;
            // Then we set the value in the --vh custom property to the root of the document
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        // Set the initial value
        setVh();
        // We add an event listener for when the window resizes or orientation changes
        window.addEventListener('resize', setVh);
        window.addEventListener('orientationchange', setVh);
        // We return a function to remove the event listeners when the component unmounts
        return () => {
            window.removeEventListener('resize', setVh);
            window.removeEventListener('orientationchange', setVh);
        };
    }, []);
    // Konami Code Listener Effect
    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key.toLowerCase();
            // Ignore if typing in an input field
            if (event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                event.target instanceof HTMLSelectElement) {
                konamiSequence.current = []; // Reset sequence if typing starts
                return;
            }
            konamiSequence.current.push(key);
            konamiSequence.current = konamiSequence.current.slice(-konamiCode.length); // Keep only the last N keys
            if (konamiSequence.current.join('') === konamiCode.join('')) {
                console.log('🎉 Ancient Coven Code Activated! 🎉');
                setKonamiActivated(true);
                konamiSequence.current = []; // Reset sequence
                // Example: Briefly show a message
                setError("Konami Code! +10 Gold (Debug)."); // Using error display for quick feedback
                // Could add a gold increase here in future (commented out)
                setTimeout(() => setKonamiActivated(false), 3000); // Hide effect after 3s
                setTimeout(() => setError(null), 3500); // Clear message slightly later
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameState, konamiCode]);
    // Moonlight Meadow Easter Egg Detection
    useEffect(() => {
        // Check if gameState and the current player's data exist
        if (!gameState?.players?.[gameState.currentPlayerIndex]?.garden) {
            if (moonlightMeadowActive)
                setMoonlightMeadowActive(false);
            return;
        }
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        // Check for array type
        if (!Array.isArray(currentPlayer.garden)) {
            if (moonlightMeadowActive)
                setMoonlightMeadowActive(false);
            return;
        }
        const totalPlots = currentPlayer.garden.length;
        const healthyPlots = currentPlayer.garden.filter(plot => plot.plant && plot.plant.health > 80 && plot.moisture > 60).length;
        const magicRating = totalPlots > 0 ? healthyPlots / totalPlots : 0;
        const moonBonus = gameState.time.phaseName === "Full Moon" ? 0.2 : 0;
        const magicThreshold = 0.85 - moonBonus; // Slightly higher threshold
        const isNightTime = ["New Moon", "Waning Crescent", "Last Quarter", "Waning Gibbous"].includes(gameState.time.phaseName); // Define night phases
        // Trigger condition: high magic rating, night time, and random chance
        if (magicRating > magicThreshold && isNightTime && Math.random() < 0.15) { // 15% chance if conditions met
            if (!moonlightMeadowActive) {
                console.log("🌙✨ The Moonlight Meadow appears! ✨🌙");
                const newSpirits = Array.from({ length: 10 + Math.floor(Math.random() * 6) }, () => ({
                    x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() * 6
                }));
                setSpiritPositions(newSpirits);
                setMoonlightMeadowActive(true);
            }
        }
        else if (moonlightMeadowActive) {
            setMoonlightMeadowActive(false); // Deactivate if conditions no longer met
        }
    }, [gameState, moonlightMeadowActive]);
    // Fetch initial game state
    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                setLoading(true);
                const initialState = await apiCall('/state');
                setGameState(initialState);
                setError(null);
            }
            catch (err) {
                console.error('Error fetching initial game state:', err);
                setError('Failed to connect to the Coven server. Is it running?');
            }
            finally {
                setTimeout(() => setLoading(false), 800); // Shorter loading time
            }
        };
        fetchInitialState();
    }, []);
    // --- Action Handlers ---
    const handleApiAction = useCallback(async (actionPromise, successMessage, errorMessagePrefix) => {
        try {
            const newState = await actionPromise;
            setGameState(newState); // Update state with the result from the API
            setError(null); // Clear previous errors
            if (successMessage)
                console.log(`[Action Success] ${successMessage}`);
        }
        catch (err) {
            const message = (err instanceof Error) ? err.message : 'An unknown error occurred';
            console.error(errorMessagePrefix || 'Action failed:', err);
            setError(`${errorMessagePrefix || 'Error'}: ${message}`);
        }
    }, []);
    // Get current player and ID safely
    const currentPlayer = gameState?.players[gameState?.currentPlayerIndex || 0];
    const playerId = currentPlayer?.id;
    // --- Wrapped API Call Functions ---
    // Use useCallback for stable function references passed as props
    const plantSeed = useCallback((slotId, seedInventoryItemId) => {
        if (!playerId)
            return;
        handleApiAction(apiCall('/plant', 'POST', { playerId, slotId, seedItemId: seedInventoryItemId }), `Planted seed in slot ${slotId + 1}`, `Planting failed`);
    }, [playerId, handleApiAction]);
    const harvestPlant = useCallback((slotId) => {
        if (!playerId)
            return;
        handleApiAction(apiCall('/harvest', 'POST', { playerId, slotId }), `Harvested from slot ${slotId + 1}`, `Harvest failed`);
    }, [playerId, handleApiAction]);
    const waterPlants = useCallback((puzzleBonus = 0) => {
        if (!playerId)
            return;
        handleApiAction(apiCall('/water', 'POST', { playerId, puzzleBonus }), `Attuned garden energies (Bonus: ${puzzleBonus}%)`, `Attunement failed`);
    }, [playerId, handleApiAction]);
    const brewPotion = useCallback((ingredientInvItemIds, puzzleBonus = 0, recipeId) => {
        if (!playerId)
            return;
        handleApiAction(apiCall('/brew', 'POST', { playerId, ingredientInvItemIds, puzzleBonus }), `Brew attempt (Bonus: ${puzzleBonus}%)${recipeId ? ` using recipe ${recipeId}` : ''}`, `Brewing failed`);
    }, [playerId, handleApiAction]);
    const buyItem = useCallback((itemId) => {
        if (!playerId)
            return;
        handleApiAction(apiCall('/market/buy', 'POST', { playerId, itemId }), `Purchased ${itemId}`, `Purchase failed`);
    }, [playerId, handleApiAction]);
    const sellItem = useCallback((inventoryItemId) => {
        if (!playerId)
            return;
        handleApiAction(apiCall('/market/sell', 'POST', { playerId, itemId: inventoryItemId }), `Sold item ${inventoryItemId}`, `Sell failed`);
    }, [playerId, handleApiAction]);
    const fulfillRequest = useCallback((requestId) => {
        if (!playerId)
            return;
        handleApiAction(apiCall('/fulfill', 'POST', { playerId, requestId }), `Fulfilled request ${requestId}`, `Fulfillment failed`);
    }, [playerId, handleApiAction]);
    const advanceDay = useCallback(() => {
        if (!playerId)
            return;
        handleApiAction(apiCall('/end-turn', 'POST', { playerId }), 'Advanced to next phase', 'Failed to end turn');
    }, [playerId, handleApiAction]);
    const claimRitualReward = useCallback((ritualId) => {
        if (!playerId)
            return;
        handleApiAction(apiCall('/ritual/claim', 'POST', { playerId, ritualId }), `Claimed reward for ${ritualId}`, 'Failed to claim reward');
    }, [playerId, handleApiAction]);
    // Handle location change with page transition
    const handleChangeLocation = useCallback((location) => {
        if (location === currentView || pageTransition)
            return;
        setPageTransition(true);
        setTimeout(() => {
            setCurrentView(location);
            // End transition *after* view potentially changes content
            setTimeout(() => setPageTransition(false), 150); // Shorter fade-in time
        }, 300); // Wait for fade-out
    }, [currentView, pageTransition]);
    // --- Loading Screen ---
    if (loading) {
        return (_jsx("div", { className: "game-container", children: _jsx("div", { className: "loading-screen", children: _jsxs("div", { className: "parchment-scroll", children: [_jsx("div", { className: "scroll-top" }), _jsxs("div", { className: "scroll-content", children: [_jsx("h1", { children: "Summoning Magical Energies" }), _jsxs("div", { className: "cauldron-container", children: [_jsxs("div", { className: "cauldron-body", children: [_jsx("div", { className: "cauldron-liquid" }), _jsx("div", { className: "bubble bubble-1" }), _jsx("div", { className: "bubble bubble-2" }), _jsx("div", { className: "bubble bubble-3" })] }), _jsxs("div", { className: "cauldron-legs", children: [_jsx("div", { className: "leg" }), _jsx("div", { className: "leg" }), _jsx("div", { className: "leg" })] })] }), _jsx("p", { className: "loading-flavor-text", children: "Brewing the perfect potion takes time..." })] }), _jsx("div", { className: "scroll-bottom" })] }) }) }));
    }
    // --- Error Display ---
    const ErrorDisplay = () => error && (_jsx("div", { className: "error-overlay", children: _jsxs("div", { className: "error-scroll", children: [_jsx("div", { className: "error-message", children: error }), _jsx("button", { onClick: () => setError(null), className: "error-dismiss", children: "\u00D7" })] }) }));
    // --- Error Screen ---
    if (!gameState || !currentPlayer) {
        return (_jsx("div", { className: "game-container", children: _jsx("div", { className: "error-screen", children: _jsxs("div", { className: "parchment-scroll", children: [_jsx("div", { className: "scroll-top" }), _jsxs("div", { className: "scroll-content", children: [_jsx("h1", { children: "The Grimoire Remains Closed" }), _jsx("p", { children: error || 'Failed to load essential game data. The coven remains hidden.' }), _jsx("div", { className: "retry-button-container", children: _jsx("button", { className: "retry-button", onClick: () => window.location.reload(), children: _jsx("span", { children: "Retry" }) }) })] }), _jsx("div", { className: "scroll-bottom" })] }) }) }));
    }
    // --- Main Render ---
    return (_jsxs("div", { className: "game-container", children: [_jsx("div", { className: "game-backdrop" }), _jsxs("div", { className: "game-frame", children: [_jsx(WeatherEffectsOverlay, { weatherType: gameState.time.weatherFate, intensity: "medium", timeOfDay: ["New Moon", "Waning Crescent", "Last Quarter", "Waning Gibbous", "Full Moon"].includes(gameState.time.phaseName) ? 'night' : 'day', season: gameState.time.season }), _jsx(HUD, { playerName: currentPlayer.name, gold: currentPlayer.gold, day: gameState.time.dayCount, lunarPhase: gameState.time.phaseName || 'New Moon', reputation: currentPlayer.reputation, playerLevel: currentPlayer.atelierLevel, onChangeLocation: handleChangeLocation, onAdvanceDay: advanceDay }), _jsxs("main", { className: `game-content ${pageTransition ? 'page-transition' : ''}`, children: [_jsxs("div", { className: "view-container", children: [currentView === 'garden' && (_jsx(Garden, { plots: currentPlayer.garden, inventory: currentPlayer.inventory, onPlant: plantSeed, onHarvest: harvestPlant, onWater: waterPlants, weatherFate: gameState.time.weatherFate, season: gameState.time.season })), currentView === 'brewing' && (_jsx(Brewing, { playerInventory: currentPlayer.inventory, knownRecipes: gameState.knownRecipes || [], lunarPhase: gameState.time.phaseName, playerSpecialization: currentPlayer.atelierSpecialization, onBrew: brewPotion })), currentView === 'atelier' && (_jsx(Atelier, { playerItems: currentPlayer.inventory, onCraftItem: (ingredientIds, resultItemId) => console.log('Craft action TBD', ingredientIds, resultItemId), lunarPhase: gameState.time.phaseName, playerLevel: currentPlayer.atelierLevel, playerSpecialization: currentPlayer.atelierSpecialization, knownRecipes: gameState.knownRecipes || [] })), currentView === 'market' && (_jsx(Market, { playerGold: currentPlayer.gold, playerInventory: currentPlayer.inventory, marketItems: gameState.market, rumors: gameState.rumors, townRequests: gameState.townRequests, blackMarketAccess: currentPlayer.blackMarketAccess, onBuyItem: buyItem, onSellItem: sellItem, onFulfillRequest: fulfillRequest })), currentView === 'journal' && (_jsx(Journal, { journal: gameState.journal, rumors: gameState.rumors, rituals: gameState.rituals, time: gameState.time, player: currentPlayer, onClaimRitual: claimRitualReward }))] }), _jsx("div", { className: "corner-decoration top-left" }), _jsx("div", { className: "corner-decoration top-right" }), _jsx("div", { className: "corner-decoration bottom-left" }), _jsx("div", { className: "corner-decoration bottom-right" })] }), _jsx(ErrorDisplay, {}), moonlightMeadowActive && (_jsxs("div", { className: "moonlight-meadow", onClick: () => setMoonlightMeadowActive(false), children: [_jsx("div", { className: "moonlight-overlay" }), _jsx("div", { className: "moon-glow" }), spiritPositions.map((spirit, i) => (_jsx("div", { className: "meadow-spirit", style: {
                                    left: `${spirit.x}%`,
                                    top: `${spirit.y}%`,
                                    animationDelay: `${spirit.delay}s`
                                } }, i))), _jsx("div", { className: "moonlight-message", children: "Your garden is blessed by moonlight..." })] })), _jsx("div", { className: "ambient-particles", children: Array.from({ length: 15 }).map((_, i) => {
                            const size = 2 + Math.random() * 3;
                            const duration = 15 + Math.random() * 20;
                            const delay = Math.random() * 15;
                            return (_jsx("div", { className: "particle", style: {
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDuration: `${duration}s`,
                                    animationDelay: `${delay}s`
                                } }, i));
                        }) }), konamiActivated && (_jsxs("div", { className: "konami-activation", children: [_jsx("div", { className: "activation-glow" }), _jsx("div", { className: "activation-text", children: "Ancient Coven Code Activated!" })] }))] })] }));
};
export default App;
//# sourceMappingURL=App.js.map