import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useCallback, useRef
import './App.css';
// REMOVED: Unused import 'BasicRecipeInfo'
import { GameState, Season, InventoryItem, GardenSlot /*, BasicRecipeInfo*/ } from 'coven-shared';

// Import Components
import Garden from './Garden';
import Brewing from './Brewing';
import Market from './Market';
import Journal from './Journal';
import HUD from './HUD'; // Will be placed in the sidebar
import Atelier from './Atelier';
import WeatherEffectsOverlay from './WeatherEffectsOverlay';

// API Utility - unchanged
const API_BASE_URL = '/api';
const apiCall = async (endpoint: string, method: string = 'GET', body?: any): Promise<GameState> => {
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
    const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    const [konamiActivated, setKonamiActivated] = useState<boolean>(false);

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
                // Check if gameState and player exist before attempting direct modification (though it's commented out)
                 if(gameState && gameState.players[gameState.currentPlayerIndex]){
                    // REMOVED: Unused player variable declaration
                    // const player = gameState.players[gameState.currentPlayerIndex];
                    // Direct state mutation example (discouraged)
                    // setGameState(prev => {
                    //     if (!prev) return null;
                    //     const players = [...prev.players];
                    //     players[prev.currentPlayerIndex] = { ...players[prev.currentPlayerIndex], gold: players[prev.currentPlayerIndex].gold + 10 };
                    //     return { ...prev, players };
                    // });
                 }

                setTimeout(() => setKonamiActivated(false), 3000); // Hide effect after 3s
                setTimeout(() => setError(null), 3500); // Clear message slightly later
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    // Added missing dependencies based on usage within the effect
    }, [gameState, konamiCode, setError, setKonamiActivated]); // Added dependencies


    // Moonlight Meadow Easter Egg Detection
    useEffect(() => {
      // Check if gameState and the current player's data exist
      if (!gameState?.players?.[gameState.currentPlayerIndex]?.garden) {
          // If not active, ensure meadow state is false
          if (moonlightMeadowActive) setMoonlightMeadowActive(false);
          return;
      }

      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      // Added explicit check for array type
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
      // Ensure effect runs when relevant state changes
    }, [gameState, moonlightMeadowActive]);


    // Fetch initial game state
    useEffect(() => {
        // Add this to the top of your useEffect section in App.tsx

// Handle window resize to fix mobile viewport issues
useEffect(() => {
    // Fix for mobile viewport height (100vh issue)
    const setVh = () => {
      // First we get the viewport height and we multiply it by 1% to get a value for a vh unit
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
  
  // The rest of your existing useEffect hooks can stay as they are
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
    }, []); // Empty dependency array - fetch only on mount

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
    }, []); // No external dependencies needed here

    // Get current player and ID safely
    const currentPlayer = gameState?.players[gameState.currentPlayerIndex];
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

    // MODIFIED: waterPlants now accepts puzzleBonus
    const waterPlants = useCallback((puzzleBonus: number = 0) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/water', 'POST', { playerId, puzzleBonus }), // Send bonus to backend
            `Attuned garden energies (Bonus: ${puzzleBonus}%)`, `Attunement failed`
        );
    }, [playerId, handleApiAction]);


    // MODIFIED: brewPotion now accepts puzzleBonus
    const brewPotion = useCallback((ingredientInvItemIds: string[], puzzleBonus: number = 0, recipeId?: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/brew', 'POST', { playerId, ingredientInvItemIds, puzzleBonus }), // Send bonus
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
            apiCall('/market/sell', 'POST', { playerId, itemId: inventoryItemId }), // API uses 'itemId'
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


    // --- Loading/Error States ---
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <h1>Brewing up your match...</h1>
                    <div className="cauldron-container">
                        <div className="cauldron-body">
                           <div className="cauldron-liquid"></div>
                           <div className="bubble bubble-1"></div>
                           <div className="bubble bubble-2"></div>
                           <div className="bubble bubble-3"></div>
                        </div>
                        <div className="cauldron-legs"><div className="leg"></div><div className="leg"></div><div className="leg"></div></div>
                    </div>
                    <p className="loading-flavor-text">Gathering mystical energies...</p>
                </div>
            </div>
        );
    }

    const ErrorDisplay = () => error && ( // Conditionally render based on error state
        <div className="error-overlay">
            <div className="error-scroll">
                <p>{error}</p>
                <button onClick={() => setError(null)}>X</button> {/* Simple dismiss */}
            </div>
        </div>
    );

    if (!gameState || !currentPlayer) {
        return (
            <div className="error-screen">
                <div className="torn-page">
                    <h1>The Grimoire Remains Closed</h1>
                    <p>{error || 'Failed to load essential game data. The coven remains hidden.'}</p>
                    <div className="cute-familiar">🐾</div> {/* Simple emoji */}
                    <button onClick={() => window.location.reload()}>Retry Connection</button>
                </div>
            </div>
        );
    }

    // --- Main Render ---
    return (
        <div className="game-container">
            <div className="game-frame">
                 {/* HUD is now a fixed sidebar */}
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

                 {/* Weather Effects Overlay - Covers entire frame */}
                <WeatherEffectsOverlay
                    weatherType={gameState.time.weatherFate}
                    intensity="medium" // Could be dynamic later
                    timeOfDay={["New Moon", "Waning Crescent", "Last Quarter", "Waning Gibbous", "Full Moon"].includes(gameState.time.phaseName) ? 'night' : 'day'} // Include Full Moon as night visual
                    season={gameState.time.season as Season}
                />

                {/* Main game content area */}
                <main className={`game-content ${pageTransition ? 'page-transition' : ''}`}>
                    {/* Scroll decorations are now part of game-content CSS */}
                    <div className="scroll-decoration top-left"></div>
                    <div className="scroll-decoration top-right"></div>
                    <div className="scroll-decoration bottom-left"></div>
                    <div className="scroll-decoration bottom-right"></div>

                    <div className="view-container">
                        {/* Render current view */}
                        {currentView === 'garden' && (
                            <Garden
                                plots={currentPlayer.garden as GardenSlot[]}
                                inventory={currentPlayer.inventory as InventoryItem[]}
                                onPlant={plantSeed}
                                onHarvest={harvestPlant}
                                onWater={waterPlants} // Pass the modified handler
                                weatherFate={gameState.time.weatherFate}
                                season={gameState.time.season as Season}
                            />
                        )}
                        {currentView === 'brewing' && (
                            <Brewing
                                playerInventory={currentPlayer.inventory as InventoryItem[]}
                                knownRecipes={gameState.knownRecipes || []} // Use gameState's knownRecipes
                                lunarPhase={gameState.time.phaseName}
                                playerSpecialization={currentPlayer.atelierSpecialization}
                                onBrew={brewPotion} // Pass the modified handler
                            />
                        )}
                         {currentView === 'atelier' && (
                            <Atelier
                                playerItems={currentPlayer.inventory as InventoryItem[]}
                                // TODO: Implement actual crafting logic/API call
                                onCraftItem={(ingredientIds, resultItemId) => console.log('Craft action TBD', ingredientIds, resultItemId)}
                                lunarPhase={gameState.time.phaseName}
                                playerLevel={currentPlayer.atelierLevel}
                                playerSpecialization={currentPlayer.atelierSpecialization}
                                knownRecipes={gameState.knownRecipes || []} // Pass known recipes
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
                                // onMarkRead could be added here if needed
                            />
                        )}
                    </div>
                </main>

                {/* Persistent Error Display */}
                <ErrorDisplay />

                 {/* Moonlight Meadow Easter Egg Overlay */}
                {moonlightMeadowActive && (
                    <div className="moonlight-meadow" onClick={() => setMoonlightMeadowActive(false)}>
                        <div className="moonlight-overlay"></div>
                        <div className="moon-glow"></div>
                        {spiritPositions.map((spirit, i) => (
                            <div key={i} className="meadow-spirit" style={{ left: `${spirit.x}%`, top: `${spirit.y}%`, animationDelay: `${spirit.delay}s` }}/>
                        ))}
                        <div className="meadow-message">Your garden is blessed by moonlight...</div>
                    </div>
                )}

                {/* Ambient Particle Effects Container */}
                <div className="ambient-particles-container">
                    {Array.from({ length: 12 }).map((_, i) => { // Reduced particle count
                        const duration = 15 + Math.random() * 25;
                        const delay = Math.random() * duration; // Ensure varied start times
                        const particleX = -50 + Math.random() * 100;
                        const particleY = -50 + Math.random() * 100;
                        return (
                            <div key={i} className="ambient-particle"
                                style={{
                                    left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                                    animationDelay: `${delay}s`,
                                    animationDuration: `${duration}s`,
                                    '--particle-x': `${particleX}px`, // CSS variable for random movement X
                                    '--particle-y': `${particleY}px`, // CSS variable for random movement Y
                                } as React.CSSProperties}/>
                        );
                    })}
                </div>

                 {/* Konami Code Activation Indicator */}
                 {konamiActivated && (
                    <div className="konami-active-indicator">COVEN CODE ACCEPTED</div>
                 )}

            </div>
        </div>
    );
};

export default App;