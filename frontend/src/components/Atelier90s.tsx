import React, { useState, useEffect, useRef, createRef, ReactDOM } from 'react';
import './Atelier90s.css';
import LunarPhaseIcon from './LunarPhaseIcon';
import { SoundEffects, AnimationSequences, SecretCodes, SecretMessages, ScreenEffects, AsciiArt, ErrorMessages, RandomTips, checkCornerClicks, generateCorruptedText, generateBootText } from './Atelier90sEasterEggs';
import { 
  InventoryItem, 
  BasicRecipeInfo, 
  AtelierSpecialization, 
  MoonPhase, 
  ItemType, 
  ItemCategory, 
  Rarity,
  Season
} from 'coven-shared';

// Define local interfaces for the component
interface AtelierUpgradePath {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  bonusEffect: string;
  skillRequirements: Record<string, number>;
}

interface AtelierSubSpecialization {
  id: string;
  name: string;
  description: string;
  primaryBonus: string;
  secondaryEffect: string;
  requiredLevel: number;
}

interface CraftingResult {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  category: ItemCategory;
  rarity: Rarity;
  imagePath?: string;
  lunarRestriction?: MoonPhase;
  levelRequirement?: number;
  quality?: number;
  potency?: number;
  duration?: number;
  bonusEffects?: string[];
}

// Define the props for the component
interface Atelier90sProps {
  playerItems: InventoryItem[];
  onCraftItem: (ingredientIds: string[], resultItemId: string) => void;
  lunarPhase: MoonPhase;
  currentSeason: Season;
  playerLevel: number;
  playerSpecialization?: AtelierSpecialization;
  knownRecipes?: BasicRecipeInfo[];
  upgradePaths?: AtelierUpgradePath[];
  subSpecializations?: AtelierSubSpecialization[];
  activeUpgradePath?: string;
  activeSubSpecializations?: string[];
  onSelectUpgradePath?: (pathId: string) => void;
  onSelectSubSpecialization?: (subSpecId: string) => void;
}

// Define the tabs for crafting
type AtelierTab = 'charm' | 'talisman' | 'essence' | 'research';

// Main component
const Atelier90s: React.FC<Atelier90sProps> = ({
  playerItems = [],
  onCraftItem,
  lunarPhase,
  currentSeason,
  playerLevel,
  playerSpecialization,
  knownRecipes = [],
  upgradePaths = [],
  subSpecializations = [],
  activeUpgradePath,
  activeSubSpecializations = [],
  onSelectUpgradePath,
  onSelectSubSpecialization
}) => {
  // Component state
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [possibleResults, setPossibleResults] = useState<CraftingResult[]>([]);
  const [activeTab, setActiveTab] = useState<AtelierTab>('charm');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showBootScreen, setShowBootScreen] = useState<boolean>(true);
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [secretMessage, setSecretMessage] = useState<string>("CHEAT ACTIVATED: DOUBLE CRAFT YIELD");
  const [secretColor, setSecretColor] = useState<string>("#00ff00");
  const [isCraftingAnimationActive, setIsCraftingAnimationActive] = useState<boolean>(false);
  const [craftingAnimationFrame, setCraftingAnimationFrame] = useState<number>(0);
  const [showCornerEasterEgg, setShowCornerEasterEgg] = useState<boolean>(false);
  const [cornerClickCounts, setCornerClickCounts] = useState<Record<string, number>>({
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0
  });
  const [randomTip, setRandomTip] = useState<string>("");
  const [showTip, setShowTip] = useState<boolean>(false);
  const [corruptedText, setCorruptedText] = useState<boolean>(false);
  const [bootSequence, setBootSequence] = useState<string[]>(generateBootText("ATELIER SYSTEM", "v1.0.3"));
  
  // Refs
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const secretCodeSequence = useRef<string[]>([]);
  const secretTimeout = useRef<NodeJS.Timeout | null>(null);
  const craftingAnimationTimer = useRef<NodeJS.Timeout | null>(null);
  const cornerEasterEggTimer = useRef<NodeJS.Timeout | null>(null);
  const tipTimer = useRef<NodeJS.Timeout | null>(null);
  const bootTextRefs = useRef<(HTMLDivElement | null)[]>(bootSequence.map(() => null));
  
  // Function to check if an item can be selected (has quantity > 0)
  const canSelectItem = (item: InventoryItem): boolean => {
    // Allow selection if item is not already selected OR if player has more than currently selected count
    const selectedCount = selectedItems.filter(sel => sel.id === item.id).length;
    return item.quantity > selectedCount;
  };
  
  // Handle boot screen simulation
  useEffect(() => {
    if (showBootScreen) {
      const bootProgressValues = [20, 40, 60, 80, 100];
      let currentStep = 0;
      let textIndex = 0;
      
      // Display boot text one line at a time
      const bootTextInterval = setInterval(() => {
        if (textIndex < bootSequence.length) {
          // Play a subtle boot text sound
          const typeSound = new Audio(SoundEffects.click);
          typeSound.volume = 0.05;
          typeSound.play().catch(() => {/* Ignore */});
          
          // Animation for text appearance happens via CSS
          textIndex++;
        } else {
          clearInterval(bootTextInterval);
        }
      }, 700);
      
      // Progress bar animation
      const bootInterval = setInterval(() => {
        if (currentStep < bootProgressValues.length) {
          setBootProgress(bootProgressValues[currentStep]);
          currentStep++;
          
          // Play progress sound
          const progressSound = new Audio(SoundEffects.click);
          progressSound.volume = 0.05;
          progressSound.play().catch(() => {/* Ignore */});
        } else {
          clearInterval(bootInterval);
          
          // Boot complete sound
          const bootCompleteSound = new Audio(SoundEffects.success);
          bootCompleteSound.volume = 0.2;
          bootCompleteSound.play().catch(() => {/* Ignore */});
          
          setTimeout(() => {
            setShowBootScreen(false);
            
            // Schedule a random tip to appear after boot is complete
            setTimeout(() => {
              showRandomTip();
            }, 5000);
          }, 1500);
        }
      }, 800);
      
      return () => {
        clearInterval(bootInterval);
        clearInterval(bootTextInterval);
      };
    }
  }, [showBootScreen, bootSequence]);
  
  // Function to show a random tip
  const showRandomTip = () => {
    // Clear any existing tip timer
    if (tipTimer.current) {
      clearTimeout(tipTimer.current);
    }
    
    // Select a random tip
    const randomIndex = Math.floor(Math.random() * RandomTips.length);
    setRandomTip(RandomTips[randomIndex]);
    setShowTip(true);
    
    // Hide the tip after a few seconds
    tipTimer.current = setTimeout(() => {
      setShowTip(false);
      tipTimer.current = null;
      
      // Schedule another tip later
      if (Math.random() < 0.3) { // 30% chance to show another tip later
        setTimeout(showRandomTip, 60000 + Math.random() * 60000); // 1-2 minutes later
      }
    }, 5000);
  };
  
  // Calculate possible crafting results based on selected ingredients and known recipes
  useEffect(() => {
    if (selectedItems.length === 0) {
      setPossibleResults([]);
      return;
    }
    
    const selectedBaseIds = selectedItems.map(item => item.baseId);
    
    // Find potential crafts based on selected ingredients
    const findPotentialCrafts = (ingredientBaseIds: string[]): CraftingResult[] => {
      const results: CraftingResult[] = [];
      
      // Check known recipes first
      knownRecipes.forEach(known => {
        // For now, just filter by active tab type
        if (known.type === activeTab) { 
          // Simulate matching ingredients (placeholder)
          if (ingredientBaseIds.length >= 2) { // Basic check
            results.push({
              id: known.id,
              name: known.name,
              description: known.description || `A mysterious ${known.type}...`,
              type: known.type as ItemType,
              category: known.category || known.type as ItemCategory,
              rarity: 'common', // Assume common for now
              // Add quality/potency calculations
              quality: calculateQualityByIngredients(selectedItems),
              potency: calculatePotencyBySpecialization(playerSpecialization),
              duration: 100 // Base duration
            });
          }
        }
      });
      
      // Add placeholder "discovery" crafts based on specific combinations
      // Charms combinations
      if (activeTab === 'charm') {
        if (ingredientBaseIds.length === 2) {
          if (ingredientBaseIds.includes('ing_moonbud') && ingredientBaseIds.includes('ing_silverleaf')) {
            results.push({ 
              id: 'charm_moon_silver', 
              name: 'Moon Silver Charm', 
              description: 'A charm shimmering with lunar and silver light.', 
              type: 'charm', 
              category: 'charm', 
              rarity: 'uncommon',
              quality: 85,
              potency: 90
            });
          }
          
          if (ingredientBaseIds.includes('ing_emberberry') && ingredientBaseIds.includes('ing_glimmerroot')) {
            results.push({ 
              id: 'charm_ember_root', 
              name: 'Emberlight Charm', 
              description: 'Radiates a subtle warmth that brings comfort.', 
              type: 'charm', 
              category: 'charm', 
              rarity: 'uncommon',
              quality: 75,
              potency: 85
            });
          }
        } else if (ingredientBaseIds.length === 3) {
          if (ingredientBaseIds.includes('ing_sacred_lotus') && 
              ingredientBaseIds.includes('ritual_moonstone') && 
              ingredientBaseIds.includes('ing_silverleaf')) {
            results.push({ 
              id: 'charm_purifying_moon', 
              name: 'Purifying Moon Charm', 
              description: 'Enhances clarity and resists illusions.', 
              type: 'charm', 
              category: 'charm', 
              rarity: 'rare', 
              lunarRestriction: 'Full Moon', 
              levelRequirement: 5,
              quality: 95,
              potency: 100,
              bonusEffects: ['Lunar Resonance', 'Mental Clarity']
            });
          }
        }
      } 
      // Talisman combinations
      else if (activeTab === 'talisman') {
        if (ingredientBaseIds.length === 2) {
          if (ingredientBaseIds.includes('ing_ancient_ginseng') && ingredientBaseIds.includes('ing_emberberry')) {
            results.push({ 
              id: 'talisman_ginseng_ember', 
              name: 'Ginseng Ember Talisman', 
              description: 'A talisman radiating warmth and vitality.', 
              type: 'talisman', 
              category: 'talisman', 
              rarity: 'rare', 
              levelRequirement: 5,
              quality: 90,
              potency: 85
            });
          }
          
          if (ingredientBaseIds.includes('ing_nightcap') && ingredientBaseIds.includes('ing_glimmerroot')) {
            results.push({ 
              id: 'talisman_night_root', 
              name: 'Night Root Talisman', 
              description: 'A ward against minor hexes.', 
              type: 'talisman', 
              category: 'talisman', 
              rarity: 'uncommon',
              quality: 80,
              potency: 75
            });
          }
        }
        
        if (ingredientBaseIds.length === 3) {
          if (ingredientBaseIds.includes('ritual_moonstone') && 
              ingredientBaseIds.includes('ing_shimmerleaf') && 
              ingredientBaseIds.includes('ing_crystal_dust')) {
            results.push({ 
              id: 'talisman_moon_crystal', 
              name: 'Mooncrystal Talisman', 
              description: 'Amplifies magical potency during moon phases.', 
              type: 'talisman', 
              category: 'talisman', 
              rarity: 'rare', 
              lunarRestriction: 'Full Moon',
              quality: 95,
              potency: 100,
              bonusEffects: ['Lunar Amplification', 'Crystal Resonance']
            });
          }
        }
      } 
      // Essence combinations
      else if (activeTab === 'essence') {
        if (ingredientBaseIds.length === 2) {
          if (ingredientBaseIds.includes('ing_moonbud') && ingredientBaseIds.includes('ing_dewdrop')) {
            results.push({ 
              id: 'essence_lunar_dew', 
              name: 'Lunar Dew Essence', 
              description: 'Captures the magical properties of moonlight in liquid form.', 
              type: 'essence', 
              category: 'essence', 
              rarity: 'uncommon',
              quality: 85,
              potency: 80
            });
          }
          
          if (ingredientBaseIds.includes('ing_emberberry') && ingredientBaseIds.includes('ing_morning_blossom')) {
            results.push({ 
              id: 'essence_dawn_fire', 
              name: 'Dawn Fire Essence', 
              description: 'Contains the invigorating energy of sunrise.', 
              type: 'essence', 
              category: 'essence', 
              rarity: 'uncommon',
              quality: 80,
              potency: 85
            });
          }
        }
      }
      // Research tab - always shows possible discoveries
      else if (activeTab === 'research') {
        // Generate research possibilities based on player specialization
        if (playerSpecialization) {
          results.push({ 
            id: `research_${playerSpecialization.toLowerCase()}_theory`, 
            name: `${playerSpecialization} Theory`, 
            description: `Advanced theoretical research into ${playerSpecialization} techniques.`, 
            type: 'research', 
            category: 'research', 
            rarity: 'rare',
            levelRequirement: Math.max(3, playerLevel - 2)
          });
        }
        
        // Based on current season
        results.push({ 
          id: `research_${currentSeason.toLowerCase()}_properties`, 
          name: `${currentSeason} Properties Study`, 
          description: `Research on magical ingredient properties during ${currentSeason}.`, 
          type: 'research', 
          category: 'research', 
          rarity: 'uncommon'
        });
        
        // Based on lunar phase
        results.push({ 
          id: `research_${lunarPhase.toLowerCase().replace(/\s+/g, '_')}_influence`, 
          name: `${lunarPhase} Influence`, 
          description: `Study of magical amplification during ${lunarPhase}.`, 
          type: 'research', 
          category: 'research', 
          rarity: 'uncommon',
          lunarRestriction: lunarPhase
        });
      }
      
      // Remove duplicates based on ID
      const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());
      
      return uniqueResults;
    };
    
    const potentialResults = findPotentialCrafts(selectedBaseIds);
    
    // Filter results based on current lunar phase, level requirements, and ACTIVE TAB
    const filteredResults = potentialResults.filter(result => {
      if (result.lunarRestriction && result.lunarRestriction !== lunarPhase) return false;
      if (result.levelRequirement && result.levelRequirement > playerLevel) return false;
      
      // Filter by active tab explicitly
      if (result.type !== activeTab) return false;
      
      return true;
    });
    
    setPossibleResults(filteredResults);
  }, [selectedItems, knownRecipes, lunarPhase, playerLevel, playerItems, activeTab, playerSpecialization, currentSeason]);
  
  // Helper to calculate quality based on ingredients
  const calculateQualityByIngredients = (ingredients: InventoryItem[]): number => {
    // Base quality
    let baseQuality = 70;
    
    // Average quality from ingredients that have quality
    const qualityValues = ingredients
      .map(item => item.quality || 0)
      .filter(q => q > 0);
    
    if (qualityValues.length > 0) {
      const avgQuality = qualityValues.reduce((sum, q) => sum + q, 0) / qualityValues.length;
      baseQuality = Math.min(Math.max(avgQuality, 50), 100);
    }
    
    // Specialization bonus
    if (playerSpecialization) {
      switch (playerSpecialization) {
        case 'Essence': 
          baseQuality += 10;
          break;
        case 'Crystallization': 
          baseQuality += 15;
          break;
        case 'Distillation': 
          baseQuality += 15;
          break;
        default:
          baseQuality += 5;
      }
    }
    
    // Level bonus - max 10%
    const levelBonus = Math.min(playerLevel, 10);
    baseQuality += levelBonus;
    
    // Cap at 100
    return Math.min(Math.round(baseQuality), 100);
  };
  
  // Helper to calculate potency based on specialization
  const calculatePotencyBySpecialization = (specialization?: AtelierSpecialization): number => {
    // Base potency
    let basePotency = 70;
    
    // Specialization bonus
    if (specialization) {
      switch (specialization) {
        case 'Essence': 
          basePotency += 15;
          break;
        case 'Infusion': 
          basePotency += 20;
          break;
        case 'Transmutation': 
          basePotency += 15;
          break;
        default:
          basePotency += 5;
      }
    }
    
    // Upgrade path bonus
    if (activeUpgradePath) {
      basePotency += 10;
    }
    
    // Sub-specialization bonus
    if (activeSubSpecializations.length > 0) {
      basePotency += 5 * activeSubSpecializations.length;
    }
    
    // Level bonus - max 10%
    const levelBonus = Math.min(playerLevel, 10);
    basePotency += levelBonus;
    
    // Lunar phase bonus
    if (specialization && (
      (specialization === 'Essence' && lunarPhase === 'Full Moon') ||
      (specialization === 'Distillation' && lunarPhase === 'Waxing Crescent') ||
      (specialization === 'Infusion' && lunarPhase === 'First Quarter') ||
      (specialization === 'Fermentation' && lunarPhase === 'Waning Gibbous') ||
      (specialization === 'Crystallization' && lunarPhase === 'Waxing Gibbous') ||
      (specialization === 'Transmutation' && lunarPhase === 'New Moon')
    )) {
      basePotency += 15;
    }
    
    // Cap at 100
    return Math.min(Math.round(basePotency), 100);
  };
  
  // Handle item selection
  const handleItemSelect = (item: InventoryItem) => {
    const canAdd = canSelectItem(item);
    if (!canAdd) {
      return;
    }
    
    // Limit selection size to max 3 items
    if (selectedItems.length >= 3) {
      return;
    }
    
    // Add the item to selection
    setSelectedItems([...selectedItems, item]);
    
    // Play a subtle select sound effect
    playSound('select');
  };
  
  // Handle item removal from selection
  const handleItemRemove = (indexToRemove: number) => {
    const newSelection = [...selectedItems];
    newSelection.splice(indexToRemove, 1);
    setSelectedItems(newSelection);
    
    // Play a subtle remove sound effect
    playSound('remove');
  };
  
  // Handle crafting
  const handleCraft = (result: CraftingResult) => {
    const ingredientIds = selectedItems.map(item => item.id);
    
    // Start crafting animation
    setIsCraftingAnimationActive(true);
    let currentFrame = 0;
    
    // Clear any existing animation timer
    if (craftingAnimationTimer.current) {
      clearInterval(craftingAnimationTimer.current);
    }
    
    // Create animation frames
    craftingAnimationTimer.current = setInterval(() => {
      setCraftingAnimationFrame(currentFrame % AnimationSequences.craftingSequence.length);
      currentFrame++;
      
      // Play bubble sound occasionally during animation
      if (currentFrame % 3 === 0) {
        const bubbleSound = new Audio(SoundEffects.click);
        bubbleSound.volume = 0.05;
        bubbleSound.play().catch(() => {/* Ignore */});
      }
      
      // End animation after a few seconds
      if (currentFrame >= 12) { // 3 seconds at 250ms intervals
        if (craftingAnimationTimer.current) {
          clearInterval(craftingAnimationTimer.current);
          craftingAnimationTimer.current = null;
        }
        
        // Complete crafting process
        setIsCraftingAnimationActive(false);
        
        // Play a crafting success sound effect
        playSound('craft');
        
        // Call the onCraftItem prop with inventory item IDs and result ID
        onCraftItem(ingredientIds, result.id);
        
        // Clear selected items after crafting attempt
        setSelectedItems([]);
        
        // Determine if we should show a secret or corruption effect
        const randomValue = Math.random();
        
        if (randomValue < 0.1) {
          // 10% chance to trigger a secret discovery
          setTimeout(() => {
            setSecretMessage("SPECIAL DISCOVERY: RARE QUALITY BONUS");
            setSecretColor("#00ffff");
            setShowSecret(true);
            setTimeout(() => {
              setShowSecret(false);
            }, 3000);
          }, 1000);
        } else if (randomValue < 0.15) {
          // 5% chance for text corruption effect
          setCorruptedText(true);
          setTimeout(() => {
            setCorruptedText(false);
          }, 2000);
        }
      }
    }, 250);
  };
  
  // Generate and render crafting animation
  const renderCraftingAnimation = () => {
    // No need to render if not active
    if (!isCraftingAnimationActive) return null;
    
    return (
      <div className="atelier90s-crafting-animation">
        <pre className="atelier90s-ascii-animation">
          {AnimationSequences.craftingSequence[craftingAnimationFrame]}
        </pre>
        <div className="atelier90s-crafting-animation-text">
          Crafting in progress...
        </div>
      </div>
    );
  };
  
  // Handle filter selection
  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    playSound('click');
  };
  
  // Handle tab selection
  const handleTabSelect = (tab: AtelierTab) => {
    setActiveTab(tab);
    playSound('click');
  };
  
  // Helper to play sound effects
  const playSound = (type: 'select' | 'remove' | 'craft' | 'click' | 'secret' | 'error' | 'success') => {
    let soundData = '';
    
    switch (type) {
      case 'select':
        soundData = SoundEffects.select;
        break;
      case 'remove':
        soundData = SoundEffects.remove;
        break;
      case 'craft':
        soundData = SoundEffects.craft;
        break;
      case 'click':
        soundData = SoundEffects.click;
        break;
      case 'secret':
        soundData = SoundEffects.secret;
        break;
      case 'error':
        soundData = SoundEffects.error;
        break;
      case 'success':
        soundData = SoundEffects.success;
        break;
      default:
        soundData = SoundEffects.click;
    }
    
    // Play the sound effect with low volume
    const sound = new Audio(soundData);
    
    // Different volumes for different sound types
    if (type === 'secret') {
      sound.volume = 0.2; // Louder for secret sound
    } else if (type === 'error') {
      sound.volume = 0.15; // Slightly louder for errors
    } else if (type === 'success') {
      sound.volume = 0.15; // Slightly louder for success
    } else {
      sound.volume = 0.1; // Default volume
    }
    
    sound.play().catch(() => {/* Ignore failed playback */});
  };
  
  // Filter player inventory to show only usable components for crafting
  const getFilteredInventory = () => {
    const availableComponents = playerItems.filter(
      item => (item.type === 'ingredient' || item.type === 'tool' || item.type === 'ritual_item' || item.type === 'essence') && item.quantity > 0
    );
    
    if (selectedFilter === 'all') {
      return availableComponents;
    }
    
    return availableComponents.filter(item => item.category === selectedFilter);
  };
  
  // Secret code detection (Easter egg)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      secretCodeSequence.current.push(e.key);
      
      // Limit the sequence length
      if (secretCodeSequence.current.length > 10) {
        secretCodeSequence.current.shift();
      }
      
      // Check for all supported secret codes
      const currentSequence = secretCodeSequence.current.join(',');
      
      // Konami code
      if (currentSequence === SecretCodes.konami.join(',')) {
        setSecretMessage(SecretMessages.konami.message);
        setSecretColor(SecretMessages.konami.color);
        setShowSecret(true);
        playSound('secret');
        
        // Clear any existing timeout
        if (secretTimeout.current) {
          clearTimeout(secretTimeout.current);
        }
        
        // Hide the secret message after the specified duration
        secretTimeout.current = setTimeout(() => {
          setShowSecret(false);
          secretTimeout.current = null;
        }, SecretMessages.konami.duration);
      }
      
      // Debug code
      else if (currentSequence.endsWith(SecretCodes.debug.join(','))) {
        setSecretMessage(SecretMessages.debug.message);
        setSecretColor(SecretMessages.debug.color);
        setShowSecret(true);
        playSound('secret');
        
        // Show corrupted text effect
        setCorruptedText(true);
        setTimeout(() => {
          setCorruptedText(false);
        }, 2000);
        
        // Clear any existing timeout
        if (secretTimeout.current) {
          clearTimeout(secretTimeout.current);
        }
        
        // Hide the secret message after the specified duration
        secretTimeout.current = setTimeout(() => {
          setShowSecret(false);
          secretTimeout.current = null;
        }, SecretMessages.debug.duration);
      }
      
      // Rare ingredients code
      else if (currentSequence.endsWith(SecretCodes.rare.join(','))) {
        setSecretMessage(SecretMessages.rare.message);
        setSecretColor(SecretMessages.rare.color);
        setShowSecret(true);
        playSound('secret');
        
        // Clear any existing timeout
        if (secretTimeout.current) {
          clearTimeout(secretTimeout.current);
        }
        
        // Hide the secret message after the specified duration
        secretTimeout.current = setTimeout(() => {
          setShowSecret(false);
          secretTimeout.current = null;
        }, SecretMessages.rare.duration);
      }
      
      // Quality boost code
      else if (currentSequence.endsWith(SecretCodes.quality.join(','))) {
        setSecretMessage(SecretMessages.quality.message);
        setSecretColor(SecretMessages.quality.color);
        setShowSecret(true);
        playSound('secret');
        
        // Clear any existing timeout
        if (secretTimeout.current) {
          clearTimeout(secretTimeout.current);
        }
        
        // Hide the secret message after the specified duration
        secretTimeout.current = setTimeout(() => {
          setShowSecret(false);
          secretTimeout.current = null;
        }, SecretMessages.quality.duration);
      }
      
      // Moon phase cycle code
      else if (currentSequence.endsWith(SecretCodes.moon.join(','))) {
        setSecretMessage(SecretMessages.moon.message);
        setSecretColor(SecretMessages.moon.color);
        setShowSecret(true);
        playSound('secret');
        
        // Clear any existing timeout
        if (secretTimeout.current) {
          clearTimeout(secretTimeout.current);
        }
        
        // Hide the secret message after the specified duration
        secretTimeout.current = setTimeout(() => {
          setShowSecret(false);
          secretTimeout.current = null;
        }, SecretMessages.moon.duration);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (secretTimeout.current) {
        clearTimeout(secretTimeout.current);
      }
    };
  }, []);
  
  // Corner click detection for Easter eggs
  useEffect(() => {
    const handleCornerClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      // Determine which corner was clicked
      let corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | null = null;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const cornerSize = 30; // Size of corner clickable area
      
      if (x < cornerSize && y < cornerSize) {
        corner = 'topLeft';
      } else if (x > rect.width - cornerSize && y < cornerSize) {
        corner = 'topRight';
      } else if (x < cornerSize && y > rect.height - cornerSize) {
        corner = 'bottomLeft';
      } else if (x > rect.width - cornerSize && y > rect.height - cornerSize) {
        corner = 'bottomRight';
      }
      
      if (corner) {
        // Increment corner click count
        setCornerClickCounts(prev => ({
          ...prev,
          [corner as string]: prev[corner as string] + 1
        }));
        
        // Play click sound
        playSound('click');
        
        // Check if we've reached the threshold for this corner
        const newCount = cornerClickCounts[corner] + 1;
        if (checkCornerClicks(corner, newCount)) {
          // Show corner Easter egg
          setShowCornerEasterEgg(true);
          
          // Play secret sound
          playSound('secret');
          
          let easterEggMessage = "";
          
          // Different Easter eggs for different corners
          if (corner === 'topLeft') {
            setSecretMessage("SECRET: +30% CRAFTING SPEED");
            setSecretColor("#ffff00");
          } else if (corner === 'topRight') {
            setSecretMessage("SECRET: ALL INGREDIENTS DOUBLED");
            setSecretColor("#ff00ff");
          } else if (corner === 'bottomLeft') {
            setSecretMessage("SECRET: SPECIAL INGREDIENTS UNLOCKED");
            setSecretColor("#00ffff");
          } else if (corner === 'bottomRight') {
            setSecretMessage("SECRET: MASTER CRAFTING ACTIVATED");
            setSecretColor("#88ff88");
          }
          
          setShowSecret(true);
          
          // Clear any existing timeout
          if (cornerEasterEggTimer.current) {
            clearTimeout(cornerEasterEggTimer.current);
          }
          
          // Hide Easter egg and reset click count after a delay
          cornerEasterEggTimer.current = setTimeout(() => {
            setShowCornerEasterEgg(false);
            setShowSecret(false);
            setCornerClickCounts(prev => ({
              ...prev,
              [corner as string]: 0
            }));
            cornerEasterEggTimer.current = null;
          }, 4000);
        }
      }
    };
    
    if (containerRef.current) {
      containerRef.current.addEventListener('click', handleCornerClick);
    }
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleCornerClick);
      }
      
      if (cornerEasterEggTimer.current) {
        clearTimeout(cornerEasterEggTimer.current);
      }
    };
  }, [cornerClickCounts]);
  
  // Tooltip handling
  const handleShowTooltip = (content: React.ReactNode, event: React.MouseEvent) => {
    if (tooltipRef.current) {
      const tooltip = tooltipRef.current;
      tooltip.innerHTML = typeof content === 'string' ? content : '';
      if (React.isValidElement(content)) {
        ReactDOM.render(content, tooltip);
      }
      
      tooltip.style.top = `${event.clientY + 10}px`;
      tooltip.style.left = `${event.clientX + 10}px`;
      tooltip.classList.add('visible');
    }
  };
  
  const handleHideTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.classList.remove('visible');
    }
  };
  
  // Render functions
  const renderSpecializationPanel = () => {
    return (
      <div className="atelier90s-specialization">
        <div className="atelier90s-panel-title">Specialization</div>
        
        {playerSpecialization ? (
          <div className="atelier90s-spec-info">
            <div className="atelier90s-spec-name">{playerSpecialization} Atelier</div>
            <div className="atelier90s-spec-desc">
              {getSpecializationDescription(playerSpecialization)}
            </div>
            <div className="atelier90s-spec-bonus">
              {getSpecializationBonus(playerSpecialization)}
            </div>
            {/* Display active level */}
            <div className="atelier90s-spec-bonus">
              Level {playerLevel}
            </div>
          </div>
        ) : (
          <div className="atelier90s-spec-info">
            <div className="atelier90s-spec-name">No Specialization</div>
            <div className="atelier90s-spec-desc">
              Choose an atelier specialization to unlock bonuses and abilities.
            </div>
          </div>
        )}
        
        {/* Upgrade Paths Section */}
        {upgradePaths.length > 0 && (
          <div className="atelier90s-upgrade-paths">
            <div className="atelier90s-upgrade-title">Upgrade Paths</div>
            
            {upgradePaths.map(path => {
              const isUnlocked = playerLevel >= path.unlockLevel;
              const isSelected = activeUpgradePath === path.id;
              
              return (
                <div 
                  key={path.id}
                  className={`atelier90s-upgrade-option ${isUnlocked ? '' : 'locked'} ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (isUnlocked && onSelectUpgradePath) {
                      onSelectUpgradePath(path.id);
                      playSound('click');
                    }
                  }}
                  onMouseEnter={(e) => {
                    const content = (
                      <div>
                        <div className="atelier90s-tooltip-title">{path.name}</div>
                        <div className="atelier90s-tooltip-desc">{path.description}</div>
                        <div className="atelier90s-tooltip-stat">{path.bonusEffect}</div>
                        {!isUnlocked && (
                          <div className="atelier90s-tooltip-warn">
                            Requires Level {path.unlockLevel}
                          </div>
                        )}
                      </div>
                    );
                    handleShowTooltip(content, e);
                  }}
                  onMouseLeave={handleHideTooltip}
                >
                  <div className="atelier90s-upgrade-name">{path.name}</div>
                  <div className="atelier90s-upgrade-desc">{path.description}</div>
                  {!isUnlocked && (
                    <div className="atelier90s-upgrade-req">
                      Unlocks at Level {path.unlockLevel}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Sub-Specializations Section */}
        {subSpecializations.length > 0 && (
          <div className="atelier90s-upgrade-paths">
            <div className="atelier90s-upgrade-title">Specializations</div>
            
            {subSpecializations.map(subSpec => {
              const isUnlocked = playerLevel >= subSpec.requiredLevel;
              const isSelected = activeSubSpecializations.includes(subSpec.id);
              
              return (
                <div 
                  key={subSpec.id}
                  className={`atelier90s-upgrade-option ${isUnlocked ? '' : 'locked'} ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (isUnlocked && onSelectSubSpecialization) {
                      onSelectSubSpecialization(subSpec.id);
                      playSound('click');
                    }
                  }}
                  onMouseEnter={(e) => {
                    const content = (
                      <div>
                        <div className="atelier90s-tooltip-title">{subSpec.name}</div>
                        <div className="atelier90s-tooltip-desc">{subSpec.description}</div>
                        <div className="atelier90s-tooltip-stat">{subSpec.primaryBonus}</div>
                        <div className="atelier90s-tooltip-stat">{subSpec.secondaryEffect}</div>
                        {!isUnlocked && (
                          <div className="atelier90s-tooltip-warn">
                            Requires Level {subSpec.requiredLevel}
                          </div>
                        )}
                      </div>
                    );
                    handleShowTooltip(content, e);
                  }}
                  onMouseLeave={handleHideTooltip}
                >
                  <div className="atelier90s-upgrade-name">{subSpec.name}</div>
                  <div className="atelier90s-upgrade-desc">{subSpec.description}</div>
                  {!isUnlocked && (
                    <div className="atelier90s-upgrade-req">
                      Unlocks at Level {subSpec.requiredLevel}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  const renderCraftingPanel = () => {
    return (
      <div className="atelier90s-crafting">
        <div className="atelier90s-crafting-tabs">
          <div 
            className={`atelier90s-tab ${activeTab === 'charm' ? 'active' : ''}`}
            onClick={() => handleTabSelect('charm')}
          >
            Charms
          </div>
          <div 
            className={`atelier90s-tab ${activeTab === 'talisman' ? 'active' : ''}`}
            onClick={() => handleTabSelect('talisman')}
          >
            Talismans
          </div>
          <div 
            className={`atelier90s-tab ${activeTab === 'essence' ? 'active' : ''}`}
            onClick={() => handleTabSelect('essence')}
          >
            Essences
          </div>
          <div 
            className={`atelier90s-tab ${activeTab === 'research' ? 'active' : ''}`}
            onClick={() => handleTabSelect('research')}
          >
            Research
          </div>
        </div>
        
        <div className="atelier90s-crafting-area">
          <div className="atelier90s-crafting-grid">
            {/* Three ingredient slots */}
            {[0, 1, 2].map(slotIndex => {
              const item = selectedItems[slotIndex];
              
              return (
                <div 
                  key={`slot-${slotIndex}`} 
                  className={`atelier90s-ingredient-slot ${item ? 'filled' : ''}`}
                  onClick={() => {
                    if (item) {
                      handleItemRemove(slotIndex);
                    }
                  }}
                >
                  {item ? (
                    <div className="atelier90s-ingredient-item">
                      <div className="atelier90s-ingredient-icon">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="atelier90s-ingredient-name">{item.name}</div>
                    </div>
                  ) : (
                    <span className="atelier90s-ingredient-placeholder">+</span>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="atelier90s-crafting-actions">
            <button 
              className="atelier90s-button" 
              onClick={() => setSelectedItems([])}
              disabled={selectedItems.length === 0}
            >
              Clear
            </button>
          </div>
          
          <div className="atelier90s-crafting-result">
            {possibleResults.length > 0 ? (
              <div className="atelier90s-result-item">
                <div className="atelier90s-result-icon">
                  {possibleResults[0].name.charAt(0).toUpperCase()}
                </div>
                <div className="atelier90s-result-name">{possibleResults[0].name}</div>
                <div className="atelier90s-result-desc">{possibleResults[0].description}</div>
                {possibleResults[0].quality && (
                  <div className="atelier90s-result-quality">Quality: {possibleResults[0].quality}%</div>
                )}
                <button 
                  className="atelier90s-button primary"
                  onClick={() => handleCraft(possibleResults[0])}
                >
                  Create
                </button>
              </div>
            ) : (
              <div className="atelier90s-result-placeholder">
                {selectedItems.length > 0 ? 
                  "No recipe found. Try different ingredients." : 
                  "Select ingredients to craft something."
                }
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderInventoryPanel = () => {
    const filteredInventory = getFilteredInventory();
    const categories = ['all', 'herb', 'flower', 'root', 'fruit', 'crystal', 'essence', 'ritual_item'];
    
    return (
      <div className="atelier90s-inventory">
        <div className="atelier90s-panel-title">Inventory</div>
        
        <div className="atelier90s-inventory-filters">
          {categories.map(category => (
            <div 
              key={category}
              className={`atelier90s-filter ${selectedFilter === category ? 'active' : ''}`}
              onClick={() => handleFilterSelect(category)}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </div>
          ))}
        </div>
        
        <div className="atelier90s-inventory-list">
          {filteredInventory.length > 0 ? (
            filteredInventory.map(item => {
              // Determine quality class
              const qualityClass = item.quality ? 
                item.quality >= 90 ? 'quality-ultra' :
                item.quality >= 75 ? 'quality-high' :
                item.quality >= 50 ? 'quality-medium' :
                'quality-low' : 'quality-low';
              
              // Check if this specific item can be selected
              const isSelectable = canSelectItem(item);
              // Check if any instance of this item is already selected (for dims)
              const isSelected = selectedItems.some(sel => sel.baseId === item.baseId);
              
              return (
                <div
                  key={item.id}
                  className={`atelier90s-inventory-item ${qualityClass} ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (isSelectable) {
                      handleItemSelect(item);
                    }
                  }}
                  onMouseEnter={(e) => {
                    const content = (
                      <div>
                        <div className="atelier90s-tooltip-title">{item.name}</div>
                        <div className="atelier90s-tooltip-desc">{item.description || `A ${item.category} ingredient.`}</div>
                        {item.quality && (
                          <div className="atelier90s-tooltip-stat">Quality: {item.quality}%</div>
                        )}
                        {item.harvestedDuring && (
                          <div className="atelier90s-tooltip-stat">Harvested during: {item.harvestedDuring}</div>
                        )}
                        {item.harvestedSeason && (
                          <div className="atelier90s-tooltip-stat">Season: {item.harvestedSeason}</div>
                        )}
                      </div>
                    );
                    handleShowTooltip(content, e);
                  }}
                  onMouseLeave={handleHideTooltip}
                  style={{ opacity: isSelectable ? 1 : 0.5 }}
                >
                  <div className="atelier90s-inventory-icon">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="atelier90s-inventory-name">{item.name}</div>
                  <div className="atelier90s-inventory-qty">x{item.quantity}</div>
                </div>
              );
            })
          ) : (
            <div className="atelier90s-result-placeholder">No ingredients in inventory.</div>
          )}
        </div>
      </div>
    );
  };
  
  // Helper function to get specialization descriptions
  const getSpecializationDescription = (spec: AtelierSpecialization): string => {
    switch (spec) {
      case 'Essence':
        return 'Specializes in extracting and purifying magical essences for masks and serums.';
      case 'Fermentation':
        return 'Masters the art of transforming ingredients through controlled fermentation.';
      case 'Distillation':
        return 'Extracts and concentrates magical properties through precise temperature control.';
      case 'Infusion':
        return 'Creates gentle herbal infusions and teas that preserve subtle magical properties.';
      case 'Crystallization':
        return 'Forms magical essences into solid crystalline structures for charms and talismans.';
      case 'Transmutation':
        return 'Transforms ingredients from one form to another, combining unlike elements.';
      default:
        return 'An unspecified atelier specialization.';
    }
  };
  
  // Helper function to get specialization bonuses
  const getSpecializationBonus = (spec: AtelierSpecialization): string => {
    switch (spec) {
      case 'Essence':
        return '+15% potency for serums and masks';
      case 'Fermentation':
        return '+20% shelf life for potions';
      case 'Distillation':
        return '+25% yield when creating potions';
      case 'Infusion':
        return '+20% effectiveness for tonics and elixirs';
      case 'Crystallization':
        return '+25% potency for charms and talismans';
      case 'Transmutation':
        return '+20% chance to discover new recipes';
      default:
        return 'No specialization bonus';
    }
  };
  
  // Main render
  return (
    <div 
      className={`atelier90s-container ${corruptedText ? 'atelier90s-corrupted' : ''} ${showCornerEasterEgg ? 'atelier90s-easter-egg-active' : ''}`} 
      ref={containerRef}
    >
      {/* Header with status indicators */}
      <div className="atelier90s-header">
        <div 
          className={`atelier90s-title ${corruptedText ? 'atelier90s-corrupted-text' : ''}`} 
          data-text="Witch's Atelier"
        >
          {corruptedText ? generateCorruptedText("Witch's Atelier") : "Witch's Atelier"}
        </div>
        <div className="atelier90s-status">
          <div className="atelier90s-phase">
            <LunarPhaseIcon phase={lunarPhase} size={20} />
          </div>
          <div className="atelier90s-stats">
            <div className="atelier90s-stat">
              LVL {playerLevel}
            </div>
            <div className="atelier90s-stat">
              {currentSeason}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main workspace */}
      <div className="atelier90s-workspace">
        {renderSpecializationPanel()}
        {renderCraftingPanel()}
        {renderInventoryPanel()}
      </div>
      
      {/* Tooltip */}
      <div ref={tooltipRef} className="atelier90s-tooltip"></div>
      
      {/* Random tip message */}
      <div className={`atelier90s-tip ${showTip ? 'show' : ''}`}>
        {randomTip}
      </div>
      
      {/* Secret easter egg message */}
      <div 
        className={`atelier90s-secret ${showSecret ? 'show' : ''}`} 
        style={{ color: secretColor }}
      >
        {secretMessage}
      </div>
      
      {/* Crafting Animation overlay */}
      {isCraftingAnimationActive && renderCraftingAnimation()}
      
      {/* Corner Easter egg animations */}
      {showCornerEasterEgg && (
        <div className="atelier90s-corner-effect">
          <div className="atelier90s-sparkle atelier90s-sparkle-1"></div>
          <div className="atelier90s-sparkle atelier90s-sparkle-2"></div>
          <div className="atelier90s-sparkle atelier90s-sparkle-3"></div>
          <div className="atelier90s-sparkle atelier90s-sparkle-4"></div>
        </div>
      )}
      
      {/* Special ASCII art for decoration */}
      <div className="atelier90s-ascii-decoration topRight">
        <pre>{AsciiArt.star}</pre>
      </div>
      
      <div className="atelier90s-ascii-decoration bottomLeft">
        <pre>{AsciiArt.moon}</pre>
      </div>
      
      {/* Boot screen with proper DOS styling */}
      {showBootScreen && (
        <div className="atelier90s-boot-screen">
          {bootSequence.map((line, index) => (
            <div 
              key={`boot-line-${index}`}
              className="atelier90s-boot-line"
              style={{ animationDelay: `${index * 0.7}s` }}
              ref={el => bootTextRefs.current[index] = el}
            >
              {line}
              {index === bootSequence.length - 1 && (
                <div className="atelier90s-boot-progress">
                  <div 
                    className="atelier90s-boot-progress-inner" 
                    style={{ 
                      width: `${bootProgress}%`, 
                      transition: 'width 0.8s ease-in-out' 
                    }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Atelier90s;