// frontend/src/components/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css'; // Ensure App.css has the root variables and base styles
import {
  GameState, Season, InventoryItem, Player,
  GardenSlot, BasicRecipeInfo, WeatherFate, MoonPhase, AtelierSpecialization, RitualQuest, Rumor, TownRequest, MarketItem, JournalEntry
} from 'coven-shared';

// Import Components using aliases
import Garden from '@components/Garden';
import Brewing from '@components/Brewing';
import Market from '@components/Market';
import Journal from '@components/Journal';
import HUD from '@components/HUD';
import Atelier from '@components/Atelier';
import WeatherEffectsOverlay from '@components/WeatherEffectsOverlay';

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
    const errorMsg = responseData?.error || responseData?.message || `API call failed: ${response.statusText}`;
    throw new Error(errorMsg);
  }
  return responseData as GameState;
};


// Main App Component
const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastErrorTimestamp, setLastErrorTimestamp] = useState<number>(0);

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
                setError(`Failed to load game data: ${(err as Error).message}. Please ensure the backend server is running.`);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialState();
    }, []);

    // Function to clear error after a delay or manually
    const clearError = () => setError(null);

    // Auto-clear error after a few seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                if (Date.now() - lastErrorTimestamp >= 4900) {
                   clearError();
                }
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, lastErrorTimestamp]);


    // --- Action Handlers ---
    const handleApiAction = async (
        actionPromise: Promise<GameState>,
        successMessage?: string,
        errorMessagePrefix?: string
    ): Promise<void> => { // Explicitly return Promise<void>
        try {
            const newState = await actionPromise;
            setGameState(newState);
            setError(null);
            if (successMessage) console.log(successMessage);
        } catch (err) {
            const message = (err as Error).message || 'An unknown error occurred';
            const displayMessage = `${errorMessagePrefix || 'Error'}: ${message}`;
            console.error(errorMessagePrefix || 'Action failed:', err);
            setError(displayMessage);
            setLastErrorTimestamp(Date.now());
        }
        // Add explicit return here to satisfy strict checks
        return;
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
            `Failed to plant seed`
        );
    };

    const harvestPlant = (slotId: number) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/harvest', 'POST', { playerId, slotId }),
            `Harvested plant from slot ${slotId + 1}`,
            `Failed to harvest`
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
        if (!playerId || ingredientInvItemIds.length === 0) return;
        handleApiAction(
            apiCall('/brew', 'POST', { playerId, ingredientInvItemIds }),
            `Attempted brew with ${ingredientInvItemIds.length} ingredients. Matched Recipe ID: ${recipeId || 'None'}`,
            'Brewing failed'
        );
    };

    const craftAtelierItem = (ingredientInvItemIds: string[], resultItemId: string) => {
         if (!playerId || ingredientInvItemIds.length === 0) return;
         handleApiAction(
             apiCall('/craft', 'POST', { playerId, ingredientInvItemIds, resultItemId }),
             `Attempted to craft ${resultItemId}`,
             'Crafting failed'
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

    // --- Loading/Error States ---
    if (loading) {
        return (
            <div className="loading-screen">
                <h1>Loading Coven...</h1>
                <div className="loading-icon"></div>
            </div>
        );
    }

    // Show persistent error overlay if an error exists
    const ErrorDisplay = () => (
        <div className="error-overlay" onClick={clearError} title="Click to dismiss">
            <p>{error}</p>
            <button onClick={clearError}>X</button>
        </div>
    );


    // Check for fatal error (no game state loaded) - Use the styled error screen
    if (!gameState || !currentPlayer) {
        return (
            <div className="error-screen">
                <h1>Initialization Error</h1>
                <p>{error || 'Failed to load essential game data. The coven remains hidden.'}</p>
                <button onClick={() => window.location.reload()}>Retry Connection</button>
            </div>
        );
    }


    // --- Main Router and Content ---
    const GameRouter: React.FC = () => {
        const navigate = useNavigate();
        const handleChangeLocation = (location: string) => navigate(`/${location}`);

        const timeOfDay: 'day' | 'night' = 'day'; // Placeholder

        return (
            <>
             {error && <ErrorDisplay />}
                <WeatherEffectsOverlay
                    weatherType={gameState.time.weatherFate as WeatherFate}
                    intensity="medium"
                    timeOfDay={timeOfDay}
                    season={gameState.time.season as Season}
                />
                <HUD
                    playerName={currentPlayer.name}
                    gold={currentPlayer.gold}
                    day={gameState.time.dayCount}
                    lunarPhase={gameState.time.phaseName as MoonPhase || 'New Moon'}
                    reputation={currentPlayer.reputation}
                    onChangeLocation={handleChangeLocation}
                    onAdvanceDay={advanceDay}
                    playerLevel={currentPlayer.atelierLevel}
                />
                <main className="game-content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/garden" replace />} />
                        <Route path="/garden" element={
                            <Garden
                                plots={currentPlayer.garden as GardenSlot[]}
                                inventory={currentPlayer.inventory as InventoryItem[]}
                                onPlant={plantSeed}
                                onHarvest={harvestPlant}
                                onWater={waterPlants}
                                weatherFate={gameState.time.weatherFate as WeatherFate}
                                season={gameState.time.season as Season}
                            />
                        } />
                         <Route path="/brewing" element={
                            <Brewing
                                playerInventory={currentPlayer.inventory as InventoryItem[]}
                                knownRecipes={gameState.knownRecipes as BasicRecipeInfo[] || []}
                                lunarPhase={gameState.time.phaseName as MoonPhase || 'New Moon'}
                                playerSpecialization={currentPlayer.atelierSpecialization as AtelierSpecialization}
                                onBrew={brewPotion}
                            />
                        } />
                         <Route path="/atelier" element={
                            <Atelier
                                playerItems={currentPlayer.inventory as InventoryItem[]}
                                onCraftItem={craftAtelierItem}
                                lunarPhase={gameState.time.phaseName as MoonPhase || 'New Moon'}
                                playerLevel={currentPlayer.atelierLevel}
                                playerSpecialization={currentPlayer.atelierSpecialization as AtelierSpecialization}
                                knownRecipes={gameState.knownRecipes as BasicRecipeInfo[]}
                            />
                        } />
                         <Route path="/market" element={
                            <Market
                                playerGold={currentPlayer.gold}
                                playerInventory={currentPlayer.inventory as InventoryItem[]}
                                marketItems={gameState.market as MarketItem[]}
                                rumors={gameState.rumors as Rumor[]}
                                townRequests={gameState.townRequests as TownRequest[]}
                                blackMarketAccess={currentPlayer.blackMarketAccess}
                                onBuyItem={buyItem}
                                onSellItem={sellItem}
                                onFulfillRequest={fulfillRequest}
                            />
                        } />
                        <Route path="/journal" element={
                            <Journal
                                journal={gameState.journal as JournalEntry[]}
                                rumors={gameState.rumors as Rumor[]}
                                rituals={gameState.rituals as RitualQuest[]}
                                time={gameState.time}
                                player={currentPlayer as Player}
                                onClaimRitual={claimRitualReward}
                            />
                        } />
                        <Route path="*" element={<Navigate to="/garden" replace />} />
                    </Routes>
                </main>
            </>
        );
    };

    return (
        <Router>
            <div className="game-container">
                <GameRouter />
            </div>
        </Router>
    );
};

export default App;