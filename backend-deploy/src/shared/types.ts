// shared/src/types.ts

// Forward declarations aren't needed if defined below

// --- Environment Types ---

export type WeatherFate = 'normal' | 'rainy' | 'dry' | 'foggy' | 'windy' | 'stormy' | 'clear' | 'cloudy';
export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';
export type MoonPhase =
  'New Moon' |
  'Waxing Crescent' |
  'First Quarter' |
  'Waxing Gibbous' |
  'Full Moon' |
  'Waning Gibbous' |
  'Last Quarter' |
  'Waning Crescent';

// --- Item Foundational Types ---

export type ItemType = 'potion' | 'charm' | 'talisman' | 'ingredient' | 'seed' | 'tool' | 'ritual_item' | 'essence' | 'oil' | 'tonic' | 'mask' | 'elixir' | 'tree' | 'packaging_material' | 'design_style' | 'special_effect';
export type ItemCategory =
  // Ingredients
  'herb' | 'flower' | 'root' | 'fruit' | 'mushroom' | 'leaf' | 'succulent' | 'essence' | 'crystal' |
  // Plants and Trees
  'tree' | 'plant' | 
  // Potions/Products
  'mask' | 'serum' | 'tonic' | 'elixir' | 'oil' | 'potion' |
  // Packaging System
  'packaging_material' | 'design_style' | 'special_effect' | 'brand' | 'package_design' |
  // Other
  'seed' | 'tool' | 'ritual_item' | 'charm' | 'talisman' | 'misc';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

// --- Tarot Card System Types ---

export type ElementType = 'Earth' | 'Water' | 'Fire' | 'Air' | 'Spirit';

export type CardFrame = 'herb' | 'tree' | 'flower' | 'root' | 'potion' | 'tonic' | 'mask' | 'charm' | 'ritual';

export type CardEffect = {
  type: 'growth' | 'potency' | 'stability' | 'essence' | 'value' | 'harmony' | 'quality' | 'yield';
  value: number;
  description: string;
};

export type ComboRef = {
  cardId: string;
  effectDescription: string;
  bonusType: string;
  bonusValue: number;
};

// Soil type preferences for plantable cards
export type SoilType = 'loamy' | 'sandy' | 'clay' | 'chalky' | 'peaty';

// Tarot Card - the unified representation of all game items
export type TarotCard = {
  // Identity
  id: string;                     // Unique identifier
  name: string;                   // Display name
  category: ItemCategory;         // Item category
  type: ItemType;                 // Item type classification
  
  // Visual Presentation
  artworkPath: string;            // Path to card artwork
  frameType: CardFrame;           // Visual frame style
  
  // Cosmic Associations
  element: ElementType;           // Earth, Water, Fire, Air, Spirit
  moonPhaseAffinity: MoonPhase;   // Which moon phase empowers this card
  seasonAffinity: Season;         // Which season empowers this card
  
  // Gameplay Values
  rank: number;                   // Power level (1-10)
  essence: number;                // Mana/energy value
  rarity: Rarity;                 // Rarity tier
  
  // Game Mechanics
  primaryEffect: CardEffect;      // Main effect when used
  secondaryEffect?: CardEffect;   // Optional secondary effect
  combos: ComboRef[];             // Cards this combos with
  
  // Growth Properties (for Garden)
  growthTime?: number;            // Time to mature if plantable
  yield?: number;                 // Amount harvested if plantable
  soilPreference?: SoilType;      // Preferred soil if plantable
  manaGeneration?: number;        // Mana generated per turn (for trees)
  
  // Brewing Properties
  potency?: number;               // Strength in brews (1-10)
  stability?: number;             // How stable in mixtures (1-10)
  
  // Market Properties
  baseValue: number;              // Base market value
  demandFluctuation: number;      // How much price varies (1-10)
  
  // Lore
  description: string;            // Card lore and description
  traditionUse: string;           // Historical use in Hanbang
};

// Base Item definition - modified to align with TarotCard system
export type Item = {
  id: string;             // Unique ID for the item type (e.g., 'ing_moonbud')
  name: string;           // Display name (e.g., "Moonbud") - MANDATORY
  description?: string;   // Flavor text or usage info
  type: ItemType;         // Broad type classification
  category: ItemCategory; // Specific category - MANDATORY
  value?: number;         // Base gold value (market price will fluctuate)
  rarity?: Rarity;        // Item rarity
  imagePath?: string;     // Path to item icon/image
  primaryProperty?: string; // e.g., "brightening" (for ingredients/potions)
  seasonalBonus?: Season; // Season where this item might be more valuable/available
  
  // Link to tarot card system
  cardId?: string;        // Reference to the TarotCard ID if this is linked
};

// Basic info for recipes, suitable for frontend lists or basic state
export interface BasicRecipeInfo {
  id: string;
  name: string;
  category?: ItemCategory; // Use ItemCategory, make optional
  description?: string;
  type?: ItemType;
}

// --- Main Game State ---
export type GameState = {
  players: Player[];
  market: MarketItem[];
  marketData: {
    inflation: number;
    demand: Record<string, number>;
    supply: Record<string, number>;
    volatility: number;
    blackMarketAccessCost: number;
    blackMarketUnlocked: boolean;
    tradingVolume: number;
  };
  townRequests: TownRequest[];
  rituals: RitualQuest[];
  rumors: Rumor[];
  journal: JournalEntry[];
  events: Event[];
  currentPlayerIndex: number;
  time: GameTime;
  version: string;
  knownRecipes: BasicRecipeInfo[];
};

// Game Time structure
export type GameTime = {
  year: number;
  season: Season;
  phase: number;
  phaseName: MoonPhase;
  weatherFate: WeatherFate;
  previousWeatherFate?: WeatherFate;
  dayCount: number;
  lastSaved?: number;
};

// Atelier specialization
export type AtelierSpecialization = 'Essence' | 'Fermentation' | 'Distillation' | 'Infusion' | 'Crystallization' | 'Transmutation';

// --- Garden Types ---

// Legacy Plant type - kept for backward compatibility 
export type PlantLegacy = {
  id: string;              // Unique instance ID
  name: string;            // Name of the plant (e.g., "Moonbud")
  category?: ItemCategory; // Plant category (flower, root, etc.)
  imagePath?: string;      // Optional path for visual representation
  growth: number;          // Current growth points
  maxGrowth: number;       // Total growth points needed for maturity
  seasonalModifier?: number; // Growth modifier based on current season
  watered: boolean;        // If watered this turn
  health: number;          // Current health (0-100)
  age: number;             // Age in turns/phases
  mature: boolean;         // Is the plant ready for harvest?
  moonBlessed?: boolean;   // Bonus from Full Moon planting/harvesting
  deathChance?: number;    // Chance of dying per turn
  mutations?: string[];    // List of acquired mutations
  qualityModifier?: number;// Affects harvested quality
};

// New Plant type that integrates with the tarot card system
export type Plant = {
  id: string;              // Unique instance ID
  tarotCardId: string;     // Reference to the TarotCard definition
  
  // Instance-specific state
  growth: number;          // Current growth points
  maxGrowth: number;       // Total growth points needed for maturity
  health: number;          // Current health (0-100)
  watered: boolean;        // If watered this turn
  age: number;             // Age in turns/phases
  mature: boolean;         // Is the plant ready for harvest?
  manaProduced?: number;   // Total mana produced so far (for trees)
  manaProdRate?: number;   // Current mana production rate per turn (for trees)
  
  // Current modifiers
  qualityModifier: number; // Current quality modifier (0-100)
  moonBlessing: number;    // Moon phase blessing strength (0-100)
  seasonalResonance: number; // How well the plant is resonating with current season (0-100)
  elementalHarmony: number; // How well the plant's element harmonizes with the garden (0-100)
  
  // Visual state
  growthStage: 'seed' | 'sprout' | 'growing' | 'mature' | 'blooming' | 'dying';
  
  // Special properties
  mutations?: string[];    // Any mutations that have developed
  specialTraits?: string[]; // Special traits gained during growth
};

// DisplayPlant is an extension of Plant with frontend-specific properties
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
};

export type GardenSlot = {
  id: number;             // Unique ID for the plot (e.g., 0-8)
  plant: Plant | null;    // The plant currently growing here, or null if empty
  
  // Soil properties
  fertility: number;      // Soil quality (0-100), affects growth/quality
  moisture: number;       // Current water level (0-100)
  soilType: SoilType;     // Type of soil in this plot
  
  // Environmental factors
  sunlight: number;       // Sunlight exposure (0-100)
  elementalInfluence: ElementType; // Primary elemental influence on this plot
  
  // Mana properties
  manaCapacity: number;   // How much mana this plot can store (higher for plots with trees)
  currentMana: number;    // Current mana stored in this plot
  manaFlowRate: number;   // How quickly mana flows through this plot
  
  // Player access
  isUnlocked: boolean;    // Whether the player has access to this plot
  unlockCost?: number;    // Cost to unlock if not already unlocked
  
  // Visual state
  plotAppearance: 'normal' | 'vibrant' | 'withered' | 'magical' | 'overgrown'; // Visual state of the plot
};

// --- Player Types ---

export type InventoryItem = {
  id: string;             // Unique ID for this stack (e.g., `ing_moonbud-167...`)
  baseId: string;         // ID of the base item type (e.g., `ing_moonbud`)
  name: string;           // Display name (copied from base item)
  type: ItemType;
  category: ItemCategory;
  quantity: number;
  quality?: number;       // Quality of this stack (average if merged)
  value?: number;         // Store base value for reference
  rarity?: Rarity;
  description?: string;
  imagePath?: string;
  
  // Tarot Card System Integration
  tarotCardId: string;       // ID of the tarot card definition
  
  // Card-specific attributes
  elementalPower: number;    // Current elemental power level (0-100)
  moonAlignment: number;     // How aligned with its moon phase (0-100)
  seasonalPotency: number;   // How potent based on current season (0-100)
  essenceCharge: number;     // Current essence/mana charge (0-100)
  
  // Card interactions
  activeEffects: CardEffect[]; // Currently active effects on this card
  combosPotential: number;   // How many potential combos are available (0-100)
  
  // Provenance
  harvestedDuring?: MoonPhase;
  harvestedSeason?: Season;
  harvestedFrom?: number;    // Garden plot ID where harvested
  createdWith?: string[];    // IDs of cards used to create this (for brewed items)
  
  // Player state
  bookmarked?: boolean;
  inUse?: boolean;           // Whether this card is currently in use elsewhere
};

export type Skills = {
  gardening: number;
  brewing: number;
  trading: number;
  crafting: number;
  herbalism: number;
  astrology: number;
  [key: string]: number;
};

export type Player = {
  id: string;
  name: string;
  gold: number;
  
  // Mana System
  mana: number;                    // Current mana points
  maxMana: number;                 // Maximum mana capacity
  manaRegenRate: number;           // Base mana regeneration rate per turn
  totalManaGenerated: number;      // Lifetime total mana generated from trees
  manaEfficiency: number;          // Efficiency of mana usage (0-100)
  
  // Ritual and Effect System
  activeBuffs?: PlayerBuff[];      // Active buffs from rituals and other sources
  canTransmute?: boolean;          // Whether player can perform transmutation
  transmuteEnergy?: number;        // Available transmutation energy
  
  // Reputation & Standing
  reputation: number;              // Overall reputation
  townReputations: Record<string, number>; // Reputation with specific towns
  
  // Specialization
  atelierSpecialization: AtelierSpecialization;
  atelierLevel: number;
  elementalAffinity: ElementType;  // Player's elemental affinity
  favoredMoonPhase: MoonPhase;     // Player's favored moon phase
  
  // Skills & Experience
  skills: Skills;
  skillExperience: Record<string, number>; // Experience points for each skill
  cardMastery: Record<string, number>;     // Mastery level with specific cards
  
  // Inventory & Garden
  inventory: InventoryItem[];
  activeCards: string[];           // IDs of cards currently in active use
  garden: GardenSlot[];
  gardenManaGrid: number[][];      // 2D grid of mana flow in garden
  
  // Packaging Inventory
  packagingMaterials: Material[];  // Packaging materials in inventory  
  packagingDesignStyles: DesignStyle[];  // Design styles known
  packagingEffects: SpecialEffect[];  // Special effects available
  packagingBrands: Brand[];        // Brands developed
  packagingDesigns: PackagingDesign[];  // Saved packaging designs
  
  // Knowledge & Progress
  knownRecipes: string[];          // IDs of recipes personally known
  knownCardCombos: string[][];     // Pairs of card IDs that player knows combo
  discoveredCards: string[];       // IDs of all cards player has discovered
  
  // Gameplay Progress
  completedRituals: string[];
  journalEntries: JournalEntry[];
  questsCompleted: number;
  daysSurvived: number;
  
  // Access & Activity
  blackMarketAccess: boolean;
  townAccess: string[];            // Towns the player has access to
  lastActive: number;
};

// --- Market Types ---

export type MarketItem = {
  id: string;                    // Matches the Item type ID
  name: string;
  type: ItemType;
  category: ItemCategory;
  price: number;
  basePrice: number;
  
  // Tarot Card System Integration
  tarotCardId: string;           // ID of the tarot card definition
  cardQuality: number;           // Quality of this specific card (0-100)
  
  // Market-specific properties
  currentDemand: number;         // Current market demand (0-100)
  demandTrend: 'rising' | 'falling' | 'stable';
  cosmicInfluence: number;       // How influenced by moon/season (0-100)
  priceHistory: number[];        // History of recent prices
  lastPriceChange: number;       // Amount of last price change
  volatility: number;            // Price volatility (0-100)
  
  // Availability
  stock: number;                 // How many are available
  restockRate: number;           // How quickly it restocks
  blackMarketOnly: boolean;      // Only available in black market
  townAvailability: string[];    // Which towns carry this item
  
  // Visuals
  description?: string;
  rarity: Rarity;
  seasonalBonus?: Season;
  imagePath: string;
};

export type MarketData = {
  inflation: number;
  demand: Record<string, number>;
  supply: Record<string, number>;
  volatility: number;
  blackMarketAccessCost: number;
  blackMarketUnlocked: boolean;
  tradingVolume: number;
};

// --- Quest & Journal Types ---

export type PlayerBuff = {
  id: string;                    // Unique identifier for the buff
  name: string;                  // Display name
  effect: string;                // Type of effect (qualityBonus, brewingBonus, etc.)
  value: number;                 // Numerical value of the effect
  duration: number;              // Number of turns the buff lasts
  source: 'ritual' | 'potion' | 'item' | 'event' | 'moon' | 'season'; // Source of the buff
  element?: ElementType;         // Associated element if relevant
  description?: string;          // Descriptive text
  iconPath?: string;             // Path to icon graphic
};

export type TownRequest = {
  id: string;
  item: string; // Name of the item requested (use name for simplicity here)
  quantity: number;
  rewardGold: number;
  rewardInfluence: number;
  requester: string;
  description: string;
  difficulty: number;
  completed: boolean;
  expiryTurn?: number;
};

export type RitualQuestStep = {
  description: string;
  completed: boolean;
  completedDate?: string;
  progress?: number;
};

export type RitualReward = {
  type: 'gold' | 'item' | 'skill' | 'reputation' | 'recipe' | 'blueprint' | 'garden_slot' | 'resource' | 'mana' | 'items' | 'unlocksRituals';
  value?: string | number; // Item ID, skill name, gold amount, rep amount, recipe ID, etc.
  quantity?: number;
  resource?: string; // For 'resource' type, specifies which resource (mana, reputation, etc.)
  amount?: number; // For 'resource' type, amount to give
  items?: any[]; // For rewards that include multiple items
  rituals?: any[]; // For rewards that include multiple rituals
  gold?: number; // Amount of gold to give
  reputation?: number; // Amount of reputation to give
  mana?: number; // Amount of mana to give
  unlocksRituals?: any[]; // Rituals to unlock
};

export type RitualQuest = {
  id: string;
  name: string;
  description: string;
  stepsCompleted?: number;
  totalSteps?: number;
  steps?: RitualQuestStep[];
  rewards: RitualReward[];
  requiredMoonPhase?: MoonPhase;
  requiredSeason?: Season;
  moonPhaseRequirement?: MoonPhase; // Added for backward compatibility
  seasonRequirement?: Season; // Added for backward compatibility
  skillAffinity?: string; // Added for skill experience gains
  baseSuccessChance?: number; // Base chance of success before bonuses
  oneTime?: boolean; // Whether the ritual can only be performed once
  difficulty?: number; // Difficulty level of the ritual
  deadline?: number;
  unlocked?: boolean;
  initiallyAvailable?: boolean;
  requiredItems?: { name: string; quantity: number }[]; // Use name for simplicity? Or baseId? Let's keep name for now.
};

export type Rumor = {
  id: string;
  content: string;
  spread: number;
  affectedItem?: string; // Name of item
  priceEffect?: number;
  duration?: number;
  verified: boolean;
  origin: string;
  turnsActive?: number;
};

export type JournalEntry = {
  id: string | number;
  turn: number;
  date: string;
  text: string;
  title?: string;
  category: string;
  importance: number;
  readByPlayer: boolean;
  bookmarked?: boolean;
  linkedItems?: string[]; // IDs/Names of items related to this entry
};

export type Event = {
  id: string;
  name: string;
  description: string;
  triggerCondition: string;
  effect: string;
  duration: number;
  active: boolean;
};

// --- Main Game State ---
// Moved higher up for clarity

// --- Action Log (if needed later) ---
// export type ActionLog = { ... };

// --- Packaging System Types ---

// Import the main packaging types from packagingSystem to maintain alignment
import {
  PackagingMaterial,
  DesignStyle as BackendDesignStyle,
  PackagingEffect,
  MaterialQuality
} from './packagingSystem.js';

// Re-export types we need directly to avoid unused import warnings
export type { 
  LabelStyle,
  PackagingType,
  DesignElement
} from './packagingSystem.js';

// Frontend adapted Material type
export type Material = {
  id: string;
  name: string;
  description: string;
  durability: number;         // 1-10
  qualityLevel: number;       // 1-10
  specialProperty?: string;
  quantity?: number;
  icon: string;               // Emoji representation
  materialType: PackagingMaterial;
  materialQuality: MaterialQuality;
  elementalAffinity?: ElementType;
  value: number;
};

// Frontend adapted Design Style
export type DesignStyle = {
  id: string;
  name: string;
  description: string;
  complexityLevel: number;    // 1-10
  customerAppeal: number;     // 1-10
  marketBonus?: string;
  icon: string;               // Emoji representation
  designStyle: BackendDesignStyle;
  elementalAffinity?: ElementType;
  specializationAffinity?: AtelierSpecialization;
};

// Frontend adapted Special Effect
export type SpecialEffect = {
  id: string;
  name: string;
  description: string;
  rarity: number;             // 1-10
  power: number;              // 1-10
  duration?: string;
  quantity?: number;
  icon: string;               // Emoji representation
  effectType: PackagingEffect;
  potencyBonus: number;
  durabilityEffect: number;
  specializationAffinity?: AtelierSpecialization;
};

// Frontend adapted Brand Identity
// With properties compatible with BrandIdentity from packagingSystem.ts
export type Brand = {
  id: string;
  name: string;
  description: string;
  reputation?: number;         // 1-10
  recognition?: number;        // 1-10 (UI only)
  signature?: string | any;    // Can be string (UI) or complex object (backend)
  icon?: string;               // Emoji representation (UI only)
  tagline: string;
  colorPalette: string[];
  brandValues: string[];
  specialization: AtelierSpecialization | string;
  elementalAffinity?: ElementType | string;
};

// Frontend adapted Packaging Design
// With properties compatible with both frontend and backend
export type PackagingDesign = {
  id: string;
  name: string;
  material: Material | any;  // Allow any format for compatibility
  designStyle: DesignStyle | any;  // Allow any format for compatibility
  specialEffect?: SpecialEffect | null | any;  // Allow any format for compatibility
  brand?: Brand | null | any;  // Allow any format for compatibility
  colors?: {
    base: string;             // HEX color
    accent: string;           // HEX color
  };
  qualityScore?: number;       // 0-100
  packagingType?: string | any;  // Allow string or enum
  labelStyle?: string | any;  // Allow string or enum
  designElements?: string[] | any[];  // Allow any format for compatibility
  specialEffects?: string[] | any[];  // Allow any format for compatibility
  lore?: string;
  seasonalTheme?: string;
  collectorValue?: number;
  creationDate?: number;
  
  // Additional properties for backend compatibility
  [key: string]: any;  // Allow additional properties for compatibility
};

// Flexible PackageType that can be used in frontend components
export type PackageType = PackagingDesign & {
  qualityScore?: number;
  colors?: {
    base: string;
    accent: string;
  };
  material?: {
    name?: string;
    icon?: string;
    materialType?: string;
    [key: string]: any;
  };
  designStyle?: {
    name?: string;
    icon?: string;
    designStyle?: string;
    [key: string]: any;
  };
  specialEffect?: {
    name?: string;
    icon?: string;
    effectType?: string;
    [key: string]: any;
  };
  brand?: {
    name?: string;
    icon?: string;
    [key: string]: any;
  };
  packagingType?: string;
  labelStyle?: string;
};

// Frontend adapted Product type (for packaging)
export type Product = {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: ItemType;
  category: ItemCategory;
  value: number;
  rarity: Rarity;
  packaging?: PackagingDesign;
  enhancedValue?: number;
  potencyBoost?: number;
  marketAppeal?: number;
  shelfLife?: number;
  packagingEffects?: string[];
};