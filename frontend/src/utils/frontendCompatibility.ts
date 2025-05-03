import { 
  Plant, 
  GardenSlot, 
  InventoryItem, 
  Player, 
  MarketItem,
  TarotCard,
  ItemType,
  ItemCategory,
  Rarity,
  ElementType,
  Season,
  MoonPhase,
  SoilType
} from 'coven-shared';

// Import the existing compatibility functions from shared
import {
  createDefaultInventoryItem,
  createDefaultGardenSlot
} from 'coven-shared';

/**
 * Helper function to get name property compatible with old code
 */
export function getPlantName(plant: Plant): string {
  if (!plant || !plant.tarotCardId) return 'Unknown Plant';
  
  // In the new system, we'd look up the name from the tarot card
  // For now, extract from tarotCardId
  const parts = plant.tarotCardId.split('_');
  if (parts.length < 2) return 'Unknown Plant';
  return parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1).replace(/_/g, ' ');
}

/**
 * Frontend-compatible Plant type that includes properties required by UI components
 */
export interface DisplayPlant {
  id: string;
  name: string;
  growth: number;
  maxGrowth: number;
  health: number;
  mature: boolean;
  watered: boolean;
  age: number;
  category?: string;
  moonBlessed?: boolean;
  seasonalModifier?: number;
  mutations?: string[];
  tarotCardId?: string;
  // Additional properties from the new Plant type
  moonBlessing?: number;
  seasonalResonance?: number;
  elementalHarmony?: number;
  growthStage?: string;
  qualityModifier?: number;
  specialTraits?: string[];
  // Allow additional properties
  [key: string]: any;
}

/**
 * Frontend-compatible GardenSlot that includes properties required by UI components
 */
export interface DisplayGardenSlot {
  id: number;
  plant: DisplayPlant | null;
  fertility: number;
  moisture: number;
  sunlight: number;
  isUnlocked: boolean;
  soilType?: SoilType;
  elementalInfluence?: ElementType;
  manaCapacity?: number;
  currentMana?: number;
  manaFlowRate?: number;
  plotAppearance?: string;
  unlockCost?: number;
  // Allow additional properties
  [key: string]: any;
}

/**
 * Frontend-compatible InventoryItem that includes properties required by UI components
 */
export interface DisplayInventoryItem {
  id: string;
  baseId: string;
  name: string;
  type: ItemType | string;
  category: ItemCategory | string;
  quantity: number;
  quality?: number;
  value?: number;
  rarity?: Rarity | string;
  description?: string;
  imagePath?: string;
  bookmarked?: boolean;
  // New tarot card properties
  tarotCardId?: string;
  elementalPower?: number;
  moonAlignment?: number;
  seasonalPotency?: number;
  essenceCharge?: number;
  // Allow additional properties
  [key: string]: any;
}

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
 * Convert a GardenSlot to a DisplayGardenSlot for UI components
 */
export function adaptGardenSlotForDisplay(slot: GardenSlot): DisplayGardenSlot {
  return {
    id: slot.id,
    plant: slot.plant ? adaptPlantForDisplay(slot.plant) : null,
    fertility: slot.fertility,
    moisture: slot.moisture,
    sunlight: slot.sunlight,
    isUnlocked: slot.isUnlocked,
    soilType: slot.soilType,
    elementalInfluence: slot.elementalInfluence,
    manaCapacity: slot.manaCapacity,
    currentMana: slot.currentMana,
    manaFlowRate: slot.manaFlowRate,
    plotAppearance: slot.plotAppearance,
    unlockCost: slot.unlockCost
  };
}

/**
 * Convert an array of GardenSlots to DisplayGardenSlots for UI components
 */
export function adaptGardenForDisplay(garden: GardenSlot[]): DisplayGardenSlot[] {
  return garden.map(slot => adaptGardenSlotForDisplay(slot));
}

/**
 * Convert an InventoryItem to a DisplayInventoryItem for UI components
 */
export function adaptInventoryItemForDisplay(item: InventoryItem): DisplayInventoryItem {
  return {
    id: item.id,
    baseId: item.baseId,
    name: item.name,
    type: item.type,
    category: item.category,
    quantity: item.quantity,
    quality: item.quality,
    value: item.value,
    rarity: item.rarity,
    description: item.description,
    imagePath: item.imagePath,
    bookmarked: item.bookmarked,
    tarotCardId: item.tarotCardId,
    elementalPower: item.elementalPower,
    moonAlignment: item.moonAlignment,
    seasonalPotency: item.seasonalPotency,
    essenceCharge: item.essenceCharge
  };
}

/**
 * Convert an array of InventoryItems to DisplayInventoryItems for UI components
 */
export function adaptInventoryForDisplay(inventory: InventoryItem[]): DisplayInventoryItem[] {
  return inventory.map(item => adaptInventoryItemForDisplay(item));
}

/**
 * Create a DisplayInventoryItem from basic properties
 */
export function createDisplayInventoryItem(props: Partial<DisplayInventoryItem>): DisplayInventoryItem {
  // First create a basic inventory item
  const baseItem = createDefaultInventoryItem({
    id: props.id,
    baseId: props.baseId,
    name: props.name || 'Unknown Item',
    type: props.type as any,
    category: props.category as any,
    quantity: props.quantity || 1,
    quality: props.quality,
    value: props.value,
    rarity: props.rarity as any,
    description: props.description
  });
  
  // Then adapt it for display
  return adaptInventoryItemForDisplay(baseItem);
}

/**
 * Create a new blank DisplayPlant (useful for testing or placeholders)
 */
export function createBlankDisplayPlant(name: string = 'Unknown Plant'): DisplayPlant {
  return {
    id: `plant-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name,
    category: 'herb',
    growth: 0,
    maxGrowth: 100,
    health: 100,
    mature: false,
    watered: false,
    age: 0,
    moonBlessed: false,
    seasonalModifier: 1.0,
    mutations: [],
    tarotCardId: `herb_${name.toLowerCase().replace(/\s+/g, '_')}`,
    moonBlessing: 50,
    seasonalResonance: 50,
    elementalHarmony: 50,
    growthStage: 'seed',
    qualityModifier: 50,
    specialTraits: []
  };
}

/**
 * Convert a DisplayPlant back to a Plant (for sending to backend)
 * This is useful when a component modifies a DisplayPlant and needs to send it back to the backend
 */
export function convertDisplayPlantToPlant(displayPlant: DisplayPlant): Plant {
  return {
    id: displayPlant.id,
    tarotCardId: displayPlant.tarotCardId || `${displayPlant.category || 'herb'}_${displayPlant.name.toLowerCase().replace(/\s+/g, '_')}`,
    growth: displayPlant.growth,
    maxGrowth: displayPlant.maxGrowth,
    health: displayPlant.health,
    watered: displayPlant.watered,
    age: displayPlant.age,
    mature: displayPlant.mature,
    moonBlessing: displayPlant.moonBlessing || (displayPlant.moonBlessed ? 75 : 25),
    seasonalResonance: displayPlant.seasonalResonance || (displayPlant.seasonalModifier ? displayPlant.seasonalModifier * 100 : 50),
    elementalHarmony: displayPlant.elementalHarmony || 50,
    qualityModifier: displayPlant.qualityModifier || 50,
    growthStage: displayPlant.growthStage as any || 'seed',
    mutations: displayPlant.mutations || [],
    specialTraits: displayPlant.specialTraits || []
  };
}

/**
 * Create a mock DisplayPlant for testing or placeholders
 */
export function createMockDisplayPlant(
  overrides: Partial<DisplayPlant> = {}
): DisplayPlant {
  const name = overrides.name || 'Mock Plant';
  const category = overrides.category || 'herb';
  return {
    id: overrides.id || `mock-plant-${Date.now()}`,
    name: name,
    category: category,
    growth: overrides.growth !== undefined ? overrides.growth : 50,
    maxGrowth: overrides.maxGrowth || 100,
    health: overrides.health !== undefined ? overrides.health : 75,
    mature: overrides.mature !== undefined ? overrides.mature : false,
    watered: overrides.watered !== undefined ? overrides.watered : true,
    age: overrides.age || 3,
    moonBlessed: overrides.moonBlessed !== undefined ? overrides.moonBlessed : false,
    seasonalModifier: overrides.seasonalModifier !== undefined ? overrides.seasonalModifier : 1.0,
    mutations: overrides.mutations || [],
    tarotCardId: overrides.tarotCardId || `${category}_${name.toLowerCase().replace(/\s+/g, '_')}`,
    moonBlessing: overrides.moonBlessing !== undefined ? overrides.moonBlessing : 50,
    seasonalResonance: overrides.seasonalResonance !== undefined ? overrides.seasonalResonance : 50,
    elementalHarmony: overrides.elementalHarmony !== undefined ? overrides.elementalHarmony : 50,
    growthStage: overrides.growthStage || 'growing',
    qualityModifier: overrides.qualityModifier !== undefined ? overrides.qualityModifier : 50,
    specialTraits: overrides.specialTraits || []
  };
}

/**
 * Create a mock DisplayGardenSlot with an optional plant
 */
export function createMockDisplayGardenSlot(
  id: number,
  plant: DisplayPlant | null = null,
  overrides: Partial<DisplayGardenSlot> = {}
): DisplayGardenSlot {
  return {
    id: id,
    plant: plant,
    fertility: overrides.fertility !== undefined ? overrides.fertility : 75,
    moisture: overrides.moisture !== undefined ? overrides.moisture : 60,
    sunlight: overrides.sunlight !== undefined ? overrides.sunlight : 80,
    isUnlocked: overrides.isUnlocked !== undefined ? overrides.isUnlocked : true,
    soilType: overrides.soilType || 'loamy',
    elementalInfluence: overrides.elementalInfluence || 'Earth',
    manaCapacity: overrides.manaCapacity !== undefined ? overrides.manaCapacity : 100,
    currentMana: overrides.currentMana !== undefined ? overrides.currentMana : 25,
    manaFlowRate: overrides.manaFlowRate !== undefined ? overrides.manaFlowRate : 1,
    plotAppearance: overrides.plotAppearance || 'normal',
    unlockCost: overrides.unlockCost
  };
}

/**
 * Create a mock garden with a specified number of plots
 */
export function createMockGarden(
  size: number = 9,
  plantedSlots: number[] = []
): DisplayGardenSlot[] {
  const garden: DisplayGardenSlot[] = [];
  for (let i = 0; i < size; i++) {
    let plant: DisplayPlant | null = null;
    if (plantedSlots.includes(i)) {
      // Create mock plants with different characteristics for variety
      const plantTypes = ['herb', 'flower', 'root', 'mushroom'];
      const plantNames = ['Chamomile', 'Lavender', 'Ginseng', 'Shiitake', 'Rose', 'Mint', 'Ginger', 'Sage'];
      const randomName = plantNames[Math.floor(Math.random() * plantNames.length)];
      const randomType = plantTypes[Math.floor(Math.random() * plantTypes.length)];
      const growth = Math.floor(Math.random() * 100);
      
      plant = createMockDisplayPlant({
        name: randomName,
        category: randomType,
        growth: growth,
        mature: growth >= 95,
        moonBlessed: Math.random() > 0.7
      });
    }
    
    garden.push(createMockDisplayGardenSlot(i, plant, {
      isUnlocked: i < 3 || Math.random() > 0.5, // First 3 plots always unlocked
      unlockCost: i >= 3 ? 500 + (i * 250) : undefined // Increasing cost for higher plots
    }));
  }
  
  return garden;
}

/**
 * Type guard to check if a plant is a DisplayPlant
 */
export function isDisplayPlant(plant: unknown): plant is DisplayPlant {
  return plant !== null && 
         typeof plant === 'object' && 
         plant !== undefined && 
         'name' in (plant as object);
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

/**
 * Calculate and return growth stage description based on plant's growth progress
 * @param plant Plant object with growth properties
 * @returns string representing the growth stage
 */
export function getGrowthStage(plant: DisplayPlant | null): string {
  if (!plant || plant.growth === undefined || plant.maxGrowth === undefined) {
    return 'empty';
  }
  
  if (plant.mature) return 'mature';
  
  const growthPercentage = (plant.growth / plant.maxGrowth) * 100;
  
  if (growthPercentage < 25) return 'seedling';
  if (growthPercentage < 50) return 'sprout';
  if (growthPercentage < 75) return 'growing';
  return 'maturing';
}

/**
 * Get a CSS class based on plant health
 * @param plant Plant object with health property
 * @returns string representing health class for styling
 */
export function getHealthClass(plant: DisplayPlant | null): string {
  if (!plant || plant.health === undefined) return '';
  
  if (plant.health < 30) return 'unhealthy';
  if (plant.health < 70) return 'fair';
  return 'healthy';
}

/**
 * Calculate growth percentage for a plant
 * @param plant Plant object with growth properties
 * @returns number representing growth percentage (0-100)
 */
export function getGrowthPercentage(plant: DisplayPlant | null): number {
  if (!plant || plant.growth === undefined || plant.maxGrowth === undefined) {
    return 0;
  }
  
  return Math.min(100, Math.max(0, (plant.growth / plant.maxGrowth) * 100));
}

/**
 * Determine if a plant needs water based on moisture level
 * @param plant Plant object
 * @param moisture Current moisture level
 * @returns boolean indicating if the plant needs water
 */
export function needsWater(plant: DisplayPlant | null, moisture: number = 50): boolean {
  if (!plant || plant.mature) return false;
  return moisture < 40;
}

/**
 * Get moisture level class for styling
 * @param moisture Moisture level value
 * @returns string representing moisture class for styling
 */
export function getMoistureClass(moisture: number = 50): string {
  if (moisture < 30) return 'dry';
  if (moisture > 80) return 'wet';
  return 'normal';
}

/**
 * Get plant category CSS class
 * @param plant Plant object
 * @returns string representing the plant category class
 */
export function getPlantCategoryClass(plant: DisplayPlant | null): string {
  if (!plant) return '';
  return plant.category ? plant.category.toLowerCase() : 'herb';
}

/**
 * Get weather icon and label based on weather fate
 * @param weatherFate The current weather condition
 * @returns Object with icon and label properties
 */
export function getWeatherInfo(weatherFate: string): { icon: string; label: string } {
  let icon: string;
  let label: string = weatherFate.charAt(0).toUpperCase() + weatherFate.slice(1);

  switch (weatherFate) {
    case 'rainy': icon = '🌧️'; break;
    case 'dry': icon = '☀️'; break;
    case 'foggy': icon = '🌫️'; break;
    case 'windy': icon = '💨'; break;
    case 'stormy': icon = '⛈️'; break;
    case 'normal': default: icon = '🌤️'; label = 'Clear'; break;
  }

  return { icon, label };
}

/**
 * Get season icon based on season name
 * @param season The current season
 * @returns Object with icon and CSS class
 */
export function getSeasonInfo(season: string): { icon: string; className: string } {
  let icon: string;
  let className = season.toLowerCase();
  
  switch (season) {
    case 'Spring': icon = '🌱'; break;
    case 'Summer': icon = '☀️'; break;
    case 'Fall': case 'Autumn': icon = '🍂'; break;
    case 'Winter': icon = '❄️'; break;
    default: icon = '❔'; className = 'unknown';
  }

  return { icon, className };
}

/**
 * Get moon phase icon and information
 * @param moonPhase The current moon phase
 * @returns Object with icon and description
 */
export function getMoonPhaseInfo(moonPhase: string): { icon: string; description: string } {
  let icon = '🌓'; // Default
  let description = '';
  
  if (moonPhase === 'Full Moon') {
    icon = '🌕';
    description = "The Full Moon greatly enhances magical potency.";
  } else if (moonPhase === 'New Moon') {
    icon = '🌑';
    description = "The New Moon makes magic more unpredictable but potentially more powerful.";
  } else if (moonPhase.includes('Waxing')) {
    icon = '🌔';
    description = "The Waxing Moon enhances growth and manifestation magic.";
  } else if (moonPhase.includes('Waning')) {
    icon = '🌒';
    description = "The Waning Moon enhances banishing and cleansing magic.";
  }
  
  return { icon, description };
}

/**
 * Calculate mana generation based on card properties and environmental factors
 * @param card Tarot card data
 * @param plant Plant data
 * @param moonPhase Current moon phase
 * @param season Current season
 * @returns Number representing mana generation amount
 */
export function calculateManaGeneration(
  card: any, 
  plant: DisplayPlant | null, 
  moonPhase: string, 
  season: string
): number {
  if (!card || !plant || !plant.mature) return 0;
  
  // Skip non-tree plants or plants without mana generation
  if (card.type !== 'tree' || !card.manaGeneration) return 0;
  
  // Calculate mana based on card properties, growth stage, and alignment
  const baseMana = card.manaGeneration || 0;
  const moonBonus = card.moonPhaseAffinity === moonPhase ? 1.5 : 1;
  const seasonBonus = card.seasonAffinity === season ? 1.3 : 1;
  
  // Mature trees generate more mana
  return baseMana * moonBonus * seasonBonus * (plant.mature ? 1 : 0.2);
}

/**
 * Import paths for the tarot system modules
 * These paths help components find the right modules
 */
export const MODULE_PATHS = {
  TAROT_CARDS: '../shared/src/tarotCards',
  BREWING_METHODS: '../shared/src/brewingMethods',
  RITUAL_SYSTEM: '../shared/src/ritualSystem'
}