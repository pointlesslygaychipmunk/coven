import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useMemo } from 'react';
import './Market.css';
const Market = ({ playerGold, playerInventory = [], marketItems = [], rumors = [], townRequests = [], blackMarketAccess, onBuyItem, onSellItem, onFulfillRequest, }) => {
    // State
    const [activeTab, setActiveTab] = useState('buy');
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [selectedInventoryItemId, setSelectedInventoryItemId] = useState(null);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showBlackMarket, setShowBlackMarket] = useState(false);
    const [blackMarketTransition, setBlackMarketTransition] = useState(false);
    // Easter Egg - Festival Market
    const [secretTriggerCount, setSecretTriggerCount] = useState(0);
    const [festivalMarketActive, setFestivalMarketActive] = useState(false);
    const [lanternPositions, setLanternPositions] = useState([]);
    const [festivalTheme, setFestivalTheme] = useState('moon');
    const [specialMerchant, setSpecialMerchant] = useState({ active: false, name: '', greeting: '', discount: 0 });
    const secretTriggerTimeoutRef = useRef(null);
    // Audio effects (90s style)
    const audioRefs = useRef({
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
        };
    }, []);
    // Play sound effect helper
    const playSound = (type) => {
        const audio = audioRefs.current[type];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => { });
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
        let timer = null;
        if (showBlackMarket && blackMarketAccess) { // Only trigger if access is granted
            setBlackMarketTransition(true);
            timer = setTimeout(() => {
                setBlackMarketTransition(false);
            }, 1000); // Short transition effect
        }
        else {
            setShowBlackMarket(false); // Ensure it's off if access is lost or toggled off
        }
        return () => { if (timer)
            clearTimeout(timer); };
    }, [showBlackMarket, blackMarketAccess]);
    // Easter Egg: Check for festival activation
    useEffect(() => {
        if (secretTriggerCount >= 5) {
            activateFestivalMarket();
            setSecretTriggerCount(0); // Reset after activation
            if (secretTriggerTimeoutRef.current)
                clearTimeout(secretTriggerTimeoutRef.current); // Clear timeout
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
        if (festivalMarketActive)
            return; // Don't reactivate if already active
        // Play festival sound
        playSound('festival');
        const themes = ['spring', 'moon', 'harvest'];
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
        const merchantNames = {
            'spring': ['Blossom', 'Flora', 'Willow', 'Iris', 'Fern'],
            'moon': ['Luna', 'Selene', 'Celeste', 'Nyx', 'Astrid'],
            'harvest': ['Amber', 'Rowan', 'Maple', 'Hazel', 'Saffron']
        };
        const greetings = {
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
        let itemsToFilter = [];
        const baseMarket = marketItems.filter(item => !item.blackMarketOnly || (item.blackMarketOnly && showBlackMarket));
        if (activeTab === 'buy') {
            itemsToFilter = baseMarket;
        }
        else if (activeTab === 'sell') {
            const sellableMarketIds = new Set(baseMarket.map(mi => mi.id)); // Use filtered market IDs
            itemsToFilter = playerInventory.filter(invItem => 
            // Ensure the base item exists in the *currently visible* market and player has quantity
            sellableMarketIds.has(invItem.baseId) && invItem.quantity > 0);
        }
        else {
            return []; // No items for requests tab
        }
        // Apply common filters
        let filtered = itemsToFilter;
        if (categoryFilter !== 'all')
            filtered = filtered.filter(item => item.category === categoryFilter);
        if (typeFilter !== 'all')
            filtered = filtered.filter(item => item.type === typeFilter);
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item => item.name.toLowerCase().includes(term) ||
                (item.description && item.description.toLowerCase().includes(term)));
        }
        // Sort by name
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }, [activeTab, marketItems, playerInventory, showBlackMarket, categoryFilter, typeFilter, searchTerm]);
    // Get selected item/request details
    const getSelectedItemDetails = () => {
        if (activeTab === 'buy' && selectedItemId)
            return marketItems.find(item => item.id === selectedItemId) || null;
        if (activeTab === 'sell' && selectedInventoryItemId)
            return playerInventory.find(item => item.id === selectedInventoryItemId) || null;
        if (activeTab === 'requests' && selectedRequestId)
            return townRequests.find(req => req.id === selectedRequestId) || null;
        return null;
    };
    const selectedDetails = getSelectedItemDetails();
    // Format price with gold symbol
    const formatPrice = (price) => `${price}G`;
    // Calculate discounted price if festival is active
    const getAdjustedPrice = (basePrice) => {
        if (festivalMarketActive && specialMerchant.active) {
            return Math.max(1, Math.floor(basePrice * (1 - specialMerchant.discount / 100)));
        }
        return basePrice;
    };
    // Determine price trend icon and class
    const getPriceTrend = (item) => {
        if (!item.priceHistory || item.priceHistory.length < 2) {
            return { icon: '—', class: 'stable' };
        }
        const current = item.price;
        const previous = item.priceHistory[item.priceHistory.length - 2] ?? item.basePrice;
        if (current > previous * 1.02)
            return { icon: '▲', class: 'up' };
        if (current < previous * 0.98)
            return { icon: '▼', class: 'down' };
        return { icon: '—', class: 'stable' };
    };
    // Handle item selection
    const handleItemClick = (id, isMarketItem) => {
        if (isMarketItem) { // Clicked item in Buy tab
            setActiveTab('buy'); // Ensure buy tab is active
            setSelectedItemId(id);
            setSelectedInventoryItemId(null);
            setSelectedRequestId(null);
        }
        else { // Clicked item in Sell tab (InventoryItem)
            setActiveTab('sell'); // Ensure sell tab is active
            setSelectedInventoryItemId(id);
            setSelectedItemId(null);
            setSelectedRequestId(null);
        }
        playSound('select');
    };
    // Handle request selection
    const handleRequestClick = (requestId) => {
        setActiveTab('requests'); // Switch to requests tab
        setSelectedRequestId(requestId);
        setSelectedItemId(null);
        setSelectedInventoryItemId(null);
        playSound('select');
    };
    // Check if player can afford selected item
    const canAffordItem = () => {
        if (activeTab !== 'buy' || !selectedDetails || !('price' in selectedDetails))
            return false;
        const item = selectedDetails;
        const adjustedPrice = getAdjustedPrice(item.price);
        return playerGold >= adjustedPrice;
    };
    // Check if player can fulfill selected request
    const canFulfillRequest = (requestId) => {
        const request = requestId
            ? townRequests.find(req => req.id === requestId)
            : activeTab === 'requests' && selectedDetails && 'item' in selectedDetails
                ? selectedDetails
                : null;
        if (!request)
            return false;
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
        return (_jsxs("div", { className: `market-rumors ${festivalMarketActive ? 'festival-rumors' : ''}`, style: festivalStyle, children: [_jsx("h3", { children: "Market Whispers" }), recentRumors.length === 0 ? (_jsx("div", { className: "rumors-empty", children: "The marketplace is quiet today..." })) : (_jsx("div", { className: "rumors-list", children: recentRumors.map(rumor => (_jsx("div", { className: `rumor-item ${festivalMarketActive ? 'festival-rumor' : ''}`, style: rumorItemStyle, title: `${rumor.origin} ~${rumor.turnsActive || 0}d ago`, children: rumor.content }, rumor.id))) }))] }));
    };
    // Render Special Merchant Banner
    const renderSpecialMerchant = () => {
        if (!festivalMarketActive || !specialMerchant.active)
            return null;
        const festivalColors = getFestivalThemeColors();
        return (_jsxs("div", { className: "special-merchant-banner", style: {
                background: `linear-gradient(45deg, ${festivalColors.primary}, ${festivalColors.secondary})`,
                borderColor: festivalColors.accent,
                color: festivalColors.text
            }, children: [_jsx("div", { className: "merchant-portrait", children: _jsx("div", { className: "merchant-initial", style: { color: festivalColors.text }, children: specialMerchant.name.charAt(0) }) }), _jsxs("div", { className: "merchant-info", children: [_jsx("h3", { className: "merchant-name", children: specialMerchant.name }), _jsxs("p", { className: "merchant-greeting", children: ["\"", specialMerchant.greeting, "\""] }), _jsx("div", { className: "merchant-offer", children: _jsxs("span", { className: "special-discount", children: [specialMerchant.discount, "% Festival Discount!"] }) })] })] }));
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
            return (_jsx("div", { className: `market-item-details empty ${festivalMarketActive ? 'festival-details' : ''}`, style: festivalStyle, children: _jsx("p", { children: "Select an item or request for details..." }) }));
        }
        // Buy Tab Details
        if (activeTab === 'buy' && 'basePrice' in selectedDetails) {
            const item = selectedDetails;
            const trend = getPriceTrend(item);
            const adjustedPrice = getAdjustedPrice(item.price);
            return (_jsxs("div", { className: `market-item-details ${festivalMarketActive ? 'festival-details' : ''}`, style: festivalStyle, children: [_jsx("div", { className: "parchment-scroll", children: _jsxs("div", { className: "scroll-content", children: [_jsx("h3", { children: item.name }), _jsxs("div", { className: "selected-item-header", children: [_jsx("div", { className: "selected-item-image", children: _jsx("div", { children: item.name.charAt(0).toUpperCase() }) }), _jsxs("div", { className: "selected-item-info", children: [_jsxs("div", { className: "selected-item-price", children: [formatPrice(adjustedPrice), adjustedPrice < item.price && (_jsx("span", { className: "original-price", children: formatPrice(item.price) }))] }), _jsxs("div", { className: `price-trend ${trend.class}`, children: [_jsx("span", { className: "trend-arrow", children: trend.icon }), _jsxs("span", { children: ["Price is ", trend.class] })] })] })] }), _jsx("div", { className: "selected-item-description", children: item.description || "No description available." }), item.rarity && (_jsxs("div", { className: "selected-item-rarity", children: ["Rarity: ", _jsx("span", { children: item.rarity })] })), item.seasonalBonus && (_jsxs("div", { className: "selected-item-seasonal", children: ["Season: ", item.seasonalBonus] }))] }) }), _jsx("div", { className: "market-actions-panel", style: actionStyle, children: _jsxs("button", { className: `action-button buy ${!canAffordItem() ? 'disabled' : ''} ${festivalMarketActive ? 'festival-button' : ''}`, onClick: () => {
                                onBuyItem(item.id);
                                playSound('buy');
                            }, disabled: !canAffordItem(), children: ["Buy for ", formatPrice(adjustedPrice)] }) })] }));
        }
        // Sell Tab Details
        if (activeTab === 'sell' && 'quantity' in selectedDetails) {
            const item = selectedDetails;
            const marketData = marketItems.find(mi => mi.id === item.baseId);
            const basePrice = marketData?.price ?? item.value ?? 1;
            const qualityMultiplier = 0.5 + ((item.quality ?? 70) / 100) * 0.7;
            const sellPrice = Math.max(1, Math.round(basePrice * qualityMultiplier));
            const trend = marketData ? getPriceTrend(marketData) : { icon: '—', class: 'stable' };
            return (_jsxs("div", { className: `market-item-details ${festivalMarketActive ? 'festival-details' : ''}`, style: festivalStyle, children: [_jsx("div", { className: "parchment-scroll", children: _jsxs("div", { className: "scroll-content", children: [_jsxs("h3", { children: ["Sell: ", item.name] }), _jsxs("div", { className: "selected-item-header", children: [_jsx("div", { className: "selected-item-image", children: _jsx("div", { children: item.name.charAt(0).toUpperCase() }) }), _jsxs("div", { className: "selected-item-info", children: [_jsxs("div", { className: "selected-item-quantity", children: ["Have: ", item.quantity] }), item.quality !== undefined && (_jsxs("div", { className: "selected-item-quality", children: ["Quality: ", item.quality, "%"] }))] })] }), _jsx("div", { className: "selected-item-description", children: item.description || "No description available." }), _jsxs("div", { className: "sell-price-info", children: ["Sell Value: ", formatPrice(sellPrice), " each"] }), marketData && (_jsxs("div", { className: `price-trend ${trend.class}`, children: [_jsx("span", { className: "trend-arrow", children: trend.icon }), _jsxs("span", { children: ["Market price is ", trend.class] })] }))] }) }), _jsx("div", { className: "market-actions-panel", style: actionStyle, children: _jsxs("button", { className: `action-button sell ${festivalMarketActive ? 'festival-button' : ''}`, onClick: () => {
                                onSellItem(item.id);
                                playSound('sell');
                            }, disabled: item.quantity <= 0, children: ["Sell 1 for ", formatPrice(sellPrice)] }) })] }));
        }
        // Requests Tab Details
        if (activeTab === 'requests' && 'requester' in selectedDetails) {
            const request = selectedDetails;
            const canFulfill = canFulfillRequest();
            const totalQuantity = playerInventory
                .filter(i => i.name === request.item)
                .reduce((sum, i) => sum + i.quantity, 0);
            const avgQuality = totalQuantity > 0
                ? Math.round(playerInventory
                    .filter(i => i.name === request.item)
                    .reduce((s, i) => s + (i.quality ?? 70) * i.quantity, 0) / totalQuantity)
                : 0;
            return (_jsxs("div", { className: `market-item-details ${festivalMarketActive ? 'festival-details' : ''}`, style: festivalStyle, children: [_jsx("div", { className: "parchment-scroll", children: _jsxs("div", { className: "scroll-content", children: [_jsxs("h3", { children: [request.requester, "'s Request"] }), _jsx("div", { className: "selected-item-description", children: request.description || "No description available." }), _jsx("hr", { className: "divider" }), _jsxs("div", { className: "request-requirements", children: [_jsxs("div", { children: [_jsx("strong", { children: "Needs:" }), " ", request.quantity, " \u00D7 ", request.item] }), _jsxs("div", { children: [_jsx("strong", { children: "Have:" }), " ", totalQuantity, totalQuantity > 0 ? ` (Avg Q: ~${avgQuality}%)` : ''] })] }), _jsx("hr", { className: "divider" }), _jsx("div", { children: _jsx("strong", { children: "Rewards:" }) }), _jsxs("div", { className: "request-rewards-detail", children: [_jsxs("div", { className: "reward gold", children: [request.rewardGold, "G"] }), _jsxs("div", { className: "reward reputation", children: ["+", request.rewardInfluence, " Rep"] })] }), _jsxs("div", { className: "request-difficulty-detail", children: ["Difficulty: ", Array(request.difficulty).fill('★').join(''), Array(5 - request.difficulty).fill('☆').join('')] })] }) }), _jsx("div", { className: "market-actions-panel", style: actionStyle, children: _jsx("button", { className: `action-button fulfill ${!canFulfill ? 'disabled' : ''} ${festivalMarketActive ? 'festival-button' : ''}`, onClick: () => {
                                onFulfillRequest(request.id);
                                playSound('coin');
                            }, disabled: !canFulfill, children: "Fulfill Request" }) })] }));
        }
        return (_jsx("div", { className: "market-item-details empty", children: _jsx("div", { className: "scroll-content", children: _jsx("p", { children: "Select an item or request for details..." }) }) }));
    };
    // Render Town Requests List
    const renderRequestsList = () => {
        if (townRequests.length === 0) {
            return _jsx("div", { className: "empty-message", children: "Notice board is empty..." });
        }
        return (_jsx("div", { className: "requests-list", children: townRequests.map(request => {
                const canFulfill = canFulfillRequest(request.id);
                const playerQuantity = playerInventory
                    .filter(item => item.name === request.item)
                    .reduce((sum, item) => sum + item.quantity, 0);
                const festivalStyle = festivalMarketActive ? {
                    borderColor: getFestivalThemeColors().accent,
                    borderLeftColor: getFestivalThemeColors().accent, // Preserve thick left border
                    boxShadow: `0 0 5px ${getFestivalThemeColors().glow}, 3px 3px 0px rgba(0,0,0,0.2)`
                } : {};
                return (_jsxs("div", { className: `request-item ${selectedRequestId === request.id ? 'selected' : ''} ${festivalMarketActive ? 'festival-request' : ''}`, style: festivalStyle, onClick: () => handleRequestClick(request.id), children: [_jsx("div", { className: "request-icon", title: request.requester, children: request.requester.charAt(0).toUpperCase() }), _jsxs("div", { className: "request-details", children: [_jsxs("div", { className: "request-requester", children: [request.requester, " requests:"] }), _jsxs("div", { className: "request-item-info", children: [_jsxs("strong", { children: [request.quantity, " \u00D7 ", request.item] }), _jsxs("div", { className: "inventory-count", children: ["(Have: ", playerQuantity, ")"] })] }), _jsxs("div", { className: "request-rewards", children: [_jsxs("div", { className: "reward gold", title: `${request.rewardGold} Gold`, children: [request.rewardGold, "G"] }), _jsxs("div", { className: "reward reputation", title: `${request.rewardInfluence} Rep`, children: ["+", request.rewardInfluence, " Rep"] })] }), _jsxs("div", { className: "request-footer", children: [_jsxs("div", { className: "request-difficulty", title: `Difficulty: ${request.difficulty}/5`, children: [Array(request.difficulty).fill('★').join(''), Array(5 - request.difficulty).fill('☆').join('')] }), _jsx("button", { className: `fulfill-button ${canFulfill ? 'can-fulfill' : 'cant-fulfill'} ${festivalMarketActive ? 'festival-button' : ''}`, onClick: (e) => {
                                                e.stopPropagation();
                                                if (canFulfill) {
                                                    onFulfillRequest(request.id);
                                                    setSelectedRequestId(null);
                                                    playSound('coin');
                                                }
                                            }, disabled: !canFulfill, children: canFulfill ? 'Fulfill' : 'Need Items' })] })] })] }, request.id));
            }) }));
    };
    // Render Items Grid (Buy/Sell tab)
    const renderItemsGrid = () => {
        const items = getFilteredItems;
        if (items.length === 0) {
            return (_jsx("div", { className: "empty-message", children: activeTab === 'buy' ? "No items match your search..." : "Your satchel is empty..." }));
        }
        const isSellTab = activeTab === 'sell';
        const currentSelectionId = isSellTab ? selectedInventoryItemId : selectedItemId;
        return (_jsx("div", { className: "market-items-grid", children: items.map(item => {
                const invItem = isSellTab ? item : undefined;
                const marketData = isSellTab
                    ? marketItems.find(mi => mi.id === invItem?.baseId)
                    : item;
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
                return (_jsxs("div", { className: `market-item ${currentSelectionId === item.id ? 'selected' : ''} ${festivalClass}`, style: festivalStyle, onClick: () => handleItemClick(item.id, !isSellTab), title: `${item.name}${quality !== undefined ? ` (Q: ${quality}%)` : ''}${quantity ? ` (Qty: ${quantity})` : ''}\n${item.description || ''}`, children: [item.category && (_jsx("div", { className: "item-category", children: item.category })), _jsx("div", { className: "item-image", children: _jsx("div", { title: item.name, children: item.name.charAt(0).toUpperCase() }) }), _jsx("div", { className: "item-name", children: item.name }), isSellTab && quantity !== undefined && quality !== undefined && (_jsxs("div", { className: "item-details", children: [_jsxs("span", { children: ["Qty: ", quantity] }), _jsxs("span", { children: ["Q: ", quality, "%"] })] })), _jsxs("div", { className: "item-price", children: [formatPrice(isSellTab ? sellPreviewPrice : adjustedPrice), _jsx("span", { className: `trend-icon ${trend.class}`, children: trend.icon }), !isSellTab && festivalMarketActive && specialMerchant.active &&
                                    adjustedPrice < basePrice && (_jsxs("span", { className: "discount-badge", children: ["-", specialMerchant.discount, "%"] }))] })] }, item.id));
            }) }));
    };
    return (_jsxs("div", { className: `market-container ${showBlackMarket ? 'black-market-active' : ''} ${festivalMarketActive ? `festival-market ${festivalTheme}-theme` : ''}`, children: [blackMarketTransition && _jsx("div", { className: "black-market-transition" }), festivalMarketActive && (_jsx("div", { className: "festival-overlay", children: lanternPositions.map((lantern, index) => (_jsx("div", { className: `festival-lantern ${festivalTheme}-lantern`, style: {
                        left: `${lantern.x}%`,
                        top: `${lantern.y}%`,
                        animationDelay: `${lantern.delay}s`,
                        '--lantern-size': lantern.size
                    } }, `lantern-${index}`))) })), _jsxs("div", { className: "market-header", children: [_jsx("h2", { onClick: handleTitleClick, title: "Click rapidly...", children: showBlackMarket ? "Black Market" : (festivalMarketActive ? `${festivalTheme.charAt(0).toUpperCase() + festivalTheme.slice(1)} Festival` : "Town Market") }), _jsx("div", { className: "market-actions", children: blackMarketAccess && (_jsx("button", { className: `bm-toggle ${showBlackMarket ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`, onClick: () => {
                                setShowBlackMarket(!showBlackMarket);
                                playSound('select');
                            }, children: showBlackMarket ? 'Leave Shadows' : 'Enter Shadows' })) })] }), renderSpecialMerchant(), _jsxs("div", { className: "market-toggle", children: [_jsx("button", { className: `${activeTab === 'buy' ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`, onClick: () => setActiveTab('buy'), children: "Buy" }), _jsx("button", { className: `${activeTab === 'sell' ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`, onClick: () => setActiveTab('sell'), children: "Sell" }), _jsx("button", { className: `${activeTab === 'requests' ? 'active' : ''} ${festivalMarketActive ? 'festival-button' : ''}`, onClick: () => setActiveTab('requests'), "data-count": townRequests.length, children: "Requests" })] }), activeTab !== 'requests' && (_jsxs("div", { className: "market-filters", children: [_jsxs("select", { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), className: festivalMarketActive ? 'festival-select' : '', children: [_jsx("option", { value: "all", children: "All Types" }), uniqueTypes.map(type => (_jsx("option", { value: type, children: type.charAt(0).toUpperCase() + type.slice(1) }, type)))] }), _jsxs("select", { value: categoryFilter, onChange: (e) => setCategoryFilter(e.target.value), className: festivalMarketActive ? 'festival-select' : '', children: [_jsx("option", { value: "all", children: "All Categories" }), uniqueCategories.map(cat => (_jsx("option", { value: cat, children: cat.charAt(0).toUpperCase() + cat.slice(1) }, cat)))] }), _jsx("div", { className: "market-search", children: _jsx("input", { type: "text", placeholder: "Search...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: festivalMarketActive ? 'festival-input' : '' }) })] })), _jsxs("div", { className: "market-content", children: [_jsx("div", { className: "market-listings", children: activeTab === 'requests' ? renderRequestsList() : renderItemsGrid() }), _jsxs("div", { className: "market-sidebar", children: [_jsxs("div", { className: `market-wallet ${festivalMarketActive ? 'festival-wallet' : ''}`, style: festivalMarketActive ? {
                                    borderColor: getFestivalThemeColors().accent,
                                    background: `linear-gradient(135deg, ${getFestivalThemeColors().primary}, ${getFestivalThemeColors().secondary})`,
                                    color: getFestivalThemeColors().text
                                } : {}, children: [_jsx("h3", { children: "My Purse" }), _jsx("div", { className: "wallet-amount", children: formatPrice(playerGold) })] }), renderDetailsPanel(), renderRumors(), blackMarketAccess && showBlackMarket && (_jsx("div", { className: "black-market-notice", children: "The shadows hold secrets..." }))] })] })] }));
};
// Export the component
export default Market;
//# sourceMappingURL=Market.js.map