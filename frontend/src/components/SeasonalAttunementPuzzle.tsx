import React, { useState, useEffect, useMemo } from 'react';
import './SeasonalAttunementPuzzle.css';
import { Season } from 'coven-shared';

type ElementType = 'sun' | 'water' | 'earth' | 'air';
const ELEMENTS: ElementType[] = ['sun', 'water', 'earth', 'air'];

// Define target balance ranges per season
const SEASONAL_TARGETS: Record<Season, Record<ElementType, { min: number; max: number }>> = {
  Spring: { sun: { min: 55, max: 75 }, water: { min: 60, max: 80 }, earth: { min: 40, max: 60 }, air: { min: 50, max: 70 } },
  Summer: { sun: { min: 75, max: 95 }, water: { min: 50, max: 70 }, earth: { min: 20, max: 40 }, air: { min: 40, max: 60 } },
  Fall: { sun: { min: 40, max: 60 }, water: { min: 55, max: 75 }, earth: { min: 50, max: 70 }, air: { min: 60, max: 80 } },
  Winter: { sun: { min: 20, max: 40 }, water: { min: 30, max: 50 }, earth: { min: 60, max: 80 }, air: { min: 70, max: 90 } },
};

// Define max moves per difficulty (example)
const MAX_MOVES = { easy: 15, medium: 12, hard: 10 };

interface SeasonalAttunementPuzzleProps {
  onComplete: (result: { success: boolean; bonus: number; message: string }) => void;
  onSkip: () => void;
  season: Season;
  difficulty?: 'easy' | 'medium' | 'hard'; // Optional difficulty
}

const SeasonalAttunementPuzzle: React.FC<SeasonalAttunementPuzzleProps> = ({
  onComplete,
  onSkip,
  season,
  difficulty = 'medium', // Default difficulty
}) => {
  // State for element levels
  const [elementLevels, setElementLevels] = useState<Record<ElementType, number>>({
    sun: 50, water: 50, earth: 50, air: 50,
  });
  const [movesLeft, setMovesLeft] = useState<number>(MAX_MOVES[difficulty]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: boolean; bonus: number; message: string } | null>(null);

  // Memoize target ranges for the current season
  const targets = useMemo(() => SEASONAL_TARGETS[season], [season]);

  // Handle slider change - this represents one "move"
  const handleSliderChange = (element: ElementType, value: number) => {
    if (isComplete || movesLeft <= 0) return;

    setElementLevels(prevLevels => {
      const newLevels = { ...prevLevels, [element]: value };
      // Optional: Add interaction logic (e.g., increasing water slightly decreases sun)
      // Example: if (element === 'water') newLevels.sun = Math.max(0, newLevels.sun - Math.abs(value - prevLevels.water) / 4);
      return newLevels;
    });

    setMovesLeft(prev => prev - 1);
  };

  // Check for completion when moves run out or manually triggered
  const checkCompletion = () => {
    if (isComplete) return;

    let withinTargetCount = 0;
    let totalDistance = 0;

    ELEMENTS.forEach(el => {
      const level = elementLevels[el];
      const target = targets[el];
      if (level >= target.min && level <= target.max) {
        withinTargetCount++;
        // Smaller distance within target is better
        totalDistance += Math.min(Math.abs(level - target.min), Math.abs(level - target.max));
      } else {
        // Calculate distance outside target
        totalDistance += (level < target.min ? target.min - level : level - target.max) * 1.5; // Penalize being outside
      }
    });

    const success = withinTargetCount === ELEMENTS.length;
    let bonus = 0;
    let message = '';

    if (success) {
      // Calculate bonus based on how close to the center of targets (lower distance is better)
      // Max possible distance within targets (sum of half ranges)
      const maxInnerDistance = ELEMENTS.reduce((sum, el) => sum + (targets[el].max - targets[el].min) / 2, 0);
      const closenessFactor = Math.max(0, 1 - (totalDistance / maxInnerDistance)); // 0 to 1
      bonus = Math.round(10 + closenessFactor * 10); // Bonus range 10-20
      message = `Garden energies harmonized! (+${bonus}% Attunement Bonus)`;
    } else {
      bonus = 0;
      message = `Energy balance unstable (${withinTargetCount}/${ELEMENTS.length} elements aligned). No bonus gained.`;
    }

    setIsComplete(true);
    setResult({ success, bonus, message });
  };

   // Effect to check completion automatically when moves run out
   useEffect(() => {
       if (movesLeft <= 0 && !isComplete) {
           checkCompletion();
       }
   }, [movesLeft, isComplete]);

  // Effect to call onComplete when result is set
  useEffect(() => {
      if (result) {
          // Use a timeout to allow the player to see the result briefly
          const timer = setTimeout(() => {
              onComplete(result);
          }, 1500); // Show result for 1.5 seconds
          return () => clearTimeout(timer);
      }
      return undefined; // Explicitly return undefined for other cases
  }, [result, onComplete]);


  const getElementIcon = (element: ElementType): string => {
    switch (element) {
      case 'sun': return '☀️';
      case 'water': return '💧';
      case 'earth': return '🌰';
      case 'air': return '💨';
      default: return '?';
    }
  };

  return (
    <div className="attunement-puzzle-overlay">
      <div className="attunement-puzzle-container">
        {!result ? (
          <>
            <div className="puzzle-header">
              <h2>Seasonal Attunement ({season})</h2>
            </div>
            <p className="puzzle-instructions">
              Balance the elemental energies to match the current season's needs within {MAX_MOVES[difficulty]} adjustments. Aim for the yellow target areas.
            </p>
            <div className="puzzle-hud">
              <div className="hud-item">
                <span className="hud-label">Moves Left:</span>
                <span className={`hud-value ${movesLeft <= 3 ? 'danger' : movesLeft <= 6 ? 'warning' : ''}`}>{movesLeft}</span>
              </div>
              <div className="hud-item">
                  <span className="hud-label">Current Season:</span>
                  <span className="hud-value">{season}</span>
              </div>
            </div>

            <div className="attunement-board">
              {ELEMENTS.map(el => (
                <div key={el} className="element-control">
                  <span className={`element-icon ${el}`}>{getElementIcon(el)}</span>
                  <span className="element-label">{el.charAt(0).toUpperCase() + el.slice(1)}</span>
                  <div className="element-slider-container" style={{position: 'relative'}}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={elementLevels[el]}
                      onChange={(e) => handleSliderChange(el, parseInt(e.target.value, 10))}
                      className="element-slider"
                      disabled={isComplete || movesLeft <= 0}
                    />
                    {/* Target Range Visualization */}
                     <div
                        className="target-indicator"
                        title={`Target: ${targets[el].min}-${targets[el].max}`}
                        style={{ '--target-percent': `${(targets[el].min + targets[el].max) / 2}%` } as React.CSSProperties}
                     ></div>
                  </div>
                  <span className="element-value">{elementLevels[el]}</span>
                </div>
              ))}
            </div>

            <div className="puzzle-controls">
               {/* Disable button if no moves left or already completed */}
              <button
                className="attune-btn"
                onClick={checkCompletion}
                disabled={isComplete || movesLeft <= 0}
              >
                Check Attunement
              </button>
              <button className="skip-btn" onClick={onSkip} disabled={isComplete}>
                Skip Puzzle
              </button>
            </div>
          </>
        ) : (
          /* Result Screen */
          <div className={`puzzle-result-overlay`}>
            <div className={`puzzle-result-content ${result.success ? 'success' : 'failure'}`}>
                <h3>{result.success ? '✨ Attunement Successful! ✨' : '☁️ Balance Lost ☁️'}</h3>
                <p>{result.message}</p>
                {result.success && <div className="puzzle-result-bonus">Bonus: +{result.bonus}%</div>}
                {/* The onComplete callback is triggered by useEffect after a delay */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonalAttunementPuzzle;