// shared/src/brewingMethods.ts
import { ElementType, CardEffect, TarotCard, ComboRef } from './types.js';
import { findCardById } from './tarotCards.js';

// The four Hanbang brewing methods
export type BrewingMethod = 'Infusion' | 'Fermentation' | 'Distillation' | 'Crystallization';

// Map brewing methods to elements
export const brewingMethodElements: Record<BrewingMethod, ElementType> = {
  'Infusion': 'Water',      // Combining herbs for skincare tonics and serums
  'Fermentation': 'Earth',  // Aging ingredients for masks and treatments
  'Distillation': 'Fire',   // Extracting essential oils and potent essences
  'Crystallization': 'Air'  // Creating charm crystals and talismans
};

// Map element to brewing methods
export const elementToBrewingMethod: Record<ElementType, BrewingMethod | null> = {
  'Water': 'Infusion',
  'Earth': 'Fermentation',
  'Fire': 'Distillation',
  'Air': 'Crystallization',
  'Spirit': null  // Spirit is a special element that enhances others
};

// The types of products that can be created with each method
export type BrewingProduct = 'Tonic' | 'Mask' | 'Oil' | 'Charm';

// Map brewing methods to product types
export const methodToProductType: Record<BrewingMethod, BrewingProduct> = {
  'Infusion': 'Tonic',           // Water-based tonics and serums
  'Fermentation': 'Mask',        // Earth-based masks and treatments
  'Distillation': 'Oil',         // Fire-based essential oils
  'Crystallization': 'Charm'     // Air-based charms and talismans
};

// Each brewing method has unique mechanics
export interface BrewingMechanics {
  name: BrewingMethod;
  element: ElementType;
  description: string;
  productType: BrewingProduct;
  optimalCardTypes: string[];    // Types of cards that work best with this method
  minimumCards: number;          // Minimum cards needed
  maximumCards: number;          // Maximum cards allowed
  processingTime: number;        // Base time to complete brewing
  manaRequirement: number;       // Base mana needed
  moonPhaseBonus?: string;       // Moon phase with bonus
  seasonBonus?: string;          // Season with bonus
  specialProperties: string[];   // Special properties of this method
}

// Define the mechanics for each brewing method
export const brewingMechanics: Record<BrewingMethod, BrewingMechanics> = {
  'Infusion': {
    name: 'Infusion',
    element: 'Water',
    description: 'Infuse herbs and flowers in water to create tonics and serums that hydrate and nourish the skin.',
    productType: 'Tonic',
    optimalCardTypes: ['herb', 'flower', 'root'],
    minimumCards: 2,
    maximumCards: 4,
    processingTime: 1,  // Quickest process
    manaRequirement: 5,
    moonPhaseBonus: 'Waxing Crescent',
    seasonBonus: 'Spring',
    specialProperties: [
      'Retains the gentle essence of ingredients',
      'Creates balanced, harmonic blends',
      'Excellent for sensitive applications',
      'Preserves delicate notes and scents'
    ]
  },
  'Fermentation': {
    name: 'Fermentation',
    element: 'Earth',
    description: 'Ferment ingredients over time to create rich masks and treatments that deeply cleanse and rejuvenate.',
    productType: 'Mask',
    optimalCardTypes: ['root', 'herb', 'fruit'],
    minimumCards: 2,
    maximumCards: 3,
    processingTime: 3,  // Longest process
    manaRequirement: 10,
    moonPhaseBonus: 'Full Moon',
    seasonBonus: 'Fall',
    specialProperties: [
      'Increases potency through aging',
      'Transforms raw ingredients into complex compounds',
      'Creates rich, deep treatments',
      'Enhances the nutritive properties of ingredients'
    ]
  },
  'Distillation': {
    name: 'Distillation',
    element: 'Fire',
    description: 'Apply heat to extract potent essential oils from ingredients for concentrated skin treatments.',
    productType: 'Oil',
    optimalCardTypes: ['flower', 'leaf', 'fruit'],
    minimumCards: 3,
    maximumCards: 5,
    processingTime: 2,
    manaRequirement: 15,
    moonPhaseBonus: 'Waning Gibbous',
    seasonBonus: 'Summer',
    specialProperties: [
      'Concentrates the most powerful properties',
      'Isolates specific beneficial compounds',
      'Creates pure, focused essences',
      'Excellent for targeted treatments'
    ]
  },
  'Crystallization': {
    name: 'Crystallization',
    element: 'Air',
    description: 'Crystallize essences into solid form to create charms and talismans with lasting effects.',
    productType: 'Charm',
    optimalCardTypes: ['crystal', 'essence', 'oil'],
    minimumCards: 2,
    maximumCards: 3,
    processingTime: 2,
    manaRequirement: 20,
    moonPhaseBonus: 'New Moon',
    seasonBonus: 'Winter',
    specialProperties: [
      'Captures and preserves magical energies',
      'Creates items with ongoing effects',
      'Stabilizes volatile essences',
      'Allows for precise control of properties'
    ]
  }
};

// Calculate brewing compatibility between cards
export function calculateCompatibility(card1: TarotCard, card2: TarotCard): number {
  let compatibility = 50; // Base score
  
  // Element interactions
  const elementPairs: Record<string, number> = {
    'Water-Earth': 20,  // Nourishing
    'Earth-Water': 20,  // Grounding
    'Fire-Air': 20,     // Energizing
    'Air-Fire': 20,     // Expanding
    'Water-Fire': -10,  // Opposing
    'Fire-Water': -10,  // Opposing
    'Earth-Air': -10,   // Opposing
    'Air-Earth': -10,   // Opposing
    'Spirit-Water': 25, // Enhancement
    'Spirit-Earth': 25, // Enhancement
    'Spirit-Fire': 25,  // Enhancement
    'Spirit-Air': 25,   // Enhancement
  };
  
  const elementKey = `${card1.element}-${card2.element}`;
  if (elementPairs[elementKey]) {
    compatibility += elementPairs[elementKey];
  }
  
  // Same element bonus
  if (card1.element === card2.element) {
    compatibility += 15;
  }
  
  // Category synergies
  if (card1.category === card2.category) {
    compatibility += 10; // Same category bonus
  }
  
  // Known combo bonus
  const hasCombo = card1.combos.some((combo: ComboRef) => combo.cardId === card2.id) ||
                  card2.combos.some((combo: ComboRef) => combo.cardId === card1.id);
  if (hasCombo) {
    compatibility += 30;
  }
  
  // Rank difference
  const rankDiff = Math.abs(card1.rank - card2.rank);
  if (rankDiff <= 2) {
    compatibility += 10; // Similar rank works well
  } else if (rankDiff >= 5) {
    compatibility -= 10; // Very different ranks can clash
  }
  
  // Same moon phase or season affinity
  if (card1.moonPhaseAffinity === card2.moonPhaseAffinity) {
    compatibility += 15;
  }
  if (card1.seasonAffinity === card2.seasonAffinity) {
    compatibility += 15;
  }
  
  // Cap compatibility
  return Math.max(10, Math.min(100, compatibility));
}

// Determine the ideal brewing method for a set of cards
export function determineIdealMethod(cards: TarotCard[]): BrewingMethod | null {
  if (cards.length === 0) return null;
  
  // Count elements
  const elementCounts: Record<ElementType, number> = {
    'Water': 0,
    'Earth': 0,
    'Fire': 0,
    'Air': 0,
    'Spirit': 0
  };
  
  cards.forEach(card => {
    elementCounts[card.element]++;
  });
  
  // Find dominant element (excluding Spirit)
  let dominantElement: ElementType = 'Water';
  let maxCount = elementCounts['Water'];
  
  for (const element of ['Earth', 'Fire', 'Air'] as ElementType[]) {
    if (elementCounts[element] > maxCount) {
      maxCount = elementCounts[element];
      dominantElement = element;
    }
  }
  
  // Check if Spirit is present to enhance (for future enhancement)
  // const spiritPresent = elementCounts['Spirit'] > 0;
  
  // Convert to brewing method
  const method = elementToBrewingMethod[dominantElement];
  
  // Return method
  return method;
}

// Calculate brewing result quality
export function calculateBrewingQuality(
  cards: TarotCard[], 
  method: BrewingMethod, 
  moonPhase: string, 
  season: string,
  playerSkillLevel: number = 1
): number {
  if (cards.length === 0) return 0;
  
  // Base quality based on card ranks
  const avgRank = cards.reduce((sum, card) => sum + card.rank, 0) / cards.length;
  let quality = avgRank * 5; // Base scaling
  
  // Check if we have enough cards
  const mechanics = brewingMechanics[method];
  if (cards.length < mechanics.minimumCards) {
    quality *= 0.5; // Penalty for too few ingredients
  }
  
  // Check for optimal card types
  const optimalTypes = mechanics.optimalCardTypes;
  const optimalCount = cards.filter(card => 
    optimalTypes.includes(card.category)).length;
  
  quality += (optimalCount / cards.length) * 20;
  
  // Moon phase and season bonuses
  if (mechanics.moonPhaseBonus === moonPhase) {
    quality += 15;
  }
  if (mechanics.seasonBonus === season) {
    quality += 15;
  }
  
  // Calculate compatibility between cards
  let totalCompatibility = 0;
  let pairCount = 0;
  
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      totalCompatibility += calculateCompatibility(cards[i], cards[j]);
      pairCount++;
    }
  }
  
  if (pairCount > 0) {
    quality += (totalCompatibility / pairCount) * 0.2;
  }
  
  // Element alignment with method
  const methodElement = brewingMethodElements[method];
  const alignedCards = cards.filter(card => card.element === methodElement).length;
  quality += (alignedCards / cards.length) * 25;
  
  // Player skill bonus
  quality += playerSkillLevel * 2;
  
  // Spirit cards enhancement
  const spiritCards = cards.filter(card => card.element === 'Spirit').length;
  if (spiritCards > 0) {
    quality += 10 * spiritCards;
  }
  
  // Cap quality
  return Math.max(10, Math.min(100, Math.round(quality)));
}

// Generate a name for the brewed product
export function generateProductName(
  cards: TarotCard[], 
  method: BrewingMethod, 
  quality: number
): string {
  // Get product type
  const productType = methodToProductType[method];
  
  // Quality tiers
  let qualityPrefix = '';
  if (quality >= 90) qualityPrefix = 'Legendary';
  else if (quality >= 75) qualityPrefix = 'Exceptional';
  else if (quality >= 60) qualityPrefix = 'Superior';
  else if (quality >= 45) qualityPrefix = 'Quality';
  else if (quality >= 30) qualityPrefix = 'Standard';
  else qualityPrefix = 'Basic';
  
  // Get primary ingredient
  let highestRankCard = cards[0];
  for (const card of cards) {
    if (card.rank > highestRankCard.rank) {
      highestRankCard = card;
    }
  }
  
  // Get secondary ingredient if there is one
  let secondaryName = '';
  if (cards.length > 1) {
    // Find second most important card that's not the same as highest
    let secondaryCard = cards.find(card => card.id !== highestRankCard.id);
    if (secondaryCard) {
      secondaryName = secondaryCard.name.split(' ')[0].toLowerCase();
    }
  }
  
  // Generate name patterns based on method
  const primaryName = highestRankCard.name.split(' ')[0];
  
  switch (method) {
    case 'Infusion':
      if (secondaryName) {
        return `${qualityPrefix} ${primaryName}-${secondaryName} Tonic`;
      }
      return `${qualityPrefix} ${primaryName} Tonic`;
      
    case 'Fermentation':
      if (secondaryName) {
        return `${qualityPrefix} ${primaryName} & ${secondaryName} Mask`;
      }
      return `${qualityPrefix} Fermented ${primaryName} Mask`;
      
    case 'Distillation':
      return `${qualityPrefix} ${primaryName} Essential Oil`;
      
    case 'Crystallization':
      if (quality >= 75) {
        return `${primaryName} Talisman of ${secondaryName || 'Power'}`;
      }
      return `${primaryName} Charm`;
      
    default:
      return `${qualityPrefix} ${productType}`;
  }
}

// Generate a description for the brewed product
export function generateProductDescription(
  cards: TarotCard[], 
  method: BrewingMethod, 
  quality: number
): string {
  // Get product type
  const productType = methodToProductType[method];
  
  // Quality descriptor
  let qualityDesc = '';
  if (quality >= 90) qualityDesc = 'exquisite';
  else if (quality >= 75) qualityDesc = 'excellent';
  else if (quality >= 60) qualityDesc = 'high-quality';
  else if (quality >= 45) qualityDesc = 'good';
  else if (quality >= 30) qualityDesc = 'decent';
  else qualityDesc = 'basic';
  
  // Get primary and secondary effects
  const primaryEffect = cards[0].primaryEffect.description;
  let secondaryEffect = '';
  if (cards.length > 1 && cards[1].primaryEffect) {
    secondaryEffect = cards[1].primaryEffect.description;
  }
  
  // Method specific descriptions
  switch (method) {
    case 'Infusion':
      return `A ${qualityDesc} tonic that ${primaryEffect.toLowerCase()}${
        secondaryEffect ? ` and ${secondaryEffect.toLowerCase()}` : ''
      }. Created through gentle water infusion of hanbang herbs.`;
      
    case 'Fermentation':
      return `A ${qualityDesc} face mask fermented over time to ${primaryEffect.toLowerCase()}${
        secondaryEffect ? ` while also ${secondaryEffect.toLowerCase()}` : ''
      }. Traditional hanbang fermentation enhances its potency.`;
      
    case 'Distillation':
      return `A ${qualityDesc} essential oil distilled to capture the essence of ${
        cards.map(c => c.name.toLowerCase()).join(' and ')
      }. This concentrated extract ${primaryEffect.toLowerCase()}.`;
      
    case 'Crystallization':
      if (quality >= 75) {
        return `A ${qualityDesc} talisman that continuously ${primaryEffect.toLowerCase()}. Its crystalline structure holds the essence of ${
          cards.map(c => c.name.toLowerCase()).join(' and ')
        }.`;
      }
      return `A ${qualityDesc} charm that ${primaryEffect.toLowerCase()}. The crystallized energies provide a temporary effect.`;
      
    default:
      return `A ${qualityDesc} ${productType.toLowerCase()} made from ${
        cards.map(c => c.name.toLowerCase()).join(' and ')
      }.`;
  }
}

// Calculate brewing time required
export function calculateBrewingTime(
  cards: TarotCard[], 
  method: BrewingMethod,
  playerSkillLevel: number = 1
): number {
  const baseDuration = brewingMechanics[method].processingTime;
  
  // More cards = more time
  const cardFactor = 1 + (cards.length * 0.2);
  
  // Higher ranks = more time
  const avgRank = cards.reduce((sum, card) => sum + card.rank, 0) / cards.length;
  const rankFactor = 1 + (avgRank * 0.1);
  
  // Skill reduces time
  const skillFactor = Math.max(0.5, 1 - (playerSkillLevel * 0.05));
  
  return Math.round(baseDuration * cardFactor * rankFactor * skillFactor);
}