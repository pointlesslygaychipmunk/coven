import { 
  Season, 
  MoonPhase, 
  WeatherFate as WeatherCondition,
  Plant,
  GardenSlot,
  ItemCategory,
  Rarity as ItemQuality,
  ItemType,
  Skills,
  InventoryItem
} from '../../shared/src/types.js';

// Additional type definitions
type PlantStage = 'seed' | 'seedling' | 'growing' | 'flowering' | 'mature';

interface Ingredient {
  id: string;
  name: string;
  quality: ItemQuality;
  harvestedAt: number;
  sourceType: string;
  sourceId: string;
  traits: string[];
  [key: string]: any;
}

interface PlantVariety {
  id: string;
  name: string;
  baseQuality?: number;
  baseYield?: number;
  growthTimeDays?: number;
  preferredSeason: Season;
  baseTraits?: PlantTrait[];
  category?: string;
  [key: string]: any;
}

// Interactive Garden System
// -------------------------
// Transforms gardening from passive to active gameplay with mini-games,
// cross-breeding systems, weather challenges, and seasonal cycles

// Constants for garden gameplay
const GROWTH_CYCLE_BASE_TIME = 24; // hours
const MINI_GAME_TIME_BONUS_MAX = 0.4; // 40% time reduction max
const WEATHER_EFFECT_MULTIPLIERS: Record<WeatherCondition, number> = {
  clear: 1.0,
  cloudy: 0.9,
  rainy: 1.3,
  stormy: 0.7,
  snowy: 0.5,
  windy: 0.8,
  foggy: 0.85,
  sunny: 1.2,
  normal: 1.0,
  dry: 0.8
};

const SEASONAL_AFFINITY: Record<Season, string[]> = {
  Spring: ['floral', 'green', 'fresh'],
  Summer: ['fruity', 'vibrant', 'warm'],
  Fall: ['earthy', 'spicy', 'woody'],
  Winter: ['cool', 'crisp', 'soothing']
};

const LUNAR_POTENCY: Record<MoonPhase, number> = {
  'New Moon': 0.8,
  'Waxing Crescent': 0.9,
  'First Quarter': 1.0,
  'Waxing Gibbous': 1.1,
  'Full Moon': 1.3,
  'Waning Gibbous': 1.1,
  'Last Quarter': 1.0,
  'Waning Crescent': 0.9
};

// Mini-games interface
export interface MiniGameResult {
  success: boolean;
  timingBonus: number;
  qualityBonus: number;
  yieldBonus: number;
  uniqueTraitChance: number;
}

export interface PlantingMiniGame extends MiniGameResult {
  soilQuality: number;
  wateringLevel: number;
  spacingScore: number;
}

export interface HarvestingMiniGame extends MiniGameResult {
  precisionScore: number;
  speedScore: number;
  carefulnessScore: number;
}

export interface WateringMiniGame extends MiniGameResult {
  distributionScore: number;
  amountScore: number;
  techniqueScore: number;
}

export interface WeatherProtectionMiniGame extends MiniGameResult {
  reactionTime: number;
  coverageScore: number;
  reinforcementScore: number;
}

// Interactive plant data
export interface InteractivePlant {
  id: string;
  varietyId: string;
  plotId: string;
  currentStage: PlantStage;
  health: number;
  growthProgress: number;
  waterLevel: number;
  nextActionTime: number;
  predictedQuality: ItemQuality;
  predictedYield: number;
  geneticTraits: PlantTrait[];
  growthModifiers: GrowthModifier[];
  lastInteraction: number;
  createdAt: number;
  careHistory: PlantCareAction[];
  name?: string;
  mature?: boolean;
  category?: string;
  moonBlessed?: boolean;
  seasonalModifier?: number;
  growth?: number;
  maxGrowth?: number;
  age?: number;
}

export interface PlantTrait {
  id: string;
  name: string;
  description: string;
  effect: string;
  qualityModifier: number;
  yieldModifier: number;
  growthTimeModifier: number;
  rarityTier: number;
  dominant: boolean;
}

export interface GrowthModifier {
  source: string;
  description: string;
  qualityModifier: number;
  yieldModifier: number;
  growthRateModifier: number;
  expiresAt?: number;
}

export interface PlantCareAction {
  timestamp: number;
  action: 'plant' | 'water' | 'fertilize' | 'prune' | 'harvest' | 'protect';
  success: boolean;
  score: number;
  notes: string;
}

// Cross-breeding system
export interface CrossBreedingResult {
  success: boolean;
  newVarietyId?: string;
  newVarietyName?: string;
  traitInheritance?: {
    fromParent1: PlantTrait[];
    fromParent2: PlantTrait[];
    newMutations: PlantTrait[];
  };
  rarityTier: number;
  message?: string;
}

// Functions for interactive garden gameplay

/**
 * Initiates a planting mini-game and returns the result of player's performance
 * Affects initial growth conditions and potential quality
 */
export function playPlantingMiniGame(
  player: { id: string; gardeningSkill: number },
  plot: GardenSlot,
  varietyId: string,
  playScore: { timing: number; precision: number; pattern: number }
): PlantingMiniGame {
  // Calculate base success chance based on player skill and plot condition
  const baseSuccess = 0.7 + (player.gardeningSkill * 0.01) + (plot.fertility * 0.05);
  
  // Calculate score from player's mini-game performance
  const performanceScore = (playScore.timing + playScore.precision + playScore.pattern) / 3;
  
  // Determine mini-game success
  const successThreshold = Math.min(0.95, baseSuccess);
  const success = performanceScore >= successThreshold;
  
  // Calculate bonuses based on performance
  const timingBonus = success ? performanceScore * MINI_GAME_TIME_BONUS_MAX : 0;
  const qualityBonus = success ? Math.floor(performanceScore * 2) : 0;
  const yieldBonus = success ? Math.floor(performanceScore * 1.5) : 0;
  const uniqueTraitChance = success ? performanceScore * 0.15 : 0;
  
  // Calculate soil-related scores
  const soilQuality = plot.fertility * (1 + (performanceScore * 0.3)) / 100;
  const wateringLevel = 0.8 + (performanceScore * 0.2);
  const spacingScore = 0.7 + (performanceScore * 0.3);
  
  return {
    success,
    timingBonus,
    qualityBonus,
    yieldBonus,
    uniqueTraitChance,
    soilQuality,
    wateringLevel,
    spacingScore
  };
}

/**
 * Plants a new interactive plant based on mini-game results
 * Creates initial plant state with genetic traits and growth conditions
 */
export function plantNewInteractivePlant(
  player: { id: string; name: string; gardeningSkill: number },
  plot: GardenSlot,
  variety: PlantVariety,
  miniGameResult: PlantingMiniGame,
  currentSeason: Season,
  currentMoonPhase: MoonPhase,
  currentWeather: WeatherCondition
): InteractivePlant {
  // Generate plant ID
  const plantId = `plant_${player.id}_${Date.now()}`;
  
  // Calculate growth progress and health based on mini-game result
  const initialHealth = 80 + (miniGameResult.success ? 20 : 0);
  
  // Calculate growth modifiers from current conditions
  const seasonModifier = getSeasanalGrowthModifier(variety, currentSeason);
  const weatherModifier = WEATHER_EFFECT_MULTIPLIERS[currentWeather] || 1.0;
  const lunarModifier = LUNAR_POTENCY[currentMoonPhase] || 1.0;
  
  // Calculate growth time
  const growthTimeDays = variety.growthTimeDays || 3;
  const baseGrowthTime = GROWTH_CYCLE_BASE_TIME * growthTimeDays;
  const modifiedGrowthTime = baseGrowthTime * 
    (1 - miniGameResult.timingBonus) * 
    (1 / seasonModifier) * 
    (1 / weatherModifier) *
    (1 / lunarModifier);
  
  // Determine initial genetic traits
  const traits = determineInitialTraits(variety, miniGameResult.uniqueTraitChance, currentSeason);
  
  // Calculate next action time (when watering will be needed)
  const nextActionTime = Date.now() + (3600 * 1000 * 4); // 4 hours until needs watering
  
  // Create plant care record
  const initialCareAction: PlantCareAction = {
    timestamp: Date.now(),
    action: 'plant',
    success: miniGameResult.success,
    score: (miniGameResult.soilQuality + miniGameResult.wateringLevel + miniGameResult.spacingScore) / 3,
    notes: `Planted by ${player.name} during ${currentSeason} season, ${currentMoonPhase} moon.`
  };
  
  // Calculate base quality and yield
  const baseQuality = variety.baseQuality || 2;
  const baseYield = variety.baseYield || 1;
  
  // Create new plant object
  const newPlant: InteractivePlant = {
    id: plantId,
    varietyId: variety.id,
    name: variety.name,
    plotId: String(plot.id),
    currentStage: 'seed',
    health: initialHealth,
    growthProgress: 0,
    waterLevel: miniGameResult.wateringLevel * 100, // 0-100 scale
    nextActionTime: nextActionTime,
    predictedQuality: calculatePredictedQuality(variety, miniGameResult, traits),
    predictedYield: calculatePredictedYield(variety, miniGameResult, traits),
    geneticTraits: traits,
    growthModifiers: [
      {
        source: 'season',
        description: `${currentSeason} seasonal influence`,
        qualityModifier: seasonModifier * 0.2,
        yieldModifier: seasonModifier * 0.1,
        growthRateModifier: seasonModifier
      },
      {
        source: 'weather',
        description: `${currentWeather} weather conditions`,
        qualityModifier: weatherModifier * 0.1,
        yieldModifier: weatherModifier * 0.15,
        growthRateModifier: weatherModifier,
        expiresAt: Date.now() + (24 * 3600 * 1000) // 24 hours
      },
      {
        source: 'lunar',
        description: `${currentMoonPhase} lunar influence`,
        qualityModifier: lunarModifier * 0.15,
        yieldModifier: lunarModifier * 0.15,
        growthRateModifier: lunarModifier,
        expiresAt: Date.now() + (8 * 3600 * 1000) // 8 hours
      }
    ],
    lastInteraction: Date.now(),
    createdAt: Date.now(),
    careHistory: [initialCareAction],
    // Add compatibility with Plant interface
    category: variety.category || 'herb',
    growth: 0,
    maxGrowth: 100,
    mature: false,
    moonBlessed: currentMoonPhase === 'Full Moon',
    seasonalModifier: seasonModifier,
    age: 0
  };
  
  return newPlant;
}

/**
 * Calculate predicted quality based on variety, mini-game and traits
 */
function calculatePredictedQuality(
  variety: PlantVariety, 
  miniGameResult: PlantingMiniGame,
  traits: PlantTrait[]
): ItemQuality {
  // Base quality value from variety (1-5 scale)
  const baseQuality = variety.baseQuality || 2;
  
  // Add mini-game bonus
  const miniGameBonus = miniGameResult.qualityBonus;
  
  // Add trait modifiers
  const traitBonus = traits.reduce((sum, trait) => sum + trait.qualityModifier, 0);
  
  // Calculate final quality (1-5 scale)
  const qualityValue = Math.max(1, Math.min(5, baseQuality + miniGameBonus + traitBonus));
  
  // Convert to ItemQuality enum
  const qualityMap: Record<number, ItemQuality> = {
    1: 'poor',
    2: 'common',
    3: 'uncommon',
    4: 'rare',
    5: 'exceptional'
  };
  
  return qualityMap[Math.round(qualityValue)] || 'common';
}

/**
 * Calculate predicted yield based on variety, mini-game and traits
 */
function calculatePredictedYield(
  variety: PlantVariety, 
  miniGameResult: PlantingMiniGame,
  traits: PlantTrait[]
): number {
  // Base yield from variety
  const baseYield = variety.baseYield || 1;
  
  // Add mini-game bonus
  const miniGameBonus = miniGameResult.yieldBonus;
  
  // Add trait modifiers
  const traitBonus = traits.reduce((sum, trait) => sum + trait.yieldModifier, 0);
  
  // Calculate final yield (minimum 1)
  return Math.max(1, Math.round(baseYield + miniGameBonus + traitBonus));
}

/**
 * Determine seasonal growth modifier based on plant variety and current season
 */
function getSeasanalGrowthModifier(variety: PlantVariety, currentSeason: Season): number {
  if (variety.preferredSeason === currentSeason) {
    return 1.3; // 30% boost in preferred season
  }
  
  const opposites: Record<Season, Season> = {
    Spring: 'Fall',
    Summer: 'Winter',
    Fall: 'Spring',
    Winter: 'Summer'
  };
  
  if (opposites[variety.preferredSeason] === currentSeason) {
    return 0.7; // 30% penalty in opposite season
  }
  
  return 1.0; // Neutral in other seasons
}

/**
 * Determine initial traits for a plant based on variety and conditions
 */
function determineInitialTraits(
  variety: PlantVariety,
  uniqueTraitChance: number,
  currentSeason: Season
): PlantTrait[] {
  const traits: PlantTrait[] = [];
  
  // Add base traits from variety
  if (variety.baseTraits) {
    traits.push(...variety.baseTraits);
  }
  
  // Chance for a seasonal trait
  if (Math.random() < 0.3) {
    const seasonalTraits = SEASONAL_AFFINITY[currentSeason];
    const traitName = seasonalTraits[Math.floor(Math.random() * seasonalTraits.length)];
    
    traits.push({
      id: `seasonal_${traitName}_${Date.now()}`,
      name: `${traitName.charAt(0).toUpperCase() + traitName.slice(1)} Essence`,
      description: `This plant has absorbed the essence of ${currentSeason}.`,
      effect: `Enhanced properties related to ${traitName} characteristics.`,
      qualityModifier: 0.2,
      yieldModifier: 0.1,
      growthTimeModifier: -0.05,
      rarityTier: 1,
      dominant: Math.random() < 0.5
    });
  }
  
  // Chance for a unique trait based on mini-game performance
  if (Math.random() < uniqueTraitChance) {
    const uniqueTraits = [
      {
        name: 'Vibrant',
        description: 'Unusually vibrant coloration and potent properties.',
        effect: 'Increases ingredient potency in skincare recipes.',
        qualityModifier: 0.5,
        yieldModifier: 0,
        growthTimeModifier: 0,
        rarityTier: 2
      },
      {
        name: 'Hardy',
        description: 'Exceptionally resistant to adverse conditions.',
        effect: 'Less affected by poor weather conditions.',
        qualityModifier: 0.2,
        yieldModifier: 0.3,
        growthTimeModifier: -0.1,
        rarityTier: 2
      },
      {
        name: 'Abundant',
        description: 'Produces an unusual amount of harvestable material.',
        effect: 'Significantly increased yield.',
        qualityModifier: 0,
        yieldModifier: 0.7,
        growthTimeModifier: 0.1,
        rarityTier: 2
      },
      {
        name: 'Swift',
        description: 'Grows at an accelerated rate.',
        effect: 'Reduced growing time.',
        qualityModifier: 0,
        yieldModifier: 0,
        growthTimeModifier: -0.3,
        rarityTier: 2
      },
      {
        name: 'Radiant',
        description: 'Emits a subtle glow, indicating exceptional potency.',
        effect: 'Significantly enhanced quality.',
        qualityModifier: 0.8,
        yieldModifier: -0.2,
        growthTimeModifier: 0.1,
        rarityTier: 3
      }
    ];
    
    const selectedTrait = uniqueTraits[Math.floor(Math.random() * uniqueTraits.length)];
    
    traits.push({
      id: `unique_${selectedTrait.name.toLowerCase()}_${Date.now()}`,
      name: selectedTrait.name,
      description: selectedTrait.description,
      effect: selectedTrait.effect,
      qualityModifier: selectedTrait.qualityModifier,
      yieldModifier: selectedTrait.yieldModifier,
      growthTimeModifier: selectedTrait.growthTimeModifier,
      rarityTier: selectedTrait.rarityTier,
      dominant: Math.random() < 0.7
    });
  }
  
  return traits;
}

/**
 * Play watering mini-game to maintain and improve plant health
 */
export function playWateringMiniGame(
  player: { id: string; gardeningSkill: number },
  plant: InteractivePlant,
  playScore: { distribution: number; amount: number; technique: number }
): WateringMiniGame {
  // Calculate performance score
  const performanceScore = (
    playScore.distribution * 0.4 + 
    playScore.amount * 0.4 + 
    playScore.technique * 0.2
  );
  
  // Determine success threshold based on player skill and current plant needs
  const waterNeed = 100 - plant.waterLevel;
  const successThreshold = 0.6 - (player.gardeningSkill * 0.005) + (waterNeed * 0.002);
  
  // Determine mini-game success
  const success = performanceScore >= successThreshold;
  
  // Calculate bonuses
  const timingBonus = success ? performanceScore * 0.2 : 0;
  const qualityBonus = success ? Math.floor(performanceScore * 0.3) : -0.1;
  const yieldBonus = success ? Math.floor(performanceScore * 0.2) : 0;
  const uniqueTraitChance = success ? performanceScore * 0.05 : 0;
  
  return {
    success,
    timingBonus,
    qualityBonus,
    yieldBonus,
    uniqueTraitChance,
    distributionScore: playScore.distribution,
    amountScore: playScore.amount,
    techniqueScore: playScore.technique
  };
}

/**
 * Apply watering mini-game results to plant
 */
export function applyWateringResults(
  plant: InteractivePlant,
  miniGameResult: WateringMiniGame,
  currentWeather: WeatherCondition
): InteractivePlant {
  // Create a deep copy of the plant
  const updatedPlant = JSON.parse(JSON.stringify(plant)) as InteractivePlant;
  
  // Update water level based on mini-game performance
  const waterBonus = miniGameResult.success ? 
    20 + (miniGameResult.amountScore * 30) : 
    5 + (miniGameResult.amountScore * 10);
    
  // Adjust water bonus based on current weather
  const weatherWaterModifier = currentWeather === 'rainy' ? 0.5 : 
                              currentWeather === 'stormy' ? 0.3 : 
                              currentWeather === 'sunny' || currentWeather === 'dry' ? 1.3 : 1.0;
  
  const adjustedWaterBonus = waterBonus * weatherWaterModifier;
  
  // Apply water level (cap at 100)
  updatedPlant.waterLevel = Math.min(100, updatedPlant.waterLevel + adjustedWaterBonus);
  
  // Update health based on watering success
  if (miniGameResult.success) {
    // Good watering improves health
    updatedPlant.health = Math.min(100, updatedPlant.health + 5);
  } else if (miniGameResult.amountScore < 0.3) {
    // Very poor watering damages health
    updatedPlant.health = Math.max(0, updatedPlant.health - 8);
  }
  
  // Calculate next watering time based on weather and mini-game performance
  const baseWateringInterval = 4; // hours
  let nextWateringTime = baseWateringInterval;
  
  // Adjust for weather
  if (currentWeather === 'sunny' || currentWeather === 'dry' || currentWeather === 'windy') {
    nextWateringTime *= 0.7; // Needs water sooner
  } else if (currentWeather === 'rainy' || currentWeather === 'cloudy') {
    nextWateringTime *= 1.5; // Needs water later
  }
  
  // Adjust for mini-game performance (better watering lasts longer)
  nextWateringTime *= (1 + (miniGameResult.distributionScore * 0.5));
  
  // Set next action time
  updatedPlant.nextActionTime = Date.now() + (nextWateringTime * 3600 * 1000);
  
  // Add care history entry
  updatedPlant.careHistory.push({
    timestamp: Date.now(),
    action: 'water',
    success: miniGameResult.success,
    score: (miniGameResult.distributionScore + miniGameResult.amountScore + miniGameResult.techniqueScore) / 3,
    notes: `Watered with ${miniGameResult.success ? 'successful' : 'suboptimal'} technique.`
  });
  
  // Update last interaction time
  updatedPlant.lastInteraction = Date.now();
  
  // Add temporary growth modifier for good watering
  if (miniGameResult.success && miniGameResult.distributionScore > 0.7) {
    updatedPlant.growthModifiers.push({
      source: 'expert_watering',
      description: 'Expert watering technique applied',
      qualityModifier: 0.1 * miniGameResult.distributionScore,
      yieldModifier: 0.1 * miniGameResult.distributionScore,
      growthRateModifier: 0.15 * miniGameResult.distributionScore,
      expiresAt: Date.now() + (24 * 3600 * 1000) // 24 hours
    });
  }
  
  return updatedPlant;
}

/**
 * Play harvesting mini-game to collect ingredients from mature plants
 */
export function playHarvestingMiniGame(
  player: { id: string; gardeningSkill: number },
  plant: InteractivePlant,
  playScore: { precision: number; speed: number; carefulness: number }
): HarvestingMiniGame {
  // Only allow harvesting of mature plants
  if (plant.currentStage !== 'mature' && plant.growthProgress < 98) {
    return {
      success: false,
      timingBonus: 0,
      qualityBonus: 0,
      yieldBonus: 0,
      uniqueTraitChance: 0,
      precisionScore: 0,
      speedScore: 0,
      carefulnessScore: 0
    };
  }
  
  // Calculate performance score with emphasis on precision and carefulness
  const performanceScore = (
    playScore.precision * 0.45 + 
    playScore.speed * 0.1 + 
    playScore.carefulness * 0.45
  );
  
  // Determine success threshold based on player skill
  const successThreshold = 0.65 - (player.gardeningSkill * 0.005);
  
  // Determine mini-game success
  const success = performanceScore >= successThreshold;
  
  // Calculate bonuses - harvesting directly affects quality and yield
  const timingBonus = 0; // Not relevant for harvesting
  const qualityBonus = success ? 
    (playScore.precision * 0.7) + (playScore.carefulness * 0.3) : 
    -0.5;
  const yieldBonus = success ?
    (playScore.precision * 0.4) + (playScore.carefulness * 0.3) + (playScore.speed * 0.3) :
    -0.3;
  const uniqueTraitChance = success ? performanceScore * 0.08 : 0;
  
  return {
    success,
    timingBonus,
    qualityBonus,
    yieldBonus,
    uniqueTraitChance,
    precisionScore: playScore.precision,
    speedScore: playScore.speed,
    carefulnessScore: playScore.carefulness
  };
}

/**
 * Harvest ingredients from a plant based on mini-game results
 */
export function harvestPlant(
  plant: InteractivePlant,
  miniGameResult: HarvestingMiniGame,
  currentSeason: Season,
  currentMoonPhase: MoonPhase
): {
  harvestedIngredients: Ingredient[];
  seedsObtained: number;
  experience: number;
  remainingPlant: InteractivePlant | null;
} {
  // Check if plant can be harvested
  if (plant.currentStage !== 'mature' || plant.growthProgress < 95) {
    return {
      harvestedIngredients: [],
      seedsObtained: 0,
      experience: 0,
      remainingPlant: plant
    };
  }
  
  // Calculate base yield and quality
  const baseQualityMap: Record<ItemQuality, number> = {
    'poor': 1,
    'common': 2,
    'uncommon': 3,
    'rare': 4,
    'exceptional': 5
  };
  const baseQuality = baseQualityMap[plant.predictedQuality] || 2;
  const baseYield = plant.predictedYield;
  
  // Apply harvesting mini-game modifiers
  const qualityModifier = 1 + miniGameResult.qualityBonus;
  const yieldModifier = 1 + miniGameResult.yieldBonus;
  
  // Apply seasonal and lunar modifiers
  const seasonalQualityMod = getSeasanalGrowthModifier(
    { id: plant.varietyId, preferredSeason: currentSeason } as PlantVariety, 
    currentSeason
  ) * 0.2;
  const lunarQualityMod = LUNAR_POTENCY[currentMoonPhase] * 0.3;
  
  // Calculate final quality score (1-5 scale)
  const finalQualityScore = Math.max(1, Math.min(5, 
    baseQuality * qualityModifier * (1 + seasonalQualityMod + lunarQualityMod)
  ));
  
  // Map quality score back to ItemQuality enum
  const qualityMap: Record<number, ItemQuality> = {
    1: 'poor',
    2: 'common',
    3: 'uncommon',
    4: 'rare',
    5: 'exceptional'
  };
  const finalQuality = qualityMap[Math.round(finalQualityScore)] || 'common';
  
  // Calculate final yield
  const finalYield = Math.max(1, Math.round(baseYield * yieldModifier));
  
  // Create harvested ingredients
  const harvestedIngredients: Ingredient[] = [];
  const now = Date.now();
  
  for (let i = 0; i < finalYield; i++) {
    // Slight quality variation in batch
    const itemQualityVariation = Math.random() > 0.7 ? 
      (Math.random() > 0.5 ? 1 : -1) : 0;
    const itemQualityScore = Math.max(1, Math.min(5, 
      finalQualityScore + itemQualityVariation * 0.5
    ));
    const itemQuality = qualityMap[Math.round(itemQualityScore)] || finalQuality;
    
    // Create ingredient with traits from plant
    harvestedIngredients.push({
      id: `ingredient_${plant.id}_${i}_${now}`,
      name: `Harvested ${plant.name || plant.varietyId}`,
      quality: itemQuality,
      harvestedAt: now,
      sourceType: 'garden',
      sourceId: plant.id,
      traits: plant.geneticTraits.map(trait => trait.name)
    });
  }
  
  // Calculate seeds obtained
  const seedsObtained = miniGameResult.success ? 
    Math.round(1 + (Math.random() * 2) + miniGameResult.carefulnessScore) : 
    Math.round(Math.random());
  
  // Calculate experience gained
  const experience = 10 + 
    (harvestedIngredients.length * 2) + 
    (seedsObtained * 1) + 
    (miniGameResult.success ? 5 : 0);
  
  // Determine if plant should remain (some plants can be harvested multiple times)
  // This would depend on the plant variety's "isPerennial" property
  const remainingPlant = null; // For now, assume all plants are removed after harvest
  
  return {
    harvestedIngredients,
    seedsObtained,
    experience,
    remainingPlant
  };
}

/**
 * Play weather protection mini-game to shield plants from adverse conditions
 */
export function playWeatherProtectionMiniGame(
  player: { id: string; gardeningSkill: number },
  plant: InteractivePlant,
  weatherEvent: WeatherCondition,
  playScore: { reactionTime: number; coverage: number; reinforcement: number }
): WeatherProtectionMiniGame {
  // Calculate base damage potential from weather
  const weatherDamage = weatherEvent === 'stormy' ? 0.8 :
                        weatherEvent === 'windy' ? 0.5 :
                        weatherEvent === 'snowy' ? 0.7 :
                        0.3;
  
  // Calculate performance score
  const performanceScore = (
    playScore.reactionTime * 0.3 + 
    playScore.coverage * 0.4 + 
    playScore.reinforcement * 0.3
  );
  
  // Determine success threshold based on weather severity
  const successThreshold = 0.5 + (weatherDamage * 0.2) - (player.gardeningSkill * 0.005);
  
  // Determine mini-game success
  const success = performanceScore >= successThreshold;
  
  // Calculate protection effectiveness
  const protectionEffectiveness = success ? 
    performanceScore : 
    performanceScore * 0.5;
  
  // Calculate bonuses
  const timingBonus = success ? playScore.reactionTime * 0.2 : 0;
  const qualityBonus = success ? protectionEffectiveness * 0.2 : -weatherDamage * 0.5;
  const yieldBonus = success ? protectionEffectiveness * 0.1 : -weatherDamage * 0.7;
  const uniqueTraitChance = success ? performanceScore * 0.03 : 0;
  
  return {
    success,
    timingBonus,
    qualityBonus,
    yieldBonus,
    uniqueTraitChance,
    reactionTime: playScore.reactionTime,
    coverageScore: playScore.coverage,
    reinforcementScore: playScore.reinforcement
  };
}

/**
 * Apply weather protection to plant
 */
export function applyWeatherProtection(
  plant: InteractivePlant,
  miniGameResult: WeatherProtectionMiniGame,
  weatherEvent: WeatherCondition
): InteractivePlant {
  // Create a deep copy of the plant
  const updatedPlant = JSON.parse(JSON.stringify(plant)) as InteractivePlant;
  
  // Calculate protection level (0-1)
  const protectionLevel = miniGameResult.success ? 
    (miniGameResult.coverageScore * 0.7) + (miniGameResult.reinforcementScore * 0.3) : 
    (miniGameResult.coverageScore * 0.3) + (miniGameResult.reinforcementScore * 0.1);
  
  // Calculate potential weather damage
  const potentialDamage = weatherEvent === 'stormy' ? 25 :
                          weatherEvent === 'windy' ? 15 :
                          weatherEvent === 'snowy' ? 20 :
                          (weatherEvent === 'sunny' || weatherEvent === 'dry') && plant.waterLevel < 30 ? 18 :
                          5;
  
  // Calculate actual damage after protection
  const actualDamage = potentialDamage * (1 - protectionLevel);
  
  // Apply damage to plant health
  updatedPlant.health = Math.max(0, updatedPlant.health - actualDamage);
  
  // Add weather protection modifier
  if (miniGameResult.success) {
    updatedPlant.growthModifiers.push({
      source: 'weather_protection',
      description: `Protected from ${weatherEvent} conditions`,
      qualityModifier: 0.05,
      yieldModifier: 0.05,
      growthRateModifier: 0,
      expiresAt: Date.now() + (12 * 3600 * 1000) // 12 hours
    });
  } else if (actualDamage > 10) {
    // Add negative modifier for significant weather damage
    updatedPlant.growthModifiers.push({
      source: 'weather_damage',
      description: `Damaged by ${weatherEvent} conditions`,
      qualityModifier: -0.1,
      yieldModifier: -0.15,
      growthRateModifier: -0.05,
      expiresAt: Date.now() + (24 * 3600 * 1000) // 24 hours
    });
  }
  
  // Add care history entry
  updatedPlant.careHistory.push({
    timestamp: Date.now(),
    action: 'protect',
    success: miniGameResult.success,
    score: protectionLevel,
    notes: `Protected from ${weatherEvent} weather with ${
      miniGameResult.success ? 'successful' : 'partial'
    } coverage.`
  });
  
  // Update last interaction time
  updatedPlant.lastInteraction = Date.now();
  
  return updatedPlant;
}

/**
 * Cross-breed two plants to create a new variety with combined traits
 */
export function crossBreedPlants(
  plant1: InteractivePlant, 
  plant2: InteractivePlant,
  player: { id: string; gardeningSkill: number },
  currentSeason: Season,
  currentMoonPhase: MoonPhase
): CrossBreedingResult {
  // Check if cross-breeding is possible
  if (plant1.varietyId === plant2.varietyId) {
    // Same variety - low chance of successful mutation
    if (Math.random() > 0.8 + (player.gardeningSkill * 0.005)) {
      return { 
        success: false,
        traitInheritance: {
          fromParent1: [],
          fromParent2: [],
          newMutations: []
        },
        rarityTier: 0
      };
    }
  }
  
  // Calculate base success chance
  const baseSuccessChance = 0.5 + (player.gardeningSkill * 0.01);
  
  // Lunar phase affects cross-breeding success
  const lunarBonus = currentMoonPhase === 'Full Moon' ? 0.2 :
                     currentMoonPhase === 'New Moon' ? -0.1 :
                     0;
  
  // Determine if cross-breeding is successful
  const success = Math.random() < (baseSuccessChance + lunarBonus);
  
  if (!success) {
    return {
      success: false,
      traitInheritance: {
        fromParent1: [],
        fromParent2: [],
        newMutations: []
      },
      rarityTier: 0
    };
  }
  
  // Create new variety name by combining parent names
  const parent1Name = plant1.name || plant1.varietyId.split('_').pop() || 'Unknown';
  const parent2Name = plant2.name || plant2.varietyId.split('_').pop() || 'Unknown';
  const newVarietyName = `${parent1Name.substring(0, 3)}${parent2Name.substring(0, 3)}`;
  
  // Generate new variety ID
  const newVarietyId = `variety_hybrid_${newVarietyName.toLowerCase()}_${Date.now()}`;
  
  // Determine which traits are inherited from each parent
  const traitsFromParent1: PlantTrait[] = [];
  const traitsFromParent2: PlantTrait[] = [];
  
  // Traits with dominant flag are more likely to be inherited
  plant1.geneticTraits.forEach(trait => {
    if (trait.dominant || Math.random() < 0.7) {
      traitsFromParent1.push({...trait});
    }
  });
  
  plant2.geneticTraits.forEach(trait => {
    if (trait.dominant || Math.random() < 0.7) {
      traitsFromParent2.push({...trait});
    }
  });
  
  // Chance for mutations (new traits)
  const newMutations: PlantTrait[] = [];
  const mutationChance = 0.2 + (player.gardeningSkill * 0.005) + (lunarBonus * 2);
  
  if (Math.random() < mutationChance) {
    // Generate a new mutation
    const possibleMutations = [
      {
        name: 'Luminescent',
        description: 'Glows softly in the dark, indicating unusual magical properties.',
        effect: 'Enhances magical potency in recipes.',
        qualityModifier: 0.5,
        yieldModifier: 0,
        growthTimeModifier: 0.1,
        rarityTier: 3
      },
      {
        name: 'Harmonious',
        description: 'Perfectly balanced elemental energies within the plant.',
        effect: 'Improves effectiveness when combined with other ingredients.',
        qualityModifier: 0.3,
        yieldModifier: 0.3,
        growthTimeModifier: 0,
        rarityTier: 3
      },
      {
        name: 'Adaptive',
        description: 'Unusually adaptive to changing conditions.',
        effect: 'Less affected by seasonal penalties.',
        qualityModifier: 0.2,
        yieldModifier: 0.2,
        growthTimeModifier: -0.1,
        rarityTier: 2
      },
      {
        name: 'Resonant',
        description: 'Vibrates slightly when touched, resonating with lunar energy.',
        effect: 'Enhanced lunar phase bonuses.',
        qualityModifier: 0.3,
        yieldModifier: 0.2,
        growthTimeModifier: 0,
        rarityTier: 3
      }
    ];
    
    const selectedMutation = possibleMutations[Math.floor(Math.random() * possibleMutations.length)];
    
    newMutations.push({
      id: `mutation_${selectedMutation.name.toLowerCase()}_${Date.now()}`,
      name: selectedMutation.name,
      description: selectedMutation.description,
      effect: selectedMutation.effect,
      qualityModifier: selectedMutation.qualityModifier,
      yieldModifier: selectedMutation.yieldModifier,
      growthTimeModifier: selectedMutation.growthTimeModifier,
      rarityTier: selectedMutation.rarityTier,
      dominant: Math.random() < 0.5
    });
  }
  
  // Calculate rarity tier based on parent traits and mutations
  const parent1HighestRarity = Math.max(...plant1.geneticTraits.map(t => t.rarityTier), 0);
  const parent2HighestRarity = Math.max(...plant2.geneticTraits.map(t => t.rarityTier), 0);
  const mutationHighestRarity = Math.max(...newMutations.map(t => t.rarityTier), 0);
  
  let rarityTier = Math.max(parent1HighestRarity, parent2HighestRarity);
  if (mutationHighestRarity > rarityTier) {
    rarityTier = mutationHighestRarity;
  } else if (mutationHighestRarity > 0) {
    // Slight boost for having any mutation
    rarityTier += 0.5;
  }
  
  return {
    success: true,
    newVarietyId,
    newVarietyName: `Hybrid ${newVarietyName}`,
    traitInheritance: {
      fromParent1: traitsFromParent1,
      fromParent2: traitsFromParent2,
      newMutations
    },
    rarityTier: Math.round(rarityTier)
  };
}

/**
 * Update plant growth based on time elapsed and conditions
 * This function should be called regularly to simulate growth over time
 */
export function updatePlantGrowth(
  plant: InteractivePlant,
  currentTimestamp: number,
  currentSeason: Season,
  currentMoonPhase: MoonPhase,
  currentWeather: WeatherCondition
): InteractivePlant {
  // Create a deep copy of the plant
  const updatedPlant = JSON.parse(JSON.stringify(plant)) as InteractivePlant;
  
  // Calculate time elapsed since last update
  const timeElapsed = currentTimestamp - plant.lastInteraction;
  const hoursElapsed = timeElapsed / (3600 * 1000);
  
  if (hoursElapsed <= 0) {
    return updatedPlant; // No time has passed
  }
  
  // Update water level (decreases over time)
  const waterLossRate = currentWeather === 'sunny' || currentWeather === 'dry' ? 3 : 
                      currentWeather === 'windy' ? 2.5 :
                      currentWeather === 'rainy' ? 0.5 :
                      1.5; // per hour
                      
  updatedPlant.waterLevel = Math.max(0, updatedPlant.waterLevel - (waterLossRate * hoursElapsed));
  
  // Calculate health changes
  if (updatedPlant.waterLevel < 20) {
    // Plant is dehydrated - health decreases
    const healthLoss = (20 - updatedPlant.waterLevel) * 0.1 * hoursElapsed;
    updatedPlant.health = Math.max(0, updatedPlant.health - healthLoss);
  } else if (updatedPlant.waterLevel > 80) {
    // Plant is overwatered - health decreases
    const healthLoss = (updatedPlant.waterLevel - 80) * 0.05 * hoursElapsed;
    updatedPlant.health = Math.max(0, updatedPlant.health - healthLoss);
  } else if (updatedPlant.health < 100 && updatedPlant.waterLevel > 40) {
    // Healthy water level - plant slowly recovers
    const healthGain = 0.5 * hoursElapsed;
    updatedPlant.health = Math.min(100, updatedPlant.health + healthGain);
  }
  
  // Calculate base growth rate (% per hour)
  let baseGrowthRate = 1.5; // Base growth of 1.5% per hour
  
  // Adjust for health
  baseGrowthRate *= (updatedPlant.health / 100);
  
  // Adjust for water level (optimal is 40-60%)
  const waterFactor = updatedPlant.waterLevel < 20 ? 0.3 :
                      updatedPlant.waterLevel < 40 ? 0.7 :
                      updatedPlant.waterLevel >= 40 && updatedPlant.waterLevel <= 60 ? 1.2 :
                      updatedPlant.waterLevel > 80 ? 0.6 :
                      1.0;
  baseGrowthRate *= waterFactor;
  
  // Apply seasonal modifier
  const seasonalModifier = getSeasanalGrowthModifier(
    { id: plant.varietyId, preferredSeason: currentSeason } as PlantVariety, 
    currentSeason
  );
  baseGrowthRate *= seasonalModifier;
  
  // Apply weather modifier
  baseGrowthRate *= WEATHER_EFFECT_MULTIPLIERS[currentWeather] || 1.0;
  
  // Apply lunar modifier
  baseGrowthRate *= LUNAR_POTENCY[currentMoonPhase] || 1.0;
  
  // Apply growth modifiers from plant traits
  for (const trait of updatedPlant.geneticTraits) {
    baseGrowthRate *= (1 + trait.growthTimeModifier);
  }
  
  // Apply temporary growth modifiers
  const currentTime = currentTimestamp;
  const activeModifiers = updatedPlant.growthModifiers.filter(
    mod => !mod.expiresAt || mod.expiresAt > currentTime
  );
  
  for (const modifier of activeModifiers) {
    baseGrowthRate *= modifier.growthRateModifier;
  }
  
  // Remove expired modifiers
  updatedPlant.growthModifiers = activeModifiers;
  
  // Calculate growth progress
  const growthIncrease = baseGrowthRate * hoursElapsed;
  updatedPlant.growthProgress = Math.min(100, updatedPlant.growthProgress + growthIncrease);
  
  // Update plant stage based on growth progress
  if (updatedPlant.growthProgress >= 95) {
    updatedPlant.currentStage = 'mature';
    updatedPlant.mature = true;
  } else if (updatedPlant.growthProgress >= 60) {
    updatedPlant.currentStage = 'flowering';
    updatedPlant.mature = false;
  } else if (updatedPlant.growthProgress >= 30) {
    updatedPlant.currentStage = 'growing';
    updatedPlant.mature = false;
  } else if (updatedPlant.growthProgress >= 5) {
    updatedPlant.currentStage = 'seedling';
    updatedPlant.mature = false;
  }
  
  // Update other Plant interface properties
  updatedPlant.growth = updatedPlant.growthProgress;
  
  // Update age in game turns
  updatedPlant.age = Math.max(1, Math.round(hoursElapsed / 24) + (updatedPlant.age || 0));
  
  // Update predicted quality and yield based on current conditions
  if (updatedPlant.health < 50) {
    // Poor health negatively impacts quality and yield
    const qualityPenalty = ((50 - updatedPlant.health) / 50) * 0.5;
    const yieldPenalty = ((50 - updatedPlant.health) / 50) * 0.7;
    
    // Recalculate predicted quality
    const currentQualityValue = baseQualityMap[updatedPlant.predictedQuality] || 2;
    const newQualityValue = Math.max(1, currentQualityValue - qualityPenalty);
    updatedPlant.predictedQuality = qualityMap[Math.round(newQualityValue)] || 'common';
    
    // Recalculate predicted yield
    updatedPlant.predictedYield = Math.max(1, Math.round(updatedPlant.predictedYield * (1 - yieldPenalty)));
  }
  
  // Update last interaction time
  updatedPlant.lastInteraction = currentTimestamp;
  
  return updatedPlant;
}

// Helper functions
const baseQualityMap: Record<ItemQuality, number> = {
  'poor': 1,
  'common': 2,
  'uncommon': 3,
  'rare': 4,
  'exceptional': 5
};

const qualityMap: Record<number, ItemQuality> = {
  1: 'poor',
  2: 'common',
  3: 'uncommon',
  4: 'rare',
  5: 'exceptional'
};

/**
 * Get relevant mini-game for the current plant stage and condition
 */
export function getRecommendedInteraction(
  plant: InteractivePlant,
  currentWeather: WeatherCondition
): 'plant' | 'water' | 'harvest' | 'protect' | 'none' {
  // Check if plant needs weather protection
  const severeWeather = ['stormy', 'snowy', 'windy'].includes(currentWeather);
  if (severeWeather) {
    return 'protect';
  }
  
  // Check if plant is ready for harvest
  if (plant.currentStage === 'mature' && plant.growthProgress >= 95) {
    return 'harvest';
  }
  
  // Check if plant needs water
  if (plant.waterLevel < 30) {
    return 'water';
  }
  
  // No immediate action needed
  return 'none';
}

/**
 * Calculate garden skill experience based on interactions
 */
export function calculateGardeningExperience(
  action: 'plant' | 'water' | 'harvest' | 'protect',
  success: boolean,
  score: number,
  plant: InteractivePlant
): number {
  const baseExperience = {
    plant: 5,
    water: 2,
    harvest: 8,
    protect: 6
  }[action] || 1;
  
  const successMultiplier = success ? 1.5 : 0.5;
  const scoreBonus = score * (success ? 5 : 1);
  const rarityBonus = plant.geneticTraits.reduce((sum, trait) => sum + trait.rarityTier, 0) * 0.5;
  
  return Math.round(baseExperience * successMultiplier + scoreBonus + rarityBonus);
}

/**
 * Apply fertilizer to a garden plot
 */
export interface FertilizerItem {
  id: string;
  name: string;
  category: string;
  quality: ItemQuality;
  potency?: number;
  specialEffect?: string;
  [key: string]: any;
}

export interface FertilizeResult {
  updatedPlot: GardenSlot;
  effects: {
    fertilityIncrease: number;
    qualityBonus: number;
    growthBonus: number;
    specialEffect?: string;
  };
}

export function fertilizePlot(
  plot: GardenSlot,
  fertilizer: FertilizerItem,
  currentSeason: Season,
  playerSkill: number
): FertilizeResult {
  // Create a deep copy of the plot
  const updatedPlot = JSON.parse(JSON.stringify(plot)) as GardenSlot;
  
  // Base fertility increase depends on fertilizer quality
  const baseQualityValue = baseQualityMap[fertilizer.quality] || 2;
  const baseFertilityIncrease = baseQualityValue * 5;
  
  // Apply skill bonus
  const skillMultiplier = 1 + (playerSkill * 0.01);
  
  // Apply seasonal modifier
  const seasonalMultiplier = fertilizer.specialEffect === currentSeason ? 1.3 : 1.0;
  
  // Calculate final fertility increase
  const fertilityIncrease = Math.round(baseFertilityIncrease * skillMultiplier * seasonalMultiplier);
  
  // Update plot fertility (cap at 100)
  updatedPlot.fertility = Math.min(100, (updatedPlot.fertility || 0) + fertilityIncrease);
  
  // Calculate growth and quality bonuses for plants
  const potencyFactor = fertilizer.potency || baseQualityValue * 0.2;
  const qualityBonus = potencyFactor * 0.1 * seasonalMultiplier;
  const growthBonus = potencyFactor * 0.15 * seasonalMultiplier;
  
  // Apply effects to plant if one exists
  if (updatedPlot.plant) {
    const plant = updatedPlot.plant as InteractivePlant;
    
    // Add growth modifier from fertilizer
    plant.growthModifiers.push({
      source: 'fertilizer',
      description: `Fertilized with ${fertilizer.name}`,
      qualityModifier: qualityBonus,
      yieldModifier: potencyFactor * 0.2,
      growthRateModifier: 1 + growthBonus,
      expiresAt: Date.now() + (3 * 24 * 3600 * 1000) // 3 days
    });
    
    // Slight health boost
    plant.health = Math.min(100, plant.health + (fertilityIncrease * 0.2));
    
    // Apply any special effects
    if (fertilizer.specialEffect) {
      applyFertilizerSpecialEffect(plant, fertilizer.specialEffect, seasonalMultiplier);
    }
  }
  
  return {
    updatedPlot,
    effects: {
      fertilityIncrease,
      qualityBonus,
      growthBonus,
      specialEffect: fertilizer.specialEffect
    }
  };
}

/**
 * Apply special effects from fertilizers
 */
function applyFertilizerSpecialEffect(
  plant: InteractivePlant,
  effect: string,
  multiplier: number
): void {
  switch (effect) {
    case 'growth_boost':
      plant.growthModifiers.push({
        source: 'fertilizer_special',
        description: 'Growth-boosting nutrients',
        qualityModifier: 0,
        yieldModifier: 0,
        growthRateModifier: 1.3 * multiplier,
        expiresAt: Date.now() + (24 * 3600 * 1000) // 24 hours
      });
      break;
    case 'quality_boost':
      plant.growthModifiers.push({
        source: 'fertilizer_special',
        description: 'Quality-enhancing minerals',
        qualityModifier: 0.3 * multiplier,
        yieldModifier: 0,
        growthRateModifier: 1,
        expiresAt: Date.now() + (3 * 24 * 3600 * 1000) // 3 days
      });
      break;
    case 'yield_boost':
      plant.growthModifiers.push({
        source: 'fertilizer_special',
        description: 'Yield-increasing compounds',
        qualityModifier: 0,
        yieldModifier: 0.3 * multiplier,
        growthRateModifier: 1,
        expiresAt: Date.now() + (3 * 24 * 3600 * 1000) // 3 days
      });
      break;
    // Seasonal fertilizers are handled by the seasonal multiplier in the main function
  }
}

/**
 * Apply seasonal attunement mini-game results to plants
 */
export interface SeasonalAttunementResult {
  success: boolean;
  score: number;
  seasonAlignment: number;
  elementBalance: number;
  ritualPrecision: number;
}

export function applySeasonalAttunement(
  plant: InteractivePlant,
  season: Season,
  attunementBonus: number,
  currentMoonPhase: MoonPhase
): InteractivePlant {
  // Create a deep copy of the plant
  const updatedPlant = JSON.parse(JSON.stringify(plant)) as InteractivePlant;
  
  // Apply attunement modifier
  updatedPlant.growthModifiers.push({
    source: 'seasonal_attunement',
    description: `${season} attunement ritual`,
    qualityModifier: attunementBonus * 0.2,
    yieldModifier: attunementBonus * 0.2,
    growthRateModifier: 1 + (attunementBonus * 0.3),
    expiresAt: Date.now() + (2 * 24 * 3600 * 1000) // 2 days
  });
  
  // Enhanced lunar influence during attunement
  const lunarBoost = LUNAR_POTENCY[currentMoonPhase] * 0.5;
  if (lunarBoost > 0.3) {
    updatedPlant.growthModifiers.push({
      source: 'lunar_attunement',
      description: `${currentMoonPhase} lunar influence during attunement`,
      qualityModifier: lunarBoost * 0.2,
      yieldModifier: lunarBoost * 0.1,
      growthRateModifier: 1 + (lunarBoost * 0.1),
      expiresAt: Date.now() + (24 * 3600 * 1000) // 24 hours
    });
  }
  
  // Apply season-specific effects
  switch (season) {
    case 'Spring':
      // Spring attunement boosts growth rate
      updatedPlant.growthModifiers.push({
        source: 'spring_attunement',
        description: 'Spring renewal energy',
        qualityModifier: 0.1,
        yieldModifier: 0,
        growthRateModifier: 1.2,
        expiresAt: Date.now() + (3 * 24 * 3600 * 1000) // 3 days
      });
      break;
    case 'Summer':
      // Summer attunement boosts quality
      updatedPlant.growthModifiers.push({
        source: 'summer_attunement',
        description: 'Summer vitality essence',
        qualityModifier: 0.3,
        yieldModifier: 0.1,
        growthRateModifier: 1,
        expiresAt: Date.now() + (3 * 24 * 3600 * 1000) // 3 days
      });
      break;
    case 'Fall':
      // Fall attunement boosts yield
      updatedPlant.growthModifiers.push({
        source: 'fall_attunement',
        description: 'Fall abundance energy',
        qualityModifier: 0.1,
        yieldModifier: 0.3,
        growthRateModifier: 1,
        expiresAt: Date.now() + (3 * 24 * 3600 * 1000) // 3 days
      });
      break;
    case 'Winter':
      // Winter attunement provides preservation effect
      updatedPlant.growthModifiers.push({
        source: 'winter_attunement',
        description: 'Winter preservation magic',
        qualityModifier: 0.2,
        yieldModifier: -0.1,
        growthRateModifier: 0.8,
        expiresAt: Date.now() + (5 * 24 * 3600 * 1000) // 5 days
      });
      break;
  }
  
  // Improved health from attunement
  updatedPlant.health = Math.min(100, updatedPlant.health + (attunementBonus * 15));
  
  return updatedPlant;
}

/**
 * Upgrade a garden plot's properties
 */
export interface GardenPlotUpgrade {
  level: number;
  type: string;
  value: number;
  appliedAt: number;
}

export function upgradeGardenPlot(
  plot: GardenSlot,
  upgradeType: string,
  player: { id: string; gardeningSkill: number; crafting?: number }
): GardenSlot {
  // Create a deep copy of the plot
  const updatedPlot = JSON.parse(JSON.stringify(plot)) as GardenSlot;
  
  // Initialize upgrades array if it doesn't exist
  if (!updatedPlot.upgrades) {
    updatedPlot.upgrades = [];
  }
  
  // Get current upgrade level for this type
  const existingUpgrade = updatedPlot.upgrades.find(u => u.type === upgradeType);
  const currentLevel = existingUpgrade ? existingUpgrade.level : 0;
  const newLevel = currentLevel + 1;
  
  // Skill bonus
  const skillBonus = ((player.gardeningSkill || 0) * 0.01) + ((player.crafting || 0) * 0.01);
  
  // Apply upgrade based on type
  switch (upgradeType) {
    case 'soil':
      // Improve soil quality/fertility
      const soilBonus = 10 + (newLevel * 5);
      updatedPlot.fertility = Math.min(100, (updatedPlot.fertility || 0) + soilBonus);
      
      // Update or add upgrade record
      if (existingUpgrade) {
        existingUpgrade.level = newLevel;
        existingUpgrade.value = soilBonus;
        existingUpgrade.appliedAt = Date.now();
      } else {
        updatedPlot.upgrades.push({
          level: newLevel,
          type: upgradeType,
          value: soilBonus,
          appliedAt: Date.now()
        });
      }
      break;
      
    case 'irrigation':
      // Improve water retention
      const waterRetention = 10 + (newLevel * 8);
      updatedPlot.waterRetention = (updatedPlot.waterRetention || 0) + waterRetention;
      
      // Also slightly increases base moisture
      updatedPlot.moisture = Math.min(100, (updatedPlot.moisture || 0) + (waterRetention / 2));
      
      if (existingUpgrade) {
        existingUpgrade.level = newLevel;
        existingUpgrade.value = waterRetention;
        existingUpgrade.appliedAt = Date.now();
      } else {
        updatedPlot.upgrades.push({
          level: newLevel,
          type: upgradeType,
          value: waterRetention,
          appliedAt: Date.now()
        });
      }
      break;
      
    case 'size':
      // Increase plot size/capacity
      const sizeIncrease = 0.5 + (newLevel * 0.25);
      updatedPlot.size = (updatedPlot.size || 1) + sizeIncrease;
      updatedPlot.capacity = Math.floor((updatedPlot.capacity || 1) + sizeIncrease);
      
      if (existingUpgrade) {
        existingUpgrade.level = newLevel;
        existingUpgrade.value = sizeIncrease;
        existingUpgrade.appliedAt = Date.now();
      } else {
        updatedPlot.upgrades.push({
          level: newLevel,
          type: upgradeType,
          value: sizeIncrease,
          appliedAt: Date.now()
        });
      }
      break;
      
    case 'specialization':
      // Specialize plot for a specific plant type
      // Value of 0-1 represents specialization strength
      const specializationBonus = 0.2 + (newLevel * 0.1) + skillBonus;
      
      if (!updatedPlot.specialization) {
        updatedPlot.specialization = {
          type: 'herb', // Default specialization
          bonus: specializationBonus
        };
      } else {
        updatedPlot.specialization.bonus = specializationBonus;
      }
      
      if (existingUpgrade) {
        existingUpgrade.level = newLevel;
        existingUpgrade.value = specializationBonus;
        existingUpgrade.appliedAt = Date.now();
      } else {
        updatedPlot.upgrades.push({
          level: newLevel,
          type: upgradeType,
          value: specializationBonus,
          appliedAt: Date.now()
        });
      }
      break;
  }
  
  // Update overall plot level
  updatedPlot.level = (updatedPlot.level || 0) + 1;
  
  return updatedPlot;
}

/**
 * Analyze cross-breeding compatibility between two plants
 */
export interface BreedingCompatibility {
  score: number;
  reasons: string[];
  potentialTraits: string[];
  strongestTraits: PlantTrait[];
  recommendedPhase?: MoonPhase;
  recommendedSeason?: Season;
}

export function analyzeCrossBreedingCompatibility(
  plant1: InteractivePlant,
  plant2: InteractivePlant,
  player: { id: string; gardeningSkill: number; breedingExperience: number },
  currentSeason: Season,
  currentMoonPhase: MoonPhase
): BreedingCompatibility {
  // Base compatibility (0-1)
  let compatibilityScore = 0.5;
  const reasons: string[] = [];
  const potentialTraits: string[] = [];
  
  // Check if same variety (reduces compatibility)
  if (plant1.varietyId === plant2.varietyId) {
    compatibilityScore -= 0.2;
    reasons.push("Same variety plants have lower mutation chance");
  } else {
    compatibilityScore += 0.1;
    reasons.push("Different varieties have better cross-breeding potential");
  }
  
  // Check plant categories
  const category1 = plant1.category || 'unknown';
  const category2 = plant2.category || 'unknown';
  
  if (category1 === category2) {
    compatibilityScore += 0.2;
    reasons.push(`Both plants are ${category1}s, increasing compatibility`);
  } else {
    // Some combinations work better than others
    const goodPairs = [
      ['herb', 'flower'],
      ['root', 'herb'],
      ['mushroom', 'root']
    ];
    
    const isPairGood = goodPairs.some(pair => 
      (pair[0] === category1 && pair[1] === category2) || 
      (pair[0] === category2 && pair[1] === category1)
    );
    
    if (isPairGood) {
      compatibilityScore += 0.15;
      reasons.push(`${category1} and ${category2} complement each other well`);
    } else {
      compatibilityScore -= 0.1;
      reasons.push(`${category1} and ${category2} have lower cross-breeding synergy`);
    }
  }
  
  // Check maturity
  if (!plant1.mature || !plant2.mature) {
    compatibilityScore = 0;
    reasons.push("Both plants must be mature for cross-breeding");
    return {
      score: 0,
      reasons,
      potentialTraits: [],
      strongestTraits: []
    };
  }
  
  // Check health
  const avgHealth = (plant1.health + plant2.health) / 2;
  if (avgHealth < 50) {
    compatibilityScore -= 0.3;
    reasons.push("Low plant health reduces cross-breeding success chance");
  } else if (avgHealth > 80) {
    compatibilityScore += 0.1;
    reasons.push("High plant health improves cross-breeding potential");
  }
  
  // Find common and unique traits
  const p1Traits = plant1.geneticTraits.map(t => t.name);
  const p2Traits = plant2.geneticTraits.map(t => t.name);
  
  const commonTraits = p1Traits.filter(t => p2Traits.includes(t));
  const uniqueP1Traits = p1Traits.filter(t => !p2Traits.includes(t));
  const uniqueP2Traits = p2Traits.filter(t => !p1Traits.includes(t));
  
  // Common traits improve compatibility
  if (commonTraits.length > 0) {
    compatibilityScore += 0.05 * commonTraits.length;
    reasons.push(`Plants share ${commonTraits.length} common traits`);
    
    // Common traits are likely to be inherited
    commonTraits.forEach(trait => {
      potentialTraits.push(`${trait} (Strong inheritance potential)`);
    });
  }
  
  // Find potential traits that could be inherited
  uniqueP1Traits.forEach(trait => {
    const traitObj = plant1.geneticTraits.find(t => t.name === trait);
    if (traitObj && traitObj.dominant) {
      potentialTraits.push(`${trait} (From first plant, dominant)`);
    } else {
      potentialTraits.push(`${trait} (From first plant)`);
    }
  });
  
  uniqueP2Traits.forEach(trait => {
    const traitObj = plant2.geneticTraits.find(t => t.name === trait);
    if (traitObj && traitObj.dominant) {
      potentialTraits.push(`${trait} (From second plant, dominant)`);
    } else {
      potentialTraits.push(`${trait} (From second plant)`);
    }
  });
  
  // Check for potential new traits based on combined properties
  if (player.breedingExperience > 10) {
    const possibleNewTraits = [
      'Harmonious',
      'Resonant',
      'Adaptive',
      'Vibrant',
      'Luminescent'
    ];
    
    // Higher breeding experience reveals potential mutations
    const revealCount = Math.min(
      possibleNewTraits.length,
      Math.floor(player.breedingExperience / 30) + 1
    );
    
    for (let i = 0; i < revealCount; i++) {
      potentialTraits.push(`${possibleNewTraits[i]} (Possible mutation, rare)`);
    }
  }
  
  // Find strongest traits that could influence offspring
  const allTraits = [...plant1.geneticTraits, ...plant2.geneticTraits];
  const sortedTraits = allTraits.sort((a, b) => {
    // Prioritize dominant and rare traits
    const aDominance = (a.dominant ? 2 : 0) + a.rarityTier;
    const bDominance = (b.dominant ? 2 : 0) + b.rarityTier;
    return bDominance - aDominance;
  });
  
  const strongestTraits = sortedTraits.slice(0, 3);
  
  // Check seasonal compatibility
  let recommendedSeason: Season | undefined;
  if (currentSeason === 'Spring') {
    compatibilityScore += 0.1;
    reasons.push("Spring increases breeding success rate");
  } else if (currentSeason === 'Winter') {
    compatibilityScore -= 0.1;
    reasons.push("Winter reduces breeding success rate");
    recommendedSeason = 'Spring';
  }
  
  // Check lunar phase compatibility
  let recommendedPhase: MoonPhase | undefined;
  if (currentMoonPhase === 'Full Moon') {
    compatibilityScore += 0.2;
    reasons.push("Full Moon greatly enhances breeding potential");
  } else if (currentMoonPhase === 'New Moon') {
    compatibilityScore -= 0.1;
    reasons.push("New Moon reduces breeding success rate");
    recommendedPhase = 'Full Moon';
  } else if (currentMoonPhase === 'Waxing Gibbous' || currentMoonPhase === 'Waning Gibbous') {
    compatibilityScore += 0.1;
    reasons.push("Gibbous moon phases improve breeding potential");
  }
  
  // Apply player skill bonus
  const skillBonus = (player.gardeningSkill * 0.003) + (player.breedingExperience * 0.005);
  compatibilityScore += skillBonus;
  
  if (skillBonus > 0.1) {
    reasons.push("Your experience improves cross-breeding success chance");
  }
  
  // Ensure score is between 0 and 1
  compatibilityScore = Math.max(0, Math.min(1, compatibilityScore));
  
  return {
    score: compatibilityScore,
    reasons,
    potentialTraits,
    strongestTraits,
    recommendedPhase,
    recommendedSeason
  };
}

/**
 * Create Hanbang skincare ingredient from plant ingredient
 */
export interface HanbangIngredient {
  id: string;
  name: string;
  type: string;
  category: string;
  quality: ItemQuality;
  effectivenessScore: number;
  primaryEffect: string;
  secondaryEffects: string[];
  skinType: string;
  skinConcern: string;
  potency: number;
  moonPhase: MoonPhase;
  season: Season;
  sourceIngredient: string;
  harvestedAt: number;
  processedAt: number;
  [key: string]: any;
}

export function createHanbangIngredient(
  ingredient: any,
  player: { 
    id: string; 
    gardeningSkill: number;
    alchemySkill: number;
    hanbangKnowledge: number 
  },
  targetSkinType: string,
  targetSkinConcern: string,
  ritualQuality: number,
  moonPhase: MoonPhase,
  season: Season
): HanbangIngredient {
  // Base effectiveness calculation
  const baseQualityValue = baseQualityMap[ingredient.quality as ItemQuality] || 2;
  const baseEffectiveness = baseQualityValue * 15;
  
  // Apply player skill modifiers
  const skillModifier = 1 + 
    (player.hanbangKnowledge * 0.02) + 
    (player.alchemySkill * 0.01) + 
    (player.gardeningSkill * 0.005);
  
  // Apply ritual quality modifier
  const ritualModifier = 0.5 + (ritualQuality * 0.8);
  
  // Apply lunar phase modifier
  const lunarModifier = LUNAR_POTENCY[moonPhase];
  
  // Apply seasonal modifier
  const seasonalModifier = season === 'Spring' || season === 'Summer' ? 1.2 : 1.0;
  
  // Calculate final effectiveness
  const effectivenessScore = baseEffectiveness * 
    skillModifier * 
    ritualModifier * 
    lunarModifier * 
    seasonalModifier;
  
  // Determine ingredient effects based on category
  let primaryEffect = '';
  const secondaryEffects: string[] = [];
  const category = ingredient.category || 'unknown';
  
  // Map categories to effects
  const effectMap: Record<string, { primary: string; secondary: string[] }> = {
    'herb': { 
      primary: 'soothing', 
      secondary: ['calming', 'purifying'] 
    },
    'flower': { 
      primary: 'brightening', 
      secondary: ['anti-aging', 'fragrance'] 
    },
    'root': { 
      primary: 'nourishing', 
      secondary: ['firming', 'balancing'] 
    },
    'mushroom': { 
      primary: 'hydrating', 
      secondary: ['revitalizing', 'clarifying'] 
    },
    'berry': { 
      primary: 'antioxidant', 
      secondary: ['protecting', 'plumping'] 
    }
  };
  
  // Set primary and secondary effects
  if (effectMap[category]) {
    primaryEffect = effectMap[category].primary;
    
    // Higher ritual quality unlocks more secondary effects
    const numSecondaryEffects = ritualQuality > 0.7 ? 2 : 
                               ritualQuality > 0.4 ? 1 : 0;
    
    for (let i = 0; i < numSecondaryEffects && i < effectMap[category].secondary.length; i++) {
      secondaryEffects.push(effectMap[category].secondary[i]);
    }
  } else {
    // Default effects for unknown categories
    primaryEffect = 'beneficial';
    if (ritualQuality > 0.5) {
      secondaryEffects.push('gentle');
    }
  }
  
  // Calculate potency (1-10 scale)
  const potency = Math.min(10, Math.max(1, Math.round(effectivenessScore / 10)));
  
  // Generate name
  const qualityPrefix = ritualQuality > 0.8 ? 'Premium' : 
                       ritualQuality > 0.5 ? 'Quality' : '';
  const baseIngredientName = ingredient.name.replace('Harvested ', '');
  const hanbangName = `${qualityPrefix} ${baseIngredientName} Hanbang Extract`.trim();
  
  return {
    id: `hanbang_${ingredient.id}_${Date.now()}`,
    name: hanbangName,
    type: 'hanbang_ingredient',
    category: 'skincare',
    quality: ingredient.quality,
    effectivenessScore,
    primaryEffect,
    secondaryEffects,
    skinType: targetSkinType,
    skinConcern: targetSkinConcern,
    potency,
    moonPhase,
    season,
    sourceIngredient: ingredient.id,
    harvestedAt: ingredient.harvestedAt || Date.now() - (24 * 3600 * 1000),
    processedAt: Date.now(),
    description: `A ${primaryEffect} skincare extract created from ${baseIngredientName}, 
    especially effective for ${targetSkinConcern} concerns with ${targetSkinType} skin.`
  };
}

/**
 * Apply lunar and seasonal modifiers to hanbang ingredients
 */
export function applyHanbangIngredientModifiers(
  ingredient: HanbangIngredient,
  currentMoonPhase: MoonPhase,
  currentSeason: Season
): HanbangIngredient {
  // Create a deep copy of the ingredient
  const modifiedIngredient = JSON.parse(JSON.stringify(ingredient)) as HanbangIngredient;
  
  // Check for moon phase resonance effects
  if (ingredient.moonPhase === currentMoonPhase) {
    // Ingredient was processed during the same moon phase being used now
    modifiedIngredient.effectivenessScore *= 1.3;
    modifiedIngredient.potency = Math.min(10, Math.round(modifiedIngredient.potency * 1.2));
    
    if (!modifiedIngredient.activeModifiers) modifiedIngredient.activeModifiers = [];
    modifiedIngredient.activeModifiers.push({
      type: 'lunar_resonance',
      description: `Moon phase resonance: ${currentMoonPhase}`,
      effectBonus: 30,
      expiresAt: Date.now() + (8 * 3600 * 1000) // 8 hours
    });
  }
  
  // Check for seasonal resonance effects
  if (ingredient.season === currentSeason) {
    // Ingredient was processed during the same season being used now
    modifiedIngredient.effectivenessScore *= 1.2;
    
    if (!modifiedIngredient.activeModifiers) modifiedIngredient.activeModifiers = [];
    modifiedIngredient.activeModifiers.push({
      type: 'seasonal_resonance',
      description: `Seasonal energy alignment: ${currentSeason}`,
      effectBonus: 20,
      expiresAt: null // Lasts as long as the season
    });
  }
  
  // Special combinations for enhanced effects
  if (ingredient.moonPhase === 'Full Moon' && ingredient.primaryEffect === 'brightening') {
    if (!modifiedIngredient.specialProperties) modifiedIngredient.specialProperties = [];
    modifiedIngredient.specialProperties.push('Luminous');
    
    if (!modifiedIngredient.secondaryEffects.includes('illuminating')) {
      modifiedIngredient.secondaryEffects.push('illuminating');
    }
  }
  
  if (ingredient.season === 'Spring' && ingredient.primaryEffect === 'hydrating') {
    if (!modifiedIngredient.specialProperties) modifiedIngredient.specialProperties = [];
    modifiedIngredient.specialProperties.push('Moisture-Locking');
    
    if (!modifiedIngredient.secondaryEffects.includes('long-lasting')) {
      modifiedIngredient.secondaryEffects.push('long-lasting');
    }
  }
  
  return modifiedIngredient;
}

/**
 * Create garden structures like greenhouses, shade cloths, etc.
 */
export interface GardenStructure {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  protection: number;
  weatherResistance: string[];
  durability: number;
  effects: {
    growthModifier: number;
    qualityModifier: number;
    yieldModifier: number;
    weatherProtection: number;
  };
  createdAt: number;
  level: number;
}

export function setupGardenStructure(
  structureType: string,
  position: { x: number; y: number },
  size: { width: number; height: number },
  craftingSkill: number
): GardenStructure {
  // Base properties by structure type
  const baseProperties: Record<string, any> = {
    'greenhouse': {
      name: 'Greenhouse',
      protection: 0.8,
      weatherResistance: ['rain', 'wind', 'cold', 'heat'],
      durability: 100,
      effects: {
        growthModifier: 1.3,
        qualityModifier: 0.2,
        yieldModifier: 0.1,
        weatherProtection: 0.8
      }
    },
    'shade_cloth': {
      name: 'Shade Cloth',
      protection: 0.5,
      weatherResistance: ['heat', 'light'],
      durability: 60,
      effects: {
        growthModifier: 1.1,
        qualityModifier: 0.1,
        yieldModifier: 0,
        weatherProtection: 0.4
      }
    },
    'irrigation': {
      name: 'Irrigation System',
      protection: 0.3,
      weatherResistance: ['drought'],
      durability: 80,
      effects: {
        growthModifier: 1.2,
        qualityModifier: 0,
        yieldModifier: 0.2,
        weatherProtection: 0.2
      }
    },
    'windbreak': {
      name: 'Windbreak',
      protection: 0.6,
      weatherResistance: ['wind', 'storm'],
      durability: 70,
      effects: {
        growthModifier: 1.1,
        qualityModifier: 0.1,
        yieldModifier: 0.1,
        weatherProtection: 0.6
      }
    },
    'trellis': {
      name: 'Trellis System',
      protection: 0.2,
      weatherResistance: ['wind'],
      durability: 90,
      effects: {
        growthModifier: 1.2,
        qualityModifier: 0.2,
        yieldModifier: 0.3,
        weatherProtection: 0.1
      }
    }
  };
  
  // Default to greenhouse if type not found
  const baseProps = baseProperties[structureType] || baseProperties['greenhouse'];
  
  // Apply crafting skill bonus
  const skillModifier = 1 + (craftingSkill * 0.01);
  
  // Create structure object
  const structure: GardenStructure = {
    id: `structure_${structureType}_${Date.now()}`,
    type: structureType,
    name: baseProps.name,
    position,
    size,
    protection: baseProps.protection * skillModifier,
    weatherResistance: baseProps.weatherResistance,
    durability: Math.round(baseProps.durability * skillModifier),
    effects: {
      growthModifier: baseProps.effects.growthModifier,
      qualityModifier: baseProps.effects.qualityModifier * skillModifier,
      yieldModifier: baseProps.effects.yieldModifier * skillModifier,
      weatherProtection: baseProps.effects.weatherProtection * skillModifier
    },
    createdAt: Date.now(),
    level: 1
  };
  
  return structure;
}

/**
 * Generate weather forecast for garden planning
 */
export interface WeatherForecast {
  days: WeatherPrediction[];
  reliability: number;
  warnings: string[];
}

export interface WeatherPrediction {
  day: number;
  weather: WeatherCondition;
  intensity: number;
  effect: string;
  recommendation: string;
}

export function getWeatherForecastForGarden(
  playerId: string,
  days: number,
  currentSeason: Season,
  currentMoonPhase: MoonPhase
): WeatherForecast {
  // Maximum days to forecast
  const maxDays = Math.min(7, days);
  
  // Generate reliability based on moon phase
  let reliability = 0.8;
  if (currentMoonPhase === 'Full Moon') {
    reliability = 0.9;
  } else if (currentMoonPhase === 'New Moon') {
    reliability = 0.7;
  }
  
  // Season-specific common weather patterns
  const seasonWeather: Record<Season, WeatherCondition[]> = {
    'Spring': ['rainy', 'cloudy', 'clear', 'windy'],
    'Summer': ['sunny', 'clear', 'dry', 'stormy'],
    'Fall': ['windy', 'rainy', 'cloudy', 'foggy'],
    'Winter': ['snowy', 'cloudy', 'clear', 'foggy']
  };
  
  // Generate forecasts
  const forecast: WeatherPrediction[] = [];
  let previousWeather: WeatherCondition | null = null;
  
  for (let i = 0; i < maxDays; i++) {
    // Higher chance of continuing same weather for 1-2 days
    let weather: WeatherCondition;
    
    if (previousWeather && Math.random() < 0.4 && i < 2) {
      weather = previousWeather;
    } else {
      // Pick from season-appropriate weather
      const seasonalOptions = seasonWeather[currentSeason];
      weather = seasonalOptions[Math.floor(Math.random() * seasonalOptions.length)];
      
      // Small chance of unusual weather
      if (Math.random() < 0.1) {
        const allWeather = Object.values(WEATHER_EFFECT_MULTIPLIERS);
        weather = allWeather[Math.floor(Math.random() * allWeather.length)];
      }
    }
    
    // Weather intensity (0.1-1.0)
    const intensity = 0.3 + (Math.random() * 0.7);
    
    // Generate recommendation
    let recommendation = '';
    let effect = '';
    
    switch(weather) {
      case 'rainy':
        effect = "Increases plant growth speed but may damage delicate flowering plants";
        recommendation = intensity > 0.7 ? "Use protective coverings for delicate plants" : "Good day for planting, no need to water";
        break;
      case 'sunny':
      case 'dry':
        effect = "Increases quality for sun-loving plants, but may cause water stress";
        recommendation = "Water plants thoroughly in the morning";
        break;
      case 'stormy':
        effect = "High risk of damage to all plants";
        recommendation = "Apply weather protection to all valuable plants";
        break;
      case 'windy':
        effect = "May damage tall or flowering plants";
        recommendation = "Use windbreaks or protective structures";
        break;
      case 'snowy':
        effect = "Slows growth but can protect roots from freezing";
        recommendation = "Check greenhouse heating if applicable";
        break;
      case 'cloudy':
        effect = "Moderate growing conditions for most plants";
        recommendation = "Good day for transplanting or garden maintenance";
        break;
      case 'foggy':
        effect = "Increases moisture, good for young seedlings";
        recommendation = "Monitor for fungal issues on susceptible plants";
        break;
      default:
        effect = "Normal growing conditions";
        recommendation = "Routine garden maintenance";
    }
    
    forecast.push({
      day: i + 1,
      weather,
      intensity,
      effect,
      recommendation
    });
    
    previousWeather = weather;
  }
  
  // Generate warnings based on forecast
  const warnings: string[] = [];
  
  // Check for severe weather patterns
  const severeWeatherDays = forecast.filter(f => 
    (f.weather === 'stormy' || f.weather === 'snowy') && f.intensity > 0.6
  );
  
  if (severeWeatherDays.length > 0) {
    warnings.push(`Severe weather expected on day(s): ${severeWeatherDays.map(d => d.day).join(', ')}`);
  }
  
  // Check for drought conditions
  const dryDays = forecast.filter(f => f.weather === 'dry' || f.weather === 'sunny');
  if (dryDays.length >= 3) {
    warnings.push('Extended dry period expected - prepare irrigation');
  }
  
  // Check for optimal planting conditions
  const goodPlantingDays = forecast.filter(f => 
    (f.weather === 'rainy' || f.weather === 'cloudy') && f.intensity < 0.7
  );
  
  if (goodPlantingDays.length > 0) {
    warnings.push(`Favorable planting conditions on day(s): ${goodPlantingDays.map(d => d.day).join(', ')}`);
  }
  
  return {
    days: forecast,
    reliability,
    warnings
  };
}

/**
 * Process weather events and their effects on garden
 */
export interface WeatherEventResult {
  updatedGarden: GardenSlot[];
  affectedPlots: number;
  damagedPlants: number;
  improvedPlants: number;
  message: string;
}

export function processWeatherEvent(
  player: { id: string; gardeningSkill: number; weatherProofing: number },
  garden: GardenSlot[],
  weatherType: string,
  intensity: number,
  playerResponse: string,
  structures: GardenStructure[]
): WeatherEventResult {
  // Create a deep copy of the garden
  const updatedGarden = JSON.parse(JSON.stringify(garden)) as GardenSlot[];
  
  // Track statistics
  let affectedPlots = 0;
  let damagedPlants = 0;
  let improvedPlants = 0;
  
  // Player skill reduces damage
  const skillReduction = (player.gardeningSkill * 0.005) + (player.weatherProofing * 0.01);
  
  // Process each plot in the garden
  updatedGarden.forEach(plot => {
    // Check if plot is protected by structures
    let structureProtection = 0;
    
    // Find applicable structures that cover this plot
    const protectingStructures = structures.filter(structure => {
      if (!plot.position) return false;
      
      return (
        plot.position.x >= structure.position.x && 
        plot.position.x < structure.position.x + structure.size.width &&
        plot.position.y >= structure.position.y && 
        plot.position.y < structure.position.y + structure.size.height
      );
    });
    
    // Calculate total protection from structures
    protectingStructures.forEach(structure => {
      // Check if structure protects against this weather type
      if (structure.weatherResistance.includes(weatherType)) {
        structureProtection += structure.protection;
      } else {
        structureProtection += structure.protection * 0.3; // Partial protection
      }
    });
    
    // Cap protection at 0.9 (90%)
    structureProtection = Math.min(0.9, structureProtection);
    
    // Calculate total damage reduction
    const playerResponseProtection = playerResponse === 'protect' ? 0.5 : 0;
    const totalProtection = Math.min(0.95, structureProtection + skillReduction + playerResponseProtection);
    
    // Calculate actual intensity after protection
    const effectiveIntensity = intensity * (1 - totalProtection);
    
    // Skip empty plots
    if (!plot.plant) return;
    
    // Process plant on the plot
    const plant = plot.plant as InteractivePlant;
    affectedPlots++;
    
    // Process different weather effects
    switch (weatherType) {
      case 'rain':
        // Increase water level
        plant.waterLevel = Math.min(100, plant.waterLevel + (30 * effectiveIntensity));
        
        // Can improve or damage plants depending on intensity
        if (effectiveIntensity > 0.7) {
          // Heavy rain can damage flowering plants
          if (plant.currentStage === 'flowering') {
            plant.health -= 10 * (effectiveIntensity - 0.5);
            damagedPlants++;
            
            // Add a negative modifier
            plant.growthModifiers.push({
              source: 'weather_rain',
              description: 'Heavy rain damage to flowers',
              qualityModifier: -0.1 * effectiveIntensity,
              yieldModifier: -0.2 * effectiveIntensity,
              growthRateModifier: 0.9,
              expiresAt: Date.now() + (24 * 3600 * 1000) // 24 hours
            });
          } else {
            // Other stages benefit from rain
            plant.health = Math.min(100, plant.health + (5 * effectiveIntensity));
            improvedPlants++;
            
            // Add a positive modifier
            plant.growthModifiers.push({
              source: 'weather_rain',
              description: 'Rain-nourished growth',
              qualityModifier: 0.05 * effectiveIntensity,
              yieldModifier: 0.1 * effectiveIntensity,
              growthRateModifier: 1.1 * effectiveIntensity,
              expiresAt: Date.now() + (12 * 3600 * 1000) // 12 hours
            });
          }
        } else {
          // Light rain benefits all plants
          plant.health = Math.min(100, plant.health + (3 * effectiveIntensity));
          improvedPlants++;
          
          // Add a mild positive modifier
          plant.growthModifiers.push({
            source: 'weather_rain',
            description: 'Gentle rain boost',
            qualityModifier: 0.03 * effectiveIntensity,
            yieldModifier: 0.05 * effectiveIntensity,
            growthRateModifier: 1.05 * effectiveIntensity,
            expiresAt: Date.now() + (12 * 3600 * 1000) // 12 hours
          });
        }
        break;
        
      case 'storm':
        // Heavy damage to all plants
        const stormDamage = 20 * effectiveIntensity;
        plant.health -= stormDamage;
        plant.waterLevel = Math.min(100, plant.waterLevel + (50 * effectiveIntensity));
        damagedPlants++;
        
        // Add negative modifier
        plant.growthModifiers.push({
          source: 'weather_storm',
          description: 'Storm damage',
          qualityModifier: -0.2 * effectiveIntensity,
          yieldModifier: -0.3 * effectiveIntensity,
          growthRateModifier: 0.8,
          expiresAt: Date.now() + (48 * 3600 * 1000) // 48 hours
        });
        break;
        
      case 'drought':
      case 'heat_wave':
        // Reduce water level
        plant.waterLevel = Math.max(0, plant.waterLevel - (20 * effectiveIntensity));
        
        // Damage if water level gets too low
        if (plant.waterLevel < 20) {
          plant.health -= 15 * effectiveIntensity;
          damagedPlants++;
          
          // Add negative modifier
          plant.growthModifiers.push({
            source: 'weather_drought',
            description: 'Drought stress',
            qualityModifier: -0.15 * effectiveIntensity,
            yieldModifier: -0.2 * effectiveIntensity,
            growthRateModifier: 0.85,
            expiresAt: Date.now() + (24 * 3600 * 1000) // 24 hours
          });
        } else {
          // Some plants thrive in heat if well-watered
          if (plant.geneticTraits.some(t => t.name === 'Hardy' || t.name === 'Drought-Resistant')) {
            plant.health = Math.min(100, plant.health + (3 * effectiveIntensity));
            improvedPlants++;
            
            // Add positive modifier for heat-loving plants
            plant.growthModifiers.push({
              source: 'weather_heat',
              description: 'Heat adaptation bonus',
              qualityModifier: 0.1 * effectiveIntensity,
              yieldModifier: 0.05 * effectiveIntensity,
              growthRateModifier: 1.05,
              expiresAt: Date.now() + (12 * 3600 * 1000) // 12 hours
            });
          }
        }
        break;
        
      case 'frost':
        // Cold damage to plants
        const frostDamage = 25 * effectiveIntensity;
        plant.health -= frostDamage;
        damagedPlants++;
        
        // Add negative modifier
        plant.growthModifiers.push({
          source: 'weather_frost',
          description: 'Frost damage',
          qualityModifier: -0.1 * effectiveIntensity,
          yieldModifier: -0.25 * effectiveIntensity,
          growthRateModifier: 0.7,
          expiresAt: Date.now() + (36 * 3600 * 1000) // 36 hours
        });
        break;
        
      case 'fog':
        // Increases moisture slightly
        plant.waterLevel = Math.min(100, plant.waterLevel + (10 * effectiveIntensity));
        
        // Some plants benefit from fog
        if (plant.geneticTraits.some(t => t.name === 'Adaptive' || t.name === 'Moisture-Loving')) {
          plant.health = Math.min(100, plant.health + (5 * effectiveIntensity));
          improvedPlants++;
          
          // Add positive modifier
          plant.growthModifiers.push({
            source: 'weather_fog',
            description: 'Fog moisture boost',
            qualityModifier: 0.1 * effectiveIntensity,
            yieldModifier: 0.05 * effectiveIntensity,
            growthRateModifier: 1.1 * effectiveIntensity,
            expiresAt: Date.now() + (8 * 3600 * 1000) // 8 hours
          });
        }
        break;
        
      case 'hail':
        // Physical damage to plants
        const hailDamage = 30 * effectiveIntensity;
        plant.health -= hailDamage;
        damagedPlants++;
        
        // More damage to flowering and mature plants
        if (plant.currentStage === 'flowering' || plant.currentStage === 'mature') {
          plant.health -= 10 * effectiveIntensity;
          
          // Add negative modifier
          plant.growthModifiers.push({
            source: 'weather_hail',
            description: 'Severe hail damage',
            qualityModifier: -0.3 * effectiveIntensity,
            yieldModifier: -0.4 * effectiveIntensity,
            growthRateModifier: 0.7,
            expiresAt: Date.now() + (72 * 3600 * 1000) // 72 hours
          });
        } else {
          // Add negative modifier for younger plants
          plant.growthModifiers.push({
            source: 'weather_hail',
            description: 'Hail damage',
            qualityModifier: -0.2 * effectiveIntensity,
            yieldModifier: -0.2 * effectiveIntensity,
            growthRateModifier: 0.8,
            expiresAt: Date.now() + (48 * 3600 * 1000) // 48 hours
          });
        }
        break;
        
      default:
        // Default mild weather has small positive effect
        plant.health = Math.min(100, plant.health + 2);
        improvedPlants++;
    }
    
    // Check for plant death
    if (plant.health <= 0) {
      plot.plant = null;
    }
    
    // Player response can provide additional effects
    if (playerResponse === 'water' && (weatherType === 'drought' || weatherType === 'heat_wave')) {
      // Watering during drought is very beneficial
      if (plot.plant) {
        (plot.plant as InteractivePlant).waterLevel = Math.min(100, (plot.plant as InteractivePlant).waterLevel + 50);
        (plot.plant as InteractivePlant).health = Math.min(100, (plot.plant as InteractivePlant).health + 10);
      }
    }
  });
  
  // Create result message
  let message = `${weatherType.charAt(0).toUpperCase() + weatherType.slice(1)} weather affected ${affectedPlots} garden plots.`;
  
  if (damagedPlants > 0) {
    message += ` ${damagedPlants} plants were damaged.`;
  }
  
  if (improvedPlants > 0) {
    message += ` ${improvedPlants} plants benefited from the conditions.`;
  }
  
  if (playerResponse !== 'none') {
    message += ` Your ${playerResponse} response helped mitigate effects.`;
  }
  
  return {
    updatedGarden,
    affectedPlots,
    damagedPlants,
    improvedPlants,
    message
  };
}