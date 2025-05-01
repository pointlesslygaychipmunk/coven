import React, { useState, useEffect } from 'react';
import './Atelier.css'; // Ensure this uses the new styles
import LunarPhaseIcon from './LunarPhaseIcon';
import { InventoryItem, BasicRecipeInfo, AtelierSpecialization, MoonPhase, ItemType, ItemCategory, Rarity } from 'coven-shared';

// Define the AtelierTab type
type AtelierTab = 'charm' | 'talisman' | 'tool'; // Added tool example

// Simplified CraftingResult for frontend display
interface CraftingResultDisplay {
    id: string; // Recipe/Result Item ID
    name: string;
    description: string;
    type: ItemType;
    category: ItemCategory;
    rarity: Rarity;
    // Add image placeholder if needed
    levelRequirement?: number;
}

interface AtelierProps {
  playerItems: InventoryItem[];
  onCraftItem: (ingredientInvItemIds: string[], resultItemId: string) => void; // Pass *inventory* IDs of used items
  lunarPhase: MoonPhase;
  playerLevel: number;
  playerSpecialization?: AtelierSpecialization;
  knownRecipes?: BasicRecipeInfo[];
}

const Atelier: React.FC<AtelierProps> = ({
  playerItems = [],
  onCraftItem,
  lunarPhase,
  playerLevel,
  playerSpecialization,
  knownRecipes = []
}) => {
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]); // Store selected inventory item *instances*
  const [possibleResults, setPossibleResults] = useState<CraftingResultDisplay[]>([]);
  const [activeTab, setActiveTab] = useState<AtelierTab>('charm'); // Default tab

  // Function to check if an item instance can be selected
  const canSelectItem = (item: InventoryItem): boolean => {
    const selectedCount = selectedItems.filter(sel => sel.id === item.id).length;
    return item.quantity > selectedCount;
  }

  // Find possible crafts based on selected ingredients (using base IDs for recipe matching)
  useEffect(() => {
    if (selectedItems.length === 0) {
      setPossibleResults([]);
      return;
    }

    const selectedBaseIds = selectedItems.map(item => item.baseId); // Use BASE IDs for recipe lookup

    // --- Placeholder Crafting Logic ---
    // In a real app, this would likely be an API call:
    // fetch('/api/atelier/check', { method: 'POST', body: JSON.stringify({ ingredientBaseIds: selectedBaseIds }) })
    const findPotentialCrafts = (ingredientBaseIds: string[]): CraftingResultDisplay[] => { // Now using ingredientBaseIds
        const results: CraftingResultDisplay[] = [];
        // Basic check against known recipes
        knownRecipes.forEach(known => {
            // TODO: Implement actual recipe matching logic based on known.ingredients
            // This is a very simplified placeholder check: Needs ingredient matching!
            // Example check: if recipe ingredients EXACTLY match selected base IDs (order doesn't matter)
            // Assuming the 'known' object (BasicRecipeInfo) might not have full ingredient details.
            // A more robust check would likely require fetching full recipe data based on ID
            // or doing the check entirely on the backend.
            // For now, let's assume *some* matching logic exists or we rely on hardcoded examples.
            const recipeMatchesSelection = true; // Replace with real check!

            if (recipeMatchesSelection) {
                // Check if recipe type matches the active tab
                if ((activeTab === 'charm' && known.type === 'charm') ||
                    (activeTab === 'talisman' && known.type === 'talisman') ||
                    (activeTab === 'tool' && known.type === 'tool') ) { // Add other types as needed
                     results.push({
                         id: known.id, // ID of the item to be created
                         name: known.name,
                         description: known.description || "A crafted item.",
                         type: known.type as ItemType, // Cast assuming knownRecipe has compatible type
                         category: known.category as ItemCategory, // Cast assuming knownRecipe has compatible category
                         rarity: (known as any).rarity || 'common', // TODO: Get rarity from knownRecipe if available, cast needed if not in BasicRecipeInfo
                         levelRequirement: (known as any).levelRequirement // If available
                     });
                }
            }
        });

        // Example hardcoded discoveries (can be removed if using recipes only)
        // Ensure these checks consider the activeTab as well
        if (activeTab === 'charm' && ingredientBaseIds.length === 2 && ingredientBaseIds.includes('ing_moonbud') && ingredientBaseIds.includes('ing_silverleaf') ) {
            // Prevent adding duplicates if already found via knownRecipes
            if (!results.some(r => r.id === 'charm_moon_silver')) {
                results.push({ id: 'charm_moon_silver', name: 'Moon Silver Charm', description: 'Shimmers with lunar light.', type: 'charm', category: 'charm', rarity: 'uncommon' });
            }
        }
        if (activeTab === 'talisman' && ingredientBaseIds.length === 3 && ingredientBaseIds.includes('misc_wood_birch') && ingredientBaseIds.includes('gem_quartz') && ingredientBaseIds.includes('tool_knife')) {
             if (!results.some(r => r.id === 'talisman_birch_quartz')) {
                results.push({ id: 'talisman_birch_quartz', name: 'Carved Birch Talisman', description: 'A simple protective talisman.', type: 'talisman', category: 'talisman', rarity: 'common' });
             }
        }


        return results;
    };
    // --- End Placeholder ---

    const potentialResults = findPotentialCrafts(selectedBaseIds); // Pass selectedBaseIds

    // Filter based on level etc.
    const filteredResults = potentialResults.filter(result => {
      if (result.levelRequirement && result.levelRequirement > playerLevel) return false;
      // Add lunar phase checks if needed based on recipe data
      return true;
    });

    setPossibleResults(filteredResults);

  }, [selectedItems, knownRecipes, lunarPhase, playerLevel, activeTab]); // Rerun on tab change

  const handleItemSelect = (item: InventoryItem) => {
    if (!canSelectItem(item)) return;
    if (selectedItems.length >= 3) return; // Max 3 components for now

    setSelectedItems([...selectedItems, item]);
  };

  const handleItemRemove = (indexToRemove: number) => {
    setSelectedItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleCraft = (result: CraftingResultDisplay) => {
    // We need to pass the specific inventory item IDs used, not just the base IDs
    const ingredientInvItemIds = selectedItems.map(item => item.id);
    onCraftItem(ingredientInvItemIds, result.id); // Pass inventory IDs and the ID of the item to create
    setSelectedItems([]); // Optimistic clear
  };

  // Filter inventory for display (ingredients, tools, gems, etc.)
  const availableComponents = playerItems.filter(
      item => ['ingredient', 'tool', 'gem', 'misc', 'ritual_item'].includes(item.type) && item.quantity > 0 // Expand allowed types
  ).sort((a,b) => a.name.localeCompare(b.name));


  return (
    <div className="atelier-container">
      <div className="atelier-header">
        <h2>Witch's Atelier {playerSpecialization && <span className='spec-badge'>({playerSpecialization})</span>}</h2>
        <div className="phase-indicator">
          <LunarPhaseIcon phase={lunarPhase} size={24} /> {/* Smaller icon */}
          <span>{lunarPhase}</span>
        </div>
      </div>

      <div className="atelier-workspace">
        {/* Ingredients/Components Panel */}
        <div className="ingredients-panel">
          <h3>Components</h3>
          <div className="ingredient-list">
            {availableComponents.length > 0 ? (
              availableComponents.map(item => {
                 const isSelectable = canSelectItem(item);
                 const selectedCount = selectedItems.filter(sel => sel.id === item.id).length;
                 // Check how many instances of this BASE item are selected
                 const selectedBaseCount = selectedItems.filter(sel => sel.baseId === item.baseId).length;

                 return (
                    <div
                      key={item.id} // Use the unique inventory ID as key
                      // Dim if *any* instance of this baseId is selected. Disable if *this* stack is fully used.
                      className={`ingredient-item ${!isSelectable ? 'disabled' : ''} ${selectedBaseCount > 0 ? 'selected-dim' : ''}`}
                      onClick={isSelectable ? () => handleItemSelect(item) : undefined}
                      title={isSelectable ? `${item.name} (Qty: ${item.quantity})` : `Not enough ${item.name}`}
                    >
                      <div className="item-image">
                         <div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div>
                         {/* Actual image would go here */}
                      </div>
                      <div className="item-name">{item.name}</div>
                       {/* Show quantity available in this stack */}
                       <div className="item-quantity">x{item.quantity}</div>
                       {/* Show count selected FROM THIS STACK */}
                       {selectedCount > 0 && <div className="selected-count-badge">{selectedCount}</div>}
                    </div>
                 );
              })
            ) : (
                 <p className="no-ingredients">No components available.</p>
            )}
          </div>
        </div>

        {/* Crafting Area */}
        <div className="crafting-area">
          <h3>Crafting Bench</h3>
          <div className="cauldron"> {/* Reusing class, styled as bench in CSS */}
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
                 {/* Fill remaining slots visually */}
                 {Array.from({ length: 3 - selectedItems.length }).map((_, i) => (
                     <div key={`slot-${i}`} className="selected-item placeholder-slot"></div>
                 ))}
              </div>
            ) : (
              <div className="empty-cauldron">
                Place up to 3 components here...
              </div>
            )}
          </div>
           {selectedItems.length > 0 && (
               <button onClick={() => setSelectedItems([])} className="clear-button">Clear Bench</button>
           )}
        </div>

        {/* Results Panel */}
        <div className="results-panel">
           <div className="tabs">
               <button className={activeTab === 'charm' ? 'active' : ''} onClick={() => { setActiveTab('charm'); }}>Charms</button>
               <button className={activeTab === 'talisman' ? 'active' : ''} onClick={() => { setActiveTab('talisman'); }}>Talismans</button>
               <button className={activeTab === 'tool' ? 'active' : ''} onClick={() => { setActiveTab('tool'); }}>Tools</button>
           </div>
          <h3>Possible Creations</h3>
          <div className="results-list">
            {selectedItems.length === 0 ? (
                 <div className="no-results">Select components first.</div>
            ) : possibleResults.length > 0 ? (
                possibleResults.map(result => (
                    <div
                        key={result.id}
                        className="result-item"
                        onClick={() => handleCraft(result)}
                        title={`Click to craft ${result.name}`}
                    >
                        <div className="result-image">
                             <div className="placeholder-image">{result.name.charAt(0).toUpperCase()}</div>
                        </div>
                        <div className="result-details">
                        <div className="result-name">{result.name}</div>
                        <div className="result-description">{result.description}</div>
                         <div className={`result-rarity ${result.rarity}`}>{result.rarity}</div>
                         {result.levelRequirement && <div className="level-req">Lv.{result.levelRequirement}</div>}
                        </div>
                        {/* Add a craft button directly? */}
                        {/* <button className="craft-now-btn">Craft</button> */}
                    </div>
                ))
            ) : (
                <div className="no-results">No known crafts match for {activeTab}.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Atelier;