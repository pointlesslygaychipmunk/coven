// Export all types from the types.ts file
export * from './types.js'; // Add .js extension for ESM compatibility

// Export compatibility helpers without PlantLegacy which is already exported from types.js
export { 
  getPlantName,
  toLegacyPlant,
  fromLegacyPlant,
  toLegacyGardenSlot,
  fromLegacyGardenSlot,
  toLegacyInventoryItem,
  fromLegacyInventoryItem,
  createDefaultInventoryItem,
  fromLegacyMarketItem,
  createDefaultMarketItem,
  createDefaultPlayer,
  createDefaultGardenSlot
} from './compatibility.js';

// Export types
export type {
  GardenSlotLegacy,
  InventoryItemLegacy,
  MarketItemLegacy,
  PlayerLegacy
} from './compatibility.js';