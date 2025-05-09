// src/gameHandler.ts
// Manages the GameEngine instance and provides methods for the server to call

// FIXED: Import GameEngine class correctly
import { GameEngine } from "./gameEngine.js";
import { GameState, MoonPhase, Season, Skills } from "coven-shared";
import { CardPosition } from "coven-shared";

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
    waterPlants(playerId: string, puzzleBonus: number = 0): GameState { this.engine.waterPlants(playerId, puzzleBonus); return this.engine.getState(); }
    harvestPlant(playerId: string, slotId: number): GameState { this.engine.harvestPlant(playerId, slotId); return this.engine.getState(); }
    brewPotion(playerId: string, ingredientInvItemIds: string[], puzzleBonus: number = 0): GameState {
        if (ingredientInvItemIds.length !== 2) { console.warn("[GH] Brew needs 2 ingredients."); return this.engine.getState(); }
        this.engine.brewPotion(playerId, ingredientInvItemIds, puzzleBonus);
        return this.engine.getState();
    }
    claimRitualReward(playerId: string, ritualId: string): GameState { const success = this.engine.claimRitualReward(playerId, ritualId); if (!success) console.warn(`[GH] Failed claim reward ${ritualId}`); return this.engine.getState(); }
    buyItem(playerId: string, itemId: string): GameState { this.engine.buyItem(playerId, itemId); return this.engine.getState(); }
    sellItem(playerId: string, inventoryItemId: string): GameState { this.engine.sellItem(playerId, inventoryItemId); return this.engine.getState(); }
    fulfillRequest(playerId: string, requestId: string): GameState { this.engine.fulfillRequest(playerId, requestId); return this.engine.getState(); }
    spreadRumor(playerId: string, rumorId: string): GameState { const success = this.engine.spreadRumor(playerId, rumorId); if (!success) console.warn(`[GH] Failed spread rumor ${rumorId}`); return this.engine.getState(); }
    endTurn(playerId: string): GameState { this.engine.endTurn(playerId); return this.engine.getState(); }
    saveGame(): string { return this.engine.saveGame(); }
    loadGame(saveData: string): boolean { return this.engine.loadGame(saveData); }
    
    // Ritual system methods
    performRitual(
        playerId: string, 
        ritualId: string, 
        cardPlacements: Record<CardPosition, string | null>
    ): {
        success: boolean;
        power: number;
        successChance: number;
        effects?: Record<string, any>;
        message: string;
        state: GameState;
    } {
        const result = this.engine.performRitual(playerId, ritualId, cardPlacements);
        return {
            ...result,
            state: this.engine.getState()
        };
    }
    
    claimRitualRewards(playerId: string, ritualId: string, ritualPower: number): GameState {
        const success = this.engine.claimRitualRewards(playerId, ritualId, ritualPower);
        if (!success) console.warn(`[GH] Failed to claim ritual rewards for ${ritualId}`);
        return this.engine.getState();
    }

    // Debug methods
    debugSetMoonPhase(phaseName: MoonPhase): GameState { this.engine.debugSetMoonPhase(phaseName); return this.engine.getState(); }
    debugSetSeason(season: Season): GameState { this.engine.debugSetSeason(season); return this.engine.getState(); }
    debugGiveItem(playerId: string, itemName: string, quantity: number = 1, quality: number = 70): GameState { this.engine.debugGiveItem(playerId, itemName, quantity, quality); return this.engine.getState(); }
    debugAddSkillXp(playerId: string, skillName: keyof Skills, amount: number): GameState {
        console.log(`[DBG] Adding ${amount} XP to ${String(skillName)} for ${playerId}`);
        this.engine.debugAddSkillXp(playerId, skillName, amount);
        return this.engine.getState();
    }
    debugAddGold(playerId: string, amount: number): GameState { this.engine.debugAddGold(playerId, amount); return this.engine.getState(); }
    debugAdvancePhase(): GameState { this.engine.advancePhase(); return this.engine.getState(); }
}