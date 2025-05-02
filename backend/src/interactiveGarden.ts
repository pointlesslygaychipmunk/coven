import { 
  Season, 
  MoonPhase, 
  WeatherCondition,
  ItemQuality,
  Ingredient,
  PlantStage,
  GardenPlot,
  PlantVariety 
} from '../../shared/src/types';

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
  sunny: 1.2
};

const SEASONAL_AFFINITY: Record<Season, string[]> = {
  spring: ['floral', 'green', 'fresh'],
  summer: ['fruity', 'vibrant', 'warm'],
  fall: ['earthy', 'spicy', 'woody'],
  winter: ['cool', 'crisp', 'soothing']
};

const LUNAR_POTENCY: Record<MoonPhase, number> = {
  new: 0.8,
  waxingCrescent: 0.9,
  firstQuarter: 1.0,
  waxingGibbous: 1.1,
  full: 1.3,
  waningGibbous: 1.1,
  lastQuarter: 1.0,
  waningCrescent: 0.9
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
  traitInheritance: {
    fromParent1: PlantTrait[];
    fromParent2: PlantTrait[];
    newMutations: PlantTrait[];
  };
  rarityTier: number;
}

// Functions for interactive garden gameplay

/**
 * Initiates a planting mini-game and returns the result of player's performance
 * Affects initial growth conditions and potential quality
 */
export function playPlantingMiniGame(
  player: { id: string; gardeningSkill: number },
  plot: GardenPlot,
  varietyId: string,
  playScore: { timing: number; precision: number; pattern: number }
): PlantingMiniGame {
  // Calculate base success chance based on player skill and plot condition
  const baseSuccess = 0.7 + (player.gardeningSkill * 0.01) + (plot.soilQuality * 0.05);
  
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
  const soilQuality = plot.soilQuality * (1 + (performanceScore * 0.3));
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
  plot: GardenPlot,
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
  const weatherModifier = WEATHER_EFFECT_MULTIPLIERS[currentWeather];
  const lunarModifier = LUNAR_POTENCY[currentMoonPhase];
  
  // Calculate growth time
  const baseGrowthTime = GROWTH_CYCLE_BASE_TIME * variety.growthTimeDays;
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
  
  // Create new plant object
  return {
    id: plantId,
    varietyId: variety.id,
    plotId: plot.id,
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
    careHistory: [initialCareAction]
  };
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
  const baseQuality = variety.baseQuality;
  
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
  const baseYield = variety.baseYield;
  
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
    spring: 'fall',
    summer: 'winter',
    fall: 'spring',
    winter: 'summer'
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
                              currentWeather === 'sunny' ? 1.3 : 1.0;
  
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
  if (currentWeather === 'sunny' || currentWeather === 'windy') {
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
      name: `Harvested ${plant.varietyId}`,
      quality: itemQuality,
      harvestedAt: now,
      sourceType: 'garden',
      sourceId: plant.id,
      traits: plant.geneticTraits.map(trait => trait.name),
      // Add other required properties based on the Ingredient type
    } as Ingredient);
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
                          weatherEvent === 'sunny' && plant.waterLevel < 30 ? 18 :
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
  const lunarBonus = currentMoonPhase === 'full' ? 0.2 :
                     currentMoonPhase === 'new' ? -0.1 :
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
  const parent1Name = plant1.varietyId.split('_').pop() || 'Unknown';
  const parent2Name = plant2.varietyId.split('_').pop() || 'Unknown';
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
  const waterLossRate = currentWeather === 'sunny' ? 3 : 
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
  baseGrowthRate *= WEATHER_EFFECT_MULTIPLIERS[currentWeather];
  
  // Apply lunar modifier
  baseGrowthRate *= LUNAR_POTENCY[currentMoonPhase];
  
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
  } else if (updatedPlant.growthProgress >= 60) {
    updatedPlant.currentStage = 'flowering';
  } else if (updatedPlant.growthProgress >= 30) {
    updatedPlant.currentStage = 'growing';
  } else if (updatedPlant.growthProgress >= 5) {
    updatedPlant.currentStage = 'seedling';
  }
  
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