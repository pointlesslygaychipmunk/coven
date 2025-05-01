import React, { useState, useEffect, useCallback } from 'react';
// Assuming existing styling from the CSS artifacts

interface SeasonalAttunementPuzzleProps {
  onComplete: (result: { success: boolean; bonus: number; message: string }) => void;
  onSkip: () => void;
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter';
  difficulty?: 'easy' | 'medium' | 'hard';
}

const SeasonalAttunementPuzzle: React.FC<SeasonalAttunementPuzzleProps> = ({
  onComplete,
  onSkip,
  season,
  difficulty = 'medium'
}) => {
  // States for puzzle mechanics
  const [elements, setElements] = useState<string[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30); // 30 seconds
  const [isPaused] = useState<boolean>(false); // No setter needed as we're not changing this state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  
  // Generate elements based on season
  useEffect(() => {
    const generateElements = () => {
      // Each season has specific elements that are more valuable for attunement
      const seasonalElements: Record<string, string[]> = {
        Spring: ['🌱', '🌷', '🌿', '🦋', '🐣', '🌧️', '🌈', '🌤️'],
        Summer: ['☀️', '🌻', '🍉', '🌊', '🏄', '🔥', '🌴', '🦗'],
        Fall: ['🍂', '🍁', '🍄', '🦊', '🎃', '🌰', '🍇', '🦉'],
        Winter: ['❄️', '☃️', '🧣', '🦌', '🌲', '🏔️', '🧊', '🦢']
      };
      
      // Common elements that appear regardless of season (less valuable)
      const commonElements = ['💧', '🪨', '🌙', '⭐', '🔮'];
      
      // Get the current season's elements
      const currentSeasonElements = seasonalElements[season] || seasonalElements.Spring;
      
      // Create a pool of elements based on difficulty
      let pool: string[] = [];
      
      // Add seasonal elements (valuable)
      pool = [...currentSeasonElements];
      
      // Add some off-season elements (less valuable)
      const otherSeasons = Object.keys(seasonalElements).filter(s => s !== season);
      otherSeasons.forEach(otherSeason => {
        const otherElements = seasonalElements[otherSeason];
        // Add fewer elements from other seasons
        pool = [...pool, ...otherElements.slice(0, 2)];
      });
      
      // Add common elements
      pool = [...pool, ...commonElements];
      
      // Shuffle the pool
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      
      // Determine number of elements based on difficulty
      const numElements = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 16 : 20;
      
      // Ensure we have enough elements
      while (shuffled.length < numElements) {
        shuffled.push(...pool.slice(0, numElements - shuffled.length));
      }
      
      // Slice to get desired number of elements
      return shuffled.slice(0, numElements);
    };
    
    setElements(generateElements());
  }, [season, difficulty]);
  
  // Timer effect
  useEffect(() => {
    if (isCompleted || isPaused || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          // Time's up - complete puzzle with current selections
          handleSubmitPuzzle();
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, isPaused, isCompleted]);
  
  // Handle element selection
  const handleElementClick = (element: string) => {
    if (isCompleted) return;
    
    setSelectedElements(prev => {
      if (prev.includes(element)) {
        return prev.filter(e => e !== element);
      } else {
        return [...prev, element];
      }
    });
  };
  
  // Calculate puzzle score
  const calculateScore = useCallback(() => {
    // Each season has specific elements that are valuable
    const seasonalElementValues: Record<string, Record<string, number>> = {
      Spring: { '🌱': 3, '🌷': 3, '🌿': 2, '🦋': 2, '🐣': 2, '🌧️': 2, '🌈': 3, '🌤️': 2 },
      Summer: { '☀️': 3, '🌻': 3, '🍉': 2, '🌊': 2, '🏄': 2, '🔥': 3, '🌴': 2, '🦗': 2 },
      Fall: { '🍂': 3, '🍁': 3, '🍄': 2, '🦊': 2, '🎃': 2, '🌰': 2, '🍇': 3, '🦉': 2 },
      Winter: { '❄️': 3, '☃️': 3, '🧣': 2, '🦌': 2, '🌲': 2, '🏔️': 2, '🧊': 3, '🦢': 2 }
    };
    
    // Common elements worth less, but still positive
    const commonElementValues: Record<string, number> = {
      '💧': 1, '🪨': 1, '🌙': 2, '⭐': 2, '🔮': 1
    };
    
    // Get the current season's element values
    const currentSeasonValues = seasonalElementValues[season] || seasonalElementValues.Spring;
    
    // Calculate total score
    let score = 0;
    let totalElements = 0;
    
    selectedElements.forEach(element => {
      totalElements++;
      
      // Check if it's a seasonal element for the current season
      if (element in currentSeasonValues) {
        score += currentSeasonValues[element];
      } 
      // Check if it's a common element
      else if (element in commonElementValues) {
        score += commonElementValues[element];
      } 
      // Check if it's from another season (negative points)
      else {
        for (const otherSeason in seasonalElementValues) {
          if (otherSeason !== season && element in seasonalElementValues[otherSeason]) {
            score -= 1; // Penalty for using wrong season's elements
            break;
          }
        }
      }
    });
    
    // Bonus for selecting balanced number of elements (not too few, not too many)
    const optimalCount = Math.floor(elements.length / 3);
    if (totalElements >= optimalCount - 1 && totalElements <= optimalCount + 1) {
      score += 2; // Bonus for balance
    }
    
    // Bonus for time left
    const timeBonus = Math.floor(timeLeft / 5);
    score += timeBonus;
    
    return score;
  }, [selectedElements, season, elements.length, timeLeft]);
  
  // Handle submit button
  const handleSubmitPuzzle = () => {
    if (isCompleted) return;
    
    setIsCompleted(true);
    const score = calculateScore();
    
    // Determine success and bonus
    const maxPossibleScore = 20; // Estimate of max score
    const scorePercent = Math.min(100, Math.round((score / maxPossibleScore) * 100));
    const success = score > 0;
    const bonus = Math.max(0, Math.min(100, scorePercent));
    
    // Customize message based on score
    let message = '';
    if (scorePercent >= 90) {
      message = `Perfect attunement! The garden thrums with energy. (${bonus}% bonus)`;
    } else if (scorePercent >= 70) {
      message = `Strong attunement achieved! Plants seem to sway in appreciation. (${bonus}% bonus)`;
    } else if (scorePercent >= 50) {
      message = `Decent attunement. The garden accepts your offering. (${bonus}% bonus)`;
    } else if (scorePercent >= 30) {
      message = `Weak attunement, but still effective. (${bonus}% bonus)`;
    } else if (scorePercent > 0) {
      message = `Minimal attunement achieved. (${bonus}% bonus)`;
    } else {
      message = "The energies seem confused by your choices.";
    }
    
    // Return result to parent component
    setTimeout(() => {
      onComplete({ success, bonus, message });
    }, 1500);
  };
  
  // Render the puzzle
  return (
    <div className="seasonal-attunement-puzzle">
      <div className="puzzle-container">
        <div className="puzzle-header">
          <h2>Seasonal Attunement Ritual</h2>
          <div className="season-badge">{season} Energies</div>
        </div>
        
        <div className="puzzle-description">
          <p>Select elements that harmonize with the current season's energy to attune your garden. Choose wisely - elements from other seasons may disrupt the flow!</p>
        </div>
        
        <div className="puzzle-timer">
          <div 
            className="timer-fill" 
            style={{ 
              width: `${(timeLeft / 30) * 100}%`,
              transition: `width ${timeLeft > 0 ? '1s' : '0s'} linear`
            }} 
          />
          <div className="timer-text">{timeLeft}s</div>
        </div>
        
        <div className="puzzle-board">
          <div className="puzzle-elements">
            {elements.map((element, index) => (
              <div
                key={`${element}-${index}`}
                className={`puzzle-element ${selectedElements.includes(element) ? 'selected' : ''}`}
                onClick={() => handleElementClick(element)}
              >
                {element}
              </div>
            ))}
          </div>
          
          <div className="selected-display">
            <div className="selected-label">Selected: {selectedElements.length}</div>
            <div className="selected-elements">
              {selectedElements.map((element, index) => (
                <span key={`selected-${index}`} className="selected-pill">
                  {element}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="puzzle-actions">
          <button 
            className="puzzle-button submit" 
            onClick={handleSubmitPuzzle} 
            disabled={isCompleted}
          >
            Complete Ritual
          </button>
          <button 
            className="puzzle-button skip" 
            onClick={onSkip} 
            disabled={isCompleted}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeasonalAttunementPuzzle;