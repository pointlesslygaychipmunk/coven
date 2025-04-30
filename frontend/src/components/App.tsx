// frontend/src/components/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import {
  GameState, Season, InventoryItem,
  GardenSlot, BasicRecipeInfo
} from 'coven-shared';

// Import Components using aliases
// Add .js extension for Vite compatibility if needed, otherwise TS handles it
// (Vite often works better without the explicit extension if configured correctly)
import Garden from '@components/Garden';
import Brewing from '@components/Brewing';
import Market from '@components/Market';
import Journal from '@components/Journal';
import HUD from '@components/HUD';
import Atelier from '@components/Atelier';
import WeatherEffectsOverlay from '@components/WeatherEffectsOverlay';

// API Utility
const API_BASE_URL = '/api'; // Proxy handles this in dev

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
  return responseData as GameState; // Assume all successful API calls return the new GameState
};


// Main App Component
const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                setLoading(false);
            }
        };
        fetchInitialState();
        // TODO: Setup WebSocket connection for real-time updates if needed
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
            if (successMessage) console.log(successMessage); // Or show a toast notification
        } catch (err) {
            const message = (err as Error).message || 'An unknown error occurred';
            console.error(errorMessagePrefix || 'Action failed:', err);
            setError(`${errorMessagePrefix || 'Error'}: ${message}`);
            // Maybe revert state or show specific error UI?
        }
    };

     // Get current player and ID safely
    const currentPlayer = gameState?.players[gameState.currentPlayerIndex];
    const playerId = currentPlayer?.id;

    // Wrap API calls with checks and error messages
    const plantSeed = (slotId: number, seedInventoryItemId: string) => { // Expect Inventory Item ID
        if (!playerId) return;
        handleApiAction(
            apiCall('/plant', 'POST', { playerId, slotId, seedItemId: seedInventoryItemId }), // Pass correct parameter name
            `Planted seed in slot ${slotId + 1}`, // Log generic success message
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
        // Backend currently accepts 'success' flag, default to true for player action
        handleApiAction(
            apiCall('/water', 'POST', { playerId, success: true }),
            'Watered garden plots',
            'Failed to water plants'
        );
    };

     const brewPotion = (ingredientInvItemIds: string[], recipeId?: string) => { // Expect inventory IDs
        if (!playerId) return;
        handleApiAction(
            apiCall('/brew', 'POST', { playerId, ingredientInvItemIds }), // Pass inventory IDs
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

    const sellItem = (inventoryItemId: string) => { // Needs INVENTORY item ID
        if (!playerId) return;
        handleApiAction(
            apiCall('/market/sell', 'POST', { playerId, itemId: inventoryItemId }), // API expects 'itemId' but it's inventory ID
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
        <div className="error-overlay">
            <p>Error: {error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
        </div>
    );


    // Check for fatal error (no game state loaded)
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
    // Need a component inside Router to use useNavigate
    const GameRouter: React.FC = () => {
        const navigate = useNavigate();
        const handleChangeLocation = (location: string) => navigate(`/${location}`);

        return (
            <>
             {error && <ErrorDisplay />}
                <WeatherEffectsOverlay
                    weatherType={gameState.time.weatherFate}
                    intensity="medium" // Intensity could be dynamic later
                    timeOfDay="day" // TODO: Derive this from game time
                    season={gameState.time.season as Season}
                />
                <HUD
                    playerName={currentPlayer.name}
                    gold={currentPlayer.gold}
                    day={gameState.time.dayCount}
                    lunarPhase={gameState.time.phaseName || 'New Moon'}
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
                                onHarvest={harvestPlant} // Pass correct handler
                                onWater={waterPlants}
                                weatherFate={gameState.time.weatherFate}
                                season={gameState.time.season as Season}
                            />
                        } />
                         <Route path="/brewing" element={
                            <Brewing
                                playerInventory={currentPlayer.inventory as InventoryItem[]}
                                knownRecipes={gameState.knownRecipes as BasicRecipeInfo[] || []} // Pass known recipes, cast if needed
                                lunarPhase={gameState.time.phaseName}
                                playerSpecialization={currentPlayer.atelierSpecialization}
                                onBrew={brewPotion} // Pass the handler
                            />
                        } />
                         <Route path="/atelier" element={
                            <Atelier
                                playerItems={currentPlayer.inventory as InventoryItem[]} // Pass inventory
                                onCraftItem={(ingredientIds, resultItemId) => console.log('Craft action TBD', ingredientIds, resultItemId)} // TODO: Implement Atelier crafting API call
                                lunarPhase={gameState.time.phaseName}
                                playerLevel={currentPlayer.atelierLevel}
                                playerSpecialization={currentPlayer.atelierSpecialization} // Pass specialization
                                knownRecipes={gameState.knownRecipes as BasicRecipeInfo[]} // Pass known recipes
                            />
                        } />
                         <Route path="/market" element={
                            <Market
                                playerGold={currentPlayer.gold}
                                playerInventory={currentPlayer.inventory as InventoryItem[]}
                                marketItems={gameState.market}
                                rumors={gameState.rumors}
                                townRequests={gameState.townRequests}
                                blackMarketAccess={currentPlayer.blackMarketAccess}
                                onBuyItem={buyItem}
                                onSellItem={sellItem} // Pass inventory item ID from Market component
                                onFulfillRequest={fulfillRequest}
                                // onSpreadRumor={spreadRumor} // TODO: Implement if needed
                            />
                        } />
                        <Route path="/journal" element={
                            <Journal
                                journal={gameState.journal}
                                rumors={gameState.rumors}
                                rituals={gameState.rituals}
                                time={gameState.time}
                                player={currentPlayer} // Pass the player object
                                onClaimRitual={claimRitualReward} // Pass claim handler
                                // onMarkRead={markJournalRead} // TODO: Implement if needed
                            />
                        } />
                        {/* Add other routes as needed */}
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