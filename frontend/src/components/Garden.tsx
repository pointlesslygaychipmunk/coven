import React, { useState, useEffect } from 'react';
import './Garden.css';
import GardenPlot from './GardenPlot';
// Import the TarotCard type and remove puzzle import
import { 
  InventoryItem, 
  GardenSlot, 
  Season, 
  WeatherFate, 
  TarotCard, 
  ElementType 
} from 'coven-shared';
// Import helper functions for tarot cards
import { 
  findCardById, 
  getCardsBySeason, 
  getCardsByElement 
} from 'coven-shared';
import {
  getWeatherInfo,
  getSeasonInfo,
  getMoonPhaseInfo,
  calculateManaGeneration,
  adaptPlantForDisplay
} from '../utils';

interface GardenProps {
  plots: GardenSlot[];
  inventory: InventoryItem[];
  playerMana: number;
  playerMaxMana: number;
  
  // Garden actions
  onPlant: (slotId: number, seedInventoryItemId: string) => void;
  onHarvest: (slotId: number) => void;
  onWater: (slotId: number, elementalBoost?: ElementType) => void;
  onCrossBreed?: (cardId1: string, cardId2: string) => void;
  
  // Mana system
  onCollectMana: (amount: number) => void;
  totalManaGeneration: number; // Mana generated per turn by all trees
  
  // Environment
  weatherFate: WeatherFate;
  season: Season;
  moonPhase: string;
  dayTime: 'dawn' | 'day' | 'dusk' | 'night';
}

const Garden: React.FC<GardenProps> = ({
  plots,
  inventory,
  playerMana,
  playerMaxMana,
  onPlant,
  onHarvest,
  onWater,
  onCrossBreed,
  onCollectMana,
  totalManaGeneration,
  weatherFate = 'normal',
  season = 'Spring',
  moonPhase = 'Full Moon',
  dayTime = 'day'
}) => {
  // State for plot and card selection
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null);
  
  // State for tarot card interactions
  const [selectedTarotCard, setSelectedTarotCard] = useState<TarotCard | null>(null);
  const [cardPreview, setCardPreview] = useState<boolean>(false);
  const [cardRotation, setCardRotation] = useState<number>(0);
  
  // State for garden mana flow visualization
  const [manaFlowAnimation, setManaFlowAnimation] = useState<boolean>(false);
  const [manaAvailable, setManaAvailable] = useState<number>(0);
  const [manaAnimationActive, setManaAnimationActive] = useState<boolean>(false);
  
  // State for garden ambience and tips
  const [showWhisper, setShowWhisper] = useState<string | null>(null);
  const [gardenTip, setGardenTip] = useState<string>('');
  const [showEastEgg, setShowEastEgg] = useState<boolean>(false);
  
  // State for element interactions
  const [activeElement, setActiveElement] = useState<ElementType>('Earth');

  // Garden whispers (tips that appear randomly)
  const gardenWhispers = React.useMemo(() => [
    "Trees that resonate with the current moon phase generate more mana...",
    "Cards of the same element planted together create harmony in the garden...",
    "The soul of a card reveals itself when aligned with its favored season...",
    "A garden balanced with all elements will nurture even the rarest cards...",
    "Listen to the whispers of your cards to understand their needs...",
    "Trees draw their essence from deep within the earth and sky...",
    "Cards harvested during their aligned moon phase contain more potent essence...",
    "Patience allows a card's true nature to unfold over time...",
    "The soil remembers which elements have blessed it before...",
    "Trees and herbs form natural harmonies when their elements complement each other.",
    "Some cards reveal secret properties when planted beside their companion cards...",
    "Cards with Fire essence thrive when planted near cards with Spirit essence...",
    "A garden rich in mana attracts more beneficial cosmic influences..."
  ], []);

  // Hanbang Gardening Tips (for Easter Egg)
  const hanbangTips = [
    "Ginseng thrives in shaded, moist soil. Patience yields potency.",
    "Mugwort prefers sunlight and aids circulation when brewed.",
    "Licorice root harmonizes other herbs and soothes the skin.",
    "Angelica root is warming and promotes vitality, especially in colder months.",
    "Peony root is valued for its calming and brightening properties."
  ];

  // Show random garden whisper/tip periodically
  useEffect(() => {
    const randomTip = gardenWhispers[Math.floor(Math.random() * gardenWhispers.length)];
    setGardenTip(randomTip); // Set initial tip

    const whisperInterval = setInterval(() => {
      if (Math.random() < 0.25 && !showWhisper && !cardPreview) {
        const randomWhisper = gardenWhispers[Math.floor(Math.random() * gardenWhispers.length)];
        setShowWhisper(randomWhisper);
        setTimeout(() => setShowWhisper(null), 7000);
      }
    }, 30000);

    return () => clearInterval(whisperInterval);
  }, [showWhisper, cardPreview, gardenWhispers]);

  // Effect to calculate mana available from trees
  useEffect(() => {
    // Calculate total mana available from tree cards in garden
    const totalMana = plots.reduce((total, plot) => {
      // Skip empty plots or non-tree plants
      if (!plot.plant || !plot.plant.tarotCardId) return total;
      
      // Find the tarot card definition for this plant
      const card = findCardById(plot.plant.tarotCardId);
      if (!card) return total;
      
      // Use utility function to calculate mana generation
      const plantMana = calculateManaGeneration(card, plot.plant, moonPhase, season);
      
      return total + plantMana;
    }, 0);
    
    setManaAvailable(totalMana);
  }, [plots, moonPhase, season]);

  // Get available planting cards from inventory
  const getPlantableCards = (): InventoryItem[] => {
    return inventory.filter(item => 
      // Include seeds and tree saplings
      (item.type === 'seed' || item.type === 'tree') && 
      item.quantity > 0 && 
      !item.inUse
    );
  };

  // Get tarot card details for an inventory item
  const getTarotCardForItem = (inventoryItem: InventoryItem): TarotCard | null => {
    if (!inventoryItem.tarotCardId) return null;
    return findCardById(inventoryItem.tarotCardId) || null;
  };

  // Get selected plot details
  const getSelectedPlot = (): GardenSlot | undefined => {
    if (selectedPlotId === null) return undefined;
    return plots.find(plot => plot.id === selectedPlotId);
  };

  // Handle plot click
  const handlePlotClick = (plotId: number) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !plot.isUnlocked) return;
    
    // If clicking the same plot, toggle selection
    if (selectedPlotId === plotId) {
      setSelectedPlotId(null);
      
      // If plot has a tree that produces mana, show mana collection animation
      if (plot.plant?.manaProduced && plot.plant.manaProduced > 0) {
        setManaAnimationActive(true);
        setTimeout(() => {
          // Collect the mana
          onCollectMana(plot.currentMana);
          // Reset mana in the plot
          setManaAnimationActive(false);
        }, 1500);
      }
    } else {
      setSelectedPlotId(plotId);
      // Clear card selection when selecting a new plot
      setSelectedCardId(null);
      setSelectedInventoryItemId(null);
      setSelectedTarotCard(null);
    }
  };
  
  // Handle card selection from inventory
  const handleCardSelect = (inventoryItemId: string) => {
    const item = inventory.find(i => i.id === inventoryItemId);
    if (!item) return;
    
    setSelectedInventoryItemId(inventoryItemId);
    
    // Get and set the tarot card data
    if (item.tarotCardId) {
      const card = findCardById(item.tarotCardId);
      if (card) {
        setSelectedTarotCard(card);
        setSelectedCardId(card.id);
        // Reveal the card with an animation
        setCardPreview(true);
        setCardRotation(Math.random() * 10 - 5); // Slight random rotation for visual interest
      }
    }
  };

  // Handle planting the selected tarot card
  const handlePlant = () => {
    const selectedPlot = getSelectedPlot();
    if (!selectedPlot || selectedPlot.plant || selectedPlotId === null || !selectedInventoryItemId) {
      return;
    }
    
    // Create a planting animation
    const selectedItem = inventory.find(i => i.id === selectedInventoryItemId);
    if (selectedItem && selectedItem.tarotCardId) {
      const card = findCardById(selectedItem.tarotCardId);
      
      // Show card rising from inventory to plot location
      setCardPreview(true);
      
      // After animation, plant the card
      setTimeout(() => {
        onPlant(selectedPlotId, selectedInventoryItemId);
        
        // Show elemental effect based on card's element
        if (card) {
          setActiveElement(card.element);
          
          // Extra effects for tree planting
          if (card.type === 'tree') {
            setManaFlowAnimation(true);
            setTimeout(() => setManaFlowAnimation(false), 3000);
          }
        }
        
        // Clear the selection after planting
        setCardPreview(false);
        setSelectedInventoryItemId(null);
        setSelectedCardId(null);
        setSelectedTarotCard(null);
        setSelectedPlotId(null);
      }, 800);
    } else {
      // Fallback for legacy items without tarot cards
      onPlant(selectedPlotId, selectedInventoryItemId);
      setSelectedInventoryItemId(null);
    }
  };

  // Handle harvesting from the selected plot
  const handleHarvest = () => {
    const plot = getSelectedPlot();
    if (plot?.plant?.mature) {
      onHarvest(plot.id);
      setSelectedPlotId(null);
    }
  };
  
  // Handle collecting mana from tree cards
  const handleCollectMana = () => {
    // Get all plots with mature trees
    const treePlots = plots.filter(plot => {
      if (!plot.plant || !plot.plant.tarotCardId) return false;
      
      const card = findCardById(plot.plant.tarotCardId);
      return card?.type === 'tree' && plot.plant.mature && plot.currentMana > 0;
    });
    
    if (treePlots.length === 0) return;
    
    // Activate mana collection animation
    setManaAnimationActive(true);
    
    // Calculate total mana to collect
    const totalMana = treePlots.reduce((sum, plot) => sum + plot.currentMana, 0);
    
    // After animation completes, collect the mana
    setTimeout(() => {
      onCollectMana(totalMana);
      setManaAnimationActive(false);
    }, 1500);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedInventoryItemId(null);
    setSelectedCardId(null);
    setSelectedTarotCard(null);
    setCardPreview(false);
  };

  // Handle elemental attunement for all plants
  const handleElementalAttunement = (element: ElementType) => {
    // Apply elemental effect to all plots
    setActiveElement(element);
    
    // Show animation
    setManaFlowAnimation(true);
    setTimeout(() => setManaFlowAnimation(false), 1500);
    
    // Get all plots with plants that match this element
    const matchingPlots = plots.filter(plot => {
      if (!plot.plant || !plot.plant.tarotCardId) return false;
      
      const card = findCardById(plot.plant.tarotCardId);
      return card?.element === element;
    });
    
    // Water each matching plot with an elemental boost
    matchingPlots.forEach(plot => {
      onWater(plot.id, element);
    });
    
    // Show appropriate message
    if (matchingPlots.length > 0) {
      setShowWhisper(`${element} energy resonates with ${matchingPlots.length} plants in your garden...`);
    } else {
      setShowWhisper(`${element} energy flows through your garden, but no plants respond...`);
    }
    setTimeout(() => setShowWhisper(null), 5000);
  };
  
  // Handle collecting mana from all trees at once
  const handleManaHarvest = () => {
    if (manaAvailable <= 0) {
      setShowWhisper("No mana available to collect from your trees...");
      setTimeout(() => setShowWhisper(null), 3000);
      return;
    }
    
    // Activate mana collection animation
    setManaAnimationActive(true);
    
    // After animation completes, collect the mana
    setTimeout(() => {
      onCollectMana(manaAvailable);
      setManaAnimationActive(false);
      setShowWhisper(`Collected ${Math.round(manaAvailable)} mana from your trees!`);
      setTimeout(() => setShowWhisper(null), 3000);
    }, 1500);
  };

  // Easter Egg: Handle secret spot click
  const handleSecretSpotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEastEgg(true);
    const randomHanbangTip = hanbangTips[Math.floor(Math.random() * hanbangTips.length)];
    setShowWhisper(`Hanbang Secret: ${randomHanbangTip}`);
    setTimeout(() => {
      setShowWhisper(prev => prev === `Hanbang Secret: ${randomHanbangTip}` ? null : prev);
      setShowEastEgg(false);
    }, 9000);
  };

  // Render garden plots in a grid
  const renderPlots = () => {
    return Array.from({ length: 9 }).map((_, i) => {
      const plot = plots.find(p => p.id === i);
      if (plot) {
        return (
          <GardenPlot
            key={plot.id}
            plot={plot}
            selected={selectedPlotId === plot.id}
            onClick={() => handlePlotClick(plot.id)}
            season={season}
          />
        );
      } else {
        return (
          <div key={`placeholder-${i}`} className="garden-plot placeholder locked">
            <div className="locked-overlay"><div className="lock-icon">🔒</div></div>
          </div>
        );
      }
    });
  };

  // Render weather indicator
  const renderWeatherIndicator = () => {
    const { icon, label } = getWeatherInfo(weatherFate);
    return (
      <div className="weather-indicator">
        <div className="weather-icon">{icon}</div>
        <div className="weather-label">{label}</div>
      </div>
    );
  };

  // Render season indicator
  const renderSeasonIndicator = () => {
    const { icon, className } = getSeasonInfo(season);
    return (
      <div className={`season-indicator ${className}`}>
        <div className="season-icon">{icon}</div>
        <div className="season-label">{season}</div>
      </div>
    );
  };

  // Render plot details panel
  const renderPlotDetails = () => {
    const selectedPlot = getSelectedPlot();

    // Default view when no plot is selected
    if (!selectedPlot) {
      return (
        <div className="plot-details">
          <div className="scroll-header">
            <div className="scroll-ornament left"></div>
            <h3>Plot Details</h3>
            <div className="scroll-ornament right"></div>
          </div>
          <div className="parchment-content">
            <p>Select a garden plot to view details.</p>
            <p className="garden-tip">{gardenTip}</p>
            <div className="parchment-filler"></div>
          </div>
        </div>
      );
    }

    // Locked plot view
    if (selectedPlot.isUnlocked === false) {
      return (
        <div className="plot-details">
          <div className="scroll-header">
            <div className="scroll-ornament left"></div>
            <h3>Plot {selectedPlot.id + 1}</h3>
            <div className="scroll-ornament right"></div>
          </div>
          <div className="parchment-content">
            <p>This plot is currently locked. Expand your garden through rituals or achievements.</p>
            <div className="lock-icon locked-plot-icon"></div>
            <div className="parchment-filler"></div>
          </div>
        </div>
      );
    }

    // Details for unlocked plot
    const originalPlant = selectedPlot.plant;
    const plant = adaptPlantForDisplay(originalPlant);
    const growthPercent = plant?.growth !== undefined && plant.maxGrowth
                        ? Math.min(100, Math.max(0, (plant.growth / plant.maxGrowth) * 100))
                        : 0;

    return (
      <div className="plot-details">
        <div className="scroll-header">
          <div className="scroll-ornament left"></div>
          <h3>Plot {selectedPlot.id + 1}</h3>
          <div className="scroll-ornament right"></div>
        </div>
        <div className="parchment-content">
          <div className="plot-stats">
            <div className="plot-stat">
              <div className="stat-label">
                <span>Fertility</span>
                <span>{selectedPlot.fertility || 0}%</span>
              </div>
              <div className="stat-bar">
                <div className="stat-fill fertility" style={{ width: `${selectedPlot.fertility || 0}%` }} />
              </div>
            </div>
            <div className="plot-stat">
              <div className="stat-label">
                <span>Moisture</span>
                <span>{selectedPlot.moisture || 0}%</span>
              </div>
              <div className="stat-bar">
                <div className="stat-fill moisture" style={{ width: `${selectedPlot.moisture || 0}%` }} />
              </div>
            </div>
          </div>

          {plant ? (
            <div className="plant-info">
              <h4>{plant.name}</h4>
              <div className="plant-progress">
                <div className="progress-label">
                  <span>Growth</span>
                  <span>{growthPercent.toFixed(0)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${growthPercent}%` }} />
                </div>
              </div>
              <div className="plant-stats">
                <div className="plant-stat">
                  <div className="stat-label">Health</div>
                  <div className="stat-value">{plant.health?.toFixed(0) ?? '?'}%</div>
                </div>
                <div className="plant-stat">
                  <div className="stat-label">Age</div>
                  <div className="stat-value">{plant.age ?? '?'} {plant.age === 1 ? 'phase' : 'phases'}</div>
                </div>
              </div>
              {plant.moonBlessed && <div className="plant-blessing">✧ Moon Blessed ✧</div>}
              {plant.seasonalModifier && plant.seasonalModifier !== 1.0 && (
                <div className="plant-season">
                  {plant.seasonalModifier > 1 ? 
                    <span className="boost">Thriving (+{Math.round((plant.seasonalModifier - 1) * 100)}%)</span> : 
                    <span className="penalty">Struggling (-{Math.round((1 - plant.seasonalModifier) * 100)}%)</span>
                  }
                </div>
              )}
              {plant.mature ? (
                <button className="action-button harvest" onClick={handleHarvest}>
                  <span>Harvest</span>
                </button>
              ) : (
                <div className="plant-status">Growing...</div>
              )}
            </div>
          ) : (
            <div className="empty-plot-status">
              <p>This plot is empty.</p>
            </div>
          )}
          
          <div className="garden-actions">
            <button
              className="action-button view-elements"
              onClick={() => document.querySelector('.elemental-controls')?.classList.toggle('visible')}
            >
              <span>Elemental Attunement</span>
            </button>
            
            <button
              className="action-button cross-breed"
              onClick={() => onCrossBreed && onCrossBreed()}
            >
              <span>Cross-Breed Plants</span>
            </button>
          </div>
          <div className="parchment-filler"></div>
        </div>
      </div>
    );
  };

  // Render tarot card collection panel
  const renderTarotCardCollection = () => {
    const plantableCards = getPlantableCards();
    const selectedPlot = getSelectedPlot();
    const canPlant = selectedPlot && !selectedPlot.plant && selectedPlot.isUnlocked;

    return (
      <div className="inventory-panel">
        <div className="scroll-header">
          <div className="scroll-ornament left"></div>
          <h3>Tarot Cards</h3>
          <div className="scroll-ornament right"></div>
        </div>
        <div className="parchment-content">
          {/* Fixed card action buttons - always visible */}
          <div className="card-actions fixed-actions">
            <button
              className={`action-button plant ${!canPlant || !selectedInventoryItemId ? 'disabled' : ''}`}
              disabled={!canPlant || !selectedInventoryItemId}
              onClick={handlePlant}
            >
              <span>Plant Card</span>
            </button>
            <button
              className={`action-button clear ${!selectedInventoryItemId ? 'disabled' : ''}`}
              disabled={!selectedInventoryItemId}
              onClick={handleClearSelection}
            >
              <span>Clear</span>
            </button>
          </div>
          
          {plantableCards.length === 0 ? (
            <p>You have no cards to plant!</p>
          ) : (
            <>
              <div className="tarot-cards-list">
                {plantableCards.map(item => {
                  const card = getTarotCardForItem(item);
                  return (
                    <div
                      key={item.id}
                      className={`tarot-card-item ${selectedInventoryItemId === item.id ? 'selected' : ''} element-${card?.element?.toLowerCase() || 'unknown'}`}
                      onClick={() => handleCardSelect(item.id)}
                    >
                      <div className="card-miniature" data-element={card?.element || 'unknown'}>
                        <div className="card-frame">
                          <span className="card-name">{item.name}</span>
                        </div>
                      </div>
                      <div className="card-info">
                        <div className="card-type">
                          {card?.type === 'tree' ? '🌳' : '🌱'}
                        </div>
                        <div className="card-quantity">x{item.quantity}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Card details if selected */}
              {selectedTarotCard && (
                <div className="selected-card-details">
                  <h4>{selectedTarotCard.name}</h4>
                  <p className="card-description">{selectedTarotCard.description}</p>
                  <div className="card-properties">
                    <div><strong>Element:</strong> {selectedTarotCard.element}</div>
                    <div><strong>Moon:</strong> {selectedTarotCard.moonPhaseAffinity}</div>
                    <div><strong>Season:</strong> {selectedTarotCard.seasonAffinity}</div>
                    {selectedTarotCard.manaGeneration && (
                      <div><strong>Mana:</strong> {selectedTarotCard.manaGeneration} per day</div>
                    )}
                  </div>
                </div>
              )}
              
              <p className="garden-tip">{gardenTip}</p>
              <div className="parchment-filler"></div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`garden-container ${season.toLowerCase()}`}>
      <div className="garden-frame">
        <div className="garden-header">
          <div className="scroll-ornament left"></div>
          <h2>Witch's Garden</h2>
          <div className="scroll-ornament right"></div>
          <div className="garden-indicators">
            {renderWeatherIndicator()}
            {renderSeasonIndicator()}
          </div>
        </div>

        <div className="garden-content">
          <div className="garden-grid">
            <div className="grid-background"></div>
            {renderPlots()}
            {/* Easter Egg Click Spot */}
            <div 
              className="garden-secret-spot" 
              onClick={handleSecretSpotClick}
            />
          </div>

          <div className="garden-sidebar">
            {renderPlotDetails()}
            {renderTarotCardCollection()}
            <div className="sidebar-decorations">
              <div className="corner-decoration top-left"></div>
              <div className="corner-decoration top-right"></div>
              <div className="corner-decoration bottom-left"></div>
              <div className="corner-decoration bottom-right"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating garden whisper */}
      {showWhisper && <div className="garden-whisper">{showWhisper}</div>}

      {/* Mana flow animation overlay */}
      {manaFlowAnimation && <div className="mana-flow-overlay" />}

      {/* Mana collection animation */}
      {manaAnimationActive && <div className="mana-collection-overlay" />}

      {/* East egg animation */}
      {showEastEgg && <div className="east-egg-overlay" />}
      
      {/* Card Preview Panel */}
      {cardPreview && selectedTarotCard && (
        <div className="tarot-card-preview" 
             style={{transform: `rotate(${cardRotation}deg)`}}
             onClick={() => setCardPreview(false)}>
          <div className="tarot-card-inner">
            <div className="tarot-card-frame" data-element={selectedTarotCard.element}>
              <div className="tarot-card-image" 
                   style={{backgroundImage: `url(${selectedTarotCard.artworkPath || '/assets/cards/placeholder.png'})`}}>
              </div>
              <div className="tarot-card-name">{selectedTarotCard.name}</div>
              <div className="tarot-card-rank">Rank {selectedTarotCard.rank}</div>
              <div className="tarot-card-element">{selectedTarotCard.element}</div>
              <div className="tarot-card-affinity">
                <span className="moon">{selectedTarotCard.moonPhaseAffinity}</span>
                <span className="season">{selectedTarotCard.seasonAffinity}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Elemental Attunement Panel */}
      <div className="elemental-controls">
        <button className="element-button earth" onClick={() => handleElementalAttunement('Earth')}>Earth</button>
        <button className="element-button water" onClick={() => handleElementalAttunement('Water')}>Water</button>
        <button className="element-button fire" onClick={() => handleElementalAttunement('Fire')}>Fire</button>
        <button className="element-button air" onClick={() => handleElementalAttunement('Air')}>Air</button>
        <button className="element-button spirit" onClick={() => handleElementalAttunement('Spirit')}>Spirit</button>
        
        <button className="mana-harvest-button" 
                onClick={handleManaHarvest} 
                disabled={manaAvailable <= 0}>
          Harvest Mana ({Math.round(manaAvailable)})
        </button>
      </div>
    </div>
  );
};

export default Garden;