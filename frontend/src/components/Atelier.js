import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import './Atelier.css';
import LunarPhaseIcon from './LunarPhaseIcon';
const Atelier = ({ playerItems = [], onCraftItem, lunarPhase, playerLevel, playerSpecialization, knownRecipes = [] // Default to empty if not provided
 }) => {
    // Component state
    const [selectedItems, setSelectedItems] = useState([]);
    const [possibleResults, setPossibleResults] = useState([]);
    const [activeTab, setActiveTab] = useState('charm'); // Default to charm
    // Secret 90s easter egg state
    const [cornerClicks, setCornerClicks] = useState(0);
    const [showSecretCheat, setShowSecretCheat] = useState(false);
    const secretMessageRef = useRef(null);
    const cornerClickTimeoutRef = useRef(null);
    // Function to check if an item can be selected (has quantity > 0)
    const canSelectItem = (item) => {
        // Allow selection if item is not already selected OR if player has more than currently selected count
        const selectedCount = selectedItems.filter(sel => sel.id === item.id).length;
        return item.quantity > selectedCount;
    };
    // Calculate possible crafting results based on selected ingredients and known recipes
    useEffect(() => {
        if (selectedItems.length === 0) {
            setPossibleResults([]);
            return;
        }
        const selectedBaseIds = selectedItems.map(item => item.baseId);
        // Simulate finding recipes based on selected ingredients
        // In a real game, this would likely involve complex logic or an API call
        const findPotentialCrafts = (ingredientBaseIds) => {
            const results = [];
            // Check known basic recipes first
            knownRecipes.forEach(known => {
                // TODO: Add logic to check if selected ingredients *match* the known recipe's requirements
                // This is complex and needs a full recipe definition system backend
                // For now, just filter by type based on tab
                if (known.type === activeTab) { // Removed check for !== 'potion' as it's redundant now
                    // Simulate matching ingredients (placeholder)
                    if (ingredientBaseIds.length >= 2) { // Basic check
                        results.push({
                            id: known.id,
                            name: known.name,
                            description: known.description || `A mysterious ${known.type}...`,
                            type: known.type, // Ensure type matches AtelierTab
                            category: known.category || (known.type === 'charm' ? 'charm' : 'talisman'), // Default category
                            rarity: 'common' // Assume common for now
                        });
                    }
                }
            });
            // Add placeholder "discovery" crafts based on specific combinations
            if (ingredientBaseIds.length === 2) {
                if (ingredientBaseIds.includes('ing_moonbud') && ingredientBaseIds.includes('ing_silverleaf')) {
                    // FIX: Changed category from 'luck' to 'charm'
                    results.push({ id: 'charm_moon_silver', name: 'Moon Silver Charm', description: 'A charm shimmering with lunar and silver light.', type: 'charm', category: 'charm', rarity: 'uncommon' });
                }
                if (ingredientBaseIds.includes('ing_ancient_ginseng') && ingredientBaseIds.includes('ing_emberberry')) {
                    // FIX: Changed category from 'vitality' to 'talisman'
                    results.push({ id: 'talisman_ginseng_ember', name: 'Ginseng Ember Talisman', description: 'A talisman radiating warmth and vitality.', type: 'talisman', category: 'talisman', rarity: 'rare', levelRequirement: 5 });
                }
                if (ingredientBaseIds.includes('ing_nightcap') && ingredientBaseIds.includes('ing_glimmerroot')) {
                    // FIX: Changed category from 'protection' to 'talisman'
                    results.push({ id: 'talisman_night_root', name: 'Night Root Talisman', description: 'A ward against minor hexes.', type: 'talisman', category: 'talisman', rarity: 'uncommon' });
                }
            }
            else if (ingredientBaseIds.length === 3) {
                if (ingredientBaseIds.includes('ing_sacred_lotus') && ingredientBaseIds.includes('ritual_moonstone') && ingredientBaseIds.includes('ing_silverleaf')) {
                    // FIX: Changed category from 'warding' to 'charm'
                    results.push({ id: 'charm_purifying_moon', name: 'Purifying Moon Charm', description: 'Enhances clarity and resists illusions.', type: 'charm', category: 'charm', rarity: 'rare', lunarRestriction: 'Full Moon', levelRequirement: 7 });
                }
                // Removed potion example as potions are brewed, not crafted here
            }
            // Remove duplicates based on ID
            const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());
            return uniqueResults;
        };
        const potentialResults = findPotentialCrafts(selectedBaseIds);
        // Filter results based on current lunar phase, level requirements, and ACTIVE TAB
        const filteredResults = potentialResults.filter(result => {
            if (result.lunarRestriction && result.lunarRestriction !== lunarPhase)
                return false;
            if (result.levelRequirement && result.levelRequirement > playerLevel)
                return false;
            // Filter by active tab explicitly
            if (result.type !== activeTab)
                return false;
            return true;
        });
        setPossibleResults(filteredResults);
    }, [selectedItems, knownRecipes, lunarPhase, playerLevel, playerItems, activeTab]); // Added activeTab dependency
    const handleItemSelect = (item) => {
        const canAdd = canSelectItem(item);
        if (!canAdd) {
            console.log(`Cannot select more ${item.name}, only ${item.quantity} available.`);
            return;
        }
        // Limit selection size to max 3 items
        if (selectedItems.length >= 3) {
            console.log("Max 3 components allowed for crafting.");
            // Maybe provide user feedback here?
            return;
        }
        // Add the item to selection
        setSelectedItems([...selectedItems, item]);
        // Play a subtle select sound effect (placeholder)
        const selectSound = new Audio('data:audio/wav;base64,UklGRmQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABDMxlAQzMZQD00GUE+NRlCPjUZQz82GUQ/NhlFQDcZRkA3GUZANxlGQDcZRkA3GUZANxlFPzYZRD82GUM+NRlCPTQZQTwzGUA7MhhAOjEYQDkwGEE4MBdCOC8XQzguF0Q3LhdENS0XRTUsF0Y1LBdGNCsXRzQrF0cyKRdIMyoXSDIpF0kxKBdKMSgXSjEoF0oxKBdKMSgXSTEoF0kyKRdIMikXRzMqF0Y0KxdFNCwXRDUtF0M3LhdCOC8XQTgwF0A5MRhAOjIYQDszGEA8MxlAPTQZQT41GUIPuD1CDLc9Qwm2PUMJ');
        selectSound.volume = 0.1;
        selectSound.play().catch(() => { });
    };
    const handleItemRemove = (indexToRemove) => {
        const newSelection = [...selectedItems];
        newSelection.splice(indexToRemove, 1);
        setSelectedItems(newSelection);
        // Play a subtle remove sound effect (placeholder)
        const removeSound = new Audio('data:audio/wav;base64,UklGRmQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABDMxlAQzMZQD00GUE+NRlCPjUZQz82GUQ/NhlFQDcZRkA3GUZANxlGQDcZRkA3GUZANxlFPzYZRD82GUM+NRlCPTQZQTwzGUA7MhhAOjEYQDkwGEE4MBdCOC8XQzguF0Q3LhdENS0XRTUsF0Y1LBdGNCsXRzQrF0cyKRdIMyoXSDIpF0kxKBdKMSgXSjEoF0oxKBdKMSgXSTEoF0kyKRdIMikXRzMqF0Y0KxdFNCwXRDUtF0M3LhdCOC8XQTgwF0A5MRhAOjIYQDszGEA8MxlAPTQZQT41GUIPuD1CDLc9Qwm2PUMJ');
        removeSound.volume = 0.1;
        removeSound.play().catch(() => { });
    };
    const handleCraft = (result) => {
        const ingredientIds = selectedItems.map(item => item.id); // Pass inventory item IDs
        console.log(`Attempting craft for: ${result.name} using inventory items [${ingredientIds.join(', ')}]`);
        // Call the onCraftItem prop with inventory item IDs and result ID
        onCraftItem(ingredientIds, result.id);
        // Play a crafting success sound effect (placeholder)
        const craftSound = new Audio('data:audio/wav;base64,UklGRr4CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YZoCAAD/////////////////////////////////////////////l5eXWVlZWVlZl5eX////////MzMzAAAAAAAAMzMz////////MzMzr6+vr6+vMzMz//////5eXl1lZWVlZWZeXl////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////w==');
        craftSound.volume = 0.2;
        craftSound.play().catch(() => { });
        // Clear selected items after crafting attempt
        setSelectedItems([]);
    };
    // Filter player inventory to show only usable components for crafting
    const availableComponents = playerItems.filter(item => (item.type === 'ingredient' || item.type === 'tool' || item.type === 'ritual_item') && item.quantity > 0);
    // Handle the 90s-style Easter egg - clicking the corner
    const handleCornerClick = () => {
        // Reset the timeout if it exists
        if (cornerClickTimeoutRef.current) {
            clearTimeout(cornerClickTimeoutRef.current);
        }
        // Increment click counter
        const newClickCount = cornerClicks + 1;
        setCornerClicks(newClickCount);
        // Play a secret click sound (placeholder)
        const clickSound = new Audio('data:audio/wav;base64,UklGRjwCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRQCAABPT09PT09PT09PT09QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBPT09PT09PT09PT09PT09PT09PT09PT09PT09KSkpCQkI6Ojo0NDQwMDAtLS0sLCwrKyspKSkoKCgnJycoKCgqKiotLS0yMjI5OTlBQUFKSkpSUlJYWFhdXV1hYWFkZGRmZmZnZ2doaGhnZ2dnZ2dmZmZkZGRiYmJeXl5ZWVlUVFROTk5ISEhCQkI8PDw2NjYyMjIvLy8tLS0rKysqKioqKiorKyssLCwuLi4xMTE1NTU5OTk+Pj5DQ0NISEhNTU1RUVFVVVVXV1daWlpbW1tcXFxcXFxcXFxbW1tZWVlXV1dVVVVSUlJPT09MTExISEhFRUVCQkI/Pz89PT08PDw7Ozs7Ozs7Ozs8PDw9PT0/Pz9AQEBDQ0NGRkZJSUlMTExPT09RUVFTU1NUVFRWVVVXV1dXV1dXV1dXV1dWVlZVVVVTU1NRUVFPTk5MTExKSkpHR0dFRUVDQ0NBQUFAQEBAQEBAQEBAQEBAQEBAQEFBQUJCQkNDQ0VFRUdHR0lJSUtLS01NTU9PT1FRUVJSUVNTU1RUVFRUVFRUVFNTU1JSUlFRUVBQUE5OTk1NTUtLS0pKSklJSUhISEhISEhISEhISEhISEhISUlJSUlJSUlJSUlJSkpKS0tLTExMTU1NTk5OT09PUFBQUFBQUE9PT09PT09PT09PT09PT09PT09PT09PT09OTk5OTk5OTk5OTk5OTk5OTk5OTk5PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PTw==');
        clickSound.volume = 0.1;
        clickSound.play().catch(() => { });
        // Show secret cheat message after 3 clicks
        if (newClickCount >= 3) {
            setShowSecretCheat(true);
            // Hide message after delay
            setTimeout(() => {
                setShowSecretCheat(false);
            }, 5000); // Show for 5 seconds
            // Reset counter after successful trigger
            setCornerClicks(0);
        }
        else {
            // Setup timeout to reset clicks if not clicked again quickly
            cornerClickTimeoutRef.current = setTimeout(() => {
                setCornerClicks(0);
            }, 1000); // Reset after 1 second of inactivity
        }
    };
    // Set up corner click listener for the Easter Egg
    useEffect(() => {
        const container = document.querySelector('.atelier-container');
        if (container) {
            // Create a DOM event handler function with the correct type
            const handleContainerClick = (e) => {
                // Cast Event to MouseEvent to access position properties
                const mouseEvent = e;
                // Check if click was in the bottom-right corner (e.g., last 20x20 pixels)
                const rect = container.getBoundingClientRect();
                const x = mouseEvent.clientX - rect.left;
                const y = mouseEvent.clientY - rect.top;
                if (x > rect.width - 20 && y > rect.height - 20) {
                    handleCornerClick();
                }
            };
            container.addEventListener('click', handleContainerClick);
            // Cleanup listener on component unmount
            return () => {
                container.removeEventListener('click', handleContainerClick);
                // Also clear the reset timeout if the component unmounts
                if (cornerClickTimeoutRef.current) {
                    clearTimeout(cornerClickTimeoutRef.current);
                }
            };
        }
        // FIX: Explicitly return undefined if container not found
        return undefined;
        // Dependency array includes cornerClicks to re-bind if needed (though unlikely needed here)
    }, [cornerClicks]);
    return (_jsxs("div", { className: "atelier-container", children: [_jsxs("div", { className: "atelier-header", children: [_jsxs("h2", { children: ["Witch's Atelier", playerSpecialization && _jsxs("span", { className: 'spec-badge', children: ["(", playerSpecialization, ")"] })] }), _jsxs("div", { className: "phase-indicator", children: [_jsx(LunarPhaseIcon, { phase: lunarPhase, size: 30 }), _jsx("span", { children: lunarPhase })] })] }), _jsxs("div", { className: "atelier-workspace", children: [_jsxs("div", { className: "ingredients-panel", children: [_jsx("h3", { children: "Available Components" }), _jsx("div", { className: "ingredient-list", children: availableComponents.length > 0 ? (availableComponents.map(item => {
                                    const isSelectable = canSelectItem(item);
                                    // Count how many times *this specific inventory item stack* is selected
                                    const selectedCountForItem = selectedItems.filter(sel => sel.id === item.id).length;
                                    // Check if *any* instance of this base item type is selected (for dimming)
                                    const isBaseItemSelected = selectedItems.some(sel => sel.baseId === item.baseId);
                                    // Check if the total selected count reaches the available quantity for *this stack*
                                    const isStackSelectedDim = selectedCountForItem >= item.quantity;
                                    return (_jsxs("div", { className: `ingredient-item ${!isSelectable || isStackSelectedDim ? 'disabled' : ''} ${isBaseItemSelected ? 'selected-dim' : ''}`, onClick: isSelectable && !isStackSelectedDim ? () => handleItemSelect(item) : undefined, title: isSelectable ? `${item.name}\nQty: ${item.quantity}\nQuality: ${item.quality || 'N/A'}%` : `Not enough ${item.name} available (Need ${selectedCountForItem + 1}, Have ${item.quantity})`, children: [_jsx("div", { className: "item-image", children: _jsx("div", { className: "placeholder-image", children: item.name.charAt(0).toUpperCase() }) }), _jsx("div", { className: "item-name", children: item.name }), _jsxs("div", { className: "item-quantity", children: ["\u00D7", item.quantity] }), selectedCountForItem > 0 && _jsx("div", { className: "selected-count-badge", children: selectedCountForItem })] }, item.id));
                                })) : (_jsx("p", { className: "no-ingredients", children: "No components in inventory." }) // Updated text
                                ) })] }), _jsxs("div", { className: "crafting-area", children: [_jsx("h3", { children: "Crafting Circle" }), " ", _jsxs("div", { className: "cauldron", children: [" ", selectedItems.length === 0 ? (_jsx("div", { className: "empty-cauldron", children: "Add components to the circle..." })) : (_jsx("div", { className: "selected-ingredients", children: selectedItems.map((item, index) => (_jsxs("div", { className: "selected-item", onClick: () => handleItemRemove(index), title: `Remove ${item.name}`, children: [item.name, _jsx("span", { className: "remove-item", children: "\u00D7" })] }, `${item.id}-${index}`))) })), selectedItems.length > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { className: "bubble bubble-1" }), _jsx("div", { className: "bubble bubble-2" }), _jsx("div", { className: "bubble bubble-3" })] }))] }), selectedItems.length > 0 && (_jsx("button", { onClick: () => setSelectedItems([]), className: "clear-button", children: "Clear Circle" }))] }), _jsxs("div", { className: "results-panel", children: [_jsxs("div", { className: "tabs", children: [_jsx("button", { className: activeTab === 'charm' ? 'active' : '', onClick: () => setActiveTab('charm'), children: "Charms" }), _jsx("button", { className: activeTab === 'talisman' ? 'active' : '', onClick: () => setActiveTab('talisman'), children: "Talismans" })] }), _jsx("h3", { children: "Possible Creations" }), _jsx("div", { className: "results-list", children: selectedItems.length === 0 ? (_jsx("div", { className: "no-results", children: "Select components to see possible crafts." })) : possibleResults.length > 0 ? (possibleResults.map(result => (_jsxs("div", { className: "result-item", onClick: () => handleCraft(result), title: `Click to attempt crafting ${result.name}`, children: [_jsx("div", { className: "result-image", children: _jsx("div", { className: "placeholder-image", children: result.name.charAt(0).toUpperCase() }) }), _jsxs("div", { className: "result-details", children: [_jsx("div", { className: "result-name", children: result.name }), _jsx("div", { className: "result-description", children: result.description }), _jsx("div", { className: `result-rarity ${result.rarity}`, children: result.rarity })] })] }, result.id)))) : (_jsxs("div", { className: "no-results", children: ["No known recipes match components for ", activeTab, "s."] })) })] })] }), _jsx("div", { ref: secretMessageRef, className: `secret-cheat ${showSecretCheat ? 'show' : ''}`, children: "CHEAT CODE UNLOCKED: DOUBLE RARITY CHANCE!" })] }));
};
export default Atelier;
//# sourceMappingURL=Atelier.js.map