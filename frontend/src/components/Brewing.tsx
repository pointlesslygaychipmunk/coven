import React, { useState, useEffect } from 'react';
import './Brewing.css'; // Ensure this uses the new styles
import { InventoryItem, BasicRecipeInfo, AtelierSpecialization, MoonPhase } from 'coven-shared';

// Helper to generate random CSS variables for bubbles
const setBubbleStyle = (/* index: number */): React.CSSProperties => { // Removed unused index parameter
    return {
        '--x-offset': Math.random() * 40 - 20, // Random horizontal offset (-20px to 20px)
        '--size': Math.random() * 5, // Random size addition (0px to 5px)
        '--delay': Math.random() * 3, // Random delay (0s to 3s)
        '--speed': Math.random() * 1.5 // Random speed factor (0 to 1.5)
    } as React.CSSProperties;
};


interface BrewingProps {
  playerInventory: InventoryItem[];
  knownRecipes: BasicRecipeInfo[];
  lunarPhase: MoonPhase;
  playerSpecialization?: AtelierSpecialization;
  onBrew: (ingredientInvItemIds: string[], recipeId?: string) => void;
}

const Brewing: React.FC<BrewingProps> = ({
  playerInventory,
  knownRecipes = [],
  lunarPhase,
  // playerSpecialization, // Keep if needed for future display/logic
  onBrew
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<InventoryItem[]>([]); // Store selected inventory item INSTANCES
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [matchedRecipeInfo, setMatchedRecipeInfo] = useState<BasicRecipeInfo | null>(null);
  const [potionCategoryFilter, setPotionCategoryFilter] = useState<string>('all');
  const [brewResult, setBrewResult] = useState<{ // For displaying temporary feedback if needed (though actual result comes from gameState)
    success: boolean;
    message: string;
    potionName?: string;
    quality?: number;
  } | null>(null);

  // Filter inventory items
  useEffect(() => {
    let filtered = playerInventory.filter(item => item.type === 'ingredient' && item.quantity > 0);

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => item.name.toLowerCase().includes(term));
    }
    setFilteredInventory(filtered.sort((a,b) => a.name.localeCompare(b.name))); // Sort alphabetically
  }, [playerInventory, categoryFilter, searchTerm]);

  // Check for matching known recipe
  useEffect(() => {
      // Only check if exactly 2 ingredients are selected for this basic example
    if (selectedIngredients.length === 2) {
      // const selectedBaseIds = selectedIngredients.map(item => item.baseId); // This variable is not used below, removed.
      // Very basic check: find first known recipe that *could* use these base IDs.
      // TODO: Needs proper recipe ingredient matching!
      const potentialMatch = knownRecipes.find(recipe => {
          // Replace with actual logic, e.g., checking if recipe.ingredients match selectedBaseIds
          return recipe.type === 'potion'; // Placeholder: Match any potion recipe
      });
      setMatchedRecipeInfo(potentialMatch || null);
    } else {
      setMatchedRecipeInfo(null);
    }
  }, [selectedIngredients, knownRecipes]);

  // Handle ingredient selection
  const handleIngredientSelect = (item: InventoryItem) => {
      if (selectedIngredients.length >= 2) return; // Limit to 2 for now

      // Check if player has enough quantity of this specific item *instance*
      const currentlySelectedCount = selectedIngredients.filter(sel => sel.id === item.id).length;
      if (currentlySelectedCount >= item.quantity) {
          console.log("Cannot select more of this item instance.");
          return; // Don't allow selecting more than available quantity
      }

      setSelectedIngredients([...selectedIngredients, item]);
      setBrewResult(null);
  };


  // Remove an ingredient from selection (removes the last added instance of that item ID)
  const handleRemoveIngredient = (itemToRemoveId: string) => {
    const indexToRemove = selectedIngredients.map(i => i.id).lastIndexOf(itemToRemoveId);
    if (indexToRemove !== -1) {
        const newSelection = [...selectedIngredients];
        newSelection.splice(indexToRemove, 1);
        setSelectedIngredients(newSelection);
    }
    setBrewResult(null);
  };

  // Clear all selected ingredients
  const handleClearIngredients = () => {
    setSelectedIngredients([]);
    setMatchedRecipeInfo(null);
    setBrewResult(null);
  };

  // Start brewing process
  const handleBrew = () => {
    if (selectedIngredients.length !== 2) {
      setBrewResult({ success: false, message: "Requires exactly two ingredients." });
      return;
    }

    const ingredientIds = selectedIngredients.map(item => item.id); // Pass the inventory item IDs
    onBrew(ingredientIds, matchedRecipeInfo?.id); // Pass inventory IDs and optional matched recipe ID

    setSelectedIngredients([]);
    setMatchedRecipeInfo(null);
    // Result message will come from game state update via props, clear local temporary message
    setBrewResult(null);
  };

  // --- Filtering/Helper Functions ---
  const getFilteredKnownRecipes = () => {
    let filtered = knownRecipes.filter(r => r.type === 'potion'); // Only show potions
    if (potionCategoryFilter !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === potionCategoryFilter);
    }
    return filtered.sort((a,b) => a.name.localeCompare(b.name));
  };

  const getIngredientCategories = () => {
    const categories = new Set<string>();
    playerInventory.forEach(item => { if (item.type === 'ingredient' && item.category) categories.add(item.category); });
    return Array.from(categories).sort();
  };

  const getPotionCategories = () => {
    const categories = new Set<string>();
    knownRecipes.forEach(recipe => { if (recipe.type === 'potion' && recipe.category) categories.add(recipe.category); });
    return Array.from(categories).sort();
  };

  return (
    <div className="brewing-container">
      <div className="brewing-header">
        <h2>Witch's Cauldron</h2>
        <div className="brewing-phase">
          <div className="phase-label">Moon:</div>
          <div className="phase-value">{lunarPhase}</div>
        </div>
      </div>

      <div className="brewing-content">
        {/* Ingredients Panel */}
        <div className="ingredients-panel">
          <div className="ingredients-header">
            <h3>Ingredients</h3>
            <div className="ingredients-filters">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {getIngredientCategories().map(category => (
                  <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                ))}
              </select>
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="ingredients-grid">
            {filteredInventory.length > 0 ? (
              filteredInventory.map(item => {
                  const selectedCount = selectedIngredients.filter(sel => sel.id === item.id).length;
                  const isSelectedDim = selectedCount >= item.quantity; // Cannot select more

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
                      {/* <div className="ingredient-category-tag">{item.category}</div> */}
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
                <div className="empty-cauldron">Add Ingredients</div>
              ) : (
                <div className="selected-ingredients">
                  {selectedIngredients.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="selected-ingredient"
                      onClick={() => handleRemoveIngredient(item.id)} // Remove last added instance
                       title={`Remove ${item.name}`}
                    >
                      {/* Image removed for cauldron view */}
                      <span className="ingredient-name">{item.name}</span>
                      <span className="remove-icon">×</span>
                    </div>
                  ))}
                   {/* Fill remaining slots visually */}
                   {Array.from({ length: 2 - selectedIngredients.length }).map((_, index) => (
                       <div key={`placeholder-${index}`} className="selected-ingredient placeholder"></div>
                   ))}
                </div>
              )}
              {/* Bubbles rendered based on selected ingredients */}
              {selectedIngredients.length > 0 && Array.from({ length: 5 }).map((_, index) => ( // Example: 5 bubbles
                 <div key={`bubble-${index}`} className="bubble" style={setBubbleStyle(/* index removed */)}></div>
              ))}
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
                     {/* Add more details like ideal phase if available */}
                 </div>
             )}
             {/* Display temporary brew result feedback */}
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
             {!brewResult && !matchedRecipeInfo && selectedIngredients.length > 0 && (
                <div className="no-results">No known recipe match... Experiment?</div>
             )}
          </div>
        </div>

        {/* Recipes Panel */}
        <div className="recipes-panel">
          <div className="recipes-header">
            <h3>Known Recipes</h3>
            <select value={potionCategoryFilter} onChange={(e) => setPotionCategoryFilter(e.target.value)}>
              <option value="all">All Types</option>
              {getPotionCategories().map(category => (
                <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="recipes-list">
            {getFilteredKnownRecipes().length > 0 ? (
              getFilteredKnownRecipes().map(recipe => (
                <div key={recipe.id} className="recipe-item" title={recipe.description || recipe.name}>
                  <div className="recipe-header">
                    <span className="recipe-name">{recipe.name}</span>
                    {/* Difficulty or other tags could go here */}
                  </div>
                  {/* Ingredients could be listed if available in BasicRecipeInfo */}
                  {/* <div className="recipe-ingredients">Requires: ...</div> */}
                  <span className="recipe-category-tag">{recipe.category}</span>
                  {/* Add moon phase indicator if relevant */}
                </div>
              ))
            ) : (
              <div className="no-recipes">No known recipes match.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brewing;