import { 
  TarotCard, 
  ElementType, 
  MoonPhase, 
  Season, 
  CardEffect,
  ComboRef,
  Rarity,
  ItemCategory,
  ItemType,
  CardFrame
} from 'coven-shared';

/**
 * Create a basic tarot card with default values
 * @param id Card ID
 * @param name Card name
 * @param overrides Optional property overrides
 */
export function createMockTarotCard(
  id: string,
  name: string,
  overrides: Partial<TarotCard> = {}
): TarotCard {
  return {
    id: id,
    name: name,
    category: overrides.category || 'herb',
    type: overrides.type || 'ingredient',
    artworkPath: overrides.artworkPath || `/assets/cards/${id}.png`,
    frameType: overrides.frameType || 'herb',
    element: overrides.element || 'Earth',
    moonPhaseAffinity: overrides.moonPhaseAffinity || 'Full Moon',
    seasonAffinity: overrides.seasonAffinity || 'Spring',
    rank: overrides.rank !== undefined ? overrides.rank : 3,
    essence: overrides.essence !== undefined ? overrides.essence : 5,
    rarity: overrides.rarity || 'common',
    primaryEffect: overrides.primaryEffect || {
      type: 'growth',
      value: 10,
      description: 'Increases growth rate by 10%'
    },
    secondaryEffect: overrides.secondaryEffect,
    combos: overrides.combos || [],
    growthTime: overrides.growthTime,
    yield: overrides.yield,
    soilPreference: overrides.soilPreference,
    manaGeneration: overrides.manaGeneration,
    potency: overrides.potency,
    stability: overrides.stability,
    baseValue: overrides.baseValue || 50,
    demandFluctuation: overrides.demandFluctuation || 3,
    description: overrides.description || `A ${name} with various magical properties`,
    traditionUse: overrides.traditionUse || `Traditional ${name} uses in Hanbang medicine`
  };
}

// Create sample cards for different categories
const mockHerbCards: TarotCard[] = [
  createMockTarotCard('herb_chamomile', 'Chamomile', {
    category: 'herb',
    element: 'Earth',
    moonPhaseAffinity: 'Waning Crescent',
    seasonAffinity: 'Spring'
  }),
  createMockTarotCard('herb_lavender', 'Lavender', {
    category: 'herb',
    element: 'Air',
    moonPhaseAffinity: 'Full Moon',
    seasonAffinity: 'Summer'
  }),
  createMockTarotCard('herb_sage', 'Sage', {
    category: 'herb',
    element: 'Spirit',
    moonPhaseAffinity: 'New Moon',
    seasonAffinity: 'Fall'
  })
];

const mockFlowerCards: TarotCard[] = [
  createMockTarotCard('flower_rose', 'Rose', {
    category: 'flower',
    element: 'Water',
    moonPhaseAffinity: 'Full Moon',
    seasonAffinity: 'Summer'
  }),
  createMockTarotCard('flower_sunflower', 'Sunflower', {
    category: 'flower',
    element: 'Fire',
    moonPhaseAffinity: 'Waxing Gibbous',
    seasonAffinity: 'Summer'
  })
];

const mockTreeCards: TarotCard[] = [
  createMockTarotCard('tree_oak', 'Oak', {
    category: 'tree',
    type: 'tree',
    element: 'Earth',
    moonPhaseAffinity: 'Waxing Crescent',
    seasonAffinity: 'Summer',
    manaGeneration: 5
  }),
  createMockTarotCard('tree_willow', 'Willow', {
    category: 'tree',
    type: 'tree',
    element: 'Water',
    moonPhaseAffinity: 'Full Moon',
    seasonAffinity: 'Spring',
    manaGeneration: 7
  })
];

const mockRootCards: TarotCard[] = [
  createMockTarotCard('root_ginseng', 'Ginseng', {
    category: 'root',
    element: 'Earth',
    moonPhaseAffinity: 'New Moon',
    seasonAffinity: 'Fall'
  })
];

const mockMushroomCards: TarotCard[] = [
  createMockTarotCard('mushroom_shiitake', 'Shiitake', {
    category: 'mushroom',
    element: 'Spirit',
    moonPhaseAffinity: 'Waning Gibbous',
    seasonAffinity: 'Fall'
  })
];

// Combine all mock cards
export const mockCards: TarotCard[] = [
  ...mockHerbCards,
  ...mockFlowerCards,
  ...mockTreeCards,
  ...mockRootCards,
  ...mockMushroomCards
];

// Define card combos
mockCards[0].combos = [
  {
    cardId: mockCards[1].id,
    effectDescription: 'Chamomile and Lavender create a calming synergy',
    bonusType: 'potency',
    bonusValue: 15
  }
];

mockCards[1].combos = [
  {
    cardId: mockCards[0].id,
    effectDescription: 'Lavender and Chamomile create a calming synergy',
    bonusType: 'potency',
    bonusValue: 15
  }
];

/**
 * Find a card by its ID
 * @param id The card ID to find
 * @returns The found card or null if not found
 */
export function findCardById(id: string): TarotCard | null {
  if (!id) return null;
  return mockCards.find(card => card.id === id) || null;
}

/**
 * Get cards filtered by category
 * @param category The category to filter by
 * @returns Array of cards with the specified category
 */
export function getCardsByCategory(category: ItemCategory | string): TarotCard[] {
  return mockCards.filter(card => card.category === category);
}

/**
 * Get cards filtered by element
 * @param element The element to filter by
 * @returns Array of cards with the specified element
 */
export function getCardsByElement(element: ElementType): TarotCard[] {
  return mockCards.filter(card => card.element === element);
}

/**
 * Get cards filtered by moon phase affinity
 * @param moonPhase The moon phase to filter by
 * @returns Array of cards with the specified moon phase affinity
 */
export function getCardsByMoonPhase(moonPhase: MoonPhase): TarotCard[] {
  return mockCards.filter(card => card.moonPhaseAffinity === moonPhase);
}

/**
 * Get cards filtered by season affinity
 * @param season The season to filter by
 * @returns Array of cards with the specified season affinity
 */
export function getCardsBySeason(season: Season): TarotCard[] {
  return mockCards.filter(card => card.seasonAffinity === season);
}

/**
 * Get all cards that combo with the specified card
 * @param cardId The card ID to find combos for
 * @returns Array of cards and their combo effects
 */
export function getComboCards(cardId: string): {card: TarotCard, comboEffect: any}[] {
  const card = findCardById(cardId);
  if (!card) return [];
  
  return card.combos.map(combo => {
    const comboCard = findCardById(combo.cardId);
    return {
      card: comboCard as TarotCard,
      comboEffect: {
        effectDescription: combo.effectDescription,
        bonusType: combo.bonusType,
        bonusValue: combo.bonusValue
      }
    };
  }).filter(item => item.card !== null);
}