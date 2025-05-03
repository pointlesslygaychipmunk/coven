// Frontend compatibility utilities
import { Plant, DisplayPlant } from './types.js';
import { getPlantName } from './compatibility.js';

/**
 * Convert a Plant to a DisplayPlant for UI components
 */
export function adaptPlantForDisplay(plant: Plant | null): DisplayPlant | null {
  if (!plant) return null;
  
  return {
    id: plant.id,
    name: getPlantName(plant),
    growth: plant.growth,
    maxGrowth: plant.maxGrowth,
    health: plant.health,
    mature: plant.mature,
    watered: plant.watered,
    age: plant.age,
    category: plant.tarotCardId?.split('_')[0],
    moonBlessed: plant.moonBlessing ? plant.moonBlessing > 50 : false,
    seasonalModifier: plant.seasonalResonance ? plant.seasonalResonance / 100 : 1,
    mutations: plant.mutations || [],
    tarotCardId: plant.tarotCardId,
    moonBlessing: plant.moonBlessing,
    seasonalResonance: plant.seasonalResonance,
    elementalHarmony: plant.elementalHarmony,
    growthStage: plant.growthStage,
    qualityModifier: plant.qualityModifier,
    specialTraits: plant.specialTraits
  };
}

/**
 * Type guard to check if a plant is a DisplayPlant
 */
export function isDisplayPlant(plant: any): plant is DisplayPlant {
  return plant && typeof plant === 'object' && 'name' in plant;
}

/**
 * Helper to get a plant icon based on category or name
 * @param plantNameOrCategory The plant category or name
 * @param growthStage Optional growth stage to return different icons based on growth
 * @returns Emoji icon representing the plant
 */
export function getPlantIcon(plantNameOrCategory: string, growthStage?: string): string {
  if (!plantNameOrCategory) return '🌱'; // Default for empty input
  
  const lowerCaseInput = plantNameOrCategory.toLowerCase();
  
  // Handle based on growth stage if provided
  if (growthStage) {
    if (growthStage === 'seed' || growthStage === 'seedling') return '🌱';
    if (growthStage === 'sprout') return '🌿';
    // Continue with category-based icon for more mature stages
  }
  
  // Herb category
  if (lowerCaseInput.includes('herb') || 
      lowerCaseInput.includes('mint') || 
      lowerCaseInput.includes('sage') ||
      lowerCaseInput.includes('basil') ||
      lowerCaseInput.includes('thyme') ||
      lowerCaseInput.includes('parsley') ||
      lowerCaseInput.includes('medicinal')) {
    return '🌿';
  }
  
  // Flower category
  if (lowerCaseInput.includes('flower') || 
      lowerCaseInput.includes('rose') || 
      lowerCaseInput.includes('blossom') ||
      lowerCaseInput.includes('lily') ||
      lowerCaseInput.includes('tulip') ||
      lowerCaseInput.includes('daisy') ||
      lowerCaseInput.includes('orchid') ||
      lowerCaseInput.includes('lotus')) {
    
    // Specific flower types
    if (lowerCaseInput.includes('sunflower')) return '🌻';
    if (lowerCaseInput.includes('rose')) return '🌹';
    if (lowerCaseInput.includes('hibiscus')) return '🌺';
    if (lowerCaseInput.includes('tulip')) return '🌷';
    
    // Default flower
    return '🌸';
  }
  
  // Root and vegetable category
  if (lowerCaseInput.includes('root') || 
      lowerCaseInput.includes('ginseng') || 
      lowerCaseInput.includes('ginger') ||
      lowerCaseInput.includes('tuber') ||
      lowerCaseInput.includes('turnip') ||
      lowerCaseInput.includes('radish') ||
      lowerCaseInput.includes('vegetable')) {
    
    // Specific root/vegetable types
    if (lowerCaseInput.includes('carrot')) return '🥕';
    if (lowerCaseInput.includes('potato')) return '🥔';
    if (lowerCaseInput.includes('onion')) return '🧅';
    if (lowerCaseInput.includes('garlic')) return '🧄';
    
    // Default root
    return '🥕';
  }
  
  // Mushroom category
  if (lowerCaseInput.includes('mushroom') || 
      lowerCaseInput.includes('shiitake') || 
      lowerCaseInput.includes('fungi') ||
      lowerCaseInput.includes('toadstool') ||
      lowerCaseInput.includes('mycology')) {
    return '🍄';
  }
  
  // Fruit category
  if (lowerCaseInput.includes('fruit') || 
      lowerCaseInput.includes('berry') ||
      lowerCaseInput.includes('apple') ||
      lowerCaseInput.includes('cherry') ||
      lowerCaseInput.includes('grape')) {
    
    // Specific fruit types
    if (lowerCaseInput.includes('apple')) return '🍎';
    if (lowerCaseInput.includes('pear')) return '🍐';
    if (lowerCaseInput.includes('orange') || lowerCaseInput.includes('citrus')) return '🍊';
    if (lowerCaseInput.includes('lemon')) return '🍋';
    if (lowerCaseInput.includes('banana')) return '🍌';
    if (lowerCaseInput.includes('watermelon')) return '🍉';
    if (lowerCaseInput.includes('grape')) return '🍇';
    if (lowerCaseInput.includes('strawberry') || lowerCaseInput.includes('berry')) return '🍓';
    if (lowerCaseInput.includes('cherry')) return '🍒';
    if (lowerCaseInput.includes('peach')) return '🍑';
    
    // Default fruit
    return '🍎';
  }
  
  // Tree category
  if (lowerCaseInput.includes('tree') || 
      lowerCaseInput.includes('oak') || 
      lowerCaseInput.includes('pine') ||
      lowerCaseInput.includes('maple') ||
      lowerCaseInput.includes('sapling')) {
    
    // Specific tree types
    if (lowerCaseInput.includes('pine') || 
        lowerCaseInput.includes('spruce') || 
        lowerCaseInput.includes('evergreen')) return '🌲';
    if (lowerCaseInput.includes('palm')) return '🌴';
    
    // Default tree
    return '🌳';
  }
  
  // Seed or young stage
  if (lowerCaseInput.includes('seed') || lowerCaseInput.includes('sprout')) {
    return '🌱';
  }
  
  // Magical or special plants
  if (lowerCaseInput.includes('magic') || 
      lowerCaseInput.includes('mystic') || 
      lowerCaseInput.includes('enchanted')) {
    return '✨🌿';
  }
  
  // Default for unknown types
  return '🌱';
}