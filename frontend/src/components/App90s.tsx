import React, { useState, useEffect } from 'react';
import './App.css';
import './loadingScreen.css';
import MainGameFrame from './MainGameFrame';
import { MoonPhase } from 'coven-shared';

// Mock game data for development - in a real app this would come from your backend
const mockGameData = {
  playerName: "Willow",
  gold: 150,
  day: 3,
  lunarPhase: "Full Moon" as MoonPhase,
  reputation: 8,
  playerLevel: 2,
  inventory: [
    { id: "1", name: "Chamomile", quantity: 5, type: "herb" },
    { id: "2", name: "Lavender", quantity: 3, type: "herb" },
    { id: "3", name: "Ginseng", quantity: 1, type: "rare_herb" },
    { id: "4", name: "Crystal Vial", quantity: 2, type: "tool" },
    { id: "5", name: "Moonflower", quantity: 2, type: "rare_herb" },
    { id: "6", name: "Dragon Scale", quantity: 1, type: "reagent" }
  ],
  garden: [
    { id: 0, fertility: 75, moisture: 60, isUnlocked: true, plant: null },
    { id: 1, fertility: 80, moisture: 70, isUnlocked: true, plant: { name: "Moonflower", growth: 50, maxGrowth: 100, age: 2, health: 90, mature: false } },
    { id: 2, fertility: 65, moisture: 55, isUnlocked: true, plant: null },
    { id: 3, fertility: 70, moisture: 65, isUnlocked: true, plant: { name: "Chamomile", growth: 100, maxGrowth: 100, age: 3, health: 95, mature: true } },
    { id: 4, fertility: 90, moisture: 80, isUnlocked: true, plant: { name: "Ginseng", growth: 30, maxGrowth: 100, age: 1, health: 85, mature: false } },
    { id: 5, fertility: 60, moisture: 50, isUnlocked: false, plant: null },
    { id: 6, fertility: 0, moisture: 0, isUnlocked: false, plant: null },
    { id: 7, fertility: 0, moisture: 0, isUnlocked: false, plant: null },
    { id: 8, fertility: 0, moisture: 0, isUnlocked: false, plant: null }
  ],
  recipes: [
    { id: "1", name: "Healing Tonic", ingredients: ["Chamomile", "Spring Water", "Honey"], difficulty: "Easy" },
    { id: "2", name: "Dream Essence", ingredients: ["Lavender", "Moonflower", "Dew"], difficulty: "Medium" },
    { id: "3", name: "Focus Elixir", ingredients: ["Ginseng", "Sage", "Crystal Dust"], difficulty: "Hard" }
  ],
  quests: [
    { id: "1", title: "Gather Moonflowers", description: "Collect 5 moonflowers during the full moon phase.", status: "active" },
    { id: "2", title: "Brew a Clarity Potion", description: "Create a potion of clarity for the town elder.", status: "active" },
    { id: "3", title: "Restore the Sacred Grove", description: "Use your garden skills to restore the magical grove.", status: "pending" }
  ]
};

// Main App Component
const App90s: React.FC = () => {
  const [gameLoaded, setGameLoaded] = useState<boolean>(false);
  
  // Simulate loading data from backend
  useEffect(() => {
    const loadGameData = () => {
      // Simulate network delay
      setTimeout(() => {
        setGameLoaded(true);
      }, 2000);
    };
    
    loadGameData();
  }, []);
  
  // Loading screen
  if (!gameLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h1>Witch's Coven</h1>
          <div className="loading-cauldron">
            <div className="loading-bubble"></div>
            <div className="loading-bubble"></div>
            <div className="loading-bubble"></div>
          </div>
          <p>Brewing your magical adventure...</p>
        </div>
      </div>
    );
  }
  
  // Main game
  return (
    <MainGameFrame
      playerName={mockGameData.playerName}
      gold={mockGameData.gold}
      day={mockGameData.day}
      lunarPhase={mockGameData.lunarPhase}
      reputation={mockGameData.reputation}
      playerLevel={mockGameData.playerLevel}
    />
  );
};

export default App90s;