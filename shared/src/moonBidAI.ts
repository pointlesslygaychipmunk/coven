// shared/src/moonBidAI.ts
import { 
  MoonBidGame, 
  MoonCard,
  MoonCardSuit,
  MoonBidPlayer,
  Trick
} from './moonBidGame.js';

/**
 * AI difficulty levels
 */
export type AIDifficulty = 'novice' | 'adept' | 'expert' | 'witch-elder';

/**
 * Interface for AI opponent options
 */
export interface AIOpponentOptions {
  id: string;
  name: string;
  difficulty: AIDifficulty;
  personality?: 'cautious' | 'aggressive' | 'balanced' | 'unpredictable';
  favoredSuit?: MoonCardSuit;
  specialization?: string;
}

/**
 * Create an AI opponent with the given options
 * @param options AI opponent options
 * @returns AI player ID
 */
export function createAIOpponent(options: AIOpponentOptions): string {
  // In a real implementation, this would create an actual AI player
  // For now, we just return the ID so the frontend can simulate AI
  return options.id;
}

/**
 * Determine AI bid based on hand quality
 * @param game Current game state
 * @param aiPlayerId ID of the AI player
 * @param options AI opponent options
 * @returns The bid amount (number of tricks AI expects to win)
 */
export function getAIBid(
  game: MoonBidGame, 
  aiPlayerId: string,
  options: AIOpponentOptions
): number {
  const aiPlayer = game.players.find((p: MoonBidPlayer) => p.id === aiPlayerId);
  if (!aiPlayer) return 0;
  
  const aiCards = aiPlayer.cards;
  const handStrength = evaluateHandStrength(
    aiCards, 
    game.trumpSuit, 
    game.moonPhase, 
    game.season
  );
  
  // Base bid on hand strength, adjusted for difficulty
  let baseBid = Math.floor(handStrength * aiCards.length);
  
  // Apply difficulty modifiers
  switch (options.difficulty) {
    case 'novice':
      // Novice AI sometimes overbids or underbids
      baseBid = adjustBidByFactor(baseBid, 0.7, 1.3);
      break;
    
    case 'adept':
      // Adept AI makes more accurate bids
      baseBid = adjustBidByFactor(baseBid, 0.9, 1.1);
      break;
    
    case 'expert':
      // Expert AI makes very accurate bids
      baseBid = adjustBidByFactor(baseBid, 0.95, 1.05);
      break;
    
    case 'witch-elder':
      // Witch elder AI makes perfect bids
      // But occasionally makes strategic overbids or underbids
      if (Math.random() < 0.2) {
        // Strategic bid (20% chance)
        baseBid = Math.random() < 0.5 ? 
          Math.max(0, baseBid - 1) : // Underbid to sandbag
          baseBid + 1; // Overbid to block opponents
      }
      break;
  }
  
  // Apply personality modifiers
  if (options.personality === 'cautious') {
    baseBid = Math.floor(baseBid * 0.9);
  } else if (options.personality === 'aggressive') {
    baseBid = Math.ceil(baseBid * 1.1);
  } else if (options.personality === 'unpredictable') {
    // Randomly adjust by up to ±2 tricks
    baseBid += Math.floor(Math.random() * 5) - 2;
  }
  
  // Constrain to valid bid range
  return Math.max(0, Math.min(aiCards.length, baseBid));
}

/**
 * Helper function to adjust bid by a random factor within range
 */
function adjustBidByFactor(bid: number, minFactor: number, maxFactor: number): number {
  const factor = minFactor + Math.random() * (maxFactor - minFactor);
  return Math.round(bid * factor);
}

/**
 * Evaluate the strength of an AI hand (0.0 to 1.0)
 * @param cards AI player's cards
 * @param trumpSuit Current trump suit
 * @param moonPhase Current moon phase
 * @param season Current season
 * @returns Hand strength as a value from 0.0 (weakest) to 1.0 (strongest)
 */
function evaluateHandStrength(
  cards: MoonCard[], 
  trumpSuit?: MoonCardSuit,
  moonPhase?: string,
  season?: string
): number {
  if (cards.length === 0) return 0;
  
  let totalStrength = 0;
  
  // Analyze each card
  cards.forEach(card => {
    let cardStrength = card.value / 13; // Base value (0.08 to 1.0)
    
    // Trump bonus
    if (trumpSuit && card.suit === trumpSuit) {
      cardStrength *= 1.5;
    }
    
    // Special card bonus
    if (card.isSpecial) {
      cardStrength *= 1.2;
    }
    
    // Moon phase affinity bonus
    if (moonPhase && card.moonAffinity === moonPhase) {
      cardStrength *= 1.2;
    }
    
    // Season affinity bonus (simplified)
    if (season && card.seasonalAffinity === season) {
      cardStrength *= 1.1;
    }
    
    totalStrength += cardStrength;
  });
  
  // Normalize to 0.0-1.0 range
  return totalStrength / (cards.length * 1.5); // 1.5 is max theoretical card strength
}

/**
 * Determine which card the AI should play
 * @param game Current game state
 * @param aiPlayerId ID of the AI player
 * @param options AI opponent options
 * @returns ID of the card to play
 */
export function getAICardPlay(
  game: MoonBidGame, 
  aiPlayerId: string,
  options: AIOpponentOptions
): string {
  const aiPlayer = game.players.find((p: MoonBidPlayer) => p.id === aiPlayerId);
  if (!aiPlayer || aiPlayer.cards.length === 0) {
    return '';
  }
  
  // Get valid cards that can be played
  const validCards = getValidCardsToPlay(game, aiPlayer);
  if (validCards.length === 0) return '';
  if (validCards.length === 1) return validCards[0].id;
  
  // Different strategies based on whether this is the first card or not
  if (!game.currentTrick || game.currentTrick.cards.length === 0) {
    // This is the first card in the trick - lead with a good card
    return chooseLeadCard(validCards, aiPlayer, game, options);
  } else {
    // Following another card - choose best response
    return chooseResponseCard(validCards, aiPlayer, game, options);
  }
}

/**
 * Get valid cards that can be played based on game rules
 */
function getValidCardsToPlay(game: MoonBidGame, player: MoonBidPlayer): MoonCard[] {
  // If no trick started yet, all cards are valid
  if (!game.currentTrick || game.currentTrick.cards.length === 0) {
    return [...player.cards];
  }
  
  // Must follow lead suit if possible
  const leadSuit = game.currentTrick.leadSuit;
  const hasSuit = player.cards.some((c: MoonCard) => c.suit === leadSuit);
  
  if (hasSuit) {
    // Must play the lead suit
    return player.cards.filter((c: MoonCard) => c.suit === leadSuit);
  } else {
    // Can play any card
    return [...player.cards];
  }
}

/**
 * Choose a card to lead with
 */
function chooseLeadCard(
  validCards: MoonCard[], 
  player: MoonBidPlayer, 
  game: MoonBidGame, 
  options: AIOpponentOptions
): string {
  // For the first trick, AI strategy depends on difficulty and bid
  const remainingTricks = player.bid - player.tricks;
  
  // Different strategy based on difficulty
  switch (options.difficulty) {
    case 'novice':
      // Novice plays somewhat randomly with preference for high cards
      if (Math.random() < 0.3) {
        // 30% chance to play randomly
        return validCards[Math.floor(Math.random() * validCards.length)].id;
      } else {
        // 70% chance to play high card or trump
        return findHighValueCard(validCards, game.trumpSuit).id;
      }
    
    case 'adept':
      // Adept tries to win if needed, otherwise plays low
      if (remainingTricks > 0) {
        // Need to win more tricks - play strong card
        return findHighValueCard(validCards, game.trumpSuit).id;
      } else {
        // Don't need more tricks - play low card
        return findLowValueCard(validCards).id;
      }
    
    case 'expert':
    case 'witch-elder':
      // Expert and witch-elder use sophisticated strategy
      if (remainingTricks > 0) {
        // Need more tricks
        if (player.bid >= player.cards.length * 0.7) {
          // High bid - lead with trump or high card
          return findHighValueCard(validCards, game.trumpSuit).id;
        } else {
          // Medium bid - lead with mid-high power card
          return findMidValueCard(validCards, game.trumpSuit).id;
        }
      } else if (remainingTricks === 0) {
        // Already met bid - play low card
        return findLowValueCard(validCards).id;
      } else {
        // Overbid - try to minimize damage with mid cards
        return findMidValueCard(validCards, game.trumpSuit).id;
      }
  }
  
  // Fallback to highest card
  return findHighValueCard(validCards).id;
}

/**
 * Choose a card to respond to another card
 */
function chooseResponseCard(
  validCards: MoonCard[], 
  player: MoonBidPlayer, 
  game: MoonBidGame, 
  options: AIOpponentOptions
): string {
  if (!game.currentTrick) return validCards[0].id;
  
  const remainingTricks = player.bid - player.tricks;
  const currentWinningCard = findCurrentWinningCard(game.currentTrick, game.trumpSuit);
  const canWinTrick = canBeatCard(validCards, currentWinningCard, game.trumpSuit);
  
  // Different strategy based on difficulty
  switch (options.difficulty) {
    case 'novice':
      // Novice always tries to win if possible
      if (canWinTrick) {
        return findLowestWinningCard(validCards, currentWinningCard, game.trumpSuit).id;
      } else {
        return findLowValueCard(validCards).id;
      }
    
    case 'adept':
      // Adept tries to win if needed, otherwise plays low
      if (remainingTricks > 0 && canWinTrick) {
        return findLowestWinningCard(validCards, currentWinningCard, game.trumpSuit).id;
      } else {
        return findLowValueCard(validCards).id;
      }
    
    case 'expert':
    case 'witch-elder':
      // Expert and witch-elder use sophisticated strategy
      if (remainingTricks > 0 && canWinTrick) {
        // Need more tricks and can win
        if (game.currentTrick.cards.length === game.players.length - 1) {
          // Last to play - use lowest winning card
          return findLowestWinningCard(validCards, currentWinningCard, game.trumpSuit).id;
        } else {
          // Not last to play - use stronger card to ensure win
          return findStrongWinningCard(validCards, currentWinningCard, game.trumpSuit).id;
        }
      } else if (remainingTricks <= 0 || !canWinTrick) {
        // Don't need more tricks or can't win
        // Play lowest card or try to stick high card to opponent
        if (game.currentTrick.cards.length === game.players.length - 1 && 
            currentWinningCard.card.value >= 10) {
          // Last to play and opponent has high card - dump our high card
          const highCards = validCards.filter(c => c.value >= 10);
          if (highCards.length > 0) {
            return highCards[0].id;
          }
        }
        return findLowValueCard(validCards).id;
      }
  }
  
  // Fallback to lowest card
  return findLowValueCard(validCards).id;
}

/**
 * Find current winning card in a trick
 */
function findCurrentWinningCard(trick: Trick, trumpSuit?: MoonCardSuit): { 
  playerId: string; 
  card: MoonCard;
  index: number;
} {
  if (trick.cards.length === 0) {
    throw new Error('No cards in trick');
  }
  
  let highestCard = trick.cards[0];
  let highestIndex = 0;
  let highestValue = getEffectiveCardValue(highestCard.card, trick.leadSuit, trumpSuit);
  
  for (let i = 1; i < trick.cards.length; i++) {
    const playedCard = trick.cards[i];
    const cardValue = getEffectiveCardValue(playedCard.card, trick.leadSuit, trumpSuit);
    
    if (cardValue > highestValue) {
      highestCard = playedCard;
      highestValue = cardValue;
      highestIndex = i;
    }
  }
  
  return { 
    playerId: highestCard.playerId, 
    card: highestCard.card,
    index: highestIndex
  };
}

/**
 * Get effective value of a card in the current trick context
 */
function getEffectiveCardValue(
  card: MoonCard, 
  leadSuit: MoonCardSuit, 
  trumpSuit?: MoonCardSuit
): number {
  // Trump suit beats all other suits
  if (trumpSuit && card.suit === trumpSuit) {
    return card.value + 100; // Ensure trumps beat all non-trumps
  }
  
  // Lead suit beats other non-trump suits
  if (card.suit === leadSuit) {
    return card.value;
  }
  
  // Off-suit non-trump cards lose
  return -1;
}

/**
 * Check if any card can beat the current winning card
 */
function canBeatCard(
  cards: MoonCard[], 
  winningPlay: { card: MoonCard }, 
  _trumpSuit?: MoonCardSuit // Prefixed with underscore to indicate unused parameter
): boolean {
  return cards.some(card => {
    // Trump beats non-trump
    if (_trumpSuit && card.suit === _trumpSuit && winningPlay.card.suit !== _trumpSuit) {
      return true;
    }
    
    // Higher card of same suit wins
    if (card.suit === winningPlay.card.suit && card.value > winningPlay.card.value) {
      return true;
    }
    
    return false;
  });
}

/**
 * Find the lowest card that can still win against current winning card
 */
function findLowestWinningCard(
  cards: MoonCard[], 
  winningPlay: { card: MoonCard }, 
  trumpSuit?: MoonCardSuit
): MoonCard {
  // First, check if we can play a trump
  if (trumpSuit && winningPlay.card.suit !== trumpSuit) {
    const trumpCards = cards.filter(c => c.suit === trumpSuit);
    if (trumpCards.length > 0) {
      // Return lowest trump
      return trumpCards.reduce((lowest, card) => 
        card.value < lowest.value ? card : lowest, trumpCards[0]);
    }
  }
  
  // Find higher cards of the same suit
  const higherSameSuit = cards.filter(card => 
    card.suit === winningPlay.card.suit && card.value > winningPlay.card.value
  );
  
  if (higherSameSuit.length > 0) {
    // Return lowest of the higher cards
    return higherSameSuit.reduce((lowest, card) => 
      card.value < lowest.value ? card : lowest, higherSameSuit[0]);
  }
  
  // If we can't win, return the lowest card
  return findLowValueCard(cards);
}

/**
 * Find a stronger winning card (not necessarily the lowest that can win)
 */
function findStrongWinningCard(
  cards: MoonCard[], 
  winningPlay: { card: MoonCard }, 
  trumpSuit?: MoonCardSuit
): MoonCard {
  // First, check if we need to use a trump
  if (trumpSuit && winningPlay.card.suit !== trumpSuit) {
    const trumpCards = cards.filter(c => c.suit === trumpSuit);
    if (trumpCards.length > 0) {
      // Use mid-strength trump
      trumpCards.sort((a, b) => a.value - b.value);
      return trumpCards[Math.min(Math.floor(trumpCards.length / 2), trumpCards.length - 1)];
    }
  }
  
  // Find higher cards of the same suit
  const higherSameSuit = cards.filter(card => 
    card.suit === winningPlay.card.suit && card.value > winningPlay.card.value
  );
  
  if (higherSameSuit.length > 0) {
    // Use a stronger card to ensure win
    higherSameSuit.sort((a, b) => a.value - b.value);
    // If we have multiple options, don't use our strongest
    if (higherSameSuit.length > 1) {
      return higherSameSuit[Math.min(Math.floor(higherSameSuit.length / 2), higherSameSuit.length - 1)];
    }
    return higherSameSuit[0];
  }
  
  // If we can't win, return the lowest card
  return findLowValueCard(cards);
}

/**
 * Find the highest value card in a hand
 */
function findHighValueCard(cards: MoonCard[], trumpSuit?: MoonCardSuit): MoonCard {
  // Prioritize high trump cards
  if (trumpSuit) {
    const trumpCards = cards.filter(c => c.suit === trumpSuit);
    if (trumpCards.length > 0) {
      return trumpCards.reduce((highest, card) => 
        card.value > highest.value ? card : highest, trumpCards[0]);
    }
  }
  
  // Otherwise return highest card
  return cards.reduce((highest, card) => 
    card.value > highest.value ? card : highest, cards[0]);
}

/**
 * Find a mid-value card in a hand
 */
function findMidValueCard(cards: MoonCard[], _trumpSuit?: MoonCardSuit): MoonCard { // Prefix with underscore to indicate unused parameter
  // Sort cards by value
  const sortedCards = [...cards].sort((a, b) => a.value - b.value);
  
  // Return a card from the middle
  return sortedCards[Math.floor(sortedCards.length / 2)];
}

/**
 * Find the lowest value card in a hand
 */
function findLowValueCard(cards: MoonCard[]): MoonCard {
  return cards.reduce((lowest, card) => 
    card.value < lowest.value ? card : lowest, cards[0]);
}