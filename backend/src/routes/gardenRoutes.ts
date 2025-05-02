import express from 'express';
import { playPlantingMiniGame, plantNewInteractivePlant, playHarvestingMiniGame, harvestPlant, 
         playWateringMiniGame, applyWateringResults, playWeatherProtectionMiniGame, 
         applyWeatherProtection, crossBreedPlants, updatePlantGrowth,
         fertilizePlot, applySeasonalAttunement, upgradeGardenPlot, analyzeCrossBreedingCompatibility,
         applyHanbangIngredientModifiers, createHanbangIngredient, setupGardenStructure,
         getWeatherForecastForGarden, processWeatherEvent, InteractivePlant, FertilizerItem, 
         HanbangIngredient, GardenStructure } from '../interactiveGarden.js';
import { GameHandler } from '../gameHandler.js';
import { Player, GardenSlot, InventoryItem, Season, MoonPhase, Skills, Plant } from '../../shared/src/types.js';

const router = express.Router();
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
    
    // Update plot with new plant
    const updatedPlot = {
      ...plot,
      plant: newPlant
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
    
    // Simulate harvesting mini-game if not provided
    const harvestingResult = miniGameResult ? 
      gameResult : 
      playHarvestingMiniGame(
        playerData,
        plot.plant,
        { precision: 0.6, speed: 0.6, carefulness: 0.6 }
      );
    
    // Harvest the plant
    const harvestResult = harvestPlant(
      plot.plant,
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
      player.garden[plotIndex] = {
        ...plot,
        plant: harvestResult.remainingPlant
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
    
    // Simulate watering mini-game if not provided
    const wateringResult = miniGameResult ? 
      gameResult : 
      playWateringMiniGame(
        playerData,
        plot.plant,
        { distribution: 0.5, amount: 0.5, technique: 0.5 }
      );
    
    // Apply watering to the plant
    const updatedPlant = applyWateringResults(
      plot.plant,
      wateringResult,
      currentWeather || gameState.time.weatherFate
    );
    
    // Update moisture level in the plot
    const moistureIncrease = wateringResult.success ? 40 : 20;
    const updatedPlot = {
      ...plot,
      plant: updatedPlant,
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
    
    // Simulate protection mini-game if not provided
    const protectionResult = miniGameResult ? 
      gameResult : 
      playWeatherProtectionMiniGame(
        playerData,
        plot.plant,
        currentWeather || gameState.time.weatherFate,
        { reactionTime: 0.5, coverage: 0.5, reinforcement: 0.5 }
      );
    
    // Apply protection to the plant
    const updatedPlant = applyWeatherProtection(
      plot.plant,
      protectionResult,
      currentWeather || gameState.time.weatherFate
    );
    
    // Update plot with protected plant
    const updatedPlot = {
      ...plot,
      plant: updatedPlant
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
    
    // Perform cross-breeding
    // Convert Plant to InteractivePlant for compatibility
    const adaptPlant = (plant: Plant): InteractivePlant => {
      return {
        ...plant,
        varietyId: plant.id.split('_')[0],
        plotId: String(plant1Plot.id),
        currentStage: plant.mature ? 'mature' : 'growing',
        growthProgress: plant.growth,
        waterLevel: 50,
        nextActionTime: Date.now(),
        predictedQuality: 'common',
        predictedYield: 1,
        geneticTraits: [],
        growthModifiers: [],
        lastInteraction: Date.now(),
        createdAt: Date.now(),
        careHistory: []
      };
    };
    
    const result = crossBreedPlants(
      adaptPlant(plant1Plot.plant),
      adaptPlant(plant2Plot.plant),
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
    player.skills.meteorology = (player.skills.meteorology || 0) + experienceGained;
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
    player.skills.gardening = (player.skills.gardening || 0) + experienceGained;
    player.skills.rituals = (player.skills.rituals || 0) + Math.floor(experienceGained / 2);
    
    // Add seasonal attunement buff to player
    // Extend player with buffs property
    const extendedPlayer = player as Player & { buffs: any[] };
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
    
    // Ensure garden structures array exists
    const extendedPlayer = player as Player & { gardenStructures: GardenStructure[] };
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
    );
    
    // Add structure to player data
    extendedPlayer.gardenStructures.push(newStructure);
    
    // Apply effects to affected plots
    if (!player.garden || !Array.isArray(player.garden)) {
      player.garden = [];
    }
    
    // Find plots that are covered by this structure
    const affectedPlots = player.garden.map((plot: any) => {
      // Check if this plot is in the area of the structure
      // This is a simplified check - in a real implementation, this would be more complex
      if (
        plot.position && 
        plot.position.x >= position.x && 
        plot.position.x < position.x + size.width &&
        plot.position.y >= position.y && 
        plot.position.y < position.y + size.height
      ) {
        return {
          ...plot,
          protectedBy: [...(plot.protectedBy || []), newStructure.id],
          // Apply structure effects to the plot
          weatherProtection: (plot.weatherProtection || 0) + newStructure.protection
        };
      }
      return plot;
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
      fertilizer,
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
    
    // Analyze cross-breeding compatibility
    const compatibility = analyzeCrossBreedingCompatibility(
      plant1Plot.plant,
      plant2Plot.plant,
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
    player.skills.breeding = (player.skills.breeding || 0) + experienceGained;
    
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
    const hanbangIngredient = createHanbangIngredient(
      ingredient,
      playerData,
      targetSkinType,
      targetSkinConcern,
      ritualQuality,
      gameState.time.phaseName,
      gameState.time.season
    );
    
    // Apply any hanbang-specific modifiers based on lunar phase and season
    const modifiedIngredient = applyHanbangIngredientModifiers(
      hanbangIngredient,
      gameState.time.phaseName,
      gameState.time.season
    );
    
    // Remove original ingredient from inventory
    if (ingredient.quantity <= 1) {
      player.inventory.splice(ingredientIndex, 1);
    } else {
      player.inventory[ingredientIndex].quantity -= 1;
    }
    
    // Add new hanbang ingredient to inventory
    player.inventory.push(modifiedIngredient);
    
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
    player.skills.hanbang = (player.skills.hanbang || 0) + experienceGained;
    player.skills.alchemy = (player.skills.alchemy || 0) + Math.floor(experienceGained / 2);
    
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
    
    // Extension for GardenSlot with typed upgrade properties
    interface ExtendedGardenSlot extends GardenSlot {
      upgrades?: {
        level: number;
        type: string;
        value: number;
        appliedAt: number;
      }[];
      level?: number;
    }
    
    // Custom upgrade handling for type safety
    // Create a deep copy of the plot
    const extendedPlot = JSON.parse(JSON.stringify(plot)) as ExtendedGardenSlot;
    
    // Initialize upgrades array if it doesn't exist
    if (!extendedPlot.upgrades) {
      extendedPlot.upgrades = [];
    }
    
    // Get current upgrade level for this type
    const existingUpgrade = extendedPlot.upgrades.find(u => u.type === upgradeType);
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
      
      // Other upgrade cases handled similarly
    }
    
    // Update overall plot level
    extendedPlot.level = (extendedPlot.level || 0) + 1;
    
    // Calculate upgrade cost (in real implementation, deduct resources)
    const upgradeCost = {
      coins: 100 + ((extendedPlot.level || 1) * 50),
      materials: upgradeType === 'soil' ? 'compost' : upgradeType === 'irrigation' ? 'pipes' : 'lumber'
    };
    
    // Update player's garden with upgraded plot
    player.garden[plotIndex] = extendedPlot;
    
    // Calculate experience
    const experienceGained = 5 + ((extendedPlot.level || 1) * 3);
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
    player.garden = weatherResult.updatedGarden;
    
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
    player.skills.weatherProofing = (player.skills.weatherProofing || 0) + experienceGained;
    
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

export default router;