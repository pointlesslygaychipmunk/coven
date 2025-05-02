import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './MainGameFrame.css';
// Import updated 90s-style components
import Garden90s from './Garden90s';
import Brewing90s from './Brewing90s';
// import Atelier90s from './Atelier90s'; // We'll implement this later
import Market90s from './Market90s';
import Journal90s from './Journal90s';
const MainGameFrame = ({ playerName = "Willow", gold = 100, day = 1, lunarPhase = "Waxing Crescent", reputation = 5, playerLevel = 1, }) => {
    // Current view/location state
    const [currentView, setCurrentView] = useState("garden");
    // Character stats (read-only in this demo)
    const health = 100;
    const mana = 80;
    const herbalKnowledge = 10;
    const alchemySkill = 5;
    // Calculate fill percentages for status bars
    const healthPercent = `${health}%`;
    const manaPercent = `${mana}%`;
    // Mock inventory data
    const inventoryItems = [
        { id: 1, name: "Chamomile", quantity: 5, type: "herb" },
        { id: 2, name: "Lavender", quantity: 3, type: "herb" },
        { id: 3, name: "Ginseng", quantity: 1, type: "rare_herb" },
        { id: 4, name: "Crystal Vial", quantity: 2, type: "tool" },
        // Add more items as needed
    ];
    // Mock quest data
    const quests = [
        { id: 1, title: "Gather Moonflowers", description: "Collect 5 moonflowers during the full moon phase.", status: "active" },
        { id: 2, title: "Brew a Clarity Potion", description: "Create a potion of clarity for the town elder.", status: "active" },
        // Add more quests as needed
    ];
    // Mock recipe data
    const recipes = [
        { id: 1, name: "Healing Tonic", ingredients: ["Chamomile", "Spring Water", "Honey"], difficulty: "Easy" },
        { id: 2, name: "Dream Essence", ingredients: ["Lavender", "Moonflower", "Dew"], difficulty: "Medium" },
        // Add more recipes as needed
    ];
    // Handle view/location change
    const handleChangeView = (view) => {
        setCurrentView(view);
    };
    // Mock data for demonstration purposes conforming to shared types
    const mockPlots = [
        { id: 0, fertility: 75, moisture: 60, isUnlocked: true, plant: null },
        { id: 1, fertility: 80, moisture: 70, isUnlocked: true, plant: { id: "p1", name: "Moonflower", growth: 50, maxGrowth: 100, age: 2, health: 90, mature: false, watered: true } },
        { id: 2, fertility: 65, moisture: 55, isUnlocked: true, plant: null },
        { id: 3, fertility: 70, moisture: 65, isUnlocked: true, plant: { id: "p2", name: "Chamomile", growth: 100, maxGrowth: 100, age: 3, health: 95, mature: true, watered: true } },
        { id: 4, fertility: 90, moisture: 80, isUnlocked: true, plant: { id: "p3", name: "Ginseng", growth: 30, maxGrowth: 100, age: 1, health: 85, mature: false, watered: true } },
        { id: 5, fertility: 60, moisture: 50, isUnlocked: false, plant: null },
        { id: 6, fertility: 0, moisture: 0, isUnlocked: false, plant: null },
        { id: 7, fertility: 0, moisture: 0, isUnlocked: false, plant: null },
        { id: 8, fertility: 0, moisture: 0, isUnlocked: false, plant: null }
    ];
    // Use full type assertion to ensure TypeScript properly recognizes our mock data
    const mockInventory = [
        { id: "1", baseId: "chamomile", name: "Chamomile", quantity: 5, type: "ingredient", category: "herb" },
        { id: "2", baseId: "lavender", name: "Lavender", quantity: 3, type: "ingredient", category: "herb" },
        { id: "3", baseId: "ginseng", name: "Ginseng", quantity: 1, type: "ingredient", category: "root" },
        { id: "4", baseId: "vial", name: "Crystal Vial", quantity: 2, type: "tool", category: "tool" },
        { id: "5", baseId: "moonflower_seed", name: "Moonflower Seeds", quantity: 4, type: "seed", category: "seed" },
        { id: "6", baseId: "chamomile_seed", name: "Chamomile Seeds", quantity: 2, type: "seed", category: "seed" },
        { id: "7", baseId: "dragon_scale", name: "Dragon Scale", quantity: 1, type: "ingredient", category: "essence" }
    ];
    const mockRecipes = [
        { id: "1", name: "Healing Tonic", ingredients: ["Chamomile", "Spring Water", "Honey"], difficulty: "Easy" },
        { id: "2", name: "Dream Essence", ingredients: ["Lavender", "Moonflower", "Dew"], difficulty: "Medium" },
        { id: "3", name: "Focus Elixir", ingredients: ["Ginseng", "Sage", "Crystal Dust"], difficulty: "Hard" }
    ];
    const mockMarketItems = [
        { id: "m1", name: "Spring Water", type: "reagent", price: 15, description: "Pure water collected during the spring season." },
        { id: "m2", name: "Honey", type: "reagent", price: 20, description: "Sweet honey from the forest bees." },
        { id: "m3", name: "Crystal Vial", type: "tool", price: 35, description: "A vial made of enchanted crystal, perfect for potion brewing." },
        { id: "m4", name: "Moonflower Seeds", type: "seed", price: 25, description: "Seeds that bloom under the full moon's light." },
        { id: "m5", name: "Sage", type: "herb", price: 10, description: "A common herb with purifying properties." },
        { id: "m6", name: "Dragon Scale", type: "reagent", price: 100, rarity: "rare", description: "A rare scale from an ancient dragon." }
    ];
    const mockRequests = [
        {
            id: "r1",
            title: "Healing Tonic for the Mayor",
            requester: "Mayor Thornwood",
            description: "The mayor has fallen ill and needs a healing tonic urgently.",
            reward: 50,
            requiredItems: ["Healing Tonic"]
        },
        {
            id: "r2",
            title: "Magical Flowers Needed",
            requester: "Florist Lily",
            description: "The town florist needs moonflowers for a special arrangement.",
            reward: 30,
            requiredItems: ["Moonflower"]
        }
    ];
    const mockRumors = [
        { id: "rum1", text: "They say the old witch who lived in the mountains knew how to speak with the stars.", source: "Old Tom at the Tavern", discovered: true },
        { id: "rum2", text: "The moonflowers that grow in the hidden grove are said to possess twice the magical potency.", source: "Herbalist Mabel", discovered: true }
    ];
    // For demo purposes, we'll adapt to the schema used in our Journal90s component
    // This doesn't perfectly match the shared types but works with our component
    const mockJournalEntries = [
        {
            id: "j1",
            title: "Beginning My Journey",
            content: "Today I arrived at the witch's cottage that I inherited from my grandmother. The garden is overgrown, but I can sense the magical potential within the soil. I found her old grimoire and brewing equipment in good condition. Tomorrow I shall begin sorting through her notes and restoring the garden.",
            date: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
            type: "event",
            tags: ["Beginning", "Cottage"]
        },
        {
            id: "j2",
            title: "Moonflower Discovery",
            content: "During tonight's full moon, I discovered a peculiar flower that only blooms under moonlight. The townsfolk call it a 'Moonflower' and say it's particularly potent when harvested during the full moon phase. I've collected some seeds to plant in my garden.",
            date: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
            type: "discovery",
            tags: ["Plants", "Moon Magic"]
        }
    ];
    const mockQuests = [
        {
            id: "q1",
            title: "The Mayor's Malady",
            description: "Mayor Thornwood has fallen ill with a mysterious ailment. The town physician has tried traditional remedies without success. Brew a healing tonic to help him recover.",
            status: "active",
            progress: 25,
            steps: [
                { description: "Gather Chamomile from the garden", completed: true },
                { description: "Collect pure spring water", completed: false },
                { description: "Brew a Healing Tonic", completed: false },
                { description: "Deliver the tonic to the Mayor", completed: false }
            ],
            rewards: ["50 Gold", "Increased Town Reputation"]
        },
        {
            id: "q2",
            title: "Flower Festival Preparation",
            description: "The annual flower festival is approaching. The town florist has requested your help in growing special decorative plants.",
            status: "active",
            progress: 50,
            steps: [
                { description: "Grow Moonflowers in your garden", completed: true },
                { description: "Harvest Moonflowers during full moon", completed: true },
                { description: "Deliver Moonflowers to the florist", completed: false }
            ],
            rewards: ["30 Gold", "Festival Pass", "Rare Plant Seeds"]
        }
    ];
    const mockRituals = [
        {
            id: "r1",
            name: "Garden Blessing Ritual",
            description: "A ritual to bless your garden, increasing fertility and plant growth for the next lunar cycle.",
            requirements: ["Full Moon Phase", "3 Ritual Points", "Chamomile"],
            rewards: ["Increased Garden Fertility", "Plant Growth Speed +10%"],
            completed: false,
            available: true
        },
        {
            id: "r2",
            name: "Potion Mastery Ritual",
            description: "A ritual that enhances your brewing abilities, allowing for more potent potions.",
            requirements: ["New Moon Phase", "5 Ritual Points", "Rare Herb"],
            rewards: ["Potion Potency +15%", "Reduced Ingredient Consumption"],
            completed: false,
            available: false
        }
    ];
    // Handler functions
    const handlePlant = (slotId, seedId) => {
        console.log(`Planting seed ${seedId} in slot ${slotId}`);
    };
    const handleHarvest = (slotId) => {
        console.log(`Harvesting from slot ${slotId}`);
    };
    const handleWater = (bonus) => {
        console.log(`Watering garden with ${bonus}% bonus`);
    };
    const handleBrew = (ingredientIds, puzzleBonus, recipeId) => {
        console.log(`Brewing with ingredients: ${ingredientIds.join(', ')}, bonus: ${puzzleBonus}, recipe: ${recipeId || 'unknown'}`);
    };
    const handleBuyItem = (itemId) => {
        console.log(`Buying item ${itemId}`);
    };
    const handleSellItem = (itemId) => {
        console.log(`Selling item ${itemId}`);
    };
    const handleFulfillRequest = (requestId) => {
        console.log(`Fulfilling request ${requestId}`);
    };
    const handleClaimRitual = (ritualId) => {
        console.log(`Claiming ritual ${ritualId}`);
    };
    // Mock player data for journal
    const mockPlayer = {
        id: "player1",
        name: playerName,
        atelierLevel: playerLevel,
        atelierSpecialization: "Essence",
        reputation: reputation,
        ritualPoints: 4
    };
    // Mock game time data
    const mockTime = {
        dayCount: day,
        phaseName: lunarPhase,
        season: "Spring"
    };
    // Helper function to render the current view/location content
    const renderViewContent = () => {
        switch (currentView) {
            case "garden":
                return (_jsx(Garden90s, { plots: mockPlots, inventory: mockInventory, onPlant: handlePlant, onHarvest: handleHarvest, onWater: handleWater, weatherFate: "normal", season: "Spring" }));
            case "brewing":
                return (_jsx(Brewing90s, { playerInventory: mockInventory, knownRecipes: mockRecipes, lunarPhase: lunarPhase, playerSpecialization: "Essence", onBrew: handleBrew }));
            case "atelier":
                return _jsx("div", { className: "viewport-placeholder atelier", children: "Atelier View (Coming Soon)" });
            case "market":
                return (_jsx(Market90s, { playerGold: gold, playerInventory: mockInventory, marketItems: mockMarketItems, townRequests: mockRequests, rumors: mockRumors, blackMarketAccess: playerLevel >= 3, onBuyItem: handleBuyItem, onSellItem: handleSellItem, onFulfillRequest: handleFulfillRequest }));
            case "journal":
                return (_jsx(Journal90s, { journal: mockJournalEntries, quests: mockQuests, rituals: mockRituals, time: mockTime, player: mockPlayer, onClaimRitual: handleClaimRitual }));
            default:
                return _jsx("div", { className: "viewport-placeholder", children: "Select a location" });
        }
    };
    // Helper to generate moon phase visualization
    const renderMoonPhase = () => {
        // Simple ASCII art for moon phases
        switch (lunarPhase) {
            case "New Moon":
                return "○";
            case "Waxing Crescent":
                return "◐";
            case "First Quarter":
                return "◑";
            case "Waxing Gibbous":
                return "◕";
            case "Full Moon":
                return "●";
            case "Waning Gibbous":
                return "◔";
            case "Last Quarter":
                return "◒";
            case "Waning Crescent":
                return "◓";
            default:
                return "○";
        }
    };
    // Main component render
    return (_jsxs("div", { className: "game-window", children: [_jsx("div", { className: "game-header", children: _jsx("h1", { children: "COVEN: GLOW BRIGHTLY" }) }), _jsxs("div", { className: "game-content", children: [_jsxs("div", { className: "left-sidebar", children: [_jsxs("div", { className: "game-panel character-panel", children: [_jsx("div", { className: "panel-header", children: _jsx("h2", { children: "Character" }) }), _jsxs("div", { className: "panel-content", children: [_jsx("div", { className: "character-portrait", children: _jsx("div", { className: "character-initial", children: playerName.charAt(0) }) }), _jsx("div", { className: "character-name", children: playerName }), _jsxs("div", { className: "character-level", children: ["Level ", playerLevel] }), _jsxs("div", { className: "character-vitals", children: [_jsx("div", { className: "stat-row", children: _jsx("span", { className: "stat-label", children: "Health" }) }), _jsxs("div", { className: "status-bar", children: [_jsx("div", { className: "status-fill health", style: { width: healthPercent } }), _jsxs("div", { className: "status-label", children: [health, "/100"] })] }), _jsx("div", { className: "stat-row", children: _jsx("span", { className: "stat-label", children: "Mana" }) }), _jsxs("div", { className: "status-bar", children: [_jsx("div", { className: "status-fill mana", style: { width: manaPercent } }), _jsxs("div", { className: "status-label", children: [mana, "/100"] })] })] }), _jsxs("div", { className: "character-stats", children: [_jsxs("div", { className: "stat-row", children: [_jsx("span", { className: "stat-label", children: "Herbalism" }), _jsx("span", { className: "stat-value", children: herbalKnowledge })] }), _jsxs("div", { className: "stat-row", children: [_jsx("span", { className: "stat-label", children: "Alchemy" }), _jsx("span", { className: "stat-value", children: alchemySkill })] }), _jsxs("div", { className: "stat-row", children: [_jsx("span", { className: "stat-label", children: "Reputation" }), _jsx("span", { className: "stat-value", children: reputation })] })] })] })] }), _jsxs("div", { className: "game-panel resources-panel", children: [_jsx("div", { className: "panel-header", children: _jsx("h2", { children: "Resources" }) }), _jsxs("div", { className: "panel-content", children: [_jsxs("div", { className: "resource-item", children: [_jsx("div", { className: "resource-icon gold-icon", children: "G" }), _jsx("span", { className: "resource-label", children: "Gold" }), _jsx("span", { className: "resource-value", children: gold })] }), _jsxs("div", { className: "inventory-preview", children: [_jsx("h3", { children: "Inventory" }), _jsxs("div", { className: "inventory-grid", children: [inventoryItems.slice(0, 8).map(item => (_jsxs("div", { className: "inventory-slot has-item", title: item.name, children: [_jsx("div", { className: "item-icon", children: item.name.charAt(0) }), item.quantity > 1 && _jsx("div", { className: "item-count", children: item.quantity })] }, item.id))), Array.from({ length: Math.max(0, 8 - inventoryItems.length) }).map((_, i) => (_jsx("div", { className: "inventory-slot" }, `empty-${i}`)))] })] })] })] })] }), _jsx("div", { className: "main-viewport", children: _jsxs("div", { className: "viewport-content", children: [renderViewContent(), _jsx("div", { className: "corner-decoration top-left" }), _jsx("div", { className: "corner-decoration top-right" }), _jsx("div", { className: "corner-decoration bottom-left" }), _jsx("div", { className: "corner-decoration bottom-right" })] }) }), _jsxs("div", { className: "right-sidebar", children: [_jsxs("div", { className: "game-panel moon-panel", children: [_jsx("div", { className: "panel-header", children: _jsx("h2", { children: "Moon Phase" }) }), _jsx("div", { className: "panel-content", children: _jsxs("div", { className: "moon-display", children: [_jsx("div", { className: "moon-icon", children: _jsx("div", { className: "moon-symbol", children: renderMoonPhase() }) }), _jsx("div", { className: "moon-phase", children: lunarPhase }), _jsxs("div", { className: "day-counter", children: ["Day ", day] })] }) })] }), _jsxs("div", { className: "game-panel brewing-panel", children: [_jsx("div", { className: "panel-header", children: _jsx("h2", { children: "Recipes" }) }), _jsx("div", { className: "panel-content", children: _jsx("ul", { className: "recipe-list", children: recipes.map(recipe => (_jsxs("li", { className: "recipe-item", children: [_jsx("div", { className: "recipe-name", children: recipe.name }), _jsx("div", { className: "recipe-difficulty", children: recipe.difficulty })] }, recipe.id))) }) })] }), _jsxs("div", { className: "game-panel quest-panel", children: [_jsx("div", { className: "panel-header", children: _jsx("h2", { children: "Quest Log" }) }), _jsx("div", { className: "panel-content", children: _jsx("div", { className: "quest-scroll", children: quests.map(quest => (_jsxs("div", { className: "quest-entry", children: [_jsx("div", { className: "quest-title", children: quest.title }), _jsx("div", { className: "quest-description", children: quest.description }), _jsxs("div", { className: "quest-status", children: ["Status: ", quest.status] })] }, quest.id))) }) })] })] })] }), _jsxs("div", { className: "game-footer", children: [_jsx("button", { className: `nav-button ${currentView === 'garden' ? 'active' : ''}`, onClick: () => handleChangeView('garden'), children: "Garden" }), _jsx("button", { className: `nav-button ${currentView === 'brewing' ? 'active' : ''}`, onClick: () => handleChangeView('brewing'), children: "Brewing" }), _jsx("button", { className: `nav-button ${currentView === 'atelier' ? 'active' : ''}`, onClick: () => handleChangeView('atelier'), children: "Atelier" }), _jsx("button", { className: `nav-button ${currentView === 'market' ? 'active' : ''}`, onClick: () => handleChangeView('market'), children: "Market" }), _jsx("button", { className: `nav-button ${currentView === 'journal' ? 'active' : ''}`, onClick: () => handleChangeView('journal'), children: "Journal" }), _jsx("button", { className: "nav-button end-day", children: "End Day" })] })] }));
};
export default MainGameFrame;
//# sourceMappingURL=MainGameFrame.js.map