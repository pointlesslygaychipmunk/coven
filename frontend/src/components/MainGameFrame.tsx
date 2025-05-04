import React, { useState } from 'react';
import './MainGameFrame.css';
import './MainGameFrame90s.css'; // Import pixelated Sierra styles
import type { InventoryItem, ItemType, ItemCategory, MoonPhase, AtelierSpecialization, Material, DesignStyle, SpecialEffect, Brand, PackageType, Product } from 'coven-shared';
import { createDefaultInventoryItem, createDefaultGardenSlot } from '../utils/playerStateMocks';

// Import updated 90s-style components
import Garden90s from './Garden90s';
import Brewing90s from './Brewing90s';
// import Atelier90s from './Atelier90s'; // We'll implement this later
import Market90s from './Market90s';
import Journal90s from './Journal90s';
import CombinedWorkshop90s from './CombinedWorkshop90s';

interface MainGameFrameProps {
  playerName: string;
  gold: number;
  day: number;
  lunarPhase: MoonPhase;
  reputation: number;
  playerLevel: number;
  // Add more props as needed
}

const MainGameFrame: React.FC<MainGameFrameProps> = ({
  playerName = "Willow",
  gold = 100,
  day = 1,
  lunarPhase = "Waxing Crescent" as MoonPhase,
  reputation = 5,
  playerLevel = 1,
}) => {
  // Current view/location state
  const [currentView, setCurrentView] = useState<string>("garden");
  
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
  const handleChangeView = (view: string) => {
    setCurrentView(view);
  };
  
  // Mock data creating GardenSlot objects conforming to shared types
  const mockPlots = [
    createDefaultGardenSlot(0, true, null, { fertility: 75, moisture: 60 }),
    createDefaultGardenSlot(1, true, { 
      id: "p1", 
      tarotCardId: "flower_moonflower",
      growth: 50, 
      maxGrowth: 100, 
      health: 90, 
      watered: true, 
      age: 2, 
      mature: false,
      qualityModifier: 60,
      moonBlessing: 30,
      seasonalResonance: 50,
      elementalHarmony: 40,
      growthStage: 'growing'
    }, { fertility: 80, moisture: 70 }),
    createDefaultGardenSlot(2, true, null, { fertility: 65, moisture: 55 }),
    createDefaultGardenSlot(3, true, { 
      id: "p2", 
      tarotCardId: "herb_chamomile",
      growth: 100, 
      maxGrowth: 100, 
      health: 95, 
      watered: true, 
      age: 3, 
      mature: true,
      qualityModifier: 80,
      moonBlessing: 70,
      seasonalResonance: 60,
      elementalHarmony: 50,
      growthStage: 'mature'
    }, { fertility: 70, moisture: 65 }),
    createDefaultGardenSlot(4, true, { 
      id: "p3", 
      tarotCardId: "root_ginseng",
      growth: 30, 
      maxGrowth: 100, 
      health: 85, 
      watered: true, 
      age: 1, 
      mature: false,
      qualityModifier: 40,
      moonBlessing: 20,
      seasonalResonance: 30,
      elementalHarmony: 60,
      growthStage: 'growing'
    }, { fertility: 90, moisture: 80 }),
    createDefaultGardenSlot(5, false, null, { fertility: 60, moisture: 50 }),
    createDefaultGardenSlot(6, false, null),
    createDefaultGardenSlot(7, false, null),
    createDefaultGardenSlot(8, false, null)
  ];
  
  // Use createDefaultInventoryItem to create properly typed inventory items
  const mockInventory: InventoryItem[] = [
    createDefaultInventoryItem("1", "Chamomile", "ingredient", "herb", 5),
    createDefaultInventoryItem("2", "Lavender", "ingredient", "herb", 3),
    createDefaultInventoryItem("3", "Ginseng", "ingredient", "root", 1),
    createDefaultInventoryItem("4", "Crystal Vial", "tool", "tool", 2),
    createDefaultInventoryItem("5", "Moonflower Seeds", "seed", "seed", 4),
    createDefaultInventoryItem("6", "Chamomile Seeds", "seed", "seed", 2),
    createDefaultInventoryItem("7", "Dragon Scale", "ingredient", "essence", 1)
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
      type: "event" as const,
      tags: ["Beginning", "Cottage"]
    },
    {
      id: "j2",
      title: "Moonflower Discovery",
      content: "During tonight's full moon, I discovered a peculiar flower that only blooms under moonlight. The townsfolk call it a 'Moonflower' and say it's particularly potent when harvested during the full moon phase. I've collected some seeds to plant in my garden.",
      date: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      type: "discovery" as const,
      tags: ["Plants", "Moon Magic"]
    }
  ];
  
  const mockQuests = [
    {
      id: "q1",
      title: "The Mayor's Malady",
      description: "Mayor Thornwood has fallen ill with a mysterious ailment. The town physician has tried traditional remedies without success. Brew a healing tonic to help him recover.",
      status: "active" as const,
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
      status: "active" as const,
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
    atelierSpecialization: "Essence" as AtelierSpecialization,
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
            playerSpecialization={"Essence" as AtelierSpecialization}
            onBrew={handleBrew}
          />
        );
      case "atelier":
        return (
          <CombinedWorkshop90s
            playerInventory={mockInventory}
            knownRecipes={mockRecipes}
            lunarPhase={lunarPhase}
            playerLevel={playerLevel}
            playerSpecialization={"Essence" as AtelierSpecialization}
            playerCraftSkill={alchemySkill}
            playerArtistrySkill={herbalKnowledge}
            products={[
              {
                id: "product1",
                name: "Healing Tonic",
                description: "Restores vitality and health.",
                type: "potion",
                category: "potion",
                rarity: "common",
                value: 50,
                icon: "🧪",
                potencyBoost: 80 // Using potencyBoost instead of quality
              },
              {
                id: "product2",
                name: "Lunar Essence",
                description: "Captures moonlight energy in liquid form.",
                type: "potion",
                category: "essence" as ItemCategory,
                rarity: "uncommon",
                value: 75,
                icon: "✨",
                potencyBoost: 85 // Using potencyBoost instead of quality
              }
            ]}
            packagingMaterials={[
              {
                id: "m1",
                name: "Glass",
                description: "Clear glass material for bottles.",
                materialType: "glass",
                icon: "🧪",
                durability: 7,
                qualityLevel: 8,
                quantity: 3,
                materialQuality: "fine" as const,
                value: 25
              },
              {
                id: "m2",
                name: "Wood",
                description: "Polished wooden material for boxes.",
                materialType: "wood",
                icon: "🪵",
                durability: 8,
                qualityLevel: 7,
                quantity: 2,
                materialQuality: "common" as const, // Using 'common' which is a valid MaterialQuality
                value: 15
              }
            ]}
            designStyles={[
              {
                id: "d1",
                name: "Elegant",
                description: "A refined, sophisticated design style.",
                designStyle: "elegant",
                icon: "🎨",
                complexityLevel: 7,
                customerAppeal: 8
              },
              {
                id: "d2",
                name: "Rustic",
                description: "A charming, natural design style.",
                designStyle: "rustic",
                icon: "🏡",
                complexityLevel: 5,
                customerAppeal: 7
              }
            ]}
            specialEffects={[
              {
                id: "e1",
                name: "Shimmer",
                description: "Adds a subtle shimmer effect.",
                effectType: "shimmer",
                icon: "✨",
                rarity: 6,
                power: 5,
                quantity: 2,
                potencyBonus: 10,
                durabilityEffect: 5
              }
            ]}
            brands={[
              {
                id: "b1",
                name: "Moonlight Brews",
                description: "Your personal brand for magical potions.",
                icon: "🌙",
                reputation: 7,
                recognition: 6,
                tagline: "Brewing with celestial magic",
                colorPalette: ["#5d4e7b", "#8b7dac", "#e0d5f2"],
                brandValues: ["Quality", "Tradition", "Effectiveness"],
                specialization: "Essence"
              }
            ]}
            packagingDesigns={[]}
            onBrew={handleBrew}
            onCraftItem={(ingredientIds, resultItemId) => console.log(`Crafting ${resultItemId} with ingredients ${ingredientIds.join(', ')}`)}
            onDesignCreate={(design) => {
              console.log("Created design:", design);
              return Promise.resolve();
            }}
            onApplyToProduct={(design, product) => {
              console.log("Applied design to product:", design, product);
              return Promise.resolve();
            }}
          />
        );
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
    <div className="game-window pixelated">
      {/* Game Header */}
      <div className="game-header">
        <h1>COVEN: GLOW BRIGHTLY</h1>
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