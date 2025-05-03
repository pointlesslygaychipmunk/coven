import React, { useState, useEffect } from 'react';
import './Garden90s.css';
import type { GardenSlot, InventoryItem, Season, WeatherFate, DisplayPlant } from 'coven-shared';
import { adaptPlantForDisplay } from '../utils';

interface Garden90sProps {
  plots: GardenSlot[];
  inventory: InventoryItem[];
  onPlant: (slotId: number, seedInventoryItemId: string) => void;
  onHarvest: (slotId: number) => void;
  onWater: (puzzleBonus: number) => void;
  weatherFate: WeatherFate;
  season: Season;
}

const Garden90s: React.FC<Garden90sProps> = ({
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
  
  // State for garden whispers and tips
  const [gardenTip, setGardenTip] = useState<string>('');
  const [showWhisper, setShowWhisper] = useState<boolean>(false);
  const [whisperText, setWhisperText] = useState<string>('');
  
  // State for attunement bonus
  const [attunementActive, setAttunementActive] = useState<boolean>(false);
  const [attunementPower, setAttunementPower] = useState<number>(0);
  
  // Garden whispers (wisdom that appears periodically)
  const gardenWhispers = [
    "The moon blesses plants harvested under its full glow...",
    "A plant's quality reflects its care and the soil it grows in...",
    "Some herbs thrive in unexpected seasons...",
    "Balance the elements to nurture your garden's spirit...",
    "Plants whisper their needs, if you listen closely...",
    "Each plant has a season where it thrives most brilliantly...",
    "Patience is the greatest virtue of a garden witch...",
    "Harmonizing with the season unlocks potent growth."
  ];
  
  // Initialize with a random tip
  useEffect(() => {
    setGardenTip(gardenWhispers[Math.floor(Math.random() * gardenWhispers.length)]);
    
    // Set up whispers to appear periodically
    const whisperInterval = setInterval(() => {
      if (Math.random() < 0.3 && !showWhisper) { // 30% chance every interval
        const randomWhisper = gardenWhispers[Math.floor(Math.random() * gardenWhispers.length)];
        setWhisperText(randomWhisper);
        setShowWhisper(true);
        
        // Hide whisper after a few seconds
        setTimeout(() => {
          setShowWhisper(false);
        }, 6000);
      }
    }, 45000); // Check every 45 seconds
    
    return () => clearInterval(whisperInterval);
  }, [showWhisper]);
  
  // Get available seeds from inventory
  const getAvailableSeeds = () => {
    return inventory.filter(item => item.type === 'seed' && item.quantity > 0);
  };
  
  // Get selected plot details
  const getSelectedPlot = () => {
    if (selectedPlotId === null) return undefined;
    return plots.find(plot => plot.id === selectedPlotId);
  };
  
  // Handle plot selection
  const handlePlotClick = (plotId: number) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.isUnlocked === false) return;
    
    if (selectedPlotId === plotId) {
      setSelectedPlotId(null); // Deselect if already selected
    } else {
      setSelectedPlotId(plotId);
    }
  };
  
  // Handle seed selection
  const handleSeedSelect = (seedId: string) => {
    if (selectedSeedId === seedId) {
      setSelectedSeedId(null); // Deselect if already selected
    } else {
      setSelectedSeedId(seedId);
    }
  };
  
  // Handle planting action
  const handlePlant = () => {
    const selectedPlot = getSelectedPlot();
    if (!selectedPlot || selectedPlot.plant || selectedPlotId === null || !selectedSeedId) {
      return; // Invalid planting conditions
    }
    
    // Visual feedback before actual planting
    const seedName = inventory.find(item => item.id === selectedSeedId)?.name || 'seed';
    setWhisperText(`Planting ${seedName}...`);
    setShowWhisper(true);
    
    // Call the planting action
    onPlant(selectedPlotId, selectedSeedId);
    
    // Reset selection after planting
    setSelectedSeedId(null);
    setTimeout(() => setShowWhisper(false), 3000);
  };
  
  // Handle harvesting action
  const handleHarvest = () => {
    const plot = getSelectedPlot();
    if (plot?.plant?.mature) {
      // Convert to DisplayPlant and get name
      const displayPlant = adaptPlantForDisplay(plot.plant);
      const plantName = displayPlant?.name || 'plant';
      
      // Visual feedback
      setWhisperText(`Harvesting ${plantName}...`);
      setShowWhisper(true);
      
      // Call harvest action
      onHarvest(plot.id);
      
      // Reset selection after harvesting
      setSelectedPlotId(null);
      setTimeout(() => setShowWhisper(false), 3000);
    }
  };
  
  // Handle watering/attunement action
  const handleAttunement = () => {
    // Visual attunement effect
    setAttunementActive(true);
    
    // Calculate attunement power based on current season and moon phase
    // This would be more sophisticated in the real game
    const basePower = Math.floor(Math.random() * 20) + 10; // 10-30% bonus
    setAttunementPower(basePower);
    
    // Show feedback
    setWhisperText(`Attuning garden with ${basePower}% seasonal energy...`);
    setShowWhisper(true);
    
    // Trigger water action with calculated bonus
    onWater(basePower);
    
    // Reset after effect completes
    setTimeout(() => {
      setAttunementActive(false);
      setShowWhisper(false);
    }, 4000);
  };
  
  // Clear seed selection
  const handleClearSelection = () => {
    setSelectedSeedId(null);
  };
  
  // Render garden grid
  const renderPlots = () => {
    return (
      <div className="garden-grid">
        {plots.map(plot => {
          const isLocked = plot.isUnlocked === false;
          const hasPlant = !!plot.plant;
          const isMature = plot.plant?.mature || false;
          
          return (
            <div 
              key={plot.id} 
              className={`garden-plot ${isLocked ? 'locked' : ''} ${hasPlant ? 'has-plant' : ''} ${isMature ? 'mature' : ''} ${selectedPlotId === plot.id ? 'selected' : ''}`}
              onClick={() => handlePlotClick(plot.id)}
            >
              {isLocked ? (
                <div className="lock-icon">🔒</div>
              ) : hasPlant ? (
                <div className="plant-display">
                  {(() => {
                    const displayPlant = adaptPlantForDisplay(plot.plant!);
                    const plantName = displayPlant?.name || 'plant';
                    return (
                      <>
                        <div className="plant-icon">{getPlantIcon(plantName)}</div>
                        <div className="growth-indicator" style={{ height: `${(plot.plant!.growth / plot.plant!.maxGrowth) * 100}%` }}></div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="empty-plot"></div>
              )}
              <div className="plot-number">{plot.id + 1}</div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Helper to get plant icon based on name
  const getPlantIcon = (plantName: string) => {
    // In a real implementation, you'd have specific icons for each plant
    const firstChar = plantName.charAt(0).toUpperCase();
    switch (plantName.toLowerCase()) {
      case 'moonflower': return '✧';
      case 'ginseng': return 'G';
      case 'chamomile': return 'C';
      case 'lavender': return 'L';
      default: return firstChar;
    }
  };
  
  // Render seed inventory 
  const renderSeedInventory = () => {
    const seeds = getAvailableSeeds();
    return (
      <div className="seed-inventory">
        <div className="seed-list-header">
          <h3>Seeds</h3>
        </div>
        <div className="seed-list">
          {seeds.length === 0 ? (
            <div className="empty-seeds">No seeds in inventory</div>
          ) : (
            seeds.map(seed => (
              <div 
                key={seed.id}
                className={`seed-item ${selectedSeedId === seed.id ? 'selected' : ''}`}
                onClick={() => handleSeedSelect(seed.id)}
              >
                <div className="seed-icon">{seed.name.charAt(0).toUpperCase()}</div>
                <div className="seed-info">
                  <div className="seed-name">{seed.name}</div>
                  <div className="seed-quantity">x{seed.quantity}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };
  
  // Render plot details panel
  const renderPlotDetails = () => {
    const selectedPlot = getSelectedPlot();
    
    if (!selectedPlot) {
      return (
        <div className="plot-details">
          <h3>Garden Plot</h3>
          <div className="detail-content">
            <p>Select a plot to view details</p>
            <div className="garden-tip">{gardenTip}</div>
          </div>
        </div>
      );
    }
    
    if (selectedPlot.isUnlocked === false) {
      return (
        <div className="plot-details">
          <h3>Plot {selectedPlot.id + 1} (Locked)</h3>
          <div className="detail-content">
            <div className="locked-message">
              <div className="big-lock">🔒</div>
              <p>This plot is locked. Expand your garden through achievements.</p>
            </div>
          </div>
        </div>
      );
    }
    
    // Plot is unlocked - show details
    return (
      <div className="plot-details">
        <h3>Plot {selectedPlot.id + 1}</h3>
        <div className="detail-content">
          <div className="soil-meters">
            <div className="meter-row">
              <span className="meter-label">Fertility:</span>
              <div className="meter-bar">
                <div className="meter-fill fertility" style={{width: `${selectedPlot.fertility || 0}%`}}></div>
                <span className="meter-value">{selectedPlot.fertility || 0}%</span>
              </div>
            </div>
            <div className="meter-row">
              <span className="meter-label">Moisture:</span>
              <div className="meter-bar">
                <div className="meter-fill moisture" style={{width: `${selectedPlot.moisture || 0}%`}}></div>
                <span className="meter-value">{selectedPlot.moisture || 0}%</span>
              </div>
            </div>
          </div>
          
          {selectedPlot.plant ? (
            (() => {
              // Convert to DisplayPlant to access plant properties safely
              const displayPlant = adaptPlantForDisplay(selectedPlot.plant);
              if (!displayPlant) return <div>Error loading plant data</div>;
              
              return (
                <div className="plant-details">
                  <h4>{displayPlant.name}</h4>
                  <div className="meter-row">
                    <span className="meter-label">Growth:</span>
                    <div className="meter-bar">
                      <div 
                        className="meter-fill growth" 
                        style={{width: `${(displayPlant.growth / displayPlant.maxGrowth) * 100}%`}}
                      ></div>
                      <span className="meter-value">{Math.round((displayPlant.growth / displayPlant.maxGrowth) * 100)}%</span>
                    </div>
                  </div>
                  <div className="meter-row">
                    <span className="meter-label">Health:</span>
                    <div className="meter-bar">
                      <div 
                        className="meter-fill health" 
                        style={{width: `${displayPlant.health || 0}%`}}
                      ></div>
                      <span className="meter-value">{displayPlant.health || 0}%</span>
                    </div>
                  </div>
                  <div className="plant-age">Age: {displayPlant.age} {displayPlant.age === 1 ? 'day' : 'days'}</div>
                  
                  {displayPlant.mature && (
                    <button className="garden-button harvest" onClick={handleHarvest}>
                      <span className="button-text">Harvest</span>
                    </button>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="empty-plot-message">
              <p>This plot is empty and ready for planting.</p>
              {selectedSeedId && (
                <button className="garden-button plant" onClick={handlePlant}>
                  <span className="button-text">Plant Seed</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render weather and season indicators
  const renderGardenInfo = () => {
    return (
      <div className="garden-info">
        <div className="info-item weather">
          <div className="info-label">Weather:</div>
          <div className="info-value">
            <span className="weather-icon">{getWeatherIcon(weatherFate)}</span>
            <span>{capitalizeFirst(weatherFate)}</span>
          </div>
        </div>
        <div className="info-item season">
          <div className="info-label">Season:</div>
          <div className="info-value">
            <span className="season-icon">{getSeasonIcon(season)}</span>
            <span>{season}</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Helper to get weather icon
  const getWeatherIcon = (weather: WeatherFate) => {
    switch (weather) {
      case 'rainy': return '🌧️';
      case 'stormy': return '⛈️';
      case 'windy': return '💨';
      case 'dry': return '☀️';
      case 'foggy': return '🌫️';
      default: return '🌤️';
    }
  };
  
  // Helper to get season icon
  const getSeasonIcon = (season: Season) => {
    switch (season) {
      case 'Spring': return '🌱';
      case 'Summer': return '☀️';
      case 'Fall': return '🍂';
      case 'Winter': return '❄️';
      default: return '';
    }
  };
  
  // Helper to capitalize first letter
  const capitalizeFirst = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  
  // Garden actions (attunement, etc.)
  const renderGardenActions = () => {
    return (
      <div className="garden-actions">
        <button 
          className="garden-button attune" 
          onClick={handleAttunement}
          disabled={attunementActive}
        >
          <span className="button-text">Attune Garden</span>
        </button>
        
        {selectedSeedId && (
          <button className="garden-button clear" onClick={handleClearSelection}>
            <span className="button-text">Clear Selection</span>
          </button>
        )}
      </div>
    );
  };
  
  return (
    <div className={`garden90s-container ${season.toLowerCase()}`}>
      <div className="garden-header">
        <h2>Witch's Garden</h2>
        {renderGardenInfo()}
      </div>
      
      <div className="garden-main">
        <div className="garden-left-panel">
          {renderPlots()}
          {renderGardenActions()}
        </div>
        
        <div className="garden-right-panel">
          {renderPlotDetails()}
          {renderSeedInventory()}
        </div>
      </div>
      
      {/* Whispers overlay */}
      {showWhisper && (
        <div className="garden-whisper">
          <div className="whisper-text">{whisperText}</div>
        </div>
      )}
      
      {/* Attunement effect overlay */}
      {attunementActive && (
        <div className="attunement-overlay">
          <div className="attunement-particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="attunement-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
          <div className="attunement-power">{attunementPower}%</div>
        </div>
      )}
      
      {/* Decorative corners */}
      <div className="corner-decoration top-left"></div>
      <div className="corner-decoration top-right"></div>
      <div className="corner-decoration bottom-left"></div>
      <div className="corner-decoration bottom-right"></div>
    </div>
  );
};

export default Garden90s;