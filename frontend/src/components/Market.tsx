import React, { useState, useEffect, useRef } from 'react';
import './Market.css';
import { InventoryItem, MarketItem, Rumor, TownRequest } from 'coven-shared';

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

  // Festival Market Easter Egg
  const [secretClickCount, setSecretClickCount] = useState<number>(0);
  const [festivalMarketActive, setFestivalMarketActive] = useState<boolean>(false);
  const [festivalTheme, setFestivalTheme] = useState<'spring' | 'moon' | 'harvest'>('moon');
  const [specialMerchant, setSpecialMerchant] = useState<{ 
    active: boolean; 
    name: string; 
    greeting: string; 
    discount: number; 
  }>({ active: false, name: '', greeting: '', discount: 0 });
  const secretClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset selection when changing tabs or market type
  useEffect(() => {
    setSelectedItemId(null);
    setSelectedInventoryItemId(null);
    setSelectedRequestId(null);
  }, [activeTab, showBlackMarket]);

  // Handle Black Market transition effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (showBlackMarket && blackMarketAccess) {
      setBlackMarketTransition(true);
      timer = setTimeout(() => {
        setBlackMarketTransition(false);
      }, 1000);
    } else {
      setShowBlackMarket(false);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [showBlackMarket, blackMarketAccess]);

  // Easter Egg Header Click Handler
  const handleHeaderClick = () => {
    if (secretClickTimeoutRef.current) {
      clearTimeout(secretClickTimeoutRef.current);
    }
    
    const newCount = secretClickCount + 1;
    setSecretClickCount(newCount);
    
    if (newCount >= 5) {
      activateFestivalMarket();
      setSecretClickCount(0);
    } else {
      secretClickTimeoutRef.current = setTimeout(() => {
        setSecretClickCount(0);
      }, 1500);
    }
  };

  // Activate Festival Market Easter Egg
  const activateFestivalMarket = () => {
    if (festivalMarketActive) return;

    const themes: Array<'spring' | 'moon' | 'harvest'> = ['spring', 'moon', 'harvest'];
    const selectedTheme = themes[Math.floor(Math.random() * themes.length)];
    setFestivalTheme(selectedTheme);

    const merchantNames: Record<typeof selectedTheme, string[]> = {
      'spring': ['Blossom', 'Flora', 'Willow', 'Iris', 'Fern'],
      'moon': ['Luna', 'Selene', 'Celeste', 'Nyx', 'Astrid'],
      'harvest': ['Amber', 'Rowan', 'Maple', 'Hazel', 'Saffron']
    };
    
    const greetings: Record<typeof selectedTheme, string[]> = {
      'spring': ["Bloom and grow! Fresh wares abound!", "Special prices bloom today!", "Spring's blessings upon your purchases!"],
      'moon': ["Guided by moonlight, find rare treasures!", "The night market favors the bold!", "Celestial bargains await!"],
      'harvest': ["Autumn's gifts are plentiful!", "A bountiful discount awaits!", "The harvest moon smiles upon these prices!"]
    };
    
    const names = merchantNames[selectedTheme];
    const selectedName = names[Math.floor(Math.random() * names.length)];
    const selectedGreeting = greetings[selectedTheme][Math.floor(Math.random() * greetings[selectedTheme].length)];
    const discountPercent = 10 + Math.floor(Math.random() * 16); // 10-25% discount

    setSpecialMerchant({ 
      active: true, 
      name: selectedName, 
      greeting: selectedGreeting, 
      discount: discountPercent 
    });
    
    setFestivalMarketActive(true);
    console.log(`✨ The ${selectedTheme} Festival Market appears! Merchant: ${selectedName} (-${discountPercent}%) ✨`);

    // Festival lasts for ~1 minute
    setTimeout(() => {
      setFestivalMarketActive(false);
      setSpecialMerchant({ active: false, name: '', greeting: '', discount: 0 });
    }, 60000);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (secretClickTimeoutRef.current) {
        clearTimeout(secretClickTimeoutRef.current);
      }
    };
  }, []);

  // Get unique categories and types for filters
  const uniqueCategories = [...new Set(marketItems.map(item => item.category || 'misc'))].sort();
  const uniqueTypes = [...new Set(marketItems.map(item => item.type))].sort();

  // Filter items based on active tab, filters, and black market status
  const getFilteredItems = () => {
    let itemsToFilter: (MarketItem | InventoryItem)[] = [];
    const baseMarket = marketItems.filter(item => 
      !item.blackMarketOnly || (item.blackMarketOnly && showBlackMarket)
    );

    if (activeTab === 'buy') {
      itemsToFilter = baseMarket;
    } else if (activeTab === 'sell') {
      const sellableMarketIds = new Set(baseMarket.map(mi => mi.id));
      itemsToFilter = playerInventory.filter(invItem =>
        sellableMarketIds.has(invItem.baseId) && invItem.quantity > 0
      );
    } else {
      return []; // No items for requests tab
    }

    // Apply filters
    let filtered = itemsToFilter;
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }

    // Sort by name
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  };

  // Get selected item details
  const getSelectedItemDetails = () => {
    if (activeTab === 'buy' && selectedItemId) {
      return marketItems.find(item => item.id === selectedItemId) || null;
    }
    if (activeTab === 'sell' && selectedInventoryItemId) {
      return playerInventory.find(item => item.id === selectedInventoryItemId) || null;
    }
    if (activeTab === 'requests' && selectedRequestId) {
      return townRequests.find(req => req.id === selectedRequestId) || null;
    }
    return null;
  };

  const selectedDetails = getSelectedItemDetails();

  // Format price with gold symbol
  const formatPrice = (price: number): string => `${price}G`;

  // Calculate discounted price for festival market
  const getDiscountedPrice = (basePrice: number): number => {
    if (festivalMarketActive && specialMerchant.active) {
      return Math.max(1, Math.floor(basePrice * (1 - specialMerchant.discount / 100)));
    }
    return basePrice;
  };

  // Get price trend icon and class
  const getPriceTrend = (item: MarketItem) => {
    if (!item.priceHistory || item.priceHistory.length < 2) {
      return { icon: '—', class: 'stable' };
    }
    
    const current = item.price;
    const previous = item.priceHistory[item.priceHistory.length - 2] || item.basePrice;
    
    if (current > previous * 1.02) return { icon: '▲', class: 'up' };
    if (current < previous * 0.98) return { icon: '▼', class: 'down' };
    return { icon: '—', class: 'stable' };
  };

  // Handle item selection
  const handleItemClick = (id: string, isMarketItem: boolean) => {
    if (isMarketItem) {
      setActiveTab('buy');
      setSelectedItemId(id);
      setSelectedInventoryItemId(null);
      setSelectedRequestId(null);
    } else {
      setActiveTab('sell');
      setSelectedInventoryItemId(id);
      setSelectedItemId(null);
      setSelectedRequestId(null);
    }
  };

  // Handle request selection
  const handleRequestClick = (requestId: string) => {
    setActiveTab('requests');
    setSelectedRequestId(requestId);
    setSelectedItemId(null);
    setSelectedInventoryItemId(null);
  };

  // Check if player can afford item
  const canAffordItem = (): boolean => {
    if (activeTab !== 'buy' || !selectedDetails || !('price' in selectedDetails)) {
      return false;
    }
    const item = selectedDetails as MarketItem;
    const price = getDiscountedPrice(item.price);
    return playerGold >= price;
  };

  // Check if player can fulfill request
  const canFulfillRequest = (requestId?: string): boolean => {
    const request = requestId 
      ? townRequests.find(req => req.id === requestId)
      : activeTab === 'requests' && selectedDetails && 'item' in selectedDetails 
        ? selectedDetails as TownRequest 
        : null;
    
    if (!request) return false;
    
    const totalQuantity = playerInventory
      .filter(item => item.name === request.item)
      .reduce((sum, item) => sum + item.quantity, 0);
      
    return totalQuantity >= request.quantity;
  };

  // Get festival theme colors
  const getFestivalThemeColors = () => {
    switch (festivalTheme) {
      case 'spring': return { 
        primary: '#d2fadc', 
        secondary: '#ffc8e0', 
        accent: '#82d796', 
        text: '#2c5738' 
      };
      case 'moon': return { 
        primary: '#c8dcfc', 
        secondary: '#e6e6ff', 
        accent: '#96aae6', 
        text: '#2e3a67' 
      };
      case 'harvest': return { 
        primary: '#ffe6c8', 
        secondary: '#ffd2b4', 
        accent: '#e6aa78', 
        text: '#6e4525' 
      };
      default: return { 
        primary: '#e6e6ff', 
        secondary: '#ffffea', 
        accent: '#b4b4e6', 
        text: '#333366' 
      };
    }
  };

  // Render Market Items Grid
  const renderItemsGrid = () => {
    const items = getFilteredItems();
    
    if (items.length === 0) {
      return (
        <div className="empty-message">
          {activeTab === 'buy' ? "Nothing matching..." : "Satchel empty..."}
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
            
          const basePrice = marketData?.price ?? (invItem?.value || 1);
          const displayPrice = getDiscountedPrice(basePrice);
          const quality = invItem?.quality;
          const quantity = invItem?.quantity;

          // Calculate sell price with quality factor
          let sellPrice = 0;
          if (isSellTab && quality !== undefined) {
            const qualityMultiplier = 0.5 + ((quality) / 100) * 0.7;
            sellPrice = Math.max(1, Math.round(basePrice * qualityMultiplier));
          }

          // Get price trend
          const trend = marketData ? getPriceTrend(marketData) : { icon: '—', class: 'stable' };
          
          // Festival styles
          const festivalClass = festivalMarketActive ? 'festival-item' : '';
          const festivalStyle = festivalMarketActive ? {
            borderColor: getFestivalThemeColors().accent,
            boxShadow: `0 0 5px ${getFestivalThemeColors().accent}70, 3px 3px 0px rgba(0,0,0,0.2)`
          } : {};

          return (
            <div
              key={item.id}
              className={`market-item ${currentSelectionId === item.id ? 'selected' : ''} ${festivalClass}`}
              style={festivalStyle}
              onClick={() => handleItemClick(item.id, !isSellTab)}
              title={`${item.name}${quality !== undefined ? ` (Q: ${quality}%)` : ''}${quantity ? ` (Qty: ${quantity})` : ''}\n${item.description || ''}`}
            >
              {item.category && (
                <div className="item-category">{item.category}</div>
              )}
              
              <div className="item-image">
                <div title={item.name}>{item.name.charAt(0).toUpperCase()}</div>
              </div>
              
              <div className="item-name">{item.name}</div>
              
              {isSellTab && quantity !== undefined && quality !== undefined && (
                <div className="item-details">
                  <span>Qty: {quantity}</span>
                  <span>Q: {quality}%</span>
                </div>
              )}
              
              <div className="item-price">
                {formatPrice(isSellTab ? sellPrice : displayPrice)}
                <span className={`trend-icon ${trend.class}`}>{trend.icon}</span>
                
                {!isSellTab && festivalMarketActive && specialMerchant.active && 
                 displayPrice < basePrice && (
                  <span className="discount-badge">-{specialMerchant.discount}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Town Requests List
  const renderRequestsList = () => {
    if (townRequests.length === 0) {
      return <div className="empty-message">Notice board is empty...</div>;
    }

    return (
      <div className="requests-list">
        {townRequests.map(request => {
          const canFulfill = canFulfillRequest(request.id);
          const playerQuantity = playerInventory
            .filter(item => item.name === request.item)
            .reduce((sum, item) => sum + item.quantity, 0);
            
          const festivalStyle = festivalMarketActive ? {
            borderColor: getFestivalThemeColors().accent,
            background: `rgba(255,255,255,0.1)`
          } : {};

          return (
            <div 
              key={request.id} 
              className={`request-item ${selectedRequestId === request.id ? 'selected' : ''} ${festivalMarketActive ? 'festival-request' : ''}`}
              style={festivalStyle}
              onClick={() => handleRequestClick(request.id)}
            >
              <div className="request-icon" title={request.requester}>
                {request.requester.charAt(0).toUpperCase()}
              </div>
              
              <div className="request-details">
                <div className="request-requester">{request.requester} requests:</div>
                
                <div className="request-item-info">
                  <strong>{request.quantity} × {request.item}</strong>
                  <div className="inventory-count">(Have: {playerQuantity})</div>
                </div>
                
                <div className="request-rewards">
                  <div className="reward gold" title={`${request.rewardGold} Gold`}>
                    {request.rewardGold}G
                  </div>
                  <div className="reward reputation" title={`${request.rewardInfluence} Rep`}>
                    +{request.rewardInfluence} Rep
                  </div>
                </div>
                
                <div className="request-footer">
                  <div className="request-difficulty" title={`Difficulty: ${request.difficulty}/5`}>
                    {Array(request.difficulty).fill('★').join('')}
                    {Array(5 - request.difficulty).fill('☆').join('')}
                  </div>
                  
                  <button 
                    className={`fulfill-button ${canFulfill ? 'can-fulfill' : 'cant-fulfill'} ${festivalMarketActive ? 'festival-button' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canFulfill) {
                        onFulfillRequest(request.id);
                        setSelectedRequestId(null);
                      }
                    }}
                    disabled={!canFulfill}
                  >
                    {canFulfill ? 'Fulfill' : 'Need Items'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Details Panel
  const renderDetailsPanel = () => {
    if (!selectedDetails) {
      return (
        <div className={`market-item-details empty ${festivalMarketActive ? 'festival-details' : ''}`}>
          <div className="scroll-content">
            <p>Select item or request...</p>
          </div>
        </div>
      );
    }

    // Buy Tab Details
    if (activeTab === 'buy' && 'basePrice' in selectedDetails) {
      const item = selectedDetails as MarketItem;
      const trend = getPriceTrend(item);
      const displayPrice = getDiscountedPrice(item.price);
      
      return (
        <div className={`market-item-details ${festivalMarketActive ? 'festival-details' : ''}`}>
          <div className="parchment-scroll">
            <div className="scroll-content">
              <h3>{item.name}</h3>
              
              <div className="selected-item-header">
                <div className="selected-item-image">
                  <div>{item.name.charAt(0).toUpperCase()}</div>
                </div>
                
                <div className="selected-item-info">
                  <div className="selected-item-price">
                    {formatPrice(displayPrice)}
                    {displayPrice < item.price && (
                      <span className="original-price">{formatPrice(item.price)}</span>
                    )}
                  </div>
                  
                  <div className={`price-trend ${trend.class}`}>
                    <span className="trend-arrow">{trend.icon}</span>
                    <span>{trend.class} price</span>
                  </div>
                </div>
              </div>
              
              <div className="selected-item-description">
                {item.description || "..."}
              </div>
              
              {item.rarity && (
                <div className="selected-item-rarity">
                  Rarity: <span>{item.rarity}</span>
                </div>
              )}
              
              {item.seasonalBonus && (
                <div className="selected-item-seasonal">
                  Season: {item.seasonalBonus}
                </div>
              )}
            </div>
          </div>
          
          <div className="market-actions-panel">
            <button 
              className={`action-button buy ${!canAffordItem() ? 'disabled' : ''} ${festivalMarketActive ? 'festival-button' : ''}`}
              onClick={() => onBuyItem(item.id)}
              disabled={!canAffordItem()}
            >
              Buy for {formatPrice(displayPrice)}
            </button>
          </div>
        </div>
      );
    }

    // Sell Tab Details
    if (activeTab === 'sell' && 'quantity' in selectedDetails) {
      const item = selectedDetails as InventoryItem;
      const marketData = marketItems.find(mi => mi.id === item.baseId);
      const basePrice = marketData?.price ?? item.value ?? 1;
      const qualityMultiplier = 0.5 + ((item.quality ?? 70) / 100) * 0.7;
      const sellPrice = Math.max(1, Math.round(basePrice * qualityMultiplier));
      const trend = marketData ? getPriceTrend(marketData) : { icon: '—', class: 'stable' };
      
      return (
        <div className={`market-item-details ${festivalMarketActive ? 'festival-details' : ''}`}>
          <div className="parchment-scroll">
            <div className="scroll-content">
              <h3>Sell: {item.name}</h3>
              
              <div className="selected-item-header">
                <div className="selected-item-image">
                  <div>{item.name.charAt(0).toUpperCase()}</div>
                </div>
                
                <div className="selected-item-info">
                  <div className="selected-item-quantity">Have: {item.quantity}</div>
                  {item.quality !== undefined && (
                    <div className="selected-item-quality">Quality: {item.quality}%</div>
                  )}
                </div>
              </div>
              
              <div className="selected-item-description">
                {item.description || "..."}
              </div>
              
              <div className="sell-price-info">
                Sell Value: {formatPrice(sellPrice)} each
              </div>
              
              {marketData && (
                <div className={`price-trend ${trend.class}`}>
                  <span className="trend-arrow">{trend.icon}</span>
                  <span>Market price is {trend.class}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="market-actions-panel">
            <button 
              className={`action-button sell ${festivalMarketActive ? 'festival-button' : ''}`}
              onClick={() => onSellItem(item.id)}
              disabled={item.quantity <= 0}
            >
              Sell 1 for {formatPrice(sellPrice)}
            </button>
          </div>
        </div>
      );
    }

    // Requests Tab Details
    if (activeTab === 'requests' && 'requester' in selectedDetails) {
      const request = selectedDetails as TownRequest;
      const canFulfill = canFulfillRequest();
      const totalQuantity = playerInventory
        .filter(i => i.name === request.item)
        .reduce((sum, i) => sum + i.quantity, 0);
        
      const avgQuality = totalQuantity > 0 
        ? Math.round(
            playerInventory
              .filter(i => i.name === request.item)
              .reduce((s, i) => s + (i.quality ?? 70) * i.quantity, 0) / totalQuantity
          ) 
        : 0;
        
      return (
        <div className={`market-item-details ${festivalMarketActive ? 'festival-details' : ''}`}>
          <div className="parchment-scroll">
            <div className="scroll-content">
              <h3>{request.requester}'s Request</h3>
              
              <div className="selected-item-description">
                {request.description}
              </div>
              
              <hr className="divider" />
              
              <div className="request-requirements">
                <div><strong>Needs:</strong> {request.quantity} × {request.item}</div>
                <div>
                  <strong>Have:</strong> {totalQuantity} 
                  {totalQuantity > 0 ? ` (Avg Q: ~${avgQuality}%)` : ''}
                </div>
              </div>
              
              <hr className="divider" />
              
              <div><strong>Rewards:</strong></div>
              <div className="request-rewards-detail">
                <div className="reward gold">{request.rewardGold}G</div>
                <div className="reward reputation">+{request.rewardInfluence} Rep</div>
              </div>
              
              <div className="request-difficulty-detail">
                Difficulty: {Array(request.difficulty).fill('★').join('')}
                {Array(5 - request.difficulty).fill('☆').join('')}
              </div>
            </div>
          </div>
          
          <div className="market-actions-panel">
            <button
              className={`action-button fulfill ${!canFulfill ? 'disabled' : ''} ${festivalMarketActive ? 'festival-button' : ''}`}
              onClick={() => onFulfillRequest(request.id)}
              disabled={!canFulfill}
            >
              Fulfill Request
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="market-item-details empty">
        <div className="scroll-content">
          <p>Select item or request...</p>
        </div>
      </div>
    );
  };

  // Render Market Whispers (Rumors)
  const renderRumors = () => {
    const recentRumors = rumors.slice(-3).reverse(); // Show 3 most recent rumors
    
    const festivalColors = getFestivalThemeColors();
    const festivalStyle = festivalMarketActive ? {
      borderColor: festivalColors.accent,
      background: `linear-gradient(135deg, ${festivalColors.primary}, ${festivalColors.secondary})`,
      color: festivalColors.text
    } : {};
    
    return (
      <div 
        className={`market-rumors ${festivalMarketActive ? 'festival-rumors' : ''}`}
        style={festivalStyle}
      >
        <h3>Market Whispers</h3>
        
        {recentRumors.length === 0 ? (
          <div className="rumors-empty">The marketplace is quiet...</div>
        ) : (
          <div className="rumors-list">
            {recentRumors.map(rumor => (
              <div 
                key={rumor.id} 
                className={`rumor-item ${festivalMarketActive ? 'festival-rumor' : ''}`}
                title={`${rumor.origin} ~${rumor.turnsActive || 0}d ago`}
              >
                {rumor.content}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render Special Merchant Banner
  const renderSpecialMerchant = () => {
    if (!festivalMarketActive || !specialMerchant.active) return null;
    
    const festivalColors = getFestivalThemeColors();
    
    return (
      <div 
        className="special-merchant-banner"
        style={{ 
          background: `linear-gradient(45deg, ${festivalColors.primary}, ${festivalColors.secondary})`,
          borderColor: festivalColors.accent,
          color: festivalColors.text
        }}
      >
        <div className="merchant-portrait">
          <div className="merchant-initial">{specialMerchant.name.charAt(0)}</div>
        </div>
        
        <div className="merchant-info">
          <h3 className="merchant-name">{specialMerchant.name}</h3>
          <p className="merchant-greeting">"{specialMerchant.greeting}"</p>
          <div className="merchant-offer">
            <span className="special-discount">{specialMerchant.discount}% Festival Discount!</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`market-container ${showBlackMarket ? 'black-market' : ''} ${festivalMarketActive ? `festival-market ${festivalTheme}-theme` : ''}`}>
      {/* Black Market transition effect */}
      {blackMarketTransition && <div className="black-market-transition" />}

      {/* Festival Market Easter Egg */}
      {festivalMarketActive && (
        <div className="festival-overlay">
          {/* Festival lanterns and decorations rendered in CSS */}
        </div>
      )}

      {/* Market Header */}
      <div className="market-header">
        <h2 onClick={handleHeaderClick} title="Click rapidly...">
          {showBlackMarket 
            ? "Black Market" 
            : (festivalMarketActive 
                ? `${festivalTheme.charAt(0).toUpperCase() + festivalTheme.slice(1)} Festival` 
                : "Town Market"
              )
          }
        </h2>
        
        <div className="market-actions">
          {blackMarketAccess && (
            <button 
              className={`black-market-toggle ${showBlackMarket ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`}
              onClick={() => setShowBlackMarket(!showBlackMarket)}
            >
              {showBlackMarket ? 'Return to Market' : 'Enter Shadows'}
            </button>
          )}
        </div>
      </div>

      {/* Special Merchant Banner */}
      {renderSpecialMerchant()}

      {/* Tab Navigation */}
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

      {/* Filters (for Buy/Sell tabs) */}
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
            {uniqueCategories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          
          <div className="market-search">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className={festivalMarketActive ? 'festival-input' : ''}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="market-content">
        {/* Left Panel: Items Grid or Requests List */}
        <div className="market-listings">
          {activeTab === 'requests' ? renderRequestsList() : renderItemsGrid()}
        </div>

        {/* Right Sidebar: Wallet, Details, Rumors */}
        <div className="market-sidebar">
          <div 
            className={`market-wallet ${festivalMarketActive ? 'festival-wallet' : ''}`}
            style={festivalMarketActive ? { 
              borderColor: getFestivalThemeColors().accent,
              background: `linear-gradient(135deg, ${getFestivalThemeColors().primary}, ${getFestivalThemeColors().secondary})`,
              color: getFestivalThemeColors().text 
            } : {}}
          >
            <h3>My Purse</h3>
            <div className="wallet-amount">{formatPrice(playerGold)}</div>
          </div>
          
          {renderDetailsPanel()}
          {renderRumors()}
          
          {blackMarketAccess && showBlackMarket && (
            <div className="black-market-notice">Shady deals happen here...</div>
          )}
        </div>
      </div>

      {/* CSS Variables for Festival Themes */}
      {festivalMarketActive && (
        <style>{`
          :root {
            --festival-primary: ${getFestivalThemeColors().primary};
            --festival-secondary: ${getFestivalThemeColors().secondary};
            --festival-accent: ${getFestivalThemeColors().accent};
            --festival-text: ${getFestivalThemeColors().text};
          }
        `}</style>
      )}
    </div>
  );
};

export default Market;