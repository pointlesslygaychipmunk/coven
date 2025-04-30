// shared/src/types.ts
// Type definitions for the Coven skincare witch simulation game
// Updated based on Master Vision and required features.

// Core game types (ItemType, ItemCategory, Rarity, Season, MoonPhase etc. defined below)

// Basic info for recipes, suitable for frontend lists or basic state
export interface BasicRecipeInfo {
  id: string;
  name: string;
  category?: ItemCategory; // Use ItemCategory, make optional if sometimes unknown
  description?: string;
  type?: ItemType;
}

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

// Main Game State
export type GameState = {
  players: Player[];
  market: MarketItem[];
  marketData: MarketData;
  townRequests: TownRequest[];
  rituals: RitualQuest[];
  rumors: Rumor[];
  journal: JournalEntry[];
  events: Event[];
  currentPlayerIndex: number;
  time: GameTime;
  version: string;
  knownRecipes?: BasicRecipeInfo[]; // List of recipes known globally/available?
};

// Player types
export type Player = {
  id: string;
  name: string;
  gold: number;
  mana: number;
  reputation: number;
  atelierSpecialization: AtelierSpecialization;
  atelierLevel: number;
  skills: Skills;
  inventory: InventoryItem[];
  garden: GardenSlot[];
  knownRecipes: string[]; // IDs of recipes personally known by the player
  completedRituals: string[];
  journalEntries: JournalEntry[];
  questsCompleted: number;
  daysSurvived?: number;
  blackMarketAccess: boolean;
  lastActive: number;
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

// --- Garden Types ---

export type Plant = {
  id: string;
  name: string;
  category?: ItemCategory;
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

export type GardenSlot = {
  id: number;
  plant: Plant | null;
  fertility: number;
  moisture: number;
  sunlight?: number;
  isUnlocked?: boolean;
};

// --- Item Types ---

export type ItemType = 'potion' | 'charm' | 'talisman' | 'ingredient' | 'seed' | 'tool' | 'ritual_item' | 'essence' | 'oil' | 'tonic' | 'mask' | 'elixir';

export type ItemCategory =
  // Ingredients
  'herb' | 'flower' | 'root' | 'fruit' | 'mushroom' | 'leaf' | 'succulent' | 'essence' | 'crystal' |
  // Potions/Products
  'mask' | 'serum' | 'tonic' | 'elixir' | 'oil' | 'potion' |
  // Other
  'seed' | 'tool' | 'ritual_item' | 'charm' | 'talisman' | 'misc';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

// Base Item definition
export type Item = {
  id: string;
  name: string; // Added name here as it's fundamental
  description?: string;
  type: ItemType;
  category: ItemCategory; // Made mandatory on base Item
  value?: number;
  rarity?: Rarity;
  imagePath?: string;
  // Removed stackable/provenance/player properties - keep those on InventoryItem
  primaryProperty?: string;
  seasonalBonus?: Season;
};

// Specific type for items held in player inventory
export type InventoryItem = {
  id: string;             // Unique ID for this stack
  baseId: string;         // ID of the base item type
  name: string;           // Display name (copied from base item)
  type: ItemType;
  category: ItemCategory;
  quantity: number;
  quality?: number;       // Quality of this stack (average if merged)
  value?: number;         // Store base value for reference
  rarity?: Rarity;
  description?: string;
  imagePath?: string;
  // Provenance
  harvestedDuring?: MoonPhase;
  harvestedSeason?: Season;
  // Player state
  bookmarked?: boolean;
};

// --- Market Types ---

export type MarketItem = {
  id: string;             // Matches the Item type ID
  name: string;
  type: ItemType;
  category: ItemCategory;
  price: number;
  basePrice: number;
  description?: string;
  rarity?: Rarity;
  seasonalBonus?: Season;
  priceHistory?: number[];
  lastPriceChange?: number;
  volatility?: number;
  blackMarketOnly?: boolean;
  imagePath?: string;
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

export type TownRequest = {
  id: string;
  item: string;
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
  type: 'gold' | 'item' | 'skill' | 'reputation' | 'recipe' | 'blueprint' | 'garden_slot';
  value: string | number;
  quantity?: number;
};

export type RitualQuest = {
  id: string;
  name: string;
  description: string;
  stepsCompleted: number;
  totalSteps: number;
  steps: RitualQuestStep[];
  rewards: RitualReward[];
  requiredMoonPhase?: MoonPhase;
  requiredSeason?: Season;
  deadline?: number;
  unlocked: boolean;
  initiallyAvailable?: boolean;
  requiredItems?: { name: string; quantity: number }[];
};

export type Rumor = {
  id: string;
  content: string;
  spread: number;
  affectedItem?: string;
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
  linkedItems?: string[];
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

// --- Atelier ---
export type AtelierSpecialization = 'Essence' | 'Fermentation' | 'Distillation' | 'Infusion';

// --- Action Log (if needed later) ---
// export type ActionLog = { ... };