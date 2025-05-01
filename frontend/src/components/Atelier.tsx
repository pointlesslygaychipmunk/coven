import React, { useState, useEffect, useRef } from 'react';
import './Atelier.css';
import LunarPhaseIcon from './LunarPhaseIcon';
import { InventoryItem, BasicRecipeInfo, AtelierSpecialization, MoonPhase, ItemType, ItemCategory, Rarity } from 'coven-shared';

// Define the AtelierTab type
type AtelierTab = 'potions' | 'charm' | 'talisman';

// Define a local type for potential crafting results if needed
interface CraftingResult {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    category: ItemCategory;
    rarity: Rarity;
    imagePath?: string;
    lunarRestriction?: MoonPhase;
    levelRequirement?: number;
}

interface AtelierProps {
  playerItems: InventoryItem[];
  onCraftItem: (ingredientIds: string[], resultItemId: string) => void;
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
  // Component state
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [possibleResults, setPossibleResults] = useState<CraftingResult[]>([]);
  const [activeTab, setActiveTab] = useState<AtelierTab>('charm');
  
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

    const selectedIds = selectedItems.map(item => item.baseId);

    // Simulate finding recipes based on selected ingredients
    const findPotentialCrafts = (ingredientBaseIds: string[]): CraftingResult[] => {
        const results: CraftingResult[] = [];
        // Example: Simple 2-ingredient check (replace with real logic/API call)
        if (ingredientBaseIds.length === 2) {
             // Use knownRecipes prop if available (basic check)
            knownRecipes.forEach(known => {
                 // Check if recipe type matches active tab
                 if (known.type === 'charm' && activeTab === 'charm') {
                      results.push({ id: known.id, name: known.name, description: known.description || "A charm...", type: 'charm', category: 'charm', rarity: 'common' });
                 } else if (known.type === 'talisman' && activeTab === 'talisman') {
                     results.push({ id: known.id, name: known.name, description: known.description || "A talisman...", type: 'talisman', category: 'talisman', rarity: 'common' });
                 }
            });

            // Default discovery placeholders using base IDs
             if (ingredientBaseIds.includes('ing_moonbud') && ingredientBaseIds.includes('ing_silverleaf')) {
                 results.push({ id: 'charm_moon_silver', name: 'Moon Silver Charm', description: 'A charm shimmering with lunar and silver light.', type: 'charm', category: 'charm', rarity: 'uncommon' });
             }
             if (ingredientBaseIds.includes('ing_ancient_ginseng') && ingredientBaseIds.includes('ing_emberberry')) {
                 results.push({ id: 'talisman_ginseng_ember', name: 'Ginseng Ember Talisman', description: 'A talisman radiating warmth and vitality.', type: 'talisman', category: 'talisman', rarity: 'rare', levelRequirement: 5 });
             }
        } else if (ingredientBaseIds.length === 3) {
             // Example 3-ingredient craft
              if (ingredientBaseIds.includes('ing_ancient_ginseng') && ingredientBaseIds.includes('ing_moonbud') && selectedItems.some(i => i.baseId === 'tool_glass_vial')) {
                   results.push({ id: 'potion_potent_ginseng_essence', name: 'Potent Ginseng Essence', description: 'A highly concentrated essence.', type: 'potion', category: 'essence', rarity: 'rare', levelRequirement: 8 });
              }
        }
        return results;
    };

    const potentialResults = findPotentialCrafts(selectedIds);

    // Filter results based on current lunar phase and level requirements
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
  }, [selectedItems, knownRecipes, lunarPhase, playerLevel, playerItems, activeTab]);

  const handleItemSelect = (item: InventoryItem) => {
    const canAdd = canSelectItem(item);
    if (!canAdd) {
      console.log(`Cannot select more ${item.name}, only ${item.quantity} available.`);
      return;
    }

    // Limit selection size to max 3 items
    if (selectedItems.length >= 3) {
      console.log("Max 3 items allowed for crafting.");
      return;
    }

    // Add the item to selection
    setSelectedItems([...selectedItems, item]);
    
    // Play a subtle select sound effect
    const selectSound = new Audio('data:audio/wav;base64,UklGRmQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABDMxlAQzMZQD00GUE+NRlCPjUZQz82GUQ/NhlFQDcZRkA3GUZANxlGQDcZRkA3GUZANxlFPzYZRD82GUM+NRlCPTQZQTwzGUA7MhhAOjEYQDkwGEE4MBdCOC8XQzguF0Q3LhdENS0XRTUsF0Y1LBdGNCsXRzQrF0cyKRdIMyoXSDIpF0kxKBdKMSgXSjEoF0oxKBdKMSgXSTEoF0kyKRdIMikXRzMqF0Y0KxdFNCwXRDUtF0M3LhdCOC8XQTgwF0A5MRhAOjIYQDszGEA8MxlAPTQZQT41GUIPuD1CDLc9Qwm2PUMJ');
    selectSound.volume = 0.1;
    selectSound.play().catch(() => {
      // Audio play failed (probably because user hasn't interacted) - ignore
    });
  };

  const handleItemRemove = (indexToRemove: number) => {
    const newSelection = [...selectedItems];
    newSelection.splice(indexToRemove, 1);
    setSelectedItems(newSelection);
    
    // Play a subtle remove sound effect
    const removeSound = new Audio('data:audio/wav;base64,UklGRmQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABDMxlAQzMZQD00GUE+NRlCPjUZQz82GUQ/NhlFQDcZRkA3GUZANxlGQDcZRkA3GUZANxlFPzYZRD82GUM+NRlCPTQZQTwzGUA7MhhAOjEYQDkwGEE4MBdCOC8XQzguF0Q3LhdENS0XRTUsF0Y1LBdGNCsXRzQrF0cyKRdIMyoXSDIpF0kxKBdKMSgXSjEoF0oxKBdKMSgXSTEoF0kyKRdIMikXRzMqF0Y0KxdFNCwXRDUtF0M3LhdCOC8XQTgwF0A5MRhAOjIYQDszGEA8MxlAPTQZQT41GUIPuD1CDLc9Qwm2PUMJ');
    removeSound.volume = 0.1;
    removeSound.play().catch(() => {
      // Audio play failed (probably because user hasn't interacted) - ignore
    });
  };

  const handleCraft = (result: CraftingResult) => {
    const ingredientIds = selectedItems.map(item => item.id);
    console.log(`Attempting craft for: ${result.name} using [${ingredientIds.join(', ')}]`);

    // Call the onCraftItem prop with ingredient IDs and result ID
    onCraftItem(ingredientIds, result.id);

    // Play a crafting success sound effect
    const craftSound = new Audio('data:audio/wav;base64,UklGRr4CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YZoCAAD/////////////////////////////////////////////l5eXWVlZWVlZl5eX////////MzMzAAAAAAAAMzMz////////MzMzAAAAAAAAMzMz////////l5eXWVlZWVlZl5eX/////////////////////////////////////////////////////////////////////////////////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////////////////////////////////////5eXl1lZWVlZWZeXl///////MzMzAAAAAAAAMzMz///////MzMzr6+vr6+vMzMz//////5eXl1lZWVlZWZeXl////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////w==');
    craftSound.volume = 0.2;
    craftSound.play().catch(() => {
      // Audio play failed (probably because user hasn't interacted) - ignore
    });

    // Clear selected items 
    setSelectedItems([]);
  };

  // Filter player inventory to show only usable ingredients/items
  const availableIngredients = playerItems.filter(
    item => (item.type === 'ingredient' || item.type === 'tool' || item.type === 'ritual_item') && item.quantity > 0
  );
  
  // Handle the 90s-style Easter egg - clicking the corner
  const handleCornerClick = () => {
    // Reset the timeout
    if (cornerClickTimeoutRef.current) {
      clearTimeout(cornerClickTimeoutRef.current);
    }
    
    // Increment click counter
    setCornerClicks(prev => prev + 1);
    
    // Play a secret click sound
    const clickSound = new Audio('data:audio/wav;base64,UklGRjwCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRQCAABPT09PT09PT09PT09QUFBQUFBQUFBQUFBQUFBQUFBQUFBPT09PT09PT09PT09PT09PT09PT09PT09PT09KSkpCQkI6Ojo0NDQwMDAtLS0sLCwrKyspKSkoKCgnJycoKCgqKiotLS0yMjI5OTlBQUFKSkpSUlJYWFhdXV1hYWFkZGRmZmZnZ2doaGhnZ2dnZ2dmZmZkZGRiYmJeXl5ZWVlUVFROTk5ISEhCQkI8PDw2NjYyMjIvLy8tLS0rKysqKioqKiorKyssLCwuLi4xMTE1NTU5OTk+Pj5DQ0NISEhNTU1RUVFVVVVXV1daWlpbW1tcXFxcXFxcXFxbW1tZWVlXV1dVVVVSUlJPT09MTExISEhFRUVCQkI/Pz89PT08PDw7Ozs7Ozs7Ozs8PDw9PT0/Pz9AQEBDQ0NGRkZJSUlMTExPT09RUVFTU1NUVFRWVVVXV1dXV1dXV1dXV1dWVlZVVVVTU1NRUVFPTk5MTExKSkpHR0dFRUVDQ0NBQUFAQEBAQEBAQEBAQEBAQEBAQEFBQUJCQkNDQ0VFRUdHR0lJSUtLS01NTU9PT1FRUVJSUVNTU1RUVFRUVFRUVFNTU1JSUlFRUVBQUE5OTk1NTUtLS0pKSklJSUhISEhISEhISEhISEhISEhISUlJSUlJSUlJSkpKS0tLTExMTU1NTk5OT09PUFBQUFBQUE9PT09PT09PT09PT09PT09PT09PT09PT09OTk5OTk5OTk5OTk5OTk5OTk5OTk5PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PTw==');
    clickSound.volume = 0.1;
    clickSound.play().catch(() => {
      // Audio play failed (probably because user hasn't interacted) - ignore
    });
    
    // Show secret cheat message after 3 clicks
    if (cornerClicks + 1 >= 3) {
      setShowSecretCheat(true);
      
      // Hide message after delay
      setTimeout(() => {
        setShowSecretCheat(false);
      }, 5000);
      
      // Reset counter after successful trigger
      setCornerClicks(0);
    } else {
      // Setup timeout to reset clicks if not clicked again quickly
      cornerClickTimeoutRef.current = setTimeout(() => {
        setCornerClicks(0);
      }, 1000);
    }
  };
  
  // Set up corner click listener
  useEffect(() => {
    const container = document.querySelector('.atelier-container');
    if (container) {
      // Fix: Create a proper DOM event handler function with the correct type
      const handleContainerClick = (e: Event) => {
        // Cast Event to MouseEvent to access position properties
        const mouseEvent = e as MouseEvent;
        // Check if click was in the bottom-right corner
        const rect = container.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;
        
        if (x > rect.width - 20 && y > rect.height - 20) {
          handleCornerClick();
        }
      };
      
      container.addEventListener('click', handleContainerClick);
      return () => {
        container.removeEventListener('click', handleContainerClick);
      };
    }
    
    // Clean up timeout on component unmount
    return () => {
      if (cornerClickTimeoutRef.current) {
        clearTimeout(cornerClickTimeoutRef.current);
      }
    };
  }, [cornerClicks]);

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
            {availableIngredients.length > 0 ? (
              availableIngredients.map(item => {
                const isSelectable = canSelectItem(item);
                const selectedCount = selectedItems.filter(sel => sel.id === item.id).length;
                const isSelectedInstanceCount = selectedItems.filter(sel => sel.baseId === item.baseId).length;

                return (
                  <div
                    key={item.id}
                    className={`ingredient-item ${!isSelectable ? 'disabled' : ''} ${isSelectedInstanceCount > 0 ? 'selected-dim' : ''}`}
                    onClick={isSelectable ? () => handleItemSelect(item) : undefined}
                    title={isSelectable ? `${item.name}\nQty: ${item.quantity}\nQuality: ${item.quality || 'N/A'}%` : `Not enough ${item.name} available (Need ${selectedCount+1}, Have ${item.quantity})`}
                  >
                    <div className="item-image">
                      <div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div>
                    </div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-quantity">×{item.quantity}</div>
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
          <h3>Crafting Cauldron</h3>
          <div className="cauldron">
            {selectedItems.length > 0 ? (
              <div className="selected-ingredients">
                {selectedItems.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="selected-item"
                    onClick={() => handleItemRemove(index)}
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
          
          {/* Clear Button - only shown when items are selected */}
          {selectedItems.length > 0 && (
            <button 
              onClick={() => setSelectedItems([])} 
              className="clear-button"
            >
              Clear Components
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
          </div>
          
          <h3>Possible Creations</h3>
          
          <div className="results-list">
            {selectedItems.length > 0 ? (
              possibleResults.length > 0 ? (
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
                <div className="no-results">No known recipes match selected components for {activeTab}.</div>
              )
            ) : (
              <div className="no-results">Select components to see possible crafts.</div>
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