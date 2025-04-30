// src/questSystem.ts
// Manages ritual quest progression and completion

import {
    GameState, RitualQuest, Player, BasicRecipeInfo, JournalEntry,
    RitualQuestStep, RitualReward
} from "coven-shared";
import { getItemData } from "./items.js";
import { getRecipeById } from './brewing.js';
import { addItemToInventory, addSkillXp } from "./gameEngine.js";

// Define the master list of available ritual quests
export const RITUAL_QUESTS: RitualQuest[] = [
    { id: "essence_mastery_1", name: "Essence Initiate", description: "Begin your journey into essence extraction.", stepsCompleted: 0, totalSteps: 2, steps: [ { description: "Brew a Moon Glow Serum", completed: false }, { description: "Harvest 3 Moonbuds", completed: false } ], rewards: [ { type: 'skill', value: 'brewing', quantity: 0.5 } ], unlocked: true, initiallyAvailable: true, },
    { id: "essence_mastery_2", name: "Lunar Distillation", description: "Master brewing under the Full Moon's light.", stepsCompleted: 0, totalSteps: 2, steps: [ { description: "Brew a Moon Glow Serum during the Full Moon", completed: false }, { description: "Brew a Radiant Moon Mask with ingredients of 80+ quality", completed: false } ], rewards: [ { type: 'skill', value: 'brewing', quantity: 1 }, { type: 'item', value: 'ritual_moonstone', quantity: 1 } ], unlocked: false, },
    { id: "spring_awakening", name: "Spring Awakening Ritual", description: "Harness the revitalizing energy of spring.", stepsCompleted: 0, totalSteps: 3, steps: [ { description: "Plant 3 different seeds during Spring", completed: false }, { description: "Harvest a Glimmerroot with 80+ quality", completed: false }, { description: "Craft a Spring Revival Tonic", completed: false } ], rewards: [ { type: 'skill', value: 'gardening', quantity: 1 }, { type: 'item', value: 'ing_spring_root', quantity: 2 } ], requiredSeason: "Spring", unlocked: false, },
];

// Helper function to add a quest-related journal entry
function addQuestJournalEntry(state: GameState, text: string, importance: number = 3): void {
    const entry: JournalEntry = { id: `j-${state.time.dayCount}-${state.journal.length}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: text, category: 'ritual', importance: importance, readByPlayer: false };
    state.journal.push(entry); if (state.journal.length > 150) state.journal.shift();
}

// Add a new ritual quest to the game state
export function unlockRitualQuest(state: GameState, questId: string): boolean {
    const questTemplate = RITUAL_QUESTS.find(q => q.id === questId);
    if (!questTemplate || state.rituals.some((r: RitualQuest) => r.id === questId)) return false; // Added type
    const newQuest: RitualQuest = JSON.parse(JSON.stringify(questTemplate));
    newQuest.unlocked = true; newQuest.stepsCompleted = 0; newQuest.steps.forEach((step: RitualQuestStep) => step.completed = false); // Added type
    state.rituals.push(newQuest); addQuestJournalEntry(state, `New ritual available: "${newQuest.name}"`, 4);
    console.log(`[QuestSystem] Unlocked: ${questId}`); return true;
}

// Check quest completion conditions based on player actions
export function checkQuestStepCompletion( state: GameState, player: Player, actionType: string, actionDetails: any ): void {
    const activeRituals = state.rituals.filter((ritual: RitualQuest) => ritual.unlocked && !player.completedRituals.includes(ritual.id) && ritual.stepsCompleted < ritual.totalSteps ); // Added type
    if (activeRituals.length === 0) return; const currentPhase = state.time.phaseName; const currentSeason = state.time.season;
    activeRituals.forEach((ritual: RitualQuest) => { // Added type
        if (ritual.requiredSeason && ritual.requiredSeason !== currentSeason) return; if (ritual.requiredMoonPhase && ritual.requiredMoonPhase !== currentPhase) return;
        const currentStepIndex = ritual.stepsCompleted; if (currentStepIndex >= ritual.steps.length) return;
        const step = ritual.steps[currentStepIndex]; if (step.completed) return; let stepCompleted = false;
        switch (step.description) {
            case "Brew a Moon Glow Serum": stepCompleted = (actionType === 'brew' && actionDetails.potionName === "Moon Glow Serum"); break;
            case "Brew a Moon Glow Serum during the Full Moon": stepCompleted = (actionType === 'brew' && actionDetails.potionName === "Moon Glow Serum" && currentPhase === "Full Moon"); break;
            case "Brew a Radiant Moon Mask with ingredients of 80+ quality": stepCompleted = (actionType === 'brew' && actionDetails.potionName === "Radiant Moon Mask" && actionDetails.quality >= 80); break;
            case "Craft a Spring Revival Tonic": stepCompleted = (actionType === 'brew' && actionDetails.potionName === "Spring Revival Tonic"); break;
            case "Harvest 3 Moonbuds": if (actionType === 'harvest' && actionDetails.plantName === "Moonbud") { if (!step.progress) step.progress = 0; step.progress++; if (step.progress >= 3) stepCompleted = true; else addQuestJournalEntry(state, `Harvested Moonbud (${step.progress}/3).`, 2); } break;
            case "Harvest a Glimmerroot with 80+ quality": stepCompleted = (actionType === 'harvest' && actionDetails.plantName === "Glimmerroot" && actionDetails.quality >= 80); break;
            case "Plant 3 different seeds during Spring": if (actionType === 'plant' && currentSeason === "Spring") { console.warn("[Quest] Step needs tracking."); } break;
            default: break;
        }
        if (stepCompleted) { step.completed = true; step.completedDate = `${currentPhase}, ${currentSeason} Y${state.time.year}`; ritual.stepsCompleted++; addQuestJournalEntry(state, `Ritual progress: "${ritual.name}" step completed!`, 4); if (ritual.stepsCompleted >= ritual.totalSteps) addQuestJournalEntry(state, `Ritual complete: "${ritual.name}"!`, 5); }
    });
}

// Unlock seasonal rituals
function unlockSeasonalRituals(state: GameState): void {
    const currentSeason = state.time.season;
    RITUAL_QUESTS.forEach(questTemplate => {
        if (questTemplate.requiredSeason === currentSeason && !state.rituals.some((r: RitualQuest) => r.id === questTemplate.id)) { // Added type
            unlockRitualQuest(state, questTemplate.id);
        }
    });
}

// Process any rituals that progress passively or are triggered by time/world state
export function progressRituals(state: GameState): void { unlockSeasonalRituals(state); }

// Helper function to check if a player has completed a ritual
export const isRitualClaimed = (player: Player, ritualId: string): boolean => player.completedRituals.includes(ritualId);

// Function to claim rewards
export function claimRitualRewards(state: GameState, player: Player, ritualId: string): boolean {
    const ritualIndex = state.rituals.findIndex((r: RitualQuest) => r.id === ritualId); if (ritualIndex === -1) return false; // Added type
    const ritual = state.rituals[ritualIndex]; if (ritual.stepsCompleted < ritual.totalSteps) { addQuestJournalEntry(state, `Cannot claim rewards yet.`, 2); return false; } if (isRitualClaimed(player, ritualId)) { addQuestJournalEntry(state, `Already claimed rewards.`, 1); return false; }
    player.completedRituals.push(ritualId); addQuestJournalEntry(state, `Rewards claimed for "${ritual.name}"!`, 5);
    ritual.rewards.forEach((reward: RitualReward) => { // Added type
        try { switch (reward.type) {
            case 'gold': player.gold += Number(reward.value); addQuestJournalEntry(state, `Received ${reward.value} gold.`); break;
            case 'item': const itemBaseId = String(reward.value); const itemData = getItemData(itemBaseId); if (itemData) { const quantity = reward.quantity ?? 1; addItemToInventory(player, itemData, quantity, 95); addQuestJournalEntry(state, `Received ${quantity}x ${itemData.name}.`); } else { addQuestJournalEntry(state, `Reward item ${itemBaseId} not found.`, 1); } break;
            case 'skill': const skillName = String(reward.value); const skillAmount = reward.quantity ?? 1; if (player.skills.hasOwnProperty(skillName)) { const xpResult = addSkillXp(player, skillName as keyof Player['skills'], skillAmount); addQuestJournalEntry(state, `${skillName.charAt(0).toUpperCase() + skillName.slice(1)} skill increased.`); if (xpResult.levelUp) { addQuestJournalEntry(state, `${player.name}'s ${String(skillName)} reached level ${xpResult.newLevel}!`, 4); } } break; // Fixed Arity
            case 'reputation': const repAmount = Number(reward.value); player.reputation = Math.min(100, player.reputation + repAmount); addQuestJournalEntry(state, `Gained ${repAmount} reputation.`); break;
            case 'recipe': const recipeId = String(reward.value); if (!player.knownRecipes.includes(recipeId)) { player.knownRecipes.push(recipeId); const recipeData = getRecipeById(recipeId); addQuestJournalEntry(state, `Learned recipe: ${recipeData?.name || recipeId}!`, 4); if (recipeData && !state.knownRecipes?.some((r: BasicRecipeInfo) => r.id === recipeId)) { const basicInfo: BasicRecipeInfo = { id: recipeData.id, name: recipeData.name, category: recipeData.category, description: recipeData.description, type: recipeData.type }; state.knownRecipes = [...(state.knownRecipes || []), basicInfo]; } } break; // Added type to r
            case 'blueprint': addQuestJournalEntry(state, `Received blueprint: ${reward.value}!`, 4); break;
            case 'garden_slot': const firstLockedSlot = player.garden.find(slot => slot.isUnlocked === false); if (firstLockedSlot) { firstLockedSlot.isUnlocked = true; addQuestJournalEntry(state, `Unlocked garden plot ${firstLockedSlot.id + 1}!`, 4); } else { addQuestJournalEntry(state, `Bonus garden fertility!`, 3); player.garden.forEach(slot => slot.fertility = Math.min(100, (slot.fertility ?? 70) + 5)); } break; // Fixed any type on slot callbacks
            default: console.warn(`Unknown reward type: ${reward.type}`); }
        } catch (e) { console.error(`Error processing reward:`, e); addQuestJournalEntry(state, `Error processing reward for "${ritual.name}".`, 1); }
    });
    return true;
}