import React from 'react';
import './GardenPlot.css'; // Ensure this uses the new styles
import { GardenSlot, Plant } from 'coven-shared';

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
  const isLocked = plot.isUnlocked === false;

  const getGrowthStage = (plant: Plant | null): string => {
    if (!plant || !plant.growth || plant.maxGrowth === undefined || plant.maxGrowth <= 0) return 'empty';
    if (plant.mature) return 'mature';

    const growthPercentage = Math.min(100, Math.max(0, (plant.growth / plant.maxGrowth) * 100));

    if (growthPercentage < 1) return 'empty'; // Handle 0 growth case if needed
    if (growthPercentage < 25) return 'seedling';
    if (growthPercentage < 50) return 'sprout';
    if (growthPercentage < 75) return 'growing';
    return 'maturing';
  };

  const getHealthClass = (plant: Plant | null): string => {
    if (!plant || plant.health === undefined) return '';
    if (plant.health < 30) return 'unhealthy';
    if (plant.health < 60) return 'fair';
    return 'healthy';
  };

  const getMoistureClass = (): string => {
    const moisture = plot.moisture ?? 50;
    if (moisture < 30) return 'dry';
    if (moisture > 80) return 'wet';
    return 'normal';
  };

  const needsWater = (plant: Plant | null): boolean => {
    if (!plant || plant.mature) return false;
    return (plot.moisture ?? 50) < 40;
  };

  const renderPlant = () => {
    if (!plot.plant) return null;

    const growthStage = getGrowthStage(plot.plant);
    const healthClass = getHealthClass(plot.plant);
    const plantCategory = plot.plant.category || 'unknown'; // Default category

    return (
      <div className={`plant ${healthClass}`}>
        {/* Base visual element for the stage */}
        <div className={`${growthStage}-visual`}>
            {/* Specific mature visuals can be added here if needed, e.g., based on category */}
            {/* The base visual is handled by CSS background-image */}
            {growthStage === 'mature' && plantCategory === 'flower' && <div className="mature-flower-element"></div>}
            {/* Add other category-specific visuals if defined in CSS */}
        </div>

        {/* Moon blessing visual effect */}
        {plot.plant.moonBlessed && (
          <div className="moon-blessing-effect" title="Moon Blessed"></div>
        )}
      </div>
    );
  };

  const renderPlotStatus = () => {
    return (
      <div className="plot-status">
        {plot.plant?.mature && (
          <div className="status-icon ready-to-harvest" title="Ready to Harvest"></div>
        )}
        {needsWater(plot.plant) && (
          <div className="status-icon needs-water" title="Needs Water"></div>
        )}
        {!plot.plant && !isLocked && (
          <div className="status-icon empty-plot" title="Empty Plot"></div>
        )}
      </div>
    );
  };

  const plotClasses = [
      'garden-plot',
      isLocked ? 'locked' : '',
      selected ? 'selected' : '',
      getMoistureClass(),
  ].filter(Boolean).join(' '); // Filter out empty strings before joining

  return (
    <div
      className={plotClasses}
      onClick={isLocked ? undefined : onClick}
      title={isLocked ? "Locked Plot" : `Plot ${plot.id + 1} (Click to interact)`}
    >
      {isLocked ? (
        <div className="locked-overlay">
          <div className="lock-icon">🔒</div>
        </div>
      ) : (
        <>
          {/* Soil is now part of the main background */}
          {renderPlant()}
          {renderPlotStatus()}
        </>
      )}
    </div>
  );
};

export default GardenPlot;