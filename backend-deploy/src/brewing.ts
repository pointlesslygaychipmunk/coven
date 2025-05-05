// src/brewing.ts
// Defines brewing recipes and interactions for creating skincare potions

// Import from shared types
import { MoonPhase, AtelierSpecialization, ItemType, ItemCategory, InventoryItem, Player, Skills } from "coven-shared";
import { getSpecializationBonus } from './atelier.js';

// Define a recipe for brewing skincare products
export interface Recipe {
  id: string;
  name: string;
  ingredients: { itemName: string, quantity: number }[];
  resultItem: string;
  resultQuantity: number;
  type: ItemType;
  difficulty: number;
  idealMoonPhase?: MoonPhase;
  idealSpecialization?: AtelierSpecialization;
  description: string;
  category?: ItemCategory;
  properties: string[];
  unlockRequirement?: string;
}

// Define all available brewing recipes
export const RECIPES: Recipe[] = [
  { id: "recipe_radiant_moon_mask", name: "Radiant Moon Mask", type: "potion", ingredients: [ { itemName: "Ancient Ginseng", quantity: 1 }, { itemName: "Sacred Lotus", quantity: 1 } ], resultItem: "potion_radiant_mask", resultQuantity: 1, difficulty: 5, idealMoonPhase: "Full Moon", idealSpecialization: "Essence", description: "A luxurious facial mask...", category: "mask", properties: ["brightening", "rejuvenating", "radiance"] },
  { id: "recipe_moon_glow_serum", name: "Moon Glow Serum", type: "potion", ingredients: [ { itemName: "Moonbud", quantity: 2 }, { itemName: "Glimmerroot", quantity: 1 } ], resultItem: "potion_moonglow", resultQuantity: 1, difficulty: 4, idealMoonPhase: "Waxing Gibbous", idealSpecialization: "Essence", description: "A luminous facial serum...", category: "serum", properties: ["brightening", "firming", "glow"] },
  { id: "recipe_ginseng_infusion", name: "Ginseng Infusion", type: "potion", ingredients: [ { itemName: "Ancient Ginseng", quantity: 1 }, { itemName: "Sweetshade", quantity: 2 } ], resultItem: "potion_ginseng", resultQuantity: 1, difficulty: 3, idealMoonPhase: "New Moon", idealSpecialization: "Infusion", description: "A potent tonic...", category: "tonic", properties: ["rejuvenating", "balancing", "energizing"] },
  { id: "recipe_cooling_tonic", name: "Cooling Tonic", type: "potion", ingredients: [ { itemName: "Everdew", quantity: 1 }, { itemName: "Silverleaf", quantity: 2 } ], resultItem: "potion_cooling", resultQuantity: 1, difficulty: 3, idealMoonPhase: "Waning Crescent", idealSpecialization: "Infusion", description: "A refreshing tonic...", category: "tonic", properties: ["cooling", "soothing", "hydrating"] },
  { id: "recipe_spring_revival", name: "Spring Revival Tonic", type: "potion", ingredients: [ { itemName: "Glimmerroot", quantity: 1 }, { itemName: "Spring Root", quantity: 1 } ], resultItem: "potion_revival", resultQuantity: 1, difficulty: 4, idealMoonPhase: "Waxing Crescent", idealSpecialization: "Infusion", description: "A revitalizing spring tonic...", category: "tonic", properties: ["rejuvenating", "balancing", "firming"], unlockRequirement: "Learn during Spring" },
  { id: "recipe_summer_glow_oil", name: "Summer Glow Oil", type: "potion", ingredients: [ { itemName: "Sunpetal", quantity: 2 }, { itemName: "Emberberry", quantity: 1 } ], resultItem: "potion_summer_glow", resultQuantity: 1, difficulty: 5, idealMoonPhase: "Full Moon", idealSpecialization: "Distillation", description: "A radiant facial oil...", category: "oil", properties: ["energizing", "protective", "glow"], unlockRequirement: "Learn during Summer" },
  { id: "recipe_preservation_elixir", name: "Preservation Elixir", type: "potion", ingredients: [ { itemName: "Ancient Ginseng", quantity: 1 }, { itemName: "Autumnleaf", quantity: 2 } ], resultItem: "potion_preservation", resultQuantity: 1, difficulty: 6, idealMoonPhase: "Waning Gibbous", idealSpecialization: "Fermentation", description: "A potent elixir...", category: "elixir", properties: ["rejuvenating", "protective", "anti-aging"], unlockRequirement: "Learn during Fall" },
  { id: "recipe_dreamvision_potion", name: "Dreamvision Potion", type: "potion", ingredients: [ { itemName: "Nightcap", quantity: 2 }, { itemName: "Moonbud", quantity: 1 } ], resultItem: "potion_dreamvision", resultQuantity: 1, difficulty: 7, idealMoonPhase: "New Moon", idealSpecialization: "Distillation", description: "A mystical potion...", category: "potion", properties: ["hydrating", "clarifying", "intuitive"], unlockRequirement: "Learn during Winter" }
];

// Get recipe by ID
export function getRecipeById(id: string): Recipe | undefined {
  return RECIPES.find((recipe: Recipe) => recipe.id === id);
}

// Get recipe by name
export function getRecipeByName(name: string): Recipe | undefined {
  return RECIPES.find((recipe: Recipe) => recipe.name === name);
}

// Find a matching recipe
export function findMatchingRecipe(
    player: Player,
    ingredientInvItems: InventoryItem[]
): Recipe | undefined {
    // Make sure we have exactly 2 ingredients
    if (ingredientInvItems.length !== 2) return undefined;
    
    // Get the ingredient names and sort them for consistent comparison
    const ingredientNames = ingredientInvItems.map(item => item.name).sort();
    
    // Check each known recipe
    for (const recipeId of player.knownRecipes) {
        const recipe = getRecipeById(recipeId);
        if (!recipe || recipe.ingredients.length !== 2) continue;
        
        // Get recipe ingredient names and sort them
        const recipeIngs = recipe.ingredients.map(ing => ing.itemName).sort();
        
        // Check if ingredient names match
        if (recipeIngs[0] === ingredientNames[0] && recipeIngs[1] === ingredientNames[1]) {
            // Check if we have enough quantity of each ingredient
            const hasEnough = recipe.ingredients.every(reqIng => {
                const itemsUsedForThisIngredient = ingredientInvItems.filter(item => item.name === reqIng.itemName);
                const totalAvailable = itemsUsedForThisIngredient.reduce((sum, item) => sum + item.quantity, 0);
                return totalAvailable >= reqIng.quantity;
            });
            
            if (hasEnough) return recipe;
        }
    }
    
    return undefined;
}


// Get known recipes filtered
export function getKnownRecipesFiltered(
    player: Player,
    options: { specialization?: AtelierSpecialization, moonPhase?: MoonPhase, maxDifficulty?: number, category?: string, property?: string }
): Recipe[] {
    return player.knownRecipes
        .map((id: string) => getRecipeById(id))
        .filter((recipe): recipe is Recipe => !!recipe)
        .filter((recipe: Recipe) => {
            if (options.specialization && recipe.idealSpecialization && recipe.idealSpecialization !== options.specialization) return false;
            if (options.moonPhase && recipe.idealMoonPhase && recipe.idealMoonPhase !== options.moonPhase) return false;
            if (options.maxDifficulty !== undefined && recipe.difficulty > options.maxDifficulty) return false;
            if (options.category && options.category !== 'all' && recipe.category !== options.category) return false;
            if (options.property && !recipe.properties.includes(options.property)) return false;
            return true;
        });
}

// Calculate brewing success chance
export function calculateBrewingSuccess(
  recipe: Recipe, ingredientQualities: number[], playerSkills: Skills,
  currentMoonPhase: MoonPhase, specialization?: AtelierSpecialization
): { successChance: number, potentialQuality: number, factors: string[] } {
  const factors: string[] = [];
  const DEFAULT_ITEM_QUALITY = 70;
  
  // Calculate average ingredient quality
  const avgIngredientQuality = ingredientQualities.reduce((sum, q) => sum + q, 0) / ingredientQualities.length || DEFAULT_ITEM_QUALITY;
  factors.push(`Base quality: ${avgIngredientQuality.toFixed(0)}%`);
  
  // Base success chance
  let successChance = 0.6 + (avgIngredientQuality / 250);
  factors.push(`Base chance: ${Math.round(successChance * 100)}%`);
  
  // Skill bonus
  const skillBonus = (playerSkills.brewing || 0) * 0.03;
  successChance += skillBonus;
  factors.push(`Brewing skill (+${playerSkills.brewing || 0}): +${(skillBonus * 100).toFixed(0)}%`);
  
  // Moon phase effects
  let moonQualityBonus = 0;
  if (recipe.idealMoonPhase && currentMoonPhase === recipe.idealMoonPhase) {
    successChance += 0.15;
    moonQualityBonus = 15;
    factors.push(`Ideal moon: +15% success, +15 quality`);
  } else if (currentMoonPhase === "New Moon") {
    successChance -= 0.05;
    moonQualityBonus = -5;
    factors.push(`New Moon: -5% success, -5 quality`);
  } else if (currentMoonPhase === "Full Moon") {
    successChance += 0.05;
    moonQualityBonus = 5;
    factors.push(`Full Moon: +5% success, +5 quality`);
  }
  
  // Specialization bonus
  let specQualityBonus = 0;
  if (specialization && recipe.idealSpecialization && specialization === recipe.idealSpecialization) {
    successChance += 0.10;
    specQualityBonus = 10;
    factors.push(`Ideal specialization: +10% success, +10 quality`);
  }
  
  // Difficulty factor
  const difficultyFactor = Math.max(0, recipe.difficulty - (playerSkills.brewing || 0));
  if (difficultyFactor > 0) {
    const difficultyPenalty = difficultyFactor * 0.04;
    successChance -= difficultyPenalty;
    factors.push(`Difficulty: -${(difficultyPenalty * 100).toFixed(0)}% success`);
  }
  
  // Calculate potential quality
  let potentialQuality = avgIngredientQuality + moonQualityBonus + specQualityBonus;
  if (playerSkills.astrology) {
    potentialQuality += (playerSkills.astrology || 0) * 0.5;
  }
  
  // Clamp values
  successChance = Math.min(0.98, Math.max(0.15, successChance));
  potentialQuality = Math.round(Math.min(100, Math.max(10, potentialQuality)));
  
  return { successChance, potentialQuality, factors };
}

// Simulate the brewing result
export function brewPotion(
recipe: Recipe, ingredientQualities: number[], player: Player, _phaseName: string, _puzzleBonus: number, currentMoonPhase: MoonPhase): { success: boolean, resultItemName?: string, quantityProduced?: number; quality: number, bonusFactor?: string } {
  const { successChance, potentialQuality, factors } = calculateBrewingSuccess(
    recipe, ingredientQualities, player.skills, currentMoonPhase, player.atelierSpecialization
  );
  
  // Roll for success
  const roll = Math.random();
  const success = roll < successChance;
  
  if (!success) {
    console.log("Brewing failed.", {roll, successChance, factors});
    return { 
      success: false, 
      resultItemName: "misc_ruined_brewage", 
      quantityProduced: 0, 
      quality: 0 
    };
  }
  
  // Calculate final quality and bonuses
  let finalQuality = potentialQuality;
  let bonusFactor: string | undefined;
  
  // Critical success chance
  if ((player.skills.brewing || 0) >= 5 && potentialQuality > 75 && Math.random() < 0.10) {
    finalQuality = Math.min(100, finalQuality + 10 + Math.round(Math.random() * 10));
    bonusFactor = "Critical Success!";
  }
  
  // Full moon bonus
  if (currentMoonPhase === "Full Moon" && recipe.idealMoonPhase !== "Full Moon" && Math.random() < 0.15) {
    finalQuality = Math.min(100, finalQuality + 5);
    bonusFactor = (bonusFactor ? bonusFactor + " " : "") + "Full Moon potency boost.";
  }
  
  // Calculate quantity produced
  let quantityProduced = recipe.resultQuantity;
  
  // Distillation specialization bonus
  if (player.atelierSpecialization === 'Distillation' && typeof getSpecializationBonus === 'function') {
    const yieldBonus = getSpecializationBonus(
      player.atelierSpecialization, 
      'brew', 
      recipe.type, 
      recipe.category
    );
    
    if (yieldBonus.chanceForExtra && Math.random() < yieldBonus.chanceForExtra) {
      quantityProduced *= 2;
      bonusFactor = (bonusFactor ? bonusFactor + " " : "") + "Distillation Expertise: Double yield!";
    }
  }
  
  return { 
    success: true, 
    resultItemName: recipe.resultItem, 
    quantityProduced: quantityProduced, 
    quality: finalQuality, 
    bonusFactor 
  };
}

// Function to discover new recipes through experimentation
export function discoverRecipe(ingredients: InventoryItem[]): Recipe | null {
    if (ingredients.length !== 2) return null;
    
    const names = ingredients.map((i: InventoryItem) => i.name).sort();
    
    const potentialRecipe = RECIPES.find((recipe: Recipe) => { 
        if (recipe.ingredients.length !== 2) return false; 
        const recipeIngNames = recipe.ingredients.map(i => i.itemName).sort(); 
        return recipeIngNames[0] === names[0] && recipeIngNames[1] === names[1]; 
    });
    
    // 20% chance to discover a recipe when experimenting with correct ingredients
    if (potentialRecipe && Math.random() < 0.20) {
        return potentialRecipe;
    }
    
    return null;
}