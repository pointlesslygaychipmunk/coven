import { Season, MoonPhase, InventoryItem } from "coven-shared";
import { CraftableProduct } from "./craftPointsSystem.js";

// Town specialization types for diverse network
export enum TownSpecialization {
  SCHOLARLY = "scholarly",
  AGRICULTURAL = "agricultural",
  SPIRITUAL = "spiritual", 
  ARTISTIC = "artistic",
  INDUSTRIAL = "industrial",
  MARITIME = "maritime",
  MOUNTAINOUS = "mountainous"
}

// Product demand profile
export enum ProductDemandLevel {
  VERY_LOW = 0.5,
  LOW = 0.75,
  NORMAL = 1.0,
  HIGH = 1.5,
  VERY_HIGH = 2.0,
  CRITICAL = 3.0
}

// Town structure
export interface Town {
  id: string;
  name: string;
  population: number;
  specialization: TownSpecialization;
  description: string;
  position: {
    x: number;
    y: number;
  };
  // Visual aspects
  visualTheme: string; // Architectural style
  iconPath: string;
  // Economic factors
  wealthLevel: number; // 1-10 scale
  productionFocus: string[]; // What this town produces
  demandFocus: string[]; // What this town needs
  // Connection to other towns
  connectedTowns: TownConnection[];
  // Active effects
  currentEvents: TownEvent[];
  // Player relations
  playerReputations: Record<string, number>; // playerId -> reputation (0-100)
  // Market data
  market: TownMarket;
  // Special resources
  uniqueResources: string[];
}

// Connections between towns
export interface TownConnection {
  toTownId: string;
  distance: number; // In game units
  terrainDifficulty: number; // 1-10, affects travel time/cost
  description: string;
  travelMethod: "road" | "river" | "coast" | "mountain" | "forest";
  unlockRequirement?: {
    playerLevel?: number;
    reputation?: number;
    questCompletion?: string;
  };
}

// Town events affect demand, supply, and prices
export interface TownEvent {
  id: string;
  name: string;
  description: string;
  startDate: number;
  duration: number; // In game days
  effects: {
    demandModifiers: Record<string, number>; // product category -> multiplier
    priceModifiers: Record<string, number>;
    reputationOpportunity?: number; // Bonus reputation potential
    craftPointOpportunity?: number; // Bonus CP potential
  };
  townResponse?: {
    fulfilled: boolean;
    playerContributions: Record<string, number>; // player -> contribution amount
  };
}

// Market system for each town
export interface TownMarket {
  // Current demand for product categories
  demandLevels: Record<string, ProductDemandLevel>;
  // Base prices for resource categories (modified by events/seasons)
  basePrices: Record<string, number>;
  // Current stock of resources town is selling
  availableResources: InventoryItem[];
  // Special orders with bonus rewards
  specialOrders: SpecialOrder[];
  // Market volatility (how quickly prices change)
  volatility: number; // 0-1
  // Last refresh timestamp
  lastRefreshed: number;
  // Trade volume tracking
  weeklyTradeVolume: number;
  // Seasonal production bonuses
  seasonalProductionBonus: Record<Season, string[]>;
}

// Special orders for high-value, time-limited deliveries
export interface SpecialOrder {
  id: string;
  townId: string;
  title: string;
  description: string;
  requestedBy: string; // NPC name
  requestedProducts: {
    productCategory: string;
    quantity: number;
    minQuality: number;
    specificProperties?: string[];
  }[];
  rewards: {
    gold: number;
    craftPoints: number;
    reputation: number;
    uniqueRewards?: {
      itemId: string;
      quantity: number;
    }[];
  };
  deadline: number; // Timestamp when order expires
  difficulty: number; // 1-5 scale
  assignedToPlayer?: string; // Player who accepted the order
  completed: boolean;
  seasonal: boolean; // If tied to current season
}

// Town reputation levels and benefits
export enum TownReputationLevel {
  OUTSIDER = 0,      // 0-19
  VISITOR = 1,       // 20-39
  ACQUAINTANCE = 2,  // 40-59
  TRUSTED = 3,       // 60-79
  RESPECTED = 4,     // 80-89
  REVERED = 5        // 90-100
}

// Benefits gained at different reputation levels
export interface TownReputationBenefits {
  discountPercentage: number;
  specialOrderAccess: boolean;
  rareIngredientAccess: boolean;
  marketPriceStability: boolean;
  craftPointBonus: number;
  uniqueRecipeAccess: boolean;
}

// Establish the town network
export const TOWNS: Town[] = [
  {
    id: "elderhaven",
    name: "Elderhaven",
    population: 5000,
    specialization: TownSpecialization.SPIRITUAL,
    description: "A town with ancient traditions centered around herbal wisdom and magical ceremonies.",
    position: { x: 50, y: 50 },
    visualTheme: "traditional_asian",
    iconPath: "/assets/towns/elderhaven.png",
    wealthLevel: 7,
    productionFocus: ["ritual_herbs", "spiritual_items", "meditation_aids"],
    demandFocus: ["calming_products", "focus_enhancers", "purifying_masks"],
    connectedTowns: [
      {
        toTownId: "riverport",
        distance: 80,
        terrainDifficulty: 3,
        description: "A winding road through ancient forests",
        travelMethod: "road"
      },
      {
        toTownId: "mistpeak",
        distance: 120,
        terrainDifficulty: 6,
        description: "A steep mountain pass with breathtaking views",
        travelMethod: "mountain"
      }
    ],
    currentEvents: [],
    playerReputations: {},
    market: {
      demandLevels: {
        "calming_mask": ProductDemandLevel.HIGH,
        "focus_serum": ProductDemandLevel.NORMAL,
        "purifying_toner": ProductDemandLevel.VERY_HIGH
      },
      basePrices: {
        "rare_herb": 120,
        "common_herb": 40,
        "ritual_item": 200
      },
      availableResources: [],
      specialOrders: [],
      volatility: 0.3,
      lastRefreshed: 0,
      weeklyTradeVolume: 0,
      seasonalProductionBonus: {
        "Spring": ["growth_herbs", "rejuvenation_items"],
        "Summer": ["sun_essences", "vitality_herbs"],
        "Fall": ["transition_items", "preservation_herbs"],
        "Winter": ["spiritual_essences", "dream_herbs"]
      }
    },
    uniqueResources: ["moonlit_moss", "elder_tree_bark", "temple_incense"]
  },
  {
    id: "riverport",
    name: "Riverport",
    population: 8500,
    specialization: TownSpecialization.MARITIME,
    description: "A bustling port town where traders from distant lands bring exotic ingredients.",
    position: { x: 120, y: 40 },
    visualTheme: "coastal_trading",
    iconPath: "/assets/towns/riverport.png",
    wealthLevel: 8,
    productionFocus: ["exotic_imports", "seafaring_tools", "preserved_goods"],
    demandFocus: ["hydrating_products", "weather_protection", "luxury_items"],
    connectedTowns: [
      {
        toTownId: "elderhaven",
        distance: 80,
        terrainDifficulty: 3,
        description: "A winding road through ancient forests",
        travelMethod: "road"
      },
      {
        toTownId: "sunmeadow",
        distance: 100,
        terrainDifficulty: 2,
        description: "A well-maintained trade route",
        travelMethod: "road"
      },
      {
        toTownId: "crystalhaven",
        distance: 150,
        terrainDifficulty: 4,
        description: "A river route requiring a ferry crossing",
        travelMethod: "river"
      }
    ],
    currentEvents: [],
    playerReputations: {},
    market: {
      demandLevels: {
        "hydrating_cream": ProductDemandLevel.VERY_HIGH,
        "weather_protection_balm": ProductDemandLevel.HIGH,
        "luxury_facial_oil": ProductDemandLevel.HIGH
      },
      basePrices: {
        "exotic_ingredient": 150,
        "imported_tool": 180,
        "sea_essence": 100
      },
      availableResources: [],
      specialOrders: [],
      volatility: 0.5, // Higher due to trading nature
      lastRefreshed: 0,
      weeklyTradeVolume: 0,
      seasonalProductionBonus: {
        "Spring": ["rare_seeds", "foreign_spices"],
        "Summer": ["tropical_extracts", "sun_stones"],
        "Fall": ["preserved_exotics", "warming_oils"],
        "Winter": ["frost_crystals", "imported_roots"]
      }
    },
    uniqueResources: ["deep_sea_kelp", "pearl_dust", "tropical_flower_extract"]
  },
  {
    id: "sunmeadow",
    name: "Sunmeadow",
    population: 3200,
    specialization: TownSpecialization.AGRICULTURAL,
    description: "Fertile farmlands and orchards supply the region with the finest herbs and produce.",
    position: { x: 200, y: 60 },
    visualTheme: "farmland_village",
    iconPath: "/assets/towns/sunmeadow.png",
    wealthLevel: 5,
    productionFocus: ["fresh_herbs", "grain", "fruits", "vegetables"],
    demandFocus: ["fertilizers", "growth_tonics", "protective_balms"],
    connectedTowns: [
      {
        toTownId: "riverport",
        distance: 100,
        terrainDifficulty: 2,
        description: "A well-maintained trade route",
        travelMethod: "road"
      },
      {
        toTownId: "ironvale",
        distance: 90,
        terrainDifficulty: 4,
        description: "A road through rolling hills",
        travelMethod: "road"
      }
    ],
    currentEvents: [],
    playerReputations: {},
    market: {
      demandLevels: {
        "growth_tonic": ProductDemandLevel.VERY_HIGH,
        "protective_balm": ProductDemandLevel.HIGH,
        "fertilizer_essence": ProductDemandLevel.CRITICAL
      },
      basePrices: {
        "fresh_herb": 30, // Lower price due to abundance
        "fruit_essence": 60,
        "vegetable_extract": 50
      },
      availableResources: [],
      specialOrders: [],
      volatility: 0.2, // Low volatility due to stable production
      lastRefreshed: 0,
      weeklyTradeVolume: 0,
      seasonalProductionBonus: {
        "Spring": ["sprout_extracts", "flower_essences"],
        "Summer": ["fruit_extracts", "sun_herbs"],
        "Fall": ["harvest_essences", "seed_extracts"],
        "Winter": ["root_extracts", "preserved_herbs"]
      }
    },
    uniqueResources: ["golden_honey", "sunrise_wheat", "perfect_tomato_extract"]
  },
  {
    id: "mistpeak",
    name: "Mistpeak",
    population: 2000,
    specialization: TownSpecialization.MOUNTAINOUS,
    description: "A mysterious town shrouded in mist, where rare mountain herbs and crystals are gathered.",
    position: { x: 90, y: 120 },
    visualTheme: "mountain_mystery",
    iconPath: "/assets/towns/mistpeak.png",
    wealthLevel: 4,
    productionFocus: ["mountain_herbs", "crystals", "mist_essences"],
    demandFocus: ["clarity_potions", "warming_balms", "vision_enhancers"],
    connectedTowns: [
      {
        toTownId: "elderhaven",
        distance: 120,
        terrainDifficulty: 6,
        description: "A steep mountain pass with breathtaking views",
        travelMethod: "mountain"
      },
      {
        toTownId: "crystalhaven",
        distance: 130,
        terrainDifficulty: 7,
        description: "A dangerous but beautiful crystal-lined path",
        travelMethod: "mountain",
        unlockRequirement: {
          playerLevel: 5,
          reputation: 60
        }
      }
    ],
    currentEvents: [],
    playerReputations: {},
    market: {
      demandLevels: {
        "clarity_serum": ProductDemandLevel.HIGH,
        "warming_balm": ProductDemandLevel.VERY_HIGH,
        "vision_drops": ProductDemandLevel.HIGH
      },
      basePrices: {
        "mountain_herb": 90,
        "raw_crystal": 120,
        "mist_essence": 150
      },
      availableResources: [],
      specialOrders: [],
      volatility: 0.4,
      lastRefreshed: 0,
      weeklyTradeVolume: 0,
      seasonalProductionBonus: {
        "Spring": ["thawing_herbs", "clear_crystals"],
        "Summer": ["high_altitude_flowers", "sun_stones"],
        "Fall": ["weather_sensing_herbs", "transformation_crystals"],
        "Winter": ["frost_herbs", "snow_crystals"]
      }
    },
    uniqueResources: ["cloud_mushroom", "peak_snow_essence", "dragon_breath_crystal"]
  },
  {
    id: "crystalhaven",
    name: "Crystalhaven",
    population: 4000,
    specialization: TownSpecialization.SCHOLARLY,
    description: "A town built around a magical academy, where esoteric knowledge and crystal magic are studied.",
    position: { x: 160, y: 130 },
    visualTheme: "magical_academy",
    iconPath: "/assets/towns/crystalhaven.png",
    wealthLevel: 8,
    productionFocus: ["magical_tools", "scholarly_works", "enchanted_items"],
    demandFocus: ["focus_tonics", "mental_clarity_serums", "anti-aging_creams"],
    connectedTowns: [
      {
        toTownId: "riverport",
        distance: 150,
        terrainDifficulty: 4,
        description: "A river route requiring a ferry crossing",
        travelMethod: "river"
      },
      {
        toTownId: "mistpeak",
        distance: 130,
        terrainDifficulty: 7,
        description: "A dangerous but beautiful crystal-lined path",
        travelMethod: "mountain",
        unlockRequirement: {
          playerLevel: 5,
          reputation: 60
        }
      },
      {
        toTownId: "ironvale",
        distance: 110,
        terrainDifficulty: 5,
        description: "An ancient road with crystalline markers",
        travelMethod: "road"
      }
    ],
    currentEvents: [],
    playerReputations: {},
    market: {
      demandLevels: {
        "focus_tonic": ProductDemandLevel.VERY_HIGH,
        "mental_clarity_serum": ProductDemandLevel.HIGH,
        "anti_aging_cream": ProductDemandLevel.NORMAL
      },
      basePrices: {
        "enchanted_crystal": 200,
        "magical_text": 150,
        "rare_knowledge": 300
      },
      availableResources: [],
      specialOrders: [],
      volatility: 0.3,
      lastRefreshed: 0,
      weeklyTradeVolume: 0,
      seasonalProductionBonus: {
        "Spring": ["growth_crystals", "mental_awakening_herbs"],
        "Summer": ["energy_crystals", "clarity_herbs"],
        "Fall": ["transition_crystals", "memory_herbs"],
        "Winter": ["preservation_crystals", "deep_focus_herbs"]
      }
    },
    uniqueResources: ["philosopher's_crystal", "memory_enhancing_dust", "academy_grown_rare_herbs"]
  },
  {
    id: "ironvale",
    name: "Ironvale",
    population: 6000,
    specialization: TownSpecialization.INDUSTRIAL,
    description: "A town known for its craftsmanship, where traditional tools and modern techniques blend.",
    position: { x: 240, y: 110 },
    visualTheme: "crafting_town",
    iconPath: "/assets/towns/ironvale.png",
    wealthLevel: 6,
    productionFocus: ["tools", "machinery", "processed_materials"],
    demandFocus: ["hand_creams", "protective_serums", "recovery_balms"],
    connectedTowns: [
      {
        toTownId: "sunmeadow",
        distance: 90,
        terrainDifficulty: 4,
        description: "A road through rolling hills",
        travelMethod: "road"
      },
      {
        toTownId: "crystalhaven",
        distance: 110,
        terrainDifficulty: 5,
        description: "An ancient road with crystalline markers",
        travelMethod: "road"
      }
    ],
    currentEvents: [],
    playerReputations: {},
    market: {
      demandLevels: {
        "hand_cream": ProductDemandLevel.VERY_HIGH,
        "protective_serum": ProductDemandLevel.HIGH,
        "recovery_balm": ProductDemandLevel.VERY_HIGH
      },
      basePrices: {
        "crafting_tool": 85,
        "machine_part": 110,
        "processed_material": 65
      },
      availableResources: [],
      specialOrders: [],
      volatility: 0.25,
      lastRefreshed: 0,
      weeklyTradeVolume: 0,
      seasonalProductionBonus: {
        "Spring": ["refined_spring_metals", "new_tools"],
        "Summer": ["heat_resistant_materials", "forged_components"],
        "Fall": ["weatherproof_tools", "precision_parts"],
        "Winter": ["insulated_materials", "indoor_crafting_supplies"]
      }
    },
    uniqueResources: ["perfect_metal_filings", "artisan_tool_oil", "worker's_soothing_clay"]
  },
  {
    id: "willowhaven",
    name: "Willowhaven",
    population: 2500,
    specialization: TownSpecialization.ARTISTIC,
    description: "A beautiful town where artists and performers gather, known for creative innovations.",
    position: { x: 180, y: 180 },
    visualTheme: "artistic_village",
    iconPath: "/assets/towns/willowhaven.png",
    wealthLevel: 5,
    productionFocus: ["pigments", "artisan_tools", "decorative_items"],
    demandFocus: ["inspiration_tonics", "beautifying_masks", "sensory_enhancement"],
    connectedTowns: [
      {
        toTownId: "crystalhaven",
        distance: 85,
        terrainDifficulty: 3,
        description: "A scenic route following a small stream",
        travelMethod: "road"
      }
    ],
    currentEvents: [],
    playerReputations: {},
    market: {
      demandLevels: {
        "inspiration_tonic": ProductDemandLevel.VERY_HIGH,
        "beautifying_mask": ProductDemandLevel.VERY_HIGH,
        "sensory_oil": ProductDemandLevel.HIGH
      },
      basePrices: {
        "rare_pigment": 130,
        "artistic_tool": 100,
        "decorative_essence": 90
      },
      availableResources: [],
      specialOrders: [],
      volatility: 0.4,
      lastRefreshed: 0,
      weeklyTradeVolume: 0,
      seasonalProductionBonus: {
        "Spring": ["vibrant_pigments", "new_vision_tools"],
        "Summer": ["light_capturing_materials", "performance_enhancers"],
        "Fall": ["transformative_pigments", "reflection_tools"],
        "Winter": ["dream_capturing_tools", "inner_vision_enhancers"]
      }
    },
    uniqueResources: ["rainbow_clay", "artist's_inspiration_extract", "perfect_tone_flower"]
  }
];

// Generate a specific town's market refresh
export function refreshTownMarket(townId: string, currentSeason: Season, currentMoonPhase: MoonPhase): TownMarket {
  const town = TOWNS.find(t => t.id === townId);
  if (!town) throw new Error(`Town with ID ${townId} not found`);
  
  // Clone the current market
  const market: TownMarket = {...town.market};
  
  // Update seasonal production bonuses
  const seasonalBoosts = market.seasonalProductionBonus[currentSeason] || [];
  
  // Adjust demand levels based on season
  Object.keys(market.demandLevels).forEach(product => {
    // Base volatility change (-20% to +20%)
    const volatilityFactor = 1 + (Math.random() * market.volatility * 2 - market.volatility);
    
    // Seasonal effect
    const seasonalBoost = seasonalBoosts.some(boost => product.includes(boost)) ? 1.2 : 1.0;
    
    // Adjust the demand level
    let newDemand = market.demandLevels[product] * volatilityFactor * seasonalBoost;
    
    // Moon phase affects certain products
    if (currentMoonPhase === "Full Moon" && (product.includes("glow") || product.includes("rejuvenat"))) {
      newDemand *= 1.3;
    } else if (currentMoonPhase === "New Moon" && (product.includes("calm") || product.includes("sleep"))) {
      newDemand *= 1.25;
    }
    
    // Cap the demand between very low and critical
    if (newDemand < ProductDemandLevel.VERY_LOW) newDemand = ProductDemandLevel.VERY_LOW;
    if (newDemand > ProductDemandLevel.CRITICAL) newDemand = ProductDemandLevel.CRITICAL;
    
    market.demandLevels[product] = newDemand as ProductDemandLevel;
  });
  
  // Refresh available resources
  market.availableResources = generateAvailableResources(town, currentSeason);
  
  // Generate special orders
  market.specialOrders = generateSpecialOrders(town, currentSeason, currentMoonPhase);
  
  // Update last refreshed timestamp
  market.lastRefreshed = Date.now();
  
  return market;
}

// Generate available resources for a town to sell
function generateAvailableResources(town: Town, currentSeason: Season): InventoryItem[] {
  const resources: InventoryItem[] = [];
  
  // Generate common resources based on town's production focus
  town.productionFocus.forEach(focus => {
    // Generate 2-5 items per production focus
    const itemCount = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < itemCount; i++) {
      // TODO: Generate specific items based on focus and town specialization
      // This is a simplified placeholder
      resources.push({
        id: `${town.id}_${focus}_${i}`,
        baseId: focus,
        name: `${capitalize(town.name)} ${capitalize(focus)}`,
        type: "ingredient" as any,
        category: focus as any,
        quantity: Math.floor(Math.random() * 10) + 5,
        value: town.market.basePrices[focus] || 50,
        quality: Math.floor(Math.random() * 30) + 50 // 50-80 quality
      });
    }
  });
  
  // Add seasonal specialties
  const seasonalItems = town.market.seasonalProductionBonus[currentSeason] || [];
  seasonalItems.forEach(item => {
    resources.push({
      id: `${town.id}_seasonal_${item}`,
      baseId: item,
      name: `Seasonal ${capitalize(item)}`,
      type: "ingredient" as any,
      category: "seasonal" as any,
      quantity: Math.floor(Math.random() * 5) + 1, // Rare, low quantity
      value: (town.market.basePrices[item] || 100) * 1.5, // Premium for seasonal
      quality: Math.floor(Math.random() * 20) + 70 // 70-90 quality
    });
  });
  
  // Add unique resources (very limited)
  town.uniqueResources.forEach(unique => {
    // 30% chance for each unique resource to be available
    if (Math.random() < 0.3) {
      resources.push({
        id: `${town.id}_unique_${unique}`,
        baseId: unique,
        name: capitalize(unique),
        type: "ingredient" as any,
        category: "rare" as any,
        quantity: 1, // Very limited
        value: 300 + Math.floor(Math.random() * 200), // Expensive
        quality: Math.floor(Math.random() * 10) + 90 // 90-100 quality
      });
    }
  });
  
  return resources;
}

// Generate special orders for a town
function generateSpecialOrders(town: Town, currentSeason: Season, currentMoonPhase: MoonPhase): SpecialOrder[] {
  const orders: SpecialOrder[] = [];
  
  // Base number of orders depends on town size
  const baseOrderCount = Math.floor(town.population / 1000);
  
  // Adjust for seasonality and moon phase
  let orderCount = baseOrderCount;
  if (town.market.seasonalProductionBonus[currentSeason]?.length > 2) {
    orderCount += 1; // More orders during the town's productive season
  }
  
  // Full moon and new moon have special significance for orders
  if (currentMoonPhase === "Full Moon" || currentMoonPhase === "New Moon") {
    orderCount += 1;
  }
  
  // Generate the determined number of orders
  for (let i = 0; i < orderCount; i++) {
    // Determine order difficulty (higher index = potentially harder order)
    const difficulty = Math.min(5, Math.floor(i / 2) + 1);
    
    // Generate a special order
    const order: SpecialOrder = {
      id: `${town.id}_order_${Date.now()}_${i}`,
      townId: town.id,
      title: generateOrderTitle(town, difficulty),
      description: generateOrderDescription(town, difficulty, currentSeason),
      requestedBy: generateNpcName(town),
      requestedProducts: generateRequestedProducts(town, difficulty, currentSeason),
      rewards: calculateOrderRewards(town, difficulty, currentSeason),
      deadline: Date.now() + (3 + difficulty) * 24 * 60 * 60 * 1000, // 3-8 days based on difficulty
      difficulty: difficulty,
      completed: false,
      seasonal: isSeasonal(difficulty, currentSeason)
    };
    
    orders.push(order);
  }
  
  return orders;
}

// Helper functions for special order generation
function generateOrderTitle(town: Town, difficulty: number): string {
  const titles = [
    `${town.name} Standard Request`,
    `${town.name} Special Commission`,
    `Urgent Needs for ${town.name}`,
    `${town.name} Exclusive Contract`,
    `${town.name} Emergency Requisition`
  ];
  
  return titles[Math.min(difficulty - 1, titles.length - 1)];
}

function generateOrderDescription(town: Town, difficulty: number, season: Season): string {
  // Complex description generation would go here
  return `A ${difficulty > 3 ? 'challenging' : 'standard'} request from ${town.name} during ${season}.`;
}

function generateNpcName(_town: Town): string {
  // Would connect to an NPC database in a full implementation
  const firstNames = ["Eliza", "Joon", "Mei", "Ravi", "Sora", "Tomas", "Zhen"];
  const lastNames = ["Park", "Kim", "Song", "Chen", "Wei", "Tanaka", "Shah"];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateRequestedProducts(town: Town, difficulty: number, season: Season): SpecialOrder["requestedProducts"] {
  const products: SpecialOrder["requestedProducts"] = [];
  
  // Number of different products requested scales with difficulty
  const productCount = Math.max(1, Math.floor(difficulty / 2));
  
  for (let i = 0; i < productCount; i++) {
    // Select from town's demand focus
    const categoryIndex = Math.floor(Math.random() * town.demandFocus.length);
    const category = town.demandFocus[categoryIndex];
    
    products.push({
      productCategory: category,
      quantity: difficulty + Math.floor(Math.random() * 3), // Higher difficulty = more items
      minQuality: 50 + (difficulty * 5) // Higher difficulty = higher quality
    });
  }
  
  // Add seasonal specific requests
  if (difficulty >= 3 && Math.random() < 0.7) {
    const seasonalProperty = season.toLowerCase();
    products.push({
      productCategory: town.demandFocus[0],
      quantity: Math.floor(difficulty / 2),
      minQuality: 70,
      specificProperties: [seasonalProperty]
    });
  }
  
  return products;
}

function calculateOrderRewards(town: Town, difficulty: number, season: Season): SpecialOrder["rewards"] {
  // Base rewards scale with difficulty
  const baseGold = 100 * difficulty;
  const baseCraftPoints = 20 * difficulty;
  const baseReputation = 5 * difficulty;
  
  // Wealth multiplier
  const wealthMultiplier = 0.8 + (town.wealthLevel * 0.05); // 0.8-1.3
  
  // Seasonal bonus (if town is in its prosperous season)
  const seasonalBonus = town.market.seasonalProductionBonus[season]?.length > 2 ? 1.2 : 1.0;
  
  // Calculate final rewards
  const rewards: SpecialOrder["rewards"] = {
    gold: Math.round(baseGold * wealthMultiplier * seasonalBonus),
    craftPoints: Math.round(baseCraftPoints * (difficulty > 3 ? 1.2 : 1.0) * seasonalBonus),
    reputation: Math.round(baseReputation * (town.specialization === TownSpecialization.SPIRITUAL ? 1.3 : 1.0))
  };
  
  // Add unique rewards for higher difficulty orders
  if (difficulty >= 4 && Math.random() < 0.7) {
    rewards.uniqueRewards = [{
      itemId: `${town.id}_${town.uniqueResources[0]}`,
      quantity: 1
    }];
  }
  
  return rewards;
}

function isSeasonal(difficulty: number, _season: Season): boolean {
  // Higher difficulty orders are more likely to be seasonal
  return difficulty >= 3 && Math.random() < 0.6;
}

// Update player reputation with a town
export function updatePlayerReputation(
  playerId: string, 
  townId: string, 
  reputationChange: number
): number {
  const town = TOWNS.find(t => t.id === townId);
  if (!town) throw new Error(`Town with ID ${townId} not found`);
  
  // Initialize reputation if not present
  if (!town.playerReputations[playerId]) {
    town.playerReputations[playerId] = 0;
  }
  
  // Update reputation with limits
  town.playerReputations[playerId] = Math.max(
    0, 
    Math.min(100, town.playerReputations[playerId] + reputationChange)
  );
  
  return town.playerReputations[playerId];
}

// Get current reputation level
export function getReputationLevel(reputation: number): TownReputationLevel {
  if (reputation < 20) return TownReputationLevel.OUTSIDER;
  if (reputation < 40) return TownReputationLevel.VISITOR;
  if (reputation < 60) return TownReputationLevel.ACQUAINTANCE;
  if (reputation < 80) return TownReputationLevel.TRUSTED;
  if (reputation < 90) return TownReputationLevel.RESPECTED;
  return TownReputationLevel.REVERED;
}

// Get benefits for current reputation level
export function getReputationBenefits(reputation: number): TownReputationBenefits {
  const level = getReputationLevel(reputation);
  
  switch(level) {
    case TownReputationLevel.OUTSIDER:
      return {
        discountPercentage: 0,
        specialOrderAccess: false,
        rareIngredientAccess: false,
        marketPriceStability: false,
        craftPointBonus: 0,
        uniqueRecipeAccess: false
      };
    case TownReputationLevel.VISITOR:
      return {
        discountPercentage: 5,
        specialOrderAccess: false,
        rareIngredientAccess: false,
        marketPriceStability: false,
        craftPointBonus: 5,
        uniqueRecipeAccess: false
      };
    case TownReputationLevel.ACQUAINTANCE:
      return {
        discountPercentage: 10,
        specialOrderAccess: true,
        rareIngredientAccess: false,
        marketPriceStability: false,
        craftPointBonus: 10,
        uniqueRecipeAccess: false
      };
    case TownReputationLevel.TRUSTED:
      return {
        discountPercentage: 15,
        specialOrderAccess: true,
        rareIngredientAccess: true,
        marketPriceStability: true,
        craftPointBonus: 15,
        uniqueRecipeAccess: false
      };
    case TownReputationLevel.RESPECTED:
      return {
        discountPercentage: 20,
        specialOrderAccess: true,
        rareIngredientAccess: true,
        marketPriceStability: true,
        craftPointBonus: 20,
        uniqueRecipeAccess: true
      };
    case TownReputationLevel.REVERED:
      return {
        discountPercentage: 25,
        specialOrderAccess: true,
        rareIngredientAccess: true,
        marketPriceStability: true,
        craftPointBonus: 30,
        uniqueRecipeAccess: true
      };
  }
}

// Generate town event
export function generateTownEvent(
  townId: string,
  _currentSeason: Season
): TownEvent {
  const town = TOWNS.find(t => t.id === townId);
  if (!town) throw new Error(`Town with ID ${townId} not found`);
  
  // Different event types based on town specialization
  const events: Record<TownSpecialization, string[]> = {
    [TownSpecialization.SCHOLARLY]: ["Research Breakthrough", "Academic Festival", "Ancient Text Discovery"],
    [TownSpecialization.AGRICULTURAL]: ["Bountiful Harvest", "Crop Blight", "Seed Exchange"],
    [TownSpecialization.SPIRITUAL]: ["Spiritual Awakening", "Celestial Alignment", "Sacred Ritual"],
    [TownSpecialization.ARTISTIC]: ["Art Exhibition", "Creative Renaissance", "Performance Festival"],
    [TownSpecialization.INDUSTRIAL]: ["Factory Expansion", "Tool Innovation", "Resource Discovery"],
    [TownSpecialization.MARITIME]: ["Trade Fleet Arrival", "Storm Damage", "Sea Treasure Discovery"],
    [TownSpecialization.MOUNTAINOUS]: ["Mountain Expedition", "Crystal Vein Discovery", "Avalanche Recovery"]
  };
  
  // Select random event type based on town
  const eventOptions = events[town.specialization];
  const eventName = eventOptions[Math.floor(Math.random() * eventOptions.length)];
  
  // Determine if positive or challenging event
  const isPositive = Math.random() < 0.7;
  
  // Create demand modifiers based on event
  const demandModifiers: Record<string, number> = {};
  town.demandFocus.forEach(focus => {
    demandModifiers[focus] = isPositive 
      ? 1 + Math.random() * 0.5  // +0-50% demand
      : Math.max(0.7, 1 - Math.random() * 0.3);  // -0-30% demand
  });
  
  // Create price modifiers
  const priceModifiers: Record<string, number> = {};
  Object.keys(town.market.basePrices).forEach(item => {
    priceModifiers[item] = isPositive
      ? Math.max(0.8, 1 - Math.random() * 0.2)  // Prices slightly lower in good times
      : 1 + Math.random() * 0.4;  // Prices higher in challenging times
  });
  
  // Duration varies based on event significance
  const durationDays = Math.floor(Math.random() * 4) + 2;  // 2-5 days
  
  // Opportunity for player reputation and craft points
  const reputationOpportunity = isPositive ? 5 + Math.floor(Math.random() * 10) : 10 + Math.floor(Math.random() * 15);
  const craftPointOpportunity = isPositive ? 20 + Math.floor(Math.random() * 30) : 40 + Math.floor(Math.random() * 60);
  
  return {
    id: `${townId}_event_${Date.now()}`,
    name: eventName,
    description: `${town.name} is experiencing ${eventName.toLowerCase()}${isPositive ? ', creating opportunities' : ', causing challenges'} for the community.`,
    startDate: Date.now(),
    duration: durationDays * 24 * 60 * 60 * 1000,
    effects: {
      demandModifiers,
      priceModifiers,
      reputationOpportunity,
      craftPointOpportunity
    },
    townResponse: {
      fulfilled: false,
      playerContributions: {}
    }
  };
}

// Process player delivery to town
export function processDelivery(
  playerId: string,
  _playerName: string,
  townId: string,
  product: CraftableProduct,
  quantity: number,
  isSpecialOrder: boolean = false,
  specialOrderId?: string
): {
  success: boolean;
  gold: number;
  craftPoints: number;
  reputation: number;
  message: string;
} {
  const town = TOWNS.find(t => t.id === townId);
  if (!town) throw new Error(`Town with ID ${townId} not found`);
  
  // Get current demand for this product category
  const demandLevel = town.market.demandLevels[product.category] || ProductDemandLevel.NORMAL;
  
  // Calculate base gold value
  const baseGoldValue = product.baseValue * quantity;
  
  // Apply demand multiplier
  const demandMultiplier = demandLevel;
  
  // Apply quality multiplier (higher quality = exponentially more value)
  const qualityMultiplier = 0.5 + (product.quality / 100) * 1.5;
  
  // Apply reputation discount/bonus
  const reputation = town.playerReputations[playerId] || 0;
  const reputationMultiplier = 1 + (reputation / 200); // 0-50% bonus
  
  // Special order bonus
  const specialOrderMultiplier = isSpecialOrder ? 1.5 : 1.0;
  
  // Calculate total gold
  const totalGold = Math.round(
    baseGoldValue * demandMultiplier * qualityMultiplier * reputationMultiplier * specialOrderMultiplier
  );
  
  // Calculate craft points (based on quality and demand)
  const baseCraftPoints = Math.round(product.baseValue * 0.2 * quantity);
  const craftPoints = Math.round(
    baseCraftPoints * qualityMultiplier * (demandMultiplier / 2 + 0.5) * specialOrderMultiplier
  );
  
  // Reputation gain (higher for special orders)
  const baseReputationGain = isSpecialOrder ? 5 : 2;
  const reputationGain = Math.min(
    10, // Cap per transaction 
    Math.round(baseReputationGain * (product.quality / 70) * quantity / 2)
  );
  
  // Update player reputation
  const newReputation = updatePlayerReputation(playerId, townId, reputationGain);
  
  // If this was a special order, mark it completed
  if (isSpecialOrder && specialOrderId) {
    const orderIndex = town.market.specialOrders.findIndex(o => o.id === specialOrderId);
    if (orderIndex >= 0) {
      town.market.specialOrders[orderIndex].completed = true;
    }
  }
  
  // Return delivery results
  return {
    success: true,
    gold: totalGold,
    craftPoints,
    reputation: newReputation, 
    message: isSpecialOrder 
      ? `Special order fulfilled! ${town.name} is very pleased with your ${product.name}.`
      : `Delivery of ${quantity} ${product.name} accepted by ${town.name}.`
  };
}

// Internal helper
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}