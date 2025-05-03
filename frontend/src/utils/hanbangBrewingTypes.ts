import { 
  MoonPhase, 
  Season, 
  ElementType, 
  ItemType, 
  ItemCategory, 
  TarotCard,
  InventoryItem
} from 'coven-shared';

// Type definitions for HanbangBrewing component

export type BrewingMethod = 
  'Decoction' | 
  'Infusion' | 
  'Distillation' | 
  'Fermentation' | 
  'Extraction' | 
  'Crystallization' | 
  'Maceration';

export interface BrewingResult {
  productName: string;
  description: string;
  quality: number;
  method: BrewingMethod;
  ingredientIds: string[];
  moonPhase: MoonPhase;
  season: Season;
  element: ElementType;
  brewTime: number;
  manaUsed: number;
}

export interface HanbangBrewingProps {
  playerInventory: InventoryItem[]; 
  playerMana?: number;
  brewingSkillLevel?: number;
  moonPhase?: MoonPhase;
  season?: Season;
  onBrew: (
    ingredientIds: string[], 
    method: BrewingMethod, 
    quality: number,
    manaUsed: number
  ) => void;
  onUpdateMana?: (newMana: number) => void;
  onDiscoverRecipe?: (recipeId: any) => void; 
  playerSkills?: Record<string, number>;
}

// Map brewing methods to product types
export const methodToProductType: Record<BrewingMethod, ItemType> = {
  'Decoction': 'potion',
  'Infusion': 'tonic',
  'Distillation': 'essence',
  'Fermentation': 'elixir',
  'Extraction': 'oil',
  'Crystallization': 'charm',
  'Maceration': 'mask'
};

// Map brewing methods to elemental affinities
export const brewingMethodElements: Record<BrewingMethod, ElementType> = {
  'Decoction': 'Fire',
  'Infusion': 'Water',
  'Distillation': 'Air',
  'Fermentation': 'Earth',
  'Extraction': 'Water',
  'Crystallization': 'Spirit',
  'Maceration': 'Earth'
};

// Define brewing mechanics - these simulate calculations for brewing outcomes
export const brewingMechanics = {
  baseBrewTime: {
    'Decoction': 45,
    'Infusion': 30,
    'Distillation': 60,
    'Fermentation': 90,
    'Extraction': 50,
    'Crystallization': 75,
    'Maceration': 40
  },
  
  qualityFactors: {
    'ingredientQuality': 0.5,
    'methodCompatibility': 0.3,
    'elementalAlignment': 0.2
  },
  
  timeFactors: {
    'ingredientCount': 5,  // minutes per ingredient
    'complexity': 0.2     // multiply by complexity score
  },
  
  manaFactors: {
    'base': 10,           // base mana cost
    'qualityMultiplier': 0.5, // higher quality costs more mana
    'ingredientCount': 5   // mana per ingredient
  }
};

/**
 * Calculate compatibility between ingredients and brewing method
 * @param ingredientCards Array of ingredient cards
 * @param method Brewing method
 * @returns Compatibility score (0-100)
 */
export function calculateCompatibility(
  ingredientCards: TarotCard[],
  method: BrewingMethod
): number {
  if (!ingredientCards.length) return 0;
  
  // Method elemental affinity
  const methodElement = brewingMethodElements[method];
  
  // Calculate elemental alignment score
  let elementalScore = 0;
  ingredientCards.forEach(card => {
    if (card.element === methodElement) {
      elementalScore += 20; // Strong match
    } else if (
      (methodElement === 'Fire' && card.element === 'Air') ||
      (methodElement === 'Water' && card.element === 'Earth') ||
      (methodElement === 'Earth' && card.element === 'Water') ||
      (methodElement === 'Air' && card.element === 'Fire') ||
      (methodElement === 'Spirit' && (card.element === 'Air' || card.element === 'Water'))
    ) {
      elementalScore += 10; // Compatible elements
    }
  });
  elementalScore = Math.min(100, elementalScore / ingredientCards.length * 5);
  
  // Calculate category compatibility
  let categoryScore = 0;
  ingredientCards.forEach(card => {
    // Different brewing methods work better with different ingredient categories
    if (
      (method === 'Decoction' && (card.category === 'root' || card.category === 'herb')) ||
      (method === 'Infusion' && (card.category === 'flower' || card.category === 'leaf')) ||
      (method === 'Distillation' && (card.category === 'herb' || card.category === 'flower')) ||
      (method === 'Fermentation' && (card.category === 'fruit' || card.category === 'mushroom')) ||
      (method === 'Extraction' && (card.category === 'root' || card.category === 'seed')) ||
      (method === 'Crystallization' && (card.category === 'crystal' || card.category === 'essence')) ||
      (method === 'Maceration' && (card.category === 'herb' || card.category === 'flower'))
    ) {
      categoryScore += 20; // Strong category match
    } else {
      categoryScore += 5; // Basic compatibility
    }
  });
  categoryScore = Math.min(100, categoryScore / ingredientCards.length * 5);
  
  // Weighted compatibility score
  return Math.round(elementalScore * 0.6 + categoryScore * 0.4);
}

/**
 * Determine the ideal brewing method for a set of ingredients
 * @param ingredientCards Array of ingredient cards
 * @returns The most compatible brewing method
 */
export function determineIdealMethod(ingredientCards: TarotCard[]): BrewingMethod {
  if (!ingredientCards.length) return 'Infusion'; // Default

  const methods: BrewingMethod[] = [
    'Decoction', 
    'Infusion', 
    'Distillation', 
    'Fermentation', 
    'Extraction', 
    'Crystallization', 
    'Maceration'
  ];
  
  let bestMethod = methods[0];
  let bestScore = 0;
  
  methods.forEach(method => {
    const score = calculateCompatibility(ingredientCards, method);
    if (score > bestScore) {
      bestScore = score;
      bestMethod = method;
    }
  });
  
  return bestMethod;
}

/**
 * Calculate expected quality of brewing outcome
 * @param ingredientCards Array of ingredient cards
 * @param method Brewing method
 * @param playerSkill Player's brewing skill level
 * @returns Expected quality score (0-100)
 */
export function calculateBrewingQuality(
  ingredientCards: TarotCard[],
  method: BrewingMethod,
  playerSkill: number = 0
): number {
  if (!ingredientCards.length) return 30; // Base quality
  
  // Average ingredient quality based on rank and rarity
  const rarityValues = {
    'common': 1,
    'uncommon': 2,
    'rare': 3,
    'legendary': 4
  };
  
  let ingredientQuality = 0;
  ingredientCards.forEach(card => {
    // Calculate from card rank (1-10) and rarity multiplier
    const rarityMultiplier = rarityValues[card.rarity] || 1;
    ingredientQuality += (card.rank * 10 * rarityMultiplier);
  });
  ingredientQuality = Math.min(100, ingredientQuality / ingredientCards.length);
  
  // Method compatibility score
  const compatibilityScore = calculateCompatibility(ingredientCards, method);
  
  // Player skill bonus (0-25 points)
  const skillBonus = Math.min(25, playerSkill / 2);
  
  // Calculate weighted quality score
  let qualityScore = 
    (ingredientQuality * brewingMechanics.qualityFactors.ingredientQuality) +
    (compatibilityScore * brewingMechanics.qualityFactors.methodCompatibility) +
    skillBonus;
  
  // Additional random factor (±10%)
  const randomFactor = 0.9 + (Math.random() * 0.2);
  qualityScore *= randomFactor;
  
  return Math.round(Math.min(100, Math.max(10, qualityScore)));
}

/**
 * Generate a product name based on ingredients and method
 * @param ingredientCards Array of ingredient cards
 * @param method Brewing method
 * @param quality Quality score
 * @returns Generated name for the product
 */
export function generateProductName(
  ingredientCards: TarotCard[],
  method: BrewingMethod,
  quality: number
): string {
  if (!ingredientCards.length) return "Empty Brew";
  
  // Get primary ingredient (highest rank or first)
  const primaryIngredient = [...ingredientCards]
    .sort((a, b) => b.rank - a.rank)[0];
  
  // Quality prefixes
  const qualityPrefixes = [
    ['Basic', 'Common', 'Simple', 'Crude'], // 0-25
    ['Standard', 'Decent', 'Regular', 'Practical'], // 26-50
    ['Quality', 'Fine', 'Superior', 'Enhanced'], // 51-75
    ['Exquisite', 'Masterful', 'Sublime', 'Legendary'] // 76-100
  ];
  
  const qualityTier = Math.min(3, Math.floor(quality / 25));
  const prefixOptions = qualityPrefixes[qualityTier];
  const prefix = prefixOptions[Math.floor(Math.random() * prefixOptions.length)];
  
  // Get method-specific product type
  const productType = methodToProductType[method];
  
  // Format name based on quality and ingredients
  if (quality > 85) {
    return `${prefix} ${primaryIngredient.name} ${productType.charAt(0).toUpperCase() + productType.slice(1)}`;
  } else if (quality > 50) {
    return `${prefix} ${primaryIngredient.name} ${productType.charAt(0).toUpperCase() + productType.slice(1)}`;
  } else {
    return `${prefix} ${productType.charAt(0).toUpperCase() + productType.slice(1)} of ${primaryIngredient.name}`;
  }
}

/**
 * Generate a product description based on ingredients and method
 * @param ingredientCards Array of ingredient cards
 * @param method Brewing method
 * @param quality Quality score
 * @returns Generated description for the product
 */
export function generateProductDescription(
  ingredientCards: TarotCard[],
  method: BrewingMethod,
  quality: number
): string {
  if (!ingredientCards.length) return "An empty container with no apparent properties.";
  
  // Get primary ingredients
  const primaryIngredients = ingredientCards.slice(0, Math.min(3, ingredientCards.length));
  
  // Get primary effect types
  const effectTypes = primaryIngredients
    .map(card => card.primaryEffect?.type || '')
    .filter(type => type !== '');
  
  // Method descriptions
  const methodDescriptions: Record<BrewingMethod, string> = {
    'Decoction': 'simmered slowly to extract its essence',
    'Infusion': 'steeped in hot water to release its properties',
    'Distillation': 'carefully distilled to concentrate its power',
    'Fermentation': 'fermented to develop complex properties',
    'Extraction': 'extracted using precise techniques',
    'Crystallization': 'crystallized into a stable form',
    'Maceration': 'soaked to absorb the full properties'
  };
  
  // Quality descriptors
  const qualityDescriptors = [
    'of questionable efficacy', // 0-25
    'of modest potency', // 26-50
    'of considerable strength', // 51-75
    'of remarkable potency' // 76-100
  ];
  
  const qualityTier = Math.min(3, Math.floor(quality / 25));
  const qualityDesc = qualityDescriptors[qualityTier];
  
  // Format ingredient list
  const ingredientsList = primaryIngredients
    .map(ing => ing.name)
    .join(', ')
    .replace(/, ([^,]*)$/, ' and $1');
  
  // Effect description based on primary ingredients
  let effectDesc = '';
  if (effectTypes.includes('growth')) {
    effectDesc += 'It promotes growth and vitality. ';
  }
  if (effectTypes.includes('potency')) {
    effectDesc += 'It enhances magical potency. ';
  }
  if (effectTypes.includes('stability')) {
    effectDesc += 'It promotes stability and balance. ';
  }
  if (effectTypes.includes('harmony')) {
    effectDesc += 'It creates harmony and resonance. ';
  }
  
  // Combine everything into a description
  return `A brew made from ${ingredientsList}, ${methodDescriptions[method]}. This concoction is ${qualityDesc}. ${effectDesc}`;
}

/**
 * Calculate time required for brewing
 * @param ingredientCards Array of ingredient cards
 * @param method Brewing method
 * @param playerSkill Player's brewing skill level
 * @returns Brewing time in minutes
 */
export function calculateBrewingTime(
  ingredientCards: TarotCard[],
  method: BrewingMethod,
  playerSkill: number = 0
): number {
  if (!ingredientCards.length) return 0;
  
  // Base time based on method
  const baseTime = brewingMechanics.baseBrewTime[method] || 30;
  
  // Additional time based on number of ingredients
  const ingredientTime = ingredientCards.length * brewingMechanics.timeFactors.ingredientCount;
  
  // Calculate complexity score based on ingredient ranks and synergy
  let complexityScore = 0;
  ingredientCards.forEach(card => {
    complexityScore += card.rank;
  });
  complexityScore = Math.min(100, complexityScore / ingredientCards.length * 10);
  
  const complexityTime = complexityScore * brewingMechanics.timeFactors.complexity;
  
  // Skill reduction (higher skill = faster brewing)
  const skillReduction = Math.min(0.3, playerSkill / 100); // Up to 30% reduction
  
  // Calculate total time
  let totalTime = (baseTime + ingredientTime + complexityTime) * (1 - skillReduction);
  
  return Math.round(Math.max(10, totalTime));
}