// shared/src/tarotCards.ts
import { TarotCard, CardEffect, ElementType, MoonPhase, Season, SoilType, CardFrame, Rarity, ItemType, ItemCategory } from './types';

// Helper function to create card effects
const createEffect = (type: CardEffect['type'], value: number, description: string): CardEffect => ({
  type,
  value,
  description
});

// === TREE CARDS ===
// Trees are primarily for mana generation
export const treeTarotCards: TarotCard[] = [
  {
    id: 'tree_oak',
    name: 'Oak Tree',
    category: 'tree',
    type: 'tree',
    
    artworkPath: '/assets/cards/trees/oak_tree.png',
    frameType: 'tree',
    
    element: 'Earth',
    moonPhaseAffinity: 'Full Moon',
    seasonAffinity: 'Fall',
    
    rank: 6,
    essence: 8,
    rarity: 'common',
    
    primaryEffect: createEffect('essence', 3, 'Generates 3 mana per turn when mature'),
    combos: [
      { 
        cardId: 'herb_ginseng', 
        effectDescription: 'Oak\'s strength enhances ginseng\'s vitality', 
        bonusType: 'potency', 
        bonusValue: 2 
      }
    ],
    
    growthTime: 12,
    yield: 0,  // Trees don't get harvested
    soilPreference: 'loamy',
    manaGeneration: 3,
    
    baseValue: 50,
    demandFluctuation: 2,
    
    description: 'A mighty oak that draws essence from deep within the earth. Its presence strengthens the garden.',
    traditionUse: 'In Hanbang, oak bark is used in tonics for stability and endurance.'
  },
  {
    id: 'tree_willow',
    name: 'Willow Tree',
    category: 'tree',
    type: 'tree',
    
    artworkPath: '/assets/cards/trees/willow_tree.png',
    frameType: 'tree',
    
    element: 'Water',
    moonPhaseAffinity: 'Waning Gibbous',
    seasonAffinity: 'Spring',
    
    rank: 5,
    essence: 7,
    rarity: 'common',
    
    primaryEffect: createEffect('essence', 2, 'Generates 2 mana per turn when mature'),
    secondaryEffect: createEffect('stability', 2, 'Increases stability of nearby water-element plants'),
    combos: [
      { 
        cardId: 'herb_chamomile', 
        effectDescription: 'Willow\'s calming nature enhances chamomile\'s soothing properties', 
        bonusType: 'quality', 
        bonusValue: 3 
      }
    ],
    
    growthTime: 10,
    yield: 0,
    soilPreference: 'peaty',
    manaGeneration: 2,
    
    baseValue: 45,
    demandFluctuation: 3,
    
    description: 'A graceful willow that draws upon water essence. Its branches sway with lunar currents.',
    traditionUse: 'Willow bark is used in traditional Hanbang preparations for soothing tension.'
  },
  {
    id: 'tree_ash',
    name: 'Ash Tree',
    category: 'tree',
    type: 'tree',
    
    artworkPath: '/assets/cards/trees/ash_tree.png',
    frameType: 'tree',
    
    element: 'Air',
    moonPhaseAffinity: 'First Quarter',
    seasonAffinity: 'Summer',
    
    rank: 7,
    essence: 6,
    rarity: 'uncommon',
    
    primaryEffect: createEffect('essence', 4, 'Generates 4 mana per turn when mature'),
    combos: [
      { 
        cardId: 'flower_lavender', 
        effectDescription: 'Ash\'s height carries lavender\'s scent farther', 
        bonusType: 'potency', 
        bonusValue: 3 
      }
    ],
    
    growthTime: 14,
    yield: 0,
    soilPreference: 'sandy',
    manaGeneration: 4,
    
    baseValue: 65,
    demandFluctuation: 4,
    
    description: 'A tall ash tree that reaches toward the sky. It channels air essence with remarkable efficiency.',
    traditionUse: 'Ash wood is carved into implements for meditation practices in Hanbang.'
  },
  {
    id: 'tree_cherry',
    name: 'Cherry Blossom Tree',
    category: 'tree',
    type: 'tree',
    
    artworkPath: '/assets/cards/trees/cherry_tree.png',
    frameType: 'tree',
    
    element: 'Spirit',
    moonPhaseAffinity: 'Waxing Crescent',
    seasonAffinity: 'Spring',
    
    rank: 8,
    essence: 9,
    rarity: 'rare',
    
    primaryEffect: createEffect('essence', 5, 'Generates 5 mana per turn when mature'),
    secondaryEffect: createEffect('harmony', 3, 'Enhances elemental harmony throughout the garden'),
    combos: [
      { 
        cardId: 'flower_rose', 
        effectDescription: 'Cherry blossoms complement rose\'s beauty', 
        bonusType: 'value', 
        bonusValue: 5 
      }
    ],
    
    growthTime: 16,
    yield: 0,
    soilPreference: 'loamy',
    manaGeneration: 5,
    
    baseValue: 85,
    demandFluctuation: 7,
    
    description: 'A breathtaking cherry blossom tree that embodies beauty and transience. Its presence connects the garden to the spirit realm.',
    traditionUse: 'Cherry blossoms are used in Hanbang face masks for their rejuvenating properties.'
  }
];

// === HERB CARDS ===
// Herbs are common ingredients for brewing and skincare products
export const herbTarotCards: TarotCard[] = [
  {
    id: 'herb_ginseng',
    name: 'Ginseng',
    category: 'herb',
    type: 'ingredient',
    
    artworkPath: '/assets/cards/herbs/ginseng.png',
    frameType: 'herb',
    
    element: 'Earth',
    moonPhaseAffinity: 'Full Moon',
    seasonAffinity: 'Fall',
    
    rank: 5,
    essence: 4,
    rarity: 'uncommon',
    
    primaryEffect: createEffect('potency', 4, 'Adds significant potency to brews'),
    combos: [
      { 
        cardId: 'herb_licorice', 
        effectDescription: 'Ginseng and licorice create a balancing harmony', 
        bonusType: 'stability', 
        bonusValue: 4 
      }
    ],
    
    growthTime: 6,
    yield: 2,
    soilPreference: 'loamy',
    manaGeneration: 0, // Herbs don't generate mana
    
    potency: 8,
    stability: 6,
    
    baseValue: 35,
    demandFluctuation: 5,
    
    description: 'A prized root known for its remarkable restorative properties. Shaped like a tiny human figure.',
    traditionUse: 'The cornerstone of many Hanbang formulations, ginseng is used to restore vital energy and promote wellbeing.'
  },
  {
    id: 'herb_mugwort',
    name: 'Mugwort',
    category: 'herb',
    type: 'ingredient',
    
    artworkPath: '/assets/cards/herbs/mugwort.png',
    frameType: 'herb',
    
    element: 'Fire',
    moonPhaseAffinity: 'Waning Crescent',
    seasonAffinity: 'Summer',
    
    rank: 4,
    essence: 3,
    rarity: 'common',
    
    primaryEffect: createEffect('growth', 3, 'Accelerates growth of nearby herbs'),
    combos: [
      { 
        cardId: 'root_angelica', 
        effectDescription: 'Mugwort amplifies angelica\'s warming properties', 
        bonusType: 'potency', 
        bonusValue: 3 
      }
    ],
    
    growthTime: 4,
    yield: 3,
    soilPreference: 'sandy',
    manaGeneration: 0, // Herbs don't generate mana
    
    potency: 6,
    stability: 5,
    
    baseValue: 20,
    demandFluctuation: 3,
    
    description: 'A fragrant herb with silvery leaves. It carries a subtle warmth that opens meridians.',
    traditionUse: 'Mugwort is used in Hanbang to promote circulation and warming properties in skincare.'
  },
  {
    id: 'herb_licorice',
    name: 'Licorice Root',
    category: 'herb',
    type: 'ingredient',
    
    artworkPath: '/assets/cards/herbs/licorice.png',
    frameType: 'herb',
    
    element: 'Earth',
    moonPhaseAffinity: 'New Moon',
    seasonAffinity: 'Fall',
    
    rank: 3,
    essence: 2,
    rarity: 'common',
    
    primaryEffect: createEffect('stability', 5, 'Provides exceptional stability to any brew'),
    combos: [
      { 
        cardId: 'herb_ginseng', 
        effectDescription: 'Licorice harmonizes with ginseng\'s energy', 
        bonusType: 'quality', 
        bonusValue: 3 
      }
    ],
    
    growthTime: 5,
    yield: 4,
    soilPreference: 'clay',
    manaGeneration: 0, // Herbs don't generate mana
    
    potency: 5,
    stability: 9,
    
    baseValue: 18,
    demandFluctuation: 2,
    
    description: 'A sweet, earthy root that grounds and harmonizes other ingredients.',
    traditionUse: 'Used in Hanbang as a harmonizing agent that balances other herbs and soothes the skin.'
  },
  {
    id: 'herb_chamomile',
    name: 'Chamomile',
    category: 'herb',
    type: 'ingredient',
    
    artworkPath: '/assets/cards/herbs/chamomile.png',
    frameType: 'herb',
    
    element: 'Water',
    moonPhaseAffinity: 'Waning Gibbous',
    seasonAffinity: 'Spring',
    
    rank: 2,
    essence: 3,
    rarity: 'common',
    
    primaryEffect: createEffect('quality', 3, 'Improves quality of soothing products'),
    combos: [
      { 
        cardId: 'flower_lavender', 
        effectDescription: 'Chamomile and lavender create deep calming effects', 
        bonusType: 'potency', 
        bonusValue: 4 
      }
    ],
    
    growthTime: 3,
    yield: 5,
    soilPreference: 'sandy',
    manaGeneration: 0, // Herbs don't generate mana
    
    potency: 4,
    stability: 7,
    
    baseValue: 15,
    demandFluctuation: 2,
    
    description: 'Delicate daisy-like flowers with a gentle, apple-like scent. Calming to mind and skin.',
    traditionUse: 'Chamomile is used in Hanbang for its soothing properties, especially for sensitive skin.'
  }
];

// === FLOWER CARDS ===
// Flowers are used for beautifying effects and special qualities
export const flowerTarotCards: TarotCard[] = [
  {
    id: 'flower_rose',
    name: 'Pink Rose',
    category: 'flower',
    type: 'ingredient',
    
    artworkPath: '/assets/cards/flowers/rose.png',
    frameType: 'flower',
    
    element: 'Water',
    moonPhaseAffinity: 'Waxing Gibbous',
    seasonAffinity: 'Summer',
    
    rank: 5,
    essence: 4,
    rarity: 'uncommon',
    
    primaryEffect: createEffect('quality', 5, 'Significantly enhances product quality'),
    combos: [
      { 
        cardId: 'oil_jojoba', 
        effectDescription: 'Rose petals infuse beautifully with jojoba oil', 
        bonusType: 'value', 
        bonusValue: 6 
      }
    ],
    
    growthTime: 5,
    yield: 3,
    soilPreference: 'loamy',
    manaGeneration: 0, // Flowers don't generate mana
    
    potency: 6,
    stability: 4,
    
    baseValue: 30,
    demandFluctuation: 6,
    
    description: 'Softly-hued petals carrying the essence of beauty. Delicate yet potent.',
    traditionUse: 'Roses are prized in Hanbang formulations for their balancing and brightening effects on the skin.'
  },
  {
    id: 'flower_lavender',
    name: 'Lavender',
    category: 'flower',
    type: 'ingredient',
    
    artworkPath: '/assets/cards/flowers/lavender.png',
    frameType: 'flower',
    
    element: 'Air',
    moonPhaseAffinity: 'First Quarter',
    seasonAffinity: 'Summer',
    
    rank: 3,
    essence: 3,
    rarity: 'common',
    
    primaryEffect: createEffect('stability', 4, 'Adds calming stability to brews'),
    combos: [
      { 
        cardId: 'herb_chamomile', 
        effectDescription: 'Lavender and chamomile create deep calming effects', 
        bonusType: 'quality', 
        bonusValue: 4 
      }
    ],
    
    growthTime: 4,
    yield: 4,
    soilPreference: 'sandy',
    manaGeneration: 0, // Flowers don't generate mana
    
    potency: 5,
    stability: 6,
    
    baseValue: 22,
    demandFluctuation: 3,
    
    description: 'Fragrant purple blooms that calm the senses and still the mind.',
    traditionUse: 'Lavender is used in Hanbang preparations to balance skin and promote relaxation.'
  },
  {
    id: 'flower_lotus',
    name: 'White Lotus',
    category: 'flower',
    type: 'ingredient',
    
    artworkPath: '/assets/cards/flowers/lotus.png',
    frameType: 'flower',
    
    element: 'Spirit',
    moonPhaseAffinity: 'Full Moon',
    seasonAffinity: 'Summer',
    
    rank: 8,
    essence: 7,
    rarity: 'rare',
    
    primaryEffect: createEffect('potency', 7, 'Adds remarkable potency to spiritual brews'),
    secondaryEffect: createEffect('harmony', 5, 'Harmonizes the effects of other ingredients'),
    combos: [
      { 
        cardId: 'oil_lotus', 
        effectDescription: 'Pure lotus synergy creates transcendent effects', 
        bonusType: 'essence', 
        bonusValue: 8 
      }
    ],
    
    growthTime: 8,
    yield: 2,
    soilPreference: 'peaty',
    manaGeneration: 0, // Flowers don't generate mana
    
    potency: 9,
    stability: 7,
    
    baseValue: 75,
    demandFluctuation: 8,
    
    description: 'A pristine bloom that opens with the first light. Symbol of purity and spiritual awakening.',
    traditionUse: 'The lotus is revered in Hanbang for its purifying properties and ability to restore skin\'s natural balance.'
  }
];

// === ROOT CARDS ===
// Roots are stable base ingredients with grounding effects
export const rootTarotCards: TarotCard[] = [
  {
    id: 'root_ginger',
    name: 'Ginger Root',
    category: 'root',
    type: 'ingredient',
    
    artworkPath: '/assets/cards/roots/ginger.png',
    frameType: 'root',
    
    element: 'Fire',
    moonPhaseAffinity: 'Waxing Crescent',
    seasonAffinity: 'Winter',
    
    rank: 4,
    essence: 3,
    rarity: 'common',
    
    primaryEffect: createEffect('potency', 4, 'Adds warming potency to brews'),
    combos: [
      { 
        cardId: 'herb_licorice', 
        effectDescription: 'Ginger\'s heat balanced by licorice\'s sweetness', 
        bonusType: 'stability', 
        bonusValue: 3 
      }
    ],
    
    growthTime: 5,
    yield: 3,
    soilPreference: 'sandy',
    manaGeneration: 0, // Roots don't generate mana
    
    potency: 7,
    stability: 5,
    
    baseValue: 18,
    demandFluctuation: 3,
    
    description: 'A knobbly root with fiery essence. Brings warmth and circulation wherever applied.',
    traditionUse: 'Ginger is used in Hanbang formulations to stimulate circulation and bring warmth to skin treatments.'
  },
  {
    id: 'root_angelica',
    name: 'Angelica Root',
    category: 'root',
    type: 'ingredient',
    
    artworkPath: '/assets/cards/roots/angelica.png',
    frameType: 'root',
    
    element: 'Earth',
    moonPhaseAffinity: 'Last Quarter',
    seasonAffinity: 'Fall',
    
    rank: 5,
    essence: 4,
    rarity: 'uncommon',
    
    primaryEffect: createEffect('potency', 5, 'Adds significant potency to warming brews'),
    combos: [
      { 
        cardId: 'herb_mugwort', 
        effectDescription: 'Angelica amplifies mugwort\'s protective qualities', 
        bonusType: 'quality', 
        bonusValue: 4 
      }
    ],
    
    growthTime: 7,
    yield: 2,
    soilPreference: 'clay',
    manaGeneration: 0, // Roots don't generate mana
    
    potency: 8,
    stability: 6,
    
    baseValue: 28,
    demandFluctuation: 4,
    
    description: 'A robust root with a complex, warm aroma. Protects and fortifies.',
    traditionUse: 'Angelica root is valued in Hanbang for promoting vitality and nourishing the skin, especially in colder months.'
  },
  {
    id: 'root_peony',
    name: 'White Peony Root',
    category: 'root',
    type: 'ingredient',
    
    artworkPath: '/assets/cards/roots/peony.png',
    frameType: 'root',
    
    element: 'Water',
    moonPhaseAffinity: 'Waning Gibbous',
    seasonAffinity: 'Spring',
    
    rank: 6,
    essence: 5,
    rarity: 'uncommon',
    
    primaryEffect: createEffect('quality', 6, 'Enhances the brightening quality of products'),
    combos: [
      { 
        cardId: 'flower_lotus', 
        effectDescription: 'Peony root and lotus create transcendent brightening effects', 
        bonusType: 'value', 
        bonusValue: 7 
      }
    ],
    
    growthTime: 8,
    yield: 2,
    soilPreference: 'loamy',
    manaGeneration: 0, // Roots don't generate mana
    
    potency: 7,
    stability: 8,
    
    baseValue: 35,
    demandFluctuation: 5,
    
    description: 'A precious white root with cooling properties. Brings clarity and brightness.',
    traditionUse: 'White peony root is prized in Hanbang for its balancing and brightening properties.'
  }
];

// === OIL CARDS ===
// Oils are carriers and bases for many skincare products
export const oilTarotCards: TarotCard[] = [
  {
    id: 'oil_jojoba',
    name: 'Jojoba Oil',
    category: 'oil',
    type: 'ingredient',
    
    artworkPath: '/assets/cards/oils/jojoba.png',
    frameType: 'potion',
    
    element: 'Earth',
    moonPhaseAffinity: 'Waxing Crescent',
    seasonAffinity: 'Fall',
    
    rank: 4,
    essence: 3,
    rarity: 'common',
    
    primaryEffect: createEffect('stability', 5, 'Provides excellent stability to skincare formulations'),
    combos: [
      { 
        cardId: 'flower_rose', 
        effectDescription: 'Jojoba carries rose essence perfectly', 
        bonusType: 'quality', 
        bonusValue: 4 
      }
    ],
    
    growthTime: 0, // Cannot be planted
    yield: 0,
    soilPreference: 'loamy', // Not relevant as it can't be planted
    manaGeneration: 0, // Does not generate mana
    
    potency: 3,
    stability: 9,
    
    baseValue: 25,
    demandFluctuation: 3,
    
    description: 'A golden liquid that mirrors skin\'s natural oils. Balances and nourishes.',
    traditionUse: 'Jojoba oil is valued in Hanbang for its similarity to skin\'s natural sebum, making it perfect for balancing formulations.'
  },
  {
    id: 'oil_lotus',
    name: 'Lotus Seed Oil',
    category: 'oil',
    type: 'ingredient',
    
    artworkPath: '/assets/cards/oils/lotus.png',
    frameType: 'potion',
    
    element: 'Spirit',
    moonPhaseAffinity: 'Full Moon',
    seasonAffinity: 'Summer',
    
    rank: 7,
    essence: 6,
    rarity: 'rare',
    
    primaryEffect: createEffect('quality', 7, 'Adds exceptional quality to spiritual formulations'),
    secondaryEffect: createEffect('harmony', 4, 'Harmonizes other ingredients beautifully'),
    combos: [
      { 
        cardId: 'flower_lotus', 
        effectDescription: 'Lotus seed oil amplifies lotus flower\'s purity', 
        bonusType: 'potency', 
        bonusValue: 8 
      }
    ],
    
    growthTime: 0, // Cannot be planted
    yield: 0,
    soilPreference: 'peaty', // Not relevant as it can't be planted
    manaGeneration: 0, // Does not generate mana
    
    potency: 8,
    stability: 7,
    
    baseValue: 65,
    demandFluctuation: 6,
    
    description: 'A precious, clear oil pressed from sacred lotus seeds. Purifies and elevates.',
    traditionUse: 'Lotus seed oil is a cherished ingredient in traditional Hanbang beauty rituals for its purifying and rejuvenating properties.'
  }
];

// Collection of all tarot cards
export const allTarotCards: TarotCard[] = [
  ...treeTarotCards,
  ...herbTarotCards,
  ...flowerTarotCards,
  ...rootTarotCards,
  ...oilTarotCards
];

// Helper function to find a card by ID
export const findCardById = (id: string): TarotCard | undefined => {
  return allTarotCards.find(card => card.id === id);
};

// Helper function to filter cards by category
export const getCardsByCategory = (category: ItemCategory): TarotCard[] => {
  return allTarotCards.filter(card => card.category === category);
};

// Helper function to filter cards by element
export const getCardsByElement = (element: ElementType): TarotCard[] => {
  return allTarotCards.filter(card => card.element === element);
};

// Helper function to get cards that combo with a specific card
export const getComboCards = (cardId: string): {card: TarotCard, comboEffect: any}[] => {
  const card = findCardById(cardId);
  if (!card) return [];
  
  return card.combos.map(combo => {
    const comboCard = findCardById(combo.cardId);
    return comboCard ? { card: comboCard, comboEffect: combo } : null;
  }).filter(Boolean) as {card: TarotCard, comboEffect: any}[];
};

// Helper function to get cards based on moon phase affinity
export const getCardsByMoonPhase = (phase: MoonPhase): TarotCard[] => {
  return allTarotCards.filter(card => card.moonPhaseAffinity === phase);
};

// Helper function to get cards based on seasonal affinity
export const getCardsBySeason = (season: Season): TarotCard[] => {
  return allTarotCards.filter(card => card.seasonAffinity === season);
};