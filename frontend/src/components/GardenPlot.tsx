import React, { useState, useEffect } from 'react';
import './GardenPlot.css';
import { GardenSlot, Plant, Season } from 'coven-shared';

interface GardenPlotProps {
  plot: GardenSlot;
  selected: boolean;
  onClick: () => void;
  season?: Season;
}

const GardenPlot: React.FC<GardenPlotProps> = ({
  plot,
  selected,
  onClick,
  season = 'Spring',
}) => {
  // States for animations and effects
  const [showHarvestGlow, setShowHarvestGlow] = useState<boolean>(false);
  const [showPlantHint, setShowPlantHint] = useState<boolean>(false);
  const [dancingPlant, setDancingPlant] = useState<boolean>(false);
  const [secretClickCount, setSecretClickCount] = useState<number>(0);
  const [spiritType, setSpiritType] = useState<string>('');
  const [, setWhispers] = useState<string[]>([]);
  const [showWhisper, setShowWhisper] = useState<boolean>(false);
  const [currentWhisper, setCurrentWhisper] = useState<string>('');

  // Determine if the plot is locked
  const isLocked = plot.isUnlocked === false;

  // Harvest glow effect
  useEffect(() => {
    let glowInterval: NodeJS.Timeout | null = null;
    if (plot.plant?.mature) {
      glowInterval = setInterval(() => {
        setShowHarvestGlow(prev => !prev);
      }, 1500);
    } else {
      setShowHarvestGlow(false);
    }

    return () => {
      if (glowInterval) clearInterval(glowInterval);
    };
  }, [plot.plant?.mature]);

  // Easter Egg: Secret click handler for dancing plants
  const handleSecretClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isLocked || !plot.plant || !plot.plant.mature) return;

    const newCount = secretClickCount + 1;
    setSecretClickCount(newCount);

    if (newCount >= 3) {
      console.log(`✨ Whispering Garden triggered for ${plot.plant.name}! ✨`);
      setDancingPlant(true);

      // Determine spirit type based on plant category
      const category = plot.plant?.category || '';
      let type = 'general';
      if (category.includes('flower')) type = 'flower';
      else if (category.includes('herb')) type = 'herb';
      else if (category.includes('mushroom')) type = 'mushroom';
      else if (category.includes('root')) type = 'root';
      else if (category.includes('fruit')) type = 'fruit';
      setSpiritType(type);

      // Generate plant whispers
      const newWhispers = generatePlantWhispers(type, season);
      setWhispers(newWhispers);
      startWhispers(newWhispers);

      setTimeout(() => {
        setDancingPlant(false);
        setShowWhisper(false);
        setSecretClickCount(0);
      }, 10000);

      setSecretClickCount(0);
    } else {
      setTimeout(() => {
        if (!dancingPlant) {
          setSecretClickCount(0);
        }
      }, 800);
    }
  };

  // Generate whispers based on plant type and season
  const generatePlantWhispers = (type: string, currentSeason: Season): string[] => {
    const generalWhispers = [
      "Thank you for tending...", "The soil sings...", 
      "Magic flows...", "We grow strong..."
    ];
    
    const seasonalWhispers: Record<Season, string[]> = {
      'Spring': ["New beginnings...", "Spring rain nourishes..."],
      'Summer': ["Sun's energy...", "Dancing in breeze..."],
      'Fall': ["Autumn whispers...", "Gathering strength..."],
      'Winter': ["Life stirs beneath...", "Dreaming of spring..."]
    };
    
    const typeWhispers: Record<string, string[]> = {
      'flower': ["Petals hold secrets...", "Reflecting colors..."],
      'herb': ["Essence holds power...", "Ancient wisdom flows..."],
      'mushroom': ["Connecting all below...", "Mycelium shares..."],
      'root': ["Deep growth connects...", "Patience finds strength..."],
      'fruit': ["Sweetness waits...", "Seeds carry future..."]
    };

    const allWhispers = [
      ...generalWhispers,
      ...(seasonalWhispers[currentSeason] || []),
      ...(typeWhispers[type] || [])
    ];
    
    const shuffled = [...allWhispers].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  // Show whispers sequentially
  const startWhispers = (plantWhispers: string[]) => {
    if (plantWhispers.length === 0) return;

    let index = 0;
    let whisperTimeout: NodeJS.Timeout | null = null;
    let hideTimeout: NodeJS.Timeout | null = null;

    const showNextWhisper = () => {
      if (whisperTimeout) clearTimeout(whisperTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);

      if (!dancingPlant) {
        setShowWhisper(false);
        return;
      }

      setCurrentWhisper(plantWhispers[index]);
      setShowWhisper(true);

      hideTimeout = setTimeout(() => {
        setShowWhisper(false);

        index = (index + 1) % plantWhispers.length;
        whisperTimeout = setTimeout(showNextWhisper, 500);
      }, 2000);
    };

    showNextWhisper();
  };

  // Hover effects
  const handleMouseEnter = () => {
    if (!plot.plant && !isLocked) setShowPlantHint(true);
  };
  
  const handleMouseLeave = () => {
    setShowPlantHint(false);
  };

  // Get growth stage for visual representation
  const getGrowthStage = (plant: Plant | null): string => {
    if (!plant || plant.growth === undefined || plant.maxGrowth === undefined) return 'empty';
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
    if (plant.health < 60) return 'fair';
    return 'healthy';
  };

  // Determine moisture level class
  const getMoistureClass = (): string => {
    const moisture = plot.moisture ?? 50;
    if (moisture < 30) return 'dry';
    if (moisture > 80) return 'wet';
    return 'normal';
  };

  // Check if plant needs water
  const needsWater = (plant: Plant | null): boolean => {
    if (!plant || plant.mature) return false;
    return (plot.moisture ?? 50) < 40;
  };

  // Render plant visualization based on growth stage
  const renderPlant = () => {
    if (!plot.plant) return null;

    const growthStage = getGrowthStage(plot.plant);
    const healthClass = getHealthClass(plot.plant);
    const plantCategory = plot.plant.category || 'herb';
    const matureClass = growthStage === 'mature' ? `mature-${plantCategory}` : '';

    return (
      <div
        className={`plant ${healthClass} ${dancingPlant ? 'dancing-plant' : ''}`}
        onDoubleClick={handleSecretClick}
      >
        <div className={`${growthStage}-visual ${matureClass}`}>
          {growthStage === 'growing' && <><div></div><div></div></>}
          {growthStage === 'maturing' && <><div></div><div></div><div></div><div></div></>}
          {matureClass === 'mature-flower' && <><div></div><div></div><div></div><div></div></>}
        </div>

        {plot.plant.moonBlessed && <div className="moon-blessing-effect" title="Moon Blessed"></div>}

        {dancingPlant && (
          <div className="dancing-plant-effects">
            <div className={`spirit-element spirit-${spiritType}`}></div>
            <div className={`spirit-element spirit-${spiritType} delay-1`}></div>
            <div className={`spirit-element spirit-${spiritType} delay-2`}></div>
            <div className="garden-particle particle-1"></div>
            <div className="garden-particle particle-2"></div>
            <div className="garden-particle particle-3"></div>
            
            {showWhisper && (
              <div className="plant-whisper-bubble">
                <div className="whisper-text">{currentWhisper}</div>
              </div>
            )}
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
            className="status-icon ready-to-harvest"
            title="Ready to Harvest"
            style={{ animation: showHarvestGlow ? 'harvestPulseIcon 1.5s infinite' : 'none' }}
          >✓</div>
        )}
        {needsWater(plot.plant) && (
          <div className="status-icon needs-water" title="Needs Water">💧</div>
        )}
        {!plot.plant && !isLocked && (
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
    season.toLowerCase(),
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
        <div className="locked-overlay"><div className="lock-icon">🔒</div></div>
      ) : (
        <>
          <div className="plot-soil"></div>
          {renderPlant()}
          {renderPlotStatus()}
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