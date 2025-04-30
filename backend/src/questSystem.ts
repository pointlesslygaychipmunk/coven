// src/questSystem.ts
// Manages ritual quest progression and completion

import {
    GameState, RitualQuest, Player, // Removed unused InventoryItem, JournalEntry, RitualQuestStep, RitualReward
    BasicRecipeInfo // Kept BasicRecipeInfo import
} from "coven-shared"; // Use shared package
import { getItemData } from "./items.js"; // Import item helper
import { getRecipeById } from './brewing.js';
import { JournalEntry } from "coven-shared"; // Need JournalEntry for the helper function

// Import helpers from gameEngine
import { addItemToInventory, addSkillXp } from "./gameEngine.js";

// Define the master list of available ritual quests
export const RITUAL_QUESTS: RitualQuest[] = [
     // ... (quests remain unchanged) ...
    {
        id: "essence_mastery_1",
        name: "Essence Initiate",
        description: "Begin your journey into essence extraction.",
        stepsCompleted: 0,
        totalSteps: 2,
        steps: [
            { description: "Brew a Moon Glow Serum", completed: false },
            { description: "Harvest 3 Moonbuds", completed: false }
        ],
        rewards: [ { type: 'skill', value: 'brewing', quantity: 0.5 } ],
        unlocked: true,
        initiallyAvailable: true,
    },
     {
        id: "essence_mastery_2",
        name: "Lunar Distillation",
        description: "Master brewing under the Full Moon's light.",
        stepsCompleted: 0,
        totalSteps: 2,
        steps: [
            { description: "Brew a Moon Glow Serum during the Full Moon", completed: false },
            { description: "Brew a Radiant Moon Mask with ingredients of 80+ quality", completed: false }
        ],
        rewards: [
            { type: 'skill', value: 'brewing', quantity: 1 },
            { type: 'item', value: 'ritual_moonstone', quantity: 1 }
        ],
        unlocked: false,
    },
     {
      id: "spring_awakening",
      name: "Spring Awakening Ritual",
      description: "Harness the revitalizing energy of spring.",
      stepsCompleted: 0,
      totalSteps: 3,
      steps: [
        { description: "Plant 3 different seeds during Spring", completed: false },
        { description: "Harvest a Glimmerroot with 80+ quality", completed: false },
        { description: "Craft a Spring Revival Tonic", completed: false }
      ],
      rewards: [
        { type: 'skill', value: 'gardening', quantity: 1 },
        { type: 'item', value: 'ing_spring_root', quantity: 2 }
      ],
      requiredSeason: "Spring",
      unlocked: false,
    },
];


// Helper function to add a quest-related journal entry
// *** Keep this defined within questSystem.ts if it's only used here ***
// *** OR move it to a shared utils file if used elsewhere ***
function addQuestJournalEntry(state: GameState, text: string, importance: number = 3): void {
    const entry: JournalEntry = {
        id: `j-${state.time.dayCount}-${state.journal.length}`,
        turn: state.time.dayCount,
        date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`,
        text: text,
        category: 'ritual', // Specific category
        importance: importance,
        readByPlayer: false
    };
    state.journal.push(entry);
     // Limit journal size
     if (state.journal.length > 150) {
         state.journal.shift();
     }
}

// Add a new ritual quest to the game state
export function unlockRitualQuest(state: GameState, questId: string): boolean {
    const questTemplate = RITUAL_QUESTS.find(q => q.id === questId);
    if (!questTemplate || state.rituals.some(r => r.id === questId)) {
        return false;
    }
    const newQuest: RitualQuest = JSON.parse(JSON.stringify(questTemplate));
    newQuest.unlocked = true;
    newQuest.stepsCompleted = 0;
    newQuest.steps.forEach(step => step.completed = false);
    state.rituals.push(newQuest);
    addQuestJournalEntry(state, `A new ritual quest has become available: "${newQuest.name}"`, 4); // Correctly calls local helper
    console.log(`[QuestSystem] Unlocked ritual: ${questId}`);
    return true;
}


// Check quest completion conditions based on player actions
// *** ADD EXPORT ***
export function checkQuestStepCompletion(
    state: GameState,
    player: Player,
    actionType: string,
    actionDetails: any
): void {
    // ... (rest of the function logic remains unchanged) ...
    const activeRituals = state.rituals.filter(ritual =>
        ritual.unlocked && !player.completedRituals.includes(ritual.id) &&
        ritual.stepsCompleted < ritual.totalSteps
    );

    if (activeRituals.length === 0) return;

    const currentPhase = state.time.phaseName;
    const currentSeason = state.time.season;

    activeRituals.forEach(ritual => {
        if (ritual.requiredSeason && ritual.requiredSeason !== currentSeason) return;
        if (ritual.requiredMoonPhase && ritual.requiredMoonPhase !== currentPhase) return;

        const currentStepIndex = ritual.stepsCompleted;
        if (currentStepIndex >= ritual.steps.length) return;

        const step = ritual.steps[currentStepIndex];
        if (step.completed) return;

        let stepCompleted = false;

        switch (step.description) {
             case "Brew a Moon Glow Serum":
                stepCompleted = (actionType === 'brew' && actionDetails.potionName === "Moon Glow Serum");
                break;
            case "Brew a Moon Glow Serum during the Full Moon":
                stepCompleted = (actionType === 'brew' && actionDetails.potionName === "Moon Glow Serum" && currentPhase === "Full Moon");
                break;
             case "Brew a Radiant Moon Mask with ingredients of 80+ quality":
                  stepCompleted = (actionType === 'brew' && actionDetails.potionName === "Radiant Moon Mask" && actionDetails.quality >= 80);
                  break;
             case "Craft a Spring Revival Tonic":
                  stepCompleted = (actionType === 'brew' && actionDetails.potionName === "Spring Revival Tonic");
                  break;
            case "Harvest 3 Moonbuds":
                 if (actionType === 'harvest' && actionDetails.plantName === "Moonbud") {
                      if (!step.progress) step.progress = 0;
                      step.progress++;
                      if (step.progress >= 3) stepCompleted = true;
                      else addQuestJournalEntry(state, `Harvested Moonbud (${step.progress}/3) for "${ritual.name}".`, 2);
                 }
                 break;
             case "Harvest a Glimmerroot with 80+ quality":
                stepCompleted = (actionType === 'harvest' && actionDetails.plantName === "Glimmerroot" && actionDetails.quality >= 80);
                break;
             case "Plant 3 different seeds during Spring":
                if (actionType === 'plant' && currentSeason === "Spring") {
                    console.warn("[Quest] Step 'Plant 3 different seeds' requires tracking logic.");
                    // Needs proper tracking implementation
                }
                 break;
            default:
                break;
        }

        if (stepCompleted) {
            step.completed = true;
            step.completedDate = `${currentPhase}, ${currentSeason} Y${state.time.year}`;
            ritual.stepsCompleted++;
            addQuestJournalEntry(state, `Ritual progress: "${ritual.name}" step completed - ${step.description}! (${ritual.stepsCompleted}/${ritual.totalSteps})`, 4); // Uses local helper
            if (ritual.stepsCompleted >= ritual.totalSteps) {
                addQuestJournalEntry(state, `Ritual complete: You have finished "${ritual.name}"! Rewards await.`, 5); // Uses local helper
            }
        }
    });
}


// Unlock seasonal rituals
function unlockSeasonalRituals(state: GameState): void {
    // ... (logic remains unchanged) ...
     const currentSeason = state.time.season;
    RITUAL_QUESTS.forEach(questTemplate => {
        if (questTemplate.requiredSeason === currentSeason && !state.rituals.some(r => r.id === questTemplate.id)) {
            unlockRitualQuest(state, questTemplate.id);
        }
    });
}


// Process any rituals that progress passively
// *** ADD EXPORT ***
export function progressRituals(state: GameState): void {
    unlockSeasonalRituals(state);
    // ... (other passive checks remain unchanged) ...
}


// Helper function to check if a player has completed a ritual
export const isRitualClaimed = (player: Player, ritualId: string): boolean => player.completedRituals.includes(ritualId);

// Function to claim rewards
export function claimRitualRewards(state: GameState, player: Player, ritualId: string): boolean {
    // ... (logic remains unchanged, uses local addQuestJournalEntry helper) ...
     const ritualIndex = state.rituals.findIndex(r => r.id === ritualId);
    if (ritualIndex === -1) return false;
    const ritual = state.rituals[ritualIndex];
    if (ritual.stepsCompleted < ritual.totalSteps) {
        addQuestJournalEntry(state, `Cannot claim rewards for "${ritual.name}" yet. Ritual is incomplete.`, 2); // Uses local helper
        return false;
    }
    if (isRitualClaimed(player, ritualId)) {
        addQuestJournalEntry(state, `You have already claimed the rewards for "${ritual.name}".`, 1); // Uses local helper
        return false;
    }
    player.completedRituals.push(ritualId);
    addQuestJournalEntry(state, `Rewards claimed for completing the ritual: "${ritual.name}"!`, 5); // Uses local helper

    ritual.rewards.forEach(reward => {
        try {
            switch (reward.type) {
                 case 'gold':
                    const goldAmount = Number(reward.value);
                    player.gold += goldAmount;
                    addQuestJournalEntry(state, `Received ${goldAmount} gold.`); // Uses local helper
                    break;
                case 'item':
                    const itemBaseId = String(reward.value);
                    const itemData = getItemData(itemBaseId);
                    if (itemData) {
                        const quantity = reward.quantity ?? 1;
                        addItemToInventory(player, itemData, quantity, 95);
                        addQuestJournalEntry(state, `Received ${quantity}x ${itemData.name}.`); // Uses local helper
                    } else {
                         addQuestJournalEntry(state, `Error: Could not find reward item ${itemBaseId}.`, 1); // Uses local helper
                    }
                    break;
                 case 'skill':
                    const skillName = String(reward.value);
                    const skillAmount = reward.quantity ?? 1;
                    if (player.skills.hasOwnProperty(skillName)) {
                        addSkillXp(player, skillName as keyof Player['skills'], skillAmount);
                        addQuestJournalEntry(state, `${skillName.charAt(0).toUpperCase() + skillName.slice(1)} skill increased.`); // Uses local helper
                    }
                    break;
                 case 'reputation':
                    const repAmount = Number(reward.value);
                    player.reputation = Math.min(100, player.reputation + repAmount);
                    addQuestJournalEntry(state, `Gained ${repAmount} reputation.`); // Uses local helper
                    break;
                  case 'recipe':
                    const recipeId = String(reward.value);
                    if (!player.knownRecipes.includes(recipeId)) {
                         player.knownRecipes.push(recipeId);
                          const recipeData = getRecipeById(recipeId);
                          addQuestJournalEntry(state, `Learned new recipe: ${recipeData?.name || recipeId}!`, 4); // Uses local helper
                           if (recipeData && !state.knownRecipes?.some(r => r.id === recipeId)) {
                               const basicInfo: BasicRecipeInfo = {
                                   id: recipeData.id, name: recipeData.name,
                                   category: recipeData.category, description: recipeData.description, type: recipeData.type
                               };
                               state.knownRecipes = [...(state.knownRecipes || []), basicInfo];
                           }
                    }
                     break;
                  case 'blueprint':
                     addQuestJournalEntry(state, `Received blueprint: ${reward.value}!`, 4); // Uses local helper
                     break;
                  case 'garden_slot':
                      const firstLockedSlot = player.garden.find(slot => slot.isUnlocked === false);
                      if (firstLockedSlot) {
                          firstLockedSlot.isUnlocked = true;
                          addQuestJournalEntry(state, `Unlocked a new garden plot (Plot ${firstLockedSlot.id + 1})!`, 4); // Uses local helper
                      } else {
                           addQuestJournalEntry(state, `Received bonus garden fertility instead!`, 3); // Uses local helper
                           player.garden.forEach(slot => slot.fertility = Math.min(100, (slot.fertility ?? 70) + 5));
                      }
                      break;
                default: console.warn(`[Quest] Unknown reward type: ${reward.type}`);
            }
        } catch (e) {
             console.error(`[Quest] Error processing reward: ${JSON.stringify(reward)}`, e);
             addQuestJournalEntry(state, `Error processing a reward for "${ritual.name}".`, 1); // Uses local helper
        }
    });
    return true;
}