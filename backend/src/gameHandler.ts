// src/gameHandler.ts
// Manages the GameEngine instance and provides methods for the server to call

import { GameEngine } from "./gameEngine.js";
import {
    GameState, MoonPhase, Season, RitualQuest,
    MarketItem, Player, JournalEntry, Skills // Added Skills
} from "coven-shared"; // Use shared package

import { createCustomRumor, spreadRumor } from "./rumorEngine.js";
// Note: checkQuestStepCompletion and claimRitualRewards are now likely called *within* gameEngine actions
// If you need direct access here, re-import them. For now, assuming engine handles it.
import { checkQuestStepCompletion, claimRitualRewards } from "./questSystem.js";
import { getSpecialization } from './atelier.js'; // Import needed for potentially displaying spec name
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

    // --- Garden actions ---

    // Plant a seed in a garden slot
    plantSeed(playerId: string, slotId: number, seedInventoryItemId: string): GameState { // Changed param name to Inventory Item ID
        console.log(`[GameHandler] Plant action: P:${playerId}, Slot:${slotId}, SeedInvID:${seedInventoryItemId}`);
        this.engine.plantSeed(playerId, slotId, seedInventoryItemId); // Call engine method
        return this.engine.getState();
    }

    // Water plants in garden
    waterPlants(playerId: string, success: boolean = true): GameState { // Default success to true
        console.log(`[GameHandler] Water action: P:${playerId}, Success:${success}`);
        this.engine.waterPlants(playerId, success); // Call engine method
        return this.engine.getState();
    }

    // Harvest a mature plant
    harvestPlant(playerId: string, slotId: number): GameState {
        console.log(`[GameHandler] Harvest action: P:${playerId}, Slot:${slotId}`);
        this.engine.harvestPlant(playerId, slotId); // Call engine method
        return this.engine.getState();
    }

    // --- Brewing actions ---

    // Brew a potion from ingredients
    brewPotion(playerId: string, ingredientInvItemIds: string[]): GameState { // Expect inventory IDs
        console.log(`[GameHandler] Brew action: P:${playerId}, InvItemIDs:${ingredientInvItemIds.join(', ')}`);
        if (ingredientInvItemIds.length !== 2) {
            console.warn("[GameHandler] Brew requires exactly 2 ingredient IDs.");
            // Optionally add a journal entry about needing 2 ingredients
            return this.engine.getState(); // Return current state without brewing
        }
        this.engine.brewPotion(playerId, ingredientInvItemIds); // Call engine method
        return this.engine.getState();
    }

    // --- Ritual quest actions ---

    // Claim rewards from a completed ritual
    claimRitualReward(playerId: string, ritualId: string): GameState {
        console.log(`[GameHandler] Claim Ritual action: P:${playerId}, Ritual:${ritualId}`);
        // Direct call to engine's claim method (or keep helper if preferred)
        const success = this.engine.claimRitualReward(playerId, ritualId);
        if (!success) {
            console.warn(`[GameHandler] Failed to claim reward for ritual ${ritualId} for player ${playerId}.`);
        }
        return this.engine.getState();
    }

    // --- Market actions ---

    // Buy an item from the market
    buyItem(playerId: string, itemId: string): GameState { // itemId is MarketItem ID
        console.log(`[GameHandler] Buy action: P:${playerId}, ItemID:${itemId}`);
        this.engine.buyItem(playerId, itemId); // Call engine method
        return this.engine.getState();
    }

    // Sell an item to the market
    sellItem(playerId: string, inventoryItemId: string): GameState { // Expect inventory item ID
        console.log(`[GameHandler] Sell action: P:${playerId}, InvItemID:${inventoryItemId}`);
        this.engine.sellItem(playerId, inventoryItemId); // Call engine method
        return this.engine.getState();
    }

    // --- Town request actions ---

    // Fulfill a town request
    fulfillRequest(playerId: string, requestId: string): GameState {
        console.log(`[GameHandler] Fulfill Request action: P:${playerId}, ReqID:${requestId}`);
        this.engine.fulfillRequest(playerId, requestId); // Call engine method
        return this.engine.getState();
    }

    // --- Rumor system actions ---

    // Spread a rumor to increase its effect
    spreadRumor(playerId: string, rumorId: string): GameState {
        console.log(`[GameHandler] Spread Rumor action: P:${playerId}, RumorID:${rumorId}`);
        // Call engine's method or helper function
        const success = this.engine.spreadRumor(playerId, rumorId); // Assuming engine has this method
        if (!success) {
             console.warn(`[GameHandler] Failed to spread rumor ${rumorId} for player ${playerId}.`);
        }
        return this.engine.getState();
    }

    // Create a new rumor (Maybe called internally by engine?)
    // createRumor(...) remains internal for now unless an API endpoint is added

    // --- Game turn management ---

    // End the current player's turn
    endTurn(playerId: string): GameState {
        console.log(`[GameHandler] End Turn action: P:${playerId}`);
        this.engine.endTurn(playerId); // Call engine method
        return this.engine.getState();
    }

    // --- Save/Load game ---

    // Save the current game state
    saveGame(): string {
        console.log("[GameHandler] Saving game...");
        return this.engine.saveGame();
    }

    // Load a saved game state
    loadGame(saveData: string): boolean {
        console.log("[GameHandler] Loading game...");
        const success = this.engine.loadGame(saveData);
        if (success) console.log("[GameHandler] Game loaded successfully.");
        else console.error("[GameHandler] Failed to load game.");
        return success;
    }

    // --- Debug/Admin methods (Keep internal or protect if needed) ---

    debugSetMoonPhase(phaseName: MoonPhase): GameState { // Use MoonPhase type
        console.log(`[DEBUG] Setting Moon Phase to ${phaseName}`);
        this.engine.debugSetMoonPhase(phaseName); // Delegate
        return this.engine.getState();
    }

    debugSetSeason(season: Season): GameState { // Use Season type
        console.log(`[DEBUG] Setting Season to ${season}`);
        this.engine.debugSetSeason(season); // Delegate
        return this.engine.getState();
    }

    debugGiveItem(playerId: string, itemName: string, quantity: number = 1, quality: number = 70): GameState {
        console.log(`[DEBUG] Giving ${quantity}x ${itemName} (Q${quality}) to ${playerId}`);
        this.engine.debugGiveItem(playerId, itemName, quantity, quality); // Delegate
        return this.engine.getState();
    }

    debugAddSkillXp(playerId: string, skillName: keyof Skills, amount: number): GameState {
        console.log(`[DEBUG] Adding ${amount} XP to ${skillName} for ${playerId}`);
        this.engine.debugAddSkillXp(playerId, skillName, amount); // Delegate
        return this.engine.getState();
    }

    debugAddGold(playerId: string, amount: number): GameState {
        console.log(`[DEBUG] Adding ${amount} gold to ${playerId}`);
        this.engine.debugAddGold(playerId, amount); // Delegate
        return this.engine.getState();
    }

    debugAdvancePhase(): GameState {
        console.log(`[DEBUG] Advancing game phase...`);
        this.engine.advancePhase(); // Call engine's method (might need to make it public or have a debug wrapper)
        return this.engine.getState();
    }

} // Make sure this closing brace for the GameHandler class exists and is correctly placed.