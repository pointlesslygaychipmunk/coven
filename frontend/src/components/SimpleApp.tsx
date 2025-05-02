import React, { useState, useEffect } from 'react';
import { GameState } from 'coven-shared';
import './App.css';

// Basic App that will definitely render without hooks issues
const SimpleApp: React.FC = () => {
  // Basic state - just enough to render the game
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('garden');
  
  // Simple fetch at component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/state');
        
        if (response.ok) {
          const data = await response.json();
          setGameState(data);
        } else {
          // Use mock data if API fails
          console.log('Using mock game state');
          setGameState({
            currentPlayerIndex: 0,
            version: "1.0.0",
            players: [{
              id: "player1",
              name: "Witch",
              gold: 100,
              mana: 50,
              reputation: 50,
              atelierLevel: 1,
              atelierSpecialization: "Essence",
              garden: [],
              inventory: [],
              blackMarketAccess: false,
              skills: { gardening: 1, brewing: 1, trading: 1, crafting: 1, herbalism: 1, astrology: 1 },
              knownRecipes: [],
              completedRituals: [],
              journalEntries: [],
              questsCompleted: 0,
              lastActive: Date.now()
            }],
            market: [],
            marketData: { inflation: 1.0, demand: {}, supply: {}, volatility: 0.1, blackMarketAccessCost: 500, blackMarketUnlocked: false, tradingVolume: 0 },
            rumors: [],
            townRequests: [],
            journal: [],
            rituals: [],
            events: [],
            knownRecipes: [],
            time: { year: 1, dayCount: 1, phaseName: "Full Moon", phase: 0, season: "Spring", weatherFate: "clear" }
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Show loading screen
  if (loading) {
    return (
      <div className="game-container">
        <div className="loading-screen">
          <div className="loading-dialog">
            <div className="loading-header">LOADING WITCH COVEN</div>
            <div className="loading-content">
              <h1>INITIALIZING MAGICAL SYSTEMS</h1>
              <div className="loading-bar-container">
                <div className="loading-bar"></div>
              </div>
              <p className="loading-text">Summoning magical components...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If we have no game state, show an error
  if (!gameState) {
    return (
      <div className="game-container">
        <div className="error-screen">
          <h1>Error loading game data</h1>
          <p>Unable to load game state. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </div>
    );
  }
  
  // Get current player safely
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  
  return (
    <div className="game-container">
      <div className="game-backdrop"></div>
      <div className="game-frame">
        {/* Title bar */}
        <div className="game-title-bar">The Witch Coven</div>
        
        {/* Menu bar */}
        <div className="game-menu-bar">
          <div 
            className={`game-menu-item ${view === 'garden' ? 'active' : ''}`}
            onClick={() => setView('garden')}
          >
            <span className="game-menu-key">G</span>arden
          </div>
          <div 
            className={`game-menu-item ${view === 'brewing' ? 'active' : ''}`}
            onClick={() => setView('brewing')}
          >
            <span className="game-menu-key">B</span>rewing
          </div>
          <div 
            className={`game-menu-item ${view === 'atelier' ? 'active' : ''}`}
            onClick={() => setView('atelier')}
          >
            <span className="game-menu-key">A</span>telier
          </div>
          <div 
            className={`game-menu-item ${view === 'market' ? 'active' : ''}`}
            onClick={() => setView('market')}
          >
            <span className="game-menu-key">M</span>arket
          </div>
          <div 
            className={`game-menu-item ${view === 'journal' ? 'active' : ''}`}
            onClick={() => setView('journal')}
          >
            <span className="game-menu-key">J</span>ournal
          </div>
        </div>
        
        {/* Main content */}
        <main className="game-content">
          <div className="view-container">
            <h2>Welcome to Witch Coven</h2>
            <p>Current view: {view}</p>
            <p>Player: {currentPlayer.name}</p>
            <p>Gold: {currentPlayer.gold}</p>
            <p>Day: {gameState.time.dayCount}</p>
            <p>Season: {gameState.time.season}</p>
            <p>Moon Phase: {gameState.time.phaseName}</p>
          </div>
        </main>
        
        {/* Status bar */}
        <div className="game-status-bar">
          <div className="status-item">
            <span className="status-icon">✧</span> 
            <span>{currentPlayer.name}</span>
          </div>
          <div className="status-item">
            <span className="status-icon">⛁</span>
            <span className="status-value">{currentPlayer.gold}</span> Gold
          </div>
          <div className="status-item">
            <span className="status-icon">☀</span>
            <span className="status-value">{gameState.time.dayCount}</span>
          </div>
          <div className="status-item">
            <span className="status-icon">☾</span>
            <span>{gameState.time.phaseName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;