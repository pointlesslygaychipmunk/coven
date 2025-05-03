import React, { useState, useEffect, useCallback } from 'react';
import './MoonBidDeckManager.css';
import { 
  PlayerDeck, 
  MoonCard, 
  MoonCardSuit, 
  CardRarity, 
  DeckbuildingRules, 
  DEFAULT_DECKBUILDING_RULES, 
  createDefaultDeck, 
  validateDeck,
  createSpecializedDeck,
  calculateRarityScore,
  getAvailableCraftableCards,
  getStandardCardDeck
} from 'coven-shared';
import { MoonPhase, Season, ElementType } from 'coven-shared/src/types';
import { CORE_CARDS, CRAFTABLE_CARDS, CARD_COMBOS } from 'coven-shared/src/moonBidDeckbuilding';
import { MOON_PHASE_EFFECTS } from 'coven-shared/src/moonBidGame';

interface MoonBidDeckManagerProps {
  playerId: string;
  playerName: string;
  playerSpecialization?: string;
  inventoryItems: Array<{ id: string; quantity: number; category: string }>;
  playerEssence: number;
  playerMana: number;
  playerGold: number;
  currentMoonPhase: MoonPhase;
  currentSeason: Season;
  savedDecks: PlayerDeck[];
  onDeckSelect: (deck: PlayerDeck) => void;
  onSaveDecks: (decks: PlayerDeck[]) => void;
  onClose: () => void;
}

// Helper function to generate a unique ID
const generateId = () => `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

// Standard card to get display information
interface CardDisplay {
  id: string;
  suit: MoonCardSuit;
  value: number;
  name: string;
  element: ElementType;
  imagePath: string;
  isSpecial: boolean;
  inDeck: boolean;
  count: number;
  moonPhase?: MoonPhase;
}

const MoonBidDeckManager: React.FC<MoonBidDeckManagerProps> = ({
  playerId,
  playerName,
  playerSpecialization,
  inventoryItems,
  playerEssence,
  playerMana,
  playerGold,
  currentMoonPhase,
  currentSeason,
  savedDecks,
  onDeckSelect,
  onSaveDecks,
  onClose
}) => {
  // State for decks
  const [decks, setDecks] = useState<PlayerDeck[]>(savedDecks.length > 0 ? savedDecks : []);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    lunarAlignment: 'Full Moon' as MoonPhase
  });
  
  // State for cards
  const [allCards, setAllCards] = useState<CardDisplay[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardDisplay[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  
  // State for filters
  const [filters, setFilters] = useState({
    suit: 'all',
    element: 'all',
    moonPhase: 'all',
    rarity: 'all'
  });
  
  // State for validation
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });
  
  // State for alert dialog
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Get currently selected deck
  const selectedDeck = decks.find(deck => deck.id === selectedDeckId) || null;
  
  // Initialize decks on first load
  useEffect(() => {
    if (decks.length === 0) {
      const defaultDeck = createDefaultDeck(playerId, playerName);
      
      // If player has a specialization, create a specialized deck too
      let initialDecks = [defaultDeck];
      
      if (playerSpecialization) {
        const specializedDeck = createSpecializedDeck(playerId, playerName, playerSpecialization);
        initialDecks.push(specializedDeck);
      }
      
      setDecks(initialDecks);
      setSelectedDeckId(defaultDeck.id);
    } else if (selectedDeckId === null && decks.length > 0) {
      // If there are decks but none selected, select the first one
      setSelectedDeckId(decks[0].id);
    }
  }, [decks.length, playerId, playerName, playerSpecialization, selectedDeckId]);
  
  // Initialize cards
  useEffect(() => {
    // Get standard cards
    const standardCards = getStandardCardDeck().map(card => ({
      id: card.id,
      suit: card.suit,
      value: card.value,
      name: card.name,
      element: card.elementalAffinity || 'Earth' as ElementType,
      imagePath: card.imagePath,
      isSpecial: card.isSpecial,
      inDeck: false,
      count: 0,
      moonPhase: card.moonAffinity
    }));
    
    // Get craftable cards
    const craftableCards = getAvailableCraftableCards(currentMoonPhase, currentSeason).map(card => ({
      id: card.id,
      suit: card.suit,
      value: card.value,
      name: card.name,
      element: card.elementalAffinity || 'Spirit' as ElementType,
      imagePath: card.imagePath,
      isSpecial: true,
      inDeck: false,
      count: 0,
      moonPhase: card.moonAffinity
    }));
    
    // Combine card collections
    const combinedCards = [...standardCards, ...craftableCards];
    setAllCards(combinedCards);
    setFilteredCards(combinedCards);
  }, [currentMoonPhase, currentSeason]);
  
  // Update cards when selected deck changes
  useEffect(() => {
    if (selectedDeck && allCards.length > 0) {
      const updatedCards = allCards.map(card => {
        const inCore = selectedDeck.coreCards.includes(card.id);
        const inCustom = selectedDeck.customCards.includes(card.id);
        
        // Count how many times this card appears in the deck
        const coreCount = selectedDeck.coreCards.filter(id => id === card.id).length;
        const customCount = selectedDeck.customCards.filter(id => id === card.id).length;
        
        return {
          ...card,
          inDeck: inCore || inCustom,
          count: coreCount + customCount
        };
      });
      
      setAllCards(updatedCards);
      
      // Apply current filters to updated cards
      applyFilters(updatedCards);
      
      // Validate deck against rules
      const validation = validateDeck(selectedDeck);
      setValidation(validation);
    }
  }, [selectedDeck]);
  
  // Apply filters to cards
  const applyFilters = useCallback((cards: CardDisplay[]) => {
    const filtered = cards.filter(card => {
      // Filter by suit
      if (filters.suit !== 'all' && card.suit !== filters.suit) {
        return false;
      }
      
      // Filter by element
      if (filters.element !== 'all' && card.element !== filters.element) {
        return false;
      }
      
      // Filter by moon phase
      if (filters.moonPhase !== 'all' && card.moonPhase !== filters.moonPhase) {
        return false;
      }
      
      // Filter by rarity (simple approach - face cards are rare, special cards are epic)
      if (filters.rarity !== 'all') {
        if (filters.rarity === 'common' && (card.value > 10 || card.isSpecial)) {
          return false;
        }
        if (filters.rarity === 'uncommon' && (card.value <= 10 || card.isSpecial)) {
          return false;
        }
        if (filters.rarity === 'rare' && (card.value <= 10 || card.isSpecial)) {
          return false;
        }
        if (filters.rarity === 'epic' && !card.isSpecial) {
          return false;
        }
      }
      
      return true;
    });
    
    setFilteredCards(filtered);
  }, [filters]);
  
  // Update filters and filtered cards
  useEffect(() => {
    applyFilters(allCards);
  }, [allCards, filters, applyFilters]);
  
  // Handle filter changes
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  // Handle selecting a deck
  const handleSelectDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    setSelectedCard(null);
  };
  
  // Handle creating a new deck
  const handleNewDeck = () => {
    setEditForm({
      name: `${playerName}'s New Deck`,
      description: 'A custom Moon Bid deck',
      lunarAlignment: currentMoonPhase
    });
    setIsEditing(true);
  };
  
  // Handle editing a deck
  const handleEditDeck = () => {
    if (selectedDeck) {
      setEditForm({
        name: selectedDeck.name,
        description: selectedDeck.description,
        lunarAlignment: selectedDeck.lunarAlignment
      });
      setIsEditing(true);
    }
  };
  
  // Handle toggling favorite status
  const handleToggleFavorite = () => {
    if (selectedDeck) {
      const updatedDecks = decks.map(deck => 
        deck.id === selectedDeck.id 
          ? { ...deck, favoriteStatus: !deck.favoriteStatus }
          : deck
      );
      setDecks(updatedDecks);
      onSaveDecks(updatedDecks);
    }
  };
  
  // Handle deleting a deck
  const handleDeleteDeck = () => {
    if (selectedDeck) {
      setAlert({
        show: true,
        title: 'Delete Deck',
        message: `Are you sure you want to delete "${selectedDeck.name}"? This cannot be undone.`,
        onConfirm: () => {
          const updatedDecks = decks.filter(deck => deck.id !== selectedDeck.id);
          setDecks(updatedDecks);
          setSelectedDeckId(updatedDecks.length > 0 ? updatedDecks[0].id : null);
          onSaveDecks(updatedDecks);
          setAlert({ ...alert, show: false });
        }
      });
    }
  };
  
  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle saving deck edits
  const handleSaveDeckEdit = () => {
    if (selectedDeck) {
      // Update existing deck
      const updatedDecks = decks.map(deck => 
        deck.id === selectedDeck.id 
          ? { 
              ...deck, 
              name: editForm.name, 
              description: editForm.description,
              lunarAlignment: editForm.lunarAlignment as MoonPhase,
              lastModified: Date.now()
            }
          : deck
      );
      setDecks(updatedDecks);
      onSaveDecks(updatedDecks);
    } else {
      // Create new deck
      const newDeck: PlayerDeck = {
        id: `deck_${generateId()}`,
        ownerId: playerId,
        name: editForm.name,
        description: editForm.description,
        coreCards: [],
        customCards: [],
        lunarAlignment: editForm.lunarAlignment as MoonPhase,
        elementalBalance: {
          'Earth': 0,
          'Water': 0,
          'Fire': 0,
          'Air': 0,
          'Spirit': 0
        },
        suitDistribution: {
          'stars': 0,
          'herbs': 0,
          'potions': 0,
          'crystals': 0
        },
        rarityScore: 0,
        creationDate: Date.now(),
        lastModified: Date.now(),
        favoriteStatus: false,
        playCount: 0,
        winCount: 0
      };
      
      const updatedDecks = [...decks, newDeck];
      setDecks(updatedDecks);
      setSelectedDeckId(newDeck.id);
      onSaveDecks(updatedDecks);
    }
    
    setIsEditing(false);
  };
  
  // Handle card selection
  const handleCardSelect = (cardId: string) => {
    setSelectedCard(cardId === selectedCard ? null : cardId);
  };
  
  // Handle adding a card to the deck
  const handleAddCard = () => {
    if (selectedDeck && selectedCard) {
      const selectedCardObj = allCards.find(card => card.id === selectedCard);
      if (!selectedCardObj) return;
      
      let updatedDeck: PlayerDeck;
      
      // Add to appropriate array based on whether it's a special card
      if (selectedCardObj.isSpecial) {
        // Check if we're under the limit for special cards
        const specialCount = selectedDeck.customCards.length;
        const specialLimit = DEFAULT_DECKBUILDING_RULES.specialCardsLimit;
        
        if (specialCount >= specialLimit) {
          setAlert({
            show: true,
            title: 'Special Card Limit',
            message: `You can only have ${specialLimit} special cards in your deck.`,
            onConfirm: () => setAlert({ ...alert, show: false })
          });
          return;
        }
        
        updatedDeck = {
          ...selectedDeck,
          customCards: [...selectedDeck.customCards, selectedCard],
          lastModified: Date.now()
        };
      } else {
        // Add to core cards
        updatedDeck = {
          ...selectedDeck,
          coreCards: [...selectedDeck.coreCards, selectedCard],
          lastModified: Date.now()
        };
      }
      
      // Update elemental balance
      const elementalBalance = { ...updatedDeck.elementalBalance };
      elementalBalance[selectedCardObj.element] = (elementalBalance[selectedCardObj.element] || 0) + 1;
      
      // Update suit distribution
      const suitDistribution = { ...updatedDeck.suitDistribution };
      suitDistribution[selectedCardObj.suit] = (suitDistribution[selectedCardObj.suit] || 0) + 1;
      
      // Update rarity score
      const rarityScore = calculateRarityScore(updatedDeck.coreCards, updatedDeck.customCards);
      
      // Apply updates
      updatedDeck.elementalBalance = elementalBalance;
      updatedDeck.suitDistribution = suitDistribution;
      updatedDeck.rarityScore = rarityScore;
      
      // Update decks
      const updatedDecks = decks.map(deck => 
        deck.id === selectedDeck.id ? updatedDeck : deck
      );
      
      setDecks(updatedDecks);
      onSaveDecks(updatedDecks);
      setSelectedCard(null);
    }
  };
  
  // Handle removing a card from the deck
  const handleRemoveCard = () => {
    if (selectedDeck && selectedCard) {
      const selectedCardObj = allCards.find(card => card.id === selectedCard);
      if (!selectedCardObj || !selectedCardObj.inDeck) return;
      
      let updatedDeck: PlayerDeck;
      
      // Remove from appropriate array based on whether it's a special card
      if (selectedCardObj.isSpecial) {
        // Find first occurrence of the card in customCards
        const index = selectedDeck.customCards.indexOf(selectedCard);
        if (index === -1) return;
        
        const newCustomCards = [...selectedDeck.customCards];
        newCustomCards.splice(index, 1);
        
        updatedDeck = {
          ...selectedDeck,
          customCards: newCustomCards,
          lastModified: Date.now()
        };
      } else {
        // Find first occurrence of the card in coreCards
        const index = selectedDeck.coreCards.indexOf(selectedCard);
        if (index === -1) return;
        
        const newCoreCards = [...selectedDeck.coreCards];
        newCoreCards.splice(index, 1);
        
        updatedDeck = {
          ...selectedDeck,
          coreCards: newCoreCards,
          lastModified: Date.now()
        };
      }
      
      // Update elemental balance
      const elementalBalance = { ...updatedDeck.elementalBalance };
      elementalBalance[selectedCardObj.element] = Math.max(0, (elementalBalance[selectedCardObj.element] || 0) - 1);
      
      // Update suit distribution
      const suitDistribution = { ...updatedDeck.suitDistribution };
      suitDistribution[selectedCardObj.suit] = Math.max(0, (suitDistribution[selectedCardObj.suit] || 0) - 1);
      
      // Update rarity score
      const rarityScore = calculateRarityScore(updatedDeck.coreCards, updatedDeck.customCards);
      
      // Apply updates
      updatedDeck.elementalBalance = elementalBalance;
      updatedDeck.suitDistribution = suitDistribution;
      updatedDeck.rarityScore = rarityScore;
      
      // Update decks
      const updatedDecks = decks.map(deck => 
        deck.id === selectedDeck.id ? updatedDeck : deck
      );
      
      setDecks(updatedDecks);
      onSaveDecks(updatedDecks);
      setSelectedCard(null);
    }
  };
  
  // Handle save deck changes
  const handleSaveDeck = () => {
    if (selectedDeck) {
      const validation = validateDeck(selectedDeck);
      
      if (!validation.valid) {
        setAlert({
          show: true,
          title: 'Invalid Deck',
          message: `Your deck cannot be saved because:\n${validation.errors.join('\n')}`,
          onConfirm: () => setAlert({ ...alert, show: false })
        });
        return;
      }
      
      onDeckSelect(selectedDeck);
      onClose();
    }
  };
  
  return (
    <div className="moon-bid-deck-manager">
      <div className="deck-manager-header">
        <div className="deck-manager-title">MOON BID DECK MANAGER</div>
        <button className="deck-manager-close" onClick={onClose}>Close</button>
      </div>
      
      <div className="deck-manager-content">
        {/* Deck list panel */}
        <div className="deck-list-panel">
          <div className="panel-header">
            <div>Your Decks ({decks.length})</div>
            <button className="new-deck-button" onClick={handleNewDeck}>+ New</button>
          </div>
          
          <div className="deck-list">
            {decks.map(deck => (
              <div 
                key={deck.id}
                className={`deck-list-item ${selectedDeckId === deck.id ? 'active' : ''}`}
                onClick={() => handleSelectDeck(deck.id)}
              >
                <div className={`deck-name ${deck.favoriteStatus ? 'favorite' : ''}`}>{deck.name}</div>
                <div className="deck-meta">
                  <div className="deck-meta-item">
                    Cards: {deck.coreCards.length + deck.customCards.length}
                  </div>
                  <div className="deck-meta-item">
                    {new Date(deck.lastModified).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Deck details panel */}
        <div className="deck-details-panel">
          <div className="panel-header">
            <div>Deck Details</div>
          </div>
          
          {selectedDeck ? (
            <div className="deck-details-content">
              <div className="deck-info">
                <div className="deck-info-header">
                  <div 
                    className="deck-art" 
                    style={{ backgroundImage: `url(${selectedDeck.deckArt || '/assets/cards/deck_art/default.png'})` }}
                  ></div>
                  
                  <div className="deck-info-title">
                    <div>
                      <div className="deck-info-name">
                        {selectedDeck.favoriteStatus && '★ '}{selectedDeck.name}
                      </div>
                      <div className="deck-info-description">
                        {selectedDeck.description}
                      </div>
                    </div>
                    
                    <div className="deck-action-buttons">
                      <button className="deck-action-button edit-button" onClick={handleEditDeck}>
                        Edit Details
                      </button>
                      <button 
                        className="deck-action-button favorite-button" 
                        onClick={handleToggleFavorite}
                      >
                        {selectedDeck.favoriteStatus ? 'Unfavorite' : 'Favorite'}
                      </button>
                      <button className="deck-action-button delete-button" onClick={handleDeleteDeck}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`deck-validation ${validation.valid ? 'valid' : 'invalid'}`}
                >
                  {validation.valid 
                    ? 'This deck is valid and ready to play!' 
                    : `Deck validation issues: ${validation.errors.join(', ')}`}
                </div>
                
                <div className="deck-stats">
                  <div className="stat-group">
                    <div className="stat-group-title">Card Count</div>
                    <div className="stat-row">
                      <div className="stat-label">Core Cards:</div>
                      <div className="stat-value">{selectedDeck.coreCards.length}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">Special Cards:</div>
                      <div className="stat-value">{selectedDeck.customCards.length}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">Total Cards:</div>
                      <div className="stat-value">{selectedDeck.coreCards.length + selectedDeck.customCards.length}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">Rarity Score:</div>
                      <div className="stat-value">{selectedDeck.rarityScore}</div>
                    </div>
                  </div>
                  
                  <div className="stat-group">
                    <div className="stat-group-title">Element Balance</div>
                    <div className="stat-row">
                      <div className="stat-label">Earth:</div>
                      <div className="stat-value earth">{selectedDeck.elementalBalance.Earth}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">Water:</div>
                      <div className="stat-value water">{selectedDeck.elementalBalance.Water}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">Fire:</div>
                      <div className="stat-value fire">{selectedDeck.elementalBalance.Fire}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">Air:</div>
                      <div className="stat-value air">{selectedDeck.elementalBalance.Air}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">Spirit:</div>
                      <div className="stat-value spirit">{selectedDeck.elementalBalance.Spirit}</div>
                    </div>
                  </div>
                  
                  <div className="stat-group">
                    <div className="stat-group-title">Suit Distribution</div>
                    <div className="stat-row">
                      <div className="stat-label">Stars:</div>
                      <div className="stat-value stars">{selectedDeck.suitDistribution.stars}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">Herbs:</div>
                      <div className="stat-value herbs">{selectedDeck.suitDistribution.herbs}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">Potions:</div>
                      <div className="stat-value potions">{selectedDeck.suitDistribution.potions}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">Crystals:</div>
                      <div className="stat-value crystals">{selectedDeck.suitDistribution.crystals}</div>
                    </div>
                  </div>
                  
                  <div className="stat-group">
                    <div className="stat-group-title">Cosmic Alignment</div>
                    <div className="stat-row">
                      <div className="stat-label">Lunar Alignment:</div>
                      <div className="stat-value">{selectedDeck.lunarAlignment}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">Plays:</div>
                      <div className="stat-value">{selectedDeck.playCount}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">Wins:</div>
                      <div className="stat-value">{selectedDeck.winCount}</div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-label">Win Rate:</div>
                      <div className="stat-value">
                        {selectedDeck.playCount > 0 
                          ? `${Math.round((selectedDeck.winCount / selectedDeck.playCount) * 100)}%` 
                          : '0%'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-catalog">
                <div className="panel-header">
                  <div>Card Collection</div>
                </div>
                
                <div className="card-filters">
                  <div className="filter-group">
                    <label className="filter-label">Filter by Suit:</label>
                    <select 
                      className="filter-select"
                      value={filters.suit}
                      onChange={(e) => handleFilterChange('suit', e.target.value)}
                    >
                      <option value="all">All Suits</option>
                      <option value="stars">Stars</option>
                      <option value="herbs">Herbs</option>
                      <option value="potions">Potions</option>
                      <option value="crystals">Crystals</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label className="filter-label">Filter by Element:</label>
                    <select 
                      className="filter-select"
                      value={filters.element}
                      onChange={(e) => handleFilterChange('element', e.target.value)}
                    >
                      <option value="all">All Elements</option>
                      <option value="Earth">Earth</option>
                      <option value="Water">Water</option>
                      <option value="Fire">Fire</option>
                      <option value="Air">Air</option>
                      <option value="Spirit">Spirit</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label className="filter-label">Filter by Moon Phase:</label>
                    <select 
                      className="filter-select"
                      value={filters.moonPhase}
                      onChange={(e) => handleFilterChange('moonPhase', e.target.value)}
                    >
                      <option value="all">All Phases</option>
                      <option value="New Moon">New Moon</option>
                      <option value="Waxing Crescent">Waxing Crescent</option>
                      <option value="First Quarter">First Quarter</option>
                      <option value="Waxing Gibbous">Waxing Gibbous</option>
                      <option value="Full Moon">Full Moon</option>
                      <option value="Waning Gibbous">Waning Gibbous</option>
                      <option value="Last Quarter">Last Quarter</option>
                      <option value="Waning Crescent">Waning Crescent</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label className="filter-label">Filter by Rarity:</label>
                    <select 
                      className="filter-select"
                      value={filters.rarity}
                      onChange={(e) => handleFilterChange('rarity', e.target.value)}
                    >
                      <option value="all">All Rarities</option>
                      <option value="common">Common</option>
                      <option value="uncommon">Uncommon</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                    </select>
                  </div>
                </div>
                
                <div className="card-list">
                  {filteredCards.map(card => (
                    <div 
                      key={card.id}
                      className={`card-item ${card.inDeck ? 'in-deck' : ''} ${selectedCard === card.id ? 'selected' : ''}`}
                      onClick={() => handleCardSelect(card.id)}
                    >
                      <div className="card-header">
                        <div className="card-value">{card.value}</div>
                        <div className={`card-suit ${card.suit}`}>{card.suit}</div>
                      </div>
                      
                      <div 
                        className="card-image"
                        style={{ backgroundImage: `url(${card.imagePath})` }}
                      ></div>
                      
                      <div className="card-name">{card.name}</div>
                      
                      <div className={`card-element ${card.element}`}>{card.element}</div>
                      
                      {card.isSpecial && <div className="card-special"></div>}
                      
                      {card.inDeck && card.count > 0 && (
                        <div className="card-count">{card.count}</div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="deck-action-footer">
                  <div className="deck-actions-left">
                    <button 
                      className="deck-action add-card-button"
                      disabled={!selectedCard || allCards.find(c => c.id === selectedCard)?.inDeck}
                      onClick={handleAddCard}
                    >
                      Add Card
                    </button>
                    <button 
                      className="deck-action remove-card-button"
                      disabled={!selectedCard || !allCards.find(c => c.id === selectedCard)?.inDeck}
                      onClick={handleRemoveCard}
                    >
                      Remove Card
                    </button>
                  </div>
                  
                  <div className="deck-actions-right">
                    <button 
                      className="deck-action save-deck-button"
                      onClick={handleSaveDeck}
                      disabled={!validation.valid}
                    >
                      Save & Select
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="deck-details-content">
              <div className="deck-info" style={{ padding: '20px', textAlign: 'center' }}>
                <p>Select a deck from the list or create a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Deck Modal */}
      {isEditing && (
        <div className="deck-edit-panel">
          <div className="deck-edit-content">
            <div className="deck-edit-header">
              <div className="deck-edit-title">
                {selectedDeck ? 'Edit Deck Details' : 'Create New Deck'}
              </div>
            </div>
            
            <div className="deck-edit-form">
              <div className="form-group">
                <label className="form-label">Deck Name:</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-input" 
                  value={editForm.name}
                  onChange={handleFormChange}
                  maxLength={30}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description:</label>
                <textarea 
                  name="description" 
                  className="form-textarea"
                  value={editForm.description}
                  onChange={handleFormChange}
                  maxLength={200}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Lunar Alignment:</label>
                <div className="lunar-options">
                  {(Object.keys(MOON_PHASE_EFFECTS) as MoonPhase[]).map(phase => (
                    <div 
                      key={phase}
                      className={`lunar-option ${editForm.lunarAlignment === phase ? 'selected' : ''}`}
                      onClick={() => setEditForm({ ...editForm, lunarAlignment: phase })}
                    >
                      <div className="lunar-name">{phase}</div>
                      <div className="lunar-effect">{MOON_PHASE_EFFECTS[phase].effect.substring(0, 30)}...</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="deck-edit-footer">
              <button 
                className="cancel-button" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button 
                className="save-button"
                onClick={handleSaveDeckEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Alert Dialog */}
      {alert.show && (
        <div className="alert-dialog">
          <div className="alert-title">{alert.title}</div>
          <div className="alert-message">{alert.message}</div>
          <div className="alert-buttons">
            {alert.title === 'Delete Deck' && (
              <button 
                className="alert-button alert-button-no"
                onClick={() => setAlert({ ...alert, show: false })}
              >
                Cancel
              </button>
            )}
            <button 
              className="alert-button alert-button-yes"
              onClick={alert.onConfirm}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoonBidDeckManager;