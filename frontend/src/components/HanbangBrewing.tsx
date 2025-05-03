import React, { useState, useEffect, useRef } from 'react';
import './HanbangBrewing.css';
import { 
  TarotCard,
  MoonPhase, 
  Season,
  ElementType,
  InventoryItem
} from 'coven-shared';
import {
  BrewingMethod,
  methodToProductType,
  brewingMethodElements,
  brewingMechanics,
  calculateCompatibility,
  determineIdealMethod,
  calculateBrewingQuality,
  generateProductName,
  generateProductDescription,
  calculateBrewingTime,
  BrewingResult,
  HanbangBrewingProps
} from '../utils/hanbangBrewingTypes';
import LunarPhaseIcon from './LunarPhaseIcon';
import { findCardById } from '../utils/tarotCardMocks';

// We're now using imported types - no local redefinitions needed

const HanbangBrewing: React.FC<HanbangBrewingProps> = ({
  playerInventory,
  playerMana,
  brewingSkillLevel = 1,
  moonPhase,
  season,
  onBrew,
  onUpdateMana
}) => {
  // States for brewing
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<InventoryItem[]>([]);
  const [tarotCards, setTarotCards] = useState<TarotCard[]>([]);
  const [activeMethod, setActiveMethod] = useState<BrewingMethod>('Infusion');
  const [compatibilities, setCompatibilities] = useState<number[][]>([]);
  const [brewingResult, setBrewingResult] = useState<BrewingResult | null>(null);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [elementFilter, setElementFilter] = useState<ElementType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [brewingProgress, setBrewingProgress] = useState<number>(0);
  const [brewingTime, setBrewingTime] = useState<number>(0);
  const [qualityPreview, setQualityPreview] = useState<number>(0);
  const [manaRequired, setManaRequired] = useState<number>(0);
  const [showCardDetails, setShowCardDetails] = useState<string | null>(null);
  
  // Animation states
  const [potionColor, setPotionColor] = useState<string>('#88c0d0');
  const [bubbleAnimation, setBubbleAnimation] = useState<boolean>(false);
  const [cauldronShake, setCauldronShake] = useState<boolean>(false);
  const [showFumes, setShowFumes] = useState<boolean>(false);
  const [cardRotations, setCardRotations] = useState<Record<string, number>>({});
  
  // Refs for brewing animation
  const brewingTimerRef = useRef<number | null>(null);
  
  // Whispers and ambient effects
  const [showWhisper, setShowWhisper] = useState<string | null>(null);
  const whisperTimeoutRef = useRef<number | null>(null);

  // Filter inventory when category changes
  useEffect(() => {
    let filtered = [...playerInventory];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    // Apply element filter if applicable
    if (elementFilter !== 'all') {
      filtered = filtered.filter(item => {
        const card = findCardById(item.tarotCardId);
        return card?.element === elementFilter;
      });
    }
    
    // Apply search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) || 
        (item.description && item.description.toLowerCase().includes(term))
      );
    }
    
    // Sort by category then by name
    filtered.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
    
    setFilteredInventory(filtered);
  }, [playerInventory, categoryFilter, elementFilter, searchTerm]);
  
  // Update selected cards whenever selection changes
  useEffect(() => {
    const cards = selectedCardIds.map(id => 
      playerInventory.find(item => item.id === id)
    ).filter(Boolean) as InventoryItem[];
    
    setSelectedCards(cards);
    
    // Get corresponding tarot cards
    const tarot = cards.map(item => findCardById(item.tarotCardId))
      .filter(Boolean) as TarotCard[];
    
    setTarotCards(tarot);
    
    // Calculate compatibilities between cards
    if (tarot.length > 1) {
      const compat: number[][] = Array(tarot.length).fill(0).map(() => Array(tarot.length).fill(0));
      
      for (let i = 0; i < tarot.length; i++) {
        for (let j = 0; j < tarot.length; j++) {
          if (i === j) {
            compat[i][j] = 100; // Perfect compatibility with self
          } else if (i < j) {
            compat[i][j] = calculateCompatibility([tarot[i]], activeMethod);
            compat[j][i] = compat[i][j]; // Symmetric
          }
        }
      }
      
      setCompatibilities(compat);
    } else {
      setCompatibilities([]);
    }
    
    // Determine the ideal brewing method
    if (tarot.length > 0) {
      const ideal = determineIdealMethod(tarot);
      if (ideal) {
        setActiveMethod(ideal);
      }
      
      // Calculate preliminary quality
      const quality = calculateBrewingQuality(
        tarot, 
        activeMethod,
        brewingSkillLevel
      );
      
      setQualityPreview(quality);
      
      // Calculate brewing time
      const time = calculateBrewingTime(tarot, activeMethod, brewingSkillLevel);
      setBrewingTime(time);
      
      // Calculate mana requirement
      const baseMana = brewingMechanics[activeMethod].manaRequirement;
      // More cards, higher ranks, and better quality all increase mana needs
      const manaMultiplier = (tarot.length / 2) * 
        (tarot.reduce((sum, card) => sum + card.rank, 0) / (tarot.length * 5)) * 
        (quality / 50);
      
      const mana = Math.round(baseMana * manaMultiplier);
      setManaRequired(mana);
    } else {
      setQualityPreview(0);
      setBrewingTime(0);
      setManaRequired(0);
    }
    
    // Set random card rotations for visual interest
    const rotations: Record<string, number> = {};
    selectedCardIds.forEach(id => {
      rotations[id] = Math.random() * 10 - 5; // -5 to +5 degrees
    });
    setCardRotations(rotations);
    
  }, [selectedCardIds, playerInventory, activeMethod, moonPhase, season, brewingSkillLevel]);
  
  // Handle selecting a card
  const handleSelectCard = (cardId: string) => {
    const card = playerInventory.find(item => item.id === cardId);
    if (!card) return;
    
    // Check if already selected
    if (selectedCardIds.includes(cardId)) {
      setSelectedCardIds(prev => prev.filter(id => id !== cardId));
      return;
    }
    
    // Check if we've reached the maximum cards for this method
    const maxCards = brewingMechanics[activeMethod].maximumCards;
    if (selectedCardIds.length >= maxCards) {
      // Show message about max cards
      showWhisperMessage(`You can only use ${maxCards} ingredients with ${activeMethod}`);
      return;
    }
    
    // Add the card
    setSelectedCardIds(prev => [...prev, cardId]);
    
    // Show a whisper about the card
    const tarotCard = findCardById(card.tarotCardId);
    if (tarotCard) {
      const elementMatch = tarotCard.element === brewingMethodElements[activeMethod];
      if (elementMatch) {
        showWhisperMessage(`The ${tarotCard.element} energy harmonizes perfectly with ${activeMethod}...`);
      } else {
        showWhisperMessage(`You add ${tarotCard.name} to your ${activeMethod}...`);
      }
    }
  };
  
  // Handle changing brewing method
  const handleChangeMethod = (method: BrewingMethod) => {
    setActiveMethod(method);
    
    // Check if we have too many ingredients for the new method
    const maxCards = brewingMechanics[method].maximumCards;
    if (selectedCardIds.length > maxCards) {
      // Remove excess cards
      setSelectedCardIds(prev => prev.slice(0, maxCards));
      showWhisperMessage(`Some ingredients were removed as ${method} only supports ${maxCards} ingredients`);
    }
    
    // Change cauldron color based on method
    switch (method) {
      case 'Infusion':
        setPotionColor('#88c0d0'); // Blue
        break;
      case 'Fermentation':
        setPotionColor('#a3be8c'); // Green
        break;
      case 'Distillation':
        setPotionColor('#bf616a'); // Red
        break;
      case 'Crystallization':
        setPotionColor('#b48ead'); // Purple
        break;
    }
    
    // Show whisper about method
    showWhisperMessage(`You prepare for ${method}...`);
  };
  
  // Handle starting the brewing process
  const handleStartBrewing = () => {
    if (selectedCardIds.length === 0) {
      showWhisperMessage("You need to select ingredients first!");
      return;
    }
    
    // Check if we have enough ingredients
    const minCards = brewingMechanics[activeMethod].minimumCards;
    if (selectedCardIds.length < minCards) {
      showWhisperMessage(`You need at least ${minCards} ingredients for ${activeMethod}`);
      return;
    }
    
    // Check if player has enough mana
    if (playerMana < manaRequired) {
      showWhisperMessage(`You need ${manaRequired} mana for this brewing process!`);
      return;
    }
    
    // Start brewing animation
    setIsBrewing(true);
    setBrewingProgress(0);
    setBubbleAnimation(true);
    
    // Deduct mana
    onUpdateMana(playerMana - manaRequired);
    
    // Show starting message
    showWhisperMessage(`Beginning the ${activeMethod} process...`);
    
    // Start progress timer
    let progress = 0;
    const totalSteps = 100;
    const stepTime = (brewingTime * 1000) / totalSteps;
    
    const timer = window.setInterval(() => {
      progress += 1;
      setBrewingProgress(progress);
      
      // Add animations at certain points
      if (progress === 25) {
        setCauldronShake(true);
        setTimeout(() => setCauldronShake(false), 1000);
        showWhisperMessage("The mixture begins to transform...");
      }
      
      if (progress === 50) {
        setShowFumes(true);
        setTimeout(() => setShowFumes(false), 2000);
        showWhisperMessage("A fragrant aroma fills the air...");
      }
      
      if (progress === 75) {
        setCauldronShake(true);
        setShowFumes(true);
        setTimeout(() => {
          setCauldronShake(false);
          setShowFumes(false);
        }, 1500);
        showWhisperMessage("The process is nearly complete...");
      }
      
      if (progress >= totalSteps) {
        // Brewing complete
        clearInterval(timer);
        brewingTimerRef.current = null;
        handleBrewingComplete();
      }
    }, stepTime);
    
    brewingTimerRef.current = timer;
  };
  
  // Handle completing the brewing process
  const handleBrewingComplete = () => {
    setBubbleAnimation(false);
    setIsBrewing(false);
    
    // Calculate final product quality
    const quality = calculateBrewingQuality(
      tarotCards, 
      activeMethod,
      brewingSkillLevel
    );
    
    // Generate product name and description
    const productName = generateProductName(tarotCards, activeMethod, quality);
    const description = generateProductDescription(tarotCards, activeMethod, quality);
    
    // Create brewing result
    const result: BrewingResult = {
      productName,
      description,
      quality,
      method: activeMethod,
      ingredientIds: selectedCardIds,
      moonPhase,
      season,
      element: brewingMethodElements[activeMethod],
      brewTime: brewingTime,
      manaUsed: manaRequired
    };
    
    setBrewingResult(result);
    
    // Show completion message
    showWhisperMessage(`You've created ${productName}!`);
    
    // Notify parent component of brewing completion
    onBrew(selectedCardIds, activeMethod, quality, manaRequired);
    
    // Clear selections after a delay
    setTimeout(() => {
      setSelectedCardIds([]);
      setBrewingResult(null);
    }, 5000);
  };
  
  // Handle canceling brewing
  const handleCancelBrewing = () => {
    if (brewingTimerRef.current) {
      clearInterval(brewingTimerRef.current);
      brewingTimerRef.current = null;
    }
    
    setIsBrewing(false);
    setBubbleAnimation(false);
    setShowFumes(false);
    setCauldronShake(false);
    setBrewingProgress(0);
    
    // Return some of the mana (penalty for canceling)
    const returnedMana = Math.floor(manaRequired * 0.7);
    onUpdateMana(playerMana + returnedMana);
    
    showWhisperMessage("Brewing canceled. Some mana has been returned.");
  };
  
  // Handle clearing all selected cards
  const handleClearSelection = () => {
    setSelectedCardIds([]);
    showWhisperMessage("Workbench cleared...");
  };
  
  // Show whisper message with auto-clear
  const showWhisperMessage = (message: string) => {
    // Clear existing timeout
    if (whisperTimeoutRef.current) {
      clearTimeout(whisperTimeoutRef.current);
    }
    
    setShowWhisper(message);
    
    // Auto-clear after 4 seconds
    whisperTimeoutRef.current = window.setTimeout(() => {
      setShowWhisper(null);
      whisperTimeoutRef.current = null;
    }, 4000);
  };
  
  // Generate color based on quality
  const getQualityColor = (quality: number) => {
    if (quality >= 90) return '#eb9234'; // Legendary orange
    if (quality >= 75) return '#b48ead'; // Epic purple
    if (quality >= 60) return '#5e81ac'; // Rare blue
    if (quality >= 45) return '#a3be8c'; // Uncommon green
    return '#d8dee9'; // Common white/grey
  };
  
  // Render icon for card element
  const renderElementIcon = (element: ElementType) => {
    switch (element) {
      case 'Water': return '💧';
      case 'Earth': return '🌱';
      case 'Fire': return '🔥';
      case 'Air': return '💨';
      case 'Spirit': return '✨';
      default: return '❓';
    }
  };
  
  // Render compatibility indicator between cards
  const renderCompatibility = (cardIndex1: number, cardIndex2: number) => {
    if (compatibilities.length === 0 || !compatibilities[cardIndex1] || !compatibilities[cardIndex1][cardIndex2]) {
      return null;
    }
    
    const compat = compatibilities[cardIndex1][cardIndex2];
    let color = '#d8dee9'; // Default
    
    if (compat >= 80) color = '#a3be8c'; // Good - green
    else if (compat >= 60) color = '#ebcb8b'; // Okay - yellow
    else if (compat <= 30) color = '#bf616a'; // Bad - red
    
    return (
      <div 
        className="compatibility-line" 
        style={{
          backgroundColor: color,
          opacity: compat / 100
        }}
      />
    );
  };
  
  return (
    <div className="hanbang-brewing-container">
      {/* Header with lunar phase */}
      <div className="brewing-header">
        <h1>Hanbang Brewing</h1>
        <div className="brewing-lunar-info">
          <LunarPhaseIcon phase={moonPhase} />
          <span>{moonPhase}</span>
          <span className="brewing-season">{season}</span>
        </div>
      </div>
      
      {/* Method selection */}
      <div className="brewing-methods">
        {Object.entries(brewingMechanics).map(([method, info]) => (
          <button 
            key={method}
            className={`method-button ${activeMethod === method ? 'active' : ''} method-${method.toLowerCase()}`}
            onClick={() => handleChangeMethod(method as BrewingMethod)}
            disabled={isBrewing}
          >
            <div className="method-icon">
              {renderElementIcon(brewingMethodElements[method as BrewingMethod])}
            </div>
            <div className="method-name">{method}</div>
            <div className="method-product">{methodToProductType[method as BrewingMethod]}</div>
          </button>
        ))}
      </div>
      
      {/* Main content area */}
      <div className="brewing-content">
        {/* Left side - Ingredient Selection */}
        <div className="ingredient-panel">
          <div className="ingredient-filters">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search ingredients..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isBrewing}
              />
            </div>
            
            <div className="filter-buttons">
              <button 
                className={categoryFilter === 'all' ? 'active' : ''}
                onClick={() => setCategoryFilter('all')}
                disabled={isBrewing}
              >
                All
              </button>
              <button 
                className={categoryFilter === 'herb' ? 'active' : ''}
                onClick={() => setCategoryFilter('herb')}
                disabled={isBrewing}
              >
                Herbs
              </button>
              <button 
                className={categoryFilter === 'flower' ? 'active' : ''}
                onClick={() => setCategoryFilter('flower')}
                disabled={isBrewing}
              >
                Flowers
              </button>
              <button 
                className={categoryFilter === 'root' ? 'active' : ''}
                onClick={() => setCategoryFilter('root')}
                disabled={isBrewing}
              >
                Roots
              </button>
              <button 
                className={categoryFilter === 'crystal' ? 'active' : ''}
                onClick={() => setCategoryFilter('crystal')}
                disabled={isBrewing}
              >
                Crystals
              </button>
            </div>
            
            <div className="element-filters">
              <button 
                className={`element-button ${elementFilter === 'all' ? 'active' : ''}`}
                onClick={() => setElementFilter('all')}
                disabled={isBrewing}
              >
                All
              </button>
              <button 
                className={`element-button water ${elementFilter === 'Water' ? 'active' : ''}`}
                onClick={() => setElementFilter('Water')}
                disabled={isBrewing}
              >
                Water
              </button>
              <button 
                className={`element-button earth ${elementFilter === 'Earth' ? 'active' : ''}`}
                onClick={() => setElementFilter('Earth')}
                disabled={isBrewing}
              >
                Earth
              </button>
              <button 
                className={`element-button fire ${elementFilter === 'Fire' ? 'active' : ''}`}
                onClick={() => setElementFilter('Fire')}
                disabled={isBrewing}
              >
                Fire
              </button>
              <button 
                className={`element-button air ${elementFilter === 'Air' ? 'active' : ''}`}
                onClick={() => setElementFilter('Air')}
                disabled={isBrewing}
              >
                Air
              </button>
              <button 
                className={`element-button spirit ${elementFilter === 'Spirit' ? 'active' : ''}`}
                onClick={() => setElementFilter('Spirit')}
                disabled={isBrewing}
              >
                Spirit
              </button>
            </div>
          </div>
          
          <div className="ingredient-scrollbox">
            {filteredInventory.length === 0 ? (
              <p className="no-ingredients">No ingredients matching your filters.</p>
            ) : (
              filteredInventory.map(item => {
                const tarotCard = findCardById(item.tarotCardId);
                const isSelected = selectedCardIds.includes(item.id);
                const isSelectable = !isSelected && 
                  item.quantity > 0 && 
                  selectedCardIds.length < brewingMechanics[activeMethod].maximumCards &&
                  !isBrewing;
                
                return (
                  <div 
                    key={item.id}
                    className={`ingredient-card ${isSelected ? 'selected' : ''} ${!isSelectable ? 'disabled' : ''}`}
                    onClick={() => isSelectable ? handleSelectCard(item.id) : null}
                    onMouseEnter={() => setShowCardDetails(item.id)}
                    onMouseLeave={() => setShowCardDetails(null)}
                  >
                    <div className={`card-element ${tarotCard?.element?.toLowerCase() || 'unknown'}`}>
                      {tarotCard ? renderElementIcon(tarotCard.element) : '❓'}
                    </div>
                    <div className="card-image" style={{
                      backgroundImage: `url(${item.imagePath || '/assets/cards/placeholder.png'})`
                    }}></div>
                    <div className="card-info">
                      <div className="card-name">{item.name}</div>
                      <div className="card-category">{item.category}</div>
                    </div>
                    <div className="card-quantity">x{item.quantity}</div>
                    
                    {/* Card details on hover */}
                    {showCardDetails === item.id && tarotCard && (
                      <div className="card-tooltip">
                        <h4>{tarotCard.name}</h4>
                        <p>{tarotCard.description}</p>
                        <div className="tooltip-properties">
                          <div><strong>Element:</strong> {tarotCard.element}</div>
                          <div><strong>Moon:</strong> {tarotCard.moonPhaseAffinity}</div>
                          <div><strong>Season:</strong> {tarotCard.seasonAffinity}</div>
                          <div><strong>Rank:</strong> {tarotCard.rank}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Center - Brewing Area */}
        <div className="brewing-area">
          <div className="method-info">
            <h3>{activeMethod}</h3>
            <p>{brewingMechanics[activeMethod].description}</p>
            
            <div className="brewing-requirements">
              <div><strong>Ingredients:</strong> {selectedCardIds.length}/{brewingMechanics[activeMethod].maximumCards}</div>
              <div><strong>Mana Required:</strong> {manaRequired}</div>
              <div><strong>Product Type:</strong> {methodToProductType[activeMethod]}</div>
              <div><strong>Brewing Time:</strong> {brewingTime} turns</div>
            </div>
          </div>
          
          {/* Cauldron/brewing visualization */}
          <div className={`brewing-apparatus ${activeMethod.toLowerCase()} ${cauldronShake ? 'shake' : ''}`}>
            <div className="apparatus-container">
              {activeMethod === 'Infusion' && (
                <div className="infusion-pot">
                  <div 
                    className={`potion-liquid ${bubbleAnimation ? 'bubbling' : ''}`}
                    style={{ backgroundColor: potionColor }}
                  ></div>
                  {showFumes && <div className="fumes"></div>}
                </div>
              )}
              
              {activeMethod === 'Fermentation' && (
                <div className="fermentation-jar">
                  <div 
                    className={`ferment-contents ${bubbleAnimation ? 'bubbling' : ''}`}
                    style={{ backgroundColor: potionColor }}
                  ></div>
                  {showFumes && <div className="fumes"></div>}
                </div>
              )}
              
              {activeMethod === 'Distillation' && (
                <div className="distillation-alembic">
                  <div 
                    className={`alembic-contents ${bubbleAnimation ? 'boiling' : ''}`}
                    style={{ backgroundColor: potionColor }}
                  ></div>
                  {showFumes && <div className="steam"></div>}
                </div>
              )}
              
              {activeMethod === 'Crystallization' && (
                <div className="crystal-chamber">
                  <div 
                    className={`crystal-energy ${bubbleAnimation ? 'pulsing' : ''}`}
                    style={{ backgroundColor: potionColor }}
                  ></div>
                  {showFumes && <div className="sparkles"></div>}
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            {isBrewing && (
              <div className="brewing-progress-container">
                <div 
                  className="brewing-progress-bar"
                  style={{ width: `${brewingProgress}%` }}
                ></div>
                <div className="brewing-progress-text">
                  {`${brewingProgress}%`}
                </div>
              </div>
            )}
          </div>
          
          {/* Selected cards for brewing */}
          <div className="selected-cards">
            {selectedCardIds.map((id, index) => {
              const item = playerInventory.find(item => item.id === id);
              if (!item) return null;
              
              const tarotCard = findCardById(item.tarotCardId);
              if (!tarotCard) return null;
              
              return (
                <div 
                  key={id}
                  className="selected-card"
                  style={{ 
                    transform: `rotate(${cardRotations[id] || 0}deg)`,
                    zIndex: selectedCardIds.length - index 
                  }}
                >
                  <div className={`card-frame element-${tarotCard.element.toLowerCase()}`}>
                    <div className="card-image" style={{
                      backgroundImage: `url(${item.imagePath || '/assets/cards/placeholder.png'})`
                    }}></div>
                    <div className="card-name">{tarotCard.name}</div>
                    
                    {/* Show element connections between cards */}
                    {selectedCardIds.length > 1 && index < selectedCardIds.length - 1 && (
                      renderCompatibility(index, index + 1)
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Placeholder for empty slots */}
            {selectedCardIds.length < brewingMechanics[activeMethod].maximumCards && !isBrewing && (
              Array(brewingMechanics[activeMethod].maximumCards - selectedCardIds.length).fill(0).map((_, i) => (
                <div key={`empty-${i}`} className="card-placeholder">
                  <div className="placeholder-text">+</div>
                </div>
              ))
            )}
          </div>
          
          {/* Quality preview */}
          {selectedCardIds.length > 0 && (
            <div className="quality-preview">
              <div className="quality-label">Expected Quality:</div>
              <div 
                className="quality-meter"
                style={{ backgroundColor: getQualityColor(qualityPreview) }}
              >
                <div className="quality-value">{qualityPreview}%</div>
              </div>
            </div>
          )}
          
          {/* Brewing actions */}
          <div className="brewing-actions">
            {!isBrewing ? (
              <>
                <button 
                  className="action-button brew"
                  onClick={handleStartBrewing}
                  disabled={
                    selectedCardIds.length < brewingMechanics[activeMethod].minimumCards ||
                    playerMana < manaRequired
                  }
                >
                  Start {activeMethod}
                </button>
                
                <button 
                  className="action-button clear"
                  onClick={handleClearSelection}
                  disabled={selectedCardIds.length === 0}
                >
                  Clear All
                </button>
              </>
            ) : (
              <button 
                className="action-button cancel"
                onClick={handleCancelBrewing}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        
        {/* Right side - Method Info & Recipe Book */}
        <div className="brewing-sidebar">
          <div className="method-details">
            <h3>{brewingMechanics[activeMethod].name}</h3>
            <div className="method-element">
              {renderElementIcon(brewingMechanics[activeMethod].element)} 
              {brewingMechanics[activeMethod].element} Element
            </div>
            
            <div className="method-affinity">
              <div>
                <strong>Favored Moon:</strong> {brewingMechanics[activeMethod].moonPhaseBonus}
              </div>
              <div>
                <strong>Favored Season:</strong> {brewingMechanics[activeMethod].seasonBonus}
              </div>
            </div>
            
            <div className="method-special">
              <h4>Special Properties:</h4>
              <ul>
                {brewingMechanics[activeMethod].specialProperties.map((prop, i) => (
                  <li key={i}>{prop}</li>
                ))}
              </ul>
            </div>
            
            <div className="optimal-ingredients">
              <h4>Optimal Ingredients:</h4>
              <div className="ingredient-tags">
                {brewingMechanics[activeMethod].optimalCardTypes.map(type => (
                  <span key={type} className="ingredient-tag">{type}</span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Player status */}
          <div className="player-status">
            <div className="mana-display">
              <div className="mana-label">Mana:</div>
              <div className="mana-bar-container">
                <div 
                  className="mana-bar"
                  style={{ width: `${(playerMana / 100) * 100}%` }}  
                ></div>
                <span className="mana-text">{playerMana}</span>
              </div>
            </div>
            
            <div className="skill-display">
              <div className="skill-label">Brewing Skill:</div>
              <div className="skill-level">{brewingSkillLevel}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Brewing result overlay */}
      {brewingResult && (
        <div className="brewing-result-overlay">
          <div className="result-panel">
            <h2>Brewing Complete!</h2>
            <div className="result-product-name" style={{
              color: getQualityColor(brewingResult.quality)
            }}>
              {brewingResult.productName}
            </div>
            
            <div className="result-description">
              {brewingResult.description}
            </div>
            
            <div className="result-stats">
              <div className="result-quality">
                <span>Quality:</span> 
                <div className="quality-bar">
                  <div 
                    className="quality-fill"
                    style={{ 
                      width: `${brewingResult.quality}%`,
                      backgroundColor: getQualityColor(brewingResult.quality)
                    }}
                  ></div>
                </div>
                <span className="quality-value">{brewingResult.quality}%</span>
              </div>
              
              <div className="result-details">
                <div>
                  <strong>Method:</strong> {brewingResult.method}
                </div>
                <div>
                  <strong>Element:</strong> {renderElementIcon(brewingResult.element)} {brewingResult.element}
                </div>
                <div>
                  <strong>Ingredients:</strong> {brewingResult.ingredientIds.length}
                </div>
                <div>
                  <strong>Mana Used:</strong> {brewingResult.manaUsed}
                </div>
              </div>
            </div>
            
            <button 
              className="result-confirm"
              onClick={() => setBrewingResult(null)}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      
      {/* Whisper message */}
      {showWhisper && (
        <div className="brewing-whisper">
          {showWhisper}
        </div>
      )}
    </div>
  );
};

export default HanbangBrewing;