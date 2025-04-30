import React, { useState } from 'react';
import './HUD.css';
import LunarPhaseIcon from './LunarPhaseIcon'; // Ensure this component exists and works
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
  lunarPhase, // Already typed as MoonPhase via props
  reputation,
  playerLevel,
  onChangeLocation,
  onAdvanceDay
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmEndDay, setConfirmEndDay] = useState(false);
  const [confirmTimeoutId, setConfirmTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Handle location change from menu
  const handleLocationClick = (location: string) => {
    onChangeLocation(location);
    setMenuOpen(false); // Close menu after selection
    resetEndDayConfirm(); // Reset confirm state if menu is used
  };

  // Handle end day click with confirmation step
  const handleEndDayClick = () => {
    if (confirmEndDay) {
      if(confirmTimeoutId) clearTimeout(confirmTimeoutId); // Clear existing timeout
      onAdvanceDay(); // Perform the action
      setConfirmEndDay(false); // Reset confirmation state
      setConfirmTimeoutId(null);
    } else {
      setConfirmEndDay(true); // Show confirmation state
      // Set a timeout to automatically cancel confirmation after a few seconds
      const timeoutId = setTimeout(() => {
         setConfirmEndDay(false);
         setConfirmTimeoutId(null);
         console.log("End day confirmation timed out.");
      }, 5000); // 5 seconds timeout
      setConfirmTimeoutId(timeoutId);
    }
  };

  // Toggle the location menu visibility
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    resetEndDayConfirm(); // Reset confirm state when menu is toggled
  };

  // Helper to reset the end day confirmation state and clear timeout
  const resetEndDayConfirm = () => {
      if(confirmTimeoutId) {
          clearTimeout(confirmTimeoutId);
          setConfirmTimeoutId(null);
      }
      setConfirmEndDay(false);
  };

  // Close menu if clicking outside (basic implementation)
  // useEffect(() => { ... }); // Keep commented out for now


  return (
    <div className="hud-container">
      {/* Top Bar */}
      <div className="hud-top">
        {/* Player Info */}
        <div className="player-info">
          <div className="player-avatar" title={`Player: ${playerName}`}>
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div className="player-details">
            <div className="player-name">{playerName}</div>
            <div className="player-level">
              <span className="level-label">Lv</span>
              <span className="level-number">{playerLevel}</span>
            </div>
          </div>
        </div>

        {/* Lunar Display */}
        <div className="lunar-display">
          <div className="lunar-icon">
            {/* Pass the lunarPhase prop directly - no casting needed */}
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
            title={confirmEndDay ? "Click again to confirm ending the day" : "End the current day"}
          >
            {confirmEndDay ? 'Confirm?' : 'End Day'}
          </button>
          <button
            className={`menu-button ${menuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            title="Open Navigation Menu"
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
            {/* Define locations */}
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
                role="button" // Accessibility
                tabIndex={0} // Accessibility
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
               Close Menu
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default HUD;