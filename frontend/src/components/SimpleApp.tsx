import React, { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GameState, Season, MoonPhase } from 'coven-shared';
import './App.css';
import '../garden-styles.css';
import '../inventory-modal.css';
import '../requests-styles.css';
import '../weather-effects.css';
import '../ritual-styles.css';
import '../spells-styles.css';
import '../skills-styles.css';
import '../puzzle-integration.css';
import BrewingPuzzle from './BrewingPuzzle';
import SeasonalAttunementPuzzle from './SeasonalAttunementPuzzle';

// Basic App that will definitely render without hooks issues
const SimpleApp: React.FC = () => {
  // State for game functionality
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('garden');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Additional state for interactive features
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [activeAction, setActiveAction] = useState<'plant' | 'harvest' | 'water' | 'ritual' | 'cast' | null>(null);
  const [itemFilter, setItemFilter] = useState<string | null>(null);
  const [selectedRitual, setSelectedRitual] = useState<string | null>(null);
  const [selectedRitualItems, setSelectedRitualItems] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpSkill, setLevelUpSkill] = useState<string | null>(null);
  
  // Puzzle states
  const [showBrewingPuzzle, setShowBrewingPuzzle] = useState<boolean>(false);
  const [showSeasonalPuzzle, setShowSeasonalPuzzle] = useState<boolean>(false);
  const [puzzleBonus, setPuzzleBonus] = useState<number>(0);
  
  // Cross-breeding states
  const [showCrossBreeding, setShowCrossBreeding] = useState<boolean>(false);
  
  // Garden actions
  const plantSeed = (plotId: number, seedId: string) => {
    if (!gameState) return;
    
    try {
      // Find the seed in the inventory
      const player = gameState.players[gameState.currentPlayerIndex];
      const seed = player.inventory.find(item => item.id === seedId);
      
      if (!seed) {
        setErrorMessage("Seed not found in inventory!");
        return;
      }
      
      if (seed.quantity <= 0) {
        setErrorMessage("You don't have any of this seed left!");
        return;
      }
      
      const plot = player.garden.find(p => p.id === plotId);
      if (!plot) {
        setErrorMessage("Garden plot not found!");
        return;
      }
      
      if (plot.plant) {
        setErrorMessage("This plot already has a plant!");
        return;
      }
      
      // Create a new plant
      const newPlant = {
        id: `plant-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: seed.name.replace(' Seeds', ''),
        growth: 0,
        maxGrowth: 100,
        watered: false,
        health: 100,
        age: 0,
        mature: false,
      };
      
      // Update the garden plot
      const updatedGarden = player.garden.map(p => 
        p.id === plotId ? {...p, plant: newPlant} : p
      );
      
      // Update the inventory (reduce seed quantity)
      const updatedInventory = player.inventory.map(item => 
        item.id === seedId 
          ? {...item, quantity: item.quantity - 1} 
          : item
      ).filter(item => item.quantity > 0); // Remove if quantity becomes 0
      
      // Update the player
      const updatedPlayer = {
        ...player,
        garden: updatedGarden,
        inventory: updatedInventory
      };
      
      // Update the game state
      const updatedGameState = {
        ...gameState,
        players: gameState.players.map((p, idx) => 
          idx === gameState.currentPlayerIndex ? updatedPlayer : p
        )
      };
      
      setGameState(updatedGameState as GameState);
      
      // Award gardening experience for planting
      addSkillExperience('gardening', 10);
      
      setErrorMessage(null);
      setActiveAction(null);
      setSelectedPlot(null);
      setSelectedItem(null);
      setShowInventoryModal(false);
    } catch (err) {
      console.error('Error planting seed:', err);
      setErrorMessage('Failed to plant seed.');
    }
  };
  
  const harvestPlant = (plotId: number) => {
    if (!gameState) return;
    
    try {
      const player = gameState.players[gameState.currentPlayerIndex];
      const plot = player.garden.find(p => p.id === plotId);
      
      if (!plot) {
        setErrorMessage("Garden plot not found!");
        return;
      }
      
      if (!plot.plant) {
        setErrorMessage("No plant to harvest!");
        return;
      }
      
      if (!plot.plant.mature) {
        setErrorMessage("Plant is not ready for harvest yet!");
        return;
      }
      
      // Create harvested item
      const harvestedItem = {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        baseId: plot.plant.id.split('-')[0],
        name: plot.plant.name,
        type: 'ingredient' as const,
        category: 'herb' as const,
        quantity: 1 + Math.floor(Math.random() * 3), // Random 1-3 quantity
        quality: Math.floor(70 + (plot.plant.health / 10)), // Quality based on plant health
        value: 10 + Math.floor(Math.random() * 20),
        description: `A freshly harvested ${plot.plant.name}.`,
      };
      
      // Check if we already have this item and merge if so
      const existingItemIndex = player.inventory.findIndex(
        item => item.name === harvestedItem.name && item.type === harvestedItem.type
      );
      
      let updatedInventory;
      if (existingItemIndex >= 0) {
        // Merge with existing item
        updatedInventory = player.inventory.map((item, idx) => 
          idx === existingItemIndex 
            ? {...item, quantity: item.quantity + harvestedItem.quantity} 
            : item
        );
      } else {
        // Add as new item
        updatedInventory = [...player.inventory, harvestedItem];
      }
      
      // Clear the plot
      const updatedGarden = player.garden.map(p => 
        p.id === plotId ? {...p, plant: null} : p
      );
      
      // Update the player
      const updatedPlayer = {
        ...player,
        garden: updatedGarden,
        inventory: updatedInventory
      };
      
      // Update the game state
      const updatedGameState = {
        ...gameState,
        players: gameState.players.map((p, idx) => 
          idx === gameState.currentPlayerIndex ? updatedPlayer : p
        )
      };
      
      setGameState(updatedGameState as GameState);
      
      // Award gardening and herbalism experience for harvesting
      addSkillExperience('gardening', 15);
      addSkillExperience('herbalism', 10);
      
      setErrorMessage(null);
      setActiveAction(null);
      setSelectedPlot(null);
    } catch (err) {
      console.error('Error harvesting plant:', err);
      setErrorMessage('Failed to harvest plant.');
    }
  };
  
  const waterPlants = () => {
    if (!gameState) return;
    
    try {
      const player = gameState.players[gameState.currentPlayerIndex];
      
      // Water all plants that aren't already at max moisture
      const updatedGarden = player.garden.map(plot => {
        if (plot.moisture < 100) {
          return {
            ...plot,
            moisture: Math.min(100, plot.moisture + 30) // Increase moisture by 30%, max 100
          };
        }
        return plot;
      });
      
      // Update the player
      const updatedPlayer = {
        ...player,
        garden: updatedGarden
      };
      
      // Update the game state
      const updatedGameState = {
        ...gameState,
        players: gameState.players.map((p, idx) => 
          idx === gameState.currentPlayerIndex ? updatedPlayer : p
        )
      };
      
      setGameState(updatedGameState as GameState);
      setErrorMessage(null);
      setActiveAction(null);
    } catch (err) {
      console.error('Error watering plants:', err);
      setErrorMessage('Failed to water plants.');
    }
  };
  
  // Market actions
  const buyItem = (itemId: string) => {
    if (!gameState) return;
    
    try {
      const player = gameState.players[gameState.currentPlayerIndex];
      const item = gameState.market.find(i => i.id === itemId);
      
      if (!item) {
        setErrorMessage("Item not found in market!");
        return;
      }
      
      if (player.gold < item.price) {
        setErrorMessage("Not enough gold to buy this item!");
        return;
      }
      
      // Create inventory item
      const boughtItem = {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        baseId: item.id,
        name: item.name,
        type: item.type,
        category: item.category,
        quantity: 1,
        quality: 80, // Market items have good quality
        value: item.price,
        description: item.description || `A ${item.name} bought from the market.`,
      };
      
      // Check if we already have this item and merge if so
      const existingItemIndex = player.inventory.findIndex(
        i => i.name === boughtItem.name && i.type === boughtItem.type
      );
      
      let updatedInventory;
      if (existingItemIndex >= 0) {
        // Merge with existing item
        updatedInventory = player.inventory.map((i, idx) => 
          idx === existingItemIndex 
            ? {...i, quantity: i.quantity + boughtItem.quantity} 
            : i
        );
      } else {
        // Add as new item
        updatedInventory = [...player.inventory, boughtItem];
      }
      
      // Update the player's gold
      const updatedPlayer = {
        ...player,
        gold: player.gold - item.price,
        inventory: updatedInventory
      };
      
      // Update the game state
      const updatedGameState = {
        ...gameState,
        players: gameState.players.map((p, idx) => 
          idx === gameState.currentPlayerIndex ? updatedPlayer : p
        )
      };
      
      setGameState(updatedGameState as GameState);
      setErrorMessage(null);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error buying item:', err);
      setErrorMessage('Failed to buy item.');
    }
  };
  
  const sellItem = (inventoryItemId: string) => {
    if (!gameState) return;
    
    try {
      const player = gameState.players[gameState.currentPlayerIndex];
      const item = player.inventory.find(i => i.id === inventoryItemId);
      
      if (!item) {
        setErrorMessage("Item not found in inventory!");
        return;
      }
      
      // Calculate sell price (70% of value)
      const sellPrice = Math.floor((item.value || 10) * 0.7);
      
      // Remove one from inventory or reduce quantity
      let updatedInventory;
      if (item.quantity > 1) {
        updatedInventory = player.inventory.map(i => 
          i.id === inventoryItemId 
            ? {...i, quantity: i.quantity - 1} 
            : i
        );
      } else {
        // Remove completely if only one left
        updatedInventory = player.inventory.filter(i => i.id !== inventoryItemId);
      }
      
      // Update the player's gold
      const updatedPlayer = {
        ...player,
        gold: player.gold + sellPrice,
        inventory: updatedInventory
      };
      
      // Update the game state
      const updatedGameState = {
        ...gameState,
        players: gameState.players.map((p, idx) => 
          idx === gameState.currentPlayerIndex ? updatedPlayer : p
        )
      };
      
      setGameState(updatedGameState as GameState);
      setErrorMessage(null);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error selling item:', err);
      setErrorMessage('Failed to sell item.');
    }
  };
  
  // Handle brewing puzzle completion
  const handleBrewingPuzzleComplete = (result: { success: boolean; bonus: number; message: string }) => {
    if (result.success) {
      setPuzzleBonus(result.bonus);
      setErrorMessage(`Brewing puzzle completed! ${result.message}`);
      
      // Add brewing experience for completing the puzzle
      addSkillExperience('brewing', 25);
    } else {
      setErrorMessage(`Brewing puzzle failed. ${result.message}`);
      
      // Add a little brewing experience even for failing
      addSkillExperience('brewing', 10);
    }
    
    setShowBrewingPuzzle(false);
  };
  
  // Handle seasonal attunement puzzle completion
  const handleSeasonalPuzzleComplete = (result: { success: boolean; bonus: number; message: string }) => {
    if (result.success) {
      setPuzzleBonus(result.bonus);
      setErrorMessage(`Seasonal attunement completed! ${result.message}`);
      
      // Add gardening and herbalism experience
      addSkillExperience('gardening', 20);
      addSkillExperience('herbalism', 15);
    } else {
      setErrorMessage(`Seasonal attunement failed. ${result.message}`);
      
      // Add a little experience even for failing
      addSkillExperience('gardening', 8);
      addSkillExperience('herbalism', 5);
    }
    
    setShowSeasonalPuzzle(false);
  };
  
  // Handle puzzle skipping
  const handlePuzzleSkip = () => {
    setPuzzleBonus(0);
    setShowBrewingPuzzle(false);
    setShowSeasonalPuzzle(false);
    setErrorMessage("Puzzle skipped. No bonus acquired.");
  };
  
  // Handle cross-breeding of plants
  const handleCrossBreed = async (plant1Id: string, plant2Id: string) => {
    if (!gameState) return { success: false, message: "Game state not initialized", rarityTier: 0 };
    
    const player = gameState.players[gameState.currentPlayerIndex];
    
    // Find the plants in the garden
    const plot1 = player.garden.find(plot => plot.plant && plot.plant.id === plant1Id);
    const plot2 = player.garden.find(plot => plot.plant && plot.plant.id === plant2Id);
    
    if (!plot1 || !plot2 || !plot1.plant || !plot2.plant) {
      return { 
        success: false, 
        message: "One or both plants could not be found",
        rarityTier: 0
      };
    }
    
    // Check if plants are mature
    if (!plot1.plant.mature || !plot2.plant.mature) {
      return { 
        success: false, 
        message: "Both plants must be mature for cross-breeding",
        rarityTier: 0
      };
    }
    
    // Get plant names for easier reference
    const plant1Name = plot1.plant.name;
    const plant2Name = plot2.plant.name;
    
    // Calculate success chance
    // Base chance affected by player gardening skill, moon phase, plant health
    let successChance = 0.5; // 50% base chance
    
    // Skill bonus (0-25%)
    const skillBonus = (player.skills.gardening || 1) * 0.05;
    successChance += skillBonus;
    
    // Moon phase bonus
    if (gameState.time.phaseName === 'Full Moon') {
      successChance += 0.2; // +20% during full moon
    } else if (gameState.time.phaseName === 'New Moon') {
      successChance -= 0.1; // -10% during new moon
    } else if (gameState.time.phaseName.includes('Waxing')) {
      successChance += 0.05; // +5% during waxing phases
    }
    
    // Plant health bonus (up to 10%)
    const healthBonus = ((plot1.plant.health + plot2.plant.health) / 200) * 0.1;
    successChance += healthBonus;
    
    // Same type bonus
    const sameType = plant1Name.includes(plant2Name) || plant2Name.includes(plant1Name);
    if (sameType) {
      successChance += 0.15; // +15% for same type
    }
    
    // Cap success chance
    successChance = Math.min(Math.max(successChance, 0.1), 0.9);
    
    // Roll for success
    const roll = Math.random();
    const success = roll <= successChance;
    
    // If successful, create a new variety
    if (success) {
      // Generate a new variety name (combine parts of parent names)
      const part1 = plant1Name.split(' ')[0];
      const part2 = plant2Name.split(' ')[0];
      
      // Create variety name based on parent parts
      let newVarietyName;
      if (Math.random() < 0.5) {
        newVarietyName = `${part1}-${part2} Hybrid`;
      } else {
        // Sometimes create a more unique name
        const prefixes = ['Mystic', 'Enchanted', 'Arcane', 'Whispering', 'Lunar', 'Solar', 'Twilight'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        newVarietyName = `${prefix} ${part1}${part2}`;
      }
      
      // Determine rarity tier (1-4)
      const rarityRoll = Math.random();
      let rarityTier = 1; // Common
      
      if (rarityRoll > 0.98) {
        rarityTier = 4; // Legendary (2%)
      } else if (rarityRoll > 0.9) {
        rarityTier = 3; // Rare (8%)
      } else if (rarityRoll > 0.7) {
        rarityTier = 2; // Uncommon (20%)
      }
      
      // Determine what traits/mutations the new plant inherits
      const traitInheritance = {
        fromParent1: [{ name: 'Growth Rate', description: 'Inherits growth pattern' }],
        fromParent2: [{ name: 'Resilience', description: 'Inherits environmental adaptability' }],
        newMutations: [] as Array<{ name: string, description?: string }>
      };
      
      // Chance for mutations based on rarity
      if (rarityTier >= 2) {
        const possibleMutations = [
          { name: 'Fast Growing', description: 'Grows 20% faster than normal plants' },
          { name: 'Drought Resistant', description: 'Requires less water to thrive' },
          { name: 'Bountiful', description: 'Produces more yield when harvested' },
          { name: 'Vibrant', description: 'Enhanced pigmentation and visual appeal' },
          { name: 'Ethereal', description: 'Slight glow under moonlight' }
        ];
        
        // Add 1-3 mutations based on rarity
        const mutationCount = rarityTier === 4 ? 3 : (rarityTier === 3 ? 2 : 1);
        const shuffledMutations = [...possibleMutations].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < mutationCount && i < shuffledMutations.length; i++) {
          traitInheritance.newMutations.push(shuffledMutations[i]);
        }
      }
      
      // Create seeds from the cross-breeding result
      const newSeedId = `seed-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newSeed = {
        id: newSeedId,
        baseId: 'hybrid-seed',
        name: `${newVarietyName} Seeds`,
        type: 'seed',
        category: 'seed',
        quantity: rarityTier === 4 ? 1 : (rarityTier === 3 ? 2 : 3),
        quality: 80 + (rarityTier * 5),
        value: 20 * rarityTier,
        description: `Seeds from the cross-breeding of ${plant1Name} and ${plant2Name}.`,
        mutations: traitInheritance.newMutations.map(m => m.name)
      };
      
      // Add the seeds to player's inventory
      const updatedInventory = [...player.inventory, newSeed];
      
      // Consume the parent plants (they're used up in cross-breeding)
      const updatedGarden = player.garden.map(plot => {
        if ((plot.plant && plot.plant.id === plant1Id) || (plot.plant && plot.plant.id === plant2Id)) {
          return { ...plot, plant: null };
        }
        return plot;
      });
      
      // Update the player
      const updatedPlayer = {
        ...player,
        garden: updatedGarden,
        inventory: updatedInventory
      };
      
      // Update game state
      setGameState({
        ...gameState,
        players: gameState.players.map((p, idx) => 
          idx === gameState.currentPlayerIndex ? updatedPlayer : p
        )
      } as GameState);
      
      // Add gardening experience
      addSkillExperience('gardening', 30);
      
      // Return success result
      return {
        success: true,
        newVarietyId: newSeedId,
        newVarietyName,
        traitInheritance,
        rarityTier,
        message: `Cross-breeding successful! You've created ${newVarietyName} seeds.`
      };
    } else {
      // Failed cross-breeding
      // Still give some experience for the attempt
      addSkillExperience('gardening', 10);
      
      return {
        success: false,
        rarityTier: 0,
        message: "The cross-breeding attempt failed. The plants were not compatible enough."
      };
    }
  };

  // Add function to advance the day with growth calculations
  const advanceDay = () => {
    if (!gameState) return;
    
    try {
      // Get the current player
      const player = gameState.players[gameState.currentPlayerIndex];
      
      // Update each plant's growth and health
      const updatedGarden = player.garden.map(plot => {
        if (!plot.plant) return plot;
        
        // Calculate growth based on moisture and fertility
        let growthFactor = (plot.moisture / 100) * (plot.fertility / 100);
        
        // Apply seasonal puzzle bonus if available
        if (puzzleBonus > 0) {
          growthFactor *= (1 + (puzzleBonus / 100));
        }
        
        const growthIncrease = Math.floor(10 * growthFactor);
        
        // Calculate health changes
        let healthChange = 0;
        if (plot.moisture < 30) healthChange -= 10; // Drought damage
        if (plot.moisture > 30) healthChange += 5; // Some recovery
        
        // Check if plant reaches maturity
        const newGrowth = Math.min(plot.plant.maxGrowth, plot.plant.growth + growthIncrease);
        const becomesMature = newGrowth >= plot.plant.maxGrowth && !plot.plant.mature;
        
        // Reduce moisture as time passes
        const newMoisture = Math.max(0, plot.moisture - 20);
        
        return {
          ...plot,
          moisture: newMoisture,
          plant: {
            ...plot.plant,
            growth: newGrowth,
            health: Math.max(0, Math.min(100, plot.plant.health + healthChange)),
            age: plot.plant.age + 1,
            mature: becomesMature || plot.plant.mature
          }
        };
      });
      
      // Regenerate mana each day
      const baseManaRegen = 5; // Base mana regeneration
      
      // Moon phase affects mana regeneration
      let moonPhaseManaBonus = 0;
      if (gameState.time.phaseName === 'Full Moon') {
        moonPhaseManaBonus = 10; // Significant bonus during Full Moon
      } else if (gameState.time.phaseName === 'New Moon') {
        moonPhaseManaBonus = -2; // Penalty during New Moon
      } else if (gameState.time.phaseName.includes('Waxing')) {
        moonPhaseManaBonus = 3; // Small bonus during waxing phases
      }
      
      // Weather affects mana regeneration
      let weatherManaEffect = 0;
      if (gameState.time.weatherFate === 'stormy') {
        weatherManaEffect = 5; // Bonus during storms
      } else if (gameState.time.weatherFate === 'foggy') {
        weatherManaEffect = 3; // Small bonus during fog
      } else if (gameState.time.weatherFate === 'clear') {
        weatherManaEffect = 2; // Tiny bonus during clear weather
      }
      
      // Calculate total mana regeneration
      const manaRegenAmount = Math.max(0, baseManaRegen + moonPhaseManaBonus + weatherManaEffect);
      
      // Max mana scales with astrology skill
      const maxMana = 100 + (player.skills?.astrology || 0) * 10;
      
      // Update the player with new mana value
      const updatedPlayer = {
        ...player,
        garden: updatedGarden,
        mana: Math.min(maxMana, player.mana + manaRegenAmount)
      };
      
      // Generate new town requests occasionally
      const generateNewRequests = () => {
        // 50% chance to add a new request each day
        if (Math.random() < 0.5) {
          const possibleItems = [
            "Moonleaf", "Midnight Nightshade", "Clear Quartz", "Shadow Root",
            "Moon Blossom", "Witch Hazel", "Emberberry", "Mystic Sage"
          ];
          const possibleRequesters = [
            "Village Healer", "Town Guard", "Mystic Scholar", "Local Farmer",
            "Alchemist", "Blacksmith", "Inn Keeper", "Fortune Teller"
          ];
          
          const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];
          const requester = possibleRequesters[Math.floor(Math.random() * possibleRequesters.length)];
          const quantity = Math.floor(Math.random() * 3) + 1; // 1-3
          const rewardGold = Math.floor((quantity * 15) + (Math.random() * 20));
          const rewardInfluence = Math.floor((quantity * 2) + (Math.random() * 3));
          const difficulty = Math.floor(Math.random() * 3) + 1; // 1-3
          
          return {
            id: `request-${Date.now()}`,
            requester,
            item,
            quantity,
            rewardGold,
            rewardInfluence,
            difficulty,
            description: `I need ${quantity} ${item} for my work.`
          };
        }
        return null;
      };
      
      // Try to generate a new request
      const newRequest = generateNewRequests();
      let updatedRequests = gameState.townRequests || [];
      if (newRequest) {
        updatedRequests = [...updatedRequests, newRequest];
      }
      
      // Limit to max 5 requests
      if (updatedRequests.length > 5) {
        updatedRequests = updatedRequests.slice(-5);
      }
      
      // Create updated game state with new day
      const nextDay = {
        ...gameState,
        players: gameState.players.map((p, idx) => 
          idx === gameState.currentPlayerIndex ? updatedPlayer : p
        ),
        time: {
          ...gameState.time,
          dayCount: gameState.time.dayCount + 1,
          // Cycle through moon phases
          phase: (gameState.time.phase + 1) % 8,
          phaseName: getNextMoonPhase(gameState.time.phaseName),
          // Weather - use controlled weather if active, otherwise random
          weatherFate: gameState.weatherControl?.active 
            ? gameState.weatherControl.weather 
            : getRandomWeather() as any,
        },
        // Reset weather control after using it
        weatherControl: gameState.weatherControl?.active 
          ? { active: false, weather: null } 
          : gameState.weatherControl,
        townRequests: updatedRequests
      };
      
      setGameState(nextDay as GameState);
      setErrorMessage(null);
    } catch (err) {
      console.error('Error advancing day:', err);
      setErrorMessage('Failed to advance to the next day.');
    }
  };
  
  // Helper function to get the next moon phase
  const getNextMoonPhase = (currentPhase: string): MoonPhase => {
    const phases: MoonPhase[] = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                   'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    const currentIndex = phases.indexOf(currentPhase as MoonPhase);
    if (currentIndex === -1) return 'New Moon';
    return phases[(currentIndex + 1) % phases.length];
  };
  
  // Spell system data
  const availableSpells = [
    {
      id: "spell-grow",
      name: "Accelerated Growth",
      description: "Magically speed up the growth of a selected plant.",
      manaCost: 15,
      skillAffinity: "herbalism",
      target: "plant",
      castTime: 1,
      effects: {
        growthBoost: 20,
        healthBoost: 10
      }
    },
    {
      id: "spell-fertility",
      name: "Soil Enrichment",
      description: "Enhance the fertility of a garden plot.",
      manaCost: 20,
      skillAffinity: "herbalism",
      target: "plot",
      castTime: 1,
      effects: {
        fertilityBoost: 15
      }
    },
    {
      id: "spell-water",
      name: "Aqua Summon",
      description: "Magically hydrate all garden plots.",
      manaCost: 25,
      skillAffinity: "herbalism",
      target: "garden",
      castTime: 2,
      effects: {
        moistureBoost: 50
      }
    },
    {
      id: "spell-quality",
      name: "Essence Infusion",
      description: "Infuse a brewing potion with magical essence to improve quality.",
      manaCost: 30,
      skillAffinity: "brewing",
      target: "potion",
      castTime: 2,
      effects: {
        qualityBoost: 20
      }
    },
    {
      id: "spell-weather",
      name: "Weather Influence",
      description: "Attempt to influence tomorrow's weather.",
      manaCost: 40,
      skillAffinity: "astrology",
      target: "weather",
      castTime: 3,
      effects: {
        weatherControl: true
      }
    }
  ];
  
  // Cast a spell
  const castSpell = (spellId: string, targetId?: number) => {
    if (!gameState) return;
    
    try {
      const player = gameState.players[gameState.currentPlayerIndex];
      const spell = availableSpells.find(s => s.id === spellId);
      
      if (!spell) {
        setErrorMessage("Spell not found!");
        return;
      }
      
      // Check if player has enough mana
      if (player.mana < spell.manaCost) {
        setErrorMessage(`Not enough mana! Needed: ${spell.manaCost}, Have: ${player.mana}`);
        return;
      }
      
      // Determine spell success chance based on relevant skill
      let successChance = 70; // Base success chance
      
      if (spell.skillAffinity === 'herbalism') {
        successChance += player.skills.herbalism * 5;
      } else if (spell.skillAffinity === 'brewing') {
        successChance += player.skills.brewing * 5;
      } else if (spell.skillAffinity === 'astrology') {
        successChance += player.skills.astrology * 5;
      }
      
      // Moon phase can affect spell success
      if (gameState.time.phaseName === 'Full Moon') {
        successChance += 15;
      } else if (gameState.time.phaseName === 'New Moon') {
        successChance -= 10;
      }
      
      // Check for success
      const spellRoll = Math.random() * 100;
      const spellSuccess = spellRoll <= successChance;
      
      // Consume mana regardless of success
      let updatedPlayer = {
        ...player,
        mana: player.mana - spell.manaCost
      };
      
      if (spellSuccess) {
        // Apply spell effects based on the spell type
        switch (spell.id) {
          case 'spell-grow':
            if (targetId !== undefined && spell.target === 'plant') {
              // Find the target plot
              const plotIndex = updatedPlayer.garden.findIndex(p => p.id === targetId);
              
              if (plotIndex >= 0 && updatedPlayer.garden[plotIndex].plant) {
                // Update the plant's growth and health
                const updatedGarden = [...updatedPlayer.garden];
                const plot = updatedGarden[plotIndex];
                
                if (plot.plant) {
                  updatedGarden[plotIndex] = {
                    ...plot,
                    plant: {
                      ...plot.plant,
                      growth: Math.min(plot.plant.maxGrowth, plot.plant.growth + spell.effects.growthBoost),
                      health: Math.min(100, plot.plant.health + spell.effects.healthBoost),
                      // If growth reached max, set mature to true
                      mature: plot.plant.growth + spell.effects.growthBoost >= plot.plant.maxGrowth ? true : plot.plant.mature
                    }
                  };
                }
                
                updatedPlayer = {
                  ...updatedPlayer,
                  garden: updatedGarden
                };
                
                setErrorMessage(`Spell successful! The plant grows noticeably before your eyes.`);
              } else {
                setErrorMessage(`Spell failed! No plant found at the target location.`);
              }
            }
            break;
            
          case 'spell-fertility':
            if (targetId !== undefined && spell.target === 'plot') {
              // Find the target plot
              const plotIndex = updatedPlayer.garden.findIndex(p => p.id === targetId);
              
              if (plotIndex >= 0) {
                // Update the plot's fertility
                const updatedGarden = [...updatedPlayer.garden];
                const plot = updatedGarden[plotIndex];
                
                updatedGarden[plotIndex] = {
                  ...plot,
                  fertility: Math.min(100, plot.fertility + spell.effects.fertilityBoost)
                };
                
                updatedPlayer = {
                  ...updatedPlayer,
                  garden: updatedGarden
                };
                
                setErrorMessage(`Spell successful! The soil becomes richer and more fertile.`);
              } else {
                setErrorMessage(`Spell failed! No garden plot found at the target location.`);
              }
            }
            break;
            
          case 'spell-water':
            if (spell.target === 'garden') {
              // Update all plots' moisture
              const updatedGarden = updatedPlayer.garden.map(plot => ({
                ...plot,
                moisture: Math.min(100, plot.moisture + spell.effects.moistureBoost)
              }));
              
              updatedPlayer = {
                ...updatedPlayer,
                garden: updatedGarden
              };
              
              setErrorMessage(`Spell successful! Water droplets materialize and soak into the soil of your garden.`);
            }
            break;
            
          case 'spell-weather':
            if (spell.target === 'weather') {
              // Allow player to choose the weather for tomorrow
              const selectedWeather = prompt(
                'Choose weather for tomorrow (clear, cloudy, rainy, stormy, foggy, windy):',
                'clear'
              );
              
              if (selectedWeather && 
                  ['clear', 'cloudy', 'rainy', 'stormy', 'foggy', 'windy'].includes(selectedWeather)) {
                // Store the player's choice to apply during the next day change
                setGameState({
                  ...gameState,
                  weatherControl: {
                    active: true,
                    weather: selectedWeather
                  },
                  players: gameState.players.map((p, idx) => 
                    idx === gameState.currentPlayerIndex ? updatedPlayer : p
                  )
                } as GameState);
                
                setErrorMessage(`Spell successful! You've influenced tomorrow's weather to be ${selectedWeather}.`);
              } else {
                setErrorMessage(`Spell failed! Invalid weather type selected.`);
              }
              break;
            }
            break;
            
          default:
            setErrorMessage(`Spell successful! Magical energies swirl around you.`);
        }
      } else {
        setErrorMessage(`The spell fizzles and fails. Your mana is still consumed.`);
      }
      
      // Final state update if not already updated
      if (spell.id !== 'spell-weather' || !spellSuccess) {
        setGameState({
          ...gameState,
          players: gameState.players.map((p, idx) => 
            idx === gameState.currentPlayerIndex ? updatedPlayer : p
          )
        } as GameState);
      }
      
      // Award skill experience based on the spell type
      if (spellSuccess) {
        if (spell.skillAffinity === 'herbalism') {
          addSkillExperience('herbalism', 20);
        } else if (spell.skillAffinity === 'brewing') {
          addSkillExperience('brewing', 20);
        } else if (spell.skillAffinity === 'astrology') {
          addSkillExperience('astrology', 25);
        }
      } else {
        // Even failed spells provide some experience
        if (spell.skillAffinity === 'herbalism') {
          addSkillExperience('herbalism', 5);
        } else if (spell.skillAffinity === 'brewing') {
          addSkillExperience('brewing', 5);
        } else if (spell.skillAffinity === 'astrology') {
          addSkillExperience('astrology', 7);
        }
      }
      
      // Reset selection
      setSelectedSpell(null);
      setActiveAction(null);
      setSelectedPlot(null);
      
    } catch (err) {
      console.error('Error casting spell:', err);
      setErrorMessage('Something went wrong with the spell.');
    }
  };
  
  // Ritual system
  const performRitual = (ritualId: string, items: string[]) => {
    if (!gameState) return;
    
    try {
      const player = gameState.players[gameState.currentPlayerIndex];
      const ritual = gameState.rituals?.find(r => r.id === ritualId);
      
      if (!ritual) {
        setErrorMessage("Ritual not found!");
        return;
      }
      
      // Check if we have all required items
      const requiredItems = ritual.requiredItems || [];
      const playerItems = items.map(itemId => player.inventory.find(i => i.id === itemId));
      
      if (playerItems.some(item => !item)) {
        setErrorMessage("Missing some required items for this ritual!");
        return;
      }
      
      // Check if ritual has moon phase requirements
      if (ritual.moonPhaseRequirement && 
          ritual.moonPhaseRequirement !== gameState.time.phaseName) {
        setErrorMessage(`This ritual requires the ${ritual.moonPhaseRequirement} moon phase!`);
        return;
      }
      
      // Check if ritual has season requirements
      if (ritual.seasonRequirement && 
          ritual.seasonRequirement !== gameState.time.season) {
        setErrorMessage(`This ritual requires the ${ritual.seasonRequirement} season!`);
        return;
      }
      
      // Calculate ritual success chance
      let successChance = ritual.baseSuccessChance || 70;
      
      // Adjust for player skills
      if (ritual.skillAffinity === 'astrology') {
        successChance += player.skills.astrology * 5;
      } else if (ritual.skillAffinity === 'herbalism') {
        successChance += player.skills.herbalism * 5;
      }
      
      // Adjust for moon phase
      if (ritual.moonPhaseRequirement && 
          ritual.moonPhaseRequirement === gameState.time.phaseName) {
        successChance += 20;
      }
      
      // Check for success
      const ritualRoll = Math.random() * 100;
      const ritualSuccess = ritualRoll <= successChance;
      
      // Remove consumed items from inventory
      const updatedInventory = [...player.inventory];
      for (const itemId of items) {
        const itemIndex = updatedInventory.findIndex(i => i.id === itemId);
        if (itemIndex >= 0) {
          const item = updatedInventory[itemIndex];
          if (item.quantity > 1) {
            updatedInventory[itemIndex] = {
              ...item,
              quantity: item.quantity - 1
            };
          } else {
            updatedInventory.splice(itemIndex, 1);
          }
        }
      }
      
      let updatedPlayer = {
        ...player,
        inventory: updatedInventory
      };
      
      // Apply ritual effects if successful
      if (ritualSuccess) {
        // Add ritual to completed rituals
        updatedPlayer = {
          ...updatedPlayer,
          completedRituals: [...(updatedPlayer.completedRituals || []), ritual.id]
        };
        
        // Apply ritual rewards
        if (ritual.rewards?.mana) {
          updatedPlayer.mana += ritual.rewards.mana;
        }
        
        if (ritual.rewards?.reputation) {
          updatedPlayer.reputation += ritual.rewards.reputation;
        }
        
        if (ritual.rewards?.gold) {
          updatedPlayer.gold += ritual.rewards.gold;
        }
        
        // Add any reward items
        if (ritual.rewards?.items?.length) {
          for (const rewardItem of ritual.rewards.items) {
            const newItem = {
              id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              baseId: rewardItem.id,
              name: rewardItem.name,
              type: rewardItem.type,
              category: rewardItem.category,
              quantity: rewardItem.quantity || 1,
              quality: rewardItem.quality || 80,
              value: rewardItem.value || 50,
              description: rewardItem.description || `A mystical item created through the ${ritual.name} ritual.`
            };
            
            updatedPlayer.inventory.push(newItem);
          }
        }
        
        // Unlock any new rituals
        if (ritual.rewards?.unlocksRituals?.length) {
          const newRituals = [
            ...(gameState.rituals || []),
            ...ritual.rewards.unlocksRituals.filter(
              r => !(gameState.rituals || []).some(existing => existing.id === r.id)
            )
          ];
          
          // Update game state with new rituals
          setGameState({
            ...gameState,
            rituals: newRituals,
            players: gameState.players.map((p, idx) => 
              idx === gameState.currentPlayerIndex ? updatedPlayer : p
            )
          } as GameState);
          
          setErrorMessage(`Ritual successful! You've unlocked new rituals!`);
        } else {
          // Update game state without new rituals
          setGameState({
            ...gameState,
            players: gameState.players.map((p, idx) => 
              idx === gameState.currentPlayerIndex ? updatedPlayer : p
            )
          } as GameState);
          
          setErrorMessage(`Ritual successful! You feel the magic coursing through you.`);
        }
        
        // Award skill experience based on ritual affinity
        if (ritual.skillAffinity === 'astrology') {
          addSkillExperience('astrology', 30);
        } else if (ritual.skillAffinity === 'herbalism') {
          addSkillExperience('herbalism', 30);
        }
      } else {
        // Update game state with just the item consumption
        setGameState({
          ...gameState,
          players: gameState.players.map((p, idx) => 
            idx === gameState.currentPlayerIndex ? updatedPlayer : p
          )
        } as GameState);
        
        // Even failed rituals provide some experience
        if (ritual.skillAffinity === 'astrology') {
          addSkillExperience('astrology', 10);
        } else if (ritual.skillAffinity === 'herbalism') {
          addSkillExperience('herbalism', 10);
        }
        
        setErrorMessage(`The ritual failed. The energies weren't aligned properly.`);
      }
      
      // Reset selection state
      setSelectedRitual(null);
      setSelectedRitualItems([]);
      setActiveAction(null);
      
    } catch (err) {
      console.error('Error performing ritual:', err);
      setErrorMessage('Something went wrong with the ritual.');
    }
  };
  
  // Skill progression system
  const skillExperienceNeeded = (level: number): number => {
    // Experience needed for each level follows a progression curve
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };
  
  const addSkillExperience = (skill: string, amount: number) => {
    if (!gameState) return;
    
    try {
      const player = gameState.players[gameState.currentPlayerIndex];
      
      // Initialize skill experience if it doesn't exist
      const skillExperience = player.skillExperience || {
        gardening: 0,
        brewing: 0,
        trading: 0,
        crafting: 0,
        herbalism: 0,
        astrology: 0
      };
      
      // Check if this is a valid skill
      if (!(skill in skillExperience)) {
        console.error(`Invalid skill: ${skill}`);
        return;
      }
      
      // Get the current skill level
      const currentLevel = player.skills[skill as keyof typeof player.skills] || 1;
      
      // Calculate new experience
      const newExperience = skillExperience[skill as keyof typeof skillExperience] + amount;
      
      // Check if player leveled up
      const experienceNeeded = skillExperienceNeeded(currentLevel);
      const leveledUp = newExperience >= experienceNeeded;
      
      // Update skill experience
      const updatedSkillExperience = {
        ...skillExperience,
        [skill]: newExperience
      };
      
      // If player leveled up, increase skill level and show level up modal
      if (leveledUp) {
        const newLevel = currentLevel + 1;
        
        // Update skills
        const updatedSkills = {
          ...player.skills,
          [skill]: newLevel
        };
        
        // Update player
        const updatedPlayer = {
          ...player,
          skills: updatedSkills,
          skillExperience: updatedSkillExperience
        };
        
        // Update game state
        setGameState({
          ...gameState,
          players: gameState.players.map((p, idx) => 
            idx === gameState.currentPlayerIndex ? updatedPlayer : p
          )
        } as GameState);
        
        // Show level up modal
        setLevelUpSkill(skill);
        setShowLevelUpModal(true);
      } else {
        // Just update experience without level up
        const updatedPlayer = {
          ...player,
          skillExperience: updatedSkillExperience
        };
        
        // Update game state
        setGameState({
          ...gameState,
          players: gameState.players.map((p, idx) => 
            idx === gameState.currentPlayerIndex ? updatedPlayer : p
          )
        } as GameState);
      }
    } catch (err) {
      console.error('Error adding skill experience:', err);
    }
  };
  
  // Get skill description text
  const getSkillDescription = (skill: string): string => {
    switch (skill) {
      case 'gardening':
        return "Increases plant growth rate and harvest quality";
      case 'brewing':
        return "Improves potion quality and success rate";
      case 'trading':
        return "Better prices when buying and selling";
      case 'crafting':
        return "Higher quality crafted items";
      case 'herbalism':
        return "Enhanced herb identification and processing";
      case 'astrology':
        return "Better understanding of moon phases and weather";
      default:
        return "Skill mastery";
    }
  };
  
  // Get skill bonus text
  const getSkillLevelBonus = (skill: string, level: number): string => {
    switch (skill) {
      case 'gardening':
        return `+${level * 5}% plant growth rate, +${level * 2}% harvest quality`;
      case 'brewing':
        return `+${level * 5}% potion potency, +${level * 3}% brewing success rate`;
      case 'trading':
        return `-${level * 2}% buying prices, +${level * 2}% selling prices`;
      case 'crafting':
        return `+${level * 4}% crafted item quality, +${level * 2}% crafting success rate`;
      case 'herbalism':
        return `+${level * 3}% herb effect strength, +${level * 4}% herb identification`;
      case 'astrology':
        return `+${level * 10} max mana, +${level * 5}% moon phase effect strength`;
      default:
        return `Level ${level} mastery`;
    }
  };
  
  // Helper function to get random weather with weighted probabilities
  const getRandomWeather = (): string => {
    // Weighted weather types (affects probability)
    const weatherTypes = [
      { type: 'clear', weight: 30 },
      { type: 'cloudy', weight: 25 },
      { type: 'rainy', weight: 15 },
      { type: 'windy', weight: 15 },
      { type: 'foggy', weight: 10 },
      { type: 'stormy', weight: 5 }
    ];
    
    // Calculate total weight
    const totalWeight = weatherTypes.reduce((sum, weather) => sum + weather.weight, 0);
    
    // Get a random number between 0 and totalWeight
    const random = Math.random() * totalWeight;
    
    // Find the weather type that corresponds to the random number
    let weightSum = 0;
    for (const weather of weatherTypes) {
      weightSum += weather.weight;
      if (random <= weightSum) {
        return weather.type;
      }
    }
    
    // Fallback to clear weather
    return 'clear';
  };
  
  // Simple fetch at component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/state');
        
        if (response.ok) {
          const data = await response.json();
          setGameState(data);
        } else {
          // Use mock data if API fails
          console.log('Using mock game state');
          setGameState({
            currentPlayerIndex: 0,
            version: "1.0.0",
            players: [{
              id: "player1",
              name: "Witch",
              gold: 100,
              mana: 50,
              reputation: 50,
              atelierLevel: 1,
              atelierSpecialization: "Essence",
              garden: [
                {
                  id: 0,
                  plant: {
                    id: "moon-blossom-1",
                    name: "Moon Blossom",
                    growth: 70,
                    maxGrowth: 100,
                    watered: true,
                    health: 85,
                    age: 3,
                    mature: false,
                  },
                  fertility: 80,
                  moisture: 70,
                },
                {
                  id: 1,
                  plant: null,
                  fertility: 65,
                  moisture: 40,
                },
                {
                  id: 2,
                  plant: {
                    id: "shadow-root-1",
                    name: "Shadow Root",
                    growth: 100,
                    maxGrowth: 100,
                    watered: true,
                    health: 90,
                    age: 5,
                    mature: true,
                  },
                  fertility: 75,
                  moisture: 65,
                }
              ],
              inventory: [
                {
                  id: "inv-moonleaf-1",
                  baseId: "moonleaf",
                  name: "Moonleaf",
                  type: "ingredient",
                  category: "herb",
                  quantity: 3,
                  quality: 85,
                  value: 20,
                  description: "A silvery leaf that glows faintly in moonlight."
                },
                {
                  id: "inv-nightshade-1",
                  baseId: "nightshade",
                  name: "Midnight Nightshade",
                  type: "ingredient",
                  category: "herb",
                  quantity: 2,
                  quality: 70,
                  value: 15,
                  description: "A dark purple herb with dangerous properties."
                },
                {
                  id: "inv-crystal-1",
                  baseId: "crystal",
                  name: "Clear Quartz",
                  type: "ingredient",
                  category: "crystal",
                  quantity: 1,
                  quality: 90,
                  value: 30,
                  description: "A clear crystal that amplifies magical energy."
                }
              ],
              blackMarketAccess: false,
              skills: { gardening: 1, brewing: 1, trading: 1, crafting: 1, herbalism: 1, astrology: 1 },
              skillExperience: { gardening: 50, brewing: 30, trading: 20, crafting: 40, herbalism: 60, astrology: 25 },
              knownRecipes: [],
              completedRituals: [],
              journalEntries: [],
              questsCompleted: 0,
              lastActive: Date.now()
            }],
            market: [
              {
                id: "market-item-1",
                name: "Witch Hazel Seeds",
                type: "seed",
                category: "seed",
                price: 25,
                basePrice: 25,
                description: "Seeds to grow Witch Hazel, a magical plant with divination properties."
              },
              {
                id: "market-item-2",
                name: "Clay Pot",
                type: "tool",
                category: "tool",
                price: 15,
                basePrice: 15,
                description: "A simple clay pot for growing magical plants."
              },
              {
                id: "market-item-3",
                name: "Enchanted Watering Can",
                type: "tool",
                category: "tool",
                price: 75,
                basePrice: 75,
                description: "A watering can imbued with magical properties that helps plants grow faster."
              }
            ],
            marketData: { inflation: 1.0, demand: {}, supply: {}, volatility: 0.1, blackMarketAccessCost: 500, blackMarketUnlocked: false, tradingVolume: 0 },
            rumors: [
              {
                id: "rumor-1",
                content: "They say the full moon next week will have unusual properties for brewing transformation potions.",
                spread: 3,
                verified: false,
                origin: "Old Witch in the Market"
              },
              {
                id: "rumor-2",
                content: "The town guard found strange mushrooms growing in the forest after the last storm.",
                spread: 5,
                verified: true,
                origin: "Town Crier"
              }
            ],
            journal: [],
            rituals: [
              {
                id: "ritual-1",
                name: "Lunar Blessing",
                description: "A ritual to harness the moon's energy, granting increased magical potency.",
                difficulty: 2,
                moonPhaseRequirement: "Full Moon",
                baseSuccessChance: 75,
                skillAffinity: "astrology",
                oneTime: false,
                requiredItems: [
                  { name: "Moonleaf", quantity: 1 },
                  { name: "Clear Quartz", quantity: 1 }
                ],
                rewards: {
                  mana: 20,
                  reputation: 5,
                  items: [
                    { 
                      id: "lunar-essence",
                      name: "Lunar Essence",
                      type: "ingredient",
                      category: "essence",
                      quality: 85,
                      value: 40,
                      description: "Crystallized moonlight captured during a ritual."
                    }
                  ]
                }
              },
              {
                id: "ritual-2",
                name: "Shadow Communion",
                description: "Commune with shadow energies to gain insights and dark powers.",
                difficulty: 3,
                moonPhaseRequirement: "New Moon",
                baseSuccessChance: 65,
                skillAffinity: "astrology",
                oneTime: false,
                requiredItems: [
                  { name: "Midnight Nightshade", quantity: 2 }
                ],
                rewards: {
                  mana: 15,
                  reputation: 3,
                  gold: 10,
                  items: [
                    {
                      id: "shadow-veil",
                      name: "Shadow Veil",
                      type: "ingredient",
                      category: "essence",
                      quality: 80,
                      value: 35,
                      description: "A wisp of pure shadow that tingles to the touch."
                    }
                  ]
                }
              },
              {
                id: "ritual-3",
                name: "Spring Awakening",
                description: "A fertility ritual that enhances garden growth and plant vitality.",
                difficulty: 1,
                seasonRequirement: "Spring",
                baseSuccessChance: 85,
                skillAffinity: "herbalism",
                oneTime: true,
                requiredItems: [
                  { name: "Moonleaf", quantity: 1 }
                ],
                rewards: {
                  reputation: 5,
                  unlocksRituals: [
                    {
                      id: "ritual-4",
                      name: "Verdant Growth",
                      description: "Accelerate the growth of your garden plants using natural magic.",
                      difficulty: 2,
                      baseSuccessChance: 80,
                      skillAffinity: "herbalism",
                      oneTime: false,
                      requiredItems: [
                        { name: "Moonleaf", quantity: 1 },
                        { name: "Witch Hazel", quantity: 1 }
                      ],
                      rewards: {
                        reputation: 3
                      }
                    }
                  ]
                }
              }
            ],
            events: [],
            knownRecipes: [],
            time: { year: 1, dayCount: 1, phaseName: "Full Moon", phase: 0, season: "Spring", weatherFate: "clear" },
            townRequests: [
              {
                id: "request-1",
                requester: "Village Healer",
                item: "Moonleaf",
                quantity: 2,
                rewardGold: 30,
                rewardInfluence: 5,
                difficulty: 1,
                description: "I need Moonleaf for a healing salve."
              },
              {
                id: "request-2",
                requester: "Town Guard",
                item: "Midnight Nightshade",
                quantity: 1,
                rewardGold: 25,
                rewardInfluence: 3,
                difficulty: 2,
                description: "Need a sleeping draught for night patrols."
              },
              {
                id: "request-3",
                requester: "Mystic Scholar",
                item: "Clear Quartz",
                quantity: 1,
                rewardGold: 40,
                rewardInfluence: 8,
                difficulty: 3,
                description: "Researching crystal energies. Bring a quality specimen."
              }
            ]
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Show loading screen
  if (loading) {
    return (
      <div className="game-container">
        <div className="loading-screen">
          <div className="loading-dialog">
            <div className="loading-header">LOADING WITCH COVEN</div>
            <div className="loading-content">
              <h1>INITIALIZING MAGICAL SYSTEMS</h1>
              <div className="loading-bar-container">
                <div className="loading-bar"></div>
              </div>
              <p className="loading-text">Summoning magical components...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If we have no game state, show an error
  if (!gameState) {
    return (
      <div className="game-container">
        <div className="error-screen">
          <h1>Error loading game data</h1>
          <p>Unable to load game state. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </div>
    );
  }
  
  // Show error message if present
  const showError = errorMessage !== null;
  
  // Get current player safely
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  
  return (
    <div className="game-container">
      {/* Error overlay */}
      {showError && (
        <div className="error-overlay">
          <div className="error-popup">
            <div className="error-popup-header">
              ERROR
              <button onClick={() => setErrorMessage(null)} className="error-close">X</button>
            </div>
            <div className="error-popup-content">{errorMessage}</div>
          </div>
        </div>
      )}
      
      <div className="game-backdrop"></div>
      {/* Weather overlay */}
      {gameState && (
        <div className={`weather-overlay ${gameState.time.weatherFate}`}>
          <div className="time-overlay day"></div>
          <div className={`weather-tint ${gameState.time.weatherFate}`}></div>
          
          {/* Rain effect */}
          {(gameState.time.weatherFate === 'rainy' || gameState.time.weatherFate === 'stormy') && (
            <div className="rain-container">
              {Array.from({ length: 60 }).map((_, i) => (
                <div key={`rain-${i}`}
                     className="rain-drop"
                     style={{
                        left: `${Math.random() * 105 - 5}%`,
                        '--fall-duration': `${0.5 + Math.random() * 0.7}s`,
                        animationDelay: `${Math.random() * 1.2}s`,
                     } as React.CSSProperties} />
              ))}
            </div>
          )}
          
          {/* Cloud effect */}
          {(gameState.time.weatherFate === 'cloudy' || gameState.time.weatherFate === 'stormy') && (
            <div className="cloud-overlay"></div>
          )}
          
          {/* Fog effect */}
          {gameState.time.weatherFate === 'foggy' && (
            <div className="fog-container">
              <div className="fog-layer"></div>
              <div className="fog-layer"></div>
              <div className="fog-layer"></div>
            </div>
          )}
          
          {/* Wind effect */}
          {gameState.time.weatherFate === 'windy' && (
            <div className="wind-container">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={`wind-${i}`} className="wind-particle"
                     style={{
                        top: `${Math.random() * 100}%`,
                        '--wind-duration': `${1 + Math.random() * 2.5}s`,
                        animationDelay: `${Math.random() * 4}s`,
                     } as React.CSSProperties} />
              ))}
            </div>
          )}
          
          {/* Random thunder flash for stormy weather */}
          {gameState.time.weatherFate === 'stormy' && Math.random() < 0.2 && (
            <div className="thunder-flash"></div>
          )}
        </div>
      )}
      <div className="game-frame">
        {/* Title bar */}
        <div className="game-title-bar">The Witch Coven</div>
        
        {/* Menu bar */}
        <div className="game-menu-bar">
          <div 
            className={`game-menu-item ${view === 'garden' ? 'active' : ''}`}
            onClick={() => setView('garden')}
          >
            <span className="game-menu-key">G</span>arden
          </div>
          <div 
            className={`game-menu-item ${view === 'brewing' ? 'active' : ''}`}
            onClick={() => setView('brewing')}
          >
            <span className="game-menu-key">B</span>rewing
          </div>
          <div 
            className={`game-menu-item ${view === 'atelier' ? 'active' : ''}`}
            onClick={() => setView('atelier')}
          >
            <span className="game-menu-key">A</span>telier
          </div>
          <div 
            className={`game-menu-item ${view === 'rituals' ? 'active' : ''}`}
            onClick={() => setView('rituals')}
          >
            <span className="game-menu-key">R</span>ituals
          </div>
          <div 
            className={`game-menu-item ${view === 'spells' ? 'active' : ''}`}
            onClick={() => setView('spells')}
          >
            <span className="game-menu-key">S</span>pells
          </div>
          <div 
            className={`game-menu-item ${view === 'market' ? 'active' : ''}`}
            onClick={() => setView('market')}
          >
            <span className="game-menu-key">M</span>arket
          </div>
          <div 
            className={`game-menu-item ${view === 'requests' ? 'active' : ''}`}
            onClick={() => setView('requests')}
          >
            <span className="game-menu-key">Q</span>uests
          </div>
          <div 
            className={`game-menu-item ${view === 'journal' ? 'active' : ''}`}
            onClick={() => setView('journal')}
          >
            <span className="game-menu-key">J</span>ournal
          </div>
          <div 
            className="game-menu-item"
            onClick={advanceDay}
          >
            <span className="game-menu-key">E</span>nd Day
          </div>
        </div>
        
        {/* Main content */}
        <main className="game-content">
          <div className="view-container">
            {view === 'rituals' && (
              <div className="rituals-view">
                <h2>Arcane Rituals Chamber</h2>
                <div className="rituals-intro">
                  <p>Perform ancient magical rituals to unlock powerful effects and rewards.</p>
                  <p>Current moon phase: <span className="highlight">{gameState.time.phaseName}</span> - affects ritual success!</p>
                  <p>Current season: <span className="highlight">{gameState.time.season}</span> - some rituals require specific seasons</p>
                </div>
                
                <div className="rituals-workspace">
                  {/* Ritual Selection Panel */}
                  <div className="rituals-list-panel">
                    <h3>Available Rituals</h3>
                    {gameState.rituals && gameState.rituals.length > 0 ? (
                      <div className="rituals-list">
                        {gameState.rituals
                          .filter(ritual => {
                            // Filter out rituals the player has already completed if they're one-time
                            if (ritual.oneTime && 
                                currentPlayer.completedRituals && 
                                currentPlayer.completedRituals.includes(ritual.id)) {
                              return false;
                            }
                            return true;
                          })
                          .map((ritual, index) => {
                            const isSelected = selectedRitual === ritual.id;
                            const isMoonPhaseCorrect = !ritual.moonPhaseRequirement || 
                                                       ritual.moonPhaseRequirement === gameState.time.phaseName;
                            const isSeasonCorrect = !ritual.seasonRequirement || 
                                                    ritual.seasonRequirement === gameState.time.season;
                            
                            return (
                              <div 
                                key={index} 
                                className={`ritual-item ${isSelected ? 'selected' : ''} 
                                          ${!isMoonPhaseCorrect || !isSeasonCorrect ? 'disabled' : ''}`}
                                onClick={() => {
                                  if (isMoonPhaseCorrect && isSeasonCorrect) {
                                    setSelectedRitual(ritual.id);
                                    setSelectedRitualItems([]);
                                    setActiveAction('ritual');
                                  }
                                }}
                              >
                                <div className="ritual-header">
                                  <div className="ritual-name">{ritual.name}</div>
                                  <div className="ritual-difficulty">
                                    {Array(ritual.difficulty || 1).fill('★').join('')}
                                    {Array(5 - (ritual.difficulty || 1)).fill('☆').join('')}
                                  </div>
                                </div>
                                <div className="ritual-description">{ritual.description}</div>
                                
                                {/* Requirements */}
                                <div className="ritual-requirements">
                                  {ritual.moonPhaseRequirement && (
                                    <div className={`requirement ${isMoonPhaseCorrect ? 'met' : 'unmet'}`}>
                                      <span className="requirement-icon">☾</span>
                                      <span className="requirement-text">{ritual.moonPhaseRequirement}</span>
                                    </div>
                                  )}
                                  
                                  {ritual.seasonRequirement && (
                                    <div className={`requirement ${isSeasonCorrect ? 'met' : 'unmet'}`}>
                                      <span className="requirement-icon">🍂</span>
                                      <span className="requirement-text">{ritual.seasonRequirement}</span>
                                    </div>
                                  )}
                                  
                                  <div className="requirement">
                                    <span className="requirement-icon">✨</span>
                                    <span className="requirement-text">
                                      Success: {ritual.baseSuccessChance || 70}%
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Required Items */}
                                {ritual.requiredItems && ritual.requiredItems.length > 0 && (
                                  <div className="ritual-items">
                                    <div className="ritual-items-header">Required Items:</div>
                                    <div className="ritual-items-list">
                                      {ritual.requiredItems.map((item, itemIndex) => (
                                        <div key={itemIndex} className="ritual-required-item">
                                          <span className="item-quantity">{item.quantity || 1}×</span>
                                          <span className="item-name">{item.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Rewards Preview */}
                                {ritual.rewards && (
                                  <div className="ritual-rewards">
                                    <div className="ritual-rewards-header">Rewards:</div>
                                    <div className="ritual-rewards-list">
                                      {ritual.rewards.mana && (
                                        <div className="ritual-reward">
                                          <span className="reward-icon">✧</span>
                                          <span className="reward-text">{ritual.rewards.mana} Mana</span>
                                        </div>
                                      )}
                                      {ritual.rewards.gold && (
                                        <div className="ritual-reward">
                                          <span className="reward-icon">⛁</span>
                                          <span className="reward-text">{ritual.rewards.gold} Gold</span>
                                        </div>
                                      )}
                                      {ritual.rewards.reputation && (
                                        <div className="ritual-reward">
                                          <span className="reward-icon">★</span>
                                          <span className="reward-text">{ritual.rewards.reputation} Reputation</span>
                                        </div>
                                      )}
                                      {ritual.rewards.items && ritual.rewards.items.length > 0 && (
                                        <div className="ritual-reward">
                                          <span className="reward-icon">🧪</span>
                                          <span className="reward-text">
                                            {ritual.rewards.items.length} {ritual.rewards.items.length === 1 ? 'Item' : 'Items'}
                                          </span>
                                        </div>
                                      )}
                                      {ritual.rewards.unlocksRituals && ritual.rewards.unlocksRituals.length > 0 && (
                                        <div className="ritual-reward special">
                                          <span className="reward-icon">📜</span>
                                          <span className="reward-text">Unlocks New Rituals</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="empty-rituals">
                        <p>You haven't discovered any rituals yet.</p>
                        <p>Explore the world, complete quests, and study magical phenomena to uncover ancient rituals.</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Ritual Workspace */}
                  <div className="ritual-workspace">
                    <h3>Ritual Circle</h3>
                    
                    {selectedRitual ? (
                      <div className="ritual-circle">
                        <div className="ritual-circle-content">
                          {/* Selected Ritual */}
                          <div className="selected-ritual">
                            <div className="ritual-name">
                              {gameState.rituals?.find(r => r.id === selectedRitual)?.name || 'Unknown Ritual'}
                            </div>
                            
                            {/* Selected Items */}
                            <div className="ritual-selected-items">
                              {selectedRitualItems.length > 0 ? (
                                selectedRitualItems.map((itemId, index) => {
                                  const item = currentPlayer.inventory.find(i => i.id === itemId);
                                  if (!item) return null;
                                  
                                  return (
                                    <div 
                                      key={index} 
                                      className="selected-ritual-item"
                                      onClick={() => {
                                        setSelectedRitualItems(selectedRitualItems.filter(id => id !== itemId));
                                      }}
                                    >
                                      <div className="item-icon">
                                        <div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div>
                                      </div>
                                      <div className="item-name">{item.name}</div>
                                      <div className="remove-icon">×</div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="empty-circle">
                                  Select items from your inventory to add to the ritual...
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Visual Effects */}
                          <div className="ritual-effects">
                            <div className="ritual-glow"></div>
                            <div className="ritual-symbol"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="empty-ritual-circle">
                        <p>Select a ritual from the list to begin preparations.</p>
                      </div>
                    )}
                    
                    {/* Ritual Actions */}
                    <div className="ritual-actions">
                      {selectedRitual && (
                        <>
                          <button 
                            className="action-button select-items"
                            onClick={() => {
                              setShowInventoryModal(true);
                              setItemFilter('ingredient');
                            }}
                          >
                            Select Items
                          </button>
                          
                          <button 
                            className="action-button perform-ritual"
                            disabled={selectedRitualItems.length === 0}
                            onClick={() => {
                              if (selectedRitual && selectedRitualItems.length > 0) {
                                performRitual(selectedRitual, selectedRitualItems);
                              }
                            }}
                          >
                            Perform Ritual
                          </button>
                          
                          <button 
                            className="action-button clear"
                            onClick={() => {
                              setSelectedRitual(null);
                              setSelectedRitualItems([]);
                              setActiveAction(null);
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Completed Rituals */}
                  <div className="completed-rituals-panel">
                    <h3>Completed Rituals</h3>
                    {currentPlayer.completedRituals && currentPlayer.completedRituals.length > 0 ? (
                      <div className="completed-rituals-list">
                        {currentPlayer.completedRituals.map((ritualId, index) => {
                          const ritual = gameState.rituals?.find(r => r.id === ritualId);
                          if (!ritual) return null;
                          
                          return (
                            <div key={index} className="completed-ritual">
                              <div className="ritual-name">{ritual.name}</div>
                              <div className="ritual-completion-date">
                                Completed: Day {Math.max(1, gameState.time.dayCount - Math.floor(Math.random() * 10))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="no-completed-rituals">
                        <p>You haven't completed any rituals yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {view === 'spells' && (
              <div className="spells-view">
                <h2>Arcane Spellcasting</h2>
                <div className="spells-intro">
                  <p>Cast magical spells to enhance your witch powers and affect the world around you.</p>
                  <p>Current mana: <span className="highlight">{currentPlayer.mana}</span></p>
                  <p>Moon phase: <span className="highlight">{gameState.time.phaseName}</span> - affects spell potency!</p>
                </div>
                
                <div className="spells-workspace">
                  {/* Spellbook Panel */}
                  <div className="spellbook-panel">
                    <h3>Your Spellbook</h3>
                    <div className="spells-list">
                      {availableSpells.map((spell, index) => {
                        const isSelected = selectedSpell === spell.id;
                        const canCast = currentPlayer.mana >= spell.manaCost;
                        
                        return (
                          <div 
                            key={index} 
                            className={`spell-item ${isSelected ? 'selected' : ''} ${!canCast ? 'insufficient-mana' : ''}`}
                            onClick={() => {
                              if (canCast) {
                                setSelectedSpell(spell.id);
                                setActiveAction('cast');
                              } else {
                                setErrorMessage(`Not enough mana to cast ${spell.name}. Required: ${spell.manaCost}`);
                              }
                            }}
                          >
                            <div className="spell-header">
                              <div className="spell-name">{spell.name}</div>
                              <div className="spell-cost">
                                <span className="mana-icon">✨</span> {spell.manaCost}
                              </div>
                            </div>
                            
                            <div className="spell-description">{spell.description}</div>
                            
                            <div className="spell-details">
                              <div className="spell-affinity">
                                Affinity: {spell.skillAffinity}
                              </div>
                              <div className="spell-target">
                                Target: {spell.target}
                              </div>
                              <div className="spell-cast-time">
                                Cast Time: {spell.castTime}
                              </div>
                            </div>
                            
                            {/* Spell Effects */}
                            <div className="spell-effects">
                              {spell.effects.growthBoost && (
                                <div className="spell-effect">Growth: +{spell.effects.growthBoost}</div>
                              )}
                              {spell.effects.healthBoost && (
                                <div className="spell-effect">Health: +{spell.effects.healthBoost}</div>
                              )}
                              {spell.effects.fertilityBoost && (
                                <div className="spell-effect">Fertility: +{spell.effects.fertilityBoost}</div>
                              )}
                              {spell.effects.moistureBoost && (
                                <div className="spell-effect">Moisture: +{spell.effects.moistureBoost}</div>
                              )}
                              {spell.effects.qualityBoost && (
                                <div className="spell-effect">Quality: +{spell.effects.qualityBoost}</div>
                              )}
                              {spell.effects.weatherControl && (
                                <div className="spell-effect special">Weather Control</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Casting Area */}
                  <div className="casting-area">
                    <h3>Spellcasting Circle</h3>
                    
                    {selectedSpell ? (
                      <div className="casting-circle">
                        <div className="selected-spell">
                          <div className="spell-name">
                            {availableSpells.find(s => s.id === selectedSpell)?.name || 'Unknown Spell'}
                          </div>
                          <div className="spell-target-instructions">
                            {(() => {
                              const spell = availableSpells.find(s => s.id === selectedSpell);
                              if (!spell) return null;
                              
                              switch (spell.target) {
                                case 'plant':
                                  return 'Select a plant in your garden to target';
                                case 'plot':
                                  return 'Select a garden plot to target';
                                case 'garden':
                                  return 'This spell affects your entire garden';
                                case 'potion':
                                  return 'Select a potion in your brewing station';
                                case 'weather':
                                  return 'This spell will allow you to influence tomorrow\'s weather';
                                default:
                                  return 'Select a target for your spell';
                              }
                            })()}
                          </div>
                        </div>
                        
                        <div className="casting-effects">
                          <div className="casting-circle-inner"></div>
                          <div className="casting-circle-middle"></div>
                          <div className="casting-circle-outer"></div>
                          <div className="casting-stars">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className="casting-star" style={{
                                '--delay': `${i * 0.5}s`,
                                '--position': `${Math.random() * 360}deg`,
                                '--distance': `${40 + Math.random() * 40}%`
                              } as React.CSSProperties}></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="empty-casting-circle">
                        <p>Select a spell from your spellbook to begin casting.</p>
                      </div>
                    )}
                    
                    {/* Casting Actions */}
                    <div className="casting-actions">
                      {selectedSpell && (
                        <>
                          <button 
                            className="action-button cast-spell"
                            onClick={() => {
                              const spell = availableSpells.find(s => s.id === selectedSpell);
                              
                              if (spell) {
                                if (['garden', 'weather'].includes(spell.target)) {
                                  // These spells don't need a specific target
                                  castSpell(selectedSpell);
                                } else if (spell.target === 'plant' || spell.target === 'plot') {
                                  setErrorMessage('Please go to the garden view and select a plot to target with this spell.');
                                  setView('garden');
                                } else {
                                  setErrorMessage('This spell type is not yet fully implemented.');
                                }
                              }
                            }}
                          >
                            Cast Spell
                          </button>
                          
                          <button 
                            className="action-button clear"
                            onClick={() => {
                              setSelectedSpell(null);
                              setActiveAction(null);
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Spell Effects Panel */}
                  <div className="spell-info-panel">
                    <h3>Magical Knowledge</h3>
                    <div className="spell-info-content">
                      <div className="spell-info-section">
                        <h4>Mana Regeneration</h4>
                        <p>Your mana regenerates each day based on:</p>
                        <ul>
                          <li>Base regeneration: 5 mana</li>
                          <li>Full Moon bonus: +10 mana</li>
                          <li>New Moon penalty: -2 mana</li>
                          <li>Waxing phase bonus: +3 mana</li>
                          <li>Weather effects: up to +5 mana</li>
                        </ul>
                      </div>
                      
                      <div className="spell-info-section">
                        <h4>Spell Success</h4>
                        <p>Your spell success chance depends on:</p>
                        <ul>
                          <li>Base success: 70%</li>
                          <li>Relevant skill level: +5% per level</li>
                          <li>Full Moon bonus: +15%</li>
                          <li>New Moon penalty: -10%</li>
                        </ul>
                      </div>
                      
                      <div className="magical-tip">
                        <p><em>Tip: Cast weather influence during a Full Moon to maximize success chance!</em></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          
            {view === 'requests' && (
              <div className="requests-view">
                <h2>Town Requests</h2>
                <div className="requests-intro">
                  <p>Complete requests from townsfolk to earn gold and improve your reputation.</p>
                </div>
                
                <div className="requests-container">
                  <div className="requests-list-area">
                    {gameState.townRequests && gameState.townRequests.length > 0 ? (
                      <div className="request-list">
                        {gameState.townRequests.map((request, index) => {
                          // Check if player has enough items to fulfill the request
                          const totalQuantity = currentPlayer.inventory
                            .filter(item => item.name === request.item)
                            .reduce((sum, item) => sum + item.quantity, 0);
                          
                          const canFulfill = totalQuantity >= request.quantity;
                          
                          return (
                            <div key={index} className="request-item">
                              <div className="request-icon" title={request.requester}>
                                {request.requester.charAt(0).toUpperCase()}
                              </div>
                              <div className="request-details">
                                <div className="request-requester">{request.requester} requests:</div>
                                <div className="request-item-info">
                                  <strong>{request.quantity} × {request.item}</strong>
                                  <div className="inventory-check">(Have: {totalQuantity})</div>
                                </div>
                                <div className="request-rewards">
                                  <div className="request-reward request-reward-gold" title={`${request.rewardGold} Gold`}>{request.rewardGold}</div>
                                  <div className="request-reward request-reward-influence" title={`${request.rewardInfluence} Rep`}>+{request.rewardInfluence}</div>
                                </div>
                              </div>
                              <div className="request-info">
                                {/* Difficulty stars */}
                                <div className="request-difficulty" title={`Difficulty: ${request.difficulty}/5`}>
                                  {Array(request.difficulty || 0).fill('★').join('')}
                                  {Array(5 - (request.difficulty || 0)).fill('☆').join('')}
                                </div>
                                <button
                                  className={`fulfill-button ${canFulfill ? 'can-fulfill' : 'cant-fulfill'}`}
                                  onClick={() => {
                                    if (canFulfill) {
                                      // Logic to fulfill the request
                                      
                                      // Find the items needed
                                      let remainingQuantity = request.quantity;
                                      const newInventory = [...currentPlayer.inventory];
                                      
                                      // Remove items from inventory
                                      for (let i = 0; i < newInventory.length && remainingQuantity > 0; i++) {
                                        const item = newInventory[i];
                                        if (item.name === request.item) {
                                          if (item.quantity <= remainingQuantity) {
                                            // Use all of this stack
                                            remainingQuantity -= item.quantity;
                                            newInventory[i] = { ...item, quantity: 0 };
                                          } else {
                                            // Use part of this stack
                                            newInventory[i] = { ...item, quantity: item.quantity - remainingQuantity };
                                            remainingQuantity = 0;
                                          }
                                        }
                                      }
                                      
                                      // Filter out empty items
                                      const filteredInventory = newInventory.filter(item => item.quantity > 0);
                                      
                                      // Add gold reward to player
                                      const updatedPlayer = {
                                        ...currentPlayer,
                                        gold: currentPlayer.gold + request.rewardGold,
                                        reputation: currentPlayer.reputation + request.rewardInfluence,
                                        inventory: filteredInventory
                                      };
                                      
                                      // Remove the request from the list
                                      const updatedRequests = gameState.townRequests.filter((_, i) => i !== index);
                                      
                                      // Update game state
                                      const updatedGameState = {
                                        ...gameState,
                                        players: gameState.players.map((p, idx) => 
                                          idx === gameState.currentPlayerIndex ? updatedPlayer : p
                                        ),
                                        townRequests: updatedRequests
                                      };
                                      
                                      setGameState(updatedGameState as GameState);
                                      
                                      // Award trading and herbalism experience for fulfilling requests
                                      addSkillExperience('trading', 20);
                                      addSkillExperience('herbalism', 15);
                                      
                                      setErrorMessage(`Request fulfilled! Received ${request.rewardGold} gold and ${request.rewardInfluence} reputation.`);
                                    }
                                  }}
                                  disabled={!canFulfill}
                                >
                                  {canFulfill ? 'Fulfill' : 'Need Items'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="request-list empty">
                        <p>No outstanding requests from the townsfolk.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {view === 'garden' && (
              <div className="garden-view">
                <h2>Witch's Garden</h2>
                <div className="garden-actions">
                  <div className="primary-actions">
                    <button 
                      className="garden-action-button"
                      onClick={() => {
                        setActiveAction('water');
                        waterPlants();
                      }}
                    >
                      Water All Plants
                    </button>
                    
                    <button 
                      className="garden-season-button"
                      onClick={() => setShowSeasonalPuzzle(true)}
                    >
                      <span className="season-icon">
                        {gameState.time.season === 'Spring' ? '🌱' : 
                         gameState.time.season === 'Summer' ? '☀️' : 
                         gameState.time.season === 'Fall' ? '🍂' : '❄️'}
                      </span>
                      Seasonal Attunement
                    </button>
                    
                    {puzzleBonus > 0 && (
                      <div className="bonus-badge">
                        ✨ Garden Bonus: +{puzzleBonus}%
                      </div>
                    )}
                  </div>
                  
                  {activeAction === 'cast' && selectedSpell && (
                    <div className="casting-mode-indicator">
                      <span className="casting-mode-text">
                        Casting <strong>{availableSpells.find(s => s.id === selectedSpell)?.name}</strong>
                      </span>
                      <button 
                        className="cancel-cast-button"
                        onClick={() => {
                          setActiveAction(null);
                          setSelectedSpell(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div className="garden-grid">
                  {Array.isArray(currentPlayer.garden) && currentPlayer.garden.length > 0 ? (
                    currentPlayer.garden.map((plot, index) => (
                      <div 
                        key={index} 
                        className={`garden-plot ${selectedPlot === plot.id ? 'selected' : ''}`}
                        data-growth={
                          plot.plant ? 
                            (plot.plant.mature ? 'mature' :
                            plot.plant.growth >= 70 ? 'high' :
                            plot.plant.growth >= 40 ? 'medium' : 'low')
                          : 'empty'
                        }
                        onClick={() => {
                          setSelectedPlot(plot.id);
                          
                          // If we're in spell casting mode with an active spell
                          if (activeAction === 'cast' && selectedSpell) {
                            const spell = availableSpells.find(s => s.id === selectedSpell);
                            
                            if (spell) {
                              if (spell.target === 'plant' && plot.plant) {
                                // Cast a spell targeting a plant
                                castSpell(selectedSpell, plot.id);
                              } else if (spell.target === 'plot') {
                                // Cast a spell targeting a plot
                                castSpell(selectedSpell, plot.id);
                              } else {
                                setErrorMessage('This spell cannot target a garden plot.');
                              }
                            }
                          }
                        }}
                      >
                        {plot.plant ? (
                          <div 
                            className="plant-info"
                            data-growth={
                              plot.plant.mature ? 'mature' :
                              plot.plant.growth >= 70 ? 'high' :
                              plot.plant.growth >= 40 ? 'medium' : 'low'
                            }
                          >
                            <div className="plant-name">{plot.plant.name}</div>
                            <div className="plant-stats">
                              <div>Growth: {plot.plant.growth}/{plot.plant.maxGrowth}</div>
                              <div>Health: {plot.plant.health}%</div>
                              <div>{plot.plant.mature ? 'Ready to Harvest!' : 'Growing...'}</div>
                            </div>
                            {plot.plant.mature && (
                              <button 
                                className="harvest-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  harvestPlant(plot.id);
                                }}
                              >
                                Harvest
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="empty-plot">
                            <div>Empty Plot</div>
                            <button 
                              className="plant-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAction('plant');
                                setSelectedPlot(plot.id);
                                setShowInventoryModal(true);
                                setItemFilter('seed');
                              }}
                            >
                              Plant
                            </button>
                          </div>
                        )}
                        <div className="plot-info">
                          <div>Moisture: {plot.moisture}%</div>
                          <div>Fertility: {plot.fertility}%</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-garden">
                      <p>You don't have any garden plots yet.</p>
                      <p>Visit the market to purchase seeds and gardening supplies.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {view === 'brewing' && (
              <div className="brewing-view">
                <h2>Brewing Chamber</h2>
                <div className="brewing-intro">
                  <p>Here you can brew magical potions using your harvested ingredients.</p>
                  <p>Current moon phase: <span className="highlight">{gameState.time.phaseName}</span> - affects potion potency!</p>
                </div>
                
                <div className="brewing-content">
                  {/* Ingredients Panel */}
                  <div className="ingredients-panel">
                    <div className="ingredients-header">
                      <h3>Ingredients</h3>
                      <div className="ingredients-filters">
                        <select onChange={(e) => setItemFilter(e.target.value === 'all' ? null : e.target.value)}>
                          <option value="all">All Categories</option>
                          <option value="herb">Herbs</option>
                          <option value="crystal">Crystals</option>
                          <option value="mushroom">Mushrooms</option>
                        </select>
                      </div>
                    </div>
                    <div className="ingredients-grid">
                      {Array.isArray(currentPlayer.inventory) && 
                       currentPlayer.inventory.filter(item => {
                         const isIngredient = item.type === 'ingredient';
                         const matchesFilter = !itemFilter || item.category === itemFilter;
                         return isIngredient && matchesFilter;
                       }).length > 0 ? (
                        currentPlayer.inventory
                          .filter(item => {
                            const isIngredient = item.type === 'ingredient';
                            const matchesFilter = !itemFilter || item.category === itemFilter;
                            return isIngredient && matchesFilter;
                          })
                          .map((item, index) => (
                            <div 
                              key={index} 
                              className={`ingredient-item ${item.category || ''}`}
                              onClick={() => {
                                // Select ingredient for brewing
                                setSelectedItem(item.id);
                                setShowInventoryModal(true);
                                setActiveAction('brew');
                              }}
                            >
                              <div className="ingredient-image">
                                <div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div>
                              </div>
                              <div className="ingredient-details">
                                <div className="ingredient-name">{item.name}</div>
                                {item.quality && <div className="ingredient-quality">Q:{item.quality}%</div>}
                                <div className="ingredient-quantity">x{item.quantity}</div>
                              </div>
                              {item.category && <div className="ingredient-category-tag">{item.category}</div>}
                            </div>
                          ))
                      ) : (
                        <div className="no-ingredients">No ingredients match filter. Harvest plants from your garden.</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Brewing Workspace */}
                  <div className="brewing-workspace">
                    <div className="cauldron">
                      <div className="cauldron-content">
                        {selectedItem ? (
                          <div className="selected-ingredients">
                            {currentPlayer.inventory
                              .filter(item => item.id === selectedItem)
                              .map((item, index) => (
                                <div key={`${item.id}-${index}`} className="selected-ingredient" onClick={() => setSelectedItem(null)}>
                                   <div className="ingredient-image">
                                     <div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div>
                                   </div>
                                   <div className="ingredient-name">{item.name}</div>
                                   <div className="remove-icon">×</div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="empty-cauldron">Select an ingredient to begin brewing...</div>
                        )}
                        <div className="bubble bubble-1"></div>
                        <div className="bubble bubble-2"></div>
                        <div className="bubble bubble-3"></div>
                      </div>
                    </div>
                    
                    {/* Brewing actions */}
                    <div className="brewing-actions">
                      {selectedItem && (
                        <div className="brewing-buttons">
                          <button 
                            className="action-button brew" 
                            onClick={() => {
                              // Simple brewing logic
                              const ingredient = currentPlayer.inventory.find(item => item.id === selectedItem);
                              if (ingredient && ingredient.quantity > 0) {
                                // Create a potion based on the ingredient
                                const potionName = `${ingredient.name} Potion`;
                                let potionQuality = ingredient.quality || 70;
                                
                                // Apply puzzle bonus if available
                                if (puzzleBonus > 0) {
                                  potionQuality = Math.min(100, potionQuality + puzzleBonus);
                                  setPuzzleBonus(0); // Reset bonus after use
                                }
                                
                                // Add potion to inventory
                                const newPotion = {
                                  id: `potion-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                  baseId: ingredient.baseId,
                                  name: potionName,
                                  type: 'potion',
                                  category: 'potion',
                                  quantity: 1,
                                  quality: potionQuality,
                                  value: (ingredient.value || 10) * 2,
                                  description: `A potion made from ${ingredient.name}.`
                                };
                                
                                // Remove the ingredient
                                const updatedInventory = currentPlayer.inventory.map(item => 
                                  item.id === selectedItem 
                                    ? {...item, quantity: item.quantity - 1} 
                                    : item
                                ).filter(item => item.quantity > 0);
                                
                                // Add the potion
                                updatedInventory.push(newPotion);
                                
                                // Update the player
                                const updatedPlayer = {
                                  ...currentPlayer,
                                  inventory: updatedInventory
                                };
                                
                                // Update game state
                                const updatedGameState = {
                                  ...gameState,
                                  players: gameState.players.map((p, idx) => 
                                    idx === gameState.currentPlayerIndex ? updatedPlayer : p
                                  )
                                };
                                
                                setGameState(updatedGameState as GameState);
                                
                                // Award brewing experience
                                addSkillExperience('brewing', 20);
                                
                                if (puzzleBonus > 0) {
                                  setErrorMessage(`Successfully brewed ${potionName} with +${puzzleBonus}% quality bonus!`);
                                } else {
                                  setErrorMessage(`Successfully brewed ${potionName}!`);
                                }
                                setSelectedItem(null);
                              }
                            }}
                          >
                            Brew Potion
                          </button>
                          
                          <button 
                            className="action-button clear"
                            onClick={() => setSelectedItem(null)}
                          >
                            Clear
                          </button>
                        </div>
                      )}
                      
                      <button 
                        className="action-button puzzle"
                        onClick={() => setShowBrewingPuzzle(true)}
                      >
                        Essence Alignment Puzzle
                      </button>
                      
                      {puzzleBonus > 0 && (
                        <div className="bonus-badge">
                          ✨ Quality Bonus: +{puzzleBonus}%
                        </div>
                      )}
                    </div>
                    
                    {/* Brewing result area */}
                    <div className="brewing-result">
                      <p className="instruction-text">Select ingredients and brew potions. The lunar phase affects potency!</p>
                    </div>
                  </div>
                  
                  {/* Recipes Panel */}
                  <div className="recipes-panel">
                    <div className="recipes-header">
                      <h3>Known Recipes</h3>
                    </div>
                    <div className="recipes-list">
                      <div className="recipe-item">
                        <div className="recipe-header">
                          <div className="recipe-name">Basic Healing Potion</div>
                          <div className="recipe-difficulty">★★☆☆☆</div>
                        </div>
                        <div className="recipe-ingredients">Req: Moonleaf</div>
                        <div className="recipe-category-tag">healing</div>
                      </div>
                      
                      <div className="recipe-item">
                        <div className="recipe-header">
                          <div className="recipe-name">Minor Shadow Tonic</div>
                          <div className="recipe-difficulty">★★☆☆☆</div>
                        </div>
                        <div className="recipe-ingredients">Req: Midnight Nightshade</div>
                        <div className="recipe-category-tag">tonic</div>
                      </div>
                      
                      <div className="recipe-item">
                        <div className="recipe-header">
                          <div className="recipe-name">Clarity Elixir</div>
                          <div className="recipe-difficulty">★★★☆☆</div>
                        </div>
                        <div className="recipe-ingredients">Req: Clear Quartz</div>
                        <div className="recipe-category-tag">elixir</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {view === 'market' && (
              <div className="market-view">
                <h2>Witches' Market</h2>
                <div className="market-intro">
                  <p>Buy and sell magical items at the market. Your reputation affects prices!</p>
                  <p>Your gold: <span className="highlight">{currentPlayer.gold}</span></p>
                </div>
                
                <div className="market-sections">
                  <div className="market-section">
                    <h3>Available Items</h3>
                    {gameState.market && gameState.market.length > 0 ? (
                      <div className="market-items">
                        {gameState.market.map((item, index) => (
                          <div key={index} className="market-item">
                            <div className="item-name">{item.name}</div>
                            <div className="item-price">{item.price} gold</div>
                            <div className="item-description">{item.description}</div>
                            <button 
                              className="buy-button" 
                              disabled={currentPlayer.gold < item.price}
                              onClick={() => buyItem(item.id)}
                            >
                              Buy
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>The market currently has no items for sale. Check back tomorrow!</p>
                    )}
                  </div>
                  
                  <div className="market-section">
                    <h3>Your Inventory</h3>
                    {Array.isArray(currentPlayer.inventory) && currentPlayer.inventory.length > 0 ? (
                      <div className="inventory-items">
                        {currentPlayer.inventory.map((item, index) => (
                          <div key={index} className="inventory-item">
                            <div className="item-name">{item.name}</div>
                            <div className="item-quantity">x{item.quantity}</div>
                            <div className="item-value">Value: {Math.floor((item.value || 10) * 0.7)} gold</div>
                            <button 
                              className="sell-button"
                              onClick={() => sellItem(item.id)}
                            >
                              Sell
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Your inventory is empty.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {view === 'atelier' && (
              <div className="atelier-view">
                <h2>Magic Atelier</h2>
                <div className="atelier-intro">
                  <p>Craft magical items and enhance your abilities in your personal atelier.</p>
                  <p>Your specialization: <span className="highlight">{currentPlayer.atelierSpecialization}</span></p>
                  <p>Atelier Level: <span className="highlight">{currentPlayer.atelierLevel}</span></p>
                </div>
                
                <div className="atelier-workspace">
                  {/* Components Panel */}
                  <div className="ingredients-panel">
                    <div className="ingredients-header">
                      <h3>Components</h3>
                      <div className="ingredients-filters">
                        <select onChange={(e) => setItemFilter(e.target.value === 'all' ? null : e.target.value)}>
                          <option value="all">All Categories</option>
                          <option value="herb">Herbs</option>
                          <option value="crystal">Crystals</option>
                          <option value="ritual">Ritual Items</option>
                        </select>
                      </div>
                    </div>
                    <div className="ingredients-grid">
                      {Array.isArray(currentPlayer.inventory) && 
                       currentPlayer.inventory.filter(item => {
                         const isComponent = item.type === 'ingredient' || item.type === 'tool';
                         const matchesFilter = !itemFilter || item.category === itemFilter;
                         return isComponent && matchesFilter;
                       }).length > 0 ? (
                        currentPlayer.inventory
                          .filter(item => {
                            const isComponent = item.type === 'ingredient' || item.type === 'tool';
                            const matchesFilter = !itemFilter || item.category === itemFilter;
                            return isComponent && matchesFilter;
                          })
                          .map((item, index) => (
                            <div 
                              key={index} 
                              className={`ingredient-item ${item.category || ''}`}
                              onClick={() => {
                                // Select ingredient for crafting
                                setSelectedItem(item.id);
                              }}
                            >
                              <div className="ingredient-image">
                                <div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div>
                              </div>
                              <div className="ingredient-details">
                                <div className="ingredient-name">{item.name}</div>
                                {item.quality && <div className="ingredient-quality">Q:{item.quality}%</div>}
                                <div className="ingredient-quantity">x{item.quantity}</div>
                              </div>
                              {item.category && <div className="ingredient-category-tag">{item.category}</div>}
                            </div>
                          ))
                      ) : (
                        <div className="no-ingredients">No components match filter. Visit the market for supplies.</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Crafting Area */}
                  <div className="crafting-area">
                    <h3>Crafting Circle</h3>
                    <div className="cauldron">
                      <div className="cauldron-content">
                        {selectedItem ? (
                          <div className="selected-ingredients">
                            {currentPlayer.inventory
                              .filter(item => item.id === selectedItem)
                              .map((item, index) => (
                                <div key={`${item.id}-${index}`} className="selected-ingredient" onClick={() => setSelectedItem(null)}>
                                   <div className="ingredient-image">
                                     <div className="placeholder-image">{item.name.charAt(0).toUpperCase()}</div>
                                   </div>
                                   <div className="ingredient-name">{item.name}</div>
                                   <div className="remove-icon">×</div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="empty-cauldron">Select a component to begin crafting...</div>
                        )}
                        <div className="bubble bubble-1"></div>
                        <div className="bubble bubble-2"></div>
                        <div className="bubble bubble-3"></div>
                      </div>
                    </div>
                    
                    {/* Crafting actions */}
                    <div className="crafting-actions">
                      {selectedItem && (
                        <button 
                          className="action-button craft" 
                          onClick={() => {
                            // Simple crafting logic
                            const ingredient = currentPlayer.inventory.find(item => item.id === selectedItem);
                            if (ingredient && ingredient.quantity > 0) {
                              let craftedItem;
                              
                              if (ingredient.category === 'herb') {
                                craftedItem = {
                                  id: `charm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                  baseId: ingredient.baseId,
                                  name: `${ingredient.name} Charm`,
                                  type: 'charm',
                                  category: 'charm',
                                  quantity: 1,
                                  quality: ingredient.quality || 70,
                                  value: (ingredient.value || 10) * 3,
                                  description: `A charm crafted from ${ingredient.name}.`
                                };
                              } else if (ingredient.category === 'crystal') {
                                craftedItem = {
                                  id: `talisman-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                  baseId: ingredient.baseId,
                                  name: `${ingredient.name} Talisman`,
                                  type: 'talisman',
                                  category: 'talisman',
                                  quantity: 1,
                                  quality: ingredient.quality || 70,
                                  value: (ingredient.value || 10) * 5,
                                  description: `A talisman crafted from ${ingredient.name}.`
                                };
                              } else {
                                craftedItem = {
                                  id: `trinket-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                  baseId: ingredient.baseId,
                                  name: `${ingredient.name} Trinket`,
                                  type: 'trinket',
                                  category: 'trinket',
                                  quantity: 1,
                                  quality: ingredient.quality || 70,
                                  value: (ingredient.value || 10) * 2,
                                  description: `A trinket crafted from ${ingredient.name}.`
                                };
                              }
                              
                              // Remove the ingredient
                              const updatedInventory = currentPlayer.inventory.map(item => 
                                item.id === selectedItem 
                                  ? {...item, quantity: item.quantity - 1} 
                                  : item
                              ).filter(item => item.quantity > 0);
                              
                              // Add the crafted item
                              updatedInventory.push(craftedItem);
                              
                              // Update the player
                              const updatedPlayer = {
                                ...currentPlayer,
                                inventory: updatedInventory
                              };
                              
                              // Update game state
                              const updatedGameState = {
                                ...gameState,
                                players: gameState.players.map((p, idx) => 
                                  idx === gameState.currentPlayerIndex ? updatedPlayer : p
                                )
                              };
                              
                              setGameState(updatedGameState as GameState);
                              
                              // Award crafting experience
                              addSkillExperience('crafting', 25);
                              
                              setErrorMessage(`Successfully crafted ${craftedItem.name}!`);
                              setSelectedItem(null);
                            }
                          }}
                        >
                          Craft Item
                        </button>
                      )}
                      {selectedItem && (
                        <button 
                          className="action-button clear"
                          onClick={() => setSelectedItem(null)}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Recipes Panel */}
                  <div className="recipes-panel">
                    <div className="recipes-header">
                      <h3>Known Recipes</h3>
                    </div>
                    <div className="tabs">
                      <button className="active">Charms</button>
                      <button>Talismans</button>
                    </div>
                    <div className="recipes-list">
                      <div className="recipe-item">
                        <div className="recipe-image">
                          <div className="placeholder-image">C</div>
                        </div>
                        <div className="recipe-details">
                          <div className="recipe-name">Moonleaf Charm</div>
                          <div className="recipe-description">A protective charm made from Moonleaf.</div>
                          <div className="recipe-rarity uncommon">uncommon</div>
                        </div>
                      </div>
                      
                      <div className="recipe-item">
                        <div className="recipe-image">
                          <div className="placeholder-image">T</div>
                        </div>
                        <div className="recipe-details">
                          <div className="recipe-name">Nightshade Talisman</div>
                          <div className="recipe-description">A talisman of shadow crafted from Midnight Nightshade.</div>
                          <div className="recipe-rarity rare">rare</div>
                        </div>
                      </div>
                      
                      <div className="recipe-item">
                        <div className="recipe-image">
                          <div className="placeholder-image">T</div>
                        </div>
                        <div className="recipe-details">
                          <div className="recipe-name">Crystal Clarity Talisman</div>
                          <div className="recipe-description">Enhances vision and perception with Quartz.</div>
                          <div className="recipe-rarity uncommon">uncommon</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {view === 'journal' && (
              <div className="journal-view">
                <h2>Witch's Journal</h2>
                
                <div className="journal-tabs">
                  <button className="journal-tab-button active">Calendar</button>
                  <button className="journal-tab-button">Skills</button>
                  <button className="journal-tab-button">Rumors</button>
                </div>
                
                <div className="journal-section">
                  <h3>Calendar</h3>
                  <div className="calendar-info">
                    <div className="calendar-item">
                      <div className="calendar-label">Day:</div>
                      <div className="calendar-value">{gameState.time.dayCount}</div>
                    </div>
                    <div className="calendar-item">
                      <div className="calendar-label">Season:</div>
                      <div className="calendar-value">{gameState.time.season}</div>
                    </div>
                    <div className="calendar-item">
                      <div className="calendar-label">Moon Phase:</div>
                      <div className="calendar-value">{gameState.time.phaseName}</div>
                    </div>
                    <div className="calendar-item">
                      <div className="calendar-label">Weather:</div>
                      <div className="calendar-value">{gameState.time.weatherFate}</div>
                    </div>
                  </div>
                </div>
                
                <div className="journal-section">
                  <h3>Skills</h3>
                  <div className="skills-grid">
                    {Object.entries(currentPlayer.skills).map(([skill, level]) => {
                      // Get experience for this skill
                      const exp = currentPlayer.skillExperience?.[skill as keyof typeof currentPlayer.skillExperience] || 0;
                      const nextLevelExp = skillExperienceNeeded(level);
                      const expPercentage = Math.min(100, Math.floor((exp / nextLevelExp) * 100));
                      
                      return (
                        <div key={skill} className="skill-card">
                          <div className="skill-icon">
                            {skill === 'gardening' && '🌱'}
                            {skill === 'brewing' && '🧪'}
                            {skill === 'trading' && '💰'}
                            {skill === 'crafting' && '🔨'}
                            {skill === 'herbalism' && '🌿'}
                            {skill === 'astrology' && '✨'}
                          </div>
                          <div className="skill-info">
                            <div className="skill-name">{skill.charAt(0).toUpperCase() + skill.slice(1)}</div>
                            <div className="skill-level">Level {level}</div>
                            <div className="skill-description">{getSkillDescription(skill)}</div>
                            <div className="skill-bonus">{getSkillLevelBonus(skill, level)}</div>
                            <div className="skill-exp-bar">
                              <div className="skill-exp-progress" style={{width: `${expPercentage}%`}}></div>
                            </div>
                            <div className="skill-exp-text">{exp} / {nextLevelExp} XP</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="journal-section">
                  <h3>Town Rumors</h3>
                  {gameState.rumors && gameState.rumors.length > 0 ? (
                    <div className="rumor-list">
                      {gameState.rumors.map((rumor, index) => (
                        <div key={index} className="rumor-item">
                          <p>{rumor.content}</p>
                          <div className="rumor-source">— {rumor.origin}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No rumors in town currently.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Status bar */}
        <div className="game-status-bar">
          <div className="status-item">
            <span className="status-icon">✧</span> 
            <span>{currentPlayer.name}</span>
          </div>
          <div className="status-item">
            <span className="status-icon">⛁</span>
            <span className="status-value">{currentPlayer.gold}</span> Gold
          </div>
          <div className="status-item">
            <span className="status-icon">✨</span>
            <span className="status-value">{currentPlayer.mana}</span> Mana
          </div>
          <div className="status-item">
            <span className="status-icon">☀</span>
            <span className="status-value">{gameState.time.dayCount}</span>
          </div>
          <div className="status-item">
            <span className="status-icon">☾</span>
            <span>{gameState.time.phaseName}</span>
          </div>
          <div className="status-item">
            <span className="status-icon">
              {gameState.time.weatherFate === 'clear' && '☀️'}
              {gameState.time.weatherFate === 'cloudy' && '☁️'}
              {gameState.time.weatherFate === 'rainy' && '🌧️'}
              {gameState.time.weatherFate === 'stormy' && '⛈️'}
              {gameState.time.weatherFate === 'foggy' && '🌫️'}
              {gameState.time.weatherFate === 'windy' && '💨'}
            </span>
            <span>{gameState.time.weatherFate}</span>
          </div>
        </div>
      </div>

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="modal-backdrop" onClick={() => setShowInventoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {activeAction === 'plant' ? 'Select Seeds to Plant' : 
                 activeAction === 'harvest' ? 'Harvest Plant' : 
                 'Your Inventory'}
              </h2>
              <button className="close-button" onClick={() => setShowInventoryModal(false)}>×</button>
            </div>

            <div className="filter-bar">
              <button 
                className={`filter-button ${itemFilter === null ? 'active' : ''}`}
                onClick={() => setItemFilter(null)}
              >
                All
              </button>
              <button 
                className={`filter-button ${itemFilter === 'seed' ? 'active' : ''}`}
                onClick={() => setItemFilter('seed')}
              >
                Seeds
              </button>
              <button 
                className={`filter-button ${itemFilter === 'herb' ? 'active' : ''}`}
                onClick={() => setItemFilter('herb')}
              >
                Herbs
              </button>
              <button 
                className={`filter-button ${itemFilter === 'crystal' ? 'active' : ''}`}
                onClick={() => setItemFilter('crystal')}
              >
                Crystals
              </button>
              <button 
                className={`filter-button ${itemFilter === 'tool' ? 'active' : ''}`}
                onClick={() => setItemFilter('tool')}
              >
                Tools
              </button>
            </div>

            {currentPlayer.inventory.length > 0 ? (
              <div className="inventory-grid">
                {currentPlayer.inventory
                  .filter(item => itemFilter === null || item.category === itemFilter || item.type === itemFilter)
                  .map((item, index) => (
                    <div 
                      key={index} 
                      className={`inventory-item ${item.category} ${selectedItem === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedItem(item.id)}
                    >
                      <div className="item-icon"></div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-details">
                        {item.type === 'ingredient' && `Quality: ${item.quality}`}
                      </div>
                      <div className="item-quantity">x{item.quantity}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="no-items">
                <p>Your inventory is empty.</p>
                {activeAction === 'plant' && (
                  <p>Visit the market to purchase seeds for planting.</p>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="action-button cancel-button"
                onClick={() => {
                  setShowInventoryModal(false);
                  setSelectedItem(null);
                  if (activeAction !== 'ritual') {
                    setActiveAction(null);
                  }
                }}
              >
                Cancel
              </button>
              
              {activeAction === 'plant' && selectedPlot !== null && (
                <button 
                  className="action-button confirm-button"
                  disabled={selectedItem === null}
                  onClick={() => {
                    if (selectedItem) {
                      plantSeed(selectedPlot, selectedItem);
                    }
                  }}
                >
                  Plant Seed
                </button>
              )}
              
              {activeAction === 'ritual' && (
                <button 
                  className="action-button confirm-button"
                  disabled={selectedItem === null}
                  onClick={() => {
                    if (selectedItem) {
                      // Add the item to the ritual items
                      if (!selectedRitualItems.includes(selectedItem)) {
                        setSelectedRitualItems([...selectedRitualItems, selectedItem]);
                      }
                      setShowInventoryModal(false);
                      setSelectedItem(null);
                    }
                  }}
                >
                  Add to Ritual
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Level Up Modal */}
      {showLevelUpModal && levelUpSkill && (
        <div className="modal-backdrop" onClick={() => setShowLevelUpModal(false)}>
          <div className="level-up-modal" onClick={(e) => e.stopPropagation()}>
            <div className="level-up-header">
              <h2>Level Up!</h2>
              <button className="close-button" onClick={() => setShowLevelUpModal(false)}>×</button>
            </div>
            
            <div className="level-up-content">
              <div className="level-up-icon">
                {levelUpSkill === 'gardening' && '🌱'}
                {levelUpSkill === 'brewing' && '🧪'}
                {levelUpSkill === 'trading' && '💰'}
                {levelUpSkill === 'crafting' && '🔨'}
                {levelUpSkill === 'herbalism' && '🌿'}
                {levelUpSkill === 'astrology' && '✨'}
              </div>
              
              <div className="level-up-skill-name">
                {levelUpSkill.charAt(0).toUpperCase() + levelUpSkill.slice(1)}
              </div>
              
              <div className="level-up-level">
                Level {currentPlayer.skills[levelUpSkill as keyof typeof currentPlayer.skills]}
              </div>
              
              <div className="level-up-description">
                {getSkillDescription(levelUpSkill)}
              </div>
              
              <div className="level-up-bonus">
                {getSkillLevelBonus(levelUpSkill, currentPlayer.skills[levelUpSkill as keyof typeof currentPlayer.skills])}
              </div>
              
              <div className="level-up-next">
                <p>Next level at: {skillExperienceNeeded(currentPlayer.skills[levelUpSkill as keyof typeof currentPlayer.skills])} experience</p>
              </div>
            </div>
            
            <div className="level-up-actions">
              <button 
                className="level-up-button"
                onClick={() => setShowLevelUpModal(false)}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Brewing Puzzle Overlay */}
      {showBrewingPuzzle && (
        <div className="puzzle-overlay">
          <div className="puzzle-wrapper">
            <button 
              className="puzzle-close-button"
              onClick={handlePuzzleSkip}
            >
              ×
            </button>
            <BrewingPuzzle 
              onComplete={handleBrewingPuzzleComplete}
              currentLunarPhase={gameState.time.phaseName as MoonPhase}
            />
          </div>
        </div>
      )}
      
      {/* Seasonal Attunement Puzzle Overlay */}
      {showSeasonalPuzzle && (
        <div className="puzzle-overlay">
          <div className="puzzle-wrapper">
            <button 
              className="puzzle-close-button"
              onClick={handlePuzzleSkip}
            >
              ×
            </button>
            <SeasonalAttunementPuzzle 
              onComplete={handleSeasonalPuzzleComplete}
              onSkip={handlePuzzleSkip}
              season={gameState.time.season as Season}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleApp;