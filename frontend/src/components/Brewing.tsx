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
  
  // Easter Egg: Whispers of Nature
  const [natureHarmony, setNatureHarmony] = useState<number>(0);
  const [whispersActive, setWhispersActive] = useState<boolean>(false);
  const [whisperMessage, setWhisperMessage] = useState<string>('');
  const [spiritElements, setSpiritElements] = useState<Array<{type: string, x: number, y: number, rotation: number, delay: number}>>([]);

  // Easter Egg: Track harmony with nature based on brewing practices
  useEffect(() => {
    if (selectedIngredients.length === 2) {
      // Get category types of selected ingredients
      const categories = selectedIngredients.map(item => item.category || '');
      
      // Check if ingredients are complementary to current moon phase
      const moonPhaseFavorites: Record<string, string[]> = {
        'Full Moon': ['flower', 'luminous', 'crystal'],
        'New Moon': ['root', 'shadow', 'soil'],
        'Waxing Crescent': ['seed', 'growth', 'leaf'],
        'Waxing Gibbous': ['fruit', 'nectar', 'sap'],
        'Waning Gibbous': ['berry', 'essence', 'dew'],
        'Waning Crescent': ['mushroom', 'fungus', 'decay']
      };
      
      // The current moon's favored ingredients
      const favoredCategories = moonPhaseFavorites[lunarPhase] || [];
      
      // Count matching categories
      const moonAlignedCount = categories.filter(cat => 
        favoredCategories.some(favored => cat.includes(favored))
      ).length;
      
      // Calculate harmony score (0-100)
      const harmonyScore = Math.min(100, 
        Math.round((moonAlignedCount / 2) * 70) + 
        (matchedRecipeInfo ? 20 : 0) + 
        Math.round(Math.random() * 10)
      );
      
      setNatureHarmony(harmonyScore);
      
      // Chance to trigger whispers when harmony is high
      if (harmonyScore > 60 && Math.random() < (harmonyScore / 100) * 0.8) {
        triggerNatureWhispers(harmonyScore, categories);
      } else {
        setWhispersActive(false);
      }
    } else {
      setWhispersActive(false);
    }
    
    // Return cleanup function
    return () => {};
  }, [selectedIngredients, lunarPhase, matchedRecipeInfo, setNatureHarmony, setWhispersActive]);

  // Helper function to trigger nature whispers
  const triggerNatureWhispers = (harmonyScore: number, categories: string[]) => {
    // Determine spirit type based on ingredients
    let spiritType = 'herb';
    
    if (categories.some(c => c.includes('mushroom') || c.includes('fungus'))) {
      spiritType = 'mushroom';
    } else if (categories.some(c => c.includes('flower') || c.includes('petal'))) {
      spiritType = 'flower';
    } else if (categories.some(c => c.includes('root') || c.includes('soil'))) {
      spiritType = 'root';
    } else if (categories.some(c => c.includes('crystal') || c.includes('gem'))) {
      spiritType = 'crystal';
    }
    
    // Generate whisper messages based on spirit type
    const whispers = {
      'herb': [
        "The leaves remember your gentle touch...",
        "We grow stronger with your care...",
        "The verdant path welcomes you...",
        "Your hands speak the language of growth..."
      ],
      'mushroom': [
        "We thrive in darkness and patience...",
        "The mycelium network feels your presence...",
        "Secrets buried beneath will soon emerge...",
        "Cycles of decay and rebirth continue..."
      ],
      'flower': [
        "Your brew captures our ephemeral beauty...",
        "The petals dance with joy in your mixture...",
        "We share our fragrance with those who respect us...",
        "Blooming and fading, the cycle continues..."
      ],
      'root': [
        "Deep we grow, connected to earth's heart...",
        "Patient strength, drawing from hidden sources...",
        "The foundation of all that rises above...",
        "Ancient wisdom flows through our veins..."
      ],
      'crystal': [
        "Time crystallized into perfect geometries...",
        "We amplify the energies you channel...",
        "Light and structure in harmonious balance...",
        "The memory of earth's fire lives within us..."
      ]
    };
    
    // Select a random whisper message
    const messages = whispers[spiritType as keyof typeof whispers];
    const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
    
    setWhisperMessage(selectedMessage);
    setWhispersActive(true);
    
    // Create animated spirit elements
    const numElements = Math.floor(harmonyScore / 20) + 3;
    const elements = Array.from({ length: numElements }, () => ({
      type: spiritType,
      x: 50 + (Math.random() * 60 - 30),
      y: 50 + (Math.random() * 60 - 30),
      rotation: Math.random() * 360,
      delay: Math.random() * 3
    }));
    
    setSpiritElements(elements);
    
    // Automatically hide after some time
    setTimeout(() => {
      setWhispersActive(false);
    }, 6000 + (harmonyScore * 30));
    
    console.log(`🌿✨ Nature Whispers: ${spiritType} spirits have been awakened! ✨🌿`);
  };

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

      // In harmony with nature, modify properties for subtle effects
      if (natureHarmony > 75) {
        onBrew(ingredientIds, matchedRecipeInfo?.id);
        
        // Show special effect for high harmony
        setBrewResult({
          success: Math.random() > 0.05, // 95% success rate in harmony mode 
          message: "The brew resonates with the whispers of nature spirits!",
          potionName: `Harmonious ${matchedRecipeInfo?.name || "Essence"}`,
          quality: Math.min(100, Math.floor(70 + (natureHarmony / 5) + Math.random() * 10)) // Higher quality with harmony
        });
      } else {
        onBrew(ingredientIds, matchedRecipeInfo?.id);
        
        // Simulate a brew result (in real implementation, this would come from game state)
        setBrewResult({
          success: Math.random() > 0.3, // 70% success rate for normal mode
          message: Math.random() > 0.3 ? 
            "Your concoction bubbles with magical energy!" : 
            "The mixture hisses and turns a murky color...",
          potionName: matchedRecipeInfo?.name || "Mysterious Potion",
          quality: Math.floor(60 + Math.random() * 40)
        });
      }
      
      // Clear selection after initiating brew
      setSelectedIngredients([]);
      setMatchedRecipeInfo(null);
      setBrewingAnimation(false);
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

  // Using playerSpecialization to fix the TS6133 error
  const getSpecializationBonus = () => {
    if (!playerSpecialization) return 0;
    
    // Different specializations provide different brewing bonuses
    const bonuses: Record<string, number> = {
      'Herbalist': 15,
      'Alchemist': 20,
      'Enchanter': 10,
      'Diviner': 5
    };
    
    return bonuses[playerSpecialization] || 0;
  };

  // Helper function to get spirit shape for whispers animation
  const getSpiritShape = (type: string) => {
    switch(type) {
      case 'herb':
        return (
          <svg viewBox="0 0 20 20" width="100%" height="100%">
            <path d="M10,1 C12,5 15,6 19,6 C15,8 13,10 13,14 C13,17 11,19 10,19 C9,19 7,17 7,14 C7,10 5,8 1,6 C5,6 8,5 10,1 Z" 
                  fill="#adffb0" fillOpacity="0.8" />
          </svg>
        );
      case 'mushroom':
        return (
          <svg viewBox="0 0 20 20" width="100%" height="100%">
            <path d="M10,1 C14,1 18,4 18,8 C18,11 16,12 14,13 L13,19 L7,19 L6,13 C4,12 2,11 2,8 C2,4 6,1 10,1 Z" 
                  fill="#eaccff" fillOpacity="0.8" />
          </svg>
        );
      case 'flower':
        return (
          <svg viewBox="0 0 20 20" width="100%" height="100%">
            <path d="M10,7 C8,5 8,2 10,1 C12,2 12,5 10,7 Z M13,10 C15,8 18,8 19,10 C18,12 15,12 13,10 Z M10,13 C12,15 12,18 10,19 C8,18 8,15 10,13 Z M7,10 C5,12 2,12 1,10 C2,8 5,8 7,10 Z" 
                  fill="#ffbae8" fillOpacity="0.8" />
            <circle cx="10" cy="10" r="2" fill="#ffffa0" />
          </svg>
        );
      case 'root':
        return (
          <svg viewBox="0 0 20 20" width="100%" height="100%">
            <path d="M10,1 L10,10 L13,13 L16,11 L17,14 L15,16 M10,10 L7,13 L4,11 L3,14 L5,16 M10,10 L10,19" 
                  stroke="#c17c50" strokeWidth="2" fill="none" />
          </svg>
        );
      case 'crystal':
        return (
          <svg viewBox="0 0 20 20" width="100%" height="100%">
            <path d="M10,1 L14,8 L10,19 L6,8 Z M6,8 L14,8" 
                  stroke="#a8e6ff" strokeWidth="1" fill="#e2f8ff" fillOpacity="0.8" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 20 20" width="100%" height="100%">
            <circle cx="10" cy="10" r="5" fill="#ffffff" fillOpacity="0.8" />
          </svg>
        );
    }
  };

  return (
    <div className="brewing-container">
      <div className="brewing-header">
        <h2>Witch's Cauldron</h2>
        <div className="brewing-phase">
          <LunarPhaseIcon phase={lunarPhase} size={28} />
          <div className="phase-value">{lunarPhase}</div>
        </div>
        {/* Show specialization bonus if there is one */}
        {playerSpecialization && (
          <div className="specialization-bonus" title={`${playerSpecialization} brewing bonus`}>
            +{getSpecializationBonus()}% {playerSpecialization} bonus
          </div>
        )}
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
            <div className={`cauldron-content ${brewingAnimation ? 'brewing-animation' : ''} ${natureHarmony > 75 ? 'nature-harmony' : ''}`}>
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
                  <div className={`bubble bubble-1 ${natureHarmony > 75 ? 'nature-bubble' : ''}`}></div>
                  <div className={`bubble bubble-2 ${natureHarmony > 75 ? 'nature-bubble' : ''}`}></div>
                  <div className={`bubble bubble-3 ${natureHarmony > 75 ? 'nature-bubble' : ''}`}></div>
                </>
              )}
              
              {/* Easter Egg: Show nature spirits when whispers are active */}
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
                        transform: `rotate(${spirit.rotation}deg) scale(${0.8 + (natureHarmony / 100) * 0.4})`,
                        animationDelay: `${spirit.delay}s`
                      }}
                    >
                      {getSpiritShape(spirit.type)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="brewing-actions">
            <button
              className={`action-button brew ${natureHarmony > 75 ? 'harmony-button' : ''}`}
              disabled={selectedIngredients.length !== 2 || brewingAnimation}
              onClick={handleBrew}
            >
              {natureHarmony > 75 ? 'Brew with Nature' : 
                (matchedRecipeInfo ? `Brew ${matchedRecipeInfo.name}` : 'Experiment')}
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
              <div className={`result-card ${brewResult.success ? 'success' : 'failure'} ${natureHarmony > 75 ? 'harmony-result' : ''}`}>
                <h4>{brewResult.success ? 
                  (natureHarmony > 75 ? '✨ Nature blesses you! ✨' : '✨ Brewing Success!') : 
                  (natureHarmony > 75 ? '🍃 The spirits are troubled...' : '☁ Brewing Failed!')
                    }
                </h4>
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
                  className={`recipe-item ${natureHarmony > 75 ? 'harmony-recipe' : ''}`}
                  title={recipe.description || recipe.name}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="recipe-header">
                    <div className="recipe-name">{natureHarmony > 75 ? `Harmonious ${recipe.name}` : recipe.name}</div>
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

      {/* CSS styles added via className for the Nature Harmony Easter Egg */}
    </div>
  );
};

export default Brewing;