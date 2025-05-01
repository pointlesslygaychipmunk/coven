import React, { useState, useEffect } from 'react';
import './GardenPlot.css';

interface Plant {
  name: string;
  growth?: number;
  maxGrowth?: number;
  mature?: boolean;
  health?: number;
  age?: number;
  category?: string;
  moonBlessed?: boolean;
  seasonalModifier?: number;
}

interface GardenSlot {
  id: number;
  fertility?: number;
  moisture?: number;
  plant: Plant | null;
  isUnlocked?: boolean;
}

interface GardenPlotProps {
  plot: GardenSlot;
  selected: boolean;
  onClick: () => void;
  season?: 'Spring' | 'Summer' | 'Fall' | 'Winter';
}

const GardenPlot: React.FC<GardenPlotProps> = ({
  plot,
  selected,
  onClick,
  season = 'Spring',
}) => {
  // States for animations and interactions
  const [showHarvestGlow, setShowHarvestGlow] = useState<boolean>(false);
  const [showPlantHint, setShowPlantHint] = useState<boolean>(false);
  const [whisperActive, setWhisperActive] = useState<boolean>(false);
  const [whisperMessage, setWhisperMessage] = useState<string>('');
  const [pulsing, setPulsing] = useState<boolean>(false);
  
  // Easter egg click counter
  const [secretClickCount, setSecretClickCount] = useState<number>(0);
  
  // Define whisper messages for plants
  const plantWhispers = [
    "I grow with the moon's blessing...",
    "The earth nurtures my roots...",
    "Tend to me with care, witch...",
    "I hold ancient secrets within...",
    "My essence will strengthen your brews..."
  ];

  // Determine if plot is locked
  const isLocked = plot.isUnlocked === false;

  // Effect for harvest glow animation
  useEffect(() => {
    let glowInterval: NodeJS.Timeout | null = null;
    
    if (plot.plant?.mature) {
      // Start pulsing glow effect for harvest-ready plants
      glowInterval = setInterval(() => {
        setShowHarvestGlow(prev => !prev);
      }, 1500);
    } else {
      setShowHarvestGlow(false);
    }
    
    // Cleanup
    return () => {
      if (glowInterval) clearInterval(glowInterval);
    };
  }, [plot.plant?.mature]);

  // Start ambient animation
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulsing(prev => !prev);
    }, 3000);
    
    return () => clearInterval(pulseInterval);
  }, []);

  // Handle secret clicks for Easter egg
  const handleSecretClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger regular onClick
    
    if (!plot.plant || isLocked) return;
    
    // Increase secret click counter
    const newCount = secretClickCount + 1;
    setSecretClickCount(newCount);
    
    // If clicked 3 times rapidly, show plant whisper
    if (newCount >= 3 && !whisperActive) {
      const randomWhisper = plantWhispers[Math.floor(Math.random() * plantWhispers.length)];
      setWhisperMessage(randomWhisper);
      setWhisperActive(true);
      
      // Hide whisper after 5 seconds
      setTimeout(() => {
        setWhisperActive(false);
      }, 5000);
      
      // Reset counter
      setSecretClickCount(0);
    } else {
      // Reset counter if not clicked quickly enough
      setTimeout(() => {
        if (secretClickCount === newCount) {
          setSecretClickCount(0);
        }
      }, 2000);
    }
  };

  // Show plant hint when hovering empty plot
  const handleMouseEnter = () => {
    if (!plot.plant && !isLocked) {
      setShowPlantHint(true);
    }
  };
  
  const handleMouseLeave = () => {
    setShowPlantHint(false);
  };

  // Get growth stage for visual representation
  const getGrowthStage = (plant: Plant | null): string => {
    if (!plant || plant.growth === undefined || plant.maxGrowth === undefined) {
      return 'empty';
    }
    
    if (plant.mature) return 'mature';
    
    const growthPercentage = (plant.growth / plant.maxGrowth) * 100;
    
    if (growthPercentage < 25) return 'seedling';
    if (growthPercentage < 50) return 'sprout';
    if (growthPercentage < 75) return 'growing';
    return 'maturing';
  };

  // Get plant health class
  const getHealthClass = (plant: Plant | null): string => {
    if (!plant || plant.health === undefined) return '';
    
    if (plant.health < 30) return 'unhealthy';
    if (plant.health < 70) return 'fair';
    return 'healthy';
  };

  // Get moisture class for visual appearance
  const getMoistureClass = (): string => {
    const moisture = plot.moisture ?? 50;
    
    if (moisture < 30) return 'dry';
    if (moisture > 80) return 'wet';
    return 'normal';
  };

  // Determine if plant needs water
  const needsWater = (plant: Plant | null): boolean => {
    if (!plant || plant.mature) return false;
    return (plot.moisture ?? 50) < 40;
  };

  // Get category-specific class
  const getPlantCategoryClass = (plant: Plant | null): string => {
    if (!plant) return '';
    return plant.category ? plant.category.toLowerCase() : 'herb';
  };
  
  // Render plant visualization based on growth stage and category
  const renderPlant = () => {
    if (!plot.plant) return null;
    
    const growthStage = getGrowthStage(plot.plant);
    const healthClass = getHealthClass(plot.plant);
    const categoryClass = getPlantCategoryClass(plot.plant);
    
    return (
      <div 
        className={`plant ${healthClass} ${categoryClass} ${pulsing ? 'pulse' : ''}`} 
        onDoubleClick={handleSecretClick}
      >
        <div className={`plant-visual ${growthStage}`}>
          {/* Base sprite */}
          <div className="plant-sprite"></div>
          
          {/* Plant animations and effects */}
          {plot.plant.moonBlessed && <div className="moon-blessing"></div>}
          
          {/* Status indicators */}
          {plot.plant.seasonalModifier && plot.plant.seasonalModifier > 1.2 && 
            <div className="season-boost"></div>}
          {plot.plant.seasonalModifier && plot.plant.seasonalModifier < 0.8 && 
            <div className="season-penalty"></div>}
        </div>
        
        {/* Plant whisper - Easter egg */}
        {whisperActive && (
          <div className="plant-whisper">
            <div className="whisper-text">{whisperMessage}</div>
          </div>
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
            className={`status-indicator harvest-ready ${showHarvestGlow ? 'glow' : ''}`} 
            title="Ready to Harvest"
          />
        )}
        
        {needsWater(plot.plant) && (
          <div className="status-indicator needs-water" title="Needs Water" />
        )}
        
        {!plot.plant && !isLocked && (
          <div className="status-indicator empty-plot" title="Empty Plot" />
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
    plot.plant?.mature ? 'mature' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={plotClasses}
      onClick={isLocked ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isLocked ? (
        <div className="locked-overlay">
          <div className="lock-icon"></div>
        </div>
      ) : (
        <>
          <div className="plot-soil"></div>
          {renderPlant()}
          {renderPlotStatus()}
          
          {/* Selection frame */}
          <div className="selection-frame">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
          </div>
          
          {/* Show plant hint for empty plots on hover */}
          {showPlantHint && !plot.plant && (
            <div className="plant-hint">
              <div className="hint-text">Plant Here</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GardenPlot;