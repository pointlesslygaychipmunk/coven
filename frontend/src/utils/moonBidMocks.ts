import {
  MoonPhase,
  Season,
  ElementType,
  ItemCategory
} from 'coven-shared';

// Redefine types from moonBidGame.ts
export type MoonCardSuit = 'stars' | 'herbs' | 'potions' | 'crystals';
export type MoonCardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type CardPower = 
  'nullify' | 'double' | 'steal' | 'predict' | 'swap' | 
  'illuminate' | 'duplicate' | 'transform' | 'protect' | 'reveal';
export type GameMode = 
  'standard' | 'cooperative' | 'eclipse' | 
  'solstice' | 'equinox' | 'ancestral';
export type RewardType = 
  'mana' | 'essence' | 'ingredient' | 'recipe' | 
  'reputation' | 'gold' | 'packaging' | 'seed';

// Card rarity levels for deckbuilding
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type CardSource = 
  'core' | 'craft' | 'reward' | 'event' | 'achievement' | 
  'purchase' | 'seasonal' | 'lunar' | 'coven' | 'salvage';
export type CardEffectType = 
  'reveal' | 'boost' | 'transform' | 'protect' | 'cancel' | 
  'duplicate' | 'recover' | 'enhance' | 'steal' | 'wild' | 'swap';

// Interface definitions
export interface MoonCard {
  id: string;
  suit: MoonCardSuit;
  value: MoonCardValue;
  name: string;
  power?: CardPower;
  description: string;
  moonAffinity?: MoonPhase;
  elementalAffinity?: ElementType;
  seasonalAffinity?: Season;
  imagePath: string;
  isSpecial: boolean;
}

export interface MoonBidPlayer {
  id: string;
  name: string;
  cards: MoonCard[];
  bid: number;
  tricks: number;
  score: number;
  lunarFavor: number;
  specialPowerUsed: boolean;
  winningCards: MoonCard[];
  role?: string;
}

export interface Trick {
  leadSuit: MoonCardSuit;
  cards: Array<{
    playerId: string;
    card: MoonCard;
  }>;
  winner?: string;
  doublePoints: boolean;
  voidTrick: boolean;
}

export interface MoonGameReward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  requiredOutcome: string;
  quantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  moonPhaseBonus?: MoonPhase;
}

export interface MoonBidGame {
  id: string;
  players: MoonBidPlayer[];
  currentPhase: 'bidding' | 'playing' | 'scoring';
  currentPlayerIndex: number;
  roundNumber: number;
  totalRounds: number;
  deck: MoonCard[];
  currentTrick: Trick | null;
  completedTricks: Trick[];
  trumpSuit?: MoonCardSuit;
  gameMode: GameMode;
  moonPhase: MoonPhase;
  season: Season;
  phaseBonus: {
    description: string;
    effect: string;
    bonusSuit?: MoonCardSuit;
  };
  rewards: MoonGameReward[];
  teamScore?: number;
  lunarEnergy: number;
  winningConditionMet: boolean;
}

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

export interface PlayerDeck {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  coreCards: string[];
  customCards: string[];
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

// Moon phase effects on the card game
export const MOON_PHASE_EFFECTS: Record<MoonPhase, {
  description: string;
  effect: string;
  bonusSuit: MoonCardSuit;
  specialRule: string;
}> = {
  'New Moon': {
    description: 'The New Moon shrouds cards in mystery',
    effect: 'Players cannot see others\' cards when played until all are revealed',
    bonusSuit: 'potions',
    specialRule: 'Exact bids score double points'
  },
  'Waxing Crescent': {
    description: 'The Waxing Crescent brings growth',
    effect: 'Lowest value cards gain +3 to their value',
    bonusSuit: 'herbs',
    specialRule: 'Winning with the lowest card awards bonus essence'
  },
  'First Quarter': {
    description: 'The First Quarter balances light and dark',
    effect: 'Black and white cards (odd and even values) alternate in strength',
    bonusSuit: 'stars',
    specialRule: 'Making exactly half your bid earns a special reward'
  },
  'Waxing Gibbous': {
    description: 'The Waxing Gibbous enhances powers',
    effect: 'Special card abilities are empowered',
    bonusSuit: 'crystals',
    specialRule: 'Special cards count double toward your bid'
  },
  'Full Moon': {
    description: 'The Full Moon reveals true power',
    effect: 'All cards reveal their maximum potential',
    bonusSuit: 'stars',
    specialRule: 'All rewards doubled, but penalties also doubled'
  },
  'Waning Gibbous': {
    description: 'The Waning Gibbous preserves energy',
    effect: 'Cards played in tricks are not discarded but returned to hand once per game',
    bonusSuit: 'crystals',
    specialRule: 'Players can choose to "bank" one trick for double points'
  },
  'Last Quarter': {
    description: 'The Last Quarter brings equilibrium',
    effect: 'Cards of equal value cancel each other out',
    bonusSuit: 'herbs',
    specialRule: 'If all players play equal value cards, everyone gains lunar favor'
  },
  'Waning Crescent': {
    description: 'The Waning Crescent inspires reflection',
    effect: 'Players can see one card from each opponent\'s hand',
    bonusSuit: 'potions',
    specialRule: 'Intentionally losing a trick with a high card grants lunar favor'
  }
};

// Season effects on the card game
export const SEASON_EFFECTS: Record<Season, {
  description: string;
  effect: string;
  dominantElement: ElementType;
  specialRule: string;
}> = {
  'Spring': {
    description: 'Spring brings new growth and beginnings',
    effect: 'Herb suit gains +2 power',
    dominantElement: 'Earth',
    specialRule: 'First trick winner gets a bonus wildcard'
  },
  'Summer': {
    description: 'Summer burns with magical intensity',
    effect: 'Potions suit gains +2 power',
    dominantElement: 'Fire',
    specialRule: 'Winning with Fire-aligned cards grants lunar favor'
  },
  'Fall': {
    description: 'Fall brings reflection and transition',
    effect: 'Crystal suit gains +2 power',
    dominantElement: 'Air',
    specialRule: 'Players can discard and redraw once per round'
  },
  'Winter': {
    description: 'Winter embraces stillness and potential',
    effect: 'Stars suit gains +2 power',
    dominantElement: 'Water',
    specialRule: 'Passing (playing no card) in one trick allows seeing future tricks'
  }
};

// Create mock card data
function createMockCard(
  id: string,
  suit: MoonCardSuit,
  value: MoonCardValue,
  name: string,
  overrides: Partial<MoonCard> = {}
): MoonCard {
  return {
    id,
    suit,
    value,
    name,
    description: overrides.description || `A ${name} card of the ${suit} suit`,
    moonAffinity: overrides.moonAffinity,
    elementalAffinity: overrides.elementalAffinity,
    seasonalAffinity: overrides.seasonalAffinity,
    power: overrides.power,
    imagePath: overrides.imagePath || `/assets/cards/${suit}_${value}.png`,
    isSpecial: overrides.isSpecial || false
  };
}

// Create mock craftable card
function createMockCraftableCard(
  id: string,
  suit: MoonCardSuit,
  value: MoonCardValue,
  name: string,
  rarityTier: CardRarity,
  overrides: Partial<CraftableCard> = {}
): CraftableCard {
  return {
    // Base card properties
    id,
    suit,
    value,
    name,
    description: overrides.description || `A craftable ${name} card of the ${suit} suit`,
    moonAffinity: overrides.moonAffinity,
    elementalAffinity: overrides.elementalAffinity,
    seasonalAffinity: overrides.seasonalAffinity,
    power: overrides.power,
    imagePath: overrides.imagePath || `/assets/special_cards/${suit}_${value}.png`,
    isSpecial: true,
    
    // Craftable card specific properties
    craftingRequirements: overrides.craftingRequirements || [
      {
        itemId: 'item_1',
        itemName: 'Lunar Essence',
        itemCategory: 'essence',
        quantity: 2
      }
    ],
    rarityTier,
    essenceCost: overrides.essenceCost || (rarityTier === 'common' ? 10 : 
                                          rarityTier === 'uncommon' ? 25 :
                                          rarityTier === 'rare' ? 50 :
                                          rarityTier === 'epic' ? 100 : 200),
    manaCost: overrides.manaCost || (rarityTier === 'common' ? 5 : 
                                    rarityTier === 'uncommon' ? 15 :
                                    rarityTier === 'rare' ? 30 :
                                    rarityTier === 'epic' ? 60 : 120),
    goldCost: overrides.goldCost || (rarityTier === 'common' ? 50 : 
                                    rarityTier === 'uncommon' ? 150 :
                                    rarityTier === 'rare' ? 500 :
                                    rarityTier === 'epic' ? 1500 : 5000),
    cardEffect: overrides.cardEffect || {
      type: 'boost',
      description: 'Boosts the value of other cards in your hand',
      magnitude: rarityTier === 'common' ? 1 : 
                rarityTier === 'uncommon' ? 2 :
                rarityTier === 'rare' ? 3 :
                rarityTier === 'epic' ? 4 : 5
    },
    craftingDifficulty: overrides.craftingDifficulty || (rarityTier === 'common' ? 1 : 
                                                        rarityTier === 'uncommon' ? 2 :
                                                        rarityTier === 'rare' ? 3 :
                                                        rarityTier === 'epic' ? 4 : 5),
    source: overrides.source || 'craft',
    availableDuring: overrides.availableDuring,
    salvageValue: overrides.salvageValue || (rarityTier === 'common' ? 5 : 
                                            rarityTier === 'uncommon' ? 15 :
                                            rarityTier === 'rare' ? 40 :
                                            rarityTier === 'epic' ? 90 : 180)
  };
}

// Generate a standard deck of 52 cards (4 suits x 13 values)
export function generateStandardDeck(): MoonCard[] {
  const deck: MoonCard[] = [];
  const suits: MoonCardSuit[] = ['stars', 'herbs', 'potions', 'crystals'];
  
  suits.forEach(suit => {
    for (let value = 1; value <= 13; value++) {
      const cardValue = value as MoonCardValue;
      let name = '';
      
      // Special names for face cards
      if (value === 1) name = 'Apprentice';
      else if (value === 11) name = 'Familiar';
      else if (value === 12) name = 'Elder';
      else if (value === 13) name = 'Witch';
      else name = `${value} of ${suit}`;
      
      const card = createMockCard(`${suit}_${value}`, suit, cardValue, name);
      deck.push(card);
    }
  });
  
  return deck;
}

// Generate a set of special cards
export function generateSpecialCards(): CraftableCard[] {
  return [
    createMockCraftableCard('special_1', 'stars', 7, 'Star of Foresight', 'uncommon', {
      power: 'predict',
      description: 'Reveals the next card in the deck',
      elementalAffinity: 'Air',
      moonAffinity: 'Full Moon'
    }),
    createMockCraftableCard('special_2', 'herbs', 5, 'Dreamleaf', 'rare', {
      power: 'swap',
      description: 'Swap this card with any card in your hand after seeing the lead card',
      elementalAffinity: 'Earth',
      seasonalAffinity: 'Spring'
    }),
    createMockCraftableCard('special_3', 'potions', 9, 'Elixir of Duality', 'epic', {
      power: 'duplicate',
      description: 'Copy the effect of another card in the trick',
      elementalAffinity: 'Water',
      moonAffinity: 'Waxing Gibbous'
    }),
    createMockCraftableCard('special_4', 'crystals', 3, 'Null Crystal', 'rare', {
      power: 'nullify',
      description: 'Cancels the effect of the highest card in the trick',
      elementalAffinity: 'Earth',
      seasonalAffinity: 'Winter'
    }),
    createMockCraftableCard('special_5', 'stars', 13, 'Celestial Queen', 'legendary', {
      power: 'illuminate',
      description: 'Reveals all cards in opponents\' hands for one round',
      elementalAffinity: 'Spirit',
      moonAffinity: 'Full Moon',
      seasonalAffinity: 'Summer'
    })
  ];
}

// Export constants
export const CORE_CARDS = generateStandardDeck();
export const CRAFTABLE_CARDS = generateSpecialCards();
export const CARD_COMBOS = [
  ['stars_13', 'crystals_13'], // Witch of Stars + Witch of Crystals = Celestial Pact
  ['herbs_7', 'potions_7'],    // 7 of Herbs + 7 of Potions = Nature's Harmony
  ['stars_1', 'herbs_1', 'potions_1', 'crystals_1'] // All four Apprentices = Circle of Learning
];

// Game Modes configuration
export const GAME_MODES = {
  standard: {
    name: 'Standard Moon Bid',
    description: 'The classic Moon Bid game for 2-4 players.',
    playerCount: { min: 2, max: 4 },
    specialCards: false
  },
  cooperative: {
    name: 'Cooperative',
    description: 'Work together against the game in this cooperative variant.',
    playerCount: { min: 2, max: 5 },
    specialCards: true
  },
  eclipse: {
    name: 'Eclipse Mode',
    description: 'A special variant played during eclipses.',
    playerCount: { min: 3, max: 5 },
    specialCards: true
  }
};

// Create a default deck for a player
export function createDefaultDeck(playerId: string, playerName: string): PlayerDeck {
  return createMockPlayerDeck(
    `deck_default_${playerId}`,
    'Default Deck',
    playerId,
    {
      description: `${playerName}'s standard Moon Bid deck`
    }
  );
}

// Create a specialized deck for a player with a specific focus
export function createSpecializedDeck(
  playerId: string,
  playerName: string,
  specialization: string
): PlayerDeck {
  // Determine a moon phase that matches the specialization
  const moonPhase: MoonPhase = 
    specialization.toLowerCase().includes('herb') ? 'Waxing Crescent' :
    specialization.toLowerCase().includes('potion') ? 'Waning Crescent' :
    specialization.toLowerCase().includes('crystal') ? 'Waning Gibbous' :
    'Full Moon'; // Default to Full Moon for other specializations
    
  return createMockPlayerDeck(
    `deck_spec_${playerId}_${Date.now()}`,
    `${specialization} Mastery Deck`,
    playerId,
    {
      description: `${playerName}'s specialized deck for ${specialization}`,
      lunarAlignment: moonPhase
    }
  );
}

// Initialize a new Moon Bid game
export function initializeMoonBidGame(
  playerIds: string[],
  playerNames: string[],
  gameMode: GameMode,
  moonPhase: MoonPhase,
  season: Season
): MoonBidGame {
  // Create players
  const players = playerIds.map((id, index) => 
    createMockMoonBidPlayer(id, playerNames[index] || `Player ${index + 1}`)
  );

  // Create game state
  const gameState = createMockGameState(
    `game_${Date.now()}`,
    players,
    moonPhase,
    season,
    { gameMode }
  );

  // Deal cards to players
  dealCards(gameState.deck, players, 7);

  return gameState;
}

// Place a bid in the game
export function placeBid(
  game: MoonBidGame,
  playerId: string,
  bidAmount: number
): MoonBidGame {
  // Clone the game to avoid direct modification
  const updatedGame = JSON.parse(JSON.stringify(game)) as MoonBidGame;
  
  // Find the player
  const playerIndex = updatedGame.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return updatedGame;
  
  // Update the player's bid
  updatedGame.players[playerIndex].bid = bidAmount;
  
  // Check if all players have bid
  const allBid = updatedGame.players.every(p => p.bid >= 0);
  if (allBid) {
    updatedGame.currentPhase = 'playing';
  }
  
  return updatedGame;
}

// Play a card in the game
export function playCard(
  game: MoonBidGame,
  playerId: string,
  cardId: string
): MoonBidGame {
  // Clone the game to avoid direct modification
  const updatedGame = JSON.parse(JSON.stringify(game)) as MoonBidGame;
  
  // Find the player
  const playerIndex = updatedGame.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return updatedGame;
  
  // Find the card in the player's hand
  const player = updatedGame.players[playerIndex];
  const cardIndex = player.cards.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return updatedGame;
  
  // Get the card
  const card = player.cards[cardIndex];
  
  // Create or update the current trick
  if (!updatedGame.currentTrick) {
    updatedGame.currentTrick = {
      leadSuit: card.suit,
      cards: [],
      doublePoints: false,
      voidTrick: false
    };
  }
  
  // Add the card to the trick
  updatedGame.currentTrick.cards.push({
    playerId,
    card
  });
  
  // Remove the card from the player's hand
  player.cards.splice(cardIndex, 1);
  
  // If all players have played a card, determine the winner of the trick
  if (updatedGame.currentTrick.cards.length === updatedGame.players.length) {
    const winningPlayerId = determineTrickWinner(updatedGame.currentTrick, updatedGame.trumpSuit);
    
    if (winningPlayerId) {
      // Find the winning player
      const winnerIndex = updatedGame.players.findIndex(p => p.id === winningPlayerId);
      if (winnerIndex !== -1) {
        // Update the winner's trick count
        updatedGame.players[winnerIndex].tricks += 1;
        
        // Store the winning player ID
        updatedGame.currentTrick.winner = winningPlayerId;
        
        // Move the cards to the winner's winning cards array
        updatedGame.currentTrick.cards.forEach(played => {
          updatedGame.players[winnerIndex].winningCards.push(played.card);
        });
      }
    }
    
    // Move the current trick to completed tricks
    updatedGame.completedTricks.push(updatedGame.currentTrick);
    updatedGame.currentTrick = null;
    
    // Check if the round is over
    const roundOver = updatedGame.players.every(p => p.cards.length === 0);
    if (roundOver) {
      // Score the round
      calculateRoundScores(updatedGame.players, updatedGame.moonPhase, updatedGame.gameMode);
      
      // Increment the round number
      updatedGame.roundNumber += 1;
      
      // Check if the game is over
      if (updatedGame.roundNumber > updatedGame.totalRounds) {
        updatedGame.currentPhase = 'scoring';
        updatedGame.winningConditionMet = true;
      } else {
        // Deal new cards for the next round
        dealCards(updatedGame.deck, updatedGame.players, 7);
        
        // Reset player bids and tricks
        updatedGame.players.forEach(p => {
          p.bid = 0;
          p.tricks = 0;
          p.winningCards = [];
        });
        
        // Go back to bidding phase
        updatedGame.currentPhase = 'bidding';
      }
    }
  } else {
    // Move to the next player
    updatedGame.currentPlayerIndex = (updatedGame.currentPlayerIndex + 1) % updatedGame.players.length;
  }
  
  return updatedGame;
}

// Determine the winners of the game
export function getGameWinners(game: MoonBidGame): {
  winnerIds: string[];
  winnerNames: string[];
  isTeamWin: boolean;
} {
  // If the game isn't complete, return empty result
  if (!game.winningConditionMet) {
    return {
      winnerIds: [],
      winnerNames: [],
      isTeamWin: false
    };
  }
  
  // Get player scores
  const playerScores = game.players.map(p => ({
    playerId: p.id,
    name: p.name,
    score: p.score
  }));
  
  // Sort by score (highest first)
  playerScores.sort((a, b) => b.score - a.score);
  
  // For cooperative mode, it's a team win if condition is met
  if (game.gameMode === 'cooperative') {
    return {
      winnerIds: game.players.map(p => p.id),
      winnerNames: game.players.map(p => p.name),
      isTeamWin: true
    };
  }
  
  // For standard mode, find all players with the top score (handle ties)
  const topScore = playerScores[0].score;
  const winners = playerScores.filter(p => p.score === topScore);
  
  return {
    winnerIds: winners.map(w => w.playerId),
    winnerNames: winners.map(w => w.name),
    isTeamWin: false
  };
}

// Default deckbuilding rules
export const DEFAULT_RULES: DeckbuildingRules = {
  coreCardsRequired: 10,
  customSlotsAllowed: 5,
  maxRarityPoints: 30,
  elementalRequirements: {
    'Earth': 2,
    'Water': 2,
    'Fire': 2,
    'Air': 2,
    'Spirit': 1
  },
  maxSameSuit: 7,
  maxSameValue: 4,
  moonPhaseRequirement: undefined,
  seasonRequirement: undefined,
  specialCardsLimit: 3
};

// Create a mock player deck
export function createMockPlayerDeck(
  id: string,
  name: string,
  ownerId: string,
  overrides: Partial<PlayerDeck> = {}
): PlayerDeck {
  return {
    id,
    name,
    ownerId,
    description: overrides.description || `${name} - a custom moon bid deck`,
    coreCards: overrides.coreCards || [
      'stars_1', 'stars_7', 'stars_13',
      'herbs_2', 'herbs_5', 'herbs_8',
      'potions_3', 'potions_11',
      'crystals_4', 'crystals_10'
    ],
    customCards: overrides.customCards || ['special_1', 'special_2'],
    lunarAlignment: overrides.lunarAlignment || 'Full Moon',
    elementalBalance: overrides.elementalBalance || {
      'Earth': 3,
      'Water': 2,
      'Fire': 2,
      'Air': 4,
      'Spirit': 1
    },
    suitDistribution: overrides.suitDistribution || {
      'stars': 3,
      'herbs': 3,
      'potions': 2,
      'crystals': 2
    },
    rarityScore: overrides.rarityScore || 18,
    specialAbility: overrides.specialAbility || {
      name: 'Lunar Insight',
      description: 'Once per game, peek at the next three cards in the deck',
      triggerCondition: 'When losing a trick with a face card',
      cooldown: 0
    },
    deckArt: overrides.deckArt || '/assets/deck_arts/lunar_forest.png',
    creationDate: overrides.creationDate || Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    lastModified: overrides.lastModified || Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    favoriteStatus: overrides.favoriteStatus || true,
    playCount: overrides.playCount || 12,
    winCount: overrides.winCount || 7
  };
}

// Create a mock game state
export function createMockGameState(
  gameId: string,
  players: MoonBidPlayer[],
  moonPhase: MoonPhase = 'Full Moon',
  season: Season = 'Spring',
  overrides: Partial<MoonBidGame> = {}
): MoonBidGame {
  return {
    id: gameId,
    players,
    currentPhase: overrides.currentPhase || 'bidding',
    currentPlayerIndex: overrides.currentPlayerIndex || 0,
    roundNumber: overrides.roundNumber || 1,
    totalRounds: overrides.totalRounds || 7,
    deck: overrides.deck || generateStandardDeck(),
    currentTrick: overrides.currentTrick || null,
    completedTricks: overrides.completedTricks || [],
    trumpSuit: overrides.trumpSuit || 'stars',
    gameMode: overrides.gameMode || 'standard',
    moonPhase,
    season,
    phaseBonus: overrides.phaseBonus || {
      description: MOON_PHASE_EFFECTS[moonPhase].description,
      effect: MOON_PHASE_EFFECTS[moonPhase].effect,
      bonusSuit: MOON_PHASE_EFFECTS[moonPhase].bonusSuit
    },
    rewards: overrides.rewards || [
      {
        id: 'reward_1',
        name: 'Lunar Essence',
        description: 'A small amount of lunar essence',
        type: 'essence',
        requiredOutcome: 'Win the game',
        quantity: 20,
        rarity: 'common'
      },
      {
        id: 'reward_2',
        name: 'Moonsilver',
        description: 'Rare currency from the moon realm',
        type: 'gold',
        requiredOutcome: 'Win with exact bid',
        quantity: 100,
        rarity: 'uncommon',
        moonPhaseBonus: 'Full Moon'
      }
    ],
    teamScore: overrides.teamScore,
    lunarEnergy: overrides.lunarEnergy || 50,
    winningConditionMet: overrides.winningConditionMet || false
  };
}

// Create a mock player
export function createMockMoonBidPlayer(
  id: string,
  name: string,
  overrides: Partial<MoonBidPlayer> = {}
): MoonBidPlayer {
  return {
    id,
    name,
    cards: overrides.cards || [],
    bid: overrides.bid || 0,
    tricks: overrides.tricks || 0,
    score: overrides.score || 0,
    lunarFavor: overrides.lunarFavor || 0,
    specialPowerUsed: overrides.specialPowerUsed || false,
    winningCards: overrides.winningCards || [],
    role: overrides.role
  };
}

// Deal cards to players
export function dealCards(
  deck: MoonCard[],
  players: MoonBidPlayer[],
  cardsPerPlayer: number
): void {
  // Copy the deck to avoid modifying the original
  const deckCopy = [...deck];
  
  // Shuffle the deck
  for (let i = deckCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
  }
  
  // Clear players' existing cards
  players.forEach(player => {
    player.cards = [];
  });
  
  // Deal cards to players
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let p = 0; p < players.length; p++) {
      if (deckCopy.length > 0) {
        const card = deckCopy.pop();
        if (card) {
          players[p].cards.push(card);
        }
      }
    }
  }
}

// Simple AI to make a bid
export function makeAIBid(hand: MoonCard[], trumpSuit?: MoonCardSuit): number {
  // For a simple AI, count cards that could win tricks
  // High value cards (10-13) and trump suit cards
  let potentialTricks = 0;
  
  hand.forEach(card => {
    if (card.value >= 10) {
      potentialTricks += 0.8; // 80% chance to win with high cards
    } else if (trumpSuit && card.suit === trumpSuit) {
      potentialTricks += 0.5; // 50% chance to win with trump cards
    }
    
    // Give an extra boost for special cards
    if (card.power) {
      potentialTricks += 0.3;
    }
  });
  
  // Add some randomness to make it less predictable
  const randomAdjustment = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
  
  // Return the bid, ensuring it's at least 0 and not more than hand size
  return Math.max(0, Math.min(Math.floor(potentialTricks) + randomAdjustment, hand.length));
}

// Determine the winner of a trick
export function determineTrickWinner(
  trick: Trick,
  trumpSuit?: MoonCardSuit
): string | undefined {
  if (trick.cards.length === 0) return undefined;
  
  // Check if the trick is void (was cancelled by a special effect)
  if (trick.voidTrick) return undefined;
  
  let winnerIndex = 0;
  let highestValue = trick.cards[0].card.value;
  const leadSuit = trick.leadSuit;
  
  // First pass: check for cards of the lead suit or trump suit
  for (let i = 1; i < trick.cards.length; i++) {
    const card = trick.cards[i].card;
    
    // Trump suit beats everything else
    if (trumpSuit && card.suit === trumpSuit && 
       (trick.cards[winnerIndex].card.suit !== trumpSuit || card.value > highestValue)) {
      winnerIndex = i;
      highestValue = card.value;
    }
    // Cards of the lead suit can beat other lead suit cards
    else if (card.suit === leadSuit && 
            (trick.cards[winnerIndex].card.suit !== trumpSuit && card.value > highestValue)) {
      winnerIndex = i;
      highestValue = card.value;
    }
  }
  
  return trick.cards[winnerIndex].playerId;
}

// Calculate scores for a round
export function calculateRoundScores(
  players: MoonBidPlayer[],
  moonPhase: MoonPhase,
  gameMode: GameMode = 'standard'
): void {
  players.forEach(player => {
    let score = 0;
    
    // In standard mode, players earn 10 points per trick plus bid bonus
    if (gameMode === 'standard') {
      // Points for tricks
      score += player.tricks * 10;
      
      // Exact bid bonus
      if (player.tricks === player.bid) {
        const exactBidBonus = 20 + (player.bid * 5); // Bonus increases with higher successful bids
        score += exactBidBonus;
        
        // Double points on exact bids during New Moon
        if (moonPhase === 'New Moon') {
          score += exactBidBonus;
        }
      }
      // Penalty for missing the bid
      else {
        score -= Math.abs(player.tricks - player.bid) * 5;
      }
      
      // Full Moon doubles all rewards and penalties
      if (moonPhase === 'Full Moon') {
        score *= 2;
      }
    }
    // In cooperative mode, players earn points based on team performance
    else if (gameMode === 'cooperative') {
      // Team needs to hit their collective bid exactly
      const teamBid = players.reduce((sum, p) => sum + p.bid, 0);
      const teamTricks = players.reduce((sum, p) => sum + p.tricks, 0);
      
      if (teamTricks === teamBid) {
        score += 50 + (teamBid * 10);
      } else {
        score += player.tricks * 5 - Math.abs(teamTricks - teamBid) * 10;
      }
    }
    
    // Add lunar favor bonus
    score += player.lunarFavor * 2;
    
    // Update player score
    player.score += Math.max(0, score); // Scores can't go negative
  });
}