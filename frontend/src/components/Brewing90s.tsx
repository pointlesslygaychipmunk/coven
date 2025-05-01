import React, { useState, useEffect } from 'react';
import './Brewing90s.css';
import { InventoryItem, BasicRecipeInfo, AtelierSpecialization, MoonPhase, ItemCategory } from 'coven-shared';
import LunarPhaseIcon from './LunarPhaseIcon';
import BrewingPuzzle from './BrewingPuzzle';

interface Brewing90sProps {
  playerInventory: InventoryItem[];
  knownRecipes: BasicRecipeInfo[];
  lunarPhase: MoonPhase;
  playerSpecialization?: AtelierSpecialization;
  onBrew: (ingredientIds: string[], puzzleBonus: number, recipeId?: string) => void;
}

const Brewing90s: React.FC<Brewing90sProps> = ({
  playerInventory,
  knownRecipes = [],
  lunarPhase,
  playerSpecialization,
  onBrew
}) => {
  // State management
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

  // Animation states for DOS aesthetic
  const [animationFrame, setAnimationFrame] = useState<number>(0);

  // Update animation frame for DOS-style animation
  useEffect(() => {
    if (bubbling) {
      const interval = setInterval(() => {
        setAnimationFrame((prev) => (prev + 1) % 4);
      }, 250);
      return () => clearInterval(interval);
    }
  }, [bubbling]);

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
  }, [selectedIngredients, lunarPhase, matchedRecipeInfo]);

  // Helper function to trigger nature whispers
  const triggerNatureWhispers = (harmonyScore: number, categories: string[]) => {
    let spiritType = 'herb'; // Default
    if (categories.some(c => c?.includes('mushroom'))) spiritType = 'mushroom';
    else if (categories.some(c => c?.includes('flower'))) spiritType = 'flower';
    else if (categories.some(c => c?.includes('root'))) spiritType = 'root';
    else if (categories.some(c => c?.includes('crystal'))) spiritType = 'crystal';

    // Properly typed whispers object
    const whispers: Record<string, string[]> = {
      'herb': ["THE LEAVES REMEMBER", "WE GROW STRONGER", "VERDANT PATH WELCOMES", "HANDS SPEAK GROWTH"],
      'mushroom': ["THRIVE IN DARKNESS", "MYCELIUM FEELS", "SECRETS EMERGE", "DECAY AND REBIRTH"],
      'flower': ["CAPTURES BEAUTY", "PETALS DANCE", "SHARE FRAGRANCE", "BLOOMING FADING"],
      'root': ["DEEP WE GROW", "PATIENT STRENGTH", "FOUNDATION OF ALL", "ANCIENT WISDOM"],
      'crystal': ["TIME CRYSTALLIZED", "AMPLIFY ENERGIES", "LIGHT AND STRUCTURE", "EARTH'S FIRE LIVES"]
    };

    const messages = whispers[spiritType] || whispers['herb']; // Fallback to herb whispers
    setWhisperMessage(messages[Math.floor(Math.random() * messages.length)]);
    setWhispersActive(true);

    const numElements = Math.floor(harmonyScore / 20) + 2;
    setSpiritElements(Array.from({ length: numElements }, () => ({
      type: spiritType, 
      x: 50 + (Math.random() * 60 - 30), 
      y: 50 + (Math.random() * 60 - 30),
      rotation: Math.random() * 360, 
      delay: Math.random() * 3
    })));

    setTimeout(() => setWhispersActive(false), 6000);
  };

  // Filter inventory items
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

  // Check for matching known recipe
  useEffect(() => {
    if (selectedIngredients.length === 2) {
      // Find the first KNOWN recipe that matches the current potion category filter
      const potentialMatch = knownRecipes.find(recipe => {
        // Check if recipe category matches the filter (or if filter is 'all')
        const categoryMatches = potionCategoryFilter === 'all' || recipe.category === potionCategoryFilter;
        return categoryMatches; // Placeholder: just checks category for now
      });

      setMatchedRecipeInfo(potentialMatch || null);
      setBubbling(true); // Start bubbling when 2 items are selected
    } else {
      setMatchedRecipeInfo(null);
      setBubbling(selectedIngredients.length > 0); // Bubble if any item is selected
    }
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
      // Consume ingredients on puzzle failure
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

      // Clear selection and animation AFTER backend call
      handleClearIngredients();
      setBrewingAnimation(false);

      // Frontend feedback
      setBrewResult({
        success: true,
        message: `${result.message} THE CAULDRON YIELDS RESULTS!`,
        potionName: matchedRecipeInfo?.name || "EXPERIMENTAL BREW",
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
  const getIngredientCategories = () => Array.from(
    new Set(playerInventory.filter(i => i.type === 'ingredient' && i.category).map(i => i.category!))
  ).sort();
  
  const getPotionCategories = () => Array.from(
    new Set(knownRecipes.map(r => r.category).filter((c): c is ItemCategory => !!c))
  ).sort();

  // Render difficulty stars
  const renderDifficultyStars = (difficulty: number = 1) => '★'.repeat(Math.min(5, difficulty)) + '☆'.repeat(Math.max(0, 5 - difficulty));

  // Get specialization bonus text
  const getSpecializationBonusText = () => {
    if (!playerSpecialization) return "";
    // Example: Check if current recipe benefits from specialization
    if (matchedRecipeInfo?.category === 'serum' && playerSpecialization === 'Essence') {
      return "+15% POTENCY (ESSENCE SPEC.)";
    }
    if (matchedRecipeInfo?.category === 'tonic' && playerSpecialization === 'Infusion') {
      return "+20% EFFECT (INFUSION SPEC.)";
    }
    return ""; // No specific bonus message for this recipe/spec combo
  };

  // Helper function to get spirit shape for whispers animation
  const getSpiritShape = (type: string) => {
    switch(type) {
      case 'herb': return (
        <svg viewBox="0 0 16 16" width="100%" height="100%">
          <path d="M8,1 C10,5 13,6 15,6 C12,7 11,10 11,13 C11,15 9,15 8,15 C7,15 5,15 5,13 C5,10 4,7 1,6 C3,6 6,5 8,1 Z" fill="#7eba76" />
        </svg>
      );
      case 'mushroom': return (
        <svg viewBox="0 0 16 16" width="100%" height="100%">
          <path d="M8,1 C12,1 15,4 15,7 C15,9 14,11 12,12 L11,15 L5,15 L4,12 C2,11 1,9 1,7 C1,4 4,1 8,1 Z" fill="#7b4dab" />
        </svg>
      );
      case 'flower': return (
        <svg viewBox="0 0 16 16" width="100%" height="100%">
          <path d="M8,6 C7,5 7,2 8,1 C9,2 9,5 8,6 Z M11,8 C12,7 15,7 16,8 C15,9 12,9 11,8 Z M8,10 C9,11 9,14 8,15 C7,14 7,11 8,10 Z M5,8 C4,9 1,9 0,8 C1,7 4,7 5,8 Z" fill="#c0a060" />
          <circle cx="8" cy="8" r="2" fill="#fcf3a9" />
        </svg>
      );
      case 'root': return (
        <svg viewBox="0 0 16 16" width="100%" height="100%">
          <path d="M8,1 L8,8 L11,11 L13,10 L14,12 L12,14 M8,8 L5,11 L3,10 L2,12 L4,14 M8,8 L8,15" stroke="#8a7a5a" strokeWidth="1" fill="none" />
        </svg>
      );
      case 'crystal': return (
        <svg viewBox="0 0 16 16" width="100%" height="100%">
          <path d="M8,1 L12,6 L8,15 L4,6 Z M4,6 L12,6" stroke="#6fc0dd" strokeWidth="1" fill="#6fc0dd" fillOpacity="0.6" />
        </svg>
      );
      default: return (
        <svg viewBox="0 0 16 16" width="100%" height="100%">
          <circle cx="8" cy="8" r="5" fill="#7eba76" opacity="0.8" />
        </svg>
      );
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
          </div>
        </div>
      )}

      <div className="brewing-header">
        <h2>WITCH'S CAULDRON</h2>
        <div className="brewing-phase">
          <LunarPhaseIcon phase={lunarPhase} size={20} />
          <div className="phase-value">{lunarPhase.toUpperCase()}</div>
        </div>
        {playerSpecialization && (
          <div className="specialization-bonus" title={`${playerSpecialization} specialty bonus applies`}>
            {playerSpecialization.toUpperCase()}
          </div>
        )}
      </div>

      <div className="brewing-content">
        {/* Ingredients Panel */}
        <div className="ingredients-panel">
          <div className="ingredients-header">
            <h3>INGREDIENTS</h3>
          </div>
          <div className="ingredients-filters">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">ALL CATEGORIES</option>
              {getIngredientCategories().map(category => (
                <option key={category} value={category}>{category.toUpperCase()}</option>
              ))}
            </select>
            <input 
              type="text" 
              placeholder="SEARCH..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                    title={`${item.name}\nQTY: ${item.quantity}\nQUALITY: ${item.quality || 'N/A'}%`}
                  >
                    <div className="ingredient-image">
                      <div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div>
                    </div>
                    <div className="ingredient-details">
                      <div className="ingredient-name">{item.name.toUpperCase()}</div>
                      {item.quality && <div className="ingredient-quality">Q:{item.quality}%</div>}
                      <div className="ingredient-quantity">x{item.quantity}</div>
                    </div>
                    {item.category && (
                      <div className="ingredient-category-tag">{item.category.toUpperCase()}</div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="no-ingredients">NO ITEMS MATCH FILTER</div>
            )}
          </div>
        </div>

        {/* Brewing Workspace */}
        <div className="brewing-workspace">
          <div className="cauldron">
            <div className={`cauldron-content ${brewingAnimation ? 'brewing-animation' : ''} ${natureHarmony > 75 ? 'nature-harmony' : ''}`}>
              {selectedIngredients.length === 0 ? (
                <div className="empty-cauldron">SELECT INGREDIENTS...</div>
              ) : (
                <div className="selected-ingredients">
                  {selectedIngredients.map((item, index) => (
                    <div 
                      key={`${item.id}-${index}`} 
                      className="selected-ingredient" 
                      onClick={() => handleRemoveIngredient(item.id)} 
                      title={`REMOVE ${item.name.toUpperCase()}`}
                    >
                      <div className="ingredient-image">
                        <div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div>
                      </div>
                      <div className="ingredient-name">{item.name.toUpperCase()}</div>
                      <div className="remove-icon">X</div>
                    </div>
                  ))}
                  {Array.from({ length: 2 - selectedIngredients.length }).map((_, index) => (
                    <div key={`placeholder-${index}`} className="selected-ingredient placeholder"></div>
                  ))}
                </div>
              )}
              {bubbling && !brewingAnimation && (
                <>
                  <div className={`bubble bubble-1 ${natureHarmony > 75 ? 'nature-bubble' : ''}`} 
                      style={{transform: `translateY(-${animationFrame * 5}px)`}}></div>
                  <div className={`bubble bubble-2 ${natureHarmony > 75 ? 'nature-bubble' : ''}`}
                      style={{transform: `translateY(-${(animationFrame + 2) % 4 * 5}px)`}}></div>
                  <div className={`bubble bubble-3 ${natureHarmony > 75 ? 'nature-bubble' : ''}`}
                      style={{transform: `translateY(-${(animationFrame + 1) % 4 * 5}px)`}}></div>
                </>
              )}
              {whispersActive && (
                <div className="nature-whispers">
                  <div className="whisper-message">{whisperMessage}</div>
                  {spiritElements.map((spirit, index) => (
                    <div 
                      key={`spirit-${index}`} 
                      className="nature-spirit"
                      style={{ 
                        left: `${spirit.x}%`, 
                        top: `${spirit.y}%`, 
                        transform: `rotate(${spirit.rotation}deg)` 
                      }}
                    >
                      {getSpiritShape(spirit.type)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Brewing Actions */}
          <div className="brewing-actions">
            {selectedIngredients.length === 2 && !brewingAnimation && !brewResult && (
              <button
                className="action-button puzzle-trigger-button"
                onClick={() => setShowPuzzle(true)}
                disabled={showPuzzle}
                title="Align essences for better results"
              >
                STUDY ESSENCES
              </button>
            )}
            {selectedIngredients.length > 0 && !brewingAnimation && (
              <button 
                className="action-button clear" 
                onClick={handleClearIngredients} 
                disabled={brewingAnimation}
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Brewing Result Area */}
          <div className="brewing-result">
            {matchedRecipeInfo && !brewResult && !brewingAnimation && (
              <div className="recipe-match">
                <h4>RECIPE MATCH FOUND</h4>
                <div className="recipe-name">{matchedRecipeInfo.name.toUpperCase()}</div>
                {matchedRecipeInfo.description && (
                  <div className="recipe-description">{matchedRecipeInfo.description.toUpperCase()}</div>
                )}
                {getSpecializationBonusText() && (
                  <div className="recipe-description">{getSpecializationBonusText()}</div>
                )}
                <div className="recipe-moon-phase">
                  <LunarPhaseIcon phase={lunarPhase} size={16} />
                  {/* Example indicator for moon phase benefit */}
                  {lunarPhase === 'Full Moon' && matchedRecipeInfo.category === 'elixir' && (
                    <span style={{color: '#7eba76'}}>IDEAL PHASE</span>
                  )}
                </div>
              </div>
            )}
            {brewResult && (
              <div className={`result-card ${brewResult.success ? 'success' : 'failure'} ${natureHarmony > 75 ? 'harmony-result' : ''}`}>
                <h4>
                  {brewResult.success 
                    ? (natureHarmony > 75 ? '✧ HARMONY! ✧' : '✧ SUCCESS! ✧') 
                    : (natureHarmony > 75 ? '× DISCORD... ×' : '× FAILED! ×')}
                </h4>
                <p>{brewResult.message.toUpperCase()}</p>
                {brewResult.success && brewResult.potionName && (
                  <div className="result-details">
                    <div className="result-potion">{brewResult.potionName.toUpperCase()}</div>
                    {brewResult.quality && (
                      <div className="result-quality">QUALITY: {brewResult.quality}%</div>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Instruction Text when nothing else is shown */}
            {!matchedRecipeInfo && !brewResult && !brewingAnimation && selectedIngredients.length === 2 && (
              <p className="instruction-text">READY TO STUDY ESSENCES!</p>
            )}
            {!matchedRecipeInfo && !brewResult && !brewingAnimation && selectedIngredients.length < 2 && (
              <p className="instruction-text">ADD INGREDIENTS TO CAULDRON...</p>
            )}
          </div>
        </div>

        {/* Recipes Panel */}
        <div className="recipes-panel">
          <div className="recipes-header">
            <h3>KNOWN RECIPES</h3>
            <select 
              value={potionCategoryFilter} 
              onChange={(e) => setPotionCategoryFilter(e.target.value)}
            >
              <option value="all">ALL TYPES</option>
              {getPotionCategories().map(category => (
                <option key={category} value={category}>{category.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="recipes-list">
            {getFilteredKnownRecipes().length > 0 ? (
              getFilteredKnownRecipes().map((recipe) => (
                <div 
                  key={recipe.id} 
                  className={`recipe-item ${natureHarmony > 75 ? 'harmony-recipe' : ''}`} 
                  title={recipe.description || recipe.name}
                >
                  <div className="recipe-header">
                    <div className="recipe-name">{recipe.name.toUpperCase()}</div>
                    <div className="recipe-difficulty">{renderDifficultyStars(3)}</div>
                  </div>
                  <div className="recipe-ingredients">REQ: 2 INGREDIENTS</div>
                  {recipe.category && (
                    <div className="recipe-category-tag">{recipe.category.toUpperCase()}</div>
                  )}
                  {/* Moon phase indicator */}
                  <div className={`recipe-moon-indicator ${lunarPhase === "Full Moon" ? 'ideal' : ''}`}>
                    {lunarPhase === "Full Moon" ? '★' : '☾'}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-recipes">NO KNOWN RECIPES MATCH FILTER</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brewing90s;