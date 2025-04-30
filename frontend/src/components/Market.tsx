import React, { useState, useEffect } from 'react';
import './Market.css';
import { InventoryItem, MarketItem, Rumor, TownRequest } from 'coven-shared'; // Use shared types
import Requests from './Requests'; // Import Requests component

// Define default quality locally if needed for display fallback
const DEFAULT_ITEM_QUALITY = 70;

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
  // onSpreadRumor?: (rumorId: string) => void; // Removed unused prop
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
  // onSpreadRumor // Removed unused prop
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
           sellableMarketIds.has(invItem.baseId) && invItem.quantity > 0 // Check baseId against market IDs
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
  // Removed unused handleRequestClick function
  // const handleRequestClick = (requestId: string) => { ... }

  // Check if player can afford the selected market item
  const canAffordItem = (): boolean => {
     if (!selectedDetails || !('price' in selectedDetails)) return false; // Ensure price exists
     const item = selectedDetails as MarketItem; // Type assertion
     return playerGold >= item.price;
  };

  // Check if player has enough items to fulfill selected request
  const canFulfillRequest = (): boolean => {
    const request = selectedDetails as TownRequest; // Type assertion
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
          <p>{activeTab === 'buy' ? "No items match filters." : "Inventory empty or no sellable items match filters."}</p>
        </div>
      );
    }

    const isSellTab = activeTab === 'sell';
    const currentSelectionId = isSellTab ? selectedInventoryItemId : selectedItemId;

    return (
      <div className="market-items-grid">
        {items.map(item => {
          const invItem = isSellTab ? item as InventoryItem : undefined; // Only cast if sell tab
          const marketData = isSellTab ? marketItems.find(mi => mi.id === invItem?.baseId) : item as MarketItem; // Use baseId for lookup if sell tab
          // Use market price directly for buy tab, derive from market data for sell tab preview
          const displayPrice = marketData?.price ?? 0; // Use market price as the base
          const quality = invItem?.quality; // Get quality if it's an inventory item
          const quantity = invItem?.quantity; // Get quantity

          // Calculate potential sell price for display on Sell tab item card
          let sellPreviewPrice = 0;
           if (isSellTab && quality !== undefined && marketData) {
               const qualityMultiplier = 0.5 + ((quality ?? DEFAULT_ITEM_QUALITY) / 100) * 0.7; // Use local DEFAULT_ITEM_QUALITY
               sellPreviewPrice = Math.max(1, Math.round(marketData.price * qualityMultiplier));
           } else if (isSellTab && !marketData) {
               // Handle case where inventory item exists but corresponding market item doesn't (shouldn't happen with current filtering)
               sellPreviewPrice = Math.max(1, Math.round((item.value || 1) * 0.5)); // Fallback to low price based on base value
           }


          return (
            <div
              key={item.id} // Use inventory item ID if selling, market ID if buying
              className={`market-item ${item.type} ${currentSelectionId === item.id ? 'selected' : ''}`}
              onClick={() => handleItemClick(item.id)} // Always pass item.id
              title={`${item.name}${quality !== undefined ? ` (Q: ${quality}%)` : ''}${quantity ? ` (Qty: ${quantity})` : ''}\n${item.description || ''}`}
            >
              <div className="market-item-image">
                {/* Add placeholder image logic */}
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
                  {marketData && <span className={`trend-indicator ${getTrendClass(marketData)}`}>{getPriceTrendIcon(marketData)}</span>}
              </div>
              <div className="market-item-category">{item.category}</div>
            </div>
          );
        })}
      </div>
    );
  };


  // Render Town Requests List (using imported component)
  const renderTownRequestsTab = () => (
      <div className="market-requests-tab"> {/* Added wrapper div */}
          <Requests
              townRequests={townRequests}
              playerInventory={playerInventory}
              onFulfillRequest={(reqId) => {
                  // Wrap fulfill action and potentially clear selection
                  onFulfillRequest(reqId);
                  setSelectedRequestId(null); // Clear selection after fulfilling
              }}
          />
      </div>
  );

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
         const marketData = marketItems.find(mi => mi.id === item.baseId);
         const baseSellPrice = marketData?.price ?? 0; // Use 0 if no market data? Or item's base value?
         const qualityMultiplier = 0.5 + ((item.quality ?? DEFAULT_ITEM_QUALITY) / 100) * 0.7;
         const actualSellPrice = Math.max(1, Math.round(baseSellPrice * qualityMultiplier));
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
             <button className="secondary" onClick={() => onSellItem(item.id)} disabled={item.quantity <= 0 || !marketData}> {/* Disable if not sellable */}
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
         const totalQuantity = playerInventory
             .filter(item => item.name === request.item)
             .reduce((sum, item) => sum + item.quantity, 0);
         const avgQuality = totalQuantity > 0
            ? Math.round(playerInventory.filter(i => i.name === request.item).reduce((s, i) => (s + (i.quality ?? DEFAULT_ITEM_QUALITY) * i.quantity), 0) / totalQuantity)
            : DEFAULT_ITEM_QUALITY; // Calculate average quality


        return (
            <div className="market-item-details">
                <h3>Request: {request.requester}</h3>
                <div className="selected-item-description">{request.description}</div>
                <div className="request-requirements">
                    <div><strong>Need:</strong> {request.quantity} x {request.item}</div>
                    <div><strong>You Have:</strong> {totalQuantity} {totalQuantity > 0 ? `(Avg Q: ~${avgQuality}%)` : ''}</div>
                    <hr style={{borderColor: 'var(--color-border)', margin: '10px 0'}}/>
                    <div><strong>Reward:</strong></div>
                    <div>💰 {request.rewardGold} Gold</div>
                    <div>⭐ +{request.rewardInfluence} Reputation</div>
                     <div className="request-difficulty" style={{justifyContent:'flex-start', marginLeft:0, marginTop:'5px'}}>
                         Difficulty:   {/* Added non-breaking space */}
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

    // Fallback if no details match
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
           {activeTab === 'requests' ? renderTownRequestsTab() : renderItemsGrid()}
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