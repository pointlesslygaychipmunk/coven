// src/brewing.ts
// Defines brewing recipes and interactions for creating skincare potions

import { MoonPhase, AtelierSpecialization, ItemType, ItemCategory, InventoryItem } from "coven-shared";
import { Player } from "coven-shared"; // Import Player type

// Define a recipe for brewing skincare products
export interface Recipe {
  id: string;
  name: string;           // Name of the resulting potion/product
  ingredients: { itemName: string, quantity: number }[]; // Ingredients needed
  resultItem: string;     // ID of the resulting item (matches an ID in items.ts)
  resultQuantity: number; // How many are produced
  difficulty: number;     // 1-10, affects success chance
  idealMoonPhase?: MoonPhase; // Optional: Best moon phase for brewing
  idealSpecialization?: AtelierSpecialization; // Optional: Best specialization
  description: string;    // Description of the resulting item
  category: ItemCategory; // Category of the resulting item (mask, serum, etc.)
  properties: string[];   // Skincare properties (e.g., "brightening", "hydrating")
  unlockRequirement?: string; // How to unlock this recipe (e.g., skill level, quest)
}

// Define all available brewing recipes
// Use item IDs for results where possible for consistency
export const RECIPES: Recipe[] = [
  {
    id: "recipe_radiant_moon_mask",
    name: "Radiant Moon Mask",
    ingredients: [
      { itemName: "Ancient Ginseng", quantity: 1 }, // Use name for lookup, could use ID if preferred
      { itemName: "Sacred Lotus", quantity: 1 }
    ],
    resultItem: "potion_radiant_mask", // ID from items.ts
    resultQuantity: 1,
    difficulty: 5,
    idealMoonPhase: "Full Moon",
    idealSpecialization: "Essence",
    description: "A luxurious facial mask that brightens and rejuvenates skin, imbued with lunar energy.",
    category: "mask",
    properties: ["brightening", "rejuvenating", "radiance"]
  },
  {
    id: "recipe_moon_glow_serum",
    name: "Moon Glow Serum",
    ingredients: [
      { itemName: "Moonbud", quantity: 2 }, // Requires 2 Moonbuds
      { itemName: "Glimmerroot", quantity: 1 }
    ],
    resultItem: "potion_moonglow", // ID from items.ts
    resultQuantity: 1,
    difficulty: 4,
    idealMoonPhase: "Waxing Gibbous",
    idealSpecialization: "Essence",
    description: "A luminous facial serum that gives skin a moonlit glow while firming the complexion.",
    category: "serum",
    properties: ["brightening", "firming", "glow"]
  },
  {
    id: "recipe_ginseng_infusion",
    name: "Ginseng Infusion",
    ingredients: [
      { itemName: "Ancient Ginseng", quantity: 1 },
      { itemName: "Sweetshade", quantity: 2 } // Changed ingredient for variety
    ],
    resultItem: "potion_ginseng", // ID from items.ts
    resultQuantity: 1,
    difficulty: 3,
    idealMoonPhase: "New Moon", // New Moon for grounding energy
    idealSpecialization: "Infusion",
    description: "A potent tonic that revitalizes skin with the grounding power of Ancient Ginseng.",
    category: "tonic",
    properties: ["rejuvenating", "balancing", "energizing"]
  },
  {
    id: "recipe_cooling_tonic",
    name: "Cooling Tonic",
    ingredients: [
      { itemName: "Everdew", quantity: 1 },
      { itemName: "Silverleaf", quantity: 2 }
    ],
    resultItem: "potion_cooling", // ID from items.ts
    resultQuantity: 1,
    difficulty: 3,
    idealMoonPhase: "Waning Crescent", // Waning for calming
    idealSpecialization: "Infusion",
    description: "A refreshing tonic that soothes and cools irritated or overheated skin.",
    category: "tonic",
    properties: ["cooling", "soothing", "hydrating"]
  },
  {
    id: "recipe_spring_revival",
    name: "Spring Revival Tonic",
    ingredients: [
      { itemName: "Glimmerroot", quantity: 1 },
      { itemName: "Spring Root", quantity: 1 } // Uses seasonal ingredient
    ],
    resultItem: "potion_revival",
    resultQuantity: 1,
    difficulty: 4,
    idealMoonPhase: "Waxing Crescent",
    idealSpecialization: "Infusion",
    description: "A revitalizing spring tonic that awakens the skin after winter.",
    category: "tonic",
    properties: ["rejuvenating", "balancing", "firming"],
    unlockRequirement: "Learn during Spring" // Example unlock condition
  },
  {
    id: "recipe_summer_glow_oil",
    name: "Summer Glow Oil",
    ingredients: [
      { itemName: "Sunpetal", quantity: 2 },
      { itemName: "Emberberry", quantity: 1 }
    ],
    resultItem: "potion_summer_glow",
    resultQuantity: 1,
    difficulty: 5,
    idealMoonPhase: "Full Moon", // Max solar energy capture
    idealSpecialization: "Distillation",
    description: "A radiant facial oil that gives skin a sun-kissed glow and protects from environmental stressors.",
    category: "oil",
    properties: ["energizing", "protective", "glow"],
    unlockRequirement: "Learn during Summer"
  },
  {
    id: "recipe_preservation_elixir",
    name: "Preservation Elixir",
    ingredients: [
      { itemName: "Ancient Ginseng", quantity: 1 },
      { itemName: "Autumnleaf", quantity: 2 } // Uses seasonal ingredient
    ],
    resultItem: "potion_preservation",
    resultQuantity: 1,
    difficulty: 6,
    idealMoonPhase: "Waning Gibbous", // Preservation phase
    idealSpecialization: "Fermentation",
    description: "A potent elixir that preserves youthful skin and prevents damage.",
    category: "elixir",
    properties: ["rejuvenating", "protective", "anti-aging"],
    unlockRequirement: "Learn during Fall"
  },
  {
    id: "recipe_dreamvision_potion",
    name: "Dreamvision Potion",
    ingredients: [
      { itemName: "Nightcap", quantity: 2 },
      { itemName: "Moonbud", quantity: 1 }
    ],
    resultItem: "potion_dreamvision",
    resultQuantity: 1,
    difficulty: 7,
    idealMoonPhase: "New Moon", // Inner vision phase
    idealSpecialization: "Distillation",
    description: "A mystical potion that promotes clarity and vision while deeply hydrating the skin.",
    category: "potion", // General potion category
    properties: ["hydrating", "clarifying", "intuitive"],
    unlockRequirement: "Learn during Winter"
  }
];

// Get recipe by ID
export function getRecipeById(id: string): Recipe | undefined {
  return RECIPES.find((recipe: Recipe) => recipe.id === id);
}

// Get recipe by name
export function getRecipeByName(name: string): Recipe | undefined {
  return RECIPES.find((recipe: Recipe) => recipe.name === name);
}

// Get recipe by ingredients (handles different order and quantity check)
export function findMatchingRecipe(
    player: Player,
    ingredientNames: string[] // Array of ingredient names selected
): Recipe | undefined {
    if (ingredientNames.length !== 2) return undefined; // Only handle 2-ingredient recipes for now

    // Check if player knows any recipes matching these ingredients
    for (const recipeId of player.knownRecipes) {
        const recipe = getRecipeById(recipeId);
        if (!recipe || recipe.ingredients.length !== 2) continue;

        const recipeIngs = recipe.ingredients.map(ing => ing.itemName);

        // Check if the selected ingredients match the recipe ingredients (order doesn't matter)
        if (
            (recipeIngs[0] === ingredientNames[0] && recipeIngs[1] === ingredientNames[1]) ||
            (recipeIngs[0] === ingredientNames[1] && recipeIngs[1] === ingredientNames[0])
        ) {
            // Check if player has enough quantity of each ingredient
            const hasEnough = recipe.ingredients.every(reqIng => {
                const invItem = player.inventory.find(item => item.name === reqIng.itemName);
                return invItem && invItem.quantity >= reqIng.quantity;
            });

            if (hasEnough) {
                return recipe; // Found a known and craftable recipe
            }
        }
    }

    // Optional: Check if any *unknown* recipe matches for experimentation (lower success?)
    // This requires iterating through all RECIPES, not just player.knownRecipes

    return undefined; // No known, craftable recipe found
}


// Get recipes filtered by various criteria (useful for UI)
export function getKnownRecipesFiltered(
    player: Player,
    options: {
        specialization?: AtelierSpecialization,
        moonPhase?: MoonPhase,
        maxDifficulty?: number,
        category?: string,
        property?: string
    }
): Recipe[] {
    return player.knownRecipes
        .map(id => getRecipeById(id)) // Get full recipe objects
        .filter((recipe): recipe is Recipe => !!recipe) // Filter out undefined/null recipes
        .filter((recipe: Recipe) => {
            // Filter by specialization if provided (match ideal)
            if (options.specialization && recipe.idealSpecialization &&
                recipe.idealSpecialization !== options.specialization) {
                return false;
            }

            // Filter by moon phase if provided (match ideal)
            if (options.moonPhase && recipe.idealMoonPhase &&
                recipe.idealMoonPhase !== options.moonPhase) {
                return false;
            }

            // Filter by max difficulty if provided
            if (options.maxDifficulty !== undefined &&
                recipe.difficulty > options.maxDifficulty) {
                return false;
            }

            // Filter by category if provided
            if (options.category && options.category !== 'all' && recipe.category !== options.category) {
                return false;
            }

            // Filter by property if provided
            if (options.property && !recipe.properties.includes(options.property)) {
                return false;
            }

            // Filter by unlock requirement (basic check - needs more robust system)
            // if (recipe.unlockRequirement && !checkUnlock(player, recipe.unlockRequirement)) {
            //     return false;
            // }

            return true;
        });
}

// Calculate brewing success chance based on conditions
export function calculateBrewingSuccess(
  recipe: Recipe,
  ingredientQualities: number[], // Array of qualities for used ingredients
  playerSkills: { brewing: number, astrology?: number }, // Pass relevant skills
  currentMoonPhase: MoonPhase,
  specialization?: AtelierSpecialization // Player's specialization
): {
  successChance: number,
  potentialQuality: number,
  factors: string[] // Explain the calculation
} {
  const factors: string[] = [];

  // Calculate average ingredient quality
  const avgIngredientQuality = ingredientQualities.reduce((sum, q) => sum + q, 0) / ingredientQualities.length;
  factors.push(`Base quality from ingredients: ${avgIngredientQuality.toFixed(0)}%`);

  // Base success chance (adjust base and scaling)
  let successChance = 0.6 + (avgIngredientQuality / 250); // 60% base + up to 40% from quality
  factors.push(`Base chance: ${Math.round(successChance * 100)}%`);

  // Brewing skill bonus (+3% per level, diminishing returns?)
  const skillBonus = playerSkills.brewing * 0.03;
  successChance += skillBonus;
  factors.push(`Brewing skill bonus (+${playerSkills.brewing}): +${(skillBonus * 100).toFixed(0)}%`);

  // Moon phase bonus/penalty
  let moonQualityBonus = 0;
  if (recipe.idealMoonPhase && currentMoonPhase === recipe.idealMoonPhase) {
    successChance += 0.15; // +15% success
    moonQualityBonus = 15; // +15 quality
    factors.push(`Ideal moon phase (${currentMoonPhase}): +15% success, +15 quality`);
  } else if (currentMoonPhase === "New Moon") {
    successChance -= 0.05; // -5% success
    moonQualityBonus = -5; // -5 quality
    factors.push(`New Moon influence: -5% success, -5 quality`);
  } else if (currentMoonPhase === "Full Moon") {
    // General full moon bonus if not the ideal phase
    successChance += 0.05; // +5% success
    moonQualityBonus = 5;  // +5 quality
    factors.push(`Full Moon boost: +5% success, +5 quality`);
  }

  // Specialization bonus/penalty
  let specQualityBonus = 0;
  if (specialization && recipe.idealSpecialization && specialization === recipe.idealSpecialization) {
    successChance += 0.10; // +10% success
    specQualityBonus = 10; // +10 quality
    factors.push(`Ideal specialization (${specialization}): +10% success, +10 quality`);
  } else if (specialization && recipe.idealSpecialization) {
    // Minor penalty if NOT the ideal specialization? Optional.
    // successChance -= 0.02;
    // factors.push(`Not ideal specialization: -2% success`);
  }

  // Recipe difficulty penalty (-4% per difficulty level above skill level?)
  const difficultyFactor = Math.max(0, recipe.difficulty - playerSkills.brewing); // How much harder is recipe than skill
  if (difficultyFactor > 0) {
    const difficultyPenalty = difficultyFactor * 0.04;
    successChance -= difficultyPenalty;
    factors.push(`Recipe difficulty vs skill: -${(difficultyPenalty * 100).toFixed(0)}% success`);
  }

  // Calculate potential quality of the result
  let potentialQuality = avgIngredientQuality + moonQualityBonus + specQualityBonus;
  // Optional: Add bonus from Astrology skill?
  if (playerSkills.astrology) {
      potentialQuality += playerSkills.astrology * 0.5; // Small quality boost per astrology level
  }

  // Cap the success chance and quality
  successChance = Math.min(0.98, Math.max(0.15, successChance)); // 15% to 98%
  potentialQuality = Math.round(Math.min(100, Math.max(10, potentialQuality))); // 10 to 100

  return {
    successChance,
    potentialQuality,
    factors
  };
}

// Simulate the brewing result (incorporates random chance)
export function brewPotion(
  recipe: Recipe,
  ingredientQualities: number[],
  player: Player, // Pass the full player object
  currentMoonPhase: MoonPhase
): {
  success: boolean,
  resultItemName?: string, // Name of the item produced (or failure item)
  quality: number, // Quality of the result (0 if failed)
  bonusFactor?: string // Text describing any special outcomes
} {
  const { successChance, potentialQuality, factors } = calculateBrewingSuccess(
    recipe, ingredientQualities, player.skills, currentMoonPhase, player.atelierSpecialization
  );

  const roll = Math.random();
  const success = roll < successChance;

  if (!success) {
    console.log("Brewing failed. Roll:", roll, "Needed <", successChance);
    console.log("Factors:", factors);
    // Maybe return 'Ruined Brewage' or similar instead of quality 0?
    return {
      success: false,
      resultItemName: "Ruined Brewage", // Define this item
      quality: 0
    };
  }

  // Determine quality outcomes and special bonuses
  let finalQuality = potentialQuality;
  let bonusFactor: string | undefined;

  // Critical success: ~10% chance for a quality boost if brewing skill is high
  // Also requires high base potential quality to crit
  if (player.skills.brewing >= 5 && potentialQuality > 75 && Math.random() < 0.10) {
    finalQuality = Math.min(100, finalQuality + 10 + Math.round(Math.random() * 10)); // +10-20 quality boost
    bonusFactor = "Critical Success! The potion exceeds your expectations.";
  }

  // Special moon phase bonus effects - can stack with crit
  if (currentMoonPhase === "Full Moon" && recipe.idealMoonPhase !== "Full Moon" && Math.random() < 0.15) {
    finalQuality = Math.min(100, finalQuality + 5);
    bonusFactor = (bonusFactor ? bonusFactor + " " : "") + "The Full Moon's light infuses the potion with extra potency.";
  }

   // Apply specialization yield chance (Distillation)
   let quantityProduced = recipe.resultQuantity;
   if (player.atelierSpecialization === 'Distillation') {
       const yieldBonus = getSpecializationBonus(player.atelierSpecialization, 'brew', recipe.type, recipe.category);
       if (yieldBonus.chanceForExtra && Math.random() < yieldBonus.chanceForExtra) {
           quantityProduced *= 2; // Double yield
           bonusFactor = (bonusFactor ? bonusFactor + " " : "") + "Distillation Expertise: Double yield!";
       }
   }

  // Return successful result
  return {
    success: true,
    resultItemName: recipe.resultItem, // Return the ID of the item produced
    quality: finalQuality,
    bonusFactor
    // Consider returning quantityProduced if it can be > 1
  };
}

// Function to discover new recipes through experimentation (basic example)
export function discoverRecipe(ingredients: InventoryItem[]): Recipe | null {
    if (ingredients.length !== 2) return null; // Only handle 2 ingredients for now

    const names = ingredients.map(i => i.name).sort(); // Sort for consistent matching

    // Find *any* recipe matching these ingredients, known or unknown
    const potentialRecipe = RECIPES.find(recipe => {
        if (recipe.ingredients.length !== 2) return false;
        const recipeIngNames = recipe.ingredients.map(i => i.itemName).sort();
        return recipeIngNames[0] === names[0] && recipeIngNames[1] === names[1];
    });

    // Basic discovery chance (e.g., 20%)
    if (potentialRecipe && Math.random() < 0.20) {
        return potentialRecipe;
    }

    return null; // No recipe discovered this time
}