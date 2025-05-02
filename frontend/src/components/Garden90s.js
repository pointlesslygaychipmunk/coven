import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './Garden90s.css';
const Garden90s = ({ plots, inventory, onPlant, onHarvest, onWater, weatherFate = 'normal', season = 'Spring' }) => {
    // State for plot and seed selection
    const [selectedPlotId, setSelectedPlotId] = useState(null);
    const [selectedSeedId, setSelectedSeedId] = useState(null);
    // State for garden whispers and tips
    const [gardenTip, setGardenTip] = useState('');
    const [showWhisper, setShowWhisper] = useState(false);
    const [whisperText, setWhisperText] = useState('');
    // State for attunement bonus
    const [attunementActive, setAttunementActive] = useState(false);
    const [attunementPower, setAttunementPower] = useState(0);
    // Garden whispers (wisdom that appears periodically)
    const gardenWhispers = [
        "The moon blesses plants harvested under its full glow...",
        "A plant's quality reflects its care and the soil it grows in...",
        "Some herbs thrive in unexpected seasons...",
        "Balance the elements to nurture your garden's spirit...",
        "Plants whisper their needs, if you listen closely...",
        "Each plant has a season where it thrives most brilliantly...",
        "Patience is the greatest virtue of a garden witch...",
        "Harmonizing with the season unlocks potent growth."
    ];
    // Initialize with a random tip
    useEffect(() => {
        setGardenTip(gardenWhispers[Math.floor(Math.random() * gardenWhispers.length)]);
        // Set up whispers to appear periodically
        const whisperInterval = setInterval(() => {
            if (Math.random() < 0.3 && !showWhisper) { // 30% chance every interval
                const randomWhisper = gardenWhispers[Math.floor(Math.random() * gardenWhispers.length)];
                setWhisperText(randomWhisper);
                setShowWhisper(true);
                // Hide whisper after a few seconds
                setTimeout(() => {
                    setShowWhisper(false);
                }, 6000);
            }
        }, 45000); // Check every 45 seconds
        return () => clearInterval(whisperInterval);
    }, [showWhisper]);
    // Get available seeds from inventory
    const getAvailableSeeds = () => {
        return inventory.filter(item => item.type === 'seed' && item.quantity > 0);
    };
    // Get selected plot details
    const getSelectedPlot = () => {
        if (selectedPlotId === null)
            return undefined;
        return plots.find(plot => plot.id === selectedPlotId);
    };
    // Handle plot selection
    const handlePlotClick = (plotId) => {
        const plot = plots.find(p => p.id === plotId);
        if (!plot || plot.isUnlocked === false)
            return;
        if (selectedPlotId === plotId) {
            setSelectedPlotId(null); // Deselect if already selected
        }
        else {
            setSelectedPlotId(plotId);
        }
    };
    // Handle seed selection
    const handleSeedSelect = (seedId) => {
        if (selectedSeedId === seedId) {
            setSelectedSeedId(null); // Deselect if already selected
        }
        else {
            setSelectedSeedId(seedId);
        }
    };
    // Handle planting action
    const handlePlant = () => {
        const selectedPlot = getSelectedPlot();
        if (!selectedPlot || selectedPlot.plant || selectedPlotId === null || !selectedSeedId) {
            return; // Invalid planting conditions
        }
        // Visual feedback before actual planting
        const seedName = inventory.find(item => item.id === selectedSeedId)?.name || 'seed';
        setWhisperText(`Planting ${seedName}...`);
        setShowWhisper(true);
        // Call the planting action
        onPlant(selectedPlotId, selectedSeedId);
        // Reset selection after planting
        setSelectedSeedId(null);
        setTimeout(() => setShowWhisper(false), 3000);
    };
    // Handle harvesting action
    const handleHarvest = () => {
        const plot = getSelectedPlot();
        if (plot?.plant?.mature) {
            // Visual feedback
            setWhisperText(`Harvesting ${plot.plant.name}...`);
            setShowWhisper(true);
            // Call harvest action
            onHarvest(plot.id);
            // Reset selection after harvesting
            setSelectedPlotId(null);
            setTimeout(() => setShowWhisper(false), 3000);
        }
    };
    // Handle watering/attunement action
    const handleAttunement = () => {
        // Visual attunement effect
        setAttunementActive(true);
        // Calculate attunement power based on current season and moon phase
        // This would be more sophisticated in the real game
        const basePower = Math.floor(Math.random() * 20) + 10; // 10-30% bonus
        setAttunementPower(basePower);
        // Show feedback
        setWhisperText(`Attuning garden with ${basePower}% seasonal energy...`);
        setShowWhisper(true);
        // Trigger water action with calculated bonus
        onWater(basePower);
        // Reset after effect completes
        setTimeout(() => {
            setAttunementActive(false);
            setShowWhisper(false);
        }, 4000);
    };
    // Clear seed selection
    const handleClearSelection = () => {
        setSelectedSeedId(null);
    };
    // Render garden grid
    const renderPlots = () => {
        return (_jsx("div", { className: "garden-grid", children: plots.map(plot => {
                const isLocked = plot.isUnlocked === false;
                const hasPlant = !!plot.plant;
                const isMature = plot.plant?.mature || false;
                return (_jsxs("div", { className: `garden-plot ${isLocked ? 'locked' : ''} ${hasPlant ? 'has-plant' : ''} ${isMature ? 'mature' : ''} ${selectedPlotId === plot.id ? 'selected' : ''}`, onClick: () => handlePlotClick(plot.id), children: [isLocked ? (_jsx("div", { className: "lock-icon", children: "\uD83D\uDD12" })) : hasPlant ? (_jsxs("div", { className: "plant-display", children: [_jsx("div", { className: "plant-icon", children: getPlantIcon(plot.plant.name) }), _jsx("div", { className: "growth-indicator", style: { height: `${(plot.plant.growth / plot.plant.maxGrowth) * 100}%` } })] })) : (_jsx("div", { className: "empty-plot" })), _jsx("div", { className: "plot-number", children: plot.id + 1 })] }, plot.id));
            }) }));
    };
    // Helper to get plant icon based on name
    const getPlantIcon = (plantName) => {
        // In a real implementation, you'd have specific icons for each plant
        const firstChar = plantName.charAt(0).toUpperCase();
        switch (plantName.toLowerCase()) {
            case 'moonflower': return '✧';
            case 'ginseng': return 'G';
            case 'chamomile': return 'C';
            case 'lavender': return 'L';
            default: return firstChar;
        }
    };
    // Render seed inventory 
    const renderSeedInventory = () => {
        const seeds = getAvailableSeeds();
        return (_jsxs("div", { className: "seed-inventory", children: [_jsx("div", { className: "seed-list-header", children: _jsx("h3", { children: "Seeds" }) }), _jsx("div", { className: "seed-list", children: seeds.length === 0 ? (_jsx("div", { className: "empty-seeds", children: "No seeds in inventory" })) : (seeds.map(seed => (_jsxs("div", { className: `seed-item ${selectedSeedId === seed.id ? 'selected' : ''}`, onClick: () => handleSeedSelect(seed.id), children: [_jsx("div", { className: "seed-icon", children: seed.name.charAt(0).toUpperCase() }), _jsxs("div", { className: "seed-info", children: [_jsx("div", { className: "seed-name", children: seed.name }), _jsxs("div", { className: "seed-quantity", children: ["x", seed.quantity] })] })] }, seed.id)))) })] }));
    };
    // Render plot details panel
    const renderPlotDetails = () => {
        const selectedPlot = getSelectedPlot();
        if (!selectedPlot) {
            return (_jsxs("div", { className: "plot-details", children: [_jsx("h3", { children: "Garden Plot" }), _jsxs("div", { className: "detail-content", children: [_jsx("p", { children: "Select a plot to view details" }), _jsx("div", { className: "garden-tip", children: gardenTip })] })] }));
        }
        if (selectedPlot.isUnlocked === false) {
            return (_jsxs("div", { className: "plot-details", children: [_jsxs("h3", { children: ["Plot ", selectedPlot.id + 1, " (Locked)"] }), _jsx("div", { className: "detail-content", children: _jsxs("div", { className: "locked-message", children: [_jsx("div", { className: "big-lock", children: "\uD83D\uDD12" }), _jsx("p", { children: "This plot is locked. Expand your garden through achievements." })] }) })] }));
        }
        // Plot is unlocked - show details
        return (_jsxs("div", { className: "plot-details", children: [_jsxs("h3", { children: ["Plot ", selectedPlot.id + 1] }), _jsxs("div", { className: "detail-content", children: [_jsxs("div", { className: "soil-meters", children: [_jsxs("div", { className: "meter-row", children: [_jsx("span", { className: "meter-label", children: "Fertility:" }), _jsxs("div", { className: "meter-bar", children: [_jsx("div", { className: "meter-fill fertility", style: { width: `${selectedPlot.fertility || 0}%` } }), _jsxs("span", { className: "meter-value", children: [selectedPlot.fertility || 0, "%"] })] })] }), _jsxs("div", { className: "meter-row", children: [_jsx("span", { className: "meter-label", children: "Moisture:" }), _jsxs("div", { className: "meter-bar", children: [_jsx("div", { className: "meter-fill moisture", style: { width: `${selectedPlot.moisture || 0}%` } }), _jsxs("span", { className: "meter-value", children: [selectedPlot.moisture || 0, "%"] })] })] })] }), selectedPlot.plant ? (_jsxs("div", { className: "plant-details", children: [_jsx("h4", { children: selectedPlot.plant.name }), _jsxs("div", { className: "meter-row", children: [_jsx("span", { className: "meter-label", children: "Growth:" }), _jsxs("div", { className: "meter-bar", children: [_jsx("div", { className: "meter-fill growth", style: { width: `${(selectedPlot.plant.growth / selectedPlot.plant.maxGrowth) * 100}%` } }), _jsxs("span", { className: "meter-value", children: [Math.round((selectedPlot.plant.growth / selectedPlot.plant.maxGrowth) * 100), "%"] })] })] }), _jsxs("div", { className: "meter-row", children: [_jsx("span", { className: "meter-label", children: "Health:" }), _jsxs("div", { className: "meter-bar", children: [_jsx("div", { className: "meter-fill health", style: { width: `${selectedPlot.plant.health || 0}%` } }), _jsxs("span", { className: "meter-value", children: [selectedPlot.plant.health || 0, "%"] })] })] }), _jsxs("div", { className: "plant-age", children: ["Age: ", selectedPlot.plant.age, " ", selectedPlot.plant.age === 1 ? 'day' : 'days'] }), selectedPlot.plant.mature && (_jsx("button", { className: "garden-button harvest", onClick: handleHarvest, children: _jsx("span", { className: "button-text", children: "Harvest" }) }))] })) : (_jsxs("div", { className: "empty-plot-message", children: [_jsx("p", { children: "This plot is empty and ready for planting." }), selectedSeedId && (_jsx("button", { className: "garden-button plant", onClick: handlePlant, children: _jsx("span", { className: "button-text", children: "Plant Seed" }) }))] }))] })] }));
    };
    // Render weather and season indicators
    const renderGardenInfo = () => {
        return (_jsxs("div", { className: "garden-info", children: [_jsxs("div", { className: "info-item weather", children: [_jsx("div", { className: "info-label", children: "Weather:" }), _jsxs("div", { className: "info-value", children: [_jsx("span", { className: "weather-icon", children: getWeatherIcon(weatherFate) }), _jsx("span", { children: capitalizeFirst(weatherFate) })] })] }), _jsxs("div", { className: "info-item season", children: [_jsx("div", { className: "info-label", children: "Season:" }), _jsxs("div", { className: "info-value", children: [_jsx("span", { className: "season-icon", children: getSeasonIcon(season) }), _jsx("span", { children: season })] })] })] }));
    };
    // Helper to get weather icon
    const getWeatherIcon = (weather) => {
        switch (weather) {
            case 'rainy': return '🌧️';
            case 'stormy': return '⛈️';
            case 'windy': return '💨';
            case 'dry': return '☀️';
            case 'foggy': return '🌫️';
            default: return '🌤️';
        }
    };
    // Helper to get season icon
    const getSeasonIcon = (season) => {
        switch (season) {
            case 'Spring': return '🌱';
            case 'Summer': return '☀️';
            case 'Fall': return '🍂';
            case 'Winter': return '❄️';
            default: return '';
        }
    };
    // Helper to capitalize first letter
    const capitalizeFirst = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };
    // Garden actions (attunement, etc.)
    const renderGardenActions = () => {
        return (_jsxs("div", { className: "garden-actions", children: [_jsx("button", { className: "garden-button attune", onClick: handleAttunement, disabled: attunementActive, children: _jsx("span", { className: "button-text", children: "Attune Garden" }) }), selectedSeedId && (_jsx("button", { className: "garden-button clear", onClick: handleClearSelection, children: _jsx("span", { className: "button-text", children: "Clear Selection" }) }))] }));
    };
    return (_jsxs("div", { className: `garden90s-container ${season.toLowerCase()}`, children: [_jsxs("div", { className: "garden-header", children: [_jsx("h2", { children: "Witch's Garden" }), renderGardenInfo()] }), _jsxs("div", { className: "garden-main", children: [_jsxs("div", { className: "garden-left-panel", children: [renderPlots(), renderGardenActions()] }), _jsxs("div", { className: "garden-right-panel", children: [renderPlotDetails(), renderSeedInventory()] })] }), showWhisper && (_jsx("div", { className: "garden-whisper", children: _jsx("div", { className: "whisper-text", children: whisperText }) })), attunementActive && (_jsxs("div", { className: "attunement-overlay", children: [_jsx("div", { className: "attunement-particles", children: Array.from({ length: 20 }).map((_, i) => (_jsx("div", { className: "attunement-particle", style: {
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`
                            } }, i))) }), _jsxs("div", { className: "attunement-power", children: [attunementPower, "%"] })] })), _jsx("div", { className: "corner-decoration top-left" }), _jsx("div", { className: "corner-decoration top-right" }), _jsx("div", { className: "corner-decoration bottom-left" }), _jsx("div", { className: "corner-decoration bottom-right" })] }));
};
export default Garden90s;
//# sourceMappingURL=Garden90s.js.map