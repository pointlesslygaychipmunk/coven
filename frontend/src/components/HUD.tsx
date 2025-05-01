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
  const [menuExpanded, setMenuExpanded] = useState<boolean>(true);

  // Portrait Easter Egg
  const [portraitClicks, setPortraitClicks] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);
  const [levelBoost, setLevelBoost] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const portraitClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track window size to handle responsive layout
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-expand menu on large screens, collapse on small screens
      setMenuExpanded(window.innerWidth > 768);
    };

    // Set initial state based on window width
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle location change
  const handleLocationClick = (location: string) => {
    setActiveLocation(location);
    onChangeLocation(location);
    resetEndDayConfirm(); // Reset confirm state when changing location
    
    // Auto-collapse menu on small screens after selection
    if (windowWidth <= 768) {
      setMenuExpanded(false);
    }
  };

  // Toggle menu expanded state (for mobile)
  const toggleMenu = () => {
    setMenuExpanded(prev => !prev);
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

  return (
    <aside className={`hud-container ${menuExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Toggle button (mobile only) */}
      <button 
        className={`menu-toggle ${menuExpanded ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label={menuExpanded ? 'Collapse menu' : 'Expand menu'}
      >
        <div className="toggle-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      {/* Main HUD Content */}
      <div className="hud-content">
        {/* Player Info Panel with Wooden Frame */}
        <div className="panel player-panel">
          <div className="panel-header">
            <div className="header-decoration left"></div>
            <h3>Character</h3>
            <div className="header-decoration right"></div>
          </div>
          <div className="panel-content">
            <div
              className={`player-portrait ${showSparkle ? 'sparkling' : ''}`}
              onClick={handlePortraitClick}
            >
              <div className="portrait-frame"></div>
              <div className="player-avatar">{playerName.charAt(0).toUpperCase()}</div>
              {showSparkle && <div className="portrait-sparkles"></div>}
            </div>
            <div className="player-name">{playerName}</div>
            <div className="player-level">
              <span>Atelier Level </span>
              <span className="level-number">{playerLevel + levelBoost}</span>
            </div>
          </div>
        </div>

        {/* Lunar Display Panel */}
        <div className="panel moon-panel">
          <div className="panel-header">
            <div className="header-decoration left"></div>
            <h3>Moon Phase</h3>
            <div className="header-decoration right"></div>
          </div>
          <div className="panel-content">
            <div className="lunar-display">
              <div className="lunar-icon">
                <LunarPhaseIcon phase={lunarPhase} size={40} />
              </div>
              <div className="lunar-info">
                <div className="lunar-phase">{lunarPhase}</div>
                <div className="day-count">Day {day}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Panel */}
        <div className="panel resources-panel">
          <div className="panel-header">
            <div className="header-decoration left"></div>
            <h3>Resources</h3>
            <div className="header-decoration right"></div>
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

        {/* Navigation Panel */}
        <div className="panel nav-panel">
          <div className="panel-header">
            <div className="header-decoration left"></div>
            <h3>Navigation</h3>
            <div className="header-decoration right"></div>
          </div>
          <div className="panel-content">
            <div className="location-tabs">
              {navItems.map(loc => (
                <button
                  key={loc.id}
                  className={`location-tab ${activeLocation === loc.id ? 'active' : ''}`}
                  onClick={() => handleLocationClick(loc.id)}
                  title={loc.name}
                >
                  <div className="tab-icon">{loc.icon}</div>
                  <span className="tab-name">{loc.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* End Day Button */}
        <button
          className={`end-day-button ${confirmEndDay ? 'confirm' : ''}`}
          onClick={handleEndDayClick}
          disabled={confirmEndDay && !confirmTimeoutId}
        >
          <div className="button-frame"></div>
          <span>{confirmEndDay ? 'Confirm End Day?' : 'End Day'}</span>
        </button>
      </div>

      {/* Status Message (Easter Egg) */}
      {statusMessage && (
        <div className="status-message">{statusMessage}</div>
      )}
    </aside>
  );
};

export default HUD;