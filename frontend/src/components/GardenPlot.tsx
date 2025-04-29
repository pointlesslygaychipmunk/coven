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
        {/* Base Visual Element (can be styled further based on stage/type) */}
        <div className={`${growthStage}-visual`}>
           {/* Specific stage elements are handled by CSS */}
           {/* Example for adding specific elements dynamically if needed: */}
            {growthStage === 'mature' && plot.plant.category === 'flower' && <div className="mature-flower-element"></div>}
            {/* Add other category-specific visuals here */}
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