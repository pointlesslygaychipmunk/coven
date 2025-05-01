import React, { useState, useEffect } from 'react';
import './Brewing.css';
// FIXED: Import ItemCategory
import { InventoryItem, BasicRecipeInfo, AtelierSpecialization, MoonPhase, ItemCategory } from 'coven-shared';
import LunarPhaseIcon from './LunarPhaseIcon';
import BrewingPuzzle from './BrewingPuzzle';

interface BrewingProps {
  playerInventory: InventoryItem[];
  knownRecipes: BasicRecipeInfo[];
  lunarPhase: MoonPhase;
  playerSpecialization?: AtelierSpecialization;
  onBrew: (ingredientIds: string[], puzzleBonus: number, recipeId?: string) => void;
}

const Brewing: React.FC<BrewingProps> = ({
  playerInventory,
  knownRecipes = [],
  lunarPhase,
  playerSpecialization,
  onBrew
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [matchedRecipeInfo, setMatchedRecipeInfo] = useState<BasicRecipeInfo | null>(null);
  const [potionCategoryFilter, setPotionCategoryFilter] = useState<string>('all');
  const [brewResult, setBrewResult] = useState<{
    success: boolean;
    message: string;
    potionName?: string;
    quality?: number;
  } | null>(null);
  const [bubbling, setBubbling] = useState<boolean>(false);
  const [brewingAnimation, setBrewingAnimation] = useState<boolean>(false);
  const [showPuzzle, setShowPuzzle] = useState<boolean>(false);

  // Easter Egg: Whispers of Nature
  const [natureHarmony, setNatureHarmony] = useState<number>(0);
  const [whispersActive, setWhispersActive] = useState<boolean>(false);
  const [whisperMessage, setWhisperMessage] = useState<string>('');
  const [spiritElements, setSpiritElements] = useState<Array<{type: string, x: number, y: number, rotation: number, delay: number}>>([]);

  // Easter Egg: Track harmony with nature
  useEffect(() => {
    if (selectedIngredients.length === 2) {
      const categories = selectedIngredients.map(item => item.category || '');
      const moonPhaseFavorites: Record<string, string[]> = {
        'Full Moon': ['flower', 'luminous', 'crystal'], 'New Moon': ['root', 'shadow', 'soil'],
        'Waxing Crescent': ['seed', 'growth', 'leaf'], 'Waxing Gibbous': ['fruit', 'nectar', 'sap'],
        'Waning Gibbous': ['berry', 'essence', 'dew'], 'Waning Crescent': ['mushroom', 'fungus', 'decay']
      };
      const favoredCategories = moonPhaseFavorites[lunarPhase] || [];
      const moonAlignedCount = categories.filter(cat => favoredCategories.some(favored => cat.includes(favored))).length;
      // Calculate harmony based on moon alignment and if a known recipe is potentially matched
      const harmonyScore = Math.min(100, Math.round((moonAlignedCount / 2) * 70) + (matchedRecipeInfo ? 20 : 0) + Math.round(Math.random() * 10));
      setNatureHarmony(harmonyScore);

      // Trigger whispers based on harmony
      if (harmonyScore > 60 && Math.random() < (harmonyScore / 100) * 0.8) {
        triggerNatureWhispers(harmonyScore, categories);
      } else {
        setWhispersActive(false); // Ensure whispers are off if conditions not met
      }
    } else {
      // Reset harmony and whispers if selection changes from 2 items
      setNatureHarmony(0);
      setWhispersActive(false);
    }
    // Dependencies for the effect
  }, [selectedIngredients, lunarPhase, matchedRecipeInfo]);

  // Helper function to trigger nature whispers
  const triggerNatureWhispers = (harmonyScore: number, categories: string[]) => {
    let spiritType = 'herb'; // Default
    if (categories.some(c => c.includes('mushroom'))) spiritType = 'mushroom';
    else if (categories.some(c => c.includes('flower'))) spiritType = 'flower';
    else if (categories.some(c => c.includes('root'))) spiritType = 'root';
    else if (categories.some(c => c.includes('crystal'))) spiritType = 'crystal';

    // FIX: Correctly type the whispers object to allow string index signature
    const whispers: Record<string, string[]> = {
      'herb': ["The leaves remember...", "We grow stronger...", "Verdant path welcomes...", "Hands speak growth..."],
      'mushroom': ["Thrive in darkness...", "Mycelium feels...", "Secrets emerge...", "Decay and rebirth..."],
      'flower': ["Captures beauty...", "Petals dance...", "Share fragrance...", "Blooming, fading..."],
      'root': ["Deep we grow...", "Patient strength...", "Foundation of all...", "Ancient wisdom..."],
      'crystal': ["Time crystallized...", "Amplify energies...", "Light and structure...", "Earth's fire lives..."]
    };

    const messages = whispers[spiritType] || whispers['herb']; // Fallback to herb whispers
    setWhisperMessage(messages[Math.floor(Math.random() * messages.length)]);
    setWhispersActive(true);

    const numElements = Math.floor(harmonyScore / 20) + 3;
    setSpiritElements(Array.from({ length: numElements }, () => ({
      type: spiritType, x: 50 + (Math.random() * 60 - 30), y: 50 + (Math.random() * 60 - 30),
      rotation: Math.random() * 360, delay: Math.random() * 3
    })));

    setTimeout(() => setWhispersActive(false), 6000 + (harmonyScore * 30)); // Duration based on harmony
    console.log(`🌿✨ Nature Whispers: ${spiritType} spirits awakened! Harmony: ${harmonyScore} ✨🌿`);
  };


  // Filter inventory items
  useEffect(() => {
    let filtered = playerInventory.filter(item => item.type === 'ingredient' && item.quantity > 0);
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => item.name.toLowerCase().includes(term) || (item.description && item.description.toLowerCase().includes(term)));
    }
    setFilteredInventory(filtered);
  }, [playerInventory, categoryFilter, searchTerm]);

  // Check for matching known recipe
  useEffect(() => {
    if (selectedIngredients.length === 2) {
      // REMOVED: Unused selectedNames variable
      // const selectedNames = selectedIngredients.map(i => i.name).sort();

      // Find the first KNOWN recipe that matches the current potion category filter
      // NOTE: This is a placeholder. Real matching requires comparing the *actual*
      // ingredients in the recipe definition (which isn't available here)
      // with the selectedIngredients.
      const potentialMatch = knownRecipes.find(recipe => {
        // Check if recipe category matches the filter (or if filter is 'all')
        const categoryMatches = potionCategoryFilter === 'all' || recipe.category === potionCategoryFilter;
        // TODO: Implement actual ingredient matching logic here when recipe definitions are richer
        // Example placeholder: return categoryMatches && checkIngredientsMatch(recipe, selectedIngredients);
        return categoryMatches; // Placeholder: just checks category for now
      });

      setMatchedRecipeInfo(potentialMatch || null);
      setBubbling(true); // Start bubbling when 2 items are selected
    } else {
      setMatchedRecipeInfo(null);
      setBubbling(selectedIngredients.length > 0); // Bubble if any item is selected
    }
    // ADDED: Missing dependency
  }, [selectedIngredients, knownRecipes, potionCategoryFilter]);

  // Handle ingredient selection
  const handleIngredientSelect = (item: InventoryItem) => {
    if (selectedIngredients.length >= 2) return; // Limit to 2 ingredients
    if (!canSelectItem(item)) return;
    setSelectedIngredients([...selectedIngredients, item]);
    setBrewResult(null); // Clear previous result
  };

  // Check if an item can be selected
  const canSelectItem = (item: InventoryItem): boolean => {
    const selectedCount = selectedIngredients.filter(sel => sel.id === item.id).length;
    return item.quantity > selectedCount;
  };

  // Remove an ingredient
  const handleRemoveIngredient = (itemId: string) => {
    const indexToRemove = selectedIngredients.map(i => i.id).lastIndexOf(itemId);
    if (indexToRemove !== -1) {
      setSelectedIngredients(prev => prev.filter((_, index) => index !== indexToRemove));
    }
    setBrewResult(null); // Clear result on removal
  };

  // Clear ingredients
  const handleClearIngredients = () => {
    setSelectedIngredients([]);
    setMatchedRecipeInfo(null);
    setBrewResult(null); // Clear result
  };

  // Handle puzzle completion - triggers the actual brew
  const handlePuzzleComplete = (result: { success: boolean; bonus: number; message: string }) => {
    setShowPuzzle(false); // Hide the puzzle

    if (!result.success) {
      setBrewResult({ success: false, message: result.message });
      // Consume ingredients on puzzle failure - debatable, but let's keep it simple
       const ingredientIds = selectedIngredients.map(item => item.id);
       onBrew(ingredientIds, 0, matchedRecipeInfo?.id); // Call brew with 0 bonus but consume items
      handleClearIngredients(); // Clear selection
      return;
    }

    // Puzzle succeeded, proceed to brew with the bonus
    const ingredientIds: string[] = selectedIngredients.map(item => item.id);
    const puzzleBonus = result.bonus;

    setBrewingAnimation(true); // Start cauldron animation

    setTimeout(() => {
      // Call the backend brew function with the bonus
      onBrew(ingredientIds, puzzleBonus, matchedRecipeInfo?.id);

      // Clear selection and animation AFTER backend call simulation
      handleClearIngredients();
      setBrewingAnimation(false);

      // Frontend feedback (Backend will ultimately set the real game state)
      // We show the puzzle success message PLUS a brewing message
      setBrewResult({
        success: true,
        message: `${result.message} The cauldron simmers with potential...`,
        potionName: matchedRecipeInfo?.name || "Experimental Brew",
        quality: 70 + puzzleBonus // Example quality calculation
      });


    }, 1200); // Cauldron animation duration
  };

  // Get filtered known recipes
  const getFilteredKnownRecipes = () => {
    let filtered = knownRecipes;
    if (potionCategoryFilter !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === potionCategoryFilter);
    }
    return filtered;
  };

  // Get unique categories
  const getIngredientCategories = () => Array.from(new Set(playerInventory.filter(i => i.type === 'ingredient' && i.category).map(i => i.category!))).sort();
  // FIXED: Ensure category is not undefined before adding to set
  const getPotionCategories = () => Array.from(new Set(knownRecipes.map(r => r.category).filter((c): c is ItemCategory => !!c))).sort();

  // Render difficulty stars
  const renderDifficultyStars = (difficulty: number = 1) => '★'.repeat(Math.min(5, difficulty)) + '☆'.repeat(Math.max(0, 5 - difficulty));

   // Get specialization bonus (example usage, not directly modifying outcome here)
   const getSpecializationBonusText = () => {
     if (!playerSpecialization) return "";
     // Example: Check if current recipe benefits from specialization
     if (matchedRecipeInfo?.category === 'serum' && playerSpecialization === 'Essence') {
         return "+15% Potency (Essence Spec.)";
     }
     if (matchedRecipeInfo?.category === 'tonic' && playerSpecialization === 'Infusion') {
        return "+20% Effectiveness (Infusion Spec.)";
    }
     return ""; // No specific bonus message for this recipe/spec combo
   };


  // Helper function to get spirit shape for whispers animation
  const getSpiritShape = (type: string) => {
    // (Same SVG rendering logic as before)
        switch(type) {
            case 'herb': return (<svg viewBox="0 0 20 20" width="100%" height="100%"><path d="M10,1 C12,5 15,6 19,6 C15,8 13,10 13,14 C13,17 11,19 10,19 C9,19 7,17 7,14 C7,10 5,8 1,6 C5,6 8,5 10,1 Z" fill="#adffb0" fillOpacity="0.8" /></svg>);
            case 'mushroom': return (<svg viewBox="0 0 20 20" width="100%" height="100%"><path d="M10,1 C14,1 18,4 18,8 C18,11 16,12 14,13 L13,19 L7,19 L6,13 C4,12 2,11 2,8 C2,4 6,1 10,1 Z" fill="#eaccff" fillOpacity="0.8" /></svg>);
            case 'flower': return (<svg viewBox="0 0 20 20" width="100%" height="100%"><path d="M10,7 C8,5 8,2 10,1 C12,2 12,5 10,7 Z M13,10 C15,8 18,8 19,10 C18,12 15,12 13,10 Z M10,13 C12,15 12,18 10,19 C8,18 8,15 10,13 Z M7,10 C5,12 2,12 1,10 C2,8 5,8 7,10 Z" fill="#ffbae8" fillOpacity="0.8" /><circle cx="10" cy="10" r="2" fill="#ffffa0" /></svg>);
            case 'root': return (<svg viewBox="0 0 20 20" width="100%" height="100%"><path d="M10,1 L10,10 L13,13 L16,11 L17,14 L15,16 M10,10 L7,13 L4,11 L3,14 L5,16 M10,10 L10,19" stroke="#c17c50" strokeWidth="2" fill="none" /></svg>);
            case 'crystal': return (<svg viewBox="0 0 20 20" width="100%" height="100%"><path d="M10,1 L14,8 L10,19 L6,8 Z M6,8 L14,8" stroke="#a8e6ff" strokeWidth="1" fill="#e2f8ff" fillOpacity="0.8" /></svg>);
            default: return (<svg viewBox="0 0 20 20" width="100%" height="100%"><circle cx="10" cy="10" r="5" fill="#ffffff" fillOpacity="0.8" /></svg>);
        }
  };

  return (
    <div className="brewing-container">
       {showPuzzle && (
         <div className="puzzle-overlay">
           <div className="puzzle-container">
             <BrewingPuzzle
               onComplete={handlePuzzleComplete}
               currentLunarPhase={lunarPhase}
             />
             {/* Removed close button - completion/skip handles closing */}
             {/* <button className="close-puzzle-button" onClick={() => setShowPuzzle(false)}>×</button> */}
           </div>
         </div>
       )}

      <div className="brewing-header">
        <h2>Witch's Cauldron</h2>
        <div className="brewing-phase">
          <LunarPhaseIcon phase={lunarPhase} size={28} />
          <div className="phase-value">{lunarPhase}</div>
        </div>
        {playerSpecialization && (
          <div className="specialization-bonus" title={`${playerSpecialization} specialty bonus applies`}>
            Specialty: {playerSpecialization}
          </div>
        )}
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
                const isSelectedDim = selectedCount >= item.quantity;
                return (
                  <div
                    key={item.id}
                    className={`ingredient-item ${isSelectedDim ? 'selected-dim' : ''}`}
                    onClick={!isSelectedDim ? () => handleIngredientSelect(item) : undefined}
                    title={`${item.name}\nQty: ${item.quantity}\nQuality: ${item.quality || 'N/A'}%`}
                  >
                    <div className="ingredient-image"><div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div></div>
                    <div className="ingredient-details">
                      <div className="ingredient-name">{item.name}</div>
                      {item.quality && <div className="ingredient-quality">Q:{item.quality}%</div>}
                      <div className="ingredient-quantity">x{item.quantity}</div>
                    </div>
                    {item.category && <div className="ingredient-category-tag">{item.category}</div>}
                  </div>
                );
              })
            ) : (
              <div className="no-ingredients">No ingredients match filter.</div>
            )}
          </div>
        </div>

        {/* Brewing Workspace */}
        <div className="brewing-workspace">
          <div className="cauldron">
            <div className={`cauldron-content ${brewingAnimation ? 'brewing-animation' : ''} ${natureHarmony > 75 ? 'nature-harmony' : ''}`}>
              {selectedIngredients.length === 0 ? (
                <div className="empty-cauldron">Select 2 ingredients...</div>
              ) : (
                <div className="selected-ingredients">
                  {selectedIngredients.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="selected-ingredient" onClick={() => handleRemoveIngredient(item.id)} title={`Remove ${item.name}`}>
                       <div className="ingredient-image"><div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div></div>
                       <div className="ingredient-name">{item.name}</div>
                       <div className="remove-icon">×</div>
                    </div>
                  ))}
                  {Array.from({ length: 2 - selectedIngredients.length }).map((_, index) => (
                    <div key={`placeholder-${index}`} className="selected-ingredient placeholder"></div>
                  ))}
                </div>
              )}
              {bubbling && !brewingAnimation && (
                <>
                  <div className={`bubble bubble-1 ${natureHarmony > 75 ? 'nature-bubble' : ''}`}></div>
                  <div className={`bubble bubble-2 ${natureHarmony > 75 ? 'nature-bubble' : ''}`}></div>
                  <div className={`bubble bubble-3 ${natureHarmony > 75 ? 'nature-bubble' : ''}`}></div>
                </>
              )}
              {whispersActive && (
                <div className="nature-whispers">
                  <div className="whisper-message">{whisperMessage}</div>
                  {spiritElements.map((spirit, index) => (
                    <div key={`spirit-${index}`} className="nature-spirit" style={{ left: `${spirit.x}%`, top: `${spirit.y}%`, transform: `rotate(${spirit.rotation}deg) scale(${0.8 + (natureHarmony / 100) * 0.4})`, animationDelay: `${spirit.delay}s` }}>
                      {getSpiritShape(spirit.type)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

           {/* Puzzle Trigger & Brewing Actions */}
           <div className="brewing-actions">
             {/* Show "Study" button only when 2 ingredients are selected */}
             {selectedIngredients.length === 2 && !brewingAnimation && !brewResult && (
                 <button
                     className="action-button puzzle-trigger-button"
                     onClick={() => setShowPuzzle(true)}
                     disabled={showPuzzle} // Disable if puzzle already open
                     title="Align essences for better results"
                 >
                     Study Essences (Puzzle)
                 </button>
             )}
              {/* Show "Clear" button when ingredients are selected */}
             {selectedIngredients.length > 0 && !brewingAnimation && (
               <button className="action-button clear" onClick={handleClearIngredients} disabled={brewingAnimation}>
                 Clear
               </button>
             )}
          </div>


          {/* Brewing Result Area */}
          <div className="brewing-result">
            {matchedRecipeInfo && !brewResult && !brewingAnimation && (
              <div className="recipe-match">
                <h4>Recipe Match Found</h4>
                <div className="recipe-name">{matchedRecipeInfo.name}</div>
                {matchedRecipeInfo.description && <div className="recipe-description">{matchedRecipeInfo.description}</div>}
                 {getSpecializationBonusText() && <div className="recipe-description">{getSpecializationBonusText()}</div>}
                <div className="recipe-moon-phase">
                    <LunarPhaseIcon phase={lunarPhase} size={18} />
                    {/* Indicate if current phase is ideal - Placeholder */}
                    {/* {matchedRecipeInfo.idealMoonPhase === lunarPhase && <span className="ideal-match">Ideal!</span>} */}
                 </div>
              </div>
            )}
            {brewResult && (
              <div className={`result-card ${brewResult.success ? 'success' : 'failure'} ${natureHarmony > 75 ? 'harmony-result' : ''}`}>
                <h4>{brewResult.success ? (natureHarmony > 75 ? '✨ Harmony!' : '✨ Success!') : (natureHarmony > 75 ? '🍃 Discord...' : '☁ Failed!')}</h4>
                <p>{brewResult.message}</p>
                {brewResult.success && brewResult.potionName && (
                  <div className="result-details">
                    <div className="result-potion">{brewResult.potionName}</div>
                    {brewResult.quality && <div className="result-quality">Quality: {brewResult.quality}%</div>}
                  </div>
                )}
              </div>
            )}
             {/* Instruction Text when nothing else is shown */}
             {!matchedRecipeInfo && !brewResult && !brewingAnimation && selectedIngredients.length === 2 && (
                 <p className="instruction-text">Ready to Study Essences or Experiment!</p>
             )}
             {!matchedRecipeInfo && !brewResult && !brewingAnimation && selectedIngredients.length < 2 && (
                 <p className="instruction-text">Add ingredients to the cauldron...</p>
             )}

          </div>
        </div>

        {/* Recipes Panel */}
        <div className="recipes-panel">
          <div className="recipes-header">
            <h3>Known Potion Recipes</h3>
            <select value={potionCategoryFilter} onChange={(e) => setPotionCategoryFilter(e.target.value)}>
              <option value="all">All Types</option>
              {getPotionCategories().map(category => (
                <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="recipes-list">
            {getFilteredKnownRecipes().length > 0 ? (
              getFilteredKnownRecipes().map((recipe, index) => (
                <div key={recipe.id} className={`recipe-item ${natureHarmony > 75 ? 'harmony-recipe' : ''}`} title={recipe.description || recipe.name} style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="recipe-header">
                    <div className="recipe-name">{recipe.name}</div>
                    {/* Assume difficulty comes from recipe data if available */}
                    <div className="recipe-difficulty">{renderDifficultyStars(/* recipe.difficulty */ 3)}</div>
                  </div>
                  <div className="recipe-ingredients">Req: 2 ingredients</div> {/* Placeholder */}
                  {recipe.category && <div className="recipe-category-tag">{recipe.category}</div>}
                   {/* Placeholder for ideal phase indicator */}
                   <div className={`recipe-moon-indicator ${lunarPhase === "Full Moon" ? 'ideal' : ''}`}>🌙</div>
                </div>
              ))
            ) : (
              <div className="no-recipes">No known recipes match filter.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brewing;