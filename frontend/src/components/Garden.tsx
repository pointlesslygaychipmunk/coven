import React, { useState } from 'react';
import './Garden.css';
import GardenPlot from './GardenPlot'; // Ensure GardenPlot uses shared types too
import { InventoryItem as Item, GardenPlot as GardenSlot, Season, WeatherFate } from 'coven-shared'; // Use shared types

interface GardenProps {
  plots: GardenSlot[];
  inventory: Item[]; // Use InventoryItem alias
  onPlant: (slotId: number, seedName: string) => void;
  onHarvest: (slotId: number) => void;
  onWater: () => void; // Changed from optional to required based on usage
  weatherFate: WeatherFate;
  season: Season;
}

const Garden: React.FC<GardenProps> = ({
  plots,
  inventory,
  onPlant,
  onHarvest,
  onWater, // Now required
  weatherFate = 'normal', // Default value
  season = 'Spring' // Default value
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [selectedSeedName, setSelectedSeedName] = useState<string | null>(null); // Store seed name

  // Get available seeds from inventory
  const getAvailableSeeds = (): Item[] => {
    return inventory.filter(item =>
      item.type === 'seed' && item.quantity > 0
    );
  };

  // Get selected plot details
  const getSelectedPlot = (): GardenSlot | undefined => {
    if (selectedPlotId === null) return undefined;
    return plots.find(plot => plot.id === selectedPlotId);
  };

  // Handle plot click
  const handlePlotClick = (plotId: number) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.isUnlocked === false) return; // Ignore clicks on locked plots

    if (selectedPlotId === plotId) {
      // Deselect if clicking the same plot again
      setSelectedPlotId(null);
      setShowInventory(false);
      setSelectedSeedName(null);
    } else {
      setSelectedPlotId(plotId);
      // If plot has mature plant or is occupied (but not mature), don't show seed inventory
      if (plot.plant) {
          setShowInventory(false);
          setSelectedSeedName(null);
      } else {
          // If plot is empty, show seed inventory
          setShowInventory(true);
          setSelectedSeedName(null); // Clear any previously selected seed
      }
    }
  };

  // Handle seed selection from inventory
  const handleSeedSelect = (seedName: string) => {
    setSelectedSeedName(seedName);
    // Keep inventory panel open after selection
  };

  // Handle planting the selected seed
  const handlePlant = () => {
    if (selectedPlotId !== null && selectedSeedName) {
      onPlant(selectedPlotId, selectedSeedName);
      // Reset state after planting attempt
      setSelectedSeedName(null);
      setShowInventory(false);
      // Keep the plot selected for viewing details maybe? Or deselect:
      // setSelectedPlotId(null);
    }
  };

  // Handle harvesting from the selected plot
  const handleHarvest = () => {
    const plot = getSelectedPlot();
    if (plot && plot.plant && plot.plant.mature) {
      onHarvest(plot.id);
      // Deselect plot after harvesting
      setSelectedPlotId(null);
    }
  };

  // Handle watering all plants
  const handleWaterAll = () => {
    // Call the prop function passed from App.tsx
    onWater();
    // Optionally add visual feedback or disable button temporarily
  };

  // Render garden plots in a grid (e.g., 3x3)
  const renderPlots = () => {
    const rows = [];
    const numCols = 3;
    const numRows = Math.ceil(plots.length / numCols);

    for (let r = 0; r < numRows; r++) {
      const rowPlots = plots.slice(r * numCols, (r + 1) * numCols);
      rows.push(
        <div key={`row-${r}`} className="garden-row">
          {rowPlots.map(plot => (
            <GardenPlot
              key={plot.id}
              plot={plot}
              selected={selectedPlotId === plot.id}
              onClick={() => handlePlotClick(plot.id)}
            />
          ))}
          {/* Add placeholders if row is not full */}
          {Array.from({ length: numCols - rowPlots.length }).map((_, idx) => (
               <div key={`placeholder-${r}-${idx}`} className="garden-plot placeholder"></div> // Add placeholder style if needed
          ))}
        </div>
      );
    }
    return rows;
  };


  // Render weather indicator
  const renderWeatherIndicator = () => {
    let icon: string;
    let label: string = weatherFate.charAt(0).toUpperCase() + weatherFate.slice(1); // Capitalize

    switch (weatherFate) {
      case 'rainy': icon = '🌧️'; break;
      case 'dry': icon = '☀️'; break; // Represent dry with sun
      case 'foggy': icon = '🌫️'; break;
      case 'windy': icon = '💨'; break;
      case 'stormy': icon = '⛈️'; break;
      case 'normal':
      default:
          icon = '🌤️'; label = 'Clear'; break; // Normal/Clear are similar visually
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
      default: icon = '❔'; // Unknown season
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

    if (!selectedPlot) {
      return (
        <div className="plot-details empty">
          <p>Select a garden plot to view details or plant a seed.</p>
        </div>
      );
    }

    const plant = selectedPlot.plant;
    const growthPercent = plant ? Math.min(100, Math.max(0, (plant.growth / plant.maxGrowth) * 100)) : 0;

    return (
      <div className="plot-details">
        <h3>Plot {selectedPlot.id + 1} Details</h3>

        <div className="plot-stats">
          {/* Fertility Stat */}
          <div className="plot-stat">
            <div className="stat-label">Fertility</div>
            <div className="stat-bar">
              <div
                className="stat-fill fertility"
                style={{ width: `${selectedPlot.fertility || 0}%` }}
              />
            </div>
            <div className="stat-value">{selectedPlot.fertility || 0}%</div>
          </div>
          {/* Moisture Stat */}
          <div className="plot-stat">
            <div className="stat-label">Moisture</div>
            <div className="stat-bar">
              <div
                className="stat-fill moisture"
                style={{ width: `${selectedPlot.moisture || 0}%` }}
              />
            </div>
            <div className="stat-value">{selectedPlot.moisture || 0}%</div>
          </div>
           {/* Sunlight Stat (Optional) */}
           {selectedPlot.sunlight !== undefined && (
               <div className="plot-stat">
                   <div className="stat-label">Sunlight</div>
                   <div className="stat-bar">
                       <div
                           className="stat-fill sunlight"
                           style={{ width: `${selectedPlot.sunlight}%` }}
                       />
                   </div>
                   <div className="stat-value">{selectedPlot.sunlight}%</div>
               </div>
           )}
        </div>

        {/* Plant Information */}
        {plant ? (
          <div className="plant-info">
            <h4>{plant.name}</h4>
            {/* Growth Progress */}
            <div className="plant-progress">
              <div className="progress-label">Growth</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${growthPercent}%` }}
                />
              </div>
              <div className="progress-value">{growthPercent.toFixed(0)}%</div>
            </div>
            {/* Plant Stats */}
            <div className="plant-stats">
              <div className="plant-stat">
                <div className="stat-label">Health</div>
                <div className="stat-value">{plant.health}%</div>
              </div>
              <div className="plant-stat">
                <div className="stat-label">Age</div>
                <div className="stat-value">{plant.age} {plant.age === 1 ? 'phase' : 'phases'}</div>
              </div>
              <div className="plant-stat">
                <div className="stat-label">Watered</div>
                 {/* Display actual watered status based on last action/rain */}
                <div className="stat-value">{selectedPlot.moisture > 40 ? 'Yes' : 'No'}</div>
              </div>
            </div>
            {/* Special Statuses */}
            {plant.moonBlessed && (
              <div className="plant-blessing" title="Planted or harvested during a Full Moon">🌙 Moon Blessed</div>
            )}
             {plant.seasonalModifier && plant.seasonalModifier !== 1.0 && (
               <div className="plant-season">
                 {plant.seasonalModifier > 1 ? (
                   <span className="boost">Thriving this season (+{Math.round((plant.seasonalModifier - 1) * 100)}%)</span>
                 ) : (
                   <span className="penalty">Struggling this season (-{Math.round((1 - plant.seasonalModifier) * 100)}%)</span>
                 )}
               </div>
             )}
            {/* Harvest Button */}
            {plant.mature ? (
              <button
                className="action-button harvest"
                onClick={handleHarvest}
              >
                Harvest {plant.name}
              </button>
            ) : (
                 <div className="plant-status">Growing...</div>
            )}
          </div>
        ) : (
           // Actions for Empty Plot
           <div className="empty-plot-actions">
             <p>This plot is empty.</p>
             <button
               className="action-button plant"
               onClick={() => setShowInventory(true)}
             >
               Plant Seed Here
             </button>
           </div>
        )}
      </div>
    );
  };

  // Render inventory panel for seed selection
  const renderInventoryPanel = () => {
    const seeds = getAvailableSeeds();

    return (
      <div className="inventory-panel">
        <h3>Select Seed for Plot {selectedPlotId !== null ? selectedPlotId + 1 : ''}</h3>
        {seeds.length === 0 ? (
          <div className="inventory-panel empty">
            <p>You have no seeds!</p>
             <button
                className="close-button"
                onClick={() => setShowInventory(false)}
              >
                Close
              </button>
          </div>
        ) : (
          <>
            <div className="seed-list">
              {seeds.map(seed => (
                <div
                  key={seed.id}
                  className={`seed-item ${selectedSeedName === seed.name ? 'selected' : ''}`}
                  onClick={() => handleSeedSelect(seed.name)}
                  title={`Plant ${seed.name}`}
                >
                  <div className="seed-image">
                     {/* Add placeholder image logic */}
                     <div className="seed-placeholder">{seed.name.charAt(0).toUpperCase()}</div>
                  </div>
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
                disabled={!selectedSeedName}
                onClick={handlePlant}
              >
                Plant {selectedSeedName || 'Selected Seed'}
              </button>
              <button
                className="close-button"
                onClick={() => { setShowInventory(false); setSelectedSeedName(null); }} // Also clear selection on cancel
              >
                Cancel Planting
              </button>
            </div>
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
        </div>

        <div className="garden-sidebar">
          {/* Conditionally render inventory or details based on state */}
          {showInventory && selectedPlotId !== null ? renderInventoryPanel() : renderPlotDetails()}

          {/* General Garden Actions */}
          <div className="garden-actions">
            <button
              className="garden-action-button water"
              onClick={handleWaterAll}
              title="Water all plants that need it"
            >
              Water All Plants
            </button>
            {/* Add other general actions like 'Fertilize All' later */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Garden;