// src/gameEngine.ts
// The central game engine managing game state and player actions

import {
    GameState, Player, InventoryItem, Plant,
    MoonPhase, Season, RitualQuest, JournalEntry, Skills, Item, AtelierSpecialization, BasicRecipeInfo
} from "coven-shared";

import { processTurn, MoonPhases, Seasons } from "./turnEngine.js";
import { ITEMS, getItemData, getInitialMarket } from "./items.js";
import { generateTownRequests } from "./townRequests.js";
import { applyMarketEvents, ensureMarketData } from "./marketEvents.js";
import { generateRumors, processRumorEffects, spreadRumor as spreadRumorSystem, verifyRumor, createCustomRumor } from "./rumorEngine.js";
// Import functions directly now that they are exported
import { RITUAL_QUESTS, progressRituals, checkQuestStepCompletion, claimRitualRewards as claimRitualRewardsSystem, unlockRitualQuest } from "./questSystem.js";
import { SPECIALIZATIONS, getSpecializationBonus } from "./atelier.js";
import { findMatchingRecipe, brewPotion as performBrewing, Recipe, getRecipeById, discoverRecipe as discoverRecipeSystem } from "./brewing.js";
import { calculateHarvestQuality, getIngredientById, Ingredient, SeedItem } from "./ingredients.js";

const DEFAULT_ITEM_QUALITY = 70;
const STARTING_GARDEN_SLOTS = 3;

// Exported for use in questSystem
export function addItemToInventory(
    player: Player,
    itemToAdd: Item,
    quantity: number,
    quality: number | undefined = DEFAULT_ITEM_QUALITY,
    currentPhase?: MoonPhase,
    currentSeason?: Season
): boolean {
    if (quantity <= 0) return false;

    const existingStack = player.inventory.find(
        (inv) => inv.name === itemToAdd.name && inv.quality === quality
    );

    if (existingStack) {
        const totalQuantity = existingStack.quantity + quantity;
        const currentQuality = existingStack.quality ?? DEFAULT_ITEM_QUALITY;
        const currentTotalQuality = currentQuality * existingStack.quantity;
        const addedTotalQuality = (quality ?? DEFAULT_ITEM_QUALITY) * quantity;
        const newAverageQuality = Math.round((currentTotalQuality + addedTotalQuality) / totalQuantity);
        existingStack.quantity = totalQuantity;
        existingStack.quality = Math.min(100, Math.max(0, newAverageQuality));
    } else {
        const newInventoryItem: InventoryItem = {
            id: `${itemToAdd.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            baseId: itemToAdd.id, name: itemToAdd.name, type: itemToAdd.type, category: itemToAdd.category,
            quantity: quantity, quality: quality !== undefined ? Math.min(100, Math.max(0, quality)) : undefined,
            value: itemToAdd.value, rarity: itemToAdd.rarity, description: itemToAdd.description, imagePath: itemToAdd.imagePath,
            harvestedDuring: currentPhase, harvestedSeason: currentSeason, bookmarked: false,
        };
        player.inventory.push(newInventoryItem);
    }
    console.log(`[Inventory] Added ${quantity}x ${itemToAdd.name} (Q: ${quality ?? 'N/A'}) to ${player.name}.`);
    return true;
}

// Exported for use in questSystem
export function addSkillXp(player: Player, skill: keyof Skills, amount: number): { levelUp: boolean, newLevel: number } {
    if (!player.skills[skill]) player.skills[skill] = 0;
    const currentLevel = Math.floor(player.skills[skill]);
    player.skills[skill] += amount;
    const newLevel = Math.floor(player.skills[skill]);
    const levelUp = newLevel > currentLevel;
    if (levelUp) {
        // Use String() to avoid implicit conversion error
        console.log(`[Skill] ${player.name}'s ${String(skill)} skill increased to level ${newLevel}!`);
    }
    return { levelUp, newLevel };
}

function findInventoryItemById(player: Player, inventoryItemId: string): InventoryItem | undefined {
    return player.inventory.find((inv) => inv.id === inventoryItemId);
}
function removeItemFromInventoryById(player: Player, inventoryItemId: string, quantity: number): boolean {
    const itemIndex = player.inventory.findIndex((inv) => inv.id === inventoryItemId);
    if (itemIndex === -1) {
        console.error(`[Inventory] Item with ID ${inventoryItemId} not found for player ${player.name}.`);
        return false;
    }
    const invItem = player.inventory[itemIndex];
    if (invItem.quantity < quantity) {
        console.warn(`[Inventory] Not enough ${invItem.name} (ID: ${inventoryItemId}) to remove ${quantity}. Has ${invItem.quantity}.`);
        return false;
    }
    invItem.quantity -= quantity;
    console.log(`[Inventory] Removed ${quantity}x ${invItem.name} (ID: ${inventoryItemId}) from ${player.name}. Remaining: ${invItem.quantity}`);
    if (invItem.quantity <= 0) {
        player.inventory.splice(itemIndex, 1);
         console.log(`[Inventory] Stack ${invItem.name} (ID: ${inventoryItemId}) removed completely.`);
    }
    return true;
}
function removeItemFromInventoryByName(player: Player, itemName: string, quantityToRemove: number): boolean {
     let quantityAccountedFor = 0;
    const itemsToRemoveIndices: number[] = [];
    for (let i = player.inventory.length - 1; i >= 0; i--) {
        if (player.inventory[i].name === itemName) {
            const itemStack = player.inventory[i];
            const canRemoveFromStack = Math.min(itemStack.quantity, quantityToRemove - quantityAccountedFor);
            if (canRemoveFromStack > 0) {
                itemStack.quantity -= canRemoveFromStack;
                quantityAccountedFor += canRemoveFromStack;
                console.log(`[Inventory] Removed ${canRemoveFromStack}x ${itemName} from stack ${itemStack.id}. Remaining in stack: ${itemStack.quantity}`);
                if (itemStack.quantity <= 0) itemsToRemoveIndices.push(i);
            }
            if (quantityAccountedFor >= quantityToRemove) break;
        }
    }
    itemsToRemoveIndices.sort((a, b) => b - a).forEach(index => player.inventory.splice(index, 1));
    if (quantityAccountedFor < quantityToRemove) {
        console.warn(`[Inventory] Could not remove enough ${itemName}. Needed ${quantityToRemove}, removed ${quantityAccountedFor}.`);
        return false;
    }
    console.log(`[Inventory] Successfully removed ${quantityAccountedFor}x ${itemName} in total.`);
    return true;
}


// Main Game Engine class
export class GameEngine {
  state: GameState;

  constructor() {
     console.log("[GameEngine] Initializing...");
    const initialPlayer: Player = this.createNewPlayer("player1", "Willow", "Essence");
    this.state = {
      players: [initialPlayer],
      market: getInitialMarket(),
      marketData: {
        inflation: 1.0, demand: {}, supply: {}, volatility: 0.1,
        blackMarketAccessCost: 150, blackMarketUnlocked: false, tradingVolume: 0
      },
      townRequests: [], rituals: [], rumors: [], journal: [], events: [],
      currentPlayerIndex: 0,
      time: {
        year: 1, season: "Spring", phase: 0, phaseName: "New Moon",
        weatherFate: "normal", previousWeatherFate: undefined, dayCount: 1
      },
      version: "1.0.0",
      knownRecipes: [],
    };

     const startingRecipeIds = [ "recipe_cooling_tonic", "recipe_moon_glow_serum" ];
     this.state.knownRecipes = startingRecipeIds.map(id => {
        const recipe = getRecipeById(id);
        if (recipe) {
             // Type assertion for BasicRecipeInfo should be okay now
             return {
                 id: recipe.id, name: recipe.name, category: recipe.category,
                 description: recipe.description, type: recipe.type
             } as BasicRecipeInfo;
         } return null;
      }).filter((r): r is BasicRecipeInfo => r !== null); // Filter and predicate fixed by shared type change

     initialPlayer.knownRecipes = startingRecipeIds;
     this.state.townRequests = generateTownRequests(this.state);
     this.initializeMarketData();
     this.initializeRituals();
     this.addJournal(`Coven awakened. ${this.state.time.season} Year ${this.state.time.year}, a ${this.state.time.phaseName} begins.`, 'event', 5);
     this.addJournal(`The air feels ${this.state.time.weatherFate}.`, 'weather', 3);
     console.log("[GameEngine] Initialization complete.");
   }

   initializeMarketData(): void {
      ITEMS.forEach(item => {
         if (item.type === 'ingredient' || item.type === 'potion' || item.type === 'seed') {
            this.state.marketData.demand[item.name] = 50 + Math.floor(Math.random() * 30) - 15;
            this.state.marketData.supply[item.name] = 50 + Math.floor(Math.random() * 30) - 15;
         }
     });
     this.state.market.forEach(marketItem => { ensureMarketData(this.state, marketItem.name); });
     console.log("[GameEngine] Initialized market demand/supply data.");
   }

   initializeRituals(): void {
     RITUAL_QUESTS.filter(q => q.initiallyAvailable).forEach(q => {
         // Use imported function which now includes journaling
         unlockRitualQuest(this.state, q.id);
     });
   }

   createNewPlayer(id: string, name: string, specializationId: AtelierSpecialization): Player {
     const specializationDetails = SPECIALIZATIONS.find(s => s.id === specializationId);
     if (!specializationDetails) specializationId = 'Essence';
     const newPlayer: Player = { // Fixed TS2740 by initializing all properties
        id: id, name: name, gold: 100, mana: 20, reputation: 5,
        atelierSpecialization: specializationId, atelierLevel: 1,
        skills: { gardening: 1, brewing: 1, trading: 1, crafting: 1, herbalism: 1, astrology: 1 },
        inventory: [], garden: [], knownRecipes: [], completedRituals: [],
        journalEntries: [], questsCompleted: 0, daysSurvived: 0,
        blackMarketAccess: false, lastActive: 0
     };
     const numSlots = 9;
     newPlayer.garden = Array.from({ length: numSlots }, (_, idx) => ({ id: idx, plant: null, fertility: 70 + Math.floor(Math.random() * 20) - 10, sunlight: 60 + Math.floor(Math.random() * 20) - 10, moisture: 50 + Math.floor(Math.random() * 20) - 10, isUnlocked: idx < STARTING_GARDEN_SLOTS }));
     this.giveStarterItems(newPlayer, specializationId);
     console.log(`[GameEngine] Created player ${name} (ID: ${id}) with ${specializationId} specialization.`);
     return newPlayer;
   }

   giveStarterItems(player: Player, specialization: AtelierSpecialization): void {
      console.log(`[GameEngine] Giving starter items for ${specialization} specialization to ${player.name}.`);
     const baseSeed1 = getItemData("seed_glimmerroot"); const baseSeed2 = getItemData("seed_silverleaf");
     if (baseSeed1) addItemToInventory(player, baseSeed1, 2); if (baseSeed2) addItemToInventory(player, baseSeed2, 2);
     switch (specialization) {
         case "Essence":
             const itemGinseng = getItemData("ing_ancient_ginseng"); const itemLotus = getItemData("ing_sacred_lotus");
             if(itemGinseng) addItemToInventory(player, itemGinseng, 1); if(itemLotus) addItemToInventory(player, itemLotus, 1);
             player.knownRecipes.push("recipe_radiant_moon_mask"); break;
         case "Fermentation":
             const itemSeedSweetshade = getItemData("seed_sweetshade"); const itemClayJar = getItemData("tool_clay_jar");
             if(itemSeedSweetshade) addItemToInventory(player, itemSeedSweetshade, 2); if(itemClayJar) addItemToInventory(player, itemClayJar, 1);
             player.knownRecipes.push("recipe_ginseng_infusion"); break;
         case "Distillation":
             const itemSeedEmberberry = getItemData("seed_emberberry"); const itemGlassVial = getItemData("tool_glass_vial");
             if(itemSeedEmberberry) addItemToInventory(player, itemSeedEmberberry, 2); if(itemGlassVial) addItemToInventory(player, itemGlassVial, 2);
             player.knownRecipes.push("recipe_summer_glow_oil"); break;
         case "Infusion":
             const itemSeedMoonbud = getItemData("seed_moonbud"); const itemMortar = getItemData("tool_mortar_pestle");
             if(itemSeedMoonbud) addItemToInventory(player, itemSeedMoonbud, 2); if(itemMortar) addItemToInventory(player, itemMortar, 1);
             player.knownRecipes.push("recipe_cooling_tonic"); break;
     }
     const itemBasicTool = getItemData("tool_mortar_pestle");
     if(itemBasicTool && !player.inventory.some(i => i.baseId === itemBasicTool.id)) addItemToInventory(player, itemBasicTool, 1);
   }

   addJournal(text: string, category: string = 'event', importance: number = 3): void {
     const entry: JournalEntry = { id: `j-${this.state.time.dayCount}-${this.state.journal.length}`, turn: this.state.time.dayCount, date: `${this.state.time.phaseName}, ${this.state.time.season} Y${this.state.time.year}`, text: text, category: category, importance: Math.max(1, Math.min(5, importance)), readByPlayer: false, };
     this.state.journal.push(entry);
     if (this.state.journal.length > 150) { this.state.journal.shift(); }
   }

  // --- Player Actions ---

    plantSeed(playerId: string, slotId: number, seedInventoryItemId: string): boolean {
         const player = this.state.players.find(p => p.id === playerId);
         if (!player) return false;
         const slot = player.garden.find(s => s.id === slotId);
         const seedInvItem = findInventoryItemById(player, seedInventoryItemId);
         if (!slot || !seedInvItem || seedInvItem.type !== 'seed' || slot.plant !== null) {
             this.addJournal("Cannot plant there.", 'garden', 1); return false;
         }
         const baseSeedData = getItemData(seedInvItem.baseId) as SeedItem | undefined;
         if (!baseSeedData || !baseSeedData.plantSource) {
              this.addJournal(`Cannot determine what this seed grows into!`, 'error', 3); return false;
         }
         const plantData = getIngredientById(baseSeedData.plantSource);
         if (!plantData) {
              this.addJournal(`Error planting - missing plant definition!`, 'error', 4); return false;
         }
         const seedQuality = seedInvItem.quality ?? DEFAULT_ITEM_QUALITY;
         const initialHealth = 50 + Math.round((seedQuality - 50) / 2);
         const newPlant: Plant = { // Fixed TS2740 by initializing all properties
             id:`plant-${slotId}-${Date.now()}`, name:plantData.name, // Fixed TS2339 (name is on Item now)
             category:plantData.category, growth:0, maxGrowth:plantData.growthTime, watered:false,
             health:Math.max(10, Math.min(100, initialHealth)), age:0, mature:false,
             moonBlessed:this.state.time.phaseName === "Full Moon" || this.state.time.phaseName === "New Moon",
             seasonalModifier:this.calculateSeasonalModifier(plantData, this.state.time.season), deathChance:0
         };

         slot.plant = newPlant;
         const removed = removeItemFromInventoryById(player, seedInventoryItemId, 1);
         if (!removed) {
              slot.plant = null; this.addJournal("Error planting seed - inventory issue.", 'error', 4); return false;
         }
         const xpResult = addSkillXp(player, 'gardening', 0.3);
         if (xpResult.levelUp) {
              this.addJournal(`${player.name}'s gardening skill increased to level ${xpResult.newLevel}!`, 'skill', 4);
         }
         let journalText = `Planted a ${plantData.name} seed (Q:${seedQuality}%) in plot ${slotId + 1}.`; // Fixed TS2339
         if (newPlant.moonBlessed) journalText += " The moon's phase blesses this planting!";
         this.addJournal(journalText, 'garden', 3);
         checkQuestStepCompletion(this.state, player, 'plant', { seedName: plantData.name, slotId, quality: seedQuality, season: this.state.time.season }); // Fixed TS2339
         return true;
    }

     calculateSeasonalModifier(ingredientData: Ingredient, season: Season): number {
        if (season === ingredientData.bestSeason) return 1.5;
        if (season === ingredientData.worstSeason) return 0.5;
        return 1.0;
    }


    waterPlants(playerId: string): boolean { // Removed unused success parameter
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return false;
        let wateredCount = 0;
        player.garden.forEach(slot => {
            if (slot.plant && !slot.plant.mature) {
                slot.plant.watered = true; wateredCount++;
            }
        });
        if (wateredCount > 0) {
             const xpAmount = 0.1 * wateredCount;
             const xpResult = addSkillXp(player, 'gardening', xpAmount);
             if (xpResult.levelUp) this.addJournal(`${player.name}'s gardening skill increased to level ${xpResult.newLevel}!`, 'skill', 4);
             this.addJournal(`You tended to the watering needs of your garden (${wateredCount} plants).`, 'garden', 2);
             return true;
        } else {
             this.addJournal(`No plants needed watering at the moment.`, 'garden', 1);
             return false;
        }
    }

   harvestPlant(playerId: string, slotId: number): boolean {
      const player = this.state.players.find(p => p.id === playerId);
      if (!player) return false;
      const slot = player.garden.find(s => s.id === slotId);
      if (!slot || !slot.plant || !slot.plant.mature) {
          this.addJournal("Cannot harvest that yet.", 'garden', 1); return false;
      }
      const plant = slot.plant;
      const plantData = getIngredientById(plant.name);
      if (!plantData) {
           this.addJournal(`Error harvesting - unknown plant data!`, 'error', 4); return false;
      }
      // Assuming calculateHarvestQuality is correctly defined and returns { quality: number, bonusFactors: string[] }
      const harvestInfo = calculateHarvestQuality(plantData, plant.health, plant.age, this.state.time.phaseName, this.state.time.season);
      // Assume harvestInfo.quality and harvestInfo.bonusFactors exist now. If not, need to fix calculateHarvestQuality.
      const harvestQuality = harvestInfo.quality; // Assuming quality exists

      const itemBaseData = getItemData(plantData.id);
      if (!itemBaseData) {
           this.addJournal(`Error harvesting - item definition missing!`, 'error', 4); return false;
      }
      let yieldAmount = 1;
      const specBonus = getSpecializationBonus(player.atelierSpecialization, 'harvest', itemBaseData.type, itemBaseData.category);
      const finalHarvestQuality = Math.min(100, Math.round(harvestQuality * specBonus.bonusMultiplier));
      const added = addItemToInventory(player, itemBaseData, yieldAmount, finalHarvestQuality, this.state.time.phaseName, this.state.time.season);
      if (!added) {
           this.addJournal(`Error adding harvested ${itemBaseData.name} to inventory.`, 'error', 4); return false;
      }
      const xpResultGardening = addSkillXp(player, 'gardening', 0.6); if (xpResultGardening.levelUp) this.addJournal(`${player.name}'s gardening skill increased to level ${xpResultGardening.newLevel}!`, 'skill', 4);
      const xpResultHerbalism = addSkillXp(player, 'herbalism', 0.2); if (xpResultHerbalism.levelUp) this.addJournal(`${player.name}'s herbalism skill increased to level ${xpResultHerbalism.newLevel}!`, 'skill', 4);
      let qualityText = "average"; if (finalHarvestQuality >= 90) qualityText = "exceptional"; else if (finalHarvestQuality >= 75) qualityText = "excellent"; else if (finalHarvestQuality >= 60) qualityText = "good"; else if (finalHarvestQuality < 40) qualityText = "poor";
      this.addJournal(`Harvested ${yieldAmount} ${plant.name} of ${qualityText} quality (${finalHarvestQuality}%) from plot ${slotId + 1}.`, 'garden', 3);
      (harvestInfo.bonusFactors || []).forEach(factor => this.addJournal(` - ${factor}`, 'garden', 1)); // Check bonusFactors exists
      slot.plant = null; slot.fertility = Math.max(30, (slot.fertility ?? 70) - (5 + Math.floor(plantData.growthTime / 2)));
      checkQuestStepCompletion(this.state, player, 'harvest', { plantName: plant.name, quality: finalHarvestQuality, quantity: yieldAmount, moonPhase: this.state.time.phaseName, season: this.state.time.season });
      return true;
 }


   brewPotion(playerId: string, ingredientInvItemIds: string[]): boolean {
      const player = this.state.players.find(p => p.id === playerId);
      if (!player || ingredientInvItemIds.length !== 2) return false;
      const invItem1 = findInventoryItemById(player, ingredientInvItemIds[0]); const invItem2 = findInventoryItemById(player, ingredientInvItemIds[1]);
      if (!invItem1 || !invItem2) { this.addJournal("Missing ingredients for brewing.", 'brewing', 1); return false; }
      if (invItem1.quantity < 1 || invItem2.quantity < 1) { this.addJournal("Not enough of the selected ingredients.", 'brewing', 1); return false; }
      const recipe = findMatchingRecipe(player, [invItem1, invItem2]);
      const ingredientQualities = [invItem1.quality ?? DEFAULT_ITEM_QUALITY, invItem2.quality ?? DEFAULT_ITEM_QUALITY];
      let brewOutcome: { success: boolean; resultItemName?: string; quality: number; bonusFactor?: string; quantityProduced?: number; };
      let recipeUsed: Recipe | undefined = recipe; let quantityProduced = 1;

      if (recipe) { brewOutcome = performBrewing(recipe, ingredientQualities, player, this.state.time.phaseName); }
      else {
          const discoveredRecipe = discoverRecipeSystem([invItem1, invItem2]);
          if (discoveredRecipe) {
              this.addJournal(`Discovery! You've figured out how to brew ${discoveredRecipe.name}!`, 'discovery', 5);
              player.knownRecipes.push(discoveredRecipe.id);
              const basicInfo: BasicRecipeInfo = { // Fixed TS2739 by adding properties
                   id: discoveredRecipe.id,
                   name: discoveredRecipe.name,
                   category: discoveredRecipe.category,
                   description: discoveredRecipe.description,
                   type: discoveredRecipe.type
              };
               if (!this.state.knownRecipes?.some(r => r.id === basicInfo.id)) this.state.knownRecipes = [...(this.state.knownRecipes || []), basicInfo];
              recipeUsed = discoveredRecipe;
              brewOutcome = performBrewing(discoveredRecipe, ingredientQualities, player, this.state.time.phaseName);
              const xpResult = addSkillXp(player, 'brewing', 1.0); if (xpResult.levelUp) this.addJournal(`${player.name}'s brewing skill increased to level ${xpResult.newLevel}!`, 'skill', 4);
          } else { brewOutcome = { success: false, quality: 0, resultItemName: "misc_ruined_brewage", quantityProduced: 0 }; }
      }
      quantityProduced = brewOutcome.quantityProduced || 1;
      const removed1 = removeItemFromInventoryById(player, invItem1.id, 1); const removed2 = removeItemFromInventoryById(player, invItem2.id, 1);
      if (!removed1 || !removed2) { this.addJournal("Critical error consuming ingredients during brewing!", 'error', 5); return false; }

      if (brewOutcome.success && brewOutcome.resultItemName) {
          const resultItemData = getItemData(brewOutcome.resultItemName);
          if (resultItemData) {
              addItemToInventory(player, resultItemData, quantityProduced, brewOutcome.quality, this.state.time.phaseName, this.state.time.season);
              const xpAmount = recipeUsed ? (0.5 + recipeUsed.difficulty * 0.1) : 0.3;
              const xpResult = addSkillXp(player, 'brewing', xpAmount); if (xpResult.levelUp) this.addJournal(`${player.name}'s brewing skill increased to level ${xpResult.newLevel}!`, 'skill', 4);
              let successMsg = `Successfully brewed ${resultItemData.name} (Q: ${brewOutcome.quality}%)`; if (quantityProduced > 1) successMsg += ` (x${quantityProduced}!)`; if (brewOutcome.bonusFactor && !brewOutcome.bonusFactor.includes('yield')) successMsg += `. ${brewOutcome.bonusFactor}`; this.addJournal(successMsg, 'brewing', 3);
              checkQuestStepCompletion(this.state, player, 'brew', { potionName: resultItemData.name, potionId: resultItemData.id, quality: brewOutcome.quality, moonPhase: this.state.time.phaseName, recipeId: recipeUsed?.id });
              return true;
          } else { this.addJournal(`Brewing succeeded, but the resulting potion (${brewOutcome.resultItemName}) is unknown!`, 'error', 4); return false; }
      } else {
          const ruinedItemData = getItemData("misc_ruined_brewage"); if (ruinedItemData) addItemToInventory(player, ruinedItemData, 1, 0);
          this.addJournal(`Brewing attempt failed. The mixture resulted in Ruined Brewage.`, 'brewing', 1);
          const xpResult = addSkillXp(player, 'brewing', 0.1); if (xpResult.levelUp) this.addJournal(`${player.name}'s brewing skill increased to level ${xpResult.newLevel}!`, 'skill', 4); return false;
      }
   }

  fulfillRequest(playerId: string, requestId: string): boolean {
      const player = this.state.players.find(p => p.id === playerId);
      if (!player) return false;
      const reqIndex = this.state.townRequests.findIndex(req => req.id === requestId);
      if (reqIndex === -1) return false;
      const request = this.state.townRequests[reqIndex];
      const removed = removeItemFromInventoryByName(player, request.item, request.quantity);
      if (!removed) { this.addJournal(`You don't have enough ${request.item} to fulfill ${request.requester}'s request.`, 'quest', 1); return false; }
      player.gold += request.rewardGold; player.reputation = Math.min(100, player.reputation + request.rewardInfluence);
      ensureMarketData(this.state, request.item); this.state.marketData.demand[request.item] = Math.max(10, (this.state.marketData.demand[request.item] ?? 50) - 10 * request.quantity); this.state.marketData.supply[request.item] = Math.min(95, (this.state.marketData.supply[request.item] ?? 50) + 5 * request.quantity);
      this.state.townRequests.splice(reqIndex, 1);
      const xpResult = addSkillXp(player, 'trading', 0.4 + request.difficulty * 0.1); if (xpResult.levelUp) this.addJournal(`${player.name}'s trading skill increased to level ${xpResult.newLevel}!`, 'skill', 4);
      player.questsCompleted = (player.questsCompleted || 0) + 1;
      this.addJournal(`Fulfilled ${request.requester}'s request for ${request.quantity} ${request.item}.`, 'quest', 4); this.addJournal(`Received ${request.rewardGold} gold and +${request.rewardInfluence} reputation.`, 'reward', 3);
      checkQuestStepCompletion(this.state, player, 'fulfillRequest', { requestId: request.id, itemName: request.item, quantity: request.quantity, requester: request.requester }); return true;
  }

  buyItem(playerId: string, itemId: string): boolean {
      const player = this.state.players.find(p => p.id === playerId);
      if (!player) return false;
      const marketItemIndex = this.state.market.findIndex(item => item.id === itemId);
      if (marketItemIndex === -1) return false;
      const marketItem = this.state.market[marketItemIndex]; const price = marketItem.price;
      if (player.gold < price) { this.addJournal(`Not enough gold to buy ${marketItem.name} (${price} G).`, 'market', 1); return false; }
      const itemBaseData = getItemData(marketItem.id);
      if (!itemBaseData) { this.addJournal(`Error purchasing ${marketItem.name} - item definition missing!`, 'error', 4); return false; }
      player.gold -= price; addItemToInventory(player, itemBaseData, 1, DEFAULT_ITEM_QUALITY);
      const xpResult = addSkillXp(player, 'trading', 0.2); if (xpResult.levelUp) this.addJournal(`${player.name}'s trading skill increased to level ${xpResult.newLevel}!`, 'skill', 4);
      this.addJournal(`Purchased 1 ${marketItem.name} for ${price} gold.`, 'market', 2);
      ensureMarketData(this.state, marketItem.name); this.state.marketData.demand[marketItem.name] = Math.min(100, (this.state.marketData.demand[marketItem.name] ?? 50) + 8); this.state.marketData.supply[marketItem.name] = Math.max(5, (this.state.marketData.supply[marketItem.name] ?? 50) - 5);
      marketItem.price = Math.round(marketItem.price * 1.02); marketItem.lastPriceChange = this.state.time.dayCount; this.state.marketData.tradingVolume += price;
      checkQuestStepCompletion(this.state, player, 'buyItem', { itemId: itemBaseData.id, itemName: itemBaseData.name, price: price, category: itemBaseData.category }); return true;
  }

  sellItem(playerId: string, inventoryItemId: string): boolean {
      const player = this.state.players.find(p => p.id === playerId);
      if (!player) return false;
      const invItem = findInventoryItemById(player, inventoryItemId);
      if (!invItem || invItem.quantity < 1) { this.addJournal("You don't have that specific item to sell.", 'market', 1); return false; }
      const marketItem = this.state.market.find(item => item.id === invItem.baseId);
      if (!marketItem) { this.addJournal(`${invItem.name} cannot be sold at the market right now.`, 'market', 1); return false; }
      const baseSellPrice = marketItem.price; const qualityMultiplier = 0.5 + ((invItem.quality ?? DEFAULT_ITEM_QUALITY) / 100) * 0.7;
      const sellPrice = Math.max(1, Math.round(baseSellPrice * qualityMultiplier));
      const removed = removeItemFromInventoryById(player, inventoryItemId, 1);
      if (!removed) { this.addJournal("Error selling item - inventory issue.", 'error', 4); return false; }
      player.gold += sellPrice;
      const xpResult = addSkillXp(player, 'trading', 0.3 + (sellPrice / 100)); if (xpResult.levelUp) this.addJournal(`${player.name}'s trading skill increased to level ${xpResult.newLevel}!`, 'skill', 4);
      this.addJournal(`Sold 1 ${invItem.name} (Q: ${invItem.quality ?? 'N/A'}%) for ${sellPrice} gold.`, 'market', 2);
      ensureMarketData(this.state, marketItem.name); this.state.marketData.supply[marketItem.name] = Math.min(95, (this.state.marketData.supply[marketItem.name] ?? 50) + 8); this.state.marketData.demand[marketItem.name] = Math.max(5, (this.state.marketData.demand[marketItem.name] ?? 50) - 4);
      marketItem.price = Math.max(1, Math.round(marketItem.price * 0.98)); marketItem.lastPriceChange = this.state.time.dayCount; this.state.marketData.tradingVolume += sellPrice;
      checkQuestStepCompletion(this.state, player, 'sellItem', { itemId: invItem.baseId, itemName: invItem.name, price: sellPrice, quality: invItem.quality, category: invItem.category }); return true;
  }

    // --- Ritual and Rumor Methods ---
    claimRitualReward(playerId: string, ritualId: string): boolean {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return false;
        return claimRitualRewardsSystem(this.state, player, ritualId);
    }
    spreadRumor(playerId: string, rumorId: string): boolean {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return false;
        return spreadRumorSystem(this.state, player, rumorId);
    }
    verifyRumor(playerId: string, rumorId: string): boolean {
        return verifyRumor(this.state, playerId, rumorId);
    }
    createCustomRumor(content: string, itemName: string, priceEffect: number, origin?: string, initialSpread?: number, duration?: number, verified?: boolean): boolean {
         const rumor = createCustomRumor(this.state, content, itemName, priceEffect, origin, initialSpread, duration, verified);
         return !!rumor;
    }

    // --- Turn Management & World Simulation ---
    endTurn(playerId: string): void {
        const playerIndex = this.state.players.findIndex(p => p.id === playerId);
        if (playerIndex !== this.state.currentPlayerIndex) return;
        const currentPlayer = this.state.players[playerIndex];
        if (!currentPlayer) return;
        currentPlayer.lastActive = this.state.time.dayCount;
        const nextPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
        this.state.currentPlayerIndex = nextPlayerIndex;
        if (nextPlayerIndex === 0) { this.advancePhase(); }
        else { const nextPlayer = this.state.players[nextPlayerIndex]; if (nextPlayer) { this.addJournal(`It is now ${nextPlayer.name}'s turn.`, 'event', 1); } }
    }
    advancePhase(): void {
        console.log(`[Engine] Advancing phase from Day ${this.state.time.dayCount}...`);
        this.state = processTurn(this.state);
        if (Math.random() < 0.4) { const newRequests = generateTownRequests(this.state); if (newRequests.length > 0) { const maxRequests = 5; const slotsAvailable = maxRequests - this.state.townRequests.length; if (slotsAvailable > 0) { this.state.townRequests.push(...newRequests.slice(0, slotsAvailable)); this.addJournal(`New town requests posted.`, 'quest', 3); } } }
        const newRumors = generateRumors(this.state); this.state.rumors.push(...newRumors); processRumorEffects(this.state);
        applyMarketEvents(this.state);
        progressRituals(this.state);
        console.log(`[Engine] Phase advanced to Day ${this.state.time.dayCount}: ${this.state.time.phaseName}, ${this.state.time.season} Y${this.state.time.year}, Weather: ${this.state.time.weatherFate}`);
    }

    // --- State Management ---
    getState(): GameState { return this.state; }
    saveGame(): string { try { this.state.time.lastSaved = Date.now(); const saveData = JSON.stringify(this.state); return saveData; } catch (error) { console.error("[Engine] Error saving game:", error); return ""; } }
    loadGame(saveData: string): boolean { try { const loadedState = JSON.parse(saveData) as GameState; if (!loadedState || !loadedState.version || !loadedState.players || !loadedState.time) throw new Error("Invalid save data structure."); if (loadedState.version !== this.state.version) console.warn(`[Engine] Loading save data from different version (${loadedState.version}). Current: ${this.state.version}.`); this.state = loadedState; this.addJournal(`Game loaded from save.`, 'event', 5); return true; } catch (error) { console.error("[Engine] Error loading game:", error); this.addJournal(`Failed to load save data. Error: ${(error as Error).message}`, 'error', 5); return false; } }

    // --- Debug Methods ---
   debugGiveItem(playerId: string, itemName: string, quantity: number = 1, quality: number = 70): void {
       const player = this.state.players.find(p => p.id === playerId);
       const itemData = getItemData(itemName);
       if (player && itemData) { addItemToInventory(player, itemData, quantity, quality); this.addJournal(`[DEBUG] Gave ${quantity}x ${itemName} (Q${quality}) to ${player.name}.`, 'debug', 1); }
       else { this.addJournal(`[DEBUG] Failed to give item ${itemName} to ${playerId}. Player or item not found.`, 'debug', 1); }
   }
   debugAddSkillXp(playerId: string, skillName: keyof Skills, amount: number): void {
        const player = this.state.players.find(p => p.id === playerId);
        if (player && player.skills.hasOwnProperty(skillName)) {
            const xpResult = addSkillXp(player, skillName, amount);
            this.addJournal(`[DEBUG] Added ${amount} XP to ${String(skillName)} for ${player.name}. New value: ${player.skills[skillName].toFixed(2)}`, 'debug', 1);
            if (xpResult.levelUp) this.addJournal(`[DEBUG] ${player.name}'s ${String(skillName)} skill increased to level ${xpResult.newLevel}!`, 'debug', 1);
        } else {
             this.addJournal(`[DEBUG] Failed to add XP for ${String(skillName)} to ${playerId}. Player or skill not found.`, 'debug', 1);
        }
   }
   debugAddGold(playerId: string, amount: number): void {
        const player = this.state.players.find(p => p.id === playerId);
        if (player) { player.gold += amount; this.addJournal(`[DEBUG] Added ${amount} gold to ${player.name}. New total: ${player.gold}`, 'debug', 1); }
        else { this.addJournal(`[DEBUG] Failed to add gold to ${playerId}. Player not found.`, 'debug', 1); }
   }
    debugSetMoonPhase(phaseName: MoonPhase): void {
        const phaseIndex = MoonPhases.indexOf(phaseName);
        if (phaseIndex !== -1) { this.state.time.phase = phaseIndex; this.state.time.phaseName = phaseName; this.addJournal(`[DEBUG] Moon phase set to ${phaseName}.`, 'debug', 1); }
        else { this.addJournal(`[DEBUG] Failed to set invalid moon phase: ${phaseName}.`, 'debug', 1); }
    }
    debugSetSeason(season: Season): void {
        if (Seasons.includes(season)) { this.state.time.season = season; this.addJournal(`[DEBUG] Season set to ${season}.`, 'debug', 1); }
        else { this.addJournal(`[DEBUG] Failed to set invalid season: ${season}.`, 'debug', 1); }
    }

} // End GameEngine Class