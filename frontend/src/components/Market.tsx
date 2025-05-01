import React, { useState, useEffect } from 'react';
import './Market.css';
import { InventoryItem, MarketItem, Rumor, TownRequest } from 'coven-shared';

// Define custom type for price trend animation
type TrendType = 'up' | 'down' | 'stable';

interface MarketProps {
  playerGold: number;
  playerInventory: InventoryItem[];
  marketItems: MarketItem[];
  rumors: Rumor[];
  townRequests: TownRequest[];
  blackMarketAccess: boolean;
  onBuyItem: (itemId: string) => void;
  onSellItem: (inventoryItemId: string) => void;
  onFulfillRequest: (requestId: string) => void;
}

const Market: React.FC<MarketProps> = ({
  playerGold,
  playerInventory = [],
  marketItems = [],
  rumors = [],
  townRequests = [],
  blackMarketAccess,
  onBuyItem,
  onSellItem,
  onFulfillRequest,
}) => {
  // State
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'requests'>('buy');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showBlackMarket, setShowBlackMarket] = useState<boolean>(false);
  const [blackMarketTransition, setBlackMarketTransition] = useState<boolean>(false);

  // Reset selection when changing tabs
  useEffect(() => {
    setSelectedItemId(null);
    setSelectedInventoryItemId(null);
    setSelectedRequestId(null);
  }, [activeTab]);

  // Handle Black Market transition effect
  useEffect(() => {
    if (showBlackMarket) {
      setBlackMarketTransition(true);
      const timer = setTimeout(() => {
        setBlackMarketTransition(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showBlackMarket]);

// Fix for the getFilteredItems function in Market.tsx
const getFilteredItems = () => {
  let itemsToFilter: (MarketItem | InventoryItem)[] = [];

  if (activeTab === 'buy') {
    itemsToFilter = marketItems.filter(item => !item.blackMarketOnly || (item.blackMarketOnly && showBlackMarket));
  } else if (activeTab === 'sell') {
    // Filter inventory items that are sellable and have quantity > 0
    const sellableMarketIds = new Set(marketItems.map(mi => mi.id));
     itemsToFilter = playerInventory.filter(invItem =>
         sellableMarketIds.has(invItem.baseId) && invItem.quantity > 0
     );
  } else {
    return []; // No items for requests tab
  }

  // Apply common filters
  if (categoryFilter !== 'all') {
    itemsToFilter = itemsToFilter.filter(item => item.category === categoryFilter);
  }
  if (typeFilter !== 'all') {
    itemsToFilter = itemsToFilter.filter(item => item.type === typeFilter);
  }
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    itemsToFilter = itemsToFilter.filter(item =>
      item.name.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term))
    );
  }

  // Sort by name with rarer items first
  itemsToFilter.sort((a, b) => {
    // First by rarity
    const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
    const rarityA = a.rarity as keyof typeof rarityOrder;
    const rarityB = b.rarity as keyof typeof rarityOrder;
    
    const rarityDiff = (rarityOrder[rarityA] || 999) - (rarityOrder[rarityB] || 999);
    if (rarityDiff !== 0) return rarityDiff;
    
    // Then by name
    return a.name.localeCompare(b.name);
  });

  return itemsToFilter;
};

  // Get selected item/request details
  const getSelectedItemDetails = () => {
    if (activeTab === 'buy' && selectedItemId) return marketItems.find(item => item.id === selectedItemId);
    if (activeTab === 'sell' && selectedInventoryItemId) return playerInventory.find(item => item.id === selectedInventoryItemId);
    if (activeTab === 'requests' && selectedRequestId) return townRequests.find(req => req.id === selectedRequestId);
    return null;
  };

  const selectedDetails = getSelectedItemDetails();

  // Format price with gold symbol
  const formatPrice = (price: number): string => `${price} G`;

  // Determine price trend icon and animation class
  const getPriceTrendIcon = (item: MarketItem): string => {
    if (!item.priceHistory || item.priceHistory.length < 2) return '→';
    const current = item.price;
    const previous = item.priceHistory[item.priceHistory.length - 2] ?? item.basePrice;
    if (current > previous) return '▲';
    if (current < previous) return '▼';
    return '→';
  };

  // Get trend class for styling
  const getTrendClass = (item: MarketItem): TrendType => {
     if (!item.priceHistory || item.priceHistory.length < 2) return 'stable';
     const current = item.price;
     const previous = item.priceHistory[item.priceHistory.length - 2] ?? item.basePrice;
     if (current > previous * 1.02) return 'up';
     if (current < previous * 0.98) return 'down';
     return 'stable';
  };

  // Handle item selection
  const handleItemClick = (id: string) => {
    if (activeTab === 'buy') {
      setSelectedItemId(id);
      setSelectedInventoryItemId(null);
      setSelectedRequestId(null);
    } else if (activeTab === 'sell') {
      setSelectedInventoryItemId(id);
      setSelectedItemId(null);
      setSelectedRequestId(null);
    }
  };

  // Handle request selection
  const handleRequestClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setSelectedItemId(null);
    setSelectedInventoryItemId(null);
  };

  // Check if player can afford the selected market item
  const canAffordItem = (): boolean => {
     if (!selectedDetails || !('price' in selectedDetails)) return false;
     const item = selectedDetails as MarketItem; // Type assertion
     return playerGold >= item.price;
  };

  // Check if player can fulfill selected request
  const canFulfillRequest = (): boolean => {
    const request = selectedDetails as TownRequest;
    if (!request || !('item' in request)) return false;
    
    // Sum quantity across all stacks for the check
    const totalQuantity = playerInventory
        .filter(item => item.name === request.item)
        .reduce((sum, item) => sum + item.quantity, 0);
        
    return totalQuantity >= request.quantity;
  };

  // Get unique types and categories for filters
  const uniqueTypes = [...new Set(marketItems.map(item => item.type))].sort();
  const uniqueCategories = [...new Set(marketItems.map(item => item.category))].sort();

  // Render Market Items Grid or Inventory Grid
  const renderItemsGrid = () => {
    const items = getFilteredItems();

    if (items.length === 0) {
      return (
        <div className="market-items empty">
          <p>{activeTab === 'buy' 
            ? "No merchandise matches your search..." 
            : "Your satchel is empty, or no items match your criteria..."}</p>
        </div>
      );
    }

    const isSellTab = activeTab === 'sell';
    const currentSelectionId = isSellTab ? selectedInventoryItemId : selectedItemId;

    return (
      <div className="market-items-grid">
        {items.map(item => {
          const invItem = isSellTab ? item as InventoryItem : undefined;
          const marketData = isSellTab 
            ? marketItems.find(mi => mi.id === invItem?.baseId) 
            : item as MarketItem;
            
          // Use market price for buy tab, derive from market data for sell tab preview
          const displayPrice = marketData?.price ?? 0;
          const quality = invItem?.quality;
          const quantity = invItem?.quantity;

          // Calculate potential sell price for sell tab
          let sellPreviewPrice = 0;
           if (isSellTab && quality !== undefined && marketData) {
               const qualityMultiplier = 0.5 + ((quality ?? 70) / 100) * 0.7;
               sellPreviewPrice = Math.max(1, Math.round(marketData.price * qualityMultiplier));
           } else if (isSellTab && !marketData) {
               sellPreviewPrice = Math.max(1, Math.round(((item as InventoryItem).value || 1) * 0.5));
           }

          return (
            <div
              key={item.id}
              className={`market-item ${item.type} ${currentSelectionId === item.id ? 'selected' : ''}`}
              onClick={() => handleItemClick(item.id)}
              title={`${item.name}${quality !== undefined ? ` (Quality: ${quality}%)` : ''}${quantity ? ` (Quantity: ${quantity})` : ''}\n${item.description || ''}`}
            >
              <div className="market-item-category">{item.category}</div>
              <div className="market-item-image">
                <div title={item.name}>{item.name.charAt(0).toUpperCase()}</div>
              </div>
              <div className="market-item-name">{item.name}</div>
              
              {/* Show quantity and quality for sell tab */}
              {isSellTab && (
                 <div className="item-sub-details">
                    {quantity !== undefined && <span>Qty: {quantity}</span>}
                    {quality !== undefined && <span>Q: {quality}%</span>}
                 </div>
              )}
              
              <div className="market-item-price">
                  {/* Display market price for Buy, calculated sell preview for Sell */}
                  {formatPrice(isSellTab ? sellPreviewPrice : displayPrice)}
                  
                  {/* Show trend based on marketData, regardless of tab */}
                  {marketData && (
                    <span className={`trend-indicator ${getTrendClass(marketData)}`}>
                      {getPriceTrendIcon(marketData)}
                    </span>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Town Requests List
  const renderTownRequestsList = () => {
    if (townRequests.length === 0) {
      return (
        <div className="request-list empty">
          <p>The town notice board is empty today...</p>
        </div>
      );
    }

    return (
      <div className="request-list">
        {townRequests.map(request => {
          const playerCanFulfill = canFulfillRequestById(request.id);
          const totalQuantity = playerInventory
              .filter(item => item.name === request.item)
              .reduce((sum, item) => sum + item.quantity, 0);

          return (
            <div
              key={request.id}
              className={`request-item ${selectedRequestId === request.id ? 'selected' : ''}`}
              onClick={() => handleRequestClick(request.id)}
            >
              <div className="request-icon" title={request.requester}>
                {request.requester.charAt(0).toUpperCase()}
              </div>
              <div className="request-details">
                <div className="request-requester">{request.requester}</div>
                <div className="request-item-info">
                  <strong>{request.quantity} × {request.item}</strong>
                  <div className="inventory-check">
                    (You have: {totalQuantity})
                  </div>
                </div>
                <div className="request-rewards">
                  <div className="request-reward request-reward-gold" title={`${request.rewardGold} Gold Reward`}>
                    {request.rewardGold}
                  </div>
                  <div className="request-reward request-reward-influence" title={`${request.rewardInfluence} Reputation`}>
                    +{request.rewardInfluence}
                  </div>
                </div>
                <div className="request-info">
                  <div className="request-difficulty" title={`Difficulty: ${request.difficulty}/5`}>
                    {Array(request.difficulty).fill('★').join('')}
                    {Array(5 - request.difficulty).fill('☆').join('')}
                  </div>
                  <button
                    className={`fulfill-button ${playerCanFulfill ? 'can-fulfill' : 'cant-fulfill'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (playerCanFulfill) {
                        onFulfillRequest(request.id);
                        setSelectedRequestId(null);
                      }
                    }}
                    disabled={!playerCanFulfill}
                  >
                    {playerCanFulfill ? 'Fulfill' : 'Need Items'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper function to check if request can be fulfilled by ID
  const canFulfillRequestById = (requestId: string): boolean => {
    const request = townRequests.find(req => req.id === requestId);
    if (!request) return false;
    
    const totalQuantity = playerInventory
        .filter(item => item.name === request.item)
        .reduce((sum, item) => sum + item.quantity, 0);
        
    return totalQuantity >= request.quantity;
  };

  // Render Details Panel
  const renderDetailsPanel = () => {
    if (!selectedDetails) {
      return (
        <div className="market-item-details empty">
          <p>Select an item or request for details...</p>
        </div>
      );
    }

    // Buy Tab Details
    if (activeTab === 'buy' && selectedDetails && 'basePrice' in selectedDetails) {
      const item = selectedDetails as MarketItem;
      const trendClass = getTrendClass(item);
      
      return (
        <div className="market-item-details">
          <h3>{item.name}</h3>
          <div className="selected-item-header">
             <div className="selected-item-image">
               <div>{item.name.charAt(0).toUpperCase()}</div>
             </div>
             <div className="selected-item-info">
                <div className="selected-item-price">{formatPrice(item.price)}</div>
                <div className={`price-trend ${trendClass}`}>
                   <span className="price-trend-arrow">{getPriceTrendIcon(item)}</span>
                   <span>{trendClass === 'up' ? 'Rising' : trendClass === 'down' ? 'Falling' : 'Stable'}</span>
                </div>
             </div>
          </div>
          <div className="selected-item-description">{item.description || "A mysterious item indeed..."}</div>
          {item.rarity && (
            <div className="selected-item-rarity">Rarity: <span>{item.rarity}</span></div>
          )}
          {item.seasonalBonus && (
            <div className="selected-item-seasonal">Seasonal Bonus: {item.seasonalBonus}</div>
          )}
          <div className="market-actions-panel">
            <button 
              className={`primary ${!canAffordItem() ? 'disabled' : ''}`} 
              onClick={() => onBuyItem(item.id)} 
              disabled={!canAffordItem()}
            >
              Purchase {formatPrice(item.price)}
            </button>
          </div>
        </div>
      );
    }

    // Sell Tab Details
    if (activeTab === 'sell' && selectedDetails && 'quantity' in selectedDetails) {
      const item = selectedDetails as InventoryItem;
      const marketData = marketItems.find(mi => mi.id === item.baseId);
      const baseSellPrice = marketData?.price ?? 0;
      const qualityMultiplier = 0.5 + ((item.quality ?? 70) / 100) * 0.7;
      const actualSellPrice = Math.max(1, Math.round(baseSellPrice * qualityMultiplier));
      const trendClass = marketData ? getTrendClass(marketData) : 'stable';

      return (
        <div className="market-item-details">
          <h3>Sell: {item.name}</h3>
          <div className="selected-item-header">
            <div className="selected-item-image">
              <div>{item.name.charAt(0).toUpperCase()}</div>
            </div>
            <div className="selected-item-info">
              <div className="selected-item-price">You Have: {item.quantity}</div>
              {item.quality !== undefined && (
                <div className="selected-item-quality">Quality: {item.quality}%</div>
              )}
            </div>
          </div>
          <div className="selected-item-description">
            {item.description || "A curious item from your collection..."}
          </div>
          
          {/* Show expected sell price */}
          <div className="expected-sell-price">
            Est. Sell Value: {formatPrice(actualSellPrice)} per item
          </div>
          
          {marketData && (
            <div className={`price-trend ${trendClass}`}>
              <span className="price-trend-arrow">{getPriceTrendIcon(marketData)}</span>
              <span>Market Price is {trendClass}</span>
            </div>
          )}
          
          <div className="market-actions-panel">
            <button 
              className="primary" 
              onClick={() => onSellItem(item.id)} 
              disabled={item.quantity <= 0 || !marketData}
            >
              Sell 1 for {formatPrice(actualSellPrice)}
            </button>
            {item.quantity > 1 && (
              <button 
                className="secondary" 
                onClick={() => {
                  // Call onSellItem repeatedly for each item
                  // This is a placeholder - ideally the backend would handle batch selling
                  onSellItem(item.id);
                }} 
                disabled={!marketData}
              >
                Sell All ({item.quantity}) for {formatPrice(actualSellPrice * item.quantity)}
              </button>
            )}
          </div>
        </div>
      );
    }

    // Requests Tab Details
    if (activeTab === 'requests' && selectedDetails && 'requester' in selectedDetails) {
      const request = selectedDetails as TownRequest;
      const canFulfill = canFulfillRequest();
      const totalQuantity = playerInventory
          .filter(item => item.name === request.item)
          .reduce((sum, item) => sum + item.quantity, 0);
          
      const avgQuality = totalQuantity > 0
         ? Math.round(playerInventory
             .filter(i => i.name === request.item)
             .reduce((s, i) => (s + (i.quality ?? 70) * i.quantity), 0) / totalQuantity)
         : 70;

      return (
        <div className="market-item-details">
          <h3>{request.requester}'s Request</h3>
          <div className="selected-item-description">{request.description}</div>
          <div className="request-requirements">
            <div><strong>Needs:</strong> {request.quantity} × {request.item}</div>
            <div><strong>You Have:</strong> {totalQuantity} {totalQuantity > 0 ? `(Avg Quality: ~${avgQuality}%)` : ''}</div>
            <hr style={{borderColor: 'rgba(72, 61, 102, 0.5)', margin: '15px 0'}}/>
            <div><strong>Rewards:</strong></div>
            <div className="request-rewards">
              <div className="request-reward request-reward-gold">
                {request.rewardGold}
              </div>
              <div className="request-reward request-reward-influence">
                +{request.rewardInfluence}
              </div>
            </div>
            <div className="request-difficulty" style={{justifyContent:'flex-start', marginLeft:0, marginTop:'12px'}}>
              Difficulty: {Array(request.difficulty).fill('★').join('')}
              {Array(5 - request.difficulty).fill('☆').join('')}
            </div>
          </div>
          <div className="market-actions-panel">
            <button 
              className={`primary ${!canFulfill ? 'disabled' : ''}`} 
              onClick={() => onFulfillRequest(request.id)} 
              disabled={!canFulfill}
            >
              {canFulfill ? 'Fulfill Request' : 'Not Enough Items'}
            </button>
          </div>
        </div>
      );
    }

    // Fallback
    return <div className="market-item-details empty">Select an item or request</div>;
  };

  // Render Rumors Section
  const renderRumorsSection = () => {
    const recentRumors = rumors.slice(0, 4);

    return (
      <div className="market-rumors">
        <h3>Market Whispers</h3>
        {recentRumors.length === 0 ? (
          <div className="rumor-list empty">The marketplace is quiet today...</div>
        ) : (
          <div className="rumor-list">
            {recentRumors.map(rumor => (
              <div 
                key={rumor.id} 
                className="rumor-item" 
                title={`${rumor.origin} said this ~${rumor.turnsActive || 0}d ago`}
              >
                {rumor.content}
                {rumor.origin && <span className="rumor-source">— {rumor.origin}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`market-container ${showBlackMarket ? 'black-market-active' : ''}`}>
      {/* Black Market transition effect */}
      {blackMarketTransition && <div className="black-market-transition" />}
      
      {/* Header */}
      <div className="market-header">
        <h2>{showBlackMarket ? "Black Market" : "Town Market"}</h2>
        <div className="market-actions">
          {blackMarketAccess && (
            <button 
              className={`bm-toggle ${showBlackMarket ? 'active' : ''}`} 
              onClick={() => setShowBlackMarket(!showBlackMarket)}
            >
              {showBlackMarket ? 'Return to Town Market' : 'Enter Black Market'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="market-toggle">
        <button 
          className={activeTab === 'buy' ? 'active' : ''} 
          onClick={() => setActiveTab('buy')}
        >
          Buy
        </button>
        <button 
          className={activeTab === 'sell' ? 'active' : ''} 
          onClick={() => setActiveTab('sell')}
        >
          Sell
        </button>
        <button 
          className={activeTab === 'requests' ? 'active' : ''} 
          onClick={() => setActiveTab('requests')}
        >
          Requests ({townRequests.length})
        </button>
      </div>

       {/* Filters (Only for Buy/Sell) */}
       {activeTab !== 'requests' && (
         <div className="market-filters">
           <select 
             value={typeFilter} 
             onChange={(e) => setTypeFilter(e.target.value)}
           >
             <option value="all">All Types</option>
             {uniqueTypes.map(type => (
               <option key={type} value={type}>
                 {type.charAt(0).toUpperCase() + type.slice(1)}
               </option>
             ))}
           </select>
           <select 
             value={categoryFilter} 
             onChange={(e) => setCategoryFilter(e.target.value)}
           >
             <option value="all">All Categories</option>
             {uniqueCategories.map(cat => (
               <option key={cat} value={cat}>
                 {cat.charAt(0).toUpperCase() + cat.slice(1)}
               </option>
             ))}
           </select>
           <div className="market-search">
             <input 
               type="text" 
               placeholder="Search items..." 
               value={searchTerm} 
               onChange={(e) => setSearchTerm(e.target.value)} 
             />
           </div>
         </div>
       )}

      {/* Main Content Area */}
      <div className="market-content">
        {/* Left Panel: Item Grid or Requests List */}
        <div className="market-listings">
          {activeTab === 'requests' ? renderTownRequestsList() : renderItemsGrid()}
        </div>

        {/* Right Sidebar: Wallet, Details, Rumors */}
        <div className="market-sidebar">
          <div className="market-wallet">
            <h3>My Purse</h3>
            <div className="wallet-amount">{formatPrice(playerGold)}</div>
          </div>
          
          {renderDetailsPanel()}
          {renderRumorsSection()}
          
          {blackMarketAccess && showBlackMarket && (
            <div className="black-market-notice">
              Keep your wits about you in these shadowed stalls...
            </div>
          )}
        </div>
      </div>
    </div>
  );
  };

  export default Market;