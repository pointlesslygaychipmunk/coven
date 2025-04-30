// src/gameHandler.ts
// Manages the GameEngine instance and provides methods for the server to call

import { GameEngine } from "./gameEngine.js";
// Use package name import
import { GameState, MoonPhase, Season, Skills } from "coven-shared";

// GameHandler: Connects the server's API endpoints to the game engine
export class GameHandler {
    private engine: GameEngine;

    constructor() {
        this.engine = new GameEngine();
        console.log("GameHandler initialized.");
    }

    // Core methods
    getState(): GameState { return this.engine.getState(); }
    plantSeed(playerId: string, slotId: number, seedInventoryItemId: string): GameState { this.engine.plantSeed(playerId, slotId, seedInventoryItemId); return this.engine.getState(); }
    waterPlants(playerId: string): GameState { this.engine.waterPlants(playerId); return this.engine.getState(); }
    harvestPlant(playerId: string, slotId: number): GameState { this.engine.harvestPlant(playerId, slotId); return this.engine.getState(); }
    brewPotion(playerId: string, ingredientInvItemIds: string[]): GameState { if (ingredientInvItemIds.length !== 2) { console.warn("[GH] Brew needs 2 ingredients."); return this.engine.getState(); } this.engine.brewPotion(playerId, ingredientInvItemIds); return this.engine.getState(); }
    claimRitualReward(playerId: string, ritualId: string): GameState { const success = this.engine.claimRitualReward(playerId, ritualId); if (!success) console.warn(`[GH] Failed claim reward ${ritualId}`); return this.engine.getState(); }
    buyItem(playerId: string, itemId: string): GameState { this.engine.buyItem(playerId, itemId); return this.engine.getState(); }
    sellItem(playerId: string, inventoryItemId: string): GameState { this.engine.sellItem(playerId, inventoryItemId); return this.engine.getState(); }
    fulfillRequest(playerId: string, requestId: string): GameState { this.engine.fulfillRequest(playerId, requestId); return this.engine.getState(); }
    spreadRumor(playerId: string, rumorId: string): GameState { const success = this.engine.spreadRumor(playerId, rumorId); if (!success) console.warn(`[GH] Failed spread rumor ${rumorId}`); return this.engine.getState(); }
    endTurn(playerId: string): GameState { this.engine.endTurn(playerId); return this.engine.getState(); }
    saveGame(): string { return this.engine.saveGame(); }
    loadGame(saveData: string): boolean { return this.engine.loadGame(saveData); }

    // Debug methods
    debugSetMoonPhase(phaseName: MoonPhase): GameState { this.engine.debugSetMoonPhase(phaseName); return this.engine.getState(); }
    debugSetSeason(season: Season): GameState { this.engine.debugSetSeason(season); return this.engine.getState(); }
    debugGiveItem(playerId: string, itemName: string, quantity: number = 1, quality: number = 70): GameState { this.engine.debugGiveItem(playerId, itemName, quantity, quality); return this.engine.getState(); }
    debugAddSkillXp(playerId: string, skillName: keyof Skills, amount: number): GameState {
        console.log(`[DBG] Adding ${amount} XP to ${String(skillName)} for ${playerId}`); // Use String()
        this.engine.debugAddSkillXp(playerId, skillName, amount);
        return this.engine.getState();
    }
    debugAddGold(playerId: string, amount: number): GameState { this.engine.debugAddGold(playerId, amount); return this.engine.getState(); }
    debugAdvancePhase(): GameState { this.engine.advancePhase(); return this.engine.getState(); }
}