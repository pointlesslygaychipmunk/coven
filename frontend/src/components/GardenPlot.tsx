import React, { useState, useEffect } from 'react';
import './GardenPlot.css';
import { GardenSlot, Plant, Season } from 'coven-shared'; // Use shared types

interface GardenPlotProps {
  plot: GardenSlot;
  selected: boolean;
  onClick: () => void;
  season?: Season; // Optional season property for seasonal styling
  // isWatering prop removed
}

const GardenPlot: React.FC<GardenPlotProps> = ({
  plot,
  selected,
  onClick,
  season = 'Spring', // Default to Spring if not provided
}) => {
  // State for animations and effects
  const [showHarvestGlow, setShowHarvestGlow] = useState<boolean>(false);
  const [showPlantHint, setShowPlantHint] = useState<boolean>(false);

  // Enhanced Easter Egg: Whispering Garden
  const [dancingPlant, setDancingPlant] = useState<boolean>(false);
  const [secretClickCount, setSecretClickCount] = useState<number>(0);
  const [spiritType, setSpiritType] = useState<string>(''); // For visual effect variation
  const [, setPlantWhispers] = useState<string[]>([]); // Store generated whispers
  const [showWhisper, setShowWhisper] = useState<boolean>(false); // Controls bubble visibility
  const [currentWhisper, setCurrentWhisper] = useState<string>(''); // Text in the bubble

  // Determine if the plot is locked (explicitly false means locked)
  const isLocked = plot.isUnlocked === false;

  // Effect for harvest glow (only runs when plot.plant.mature changes)
  useEffect(() => {
    let glowInterval: NodeJS.Timeout | null = null;
    if (plot.plant?.mature) {
      // Start glow effect
      glowInterval = setInterval(() => {
        setShowHarvestGlow(prev => !prev);
      }, 1500); // Slower pulse for harvest glow
    } else {
      setShowHarvestGlow(false); // Ensure glow is off if not mature
    }

    // Cleanup function
    return () => {
      if (glowInterval) clearInterval(glowInterval);
    };
  }, [plot.plant?.mature]); // Rerun only when maturity changes

  // Easter Egg: Secret click handler for dancing plants and whispers
  const handleSecretClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger the regular onClick

    if (isLocked || !plot.plant || !plot.plant.mature) return; // Only mature plants whisper

    const newCount = secretClickCount + 1;
    setSecretClickCount(newCount);

    if (newCount >= 3) { // After 3 rapid clicks on a mature plant
        console.log(`✨ Whispering Garden triggered for ${plot.plant.name}! ✨`);
      // Activate the dancing plant
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

      // Generate specific whispers based on plant type and season
      const whispers = generatePlantWhispers(type, season);
      setPlantWhispers(whispers); // Store whispers

      // Start showing whispers
      startWhispers(whispers);

      // Reset counter and effects after a duration
      setTimeout(() => {
        setDancingPlant(false);
        setShowWhisper(false); // Ensure whisper bubble is hidden
        setSecretClickCount(0); // Reset counter fully
      }, 10000); // Garden dance/whisper lasts for 10 seconds

      setSecretClickCount(0); // Reset immediately after triggering
    } else {
      // Reset counter if clicks are too slow
      setTimeout(() => {
        // Only reset if the effect wasn't triggered
        if (!dancingPlant) {
            setSecretClickCount(0);
        }
      }, 800); // Reset after 0.8 seconds of inactivity
    }
  };

   // Helper function to generate plant whispers based on type and season
   const generatePlantWhispers = (type: string, currentSeason: Season): string[] => {
     const generalWhispers = [
       "Thank you for tending...", "The soil sings...", "Magic flows...", "We grow strong..."
     ];
     const seasonalWhispers: Record<Season, string[]> = {
       'Spring': ["New beginnings...", "Reaching for light...", "Spring rain nourishes...", "Stretching awake..."],
       'Summer': ["Sun's energy...", "Dancing in breeze...", "Basking in warmth...", "Long days grow..."],
       'Fall': ["Autumn whispers...", "Gathering strength...", "Gentle transformation...", "The cycle continues..."],
       'Winter': ["Life stirs beneath...", "Dreaming of spring...", "Stillness holds magic...", "Quiet reflection..."]
     };
     const typeWhispers: Record<string, string[]> = {
       'flower': ["Petals hold secrets...", "Reflecting colors...", "Bees are friends...", "Fragrance messages..."],
       'herb': ["Essence holds power...", "Ancient wisdom flows...", "Transform potions...", "Small leaves, strong magic..."],
       'mushroom': ["Connecting all below...", "Mycelium shares...", "From decay, understanding...", "We are ancient..."],
       'root': ["Deep growth connects...", "Patience finds strength...", "Anchoring magic...", "Foundation matters..."],
       'fruit': ["Sweetness waits...", "Sunlight to nourishment...", "Seeds carry future...", "Giving continues..."]
     };

     const allWhispers = [
       ...generalWhispers,
       ...(seasonalWhispers[currentSeason] || []),
       ...(typeWhispers[type] || [])
     ];
     // Shuffle and pick a few
     const shuffled = [...allWhispers].sort(() => 0.5 - Math.random());
     return shuffled.slice(0, 4 + Math.floor(Math.random() * 3)); // 4-6 whispers
   };

   // Start showing whispers sequentially
   const startWhispers = (whispers: string[]) => {
       if (whispers.length === 0) return;

       let index = 0;
       let whisperTimeout: NodeJS.Timeout | null = null;
       let hideTimeout: NodeJS.Timeout | null = null;

       const showNextWhisper = () => {
           // Clear previous timeouts
           if (whisperTimeout) clearTimeout(whisperTimeout);
           if (hideTimeout) clearTimeout(hideTimeout);

           // Check if still dancing before showing next
           if (!dancingPlant) {
               setShowWhisper(false);
               return;
           }

           setCurrentWhisper(whispers[index]);
           setShowWhisper(true);

           // Hide current whisper after duration
           hideTimeout = setTimeout(() => {
               setShowWhisper(false);

               // Schedule next whisper after a pause
               index = (index + 1) % whispers.length; // Loop through whispers
               whisperTimeout = setTimeout(showNextWhisper, 500); // Pause between whispers

           }, 2000); // Whisper visible for 2 seconds
       };

       showNextWhisper(); // Start the sequence
   };

  // Show plant hint when hovering on empty plot
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

  // Determine if needs water icon should show
  const needsWater = (plant: Plant | null): boolean => {
    if (!plant || plant.mature) return false;
    return (plot.moisture ?? 50) < 40;
  };

  // Render plant visualization based on growth stage and category
  const renderPlant = () => {
    if (!plot.plant) return null;

    const growthStage = getGrowthStage(plot.plant);
    const healthClass = getHealthClass(plot.plant);
    const plantCategory = plot.plant.category || 'herb'; // Default if category missing

    // Map category to specific class for mature visuals
    const matureClass = growthStage === 'mature' ? `mature-${plantCategory}` : '';

    return (
      <div
        className={`plant ${healthClass} ${dancingPlant ? 'dancing-plant' : ''}`}
        onDoubleClick={handleSecretClick} // Use double click for the easter egg
      >
        {/* Base Visual Element based on growth stage */}
        <div className={`${growthStage}-visual ${matureClass}`}>
          {/* Add extra divs for more complex CSS shapes if needed, e.g., for growing stage */}
           {growthStage === 'growing' && <><div></div><div></div></>}
           {growthStage === 'maturing' && <><div></div><div></div><div></div><div></div></>}
           {/* Add divs for complex mature flowers */}
           {matureClass === 'mature-flower' && <><div></div><div></div><div></div><div></div></>}
        </div>

        {/* Moon blessing visual effect */}
        {plot.plant.moonBlessed && <div className="moon-blessing-effect" title="Moon Blessed"></div>}

        {/* Enhanced Easter Egg: Whispers and Effects */}
        {dancingPlant && (
          <div className="dancing-plant-effects">
            {/* Floating spirit elements */}
            <div className={`spirit-element spirit-${spiritType}`}></div>
            <div className={`spirit-element spirit-${spiritType} delay-1`}></div>
            <div className={`spirit-element spirit-${spiritType} delay-2`}></div>
            {/* Gentle particle effects */}
            <div className="garden-particle particle-1"></div>
            <div className="garden-particle particle-2"></div>
            <div className="garden-particle particle-3"></div>
            {/* Whisper bubble */}
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
    season.toLowerCase(), // Add season class
    // isWatering removed
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

       {/* Inline Styles for the Easter Egg - More complex animations */}
       <style>{`
         .dancing-plant > div { /* Apply animation to the visual element */
           animation: ${dancingPlant ? 'gentleDance 3s infinite alternate ease-in-out' : 'none'};
           transform-origin: bottom center;
         }
         .dancing-plant-effects {
           position: absolute; top: 0; left: 0; width: 100%; height: 100%;
           pointer-events: none; overflow: visible; z-index: 10;
         }
         .spirit-element {
           position: absolute; width: 15px; height: 15px; border-radius: 50%; opacity: 0;
           filter: blur(1px); animation: ${dancingPlant ? 'spiritFloat 7s infinite ease-in-out' : 'none'};
           box-shadow: 0 0 8px;
         }
         .spirit-flower { background: radial-gradient(circle, rgba(255,182,233,0.8) 0%, transparent 70%); box-shadow-color: rgba(255,182,233,0.6); }
         .spirit-herb { background: radial-gradient(circle, rgba(172,255,189,0.8) 0%, transparent 70%); box-shadow-color: rgba(172,255,189,0.6); }
         .spirit-root { background: radial-gradient(circle, rgba(210,180,140,0.8) 0%, transparent 70%); box-shadow-color: rgba(210,180,140,0.6); }
         .spirit-mushroom { background: radial-gradient(circle, rgba(230,190,255,0.8) 0%, transparent 70%); box-shadow-color: rgba(230,190,255,0.6); }
         .spirit-fruit { background: radial-gradient(circle, rgba(255,200,120,0.8) 0%, transparent 70%); box-shadow-color: rgba(255,200,120,0.6); }
         .spirit-general { background: radial-gradient(circle, rgba(220,240,255,0.8) 0%, transparent 70%); box-shadow-color: rgba(220,240,255,0.6); }
         .delay-1 { animation-delay: 1.5s !important; }
         .delay-2 { animation-delay: 3s !important; }
         .garden-particle {
           position: absolute; width: 4px; height: 4px; border-radius: 50%;
           background-color: rgba(255, 255, 240, 0.8); box-shadow: 0 0 3px rgba(255, 255, 200, 0.6);
           opacity: 0; animation: ${dancingPlant ? 'particleRise 4s infinite ease-out' : 'none'};
         }
         .particle-1 { left: 30%; bottom: 10%; animation-delay: 0s; }
         .particle-2 { left: 60%; bottom: 15%; animation-delay: 0.7s; }
         .particle-3 { left: 45%; bottom: 5%; animation-delay: 1.4s; }
         .plant-whisper-bubble {
           position: absolute; top: -35px; left: 50%; transform: translateX(-50%);
           background-color: rgba(244, 233, 217, 0.95); /* Parchment like */
           border-radius: 8px; padding: 4px 8px;
           box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
           animation: bubbleAppear 0.5s ease-out forwards;
           max-width: 150px; z-index: 20; border: 1px solid #a1887f;
         }
         .plant-whisper-bubble:after {
           content: ''; position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
           width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent;
           border-top: 6px solid rgba(244, 233, 217, 0.95);
         }
         .whisper-text {
           font-family: 'Times New Roman', serif; font-size: 11px; font-style: italic;
           color: #5d4037; text-align: center;
         }
         @keyframes gentleDance {
           0% { transform: rotate(-1.5deg) scale(1); } 25% { transform: rotate(0deg) scale(1.02); }
           50% { transform: rotate(1.5deg) scale(1); } 75% { transform: rotate(0deg) scale(1.01); }
           100% { transform: rotate(-1.5deg) scale(1); }
         }
         @keyframes spiritFloat {
           0% { opacity: 0; transform: translateY(0) scale(0.8) rotate(0deg); }
           20% { opacity: 0.7; }
           50% { opacity: 0.5; transform: translateY(-25px) scale(1.1) rotate(15deg); }
           80% { opacity: 0.7; }
           100% { opacity: 0; transform: translateY(-40px) scale(0.6) rotate(-15deg); }
         }
         @keyframes particleRise {
           0% { opacity: 0; transform: translateY(0) scale(1); }
           10% { opacity: 0.8; } 80% { opacity: 0.6; }
           100% { opacity: 0; transform: translateY(-30px) scale(0.2); }
         }
         @keyframes bubbleAppear {
           0% { opacity: 0; transform: translateX(-50%) translateY(5px); }
           100% { opacity: 1; transform: translateX(-50%) translateY(0); }
         }
       `}</style>
    </div>
  );
};

export default GardenPlot;