import React, { useState, useEffect } from 'react';
import './Brewing.css';
import { InventoryItem, BasicRecipeInfo, AtelierSpecialization, MoonPhase } from 'coven-shared'; // Use shared types

interface BrewingProps {
  playerInventory: InventoryItem[];
  knownRecipes: BasicRecipeInfo[]; // Use BasicRecipeInfo or Recipe IDs
  lunarPhase: MoonPhase; // Use shared type
  playerSpecialization?: AtelierSpecialization; // Make optional or remove if unused - Kept as optional for potential future use
  onBrew: (ingredientIds: string[], recipeId?: string) => void; // Pass ingredient IDs and optional recipe ID
}

const Brewing: React.FC<BrewingProps> = ({
  playerInventory,
  knownRecipes = [], // Default to empty array
  lunarPhase,
  // playerSpecialization, // Variable is declared but never read - Commented out for now
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
        // Very basic check: Find first known recipe. Requires better logic or backend.
        const potentialMatch = knownRecipes.find((recipeItem) => {
            // Example placeholder logic: assumes first known recipe is the match if ingredients > 0
            // Replace with actual matching logic based on ingredient names/IDs if recipe details are available client-side,
            // or rely solely on backend validation during the brew attempt.
             return true; // Placeholder: Just find the first recipe for UI hint
        });
        setMatchedRecipeInfo(potentialMatch || null);
    } else {
        setMatchedRecipeInfo(null);
    }
}, [selectedIngredients, knownRecipes]); // Update if ingredients or knownRecipes change


  // Handle ingredient selection
  const handleIngredientSelect = (item: InventoryItem) => {
    if (selectedIngredients.length >= 2) { // Limit to 2 ingredients for now
      return;
    }
    if (selectedIngredients.some(ing => ing.id === item.id)) {
      // Allow selecting the same item *stack* again if needed, but not duplicates in the selection array
      // If logic requires strictly unique item stacks, keep the return.
      // For now, let's assume we can add the same stack if needed for a recipe requiring 2x of it.
      // return;
    }
    setSelectedIngredients([...selectedIngredients, item]);
     setBrewResult(null); // Clear previous result when ingredients change
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
};


  // Clear all selected ingredients
  const handleClearIngredients = () => {
    setSelectedIngredients([]);
    setMatchedRecipeInfo(null);
    setBrewResult(null); // Clear previous result
  };

  // Start brewing process - Call the prop function
  const handleBrew = () => {
    if (selectedIngredients.length !== 2) {
      setBrewResult({ success: false, message: "Please select exactly two ingredients." });
      return;
    }

    // Pass inventory item IDs and the matched known recipe ID (if any)
    const ingredientIds: string[] = selectedIngredients.map(item => item.id); // Pass the unique inventory item IDs
    onBrew(ingredientIds, matchedRecipeInfo?.id);

    // Clear selection after initiating brew - result will come from game state update
    setSelectedIngredients([]);
    setMatchedRecipeInfo(null);
    // setBrewResult will be updated when gameState changes via the API call in App.tsx
  };


  // Filter known recipes by category
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

  return (
    <div className="brewing-container">
      <div className="brewing-header">
        <h2>Witch's Cauldron</h2>
        <div className="brewing-phase">
          <div className="phase-label">Current Moon:</div>
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
                  const isSelectedDim = selectedCount >= item.quantity; // Dim if selected count reaches item quantity

                  return (
                    <div
                      key={item.id}
                      className={`ingredient-item ${isSelectedDim ? 'selected-dim' : ''}`}
                      onClick={!isSelectedDim ? () => handleIngredientSelect(item) : undefined} // Disable click if fully selected
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
                )})
            ) : (
              <div className="no-ingredients">
                {playerInventory.filter(i=>i.type === 'ingredient').length === 0 ? "No ingredients in inventory." : "No ingredients match filters."}
              </div>
            )}
          </div>
        </div>

        {/* Brewing Workspace */}
        <div className="brewing-workspace">
          <div className="cauldron">
            <div className="cauldron-content">
              {selectedIngredients.length === 0 ? (
                <div className="empty-cauldron">
                  <p>Select 2 ingredients</p>
                </div>
              ) : (
                <div className="selected-ingredients">
                  {selectedIngredients.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`} // Ensure unique key for identical items
                      className="selected-ingredient"
                      onClick={() => handleRemoveIngredient(item.id)} // Pass item ID to remove last instance
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
              {/* Bubbling animation only when ingredients selected? */}
              {selectedIngredients.length > 0 && <>
                 <div className="bubble bubble-1"></div>
                 <div className="bubble bubble-2"></div>
                 <div className="bubble bubble-3"></div>
              </>}
            </div>
          </div>
          <div className="brewing-actions">
            <button
              className="action-button brew"
              disabled={selectedIngredients.length !== 2}
              onClick={handleBrew}
            >
              {matchedRecipeInfo ? `Brew ${matchedRecipeInfo.name}` : 'Experiment'}
            </button>
            <button
              className="action-button clear"
              disabled={selectedIngredients.length === 0}
              onClick={handleClearIngredients}
            >
              Clear
            </button>
          </div>
          {/* Brewing Result Area */}
          <div className="brewing-result">
             {matchedRecipeInfo && !brewResult && (
                 <div className="recipe-match">
                     <h4>Potential Recipe</h4>
                     <div className="recipe-name">{matchedRecipeInfo.name}</div>
                     {matchedRecipeInfo.description && <div className="recipe-description">{matchedRecipeInfo.description}</div>}
                     {/* Display ideal phase/spec if data available */}
                 </div>
             )}
             {/* TODO: Display actual result messages from GameState update */}
             {brewResult && (
                 <div className={`result-card ${brewResult.success ? 'success' : 'failure'}`}>
                     <h4>{brewResult.success ? 'Brewing Complete!' : 'Brewing Failed!'}</h4>
                     <p>{brewResult.message}</p>
                      {brewResult.success && brewResult.potionName && (
                          <div className="result-details">
                              <div className="result-potion">{brewResult.potionName}</div>
                               {brewResult.quality && <div className="result-quality">Quality: {brewResult.quality}%</div>}
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
              getFilteredKnownRecipes().map(recipe => (
                <div
                  key={recipe.id}
                  className="recipe-item"
                   title={recipe.description || recipe.name}
                >
                  <div className="recipe-header">
                    <div className="recipe-name">{recipe.name}</div>
                     {/* Add difficulty display if needed */}
                  </div>
                  {/* Display ingredients if available */}
                  <div className="recipe-category-tag">
                    {recipe.category}
                  </div>
                   {/* Indicate if current moon phase is ideal (requires more detailed recipe info) */}
                   {/* Example: Add <div className="recipe-moon-indicator ideal">🌙 Ideal Phase!</div> */}
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