import React, { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GameState, Season, MoonPhase } from 'coven-shared';
import './App.css';
import '../garden-styles.css';
import '../inventory-modal.css';

// Basic App that will definitely render without hooks issues
const SimpleApp: React.FC = () => {
  // State for game functionality
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('garden');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Additional state for interactive features
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [activeAction, setActiveAction] = useState<'plant' | 'harvest' | 'water' | null>(null);
  const [itemFilter, setItemFilter] = useState<string | null>(null);
  
  // Garden actions
  const plantSeed = (plotId: number, seedId: string) => {
    if (!gameState) return;
    
    try {
      // Find the seed in the inventory
      const player = gameState.players[gameState.currentPlayerIndex];
      const seed = player.inventory.find(item => item.id === seedId);
      
      if (!seed) {
        setErrorMessage("Seed not found in inventory!");
        return;
      }
      
      if (seed.quantity <= 0) {
        setErrorMessage("You don't have any of this seed left!");
        return;
      }
      
      const plot = player.garden.find(p => p.id === plotId);
      if (!plot) {
        setErrorMessage("Garden plot not found!");
        return;
      }
      
      if (plot.plant) {
        setErrorMessage("This plot already has a plant!");
        return;
      }
      
      // Create a new plant
      const newPlant = {
        id: `plant-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: seed.name.replace(' Seeds', ''),
        growth: 0,
        maxGrowth: 100,
        watered: false,
        health: 100,
        age: 0,
        mature: false,
      };
      
      // Update the garden plot
      const updatedGarden = player.garden.map(p => 
        p.id === plotId ? {...p, plant: newPlant} : p
      );
      
      // Update the inventory (reduce seed quantity)
      const updatedInventory = player.inventory.map(item => 
        item.id === seedId 
          ? {...item, quantity: item.quantity - 1} 
          : item
      ).filter(item => item.quantity > 0); // Remove if quantity becomes 0
      
      // Update the player
      const updatedPlayer = {
        ...player,
        garden: updatedGarden,
        inventory: updatedInventory
      };
      
      // Update the game state
      const updatedGameState = {
        ...gameState,
        players: gameState.players.map((p, idx) => 
          idx === gameState.currentPlayerIndex ? updatedPlayer : p
        )
      };
      
      setGameState(updatedGameState as GameState);
      setErrorMessage(null);
      setActiveAction(null);
      setSelectedPlot(null);
      setSelectedItem(null);
      setShowInventoryModal(false);
    } catch (err) {
      console.error('Error planting seed:', err);
      setErrorMessage('Failed to plant seed.');
    }
  };
  
  const harvestPlant = (plotId: number) => {
    if (!gameState) return;
    
    try {
      const player = gameState.players[gameState.currentPlayerIndex];
      const plot = player.garden.find(p => p.id === plotId);
      
      if (!plot) {
        setErrorMessage("Garden plot not found!");
        return;
      }
      
      if (!plot.plant) {
        setErrorMessage("No plant to harvest!");
        return;
      }
      
      if (!plot.plant.mature) {
        setErrorMessage("Plant is not ready for harvest yet!");
        return;
      }
      
      // Create harvested item
      const harvestedItem = {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        baseId: plot.plant.id.split('-')[0],
        name: plot.plant.name,
        type: 'ingredient' as const,
        category: 'herb' as const,
        quantity: 1 + Math.floor(Math.random() * 3), // Random 1-3 quantity
        quality: Math.floor(70 + (plot.plant.health / 10)), // Quality based on plant health
        value: 10 + Math.floor(Math.random() * 20),
        description: `A freshly harvested ${plot.plant.name}.`,
      };
      
      // Check if we already have this item and merge if so
      const existingItemIndex = player.inventory.findIndex(
        item => item.name === harvestedItem.name && item.type === harvestedItem.type
      );
      
      let updatedInventory;
      if (existingItemIndex >= 0) {
        // Merge with existing item
        updatedInventory = player.inventory.map((item, idx) => 
          idx === existingItemIndex 
            ? {...item, quantity: item.quantity + harvestedItem.quantity} 
            : item
        );
      } else {
        // Add as new item
        updatedInventory = [...player.inventory, harvestedItem];
      }
      
      // Clear the plot
      const updatedGarden = player.garden.map(p => 
        p.id === plotId ? {...p, plant: null} : p
      );
      
      // Update the player
      const updatedPlayer = {
        ...player,
        garden: updatedGarden,
        inventory: updatedInventory
      };
      
      // Update the game state
      const updatedGameState = {
        ...gameState,
        players: gameState.players.map((p, idx) => 
          idx === gameState.currentPlayerIndex ? updatedPlayer : p
        )
      };
      
      setGameState(updatedGameState as GameState);
      setErrorMessage(null);
      setActiveAction(null);
      setSelectedPlot(null);
    } catch (err) {
      console.error('Error harvesting plant:', err);
      setErrorMessage('Failed to harvest plant.');
    }
  };
  
  const waterPlants = () => {
    if (!gameState) return;
    
    try {
      const player = gameState.players[gameState.currentPlayerIndex];
      
      // Water all plants that aren't already at max moisture
      const updatedGarden = player.garden.map(plot => {
        if (plot.moisture < 100) {
          return {
            ...plot,
            moisture: Math.min(100, plot.moisture + 30) // Increase moisture by 30%, max 100
          };
        }
        return plot;
      });
      
      // Update the player
      const updatedPlayer = {
        ...player,
        garden: updatedGarden
      };
      
      // Update the game state
      const updatedGameState = {
        ...gameState,
        players: gameState.players.map((p, idx) => 
          idx === gameState.currentPlayerIndex ? updatedPlayer : p
        )
      };
      
      setGameState(updatedGameState as GameState);
      setErrorMessage(null);
      setActiveAction(null);
    } catch (err) {
      console.error('Error watering plants:', err);
      setErrorMessage('Failed to water plants.');
    }
  };
  
  // Market actions
  const buyItem = (itemId: string) => {
    if (!gameState) return;
    
    try {
      const player = gameState.players[gameState.currentPlayerIndex];
      const item = gameState.market.find(i => i.id === itemId);
      
      if (!item) {
        setErrorMessage("Item not found in market!");
        return;
      }
      
      if (player.gold < item.price) {
        setErrorMessage("Not enough gold to buy this item!");
        return;
      }
      
      // Create inventory item
      const boughtItem = {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        baseId: item.id,
        name: item.name,
        type: item.type,
        category: item.category,
        quantity: 1,
        quality: 80, // Market items have good quality
        value: item.price,
        description: item.description || `A ${item.name} bought from the market.`,
      };
      
      // Check if we already have this item and merge if so
      const existingItemIndex = player.inventory.findIndex(
        i => i.name === boughtItem.name && i.type === boughtItem.type
      );
      
      let updatedInventory;
      if (existingItemIndex >= 0) {
        // Merge with existing item
        updatedInventory = player.inventory.map((i, idx) => 
          idx === existingItemIndex 
            ? {...i, quantity: i.quantity + boughtItem.quantity} 
            : i
        );
      } else {
        // Add as new item
        updatedInventory = [...player.inventory, boughtItem];
      }
      
      // Update the player's gold
      const updatedPlayer = {
        ...player,
        gold: player.gold - item.price,
        inventory: updatedInventory
      };
      
      // Update the game state
      const updatedGameState = {
        ...gameState,
        players: gameState.players.map((p, idx) => 
          idx === gameState.currentPlayerIndex ? updatedPlayer : p
        )
      };
      
      setGameState(updatedGameState as GameState);
      setErrorMessage(null);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error buying item:', err);
      setErrorMessage('Failed to buy item.');
    }
  };
  
  const sellItem = (inventoryItemId: string) => {
    if (!gameState) return;
    
    try {
      const player = gameState.players[gameState.currentPlayerIndex];
      const item = player.inventory.find(i => i.id === inventoryItemId);
      
      if (!item) {
        setErrorMessage("Item not found in inventory!");
        return;
      }
      
      // Calculate sell price (70% of value)
      const sellPrice = Math.floor((item.value || 10) * 0.7);
      
      // Remove one from inventory or reduce quantity
      let updatedInventory;
      if (item.quantity > 1) {
        updatedInventory = player.inventory.map(i => 
          i.id === inventoryItemId 
            ? {...i, quantity: i.quantity - 1} 
            : i
        );
      } else {
        // Remove completely if only one left
        updatedInventory = player.inventory.filter(i => i.id !== inventoryItemId);
      }
      
      // Update the player's gold
      const updatedPlayer = {
        ...player,
        gold: player.gold + sellPrice,
        inventory: updatedInventory
      };
      
      // Update the game state
      const updatedGameState = {
        ...gameState,
        players: gameState.players.map((p, idx) => 
          idx === gameState.currentPlayerIndex ? updatedPlayer : p
        )
      };
      
      setGameState(updatedGameState as GameState);
      setErrorMessage(null);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error selling item:', err);
      setErrorMessage('Failed to sell item.');
    }
  };
  
  // Add function to advance the day with growth calculations
  const advanceDay = () => {
    if (!gameState) return;
    
    try {
      // Get the current player
      const player = gameState.players[gameState.currentPlayerIndex];
      
      // Update each plant's growth and health
      const updatedGarden = player.garden.map(plot => {
        if (!plot.plant) return plot;
        
        // Calculate growth based on moisture and fertility
        const growthFactor = (plot.moisture / 100) * (plot.fertility / 100);
        const growthIncrease = Math.floor(10 * growthFactor);
        
        // Calculate health changes
        let healthChange = 0;
        if (plot.moisture < 30) healthChange -= 10; // Drought damage
        if (plot.moisture > 30) healthChange += 5; // Some recovery
        
        // Check if plant reaches maturity
        const newGrowth = Math.min(plot.plant.maxGrowth, plot.plant.growth + growthIncrease);
        const becomesMature = newGrowth >= plot.plant.maxGrowth && !plot.plant.mature;
        
        // Reduce moisture as time passes
        const newMoisture = Math.max(0, plot.moisture - 20);
        
        return {
          ...plot,
          moisture: newMoisture,
          plant: {
            ...plot.plant,
            growth: newGrowth,
            health: Math.max(0, Math.min(100, plot.plant.health + healthChange)),
            age: plot.plant.age + 1,
            mature: becomesMature || plot.plant.mature
          }
        };
      });
      
      // Update the player
      const updatedPlayer = {
        ...player,
        garden: updatedGarden
      };
      
      // Create updated game state with new day
      const nextDay = {
        ...gameState,
        players: gameState.players.map((p, idx) => 
          idx === gameState.currentPlayerIndex ? updatedPlayer : p
        ),
        time: {
          ...gameState.time,
          dayCount: gameState.time.dayCount + 1,
          // Cycle through moon phases
          phase: (gameState.time.phase + 1) % 8,
          phaseName: getNextMoonPhase(gameState.time.phaseName),
          // Random weather
          weatherFate: getRandomWeather() as any,
        }
      };
      
      setGameState(nextDay as GameState);
      setErrorMessage(null);
    } catch (err) {
      console.error('Error advancing day:', err);
      setErrorMessage('Failed to advance to the next day.');
    }
  };
  
  // Helper function to get the next moon phase
  const getNextMoonPhase = (currentPhase: string): MoonPhase => {
    const phases: MoonPhase[] = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                   'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    const currentIndex = phases.indexOf(currentPhase as MoonPhase);
    if (currentIndex === -1) return 'New Moon';
    return phases[(currentIndex + 1) % phases.length];
  };
  
  // Helper function to get random weather
  const getRandomWeather = (): string => {
    const weatherTypes = ['clear', 'rainy', 'cloudy', 'windy', 'stormy', 'foggy'];
    return weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
  };
  
  // Simple fetch at component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/state');
        
        if (response.ok) {
          const data = await response.json();
          setGameState(data);
        } else {
          // Use mock data if API fails
          console.log('Using mock game state');
          setGameState({
            currentPlayerIndex: 0,
            version: "1.0.0",
            players: [{
              id: "player1",
              name: "Witch",
              gold: 100,
              mana: 50,
              reputation: 50,
              atelierLevel: 1,
              atelierSpecialization: "Essence",
              garden: [
                {
                  id: 0,
                  plant: {
                    id: "moon-blossom-1",
                    name: "Moon Blossom",
                    growth: 70,
                    maxGrowth: 100,
                    watered: true,
                    health: 85,
                    age: 3,
                    mature: false,
                  },
                  fertility: 80,
                  moisture: 70,
                },
                {
                  id: 1,
                  plant: null,
                  fertility: 65,
                  moisture: 40,
                },
                {
                  id: 2,
                  plant: {
                    id: "shadow-root-1",
                    name: "Shadow Root",
                    growth: 100,
                    maxGrowth: 100,
                    watered: true,
                    health: 90,
                    age: 5,
                    mature: true,
                  },
                  fertility: 75,
                  moisture: 65,
                }
              ],
              inventory: [
                {
                  id: "inv-moonleaf-1",
                  baseId: "moonleaf",
                  name: "Moonleaf",
                  type: "ingredient",
                  category: "herb",
                  quantity: 3,
                  quality: 85,
                  value: 20,
                  description: "A silvery leaf that glows faintly in moonlight."
                },
                {
                  id: "inv-nightshade-1",
                  baseId: "nightshade",
                  name: "Midnight Nightshade",
                  type: "ingredient",
                  category: "herb",
                  quantity: 2,
                  quality: 70,
                  value: 15,
                  description: "A dark purple herb with dangerous properties."
                },
                {
                  id: "inv-crystal-1",
                  baseId: "crystal",
                  name: "Clear Quartz",
                  type: "ingredient",
                  category: "crystal",
                  quantity: 1,
                  quality: 90,
                  value: 30,
                  description: "A clear crystal that amplifies magical energy."
                }
              ],
              blackMarketAccess: false,
              skills: { gardening: 1, brewing: 1, trading: 1, crafting: 1, herbalism: 1, astrology: 1 },
              knownRecipes: [],
              completedRituals: [],
              journalEntries: [],
              questsCompleted: 0,
              lastActive: Date.now()
            }],
            market: [
              {
                id: "market-item-1",
                name: "Witch Hazel Seeds",
                type: "seed",
                category: "seed",
                price: 25,
                basePrice: 25,
                description: "Seeds to grow Witch Hazel, a magical plant with divination properties."
              },
              {
                id: "market-item-2",
                name: "Clay Pot",
                type: "tool",
                category: "tool",
                price: 15,
                basePrice: 15,
                description: "A simple clay pot for growing magical plants."
              },
              {
                id: "market-item-3",
                name: "Enchanted Watering Can",
                type: "tool",
                category: "tool",
                price: 75,
                basePrice: 75,
                description: "A watering can imbued with magical properties that helps plants grow faster."
              }
            ],
            marketData: { inflation: 1.0, demand: {}, supply: {}, volatility: 0.1, blackMarketAccessCost: 500, blackMarketUnlocked: false, tradingVolume: 0 },
            rumors: [
              {
                id: "rumor-1",
                content: "They say the full moon next week will have unusual properties for brewing transformation potions.",
                spread: 3,
                verified: false,
                origin: "Old Witch in the Market"
              },
              {
                id: "rumor-2",
                content: "The town guard found strange mushrooms growing in the forest after the last storm.",
                spread: 5,
                verified: true,
                origin: "Town Crier"
              }
            ],
            townRequests: [],
            journal: [],
            rituals: [],
            events: [],
            knownRecipes: [],
            time: { year: 1, dayCount: 1, phaseName: "Full Moon", phase: 0, season: "Spring", weatherFate: "clear" }
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Show loading screen
  if (loading) {
    return (
      <div className="game-container">
        <div className="loading-screen">
          <div className="loading-dialog">
            <div className="loading-header">LOADING WITCH COVEN</div>
            <div className="loading-content">
              <h1>INITIALIZING MAGICAL SYSTEMS</h1>
              <div className="loading-bar-container">
                <div className="loading-bar"></div>
              </div>
              <p className="loading-text">Summoning magical components...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If we have no game state, show an error
  if (!gameState) {
    return (
      <div className="game-container">
        <div className="error-screen">
          <h1>Error loading game data</h1>
          <p>Unable to load game state. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </div>
    );
  }
  
  // Show error message if present
  const showError = errorMessage !== null;
  
  // Get current player safely
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  
  return (
    <div className="game-container">
      {/* Error overlay */}
      {showError && (
        <div className="error-overlay">
          <div className="error-popup">
            <div className="error-popup-header">
              ERROR
              <button onClick={() => setErrorMessage(null)} className="error-close">X</button>
            </div>
            <div className="error-popup-content">{errorMessage}</div>
          </div>
        </div>
      )}
      
      <div className="game-backdrop"></div>
      <div className="game-frame">
        {/* Title bar */}
        <div className="game-title-bar">The Witch Coven</div>
        
        {/* Menu bar */}
        <div className="game-menu-bar">
          <div 
            className={`game-menu-item ${view === 'garden' ? 'active' : ''}`}
            onClick={() => setView('garden')}
          >
            <span className="game-menu-key">G</span>arden
          </div>
          <div 
            className={`game-menu-item ${view === 'brewing' ? 'active' : ''}`}
            onClick={() => setView('brewing')}
          >
            <span className="game-menu-key">B</span>rewing
          </div>
          <div 
            className={`game-menu-item ${view === 'atelier' ? 'active' : ''}`}
            onClick={() => setView('atelier')}
          >
            <span className="game-menu-key">A</span>telier
          </div>
          <div 
            className={`game-menu-item ${view === 'market' ? 'active' : ''}`}
            onClick={() => setView('market')}
          >
            <span className="game-menu-key">M</span>arket
          </div>
          <div 
            className={`game-menu-item ${view === 'journal' ? 'active' : ''}`}
            onClick={() => setView('journal')}
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
        
        {/* Main content */}
        <main className="game-content">
          <div className="view-container">
            {view === 'garden' && (
              <div className="garden-view">
                <h2>Witch's Garden</h2>
                <div className="garden-actions">
                  <button 
                    className="garden-action-button"
                    onClick={() => {
                      setActiveAction('water');
                      waterPlants();
                    }}
                  >
                    Water All Plants
                  </button>
                </div>
                <div className="garden-grid">
                  {Array.isArray(currentPlayer.garden) && currentPlayer.garden.length > 0 ? (
                    currentPlayer.garden.map((plot, index) => (
                      <div 
                        key={index} 
                        className={`garden-plot ${selectedPlot === plot.id ? 'selected' : ''}`}
                        data-growth={
                          plot.plant ? 
                            (plot.plant.mature ? 'mature' :
                            plot.plant.growth >= 70 ? 'high' :
                            plot.plant.growth >= 40 ? 'medium' : 'low')
                          : 'empty'
                        }
                        onClick={() => setSelectedPlot(plot.id)}
                      >
                        {plot.plant ? (
                          <div 
                            className="plant-info"
                            data-growth={
                              plot.plant.mature ? 'mature' :
                              plot.plant.growth >= 70 ? 'high' :
                              plot.plant.growth >= 40 ? 'medium' : 'low'
                            }
                          >
                            <div className="plant-name">{plot.plant.name}</div>
                            <div className="plant-stats">
                              <div>Growth: {plot.plant.growth}/{plot.plant.maxGrowth}</div>
                              <div>Health: {plot.plant.health}%</div>
                              <div>{plot.plant.mature ? 'Ready to Harvest!' : 'Growing...'}</div>
                            </div>
                            {plot.plant.mature && (
                              <button 
                                className="harvest-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  harvestPlant(plot.id);
                                }}
                              >
                                Harvest
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="empty-plot">
                            <div>Empty Plot</div>
                            <button 
                              className="plant-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAction('plant');
                                setSelectedPlot(plot.id);
                                setShowInventoryModal(true);
                                setItemFilter('seed');
                              }}
                            >
                              Plant
                            </button>
                          </div>
                        )}
                        <div className="plot-info">
                          <div>Moisture: {plot.moisture}%</div>
                          <div>Fertility: {plot.fertility}%</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-garden">
                      <p>You don't have any garden plots yet.</p>
                      <p>Visit the market to purchase seeds and gardening supplies.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {view === 'brewing' && (
              <div className="brewing-view">
                <h2>Brewing Chamber</h2>
                <div className="brewing-intro">
                  <p>Here you can brew magical potions using your harvested ingredients.</p>
                  <p>Current moon phase: <span className="highlight">{gameState.time.phaseName}</span> - affects potion potency!</p>
                </div>
                
                <div className="inventory-section">
                  <h3>Your Ingredients</h3>
                  <div className="ingredient-list">
                    {Array.isArray(currentPlayer.inventory) && currentPlayer.inventory.filter(item => item.type === 'ingredient').length > 0 ? (
                      currentPlayer.inventory
                        .filter(item => item.type === 'ingredient')
                        .map((item, index) => (
                          <div key={index} className="ingredient-item">
                            <div className="item-name">{item.name}</div>
                            <div className="item-quantity">x{item.quantity}</div>
                          </div>
                        ))
                    ) : (
                      <p>You don't have any ingredients yet. Grow plants in your garden to harvest them.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {view === 'market' && (
              <div className="market-view">
                <h2>Witches' Market</h2>
                <div className="market-intro">
                  <p>Buy and sell magical items at the market. Your reputation affects prices!</p>
                  <p>Your gold: <span className="highlight">{currentPlayer.gold}</span></p>
                </div>
                
                <div className="market-sections">
                  <div className="market-section">
                    <h3>Available Items</h3>
                    {gameState.market && gameState.market.length > 0 ? (
                      <div className="market-items">
                        {gameState.market.map((item, index) => (
                          <div key={index} className="market-item">
                            <div className="item-name">{item.name}</div>
                            <div className="item-price">{item.price} gold</div>
                            <div className="item-description">{item.description}</div>
                            <button 
                              className="buy-button" 
                              disabled={currentPlayer.gold < item.price}
                              onClick={() => buyItem(item.id)}
                            >
                              Buy
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>The market currently has no items for sale. Check back tomorrow!</p>
                    )}
                  </div>
                  
                  <div className="market-section">
                    <h3>Your Inventory</h3>
                    {Array.isArray(currentPlayer.inventory) && currentPlayer.inventory.length > 0 ? (
                      <div className="inventory-items">
                        {currentPlayer.inventory.map((item, index) => (
                          <div key={index} className="inventory-item">
                            <div className="item-name">{item.name}</div>
                            <div className="item-quantity">x{item.quantity}</div>
                            <div className="item-value">Value: {Math.floor(item.value * 0.7)} gold</div>
                            <button 
                              className="sell-button"
                              onClick={() => sellItem(item.id)}
                            >
                              Sell
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Your inventory is empty.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {view === 'atelier' && (
              <div className="atelier-view">
                <h2>Magic Atelier</h2>
                <div className="atelier-intro">
                  <p>Craft magical items and enhance your abilities in your personal atelier.</p>
                  <p>Your specialization: <span className="highlight">{currentPlayer.atelierSpecialization}</span></p>
                  <p>Atelier Level: <span className="highlight">{currentPlayer.atelierLevel}</span></p>
                </div>
                
                <div className="crafting-area">
                  <h3>Crafting</h3>
                  <p>Select ingredients and recipes to craft magical items.</p>
                </div>
              </div>
            )}
            
            {view === 'journal' && (
              <div className="journal-view">
                <h2>Witch's Journal</h2>
                
                <div className="journal-section">
                  <h3>Calendar</h3>
                  <div className="calendar-info">
                    <div className="calendar-item">
                      <div className="calendar-label">Day:</div>
                      <div className="calendar-value">{gameState.time.dayCount}</div>
                    </div>
                    <div className="calendar-item">
                      <div className="calendar-label">Season:</div>
                      <div className="calendar-value">{gameState.time.season}</div>
                    </div>
                    <div className="calendar-item">
                      <div className="calendar-label">Moon Phase:</div>
                      <div className="calendar-value">{gameState.time.phaseName}</div>
                    </div>
                    <div className="calendar-item">
                      <div className="calendar-label">Weather:</div>
                      <div className="calendar-value">{gameState.time.weatherFate}</div>
                    </div>
                  </div>
                </div>
                
                <div className="journal-section">
                  <h3>Town Rumors</h3>
                  {gameState.rumors && gameState.rumors.length > 0 ? (
                    <div className="rumor-list">
                      {gameState.rumors.map((rumor, index) => (
                        <div key={index} className="rumor-item">
                          <p>{rumor.content}</p>
                          <div className="rumor-source">— {rumor.origin}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No rumors in town currently.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Status bar */}
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
        </div>
      </div>

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="modal-backdrop" onClick={() => setShowInventoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {activeAction === 'plant' ? 'Select Seeds to Plant' : 
                 activeAction === 'harvest' ? 'Harvest Plant' : 
                 'Your Inventory'}
              </h2>
              <button className="close-button" onClick={() => setShowInventoryModal(false)}>×</button>
            </div>

            <div className="filter-bar">
              <button 
                className={`filter-button ${itemFilter === null ? 'active' : ''}`}
                onClick={() => setItemFilter(null)}
              >
                All
              </button>
              <button 
                className={`filter-button ${itemFilter === 'seed' ? 'active' : ''}`}
                onClick={() => setItemFilter('seed')}
              >
                Seeds
              </button>
              <button 
                className={`filter-button ${itemFilter === 'herb' ? 'active' : ''}`}
                onClick={() => setItemFilter('herb')}
              >
                Herbs
              </button>
              <button 
                className={`filter-button ${itemFilter === 'crystal' ? 'active' : ''}`}
                onClick={() => setItemFilter('crystal')}
              >
                Crystals
              </button>
              <button 
                className={`filter-button ${itemFilter === 'tool' ? 'active' : ''}`}
                onClick={() => setItemFilter('tool')}
              >
                Tools
              </button>
            </div>

            {currentPlayer.inventory.length > 0 ? (
              <div className="inventory-grid">
                {currentPlayer.inventory
                  .filter(item => itemFilter === null || item.category === itemFilter || item.type === itemFilter)
                  .map((item, index) => (
                    <div 
                      key={index} 
                      className={`inventory-item ${item.category} ${selectedItem === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedItem(item.id)}
                    >
                      <div className="item-icon"></div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-details">
                        {item.type === 'ingredient' && `Quality: ${item.quality}`}
                      </div>
                      <div className="item-quantity">x{item.quantity}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="no-items">
                <p>Your inventory is empty.</p>
                {activeAction === 'plant' && (
                  <p>Visit the market to purchase seeds for planting.</p>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="action-button cancel-button"
                onClick={() => {
                  setShowInventoryModal(false);
                  setSelectedItem(null);
                  setActiveAction(null);
                }}
              >
                Cancel
              </button>
              
              {activeAction === 'plant' && selectedPlot !== null && (
                <button 
                  className="action-button confirm-button"
                  disabled={selectedItem === null}
                  onClick={() => {
                    if (selectedItem) {
                      plantSeed(selectedPlot, selectedItem);
                    }
                  }}
                >
                  Plant Seed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleApp;