import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './Brewing.css';
import LunarPhaseIcon from './LunarPhaseIcon';
import BrewingPuzzle from './BrewingPuzzle';
const Brewing = ({ playerInventory, knownRecipes = [], lunarPhase, playerSpecialization, onBrew }) => {
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
        // Dependencies for the effect
    }, [selectedIngredients, lunarPhase, matchedRecipeInfo]);
    // Helper function to trigger nature whispers
    const triggerNatureWhispers = (harmonyScore, categories) => {
        let spiritType = 'herb'; // Default
        if (categories.some(c => c.includes('mushroom')))
            spiritType = 'mushroom';
        else if (categories.some(c => c.includes('flower')))
            spiritType = 'flower';
        else if (categories.some(c => c.includes('root')))
            spiritType = 'root';
        else if (categories.some(c => c.includes('crystal')))
            spiritType = 'crystal';
        // FIX: Correctly type the whispers object to allow string index signature
        const whispers = {
            'herb': ["The leaves remember...", "We grow stronger...", "Verdant path welcomes...", "Hands speak growth..."],
            'mushroom': ["Thrive in darkness...", "Mycelium feels...", "Secrets emerge...", "Decay and rebirth..."],
            'flower': ["Captures beauty...", "Petals dance...", "Share fragrance...", "Blooming, fading..."],
            'root': ["Deep we grow...", "Patient strength...", "Foundation of all...", "Ancient wisdom..."],
            'crystal': ["Time crystallized...", "Amplify energies...", "Light and structure...", "Earth's fire lives..."]
        };
        const messages = whispers[spiritType] || whispers['herb']; // Fallback to herb whispers
        setWhisperMessage(messages[Math.floor(Math.random() * messages.length)]);
        setWhispersActive(true);
        const numElements = Math.floor(harmonyScore / 20) + 3;
        setSpiritElements(Array.from({ length: numElements }, () => ({
            type: spiritType, x: 50 + (Math.random() * 60 - 30), y: 50 + (Math.random() * 60 - 30),
            rotation: Math.random() * 360, delay: Math.random() * 3
        })));
        setTimeout(() => setWhispersActive(false), 6000 + (harmonyScore * 30)); // Duration based on harmony
        console.log(`🌿✨ Nature Whispers: ${spiritType} spirits awakened! Harmony: ${harmonyScore} ✨🌿`);
    };
    // Filter inventory items
    useEffect(() => {
        let filtered = playerInventory.filter(item => item.type === 'ingredient' && item.quantity > 0);
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(item => item.category === categoryFilter);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item => item.name.toLowerCase().includes(term) || (item.description && item.description.toLowerCase().includes(term)));
        }
        setFilteredInventory(filtered);
    }, [playerInventory, categoryFilter, searchTerm]);
    // Check for matching known recipe
    useEffect(() => {
        if (selectedIngredients.length === 2) {
            // REMOVED: Unused selectedNames variable
            // const selectedNames = selectedIngredients.map(i => i.name).sort();
            // Find the first KNOWN recipe that matches the current potion category filter
            // NOTE: This is a placeholder. Real matching requires comparing the *actual*
            // ingredients in the recipe definition (which isn't available here)
            // with the selectedIngredients.
            const potentialMatch = knownRecipes.find(recipe => {
                // Check if recipe category matches the filter (or if filter is 'all')
                const categoryMatches = potionCategoryFilter === 'all' || recipe.category === potionCategoryFilter;
                // TODO: Implement actual ingredient matching logic here when recipe definitions are richer
                // Example placeholder: return categoryMatches && checkIngredientsMatch(recipe, selectedIngredients);
                return categoryMatches; // Placeholder: just checks category for now
            });
            setMatchedRecipeInfo(potentialMatch || null);
            setBubbling(true); // Start bubbling when 2 items are selected
        }
        else {
            setMatchedRecipeInfo(null);
            setBubbling(selectedIngredients.length > 0); // Bubble if any item is selected
        }
        // ADDED: Missing dependency
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
            // Consume ingredients on puzzle failure - debatable, but let's keep it simple
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
            // Clear selection and animation AFTER backend call simulation
            handleClearIngredients();
            setBrewingAnimation(false);
            // Frontend feedback (Backend will ultimately set the real game state)
            // We show the puzzle success message PLUS a brewing message
            setBrewResult({
                success: true,
                message: `${result.message} The cauldron simmers with potential...`,
                potionName: matchedRecipeInfo?.name || "Experimental Brew",
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
    // FIXED: Ensure category is not undefined before adding to set
    const getPotionCategories = () => Array.from(new Set(knownRecipes.map(r => r.category).filter((c) => !!c))).sort();
    // Render difficulty stars
    const renderDifficultyStars = (difficulty = 1) => '★'.repeat(Math.min(5, difficulty)) + '☆'.repeat(Math.max(0, 5 - difficulty));
    // Get specialization bonus (example usage, not directly modifying outcome here)
    const getSpecializationBonusText = () => {
        if (!playerSpecialization)
            return "";
        // Example: Check if current recipe benefits from specialization
        if (matchedRecipeInfo?.category === 'serum' && playerSpecialization === 'Essence') {
            return "+15% Potency (Essence Spec.)";
        }
        if (matchedRecipeInfo?.category === 'tonic' && playerSpecialization === 'Infusion') {
            return "+20% Effectiveness (Infusion Spec.)";
        }
        return ""; // No specific bonus message for this recipe/spec combo
    };
    // Helper function to get spirit shape for whispers animation
    const getSpiritShape = (type) => {
        // (Same SVG rendering logic as before)
        switch (type) {
            case 'herb': return (_jsx("svg", { viewBox: "0 0 20 20", width: "100%", height: "100%", children: _jsx("path", { d: "M10,1 C12,5 15,6 19,6 C15,8 13,10 13,14 C13,17 11,19 10,19 C9,19 7,17 7,14 C7,10 5,8 1,6 C5,6 8,5 10,1 Z", fill: "#adffb0", fillOpacity: "0.8" }) }));
            case 'mushroom': return (_jsx("svg", { viewBox: "0 0 20 20", width: "100%", height: "100%", children: _jsx("path", { d: "M10,1 C14,1 18,4 18,8 C18,11 16,12 14,13 L13,19 L7,19 L6,13 C4,12 2,11 2,8 C2,4 6,1 10,1 Z", fill: "#eaccff", fillOpacity: "0.8" }) }));
            case 'flower': return (_jsxs("svg", { viewBox: "0 0 20 20", width: "100%", height: "100%", children: [_jsx("path", { d: "M10,7 C8,5 8,2 10,1 C12,2 12,5 10,7 Z M13,10 C15,8 18,8 19,10 C18,12 15,12 13,10 Z M10,13 C12,15 12,18 10,19 C8,18 8,15 10,13 Z M7,10 C5,12 2,12 1,10 C2,8 5,8 7,10 Z", fill: "#ffbae8", fillOpacity: "0.8" }), _jsx("circle", { cx: "10", cy: "10", r: "2", fill: "#ffffa0" })] }));
            case 'root': return (_jsx("svg", { viewBox: "0 0 20 20", width: "100%", height: "100%", children: _jsx("path", { d: "M10,1 L10,10 L13,13 L16,11 L17,14 L15,16 M10,10 L7,13 L4,11 L3,14 L5,16 M10,10 L10,19", stroke: "#c17c50", strokeWidth: "2", fill: "none" }) }));
            case 'crystal': return (_jsx("svg", { viewBox: "0 0 20 20", width: "100%", height: "100%", children: _jsx("path", { d: "M10,1 L14,8 L10,19 L6,8 Z M6,8 L14,8", stroke: "#a8e6ff", strokeWidth: "1", fill: "#e2f8ff", fillOpacity: "0.8" }) }));
            default: return (_jsx("svg", { viewBox: "0 0 20 20", width: "100%", height: "100%", children: _jsx("circle", { cx: "10", cy: "10", r: "5", fill: "#ffffff", fillOpacity: "0.8" }) }));
        }
    };
    return (_jsxs("div", { className: "brewing-container", children: [showPuzzle && (_jsx("div", { className: "puzzle-overlay", children: _jsx("div", { className: "puzzle-container", children: _jsx(BrewingPuzzle, { onComplete: handlePuzzleComplete, currentLunarPhase: lunarPhase }) }) })), _jsxs("div", { className: "brewing-header", children: [_jsx("h2", { children: "Witch's Cauldron" }), _jsxs("div", { className: "brewing-phase", children: [_jsx(LunarPhaseIcon, { phase: lunarPhase, size: 28 }), _jsx("div", { className: "phase-value", children: lunarPhase })] }), playerSpecialization && (_jsxs("div", { className: "specialization-bonus", title: `${playerSpecialization} specialty bonus applies`, children: ["Specialty: ", playerSpecialization] }))] }), _jsxs("div", { className: "brewing-content", children: [_jsxs("div", { className: "ingredients-panel", children: [_jsxs("div", { className: "ingredients-header", children: [_jsx("h3", { children: "Ingredients" }), _jsxs("div", { className: "ingredients-filters", children: [_jsxs("select", { value: categoryFilter, onChange: (e) => setCategoryFilter(e.target.value), children: [_jsx("option", { value: "all", children: "All Categories" }), getIngredientCategories().map(category => (_jsx("option", { value: category, children: category.charAt(0).toUpperCase() + category.slice(1) }, category)))] }), _jsx("input", { type: "text", placeholder: "Search...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] })] }), _jsx("div", { className: "ingredients-grid", children: filteredInventory.length > 0 ? (filteredInventory.map(item => {
                                    const selectedCount = selectedIngredients.filter(sel => sel.id === item.id).length;
                                    const isSelectedDim = selectedCount >= item.quantity;
                                    return (_jsxs("div", { className: `ingredient-item ${isSelectedDim ? 'selected-dim' : ''}`, onClick: !isSelectedDim ? () => handleIngredientSelect(item) : undefined, title: `${item.name}\nQty: ${item.quantity}\nQuality: ${item.quality || 'N/A'}%`, children: [_jsx("div", { className: "ingredient-image", children: _jsx("div", { className: "placeholder-image", children: item.name.charAt(0).toUpperCase() }) }), _jsxs("div", { className: "ingredient-details", children: [_jsx("div", { className: "ingredient-name", children: item.name }), item.quality && _jsxs("div", { className: "ingredient-quality", children: ["Q:", item.quality, "%"] }), _jsxs("div", { className: "ingredient-quantity", children: ["x", item.quantity] })] }), item.category && _jsx("div", { className: "ingredient-category-tag", children: item.category })] }, item.id));
                                })) : (_jsx("div", { className: "no-ingredients", children: "No ingredients match filter." })) })] }), _jsxs("div", { className: "brewing-workspace", children: [_jsx("div", { className: "cauldron", children: _jsxs("div", { className: `cauldron-content ${brewingAnimation ? 'brewing-animation' : ''} ${natureHarmony > 75 ? 'nature-harmony' : ''}`, children: [selectedIngredients.length === 0 ? (_jsx("div", { className: "empty-cauldron", children: "Select 2 ingredients..." })) : (_jsxs("div", { className: "selected-ingredients", children: [selectedIngredients.map((item, index) => (_jsxs("div", { className: "selected-ingredient", onClick: () => handleRemoveIngredient(item.id), title: `Remove ${item.name}`, children: [_jsx("div", { className: "ingredient-image", children: _jsx("div", { className: "placeholder-image", children: item.name.charAt(0).toUpperCase() }) }), _jsx("div", { className: "ingredient-name", children: item.name }), _jsx("div", { className: "remove-icon", children: "\u00D7" })] }, `${item.id}-${index}`))), Array.from({ length: 2 - selectedIngredients.length }).map((_, index) => (_jsx("div", { className: "selected-ingredient placeholder" }, `placeholder-${index}`)))] })), bubbling && !brewingAnimation && (_jsxs(_Fragment, { children: [_jsx("div", { className: `bubble bubble-1 ${natureHarmony > 75 ? 'nature-bubble' : ''}` }), _jsx("div", { className: `bubble bubble-2 ${natureHarmony > 75 ? 'nature-bubble' : ''}` }), _jsx("div", { className: `bubble bubble-3 ${natureHarmony > 75 ? 'nature-bubble' : ''}` })] })), whispersActive && (_jsxs("div", { className: "nature-whispers", children: [_jsx("div", { className: "whisper-message", children: whisperMessage }), spiritElements.map((spirit, index) => (_jsx("div", { className: "nature-spirit", style: { left: `${spirit.x}%`, top: `${spirit.y}%`, transform: `rotate(${spirit.rotation}deg) scale(${0.8 + (natureHarmony / 100) * 0.4})`, animationDelay: `${spirit.delay}s` }, children: getSpiritShape(spirit.type) }, `spirit-${index}`)))] }))] }) }), _jsxs("div", { className: "brewing-actions", children: [selectedIngredients.length === 2 && !brewingAnimation && !brewResult && (_jsx("button", { className: "action-button puzzle-trigger-button", onClick: () => setShowPuzzle(true), disabled: showPuzzle, title: "Align essences for better results", children: "Study Essences (Puzzle)" })), selectedIngredients.length > 0 && !brewingAnimation && (_jsx("button", { className: "action-button clear", onClick: handleClearIngredients, disabled: brewingAnimation, children: "Clear" }))] }), _jsxs("div", { className: "brewing-result", children: [matchedRecipeInfo && !brewResult && !brewingAnimation && (_jsxs("div", { className: "recipe-match", children: [_jsx("h4", { children: "Recipe Match Found" }), _jsx("div", { className: "recipe-name", children: matchedRecipeInfo.name }), matchedRecipeInfo.description && _jsx("div", { className: "recipe-description", children: matchedRecipeInfo.description }), getSpecializationBonusText() && _jsx("div", { className: "recipe-description", children: getSpecializationBonusText() }), _jsx("div", { className: "recipe-moon-phase", children: _jsx(LunarPhaseIcon, { phase: lunarPhase, size: 18 }) })] })), brewResult && (_jsxs("div", { className: `result-card ${brewResult.success ? 'success' : 'failure'} ${natureHarmony > 75 ? 'harmony-result' : ''}`, children: [_jsx("h4", { children: brewResult.success ? (natureHarmony > 75 ? '✨ Harmony!' : '✨ Success!') : (natureHarmony > 75 ? '🍃 Discord...' : '☁ Failed!') }), _jsx("p", { children: brewResult.message }), brewResult.success && brewResult.potionName && (_jsxs("div", { className: "result-details", children: [_jsx("div", { className: "result-potion", children: brewResult.potionName }), brewResult.quality && _jsxs("div", { className: "result-quality", children: ["Quality: ", brewResult.quality, "%"] })] }))] })), !matchedRecipeInfo && !brewResult && !brewingAnimation && selectedIngredients.length === 2 && (_jsx("p", { className: "instruction-text", children: "Ready to Study Essences or Experiment!" })), !matchedRecipeInfo && !brewResult && !brewingAnimation && selectedIngredients.length < 2 && (_jsx("p", { className: "instruction-text", children: "Add ingredients to the cauldron..." }))] })] }), _jsxs("div", { className: "recipes-panel", children: [_jsxs("div", { className: "recipes-header", children: [_jsx("h3", { children: "Known Potion Recipes" }), _jsxs("select", { value: potionCategoryFilter, onChange: (e) => setPotionCategoryFilter(e.target.value), children: [_jsx("option", { value: "all", children: "All Types" }), getPotionCategories().map(category => (_jsx("option", { value: category, children: category.charAt(0).toUpperCase() + category.slice(1) }, category)))] })] }), _jsx("div", { className: "recipes-list", children: getFilteredKnownRecipes().length > 0 ? (getFilteredKnownRecipes().map((recipe, index) => (_jsxs("div", { className: `recipe-item ${natureHarmony > 75 ? 'harmony-recipe' : ''}`, title: recipe.description || recipe.name, style: { animationDelay: `${index * 0.05}s` }, children: [_jsxs("div", { className: "recipe-header", children: [_jsx("div", { className: "recipe-name", children: recipe.name }), _jsx("div", { className: "recipe-difficulty", children: renderDifficultyStars(/* recipe.difficulty */ 3) })] }), _jsx("div", { className: "recipe-ingredients", children: "Req: 2 ingredients" }), " ", recipe.category && _jsx("div", { className: "recipe-category-tag", children: recipe.category }), _jsx("div", { className: `recipe-moon-indicator ${lunarPhase === "Full Moon" ? 'ideal' : ''}`, children: "\uD83C\uDF19" })] }, recipe.id)))) : (_jsx("div", { className: "no-recipes", children: "No known recipes match filter." })) })] })] })] }));
};
export default Brewing;
//# sourceMappingURL=Brewing.js.map