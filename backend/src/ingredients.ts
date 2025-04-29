// src/ingredients.ts
// Defines all plant ingredients, their properties, and growth requirements

import { ItemCategory, Season, MoonPhase, WeatherFate, ItemType, Item } from "coven-shared";

// Full ingredient definition with growing properties
// Make this extend the base Item type for consistency
export interface Ingredient extends Item {
  id: string; // Unique ID (e.g., "ing_moonbud") - Overrides Item ID if needed
  type: 'ingredient'; // Explicitly ingredient type
  category: ItemCategory; // Must be an ingredient category
  growthTime: number; // Base number of growth cycles needed to mature
  primaryProperty: string; // Main skincare property (e.g., "brightening")
  secondaryProperty?: string; // Secondary skincare property
  bestSeason: Season; // Season when growth is optimal (1.5x modifier)
  worstSeason: Season; // Season when growth is poorest (0.5x modifier)
  idealMoonPhase?: MoonPhase; // Ideal moon phase for harvesting (bonus quality/yield)
  idealMoisture: number; // Ideal soil moisture range (e.g., 50-70) - Use a range or midpoint
  idealSunlight?: number; // Ideal sunlight level (0-100) - Optional for now
  hanbangUsage?: string; // Traditional Hanbang usage description
  harvestBonus?: string; // Description of special bonus when harvested optimally
  mutationChance?: number; // Base chance of mutation (0-1)
  mutationTypes?: string[]; // Possible mutation names (e.g., "Luminous", "Hardy")
}


// Define all available ingredients with complete properties
export const INGREDIENTS: Ingredient[] = [
  {
    id: "ing_glimmerroot", name: "Glimmerroot", type: "ingredient", category: "root", growthTime: 4,
    description: "A luminous root that grows stronger in sunlight. Provides firmness.",
    primaryProperty: "firming", secondaryProperty: "brightening", bestSeason: "Spring", worstSeason: "Winter",
    idealMoonPhase: "Waxing Gibbous", idealMoisture: 60, idealSunlight: 80,
    hanbangUsage: "Strengthens skin's structural integrity.",
    harvestBonus: "Enhanced firming compounds when harvested during Waxing Gibbous.",
    value: 12, rarity: 'common'
  },
  {
    id: "ing_moonbud", name: "Moonbud", type: "ingredient", category: "flower", growthTime: 3,
    description: "A silver-petaled flower that blooms at night, absorbing moonlight.",
    primaryProperty: "brightening", secondaryProperty: "rejuvenating", bestSeason: "Winter", worstSeason: "Summer",
    idealMoonPhase: "Full Moon", idealMoisture: 70, idealSunlight: 40,
    hanbangUsage: "Illuminates complexion, used in royal court rituals.",
    harvestBonus: "Harvesting during Full Moon grants enhanced luminosity.",
    mutationChance: 0.1, mutationTypes: ["Prismatic", "EternalBloom"],
    value: 10, rarity: 'common'
  },
   {
    id: "ing_silverleaf", name: "Silverleaf", type: "ingredient", category: "leaf", growthTime: 2,
    description: "Delicate silver-blue leaves. Excellent for sensitive skin.",
    primaryProperty: "soothing", secondaryProperty: "balancing", bestSeason: "Fall", worstSeason: "Summer",
    idealMoonPhase: "Waning Crescent", idealMoisture: 50, idealSunlight: 60,
    hanbangUsage: "Cools and calms inflammation.",
    value: 8, rarity: 'common'
  },
  {
    id: "ing_sunpetal", name: "Sunpetal", type: "ingredient", category: "flower", growthTime: 3,
    description: "Vibrant yellow flowers that follow the sun. Fills potions with vitality.",
    primaryProperty: "energizing", secondaryProperty: "protective", bestSeason: "Summer", worstSeason: "Winter",
    idealMoonPhase: "First Quarter", idealMoisture: 50, idealSunlight: 90,
    hanbangUsage: "Protects from environmental damage.",
    value: 8, rarity: 'common'
  },
   {
    id: "ing_nightcap", name: "Nightcap", type: "ingredient", category: "mushroom", growthTime: 2,
    description: "A deep purple mushroom that only grows in shade. Provides deep hydration.",
    primaryProperty: "hydrating", secondaryProperty: "detoxifying", bestSeason: "Fall", worstSeason: "Spring",
    idealMoonPhase: "New Moon", idealMoisture: 80, idealSunlight: 20,
    hanbangUsage: "Draws moisture into the deepest skin layers.",
    mutationChance: 0.15, mutationTypes: ["LuminousSpores", "MidnightBloom"],
    value: 9, rarity: 'uncommon'
  },
   {
    id: "ing_everdew", name: "Everdew", type: "ingredient", category: "succulent", growthTime: 4,
    description: "A succulent that constantly produces tiny droplets of moisture.",
    primaryProperty: "hydrating", secondaryProperty: "cooling", bestSeason: "Summer", worstSeason: "Winter",
    idealMoonPhase: "Waxing Crescent", idealMoisture: 30, idealSunlight: 70,
    hanbangUsage: "Maintains skin moisture balance in heat.",
    value: 14, rarity: 'uncommon'
  },
   {
    id: "ing_sweetshade", name: "Sweetshade", type: "ingredient", category: "herb", growthTime: 3,
    description: "A pale, sweet-smelling herb that grows in dappled light. Has calming properties.",
    primaryProperty: "soothing", secondaryProperty: "balancing", bestSeason: "Spring", worstSeason: "Fall",
    idealMoisture: 60, idealSunlight: 50,
    hanbangUsage: "Traditional remedy for sensitive, irritated skin.",
    value: 11, rarity: 'common'
  },
  {
    id: "ing_emberberry", name: "Emberberry", type: "ingredient", category: "fruit", growthTime: 2,
    description: "Small red berries that feel warm. Stimulates circulation and renewal.",
    primaryProperty: "energizing", secondaryProperty: "exfoliating", bestSeason: "Summer", worstSeason: "Winter",
    idealMoonPhase: "Waxing Gibbous", idealMoisture: 50, idealSunlight: 80,
    hanbangUsage: "Boosts renewal in formulations for mature skin.",
    value: 13, rarity: 'uncommon'
  },
   {
    id: "ing_ancient_ginseng", name: "Ancient Ginseng", type: "ingredient", category: "root", growthTime: 5,
    description: "A rare and potent form of ginseng with powerful rejuvenating properties.",
    primaryProperty: "rejuvenating", secondaryProperty: "nourishing", bestSeason: "Fall", worstSeason: "Spring",
    idealMoonPhase: "Full Moon", idealMoisture: 70, idealSunlight: 60,
    hanbangUsage: "Cornerstone of Hanbang skincare, believed to harmonize energy.",
    harvestBonus: "Harvesting after 5+ turns yields maximum beneficial compounds.",
    value: 25, rarity: 'rare'
  },
  {
    id: "ing_sacred_lotus", name: "Sacred Lotus", type: "ingredient", category: "flower", growthTime: 4,
    description: "Pure white flowers growing from muddy waters yet remaining pristine.",
    primaryProperty: "purifying", secondaryProperty: "brightening", bestSeason: "Summer", worstSeason: "Winter",
    idealMoonPhase: "Full Moon", idealMoisture: 90, idealSunlight: 70,
    hanbangUsage: "Symbolizes purity; used for brightening.",
    harvestBonus: "Harvesting at dawn enhances brightening compounds.",
    value: 18, rarity: 'rare'
  },
  // --- Seasonal Ingredients ---
  {
    id: "ing_spring_root", name: "Spring Root", type: "ingredient", category: "root", growthTime: 3,
    description: "A tender root harvested only in spring, bursting with renewal energy.",
    primaryProperty: "revitalizing", bestSeason: "Spring", worstSeason: "Fall",
    idealMoisture: 65, value: 15, rarity: 'uncommon'
  },
   {
    id: "ing_dewblossom", name: "Dewblossom", type: "ingredient", category: "flower", growthTime: 2,
    description: "Ephemeral spring flower that captures morning dew.",
    primaryProperty: "hydrating", secondaryProperty: "refreshing", bestSeason: "Spring", worstSeason: "Fall",
    idealMoisture: 75, value: 16, rarity: 'uncommon'
  },
  {
    id: "ing_sunthorn", name: "Sunthorn", type: "ingredient", category: "herb", growthTime: 3,
    description: "A prickly herb thriving in summer heat, offers skin protection.",
    primaryProperty: "protective", secondaryProperty: "resilience", bestSeason: "Summer", worstSeason: "Winter",
    idealMoisture: 40, idealSunlight: 95, value: 12, rarity: 'uncommon'
  },
  {
    id: "ing_dragon_petal", name: "Dragon Petal", type: "ingredient", category: "flower", growthTime: 4,
    description: "Fiery summer bloom known for its stimulating properties.",
    primaryProperty: "energizing", secondaryProperty: "firming", bestSeason: "Summer", worstSeason: "Winter",
    idealMoisture: 55, value: 18, rarity: 'rare'
  },
    {
    id: "ing_autumnleaf", name: "Autumnleaf", type: "ingredient", category: "leaf", growthTime: 2,
    description: "Leaves with the colours of fall, rich in preserving antioxidants.",
    primaryProperty: "anti-aging", secondaryProperty: "protective", bestSeason: "Fall", worstSeason: "Spring",
    idealMoisture: 50, value: 11, rarity: 'uncommon'
  },
  {
    id: "ing_twilight_berry", name: "Twilight Berry", type: "ingredient", category: "fruit", growthTime: 3,
    description: "Dark berries harvested in autumn twilight, possess calming properties.",
    primaryProperty: "soothing", secondaryProperty: "balancing", bestSeason: "Fall", worstSeason: "Spring",
    idealMoisture: 60, value: 15, rarity: 'uncommon'
  },
  {
    id: "ing_frostherb", name: "Frostherb", type: "ingredient", category: "herb", growthTime: 4,
    description: "A hardy herb that glitters with frost in winter, highly resilient.",
    primaryProperty: "resilience", secondaryProperty: "protective", bestSeason: "Winter", worstSeason: "Summer",
    idealMoisture: 45, value: 16, rarity: 'rare'
  },
   {
    id: "ing_snow_lotus", name: "Snow Lotus", type: "ingredient", category: "flower", growthTime: 5,
    description: "A rare lotus blooming amidst snow, exceptionally purifying.",
    primaryProperty: "purifying", secondaryProperty: "brightening", bestSeason: "Winter", worstSeason: "Summer",
    idealMoisture: 80, value: 20, rarity: 'rare'
  },
];

// Define SeedItem based on Item
export interface SeedItem extends Item {
    type: 'seed';
    category: 'seed';
    plantSource: string; // ID of the ingredient it grows
}

export const SEEDS: SeedItem[] = INGREDIENTS.map(ing => ({
  id: `seed_${ing.name.toLowerCase().replace(/\s+/g, '_')}`,
  name: `${ing.name} Seed`,
  type: "seed",
  category: "seed",
  plantSource: ing.id,
  value: Math.max(3, Math.floor((ing.value ?? 10) / 2)), // Use base value
  description: `Seeds for growing ${ing.name}. Prefers ${ing.bestSeason}.`,
  rarity: ing.rarity, // Seed rarity matches plant
  // imagePath: `/images/seeds/seed_${ing.name.toLowerCase().replace(/\s+/g, '_')}.png`
}));

// --- Helper Functions ---

export function getIngredientById(id: string): Ingredient | undefined {
  return INGREDIENTS.find(i => i.id === id);
}
export function getIngredientData(name: string): Ingredient | undefined { // Keep name lookup if needed elsewhere
  return INGREDIENTS.find(i => i.name === name);
}


// Calculate growth modifier based on growing conditions
export function calculateGrowthModifier(
  ingredient: Ingredient,
  currentSeason: Season,
  currentMoonPhase: MoonPhase,
  moisture: number,
  sunlight: number = 70 // Provide a default sunlight if optional
): {
  growthModifier: number;
  factors: string[];
} {
  const factors: string[] = [];
  let modifier = 1.0;

  // Season effect
  if (currentSeason === ingredient.bestSeason) {
    modifier *= 1.5;
    factors.push(`Optimal season (${currentSeason}): +50% growth`);
  } else if (currentSeason === ingredient.worstSeason) {
    modifier *= 0.5;
    factors.push(`Challenging season (${currentSeason}): -50% growth`);
  } else {
     factors.push(`Neutral season (${currentSeason})`);
  }

  // Moon phase influence
  if (currentMoonPhase === "Waxing Gibbous" || currentMoonPhase === "First Quarter") {
    modifier *= 1.1;
    factors.push(`Waxing moon phase (${currentMoonPhase}): +10% growth`);
  } else if (currentMoonPhase === "Waning Crescent") {
      modifier *= 0.95;
      factors.push(`Waning Crescent phase: -5% growth`);
  }

  // Moisture effect
  const idealMoistureMidpoint = ingredient.idealMoisture;
  const moistureDifference = Math.abs(moisture - idealMoistureMidpoint);
  if (moistureDifference < 10) modifier *= 1.2;
  else if (moistureDifference > 30) modifier *= 0.7;
  else if (moistureDifference > 20) modifier *= 0.9;
  // Add factors text based on difference...

  // Sunlight effect (check if idealSunlight is defined)
  if (ingredient.idealSunlight !== undefined) {
      const idealSun = ingredient.idealSunlight;
      const sunlightDifference = Math.abs(sunlight - idealSun);
      if (sunlightDifference < 15) modifier *= 1.15;
      else if (sunlightDifference > 40) modifier *= 0.75;
      else if (sunlightDifference > 25) modifier *= 0.9;
       // Add factors text based on difference...
  } else {
      // No specific sunlight preference, maybe slight bonus for moderate sun?
      if(sunlight > 40 && sunlight < 80) modifier *= 1.05;
  }

  modifier = Math.max(0.1, modifier); // Clamp modifier

  return { growthModifier: modifier, factors };
}

// Calculate harvest quality based on growing conditions and plant state
export function calculateHarvestQuality(
  ingredient: Ingredient,
  plantHealth: number,
  plantAge: number,
  harvestMoonPhase: MoonPhase,
  harvestSeason: Season
): { quality: number; bonusFactors: string[] } {
  const bonusFactors: string[] = [];
  let quality = 50; // Base quality

  // Health contribution
  const healthBonus = (plantHealth - 50) * 0.5;
  quality += healthBonus;
  bonusFactors.push(`Plant health (${plantHealth}%): ${healthBonus >= 0 ? '+' : ''}${healthBonus.toFixed(0)}`);

  // Age contribution
  const optimalAge = (ingredient.growthTime || 3) * 1.5; // Use default growthTime if needed
  const ageFactor = Math.min(1.0, plantAge / optimalAge);
  const ageQualityBonus = ageFactor * 15;
  quality += ageQualityBonus;
  if (ageQualityBonus > 5) bonusFactors.push(`Plant age (${plantAge} turns): +${ageQualityBonus.toFixed(0)}`);

  // Moon phase bonus
  if (ingredient.idealMoonPhase && harvestMoonPhase === ingredient.idealMoonPhase) {
    quality += 20;
    bonusFactors.push(`Ideal moon phase (${harvestMoonPhase}): +20`);
  } else if (harvestMoonPhase === "Full Moon") {
      quality += 5;
      bonusFactors.push(`Full Moon harvest: +5`);
  }

  // Season bonus
  if (harvestSeason === ingredient.bestSeason) {
    quality += 10;
    bonusFactors.push(`Best season (${harvestSeason}): +10`);
  } else if (harvestSeason === ingredient.worstSeason) {
    quality -= 15;
    bonusFactors.push(`Worst season (${harvestSeason}): -15`);
  }

  // Special bonus description check
  if (ingredient.harvestBonus && ( (ingredient.idealMoonPhase && harvestMoonPhase === ingredient.idealMoonPhase) || harvestSeason === ingredient.bestSeason) ) {
      if (ingredient.harvestBonus.toLowerCase().includes("quality") || ingredient.harvestBonus.toLowerCase().includes("potent")) {
            quality += 10;
            bonusFactors.push(`Special harvest bonus (+10): ${ingredient.harvestBonus}`);
      }
  }

  // Clamp quality
  quality = Math.round(Math.min(100, Math.max(10, quality)));

  return { quality, bonusFactors };
}


// Check for mutation
export function checkForMutation(
  ingredient: Ingredient,
  weather: WeatherFate,
  moonPhase: MoonPhase,
  // adjacentPlants: string[] // Consider passing full Plant objects if more detail needed
): string | null {
  if (!ingredient.mutationChance || !ingredient.mutationTypes || ingredient.mutationTypes.length === 0) {
    return null;
  }

  let currentMutationChance = ingredient.mutationChance;

  if (moonPhase === "Full Moon" || moonPhase === "New Moon") currentMutationChance *= 1.5;
  if (weather === "stormy" || weather === "windy") currentMutationChance *= 1.3;
  // Add adjacent plant logic here if implemented

  if (Math.random() < currentMutationChance) {
    const mutationIndex = Math.floor(Math.random() * ingredient.mutationTypes.length);
    const mutationType = ingredient.mutationTypes[mutationIndex];
    console.log(`MUTATION! ${ingredient.name} -> ${mutationType} (Chance: ${currentMutationChance.toFixed(3)})`);
    return mutationType;
  }

  return null;
}


// Get growth stage description
export function getGrowthStageDescription(
  plantName: string,
  currentGrowth: number | undefined, // Allow undefined
  maxGrowth: number | undefined // Allow undefined
): string {
    // Handle undefined or invalid inputs gracefully
    if (currentGrowth === undefined || maxGrowth === undefined || maxGrowth <= 0) {
        return `${plantName} (Growth stage unknown)`;
    }

    const percentage = Math.min(100, Math.max(0, (currentGrowth / maxGrowth) * 100)); // Clamp 0-100

    if (percentage >= 100) return `Mature ${plantName}`;
    if (percentage >= 75) return `Maturing ${plantName}`;
    if (percentage >= 50) return `Developing ${plantName}`;
    if (percentage >= 25) return `Sprouting ${plantName}`;
    if (percentage > 0) return `Seedling ${plantName}`;
    return `Planted ${plantName} Seed`;
}


// --- Category/Filtering Helpers ---
// (Keep groupIngredientsByCategory, getSeasonalIngredients, getMoonPhaseIngredients as they are useful)

export function groupIngredientsByCategory(): Record<ItemCategory, Ingredient[]> {
  const grouped: Partial<Record<ItemCategory, Ingredient[]>> = {};
  const ingredientCategories: ItemCategory[] = ['herb', 'flower', 'root', 'fruit', 'mushroom', 'leaf', 'succulent', 'essence', 'crystal']; // Define relevant categories

  INGREDIENTS.forEach(ingredient => {
    const category = ingredient.category;
    // Only group if it's a recognized ingredient category
    if (ingredientCategories.includes(category)) {
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category]!.push(ingredient);
    }
  });

  // Ensure all categories exist, even if empty
  ingredientCategories.forEach(cat => {
      if (!grouped[cat]) grouped[cat] = [];
  });

  return grouped as Record<ItemCategory, Ingredient[]>;
}

export function getSeasonalIngredients(season: Season): Ingredient[] {
  return INGREDIENTS.filter(ing => ing.bestSeason === season);
}

export function getMoonPhaseIngredients(phase: MoonPhase): Ingredient[] {
  return INGREDIENTS.filter(ing => ing.idealMoonPhase === phase);
}