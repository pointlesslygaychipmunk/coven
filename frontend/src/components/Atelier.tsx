import React, { useState, useEffect, useRef } from 'react';
import './Atelier.css';
import LunarPhaseIcon from './LunarPhaseIcon';
import { InventoryItem, BasicRecipeInfo, AtelierSpecialization, MoonPhase, ItemType, ItemCategory, Rarity } from 'coven-shared';

// Define the AtelierTab type
type AtelierTab = 'charm' | 'talisman'; // Potions removed, handled by Brewing

// Define a local type for potential crafting results if needed
interface CraftingResult {
    id: string;
    name: string;
    description: string;
    type: ItemType; // Now should be 'charm' or 'talisman'
    category: ItemCategory; // Use shared ItemCategory type
    rarity: Rarity;
    imagePath?: string; // Placeholder for potential future use
    lunarRestriction?: MoonPhase;
    levelRequirement?: number;
}

interface AtelierProps {
  playerItems: InventoryItem[];
  onCraftItem: (ingredientIds: string[], resultItemId: string) => void;
  lunarPhase: MoonPhase;
  playerLevel: number;
  playerSpecialization?: AtelierSpecialization;
  knownRecipes?: BasicRecipeInfo[]; // Recipes relevant to Atelier (Charms, Talismans)
}

const Atelier: React.FC<AtelierProps> = ({
  playerItems = [],
  onCraftItem,
  lunarPhase,
  playerLevel,
  playerSpecialization,
  knownRecipes = [] // Default to empty if not provided
}) => {
  // Component state
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [possibleResults, setPossibleResults] = useState<CraftingResult[]>([]);
  const [activeTab, setActiveTab] = useState<AtelierTab>('charm'); // Default to charm

  // Secret 90s easter egg state
  const [cornerClicks, setCornerClicks] = useState(0);
  const [showSecretCheat, setShowSecretCheat] = useState(false);
  const secretMessageRef = useRef<HTMLDivElement>(null);
  const cornerClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to check if an item can be selected (has quantity > 0)
  const canSelectItem = (item: InventoryItem): boolean => {
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
    const findPotentialCrafts = (ingredientBaseIds: string[]): CraftingResult[] => {
        const results: CraftingResult[] = [];

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
                         type: known.type as 'charm' | 'talisman', // Ensure type matches AtelierTab
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
                 results.push({ id: 'talisman_night_root', name: 'Night Root Talisman', description: 'A ward against minor hexes.', type: 'talisman', category: 'talisman', rarity: 'uncommon'});
            }
        } else if (ingredientBaseIds.length === 3) {
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
      if (result.lunarRestriction && result.lunarRestriction !== lunarPhase) return false;
      if (result.levelRequirement && result.levelRequirement > playerLevel) return false;

      // Filter by active tab explicitly
      if (result.type !== activeTab) return false;

      return true;
    });

    setPossibleResults(filteredResults);
  }, [selectedItems, knownRecipes, lunarPhase, playerLevel, playerItems, activeTab]); // Added activeTab dependency

  const handleItemSelect = (item: InventoryItem) => {
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
    selectSound.play().catch(() => { /* Ignore failed playback */ });
  };

  const handleItemRemove = (indexToRemove: number) => {
    const newSelection = [...selectedItems];
    newSelection.splice(indexToRemove, 1);
    setSelectedItems(newSelection);

    // Play a subtle remove sound effect (placeholder)
    const removeSound = new Audio('data:audio/wav;base64,UklGRmQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABDMxlAQzMZQD00GUE+NRlCPjUZQz82GUQ/NhlFQDcZRkA3GUZANxlGQDcZRkA3GUZANxlFPzYZRD82GUM+NRlCPTQZQTwzGUA7MhhAOjEYQDkwGEE4MBdCOC8XQzguF0Q3LhdENS0XRTUsF0Y1LBdGNCsXRzQrF0cyKRdIMyoXSDIpF0kxKBdKMSgXSjEoF0oxKBdKMSgXSTEoF0kyKRdIMikXRzMqF0Y0KxdFNCwXRDUtF0M3LhdCOC8XQTgwF0A5MRhAOjIYQDszGEA8MxlAPTQZQT41GUIPuD1CDLc9Qwm2PUMJ');
    removeSound.volume = 0.1;
    removeSound.play().catch(() => { /* Ignore failed playback */ });
  };

  const handleCraft = (result: CraftingResult) => {
    const ingredientIds = selectedItems.map(item => item.id); // Pass inventory item IDs
    console.log(`Attempting craft for: ${result.name} using inventory items [${ingredientIds.join(', ')}]`);

    // Call the onCraftItem prop with inventory item IDs and result ID
    onCraftItem(ingredientIds, result.id);

    // Play a crafting success sound effect (placeholder)
    const craftSound = new Audio('data:audio/wav;base64,UklGRr4CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YZoCAAD/////////////////////////////////////////////l5eXWVlZWVlZl5eX////////MzMzAAAAAAAAMzMz////////MzMzr6+vr6+vMzMz//////5eXl1lZWVlZWZeXl////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////w==');
    craftSound.volume = 0.2;
    craftSound.play().catch(() => { /* Ignore failed playback */ });

    // Clear selected items after crafting attempt
    setSelectedItems([]);
  };

  // Filter player inventory to show only usable components for crafting
  const availableComponents = playerItems.filter(
    item => (item.type === 'ingredient' || item.type === 'tool' || item.type === 'ritual_item') && item.quantity > 0
  );

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
    clickSound.play().catch(() => { /* Ignore */ });

    // Show secret cheat message after 3 clicks
    if (newClickCount >= 3) {
      setShowSecretCheat(true);

      // Hide message after delay
      setTimeout(() => {
        setShowSecretCheat(false);
      }, 5000); // Show for 5 seconds

      // Reset counter after successful trigger
      setCornerClicks(0);
    } else {
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
      const handleContainerClick = (e: Event) => {
        // Cast Event to MouseEvent to access position properties
        const mouseEvent = e as MouseEvent;
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
  }, [cornerClicks, handleCornerClick]);


  return (
    <div className="atelier-container">
      <div className="atelier-header">
        <h2>
          Witch's Atelier
          {playerSpecialization && <span className='spec-badge'>({playerSpecialization})</span>}
        </h2>
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
            {availableComponents.length > 0 ? (
              availableComponents.map(item => {
                const isSelectable = canSelectItem(item);
                // Count how many times *this specific inventory item stack* is selected
                const selectedCountForItem = selectedItems.filter(sel => sel.id === item.id).length;
                // Check if *any* instance of this base item type is selected (for dimming)
                const isBaseItemSelected = selectedItems.some(sel => sel.baseId === item.baseId);
                // Check if the total selected count reaches the available quantity for *this stack*
                const isStackSelectedDim = selectedCountForItem >= item.quantity;


                return (
                  <div
                    key={item.id} // Use unique inventory ID
                    className={`ingredient-item ${!isSelectable || isStackSelectedDim ? 'disabled' : ''} ${isBaseItemSelected ? 'selected-dim' : ''}`}
                    onClick={isSelectable && !isStackSelectedDim ? () => handleItemSelect(item) : undefined}
                    title={isSelectable ? `${item.name}\nQty: ${item.quantity}\nQuality: ${item.quality || 'N/A'}%` : `Not enough ${item.name} available (Need ${selectedCountForItem+1}, Have ${item.quantity})`}
                  >
                    <div className="item-image">
                      {/* Placeholder image - replace with actual image if path exists */}
                      <div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div>
                    </div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-quantity">×{item.quantity}</div>
                    {/* Show badge only if this specific stack instance is selected */}
                    {selectedCountForItem > 0 && <div className="selected-count-badge">{selectedCountForItem}</div>}
                  </div>
                );
              })
            ) : (
              <p className="no-ingredients">No components in inventory.</p> // Updated text
            )}
          </div>
        </div>

        {/* Crafting Area */}
        <div className="crafting-area">
          <h3>Crafting Circle</h3> {/* Changed title */}
          <div className="cauldron"> {/* Reusing cauldron visual, maybe rename class later */}
            {selectedItems.length === 0 ? (
              <div className="empty-cauldron">
                Add components to the circle...
              </div>
            ) : (
              <div className="selected-ingredients">
                {selectedItems.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`} // Key includes index for duplicates
                    className="selected-item"
                    onClick={() => handleItemRemove(index)} // Remove by index
                    title={`Remove ${item.name}`}
                  >
                    {item.name}
                    <span className="remove-item">×</span>
                  </div>
                ))}
              </div>
            )}
             {/* Bubbling effect */}
             {selectedItems.length > 0 && (
                <>
                  <div className="bubble bubble-1"></div>
                  <div className="bubble bubble-2"></div>
                  <div className="bubble bubble-3"></div>
                </>
             )}
          </div>

          {/* Clear Button - only shown when items are selected */}
          {selectedItems.length > 0 && (
            <button
              onClick={() => setSelectedItems([])}
              className="clear-button"
            >
              Clear Circle
            </button>
          )}
        </div>

        {/* Results Panel */}
        <div className="results-panel">
          <div className="tabs">
            <button
              className={activeTab === 'charm' ? 'active' : ''}
              onClick={() => setActiveTab('charm')}
            >
              Charms
            </button>
            <button
              className={activeTab === 'talisman' ? 'active' : ''}
              onClick={() => setActiveTab('talisman')}
            >
              Talismans
            </button>
            {/* Potions tab removed */}
          </div>

          <h3>Possible Creations</h3>

          <div className="results-list">
            {selectedItems.length === 0 ? (
               <div className="no-results">Select components to see possible crafts.</div>
            ) : possibleResults.length > 0 ? (
                possibleResults.map(result => (
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
                <div className="no-results">No known recipes match components for {activeTab}s.</div>
              )}
          </div>
        </div>
      </div>

      {/* Hidden 90s secret cheat code message */}
      <div
        ref={secretMessageRef}
        className={`secret-cheat ${showSecretCheat ? 'show' : ''}`}
      >
        CHEAT CODE UNLOCKED: DOUBLE RARITY CHANCE!
      </div>
    </div>
  );
};

export default Atelier;