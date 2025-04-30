// src/gameHandler.ts
// Manages the GameEngine instance and provides methods for the server to call

import { GameEngine } from "./gameEngine.js";
import {
    GameState, MoonPhase, Season, Skills
} from "coven-shared";

// Removed unused imports

// GameHandler: Connects the server's API endpoints to the game engine
export class GameHandler {
    private engine: GameEngine;

    constructor() {
        this.engine = new GameEngine();
        console.log("GameHandler initialized.");
    }

    // Core methods
    getState(): GameState { return this.engine.getState(); }
    plantSeed(playerId: string, slotId: number, seedInventoryItemId: string): GameState { console.log(`[GameHandler] Plant action: P:${playerId}, Slot:${slotId}, SeedInvID:${seedInventoryItemId}`); this.engine.plantSeed(playerId, slotId, seedInventoryItemId); return this.engine.getState(); }
    waterPlants(playerId: string, success: boolean = true): GameState { console.log(`[GameHandler] Water action: P:${playerId}, Success:${success}`); this.engine.waterPlants(playerId); return this.engine.getState(); } // Removed success param passing as engine doesn't use it
    harvestPlant(playerId: string, slotId: number): GameState { console.log(`[GameHandler] Harvest action: P:${playerId}, Slot:${slotId}`); this.engine.harvestPlant(playerId, slotId); return this.engine.getState(); }
    brewPotion(playerId: string, ingredientInvItemIds: string[]): GameState { console.log(`[GameHandler] Brew action: P:${playerId}, InvItemIDs:${ingredientInvItemIds.join(', ')}`); if (ingredientInvItemIds.length !== 2) { console.warn("[GameHandler] Brew requires exactly 2 ingredient IDs."); return this.engine.getState(); } this.engine.brewPotion(playerId, ingredientInvItemIds); return this.engine.getState(); }
    claimRitualReward(playerId: string, ritualId: string): GameState { console.log(`[GameHandler] Claim Ritual action: P:${playerId}, Ritual:${ritualId}`); const success = this.engine.claimRitualReward(playerId, ritualId); if (!success) console.warn(`[GameHandler] Failed to claim reward for ritual ${ritualId} for player ${playerId}.`); return this.engine.getState(); }
    buyItem(playerId: string, itemId: string): GameState { console.log(`[GameHandler] Buy action: P:${playerId}, ItemID:${itemId}`); this.engine.buyItem(playerId, itemId); return this.engine.getState(); }
    sellItem(playerId: string, inventoryItemId: string): GameState { console.log(`[GameHandler] Sell action: P:${playerId}, InvItemID:${inventoryItemId}`); this.engine.sellItem(playerId, inventoryItemId); return this.engine.getState(); }
    fulfillRequest(playerId: string, requestId: string): GameState { console.log(`[GameHandler] Fulfill Request action: P:${playerId}, ReqID:${requestId}`); this.engine.fulfillRequest(playerId, requestId); return this.engine.getState(); }
    spreadRumor(playerId: string, rumorId: string): GameState { console.log(`[GameHandler] Spread Rumor action: P:${playerId}, RumorID:${rumorId}`); const success = this.engine.spreadRumor(playerId, rumorId); if (!success) console.warn(`[GameHandler] Failed to spread rumor ${rumorId} for player ${playerId}.`); return this.engine.getState(); }
    endTurn(playerId: string): GameState { console.log(`[GameHandler] End Turn action: P:${playerId}`); this.engine.endTurn(playerId); return this.engine.getState(); }
    saveGame(): string { console.log("[GameHandler] Saving game..."); return this.engine.saveGame(); }
    loadGame(saveData: string): boolean { console.log("[GameHandler] Loading game..."); const success = this.engine.loadGame(saveData); if (success) console.log("[GameHandler] Game loaded successfully."); else console.error("[GameHandler] Failed to load game."); return success; }

    // Debug methods
    debugSetMoonPhase(phaseName: MoonPhase): GameState { console.log(`[DEBUG] Setting Moon Phase to ${phaseName}`); this.engine.debugSetMoonPhase(phaseName); return this.engine.getState(); }
    debugSetSeason(season: Season): GameState { console.log(`[DEBUG] Setting Season to ${season}`); this.engine.debugSetSeason(season); return this.engine.getState(); }
    debugGiveItem(playerId: string, itemName: string, quantity: number = 1, quality: number = 70): GameState { console.log(`[DEBUG] Giving ${quantity}x ${itemName} (Q${quality}) to ${playerId}`); this.engine.debugGiveItem(playerId, itemName, quantity, quality); return this.engine.getState(); }
    debugAddSkillXp(playerId: string, skillName: keyof Skills, amount: number): GameState {
        // Correctly use String() for template literal
        console.log(`[DEBUG] Adding ${amount} XP to ${String(skillName)} for ${playerId}`);
        this.engine.debugAddSkillXp(playerId, skillName, amount); // Delegate
        return this.engine.getState();
    }
    debugAddGold(playerId: string, amount: number): GameState { console.log(`[DEBUG] Adding ${amount} gold to ${playerId}`); this.engine.debugAddGold(playerId, amount); return this.engine.getState(); }
    debugAdvancePhase(): GameState { console.log(`[DEBUG] Advancing game phase...`); this.engine.advancePhase(); return this.engine.getState(); }

}