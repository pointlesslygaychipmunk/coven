import {
  Player,
  AtelierSpecialization,
  ElementType,
  MoonPhase,
  Season,
  Skills,
  InventoryItem,
  GardenSlot,
  ItemType,
  ItemCategory,
  Rarity,
  Material,
  DesignStyle,
  SpecialEffect,
  Brand,
  PackagingDesign
} from 'coven-shared';

// Separate interfaces for frontend and backend brands
type BackendBrand = {
  id: string;
  name: string;
  ownerId: string;
  tagline: string;
  description: string;
  foundingDate: number;
  logoPath: string;
  colorPalette: string[];
  signature: {
    element: ElementType;
    designStyle: DesignStyle;
    motif: string;
    materialPreference: string;
    specialEffect: string;
  };
  specialization: AtelierSpecialization;
  reputation: number;
  brandValues: string[];
  aestheticKeywords: string[];
  regularCustomers: number;
  productLines: Array<{
    name: string;
    description: string;
    itemCategory: ItemCategory;
    pricePoint: string;
    targetAudience: string;
  }>;
  marketingBonus: number;
  brandLevelXp: number;
  brandLevel: number;
  achievements: string[];
};

/**
 * Create a basic inventory item for testing
 */
export function createDefaultInventoryItem(
  id: string = `item-${Date.now()}`,
  name: string = 'Test Item',
  type: ItemType = 'ingredient',
  category: ItemCategory = 'herb',
  quantity: number = 1,
  overrides: Partial<InventoryItem> = {}
): InventoryItem {
  return {
    id,
    baseId: overrides.baseId || id.split('-')[0],
    name,
    type,
    category,
    quantity,
    quality: overrides.quality || 50,
    value: overrides.value || 10,
    rarity: overrides.rarity || 'common',
    description: overrides.description || `A ${name} used for testing`,
    imagePath: overrides.imagePath,
    
    // Tarot card integration
    tarotCardId: overrides.tarotCardId || `${category}_${name.toLowerCase().replace(/\s+/g, '_')}`,
    elementalPower: overrides.elementalPower || 50,
    moonAlignment: overrides.moonAlignment || 50,
    seasonalPotency: overrides.seasonalPotency || 50,
    essenceCharge: overrides.essenceCharge || 50,
    
    // Effects and combos
    activeEffects: overrides.activeEffects || [],
    combosPotential: overrides.combosPotential || 30,
    
    // Provenance
    harvestedDuring: overrides.harvestedDuring,
    harvestedSeason: overrides.harvestedSeason,
    harvestedFrom: overrides.harvestedFrom,
    createdWith: overrides.createdWith,
    
    // Player state
    bookmarked: overrides.bookmarked || false,
    inUse: overrides.inUse || false
  };
}

/**
 * Create a default garden slot for testing
 */
export function createDefaultGardenSlot(
  id: number = 0,
  isUnlocked: boolean = true,
  plant = null,
  overrides: Partial<GardenSlot> = {}
): GardenSlot {
  return {
    id,
    plant,
    fertility: overrides.fertility || 50,
    moisture: overrides.moisture || 50,
    soilType: overrides.soilType || 'loamy',
    sunlight: overrides.sunlight || 70,
    elementalInfluence: overrides.elementalInfluence || 'Earth',
    manaCapacity: overrides.manaCapacity || 100,
    currentMana: overrides.currentMana || 0,
    manaFlowRate: overrides.manaFlowRate || 1,
    isUnlocked,
    unlockCost: overrides.unlockCost,
    plotAppearance: overrides.plotAppearance || 'normal'
  };
}

/**
 * Create default skills object
 */
export function createDefaultSkills(
  baseLevel: number = 1,
  overrides: Partial<Skills> = {}
): Skills {
  return {
    gardening: overrides.gardening || baseLevel,
    brewing: overrides.brewing || baseLevel,
    trading: overrides.trading || baseLevel,
    crafting: overrides.crafting || baseLevel,
    herbalism: overrides.herbalism || baseLevel,
    astrology: overrides.astrology || baseLevel,
    ...overrides
  };
}

/**
 * Create a full Player object with all necessary properties
 */
export function createDefaultPlayer(
  id: string = `player-${Date.now()}`,
  name: string = 'Test Player',
  overrides: Partial<Player> = {}
): Player {
  // Create default garden
  const garden: GardenSlot[] = [];
  for (let i = 0; i < 9; i++) {
    const isUnlocked = i < 3; // First three slots unlocked by default
    garden.push(createDefaultGardenSlot(i, isUnlocked, null, {
      unlockCost: isUnlocked ? undefined : 500 + (i * 250)
    }));
  }
  
  // Create default inventory with some basic items
  const inventory: InventoryItem[] = [
    createDefaultInventoryItem('herb-chamomile', 'Chamomile', 'ingredient', 'herb', 5),
    createDefaultInventoryItem('seed-lavender', 'Lavender Seed', 'seed', 'seed', 3),
    createDefaultInventoryItem('root-ginseng', 'Ginseng Root', 'ingredient', 'root', 2)
  ];
  
  // Create a complete player object
  return {
    id,
    name,
    gold: overrides.gold !== undefined ? overrides.gold : 500,
    
    // Mana System
    mana: overrides.mana !== undefined ? overrides.mana : 50,
    maxMana: overrides.maxMana !== undefined ? overrides.maxMana : 100,
    manaRegenRate: overrides.manaRegenRate !== undefined ? overrides.manaRegenRate : 5,
    totalManaGenerated: overrides.totalManaGenerated !== undefined ? overrides.totalManaGenerated : 0,
    manaEfficiency: overrides.manaEfficiency !== undefined ? overrides.manaEfficiency : 50,
    
    // Ritual and Effect System
    activeBuffs: overrides.activeBuffs || [],
    canTransmute: overrides.canTransmute !== undefined ? overrides.canTransmute : false,
    transmuteEnergy: overrides.transmuteEnergy !== undefined ? overrides.transmuteEnergy : 0,
    
    // Reputation & Standing
    reputation: overrides.reputation !== undefined ? overrides.reputation : 50,
    townReputations: overrides.townReputations || {},
    
    // Specialization
    atelierSpecialization: overrides.atelierSpecialization || 'Essence',
    atelierLevel: overrides.atelierLevel !== undefined ? overrides.atelierLevel : 1,
    elementalAffinity: overrides.elementalAffinity || 'Earth',
    favoredMoonPhase: overrides.favoredMoonPhase || 'Full Moon',
    
    // Skills & Experience
    skills: overrides.skills || createDefaultSkills(),
    skillExperience: overrides.skillExperience || {},
    cardMastery: overrides.cardMastery || {},
    
    // Inventory & Garden
    inventory: overrides.inventory || inventory,
    activeCards: overrides.activeCards || [],
    garden: overrides.garden || garden,
    gardenManaGrid: overrides.gardenManaGrid || [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    
    // Packaging Inventory
    packagingMaterials: overrides.packagingMaterials || [],
    packagingDesignStyles: overrides.packagingDesignStyles || [],
    packagingEffects: overrides.packagingEffects || [],
    packagingBrands: overrides.packagingBrands || [],
    packagingDesigns: overrides.packagingDesigns || [],
    
    // Knowledge & Progress
    knownRecipes: overrides.knownRecipes || [],
    knownCardCombos: overrides.knownCardCombos || [],
    discoveredCards: overrides.discoveredCards || [],
    
    // Gameplay Progress
    completedRituals: overrides.completedRituals || [],
    journalEntries: overrides.journalEntries || [],
    questsCompleted: overrides.questsCompleted !== undefined ? overrides.questsCompleted : 0,
    daysSurvived: overrides.daysSurvived !== undefined ? overrides.daysSurvived : 1,
    
    // Access & Activity
    blackMarketAccess: overrides.blackMarketAccess !== undefined ? overrides.blackMarketAccess : false,
    townAccess: overrides.townAccess || ['starting_town'],
    lastActive: overrides.lastActive !== undefined ? overrides.lastActive : Date.now()
  };
}

/**
 * Create a basic game state for testing
 */
export function createDefaultGameState(
  player: Player,
  currentSeason: Season = 'Spring',
  currentMoonPhase: MoonPhase = 'Full Moon',
  currentWeather: string = 'normal'
) {
  return {
    players: [player],
    market: [],
    marketData: {
      inflation: 1.0,
      demand: {},
      supply: {},
      volatility: 0.1,
      blackMarketAccessCost: 1000,
      blackMarketUnlocked: false,
      tradingVolume: 0
    },
    townRequests: [],
    rituals: [],
    rumors: [],
    journal: [],
    events: [],
    currentPlayerIndex: 0,
    time: {
      year: 1,
      season: currentSeason,
      phase: 0,
      phaseName: currentMoonPhase,
      weatherFate: currentWeather,
      dayCount: 1,
      lastSaved: Date.now()
    },
    version: '0.1.0',
    knownRecipes: []
  };
}

/**
 * Create a set of packaging materials for testing
 */
export function createTestPackagingMaterials(): Material[] {
  return [
    {
      id: 'material_1',
      name: 'Fine Glass',
      description: 'A high-quality transparent glass',
      durability: 7,
      qualityLevel: 8,
      quantity: 10,
      icon: '🧪',
      materialType: 'glass',
      materialQuality: 'fine',
      elementalAffinity: 'Water',
      value: 50
    },
    {
      id: 'material_2',
      name: 'Celadon Ceramic',
      description: 'A traditional Korean celadon ceramic',
      durability: 8,
      qualityLevel: 7,
      quantity: 5,
      icon: '🏺',
      materialType: 'ceramic',
      materialQuality: 'fine',
      elementalAffinity: 'Earth',
      value: 70
    },
    {
      id: 'material_3',
      name: 'Hanji Paper',
      description: 'Traditional handmade Korean paper',
      durability: 4,
      qualityLevel: 6,
      quantity: 15,
      icon: '📜',
      materialType: 'paper',
      materialQuality: 'excellent',
      elementalAffinity: 'Air',
      value: 35
    }
  ];
}

/**
 * Create a set of design styles for testing
 */
export function createTestDesignStyles(): DesignStyle[] {
  return [
    {
      id: 'style_1',
      name: 'Traditional Hanbang',
      description: 'Classic traditional Korean medicinal style',
      complexityLevel: 6,
      customerAppeal: 8,
      marketBonus: 'Respected by traditionalists',
      icon: '🏮',
      designStyle: 'vintage',
      elementalAffinity: 'Earth',
      specializationAffinity: 'Infusion'
    },
    {
      id: 'style_2',
      name: 'Modern Minimalist',
      description: 'Clean, simple lines with natural materials',
      complexityLevel: 4,
      customerAppeal: 9,
      marketBonus: 'Popular with younger customers',
      icon: '◻️',
      designStyle: 'minimalist',
      elementalAffinity: 'Air',
      specializationAffinity: 'Distillation'
    },
    {
      id: 'style_3',
      name: 'Floral Elegance',
      description: 'Delicate floral patterns and soft colors',
      complexityLevel: 7,
      customerAppeal: 8,
      marketBonus: 'Appeals to cosmetic market',
      icon: '🌸',
      designStyle: 'elegant',
      elementalAffinity: 'Water',
      specializationAffinity: 'Infusion'
    }
  ];
}

/**
 * Create test packaging effects for testing
 */
export function createTestPackagingEffects(): SpecialEffect[] {
  return [
    {
      id: 'effect_1',
      name: 'Preservation Seal',
      description: 'Extends the shelf life of contents',
      rarity: 7,
      power: 8,
      duration: '3 months',
      quantity: 3,
      icon: '🔒',
      effectType: 'shimmer',
      potencyBonus: 0,
      durabilityEffect: 15,
      specializationAffinity: 'Fermentation'
    },
    {
      id: 'effect_2',
      name: 'Potency Amplifier',
      description: 'Enhances the magical potency of contents',
      rarity: 8,
      power: 9,
      duration: 'Permanent',
      quantity: 2,
      icon: '⚡',
      effectType: 'glow',
      potencyBonus: 20,
      durabilityEffect: 0,
      specializationAffinity: 'Essence'
    },
    {
      id: 'effect_3',
      name: 'Harmonic Resonance',
      description: 'Aligns the product with natural energy',
      rarity: 6,
      power: 7,
      duration: 'Permanent',
      quantity: 4,
      icon: '🔄',
      effectType: 'swirling',
      potencyBonus: 10,
      durabilityEffect: 5,
      specializationAffinity: 'Crystallization'
    }
  ];
}

/**
 * Create a test brand identity for backend tests
 */
export function createTestBrandIdentity(
  id: string = `brand_${Date.now()}`,
  name: string = 'Test Brand',
  overrides: Partial<BackendBrand> = {}
): BackendBrand {
  return {
    id,
    name,
    ownerId: overrides.ownerId || 'player1',
    tagline: overrides.tagline || 'An amazing brand',
    description: overrides.description || 'Products made with care',
    foundingDate: overrides.foundingDate || Date.now(),
    logoPath: overrides.logoPath || '/assets/brands/default.png',
    colorPalette: overrides.colorPalette || ['#3a4a6e', '#c1d4f0', '#f0e6d9'],
    signature: overrides.signature || {
      element: 'Water',
      designStyle: 'elegant',
      motif: 'symbol',
      materialPreference: 'glass',
      specialEffect: 'glow'
    },
    specialization: overrides.specialization || 'Essence',
    reputation: overrides.reputation || 50,
    brandValues: overrides.brandValues || ['Quality', 'Tradition', 'Harmony'],
    aestheticKeywords: overrides.aestheticKeywords || ['elegant', 'refined', 'magical'],
    regularCustomers: overrides.regularCustomers || 10,
    productLines: overrides.productLines || [{
      name: 'Basic Line',
      description: 'Everyday products',
      itemCategory: 'potion',
      pricePoint: 'standard',
      targetAudience: 'General customers'
    }],
    marketingBonus: overrides.marketingBonus || 10,
    brandLevelXp: overrides.brandLevelXp || 100,
    brandLevel: overrides.brandLevel || 2,
    achievements: overrides.achievements || ['First Sale', 'Quality Products']
  };
}

/**
 * Create a frontend brand for UI testing
 */
export function createFrontendBrand(
  id: string = `brand_${Date.now()}`,
  name: string = 'Test Brand',
  overrides: Partial<Brand> = {}
): Brand {
  return {
    id,
    name, 
    description: overrides.description || 'A test brand for UI',
    reputation: overrides.reputation || 7,
    recognition: overrides.recognition || 6,
    signature: overrides.signature || { 
      element: 'Water', 
      designStyle: 'elegant', 
      motif: 'symbol', 
      materialPreference: 'glass', 
      specialEffect: 'glow' 
    },
    icon: overrides.icon || '🌙',
    tagline: overrides.tagline || 'Nature\'s magic by moonlight',
    colorPalette: overrides.colorPalette || ['#3a4a6e', '#c1d4f0', '#f0e6d9'],
    brandValues: overrides.brandValues || ['Quality', 'Tradition', 'Harmony'],
    specialization: overrides.specialization || 'Essence',
    elementalAffinity: overrides.elementalAffinity || 'Water'
  };
}

/**
 * Create test brands for testing
 */
export function createTestBrands(): Brand[] {
  return [
    createFrontendBrand('brand_1', 'Moonlit Garden', {
      description: 'Products crafted under the full moon',
      reputation: 7,
      recognition: 6,
      icon: '🌙',
      tagline: 'Nature\'s magic by moonlight',
      colorPalette: ['#3a4a6e', '#c1d4f0', '#f0e6d9'],
      elementalAffinity: 'Water'
    }),
    createFrontendBrand('brand_2', 'Mountain Roots', {
      description: 'Ingredients from pristine mountain regions',
      reputation: 8,
      recognition: 5,
      icon: '⛰️',
      tagline: 'Grounded in nature\'s wisdom',
      colorPalette: ['#503d2e', '#8b7356', '#dbd1b3'],
      specialization: 'Infusion',
      elementalAffinity: 'Earth',
      signature: { 
        element: 'Earth', 
        designStyle: 'rustic', 
        motif: 'pattern', 
        materialPreference: 'wood', 
        specialEffect: 'aromatic' 
      }
    })
  ];
}

/**
 * Create a complete player with packaging and skills
 */
export function createPlayerWithPackaging(
  id: string = `player-${Date.now()}`,
  name: string = 'Packaging Tester',
  overrides: Partial<Player> = {}
): Player {
  // Create enhanced player with packaging materials
  const brands = createTestBrands();
  return createDefaultPlayer(id, name, {
    packagingMaterials: createTestPackagingMaterials(),
    packagingDesignStyles: createTestDesignStyles(),
    packagingEffects: createTestPackagingEffects(),
    packagingBrands: brands,
    packagingDesigns: [],
    skills: createDefaultSkills(5, { crafting: 7, herbalism: 8 }),
    atelierSpecialization: 'Infusion',
    ...overrides
  });
}