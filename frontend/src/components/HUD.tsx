import React, { useState, useEffect, useRef } from 'react';
import './HUD.css';
import LunarPhaseIcon from './LunarPhaseIcon';
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

  // Get player initial for avatar
  const getPlayerInitial = (): string => {
    return playerName.charAt(0).toUpperCase();
  };

  // Navigation items
  const navItems = [
    { id: 'garden', name: 'Garden', icon: '🌿' },
    { id: 'brewing', name: 'Brewing', icon: '🧪' },
    { id: 'atelier', name: 'Atelier', icon: '✨' },
    { id: 'market', name: 'Market', icon: '💰' },
    { id: 'journal', name: 'Journal', icon: '📖' }
  ];

  return (
    <aside className="coven-hud-sidebar">
      {/* Player Info */}
      <div className="player-panel">
        <div
          className={`player-portrait ${showSparkle ? 'sparkling' : ''}`}
          onClick={handlePortraitClick}
          title="Click portrait rapidly..."
        >
          <div className="player-avatar">{getPlayerInitial()}</div>
          {showSparkle && <div className="portrait-sparkles"></div>}
        </div>
        <div className="player-name" title={playerName}>{playerName}</div>
        <div className="player-level">
          <span>Atelier Lv </span>
          <span className="level-number">{playerLevel + levelBoost}</span>
        </div>
      </div>

      {/* Lunar Display */}
      <div className="lunar-panel">
        <div className="lunar-icon">
          <LunarPhaseIcon phase={lunarPhase} size={40} />
        </div>
        <div className="lunar-info">
          <div className="lunar-phase" title={lunarPhase}>{lunarPhase}</div>
          <div className="day-count">Day {day}</div>
        </div>
      </div>

      {/* Resources */}
      <div className="resources-panel">
        <div className="resource-item gold" title={`${gold} Gold`}>
          <div className="resource-icon">💰</div>
          <div className="resource-value">{gold}</div>
        </div>
        <div className="resource-item reputation" title={`${reputation} Reputation`}>
          <div className="resource-icon">✨</div>
          <div className="resource-value">{reputation}</div>
        </div>
      </div>

      {/* Navigation Panel */}
      <div className="navigation-panel">
        <div className="location-tabs">
          {navItems.map(loc => (
            <button
              key={loc.id}
              className={`location-tab ${activeLocation === loc.id ? 'active' : ''}`}
              onClick={() => handleLocationClick(loc.id)}
              title={loc.name}
            >
              <span className="location-icon">{loc.icon}</span>
              <span className="location-name">{loc.name}</span>
            </button>
          ))}
        </div>

        {/* End Day Button */}
        <button
          className={`end-day-button ${confirmEndDay ? 'confirm' : ''}`}
          onClick={handleEndDayClick}
          disabled={confirmEndDay && !confirmTimeoutId} // Prevent spamming after confirm timeout resets
        >
          {confirmEndDay ? 'Confirm End Day?' : 'End Day'}
        </button>
      </div>

      {/* Status Message (Easter Egg) */}
      {statusMessage && (
        <div className="hud-status-message">{statusMessage}</div>
      )}
    </aside>
  );
};

export default HUD;