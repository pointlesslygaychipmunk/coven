import express from 'express';
import { playPlantingMiniGame, plantNewInteractivePlant, playHarvestingMiniGame, harvestPlant, 
         playWateringMiniGame, applyWateringResults, playWeatherProtectionMiniGame, 
         applyWeatherProtection, crossBreedPlants, updatePlantGrowth,
         fertilizePlot, applySeasonalAttunement, analyzeCrossBreedingCompatibility,
         applyHanbangIngredientModifiers, createHanbangIngredient, setupGardenStructure,
         getWeatherForecastForGarden, processWeatherEvent, InteractivePlant,
         GardenStructure } from '../interactiveGarden.js';
import { GameHandler } from '../gameHandler.js';

// Import types from shared directory
import { Season, MoonPhase, Player, GardenSlot, InventoryItem, ItemType, ItemCategory, Rarity as ItemQuality, Skills, Plant } from 'coven-shared';
                    
// Type definitions and interfaces
// =================================

// Define types that extend existing types in shared
// Define extended Skills interface for additional skill types
interface ExtendedSkills extends Skills {
  [key: string]: number; // Allow indexing with string keys for all skills
  weatherProofing: number;
  meteorology: number;
  breeding: number;
  hanbang: number;
  alchemy: number;
  rituals: number;
}

// Define FertilizerItem interface to match what's expected
interface FertilizerItem {
  id: string;
  name: string;
  category: string;
  quality: ItemQuality;
  potency?: number;
  specialEffect?: string;
  [key: string]: any;
}

// Define HanbangIngredient interface with proper types
interface HanbangIngredient {
  id: string;
  name: string;
  type: ItemType;
  category: ItemCategory;
  quality: ItemQuality;
  effectivenessScore: number;
  primaryEffect: string;
  secondaryEffects: string[];
  skinType: 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal';
  skinConcern: 'acne' | 'aging' | 'hyperpigmentation' | 'dryness' | 'sensitivity' | 'redness' | 'dullness';
  potency: number;
  moonPhase: MoonPhase;
  season: Season;
  sourceIngredient: string;
  harvestedAt: number;
  processedAt: number;
  description?: string;
  imagePath?: string;
  quantity?: number;
  baseId?: string; // Added to match InventoryItem expectations
}

// Define extended garden slot for upgrades
interface ExtendedGardenSlot extends GardenSlot {
  upgrades: GardenPlotUpgrade[];
  level: number;
  position?: { x: number; y: number };
  protectedBy?: string[];
  weatherProtection?: number;
  waterRetention?: number;
  size?: number;
  capacity?: number;
  specialization?: {
    type: string;
    bonus: number;
    affinity: string[];
  };
}

// Define garden plot upgrade type
type GardenPlotUpgrade = {
  level: number;
  type: string;
  value: number;
  appliedAt: number;
};

// Define player buff type
interface PlayerBuff {
  id: string;
  name: string;
  description: string;
  duration: number;
  expiresAt: number;
  effects: {
    gardenQualityBonus?: number;
    gardenYieldBonus?: number;
    weatherResistance?: number;
    [key: string]: number | undefined;
  };
}

// Define extended player types
interface ExtendedPlayerWithBuffs extends Player {
  buffs: PlayerBuff[];
}

interface ExtendedPlayer extends Player {
  gardenStructures: GardenStructure[];
}

const router: express.Router = express.Router();
const gameHandler = new GameHandler();

// Helper function to get player by ID
const getPlayerById = (id: string) => {
  const gameState = gameHandler.getState();
  return gameState.players.find(p => p.id === id);
};

// Helper function to update player
const updatePlayer = (player: Player) => {
  // In a real application, this would update the player in the game state
  // For now, we'll just simulate success
  return true;
};

/**
 * Utility functions for type conversion
 */

/**
 * Converts a regular Plant to an InteractivePlant for more detailed operations
 * @param plant - The basic Plant object
 * @param plotId - The ID of the garden plot
 * @returns An InteractivePlant object with all required properties
 */
export const convertPlantToInteractivePlant = (plant: Plant, plotId: string | number): InteractivePlant => {
  if (!plant) return null as any;
  
  // Extract variety ID from plant ID (format: type_name_uniqueID)
  const varietyId = plant.id.split('_')[0] || plant.id;
  
  return {
    // Base plant properties
    id: plant.id,
    name: plant.name,
    category: plant.category,
    health: plant.health,
    moonBlessed: plant.moonBlessed,
    seasonalModifier: plant.seasonalModifier,
    growth: plant.growth,
    maxGrowth: plant.maxGrowth,
    age: plant.age,
    mature: plant.mature,
    
    // InteractivePlant specific properties
    varietyId: varietyId,
    plotId: String(plotId),
    currentStage: plant.mature ? 'mature' : (plant.growth > (plant.maxGrowth / 2) ? 'growing' : 'seedling'),
    growthProgress: plant.growth / plant.maxGrowth * 100,
    waterLevel: plant.watered ? 75 : 25,
    nextActionTime: Date.now(),
    predictedQuality: (plant.qualityModifier && plant.qualityModifier > 1.5) ? 'rare' : 
                     (plant.qualityModifier && plant.qualityModifier > 1) ? 'uncommon' : 'common',
    predictedYield: 1,
    geneticTraits: plant.mutations ? plant.mutations.map((m: string) => ({
      id: `trait_${m}`,
      name: m,
      description: `A trait that affects ${m}`,
      effect: m,
      qualityModifier: 0.1,
      yieldModifier: 0.1,
      growthTimeModifier: 1,
      rarityTier: 1,
      dominant: false
    })) : [],
    growthModifiers: [],
    lastInteraction: Date.now(),
    createdAt: Date.now(),
    careHistory: []
  };
};

/**
 * Converts an InteractivePlant back to a basic Plant
 * @param interactivePlant - The detailed InteractivePlant object
 * @returns A simpler Plant object for basic operations
 */
export const convertInteractivePlantToPlant = (interactivePlant: InteractivePlant): Plant => {
  if (!interactivePlant) return null as any;
  
  return {
    id: interactivePlant.id,
    name: interactivePlant.name || `${interactivePlant.varietyId} Plant`,
    category: interactivePlant.category as ItemCategory,
    imagePath: undefined, // Not tracked in InteractivePlant
    growth: interactivePlant.growth || interactivePlant.growthProgress || 0,
    maxGrowth: interactivePlant.maxGrowth || 100,
    seasonalModifier: interactivePlant.seasonalModifier,
    watered: interactivePlant.waterLevel > 30, // Consider watered if level > 30
    health: interactivePlant.health,
    age: interactivePlant.age || 0,
    mature: interactivePlant.mature || interactivePlant.currentStage === 'mature',
    moonBlessed: interactivePlant.moonBlessed,
    deathChance: 0, // Default value
    mutations: interactivePlant.geneticTraits?.map(trait => trait.name) || [],
    qualityModifier: interactivePlant.geneticTraits?.reduce((sum, trait) => sum + trait.qualityModifier, 0) || 0
  };
};

/**
 * Get garden state for a player
 * GET /api/garden/state/:playerId
 */
router.get('/state/:playerId', (req, res) => {
  try {
    const { playerId } = req.params;
    const player = getPlayerById(playerId);
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // For compatibility with existing code, ensure garden is an array
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    // Get game state for context
    const gameState = gameHandler.getState();
    
    // Update plant growth based on time elapsed
    const updatedPlots = player.garden.map((plot: any) => {
      if (!plot.plant) return plot;
      
      const currentTime = Date.now();
      const updatedPlant = updatePlantGrowth(
        plot.plant, 
        currentTime, 
        gameState.time.season, 
        gameState.time.phaseName, 
        gameState.time.weatherFate
      );
      
      return {
        ...plot,
        plant: updatedPlant
      };
    });
    
    // Update the player's garden
    player.garden = updatedPlots;
    updatePlayer(player);
    
    return res.json({ plots: updatedPlots });
  } catch (error) {
    console.error('Error getting garden state:', error);
    return res.status(500).json({ message: 'Failed to get garden state' });
  }
});

/**
 * Plant a seed in a garden plot
 * POST /api/garden/plant
 */
router.post('/plant', (req, res) => {
  try {
    const { playerId, plotId, seedId, miniGameResult, currentSeason, currentMoonPhase, currentWeather } = req.body;
    
    // Get game state for context
    const gameState = gameHandler.getState();
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // For compatibility with existing code
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    // Find the plot
    const plotIndex = player.garden.findIndex(p => p.id === Number(plotId));
    if (plotIndex === -1) {
      return res.status(404).json({ message: 'Plot not found' });
    }
    
    const plot = player.garden[plotIndex];
    
    // Check if plot is available
    if (plot.plant) {
      return res.status(400).json({ message: 'Plot already has a plant' });
    }
    
    // Find the seed in inventory
    if (!player.inventory || !Array.isArray(player.inventory)) {
      player.inventory = [];
    }
    
    const seedIndex = player.inventory.findIndex((item: any) => item.id === seedId && item.type === 'seed');
    if (seedIndex === -1 || player.inventory[seedIndex].quantity <= 0) {
      return res.status(400).json({ message: 'Seed not found in inventory' });
    }
    
    const seed = player.inventory[seedIndex];
    
    // Get variety information (in a real implementation, this would come from a database)
    const variety = {
      id: seed.baseId,
      name: seed.name,
      baseQuality: seed.quality || 2,
      baseYield: 1,
      growthTimeDays: 3,
      preferredSeason: seed.harvestedSeason || currentSeason || gameState.time.season,
      baseTraits: []
    };
    
    // Process mini-game result or create default
    const gameResult = miniGameResult || {
      success: true,
      timingBonus: 0,
      qualityBonus: 0,
      yieldBonus: 0,
      uniqueTraitChance: 0,
      score: 0.5,
      soilQuality: plot.fertility / 100,
      wateringLevel: plot.moisture / 100,
      spacingScore: 0.7
    };
    
    // Combine player data for our functions
    const playerData = { 
      id: player.id, 
      name: player.name || 'Witch',
      gardeningSkill: player.skills?.gardening || 0 
    };
    
    // Simulate planting mini-game if not provided
    const plantingResult = miniGameResult ? 
      gameResult : 
      playPlantingMiniGame(
        playerData,
        plot,
        variety.id,
        { timing: 0.5, precision: 0.5, pattern: 0.5 }
      );
    
    // Create the new plant
    const newPlant = plantNewInteractivePlant(
      playerData,
      plot,
      variety,
      plantingResult,
      currentSeason || gameState.time.season,
      currentMoonPhase || gameState.time.phaseName,
      currentWeather || gameState.time.weatherFate
    );
    
    // Convert the InteractivePlant back to a Plant for GardenSlot
    const standardPlant = convertInteractivePlantToPlant(newPlant);
    
    // Update plot with new plant
    const updatedPlot = {
      ...plot,
      plant: standardPlant
    };
    
    // Update player's garden
    player.garden[plotIndex] = updatedPlot;
    
    // Update player's inventory (remove seed)
    if (player.inventory[seedIndex].quantity <= 1) {
      player.inventory.splice(seedIndex, 1);
    } else {
      player.inventory[seedIndex].quantity -= 1;
    }
    
    // Update player experience
    const experienceGained = 5 + (plantingResult.success ? 5 : 0);
    if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0, 
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
    player.skills.gardening = (player.skills.gardening || 0) + experienceGained;
    
    // Save player state
    updatePlayer(player);
    
    return res.json({
      plot: updatedPlot,
      inventory: player.inventory,
      experience: experienceGained
    });
  } catch (error) {
    console.error('Error planting seed:', error);
    return res.status(500).json({ message: 'Failed to plant seed' });
  }
});

/**
 * Harvest a plant from a garden plot
 * POST /api/garden/harvest
 */
router.post('/harvest', (req, res) => {
  try {
    const { playerId, plotId, miniGameResult, currentSeason, currentMoonPhase } = req.body;
    
    // Get game state for context
    const gameState = gameHandler.getState();
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // For compatibility with existing code
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    if (!player.inventory || !Array.isArray(player.inventory)) {
      player.inventory = [];
    }
    
    // Find the plot
    const plotIndex = player.garden.findIndex(p => p.id === Number(plotId));
    if (plotIndex === -1) {
      return res.status(404).json({ message: 'Plot not found' });
    }
    
    const plot = player.garden[plotIndex];
    
    // Check if plot has a mature plant
    if (!plot.plant || !plot.plant.mature) {
      return res.status(400).json({ message: 'No mature plant to harvest' });
    }
    
    // Process mini-game result or create default
    const gameResult = miniGameResult || {
      success: true,
      timingBonus: 0,
      qualityBonus: 0,
      yieldBonus: 0,
      uniqueTraitChance: 0,
      precisionScore: 0.6,
      speedScore: 0.6,
      carefulnessScore: 0.6
    };
    
    // Combine player data for our functions
    const playerData = { 
      id: player.id, 
      gardeningSkill: player.skills?.gardening || 0 
    };
    
    // Convert Plant to InteractivePlant for the mini-game
    const interactivePlant = convertPlantToInteractivePlant(plot.plant, plot.id);
    
    // Simulate harvesting mini-game if not provided
    const harvestingResult = miniGameResult ? 
      gameResult : 
      playHarvestingMiniGame(
        playerData,
        interactivePlant,
        { precision: 0.6, speed: 0.6, carefulness: 0.6 }
      );
    
    // Harvest the plant
    const harvestResult = harvestPlant(
      interactivePlant,
      harvestingResult,
      currentSeason || gameState.time.season,
      currentMoonPhase || gameState.time.phaseName
    );
    
    // Add harvested ingredients to player inventory
    const harvestedIngredients = harvestResult.harvestedIngredients.map(ingredient => ({
      id: ingredient.id,
      baseId: plot.plant.id.split('_')[0],
      name: ingredient.name,
      type: 'ingredient' as ItemType,
      category: (plot.plant.category || 'herb') as ItemCategory,
      quantity: 1,
      quality: ingredient.quality,
      harvestedDuring: currentMoonPhase || gameState.time.phaseName,
      harvestedSeason: currentSeason || gameState.time.season,
      description: `A ${ingredient.quality} quality ${plot.plant.name} harvested under a ${currentMoonPhase || gameState.time.phaseName}.`
    } as InventoryItem));
    
    // Add seeds to player inventory if any were obtained
    const seeds = [];
    if (harvestResult.seedsObtained > 0) {
      seeds.push({
        id: `seed_${plot.plant.id}_${Date.now()}`,
        baseId: `seed_${plot.plant.id.split('_')[0]}`,
        name: `${plot.plant.name} Seed`,
        type: 'seed' as ItemType,
        category: 'seed' as ItemCategory,
        quantity: harvestResult.seedsObtained,
        harvestedDuring: currentMoonPhase || gameState.time.phaseName,
        harvestedSeason: currentSeason || gameState.time.season,
        description: `Seeds harvested from a ${plot.plant.name}.`
      } as InventoryItem);
    }
    
    // Update player's inventory
    player.inventory = [...player.inventory, ...harvestedIngredients, ...seeds];
    
    // Clear the plot or update with remaining plant
    if (harvestResult.remainingPlant) {
      // Convert the InteractivePlant back to a Plant for GardenSlot
      const standardPlant = convertInteractivePlantToPlant(harvestResult.remainingPlant);
      
      player.garden[plotIndex] = {
        ...plot,
        plant: standardPlant
      };
    } else {
      player.garden[plotIndex] = {
        ...plot,
        plant: null
      };
    }
    
    // Update player experience
    if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
    player.skills.gardening = (player.skills.gardening || 0) + harvestResult.experience;
    
    // Save player state
    updatePlayer(player);
    
    return res.json({
      harvestedIngredients,
      seedsObtained: harvestResult.seedsObtained,
      experience: harvestResult.experience,
      plot: player.garden[plotIndex],
      inventory: player.inventory
    });
  } catch (error) {
    console.error('Error harvesting plant:', error);
    return res.status(500).json({ message: 'Failed to harvest plant' });
  }
});

/**
 * Water a specific garden plot
 * POST /api/garden/water
 */
router.post('/water', (req, res) => {
  try {
    const { playerId, plotId, miniGameResult, currentWeather } = req.body;
    
    // Get game state for context
    const gameState = gameHandler.getState();
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // For compatibility with existing code
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    // Find the plot
    const plotIndex = player.garden.findIndex(p => p.id === Number(plotId));
    if (plotIndex === -1) {
      return res.status(404).json({ message: 'Plot not found' });
    }
    
    const plot = player.garden[plotIndex];
    
    // Check if plot has a plant
    if (!plot.plant) {
      // Can still water empty plots to improve moisture
      const updatedPlot = {
        ...plot,
        moisture: Math.min(100, (plot.moisture || 0) + 30)
      };
      
      player.garden[plotIndex] = updatedPlot;
      updatePlayer(player);
      
      return res.json({
        plot: updatedPlot,
        experience: 1
      });
    }
    
    // Process mini-game result or create default
    const gameResult = miniGameResult || {
      success: true,
      timingBonus: 0,
      qualityBonus: 0,
      yieldBonus: 0,
      uniqueTraitChance: 0,
      distributionScore: 0.5,
      amountScore: 0.5,
      techniqueScore: 0.5
    };
    
    // Combine player data for our functions
    const playerData = { 
      id: player.id, 
      gardeningSkill: player.skills?.gardening || 0 
    };
    
    // Convert Plant to InteractivePlant for the mini-game
    const interactivePlant = convertPlantToInteractivePlant(plot.plant, plot.id);
    
    // Simulate watering mini-game if not provided
    const wateringResult = miniGameResult ? 
      gameResult : 
      playWateringMiniGame(
        playerData,
        interactivePlant,
        { distribution: 0.5, amount: 0.5, technique: 0.5 }
      );
    
    // Apply watering to the plant
    const updatedPlant = applyWateringResults(
      interactivePlant,
      wateringResult,
      currentWeather || gameState.time.weatherFate
    );
    
    // Convert the InteractivePlant back to a Plant for GardenSlot
    const standardPlant = convertInteractivePlantToPlant(updatedPlant);
    
    // Update moisture level in the plot
    const moistureIncrease = wateringResult.success ? 40 : 20;
    const updatedPlot = {
      ...plot,
      plant: standardPlant,
      moisture: Math.min(100, (plot.moisture || 0) + moistureIncrease)
    };
    
    // Update player's garden
    player.garden[plotIndex] = updatedPlot;
    
    // Calculate experience
    const experienceGained = wateringResult.success ? 3 : 1;
    if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
    player.skills.gardening = (player.skills.gardening || 0) + experienceGained;
    
    // Save player state
    updatePlayer(player);
    
    return res.json({
      plot: updatedPlot,
      experience: experienceGained
    });
  } catch (error) {
    console.error('Error watering plant:', error);
    return res.status(500).json({ message: 'Failed to water plant' });
  }
});

/**
 * Water all garden plots (used with seasonal attunement)
 * POST /api/garden/water-all
 */
router.post('/water-all', (req, res) => {
  try {
    const { playerId, attunementBonus } = req.body;
    
    // Get game state for context
    const gameState = gameHandler.getState();
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // For compatibility with existing code
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    // Apply water to all plots
    const updatedPlots = player.garden.map((plot: any) => {
      // Calculate moisture increase with attunement bonus
      const bonus = attunementBonus || 0;
      const moistureIncrease = 20 + (bonus * 30);
      
      // Apply effects to plant if present
      let updatedPlant = plot.plant;
      if (plot.plant) {
        // Update plant health based on attunement bonus
        const healthBonus = Math.floor(bonus * 10);
        updatedPlant = {
          ...plot.plant,
          health: Math.min(100, plot.plant.health + healthBonus),
          growthModifiers: [
            ...(plot.plant.growthModifiers || []),
            {
              source: 'attunement',
              description: 'Seasonal attunement bonus',
              qualityModifier: bonus * 0.1,
              yieldModifier: bonus * 0.1,
              growthRateModifier: 1 + (bonus * 0.2),
              expiresAt: Date.now() + (24 * 3600 * 1000) // 24 hours
            }
          ]
        };
      }
      
      return {
        ...plot,
        plant: updatedPlant,
        moisture: Math.min(100, (plot.moisture || 0) + moistureIncrease)
      };
    });
    
    // Update player's garden
    player.garden = updatedPlots;
    
    // Calculate experience
    const experienceGained = Math.floor(5 + (attunementBonus * 10));
    if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
    player.skills.gardening = (player.skills.gardening || 0) + experienceGained;
    
    // Save player state
    updatePlayer(player);
    
    return res.json({
      plots: updatedPlots,
      experience: experienceGained
    });
  } catch (error) {
    console.error('Error watering all plots:', error);
    return res.status(500).json({ message: 'Failed to water all plots' });
  }
});

/**
 * Protect a plant from adverse weather
 * POST /api/garden/protect
 */
router.post('/protect', (req, res) => {
  try {
    const { playerId, plotId, miniGameResult, currentWeather } = req.body;
    
    // Get game state for context
    const gameState = gameHandler.getState();
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // For compatibility with existing code
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    // Find the plot
    const plotIndex = player.garden.findIndex(p => p.id === Number(plotId));
    if (plotIndex === -1) {
      return res.status(404).json({ message: 'Plot not found' });
    }
    
    const plot = player.garden[plotIndex];
    
    // Check if plot has a plant
    if (!plot.plant) {
      return res.status(400).json({ message: 'No plant to protect' });
    }
    
    // Process mini-game result or create default
    const gameResult = miniGameResult || {
      success: true,
      timingBonus: 0,
      qualityBonus: 0,
      yieldBonus: 0,
      uniqueTraitChance: 0,
      reactionTime: 0.5,
      coverageScore: 0.5,
      reinforcementScore: 0.5
    };
    
    // Combine player data for our functions
    const playerData = { 
      id: player.id, 
      gardeningSkill: player.skills?.gardening || 0 
    };
    
    // Convert Plant to InteractivePlant for the mini-game
    const interactivePlant = convertPlantToInteractivePlant(plot.plant, plot.id);
    
    // Simulate protection mini-game if not provided
    const protectionResult = miniGameResult ? 
      gameResult : 
      playWeatherProtectionMiniGame(
        playerData,
        interactivePlant,
        currentWeather || gameState.time.weatherFate,
        { reactionTime: 0.5, coverage: 0.5, reinforcement: 0.5 }
      );
    
    // Apply protection to the plant
    const updatedPlant = applyWeatherProtection(
      interactivePlant,
      protectionResult,
      currentWeather || gameState.time.weatherFate
    );
    
    // Convert the InteractivePlant back to a Plant for GardenSlot
    const standardPlant = convertInteractivePlantToPlant(updatedPlant);
    
    // Update plot with protected plant
    const updatedPlot = {
      ...plot,
      plant: standardPlant
    };
    
    // Update player's garden
    player.garden[plotIndex] = updatedPlot;
    
    // Calculate experience
    const experienceGained = protectionResult.success ? 6 : 2;
    if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
    player.skills.gardening = (player.skills.gardening || 0) + experienceGained;
    
    // Save player state
    updatePlayer(player);
    
    return res.json({
      plot: updatedPlot,
      experience: experienceGained
    });
  } catch (error) {
    console.error('Error protecting plant:', error);
    return res.status(500).json({ message: 'Failed to protect plant' });
  }
});

/**
 * Cross-breed two plants to create a new variety
 * POST /api/garden/cross-breed
 */
router.post('/cross-breed', (req, res) => {
  try {
    const { playerId, plant1Id, plant2Id, currentSeason, currentMoonPhase } = req.body;
    
    // Get game state for context
    const gameState = gameHandler.getState();
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // For compatibility with existing code
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    // Find both plants in the garden
    const plant1Plot = player.garden.find((plot: any) => plot.plant && plot.plant.id === plant1Id);
    const plant2Plot = player.garden.find((plot: any) => plot.plant && plot.plant.id === plant2Id);
    
    if (!plant1Plot || !plant1Plot.plant || !plant2Plot || !plant2Plot.plant) {
      return res.status(400).json({ message: 'One or both plants not found' });
    }
    
    // Check if plants are mature
    if (!plant1Plot.plant.mature || !plant2Plot.plant.mature) {
      return res.status(400).json({ message: 'Plants must be mature for cross-breeding' });
    }
    
    // Combine player data for our functions
    const playerData = { 
      id: player.id, 
      gardeningSkill: player.skills?.gardening || 0 
    };
    
    // Use the utility function to convert Plants to InteractivePlants
    const plant1Interactive = convertPlantToInteractivePlant(plant1Plot.plant, plant1Plot.id);
    const plant2Interactive = convertPlantToInteractivePlant(plant2Plot.plant, plant2Plot.id);
    
    // Perform the cross-breeding operation with properly converted plants
    const result = crossBreedPlants(
      plant1Interactive,
      plant2Interactive,
      playerData,
      currentSeason || gameState.time.season,
      currentMoonPhase || gameState.time.phaseName
    );
    
    // If successful, create seeds from the new variety
    let seeds = [];
    if (result.success && result.newVarietyId) {
      // Create 1-3 seeds of the new variety
      const seedCount = Math.floor(Math.random() * 3) + 1;
      seeds.push({
        id: `seed_${result.newVarietyId}_${Date.now()}`,
        baseId: `seed_${result.newVarietyId}`,
        name: `${result.newVarietyName} Seed`,
        type: 'seed' as ItemType,
        category: 'seed' as ItemCategory,
        quantity: seedCount,
        quality: result.rarityTier,
        harvestedDuring: currentMoonPhase || gameState.time.phaseName,
        harvestedSeason: currentSeason || gameState.time.season,
        description: `Seeds from a newly cross-bred variety created from ${plant1Plot.plant.name} and ${plant2Plot.plant.name}.`
      } as InventoryItem);
      
      // Add seeds to player inventory
      if (!player.inventory || !Array.isArray(player.inventory)) {
        player.inventory = [];
      }
      
      player.inventory = [...player.inventory, ...seeds];
      
      // Calculate experience
      const experienceGained = 15 + (result.rarityTier * 5);
      if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
      player.skills.gardening = (player.skills.gardening || 0) + experienceGained;
      
      // After cross-breeding, plants are typically consumed
      // Find plot indices
      const plot1Index = player.garden.findIndex((plot: any) => plot.plant && plot.plant.id === plant1Id);
      const plot2Index = player.garden.findIndex((plot: any) => plot.plant && plot.plant.id === plant2Id);
      
      // Clear the plots
      if (plot1Index !== -1) {
        player.garden[plot1Index] = {
          ...player.garden[plot1Index],
          plant: null
        };
      }
      
      if (plot2Index !== -1) {
        player.garden[plot2Index] = {
          ...player.garden[plot2Index],
          plant: null
        };
      }
      
      // Save player state
      updatePlayer(player);
      
      // Add message and experience to the result
      result.message = `Success! You've created a new variety: ${result.newVarietyName}.`;
      
      return res.json({
        ...result,
        seeds,
        experience: experienceGained
      });
    } else {
      // Failed cross-breeding
      result.message = result.message || "The cross-breeding attempt failed. The plants were incompatible.";
      
      // Small experience gain for trying
      const experienceGained = 3;
      if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
      player.skills.gardening = (player.skills.gardening || 0) + experienceGained;
      
      // Save player state
      updatePlayer(player);
      
      return res.json({
        ...result,
        seeds: [],
        experience: experienceGained
      });
    }
  } catch (error) {
    console.error('Error cross-breeding plants:', error);
    return res.status(500).json({ message: 'Failed to cross-breed plants' });
  }
});

/**
 * Get all available plant varieties
 * GET /api/garden/varieties
 */
router.get('/varieties', (req, res) => {
  try {
    // In a real implementation, this would come from a database
    // For now, we'll return a simple list of example varieties
    const varieties = [
      {
        id: 'herb_lavender',
        name: 'Lavender',
        category: 'herb',
        preferredSeason: 'Summer',
        growthTimeDays: 3,
        baseQuality: 3,
        baseYield: 2,
        description: 'A fragrant herb with calming properties.'
      },
      {
        id: 'herb_chamomile',
        name: 'Chamomile',
        category: 'herb',
        preferredSeason: 'Spring',
        growthTimeDays: 2,
        baseQuality: 2,
        baseYield: 3,
        description: 'A gentle herb that promotes relaxation.'
      },
      {
        id: 'herb_mint',
        name: 'Mint',
        category: 'herb',
        preferredSeason: 'Spring',
        growthTimeDays: 2,
        baseQuality: 2,
        baseYield: 4,
        description: 'A refreshing herb with cooling properties.'
      },
      {
        id: 'flower_rose',
        name: 'Rose',
        category: 'flower',
        preferredSeason: 'Summer',
        growthTimeDays: 4,
        baseQuality: 4,
        baseYield: 2,
        description: 'A beautiful flower with potent essence.'
      },
      {
        id: 'root_ginseng',
        name: 'Ginseng',
        category: 'root',
        preferredSeason: 'Fall',
        growthTimeDays: 5,
        baseQuality: 4,
        baseYield: 1,
        description: 'A powerful root that enhances vitality.'
      },
      {
        id: 'mushroom_reishi',
        name: 'Reishi Mushroom',
        category: 'mushroom',
        preferredSeason: 'Fall',
        growthTimeDays: 3,
        baseQuality: 3,
        baseYield: 2,
        description: 'A medicinal mushroom with balancing properties.'
      },
      // Hanbang-specific plants
      {
        id: 'herb_centella',
        name: 'Centella Asiatica',
        category: 'herb',
        preferredSeason: 'Summer',
        growthTimeDays: 4,
        baseQuality: 4,
        baseYield: 2,
        skincare: true,
        skincareBenefits: ['healing', 'anti-inflammatory'],
        description: 'A healing herb commonly used in Korean skincare for its skin-soothing properties.'
      },
      {
        id: 'root_licorice',
        name: 'Licorice Root',
        category: 'root',
        preferredSeason: 'Fall',
        growthTimeDays: 5,
        baseQuality: 3,
        baseYield: 2,
        skincare: true,
        skincareBenefits: ['brightening', 'soothing'],
        description: 'A root with powerful brightening and soothing properties for skincare.'
      },
      {
        id: 'herb_green_tea',
        name: 'Green Tea',
        category: 'herb',
        preferredSeason: 'Spring',
        growthTimeDays: 3,
        baseQuality: 3,
        baseYield: 3,
        skincare: true,
        skincareBenefits: ['antioxidant', 'anti-aging'],
        description: 'Rich in antioxidants that protect against free radical damage and aging.'
      },
      {
        id: 'flower_chrysanthemum',
        name: 'Chrysanthemum',
        category: 'flower',
        preferredSeason: 'Fall',
        growthTimeDays: 4,
        baseQuality: 3,
        baseYield: 2,
        skincare: true,
        skincareBenefits: ['calming', 'cooling'],
        description: 'A flower that provides cooling and calming effects for sensitive skin.'
      }
    ];
    
    return res.json(varieties);
  } catch (error) {
    console.error('Error getting plant varieties:', error);
    return res.status(500).json({ message: 'Failed to get plant varieties' });
  }
});

/**
 * Get garden weather forecast for planning
 * GET /api/garden/weather-forecast/:playerId
 */
router.get('/weather-forecast/:playerId', (req, res) => {
  try {
    const { playerId } = req.params;
    const { days = 3 } = req.query;
    
    // Get game state for context
    const gameState = gameHandler.getState();
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Get weather forecast data
    const forecast = getWeatherForecastForGarden(
      playerId,
      parseInt(days as string, 10) || 3,
      gameState.time.season,
      gameState.time.phaseName
    );
    
    // Update player's meteorology skill for checking the forecast
    const experienceGained = 1;
    if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
    
    // Update player skills with proper type handling
    const extendedSkills = player.skills as ExtendedSkills;
    extendedSkills.meteorology = (extendedSkills.meteorology || 0) + experienceGained;
    updatePlayer(player);
    
    return res.json({
      forecast,
      season: gameState.time.season,
      currentWeather: gameState.time.weatherFate,
      experience: experienceGained
    });
  } catch (error) {
    console.error('Error getting weather forecast:', error);
    return res.status(500).json({ message: 'Failed to get weather forecast' });
  }
});

/**
 * Process seasonal attunement mini-game results
 * POST /api/garden/seasonal-attunement
 */
router.post('/seasonal-attunement', (req, res) => {
  try {
    const { playerId, miniGameResult, currentSeason } = req.body;
    
    // Get game state for context
    const gameState = gameHandler.getState();
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // For compatibility with existing code
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    // Process mini-game result or create default
    const gameResult = miniGameResult || {
      success: true,
      score: 0.6,
      seasonAlignment: 0.7,
      elementBalance: 0.5,
      ritualPrecision: 0.6
    };
    
    // Apply seasonal attunement effects to all plants
    const attunementBonus = gameResult.success ? 
      (gameResult.score + gameResult.seasonAlignment + gameResult.elementBalance + gameResult.ritualPrecision) / 4 : 
      0.1;
    
    const season = currentSeason || gameState.time.season;
    
    // Apply seasonal effects to all garden plots
    const updatedPlots = player.garden.map((plot: any) => {
      if (!plot.plant) return plot;
      
      // Apply seasonal attunement to the plant
      const updatedPlant = applySeasonalAttunement(
        plot.plant,
        season,
        attunementBonus,
        gameState.time.phaseName
      );
      
      return {
        ...plot,
        plant: updatedPlant,
        // Seasonal attunement also improves soil quality
        fertility: Math.min(100, plot.fertility + Math.floor(attunementBonus * 10))
      };
    });
    
    // Update player's garden
    player.garden = updatedPlots;
    
    // Calculate experience 
    const experienceGained = gameResult.success ? 
      Math.floor(10 + (attunementBonus * 20)) : 5;
    
    // Update player skills
    if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
    
    // Apply type assertion for extended skills
    const extendedSkills = player.skills as ExtendedSkills;
    
    // Update skills
    extendedSkills.gardening = (extendedSkills.gardening || 0) + experienceGained;
    extendedSkills.rituals = (extendedSkills.rituals || 0) + Math.floor(experienceGained / 2);
    
    // Add seasonal attunement buff to player with proper typing
    const extendedPlayer = player as ExtendedPlayerWithBuffs;
    if (!extendedPlayer.buffs) extendedPlayer.buffs = [];
    extendedPlayer.buffs.push({
      id: `seasonal_attunement_${Date.now()}`,
      name: `${season} Attunement`,
      description: `Your garden is attuned to the energy of ${season}, improving growth and quality.`,
      duration: 24 * 3600 * 1000, // 24 hours
      expiresAt: Date.now() + (24 * 3600 * 1000),
      effects: {
        gardenQualityBonus: attunementBonus * 0.2,
        gardenYieldBonus: attunementBonus * 0.2,
        weatherResistance: attunementBonus * 0.3
      }
    });
    
    // Save player state
    updatePlayer(player);
    
    return res.json({
      plots: updatedPlots,
      attunementBonus,
      experience: experienceGained,
      buffs: (player as any).buffs
    });
  } catch (error) {
    console.error('Error applying seasonal attunement:', error);
    return res.status(500).json({ message: 'Failed to apply seasonal attunement' });
  }
});

/**
 * Add garden structure (greenhouse, shade structure, etc)
 * POST /api/garden/structures
 */
router.post('/structures', (req, res) => {
  try {
    const { playerId, structureType, position, size } = req.body;
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Define specific GardenStructure interface for this endpoint
    type GardenStructureForSetup = {
      id: string;
      type: string;
      name: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      buildDate: number;
      durability: number;
      maxDurability: number;
      protection: number;
      effects: Array<{
        type: string;
        value: number;
        description: string;
      }>;
      buildQuality: number;
    };
    
    // Define extended player type
    interface ExtendedPlayer extends Player {
      gardenStructures: GardenStructure[];
    }
    
    // Ensure garden structures array exists
    const extendedPlayer = player as ExtendedPlayer;
    if (!extendedPlayer.gardenStructures || !Array.isArray(extendedPlayer.gardenStructures)) {
      extendedPlayer.gardenStructures = [];
    }
    
    // Validate the structure type
    const validStructureTypes = ['greenhouse', 'shade_cloth', 'irrigation', 'windbreak', 'trellis'];
    if (!validStructureTypes.includes(structureType)) {
      return res.status(400).json({ message: 'Invalid structure type' });
    }
    
    // Create the new structure
    const newStructure = setupGardenStructure(
      structureType,
      position,
      size,
      player.skills?.crafting || 0
    ) as GardenStructureForSetup;
    
    // Add structure to player data
    extendedPlayer.gardenStructures.push(newStructure);
    
    // Apply effects to affected plots
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    // Define extended plot type
    interface ExtendedGardenSlot extends GardenSlot {
      position?: { x: number; y: number };
      protectedBy?: string[];
      weatherProtection?: number;
    }
    
    // Find plots that are covered by this structure
    const affectedPlots = player.garden.map((plot) => {
      const extendedPlot = plot as ExtendedGardenSlot;
      
      // Check if this plot is in the area of the structure
      // This is a simplified check - in a real implementation, this would be more complex
      if (
        extendedPlot.position && 
        extendedPlot.position.x >= position.x && 
        extendedPlot.position.x < position.x + size.width &&
        extendedPlot.position.y >= position.y && 
        extendedPlot.position.y < position.y + size.height
      ) {
        return {
          ...extendedPlot,
          protectedBy: [...(extendedPlot.protectedBy || []), newStructure.id],
          // Apply structure effects to the plot
          weatherProtection: (extendedPlot.weatherProtection || 0) + newStructure.protection
        } as ExtendedGardenSlot;
      }
      return extendedPlot;
    });
    
    // Update player's garden
    player.garden = affectedPlots;
    
    // Calculate experience 
    const experienceGained = 15;
    
    // Update player skills
    if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
    player.skills.gardening = (player.skills.gardening || 0) + experienceGained;
    player.skills.crafting = (player.skills.crafting || 0) + Math.floor(experienceGained / 2);
    
    // Save player state
    updatePlayer(player);
    
    return res.json({
      structure: newStructure,
      affectedPlots: affectedPlots.filter((plot: any) => plot.protectedBy?.includes(newStructure.id)),
      experience: experienceGained
    });
  } catch (error) {
    console.error('Error adding garden structure:', error);
    return res.status(500).json({ message: 'Failed to add garden structure' });
  }
});

/**
 * Apply fertilizer to a garden plot
 * POST /api/garden/fertilize
 */
router.post('/fertilize', (req, res) => {
  try {
    const { playerId, plotId, fertilizerId } = req.body;
    
    // Get game state for context
    const gameState = gameHandler.getState();
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // For compatibility with existing code
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    if (!player.inventory || !Array.isArray(player.inventory)) {
      player.inventory = [];
    }
    
    // Find the plot
    const plotIndex = player.garden.findIndex(p => p.id === Number(plotId));
    if (plotIndex === -1) {
      return res.status(404).json({ message: 'Plot not found' });
    }
    
    // Find the fertilizer in inventory
    const fertilizerIndex = player.inventory.findIndex((item: any) => item.id === fertilizerId && item.category === 'fertilizer');
    if (fertilizerIndex === -1 || player.inventory[fertilizerIndex].quantity <= 0) {
      return res.status(400).json({ message: 'Fertilizer not found in inventory' });
    }
    
    const plot = player.garden[plotIndex];
    const fertilizer = player.inventory[fertilizerIndex];
    
    // Apply fertilizer to the plot
    const fertilizeResult = fertilizePlot(
      plot,
      fertilizer as unknown as FertilizerItem,
      gameState.time.season,
      player.skills?.gardening || 0
    );
    
    // Update the plot
    player.garden[plotIndex] = fertilizeResult.updatedPlot;
    
    // Remove fertilizer from inventory
    if (fertilizer.quantity <= 1) {
      player.inventory.splice(fertilizerIndex, 1);
    } else {
      player.inventory[fertilizerIndex].quantity -= 1;
    }
    
    // Calculate experience
    const experienceGained = 4;
    if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
    player.skills.gardening = (player.skills.gardening || 0) + experienceGained;
    
    // Save player state
    updatePlayer(player);
    
    return res.json({
      plot: fertilizeResult.updatedPlot,
      effects: fertilizeResult.effects,
      experience: experienceGained,
      inventory: player.inventory
    });
  } catch (error) {
    console.error('Error applying fertilizer:', error);
    return res.status(500).json({ message: 'Failed to apply fertilizer' });
  }
});

/**
 * Analyze cross-breeding compatibility between plants
 * GET /api/garden/compatibility/:playerId/:plant1Id/:plant2Id
 */
router.get('/compatibility/:playerId/:plant1Id/:plant2Id', (req, res) => {
  try {
    const { playerId, plant1Id, plant2Id } = req.params;
    
    // Get game state for context
    const gameState = gameHandler.getState();
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // For compatibility with existing code
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    // Find both plants in the garden
    const plant1Plot = player.garden.find((plot: any) => plot.plant && plot.plant.id === plant1Id);
    const plant2Plot = player.garden.find((plot: any) => plot.plant && plot.plant.id === plant2Id);
    
    if (!plant1Plot || !plant1Plot.plant || !plant2Plot || !plant2Plot.plant) {
      return res.status(400).json({ message: 'One or both plants not found' });
    }
    
    // Check if plants are mature (only mature plants can be analyzed, but immaturity doesn't prevent analysis)
    const bothMature = plant1Plot.plant.mature && plant2Plot.plant.mature;
    
    // Combine player data for our functions
    const playerData = { 
      id: player.id, 
      gardeningSkill: player.skills?.gardening || 0,
      breedingExperience: player.skills?.breeding || 0 
    };
    
    // Convert plants to InteractivePlant format for compatibility analysis
    const plant1Interactive = convertPlantToInteractivePlant(plant1Plot.plant, plant1Plot.id);
    const plant2Interactive = convertPlantToInteractivePlant(plant2Plot.plant, plant2Plot.id);
    
    // Analyze cross-breeding compatibility
    const compatibility = analyzeCrossBreedingCompatibility(
      plant1Interactive,
      plant2Interactive,
      playerData,
      gameState.time.season,
      gameState.time.phaseName
    );
    
    // Add some experience for analyzing
    const experienceGained = 2;
    if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
    
    // Update player skills with proper type handling
    const extendedSkills = player.skills as ExtendedSkills;
    extendedSkills.breeding = (extendedSkills.breeding || 0) + experienceGained;
    
    // Save player state
    updatePlayer(player);
    
    return res.json({
      compatibility,
      bothMature,
      canCrossBreed: bothMature && compatibility.score > 0.3,
      potentialTraits: compatibility.potentialTraits,
      strongestTraits: compatibility.strongestTraits,
      experience: experienceGained
    });
  } catch (error) {
    console.error('Error analyzing cross-breeding compatibility:', error);
    return res.status(500).json({ message: 'Failed to analyze compatibility' });
  }
});

/**
 * Create hanbang skincare ingredient from harvested plant
 * POST /api/garden/create-hanbang
 */
router.post('/create-hanbang', (req, res) => {
  try {
    const { playerId, ingredientId, targetSkinType, targetSkinConcern, ritualQuality } = req.body;
    
    // Get game state for context
    const gameState = gameHandler.getState();
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // For compatibility with existing code
    if (!player.inventory || !Array.isArray(player.inventory)) {
      player.inventory = [];
    }
    
    // Find the ingredient in inventory
    const ingredientIndex = player.inventory.findIndex((item: any) => item.id === ingredientId && item.type === 'ingredient');
    if (ingredientIndex === -1 || player.inventory[ingredientIndex].quantity <= 0) {
      return res.status(400).json({ message: 'Ingredient not found in inventory' });
    }
    
    const ingredient = player.inventory[ingredientIndex];
    
    // Combine player data for our functions
    const playerData = { 
      id: player.id, 
      gardeningSkill: player.skills?.gardening || 0,
      alchemySkill: player.skills?.alchemy || 0,
      hanbangKnowledge: player.skills?.hanbang || 0
    };
    
    // Apply Hanbang processing to create skincare ingredient
    const ritualSuccess = ritualQuality > 0.4;
    
    // Type validation for skin type and concern
    const validSkinTypes = ['dry', 'oily', 'combination', 'sensitive', 'normal'];
    const validSkinConcerns = ['acne', 'aging', 'hyperpigmentation', 'dryness', 'sensitivity', 'redness', 'dullness'];
    
    // Ensure skin type and concern are valid, defaulting if not
    const validatedSkinType = validSkinTypes.includes(targetSkinType) 
      ? targetSkinType as HanbangIngredient['skinType']
      : 'normal' as HanbangIngredient['skinType'];
      
    const validatedSkinConcern = validSkinConcerns.includes(targetSkinConcern)
      ? targetSkinConcern as HanbangIngredient['skinConcern']
      : 'dullness' as HanbangIngredient['skinConcern'];
    
    // Create the hanbang ingredient with proper type handling
    const hanbangIngredient = createHanbangIngredient(
      ingredient as InventoryItem,
      playerData,
      validatedSkinType,
      validatedSkinConcern,
      ritualQuality,
      gameState.time.phaseName,
      gameState.time.season
    ) as HanbangIngredient;
    
    // Apply any hanbang-specific modifiers based on lunar phase and season
    const modifiedIngredient = applyHanbangIngredientModifiers(
      hanbangIngredient,
      gameState.time.phaseName,
      gameState.time.season
    ) as HanbangIngredient;
    
    // Add baseId to satisfy InventoryItem requirements
    modifiedIngredient.baseId = ingredient.baseId || `hanbang_${modifiedIngredient.id}`;
    
    // Remove original ingredient from inventory
    if (ingredient.quantity <= 1) {
      player.inventory.splice(ingredientIndex, 1);
    } else {
      player.inventory[ingredientIndex].quantity -= 1;
    }
    
    // Add new hanbang ingredient to inventory
    player.inventory.push(modifiedIngredient as unknown as InventoryItem);
    
    // Calculate experience based on success and quality
    let experienceGained = 5;
    if (ritualSuccess) {
      experienceGained += Math.floor(10 * ritualQuality);
    }
    
    // Update player skills
    if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
    
    // Update player skills with proper type handling
    const extendedSkills = player.skills as ExtendedSkills;
    extendedSkills.hanbang = (extendedSkills.hanbang || 0) + experienceGained;
    extendedSkills.alchemy = (extendedSkills.alchemy || 0) + Math.floor(experienceGained / 2);
    
    // Save player state
    updatePlayer(player);
    
    return res.json({
      hanbangIngredient: modifiedIngredient,
      success: ritualSuccess,
      effectivenessScore: modifiedIngredient.effectivenessScore,
      primaryEffect: modifiedIngredient.primaryEffect,
      secondaryEffects: modifiedIngredient.secondaryEffects,
      experience: experienceGained,
      inventory: player.inventory
    });
  } catch (error) {
    console.error('Error creating hanbang ingredient:', error);
    return res.status(500).json({ message: 'Failed to create hanbang ingredient' });
  }
});

/**
 * Upgrade a garden plot
 * POST /api/garden/upgrade-plot
 */
router.post('/upgrade-plot', (req, res) => {
  try {
    const { playerId, plotId, upgradeType } = req.body;
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // For compatibility with existing code
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    // Find the plot
    const plotIndex = player.garden.findIndex(p => p.id === Number(plotId));
    if (plotIndex === -1) {
      return res.status(404).json({ message: 'Plot not found' });
    }
    
    const plot = player.garden[plotIndex];
    
    // Validate upgrade type
    const validUpgradeTypes = ['soil', 'size', 'irrigation', 'specialization'];
    if (!validUpgradeTypes.includes(upgradeType)) {
      return res.status(400).json({ message: 'Invalid upgrade type' });
    }
    
    // Check if the plot has a plant (can't upgrade plots with plants)
    if (plot.plant) {
      return res.status(400).json({ message: 'Cannot upgrade a plot with a plant. Harvest it first.' });
    }
    
    // Combine player data for our functions
    const playerData = { 
      id: player.id, 
      gardeningSkill: player.skills?.gardening || 0,
      crafting: player.skills?.crafting || 0
    };
    
    // Define the proper GardenPlotUpgrade type
    type GardenPlotUpgrade = {
      level: number;
      type: string;
      value: number;
      appliedAt: number;
    };
    
    // Define an extended GardenSlot type with the upgrades property
    interface ExtendedGardenSlot extends GardenSlot {
      upgrades: GardenPlotUpgrade[];
      level: number;
    }
    
    // Create a deep copy of the plot with proper type handling
    // Using type assertion to bridge the gap between GardenSlot and ExtendedGardenSlot
    const extendedPlot = JSON.parse(JSON.stringify(plot)) as ExtendedGardenSlot;
    
    // Initialize upgrades array if it doesn't exist
    if (!extendedPlot.upgrades) {
      extendedPlot.upgrades = [];
    }
    
    // Initialize level if it doesn't exist
    if (typeof extendedPlot.level !== 'number') {
      extendedPlot.level = 0;
    }
    
    // Get current upgrade level for this type with proper type annotation
    const existingUpgrade = extendedPlot.upgrades.find((u: GardenPlotUpgrade) => u.type === upgradeType);
    const currentLevel = existingUpgrade ? existingUpgrade.level : 0;
    const newLevel = currentLevel + 1;
    
    // Apply upgrade based on type
    switch (upgradeType) {
      case 'soil':
        // Improve soil quality/fertility
        const soilBonus = 10 + (newLevel * 5);
        extendedPlot.fertility = Math.min(100, (extendedPlot.fertility || 0) + soilBonus);
        
        // Update or add upgrade record
        if (existingUpgrade) {
          existingUpgrade.level = newLevel;
          existingUpgrade.value = soilBonus;
          existingUpgrade.appliedAt = Date.now();
        } else {
          extendedPlot.upgrades.push({
            level: newLevel,
            type: upgradeType,
            value: soilBonus,
            appliedAt: Date.now()
          });
        }
        break;
      
      case 'size':
        // Increase plot size/capacity
        const sizeBonus = 5 + (newLevel * 3);
        
        if (existingUpgrade) {
          existingUpgrade.level = newLevel;
          existingUpgrade.value = sizeBonus;
          existingUpgrade.appliedAt = Date.now();
        } else {
          extendedPlot.upgrades.push({
            level: newLevel,
            type: upgradeType,
            value: sizeBonus,
            appliedAt: Date.now()
          });
        }
        break;
        
      case 'irrigation':
        // Improve water retention
        const irrigationBonus = 15 + (newLevel * 5);
        
        if (existingUpgrade) {
          existingUpgrade.level = newLevel;
          existingUpgrade.value = irrigationBonus;
          existingUpgrade.appliedAt = Date.now();
        } else {
          extendedPlot.upgrades.push({
            level: newLevel,
            type: upgradeType,
            value: irrigationBonus,
            appliedAt: Date.now()
          });
        }
        break;
        
      case 'specialization':
        // Add or enhance specialization for specific plant types
        const specializationBonus = 10 + (newLevel * 8);
        
        if (existingUpgrade) {
          existingUpgrade.level = newLevel;
          existingUpgrade.value = specializationBonus;
          existingUpgrade.appliedAt = Date.now();
        } else {
          extendedPlot.upgrades.push({
            level: newLevel,
            type: upgradeType,
            value: specializationBonus,
            appliedAt: Date.now()
          });
        }
        break;
    }
    
    // Update overall plot level
    extendedPlot.level = extendedPlot.level + 1;
    
    // Calculate upgrade cost (in real implementation, deduct resources)
    const upgradeCost = {
      coins: 100 + (extendedPlot.level * 50),
      materials: upgradeType === 'soil' ? 'compost' : upgradeType === 'irrigation' ? 'pipes' : 'lumber'
    };
    
    // Update player's garden with upgraded plot
    // Convert the extended plot to a standard GardenSlot with necessary properties
    const standardPlot: GardenSlot = {
      id: extendedPlot.id,
      plant: extendedPlot.plant,
      fertility: extendedPlot.fertility,
      moisture: extendedPlot.moisture,
      sunlight: extendedPlot.sunlight,
      isUnlocked: extendedPlot.isUnlocked
    };
    
    player.garden[plotIndex] = standardPlot;
    
    // Calculate experience
    const experienceGained = 5 + (extendedPlot.level * 3);
    if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
    player.skills.gardening = (player.skills.gardening || 0) + experienceGained;
    
    // Save player state
    updatePlayer(player);
    
    return res.json({
      plot: extendedPlot,
      cost: upgradeCost,
      upgradedStats: extendedPlot.upgrades,
      experience: experienceGained
    });
  } catch (error) {
    console.error('Error upgrading plot:', error);
    return res.status(500).json({ message: 'Failed to upgrade plot' });
  }
});

/**
 * Process a weather event affecting the garden
 * POST /api/garden/weather-event
 */
router.post('/weather-event', (req, res) => {
  try {
    const { playerId, weatherType, intensity, playerResponse } = req.body;
    
    // Get game state for context
    const gameState = gameHandler.getState();
    
    // Get player and validate request
    const player = getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // For compatibility with existing code
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    // Validate weather type
    const validWeatherTypes = ['rain', 'storm', 'drought', 'heat_wave', 'frost', 'fog', 'hail'];
    if (!validWeatherTypes.includes(weatherType)) {
      return res.status(400).json({ message: 'Invalid weather type' });
    }
    
    // Validate intensity
    const validatedIntensity = Math.max(0, Math.min(1, intensity || 0.5));
    
    // Combine player data for our functions
    const playerData = { 
      id: player.id, 
      gardeningSkill: player.skills?.gardening || 0,
      weatherProofing: player.skills?.weatherProofing || 0
    };
    
    // Process the weather event
    const weatherResult = processWeatherEvent(
      playerData,
      player.garden,
      weatherType,
      validatedIntensity,
      playerResponse || 'none',
      (player as any).gardenStructures || []
    );
    
    // Update garden with weather effects
    // Cast to GardenSlot[] to satisfy TypeScript
    player.garden = weatherResult.updatedGarden as GardenSlot[];
    
    // Calculate experience
    const experienceGained = Math.floor(5 + (validatedIntensity * 10));
    if (!player.skills) player.skills = {
      gardening: 0,
      brewing: 0,
      trading: 0,
      crafting: 0,
      herbalism: 0,
      astrology: 0
    };
    
    // Update player skills with proper type handling
    const extendedSkills = player.skills as ExtendedSkills;
    extendedSkills.weatherProofing = (extendedSkills.weatherProofing || 0) + experienceGained;
    
    // Save player state
    updatePlayer(player);
    
    return res.json({
      weatherType,
      intensity: validatedIntensity,
      affectedPlots: weatherResult.affectedPlots,
      damagedPlants: weatherResult.damagedPlants,
      improvedPlants: weatherResult.improvedPlants, // Some weather can improve certain plants
      garden: weatherResult.updatedGarden,
      experience: experienceGained,
      message: weatherResult.message
    });
  } catch (error) {
    console.error('Error processing weather event:', error);
    return res.status(500).json({ message: 'Failed to process weather event' });
  }
});

// Export default router

export default router;