import React, { useState, useEffect } from 'react';
import './TownMap.css';
import { Player } from 'coven-shared';

interface LocationInfo {
  id: string;
  name: string;
  description: string;
  type: 'shop' | 'guild' | 'tavern' | 'residence' | 'craftsman' | 'garden' | 'temple' | 'market';
  locked?: boolean;
  requiresReputation?: number;
  onVisit?: () => void;
  position: {
    x: number; // percentage from left
    y: number; // percentage from top
  };
}

interface TownMapProps {
  playerReputation: number;
  playerGold: number;
  onNavigateToMarket: () => void;
  onNavigateToGarden: () => void;
  onNavigateToAtelier: () => void;
}

const TownMap: React.FC<TownMapProps> = ({
  playerReputation,
  playerGold,
  onNavigateToMarket,
  onNavigateToGarden,
  onNavigateToAtelier
}) => {
  // State for currently selected location and information dialog
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null);
  const [showLocationInfo, setShowLocationInfo] = useState<boolean>(false);
  const [infoPosition, setInfoPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [randomTip, setRandomTip] = useState<string>('');
  const [hoverLocation, setHoverLocation] = useState<string | null>(null);

  // Town tips that appear randomly
  const townTips = [
    "Strange herbs grow near the old temple ruins...",
    "The Alchemists' Guild has special deals on full moon nights.",
    "Whispers say the old apothecary knows forgotten recipes...",
    "The hedge witch at the edge of town trades rare seeds...",
    "The tavern keeper collects town rumors worth listening to.",
    "Market prices fluctuate with the phases of the moon.",
    "The town follows ancient seasonal festivals; expect special events.",
    "The old library contains tomes of forgotten magic.",
    "Different vendors appear in the market on different days.",
    "Higher reputation unlocks special services throughout town."
  ];

  // Town locations configuration
  const townLocations: LocationInfo[] = [
    {
      id: 'market',
      name: 'Town Market',
      description: 'The bustling heart of town commerce. Buy and sell goods, or fulfill town requests for reputation.',
      type: 'market',
      position: { x: 50, y: 40 },
      onVisit: onNavigateToMarket
    },
    {
      id: 'witch_garden',
      name: 'Your Garden',
      description: 'Your personal garden where you grow magical herbs and plants. The heart of your witch practice.',
      type: 'garden',
      position: { x: 75, y: 65 },
      onVisit: onNavigateToGarden
    },
    {
      id: 'atelier',
      name: 'Brewing Atelier',
      description: 'Your workshop for crafting potions, tinctures, and magical concoctions from gathered ingredients.',
      type: 'craftsman',
      position: { x: 70, y: 35 },
      onVisit: onNavigateToAtelier
    },
    {
      id: 'herb_shop',
      name: 'Verdant Whispers',
      description: 'A specialty shop run by an old herbalist who occasionally stocks rare seeds and ingredients.',
      type: 'shop',
      position: { x: 30, y: 50 }
    },
    {
      id: 'alchemists_guild',
      name: 'Alchemists\' Guild',
      description: 'The prestigious guild where master brewers share knowledge and techniques. Membership grants access to rare recipes.',
      type: 'guild',
      position: { x: 65, y: 20 },
      locked: true,
      requiresReputation: 40
    },
    {
      id: 'observatory',
      name: 'Lunar Observatory',
      description: 'A tower dedicated to studying celestial bodies. The astrologists here provide insight on optimal brewing times.',
      type: 'temple',
      position: { x: 85, y: 15 },
      locked: true,
      requiresReputation: 30
    },
    {
      id: 'tavern',
      name: 'The Bubbling Cauldron',
      description: 'A cozy tavern where locals gather. An excellent place to hear rumors and find special requests.',
      type: 'tavern',
      position: { x: 40, y: 30 }
    },
    {
      id: 'apothecary',
      name: 'Ancient Remedies',
      description: 'A mysterious shop specializing in exotic ingredients and forgotten recipes.',
      type: 'shop',
      position: { x: 25, y: 25 },
      locked: true,
      requiresReputation: 20
    },
    {
      id: 'cottage',
      name: 'Your Cottage',
      description: 'Your humble but cozy home on the outskirts of town, perfect for a practicing witch.',
      type: 'residence',
      position: { x: 80, y: 80 }
    }
  ];

  // Select a random tip on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * townTips.length);
    setRandomTip(townTips[randomIndex]);

    // Change tip every 60 seconds
    const interval = setInterval(() => {
      const newIndex = Math.floor(Math.random() * townTips.length);
      setRandomTip(townTips[newIndex]);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Handle location click
  const handleLocationClick = (location: LocationInfo, event: React.MouseEvent) => {
    // Check if location is locked
    if (location.locked && location.requiresReputation && playerReputation < location.requiresReputation) {
      setSelectedLocation(location);
      setShowLocationInfo(true);
      
      // Position the info dialog
      const mapContainer = event.currentTarget.closest('.town-map-container');
      if (mapContainer) {
        const rect = mapContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Adjust position to ensure dialog is visible
        const dialogWidth = 300; // estimated width
        const dialogHeight = 150; // estimated height
        
        let x = clickX;
        let y = clickY + 20; // show below the click by default
        
        // Make sure dialog is within map bounds
        if (x + dialogWidth > rect.width) {
          x = rect.width - dialogWidth - 10;
        }
        if (y + dialogHeight > rect.height) {
          y = clickY - dialogHeight - 10; // show above the click
        }
        
        setInfoPosition({ x, y });
      }
      return;
    }

    // Handle unlocked location click
    setSelectedLocation(location);
    setShowLocationInfo(true);
    
    // Position the info dialog
    const mapContainer = event.currentTarget.closest('.town-map-container');
    if (mapContainer) {
      const rect = mapContainer.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      
      // Adjust position to ensure dialog is visible
      const dialogWidth = 300; // estimated width
      const dialogHeight = 150; // estimated height
      
      let x = clickX;
      let y = clickY + 20; // show below the click by default
      
      // Make sure dialog is within map bounds
      if (x + dialogWidth > rect.width) {
        x = rect.width - dialogWidth - 10;
      }
      if (y + dialogHeight > rect.height) {
        y = clickY - dialogHeight - 10; // show above the click
      }
      
      setInfoPosition({ x, y });
    }
    
    // If there's a navigation callback, execute it
    if (location.onVisit) {
      location.onVisit();
    }
  };

  // Close the location info dialog
  const closeLocationInfo = () => {
    setShowLocationInfo(false);
    setSelectedLocation(null);
  };

  // Get icon for location based on type
  const getLocationIcon = (type: string, locked: boolean = false): string => {
    if (locked) return '🔒';
    
    switch (type) {
      case 'shop': return '🏪';
      case 'guild': return '🏛️';
      case 'tavern': return '🍺';
      case 'residence': return '🏠';
      case 'craftsman': return '⚗️';
      case 'garden': return '🌿';
      case 'temple': return '🔭';
      case 'market': return '💰';
      default: return '📍';
    }
  };

  // Handle hover events for location markers
  const handleLocationHover = (locationId: string | null) => {
    setHoverLocation(locationId);
  };

  return (
    <div className="town-map-container">
      <div className="town-map-header">
        <div className="scroll-ornament left"></div>
        <h2>Town of Misthollow</h2>
        <div className="scroll-ornament right"></div>
      </div>
      
      <div className="town-map-content">
        <div className="town-map">
          {/* Map image */}
          <div className="map-background"></div>
          
          {/* Location markers */}
          {townLocations.map(location => {
            const isLocked = location.locked && location.requiresReputation && playerReputation < location.requiresReputation;
            
            return (
              <div
                key={location.id}
                className={`location-marker ${isLocked ? 'locked' : ''} ${location.id === hoverLocation ? 'hover' : ''} ${location.type}`}
                style={{
                  left: `${location.position.x}%`,
                  top: `${location.position.y}%`
                }}
                onClick={(e) => handleLocationClick(location, e)}
                onMouseEnter={() => handleLocationHover(location.id)}
                onMouseLeave={() => handleLocationHover(null)}
              >
                <div className="marker-icon">{getLocationIcon(location.type, isLocked)}</div>
                <div className="marker-name">{location.name}</div>
              </div>
            );
          })}
          
          {/* Location information dialog */}
          {showLocationInfo && selectedLocation && (
            <div
              className="location-info"
              style={{
                left: `${infoPosition.x}px`,
                top: `${infoPosition.y}px`
              }}
            >
              <div className="info-header">
                <h3>{selectedLocation.name}</h3>
                <button className="close-button" onClick={closeLocationInfo}>×</button>
              </div>
              
              <div className="info-content">
                <p>{selectedLocation.description}</p>
                
                {selectedLocation.locked && selectedLocation.requiresReputation && playerReputation < selectedLocation.requiresReputation && (
                  <div className="locked-message">
                    <span className="lock-icon">🔒</span>
                    <span>Requires {selectedLocation.requiresReputation} Reputation (You have {playerReputation})</span>
                  </div>
                )}
                
                {selectedLocation.onVisit && !selectedLocation.locked && (
                  <button 
                    className="visit-button"
                    onClick={() => {
                      if (selectedLocation.onVisit) {
                        selectedLocation.onVisit();
                      }
                      closeLocationInfo();
                    }}
                  >
                    Visit
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="town-map-sidebar">
          <div className="player-stats">
            <div className="reputation-display">
              <h3>Town Reputation</h3>
              <div className="reputation-bar">
                <div 
                  className="reputation-fill" 
                  style={{ width: `${Math.min(100, playerReputation)}%` }}
                ></div>
              </div>
              <div className="reputation-value">{playerReputation}/100</div>
            </div>
            
            <div className="gold-display">
              <h3>Gold</h3>
              <div className="gold-value">{playerGold}G</div>
            </div>
          </div>
          
          <div className="town-crier">
            <h3>Town Crier</h3>
            <div className="town-tip">{randomTip}</div>
          </div>
          
          <div className="town-legend">
            <h3>Legend</h3>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-icon shop">{getLocationIcon('shop')}</span>
                <span className="legend-text">Shop</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon market">{getLocationIcon('market')}</span>
                <span className="legend-text">Market</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon guild">{getLocationIcon('guild')}</span>
                <span className="legend-text">Guild</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon tavern">{getLocationIcon('tavern')}</span>
                <span className="legend-text">Tavern</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon residence">{getLocationIcon('residence')}</span>
                <span className="legend-text">Residence</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon craftsman">{getLocationIcon('craftsman')}</span>
                <span className="legend-text">Craftsman</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon locked">🔒</span>
                <span className="legend-text">Locked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TownMap;