import React, { useState, useEffect, useRef } from 'react';
import './BrewingPuzzle.css';
import { MoonPhase } from 'coven-shared';

// Pixel art style symbols for the game - moon-themed magical symbols
const SYMBOLS = ['✦', '✧', '♦', '◈', '❈', '✿', '❋', '❁', '☾', '☽', '♣', '♠'];
const COLORS = ['#b59dc4', '#7eba76', '#6fa6cc', '#d6a44c', '#c75e54', '#90a959'];

// Define difficulty levels
const DIFFICULTY_LEVELS = {
  easy: { gridSize: 3, symbols: 4, timeLimit: 60, reward: 5, moves: 12 },
  medium: { gridSize: 4, symbols: 6, timeLimit: 45, reward: 10, moves: 15 },
  hard: { gridSize: 5, symbols: 8, timeLimit: 30, reward: 15, moves: 18 }
};

interface BrewingPuzzleProps {
  onComplete: (result: { success: boolean; bonus: number; message: string }) => void;
  currentLunarPhase: MoonPhase;
}

const BrewingPuzzle: React.FC<BrewingPuzzleProps> = ({ onComplete, currentLunarPhase }) => {
  // Game state
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'success' | 'failure'>('menu');
  const [grid, setGrid] = useState<Array<Array<{
    symbol: string;
    color: string;
    power: { type: string; value: any; label: string } | null;
    activated?: boolean;
  }>>>([]);
  const [targetPattern, setTargetPattern] = useState<Array<{row: number; col: number}>>([]);
  const [selectedCells, setSelectedCells] = useState<Array<{row: number; col: number}>>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [movesLeft, setMovesLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStats, setGameStats] = useState({
    attempts: 0,
    successes: 0,
    bestTime: Infinity
  });
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showComboMessage, setShowComboMessage] = useState<string | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  
  // Sound effect references
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Play sound effect helper
  const playSound = (soundName: string) => {
    // This would implement actual sound playback
    console.log(`Playing sound: ${soundName}`);
    // If audio implementation is added:
    // if (audioRef.current) {
    //   audioRef.current.src = `/sounds/${soundName}.wav`;
    //   audioRef.current.play();
    // }
  };
  
  // Set up game based on difficulty
  const setupGame = () => {
    const { gridSize, symbols, timeLimit, moves } = DIFFICULTY_LEVELS[difficulty];
    
    // Create grid with random symbols
    const newGrid = Array(gridSize).fill(0).map(() => 
      Array(gridSize).fill(0).map(() => ({
        symbol: SYMBOLS[Math.floor(Math.random() * Math.min(symbols, SYMBOLS.length))],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        power: Math.random() < 0.2 ? generatePowerCell() : null // 20% chance of special power cells
      }))
    );
    
    // Create random pattern to match
    let patternLength = Math.floor(3 + Math.random() * 3); // 3-5 cells in pattern
    
    // Adjust pattern length based on difficulty
    if (difficulty === 'medium') patternLength = 4 + Math.floor(Math.random() * 2); // 4-5 cells
    if (difficulty === 'hard') patternLength = 5 + Math.floor(Math.random() * 2); // 5-6 cells
    
    const startRow = Math.floor(Math.random() * gridSize);
    const startCol = Math.floor(Math.random() * gridSize);
    
    // Place first pattern cell
    const pattern = [{row: startRow, col: startCol}];
    
    // Generate remaining pattern cells adjacent to existing ones
    for (let i = 1; i < patternLength; i++) {
      const lastCell = pattern[pattern.length - 1];
      const possibleMoves = [
        {row: lastCell.row - 1, col: lastCell.col}, // up
        {row: lastCell.row + 1, col: lastCell.col}, // down
        {row: lastCell.row, col: lastCell.col - 1}, // left
        {row: lastCell.row, col: lastCell.col + 1}  // right
      ].filter(move => 
        move.row >= 0 && move.row < gridSize && 
        move.col >= 0 && move.col < gridSize &&
        !pattern.some(cell => cell.row === move.row && cell.col === move.col)
      );
      
      if (possibleMoves.length === 0) break;
      
      // Add random adjacent cell to pattern
      const nextMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      pattern.push(nextMove);
    }
    
    // Apply lunar phase effects
    let actualMoves = moves;
    let actualTimeLimit = timeLimit;
    
    if (currentLunarPhase === "Full Moon") {
      actualMoves += 3; // Bonus moves during Full Moon
      actualTimeLimit += 15; // Bonus time during Full Moon
      setShowComboMessage("Full Moon Blessing! +3 moves, +15 seconds");
      setTimeout(() => setShowComboMessage(null), 3000);
    } else if (currentLunarPhase === "New Moon") {
      actualMoves -= 2; // Fewer moves during New Moon
      actualTimeLimit -= 5; // Less time during New Moon
      setShowComboMessage("New Moon Challenge! -2 moves, -5 seconds");
      setTimeout(() => setShowComboMessage(null), 3000);
    } else if (currentLunarPhase === "Waxing Gibbous" || currentLunarPhase === "Waning Gibbous") {
      // Gibbous moons give moderate bonuses
      actualMoves += 1;
      actualTimeLimit += 5;
      setShowComboMessage(`${currentLunarPhase} Benefit! +1 move, +5 seconds`);
      setTimeout(() => setShowComboMessage(null), 3000);
    }
    
    setGrid(newGrid);
    setTargetPattern(pattern);
    setSelectedCells([]);
    setTimeLeft(actualTimeLimit);
    setMovesLeft(actualMoves);
    setComboMultiplier(1);
    setShowHint(true); // Show hint at the start
    setHintUsed(false);
    setGameState('playing');
    
    // Auto-hide hint after 3 seconds
    setTimeout(() => {
      setShowHint(false);
    }, 3000);
    
    playSound('select');
  };
  
  // Generate special power cell
  const generatePowerCell = () => {
    const powers = [
      { type: 'time', value: 5, label: '+5s' },
      { type: 'move', value: 1, label: '+1♟' },
      { type: 'hint', value: true, label: '💡' },
      { type: 'combo', value: 2, label: 'x2' }
    ];
    
    // Full Moon increases chance of better powers
    if (currentLunarPhase === "Full Moon" && Math.random() < 0.3) {
      // Special Full Moon powers
      return { type: 'combo', value: 3, label: 'x3' };
    }
    
    return powers[Math.floor(Math.random() * powers.length)];
  };
  
  // Apply lunar phase bonus
  const getLunarBonus = () => {
    switch (currentLunarPhase) {
      case "Full Moon": return 1.5;
      case "New Moon": return 0.8;
      case "Waxing Gibbous": return 1.2;
      case "Waning Gibbous": return 1.2;
      case "First Quarter": return 1.1;
      case "Last Quarter": return 1.1;
      case "Waxing Crescent": return 1.0;
      case "Waning Crescent": return 1.0;
      default: return 1.0;
    }
  };
  
  // Use hint
  const useHint = () => {
    if (!hintUsed && gameState === 'playing') {
      setShowHint(true);
      setHintUsed(true);
      playSound('select');
      
      // Hide hint after 2 seconds
      setTimeout(() => {
        setShowHint(false);
      }, 2000);
    }
  };

  // Handle cell selection
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing' || movesLeft <= 0) return;
    
    // Check if cell is already selected
    const cellIndex = selectedCells.findIndex(
      cell => cell.row === row && cell.col === col
    );
    
    if (cellIndex >= 0) {
      // If this is the last cell, remove it
      if (cellIndex === selectedCells.length - 1) {
        setSelectedCells(selectedCells.slice(0, -1));
        playSound('select');
      }
      return;
    }
    
    // Check if new cell is adjacent to last selected cell or is first selection
    const isFirstSelection = selectedCells.length === 0;
    const lastCell = selectedCells[selectedCells.length - 1];
    const isAdjacent = lastCell && (
      (Math.abs(row - lastCell.row) === 1 && col === lastCell.col) ||
      (Math.abs(col - lastCell.col) === 1 && row === lastCell.row)
    );
    
    if (isFirstSelection || isAdjacent) {
      const newSelectedCells = [...selectedCells, {row, col}];
      setSelectedCells(newSelectedCells);
      playSound('select');
      
      // Activate power cell if present
      const cellData = grid[row][col];
      if (cellData.power) {
        activatePowerCell(cellData.power);
        
        // Create new grid with power removed
        const newGrid = [...grid];
        newGrid[row][col] = {
          ...cellData,
          power: null, // Remove power after use
          activated: true // Mark as activated for animation
        };
        setGrid(newGrid);
      }
      
      // Auto-submit if pattern length matches
      if (newSelectedCells.length === targetPattern.length) {
        // Slight delay to show the final selection
        setTimeout(() => {
          handleSubmit();
        }, 300);
      }
    }
  };
  
  // Activate power cell effects
  const activatePowerCell = (power: { type: string; value: any; label: string }) => {
    switch(power.type) {
      case 'time':
        setTimeLeft(prev => prev + power.value);
        setShowComboMessage(`+${power.value} seconds!`);
        playSound('match');
        break;
      case 'move':
        setMovesLeft(prev => prev + power.value);
        setShowComboMessage(`+${power.value} move!`);
        playSound('match');
        break;
      case 'hint':
        setShowHint(true);
        setShowComboMessage('Hint revealed!');
        playSound('match');
        // Hide hint after 2 seconds
        setTimeout(() => {
          setShowHint(false);
        }, 2000);
        break;
      case 'combo':
        setComboMultiplier(prev => prev * power.value);
        setShowComboMessage(`Combo x${power.value}!`);
        playSound('match');
        break;
      default:
        break;
    }
    
    // Hide combo message after a delay
    setTimeout(() => {
      setShowComboMessage(null);
    }, 1500);
  };
  
  // Check if player's selection matches the target pattern
  const checkPattern = () => {
    if (selectedCells.length !== targetPattern.length) return false;
    
    // Check cell by cell
    return selectedCells.every((cell, index) => {
      const target = targetPattern[index];
      return cell.row === target.row && cell.col === target.col;
    });
  };
  
  // Submit current selection
  const handleSubmit = () => {
    if (selectedCells.length === 0 || gameState !== 'playing') return;
    
    // Deduct a move
    setMovesLeft(prev => prev - 1);
    
    setGameStats(prev => ({
      ...prev,
      attempts: prev.attempts + 1
    }));
    
    if (checkPattern()) {
      const timeUsed = DIFFICULTY_LEVELS[difficulty].timeLimit - timeLeft;
      const lunarBonus = getLunarBonus();
      const combinedMultiplier = comboMultiplier * lunarBonus;
      const baseReward = DIFFICULTY_LEVELS[difficulty].reward;
      const newScore = Math.ceil(baseReward * combinedMultiplier);
      
      setScore(prev => prev + newScore);
      setGameState('success');
      setGameStats(prev => ({
        ...prev,
        successes: prev.successes + 1,
        bestTime: Math.min(prev.bestTime, timeUsed)
      }));
      
      playSound('success');
      
      // Call completion callback with the earned bonus
      if (onComplete) {
        onComplete({
          success: true,
          bonus: newScore,
          message: `Pattern matched! Brewing skill temporarily boosted by ${newScore}%`
        });
      }
    } else {
      // Not a match, clear selection
      setSelectedCells([]);
      
      // If out of moves, game over
      if (movesLeft <= 1) {
        setGameState('failure');
        playSound('fail');
        
        // Call completion callback with failure
        if (onComplete) {
          onComplete({
            success: false,
            bonus: 0,
            message: "Pattern alignment failed. No brewing bonus earned."
          });
        }
      } else {
        // Still have moves left
        playSound('error');
      }
    }
  };
  
  // Reset game
  const resetGame = () => {
    setGameState('menu');
    setSelectedCells([]);
    setScore(0);
    setComboMultiplier(1);
    setHintUsed(false);
    playSound('select');
  };
  
  // Try again with same difficulty
  const tryAgain = () => {
    setupGame();
  };
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
        if (timeLeft <= 5) {
          playSound('clock'); // Tick sound for last 5 seconds
        }
      }, 1000);
    } else if (gameState === 'playing' && timeLeft <= 0) {
      setGameState('failure');
      playSound('fail');
      
      // Call completion callback with failure due to timeout
      if (onComplete) {
        onComplete({
          success: false,
          bonus: 0,
          message: "Time's up! The essence patterns have faded away."
        });
      }
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState, timeLeft, onComplete]);

  // Menu screen
  const renderMenu = () => (
    <div className="puzzle-menu">
      <h2 className="puzzle-title">Lunar Essence Alignment</h2>
      <p className="puzzle-description">
        Align magical patterns to enhance your brewing potency!
        <br/>Match patterns to gain temporary brewing bonuses.
      </p>
      
      <div className="difficulty-buttons">
        <h3>Select Difficulty</h3>
        <div className="buttons-row">
          <button 
            className={`difficulty-btn ${difficulty === 'easy' ? 'selected' : ''}`}
            onClick={() => setDifficulty('easy')}
          >
            Easy
          </button>
          <button 
            className={`difficulty-btn ${difficulty === 'medium' ? 'selected' : ''}`}
            onClick={() => setDifficulty('medium')}
          >
            Medium
          </button>
          <button 
            className={`difficulty-btn ${difficulty === 'hard' ? 'selected' : ''}`}
            onClick={() => setDifficulty('hard')}
          >
            Hard
          </button>
        </div>
        <div className="difficulty-info">
          {difficulty === 'easy' && (
            <p>A 3x3 grid with simple patterns. +5% brewing bonus.</p>
          )}
          {difficulty === 'medium' && (
            <p>A 4x4 grid with more complex patterns. +10% brewing bonus.</p>
          )}
          {difficulty === 'hard' && (
            <p>A 5x5 grid with challenging patterns. +15% brewing bonus.</p>
          )}
        </div>
      </div>
      
      <div className="puzzle-stats">
        <div className="stat-item">
          <span className="stat-label">Attempts:</span>
          <span className="stat-value">{gameStats.attempts}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Successes:</span>
          <span className="stat-value">{gameStats.successes}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Best Time:</span>
          <span className="stat-value">
            {gameStats.bestTime !== Infinity ? `${gameStats.bestTime}s` : 'N/A'}
          </span>
        </div>
      </div>
      
      <div className="puzzle-lunar-effect">
        <div className="lunar-effect-title">
          <span className="moon-icon">{currentLunarPhase === "Full Moon" ? "🌕" : 
                                      currentLunarPhase === "New Moon" ? "🌑" : "🌓"}</span>
          <span>Current Lunar Effect</span>
        </div>
        <p className="lunar-effect-desc">
          {currentLunarPhase === "Full Moon" ? 
            "Full Moon: +3 moves, +15 seconds, 1.5x bonus multiplier" : 
           currentLunarPhase === "New Moon" ? 
            "New Moon: -2 moves, -5 seconds, 0.8x bonus multiplier" :
           currentLunarPhase === "Waxing Gibbous" || currentLunarPhase === "Waning Gibbous" ?
            `${currentLunarPhase}: +1 move, +5 seconds, 1.2x bonus multiplier` :
            `${currentLunarPhase}: Standard conditions`}
        </p>
      </div>
      
      <div className="puzzle-controls">
        <button className="start-btn" onClick={setupGame}>
          Start Game
        </button>
        <button className="help-btn" onClick={() => setHelpModalOpen(true)}>
          How to Play
        </button>
      </div>
    </div>
  );
  
  // Game grid
  const renderGameGrid = () => (
    <div className="game-container">
      <div className="game-header">
        <div className="info-panel">
          <div className="info-item">
            <span className="info-label">Time:</span>
            <span className={`info-value ${timeLeft <= 5 ? 'danger' : ''}`}>{timeLeft}s</span>
          </div>
          <div className="info-item">
            <span className="info-label">Moves:</span>
            <span className={`info-value ${movesLeft <= 2 ? 'danger' : ''}`}>{movesLeft}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Bonus:</span>
            <span className="info-value">{comboMultiplier > 1 ? `x${comboMultiplier}` : '-'}</span>
          </div>
          {!hintUsed && (
            <button className="hint-btn" onClick={useHint} disabled={hintUsed}>
              Show Hint
            </button>
          )}
        </div>
      </div>
      
      {showComboMessage && (
        <div className="combo-message">
          {showComboMessage}
        </div>
      )}
      
      <div 
        className="game-grid" 
        style={{ 
          gridTemplateColumns: `repeat(${DIFFICULTY_LEVELS[difficulty].gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${DIFFICULTY_LEVELS[difficulty].gridSize}, 1fr)`
        }}
      >
        {grid.map((row, rowIndex) => 
          row.map((cell, colIndex) => {
            const isSelected = selectedCells.some(selected => 
              selected.row === rowIndex && selected.col === colIndex
            );
            
            const isHint = showHint && 
              targetPattern.some(target => target.row === rowIndex && target.col === colIndex);
            
            const showPattern = gameState === 'success' || gameState === 'failure';
            const isInPattern = targetPattern.some(target => 
              target.row === rowIndex && target.col === colIndex
            );
            
            return (
              <div 
                key={`cell-${rowIndex}-${colIndex}`}
                className={`grid-cell ${isSelected ? 'selected' : ''} 
                           ${isHint ? 'hint' : ''} 
                           ${showPattern && isInPattern ? (gameState === 'success' ? 'pattern-success' : 'pattern-fail') : ''}
                           ${cell.activated ? 'activated' : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                <div className="cell-content" style={{ color: cell.color }}>
                  <span className="cell-symbol">{cell.symbol}</span>
                  {cell.power && (
                    <div className="power-indicator">
                      {cell.power.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {gameState === 'success' && (
        <div className="game-result success">
          <h3>Success!</h3>
          <p>Pattern matched! You've earned a {score}% brewing bonus.</p>
          <div className="result-buttons">
            <button onClick={resetGame}>Main Menu</button>
            <button onClick={tryAgain}>Try Again</button>
          </div>
        </div>
      )}
      
      {gameState === 'failure' && (
        <div className="game-result failure">
          <h3>Pattern Mismatch</h3>
          <p>The essence patterns have faded away. No bonus earned.</p>
          <div className="result-buttons">
            <button onClick={resetGame}>Main Menu</button>
            <button onClick={tryAgain}>Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
  
  // Help modal
  const renderHelpModal = () => (
    <div className="help-modal-overlay" onClick={() => setHelpModalOpen(false)}>
      <div className="help-modal" onClick={e => e.stopPropagation()}>
        <h3>How to Play - Lunar Essence Alignment</h3>
        
        <div className="help-section">
          <h4>Game Objective</h4>
          <p>Trace the hidden pattern in the grid to align magical essences. A successful alignment enhances your brewing potency!</p>
        </div>
        
        <div className="help-section">
          <h4>How to Play</h4>
          <ol>
            <li>Click cells to trace a pattern. Cells must be adjacent (no diagonals).</li>
            <li>Your pattern must match the hidden pattern exactly.</li>
            <li>Use hints strategically to see the hidden pattern briefly.</li>
            <li>Special power cells offer bonuses when activated!</li>
          </ol>
        </div>
        
        <div className="help-section">
          <h4>Special Powers</h4>
          <ul>
            <li><b>+5s</b> - Adds 5 seconds to your timer</li>
            <li><b>+1♟</b> - Grants an extra move</li>
            <li><b>💡</b> - Reveals the pattern briefly</li>
            <li><b>x2/x3</b> - Multiplies your bonus reward</li>
          </ul>
        </div>
        
        <div className="help-section">
          <h4>Lunar Influences</h4>
          <p>The current moon phase affects gameplay:</p>
          <ul>
            <li><b>Full Moon:</b> More favorable conditions (+3 moves, +15s, 1.5x bonus)</li>
            <li><b>New Moon:</b> More challenging conditions (-2 moves, -5s, 0.8x bonus)</li>
            <li><b>Gibbous Moons:</b> Slightly favorable (+1 move, +5s, 1.2x bonus)</li>
            <li><b>Other phases:</b> Standard conditions</li>
          </ul>
        </div>
        
        <button className="close-help-btn" onClick={() => setHelpModalOpen(false)}>
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="brewing-puzzle">
      {gameState === 'menu' ? renderMenu() : renderGameGrid()}
      {helpModalOpen && renderHelpModal()}
      <audio ref={audioRef} />
    </div>
  );
};

export default BrewingPuzzle;