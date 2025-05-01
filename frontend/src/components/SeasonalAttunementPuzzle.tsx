import React, { useState, useEffect } from 'react';
import './SeasonalAttunementPuzzle.css';
import { Season } from 'coven-shared';

// Element types that match the seasonal elements
type ElementType = 'water' | 'fire' | 'earth' | 'air' | 'spirit';

// Define seasonal resources that players can gather
interface Resource {
  type: string;
  name: string;
  icon: string;
  value: number;
  bonusEffect: string;
}

// Define element properties
interface Element {
  id: ElementType;
  name: string;
  icon: string;
  counter: ElementType;
  boostedBy: ElementType;
  seasonalBonus: Season;
}

interface SeasonalAttunementPuzzleProps {
  onComplete: (result: { success: boolean; bonus: number; message: string }) => void;
  onSkip: () => void;
  season: Season;
}

const SeasonalAttunementPuzzle: React.FC<SeasonalAttunementPuzzleProps> = ({
  onComplete,
  onSkip,
  season = 'Spring'
}) => {
  // Game state
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [maxTurns, setMaxTurns] = useState<number>(8);
  const [message, setMessage] = useState<string>('Balance the elements to attune your garden...');
  
  // Resource and element tracking
  const [playerResources, setPlayerResources] = useState<Resource[]>([]);
  const [boardElements, setBoardElements] = useState<ElementType[][]>([]);
  const boardSize = 3; // 3x3 grid
  const [elementBalance, setElementBalance] = useState<Record<ElementType, number>>({
    water: 0,
    fire: 0,
    earth: 0,
    air: 0,
    spirit: 0
  });
  
  // Define the elements and their relationships
  const elements: Element[] = [
    { 
      id: 'water', 
      name: 'Water', 
      icon: '💧', 
      counter: 'fire',  // Water puts out fire
      boostedBy: 'air', // Air boosts water
      seasonalBonus: 'Winter' 
    },
    { 
      id: 'fire', 
      name: 'Fire', 
      icon: '🔥', 
      counter: 'air',   // Fire consumes air
      boostedBy: 'earth', // Earth boosts fire
      seasonalBonus: 'Summer' 
    },
    { 
      id: 'earth', 
      name: 'Earth', 
      icon: '🌱', 
      counter: 'water', // Earth absorbs water
      boostedBy: 'spirit', // Spirit boosts earth
      seasonalBonus: 'Spring' 
    },
    { 
      id: 'air', 
      name: 'Air', 
      icon: '💨', 
      counter: 'earth', // Air erodes earth
      boostedBy: 'water', // Water boosts air
      seasonalBonus: 'Fall' 
    },
    { 
      id: 'spirit', 
      name: 'Spirit', 
      icon: '✨', 
      counter: 'spirit', // Spirit is self-balancing
      boostedBy: 'fire', // Fire boosts spirit
      seasonalBonus: 'Spring' // Spirit has affinity with spring
    }
  ];
  
  // Define possible resources
  const possibleResources: Resource[] = [
    { type: 'moonlight', name: 'Moonlight', icon: '🌙', value: 1, bonusEffect: 'Plant quality +5%' },
    { type: 'dewdrops', name: 'Dewdrops', icon: '💦', value: 1, bonusEffect: 'Moisture retention +5%' },
    { type: 'vitality', name: 'Vitality', icon: '💖', value: 1, bonusEffect: 'Growth speed +5%' },
    { type: 'fertility', name: 'Fertility', icon: '🌿', value: 1, bonusEffect: 'Soil quality +5%' },
    { type: 'harmony', name: 'Harmony', icon: '☯️', value: 2, bonusEffect: 'All plant stats +2%' },
  ];
  
  // Initialize the board
  useEffect(() => {
    initializeGame();
  }, [season]);
  
  // Initialize the game
  const initializeGame = () => {
    // Reset game state
    setGameActive(false);
    setGameComplete(false);
    setTurnCount(0);
    setMaxTurns(8); // Default to 8 turns
    setPlayerResources([]);
    
    // Reset element balance
    setElementBalance({
      water: 0,
      fire: 0,
      earth: 0,
      air: 0,
      spirit: 0
    });
    
    // Create a board with randomly placed elements
    // We'll create a 3x3 grid for simplicity
    const newBoard: ElementType[][] = [];
    for (let i = 0; i < boardSize; i++) {
      const row: ElementType[] = [];
      for (let j = 0; j < boardSize; j++) {
        // Place random elements, but ensure some bias toward the current season
        const randomChance = Math.random();
        let elementType: ElementType;
        
        if (randomChance < 0.4) {
          // 40% chance to place a seasonal element
          elementType = getSeasonalElement(season);
        } else {
          // 60% chance for any random element
          const randomIndex = Math.floor(Math.random() * elements.length);
          elementType = elements[randomIndex].id;
        }
        
        row.push(elementType);
      }
      newBoard.push(row);
    }
    
    setBoardElements(newBoard);
    
    // Set message based on season
    switch (season) {
      case 'Spring':
        setMessage('Spring calls for growth and renewal. Balance the elements...');
        break;
      case 'Summer':
        setMessage('Summer sun strengthens your garden. Harness the elements...');
        break;
      case 'Fall':
        setMessage('Fall brings transformation. Redirect the elements...');
        break;
      case 'Winter':
        setMessage('Winter requires conservation. Preserve the elements...');
        break;
      default:
        setMessage('Balance the elements to attune your garden...');
    }
  };
  
  // Get the element type most associated with the current season
  const getSeasonalElement = (currentSeason: Season): ElementType => {
    const seasonalElement = elements.find(elem => elem.seasonalBonus === currentSeason);
    return seasonalElement ? seasonalElement.id : 'spirit'; // Default to spirit if no match
  };
  
  // Start the game
  const startGame = () => {
    setGameActive(true);
    
    // Give player starting resources based on season
    const startingResources: Resource[] = [];
    
    // Different seasons provide different starting resources
    switch (season) {
      case 'Spring':
        startingResources.push({...possibleResources[2]}); // Vitality
        break;
      case 'Summer':
        startingResources.push({...possibleResources[3]}); // Fertility
        break;
      case 'Fall':
        startingResources.push({...possibleResources[0]}); // Moonlight
        break;
      case 'Winter':
        startingResources.push({...possibleResources[1]}); // Dewdrops
        break;
    }
    
    setPlayerResources(startingResources);
    setMessage('Select elements to balance them. Each selection uses one turn.');
  };
  
  // Handle element selection on the board
  const handleElementSelect = (row: number, col: number) => {
    if (!gameActive || gameComplete) return;
    
    const selectedElementType = boardElements[row][col];
    
    // Update element balance based on selection
    const newBalance = {...elementBalance};
    newBalance[selectedElementType] += 1;
    
    // Find what this element counters and reduces
    const elementData = elements.find(e => e.id === selectedElementType);
    if (elementData) {
      // Reduce the countered element
      if (newBalance[elementData.counter] > 0) {
        newBalance[elementData.counter] -= 1;
      }
      
      // Check if there are seasonal bonuses
      if (elementData.seasonalBonus === season) {
        // Get a random resource as bonus
        const randomResourceIndex = Math.floor(Math.random() * possibleResources.length);
        const resourceGained = {...possibleResources[randomResourceIndex]};
        
        // Add resource to player's collection
        setPlayerResources(prev => [...prev, resourceGained]);
        
        setMessage(`You gained ${resourceGained.name} (${resourceGained.icon}) from the ${elementData.name} element!`);
      } else {
        setMessage(`${elementData.name} element selected. Balance shifting...`);
      }
    }
    
    setElementBalance(newBalance);
    
    // Replace the selected cell with a new random element
    const newBoard = [...boardElements];
    const randomIndex = Math.floor(Math.random() * elements.length);
    newBoard[row][col] = elements[randomIndex].id;
    setBoardElements(newBoard);
    
    // Increment turn counter
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);
    
    // Check if game should end
    if (newTurnCount >= maxTurns) {
      endGame();
    }
  };
  
  // End the game and calculate results
  const endGame = () => {
    setGameComplete(true);
    
    // Calculate total bonus based on element balance and resources
    let bonus = 0;
    
    // Check element balance - we want elements to be as equal as possible
    // Perfect balance would be all elements at the same level
    let totalBalance = 0;
    let elementVariance = 0;
    
    Object.values(elementBalance).forEach(value => {
      totalBalance += value;
    });
    
    // Calculate average balance
    const averageBalance = totalBalance / Object.keys(elementBalance).length;
    
    // Calculate variance (how far from perfect balance)
    Object.values(elementBalance).forEach(value => {
      elementVariance += Math.abs(value - averageBalance);
    });
    
    // Bonus is higher for better balance (lower variance)
    const balanceBonus = Math.max(0, 30 - (elementVariance * 5));
    
    // Add resource bonuses
    const resourceBonus = playerResources.reduce((total, resource) => total + resource.value, 0) * 5;
    
    // Total bonus
    bonus = balanceBonus + resourceBonus;
    
    // Seasonal multiplier
    const seasonalMultiplier = getSeasonalMultiplier();
    const finalBonus = Math.round(bonus * seasonalMultiplier);
    
    // Show results
    if (finalBonus > 20) {
      setMessage(`Perfect attunement! The garden resonates with the ${season}! +${finalBonus}% bonus.`);
    } else if (finalBonus > 10) {
      setMessage(`Good attunement. The garden accepts your work. +${finalBonus}% bonus.`);
    } else {
      setMessage(`Minimal attunement achieved. The garden is stable. +${finalBonus}% bonus.`);
    }
    
    // Pass results back
    setTimeout(() => {
      onComplete({
        success: true,
        bonus: finalBonus,
        message: `Garden attuned to ${season} energies. Bonus: +${finalBonus}%`
      });
    }, 3000);
  };
  
  // Get seasonal multiplier for bonus calculations
  const getSeasonalMultiplier = (): number => {
    // Check how well the dominant element matches the season
    const dominantElement = Object.entries(elementBalance).sort((a, b) => b[1] - a[1])[0][0] as ElementType;
    const matchingElement = elements.find(e => e.id === dominantElement);
    
    if (matchingElement && matchingElement.seasonalBonus === season) {
      return 1.5; // 50% bonus for perfect seasonal match
    }
    
    return 1.0; // No multiplier otherwise
  };
  
  // Skip puzzle
  const handleSkip = () => {
    onSkip();
  };
  
  // Use a resource
  const useResource = (resourceIndex: number) => {
    if (!gameActive || gameComplete) return;
    
    const resource = playerResources[resourceIndex];
    let newResources = [...playerResources];
    newResources.splice(resourceIndex, 1);
    setPlayerResources(newResources);
    
    // Apply resource effect
    switch (resource.type) {
      case 'moonlight':
        // Grant an extra turn
        setMaxTurns(maxTurns + 1);
        setMessage(`Used ${resource.name}! Gained an extra turn.`);
        break;
      case 'dewdrops':
        // Balance water element
        const newWaterBalance = {...elementBalance, water: elementBalance.water + 2};
        setElementBalance(newWaterBalance);
        setMessage(`Used ${resource.name}! Water element strengthened.`);
        break;
      case 'vitality':
        // Balance all elements slightly
        const vitalityBalance = {...elementBalance};
        Object.keys(vitalityBalance).forEach(key => {
          vitalityBalance[key as ElementType] += 1;
        });
        setElementBalance(vitalityBalance);
        setMessage(`Used ${resource.name}! All elements strengthened.`);
        break;
      case 'fertility':
        // Get another random resource
        const randomIndex = Math.floor(Math.random() * possibleResources.length);
        const newResource = {...possibleResources[randomIndex]};
        setPlayerResources([...newResources, newResource]);
        setMessage(`Used ${resource.name}! Gained ${newResource.name}.`);
        break;
      case 'harmony':
        // Perfect balance on a random element
        const elemKeys = Object.keys(elementBalance) as ElementType[];
        const randomElem = elemKeys[Math.floor(Math.random() * elemKeys.length)];
        const highestValue = Math.max(...Object.values(elementBalance));
        const harmonyBalance = {...elementBalance};
        harmonyBalance[randomElem] = highestValue;
        setElementBalance(harmonyBalance);
        setMessage(`Used ${resource.name}! ${elements.find(e => e.id === randomElem)?.name} element harmonized.`);
        break;
    }
  };
  
  // Render the game board
  const renderGameBoard = () => {
    return (
      <div className="game-board">
        {boardElements.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="board-row">
            {row.map((elementType, colIndex) => {
              const elementData = elements.find(e => e.id === elementType);
              return (
                <button
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`board-cell ${elementType} ${elementData?.seasonalBonus === season ? 'seasonal-bonus' : ''}`}
                  onClick={() => handleElementSelect(rowIndex, colIndex)}
                  disabled={!gameActive || gameComplete}
                >
                  <span className="element-icon">{elementData?.icon}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
  
  // Render element balance meters
  const renderElementBalance = () => {
    return (
      <div className="element-balance">
        <h3>Element Balance</h3>
        <div className="balance-meters">
          {elements.map(element => (
            <div key={element.id} className={`balance-meter ${element.id}`}>
              <div className="meter-label">
                <span className="element-icon">{element.icon}</span>
                <span className="element-value">{elementBalance[element.id]}</span>
              </div>
              <div className="meter-bar">
                <div 
                  className="meter-fill"
                  style={{width: `${Math.min(100, elementBalance[element.id] * 20)}%`}}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render player resources
  const renderResources = () => {
    return (
      <div className="player-resources">
        <h3>Resources</h3>
        <div className="resource-list">
          {playerResources.length > 0 ? (
            playerResources.map((resource, index) => (
              <button
                key={`resource-${index}`}
                className="resource-item"
                onClick={() => useResource(index)}
                disabled={!gameActive || gameComplete}
                title={`${resource.name}: ${resource.bonusEffect}`}
              >
                <span className="resource-icon">{resource.icon}</span>
                <span className="resource-name">{resource.name}</span>
              </button>
            ))
          ) : (
            <div className="no-resources">No resources yet</div>
          )}
        </div>
      </div>
    );
  };
  
  // Render game information
  const renderGameInfo = () => {
    return (
      <div className="game-info">
        <div className="turn-counter">
          <span>Turn</span>
          <span className="turn-value">{turnCount} / {maxTurns}</span>
        </div>
        
        <div className="season-effect">
          <span className="season-icon">
            {season === 'Spring' ? '🌱' : 
             season === 'Summer' ? '☀️' : 
             season === 'Fall' ? '🍂' : '❄️'}
          </span>
          <span className="season-name">{season}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="seasonal-attunement-puzzle">
      <div className="puzzle-container">
        <div className="puzzle-header">
          <h2>Seasonal Attunement</h2>
          <div className="season-badge">{season}</div>
        </div>
        
        <div className="puzzle-message">{message}</div>
        
        {/* Game Info Area */}
        {gameActive && renderGameInfo()}
        
        {/* Main Game Area */}
        <div className={`ritual-circle ${season.toLowerCase()}`}>
          {gameActive && renderGameBoard()}
          
          {gameActive && (
            <div className="game-controls">
              {renderElementBalance()}
              {renderResources()}
            </div>
          )}
          
          {/* Seasonal themed decorations */}
          <div className="seasonal-decorations">
            {season === 'Spring' && (
              <>
                <div className="decoration flower" style={{top: '10%', left: '75%'}}>🌷</div>
                <div className="decoration butterfly" style={{top: '25%', left: '15%'}}>🦋</div>
              </>
            )}
            {season === 'Summer' && (
              <>
                <div className="decoration sun" style={{top: '5%', left: '50%'}}>☀️</div>
                <div className="decoration beach" style={{bottom: '10%', right: '10%'}}>⛱️</div>
              </>
            )}
            {season === 'Fall' && (
              <>
                <div className="decoration leaf1" style={{top: '10%', right: '20%'}}>🍂</div>
                <div className="decoration leaf2" style={{bottom: '20%', left: '15%'}}>🍁</div>
                <div className="decoration mushroom" style={{bottom: '10%', right: '30%'}}>🍄</div>
              </>
            )}
            {season === 'Winter' && (
              <>
                <div className="decoration snow1" style={{top: '10%', left: '20%'}}>❄️</div>
                <div className="decoration snow2" style={{bottom: '20%', right: '25%'}}>❄️</div>
                <div className="decoration sparkle" style={{top: '30%', right: '10%'}}>✨</div>
              </>
            )}
          </div>
        </div>
        
        <div className="puzzle-controls">
          {!gameActive && !gameComplete && (
            <button className="begin-button" onClick={startGame}>Begin Attunement</button>
          )}
          
          {gameActive && !gameComplete && (
            <button className="end-button" onClick={endGame}>Complete Ritual</button>
          )}
          
          <button className="skip-button" onClick={handleSkip}>
            Skip Ritual
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeasonalAttunementPuzzle;