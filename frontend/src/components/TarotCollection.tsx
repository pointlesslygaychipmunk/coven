import React, { useState, useEffect } from 'react';
import { TarotCard, InventoryItem, ElementType, Season, MoonPhase } from 'coven-shared';
import { findCardById } from 'coven-shared';
import './TarotCollection.css';

interface TarotCollectionProps {
  playerInventory: InventoryItem[];
  season: Season;
  moonPhase: MoonPhase;
}

const TarotCollection: React.FC<TarotCollectionProps> = ({
  playerInventory,
  season,
  moonPhase
}) => {
  // State for filters and selection
  const [elementFilter, setElementFilter] = useState<ElementType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [cardRotation, setCardRotation] = useState<number>(0);
  const [showCardDetails, setShowCardDetails] = useState<boolean>(false);
  
  // State for card collection stats
  const [collectionStats, setCollectionStats] = useState({
    total: 0,
    unique: 0,
    byElement: {} as Record<ElementType, number>,
    byRarity: {} as Record<string, number>
  });
  
  // Get tarot cards from inventory
  const tarotCards = playerInventory
    .filter(item => item.tarotCardId)
    .map(item => {
      const card = findCardById(item.tarotCardId!);
      return { inventoryItem: item, tarotCard: card };
    })
    .filter(item => item.tarotCard !== undefined);
  
  // Effect to calculate collection stats
  useEffect(() => {
    const uniqueCardIds = new Set<string>();
    const elementCounts: Record<ElementType, number> = {
      'Earth': 0,
      'Water': 0,
      'Fire': 0,
      'Air': 0,
      'Spirit': 0
    };
    const rarityCounts: Record<string, number> = {
      'common': 0,
      'uncommon': 0,
      'rare': 0,
      'legendary': 0
    };
    
    let totalCards = 0;
    
    tarotCards.forEach(({ inventoryItem, tarotCard }) => {
      if (!tarotCard) return;
      
      // Count cards (by quantity)
      totalCards += inventoryItem.quantity;
      
      // Count unique cards
      uniqueCardIds.add(tarotCard.id);
      
      // Count by element
      if (tarotCard.element) {
        elementCounts[tarotCard.element] += inventoryItem.quantity;
      }
      
      // Count by rarity
      if (tarotCard.rarity) {
        rarityCounts[tarotCard.rarity] += inventoryItem.quantity;
      }
    });
    
    setCollectionStats({
      total: totalCards,
      unique: uniqueCardIds.size,
      byElement: elementCounts,
      byRarity: rarityCounts
    });
  }, [tarotCards]);
  
  // Filter cards based on user selections
  const filteredCards = tarotCards.filter(({ inventoryItem, tarotCard }) => {
    if (!tarotCard) return false;
    
    // Apply element filter
    if (elementFilter !== 'all' && tarotCard.element !== elementFilter) {
      return false;
    }
    
    // Apply category filter
    if (categoryFilter !== 'all' && tarotCard.category !== categoryFilter) {
      return false;
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        tarotCard.name.toLowerCase().includes(searchLower) ||
        tarotCard.description.toLowerCase().includes(searchLower) ||
        tarotCard.traditionUse.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Handle card selection
  const handleCardSelect = (card: TarotCard) => {
    setSelectedCard(card);
    setCardRotation(-2 + Math.random() * 4); // Slight random rotation for visual interest
    setShowCardDetails(true);
  };
  
  // Close detail view
  const handleCloseDetails = () => {
    setShowCardDetails(false);
    setTimeout(() => setSelectedCard(null), 300); // Wait for animation to complete
  };
  
  // Render element badge with icon
  const renderElementBadge = (element: ElementType) => {
    const icons: Record<ElementType, string> = {
      'Earth': '🌱',
      'Water': '💧',
      'Fire': '🔥',
      'Air': '💨',
      'Spirit': '✨'
    };
    
    return (
      <div className={`element-badge ${element.toLowerCase()}`}>
        <span className="element-icon">{icons[element]}</span>
        <span className="element-name">{element}</span>
      </div>
    );
  };
  
  // Render rarity stars
  const renderRarityStars = (rarity: string) => {
    const starCount = 
      rarity === 'common' ? 1 :
      rarity === 'uncommon' ? 2 :
      rarity === 'rare' ? 3 :
      rarity === 'legendary' ? 4 : 0;
    
    return (
      <div className={`rarity-stars ${rarity}`}>
        {Array(starCount).fill(0).map((_, i) => (
          <span key={i} className="star">★</span>
        ))}
        {Array(4 - starCount).fill(0).map((_, i) => (
          <span key={i} className="empty-star">☆</span>
        ))}
      </div>
    );
  };
  
  // Check if card is empowered by current conditions
  const isCardEmpowered = (card: TarotCard | null): boolean => {
    if (!card) return false;
    
    // Check moon phase and season alignment
    return card.moonPhaseAffinity === moonPhase || card.seasonAffinity === season;
  };
  
  return (
    <div className="tarot-collection-container">
      <div className="collection-header">
        <h2>Tarot Card Collection</h2>
        <div className="collection-stats">
          <div className="stat-item">
            <span className="stat-label">Total Cards:</span>
            <span className="stat-value">{collectionStats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unique Cards:</span>
            <span className="stat-value">{collectionStats.unique}</span>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="collection-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>Element:</label>
          <div className="element-buttons">
            <button
              className={`element-filter-btn all ${elementFilter === 'all' ? 'active' : ''}`}
              onClick={() => setElementFilter('all')}
            >
              All
            </button>
            <button
              className={`element-filter-btn earth ${elementFilter === 'Earth' ? 'active' : ''}`}
              onClick={() => setElementFilter('Earth')}
            >
              Earth
            </button>
            <button
              className={`element-filter-btn water ${elementFilter === 'Water' ? 'active' : ''}`}
              onClick={() => setElementFilter('Water')}
            >
              Water
            </button>
            <button
              className={`element-filter-btn fire ${elementFilter === 'Fire' ? 'active' : ''}`}
              onClick={() => setElementFilter('Fire')}
            >
              Fire
            </button>
            <button
              className={`element-filter-btn air ${elementFilter === 'Air' ? 'active' : ''}`}
              onClick={() => setElementFilter('Air')}
            >
              Air
            </button>
            <button
              className={`element-filter-btn spirit ${elementFilter === 'Spirit' ? 'active' : ''}`}
              onClick={() => setElementFilter('Spirit')}
            >
              Spirit
            </button>
          </div>
        </div>
        
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="herb">Herbs</option>
            <option value="flower">Flowers</option>
            <option value="root">Roots</option>
            <option value="fruit">Fruits</option>
            <option value="mushroom">Mushrooms</option>
            <option value="tree">Trees</option>
            <option value="crystal">Crystals</option>
          </select>
        </div>
      </div>
      
      {/* Card Grid */}
      <div className="tarot-cards-grid">
        {filteredCards.length === 0 ? (
          <div className="no-cards-message">
            <p>No cards match your filters.</p>
            <p>Visit the Market to acquire new cards!</p>
          </div>
        ) : (
          filteredCards.map(({ inventoryItem, tarotCard }) => {
            if (!tarotCard) return null;
            
            const isEmpowered = isCardEmpowered(tarotCard);
            
            return (
              <div
                key={`${inventoryItem.id}-${tarotCard.id}`}
                className={`tarot-card-container ${isEmpowered ? 'empowered' : ''}`}
                onClick={() => handleCardSelect(tarotCard)}
              >
                <div className={`tarot-card element-${tarotCard.element.toLowerCase()}`}>
                  <div className="card-image" style={{
                    backgroundImage: `url(${tarotCard.artworkPath || '/assets/cards/placeholder.png'})`
                  }}>
                    {isEmpowered && <div className="empowerment-glow"></div>}
                  </div>
                  <div className="card-title">{tarotCard.name}</div>
                  <div className="card-footer">
                    {renderElementBadge(tarotCard.element)}
                    {renderRarityStars(tarotCard.rarity)}
                  </div>
                  <div className="card-quantity">x{inventoryItem.quantity}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Card Detail View */}
      {selectedCard && (
        <div className={`card-detail-overlay ${showCardDetails ? 'visible' : ''}`} onClick={handleCloseDetails}>
          <div className="card-detail-container" onClick={(e) => e.stopPropagation()}>
            <div 
              className="detail-card" 
              style={{transform: `rotate(${cardRotation}deg)`}}
            >
              <div className={`card-frame element-${selectedCard.element.toLowerCase()}`}>
                <div className="card-image" style={{
                  backgroundImage: `url(${selectedCard.artworkPath || '/assets/cards/placeholder.png'})`
                }}></div>
                <div className="card-name">{selectedCard.name}</div>
                <div className="card-rank">Rank {selectedCard.rank}</div>
                <div className="card-type">{selectedCard.category} • {selectedCard.type}</div>
                {renderElementBadge(selectedCard.element)}
                <div className="card-affinity">
                  <div className="moon-affinity">
                    <span className="affinity-label">Moon:</span>
                    <span className="affinity-value">{selectedCard.moonPhaseAffinity}</span>
                    {selectedCard.moonPhaseAffinity === moonPhase && (
                      <span className="affinity-active">✧ Active ✧</span>
                    )}
                  </div>
                  <div className="season-affinity">
                    <span className="affinity-label">Season:</span>
                    <span className="affinity-value">{selectedCard.seasonAffinity}</span>
                    {selectedCard.seasonAffinity === season && (
                      <span className="affinity-active">✧ Active ✧</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="card-details">
                <div className="detail-section">
                  <h3>Description</h3>
                  <p>{selectedCard.description}</p>
                </div>
                
                <div className="detail-section">
                  <h3>Traditional Use</h3>
                  <p>{selectedCard.traditionUse}</p>
                </div>
                
                <div className="detail-section properties">
                  <h3>Properties</h3>
                  <div className="property-grid">
                    {selectedCard.primaryEffect && (
                      <div className="property">
                        <span className="property-label">Primary Effect:</span>
                        <span className="property-value">{selectedCard.primaryEffect.description}</span>
                      </div>
                    )}
                    
                    {selectedCard.secondaryEffect && (
                      <div className="property">
                        <span className="property-label">Secondary Effect:</span>
                        <span className="property-value">{selectedCard.secondaryEffect.description}</span>
                      </div>
                    )}
                    
                    {selectedCard.manaGeneration && (
                      <div className="property">
                        <span className="property-label">Mana Generation:</span>
                        <span className="property-value">{selectedCard.manaGeneration} per day</span>
                      </div>
                    )}
                    
                    {selectedCard.growthTime && (
                      <div className="property">
                        <span className="property-label">Growth Time:</span>
                        <span className="property-value">{selectedCard.growthTime} days</span>
                      </div>
                    )}
                    
                    {selectedCard.yield && (
                      <div className="property">
                        <span className="property-label">Yield:</span>
                        <span className="property-value">{selectedCard.yield} units</span>
                      </div>
                    )}
                    
                    {selectedCard.potency && (
                      <div className="property">
                        <span className="property-label">Brewing Potency:</span>
                        <span className="property-value">{selectedCard.potency}/10</span>
                      </div>
                    )}
                    
                    {selectedCard.stability && (
                      <div className="property">
                        <span className="property-label">Brewing Stability:</span>
                        <span className="property-value">{selectedCard.stability}/10</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedCard.combos.length > 0 && (
                  <div className="detail-section">
                    <h3>Card Combinations</h3>
                    <ul className="combo-list">
                      {selectedCard.combos.map((combo, index) => (
                        <li key={index} className="combo-item">
                          <span className="combo-card">{combo.cardId}</span>
                          <span className="combo-effect">{combo.effectDescription}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <button className="close-detail-btn" onClick={handleCloseDetails}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarotCollection;