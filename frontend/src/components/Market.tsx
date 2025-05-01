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
  
  // Easter Egg - Festival Market
  const [secretTriggerCount, setSecretTriggerCount] = useState<number>(0);
  const [festivalMarketActive, setFestivalMarketActive] = useState<boolean>(false);
  const [lanternPositions, setLanternPositions] = useState<Array<{x: number, y: number, delay: number, size: number}>>([]);
  const [festivalTheme, setFestivalTheme] = useState<'spring' | 'moon' | 'harvest'>('moon');
  const [specialMerchant, setSpecialMerchant] = useState<{
    active: boolean;
    name: string;
    greeting: string;
    discount: number;
  }>({
    active: false,
    name: '',
    greeting: '',
    discount: 0,
  });

  // Check for festival activation
  useEffect(() => {
    if (secretTriggerCount >= 5) {
      activateFestivalMarket();
      setSecretTriggerCount(0);
    }
    
    // Return cleanup function
    return () => {};
  }, [secretTriggerCount]);

  // Reset selection when changing tabs
  useEffect(() => {
    setSelectedItemId(null);
    setSelectedInventoryItemId(null);
    setSelectedRequestId(null);
    
    // Return cleanup function
    return () => {};
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
    
    // Return cleanup function when not showing black market
    return () => {};
  }, [showBlackMarket]);

  // Easter Egg Festival Market activation
  const activateFestivalMarket = () => {
    // Choose a random festival theme
    const themes: Array<'spring' | 'moon' | 'harvest'> = ['spring', 'moon', 'harvest'];
    const selectedTheme = themes[Math.floor(Math.random() * themes.length)];
    setFestivalTheme(selectedTheme);
    
    // Generate lantern positions
    const numLanterns = 7 + Math.floor(Math.random() * 8); // 7-14 lanterns
    const newLanterns = Array.from({ length: numLanterns }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      size: 0.7 + Math.random() * 0.6, // Size variation
    }));
    setLanternPositions(newLanterns);
    
    // Generate a special merchant
    const merchantNames = {
      'spring': ['Blossom', 'Petal', 'Flora', 'Willow', 'Iris'],
      'moon': ['Luna', 'Selene', 'Celeste', 'Aria', 'Lyra'],
      'harvest': ['Amber', 'Auburn', 'Maple', 'Hazel', 'Sage']
    };
    
    const greetings = {
      'spring': [
        "May your potions bloom like spring flowers!",
        "Welcome to our spring festival! Fresh ingredients for all!",
        "The spirits of renewal bless your visit today!"
      ],
      'moon': [
        "The moon's light guides you to the finest wares!",
        "Under the celestial glow, I offer special treasures!",
        "The night market welcomes a fellow practitioner of magic!"
      ],
      'harvest': [
        "Autumn's bounty brings the richest ingredients!",
        "The harvest spirits have blessed us with abundance!",
        "As leaves fall, our prices do too! What will you gather today?"
      ]
    };
    
    const names = merchantNames[selectedTheme];
    const selectedName = names[Math.floor(Math.random() * names.length)];
    const selectedGreeting = greetings[selectedTheme][Math.floor(Math.random() * greetings[selectedTheme].length)];
    const discountPercent = 10 + Math.floor(Math.random() * 20); // 10-30% discount
    
    setSpecialMerchant({
      active: true,
      name: selectedName,
      greeting: selectedGreeting,
      discount: discountPercent
    });
    
    // Activate festival market
    setFestivalMarketActive(true);
    
    console.log(`✨ The ${selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)} Festival Market appears! ✨`);
    
    // Festival lasts for 60 seconds
    setTimeout(() => {
      setFestivalMarketActive(false);
      setSpecialMerchant(prev => ({ ...prev, active: false }));
    }, 60000);
  };

  // Increment secret trigger counter
  const incrementSecretTrigger = () => {
    const newCount = secretTriggerCount + 1;
    setSecretTriggerCount(newCount);
    
    // Reset after 3 seconds of inactivity
    setTimeout(() => {
      setSecretTriggerCount(0);
    }, 3000);
  };

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

  // Calculate discounted price if festival is active
  const getAdjustedPrice = (basePrice: number): number => {
    if (festivalMarketActive && specialMerchant.active) {
      // Apply festival discount
      return Math.max(1, Math.floor(basePrice * (1 - specialMerchant.discount / 100)));
    }
    return basePrice;
  };

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
     const adjustedPrice = getAdjustedPrice(item.price);
     return playerGold >= adjustedPrice;
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

  // Handle buy button click with Easter egg support
  const handleBuyClick = (itemId: string) => {
    // Increment secret counter when buying
    incrementSecretTrigger();
    onBuyItem(itemId);
  };

  // Get unique types and categories for filters
  const uniqueTypes = [...new Set(marketItems.map(item => item.type))].sort();
  const uniqueCategories = [...new Set(marketItems.map(item => item.category))].sort();

  // Get festival theme colors
  const getFestivalThemeColors = () => {
    switch (festivalTheme) {
      case 'spring':
        return {
          primary: 'rgba(210, 250, 220, 0.85)',
          secondary: 'rgba(255, 200, 230, 0.7)',
          accent: 'rgba(130, 215, 150, 0.9)',
          text: '#2c5738',
          glow: 'rgba(190, 255, 200, 0.7)'
        };
      case 'moon':
        return {
          primary: 'rgba(200, 220, 255, 0.85)',
          secondary: 'rgba(230, 230, 255, 0.7)',
          accent: 'rgba(150, 170, 230, 0.9)',
          text: '#2e3a67',
          glow: 'rgba(190, 210, 255, 0.7)'
        };
      case 'harvest':
        return {
          primary: 'rgba(255, 230, 200, 0.85)',
          secondary: 'rgba(255, 210, 180, 0.7)',
          accent: 'rgba(230, 170, 120, 0.9)',
          text: '#6e4525',
          glow: 'rgba(255, 220, 180, 0.7)'
        };
      default:
        return {
          primary: 'rgba(230, 230, 255, 0.85)',
          secondary: 'rgba(255, 255, 230, 0.7)',
          accent: 'rgba(180, 180, 230, 0.9)',
          text: '#333366',
          glow: 'rgba(200, 200, 255, 0.7)'
        };
    }
  };

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
          const adjustedPrice = isSellTab ? displayPrice : getAdjustedPrice(displayPrice);
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

          // Apply festival market styling if active
          const festivalClass = festivalMarketActive ? 'festival-item' : '';
          const festivalItemStyle = festivalMarketActive ? {
            borderColor: getFestivalThemeColors().accent,
            boxShadow: `0 0 10px ${getFestivalThemeColors().glow}`
          } : {};

          return (
            <div
              key={item.id}
              className={`market-item ${item.type} ${currentSelectionId === item.id ? 'selected' : ''} ${festivalClass}`}
              style={festivalItemStyle}
              onClick={() => handleItemClick(item.id)}
              title={`${item.name}${quality !== undefined ? ` (Quality: ${quality}%)` : ''}${quantity ? ` (Quantity: ${quantity})` : ''}\n${item.description || ''}`}
            >
              <div className="market-item-category">{item.category}</div>
              <div className="market-item-image">
                <div title={item.name}>{item.name.charAt(0).toUpperCase()}</div>
                {festivalMarketActive && (
                  <div className="festival-item-glow"></div>
                )}
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
                  {formatPrice(isSellTab ? sellPreviewPrice : adjustedPrice)}
                  
                  {/* Show trend based on marketData, regardless of tab */}
                  {marketData && (
                    <span className={`trend-indicator ${getTrendClass(marketData)}`}>
                      {getPriceTrendIcon(marketData)}
                    </span>
                  )}
                  
                  {/* Show discount if festival is active */}
                  {!isSellTab && festivalMarketActive && specialMerchant.active && (
                    <span className="discount-tag">-{specialMerchant.discount}%</span>
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

          // Apply festival styling
          const festivalRequestStyle = festivalMarketActive ? {
            borderColor: getFestivalThemeColors().accent,
            background: `linear-gradient(45deg, ${getFestivalThemeColors().primary}, ${getFestivalThemeColors().secondary})`,
            boxShadow: `0 0 8px ${getFestivalThemeColors().glow}`
          } : {};

          return (
            <div
              key={request.id}
              className={`request-item ${selectedRequestId === request.id ? 'selected' : ''} ${festivalMarketActive ? 'festival-request' : ''}`}
              style={festivalRequestStyle}
              onClick={() => handleRequestClick(request.id)}
            >
              <div className="request-icon" title={request.requester}>
                {request.requester.charAt(0).toUpperCase()}
                {festivalMarketActive && (
                  <div className="request-icon-glow"></div>
                )}
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
                    className={`fulfill-button ${playerCanFulfill ? 'can-fulfill' : 'cant-fulfill'} ${festivalMarketActive ? 'festival-button' : ''}`}
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
    const festivalColors = getFestivalThemeColors();
    
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
      const adjustedPrice = getAdjustedPrice(item.price);
      
      const festivalDetailStyle = festivalMarketActive ? {
        borderColor: festivalColors.accent,
        background: `linear-gradient(to bottom, ${festivalColors.primary}, ${festivalColors.secondary})`,
        color: festivalColors.text
      } : {};
      
      return (
        <div 
          className={`market-item-details ${festivalMarketActive ? 'festival-details' : ''}`}
          style={festivalDetailStyle}
        >
          <h3>{item.name}</h3>
          <div className="selected-item-header">
             <div className="selected-item-image">
               <div>{item.name.charAt(0).toUpperCase()}</div>
             </div>
             <div className="selected-item-info">
                <div className="selected-item-price">
                  {formatPrice(adjustedPrice)}
                  {adjustedPrice < item.price && (
                    <span className="original-price">{formatPrice(item.price)}</span>
                  )}
                </div>
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
              className={`primary ${!canAffordItem() ? 'disabled' : ''} ${festivalMarketActive ? 'festival-button' : ''}`} 
              onClick={() => handleBuyClick(item.id)} 
              disabled={!canAffordItem()}
            >
              Purchase {formatPrice(adjustedPrice)}
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
      
      const festivalDetailStyle = festivalMarketActive ? {
        borderColor: festivalColors.accent,
        background: `linear-gradient(to bottom, ${festivalColors.primary}, ${festivalColors.secondary})`,
        color: festivalColors.text
      } : {};

      return (
        <div 
          className={`market-item-details ${festivalMarketActive ? 'festival-details' : ''}`}
          style={festivalDetailStyle}
        >
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
              className={`primary ${festivalMarketActive ? 'festival-button' : ''}`} 
              onClick={() => {
                incrementSecretTrigger();
                onSellItem(item.id);
              }} 
              disabled={item.quantity <= 0 || !marketData}
            >
              Sell 1 for {formatPrice(actualSellPrice)}
            </button>
            {item.quantity > 1 && (
              <button 
                className={`secondary ${festivalMarketActive ? 'festival-button' : ''}`} 
                onClick={() => {
                  // Increment secret trigger on sell all
                  incrementSecretTrigger();
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
      
      const festivalDetailStyle = festivalMarketActive ? {
        borderColor: festivalColors.accent,
        background: `linear-gradient(to bottom, ${festivalColors.primary}, ${festivalColors.secondary})`,
        color: festivalColors.text
      } : {};

      return (
        <div 
          className={`market-item-details ${festivalMarketActive ? 'festival-details' : ''}`}
          style={festivalDetailStyle}
        >
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
              className={`primary ${!canFulfill ? 'disabled' : ''} ${festivalMarketActive ? 'festival-button' : ''}`}
              onClick={() => {
                incrementSecretTrigger();
                onFulfillRequest(request.id);
              }}
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
    const festivalColors = getFestivalThemeColors();

    return (
      <div 
        className={`market-rumors ${festivalMarketActive ? 'festival-rumors' : ''}`}
        style={festivalMarketActive ? {
          borderColor: festivalColors.accent,
          background: `linear-gradient(45deg, ${festivalColors.primary}, ${festivalColors.secondary})`,
          color: festivalColors.text
        } : {}}
      >
        <h3>Market Whispers</h3>
        {recentRumors.length === 0 ? (
          <div className="rumor-list empty">The marketplace is quiet today...</div>
        ) : (
          <div className="rumor-list">
            {recentRumors.map(rumor => (
              <div 
                key={rumor.id} 
                className={`rumor-item ${festivalMarketActive ? 'festival-rumor' : ''}`}
                style={festivalMarketActive ? {
                  borderColor: festivalColors.accent,
                  background: `rgba(255, 255, 255, 0.15)`,
                  boxShadow: `0 0 8px ${festivalColors.glow}`
                } : {}}
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

  // Render Special Merchant
  const renderSpecialMerchant = () => {
    if (!festivalMarketActive || !specialMerchant.active) return null;
    
    const festivalColors = getFestivalThemeColors();
    
    return (
      <div className="special-merchant-banner" style={{
        background: `linear-gradient(45deg, ${festivalColors.primary}, ${festivalColors.secondary})`,
        borderColor: festivalColors.accent,
        color: festivalColors.text
      }}>
        <div className="merchant-portrait">
          <div className="merchant-initial">{specialMerchant.name.charAt(0)}</div>
          <div className="merchant-glow"></div>
        </div>
        <div className="merchant-info">
          <h3 className="merchant-name">{specialMerchant.name}</h3>
          <p className="merchant-greeting">{specialMerchant.greeting}</p>
          <div className="merchant-offer">
            <span className="special-discount">Special Festival Discount: {specialMerchant.discount}% OFF!</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`market-container ${showBlackMarket ? 'black-market-active' : ''} ${festivalMarketActive ? `festival-market ${festivalTheme}-theme` : ''}`}>
      {/* Black Market transition effect */}
      {blackMarketTransition && <div className="black-market-transition" />}
      
      {/* Easter Egg: Festival Market elements */}
      {festivalMarketActive && (
        <div className="festival-overlay">
          {/* Floating lanterns */}
          {lanternPositions.map((lantern, index) => (
            <div 
              key={`lantern-${index}`}
              className={`festival-lantern ${festivalTheme}-lantern`}
              style={{
                left: `${lantern.x}%`,
                top: `${lantern.y}%`,
                animationDelay: `${lantern.delay}s`,
                transform: `scale(${lantern.size})`
              }}
            >
              <div className="lantern-glow"></div>
            </div>
          ))}
          
          {/* Festival banners */}
          <div className="festival-banner banner-left"></div>
          <div className="festival-banner banner-right"></div>
          
          <style>
            {`
              .festival-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 5;
                overflow: hidden;
              }
              
              .festival-market {
                background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVQImWNgYGD4z0AEZEAGADdjCA8GUKD8AAAAAElFTkSuQmCC') repeat;
                transition: background-color 0.5s ease;
              }
              
              .spring-theme {
                background-color: rgba(240, 255, 240, 0.2);
              }
              
              .moon-theme {
                background-color: rgba(230, 240, 255, 0.2);
              }
              
              .harvest-theme {
                background-color: rgba(255, 240, 230, 0.2);
              }
              
              .festival-lantern {
                position: absolute;
                width: 30px;
                height: 40px;
                border-radius: 50%;
                animation: floatLantern 8s infinite ease-in-out;
                opacity: 0.85;
                z-index: 10;
              }
              
              .spring-lantern {
                background: radial-gradient(ellipse at center, rgba(255, 200, 230, 0.8), rgba(255, 200, 230, 0.4));
                box-shadow: 0 0 15px rgba(255, 200, 230, 0.7);
              }
              
              .moon-lantern {
                background: radial-gradient(ellipse at center, rgba(200, 220, 255, 0.8), rgba(200, 220, 255, 0.4));
                box-shadow: 0 0 15px rgba(200, 220, 255, 0.7);
              }
              
              .harvest-lantern {
                background: radial-gradient(ellipse at center, rgba(255, 210, 170, 0.8), rgba(255, 210, 170, 0.4));
                box-shadow: 0 0 15px rgba(255, 210, 170, 0.7);
              }
              
              .lantern-glow {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 15px;
                height: 15px;
                border-radius: 50%;
                animation: lanternGlow 3s infinite alternate ease-in-out;
              }
              
              .spring-lantern .lantern-glow {
                background: rgba(255, 255, 255, 0.9);
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
              }
              
              .moon-lantern .lantern-glow {
                background: rgba(240, 240, 255, 0.9);
                box-shadow: 0 0 10px rgba(240, 240, 255, 0.9);
              }
              
              .harvest-lantern .lantern-glow {
                background: rgba(255, 240, 220, 0.9);
                box-shadow: 0 0 10px rgba(255, 240, 220, 0.9);
              }
              
              .festival-banner {
                position: absolute;
                width: 40px;
                height: 100%;
                top: 0;
                background-size: contain;
                background-repeat: repeat-y;
                opacity: 0.7;
                z-index: 6;
              }
              
              .banner-left {
                left: 0;
                background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==');
              }
              
              .banner-right {
                right: 0;
                background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==');
              }
              
              /* Festival Item Styling */
              .festival-item {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
              }
              
              .festival-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
              }
              
              .festival-item .festival-item-glow {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 5px;
                height: 5px;
                border-radius: 50%;
                opacity: 0.7;
                animation: itemGlow 2s infinite alternate;
              }
              
              .festival-button {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
              }
              
              .festival-button:hover:not(:disabled) {
                transform: translateY(-1px);
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
              }
              
              /* Special Merchant Styling */
              .special-merchant-banner {
                display: flex;
                align-items: center;
                padding: 15px;
                margin-bottom: 15px;
                border-radius: 8px;
                border: 1px solid;
                animation: merchantAppear 0.5s ease-out;
              }
              
              .merchant-portrait {
                position: relative;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                margin-right: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.3);
              }
              
              .merchant-initial {
                font-size: 24px;
                font-weight: bold;
                z-index: 2;
              }
              
              .merchant-glow {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                animation: merchantGlow 3s infinite alternate;
              }
              
              .merchant-info {
                flex: 1;
              }
              
              .merchant-name {
                margin: 0 0 5px 0;
              }
              
              .merchant-greeting {
                margin: 0 0 10px 0;
                font-style: italic;
              }
              
              .special-discount {
                font-weight: bold;
                animation: discountPulse 2s infinite alternate;
              }
              
              /* Animations */
              @keyframes floatLantern {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
              }
              
              @keyframes lanternGlow {
                0% { opacity: 0.5; }
                100% { opacity: 1; }
              }
              
              @keyframes itemGlow {
                0% { opacity: 0.5; box-shadow: 0 0 5px rgba(255, 255, 255, 0.7); }
                100% { opacity: 0.9; box-shadow: 0 0 10px rgba(255, 255, 255, 0.9); }
              }
              
              @keyframes merchantAppear {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              
              @keyframes merchantGlow {
                0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
                100% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
              }
              
              @keyframes discountPulse {
                0% { color: inherit; }
                100% { color: #ff5555; }
              }
            `}
          </style>
        </div>
      )}
      
      {/* Header */}
      <div className="market-header">
        <h2>{showBlackMarket ? "Black Market" : (festivalMarketActive ? `${festivalTheme.charAt(0).toUpperCase() + festivalTheme.slice(1)} Festival Market` : "Town Market")}</h2>
        <div className="market-actions">
          {blackMarketAccess && (
            <button 
              className={`bm-toggle ${showBlackMarket ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`} 
              onClick={() => setShowBlackMarket(!showBlackMarket)}
            >
              {showBlackMarket ? 'Return to Town Market' : 'Enter Black Market'}
            </button>
          )}
        </div>
      </div>

      {/* Special Festival Merchant */}
      {renderSpecialMerchant()}

      {/* Tabs */}
      <div className="market-toggle">
        <button 
          className={`${activeTab === 'buy' ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`} 
          onClick={() => setActiveTab('buy')}
        >
          Buy
        </button>
        <button 
          className={`${activeTab === 'sell' ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`} 
          onClick={() => setActiveTab('sell')}
        >
          Sell
        </button>
        <button 
          className={`${activeTab === 'requests' ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`} 
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
             className={festivalMarketActive ? 'festival-select' : ''}
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
             className={festivalMarketActive ? 'festival-select' : ''}
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
               className={festivalMarketActive ? 'festival-input' : ''}
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
          <div 
            className={`market-wallet ${festivalMarketActive ? 'festival-wallet' : ''}`}
            style={festivalMarketActive ? {
              borderColor: getFestivalThemeColors().accent,
              background: `linear-gradient(45deg, ${getFestivalThemeColors().primary}, ${getFestivalThemeColors().secondary})`,
              color: getFestivalThemeColors().text
            } : {}}
          >
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