import { Season, MoonPhase, ItemCategory, Skills } from "coven-shared";
import { CraftableProduct } from "./craftPointsSystem.js";
import { EnhancedSpecialization } from "./atelierSpecializationSystem.js";

// Hanbang-inspired skincare product system
// Based on traditional Korean herbal medicine principles

// Product categories specific to skincare
export enum SkincareFocus {
  BRIGHTENING = "brightening",
  HYDRATING = "hydrating",
  FIRMING = "firming",
  SOOTHING = "soothing",
  PURIFYING = "purifying",
  ANTI_AGING = "anti_aging",
  REVITALIZING = "revitalizing",
  NOURISHING = "nourishing",
  BALANCING = "balancing",
  PROTECTIVE = "protective"
}

// Product types specific to skincare
export enum SkincareType {
  ESSENCE = "essence",
  SERUM = "serum",
  AMPOULE = "ampoule",
  CREAM = "cream",
  MASK = "mask",
  TONER = "toner",
  BALM = "balm",
  OIL = "oil",
  MIST = "mist",
  EXFOLIANT = "exfoliant"
}

// Base product with skin benefits
export interface SkincareProduct extends CraftableProduct {
  skincareFocus: SkincareFocus[];
  skincareType: SkincareType;
  primaryBenefit: string;
  secondaryBenefits: string[];
  keyIngredients: string[];
  absorptionRate: number; // 1-100
  sensoryProperties: {
    texture: string;
    scent: string;
    color: string;
    feeling: string;
  };
  applicationMethod: string;
  // Hanbang-specific properties
  energeticProperties: {
    yin: number; // 1-100
    yang: number; // 1-100
    qi: number; // 1-100
  };
  elementalBalance: {
    wood: number; // 1-100
    fire: number; // 1-100 
    earth: number; // 1-100
    metal: number; // 1-100
    water: number; // 1-100
  };
  seasonalHarmony: Season[];
  constitutionalAffinity: string[];
}

// Ingredient properties specific to Hanbang skincare
export interface HanbangIngredient {
  id: string;
  name: string;
  koreanName: string;
  description: string;
  category: ItemCategory;
  rarity: string;
  skincareFocus: SkincareFocus[];
  keyBenefits: string[];
  energeticProperties: {
    yin: number; // 1-100
    yang: number; // 1-100
    qi: number; // 1-100
    nature: "warming" | "cooling" | "neutral";
  };
  elementalAssociation: {
    wood: number; // 0-100
    fire: number; // 0-100
    earth: number; // 0-100
    metal: number; // 0-100
    water: number; // 0-100
  };
  traditionalUses: string[];
  seasonalHarvest: Season[];
  flavorProfile: {
    sweet: number; // 0-100
    sour: number; // 0-100
    bitter: number; // 0-100
    pungent: number; // 0-100
    salty: number; // 0-100
  };
  potencyModifiers: {
    preparation: string[];
    combinations: string[];
    moonPhase: MoonPhase[];
  };
  contraindications: string[];
}

// Database of Hanbang herbal ingredients
export const HANBANG_INGREDIENTS: HanbangIngredient[] = [
  {
    id: "ginseng",
    name: "Ginseng",
    koreanName: "인삼 (Insam)",
    description: "The king of herbs, known for its revitalizing and energy-boosting properties.",
    category: "root",
    rarity: "rare",
    skincareFocus: [SkincareFocus.REVITALIZING, SkincareFocus.ANTI_AGING],
    keyBenefits: ["Stimulates skin cell regeneration", "Boosts circulation", "Enhances skin elasticity"],
    energeticProperties: {
      yin: 40,
      yang: 60,
      qi: 90,
      nature: "warming"
    },
    elementalAssociation: {
      wood: 20,
      fire: 60,
      earth: 80,
      metal: 30,
      water: 40
    },
    traditionalUses: ["Energy restoration", "Longevity tonic", "Mental clarity"],
    seasonalHarvest: ["Fall"],
    flavorProfile: {
      sweet: 60,
      sour: 0,
      bitter: 40,
      pungent: 30,
      salty: 10
    },
    potencyModifiers: {
      preparation: ["Steamed", "Aged", "Sun-dried"],
      combinations: ["licorice", "jujube", "honey"],
      moonPhase: ["Full Moon"]
    },
    contraindications: ["May overstimulate sensitive skin", "Not recommended for use with hypertension"]
  },
  {
    id: "centella_asiatica",
    name: "Centella Asiatica",
    koreanName: "병풀 (Byeongpul)",
    description: "A powerful herb for wound healing and skin regeneration.",
    category: "herb",
    rarity: "uncommon",
    skincareFocus: [SkincareFocus.SOOTHING, SkincareFocus.REVITALIZING],
    keyBenefits: ["Accelerates wound healing", "Stimulates collagen production", "Calms inflammation"],
    energeticProperties: {
      yin: 60,
      yang: 40,
      qi: 70,
      nature: "cooling"
    },
    elementalAssociation: {
      wood: 70,
      fire: 20,
      earth: 60,
      metal: 30,
      water: 50
    },
    traditionalUses: ["Wound healing", "Mental clarity", "Longevity"],
    seasonalHarvest: ["Summer", "Spring"],
    flavorProfile: {
      sweet: 30,
      sour: 10,
      bitter: 50,
      pungent: 10,
      salty: 0
    },
    potencyModifiers: {
      preparation: ["Fresh extract", "Fermented"],
      combinations: ["green tea", "licorice", "rice"],
      moonPhase: ["Waxing Crescent"]
    },
    contraindications: ["May increase sensitivity to sun"]
  },
  {
    id: "licorice_root",
    name: "Licorice Root",
    koreanName: "감초 (Gamcho)",
    description: "The great harmonizer, enhances the effects of other herbs while brightening skin.",
    category: "root",
    rarity: "common",
    skincareFocus: [SkincareFocus.BRIGHTENING, SkincareFocus.SOOTHING],
    keyBenefits: ["Brightens dark spots", "Reduces inflammation", "Balances oil production"],
    energeticProperties: {
      yin: 50,
      yang: 50,
      qi: 60,
      nature: "neutral"
    },
    elementalAssociation: {
      wood: 30,
      fire: 30,
      earth: 80,
      metal: 40,
      water: 50
    },
    traditionalUses: ["Harmonizing other herbs", "Digestive tonic", "Anti-inflammatory"],
    seasonalHarvest: ["Fall"],
    flavorProfile: {
      sweet: 80,
      sour: 0,
      bitter: 10,
      pungent: 0,
      salty: 0
    },
    potencyModifiers: {
      preparation: ["Decocted", "Honey-fried"],
      combinations: ["ginseng", "jujube", "cinnamon"],
      moonPhase: ["First Quarter"]
    },
    contraindications: ["May cause sensitivity in some individuals", "Not recommended for hypertension"]
  },
  {
    id: "green_tea",
    name: "Green Tea",
    koreanName: "녹차 (Nokcha)",
    description: "Rich in antioxidants that protect skin and reduce signs of aging.",
    category: "leaf",
    rarity: "common",
    skincareFocus: [SkincareFocus.ANTI_AGING, SkincareFocus.PURIFYING],
    keyBenefits: ["Powerful antioxidant", "Reduces puffiness", "Calms redness"],
    energeticProperties: {
      yin: 70,
      yang: 30,
      qi: 50,
      nature: "cooling"
    },
    elementalAssociation: {
      wood: 80,
      fire: 20,
      earth: 30,
      metal: 50,
      water: 60
    },
    traditionalUses: ["Mental clarity", "Detoxification", "Longevity"],
    seasonalHarvest: ["Spring"],
    flavorProfile: {
      sweet: 20,
      sour: 10,
      bitter: 60,
      pungent: 20,
      salty: 0
    },
    potencyModifiers: {
      preparation: ["Steamed", "Fresh-picked", "Shade-grown"],
      combinations: ["ginseng", "rice", "honey"],
      moonPhase: ["Waxing Gibbous"]
    },
    contraindications: ["May be over-drying for very dry skin"]
  },
  {
    id: "ginger",
    name: "Ginger",
    koreanName: "생강 (Saenggang)",
    description: "Warming herb that stimulates circulation and detoxifies.",
    category: "root",
    rarity: "common",
    skincareFocus: [SkincareFocus.REVITALIZING, SkincareFocus.PURIFYING],
    keyBenefits: ["Improves circulation", "Detoxifies skin", "Reduces puffiness"],
    energeticProperties: {
      yin: 20,
      yang: 80,
      qi: 70,
      nature: "warming"
    },
    elementalAssociation: {
      wood: 30,
      fire: 80,
      earth: 40,
      metal: 20,
      water: 30
    },
    traditionalUses: ["Warming circulation", "Digestive aid", "Cold remedy"],
    seasonalHarvest: ["Fall", "Winter"],
    flavorProfile: {
      sweet: 10,
      sour: 0,
      bitter: 10,
      pungent: 90,
      salty: 0
    },
    potencyModifiers: {
      preparation: ["Fresh juice", "Dried powder", "Fermented"],
      combinations: ["cinnamon", "honey", "jujube"],
      moonPhase: ["New Moon"]
    },
    contraindications: ["May irritate sensitive skin", "Use cautiously for redness-prone skin"]
  },
  {
    id: "sacred_lotus",
    name: "Sacred Lotus",
    koreanName: "연꽃 (Yeonkkot)",
    description: "Symbol of purity that brightens and clarifies complexion.",
    category: "flower",
    rarity: "uncommon",
    skincareFocus: [SkincareFocus.BRIGHTENING, SkincareFocus.PURIFYING],
    keyBenefits: ["Brightens complexion", "Reduces hyperpigmentation", "Clarifies pores"],
    energeticProperties: {
      yin: 60,
      yang: 40,
      qi: 80,
      nature: "cooling"
    },
    elementalAssociation: {
      wood: 40,
      fire: 30,
      earth: 20,
      metal: 30,
      water: 90
    },
    traditionalUses: ["Spiritual purification", "Heart tonic", "Beauty enhancement"],
    seasonalHarvest: ["Summer"],
    flavorProfile: {
      sweet: 40,
      sour: 0,
      bitter: 30,
      pungent: 0,
      salty: 0
    },
    potencyModifiers: {
      preparation: ["Dried in moonlight", "Fresh extract"],
      combinations: ["rice", "honey", "pearl powder"],
      moonPhase: ["Full Moon"]
    },
    contraindications: ["May increase sun sensitivity"]
  },
  {
    id: "honey",
    name: "Honey",
    koreanName: "꿀 (Kkul)",
    description: "Natural humectant that draws moisture to the skin while providing antibacterial benefits.",
    category: "essence",
    rarity: "common",
    skincareFocus: [SkincareFocus.HYDRATING, SkincareFocus.NOURISHING],
    keyBenefits: ["Deep hydration", "Antibacterial properties", "Soothes irritation"],
    energeticProperties: {
      yin: 40,
      yang: 60,
      qi: 60,
      nature: "neutral"
    },
    elementalAssociation: {
      wood: 30,
      fire: 50,
      earth: 80,
      metal: 20,
      water: 30
    },
    traditionalUses: ["Preservative", "Energy tonic", "Wound healing"],
    seasonalHarvest: ["Spring", "Summer"],
    flavorProfile: {
      sweet: 100,
      sour: 10,
      bitter: 0,
      pungent: 0,
      salty: 0
    },
    potencyModifiers: {
      preparation: ["Raw", "Fermented", "Aged"],
      combinations: ["ginseng", "cinnamon", "royal jelly"],
      moonPhase: ["Waxing Crescent", "Waxing Gibbous"]
    },
    contraindications: ["May cause reactions in those with bee allergies"]
  },
  {
    id: "rice_water",
    name: "Rice Water",
    koreanName: "쌀뜨물 (Ssalddeumul)",
    description: "Traditional brightening and softening ingredient rich in vitamins and minerals.",
    category: "essence",
    rarity: "common",
    skincareFocus: [SkincareFocus.BRIGHTENING, SkincareFocus.NOURISHING],
    keyBenefits: ["Brightens skin tone", "Enhances skin texture", "Provides gentle hydration"],
    energeticProperties: {
      yin: 60,
      yang: 40,
      qi: 50,
      nature: "neutral"
    },
    elementalAssociation: {
      wood: 20,
      fire: 30,
      earth: 90,
      metal: 30,
      water: 40
    },
    traditionalUses: ["Beauty tonic", "Digestive aid", "Energy support"],
    seasonalHarvest: ["Fall"],
    flavorProfile: {
      sweet: 30,
      sour: 10,
      bitter: 0,
      pungent: 0,
      salty: 0
    },
    potencyModifiers: {
      preparation: ["Fermented", "Fresh", "Sun-infused"],
      combinations: ["green tea", "lotus", "honey"],
      moonPhase: ["First Quarter"]
    },
    contraindications: ["Generally safe for all skin types"]
  },
  {
    id: "pearl_powder",
    name: "Pearl Powder",
    koreanName: "진주가루 (Jinjugaru)",
    description: "Luminous powder that brightens and clarifies while delivering minerals to the skin.",
    category: "crystal", // Using crystal as a valid ItemCategory replacement for mineral
    rarity: "rare",
    skincareFocus: [SkincareFocus.BRIGHTENING, SkincareFocus.FIRMING],
    keyBenefits: ["Brightens complexion", "Supports collagen", "Gently exfoliates"],
    energeticProperties: {
      yin: 50,
      yang: 50,
      qi: 70,
      nature: "cooling"
    },
    elementalAssociation: {
      wood: 10,
      fire: 10,
      earth: 30,
      metal: 90,
      water: 70
    },
    traditionalUses: ["Beauty enhancement", "Calming the spirit", "Purification"],
    seasonalHarvest: ["Winter"],
    flavorProfile: {
      sweet: 0,
      sour: 0,
      bitter: 0,
      pungent: 0,
      salty: 40
    },
    potencyModifiers: {
      preparation: ["Finely ground", "Fermented with rice"],
      combinations: ["lotus", "rice", "honey"],
      moonPhase: ["Full Moon"]
    },
    contraindications: ["May be too drying for very dry skin"]
  },
  {
    id: "snow_lotus",
    name: "Snow Lotus",
    koreanName: "설련화 (Seollyeonhwa)",
    description: "Rare high-altitude flower with powerful anti-aging properties.",
    category: "flower",
    rarity: "legendary",
    skincareFocus: [SkincareFocus.ANTI_AGING, SkincareFocus.REVITALIZING],
    keyBenefits: ["Powerful anti-aging effects", "Revitalizes tired skin", "Protects from environmental damage"],
    energeticProperties: {
      yin: 40,
      yang: 60,
      qi: 90,
      nature: "warming"
    },
    elementalAssociation: {
      wood: 30,
      fire: 60,
      earth: 20,
      metal: 70,
      water: 50
    },
    traditionalUses: ["Longevity", "Spiritual elevation", "Life force restoration"],
    seasonalHarvest: ["Winter"],
    flavorProfile: {
      sweet: 20,
      sour: 0,
      bitter: 50,
      pungent: 40,
      salty: 0
    },
    potencyModifiers: {
      preparation: ["Dried in shade", "Infused in oil"],
      combinations: ["ginseng", "pearl powder", "deer antler"],
      moonPhase: ["Full Moon"]
    },
    contraindications: ["Very potent - use sparingly", "May cause tingling sensation"]
  }
];

// Recipes for Hanbang skincare products
export interface SkincareRecipe {
  id: string;
  name: string;
  description: string;
  skincareType: SkincareType;
  skincareFocus: SkincareFocus[];
  ingredients: {
    id: string;
    quantity: number;
    preparationMethod?: string;
  }[];
  specialization: EnhancedSpecialization;
  minQuality: number;
  craftingDifficulty: number; // 1-10
  baseValue: number;
  craftPoints: number;
  seasonalStrength?: Season;
  lunarStrength?: MoonPhase;
  applicationInstructions: string;
  townDemand: string[]; // List of towns that particularly value this
}

// Database of skincare recipes
export const SKINCARE_RECIPES: SkincareRecipe[] = [
  {
    id: "ginseng_revitalizing_serum",
    name: "Ginseng Revitalizing Serum",
    description: "A powerful anti-aging serum that harnesses the revitalizing properties of ginseng to boost skin elasticity and radiance.",
    skincareType: SkincareType.SERUM,
    skincareFocus: [SkincareFocus.REVITALIZING, SkincareFocus.ANTI_AGING],
    ingredients: [
      { id: "ginseng", quantity: 2, preparationMethod: "Steamed" },
      { id: "honey", quantity: 1 },
      { id: "rice_water", quantity: 1, preparationMethod: "Fermented" }
    ],
    specialization: EnhancedSpecialization.ESSENCE,
    minQuality: 70,
    craftingDifficulty: 7,
    baseValue: 180,
    craftPoints: 35,
    seasonalStrength: "Fall",
    lunarStrength: "Full Moon",
    applicationInstructions: "Apply 2-3 drops to clean skin morning and evening, gently patting into skin until absorbed.",
    townDemand: ["elderhaven", "crystalhaven"]
  },
  {
    id: "lotus_brightening_essence",
    name: "Lotus Brightening Essence",
    description: "A clarifying essence that combines sacred lotus and rice water to brighten and even skin tone.",
    skincareType: SkincareType.ESSENCE,
    skincareFocus: [SkincareFocus.BRIGHTENING, SkincareFocus.PURIFYING],
    ingredients: [
      { id: "sacred_lotus", quantity: 2 },
      { id: "rice_water", quantity: 2, preparationMethod: "Fermented" },
      { id: "licorice_root", quantity: 1, preparationMethod: "Decocted" }
    ],
    specialization: EnhancedSpecialization.ESSENCE,
    minQuality: 65,
    craftingDifficulty: 6,
    baseValue: 150,
    craftPoints: 30,
    seasonalStrength: "Summer",
    lunarStrength: "Full Moon",
    applicationInstructions: "Apply generously to clean skin, gently patting with fingertips until absorbed.",
    townDemand: ["riverport", "sunmeadow"]
  },
  {
    id: "centella_soothing_mask",
    name: "Centella Soothing Mask",
    description: "A calming mask that reduces redness and inflammation while promoting skin regeneration.",
    skincareType: SkincareType.MASK,
    skincareFocus: [SkincareFocus.SOOTHING, SkincareFocus.REVITALIZING],
    ingredients: [
      { id: "centella_asiatica", quantity: 3 },
      { id: "honey", quantity: 2 },
      { id: "green_tea", quantity: 1, preparationMethod: "Fresh-picked" }
    ],
    specialization: EnhancedSpecialization.INFUSION,
    minQuality: 60,
    craftingDifficulty: 5,
    baseValue: 120,
    craftPoints: 25,
    seasonalStrength: "Spring",
    lunarStrength: "Waxing Crescent",
    applicationInstructions: "Apply a thick layer to clean skin, leave for 15-20 minutes, then rinse with warm water.",
    townDemand: ["willowhaven", "sunmeadow"]
  },
  {
    id: "pearl_luminous_cream",
    name: "Pearl Luminous Cream",
    description: "A luxurious cream that brightens and firms the skin with precious pearl powder.",
    skincareType: SkincareType.CREAM,
    skincareFocus: [SkincareFocus.BRIGHTENING, SkincareFocus.FIRMING],
    ingredients: [
      { id: "pearl_powder", quantity: 1 },
      { id: "sacred_lotus", quantity: 1 },
      { id: "honey", quantity: 2 },
      { id: "rice_water", quantity: 1, preparationMethod: "Fermented" }
    ],
    specialization: EnhancedSpecialization.CRYSTALLIZATION,
    minQuality: 75,
    craftingDifficulty: 8,
    baseValue: 200,
    craftPoints: 40,
    seasonalStrength: "Winter",
    lunarStrength: "Full Moon",
    applicationInstructions: "Apply a small amount to face and neck as the final step in your evening routine.",
    townDemand: ["crystalhaven", "willowhaven"]
  },
  {
    id: "ginger_warming_balm",
    name: "Ginger Warming Balm",
    description: "A warming balm that stimulates circulation and eases tension in the skin.",
    skincareType: SkincareType.BALM,
    skincareFocus: [SkincareFocus.REVITALIZING, SkincareFocus.PROTECTIVE],
    ingredients: [
      { id: "ginger", quantity: 2, preparationMethod: "Fresh juice" },
      { id: "honey", quantity: 1 },
      { id: "licorice_root", quantity: 1 }
    ],
    specialization: EnhancedSpecialization.FERMENTATION,
    minQuality: 60,
    craftingDifficulty: 5,
    baseValue: 130,
    craftPoints: 25,
    seasonalStrength: "Winter",
    lunarStrength: "New Moon",
    applicationInstructions: "Massage a small amount into areas of tension or dullness as needed.",
    townDemand: ["mistpeak", "ironvale"]
  },
  {
    id: "green_tea_purifying_toner",
    name: "Green Tea Purifying Toner",
    description: "A refreshing toner that clarifies and balances the skin while providing antioxidant protection.",
    skincareType: SkincareType.TONER,
    skincareFocus: [SkincareFocus.PURIFYING, SkincareFocus.BALANCING],
    ingredients: [
      { id: "green_tea", quantity: 3, preparationMethod: "Shade-grown" },
      { id: "rice_water", quantity: 1 },
      { id: "centella_asiatica", quantity: 1 }
    ],
    specialization: EnhancedSpecialization.DISTILLATION,
    minQuality: 65,
    craftingDifficulty: 4,
    baseValue: 110,
    craftPoints: 20,
    seasonalStrength: "Spring",
    lunarStrength: "Waxing Gibbous",
    applicationInstructions: "Apply to clean skin with a cotton pad or fingertips, gently patting until absorbed.",
    townDemand: ["sunmeadow", "riverport"]
  },
  {
    id: "snow_lotus_imperial_ampoule",
    name: "Snow Lotus Imperial Ampoule",
    description: "A legendary anti-aging treatment featuring rare snow lotus for remarkable skin rejuvenation.",
    skincareType: SkincareType.AMPOULE,
    skincareFocus: [SkincareFocus.ANTI_AGING, SkincareFocus.REVITALIZING],
    ingredients: [
      { id: "snow_lotus", quantity: 1 },
      { id: "ginseng", quantity: 2, preparationMethod: "Steamed" },
      { id: "pearl_powder", quantity: 1 },
      { id: "honey", quantity: 1 }
    ],
    specialization: EnhancedSpecialization.TRANSMUTATION,
    minQuality: 85,
    craftingDifficulty: 10,
    baseValue: 350,
    craftPoints: 70,
    seasonalStrength: "Winter",
    lunarStrength: "Full Moon",
    applicationInstructions: "Apply 1-2 drops to clean skin as a special treatment 2-3 times per week.",
    townDemand: ["crystalhaven", "mistpeak"]
  },
  {
    id: "licorice_brightening_oil",
    name: "Licorice Brightening Oil",
    description: "A lightweight oil that brightens dark spots and evens skin tone while nourishing.",
    skincareType: SkincareType.OIL,
    skincareFocus: [SkincareFocus.BRIGHTENING, SkincareFocus.NOURISHING],
    ingredients: [
      { id: "licorice_root", quantity: 2, preparationMethod: "Honey-fried" },
      { id: "sacred_lotus", quantity: 1 },
      { id: "green_tea", quantity: 1 }
    ],
    specialization: EnhancedSpecialization.DISTILLATION,
    minQuality: 70,
    craftingDifficulty: 6,
    baseValue: 150,
    craftPoints: 30,
    seasonalStrength: "Fall",
    lunarStrength: "First Quarter",
    applicationInstructions: "Apply 3-5 drops to skin after toning, gently pressing into areas with hyperpigmentation.",
    townDemand: ["elderhaven", "willowhaven"]
  }
];

// Create a skincare product from the provided ingredients
export function createSkincareProduct(
  recipeId: string,
  ingredientIds: string[],
  ingredientQualities: number[],
  producerId: string,
  producerName: string,
  specialization: EnhancedSpecialization,
  qualityBonus: number,
  seasonalBonus: number,
  lunarBonus: number,
  uniqueProperties: string[]
): SkincareProduct | { error: string } {
  // Find the recipe
  const recipe = SKINCARE_RECIPES.find(r => r.id === recipeId);
  if (!recipe) {
    return { error: "Recipe not found" };
  }
  
  // Check if we have all required ingredients
  const requiredIngredientIds = recipe.ingredients.map(i => i.id);
  for (const required of requiredIngredientIds) {
    if (!ingredientIds.includes(required)) {
      return { error: `Missing required ingredient: ${required}` };
    }
  }
  
  // Calculate base quality from ingredient qualities and recipe difficulty
  const avgIngredientQuality = ingredientQualities.reduce((sum, q) => sum + q, 0) / ingredientQualities.length;
  let productQuality = avgIngredientQuality * (1 - (recipe.craftingDifficulty * 0.02));
  
  // Apply quality bonuses
  productQuality += qualityBonus;
  
  // Check if specialization matches recipe
  if (specialization === recipe.specialization) {
    productQuality += 10; // Bonus for specialization match
  }
  
  // Apply seasonal bonus if applicable
  if (recipe.seasonalStrength) {
    productQuality += seasonalBonus;
  }
  
  // Apply lunar bonus if applicable
  if (recipe.lunarStrength) {
    productQuality += lunarBonus;
  }
  
  // Cap quality at 100
  productQuality = Math.min(100, Math.max(1, Math.round(productQuality)));
  
  // Check if quality meets minimum requirement
  if (productQuality < recipe.minQuality) {
    return { error: `Quality too low (${productQuality}). Recipe requires at least ${recipe.minQuality}.` };
  }
  
  // Calculate energetic properties from ingredients
  const energeticProperties = calculateEnergeticProperties(ingredientIds);
  
  // Calculate elemental balance from ingredients
  const elementalBalance = calculateElementalBalance(ingredientIds);
  
  // Determine constitutional affinity
  const constitutionalAffinity = determineConstitutionalAffinity(energeticProperties, elementalBalance);
  
  // Determine sensory properties
  const sensoryProperties = determineSensoryProperties(ingredientIds, recipe.skincareType);
  
  // Get key ingredients
  const keyIngredients = getKeyIngredients(ingredientIds);
  
  // Determine absorption rate based on product type and quality
  const absorptionRate = determineAbsorptionRate(recipe.skincareType, productQuality);
  
  // Calculate value based on quality and recipe base value
  const productValue = Math.round(recipe.baseValue * (productQuality / 70));
  
  // Calculate craft points (higher quality = more CP)
  const craftPoints = Math.round(recipe.craftPoints * (productQuality / 70));
  
  // Create the product
  const product: SkincareProduct = {
    id: `${recipeId}_${Date.now()}`,
    name: recipe.name,
    quality: productQuality,
    potency: Math.round((productQuality + energeticProperties.qi) / 2),
    category: recipe.skincareType,
    baseValue: productValue,
    craftPoints: craftPoints,
    ingredients: ingredientIds,
    creationTimestamp: Date.now(),
    producedBy: producerId,
    specialProperties: [...uniqueProperties],
    townAffinities: [...recipe.townDemand],
    
    // Skincare-specific properties
    skincareFocus: recipe.skincareFocus,
    skincareType: recipe.skincareType,
    primaryBenefit: recipe.description.split('.')[0] + '.',
    secondaryBenefits: getSecondaryBenefits(recipe.skincareFocus, productQuality),
    keyIngredients: keyIngredients,
    absorptionRate: absorptionRate,
    sensoryProperties: sensoryProperties,
    applicationMethod: recipe.applicationInstructions,
    
    // Hanbang-specific properties
    energeticProperties: energeticProperties,
    elementalBalance: elementalBalance,
    seasonalHarmony: recipe.seasonalStrength ? [recipe.seasonalStrength] : determineSeason(elementalBalance),
    constitutionalAffinity: constitutionalAffinity
  };
  
  return product;
}

// Helper function to calculate energetic properties from ingredients
function calculateEnergeticProperties(ingredientIds: string[]): SkincareProduct['energeticProperties'] {
  let yin = 0;
  let yang = 0;
  let qi = 0;
  
  // Find ingredients and their properties
  for (const id of ingredientIds) {
    const ingredient = HANBANG_INGREDIENTS.find(i => i.id === id);
    if (ingredient) {
      yin += ingredient.energeticProperties.yin;
      yang += ingredient.energeticProperties.yang;
      qi += ingredient.energeticProperties.qi;
    }
  }
  
  // Average and round the values
  return {
    yin: Math.round(yin / ingredientIds.length),
    yang: Math.round(yang / ingredientIds.length),
    qi: Math.round(qi / ingredientIds.length)
  };
}

// Helper function to calculate elemental balance from ingredients
function calculateElementalBalance(ingredientIds: string[]): SkincareProduct['elementalBalance'] {
  let wood = 0;
  let fire = 0;
  let earth = 0;
  let metal = 0;
  let water = 0;
  
  // Find ingredients and their properties
  for (const id of ingredientIds) {
    const ingredient = HANBANG_INGREDIENTS.find(i => i.id === id);
    if (ingredient) {
      wood += ingredient.elementalAssociation.wood;
      fire += ingredient.elementalAssociation.fire;
      earth += ingredient.elementalAssociation.earth;
      metal += ingredient.elementalAssociation.metal;
      water += ingredient.elementalAssociation.water;
    }
  }
  
  // Average and round the values
  return {
    wood: Math.round(wood / ingredientIds.length),
    fire: Math.round(fire / ingredientIds.length),
    earth: Math.round(earth / ingredientIds.length),
    metal: Math.round(metal / ingredientIds.length),
    water: Math.round(water / ingredientIds.length)
  };
}

// Helper function to determine constitutional affinity
function determineConstitutionalAffinity(
  energetic: SkincareProduct['energeticProperties'],
  elemental: SkincareProduct['elementalBalance']
): string[] {
  const affinities = [];
  
  // Determine based on yin/yang balance
  if (energetic.yin > energetic.yang + 20) {
    affinities.push("Dry Constitution");
  } else if (energetic.yang > energetic.yin + 20) {
    affinities.push("Warm Constitution");
  } else {
    affinities.push("Balanced Constitution");
  }
  
  // Determine based on elemental dominance
  const elements = [
    { element: "Wood", value: elemental.wood },
    { element: "Fire", value: elemental.fire },
    { element: "Earth", value: elemental.earth },
    { element: "Metal", value: elemental.metal },
    { element: "Water", value: elemental.water }
  ];
  
  // Sort by value descending
  elements.sort((a, b) => b.value - a.value);
  
  // Add the dominant element
  affinities.push(`${elements[0].element} Dominant`);
  
  // Add special combinations
  if (elemental.water > 70 && elemental.metal > 60) {
    affinities.push("Refinement Type");
  } else if (elemental.fire > 70 && elemental.earth > 60) {
    affinities.push("Nourishment Type");
  } else if (elemental.wood > 70 && elemental.water > 60) {
    affinities.push("Growth Type");
  }
  
  return affinities;
}

// Helper function to determine sensory properties
function determineSensoryProperties(
  ingredientIds: string[],
  productType: SkincareType
): SkincareProduct['sensoryProperties'] {
  // Default properties based on product type
  const baseProperties = {
    [SkincareType.ESSENCE]: { texture: "Watery", feeling: "Refreshing" },
    [SkincareType.SERUM]: { texture: "Silky", feeling: "Absorbent" },
    [SkincareType.AMPOULE]: { texture: "Concentrated", feeling: "Potent" },
    [SkincareType.CREAM]: { texture: "Rich", feeling: "Nourishing" },
    [SkincareType.MASK]: { texture: "Thick", feeling: "Cooling" },
    [SkincareType.TONER]: { texture: "Liquid", feeling: "Clarifying" },
    [SkincareType.BALM]: { texture: "Solid", feeling: "Melting" },
    [SkincareType.OIL]: { texture: "Silky", feeling: "Absorbing" },
    [SkincareType.MIST]: { texture: "Fine", feeling: "Refreshing" },
    [SkincareType.EXFOLIANT]: { texture: "Grainy", feeling: "Polishing" }
  };
  
  // Initialize with base properties
  const properties = {
    texture: baseProperties[productType]?.texture || "Smooth",
    feeling: baseProperties[productType]?.feeling || "Pleasant",
    scent: "Herbal",
    color: "Natural"
  };
  
  // Modify based on ingredients
  for (const id of ingredientIds) {
    const ingredient = HANBANG_INGREDIENTS.find(i => i.id === id);
    if (!ingredient) continue;
    
    // Adjust scent based on flavor profile
    if (ingredient.flavorProfile.sweet > 70) {
      properties.scent = "Sweet " + properties.scent;
    } else if (ingredient.flavorProfile.bitter > 70) {
      properties.scent = "Bitter " + properties.scent;
    } else if (ingredient.flavorProfile.pungent > 70) {
      properties.scent = "Spicy " + properties.scent;
    }
    
    // Adjust color based on ingredient
    if (id === "sacred_lotus") {
      properties.color = "Soft Pink";
    } else if (id === "green_tea") {
      properties.color = "Pale Green";
    } else if (id === "ginseng") {
      properties.color = "Golden Amber";
    } else if (id === "pearl_powder") {
      properties.color = "Pearlescent White";
    }
    
    // Adjust feeling based on energetic properties
    if (ingredient.energeticProperties.nature === "warming") {
      properties.feeling = "Warming " + properties.feeling;
    } else if (ingredient.energeticProperties.nature === "cooling") {
      properties.feeling = "Cooling " + properties.feeling;
    }
  }
  
  return properties;
}

// Helper function to get key ingredients
function getKeyIngredients(ingredientIds: string[]): string[] {
  return ingredientIds.map(id => {
    const ingredient = HANBANG_INGREDIENTS.find(i => i.id === id);
    return ingredient ? ingredient.name : id;
  });
}

// Helper function to determine absorption rate
function determineAbsorptionRate(productType: SkincareType, quality: number): number {
  // Base rates by product type
  const baseRates = {
    [SkincareType.ESSENCE]: 85,
    [SkincareType.SERUM]: 80,
    [SkincareType.AMPOULE]: 90,
    [SkincareType.CREAM]: 60,
    [SkincareType.MASK]: 50,
    [SkincareType.TONER]: 95,
    [SkincareType.BALM]: 40,
    [SkincareType.OIL]: 70,
    [SkincareType.MIST]: 90,
    [SkincareType.EXFOLIANT]: 50
  };
  
  // Base rate for the product type
  const baseRate = baseRates[productType] || 70;
  
  // Adjust based on quality (higher quality = better absorption)
  const qualityAdjustment = (quality - 70) * 0.3;
  
  // Calculate final rate
  return Math.min(100, Math.max(10, Math.round(baseRate + qualityAdjustment)));
}

// Helper function to get secondary benefits
function getSecondaryBenefits(focus: SkincareFocus[], quality: number): string[] {
  const benefits = [];
  
  for (const f of focus) {
    switch (f) {
      case SkincareFocus.BRIGHTENING:
        benefits.push("Reduces appearance of dark spots and hyperpigmentation");
        break;
      case SkincareFocus.HYDRATING:
        benefits.push("Provides long-lasting moisture and prevents water loss");
        break;
      case SkincareFocus.FIRMING:
        benefits.push("Improves skin elasticity and firmness");
        break;
      case SkincareFocus.SOOTHING:
        benefits.push("Calms irritation and reduces redness");
        break;
      case SkincareFocus.PURIFYING:
        benefits.push("Clears pores and reduces impurities");
        break;
      case SkincareFocus.ANTI_AGING:
        benefits.push("Diminishes the appearance of fine lines and wrinkles");
        break;
      case SkincareFocus.REVITALIZING:
        benefits.push("Enhances skin's natural renewal process");
        break;
      case SkincareFocus.NOURISHING:
        benefits.push("Provides essential nutrients for skin health");
        break;
      case SkincareFocus.BALANCING:
        benefits.push("Regulates oil production and balances skin");
        break;
      case SkincareFocus.PROTECTIVE:
        benefits.push("Shields skin from environmental stressors");
        break;
    }
  }
  
  // Add quality-based benefits
  if (quality >= 90) {
    benefits.push("Exceptional efficacy with visible results");
  } else if (quality >= 80) {
    benefits.push("Superior performance with noticeable benefits");
  } else if (quality >= 70) {
    benefits.push("Effective results with consistent use");
  }
  
  return benefits;
}

// Helper function to determine seasonal harmony
function determineSeason(elementalBalance: SkincareProduct['elementalBalance']): Season[] {
  const seasons: Season[] = [];
  const threshold = 70;
  
  // Associate elements with seasons
  if (elementalBalance.wood >= threshold) {
    seasons.push("Spring");
  }
  if (elementalBalance.fire >= threshold) {
    seasons.push("Summer");
  }
  if (elementalBalance.metal >= threshold) {
    seasons.push("Fall");
  }
  if (elementalBalance.water >= threshold) {
    seasons.push("Winter");
  }
  if (elementalBalance.earth >= threshold) {
    // Earth is associated with late summer/transition seasons
    if (!seasons.includes("Summer")) seasons.push("Summer");
    if (!seasons.includes("Fall")) seasons.push("Fall");
  }
  
  // Default to all seasons if no strong elemental affinity
  if (seasons.length === 0) {
    return ["Spring", "Summer", "Fall", "Winter"];
  }
  
  return seasons;
}

// Get all available recipes for a given specialization
export function getRecipesForSpecialization(specialization: EnhancedSpecialization): SkincareRecipe[] {
  return SKINCARE_RECIPES.filter(recipe => recipe.specialization === specialization);
}

// Get all recipes that can be crafted with available ingredients
export function getAvailableRecipes(
  ingredients: string[],
  specialization: EnhancedSpecialization,
  playerLevel: number
): SkincareRecipe[] {
  return SKINCARE_RECIPES.filter(recipe => {
    // Check specialization requirement
    if (recipe.specialization !== specialization) {
      return false;
    }
    
    // Check difficulty against player level
    if (recipe.craftingDifficulty > playerLevel * 2) {
      return false;
    }
    
    // Check if all required ingredients are available
    const requiredIngredients = new Set(recipe.ingredients.map(i => i.id));
    const availableIngredients = new Set(ingredients);
    
    for (const required of requiredIngredients) {
      if (!availableIngredients.has(required)) {
        return false;
      }
    }
    
    return true;
  });
}

// Calculate the optimal combination of ingredients for a recipe
export function optimizeIngredients(
  recipeId: string,
  availableIngredients: { id: string, quality: number }[]
): { id: string, quality: number }[] {
  const recipe = SKINCARE_RECIPES.find(r => r.id === recipeId);
  if (!recipe) {
    return [];
  }
  
  const result: { id: string, quality: number }[] = [];
  
  // Group available ingredients by type
  const ingredientsByType = new Map<string, { id: string, quality: number }[]>();
  
  for (const ingredient of availableIngredients) {
    const type = ingredient.id;
    if (!ingredientsByType.has(type)) {
      ingredientsByType.set(type, []);
    }
    ingredientsByType.get(type)?.push(ingredient);
  }
  
  // For each required ingredient, select the highest quality available
  for (const required of recipe.ingredients) {
    const typeIngredients = ingredientsByType.get(required.id) || [];
    
    // Sort by quality, highest first
    typeIngredients.sort((a, b) => b.quality - a.quality);
    
    // Add the required quantity
    for (let i = 0; i < required.quantity; i++) {
      if (i < typeIngredients.length) {
        result.push(typeIngredients[i]);
      }
    }
  }
  
  return result;
}

// Generate a product recommendation based on skin concerns
export function recommendProduct(
  skinConcerns: SkincareFocus[],
  constitutionalType: string,
  season: Season
): SkincareRecipe[] {
  // Filter recipes that address the skin concerns
  let matchingRecipes = SKINCARE_RECIPES.filter(recipe => {
    // Check if the recipe addresses any of the skin concerns
    return recipe.skincareFocus.some(focus => skinConcerns.includes(focus));
  });
  
  // Further filter by constitutional type if possible
  if (constitutionalType.includes("Dry")) {
    matchingRecipes = matchingRecipes.filter(recipe => 
      recipe.skincareFocus.includes(SkincareFocus.HYDRATING) || 
      recipe.skincareFocus.includes(SkincareFocus.NOURISHING)
    );
  } else if (constitutionalType.includes("Warm")) {
    matchingRecipes = matchingRecipes.filter(recipe => 
      recipe.skincareFocus.includes(SkincareFocus.SOOTHING) || 
      recipe.skincareFocus.includes(SkincareFocus.PURIFYING)
    );
  }
  
  // Prioritize seasonal recipes
  const seasonalRecipes = matchingRecipes.filter(recipe => recipe.seasonalStrength === season);
  
  // Return seasonal matches first, then other matches
  return [...seasonalRecipes, ...matchingRecipes.filter(r => !seasonalRecipes.includes(r))];
}