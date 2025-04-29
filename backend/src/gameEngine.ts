// src/gameEngine.ts
// The central game engine managing game state and player actions

import {
    GameState, Player, GardenSlot, InventoryItem, Plant, MarketItem,
    WeatherFate, MoonPhase, Season, TownRequest, ItemType, ItemCategory,
    RitualQuest, Rumor, JournalEntry, GameTime, ActionLog, BasicRecipeInfo, Skills
} from "coven-shared"; // Use updated types from shared

import { processTurn } from "./turnEngine.js";
import { ITEMS, getItemData, getInitialMarket } from "./items.js"; // Added getItemData
import { generateTownRequests } from "./townRequests.js";
import { applyMarketEvents, ensureMarketData } from "./marketEvents.js"; // Added ensureMarketData
import { generateRumors, processRumorEffects } from "./rumorEngine.js";
import { RITUAL_QUESTS, progressRituals, checkQuestStepCompletion, claimRitualRewards } from "./questSystem.js"; // Import quest data and functions
import { SPECIALIZATIONS, getSpecializationBonus, getSkillGrowthBonus } from "./atelier.js"; // Import atelier data
import { RECIPES, findMatchingRecipe, brewPotion as performBrewing } from "./brewing.js"; // Import brewing functions
import { INGREDIENTS, getIngredientData, calculateHarvestQuality, SEEDS } from "./ingredients.js"; // Import ingredient data

const DEFAULT_ITEM_QUALITY = 70; // Default quality for items without one specified
const STARTING_GARDEN_SLOTS = 3; // How many slots are unlocked initially

// --- Helper Functions ---

// Utility function: Find an item in a player's inventory by item name (less safe if multiple stacks)
function findInventoryItemByName(player: Player, itemName: string): InventoryItem | undefined {
    return player.inventory.find((inv) => inv.name === itemName);
}

// Utility function: Find an item in a player's inventory by its specific inventory ID (Safer)
function findInventoryItemById(player: Player, inventoryItemId: string): InventoryItem | undefined {
    return player.inventory.find((inv) => inv.id === inventoryItemId);
}


// Add an item to player's inventory with proper quality tracking
function addItemToInventory(
    player: Player,
    itemToAdd: { id: string, name: string, type: ItemType, category: ItemCategory, value?: number, rarity?: Item['rarity'] },
    quantity: number,
    quality: number = DEFAULT_ITEM_QUALITY, // Use default
    currentPhase?: MoonPhase,
    currentSeason?: Season
): boolean {
    if (quantity <= 0) return false;

    const existingStack = player.inventory.find(
        (inv) => inv.name === itemToAdd.name && inv.quality === quality // Stricter stacking: only stack identical quality? Or average? Let's average.
        // Find *first* stack matching name to potentially merge with. Could be more complex (e.g. find stack closest to quality)
        // For now, let's average quality on merge:
        // (inv) => inv.name === itemToAdd.name
    );

    if (existingStack) {
        // Average quality when adding to existing stack
        const totalQuantity = existingStack.quantity + quantity;
        const currentTotalQuality = (existingStack.quality ?? DEFAULT_ITEM_QUALITY) * existingStack.quantity;
        const addedTotalQuality = quality * quantity;
        const newAverageQuality = Math.round((currentTotalQuality + addedTotalQuality) / totalQuantity);

        existingStack.quantity = totalQuantity;
        existingStack.quality = Math.min(100, Math.max(0, newAverageQuality)); // Ensure quality stays 0-100

        // Update provenance? Maybe keep the original harvest time? Or average? Simple approach: don't update provenance on merge.
    } else {
        // Add as a new stack
        const newInventoryItem: InventoryItem = {
            // Generate a unique ID for this specific stack in inventory
            // Combine item ID, timestamp, and maybe player ID for uniqueness
            id: `${itemToAdd.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: itemToAdd.name,
            type: itemToAdd.type,
            category: itemToAdd.category,
            quantity: quantity,
            quality: Math.min(100, Math.max(0, quality)), // Clamp quality
            value: itemToAdd.value, // Store base value if available
            rarity: itemToAdd.rarity,
            description: itemToAdd.description,
            imagePath: itemToAdd.imagePath,
            harvestedDuring: currentPhase,
            harvestedSeason: currentSeason,
            bookmarked: false,
        };
        player.inventory.push(newInventoryItem);
    }
    console.log(`[Inventory] Added ${quantity}x ${itemToAdd.name} (Q: ${quality}) to ${player.name}.`);
    return true;
}

// Remove item(s) from inventory BY SPECIFIC INVENTORY ID
function removeItemFromInventoryById(player: Player, inventoryItemId: string, quantity: number): boolean {
    const itemIndex = player.inventory.findIndex((inv) => inv.id === inventoryItemId);

    if (itemIndex === -1) {
        console.error(`[Inventory] Item with ID ${inventoryItemId} not found for player ${player.name}.`);
        return false; // Item not found
    }

    const invItem = player.inventory[itemIndex];

    if (invItem.quantity < quantity) {
        console.warn(`[Inventory] Not enough ${invItem.name} (ID: ${inventoryItemId}) to remove ${quantity}. Has ${invItem.quantity}.`);
        return false; // Not enough items in this specific stack
    }

    invItem.quantity -= quantity;
    console.log(`[Inventory] Removed ${quantity}x ${invItem.name} (ID: ${inventoryItemId}) from ${player.name}. Remaining: ${invItem.quantity}`);


    if (invItem.quantity <= 0) {
        // Remove item stack from inventory if quantity is zero or less
        player.inventory.splice(itemIndex, 1);
         console.log(`[Inventory] Stack ${invItem.name} (ID: ${inventoryItemId}) removed completely.`);
    }

    return true;
}

// Remove item(s) from inventory BY NAME (less safe if quality matters, use carefully)
// Primarily for costs where specific quality isn't crucial (like fulfilling requests)
function removeItemFromInventoryByName(player: Player, itemName: string, quantityToRemove: number): boolean {
    let quantityAccountedFor = 0;
    const itemsToRemoveIndices: number[] = [];

    // Find all stacks of the item
    for (let i = player.inventory.length - 1; i >= 0; i--) {
        if (player.inventory[i].name === itemName) {
            const itemStack = player.inventory[i];
            const canRemoveFromStack = Math.min(itemStack.quantity, quantityToRemove - quantityAccountedFor);

            if (canRemoveFromStack > 0) {
                itemStack.quantity -= canRemoveFromStack;
                quantityAccountedFor += canRemoveFromStack;
                console.log(`[Inventory] Removed ${canRemoveFromStack}x ${itemName} from stack ${itemStack.id}. Remaining in stack: ${itemStack.quantity}`);


                if (itemStack.quantity <= 0) {
                    itemsToRemoveIndices.push(i); // Mark stack for removal
                }
            }

            if (quantityAccountedFor >= quantityToRemove) {
                break; // We've removed enough
            }
        }
    }

    // Remove empty stacks
    itemsToRemoveIndices.sort((a, b) => b - a); // Sort descending to avoid index issues
    itemsToRemoveIndices.forEach(index => player.inventory.splice(index, 1));

    if (quantityAccountedFor < quantityToRemove) {
        console.warn(`[Inventory] Could not remove enough ${itemName}. Needed ${quantityToRemove}, removed ${quantityAccountedFor}.`);
        // TODO: Rollback? Or just partial removal? Current: Partial removal.
        return false; // Indicate not enough were removed
    }

    console.log(`[Inventory] Successfully removed ${quantityAccountedFor}x ${itemName} in total.`);
    return true;
}


// Main Game Engine class
export class GameEngine {
  state: GameState;
  actionLog: ActionLog[] = [];

  constructor() {
    console.log("[GameEngine] Initializing...");
    const initialPlayer: Player = this.createNewPlayer("player1", "Willow", "Essence"); // Example name/spec

    this.state = {
      players: [initialPlayer],
      market: getInitialMarket(),
      marketData: {
        inflation: 1.0,
        demand: {},
        supply: {},
        volatility: 0.1, // Base market volatility
        blackMarketAccessCost: 150, // Increased cost
        blackMarketUnlocked: false,
        tradingVolume: 0
      },
      townRequests: [],
      rituals: [], // Start with no active rituals, unlock them via events/discovery
      rumors: [],
      journal: [],
      events: [], // World events, festivals etc.
      currentPlayerIndex: 0,
      time: {
        year: 1,
        season: "Spring",
        phase: 0, // Index for New Moon
        phaseName: "New Moon",
        weatherFate: "normal",
        previousWeatherFate: undefined,
        dayCount: 1
      },
      version: "1.0.0", // Match package version or use semantic versioning
      knownRecipes: [], // Initialize as empty, player learns recipes
    };

    // Add starting known recipes based on vision/balance
    // Use recipe IDs from brewing.ts
    this.state.knownRecipes = [
        // { id: "recipe_cooling_tonic", name: "Cooling Tonic", category: "tonic"}, // Example using BasicRecipeInfo
        // { id: "recipe_moon_glow_serum", name: "Moon Glow Serum", category: "serum"},
    ];
     // Player starts knowing some recipes
     initialPlayer.knownRecipes = [
         "recipe_cooling_tonic", // Grant recipe IDs
         "recipe_moon_glow_serum"
     ];

    // Generate initial town requests and journal entry
    this.state.townRequests = generateTownRequests(this.state); // Pass full state if needed by generator
    this.initializeMarketData(); // Ensure demand/supply exists for initial items
    this.initializeRituals(); // Add initial available rituals

    this.addJournal(`Coven awakened. ${this.state.time.season} Year ${this.state.time.year}, a ${this.state.time.phaseName} begins.`, 'event', 5);
    this.addJournal(`The air feels ${this.state.time.weatherFate}.`, 'weather', 3); // Use weather category
    console.log("[GameEngine] Initialization complete.");
  }

  // Add initially available rituals
  initializeRituals(): void {
      const startingRituals = RITUAL_QUESTS.filter(q => q.initiallyAvailable); // Add 'initiallyAvailable' flag to RitualQuest type/data
      startingRituals.forEach(q => {
          const newQuest: RitualQuest = JSON.parse(JSON.stringify(q)); // Deep copy
          newQuest.unlocked = true;
          this.state.rituals.push(newQuest);
           this.addJournal(`A new ritual is available: "${newQuest.name}"`, 'ritual', 4);
      });
  }


    // Create a new player with starter items based on specialization
    createNewPlayer(id: string, name: string, specializationId: AtelierSpecialization): Player {
        const specialization = SPECIALIZATIONS.find(s => s.id === specializationId);
        if (!specialization) {
            console.error(`Invalid specialization ID: ${specializationId}. Defaulting.`);
            // Fallback to a default specialization or throw error
            specializationId = 'Essence'; // Default to Essence for safety
        }

        const newPlayer: Player = {
            id: id,
            name: name,
            gold: 100, // Slightly more starting gold
            mana: 20, // Start with some mana
            reputation: 5, // Start with minimal reputation
            atelierSpecialization: specializationId,
            atelierLevel: 1,
            skills: { gardening: 1, brewing: 1, trading: 1, crafting: 1, herbalism: 1, astrology: 1 },
            inventory: [],
            garden: [],
            knownRecipes: [], // Start empty, add based on progression/spec
            completedRituals: [],
            journalEntries: [], // Player-specific notes can go here later
            questsCompleted: 0,
            daysSurvived: 0,
            blackMarketAccess: false,
            lastActive: 0
        };

        // Create garden slots (e.g., 9 slots), only some unlocked initially
        const numSlots = 9;
        newPlayer.garden = Array.from({ length: numSlots }, (_, idx) => ({
            id: idx,
            plant: null,
            fertility: 70 + Math.floor(Math.random() * 20) - 10, // 60-80
            sunlight: 60 + Math.floor(Math.random() * 20) - 10, // 50-70 (example)
            moisture: 50 + Math.floor(Math.random() * 20) - 10, // 40-60
             // Unlock first few plots based on constant
            isUnlocked: idx < STARTING_GARDEN_SLOTS
        }));

        this.giveStarterItems(newPlayer, specializationId);
        console.log(`[GameEngine] Created player ${name} (ID: ${id}) with ${specializationId} specialization.`);
        return newPlayer;
    }

    // Give player starter items based on their specialization
    giveStarterItems(player: Player, specialization: AtelierSpecialization): void {
        console.log(`[GameEngine] Giving starter items for ${specialization} specialization to ${player.name}.`);

        // Common starter items
        const baseSeed1 = getItemData("seed_glimmerroot");
        const baseSeed2 = getItemData("seed_silverleaf");
        if (baseSeed1) addItemToInventory(player, baseSeed1, 2); // Add 2 Glimmerroot seeds
        if (baseSeed2) addItemToInventory(player, baseSeed2, 2); // Add 2 Silverleaf seeds

        // Specialization-specific bonuses
        switch (specialization) {
            case "Essence":
                const itemGinseng = getItemData("ing_ancient_ginseng");
                const itemLotus = getItemData("ing_sacred_lotus");
                if(itemGinseng) addItemToInventory(player, itemGinseng, 1); // 1 Ginseng
                if(itemLotus) addItemToInventory(player, itemLotus, 1); // 1 Lotus
                player.knownRecipes.push("recipe_radiant_moon_mask"); // Learn specific recipe
                break;
            case "Fermentation":
                 const itemSeedSweetshade = getItemData("seed_sweetshade"); // Changed to seed
                 const itemClayJar = getItemData("tool_clay_jar");
                if(itemSeedSweetshade) addItemToInventory(player, itemSeedSweetshade, 2);
                if(itemClayJar) addItemToInventory(player, itemClayJar, 1);
                 player.knownRecipes.push("recipe_ginseng_infusion"); // Learn relevant recipe
                break;
            case "Distillation":
                 const itemSeedEmberberry = getItemData("seed_emberberry");
                 const itemGlassVial = getItemData("tool_glass_vial");
                 if(itemSeedEmberberry) addItemToInventory(player, itemSeedEmberberry, 2);
                 if(itemGlassVial) addItemToInventory(player, itemGlassVial, 2); // Start with 2 vials
                 player.knownRecipes.push("recipe_summer_glow_oil");
                break;
            case "Infusion":
                const itemSeedMoonbud = getItemData("seed_moonbud"); // Changed starter seed
                 const itemMortar = getItemData("tool_mortar_pestle"); // Start with tool
                 if(itemSeedMoonbud) addItemToInventory(player, itemSeedMoonbud, 2);
                 if(itemMortar) addItemToInventory(player, itemMortar, 1);
                 player.knownRecipes.push("recipe_cooling_tonic");
                break;
        }
         // Add a basic tool for everyone
         const itemWateringCan = getItemData("tool_watering_can"); // Assuming this exists in items.ts
         // if(itemWateringCan) addItemToInventory(player, itemWateringCan, 1);
         // Temporary placeholder tool if watering can isn't defined:
          const itemBasicTool = getItemData("tool_mortar_pestle"); // Give everyone a mortar/pestle
          if(itemBasicTool && !player.inventory.some(i => i.id === itemBasicTool.id)) {
               addItemToInventory(player, itemBasicTool, 1);
          }

    }


    initializeMarketData(): void {
        // Set initial demand/supply for *all* defined ITEMS, not just initial market
        ITEMS.forEach(item => {
            // Only set for ingredients and potions initially? Or all items? Let's do common ones.
             if (item.type === 'ingredient' || item.type === 'potion' || item.type === 'seed') {
                this.state.marketData.demand[item.name] = BASE_DEMAND + Math.floor(Math.random() * 30) - 15; // 35-65
                this.state.marketData.supply[item.name] = BASE_SUPPLY + Math.floor(Math.random() * 30) - 15; // 35-65
            }
        });
         // Ensure items actually *in* the market have data too
        this.state.market.forEach(marketItem => {
             ensureMarketData(this.state, marketItem.name);
        });

        console.log("[GameEngine] Initialized market demand/supply data.");
    }

  // Add a comprehensive journal entry
  addJournal(text: string, category: string = 'event', importance: number = 3): void {
    const entry: JournalEntry = {
      id: `j-${this.state.time.dayCount}-${this.state.journal.length}`, // Unique ID
      turn: this.state.time.dayCount, // Use dayCount as turn number
      date: `${this.state.time.phaseName}, ${this.state.time.season} Y${this.state.time.year}`,
      text: text,
      category: category, // TODO: Validate category against allowed types?
      importance: Math.max(1, Math.min(5, importance)), // Clamp importance 1-5
      readByPlayer: false,
      // title: Optional based on context
      // bookmarked: false // default
    };

    this.state.journal.push(entry);
     // Keep journal size manageable
     if (this.state.journal.length > 150) {
         this.state.journal.shift(); // Remove oldest entry
     }
  }

  // Log a player action
  logAction(playerId: string, action: ActionLog['action'], parameters: any, result: boolean | string): void { // Allow string result for more info
    this.actionLog.push({
      playerId,
      action,
      timestamp: Date.now(),
      turn: this.state.time.dayCount,
      parameters,
      result // Store success/fail or a message
    });
    // Limit log size
    if (this.actionLog.length > 500) {
      this.actionLog = this.actionLog.slice(-250);
    }
  }

    // --- Player Actions ---

    plantSeed(playerId: string, slotId: number, seedItemId: string): boolean {
        const player = this.state.players.find(p => p.id === playerId);
        const slot = player?.garden.find(s => s.id === slotId);
        const seedInvItem = player?.inventory.find(i => i.id === seedItemId && i.type === 'seed'); // Find by inventory ID

        if (!player || !slot || !seedInvItem || slot.plant !== null) {
            console.warn(`[Action] Plant failed: P:${playerId}, Slot:${slotId}, SeedInvID:${seedItemId}. Player/Slot/Seed invalid or slot occupied.`);
            this.addJournal("Cannot plant there.", 'garden', 1);
            this.logAction(playerId, 'plant', { slotId, seedItemId }, "Invalid action");
            return false;
        }

        // Find the base seed data from items.ts using the inventory item's name or base ID
         const baseSeedData = getItemData(seedItemId.split('-')[0]); // Extract base ID if needed, or use name lookup
         const plantSourceId = (baseSeedData as any)?.plantSource; // Assuming seed data has plantSource ID
         const plantData = plantSourceId ? getIngredientById(plantSourceId) : undefined;

        if (!plantData) {
             console.error(`[Action] Plant failed: Cannot find plant data for seed ${seedInvItem.name}`);
             this.addJournal(`Cannot determine what this seed grows into!`, 'error', 3);
             this.logAction(playerId, 'plant', { slotId, seedItemId }, "Plant data missing");
             return false;
        }


        // Use seed quality to influence initial health
        const seedQuality = seedInvItem.quality ?? DEFAULT_ITEM_QUALITY;
        const initialHealth = 50 + Math.round((seedQuality - 50) / 2); // Quality 50 = 50 health, Quality 100 = 75 health

        const newPlant: Plant = {
            id: `plant-${slotId}-${Date.now()}`, // Unique instance ID
            name: plantData.name,
            category: plantData.category,
            growth: 0,
            maxGrowth: plantData.growthTime,
            watered: false,
            health: Math.max(10, Math.min(100, initialHealth)), // Ensure health is 10-100
            age: 0,
            mature: false,
            moonBlessed: this.state.time.phaseName === "Full Moon" || this.state.time.phaseName === "New Moon", // Blessed on New/Full moon planting
            seasonalModifier: this.calculateSeasonalModifier(plantData, this.state.time.season), // Use helper
            deathChance: 0,
            // imagePath: plantData.imagePath, // Optional
            // mutations: [], // Start with no mutations
            // qualityModifier: 1.0 // Start with base quality modifier
        };

        slot.plant = newPlant;
        const removed = removeItemFromInventoryById(player, seedItemId, 1); // Remove the specific seed stack item

        if (!removed) {
             console.error(`[Action] Plant failed: Could not remove seed ${seedItemId} from inventory after placement.`);
             slot.plant = null; // Rollback plant placement
             this.addJournal("Error planting seed - inventory issue.", 'error', 4);
             this.logAction(playerId, 'plant', { slotId, seedItemId }, "Inventory removal failed");
             return false;
        }

        // Grant XP
        this.addSkillXp(player, 'gardening', 0.3);

        let journalText = `Planted a ${plantData.name} seed (Q:${seedQuality}%) in plot ${slotId + 1}.`;
        if (newPlant.moonBlessed) journalText += " The moon's phase blesses this planting!";
        this.addJournal(journalText, 'garden', 3);

        // Quest Check
        checkQuestStepCompletion(this.state, player, 'plant', { seedName: plantData.name, slotId, quality: seedQuality, season: this.state.time.season });

        this.logAction(playerId, 'plant', { slotId, seedName: plantData.name }, true);
        return true;
    }

     // Calculate seasonal modifier using Ingredient data
     calculateSeasonalModifier(ingredientData: Ingredient, season: Season): number {
        if (season === ingredientData.bestSeason) return 1.5;
        if (season === ingredientData.worstSeason) return 0.5;
        return 1.0; // Neutral season
    }


    waterPlants(playerId: string, success: boolean): boolean { // Keep success flag for potential future mechanics
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return false;

        let wateredCount = 0;
        player.garden.forEach(slot => {
            if (slot.plant && !slot.plant.mature) { // Only water non-mature plants
                slot.plant.watered = true; // Mark as watered for the *next* turn's calculation
                // Moisture update now happens naturally in turnEngine based on this flag + weather
                wateredCount++;
            }
        });

        if (wateredCount > 0) {
            this.addSkillXp(player, 'gardening', 0.1 * wateredCount); // XP per plant potentially watered
            this.addJournal(`You tended to the watering needs of your garden (${wateredCount} plants).`, 'garden', 2);
            this.logAction(playerId, 'water', { success: true, count: wateredCount }, true);
            return true;
        } else {
             this.addJournal(`No plants needed watering at the moment.`, 'garden', 1);
             this.logAction(playerId, 'water', { success: false, count: 0 }, "No plants to water");
             return false;
        }
    }

   harvestPlant(playerId: string, slotId: number): boolean {
    const player = this.state.players.find(p => p.id === playerId);
    const slot = player?.garden.find(s => s.id === slotId);

    if (!player || !slot || !slot.plant || !slot.plant.mature) {
        console.warn(`[Action] Harvest failed: P:${playerId}, Slot:${slotId}. Invalid slot or plant not mature.`);
        this.addJournal("Cannot harvest that yet.", 'garden', 1);
        this.logAction(playerId, 'harvest', { slotId }, "Invalid action");
        return false;
    }

    const plant = slot.plant;
    const plantData = getIngredientById(plant.name); // Use name to find base data
    if (!plantData) {
        console.error(`[Action] Harvest failed: Cannot find ingredient data for ${plant.name}`);
         this.addJournal(`Error harvesting - unknown plant data!`, 'error', 4);
         this.logAction(playerId, 'harvest', { slotId }, "Plant data missing");
        return false;
    }

    // Calculate harvest quality
    const harvestInfo = calculateHarvestQuality(
        plantData,
        plant.health,
        plant.age,
        this.state.time.phaseName,
        this.state.time.season
    );
    const harvestQuality = harvestInfo.quality;

    // Get base item data to add to inventory
    const itemBaseData = getItemData(plantData.id); // Find the item definition by ID
    if (!itemBaseData) {
         console.error(`[Action] Harvest failed: Cannot find base item data for ID ${plantData.id}`);
         this.addJournal(`Error harvesting - item definition missing!`, 'error', 4);
         this.logAction(playerId, 'harvest', { slotId }, "Item definition missing");
         return false;
    }

     // Base yield is 1
     let yieldAmount = 1;

     // Check for yield bonuses (e.g., from specialization)
     const specBonus = getSpecializationBonus(player.atelierSpecialization, 'harvest', itemBaseData.type, itemBaseData.category);
      // Apply quality bonus from spec multiplier (affects quality calculation instead of quantity?)
      // Let's assume spec bonus *increases* quality slightly here instead of yield.
      const finalHarvestQuality = Math.min(100, Math.round(harvestQuality * specBonus.bonusMultiplier));

     // Add harvested item to inventory
     const added = addItemToInventory(
         player,
         itemBaseData, // Pass the full base item data
         yieldAmount,
         finalHarvestQuality,
         this.state.time.phaseName,
         this.state.time.season
     );

    if (!added) {
         // This shouldn't happen if itemBaseData is valid
         console.error(`[Action] Harvest failed: Error adding item ${itemBaseData.name} to inventory.`);
         this.addJournal(`Error adding harvested ${itemBaseData.name} to inventory.`, 'error', 4);
         this.logAction(playerId, 'harvest', { slotId }, "Inventory add failed");
         return false;
    }

     // Grant XP
     this.addSkillXp(player, 'gardening', 0.6);
     this.addSkillXp(player, 'herbalism', 0.2); // Also gain herbalism XP

     // Journal entry
     let qualityText = "average";
     if (finalHarvestQuality >= 90) qualityText = "exceptional";
     else if (finalHarvestQuality >= 75) qualityText = "excellent";
     else if (finalHarvestQuality >= 60) qualityText = "good";
     else if (finalHarvestQuality < 40) qualityText = "poor";

     this.addJournal(`Harvested ${yieldAmount} ${plant.name} of ${qualityText} quality (${finalHarvestQuality}%) from plot ${slotId + 1}.`, 'garden', 3);
     harvestInfo.bonusFactors.forEach(factor => this.addJournal(` - ${factor}`, 'garden', 1)); // Log quality factors


     // Clear the plot
     slot.plant = null;
     slot.fertility = Math.max(30, slot.fertility - (5 + Math.floor(plantData.growthTime / 2))); // Fertility drop based on growth time

     // Quest Check
     checkQuestStepCompletion(this.state, player, 'harvest', {
         plantName: plant.name,
         quality: finalHarvestQuality,
         quantity: yieldAmount,
         moonPhase: this.state.time.phaseName,
         season: this.state.time.season
     });

     this.logAction(playerId, 'harvest', { slotId, plantName: plant.name, quality: finalHarvestQuality, yield: yieldAmount }, true);
     return true;
 }


   // Player action: brew a potion from ingredients
   brewPotion(playerId: string, ingredientInvItemIds: string[]): boolean { // Expect Inventory Item IDs
       const player = this.state.players.find(p => p.id === playerId);
       if (!player || ingredientInvItemIds.length !== 2) {
           this.logAction(playerId, 'brew', { ingredientInvItemIds }, "Invalid parameters");
           return false;
       }

       const invItem1 = findInventoryItemById(player, ingredientInvItemIds[0]);
       const invItem2 = findInventoryItemById(player, ingredientInvItemIds[1]);

       if (!invItem1 || !invItem2) {
           console.warn(`[Action] Brew failed: One or more ingredients not found in inventory. IDs: ${ingredientInvItemIds.join(', ')}`);
           this.addJournal("Missing ingredients for brewing.", 'brewing', 1);
           this.logAction(playerId, 'brew', { ingredientInvItemIds }, "Missing ingredients");
           return false;
       }

       // Ensure we have enough quantity (simple check for 1 of each specific stack)
       if (invItem1.quantity < 1 || invItem2.quantity < 1) {
            console.warn(`[Action] Brew failed: Not enough quantity for ingredient stacks. IDs: ${ingredientInvItemIds.join(', ')}`);
            this.addJournal("Not enough of the selected ingredients.", 'brewing', 1);
           this.logAction(playerId, 'brew', { ingredientInvItemIds }, "Insufficient quantity");
            return false;
       }


       // Find a matching known recipe using ingredient *names* (as recipe definitions use names)
       const recipe = findMatchingRecipe(player, [invItem1.name, invItem2.name]);

       // Get average quality of the *specific* stacks used
       const ingredientQualities = [invItem1.quality ?? DEFAULT_ITEM_QUALITY, invItem2.quality ?? DEFAULT_ITEM_QUALITY];

       let brewOutcome: { success: boolean; resultItemName?: string; quality: number; bonusFactor?: string };
       let recipeUsed: Recipe | undefined = recipe;

       if (recipe) {
           // Attempt brew using the known recipe
           brewOutcome = performBrewing(recipe, ingredientQualities, player, this.state.time.phaseName);
       } else {
           // Experimentation - Try to discover a recipe
           const discoveredRecipe = discoverRecipe([invItem1, invItem2]);
           if (discoveredRecipe) {
               // Found a new recipe! Lower success chance for first time?
               this.addJournal(`Discovery! You've figured out how to brew ${discoveredRecipe.name}!`, 'discovery', 5);
               player.knownRecipes.push(discoveredRecipe.id); // Learn the recipe ID
               recipeUsed = discoveredRecipe; // Use the discovered recipe for the brew attempt
               // Rerun brewing calculation with the discovered recipe (maybe slight penalty for first time?)
               brewOutcome = performBrewing(discoveredRecipe, ingredientQualities, player, this.state.time.phaseName);
                // Add XP for discovery?
                this.addSkillXp(player, 'brewing', 1.0); // Bonus XP for discovery
           } else {
               // Failed experimentation
               brewOutcome = { success: false, quality: 0, resultItemName: "Ruined Brewage" };
           }
       }

       // Consume ingredients regardless of success/failure, using the specific inventory IDs
       const removed1 = removeItemFromInventoryById(player, invItem1.id, 1);
       const removed2 = removeItemFromInventoryById(player, invItem2.id, 1);
        if (!removed1 || !removed2) {
             console.error(`[Action] Brew Error: Failed to remove consumed ingredients ${invItem1.id} or ${invItem2.id}`);
              // This indicates a major issue, potentially log/halt?
             this.addJournal("Critical error consuming ingredients during brewing!", 'error', 5);
              // Don't grant product even if brewOutcome was successful
              this.logAction(playerId, 'brew', { ingredientInvItemIds }, "Ingredient consumption failed");
              return false; // Prevent inconsistent state
        }


       if (brewOutcome.success && brewOutcome.resultItemName) {
           // Find the base item data for the result
           const resultItemData = getItemData(brewOutcome.resultItemName); // Use ID lookup
           if (resultItemData) {
               addItemToInventory(
                   player,
                   resultItemData,
                   1, // Assuming recipes produce 1 for now, handle quantity later
                   brewOutcome.quality,
                   this.state.time.phaseName,
                   this.state.time.season
               );

               // Grant XP for successful brew
               this.addSkillXp(player, 'brewing', recipeUsed ? (0.5 + recipeUsed.difficulty * 0.1) : 0.3); // XP based on recipe difficulty

               let successMsg = `Successfully brewed ${resultItemData.name} (Q: ${brewOutcome.quality}%)`;
               if (brewOutcome.bonusFactor) successMsg += `. ${brewOutcome.bonusFactor}`;
               this.addJournal(successMsg, 'brewing', 3);

               // Quest Check
               checkQuestStepCompletion(this.state, player, 'brew', {
                    potionName: resultItemData.name,
                    potionId: resultItemData.id,
                    quality: brewOutcome.quality,
                    moonPhase: this.state.time.phaseName,
                    recipeId: recipeUsed?.id
                });

               this.logAction(playerId, 'brew', { ingredientInvItemIds, recipe: recipeUsed?.id, result: resultItemData.name }, true);
               return true;

           } else {
               console.error(`[Action] Brew Success Error: Result item '${brewOutcome.resultItemName}' not found in item database.`);
               this.addJournal(`Brewing succeeded, but the resulting potion (${brewOutcome.resultItemName}) is unknown!`, 'error', 4);
               this.logAction(playerId, 'brew', { ingredientInvItemIds, recipe: recipeUsed?.id }, "Result item definition missing");
               return false;
           }

       } else {
           // Handle failed brew (add 'Ruined Brewage' or similar if defined)
           const ruinedItemData = getItemData("misc_ruined_brewage");
           if (ruinedItemData) {
               addItemToInventory(player, ruinedItemData, 1, 0);
           }
           this.addJournal(`Brewing attempt failed. The mixture resulted in Ruined Brewage.`, 'brewing', 1);
            this.addSkillXp(player, 'brewing', 0.1); // Small XP for failure
            this.logAction(playerId, 'brew', { ingredientInvItemIds, recipe: recipeUsed?.id }, "Brewing failed");
           return false;
       }
   }


  fulfillRequest(playerId: string, requestId: string): boolean {
    const player = this.state.players.find(p => p.id === playerId);
    const reqIndex = this.state.townRequests.findIndex(req => req.id === requestId);

    if (!player || reqIndex === -1) {
        this.logAction(playerId, 'fulfill', { requestId }, "Invalid player or request ID");
        return false;
    }
    const request = this.state.townRequests[reqIndex];

    // Use the NAME-based removal helper, as request doesn't specify quality/stack ID
    const removed = removeItemFromInventoryByName(player, request.item, request.quantity);

    if (!removed) {
      console.warn(`[Action] Fulfill failed: Not enough ${request.item} for request ${requestId}.`);
       this.addJournal(`You don't have enough ${request.item} to fulfill ${request.requester}'s request.`, 'quest', 1);
       this.logAction(playerId, 'fulfill', { requestId }, "Insufficient items");
      return false;
    }

    // Grant rewards
    player.gold += request.rewardGold;
    player.reputation = Math.min(100, player.reputation + request.rewardInfluence); // Cap reputation?

    // Adjust market data (fulfilling reduces demand)
     ensureMarketData(this.state, request.item);
     this.state.marketData.demand[request.item] = Math.max(10, this.state.marketData.demand[request.item] - 10 * request.quantity); // Reduce demand more based on quantity

    // Remove fulfilled request
    this.state.townRequests.splice(reqIndex, 1);

    // Grant XP
    this.addSkillXp(player, 'trading', 0.4 + request.difficulty * 0.1); // XP based on difficulty

    // Update quest count
    player.questsCompleted = (player.questsCompleted || 0) + 1;

    this.addJournal(`Fulfilled ${request.requester}'s request for ${request.quantity} ${request.item}.`, 'quest', 4);
    this.addJournal(`Received ${request.rewardGold} gold and +${request.rewardInfluence} reputation.`, 'reward', 3);


    // Quest Check (if fulfilling requests is part of a ritual)
    checkQuestStepCompletion(this.state, player, 'fulfillRequest', {
        requestId: request.id,
        itemName: request.item,
        quantity: request.quantity,
        requester: request.requester
    });

    this.logAction(playerId, 'fulfill', { requestId }, true);
    return true;
  }

    buyItem(playerId: string, itemId: string): boolean { // itemId is the MARKET item ID
        const player = this.state.players.find(p => p.id === playerId);
        const marketItemIndex = this.state.market.findIndex(item => item.id === itemId);

        if (!player || marketItemIndex === -1) {
            this.logAction(playerId, 'buy', { itemId }, "Invalid player or item ID");
            return false;
        }

        const marketItem = this.state.market[marketItemIndex];
        const price = marketItem.price; // Use current market price

        if (player.gold < price) {
            this.addJournal(`Not enough gold to buy ${marketItem.name} (${price} G).`, 'market', 1);
            this.logAction(playerId, 'buy', { itemId }, "Insufficient gold");
            return false;
        }

        // Find base item data for adding to inventory
        const itemBaseData = getItemData(marketItem.id);
        if (!itemBaseData) {
            console.error(`[Action] Buy Error: Base item data not found for market item ID ${marketItem.id}`);
            this.addJournal(`Error purchasing ${marketItem.name} - item definition missing!`, 'error', 4);
            this.logAction(playerId, 'buy', { itemId }, "Base item data missing");
            return false;
        }


        // Deduct gold and add item
        player.gold -= price;
        // Market items usually have standard quality unless specified otherwise
        addItemToInventory(player, itemBaseData, 1, DEFAULT_ITEM_QUALITY);

        // Grant XP
        this.addSkillXp(player, 'trading', 0.2);

        this.addJournal(`Purchased 1 ${marketItem.name} for ${price} gold.`, 'market', 2);

        // Influence market: buying increases demand, decreases supply
        ensureMarketData(this.state, marketItem.name);
        this.state.marketData.demand[marketItem.name] = Math.min(100, this.state.marketData.demand[marketItem.name] + 8); // Buying increases demand notably
        this.state.marketData.supply[marketItem.name] = Math.max(5, this.state.marketData.supply[marketItem.name] - 5);   // Reduce supply slightly

        // Optional: Immediate small price bump due to demand increase
        marketItem.price = Math.round(marketItem.price * 1.02); // +2%
        marketItem.lastPriceChange = this.state.time.dayCount;

        // Track trading volume
        this.state.marketData.tradingVolume += price;

        // Quest Check
         checkQuestStepCompletion(this.state, player, 'buyItem', {
             itemId: itemBaseData.id,
             itemName: itemBaseData.name,
             price: price,
             category: itemBaseData.category
         });


        this.logAction(playerId, 'buy', { itemId, name: marketItem.name, price }, true);
        return true;
    }

  sellItem(playerId: string, inventoryItemId: string): boolean { // Expect specific inventory item ID
    const player = this.state.players.find(p => p.id === playerId);
    const invItem = findInventoryItemById(player, inventoryItemId); // Find the specific stack

    if (!player || !invItem || invItem.quantity < 1) {
        this.addJournal("You don't have that specific item to sell.", 'market', 1);
        this.logAction(playerId, 'sell', { inventoryItemId }, "Item not found or insufficient qty");
        return false;
    }

    // Find the corresponding market item entry to get the current base price
    const marketItem = this.state.market.find(item => item.name === invItem.name); // Match by name to find market price
    if (!marketItem) {
      // Item might not be sellable currently, or maybe allow selling at a very low base price?
       // For now, let's assume if it's not in the market list, it can't be sold easily.
       this.addJournal(`${invItem.name} cannot be sold at the market right now.`, 'market', 1);
       this.logAction(playerId, 'sell', { inventoryItemId }, "Item not currently sellable in market");
       return false;
    }

    const baseSellPrice = marketItem.price; // Use current market price as base

    // Quality affects sell price significantly
    // Example: 0% quality = 50% price, 100% quality = 120% price
    const qualityMultiplier = 0.5 + ((invItem.quality ?? DEFAULT_ITEM_QUALITY) / 100) * 0.7;
    const sellPrice = Math.max(1, Math.round(baseSellPrice * qualityMultiplier)); // Ensure sell price is at least 1

    // Remove the specific item stack instance and add gold
    const removed = removeItemFromInventoryById(player, inventoryItemId, 1); // Remove 1 from this specific stack
     if (!removed) {
         // This shouldn't happen based on earlier check, but good to be safe
          console.error(`[Action] Sell Error: Failed to remove item ${inventoryItemId} after calculating price.`);
         this.addJournal("Error selling item - inventory issue.", 'error', 4);
         this.logAction(playerId, 'sell', { inventoryItemId }, "Inventory removal failed");
          return false;
     }

    player.gold += sellPrice;

    // Grant XP
    this.addSkillXp(player, 'trading', 0.3 + (sellPrice / 100)); // More XP for valuable sales

    this.addJournal(`Sold 1 ${invItem.name} (Q: ${invItem.quality ?? 'N/A'}%) for ${sellPrice} gold.`, 'market', 2);

    // Influence market: selling increases supply, decreases demand
    ensureMarketData(this.state, marketItem.name);
    this.state.marketData.supply[marketItem.name] = Math.min(95, this.state.marketData.supply[marketItem.name] + 8); // Increase supply notably
    this.state.marketData.demand[marketItem.name] = Math.max(5, this.state.marketData.demand[marketItem.name] - 4); // Decrease demand slightly

    // Optional: Immediate small price drop due to supply increase
    marketItem.price = Math.max(1, Math.round(marketItem.price * 0.98)); // -2%
     marketItem.lastPriceChange = this.state.time.dayCount;

    // Track trading volume
    this.state.marketData.tradingVolume += sellPrice;

     // Quest Check
     checkQuestStepCompletion(this.state, player, 'sellItem', {
         itemId: invItem.id, // The base item ID
         itemName: invItem.name,
         price: sellPrice,
         quality: invItem.quality,
         category: invItem.category
     });


    this.logAction(playerId, 'sell', { inventoryItemId, name: invItem.name, price: sellPrice }, true);
    return true;
  }

    // Helper to add skill XP and handle level ups (can be expanded)
    addSkillXp(player: Player, skill: keyof Skills, amount: number): void {
        if (!player.skills[skill]) player.skills[skill] = 0; // Initialize if missing

        const currentLevel = Math.floor(player.skills[skill]);
        player.skills[skill] += amount;
        const newLevel = Math.floor(player.skills[skill]);

        // Basic level up check (can be made more complex with XP thresholds)
        if (newLevel > currentLevel) {
            // Handle level up - for now, just log it
            this.addJournal(`${player.name}'s ${skill} skill increased to level ${newLevel}!`, 'skill', 4);
            // TODO: Apply level up bonuses if any (e.g., unlock recipes, increase efficiency)
             if (skill === 'brewing' && newLevel >= 5) {
                // Example: Unlock a new recipe category or specific recipe
             }
        }
    }

    // --- Turn Management & World Simulation ---

  endTurn(playerId: string): void {
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    if (playerIndex !== this.state.currentPlayerIndex) {
      console.warn(`[Turn] Player ${playerId} tried to end turn, but it's player ${this.state.players[this.state.currentPlayerIndex]?.id}'s turn.`);
      return; // Not this player's turn
    }

    const currentPlayer = this.state.players[playerIndex];
    currentPlayer.lastActive = this.state.time.dayCount; // Record last activity

    // Move to next player or advance phase
    const nextPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    this.state.currentPlayerIndex = nextPlayerIndex;

    if (nextPlayerIndex === 0) {
      // If we wrapped around to the first player, advance the world phase
      this.advancePhase();
    } else {
        const nextPlayer = this.state.players[nextPlayerIndex];
         this.addJournal(`It is now ${nextPlayer.name}'s turn.`, 'event', 1);
    }

    this.logAction(playerId, 'endTurn', {}, true);
  }

  // Advances the game world by one phase (moon phase)
  advancePhase(): void {
    console.log(`[Engine] Advancing phase from Day ${this.state.time.dayCount}...`);
    // 1. Process Time, Weather, Garden Growth (via turnEngine)
    this.state = processTurn(this.state); // This updates time, weather, plants

    // 2. Generate New Town Requests (less frequent maybe?)
    if (Math.random() < 0.4) { // ~40% chance each phase for new requests
        const newRequests = generateTownRequests(this.state);
        if (newRequests.length > 0) {
            // Limit total active requests?
            const maxRequests = 5;
            const currentRequestCount = this.state.townRequests.length;
            const slotsAvailable = maxRequests - currentRequestCount;
            if (slotsAvailable > 0) {
                this.state.townRequests.push(...newRequests.slice(0, slotsAvailable));
                this.addJournal(`New town requests posted.`, 'quest', 3);
            }
        }
    }
     // TODO: Expire old requests?

    // 3. Generate & Process Rumors
    const newRumors = generateRumors(this.state);
    this.state.rumors.push(...newRumors);
    processRumorEffects(this.state); // Update spread/duration of existing rumors

    // 4. Apply Market Events (after rumors, season, moon phase updates from processTurn)
    applyMarketEvents(this.state); // Adjust prices based on all factors

    // 5. Progress Rituals (check passive conditions)
    progressRituals(this.state); // Check if any world state changes progress rituals

    // 6. World Events (placeholder for future expansion)
    // checkWorldEvents(this.state);

    console.log(`[Engine] Phase advanced to Day ${this.state.time.dayCount}: ${this.state.time.phaseName}, ${this.state.time.season} Y${this.state.time.year}, Weather: ${this.state.time.weatherFate}`);
  }


  // Get the current game state
  getState(): GameState {
    // Return a deep copy to prevent direct modification? For now, return ref.
    return this.state;
  }

  // Save game state
  saveGame(): string {
    try {
      this.state.time.lastSaved = Date.now(); // Record save time
      const saveData = JSON.stringify(this.state);
      console.log(`[Engine] Game saved successfully at ${new Date(this.state.time.lastSaved).toLocaleTimeString()}.`);
      // In a real app: fs.writeFileSync('savegame.json', saveData);
      return saveData;
    } catch (error) {
      console.error("[Engine] Error saving game:", error);
      return ""; // Indicate failure
    }
  }

  // Load game state
  loadGame(saveData: string): boolean {
    try {
      const loadedState = JSON.parse(saveData) as GameState;
      // Basic validation
      if (!loadedState || !loadedState.version || !loadedState.players || !loadedState.time) {
        throw new Error("Invalid save data structure.");
      }
      // Version check
      if (loadedState.version !== this.state.version) {
        console.warn(`[Engine] Loading save data from different version (${loadedState.version}). Current: ${this.state.version}.`);
        // Add migration logic here if needed
      }
      this.state = loadedState;
      this.actionLog = []; // Clear action log on load
      this.addJournal(`Game loaded from save.`, 'event', 5);
      console.log(`[Engine] Game loaded successfully. Current state: Day ${this.state.time.dayCount}, ${this.state.time.phaseName}.`);
      return true;
    } catch (error) {
      console.error("[Engine] Error loading game:", error);
       this.addJournal(`Failed to load save data. Error: ${(error as Error).message}`, 'error', 5);
      return false;
    }
  }

    // --- Debug Methods ---
   debugGiveItem(playerId: string, itemName: string, quantity: number, quality: number): void {
       const player = this.state.players.find(p => p.id === playerId);
       const itemData = getItemData(itemName); // Use name lookup for convenience in debug
       if (player && itemData) {
           addItemToInventory(player, itemData, quantity, quality);
            this.addJournal(`[DEBUG] Gave ${quantity}x ${itemName} (Q${quality}) to ${player.name}.`, 'debug', 1);
            this.logAction("DEBUG", "debugGiveItem" as any, {playerId, itemName, quantity, quality}, true);
       } else {
            this.addJournal(`[DEBUG] Failed to give item ${itemName} to ${playerId}. Player or item not found.`, 'debug', 1);
             this.logAction("DEBUG", "debugGiveItem" as any, {playerId, itemName, quantity, quality}, "Failed");
       }
   }

   debugAddSkillXp(playerId: string, skillName: keyof Skills, amount: number): void {
        const player = this.state.players.find(p => p.id === playerId);
        if (player && player.skills.hasOwnProperty(skillName)) {
            this.addSkillXp(player, skillName, amount);
            this.addJournal(`[DEBUG] Added ${amount} XP to ${skillName} for ${player.name}. New value: ${player.skills[skillName].toFixed(2)}`, 'debug', 1);
             this.logAction("DEBUG", "debugAddSkillXp" as any, {playerId, skillName, amount}, true);
        } else {
             this.addJournal(`[DEBUG] Failed to add XP for ${skillName} to ${playerId}. Player or skill not found.`, 'debug', 1);
              this.logAction("DEBUG", "debugAddSkillXp" as any, {playerId, skillName, amount}, "Failed");
        }
   }

   debugAddGold(playerId: string, amount: number): void {
        const player = this.state.players.find(p => p.id === playerId);
        if (player) {
            player.gold += amount;
            this.addJournal(`[DEBUG] Added ${amount} gold to ${player.name}. New total: ${player.gold}`, 'debug', 1);
             this.logAction("DEBUG", "debugAddGold" as any, {playerId, amount}, true);
        } else {
             this.addJournal(`[DEBUG] Failed to add gold to ${playerId}. Player not found.`, 'debug', 1);
             this.logAction("DEBUG", "debugAddGold" as any, {playerId, amount}, "Failed");
        }
   }

} // End GameEngine Class