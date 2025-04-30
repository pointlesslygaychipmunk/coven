import React, { useState, useEffect } from 'react';
import './Atelier.css';
import LunarPhaseIcon from './LunarPhaseIcon'; // Assuming LunarPhaseIcon exists and works
import { InventoryItem, BasicRecipeInfo, AtelierSpecialization, MoonPhase, ItemType, ItemCategory, Rarity } from 'coven-shared'; // Use shared types

// Define the AtelierTab type
type AtelierTab = 'potions' | 'charm' | 'talisman';

// Define a local type for potential crafting results if needed
// This might be fetched or derived from known recipes
interface CraftingResult {
    id: string;
    name: string;
    description: string;
    type: ItemType; // Use shared ItemType
    category: ItemCategory; // Use shared ItemCategory
    rarity: Rarity; // Use shared Rarity
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
  const [activeTab, setActiveTab] = useState<AtelierTab>('potions');

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

    const selectedIds = selectedItems.map(item => item.baseId); // Use BASE IDs for checking against recipes

    // Simulate finding recipes based on selected ingredients
    // --- Placeholder Crafting Logic ---
    // Replace with backend API call: POST /api/atelier/check { ingredientBaseIds } -> returns CraftingResult[]
    const findPotentialCrafts = (ingredientBaseIds: string[]): CraftingResult[] => {
        const results: CraftingResult[] = [];
        // Example: Simple 2-ingredient check (replace with real logic/API call)
        if (ingredientBaseIds.length === 2) {
             // We're not using these variables, so we can remove them
             // const item1Base = playerItems.find(i => i.baseId === ingredientBaseIds[0]);
             // const item2Base = playerItems.find(i => i.baseId === ingredientBaseIds[1]);

            // Use knownRecipes prop if available (basic check)
            knownRecipes.forEach(known => {
                 // Weak check - needs improvement based on actual recipe structure
                 if (known.type === 'charm' && activeTab === 'charm') {
                      results.push({ id: known.id, name: known.name, description: known.description || "A charm...", type: 'charm', category: 'charm', rarity: 'common' });
                 } else if (known.type === 'talisman' && activeTab === 'talisman') {
                     results.push({ id: known.id, name: known.name, description: known.description || "A talisman...", type: 'talisman', category: 'talisman', rarity: 'common' });
                 }
                 // Add potion logic if needed, though Brewing component handles that primarily
            });

            // Default discovery placeholders (using base IDs now)
             if (ingredientBaseIds.includes('ing_moonbud') && ingredientBaseIds.includes('ing_silverleaf')) {
                 results.push({ id: 'charm_moon_silver', name: 'Moon Silver Charm', description: 'A charm shimmering with lunar and silver light.', type: 'charm', category: 'charm', rarity: 'uncommon' });
             }
             if (ingredientBaseIds.includes('ing_ancient_ginseng') && ingredientBaseIds.includes('ing_emberberry')) {
                 results.push({ id: 'talisman_ginseng_ember', name: 'Ginseng Ember Talisman', description: 'A talisman radiating warmth and vitality.', type: 'talisman', category: 'talisman', rarity: 'rare', levelRequirement: 5 });
             }
        } else if (ingredientBaseIds.length === 3) {
             // Example 3-ingredient craft
              if (ingredientBaseIds.includes('ing_ancient_ginseng') && ingredientBaseIds.includes('ing_moonbud') && selectedItems.some(i => i.baseId === 'tool_glass_vial')) { // Check if a vial *instance* is selected
                   results.push({ id: 'potion_potent_ginseng_essence', name: 'Potent Ginseng Essence', description: 'A highly concentrated essence.', type: 'potion', category: 'essence', rarity: 'rare', levelRequirement: 8 });
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
       if (activeTab === 'charm' && result.type !== 'charm') return false;
       if (activeTab === 'talisman' && result.type !== 'talisman') return false;
      return true;
    });

    setPossibleResults(filteredResults);

  }, [selectedItems, knownRecipes, lunarPhase, playerLevel, playerItems, activeTab]); // Add dependencies

  const handleItemSelect = (item: InventoryItem) => {
    // Allow selecting tools or other non-ingredients if needed by recipes
    // if (item.type !== 'ingredient') return;

     const canAdd = canSelectItem(item);
     if (!canAdd) {
         console.log(`Cannot select more ${item.name}, only ${item.quantity} available.`);
         return; // Don't add if player doesn't have enough
     }

    // Limit selection size (e.g., max 3)
     if (selectedItems.length >= 3) {
         console.log("Max 3 items allowed for crafting.");
         return;
     }

    // Add the item (we track instances, so duplicates are allowed if quantity permits)
    setSelectedItems([...selectedItems, item]);
  };

  const handleItemRemove = (indexToRemove: number) => {
     const newSelection = [...selectedItems];
     newSelection.splice(indexToRemove, 1);
     setSelectedItems(newSelection);
  };

  const handleCraft = (result: CraftingResult) => {
    const ingredientIds = selectedItems.map(item => item.id); // Pass the unique inventory item IDs
    console.log(`Attempting craft for: ${result.name} using [${ingredientIds.join(', ')}]`);

    // Call the backend interaction function via props
    // Pass the IDs of the ingredients used and the ID of the intended result item
    onCraftItem(ingredientIds, result.id); // Pass result.id instead of the whole object

    // Clear selected items optimisticly (or wait for state update from parent)
    setSelectedItems([]);
  };

  // Filter player inventory to show only usable ingredients/items
  const availableIngredients = playerItems.filter(
      item => (item.type === 'ingredient' || item.type === 'tool' || item.type === 'ritual_item') && item.quantity > 0 // Allow tools etc.
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
          <h3>Available Components</h3>
          <div className="ingredient-list">
            {availableIngredients.length > 0 ? (
              availableIngredients.map(item => {
                 const isSelectable = canSelectItem(item);
                 const selectedCount = selectedItems.filter(sel => sel.id === item.id).length;
                 const isSelectedInstanceCount = selectedItems.filter(sel => sel.baseId === item.baseId).length; // Count how many of this *type* are selected

                 return (
                    <div
                      key={item.id} // Use the unique inventory ID as key
                      className={`ingredient-item ${!isSelectable ? 'disabled' : ''} ${isSelectedInstanceCount > 0 ? 'selected-dim' : ''}`} // Dim if any instance of this baseId is selected
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
                        {isSelectedInstanceCount > 0 && <div className="selected-count-badge">{isSelectedInstanceCount}</div>}
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
                    key={`${item.id}-${index}`} // Use index to ensure key uniqueness for identical items
                    className="selected-item"
                    onClick={() => handleItemRemove(index)} // Pass index to remove specific instance
                    title={`Remove ${item.name}`}
                  >
                    {item.name}
                    <span className="remove-item">×</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-cauldron">
                Add up to 3 components<br/>to see possible crafts
              </div>
            )}
          </div>
           {/* Clear Button */}
            {selectedItems.length > 0 && (
                <button onClick={() => setSelectedItems([])} className="clear-button">
                    Clear Components
                </button>
            )}
        </div>

        {/* Results Panel */}
        <div className="results-panel">
           <div className="tabs">
               <button className={activeTab === 'charm' ? 'active' : ''} onClick={() => setActiveTab('charm')}>Charms</button>
               <button className={activeTab === 'talisman' ? 'active' : ''} onClick={() => setActiveTab('talisman')}>Talismans</button>
               {/* Add other tabs like Potions if Atelier crafts them */}
               {/* <button className={activeTab === 'potions' ? 'active' : ''} onClick={() => setActiveTab('potions')}>Potions</button> */}
           </div>
          <h3>Possible Creations</h3>
          <div className="results-list">
            {selectedItems.length > 0 ? (
                possibleResults.length > 0 ? (
                possibleResults
                    // Filter results based on the active tab (already done in useEffect)
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
                <div className="no-results">No known recipes match selected components for {activeTab}.</div>
                )
            ) : (
                 <div className="no-results">Select components to see possible crafts.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Atelier;