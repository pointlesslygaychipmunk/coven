import { Player, Season, MoonPhase, InventoryItem, TownRequest, Skills } from "coven-shared";

// Primary Craft Points system for game progression and scoring
export interface CraftPointsData {
  totalEarned: number;
  currentBalance: number;
  lifetimeSpent: number;
  sourceBreakdown: {
    productDeliveries: number;
    specialOrders: number;
    rituals: number;
    competitions: number;
    achievements: number;
    other: number;
  };
  weeklyEarnings: number[];  // Last 4 weeks tracking for analytics
  seasonalBonus: number;     // Current seasonal bonus multiplier
  challengeMultiplier: number; // Special event multipliers
}

export interface CraftableProduct {
  id: string;
  name: string;
  quality: number;
  potency: number;
  category: string;
  baseValue: number;
  craftPoints: number;
  ingredients: string[];
  creationTimestamp: number;
  producedBy: string;  // Player ID
  specialProperties: string[];
  townAffinities: string[]; // Towns that particularly value this product
  expirationTimestamp?: number;
}

// Scoring modifiers for product delivery based on various factors
export interface DeliveryScoreModifiers {
  qualityModifier: number;
  seasonalModifier: number;
  moonPhaseModifier: number;
  townAffinityModifier: number;
  reputationModifier: number;
  demandModifier: number;
  specialOrderModifier: number;
  freshnessModifier: number;
}

// Track player's CP milestones and achievements
export interface CraftPointsMilestones {
  level1: boolean;    // 100 CP
  level2: boolean;    // 250 CP
  level3: boolean;    // 500 CP
  level4: boolean;    // 1000 CP
  level5: boolean;    // 2500 CP
  championCrafter: boolean; // Earned 500 CP in a single season
  masterSpecialist: boolean; // Fully upgraded a specialization
  supplyChainMaster: boolean; // Supplied all towns in a single season
  productPerfectionist: boolean; // Created a 100% quality product
}

// Primary function to calculate craft points earned from product delivery
export function calculateDeliveryPoints(
  product: CraftableProduct,
  townId: string,
  currentSeason: Season,
  currentMoonPhase: MoonPhase,
  playerReputation: number,
  isSpecialOrder: boolean = false
): { craftPoints: number, modifiers: DeliveryScoreModifiers } {
  // Base value derived from product's inherent value
  let basePoints = product.baseValue * 0.1;
  
  // Quality is the biggest factor - exponential scaling for exceptional quality
  const qualityModifier = calculateQualityModifier(product.quality);
  
  // Town affinity - check if this town particularly values this product
  const townAffinityModifier = product.townAffinities.includes(townId) ? 1.25 : 1.0;
  
  // Seasonal modifier - some products are more valuable in specific seasons
  const seasonalModifier = calculateSeasonalModifier(product, currentSeason);
  
  // Moon phase can affect certain product categories
  const moonPhaseModifier = calculateMoonPhaseModifier(product, currentMoonPhase);
  
  // Reputation with town affects all deliveries
  const reputationModifier = 1 + (Math.min(playerReputation, 100) / 200); // +0% to +50%
  
  // Special order bonus (time-limited requests from towns)
  const specialOrderModifier = isSpecialOrder ? 1.5 : 1.0;
  
  // Town demand - calculated elsewhere based on town market state
  const demandModifier = 1.0; // Placeholder, determined by town market system
  
  // Freshness - newer products are worth more
  const freshnessModifier = calculateFreshnessModifier(product.creationTimestamp);
  
  // Compile all modifiers
  const modifiers: DeliveryScoreModifiers = {
    qualityModifier,
    seasonalModifier,
    moonPhaseModifier,
    townAffinityModifier,
    reputationModifier,
    demandModifier,
    specialOrderModifier,
    freshnessModifier
  };
  
  // Calculate final craft points by applying all modifiers
  let totalPoints = basePoints;
  totalPoints *= qualityModifier;
  totalPoints *= seasonalModifier;
  totalPoints *= moonPhaseModifier;
  totalPoints *= townAffinityModifier;
  totalPoints *= reputationModifier;
  totalPoints *= demandModifier;
  totalPoints *= specialOrderModifier;
  totalPoints *= freshnessModifier;
  
  // Round to nearest whole number for cleaner UI
  return { 
    craftPoints: Math.round(totalPoints),
    modifiers
  };
}

// Helper functions for CP calculations
function calculateQualityModifier(quality: number): number {
  // Exponential scaling to reward exceptional quality
  // Quality score of 70 is considered "standard" (1.0x modifier)
  // 100 quality gives 2.5x modifier
  if (quality < 50) return 0.5;
  if (quality < 70) return 0.75 + (quality - 50) / 80;
  return 1.0 + Math.pow((quality - 70) / 30, 1.5) * 1.5;
}

function calculateSeasonalModifier(product: CraftableProduct, currentSeason: Season): number {
  // Some product categories have seasonal variations
  // Example mapping based on product category
  const seasonalAffinities: Record<string, Season> = {
    "hydrating_mask": "Winter",
    "cooling_serum": "Summer",
    "brightening_toner": "Spring",
    "rejuvenating_cream": "Fall"
  };
  
  // Check product category against seasonal affinities
  for (const category of product.specialProperties) {
    if (seasonalAffinities[category] === currentSeason) {
      return 1.35; // Strong seasonal match
    }
  }
  
  return 1.0; // No seasonal effect
}

function calculateMoonPhaseModifier(product: CraftableProduct, currentMoonPhase: MoonPhase): number {
  // Certain product types are affected by moon phases
  if (product.specialProperties.includes("lunar_infused") && currentMoonPhase === "Full Moon") {
    return 1.5; // Major bonus for lunar products during full moon
  }
  
  if (product.specialProperties.includes("shadow_essence") && currentMoonPhase === "New Moon") {
    return 1.5; // Major bonus for shadow products during new moon
  }
  
  if (product.specialProperties.includes("transition_catalyst") && 
      (currentMoonPhase === "First Quarter" || currentMoonPhase === "Last Quarter")) {
    return 1.35; // Bonus for transition catalysts during quarter phases
  }
  
  return 1.0; // No moon phase effect
}

function calculateFreshnessModifier(creationTimestamp: number): number {
  const now = Date.now();
  const ageInDays = (now - creationTimestamp) / (1000 * 60 * 60 * 24);
  
  // Freshness degrades over time
  if (ageInDays < 1) return 1.2;    // Same day bonus
  if (ageInDays < 3) return 1.1;    // Fresh
  if (ageInDays < 7) return 1.0;    // Standard
  if (ageInDays < 14) return 0.8;   // Aging
  if (ageInDays < 30) return 0.6;   // Old
  return 0.4;                       // Very old
}

// Process player earning craft points from delivery
export function awardCraftPoints(
  playerId: string,
  amount: number, 
  source: keyof CraftPointsData['sourceBreakdown'],
  description: string
): boolean {
  // Implementation to update player CP in database
  // Handle achievement triggers, weekly analytics, etc.
  console.log(`Player ${playerId} earned ${amount} craft points from ${source}: ${description}`);
  return true; // Success
}

// CP spending system
export enum CraftPointsSpendingCategory {
  SPECIALIZATION_UPGRADE = "specialization_upgrade",
  ATELIER_EXPANSION = "atelier_expansion",
  GARDEN_EXPANSION = "garden_expansion",
  SPECIAL_INGREDIENTS = "special_ingredients",
  BLUEPRINT_UNLOCK = "blueprint_unlock",
  TOWN_RELATIONSHIP = "town_relationship",
  MARKET_INFLUENCE = "market_influence",
  RITUAL_POWER = "ritual_power",
  CRAFTING_TOOLS = "crafting_tools"
}

export interface SpendingOption {
  id: string;
  category: CraftPointsSpendingCategory;
  name: string;
  description: string;
  cost: number;
  prerequisiteIds: string[];
  maxLevel: number;
  currentLevel: number;
  benefitDescription: string;
  craftPointReturnRate?: number; // Some investments give passive CP
}

// Spending CP on upgrades
export function spendCraftPoints(
  playerId: string, 
  optionId: string, 
  amount: number
): boolean {
  // Implementation to deduct CP and apply upgrade
  // Verify player has enough CP
  // Apply upgrade effect
  // Update player history
  console.log(`Player ${playerId} spent ${amount} craft points on ${optionId}`);
  return true; // Success
}

// Weekly and seasonal CP calculations
export function calculateWeeklyBonuses(playerId: string): number {
  // Implementation to calculate end-of-week CP bonuses
  // Based on achievements, consistency, town relationships
  return 0; // Bonus amount
}

export function calculateSeasonalBonuses(playerId: string, season: Season): number {
  // Implementation to calculate end-of-season CP bonuses
  // Major bonus opportunity, factoring in seasonal specialties
  return 0; // Bonus amount
}

// Initialize a new player's craft points
export function initializePlayerCraftPoints(playerId: string): CraftPointsData {
  return {
    totalEarned: 0,
    currentBalance: 0,
    lifetimeSpent: 0,
    sourceBreakdown: {
      productDeliveries: 0,
      specialOrders: 0,
      rituals: 0,
      competitions: 0,
      achievements: 0,
      other: 0
    },
    weeklyEarnings: [0, 0, 0, 0],
    seasonalBonus: 1.0,
    challengeMultiplier: 1.0
  };
}

// Get spending options available to a player
export function getAvailableSpendingOptions(
  player: Player,
  craftPoints: CraftPointsData
): SpendingOption[] {
  // Implementation to return all spending options available to player
  // Filtered by prerequisites, player level, specialization
  return []; // List of available options
}

// Analyze CP earning patterns for player
export function analyzeCraftPointsPerformance(
  playerId: string, 
  timeframe: 'week' | 'month' | 'season' | 'allTime'
): {
  totalEarned: number,
  bestSource: string,
  bestProduct: string,
  bestTown: string,
  improvement: number // % improvement over previous period
} {
  // Implementation to analyze CP earning patterns
  // Useful for player feedback and strategy guidance
  return {
    totalEarned: 0,
    bestSource: "",
    bestProduct: "",
    bestTown: "",
    improvement: 0
  };
}

// Generate leaderboards based on CP
export function getLeaderboard(
  timeframe: 'weekly' | 'seasonal' | 'allTime',
  specializationFilter?: string,
  limit: number = 10
): { playerId: string, playerName: string, craftPoints: number }[] {
  // Implementation to generate CP leaderboards
  return []; // Leaderboard data
}