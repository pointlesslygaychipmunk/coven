// src/questSystem.ts
// Manages ritual quest progression and completion

import {
    GameState, RitualQuest, Player, BasicRecipeInfo, // Added BasicRecipeInfo
    JournalEntry, RitualQuestStep, RitualReward // Added JournalEntry, removed unused Season, InventoryItem
} from "coven-shared"; // Use shared package
import { getItemData } from "./items.js"; // Import item helper
import { getRecipeById } from './brewing.js';

// Import helpers from gameEngine
import { addItemToInventory, addSkillXp } from "./gameEngine.js";

// Define the master list of available ritual quests
export const RITUAL_QUESTS: RitualQuest[] = [
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

// Add a new ritual quest to the game state (called during initialization or events)
export function unlockRitualQuest(state: GameState, questId: string): boolean {
    const questTemplate = RITUAL_QUESTS.find(q => q.id === questId);
    if (!questTemplate || state.rituals.some(r => r.id === questId)) {
        return false; // Template not found or quest already added
    }

    const newQuest: RitualQuest = JSON.parse(JSON.stringify(questTemplate)); // Deep copy
    newQuest.unlocked = true; // Mark as available
    newQuest.stepsCompleted = 0; // Ensure progress starts at 0
    newQuest.steps.forEach(step => step.completed = false); // Ensure steps start uncompleted

    state.rituals.push(newQuest);
     // Add Journal Entry using helper
     addQuestJournalEntry(state, `A new ritual quest has become available: "${newQuest.name}"`, 4);
    console.log(`[QuestSystem] Unlocked ritual: ${questId}`);
    return true;
}

// Check quest completion conditions based on player actions
export function checkQuestStepCompletion( // Added export
    state: GameState,
    player: Player,
    actionType: string, // e.g., 'harvest', 'brew', 'plant', 'sellItem', 'fulfillRequest', 'meditate'
    actionDetails: any // Data related to the action { plantName, quality, potionName, season, etc. }
): void {
    const activeRituals = state.rituals.filter(ritual =>
        ritual.unlocked && !player.completedRituals.includes(ritual.id) &&
        ritual.stepsCompleted < ritual.totalSteps
    );

    if (activeRituals.length === 0) return;

    const currentPhase = state.time.phaseName;
    const currentSeason = state.time.season;

    activeRituals.forEach(ritual => {
        // Check seasonal requirement for the *whole* ritual first
        if (ritual.requiredSeason && ritual.requiredSeason !== currentSeason) {
             // console.log(`[Quest] Ritual ${ritual.id} skipped, wrong season.`);
            return; // Can't progress this ritual now
        }
         // Check moon phase requirement for the *whole* ritual
        if (ritual.requiredMoonPhase && ritual.requiredMoonPhase !== currentPhase) {
            // console.log(`[Quest] Ritual ${ritual.id} skipped, wrong moon phase.`);
            return; // Can't progress this ritual now
        }


        const currentStepIndex = ritual.stepsCompleted;
        if (currentStepIndex >= ritual.steps.length) return; // Should not happen if totalSteps is correct

        const step = ritual.steps[currentStepIndex];
        if (step.completed) return; // Already done this step

        let stepCompleted = false;

        // Evaluate the step based on the action type and details
        switch (step.description) {
            // Example Brewing Checks
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
            // Example Harvest Checks
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
            // Example Planting Checks
             case "Plant 3 different seeds during Spring":
                if (actionType === 'plant' && currentSeason === "Spring") {
                    console.warn("[Quest] Step 'Plant 3 different seeds' requires tracking logic.");
                    // Needs proper tracking implementation
                }
                 break;
            default:
                break;
        }

        // If step was completed by the action
        if (stepCompleted) {
            step.completed = true;
            step.completedDate = `${currentPhase}, ${currentSeason} Y${state.time.year}`; // Record completion time
            ritual.stepsCompleted++;

            addQuestJournalEntry(state, `Ritual progress: "${ritual.name}" step completed - ${step.description}! (${ritual.stepsCompleted}/${ritual.totalSteps})`, 4);

            if (ritual.stepsCompleted >= ritual.totalSteps) {
                addQuestJournalEntry(state, `Ritual complete: You have finished "${ritual.name}"! Rewards await.`, 5);
            }
        }
    });
}


// Unlock seasonal rituals when the appropriate season begins
function unlockSeasonalRituals(state: GameState): void {
    const currentSeason = state.time.season;
    RITUAL_QUESTS.forEach(questTemplate => {
        if (questTemplate.requiredSeason === currentSeason && !state.rituals.some(r => r.id === questTemplate.id)) {
            unlockRitualQuest(state, questTemplate.id);
        }
    });
}


// Process any rituals that progress passively or are triggered by time/world state
export function progressRituals(state: GameState): void { // Added export
    unlockSeasonalRituals(state);
    // ... (other passive checks remain unchanged) ...
}


// Helper function to check if a player has completed a ritual
export const isRitualClaimed = (player: Player, ritualId: string): boolean => player.completedRituals.includes(ritualId);

// Function to claim rewards
export function claimRitualRewards(state: GameState, player: Player, ritualId: string): boolean {
    const ritualIndex = state.rituals.findIndex(r => r.id === ritualId);
    if (ritualIndex === -1) {
        console.warn(`[Quest] Attempted to claim rewards for non-existent ritual: ${ritualId}`);
        return false;
    }
    const ritual = state.rituals[ritualIndex];

    if (ritual.stepsCompleted < ritual.totalSteps) {
        console.warn(`[Quest] Attempted to claim rewards for incomplete ritual: ${ritualId}`);
         addQuestJournalEntry(state, `Cannot claim rewards for "${ritual.name}" yet. Ritual is incomplete.`, 2);
        return false;
    }
    if (isRitualClaimed(player, ritualId)) {
        console.warn(`[Quest] Attempted to claim rewards for already completed ritual: ${ritualId}`);
         addQuestJournalEntry(state, `You have already claimed the rewards for "${ritual.name}".`, 1);
        return false;
    }

    // Mark as completed *for this player*
    player.completedRituals.push(ritualId);
     addQuestJournalEntry(state, `Rewards claimed for completing the ritual: "${ritual.name}"!`, 5);

    // Award rewards
    ritual.rewards.forEach(reward => {
        try {
            switch (reward.type) {
                case 'gold':
                    const goldAmount = Number(reward.value);
                    player.gold += goldAmount;
                    addQuestJournalEntry(state, `Received ${goldAmount} gold.`);
                    break;
                case 'item':
                    const itemBaseId = String(reward.value);
                    const itemData = getItemData(itemBaseId);
                    if (itemData) {
                        const quantity = reward.quantity ?? 1;
                        addItemToInventory(player, itemData, quantity, 95);
                        addQuestJournalEntry(state, `Received ${quantity}x ${itemData.name}.`);
                    } else {
                         console.error(`[Quest] Reward item not found: ${itemBaseId}`);
                         addQuestJournalEntry(state, `Error: Could not find reward item ${itemBaseId}.`, 1);
                    }
                    break;
                case 'skill':
                    const skillName = String(reward.value);
                    const skillAmount = reward.quantity ?? 1;
                    if (player.skills.hasOwnProperty(skillName)) {
                        const xpResult = addSkillXp(player, skillName as keyof Player['skills'], skillAmount); // Call imported helper and check result
                        addQuestJournalEntry(state, `${skillName.charAt(0).toUpperCase() + skillName.slice(1)} skill increased.`);
                        if (xpResult.levelUp) { // Log level up specifically
                             addQuestJournalEntry(state, `${player.name}'s ${String(skillName)} skill reached level ${xpResult.newLevel}!`, 'skill', 4);
                        }
                    } else {
                         console.warn(`[Quest] Reward skill not found on player: ${skillName}`);
                    }
                    break;
                case 'reputation':
                    const repAmount = Number(reward.value);
                    player.reputation = Math.min(100, player.reputation + repAmount);
                    addQuestJournalEntry(state, `Gained ${repAmount} reputation.`);
                    break;
                 case 'recipe':
                    const recipeId = String(reward.value);
                    if (!player.knownRecipes.includes(recipeId)) {
                         player.knownRecipes.push(recipeId);
                          const recipeData = getRecipeById(recipeId);
                          addQuestJournalEntry(state, `Learned new recipe: ${recipeData?.name || recipeId}!`, 4);
                           // Also update the global knownRecipes list in GameState
                           if (recipeData && !state.knownRecipes?.some(r => r.id === recipeId)) {
                               const basicInfo: BasicRecipeInfo = { // Should work now
                                   id: recipeData.id,
                                   name: recipeData.name,
                                   category: recipeData.category,
                                   description: recipeData.description,
                                   type: recipeData.type
                               };
                               state.knownRecipes = [...(state.knownRecipes || []), basicInfo];
                           }
                    }
                     break;
                 case 'blueprint':
                     addQuestJournalEntry(state, `Received blueprint: ${reward.value}!`, 4);
                     // Add to player's known blueprints...
                     break;
                 case 'garden_slot':
                      const firstLockedSlot = player.garden.find(slot => slot.isUnlocked === false);
                      if (firstLockedSlot) {
                          firstLockedSlot.isUnlocked = true;
                          addQuestJournalEntry(state, `Unlocked a new garden plot (Plot ${firstLockedSlot.id + 1})!`, 4);
                      } else {
                           addQuestJournalEntry(state, `Received bonus garden fertility instead!`, 3); // Fallback if no slots left
                           player.garden.forEach(slot => slot.fertility = Math.min(100, (slot.fertility ?? 70) + 5));
                      }
                      break;
                default:
                    console.warn(`[Quest] Unknown reward type: ${reward.type}`);
            }
        } catch (e) {
             console.error(`[Quest] Error processing reward: ${JSON.stringify(reward)}`, e);
             addQuestJournalEntry(state, `Error processing a reward for "${ritual.name}".`, 1);
        }
    });

    return true;
}