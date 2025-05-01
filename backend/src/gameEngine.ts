// src/gameEngine.ts
// The central game engine managing game state and player actions

import {
    Player, InventoryItem, Plant, MoonPhase, Season, JournalEntry,
    Skills, Item, AtelierSpecialization, BasicRecipeInfo,
    GameState, GardenSlot // Removed unused imports
} from "coven-shared";

import { processTurn, MoonPhases, Seasons } from "./turnEngine.js";
import { ITEMS, getItemData, getInitialMarket } from "./items.js";
import { generateTownRequests } from "./townRequests.js";
import { applyMarketEvents, ensureMarketData } from "./marketEvents.js";
import { generateRumors, processRumorEffects, spreadRumor as spreadRumorSystem, verifyRumor, createCustomRumor } from "./rumorEngine.js";
import { RITUAL_QUESTS, progressRituals, checkQuestStepCompletion, claimRitualRewards as claimRitualRewardsSystem, unlockRitualQuest } from "./questSystem.js";
import { SPECIALIZATIONS, getSpecializationBonus } from "./atelier.js";
import { findMatchingRecipe, brewPotion as performBrewing, Recipe, getRecipeById, discoverRecipe as discoverRecipeSystem } from "./brewing.js";
import { calculateHarvestQuality, getIngredientById, Ingredient, SeedItem } from "./ingredients.js"; // Ensure Ingredient/SeedItem are available

const DEFAULT_ITEM_QUALITY = 70;
const STARTING_GARDEN_SLOTS = 3; // Initial unlocked slots

// Exported helper function - can be used by other modules if needed (e.g., quests)
export function addItemToInventory(
    player: Player, itemToAdd: Item, quantity: number,
    quality: number | undefined = DEFAULT_ITEM_QUALITY, // Use default quality
    currentPhase?: MoonPhase, // Optional context for item metadata
    currentSeason?: Season // Optional context for item metadata
): boolean {
    if (!itemToAdd || !itemToAdd.name) {
        console.error("[Inventory] Attempted to add invalid item data.");
        return false;
    }
    if (quantity <= 0) return false;

    // Find stack with matching name AND quality (if quality is defined)
    const existingStack = player.inventory.find(inv =>
        inv.name === itemToAdd.name &&
        (quality === undefined || inv.quality === quality) // Match quality only if new item has quality
    );

    if (existingStack) {
        // Add to existing stack
        existingStack.quantity += quantity;
        // Optionally re-average quality if needed, but simple stacking is often preferred
        // If averaging:
        // const totalQuantity = existingStack.quantity; // Already updated
        // const currentQuality = existingStack.quality ?? DEFAULT_ITEM_QUALITY;
        // const currentTotalQuality = currentQuality * (existingStack.quantity - quantity); // Quality before adding
        // const addedTotalQuality = (quality ?? DEFAULT_ITEM_QUALITY) * quantity;
        // const newAverageQuality = Math.round((currentTotalQuality + addedTotalQuality) / totalQuantity);
        // existingStack.quality = Math.min(100, Math.max(0, newAverageQuality));
    } else {
        // Create new stack
        const newInventoryItem: InventoryItem = {
            id: `${itemToAdd.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // Unique inventory instance ID
            baseId: itemToAdd.id, // Link back to base item definition
            name: itemToAdd.name,
            type: itemToAdd.type,
            category: itemToAdd.category || 'misc', // Ensure category exists
            quantity: quantity,
            quality: quality !== undefined ? Math.min(100, Math.max(0, quality)) : undefined,
            value: itemToAdd.value, // Base value from definition
            rarity: itemToAdd.rarity || 'common', // Ensure rarity exists
            description: itemToAdd.description,
            imagePath: itemToAdd.imagePath,
            // Optional metadata
            harvestedDuring: currentPhase,
            harvestedSeason: currentSeason,
            bookmarked: false // Default bookmark status
        };
        player.inventory.push(newInventoryItem);
    }
    console.log(`[Inventory] Added ${quantity}x ${itemToAdd.name} (Q: ${quality ?? 'N/A'}) to ${player.name}. Current total: ${player.inventory.find(i => i.name === itemToAdd.name)?.quantity}`);
    return true;
}

// Exported helper function - can be used by other modules if needed (e.g., quests)
export function addSkillXp(player: Player, skill: keyof Skills, amount: number): { levelUp: boolean, newLevel: number } {
    if (!player.skills) { 
        // Initialize with all required skills to fix type error
        player.skills = { 
            gardening: 0, 
            brewing: 0, 
            trading: 0, 
            crafting: 0, 
            herbalism: 0, 
            astrology: 0 
        }; 
    } // Initialize skills if missing
    if (player.skills[skill] === undefined) player.skills[skill] = 0; // Initialize specific skill if missing

    // Ensure skill value is treated as a number
    const currentSkillValue = Number(player.skills[skill] || 0);
    const currentLevel = Math.floor(currentSkillValue);

    player.skills[skill] = currentSkillValue + amount;
    const newLevel = Math.floor(player.skills[skill] as number); // Cast back to number after operation
    const levelUp = newLevel > currentLevel;

    if (levelUp) {
        console.log(`[Skill] ${player.name}'s ${String(skill)} skill increased to level ${newLevel}!`);
        // TODO: Add Journal entry for level up inside GameEngine or here?
    }
    return { levelUp, newLevel };
}


// Internal helper functions
function findInventoryItemById(player: Player, inventoryItemId: string): InventoryItem | undefined {
    return player.inventory.find(inv => inv.id === inventoryItemId);
}

function removeItemFromInventoryById(player: Player, inventoryItemId: string, quantity: number): boolean {
    const itemIndex = player.inventory.findIndex(inv => inv.id === inventoryItemId);
    if (itemIndex === -1) {
        console.error(`[Inventory Error] removeItemFromInventoryById: Item ${inventoryItemId} not found for player ${player.id}.`);
        return false;
    }
    const invItem = player.inventory[itemIndex];
    if (invItem.quantity < quantity) {
        console.warn(`[Inventory] Not enough ${invItem.name} (${invItem.quantity}) to remove ${quantity}.`);
        return false;
    }
    invItem.quantity -= quantity;
    console.log(`[Inventory] Removed ${quantity}x ${invItem.name} (ID: ${inventoryItemId}). Remaining: ${invItem.quantity}`);
    if (invItem.quantity <= 0) {
        player.inventory.splice(itemIndex, 1);
        console.log(`[Inventory] Stack ${inventoryItemId} depleted.`);
    }
    return true;
}


function removeItemFromInventoryByName(player: Player, itemName: string, quantityToRemove: number): boolean {
    let quantityAccountedFor = 0;
    const itemsToRemoveIndices: number[] = [];

    // Iterate backwards to safely remove items while iterating
    for (let i = player.inventory.length - 1; i >= 0; i--) {
        if (player.inventory[i].name === itemName) {
            const itemStack = player.inventory[i];
            const canRemove = Math.min(itemStack.quantity, quantityToRemove - quantityAccountedFor);
            if (canRemove > 0) {
                itemStack.quantity -= canRemove;
                quantityAccountedFor += canRemove;
                if (itemStack.quantity <= 0) {
                    itemsToRemoveIndices.push(i); // Mark index for removal
                }
            }
            if (quantityAccountedFor >= quantityToRemove) break; // Stop if we removed enough
        }
    }

    // Remove depleted stacks (indices were collected in reverse order)
    itemsToRemoveIndices.forEach(index => player.inventory.splice(index, 1));

    if (quantityAccountedFor < quantityToRemove) {
        console.warn(`Could not remove enough ${itemName}. Needed ${quantityToRemove}, removed ${quantityAccountedFor}.`);
        // TODO: Should we revert the changes if not enough were removed? This could be complex.
        // For now, we assume partial removal is okay if the check before calling this was correct.
        return false; // Indicate not enough were removed
    }
    console.log(`[Inventory] Removed ${quantityToRemove}x ${itemName} across stacks.`);
    return true; // Successfully removed the required quantity
}


// Main Game Engine class
export class GameEngine {
  state: GameState;

  constructor() {
     console.log("[GameEngine] Initializing...");
     const initialPlayer: Player = this.createNewPlayer("player1", "Willow", "Essence"); // Default player
     this.state = {
        players: [initialPlayer],
        market: getInitialMarket(), // Initialize with base items
        marketData: {
            inflation: 1.0,
            demand: {}, // To be populated by initializeMarketData
            supply: {}, // To be populated by initializeMarketData
            volatility: 0.1, // Base market volatility
            blackMarketAccessCost: 150,
            blackMarketUnlocked: false,
            tradingVolume: 0 // Reset each turn
        },
        townRequests: [], // Start empty, generate first batch later
        rituals: [], // Start empty, unlock later
        rumors: [], // Start empty
        journal: [], // Start empty
        events: [], // Game events log (currently unused)
        currentPlayerIndex: 0,
        time: {
            year: 1,
            season: "Spring",
            phase: 0, // Index for MoonPhases array
            phaseName: MoonPhases[0], // "New Moon"
            weatherFate: "normal",
            previousWeatherFate: undefined,
            dayCount: 1, // Start on Day 1
            lastSaved: undefined // Track last save time
        },
        version: "1.0.0", // Game version
        knownRecipes: [] // Start with empty known recipes globally
    };

    // Initialize known recipes (global and player)
    const startingRecipeIds = ["recipe_cooling_tonic", "recipe_moon_glow_serum"];
    this.state.knownRecipes = startingRecipeIds
        .map(id => { const recipe = getRecipeById(id); return recipe ? { id: recipe.id, name: recipe.name, category: recipe.category, description: recipe.description, type: recipe.type } as BasicRecipeInfo : null; })
        .filter((r): r is BasicRecipeInfo => r !== null); // Use type predicate

    initialPlayer.knownRecipes = startingRecipeIds; // Give player starter recipes

    // Generate initial state elements
    this.state.townRequests = generateTownRequests(this.state);
    this.initializeMarketData(); // Populate supply/demand
    this.initializeRituals(); // Unlock initially available rituals

    // Add starting journal entries
    this.addJournal(`Coven awakened. ${this.state.time.season} Y${this.state.time.year}, a ${this.state.time.phaseName} begins.`, 'event', 5);
    this.addJournal(`The air feels ${this.state.time.weatherFate}.`, 'weather', 3);
    console.log("[GameEngine] Initialization complete.");
   }

   initializeMarketData(): void {
        ITEMS.forEach(item => {
            // Initialize S/D only for relevant types
            if (item.type === 'ingredient' || item.type === 'potion' || item.type === 'seed' || item.type === 'tool') {
                 // Use ?? operator for default values
                this.state.marketData.demand[item.name] = this.state.marketData.demand[item.name] ?? (50 + Math.floor(Math.random() * 30) - 15);
                this.state.marketData.supply[item.name] = this.state.marketData.supply[item.name] ?? (50 + Math.floor(Math.random() * 30) - 15);
            }
        });
        // Ensure items actually in the market list have data
        this.state.market.forEach(marketItem => {
            ensureMarketData(this.state, marketItem.name);
        });
        console.log("[GameEngine] Initialized/Ensured market demand/supply.");
   }

   initializeRituals(): void {
       RITUAL_QUESTS
           .filter(q => q.initiallyAvailable)
           .forEach(q => {
               // Check if already added to prevent duplicates on load
               if (!this.state.rituals.some(r => r.id === q.id)) {
                    unlockRitualQuest(this.state, q.id);
               }
           });
   }

   createNewPlayer(id: string, name: string, specializationId: AtelierSpecialization): Player {
     // Validate specialization, default if invalid
     if (!SPECIALIZATIONS.find(s => s.id === specializationId)) {
         console.warn(`Invalid specialization '${specializationId}', defaulting to 'Essence'.`);
         specializationId = 'Essence';
     }

     const newPlayer: Player = {
         id: id,
         name: name,
         gold: 100,
         mana: 20, // Base mana
         reputation: 5, // Starting reputation
         atelierSpecialization: specializationId,
         atelierLevel: 1,
         skills: { gardening: 1, brewing: 1, trading: 1, crafting: 1, herbalism: 1, astrology: 1 }, // Base skills at 1
         inventory: [],
         garden: [], // Initialize garden plots below
         knownRecipes: [], // Start empty, populated later
         completedRituals: [],
         journalEntries: [], // Player-specific journal (unused for now)
         questsCompleted: 0,
         daysSurvived: 0,
         blackMarketAccess: false,
         lastActive: 0 // Track last active turn
     };

     // Initialize garden plots
     const numSlots = 9; // Total potential plots
     newPlayer.garden = Array.from({ length: numSlots }, (_, idx): GardenSlot => ({ // Explicitly type return value
         id: idx,
         plant: null,
         fertility: 70 + Math.floor(Math.random() * 21) - 10, // 60-80
         sunlight: 60 + Math.floor(Math.random() * 21) - 10, // 50-70
         moisture: 50 + Math.floor(Math.random() * 21) - 10, // 40-60
         isUnlocked: idx < STARTING_GARDEN_SLOTS // Unlock initial slots
     }));

     this.giveStarterItems(newPlayer, specializationId); // Give starting items based on spec
     console.log(`Created player ${name} (ID: ${id}), Specialization: ${specializationId}.`);
     return newPlayer;
   }

   giveStarterItems(player: Player, specialization: AtelierSpecialization): void {
     console.log(`[Starter] Giving items for ${specialization} to ${player.name}.`);
     const s1 = getItemData("seed_glimmerroot");
     const s2 = getItemData("seed_silverleaf");

     if (s1) addItemToInventory(player, s1, 2);
     if (s2) addItemToInventory(player, s2, 2);

     // Spec specific items
     switch (specialization) {
         case "Essence":
             const iG = getItemData("ing_ancient_ginseng");
             const iL = getItemData("ing_sacred_lotus");
             if (iG) addItemToInventory(player, iG, 1);
             if (iL) addItemToInventory(player, iL, 1);
             // player.knownRecipes.push("recipe_radiant_moon_mask"); // Recipes added globally now
             break;
         case "Fermentation":
             const iSS = getItemData("seed_sweetshade");
             const iCJ = getItemData("tool_clay_jar");
             if (iSS) addItemToInventory(player, iSS, 2);
             if (iCJ) addItemToInventory(player, iCJ, 1);
             // player.knownRecipes.push("recipe_ginseng_infusion");
             break;
         case "Distillation":
             const iSE = getItemData("seed_emberberry");
             const iGV = getItemData("tool_glass_vial");
             if (iSE) addItemToInventory(player, iSE, 2);
             if (iGV) addItemToInventory(player, iGV, 2);
             // player.knownRecipes.push("recipe_summer_glow_oil");
             break;
         case "Infusion":
             const iSM = getItemData("seed_moonbud");
             const iMP = getItemData("tool_mortar_pestle");
             if (iSM) addItemToInventory(player, iSM, 2);
             if (iMP) addItemToInventory(player, iMP, 1);
             // player.knownRecipes.push("recipe_cooling_tonic");
             break;
     }

     // Ensure player has basic tool
     const tool = getItemData("tool_mortar_pestle");
     if (tool && !player.inventory.some(i => i.baseId === tool.id)) {
         addItemToInventory(player, tool, 1);
     }
   }

   addJournal(text: string, category: string = 'event', importance: number = 3): void {
       const entry: JournalEntry = {
           id: `j-${this.state.time.dayCount}-${this.state.journal.length}-${Math.random().toString(16).slice(2)}`, // More unique ID
           turn: this.state.time.dayCount,
           date: `${this.state.time.phaseName}, ${this.state.time.season} Y${this.state.time.year}`,
           text: text,
           category: category,
           importance: Math.max(1, Math.min(5, importance)),
           readByPlayer: false
       };
       // Add to the beginning of the array for newest first
       this.state.journal.unshift(entry);
       // Limit journal size
       if (this.state.journal.length > 150) this.state.journal.pop(); // Remove the oldest
   }


   // --- Player Actions ---
    plantSeed(playerId: string, slotId: number, seedInventoryItemId: string): boolean {
         const player = this.state.players.find(p => p.id === playerId);
         if (!player) { console.error(`Player ${playerId} not found.`); return false; }

         const slot = player.garden.find(s => s.id === slotId);
         if (!slot) { console.error(`Plot ${slotId} not found for player ${playerId}.`); return false; }
         if (!slot.isUnlocked) { this.addJournal("Cannot plant in a locked plot.", 'garden', 1); return false; }
         if (slot.plant !== null) { this.addJournal("Plot is already occupied.", 'garden', 1); return false; }


         const seedInvItem = findInventoryItemById(player, seedInventoryItemId);
         if (!seedInvItem || seedInvItem.type !== 'seed') {
             this.addJournal("Selected item is not a valid seed.", 'garden', 1); return false;
         }

         const baseSeedData = getItemData(seedInvItem.baseId) as SeedItem | undefined;
         if (!baseSeedData || !baseSeedData.plantSource) {
             this.addJournal(`Invalid seed data for ${seedInvItem.name}.`, 'error', 3); return false;
         }

         const plantData = getIngredientById(baseSeedData.plantSource);
         if (!plantData) {
             this.addJournal(`Cannot find plant definition for ${baseSeedData.plantSource}.`, 'error', 4); return false;
         }

         // Use seed quality to influence starting health
         const seedQuality = seedInvItem.quality ?? DEFAULT_ITEM_QUALITY;
         const initialHealth = 50 + Math.round((seedQuality - 50) / 2); // Quality affects starting health range

         const newPlant: Plant = {
             id:`plant-${slotId}-${Date.now()}`,
             name: plantData.name,
             category: plantData.category,
             growth: 0,
             maxGrowth: plantData.growthTime,
             watered: false, // This flag is no longer used by turnEngine for watering
             health: Math.max(10, Math.min(100, initialHealth)), // Ensure health is within bounds
             age: 0,
             mature: false,
             moonBlessed: ["Full Moon", "New Moon"].includes(this.state.time.phaseName), // Check specific phases
             seasonalModifier: this.calculateSeasonalModifier(plantData, this.state.time.season),
             deathChance: 0 // Initial death chance
         };

         slot.plant = newPlant;
         const removed = removeItemFromInventoryById(player, seedInventoryItemId, 1);
         if (!removed) {
             slot.plant = null; // Revert planting if item removal failed
             this.addJournal("Inventory error during planting.", 'error', 4); return false;
         }

         // Grant skill XP for planting
         const xpResult = addSkillXp(player, 'gardening', 0.3);
         if (xpResult.levelUp) this.addJournal(`${player.name} gardening reached level ${xpResult.newLevel}!`, 'skill', 4);

         let journalText = `Planted ${plantData.name} seed (Q:${seedQuality}%) in plot ${slotId + 1}.`;
         if (newPlant.moonBlessed) journalText += " The moon's influence feels strong.";
         this.addJournal(journalText, 'garden', 3);

         // Check quest completion
         checkQuestStepCompletion(this.state, player, 'plant', { seedName: plantData.name, slotId, quality: seedQuality });

         return true;
    }

    calculateSeasonalModifier(ingredientData: Ingredient, season: Season): number {
        if (season === ingredientData.bestSeason) return 1.5;
        if (season === ingredientData.worstSeason) return 0.5;
        return 1.0;
    }

    // MODIFIED: Accepts puzzle bonus, directly modifies moisture
    waterPlants(playerId: string, puzzleBonus: number = 0): boolean {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return false;

        let wateredCount = 0;
        let moistureBoost = 0;

        if (puzzleBonus > 0) {
            // Scale bonus: e.g., max puzzle bonus (20) gives +40 moisture boost
            moistureBoost = puzzleBonus * 2;
            this.addJournal(`Garden Attunement successful! Moisture bonus +${moistureBoost}.`, 'garden', 3);
        } else {
             this.addJournal(`Watering the garden...`, 'garden', 2); // Base watering message
        }

        player.garden.forEach(slot => {
            if (slot.isUnlocked !== false) { // Affect unlocked plots
                 // Apply base watering amount + puzzle bonus
                 const baseWaterAmount = 40; // Standard water amount
                 slot.moisture = Math.min(100, (slot.moisture ?? 50) + baseWaterAmount + moistureBoost);
                 if(slot.plant && !slot.plant.mature) {
                    wateredCount++;
                 }
            }
        });

        // Grant XP for the action, slightly boosted by puzzle success
        const xpAmount = 0.1 + (puzzleBonus / 100); // Base + up to 0.2 bonus XP
        const xpResult = addSkillXp(player, 'gardening', xpAmount);
        if (xpResult.levelUp) {
            this.addJournal(`${player.name} gardening reached level ${xpResult.newLevel}!`, 'skill', 4);
        }

        // Log the action
        if (wateredCount > 0) {
            this.addJournal(`Attuned garden energies, ${wateredCount} plant(s) feel refreshed.`, 'garden', 2);
        } else if (puzzleBonus > 0) {
             this.addJournal(`Attuned energies, boosting soil moisture.`, 'garden', 2);
        } else {
            this.addJournal(`Garden plots are sufficiently moist.`, 'garden', 1);
        }

        return true; // Action completed
    }


    harvestPlant(playerId: string, slotId: number): boolean {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) { console.error(`Player ${playerId} not found.`); return false; }

        const slot = player.garden.find(s => s.id === slotId);
        if (!slot || !slot.plant || !slot.plant.mature) {
            this.addJournal("Nothing ready to harvest in that plot.", 'garden', 1); return false;
        }

        const plant = slot.plant;
        const plantData = getIngredientById(plant.name); // Use helper
        if (!plantData) {
            this.addJournal(`Cannot identify harvested plant: ${plant.name}!`, 'error', 4);
            slot.plant = null; // Clear the broken plant
            return false;
        }

        const harvestInfo = calculateHarvestQuality(plantData, plant.health, plant.age, this.state.time.phaseName, this.state.time.season);
        const harvestQuality = harvestInfo.quality;
        const itemBaseData = getItemData(plantData.id); // Get base Item data

        if (!itemBaseData) {
            this.addJournal(`Missing item definition for ${plantData.name}!`, 'error', 4);
            slot.plant = null; return false;
        }

        let yieldAmount = 1; // Base yield
        // Check specialization bonus for harvesting
        const specBonus = getSpecializationBonus(player.atelierSpecialization, 'harvest', itemBaseData.type, itemBaseData.category);
        const finalHarvestQuality = Math.min(100, Math.round(harvestQuality * specBonus.bonusMultiplier));

        // TODO: Implement potential for multiple yield based on skill/quality/spec?
        // if (finalHarvestQuality > 90 && (player.skills.gardening || 0) > 5 && Math.random() < 0.1) yieldAmount = 2;

        const added = addItemToInventory(player, itemBaseData, yieldAmount, finalHarvestQuality, this.state.time.phaseName, this.state.time.season);
        if (!added) {
            this.addJournal("Inventory full or error during harvest.", 'error', 4); return false;
        }

        // Grant skill XP
        const xpResultG = addSkillXp(player, 'gardening', 0.6 + (finalHarvestQuality/200)); // More XP for higher quality
        if (xpResultG.levelUp) this.addJournal(`${player.name} gardening reached level ${xpResultG.newLevel}!`, 'skill', 4);
        const xpResultH = addSkillXp(player, 'herbalism', 0.2 + (finalHarvestQuality/300));
        if (xpResultH.levelUp) this.addJournal(`${player.name}'s herbalism reached level ${xpResultH.newLevel}!`, 'skill', 4);


        let qualityText = "average";
        if (finalHarvestQuality >= 90) qualityText = "exceptional";
        else if (finalHarvestQuality >= 75) qualityText = "excellent";
        else if (finalHarvestQuality >= 60) qualityText = "good";
        else if (finalHarvestQuality < 40) qualityText = "poor";

        this.addJournal(`Harvested ${yieldAmount} ${plant.name} (${qualityText} Q:${finalHarvestQuality}%) from plot ${slotId + 1}.`, 'garden', 3);
        if (specBonus.bonusMultiplier > 1.0) this.addJournal(`(${player.atelierSpecialization} bonus!)`, 'garden', 2);
        // Optionally list bonus factors
        // (harvestInfo.bonusFactors || []).forEach(factor => this.addJournal(` - ${factor}`, 'garden', 1));

        // Clear plot and reduce fertility
        slot.plant = null;
        slot.fertility = Math.max(30, (slot.fertility ?? 70) - (5 + Math.floor(plantData.growthTime / 2))); // Reduce based on growth time

        // Check quest completion
        checkQuestStepCompletion(this.state, player, 'harvest', { 
            plantName: plant.name, 
            quality: finalHarvestQuality, 
            quantity: yieldAmount
        });

        return true;
    }

    brewPotion(playerId: string, ingredientInvItemIds: string[], puzzleBonus: number = 0): boolean {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) { console.error(`Player ${playerId} not found.`); return false; }
        if (ingredientInvItemIds.length !== 2) { this.addJournal("Brewing requires exactly 2 ingredients.", 'brewing', 1); return false; }

        const invItem1 = findInventoryItemById(player, ingredientInvItemIds[0]);
        const invItem2 = findInventoryItemById(player, ingredientInvItemIds[1]);

        if (!invItem1 || !invItem2) { this.addJournal("One or more selected ingredients not found in inventory.", 'brewing', 1); return false; }

        // Check quantity before attempting removal
        if (invItem1.quantity < 1 || invItem2.quantity < 1) { this.addJournal("Not enough ingredients.", 'brewing', 1); return false; }

        // Temporarily decrement quantities for checks, revert if brew fails before item adding
        invItem1.quantity--;
        invItem2.quantity--;

        const recipe = findMatchingRecipe(player, [invItem1, invItem2]); // Pass the actual items
        const ingredientQualities = [invItem1.quality ?? DEFAULT_ITEM_QUALITY, invItem2.quality ?? DEFAULT_ITEM_QUALITY];

        let brewOutcome: { success: boolean; resultItemName?: string; quality: number; bonusFactor?: string; quantityProduced?: number; };
        let recipeUsed: Recipe | undefined = recipe;
        let quantityProduced = 1;

        if (recipe) {
            brewOutcome = performBrewing(recipe, ingredientQualities, player, this.state.time.phaseName, this.state.time.phaseName, puzzleBonus);
        } else {
            // Attempt discovery
            const discoveredRecipe = discoverRecipeSystem([invItem1, invItem2]); // Pass actual items
            if (discoveredRecipe) {
                recipeUsed = discoveredRecipe;
                // Add recipe to known lists if not already known
                if (!player.knownRecipes.includes(discoveredRecipe.id)) {
                    player.knownRecipes.push(discoveredRecipe.id);
                    this.addJournal(`Discovery! Learned to brew ${discoveredRecipe.name}!`, 'discovery', 5);
                }
                if (!this.state.knownRecipes?.some(r => r.id === discoveredRecipe.id)) {
                     const basicInfo: BasicRecipeInfo = { id: discoveredRecipe.id, name: discoveredRecipe.name, category: discoveredRecipe.category, description: discoveredRecipe.description, type: discoveredRecipe.type };
                     this.state.knownRecipes = [...(this.state.knownRecipes || []), basicInfo];
                }
                brewOutcome = performBrewing(discoveredRecipe, ingredientQualities, player, this.state.time.phaseName, this.state.time.phaseName, puzzleBonus);
                // Grant discovery XP
                addSkillXp(player, 'brewing', 1.0); // Bonus XP for discovery
            } else {
                // Failed experiment
                brewOutcome = { success: false, quality: 0, resultItemName: "misc_ruined_brewage", quantityProduced: 1 }; // Produce 1 ruined brew
            }
        }

         quantityProduced = brewOutcome.quantityProduced || 1;

        // Finalize inventory changes based on outcome
        // If success or failure resulting in Ruined Brewage, the decrements stand.
        // If item removal *itself* failed earlier, we wouldn't reach here.
        // Clean up depleted stacks
         if (invItem1.quantity <= 0) player.inventory = player.inventory.filter(i => i.id !== invItem1.id);
         if (invItem2.quantity <= 0) player.inventory = player.inventory.filter(i => i.id !== invItem2.id);


        if (brewOutcome.success && brewOutcome.resultItemName) {
            const resultItemData = getItemData(brewOutcome.resultItemName);
            if (resultItemData) {
                addItemToInventory(player, resultItemData, quantityProduced, brewOutcome.quality, this.state.time.phaseName, this.state.time.season);

                // Grant XP based on success and recipe difficulty
                const xpAmount = recipeUsed ? (0.5 + recipeUsed.difficulty * 0.1) : 0.3; // Base XP
                const qualityXPBonus = brewOutcome.quality / 500; // Small bonus for quality
                const puzzleXPBonus = puzzleBonus / 100; // Small bonus for puzzle
                const totalXP = xpAmount + qualityXPBonus + puzzleXPBonus;
                const xpResult = addSkillXp(player, 'brewing', totalXP);
                if (xpResult.levelUp) this.addJournal(`${player.name}'s brewing reached level ${xpResult.newLevel}!`, 'skill', 4);

                let successMsg = `Brewed ${resultItemData.name} (Q: ${brewOutcome.quality}%)`;
                if (quantityProduced > 1) successMsg += ` x${quantityProduced}!`;
                if (brewOutcome.bonusFactor) successMsg += `. ${brewOutcome.bonusFactor}`;
                if (puzzleBonus > 0) successMsg += ` (+${puzzleBonus}% Puzzle Bonus)`;
                this.addJournal(successMsg, 'brewing', 3);

                checkQuestStepCompletion(this.state, player, 'brew', { 
                    potionName: resultItemData.name, 
                    potionId: resultItemData.id, 
                    quality: brewOutcome.quality
                });

                return true;
            } else {
                this.addJournal(`Unknown item created: ${brewOutcome.resultItemName}!`, 'error', 4);
                 // Should we give back ingredients if result item is invalid? Maybe.
                return false;
            }
        } else {
            // Handle failed brew (which now produces Ruined Brewage)
            const ruinedItemData = getItemData("misc_ruined_brewage");
            if (ruinedItemData) {
                addItemToInventory(player, ruinedItemData, quantityProduced, 0); // Add the ruined item
            }
            this.addJournal(`Brewing failed. Produced Ruined Brewage.`, 'brewing', 1);
            const xpResult = addSkillXp(player, 'brewing', 0.1); // Less XP for failure
            if (xpResult.levelUp) this.addJournal(`${player.name}'s brewing reached level ${xpResult.newLevel}!`, 'skill', 4);
            return false;
        }
    }


    fulfillRequest(playerId: string, requestId: string): boolean {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return false;

        const reqIndex = this.state.townRequests.findIndex(req => req.id === requestId);
        if (reqIndex === -1) { this.addJournal("That request is no longer available.", 'quest', 1); return false; }

        const request = this.state.townRequests[reqIndex];
         // Verify player *still* has the items before removing
        const totalAvailable = player.inventory
            .filter(item => item.name === request.item)
            .reduce((sum, item) => sum + item.quantity, 0);

        if (totalAvailable < request.quantity) {
             this.addJournal(`You no longer have enough ${request.item}.`, 'quest', 1);
             return false;
        }


        const removed = removeItemFromInventoryByName(player, request.item, request.quantity);
        if (!removed) {
            this.addJournal(`Error fulfilling request for ${request.item}.`, 'error', 4);
            // If removal failed, should we revert state? This indicates an inventory inconsistency.
            return false;
        }

        player.gold += request.rewardGold;
        player.reputation = Math.min(100, player.reputation + request.rewardInfluence);

        // Influence market slightly
        ensureMarketData(this.state, request.item);
        this.state.marketData.demand[request.item] = Math.max(5, (this.state.marketData.demand[request.item] ?? 50) - (5 * request.quantity)); // Reduce demand
        this.state.marketData.supply[request.item] = Math.min(95, (this.state.marketData.supply[request.item] ?? 50) + (3 * request.quantity)); // Increase supply slightly

        this.state.townRequests.splice(reqIndex, 1); // Remove completed request

        // Grant XP
        const xpResult = addSkillXp(player, 'trading', 0.4 + request.difficulty * 0.1);
        if (xpResult.levelUp) this.addJournal(`${player.name}'s trading reached level ${xpResult.newLevel}!`, 'skill', 4);

        player.questsCompleted = (player.questsCompleted || 0) + 1;
        this.addJournal(`Fulfilled ${request.requester}'s request for ${request.item}.`, 'quest', 4);
        this.addJournal(`Received ${request.rewardGold}G, +${request.rewardInfluence} Rep.`, 'reward', 3);

        checkQuestStepCompletion(this.state, player, 'fulfillRequest', { requestId: request.id, itemName: request.item, quantity: request.quantity, requester: request.requester });
        return true;
    }


    buyItem(playerId: string, itemId: string): boolean {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return false;

        const marketItemIndex = this.state.market.findIndex(item => item.id === itemId);
        if (marketItemIndex === -1) { this.addJournal("That item is no longer for sale.", 'market', 1); return false; }

        const marketItem = this.state.market[marketItemIndex];
        const price = marketItem.price; // Use current market price

        if (player.gold < price) { this.addJournal(`Not enough gold to buy ${marketItem.name}.`, 'market', 1); return false; }

        const itemBaseData = getItemData(marketItem.id);
        if (!itemBaseData) { this.addJournal(`Error buying ${marketItem.name}! Unknown item definition.`, 'error', 4); return false; }

        player.gold -= price;
        // Add item with default quality, perhaps slightly randomized?
        const quality = DEFAULT_ITEM_QUALITY - 5 + Math.floor(Math.random() * 11); // 65-75 quality
        addItemToInventory(player, itemBaseData, 1, quality);

        // Grant XP
        const xpResult = addSkillXp(player, 'trading', 0.2 + (price / 200)); // XP based on price
        if (xpResult.levelUp) this.addJournal(`${player.name}'s trading reached level ${xpResult.newLevel}!`, 'skill', 4);

        this.addJournal(`Purchased ${marketItem.name} for ${price}G.`, 'market', 2);

        // Market dynamics adjustments
        ensureMarketData(this.state, marketItem.name);
        this.state.marketData.demand[marketItem.name] = Math.min(95, (this.state.marketData.demand[marketItem.name] ?? 50) + 8); // Increase demand
        this.state.marketData.supply[marketItem.name] = Math.max(5, (this.state.marketData.supply[marketItem.name] ?? 50) - 5); // Decrease supply
        // Slightly increase price after purchase
        marketItem.price = Math.max(1, Math.round(marketItem.price * 1.02));
        marketItem.lastPriceChange = this.state.time.dayCount;
        this.state.marketData.tradingVolume += price; // Track volume

        checkQuestStepCompletion(this.state, player, 'buyItem', { itemId: itemBaseData.id, itemName: itemBaseData.name, price: price, category: itemBaseData.category });
        return true;
    }


    sellItem(playerId: string, inventoryItemId: string): boolean {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return false;

        const invItem = findInventoryItemById(player, inventoryItemId);
        if (!invItem || invItem.quantity < 1) { this.addJournal("Item not found in inventory.", 'market', 1); return false; }

        // Find the corresponding *market* item to get the current price
        const marketItem = this.state.market.find(item => item.id === invItem.baseId);
        if (!marketItem) { this.addJournal(`${invItem.name} cannot be sold here currently.`, 'market', 1); return false; }

        const baseSellPrice = marketItem.price; // Use current market price as base
        // Quality influences sell price significantly
        const qualityMultiplier = 0.4 + ((invItem.quality ?? DEFAULT_ITEM_QUALITY) / 100) * 0.8; // Adjusted multiplier (40% to 120% of base)
        const sellPrice = Math.max(1, Math.round(baseSellPrice * qualityMultiplier)); // Ensure price is at least 1

        // Remove ONE item from the specific inventory stack
        const removed = removeItemFromInventoryById(player, inventoryItemId, 1);
        if (!removed) { this.addJournal("Inventory error during selling.", 'error', 4); return false; }

        player.gold += sellPrice;

        // Grant XP
        const xpResult = addSkillXp(player, 'trading', 0.3 + (sellPrice / 150)); // XP based on sell price
        if (xpResult.levelUp) this.addJournal(`${player.name}'s trading reached level ${xpResult.newLevel}!`, 'skill', 4);

        this.addJournal(`Sold ${invItem.name} (Q:${invItem.quality ?? 'N/A'}%) for ${sellPrice}G.`, 'market', 2);

        // Market dynamics adjustments
        ensureMarketData(this.state, marketItem.name);
        this.state.marketData.supply[marketItem.name] = Math.min(95, (this.state.marketData.supply[marketItem.name] ?? 50) + 8); // Increase supply
        this.state.marketData.demand[marketItem.name] = Math.max(5, (this.state.marketData.demand[marketItem.name] ?? 50) - 4); // Decrease demand slightly
        // Slightly decrease price after selling
        marketItem.price = Math.max(1, Math.round(marketItem.price * 0.98));
        marketItem.lastPriceChange = this.state.time.dayCount;
        this.state.marketData.tradingVolume += sellPrice; // Track volume

        checkQuestStepCompletion(this.state, player, 'sellItem', { itemId: invItem.baseId, itemName: invItem.name, price: sellPrice, quality: invItem.quality, category: invItem.category });
        return true;
    }


    // --- Ritual and Rumor Methods ---
    claimRitualReward(playerId: string, ritualId: string): boolean {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return false;
        return claimRitualRewardsSystem(this.state, player, ritualId); // Use system function
    }

    spreadRumor(playerId: string, rumorId: string): boolean {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return false;
        return spreadRumorSystem(this.state, player, rumorId); // Use system function
    }

    verifyRumor(playerId: string, rumorId: string): boolean {
        // Verification might depend on player skills or actions not implemented here
        // For now, just call the system function which handles basic logic
        return verifyRumor(this.state, playerId, rumorId); // Use system function
    }

    createCustomRumor( content: string, itemName: string, priceEffect: number, origin?: string, initialSpread?: number, duration?: number, verified?: boolean ): boolean {
        const rumor = createCustomRumor(this.state, content, itemName, priceEffect, origin, initialSpread, duration, verified);
        return !!rumor; // Return true if rumor was created
    }

    // --- Turn Management ---
    endTurn(playerId: string): void {
        const playerIndex = this.state.players.findIndex(p => p.id === playerId);
        // Allow ending turn only if it's the current player
        if (playerIndex !== this.state.currentPlayerIndex) {
            console.warn(`Player ${playerId} tried to end turn out of sequence.`);
            return;
        }

        const currentPlayer = this.state.players[playerIndex];
        if (!currentPlayer) return;

        currentPlayer.lastActive = this.state.time.dayCount; // Record last active turn

        // Determine next player index
        const nextPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
        this.state.currentPlayerIndex = nextPlayerIndex;

        // If the next player is the first player (index 0), advance the game phase
        if (nextPlayerIndex === 0) {
            this.advancePhase();
        } else {
            // Otherwise, just log whose turn it is (for multi-player, though currently single)
            const nextPlayer = this.state.players[nextPlayerIndex];
            if (nextPlayer) {
                this.addJournal(`It's ${nextPlayer.name}'s turn.`, 'event', 1);
            }
        }
    }

    advancePhase(): void {
        console.log(`[Engine] Advancing phase from Day ${this.state.time.dayCount}...`);
        // 1. Process Game Time and World State Changes (Weather, Season, Plants)
        this.state = processTurn(this.state); // This updates time, weather, plants, adds journal entries

        // 2. Generate/Update Town Requests
        if (Math.random() < 0.4 || this.state.townRequests.length < 2) { // Higher chance if few requests exist
            const newRequests = generateTownRequests(this.state);
            if (newRequests.length > 0) {
                const maxRequests = 5; // Max active requests
                const slotsAvailable = maxRequests - this.state.townRequests.length;
                if (slotsAvailable > 0) {
                    this.state.townRequests.push(...newRequests.slice(0, slotsAvailable));
                    this.addJournal(`New requests posted on the town board.`, 'quest', 3);
                }
            }
        }
        // Optionally remove very old requests?
        // this.state.townRequests = this.state.townRequests.filter(req => !req.expires || req.expires > this.state.time.dayCount);

        // 3. Generate/Update Rumors
        const newRumors = generateRumors(this.state);
        this.state.rumors.push(...newRumors);
        processRumorEffects(this.state); // Update spread/fade existing rumors

        // 4. Apply Market Events (S/D shifts, memory, inflation, etc.)
        applyMarketEvents(this.state); // This handles all market adjustments

        // 5. Process Rituals (Passive progress, unlocks)
        progressRituals(this.state);

        console.log(`[Engine] Phase advanced to Day ${this.state.time.dayCount} (${this.state.time.phaseName}, ${this.state.time.season} Y${this.state.time.year})`);
    }


    // --- State Management ---
    getState(): GameState {
        // Return a deep copy to prevent direct modification? For now, returning direct state.
        // Consider using structuredClone if deep copying is needed:
        // return structuredClone(this.state);
        return this.state;
    }

    saveGame(): string {
        try {
            this.state.time.lastSaved = Date.now(); // Record save timestamp
            // TODO: Add validation or schema check before stringifying?
            return JSON.stringify(this.state);
        } catch (error) {
            console.error("[Save Error] Failed to stringify game state:", error);
            return ""; // Return empty string on failure
        }
    }

    loadGame(saveData: string): boolean {
        try {
            const loadedState = JSON.parse(saveData) as GameState;
            // Basic validation
            if (!loadedState || typeof loadedState !== 'object' || !loadedState.version || !loadedState.players || !loadedState.time) {
                throw new Error("Invalid or incomplete save data structure.");
            }
            // Version check (optional warning)
            if (loadedState.version !== this.state.version) {
                console.warn(`Loading save data from version ${loadedState.version}, current engine version is ${this.state.version}. Potential compatibility issues.`);
            }

            // Overwrite current state with loaded state
            this.state = loadedState;
             // Ensure necessary initializations are run on loaded state if they weren't saved
            this.initializeMarketData(); // Re-ensure market data exists
            this.initializeRituals(); // Re-ensure initially available rituals are present

            this.addJournal(`Game loaded successfully. Welcome back!`, 'event', 5);
            console.log(`[GameEngine] Game loaded from save (Day ${this.state.time.dayCount}).`);
            return true;
        } catch (error) {
            console.error("[Load Error] Failed to parse or validate save data:", error);
            this.addJournal(`Failed to load save data. It may be corrupted.`, 'error', 5);
            return false;
        }
    }


    // --- Debug Methods ---
   debugGiveItem(playerId: string, itemName: string, quantity: number = 1, quality: number = 70): void {
       const player = this.state.players.find(p => p.id === playerId);
       const itemData = getItemData(itemName);
       if (player && itemData) {
           addItemToInventory(player, itemData, quantity, quality);
           this.addJournal(`[DBG] Gave ${quantity}x ${itemName} (Q:${quality}) to ${player.name}.`, 'debug', 1);
       } else {
           this.addJournal(`[DBG] Failed give item '${itemName}' to player '${playerId}'.`, 'debug', 1);
           console.warn(`Debug Give Item Failed: Player ${playerId} or Item ${itemName} not found.`);
       }
   }

   debugAddSkillXp(playerId: string, skillName: keyof Skills, amount: number): void {
       const player = this.state.players.find(p => p.id === playerId);
       if (player && player.skills.hasOwnProperty(skillName)) {
           const xpResult = addSkillXp(player, skillName, amount);
           this.addJournal(`[DBG] Added ${amount} XP to ${String(skillName)} for ${player.name}.`, 'debug', 1);
           if (xpResult.levelUp) {
               this.addJournal(`[DBG] ${player.name}'s ${String(skillName)} reached level ${xpResult.newLevel}!`, 'debug', 4);
           }
       } else {
           this.addJournal(`[DBG] Failed add XP for ${String(skillName)} to player ${playerId}.`, 'debug', 1);
            console.warn(`Debug Add Skill XP Failed: Player ${playerId} or Skill ${String(skillName)} invalid.`);
       }
   }

   debugAddGold(playerId: string, amount: number): void {
       const player = this.state.players.find(p => p.id === playerId);
       if (player) {
           player.gold += amount;
           this.addJournal(`[DBG] Added ${amount} gold to ${player.name}.`, 'debug', 1);
       } else {
           this.addJournal(`[DBG] Failed add gold to player ${playerId}.`, 'debug', 1);
           console.warn(`Debug Add Gold Failed: Player ${playerId} not found.`);
       }
   }

   debugSetMoonPhase(phaseName: MoonPhase): void {
       const phaseIndex = MoonPhases.indexOf(phaseName);
       if (phaseIndex !== -1) {
           this.state.time.phase = phaseIndex;
           this.state.time.phaseName = phaseName;
           this.addJournal(`[DBG] Moon phase set to ${phaseName}.`, 'debug', 1);
       } else {
           this.addJournal(`[DBG] Invalid phase name: ${phaseName}.`, 'debug', 1);
           console.warn(`Debug Set Moon Phase Failed: Invalid phase ${phaseName}.`);
       }
   }

   debugSetSeason(season: Season): void {
       if (Seasons.includes(season)) {
           this.state.time.season = season;
           this.addJournal(`[DBG] Season set to ${season}.`, 'debug', 1);
       } else {
           this.addJournal(`[DBG] Invalid season name: ${season}.`, 'debug', 1);
           console.warn(`Debug Set Season Failed: Invalid season ${season}.`);
       }
   }
} // End of GameEngine class