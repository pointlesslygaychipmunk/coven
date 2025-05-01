import React, { useState, useEffect } from 'react';
import './WateringGame.css';
import { Season } from 'coven-shared';

interface WateringGameProps {
  onComplete: (score: number) => void;
  onSkip: () => void;
  season: Season;
}

// Define water drop types
interface WaterDrop {
  id: number;
  x: number;
  y: number;
  isGolden: boolean;
  speed: number; // Animation speed modifier
  size: number;  // Size modifier (1 = normal)
}

const WateringGame: React.FC<WateringGameProps> = ({ 
  onComplete, 
  onSkip,
  season 
}) => {
  const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([]);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15); // 15 seconds
  const [seasonalEffects, setSeasonalEffects] = useState<{
    dropSpeed: number,
    goldenChance: number,
    evaporationRate: number,
    maxDrops: number
  }>({
    dropSpeed: 1,
    goldenChance: 0.1,
    evaporationRate: 0,
    maxDrops: 6
  });

  // Set seasonal effects
  useEffect(() => {
    switch(season) {
      case 'Summer':
        // Summer: Faster evaporation, higher golden chance
        setSeasonalEffects({
          dropSpeed: 1.2,
          goldenChance: 0.15,
          evaporationRate: 0.8, // Drops disappear faster
          maxDrops: 5
        });
        break;
      case 'Fall':
        // Fall: Windy, drops move more quickly
        setSeasonalEffects({
          dropSpeed: 1.4,
          goldenChance: 0.1,
          evaporationRate: 0.2,
          maxDrops: 6
        });
        break;
      case 'Winter':
        // Winter: Slower drops (frozen), lower golden chance
        setSeasonalEffects({
          dropSpeed: 0.8,
          goldenChance: 0.05,
          evaporationRate: 0.1,
          maxDrops: 4
        });
        break;
      case 'Spring':
      default:
        // Spring: Balanced
        setSeasonalEffects({
          dropSpeed: 1,
          goldenChance: 0.1,
          evaporationRate: 0.2,
          maxDrops: 7
        });
    }
  }, [season]);

  // Generate initial water drops
  useEffect(() => {
    generateInitialDrops();
    
    // Start timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Game over - pass score to parent
          onComplete(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Random drop disappearance effect (evaporation)
    const evaporationTimer = setInterval(() => {
      if (seasonalEffects.evaporationRate > 0 && Math.random() < seasonalEffects.evaporationRate) {
        setWaterDrops(prevDrops => {
          if (prevDrops.length <= 1) return prevDrops;
          // Remove a random non-golden drop
          const nonGoldenDrops = prevDrops.filter(drop => !drop.isGolden);
          if (nonGoldenDrops.length === 0) return prevDrops;
          
          const dropToRemove = nonGoldenDrops[Math.floor(Math.random() * nonGoldenDrops.length)];
          return prevDrops.filter(drop => drop.id !== dropToRemove.id);
        });
      }
    }, 1000);
    
    // Cleanup
    return () => {
      clearInterval(timer);
      clearInterval(evaporationTimer);
    };
  }, [seasonalEffects.evaporationRate]);
  
  // Add new drops periodically
  useEffect(() => {
    const dropInterval = setInterval(() => {
      if (waterDrops.length < seasonalEffects.maxDrops) {
        addNewDrop();
      }
    }, 1500);
    
    return () => clearInterval(dropInterval);
  }, [waterDrops, seasonalEffects.maxDrops]);

  // Generate initial drops
  const generateInitialDrops = () => {
    const initialDrops: WaterDrop[] = [];
    const numDrops = Math.min(5, seasonalEffects.maxDrops);
    
    for (let i = 0; i < numDrops; i++) {
      initialDrops.push(createDrop());
    }
    
    setWaterDrops(initialDrops);
  };
  
  // Create a single drop
  const createDrop = (): WaterDrop => {
    // Chance to create a golden drop
    const isGolden = Math.random() < seasonalEffects.goldenChance;
    
    return {
      id: Date.now() + Math.floor(Math.random() * 1000),
      x: Math.floor(Math.random() * 80) + 10, // 10-90% of width
      y: Math.floor(Math.random() * 70) + 15, // 15-85% of height
      isGolden,
      speed: seasonalEffects.dropSpeed * (0.8 + Math.random() * 0.4),
      size: isGolden ? 1.3 : 1
    };
  };
  
  // Add a new drop
  const addNewDrop = () => {
    if (waterDrops.length < seasonalEffects.maxDrops) {
      setWaterDrops(prev => [...prev, createDrop()]);
    }
  };

  // Handle clicking a water drop
  const handleWaterDropClick = (id: number) => {
    // Find the clicked drop
    const clickedDrop = waterDrops.find(drop => drop.id === id);
    if (!clickedDrop) return;
    
    // Update score - golden drops worth 3 points
    const pointValue = clickedDrop.isGolden ? 3 : 1;
    setScore(prev => prev + pointValue);
    
    // Remove the clicked drop
    setWaterDrops(prev => prev.filter(drop => drop.id !== id));
    
    // Add a new drop
    addNewDrop();
  };

  // Get seasonal background class
  const getSeasonalClass = () => {
    switch(season) {
      case 'Summer': return 'summer-bg';
      case 'Fall': return 'fall-bg';
      case 'Winter': return 'winter-bg';
      case 'Spring': 
      default: return 'spring-bg';
    }
  };

  return (
    <div className={`watering-game-overlay ${getSeasonalClass()}`}>
      <div className="game-hud">
        <div className="game-score">Drops: {score}</div>
        <div className="game-timer">Time: {timeLeft}s</div>
        <div className="season-effect">
          {season === 'Summer' && "Summer: Drops evaporate quickly!"}
          {season === 'Fall' && "Fall: Windy conditions!"}
          {season === 'Winter' && "Winter: Drops move slowly!"}
          {season === 'Spring' && "Spring: Perfect watering conditions!"}
        </div>
      </div>
      
      <div className="game-instruction">
        <span>Click the water drops to water your garden!</span>
        <span className="golden-tip">✨ Golden drops worth 3x! ✨</span>
      </div>
      
      {waterDrops.map(drop => (
        <div 
          key={drop.id}
          className={`water-drop ${drop.isGolden ? 'golden' : ''}`}
          style={{ 
            left: `${drop.x}%`, 
            top: `${drop.y}%`,
            animation: `dropBounce ${2/drop.speed}s infinite alternate`,
            transform: `scale(${drop.size})`,
          }}
          onClick={() => handleWaterDropClick(drop.id)}
        />
      ))}
      
      <button 
        className="game-exit-button"
        onClick={() => onSkip()}
      >
        Skip
      </button>
    </div>
  );
};

export default WateringGame;