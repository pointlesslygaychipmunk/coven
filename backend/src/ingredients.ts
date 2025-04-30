// src/ingredients.ts
// Defines all plant ingredients, their properties, and growth requirements

import { ItemCategory, Season, MoonPhase, WeatherFate, Item, Rarity } from "coven-shared";

// Full ingredient definition with growing properties
// Ingredient now inherits 'name', 'value' etc. from Item via shared/types.ts
export interface Ingredient extends Item {
  // id: string; // Inherited from Item
  // name: string; // Inherited from Item
  type: 'ingredient'; // Explicitly ingredient type
  category: ItemCategory; // Must be an ingredient category
  rarity: Rarity; // Ensure rarity is always present
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
  // value?: number; // Inherited from Item
  // description?: string; // Inherited from Item
}


// Define all available ingredients with complete properties
// REMOVED redundant properties ('name', 'value', 'description') that are defined in the base Item type
export const INGREDIENTS: Ingredient[] = [
  {
    id: "ing_glimmerroot", name: "Glimmerroot", type: "ingredient", category: "root", rarity: 'common', growthTime: 4, value: 12,
    description: "A luminous root that grows stronger in sunlight. Provides firmness.",
    primaryProperty: "firming", secondaryProperty: "brightening", bestSeason: "Spring", worstSeason: "Winter",
    idealMoonPhase: "Waxing Gibbous", idealMoisture: 60, idealSunlight: 80,
    hanbangUsage: "Strengthens skin's structural integrity.",
    harvestBonus: "Enhanced firming compounds when harvested during Waxing Gibbous.",
  },
  {
    id: "ing_moonbud", name: "Moonbud", type: "ingredient", category: "flower", rarity: 'common', growthTime: 3, value: 10,
    description: "A silver-petaled flower that blooms at night, absorbing moonlight.",
    primaryProperty: "brightening", secondaryProperty: "rejuvenating", bestSeason: "Winter", worstSeason: "Summer",
    idealMoonPhase: "Full Moon", idealMoisture: 70, idealSunlight: 40,
    hanbangUsage: "Illuminates complexion, used in royal court rituals.",
    harvestBonus: "Harvesting during Full Moon grants enhanced luminosity.",
    mutationChance: 0.1, mutationTypes: ["Prismatic", "EternalBloom"],
  },
   {
    id: "ing_silverleaf", name: "Silverleaf", type: "ingredient", category: "leaf", rarity: 'common', growthTime: 2, value: 8,
    description: "Delicate silver-blue leaves. Excellent for sensitive skin.",
    primaryProperty: "soothing", secondaryProperty: "balancing", bestSeason: "Fall", worstSeason: "Summer",
    idealMoonPhase: "Waning Crescent", idealMoisture: 50, idealSunlight: 60,
    hanbangUsage: "Cools and calms inflammation.",
  },
  {
    id: "ing_sunpetal", name: "Sunpetal", type: "ingredient", category: "flower", rarity: 'common', growthTime: 3, value: 8,
    description: "Vibrant yellow flowers that follow the sun. Fills potions with vitality.",
    primaryProperty: "energizing", secondaryProperty: "protective", bestSeason: "Summer", worstSeason: "Winter",
    idealMoonPhase: "First Quarter", idealMoisture: 50, idealSunlight: 90,
    hanbangUsage: "Protects from environmental damage.",
  },
   {
    id: "ing_nightcap", name: "Nightcap", type: "ingredient", category: "mushroom", rarity: 'uncommon', growthTime: 2, value: 9,
    description: "A deep purple mushroom that only grows in shade. Provides deep hydration.",
    primaryProperty: "hydrating", secondaryProperty: "detoxifying", bestSeason: "Fall", worstSeason: "Spring",
    idealMoonPhase: "New Moon", idealMoisture: 80, idealSunlight: 20,
    hanbangUsage: "Draws moisture into the deepest skin layers.",
    mutationChance: 0.15, mutationTypes: ["LuminousSpores", "MidnightBloom"],
  },
   {
    id: "ing_everdew", name: "Everdew", type: "ingredient", category: "succulent", rarity: 'uncommon', growthTime: 4, value: 14,
    description: "A succulent that constantly produces tiny droplets of moisture.",
    primaryProperty: "hydrating", secondaryProperty: "cooling", bestSeason: "Summer", worstSeason: "Winter",
    idealMoonPhase: "Waxing Crescent", idealMoisture: 30, idealSunlight: 70,
    hanbangUsage: "Maintains skin moisture balance in heat.",
  },
   {
    id: "ing_sweetshade", name: "Sweetshade", type: "ingredient", category: "herb", rarity: 'common', growthTime: 3, value: 11,
    description: "A pale, sweet-smelling herb that grows in dappled light. Has calming properties.",
    primaryProperty: "soothing", secondaryProperty: "balancing", bestSeason: "Spring", worstSeason: "Fall",
    idealMoisture: 60, idealSunlight: 50,
    hanbangUsage: "Traditional remedy for sensitive, irritated skin.",
  },
  {
    id: "ing_emberberry", name: "Emberberry", type: "ingredient", category: "fruit", rarity: 'uncommon', growthTime: 2, value: 13,
    description: "Small red berries that feel warm. Stimulates circulation and renewal.",
    primaryProperty: "energizing", secondaryProperty: "exfoliating", bestSeason: "Summer", worstSeason: "Winter",
    idealMoonPhase: "Waxing Gibbous", idealMoisture: 50, idealSunlight: 80,
    hanbangUsage: "Boosts renewal in formulations for mature skin.",
  },
   {
    id: "ing_ancient_ginseng", name: "Ancient Ginseng", type: "ingredient", category: "root", rarity: 'rare', growthTime: 5, value: 25,
    description: "A rare and potent form of ginseng with powerful rejuvenating properties.",
    primaryProperty: "rejuvenating", secondaryProperty: "nourishing", bestSeason: "Fall", worstSeason: "Spring",
    idealMoonPhase: "Full Moon", idealMoisture: 70, idealSunlight: 60,
    hanbangUsage: "Cornerstone of Hanbang skincare, believed to harmonize energy.",
    harvestBonus: "Harvesting after 5+ turns yields maximum beneficial compounds.",
  },
  {
    id: "ing_sacred_lotus", name: "Sacred Lotus", type: "ingredient", category: "flower", rarity: 'rare', growthTime: 4, value: 18,
    description: "Pure white flowers growing from muddy waters yet remaining pristine.",
    primaryProperty: "purifying", secondaryProperty: "brightening", bestSeason: "Summer", worstSeason: "Winter",
    idealMoonPhase: "Full Moon", idealMoisture: 90, idealSunlight: 70,
    hanbangUsage: "Symbolizes purity; used for brightening.",
    harvestBonus: "Harvesting at dawn enhances brightening compounds.",
  },
  // --- Seasonal Ingredients ---
  {
    id: "ing_spring_root", name: "Spring Root", type: "ingredient", category: "root", rarity: 'uncommon', growthTime: 3, value: 15,
    description: "A tender root harvested only in spring, bursting with renewal energy.",
    primaryProperty: "revitalizing", bestSeason: "Spring", worstSeason: "Fall", idealMoisture: 65
  },
   {
    id: "ing_dewblossom", name: "Dewblossom", type: "ingredient", category: "flower", rarity: 'uncommon', growthTime: 2, value: 16,
    description: "Ephemeral spring flower that captures morning dew.",
    primaryProperty: "hydrating", secondaryProperty: "refreshing", bestSeason: "Spring", worstSeason: "Fall", idealMoisture: 75
  },
  {
    id: "ing_sunthorn", name: "Sunthorn", type: "ingredient", category: "herb", rarity: 'uncommon', growthTime: 3, value: 12,
    description: "A prickly herb thriving in summer heat, offers skin protection.",
    primaryProperty: "protective", secondaryProperty: "resilience", bestSeason: "Summer", worstSeason: "Winter", idealMoisture: 40, idealSunlight: 95
  },
  {
    id: "ing_dragon_petal", name: "Dragon Petal", type: "ingredient", category: "flower", rarity: 'rare', growthTime: 4, value: 18,
    description: "Fiery summer bloom known for its stimulating properties.",
    primaryProperty: "energizing", secondaryProperty: "firming", bestSeason: "Summer", worstSeason: "Winter", idealMoisture: 55
  },
    {
    id: "ing_autumnleaf", name: "Autumnleaf", type: "ingredient", category: "leaf", rarity: 'uncommon', growthTime: 2, value: 11,
    description: "Leaves with the colours of fall, rich in preserving antioxidants.",
    primaryProperty: "anti-aging", secondaryProperty: "protective", bestSeason: "Fall", worstSeason: "Spring", idealMoisture: 50
  },
  {
    id: "ing_twilight_berry", name: "Twilight Berry", type: "ingredient", category: "fruit", rarity: 'uncommon', growthTime: 3, value: 15,
    description: "Dark berries harvested in autumn twilight, possess calming properties.",
    primaryProperty: "soothing", secondaryProperty: "balancing", bestSeason: "Fall", worstSeason: "Spring", idealMoisture: 60
  },
  {
    id: "ing_frostherb", name: "Frostherb", type: "ingredient", category: "herb", rarity: 'rare', growthTime: 4, value: 16,
    description: "A hardy herb that glitters with frost in winter, highly resilient.",
    primaryProperty: "resilience", secondaryProperty: "protective", bestSeason: "Winter", worstSeason: "Summer", idealMoisture: 45
  },
   {
    id: "ing_snow_lotus", name: "Snow Lotus", type: "ingredient", category: "flower", rarity: 'rare', growthTime: 5, value: 20,
    description: "A rare lotus blooming amidst snow, exceptionally purifying.",
    primaryProperty: "purifying", secondaryProperty: "brightening", bestSeason: "Winter", worstSeason: "Summer", idealMoisture: 80
  },
];

// Define SeedItem based on Item
// SeedItem now inherits 'id', 'name', 'value', 'description', 'rarity' from Item
export interface SeedItem extends Item {
    type: 'seed';
    category: 'seed';
    plantSource: string; // ID of the ingredient it grows
}

export const SEEDS: SeedItem[] = INGREDIENTS.map(ing => ({
  // id, name, value, description, rarity inherited implicitly if Base Item type is correctly resolved
  id: `seed_${ing.name.toLowerCase().replace(/\s+/g, '_')}`,
  name: `${ing.name} Seed`,
  type: "seed",
  category: "seed",
  plantSource: ing.id,
  value: Math.max(3, Math.floor((ing.value ?? 10) / 2)),
  description: `Seeds for growing ${ing.name}. Prefers ${ing.bestSeason}.`,
  rarity: ing.rarity,
  // Make sure the base 'Item' type includes all properties needed here,
  // or explicitly add them to SeedItem if they aren't common.
  // For now, relying on shared/types.ts having name, value, description, rarity on Item.
}));


// --- Helper Functions ---

export function getIngredientById(id: string): Ingredient | undefined {
  return INGREDIENTS.find(i => i.id === id);
}
export function getIngredientData(name: string): Ingredient | undefined {
  return INGREDIENTS.find(i => i.name === name); // Uses name property now inherited from Item
}


// Calculate growth modifier based on growing conditions
export function calculateGrowthModifier(/*... unchanged ...*/) {
    // ... (implementation remains the same) ...
}
// Calculate harvest quality based on growing conditions and plant state
export function calculateHarvestQuality(/*... unchanged ...*/) {
    // ... (implementation remains the same) ...
}
// Check for mutation
export function checkForMutation(ingredient: Ingredient, weather: WeatherFate, moonPhase: MoonPhase): string | null {
  // ... (implementation remains the same, uses name inherited from Item) ...
    if (!ingredient.mutationChance || !ingredient.mutationTypes || ingredient.mutationTypes.length === 0) return null;
    let currentMutationChance = ingredient.mutationChance;
    if (moonPhase === "Full Moon" || moonPhase === "New Moon") currentMutationChance *= 1.5;
    if (weather === "stormy" || weather === "windy") currentMutationChance *= 1.3;
    if (Math.random() < currentMutationChance) {
        const mutationIndex = Math.floor(Math.random() * ingredient.mutationTypes.length);
        const mutationType = ingredient.mutationTypes[mutationIndex];
        console.log(`MUTATION! ${ingredient.name} -> ${mutationType} (Chance: ${currentMutationChance.toFixed(3)})`); // Uses name
        return mutationType;
    } return null;
}
// Get growth stage description
export function getGrowthStageDescription(/*... unchanged ...*/) {
    // ... (implementation remains the same) ...
}
// --- Category/Filtering Helpers ---
export function groupIngredientsByCategory(): Record<ItemCategory, Ingredient[]> {
    // ... (implementation remains the same) ...
}
export function getSeasonalIngredients(season: Season): Ingredient[] {
  return INGREDIENTS.filter(ing => ing.bestSeason === season);
}
export function getMoonPhaseIngredients(phase: MoonPhase): Ingredient[] {
  return INGREDIENTS.filter(ing => ing.idealMoonPhase === phase);
}