import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import './BrewingPuzzle.css';
import LunarPhaseIcon from './LunarPhaseIcon';
// Pixel art style symbols for the game - moon-themed magical symbols
const SYMBOLS = ['✦', '✧', '♦', '◈', '❈', '✿', '☾', '☽'];
const COLORS = ['#b59dc4', '#7eba76', '#6fa6cc', '#d6a44c', '#c75e54', '#e4dbee'];
// Define difficulty levels
const DIFFICULTY_LEVELS = {
    easy: { gridSize: 3, symbols: 4, timeLimit: 60, moves: 12, reward: 5, patternMin: 3, patternMax: 4 },
    medium: { gridSize: 4, symbols: 5, timeLimit: 45, reward: 10, patternMin: 4, patternMax: 5, moves: 15 },
    hard: { gridSize: 5, symbols: 6, timeLimit: 30, reward: 15, patternMin: 5, patternMax: 6, moves: 18 }
};
const BrewingPuzzle = ({ onComplete, currentLunarPhase }) => {
    // Game state
    const [difficulty, setDifficulty] = useState('easy');
    const [gameState, setGameState] = useState('menu');
    const [grid, setGrid] = useState([]);
    const [targetPattern, setTargetPattern] = useState([]);
    const [selectedCells, setSelectedCells] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [movesLeft, setMovesLeft] = useState(0);
    const [gameStats, setGameStats] = useState({ attempts: 0, successes: 0, bestTime: Infinity });
    const [showHint, setShowHint] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const [comboMultiplier, setComboMultiplier] = useState(1);
    const [showComboMessage, setShowComboMessage] = useState(null);
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [puzzleResult, setPuzzleResult] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    // Sound effect references (placeholders)
    const playSound = (soundName) => {
        console.log(`Playing sound: ${soundName}`);
        // TODO: Implement actual sound playback
    };
    // Set up game based on difficulty
    const setupGame = useCallback(() => {
        const config = DIFFICULTY_LEVELS[difficulty];
        const { gridSize, symbols: numSymbols, timeLimit, moves, patternMin, patternMax } = config;
        // Create grid
        const newGrid = Array(gridSize).fill(0).map((_, r) => Array(gridSize).fill(0).map((_, c) => ({
            id: `cell-${r}-${c}-${Date.now()}`,
            symbol: SYMBOLS[Math.floor(Math.random() * Math.min(numSymbols, SYMBOLS.length))],
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            power: Math.random() < 0.15 ? generatePowerCell() : null
        })));
        // Create pattern
        let pattern = [];
        let attempts = 0;
        const maxAttempts = gridSize * gridSize * 3;
        const patternLength = patternMin + Math.floor(Math.random() * (patternMax - patternMin + 1));
        while (pattern.length < patternLength && attempts < maxAttempts) {
            pattern = [];
            const startRow = Math.floor(Math.random() * gridSize);
            const startCol = Math.floor(Math.random() * gridSize);
            pattern.push({ row: startRow, col: startCol });
            let currentPathLength = 1;
            for (let i = 1; i < patternLength && currentPathLength < patternLength; i++) {
                const lastCell = pattern[pattern.length - 1];
                const possibleMoves = [
                    { row: lastCell.row - 1, col: lastCell.col },
                    { row: lastCell.row + 1, col: lastCell.col },
                    { row: lastCell.row, col: lastCell.col - 1 },
                    { row: lastCell.row, col: lastCell.col + 1 }
                ].filter(move => move.row >= 0 && move.row < gridSize &&
                    move.col >= 0 && move.col < gridSize &&
                    !pattern.some(cell => cell.row === move.row && cell.col === move.col));
                if (possibleMoves.length === 0)
                    break;
                const nextMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                pattern.push(nextMove);
                currentPathLength++;
            }
            attempts++;
            if (pattern.length >= patternLength)
                break;
        }
        if (pattern.length < patternMin) {
            console.warn(`Pattern generation fallback: length ${pattern.length}`);
            if (pattern.length === 0)
                pattern.push({ row: 0, col: 0 });
        }
        // Lunar effects
        let actualMoves = moves;
        let actualTimeLimit = timeLimit;
        const lunarBonus = getLunarBonus();
        let phaseMessage = "";
        if (currentLunarPhase === "Full Moon") {
            actualMoves += 3;
            actualTimeLimit += 10;
            phaseMessage = "🌕 Full Moon Blessing! +3 moves, +10s";
        }
        else if (currentLunarPhase === "New Moon") {
            actualMoves = Math.max(5, actualMoves - 2);
            actualTimeLimit = Math.max(15, actualTimeLimit - 5);
            phaseMessage = "🌑 New Moon Challenge! -2 moves, -5s";
        }
        else if (currentLunarPhase.includes("Gibbous")) {
            actualMoves += 1;
            actualTimeLimit += 5;
            phaseMessage = "🌔 Gibbous Boon! +1 move, +5s";
        }
        if (phaseMessage) {
            setShowComboMessage(phaseMessage);
            setTimeout(() => setShowComboMessage(null), 3000);
        }
        // Set state
        setGrid(newGrid);
        setTargetPattern(pattern);
        setSelectedCells([]);
        setTimeLeft(actualTimeLimit);
        setMovesLeft(actualMoves);
        setComboMultiplier(lunarBonus.multiplier);
        setPuzzleResult(null);
        setShowHint(true);
        setHintUsed(false);
        setGameState('playing');
        setIsComplete(false);
        setTimeout(() => setShowHint(false), 3000);
        playSound('start_puzzle');
    }, [difficulty, currentLunarPhase]);
    // Generate special power cell
    const generatePowerCell = () => {
        const powers = [
            { type: 'time', value: 5, label: '+5s' },
            { type: 'move', value: 2, label: '+2♟' },
            { type: 'hint', value: true, label: '💡' },
            { type: 'combo', value: 1.5, label: 'x1.5' }
        ];
        if (currentLunarPhase === "Full Moon" && Math.random() < 0.4) {
            return { type: 'combo', value: 2, label: 'x2!' };
        }
        return powers[Math.floor(Math.random() * powers.length)];
    };
    // Apply lunar phase bonus multiplier
    const getLunarBonus = () => {
        switch (currentLunarPhase) {
            case "Full Moon":
                return { multiplier: 1.2, description: "Full Moon: +20% Bonus" };
            case "New Moon":
                return { multiplier: 0.9, description: "New Moon: -10% Bonus" };
            case "Waxing Gibbous":
            case "Waning Gibbous":
                return { multiplier: 1.1, description: "Gibbous: +10% Bonus" };
            default:
                return { multiplier: 1.0, description: "Standard Lunar Influence" };
        }
    };
    // Use hint
    const useHint = () => {
        if (!hintUsed && gameState === 'playing' && movesLeft > 0) {
            setShowHint(true);
            setHintUsed(true);
            setMovesLeft(prev => Math.max(0, prev - 1));
            playSound('use_hint');
            setTimeout(() => setShowHint(false), 2000);
        }
    };
    // Check completion - corrected version that evaluates the pattern match
    const checkForGameEnd = useCallback(() => {
        if (gameState !== 'playing' || isComplete)
            return;
        // If we're out of moves and haven't completed the pattern
        if (movesLeft <= 0 && selectedCells.length < targetPattern.length) {
            setGameState('failure');
            setPuzzleResult({
                success: false,
                bonus: 0,
                message: "Out of moves! The essence patterns faded."
            });
            setIsComplete(true);
            playSound('fail');
        }
    }, [gameState, isComplete, movesLeft, selectedCells.length, targetPattern.length]);
    // Handle cell selection
    const handleCellClick = (row, col) => {
        if (gameState !== 'playing' || movesLeft <= 0 || isComplete)
            return;
        const cellIndex = selectedCells.findIndex(cell => cell.row === row && cell.col === col);
        if (cellIndex >= 0) {
            if (cellIndex === selectedCells.length - 1) {
                setSelectedCells(prev => prev.slice(0, -1));
                playSound('deselect');
            }
            return;
        }
        const isFirstSelection = selectedCells.length === 0;
        const lastCell = selectedCells[selectedCells.length - 1];
        const isAdjacent = lastCell && ((Math.abs(row - lastCell.row) === 1 && col === lastCell.col) ||
            (Math.abs(col - lastCell.col) === 1 && row === lastCell.row));
        if (isFirstSelection || isAdjacent) {
            const newSelectedCells = [...selectedCells, { row, col }];
            setSelectedCells(newSelectedCells);
            setMovesLeft(prev => prev - 1);
            playSound('select');
            // Activate power cell if present
            if (grid[row] && grid[row][col]) {
                const cellData = grid[row][col];
                if (cellData.power && !cellData.activated) {
                    activatePowerCell(cellData.power);
                    // Update grid to mark power as used
                    const newGrid = grid.map((gridRow, rIdx) => gridRow.map((cell, cIdx) => rIdx === row && cIdx === col ? { ...cell, power: null, activated: true } : cell));
                    setGrid(newGrid);
                    // Reset activation visual after a delay
                    setTimeout(() => {
                        const updatedGrid = grid.map((gridRow, rIdx) => gridRow.map((cell, cIdx) => rIdx === row && cIdx === col ? { ...cell, activated: false } : cell));
                        if (grid)
                            setGrid(updatedGrid);
                    }, 500);
                }
            }
            // Check if the selected cells match the target pattern so far
            const matchesSoFar = newSelectedCells.every((cell, index) => {
                if (index >= targetPattern.length)
                    return false;
                const target = targetPattern[index];
                return cell.row === target.row && cell.col === target.col;
            });
            // If pattern is incorrect, game over
            if (!matchesSoFar) {
                setGameState('failure');
                setPuzzleResult({
                    success: false,
                    bonus: 0,
                    message: "Pattern disrupted! The essences scattered."
                });
                setIsComplete(true);
                playSound('fail');
                return;
            }
            // If pattern is complete, success!
            if (newSelectedCells.length === targetPattern.length) {
                const timeBonus = Math.max(0, Math.floor(timeLeft / 5));
                const moveBonus = Math.max(0, Math.floor(movesLeft / 2));
                const difficultyBonus = DIFFICULTY_LEVELS[difficulty].reward;
                const finalBonus = Math.round((difficultyBonus + timeBonus + moveBonus) * comboMultiplier);
                setGameState('success');
                setPuzzleResult({
                    success: true,
                    bonus: finalBonus,
                    message: `Essences aligned! +${finalBonus}% brewing potency.`
                });
                setIsComplete(true);
                setGameStats(prev => ({
                    ...prev,
                    successes: prev.successes + 1,
                    bestTime: Math.min(prev.bestTime, DIFFICULTY_LEVELS[difficulty].timeLimit - timeLeft)
                }));
                playSound('success');
            }
        }
        else {
            playSound('error');
        }
    };
    // Activate power cell effects
    const activatePowerCell = (power) => {
        let message = '';
        switch (power.type) {
            case 'time':
                setTimeLeft(prev => prev + power.value);
                message = `⏳ +${power.value} seconds!`;
                break;
            case 'move':
                setMovesLeft(prev => prev + power.value);
                message = `♟️ +${power.value} moves!`;
                break;
            case 'hint':
                if (!hintUsed) {
                    setShowHint(true);
                    setTimeout(() => setShowHint(false), 2000);
                    message = '💡 Hint revealed!';
                }
                else {
                    message = 'Hint already used!';
                }
                break;
            case 'combo':
                setComboMultiplier(prev => prev * power.value);
                message = `✨ Bonus x${power.value.toFixed(1)}!`;
                break;
        }
        setShowComboMessage(message);
        playSound('powerup');
        setTimeout(() => setShowComboMessage(null), 1500);
    };
    // Try again with same difficulty
    const tryAgain = () => {
        setGameStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));
        setPuzzleResult(null);
        setupGame();
    };
    // Timer effect
    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0 && !isComplete) {
            timer = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
                if (timeLeft <= 6 && timeLeft > 1)
                    playSound('clock_tick');
            }, 1000);
        }
        else if (gameState === 'playing' && timeLeft <= 0 && !isComplete) {
            setGameState('failure');
            setPuzzleResult({
                success: false,
                bonus: 0,
                message: "Time's up! The essence patterns faded."
            });
            setIsComplete(true);
            playSound('fail');
        }
        return () => { if (timer)
            clearTimeout(timer); };
    }, [gameState, timeLeft, isComplete]);
    // Check for game end when moves are exhausted
    useEffect(() => {
        checkForGameEnd();
    }, [movesLeft, checkForGameEnd]);
    // Effect to handle calling onComplete when the user clicks the button
    useEffect(() => {
        if (gameState === 'success' || gameState === 'failure') {
            // Don't auto-call onComplete - let the user click the button
        }
    }, [gameState, puzzleResult]);
    // Menu screen
    const renderMenu = () => (_jsxs("div", { className: "puzzle-menu", children: [_jsx("h2", { className: "puzzle-title", children: "Essence Alignment" }), _jsx("p", { className: "puzzle-description", children: "Trace the hidden energy patterns within the cauldron's depths. Success grants a temporary bonus to your brew!" }), _jsxs("div", { className: "difficulty-buttons", children: [_jsx("h3", { children: "Select Difficulty" }), _jsxs("div", { className: "buttons-row", children: [_jsx("button", { className: `difficulty-btn ${difficulty === 'easy' ? 'selected' : ''}`, onClick: () => setDifficulty('easy'), children: "Easy" }), _jsx("button", { className: `difficulty-btn ${difficulty === 'medium' ? 'selected' : ''}`, onClick: () => setDifficulty('medium'), children: "Medium" }), _jsx("button", { className: `difficulty-btn ${difficulty === 'hard' ? 'selected' : ''}`, onClick: () => setDifficulty('hard'), children: "Hard" })] }), _jsxs("div", { className: "difficulty-info", children: [difficulty === 'easy' && _jsxs("p", { children: ["Simple patterns. Base +", DIFFICULTY_LEVELS.easy.reward, "% bonus."] }), difficulty === 'medium' && _jsxs("p", { children: ["Moderate patterns. Base +", DIFFICULTY_LEVELS.medium.reward, "% bonus."] }), difficulty === 'hard' && _jsxs("p", { children: ["Complex patterns. Base +", DIFFICULTY_LEVELS.hard.reward, "% bonus."] })] })] }), _jsxs("div", { className: "puzzle-stats", children: [_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Attempts:" }), _jsx("span", { className: "stat-value", children: gameStats.attempts })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Successes:" }), _jsx("span", { className: "stat-value", children: gameStats.successes })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Fastest Time:" }), _jsx("span", { className: "stat-value", children: gameStats.bestTime !== Infinity
                                    ? `${DIFFICULTY_LEVELS[difficulty].timeLimit - gameStats.bestTime}s left`
                                    : 'N/A' })] })] }), _jsx("div", { className: "puzzle-lunar-effect", children: _jsxs("div", { className: "lunar-effect-title", children: [_jsx(LunarPhaseIcon, { phase: currentLunarPhase, size: 24 }), _jsxs("span", { children: ["Lunar Influence: ", getLunarBonus().description] })] }) }), _jsxs("div", { className: "puzzle-controls", children: [_jsx("button", { className: "start-btn", onClick: setupGame, children: "Start Alignment" }), _jsx("button", { className: "help-btn", onClick: () => setHelpModalOpen(true), children: "How to Play" })] })] }));
    // Game grid screen
    const renderGameGrid = () => {
        const { gridSize } = DIFFICULTY_LEVELS[difficulty];
        return (_jsxs("div", { className: "game-container", children: [_jsxs("div", { className: "game-header", children: [_jsxs("div", { className: "info-panel", children: [_jsxs("div", { className: "info-item", children: [_jsx("span", { className: "info-label", children: "Time:" }), _jsxs("span", { className: `info-value ${timeLeft <= 5 ? 'danger' : timeLeft <= 10 ? 'warning' : ''}`, children: [timeLeft, "s"] })] }), _jsxs("div", { className: "info-item", children: [_jsx("span", { className: "info-label", children: "Moves:" }), _jsx("span", { className: `info-value ${movesLeft <= 3 ? 'danger' : movesLeft <= 6 ? 'warning' : ''}`, children: movesLeft })] }), comboMultiplier > 1 && (_jsxs("div", { className: "info-item", children: [_jsx("span", { className: "info-label", children: "Bonus:" }), _jsxs("span", { className: "info-value", children: ["x", comboMultiplier.toFixed(1)] })] }))] }), !hintUsed && movesLeft > 0 && (_jsx("button", { className: "hint-btn", onClick: useHint, disabled: hintUsed, children: "Hint (-1 Move)" })), hintUsed && _jsx("span", { className: "hint-used-label", children: "Hint Used" })] }), showComboMessage && (_jsx("div", { className: "combo-message", children: showComboMessage })), _jsx("div", { className: "game-grid", style: { '--grid-size': gridSize }, children: grid.map((row, rowIndex) => row.map((cell, colIndex) => {
                        const isSelected = selectedCells.some(sel => sel.row === rowIndex && sel.col === colIndex);
                        const isHintTarget = showHint && targetPattern.some(target => target.row === rowIndex && target.col === colIndex);
                        const isInTargetPattern = targetPattern.some(target => target.row === rowIndex && target.col === colIndex);
                        const isNextInPattern = targetPattern.length > selectedCells.length &&
                            targetPattern[selectedCells.length].row === rowIndex &&
                            targetPattern[selectedCells.length].col === colIndex;
                        return (_jsx("div", { className: `grid-cell ${isSelected ? 'selected' : ''} 
                                         ${isHintTarget ? 'hint' : ''} 
                                         ${cell.activated ? 'activated' : ''} 
                                         ${gameState === 'failure' && isInTargetPattern ? 'pattern-fail' : ''} 
                                         ${gameState === 'playing' && isNextInPattern ? 'next-in-pattern' : ''}`, onClick: () => handleCellClick(rowIndex, colIndex), children: _jsxs("div", { className: "cell-content", style: { color: cell.color }, children: [_jsx("span", { className: "cell-symbol", children: cell.symbol }), cell.power && (_jsx("div", { className: "power-indicator", title: powerTooltip(cell.power), children: cell.power.label }))] }) }, cell.id));
                    })) })] }));
    };
    const powerTooltip = (power) => {
        switch (power.type) {
            case 'time': return `Adds ${power.value} seconds`;
            case 'move': return `Adds ${power.value} moves`;
            case 'hint': return 'Briefly reveals the pattern';
            case 'combo': return `Multiplies bonus by ${power.value.toFixed(1)}`;
            default: return 'Special Power';
        }
    };
    // Help modal
    const renderHelpModal = () => (_jsx("div", { className: "help-modal-overlay", onClick: () => setHelpModalOpen(false), children: _jsxs("div", { className: "help-modal", onClick: e => e.stopPropagation(), children: [_jsx("h3", { children: "How to Play - Essence Alignment" }), _jsxs("div", { className: "help-section", children: [_jsx("h4", { children: "Objective" }), _jsx("p", { children: "Connect the symbols in the grid by clicking adjacent cells to match the hidden energy pattern." })] }), _jsxs("div", { className: "help-section", children: [_jsx("h4", { children: "Gameplay" }), _jsxs("ol", { children: [_jsx("li", { children: "Select the first cell of the pattern (it might glow slightly if you wait!)." }), _jsx("li", { children: "Click adjacent cells (up, down, left, right) to trace the pattern step-by-step." }), _jsx("li", { children: "You must follow the exact sequence of the hidden pattern." }), _jsx("li", { children: "Clicking a wrong cell ends the attempt immediately." }), _jsx("li", { children: "Successfully trace the entire pattern within the time and move limits!" })] })] }), _jsxs("div", { className: "help-section", children: [_jsx("h4", { children: "Power Cells" }), _jsx("p", { children: "Some cells contain special powers that activate when selected:" }), _jsxs("ul", { children: [_jsxs("li", { children: [_jsx("b", { children: "+Xs:" }), " Adds X seconds to the timer."] }), _jsxs("li", { children: [_jsx("b", { children: "+X\u265F:" }), " Adds X extra moves."] }), _jsxs("li", { children: [_jsx("b", { children: "\uD83D\uDCA1:" }), " Briefly reveals the hidden pattern (using the Hint button costs 1 move)."] }), _jsxs("li", { children: [_jsx("b", { children: "xY:" }), " Multiplies your final bonus score by Y."] })] })] }), _jsxs("div", { className: "help-section", children: [_jsx("h4", { children: "Lunar Influence" }), _jsx("p", { children: "The moon affects the challenge:" }), _jsxs("ul", { children: [_jsxs("li", { children: [_jsx("b", { children: "Full Moon:" }), " More time, moves, and bonus potential."] }), _jsxs("li", { children: [_jsx("b", { children: "New Moon:" }), " Less time, fewer moves, reduced bonus potential."] }), _jsxs("li", { children: [_jsx("b", { children: "Gibbous Moons:" }), " Slight advantages."] })] })] }), _jsx("button", { className: "close-help-btn", onClick: () => setHelpModalOpen(false), children: "Close" })] }) }));
    // Render result overlay separately if game state is success or failure
    const renderResultOverlay = () => {
        if (!puzzleResult)
            return null;
        return (_jsx("div", { className: "puzzle-result-overlay", children: _jsxs("div", { className: `puzzle-result-content ${puzzleResult.success ? 'success' : 'failure'}`, children: [_jsx("h3", { children: puzzleResult.success ? '✨ Success! ✨' : '☁️ Alignment Failed! ☁️' }), _jsx("p", { children: puzzleResult.message }), puzzleResult.success && _jsxs("div", { className: "puzzle-result-bonus", children: ["Bonus: +", puzzleResult.bonus, "%"] }), _jsxs("div", { className: "result-buttons", children: [_jsx("button", { onClick: () => onComplete(puzzleResult), children: "Back to Cauldron" }), _jsxs("button", { onClick: tryAgain, children: ["Try Again (", difficulty, ")"] })] })] }) }));
    };
    return (_jsxs("div", { className: "brewing-puzzle", children: [gameState === 'menu' ? renderMenu() : renderGameGrid(), helpModalOpen && renderHelpModal(), (gameState === 'success' || gameState === 'failure') && renderResultOverlay()] }));
};
export default BrewingPuzzle;
//# sourceMappingURL=BrewingPuzzle.js.map