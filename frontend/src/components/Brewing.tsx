import React, { useState, useEffect } from 'react';
import './Brewing.css';
import { InventoryItem, BasicRecipeInfo, AtelierSpecialization, MoonPhase } from 'coven-shared'; // Use shared types

interface BrewingProps {
  playerInventory: InventoryItem[];
  knownRecipes: BasicRecipeInfo[]; // Use BasicRecipeInfo or Recipe IDs
  lunarPhase: MoonPhase; // Use shared type
  playerSpecialization: AtelierSpecialization; // Use shared enum/type
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
     // Basic check: only look for recipes when exactly 2 ingredients are selected
    if (selectedIngredients.length === 2) {
        const selectedIds = selectedIngredients.map(ing => ing.id).sort(); // Sort IDs for consistent check

        // This requires more recipe details than BasicRecipeInfo provides.
        // Ideally, the backend confirms the recipe.
        // Placeholder: Find first known recipe that *might* match based on name similarity or category.
        // This is NOT a reliable way to match recipes. Needs backend validation.
        const potentialMatch = knownRecipes.find(recipe => {
            // Very weak matching logic - NEEDS IMPROVEMENT or backend call
            const nameLower = recipe.name.toLowerCase();
            // Check if *both* selected ingredient names are vaguely related to the recipe name
            // This is highly inaccurate, replace with backend check or detailed recipe data access
            return selectedIngredients.every(ing => nameLower.includes(ing.name.toLowerCase().substring(0,4))); // Example weak check
        });

      setMatchedRecipeInfo(potentialMatch || null);
    } else {
      setMatchedRecipeInfo(null);
    }
  }, [selectedIngredients, knownRecipes]); // Include knownRecipes

  // Handle ingredient selection
  const handleIngredientSelect = (item: InventoryItem) => {
    if (selectedIngredients.length >= 2) { // Limit to 2 ingredients for now
      return;
    }
    if (selectedIngredients.some(ing => ing.id === item.id)) {
      return; // Don't add duplicates
    }
    setSelectedIngredients([...selectedIngredients, item]);
     setBrewResult(null); // Clear previous result when ingredients change
  };

  // Remove an ingredient from selection
  const handleRemoveIngredient = (itemId: string) => {
    setSelectedIngredients(selectedIngredients.filter(ing => ing.id !== itemId));
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

    // Pass ingredient IDs and the matched known recipe ID (if any)
    const ingredientIds: string[] = [selectedIngredients[0].id, selectedIngredients[1].id]; // Pass IDs
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
              filteredInventory.map(item => (
                <div
                  key={item.id}
                  className={`ingredient-item ${selectedIngredients.some(ing => ing.id === item.id) ? 'selected' : ''}`}
                  onClick={() => handleIngredientSelect(item)}
                  title={`${item.name}\nQuality: ${item.quality || 'N/A'}%\nQty: ${item.quantity}`}
                >
                  <div className="ingredient-image">
                     {/* Placeholder Image Logic */}
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
              ))
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
                  {selectedIngredients.map(item => (
                    <div
                      key={item.id}
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
              Brew Potion
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
                     {/* Display more recipe details if BasicRecipeInfo includes them */}
                     {matchedRecipeInfo.description && <div className="recipe-description">{matchedRecipeInfo.description}</div>}
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