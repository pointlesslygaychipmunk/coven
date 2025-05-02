import React, { useState, useEffect, useCallback, useRef, useMemo, Component, ReactNode } from 'react';
import './App.css';
import { GameState, Season, InventoryItem, GardenSlot, WeatherFate, AtelierSpecialization } from 'coven-shared';

// ErrorBoundary class component to catch render errors
class ErrorBoundary extends Component<{ fallback: ReactNode, children?: ReactNode }> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: any, info: any) {
    console.error("Caught error in Error Boundary:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

import { MultiplayerProvider } from '../contexts/MultiplayerContext';

// Import Components
import Garden from './Garden';
import Brewing from './Brewing';
import Market from './Market';
import Journal from './Journal';
import Atelier from './Atelier';
import WeatherEffectsOverlay from './WeatherEffectsOverlay';
import Lobby from './Lobby';
import MultiplayerChat from './MultiplayerChat';
import OnlinePlayers from './OnlinePlayers';

// API Utility
const API_BASE_URL = '/api';
const apiCall = async (endpoint: string, method: string = 'GET', body?: Record<string, unknown>): Promise<GameState> => {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', },
  };
  if (body) { options.body = JSON.stringify(body); }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const responseData = await response.json();
  if (!response.ok) {
    console.error("API Error Response:", responseData);
    throw new Error(responseData.error || `API call failed: ${response.statusText}`);
  }
  return responseData as GameState;
};

// Create a mock game state function - defined before the component to avoid reference issues
const createMockGameState = (): GameState => {
    console.log('Creating mock game state');
    return {
        currentPlayerIndex: 0,
        version: "1.0.0",
        players: [{
            id: "fallback",
            name: "Fallback Witch",
            gold: 500,
            mana: 500,
            reputation: 50,
            atelierLevel: 5,
            atelierSpecialization: "Essence" as AtelierSpecialization,
            garden: [],
            inventory: [],
            blackMarketAccess: false,
            skills: { gardening: 5, brewing: 5, trading: 5, crafting: 5, herbalism: 5, astrology: 5 },
            knownRecipes: [],
            completedRituals: [],
            journalEntries: [],
            questsCompleted: 0,
            lastActive: Date.now()
        }],
        market: [],
        marketData: { inflation: 1.0, demand: {}, supply: {}, volatility: 0.1, blackMarketAccessCost: 500, blackMarketUnlocked: false, tradingVolume: 0 },
        rumors: [],
        townRequests: [],
        journal: [],
        rituals: [],
        events: [],
        knownRecipes: [],
        time: { year: 1, dayCount: 1, phaseName: "Full Moon", phase: 0, season: "Spring", weatherFate: "clear" }
    };
};

// Main App Component
const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageTransition, setPageTransition] = useState<boolean>(false);
    const [currentView, setCurrentView] = useState<string>('garden'); // Default view
    
    // For troubleshooting, disable multiplayer and lobby
    const [showLobby, setShowLobby] = useState(false);
    const [useMultiplayer, _setUseMultiplayer] = useState(false);

    // Moonlight Meadow Easter Egg state
    const [moonlightMeadowActive, setMoonlightMeadowActive] = useState<boolean>(false);
    const [spiritPositions, setSpiritPositions] = useState<Array<{x: number, y: number, delay: number}>>([]);

    // Konami Code Easter Egg state
    const konamiSequence = useRef<string[]>([]);
    // Memoize konamiCode to avoid dependency issues in useEffect
    const konamiCode = React.useMemo(() => ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'], []);
    const [konamiActivated, setKonamiActivated] = useState<boolean>(false);

    // Viewport height fix for mobile browsers
    useEffect(() => {
      // Fix for mobile viewport height (100vh issue)
      const setVh = () => {
        // First we get the viewport height and multiply it by 1% to get a value for a vh unit
        const vh = window.innerHeight * 0.01;
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
        const handleKeyDown = (event: KeyboardEvent) => {
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
    }, [konamiCode, setError, setKonamiActivated]);

    // Moonlight Meadow Easter Egg Detection
    useEffect(() => {
      // Check if gameState and the current player's data exist
      if (!gameState?.players?.[gameState.currentPlayerIndex]?.garden) {
          if (moonlightMeadowActive) setMoonlightMeadowActive(false);
          return;
      }

      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      // Check for array type
      if (!Array.isArray(currentPlayer.garden)) {
          if (moonlightMeadowActive) setMoonlightMeadowActive(false);
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
          const newSpirits = Array.from({ length: 10 + Math.floor(Math.random() * 6) }, () => ({ // 10-15 spirits
            x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() * 6
          }));
          setSpiritPositions(newSpirits);
          setMoonlightMeadowActive(true);
        }
      } else if (moonlightMeadowActive) {
        setMoonlightMeadowActive(false); // Deactivate if conditions no longer met
      }
    }, [gameState, moonlightMeadowActive]);

    // Fetch initial game state with useRef to track fetch attempts
    const fetchAttemptRef = useRef(0);
    
    useEffect(() => {
        console.log('Fetching initial state, useMultiplayer:', useMultiplayer);
        
        // Define fetchInitialState inside the effect to avoid dependencies
        const fetchInitialState = async () => {
            try {
                // Increment fetch attempt counter
                fetchAttemptRef.current += 1;
                console.log(`Fetch attempt #${fetchAttemptRef.current}`);
                
                // Try to fetch from API
                const initialState = await apiCall('/state');
                console.log('Received state from API');
                setGameState(initialState);
                // Only clear error if we have one
                if (error !== null) {
                    setError(null);
                }
            } catch (err) {
                console.error('Error fetching initial game state:', err);
                // Use mock data instead of failing
                console.log('Using mock game state');
                setGameState(createMockGameState());
                setError('Using mock data - backend server not available');
            } finally {
                // Always exit loading state
                setTimeout(() => {
                    setLoading(false);
                    console.log('Loading set to false');
                }, 800);
            }
        };

        if (useMultiplayer) {
            // In multiplayer mode, we should show the lobby
            console.log('Multiplayer mode - showing lobby');
            if (!showLobby) {
                setLoading(false);
            }
        } else {
            // In single player mode, fetch state directly
            console.log('Single player mode - fetching state');
            fetchInitialState();
        }
        
        // Cleanup
        return () => {
            console.log('Cleaning up fetch effect');
        };
    }, [useMultiplayer, showLobby, error]);

    // --- Action Handlers ---
    // Use a ref for tracking the last action to avoid re-renders
    const lastActionRef = useRef<string>('none');
    
    const handleApiAction = useCallback(async (
        actionPromise: Promise<GameState>,
        successMessage?: string,
        errorMessagePrefix?: string
    ) => {
        try {
            // Track the action for debugging
            const actionId = `action_${Date.now()}`;
            lastActionRef.current = actionId;
            console.log(`[Action Start] ${actionId}: ${successMessage || 'Unnamed action'}`);
            
            const newState = await actionPromise;
            
            // Only update state if this is still the current action
            if (lastActionRef.current === actionId) {
                console.log(`[Action Success] ${actionId}: ${successMessage}`);
                setGameState(prevState => {
                    // Only update if we have new state and it's different
                    if (!newState) return prevState;
                    return newState;
                });
                // Only set error to null if we have one
                if (error !== null) {
                    setError(null);
                }
            } else {
                console.log(`[Action Skipped] ${actionId}: Action was superseded`);
            }
        } catch (err) {
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
    const plantSeed = useCallback((slotId: number, seedInventoryItemId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/plant', 'POST', { playerId, slotId, seedItemId: seedInventoryItemId }),
            `Planted seed in slot ${slotId + 1}`, `Planting failed`
        );
    }, [playerId, handleApiAction]);

    const harvestPlant = useCallback((slotId: number) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/harvest', 'POST', { playerId, slotId }),
            `Harvested from slot ${slotId + 1}`, `Harvest failed`
        );
    }, [playerId, handleApiAction]);

    const waterPlants = useCallback((puzzleBonus: number = 0) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/water', 'POST', { playerId, puzzleBonus }),
            `Attuned garden energies (Bonus: ${puzzleBonus}%)`, `Attunement failed`
        );
    }, [playerId, handleApiAction]);

    const brewPotion = useCallback((ingredientInvItemIds: string[], puzzleBonus: number = 0, recipeId?: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/brew', 'POST', { playerId, ingredientInvItemIds, puzzleBonus }),
            `Brew attempt (Bonus: ${puzzleBonus}%)${recipeId ? ` using recipe ${recipeId}` : ''}`, `Brewing failed`
        );
    }, [playerId, handleApiAction]);

    const buyItem = useCallback((itemId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/market/buy', 'POST', { playerId, itemId }),
            `Purchased ${itemId}`, `Purchase failed`
        );
    }, [playerId, handleApiAction]);

    const sellItem = useCallback((inventoryItemId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/market/sell', 'POST', { playerId, itemId: inventoryItemId }),
            `Sold item ${inventoryItemId}`, `Sell failed`
        );
    }, [playerId, handleApiAction]);

    const fulfillRequest = useCallback((requestId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/fulfill', 'POST', { playerId, requestId }),
            `Fulfilled request ${requestId}`, `Fulfillment failed`
        );
    }, [playerId, handleApiAction]);

    const advanceDay = useCallback(() => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/end-turn', 'POST', { playerId }),
            'Advanced to next phase', 'Failed to end turn'
        );
    }, [playerId, handleApiAction]);

    const claimRitualReward = useCallback((ritualId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/ritual/claim', 'POST', { playerId, ritualId }),
            `Claimed reward for ${ritualId}`, 'Failed to claim reward'
        );
    }, [playerId, handleApiAction]);

    // Handle location change with page transition
    // Use a ref to track ongoing transitions to avoid overlapping calls
    const transitionInProgressRef = useRef(false);
    
    const handleChangeLocation = useCallback((location: string) => {
        // Don't start a new transition if location is the same or a transition is already in progress
        if (location === currentView || pageTransition || transitionInProgressRef.current) {
            console.log(`Location change skipped: ${currentView} -> ${location}`);
            return;
        }
        
        console.log(`Location change: ${currentView} -> ${location}`);
        transitionInProgressRef.current = true;
        setPageTransition(true);
        
        setTimeout(() => {
            setCurrentView(location);
            
            // End transition *after* view potentially changes content
            setTimeout(() => {
                setPageTransition(false);
                transitionInProgressRef.current = false;
                console.log(`Location change completed: ${location}`);
            }, 150); // Shorter fade-in time
        }, 300); // Wait for fade-out
    }, [currentView, pageTransition]);

    // --- Loading Screen --- Fantasy style
    console.log('Current loading state:', loading);
    console.log('Current game state:', gameState ? 'exists' : 'null');
    
    if (loading) {
        console.log('Rendering loading screen');
        return (
            <div className="game-container">
                <div className="loading-screen">
                    <div className="loading-dialog">
                        <div className="loading-header">LOADING WITCH COVEN v1.0</div>
                        <div className="loading-content">
                            <h1>INITIALIZING MAGICAL SYSTEMS</h1>
                            
                            <div className="loading-cauldron"></div>
                            
                            <div className="loading-bar-container">
                                <div className="loading-bar"></div>
                            </div>
                            
                            <p className="loading-text">Summoning magical components...</p>
                            
                            {/* Debug button to force exit loading state */}
                            <button 
                                style={{
                                    marginTop: '20px',
                                    padding: '10px',
                                    background: '#4a3674',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    console.log('Force exiting loading state');
                                    setLoading(false);
                                    if (!gameState) {
                                        console.log('Creating mock game state');
                                        // Create a simple mock state
                                        setGameState({
                                            currentPlayerIndex: 0,
                                            version: "1.0.0",
                                            players: [{
                                                id: "debug",
                                                name: "Debug Witch",
                                                gold: 999,
                                                mana: 999,
                                                reputation: 100,
                                                atelierLevel: 10,
                                                atelierSpecialization: "Essence",
                                                garden: [],
                                                inventory: [],
                                                blackMarketAccess: true,
                                                skills: { gardening: 10, brewing: 10, trading: 10, crafting: 10, herbalism: 10, astrology: 10 },
                                                knownRecipes: [],
                                                completedRituals: [],
                                                journalEntries: [],
                                                questsCompleted: 0,
                                                lastActive: Date.now()
                                            }],
                                            market: [],
                                            marketData: { inflation: 1.0, demand: {}, supply: {}, volatility: 0.1, blackMarketAccessCost: 500, blackMarketUnlocked: true, tradingVolume: 0 },
                                            rumors: [],
                                            townRequests: [],
                                            journal: [],
                                            rituals: [],
                                            events: [],
                                            knownRecipes: [],
                                            time: { year: 1, dayCount: 1, phaseName: "Full Moon", phase: 0, season: "Spring", weatherFate: "clear" }
                                        });
                                    }
                                }}
                            >
                                DEBUG: Skip Loading
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    console.log('Exited loading check, rendering main UI');

    // We'll directly render error display in the render logic instead of as separate components
    
    // Handler for entering the game from the lobby
    const handleEnterGame = useCallback(() => {
        console.log('Entering game from lobby');
        
        // Create a mock game state for testing if we don't have one yet
        if (!gameState) {
            setGameState(createMockGameState());
        }
        
        // Hide the lobby first
        setShowLobby(false);
        
        // Then exit loading state
        setTimeout(() => {
            setLoading(false);
            console.log('Loading disabled after entering game');
        }, 500);
    }, [gameState]);
    
    // Monitor key state changes and cleanup timers
    useEffect(() => {
        console.log('App mounted');
        
        // Track all timers to clean them up properly
        const timers: NodeJS.Timeout[] = [];
        
        // Add a failsafe timer to exit loading state after 5 seconds
        const loadingTimer = setTimeout(() => {
            console.log('Checking loading state (5s failsafe)');
            if (loading) {
                console.log('Failsafe: Loading state still true after 5 seconds, forcing to false');
                setLoading(false);
                
                // If we don't have game state yet, create mock state
                if (!gameState) {
                    setGameState(createMockGameState());
                }
            }
        }, 5000);
        timers.push(loadingTimer);
        
        // Add a secondary failsafe for extreme cases - force a refresh after 30 seconds if still loading
        const extremeFailsafe = setTimeout(() => {
            if (loading) {
                console.log('CRITICAL: App still loading after 30 seconds, forcing minimal mode');
                
                // Attempt to use the minimal app
                const urlParams = new URLSearchParams(window.location.search);
                
                if (!urlParams.has('minimal')) {
                    console.log('Redirecting to minimal mode...');
                    // Add minimal=true to the URL and reload
                    urlParams.set('minimal', 'true');
                    window.location.search = urlParams.toString();
                } else {
                    console.log('Already in minimal mode but still failing, forcing refresh');
                    window.location.reload();
                }
            }
        }, 30000);
        timers.push(extremeFailsafe);
        
        // Component cleanup
        return () => {
            console.log('App unmounted, cleaning up all timers');
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [loading, gameState]);

    // Memoized weather overlay component to prevent re-renders
    const weatherOverlay = useMemo(() => {
        if (!gameState) return null;
        
        return (
            <WeatherEffectsOverlay
                weatherType={gameState.time.weatherFate}
                intensity="medium"
                timeOfDay={["New Moon", "Waning Crescent", "Last Quarter", "Waning Gibbous", "Full Moon"].includes(gameState.time.phaseName) ? 'night' : 'day'}
                season={gameState.time.season as Season}
            />
        );
    }, [gameState?.time?.weatherFate, gameState?.time?.phaseName, gameState?.time?.season]);

    // Memoize the menu bar to prevent re-renders
    const MenuBar = useMemo(() => (
        <div className="game-menu-bar">
            <div 
                className={`game-menu-item ${currentView === 'garden' ? 'active' : ''}`} 
                onClick={() => handleChangeLocation('garden')}
            >
                <span className="game-menu-key">G</span>arden
            </div>
            <div 
                className={`game-menu-item ${currentView === 'brewing' ? 'active' : ''}`} 
                onClick={() => handleChangeLocation('brewing')}
            >
                <span className="game-menu-key">B</span>rewing
            </div>
            <div 
                className={`game-menu-item ${currentView === 'atelier' ? 'active' : ''}`} 
                onClick={() => handleChangeLocation('atelier')}
            >
                <span className="game-menu-key">A</span>telier
            </div>
            <div 
                className={`game-menu-item ${currentView === 'market' ? 'active' : ''}`} 
                onClick={() => handleChangeLocation('market')}
            >
                <span className="game-menu-key">M</span>arket
            </div>
            <div 
                className={`game-menu-item ${currentView === 'journal' ? 'active' : ''}`} 
                onClick={() => handleChangeLocation('journal')}
            >
                <span className="game-menu-key">J</span>ournal
            </div>
            <div 
                className="game-menu-item"
                onClick={advanceDay}
            >
                <span className="game-menu-key">E</span>nd Day
            </div>
        </div>
    ), [currentView, handleChangeLocation, advanceDay]);
    
    return (
        <MultiplayerProvider>
            <div className="game-container">
                {/* Show error as an overlay if present */}
                {error && (
                    <div className="error-overlay">
                        <div className="error-popup">
                            <div className="error-popup-header">
                                ERROR
                                <button onClick={() => setError(null)} className="error-close">X</button>
                            </div>
                            <div className="error-popup-content">{error}</div>
                        </div>
                    </div>
                )}

                {showLobby ? (
                    <Lobby onEnterGame={handleEnterGame} />
                ) : (
                    <>
                        <div className="game-backdrop"></div>
                        <div className="game-frame">
                            {/* Fantasy-style title bar */}
                            <div className="game-title-bar">The Witch Coven</div>
                            
                            {/* Optimized menu bar */}
                            {MenuBar}
                            
                            {/* Weather Effects Overlay - Memoized */}
                            {weatherOverlay}

                            {/* Main content area */}
                            {gameState && currentPlayer ? (
                                <main className={`game-content ${pageTransition ? 'page-transition' : ''}`}>
                                    <div className="view-container">
                                        {/* Debug info - helps identify render loop source */}
                                        <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px', fontSize: '10px', maxWidth: '300px', zIndex: 9999 }}>
                                            View: {currentView} | 
                                            Transition: {pageTransition.toString()} | 
                                            Loading: {loading.toString()}
                                        </div>
                                        
                                        {/* Online players display */}
                                        {useMultiplayer && (
                                            <OnlinePlayers showDetailed={false} />
                                        )}
                                        
                                        {/* Render current view with Error Boundaries */}
                                        <ErrorBoundary fallback={<div style={{color: 'white'}}>Error rendering {currentView}</div>}>
                                            {(() => {
                                                // Use IIFE to isolate rendering logic
                                                try {
                                                    switch(currentView) {
                                                        case 'garden':
                                                            return (
                                                                <Garden
                                                                    plots={currentPlayer.garden as GardenSlot[]}
                                                                    inventory={currentPlayer.inventory as InventoryItem[]}
                                                                    onPlant={plantSeed}
                                                                    onHarvest={harvestPlant}
                                                                    onWater={waterPlants}
                                                                    weatherFate={gameState.time.weatherFate}
                                                                    season={gameState.time.season as Season}
                                                                />
                                                            );
                                                        case 'brewing':
                                                            return (
                                                                <Brewing
                                                                    playerInventory={currentPlayer.inventory as InventoryItem[]}
                                                                    knownRecipes={gameState.knownRecipes || []}
                                                                    lunarPhase={gameState.time.phaseName}
                                                                    playerSpecialization={currentPlayer.atelierSpecialization}
                                                                    onBrew={brewPotion}
                                                                />
                                                            );
                                                        case 'atelier':
                                                            return (
                                                                <Atelier
                                                                    playerItems={currentPlayer.inventory as InventoryItem[]}
                                                                    onCraftItem={(ingredientIds, resultItemId) => console.log('Craft action TBD', ingredientIds, resultItemId)}
                                                                    lunarPhase={gameState.time.phaseName}
                                                                    playerLevel={currentPlayer.atelierLevel}
                                                                    playerSpecialization={currentPlayer.atelierSpecialization}
                                                                    knownRecipes={gameState.knownRecipes || []}
                                                                />
                                                            );
                                                        case 'market':
                                                            return (
                                                                <Market
                                                                    playerGold={currentPlayer.gold}
                                                                    playerInventory={currentPlayer.inventory as InventoryItem[]}
                                                                    marketItems={gameState.market}
                                                                    rumors={gameState.rumors}
                                                                    townRequests={gameState.townRequests}
                                                                    blackMarketAccess={currentPlayer.blackMarketAccess}
                                                                    onBuyItem={buyItem}
                                                                    onSellItem={sellItem}
                                                                    onFulfillRequest={fulfillRequest}
                                                                />
                                                            );
                                                        case 'journal':
                                                            return (
                                                                <Journal
                                                                    journal={gameState.journal}
                                                                    rumors={gameState.rumors}
                                                                    rituals={gameState.rituals}
                                                                    time={gameState.time}
                                                                    player={currentPlayer}
                                                                    onClaimRitual={claimRitualReward}
                                                                />
                                                            );
                                                        default:
                                                            return <div style={{color: 'white'}}>Invalid view: {currentView}</div>;
                                                    }
                                                } catch (err) {
                                                    console.error('Error rendering view:', err);
                                                    return <div style={{color: 'white'}}>Error rendering view</div>;
                                                }
                                            })()}
                                        </ErrorBoundary>
                                    </div>
                                </main>
                            ) : (
                                <div className="view-container" style={{ padding: '20px', color: 'white' }}>
                                    <h2>Waiting for game state...</h2>
                                    <p>The game is trying to connect to the backend. If you see this message for more than a few seconds, there may be an issue with the backend server.</p>
                                    <p>Error: {error || 'No error message'}</p>
                                    <button 
                                        className="game-button" 
                                        onClick={() => {
                                            const urlParams = new URLSearchParams(window.location.search);
                                            urlParams.set('minimal', 'true');
                                            window.location.search = urlParams.toString();
                                        }}
                                    >
                                        Try Minimal Mode
                                    </button>
                                    <button 
                                        className="game-button" 
                                        onClick={() => window.location.reload()}
                                        style={{ marginLeft: '10px' }}
                                    >
                                        Refresh Page
                                    </button>
                                </div>
                            )}

                            {/* Fantasy-style status bar */}
                            {gameState && currentPlayer && (
                                <div className="game-status-bar">
                                    <div className="status-item">
                                        <span className="status-icon">✧</span> 
                                        <span>{currentPlayer.name}</span>
                                    </div>
                                    <div className="status-item">
                                        <span className="status-icon">⛁</span>
                                        <span className="status-value">{currentPlayer.gold}</span> Gold
                                    </div>
                                    <div className="status-item">
                                        <span className="status-icon">☀</span>
                                        <span className="status-value">{gameState.time.dayCount}</span>
                                    </div>
                                    <div className="status-item">
                                        <span className="status-icon">☾</span>
                                        <span>{gameState.time.phaseName}</span>
                                    </div>
                                    <div className="status-item">
                                        <span className="status-icon">★</span>
                                        <span className="status-value">{currentPlayer.reputation}</span>
                                    </div>
                                    <div className="status-item">
                                        <span className="status-icon">⚗</span>
                                        <span className="status-value">{currentPlayer.atelierLevel}</span>
                                    </div>
                                    {useMultiplayer && (
                                        <div className="status-item">
                                            <span className="status-icon">👤</span>
                                            <span>Online</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Chat component (only if multiplayer is enabled) */}
                            {useMultiplayer && !showLobby && (
                                <MultiplayerChat />
                            )}

                            {/* Error is now displayed at the top level */}

                            {/* Moonlight Meadow Easter Egg - DOS style */}
                            {moonlightMeadowActive && (
                                <div className="moonlight-meadow" onClick={() => setMoonlightMeadowActive(false)}>
                                    <div className="moonlight-overlay"></div>
                                    <div className="moon-glow"></div>
                                    {spiritPositions.map((spirit, i) => (
                                        <div key={i} className="meadow-spirit" style={{ 
                                            left: `${spirit.x}%`, 
                                            top: `${spirit.y}%`, 
                                            animationDelay: `${spirit.delay}s` 
                                        }}/>
                                    ))}
                                    <div className="moonlight-message">GARDEN BLESSED BY MOONLIGHT</div>
                                </div>
                            )}

                            {/* Ambient particles - DOS style */}
                            <div className="ambient-particles">
                                {Array.from({ length: 15 }).map((_, i) => {
                                    const delay = Math.random() * 15;
                                    const moveX = Math.random() * 400 - 200;
                                    const moveY = Math.random() * 400 - 200;
                                    return (
                                        <div 
                                            key={i} 
                                            className="particle"
                                            style={{
                                                left: `${Math.random() * 100}%`,
                                                top: `${Math.random() * 100}%`,
                                                animationDuration: `${15 + Math.random() * 10}s`,
                                                animationDelay: `${delay}s`,
                                                '--move-x': `${moveX}px`,
                                                '--move-y': `${moveY}px`
                                            } as React.CSSProperties}
                                        />
                                    );
                                })}
                            </div>

                            {/* Konami Code Activation - DOS style */}
                            {konamiActivated && (
                                <div className="konami-activation">
                                    <div className="activation-text">ANCIENT COVEN CODE ACTIVATED!</div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </MultiplayerProvider>
    );
};

export default App;