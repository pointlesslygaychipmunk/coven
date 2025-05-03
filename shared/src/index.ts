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

// Export packaging system
// Use a specific import/export to avoid name collisions with types.js
import {
  PackagingMaterial,
  DesignStyle as PackagingDesignStyle,
  PackagingEffect,
  BrandIdentity,
  ProductPackaging,
  createPackagedProduct, 
  applyPackagingDesignToProduct
} from './packagingSystem.js';

// Use export type for type-only exports
export type { 
  PackagingMaterial, 
  PackagingDesignStyle, 
  PackagingEffect,
  BrandIdentity as Brand,
  ProductPackaging as PackagingDesign
};

export {
  createPackagedProduct,
  applyPackagingDesignToProduct
};

// Export Moon Bid Game systems
export * from './moonBidGame.js';
export * from './moonBidDeckbuilding.js';
export * from './moonBidAI.js';

// Export ritual system and tarot cards
export * from './ritualSystem.js';
export * from './tarotCards.js';

// Export types
export type {
  GardenSlotLegacy,
  InventoryItemLegacy,
  MarketItemLegacy,
  PlayerLegacy
} from './compatibility.js';

// Export the frontend compatibility utility functions
export { 
  getPlantIcon,
  adaptPlantForDisplay,
  isDisplayPlant 
} from './frontendCompatibility.js';