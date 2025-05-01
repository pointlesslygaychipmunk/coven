import React, { useState, useEffect } from 'react';
import './Garden.css';
import GardenPlot from './GardenPlot';
import SeasonalAttunementPuzzle from './SeasonalAttunementPuzzle'; // Import the new puzzle
import { InventoryItem, GardenSlot, Season, WeatherFate } from 'coven-shared';

interface GardenProps {
  plots: GardenSlot[];
  inventory: InventoryItem[];
  onPlant: (slotId: number, seedInventoryItemId: string) => void;
  onHarvest: (slotId: number) => void;
  onWater: (puzzleBonus: number) => void; // MODIFIED: Expects puzzle bonus
  weatherFate: WeatherFate;
  season: Season;
}

const Garden: React.FC<GardenProps> = ({
  plots,
  inventory,
  onPlant,
  onHarvest,
  onWater, // Now expects puzzle bonus
  weatherFate = 'normal',
  season = 'Spring'
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [selectedSeedInventoryItemId, setSelectedSeedInventoryItemId] = useState<string | null>(null);
  const [attunementAnimation, setAttunementAnimation] = useState<boolean>(false); // Renamed state
  const [showWhisper, setShowWhisper] = useState<string | null>(null);
  const [gardenTip, setGardenTip] = useState<string>('');
  const [showAttunementPuzzle, setShowAttunementPuzzle] = useState<boolean>(false); // New state for puzzle

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
      if (Math.random() < 0.25 && !showWhisper && !showAttunementPuzzle) { // Don't show during puzzle
        const randomWhisper = gardenWhispers[Math.floor(Math.random() * gardenWhispers.length)];
        setShowWhisper(randomWhisper);
        setTimeout(() => setShowWhisper(null), 7000); // Shorter display
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(whisperInterval);
  }, [showWhisper, showAttunementPuzzle]); // Added dependencies

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
      setShowInventory(false);
      setSelectedSeedInventoryItemId(null);
    } else {
      setSelectedPlotId(plotId);
      setShowInventory(plot.plant === null); // Show inventory only if plot is empty
      setSelectedSeedInventoryItemId(null);
    }
  };

  // Handle seed selection from inventory
  const handleSeedSelect = (seedInventoryItemId: string) => {
    setSelectedSeedInventoryItemId(seedInventoryItemId);
  };

  // Handle planting the selected seed
  const handlePlant = () => {
    if (selectedPlotId !== null && selectedSeedInventoryItemId) {
      onPlant(selectedPlotId, selectedSeedInventoryItemId);
      setSelectedSeedInventoryItemId(null);
      setShowInventory(false);
      // Optional: Keep plot selected after planting? Deselecting for now.
      // setSelectedPlotId(null);
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

  // Start the seasonal attunement puzzle
  const handleStartAttunement = () => {
      if(showAttunementPuzzle) return; // Prevent opening multiple puzzles
      setShowAttunementPuzzle(true);
  };

  // Handle when attunement puzzle completes
  const handlePuzzleComplete = (result: { success: boolean; bonus: number; message: string }) => {
    setShowAttunementPuzzle(false);
    setShowWhisper(result.message); // Show the result message as a whisper
    setTimeout(() => setShowWhisper(null), 5000); // Clear whisper after 5s

    if (result.success) {
        setAttunementAnimation(true); // Trigger visual feedback
        // Call the onWater prop, passing the bonus score
        onWater(result.bonus);
        setTimeout(() => setAttunementAnimation(false), 1500); // Duration of animation
    } else {
        // Handle failure - maybe a different visual/sound cue?
        console.log("Attunement failed, no watering bonus applied.");
        // Still call onWater but with 0 bonus if failure should still trigger base watering
        onWater(0);
    }
  };

  // Handle skipping the puzzle (calls onWater with 0 bonus)
  const handleSkipPuzzle = () => {
    setShowAttunementPuzzle(false);
    setShowWhisper("Skipped attunement. Energies remain unchanged.");
    setTimeout(() => setShowWhisper(null), 5000);
    onWater(0); // Apply base watering without bonus
  };

   // Easter Egg: Handle secret spot click
   const handleSecretSpotClick = (e: React.MouseEvent) => {
       e.stopPropagation(); // Prevent plot selection
       const randomHanbangTip = hanbangTips[Math.floor(Math.random() * hanbangTips.length)];
       setShowWhisper(`Hanbang Secret: ${randomHanbangTip}`);
       // Hide after a while
       setTimeout(() => {
            // Only clear if this specific whisper is still showing
            setShowWhisper(prev => prev === `Hanbang Secret: ${randomHanbangTip}` ? null : prev);
       }, 9000);
   };


  // Render garden plots in a grid (3x3)
  const renderPlots = () => {
      // Assuming plots array always represents the potential 9 slots
      const gridPlots = Array.from({ length: 9 }).map((_, i) => {
          const plot = plots.find(p => p.id === i);
          if (plot) {
               return (
                   <GardenPlot
                       key={plot.id}
                       plot={plot}
                       selected={selectedPlotId === plot.id}
                       onClick={() => handlePlotClick(plot.id)}
                       season={season} // Pass season to plot
                   />
               );
          } else {
              // Render a locked placeholder if plot data doesn't exist for this index
               return (
                 <div key={`placeholder-${i}`} className={`garden-plot placeholder locked`}>
                   <div className="locked-overlay"><div className="lock-icon">🔒</div></div>
                 </div>
               );
          }
      });
      return gridPlots;
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
        <div className="plot-details empty">
          <div className="parchment-scroll">
            <div className="scroll-content">
              <p>Select a garden plot to view details or plant a seed.</p>
              <p className="garden-tip">{gardenTip}</p>
            </div>
          </div>
        </div>
      );
    }

    // Locked plot view
     if (selectedPlot.isUnlocked === false) {
         return (
             <div className="plot-details empty">
                 <div className="parchment-scroll">
                     <div className="scroll-content">
                         <h3>Plot {selectedPlot.id + 1}</h3>
                         <p>This plot is currently locked. Expand your garden through rituals or achievements.</p>
                         <div className="lock-icon" style={{fontSize: '40px', margin: '20px auto'}}>🔒</div>
                     </div>
                 </div>
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
        <div className="parchment-scroll">
          <div className="scroll-content">
            <h3>Plot {selectedPlot.id + 1} Details</h3>
            <div className="plot-stats">
              <div className="plot-stat">
                <div className="stat-label">Fertility</div>
                <div className="stat-bar"><div className="stat-fill fertility" style={{ width: `${selectedPlot.fertility || 0}%` }} /></div>
                <div className="stat-value">{selectedPlot.fertility || 0}%</div>
              </div>
              <div className="plot-stat">
                <div className="stat-label">Moisture</div>
                <div className="stat-bar"><div className="stat-fill moisture" style={{ width: `${selectedPlot.moisture || 0}%` }} /></div>
                <div className="stat-value">{selectedPlot.moisture || 0}%</div>
              </div>
              {/* Optional: Sunlight */}
            </div>

            {plant ? (
              <div className="plant-info">
                <h4>{plant.name}</h4>
                <div className="plant-progress">
                  <div className="progress-label">Growth</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${growthPercent}%` }} /></div>
                  <div className="progress-value">{growthPercent.toFixed(0)}%</div>
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
                {plant.moonBlessed && <div className="plant-blessing" title="Influenced by the moon"><span className="moon-icon">🌙</span> Moon Blessed</div>}
                {plant.seasonalModifier && plant.seasonalModifier !== 1.0 && (
                  <div className="plant-season">
                    {plant.seasonalModifier > 1 ? <span className="boost">Thriving (+{Math.round((plant.seasonalModifier - 1) * 100)}%)</span> : <span className="penalty">Struggling (-{Math.round((1 - plant.seasonalModifier) * 100)}%)</span>}
                  </div>
                )}
                {plant.mature ? (
                  <button className="action-button harvest" onClick={handleHarvest}>Harvest {plant.name}</button>
                ) : (
                  <div className="plant-status">Growing...</div>
                )}
              </div>
            ) : (
              <div className="empty-plot-actions">
                <p>This plot is empty.</p>
                <button className="action-button plant" onClick={() => setShowInventory(true)}>Plant Seed Here</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render inventory panel for seed selection
  const renderInventoryPanel = () => {
    const seeds = getAvailableSeeds();
    const selectedPlot = getSelectedPlot();

    // Don't render if no plot selected or plot is not empty/unlocked
    if (!selectedPlot || selectedPlot.plant || selectedPlot.isUnlocked === false) {
        if(showInventory) setShowInventory(false); // Automatically close if plot becomes invalid
        return null;
    }

    return (
      <div className="inventory-panel">
        <div className="parchment-scroll">
          <div className="scroll-content">
            <h3>Select Seed for Plot {selectedPlotId !== null ? selectedPlotId + 1 : ''}</h3>
            {seeds.length === 0 ? (
              <div className="inventory-panel empty">
                <p>Your seed pouch is empty!</p>
                <button className="close-button" onClick={() => setShowInventory(false)}>Close</button>
              </div>
            ) : (
              <>
                <div className="seed-list">
                  {seeds.map(seed => (
                    <div
                      key={seed.id}
                      className={`seed-item ${selectedSeedInventoryItemId === seed.id ? 'selected' : ''}`}
                      onClick={() => handleSeedSelect(seed.id)}
                      title={`Plant ${seed.name} (Qty: ${seed.quantity})`}
                    >
                      <div className="seed-image"><div className="seed-placeholder">{seed.name.charAt(0).toUpperCase()}</div></div>
                      <div className="seed-info">
                        <div className="seed-name">{seed.name}</div>
                        <div className="seed-quantity">Qty: {seed.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="seed-actions">
                  <button
                    className="action-button plant"
                    disabled={!selectedSeedInventoryItemId}
                    onClick={handlePlant}
                  >
                    Plant {inventory.find(s => s.id === selectedSeedInventoryItemId)?.name || 'Selected Seed'}
                  </button>
                  <button
                    className="close-button"
                    onClick={() => { setShowInventory(false); setSelectedSeedInventoryItemId(null); }}
                  >
                    Cancel Planting
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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
           <div className="garden-secret-spot" onClick={handleSecretSpotClick} title="Inspect closer..."></div>
        </div>

        <div className="garden-sidebar">
          {showInventory && selectedPlotId !== null ? renderInventoryPanel() : renderPlotDetails()}

          {/* General Garden Actions */}
          <div className="garden-actions">
            <button
              className="garden-action-button attune" // Changed class from water
              onClick={handleStartAttunement} // Changed handler
              title="Perform seasonal attunement puzzle"
              disabled={showAttunementPuzzle} // Disable while puzzle is open
            >
              <span className="button-icon">🌿</span> Attune Energies
            </button>
          </div>
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
          // Optional: Pass difficulty based on player level/skill?
          // difficulty={playerLevel > 5 ? 'medium' : 'easy'}
        />
      )}
    </div>
  );
};

export default Garden;