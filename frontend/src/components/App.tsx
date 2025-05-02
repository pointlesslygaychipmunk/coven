import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { GameState, Season, InventoryItem, GardenSlot } from 'coven-shared';

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

// Main App Component
const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageTransition, setPageTransition] = useState<boolean>(false);
    const [currentView, setCurrentView] = useState<string>('garden'); // Default view

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

    // Fetch initial game state
    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                setLoading(true);
                const initialState = await apiCall('/state');
                setGameState(initialState);
                setError(null);
            } catch (err) {
                console.error('Error fetching initial game state:', err);
                setError('Failed to connect to the Coven server. Is it running?');
            } finally {
                setTimeout(() => setLoading(false), 800); // Shorter loading time
            }
        };
        fetchInitialState();
    }, []);

    // --- Action Handlers ---
    const handleApiAction = useCallback(async (
        actionPromise: Promise<GameState>,
        successMessage?: string,
        errorMessagePrefix?: string
    ) => {
        try {
            const newState = await actionPromise;
            setGameState(newState); // Update state with the result from the API
            setError(null); // Clear previous errors
            if (successMessage) console.log(`[Action Success] ${successMessage}`);
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
    const handleChangeLocation = useCallback((location: string) => {
        if (location === currentView || pageTransition) return;
        setPageTransition(true);
        setTimeout(() => {
            setCurrentView(location);
            // End transition *after* view potentially changes content
            setTimeout(() => setPageTransition(false), 150); // Shorter fade-in time
        }, 300); // Wait for fade-out
    }, [currentView, pageTransition]);

    // --- Loading Screen ---
    if (loading) {
        return (
            <div className="game-container">
                <div className="loading-screen">
                    <div className="parchment-scroll">
                        <div className="scroll-top"></div>
                        <div className="scroll-content">
                            <h1>Summoning Magical Energies</h1>
                            <div className="cauldron-container">
                                <div className="cauldron-body">
                                    <div className="cauldron-liquid"></div>
                                    <div className="bubble bubble-1"></div>
                                    <div className="bubble bubble-2"></div>
                                    <div className="bubble bubble-3"></div>
                                </div>
                                <div className="cauldron-legs">
                                    <div className="leg"></div>
                                    <div className="leg"></div>
                                    <div className="leg"></div>
                                </div>
                            </div>
                            <p className="loading-flavor-text">Brewing the perfect potion takes time...</p>
                        </div>
                        <div className="scroll-bottom"></div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Error Display ---
    const ErrorDisplay = () => error && (
        <div className="error-overlay">
            <div className="error-scroll">
                <div className="error-message">{error}</div>
                <button onClick={() => setError(null)} className="error-dismiss">×</button>
            </div>
        </div>
    );

    // --- Error Screen ---
    if (!gameState || !currentPlayer) {
        return (
            <div className="game-container">
                <div className="error-screen">
                    <div className="parchment-scroll">
                        <div className="scroll-top"></div>
                        <div className="scroll-content">
                            <h1>The Grimoire Remains Closed</h1>
                            <p>{error || 'Failed to load essential game data. The coven remains hidden.'}</p>
                            <div className="retry-button-container">
                                <button 
                                    className="retry-button" 
                                    onClick={() => window.location.reload()}>
                                    <span>Retry</span>
                                </button>
                            </div>
                        </div>
                        <div className="scroll-bottom"></div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Render ---
    return (
        <div className="game-container">
            <div className="game-backdrop"></div>
            <div className="game-frame">
                {/* Weather Effects Overlay */}
                <WeatherEffectsOverlay
                    weatherType={gameState.time.weatherFate}
                    intensity="medium"
                    timeOfDay={["New Moon", "Waning Crescent", "Last Quarter", "Waning Gibbous", "Full Moon"].includes(gameState.time.phaseName) ? 'night' : 'day'}
                    season={gameState.time.season as Season}
                />
                
                {/* Navigation HUD */}
                <HUD
                    playerName={currentPlayer.name}
                    gold={currentPlayer.gold}
                    day={gameState.time.dayCount}
                    lunarPhase={gameState.time.phaseName || 'New Moon'}
                    reputation={currentPlayer.reputation}
                    playerLevel={currentPlayer.atelierLevel}
                    onChangeLocation={handleChangeLocation}
                    onAdvanceDay={advanceDay}
                />

                {/* Main content area */}
                <main className={`game-content ${pageTransition ? 'page-transition' : ''}`}>
                    <div className="view-container">
                        {/* Render current view */}
                        {currentView === 'garden' && (
                            <Garden
                                plots={currentPlayer.garden as GardenSlot[]}
                                inventory={currentPlayer.inventory as InventoryItem[]}
                                onPlant={plantSeed}
                                onHarvest={harvestPlant}
                                onWater={waterPlants}
                                weatherFate={gameState.time.weatherFate}
                                season={gameState.time.season as Season}
                            />
                        )}
                        {currentView === 'brewing' && (
                            <Brewing
                                playerInventory={currentPlayer.inventory as InventoryItem[]}
                                knownRecipes={gameState.knownRecipes || []}
                                lunarPhase={gameState.time.phaseName}
                                playerSpecialization={currentPlayer.atelierSpecialization}
                                onBrew={brewPotion}
                            />
                        )}
                        {currentView === 'atelier' && (
                            <Atelier
                                playerItems={currentPlayer.inventory as InventoryItem[]}
                                onCraftItem={(ingredientIds, resultItemId) => console.log('Craft action TBD', ingredientIds, resultItemId)}
                                lunarPhase={gameState.time.phaseName}
                                playerLevel={currentPlayer.atelierLevel}
                                playerSpecialization={currentPlayer.atelierSpecialization}
                                knownRecipes={gameState.knownRecipes || []}
                            />
                        )}
                        {currentView === 'market' && (
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
                        )}
                        {currentView === 'journal' && (
                            <Journal
                                journal={gameState.journal}
                                rumors={gameState.rumors}
                                rituals={gameState.rituals}
                                time={gameState.time}
                                player={currentPlayer}
                                onClaimRitual={claimRitualReward}
                            />
                        )}
                    </div>
                    
                    {/* Decorative corners */}
                    <div className="corner-decoration top-left"></div>
                    <div className="corner-decoration top-right"></div>
                    <div className="corner-decoration bottom-left"></div>
                    <div className="corner-decoration bottom-right"></div>
                </main>

                {/* Error Display */}
                <ErrorDisplay />

                {/* Moonlight Meadow Easter Egg */}
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
                        <div className="moonlight-message">Your garden is blessed by moonlight...</div>
                    </div>
                )}

                {/* Ambient particles */}
                <div className="ambient-particles">
                    {Array.from({ length: 15 }).map((_, i) => {
                        const size = 2 + Math.random() * 3;
                        const duration = 15 + Math.random() * 20;
                        const delay = Math.random() * 15;
                        return (
                            <div 
                                key={i} 
                                className="particle"
                                style={{
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDuration: `${duration}s`,
                                    animationDelay: `${delay}s`
                                }}
                            />
                        );
                    })}
                </div>

                {/* Konami Code Activation */}
                {konamiActivated && (
                    <div className="konami-activation">
                        <div className="activation-glow"></div>
                        <div className="activation-text">Ancient Coven Code Activated!</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;