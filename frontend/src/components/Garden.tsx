import React, { useState } from 'react';
import './Garden.css'; // Ensure this CSS file uses the new design
import GardenPlot from './GardenPlot';
import { InventoryItem, GardenSlot, Season, WeatherFate } from 'coven-shared';

interface GardenProps {
  plots: GardenSlot[];
  inventory: InventoryItem[];
  onPlant: (slotId: number, seedInventoryItemId: string) => void;
  onHarvest: (slotId: number) => void;
  onWater: () => void;
  weatherFate: WeatherFate;
  season: Season;
}

const Garden: React.FC<GardenProps> = ({
  plots,
  inventory,
  onPlant,
  onHarvest,
  onWater,
  weatherFate = 'normal', // Default value
  season = 'Spring' // Default value
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [selectedSeedInventoryItemId, setSelectedSeedInventoryItemId] = useState<string | null>(null);

  const getAvailableSeeds = (): InventoryItem[] => {
    // Filter and sort seeds, maybe prioritize rarer ones?
    return inventory
        .filter(item => item.type === 'seed' && item.quantity > 0)
        .sort((a, b) => a.name.localeCompare(b.name)); // Simple alphabetical sort
  };

  const getSelectedPlot = (): GardenSlot | undefined => {
    return selectedPlotId !== null ? plots.find(plot => plot.id === selectedPlotId) : undefined;
  };

  const handlePlotClick = (plotId: number) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.isUnlocked === false) return;

    if (selectedPlotId === plotId) {
      // If clicking the same plot again:
      // - If inventory was open, close it.
      // - If details were open, deselect plot.
      if (showInventory) {
        setShowInventory(false);
        setSelectedSeedInventoryItemId(null);
      } else {
        setSelectedPlotId(null);
      }
    } else {
      // Clicking a new plot
      setSelectedPlotId(plotId);
      setSelectedSeedInventoryItemId(null); // Clear seed selection
      // Only show seed inventory immediately if the plot is empty
      setShowInventory(!plot.plant);
    }
  };

  const handleSeedSelect = (seedInventoryItemId: string) => {
    setSelectedSeedInventoryItemId(seedInventoryItemId);
    // Keep inventory panel open for confirmation (Plant button)
  };

  const handlePlant = () => {
    if (selectedPlotId !== null && selectedSeedInventoryItemId) {
      onPlant(selectedPlotId, selectedSeedInventoryItemId);
      setSelectedSeedInventoryItemId(null);
      setShowInventory(false);
      // Keep plot selected to see the newly planted seedling
    }
  };

  const handleHarvest = () => {
    const plot = getSelectedPlot();
    if (plot?.plant?.mature) {
      onHarvest(plot.id);
      setSelectedPlotId(null); // Deselect after harvest
    }
  };

  const handleWaterAll = () => {
    onWater();
    // Maybe add a subtle visual feedback like a quick shimmer over plots
  };

  // Render garden plots in a grid (e.g., 3x3)
  const renderPlots = () => {
    // Determine grid size dynamically or use fixed size
    const numCols = 3;
    const numRows = Math.ceil(plots.length / numCols);
    const renderedPlots = [];

    for (let i = 0; i < plots.length; i++) {
        renderedPlots.push(
            <GardenPlot
              key={plots[i].id}
              plot={plots[i]}
              selected={selectedPlotId === plots[i].id}
              onClick={() => handlePlotClick(plots[i].id)}
            />
        );
    }
    // Add placeholders for a full grid visually if needed
    const totalSlots = numRows * numCols;
    for (let i = plots.length; i < totalSlots; i++) {
        renderedPlots.push(<div key={`placeholder-${i}`} className="garden-plot placeholder"></div>);
    }

    // Group into rows for CSS Grid or Flex layout
    const rows = [];
    for (let r = 0; r < numRows; r++) {
      rows.push(
        <div key={`row-${r}`} className="garden-row">
          {renderedPlots.slice(r * numCols, (r + 1) * numCols)}
        </div>
      );
    }
    return rows;
  };

  // Indicators
   const renderWeatherIndicator = () => {
       let icon: string;
       let label: string = weatherFate.charAt(0).toUpperCase() + weatherFate.slice(1);

       switch (weatherFate) {
         case 'rainy': icon = '🌧️'; break;
         case 'dry': icon = '☀️'; label = 'Dry Spell'; break;
         case 'foggy': icon = '🌫️'; break;
         case 'windy': icon = '💨'; break;
         case 'stormy': icon = '⛈️'; break;
         case 'clear': icon = '☀️'; break; // Use sun for clear day
         case 'normal': // Normal might depend on season/time
         default: icon = '🌤️'; label = 'Pleasant'; break;
       }

       return (
         <div className="weather-indicator" title={`Weather: ${label}`}>
           <span className="weather-icon">{icon}</span>
           <span className="weather-label">{label}</span>
         </div>
       );
   };

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
           <span className="season-icon">{icon}</span>
           <span className="season-label">{season}</span>
         </div>
       );
   };


  // Render plot details panel
   const renderPlotDetails = () => {
       const selectedPlot = getSelectedPlot();

       if (!selectedPlot) {
         return (
           <div className="plot-details empty">
             <p>Select a garden plot...</p>
             {/* Maybe add a small illustration? */}
           </div>
         );
       }

       const plant = selectedPlot.plant;
       const growthPercent = plant?.growth !== undefined && plant.maxGrowth
                             ? Math.min(100, Math.max(0, (plant.growth / plant.maxGrowth) * 100))
                             : 0;
       const needsWater = !plant?.mature && (selectedPlot.moisture ?? 50) < 40;

       return (
         <div className="plot-details">
           <h3>Plot {selectedPlot.id + 1}</h3>

           {/* Plot Stats */}
           <div className="plot-stats">
             {/* Fertility Stat */}
             <div className="plot-stat" title={`Fertility: ${selectedPlot.fertility || 0}%`}>
               <div className="stat-label">🌱</div>
               <div className="stat-bar"><div className="stat-fill fertility" style={{ width: `${selectedPlot.fertility || 0}%` }} /></div>
             </div>
             {/* Moisture Stat */}
             <div className="plot-stat" title={`Moisture: ${selectedPlot.moisture || 0}%`}>
               <div className="stat-label">💧</div>
               <div className="stat-bar"><div className="stat-fill moisture" style={{ width: `${selectedPlot.moisture || 0}%` }} /></div>
             </div>
           </div>

           {/* Plant Information */}
           {plant ? (
             <div className="plant-info">
               <h4>{plant.name}</h4>
               {/* Growth Progress */}
               <div className="plant-progress" title={`Growth: ${growthPercent.toFixed(0)}%`}>
                 <div className="progress-label">Growth</div>
                 <div className="progress-bar"><div className="progress-fill" style={{ width: `${growthPercent}%` }} /></div>
               </div>
               {/* Plant Stats Mini Icons */}
               <div className="plant-stats">
                 <div className="plant-stat" title={`Health: ${plant.health?.toFixed(0) ?? '?'}%`}>❤️ {plant.health?.toFixed(0) ?? '?'}%</div>
                 <div className="plant-stat" title={`Age: ${plant.age ?? '?'} phases`}>⏳ {plant.age ?? '?'}</div>
                 <div className={`plant-stat ${needsWater ? 'needs-water-text' : ''}`} title={needsWater ? 'Needs Watering!' : 'Watered'}>💧 {needsWater ? 'Dry' : 'OK'}</div>
               </div>
               {/* Special Statuses */}
               {plant.moonBlessed && <div className="plant-blessing" title="Gained lunar essence!">🌙 Moon Blessed</div>}
               {plant.seasonalModifier && plant.seasonalModifier !== 1.0 && (
                   <div className="plant-season">
                     {plant.seasonalModifier > 1 ? (
                       <span className="boost">Thrives (+{Math.round((plant.seasonalModifier - 1) * 100)}%)</span>
                     ) : (
                       <span className="penalty">Struggles (-{Math.round((1 - plant.seasonalModifier) * 100)}%)</span>
                     )}
                   </div>
               )}

               {/* Harvest Button */}
               {plant.mature ? (
                 <button className="action-button harvest" onClick={handleHarvest}>Harvest {plant.name}</button>
               ) : (
                 <div className="plant-status">Growing...</div>
               )}
             </div>
           ) : (
              // Actions for Empty Plot
              <div className="empty-plot-actions">
                <p>Plot is ready for planting!</p>
                <button className="action-button plant" onClick={() => setShowInventory(true)}>Plant Seed</button>
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
            <p>No seeds in your pouch!</p>
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
                  <div className="seed-image">
                    <div className="seed-placeholder">{seed.name.charAt(0).toUpperCase()}</div>
                  </div>
                  <div className="seed-info">
                    <div className="seed-name">{seed.name}</div>
                    <div className="seed-quantity">x {seed.quantity}</div>
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
                Plant {inventory.find(s => s.id === selectedSeedInventoryItemId)?.name || 'Seed'}
              </button>
              <button
                className="close-button"
                onClick={() => { setShowInventory(false); setSelectedSeedInventoryItemId(null); }}
              >
                Cancel
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
          {/* Conditional Panel */}
          {showInventory && selectedPlotId !== null ? renderInventoryPanel() : renderPlotDetails()}

          {/* General Garden Actions */}
          <div className="garden-actions">
            <button
              className="garden-action-button water"
              onClick={handleWaterAll}
              title="Water all dry plots"
            >
              Water All
            </button>
            {/* Add other general actions like 'Fertilize All' later */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Garden;