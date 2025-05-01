import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Market.css';
import { InventoryItem, MarketItem, Rumor, TownRequest } from 'coven-shared'; // Added missing types

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
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null); // For Buy Tab (MarketItem ID)
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null); // For Sell Tab (InventoryItem ID)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null); // For Requests Tab
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
  const [specialMerchant, setSpecialMerchant] = useState<{ active: boolean; name: string; greeting: string; discount: number; }>({ active: false, name: '', greeting: '', discount: 0 });
  const secretTriggerTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for easter egg timeout

  // Check for festival activation
  useEffect(() => {
    if (secretTriggerCount >= 5) {
      activateFestivalMarket();
      setSecretTriggerCount(0); // Reset after activation
      if (secretTriggerTimeoutRef.current) clearTimeout(secretTriggerTimeoutRef.current); // Clear timeout
    }
  }, [secretTriggerCount]);

  // Reset selection when changing tabs or market type
  useEffect(() => {
    setSelectedItemId(null);
    setSelectedInventoryItemId(null);
    setSelectedRequestId(null);
  }, [activeTab, showBlackMarket]);

  // Handle Black Market transition effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (showBlackMarket && blackMarketAccess) { // Only trigger if access is granted
      setBlackMarketTransition(true);
      timer = setTimeout(() => {
        setBlackMarketTransition(false);
      }, 1000); // Short transition effect
    } else {
        setShowBlackMarket(false); // Ensure it's off if access is lost or toggled off
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [showBlackMarket, blackMarketAccess]);

  // Easter Egg Festival Market activation
  const activateFestivalMarket = () => {
    if (festivalMarketActive) return; // Don't reactivate if already active

    const themes: Array<'spring' | 'moon' | 'harvest'> = ['spring', 'moon', 'harvest'];
    const selectedTheme = themes[Math.floor(Math.random() * themes.length)];
    setFestivalTheme(selectedTheme);

    const numLanterns = 10 + Math.floor(Math.random() * 10); // 10-19 lanterns
    const newLanterns = Array.from({ length: numLanterns }, () => ({
      x: Math.random() * 100, y: Math.random() * 70, // Position lanterns higher up
      delay: Math.random() * 5, size: 0.6 + Math.random() * 0.5,
    }));
    setLanternPositions(newLanterns);

    const merchantNames: Record<typeof selectedTheme, string[]> = {
      'spring': ['Blossom', 'Flora', 'Willow', 'Iris', 'Fern'],
      'moon': ['Luna', 'Selene', 'Celeste', 'Nyx', 'Astrid'],
      'harvest': ['Amber', 'Rowan', 'Maple', 'Hazel', 'Saffron']
    };
    const greetings: Record<typeof selectedTheme, string[]> = {
       'spring': ["Bloom and grow! Fresh wares abound!", "Feel the renewal? Special prices bloom today!", "Spring's blessings upon your purchases!"],
       'moon': ["Guided by moonlight, find rare treasures!", "The night market favors the bold. Special deals within!", "Celestial bargains await! What magic will you find?"],
       'harvest': ["Autumn's gifts are plentiful!", "Gather your supplies! A bountiful discount awaits!", "The harvest moon smiles upon these prices!"]
    };
    const names = merchantNames[selectedTheme];
    const selectedName = names[Math.floor(Math.random() * names.length)];
    const selectedGreeting = greetings[selectedTheme][Math.floor(Math.random() * greetings[selectedTheme].length)];
    const discountPercent = 10 + Math.floor(Math.random() * 16); // 10-25% discount

    setSpecialMerchant({ active: true, name: selectedName, greeting: selectedGreeting, discount: discountPercent });
    setFestivalMarketActive(true);
    console.log(`✨ The ${selectedTheme} Festival Market appears! Merchant: ${selectedName} (-${discountPercent}%) ✨`);

    // Festival lasts for ~1 game turn (adjust duration as needed)
    setTimeout(() => {
      setFestivalMarketActive(false);
      setSpecialMerchant({ active: false, name: '', greeting: '', discount: 0 });
       console.log(`✨ The Festival Market fades... ✨`);
    }, 60000); // 60 seconds duration
  };

   // Increment secret trigger counter for Easter Egg
   const handleTitleClick = () => {
       // Clear previous timeout if exists
       if (secretTriggerTimeoutRef.current) {
           clearTimeout(secretTriggerTimeoutRef.current);
       }

       const newCount = secretTriggerCount + 1;
       setSecretTriggerCount(newCount);
       console.log("Title click count:", newCount); // Debug log

       // Set a timeout to reset clicks if not clicked again quickly
       secretTriggerTimeoutRef.current = setTimeout(() => {
           setSecretTriggerCount(0);
           console.log("Title click count reset."); // Debug log
       }, 1500); // Reset after 1.5 seconds of inactivity
   };

   // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (secretTriggerTimeoutRef.current) {
                clearTimeout(secretTriggerTimeoutRef.current);
            }
        };
    }, []);

  // Filter items based on tab, filters, and black market status
  const getFilteredItems = useMemo(() => {
    let itemsToFilter: (MarketItem | InventoryItem)[] = [];
    const baseMarket = marketItems.filter(item => !item.blackMarketOnly || (item.blackMarketOnly && showBlackMarket));

    if (activeTab === 'buy') {
      itemsToFilter = baseMarket;
    } else if (activeTab === 'sell') {
      const sellableMarketIds = new Set(baseMarket.map(mi => mi.id)); // Use filtered market IDs
       itemsToFilter = playerInventory.filter(invItem =>
           // Ensure the base item exists in the *currently visible* market and player has quantity
           sellableMarketIds.has(invItem.baseId) && invItem.quantity > 0
       );
    } else {
      return []; // No items for requests tab
    }

    // Apply common filters
    let filtered = itemsToFilter;
    if (categoryFilter !== 'all') filtered = filtered.filter(item => item.category === categoryFilter);
    if (typeFilter !== 'all') filtered = filtered.filter(item => item.type === typeFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }

    // Sort by name
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [activeTab, marketItems, playerInventory, showBlackMarket, categoryFilter, typeFilter, searchTerm]);

  // Get selected item/request details
  const getSelectedItemDetails = (): MarketItem | InventoryItem | TownRequest | null => { // Added TownRequest
    if (activeTab === 'buy' && selectedItemId) return marketItems.find(item => item.id === selectedItemId) || null; // Added null fallback
    if (activeTab === 'sell' && selectedInventoryItemId) return playerInventory.find(item => item.id === selectedInventoryItemId) || null; // Added null fallback
    if (activeTab === 'requests' && selectedRequestId) return townRequests.find(req => req.id === selectedRequestId) || null; // Added null fallback
    return null;
  };

  const selectedDetails = getSelectedItemDetails();

  // Format price
  const formatPrice = (price: number): string => `${price}G`; // Simpler format

  // Calculate discounted price if festival is active
  const getAdjustedPrice = (basePrice: number): number => {
    if (festivalMarketActive && specialMerchant.active) {
      return Math.max(1, Math.floor(basePrice * (1 - specialMerchant.discount / 100)));
    }
    return basePrice;
  };

  // Determine price trend icon
  const getPriceTrendIcon = (item: MarketItem): string => {
    if (!item.priceHistory || item.priceHistory.length < 2) return '—'; // Neutral dash
    const current = item.price;
    const previous = item.priceHistory[item.priceHistory.length - 2] ?? item.basePrice;
    if (current > previous * 1.01) return '▲'; // Use threshold
    if (current < previous * 0.99) return '▼'; // Use threshold
    return '—';
  };

  // Get trend class
  const getTrendClass = (item: MarketItem): TrendType => {
     if (!item.priceHistory || item.priceHistory.length < 2) return 'stable';
     const current = item.price;
     const previous = item.priceHistory[item.priceHistory.length - 2] ?? item.basePrice;
     if (current > previous * 1.02) return 'up'; // Trend needs slightly bigger change
     if (current < previous * 0.98) return 'down';
     return 'stable';
  };

  // Handle item selection
  const handleItemClick = (id: string, isMarketItem: boolean) => {
    if (isMarketItem) { // Clicked item in Buy tab
      setActiveTab('buy'); // Ensure buy tab is active
      setSelectedItemId(id);
      setSelectedInventoryItemId(null);
      setSelectedRequestId(null);
    } else { // Clicked item in Sell tab (InventoryItem)
        setActiveTab('sell'); // Ensure sell tab is active
        setSelectedInventoryItemId(id);
        setSelectedItemId(null);
        setSelectedRequestId(null);
    }
  };

  // Handle request selection
  const handleRequestClick = (requestId: string) => {
    setActiveTab('requests'); // Switch to requests tab
    setSelectedRequestId(requestId);
    setSelectedItemId(null);
    setSelectedInventoryItemId(null);
  };

  // Check affordability
  const canAffordItem = (): boolean => {
     if (activeTab !== 'buy' || !selectedDetails || !('price' in selectedDetails)) return false;
     const item = selectedDetails as MarketItem;
     const adjustedPrice = getAdjustedPrice(item.price);
     return playerGold >= adjustedPrice;
  };

  // Check if player can fulfill selected request
   const canFulfillRequest = (): boolean => {
       if (activeTab !== 'requests' || !selectedDetails || !('item' in selectedDetails)) return false;
       const request = selectedDetails as TownRequest;
       const totalQuantity = playerInventory
           .filter(item => item.name === request.item) // Match by name as request uses name
           .reduce((sum, item) => sum + item.quantity, 0);
       return totalQuantity >= request.quantity;
   };

   // Helper function to check request fulfillment by ID (for list rendering)
   const canFulfillRequestById = (requestId: string): boolean => {
       const request = townRequests.find(req => req.id === requestId);
       if (!request) return false;
       const totalQuantity = playerInventory
           .filter(item => item.name === request.item)
           .reduce((sum, item) => sum + item.quantity, 0);
       return totalQuantity >= request.quantity;
   };

  // Get unique types and categories for filters
  const uniqueTypes = useMemo(() => [...new Set(marketItems.map(item => item.type))].sort(), [marketItems]);
  const uniqueCategories = useMemo(() => [...new Set(marketItems.map(item => item.category || 'misc'))].sort(), [marketItems]); // Added fallback

  // Get festival theme colors
  const getFestivalThemeColors = () => {
     switch (festivalTheme) {
       case 'spring': return { primary: '#d2fadc', secondary: '#ffc8e0', accent: '#82d796', text: '#2c5738', glow: 'rgba(190, 255, 200, 0.7)' };
       case 'moon': return { primary: '#c8dcfc', secondary: '#e6e6ff', accent: '#96aae6', text: '#2e3a67', glow: 'rgba(190, 210, 255, 0.7)' };
       case 'harvest': return { primary: '#ffe6c8', secondary: '#ffd2b4', accent: '#e6aa78', text: '#6e4525', glow: 'rgba(255, 220, 180, 0.7)' };
       default: return { primary: '#e6e6ff', secondary: '#ffffea', accent: '#b4b4e6', text: '#333366', glow: 'rgba(200, 200, 255, 0.7)' };
     }
  };

  // ---- Render Functions ----

  // Render Market Items Grid or Inventory Grid
  const renderItemsGrid = () => {
    const items = getFilteredItems;
    if (items.length === 0) return <div className="market-items empty"><p>{activeTab === 'buy' ? "Nothing matching..." : "Satchel empty..."}</p></div>;

    const isSellTab = activeTab === 'sell';
    const currentSelectionId = isSellTab ? selectedInventoryItemId : selectedItemId;

    return (
      <div className="market-items-grid">
        {items.map(item => {
          const invItem = isSellTab ? item as InventoryItem : undefined;
          const marketData = isSellTab ? marketItems.find(mi => mi.id === invItem?.baseId) : item as MarketItem;
          const displayPrice = marketData?.price ?? (invItem?.value || 1); // Use value as fallback price base
          const adjustedPrice = isSellTab ? displayPrice : getAdjustedPrice(displayPrice);
          const quality = invItem?.quality;
          const quantity = invItem?.quantity;

          let sellPreviewPrice = 0;
           if (isSellTab) {
               const qualityMultiplier = 0.5 + ((quality ?? 70) / 100) * 0.7;
               sellPreviewPrice = Math.max(1, Math.round(adjustedPrice * qualityMultiplier)); // Use adjusted market price as base for selling too
           }

          const festivalClass = festivalMarketActive ? 'festival-item' : '';
          const festivalItemStyle = festivalMarketActive ? {
              borderColor: getFestivalThemeColors().accent,
              boxShadow: `0 0 5px ${getFestivalThemeColors().glow}, 3px 3px 0px rgba(0,0,0,0.2)` // Combine glow and shadow
          } : {};

          return (
            <div
              key={item.id} // Use unique ID (market or inventory)
              className={`market-item ${item.type} ${currentSelectionId === item.id ? 'selected' : ''} ${festivalClass}`}
              style={festivalItemStyle}
              onClick={() => handleItemClick(item.id, !isSellTab)} // Pass if it's a market item click
              title={`${item.name}${quality !== undefined ? ` (Q: ${quality}%)` : ''}${quantity ? ` (Qty: ${quantity})` : ''}\n${item.description || ''}`}
            >
              {item.category && <div className="market-item-category">{item.category}</div>}
              <div className="market-item-image">
                <div title={item.name}>{item.name.charAt(0).toUpperCase()}</div>
                {/* Placeholder for image */}
              </div>
              <div className="market-item-name">{item.name}</div>
              {isSellTab && quantity !== undefined && quality !== undefined && (
                 <div className="item-sub-details"><span>Qty: {quantity}</span><span>Q: {quality}%</span></div>
              )}
              <div className="market-item-price">
                  {formatPrice(isSellTab ? sellPreviewPrice : adjustedPrice)}
                  {marketData && <span className={`trend-indicator ${getTrendClass(marketData)}`}>{getPriceTrendIcon(marketData)}</span>}
                  {!isSellTab && festivalMarketActive && specialMerchant.active && adjustedPrice < (marketData?.price ?? adjustedPrice +1) &&(
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
     if (townRequests.length === 0) return <div className="request-list empty"><p>Notice board is empty...</p></div>;

     return (
       <div className="request-list">
         {townRequests.map(request => {
           const playerCanFulfill = canFulfillRequestById(request.id);
           const totalQuantity = playerInventory.filter(item => item.name === request.item).reduce((sum, item) => sum + item.quantity, 0);
           const festivalReqStyle = festivalMarketActive ? { borderColor: getFestivalThemeColors().accent, background: `rgba(255,255,255,0.1)` } : {};

           return (
             <div key={request.id} className={`request-item ${selectedRequestId === request.id ? 'selected' : ''} ${festivalMarketActive ? 'festival-request' : ''}`} style={festivalReqStyle} onClick={() => handleRequestClick(request.id)}>
               <div className="request-icon" title={request.requester}>{request.requester.charAt(0).toUpperCase()}</div>
               <div className="request-details">
                 <div className="request-requester">{request.requester} requests:</div>
                 <div className="request-item-info"><strong>{request.quantity} × {request.item}</strong><div className="inventory-check">(Have: {totalQuantity})</div></div>
                 <div className="request-rewards">
                   <div className="request-reward request-reward-gold" title={`${request.rewardGold} Gold`}>{request.rewardGold}</div>
                   <div className="request-reward request-reward-influence" title={`${request.rewardInfluence} Rep`}>+{request.rewardInfluence}</div>
                 </div>
                 <div className="request-info">
                   <div className="request-difficulty" title={`Difficulty: ${request.difficulty}/5`}>{Array(request.difficulty).fill('★').join('')}{Array(5 - request.difficulty).fill('☆').join('')}</div>
                   <button className={`fulfill-button ${playerCanFulfill ? 'can-fulfill' : 'cant-fulfill'} ${festivalMarketActive ? 'festival-button' : ''}`} onClick={(e) => { e.stopPropagation(); if (playerCanFulfill) { onFulfillRequest(request.id); setSelectedRequestId(null); } }} disabled={!playerCanFulfill}>
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

  // Render Details Panel
  const renderDetailsPanel = () => {
     const festivalColors = getFestivalThemeColors();
     const detailStyle = festivalMarketActive ? { background: `rgba(255,255,255,0.1)`, borderTopColor: festivalColors.accent } : {};

     if (!selectedDetails) {
       return (
         <div className={`market-item-details empty ${festivalMarketActive ? 'festival-details' : ''}`}>
             <div className="scroll-content"><p>Select item or request...</p></div>
         </div>
       );
     }

     // --- Buy Tab Details ---
     if (activeTab === 'buy' && 'basePrice' in selectedDetails) {
       const item = selectedDetails as MarketItem;
       const trendClass = getTrendClass(item);
       const adjustedPrice = getAdjustedPrice(item.price);
       return (
         <div className={`market-item-details ${festivalMarketActive ? 'festival-details' : ''}`}>
            <div className="parchment-scroll">
                 <div className="scroll-content">
                     <h3>{item.name}</h3>
                     <div className="selected-item-header">
                         <div className="selected-item-image"><div>{item.name.charAt(0).toUpperCase()}</div></div>
                         <div className="selected-item-info">
                             <div className="selected-item-price">
                                 {formatPrice(adjustedPrice)}
                                 {adjustedPrice < item.price && <span className="original-price">{formatPrice(item.price)}</span>}
                             </div>
                             <div className={`price-trend ${trendClass}`}><span className="price-trend-arrow">{getPriceTrendIcon(item)}</span><span>{trendClass}</span></div>
                         </div>
                     </div>
                     <div className="selected-item-description">{item.description || "..."}</div>
                     {item.rarity && <div className="selected-item-rarity">Rarity: <span>{item.rarity}</span></div>}
                     {item.seasonalBonus && <div className="selected-item-seasonal">Season: {item.seasonalBonus}</div>}
                 </div>
             </div>
             <div className="market-actions-panel" style={detailStyle}>
                 <button className={`primary ${!canAffordItem() ? 'disabled' : ''} ${festivalMarketActive ? 'festival-button' : ''}`} onClick={() => onBuyItem(item.id)} disabled={!canAffordItem()}>Buy {formatPrice(adjustedPrice)}</button>
             </div>
         </div>
       );
     }

     // --- Sell Tab Details ---
     if (activeTab === 'sell' && 'quantity' in selectedDetails) {
       const item = selectedDetails as InventoryItem;
       const marketData = marketItems.find(mi => mi.id === item.baseId);
       const baseSellPrice = marketData?.price ?? item.value ?? 1; // Use market price if available, else item value
       const qualityMultiplier = 0.5 + ((item.quality ?? 70) / 100) * 0.7;
       const actualSellPrice = Math.max(1, Math.round(baseSellPrice * qualityMultiplier));
       const trendClass = marketData ? getTrendClass(marketData) : 'stable';

       return (
         <div className={`market-item-details ${festivalMarketActive ? 'festival-details' : ''}`}>
            <div className="parchment-scroll">
                 <div className="scroll-content">
                     <h3>Sell: {item.name}</h3>
                     <div className="selected-item-header">
                         <div className="selected-item-image"><div>{item.name.charAt(0).toUpperCase()}</div></div>
                         <div className="selected-item-info">
                             <div className="selected-item-price">Have: {item.quantity}</div>
                             {item.quality !== undefined && <div className="selected-item-quality">Quality: {item.quality}%</div>}
                         </div>
                     </div>
                     <div className="selected-item-description">{item.description || "..."}</div>
                     <div className="expected-sell-price">Est. Sell Value: {formatPrice(actualSellPrice)} each</div>
                     {marketData && <div className={`price-trend ${trendClass}`}><span className="price-trend-arrow">{getPriceTrendIcon(marketData)}</span><span>Market Price is {trendClass}</span></div>}
                 </div>
            </div>
            <div className="market-actions-panel" style={detailStyle}>
                <button className={`primary ${festivalMarketActive ? 'festival-button' : ''}`} onClick={() => onSellItem(item.id)} disabled={item.quantity <= 0}>Sell 1 for {formatPrice(actualSellPrice)}</button>
                {/* Sell All button would need backend logic to handle selling multiple items at once */}
                {/* {item.quantity > 1 && <button className={`secondary ${festivalMarketActive ? 'festival-button' : ''}`} onClick={() => console.log("Sell All TBD")} >Sell All ({item.quantity})</button>} */}
            </div>
         </div>
       );
     }

     // --- Requests Tab Details ---
      if (activeTab === 'requests' && 'requester' in selectedDetails) {
        const request = selectedDetails as TownRequest;
        const canFulfill = canFulfillRequest();
        const totalQuantity = playerInventory.filter(i => i.name === request.item).reduce((sum, i) => sum + i.quantity, 0);
        const avgQuality = totalQuantity > 0 ? Math.round(playerInventory.filter(i => i.name === request.item).reduce((s, i) => s + (i.quality ?? 70) * i.quantity, 0) / totalQuantity) : 0;

        return (
          <div className={`market-item-details ${festivalMarketActive ? 'festival-details' : ''}`}>
            <div className="parchment-scroll">
                <div className="scroll-content">
                    <h3>{request.requester}'s Request</h3>
                    <div className="selected-item-description">{request.description}</div>
                    <hr style={{borderColor: '#a1887f', margin: '10px 0'}}/>
                    <div><strong>Needs:</strong> {request.quantity} × {request.item}</div>
                    <div><strong>Have:</strong> {totalQuantity} {totalQuantity > 0 ? `(Avg Q: ~${avgQuality}%)` : ''}</div>
                    <hr style={{borderColor: '#a1887f', margin: '10px 0'}}/>
                    <div><strong>Rewards:</strong></div>
                    <div className="request-rewards">
                         <div className="request-reward request-reward-gold">{request.rewardGold}</div>
                         <div className="request-reward request-reward-influence">+{request.rewardInfluence}</div>
                    </div>
                    <div className="request-difficulty" style={{justifyContent:'flex-start', marginLeft:0, marginTop:'10px'}}>
                         Difficulty: {Array(request.difficulty).fill('★').join('')}{Array(5 - request.difficulty).fill('☆').join('')}
                    </div>
                </div>
            </div>
            <div className="market-actions-panel" style={detailStyle}>
                <button className={`primary ${!canFulfill ? 'disabled' : ''} ${festivalMarketActive ? 'festival-button' : ''}`} onClick={() => onFulfillRequest(request.id)} disabled={!canFulfill}>Fulfill Request</button>
            </div>
          </div>
        );
      }

     // Fallback
     return <div className="market-item-details empty"><div className="scroll-content"><p>Select...</p></div></div>;
   };

  // Render Rumors Section
  const renderRumorsSection = () => {
    const recentRumors = rumors.slice(-3).reverse(); // Show 3 most recent
    const festivalColors = getFestivalThemeColors();
    const rumorStyle = festivalMarketActive ? {
      borderColor: festivalColors.accent,
      background: `linear-gradient(135deg, ${festivalColors.primary}, ${festivalColors.secondary})`,
      color: festivalColors.text
    } : {};
     const rumorItemStyle = festivalMarketActive ? { background: `rgba(255,255,255,0.2)`, borderLeftColor: festivalColors.accent, color: festivalColors.text } : {};

    return (
      <div className={`market-rumors ${festivalMarketActive ? 'festival-rumors' : ''}`} style={rumorStyle}>
        <h3>Market Whispers</h3>
        {recentRumors.length === 0 ? (
          <div className="rumor-list empty">The marketplace is quiet...</div>
        ) : (
          <div className="rumor-list">
            {recentRumors.map(rumor => (
              <div key={rumor.id} className={`rumor-item ${festivalMarketActive ? 'festival-rumor' : ''}`} style={rumorItemStyle} title={`${rumor.origin} ~${rumor.turnsActive || 0}d ago`}>
                {rumor.content}
                {/* <span className="rumor-source">— {rumor.origin}</span> */}
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
      <div className="special-merchant-banner" style={{ background: `linear-gradient(45deg, ${festivalColors.primary}, ${festivalColors.secondary})`, borderColor: festivalColors.accent, color: festivalColors.text }}>
        <div className="merchant-portrait"><div className="merchant-initial">{specialMerchant.name.charAt(0)}</div></div>
        <div className="merchant-info">
          <h3 className="merchant-name">{specialMerchant.name}</h3>
          <p className="merchant-greeting">"{specialMerchant.greeting}"</p>
          <div className="merchant-offer"><span className="special-discount">{specialMerchant.discount}% Festival Discount!</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className={`market-container ${showBlackMarket ? 'black-market-active' : ''} ${festivalMarketActive ? `festival-market ${festivalTheme}-theme` : ''}`}>
      {/* Black Market transition effect */}
      {blackMarketTransition && <div className="black-market-transition" />}

      {/* Festival Market Overlay */}
      {festivalMarketActive && (
        <div className="festival-overlay">
          {lanternPositions.map((lantern, index) => (
            <div key={`lantern-${index}`} className={`festival-lantern ${festivalTheme}-lantern`}
                 style={{ left: `${lantern.x}%`, top: `${lantern.y}%`, animationDelay: `${lantern.delay}s`, '--lantern-size': lantern.size } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="market-header">
        {/* Added onClick for Easter Egg */}
        <h2 onClick={handleTitleClick} title="Click rapidly...">
          {showBlackMarket ? "Black Market" : (festivalMarketActive ? `${festivalTheme.charAt(0).toUpperCase() + festivalTheme.slice(1)} Festival` : "Town Market")}
        </h2>
        <div className="market-actions">
          {blackMarketAccess && (
            <button className={`bm-toggle ${showBlackMarket ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`} onClick={() => setShowBlackMarket(!showBlackMarket)}>
              {showBlackMarket ? 'Leave Shadows' : 'Enter Shadows'}
            </button>
          )}
        </div>
      </div>

      {renderSpecialMerchant()}

      {/* Tabs */}
      <div className="market-toggle">
        <button className={`${activeTab === 'buy' ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`} onClick={() => setActiveTab('buy')}>Buy</button>
        <button className={`${activeTab === 'sell' ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`} onClick={() => setActiveTab('sell')}>Sell</button>
        <button className={`${activeTab === 'requests' ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`} onClick={() => setActiveTab('requests')}>Requests ({townRequests.length})</button>
      </div>

       {/* Filters (Only for Buy/Sell) */}
       {activeTab !== 'requests' && (
         <div className="market-filters">
           <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={festivalMarketActive ? 'festival-select' : ''}>
             <option value="all">All Types</option>
             {uniqueTypes.map(type => (<option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>))}
           </select>
           <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={festivalMarketActive ? 'festival-select' : ''}>
             <option value="all">All Categories</option>
             {uniqueCategories.map(cat => (<option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>))}
           </select>
           <div className="market-search">
             <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={festivalMarketActive ? 'festival-input' : ''} />
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
          <div className={`market-wallet ${festivalMarketActive ? 'festival-wallet' : ''}`} style={festivalMarketActive ? { borderColor: getFestivalThemeColors().accent, background: `linear-gradient(135deg, ${getFestivalThemeColors().primary}, ${getFestivalThemeColors().secondary})`, color: getFestivalThemeColors().text } : {}}>
            <h3>My Purse</h3>
            <div className="wallet-amount">{formatPrice(playerGold)}</div>
          </div>
          {renderDetailsPanel()}
          {renderRumorsSection()}
          {blackMarketAccess && showBlackMarket && <div className="black-market-notice">Shady deals happen here...</div>}
        </div>
      </div>

      {/* Festival CSS overrides */}
      {festivalMarketActive && <style>{`
          .festival-wallet h3, .festival-details h3, .festival-rumors h3 { color: var(--festival-accent); text-shadow: 1px 1px 0px rgba(0,0,0,0.3); border-bottom-color: var(--festival-accent); }
          .festival-wallet .wallet-amount { color: var(--festival-text); text-shadow: 1px 1px 0px rgba(255,255,255,0.2); }
          .festival-details .scroll-content { color: var(--festival-text); }
          .festival-details .selected-item-name { color: var(--festival-text); }
          .festival-details .selected-item-price { color: var(--festival-accent); }
          .festival-details .selected-item-description, .festival-details .selected-item-rarity, .festival-details .selected-item-quality, .festival-details .selected-item-seasonal, .festival-details .expected-sell-price, .festival-details .price-trend { color: var(--festival-text); opacity: 0.9; }
          .festival-rumors .rumor-item { color: var(--festival-text); }
          .festival-button { border-color: var(--festival-accent) !important; }
          .festival-button.primary { background-color: var(--festival-accent) !important; color: var(--festival-primary) !important; }
          .festival-button.primary:hover { filter: brightness(1.1); }
          .festival-select, .festival-input { background-color: var(--festival-primary); color: var(--festival-text); border-color: var(--festival-accent); }
       `}</style>}

    </div>
  );
};

export default Market;