import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './GardenPlot.css';
const GardenPlot = ({ plot, selected, onClick, season = 'Spring', }) => {
    // States for animations and interactions
    const [showHarvestGlow, setShowHarvestGlow] = useState(false);
    const [showPlantHint, setShowPlantHint] = useState(false);
    const [whisperActive, setWhisperActive] = useState(false);
    const [whisperMessage, setWhisperMessage] = useState('');
    const [pulsing, setPulsing] = useState(false);
    // Easter egg click counter
    const [secretClickCount, setSecretClickCount] = useState(0);
    // Define whisper messages for plants
    const plantWhispers = [
        "I grow with the moon's blessing...",
        "The earth nurtures my roots...",
        "Tend to me with care, witch...",
        "I hold ancient secrets within...",
        "My essence will strengthen your brews..."
    ];
    // Determine if plot is locked
    const isLocked = plot.isUnlocked === false;
    // Effect for harvest glow animation
    useEffect(() => {
        let glowInterval = null;
        if (plot.plant?.mature) {
            // Start pulsing glow effect for harvest-ready plants
            glowInterval = setInterval(() => {
                setShowHarvestGlow(prev => !prev);
            }, 1500);
        }
        else {
            setShowHarvestGlow(false);
        }
        // Cleanup
        return () => {
            if (glowInterval)
                clearInterval(glowInterval);
        };
    }, [plot.plant?.mature]);
    // Start ambient animation
    useEffect(() => {
        const pulseInterval = setInterval(() => {
            setPulsing(prev => !prev);
        }, 3000);
        return () => clearInterval(pulseInterval);
    }, []);
    // Handle secret clicks for Easter egg
    const handleSecretClick = (e) => {
        e.stopPropagation(); // Don't trigger regular onClick
        if (!plot.plant || isLocked)
            return;
        // Increase secret click counter
        const newCount = secretClickCount + 1;
        setSecretClickCount(newCount);
        // If clicked 3 times rapidly, show plant whisper
        if (newCount >= 3 && !whisperActive) {
            const randomWhisper = plantWhispers[Math.floor(Math.random() * plantWhispers.length)];
            setWhisperMessage(randomWhisper);
            setWhisperActive(true);
            // Hide whisper after 5 seconds
            setTimeout(() => {
                setWhisperActive(false);
            }, 5000);
            // Reset counter
            setSecretClickCount(0);
        }
        else {
            // Reset counter if not clicked quickly enough
            setTimeout(() => {
                if (secretClickCount === newCount) {
                    setSecretClickCount(0);
                }
            }, 2000);
        }
    };
    // Show plant hint when hovering empty plot
    const handleMouseEnter = () => {
        if (!plot.plant && !isLocked) {
            setShowPlantHint(true);
        }
    };
    const handleMouseLeave = () => {
        setShowPlantHint(false);
    };
    // Get growth stage for visual representation
    const getGrowthStage = (plant) => {
        if (!plant || plant.growth === undefined || plant.maxGrowth === undefined) {
            return 'empty';
        }
        if (plant.mature)
            return 'mature';
        const growthPercentage = (plant.growth / plant.maxGrowth) * 100;
        if (growthPercentage < 25)
            return 'seedling';
        if (growthPercentage < 50)
            return 'sprout';
        if (growthPercentage < 75)
            return 'growing';
        return 'maturing';
    };
    // Get plant health class
    const getHealthClass = (plant) => {
        if (!plant || plant.health === undefined)
            return '';
        if (plant.health < 30)
            return 'unhealthy';
        if (plant.health < 70)
            return 'fair';
        return 'healthy';
    };
    // Get moisture class for visual appearance
    const getMoistureClass = () => {
        const moisture = plot.moisture ?? 50;
        if (moisture < 30)
            return 'dry';
        if (moisture > 80)
            return 'wet';
        return 'normal';
    };
    // Determine if plant needs water
    const needsWater = (plant) => {
        if (!plant || plant.mature)
            return false;
        return (plot.moisture ?? 50) < 40;
    };
    // Get category-specific class
    const getPlantCategoryClass = (plant) => {
        if (!plant)
            return '';
        return plant.category ? plant.category.toLowerCase() : 'herb';
    };
    // Render plant visualization based on growth stage and category
    const renderPlant = () => {
        if (!plot.plant)
            return null;
        const growthStage = getGrowthStage(plot.plant);
        const healthClass = getHealthClass(plot.plant);
        const categoryClass = getPlantCategoryClass(plot.plant);
        return (_jsxs("div", { className: `plant ${healthClass} ${categoryClass} ${pulsing ? 'pulse' : ''}`, onDoubleClick: handleSecretClick, children: [_jsxs("div", { className: `plant-visual ${growthStage}`, children: [_jsx("div", { className: "plant-sprite" }), plot.plant.moonBlessed && _jsx("div", { className: "moon-blessing" }), plot.plant.seasonalModifier && plot.plant.seasonalModifier > 1.2 &&
                            _jsx("div", { className: "season-boost" }), plot.plant.seasonalModifier && plot.plant.seasonalModifier < 0.8 &&
                            _jsx("div", { className: "season-penalty" })] }), whisperActive && (_jsx("div", { className: "plant-whisper", children: _jsx("div", { className: "whisper-text", children: whisperMessage }) }))] }));
    };
    // Render plot status indicators
    const renderPlotStatus = () => {
        return (_jsxs("div", { className: "plot-status", children: [plot.plant?.mature && (_jsx("div", { className: `status-indicator harvest-ready ${showHarvestGlow ? 'glow' : ''}`, title: "Ready to Harvest" })), needsWater(plot.plant) && (_jsx("div", { className: "status-indicator needs-water", title: "Needs Water" })), !plot.plant && !isLocked && (_jsx("div", { className: "status-indicator empty-plot", title: "Empty Plot" }))] }));
    };
    // Combine all CSS classes
    const plotClasses = [
        'garden-plot',
        isLocked ? 'locked' : '',
        selected ? 'selected' : '',
        getMoistureClass(),
        season.toLowerCase(), // Add season class
        plot.plant?.mature ? 'mature' : '',
    ].filter(Boolean).join(' ');
    return (_jsx("div", { className: plotClasses, onClick: isLocked ? undefined : onClick, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, children: isLocked ? (_jsx("div", { className: "locked-overlay", children: _jsx("div", { className: "lock-icon" }) })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "plot-soil" }), renderPlant(), renderPlotStatus(), _jsxs("div", { className: "selection-frame", children: [_jsx("div", { className: "corner top-left" }), _jsx("div", { className: "corner top-right" }), _jsx("div", { className: "corner bottom-left" }), _jsx("div", { className: "corner bottom-right" })] }), showPlantHint && !plot.plant && (_jsx("div", { className: "plant-hint", children: _jsx("div", { className: "hint-text", children: "Plant Here" }) }))] })) }));
};
export default GardenPlot;
//# sourceMappingURL=GardenPlot.js.map