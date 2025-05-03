import React, { useState, useEffect } from 'react';
import './GardenPlot.css';
import { 
  getGrowthStage, 
  getHealthClass, 
  getMoistureClass, 
  getPlantCategoryClass, 
  needsWater,
  adaptPlantForDisplay
} from '../utils';
import { GardenSlot as BaseGardenSlot } from 'coven-shared';
import { DisplayGardenSlot } from '../utils/frontendCompatibility';

interface GardenPlotProps {
  plot: BaseGardenSlot;
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
    
    const displayPlant = adaptPlantForDisplay(plot.plant);
    if (displayPlant?.mature) {
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

  // Using imported utility functions for consistent behavior across components
  
  // Render plant visualization based on growth stage and category
  const renderPlant = () => {
    if (!plot.plant) return null;
    
    // Convert Plant to DisplayPlant
    const displayPlant = adaptPlantForDisplay(plot.plant);
    if (!displayPlant) return null;
    
    const growthStage = getGrowthStage(displayPlant);
    const healthClass = getHealthClass(displayPlant);
    const categoryClass = getPlantCategoryClass(displayPlant);
    
    return (
      <div 
        className={`plant ${healthClass} ${categoryClass} ${pulsing ? 'pulse' : ''}`} 
        onDoubleClick={handleSecretClick}
      >
        <div className={`plant-visual ${growthStage}`}>
          {/* Base sprite */}
          <div className="plant-sprite"></div>
          
          {/* Plant animations and effects */}
          {displayPlant.moonBlessed && <div className="moon-blessing"></div>}
          
          {/* Status indicators */}
          {displayPlant.seasonalModifier && displayPlant.seasonalModifier > 1.2 && 
            <div className="season-boost"></div>}
          {displayPlant.seasonalModifier && displayPlant.seasonalModifier < 0.8 && 
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
    const displayPlant = adaptPlantForDisplay(plot.plant);
    
    return (
      <div className="plot-status">
        {displayPlant?.mature && (
          <div 
            className={`status-indicator harvest-ready ${showHarvestGlow ? 'glow' : ''}`} 
            title="Ready to Harvest"
          />
        )}
        
        {needsWater(displayPlant, plot.moisture ?? 50) && (
          <div className="status-indicator needs-water" title="Needs Water" />
        )}
        
        {!plot.plant && !isLocked && (
          <div className="status-indicator empty-plot" title="Empty Plot" />
        )}
      </div>
    );
  };

  // Combine all CSS classes
  const displayPlant = adaptPlantForDisplay(plot.plant);
  const plotClasses = [
    'garden-plot',
    isLocked ? 'locked' : '',
    selected ? 'selected' : '',
    getMoistureClass(plot.moisture),
    season.toLowerCase(), // Add season class
    displayPlant?.mature ? 'mature' : '',
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