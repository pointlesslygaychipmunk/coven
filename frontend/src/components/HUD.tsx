import React, { useState, useEffect, useRef } from 'react';
import './HUD.css';
import { MoonPhase } from 'coven-shared';

interface HUDProps {
  playerName: string;
  gold: number;
  day: number;
  lunarPhase: MoonPhase;
  reputation: number;
  playerLevel: number;
  onChangeLocation: (location: string) => void;
  onAdvanceDay: () => void;
}

const HUD: React.FC<HUDProps> = ({
  playerName = "Willow",
  gold = 100,
  day = 1,
  lunarPhase = "Waxing Crescent",
  reputation = 5,
  playerLevel = 1,
  onChangeLocation,
  onAdvanceDay
}) => {
  // State
  const [activeLocation, setActiveLocation] = useState<string>('garden');
  const [confirmEndDay, setConfirmEndDay] = useState<boolean>(false);
  const [confirmTimeoutId, setConfirmTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Portrait Easter Egg
  const [portraitClicks, setPortraitClicks] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);
  const [levelBoost, setLevelBoost] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const portraitClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle location change
  const handleLocationClick = (location: string) => {
    setActiveLocation(location);
    onChangeLocation(location);
    resetEndDayConfirm(); // Reset confirm state when changing location
  };

  // Handle end day click with confirmation step
  const handleEndDayClick = () => {
    if (confirmEndDay) {
      if (confirmTimeoutId) clearTimeout(confirmTimeoutId);
      onAdvanceDay();
      setConfirmEndDay(false);
      setConfirmTimeoutId(null);
    } else {
      setConfirmEndDay(true);
      // Set timeout to auto-cancel confirmation
      const timeoutId = setTimeout(() => {
        setConfirmEndDay(false);
        setConfirmTimeoutId(null);
      }, 5000); // 5 seconds
      setConfirmTimeoutId(timeoutId);
    }
  };

  // Helper to reset end day confirmation state
  const resetEndDayConfirm = () => {
    if (confirmTimeoutId) {
      clearTimeout(confirmTimeoutId);
      setConfirmTimeoutId(null);
    }
    setConfirmEndDay(false);
  };

  // Easter Egg: Player Portrait Click
  const handlePortraitClick = () => {
    // Clear existing timeout
    if (portraitClickTimeoutRef.current) {
      clearTimeout(portraitClickTimeoutRef.current);
    }

    const newClicks = portraitClicks + 1;
    setPortraitClicks(newClicks);

    if (newClicks >= 5) {
      setShowSparkle(true);
      setLevelBoost(1); // Temporary visual level boost effect
      setStatusMessage(`${playerName} feels particularly determined! ✨`);
      
      // Play a subtle sound effect
      const sparkleSound = new Audio('data:audio/wav;base64,UklGRroYAABXQVZFZm10IBAAAAABAAEAESsAACJWAAABAAgAZGF0YZYYAAAAAFf/Vzb/No3+jQT+BKL9osH9wSL+IpT+lO/+70v/SzP/M3X+dVf+Vzb+NjD+MH3+ff/9/8/9z9f91y3+LcH+wWf/Z4n/ifj++AH+Ae397bT9tGP+Y5n+mZP+kxT/FK//r5j/mC3/LT3/Pf/+/4D+gHn+ef/9/wT+BPb99g==');
      sparkleSound.volume = 0.2;
      sparkleSound.play().catch(() => {/* Ignore audio errors */});
      
      setTimeout(() => {
        setShowSparkle(false);
        setLevelBoost(0);
      }, 3000); // Sparkle effect duration
      
      setTimeout(() => {
        setStatusMessage(null);
      }, 4000); // Message duration
      
      setPortraitClicks(0); // Reset clicks after activation
    } else {
      // Set a timeout to reset clicks if not clicked again quickly
      portraitClickTimeoutRef.current = setTimeout(() => {
        setPortraitClicks(0);
      }, 800); // Reset after 0.8 seconds of inactivity
    }
  };

  // Cleanup portrait click timeout on unmount
  useEffect(() => {
    return () => {
      if (portraitClickTimeoutRef.current) {
        clearTimeout(portraitClickTimeoutRef.current);
      }
    };
  }, []);

  // Navigation items
  const navItems = [
    { id: 'garden', name: 'Garden', icon: '🌿' },
    { id: 'brewing', name: 'Brewing', icon: '🧪' },
    { id: 'atelier', name: 'Atelier', icon: '✨' },
    { id: 'market', name: 'Market', icon: '💰' },
    { id: 'journal', name: 'Journal', icon: '📖' }
  ];

  // Generate ASCII moon phases
  const getMoonASCII = (phase: MoonPhase) => {
    switch(phase) {
      case 'New Moon':        return '   ______\n  /      \\\n |        |\n |        |\n  \\______/';
      case 'Waxing Crescent': return '   ______\n  /   |  \\\n |    |   |\n |    |   |\n  \\___l__/';
      case 'First Quarter':   return '   ______\n  /|     \\\n | |      |\n | |      |\n  \\|_____/';
      case 'Waxing Gibbous':  return '   ______\n  /\\\\    \\\n | \\\\     |\n | \\\\     |\n  \\\\\\____/';
      case 'Full Moon':       return '   ______\n  /      \\\n |  ****  |\n |  ****  |\n  \\______/';
      case 'Waning Gibbous':  return '   ______\n  /    //\\\n |     // |\n |     // |\n  \\____///';
      case 'Last Quarter':    return '   ______\n  /     |\\\n |      | |\n |      | |\n  \\_____|/';
      case 'Waning Crescent': return '   ______\n  /  |   \\\n |   |    |\n |   |    |\n  \\__l___/';
      default:                return '   ______\n  /      \\\n |   ?    |\n |   ?    |\n  \\______/';
    }
  };

  return (
    <div className="hud-wrapper">
      {/* Main HUD Container */}
      <aside className="hud-container">
        {/* Top Section */}
        <div className="hud-top-section">
          {/* Player Info Panel */}
          <div className="panel player-panel">
            <div className="panel-header">
              <h3>Character</h3>
            </div>
            <div className="panel-content">
              <div
                className={`player-portrait ${showSparkle ? 'sparkling' : ''}`}
                onClick={handlePortraitClick}
              >
                <div className="portrait-frame"></div>
                <div className="player-avatar" data-initial={playerName.charAt(0).toUpperCase()}></div>
              </div>
              <div className="player-name">{playerName}</div>
              <div className="player-level">
                <span>Level </span>
                <span className="level-number">{playerLevel + levelBoost}</span>
              </div>
            </div>
          </div>

          {/* Lunar Display Panel */}
          <div className="panel moon-panel">
            <div className="panel-header">
              <h3>Moon Phase</h3>
            </div>
            <div className="panel-content">
              <div className="lunar-display">
                <div className="lunar-icon">
                  <pre>{getMoonASCII(lunarPhase)}</pre>
                </div>
                <div className="lunar-info">
                  <div className="lunar-phase">{lunarPhase}</div>
                  <div className="day-count">Day {day}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="hud-middle-section">
          {/* Resources Panel */}
          <div className="panel resources-panel">
            <div className="panel-header">
              <h3>Resources</h3>
            </div>
            <div className="panel-content">
              <div className="resource-item gold">
                <div className="resource-icon">
                  <div className="coin-icon"></div>
                </div>
                <div className="resource-label">Gold</div>
                <div className="resource-value">{gold}</div>
              </div>
              <div className="resource-item reputation">
                <div className="resource-icon">
                  <div className="rep-icon"></div>
                </div>
                <div className="resource-label">Reputation</div>
                <div className="resource-value">{reputation}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="hud-bottom-section">
          {/* Navigation Bar */}
          <div className="nav-bar">
            {navItems.map(loc => (
              <button
                key={loc.id}
                className={`nav-button ${activeLocation === loc.id ? 'active' : ''}`}
                onClick={() => handleLocationClick(loc.id)}
                title={loc.name}
              >
                <div className="button-content">
                  <div className="button-icon">{loc.icon}</div>
                  <span className="button-label">{loc.name}</span>
                </div>
              </button>
            ))}
            
            {/* End Day Button */}
            <button
              className={`end-day-button ${confirmEndDay ? 'confirm' : ''}`}
              onClick={handleEndDayClick}
              disabled={confirmEndDay && !confirmTimeoutId}
            >
              <span>{confirmEndDay ? 'Confirm End Day?' : 'End Day'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Status Message (Easter Egg) */}
      {statusMessage && (
        <div className="status-message">{statusMessage}</div>
      )}
    </div>
  );
};

export default HUD;