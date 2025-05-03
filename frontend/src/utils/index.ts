// Export all utilities from the frontendCompatibility module
export * from './frontendCompatibility';

// Export plant growth helpers
export * from './plantGrowthHelpers';

// Export tarot card helpers
export * from './tarotCardHelpers';

// Export tarot card mock implementations
export * from './tarotCardMocks';

// Export MoonBid module mocks with specific exports
// Export type definitions properly
export type {
  MoonCardSuit,
  MoonCardValue,
  CardPower,
  GameMode,
  MoonBidPlayer,
  MoonCard,
  Trick,
  MoonBidGame,
  PlayerDeck
} from './moonBidMocks';

// Export functions and constants
export {
  createDefaultDeck,
  createSpecializedDeck,
  initializeMoonBidGame,
  placeBid,
  playCard,
  getGameWinners,
  GAME_MODES,
  createMockGameState,
  createMockMoonBidPlayer,
  dealCards,
  createMockPlayerDeck
} from './moonBidMocks';

// Export environmental effects utilities
export * from './environmentalEffects';

// Export plant mutation system
export * from './plantMutationSystem';

// Re-export player state mocks
export {
  createDefaultInventoryItem,
  createDefaultGardenSlot,
  createDefaultSkills,
  createDefaultPlayer,
  createDefaultGameState,
  createTestPackagingMaterials,
  createTestDesignStyles,
  createTestPackagingEffects,
  createTestBrands,
  createPlayerWithPackaging
} from './playerStateMocks';

// Re-export brewing mocks with explicit names to avoid conflicts
// Export type definitions properly
export type {
  BrewingMethod
} from './brewingMocks';

// Export functions and constants
export {
  calculateCompatibility,
  calculateBrewingQuality,
  determineIdealMethod,
  brewingMechanics,
  brewingMethodElements
} from './brewingMocks';

// Export packaging system mocks
export {
  createMaterial,
  createDesignStyle,
  createSpecialEffect,
  createBrand,
  createPackagingDesign,
  createPackagedProduct,
  toBackendPackaging,
  toFrontendPackaging,
  applyPackagingToProduct
} from './packagingSystemMocks';

// Export Hanbang brewing types
export * from './hanbangBrewingTypes';