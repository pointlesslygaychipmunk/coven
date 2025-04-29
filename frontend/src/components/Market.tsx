import React, { useState, useEffect } from 'react';
import './Market.css';
import { InventoryItem, MarketItem, Rumor, TownRequest } from 'coven-shared'; // Use shared types

interface MarketProps {
  playerGold: number;
  playerInventory: InventoryItem[];
  marketItems: MarketItem[];
  rumors: Rumor[];
  townRequests: TownRequest[];
  blackMarketAccess: boolean;
  onBuyItem: (itemId: string) => void;
  onSellItem: (inventoryItemId: string) => void; // Expect inventory item ID
  onFulfillRequest: (requestId: string) => void;
  onSpreadRumor?: (rumorId: string) => void; // Optional rumor spreading
}

const Market: React.FC<MarketProps> = ({
  playerGold,
  playerInventory = [], // Default to empty array
  marketItems = [],
  rumors = [],
  townRequests = [],
  blackMarketAccess,
  onBuyItem,
  onSellItem,
  onFulfillRequest,
  onSpreadRumor
}) => {
  // State
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'requests'>('buy');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null); // ID for buy tab item
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null); // ID for sell tab item
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null); // ID for request tab item
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showBlackMarket, setShowBlackMarket] = useState<boolean>(false); // Toggle for BM visibility

  // Reset selection when changing tabs
  useEffect(() => {
    setSelectedItemId(null);
    setSelectedInventoryItemId(null);
    setSelectedRequestId(null);
  }, [activeTab]);

  // Filter items based on current filters and search
  const getFilteredItems = () => {
    let itemsToFilter: (MarketItem | InventoryItem)[] = [];

    if (activeTab === 'buy') {
      itemsToFilter = marketItems.filter(item => !item.blackMarketOnly || (item.blackMarketOnly && showBlackMarket));
    } else if (activeTab === 'sell') {
      // Filter inventory items that actually exist in the market definition (sellable)
      // and have quantity > 0
      const sellableMarketIds = new Set(marketItems.map(mi => mi.id));
       itemsToFilter = playerInventory.filter(invItem =>
           sellableMarketIds.has(invItem.id) && invItem.quantity > 0
       );
    } else {
        return []; // No items for requests tab listing
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

    // Sort maybe? (e.g., by name, price)
    itemsToFilter.sort((a, b) => a.name.localeCompare(b.name));

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


  // Format price (reusable)
  const formatPrice = (price: number): string => `${price} G`; // Use 'G' for gold

  // Determine price trend icon
  const getPriceTrendIcon = (item: MarketItem): string => {
    if (!item.priceHistory || item.priceHistory.length < 2) return '→';
    const current = item.price;
    const previous = item.priceHistory[item.priceHistory.length - 2] ?? item.basePrice;
    if (current > previous) return '▲'; // Up arrow
    if (current < previous) return '▼'; // Down arrow
    return '→'; // Stable arrow
  };

  // Get trend class for styling
  const getTrendClass = (item: MarketItem): string => {
     if (!item.priceHistory || item.priceHistory.length < 2) return 'stable';
     const current = item.price;
     const previous = item.priceHistory[item.priceHistory.length - 2] ?? item.basePrice;
     if (current > previous * 1.02) return 'up'; // Only show trend if > 2% change
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
      setSelectedInventoryItemId(id); // This is the inventory item's ID
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
     const item = selectedDetails as MarketItem; // Type assertion
     return !!(item && 'price' in item && playerGold >= item.price);
  };

  // Check if player has enough items to fulfill selected request
  const canFulfillRequest = (): boolean => {
    const request = selectedDetails as TownRequest; // Type assertion
    if (!request || !('item' in request)) return false;
    const requiredItemInv = playerInventory.find(item => item.name === request.item);
    return !!(requiredItemInv && requiredItemInv.quantity >= request.quantity);
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
          <p>{activeTab === 'buy' ? "No items match filters." : "Inventory empty or no sellable items match filters."}</p>
        </div>
      );
    }

    const isSellTab = activeTab === 'sell';
    const currentSelectionId = isSellTab ? selectedInventoryItemId : selectedItemId;

    return (
      <div className="market-items-grid">
        {items.map(item => {
          const marketData = isSellTab ? marketItems.find(mi => mi.id === item.id) : item as MarketItem;
          const displayPrice = marketData?.price ?? (item as InventoryItem).value ?? 0; // Fallback value if needed
          const quality = (item as InventoryItem).quality; // Get quality if it's an inventory item
          const quantity = (item as InventoryItem).quantity; // Get quantity

          return (
            <div
              key={item.id}
              className={`market-item ${item.type} ${currentSelectionId === item.id ? 'selected' : ''}`}
              onClick={() => handleItemClick(item.id)} // Always pass item.id
              title={`${item.name}${quality ? ` (Q: ${quality}%)` : ''}${quantity ? ` (Qty: ${quantity})` : ''}\n${item.description || ''}`}
            >
              <div className="market-item-image">
                {/* Add placeholder image logic */}
                 <div title={item.name}>{item.name.charAt(0).toUpperCase()}</div>
              </div>
              <div className="market-item-name">{item.name}</div>
              {/* Show quantity and quality for sell tab */}
              {isSellTab && (
                 <div className="item-sub-details">
                      {quantity && <span>Qty: {quantity}</span>}
                      {quality && <span>Q: {quality}%</span>}
                  </div>
              )}
              <div className="market-item-price">
                  {formatPrice(displayPrice)}
                  {marketData && <span className={`trend-indicator ${getTrendClass(marketData)}`}>{getPriceTrendIcon(marketData)}</span>}
              </div>
              <div className="market-item-category">{item.category}</div>
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
          <p>No active requests at the moment.</p>
        </div>
      );
    }

    return (
      <div className="request-list">
        {townRequests.map(request => (
          <div
            key={request.id}
            className={`request-item ${selectedRequestId === request.id ? 'selected' : ''}`}
            onClick={() => handleRequestClick(request.id)}
             title={`Request from ${request.requester}`}
          >
            <div className="request-icon" title={request.requester}>
              {request.requester.charAt(0).toUpperCase()}
            </div>
            <div className="request-details">
              <div className="request-requester">{request.requester}</div>
              <div className="request-description">
                Wants: {request.quantity} x {request.item}
              </div>
              <div className="request-rewards">
                <div className="request-reward request-reward-gold" title={`${request.rewardGold} Gold Reward`}>
                  💰 {request.rewardGold}
                </div>
                <div className="request-reward request-reward-influence" title={`${request.rewardInfluence} Reputation Reward`}>
                  ⭐ +{request.rewardInfluence}
                </div>
              </div>
            </div>
            <div className="request-difficulty" title={`Difficulty: ${request.difficulty}/5`}>
              {Array(request.difficulty).fill('★').join('')}
              {Array(5 - request.difficulty).fill('☆').join('')}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render Details Panel
  const renderDetailsPanel = () => {
    if (!selectedDetails) {
      return <div className="market-item-details empty">Select an item or request</div>;
    }

    // --- Buy Tab Details ---
    if (activeTab === 'buy' && selectedDetails && 'basePrice' in selectedDetails) {
      const item = selectedDetails as MarketItem;
      const trendClass = getTrendClass(item);
      return (
        <div className="market-item-details">
          <h3>{item.name}</h3>
          <div className="selected-item-header">
             <div className="selected-item-image"><div>{item.name.charAt(0).toUpperCase()}</div></div>
             <div className="selected-item-info">
                <div className="selected-item-price">{formatPrice(item.price)}</div>
                 <div className={`price-trend ${trendClass}`}>
                     <span className="price-trend-arrow">{getPriceTrendIcon(item)}</span>
                     <span>{trendClass === 'up' ? 'Rising' : trendClass === 'down' ? 'Falling' : 'Stable'}</span>
                 </div>
             </div>
          </div>
          <div className="selected-item-description">{item.description}</div>
          {item.rarity && <div className="selected-item-rarity">Rarity: <span>{item.rarity}</span></div>}
          {/* Add more details like properties if available */}
          <div className="market-actions-panel">
            <button className={`primary ${!canAffordItem() ? 'disabled' : ''}`} onClick={() => onBuyItem(item.id)} disabled={!canAffordItem()}>
              Buy ( {formatPrice(item.price)} )
            </button>
          </div>
        </div>
      );
    }

    // --- Sell Tab Details ---
    if (activeTab === 'sell' && selectedDetails && 'quantity' in selectedDetails) {
         const item = selectedDetails as InventoryItem;
         // Find corresponding market data for price trend and base sell price
         const marketData = marketItems.find(mi => mi.id === item.id);
         const baseSellPrice = marketData?.price ?? item.value ?? 0;
         // Adjust sell price based on quality (e.g., 50% quality = 75% base price, 100% quality = 100% base price)
         const qualityMultiplier = 0.5 + ((item.quality ?? 50) / 100) * 0.5;
         const actualSellPrice = Math.round(baseSellPrice * qualityMultiplier);
         const trendClass = marketData ? getTrendClass(marketData) : 'stable';


        return (
        <div className="market-item-details">
           <h3>Sell: {item.name}</h3>
           <div className="selected-item-header">
               <div className="selected-item-image"><div>{item.name.charAt(0).toUpperCase()}</div></div>
               <div className="selected-item-info">
                   <div className="selected-item-price">You Have: {item.quantity}</div>
                    {item.quality !== undefined && <div className="selected-item-quality">Quality: {item.quality}%</div>}
               </div>
           </div>
            <div className="selected-item-description">{item.description || 'No description available.'}</div>
             {/* Show expected sell price */}
             <div className="expected-sell-price">
                 Est. Sell Value: {formatPrice(actualSellPrice)} per item
                 {marketData && (
                     <div className={`price-trend ${trendClass}`}>
                        <span className="price-trend-arrow">{getPriceTrendIcon(marketData)}</span>
                        <span>Market Price is {trendClass}</span>
                    </div>
                 )}
             </div>
           <div className="market-actions-panel">
             <button className="secondary" onClick={() => onSellItem(item.id)} disabled={item.quantity <= 0}>
               Sell 1 ( {formatPrice(actualSellPrice)} )
             </button>
              {/* TODO: Add Sell All / Sell Stack button */}
           </div>
         </div>
       );
    }

     // --- Requests Tab Details ---
    if (activeTab === 'requests' && selectedDetails && 'requester' in selectedDetails) {
        const request = selectedDetails as TownRequest;
        const canFulfill = canFulfillRequest();
        const requiredItemInv = playerInventory.find(item => item.name === request.item);

        return (
            <div className="market-item-details">
                <h3>Request: {request.requester}</h3>
                <div className="selected-item-description">{request.description}</div>
                <div className="request-requirements">
                    <div><strong>Need:</strong> {request.quantity} x {request.item}</div>
                    <div><strong>You Have:</strong> {requiredItemInv?.quantity ?? 0} {requiredItemInv?.quality ? `(Q: ${requiredItemInv.quality}%)` : ''}</div>
                    <hr style={{borderColor: 'var(--color-border)', margin: '10px 0'}}/>
                    <div><strong>Reward:</strong></div>
                    <div>💰 {request.rewardGold} Gold</div>
                    <div>⭐ +{request.rewardInfluence} Reputation</div>
                     <div className="request-difficulty" style={{justifyContent:'flex-start', marginLeft:0, marginTop:'5px'}}>
                         Difficulty: &nbsp;
                          {Array(request.difficulty).fill('★').join('')}
                          {Array(5 - request.difficulty).fill('☆').join('')}
                      </div>
                </div>
                <div className="market-actions-panel">
                    <button className={`primary ${!canFulfill ? 'disabled' : ''}`} onClick={() => onFulfillRequest(request.id)} disabled={!canFulfill}>
                        {canFulfill ? 'Fulfill Request' : 'Not Enough Items'}
                    </button>
                </div>
            </div>
        );
    }

    return <div className="market-item-details empty">Select an item or request</div>;
  };


  // Render Rumors Section
  const renderRumorsSection = () => {
    const recentRumors = rumors // Sort by turn? Or just show latest few
        // .sort((a, b) => (b.turn ?? 0) - (a.turn ?? 0)) // Requires 'turn' on Rumor type
        .slice(0, 4); // Show latest 4

    return (
        <div className="market-rumors">
            <h3>Market Whispers</h3>
            {recentRumors.length === 0 ? (
                <div className="rumor-list empty">The marketplace is quiet...</div>
            ) : (
                <div className="rumor-list">
                    {recentRumors.map(rumor => (
                        <div key={rumor.id} className="rumor-item" title={`${rumor.origin} said this ~${rumor.turnsActive || 0}d ago`}>
                           "{rumor.content}"
                           {/* <span className="rumor-source">— {rumor.origin}</span> */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
  };


  return (
    <div className="market-container">
      {/* Header */}
      <div className="market-header">
        <h2>Town Market</h2>
        <div className="market-actions">
          {blackMarketAccess && (
            <button className={`bm-toggle ${showBlackMarket ? 'active' : ''}`} onClick={() => setShowBlackMarket(!showBlackMarket)}>
              {showBlackMarket ? 'Leave Black Market' : 'Enter Black Market'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="market-toggle">
        <button className={activeTab === 'buy' ? 'active' : ''} onClick={() => setActiveTab('buy')}>Buy</button>
        <button className={activeTab === 'sell' ? 'active' : ''} onClick={() => setActiveTab('sell')}>Sell</button>
        <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>Requests ({townRequests.length})</button>
      </div>

       {/* Filters (Only for Buy/Sell) */}
       {activeTab !== 'requests' && (
           <div className="market-filters">
               <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                   <option value="all">All Types</option>
                   {uniqueTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
               </select>
               <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                   <option value="all">All Categories</option>
                   {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
               </select>
               <div className="market-search">
                   <input type="text" placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
            <h3>My Wallet</h3>
            <div className="wallet-amount">{formatPrice(playerGold)}</div>
          </div>
           {renderDetailsPanel()}
           {renderRumorsSection()}
           {blackMarketAccess && showBlackMarket && (
               <div className="black-market-notice">Viewing illicit Black Market goods...</div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Market;