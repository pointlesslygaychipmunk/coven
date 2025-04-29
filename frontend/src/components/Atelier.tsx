import React, { useState, useEffect } from 'react';
import './Atelier.css';
import LunarPhaseIcon from './LunarPhaseIcon'; // Assuming LunarPhaseIcon exists and works
import { InventoryItem, BasicRecipeInfo, AtelierSpecialization, MoonPhase } from 'coven-shared'; // Use shared types

// Define a local type for potential crafting results if needed
// This might be fetched or derived from known recipes
interface CraftingResult {
    id: string;
    name: string;
    description: string;
    type: 'potion' | 'charm' | 'talisman'; // Extend as needed
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
    imagePath?: string;
    lunarRestriction?: MoonPhase; // Use shared type
    levelRequirement?: number; // Optional level restriction
}

interface AtelierProps {
  playerItems: InventoryItem[]; // Use InventoryItem type
  // Expects ingredient IDs and the *intended* result ID
  onCraftItem: (ingredientIds: string[], resultItemId: string) => void;
  lunarPhase: MoonPhase; // Use shared type
  playerLevel: number;
  playerSpecialization?: AtelierSpecialization; // Optional: Pass player specialization for bonuses
  knownRecipes?: BasicRecipeInfo[]; // Optional: Pass known recipes
}

const Atelier: React.FC<AtelierProps> = ({
  playerItems = [], // Default prop
  onCraftItem,
  lunarPhase,
  playerLevel,
  playerSpecialization, // Use the prop
  knownRecipes = [] // Default to empty array
}) => {
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [possibleResults, setPossibleResults] = useState<CraftingResult[]>([]);
  const [activeTab, setActiveTab] = useState<'potions' | 'charms' | 'talismans'>('potions');

   // Function to check if an item can be selected (has quantity > 0)
   const canSelectItem = (item: InventoryItem): boolean => {
    // Allow selection if the item is not already selected OR if player has more than the currently selected count
     const selectedCount = selectedItems.filter(sel => sel.id === item.id).length;
     return item.quantity > selectedCount;
   }

  // Calculate possible crafting results based on selected ingredients and known recipes
  useEffect(() => {
    if (selectedItems.length === 0) {
      setPossibleResults([]);
      return;
    }

    const selectedIds = selectedItems.map(item => item.id); // Use IDs

    // Simulate finding recipes based on selected ingredients
    // --- Placeholder Crafting Logic ---
    // Replace with backend API call: POST /api/atelier/check { ingredientIds } -> returns CraftingResult[]
    const findPotentialCrafts = (ingredients: string[]): CraftingResult[] => {
        const results: CraftingResult[] = [];
        // Example: Simple 2-ingredient check (replace with real logic/API call)
        if (ingredients.length === 2) {
             const name1 = playerItems.find(i => i.id === ingredients[0])?.name;
             const name2 = playerItems.find(i => i.id === ingredients[1])?.name;

            // Use knownRecipes prop if available (basic check)
            knownRecipes.forEach(known => {
                 // Weak check - needs improvement
                 if (known.name.includes('Charm') && activeTab === 'charms') {
                      results.push({ id: known.id, name: known.name, description: known.description || "A charm...", type: 'charm', rarity: 'common' });
                 } else if (known.name.includes('Talisman') && activeTab === 'talismans') {
                     results.push({ id: known.id, name: known.name, description: known.description || "A talisman...", type: 'talisman', rarity: 'common' });
                 }
                 // Add potion logic if needed, though Brewing component handles that primarily
            });

            // Default discovery placeholders
             if (name1?.includes('Moon') && name2?.includes('Silver')) {
                 results.push({ id: 'charm_moon_silver', name: 'Moon Silver Charm', description: 'A charm shimmering with lunar and silver light.', type: 'charm', rarity: 'uncommon' });
             }
             if (name1?.includes('Ginseng') && name2?.includes('Ember')) {
                 results.push({ id: 'talisman_ginseng_ember', name: 'Ginseng Ember Talisman', description: 'A talisman radiating warmth and vitality.', type: 'talisman', rarity: 'rare', levelRequirement: 5 });
             }
        } else if (ingredients.length === 3) {
             // Example 3-ingredient craft
              if (selectedIds.includes('ing_ancient_ginseng') && selectedIds.includes('ing_moonbud') && selectedIds.includes('tool_glass_vial')) {
                   results.push({ id: 'potion_potent_ginseng_essence', name: 'Potent Ginseng Essence', description: 'A highly concentrated essence.', type: 'potion', rarity: 'rare', levelRequirement: 8 });
              }
        }
        return results;
    };

    const potentialResults = findPotentialCrafts(selectedIds);

    // Filter results based on current lunar phase and level if relevant
    const filteredResults = potentialResults.filter(result => {
      if (result.lunarRestriction && result.lunarRestriction !== lunarPhase) return false;
      if (result.levelRequirement && result.levelRequirement > playerLevel) return false;
       // Filter by active tab
       if (activeTab === 'potions' && result.type !== 'potion') return false;
       if (activeTab === 'charms' && result.type !== 'charm') return false;
       if (activeTab === 'talismans' && result.type !== 'talisman') return false;
      return true;
    });

    setPossibleResults(filteredResults);

  }, [selectedItems, knownRecipes, lunarPhase, playerLevel, playerItems, activeTab]); // Add dependencies

  const handleItemSelect = (item: InventoryItem) => {
    if (item.type !== 'ingredient') return; // Can only use ingredients

     const canAdd = canSelectItem(item);
     if (!canAdd) {
         console.log(`Cannot select more ${item.name}, only ${item.quantity} available.`);
         return; // Don't add if player doesn't have enough
     }

    // Limit selection size (e.g., max 3)
     if (selectedItems.length >= 3) {
         console.log("Max 3 ingredients allowed for crafting.");
         return;
     }

    // Add the item (we track instances, so duplicates are allowed if quantity permits)
    setSelectedItems([...selectedItems, item]);
  };

  const handleItemRemove = (itemToRemove: InventoryItem) => {
     // Find the first instance of the item to remove
     const indexToRemove = selectedItems.findIndex(item => item.id === itemToRemove.id);
     if (indexToRemove > -1) {
          const newSelection = [...selectedItems];
          newSelection.splice(indexToRemove, 1);
          setSelectedItems(newSelection);
     }
  };

  const handleCraft = (result: CraftingResult) => {
    const ingredientIds = selectedItems.map(item => item.id);
    console.log(`Attempting craft for: ${result.name} using [${ingredientIds.join(', ')}]`);

    // Call the backend interaction function via props
    // Pass the IDs of the ingredients used and the ID of the intended result item
    onCraftItem(ingredientIds, result.id); // Pass result.id instead of the whole object

    // Clear selected items optimisticly (or wait for state update from parent)
    setSelectedItems([]);
  };

  // Filter player inventory to show only usable ingredients
  const availableIngredients = playerItems.filter(
      item => item.type === 'ingredient' && item.quantity > 0
  );


  return (
    <div className="atelier-container">
      <div className="atelier-header">
        <h2>Witch's Atelier {playerSpecialization && <span className='spec-badge'>({playerSpecialization})</span>}</h2>
        <div className="phase-indicator">
          <LunarPhaseIcon phase={lunarPhase} size={30} />
          <span>{lunarPhase}</span>
        </div>
      </div>

      <div className="atelier-workspace">
        {/* Ingredients Panel */}
        <div className="ingredients-panel">
          <h3>Available Ingredients</h3>
          <div className="ingredient-list">
            {availableIngredients.length > 0 ? (
              availableIngredients.map(item => {
                 const isSelectable = canSelectItem(item);
                 const isSelected = selectedItems.some(sel => sel.id === item.id); // Basic check if *any* instance is selected
                 const selectedCount = selectedItems.filter(sel => sel.id === item.id).length;
                 return (
                    <div
                      key={`${item.id}-${item.quantity}`} // Key needs to be stable but reflect state if needed
                      className={`ingredient-item ${!isSelectable && !isSelected ? 'disabled' : ''} ${isSelected ? 'selected-dim' : ''}`}
                      onClick={isSelectable ? () => handleItemSelect(item) : undefined}
                      title={isSelectable ? `${item.name}\nQty: ${item.quantity}\nQuality: ${item.quality || 'N/A'}%` : `Not enough ${item.name} available (Need ${selectedCount+1}, Have ${item.quantity})`}
                    >
                      <div className="item-image">
                        {/* Placeholder Image Logic */}
                         <div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div>
                      </div>
                      <div className="item-name">{item.name}</div>
                       <div className="item-quantity">x{item.quantity}</div>
                       {/* Display selected count */}
                        {selectedCount > 0 && <div className="selected-count-badge">{selectedCount}</div>}
                    </div>
                 );
              })
            ) : (
                 <p className="no-ingredients">No ingredients in inventory.</p>
            )}
          </div>
        </div>

        {/* Crafting Area */}
        <div className="crafting-area">
          <h3>Crafting Bench</h3>
          <div className="cauldron"> {/* Reusing cauldron style for now */}
            {selectedItems.length > 0 ? (
              <div className="selected-ingredients">
                {selectedItems.map((item, index) => ( // Use index for unique key when duplicates allowed
                  <div
                    key={`${item.id}-${index}`}
                    className="selected-item"
                    onClick={() => handleItemRemove(item)} // Remove first instance matching the item clicked
                    title={`Remove ${item.name}`}
                  >
                    {item.name}
                    <span className="remove-item">×</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-cauldron">
                Add up to 3 ingredients<br/>to see possible crafts
              </div>
            )}
          </div>
           {/* Clear Button */}
            {selectedItems.length > 0 && (
                <button onClick={() => setSelectedItems([])} className="clear-button">
                    Clear Ingredients
                </button>
            )}
        </div>

        {/* Results Panel */}
        <div className="results-panel">
          <h3>Possible Creations</h3>
          {/* Tabs for different craft types if applicable */}
          {/* <div className="tabs"> ... </div> */}
          <div className="results-list">
            {selectedItems.length > 0 ? (
                possibleResults.length > 0 ? (
                possibleResults
                    // .filter(result => result.type === activeTab.slice(0,-1)) // Filter by tab if tabs exist
                    .map(result => (
                    <div
                        key={result.id}
                        className="result-item"
                        onClick={() => handleCraft(result)}
                        title={`Click to attempt crafting ${result.name}`}
                    >
                        <div className="result-image">
                             <div className="placeholder-image">{result.name.charAt(0).toUpperCase()}</div>
                        </div>
                        <div className="result-details">
                        <div className="result-name">{result.name}</div>
                        <div className="result-description">{result.description}</div>
                         <div className={`result-rarity ${result.rarity}`}>{result.rarity}</div>
                        </div>
                    </div>
                    ))
                ) : (
                <div className="no-results">No known recipes match selected ingredients.</div>
                )
            ) : (
                 <div className="no-results">Select ingredients to see possible crafts.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Atelier;