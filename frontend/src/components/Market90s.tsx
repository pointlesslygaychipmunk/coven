import React, { useState, useEffect } from 'react';
import './Market90s.css';
import type { InventoryItem } from 'coven-shared';

interface MarketItem {
  id: string;
  name: string;
  type: string;
  price: number;
  description?: string;
  rarity?: string;
}

interface TownRequest {
  id: string;
  title: string;
  requester: string;
  description: string;
  reward: number;
  requiredItems: string[];
  deadline?: number;
}

interface Rumor {
  id: string;
  text: string;
  source: string;
  discovered: boolean;
}

interface Market90sProps {
  playerGold: number;
  playerInventory: InventoryItem[];
  marketItems: MarketItem[];
  townRequests: TownRequest[];
  rumors: Rumor[];
  blackMarketAccess?: boolean;
  onBuyItem: (itemId: string) => void;
  onSellItem: (inventoryItemId: string) => void;
  onFulfillRequest: (requestId: string) => void;
}

const Market90s: React.FC<Market90sProps> = ({
  playerGold = 100,
  playerInventory = [],
  marketItems = [],
  townRequests = [],
  rumors = [],
  blackMarketAccess = false,
  onBuyItem,
  onSellItem,
  onFulfillRequest
}) => {
  // State for market tabs
  const [activeSection, setActiveSection] = useState<string>("shop");
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TownRequest | null>(null);
  const [showBlackMarket, setShowBlackMarket] = useState<boolean>(false);
  
  // Market background ambience
  const [marketAmbience, setMarketAmbience] = useState<boolean>(true);

  // Reset selection when changing tabs
  useEffect(() => {
    setSelectedItem(null);
    setSelectedInventoryItem(null);
    setSelectedRequest(null);
  }, [activeSection]);
  
  // Handle item selection in shop
  const handleItemSelect = (item: MarketItem) => {
    setSelectedItem(prev => prev?.id === item.id ? null : item);
  };
  
  // Handle inventory item selection
  const handleInventorySelect = (item: InventoryItem) => {
    setSelectedInventoryItem(prev => prev?.id === item.id ? null : item);
  };
  
  // Handle request selection
  const handleRequestSelect = (request: TownRequest) => {
    setSelectedRequest(prev => prev?.id === request.id ? null : request);
  };
  
  // Handle buying an item
  const handleBuy = () => {
    if (!selectedItem) return;
    
    if (playerGold < selectedItem.price) {
      alert("Not enough gold!");
      return;
    }
    
    onBuyItem(selectedItem.id);
    setSelectedItem(null);
  };
  
  // Handle selling an item
  const handleSell = () => {
    if (!selectedInventoryItem) return;
    onSellItem(selectedInventoryItem.id);
    setSelectedInventoryItem(null);
  };
  
  // Handle fulfilling a request
  const handleFulfillRequest = () => {
    if (!selectedRequest) return;
    
    // Check if player has all required items
    const requiredItems = selectedRequest.requiredItems;
    const inventory = playerInventory.reduce<Record<string, number>>((acc, item) => {
      acc[item.name] = (acc[item.name] || 0) + item.quantity;
      return acc;
    }, {});
    
    const canFulfill = requiredItems.every(itemName => inventory[itemName] && inventory[itemName] > 0);
    
    if (!canFulfill) {
      alert("You don't have all the required items!");
      return;
    }
    
    onFulfillRequest(selectedRequest.id);
    setSelectedRequest(null);
  };
  
  // Toggle black market access
  const toggleBlackMarket = () => {
    if (!blackMarketAccess) return;
    setShowBlackMarket(prev => !prev);
  };
  
  // Render market shop items
  const renderShopItems = () => {
    const displayItems = showBlackMarket 
      ? marketItems.filter(item => item.rarity === 'rare' || item.rarity === 'legendary')
      : marketItems.filter(item => item.rarity !== 'rare' && item.rarity !== 'legendary');
    
    if (displayItems.length === 0) {
      return (
        <div className="empty-market">
          <p>No items available for sale.</p>
        </div>
      );
    }
    
    return (
      <div className="market-items">
        {displayItems.map(item => (
          <div
            key={item.id}
            className={`market-item ${selectedItem?.id === item.id ? 'selected' : ''} ${item.price > playerGold ? 'unaffordable' : ''}`}
            onClick={() => handleItemSelect(item)}
          >
            <div className="item-icon">{getItemIcon(item.type)}</div>
            <div className="item-details">
              <div className="item-name">{item.name}</div>
              <div className="item-type">{formatItemType(item.type)}</div>
            </div>
            <div className="item-price">{item.price}g</div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render player inventory for selling
  const renderSellableItems = () => {
    // Filter out any items with zero quantity
    const sellableItems = playerInventory.filter(item => 
      item.quantity > 0
    );
    
    if (sellableItems.length === 0) {
      return (
        <div className="empty-inventory">
          <p>No items available to sell.</p>
        </div>
      );
    }
    
    return (
      <div className="market-items">
        {sellableItems.map(item => (
          <div
            key={item.id}
            className={`market-item ${selectedInventoryItem?.id === item.id ? 'selected' : ''}`}
            onClick={() => handleInventorySelect(item)}
          >
            <div className="item-icon">{getItemIcon(item.type)}</div>
            <div className="item-details">
              <div className="item-name">{item.name}</div>
              <div className="item-type">{formatItemType(item.type)}</div>
            </div>
            <div className="item-quantity">x{item.quantity}</div>
            <div className="item-price">{getSellPrice(item)}g</div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render town requests
  const renderTownRequests = () => {
    if (townRequests.length === 0) {
      return (
        <div className="empty-requests">
          <p>No requests available from townsfolk.</p>
        </div>
      );
    }
    
    return (
      <div className="town-requests">
        {townRequests.map(request => (
          <div
            key={request.id}
            className={`request-item ${selectedRequest?.id === request.id ? 'selected' : ''}`}
            onClick={() => handleRequestSelect(request)}
          >
            <div className="request-header">
              <div className="request-title">{request.title}</div>
              <div className="request-reward">{request.reward}g</div>
            </div>
            <div className="request-requester">From: {request.requester}</div>
            <div className="request-description">{request.description}</div>
            <div className="request-requirements">
              <div className="req-label">Requires:</div>
              <div className="req-items">
                {request.requiredItems.join(", ")}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render rumors section
  const renderRumors = () => {
    const discoveredRumors = rumors.filter(rumor => rumor.discovered);
    
    if (discoveredRumors.length === 0) {
      return (
        <div className="empty-rumors">
          <p>You haven't heard any rumors yet.</p>
        </div>
      );
    }
    
    return (
      <div className="market-rumors">
        {discoveredRumors.map(rumor => (
          <div key={rumor.id} className="rumor-item">
            <div className="rumor-text">"{rumor.text}"</div>
            <div className="rumor-source">- {rumor.source}</div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render item details for selected item
  const renderItemDetails = () => {
    if (!selectedItem) {
      return (
        <div className="item-details-panel empty">
          <p>Select an item to view details.</p>
        </div>
      );
    }
    
    return (
      <div className="item-details-panel">
        <h3>{selectedItem.name}</h3>
        <div className="detail-icon large-icon">{getItemIcon(selectedItem.type)}</div>
        <div className="detail-type">{formatItemType(selectedItem.type)}</div>
        <div className="detail-description">{selectedItem.description || "No description available."}</div>
        <div className="detail-price">Price: {selectedItem.price} gold</div>
        
        <button 
          className={`market-button buy ${selectedItem.price > playerGold ? 'disabled' : ''}`}
          onClick={handleBuy}
          disabled={selectedItem.price > playerGold}
        >
          Buy Item
        </button>
      </div>
    );
  };
  
  // Render inventory item details
  const renderInventoryDetails = () => {
    if (!selectedInventoryItem) {
      return (
        <div className="item-details-panel empty">
          <p>Select an item to sell.</p>
        </div>
      );
    }
    
    return (
      <div className="item-details-panel">
        <h3>{selectedInventoryItem.name}</h3>
        <div className="detail-icon large-icon">{getItemIcon(selectedInventoryItem.type)}</div>
        <div className="detail-type">{formatItemType(selectedInventoryItem.type)}</div>
        <div className="detail-quantity">Quantity: {selectedInventoryItem.quantity}</div>
        <div className="detail-price">Sell price: {getSellPrice(selectedInventoryItem)} gold</div>
        
        <button 
          className="market-button sell"
          onClick={handleSell}
        >
          Sell Item
        </button>
      </div>
    );
  };
  
  // Render request details
  const renderRequestDetails = () => {
    if (!selectedRequest) {
      return (
        <div className="request-details-panel empty">
          <p>Select a request to view details.</p>
        </div>
      );
    }
    
    // Check if player has all required items
    const requiredItems = selectedRequest.requiredItems;
    const inventory = playerInventory.reduce<Record<string, number>>((acc, item) => {
      acc[item.name] = (acc[item.name] || 0) + item.quantity;
      return acc;
    }, {});
    
    const canFulfill = requiredItems.every(itemName => inventory[itemName] && inventory[itemName] > 0);
    
    return (
      <div className="request-details-panel">
        <h3>{selectedRequest.title}</h3>
        <div className="detail-requester">From: {selectedRequest.requester}</div>
        <div className="detail-description">{selectedRequest.description}</div>
        <div className="detail-requirements">
          <div className="req-header">Required Items:</div>
          <ul className="req-list">
            {requiredItems.map((item, index) => {
              const hasItem = inventory[item] && inventory[item] > 0;
              return (
                <li key={index} className={hasItem ? 'has-item' : 'missing-item'}>
                  {item} {hasItem ? '✓' : '✗'}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="detail-reward">Reward: {selectedRequest.reward} gold</div>
        
        <button 
          className={`market-button fulfill ${!canFulfill ? 'disabled' : ''}`}
          onClick={handleFulfillRequest}
          disabled={!canFulfill}
        >
          Fulfill Request
        </button>
      </div>
    );
  };
  
  // Helper to get item icon
  const getItemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'herb': return '🌿';
      case 'rare_herb': return '✨';
      case 'reagent': return '🧪';
      case 'tool': return '🧰';
      case 'potion': return '🧴';
      case 'seed': return '🌱';
      default: return '📦';
    }
  };
  
  // Helper to format item type
  const formatItemType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Calculate sell price (typically 50% of buy price)
  const getSellPrice = (item: InventoryItem) => {
    // In a real implementation, you might have pricing logic based on item type, rarity, etc.
    // For this demo, we'll use a simple calculation based on category
    const basePrice = 
      item.category === 'herb' ? 5 :
      item.category === 'flower' ? 20 :
      item.category === 'root' ? 15 :
      item.category === 'tool' ? 25 :
      item.category === 'potion' ? 30 :
      item.category === 'seed' ? 8 : 10;
    
    return Math.floor(basePrice * 0.5);
  };
  
  return (
    <div className="market90s-container">
      <div className="market-header">
        <h2>Town Market</h2>
        <div className="player-gold">
          <div className="gold-icon">💰</div>
          <div className="gold-amount">{playerGold} gold</div>
        </div>
      </div>
      
      <div className="market-tabs">
        <button 
          className={`market-tab ${activeSection === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveSection('shop')}
        >
          Buy Items
        </button>
        <button 
          className={`market-tab ${activeSection === 'sell' ? 'active' : ''}`}
          onClick={() => setActiveSection('sell')}
        >
          Sell Items
        </button>
        <button 
          className={`market-tab ${activeSection === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveSection('requests')}
        >
          Town Requests
        </button>
        <button 
          className={`market-tab ${activeSection === 'rumors' ? 'active' : ''}`}
          onClick={() => setActiveSection('rumors')}
        >
          Rumors
        </button>
      </div>
      
      <div className="market-main">
        <div className="market-content">
          {activeSection === 'shop' && (
            <div className="shop-section">
              {blackMarketAccess && (
                <div className="black-market-toggle">
                  <button 
                    className={`toggle-button ${showBlackMarket ? 'active' : ''}`}
                    onClick={toggleBlackMarket}
                  >
                    {showBlackMarket ? "Show Regular Goods" : "Show Black Market"}
                  </button>
                </div>
              )}
              {renderShopItems()}
            </div>
          )}
          
          {activeSection === 'sell' && (
            <div className="sell-section">
              {renderSellableItems()}
            </div>
          )}
          
          {activeSection === 'requests' && (
            <div className="requests-section">
              {renderTownRequests()}
            </div>
          )}
          
          {activeSection === 'rumors' && (
            <div className="rumors-section">
              {renderRumors()}
            </div>
          )}
        </div>
        
        <div className="market-sidebar">
          {activeSection === 'shop' && renderItemDetails()}
          {activeSection === 'sell' && renderInventoryDetails()}
          {activeSection === 'requests' && renderRequestDetails()}
          {activeSection === 'rumors' && (
            <div className="market-ambience">
              <h3>Town Crier</h3>
              <div className="crier-avatar">📯</div>
              <p>"Hear ye, hear ye! The latest news and gossip from around town!"</p>
              <label className="sound-toggle">
                <input 
                  type="checkbox" 
                  checked={marketAmbience} 
                  onChange={() => setMarketAmbience(!marketAmbience)}
                />
                <span className="toggle-label">Market Sounds</span>
              </label>
            </div>
          )}
        </div>
      </div>
      
      {/* Decorative corners */}
      <div className="corner-decoration top-left"></div>
      <div className="corner-decoration top-right"></div>
      <div className="corner-decoration bottom-left"></div>
      <div className="corner-decoration bottom-right"></div>
    </div>
  );
};

export default Market90s;