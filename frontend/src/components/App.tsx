// frontend/src/components/App.tsx
import React, { useState, useEffect } from 'react';
import './App.css'; 
import {
  GameState, Season, InventoryItem, GardenSlot, BasicRecipeInfo
} from 'coven-shared';

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

const apiCall = async (endpoint: string, method: string = 'GET', body?: any): Promise<GameState> => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
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
  return responseData as GameState;
};

// Main App Component
const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageTransition, setPageTransition] = useState<boolean>(false);
    const [currentView, setCurrentView] = useState<string>('garden');
    
    // Easter egg state - Moonlight Meadow
    const [moonlightMeadowActive, setMoonlightMeadowActive] = useState<boolean>(false);
    const [meadowIntensity, setMeadowIntensity] = useState<number>(0);
    const [spiritPositions, setSpiritPositions] = useState<Array<{x: number, y: number, delay: number}>>([]);

    // Moonlight Meadow Easter Egg Detection
    useEffect(() => {
        if (!gameState || !gameState.players[gameState.currentPlayerIndex]) return;
        
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        
        // Check garden health and happiness conditions
        if (currentPlayer.garden && Array.isArray(currentPlayer.garden)) {
            const totalPlots = currentPlayer.garden.length;
            const healthyPlots = currentPlayer.garden.filter(plot => 
                plot.plant && plot.plant.health > 80 && plot.moisture > 60
            ).length;
            
            // Calculate a "magic rating" based on garden health
            const magicRating = healthyPlots / totalPlots;
            setMeadowIntensity(magicRating);
            
            // Magic threshold for activating the easter egg
            // Also require full moon or special conditions for higher chance
            const moonBonus = gameState.time.phaseName === "Full Moon" ? 0.2 : 0;
            const magicThreshold = Math.random() * (0.85 - moonBonus);
            
            // Check if it's night time (based on phase name or other properties)
            const isNightTime = gameState.time.phaseName === "New Moon" || 
                               gameState.time.phaseName === "Waning Crescent" || 
                               gameState.time.phaseName === "Waning Gibbous";
            
            if (magicRating > magicThreshold && isNightTime) {
                if (!moonlightMeadowActive) {
                    console.log("🌙✨ The Moonlight Meadow appears! ✨🌙");
                    
                    // Create spirits that will float around
                    const newSpirits = Array.from({ length: 12 }, () => ({
                        x: Math.random() * 100,
                        y: Math.random() * 100,
                        delay: Math.random() * 8
                    }));
                    setSpiritPositions(newSpirits);
                    
                    setMoonlightMeadowActive(true);
                }
            } else {
                setMoonlightMeadowActive(false);
            }
        }
        
        // Return cleanup function
        return () => {};
    }, [gameState]);

    // Fetch initial game state on mount
    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                setLoading(true);
                const initialState = await apiCall('/state');
                setGameState(initialState);
                setError(null);
            } catch (err) {
                console.error('Error fetching initial game state:', err);
                setError('Failed to load game data. Please ensure the backend server is running.');
            } finally {
                // Add a slight delay for the loading animation to be noticed
                setTimeout(() => {
                    setLoading(false);
                }, 1200);
            }
        };
        fetchInitialState();
    }, []);

    // --- Action Handlers ---
    const handleApiAction = async (
        actionPromise: Promise<GameState>,
        successMessage?: string,
        errorMessagePrefix?: string
    ) => {
        try {
            const newState = await actionPromise;
            setGameState(newState);
            setError(null); // Clear previous errors on success
            if (successMessage) console.log(successMessage);
        } catch (err) {
            const message = (err as Error).message || 'An unknown error occurred';
            console.error(errorMessagePrefix || 'Action failed:', err);
            setError(`${errorMessagePrefix || 'Error'}: ${message}`);
        }
    };

    // Get current player and ID safely
    const currentPlayer = gameState?.players[gameState.currentPlayerIndex];
    const playerId = currentPlayer?.id;

    // Wrap API calls with checks and error messages
    const plantSeed = (slotId: number, seedInventoryItemId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/plant', 'POST', { playerId, slotId, seedItemId: seedInventoryItemId }),
            `Planted seed in slot ${slotId + 1}`,
            `Failed to plant seed in slot ${slotId + 1}`
        );
    };

    const harvestPlant = (slotId: number) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/harvest', 'POST', { playerId, slotId }),
            `Harvested plant from slot ${slotId + 1}`,
            `Failed to harvest from slot ${slotId + 1}`
        );
    };

    const waterPlants = () => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/water', 'POST', { playerId, success: true }),
            'Watered garden plots',
            'Failed to water plants'
        );
    };

    const brewPotion = (ingredientInvItemIds: string[], recipeId?: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/brew', 'POST', { playerId, ingredientInvItemIds }),
            recipeId ? `Attempted to brew recipe ${recipeId}` : `Attempted to brew with selected ingredients`,
            'Brewing failed'
        );
    };

    const buyItem = (itemId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/market/buy', 'POST', { playerId, itemId }),
            `Purchased item ${itemId}`,
            'Failed to purchase item'
        );
    };

    const sellItem = (inventoryItemId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/market/sell', 'POST', { playerId, itemId: inventoryItemId }),
            `Sold item ${inventoryItemId}`,
            'Failed to sell item'
        );
    };

    const fulfillRequest = (requestId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/fulfill', 'POST', { playerId, requestId }),
            `Fulfilled request ${requestId}`,
            'Failed to fulfill request'
        );
    };

    const advanceDay = () => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/end-turn', 'POST', { playerId }),
            'Advanced to the next phase',
            'Failed to advance day'
        );
    };

    const claimRitualReward = (ritualId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/ritual/claim', 'POST', { playerId, ritualId }),
            `Claimed reward for ritual ${ritualId}`,
            'Failed to claim ritual reward'
        );
    };

    // Handle location change with page transition
    const handleChangeLocation = (location: string) => {
        if (location === currentView) return;
        
        // Start transition
        setPageTransition(true);
        
        // After a short delay, change view
        setTimeout(() => {
            setCurrentView(location);
            // Wait a bit more before ending transition
            setTimeout(() => {
                setPageTransition(false);
            }, 300);
        }, 300);
    };

    // --- Loading/Error States ---
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <h1>Awakening Coven...</h1>
                    <div className="cauldron-container">
                        <div className="cauldron-body">
                            <div className="cauldron-bubble bubble-1"></div>
                            <div className="cauldron-bubble bubble-2"></div>
                            <div className="cauldron-bubble bubble-3"></div>
                            <div className="cauldron-liquid"></div>
                        </div>
                        <div className="cauldron-legs">
                            <div className="leg"></div>
                            <div className="leg"></div>
                            <div className="leg"></div>
                        </div>
                    </div>
                    <p className="loading-flavor-text">Gathering mystical energies...</p>
                </div>
            </div>
        );
    }

    // Show persistent error overlay if an error exists
    const ErrorDisplay = () => (
        <div className="error-overlay">
            <div className="error-scroll">
                <p>{error}</p>
                <button onClick={() => setError(null)}>Dismiss</button>
            </div>
        </div>
    );

    // Check for fatal error (no game state loaded)
    if (!gameState || !currentPlayer) {
        return (
            <div className="error-screen">
                <div className="torn-page">
                    <h1>The Grimoire Remains Closed</h1>
                    <p>{error || 'Failed to load essential game data. The coven remains hidden.'}</p>
                    <div className="cute-familiar"></div>
                    <button onClick={() => window.location.reload()}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-container">
            <div className="game-frame">
                {error && <ErrorDisplay />}
                
                {/* Show Moonlight Meadow when activated */}
                {moonlightMeadowActive && (
                    <div className="moonlight-meadow" onClick={() => setMoonlightMeadowActive(false)}>
                        <div className="moonlight-overlay"></div>
                        <div className="moon-glow"></div>
                        
                        {/* Wandering spirits/fireflies */}
                        {spiritPositions.map((spirit, i) => (
                            <div 
                                key={i} 
                                className="meadow-spirit"
                                style={{
                                    left: `${spirit.x}%`,
                                    top: `${spirit.y}%`,
                                    animationDelay: `${spirit.delay}s`
                                }}
                            />
                        ))}
                        
                        <div className="meadow-message">
                            Your garden is blessed by moonlight...
                        </div>
                        
                        <style>{`
                            .moonlight-meadow {
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                z-index: 950;
                                pointer-events: none;
                            }
                            
                            .moonlight-overlay {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background: radial-gradient(ellipse at top, rgba(116, 192, 252, ${meadowIntensity * 0.3}), rgba(62, 84, 172, ${meadowIntensity * 0.1}));
                                animation: pulse 8s infinite alternate ease-in-out;
                            }
                            
                            .moon-glow {
                                position: absolute;
                                top: 5%;
                                right: 10%;
                                width: 100px;
                                height: 100px;
                                border-radius: 50%;
                                background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.8), rgba(205, 223, 255, 0.3) 70%, transparent);
                                box-shadow: 0 0 80px 30px rgba(201, 223, 248, 0.6);
                                animation: moonGlow 10s infinite alternate ease-in-out;
                            }
                            
                            .meadow-spirit {
                                position: absolute;
                                width: 10px;
                                height: 10px;
                                border-radius: 50%;
                                background-color: rgba(255, 255, 240, 0.8);
                                box-shadow: 0 0 10px 2px rgba(255, 255, 200, 0.6);
                                animation: spiritFloat 15s infinite alternate ease-in-out;
                                opacity: ${meadowIntensity * 0.8 + 0.2};
                            }
                            
                            .meadow-message {
                                position: absolute;
                                bottom: 10%;
                                left: 50%;
                                transform: translateX(-50%);
                                color: rgba(255, 255, 255, 0.9);
                                font-family: "Times New Roman", serif;
                                font-size: 1.6rem;
                                font-style: italic;
                                text-shadow: 0 0 10px rgba(116, 192, 252, 0.8);
                                opacity: 0;
                                animation: messageAppear 4s ease-in forwards;
                            }
                            
                            @keyframes pulse {
                                0%, 100% { opacity: ${meadowIntensity * 0.5 + 0.3}; }
                                50% { opacity: ${meadowIntensity * 0.3 + 0.2}; }
                            }
                            
                            @keyframes moonGlow {
                                0% { opacity: 0.8; transform: scale(1); }
                                50% { opacity: 1; transform: scale(1.05); }
                                100% { opacity: 0.9; transform: scale(1); }
                            }
                            
                            @keyframes spiritFloat {
                                0% { transform: translate(0, 0) scale(1); opacity: 0.4; }
                                25% { transform: translate(30px, -20px) scale(1.2); opacity: 0.9; }
                                50% { transform: translate(10px, 30px) scale(0.8); opacity: 0.6; }
                                75% { transform: translate(-20px, 10px) scale(1.1); opacity: 0.8; }
                                100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
                            }
                            
                            @keyframes messageAppear {
                                0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                                70% { opacity: 0.8; transform: translateX(-50%) translateY(0); }
                                100% { opacity: 0.9; transform: translateX(-50%) translateY(0); }
                            }
                        `}</style>
                    </div>
                )}
                
                {/* Weather effects overlay */}
                <WeatherEffectsOverlay
                    weatherType={gameState.time.weatherFate}
                    intensity="medium"
                    timeOfDay="day" // TODO: Derive this from game time
                    season={gameState.time.season as Season}
                />
                
                {/* HUD Component - ensure it has the highest z-index */}
                <div className="hud-wrapper">
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
                </div>
                
                {/* Main game content */}
                <main className={`game-content ${pageTransition ? 'page-transition' : ''}`}>
                    <div className="scroll-decoration top-left"></div>
                    <div className="scroll-decoration top-right"></div>
                    <div className="scroll-decoration bottom-left"></div>
                    <div className="scroll-decoration bottom-right"></div>
                    
                    <div className="view-container">
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
                                knownRecipes={gameState.knownRecipes as BasicRecipeInfo[] || []}
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
                                knownRecipes={gameState.knownRecipes as BasicRecipeInfo[]}
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
                </main>
                
                <div className="ambient-particles-container">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div 
                            key={i} 
                            className="ambient-particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 10}s`,
                                animationDuration: `${10 + Math.random() * 20}s`
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default App;