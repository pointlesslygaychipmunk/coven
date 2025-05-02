import React, { useState, useEffect } from 'react';
import './TownMap.css';

// Define interfaces for props and data structures
interface TownMapProps {
  gameState: any; // Replace with proper GameState type when available
  onNavigateToTown: (townId: string) => void;
  onFulfillRequest: (requestId: string) => void;
  onNavigateToMarket: () => void;
  onNavigateToGarden: () => void;
  onNavigateToAtelier: () => void;
}

interface Town {
  id: string;
  name: string;
  x: number;
  y: number;
  specialization: string;
  wealth: number;
  reputation: number;
  description: string;
  unlocked: boolean;
  primaryResource: string;
  secondaryResource: string;
}

interface TradeRoute {
  from: string;
  to: string;
  strength: number;
  type: 'road' | 'river' | 'coastal' | 'mountain';
  unlocked: boolean;
}

interface ResourceDemand {
  resource: string;
  demand: number;
  trend: 'rising' | 'falling' | 'stable';
  price: number;
}

// Sample data until connected to backend
const sampleTowns: Town[] = [
  {
    id: 'elmhollow',
    name: 'Elmhollow',
    x: 300,
    y: 200,
    specialization: 'Herbs',
    wealth: 6,
    reputation: 60,
    description: 'A peaceful town known for its herb gardens and healing traditions.',
    unlocked: true,
    primaryResource: 'herb',
    secondaryResource: 'flower'
  },
  {
    id: 'crystalvale',
    name: 'Crystalvale',
    x: 200,
    y: 100,
    specialization: 'Crystals',
    wealth: 8,
    reputation: 40,
    description: 'A town built around ancient crystal mines in the mountains.',
    unlocked: true,
    primaryResource: 'crystal',
    secondaryResource: 'essence'
  },
  {
    id: 'mistport',
    name: 'Mistport',
    x: 450,
    y: 150,
    specialization: 'Oils',
    wealth: 9,
    reputation: 30,
    description: 'A coastal town trading in rare oils and fragrances.',
    unlocked: true,
    primaryResource: 'oil',
    secondaryResource: 'fruit'
  },
  {
    id: 'dewvale',
    name: 'Dewvale',
    x: 350,
    y: 300,
    specialization: 'Tonics',
    wealth: 5,
    reputation: 25,
    description: 'A valley town specializing in tonic brewing.',
    unlocked: true,
    primaryResource: 'herb',
    secondaryResource: 'root'
  },
  {
    id: 'embermere',
    name: 'Embermere',
    x: 100,
    y: 220,
    specialization: 'Masks',
    wealth: 7,
    reputation: 20,
    description: 'A town known for its volcanic clay and mud masks.',
    unlocked: false,
    primaryResource: 'mask',
    secondaryResource: 'herb'
  },
];

const sampleRoutes: TradeRoute[] = [
  { from: 'elmhollow', to: 'crystalvale', strength: 6, type: 'road', unlocked: true },
  { from: 'elmhollow', to: 'mistport', strength: 8, type: 'river', unlocked: true },
  { from: 'elmhollow', to: 'dewvale', strength: 9, type: 'road', unlocked: true },
  { from: 'dewvale', to: 'mistport', strength: 5, type: 'mountain', unlocked: true },
  { from: 'crystalvale', to: 'embermere', strength: 4, type: 'road', unlocked: false },
  { from: 'elmhollow', to: 'embermere', strength: 3, type: 'mountain', unlocked: false },
];

// Helper function to determine price trend based on market data
const determineTrend = (marketItem: any): 'rising' | 'falling' | 'stable' => {
  if (!marketItem || !marketItem.priceHistory || marketItem.priceHistory.length < 2) {
    return 'stable';
  }
  
  const priceHistory = marketItem.priceHistory;
  const currentPrice = priceHistory[priceHistory.length - 1];
  const previousPrice = priceHistory[priceHistory.length - 2];
  
  // Compare with a threshold to determine trend
  const priceDifference = currentPrice - previousPrice;
  const percentChange = (priceDifference / previousPrice) * 100;
  
  if (percentChange > 5) return 'rising';
  if (percentChange < -5) return 'falling';
  return 'stable';
};

// Resource demands for towns (fallback sample data)
const sampleDemands: Record<string, ResourceDemand[]> = {
  'elmhollow': [
    { resource: 'flower', demand: 80, trend: 'rising', price: 15 },
    { resource: 'root', demand: 40, trend: 'stable', price: 10 }
  ],
  'crystalvale': [
    { resource: 'crystal', demand: 70, trend: 'rising', price: 25 },
    { resource: 'essence', demand: 60, trend: 'falling', price: 22 }
  ],
  'mistport': [
    { resource: 'oil', demand: 85, trend: 'rising', price: 18 },
    { resource: 'mask', demand: 50, trend: 'stable', price: 20 }
  ],
  'dewvale': [
    { resource: 'herb', demand: 75, trend: 'stable', price: 12 },
    { resource: 'tonic', demand: 65, trend: 'rising', price: 16 }
  ],
  'embermere': [
    { resource: 'mask', demand: 90, trend: 'rising', price: 30 },
    { resource: 'herb', demand: 60, trend: 'falling', price: 14 }
  ]
};

const TownMap: React.FC<TownMapProps> = ({
  gameState,
  onNavigateToTown,
  onFulfillRequest,
  onNavigateToMarket,
  onNavigateToGarden,
  onNavigateToAtelier
}) => {
  const [selectedTown, setSelectedTown] = useState<Town | null>(null);
  const [hoveredTown, setHoveredTown] = useState<Town | null>(null);
  const [showTownDetails, setShowTownDetails] = useState<boolean>(false);
  const [demandFilter, setDemandFilter] = useState<string>('all');
  const [rumorOverlay, setRumorOverlay] = useState<boolean>(false);
  const [animation, setAnimation] = useState<boolean>(true);

  // Initialize town data
  // In a real implementation, town data would come from gameState
  // For now, we'll use our sample data as there is no towns property in gameState
  const towns = sampleTowns;
  const routes = sampleRoutes;
  
  // Convert market demand data from gameState format
  const demands: Record<string, ResourceDemand[]> = {};
  
  if (gameState?.market && gameState?.marketData) {
    // Group market items by town/region and extract demand info
    const marketByTown = gameState.townRequests.reduce((acc: Record<string, string[]>, request) => {
      if (!acc[request.requester]) {
        acc[request.requester] = [];
      }
      acc[request.requester].push(request.item);
      return acc;
    }, {});
    
    // For each town with requests, create demand entries
    Object.entries(marketByTown).forEach(([townName, items]) => {
      // Find town ID from name (simplified mapping)
      const townId = towns.find(t => 
        t.name.toLowerCase() === townName.toLowerCase())?.id || townName.toLowerCase().replace(/\s+/g, '');
      
      demands[townId] = items.map(itemName => {
        // Find corresponding market item
        const marketItem = gameState.market.find(m => m.name === itemName);
        const itemDemand = marketItem ? 
          (gameState.marketData.demand[marketItem.id] || 50) : 50;
        
        return {
          resource: itemName.toLowerCase().replace(/\s+/g, '_'),
          demand: itemDemand,
          trend: determineTrend(marketItem),
          price: marketItem?.price || 10
        };
      });
    });
  } else {
    // Fall back to sample data
    Object.assign(demands, sampleDemands);
  }

  // Get moon phase and season from gameState or defaults
  const moonPhase = gameState?.time?.phaseName || 'Full Moon';
  const season = gameState?.time?.season || 'Spring';
  const playerReputation = gameState?.players?.[0]?.reputation || 50;

  useEffect(() => {
    // Simulate trade route animations
    const animationTimer = setInterval(() => {
      setAnimation(prev => !prev);
    }, 1500);
    
    return () => clearInterval(animationTimer);
  }, []);

  // Handle town selection
  const handleTownClick = (town: Town) => {
    if (!town.unlocked) {
      // Show unlocking requirements message
      return;
    }
    
    setSelectedTown(town);
    setShowTownDetails(true);
  };

  // Handle travel to town
  const handleTravelToTown = () => {
    if (selectedTown) {
      onNavigateToTown(selectedTown.id);
      setShowTownDetails(false);
    }
  };

  // Calculate town connection line styles based on trade strength
  const getConnectionStyle = (route: TradeRoute) => {
    const locked = !route.unlocked;
    const baseColor = locked ? '#888' : '#6a3';
    const opacity = locked ? 0.4 : 0.8;
    const width = locked ? 2 : Math.max(2, route.strength / 2);
    
    return {
      stroke: baseColor,
      strokeWidth: width,
      strokeDasharray: route.type === 'river' ? '5,5' : (route.type === 'mountain' ? '2,2' : 'none'),
      opacity: opacity,
      animation: animation && route.unlocked ? 'flowAnimation 3s infinite' : 'none',
      animationDelay: `${route.strength * 100}ms`
    };
  };

  // Get town marker style based on wealth and specialization
  const getTownMarkerStyle = (town: Town) => {
    const size = town.wealth * 5 + 20;
    const townColors: Record<string, string> = {
      'Herbs': '#a3be8c',
      'Crystals': '#b48ead',
      'Oils': '#88c0d0',
      'Tonics': '#a3be8c',
      'Masks': '#ebcb8b',
    };
    const color = town.unlocked ? (townColors[town.specialization] || '#d8dee9') : '#4c566a';
    
    return {
      width: size,
      height: size,
      backgroundColor: color,
      opacity: town.unlocked ? 1 : 0.6,
      cursor: town.unlocked ? 'pointer' : 'not-allowed',
      border: '2px solid #2e3440',
      boxShadow: selectedTown?.id === town.id ? '0 0 10px #fff, 0 0 15px #5e81ac' : 'none'
    };
  };

  // Get demand indicator color based on demand level
  const getDemandIndicatorColor = (demand: number) => {
    if (demand >= 80) return '#bf616a'; // High demand - red
    if (demand >= 60) return '#ebcb8b'; // Medium demand - yellow
    return '#a3be8c'; // Low demand - green
  };

  // Render trend arrow
  const renderTrendArrow = (trend: string) => {
    if (trend === 'rising') return '↑';
    if (trend === 'falling') return '↓';
    return '→';
  };

  // Calculate if a route is beneficial based on supply/demand differences
  const isRouteBeneficial = (route: TradeRoute) => {
    if (!route.unlocked) return false;
    
    const fromTown = towns.find(t => t.id === route.from);
    const toTown = towns.find(t => t.id === route.to);
    
    if (!fromTown || !toTown) return false;
    
    // Check if there's a profitable trade opportunity between towns
    const fromTownDemands = demands[route.from] || [];
    const toTownDemands = demands[route.to] || [];
    
    for (const demand of toTownDemands) {
      if (demand.resource === fromTown.primaryResource || 
          demand.resource === fromTown.secondaryResource) {
        return demand.demand > 60; // Beneficial if demand is high
      }
    }
    
    return false;
  };

  return (
    <div className="town-map-container">
      <div className="town-map-header">
        <h1>County Map</h1>
        <div className="map-info">
          <span>{season} • {moonPhase}</span>
          <span>Reputation: {playerReputation}</span>
        </div>
      </div>
      
      <div className="town-map-filters">
        <button 
          className={demandFilter === 'all' ? 'active' : ''} 
          onClick={() => setDemandFilter('all')}
        >
          All Resources
        </button>
        <button 
          className={demandFilter === 'herb' ? 'active' : ''} 
          onClick={() => setDemandFilter('herb')}
        >
          Herbs
        </button>
        <button 
          className={demandFilter === 'flower' ? 'active' : ''} 
          onClick={() => setDemandFilter('flower')}
        >
          Flowers
        </button>
        <button 
          className={demandFilter === 'mask' ? 'active' : ''} 
          onClick={() => setDemandFilter('mask')}
        >
          Masks
        </button>
        <label>
          <input 
            type="checkbox" 
            checked={rumorOverlay}
            onChange={() => setRumorOverlay(!rumorOverlay)}
          />
          Show Rumors
        </label>
      </div>
      
      <div className="town-map">
        {/* Trade routes */}
        <svg className="trade-routes" width="600" height="400">
          {routes.map((route, index) => {
            const fromTown = towns.find(t => t.id === route.from);
            const toTown = towns.find(t => t.id === route.to);
            
            if (!fromTown || !toTown) return null;
            
            const isBeneficial = isRouteBeneficial(route);
            const connectionStyle = getConnectionStyle(route);
            
            return (
              <g key={`route-${index}`}>
                <line
                  x1={fromTown.x}
                  y1={fromTown.y}
                  x2={toTown.x}
                  y2={toTown.y}
                  style={connectionStyle}
                />
                {route.unlocked && isBeneficial && (
                  <circle
                    cx={(fromTown.x + toTown.x) / 2}
                    cy={(fromTown.y + toTown.y) / 2}
                    r="6"
                    fill="#ebcb8b"
                    className="trade-opportunity"
                  />
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Town markers */}
        <div className="town-markers">
          {towns.map(town => (
            <div
              key={town.id}
              className="town-marker"
              style={{
                left: town.x - 15,
                top: town.y - 15,
                ...getTownMarkerStyle(town)
              }}
              onClick={() => handleTownClick(town)}
              onMouseEnter={() => setHoveredTown(town)}
              onMouseLeave={() => setHoveredTown(null)}
            >
              <div className="town-icon">
                {town.specialization.charAt(0)}
              </div>
              {town.unlocked && (
                <div className="demand-indicators">
                  {demands[town.id]?.map((demand, i) => (
                    (demandFilter === 'all' || demandFilter === demand.resource) && (
                      <div 
                        key={i}
                        className="demand-indicator"
                        style={{ backgroundColor: getDemandIndicatorColor(demand.demand) }}
                        title={`${demand.resource}: ${demand.demand}%`}
                      >
                        {renderTrendArrow(demand.trend)}
                      </div>
                    )
                  ))}
                </div>
              )}
              <div className="town-label">{town.name}</div>
            </div>
          ))}
        </div>
        
        {/* Rumor overlay */}
        {rumorOverlay && (
          <div className="rumor-overlay">
            {gameState && gameState.rumors && gameState.rumors.length > 0 ? (
              // Map real rumors to visual hotspots on the map
              gameState.rumors
                .filter(rumor => rumor.verified && rumor.spread > 30)
                .map((rumor, index) => {
                  // Generate semi-random positions for the rumor hotspots
                  // In a real implementation, these might be based on the town positions or other factors
                  const baseX = 250 + (index * 50) % 300;
                  const baseY = 150 + (index * 40) % 200;
                  
                  return (
                    <div 
                      key={rumor.id} 
                      className="rumor-hotspot" 
                      style={{ left: baseX, top: baseY }}
                      title={rumor.content}
                    >
                      <div 
                        className="rumor-pulse"
                        style={{ 
                          animationDuration: `${Math.max(2, 6 - rumor.spread / 20)}s`,
                          backgroundColor: rumor.priceEffect && rumor.priceEffect > 0 ? '#a3be8c' : '#bf616a'
                        }}
                      ></div>
                      <div className="rumor-tooltip">
                        <p>{rumor.content}</p>
                      </div>
                    </div>
                  );
                })
            ) : (
              // Fallback to placeholder rumors
              <>
                <div className="rumor-hotspot" style={{ left: 250, top: 180 }}>
                  <div className="rumor-pulse"></div>
                  <div className="rumor-tooltip">
                    <p>Merchants say moonbud prices will rise with the next full moon.</p>
                  </div>
                </div>
                <div className="rumor-hotspot" style={{ left: 400, top: 120 }}>
                  <div className="rumor-pulse"></div>
                  <div className="rumor-tooltip">
                    <p>A blight is affecting herbs in the eastern region.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Hover tooltip */}
        {hoveredTown && !showTownDetails && (
          <div className="town-tooltip" style={{ left: hoveredTown.x + 20, top: hoveredTown.y }}>
            <h3>{hoveredTown.name}</h3>
            <p>{hoveredTown.unlocked ? hoveredTown.description : 'This town is currently locked.'}</p>
            {hoveredTown.unlocked && (
              <div className="town-tooltip-demands">
                <h4>Market Demands:</h4>
                <ul>
                  {demands[hoveredTown.id]?.map((demand, i) => (
                    <li key={i}>
                      {demand.resource}: {demand.demand}% ({renderTrendArrow(demand.trend)} {demand.price}g)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Town detail panel */}
      {showTownDetails && selectedTown && (
        <div className="town-detail-panel">
          <div className="town-detail-header">
            <h2>{selectedTown.name}</h2>
            <button className="close-button" onClick={() => setShowTownDetails(false)}>✕</button>
          </div>
          
          <div className="town-detail-content">
            <div className="town-image-placeholder">
              {/* Town image would go here */}
              <div className="town-specialization">
                {selectedTown.specialization} Specialist
              </div>
            </div>
            
            <p>{selectedTown.description}</p>
            
            <div className="town-metrics">
              <div className="metric">
                <span className="metric-label">Wealth:</span> 
                <span className="metric-value">{"★".repeat(selectedTown.wealth)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Reputation:</span> 
                <div className="reputation-bar">
                  <div 
                    className="reputation-filled" 
                    style={{ width: `${selectedTown.reputation}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="town-resources">
              <h3>Resources & Demands</h3>
              <div className="resources-grid">
                <div className="resource-column">
                  <h4>Produces</h4>
                  <ul>
                    <li>{selectedTown.primaryResource}</li>
                    <li>{selectedTown.secondaryResource}</li>
                  </ul>
                </div>
                <div className="resource-column">
                  <h4>Demands</h4>
                  <ul>
                    {demands[selectedTown.id]?.map((demand, i) => (
                      <li key={i} className="demand-item">
                        <span className="resource-name">{demand.resource}</span>
                        <span className={`trend ${demand.trend}`}>
                          {renderTrendArrow(demand.trend)}
                        </span>
                        <span className="price">{demand.price}g</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="town-requests">
              <h3>Town Requests</h3>
              {gameState && gameState.townRequests && gameState.townRequests.length > 0 ? (
                gameState.townRequests
                  .filter(request => 
                    // Filter requests by the selected town
                    request.requester.toLowerCase() === selectedTown.name.toLowerCase() && 
                    !request.completed
                  )
                  .map(request => (
                    <div className="request" key={request.id}>
                      <p>{request.description}</p>
                      <div className="request-details">
                        <span>Reward: {request.rewardGold}g, +{request.rewardInfluence} Rep</span>
                        <button 
                          className="fulfill-button" 
                          onClick={() => onFulfillRequest(request.id)}
                        >
                          Fulfill
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                // Fallback to sample data if no relevant requests exist
                <>
                  <div className="request">
                    <p>Healer Lyra needs 3 Silverleaf for a new tonic.</p>
                    <div className="request-details">
                      <span>Reward: 35g, +2 Rep</span>
                      <button className="fulfill-button" onClick={() => onFulfillRequest('request1')}>Fulfill</button>
                    </div>
                  </div>
                  <div className="request">
                    <p>Merchant Karam is seeking 1 Radiant Moon Mask.</p>
                    <div className="request-details">
                      <span>Reward: 65g, +3 Rep</span>
                      <button className="fulfill-button" onClick={() => onFulfillRequest('request2')}>Fulfill</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="town-actions">
              <button className="travel-button" onClick={handleTravelToTown}>
                Travel to {selectedTown.name}
              </button>
              <button onClick={onNavigateToMarket}>Market</button>
              <button onClick={onNavigateToGarden}>Garden</button>
              <button onClick={onNavigateToAtelier}>Atelier</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#bf616a' }}></div>
          <span>High Demand</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ebcb8b' }}></div>
          <span>Medium Demand</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#a3be8c' }}></div>
          <span>Low Demand</span>
        </div>
        <div className="legend-item">
          <div className="legend-line"></div>
          <span>Trade Route</span>
        </div>
        <div className="legend-item">
          <div className="legend-line" style={{ borderTop: '2px dashed #6a3' }}></div>
          <span>River Route</span>
        </div>
        <div className="legend-item">
          <div className="legend-circle"></div>
          <span>Trade Opportunity</span>
        </div>
      </div>
    </div>
  );
};

export default TownMap;