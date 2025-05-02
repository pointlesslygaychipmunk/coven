import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './Market90s.css';
const Market90s = ({ playerGold = 100, playerInventory = [], marketItems = [], townRequests = [], rumors = [], blackMarketAccess = false, onBuyItem, onSellItem, onFulfillRequest }) => {
    // State for market tabs
    const [activeSection, setActiveSection] = useState("shop");
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showBlackMarket, setShowBlackMarket] = useState(false);
    // Market background ambience
    const [marketAmbience, setMarketAmbience] = useState(true);
    // Reset selection when changing tabs
    useEffect(() => {
        setSelectedItem(null);
        setSelectedInventoryItem(null);
        setSelectedRequest(null);
    }, [activeSection]);
    // Handle item selection in shop
    const handleItemSelect = (item) => {
        setSelectedItem(prev => prev?.id === item.id ? null : item);
    };
    // Handle inventory item selection
    const handleInventorySelect = (item) => {
        setSelectedInventoryItem(prev => prev?.id === item.id ? null : item);
    };
    // Handle request selection
    const handleRequestSelect = (request) => {
        setSelectedRequest(prev => prev?.id === request.id ? null : request);
    };
    // Handle buying an item
    const handleBuy = () => {
        if (!selectedItem)
            return;
        if (playerGold < selectedItem.price) {
            alert("Not enough gold!");
            return;
        }
        onBuyItem(selectedItem.id);
        setSelectedItem(null);
    };
    // Handle selling an item
    const handleSell = () => {
        if (!selectedInventoryItem)
            return;
        onSellItem(selectedInventoryItem.id);
        setSelectedInventoryItem(null);
    };
    // Handle fulfilling a request
    const handleFulfillRequest = () => {
        if (!selectedRequest)
            return;
        // Check if player has all required items
        const requiredItems = selectedRequest.requiredItems;
        const inventory = playerInventory.reduce((acc, item) => {
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
        if (!blackMarketAccess)
            return;
        setShowBlackMarket(prev => !prev);
    };
    // Render market shop items
    const renderShopItems = () => {
        const displayItems = showBlackMarket
            ? marketItems.filter(item => item.rarity === 'rare' || item.rarity === 'legendary')
            : marketItems.filter(item => item.rarity !== 'rare' && item.rarity !== 'legendary');
        if (displayItems.length === 0) {
            return (_jsx("div", { className: "empty-market", children: _jsx("p", { children: "No items available for sale." }) }));
        }
        return (_jsx("div", { className: "market-items", children: displayItems.map(item => (_jsxs("div", { className: `market-item ${selectedItem?.id === item.id ? 'selected' : ''} ${item.price > playerGold ? 'unaffordable' : ''}`, onClick: () => handleItemSelect(item), children: [_jsx("div", { className: "item-icon", children: getItemIcon(item.type) }), _jsxs("div", { className: "item-details", children: [_jsx("div", { className: "item-name", children: item.name }), _jsx("div", { className: "item-type", children: formatItemType(item.type) })] }), _jsxs("div", { className: "item-price", children: [item.price, "g"] })] }, item.id))) }));
    };
    // Render player inventory for selling
    const renderSellableItems = () => {
        // Filter out any items with zero quantity
        const sellableItems = playerInventory.filter(item => item.quantity > 0);
        if (sellableItems.length === 0) {
            return (_jsx("div", { className: "empty-inventory", children: _jsx("p", { children: "No items available to sell." }) }));
        }
        return (_jsx("div", { className: "market-items", children: sellableItems.map(item => (_jsxs("div", { className: `market-item ${selectedInventoryItem?.id === item.id ? 'selected' : ''}`, onClick: () => handleInventorySelect(item), children: [_jsx("div", { className: "item-icon", children: getItemIcon(item.type) }), _jsxs("div", { className: "item-details", children: [_jsx("div", { className: "item-name", children: item.name }), _jsx("div", { className: "item-type", children: formatItemType(item.type) })] }), _jsxs("div", { className: "item-quantity", children: ["x", item.quantity] }), _jsxs("div", { className: "item-price", children: [getSellPrice(item), "g"] })] }, item.id))) }));
    };
    // Render town requests
    const renderTownRequests = () => {
        if (townRequests.length === 0) {
            return (_jsx("div", { className: "empty-requests", children: _jsx("p", { children: "No requests available from townsfolk." }) }));
        }
        return (_jsx("div", { className: "town-requests", children: townRequests.map(request => (_jsxs("div", { className: `request-item ${selectedRequest?.id === request.id ? 'selected' : ''}`, onClick: () => handleRequestSelect(request), children: [_jsxs("div", { className: "request-header", children: [_jsx("div", { className: "request-title", children: request.title }), _jsxs("div", { className: "request-reward", children: [request.reward, "g"] })] }), _jsxs("div", { className: "request-requester", children: ["From: ", request.requester] }), _jsx("div", { className: "request-description", children: request.description }), _jsxs("div", { className: "request-requirements", children: [_jsx("div", { className: "req-label", children: "Requires:" }), _jsx("div", { className: "req-items", children: request.requiredItems.join(", ") })] })] }, request.id))) }));
    };
    // Render rumors section
    const renderRumors = () => {
        const discoveredRumors = rumors.filter(rumor => rumor.discovered);
        if (discoveredRumors.length === 0) {
            return (_jsx("div", { className: "empty-rumors", children: _jsx("p", { children: "You haven't heard any rumors yet." }) }));
        }
        return (_jsx("div", { className: "market-rumors", children: discoveredRumors.map(rumor => (_jsxs("div", { className: "rumor-item", children: [_jsxs("div", { className: "rumor-text", children: ["\"", rumor.text, "\""] }), _jsxs("div", { className: "rumor-source", children: ["- ", rumor.source] })] }, rumor.id))) }));
    };
    // Render item details for selected item
    const renderItemDetails = () => {
        if (!selectedItem) {
            return (_jsx("div", { className: "item-details-panel empty", children: _jsx("p", { children: "Select an item to view details." }) }));
        }
        return (_jsxs("div", { className: "item-details-panel", children: [_jsx("h3", { children: selectedItem.name }), _jsx("div", { className: "detail-icon large-icon", children: getItemIcon(selectedItem.type) }), _jsx("div", { className: "detail-type", children: formatItemType(selectedItem.type) }), _jsx("div", { className: "detail-description", children: selectedItem.description || "No description available." }), _jsxs("div", { className: "detail-price", children: ["Price: ", selectedItem.price, " gold"] }), _jsx("button", { className: `market-button buy ${selectedItem.price > playerGold ? 'disabled' : ''}`, onClick: handleBuy, disabled: selectedItem.price > playerGold, children: "Buy Item" })] }));
    };
    // Render inventory item details
    const renderInventoryDetails = () => {
        if (!selectedInventoryItem) {
            return (_jsx("div", { className: "item-details-panel empty", children: _jsx("p", { children: "Select an item to sell." }) }));
        }
        return (_jsxs("div", { className: "item-details-panel", children: [_jsx("h3", { children: selectedInventoryItem.name }), _jsx("div", { className: "detail-icon large-icon", children: getItemIcon(selectedInventoryItem.type) }), _jsx("div", { className: "detail-type", children: formatItemType(selectedInventoryItem.type) }), _jsxs("div", { className: "detail-quantity", children: ["Quantity: ", selectedInventoryItem.quantity] }), _jsxs("div", { className: "detail-price", children: ["Sell price: ", getSellPrice(selectedInventoryItem), " gold"] }), _jsx("button", { className: "market-button sell", onClick: handleSell, children: "Sell Item" })] }));
    };
    // Render request details
    const renderRequestDetails = () => {
        if (!selectedRequest) {
            return (_jsx("div", { className: "request-details-panel empty", children: _jsx("p", { children: "Select a request to view details." }) }));
        }
        // Check if player has all required items
        const requiredItems = selectedRequest.requiredItems;
        const inventory = playerInventory.reduce((acc, item) => {
            acc[item.name] = (acc[item.name] || 0) + item.quantity;
            return acc;
        }, {});
        const canFulfill = requiredItems.every(itemName => inventory[itemName] && inventory[itemName] > 0);
        return (_jsxs("div", { className: "request-details-panel", children: [_jsx("h3", { children: selectedRequest.title }), _jsxs("div", { className: "detail-requester", children: ["From: ", selectedRequest.requester] }), _jsx("div", { className: "detail-description", children: selectedRequest.description }), _jsxs("div", { className: "detail-requirements", children: [_jsx("div", { className: "req-header", children: "Required Items:" }), _jsx("ul", { className: "req-list", children: requiredItems.map((item, index) => {
                                const hasItem = inventory[item] && inventory[item] > 0;
                                return (_jsxs("li", { className: hasItem ? 'has-item' : 'missing-item', children: [item, " ", hasItem ? '✓' : '✗'] }, index));
                            }) })] }), _jsxs("div", { className: "detail-reward", children: ["Reward: ", selectedRequest.reward, " gold"] }), _jsx("button", { className: `market-button fulfill ${!canFulfill ? 'disabled' : ''}`, onClick: handleFulfillRequest, disabled: !canFulfill, children: "Fulfill Request" })] }));
    };
    // Helper to get item icon
    const getItemIcon = (type) => {
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
    const formatItemType = (type) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };
    // Calculate sell price (typically 50% of buy price)
    const getSellPrice = (item) => {
        // In a real implementation, you might have pricing logic based on item type, rarity, etc.
        // For this demo, we'll use a simple calculation based on category
        const basePrice = item.category === 'herb' ? 5 :
            item.category === 'flower' ? 20 :
                item.category === 'root' ? 15 :
                    item.category === 'tool' ? 25 :
                        item.category === 'potion' ? 30 :
                            item.category === 'seed' ? 8 : 10;
        return Math.floor(basePrice * 0.5);
    };
    return (_jsxs("div", { className: "market90s-container", children: [_jsxs("div", { className: "market-header", children: [_jsx("h2", { children: "Town Market" }), _jsxs("div", { className: "player-gold", children: [_jsx("div", { className: "gold-icon", children: "\uD83D\uDCB0" }), _jsxs("div", { className: "gold-amount", children: [playerGold, " gold"] })] })] }), _jsxs("div", { className: "market-tabs", children: [_jsx("button", { className: `market-tab ${activeSection === 'shop' ? 'active' : ''}`, onClick: () => setActiveSection('shop'), children: "Buy Items" }), _jsx("button", { className: `market-tab ${activeSection === 'sell' ? 'active' : ''}`, onClick: () => setActiveSection('sell'), children: "Sell Items" }), _jsx("button", { className: `market-tab ${activeSection === 'requests' ? 'active' : ''}`, onClick: () => setActiveSection('requests'), children: "Town Requests" }), _jsx("button", { className: `market-tab ${activeSection === 'rumors' ? 'active' : ''}`, onClick: () => setActiveSection('rumors'), children: "Rumors" })] }), _jsxs("div", { className: "market-main", children: [_jsxs("div", { className: "market-content", children: [activeSection === 'shop' && (_jsxs("div", { className: "shop-section", children: [blackMarketAccess && (_jsx("div", { className: "black-market-toggle", children: _jsx("button", { className: `toggle-button ${showBlackMarket ? 'active' : ''}`, onClick: toggleBlackMarket, children: showBlackMarket ? "Show Regular Goods" : "Show Black Market" }) })), renderShopItems()] })), activeSection === 'sell' && (_jsx("div", { className: "sell-section", children: renderSellableItems() })), activeSection === 'requests' && (_jsx("div", { className: "requests-section", children: renderTownRequests() })), activeSection === 'rumors' && (_jsx("div", { className: "rumors-section", children: renderRumors() }))] }), _jsxs("div", { className: "market-sidebar", children: [activeSection === 'shop' && renderItemDetails(), activeSection === 'sell' && renderInventoryDetails(), activeSection === 'requests' && renderRequestDetails(), activeSection === 'rumors' && (_jsxs("div", { className: "market-ambience", children: [_jsx("h3", { children: "Town Crier" }), _jsx("div", { className: "crier-avatar", children: "\uD83D\uDCEF" }), _jsx("p", { children: "\"Hear ye, hear ye! The latest news and gossip from around town!\"" }), _jsxs("label", { className: "sound-toggle", children: [_jsx("input", { type: "checkbox", checked: marketAmbience, onChange: () => setMarketAmbience(!marketAmbience) }), _jsx("span", { className: "toggle-label", children: "Market Sounds" })] })] }))] })] }), _jsx("div", { className: "corner-decoration top-left" }), _jsx("div", { className: "corner-decoration top-right" }), _jsx("div", { className: "corner-decoration bottom-left" }), _jsx("div", { className: "corner-decoration bottom-right" })] }));
};
export default Market90s;
//# sourceMappingURL=Market90s.js.map