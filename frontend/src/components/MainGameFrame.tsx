import React, { useState } from 'react';
import './MainGameFrame.css';

// Import updated 90s-style components
import Garden90s from './Garden90s';
import Brewing90s from './Brewing90s';
// import Atelier90s from './Atelier90s'; // We'll implement this later
import Market90s from './Market90s';
import Journal90s from './Journal90s';

interface MainGameFrameProps {
  playerName: string;
  gold: number;
  day: number;
  lunarPhase: string;
  reputation: number;
  playerLevel: number;
  // Add more props as needed
}

const MainGameFrame: React.FC<MainGameFrameProps> = ({
  playerName = "Willow",
  gold = 100,
  day = 1,
  lunarPhase = "Waxing Crescent",
  reputation = 5,
  playerLevel = 1,
}) => {
  // Current view/location state
  const [currentView, setCurrentView] = useState<string>("garden");
  
  // Character stats
  const [health, setHealth] = useState<number>(100);
  const [mana, setMana] = useState<number>(80);
  const [herbalKnowledge, setHerbalKnowledge] = useState<number>(10);
  const [alchemySkill, setAlchemySkill] = useState<number>(5);
  
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
  const handleChangeView = (view: string) => {
    setCurrentView(view);
  };
  
  // Mock data for demonstration purposes
  const mockPlots = [
    { id: 0, fertility: 75, moisture: 60, isUnlocked: true, plant: null },
    { id: 1, fertility: 80, moisture: 70, isUnlocked: true, plant: { name: "Moonflower", growth: 50, maxGrowth: 100, age: 2, health: 90, mature: false } },
    { id: 2, fertility: 65, moisture: 55, isUnlocked: true, plant: null },
    { id: 3, fertility: 70, moisture: 65, isUnlocked: true, plant: { name: "Chamomile", growth: 100, maxGrowth: 100, age: 3, health: 95, mature: true } },
    { id: 4, fertility: 90, moisture: 80, isUnlocked: true, plant: { name: "Ginseng", growth: 30, maxGrowth: 100, age: 1, health: 85, mature: false } },
    { id: 5, fertility: 60, moisture: 50, isUnlocked: false, plant: null },
    { id: 6, fertility: 0, moisture: 0, isUnlocked: false, plant: null },
    { id: 7, fertility: 0, moisture: 0, isUnlocked: false, plant: null },
    { id: 8, fertility: 0, moisture: 0, isUnlocked: false, plant: null }
  ];
  
  const mockInventory = [
    { id: "1", name: "Chamomile", quantity: 5, type: "herb" },
    { id: "2", name: "Lavender", quantity: 3, type: "herb" },
    { id: "3", name: "Ginseng", quantity: 1, type: "rare_herb" },
    { id: "4", name: "Crystal Vial", quantity: 2, type: "tool" },
    { id: "5", name: "Moonflower Seeds", quantity: 4, type: "seed" },
    { id: "6", name: "Chamomile Seeds", quantity: 2, type: "seed" },
    { id: "7", name: "Dragon Scale", quantity: 1, type: "reagent" }
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
  const handlePlant = (slotId: number, seedId: string) => {
    console.log(`Planting seed ${seedId} in slot ${slotId}`);
  };
  
  const handleHarvest = (slotId: number) => {
    console.log(`Harvesting from slot ${slotId}`);
  };
  
  const handleWater = (bonus: number) => {
    console.log(`Watering garden with ${bonus}% bonus`);
  };
  
  const handleBrew = (ingredientIds: string[], puzzleBonus: number, recipeId?: string) => {
    console.log(`Brewing with ingredients: ${ingredientIds.join(', ')}, bonus: ${puzzleBonus}, recipe: ${recipeId || 'unknown'}`);
  };
  
  const handleBuyItem = (itemId: string) => {
    console.log(`Buying item ${itemId}`);
  };
  
  const handleSellItem = (itemId: string) => {
    console.log(`Selling item ${itemId}`);
  };
  
  const handleFulfillRequest = (requestId: string) => {
    console.log(`Fulfilling request ${requestId}`);
  };
  
  const handleClaimRitual = (ritualId: string) => {
    console.log(`Claiming ritual ${ritualId}`);
  };
  
  // Mock player data for journal
  const mockPlayer = {
    id: "player1",
    name: playerName,
    atelierLevel: playerLevel,
    atelierSpecialization: "Alchemist",
    reputation: reputation,
    ritualPoints: 4
  };
  
  // Mock game time data
  const mockTime = {
    dayCount: day,
    phaseName: lunarPhase,
    season: "Spring" as const
  };
  
  // Helper function to render the current view/location content
  const renderViewContent = () => {
    switch (currentView) {
      case "garden":
        return (
          <Garden90s
            plots={mockPlots}
            inventory={mockInventory}
            onPlant={handlePlant}
            onHarvest={handleHarvest}
            onWater={handleWater}
            weatherFate="normal"
            season="Spring"
          />
        );
      case "brewing":
        return (
          <Brewing90s
            playerInventory={mockInventory}
            knownRecipes={mockRecipes}
            lunarPhase={lunarPhase}
            playerSpecialization="Alchemist"
            onBrew={handleBrew}
          />
        );
      case "atelier":
        return <div className="viewport-placeholder atelier">Atelier View (Coming Soon)</div>;
      case "market":
        return (
          <Market90s
            playerGold={gold}
            playerInventory={mockInventory}
            marketItems={mockMarketItems}
            townRequests={mockRequests}
            rumors={mockRumors}
            blackMarketAccess={playerLevel >= 3}
            onBuyItem={handleBuyItem}
            onSellItem={handleSellItem}
            onFulfillRequest={handleFulfillRequest}
          />
        );
      case "journal":
        return (
          <Journal90s
            journal={mockJournalEntries}
            quests={mockQuests}
            rituals={mockRituals}
            time={mockTime}
            player={mockPlayer}
            onClaimRitual={handleClaimRitual}
          />
        );
      default:
        return <div className="viewport-placeholder">Select a location</div>;
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
  return (
    <div className="game-window">
      {/* Game Header */}
      <div className="game-header">
        <h1>Witch's Coven: Hanbang Mystery</h1>
      </div>
      
      {/* Main Game Content */}
      <div className="game-content">
        {/* Left Sidebar - Character & Resources */}
        <div className="left-sidebar">
          {/* Character Panel */}
          <div className="game-panel character-panel">
            <div className="panel-header">
              <h2>Character</h2>
            </div>
            <div className="panel-content">
              <div className="character-portrait">
                {/* Character portrait goes here */}
                <div className="character-initial">{playerName.charAt(0)}</div>
              </div>
              
              <div className="character-name">{playerName}</div>
              <div className="character-level">Level {playerLevel}</div>
              
              {/* Health and Mana Bars */}
              <div className="character-vitals">
                <div className="stat-row">
                  <span className="stat-label">Health</span>
                </div>
                <div className="status-bar">
                  <div className="status-fill health" style={{ width: healthPercent }}></div>
                  <div className="status-label">{health}/100</div>
                </div>
                
                <div className="stat-row">
                  <span className="stat-label">Mana</span>
                </div>
                <div className="status-bar">
                  <div className="status-fill mana" style={{ width: manaPercent }}></div>
                  <div className="status-label">{mana}/100</div>
                </div>
              </div>
              
              {/* Character Stats */}
              <div className="character-stats">
                <div className="stat-row">
                  <span className="stat-label">Herbalism</span>
                  <span className="stat-value">{herbalKnowledge}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Alchemy</span>
                  <span className="stat-value">{alchemySkill}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Reputation</span>
                  <span className="stat-value">{reputation}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Resources Panel */}
          <div className="game-panel resources-panel">
            <div className="panel-header">
              <h2>Resources</h2>
            </div>
            <div className="panel-content">
              <div className="resource-item">
                <div className="resource-icon gold-icon">G</div>
                <span className="resource-label">Gold</span>
                <span className="resource-value">{gold}</span>
              </div>
              
              {/* Inventory Preview */}
              <div className="inventory-preview">
                <h3>Inventory</h3>
                <div className="inventory-grid">
                  {inventoryItems.slice(0, 8).map(item => (
                    <div key={item.id} className="inventory-slot has-item" title={item.name}>
                      <div className="item-icon">{item.name.charAt(0)}</div>
                      {item.quantity > 1 && <div className="item-count">{item.quantity}</div>}
                    </div>
                  ))}
                  {/* Add empty slots to fill grid */}
                  {Array.from({ length: Math.max(0, 8 - inventoryItems.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="inventory-slot"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Viewport */}
        <div className="main-viewport">
          <div className="viewport-content">
            {/* Render current view content */}
            {renderViewContent()}
            
            {/* Decorative corner elements */}
            <div className="corner-decoration top-left"></div>
            <div className="corner-decoration top-right"></div>
            <div className="corner-decoration bottom-left"></div>
            <div className="corner-decoration bottom-right"></div>
          </div>
        </div>
        
        {/* Right Sidebar - Game Info Panels */}
        <div className="right-sidebar">
          {/* Moon Phase Panel */}
          <div className="game-panel moon-panel">
            <div className="panel-header">
              <h2>Moon Phase</h2>
            </div>
            <div className="panel-content">
              <div className="moon-display">
                <div className="moon-icon">
                  <div className="moon-symbol">{renderMoonPhase()}</div>
                </div>
                <div className="moon-phase">{lunarPhase}</div>
                <div className="day-counter">Day {day}</div>
              </div>
            </div>
          </div>
          
          {/* Brewing Panel */}
          <div className="game-panel brewing-panel">
            <div className="panel-header">
              <h2>Recipes</h2>
            </div>
            <div className="panel-content">
              <ul className="recipe-list">
                {recipes.map(recipe => (
                  <li key={recipe.id} className="recipe-item">
                    <div className="recipe-name">{recipe.name}</div>
                    <div className="recipe-difficulty">{recipe.difficulty}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Quest Log Panel */}
          <div className="game-panel quest-panel">
            <div className="panel-header">
              <h2>Quest Log</h2>
            </div>
            <div className="panel-content">
              <div className="quest-scroll">
                {quests.map(quest => (
                  <div key={quest.id} className="quest-entry">
                    <div className="quest-title">{quest.title}</div>
                    <div className="quest-description">{quest.description}</div>
                    <div className="quest-status">Status: {quest.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Game Footer - Navigation */}
      <div className="game-footer">
        <button
          className={`nav-button ${currentView === 'garden' ? 'active' : ''}`}
          onClick={() => handleChangeView('garden')}
        >
          Garden
        </button>
        <button
          className={`nav-button ${currentView === 'brewing' ? 'active' : ''}`}
          onClick={() => handleChangeView('brewing')}
        >
          Brewing
        </button>
        <button
          className={`nav-button ${currentView === 'atelier' ? 'active' : ''}`}
          onClick={() => handleChangeView('atelier')}
        >
          Atelier
        </button>
        <button
          className={`nav-button ${currentView === 'market' ? 'active' : ''}`}
          onClick={() => handleChangeView('market')}
        >
          Market
        </button>
        <button
          className={`nav-button ${currentView === 'journal' ? 'active' : ''}`}
          onClick={() => handleChangeView('journal')}
        >
          Journal
        </button>
        <button className="nav-button end-day">
          End Day
        </button>
      </div>
    </div>
  );
};

export default MainGameFrame;