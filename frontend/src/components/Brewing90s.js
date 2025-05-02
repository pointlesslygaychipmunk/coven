import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './Brewing90s.css';
import LunarPhaseIcon from './LunarPhaseIcon';
import BrewingPuzzle from './BrewingPuzzle';
const Brewing90s = ({ playerInventory, knownRecipes = [], lunarPhase, playerSpecialization, onBrew }) => {
    // State management
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [matchedRecipeInfo, setMatchedRecipeInfo] = useState(null);
    const [potionCategoryFilter, setPotionCategoryFilter] = useState('all');
    const [brewResult, setBrewResult] = useState(null);
    const [bubbling, setBubbling] = useState(false);
    const [brewingAnimation, setBrewingAnimation] = useState(false);
    const [showPuzzle, setShowPuzzle] = useState(false);
    // Easter Egg: Whispers of Nature
    const [natureHarmony, setNatureHarmony] = useState(0);
    const [whispersActive, setWhispersActive] = useState(false);
    const [whisperMessage, setWhisperMessage] = useState('');
    const [spiritElements, setSpiritElements] = useState([]);
    // Animation states for DOS aesthetic
    const [animationFrame, setAnimationFrame] = useState(0);
    // Update animation frame for DOS-style animation
    useEffect(() => {
        if (bubbling) {
            const interval = setInterval(() => {
                setAnimationFrame((prev) => (prev + 1) % 4);
            }, 250);
            return () => clearInterval(interval);
        }
        return () => { }; // Return empty cleanup function when not bubbling
    }, [bubbling]);
    // Easter Egg: Track harmony with nature
    useEffect(() => {
        if (selectedIngredients.length === 2) {
            const categories = selectedIngredients.map(item => item.category || '');
            const moonPhaseFavorites = {
                'Full Moon': ['flower', 'luminous', 'crystal'], 'New Moon': ['root', 'shadow', 'soil'],
                'Waxing Crescent': ['seed', 'growth', 'leaf'], 'Waxing Gibbous': ['fruit', 'nectar', 'sap'],
                'Waning Gibbous': ['berry', 'essence', 'dew'], 'Waning Crescent': ['mushroom', 'fungus', 'decay']
            };
            const favoredCategories = moonPhaseFavorites[lunarPhase] || [];
            const moonAlignedCount = categories.filter(cat => favoredCategories.some(favored => cat.includes(favored))).length;
            // Calculate harmony based on moon alignment and if a known recipe is potentially matched
            const harmonyScore = Math.min(100, Math.round((moonAlignedCount / 2) * 70) + (matchedRecipeInfo ? 20 : 0) + Math.round(Math.random() * 10));
            setNatureHarmony(harmonyScore);
            // Trigger whispers based on harmony
            if (harmonyScore > 60 && Math.random() < (harmonyScore / 100) * 0.8) {
                triggerNatureWhispers(harmonyScore, categories);
            }
            else {
                setWhispersActive(false); // Ensure whispers are off if conditions not met
            }
        }
        else {
            // Reset harmony and whispers if selection changes from 2 items
            setNatureHarmony(0);
            setWhispersActive(false);
        }
    }, [selectedIngredients, lunarPhase, matchedRecipeInfo]);
    // Helper function to trigger nature whispers
    const triggerNatureWhispers = (harmonyScore, categories) => {
        let spiritType = 'herb'; // Default
        if (categories.some(c => c?.includes('mushroom')))
            spiritType = 'mushroom';
        else if (categories.some(c => c?.includes('flower')))
            spiritType = 'flower';
        else if (categories.some(c => c?.includes('root')))
            spiritType = 'root';
        else if (categories.some(c => c?.includes('crystal')))
            spiritType = 'crystal';
        // Properly typed whispers object
        const whispers = {
            'herb': ["THE LEAVES REMEMBER", "WE GROW STRONGER", "VERDANT PATH WELCOMES", "HANDS SPEAK GROWTH"],
            'mushroom': ["THRIVE IN DARKNESS", "MYCELIUM FEELS", "SECRETS EMERGE", "DECAY AND REBIRTH"],
            'flower': ["CAPTURES BEAUTY", "PETALS DANCE", "SHARE FRAGRANCE", "BLOOMING FADING"],
            'root': ["DEEP WE GROW", "PATIENT STRENGTH", "FOUNDATION OF ALL", "ANCIENT WISDOM"],
            'crystal': ["TIME CRYSTALLIZED", "AMPLIFY ENERGIES", "LIGHT AND STRUCTURE", "EARTH'S FIRE LIVES"]
        };
        const messages = whispers[spiritType] || whispers['herb']; // Fallback to herb whispers
        setWhisperMessage(messages[Math.floor(Math.random() * messages.length)]);
        setWhispersActive(true);
        const numElements = Math.floor(harmonyScore / 20) + 2;
        setSpiritElements(Array.from({ length: numElements }, () => ({
            type: spiritType,
            x: 50 + (Math.random() * 60 - 30),
            y: 50 + (Math.random() * 60 - 30),
            rotation: Math.random() * 360,
            delay: Math.random() * 3
        })));
        setTimeout(() => setWhispersActive(false), 6000);
    };
    // Filter inventory items
    useEffect(() => {
        let filtered = playerInventory.filter(item => item.type === 'ingredient' && item.quantity > 0);
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(item => item.category === categoryFilter);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item => item.name.toLowerCase().includes(term) ||
                (item.description && item.description.toLowerCase().includes(term)));
        }
        setFilteredInventory(filtered);
    }, [playerInventory, categoryFilter, searchTerm]);
    // Check for matching known recipe
    useEffect(() => {
        if (selectedIngredients.length === 2) {
            // Find the first KNOWN recipe that matches the current potion category filter
            const potentialMatch = knownRecipes.find(recipe => {
                // Check if recipe category matches the filter (or if filter is 'all')
                const categoryMatches = potionCategoryFilter === 'all' || recipe.category === potionCategoryFilter;
                return categoryMatches; // Placeholder: just checks category for now
            });
            setMatchedRecipeInfo(potentialMatch || null);
            setBubbling(true); // Start bubbling when 2 items are selected
        }
        else {
            setMatchedRecipeInfo(null);
            setBubbling(selectedIngredients.length > 0); // Bubble if any item is selected
        }
    }, [selectedIngredients, knownRecipes, potionCategoryFilter]);
    // Handle ingredient selection
    const handleIngredientSelect = (item) => {
        if (selectedIngredients.length >= 2)
            return; // Limit to 2 ingredients
        if (!canSelectItem(item))
            return;
        setSelectedIngredients([...selectedIngredients, item]);
        setBrewResult(null); // Clear previous result
    };
    // Check if an item can be selected
    const canSelectItem = (item) => {
        const selectedCount = selectedIngredients.filter(sel => sel.id === item.id).length;
        return item.quantity > selectedCount;
    };
    // Remove an ingredient
    const handleRemoveIngredient = (itemId) => {
        const indexToRemove = selectedIngredients.map(i => i.id).lastIndexOf(itemId);
        if (indexToRemove !== -1) {
            setSelectedIngredients(prev => prev.filter((_, index) => index !== indexToRemove));
        }
        setBrewResult(null); // Clear result on removal
    };
    // Clear ingredients
    const handleClearIngredients = () => {
        setSelectedIngredients([]);
        setMatchedRecipeInfo(null);
        setBrewResult(null); // Clear result
    };
    // Handle puzzle completion - triggers the actual brew
    const handlePuzzleComplete = (result) => {
        setShowPuzzle(false); // Hide the puzzle
        if (!result.success) {
            setBrewResult({ success: false, message: result.message });
            // Consume ingredients on puzzle failure
            const ingredientIds = selectedIngredients.map(item => item.id);
            onBrew(ingredientIds, 0, matchedRecipeInfo?.id); // Call brew with 0 bonus but consume items
            handleClearIngredients(); // Clear selection
            return;
        }
        // Puzzle succeeded, proceed to brew with the bonus
        const ingredientIds = selectedIngredients.map(item => item.id);
        const puzzleBonus = result.bonus;
        setBrewingAnimation(true); // Start cauldron animation
        setTimeout(() => {
            // Call the backend brew function with the bonus
            onBrew(ingredientIds, puzzleBonus, matchedRecipeInfo?.id);
            // Clear selection and animation AFTER backend call
            handleClearIngredients();
            setBrewingAnimation(false);
            // Frontend feedback
            setBrewResult({
                success: true,
                message: `${result.message} THE CAULDRON YIELDS RESULTS!`,
                potionName: matchedRecipeInfo?.name || "EXPERIMENTAL BREW",
                quality: 70 + puzzleBonus // Example quality calculation
            });
        }, 1200); // Cauldron animation duration
    };
    // Get filtered known recipes
    const getFilteredKnownRecipes = () => {
        let filtered = knownRecipes;
        if (potionCategoryFilter !== 'all') {
            filtered = filtered.filter(recipe => recipe.category === potionCategoryFilter);
        }
        return filtered;
    };
    // Get unique categories
    const getIngredientCategories = () => Array.from(new Set(playerInventory.filter(i => i.type === 'ingredient' && i.category).map(i => i.category))).sort();
    const getPotionCategories = () => Array.from(new Set(knownRecipes.map(r => r.category).filter((c) => !!c))).sort();
    // Render difficulty stars
    const renderDifficultyStars = (difficulty = 1) => '★'.repeat(Math.min(5, difficulty)) + '☆'.repeat(Math.max(0, 5 - difficulty));
    // Get specialization bonus text
    const getSpecializationBonusText = () => {
        if (!playerSpecialization)
            return "";
        // Example: Check if current recipe benefits from specialization
        if (matchedRecipeInfo?.category === 'serum' && playerSpecialization === 'Essence') {
            return "+15% POTENCY (ESSENCE SPEC.)";
        }
        if (matchedRecipeInfo?.category === 'tonic' && playerSpecialization === 'Infusion') {
            return "+20% EFFECT (INFUSION SPEC.)";
        }
        return ""; // No specific bonus message for this recipe/spec combo
    };
    // Helper function to get spirit shape for whispers animation
    const getSpiritShape = (type) => {
        switch (type) {
            case 'herb': return (_jsx("svg", { viewBox: "0 0 16 16", width: "100%", height: "100%", children: _jsx("path", { d: "M8,1 C10,5 13,6 15,6 C12,7 11,10 11,13 C11,15 9,15 8,15 C7,15 5,15 5,13 C5,10 4,7 1,6 C3,6 6,5 8,1 Z", fill: "#7eba76" }) }));
            case 'mushroom': return (_jsx("svg", { viewBox: "0 0 16 16", width: "100%", height: "100%", children: _jsx("path", { d: "M8,1 C12,1 15,4 15,7 C15,9 14,11 12,12 L11,15 L5,15 L4,12 C2,11 1,9 1,7 C1,4 4,1 8,1 Z", fill: "#7b4dab" }) }));
            case 'flower': return (_jsxs("svg", { viewBox: "0 0 16 16", width: "100%", height: "100%", children: [_jsx("path", { d: "M8,6 C7,5 7,2 8,1 C9,2 9,5 8,6 Z M11,8 C12,7 15,7 16,8 C15,9 12,9 11,8 Z M8,10 C9,11 9,14 8,15 C7,14 7,11 8,10 Z M5,8 C4,9 1,9 0,8 C1,7 4,7 5,8 Z", fill: "#c0a060" }), _jsx("circle", { cx: "8", cy: "8", r: "2", fill: "#fcf3a9" })] }));
            case 'root': return (_jsx("svg", { viewBox: "0 0 16 16", width: "100%", height: "100%", children: _jsx("path", { d: "M8,1 L8,8 L11,11 L13,10 L14,12 L12,14 M8,8 L5,11 L3,10 L2,12 L4,14 M8,8 L8,15", stroke: "#8a7a5a", strokeWidth: "1", fill: "none" }) }));
            case 'crystal': return (_jsx("svg", { viewBox: "0 0 16 16", width: "100%", height: "100%", children: _jsx("path", { d: "M8,1 L12,6 L8,15 L4,6 Z M4,6 L12,6", stroke: "#6fc0dd", strokeWidth: "1", fill: "#6fc0dd", fillOpacity: "0.6" }) }));
            default: return (_jsx("svg", { viewBox: "0 0 16 16", width: "100%", height: "100%", children: _jsx("circle", { cx: "8", cy: "8", r: "5", fill: "#7eba76", opacity: "0.8" }) }));
        }
    };
    return (_jsxs("div", { className: "brewing-container", children: [showPuzzle && (_jsx("div", { className: "puzzle-overlay", children: _jsx("div", { className: "puzzle-container", children: _jsx(BrewingPuzzle, { onComplete: handlePuzzleComplete, currentLunarPhase: lunarPhase }) }) })), _jsxs("div", { className: "brewing-header", children: [_jsx("h2", { children: "WITCH'S CAULDRON" }), _jsxs("div", { className: "brewing-phase", children: [_jsx(LunarPhaseIcon, { phase: lunarPhase, size: 20 }), _jsx("div", { className: "phase-value", children: lunarPhase.toUpperCase() })] }), playerSpecialization && (_jsx("div", { className: "specialization-bonus", title: `${playerSpecialization} specialty bonus applies`, children: playerSpecialization.toUpperCase() }))] }), _jsxs("div", { className: "brewing-content", children: [_jsxs("div", { className: "ingredients-panel", children: [_jsx("div", { className: "ingredients-header", children: _jsx("h3", { children: "INGREDIENTS" }) }), _jsxs("div", { className: "ingredients-filters", children: [_jsxs("select", { value: categoryFilter, onChange: (e) => setCategoryFilter(e.target.value), children: [_jsx("option", { value: "all", children: "ALL CATEGORIES" }), getIngredientCategories().map(category => (_jsx("option", { value: category, children: category.toUpperCase() }, category)))] }), _jsx("input", { type: "text", placeholder: "SEARCH...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] }), _jsx("div", { className: "ingredients-grid", children: filteredInventory.length > 0 ? (filteredInventory.map(item => {
                                    const selectedCount = selectedIngredients.filter(sel => sel.id === item.id).length;
                                    const isSelectedDim = selectedCount >= item.quantity;
                                    return (_jsxs("div", { className: `ingredient-item ${isSelectedDim ? 'selected-dim' : ''}`, onClick: !isSelectedDim ? () => handleIngredientSelect(item) : undefined, title: `${item.name}\nQTY: ${item.quantity}\nQUALITY: ${item.quality || 'N/A'}%`, children: [_jsx("div", { className: "ingredient-image", children: _jsx("div", { className: "placeholder-image", children: item.name.charAt(0).toUpperCase() }) }), _jsxs("div", { className: "ingredient-details", children: [_jsx("div", { className: "ingredient-name", children: item.name.toUpperCase() }), item.quality && _jsxs("div", { className: "ingredient-quality", children: ["Q:", item.quality, "%"] }), _jsxs("div", { className: "ingredient-quantity", children: ["x", item.quantity] })] }), item.category && (_jsx("div", { className: "ingredient-category-tag", children: item.category.toUpperCase() }))] }, item.id));
                                })) : (_jsx("div", { className: "no-ingredients", children: "NO ITEMS MATCH FILTER" })) })] }), _jsxs("div", { className: "brewing-workspace", children: [_jsx("div", { className: "cauldron", children: _jsxs("div", { className: `cauldron-content ${brewingAnimation ? 'brewing-animation' : ''} ${natureHarmony > 75 ? 'nature-harmony' : ''}`, children: [selectedIngredients.length === 0 ? (_jsx("div", { className: "empty-cauldron", children: "SELECT INGREDIENTS..." })) : (_jsxs("div", { className: "selected-ingredients", children: [selectedIngredients.map((item, index) => (_jsxs("div", { className: "selected-ingredient", onClick: () => handleRemoveIngredient(item.id), title: `REMOVE ${item.name.toUpperCase()}`, children: [_jsx("div", { className: "ingredient-image", children: _jsx("div", { className: "placeholder-image", children: item.name.charAt(0).toUpperCase() }) }), _jsx("div", { className: "ingredient-name", children: item.name.toUpperCase() }), _jsx("div", { className: "remove-icon", children: "X" })] }, `${item.id}-${index}`))), Array.from({ length: 2 - selectedIngredients.length }).map((_, index) => (_jsx("div", { className: "selected-ingredient placeholder" }, `placeholder-${index}`)))] })), bubbling && !brewingAnimation && (_jsxs(_Fragment, { children: [_jsx("div", { className: `bubble bubble-1 ${natureHarmony > 75 ? 'nature-bubble' : ''}`, style: { transform: `translateY(-${animationFrame * 5}px)` } }), _jsx("div", { className: `bubble bubble-2 ${natureHarmony > 75 ? 'nature-bubble' : ''}`, style: { transform: `translateY(-${(animationFrame + 2) % 4 * 5}px)` } }), _jsx("div", { className: `bubble bubble-3 ${natureHarmony > 75 ? 'nature-bubble' : ''}`, style: { transform: `translateY(-${(animationFrame + 1) % 4 * 5}px)` } })] })), whispersActive && (_jsxs("div", { className: "nature-whispers", children: [_jsx("div", { className: "whisper-message", children: whisperMessage }), spiritElements.map((spirit, index) => (_jsx("div", { className: "nature-spirit", style: {
                                                        left: `${spirit.x}%`,
                                                        top: `${spirit.y}%`,
                                                        transform: `rotate(${spirit.rotation}deg)`
                                                    }, children: getSpiritShape(spirit.type) }, `spirit-${index}`)))] }))] }) }), _jsxs("div", { className: "brewing-actions", children: [selectedIngredients.length === 2 && !brewingAnimation && !brewResult && (_jsx("button", { className: "action-button puzzle-trigger-button", onClick: () => setShowPuzzle(true), disabled: showPuzzle, title: "Align essences for better results", children: "STUDY ESSENCES" })), selectedIngredients.length > 0 && !brewingAnimation && (_jsx("button", { className: "action-button clear", onClick: handleClearIngredients, disabled: brewingAnimation, children: "CLEAR" }))] }), _jsxs("div", { className: "brewing-result", children: [matchedRecipeInfo && !brewResult && !brewingAnimation && (_jsxs("div", { className: "recipe-match", children: [_jsx("h4", { children: "RECIPE MATCH FOUND" }), _jsx("div", { className: "recipe-name", children: matchedRecipeInfo.name.toUpperCase() }), matchedRecipeInfo.description && (_jsx("div", { className: "recipe-description", children: matchedRecipeInfo.description.toUpperCase() })), getSpecializationBonusText() && (_jsx("div", { className: "recipe-description", children: getSpecializationBonusText() })), _jsxs("div", { className: "recipe-moon-phase", children: [_jsx(LunarPhaseIcon, { phase: lunarPhase, size: 16 }), lunarPhase === 'Full Moon' && matchedRecipeInfo.category === 'elixir' && (_jsx("span", { style: { color: '#7eba76' }, children: "IDEAL PHASE" }))] })] })), brewResult && (_jsxs("div", { className: `result-card ${brewResult.success ? 'success' : 'failure'} ${natureHarmony > 75 ? 'harmony-result' : ''}`, children: [_jsx("h4", { children: brewResult.success
                                                    ? (natureHarmony > 75 ? '✧ HARMONY! ✧' : '✧ SUCCESS! ✧')
                                                    : (natureHarmony > 75 ? '× DISCORD... ×' : '× FAILED! ×') }), _jsx("p", { children: brewResult.message.toUpperCase() }), brewResult.success && brewResult.potionName && (_jsxs("div", { className: "result-details", children: [_jsx("div", { className: "result-potion", children: brewResult.potionName.toUpperCase() }), brewResult.quality && (_jsxs("div", { className: "result-quality", children: ["QUALITY: ", brewResult.quality, "%"] }))] }))] })), !matchedRecipeInfo && !brewResult && !brewingAnimation && selectedIngredients.length === 2 && (_jsx("p", { className: "instruction-text", children: "READY TO STUDY ESSENCES!" })), !matchedRecipeInfo && !brewResult && !brewingAnimation && selectedIngredients.length < 2 && (_jsx("p", { className: "instruction-text", children: "ADD INGREDIENTS TO CAULDRON..." }))] })] }), _jsxs("div", { className: "recipes-panel", children: [_jsxs("div", { className: "recipes-header", children: [_jsx("h3", { children: "KNOWN RECIPES" }), _jsxs("select", { value: potionCategoryFilter, onChange: (e) => setPotionCategoryFilter(e.target.value), children: [_jsx("option", { value: "all", children: "ALL TYPES" }), getPotionCategories().map(category => (_jsx("option", { value: category, children: category.toUpperCase() }, category)))] })] }), _jsx("div", { className: "recipes-list", children: getFilteredKnownRecipes().length > 0 ? (getFilteredKnownRecipes().map((recipe) => (_jsxs("div", { className: `recipe-item ${natureHarmony > 75 ? 'harmony-recipe' : ''}`, title: recipe.description || recipe.name, children: [_jsxs("div", { className: "recipe-header", children: [_jsx("div", { className: "recipe-name", children: recipe.name.toUpperCase() }), _jsx("div", { className: "recipe-difficulty", children: renderDifficultyStars(3) })] }), _jsx("div", { className: "recipe-ingredients", children: "REQ: 2 INGREDIENTS" }), recipe.category && (_jsx("div", { className: "recipe-category-tag", children: recipe.category.toUpperCase() })), _jsx("div", { className: `recipe-moon-indicator ${lunarPhase === "Full Moon" ? 'ideal' : ''}`, children: lunarPhase === "Full Moon" ? '★' : '☾' })] }, recipe.id)))) : (_jsx("div", { className: "no-recipes", children: "NO KNOWN RECIPES MATCH FILTER" })) })] })] })] }));
};
export default Brewing90s;
//# sourceMappingURL=Brewing90s.js.map