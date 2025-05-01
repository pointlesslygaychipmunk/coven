import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { GameState, Season, InventoryItem, GardenSlot } from 'coven-shared';

// Import Components
import Garden from './Garden';
import Brewing from './Brewing';
import Market from './Market';
import Journal from './Journal';
import HUD from './HUD';
import Atelier from './Atelier';
import WeatherEffectsOverlay from './WeatherEffectsOverlay';

// API Utility - unchanged
const API_BASE_URL = '/api';
const apiCall = async (endpoint: string, method: string = 'GET', body?: any): Promise<GameState> => {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', },
  };
  if (body) { options.body = JSON.stringify(body); }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const responseData = await response.json();
  if (!response.ok) {
    console.error("API Error Response:", responseData);
    throw new Error(responseData.error || `API call failed: ${response.statusText}`);
  }
  return responseData as GameState;
};

// Whimsical Garden Spirits Enhancement - adds occasional mystical visitors
type SpiritType = 'flower' | 'herb' | 'mushroom' | 'root' | 'moon' | 'star' | 'forest';
interface GardenSpirit {
  id: string;
  type: SpiritType;
  name: string;
  message: string;
  position: { x: number; y: number };
  lifespan: number; // in seconds
  entryAnimation: string;
  exitAnimation: string;
  giftType?: string;
  giftAmount?: number;
}

// Garden Spirit Folklore Database
const spiritFolklore: Record<SpiritType, Array<{name: string, messages: string[], gifts?: {type: string, min: number, max: number}[]}>> = {
  flower: [
    { 
      name: 'Petal Pixie', 
      messages: [
        "Your garden blooms with such happiness!", 
        "May your flowers always find the sun...",
        "I've blessed your soil with spring's whisper."
      ],
      gifts: [{ type: 'gold', min: 3, max: 8 }]
    },
    { 
      name: 'Rosehip', 
      messages: [
        "The roses tell me you have a kind heart.", 
        "I've left dewdrops on your flower buds.",
        "The fragrance of your garden called to me."
      ],
      gifts: [{ type: 'seed', min: 1, max: 1 }]
    }
  ],
  herb: [
    { 
      name: 'Sage Whisperer', 
      messages: [
        "Your herbs hold ancient wisdom...", 
        "I sense healing energy in your garden.",
        "May your herbs grow potent and true."
      ],
      gifts: [{ type: 'herb', min: 1, max: 2 }]
    },
    { 
      name: 'Thyme Keeper', 
      messages: [
        "Time moves differently among the herbs.", 
        "I've shared a secret with your mint leaves.",
        "Your patience with herbs impresses the spirits."
      ],
      gifts: [{ type: 'growth', min: 5, max: 10 }]
    }
  ],
  mushroom: [
    { 
      name: 'Spore Sprite', 
      messages: [
        "I emerge from the hidden networks below.", 
        "Your mushrooms tell of the unseen world.",
        "I've connected your garden to the mycelial web."
      ],
      gifts: [{ type: 'reputation', min: 1, max: 2 }]
    },
    { 
      name: 'Morel Elder', 
      messages: [
        "From decay comes the most profound wisdom.", 
        "I am ancient beyond your knowing, yet your garden welcomes me.",
        "Even in shadow, your garden finds light."
      ],
      gifts: [{ type: 'fertility', min: 3, max: 7 }]
    }
  ],
  root: [
    { 
      name: 'Taproot', 
      messages: [
        "I bring strength from deep below.", 
        "Your garden's foundations are solid.",
        "I've blessed your soil's deepest layers."
      ],
      gifts: [{ type: 'fertility', min: 5, max: 10 }]
    },
    { 
      name: 'Rhizome', 
      messages: [
        "We are all connected beneath the surface.", 
        "Your root vegetables are singing underground.",
        "I spread through your garden, bringing abundance."
      ],
      gifts: [{ type: 'growth', min: 3, max: 8 }]
    }
  ],
  moon: [
    { 
      name: 'Moonbeam', 
      messages: [
        "I bring the moon's blessing to your night garden.", 
        "Silver light enhances magic - plant under the full moon.",
        "Your garden shimmers beautifully in my light."
      ],
      gifts: [{ type: 'moonblessing', min: 1, max: 3 }]
    },
    { 
      name: 'Luna', 
      messages: [
        "Even the moon finds peace in your garden.", 
        "I've touched your herbs with lunar magic.",
        "The tides of growth ebb and flow by my light."
      ],
      gifts: [{ type: 'gold', min: 10, max: 20 }]
    }
  ],
  star: [
    { 
      name: 'Stardust', 
      messages: [
        "I've traveled light years to visit your garden.", 
        "Your plants reach for the stars - as do you.",
        "Cosmic energy flows through your soil now."
      ],
      gifts: [{ type: 'rare_seed', min: 1, max: 1 }]
    },
    { 
      name: 'Celestial Spark', 
      messages: [
        "The constellations smile upon your work.", 
        "I bring stardust for your most precious plants.",
        "Even the stars notice a garden tended with love."
      ],
      gifts: [{ type: 'reputation', min: 2, max: 4 }]
    }
  ],
  forest: [
    { 
      name: 'Grove Guardian', 
      messages: [
        "Your garden reminds me of the ancient forests.", 
        "I've brought whispers from the wilderness.",
        "Even in this small space, the forest spirit lives."
      ],
      gifts: [{ type: 'growth', min: 5, max: 15 }]
    },
    { 
      name: 'Dryad', 
      messages: [
        "I rarely leave my tree, but your garden called to me.", 
        "The balance of your garden pleases the old spirits.",
        "Your hands speak the language of growing things."
      ],
      gifts: [{ type: 'herb', min: 2, max: 3 }]
    }
  ]
};

// Main App Component
const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageTransition, setPageTransition] = useState<boolean>(false);
    const [currentView, setCurrentView] = useState<string>('garden'); // Default view

    // Garden Spirits Enhancement
    const [gardenSpirits, setGardenSpirits] = useState<GardenSpirit[]>([]);
    const [spiritMessageVisible, setSpiritMessageVisible] = useState<boolean>(false);
    const [currentSpiritMessage, setCurrentSpiritMessage] = useState<{text: string, spirit: string}>({text: "", spirit: ""});
    const spiritCheckInterval = useRef<NodeJS.Timeout | null>(null);
    const spiritMessageTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastSpiritAppearance = useRef<number>(0);

    // Initialize Garden Spirits System
    useEffect(() => {
        // Check for spirit appearances every 2-3 minutes
        spiritCheckInterval.current = setInterval(() => {
            if (currentView === 'garden' && !loading && gameState) {
                // Don't spawn spirits too frequently - minimum 2 minute cooldown
                const now = Date.now();
                const timeSinceLastSpirit = now - lastSpiritAppearance.current;
                if (timeSinceLastSpirit < 1000 * 60 * 2) return;
                
                // Each check has a chance to spawn a spirit based on garden conditions
                const spiritChance = calculateSpiritChance();
                if (Math.random() < spiritChance) {
                    spawnRandomSpirit();
                }
            }
        }, 1000 * 60 * (2 + Math.random())); // Random interval between 2-3 minutes

        return () => {
            if (spiritCheckInterval.current) {
                clearInterval(spiritCheckInterval.current);
            }
            if (spiritMessageTimeout.current) {
                clearTimeout(spiritMessageTimeout.current);
            }
        };
    }, [currentView, loading, gameState]);

    // Calculate chance of spirit appearance based on garden state
    const calculateSpiritChance = () => {
        // Base chance is 0.15 (15%)
        let chance = 0.15;
        
        // If no game state yet, return base chance
        if (!gameState) return chance;
        
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        
        // Increase chance during special lunar phases
        if (gameState.time?.phaseName === "Full Moon") chance += 0.2;
        if (gameState.time?.phaseName === "New Moon") chance += 0.1;
        
        // Increase chance based on plants in garden
        if (currentPlayer.garden && currentPlayer.garden.length > 0) {
            const plantedPlots = currentPlayer.garden.filter(plot => plot.plant).length;
            chance += plantedPlots * 0.05; // Each plant adds 5% chance
            
            // Mature plants attract more spirits
            const maturePlants = currentPlayer.garden.filter(plot => plot.plant?.mature).length;
            chance += maturePlants * 0.1; // Each mature plant adds 10% chance
        }
        
        // Weather affects spirits
        if (gameState.time?.weatherFate === "foggy") chance += 0.15;
        if (gameState.time?.weatherFate === "stormy") chance += 0.1;
        
        // Reputation attracts spirits
        if (currentPlayer.reputation > 10) chance += 0.1;
        
        // Cap at 75% chance
        return Math.min(0.75, chance);
    };

    // Spawn a random spirit in the garden
    const spawnRandomSpirit = () => {
        // Update last appearance time
        lastSpiritAppearance.current = Date.now();
        
        // Select a random spirit type with weighting
        const spiritTypeWeights: [SpiritType, number][] = [
            ['flower', 0.25],
            ['herb', 0.2],
            ['root', 0.15],
            ['mushroom', 0.15],
            ['moon', 0.1],
            ['star', 0.05],
            ['forest', 0.1]
        ];
        
        // Select weighted random spirit type
        let randomNum = Math.random();
        let selectedType: SpiritType = 'flower'; // Default
        for (const [type, weight] of spiritTypeWeights) {
            if (randomNum < weight) {
                selectedType = type;
                break;
            }
            randomNum -= weight;
        }
        
        // Get random spirit from folklore database
        const spiritCategory = spiritFolklore[selectedType];
        const spiritTemplate = spiritCategory[Math.floor(Math.random() * spiritCategory.length)];
        
        // Select random message
        const message = spiritTemplate.messages[Math.floor(Math.random() * spiritTemplate.messages.length)];
        
        // Determine gift if applicable
        let giftType: string | undefined;
        let giftAmount: number | undefined;
        
        if (spiritTemplate.gifts && spiritTemplate.gifts.length > 0) {
            const gift = spiritTemplate.gifts[Math.floor(Math.random() * spiritTemplate.gifts.length)];
            giftType = gift.type;
            giftAmount = Math.floor(Math.random() * (gift.max - gift.min + 1)) + gift.min;
        }
        
        // Create spirit with random position
        const spirit: GardenSpirit = {
            id: `spirit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: selectedType,
            name: spiritTemplate.name,
            message: message,
            position: {
                x: 10 + Math.random() * 80, // 10-90% of width
                y: 10 + Math.random() * 80  // 10-90% of height
            },
            lifespan: 15 + Math.floor(Math.random() * 20), // 15-35 seconds
            entryAnimation: ['fadeIn', 'slideFromLeft', 'slideFromTop', 'spiral'][Math.floor(Math.random() * 4)],
            exitAnimation: ['fadeOut', 'slideRight', 'slideDown', 'spiral'][Math.floor(Math.random() * 4)],
            giftType,
            giftAmount
        };
        
        // Add spirit to state
        setGardenSpirits(prev => [...prev, spirit]);
        
        // Show spirit message
        setCurrentSpiritMessage({text: message, spirit: spiritTemplate.name});
        setSpiritMessageVisible(true);
        
        // Clear previous message timeout
        if (spiritMessageTimeout.current) {
            clearTimeout(spiritMessageTimeout.current);
        }
        
        // Hide message after 5 seconds
        spiritMessageTimeout.current = setTimeout(() => {
            setSpiritMessageVisible(false);
        }, 5000);
        
        // Remove spirit after its lifespan
        setTimeout(() => {
            setGardenSpirits(prev => prev.filter(s => s.id !== spirit.id));
            
            // Apply spirit gift if present
            if (spirit.giftType && spirit.giftAmount && spirit.giftAmount > 0) {
                applyGardenGift(spirit.giftType, spirit.giftAmount);
            }
        }, spirit.lifespan * 1000);
        
        // Log spirit visit for debugging
        console.log(`🌿✨ ${spirit.name} has visited your garden! ✨🌿`);
    };

    // Apply gifts from spirits
    const applyGardenGift = (giftType: string, amount: number) => {
        console.log(`Applying gift: ${giftType} x${amount}`);
        
        // Handle gift based on type
        switch(giftType) {
            case 'gold':
                // Add gold to player
                if (gameState && gameState.players[gameState.currentPlayerIndex]) {
                    const updatedGameState = {...gameState};
                    updatedGameState.players[gameState.currentPlayerIndex].gold += amount;
                    setGameState(updatedGameState);
                    
                    // Show message about gold
                    setCurrentSpiritMessage({
                        text: `You found ${amount} gold in your garden!`,
                        spirit: "Spirit Gift"
                    });
                    setSpiritMessageVisible(true);
                    if (spiritMessageTimeout.current) clearTimeout(spiritMessageTimeout.current);
                    spiritMessageTimeout.current = setTimeout(() => setSpiritMessageVisible(false), 5000);
                }
                break;
                
            case 'fertility':
                // Increase fertility of random plots
                if (gameState && gameState.players[gameState.currentPlayerIndex].garden) {
                    const updatedGameState = {...gameState};
                    const garden = [...updatedGameState.players[gameState.currentPlayerIndex].garden];
                    
                    // Find plots that aren't at max fertility
                    const eligiblePlots = garden.filter(plot => 
                        plot.isUnlocked !== false && plot.fertility !== undefined && plot.fertility < 100
                    );
                    
                    if (eligiblePlots.length > 0) {
                        // Select random plots to enhance
                        const numPlotsToEnhance = Math.min(eligiblePlots.length, Math.ceil(amount / 5));
                        const plotsToEnhance = [...eligiblePlots]
                            .sort(() => 0.5 - Math.random())
                            .slice(0, numPlotsToEnhance);
                        
                        // Apply fertility bonus
                        for (const plot of plotsToEnhance) {
                            if (plot.fertility !== undefined) {
                                plot.fertility = Math.min(100, plot.fertility + amount);
                            }
                        }
                        
                        updatedGameState.players[gameState.currentPlayerIndex].garden = garden;
                        setGameState(updatedGameState);
                        
                        // Show message
                        setCurrentSpiritMessage({
                            text: `The soil in your garden feels enriched and alive!`,
                            spirit: "Spirit Gift"
                        });
                        setSpiritMessageVisible(true);
                        if (spiritMessageTimeout.current) clearTimeout(spiritMessageTimeout.current);
                        spiritMessageTimeout.current = setTimeout(() => setSpiritMessageVisible(false), 5000);
                    }
                }
                break;
                
            case 'growth':
                // Boost growth of planted plots
                if (gameState && gameState.players[gameState.currentPlayerIndex].garden) {
                    const updatedGameState = {...gameState};
                    const garden = [...updatedGameState.players[gameState.currentPlayerIndex].garden];
                    
                    // Find plots with plants that aren't mature
                    const eligiblePlots = garden.filter(plot => 
                        plot.plant && !plot.plant.mature && 
                        plot.plant.growth !== undefined && 
                        plot.plant.maxGrowth !== undefined
                    );
                    
                    if (eligiblePlots.length > 0) {
                        // Apply growth to all eligible plants
                        for (const plot of eligiblePlots) {
                            if (plot.plant && plot.plant.growth !== undefined && plot.plant.maxGrowth !== undefined) {
                                const growthBoost = amount;
                                plot.plant.growth = Math.min(plot.plant.maxGrowth, plot.plant.growth + growthBoost);
                                
                                // Check if plant became mature
                                if (plot.plant.growth >= plot.plant.maxGrowth) {
                                    plot.plant.mature = true;
                                }
                            }
                        }
                        
                        updatedGameState.players[gameState.currentPlayerIndex].garden = garden;
                        setGameState(updatedGameState);
                        
                        // Show message
                        setCurrentSpiritMessage({
                            text: `Your plants seem to have grown while you weren't looking!`,
                            spirit: "Spirit Gift"
                        });
                        setSpiritMessageVisible(true);
                        if (spiritMessageTimeout.current) clearTimeout(spiritMessageTimeout.current);
                        spiritMessageTimeout.current = setTimeout(() => setSpiritMessageVisible(false), 5000);
                    }
                }
                break;
                
            case 'moonblessing':
                // Apply moon blessing to random plants
                if (gameState && gameState.players[gameState.currentPlayerIndex].garden) {
                    const updatedGameState = {...gameState};
                    const garden = [...updatedGameState.players[gameState.currentPlayerIndex].garden];
                    
                    // Find plots with plants that aren't blessed
                    const eligiblePlots = garden.filter(plot => 
                        plot.plant && !plot.plant.moonBlessed
                    );
                    
                    if (eligiblePlots.length > 0) {
                        // Select random plots to bless
                        const numPlotsToBliss = Math.min(eligiblePlots.length, amount);
                        const plotsToBliss = [...eligiblePlots]
                            .sort(() => 0.5 - Math.random())
                            .slice(0, numPlotsToBliss);
                        
                        // Apply blessing
                        for (const plot of plotsToBliss) {
                            if (plot.plant) {
                                plot.plant.moonBlessed = true;
                            }
                        }
                        
                        updatedGameState.players[gameState.currentPlayerIndex].garden = garden;
                        setGameState(updatedGameState);
                        
                        // Show message
                        setCurrentSpiritMessage({
                            text: `Moonlight has touched some of your plants with magic!`,
                            spirit: "Spirit Gift"
                        });
                        setSpiritMessageVisible(true);
                        if (spiritMessageTimeout.current) clearTimeout(spiritMessageTimeout.current);
                        spiritMessageTimeout.current = setTimeout(() => setSpiritMessageVisible(false), 5000);
                    }
                }
                break;
                
            // Additional gift types could be implemented here
            
            default:
                console.log(`Gift type '${giftType}' not implemented yet`);
        }
    };

    // Moonlight Meadow Easter Egg state
    const [moonlightMeadowActive, setMoonlightMeadowActive] = useState<boolean>(false);
    const [spiritPositions, setSpiritPositions] = useState<Array<{x: number, y: number, delay: number}>>([]);

    // Konami Code Easter Egg state
    const konamiSequence = useRef<string[]>([]);
    const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    const [konamiActivated, setKonamiActivated] = useState<boolean>(false);

    // Viewport height fix for mobile browsers
    useEffect(() => {
      // Fix for mobile viewport height (100vh issue)
      const setVh = () => {
        // First we get the viewport height and multiply it by 1% to get a value for a vh unit
        let vh = window.innerHeight * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      // Set the initial value
      setVh();

      // We add an event listener for when the window resizes or orientation changes
      window.addEventListener('resize', setVh);
      window.addEventListener('orientationchange', setVh);

      // We return a function to remove the event listeners when the component unmounts
      return () => {
        window.removeEventListener('resize', setVh);
        window.removeEventListener('orientationchange', setVh);
      };
    }, []);

     // Konami Code Listener Effect
     useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
             // Ignore if typing in an input field
             if (event.target instanceof HTMLInputElement ||
                 event.target instanceof HTMLTextAreaElement ||
                 event.target instanceof HTMLSelectElement) {
                 konamiSequence.current = []; // Reset sequence if typing starts
                 return;
             }

            konamiSequence.current.push(key);
            konamiSequence.current = konamiSequence.current.slice(-konamiCode.length); // Keep only the last N keys

            if (konamiSequence.current.join('') === konamiCode.join('')) {
                console.log('🎉 Ancient Coven Code Activated! 🎉');
                setKonamiActivated(true);
                konamiSequence.current = []; // Reset sequence

                // Example: Briefly show a message
                setError("Konami Code! +10 Gold (Debug)."); // Using error display for quick feedback
                // Check if gameState and player exist before attempting direct modification (though it's commented out)
                 if(gameState && gameState.players[gameState.currentPlayerIndex]){
                    // REMOVED: Unused player variable declaration
                    // const player = gameState.players[gameState.currentPlayerIndex];
                    // Direct state mutation example (discouraged)
                    // setGameState(prev => {
                    //     if (!prev) return null;
                    //     const players = [...prev.players];
                    //     players[prev.currentPlayerIndex] = { ...players[prev.currentPlayerIndex], gold: players[prev.currentPlayerIndex].gold + 10 };
                    //     return { ...prev, players };
                    // });
                 }

                setTimeout(() => setKonamiActivated(false), 3000); // Hide effect after 3s
                setTimeout(() => setError(null), 3500); // Clear message slightly later
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    // Added missing dependencies based on usage within the effect
    }, [gameState, konamiCode, setError, setKonamiActivated]); // Added dependencies


    // Moonlight Meadow Easter Egg Detection
    useEffect(() => {
      // Check if gameState and the current player's data exist
      if (!gameState?.players?.[gameState.currentPlayerIndex]?.garden) {
          // If not active, ensure meadow state is false
          if (moonlightMeadowActive) setMoonlightMeadowActive(false);
          return;
      }

      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      // Added explicit check for array type
      if (!Array.isArray(currentPlayer.garden)) {
          if (moonlightMeadowActive) setMoonlightMeadowActive(false);
          return;
      }


      const totalPlots = currentPlayer.garden.length;
      const healthyPlots = currentPlayer.garden.filter(plot => plot.plant && plot.plant.health > 80 && plot.moisture > 60).length;
      const magicRating = totalPlots > 0 ? healthyPlots / totalPlots : 0;
      const moonBonus = gameState.time.phaseName === "Full Moon" ? 0.2 : 0;
      const magicThreshold = 0.85 - moonBonus; // Slightly higher threshold
      const isNightTime = ["New Moon", "Waning Crescent", "Last Quarter", "Waning Gibbous"].includes(gameState.time.phaseName); // Define night phases

      // Trigger condition: high magic rating, night time, and random chance
      if (magicRating > magicThreshold && isNightTime && Math.random() < 0.15) { // 15% chance if conditions met
        if (!moonlightMeadowActive) {
          console.log("🌙✨ The Moonlight Meadow appears! ✨🌙");
          const newSpirits = Array.from({ length: 10 + Math.floor(Math.random() * 6) }, () => ({ // 10-15 spirits
            x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() * 6
          }));
          setSpiritPositions(newSpirits);
          setMoonlightMeadowActive(true);
        }
      } else if (moonlightMeadowActive) {
        setMoonlightMeadowActive(false); // Deactivate if conditions no longer met
      }
      // Ensure effect runs when relevant state changes
    }, [gameState, moonlightMeadowActive]);


    // Fetch initial game state
    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                setLoading(true);
                const initialState = await apiCall('/state');
                setGameState(initialState);
                setError(null);
            } catch (err) {
                console.error('Error fetching initial game state:', err);
                setError('Failed to connect to the Coven server. Is it running?');
            } finally {
                setTimeout(() => setLoading(false), 800); // Shorter loading time
            }
        };
        fetchInitialState();
    }, []); // Empty dependency array - fetch only on mount

    // --- Action Handlers ---
    const handleApiAction = useCallback(async (
        actionPromise: Promise<GameState>,
        successMessage?: string,
        errorMessagePrefix?: string
    ) => {
        try {
            const newState = await actionPromise;
            setGameState(newState); // Update state with the result from the API
            setError(null); // Clear previous errors
            if (successMessage) console.log(`[Action Success] ${successMessage}`);
        } catch (err) {
            const message = (err instanceof Error) ? err.message : 'An unknown error occurred';
            console.error(errorMessagePrefix || 'Action failed:', err);
            setError(`${errorMessagePrefix || 'Error'}: ${message}`);
        }
    }, []); // No external dependencies needed here

    // Get current player and ID safely
    const currentPlayer = gameState?.players[gameState?.currentPlayerIndex || 0];
    const playerId = currentPlayer?.id;

    // --- Wrapped API Call Functions ---
    // Use useCallback for stable function references passed as props
    const plantSeed = useCallback((slotId: number, seedInventoryItemId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/plant', 'POST', { playerId, slotId, seedItemId: seedInventoryItemId }),
            `Planted seed in slot ${slotId + 1}`, `Planting failed`
        );
    }, [playerId, handleApiAction]);

    const harvestPlant = useCallback((slotId: number) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/harvest', 'POST', { playerId, slotId }),
            `Harvested from slot ${slotId + 1}`, `Harvest failed`
        );
    }, [playerId, handleApiAction]);

    // MODIFIED: waterPlants now accepts puzzleBonus
    const waterPlants = useCallback((puzzleBonus: number = 0) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/water', 'POST', { playerId, puzzleBonus }), // Send bonus to backend
            `Attuned garden energies (Bonus: ${puzzleBonus}%)`, `Attunement failed`
        );
    }, [playerId, handleApiAction]);


    // MODIFIED: brewPotion now accepts puzzleBonus
    const brewPotion = useCallback((ingredientInvItemIds: string[], puzzleBonus: number = 0, recipeId?: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/brew', 'POST', { playerId, ingredientInvItemIds, puzzleBonus }), // Send bonus
            `Brew attempt (Bonus: ${puzzleBonus}%)${recipeId ? ` using recipe ${recipeId}` : ''}`, `Brewing failed`
        );
    }, [playerId, handleApiAction]);

    const buyItem = useCallback((itemId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/market/buy', 'POST', { playerId, itemId }),
            `Purchased ${itemId}`, `Purchase failed`
        );
    }, [playerId, handleApiAction]);

    const sellItem = useCallback((inventoryItemId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/market/sell', 'POST', { playerId, itemId: inventoryItemId }), // API uses 'itemId'
            `Sold item ${inventoryItemId}`, `Sell failed`
        );
    }, [playerId, handleApiAction]);

    const fulfillRequest = useCallback((requestId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/fulfill', 'POST', { playerId, requestId }),
            `Fulfilled request ${requestId}`, `Fulfillment failed`
        );
    }, [playerId, handleApiAction]);

    const advanceDay = useCallback(() => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/end-turn', 'POST', { playerId }),
            'Advanced to next phase', 'Failed to end turn'
        );
    }, [playerId, handleApiAction]);

    const claimRitualReward = useCallback((ritualId: string) => {
        if (!playerId) return;
        handleApiAction(
            apiCall('/ritual/claim', 'POST', { playerId, ritualId }),
            `Claimed reward for ${ritualId}`, 'Failed to claim reward'
        );
    }, [playerId, handleApiAction]);

    // Handle location change with page transition
    const handleChangeLocation = useCallback((location: string) => {
        if (location === currentView || pageTransition) return;
        setPageTransition(true);
        setTimeout(() => {
            setCurrentView(location);
            // End transition *after* view potentially changes content
            setTimeout(() => setPageTransition(false), 150); // Shorter fade-in time
        }, 300); // Wait for fade-out
    }, [currentView, pageTransition]);


    // --- Loading/Error States ---
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <h1>Brewing up your match...</h1>
                    <div className="cauldron-container">
                        <div className="cauldron-body">
                           <div className="cauldron-liquid"></div>
                           <div className="bubble bubble-1"></div>
                           <div className="bubble bubble-2"></div>
                           <div className="bubble bubble-3"></div>
                        </div>
                        <div className="cauldron-legs"><div className="leg"></div><div className="leg"></div><div className="leg"></div></div>
                    </div>
                    <p className="loading-flavor-text">Gathering mystical energies...</p>
                </div>
            </div>
        );
    }

    const ErrorDisplay = () => error && ( // Conditionally render based on error state
        <div className="error-overlay">
            <div className="error-scroll">
                <p>{error}</p>
                <button onClick={() => setError(null)}>X</button> {/* Simple dismiss */}
            </div>
        </div>
    );

    if (!gameState || !currentPlayer) {
        return (
            <div className="error-screen">
                <div className="torn-page">
                    <h1>The Grimoire Remains Closed</h1>
                    <p>{error || 'Failed to load essential game data. The coven remains hidden.'}</p>
                    <div className="cute-familiar">🐾</div> {/* Simple emoji */}
                    <button onClick={() => window.location.reload()}>Retry Connection</button>
                </div>
            </div>
        );
    }

    // Render the garden spirits
    const renderGardenSpirits = () => {
        if (gardenSpirits.length === 0 || currentView !== 'garden') return null;
        
        return (
            <div className="garden-spirits-container">
                {gardenSpirits.map(spirit => (
                    <div
                        key={spirit.id}
                        className={`garden-spirit garden-spirit-${spirit.type} garden-spirit-animation-${spirit.entryAnimation}`}
                        style={{
                            left: `${spirit.position.x}%`,
                            top: `${spirit.position.y}%`,
                            animationDuration: `${spirit.lifespan * 0.8}s`
                        }}
                        title={spirit.name}
                    >
                        {renderSpiritEmoji(spirit.type)}
                    </div>
                ))}
                
                {/* Spirit message display */}
                {spiritMessageVisible && (
                    <div className="garden-spirit-message">
                        <div className="spirit-message-sender">{currentSpiritMessage.spirit}</div>
                        <div className="spirit-message-text">{currentSpiritMessage.text}</div>
                    </div>
                )}
            </div>
        );
    };
    
    // Get emoji for spirit type
    const renderSpiritEmoji = (type: SpiritType) => {
        switch(type) {
            case 'flower': return '🌸';
            case 'herb': return '🌿';
            case 'mushroom': return '🍄';
            case 'root': return '🥕';
            case 'moon': return '🌙';
            case 'star': return '✨';
            case 'forest': return '🌳';
            default: return '✨';
        }
    };

    // --- Main Render ---
    return (
        <div className="game-container">
            <div className="game-frame">
                 {/* HUD is now a fixed sidebar */}
                <HUD
                    playerName={currentPlayer.name}
                    gold={currentPlayer.gold}
                    day={gameState.time.dayCount}
                    lunarPhase={gameState.time.phaseName || 'New Moon'}
                    reputation={currentPlayer.reputation}
                    playerLevel={currentPlayer.atelierLevel}
                    onChangeLocation={handleChangeLocation}
                    onAdvanceDay={advanceDay}
                />

                 {/* Weather Effects Overlay - Covers entire frame */}
                <WeatherEffectsOverlay
                    weatherType={gameState.time.weatherFate}
                    intensity="medium" // Could be dynamic later
                    timeOfDay={["New Moon", "Waning Crescent", "Last Quarter", "Waning Gibbous", "Full Moon"].includes(gameState.time.phaseName) ? 'night' : 'day'} // Include Full Moon as night visual
                    season={gameState.time.season as Season}
                />

                {/* Main game content area */}
                <main className={`game-content ${pageTransition ? 'page-transition' : ''}`}>
                    {/* Scroll decorations are now part of game-content CSS */}
                    <div className="scroll-decoration top-left"></div>
                    <div className="scroll-decoration top-right"></div>
                    <div className="scroll-decoration bottom-left"></div>
                    <div className="scroll-decoration bottom-right"></div>

                    <div className="view-container">
                        {/* Render current view */}
                        {currentView === 'garden' && (
                            <Garden
                                plots={currentPlayer.garden as GardenSlot[]}
                                inventory={currentPlayer.inventory as InventoryItem[]}
                                onPlant={plantSeed}
                                onHarvest={harvestPlant}
                                onWater={waterPlants} // Pass the modified handler
                                weatherFate={gameState.time.weatherFate}
                                season={gameState.time.season as Season}
                            />
                        )}
                        {currentView === 'brewing' && (
                            <Brewing
                                playerInventory={currentPlayer.inventory as InventoryItem[]}
                                knownRecipes={gameState.knownRecipes || []} // Use gameState's knownRecipes
                                lunarPhase={gameState.time.phaseName}
                                playerSpecialization={currentPlayer.atelierSpecialization}
                                onBrew={brewPotion} // Pass the modified handler
                            />
                        )}
                         {currentView === 'atelier' && (
                            <Atelier
                                playerItems={currentPlayer.inventory as InventoryItem[]}
                                // TODO: Implement actual crafting logic/API call
                                onCraftItem={(ingredientIds, resultItemId) => console.log('Craft action TBD', ingredientIds, resultItemId)}
                                lunarPhase={gameState.time.phaseName}
                                playerLevel={currentPlayer.atelierLevel}
                                playerSpecialization={currentPlayer.atelierSpecialization}
                                knownRecipes={gameState.knownRecipes || []} // Pass known recipes
                            />
                        )}
                        {currentView === 'market' && (
                            <Market
                                playerGold={currentPlayer.gold}
                                playerInventory={currentPlayer.inventory as InventoryItem[]}
                                marketItems={gameState.market}
                                rumors={gameState.rumors}
                                townRequests={gameState.townRequests}
                                blackMarketAccess={currentPlayer.blackMarketAccess}
                                onBuyItem={buyItem}
                                onSellItem={sellItem}
                                onFulfillRequest={fulfillRequest}
                            />
                        )}
                        {currentView === 'journal' && (
                            <Journal
                                journal={gameState.journal}
                                rumors={gameState.rumors}
                                rituals={gameState.rituals}
                                time={gameState.time}
                                player={currentPlayer}
                                onClaimRitual={claimRitualReward}
                                // onMarkRead could be added here if needed
                            />
                        )}
                    </div>
                </main>

                {/* Garden Spirits */}
                {renderGardenSpirits()}

                {/* Persistent Error Display */}
                <ErrorDisplay />

                 {/* Moonlight Meadow Easter Egg Overlay */}
                {moonlightMeadowActive && (
                    <div className="moonlight-meadow" onClick={() => setMoonlightMeadowActive(false)}>
                        <div className="moonlight-overlay"></div>
                        <div className="moon-glow"></div>
                        {spiritPositions.map((spirit, i) => (
                            <div key={i} className="meadow-spirit" style={{ left: `${spirit.x}%`, top: `${spirit.y}%`, animationDelay: `${spirit.delay}s` }}/>
                        ))}
                        <div className="meadow-message">Your garden is blessed by moonlight...</div>
                    </div>
                )}

                {/* Ambient Particle Effects Container */}
                <div className="ambient-particles-container">
                    {Array.from({ length: 12 }).map((_, i) => { // Reduced particle count
                        const duration = 15 + Math.random() * 25;
                        const delay = Math.random() * duration; // Ensure varied start times
                        const particleX = -50 + Math.random() * 100;
                        const particleY = -50 + Math.random() * 100;
                        return (
                            <div key={i} className="ambient-particle"
                                style={{
                                    left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                                    animationDelay: `${delay}s`,
                                    animationDuration: `${duration}s`,
                                    '--particle-x': `${particleX}px`, // CSS variable for random movement X
                                    '--particle-y': `${particleY}px`, // CSS variable for random movement Y
                                } as React.CSSProperties}/>
                        );
                    })}
                </div>

                 {/* Konami Code Activation Indicator */}
                 {konamiActivated && (
                    <div className="konami-active-indicator">COVEN CODE ACCEPTED</div>
                 )}

            </div>
        </div>
    );
};

export default App;