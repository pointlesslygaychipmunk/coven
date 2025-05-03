import React, { useState, useEffect } from 'react';
import './MoonBidGame.css';
import { 
  MoonBidGame as MoonBidGameType,
  MoonCard,
  MoonCardSuit,
  CardPower,
  GameMode,
  MoonBidPlayer,
  Trick,
  initializeMoonBidGame,
  placeBid,
  playCard,
  getGameWinners,
  MOON_PHASE_EFFECTS,
  SEASON_EFFECTS,
  GAME_MODES
} from 'coven-shared/src/moonBidGame';
import { 
  PlayerDeck,
  createDefaultDeck,
  createSpecializedDeck
} from 'coven-shared/src/moonBidDeckbuilding';
import { MoonPhase, Season } from 'coven-shared';
import MoonBidDeckManager from './MoonBidDeckManager';

// Component props
interface MoonBidGameProps {
  playerName: string;
  playerId: string;
  currentMoonPhase: MoonPhase;
  currentSeason: Season;
  opponentNames?: string[]; // Optional for single player mode
  opponentIds?: string[];
  playerSpecialization?: string; // For specialized decks
  playerInventory?: Array<{ id: string; quantity: number; category: string }>; // For crafting cards
  playerEssence?: number;
  playerMana?: number;
  playerGold?: number;
  onGameComplete: (rewards: any) => void;
  onClose: () => void;
  // Optional function to save decks for persistence between sessions
  onSaveDecks?: (decks: PlayerDeck[]) => void;
}

const MoonBidGame: React.FC<MoonBidGameProps> = ({
  playerName,
  playerId,
  currentMoonPhase,
  currentSeason,
  opponentNames = ["AI Opponent 1", "AI Opponent 2"],
  opponentIds = ["ai1", "ai2"],
  playerSpecialization = '',
  playerInventory = [],
  playerEssence = 0,
  playerMana = 0,
  playerGold = 0,
  onGameComplete,
  onClose,
  onSaveDecks = () => {}
}) => {
  // Game state
  const [game, setGame] = useState<MoonBidGameType | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode>('standard');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [gamePhase, setGamePhase] = useState<'setup' | 'bidding' | 'playing' | 'scoring'>('setup');
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(false);
  const [gameMessages, setGameMessages] = useState<string[]>([]);
  const [showRewards, setShowRewards] = useState<boolean>(false);
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  
  // Deck management state
  const [playerDecks, setPlayerDecks] = useState<PlayerDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<PlayerDeck | null>(null);
  const [showDeckManager, setShowDeckManager] = useState<boolean>(false);
  
  // Visual effects state
  const [animatingCard, setAnimatingCard] = useState<string | null>(null);
  const [highlightedCards, setHighlightedCards] = useState<string[]>([]);
  const [showTrickWinner, setShowTrickWinner] = useState<boolean>(false);
  const [trickWinnerName, setTrickWinnerName] = useState<string>('');
  
  // Initialize player decks
  useEffect(() => {
    // Load a default deck if none exists
    if (playerDecks.length === 0) {
      const defaultDeck = createDefaultDeck(playerId, playerName);
      
      let initialDecks = [defaultDeck];
      
      // Add a specialized deck if player has a specialization
      if (playerSpecialization) {
        const specializedDeck = createSpecializedDeck(
          playerId, 
          playerName, 
          playerSpecialization
        );
        initialDecks.push(specializedDeck);
      }
      
      setPlayerDecks(initialDecks);
      setSelectedDeck(defaultDeck);
    }
  }, [playerName, playerId, playerSpecialization, playerDecks.length]);

  // Handle deck selection
  const handleDeckSelect = (deck: PlayerDeck) => {
    setSelectedDeck(deck);
    setShowDeckManager(false);
  };

  // Handle saving decks
  const handleSaveDecks = (decks: PlayerDeck[]) => {
    setPlayerDecks(decks);
    onSaveDecks(decks);
  };
  
  // Initialize a new game
  const startNewGame = () => {
    if (!selectedDeck) {
      addGameMessage("Please select a deck before starting the game.");
      return;
    }
    
    const allPlayerIds = [playerId, ...opponentIds];
    const allPlayerNames = [playerName, ...opponentNames];
    
    // Initialize game with current moon phase and season
    const newGame = initializeMoonBidGame(
      allPlayerIds,
      allPlayerNames,
      currentMoonPhase,
      currentSeason,
      selectedMode
    );
    
    // In a full implementation, we would modify the game initialization 
    // to use the selected deck's cards instead of the default deck
    
    setGame(newGame);
    setGamePhase('bidding');
    addGameMessage(`Starting a new ${selectedMode} Moon Bid game with the "${selectedDeck.name}" deck.`);
    addGameMessage(`Current moon phase: ${currentMoonPhase} in ${currentSeason}.`);
    addGameMessage(`Trump suit: ${newGame.trumpSuit || 'None'}`);
    
    // Update deck play count
    const updatedDecks = playerDecks.map(deck => 
      deck.id === selectedDeck.id 
        ? { ...deck, playCount: deck.playCount + 1 }
        : deck
    );
    setPlayerDecks(updatedDecks);
    onSaveDecks(updatedDecks);
    
    // Check if player goes first
    setIsPlayerTurn(newGame.currentPlayerIndex === 0);
  };
  
  // Add a message to the game log
  const addGameMessage = (message: string) => {
    setGameMessages(prev => [...prev, message]);
  };
  
  // Handle bidding
  const handleBid = async () => {
    if (!game) return;
    
    try {
      // Place player's bid
      const updatedGame = placeBid(game, playerId, bidAmount);
      setGame(updatedGame);
      addGameMessage(`You bid ${bidAmount} tricks.`);
      
      // If all players have bid, game phase will change
      if (updatedGame.currentPhase === 'playing') {
        setGamePhase('playing');
        addGameMessage('All players have placed their bids. Begin playing cards.');
        setIsPlayerTurn(updatedGame.currentPlayerIndex === 0);
      } else {
        // AI opponents bid
        await processAiBids(updatedGame);
      }
    } catch (error) {
      addGameMessage(`Error: ${error instanceof Error ? error.message : 'Failed to place bid'}`);
    }
  };
  
  // Handle playing a card
  const handlePlayCard = async () => {
    if (!game || !selectedCard) return;
    
    try {
      // Play the selected card
      const updatedGame = playCard(game, playerId, selectedCard);
      setGame(updatedGame);
      
      // Find the card that was played for messaging
      const playerIndex = game.players.findIndex(p => p.id === playerId);
      const playedCard = game.players[playerIndex].cards.find(c => c.id === selectedCard);
      
      if (playedCard) {
        addGameMessage(`You played ${playedCard.name}.`);
        setAnimatingCard(selectedCard);
        
        // Clear selection after animation
        setTimeout(() => {
          setAnimatingCard(null);
          setSelectedCard(null);
        }, 1000);
      }
      
      // Check if trick is complete
      if (updatedGame.completedTricks.length > game.completedTricks.length) {
        const latestTrick = updatedGame.completedTricks[updatedGame.completedTricks.length - 1];
        if (latestTrick.winner) {
          const winnerIndex = updatedGame.players.findIndex(p => p.id === latestTrick.winner);
          if (winnerIndex !== -1) {
            const winnerName = updatedGame.players[winnerIndex].name;
            setTrickWinnerName(winnerName);
            setShowTrickWinner(true);
            addGameMessage(`${winnerName} won the trick!`);
            
            // Hide winner notification after a moment
            setTimeout(() => {
              setShowTrickWinner(false);
            }, 2000);
          }
        } else {
          addGameMessage('The trick ended with no winner.');
        }
      }
      
      // Check if the phase has changed to scoring (game over)
      if (updatedGame.currentPhase === 'scoring') {
        setGamePhase('scoring');
        handleGameComplete(updatedGame);
      } else {
        // Process AI turns if needed
        await processAiTurns(updatedGame);
      }
    } catch (error) {
      addGameMessage(`Error: ${error instanceof Error ? error.message : 'Failed to play card'}`);
    }
  };
  
  // Process AI bidding
  const processAiBids = async (currentGame: MoonBidGameType) => {
    let updatedGame = { ...currentGame };
    setAiThinking(true);
    
    // Keep processing AI bids until it's the player's turn or all bids are placed
    while (updatedGame.currentPhase === 'bidding' && 
           updatedGame.players[updatedGame.currentPlayerIndex].id !== playerId) {
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for animation
      
      const aiPlayer = updatedGame.players[updatedGame.currentPlayerIndex];
      
      // Simple AI bidding logic - bid 1/3 of cards rounded up
      const aiBid = Math.max(1, Math.ceil(aiPlayer.cards.length / 3));
      
      updatedGame = placeBid(updatedGame, aiPlayer.id, aiBid);
      addGameMessage(`${aiPlayer.name} bids ${aiBid} tricks.`);
      
      setGame(updatedGame);
    }
    
    setAiThinking(false);
    setIsPlayerTurn(updatedGame.currentPlayerIndex === 0);
    
    // If all players have bid, move to playing phase
    if (updatedGame.currentPhase === 'playing') {
      setGamePhase('playing');
      addGameMessage('All players have placed their bids. Begin playing cards.');
    }
  };
  
  // Process AI card playing
  const processAiTurns = async (currentGame: MoonBidGameType) => {
    let updatedGame = { ...currentGame };
    setAiThinking(true);
    
    // Keep processing AI turns until it's the player's turn or game is over
    while (updatedGame.currentPhase === 'playing' && 
           updatedGame.players[updatedGame.currentPlayerIndex].id !== playerId) {
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Delay for animation
      
      const aiPlayer = updatedGame.players[updatedGame.currentPlayerIndex];
      
      if (aiPlayer.cards.length === 0) break;
      
      // Simple AI card selection logic
      let cardToPlay: MoonCard;
      
      if (updatedGame.currentTrick && updatedGame.currentTrick.cards.length > 0) {
        // Must follow suit if possible
        const leadSuit = updatedGame.currentTrick.leadSuit;
        const followSuitCards = aiPlayer.cards.filter(c => c.suit === leadSuit);
        
        if (followSuitCards.length > 0) {
          // Play highest card of lead suit to try to win trick
          cardToPlay = followSuitCards.reduce((highest, card) => 
            card.value > highest.value ? card : highest, followSuitCards[0]);
        } else {
          // Can't follow suit, play lowest card from hand
          cardToPlay = aiPlayer.cards.reduce((lowest, card) => 
            card.value < lowest.value ? card : lowest, aiPlayer.cards[0]);
        }
      } else {
        // Leading the trick - play highest card
        cardToPlay = aiPlayer.cards.reduce((highest, card) => 
          card.value > highest.value ? card : highest, aiPlayer.cards[0]);
      }
      
      // Play the selected card
      updatedGame = playCard(updatedGame, aiPlayer.id, cardToPlay.id);
      addGameMessage(`${aiPlayer.name} played ${cardToPlay.name}.`);
      
      // Show the card being played with animation
      setAnimatingCard(cardToPlay.id);
      setTimeout(() => setAnimatingCard(null), 1000);
      
      // Check for trick completion
      if (updatedGame.completedTricks.length > currentGame.completedTricks.length) {
        const latestTrick = updatedGame.completedTricks[updatedGame.completedTricks.length - 1];
        if (latestTrick.winner) {
          const winnerIndex = updatedGame.players.findIndex(p => p.id === latestTrick.winner);
          if (winnerIndex !== -1) {
            const winnerName = updatedGame.players[winnerIndex].name;
            setTrickWinnerName(winnerName);
            setShowTrickWinner(true);
            addGameMessage(`${winnerName} won the trick!`);
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            setShowTrickWinner(false);
          }
        } else {
          addGameMessage('The trick ended with no winner.');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setGame(updatedGame);
      
      // Check if game is over
      if (updatedGame.currentPhase === 'scoring') {
        setGamePhase('scoring');
        handleGameComplete(updatedGame);
        break;
      }
    }
    
    setAiThinking(false);
    setIsPlayerTurn(updatedGame.currentPlayerIndex === 0);
  };
  
  // Handle game completion and calculate rewards
  const handleGameComplete = (completedGame: MoonBidGameType) => {
    const winners = getGameWinners(completedGame);
    
    if (winners.winnerIds.includes(playerId)) {
      addGameMessage('Congratulations! You won the Moon Bid game!');
    } else if (winners.isTeamWin && completedGame.winningConditionMet) {
      addGameMessage('Your team successfully completed the challenge!');
    } else {
      addGameMessage('Game over! Better luck next time.');
    }
    
    // Display score information
    completedGame.players.forEach(player => {
      addGameMessage(`${player.name}: Score ${player.score}, Tricks ${player.tricks}, Bid ${player.bid}`);
    });
    
    // Show rewards
    setShowRewards(true);
    
    // Simple reward calculation for now - will be expanded later
    const playerRewards = {
      mana: winners.winnerIds.includes(playerId) ? 30 : 10,
      essence: winners.winnerIds.includes(playerId) ? 2 : 0,
      gold: completedGame.players.find(p => p.id === playerId)?.score || 0,
      specialItems: winners.winnerIds.includes(playerId) ? ['Moon-Blessed Card'] : []
    };
    
    // Pass rewards back to parent component
    onGameComplete(playerRewards);
  };
  
  // Get the CSS class for a card based on its suit
  const getCardSuitClass = (suit: MoonCardSuit) => {
    return `card-${suit.toLowerCase()}`;
  };
  
  // Render a card
  const renderCard = (card: MoonCard, isPlayable: boolean, isInHand: boolean) => {
    // Determine card appearance classes
    const cardClasses = [
      'moon-card',
      getCardSuitClass(card.suit),
      card.isSpecial ? 'special-card' : '',
      selectedCard === card.id ? 'selected-card' : '',
      isPlayable ? 'playable-card' : '',
      animatingCard === card.id ? 'animating-card' : '',
      isInHand ? 'hand-card' : 'played-card'
    ].join(' ');
    
    return (
      <div 
        key={card.id}
        className={cardClasses}
        onClick={() => isPlayable && setSelectedCard(isPlayable ? card.id : null)}
      >
        <div className="card-value">{card.value}</div>
        <div className="card-suit">{getSuitSymbol(card.suit)}</div>
        <div className="card-name">{card.name}</div>
        {card.power && <div className="card-power">{getPowerSymbol(card.power)}</div>}
        {card.moonAffinity && (
          <div className="card-affinity moon">
            {getMoonPhaseSymbol(card.moonAffinity)}
          </div>
        )}
        {card.elementalAffinity && (
          <div className="card-affinity elemental">
            {getElementSymbol(card.elementalAffinity)}
          </div>
        )}
        {card.isSpecial && <div className="card-special-badge">✦</div>}
      </div>
    );
  };
  
  // Helper function to get suit symbol
  const getSuitSymbol = (suit: MoonCardSuit): string => {
    switch (suit) {
      case 'stars': return '★';
      case 'herbs': return '☘';
      case 'potions': return '⚗';
      case 'crystals': return '💎';
      default: return '';
    }
  };
  
  // Helper function to get power symbol
  const getPowerSymbol = (power: CardPower): string => {
    switch (power) {
      case 'nullify': return '✖';
      case 'double': return '✕2';
      case 'steal': return '👑';
      case 'predict': return '👁';
      case 'swap': return '🔄';
      case 'illuminate': return '✨';
      case 'duplicate': return '➖';
      case 'transform': return '🔮';
      case 'protect': return '🛡';
      case 'reveal': return '📖';
      default: return '';
    }
  };
  
  // Helper function to get moon phase symbol
  const getMoonPhaseSymbol = (phase: MoonPhase): string => {
    switch (phase) {
      case 'New Moon': return '🌑';
      case 'Waxing Crescent': return '🌒';
      case 'First Quarter': return '🌓';
      case 'Waxing Gibbous': return '🌔';
      case 'Full Moon': return '🌕';
      case 'Waning Gibbous': return '🌖';
      case 'Last Quarter': return '🌗';
      case 'Waning Crescent': return '🌘';
      default: return '🌙';
    }
  };
  
  // Helper function to get element symbol
  const getElementSymbol = (element: string): string => {
    switch (element) {
      case 'Earth': return '🌱';
      case 'Water': return '💧';
      case 'Fire': return '🔥';
      case 'Air': return '💨';
      case 'Spirit': return '✨';
      default: return '';
    }
  };
  
  // Check if it's the player's turn
  useEffect(() => {
    if (game) {
      const playerIndex = game.players.findIndex(p => p.id === playerId);
      setIsPlayerTurn(game.currentPlayerIndex === playerIndex);
    }
  }, [game, playerId]);
  
  // Process AI turns when game state changes
  useEffect(() => {
    const processAiActions = async () => {
      if (game && !isPlayerTurn) {
        if (game.currentPhase === 'bidding') {
          await processAiBids(game);
        } else if (game.currentPhase === 'playing') {
          await processAiTurns(game);
        }
      }
    };
    
    processAiActions();
  }, [game, isPlayerTurn]);
  
  // Determine which cards are playable based on game rules
  const getPlayableCards = (): MoonCard[] => {
    if (!game || !isPlayerTurn || game.currentPhase !== 'playing') return [];
    
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return [];
    
    const playerCards = game.players[playerIndex].cards;
    
    // If no current trick or no cards played yet, all cards are playable
    if (!game.currentTrick || game.currentTrick.cards.length === 0) {
      return playerCards;
    }
    
    // Otherwise must follow suit if possible
    const leadSuit = game.currentTrick.leadSuit;
    const sameSuitCards = playerCards.filter(card => card.suit === leadSuit);
    
    // If player has cards of the lead suit, only those can be played
    return sameSuitCards.length > 0 ? sameSuitCards : playerCards;
  };
  
  // Get player's current hand
  const getPlayerHand = (): MoonCard[] => {
    if (!game) return [];
    
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return [];
    
    return game.players[playerIndex].cards;
  };
  
  // Get the current trick cards
  const getCurrentTrickCards = (): {playerId: string, card: MoonCard}[] => {
    if (!game || !game.currentTrick) return [];
    return game.currentTrick.cards;
  };
  
  // Render the game setup screen
  const renderSetupScreen = () => (
    <div className="moon-bid-setup">
      <h2>Moon Bid Card Game</h2>
      <p className="game-description">
        Test your strategic skills in this lunar-influenced card game where you'll bid on tricks 
        and use special powers aligned with the moon phases.
      </p>
      
      <div className="deck-selection">
        <h3>Your Deck</h3>
        <div className="selected-deck-display">
          {selectedDeck ? (
            <div className="deck-info">
              <div 
                className="deck-art" 
                style={{ backgroundImage: `url(${selectedDeck.deckArt || '/assets/cards/deck_art/default.png'})` }}
              ></div>
              <div className="deck-details">
                <h4>{selectedDeck.name}</h4>
                <p>{selectedDeck.description}</p>
                <div className="deck-stats">
                  <div className="deck-stat">
                    <span>Cards:</span> 
                    <span>{selectedDeck.coreCards.length + selectedDeck.customCards.length}</span>
                  </div>
                  <div className="deck-stat">
                    <span>Lunar Alignment:</span> 
                    <span 
                      className={selectedDeck.lunarAlignment === currentMoonPhase ? 'aligned' : ''}
                    >
                      {selectedDeck.lunarAlignment}
                      {selectedDeck.lunarAlignment === currentMoonPhase && ' ✨'}
                    </span>
                  </div>
                  <div className="deck-stat">
                    <span>Win Rate:</span> 
                    <span>
                      {selectedDeck.playCount > 0 
                        ? `${Math.round((selectedDeck.winCount / selectedDeck.playCount) * 100)}%` 
                        : '0%'} 
                      ({selectedDeck.winCount}/{selectedDeck.playCount})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-deck-selected">
              <p>No deck selected. Please select or create a deck.</p>
            </div>
          )}
          
          <button 
            className="manage-decks-button" 
            onClick={() => setShowDeckManager(true)}
          >
            Manage Decks
          </button>
        </div>
      </div>
      
      <div className="game-mode-selection">
        <h3>Select Game Mode</h3>
        <div className="mode-options">
          {Object.entries(GAME_MODES).map(([mode, details]) => (
            <div 
              key={mode}
              className={`mode-option ${selectedMode === mode ? 'selected' : ''}`}
              onClick={() => setSelectedMode(mode as GameMode)}
            >
              <h4>{mode.charAt(0).toUpperCase() + mode.slice(1)}</h4>
              <p>{details.description}</p>
              <div className="mode-details">
                <span>Players: {details.playerCount[0]}-{details.playerCount[1]}</span>
                <span>Special Cards: {details.specialCards ? 'Yes' : 'No'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="cosmic-influences">
        <div className="cosmic-influence moon-influence">
          <h3>Current Moon Phase: {currentMoonPhase}</h3>
          <div className="moon-phase-icon">{getMoonPhaseSymbol(currentMoonPhase)}</div>
          <p>{MOON_PHASE_EFFECTS[currentMoonPhase].description}</p>
          <p className="special-rule">Special Rule: {MOON_PHASE_EFFECTS[currentMoonPhase].specialRule}</p>
        </div>
        
        <div className="cosmic-influence season-influence">
          <h3>Current Season: {currentSeason}</h3>
          <p>{SEASON_EFFECTS[currentSeason].description}</p>
          <p className="special-rule">Special Rule: {SEASON_EFFECTS[currentSeason].specialRule}</p>
        </div>
      </div>
      
      <div className="setup-actions">
        <button 
          className="start-game-button" 
          onClick={startNewGame}
          disabled={!selectedDeck}
        >
          Start Game
        </button>
        <button className="rules-button" onClick={() => setShowRules(true)}>
          View Rules
        </button>
        <button className="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
  
  // Render the bidding phase UI
  const renderBiddingPhase = () => {
    if (!game) return null;
    
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return null;
    
    const playerHand = game.players[playerIndex].cards;
    const maxBid = playerHand.length;
    
    return (
      <div className="bidding-phase">
        <h3>Bidding Phase</h3>
        <p className="phase-description">
          How many tricks do you think you'll win with your hand?
        </p>
        
        <div className="player-hand">
          <h4>Your Hand ({playerHand.length} cards)</h4>
          <div className="hand-cards">
            {playerHand.map(card => renderCard(card, false, true))}
          </div>
        </div>
        
        <div className="bid-controls">
          <label htmlFor="bid-amount">Your Bid:</label>
          <div className="bid-input-group">
            <button 
              className="bid-adjust" 
              onClick={() => setBidAmount(Math.max(0, bidAmount - 1))}
              disabled={bidAmount <= 0}
            >
              -
            </button>
            <input 
              id="bid-amount"
              type="number" 
              min="0" 
              max={maxBid}
              value={bidAmount}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= maxBid) {
                  setBidAmount(value);
                }
              }}
            />
            <button 
              className="bid-adjust" 
              onClick={() => setBidAmount(Math.min(maxBid, bidAmount + 1))}
              disabled={bidAmount >= maxBid}
            >
              +
            </button>
          </div>
          <p className="bid-guidance">
            {bidAmount === 0 ? 'You predict you won\'t win any tricks.' :
             bidAmount === 1 ? 'You predict you\'ll win 1 trick.' :
             `You predict you'll win ${bidAmount} tricks.`}
          </p>
          <button 
            className="place-bid-button"
            onClick={handleBid}
            disabled={!isPlayerTurn || aiThinking}
          >
            Place Bid
          </button>
        </div>
        
        <div className="game-status">
          <div className="trump-suit">
            Trump Suit: {game.trumpSuit ? (
              <>
                {getSuitSymbol(game.trumpSuit)} {game.trumpSuit}
              </>
            ) : 'None'}
          </div>
          <div className="player-status">
            {game.players.map(player => (
              <div key={player.id} className={`player ${game.currentPlayerIndex === game.players.findIndex(p => p.id === player.id) ? 'current-player' : ''}`}>
                <span className="player-name">{player.name}</span>
                <span className="player-bid">
                  {player.bid !== undefined && player.bid !== 0 ? `Bid: ${player.bid}` : 'Bidding...'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render the playing phase UI
  const renderPlayingPhase = () => {
    if (!game) return null;
    
    const playableCards = getPlayableCards();
    const playerHand = getPlayerHand();
    const currentTrickCards = getCurrentTrickCards();
    
    const playerBids = game.players.map(player => ({
      name: player.name,
      bid: player.bid,
      tricks: player.tricks,
      isCurrentPlayer: game.currentPlayerIndex === game.players.findIndex(p => p.id === player.id)
    }));
    
    return (
      <div className="playing-phase">
        <div className="game-board">
          <div className="playing-area">
            <h3>Current Trick</h3>
            <div className="trick-cards">
              {currentTrickCards.length > 0 ? (
                currentTrickCards.map(({playerId: cardPlayerId, card}) => {
                  const player = game.players.find(p => p.id === cardPlayerId);
                  return (
                    <div key={card.id} className="played-card-container">
                      {renderCard(card, false, false)}
                      <div className="player-tag">{player?.name}</div>
                    </div>
                  );
                })
              ) : (
                <div className="no-cards-played">No cards played yet</div>
              )}
            </div>
            
            {showTrickWinner && (
              <div className="trick-winner-announcement">
                <span>{trickWinnerName} wins the trick!</span>
              </div>
            )}
          </div>
          
          <div className="game-info-sidebar">
            <div className="trump-display">
              <h4>Trump Suit</h4>
              <div className="trump-suit-display">
                {game.trumpSuit ? (
                  <>
                    <span className="trump-symbol">{getSuitSymbol(game.trumpSuit)}</span>
                    <span>{game.trumpSuit}</span>
                  </>
                ) : 'None'}
              </div>
            </div>
            
            <div className="player-status-list">
              <h4>Players</h4>
              {playerBids.map(player => (
                <div key={player.name} className={`player-status ${player.isCurrentPlayer ? 'active-player' : ''}`}>
                  <span className="player-name">{player.name}</span>
                  <span className="player-tricks">Tricks: {player.tricks}/{player.bid}</span>
                </div>
              ))}
            </div>
            
            <div className="moon-phase-effect">
              <h4>Moon Effect</h4>
              <div className="moon-icon">
                {getMoonPhaseSymbol(currentMoonPhase)}
              </div>
              <p>{MOON_PHASE_EFFECTS[currentMoonPhase].effect}</p>
            </div>
          </div>
        </div>
        
        <div className="player-hand">
          <h4>Your Hand {isPlayerTurn ? '(Your Turn)' : ''}</h4>
          <div className="hand-cards">
            {playerHand.map(card => renderCard(
              card,
              isPlayerTurn && playableCards.some(playable => playable.id === card.id),
              true
            ))}
          </div>
          
          {isPlayerTurn && (
            <div className="play-controls">
              <button 
                className="play-card-button"
                onClick={handlePlayCard}
                disabled={!selectedCard || aiThinking}
              >
                Play Selected Card
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render the scoring phase UI
  const renderScoringPhase = () => {
    if (!game || !selectedDeck) return null;
    
    const winners = getGameWinners(game);
    const playerWon = winners.winnerIds.includes(playerId);
    
    // Update the deck win count if player won
    if (playerWon && selectedDeck) {
      // Only update once when we enter scoring phase
      useEffect(() => {
        const updatedDecks = playerDecks.map(deck => 
          deck.id === selectedDeck.id 
            ? { ...deck, winCount: deck.winCount + 1 }
            : deck
        );
        setPlayerDecks(updatedDecks);
        onSaveDecks(updatedDecks);
      }, []);
    }
    
    // Simple rewards based on winning and score
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    const player = game.players[playerIndex];
    
    const manaReward = playerWon ? 30 : 10;
    const essenceReward = playerWon ? 2 : 0;
    const goldReward = player.score;
    
    return (
      <div className="scoring-phase">
        <h2>{playerWon ? 'Victory!' : 'Game Over'}</h2>
        
        <div className="game-results">
          <div className="winner-announcement">
            {winners.isTeamWin ? (
              game.winningConditionMet ? (
                <h3>Your team succeeded!</h3>
              ) : (
                <h3>Your team failed the challenge</h3>
              )
            ) : (
              <h3>
                {winners.winnerNames.length > 1 
                  ? `Winners: ${winners.winnerNames.join(', ')}`
                  : `Winner: ${winners.winnerNames[0]}`}
              </h3>
            )}
          </div>
          
          <div className="player-scores">
            <h4>Final Scores</h4>
            <div className="score-list">
              {game.players.map(player => (
                <div key={player.id} className={`player-score ${winners.winnerIds.includes(player.id) ? 'winner' : ''}`}>
                  <span className="player-name">{player.name}</span>
                  <div className="score-details">
                    <span>Score: {player.score}</span>
                    <span>Tricks: {player.tricks}</span>
                    <span>Bid: {player.bid}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="rewards-section">
            <h4>Your Rewards</h4>
            <div className="rewards-list">
              <div className="reward-item">
                <span className="reward-icon">✨</span>
                <span className="reward-name">Mana</span>
                <span className="reward-value">+{manaReward}</span>
              </div>
              
              {essenceReward > 0 && (
                <div className="reward-item">
                  <span className="reward-icon">🔮</span>
                  <span className="reward-name">Essence</span>
                  <span className="reward-value">+{essenceReward}</span>
                </div>
              )}
              
              <div className="reward-item">
                <span className="reward-icon">🪙</span>
                <span className="reward-name">Gold</span>
                <span className="reward-value">+{goldReward}</span>
              </div>
              
              {playerWon && game.moonPhase === 'Full Moon' && (
                <div className="reward-item special">
                  <span className="reward-icon">🌕</span>
                  <span className="reward-name">Full Moon Blessing</span>
                  <span className="reward-description">Your next garden harvest will yield extra items</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="end-game-actions">
          <button 
            className="play-again-button" 
            onClick={() => {
              setGamePhase('setup');
              setGameMessages([]);
              setShowRewards(false);
            }}
          >
            Play Again
          </button>
          <button className="close-button" onClick={onClose}>
            Return to Coven
          </button>
        </div>
      </div>
    );
  };
  
  // Render the rules modal
  const renderRulesModal = () => (
    <div className="rules-modal-overlay">
      <div className="rules-modal">
        <h2>Moon Bid Game Rules</h2>
        
        <div className="rules-content">
          <section className="rule-section">
            <h3>Basic Rules</h3>
            <ul>
              <li>Moon Bid is a trick-taking card game influenced by the current moon phase and season.</li>
              <li>The game consists of two phases: Bidding and Playing.</li>
              <li>During the Bidding phase, each player bids on how many tricks they think they'll win.</li>
              <li>During the Playing phase, players take turns playing cards, following the lead suit if possible.</li>
              <li>The highest card of the lead suit wins the trick, unless trumped.</li>
              <li>Players earn points by meeting or exceeding their bids.</li>
            </ul>
          </section>
          
          <section className="rule-section">
            <h3>Card Suits</h3>
            <ul>
              <li><strong>Stars {getSuitSymbol('stars')}</strong>: Associated with Fire and Air elements</li>
              <li><strong>Herbs {getSuitSymbol('herbs')}</strong>: Associated with Earth and Air elements</li>
              <li><strong>Potions {getSuitSymbol('potions')}</strong>: Associated with Water and Fire elements</li>
              <li><strong>Crystals {getSuitSymbol('crystals')}</strong>: Associated with Earth and Spirit elements</li>
            </ul>
          </section>
          
          <section className="rule-section">
            <h3>Special Cards</h3>
            <p>Cards with values 11-13 and special moon/elemental cards have unique powers that can change the course of the game.</p>
            <div className="special-powers-list">
              <div className="power-item">
                <span className="power-symbol">{getPowerSymbol('nullify')}</span>
                <span className="power-name">Nullify</span>
                <span className="power-description">Cancels another card's effect</span>
              </div>
              <div className="power-item">
                <span className="power-symbol">{getPowerSymbol('double')}</span>
                <span className="power-name">Double</span>
                <span className="power-description">Doubles the value of a card</span>
              </div>
              <div className="power-item">
                <span className="power-symbol">{getPowerSymbol('transform')}</span>
                <span className="power-name">Transform</span>
                <span className="power-description">Changes a card's suit</span>
              </div>
              <div className="power-item">
                <span className="power-symbol">{getPowerSymbol('protect')}</span>
                <span className="power-name">Protect</span>
                <span className="power-description">Prevents effects on a card</span>
              </div>
            </div>
          </section>
          
          <section className="rule-section">
            <h3>Scoring</h3>
            <ul>
              <li>10 points for each trick bid and won</li>
              <li>1 point for each trick won over your bid</li>
              <li>Bonus of 10 points for making your exact bid</li>
              <li>Penalty of -5 points per trick if you don't make your bid</li>
              <li>Special bonuses based on the current moon phase and season</li>
            </ul>
          </section>
          
          <section className="rule-section">
            <h3>Game Modes</h3>
            <p>Each game mode has unique rules and objectives:</p>
            <ul>
              {Object.entries(GAME_MODES).map(([mode, details]) => (
                <li key={mode}>
                  <strong>{mode.charAt(0).toUpperCase() + mode.slice(1)}</strong>: {details.description}
                </li>
              ))}
            </ul>
          </section>
        </div>
        
        <button className="close-rules-button" onClick={() => setShowRules(false)}>
          Close
        </button>
      </div>
    </div>
  );
  
  // Main component render
  return (
    <div className="moon-bid-game-container">
      {showDeckManager ? (
        <MoonBidDeckManager
          playerId={playerId}
          playerName={playerName}
          playerSpecialization={playerSpecialization}
          inventoryItems={playerInventory}
          playerEssence={playerEssence}
          playerMana={playerMana}
          playerGold={playerGold}
          currentMoonPhase={currentMoonPhase}
          currentSeason={currentSeason}
          savedDecks={playerDecks}
          onDeckSelect={handleDeckSelect}
          onSaveDecks={handleSaveDecks}
          onClose={() => setShowDeckManager(false)}
        />
      ) : (
        <>
          <div className="moon-bid-game">
            {gamePhase === 'setup' && renderSetupScreen()}
            {gamePhase === 'bidding' && renderBiddingPhase()}
            {gamePhase === 'playing' && renderPlayingPhase()}
            {gamePhase === 'scoring' && renderScoringPhase()}
            
            {gameMessages.length > 0 && (
              <div className="game-messages">
                <h4>Game Log</h4>
                <div className="message-list">
                  {gameMessages.map((message, index) => (
                    <div key={index} className="message-item">{message}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {showRules && renderRulesModal()}
          
          {aiThinking && (
            <div className="ai-thinking-indicator">
              <div className="thinking-spinner"></div>
              <span>Opponent is thinking...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MoonBidGame;