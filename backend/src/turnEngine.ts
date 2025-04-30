// src/turnEngine.ts
// Handles advancing the game state by one lunar phase (and possibly season/year)
// Manages weather changes, plant growth, and time progression

import {
    GameState, Season, WeatherFate, MoonPhase, Plant,
    GardenSlot, GameTime, JournalEntry // Removed Player, Rarity, Ingredient (from coven-shared)
} from "coven-shared";
import { calculateGrowthModifier, getIngredientData, getGrowthStageDescription, Ingredient } from "./ingredients.js"; // Import helpers, Ingredient type added here

// Ordered arrays for moon phases and seasons - Exported for use elsewhere
export const MoonPhases: MoonPhase[] = [ // Added export
    "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
    "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
];
export const Seasons: Season[] = ["Spring", "Summer", "Fall", "Winter"]; // Added export

// Define how many phases (turns) are in a season. 8 phases/cycle * 3 cycles = 24
const PHASES_PER_SEASON = MoonPhases.length * 3;

// Advance to the next season in order
function nextSeason(current: Season): Season {
    const idx = Seasons.indexOf(current);
    return Seasons[(idx + 1) % Seasons.length];
}

// Determine weather with some correlation to previous weather and season
function determineWeather(time: GameTime): WeatherFate {
    const previousWeather = time.previousWeatherFate;
    const season = time.season;

    // Base chances for each weather type, varies by season
    const weatherChances: Record<Season, Partial<Record<WeatherFate, number>>> = {
      "Spring": { "normal": 0.4, "rainy": 0.4, "dry": 0.05, "foggy": 0.1, "windy": 0.05 },
      "Summer": { "normal": 0.3, "rainy": 0.15, "dry": 0.4, "windy": 0.05, "stormy": 0.1 },
      "Fall": { "normal": 0.3, "rainy": 0.25, "dry": 0.1, "foggy": 0.2, "windy": 0.15 },
      "Winter": { "normal": 0.5, "rainy": 0.1, "dry": 0.1, "foggy": 0.2, "windy": 0.1 } // Snow could replace some rainy/normal?
    };

    const chances = weatherChances[season];
    let currentTotal = 0;
    for(const k in chances) currentTotal += chances[k as WeatherFate] || 0;
    // Normalize if needed
    if(Math.abs(currentTotal - 1.0) > 0.01) {
         console.warn(`Weather probabilities for ${season} sum to ${currentTotal}. Normalizing.`);
         const factor = 1.0 / currentTotal;
         for (const k in chances) { chances[k as WeatherFate] = (chances[k as WeatherFate] || 0) * factor; }
    }

    // Weather persistence: 30% chance the weather stays the same
    if (previousWeather && chances[previousWeather] && Math.random() < 0.30) {
      return previousWeather;
    }

    // Roll for new weather
    const roll = Math.random();
    let cumulativeChance = 0;
    for (const [weather, chance] of Object.entries(chances)) {
      cumulativeChance += chance || 0;
      if (roll < cumulativeChance) return weather as WeatherFate;
    }
    return "normal"; // Fallback
}

// Process growth, health, and weather effects for a single plant
function applyGrowthAndWeather(
    plant: Plant,
    slot: GardenSlot,
    weather: WeatherFate,
    currentPhase: MoonPhase,
    currentSeason: Season
): {
    didGrow: boolean,
    didWither: boolean,
    becameMature: boolean,
    messages: string[]
} {
    // Initial checks
    if (!plant) return { didGrow: false, didWither: false, becameMature: false, messages: [] };
    const plantData = getIngredientData(plant.name); // Get base data using the imported helper
    if (!plantData) {
         console.error(`[TurnEngine] Missing ingredient data for plant: ${plant.name}`);
         return { didGrow: false, didWither: false, becameMature: false, messages: [`Error processing ${plant.name}: Missing data.`] };
    }

    const result = { didGrow: false, didWither: false, becameMature: false, messages: [] as string[] };
    // Removed unused initialGrowth variable
    const maxGrowth = plant.maxGrowth ?? plantData.growthTime; // Use plantData growthTime as maxGrowth
    plant.maxGrowth = maxGrowth; // Ensure maxGrowth is set on the plant object


    // --- Moisture Calculation ---
    const isRainy = (weather === "rainy" || weather === "stormy");
    let currentMoisture = slot.moisture ?? 50; // Default moisture if undefined
    let evaporationRate = 10;

    if (isRainy) {
        currentMoisture = Math.min(100, currentMoisture + (weather === 'stormy' ? 60 : 40));
        evaporationRate = 0;
        result.messages.push(`The ${weather} watered the ${plant.name}.`);
    } else if (weather === 'dry') {
        evaporationRate = 25;
    } else if (weather === 'foggy') {
        evaporationRate = 5;
    } else if (weather === 'windy') {
        evaporationRate = 15;
    }

    // Player watering effect (consumed here)
    if (plant.watered) {
         currentMoisture = Math.min(100, currentMoisture + 40); // Player watering effect
         plant.watered = false; // Consume the 'watered' flag
         if (!isRainy) result.messages.push(`Your watering helped the ${plant.name}.`);
    }

    currentMoisture = Math.max(0, currentMoisture - evaporationRate);
    slot.moisture = currentMoisture; // Update slot

    // --- Health Calculation ---
    const idealMoisture = plantData.idealMoisture;
    const moistureDiff = Math.abs(currentMoisture - idealMoisture);
    let healthChange = 0;

    if (moistureDiff < 15) healthChange += 5;
    else if (moistureDiff > 35) {
        healthChange -= 15;
        result.messages.push(`${plant.name} suffers from ${currentMoisture < idealMoisture ? 'dryness' : 'oversaturation'}.`);
    } else if (moistureDiff > 20) healthChange -= 5;

    if (weather === 'stormy' && Math.random() < 0.3) {
        healthChange -= 25;
        result.messages.push(`The storm battered the ${plant.name}!`);
    } else if (weather === 'dry' && currentMoisture < 20) {
        healthChange -= 10;
    }

    plant.health = Math.min(100, Math.max(0, (plant.health ?? 70) + healthChange)); // Default health if undefined

    // Check for withering
     // Death chance increases sharply below 20 health
     plant.deathChance = Math.max(0, Math.min(1, (25 - plant.health) / 25)); // Scale 0 to 1 between 25 and 0 health
    if (plant.health <= 0 || (plant.health < 10 && Math.random() < plant.deathChance * 2)) { // Higher chance if very low health
        result.didWither = true;
        result.messages.push(`${plant.name} has withered away!`);
        return result;
    } else if (plant.health < 25 && Math.random() < plant.deathChance) { // Chance to wither if unhealthy
         result.didWither = true;
         result.messages.push(`${plant.name} succumbed to poor conditions!`);
         return result;
    }


    // --- Growth Calculation (Only if healthy enough and not mature) ---
    if (!plant.mature && plant.health > 30) {
        const growthCalc = calculateGrowthModifier( // Ensure calculateGrowthModifier takes Ingredient type
            plantData, currentSeason, currentPhase, currentMoisture, slot.sunlight ?? 70
        );
        let growthIncrease = growthCalc.growthModifier; // Base growth is 1.0 * modifier

        // Scale by health
        growthIncrease *= (plant.health / 100);

        // Minimum growth unless modifier is extremely low
        growthIncrease = Math.max(0.05, growthIncrease);

        plant.growth = (plant.growth ?? 0) + growthIncrease;
        plant.age = (plant.age ?? 0) + 1;
        result.didGrow = true;

        // Check maturity
        if (plant.growth >= maxGrowth) {
            plant.mature = true;
            plant.growth = maxGrowth; // Cap growth
            result.becameMature = true;
            result.messages.push(`${plant.name} is now mature!`);
             // Add growth stage description to messages
            result.messages.push(getGrowthStageDescription(plant.name, plant.growth, maxGrowth));
        } else {
             // Add growth stage description to messages
             result.messages.push(getGrowthStageDescription(plant.name, plant.growth, maxGrowth));
        }

    } else if (!plant.mature && plant.health <= 30) {
         result.messages.push(`${plant.name} is too unhealthy to grow.`);
    }

    // --- Other Effects (like mutation) ---
    // ... mutation check logic could go here ...

    return result;
}


// Advance the game state by one lunar phase (one "turn" of the world)
export function processTurn(state: GameState): GameState {
    const turnEvents: { text: string, category: string, importance: number, player?: string }[] = [];

    // --- Time Advancement ---
    // Removed unused oldPhaseName variable
    const oldSeason = state.time.season;
    state.time.phase = (state.time.phase + 1) % MoonPhases.length;
    state.time.phaseName = MoonPhases[state.time.phase];
    state.time.dayCount += 1;

    // Removed unused seasonChanged variable
    // Check for season change (based on dayCount and phases per season)
    if (state.time.dayCount > 1 && (state.time.dayCount -1) % PHASES_PER_SEASON === 0) {
        state.time.season = nextSeason(oldSeason);
        // seasonChanged = true; // Removed
        turnEvents.push({ text: `The season changes. Welcome, ${state.time.season}!`, category: 'season', importance: 5 });
        if (state.time.season === "Spring") {
            state.time.year += 1;
            turnEvents.push({ text: `A new year dawns: Year ${state.time.year}.`, category: 'event', importance: 5 });
        }
    }
    turnEvents.push({ text: `The moon enters the ${state.time.phaseName} phase.`, category: 'moon', importance: 3 });

    // --- Weather Update ---
    state.time.previousWeatherFate = state.time.weatherFate;
    state.time.weatherFate = determineWeather(state.time);
    turnEvents.push({ text: `The weather is ${state.time.weatherFate}.`, category: 'weather', importance: 3 });

    // --- Plant Growth & Garden Update ---
    state.players.forEach(player => {
        player.garden.forEach(slot => {
             // Skip locked plots
            if (slot.isUnlocked === false) return;

            if (slot.plant) { // Process only if a plant exists
                const plantResult = applyGrowthAndWeather(
                    slot.plant, slot, state.time.weatherFate, state.time.phaseName, state.time.season
                );

                plantResult.messages.forEach(msg => turnEvents.push({ text: `Plot ${slot.id + 1}: ${msg}`, category: 'garden', importance: 2, player: player.id }));

                if (plantResult.didWither) {
                    slot.plant = null;
                    slot.fertility = Math.max(40, (slot.fertility ?? 70) - 10);
                    turnEvents.push({ text: `Plot ${slot.id + 1}'s soil fertility decreased.`, category: 'garden', importance: 1, player: player.id });
                }
            } else {
                 // Regenerate fertility slightly on empty plots?
                 slot.fertility = Math.min(90, (slot.fertility ?? 70) + 0.5);
                  // Moisture still evaporates/accumulates
                  let currentMoisture = slot.moisture ?? 50;
                  let evaporationRate = 10;
                  if (state.time.weatherFate === "rainy" || state.time.weatherFate === "stormy") {
                      currentMoisture = Math.min(100, currentMoisture + 30);
                      evaporationRate = 0;
                  } else if (state.time.weatherFate === 'dry') evaporationRate = 25;
                  else if (state.time.weatherFate === 'foggy') evaporationRate = 5;
                  else if (state.time.weatherFate === 'windy') evaporationRate = 15;
                  currentMoisture = Math.max(0, currentMoisture - evaporationRate);
                  slot.moisture = currentMoisture;
            }
        });
         player.daysSurvived = (player.daysSurvived ?? 0) + 1;
    });


    // --- Add Journal Entries ---
    turnEvents.forEach((evt, i) => {
        const entry: JournalEntry = {
            id: `j-${state.time.dayCount}-${i}`,
            turn: state.time.dayCount,
            date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`,
            text: evt.text,
            category: evt.category,
            importance: evt.importance,
            readByPlayer: false
        };
        // Add to global journal or player-specific? Global for now.
        state.journal.push(entry);
        // If player-specific event, maybe add to player.journalEntries too?
        // if(evt.player) { ... }
    });
    // Limit journal size
    if (state.journal.length > 200) {
        state.journal = state.journal.slice(-150);
    }

    return state; // Return the modified state
}