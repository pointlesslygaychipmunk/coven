// src/ingredients.ts
// Defines all plant ingredients, their properties, and growth requirements

// Using package name import - assuming pnpm links it correctly
import { ItemCategory, Season, MoonPhase, WeatherFate, Item, Rarity } from "coven-shared";

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

export function calculateGrowthModifier( ingredient: Ingredient, currentSeason: Season, currentMoonPhase: MoonPhase, moisture: number, sunlight: number = 70 ): { growthModifier: number; factors: string[] } {
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

export function calculateHarvestQuality( ingredient: Ingredient, plantHealth: number, plantAge: number, harvestMoonPhase: MoonPhase, harvestSeason: Season ): { quality: number; bonusFactors: string[] } {
    const bonusFactors: string[] = []; let quality = 50;
    const healthBonus = (plantHealth - 50) * 0.5; quality += healthBonus; bonusFactors.push(`Health(${plantHealth}): ${healthBonus >= 0 ? '+' : ''}${healthBonus.toFixed(0)}`);
    const optimalAge = (ingredient.growthTime || 3) * 1.5; const ageFactor = Math.min(1.0, plantAge / optimalAge);
    const ageQualityBonus = ageFactor * 15; quality += ageQualityBonus; if (ageQualityBonus > 5) bonusFactors.push(`Age(${plantAge}): +${ageQualityBonus.toFixed(0)}`);
    if (ingredient.idealMoonPhase && harvestMoonPhase === ingredient.idealMoonPhase) { quality += 20; bonusFactors.push(`Moon(${harvestMoonPhase}): +20`); }
    else if (harvestMoonPhase === "Full Moon") { quality += 5; bonusFactors.push(`Full Moon: +5`); }
    if (harvestSeason === ingredient.bestSeason) { quality += 10; bonusFactors.push(`Season(${harvestSeason}): +10`); }
    else if (harvestSeason === ingredient.worstSeason) { quality -= 15; bonusFactors.push(`Season(${harvestSeason}): -15`); }
    if (ingredient.harvestBonus && ( (ingredient.idealMoonPhase && harvestMoonPhase === ingredient.idealMoonPhase) || harvestSeason === ingredient.bestSeason) ) { if (ingredient.harvestBonus.toLowerCase().includes("quality") || ingredient.harvestBonus.toLowerCase().includes("potent")) { quality += 10; bonusFactors.push(`Bonus: +10`); } }
    quality = Math.round(Math.min(100, Math.max(10, quality)));
    return { quality, bonusFactors };
}

export function checkForMutation(ingredient: Ingredient, weather: WeatherFate, moonPhase: MoonPhase): string | null {
    if (!ingredient.mutationChance || !ingredient.mutationTypes || ingredient.mutationTypes.length === 0) return null;
    let currentMutationChance = ingredient.mutationChance;
    if (moonPhase === "Full Moon" || moonPhase === "New Moon") currentMutationChance *= 1.5;
    if (weather === "stormy" || weather === "windy") currentMutationChance *= 1.3;
    if (Math.random() < currentMutationChance) {
        const mutationIndex = Math.floor(Math.random() * ingredient.mutationTypes.length);
        const mutationType = ingredient.mutationTypes[mutationIndex];
        console.log(`MUTATION! ${ingredient.name} -> ${mutationType} (Chance: ${currentMutationChance.toFixed(3)})`);
        return mutationType;
    } return null;
}

export function getGrowthStageDescription( plantName: string, currentGrowth: number | undefined, maxGrowth: number | undefined ): string {
    if (currentGrowth === undefined || maxGrowth === undefined || maxGrowth <= 0) return `${plantName} (Growth stage unknown)`;
    const percentage = Math.min(100, Math.max(0, (currentGrowth / maxGrowth) * 100));
    if (percentage >= 100) return `Mature ${plantName}`; if (percentage >= 75) return `Maturing ${plantName}`; if (percentage >= 50) return `Developing ${plantName}`; if (percentage >= 25) return `Sprouting ${plantName}`; if (percentage > 0) return `Seedling ${plantName}`; return `Planted ${plantName} Seed`;
}

export function groupIngredientsByCategory(): Record<ItemCategory, Ingredient[]> {
    const grouped: Partial<Record<ItemCategory, Ingredient[]>> = {};
    const ingredientCategories: ItemCategory[] = ['herb', 'flower', 'root', 'fruit', 'mushroom', 'leaf', 'succulent', 'essence', 'crystal'];
    INGREDIENTS.forEach(ingredient => { if (ingredient && ingredient.category) { const category = ingredient.category; if (ingredientCategories.includes(category)) { if (!grouped[category]) grouped[category] = []; grouped[category]!.push(ingredient); } } else { console.warn(`Skipping ingredient due to missing data: ${ingredient?.id}`); } });
    ingredientCategories.forEach(cat => { if (!grouped[cat]) grouped[cat] = []; });
    return grouped as Record<ItemCategory, Ingredient[]>;
}

export function getSeasonalIngredients(season: Season): Ingredient[] { return INGREDIENTS.filter(ing => ing.bestSeason === season); }
export function getMoonPhaseIngredients(phase: MoonPhase): Ingredient[] { return INGREDIENTS.filter(ing => ing.idealMoonPhase === phase); }

// REMOVED Duplicate function definitions that previously started around line 70