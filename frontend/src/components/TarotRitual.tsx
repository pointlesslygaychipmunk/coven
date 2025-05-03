import React, { useState, useEffect } from 'react';
import './TarotRitual.css';
import { TarotCard, InventoryItem, MoonPhase, Season } from 'coven-shared';
import { 
  Ritual, 
  CardPosition, 
  rituals, 
  findRitualById, 
  evaluateCardForPosition,
  calculateRitualPower,
  calculateRitualSuccess
} from 'coven-shared';
import { findCardById } from 'coven-shared';

// Props for the TarotRitual component
interface TarotRitualProps {
  playerInventory: InventoryItem[];
  playerMana: number;
  playerSkills: {
    herbalism: number;
    brewing: number;
    astrology: number;
  };
  currentMoonPhase: MoonPhase;
  currentSeason: Season;
  onPerformRitual: (
    ritualId: string, 
    cardIds: Record<CardPosition, string | null>,
    effects: any,
    manaUsed: number
  ) => void;
}

const TarotRitual: React.FC<TarotRitualProps> = ({
  playerInventory,
  playerMana,
  playerSkills,
  currentMoonPhase,
  currentSeason,
  onPerformRitual
}) => {
  // State for ritual selection
  const [selectedRitualId, setSelectedRitualId] = useState<string | null>(null);
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);
  const [ritualSearch, setRitualSearch] = useState<string>('');
  const [ritualTypeFilter, setRitualTypeFilter] = useState<string>('all');
  const [ritualElementFilter, setRitualElementFilter] = useState<string>('all');
  
  // State for card placement
  const [selectedCards, setSelectedCards] = useState<Record<CardPosition, string | null>>({
    center: null,
    north: null,
    east: null,
    south: null,
    west: null,
    northeast: null,
    southeast: null,
    southwest: null,
    northwest: null
  });
  
  // State for active position selection
  const [activePosition, setActivePosition] = useState<CardPosition | null>(null);
  
  // State for ritual calculations
  const [ritualPower, setRitualPower] = useState<number>(0);
  const [successChance, setSuccessChance] = useState<number>(0);
  const [potencyModifier, setPotencyModifier] = useState<number>(0);
  
  // State for UI effects
  const [ritualInProgress, setRitualInProgress] = useState<boolean>(false);
  const [ritualCompleted, setRitualCompleted] = useState<boolean>(false);
  const [ritualMessages, setRitualMessages] = useState<string[]>([]);
  const [showCardSelection, setShowCardSelection] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Get cards for each position
  const getCardForPosition = (position: CardPosition): TarotCard | null => {
    const cardId = selectedCards[position];
    if (!cardId) return null;
    
    const inventoryItem = playerInventory.find(item => item.id === cardId);
    if (!inventoryItem || !inventoryItem.tarotCardId) return null;
    
    return findCardById(inventoryItem.tarotCardId) || null;
  };
  
  // Calculate all ritual cards
  const ritualCards = {
    center: getCardForPosition('center'),
    north: getCardForPosition('north'),
    east: getCardForPosition('east'),
    south: getCardForPosition('south'),
    west: getCardForPosition('west'),
    northeast: getCardForPosition('northeast'),
    southeast: getCardForPosition('southeast'),
    southwest: getCardForPosition('southwest'),
    northwest: getCardForPosition('northwest')
  };
  
  // Update ritual calculations when cards or ritual changes
  useEffect(() => {
    if (!selectedRitual) {
      setRitualPower(0);
      setSuccessChance(0);
      setPotencyModifier(0);
      return;
    }
    
    // Calculate ritual power based on cards
    const power = calculateRitualPower(
      ritualCards,
      selectedRitual,
      currentMoonPhase,
      currentSeason
    );
    setRitualPower(power);
    
    // Determine relevant skill for this ritual
    let skillLevel = 1; // Default
    
    if (selectedRitual.primaryElement === 'Earth' || 
        selectedRitual.primaryElement === 'Water') {
      skillLevel = playerSkills.herbalism;
    } else if (selectedRitual.primaryElement === 'Fire') {
      skillLevel = playerSkills.brewing;
    } else if (selectedRitual.primaryElement === 'Air' || 
              selectedRitual.primaryElement === 'Spirit') {
      skillLevel = playerSkills.astrology;
    }
    
    // Calculate success chance and potency
    const { successChance, potencyModifier } = calculateRitualSuccess(power, skillLevel);
    setSuccessChance(successChance);
    setPotencyModifier(potencyModifier);
    
  }, [selectedRitual, selectedCards, currentMoonPhase, currentSeason, playerSkills, ritualCards]);
  
  // Update selected ritual when ritualId changes
  useEffect(() => {
    if (selectedRitualId) {
      const ritual = findRitualById(selectedRitualId);
      setSelectedRitual(ritual || null);
    } else {
      setSelectedRitual(null);
    }
  }, [selectedRitualId]);
  
  // Filter rituals based on search and filters
  const filteredRituals = rituals.filter(ritual => {
    // Text search
    if (ritualSearch && !ritual.name.toLowerCase().includes(ritualSearch.toLowerCase()) && 
        !ritual.description.toLowerCase().includes(ritualSearch.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (ritualTypeFilter !== 'all' && ritual.type !== ritualTypeFilter) {
      return false;
    }
    
    // Element filter
    if (ritualElementFilter !== 'all' && 
        ritual.primaryElement !== ritualElementFilter && 
        ritual.secondaryElement !== ritualElementFilter) {
      return false;
    }
    
    return true;
  });
  
  // Get available tarot cards from player inventory
  const getAvailableTarotCards = () => {
    return playerInventory
      .filter(item => item.tarotCardId && item.quantity > 0)
      .map(item => {
        const card = findCardById(item.tarotCardId!);
        return { inventoryItem: item, tarotCard: card };
      })
      .filter(item => item.tarotCard !== undefined);
  };
  
  // Handle selecting a ritual
  const handleSelectRitual = (ritualId: string) => {
    if (ritualInProgress) return;
    
    setSelectedRitualId(ritualId);
    
    // Reset card selections
    setSelectedCards({
      center: null,
      north: null,
      east: null,
      south: null,
      west: null,
      northeast: null,
      southeast: null,
      southwest: null,
      northwest: null
    });
    
    // Reset messages
    setRitualMessages([]);
  };
  
  // Handle selecting a position for card placement
  const handleSelectPosition = (position: CardPosition) => {
    if (ritualInProgress) return;
    
    setActivePosition(position);
    setShowCardSelection(true);
  };
  
  // Handle removing a card from a position
  const handleRemoveCard = (position: CardPosition) => {
    if (ritualInProgress) return;
    
    setSelectedCards(prev => ({
      ...prev,
      [position]: null
    }));
  };
  
  // Handle selecting a card for the active position
  const handleSelectCard = (cardId: string) => {
    if (!activePosition || ritualInProgress) return;
    
    // Check if card is already used in another position
    const isCardUsed = Object.entries(selectedCards).some(
      ([pos, id]) => id === cardId && pos !== activePosition
    );
    
    if (isCardUsed) {
      addRitualMessage("This card is already placed in another position");
      return;
    }
    
    // Place the card
    setSelectedCards(prev => ({
      ...prev,
      [activePosition]: cardId
    }));
    
    // Close the card selection panel
    setShowCardSelection(false);
    setActivePosition(null);
  };
  
  // Add a message to the ritual log
  const addRitualMessage = (message: string) => {
    setRitualMessages(prev => [...prev, message]);
  };
  
  // Check if all required positions have cards
  const areRequiredPositionsFilled = (): boolean => {
    if (!selectedRitual) return false;
    
    return selectedRitual.requirements.every(req => {
      return selectedCards[req.position] !== null;
    });
  };
  
  // Calculate card score for a position
  const getScoreForPosition = (position: CardPosition): number => {
    if (!selectedRitual) return 0;
    
    const card = ritualCards[position];
    if (!card) return 0;
    
    const requirement = selectedRitual.requirements.find(
      req => req.position === position
    );
    if (!requirement) return 0;
    
    return evaluateCardForPosition(card, requirement);
  };
  
  // Get color class based on score
  const getScoreColorClass = (score: number): string => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'poor';
    return 'bad';
  };
  
  // Start the ritual
  const handleStartRitual = () => {
    if (!selectedRitual || ritualInProgress || !areRequiredPositionsFilled()) return;
    
    // Check if player has enough mana
    if (playerMana < selectedRitual.manaCost) {
      addRitualMessage(`Not enough mana! Need ${selectedRitual.manaCost}, have ${playerMana}`);
      return;
    }
    
    // Start ritual animation
    setRitualInProgress(true);
    
    // Add initial message
    addRitualMessage(`Beginning the ${selectedRitual.name} ritual...`);
    
    // Simulate ritual process with timed messages
    setTimeout(() => {
      addRitualMessage("The cards begin to resonate with cosmic energy...");
    }, 1500);
    
    setTimeout(() => {
      if (selectedRitual.moonPhaseBonus === currentMoonPhase) {
        addRitualMessage(`The ${currentMoonPhase} amplifies the ritual's power!`);
      } else {
        addRitualMessage(`The cosmic energies flow through the arranged cards...`);
      }
    }, 3000);
    
    setTimeout(() => {
      if (selectedRitual.seasonBonus === currentSeason) {
        addRitualMessage(`The essence of ${currentSeason} strengthens your ritual!`);
      } else {
        addRitualMessage(`The elemental forces begin to manifest...`);
      }
    }, 4500);
    
    // Determine ritual success
    setTimeout(() => {
      const isSuccessful = Math.random() * 100 <= successChance;
      
      if (isSuccessful) {
        addRitualMessage(`Success! The ${selectedRitual.name} ritual is complete!`);
        
        // Call the onPerformRitual callback with results
        onPerformRitual(
          selectedRitual.id,
          selectedCards,
          {
            ritualPower,
            potencyModifier,
            success: true
          },
          selectedRitual.manaCost
        );
      } else {
        addRitualMessage("The energies falter and dissipate. The ritual has failed.");
        
        // Still consume mana even on failure
        onPerformRitual(
          selectedRitual.id,
          selectedCards,
          {
            ritualPower,
            potencyModifier,
            success: false
          },
          selectedRitual.manaCost
        );
      }
      
      // End ritual
      setRitualInProgress(false);
      setRitualCompleted(true);
    }, 6000);
  };
  
  // Reset the ritual
  const handleResetRitual = () => {
    setSelectedRitualId(null);
    setSelectedRitual(null);
    setSelectedCards({
      center: null,
      north: null,
      east: null,
      south: null,
      west: null,
      northeast: null,
      southeast: null,
      southwest: null,
      northwest: null
    });
    setRitualMessages([]);
    setRitualCompleted(false);
    setRitualInProgress(false);
  };
  
  // Render ritual selection panel
  const renderRitualSelection = () => {
    return (
      <div className="ritual-selection-panel">
        <h3>Available Rituals</h3>
        
        <div className="ritual-filters">
          <input
            type="text"
            placeholder="Search rituals..."
            value={ritualSearch}
            onChange={(e) => setRitualSearch(e.target.value)}
            className="ritual-search"
          />
          
          <div className="filter-group">
            <select 
              value={ritualTypeFilter} 
              onChange={(e) => setRitualTypeFilter(e.target.value)}
              className="ritual-type-filter"
            >
              <option value="all">All Types</option>
              <option value="growth">Growth</option>
              <option value="harvest">Harvest</option>
              <option value="weather">Weather</option>
              <option value="insight">Insight</option>
              <option value="blessing">Blessing</option>
              <option value="transmutation">Transmutation</option>
              <option value="harmony">Harmony</option>
              <option value="elemental">Elemental</option>
            </select>
            
            <select 
              value={ritualElementFilter} 
              onChange={(e) => setRitualElementFilter(e.target.value)}
              className="ritual-element-filter"
            >
              <option value="all">All Elements</option>
              <option value="Earth">Earth</option>
              <option value="Water">Water</option>
              <option value="Fire">Fire</option>
              <option value="Air">Air</option>
              <option value="Spirit">Spirit</option>
            </select>
          </div>
        </div>
        
        <div className="rituals-list">
          {filteredRituals.length === 0 ? (
            <div className="no-rituals">No rituals match your search</div>
          ) : (
            filteredRituals.map((ritual) => {
              const isSelected = selectedRitualId === ritual.id;
              const hasEnoughMana = playerMana >= ritual.manaCost;
              const isEmpowered = 
                ritual.moonPhaseBonus === currentMoonPhase || 
                ritual.seasonBonus === currentSeason;
              
              return (
                <div
                  key={ritual.id}
                  className={`ritual-item ${isSelected ? 'selected' : ''} ${!hasEnoughMana ? 'insufficient-mana' : ''} ${isEmpowered ? 'empowered' : ''}`}
                  onClick={() => hasEnoughMana && handleSelectRitual(ritual.id)}
                >
                  <div className="ritual-header">
                    <div className="ritual-name">{ritual.name}</div>
                    <div className="ritual-cost">
                      <span className="mana-icon">✨</span> {ritual.manaCost}
                    </div>
                  </div>
                  
                  <div className="ritual-description">{ritual.description}</div>
                  
                  <div className="ritual-details">
                    <div className="ritual-type">
                      Type: {ritual.type}
                    </div>
                    <div className="ritual-elements">
                      <span className={`element ${ritual.primaryElement.toLowerCase()}`}>
                        {ritual.primaryElement}
                      </span>
                      {ritual.secondaryElement && (
                        <span className={`element ${ritual.secondaryElement.toLowerCase()}`}>
                          {ritual.secondaryElement}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Show cosmic alignments */}
                  <div className="ritual-alignments">
                    {ritual.moonPhaseBonus && (
                      <div className={`ritual-moon ${ritual.moonPhaseBonus === currentMoonPhase ? 'active' : ''}`}>
                        {ritual.moonPhaseBonus}
                      </div>
                    )}
                    {ritual.seasonBonus && (
                      <div className={`ritual-season ${ritual.seasonBonus === currentSeason ? 'active' : ''}`}>
                        {ritual.seasonBonus}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };
  
  // Handle drag start for card selection
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("cardId", cardId);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    
    // Create a custom drag image if needed
    const dragImage = document.createElement('div');
    dragImage.className = 'custom-drag-image';
    dragImage.textContent = 'Card';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 25, 25);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };
  
  // Handle drag over for card position
  const handleDragOver = (e: React.DragEvent, position: CardPosition) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };
  
  // Handle drag leave for card position
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };
  
  // Handle drop for card position
  const handleDrop = (e: React.DragEvent, position: CardPosition) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    setIsDragging(false);
    
    const cardId = e.dataTransfer.getData("cardId");
    if (!cardId) return;
    
    // Check if card is already used in another position
    const isCardUsed = Object.entries(selectedCards).some(
      ([pos, id]) => id === cardId && pos !== position
    );
    
    if (isCardUsed) {
      addRitualMessage("This card is already placed in another position");
      return;
    }
    
    // Place the card
    setSelectedCards(prev => ({
      ...prev,
      [position]: cardId
    }));
    
    // Add a message about card placement
    const inventoryItem = playerInventory.find(item => item.id === cardId);
    if (inventoryItem && inventoryItem.tarotCardId) {
      const card = findCardById(inventoryItem.tarotCardId);
      if (card) {
        addRitualMessage(`Placed ${card.name} in the ${position} position`);
      }
    }
  };
  
  // Handle drag end to reset state
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  // Create connection lines between positions
  const createConnectorLines = () => {
    if (!selectedRitual) return null;
    
    const requiredPositions = selectedRitual.requirements.map(req => req.position);
    const filledPositions = Object.entries(selectedCards)
      .filter(([pos, cardId]) => cardId !== null && requiredPositions.includes(pos as CardPosition))
      .map(([pos]) => pos as CardPosition);
    
    if (filledPositions.length < 2) return null;
    
    // Always connect to center if it exists and is filled
    const hasCenter = filledPositions.includes('center');
    
    // Calculate connector lines
    const connectors = [];
    
    // Position coordinates lookup (percentages)
    const posCoords = {
      'center': { x: 50, y: 50 },
      'north': { x: 50, y: 10 },
      'east': { x: 90, y: 50 },
      'south': { x: 50, y: 90 },
      'west': { x: 10, y: 50 },
      'northeast': { x: 80, y: 20 },
      'southeast': { x: 80, y: 80 },
      'southwest': { x: 20, y: 80 },
      'northwest': { x: 20, y: 20 }
    };
    
    for (let i = 0; i < filledPositions.length; i++) {
      for (let j = i + 1; j < filledPositions.length; j++) {
        // Skip if not connecting to center and we have center
        if (hasCenter && 
            filledPositions[i] !== 'center' && 
            filledPositions[j] !== 'center') {
          continue;
        }
        
        const pos1 = filledPositions[i];
        const pos2 = filledPositions[j];
        
        const start = posCoords[pos1];
        const end = posCoords[pos2];
        
        // Calculate angle and length
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        connectors.push(
          <div
            key={`${pos1}-${pos2}`}
            className={`connector-line ${ritualInProgress ? 'active' : ''}`}
            style={{
              left: `${start.x}%`,
              top: `${start.y}%`,
              width: `${length}%`,
              transform: `rotate(${angle}deg)`
            }}
          />
        );
      }
    }
    
    return <div className="connector-lines">{connectors}</div>;
  };
  
  // Create energy beams between cards when ritual is active
  const createEnergyBeams = () => {
    if (!selectedRitual || !ritualInProgress) return null;
    
    const requiredPositions = selectedRitual.requirements.map(req => req.position);
    const filledPositions = Object.entries(selectedCards)
      .filter(([pos, cardId]) => cardId !== null && requiredPositions.includes(pos as CardPosition))
      .map(([pos]) => pos as CardPosition);
    
    // Position coordinates lookup (percentages)
    const posCoords = {
      'center': { x: 50, y: 50 },
      'north': { x: 50, y: 10 },
      'east': { x: 90, y: 50 },
      'south': { x: 50, y: 90 },
      'west': { x: 10, y: 50 },
      'northeast': { x: 80, y: 20 },
      'southeast': { x: 80, y: 80 },
      'southwest': { x: 20, y: 80 },
      'northwest': { x: 20, y: 20 }
    };
    
    // Always connect to center if it exists
    const hasCenter = filledPositions.includes('center');
    const beams = [];
    
    for (let i = 0; i < filledPositions.length; i++) {
      for (let j = i + 1; j < filledPositions.length; j++) {
        // If we have center, only connect to center
        if (hasCenter && 
            filledPositions[i] !== 'center' && 
            filledPositions[j] !== 'center') {
          continue;
        }
        
        const pos1 = filledPositions[i];
        const pos2 = filledPositions[j];
        
        const start = posCoords[pos1];
        const end = posCoords[pos2];
        
        // Calculate angle and length
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        beams.push(
          <div
            key={`beam-${pos1}-${pos2}`}
            className="energy-beam active"
            style={{
              left: `${start.x}%`,
              top: `${start.y}%`,
              width: `${length}%`,
              transform: `rotate(${angle}deg)`
            }}
          />
        );
      }
    }
    
    return beams;
  };
  
  // Create energy particles
  const createEnergyParticles = () => {
    if (!ritualInProgress) return null;
    
    const particles = [];
    for (let i = 0; i < 30; i++) {
      // Random starting position, always near center
      const startX = 45 + Math.random() * 10; // 45-55%
      const startY = 45 + Math.random() * 10; // 45-55%
      
      // Random ending position (anywhere in circle)
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 30; // 20-50% from center
      const endX = 50 + Math.cos(angle) * distance;
      const endY = 50 + Math.sin(angle) * distance;
      
      // Animation duration and delay
      const duration = 2 + Math.random() * 3; // 2-5s
      const delay = Math.random() * 2; // 0-2s
      
      particles.push(
        <div
          key={`particle-${i}`}
          className="particle"
          style={{
            left: `${startX}%`,
            top: `${startY}%`,
            '--tx': `${endX - startX}%`,
            '--ty': `${endY - startY}%`,
            animation: `particle-float ${duration}s ${delay}s infinite`
          } as React.CSSProperties}
        />
      );
    }
    
    return <div className={`energy-particles ${ritualInProgress ? 'active' : ''}`}>{particles}</div>;
  };

  // Render ritual circle with card positions
  const renderRitualCircle = () => {
    if (!selectedRitual) return null;
    
    // Get required positions for this ritual
    const requiredPositions = selectedRitual.requirements.map(req => req.position);
    
    return (
      <div className={`ritual-circle ${ritualInProgress ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}>
        {/* Connection lines between positions */}
        {createConnectorLines()}
        
        {/* Energy beams during ritual */}
        {createEnergyBeams()}
        
        {/* Energy particles */}
        {createEnergyParticles()}
        
        {/* Card positions */}
        {Object.entries(ritualCards).map(([position, card]) => {
          const pos = position as CardPosition;
          
          // Skip positions not used in this ritual
          if (!requiredPositions.includes(pos)) return null;
          
          // Get requirement for this position
          const requirement = selectedRitual.requirements.find(
            req => req.position === pos
          );
          
          // Calculate score if a card is placed
          const score = card ? getScoreForPosition(pos) : 0;
          const scoreClass = getScoreColorClass(score);
          
          return (
            <div
              key={position}
              className={`ritual-position ${pos} ${card ? 'filled' : 'empty'} ${activePosition === pos ? 'active' : ''} ${scoreClass}`}
              onClick={() => !ritualInProgress && handleSelectPosition(pos)}
              onDragOver={(e) => !ritualInProgress && handleDragOver(e, pos)}
              onDragLeave={(e) => !ritualInProgress && handleDragLeave(e)}
              onDrop={(e) => !ritualInProgress && handleDrop(e, pos)}
            >
              {card ? (
                <div className="placed-card">
                  <div className={`card-frame element-${card.element.toLowerCase()}`}>
                    <div className="card-name">{card.name}</div>
                    <div className="card-element">{card.element}</div>
                    <div className="card-rank">Rank {card.rank}</div>
                    
                    {!ritualInProgress && (
                      <button 
                        className="remove-card" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCard(pos);
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  {requirement && (
                    <div className={`position-score ${scoreClass}`}>
                      {score}%
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-position">
                  {requirement && (
                    <div className="position-requirement">
                      <div className="req-element">{requirement.element || 'Any'}</div>
                      {requirement.minimumRank && (
                        <div className="req-rank">Rank {requirement.minimumRank}+</div>
                      )}
                      <div className="drag-hint">Drag card here</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Ritual power indicators */}
        <div className="ritual-power-indicators">
          <div className="ritual-power">
            <div className="power-label">Ritual Power</div>
            <div className="power-bar">
              <div 
                className="power-fill" 
                style={{ width: `${ritualPower}%` }}
              ></div>
            </div>
          </div>
          
          <div className="ritual-success">
            <div className="success-label">Success Chance</div>
            <div className="success-value">{Math.round(successChance)}%</div>
          </div>
          
          <div className="ritual-potency">
            <div className="potency-label">Effect Potency</div>
            <div className="potency-value">{potencyModifier.toFixed(1)}x</div>
          </div>
        </div>
        
        {/* Ritual energy effects */}
        {ritualInProgress && (
          <>
            <div className="ritual-energy-center"></div>
            <div className="ritual-energy-rays"></div>
            <div className="ritual-energy-circle"></div>
          </>
        )}
      </div>
    );
  };
  
  // Render card selection panel
  const renderCardSelection = () => {
    if (!showCardSelection || !activePosition || !selectedRitual) return null;
    
    // Get all available tarot cards
    const availableCards = getAvailableTarotCards();
    
    // Get the requirement for this position
    const requirement = selectedRitual.requirements.find(
      req => req.position === activePosition
    );
    
    // Calculate scores for each card
    const cardsWithScores = availableCards.map(({ inventoryItem, tarotCard }) => {
      if (!tarotCard) return null;
      
      const score = requirement 
        ? evaluateCardForPosition(tarotCard, requirement)
        : 0;
        
      const isUsed = Object.values(selectedCards).includes(inventoryItem.id);
      
      return {
        inventoryItem,
        tarotCard,
        score,
        isUsed
      };
    }).filter(Boolean);
    
    // Sort by score, highest first
    cardsWithScores.sort((a, b) => b!.score - a!.score);
    
    return (
      <div className="card-selection-overlay">
        <div className="card-selection-panel">
          <h3>Select a Card for {activePosition.charAt(0).toUpperCase() + activePosition.slice(1)} Position</h3>
          <div className="drag-drop-tip">
            <span className="tip-icon">💡</span> 
            TIP: You can click a card to select it, or drag cards to positions on the ritual circle
          </div>
          
          {requirement && (
            <div className="position-requirements">
              <h4>Position Requirements:</h4>
              <ul>
                {requirement.element && (
                  <li>Element: <span className={`element ${requirement.element.toLowerCase()}`}>{requirement.element}</span></li>
                )}
                {requirement.minimumRank && (
                  <li>Minimum Rank: {requirement.minimumRank}</li>
                )}
                {requirement.specificCard && (
                  <li>Specific Card: {requirement.specificCard}</li>
                )}
                {requirement.category && (
                  <li>Category: {requirement.category}</li>
                )}
                {requirement.type && (
                  <li>Type: {requirement.type}</li>
                )}
              </ul>
            </div>
          )}
          
          <div className="cards-grid">
            {cardsWithScores.map(item => {
              if (!item || !item.tarotCard) return null;
              
              const { inventoryItem, tarotCard, score, isUsed } = item;
              const scoreClass = getScoreColorClass(score);
              
              return (
                <div
                  key={inventoryItem.id}
                  className={`selectable-card ${scoreClass} ${isUsed ? 'used' : ''}`}
                  onClick={() => !isUsed && handleSelectCard(inventoryItem.id)}
                  draggable={!isUsed}
                  onDragStart={(e) => !isUsed && handleDragStart(e, inventoryItem.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={`card-frame element-${tarotCard.element.toLowerCase()}`}>
                    <div className="card-image" style={{ 
                      backgroundImage: `url(${tarotCard.artworkPath || '/assets/cards/placeholder.png'})` 
                    }}></div>
                    <div className="card-name">{tarotCard.name}</div>
                    <div className="card-details">
                      <div className="card-element">{tarotCard.element}</div>
                      <div className="card-rank">Rank {tarotCard.rank}</div>
                    </div>
                    <div className="card-score">{score}%</div>
                  </div>
                  
                  {isUsed && (
                    <div className="card-used-overlay">Already Used</div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="selection-actions">
            <button 
              className="cancel-selection" 
              onClick={() => {
                setShowCardSelection(false);
                setActivePosition(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render ritual log
  const renderRitualLog = () => {
    return (
      <div className="ritual-log">
        <h3>Ritual Log</h3>
        <div className="log-messages">
          {ritualMessages.length === 0 ? (
            <div className="empty-log">Select a ritual and place cards to begin...</div>
          ) : (
            <div className="message-list">
              {ritualMessages.map((message, index) => (
                <div key={index} className="log-message">
                  <div className="message-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="message-text">{message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="tarot-ritual-container">
      <div className="ritual-header">
        <h2>Tarot Card Rituals</h2>
        <div className="player-mana">
          <span className="mana-label">Mana:</span>
          <span className="mana-value">{playerMana}</span>
        </div>
        <div className="cosmic-info">
          <div className="moon-phase">
            <span className="phase-label">Moon:</span>
            <span className="phase-value">{currentMoonPhase}</span>
          </div>
          <div className="season">
            <span className="season-label">Season:</span>
            <span className="season-value">{currentSeason}</span>
          </div>
        </div>
      </div>
      
      <div className="ritual-container">
        {!selectedRitual ? (
          renderRitualSelection()
        ) : (
          <div className="active-ritual">
            <div className="ritual-title">
              <h3>{selectedRitual.name}</h3>
              <div className="ritual-elements">
                <span className={`element ${selectedRitual.primaryElement.toLowerCase()}`}>
                  {selectedRitual.primaryElement}
                </span>
                {selectedRitual.secondaryElement && (
                  <span className={`element ${selectedRitual.secondaryElement.toLowerCase()}`}>
                    {selectedRitual.secondaryElement}
                  </span>
                )}
              </div>
              
              {!ritualInProgress && !ritualCompleted && (
                <button 
                  className="back-button" 
                  onClick={handleResetRitual}
                >
                  ← Back to Rituals
                </button>
              )}
            </div>
            
            <div className="ritual-description">
              {selectedRitual.description}
            </div>
            
            <div className="ritual-workspace">
              {renderRitualCircle()}
              {renderRitualLog()}
            </div>
            
            <div className="ritual-actions">
              {!ritualInProgress && !ritualCompleted ? (
                <button
                  className="perform-ritual"
                  disabled={!areRequiredPositionsFilled() || playerMana < selectedRitual.manaCost}
                  onClick={handleStartRitual}
                >
                  Perform Ritual (Mana: {selectedRitual.manaCost})
                </button>
              ) : ritualCompleted ? (
                <button
                  className="new-ritual"
                  onClick={handleResetRitual}
                >
                  Prepare New Ritual
                </button>
              ) : (
                <div className="ritual-progress">Ritual in progress...</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {renderCardSelection()}
    </div>
  );
};

export default TarotRitual;