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

export type ItemType = 'potion' | 'charm' | 'talisman' | 'ingredient' | 'seed' | 'tool' | 'ritual_item' | 'essence' | 'oil' | 'tonic' | 'mask' | 'elixir';
export type ItemCategory =
  // Ingredients
  'herb' | 'flower' | 'root' | 'fruit' | 'mushroom' | 'leaf' | 'succulent' | 'essence' | 'crystal' |
  // Potions/Products
  'mask' | 'serum' | 'tonic' | 'elixir' | 'oil' | 'potion' |
  // Other
  'seed' | 'tool' | 'ritual_item' | 'charm' | 'talisman' | 'misc';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

// Base Item definition - includes all common static properties
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
};

// Basic info for recipes, suitable for frontend lists or basic state
export interface BasicRecipeInfo {
  id: string;
  name: string;
  category?: ItemCategory; // Use ItemCategory, make optional
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

// Atelier specialization
export type AtelierSpecialization = 'Essence' | 'Fermentation' | 'Distillation' | 'Infusion';

// --- Garden Types ---

export type Plant = {
  id: string;             // Unique instance ID
  name: string;           // Name of the plant (e.g., "Moonbud")
  category?: ItemCategory;// Plant category (flower, root, etc.)
  imagePath?: string;      // Optional path for visual representation
  growth: number;         // Current growth points
  maxGrowth: number;      // Total growth points needed for maturity
  seasonalModifier?: number; // Growth modifier based on current season (e.g., 1.5 for best season)
  watered: boolean;       // If watered this turn
  health: number;         // Current health (0-100)
  age: number;            // Age in turns/phases
  mature: boolean;        // Is the plant ready for harvest?
  moonBlessed?: boolean;   // Bonus from Full Moon planting/harvesting
  deathChance?: number;    // Chance of dying per turn (increases with low health/bad conditions)
  mutations?: string[];    // List of acquired mutations
  qualityModifier?: number;// Affects harvested quality (e.g., from mutations)
};

export type GardenSlot = {
  id: number;             // Unique ID for the plot (e.g., 0-8)
  plant: Plant | null;    // The plant currently growing here, or null if empty
  fertility: number;      // Soil quality (0-100), affects growth/quality
  moisture: number;       // Current water level (0-100)
  sunlight?: number;       // Sunlight exposure (0-100) - Optional for now
  isUnlocked?: boolean;    // Whether the player has access to this plot (default true for starting plots)
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
  // Provenance
  harvestedDuring?: MoonPhase;
  harvestedSeason?: Season;
  // Player state
  bookmarked?: boolean;
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
  type: 'gold' | 'item' | 'skill' | 'reputation' | 'recipe' | 'blueprint' | 'garden_slot';
  value: string | number; // Item ID, skill name, gold amount, rep amount, recipe ID, etc.
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