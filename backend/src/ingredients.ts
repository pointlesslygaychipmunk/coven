// src/ingredients.ts
// Defines all plant ingredients, their properties, and growth requirements

import { ItemCategory, Season, MoonPhase, WeatherFate, Item /*, Rarity */ } from "../shared/src/index.js"; // Rarity unused here

// Ingredient now inherits 'name', 'value', 'description', 'id', 'rarity' from Item
export interface Ingredient extends Item {
  type: 'ingredient';
  category: ItemCategory;
  growthTime: number;
  primaryProperty: string;
  secondaryProperty?: string;
  bestSeason: Season;
  worstSeason: Season;
  idealMoonPhase?: MoonPhase;
  idealMoisture: number;
  idealSunlight?: number;
  hanbangUsage?: string;
  harvestBonus?: string;
  mutationChance?: number;
  mutationTypes?: string[];
}

// Define all available ingredients providing all properties required by Item + Ingredient
export const INGREDIENTS: Ingredient[] = [
  { id: "ing_glimmerroot", name: "Glimmerroot", type: "ingredient", category: "root", rarity: 'common', value: 12, description: "A luminous root...", growthTime: 4, primaryProperty: "firming", secondaryProperty: "brightening", bestSeason: "Spring", worstSeason: "Winter", idealMoonPhase: "Waxing Gibbous", idealMoisture: 60, idealSunlight: 80, hanbangUsage: "Strengthens skin's structural integrity.", harvestBonus: "Enhanced firming compounds...", },
  { id: "ing_moonbud", name: "Moonbud", type: "ingredient", category: "flower", rarity: 'common', value: 10, description: "A silver-petaled flower...", growthTime: 3, primaryProperty: "brightening", secondaryProperty: "rejuvenating", bestSeason: "Winter", worstSeason: "Summer", idealMoonPhase: "Full Moon", idealMoisture: 70, idealSunlight: 40, hanbangUsage: "Illuminates complexion...", harvestBonus: "Enhanced luminosity...", mutationChance: 0.1, mutationTypes: ["Prismatic", "EternalBloom"], },
  { id: "ing_silverleaf", name: "Silverleaf", type: "ingredient", category: "leaf", rarity: 'common', value: 8, description: "Delicate silver-blue leaves...", growthTime: 2, primaryProperty: "soothing", secondaryProperty: "balancing", bestSeason: "Fall", worstSeason: "Summer", idealMoonPhase: "Waning Crescent", idealMoisture: 50, idealSunlight: 60, hanbangUsage: "Cools and calms inflammation.", },
  { id: "ing_sunpetal", name: "Sunpetal", type: "ingredient", category: "flower", rarity: 'common', value: 8, description: "Vibrant yellow flowers...", growthTime: 3, primaryProperty: "energizing", secondaryProperty: "protective", bestSeason: "Summer", worstSeason: "Winter", idealMoonPhase: "First Quarter", idealMoisture: 50, idealSunlight: 90, hanbangUsage: "Protects from environmental damage.", },
  { id: "ing_nightcap", name: "Nightcap", type: "ingredient", category: "mushroom", rarity: 'uncommon', value: 9, description: "A deep purple mushroom...", growthTime: 2, primaryProperty: "hydrating", secondaryProperty: "detoxifying", bestSeason: "Fall", worstSeason: "Spring", idealMoonPhase: "New Moon", idealMoisture: 80, idealSunlight: 20, hanbangUsage: "Draws moisture...", mutationChance: 0.15, mutationTypes: ["LuminousSpores", "MidnightBloom"], },
  { id: "ing_everdew", name: "Everdew", type: "ingredient", category: "succulent", rarity: 'uncommon', value: 14, description: "A succulent that constantly produces...", growthTime: 4, primaryProperty: "hydrating", secondaryProperty: "cooling", bestSeason: "Summer", worstSeason: "Winter", idealMoonPhase: "Waxing Crescent", idealMoisture: 30, idealSunlight: 70, hanbangUsage: "Maintains skin moisture balance.", },
  { id: "ing_sweetshade", name: "Sweetshade", type: "ingredient", category: "herb", rarity: 'common', value: 11, description: "A pale, sweet-smelling herb...", growthTime: 3, primaryProperty: "soothing", secondaryProperty: "balancing", bestSeason: "Spring", worstSeason: "Fall", idealMoisture: 60, idealSunlight: 50, hanbangUsage: "Traditional remedy for sensitive skin.", },
  { id: "ing_emberberry", name: "Emberberry", type: "ingredient", category: "fruit", rarity: 'uncommon', value: 13, description: "Small red berries...", growthTime: 2, primaryProperty: "energizing", secondaryProperty: "exfoliating", bestSeason: "Summer", worstSeason: "Winter", idealMoonPhase: "Waxing Gibbous", idealMoisture: 50, idealSunlight: 80, hanbangUsage: "Boosts renewal in formulations.", },
  { id: "ing_ancient_ginseng", name: "Ancient Ginseng", type: "ingredient", category: "root", rarity: 'rare', value: 25, description: "A rare and potent form...", growthTime: 5, primaryProperty: "rejuvenating", secondaryProperty: "nourishing", bestSeason: "Fall", worstSeason: "Spring", idealMoonPhase: "Full Moon", idealMoisture: 70, idealSunlight: 60, hanbangUsage: "Cornerstone of Hanbang skincare.", harvestBonus: "Maximum beneficial compounds.", },
  { id: "ing_sacred_lotus", name: "Sacred Lotus", type: "ingredient", category: "flower", rarity: 'rare', value: 18, description: "Pure white flowers...", growthTime: 4, primaryProperty: "purifying", secondaryProperty: "brightening", bestSeason: "Summer", worstSeason: "Winter", idealMoonPhase: "Full Moon", idealMoisture: 90, idealSunlight: 70, hanbangUsage: "Symbolizes purity.", harvestBonus: "Enhanced brightening compounds.", },
  // Seasonal Ingredients
  { id: "ing_spring_root", name: "Spring Root", type: "ingredient", category: "root", rarity: 'uncommon', value: 15, description: "A tender root...", growthTime: 3, primaryProperty: "revitalizing", bestSeason: "Spring", worstSeason: "Fall", idealMoisture: 65 },
  { id: "ing_dewblossom", name: "Dewblossom", type: "ingredient", category: "flower", rarity: 'uncommon', value: 16, description: "Ephemeral spring flower...", growthTime: 2, primaryProperty: "hydrating", secondaryProperty: "refreshing", bestSeason: "Spring", worstSeason: "Fall", idealMoisture: 75 },
  { id: "ing_sunthorn", name: "Sunthorn", type: "ingredient", category: "herb", rarity: 'uncommon', value: 12, description: "A prickly herb...", growthTime: 3, primaryProperty: "protective", secondaryProperty: "resilience", bestSeason: "Summer", worstSeason: "Winter", idealMoisture: 40, idealSunlight: 95 },
  { id: "ing_dragon_petal", name: "Dragon Petal", type: "ingredient", category: "flower", rarity: 'rare', value: 18, description: "Fiery summer bloom...", growthTime: 4, primaryProperty: "energizing", secondaryProperty: "firming", bestSeason: "Summer", worstSeason: "Winter", idealMoisture: 55 },
  { id: "ing_autumnleaf", name: "Autumnleaf", type: "ingredient", category: "leaf", rarity: 'uncommon', value: 11, description: "Leaves with the colours of fall...", growthTime: 2, primaryProperty: "anti-aging", secondaryProperty: "protective", bestSeason: "Fall", worstSeason: "Spring", idealMoisture: 50 },
  { id: "ing_twilight_berry", name: "Twilight Berry", type: "ingredient", category: "fruit", rarity: 'uncommon', value: 15, description: "Dark berries...", growthTime: 3, primaryProperty: "soothing", secondaryProperty: "balancing", bestSeason: "Fall", worstSeason: "Spring", idealMoisture: 60 },
  { id: "ing_frostherb", name: "Frostherb", type: "ingredient", category: "herb", rarity: 'rare', value: 16, description: "A hardy herb...", growthTime: 4, primaryProperty: "resilience", secondaryProperty: "protective", bestSeason: "Winter", worstSeason: "Summer", idealMoisture: 45 },
  { id: "ing_snow_lotus", name: "Snow Lotus", type: "ingredient", category: "flower", rarity: 'rare', value: 20, description: "A rare lotus...", growthTime: 5, primaryProperty: "purifying", secondaryProperty: "brightening", bestSeason: "Winter", worstSeason: "Summer", idealMoisture: 80 },
];

export interface SeedItem extends Item { type: 'seed'; category: 'seed'; plantSource: string; }

export const SEEDS: SeedItem[] = INGREDIENTS.map(ing => ({
  id: `seed_${ing.name.toLowerCase().replace(/\s+/g, '_')}`,
  name: `${ing.name} Seed`,
  type: "seed", category: "seed",
  value: Math.max(3, Math.floor((ing.value ?? 10) / 2)),
  description: `Seeds for growing ${ing.name}. Prefers ${ing.bestSeason}.`,
  rarity: ing.rarity, plantSource: ing.id,
}));

// --- Helper Functions ---
export function getIngredientById(id: string): Ingredient | undefined { return INGREDIENTS.find(i => i.id === id); }
export function getIngredientData(name: string): Ingredient | undefined { return INGREDIENTS.find(i => i.name === name); }
export function calculateGrowthModifier( ingredient: Ingredient, currentSeason: Season, currentMoonPhase: MoonPhase, moisture: number, sunlight: number = 70 ): { growthModifier: number; factors: string[] } { /* ... */ }
export function calculateHarvestQuality( ingredient: Ingredient, plantHealth: number, plantAge: number, harvestMoonPhase: MoonPhase, harvestSeason: Season ): { quality: number; bonusFactors: string[] } { /* ... */ }
export function checkForMutation(ingredient: Ingredient, weather: WeatherFate, moonPhase: MoonPhase): string | null { /* ... */ }
export function getGrowthStageDescription( plantName: string, currentGrowth: number | undefined, maxGrowth: number | undefined ): string { /* ... */ }
export function groupIngredientsByCategory(): Record<ItemCategory, Ingredient[]> { /* ... */ }
export function getSeasonalIngredients(season: Season): Ingredient[] { return INGREDIENTS.filter(ing => ing.bestSeason === season); }
export function getMoonPhaseIngredients(phase: MoonPhase): Ingredient[] { return INGREDIENTS.filter(ing => ing.idealMoonPhase === phase); }

// Implementation details for functions above (copied from previous version for brevity)
export function calculateGrowthModifier(/* ... */): { growthModifier: number; factors: string[] } { /* ... implementation ... */ }
export function calculateHarvestQuality(/* ... */): { quality: number; bonusFactors: string[] } { /* ... implementation ... */ }
export function checkForMutation(/* ... */): string | null { /* ... implementation ... */ }
export function getGrowthStageDescription(/* ... */): string { /* ... implementation ... */ }
export function groupIngredientsByCategory(): Record<ItemCategory, Ingredient[]> { /* ... implementation ... */ }