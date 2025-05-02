import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './CrossBreedingInterface.css';
const CrossBreedingInterface = ({ plants, onCrossBreed, onClose, 
// currentSeason, // Unused but kept in props definition for API consistency
currentMoonPhase, playerGardeningSkill }) => {
    // Selected plants for cross-breeding
    const [selectedPlant1, setSelectedPlant1] = useState(null);
    const [selectedPlant2, setSelectedPlant2] = useState(null);
    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [_successProbability, setSuccessProbability] = useState(0); // Currently unused
    const [currentStep, setCurrentStep] = useState('selection');
    const [compatibility, setCompatibility] = useState(0);
    const [currentView, setCurrentView] = useState('selectParent1');
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
        }
        else {
            setSuccessProbability(0);
            setCompatibility(0);
        }
    }, [selectedPlant1, selectedPlant2, playerGardeningSkill, currentMoonPhase]);
    // Handle plant selection
    const handlePlantSelect = (plant) => {
        if (currentView === 'selectParent1') {
            setSelectedPlant1(plant);
            setCurrentView('selectParent2');
        }
        else if (currentView === 'selectParent2') {
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred during cross-breeding.");
            setCurrentStep('confirmation');
        }
        finally {
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
        }
        else if (compatibility < 50) {
            return "These plants may be compatible, but success isn't guaranteed.";
        }
        else if (compatibility < 70) {
            return "These plants show promising compatibility. A successful cross is quite possible.";
        }
        else {
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
        }
        else if (currentMoonPhase === 'New Moon') {
            icon = '🌑';
            text = "The New Moon makes cross-breeding more challenging.";
        }
        else if (currentMoonPhase.includes('Waxing')) {
            icon = '🌔';
            text = "The Waxing Moon modestly enhances cross-breeding potential.";
        }
        else if (currentMoonPhase.includes('Waning')) {
            icon = '🌒';
            text = "The Waning Moon slightly reduces cross-breeding potential.";
        }
        return { icon, text };
    };
    // Render plant selection list
    const renderPlantSelection = () => {
        const lunarInfo = getLunarPhaseInfo();
        return (_jsxs("div", { className: "cross-breeding-selection", children: [_jsxs("div", { className: "selection-header", children: [_jsx("h3", { children: currentView === 'selectParent1'
                                ? 'Select First Parent Plant'
                                : 'Select Second Parent Plant' }), _jsxs("div", { className: "phase-indicator", children: [_jsx("span", { className: "phase-icon", children: lunarInfo.icon }), _jsx("span", { className: "phase-text", children: currentMoonPhase })] })] }), _jsx("p", { className: "selection-instructions", children: currentView === 'selectParent1'
                        ? 'Choose a mature plant to use as the first parent for cross-breeding.'
                        : 'Choose a different mature plant to cross-breed with the first parent.' }), _jsxs("div", { className: "plant-hint", children: [_jsx("span", { className: "hint-icon", children: "\uD83D\uDCA1" }), _jsx("span", { children: lunarInfo.text })] }), eligiblePlants.length === 0 ? (_jsx("p", { className: "no-plants-message", children: "No mature plants available for cross-breeding. Mature plants must be fully grown but not yet harvested." })) : (_jsx("div", { className: "plant-list", children: eligiblePlants.map(plant => (_jsxs("div", { className: `plant-item ${(currentView === 'selectParent2' && selectedPlant1?.id === plant.id)
                            ? 'disabled'
                            : ''} ${(currentView === 'selectParent1' && selectedPlant1?.id === plant.id) ||
                            (currentView === 'selectParent2' && selectedPlant2?.id === plant.id)
                            ? 'selected'
                            : ''}`, onClick: () => handlePlantSelect(plant), children: [_jsx("div", { className: "plant-icon", children: plant.category === 'herb' ? '🌿' :
                                    plant.category === 'flower' ? '🌹' :
                                        plant.category === 'root' ? '🥕' :
                                            plant.category === 'mushroom' ? '🍄' : '🌱' }), _jsxs("div", { className: "plant-details", children: [_jsx("div", { className: "plant-name", children: plant.name }), _jsxs("div", { className: "plant-traits", children: [plant.moonBlessed && _jsx("span", { className: "trait moon-blessed", children: "Moon Blessed" }), plant.mutations && plant.mutations.length > 0 && (_jsx("span", { className: "trait mutation", children: "Mutated" }))] })] })] }, plant.id))) })), _jsxs("div", { className: "selection-actions", children: [currentView !== 'selectParent1' && (_jsx("button", { className: "secondary-button", onClick: () => {
                                if (currentView === 'selectParent2') {
                                    setSelectedPlant1(null);
                                    setCurrentView('selectParent1');
                                }
                                else if (currentView === 'review') {
                                    setSelectedPlant2(null);
                                    setCurrentView('selectParent2');
                                }
                            }, children: "Back" })), _jsx("button", { className: "cancel-button", onClick: onClose, children: "Cancel" })] })] }));
    };
    // Render confirmation/review screen
    const renderConfirmation = () => {
        if (!selectedPlant1 || !selectedPlant2)
            return null;
        return (_jsxs("div", { className: "cross-breeding-confirmation", children: [_jsx("h3", { children: "Review Cross-Breeding Pair" }), _jsxs("div", { className: "parents-container", children: [_jsxs("div", { className: "parent-plant", children: [_jsx("div", { className: "parent-icon", children: selectedPlant1.category === 'herb' ? '🌿' :
                                        selectedPlant1.category === 'flower' ? '🌹' :
                                            selectedPlant1.category === 'root' ? '🥕' :
                                                selectedPlant1.category === 'mushroom' ? '🍄' : '🌱' }), _jsx("div", { className: "parent-name", children: selectedPlant1.name }), _jsxs("div", { className: "parent-traits", children: [selectedPlant1.moonBlessed && _jsx("span", { className: "trait moon-blessed", children: "Moon Blessed" }), selectedPlant1.mutations && selectedPlant1.mutations.map((mutation, idx) => (_jsx("span", { className: "trait mutation", children: mutation }, idx)))] })] }), _jsx("div", { className: "cross-arrow", children: "\u27F7" }), _jsxs("div", { className: "parent-plant", children: [_jsx("div", { className: "parent-icon", children: selectedPlant2.category === 'herb' ? '🌿' :
                                        selectedPlant2.category === 'flower' ? '🌹' :
                                            selectedPlant2.category === 'root' ? '🥕' :
                                                selectedPlant2.category === 'mushroom' ? '🍄' : '🌱' }), _jsx("div", { className: "parent-name", children: selectedPlant2.name }), _jsxs("div", { className: "parent-traits", children: [selectedPlant2.moonBlessed && _jsx("span", { className: "trait moon-blessed", children: "Moon Blessed" }), selectedPlant2.mutations && selectedPlant2.mutations.map((mutation, idx) => (_jsx("span", { className: "trait mutation", children: mutation }, idx)))] })] })] }), _jsxs("div", { className: "compatibility-meter", children: [_jsx("div", { className: "meter-label", children: "Compatibility" }), _jsx("div", { className: "meter-bar", children: _jsx("div", { className: `meter-fill ${compatibility < 30 ? 'low' :
                                    compatibility < 60 ? 'medium' : 'high'}`, style: { width: `${compatibility}%` } }) }), _jsxs("div", { className: "meter-value", children: [compatibility, "%"] })] }), _jsx("p", { className: "compatibility-text", children: getCompatibilityText() }), _jsxs("div", { className: "factors-list", children: [_jsxs("div", { className: "factor", children: [_jsx("span", { className: "factor-label", children: "Moon Phase:" }), _jsx("span", { className: "factor-value", children: currentMoonPhase === 'Full Moon' ? (_jsx("span", { className: "positive", children: "Very Favorable (+20%)" })) : currentMoonPhase === 'New Moon' ? (_jsx("span", { className: "negative", children: "Unfavorable (-10%)" })) : currentMoonPhase.includes('Waxing') ? (_jsx("span", { className: "positive", children: "Slightly Favorable (+5%)" })) : currentMoonPhase.includes('Waning') ? (_jsx("span", { className: "negative", children: "Slightly Unfavorable (-5%)" })) : (_jsx("span", { children: "Neutral" })) })] }), _jsxs("div", { className: "factor", children: [_jsx("span", { className: "factor-label", children: "Gardening Skill:" }), _jsx("span", { className: "factor-value", children: _jsxs("span", { className: "positive", children: ["+", Math.round(playerGardeningSkill * 0.5), "%"] }) })] }), _jsxs("div", { className: "factor", children: [_jsx("span", { className: "factor-label", children: "Plant Types:" }), _jsx("span", { className: "factor-value", children: selectedPlant1.category === selectedPlant2.category ? (_jsx("span", { className: "positive", children: "Same Category (+30%)" })) : (_jsx("span", { className: "negative", children: "Different Categories (-30%)" })) })] })] }), error && _jsx("div", { className: "error-message", children: error }), _jsxs("div", { className: "confirmation-actions", children: [_jsx("button", { className: "secondary-button", onClick: () => {
                                setSelectedPlant2(null);
                                setCurrentView('selectParent2');
                                setCurrentStep('selection');
                            }, children: "Back" }), _jsx("button", { className: "primary-button", onClick: handleCrossBreed, disabled: isLoading, children: "Begin Cross-Breeding" })] })] }));
    };
    // Render processing animation
    const renderProcessing = () => {
        return (_jsxs("div", { className: "cross-breeding-process", children: [_jsxs("div", { className: "process-animation", children: [_jsx("div", { className: "parent-icon left", children: selectedPlant1?.category === 'herb' ? '🌿' :
                                selectedPlant1?.category === 'flower' ? '🌹' :
                                    selectedPlant1?.category === 'root' ? '🥕' :
                                        selectedPlant1?.category === 'mushroom' ? '🍄' : '🌱' }), _jsxs("div", { className: "animation-container", children: [_jsx("div", { className: "energy-particles" }), _jsx("div", { className: "crossover-line" })] }), _jsx("div", { className: "parent-icon right", children: selectedPlant2?.category === 'herb' ? '🌿' :
                                selectedPlant2?.category === 'flower' ? '🌹' :
                                    selectedPlant2?.category === 'root' ? '🥕' :
                                        selectedPlant2?.category === 'mushroom' ? '🍄' : '🌱' })] }), _jsx("p", { className: "process-text", children: "Cross-breeding in progress... The plants' essences are merging." })] }));
    };
    // Render result screen
    const renderResult = () => {
        if (!result)
            return null;
        return (_jsxs("div", { className: "cross-breeding-result", children: [_jsx("h3", { className: result.success ? 'success-title' : 'failure-title', children: result.success ? 'Cross-Breeding Successful!' : 'Cross-Breeding Failed' }), _jsx("p", { className: "result-message", children: result.message || (result.success ?
                        'The plants have successfully merged their traits into a new variety!' :
                        'The plants were incompatible and failed to produce a new variety.') }), result.success && result.newVarietyName && (_jsxs("div", { className: "new-variety", children: [_jsx("div", { className: "variety-header", children: "New Variety Created" }), _jsx("div", { className: "variety-name", children: result.newVarietyName }), result.rarityTier && (_jsxs("div", { className: "rarity-indicator", children: [_jsx("span", { className: "rarity-label", children: "Rarity:" }), _jsx("span", { className: `rarity-value tier-${result.rarityTier}`, children: result.rarityTier === 1 ? 'Common' :
                                        result.rarityTier === 2 ? 'Uncommon' :
                                            result.rarityTier === 3 ? 'Rare' : 'Legendary' })] })), result.traitInheritance && (_jsxs("div", { className: "traits-container", children: [_jsxs("div", { className: "traits-section", children: [_jsx("div", { className: "traits-header", children: "Inherited from First Parent:" }), _jsx("div", { className: "traits-list", children: result.traitInheritance.fromParent1.length > 0 ?
                                                result.traitInheritance.fromParent1.map((trait, idx) => (_jsx("div", { className: "trait-item", children: trait.name }, idx))) :
                                                _jsx("div", { className: "no-traits", children: "None" }) })] }), _jsxs("div", { className: "traits-section", children: [_jsx("div", { className: "traits-header", children: "Inherited from Second Parent:" }), _jsx("div", { className: "traits-list", children: result.traitInheritance.fromParent2.length > 0 ?
                                                result.traitInheritance.fromParent2.map((trait, idx) => (_jsx("div", { className: "trait-item", children: trait.name }, idx))) :
                                                _jsx("div", { className: "no-traits", children: "None" }) })] }), result.traitInheritance.newMutations.length > 0 && (_jsxs("div", { className: "traits-section", children: [_jsx("div", { className: "traits-header mutation-header", children: "New Mutations:" }), _jsx("div", { className: "traits-list", children: result.traitInheritance.newMutations.map((trait, idx) => (_jsx("div", { className: "trait-item mutation", children: trait.name }, idx))) })] }))] }))] })), _jsxs("div", { className: "result-actions", children: [_jsx("button", { className: "secondary-button", onClick: handleReset, children: "Cross-Breed More Plants" }), _jsx("button", { className: "primary-button", onClick: onClose, children: "Done" })] })] }));
    };
    // Main render method
    return (_jsxs("div", { className: "cross-breeding-container", children: [_jsx("div", { className: "cross-breeding-overlay", onClick: onClose }), _jsxs("div", { className: "cross-breeding-modal", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { children: "Cross-Breeding Laboratory" }), _jsx("button", { className: "close-button", onClick: onClose, children: "\u00D7" })] }), _jsxs("div", { className: "modal-content", children: [currentStep === 'selection' && renderPlantSelection(), currentStep === 'confirmation' && currentView === 'review' && renderConfirmation(), currentStep === 'process' && renderProcessing(), currentStep === 'result' && renderResult()] })] })] }));
};
export default CrossBreedingInterface;
//# sourceMappingURL=CrossBreedingInterface.js.map