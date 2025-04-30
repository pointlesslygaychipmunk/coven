// src/ingredients.ts
// Defines all plant ingredients, their properties, and growth requirements

import { ItemCategory, Season, MoonPhase, WeatherFate, Item, Rarity } from "coven-shared";

// Ingredient now inherits 'name', 'value', 'description', 'id', 'rarity' from Item
export interface Ingredient extends Item {
  type: 'ingredient';
  // category: ItemCategory; // Already mandatory in Item
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


// Define all available ingredients - only list properties specific to Ingredient
// or those overriding/defining base Item properties.
export const INGREDIENTS: Ingredient[] = [
  {
    id: "ing_glimmerroot", name: "Glimmerroot", description: "A luminous root that grows stronger in sunlight. Provides firmness.", value: 12, type: "ingredient", category: "root", rarity: 'common',
    growthTime: 4, primaryProperty: "firming", secondaryProperty: "brightening", bestSeason: "Spring", worstSeason: "Winter",
    idealMoonPhase: "Waxing Gibbous", idealMoisture: 60, idealSunlight: 80,
    hanbangUsage: "Strengthens skin's structural integrity.",
    harvestBonus: "Enhanced firming compounds when harvested during Waxing Gibbous.",
  },
  {
    id: "ing_moonbud", name: "Moonbud", description: "A silver-petaled flower that blooms at night, absorbing moonlight.", value: 10, type: "ingredient", category: "flower", rarity: 'common',
    growthTime: 3, primaryProperty: "brightening", secondaryProperty: "rejuvenating", bestSeason: "Winter", worstSeason: "Summer",
    idealMoonPhase: "Full Moon", idealMoisture: 70, idealSunlight: 40,
    hanbangUsage: "Illuminates complexion, used in royal court rituals.",
    harvestBonus: "Harvesting during Full Moon grants enhanced luminosity.",
    mutationChance: 0.1, mutationTypes: ["Prismatic", "EternalBloom"],
  },
   {
    id: "ing_silverleaf", name: "Silverleaf", description: "Delicate silver-blue leaves. Excellent for sensitive skin.", value: 8, type: "ingredient", category: "leaf", rarity: 'common',
    growthTime: 2, primaryProperty: "soothing", secondaryProperty: "balancing", bestSeason: "Fall", worstSeason: "Summer",
    idealMoonPhase: "Waning Crescent", idealMoisture: 50, idealSunlight: 60,
    hanbangUsage: "Cools and calms inflammation.",
  },
  {
    id: "ing_sunpetal", name: "Sunpetal", description: "Vibrant yellow flowers that follow the sun. Fills potions with vitality.", value: 8, type: "ingredient", category: "flower", rarity: 'common',
    growthTime: 3, primaryProperty: "energizing", secondaryProperty: "protective", bestSeason: "Summer", worstSeason: "Winter",
    idealMoonPhase: "First Quarter", idealMoisture: 50, idealSunlight: 90,
    hanbangUsage: "Protects from environmental damage.",
  },
   {
    id: "ing_nightcap", name: "Nightcap", description: "A deep purple mushroom that only grows in shade. Provides deep hydration.", value: 9, type: "ingredient", category: "mushroom", rarity: 'uncommon',
    growthTime: 2, primaryProperty: "hydrating", secondaryProperty: "detoxifying", bestSeason: "Fall", worstSeason: "Spring",
    idealMoonPhase: "New Moon", idealMoisture: 80, idealSunlight: 20,
    hanbangUsage: "Draws moisture into the deepest skin layers.",
    mutationChance: 0.15, mutationTypes: ["LuminousSpores", "MidnightBloom"],
  },
   {
    id: "ing_everdew", name: "Everdew", description: "A succulent that constantly produces tiny droplets of moisture.", value: 14, type: "ingredient", category: "succulent", rarity: 'uncommon',
    growthTime: 4, primaryProperty: "hydrating", secondaryProperty: "cooling", bestSeason: "Summer", worstSeason: "Winter",
    idealMoonPhase: "Waxing Crescent", idealMoisture: 30, idealSunlight: 70,
    hanbangUsage: "Maintains skin moisture balance in heat.",
  },
   {
    id: "ing_sweetshade", name: "Sweetshade", description: "A pale, sweet-smelling herb that grows in dappled light. Has calming properties.", value: 11, type: "ingredient", category: "herb", rarity: 'common',
    growthTime: 3, primaryProperty: "soothing", secondaryProperty: "balancing", bestSeason: "Spring", worstSeason: "Fall",
    idealMoisture: 60, idealSunlight: 50,
    hanbangUsage: "Traditional remedy for sensitive, irritated skin.",
  },
  {
    id: "ing_emberberry", name: "Emberberry", description: "Small red berries that feel warm. Stimulates circulation and renewal.", value: 13, type: "ingredient", category: "fruit", rarity: 'uncommon',
    growthTime: 2, primaryProperty: "energizing", secondaryProperty: "exfoliating", bestSeason: "Summer", worstSeason: "Winter",
    idealMoonPhase: "Waxing Gibbous", idealMoisture: 50, idealSunlight: 80,
    hanbangUsage: "Boosts renewal in formulations for mature skin.",
  },
   {
    id: "ing_ancient_ginseng", name: "Ancient Ginseng", description: "A rare and potent form of ginseng with powerful rejuvenating properties.", value: 25, type: "ingredient", category: "root", rarity: 'rare',
    growthTime: 5, primaryProperty: "rejuvenating", secondaryProperty: "nourishing", bestSeason: "Fall", worstSeason: "Spring",
    idealMoonPhase: "Full Moon", idealMoisture: 70, idealSunlight: 60,
    hanbangUsage: "Cornerstone of Hanbang skincare, believed to harmonize energy.",
    harvestBonus: "Harvesting after 5+ turns yields maximum beneficial compounds.",
  },
  {
    id: "ing_sacred_lotus", name: "Sacred Lotus", description: "Pure white flowers growing from muddy waters yet remaining pristine.", value: 18, type: "ingredient", category: "flower", rarity: 'rare',
    growthTime: 4, primaryProperty: "purifying", secondaryProperty: "brightening", bestSeason: "Summer", worstSeason: "Winter",
    idealMoonPhase: "Full Moon", idealMoisture: 90, idealSunlight: 70,
    hanbangUsage: "Symbolizes purity; used for brightening.",
    harvestBonus: "Harvesting at dawn enhances brightening compounds.",
  },
  // --- Seasonal Ingredients ---
  {
    id: "ing_spring_root", name: "Spring Root", description: "A tender root harvested only in spring, bursting with renewal energy.", value: 15, type: "ingredient", category: "root", rarity: 'uncommon',
    growthTime: 3, primaryProperty: "revitalizing", bestSeason: "Spring", worstSeason: "Fall", idealMoisture: 65
  },
   {
    id: "ing_dewblossom", name: "Dewblossom", description: "Ephemeral spring flower that captures morning dew.", value: 16, type: "ingredient", category: "flower", rarity: 'uncommon',
    growthTime: 2, primaryProperty: "hydrating", secondaryProperty: "refreshing", bestSeason: "Spring", worstSeason: "Fall", idealMoisture: 75
  },
  {
    id: "ing_sunthorn", name: "Sunthorn", description: "A prickly herb thriving in summer heat, offers skin protection.", value: 12, type: "ingredient", category: "herb", rarity: 'uncommon',
    growthTime: 3, primaryProperty: "protective", secondaryProperty: "resilience", bestSeason: "Summer", worstSeason: "Winter", idealMoisture: 40, idealSunlight: 95
  },
  {
    id: "ing_dragon_petal", name: "Dragon Petal", description: "Fiery summer bloom known for its stimulating properties.", value: 18, type: "ingredient", category: "flower", rarity: 'rare',
    growthTime: 4, primaryProperty: "energizing", secondaryProperty: "firming", bestSeason: "Summer", worstSeason: "Winter", idealMoisture: 55
  },
    {
    id: "ing_autumnleaf", name: "Autumnleaf", description: "Leaves with the colours of fall, rich in preserving antioxidants.", value: 11, type: "ingredient", category: "leaf", rarity: 'uncommon',
    growthTime: 2, primaryProperty: "anti-aging", secondaryProperty: "protective", bestSeason: "Fall", worstSeason: "Spring", idealMoisture: 50
  },
  {
    id: "ing_twilight_berry", name: "Twilight Berry", description: "Dark berries harvested in autumn twilight, possess calming properties.", value: 15, type: "ingredient", category: "fruit", rarity: 'uncommon',
    growthTime: 3, primaryProperty: "soothing", secondaryProperty: "balancing", bestSeason: "Fall", worstSeason: "Spring", idealMoisture: 60
  },
  {
    id: "ing_frostherb", name: "Frostherb", description: "A hardy herb that glitters with frost in winter, highly resilient.", value: 16, type: "ingredient", category: "herb", rarity: 'rare',
    growthTime: 4, primaryProperty: "resilience", secondaryProperty: "protective", bestSeason: "Winter", worstSeason: "Summer", idealMoisture: 45
  },
   {
    id: "ing_snow_lotus", name: "Snow Lotus", description: "A rare lotus blooming amidst snow, exceptionally purifying.", value: 20, type: "ingredient", category: "flower", rarity: 'rare',
    growthTime: 5, primaryProperty: "purifying", secondaryProperty: "brightening", bestSeason: "Winter", worstSeason: "Summer", idealMoisture: 80
  },
];

// Define SeedItem based on Item
export interface SeedItem extends Item {
    type: 'seed';
    category: 'seed';
    plantSource: string;
}

export const SEEDS: SeedItem[] = INGREDIENTS.map(ing => ({
  // Base properties (id, name, value, description, rarity) are now defined in Item via shared/types.ts
  id: `seed_${ing.name.toLowerCase().replace(/\s+/g, '_')}`,
  name: `${ing.name} Seed`,
  type: "seed",
  category: "seed",
  plantSource: ing.id,
  value: Math.max(3, Math.floor((ing.value ?? 10) / 2)),
  description: `Seeds for growing ${ing.name}. Prefers ${ing.bestSeason}.`,
  rarity: ing.rarity,
}));


// --- Helper Functions ---

export function getIngredientById(id: string): Ingredient | undefined {
  return INGREDIENTS.find(i => i.id === id);
}
export function getIngredientData(name: string): Ingredient | undefined {
  return INGREDIENTS.find(i => i.name === name);
}


// Calculate growth modifier based on growing conditions
export function calculateGrowthModifier(
  ingredient: Ingredient,
  currentSeason: Season,
  currentMoonPhase: MoonPhase,
  moisture: number,
  sunlight: number = 70
): {
  growthModifier: number;
  factors: string[];
} {
  // ... (implementation remains the same) ...
    const factors: string[] = []; let modifier = 1.0;
    if (currentSeason === ingredient.bestSeason) { modifier *= 1.5; factors.push(`Optimal season (${currentSeason}): +50% growth`); }
    else if (currentSeason === ingredient.worstSeason) { modifier *= 0.5; factors.push(`Challenging season (${currentSeason}): -50% growth`); }
    else { factors.push(`Neutral season (${currentSeason})`); }
    if (currentMoonPhase === "Waxing Gibbous" || currentMoonPhase === "First Quarter") { modifier *= 1.1; factors.push(`Waxing moon phase (${currentMoonPhase}): +10% growth`); }
    else if (currentMoonPhase === "Waning Crescent") { modifier *= 0.95; factors.push(`Waning Crescent phase: -5% growth`); }
    const idealMoistureMidpoint = ingredient.idealMoisture; const moistureDifference = Math.abs(moisture - idealMoistureMidpoint);
    if (moistureDifference < 10) modifier *= 1.2; else if (moistureDifference > 30) modifier *= 0.7; else if (moistureDifference > 20) modifier *= 0.9;
    if (ingredient.idealSunlight !== undefined) { const idealSun = ingredient.idealSunlight; const sunlightDifference = Math.abs(sunlight - idealSun); if (sunlightDifference < 15) modifier *= 1.15; else if (sunlightDifference > 40) modifier *= 0.75; else if (sunlightDifference > 25) modifier *= 0.9; }
    else { if(sunlight > 40 && sunlight < 80) modifier *= 1.05; }
    modifier = Math.max(0.1, modifier);
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
  // ... (implementation remains the same) ...
    const bonusFactors: string[] = []; let quality = 50;
    const healthBonus = (plantHealth - 50) * 0.5; quality += healthBonus; bonusFactors.push(`Plant health (${plantHealth}%): ${healthBonus >= 0 ? '+' : ''}${healthBonus.toFixed(0)}`);
    const optimalAge = (ingredient.growthTime || 3) * 1.5; const ageFactor = Math.min(1.0, plantAge / optimalAge); const ageQualityBonus = ageFactor * 15; quality += ageQualityBonus; if (ageQualityBonus > 5) bonusFactors.push(`Plant age (${plantAge} turns): +${ageQualityBonus.toFixed(0)}`);
    if (ingredient.idealMoonPhase && harvestMoonPhase === ingredient.idealMoonPhase) { quality += 20; bonusFactors.push(`Ideal moon phase (${harvestMoonPhase}): +20`); }
    else if (harvestMoonPhase === "Full Moon") { quality += 5; bonusFactors.push(`Full Moon harvest: +5`); }
    if (harvestSeason === ingredient.bestSeason) { quality += 10; bonusFactors.push(`Best season (${harvestSeason}): +10`); }
    else if (harvestSeason === ingredient.worstSeason) { quality -= 15; bonusFactors.push(`Worst season (${harvestSeason}): -15`); }
    if (ingredient.harvestBonus && ( (ingredient.idealMoonPhase && harvestMoonPhase === ingredient.idealMoonPhase) || harvestSeason === ingredient.bestSeason) ) { if (ingredient.harvestBonus.toLowerCase().includes("quality") || ingredient.harvestBonus.toLowerCase().includes("potent")) { quality += 10; bonusFactors.push(`Special harvest bonus (+10): ${ingredient.harvestBonus}`); } }
    quality = Math.round(Math.min(100, Math.max(10, quality)));
    return { quality, bonusFactors };
}


// Check for mutation
export function checkForMutation(ingredient: Ingredient, weather: WeatherFate, moonPhase: MoonPhase): string | null {
    if (!ingredient.mutationChance || !ingredient.mutationTypes || ingredient.mutationTypes.length === 0) return null;
    let currentMutationChance = ingredient.mutationChance;
    if (moonPhase === "Full Moon" || moonPhase === "New Moon") currentMutationChance *= 1.5;
    if (weather === "stormy" || weather === "windy") currentMutationChance *= 1.3;
    if (Math.random() < currentMutationChance) {
        const mutationIndex = Math.floor(Math.random() * ingredient.mutationTypes.length);
        const mutationType = ingredient.mutationTypes[mutationIndex];
        // Use inherited name property
        console.log(`MUTATION! ${ingredient.name} -> ${mutationType} (Chance: ${currentMutationChance.toFixed(3)})`);
        return mutationType;
    } return null;
}

// Get growth stage description
export function getGrowthStageDescription(
  plantName: string,
  currentGrowth: number | undefined,
  maxGrowth: number | undefined
): string {
  // ... (implementation remains the same) ...
    if (currentGrowth === undefined || maxGrowth === undefined || maxGrowth <= 0) return `${plantName} (Growth stage unknown)`;
    const percentage = Math.min(100, Math.max(0, (currentGrowth / maxGrowth) * 100));
    if (percentage >= 100) return `Mature ${plantName}`;
    if (percentage >= 75) return `Maturing ${plantName}`;
    if (percentage >= 50) return `Developing ${plantName}`;
    if (percentage >= 25) return `Sprouting ${plantName}`;
    if (percentage > 0) return `Seedling ${plantName}`;
    return `Planted ${plantName} Seed`;
}

// --- Category/Filtering Helpers ---
export function groupIngredientsByCategory(): Record<ItemCategory, Ingredient[]> {
  // ... (implementation remains the same) ...
    const grouped: Partial<Record<ItemCategory, Ingredient[]>> = {};
    const ingredientCategories: ItemCategory[] = ['herb', 'flower', 'root', 'fruit', 'mushroom', 'leaf', 'succulent', 'essence', 'crystal'];
    INGREDIENTS.forEach(ingredient => { if (ingredient && ingredient.category) { const category = ingredient.category; if (ingredientCategories.includes(category)) { if (!grouped[category]) grouped[category] = []; grouped[category]!.push(ingredient); } } else { console.warn(`Skipping ingredient due to missing data: ${ingredient?.id}`); } });
    ingredientCategories.forEach(cat => { if (!grouped[cat]) grouped[cat] = []; });
    return grouped as Record<ItemCategory, Ingredient[]>;
}
export function getSeasonalIngredients(season: Season): Ingredient[] {
  return INGREDIENTS.filter(ing => ing.bestSeason === season);
}
export function getMoonPhaseIngredients(phase: MoonPhase): Ingredient[] {
  return INGREDIENTS.filter(ing => ing.idealMoonPhase === phase);
}