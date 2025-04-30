// shared/src/types.ts
// Type definitions for the Coven skincare witch simulation game
// Updated based on Master Vision and required features.

// Forward declaration for Recipe - assuming it's defined elsewhere if needed here,
// or import if the backend defines it and shared needs it.
// For now, we can define a basic structure if shared components need it.
export interface BasicRecipeInfo {
  id: string;
  name: string;
  category?: string; // Ensure this is present if used in frontend
  description?: string; // Ensure this is present if used in frontend
  type?: ItemType; // Add type for filtering/display
  // Add other properties if needed by shared components
}


// Core game types
export type GameTime = {
year: number;
season: Season;
phase: number;
phaseName: MoonPhase;
weatherFate: WeatherFate;
previousWeatherFate?: WeatherFate;
dayCount: number;
lastSaved?: number; // Added for save/load tracking
};

export type GameState = {
players: Player[];
market: MarketItem[];
marketData: MarketData;
townRequests: TownRequest[];
rituals: RitualQuest[];
rumors: Rumor[];
journal: JournalEntry[];
events: Event[]; // Consider defining Event structure if used
currentPlayerIndex: number;
time: GameTime;
version: string;
knownRecipes?: BasicRecipeInfo[]; // Use basic info or recipe IDs
};

// Player types
export type Player = {
id: string;
name: string;
gold: number;
mana: number; // Added based on vision, initialize if needed
reputation: number;
atelierSpecialization: AtelierSpecialization;
atelierLevel: number;
skills: Skills;
inventory: InventoryItem[];
garden: GardenSlot[];
knownRecipes: string[]; // Store IDs of known recipes
completedRituals: string[]; // Store IDs of completed rituals
journalEntries: JournalEntry[]; // Player-specific journal entries
questsCompleted: number;
daysSurvived?: number; // Make optional or ensure initialized
blackMarketAccess: boolean;
lastActive: number;
};

export type Skills = {
gardening: number;
brewing: number;
trading: number;
crafting: number; // May relate to atelier or specific crafting actions
herbalism: number; // Knowledge of herbs
astrology: number; // Understanding moon/season effects
[key: string]: number; // Allow for expansion
};

// --- Garden Types ---

export type Plant = {
// Base Properties
id: string;             // Unique instance ID
name: string;           // Name of the plant (e.g., "Moonbud")
category?: ItemCategory;// Plant category (flower, root, etc.)
imagePath?: string;      // Optional path for visual representation
// Growth Properties
growth: number;         // Current growth points
maxGrowth: number;      // Total growth points needed for maturity
seasonalModifier?: number; // Growth modifier based on current season (e.g., 1.5 for best season)
// State Properties
// Ensure all these properties exist or handle undefined cases in components
watered: boolean;       // If watered this turn
health: number;         // Current health (0-100)
age: number;            // Age in turns/phases
mature: boolean;        // Is the plant ready for harvest?
// Special Properties
moonBlessed?: boolean;   // Bonus from Full Moon planting/harvesting
deathChance?: number;    // Chance of dying per turn (increases with low health/bad conditions)
mutations?: string[];    // List of acquired mutations
qualityModifier?: number;// Affects harvested quality (e.g., from mutations)
};

export type GardenSlot = {
id: number;             // Unique ID for the plot (e.g., 0-8)
plant: Plant | null;    // The plant currently growing here, or null if empty
// Soil Properties
fertility: number;      // Soil quality (0-100), affects growth/quality
moisture: number;       // Current water level (0-100)
// Environmental Factors (can be dynamic or fixed per plot) - Added optional sunlight
sunlight?: number;       // Sunlight exposure (0-100) - Optional for now
// Status
isUnlocked?: boolean;    // Whether the player has access to this plot (default true for starting plots)
};

// Item types
export type ItemType = 'potion' | 'charm' | 'talisman' | 'ingredient' | 'seed' | 'tool' | 'ritual_item' | 'essence' | 'oil' | 'tonic' | 'mask' | 'elixir';

export type ItemCategory =
// Ingredients
'herb' | 'flower' | 'root' | 'fruit' | 'mushroom' | 'leaf' | 'succulent' | 'essence' | 'crystal' |
// Potions/Products
'mask' | 'serum' | 'tonic' | 'elixir' | 'oil' | 'potion' | // General potion type if needed
// Other
'seed' | 'tool' | 'ritual_item' | 'charm' | 'talisman' | 'misc'; // Added misc

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

// Base Item definition (can be used for generic items or as a base)
export type Item = {
id: string;             // Unique ID for the item type (e.g., 'ing_moonbud')
name: string;           // Display name (e.g., "Moonbud")
description?: string;   // Flavor text or usage info
type: ItemType;         // Broad type classification
category: ItemCategory; // Make category mandatory for better filtering
value?: number;         // Base gold value (market price will fluctuate)
rarity?: Rarity; // Use Rarity type
imagePath?: string;     // Path to item icon/image
// Stackable properties (relevant for InventoryItem)
quantity?: number;      // How many the player has (only in InventoryItem)
quality?: number;       // Quality affects potency and sell price (0-100) (only in InventoryItem)
// Provenance (relevant for InventoryItem)
harvestedDuring?: MoonPhase;
harvestedSeason?: Season;
// Player specific state (relevant for InventoryItem)
bookmarked?: boolean;   // For player organization
linkedItems?: string[]; // For journal links, potentially
primaryProperty?: string; // Added for potential display in UI/codex
seasonalBonus?: Season; // Added here for base definition consistency
};

// Specific type for items held in player inventory
export type InventoryItem = {
id: string;             // Unique ID for this stack (e.g., `ing_moonbud-167...`)
baseId: string;         // ID of the base item type (e.g., `ing_moonbud`)
name: string;           // Display name (copied from base item)
type: ItemType;
category: ItemCategory; // Category is mandatory
quantity: number;       // How many the player has
quality?: number;       // Quality of this stack (average if merged)
value?: number;         // Store base value for reference
rarity?: Rarity;        // Rarity for reference
description?: string;   // Optional description copy
imagePath?: string;     // Optional image path copy
// Provenance
harvestedDuring?: MoonPhase;
harvestedSeason?: Season;
// Player state
bookmarked?: boolean;
};


export type MarketItem = {
id: string;             // Matches the Item type ID
name: string;
type: ItemType;
category: ItemCategory; // Should be mandatory for market items
price: number;          // Current market price
basePrice: number;      // Base value for price calculations/reversion
description?: string;   // Make description optional, it comes from base Item
rarity?: Rarity;
seasonalBonus?: Season; // Season where this item might be more valuable/available
priceHistory?: number[]; // Track recent prices for trend display
lastPriceChange?: number;// Turn number when price last changed (for memory decay)
volatility?: number;     // How much the price tends to fluctuate (0-1)
blackMarketOnly?: boolean;// Is this item exclusive to the black market?
imagePath?: string;
};

export type MarketData = {
inflation: number;      // Global price modifier
demand: Record<string, number>; // Per-item demand score (0-100)
supply: Record<string, number>; // Per-item supply score (0-100)
volatility: number;     // Base market volatility factor
blackMarketAccessCost: number; // Cost to unlock black market
blackMarketUnlocked: boolean;
tradingVolume: number;  // Tracks trades per turn for inflation calculation
};

// Town requests
export type TownRequest = {
id: string;             // Unique request ID
item: string;           // Name of the item requested
quantity: number;       // Amount needed
rewardGold: number;     // Gold reward
rewardInfluence: number;// Reputation/Influence reward
requester: string;      // NPC requesting the item
description: string;    // Flavor text for the request
difficulty: number;     // Estimated difficulty (1-5 stars?)
completed: boolean;     // Has the player fulfilled this?
expiryTurn?: number;    // Optional turn number it expires
};

// Ritual quests
export type RitualQuestStep = {
description: string;    // What the player needs to do
completed: boolean;     // Has this step been completed?
completedDate?: string; // Optional: When it was completed
progress?: number;      // Optional: For multi-part steps (e.g., harvest 3/5)
};

export type RitualReward = {
type: 'gold' | 'item' | 'skill' | 'reputation' | 'recipe' | 'blueprint' | 'garden_slot'; // Added more reward types
value: string | number; // Item name/ID, skill name, gold amount, reputation amount, recipe ID, etc.
quantity?: number;      // For item rewards
};

export type RitualQuest = {
id: string;             // Unique ritual ID (e.g., "essence_mastery")
name: string;           // Display name
description: string;    // Flavor text/goal
stepsCompleted: number; // How many steps are done
totalSteps: number;     // Total steps required
steps: RitualQuestStep[];// The actual steps
rewards: RitualReward[];// What the player gets upon completion
requiredMoonPhase?: MoonPhase; // Optional: Can only be completed during this phase
requiredSeason?: Season;   // Optional: Can only be completed during this season
deadline?: number;       // Optional: Turn number deadline
unlocked: boolean;      // Is this ritual available to the player?
initiallyAvailable?: boolean; // Flag if it should be present at game start
requiredItems?: { name: string; quantity: number }[]; // Items consumed on completion?
};

// Rumors
export type Rumor = {
id: string;             // Unique rumor ID
content: string;        // The text of the rumor
spread: number;         // How widespread the rumor is (0-100)
affectedItem?: string;  // Name of the item the rumor affects (optional)
priceEffect?: number;    // Price multiplier effect (e.g., 1.1 for +10%, 0.9 for -10%) (optional)
duration?: number;       // How many more turns the rumor will last (optional)
verified: boolean;      // Has the player confirmed this rumor?
origin: string;         // Where the rumor came from (e.g., "merchant", "gossip")
turnsActive?: number;    // How many turns this rumor has been active
// itemName?: string; // Removed as it's redundant with affectedItem
};

// Journal entries
export type JournalEntry = {
id: string | number;    // Unique ID (use string GUIDs or number sequence)
turn: number;           // Game turn/phase number when entry was created
date: string;           // In-game date string (e.g., "Full Moon, Spring Year 1")
text: string;           // The main content of the entry
title?: string;          // Optional title for the entry
category: string;       // Type of entry (event, market, ritual, garden, discovery, weather, debug, error, etc.)
importance: number;     // How important is this entry (1-5?) for filtering/highlighting
readByPlayer: boolean;  // Has the player marked this as read?
bookmarked?: boolean;   // Player bookmark for easy finding
linkedItems?: string[]; // IDs/Names of items related to this entry
};

// Events (Could be used for world events, festivals, disasters, etc.)
export type Event = {
id: string;
name: string;
description: string;
triggerCondition: string; // Logic defining when this event triggers
effect: string;         // Description or code defining the event's impact
duration: number;       // How many turns the event lasts
active: boolean;        // Is the event currently happening?
};

// Weather state
export type WeatherFate = 'normal' | 'rainy' | 'dry' | 'foggy' | 'windy' | 'stormy' | 'clear' | 'cloudy'; // Consolidated list based on usage


// Game environment types (MoonPhase and Season remain)
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

// Atelier specialization
export type AtelierSpecialization = 'Essence' | 'Fermentation' | 'Distillation' | 'Infusion';

// Action log for tracking player actions (primarily for backend/debugging)
export type ActionLog = {
playerId: string;
action: 'plant' | 'water' | 'harvest' | 'brew' | 'buy' | 'sell' | 'fulfill' | 'endTurn' | 'spreadRumor' | 'claimRitual' | string; // Allow string for debug/other actions
timestamp: number;      // Real-world timestamp
parameters: any;        // Data associated with the action
result: boolean | string; // Did the action succeed? Allow string for reason
turn?: number;           // Game turn number
};