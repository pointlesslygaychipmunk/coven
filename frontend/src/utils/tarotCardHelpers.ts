import { 
  TarotCard, 
  ElementType, 
  MoonPhase, 
  Season, 
  CardEffect,
  ComboRef
} from 'coven-shared';

// Import mock implementations
import {
  findCardById,
  getCardsByCategory,
  getCardsByElement,
  getCardsByMoonPhase,
  getCardsBySeason,
  getComboCards
} from './tarotCardMocks';

/**
 * Calculate the effectiveness of a card based on current environmental conditions
 * @param card The tarot card to evaluate
 * @param currentMoonPhase Current moon phase
 * @param currentSeason Current season
 * @returns Effectiveness score (0-100)
 */
export function calculateCardEffectiveness(
  card: TarotCard,
  currentMoonPhase: MoonPhase,
  currentSeason: Season
): number {
  if (!card) return 0;
  
  // Base effectiveness starts at 50
  let effectiveness = 50;
  
  // Adjust based on moon phase alignment (±20)
  if (card.moonPhaseAffinity === currentMoonPhase) {
    effectiveness += 20; // Perfect alignment
  } else if (
    (card.moonPhaseAffinity === 'Full Moon' && currentMoonPhase.includes('Gibbous')) ||
    (card.moonPhaseAffinity === 'New Moon' && currentMoonPhase.includes('Crescent')) ||
    (card.moonPhaseAffinity.includes('Waxing') && currentMoonPhase.includes('Waxing')) ||
    (card.moonPhaseAffinity.includes('Waning') && currentMoonPhase.includes('Waning'))
  ) {
    effectiveness += 10; // Close alignment
  }
  
  // Adjust based on seasonal alignment (±20)
  if (card.seasonAffinity === currentSeason) {
    effectiveness += 20; // Perfect alignment
  } else if (
    (card.seasonAffinity === 'Spring' && currentSeason === 'Summer') ||
    (card.seasonAffinity === 'Summer' && currentSeason === 'Fall') ||
    (card.seasonAffinity === 'Fall' && currentSeason === 'Winter') ||
    (card.seasonAffinity === 'Winter' && currentSeason === 'Spring')
  ) {
    effectiveness += 10; // Adjacent season
  } else {
    effectiveness -= 10; // Opposing season
  }
  
  // Adjust based on card rank (±10)
  // Higher rank cards are less affected by environmental conditions
  const rankAdjustment = (card.rank - 5) * 2; // Range: -8 to +10
  effectiveness += rankAdjustment;
  
  // Ensure effectiveness is within valid range (0-100)
  return Math.max(0, Math.min(100, effectiveness));
}

/**
 * Calculate the compatibility between two cards
 * @param card1 First tarot card
 * @param card2 Second tarot card
 * @returns Compatibility score (0-100) and reason
 */
export function calculateCardCompatibility(
  card1: TarotCard,
  card2: TarotCard
): { score: number; reason: string } {
  if (!card1 || !card2) return { score: 0, reason: 'Invalid cards' };
  
  // Start with a base compatibility of 50%
  let compatibility = 50;
  let reason = '';
  
  // Check for established combos
  const card1Combos = card1.combos.map(combo => combo.cardId);
  const card2Combos = card2.combos.map(combo => combo.cardId);
  
  if (card1Combos.includes(card2.id) || card2Combos.includes(card1.id)) {
    compatibility += 30;
    reason = 'Known card combo';
    
    // Find the specific combo effect
    const combo1 = card1.combos.find(combo => combo.cardId === card2.id);
    const combo2 = card2.combos.find(combo => combo.cardId === card1.id);
    
    if (combo1) {
      reason = combo1.effectDescription;
    } else if (combo2) {
      reason = combo2.effectDescription;
    }
  } else {
    // Elemental compatibility
    const elementCompatibility = getElementalCompatibility(card1.element, card2.element);
    compatibility += elementCompatibility.score;
    reason = elementCompatibility.reason;
    
    // Category compatibility
    if (card1.category === card2.category) {
      compatibility += 10;
      reason += '. Same category synergy';
    }
    
    // Complementary effects
    if (card1.primaryEffect?.type !== card2.primaryEffect?.type) {
      compatibility += 10;
      reason += '. Complementary effects';
    }
    
    // Season/Moon harmony
    if (card1.seasonAffinity === card2.seasonAffinity) {
      compatibility += 5;
      reason += '. Seasonal harmony';
    }
    
    if (card1.moonPhaseAffinity === card2.moonPhaseAffinity) {
      compatibility += 5;
      reason += '. Lunar harmony';
    }
  }
  
  // Ensure compatibility is within valid range (0-100)
  compatibility = Math.max(0, Math.min(100, compatibility));
  
  return { score: compatibility, reason };
}

/**
 * Get the compatibility between two elements
 * @param element1 First element
 * @param element2 Second element
 * @returns Compatibility score (-20 to +20) and reason
 */
export function getElementalCompatibility(
  element1: ElementType,
  element2: ElementType
): { score: number; reason: string } {
  if (element1 === element2) {
    return { score: 15, reason: 'Same element resonance' };
  }
  
  // Define elemental relationships
  const elementalRelations: Record<ElementType, Record<ElementType, { score: number; relation: string }>> = {
    'Earth': {
      'Earth': { score: 15, relation: 'Same element resonance' },
      'Water': { score: 20, relation: 'Nurturing relationship' },
      'Fire': { score: -15, relation: 'Conflicting energies' },
      'Air': { score: 5, relation: 'Neutral interaction' },
      'Spirit': { score: 10, relation: 'Grounding connection' }
    },
    'Water': {
      'Earth': { score: 20, relation: 'Nurturing relationship' },
      'Water': { score: 15, relation: 'Same element resonance' },
      'Fire': { score: -20, relation: 'Opposing forces' },
      'Air': { score: 5, relation: 'Neutral interaction' },
      'Spirit': { score: 15, relation: 'Flowing harmony' }
    },
    'Fire': {
      'Earth': { score: -15, relation: 'Conflicting energies' },
      'Water': { score: -20, relation: 'Opposing forces' },
      'Fire': { score: 15, relation: 'Same element resonance' },
      'Air': { score: 20, relation: 'Amplifying combination' },
      'Spirit': { score: 15, relation: 'Energizing synergy' }
    },
    'Air': {
      'Earth': { score: 5, relation: 'Neutral interaction' },
      'Water': { score: 5, relation: 'Neutral interaction' },
      'Fire': { score: 20, relation: 'Amplifying combination' },
      'Air': { score: 15, relation: 'Same element resonance' },
      'Spirit': { score: 15, relation: 'Elevating connection' }
    },
    'Spirit': {
      'Earth': { score: 10, relation: 'Grounding connection' },
      'Water': { score: 15, relation: 'Flowing harmony' },
      'Fire': { score: 15, relation: 'Energizing synergy' },
      'Air': { score: 15, relation: 'Elevating connection' },
      'Spirit': { score: 15, relation: 'Same element resonance' }
    }
  };
  
  const relation = elementalRelations[element1][element2];
  return { 
    score: relation.score, 
    reason: relation.relation 
  };
}

/**
 * Calculate the effect potency based on card properties and conditions
 * @param card The tarot card
 * @param effect The effect to calculate potency for
 * @param effectiveness Current card effectiveness (from calculateCardEffectiveness)
 * @returns Potency value for the effect
 */
export function calculateEffectPotency(
  card: TarotCard,
  effect: CardEffect,
  effectiveness: number
): number {
  if (!card || !effect) return 0;
  
  // Base potency from effect value
  let potency = effect.value;
  
  // Adjust based on card effectiveness (±50%)
  const effectivenessMultiplier = 0.5 + (effectiveness / 100);
  potency *= effectivenessMultiplier;
  
  // Adjust based on card rank
  potency *= (0.8 + (card.rank * 0.05)); // Rank 1: 0.85x, Rank 10: 1.3x
  
  // Adjust based on card essence
  potency *= (0.9 + (card.essence * 0.02)); // Essence 1: 0.92x, Essence 10: 1.1x
  
  // Different effect types have different baseline potencies
  const effectTypeMultipliers: Record<string, number> = {
    'growth': 1.2,
    'potency': 1.0,
    'stability': 0.9,
    'essence': 1.1,
    'value': 1.0,
    'harmony': 1.3,
    'quality': 1.1,
    'yield': 1.0
  };
  
  potency *= effectTypeMultipliers[effect.type] || 1.0;
  
  return Math.round(potency * 10) / 10; // Round to 1 decimal place
}

/**
 * Find potential combos for a card
 * @param card The card to find combos for
 * @param availableCards Array of available cards to combo with
 * @returns Array of potential combos sorted by compatibility
 */
export function findPotentialCombos(
  card: TarotCard,
  availableCards: TarotCard[]
): { card: TarotCard; compatibility: { score: number; reason: string } }[] {
  if (!card || !availableCards?.length) return [];
  
  // Calculate compatibility with each available card
  const combos = availableCards
    .filter(otherCard => otherCard.id !== card.id) // Exclude the same card
    .map(otherCard => ({
      card: otherCard,
      compatibility: calculateCardCompatibility(card, otherCard)
    }))
    .sort((a, b) => b.compatibility.score - a.compatibility.score); // Sort by compatibility score
  
  return combos;
}

/**
 * Get recommended cards based on current conditions
 * @param availableCards Array of available cards
 * @param currentMoonPhase Current moon phase
 * @param currentSeason Current season
 * @param preferredElement Optional preferred element to prioritize
 * @returns Array of recommended cards with scores
 */
export function getRecommendedCards(
  availableCards: TarotCard[],
  currentMoonPhase: MoonPhase,
  currentSeason: Season,
  preferredElement?: ElementType
): { card: TarotCard; score: number; reason: string }[] {
  if (!availableCards?.length) return [];
  
  // Calculate effectiveness for each card
  const recommendations = availableCards.map(card => {
    const effectiveness = calculateCardEffectiveness(card, currentMoonPhase, currentSeason);
    let score = effectiveness;
    let reason = '';
    
    // Adjust score based on reasons
    if (card.moonPhaseAffinity === currentMoonPhase) {
      score += 10;
      reason += 'Moon phase alignment. ';
    }
    
    if (card.seasonAffinity === currentSeason) {
      score += 10;
      reason += 'Seasonal alignment. ';
    }
    
    if (preferredElement && card.element === preferredElement) {
      score += 15;
      reason += 'Elemental preference. ';
    }
    
    // Adjust score based on card rarity
    const rarityBonus: Record<string, number> = {
      'common': 0,
      'uncommon': 5,
      'rare': 10,
      'legendary': 15
    };
    
    score += rarityBonus[card.rarity] || 0;
    
    if (reason === '') {
      reason = 'General recommendation';
    }
    
    return { card, score, reason };
  });
  
  // Sort by score in descending order
  return recommendations.sort((a, b) => b.score - a.score);
}

/**
 * Calculate expected yield from a card
 * @param card The card to calculate yield for
 * @param effectiveness Current card effectiveness
 * @returns Expected yield amount
 */
export function calculateExpectedYield(card: TarotCard, effectiveness: number): number {
  if (!card || !card.yield) return 0;
  
  // Base yield from card
  let expectedYield = card.yield;
  
  // Adjust based on effectiveness (±30%)
  const effectivenessMultiplier = 0.7 + (effectiveness / 100) * 0.6;
  expectedYield *= effectivenessMultiplier;
  
  // Adjust based on rarity (rarer cards have more variable yields)
  const rarityVariability: Record<string, { min: number; max: number }> = {
    'common': { min: 0.9, max: 1.1 },
    'uncommon': { min: 0.8, max: 1.3 },
    'rare': { min: 0.7, max: 1.5 },
    'legendary': { min: 0.6, max: 2.0 }
  };
  
  const variability = rarityVariability[card.rarity] || { min: 0.9, max: 1.1 };
  const randomFactor = variability.min + Math.random() * (variability.max - variability.min);
  
  expectedYield *= randomFactor;
  
  return Math.max(1, Math.round(expectedYield)); // At least 1, rounded to integer
}

/**
 * Get visually-enhanced card description with icons
 * @param card The tarot card
 * @returns Formatted card description with icons
 */
export function getFormattedCardDescription(card: TarotCard): string {
  if (!card) return '';
  
  // Add element icon
  const elementIcons: Record<ElementType, string> = {
    'Earth': '🌱',
    'Water': '💧',
    'Fire': '🔥',
    'Air': '💨',
    'Spirit': '✨'
  };
  
  // Add category icon
  const categoryIcons: Record<string, string> = {
    'herb': '🌿',
    'flower': '🌸',
    'root': '🥕',
    'tree': '🌳',
    'mushroom': '🍄',
    'oil': '💦',
    'potion': '🧪',
    'mask': '🎭',
    'tonic': '🥤',
    'elixir': '🧬',
    'charm': '🔮',
    'talisman': '📿',
    'ritual_item': '📜',
    'seed': '🌱'
  };
  
  // Add moon phase icon
  const moonIcons: Record<MoonPhase, string> = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘'
  };
  
  // Add season icon
  const seasonIcons: Record<Season, string> = {
    'Spring': '🌱',
    'Summer': '☀️',
    'Fall': '🍂',
    'Winter': '❄️'
  };
  
  // Format description
  let formattedDesc = `${elementIcons[card.element] || ''} ${card.name} ${categoryIcons[card.category] || ''}\n`;
  formattedDesc += `${card.description}\n\n`;
  formattedDesc += `Element: ${elementIcons[card.element] || ''} ${card.element}\n`;
  formattedDesc += `Moon Affinity: ${moonIcons[card.moonPhaseAffinity] || ''} ${card.moonPhaseAffinity}\n`;
  formattedDesc += `Season Affinity: ${seasonIcons[card.seasonAffinity] || ''} ${card.seasonAffinity}\n`;
  
  // Add effects
  if (card.primaryEffect) {
    formattedDesc += `\nPrimary Effect: ${card.primaryEffect.description}\n`;
  }
  
  if (card.secondaryEffect) {
    formattedDesc += `Secondary Effect: ${card.secondaryEffect.description}\n`;
  }
  
  // Add growing info if applicable
  if (card.growthTime && card.growthTime > 0) {
    formattedDesc += `\nGrowth Time: ${card.growthTime} phases\n`;
    if (card.yield && card.yield > 0) {
      formattedDesc += `Expected Yield: ${card.yield} units\n`;
    }
    if (card.soilPreference) {
      formattedDesc += `Preferred Soil: ${card.soilPreference}\n`;
    }
  }
  
  // Add mana generation if applicable
  if (card.manaGeneration && card.manaGeneration > 0) {
    formattedDesc += `\nMana Generation: ${card.manaGeneration} per turn when mature\n`;
  }
  
  return formattedDesc;
}

/**
 * Get known combos for a card with formatted descriptions
 * @param cardId ID of the card to find combos for
 * @returns Array of formatted combo descriptions
 */
export function getFormattedCombos(cardId: string): string[] {
  const combos = getComboCards(cardId);
  if (!combos.length) return ['No known card combinations.'];
  
  return combos.map(({ card, comboEffect }) => {
    // Get icons for visual enhancement
    const elementIcons: Record<ElementType, string> = {
      'Earth': '🌱',
      'Water': '💧',
      'Fire': '🔥',
      'Air': '💨',
      'Spirit': '✨'
    };
    
    const categoryIcons: Record<string, string> = {
      'herb': '🌿',
      'flower': '🌸',
      'root': '🥕',
      'tree': '🌳',
      'mushroom': '🍄',
      'oil': '💦',
      'potion': '🧪'
    };
    
    const effectIcons: Record<string, string> = {
      'potency': '⚡',
      'stability': '🛡️',
      'quality': '✨',
      'value': '💰',
      'growth': '📈',
      'harmony': '☯️',
      'essence': '🔮',
      'yield': '🌾'
    };
    
    // Format the combo description
    const bonusIcon = effectIcons[comboEffect.bonusType] || '✨';
    return `${elementIcons[card.element] || ''} ${card.name} ${categoryIcons[card.category] || ''}: ${comboEffect.effectDescription} ${bonusIcon} +${comboEffect.bonusValue} ${comboEffect.bonusType}`;
  });
}

/**
 * Sort cards by a specific criterion
 * @param cards Array of tarot cards to sort
 * @param criterion Sorting criterion (element, season, moonPhase, rarity, rank)
 * @returns Sorted array of cards
 */
export function sortCardsByProperty(
  cards: TarotCard[],
  criterion: 'element' | 'season' | 'moonPhase' | 'rarity' | 'rank' | 'category'
): TarotCard[] {
  if (!cards?.length) return [];
  
  // Create a copy to avoid modifying the original
  const sortedCards = [...cards];
  
  switch (criterion) {
    case 'element':
      // Sort by element with a specific order
      const elementOrder = ['Earth', 'Water', 'Fire', 'Air', 'Spirit'];
      return sortedCards.sort((a, b) => {
        return elementOrder.indexOf(a.element) - elementOrder.indexOf(b.element);
      });
    
    case 'season':
      // Sort by season with a specific order
      const seasonOrder = ['Spring', 'Summer', 'Fall', 'Winter'];
      return sortedCards.sort((a, b) => {
        return seasonOrder.indexOf(a.seasonAffinity) - seasonOrder.indexOf(b.seasonAffinity);
      });
    
    case 'moonPhase':
      // Sort by moon phase with a specific order
      const moonOrder = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                         'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
      return sortedCards.sort((a, b) => {
        return moonOrder.indexOf(a.moonPhaseAffinity) - moonOrder.indexOf(b.moonPhaseAffinity);
      });
    
    case 'rarity':
      // Sort by rarity from highest to lowest
      const rarityOrder = ['legendary', 'rare', 'uncommon', 'common'];
      return sortedCards.sort((a, b) => {
        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
      });
    
    case 'rank':
      // Sort by rank from highest to lowest
      return sortedCards.sort((a, b) => b.rank - a.rank);
      
    case 'category':
      // Sort by category
      const categoryOrder = ['tree', 'herb', 'flower', 'root', 'mushroom', 'oil', 'potion', 'tonic', 'mask', 'elixir'];
      return sortedCards.sort((a, b) => {
        return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      });
    
    default:
      return sortedCards;
  }
}