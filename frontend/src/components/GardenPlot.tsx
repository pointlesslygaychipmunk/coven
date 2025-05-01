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
  
  // Enhanced Easter Egg: Whispering Garden
  const [dancingPlant, setDancingPlant] = useState<boolean>(false);
  const [, setSecretClickCount] = useState<number>(0);
  const [spiritType, setSpiritType] = useState<string>('');
  const [, setPlantWhispers] = useState<string[]>([]);
  const [showWhisper, setShowWhisper] = useState<boolean>(false);
  const [currentWhisper, setCurrentWhisper] = useState<string>('');

  // Determine if the plot is locked (explicitly false means locked)
  const isLocked = plot.isUnlocked === false;

  // Fix for useEffect return value warning in GardenPlot.tsx
  useEffect(() => {
    if (plot.plant?.mature) {
      const glowInterval = setInterval(() => {
        setShowHarvestGlow(prev => !prev);
      }, 3000);
      
      return () => clearInterval(glowInterval);
    }
    
    // Add a return function for the case when there's no mature plant
    return () => {}; // Empty function to satisfy TypeScript
  }, [plot.plant?.mature]);

  // Easter Egg: Secret click handler for dancing plants and whispers
  const handleSecretClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger the regular onClick
    
    if (isLocked || !plot.plant) return;
    
    setSecretClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) { // After 3 rapid clicks on a plant
        // Activate the dancing plant
        setDancingPlant(true);
        
        // Determine spirit type based on plant category
        const category = plot.plant?.category || '';
        let type = 'general';
        
        if (category.includes('flower')) {
          type = 'flower';
        } else if (category.includes('herb')) {
          type = 'herb';
        } else if (category.includes('mushroom')) {
          type = 'mushroom';
        } else if (category.includes('root')) {
          type = 'root';
        } else if (category.includes('fruit')) {
          type = 'fruit';
        }
        
        setSpiritType(type);
        
        // Generate specific whispers based on plant type
        const whispers = generatePlantWhispers(type, season);
        setPlantWhispers(whispers);
        
        // Start showing whispers
        startWhispers(whispers);
        
        console.log(`✨ The ${category} plant is dancing! ✨`);
        
        // Reset counter after activating
        setTimeout(() => {
          setDancingPlant(false);
          setShowWhisper(false);
          return 0;
        }, 10000); // Garden dance lasts for 10 seconds
        return 0;
      }
      return newCount;
    });
    
    // Reset counter after 1 second of inactivity
    setTimeout(() => {
      setSecretClickCount(0);
    }, 1000);
  };

  // Helper function to generate plant whispers based on type and season
  const generatePlantWhispers = (type: string, currentSeason: Season): string[] => {
    const generalWhispers = [
      "Thank you for tending to me...",
      "The soil feels just right today...",
      "I feel the magic in your touch...",
      "We grow stronger with your care..."
    ];
    
    const seasonalWhispers: Record<Season, string[]> = {
      'Spring': [
        "New beginnings are always refreshing...",
        "I can feel myself reaching for the light...",
        "The spring rain nourishes my roots...",
        "Such a pleasure to stretch after winter's sleep..."
      ],
      'Summer': [
        "The summer sun fills me with energy...",
        "My leaves are dancing in the warm breeze...",
        "I'm basking in nature's warmth...",
        "Long days are perfect for growing strong..."
      ],
      'Fall': [
        "The autumn air carries ancient whispers...",
        "I'm gathering my strength as days grow shorter...",
        "A gentle transformation is upon us...",
        "The cycle continues, ever changing..."
      ],
      'Winter': [
        "Even in winter, life stirs beneath the snow...",
        "I dream of spring while resting in the cold...",
        "Stillness holds its own kind of magic...",
        "The quiet months allow for reflection..."
      ]
    };
    
    const typeWhispers: Record<string, string[]> = {
      'flower': [
        "My petals hold secrets of beauty and love...",
        "I reflect the colors of your emotions...",
        "Bees and butterflies are my dearest friends...",
        "My fragrance carries messages on the wind..."
      ],
      'herb': [
        "My essence holds healing powers...",
        "Ancient wisdom flows through my veins...",
        "I can transform your potions with my touch...",
        "The smallest leaves often hold the strongest magic..."
      ],
      'mushroom': [
        "We connect all things underground...",
        "The mycelium network shares your secrets...",
        "From decay comes new understanding...",
        "We've been here longer than you might think..."
      ],
      'root': [
        "Deep we grow, connected to earth's heart...",
        "Patient strength comes from hidden places...",
        "We anchor magic to the physical world...",
        "The foundation is always most important..."
      ],
      'fruit': [
        "Sweetness comes to those who wait...",
        "I transform sunlight into nourishment...",
        "My seeds carry future generations...",
        "The cycle of giving continues through me..."
      ]
    };
    
    // Combine general, seasonal and type-specific whispers
    const allWhispers = [
      ...generalWhispers,
      ...(seasonalWhispers[currentSeason] || []),
      ...(typeWhispers[type] || [])
    ];
    
    // Shuffle and return a few whispers
    return shuffleArray(allWhispers).slice(0, 5);
  };
  
  // Helper to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Start showing whispers sequentially
  const startWhispers = (whispers: string[]) => {
    if (whispers.length === 0) return;
    
    let index = 0;
    const showNextWhisper = () => {
      setCurrentWhisper(whispers[index]);
      setShowWhisper(true);
      
      // Hide after 2 seconds and show next
      setTimeout(() => {
        setShowWhisper(false);
        
        // Show next whisper after a short pause
        setTimeout(() => {
          index = (index + 1) % whispers.length;
          if (dancingPlant) { // Only continue if still dancing
            showNextWhisper();
          }
        }, 500);
      }, 2000);
    };
    
    showNextWhisper();
  };

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
      <div 
        className={`plant ${healthClass} ${dancingPlant ? 'dancing-plant' : ''}`}
        onDoubleClick={handleSecretClick}
      >
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
        
        {/* Enhanced Easter Egg: Plant whispers and dancing animation */}
        {dancingPlant && (
          <div className="dancing-plant-effects">
            {/* Floating spirit elements based on plant type */}
            <div className={`spirit-element spirit-${spiritType}`}></div>
            <div className={`spirit-element spirit-${spiritType} delay-1`}></div>
            <div className={`spirit-element spirit-${spiritType} delay-2`}></div>
            
            {/* Gentle particle effects */}
            <div className="garden-particle particle-1"></div>
            <div className="garden-particle particle-2"></div>
            <div className="garden-particle particle-3"></div>
            <div className="garden-particle particle-4"></div>
            <div className="garden-particle particle-5"></div>
            
            {/* Whisper bubble that shows each message */}
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
      
      {/* Styles for the enhanced dancing plants and whispers */}
      <style>
        {`
          .dancing-plant {
            animation: gentleDance 3s infinite alternate ease-in-out;
            transform-origin: bottom center;
          }
          
          .dancing-plant-effects {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: visible;
          }
          
          .spirit-element {
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            opacity: 0;
            filter: blur(1px);
            animation: spiritFloat 7s infinite alternate ease-in-out;
          }
          
          .spirit-flower {
            background: radial-gradient(circle, rgba(255,182,233,0.8) 0%, rgba(255,182,233,0.1) 70%);
            box-shadow: 0 0 10px rgba(255,182,233,0.6);
          }
          
          .spirit-herb {
            background: radial-gradient(circle, rgba(172,255,189,0.8) 0%, rgba(172,255,189,0.1) 70%);
            box-shadow: 0 0 10px rgba(172,255,189,0.6);
          }
          
          .spirit-root {
            background: radial-gradient(circle, rgba(210,180,140,0.8) 0%, rgba(210,180,140,0.1) 70%);
            box-shadow: 0 0 10px rgba(210,180,140,0.6);
          }
          
          .spirit-mushroom {
            background: radial-gradient(circle, rgba(230,190,255,0.8) 0%, rgba(230,190,255,0.1) 70%);
            box-shadow: 0 0 10px rgba(230,190,255,0.6);
          }
          
          .spirit-fruit {
            background: radial-gradient(circle, rgba(255,200,120,0.8) 0%, rgba(255,200,120,0.1) 70%);
            box-shadow: 0 0 10px rgba(255,200,120,0.6);
          }
          
          .spirit-general {
            background: radial-gradient(circle, rgba(220,240,255,0.8) 0%, rgba(220,240,255,0.1) 70%);
            box-shadow: 0 0 10px rgba(220,240,255,0.6);
          }
          
          .delay-1 {
            animation-delay: 1.5s;
          }
          
          .delay-2 {
            animation-delay: 3s;
          }
          
          .garden-particle {
            position: absolute;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: rgba(255, 255, 240, 0.8);
            box-shadow: 0 0 5px rgba(255, 255, 200, 0.6);
            opacity: 0;
            animation: particleRise 4s infinite ease-out;
          }
          
          .particle-1 {
            left: 30%;
            bottom: 10%;
            animation-delay: 0s;
          }
          
          .particle-2 {
            left: 60%;
            bottom: 15%;
            animation-delay: 0.7s;
          }
          
          .particle-3 {
            left: 45%;
            bottom: 5%;
            animation-delay: 1.4s;
          }
          
          .particle-4 {
            left: 70%;
            bottom: 20%;
            animation-delay: 2.1s;
          }
          
          .particle-5 {
            left: 20%;
            bottom: 25%;
            animation-delay: 2.8s;
          }
          
          .plant-whisper-bubble {
            position: absolute;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 12px;
            padding: 6px 10px;
            box-shadow: 0 0 8px rgba(100, 100, 100, 0.2);
            animation: bubbleAppear 0.5s ease-out forwards;
            max-width: 180px;
            z-index: 10;
          }
          
          .plant-whisper-bubble:after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid rgba(255, 255, 255, 0.9);
          }
          
          .whisper-text {
            font-family: "Times New Roman", serif;
            font-size: 12px;
            font-style: italic;
            color: #4c3a69;
            text-align: center;
          }
          
          @keyframes gentleDance {
            0% { transform: rotate(-2deg) translateY(0); }
            25% { transform: rotate(0deg) translateY(-2px); }
            50% { transform: rotate(2deg) translateY(0); }
            75% { transform: rotate(0deg) translateY(-1px); }
            100% { transform: rotate(-2deg) translateY(0); }
          }
          
          @keyframes spiritFloat {
            0% { opacity: 0; transform: translateY(0) scale(1) rotate(0deg); }
            20% { opacity: 0.8; }
            50% { opacity: 0.6; transform: translateY(-30px) scale(1.2) rotate(10deg); }
            80% { opacity: 0.8; }
            100% { opacity: 0; transform: translateY(-50px) scale(0.8) rotate(-10deg); }
          }
          
          @keyframes particleRise {
            0% { opacity: 0; transform: translateY(0) scale(1); }
            10% { opacity: 0.8; }
            80% { opacity: 0.6; }
            100% { opacity: 0; transform: translateY(-40px) scale(0.2); }
          }
          
          @keyframes bubbleAppear {
            0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
            100% { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default GardenPlot;