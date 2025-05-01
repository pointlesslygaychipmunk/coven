import React, { useState, useEffect } from 'react';
import './Garden.css';
import GardenPlot from './GardenPlot';
import SeasonalAttunementPuzzle from './SeasonalAttunementPuzzle';
import { InventoryItem, GardenSlot, Season, WeatherFate } from 'coven-shared';

interface GardenProps {
  plots: GardenSlot[];
  inventory: InventoryItem[];
  onPlant: (slotId: number, seedInventoryItemId: string) => void;
  onHarvest: (slotId: number) => void;
  onWater: (puzzleBonus: number) => void;
  weatherFate: WeatherFate;
  season: Season;
}

const Garden: React.FC<GardenProps> = ({
  plots,
  inventory,
  onPlant,
  onHarvest,
  onWater,
  weatherFate = 'normal',
  season = 'Spring'
}) => {
  // State for plot and seed selection
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [selectedSeedId, setSelectedSeedId] = useState<string | null>(null);
  
  // State for UI elements and animations
  const [attunementAnimation, setAttunementAnimation] = useState<boolean>(false);
  const [showWhisper, setShowWhisper] = useState<string | null>(null);
  const [gardenTip, setGardenTip] = useState<string>('');
  const [showAttunementPuzzle, setShowAttunementPuzzle] = useState<boolean>(false);

  // Garden whispers (tips that appear randomly)
  const gardenWhispers = [
    "The moon blesses plants harvested under its full glow...",
    "A plant's quality reflects its care and the soil it grows in...",
    "Some herbs thrive in unexpected seasons...",
    "Balance the elements to nurture your garden's spirit...",
    "Plants whisper their needs, if you listen closely...",
    "Each plant has a season where it thrives most brilliantly...",
    "Moonbuds prefer the gentle light of evening skies...",
    "Patience is the greatest virtue of a garden witch...",
    "Harmonizing with the season unlocks potent growth.",
    "Even failed experiments can yield useful compost."
  ];

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
      if (Math.random() < 0.25 && !showWhisper && !showAttunementPuzzle) {
        const randomWhisper = gardenWhispers[Math.floor(Math.random() * gardenWhispers.length)];
        setShowWhisper(randomWhisper);
        setTimeout(() => setShowWhisper(null), 7000);
      }
    }, 30000);

    return () => clearInterval(whisperInterval);
  }, [showWhisper, showAttunementPuzzle]);

  // Get available seeds from inventory
  const getAvailableSeeds = (): InventoryItem[] => {
    return inventory.filter(item => item.type === 'seed' && item.quantity > 0);
  };

  // Get selected plot details
  const getSelectedPlot = (): GardenSlot | undefined => {
    if (selectedPlotId === null) return undefined;
    return plots.find(plot => plot.id === selectedPlotId);
  };

  // Handle plot click
  const handlePlotClick = (plotId: number) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.isUnlocked === false) return;

    if (selectedPlotId === plotId) {
      setSelectedPlotId(null);
    } else {
      setSelectedPlotId(plotId);
    }
  };

  // Handle seed selection from inventory
  const handleSeedSelect = (seedId: string) => {
    setSelectedSeedId(seedId === selectedSeedId ? null : seedId);
  };

  // Handle planting the selected seed
  const handlePlant = () => {
    const selectedPlot = getSelectedPlot();
    if (!selectedPlot || selectedPlot.plant || selectedPlotId === null || !selectedSeedId) {
      return;
    }
    
    onPlant(selectedPlotId, selectedSeedId);
    setSelectedSeedId(null);
  };

  // Handle harvesting from the selected plot
  const handleHarvest = () => {
    const plot = getSelectedPlot();
    if (plot?.plant?.mature) {
      onHarvest(plot.id);
      setSelectedPlotId(null);
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedSeedId(null);
  };

  // Start the seasonal attunement puzzle
  const handleStartAttunement = () => {
    if(showAttunementPuzzle) return;
    setShowAttunementPuzzle(true);
  };

  // Handle when attunement puzzle completes
  const handlePuzzleComplete = (result: { success: boolean; bonus: number; message: string }) => {
    setShowAttunementPuzzle(false);
    setShowWhisper(result.message);
    setTimeout(() => setShowWhisper(null), 5000);

    if (result.success) {
      setAttunementAnimation(true);
      onWater(result.bonus);
      setTimeout(() => setAttunementAnimation(false), 1500);
    } else {
      onWater(0);
    }
  };

  // Handle skipping the puzzle
  const handleSkipPuzzle = () => {
    setShowAttunementPuzzle(false);
    setShowWhisper("Skipped attunement. Energies remain unchanged.");
    setTimeout(() => setShowWhisper(null), 5000);
    onWater(0);
  };

  // Easter Egg: Handle secret spot click
  const handleSecretSpotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const randomHanbangTip = hanbangTips[Math.floor(Math.random() * hanbangTips.length)];
    setShowWhisper(`Hanbang Secret: ${randomHanbangTip}`);
    setTimeout(() => {
      setShowWhisper(prev => prev === `Hanbang Secret: ${randomHanbangTip}` ? null : prev);
    }, 9000);
  };

  // Render garden plots in a grid (3x3)
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
    let icon: string;
    let label: string = weatherFate.charAt(0).toUpperCase() + weatherFate.slice(1);

    switch (weatherFate) {
      case 'rainy': icon = '🌧️'; break;
      case 'dry': icon = '☀️'; break;
      case 'foggy': icon = '🌫️'; break;
      case 'windy': icon = '💨'; break;
      case 'stormy': icon = '⛈️'; break;
      case 'normal': default: icon = '🌤️'; label = 'Clear'; break;
    }
    return (
      <div className="weather-indicator" title={`Weather: ${label}`}>
        <div className="weather-icon">{icon}</div>
        <div className="weather-label">{label}</div>
      </div>
    );
  };

  // Render season indicator
  const renderSeasonIndicator = () => {
    let icon: string;
    switch (season) {
      case 'Spring': icon = '🌱'; break;
      case 'Summer': icon = '☀️'; break;
      case 'Fall': icon = '🍂'; break;
      case 'Winter': icon = '❄️'; break;
      default: icon = '❔';
    }
    return (
      <div className="season-indicator" title={`Season: ${season}`}>
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
          <h3>Plot Details</h3>
          <p>Select a garden plot to view details.</p>
          <p className="garden-tip">{gardenTip}</p>
        </div>
      );
    }

    // Locked plot view
    if (selectedPlot.isUnlocked === false) {
      return (
        <div className="plot-details">
          <h3>Plot {selectedPlot.id + 1}</h3>
          <p>This plot is currently locked. Expand your garden through rituals or achievements.</p>
          <div className="lock-icon" style={{fontSize: '40px', margin: '20px auto', textAlign: 'center'}}>🔒</div>
        </div>
      );
    }

    // Details for unlocked plot
    const plant = selectedPlot.plant;
    const growthPercent = plant?.growth !== undefined && plant.maxGrowth
                        ? Math.min(100, Math.max(0, (plant.growth / plant.maxGrowth) * 100))
                        : 0;

    return (
      <div className="plot-details">
        <h3>Plot {selectedPlot.id + 1} Details</h3>
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
              <div className="plant-stat">
                <div className="stat-label">Watered</div>
                <div className="stat-value">{selectedPlot.moisture > 40 ? 'Yes' : 'No'}</div>
              </div>
            </div>
            {plant.moonBlessed && <div className="plant-blessing"><span className="moon-icon">🌙</span> Moon Blessed</div>}
            {plant.seasonalModifier && plant.seasonalModifier !== 1.0 && (
              <div className="plant-season">
                {plant.seasonalModifier > 1 ? 
                  <span className="boost">Thriving (+{Math.round((plant.seasonalModifier - 1) * 100)}%)</span> : 
                  <span className="penalty">Struggling (-{Math.round((1 - plant.seasonalModifier) * 100)}%)</span>
                }
              </div>
            )}
            {plant.mature ? (
              <button className="action-button harvest" onClick={handleHarvest}>Harvest {plant.name}</button>
            ) : (
              <div className="plant-status">Growing...</div>
            )}
          </div>
        ) : (
          <div className="empty-plot-status">
            <p>This plot is empty.</p>
          </div>
        )}
        
        {/* Garden Attune Button */}
        <div className="garden-actions">
          <button
            className="garden-action-button"
            onClick={handleStartAttunement}
            disabled={showAttunementPuzzle}
          >
            <span className="button-icon">🌿</span> Attune Garden Energies
          </button>
        </div>
      </div>
    );
  };

  // Render seed pouch panel
  const renderSeedPouch = () => {
    const seeds = getAvailableSeeds();
    const selectedPlot = getSelectedPlot();
    const canPlant = selectedPlot && !selectedPlot.plant && selectedPlot.isUnlocked !== false;

    return (
      <div className="inventory-panel">
        <h3>Seed Pouch</h3>
        
        {seeds.length === 0 ? (
          <p>Your seed pouch is empty!</p>
        ) : (
          <>
            <div className="seed-list">
              {seeds.map(seed => (
                <div
                  key={seed.id}
                  className={`seed-item ${selectedSeedId === seed.id ? 'selected' : ''}`}
                  onClick={() => handleSeedSelect(seed.id)}
                  title={`${seed.name} (Qty: ${seed.quantity})`}
                >
                  <div className="seed-image">
                    <div className="seed-placeholder">{seed.name.charAt(0).toUpperCase()}</div>
                  </div>
                  <div className="seed-quantity-badge">{seed.quantity}</div>
                </div>
              ))}
            </div>
            
            {/* Always present static action buttons in the correct order */}
            <div className="seed-actions">
              <button
                className={`action-button plant ${!canPlant || !selectedSeedId ? 'disabled' : ''}`}
                disabled={!canPlant || !selectedSeedId}
                onClick={canPlant && selectedSeedId ? handlePlant : undefined}
              >
                Plant Selected Seed
              </button>
              <button
                className={`action-button clear ${!selectedSeedId ? 'disabled' : ''}`}
                disabled={!selectedSeedId}
                onClick={selectedSeedId ? handleClearSelection : undefined}
              >
                Clear Selection
              </button>
            </div>
            
            <p className="garden-tip">{gardenTip}</p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="garden-container">
      <div className="garden-header">
        <h2>Witch's Garden</h2>
        <div className="garden-indicators">
          {renderWeatherIndicator()}
          {renderSeasonIndicator()}
        </div>
      </div>

      <div className="garden-content">
        <div className="garden-grid">
          {renderPlots()}
          {/* Easter Egg Click Spot */}
          <div 
            className="garden-secret-spot" 
            onClick={handleSecretSpotClick}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              zIndex: 5,
              opacity: 0.01, // Nearly invisible
            }}
          />
        </div>

        <div className="garden-sidebar">
          {renderPlotDetails()}
          {renderSeedPouch()}
        </div>
      </div>

      {/* Floating garden whisper */}
      {showWhisper && <div className="garden-whisper">{showWhisper}</div>}

      {/* Attunement animation overlay */}
      {attunementAnimation && <div className="attunement-overlay" />}

      {/* Seasonal Attunement Puzzle */}
      {showAttunementPuzzle && (
        <SeasonalAttunementPuzzle
          onComplete={handlePuzzleComplete}
          onSkip={handleSkipPuzzle}
          season={season}
        />
      )}
    </div>
  );
};

export default Garden;