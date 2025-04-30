// src/questSystem.ts
// Manages ritual quest progression and completion

import {
    GameState, RitualQuest, Player, // Removed unused Season
    InventoryItem, JournalEntry, RitualQuestStep, RitualReward, BasicRecipeInfo // Added BasicRecipeInfo import
} from "coven-shared"; // Use shared package
import { getItemData } from "./items.js"; // Import item helper
import { getRecipeById } from './brewing.js'; // Assuming getRecipeById exists

// Define the master list of available ritual quests
// (Existing quest definitions remain unchanged)
export const RITUAL_QUESTS: RitualQuest[] = [
    // ... (quests as before) ...
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


// (unlockRitualQuest, addQuestJournalEntry, checkQuestStepCompletion, unlockSeasonalRituals, progressRituals remain unchanged)
// ...

// Ensure addItemToInventory and addSkillXp are accessible
import { addItemToInventory, addSkillXp } from "./gameEngine.js";

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
    if (isRitualClaimed(player, ritualId)) { // Use helper
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
                // ... (gold, item, skill, reputation cases remain unchanged) ...
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
                        addSkillXp(player, skillName as keyof Player['skills'], skillAmount);
                        addQuestJournalEntry(state, `${skillName.charAt(0).toUpperCase() + skillName.slice(1)} skill increased.`);
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
                               const basicInfo: BasicRecipeInfo = { // This line should now work
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