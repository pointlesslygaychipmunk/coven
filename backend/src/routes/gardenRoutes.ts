import express from 'express';
import { playPlantingMiniGame, plantNewInteractivePlant, playHarvestingMiniGame, harvestPlant, 
         playWateringMiniGame, applyWateringResults, playWeatherProtectionMiniGame, 
         applyWeatherProtection, crossBreedPlants, updatePlantGrowth } from '../interactiveGarden';
import { GameHandler } from '../gameHandler.js';

const router = express.Router();
const gameHandler = new GameHandler();

// Helper function to get player by ID
const getPlayerById = (id: string) => {
  const gameState = gameHandler.getState();
  return gameState.players.find(p => p.id === id);
};

// Helper function to update player
const updatePlayer = (player: any) => {
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
    const plotIndex = player.garden.findIndex((p: any) => p.id === plotId);
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
    if (!player.skills) player.skills = {};
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
    const plotIndex = player.garden.findIndex((p: any) => p.id === plotId);
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
      type: 'ingredient',
      category: plot.plant.category || 'herb',
      quantity: 1,
      quality: ingredient.quality,
      harvestedDuring: currentMoonPhase || gameState.time.phaseName,
      harvestedSeason: currentSeason || gameState.time.season,
      description: `A ${ingredient.quality} quality ${plot.plant.name} harvested under a ${currentMoonPhase || gameState.time.phaseName}.`
    }));
    
    // Add seeds to player inventory if any were obtained
    const seeds = [];
    if (harvestResult.seedsObtained > 0) {
      seeds.push({
        id: `seed_${plot.plant.id}_${Date.now()}`,
        baseId: `seed_${plot.plant.id.split('_')[0]}`,
        name: `${plot.plant.name} Seed`,
        type: 'seed',
        category: 'seed',
        quantity: harvestResult.seedsObtained,
        harvestedDuring: currentMoonPhase || gameState.time.phaseName,
        harvestedSeason: currentSeason || gameState.time.season,
        description: `Seeds harvested from a ${plot.plant.name}.`
      });
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
    if (!player.skills) player.skills = {};
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
    const plotIndex = player.garden.findIndex((p: any) => p.id === plotId);
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
    if (!player.skills) player.skills = {};
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
    if (!player.skills) player.skills = {};
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
    const plotIndex = player.garden.findIndex((p: any) => p.id === plotId);
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
    if (!player.skills) player.skills = {};
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
    const result = crossBreedPlants(
      plant1Plot.plant,
      plant2Plot.plant,
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
        type: 'seed',
        category: 'seed',
        quantity: seedCount,
        quality: result.rarityTier,
        harvestedDuring: currentMoonPhase || gameState.time.phaseName,
        harvestedSeason: currentSeason || gameState.time.season,
        description: `Seeds from a newly cross-bred variety created from ${plant1Plot.plant.name} and ${plant2Plot.plant.name}.`
      });
      
      // Add seeds to player inventory
      if (!player.inventory || !Array.isArray(player.inventory)) {
        player.inventory = [];
      }
      
      player.inventory = [...player.inventory, ...seeds];
      
      // Calculate experience
      const experienceGained = 15 + (result.rarityTier * 5);
      if (!player.skills) player.skills = {};
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
      if (!player.skills) player.skills = {};
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
      }
    ];
    
    return res.json(varieties);
  } catch (error) {
    console.error('Error getting plant varieties:', error);
    return res.status(500).json({ message: 'Failed to get plant varieties' });
  }
});

export default router;