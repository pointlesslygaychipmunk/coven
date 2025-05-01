import { useState, useEffect } from 'react';
import './CovenHUD.css';

// Define types
type MoonPhase = 'New Moon' | 'Waxing' | 'Full Moon' | 'Waning';

interface LunarPhaseIconProps {
  phase: MoonPhase;
  size: number;
}

// Lunar Phase Icon component
const LunarPhaseIcon: React.FC<LunarPhaseIconProps> = ({ phase, size }) => {
  // This is a placeholder - you would implement the actual moon phase icon
  return (
    <div 
      className="moon-phase" 
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: phase === 'Full Moon' ? '#f0f0f0' : 
                         phase === 'New Moon' ? '#333' : 
                         phase === 'Waxing' ? 'linear-gradient(to right, #333, #f0f0f0)' : 
                         'linear-gradient(to left, #333, #f0f0f0)',
        borderRadius: '50%' 
      }}
    />
  );
};

interface CovenHUDProps {
  playerName: string;
  gold: number;
  day: number;
  lunarPhase: MoonPhase;
  reputation: number;
  playerLevel: number;
  onChangeLocation: (location: string) => void;
  onAdvanceDay: () => void;
}

const CovenHUD: React.FC<CovenHUDProps> = ({
  playerName = "Elspeth",
  gold = 75,
  day = 3,
  lunarPhase = "Waxing",
  reputation = 12,
  playerLevel = 2,
  onChangeLocation,
  onAdvanceDay
}) => {
  const [activeLocation, setActiveLocation] = useState<string>('garden');
  const [confirmEndDay, setConfirmEndDay] = useState<boolean>(false);
  const [confirmTimeoutId, setConfirmTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Handle location change
  const handleLocationClick = (location: string) => {
    setActiveLocation(location);
    onChangeLocation(location);
    resetEndDayConfirm();
  };

  // Handle end day click with confirmation step
  const handleEndDayClick = () => {
    if (confirmEndDay) {
      if(confirmTimeoutId) clearTimeout(confirmTimeoutId);
      onAdvanceDay();
      setConfirmEndDay(false);
      setConfirmTimeoutId(null);
    } else {
      setConfirmEndDay(true);
      // Set a timeout to automatically cancel confirmation after a few seconds
      const timeoutId = setTimeout(() => {
         setConfirmEndDay(false);
         setConfirmTimeoutId(null);
      }, 5000); // 5 seconds timeout
      setConfirmTimeoutId(timeoutId);
    }
  };

  // Helper to reset the end day confirmation state and clear timeout
  const resetEndDayConfirm = () => {
    if(confirmTimeoutId) {
      clearTimeout(confirmTimeoutId);
      setConfirmTimeoutId(null);
    }
    setConfirmEndDay(false);
  };

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close any open dialogs or reset states if needed
        resetEndDayConfirm();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Get player initial for avatar
  const getPlayerInitial = (): string => {
    return playerName.charAt(0).toUpperCase();
  };

  return (
    <div className="coven-ui">
      {/* Top HUD Bar */}
      <div className="coven-hud">
        {/* Player Info */}
        <div className="player-panel">
          <div className="player-portrait">
            <div className="player-avatar">{getPlayerInitial()}</div>
          </div>
          <div className="player-stats">
            <div className="player-name">{playerName}</div>
            <div className="player-level">
              <span>Atelier Lv</span>
              <span className="level-number">{playerLevel}</span>
            </div>
          </div>
        </div>

        {/* Lunar Display */}
        <div className="lunar-panel">
          <div className="lunar-icon">
            <LunarPhaseIcon phase={lunarPhase} size={40} />
          </div>
          <div className="lunar-info">
            <div className="lunar-phase">{lunarPhase}</div>
            <div className="day-count">Day {day}</div>
          </div>
        </div>

        {/* Resources */}
        <div className="resources-panel">
          <div className="resource-item gold">
            <div className="resource-icon"></div>
            <div className="resource-value">{gold}</div>
          </div>
          <div className="resource-item reputation">
            <div className="resource-icon"></div>
            <div className="resource-value">{reputation}</div>
          </div>
        </div>

        {/* End Day Button */}
        <button
          className={`end-day-button ${confirmEndDay ? 'confirm' : ''}`}
          onClick={handleEndDayClick}
        >
          {confirmEndDay ? 'Confirm?' : 'End Day'}
        </button>
      </div>

      {/* Main Navigation Panel */}
      <div className="navigation-panel">
        <div className="location-tabs">
          {[
            { id: 'garden', name: 'Garden', icon: '🌿' },
            { id: 'brewing', name: 'Brewing', icon: '🧪' },
            { id: 'atelier', name: 'Atelier', icon: '✨' },
            { id: 'market', name: 'Market', icon: '💰' },
            { id: 'journal', name: 'Journal', icon: '📖' }
          ].map(loc => (
            <button
              key={loc.id}
              className={`location-tab ${activeLocation === loc.id ? 'active' : ''}`}
              onClick={() => handleLocationClick(loc.id)}
            >
              <span className="location-icon">{loc.icon}</span>
              <span className="location-name">{loc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Window (placeholder) */}
      <div className="content-window">
        <div className="content-header">
          {activeLocation === 'garden' && <h2>Witch's Garden</h2>}
          {activeLocation === 'brewing' && <h2>Brewing Station</h2>}
          {activeLocation === 'atelier' && <h2>Atelier Workshop</h2>}
          {activeLocation === 'market' && <h2>Village Market</h2>}
          {activeLocation === 'journal' && <h2>Witch's Journal</h2>}
        </div>
        <div className="content-area">
          {/* This is where your view-specific content would go */}
          <div className="placeholder-content">
            {activeLocation === 'garden' && <p>Your magical garden area with plants and herbs</p>}
            {activeLocation === 'brewing' && <p>Create magical potions and brews</p>}
            {activeLocation === 'atelier' && <p>Craft mystical items and artifacts</p>}
            {activeLocation === 'market' && <p>Browse and trade with local merchants</p>}
            {activeLocation === 'journal' && <p>Review your recipes, discoveries and quests</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CovenHUD;