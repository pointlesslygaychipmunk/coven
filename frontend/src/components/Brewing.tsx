import React, { useState, useEffect } from 'react';
import './Brewing.css';
import { InventoryItem, BasicRecipeInfo, AtelierSpecialization, MoonPhase } from 'coven-shared'; // Use shared types
import LunarPhaseIcon from './LunarPhaseIcon'; // Import the moon phase icon component

interface BrewingProps {
  playerInventory: InventoryItem[];
  knownRecipes: BasicRecipeInfo[]; // Use BasicRecipeInfo or Recipe IDs
  lunarPhase: MoonPhase; // Use shared type
  playerSpecialization?: AtelierSpecialization; // Make optional for potential future use
  onBrew: (ingredientIds: string[], recipeId?: string) => void; // Pass ingredient IDs and optional recipe ID
}

const Brewing: React.FC<BrewingProps> = ({
  playerInventory,
  knownRecipes = [], // Default to empty array
  lunarPhase,
  playerSpecialization,
  onBrew
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [matchedRecipeInfo, setMatchedRecipeInfo] = useState<BasicRecipeInfo | null>(null); // Use BasicRecipeInfo
  const [potionCategoryFilter, setPotionCategoryFilter] = useState<string>('all');
  const [brewResult, setBrewResult] = useState<{ // Renamed state for clarity
    success: boolean;
    message: string;
    potionName?: string;
    quality?: number;
  } | null>(null);
  const [bubbling, setBubbling] = useState<boolean>(false);
  const [brewingAnimation, setBrewingAnimation] = useState<boolean>(false);

  // Filter inventory items to show only ingredients with quantity > 0
  useEffect(() => {
    let filtered = playerInventory.filter(item => item.type === 'ingredient' && item.quantity > 0);

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }

    setFilteredInventory(filtered);
  }, [playerInventory, categoryFilter, searchTerm]);

  // Check for matching *known* recipe when ingredients change
  useEffect(() => {
    if (selectedIngredients.length === 2) {
      // Very basic check: Find first known recipe that has a category matching the filter
      const potentialMatch = knownRecipes.find(recipe => {
        if (potionCategoryFilter !== 'all' && recipe.category !== potionCategoryFilter) {
          return false;
        }
        // Just a placeholder check - in a real implementation this would check ingredients
        return true;
      });
      setMatchedRecipeInfo(potentialMatch || null);
      
      // Start bubbling effect when ingredients are selected
      setBubbling(true);
    } else {
      setMatchedRecipeInfo(null);
      setBubbling(selectedIngredients.length > 0);
    }
  }, [selectedIngredients, knownRecipes, potionCategoryFilter]);

  // Handle ingredient selection
  const handleIngredientSelect = (item: InventoryItem) => {
    if (selectedIngredients.length >= 2) { // Limit to 2 ingredients for now
      return;
    }
    
    const canAdd = canSelectItem(item);
    if (!canAdd) {
      return;
    }
    
    setSelectedIngredients([...selectedIngredients, item]);
    setBrewResult(null); // Clear previous result when ingredients change
    
    // Add bubbling sound effect (would be implemented with a sound library)
    // playSound('bubble_soft.mp3');
  };

  // Function to check if an item can be selected
  const canSelectItem = (item: InventoryItem): boolean => {
    // Allow selection if the item is not already selected OR if player has more than the currently selected count
    const selectedCount = selectedIngredients.filter(sel => sel.id === item.id).length;
    return item.quantity > selectedCount;
  };

  // Remove an ingredient from selection
  const handleRemoveIngredient = (itemId: string) => {
    // Find the *last* instance of the item with this ID and remove it
    const indexToRemove = selectedIngredients.map(i => i.id).lastIndexOf(itemId);
    if (indexToRemove !== -1) {
      const newSelection = [...selectedIngredients];
      newSelection.splice(indexToRemove, 1);
      setSelectedIngredients(newSelection);
    }
    setBrewResult(null); // Clear previous result
    
    // Add plop sound effect (would be implemented with a sound library)
    // playSound('plop.mp3');
  };

  // Clear all selected ingredients
  const handleClearIngredients = () => {
    setSelectedIngredients([]);
    setMatchedRecipeInfo(null);
    setBrewResult(null); // Clear previous result
    
    // Add whoosh sound effect (would be implemented with a sound library)
    // playSound('whoosh.mp3');
  };

  // Start brewing process - Call the prop function
  const handleBrew = () => {
    if (selectedIngredients.length !== 2) {
      setBrewResult({ 
        success: false, 
        message: "A proper brew requires exactly two ingredients, as is tradition!"
      });
      return;
    }

    // Animate brewing
    setBrewingAnimation(true);
    
    // Add brewing sound effect (would be implemented with a sound library)
    // playSound('brewing.mp3');
    
    // Delay to show animation
    setTimeout(() => {
      // Pass inventory item IDs and the matched known recipe ID (if any)
      const ingredientIds: string[] = selectedIngredients.map(item => item.id);
      onBrew(ingredientIds, matchedRecipeInfo?.id);
      
      // Clear selection after initiating brew
      setSelectedIngredients([]);
      setMatchedRecipeInfo(null);
      setBrewingAnimation(false);
      
      // Simulate a brew result (in real implementation, this would come from game state)
      setBrewResult({
        success: Math.random() > 0.3, // 70% success rate for demo
        message: Math.random() > 0.3 ? 
          "Your concoction bubbles with magical energy!" : 
          "The mixture hisses and turns a murky color...",
        potionName: matchedRecipeInfo?.name || "Mysterious Potion",
        quality: Math.floor(60 + Math.random() * 40)
      });
    }, 1200);
  };

  // Get filtered known recipes by category
  const getFilteredKnownRecipes = () => {
    let filtered = knownRecipes;
    if (potionCategoryFilter !== 'all') {
      // Filter based on the category available in BasicRecipeInfo
      filtered = filtered.filter(recipe => recipe.category === potionCategoryFilter);
    }
    return filtered;
  };

  // Get unique ingredient categories from inventory for filtering
  const getIngredientCategories = () => {
    const categories = new Set<string>();
    playerInventory.forEach(item => {
      if (item.type === 'ingredient' && item.category) {
        categories.add(item.category);
      }
    });
    return Array.from(categories).sort();
  };

  // Get unique potion categories from known recipes for filtering
  const getPotionCategories = () => {
    const categories = new Set<string>();
    knownRecipes.forEach(recipe => {
      if (recipe.category) {
        categories.add(recipe.category);
      }
    });
    return Array.from(categories).sort();
  };

  // Helper for recipe difficulty stars
  const renderDifficultyStars = (difficulty: number) => {
    return '★'.repeat(Math.min(5, difficulty)) + '☆'.repeat(Math.max(0, 5 - difficulty));
  };

  return (
    <div className="brewing-container">
      <div className="brewing-header">
        <h2>Witch's Cauldron</h2>
        <div className="brewing-phase">
          <LunarPhaseIcon phase={lunarPhase} size={28} />
          <div className="phase-value">{lunarPhase}</div>
        </div>
      </div>

      <div className="brewing-content">
        {/* Ingredients Panel */}
        <div className="ingredients-panel">
          <div className="ingredients-header">
            <h3>Ingredients</h3>
            <div className="ingredients-filters">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {getIngredientCategories().map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="ingredients-grid">
            {filteredInventory.length > 0 ? (
              filteredInventory.map(item => {
                // Dim item if it's already selected (up to its quantity)
                const selectedCount = selectedIngredients.filter(sel => sel.id === item.id).length;
                const isSelectedDim = selectedCount >= item.quantity;

                return (
                  <div
                    key={item.id}
                    className={`ingredient-item ${isSelectedDim ? 'selected-dim' : ''}`}
                    onClick={!isSelectedDim ? () => handleIngredientSelect(item) : undefined}
                    title={`${item.name}\nQuality: ${item.quality || 'N/A'}%\nQty: ${item.quantity}`}
                  >
                    <div className="ingredient-image">
                      <div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div>
                    </div>
                    <div className="ingredient-details">
                      <div className="ingredient-name">{item.name}</div>
                      {item.quality && <div className="ingredient-quality">Q: {item.quality}%</div>}
                      <div className="ingredient-quantity">x{item.quantity}</div>
                    </div>
                    <div className="ingredient-category-tag">
                      {item.category}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="no-ingredients">
                {playerInventory.filter(i=>i.type === 'ingredient').length === 0 ? 
                  "Your ingredient shelves are bare..." : 
                  "No ingredients match your search..."}
              </div>
            )}
          </div>
        </div>

        {/* Brewing Workspace */}
        <div className="brewing-workspace">
          <div className="cauldron">
            <div className={`cauldron-content ${brewingAnimation ? 'brewing-animation' : ''}`}>
              {selectedIngredients.length === 0 ? (
                <div className="empty-cauldron">
                  <p>Select ingredients to begin brewing...</p>
                </div>
              ) : (
                <div className="selected-ingredients">
                  {selectedIngredients.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`} // Ensure unique key for identical items
                      className="selected-ingredient"
                      onClick={() => handleRemoveIngredient(item.id)}
                      title={`Remove ${item.name}`}
                    >
                      <div className="ingredient-image">
                        <div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div>
                      </div>
                      <div className="ingredient-name">{item.name}</div>
                      <div className="remove-icon">×</div>
                    </div>
                  ))}
                  {/* Fill remaining slots if less than 2 selected */}
                  {Array.from({ length: 2 - selectedIngredients.length }).map((_, index) => (
                    <div key={`placeholder-${index}`} className="selected-ingredient placeholder"></div>
                  ))}
                </div>
              )}
              {/* Bubbling animation only when ingredients selected */}
              {bubbling && (
                <>
                  <div className="bubble bubble-1"></div>
                  <div className="bubble bubble-2"></div>
                  <div className="bubble bubble-3"></div>
                </>
              )}
            </div>
          </div>
          <div className="brewing-actions">
            <button
              className="action-button brew"
              disabled={selectedIngredients.length !== 2 || brewingAnimation}
              onClick={handleBrew}
            >
              {matchedRecipeInfo ? `Brew ${matchedRecipeInfo.name}` : 'Experiment'}
            </button>
            <button
              className="action-button clear"
              disabled={selectedIngredients.length === 0 || brewingAnimation}
              onClick={handleClearIngredients}
            >
              Clear
            </button>
          </div>
          {/* Brewing Result Area */}
          <div className="brewing-result">
            {matchedRecipeInfo && !brewResult && !brewingAnimation && (
              <div className="recipe-match">
                <h4>Recipe Discovered</h4>
                <div className="recipe-name">{matchedRecipeInfo.name}</div>
                {matchedRecipeInfo.description && (
                  <div className="recipe-description">{matchedRecipeInfo.description}</div>
                )}
                {/* Display ideal phase/spec if data available */}
                {lunarPhase && (
                  <div className="recipe-moon-phase">
                    <LunarPhaseIcon phase={lunarPhase} size={18} />
                    Current Moon: {lunarPhase}
                    {lunarPhase === "Full Moon" && (
                      <span className="ideal-match">Perfect!</span>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Display result messages */}
            {brewResult && (
              <div className={`result-card ${brewResult.success ? 'success' : 'failure'}`}>
                <h4>{brewResult.success ? '✨ Brewing Success!' : '☁ Brewing Failed!'}</h4>
                <p>{brewResult.message}</p>
                {brewResult.success && brewResult.potionName && (
                  <div className="result-details">
                    <div className="result-potion">{brewResult.potionName}</div>
                    {brewResult.quality && (
                      <div className="result-quality">Quality: {brewResult.quality}%</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recipes Panel */}
        <div className="recipes-panel">
          <div className="recipes-header">
            <h3>Known Recipes</h3>
            <select
              value={potionCategoryFilter}
              onChange={(e) => setPotionCategoryFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {getPotionCategories().map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="recipes-list">
            {getFilteredKnownRecipes().length > 0 ? (
              getFilteredKnownRecipes().map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="recipe-item"
                  title={recipe.description || recipe.name}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="recipe-header">
                    <div className="recipe-name">{recipe.name}</div>
                    <div className="recipe-difficulty">
                      {renderDifficultyStars(Math.min(5, Math.max(1, recipe.name.length % 5 + 1)))}
                    </div>
                  </div>
                  {/* Simulated ingredients info */}
                  <div className="recipe-ingredients">
                    Requires: <span className="recipe-ingredient">2 ingredients</span>
                  </div>
                  <div className="recipe-category-tag">
                    {recipe.category}
                  </div>
                  {/* Indicate if current moon phase is ideal (assumes Full Moon is ideal for demo) */}
                  <div className={`recipe-moon-indicator ${lunarPhase === "Full Moon" ? 'ideal' : ''}`}>
                    {lunarPhase === "Full Moon" ? '✨' : '🌙'}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-recipes">
                No known recipes match filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brewing;