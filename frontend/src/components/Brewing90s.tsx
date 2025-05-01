import React, { useState, useEffect } from 'react';
import './Brewing90s.css';
import { InventoryItem } from 'coven-shared';

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  difficulty: string;
  description?: string;
  effect?: string;
}

interface Brewing90sProps {
  playerInventory: InventoryItem[];
  knownRecipes: Recipe[];
  lunarPhase: string;
  playerSpecialization?: string;
  onBrew: (ingredientIds: string[], puzzleBonus: number, recipeId?: string) => void;
}

const Brewing90s: React.FC<Brewing90sProps> = ({
  playerInventory,
  knownRecipes,
  lunarPhase,
  playerSpecialization,
  onBrew
}) => {
  // State for selected ingredients
  const [selectedIngredients, setSelectedIngredients] = useState<InventoryItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // State for cauldron effects
  const [brewingEffect, setBrewingEffect] = useState<boolean>(false);
  const [brewingResult, setBrewingResult] = useState<string | null>(null);
  const [brewingSuccess, setBrewingSuccess] = useState<boolean | null>(null);
  
  // State for potion puzzle
  const [puzzleActive, setPuzzleActive] = useState<boolean>(false);
  const [puzzleBonus, setPuzzleBonus] = useState<number>(0);
  
  // Reset brewing effect when component mounts or unmounts
  useEffect(() => {
    setBrewingEffect(false);
    setBrewingResult(null);
    setBrewingSuccess(null);
    
    return () => {
      setBrewingEffect(false);
    };
  }, []);
  
  // Filter inventory to only show valid brewing ingredients
  const getBrewingIngredients = () => {
    return playerInventory.filter(item => 
      item.type === 'herb' || 
      item.type === 'rare_herb' || 
      item.type === 'reagent' || 
      item.type === 'catalyst'
    );
  };
  
  // Check if a recipe is complete and matched
  const checkRecipeMatch = () => {
    if (selectedIngredients.length === 0) return null;
    
    // Extract names of selected ingredients
    const selectedNames = selectedIngredients.map(ing => ing.name);
    
    // Find a recipe that matches exactly the selected ingredients
    const matchingRecipe = knownRecipes.find(recipe => {
      // Check if the recipe has the same number of ingredients
      if (recipe.ingredients.length !== selectedNames.length) return false;
      
      // Check if all recipe ingredients are in the selected ingredients
      return recipe.ingredients.every(ing => selectedNames.includes(ing));
    });
    
    return matchingRecipe || null;
  };
  
  // Update selected recipe when ingredients change
  useEffect(() => {
    const matchedRecipe = checkRecipeMatch();
    setSelectedRecipe(matchedRecipe);
  }, [selectedIngredients]);
  
  // Handle ingredient selection
  const handleIngredientSelect = (ingredient: InventoryItem) => {
    // Check if ingredient is already selected
    const isSelected = selectedIngredients.some(ing => ing.id === ingredient.id);
    
    if (isSelected) {
      // Remove ingredient if already selected
      setSelectedIngredients(selectedIngredients.filter(ing => ing.id !== ingredient.id));
    } else {
      // Add ingredient if not already selected and not exceeding 3 ingredients
      if (selectedIngredients.length < 3) {
        setSelectedIngredients([...selectedIngredients, ingredient]);
      }
    }
  };
  
  // Handle brewing action
  const handleBrew = () => {
    if (selectedIngredients.length === 0) return;
    
    // Start brewing effect
    setBrewingEffect(true);
    
    // Calculate brewing result (this would be more sophisticated in a real implementation)
    const randomSuccess = Math.random() < 0.7; // 70% success chance for demo
    const resultQuality = Math.floor(Math.random() * 100);
    
    // Apply lunar phase bonus
    let lunarBonus = 0;
    if (lunarPhase === 'Full Moon') lunarBonus = 20;
    else if (lunarPhase === 'New Moon') lunarBonus = -10;
    
    // Apply specialization bonus
    let specBonus = 0;
    if (playerSpecialization === 'Alchemist') specBonus = 15;
    
    // Add puzzle bonus
    const totalBonus = lunarBonus + specBonus + puzzleBonus;
    
    // Simulate brewing process with delay
    setTimeout(() => {
      if (randomSuccess) {
        setBrewingSuccess(true);
        
        if (selectedRecipe) {
          setBrewingResult(`Successfully brewed ${selectedRecipe.name}! (Quality: ${Math.min(100, resultQuality + totalBonus)}%)`);
        } else {
          setBrewingResult(`You created an unknown potion! (Quality: ${Math.min(100, resultQuality + totalBonus)}%)`);
        }
        
        // Call the onBrew callback with ingredient IDs
        onBrew(
          selectedIngredients.map(ing => ing.id), 
          puzzleBonus,
          selectedRecipe?.id
        );
      } else {
        setBrewingSuccess(false);
        setBrewingResult("Your brewing attempt failed... The ingredients bubble away uselessly.");
      }
      
      // Reset after brewing
      setTimeout(() => {
        setBrewingEffect(false);
        setSelectedIngredients([]);
        setPuzzleBonus(0);
      }, 3000);
    }, 2000);
  };
  
  // Start brewing puzzle
  const handleStartPuzzle = () => {
    setPuzzleActive(true);
  };
  
  // Handle puzzle completion
  const handlePuzzleComplete = (bonus: number) => {
    setPuzzleBonus(bonus);
    setPuzzleActive(false);
  };
  
  // Render ingredient list
  const renderIngredientList = () => {
    const ingredients = getBrewingIngredients();
    
    return (
      <div className="ingredients-panel">
        <div className="panel-header">
          <h3>Ingredients</h3>
        </div>
        <div className="ingredients-list">
          {ingredients.length === 0 ? (
            <div className="empty-list">No brewing ingredients in inventory</div>
          ) : (
            ingredients.map(ingredient => (
              <div 
                key={ingredient.id}
                className={`ingredient-item ${selectedIngredients.some(ing => ing.id === ingredient.id) ? 'selected' : ''}`}
                onClick={() => handleIngredientSelect(ingredient)}
              >
                <div className="ingredient-icon">
                  {getIngredientIcon(ingredient.type)}
                </div>
                <div className="ingredient-info">
                  <div className="ingredient-name">{ingredient.name}</div>
                  <div className="ingredient-type">{formatIngredientType(ingredient.type)}</div>
                </div>
                <div className="ingredient-quantity">x{ingredient.quantity}</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };
  
  // Helper to get ingredient icon
  const getIngredientIcon = (type: string) => {
    switch (type) {
      case 'herb': return '🌿';
      case 'rare_herb': return '✨';
      case 'reagent': return '🧪';
      case 'catalyst': return '💎';
      default: return '❓';
    }
  };
  
  // Format ingredient type name
  const formatIngredientType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Render recipe book
  const renderRecipeBook = () => {
    return (
      <div className="recipe-panel">
        <div className="panel-header">
          <h3>Recipe Book</h3>
        </div>
        <div className="recipe-list">
          {knownRecipes.length === 0 ? (
            <div className="empty-list">No recipes discovered yet</div>
          ) : (
            knownRecipes.map(recipe => (
              <div 
                key={recipe.id}
                className={`recipe-item ${selectedRecipe?.id === recipe.id ? 'matched' : ''}`}
              >
                <div className="recipe-name">{recipe.name}</div>
                <div className="recipe-difficulty">{recipe.difficulty}</div>
                <div className="recipe-ingredients">
                  {recipe.ingredients.join(', ')}
                </div>
                {recipe.effect && (
                  <div className="recipe-effect">{recipe.effect}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };
  
  // Render brewing cauldron
  const renderBrewingCauldron = () => {
    return (
      <div className="cauldron-container">
        <div className="cauldron-frame">
          <div className="cauldron-selection">
            <h3>Selected Ingredients</h3>
            <div className="selected-ingredients">
              {[0, 1, 2].map(slot => {
                const ingredient = selectedIngredients[slot];
                return (
                  <div 
                    key={slot} 
                    className={`ingredient-slot ${ingredient ? 'filled' : ''}`}
                    onClick={() => ingredient && handleIngredientSelect(ingredient)}
                  >
                    {ingredient ? (
                      <>
                        <div className="slot-icon">{getIngredientIcon(ingredient.type)}</div>
                        <div className="slot-name">{ingredient.name}</div>
                      </>
                    ) : (
                      <div className="slot-empty">Empty</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="cauldron-main">
            <div className={`cauldron ${brewingEffect ? 'brewing' : ''} ${brewingSuccess === true ? 'success' : ''} ${brewingSuccess === false ? 'failed' : ''}`}>
              <div className="cauldron-liquid"></div>
              <div className="cauldron-bubble bubble1"></div>
              <div className="cauldron-bubble bubble2"></div>
              <div className="cauldron-bubble bubble3"></div>
            </div>
            
            <div className="brewing-controls">
              <button 
                className="brewing-button brew" 
                onClick={handleBrew}
                disabled={selectedIngredients.length === 0 || brewingEffect}
              >
                Brew Potion
              </button>
              
              <button 
                className="brewing-button puzzle" 
                onClick={handleStartPuzzle}
                disabled={puzzleActive || brewingEffect}
              >
                Focus Energy {puzzleBonus > 0 ? `(+${puzzleBonus}%)` : ''}
              </button>
            </div>
          </div>
          
          <div className="brewing-info">
            <div className="lunar-bonus">
              <div className="info-label">Lunar Phase:</div>
              <div className="info-value">{lunarPhase}</div>
            </div>
            
            {playerSpecialization && (
              <div className="spec-bonus">
                <div className="info-label">Specialization:</div>
                <div className="info-value">{playerSpecialization}</div>
              </div>
            )}
            
            {selectedRecipe && (
              <div className="matched-recipe">
                <div className="info-label">Matched Recipe:</div>
                <div className="info-value">{selectedRecipe.name}</div>
              </div>
            )}
            
            {!selectedRecipe && selectedIngredients.length > 0 && (
              <div className="no-match">
                <div className="info-value">No matching recipe found</div>
              </div>
            )}
          </div>
        </div>
        
        {brewingResult && (
          <div className="brewing-result">
            {brewingResult}
          </div>
        )}
      </div>
    );
  };
  
  // Simplified brewing puzzle component (placeholder)
  const renderBrewingPuzzle = () => {
    if (!puzzleActive) return null;
    
    return (
      <div className="brewing-puzzle-overlay">
        <div className="brewing-puzzle">
          <h3>Focus Energy Puzzle</h3>
          <p>Click the runes in the correct order to enhance your brewing!</p>
          
          <div className="puzzle-runes">
            {Array.from({ length: 5 }).map((_, index) => (
              <div 
                key={index}
                className="puzzle-rune"
                onClick={() => {
                  // Very simple puzzle for demo - clicking any rune gives a random bonus
                  const bonus = Math.floor(Math.random() * 15) + 5; // 5-20% bonus
                  handlePuzzleComplete(bonus);
                }}
              >
                {getRuneSymbol(index)}
              </div>
            ))}
          </div>
          
          <button 
            className="puzzle-cancel"
            onClick={() => setPuzzleActive(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };
  
  // Helper to get rune symbols
  const getRuneSymbol = (index: number) => {
    const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ'];
    return runes[index % runes.length];
  };
  
  return (
    <div className="brewing90s-container">
      <div className="brewing-header">
        <h2>Brewing Chamber</h2>
        <div className="brewing-wisdom">
          "The perfect potion requires both precision and intuition."
        </div>
      </div>
      
      <div className="brewing-main">
        <div className="brewing-left-panel">
          {renderIngredientList()}
        </div>
        
        <div className="brewing-center-panel">
          {renderBrewingCauldron()}
        </div>
        
        <div className="brewing-right-panel">
          {renderRecipeBook()}
        </div>
      </div>
      
      {renderBrewingPuzzle()}
      
      {/* Decorative corners */}
      <div className="corner-decoration top-left"></div>
      <div className="corner-decoration top-right"></div>
      <div className="corner-decoration bottom-left"></div>
      <div className="corner-decoration bottom-right"></div>
    </div>
  );
};

export default Brewing90s;