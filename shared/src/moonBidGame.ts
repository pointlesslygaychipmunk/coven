// shared/src/moonBidGame.ts
import { MoonPhase, Season, ElementType } from './types.js';

/**
 * Card suit in the Moon Bid Game
 */
export type MoonCardSuit = 'stars' | 'herbs' | 'potions' | 'crystals';

/**
 * Card value in the Moon Bid Game (1-13)
 */
export type MoonCardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/**
 * Special card power
 */
export type CardPower = 
  'nullify' | 'double' | 'steal' | 'predict' | 'swap' | 
  'illuminate' | 'duplicate' | 'transform' | 'protect' | 'reveal';

/**
 * Game mode for the Moon Bid Game
 */
export type GameMode = 
  'standard' | 'cooperative' | 'eclipse' | 
  'solstice' | 'equinox' | 'ancestral';

/**
 * Reward type for winning or achieving goals
 */
export type RewardType = 
  'mana' | 'essence' | 'ingredient' | 'recipe' | 
  'reputation' | 'gold' | 'packaging' | 'seed';

/**
 * Single card in the Moon Bid deck
 */
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

/**
 * Player in the Moon Bid Game
 */
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
  role?: string; // For cooperative mode
}

/**
 * Trick in the card game
 */
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

/**
 * Game reward based on performance
 */
export interface MoonGameReward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  requiredOutcome: string; // E.g., "Win 3 tricks" or "Match your bid exactly"
  quantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  moonPhaseBonus?: MoonPhase; // Extra rewards during specific moon phases
}

/**
 * Complete Moon Bid Game state
 */
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
  teamScore?: number; // For cooperative mode
  lunarEnergy: number;
  winningConditionMet: boolean;
}

/**
 * Moon phase effects on the card game
 */
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

/**
 * Season effects on the card game
 */
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
    effect: 'Potion suit can override trump',
    dominantElement: 'Fire',
    specialRule: 'Playing three cards of the same value creates a solar flare bonus'
  },
  'Fall': {
    description: 'Fall bestows unexpected changes',
    effect: 'Trump suit rotates after each trick',
    dominantElement: 'Air',
    specialRule: 'Successful bids of exactly 3 receive a special harvest reward'
  },
  'Winter': {
    description: 'Winter brings quiet reflection and power',
    effect: 'Crystal suit cards can freeze an opponent\'s card for one trick',
    dominantElement: 'Water',
    specialRule: 'Lowest bidder gets a protective frost shield against bid failure'
  }
};

/**
 * Game modes with special rules
 */
export const GAME_MODES: Record<GameMode, {
  description: string;
  playerCount: [number, number]; // [min, max]
  rules: string[];
  specialCards: boolean;
  teams: boolean;
  bidding: 'standard' | 'hidden' | 'team' | 'none';
}> = {
  'standard': {
    description: 'Classic Moon Bid gameplay with tricks and bidding',
    playerCount: [2, 6],
    rules: [
      'Players bid on how many tricks they\'ll win',
      'Trump suit is randomly determined',
      'Must follow lead suit if possible',
      'Highest card of lead suit wins, unless trumped'
    ],
    specialCards: true,
    teams: false,
    bidding: 'standard'
  },
  'cooperative': {
    description: 'Players work together against the moon\'s challenge',
    playerCount: [2, 6],
    rules: [
      'Team bids on total tricks to win',
      'Moon creates phantom opponents',
      'Team must communicate strategically',
      'Lunar events occur after each trick'
    ],
    specialCards: true,
    teams: true,
    bidding: 'team'
  },
  'eclipse': {
    description: 'Rare and powerful eclipse mode with high stakes',
    playerCount: [3, 6],
    rules: [
      'Cards have eclipse powers when played',
      'Sun and Moon cards contend for dominance',
      'Special rewards tied to eclipse paths',
      'Bidding is hidden and revealed simultaneously'
    ],
    specialCards: true,
    teams: false,
    bidding: 'hidden'
  },
  'solstice': {
    description: 'Longest day/night celebration with elemental powers',
    playerCount: [2, 6],
    rules: [
      'Day and night cards alternate in power',
      'Elemental affinities are doubled',
      'Solstice rewards based on light/dark balance',
      'No trumps, but seasonal powers'
    ],
    specialCards: true,
    teams: false,
    bidding: 'standard'
  },
  'equinox': {
    description: 'Perfect balance challenge requiring precise play',
    playerCount: [2, 6],
    rules: [
      'Must win exactly half the tricks to receive rewards',
      'Balance cards between suits',
      'Equinox bonuses for symmetrical plays',
      'Penalties for imbalance'
    ],
    specialCards: true,
    teams: false,
    bidding: 'none'
  },
  'ancestral': {
    description: 'Connect with witch ancestors through traditional play',
    playerCount: [2, 4],
    rules: [
      'Traditional trick-taking with ancestor powers',
      'Family cards provide special abilities',
      'Heritage rewards for matching ancestral playing styles',
      'Blessings passed down for future games'
    ],
    specialCards: true,
    teams: false,
    bidding: 'standard'
  }
};

/**
 * Create a standard deck of Moon Bid cards
 * @returns Array of MoonCards
 */
export function createMoonBidDeck(): MoonCard[] {
  const deck: MoonCard[] = [];
  const suits: MoonCardSuit[] = ['stars', 'herbs', 'potions', 'crystals'];
  
  // Create standard cards for each suit
  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      const cardValue = value as MoonCardValue;
      const id = `card_${suit}_${value}`;
      
      // Generate name based on suit and value
      let name = '';
      if (cardValue === 1) name = 'Ace';
      else if (cardValue === 11) name = 'Seer';
      else if (cardValue === 12) name = 'Alchemist';
      else if (cardValue === 13) name = 'Archmage';
      else name = cardValue.toString();
      
      name += ` of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`;
      
      // Add card to deck
      deck.push({
        id,
        suit,
        value: cardValue,
        name,
        description: `${name}, value ${cardValue}`,
        imagePath: `/assets/cards/moon_bid/${suit}_${cardValue}.png`,
        isSpecial: cardValue > 10
      });
    }
  }
  
  // Add special cards for each moon phase
  Object.entries(MOON_PHASE_EFFECTS).forEach(([phase, effect]) => {
    const moonPhase = phase as MoonPhase;
    const specialPower = getSpecialPowerForPhase(moonPhase);
    
    deck.push({
      id: `special_${moonPhase.toLowerCase().replace(/\s+/g, '_')}`,
      suit: effect.bonusSuit,
      value: 13,
      name: `${moonPhase} Blessing`,
      power: specialPower,
      description: `Special card aligned with the ${moonPhase}. ${getSpecialPowerDescription(specialPower)}`,
      moonAffinity: moonPhase,
      imagePath: `/assets/cards/moon_bid/special_${moonPhase.toLowerCase().replace(/\s+/g, '_')}.png`,
      isSpecial: true
    });
  });
  
  // Add elemental special cards
  const elements: ElementType[] = ['Earth', 'Water', 'Fire', 'Air', 'Spirit'];
  elements.forEach(element => {
    deck.push({
      id: `special_${element.toLowerCase()}`,
      suit: getSuitForElement(element),
      value: 12,
      name: `${element} Embodiment`,
      power: getSpecialPowerForElement(element),
      description: `Elemental card embodying the power of ${element}. ${getSpecialPowerDescription(getSpecialPowerForElement(element))}`,
      elementalAffinity: element,
      imagePath: `/assets/cards/moon_bid/special_${element.toLowerCase()}.png`,
      isSpecial: true
    });
  });
  
  return deck;
}

/**
 * Get a special power based on moon phase
 * @param moonPhase Moon phase to get power for
 * @returns CardPower associated with that phase
 */
function getSpecialPowerForPhase(moonPhase: MoonPhase): CardPower {
  const powerMap: Record<MoonPhase, CardPower> = {
    'New Moon': 'nullify',
    'Waxing Crescent': 'predict',
    'First Quarter': 'swap',
    'Waxing Gibbous': 'illuminate',
    'Full Moon': 'double',
    'Waning Gibbous': 'protect',
    'Last Quarter': 'transform',
    'Waning Crescent': 'reveal'
  };
  
  return powerMap[moonPhase];
}

/**
 * Get a special power based on element
 * @param element Element to get power for
 * @returns CardPower associated with that element
 */
function getSpecialPowerForElement(element: ElementType): CardPower {
  const powerMap: Record<ElementType, CardPower> = {
    'Earth': 'protect',
    'Water': 'transform',
    'Fire': 'double',
    'Air': 'swap',
    'Spirit': 'illuminate'
  };
  
  return powerMap[element];
}

/**
 * Get a suit associated with an element
 * @param element Element to find suit for
 * @returns MoonCardSuit associated with that element
 */
function getSuitForElement(element: ElementType): MoonCardSuit {
  const suitMap: Record<ElementType, MoonCardSuit> = {
    'Earth': 'herbs',
    'Water': 'potions',
    'Fire': 'stars',
    'Air': 'stars',
    'Spirit': 'crystals'
  };
  
  return suitMap[element];
}

/**
 * Get description for a card power
 * @param power Card power to describe
 * @returns Description of what the power does
 */
function getSpecialPowerDescription(power: CardPower): string {
  const descriptions: Record<CardPower, string> = {
    'nullify': 'Cancels another card\'s effect or value',
    'double': 'Doubles the value of another played card',
    'steal': 'Takes a trick that would have been won by another player',
    'predict': 'Look at the top 3 cards before they\'re dealt',
    'swap': 'Exchange a card in your hand with a random card from another player',
    'illuminate': 'Reveals all cards in play with enhanced effects',
    'duplicate': 'Copy another card\'s power or value',
    'transform': 'Change a card\'s suit to match the current trump',
    'protect': 'Prevents a card from being affected by special powers',
    'reveal': 'Forces one player to reveal their hand'
  };
  
  return descriptions[power];
}

/**
 * Initialize a new Moon Bid Game
 * @param playerIds Array of player IDs participating
 * @param playerNames Array of player names
 * @param moonPhase Current moon phase
 * @param season Current season
 * @param gameMode Game mode to play
 * @returns Initialized MoonBidGame
 */
export function initializeMoonBidGame(
  playerIds: string[],
  playerNames: string[],
  moonPhase: MoonPhase,
  season: Season,
  gameMode: GameMode = 'standard'
): MoonBidGame {
  // Validate player count for the game mode
  const modeConfig = GAME_MODES[gameMode];
  const [minPlayers, maxPlayers] = modeConfig.playerCount;
  
  if (playerIds.length < minPlayers || playerIds.length > maxPlayers) {
    throw new Error(`${gameMode} mode requires ${minPlayers}-${maxPlayers} players`);
  }
  
  // Create and shuffle deck
  let deck = createMoonBidDeck();
  deck = shuffleDeck(deck);
  
  // Initialize player structures
  const players: MoonBidPlayer[] = playerIds.map((id, index) => ({
    id,
    name: playerNames[index] || `Player ${index + 1}`,
    cards: [],
    bid: 0,
    tricks: 0,
    score: 0,
    lunarFavor: 0,
    specialPowerUsed: false,
    winningCards: []
  }));
  
  // For cooperative mode, assign roles
  if (gameMode === 'cooperative') {
    const roles = ['Navigator', 'Guardian', 'Channeler', 'Diviner'];
    players.forEach((player, index) => {
      player.role = roles[index % roles.length];
    });
  }
  
  // Determine trump suit based on season and moon phase
  const seasonEffect = SEASON_EFFECTS[season];
  const phaseEffect = MOON_PHASE_EFFECTS[moonPhase];
  
  let trumpSuit: MoonCardSuit | undefined = undefined;
  
  // In standard mode, determine a trump suit
  if (gameMode === 'standard') {
    // Favor the season's element-associated suit or moon phase's bonus suit
    const possibleTrumps = [
      getSuitForElement(seasonEffect.dominantElement),
      phaseEffect.bonusSuit
    ];
    trumpSuit = possibleTrumps[Math.floor(Math.random() * possibleTrumps.length)];
  }
  
  // Create rewards based on moon phase
  const rewards = createGameRewards(moonPhase, season, gameMode);
  
  // Initialize the game
  const game: MoonBidGame = {
    id: `game_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    players,
    currentPhase: 'bidding',
    currentPlayerIndex: 0,
    roundNumber: 1,
    totalRounds: calculateTotalRounds(playerIds.length, gameMode),
    deck,
    currentTrick: null,
    completedTricks: [],
    trumpSuit,
    gameMode,
    moonPhase,
    season,
    phaseBonus: {
      description: phaseEffect.description,
      effect: phaseEffect.effect,
      bonusSuit: phaseEffect.bonusSuit
    },
    rewards,
    lunarEnergy: 10, // Starting energy
    winningConditionMet: false
  };
  
  // For cooperative mode, add team score
  if (gameMode === 'cooperative') {
    game.teamScore = 0;
  }
  
  // Deal cards to players
  dealCards(game);
  
  return game;
}

/**
 * Shuffle a deck of cards
 * @param deck Deck to shuffle
 * @returns Shuffled deck
 */
function shuffleDeck(deck: MoonCard[]): MoonCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deal cards to players
 * @param game Game state to update
 */
function dealCards(game: MoonBidGame): void {
  const cardsPerPlayer = calculateCardsPerPlayer(game.players.length, game.gameMode);
  
  // Clear any existing cards
  game.players.forEach(player => {
    player.cards = [];
  });
  
  // Deal cards to players
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let j = 0; j < game.players.length; j++) {
      if (game.deck.length > 0) {
        const card = game.deck.pop()!;
        game.players[j].cards.push(card);
      }
    }
  }
  
  // Sort each player's hand
  game.players.forEach(player => {
    player.cards.sort((a, b) => {
      if (a.suit !== b.suit) {
        return a.suit.localeCompare(b.suit);
      }
      return a.value - b.value;
    });
  });
}

/**
 * Calculate how many cards each player should get
 * @param playerCount Number of players
 * @param gameMode Game mode being played
 * @returns Number of cards per player
 */
function calculateCardsPerPlayer(playerCount: number, gameMode: GameMode): number {
  // Base calculations
  const totalRounds = calculateTotalRounds(playerCount, gameMode);
  
  // For standard mode, divide deck evenly
  if (gameMode === 'standard' || gameMode === 'eclipse' || gameMode === 'solstice') {
    // Typically deal 13 cards for 4 players
    return Math.min(13, Math.floor(52 / playerCount));
  }
  
  // For cooperative mode, give more cards
  if (gameMode === 'cooperative') {
    return Math.min(13, Math.floor(60 / playerCount));
  }
  
  // For equinox and ancestral modes
  return totalRounds;
}

/**
 * Calculate total rounds for a game
 * @param playerCount Number of players
 * @param gameMode Game mode
 * @returns Total number of rounds
 */
function calculateTotalRounds(playerCount: number, gameMode: GameMode): number {
  if (gameMode === 'standard' || gameMode === 'eclipse' || gameMode === 'solstice') {
    // Standard mode plays until all cards are used
    return Math.min(13, Math.floor(52 / playerCount));
  }
  
  if (gameMode === 'cooperative') {
    // Cooperative mode has fixed rounds based on difficulty
    return 8;
  }
  
  if (gameMode === 'equinox') {
    // Equinox mode has exactly 8 rounds
    return 8;
  }
  
  if (gameMode === 'ancestral') {
    // Ancestral mode has 7 rounds for ancestral significance
    return 7;
  }
  
  return 10; // Default
}

/**
 * Create game rewards based on current conditions
 * @param moonPhase Current moon phase
 * @param season Current season
 * @param gameMode Game mode
 * @returns Array of possible rewards
 */
function createGameRewards(moonPhase: MoonPhase, season: Season, gameMode: GameMode): MoonGameReward[] {
  const rewards: MoonGameReward[] = [];
  
  // Base rewards available in any mode
  rewards.push({
    id: 'reward_mana',
    name: 'Lunar Mana',
    description: 'Pure magical energy from the moon phases',
    type: 'mana',
    requiredOutcome: 'Win at least 3 tricks',
    quantity: 25,
    rarity: 'common',
    moonPhaseBonus: 'Full Moon'
  });
  
  rewards.push({
    id: 'reward_essence',
    name: 'Crystallized Essence',
    description: 'Refined lunar power for advanced crafting',
    type: 'essence',
    requiredOutcome: 'Make your exact bid',
    quantity: 3,
    rarity: 'uncommon'
  });
  
  // Add moon phase specific reward
  const phaseReward = createMoonPhaseReward(moonPhase);
  if (phaseReward) rewards.push(phaseReward);
  
  // Add seasonal reward
  const seasonalReward = createSeasonalReward(season);
  if (seasonalReward) rewards.push(seasonalReward);
  
  // Add mode-specific rewards
  if (gameMode === 'cooperative') {
    rewards.push({
      id: 'reward_team_spirit',
      name: 'Coven Harmony',
      description: 'Strengthens bonds between witches',
      type: 'reputation',
      requiredOutcome: 'Complete the game with all players winning at least 1 trick',
      quantity: 20,
      rarity: 'rare'
    });
  }
  
  if (gameMode === 'eclipse') {
    rewards.push({
      id: 'reward_eclipse_seed',
      name: 'Eclipse-Touched Seed',
      description: 'A rare seed infused with eclipse energy',
      type: 'seed',
      requiredOutcome: 'Win a trick with both sun and moon cards',
      quantity: 1,
      rarity: 'legendary'
    });
  }
  
  return rewards;
}

/**
 * Create a reward specific to the current moon phase
 * @param moonPhase Current moon phase
 * @returns MoonGameReward for that phase
 */
function createMoonPhaseReward(moonPhase: MoonPhase): MoonGameReward | null {
  switch (moonPhase) {
    case 'New Moon':
      return {
        id: 'reward_new_moon',
        name: 'Void Essence',
        description: 'Mysterious energy from the darkest night',
        type: 'essence',
        requiredOutcome: 'Win a trick with the lowest card',
        quantity: 2,
        rarity: 'rare'
      };
    case 'Full Moon':
      return {
        id: 'reward_full_moon',
        name: 'Moonlight Crystal',
        description: 'Captures the full power of moonlight',
        type: 'ingredient',
        requiredOutcome: 'Win at least 5 tricks',
        quantity: 1,
        rarity: 'rare',
        moonPhaseBonus: 'Full Moon'
      };
    case 'Waxing Crescent':
    case 'Waxing Gibbous':
      return {
        id: 'reward_waxing_moon',
        name: 'Growth Charm',
        description: 'Accelerates growth of plants and projects',
        type: 'recipe',
        requiredOutcome: 'Increase your tricks won each round',
        quantity: 1,
        rarity: 'uncommon'
      };
    case 'Waning Crescent':
    case 'Waning Gibbous':
      return {
        id: 'reward_waning_moon',
        name: 'Reflection Mirror',
        description: 'Shows hidden qualities in ingredients',
        type: 'ingredient',
        requiredOutcome: 'Win a trick by playing a card after seeing all others',
        quantity: 1,
        rarity: 'uncommon'
      };
    case 'First Quarter':
    case 'Last Quarter':
      return {
        id: 'reward_quarter_moon',
        name: 'Balance Stone',
        description: 'Helps maintain equilibrium in potions',
        type: 'ingredient',
        requiredOutcome: 'Win exactly half your bid',
        quantity: 1,
        rarity: 'uncommon'
      };
    default:
      return null;
  }
}

/**
 * Create a reward specific to the current season
 * @param season Current season
 * @returns MoonGameReward for that season
 */
function createSeasonalReward(season: Season): MoonGameReward | null {
  switch (season) {
    case 'Spring':
      return {
        id: 'reward_spring',
        name: 'Renewal Essence',
        description: 'Captures the energy of new beginnings',
        type: 'essence',
        requiredOutcome: 'Be the first to win a trick',
        quantity: 3,
        rarity: 'uncommon'
      };
    case 'Summer':
      return {
        id: 'reward_summer',
        name: 'Sun-Touched Packaging',
        description: 'Elegant packaging that enhances fire-aligned products',
        type: 'packaging',
        requiredOutcome: 'Win 3 tricks in a row',
        quantity: 1,
        rarity: 'rare'
      };
    case 'Fall':
      return {
        id: 'reward_fall',
        name: 'Harvest Bonus',
        description: 'Additional yield from your next garden harvest',
        type: 'gold',
        requiredOutcome: 'Make a bid of exactly 3 and succeed',
        quantity: 75,
        rarity: 'uncommon'
      };
    case 'Winter':
      return {
        id: 'reward_winter',
        name: 'Frost Essence',
        description: 'Preserves ingredients with winter\'s chill',
        type: 'essence',
        requiredOutcome: 'Win a trick when you bid the lowest',
        quantity: 2,
        rarity: 'uncommon'
      };
    default:
      return null;
  }
}

/**
 * Process a player's bid
 * @param game Game state
 * @param playerId Player ID making the bid
 * @param bidAmount Bid amount
 * @returns Updated game state
 */
export function placeBid(game: MoonBidGame, playerId: string, bidAmount: number): MoonBidGame {
  // Validate game state
  if (game.currentPhase !== 'bidding') {
    throw new Error('Cannot place bid outside of bidding phase');
  }
  
  // Find player
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  // Validate bid amount
  const maxBid = game.players[playerIndex].cards.length;
  if (bidAmount < 0 || bidAmount > maxBid) {
    throw new Error(`Bid must be between 0 and ${maxBid}`);
  }
  
  // Place bid
  game.players[playerIndex].bid = bidAmount;
  
  // Check if all players have bid
  const allBid = game.players.every(player => player.bid !== undefined);
  
  // Move to playing phase if all players have bid
  if (allBid) {
    game.currentPhase = 'playing';
    
    // Reset current trick
    game.currentTrick = {
      leadSuit: 'stars', // Will be set when first card is played
      cards: [],
      doublePoints: false,
      voidTrick: false
    };
  } else {
    // Move to next player for bidding
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
  }
  
  return { ...game };
}

/**
 * Play a card from a player's hand
 * @param game Game state
 * @param playerId Player ID playing the card
 * @param cardId Card ID being played
 * @returns Updated game state
 */
export function playCard(game: MoonBidGame, playerId: string, cardId: string): MoonBidGame {
  // Validate game state
  if (game.currentPhase !== 'playing') {
    throw new Error('Cannot play card outside of playing phase');
  }
  
  // Verify it's the player's turn
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  if (playerIndex !== game.currentPlayerIndex) {
    throw new Error('Not your turn');
  }
  
  // Find the card in player's hand
  const player = game.players[playerIndex];
  const cardIndex = player.cards.findIndex(c => c.id === cardId);
  
  if (cardIndex === -1) {
    throw new Error('Card not found in player\'s hand');
  }
  
  const card = player.cards[cardIndex];
  
  // Check if player can play this card (must follow suit if possible)
  if (game.currentTrick && game.currentTrick.cards.length > 0) {
    const leadSuit = game.currentTrick.leadSuit;
    
    // Check if player has any cards of lead suit
    const hasSuit = player.cards.some(c => c.suit === leadSuit);
    
    // If player has lead suit but played card is different suit, reject
    if (hasSuit && card.suit !== leadSuit) {
      throw new Error(`Must follow lead suit (${leadSuit})`);
    }
  }
  
  // Create a new game state to modify
  const newGame: MoonBidGame = { ...game };
  
  // If this is the first card played in the trick, set lead suit
  if (!newGame.currentTrick || newGame.currentTrick.cards.length === 0) {
    newGame.currentTrick = {
      leadSuit: card.suit,
      cards: [],
      doublePoints: false,
      voidTrick: false
    };
  }
  
  // Add card to the current trick
  newGame.currentTrick.cards.push({
    playerId,
    card
  });
  
  // Remove card from player's hand
  newGame.players[playerIndex].cards = newGame.players[playerIndex].cards.filter(c => c.id !== cardId);
  
  // Process special powers
  if (card.power) {
    applyCardPower(newGame, playerId, card);
  }
  
  // Check if all players have played a card
  if (newGame.currentTrick.cards.length === newGame.players.length) {
    // Determine winner and update
    resolveTrick(newGame);
    
    // Start a new trick or end the round
    if (newGame.players.some(p => p.cards.length > 0)) {
      // Start new trick with winner leading
      const winnerId = newGame.completedTricks[newGame.completedTricks.length - 1].winner;
      const winnerIndex = newGame.players.findIndex(p => p.id === winnerId);
      
      newGame.currentPlayerIndex = winnerIndex;
      newGame.currentTrick = {
        leadSuit: 'stars', // Will be set when first card is played
        cards: [],
        doublePoints: false,
        voidTrick: false
      };
    } else {
      // End of round, calculate scores
      scoreRound(newGame);
      
      // Check if game is over
      if (newGame.roundNumber >= newGame.totalRounds) {
        finalizeGame(newGame);
      } else {
        // New round, reset and deal cards
        newGame.roundNumber++;
        newGame.currentPhase = 'bidding';
        newGame.currentPlayerIndex = 0;
        newGame.players.forEach(p => {
          p.tricks = 0;
          p.bid = 0;
          p.specialPowerUsed = false;
        });
        
        // Reshuffle deck with all cards
        newGame.deck = shuffleDeck(createMoonBidDeck());
        dealCards(newGame);
      }
    }
  } else {
    // Move to next player
    newGame.currentPlayerIndex = (newGame.currentPlayerIndex + 1) % newGame.players.length;
  }
  
  return newGame;
}

/**
 * Apply a card's special power
 * @param game Game state to modify
 * @param playerId Player playing the power card
 * @param card Card with power being played
 */
function applyCardPower(game: MoonBidGame, playerId: string, card: MoonCard): void {
  // Find player
  const player = game.players.find(p => p.id === playerId);
  if (!player) return;
  
  // Check if player has already used a special power
  if (player.specialPowerUsed) {
    // During Full Moon, players can use multiple powers
    if (game.moonPhase !== 'Full Moon') {
      return;
    }
  }
  
  // Mark power as used
  player.specialPowerUsed = true;
  
  // Apply power effect based on type
  switch (card.power) {
    case 'nullify':
      // Void the current trick - no points awarded
      if (game.currentTrick) {
        game.currentTrick.voidTrick = true;
      }
      break;
    
    case 'double':
      // Double points for this trick
      if (game.currentTrick) {
        game.currentTrick.doublePoints = true;
      }
      break;
    
    case 'illuminate':
      // Add lunar energy for all players
      game.players.forEach(p => {
        p.lunarFavor += 1;
      });
      // Add extra energy to game pool
      game.lunarEnergy += 5;
      break;
    
    case 'protect':
      // Protection is handled when resolving the trick
      // This is a passive effect
      break;
    
    case 'transform':
      // Transform this card's suit to the trump suit (if any)
      if (game.trumpSuit && game.currentTrick) {
        const playedCard = game.currentTrick.cards.find(c => c.playerId === playerId)?.card;
        if (playedCard) {
          playedCard.suit = game.trumpSuit;
        }
      }
      break;
    
    // More powers can be implemented as needed
  }
}

/**
 * Determine the winner of the current trick
 * @param game Game state to update
 */
function resolveTrick(game: MoonBidGame): void {
  if (!game.currentTrick || game.currentTrick.cards.length === 0) return;
  
  // Handle void trick
  if (game.currentTrick.voidTrick) {
    // Add to completed tricks but don't assign a winner
    game.completedTricks.push({
      ...game.currentTrick,
      winner: undefined
    });
    return;
  }
  
  const leadSuit = game.currentTrick.leadSuit;
  const trumpSuit = game.trumpSuit;
  
  // Find highest card
  let highestValue = -1;
  let winnerId: string | undefined = undefined;
  let winningCard: MoonCard | undefined = undefined;
  
  // First pass: check for trump cards if there's a trump suit
  if (trumpSuit) {
    for (const played of game.currentTrick.cards) {
      if (played.card.suit === trumpSuit) {
        const effectiveValue = played.card.isSpecial ? played.card.value + 10 : played.card.value;
        if (effectiveValue > highestValue) {
          highestValue = effectiveValue;
          winnerId = played.playerId;
          winningCard = played.card;
        }
      }
    }
  }
  
  // If no trump was played or no trump suit, check for lead suit
  if (winnerId === undefined) {
    highestValue = -1;
    for (const played of game.currentTrick.cards) {
      if (played.card.suit === leadSuit) {
        const effectiveValue = played.card.isSpecial ? played.card.value + 10 : played.card.value;
        if (effectiveValue > highestValue) {
          highestValue = effectiveValue;
          winnerId = played.playerId;
          winningCard = played.card;
        }
      }
    }
  }
  
  // Apply moon phase effects
  if (game.moonPhase === 'Last Quarter' && winnerId) {
    // Check for equal value cards canceling out
    const winningValue = winningCard?.value;
    const equalValueCards = game.currentTrick.cards.filter(played => 
      played.card.value === winningValue && played.playerId !== winnerId
    );
    
    if (equalValueCards.length > 0) {
      // Equal value cards cancel the winner
      winnerId = undefined;
    }
  }
  
  // Complete the trick
  game.completedTricks.push({
    ...game.currentTrick,
    winner: winnerId
  });
  
  // If there's a winner, update their trick count
  if (winnerId) {
    const winnerIndex = game.players.findIndex(p => p.id === winnerId);
    if (winnerIndex !== -1) {
      game.players[winnerIndex].tricks++;
      
      // Add lunar favor for the winner
      game.players[winnerIndex].lunarFavor++;
      
      // Add winning card to winner's collection
      if (winningCard) {
        game.players[winnerIndex].winningCards.push(winningCard);
      }
      
      // For cooperative mode, update team score
      if (game.gameMode === 'cooperative' && game.teamScore !== undefined) {
        game.teamScore++;
      }
    }
  }
}

/**
 * Score the round based on tricks won vs bids
 * @param game Game state to update
 */
function scoreRound(game: MoonBidGame): void {
  for (const player of game.players) {
    // Base score calculation
    const tricksTaken = player.tricks;
    const bidMade = player.bid;
    
    let roundScore = 0;
    
    // Different scoring rules by game mode
    if (game.gameMode === 'standard' || game.gameMode === 'eclipse' || game.gameMode === 'solstice' || game.gameMode === 'ancestral') {
      // Standard scoring: 10 points per trick bid and made, plus 1 per over
      if (tricksTaken >= bidMade) {
        roundScore = bidMade * 10 + (tricksTaken - bidMade);
      } else {
        // Failed bid penalty
        roundScore = -bidMade * 5;
      }
      
      // Exact bid bonus (especially with New Moon)
      if (tricksTaken === bidMade && bidMade > 0) {
        // Double bonus during New Moon
        const exactBidBonus = game.moonPhase === 'New Moon' ? 20 : 10;
        roundScore += exactBidBonus;
      }
    } else if (game.gameMode === 'equinox') {
      // Equinox scoring: Balance is key
      const totalTricks = game.completedTricks.length;
      const perfectBalance = totalTricks / 2;
      
      // How close to perfect balance?
      const balanceScore = 20 - Math.abs(tricksTaken - perfectBalance) * 5;
      roundScore = Math.max(0, balanceScore);
      
      // Perfect balance bonus
      if (tricksTaken === perfectBalance) {
        roundScore += 20;
      }
    } else if (game.gameMode === 'cooperative') {
      // In cooperative mode, individual scores based on role fulfillment
      // Players have different goals based on roles
      const role = player.role;
      
      if (role === 'Navigator' && tricksTaken === bidMade) {
        roundScore = 15; // Navigator guides the team path
      } else if (role === 'Guardian' && tricksTaken >= 1) {
        roundScore = 15; // Guardian must protect by winning tricks
      } else if (role === 'Channeler' && player.lunarFavor >= 3) {
        roundScore = 15; // Channeler collects lunar energy
      } else if (role === 'Diviner' && bidMade === 0 && tricksTaken === 0) {
        roundScore = 15; // Diviner predicts correctly by avoiding tricks
      }
    }
    
    // Apply lunar favor bonus
    roundScore += player.lunarFavor;
    
    // Update player's score
    player.score += roundScore;
  }
}

/**
 * Finalize the game and determine rewards
 * @param game Game state to update
 */
function finalizeGame(game: MoonBidGame): void {
  // Set phase to scoring (game over)
  game.currentPhase = 'scoring';
  
  // Determine rewards earned by each player
  for (const player of game.players) {
    // For each reward, check if player meets requirements
    for (const reward of game.rewards) {
      let earnedReward = false;
      
      switch (reward.requiredOutcome) {
        case 'Win at least 3 tricks':
          earnedReward = player.tricks >= 3;
          break;
        case 'Make your exact bid':
          earnedReward = player.tricks === player.bid;
          break;
        case 'Win a trick with the lowest card':
          earnedReward = player.winningCards.some(card => card.value === 1);
          break;
        case 'Win at least 5 tricks':
          earnedReward = player.tricks >= 5;
          break;
        case 'Be the first to win a trick':
          earnedReward = game.completedTricks.length > 0 && 
                        game.completedTricks[0].winner === player.id;
          break;
        case 'Win 3 tricks in a row':
          // Check for 3 consecutive tricks
          for (let i = 0; i < game.completedTricks.length - 2; i++) {
            if (game.completedTricks[i].winner === player.id &&
                game.completedTricks[i+1].winner === player.id &&
                game.completedTricks[i+2].winner === player.id) {
              earnedReward = true;
              break;
            }
          }
          break;
        // Add more reward conditions as needed
      }
      
      // Apply reward if earned
      if (earnedReward) {
        // For now, just track in game state
        // In a real implementation, would update player inventory
        
        // Double rewards during Full Moon
        const quantity = game.moonPhase === 'Full Moon' && reward.moonPhaseBonus === 'Full Moon'
                        ? reward.quantity * 2
                        : reward.quantity;
                        
        console.log(`Player ${player.name} earned reward: ${reward.name} (${quantity})`);
      }
    }
  }
  
  // Check for cooperative mode team win
  if (game.gameMode === 'cooperative' && game.teamScore !== undefined) {
    // Team needs a minimum score based on player count to win
    const requiredScore = game.players.length * 3;
    game.winningConditionMet = game.teamScore >= requiredScore;
  } else {
    // Individual play, just mark game as complete
    game.winningConditionMet = true;
  }
}

/**
 * Get the winner(s) of the game
 * @param game Completed game
 * @returns Object with winner information
 */
export function getGameWinners(game: MoonBidGame): {
  winnerIds: string[];
  winnerNames: string[];
  scores: number[];
  isTeamWin: boolean;
} {
  // For cooperative mode
  if (game.gameMode === 'cooperative') {
    if (game.winningConditionMet) {
      // Everyone wins in cooperative mode if condition met
      return {
        winnerIds: game.players.map(p => p.id),
        winnerNames: game.players.map(p => p.name),
        scores: [game.teamScore || 0],
        isTeamWin: true
      };
    } else {
      // No winners if team failed
      return {
        winnerIds: [],
        winnerNames: [],
        scores: [game.teamScore || 0],
        isTeamWin: true
      };
    }
  }
  
  // For competitive modes
  // Find highest score
  const highestScore = Math.max(...game.players.map(p => p.score));
  
  // Find all players with the highest score (could be ties)
  const winners = game.players.filter(p => p.score === highestScore);
  
  return {
    winnerIds: winners.map(w => w.id),
    winnerNames: winners.map(w => w.name),
    scores: winners.map(w => w.score),
    isTeamWin: false
  };
}