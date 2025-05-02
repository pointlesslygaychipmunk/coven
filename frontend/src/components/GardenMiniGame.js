import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import './GardenMiniGame.css';
const GardenMiniGame = ({ type, onComplete, onCancel, season, moonPhase, weather, playerSkill,
// Unused props but kept in props definition for API consistency
// plotId,
// plantId
 }) => {
    // Game state
    const [gameActive, setGameActive] = useState(false);
    const [gamePhase, setGamePhase] = useState('intro');
    const [timer, setTimer] = useState(30); // Seconds for game
    const [score, setScore] = useState(0);
    const [targets, setTargets] = useState([]);
    const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 75 });
    const [gameResult, setGameResult] = useState(null);
    const [difficulty, setDifficulty] = useState(1);
    // UI state
    const [showInstructions, setShowInstructions] = useState(true);
    const [countdownActive, setCountdownActive] = useState(false);
    const [countdown, setCountdown] = useState(3);
    // Refs
    const gameAreaRef = useRef(null);
    const gameIntervalRef = useRef(null);
    const animationFrameRef = useRef(null);
    // Game-specific metrics
    const [precision, setPrecision] = useState(0);
    const [timing, setTiming] = useState(0);
    const [technique, setTechnique] = useState(0);
    // Initialize game based on type
    useEffect(() => {
        // Set difficulty based on player skill (higher skill = easier game)
        const skillAdjustedDifficulty = Math.max(0.8, 2 - (playerSkill / 50));
        setDifficulty(skillAdjustedDifficulty);
        // Initialize game metrics
        setPrecision(0);
        setTiming(0);
        setTechnique(0);
        return () => {
            // Cleanup any intervals or animation frames
            if (gameIntervalRef.current)
                clearInterval(gameIntervalRef.current);
            if (animationFrameRef.current)
                cancelAnimationFrame(animationFrameRef.current);
        };
    }, [type, playerSkill]);
    // Start game countdown
    const startGameCountdown = () => {
        setShowInstructions(false);
        setCountdownActive(true);
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    setCountdownActive(false);
                    startGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    // Start the actual mini-game
    const startGame = () => {
        setGameActive(true);
        setGamePhase('active');
        // Start timer
        gameIntervalRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        // Initialize targets based on game type
        initializeTargets();
        // Start game loop
        requestAnimationFrame(gameLoop);
    };
    // Game animation loop
    const gameLoop = () => {
        updateGameState();
        animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    // Initialize targets based on game type
    const initializeTargets = () => {
        const newTargets = [];
        const targetCount = type === 'harvesting' ? 8 : type === 'planting' ? 5 : 6;
        for (let i = 0; i < targetCount; i++) {
            // Create targets with different positions, values based on game type
            const x = Math.random() * 80 + 10; // Keep targets within 10-90% of width
            const y = Math.random() * 60 + 20; // Keep targets within 20-80% of height
            // Different value strategies for different games
            let value = 1;
            if (type === 'planting') {
                // Planting values increase as you progress
                value = Math.floor(i / 2) + 1;
            }
            else if (type === 'harvesting') {
                // Harvesting has some high-value and some low-value targets
                value = Math.random() < 0.3 ? 3 : Math.random() < 0.6 ? 2 : 1;
            }
            else if (type === 'watering') {
                // Watering has different values based on need areas
                value = Math.random() < 0.4 ? 2 : 1;
            }
            else if (type === 'protection') {
                // Protection has higher values for critical areas
                value = Math.random() < 0.25 ? 3 : Math.random() < 0.6 ? 2 : 1;
            }
            newTargets.push({ x, y, value, hit: false });
        }
        setTargets(newTargets);
    };
    // Update game state each frame
    const updateGameState = () => {
        // This is where we'd update animations, target movements, etc.
        // For now it's simple, but could be expanded for more dynamic gameplay
        // Example: Make targets slowly move in simple patterns
        if (type === 'harvesting' || type === 'protection') {
            setTargets(prev => prev.map(target => {
                const newX = target.x + (Math.sin(Date.now() / 1000 + target.y) * 0.2);
                return {
                    ...target,
                    x: Math.max(5, Math.min(95, newX)) // Keep within bounds
                };
            }));
        }
    };
    // Handle player clicks on the game area
    const handleGameClick = (e) => {
        if (!gameActive || gamePhase !== 'active')
            return;
        // Get click position relative to game area
        const gameArea = gameAreaRef.current;
        if (!gameArea)
            return;
        const rect = gameArea.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        // Update player position for visual feedback
        setPlayerPosition({ x, y });
        // Check if any targets were hit
        let hitValue = 0;
        let hitIndex = -1;
        // Find the closest target that was hit
        let closestDistance = 100; // Initialize with large value
        targets.forEach((target, index) => {
            if (target.hit)
                return; // Skip already hit targets
            const distance = Math.sqrt(Math.pow(target.x - x, 2) + Math.pow(target.y - y, 2));
            // Hit radius depends on difficulty and game type
            const hitRadius = type === 'harvesting' ? 8 : type === 'planting' ? 10 : 12;
            const adjustedHitRadius = hitRadius * (1 / difficulty);
            if (distance < adjustedHitRadius && distance < closestDistance) {
                closestDistance = distance;
                hitValue = target.value;
                hitIndex = index;
            }
        });
        // If a target was hit, update it and add score
        if (hitIndex >= 0) {
            // Update targets array
            setTargets(prev => prev.map((target, i) => i === hitIndex ? { ...target, hit: true } : target));
            // Update score
            const timingMultiplier = Math.max(0.5, Math.min(1.5, (timer / 30) * 1.5));
            const precisionMultiplier = Math.max(0.5, 1 - (closestDistance / 20));
            const pointValue = hitValue * timingMultiplier * precisionMultiplier;
            setScore(prev => prev + pointValue);
            // Update precision metric
            setPrecision(prev => (prev + precisionMultiplier) / 2);
            // Update timing metric
            setTiming(prev => (prev + timingMultiplier) / 2);
            // Update technique based on overall patterns and game type
            if (type === 'planting') {
                // For planting, technique improves when hitting targets in ascending order
                const hitTargets = targets.filter(t => t.hit).length;
                const idealOrder = hitValue === hitTargets; // Hitting in order of value
                setTechnique(prev => prev + (idealOrder ? 0.1 : -0.05));
            }
            else if (type === 'watering') {
                // For watering, technique improves with coverage patterns
                const coveredArea = targets.filter(t => t.hit).length / targets.length;
                setTechnique(_prev => Math.max(0, Math.min(1, coveredArea)));
            }
            else {
                // Default technique calculation
                setTechnique(_prev => (_prev + (hitValue / 3)) / 2);
            }
        }
        // Check if all targets are hit
        const allTargetsHit = targets.every(target => target.hit);
        if (allTargetsHit) {
            // Bonus for completing early
            const timeBonus = timer * 2;
            setScore(prev => prev + timeBonus);
            endGame();
        }
    };
    // End the game and calculate final results
    const endGame = () => {
        if (!gameActive)
            return;
        // Clear intervals and animation frames
        if (gameIntervalRef.current)
            clearInterval(gameIntervalRef.current);
        if (animationFrameRef.current)
            cancelAnimationFrame(animationFrameRef.current);
        setGameActive(false);
        setGamePhase('result');
        // Calculate final metrics
        // const hitTargets = targets.filter(t => t.hit).length; // Not currently used
        const totalTargets = targets.length;
        // const completionRate = hitTargets / totalTargets; // Not currently used
        // Normalize score based on game type
        const normalizedScore = Math.min(1, score / (10 * totalTargets));
        // Calculate success threshold (based on difficulty)
        const successThreshold = 0.5 * difficulty;
        const success = normalizedScore >= successThreshold;
        // Calculate bonuses based on game type and performance
        let timingBonus = 0;
        let qualityBonus = 0;
        let yieldBonus = 0;
        if (success) {
            if (type === 'planting') {
                timingBonus = Math.min(0.4, timing * 0.5); // Up to 40% time reduction
                qualityBonus = Math.min(2, precision * 2.5); // Up to +2 quality levels
                yieldBonus = Math.min(1.5, technique * 2); // Up to +150% yield
            }
            else if (type === 'harvesting') {
                timingBonus = 0; // Harvesting doesn't affect growth time
                qualityBonus = Math.min(2, (precision * 1.5) + (technique * 0.5)); // More precision-focused
                yieldBonus = Math.min(2, (precision * 0.5) + (technique * 1.5)); // More technique-focused
            }
            else if (type === 'watering') {
                timingBonus = Math.min(0.2, timing * 0.25); // Small growth time improvement
                qualityBonus = Math.min(1, technique * 1.5); // Moderate quality boost
                yieldBonus = Math.min(1, precision * 1.5); // Moderate yield boost
            }
            else if (type === 'protection') {
                // Protection results depend heavily on weather severity
                // Cast weather to string to handle all possible weather types
                const weatherString = weather;
                const weatherSeverity = weatherString === 'stormy' ? 0.8 :
                    weatherString === 'windy' ? 0.5 :
                        weatherString === 'snowy' ? 0.7 : 0.3;
                const protectionEffectiveness = normalizedScore;
                timingBonus = 0; // Protection doesn't affect growth time
                qualityBonus = Math.min(1, protectionEffectiveness) - (weatherSeverity * (1 - protectionEffectiveness));
                yieldBonus = Math.min(1, protectionEffectiveness) - (weatherSeverity * (1 - protectionEffectiveness));
            }
        }
        else {
            // Failed mini-games have penalties
            if (type === 'planting') {
                qualityBonus = -0.5;
                yieldBonus = -0.3;
            }
            else if (type === 'harvesting') {
                qualityBonus = -1;
                yieldBonus = -0.5;
            }
            else if (type === 'protection') {
                // Cast weather to string to handle all possible weather types
                const weatherString = weather;
                const weatherSeverity = weatherString === 'stormy' ? 0.8 :
                    weatherString === 'windy' ? 0.5 :
                        weatherString === 'snowy' ? 0.7 : 0.3;
                qualityBonus = -weatherSeverity;
                yieldBonus = -weatherSeverity;
            }
        }
        // Create success or failure message
        let message = '';
        if (success) {
            if (type === 'planting') {
                message = 'You planted with skill! The seed nestles perfectly in the soil.';
            }
            else if (type === 'harvesting') {
                message = 'Excellent harvest! You gathered the perfect essence of this plant.';
            }
            else if (type === 'watering') {
                message = 'The garden drinks deeply, water flowing to every thirsty root.';
            }
            else if (type === 'protection') {
                message = `Your protective measures shield the garden from the ${weather} conditions.`;
            }
        }
        else {
            if (type === 'planting') {
                message = 'The planting was hasty. The seed may struggle to take root properly.';
            }
            else if (type === 'harvesting') {
                message = "Your harvest was rough. Some of the plant's essence was lost.";
            }
            else if (type === 'watering') {
                message = 'The watering was uneven. Some areas remain parched while others flood.';
            }
            else if (type === 'protection') {
                message = `Your protective measures failed to fully shield against the ${weather}.`;
            }
        }
        // Create final result
        const result = {
            success,
            timingBonus,
            qualityBonus,
            yieldBonus,
            score: normalizedScore,
            message
        };
        setGameResult(result);
        // Slight delay before sending result to parent component
        setTimeout(() => {
            onComplete(result);
        }, 2000);
    };
    // Get title based on game type
    const getGameTitle = () => {
        switch (type) {
            case 'planting': return 'Seed Planting';
            case 'harvesting': return 'Herb Harvesting';
            case 'watering': return 'Garden Watering';
            case 'protection': return 'Weather Protection';
            default: return 'Garden Mini-Game';
        }
    };
    // Get instructions based on game type
    const getInstructions = () => {
        switch (type) {
            case 'planting':
                return "Plant seeds with care by clicking on the glowing soil spots. Timing and precision matter for the plant's future growth.";
            case 'harvesting':
                return "Harvest mature plants by clicking on the glowing essence points. Be precise to preserve the plant's valuable properties.";
            case 'watering':
                return 'Water your garden by clicking on the dry spots. Ensure even coverage to promote healthy growth.';
            case 'protection':
                return `Protect your garden from ${weather} by reinforcing vulnerable areas. Click quickly to shield your plants from damage.`;
            default:
                return 'Click on the targets to complete the mini-game.';
        }
    };
    // Render targets based on game type
    const renderTargets = () => {
        return targets.map((target, index) => {
            // Different visuals for different game types
            let targetClass = '';
            if (type === 'planting')
                targetClass = 'soil-target';
            else if (type === 'harvesting')
                targetClass = 'harvest-target';
            else if (type === 'watering')
                targetClass = 'water-target';
            else if (type === 'protection')
                targetClass = 'protection-target';
            // Value affects size and appearance
            const valueClass = `value-${target.value}`;
            return (_jsx("div", { className: `target ${targetClass} ${valueClass} ${target.hit ? 'hit' : ''}`, style: {
                    left: `${target.x}%`,
                    top: `${target.y}%`,
                    // Scale size based on value
                    transform: `translate(-50%, -50%) scale(${0.8 + (target.value * 0.2)})`
                } }, index));
        });
    };
    // Render player indicator (cursor effects)
    const renderPlayerIndicator = () => {
        // Different indicators for different game types
        let indicatorClass = '';
        if (type === 'planting')
            indicatorClass = 'planting-indicator';
        else if (type === 'harvesting')
            indicatorClass = 'harvesting-indicator';
        else if (type === 'watering')
            indicatorClass = 'water-indicator';
        else if (type === 'protection')
            indicatorClass = 'protection-indicator';
        return (_jsx("div", { className: `player-indicator ${indicatorClass}`, style: {
                left: `${playerPosition.x}%`,
                top: `${playerPosition.y}%`
            } }));
    };
    // Render game result screen
    const renderResultScreen = () => {
        if (!gameResult)
            return null;
        const { success, qualityBonus, yieldBonus, message } = gameResult;
        return (_jsxs("div", { className: "game-result", children: [_jsx("h3", { className: success ? 'success' : 'failure', children: success ? 'Success!' : 'Could be better...' }), _jsx("p", { className: "result-message", children: message }), _jsxs("div", { className: "result-metrics", children: [type !== 'protection' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "metric", children: [_jsx("label", { children: "Quality Effect:" }), _jsxs("span", { className: qualityBonus >= 0 ? 'positive' : 'negative', children: [qualityBonus > 0 ? '+' : '', Math.round(qualityBonus * 100), "%"] })] }), _jsxs("div", { className: "metric", children: [_jsx("label", { children: "Yield Effect:" }), _jsxs("span", { className: yieldBonus >= 0 ? 'positive' : 'negative', children: [yieldBonus > 0 ? '+' : '', Math.round(yieldBonus * 100), "%"] })] })] })), type === 'protection' && (_jsxs("div", { className: "metric", children: [_jsx("label", { children: "Protection Level:" }), _jsxs("span", { className: qualityBonus >= 0 ? 'positive' : 'negative', children: [Math.round(Math.max(0, (qualityBonus + 1) * 50)), "%"] })] }))] })] }));
    };
    // Main render
    return (_jsxs("div", { className: "garden-mini-game-container", children: [_jsx("div", { className: "game-overlay" }), _jsxs("div", { className: "game-modal", children: [_jsxs("div", { className: "game-header", children: [_jsx("h2", { children: getGameTitle() }), gamePhase === 'active' && (_jsxs("div", { className: "game-timer", children: [_jsx("div", { className: "timer-bar", children: _jsx("div", { className: "timer-fill", style: { width: `${(timer / 30) * 100}%` } }) }), _jsxs("span", { children: [timer, "s"] })] })), _jsx("button", { className: "close-button", onClick: onCancel, disabled: gameActive, children: "\u00D7" })] }), _jsxs("div", { className: "game-content", children: [gamePhase === 'intro' && showInstructions && (_jsxs("div", { className: "game-instructions", children: [_jsx("p", { children: getInstructions() }), _jsxs("div", { className: "seasonal-note", children: [_jsx("span", { className: "season-icon", children: season === 'Spring' ? '🌱' :
                                                    season === 'Summer' ? '☀️' :
                                                        season === 'Fall' ? '🍂' : '❄️' }), _jsxs("span", { children: ["Current Season: ", season] })] }), _jsxs("div", { className: "moon-note", children: [_jsx("span", { className: "moon-icon", children: moonPhase.includes('Full') ? '🌕' :
                                                    moonPhase.includes('New') ? '🌑' :
                                                        moonPhase.includes('Crescent') ? '🌙' : '🌓' }), _jsxs("span", { children: ["Moon Phase: ", moonPhase] })] }), _jsxs("button", { className: "start-button", onClick: startGameCountdown, children: ["Begin ", type === 'planting' ? 'Planting' :
                                                type === 'harvesting' ? 'Harvesting' :
                                                    type === 'watering' ? 'Watering' : 'Protection'] })] })), countdownActive && (_jsx("div", { className: "countdown-overlay", children: _jsx("div", { className: "countdown", children: countdown }) })), gamePhase === 'active' || gamePhase === 'result' ? (_jsxs("div", { ref: gameAreaRef, className: `game-area ${type}-game ${gamePhase === 'result' ? 'completed' : ''}`, onClick: handleGameClick, children: [_jsx("div", { className: `game-background ${type}-background ${season.toLowerCase()}` }), renderTargets(), gamePhase === 'active' && renderPlayerIndicator(), gamePhase === 'result' && renderResultScreen()] })) : null] })] })] }));
};
export default GardenMiniGame;
//# sourceMappingURL=GardenMiniGame.js.map