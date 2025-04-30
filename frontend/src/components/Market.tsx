import React, { useState, useEffect } from 'react';
import './Market.css'; // Ensure this uses the new styles
import { InventoryItem, MarketItem, Rumor, TownRequest } from 'coven-shared';
import Requests from './Requests'; // Import Requests component

const DEFAULT_ITEM_QUALITY = 70; // Fallback quality for calculations

interface MarketProps {
  playerGold: number;
  playerInventory: InventoryItem[];
  marketItems: MarketItem[];
  rumors: Rumor[];
  townRequests: TownRequest[];
  blackMarketAccess: boolean;
  onBuyItem: (itemId: string) => void; // Expects MarketItem ID
  onSellItem: (inventoryItemId: string) => void; // Expects InventoryItem ID
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
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'requests'>('buy');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null); // MarketItem ID (Buy Tab) or InventoryItem ID (Sell Tab)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showBlackMarket, setShowBlackMarket] = useState<boolean>(false);

  // Reset selection when changing tabs or BM view
  useEffect(() => {
    setSelectedItemId(null);
    setSelectedRequestId(null);
  }, [activeTab, showBlackMarket]);

  // Filter items
  const getFilteredItems = () => {
    let itemsToFilter: (MarketItem | InventoryItem)[] = [];
    const currentIsBuyTab = activeTab === 'buy';
    const currentIsSellTab = activeTab === 'sell';

    if (currentIsBuyTab) {
        // Assume items are buyable unless blackMarketOnly is true and BM is hidden
        // Removed check for non-existent 'buyable' property
        itemsToFilter = marketItems.filter(item =>
            (!item.blackMarketOnly || (item.blackMarketOnly && showBlackMarket))
        );
    } else if (currentIsSellTab) {
        // Assume items are sellable if their baseId exists in the marketItems array
        // Removed check for non-existent 'sellable' property
        const sellableMarketItemIds = new Set(marketItems.map(mi => mi.id)); // Use MarketItem ID (which corresponds to baseId)
        itemsToFilter = playerInventory.filter(invItem =>
            sellableMarketItemIds.has(invItem.baseId) && invItem.quantity > 0
        );
    }

    // Apply common filters
    if (categoryFilter !== 'all') itemsToFilter = itemsToFilter.filter(item => item.category === categoryFilter);
    if (typeFilter !== 'all') itemsToFilter = itemsToFilter.filter(item => item.type === typeFilter);
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        itemsToFilter = itemsToFilter.filter(item => item.name.toLowerCase().includes(term));
    }

    // Sort (example: by name)
    itemsToFilter.sort((a, b) => a.name.localeCompare(b.name));
    return itemsToFilter;
  };


  const getSelectedItemDetails = (): MarketItem | InventoryItem | TownRequest | null => {
      if (activeTab === 'buy' && selectedItemId) return marketItems.find(item => item.id === selectedItemId) || null;
      if (activeTab === 'sell' && selectedItemId) return playerInventory.find(item => item.id === selectedItemId) || null;
      if (activeTab === 'requests' && selectedRequestId) return townRequests.find(req => req.id === selectedRequestId) || null;
      return null;
  };

  const selectedDetails = getSelectedItemDetails();

  // --- Price/Trend Helpers ---
  const formatPrice = (price: number): string => `${price} G`;

  const getPriceTrendInfo = (item: MarketItem): { icon: string; class: string; text: string } => {
      const history = item.priceHistory;
      if (!history || history.length < 2) return { icon: '→', class: 'stable', text: 'Stable' };
      const current = item.price;
      const previous = history[history.length - 2] ?? item.basePrice;
      const changePercent = previous === 0 ? (current > 0 ? 1 : 0) : (current - previous) / previous;

      if (changePercent > 0.02) return { icon: '▲', class: 'up', text: 'Rising' };
      if (changePercent < -0.02) return { icon: '▼', class: 'down', text: 'Falling' };
      return { icon: '→', class: 'stable', text: 'Stable' };
  };

  // --- Capability Checks ---
  const canAffordSelectedItem = (): boolean => {
      if (activeTab !== 'buy' || !selectedDetails || !('price' in selectedDetails)) return false;
      return playerGold >= (selectedDetails as MarketItem).price;
  };

  // --- Event Handlers ---
  const handleItemClick = (id: string) => { // ID is MarketItem ID (buy) or InventoryItem ID (sell)
      setSelectedItemId(id);
      setSelectedRequestId(null); // Clear request selection
  };

  // --- Unique Filter Values ---
  const uniqueTypes = [...new Set(marketItems.map(item => item.type))].sort();
  const uniqueCategories = [...new Set(marketItems.map(item => item.category))].sort();


  // --- Render Functions ---

  const renderItemsGrid = () => {
    const items = getFilteredItems();
    if (items.length === 0) {
      return <div className="market-items empty"><p>Nothing to show here!</p></div>;
    }

    const isSellTab = activeTab === 'sell';

    return (
      <div className="market-items-grid">
        {items.map(item => {
          const marketItemData = isSellTab
              ? marketItems.find(mi => mi.id === (item as InventoryItem).baseId)
              : item as MarketItem;

          const invItem = isSellTab ? item as InventoryItem : undefined;
          const quality = invItem?.quality;
          const quantity = invItem?.quantity;

          let displayPrice = 0;
          let sellPreviewPrice = 0;

          if (!isSellTab && marketItemData) { // Corrected scoping for isSellTab
              displayPrice = marketItemData.price;
          } else if (isSellTab && marketItemData) {
              const qualityMultiplier = 0.5 + ((quality ?? DEFAULT_ITEM_QUALITY) / 100) * 0.7;
              sellPreviewPrice = Math.max(1, Math.round(marketItemData.price * qualityMultiplier));
              displayPrice = sellPreviewPrice;
          }

          const trendInfo = marketItemData ? getPriceTrendInfo(marketItemData) : { icon: '?', class: 'stable', text:'N/A' };

          return (
            <div
              key={item.id}
              className={`market-item ${selectedItemId === item.id ? 'selected' : ''}`}
              onClick={() => handleItemClick(item.id)}
              title={`${item.name}${quality !== undefined ? ` (Q: ${quality}%)` : ''}${quantity ? ` (Qty: ${quantity})` : ''}\n${item.description || ''}`}
            >
              <div className="market-item-image">
                 <div title={item.name}>{item.name.charAt(0).toUpperCase()}</div>
              </div>
              <div className="market-item-name">{item.name}</div>
              {isSellTab && (
                 <div className="item-sub-details">
                      {quantity !== undefined && <span>Qty: {quantity}</span>}
                      {quality !== undefined && <span>Q: {quality}%</span>}
                  </div>
              )}
              <div className="market-item-price">
                  {formatPrice(displayPrice)}
                  <span className={`trend-indicator ${trendInfo.class}`} title={`Trend: ${trendInfo.text}`}>{trendInfo.icon}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTownRequestsTab = () => (
      <div className="market-requests-tab">
          <Requests
              townRequests={townRequests}
              playerInventory={playerInventory}
              onFulfillRequest={(reqId) => {
                  onFulfillRequest(reqId);
                  setSelectedRequestId(null);
              }}
          />
      </div>
  );

  const renderDetailsPanel = () => {
    if (!selectedDetails) {
      return <div className="market-item-details empty">Select an item</div>;
    }

    // --- Buy Tab Details ---
    if (activeTab === 'buy' && 'basePrice' in selectedDetails) {
      const item = selectedDetails as MarketItem;
      const trendInfo = getPriceTrendInfo(item);
      const canAfford = canAffordSelectedItem();
      return (
        <div className="market-item-details">
          <h3>{item.name}</h3>
          <div className="selected-item-header">
             <div className="selected-item-image"><div>{item.name.charAt(0).toUpperCase()}</div></div>
             <div className="selected-item-info">
                <div className="selected-item-price">{formatPrice(item.price)}</div>
                 <div className={`price-trend ${trendInfo.class}`} title={trendInfo.text}>
                     <span className="price-trend-arrow">{trendInfo.icon}</span>
                 </div>
             </div>
          </div>
          <div className="selected-item-description">{item.description}</div>
          {item.rarity && <div className="selected-item-rarity">Rarity: <span>{item.rarity}</span></div>}
          <div className="market-actions-panel">
            <button className={`primary ${!canAfford ? 'disabled' : ''}`} onClick={() => onBuyItem(item.id)} disabled={!canAfford}>
              Buy ({formatPrice(item.price)}) { !canAfford && '(Need More G)'}
            </button>
          </div>
        </div>
      );
    }

    // --- Sell Tab Details ---
    if (activeTab === 'sell' && 'quantity' in selectedDetails) {
        const item = selectedDetails as InventoryItem;
        const marketData = marketItems.find(mi => mi.id === item.baseId);
        // Assuming items found in marketItems are implicitly sellable
        // Removed check for non-existent 'sellable' property
        if (!marketData) {
             return <div className="market-item-details empty">This item cannot be sold here.</div>;
        }

        const qualityMultiplier = 0.5 + ((item.quality ?? DEFAULT_ITEM_QUALITY) / 100) * 0.7;
        const actualSellPrice = Math.max(1, Math.round(marketData.price * qualityMultiplier));
        const trendInfo = getPriceTrendInfo(marketData);

        return (
        <div className="market-item-details">
           <h3>Sell: {item.name}</h3>
           <div className="selected-item-header">
               <div className="selected-item-image"><div>{item.name.charAt(0).toUpperCase()}</div></div>
               <div className="selected-item-info">
                   <div className="selected-item-price">Have: {item.quantity}</div>
                    {item.quality !== undefined && <div className="selected-item-quality">Quality: {item.quality}%</div>}
               </div>
           </div>
            <div className="selected-item-description">{item.description || 'No description.'}</div>
             <div className="expected-sell-price">
                 Sell Value: {formatPrice(actualSellPrice)} each
                 <div className={`price-trend ${trendInfo.class}`} title={`Market Trend: ${trendInfo.text}`}>
                    <span className="price-trend-arrow">{trendInfo.icon}</span>
                 </div>
             </div>
           <div className="market-actions-panel">
             <button className="secondary" onClick={() => onSellItem(item.id)} disabled={item.quantity <= 0}>
               Sell 1 ({formatPrice(actualSellPrice)})
             </button>
             {/* TODO: Add Sell All button */}
           </div>
         </div>
       );
    }

    // --- Requests Tab Details (Handled by Requests component) ---

    return <div className="market-item-details empty">Select an item</div>; // Fallback
  };


  const renderRumorsSection = () => {
    const recentRumors = rumors.slice(0, 4); // Show latest 4

    return (
        <div className="market-rumors">
            <h3>Market Whispers</h3>
            {recentRumors.length === 0 ? (
                <div className="rumor-list empty">The marketplace is quiet...</div>
            ) : (
                <div className="rumor-list">
                    {recentRumors.map(rumor => (
                        <div key={rumor.id} className="rumor-item" title={`Heard from ${rumor.origin} ~${rumor.turnsActive || '?'}d ago`}>
                           "{rumor.content}"
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="market-container">
      <div className="market-header">
        <h2>Town Market</h2>
        <div className="market-actions">
          {blackMarketAccess && (
            <button className={`bm-toggle ${showBlackMarket ? 'active' : ''}`} onClick={() => setShowBlackMarket(!showBlackMarket)}>
              {showBlackMarket ? 'Leave Alley' : 'Dark Alley'}
            </button>
          )}
        </div>
      </div>

      <div className="market-toggle">
        <button className={activeTab === 'buy' ? 'active' : ''} onClick={() => setActiveTab('buy')}>Buy</button>
        <button className={activeTab === 'sell' ? 'active' : ''} onClick={() => setActiveTab('sell')}>Sell</button>
        <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>Requests ({townRequests.length})</button>
      </div>

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
               <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
       )}

      <div className="market-content">
        <div className="market-listings">
           {activeTab === 'requests' ? renderTownRequestsTab() : renderItemsGrid()}
        </div>
        <div className="market-sidebar">
          <div className="market-wallet">
            <h3>Wallet</h3>
            <div className="wallet-amount">{formatPrice(playerGold)}</div>
          </div>
           {/* Only render details panel for buy/sell */}
           {activeTab !== 'requests' && renderDetailsPanel()}
           {renderRumorsSection()}
           {blackMarketAccess && showBlackMarket && (
               <div className="black-market-notice">Viewing Black Market...</div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Market;