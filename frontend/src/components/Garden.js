import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './Garden.css';
import GardenPlot from './GardenPlot';
import SeasonalAttunementPuzzle from './SeasonalAttunementPuzzle';
const Garden = ({ plots, inventory, onPlant, onHarvest, onWater, weatherFate = 'normal', season = 'Spring' }) => {
    // State for plot and seed selection
    const [selectedPlotId, setSelectedPlotId] = useState(null);
    const [selectedSeedId, setSelectedSeedId] = useState(null);
    // State for UI elements and animations
    const [attunementAnimation, setAttunementAnimation] = useState(false);
    const [showWhisper, setShowWhisper] = useState(null);
    const [gardenTip, setGardenTip] = useState('');
    const [showAttunementPuzzle, setShowAttunementPuzzle] = useState(false);
    const [showEastEgg, setShowEastEgg] = useState(false);
    // Garden whispers (tips that appear randomly)
    const gardenWhispers = [
        "The moon blesses plants harvested under its full glow...",
        "A plant's quality reflects its care and the soil it grows in...",
        "Some herbs thrive in unexpected seasons...",
        "Balance the elements to nurture your garden's spirit...",
        "Plants whisper their needs, if you listen closely...",
        "Each plant has a season where it thrives most brilliantly...",
        "Moonbuds prefer the gentle light of evening skies...",
        "Patience is the greatest virtue of a garden witch...",
        "Harmonizing with the season unlocks potent growth.",
        "Even failed experiments can yield useful compost."
    ];
    // Hanbang Gardening Tips (for Easter Egg)
    const hanbangTips = [
        "Ginseng thrives in shaded, moist soil. Patience yields potency.",
        "Mugwort prefers sunlight and aids circulation when brewed.",
        "Licorice root harmonizes other herbs and soothes the skin.",
        "Angelica root is warming and promotes vitality, especially in colder months.",
        "Peony root is valued for its calming and brightening properties."
    ];
    // Show random garden whisper/tip periodically
    useEffect(() => {
        const randomTip = gardenWhispers[Math.floor(Math.random() * gardenWhispers.length)];
        setGardenTip(randomTip); // Set initial tip
        const whisperInterval = setInterval(() => {
            if (Math.random() < 0.25 && !showWhisper && !showAttunementPuzzle) {
                const randomWhisper = gardenWhispers[Math.floor(Math.random() * gardenWhispers.length)];
                setShowWhisper(randomWhisper);
                setTimeout(() => setShowWhisper(null), 7000);
            }
        }, 30000);
        return () => clearInterval(whisperInterval);
    }, [showWhisper, showAttunementPuzzle]);
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
    // Handle plot click
    const handlePlotClick = (plotId) => {
        const plot = plots.find(p => p.id === plotId);
        if (!plot || plot.isUnlocked === false)
            return;
        if (selectedPlotId === plotId) {
            setSelectedPlotId(null);
        }
        else {
            setSelectedPlotId(plotId);
        }
    };
    // Handle seed selection from inventory
    const handleSeedSelect = (seedId) => {
        setSelectedSeedId(seedId === selectedSeedId ? null : seedId);
    };
    // Handle planting the selected seed
    const handlePlant = () => {
        const selectedPlot = getSelectedPlot();
        if (!selectedPlot || selectedPlot.plant || selectedPlotId === null || !selectedSeedId) {
            return;
        }
        onPlant(selectedPlotId, selectedSeedId);
        setSelectedSeedId(null);
    };
    // Handle harvesting from the selected plot
    const handleHarvest = () => {
        const plot = getSelectedPlot();
        if (plot?.plant?.mature) {
            onHarvest(plot.id);
            setSelectedPlotId(null);
        }
    };
    // Clear selection
    const handleClearSelection = () => {
        setSelectedSeedId(null);
    };
    // Start the seasonal attunement puzzle
    const handleStartAttunement = () => {
        if (showAttunementPuzzle)
            return;
        setShowAttunementPuzzle(true);
    };
    // Handle when attunement puzzle completes
    const handlePuzzleComplete = (result) => {
        setShowAttunementPuzzle(false);
        setShowWhisper(result.message);
        setTimeout(() => setShowWhisper(null), 5000);
        if (result.success) {
            setAttunementAnimation(true);
            onWater(result.bonus);
            setTimeout(() => setAttunementAnimation(false), 1500);
        }
        else {
            onWater(0);
        }
    };
    // Handle skipping the puzzle
    const handleSkipPuzzle = () => {
        setShowAttunementPuzzle(false);
        setShowWhisper("Skipped attunement. Energies remain unchanged.");
        setTimeout(() => setShowWhisper(null), 5000);
        onWater(0);
    };
    // Easter Egg: Handle secret spot click
    const handleSecretSpotClick = (e) => {
        e.stopPropagation();
        setShowEastEgg(true);
        const randomHanbangTip = hanbangTips[Math.floor(Math.random() * hanbangTips.length)];
        setShowWhisper(`Hanbang Secret: ${randomHanbangTip}`);
        setTimeout(() => {
            setShowWhisper(prev => prev === `Hanbang Secret: ${randomHanbangTip}` ? null : prev);
            setShowEastEgg(false);
        }, 9000);
    };
    // Render garden plots in a grid
    const renderPlots = () => {
        return Array.from({ length: 9 }).map((_, i) => {
            const plot = plots.find(p => p.id === i);
            if (plot) {
                return (_jsx(GardenPlot, { plot: plot, selected: selectedPlotId === plot.id, onClick: () => handlePlotClick(plot.id), season: season }, plot.id));
            }
            else {
                return (_jsx("div", { className: "garden-plot placeholder locked", children: _jsx("div", { className: "locked-overlay", children: _jsx("div", { className: "lock-icon", children: "\uD83D\uDD12" }) }) }, `placeholder-${i}`));
            }
        });
    };
    // Render weather indicator
    const renderWeatherIndicator = () => {
        let icon;
        let label = weatherFate.charAt(0).toUpperCase() + weatherFate.slice(1);
        switch (weatherFate) {
            case 'rainy':
                icon = '🌧️';
                break;
            case 'dry':
                icon = '☀️';
                break;
            case 'foggy':
                icon = '🌫️';
                break;
            case 'windy':
                icon = '💨';
                break;
            case 'stormy':
                icon = '⛈️';
                break;
            case 'normal':
            default:
                icon = '🌤️';
                label = 'Clear';
                break;
        }
        return (_jsxs("div", { className: "weather-indicator", children: [_jsx("div", { className: "weather-icon", children: icon }), _jsx("div", { className: "weather-label", children: label })] }));
    };
    // Render season indicator
    const renderSeasonIndicator = () => {
        let icon;
        switch (season) {
            case 'Spring':
                icon = '🌱';
                break;
            case 'Summer':
                icon = '☀️';
                break;
            case 'Fall':
                icon = '🍂';
                break;
            case 'Winter':
                icon = '❄️';
                break;
            default: icon = '❔';
        }
        return (_jsxs("div", { className: "season-indicator", children: [_jsx("div", { className: "season-icon", children: icon }), _jsx("div", { className: "season-label", children: season })] }));
    };
    // Render plot details panel
    const renderPlotDetails = () => {
        const selectedPlot = getSelectedPlot();
        // Default view when no plot is selected
        if (!selectedPlot) {
            return (_jsxs("div", { className: "plot-details", children: [_jsxs("div", { className: "scroll-header", children: [_jsx("div", { className: "scroll-ornament left" }), _jsx("h3", { children: "Plot Details" }), _jsx("div", { className: "scroll-ornament right" })] }), _jsxs("div", { className: "parchment-content", children: [_jsx("p", { children: "Select a garden plot to view details." }), _jsx("p", { className: "garden-tip", children: gardenTip }), _jsx("div", { className: "parchment-filler" })] })] }));
        }
        // Locked plot view
        if (selectedPlot.isUnlocked === false) {
            return (_jsxs("div", { className: "plot-details", children: [_jsxs("div", { className: "scroll-header", children: [_jsx("div", { className: "scroll-ornament left" }), _jsxs("h3", { children: ["Plot ", selectedPlot.id + 1] }), _jsx("div", { className: "scroll-ornament right" })] }), _jsxs("div", { className: "parchment-content", children: [_jsx("p", { children: "This plot is currently locked. Expand your garden through rituals or achievements." }), _jsx("div", { className: "lock-icon locked-plot-icon" }), _jsx("div", { className: "parchment-filler" })] })] }));
        }
        // Details for unlocked plot
        const plant = selectedPlot.plant;
        const growthPercent = plant?.growth !== undefined && plant.maxGrowth
            ? Math.min(100, Math.max(0, (plant.growth / plant.maxGrowth) * 100))
            : 0;
        return (_jsxs("div", { className: "plot-details", children: [_jsxs("div", { className: "scroll-header", children: [_jsx("div", { className: "scroll-ornament left" }), _jsxs("h3", { children: ["Plot ", selectedPlot.id + 1] }), _jsx("div", { className: "scroll-ornament right" })] }), _jsxs("div", { className: "parchment-content", children: [_jsxs("div", { className: "plot-stats", children: [_jsxs("div", { className: "plot-stat", children: [_jsxs("div", { className: "stat-label", children: [_jsx("span", { children: "Fertility" }), _jsxs("span", { children: [selectedPlot.fertility || 0, "%"] })] }), _jsx("div", { className: "stat-bar", children: _jsx("div", { className: "stat-fill fertility", style: { width: `${selectedPlot.fertility || 0}%` } }) })] }), _jsxs("div", { className: "plot-stat", children: [_jsxs("div", { className: "stat-label", children: [_jsx("span", { children: "Moisture" }), _jsxs("span", { children: [selectedPlot.moisture || 0, "%"] })] }), _jsx("div", { className: "stat-bar", children: _jsx("div", { className: "stat-fill moisture", style: { width: `${selectedPlot.moisture || 0}%` } }) })] })] }), plant ? (_jsxs("div", { className: "plant-info", children: [_jsx("h4", { children: plant.name }), _jsxs("div", { className: "plant-progress", children: [_jsxs("div", { className: "progress-label", children: [_jsx("span", { children: "Growth" }), _jsxs("span", { children: [growthPercent.toFixed(0), "%"] })] }), _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${growthPercent}%` } }) })] }), _jsxs("div", { className: "plant-stats", children: [_jsxs("div", { className: "plant-stat", children: [_jsx("div", { className: "stat-label", children: "Health" }), _jsxs("div", { className: "stat-value", children: [plant.health?.toFixed(0) ?? '?', "%"] })] }), _jsxs("div", { className: "plant-stat", children: [_jsx("div", { className: "stat-label", children: "Age" }), _jsxs("div", { className: "stat-value", children: [plant.age ?? '?', " ", plant.age === 1 ? 'phase' : 'phases'] })] })] }), plant.moonBlessed && _jsx("div", { className: "plant-blessing", children: "\u2727 Moon Blessed \u2727" }), plant.seasonalModifier && plant.seasonalModifier !== 1.0 && (_jsx("div", { className: "plant-season", children: plant.seasonalModifier > 1 ?
                                        _jsxs("span", { className: "boost", children: ["Thriving (+", Math.round((plant.seasonalModifier - 1) * 100), "%)"] }) :
                                        _jsxs("span", { className: "penalty", children: ["Struggling (-", Math.round((1 - plant.seasonalModifier) * 100), "%)"] }) })), plant.mature ? (_jsx("button", { className: "action-button harvest", onClick: handleHarvest, children: _jsx("span", { children: "Harvest" }) })) : (_jsx("div", { className: "plant-status", children: "Growing..." }))] })) : (_jsx("div", { className: "empty-plot-status", children: _jsx("p", { children: "This plot is empty." }) })), _jsx("div", { className: "garden-actions", children: _jsx("button", { className: "action-button attunement", onClick: handleStartAttunement, disabled: showAttunementPuzzle, children: _jsx("span", { children: "Attune Garden" }) }) }), _jsx("div", { className: "parchment-filler" })] })] }));
    };
    // Render seed pouch panel
    const renderSeedPouch = () => {
        const seeds = getAvailableSeeds();
        const selectedPlot = getSelectedPlot();
        const canPlant = selectedPlot && !selectedPlot.plant && selectedPlot.isUnlocked !== false;
        return (_jsxs("div", { className: "inventory-panel", children: [_jsxs("div", { className: "scroll-header", children: [_jsx("div", { className: "scroll-ornament left" }), _jsx("h3", { children: "Seed Pouch" }), _jsx("div", { className: "scroll-ornament right" })] }), _jsxs("div", { className: "parchment-content", children: [_jsxs("div", { className: "seed-actions fixed-actions", children: [_jsx("button", { className: `action-button plant ${!canPlant || !selectedSeedId ? 'disabled' : ''}`, disabled: !canPlant || !selectedSeedId, onClick: handlePlant, children: _jsx("span", { children: "Plant Seed" }) }), _jsx("button", { className: `action-button clear ${!selectedSeedId ? 'disabled' : ''}`, disabled: !selectedSeedId, onClick: handleClearSelection, children: _jsx("span", { children: "Clear" }) })] }), seeds.length === 0 ? (_jsx("p", { children: "Your seed pouch is empty!" })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "seed-list", children: seeds.map(seed => (_jsxs("div", { className: `seed-item ${selectedSeedId === seed.id ? 'selected' : ''}`, onClick: () => handleSeedSelect(seed.id), children: [_jsx("div", { className: "seed-image", children: _jsx("div", { className: "seed-placeholder", children: seed.name.charAt(0).toUpperCase() }) }), _jsx("div", { className: "seed-quantity", children: seed.quantity }), _jsx("div", { className: "seed-name", children: seed.name })] }, seed.id))) }), _jsx("p", { className: "garden-tip", children: gardenTip }), _jsx("div", { className: "parchment-filler" })] }))] })] }));
    };
    return (_jsxs("div", { className: `garden-container ${season.toLowerCase()}`, children: [_jsxs("div", { className: "garden-frame", children: [_jsxs("div", { className: "garden-header", children: [_jsx("div", { className: "scroll-ornament left" }), _jsx("h2", { children: "Witch's Garden" }), _jsx("div", { className: "scroll-ornament right" }), _jsxs("div", { className: "garden-indicators", children: [renderWeatherIndicator(), renderSeasonIndicator()] })] }), _jsxs("div", { className: "garden-content", children: [_jsxs("div", { className: "garden-grid", children: [_jsx("div", { className: "grid-background" }), renderPlots(), _jsx("div", { className: "garden-secret-spot", onClick: handleSecretSpotClick })] }), _jsxs("div", { className: "garden-sidebar", children: [renderPlotDetails(), renderSeedPouch(), _jsxs("div", { className: "sidebar-decorations", children: [_jsx("div", { className: "corner-decoration top-left" }), _jsx("div", { className: "corner-decoration top-right" }), _jsx("div", { className: "corner-decoration bottom-left" }), _jsx("div", { className: "corner-decoration bottom-right" })] })] })] })] }), showWhisper && _jsx("div", { className: "garden-whisper", children: showWhisper }), attunementAnimation && _jsx("div", { className: "attunement-overlay" }), showEastEgg && _jsx("div", { className: "east-egg-overlay" }), showAttunementPuzzle && (_jsx(SeasonalAttunementPuzzle, { onComplete: handlePuzzleComplete, onSkip: handleSkipPuzzle, season: season }))] }));
};
export default Garden;
//# sourceMappingURL=Garden.js.map