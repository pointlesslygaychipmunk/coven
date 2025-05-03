import { 
  Plant, 
  Season, 
  MoonPhase, 
  ElementType, 
  SoilType, 
  DisplayPlant,
  WeatherFate,
  GardenSlot
} from 'coven-shared';
import { DisplayGardenSlot, adaptPlantForDisplay } from './frontendCompatibility';

/**
 * Calculate growth increment based on environmental factors
 * @param plant The plant to calculate growth for
 * @param gardenSlot The garden slot containing the plant
 * @param season Current season
 * @param moonPhase Current moon phase
 * @param weatherFate Current weather
 * @returns Growth increment value for this turn
 */
export function calculateGrowthIncrement(
  plant: Plant | DisplayPlant,
  gardenSlot: GardenSlot | DisplayGardenSlot,
  season: Season,
  moonPhase: MoonPhase,
  weatherFate: WeatherFate
): number {
  if (!plant || plant.mature) return 0;

  // Base growth rate
  let growthIncrement = 1.0;
  
  // Soil fertility impact (0.5 to 1.5x multiplier)
  const fertilityMultiplier = 0.5 + (gardenSlot.fertility / 100);
  growthIncrement *= fertilityMultiplier;
  
  // Moisture impact (optimal around 40-80%)
  let moistureMultiplier = 1.0;
  const moisture = gardenSlot.moisture || 50;
  
  if (moisture < 20) {
    moistureMultiplier = 0.3; // Severely dry
  } else if (moisture < 40) {
    moistureMultiplier = 0.7; // Somewhat dry
  } else if (moisture > 90) {
    moistureMultiplier = 0.6; // Oversaturated
  } else if (moisture > 80) {
    moistureMultiplier = 0.8; // A bit too wet
  } else {
    moistureMultiplier = 1.0; // Optimal range
  }
  growthIncrement *= moistureMultiplier;
  
  // Seasonal impact
  const seasonalMultiplier = getSeasonalMultiplier(plant, season);
  growthIncrement *= seasonalMultiplier;
  
  // Moon phase impact
  const moonMultiplier = getMoonPhaseMultiplier(plant, moonPhase);
  growthIncrement *= moonMultiplier;
  
  // Weather impact
  const weatherMultiplier = getWeatherMultiplier(weatherFate);
  growthIncrement *= weatherMultiplier;
  
  // Soil compatibility
  const soilMultiplier = getSoilCompatibilityMultiplier(plant, gardenSlot.soilType);
  growthIncrement *= soilMultiplier;
  
  // Elemental harmony
  const elementalMultiplier = getElementalHarmonyMultiplier(plant, gardenSlot.elementalInfluence);
  growthIncrement *= elementalMultiplier;
  
  // Apply random variation (±10%)
  const randomVariation = 0.9 + (Math.random() * 0.2);
  growthIncrement *= randomVariation;
  
  // Ensure minimum growth
  return Math.max(0.1, growthIncrement);
}

/**
 * Get multiplier for seasonal effect on plant growth
 * @param plant Plant object
 * @param currentSeason Current season
 * @returns Seasonal growth multiplier
 */
export function getSeasonalMultiplier(plant: Plant | DisplayPlant, currentSeason: Season): number {
  // Get the plant's preferred season, store in a local variable for type guard
  let preferredSeason: Season | undefined = undefined;
  
  // If the plant has tarotCardId and the first part is the preferred season
  if ('tarotCardId' in plant && plant.tarotCardId) {
    const cardParts = plant.tarotCardId.split('_');
    if (cardParts.length > 1) {
      const seasonMap: Record<string, Season> = {
        'spring': 'Spring',
        'summer': 'Summer',
        'fall': 'Fall',
        'winter': 'Winter'
      };
      preferredSeason = seasonMap[cardParts[1].toLowerCase()] as Season;
    }
  }
  
  // If we have seasonalResonance directly, use that instead
  if ('seasonalResonance' in plant && plant.seasonalResonance !== undefined) {
    // Convert seasonalResonance (0-100) to a multiplier (0.5-1.5)
    return 0.5 + (plant.seasonalResonance / 100);
  }
  
  // If we have seasonalModifier directly, use that 
  if ('seasonalModifier' in plant && plant.seasonalModifier !== undefined) {
    return plant.seasonalModifier;
  }
  
  // If we couldn't determine from attributes, use default logic
  if (preferredSeason === currentSeason) {
    return 1.5; // Optimal season = 1.5x growth
  } else if (
    (preferredSeason === 'Spring' && currentSeason === 'Summer') ||
    (preferredSeason === 'Summer' && currentSeason === 'Fall') ||
    (preferredSeason === 'Fall' && currentSeason === 'Winter') ||
    (preferredSeason === 'Winter' && currentSeason === 'Spring')
  ) {
    return 1.0; // Adjacent season = normal growth
  } else {
    return 0.5; // Opposite season = 0.5x growth
  }
}

/**
 * Get multiplier for moon phase effect on plant growth
 * @param plant Plant object
 * @param currentMoonPhase Current moon phase
 * @returns Moon phase growth multiplier
 */
export function getMoonPhaseMultiplier(plant: Plant | DisplayPlant, currentMoonPhase: MoonPhase): number {
  // Get favored moon phase from tarotCardId
  let favoredMoonPhase: MoonPhase | undefined = undefined;
  
  // If the plant has moonBlessing or moonBlessed property, use that
  if ('moonBlessing' in plant && plant.moonBlessing !== undefined) {
    // Convert moonBlessing (0-100) to a multiplier (0.8-1.3)
    return 0.8 + (plant.moonBlessing / 200);
  }
  
  if ('moonBlessed' in plant && plant.moonBlessed) {
    return 1.3; // Moon blessed plants grow 1.3x faster
  }
  
  // If we couldn't determine from attributes, use default moon phase logic
  // Full moon benefits all plants
  if (currentMoonPhase === 'Full Moon') {
    return 1.25;
  }
  
  // New moon slightly reduces growth
  if (currentMoonPhase === 'New Moon') {
    return 0.9;
  }
  
  // Waxing phases slightly boost growth
  if (currentMoonPhase.includes('Waxing')) {
    return 1.1;
  }
  
  // Waning phases are neutral
  if (currentMoonPhase.includes('Waning')) {
    return 1.0;
  }
  
  // Default
  return 1.0;
}

/**
 * Get multiplier for weather effect on plant growth
 * @param weatherFate Current weather
 * @returns Weather growth multiplier
 */
export function getWeatherMultiplier(weatherFate: WeatherFate): number {
  switch (weatherFate) {
    case 'rainy':
      return 1.2; // Rainy weather boosts growth
    case 'dry':
      return 0.8; // Dry weather slows growth
    case 'foggy':
      return 1.1; // Foggy weather is slightly beneficial 
    case 'windy':
      return 0.9; // Windy weather is slightly detrimental
    case 'stormy':
      return 0.7; // Stormy weather significantly slows growth
    case 'clear':
      return 1.0; // Clear weather is neutral
    case 'cloudy':
      return 1.0; // Cloudy weather is neutral
    case 'normal':
    default:
      return 1.0; // Normal weather is neutral
  }
}

/**
 * Get multiplier for soil compatibility with plant
 * @param plant Plant object
 * @param soilType Current soil type
 * @returns Soil compatibility multiplier
 */
export function getSoilCompatibilityMultiplier(plant: Plant | DisplayPlant, soilType: SoilType): number {
  // Default soil preference based on plant category
  let preferredSoil: SoilType = 'loamy'; // Default preferred soil
  
  // Determine preferred soil based on plant category
  if ('category' in plant && plant.category) {
    switch (plant.category) {
      case 'herb':
        preferredSoil = 'loamy';
        break;
      case 'flower':
        preferredSoil = 'loamy';
        break;
      case 'root':
        preferredSoil = 'sandy';
        break;
      case 'mushroom':
        preferredSoil = 'peaty';
        break;
      case 'tree':
        preferredSoil = 'clay';
        break;
      default:
        preferredSoil = 'loamy';
    }
  }
  
  // Compare current soil to preferred soil
  if (soilType === preferredSoil) {
    return 1.3; // Optimal soil = 1.3x growth
  }
  
  // Some soils combinations are better than others
  const soilCompatibility: Record<SoilType, Record<SoilType, number>> = {
    'loamy': { 'loamy': 1.3, 'sandy': 1.0, 'clay': 0.9, 'chalky': 0.8, 'peaty': 1.1 },
    'sandy': { 'loamy': 1.0, 'sandy': 1.3, 'clay': 0.7, 'chalky': 0.9, 'peaty': 0.8 },
    'clay': { 'loamy': 0.9, 'sandy': 0.7, 'clay': 1.3, 'chalky': 0.8, 'peaty': 0.7 },
    'chalky': { 'loamy': 0.8, 'sandy': 0.9, 'clay': 0.8, 'chalky': 1.3, 'peaty': 0.6 },
    'peaty': { 'loamy': 1.1, 'sandy': 0.8, 'clay': 0.7, 'chalky': 0.6, 'peaty': 1.3 }
  };
  
  return soilCompatibility[preferredSoil][soilType];
}

/**
 * Get multiplier for elemental harmony with plant
 * @param plant Plant object
 * @param elementalInfluence Current elemental influence
 * @returns Elemental harmony multiplier
 */
export function getElementalHarmonyMultiplier(plant: Plant | DisplayPlant, elementalInfluence: ElementType): number {
  // Default element based on plant category
  let plantElement: ElementType = 'Earth'; // Default element
  
  // Determine plant element based on category
  if ('category' in plant && plant.category) {
    switch (plant.category) {
      case 'herb':
        plantElement = 'Air';
        break;
      case 'flower':
        plantElement = 'Water';
        break;
      case 'root':
        plantElement = 'Earth';
        break;
      case 'mushroom':
        plantElement = 'Spirit';
        break;
      case 'tree':
        plantElement = 'Earth';
        break;
      default:
        plantElement = 'Earth';
    }
  }
  
  // If plant has elementalHarmony property, use that
  if ('elementalHarmony' in plant && plant.elementalHarmony !== undefined) {
    // Convert elementalHarmony (0-100) to a multiplier (0.7-1.3)
    return 0.7 + (plant.elementalHarmony / 100) * 0.6;
  }
  
  // Compare elements for harmony
  // Elements have relationships: complementary, neutral, or opposing
  const elementRelations: Record<ElementType, Record<ElementType, string>> = {
    'Earth': { 'Earth': 'self', 'Water': 'complementary', 'Fire': 'opposing', 'Air': 'neutral', 'Spirit': 'neutral' },
    'Water': { 'Earth': 'complementary', 'Water': 'self', 'Fire': 'opposing', 'Air': 'neutral', 'Spirit': 'complementary' },
    'Fire': { 'Earth': 'opposing', 'Water': 'opposing', 'Fire': 'self', 'Air': 'complementary', 'Spirit': 'complementary' },
    'Air': { 'Earth': 'neutral', 'Water': 'neutral', 'Fire': 'complementary', 'Air': 'self', 'Spirit': 'complementary' },
    'Spirit': { 'Earth': 'neutral', 'Water': 'complementary', 'Fire': 'complementary', 'Air': 'complementary', 'Spirit': 'self' }
  };
  
  const relationship = elementRelations[plantElement][elementalInfluence];
  
  switch (relationship) {
    case 'self':
      return 1.2; // Same element = good harmony
    case 'complementary':
      return 1.3; // Complementary elements = best harmony
    case 'neutral':
      return 1.0; // Neutral relationship = no effect
    case 'opposing':
      return 0.7; // Opposing elements = negative effect
    default:
      return 1.0;
  }
}

/**
 * Update a plant's growth stage based on its growth progress
 * @param plant Plant to update
 * @returns Updated plant with appropriate growth stage
 */
export function updateGrowthStage(plant: Plant): Plant {
  if (!plant) return plant;
  
  const growthPercentage = (plant.growth / plant.maxGrowth) * 100;
  
  // Update growth stage based on progress
  let newGrowthStage = plant.growthStage;
  
  if (plant.mature) {
    newGrowthStage = 'mature';
  } else if (growthPercentage >= 75) {
    newGrowthStage = 'blooming';
  } else if (growthPercentage >= 50) {
    newGrowthStage = 'growing';
  } else if (growthPercentage >= 25) {
    newGrowthStage = 'sprout';
  } else {
    newGrowthStage = 'seed';
  }
  
  // Only update if changed
  if (newGrowthStage !== plant.growthStage) {
    return {
      ...plant,
      growthStage: newGrowthStage
    };
  }
  
  return plant;
}

/**
 * Simulate one turn of plant growth
 * @param plant Plant to grow
 * @param gardenSlot Garden slot containing the plant
 * @param season Current season
 * @param moonPhase Current moon phase
 * @param weatherFate Current weather
 * @returns Updated plant after growth
 */
export function simulatePlantGrowth(
  plant: Plant,
  gardenSlot: GardenSlot,
  season: Season,
  moonPhase: MoonPhase,
  weatherFate: WeatherFate
): Plant {
  if (!plant || plant.mature) return plant;
  
  // Calculate growth increment for this turn
  const growthIncrement = calculateGrowthIncrement(
    plant, 
    gardenSlot, 
    season, 
    moonPhase, 
    weatherFate
  );
  
  // Apply growth
  let newGrowth = plant.growth + growthIncrement;
  
  // Check if plant has reached maturity
  const isMature = newGrowth >= plant.maxGrowth;
  if (isMature) {
    newGrowth = plant.maxGrowth;
  }
  
  // Create updated plant
  const updatedPlant: Plant = {
    ...plant,
    growth: newGrowth,
    mature: isMature,
    age: plant.age + 1,
    watered: false, // Reset watered status for next turn
  };
  
  // Update growth stage
  return updateGrowthStage(updatedPlant);
}

/**
 * Calculate chance of plant mutation based on environmental factors
 * @param plant Plant to check for mutation
 * @param gardenSlot Garden slot containing the plant
 * @param moonPhase Current moon phase
 * @returns Mutation probability (0-1)
 */
export function calculateMutationChance(
  plant: Plant,
  gardenSlot: GardenSlot,
  moonPhase: MoonPhase
): number {
  // Base mutation chance is very low
  let mutationChance = 0.02; // 2% base chance
  
  // Increase chance during specific moon phases
  if (moonPhase === 'Full Moon') {
    mutationChance += 0.05; // +5% during full moon
  } else if (moonPhase === 'New Moon') {
    mutationChance += 0.03; // +3% during new moon
  }
  
  // Increase chance based on garden mana
  if (gardenSlot.currentMana > 0) {
    const manaBonus = Math.min(0.05, gardenSlot.currentMana / gardenSlot.manaCapacity * 0.05);
    mutationChance += manaBonus;
  }
  
  // Certain plant categories have higher mutation rates
  if (plant.tarotCardId?.includes('mushroom')) {
    mutationChance *= 1.5; // Mushrooms mutate more easily
  }
  
  // Plants with existing mutations are more likely to mutate again
  if (plant.mutations && plant.mutations.length > 0) {
    mutationChance *= (1 + (plant.mutations.length * 0.1));
  }
  
  return Math.min(0.2, mutationChance); // Cap at 20% maximum
}

/**
 * Decrease moisture level in a garden slot based on weather
 * @param moisture Current moisture level
 * @param weatherFate Current weather
 * @returns New moisture level
 */
export function simulateMoistureChange(moisture: number, weatherFate: WeatherFate): number {
  let moistureChange = 0;
  
  switch (weatherFate) {
    case 'rainy':
      moistureChange = 15; // Rain adds moisture
      break;
    case 'dry':
      moistureChange = -20; // Dry weather removes moisture quickly
      break;
    case 'foggy':
      moistureChange = 5; // Fog adds some moisture
      break;
    case 'windy':
      moistureChange = -15; // Wind dries out soil
      break;
    case 'stormy':
      moistureChange = 25; // Storms add lots of moisture
      break;
    case 'clear':
      moistureChange = -10; // Clear weather dries out soil moderately
      break;
    case 'cloudy':
      moistureChange = -5; // Cloudy weather dries out soil slightly
      break;
    case 'normal':
    default:
      moistureChange = -8; // Normal weather slowly dries out soil
  }
  
  // Apply change and clamp to valid range
  const newMoisture = Math.max(0, Math.min(100, moisture + moistureChange));
  return newMoisture;
}

/**
 * Water a plant and update the garden slot moisture
 * @param gardenSlot Garden slot to water
 * @param elementalBoost Optional elemental boost for watering
 * @returns Updated garden slot
 */
export function waterPlant(
  gardenSlot: GardenSlot, 
  elementalBoost?: ElementType
): GardenSlot {
  if (!gardenSlot || !gardenSlot.plant) return gardenSlot;
  
  // Base moisture increase
  let moistureIncrease = 35;
  
  // Apply elemental boost if applicable
  if (elementalBoost === 'Water') {
    moistureIncrease += 15; // Water element provides extra moisture
  }
  
  // Calculate new moisture level (capped at 100)
  const newMoisture = Math.min(100, (gardenSlot.moisture || 0) + moistureIncrease);
  
  // Update plant's watered status
  const updatedPlant: Plant = {
    ...gardenSlot.plant,
    watered: true
  };
  
  // Return updated garden slot
  return {
    ...gardenSlot,
    moisture: newMoisture,
    plant: updatedPlant
  };
}

/**
 * Check if a plant is at risk of dying due to neglect
 * @param plant Plant to check
 * @param moisture Current moisture level
 * @returns Risk level: 'none', 'low', 'medium', or 'high'
 */
export function calculateDeathRisk(
  plant: Plant | DisplayPlant,
  moisture: number
): 'none' | 'low' | 'medium' | 'high' {
  if (!plant) return 'none';
  
  // Check health
  const health = plant.health || 100;
  
  // Check moisture (both too dry and too wet are bad)
  const moistureRisk = 
    moisture < 10 ? 'high' :
    moisture < 20 ? 'medium' :
    moisture > 95 ? 'medium' :
    moisture > 90 ? 'low' : 'none';
  
  // Check health
  const healthRisk = 
    health < 20 ? 'high' :
    health < 40 ? 'medium' :
    health < 60 ? 'low' : 'none';
  
  // Return the highest risk level
  if (moistureRisk === 'high' || healthRisk === 'high') return 'high';
  if (moistureRisk === 'medium' || healthRisk === 'medium') return 'medium';
  if (moistureRisk === 'low' || healthRisk === 'low') return 'low';
  return 'none';
}

/**
 * Estimate how many days/phases until plant reaches maturity
 * @param plant Plant to check
 * @param gardenSlot Garden slot containing the plant
 * @param season Current season  
 * @param moonPhase Current moon phase
 * @param weatherFate Current weather
 * @returns Estimated phases until maturity
 */
export function estimateTimeToMaturity(
  plant: Plant | DisplayPlant,
  gardenSlot: GardenSlot | DisplayGardenSlot,
  season: Season,
  moonPhase: MoonPhase,
  weatherFate: WeatherFate
): number {
  if (!plant || plant.mature) return 0;
  
  // Calculate growth per turn
  const growthPerTurn = calculateGrowthIncrement(
    plant, 
    gardenSlot, 
    season, 
    moonPhase, 
    weatherFate
  );
  
  // Calculate remaining growth needed
  const remainingGrowth = (plant.maxGrowth - plant.growth);
  
  // Calculate estimated turns
  const estimatedTurns = Math.ceil(remainingGrowth / growthPerTurn);
  
  return estimatedTurns;
}