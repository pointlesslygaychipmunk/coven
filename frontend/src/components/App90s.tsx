import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './loadingScreen.css';
import '../styles/global-styles.css'; // Import global styles
import '../styles/a11y.css'; // Import accessibility styles
import MainGameFrame from './MainGameFrame';
import LandingPage from './LandingPage';
import MatchSystem from './MatchSystem';
import SkipLinks from './SkipLinks';
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Simulate loading data from backend
  useEffect(() => {
    const loadGameData = () => {
      // Simulate network delay
      setTimeout(() => {
        setGameLoaded(true);
      }, 2000);
    };
    
    loadGameData();
    
    // Check if user has a saved coven name
    const savedUsername = localStorage.getItem('covenUsername');
    if (savedUsername) {
      setIsAuthenticated(true);
    }
  }, []);
  
  // Loading screen
  if (!gameLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h1>New Coven</h1>
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
  
  // Main application with router for navigation
  return (
    <Router>
      <SkipLinks 
        links={[
          { id: 'main-content', label: 'Skip to main content' },
          { id: 'main-navigation', label: 'Skip to navigation' }
        ]} 
      />
      <div className="pixelated">
        <Routes>
          {/* Landing page route */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Match system routes */}
          <Route path="/game/:gameId" element={<MatchSystem />} />
          <Route path="/game/setup" element={<MatchSystem />} />
          
          {/* Main game route */}
          <Route 
            path="/game/active" 
            element={
              isAuthenticated ? (
                <MainGameFrame
                  playerName={mockGameData.playerName}
                  gold={mockGameData.gold}
                  day={mockGameData.day}
                  lunarPhase={mockGameData.lunarPhase}
                  reputation={mockGameData.reputation}
                  playerLevel={mockGameData.playerLevel}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          {/* Single player game route */}
          <Route 
            path="/game/single-player" 
            element={
              isAuthenticated ? (
                <MainGameFrame
                  playerName={localStorage.getItem('covenUsername') || mockGameData.playerName}
                  gold={mockGameData.gold}
                  day={mockGameData.day}
                  lunarPhase={mockGameData.lunarPhase}
                  reputation={mockGameData.reputation}
                  playerLevel={mockGameData.playerLevel}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          {/* Fallback route - redirect to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App90s;