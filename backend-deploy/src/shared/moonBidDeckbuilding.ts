// shared/src/moonBidDeckbuilding.ts
import { 
  MoonPhase, 
  Season, 
  ElementType, 
  ItemCategory 
} from './types.js';
import { MoonCard, MoonCardSuit } from './moonBidGame.js';

/**
 * Card rarity levels for deckbuilding
 */
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * Card source - how the card can be acquired
 */
export type CardSource = 
  'core' | 'craft' | 'reward' | 'event' | 'achievement' | 
  'purchase' | 'seasonal' | 'lunar' | 'coven' | 'salvage';

/**
 * Special card effect type
 */
export type CardEffectType = 
  'reveal' | 'boost' | 'transform' | 'protect' | 'cancel' | 
  'duplicate' | 'recover' | 'enhance' | 'steal' | 'wild' | 'swap';

/**
 * Interface for deckbuilding rules
 */
export interface DeckbuildingRules {
  coreCardsRequired: number;
  customSlotsAllowed: number;
  maxRarityPoints: number;
  elementalRequirements: Record<ElementType, number>;
  maxSameSuit: number;
  maxSameValue: number;
  moonPhaseRequirement?: MoonPhase;
  seasonRequirement?: Season;
  specialCardsLimit: number;
}

/**
 * Interface for a player's custom moon bid deck
 */
export interface PlayerDeck {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  coreCards: string[]; // IDs of standard cards
  customCards: string[]; // IDs of crafted/collected special cards
  lunarAlignment: MoonPhase;
  elementalBalance: Record<ElementType, number>;
  suitDistribution: Record<MoonCardSuit, number>;
  rarityScore: number;
  specialAbility?: {
    name: string;
    description: string;
    triggerCondition: string;
    cooldown: number;
  };
  deckArt?: string;
  creationDate: number;
  lastModified: number;
  favoriteStatus: boolean;
  playCount: number;
  winCount: number;
}

/**
 * Interface for a craftable special card
 */
export interface CraftableCard extends MoonCard {
  craftingRequirements: Array<{
    itemId: string;
    itemName: string;
    itemCategory: ItemCategory;
    quantity: number;
  }>;
  rarityTier: CardRarity;
  essenceCost: number;
  manaCost: number;
  goldCost: number;
  cardEffect: {
    type: CardEffectType;
    description: string;
    magnitude: number;
  };
  craftingDifficulty: number;
  source: CardSource;
  availableDuring?: {
    moonPhases?: MoonPhase[];
    seasons?: Season[];
  };
  salvageValue: number;
}

/**
 * Combo bonus for specific card combinations
 */
export interface CardCombo {
  id: string;
  name: string;
  description: string;
  requiredCards: string[]; // Card IDs needed for the combo
  bonusEffect: {
    type: string;
    magnitude: number;
    description: string;
  };
  rarity: CardRarity;
  visualEffect?: string;
}

/**
 * Define rarity point values for balancing
 */
export const RARITY_POINTS: Record<CardRarity, number> = {
  'common': 1,
  'uncommon': 2,
  'rare': 4,
  'epic': 7,
  'legendary': 10
};

/**
 * Default deckbuilding rules
 */
export const DEFAULT_DECKBUILDING_RULES: DeckbuildingRules = {
  coreCardsRequired: 20,
  customSlotsAllowed: 10,
  maxRarityPoints: 40,
  elementalRequirements: {
    'Earth': 3,
    'Water': 3,
    'Fire': 3,
    'Air': 3,
    'Spirit': 2
  },
  maxSameSuit: 10,
  maxSameValue: 4,
  specialCardsLimit: 5
};

/**
 * Core cards available to all players
 */
export const CORE_CARDS = [
  // Stars suit (Air & Fire elements)
  ...Array.from({ length: 13 }, (_, i) => ({
    suit: 'stars' as MoonCardSuit,
    value: (i + 1) as any,
    name: `${i + 1 === 1 ? 'Ace' : i + 1 === 11 ? 'Seer' : i + 1 === 12 ? 'Alchemist' : i + 1 === 13 ? 'Archmage' : i + 1} of Stars`,
    description: `Star card representing celestial magic. Value: ${i + 1}`,
    elementalAffinity: (i % 2 === 0) ? 'Fire' : 'Air' as ElementType,
    moonAffinity: ['Waxing Gibbous', 'Full Moon', 'Waning Gibbous'][Math.floor(i / 5)] as MoonPhase,
    imagePath: `/assets/cards/moon_bid/stars_${i + 1}.png`,
    isSpecial: i + 1 > 10
  })),
  
  // Herbs suit (Earth & Air elements)
  ...Array.from({ length: 13 }, (_, i) => ({
    suit: 'herbs' as MoonCardSuit,
    value: (i + 1) as any,
    name: `${i + 1 === 1 ? 'Ace' : i + 1 === 11 ? 'Seer' : i + 1 === 12 ? 'Alchemist' : i + 1 === 13 ? 'Archmage' : i + 1} of Herbs`,
    description: `Herb card representing natural magic. Value: ${i + 1}`,
    elementalAffinity: (i % 2 === 0) ? 'Earth' : 'Air' as ElementType,
    moonAffinity: ['Waxing Crescent', 'First Quarter', 'Last Quarter'][Math.floor(i / 5)] as MoonPhase,
    imagePath: `/assets/cards/moon_bid/herbs_${i + 1}.png`,
    isSpecial: i + 1 > 10
  })),
  
  // Potions suit (Water & Fire elements)
  ...Array.from({ length: 13 }, (_, i) => ({
    suit: 'potions' as MoonCardSuit,
    value: (i + 1) as any,
    name: `${i + 1 === 1 ? 'Ace' : i + 1 === 11 ? 'Seer' : i + 1 === 12 ? 'Alchemist' : i + 1 === 13 ? 'Archmage' : i + 1} of Potions`,
    description: `Potion card representing liquid magic. Value: ${i + 1}`,
    elementalAffinity: (i % 2 === 0) ? 'Water' : 'Fire' as ElementType,
    moonAffinity: ['New Moon', 'Waning Crescent'][Math.floor(i / 7)] as MoonPhase,
    imagePath: `/assets/cards/moon_bid/potions_${i + 1}.png`,
    isSpecial: i + 1 > 10
  })),
  
  // Crystals suit (Earth & Spirit elements)
  ...Array.from({ length: 13 }, (_, i) => ({
    suit: 'crystals' as MoonCardSuit,
    value: (i + 1) as any,
    name: `${i + 1 === 1 ? 'Ace' : i + 1 === 11 ? 'Seer' : i + 1 === 12 ? 'Alchemist' : i + 1 === 13 ? 'Archmage' : i + 1} of Crystals`,
    description: `Crystal card representing earth and spirit magic. Value: ${i + 1}`,
    elementalAffinity: (i % 2 === 0) ? 'Earth' : 'Spirit' as ElementType,
    moonAffinity: ['First Quarter', 'Full Moon'][Math.floor(i / 7)] as MoonPhase,
    imagePath: `/assets/cards/moon_bid/crystals_${i + 1}.png`,
    isSpecial: i + 1 > 10
  }))
];

/**
 * Special craftable cards
 */
// Adding 'as const' might help TypeScript infer the correct types
export const CRAFTABLE_CARDS = [
  // Lunar-themed special cards
  {
    suit: 'stars',
    value: 10,
    name: 'Moonlight Manipulator',
    description: 'Allows you to change the lead suit once per game',
    elementalAffinity: 'Spirit',
    moonAffinity: 'Full Moon',
    imagePath: '/assets/cards/moon_bid/special_moonlight_manipulator.png',
    isSpecial: true,
    power: 'transform',
    craftingRequirements: [
      { itemId: 'herb_moonflower', itemName: 'Moonflower', itemCategory: 'herb', quantity: 2 },
      { itemId: 'essence_lunar', itemName: 'Lunar Essence', itemCategory: 'essence', quantity: 1 }
    ],
    rarityTier: 'rare',
    essenceCost: 3,
    manaCost: 20,
    goldCost: 100,
    cardEffect: {
      type: 'transform',
      description: 'Changes the lead suit to your chosen suit',
      magnitude: 1
    },
    craftingDifficulty: 7,
    source: 'craft',
    availableDuring: {
      moonPhases: ['Full Moon', 'Waxing Gibbous']
    },
    salvageValue: 40
  },
  
  {
    suit: 'potions',
    value: 7,
    name: 'Eclipse Elixir',
    description: 'Cancels the effect of the highest card played this trick',
    elementalAffinity: 'Water',
    moonAffinity: 'New Moon',
    imagePath: '/assets/cards/moon_bid/special_eclipse_elixir.png',
    isSpecial: true,
    power: 'nullify',
    craftingRequirements: [
      { itemId: 'potion_darkness', itemName: 'Potion of Darkness', itemCategory: 'potion', quantity: 1 },
      { itemId: 'herb_nightshade', itemName: 'Nightshade', itemCategory: 'herb', quantity: 2 }
    ],
    rarityTier: 'uncommon',
    essenceCost: 2,
    manaCost: 15,
    goldCost: 75,
    cardEffect: {
      type: 'cancel',
      description: 'Neutralizes the highest value card in the current trick',
      magnitude: 1
    },
    craftingDifficulty: 5,
    source: 'craft',
    availableDuring: {
      moonPhases: ['New Moon', 'Waning Crescent']
    },
    salvageValue: 25
  },
  
  {
    suit: 'herbs',
    value: 5,
    name: 'Garden Whisper',
    description: 'Reveals one card from each opponent\'s hand',
    elementalAffinity: 'Earth',
    moonAffinity: 'Waxing Crescent',
    imagePath: '/assets/cards/moon_bid/special_garden_whisper.png',
    isSpecial: true,
    power: 'reveal',
    craftingRequirements: [
      { itemId: 'herb_sage', itemName: 'Sage', itemCategory: 'herb', quantity: 3 },
      { itemId: 'flower_lavender', itemName: 'Lavender', itemCategory: 'flower', quantity: 1 }
    ],
    rarityTier: 'uncommon',
    essenceCost: 1,
    manaCost: 10,
    goldCost: 50,
    cardEffect: {
      type: 'reveal',
      description: 'See one random card from each opponent\'s hand',
      magnitude: 1
    },
    craftingDifficulty: 4,
    source: 'craft',
    salvageValue: 20
  },
  
  {
    suit: 'crystals',
    value: 13,
    name: 'Spirit Crystal',
    description: 'Doubles the value of the next card you play',
    elementalAffinity: 'Spirit',
    moonAffinity: 'Full Moon',
    imagePath: '/assets/cards/moon_bid/special_spirit_crystal.png',
    isSpecial: true,
    power: 'double',
    craftingRequirements: [
      { itemId: 'crystal_quartz', itemName: 'Clear Quartz', itemCategory: 'crystal', quantity: 1 },
      { itemId: 'essence_spirit', itemName: 'Spirit Essence', itemCategory: 'essence', quantity: 2 }
    ],
    rarityTier: 'epic',
    essenceCost: 5,
    manaCost: 30,
    goldCost: 150,
    cardEffect: {
      type: 'boost',
      description: 'Doubles the effective value of the next card you play',
      magnitude: 2
    },
    craftingDifficulty: 9,
    source: 'craft',
    salvageValue: 60
  },
  
  // Elemental themed cards
  {
    suit: 'stars',
    value: 8,
    name: 'Flame Divination',
    description: 'Allows you to see the top card before it\'s drawn',
    elementalAffinity: 'Fire',
    moonAffinity: 'Waxing Gibbous',
    imagePath: '/assets/cards/moon_bid/special_flame_divination.png',
    isSpecial: true,
    power: 'predict',
    craftingRequirements: [
      { itemId: 'essence_fire', itemName: 'Fire Essence', itemCategory: 'essence', quantity: 1 },
      { itemId: 'herb_calendula', itemName: 'Calendula', itemCategory: 'herb', quantity: 2 }
    ],
    rarityTier: 'uncommon',
    essenceCost: 2,
    manaCost: 15,
    goldCost: 60,
    cardEffect: {
      type: 'reveal',
      description: 'View the top card of the deck before drawing',
      magnitude: 1
    },
    craftingDifficulty: 5,
    source: 'craft',
    availableDuring: {
      seasons: ['Summer']
    },
    salvageValue: 25
  },
  
  {
    suit: 'herbs',
    value: 3,
    name: 'Gale Force',
    description: 'Swaps a card from your hand with a random card from another player',
    elementalAffinity: 'Air',
    moonAffinity: 'First Quarter',
    imagePath: '/assets/cards/moon_bid/special_gale_force.png',
    isSpecial: true,
    power: 'swap',
    craftingRequirements: [
      { itemId: 'essence_air', itemName: 'Air Essence', itemCategory: 'essence', quantity: 1 },
      { itemId: 'feather_owl', itemName: 'Owl Feather', itemCategory: 'misc', quantity: 1 }
    ],
    rarityTier: 'uncommon',
    essenceCost: 2,
    manaCost: 15,
    goldCost: 70,
    cardEffect: {
      type: 'swap',
      description: 'Exchange a card in your hand with a random card from an opponent',
      magnitude: 1
    },
    craftingDifficulty: 6,
    source: 'craft',
    availableDuring: {
      seasons: ['Fall']
    },
    salvageValue: 30
  },
  
  {
    suit: 'potions',
    value: 4,
    name: 'Mist Veil',
    description: 'Protects one of your cards from being affected by special powers',
    elementalAffinity: 'Water',
    moonAffinity: 'Waning Gibbous',
    imagePath: '/assets/cards/moon_bid/special_mist_veil.png',
    isSpecial: true,
    power: 'protect',
    craftingRequirements: [
      { itemId: 'essence_water', itemName: 'Water Essence', itemCategory: 'essence', quantity: 1 },
      { itemId: 'herb_mugwort', itemName: 'Mugwort', itemCategory: 'herb', quantity: 2 }
    ],
    rarityTier: 'uncommon',
    essenceCost: 2,
    manaCost: 10,
    goldCost: 55,
    cardEffect: {
      type: 'protect',
      description: 'Protects one card in your hand from opponent effects',
      magnitude: 1
    },
    craftingDifficulty: 4,
    source: 'craft',
    availableDuring: {
      seasons: ['Winter']
    },
    salvageValue: 20
  },
  
  {
    suit: 'crystals',
    value: 12,
    name: 'Earth\'s Embrace',
    description: 'If you lose this trick, you get to lead the next trick anyway',
    elementalAffinity: 'Earth',
    moonAffinity: 'Last Quarter',
    imagePath: '/assets/cards/moon_bid/special_earths_embrace.png',
    isSpecial: true,
    power: 'duplicate',
    craftingRequirements: [
      { itemId: 'essence_earth', itemName: 'Earth Essence', itemCategory: 'essence', quantity: 1 },
      { itemId: 'crystal_jade', itemName: 'Jade', itemCategory: 'crystal', quantity: 1 }
    ],
    rarityTier: 'rare',
    essenceCost: 3,
    manaCost: 20,
    goldCost: 90,
    cardEffect: {
      type: 'recover',
      description: 'Even if you lose the trick, you lead the next one',
      magnitude: 1
    },
    craftingDifficulty: 7,
    source: 'craft',
    availableDuring: {
      seasons: ['Spring']
    },
    salvageValue: 35
  },
  
  // Seasonal special cards
  {
    suit: 'herbs',
    value: 9,
    name: 'Spring Renewal',
    description: 'Recover a card that was previously played this round',
    elementalAffinity: 'Earth',
    moonAffinity: 'Waxing Crescent',
    imagePath: '/assets/cards/moon_bid/special_spring_renewal.png',
    isSpecial: true,
    power: 'recover',
    craftingRequirements: [
      { itemId: 'flower_daffodil', itemName: 'Daffodil', itemCategory: 'flower', quantity: 2 },
      { itemId: 'essence_renewal', itemName: 'Renewal Essence', itemCategory: 'essence', quantity: 1 }
    ],
    rarityTier: 'rare',
    essenceCost: 3,
    manaCost: 25,
    goldCost: 100,
    cardEffect: {
      type: 'recover',
      description: 'Return one previously played card to your hand',
      magnitude: 1
    },
    craftingDifficulty: 7,
    source: 'seasonal',
    availableDuring: {
      seasons: ['Spring']
    },
    salvageValue: 40
  },
  
  {
    suit: 'stars',
    value: 11,
    name: 'Summer Solstice',
    description: 'When played, all Fire element cards gain +2 value this trick',
    elementalAffinity: 'Fire',
    moonAffinity: 'Full Moon',
    imagePath: '/assets/cards/moon_bid/special_summer_solstice.png',
    isSpecial: true,
    power: 'enhance',
    craftingRequirements: [
      { itemId: 'flower_sunflower', itemName: 'Sunflower', itemCategory: 'flower', quantity: 2 },
      { itemId: 'essence_solar', itemName: 'Solar Essence', itemCategory: 'essence', quantity: 1 }
    ],
    rarityTier: 'rare',
    essenceCost: 4,
    manaCost: 30,
    goldCost: 120,
    cardEffect: {
      type: 'boost',
      description: 'All Fire element cards in this trick gain +2 value',
      magnitude: 2
    },
    craftingDifficulty: 8,
    source: 'seasonal',
    availableDuring: {
      seasons: ['Summer']
    },
    salvageValue: 50
  },
  
  {
    suit: 'potions',
    value: 2,
    name: 'Autumn Harvest',
    description: 'For each trick you win with this card, gain extra rewards',
    elementalAffinity: 'Air',
    moonAffinity: 'Last Quarter',
    imagePath: '/assets/cards/moon_bid/special_autumn_harvest.png',
    isSpecial: true,
    power: 'enhance',
    craftingRequirements: [
      { itemId: 'herb_sage', itemName: 'Sage', itemCategory: 'herb', quantity: 3 },
      { itemId: 'fruit_apple', itemName: 'Golden Apple', itemCategory: 'fruit', quantity: 1 }
    ],
    rarityTier: 'uncommon',
    essenceCost: 2,
    manaCost: 15,
    goldCost: 80,
    cardEffect: {
      type: 'enhance',
      description: 'Earn bonus rewards when winning tricks with this card',
      magnitude: 1.5
    },
    craftingDifficulty: 6,
    source: 'seasonal',
    availableDuring: {
      seasons: ['Fall']
    },
    salvageValue: 30
  },
  
  {
    suit: 'crystals',
    value: 6,
    name: 'Winter\'s Protection',
    description: 'Prevents you from losing points for failing your bid once',
    elementalAffinity: 'Water',
    moonAffinity: 'New Moon',
    imagePath: '/assets/cards/moon_bid/special_winters_protection.png',
    isSpecial: true,
    power: 'protect',
    craftingRequirements: [
      { itemId: 'crystal_snow', itemName: 'Snow Quartz', itemCategory: 'crystal', quantity: 1 },
      { itemId: 'herb_wintergreen', itemName: 'Wintergreen', itemCategory: 'herb', quantity: 2 }
    ],
    rarityTier: 'uncommon',
    essenceCost: 2,
    manaCost: 20,
    goldCost: 75,
    cardEffect: {
      type: 'protect',
      description: 'You won\'t lose points for failing your bid this round',
      magnitude: 1
    },
    craftingDifficulty: 5,
    source: 'seasonal',
    availableDuring: {
      seasons: ['Winter']
    },
    salvageValue: 25
  },
  
  // Legendary cards
  {
    suit: 'stars',
    value: 13,
    name: 'Cosmic Convergence',
    description: 'Play any suit regardless of lead, and count as trump',
    elementalAffinity: 'Spirit',
    moonAffinity: 'Full Moon',
    imagePath: '/assets/cards/moon_bid/special_cosmic_convergence.png',
    isSpecial: true,
    power: 'wild',
    craftingRequirements: [
      { itemId: 'essence_cosmic', itemName: 'Cosmic Essence', itemCategory: 'essence', quantity: 3 },
      { itemId: 'crystal_celestite', itemName: 'Celestite', itemCategory: 'crystal', quantity: 1 },
      { itemId: 'potion_starlight', itemName: 'Starlight Elixir', itemCategory: 'potion', quantity: 1 }
    ],
    rarityTier: 'legendary',
    essenceCost: 10,
    manaCost: 50,
    goldCost: 300,
    cardEffect: {
      type: 'wild',
      description: 'Acts as any suit and counts as trump',
      magnitude: 3
    },
    craftingDifficulty: 10,
    source: 'craft',
    availableDuring: {
      moonPhases: ['Full Moon']
    },
    salvageValue: 100
  },
  
  {
    suit: 'potions',
    value: 1,
    name: 'Void Elixir',
    description: 'Steals a trick that would have been won by another player',
    elementalAffinity: 'Spirit',
    moonAffinity: 'New Moon',
    imagePath: '/assets/cards/moon_bid/special_void_elixir.png',
    isSpecial: true,
    power: 'steal',
    craftingRequirements: [
      { itemId: 'essence_void', itemName: 'Void Essence', itemCategory: 'essence', quantity: 3 },
      { itemId: 'herb_nightshade', itemName: 'Deadly Nightshade', itemCategory: 'herb', quantity: 1 },
      { itemId: 'crystal_obsidian', itemName: 'Obsidian', itemCategory: 'crystal', quantity: 1 }
    ],
    rarityTier: 'legendary',
    essenceCost: 10,
    manaCost: 50,
    goldCost: 300,
    cardEffect: {
      type: 'steal',
      description: 'Takes a trick from whoever would have won it',
      magnitude: 1
    },
    craftingDifficulty: 10,
    source: 'craft',
    availableDuring: {
      moonPhases: ['New Moon']
    },
    salvageValue: 100
  }
];

/**
 * Special card combinations that create bonus effects
 */
export const CARD_COMBOS: CardCombo[] = [
  {
    id: 'combo_royal_flush',
    name: 'Royal Arcana',
    description: 'Having Ace, 10, Seer, Alchemist, Archmage of the same suit in your hand',
    requiredCards: [], // Dynamically checked based on values and suit
    bonusEffect: {
      type: 'tricksBonus',
      magnitude: 2,
      description: 'Win 2 additional tricks if you make your bid'
    },
    rarity: 'legendary',
    visualEffect: 'royal_glow'
  },
  
  {
    id: 'combo_elemental_trinity',
    name: 'Elemental Trinity',
    description: 'Having 3 cards of the same element but different suits',
    requiredCards: [], // Dynamically checked based on element
    bonusEffect: {
      type: 'elementalBoost',
      magnitude: 3,
      description: 'All your cards of this element gain +3 value'
    },
    rarity: 'rare',
    visualEffect: 'elemental_aura'
  },
  
  {
    id: 'combo_lunar_harmony',
    name: 'Lunar Harmony',
    description: 'Having 3 cards with the same moon phase affinity',
    requiredCards: [], // Dynamically checked based on moon affinity
    bonusEffect: {
      type: 'lunarFavor',
      magnitude: 5,
      description: 'Gain 5 lunar favor points'
    },
    rarity: 'rare',
    visualEffect: 'moon_shimmer'
  },
  
  {
    id: 'combo_full_house',
    name: 'Witch\'s Full House',
    description: 'Having 3 cards of one value and 2 of another',
    requiredCards: [], // Dynamically checked based on values
    bonusEffect: {
      type: 'bidProtection',
      magnitude: 1,
      description: 'If you miss your bid by exactly 1, you still succeed'
    },
    rarity: 'uncommon',
    visualEffect: 'house_shield'
  },
  
  {
    id: 'combo_straight',
    name: 'Arcane Sequence',
    description: 'Having 5 consecutive values in your hand',
    requiredCards: [], // Dynamically checked based on consecutive values
    bonusEffect: {
      type: 'cardDraw',
      magnitude: 1,
      description: 'Draw an extra card at the start of the game'
    },
    rarity: 'uncommon',
    visualEffect: 'sequence_flow'
  }
];

/**
 * Create initial default player deck
 * @param playerId Player ID
 * @param playerName Player name
 * @returns New default player deck
 */
export function createDefaultDeck(playerId: string, playerName: string): PlayerDeck {
  // Generate starter deck with balanced distribution
  const coreCardIds: string[] = [];
  
  // Add one of each face card (11-13) from each suit
  const suits: MoonCardSuit[] = ['stars', 'herbs', 'potions', 'crystals'];
  suits.forEach(suit => {
    [11, 12, 13].forEach(value => {
      coreCardIds.push(`card_${suit}_${value}`);
    });
  });
  
  // Add a balance of number cards
  suits.forEach(suit => {
    [2, 5, 7].forEach(value => {
      coreCardIds.push(`card_${suit}_${value}`);
    });
  });
  
  // Add aces
  suits.forEach(suit => {
    coreCardIds.push(`card_${suit}_1`);
  });
  
  // Calculate elemental balance based on card distribution
  const elementalBalance: Record<ElementType, number> = {
    'Earth': 0,
    'Water': 0,
    'Fire': 0,
    'Air': 0,
    'Spirit': 0
  };
  
  // Calculate suit distribution
  const suitDistribution: Record<MoonCardSuit, number> = {
    'stars': 0,
    'herbs': 0,
    'potions': 0,
    'crystals': 0
  };
  
  // Process each card to count elements and suits
  coreCardIds.forEach(cardId => {
    const [_, suit, value] = cardId.split('_');
    suitDistribution[suit as MoonCardSuit]++;
    
    // Determine element based on suit and value
    let element: ElementType;
    const numValue = parseInt(value);
    
    switch (suit) {
      case 'stars':
        element = numValue % 2 === 0 ? 'Fire' : 'Air';
        break;
      case 'herbs':
        element = numValue % 2 === 0 ? 'Earth' : 'Air';
        break;
      case 'potions':
        element = numValue % 2 === 0 ? 'Water' : 'Fire';
        break;
      case 'crystals':
        element = numValue % 2 === 0 ? 'Earth' : 'Spirit';
        break;
      default:
        element = 'Earth'; // Default fallback
    }
    
    elementalBalance[element]++;
  });
  
  return {
    id: `deck_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ownerId: playerId,
    name: `${playerName}'s Starter Deck`,
    description: 'A balanced deck for learning the Moon Bid game',
    coreCards: coreCardIds,
    customCards: [],
    lunarAlignment: 'Full Moon', // Default to Full Moon for beginners
    elementalBalance,
    suitDistribution,
    rarityScore: 20, // Starter value
    deckArt: '/assets/cards/deck_art/starter.png',
    creationDate: Date.now(),
    lastModified: Date.now(),
    favoriteStatus: true,
    playCount: 0,
    winCount: 0
  };
}

/**
 * Create a craftable card instance with a unique ID
 * @param cardBase Base card properties
 * @returns Complete craftable card with ID
 */
export function createCraftableCard(cardBase: Omit<CraftableCard, 'id'>): CraftableCard {
  const id = `card_special_${cardBase.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now() % 1000}`;
  return {
    ...cardBase,
    id
  };
}

/**
 * Get all available craftable cards
 * @param moonPhase Current moon phase (filters available cards)
 * @param season Current season (filters available cards)
 * @returns Array of available craftable cards
 */
export function getAvailableCraftableCards(moonPhase?: MoonPhase, season?: Season): CraftableCard[] {
  return CRAFTABLE_CARDS
    .filter(card => {
      // Check if card is available during current moon phase
      if (moonPhase && card.availableDuring?.moonPhases) {
        if (!card.availableDuring.moonPhases.includes(moonPhase)) {
          return false;
        }
      }
      
      // Check if card is available during current season
      if (season && card.availableDuring?.seasons) {
        if (!card.availableDuring.seasons.includes(season)) {
          return false;
        }
      }
      
      return true;
    })
    .map(card => createCraftableCard(card as Omit<CraftableCard, "id">));
}

/**
 * Get a standard deck of cards (not specials) for a player
 * @returns Array of standard Moon Bid cards
 */
export function getStandardCardDeck(): MoonCard[] {
  return CORE_CARDS.map((card) => ({
    ...card,
    id: `card_${card.suit}_${card.value}`
  }));
}

/**
 * Validate if a player's deck meets the deckbuilding rules
 * @param deck Player deck to validate
 * @param rules Deckbuilding rules to check against
 * @returns Object with validation result and errors if any
 */
export function validateDeck(
  deck: PlayerDeck, 
  rules: DeckbuildingRules = DEFAULT_DECKBUILDING_RULES
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check core cards count
  if (deck.coreCards.length < rules.coreCardsRequired) {
    errors.push(`Deck requires at least ${rules.coreCardsRequired} core cards (currently has ${deck.coreCards.length})`);
  }
  
  // Check custom cards count
  if (deck.customCards.length > rules.customSlotsAllowed) {
    errors.push(`Deck can only have up to ${rules.customSlotsAllowed} custom cards (currently has ${deck.customCards.length})`);
  }
  
  // Check special cards limit
  const specialCardCount = deck.customCards.filter(id => id.includes('special')).length;
  if (specialCardCount > rules.specialCardsLimit) {
    errors.push(`Deck can only have up to ${rules.specialCardsLimit} special cards (currently has ${specialCardCount})`);
  }
  
  // Check rarity score
  if (deck.rarityScore > rules.maxRarityPoints) {
    errors.push(`Deck rarity score cannot exceed ${rules.maxRarityPoints} (currently ${deck.rarityScore})`);
  }
  
  // Check elemental requirements
  for (const [element, requiredCount] of Object.entries(rules.elementalRequirements)) {
    const typedElement = element as ElementType;
    if (deck.elementalBalance[typedElement] < requiredCount) {
      errors.push(`Deck must contain at least ${requiredCount} ${element} element cards (currently has ${deck.elementalBalance[typedElement]})`);
    }
  }
  
  // Check suit distribution
  for (const suit of Object.keys(deck.suitDistribution) as MoonCardSuit[]) {
    if (deck.suitDistribution[suit] > rules.maxSameSuit) {
      errors.push(`Deck can only have up to ${rules.maxSameSuit} cards of the same suit (${suit} has ${deck.suitDistribution[suit]})`);
    }
  }
  
  // Check moon phase requirement if specified
  if (rules.moonPhaseRequirement && deck.lunarAlignment !== rules.moonPhaseRequirement) {
    errors.push(`Deck must be aligned with the ${rules.moonPhaseRequirement} (currently aligned with ${deck.lunarAlignment})`);
  }
  
  // Check season requirement if specified
  if (rules.seasonRequirement) {
    errors.push(`Deck must be season-compatible with ${rules.seasonRequirement}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate the total rarity score of a deck
 * @param coreCards Array of core card IDs
 * @param customCards Array of custom card IDs
 * @returns Total rarity score
 */
export function calculateRarityScore(coreCards: string[], customCards: string[]): number {
  let score = 0;
  
  // Core cards have base rarity scores
  coreCards.forEach(cardId => {
    const [_, _suit, valueStr] = cardId.split('_'); // Prefix with underscore to indicate unused variable
    const value = parseInt(valueStr);
    
    // Face cards are worth more points
    if (value >= 11) {
      score += 2; // Face cards = uncommon
    } else if (value === 1) {
      score += 2; // Aces = uncommon
    } else {
      score += 1; // Number cards = common
    }
  });
  
  // Custom cards have their own rarity values
  customCards.forEach(cardId => {
    // Find the card's rarity
    const craftableCard = CRAFTABLE_CARDS.find(card => 
      `card_special_${card.name.toLowerCase().replace(/\s+/g, '_')}` === cardId.split('_').slice(0, 3).join('_')
    );
    
    if (craftableCard) {
      score += RARITY_POINTS[craftableCard.rarityTier as CardRarity];
    } else {
      // Default if card not found
      score += 2;
    }
  });
  
  return score;
}

/**
 * Check if a player can craft a specific card
 * @param craftableCard Card to craft
 * @param playerInventory Player's inventory items
 * @param playerEssence Player's essence amount
 * @param playerMana Player's mana amount
 * @param playerGold Player's gold amount
 * @returns Object with craft availability and missing resources
 */
export function canCraftCard(
  craftableCard: CraftableCard,
  playerInventory: Array<{ id: string; quantity: number }>,
  playerEssence: number,
  playerMana: number,
  playerGold: number
): { 
  canCraft: boolean; 
  missingResources: { type: string; name: string; amount: number }[];
} {
  const missingResources: { type: string; name: string; amount: number }[] = [];
  
  // Check ingredients
  craftableCard.craftingRequirements.forEach(req => {
    const inventoryItem = playerInventory.find(item => item.id === req.itemId);
    const availableQuantity = inventoryItem?.quantity || 0;
    
    if (availableQuantity < req.quantity) {
      missingResources.push({
        type: 'ingredient',
        name: req.itemName,
        amount: req.quantity - availableQuantity
      });
    }
  });
  
  // Check essence
  if (playerEssence < craftableCard.essenceCost) {
    missingResources.push({
      type: 'essence',
      name: 'Essence',
      amount: craftableCard.essenceCost - playerEssence
    });
  }
  
  // Check mana
  if (playerMana < craftableCard.manaCost) {
    missingResources.push({
      type: 'mana',
      name: 'Mana',
      amount: craftableCard.manaCost - playerMana
    });
  }
  
  // Check gold
  if (playerGold < craftableCard.goldCost) {
    missingResources.push({
      type: 'gold',
      name: 'Gold',
      amount: craftableCard.goldCost - playerGold
    });
  }
  
  return {
    canCraft: missingResources.length === 0,
    missingResources
  };
}

/**
 * Craft a special card and add it to player's collection
 * @param craftableCard Card to craft
 * @param playerDeck Player's deck to add card to
 * @param consumeResources Function to consume the required resources
 * @returns Updated player deck
 */
export function craftCardForDeck(
  craftableCard: CraftableCard,
  playerDeck: PlayerDeck,
  consumeResources: () => boolean
): PlayerDeck {
  // Attempt to consume resources
  const resourcesConsumed = consumeResources();
  if (!resourcesConsumed) {
    throw new Error('Failed to consume resources for crafting');
  }
  
  // Generate the card ID
  const cardId = `card_special_${craftableCard.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now() % 1000}`;
  
  // Update custom cards array
  const updatedCustomCards = [...playerDeck.customCards, cardId];
  
  // Update elemental balance
  const updatedElementalBalance = { ...playerDeck.elementalBalance };
  if (craftableCard.elementalAffinity) {
    updatedElementalBalance[craftableCard.elementalAffinity]++;
  }
  
  // Update suit distribution
  const updatedSuitDistribution = { ...playerDeck.suitDistribution };
  updatedSuitDistribution[craftableCard.suit]++;
  
  // Calculate new rarity score
  const rarityScore = calculateRarityScore(playerDeck.coreCards, updatedCustomCards);
  
  // Return updated deck
  return {
    ...playerDeck,
    customCards: updatedCustomCards,
    elementalBalance: updatedElementalBalance,
    suitDistribution: updatedSuitDistribution,
    rarityScore,
    lastModified: Date.now()
  };
}

/**
 * Check for card combinations in a player's hand
 * @param cards Cards in hand
 * @returns Array of active card combos
 */
export function checkForCardCombos(cards: MoonCard[]): CardCombo[] {
  const activeCardCombos: CardCombo[] = [];
  
  // Check for Royal Arcana (Royal Flush)
  const suitCounts = cards.reduce((counts, card) => {
    counts[card.suit] = (counts[card.suit] || 0) + 1;
    return counts;
  }, {} as Record<MoonCardSuit, number>);
  
  for (const suit of Object.keys(suitCounts) as MoonCardSuit[]) {
    if (suitCounts[suit] >= 5) {
      const royalValues = [1, 10, 11, 12, 13];
      const hasRoyal = royalValues.every(value => 
        cards.some(card => card.suit === suit && card.value === value)
      );
      
      if (hasRoyal) {
        activeCardCombos.push(CARD_COMBOS.find(combo => combo.id === 'combo_royal_flush')!);
      }
    }
  }
  
  // Check for Elemental Trinity
  const elementCounts: Record<ElementType, Set<MoonCardSuit>> = {
    'Earth': new Set(),
    'Water': new Set(),
    'Fire': new Set(),
    'Air': new Set(),
    'Spirit': new Set()
  };
  
  cards.forEach(card => {
    if (card.elementalAffinity) {
      elementCounts[card.elementalAffinity].add(card.suit);
    }
  });
  
  for (const [_element, suits] of Object.entries(elementCounts)) { // Prefix with underscore to indicate unused variable
    if (suits.size >= 3) {
      activeCardCombos.push(CARD_COMBOS.find(combo => combo.id === 'combo_elemental_trinity')!);
      break;
    }
  }
  
  // Check for Lunar Harmony
  const moonPhaseCounts: Record<string, number> = {};
  cards.forEach(card => {
    if (card.moonAffinity) {
      moonPhaseCounts[card.moonAffinity] = (moonPhaseCounts[card.moonAffinity] || 0) + 1;
    }
  });
  
  for (const [_phase, count] of Object.entries(moonPhaseCounts)) { // Prefix with underscore to indicate unused variable
    if (count >= 3) {
      activeCardCombos.push(CARD_COMBOS.find(combo => combo.id === 'combo_lunar_harmony')!);
      break;
    }
  }
  
  // Check for Witch's Full House
  const valueCounts: Record<number, number> = {};
  cards.forEach(card => {
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
  });
  
  const valueCountsArray = Object.values(valueCounts);
  if (valueCountsArray.includes(3) && valueCountsArray.includes(2)) {
    activeCardCombos.push(CARD_COMBOS.find(combo => combo.id === 'combo_full_house')!);
  }
  
  // Check for Arcane Sequence (Straight)
  const uniqueValues = [...new Set(cards.map(card => card.value))].sort((a, b) => a - b);
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    if (
      uniqueValues[i] + 1 === uniqueValues[i + 1] &&
      uniqueValues[i] + 2 === uniqueValues[i + 2] &&
      uniqueValues[i] + 3 === uniqueValues[i + 3] &&
      uniqueValues[i] + 4 === uniqueValues[i + 4]
    ) {
      activeCardCombos.push(CARD_COMBOS.find(combo => combo.id === 'combo_straight')!);
      break;
    }
  }
  
  return activeCardCombos;
}

/**
 * Salvage a failed potion or product into a special card
 * @param itemName Name of the failed item
 * @param itemCategory Category of the failed item 
 * @param currentMoonPhase Current moon phase
 * @param currentSeason Current season
 * @returns CraftableCard if salvage successful, null otherwise
 */
export function salvageIntoCard(
  _itemName: string, // Prefix with underscore to indicate unused parameter
  itemCategory: ItemCategory,
  currentMoonPhase: MoonPhase,
  currentSeason: Season
): CraftableCard | null {
  // Calculate salvage chance based on item category
  let salvageChance = 0.1; // Base 10% chance
  
  if (itemCategory === 'potion') salvageChance = 0.3;
  if (itemCategory === 'essence') salvageChance = 0.5;
  if (itemCategory === 'ritual_item') salvageChance = 0.4;
  
  // Moon phase bonus
  if (currentMoonPhase === 'Full Moon') salvageChance += 0.2;
  if (currentMoonPhase === 'New Moon') salvageChance += 0.15;
  
  // Random check for successful salvage
  if (Math.random() > salvageChance) {
    return null;
  }
  
  // Filter cards available during current moon/season
  const salvageOptions = CRAFTABLE_CARDS.filter(card => {
    // Check moon phase availability
    if (card.availableDuring?.moonPhases && 
        !card.availableDuring.moonPhases.includes(currentMoonPhase)) {
      return false;
    }
    
    // Check season availability
    if (card.availableDuring?.seasons && 
        !card.availableDuring.seasons.includes(currentSeason)) {
      return false;
    }
    
    // Only include uncommon or lower cards for salvage
    return ['common', 'uncommon'].includes(card.rarityTier);
  });
  
  if (salvageOptions.length === 0) {
    return null;
  }
  
  // Randomly select a card to salvage into
  const selectedCard = salvageOptions[Math.floor(Math.random() * salvageOptions.length)];
  
  // Mark as salvaged and adjust costs to zero (already "paid" via failed item)
  const salvageCard = {
    ...selectedCard,
    id: `card_salvage_${selectedCard.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now() % 1000}`,
    source: 'salvage' as CardSource,
    essenceCost: 0,
    manaCost: 0,
    goldCost: 0,
    craftingRequirements: [], // No further requirements
    rarityTier: selectedCard.rarityTier as CardRarity,
    cardEffect: {
      ...selectedCard.cardEffect,
      type: selectedCard.cardEffect.type as CardEffectType
    }
  } as CraftableCard;
  
  return salvageCard;
}

/**
 * Check for deck synergy with player's specialization
 * @param deck Player deck
 * @param specialization Player's atelier specialization
 * @returns Synergy score and comments
 */
export function checkDeckSpecializationSynergy(
  deck: PlayerDeck,
  specialization: string
): { score: number; comments: string[] } {
  const comments: string[] = [];
  let synergyScore = 0;
  
  // Element affinities based on specialization
  const specializationElements: Record<string, ElementType[]> = {
    'Essence': ['Spirit', 'Air'],
    'Fermentation': ['Earth', 'Water'],
    'Distillation': ['Water', 'Fire'],
    'Infusion': ['Water', 'Air'],
    'Crystallization': ['Earth', 'Spirit'],
    'Transmutation': ['Fire', 'Spirit']
  };
  
  // Check elemental alignment
  const favoredElements = specializationElements[specialization] || [];
  let elementalScore = 0;
  
  favoredElements.forEach(element => {
    const elementCount = deck.elementalBalance[element] || 0;
    if (elementCount >= 8) {
      elementalScore += 3;
      comments.push(`Strong ${element} alignment (${elementCount} cards) complements your ${specialization} specialty`);
    } else if (elementCount >= 5) {
      elementalScore += 2;
      comments.push(`Good ${element} presence (${elementCount} cards) works well with ${specialization}`);
    } else if (elementCount >= 3) {
      elementalScore += 1;
      comments.push(`Basic ${element} representation (${elementCount} cards) provides minimal synergy with ${specialization}`);
    }
  });
  
  synergyScore += elementalScore;
  
  // Check moon phase alignment based on specialization
  const specializationMoonPhases: Record<string, MoonPhase[]> = {
    'Essence': ['Full Moon', 'New Moon'],
    'Fermentation': ['Waxing Crescent', 'Waxing Gibbous'],
    'Distillation': ['Waning Gibbous', 'Waning Crescent'],
    'Infusion': ['First Quarter', 'Last Quarter'],
    'Crystallization': ['Full Moon', 'First Quarter'],
    'Transmutation': ['New Moon', 'Last Quarter']
  };
  
  const favoredPhases = specializationMoonPhases[specialization] || [];
  if (favoredPhases.includes(deck.lunarAlignment)) {
    synergyScore += 3;
    comments.push(`${deck.lunarAlignment} alignment strongly complements your ${specialization} practice`);
  } else {
    comments.push(`Consider aligning your deck with ${favoredPhases.join(' or ')} for better ${specialization} synergy`);
  }
  
  // Check for special cards that synergize with specialization
  const specializationKeywords: Record<string, string[]> = {
    'Essence': ['essence', 'spirit', 'pure', 'extract'],
    'Fermentation': ['ferment', 'brew', 'bubble', 'transform'],
    'Distillation': ['distill', 'purify', 'refine', 'clarity'],
    'Infusion': ['infuse', 'blend', 'harmony', 'balance'],
    'Crystallization': ['crystal', 'gem', 'structure', 'form'],
    'Transmutation': ['change', 'convert', 'alter', 'shift']
  };
  
  const relevantKeywords = specializationKeywords[specialization] || [];
  let specialCardSynergy = 0;
  
  // Count special cards that have synergy
  deck.customCards.forEach(cardId => {
    const cardName = cardId.split('_').slice(2).join('_').replace(/_/g, ' ');
    
    if (relevantKeywords.some(keyword => cardName.toLowerCase().includes(keyword))) {
      specialCardSynergy++;
    }
  });
  
  if (specialCardSynergy >= 3) {
    synergyScore += 4;
    comments.push(`Excellent selection of ${specialization}-aligned special cards`);
  } else if (specialCardSynergy >= 1) {
    synergyScore += 2;
    comments.push(`Some special cards complement your ${specialization} specialty`);
  } else {
    comments.push(`Consider adding special cards that align with ${specialization} techniques`);
  }
  
  return {
    score: synergyScore,
    comments
  };
}

/**
 * Generate a specialized deck based on player's specialization
 * @param playerId Player ID
 * @param playerName Player name
 * @param specialization Player's atelier specialization
 * @returns Specialized player deck
 */
export function createSpecializedDeck(
  playerId: string,
  playerName: string,
  specialization: string
): PlayerDeck {
  const standardDeck = createDefaultDeck(playerId, playerName);
  
  // Elemental focus based on specialization
  const specializationElements: Record<string, ElementType[]> = {
    'Essence': ['Spirit', 'Air'],
    'Fermentation': ['Earth', 'Water'],
    'Distillation': ['Water', 'Fire'],
    'Infusion': ['Water', 'Air'],
    'Crystallization': ['Earth', 'Spirit'],
    'Transmutation': ['Fire', 'Spirit']
  };
  
  // Moon phase affinity based on specialization
  const specializationMoonPhases: Record<string, MoonPhase> = {
    'Essence': 'Full Moon',
    'Fermentation': 'Waxing Crescent',
    'Distillation': 'Waning Gibbous',
    'Infusion': 'First Quarter',
    'Crystallization': 'Full Moon',
    'Transmutation': 'New Moon'
  };
  
  // Get the focused elements
  const focusElements = specializationElements[specialization] || ['Earth', 'Water'];
  const focusMoonPhase = specializationMoonPhases[specialization] || 'Full Moon';
  
  // Calculate which cards to prioritize
  const allCards = getStandardCardDeck();
  const elementCards = allCards.filter(card => 
    card.elementalAffinity && focusElements.includes(card.elementalAffinity)
  );
  
  const moonCards = allCards.filter(card => 
    card.moonAffinity === focusMoonPhase
  );
  
  // Build a specialized core deck
  const specializedCoreCards: string[] = [];
  
  // Add element-aligned cards
  elementCards.slice(0, 15).forEach(card => {
    specializedCoreCards.push(card.id);
  });
  
  // Add moon-aligned cards 
  moonCards.slice(0, 5).forEach(card => {
    if (!specializedCoreCards.includes(card.id)) {
      specializedCoreCards.push(card.id);
    }
  });
  
  // Fill remaining slots with balanced cards
  while (specializedCoreCards.length < 20) {
    // Find a card that we don't have yet
    const remainingCards = allCards.filter(card => !specializedCoreCards.includes(card.id));
    if (remainingCards.length === 0) break;
    
    // Prefer high value cards
    const highValueCards = remainingCards.filter(card => card.value >= 10);
    if (highValueCards.length > 0) {
      specializedCoreCards.push(highValueCards[0].id);
    } else {
      specializedCoreCards.push(remainingCards[0].id);
    }
  }
  
  // Calculate elemental balance
  const elementalBalance: Record<ElementType, number> = {
    'Earth': 0,
    'Water': 0,
    'Fire': 0,
    'Air': 0,
    'Spirit': 0
  };
  
  // Calculate suit distribution
  const suitDistribution: Record<MoonCardSuit, number> = {
    'stars': 0,
    'herbs': 0,
    'potions': 0,
    'crystals': 0
  };
  
  // Count elements and suits
  specializedCoreCards.forEach(cardId => {
    const [_, suit, _value] = cardId.split('_'); // Prefix with underscore to indicate unused variable
    suitDistribution[suit as MoonCardSuit]++;
    
    // Find the card to get its element
    const card = allCards.find(c => c.id === cardId);
    if (card && card.elementalAffinity) {
      elementalBalance[card.elementalAffinity]++;
    }
  });
  
  // Return the specialized deck
  return {
    ...standardDeck,
    name: `${playerName}'s ${specialization} Deck`,
    description: `A deck specialized for ${specialization} practitioners`,
    coreCards: specializedCoreCards,
    lunarAlignment: focusMoonPhase,
    elementalBalance,
    suitDistribution,
    rarityScore: calculateRarityScore(specializedCoreCards, [])
  };
}