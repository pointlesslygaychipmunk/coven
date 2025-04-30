// frontend/src/components/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import {
    GameState, Player, Season, InventoryItem,
    GardenSlot, // Ensure this type exists in shared or rename import
    RitualQuest, Rumor, TownRequest, MoonPhase, BasicRecipeInfo
} from 'coven-shared'; // Import necessary types

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
```
--- END OF FILE new coven/frontend/src/components/App.tsx ---

--- START OF FILE new coven/frontend/src/components/GardenPlot.tsx ---
```typescript
import React from 'react';
import './GardenPlot.css';
import { GardenSlot, Plant } from 'coven-shared'; // Use shared types

interface GardenPlotProps {
  plot: GardenSlot;
  selected: boolean;
  onClick: () => void;
}

const GardenPlot: React.FC<GardenPlotProps> = ({
  plot,
  selected,
  onClick
}) => {
  // Determine if the plot is locked (explicitly false means locked)
  const isLocked = plot.isUnlocked === false;

  // Get the growth stage for visual representation
  const getGrowthStage = (plant: Plant | null): string => {
    if (!plant || plant.growth === undefined || plant.maxGrowth === undefined || plant.maxGrowth <= 0) return 'empty';

    // Handle mature state first (ensure mature property exists on Plant type in shared)
    if (plant.mature) return 'mature';

    const growthPercentage = (plant.growth / plant.maxGrowth) * 100;

    if (growthPercentage < 25) return 'seedling';
    if (growthPercentage < 50) return 'sprout';
    if (growthPercentage < 75) return 'growing';
    // If not mature but >= 75%, it's maturing
    return 'maturing';
  };

  // Get plant health class for visual representation
  const getHealthClass = (plant: Plant | null): string => {
    if (!plant || plant.health === undefined) return '';

    if (plant.health < 30) return 'unhealthy';
    if (plant.health < 60) return 'fair';
    return 'healthy';
  };

  // Determine moisture level class for the plot itself
  const getMoistureClass = (): string => {
    const moisture = plot.moisture ?? 50; // Default to 50 if undefined
    if (moisture < 30) return 'dry';
    if (moisture > 80) return 'wet'; // Increased threshold for 'wet'
    return 'normal';
  };

   // Determine if the plant needs water icon should show
   const needsWater = (plant: Plant | null): boolean => {
       if (!plant || plant.mature) return false; // Mature plants don't show water need
       const moisture = plot.moisture ?? 50;
       // Show if moisture is below a certain threshold (e.g., 40)
       return moisture < 40;
   };

  // Render plant visualization based on growth stage
  const renderPlant = () => {
    if (!plot.plant) return null;

    const growthStage = getGrowthStage(plot.plant);
    const healthClass = getHealthClass(plot.plant);
    const plantCategory = plot.plant.category || 'herb'; // Default category if needed

    return (
      <div className={`plant ${healthClass}`}>
        {/* Base Visual Element (can be styled further based on stage/type) */}
        <div className={`${growthStage}-visual`}>
           {/* CSS handles generic stage visuals */}
           {/* Add specific mature visuals based on category */}
           {growthStage === 'mature' && <div className={`mature-${plantCategory}`}></div>}
        </div>

        {/* Moon blessing visual effect */}
        {plot.plant.moonBlessed && (
          <div className="moon-blessing-effect" title="Moon Blessed"></div>
        )}
      </div>
    );
  };

  // Render plot status indicators
  const renderPlotStatus = () => {
    return (
      <div className="plot-status">
        {plot.plant?.mature && (
          <div className="status-icon ready-to-harvest" title="Ready to Harvest">✓</div>
        )}

        {needsWater(plot.plant) && (
          <div className="status-icon needs-water" title="Needs Water">💧</div>
        )}

        {!plot.plant && !isLocked && ( // Only show '+' on unlocked empty plots
          <div className="status-icon empty-plot" title="Empty Plot">+</div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`garden-plot ${isLocked ? 'locked' : ''} ${selected ? 'selected' : ''} ${getMoistureClass()}`}
      onClick={isLocked ? undefined : onClick}
      title={isLocked ? "Locked Plot" : `Plot ${plot.id + 1} (Click to interact)`}
    >
      {isLocked ? (
        <div className="locked-overlay">
          <div className="lock-icon">🔒</div>
        </div>
      ) : (
        <>
          <div className="plot-soil"></div>
          {renderPlant()}
          {renderPlotStatus()}
        </>
      )}
    </div>
  );
};

export default GardenPlot;
```
--- END OF FILE new coven/frontend/src/components/GardenPlot.tsx ---

--- START OF FILE new coven/frontend/src/components/HUD.tsx ---
```typescript
import React, { useState } from 'react';
import './HUD.css';
import LunarPhaseIcon from './LunarPhaseIcon'; // Ensure this component exists and works
import { MoonPhase } from 'coven-shared'; // Import shared type

interface HUDProps {
  playerName: string;
  gold: number;
  day: number;
  lunarPhase: string; // Keep as string for flexibility, cast below
  reputation: number;
  playerLevel: number;
  onChangeLocation: (location: string) => void;
  onAdvanceDay: () => void;
}

const HUD: React.FC<HUDProps> = ({
  playerName,
  gold,
  day,
  lunarPhase = 'New Moon', // Provide a default
  reputation,
  playerLevel,
  onChangeLocation,
  onAdvanceDay
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmEndDay, setConfirmEndDay] = useState(false);
  const [confirmTimeoutId, setConfirmTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Handle location change from menu
  const handleLocationClick = (location: string) => {
    onChangeLocation(location);
    setMenuOpen(false); // Close menu after selection
    resetEndDayConfirm(); // Reset confirm state if menu is used
  };

  // Handle end day click with confirmation step
  const handleEndDayClick = () => {
    if (confirmEndDay) {
      if(confirmTimeoutId) clearTimeout(confirmTimeoutId); // Clear existing timeout
      onAdvanceDay(); // Perform the action
      setConfirmEndDay(false); // Reset confirmation state
      setConfirmTimeoutId(null);
    } else {
      setConfirmEndDay(true); // Show confirmation state
      // Set a timeout to automatically cancel confirmation after a few seconds
      const timeoutId = setTimeout(() => {
         setConfirmEndDay(false);
         setConfirmTimeoutId(null);
         console.log("End day confirmation timed out.");
      }, 5000); // 5 seconds timeout
      setConfirmTimeoutId(timeoutId);
    }
  };

  // Toggle the location menu visibility
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    resetEndDayConfirm(); // Reset confirm state when menu is toggled
  };

  // Helper to reset the end day confirmation state and clear timeout
  const resetEndDayConfirm = () => {
      if(confirmTimeoutId) {
          clearTimeout(confirmTimeoutId);
          setConfirmTimeoutId(null);
      }
      setConfirmEndDay(false);
  };

  // Close menu if clicking outside (basic implementation)
  // useEffect(() => {
  //     const handleClickOutside = (event: MouseEvent) => {
  //         // Check if the click is outside the menu and the menu button
  //         // Requires refs on the menu and button, more complex setup
  //     };
  //     document.addEventListener('mousedown', handleClickOutside);
  //     return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, [menuOpen]);


  return (
    <div className="hud-container">
      {/* Top Bar */}
      <div className="hud-top">
        {/* Player Info */}
        <div className="player-info">
          <div className="player-avatar" title={`Player: ${playerName}`}>
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div className="player-details">
            <div className="player-name">{playerName}</div>
            <div className="player-level">
              <span className="level-label">Lv</span>
              <span className="level-number">{playerLevel}</span>
            </div>
          </div>
        </div>

        {/* Lunar Display */}
        <div className="lunar-display">
          <div className="lunar-icon">
            <LunarPhaseIcon phase={lunarPhase as MoonPhase} size={40} /> {/* Cast to MoonPhase */}
          </div>
          <div className="lunar-info">
            <div className="lunar-phase">{lunarPhase}</div>
            <div className="day-count">Day {day}</div>
          </div>
        </div>

        {/* Resources */}
        <div className="resources">
          <div className="gold-display" title={`${gold} Gold`}>
            <div className="gold-icon" />
            <div className="gold-amount">{gold}</div>
          </div>
          <div className="reputation-display" title={`${reputation} Reputation`}>
            <div className="reputation-icon" />
            <div className="reputation-amount">{reputation}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="hud-actions">
          <button
            className={`end-day-button ${confirmEndDay ? 'confirm' : ''}`}
            onClick={handleEndDayClick}
            title={confirmEndDay ? "Click again to confirm ending the day" : "End the current day"}
          >
            {confirmEndDay ? 'Confirm?' : 'End Day'}
          </button>
          <button
            className={`menu-button ${menuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            title="Open Navigation Menu"
          >
            <div className="menu-icon">
              <span></span><span></span><span></span>
            </div>
          </button>
        </div>
      </div>

      {/* Location Menu (conditionally rendered) */}
      {menuOpen && (
        <div className="location-menu">
          <div className="menu-header">
            <h3>Navigate</h3>
          </div>
          <div className="menu-items">
            {/* Define locations */}
            {[
              { name: 'Garden', location: 'garden', iconClass: 'garden-icon' },
              { name: 'Brewing', location: 'brewing', iconClass: 'brewing-icon' },
              { name: 'Atelier', location: 'atelier', iconClass: 'atelier-icon' },
              { name: 'Market', location: 'market', iconClass: 'market-icon' },
              { name: 'Journal', location: 'journal', iconClass: 'journal-icon' },
            ].map(item => (
              <div
                key={item.location}
                className="menu-item"
                onClick={() => handleLocationClick(item.location)}
                role="button" // Accessibility
                tabIndex={0} // Accessibility
              >
                <div className={`menu-item-icon ${item.iconClass}`} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
           <div className="menu-footer">
             <button
               className="close-menu-button"
               onClick={toggleMenu}
             >
               Close Menu
             </button>
           </div>
        </div>
      )}
    </div>
  );
};