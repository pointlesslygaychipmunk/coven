import React, { useState, useEffect } from 'react';
import './CrossBreedingInterface.css';
import { Plant, Season, MoonPhase } from 'coven-shared';

interface CrossBreedingResult {
  success: boolean;
  newVarietyId?: string;
  newVarietyName?: string;
  traitInheritance?: {
    fromParent1: any[];
    fromParent2: any[];
    newMutations: any[];
  };
  rarityTier: number;
  message: string;
}

interface CrossBreedingInterfaceProps {
  plants: Plant[];
  onCrossBreed: (plant1Id: string, plant2Id: string) => Promise<CrossBreedingResult>;
  onClose: () => void;
  currentSeason: Season;
  currentMoonPhase: MoonPhase;
  playerGardeningSkill: number;
}

const CrossBreedingInterface: React.FC<CrossBreedingInterfaceProps> = ({
  plants,
  onCrossBreed,
  onClose,
  currentSeason,
  currentMoonPhase,
  playerGardeningSkill
}) => {
  // Selected plants for cross-breeding
  const [selectedPlant1, setSelectedPlant1] = useState<Plant | null>(null);
  const [selectedPlant2, setSelectedPlant2] = useState<Plant | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CrossBreedingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successProbability, setSuccessProbability] = useState(0);
  const [currentStep, setCurrentStep] = useState<'selection' | 'confirmation' | 'process' | 'result'>('selection');
  const [compatibility, setCompatibility] = useState<number>(0);
  const [currentView, setCurrentView] = useState<'selectParent1' | 'selectParent2' | 'review'>('selectParent1');
  
  // Get mature plants that can be cross-bred
  const eligiblePlants = plants.filter(plant => plant.mature);
  
  // Effect to calculate cross-breeding success probability
  useEffect(() => {
    if (selectedPlant1 && selectedPlant2) {
      // Calculate base compatibility
      const sameCategory = selectedPlant1.category === selectedPlant2.category;
      const baseCompatibility = sameCategory ? 0.6 : 0.3;
      
      // Adjust for player skill
      const skillBonus = playerGardeningSkill * 0.005; // 0-50 scale to 0-0.25 bonus
      
      // Adjust for lunar phase
      const lunarBonus = currentMoonPhase === 'Full Moon' ? 0.2 :
                         currentMoonPhase === 'New Moon' ? -0.1 : 0;
      
      // Calculate final probability
      const probability = Math.min(0.9, Math.max(0.1, baseCompatibility + skillBonus + lunarBonus));
      setSuccessProbability(probability);
      
      // Set compatibility score (0-100)
      const compatScore = Math.round(probability * 100);
      setCompatibility(compatScore);
    } else {
      setSuccessProbability(0);
      setCompatibility(0);
    }
  }, [selectedPlant1, selectedPlant2, playerGardeningSkill, currentMoonPhase]);
  
  // Handle plant selection
  const handlePlantSelect = (plant: Plant) => {
    if (currentView === 'selectParent1') {
      setSelectedPlant1(plant);
      setCurrentView('selectParent2');
    } else if (currentView === 'selectParent2') {
      // Don't allow selecting the same plant twice
      if (selectedPlant1 && plant.id === selectedPlant1.id) {
        return;
      }
      setSelectedPlant2(plant);
      setCurrentView('review');
    }
  };
  
  // Handle cross-breeding attempt
  const handleCrossBreed = async () => {
    if (!selectedPlant1 || !selectedPlant2) {
      setError("Two plants must be selected for cross-breeding.");
      return;
    }
    
    setIsLoading(true);
    setCurrentStep('process');
    setError(null);
    
    try {
      // Simulate the cross-breeding process with animation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result = await onCrossBreed(selectedPlant1.id, selectedPlant2.id);
      
      setResult(result);
      setCurrentStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during cross-breeding.");
      setCurrentStep('confirmation');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle reset selection
  const handleReset = () => {
    setSelectedPlant1(null);
    setSelectedPlant2(null);
    setResult(null);
    setError(null);
    setCurrentStep('selection');
    setCurrentView('selectParent1');
  };
  
  // Get flavor text based on compatibility
  const getCompatibilityText = () => {
    if (compatibility < 30) {
      return "These plants seem quite incompatible. Success is unlikely.";
    } else if (compatibility < 50) {
      return "These plants may be compatible, but success isn't guaranteed.";
    } else if (compatibility < 70) {
      return "These plants show promising compatibility. A successful cross is quite possible.";
    } else {
      return "These plants have excellent compatibility! The cross-breeding is very likely to succeed.";
    }
  };
  
  // Get lunar phase icon and text
  const getLunarPhaseInfo = () => {
    let icon = '🌓'; // Default
    let text = '';
    
    if (currentMoonPhase === 'Full Moon') {
      icon = '🌕';
      text = "The Full Moon greatly enhances cross-breeding success.";
    } else if (currentMoonPhase === 'New Moon') {
      icon = '🌑';
      text = "The New Moon makes cross-breeding more challenging.";
    } else if (currentMoonPhase.includes('Waxing')) {
      icon = '🌔';
      text = "The Waxing Moon modestly enhances cross-breeding potential.";
    } else if (currentMoonPhase.includes('Waning')) {
      icon = '🌒';
      text = "The Waning Moon slightly reduces cross-breeding potential.";
    }
    
    return { icon, text };
  };
  
  // Render plant selection list
  const renderPlantSelection = () => {
    const lunarInfo = getLunarPhaseInfo();
    
    return (
      <div className="cross-breeding-selection">
        <div className="selection-header">
          <h3>
            {currentView === 'selectParent1' 
              ? 'Select First Parent Plant' 
              : 'Select Second Parent Plant'}
          </h3>
          <div className="phase-indicator">
            <span className="phase-icon">{lunarInfo.icon}</span>
            <span className="phase-text">{currentMoonPhase}</span>
          </div>
        </div>
        
        <p className="selection-instructions">
          {currentView === 'selectParent1' 
            ? 'Choose a mature plant to use as the first parent for cross-breeding.'
            : 'Choose a different mature plant to cross-breed with the first parent.'}
        </p>
        
        <div className="plant-hint">
          <span className="hint-icon">💡</span>
          <span>{lunarInfo.text}</span>
        </div>
        
        {eligiblePlants.length === 0 ? (
          <p className="no-plants-message">
            No mature plants available for cross-breeding. Mature plants must be fully grown but not yet harvested.
          </p>
        ) : (
          <div className="plant-list">
            {eligiblePlants.map(plant => (
              <div 
                key={plant.id}
                className={`plant-item ${
                  (currentView === 'selectParent2' && selectedPlant1?.id === plant.id) 
                    ? 'disabled'
                    : ''
                } ${
                  (currentView === 'selectParent1' && selectedPlant1?.id === plant.id) ||
                  (currentView === 'selectParent2' && selectedPlant2?.id === plant.id)
                    ? 'selected'
                    : ''
                }`}
                onClick={() => handlePlantSelect(plant)}
              >
                <div className="plant-icon">
                  {plant.category === 'herb' ? '🌿' :
                   plant.category === 'flower' ? '🌹' :
                   plant.category === 'root' ? '🥕' :
                   plant.category === 'mushroom' ? '🍄' : '🌱'}
                </div>
                <div className="plant-details">
                  <div className="plant-name">{plant.name}</div>
                  <div className="plant-traits">
                    {plant.moonBlessed && <span className="trait moon-blessed">Moon Blessed</span>}
                    {plant.mutations && plant.mutations.length > 0 && (
                      <span className="trait mutation">Mutated</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="selection-actions">
          {currentView !== 'selectParent1' && (
            <button 
              className="secondary-button"
              onClick={() => {
                if (currentView === 'selectParent2') {
                  setSelectedPlant1(null);
                  setCurrentView('selectParent1');
                } else if (currentView === 'review') {
                  setSelectedPlant2(null);
                  setCurrentView('selectParent2');
                }
              }}
            >
              Back
            </button>
          )}
          
          <button 
            className="cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };
  
  // Render confirmation/review screen
  const renderConfirmation = () => {
    if (!selectedPlant1 || !selectedPlant2) return null;
    
    return (
      <div className="cross-breeding-confirmation">
        <h3>Review Cross-Breeding Pair</h3>
        
        <div className="parents-container">
          <div className="parent-plant">
            <div className="parent-icon">
              {selectedPlant1.category === 'herb' ? '🌿' :
               selectedPlant1.category === 'flower' ? '🌹' :
               selectedPlant1.category === 'root' ? '🥕' :
               selectedPlant1.category === 'mushroom' ? '🍄' : '🌱'}
            </div>
            <div className="parent-name">{selectedPlant1.name}</div>
            <div className="parent-traits">
              {selectedPlant1.moonBlessed && <span className="trait moon-blessed">Moon Blessed</span>}
              {selectedPlant1.mutations && selectedPlant1.mutations.map((mutation, idx) => (
                <span key={idx} className="trait mutation">{mutation}</span>
              ))}
            </div>
          </div>
          
          <div className="cross-arrow">⟷</div>
          
          <div className="parent-plant">
            <div className="parent-icon">
              {selectedPlant2.category === 'herb' ? '🌿' :
               selectedPlant2.category === 'flower' ? '🌹' :
               selectedPlant2.category === 'root' ? '🥕' :
               selectedPlant2.category === 'mushroom' ? '🍄' : '🌱'}
            </div>
            <div className="parent-name">{selectedPlant2.name}</div>
            <div className="parent-traits">
              {selectedPlant2.moonBlessed && <span className="trait moon-blessed">Moon Blessed</span>}
              {selectedPlant2.mutations && selectedPlant2.mutations.map((mutation, idx) => (
                <span key={idx} className="trait mutation">{mutation}</span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="compatibility-meter">
          <div className="meter-label">Compatibility</div>
          <div className="meter-bar">
            <div
              className={`meter-fill ${
                compatibility < 30 ? 'low' :
                compatibility < 60 ? 'medium' : 'high'
              }`}
              style={{ width: `${compatibility}%` }}
            ></div>
          </div>
          <div className="meter-value">{compatibility}%</div>
        </div>
        
        <p className="compatibility-text">{getCompatibilityText()}</p>
        
        <div className="factors-list">
          <div className="factor">
            <span className="factor-label">Moon Phase:</span>
            <span className="factor-value">
              {currentMoonPhase === 'Full Moon' ? (
                <span className="positive">Very Favorable (+20%)</span>
              ) : currentMoonPhase === 'New Moon' ? (
                <span className="negative">Unfavorable (-10%)</span>
              ) : currentMoonPhase.includes('Waxing') ? (
                <span className="positive">Slightly Favorable (+5%)</span>
              ) : currentMoonPhase.includes('Waning') ? (
                <span className="negative">Slightly Unfavorable (-5%)</span>
              ) : (
                <span>Neutral</span>
              )}
            </span>
          </div>
          
          <div className="factor">
            <span className="factor-label">Gardening Skill:</span>
            <span className="factor-value">
              <span className="positive">+{Math.round(playerGardeningSkill * 0.5)}%</span>
            </span>
          </div>
          
          <div className="factor">
            <span className="factor-label">Plant Types:</span>
            <span className="factor-value">
              {selectedPlant1.category === selectedPlant2.category ? (
                <span className="positive">Same Category (+30%)</span>
              ) : (
                <span className="negative">Different Categories (-30%)</span>
              )}
            </span>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="confirmation-actions">
          <button 
            className="secondary-button"
            onClick={() => {
              setSelectedPlant2(null);
              setCurrentView('selectParent2');
              setCurrentStep('selection');
            }}
          >
            Back
          </button>
          
          <button
            className="primary-button"
            onClick={handleCrossBreed}
            disabled={isLoading}
          >
            Begin Cross-Breeding
          </button>
        </div>
      </div>
    );
  };
  
  // Render processing animation
  const renderProcessing = () => {
    return (
      <div className="cross-breeding-process">
        <div className="process-animation">
          <div className="parent-icon left">
            {selectedPlant1?.category === 'herb' ? '🌿' :
             selectedPlant1?.category === 'flower' ? '🌹' :
             selectedPlant1?.category === 'root' ? '🥕' :
             selectedPlant1?.category === 'mushroom' ? '🍄' : '🌱'}
          </div>
          
          <div className="animation-container">
            <div className="energy-particles"></div>
            <div className="crossover-line"></div>
          </div>
          
          <div className="parent-icon right">
            {selectedPlant2?.category === 'herb' ? '🌿' :
             selectedPlant2?.category === 'flower' ? '🌹' :
             selectedPlant2?.category === 'root' ? '🥕' :
             selectedPlant2?.category === 'mushroom' ? '🍄' : '🌱'}
          </div>
        </div>
        
        <p className="process-text">Cross-breeding in progress... The plants' essences are merging.</p>
      </div>
    );
  };
  
  // Render result screen
  const renderResult = () => {
    if (!result) return null;
    
    return (
      <div className="cross-breeding-result">
        <h3 className={result.success ? 'success-title' : 'failure-title'}>
          {result.success ? 'Cross-Breeding Successful!' : 'Cross-Breeding Failed'}
        </h3>
        
        <p className="result-message">{result.message || (result.success ? 
          'The plants have successfully merged their traits into a new variety!' : 
          'The plants were incompatible and failed to produce a new variety.')}
        </p>
        
        {result.success && result.newVarietyName && (
          <div className="new-variety">
            <div className="variety-header">New Variety Created</div>
            <div className="variety-name">{result.newVarietyName}</div>
            
            {result.rarityTier && (
              <div className="rarity-indicator">
                <span className="rarity-label">Rarity:</span>
                <span className={`rarity-value tier-${result.rarityTier}`}>
                  {result.rarityTier === 1 ? 'Common' :
                   result.rarityTier === 2 ? 'Uncommon' :
                   result.rarityTier === 3 ? 'Rare' : 'Legendary'}
                </span>
              </div>
            )}
            
            {result.traitInheritance && (
              <div className="traits-container">
                <div className="traits-section">
                  <div className="traits-header">Inherited from First Parent:</div>
                  <div className="traits-list">
                    {result.traitInheritance.fromParent1.length > 0 ? 
                      result.traitInheritance.fromParent1.map((trait, idx) => (
                        <div key={idx} className="trait-item">{trait.name}</div>
                      )) : 
                      <div className="no-traits">None</div>
                    }
                  </div>
                </div>
                
                <div className="traits-section">
                  <div className="traits-header">Inherited from Second Parent:</div>
                  <div className="traits-list">
                    {result.traitInheritance.fromParent2.length > 0 ? 
                      result.traitInheritance.fromParent2.map((trait, idx) => (
                        <div key={idx} className="trait-item">{trait.name}</div>
                      )) : 
                      <div className="no-traits">None</div>
                    }
                  </div>
                </div>
                
                {result.traitInheritance.newMutations.length > 0 && (
                  <div className="traits-section">
                    <div className="traits-header mutation-header">New Mutations:</div>
                    <div className="traits-list">
                      {result.traitInheritance.newMutations.map((trait, idx) => (
                        <div key={idx} className="trait-item mutation">{trait.name}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="result-actions">
          <button
            className="secondary-button"
            onClick={handleReset}
          >
            Cross-Breed More Plants
          </button>
          
          <button
            className="primary-button"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    );
  };
  
  // Main render method
  return (
    <div className="cross-breeding-container">
      <div className="cross-breeding-overlay" onClick={onClose}></div>
      
      <div className="cross-breeding-modal">
        <div className="modal-header">
          <h2>Cross-Breeding Laboratory</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {currentStep === 'selection' && renderPlantSelection()}
          {currentStep === 'confirmation' && currentView === 'review' && renderConfirmation()}
          {currentStep === 'process' && renderProcessing()}
          {currentStep === 'result' && renderResult()}
        </div>
      </div>
    </div>
  );
};

export default CrossBreedingInterface;