import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Market.css';
import { 
  InventoryItem, 
  MarketItem, 
  Rumor, 
  TownRequest, 
  TarotCard, 
  ElementType 
} from 'coven-shared';
import { findCardById } from 'coven-shared';

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
  }>({ active: false, name: '', greeting: '', discount: 0 });
  const secretTriggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio effects (90s style)
  const audioRefs = useRef<{
    select: HTMLAudioElement | null;
    buy: HTMLAudioElement | null;
    sell: HTMLAudioElement | null;
    coin: HTMLAudioElement | null;
    festival: HTMLAudioElement | null;
  }>({
    select: null,
    buy: null,
    sell: null,
    coin: null,
    festival: null
  });

  // Initialize audio elements
  useEffect(() => {
    // Simple sound effects using old-school base64 encoded data
    const selectSound = new Audio('data:audio/wav;base64,UklGRlwDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YTgDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvLy8vLy8vLy8vL2hoaG5ubm5ubm5uAAAAAAAAAAAAAAAA');
    selectSound.volume = 0.2;
    audioRefs.current.select = selectSound;

    const buySound = new Audio('data:audio/wav;base64,UklGRhwDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YfgCAAAALmIvaC5mKF8jTyNFIT8jKiIlGA0bDhoGEwgUCA0AAAAAAAAAAAAAABgtGjMlJCsnMzAtNywmMyg2OTYvLzsrLSwtHRwAAAAAFhYvMDY4OD03PjMnHh0dGhwcAAAAAAAAAAAAQkJCXWJlaWtsb2hra2pnaGUAAAAAAAAALCw0NTw/Rk5RUVFRUFJPUE1JQAAAAAANDBQVHyQnKSw3K0MoXCFzHVkXRBg+HUAVQBBBC0gFTQUAAAAAAAAAAAAAAAAAAAAAAAAA');
    buySound.volume = 0.3;
    audioRefs.current.buy = buySound;

    const sellSound = new Audio('data:audio/wav;base64,UklGRiwDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQgDAAAAQT9APkA9QztDOkM5QDZANEAySC1IJkgmSCFHH0ceQxdFFkUfRR9JJUUjSSFJH0kURxZGEkYRRhBAAAAAAAAAAAAAAAAASERGREVARD1EOkM5QDhANkA0SDJILEgqSCNHIUcaRxlGF0UVRRBHEUcVRxNHEEgPRw5HDUYAAAAAAAAAAAAAAAAAAAA/P0A+QD1COkM5QzhANEAzSDFIK0gpSCJHIEcaRhhGF0UVRRZHE0cTRxFHD0gORw1GDAAAAAAAAAAAAABBP0A/QD1DPEM6QjhCNkA0SDJILEgqSCJHIEcZRxlGF0UVRRRHEkcTRxFHEEcNRg5GDQAAAAAAAAAAAD9APkA9QzxDOkI4QjZANEgxSCxIKUgiRyBHGUcZRhdFFUUWRxNHE0cRRw9HDkYNRg0AAAAAAAAAAAA/P0A+QD1DPEM5QjhCNkAzSDFIK0gpSCJHH0cZRxhGF0UVRRZHE0cSRxFHD0cORgxGDQAAAAAAAAAAAAAAAAAAQD9APkA9RDxDOkI4QjZAM0gxSCxIKUghRx9HGUcYRhZFFUUWRxNHEkcPRw9HDkYNRg0AAAAAAAAAAAAAAAAAAAA/QD5APUM7QzpCOEI2QDNIMUgrSClIIUcfRxlHF0YWRRVFF0cSRxJHD0cPRg1GDEYMAAAAAAAAAAAAAAAAAAAAPz9APkA9QzxDOUI4QjVAM0gwSCxIKEghRx9HGEcYRhZFFUUVRxNHEkcQRw5GDkYMRgwAAAAAAA==');
    sellSound.volume = 0.3;
    audioRefs.current.sell = sellSound;

    const coinSound = new Audio('data:audio/wav;base64,UklGRmQCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA5OTk5OTk5OTk5OTkAAAAAAAAAAAAAAABLTUyDioikoaCdAAAAAAAAAACMhoTh4ePj4ODi0MrMsqu7q564haWAdXNoaWlISWJFUExAAAAAAAAAAAAAAAAMDBkaOTo/P0FBTE9QXFlibnBzd3iFiZCSnKOotby2usezyK2zpJeQiYR1aVNTVk9HUkJAPTo3MigXGxISCgcHBAAAAAAAAAAAAAAAAAAAAAAAAAEEBggJDBETFR0hJC83PEBRVVhnbHF6f4mNlJqisLG5v8DBw8S/vr25tbOrqKSel5KLhH52cGllXlpVUE5IPzoxLComGhIOAQYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFRUSEhISEhISEhIEBAQEBAQEBAQEAAAAAAAAAAAAAAAAAAAAAAA5OTk5OTk5OTk5OTkAAAAAAAAAAAAAAABRUVFRUVFRUVFRUYqKioqKioqKioqKoqGhoaGhoaGhoaF8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fA==');
    coinSound.volume = 0.25;
    audioRefs.current.coin = coinSound;

    const festivalSound = new Audio('data:audio/wav;base64,UklGRsQCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YaACAAASIjMyMzISEgAAIjNERERERDMiABIzRFVVVVVVRDMSIkRVZmZmZmZmVUQiM1VmZmZmZmZmZlUzRFVmZmZmZmZmZlVEM0RVZmZmZmZmZlVENERVZmZmZmZmZlVENCJEVWZmZmZmZlVEIhIzRFVmZmZVRDMSACIzRERERDMiAAABAgMEBAUGAAAAAAAAAAAAAAAAAAAAYGBgX19fXl5eXV1dXFxcW1tbWlpaBwcHCAgICQkJCgoKDAwMDQ0NDg4O8PDw7+/v7u7u7e3t6+vr6urq6enpcXFxb29vbW1ta2trZmZmYmJiYGBgNzc3ODg4OTk5Ojo6OTk5ODg4Nzc3Hx8fICAgISEhIiIiJCQkJSUlJiYmGRkZGBgYFxcXFhYWEhISEBAQDg4OCwsLCgoKCQkJCAgIBQUFAwMDAQEBMTExNDQ0Nzc3Ojo6PT09QEBAQ0NDNzc3NTU1MzMzMTExLi4uKysrKSkpCwsLDAwMDQ0NDg4OEBAQEhISFBQUIiIiICAgHh4eGhoaGBgYFRUVEhIS/v7+/Pz8+vr6+Pj49vb29PT08/Pzurq6t7e3tLS0sbGxrq6uq6urqKioNzc3ODg4OTk5Ojo6Ozs7PDw8PT09AQEBAgICAwMDBAQEBQUFBgYGBwcHOzs7Ojo6OTk5ODg4Nzc3NjY2NTU1VVVVVFRUU1NTUlJSUVFRUFBQT09PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQEBAQEBAQEBAQEBAAAAAAEBAQICAgICAgEBAQAAAAAAAAAAAAAAAAAA');
    festivalSound.volume = 0.3;
    audioRefs.current.festival = festivalSound;

    // Cleanup
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    }
  }, []);

  // Play sound effect helper
  const playSound = (type: 'select' | 'buy' | 'sell' | 'coin' | 'festival') => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {/* Ignore errors */});
    }
  };

  // Reset selection when changing tabs or market type
  useEffect(() => {
    setSelectedItemId(null);
    setSelectedInventoryItemId(null);
    setSelectedRequestId(null);
    playSound('select');
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

  // Easter Egg: Check for festival activation
  useEffect(() => {
    if (secretTriggerCount >= 5) {
      activateFestivalMarket();
      setSecretTriggerCount(0); // Reset after activation
      if (secretTriggerTimeoutRef.current) clearTimeout(secretTriggerTimeoutRef.current); // Clear timeout
    }
  }, [secretTriggerCount]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (secretTriggerTimeoutRef.current) {
        clearTimeout(secretTriggerTimeoutRef.current);
      }
    };
  }, []);

  // Increment secret trigger counter for Easter Egg
  const handleTitleClick = () => {
    // Clear previous timeout if exists
    if (secretTriggerTimeoutRef.current) {
      clearTimeout(secretTriggerTimeoutRef.current);
    }

    const newCount = secretTriggerCount + 1;
    setSecretTriggerCount(newCount);
    
    // Subtle UI feedback
    if (newCount > 1) {
      playSound('coin');
    }

    // Set a timeout to reset clicks if not clicked again quickly
    secretTriggerTimeoutRef.current = setTimeout(() => {
      setSecretTriggerCount(0);
    }, 1500); // Reset after 1.5 seconds of inactivity
  };

  // Activate Festival Market Easter Egg
  const activateFestivalMarket = () => {
    if (festivalMarketActive) return; // Don't reactivate if already active

    // Play festival sound
    playSound('festival');
    
    const themes: Array<'spring' | 'moon' | 'harvest'> = ['spring', 'moon', 'harvest'];
    const selectedTheme = themes[Math.floor(Math.random() * themes.length)];
    setFestivalTheme(selectedTheme);

    // Generate floating lanterns
    const numLanterns = 10 + Math.floor(Math.random() * 10); // 10-19 lanterns
    const newLanterns = Array.from({ length: numLanterns }, () => ({
      x: Math.random() * 100, 
      y: Math.random() * 70, // Position lanterns higher up
      delay: Math.random() * 5, 
      size: 0.6 + Math.random() * 0.5,
    }));
    setLanternPositions(newLanterns);

    // Generate merchant character
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
      console.log(`✨ The Festival Market fades... ✨`);
    }, 60000); // 60 seconds duration
  };

  // Get unique categories and types for filters
  const uniqueCategories = useMemo(() => [...new Set(marketItems.map(item => item.category || 'misc'))].sort(), [marketItems]);
  const uniqueTypes = useMemo(() => [...new Set(marketItems.map(item => item.type))].sort(), [marketItems]);

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
  const getSelectedItemDetails = (): MarketItem | InventoryItem | TownRequest | null => {
    if (activeTab === 'buy' && selectedItemId) return marketItems.find(item => item.id === selectedItemId) || null;
    if (activeTab === 'sell' && selectedInventoryItemId) return playerInventory.find(item => item.id === selectedInventoryItemId) || null;
    if (activeTab === 'requests' && selectedRequestId) return townRequests.find(req => req.id === selectedRequestId) || null;
    return null;
  };
  
  // Get tarot card for an inventory item
  const getTarotCard = (item: MarketItem | InventoryItem | null): TarotCard | null => {
    if (!item) return null;
    
    // Check for tarotCardId property in inventory items
    if ('tarotCardId' in item && item.tarotCardId) {
      return findCardById(item.tarotCardId);
    }
    
    // For market items, check if it has a reference cardId
    if ('cardId' in item && item.cardId) {
      return findCardById(item.cardId);
    }
    
    return null;
  };

  const selectedDetails = getSelectedItemDetails();

  // Format price with gold symbol
  const formatPrice = (price: number): string => `${price}G`;

  // Calculate discounted price if festival is active
  const getAdjustedPrice = (basePrice: number): number => {
    if (festivalMarketActive && specialMerchant.active) {
      return Math.max(1, Math.floor(basePrice * (1 - specialMerchant.discount / 100)));
    }
    return basePrice;
  };

  // Determine price trend icon and class
  const getPriceTrend = (item: MarketItem): { icon: string; class: TrendType } => {
    if (!item.priceHistory || item.priceHistory.length < 2) {
      return { icon: '—', class: 'stable' };
    }
    
    const current = item.price;
    const previous = item.priceHistory[item.priceHistory.length - 2] ?? item.basePrice;
    
    if (current > previous * 1.02) return { icon: '▲', class: 'up' };
    if (current < previous * 0.98) return { icon: '▼', class: 'down' };
    return { icon: '—', class: 'stable' };
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
    
    playSound('select');
  };

  // Handle request selection
  const handleRequestClick = (requestId: string) => {
    setActiveTab('requests'); // Switch to requests tab
    setSelectedRequestId(requestId);
    setSelectedItemId(null);
    setSelectedInventoryItemId(null);
    
    playSound('select');
  };

  // Check if player can afford selected item
  const canAffordItem = (): boolean => {
    if (activeTab !== 'buy' || !selectedDetails || !('price' in selectedDetails)) return false;
    const item = selectedDetails as MarketItem;
    const adjustedPrice = getAdjustedPrice(item.price);
    return playerGold >= adjustedPrice;
  };

  // Check if player can fulfill selected request
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
        text: '#2c5738',
        glow: 'rgba(130, 215, 150, 0.7)'
      };
      case 'moon': return { 
        primary: '#c8dcfc', 
        secondary: '#e6e6ff', 
        accent: '#96aae6', 
        text: '#2e3a67',
        glow: 'rgba(150, 170, 230, 0.7)'
      };
      case 'harvest': return { 
        primary: '#ffe6c8', 
        secondary: '#ffd2b4', 
        accent: '#e6aa78', 
        text: '#6e4525',
        glow: 'rgba(230, 170, 120, 0.7)'
      };
      default: return { 
        primary: '#e6e6ff', 
        secondary: '#ffffea', 
        accent: '#b4b4e6', 
        text: '#333366',
        glow: 'rgba(180, 180, 230, 0.7)'
      };
    }
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
    
    const rumorItemStyle = festivalMarketActive ? { 
      background: `rgba(255,255,255,0.2)`, 
      borderLeftColor: festivalColors.accent, 
      color: festivalColors.text 
    } : {};
    
    return (
      <div 
        className={`market-rumors ${festivalMarketActive ? 'festival-rumors' : ''}`}
        style={festivalStyle}
      >
        <h3>Market Whispers</h3>
        
        {recentRumors.length === 0 ? (
          <div className="rumors-empty">The marketplace is quiet today...</div>
        ) : (
          <div className="rumors-list">
            {recentRumors.map(rumor => (
              <div 
                key={rumor.id} 
                className={`rumor-item ${festivalMarketActive ? 'festival-rumor' : ''}`}
                style={rumorItemStyle}
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
          <div className="merchant-initial" style={{ color: festivalColors.text }}>
            {specialMerchant.name.charAt(0)}
          </div>
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

  // Render Details Panel
  const renderDetailsPanel = () => {
    const festivalColors = getFestivalThemeColors();
    const festivalStyle = festivalMarketActive ? { 
      background: `linear-gradient(135deg, ${festivalColors.primary}, ${festivalColors.secondary})`,
      borderColor: festivalColors.accent,
      color: festivalColors.text
    } : {};
    
    const actionStyle = festivalMarketActive ? { 
      borderColor: festivalColors.accent,
      background: `rgba(255,255,255,0.2)`
    } : {};

    if (!selectedDetails) {
      return (
        <div className={`market-item-details empty ${festivalMarketActive ? 'festival-details' : ''}`}
             style={festivalStyle}>
          <p>Select an item or request for details...</p>
        </div>
      );
    }

    // Buy Tab Details
    if (activeTab === 'buy' && 'basePrice' in selectedDetails) {
      const item = selectedDetails as MarketItem;
      const trend = getPriceTrend(item);
      const adjustedPrice = getAdjustedPrice(item.price);
      
      return (
        <div className={`market-item-details ${festivalMarketActive ? 'festival-details' : ''}`}
             style={festivalStyle}>
          <div className="parchment-scroll">
            <div className="scroll-content">
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
                  
                  <div className={`price-trend ${trend.class}`}>
                    <span className="trend-arrow">{trend.icon}</span>
                    <span>Price is {trend.class}</span>
                  </div>
                </div>
              </div>
              
              <div className="selected-item-description">
                {item.description || "No description available."}
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
          
          <div className="market-actions-panel" style={actionStyle}>
            <button 
              className={`action-button buy ${!canAffordItem() ? 'disabled' : ''} ${festivalMarketActive ? 'festival-button' : ''}`}
              onClick={() => {
                onBuyItem(item.id);
                playSound('buy');
              }}
              disabled={!canAffordItem()}
            >
              Buy for {formatPrice(adjustedPrice)}
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
        <div className={`market-item-details ${festivalMarketActive ? 'festival-details' : ''}`}
             style={festivalStyle}>
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
                {item.description || "No description available."}
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
          
          <div className="market-actions-panel" style={actionStyle}>
            <button 
              className={`action-button sell ${festivalMarketActive ? 'festival-button' : ''}`}
              onClick={() => {
                onSellItem(item.id);
                playSound('sell');
              }}
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
        <div className={`market-item-details ${festivalMarketActive ? 'festival-details' : ''}`}
             style={festivalStyle}>
          <div className="parchment-scroll">
            <div className="scroll-content">
              <h3>{request.requester}'s Request</h3>
              
              <div className="selected-item-description">
                {request.description || "No description available."}
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
          
          <div className="market-actions-panel" style={actionStyle}>
            <button
              className={`action-button fulfill ${!canFulfill ? 'disabled' : ''} ${festivalMarketActive ? 'festival-button' : ''}`}
              onClick={() => {
                onFulfillRequest(request.id);
                playSound('coin');
              }}
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
          <p>Select an item or request for details...</p>
        </div>
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
            borderLeftColor: getFestivalThemeColors().accent, // Preserve thick left border
            boxShadow: `0 0 5px ${getFestivalThemeColors().glow}, 3px 3px 0px rgba(0,0,0,0.2)`
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
                        playSound('coin');
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

  // Render Items Grid (Buy/Sell tab)
  const renderItemsGrid = () => {
    const items = getFilteredItems;
    
    if (items.length === 0) {
      return (
        <div className="empty-message">
          {activeTab === 'buy' ? "No items match your search..." : "Your satchel is empty..."}
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
          const adjustedPrice = getAdjustedPrice(basePrice);
          const quality = invItem?.quality;
          const quantity = invItem?.quantity;

          // Calculate sell price with quality factor
          let sellPreviewPrice = 0;
          if (isSellTab && quality !== undefined) {
            const qualityMultiplier = 0.5 + ((quality) / 100) * 0.7;
            sellPreviewPrice = Math.max(1, Math.round(basePrice * qualityMultiplier));
          }

          // Get price trend
          const trend = marketData ? getPriceTrend(marketData) : { icon: '—', class: 'stable' };
          
          // Festival styles
          const festivalClass = festivalMarketActive ? 'festival-item' : '';
          const festivalStyle = festivalMarketActive ? {
            borderColor: getFestivalThemeColors().accent,
            boxShadow: `0 0 5px ${getFestivalThemeColors().glow}, 3px 3px 0px rgba(0,0,0,0.2)`
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
                {/* Check for tarot card */}
                {(() => {
                  const tarotCard = getTarotCard(item);
                  if (tarotCard) {
                    return (
                      <div 
                        className={`tarot-card-miniature element-${tarotCard.element.toLowerCase()}`}
                        title={`${tarotCard.element} • ${tarotCard.moonPhaseAffinity} • ${tarotCard.seasonAffinity}`}
                      >
                        <div className="card-frame">{tarotCard.name.charAt(0).toUpperCase()}</div>
                        <div className="card-element">{tarotCard.element.charAt(0)}</div>
                      </div>
                    );
                  } else {
                    return <div title={item.name}>{item.name.charAt(0).toUpperCase()}</div>;
                  }
                })()}
              </div>
              
              <div className="item-name">
            {item.name}
            {/* Show element indicator if it's a tarot card */}
            {(() => {
              const tarotCard = getTarotCard(item);
              if (tarotCard) {
                return (
                  <span className={`item-element element-${tarotCard.element.toLowerCase()}`}>
                    {tarotCard.element}
                  </span>
                );
              }
              return null;
            })()}
          </div>
              
              {isSellTab && quantity !== undefined && quality !== undefined && (
                <div className="item-details">
                  <span>Qty: {quantity}</span>
                  <span>Q: {quality}%</span>
                </div>
              )}
              
              <div className="item-price">
                {formatPrice(isSellTab ? sellPreviewPrice : adjustedPrice)}
                <span className={`trend-icon ${trend.class}`}>{trend.icon}</span>
                
                {!isSellTab && festivalMarketActive && specialMerchant.active && 
                 adjustedPrice < basePrice && (
                  <span className="discount-badge">-{specialMerchant.discount}%</span>
                )}
              </div>
            </div>
          );
        })}
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
                 style={{ 
                   left: `${lantern.x}%`, 
                   top: `${lantern.y}%`, 
                   animationDelay: `${lantern.delay}s`, 
                   '--lantern-size': lantern.size 
                 } as React.CSSProperties}
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
            <button 
              className={`bm-toggle ${showBlackMarket ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`}
              onClick={() => {
                setShowBlackMarket(!showBlackMarket);
                playSound('select');
              }}
            >
              {showBlackMarket ? 'Leave Shadows' : 'Enter Shadows'}
            </button>
          )}
        </div>
      </div>

      {/* Special Merchant Banner */}
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
          data-count={townRequests.length}
        >
          Requests
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
        {/* Left Panel: Item Grid or Requests List */}
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
            <div className="black-market-notice">The shadows hold secrets...</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export the component
export default Market;