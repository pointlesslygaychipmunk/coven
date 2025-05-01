import React, { useState, useEffect } from 'react';
import './HUD.css';
import LunarPhaseIcon from './LunarPhaseIcon'; // Assuming LunarPhaseIcon exists and works
import { MoonPhase } from 'coven-shared'; // Import shared type

interface HUDProps {
  playerName: string;
  gold: number;
  day: number;
  lunarPhase: MoonPhase; // Correctly typed as MoonPhase
  reputation: number;
  playerLevel: number;
  onChangeLocation: (location: string) => void;
  onAdvanceDay: () => void;
}

const HUD: React.FC<HUDProps> = ({
  playerName,
  gold,
  day,
  lunarPhase,
  reputation,
  playerLevel,
  onChangeLocation,
  onAdvanceDay
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmEndDay, setConfirmEndDay] = useState(false);
  const [confirmTimeoutId, setConfirmTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [menuAnimation, setMenuAnimation] = useState('');

  // Handle location change from menu
  const handleLocationClick = (location: string) => {
    onChangeLocation(location);
    setMenuAnimation('fadeOut');
    setTimeout(() => {
      setMenuOpen(false);
      setMenuAnimation('');
    }, 300);
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

  // Toggle the location menu visibility with animation
  const toggleMenu = () => {
    if (menuOpen) {
      setMenuAnimation('fadeOut');
      setTimeout(() => {
        setMenuOpen(false);
        setMenuAnimation('');
      }, 300);
    } else {
      setMenuOpen(true);
      setMenuAnimation('fadeIn');
    }
    resetEndDayConfirm();
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
      if (event.key === 'Escape' && menuOpen) {
        toggleMenu();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [menuOpen]);

  // Get player initial for avatar
  const getPlayerInitial = () => {
    return playerName.charAt(0).toUpperCase();
  };

  return (
    <div className="hud-container">
      {/* Top Bar */}
      <div className="hud-top">
        {/* Player Info */}
        <div className="player-info">
          <div className="player-avatar" title={`Witch: ${playerName}`}>
            {getPlayerInitial()}
          </div>
          <div className="player-details">
            <div className="player-name">{playerName}</div>
            <div className="player-level">
              <span className="level-label">Atelier Lv</span>
              <span className="level-number">{playerLevel}</span>
            </div>
          </div>
        </div>

        {/* Lunar Display */}
        <div className="lunar-display">
          <div className="lunar-icon">
            <LunarPhaseIcon phase={lunarPhase} size={48} />
          </div>
          <div className="lunar-info">
            <div className="lunar-phase">{lunarPhase}</div>
            <div className="day-count">Day {day}</div>
          </div>
        </div>

        {/* Resources */}
        <div className="resources">
          <div className="gold-display" title={`${gold} Gold`}>
            <div className="gold-icon" />
            <div className="gold-amount">{gold}</div>
          </div>
          <div className="reputation-display" title={`${reputation} Reputation`}>
            <div className="reputation-icon" />
            <div className="reputation-amount">{reputation}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="hud-actions">
          <button
            className={`end-day-button ${confirmEndDay ? 'confirm' : ''}`}
            onClick={handleEndDayClick}
            title={confirmEndDay ? "Click again to confirm ending the day" : "End the current day"}
          >
            {confirmEndDay ? 'Confirm?' : 'End Day'}
          </button>
          <button
            className={`menu-button ${menuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            title="Open Navigation Menu"
            aria-label="Navigation Menu"
            aria-expanded={menuOpen}
          >
            <div className="menu-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>

      {/* Location Menu (conditionally rendered) */}
      {menuOpen && (
        <div className={`location-menu ${menuAnimation}`}>
          <div className="menu-header">
            <h3>Witch's Journal</h3>
          </div>
          <div className="menu-items">
            {/* Define locations with nostalgic icons */}
            {[
              { name: 'Garden', location: 'garden', iconClass: 'garden-icon', description: 'Tend to your magical plants' },
              { name: 'Brewing', location: 'brewing', iconClass: 'brewing-icon', description: 'Craft powerful potions' },
              { name: 'Atelier', location: 'atelier', iconClass: 'atelier-icon', description: 'Create magical items' },
              { name: 'Market', location: 'market', iconClass: 'market-icon', description: 'Buy and sell ingredients' },
              { name: 'Journal', location: 'journal', iconClass: 'journal-icon', description: 'Review your discoveries' },
            ].map(item => (
              <div
                key={item.location}
                className="menu-item"
                onClick={() => handleLocationClick(item.location)}
                role="button"
                tabIndex={0}
                title={item.description}
                aria-label={`Go to ${item.name}: ${item.description}`}
              >
                <div className={`menu-item-icon ${item.iconClass}`} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
           <div className="menu-footer">
             <button
               className="close-menu-button"
               onClick={toggleMenu}
               aria-label="Close Menu"
             >
               Close
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default HUD;