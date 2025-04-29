// src/gameHandler.ts
// Manages the GameEngine instance and provides methods for the server to call

import { GameEngine } from "./gameEngine.js";
import {
  GameState, MoonPhase, Season, RitualQuest,
  MarketItem, Player, JournalEntry
} from "coven-shared"; // Use shared package

import { createCustomRumor, spreadRumor } from "./rumorEngine.js";
import { checkQuestStepCompletion, claimRitualRewards } from "./questSystem.js"; // Removed addRitualQuest as it's handled in engine init

// GameHandler: Connects the server's API endpoints to the game engine
export class GameHandler {
  private engine: GameEngine; // Make engine private

  constructor() {
    this.engine = new GameEngine();
    console.log("GameHandler initialized.");
  }

  // Core methods

  // Get current game state
  getState(): GameState {
    return this.engine.getState();
    }
  }

  // Garden actions

  // Plant a seed in a garden slot
  plantSeed(playerId: string, slotId: number, seedName: string): GameState {
    console.log(`[GameHandler] Plant action: P:${playerId}, Slot:${slotId}, Seed:${seedName}`);
    const success = this.engine.plantSeed(playerId, slotId, seedName);
    // Quest check is now inside engine.plantSeed
    return this.engine.getState();
  }

  // Water plants in garden
  waterPlants(playerId: string, success: boolean): GameState {
    console.log(`[GameHandler] Water action: P:${playerId}, Success:${success}`);
    this.engine.waterPlants(playerId, success);
     // Quest check could be added inside engine.waterPlants if needed
    return this.engine.getState();
  }

  // Harvest a mature plant
  harvestPlant(playerId: string, slotId: number): GameState {
    console.log(`[GameHandler] Harvest action: P:${playerId}, Slot:${slotId}`);
    const success = this.engine.harvestPlant(playerId, slotId);
    // Quest check is now inside engine.harvestPlant
    return this.engine.getState();
  }

  // Brewing actions

  // Brew a potion from ingredients
  brewPotion(playerId: string, ingredientNames: [string, string]): GameState {
    console.log(`[GameHandler] Brew action: P:${playerId}, Ings:${ingredientNames.join(', ')}`);
    const success = this.engine.brewPotion(playerId, ingredientNames);
    // Quest check is now inside engine.brewPotion
    return this.engine.getState();
  }

  // Ritual quest actions - simplified as checks happen within engine actions

  // Claim rewards from a completed ritual
  claimRitualReward(playerId: string, ritualId: string): GameState {
    console.log(`[GameHandler] Claim Ritual action: P:${playerId}, Ritual:${ritualId}`);
    const player = this.engine.state.players.find(p => p.id === playerId);
    if (!player) {
        console.error(`[GameHandler] Player not found: ${playerId}`);
        return this.engine.getState();
    }
    claimRitualRewards(this.engine.state, player, ritualId); // Use helper directly
    return this.engine.getState();
  }

  // Market actions

  // Buy an item from the market
  buyItem(playerId: string, itemId: string): GameState {
    console.log(`[GameHandler] Buy action: P:${playerId}, Item:${itemId}`);
    this.engine.buyItem(playerId, itemId);
    // Quest check is now inside engine.buyItem
    return this.engine.getState();
  }

  // Sell an item to the market
  // IMPORTANT: Frontend needs to send the INVENTORY item ID here
  sellItem(playerId: string, inventoryItemId: string): GameState {
     console.log(`[GameHandler] Sell action: P:${playerId}, InvItem ID:${inventoryItemId}`);
     // engine.sellItem now needs the inventory item ID to know *which* instance to sell
     // and get its quality.
     this.engine.sellItem(playerId, inventoryItemId);
     // Quest check is now inside engine.sellItem
     return this.engine.getState();
  }

  // Town request actions

  // Fulfill a town request
  fulfillRequest(playerId: string, requestId: string): GameState {
    console.log(`[GameHandler] Fulfill Request action: P:${playerId}, ReqID:${requestId}`);
    this.engine.fulfillRequest(playerId, requestId);
    // Quest check is now inside engine.fulfillRequest
    return this.engine.getState();
  }

  // Rumor system actions

// Inside spreadRumor function in gameHandler.ts (Corrected)
spreadRumor(playerId: string, rumorId: string): GameState {
  console.log(`[GameHandler] Spread Rumor action: P:${playerId}, RumorID:${rumorId}`);
  const success = spreadRumor(this.engine.state, playerId, rumorId); // Use helper directly

  const player = this.engine.state.players.find(p => p.id === playerId); // Find player *once*

  if (success) {
      this.engine.addJournal(`${player?.name || playerId} attempted to spread rumor ${rumorId}.`, 'market', 2);
      // Quest check for spreading rumors
      if (player) { // Check if player was found before using it
          // Pass the correct state object and details
          checkQuestStepCompletion(this.engine.state, player, 'spreadRumor', { rumorId: rumorId });
      } else {
           console.warn(`[GameHandler] Player ${playerId} not found for quest check after spreading rumor.`);
      }
  } else {
      this.engine.addJournal(`Failed to spread rumor ${rumorId}.`, 'market', 1);
  }
  return this.engine.getState();
}