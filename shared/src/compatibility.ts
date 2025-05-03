// Compatibility layer for transitioning between old and new data structures
import { 
  Plant, 
  GardenSlot, 
  InventoryItem, 
  Player, 
  MarketItem,
  ElementType,
  SoilType,
  ItemCategory,
  ItemType,
  Rarity
} from './types.js';

/**
 * Legacy Plant type - for backward compatibility 
 * This mirrors the old type used in backend/src/gameEngine.ts etc.
 */
export type PlantLegacy = {
  id: string;
  name: string;
  category?: string;
  imagePath?: string;
  growth: number;
  maxGrowth: number;
  seasonalModifier?: number;
  watered: boolean;
  health: number;
  age: number;
  mature: boolean;
  moonBlessed?: boolean;
  deathChance?: number;
  mutations?: string[];
  qualityModifier?: number;
};

/**
 * Helper function to get name property compatible with old code
 */
export function getPlantName(plant: Plant): string {
  // In the new system, we'd look up the name from the tarot card
  // For now, extract from tarotCardId
  const parts = plant.tarotCardId.split('_');
  return parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1);
}

/**
 * Convert new Plant type to the legacy format for backward compatibility
 */
export function toLegacyPlant(plant: Plant): PlantLegacy {
  return {
    id: plant.id,
    name: getPlantName(plant),
    // Convert the new format properties to legacy format
    category: plant.tarotCardId.split('_')[0], // Extract category from tarotCardId
    growth: plant.growth,
    maxGrowth: plant.maxGrowth,
    seasonalModifier: plant.seasonalResonance / 100,
    watered: plant.watered,
    health: plant.health,
    age: plant.age,
    mature: plant.mature,
    moonBlessed: plant.moonBlessing > 50, // Convert numeric blessing to boolean
    deathChance: plant.health < 50 ? (50 - plant.health) / 100 : 0,
    mutations: plant.mutations || [],
    qualityModifier: plant.qualityModifier
  };
}

/**
 * Convert legacy Plant to new format
 */
export function fromLegacyPlant(legacyPlant: PlantLegacy): Plant {
  // Generate tarotCardId based on name and category
  const category = legacyPlant.category || 'herb';
  const normalizedName = legacyPlant.name.toLowerCase().replace(/\s+/g, '_');
  const tarotCardId = `${category}_${normalizedName}`;

  return {
    id: legacyPlant.id,
    tarotCardId,
    growth: legacyPlant.growth,
    maxGrowth: legacyPlant.maxGrowth,
    health: legacyPlant.health,
    watered: legacyPlant.watered,
    age: legacyPlant.age,
    mature: legacyPlant.mature,
    qualityModifier: legacyPlant.qualityModifier || 50,
    moonBlessing: legacyPlant.moonBlessed ? 75 : 25,
    seasonalResonance: (legacyPlant.seasonalModifier || 0.5) * 100,
    elementalHarmony: 50, // Default middle value
    growthStage: getGrowthStage(legacyPlant),
    mutations: legacyPlant.mutations || [],
    specialTraits: []
  };
}

/**
 * Helper to determine growth stage
 */
function getGrowthStage(plant: PlantLegacy): 'seed' | 'sprout' | 'growing' | 'mature' | 'blooming' | 'dying' {
  if (plant.health < 20) return 'dying';
  if (plant.mature) return 'mature';
  
  const growthPercent = plant.growth / plant.maxGrowth;
  
  if (growthPercent < 0.1) return 'seed';
  if (growthPercent < 0.4) return 'sprout';
  return 'growing';
}

/**
 * Legacy GardenSlot type for backward compatibility
 */
export type GardenSlotLegacy = {
  id: number;
  plant: PlantLegacy | null;
  fertility: number;
  moisture: number;
  sunlight: number;
  isUnlocked: boolean;
};

/**
 * Convert new GardenSlot to legacy format
 */
export function toLegacyGardenSlot(slot: GardenSlot): GardenSlotLegacy {
  return {
    id: slot.id,
    plant: slot.plant ? toLegacyPlant(slot.plant) : null,
    fertility: slot.fertility,
    moisture: slot.moisture,
    sunlight: slot.sunlight,
    isUnlocked: slot.isUnlocked
  };
}

/**
 * Convert legacy GardenSlot to new format
 */
export function fromLegacyGardenSlot(legacySlot: GardenSlotLegacy): GardenSlot {
  return {
    id: legacySlot.id,
    plant: legacySlot.plant ? fromLegacyPlant(legacySlot.plant) : null,
    fertility: legacySlot.fertility,
    moisture: legacySlot.moisture,
    soilType: 'loamy' as SoilType, // Default soil type
    sunlight: legacySlot.sunlight,
    elementalInfluence: 'Earth' as ElementType, // Default element
    manaCapacity: 100, // Default values
    currentMana: 0,
    manaFlowRate: 1,
    isUnlocked: legacySlot.isUnlocked,
    unlockCost: legacySlot.isUnlocked ? undefined : 1000,
    plotAppearance: 'normal'
  };
}

/**
 * Legacy InventoryItem type for backward compatibility
 */
export type InventoryItemLegacy = {
  id: string;
  baseId: string;
  name: string;
  type: string;
  category: string;
  quantity: number;
  quality?: number;
  value?: number;
  rarity?: string;
  description?: string;
  imagePath?: string;
  bookmarked?: boolean;
};

/**
 * Convert new InventoryItem to legacy format
 */
export function toLegacyInventoryItem(item: InventoryItem): InventoryItemLegacy {
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
    bookmarked: item.bookmarked
  };
}

/**
 * Convert legacy InventoryItem to new format
 */
export function fromLegacyInventoryItem(legacyItem: InventoryItemLegacy): InventoryItem {
  // Generate a default tarotCardId based on category and name
  const category = legacyItem.category || 'misc';
  const normalizedName = legacyItem.name.toLowerCase().replace(/\s+/g, '_');
  const tarotCardId = `${category}_${normalizedName}`;

  return {
    id: legacyItem.id,
    baseId: legacyItem.baseId,
    name: legacyItem.name,
    type: legacyItem.type as ItemType,
    category: legacyItem.category as ItemCategory,
    quantity: legacyItem.quantity,
    quality: legacyItem.quality,
    value: legacyItem.value,
    rarity: legacyItem.rarity as Rarity,
    description: legacyItem.description,
    imagePath: legacyItem.imagePath,
    tarotCardId: tarotCardId,
    elementalPower: 50, // Default values
    moonAlignment: 50,
    seasonalPotency: 50,
    essenceCharge: 50,
    activeEffects: [],
    combosPotential: 30,
    bookmarked: legacyItem.bookmarked,
    inUse: false
  };
}

/**
 * Create a default InventoryItem that matches the new format
 */
export function createDefaultInventoryItem(props: Partial<InventoryItemLegacy>): InventoryItem {
  const baseItem: InventoryItemLegacy = {
    id: props.id || `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    baseId: props.baseId || props.id || 'default_item',
    name: props.name || 'Unknown Item',
    type: props.type || 'ingredient',
    category: props.category || 'misc',
    quantity: props.quantity || 1,
    quality: props.quality || 50,
    value: props.value || 10,
    rarity: props.rarity || 'common',
    description: props.description || 'An item.',
    bookmarked: false
  };
  
  return fromLegacyInventoryItem(baseItem);
}

/**
 * Legacy MarketItem type for backward compatibility
 */
export type MarketItemLegacy = {
  id: string;
  name: string;
  type: string;
  category: string;
  price: number;
  basePrice: number;
  description?: string;
  rarity: string;
  priceHistory: number[];
  lastPriceChange: number;
};

/**
 * Convert legacy MarketItem to new format
 */
export function fromLegacyMarketItem(legacyItem: MarketItemLegacy): MarketItem {
  // Generate a default tarotCardId based on category and name
  const category = legacyItem.category || 'misc';
  const normalizedName = legacyItem.name.toLowerCase().replace(/\s+/g, '_');
  const tarotCardId = `${category}_${normalizedName}`;

  return {
    id: legacyItem.id,
    name: legacyItem.name,
    type: legacyItem.type as ItemType,
    category: legacyItem.category as ItemCategory,
    price: legacyItem.price,
    basePrice: legacyItem.basePrice,
    tarotCardId: tarotCardId,
    cardQuality: 50, // Default values
    currentDemand: 50,
    demandTrend: 'stable',
    cosmicInfluence: 50,
    priceHistory: legacyItem.priceHistory,
    lastPriceChange: legacyItem.lastPriceChange,
    volatility: 20,
    stock: 5,
    restockRate: 1,
    blackMarketOnly: false,
    townAvailability: ['starter_town'],
    description: legacyItem.description || 'A market item.',
    rarity: legacyItem.rarity as Rarity,
    imagePath: `/assets/items/${category}/${normalizedName}.png`,
  };
}

/**
 * Create a valid default MarketItem for the new system
 */
export function createDefaultMarketItem(props: Partial<MarketItemLegacy>): MarketItem {
  const baseItem: MarketItemLegacy = {
    id: props.id || `market-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: props.name || 'Unknown Item',
    type: props.type || 'ingredient',
    category: props.category || 'misc',
    price: props.price || 10,
    basePrice: props.basePrice || 10,
    description: props.description || 'A market item.',
    rarity: props.rarity || 'common',
    priceHistory: props.priceHistory || [10],
    lastPriceChange: props.lastPriceChange || 0
  };
  
  return fromLegacyMarketItem(baseItem);
}

/**
 * Legacy Player fields for backwards compatibility
 */
export type PlayerLegacy = {
  id: string;
  name: string;
  gold: number;
  mana: number;
  reputation: number;
  atelierSpecialization: string;
  atelierLevel: number;
  skills: Record<string, number>;
  inventory: InventoryItemLegacy[];
  garden: GardenSlotLegacy[];
  completedRituals: string[];
  journalEntries: any[];
  questsCompleted: number;
  daysSurvived: number;
  blackMarketAccess: boolean;
  townAccess: string[];
  lastActive: number;
};

/**
 * Create a default Player object that conforms to the new schema
 */
export function createDefaultPlayer(props: Partial<PlayerLegacy>): Player {
  const basePlayer: PlayerLegacy = {
    id: props.id || `player-${Date.now()}`,
    name: props.name || 'New Player',
    gold: props.gold || 100,
    mana: props.mana || 50,
    reputation: props.reputation || 0,
    atelierSpecialization: props.atelierSpecialization || 'Infusion',
    atelierLevel: props.atelierLevel || 1,
    skills: props.skills || {
      gardening: 1,
      brewing: 1,
      trading: 1,
      crafting: 1,
      herbalism: 1,
      astrology: 1
    },
    inventory: props.inventory || [],
    garden: props.garden || [],
    completedRituals: props.completedRituals || [],
    journalEntries: props.journalEntries || [],
    questsCompleted: props.questsCompleted || 0,
    daysSurvived: props.daysSurvived || 0,
    blackMarketAccess: props.blackMarketAccess || false,
    townAccess: props.townAccess || ['starter_town'],
    lastActive: props.lastActive || Date.now()
  };
  
  return {
    id: basePlayer.id,
    name: basePlayer.name,
    gold: basePlayer.gold,
    mana: basePlayer.mana,
    maxMana: 100,
    manaRegenRate: 5,
    totalManaGenerated: 0,
    manaEfficiency: 50,
    
    // Ritual and Effect System
    activeBuffs: [],
    canTransmute: false,
    transmuteEnergy: 0,
    
    reputation: basePlayer.reputation,
    townReputations: Object.fromEntries(basePlayer.townAccess.map(town => [town, 0])),
    atelierSpecialization: basePlayer.atelierSpecialization as any,
    atelierLevel: basePlayer.atelierLevel,
    elementalAffinity: 'Earth' as ElementType,
    favoredMoonPhase: 'Full Moon',
    skills: basePlayer.skills as any,
    skillExperience: Object.fromEntries(Object.keys(basePlayer.skills).map(skill => [skill, 0])),
    cardMastery: {},
    inventory: basePlayer.inventory.map(fromLegacyInventoryItem),
    activeCards: [],
    garden: basePlayer.garden.map(fromLegacyGardenSlot),
    gardenManaGrid: Array(3).fill(Array(3).fill(0)),
    
    // Packaging system
    packagingMaterials: [],
    packagingDesignStyles: [],
    packagingEffects: [],
    packagingBrands: [],
    packagingDesigns: [],
    
    knownRecipes: [],
    knownCardCombos: [],
    discoveredCards: [],
    completedRituals: basePlayer.completedRituals,
    journalEntries: basePlayer.journalEntries,
    questsCompleted: basePlayer.questsCompleted,
    daysSurvived: basePlayer.daysSurvived,
    blackMarketAccess: basePlayer.blackMarketAccess,
    townAccess: basePlayer.townAccess,
    lastActive: basePlayer.lastActive
  };
}

/**
 * Create a default garden slot that conforms to the new schema
 */
export function createDefaultGardenSlot(props: Partial<GardenSlotLegacy>): GardenSlot {
  const baseSlot: GardenSlotLegacy = {
    id: props.id !== undefined ? props.id : 0,
    plant: props.plant || null,
    fertility: props.fertility !== undefined ? props.fertility : 50,
    moisture: props.moisture !== undefined ? props.moisture : 50,
    sunlight: props.sunlight !== undefined ? props.sunlight : 50,
    isUnlocked: props.isUnlocked !== undefined ? props.isUnlocked : true
  };
  
  return fromLegacyGardenSlot(baseSlot);
}