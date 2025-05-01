import React, { useState, useEffect } from 'react';
import './GardenPlot.css';
import { GardenSlot, Plant, Season } from 'coven-shared'; // Use shared types

interface GardenPlotProps {
  plot: GardenSlot;
  selected: boolean;
  onClick: () => void;
  season?: Season; // Optional season property for seasonal styling
  isWatering?: boolean; // Optional prop for watering animation
}

const GardenPlot: React.FC<GardenPlotProps> = ({
  plot,
  selected,
  onClick,
  season = 'Spring', // Default to Spring if not provided
  isWatering = false
}) => {
  // State for animations and effects
  const [showHarvestGlow, setShowHarvestGlow] = useState<boolean>(false);
  const [showPlantHint, setShowPlantHint] = useState<boolean>(false);

  // Determine if the plot is locked (explicitly false means locked)
  const isLocked = plot.isUnlocked === false;

  // Effect for harvest glow animation
  useEffect(() => {
    if (plot.plant?.mature) {
      const glowInterval = setInterval(() => {
        setShowHarvestGlow(prev => !prev);
      }, 3000);
      
      return () => clearInterval(glowInterval);
    }
  }, [plot.plant?.mature]);

  // Show plant hint when hovering on empty plot
  const handleMouseEnter = () => {
    if (!plot.plant && !isLocked) {
      setShowPlantHint(true);
    }
  };

  const handleMouseLeave = () => {
    setShowPlantHint(false);
  };

  // Get the growth stage for visual representation
  const getGrowthStage = (plant: Plant | null): string => {
    if (!plant || !plant.growth || !plant.maxGrowth) return 'empty';

    // Handle mature state first
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

    return (
      <div className={`plant ${healthClass}`}>
        {/* Base Visual Element */}
        <div className={`${growthStage}-visual`}>
          {/* Plant categories */}
          {growthStage === 'mature' && plot.plant.category === 'flower' && (
            <div className="mature-flower"></div>
          )}
          {growthStage === 'mature' && plot.plant.category === 'herb' && (
            <div className="mature-herb"></div>
          )}
          {growthStage === 'mature' && plot.plant.category === 'root' && (
            <div className="mature-root"></div>
          )}
          {growthStage === 'mature' && plot.plant.category === 'mushroom' && (
            <div className="mature-mushroom"></div>
          )}
          {growthStage === 'mature' && plot.plant.category === 'fruit' && (
            <div className="mature-fruit"></div>
          )}
          {growthStage === 'mature' && plot.plant.category === 'leaf' && (
            <div className="mature-leaf"></div>
          )}
          {growthStage === 'mature' && plot.plant.category === 'succulent' && (
            <div className="mature-succulent"></div>
          )}
          {/* Fix: Add empty string as fallback for category check */}
          {growthStage === 'mature' && !['flower', 'herb', 'root', 'mushroom', 'fruit', 'leaf', 'succulent'].includes(plot.plant.category || '') && (
            <div className="mature-flower"></div> // Default if category not recognized
          )}
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
          <div 
            className="status-icon ready-to-harvest" 
            title="Ready to Harvest" 
            style={{
              transform: showHarvestGlow ? 'scale(1.1)' : 'scale(1)',
              boxShadow: showHarvestGlow ? '0 0 10px rgba(126, 186, 118, 0.8)' : '0 2px 4px rgba(0, 0, 0, 0.5)'
            }}
          >
            ✓
          </div>
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

  // Combine all CSS classes
  const plotClasses = [
    'garden-plot',
    isLocked ? 'locked' : '',
    selected ? 'selected' : '',
    getMoistureClass(),
    season.toLowerCase(), // Add season class
    isWatering ? 'watering' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={plotClasses}
      onClick={isLocked ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          
          {/* Plant hint for empty unlocked plots */}
          {showPlantHint && !plot.plant && (
            <div className="plant-hint">
              <div className="hint-icon">🌱</div>
              <div className="hint-text">Plant here!</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GardenPlot;