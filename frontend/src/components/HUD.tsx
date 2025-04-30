import React, { useState, useEffect } from 'react';
import './HUD.css'; // Ensure this uses the new styles
import LunarPhaseIcon from './LunarPhaseIcon';
import { MoonPhase } from 'coven-shared';

interface HUDProps {
  playerName: string;
  gold: number;
  day: number;
  lunarPhase: MoonPhase;
  reputation: number;
  playerLevel: number; // Added playerLevel
  onChangeLocation: (location: string) => void;
  onAdvanceDay: () => void;
}

const HUD: React.FC<HUDProps> = ({
  playerName,
  gold,
  day,
  lunarPhase,
  reputation,
  playerLevel, // Use playerLevel
  onChangeLocation,
  onAdvanceDay
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmEndDay, setConfirmEndDay] = useState(false);
  const [confirmTimeoutId, setConfirmTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleLocationClick = (location: string) => {
    onChangeLocation(location);
    setMenuOpen(false);
    resetEndDayConfirm();
  };

  const handleEndDayClick = () => {
    if (confirmEndDay) {
      if(confirmTimeoutId) clearTimeout(confirmTimeoutId);
      onAdvanceDay();
      setConfirmEndDay(false);
      setConfirmTimeoutId(null);
      setMenuOpen(false); // Close menu on confirm
    } else {
      setConfirmEndDay(true);
      const timeoutId = setTimeout(() => {
         setConfirmEndDay(false);
         setConfirmTimeoutId(null);
      }, 5000); // 5 seconds timeout
      setConfirmTimeoutId(timeoutId);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    resetEndDayConfirm();
  };

  const resetEndDayConfirm = () => {
      if(confirmTimeoutId) {
          clearTimeout(confirmTimeoutId);
          setConfirmTimeoutId(null);
      }
      setConfirmEndDay(false);
  };

  // Optional: Close menu if clicking outside HUD/menu area
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          // Check if the click target is outside the HUD top bar and the menu itself
          const hudTop = document.querySelector('.hud-top');
          const menu = document.querySelector('.location-menu');
          if (
              hudTop && !hudTop.contains(event.target as Node) &&
              menu && !menu.contains(event.target as Node)
          ) {
              setMenuOpen(false);
              resetEndDayConfirm();
          }
      };

      if (menuOpen) {
          document.addEventListener('mousedown', handleClickOutside);
      } else {
          document.removeEventListener('mousedown', handleClickOutside);
      }

      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, [menuOpen]); // Re-run when menuOpen changes


  return (
    <div className="hud-container">
      {/* Top Bar */}
      <div className="hud-top">
        {/* Player Info */}
        <div className="player-info">
          <div className="player-avatar" title={`Player: ${playerName}`}>
            {/* Display first letter or a simple icon */}
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div className="player-details">
            <div className="player-name">{playerName}</div>
            <div className="player-level">
              <span className="level-label">Lv.</span>
              <span className="level-number">{playerLevel}</span>
            </div>
          </div>
        </div>

        {/* Lunar Display */}
        <div className="lunar-display">
          <div className="lunar-icon">
            <LunarPhaseIcon phase={lunarPhase} size={40} />
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
            title={confirmEndDay ? "Click again to confirm end day" : "End the Day"}
          >
            {confirmEndDay ? 'Confirm?' : 'End Day'}
          </button>
          <button
            className={`menu-button ${menuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            title="Navigation"
          >
            <div className="menu-icon">
              <span></span><span></span><span></span>
            </div>
          </button>
        </div>
      </div>

      {/* Location Menu (conditionally rendered) */}
      {menuOpen && (
        <div className="location-menu">
          <div className="menu-header">
            <h3>Navigate</h3>
          </div>
          <div className="menu-items">
            {[
              { name: 'Garden', location: 'garden', iconClass: 'garden-icon' },
              { name: 'Brewing', location: 'brewing', iconClass: 'brewing-icon' },
              { name: 'Atelier', location: 'atelier', iconClass: 'atelier-icon' },
              { name: 'Market', location: 'market', iconClass: 'market-icon' },
              { name: 'Journal', location: 'journal', iconClass: 'journal-icon' },
            ].map(item => (
              <div
                key={item.location}
                className="menu-item"
                onClick={() => handleLocationClick(item.location)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => { if (e.key === 'Enter') handleLocationClick(item.location); }} // Basic keyboard nav
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