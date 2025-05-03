// src/turnEngine.ts
// Handles advancing the game state by one lunar phase (and possibly season/year)
// Manages weather changes, plant growth, and time progression

import { GameState, Season, WeatherFate, MoonPhase, Plant, GardenSlot, GameTime, JournalEntry, Player, getPlantName } from "coven-shared";
import { calculateGrowthModifier, getIngredientData, getGrowthStageDescription, Ingredient } from "./ingredients.js"; // Make sure Ingredient is imported if needed elsewhere

// Ordered arrays for moon phases and seasons - Exported for use elsewhere
export const MoonPhases: MoonPhase[] = [ "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent" ];
export const Seasons: Season[] = ["Spring", "Summer", "Fall", "Winter"];
const PHASES_PER_SEASON = MoonPhases.length * 3;

function nextSeason(current: Season): Season { const idx = Seasons.indexOf(current); return Seasons[(idx + 1) % Seasons.length]; }

// Determine weather with some correlation to previous weather and season
function determineWeather(time: GameTime): WeatherFate {
    const previousWeather = time.previousWeatherFate; const season = time.season;
    const weatherChances: Record<Season, Partial<Record<WeatherFate, number>>> = { "Spring": { "normal": 0.4, "rainy": 0.4, "dry": 0.05, "foggy": 0.1, "windy": 0.05 }, "Summer": { "normal": 0.3, "rainy": 0.15, "dry": 0.4, "windy": 0.05, "stormy": 0.1 }, "Fall": { "normal": 0.3, "rainy": 0.25, "dry": 0.1, "foggy": 0.2, "windy": 0.15 }, "Winter": { "normal": 0.5, "rainy": 0.1, "dry": 0.1, "foggy": 0.2, "windy": 0.1 } };
    const chances = weatherChances[season] || {}; // Added default empty object
    let currentTotal = 0; for(const k in chances) currentTotal += chances[k as WeatherFate] || 0;
    if(Math.abs(currentTotal - 1.0) > 0.01 && currentTotal > 0) { // Added check currentTotal > 0
         const factor = 1.0 / currentTotal;
         for (const k in chances) { chances[k as WeatherFate] = (chances[k as WeatherFate] || 0) * factor; }
    } else if (currentTotal === 0) { // Fallback if no chances defined
         chances['normal'] = 1.0;
    }
    // Slightly higher chance to stick with previous weather
    if (previousWeather && chances[previousWeather] && Math.random() < 0.30) return previousWeather;
    const roll = Math.random(); let cumulativeChance = 0;
    for (const [weather, chance] of Object.entries(chances)) { cumulativeChance += chance || 0; if (roll < cumulativeChance) return weather as WeatherFate; }
    return "normal"; // Fallback
}


// Process growth, health, and weather effects for a single plant
function applyGrowthAndWeather( plant: Plant, slot: GardenSlot, weather: WeatherFate, currentPhase: MoonPhase, currentSeason: Season ): { didGrow: boolean, didWither: boolean, becameMature: boolean, messages: string[] } {
    if (!plant) return { didGrow: false, didWither: false, becameMature: false, messages: [] };

    // Ensure plantData is correctly typed or handled if undefined
    const plantName = getPlantName(plant);
    const plantData = getIngredientData(plantName) as Ingredient | undefined; // Explicit cast/check
    if (!plantData) {
        console.error(`[TurnEngine] Missing ingredient data for plant: ${plantName}`);
        return { didGrow: false, didWither: false, becameMature: false, messages: [`Error: Missing data for ${plantName}`] };
    }

    const result = { didGrow: false, didWither: false, becameMature: false, messages: [] as string[] };
    const maxGrowth = plant.maxGrowth ?? plantData.growthTime;
    plant.maxGrowth = maxGrowth;

    const isRainy = (weather === "rainy" || weather === "stormy");
    let currentMoisture = slot.moisture ?? 50;
    let evaporationRate = 10; // Base evaporation

    // Weather effects on moisture & add messages
    if (isRainy) {
        const rainAmount = weather === 'stormy' ? 60 : 40;
        currentMoisture = Math.min(100, currentMoisture + rainAmount);
        evaporationRate = 0; // No evaporation during rain
        result.messages.push(`🌧️ Rain watered the plot.`);
    } else if (weather === 'dry') {
        evaporationRate = 25;
        result.messages.push(`☀️ Dry weather increases evaporation.`);
    } else if (weather === 'foggy') {
        evaporationRate = 5;
         result.messages.push(`🌫️ Fog reduces evaporation.`);
    } else if (weather === 'windy') {
        evaporationRate = 15;
         result.messages.push(`💨 Windy conditions increase evaporation.`);
    }

    // Apply evaporation
    currentMoisture = Math.max(0, currentMoisture - evaporationRate);
    slot.moisture = currentMoisture;

    // --- REMOVED check for plant.watered flag ---
    // The waterPlants action now directly boosts moisture

    // Health effects based on moisture
    const idealMoisture = plantData.idealMoisture;
    const moistureDiff = Math.abs(currentMoisture - idealMoisture);
    let healthChange = 0;
    let moistureMessage = "";

    if (moistureDiff < 15) {
        healthChange += 5; // Optimal moisture
        moistureMessage = `💧 Ideal moisture.`;
    } else if (moistureDiff > 35) {
        healthChange -= 15; // High stress
        moistureMessage = currentMoisture < idealMoisture ? `💧 Severely dry!` : `💧 Overwatered!`;
    } else if (moistureDiff > 20) {
        healthChange -= 5; // Moderate stress
        moistureMessage = currentMoisture < idealMoisture ? `💧 Needs more water.` : `💧 A bit too wet.`;
    }
    if (moistureMessage) result.messages.push(moistureMessage);


    // Other health effects
    if (weather === 'stormy' && Math.random() < 0.3) {
        healthChange -= 25;
        result.messages.push(`⛈️ Storm battered the plant!`);
    } else if (weather === 'dry' && currentMoisture < 20) {
        healthChange -= 10; // Extra penalty for dry + low moisture
         result.messages.push(`☀️ Extremely dry conditions stress the plant.`);
    }

    plant.health = Math.min(100, Math.max(0, (plant.health ?? 70) + healthChange));
    if(healthChange !== 0) {
        result.messages.push(`❤️ Health changed by ${healthChange > 0 ? '+' : ''}${healthChange.toFixed(0)} (Now ${plant.health.toFixed(0)}%).`);
    }


    // Wither chance
    // Calculate deathChance based on health - not stored in the new Plant type
    const deathChance = Math.max(0, Math.min(1, (25 - plant.health) / 25)); // Higher chance below 25 health
    if (plant.health <= 0 || (plant.health < 10 && Math.random() < deathChance * 2) || (plant.health < 25 && Math.random() < deathChance)) {
        result.didWither = true;
        result.messages.push(`💀 ${plantName} withered!`);
        return result;
    }

    // Growth process
    if (!plant.mature && plant.health > 30) {
        const growthCalc = calculateGrowthModifier(
            plantData, // Pass the ensured Ingredient data
            currentSeason,
            currentPhase,
            currentMoisture,
            slot.sunlight ?? 70 // Use default sunlight if undefined
        );
        let growthIncrease = growthCalc.growthModifier * (plant.health / 100); // Scale growth by health
        growthIncrease = Math.max(0.05, growthIncrease); // Ensure minimal growth if healthy

        plant.growth = (plant.growth ?? 0) + growthIncrease;
        plant.age = (plant.age ?? 0) + 1;
        result.didGrow = true;

        // Check for maturity
        if (plant.growth >= maxGrowth) {
            plant.mature = true;
            plant.growth = maxGrowth; // Cap growth
            result.becameMature = true;
            result.messages.push(`✨ ${plantName} is now mature and ready for harvest!`);
        } else {
             // Only add growth stage message if not mature yet
             result.messages.push(getGrowthStageDescription(plantName, plant.growth, maxGrowth));
        }
    } else if (!plant.mature && plant.health <= 30) {
        result.messages.push(`❤️ Too unhealthy to grow.`);
    } else if (plant.mature) {
        // Add message for mature plants? Maybe not necessary every turn.
        // result.messages.push(`${plantName} is mature.`);
    }

    return result;
}


// Advance the game state by one lunar phase
export function processTurn(state: GameState): GameState {
    const turnEvents: { text: string, category: string, importance: number, player?: string }[] = [];
    const oldSeason = state.time.season;

    // Advance time
    state.time.phase = (state.time.phase + 1) % MoonPhases.length;
    state.time.phaseName = MoonPhases[state.time.phase];
    state.time.dayCount += 1;

    // Check for season/year change
    if (state.time.dayCount > 1 && (state.time.dayCount -1) % PHASES_PER_SEASON === 0) {
        state.time.season = nextSeason(oldSeason);
        turnEvents.push({ text: `The winds shift, welcoming ${state.time.season}.`, category: 'season', importance: 5 });
        if (state.time.season === "Spring") {
            state.time.year += 1;
            turnEvents.push({ text: `A new year dawns, Year ${state.time.year}.`, category: 'event', importance: 5 });
        }
    }

    turnEvents.push({ text: `The ${state.time.phaseName} begins its watch.`, category: 'moon', importance: 3 });

    // Determine weather
    state.time.previousWeatherFate = state.time.weatherFate;
    state.time.weatherFate = determineWeather(state.time);
    turnEvents.push({ text: `The skies are ${state.time.weatherFate}.`, category: 'weather', importance: 3 });

    // Process each player
    state.players.forEach((player: Player) => {
        // Process garden plots
        player.garden.forEach((slot: GardenSlot) => {
             if (slot.isUnlocked === false) return; // Skip locked plots

             if (slot.plant) {
                 const plantResult = applyGrowthAndWeather(
                     slot.plant,
                     slot,
                     state.time.weatherFate,
                     state.time.phaseName,
                     state.time.season
                 );
                 // Add detailed plant messages to journal, prefixed with plot ID
                 plantResult.messages.forEach(msg => turnEvents.push({ text: `Plot ${slot.id + 1}: ${msg}`, category: 'garden', importance: msg.includes("mature") || msg.includes("withered") ? 4 : (msg.includes("!") ? 3 : 2), player: player.id }));

                 if (plantResult.didWither) {
                     slot.plant = null;
                     // Reduce fertility slightly when a plant withers
                     slot.fertility = Math.max(40, (slot.fertility ?? 70) - 10);
                     turnEvents.push({ text: `Plot ${slot.id + 1} soil feels depleted.`, category: 'garden', importance: 1, player: player.id });
                 }
             } else {
                 // Empty plot: Adjust fertility and moisture slightly
                 slot.fertility = Math.min(90, (slot.fertility ?? 70) + 0.5); // Slowly recovers
                 let currentMoisture = slot.moisture ?? 50;
                 let evaporationRate = 10;
                 if (state.time.weatherFate === "rainy" || state.time.weatherFate === "stormy") {
                     currentMoisture = Math.min(100, currentMoisture + 30); // Less water absorbed by empty plots
                     evaporationRate = 0;
                 } else if (state.time.weatherFate === 'dry') {
                     evaporationRate = 25;
                 } else if (state.time.weatherFate === 'foggy') {
                     evaporationRate = 5;
                 } else if (state.time.weatherFate === 'windy') {
                     evaporationRate = 15;
                 }
                 currentMoisture = Math.max(0, currentMoisture - evaporationRate);
                 slot.moisture = currentMoisture;
             }
        });
        player.daysSurvived = (player.daysSurvived ?? 0) + 1;
    });

    // Add turn events to journal
    turnEvents.forEach((evt, i) => {
        const entry: JournalEntry = {
            id: `j-${state.time.dayCount}-${i}`,
            turn: state.time.dayCount,
            date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`,
            text: evt.text,
            category: evt.category,
            importance: evt.importance,
            readByPlayer: false // All new entries are unread
            // playerId: evt.player // Optionally associate with a player
        };
        state.journal.push(entry);
    });

    // Limit journal size
    if (state.journal.length > 200) {
        state.journal = state.journal.slice(-150); // Keep the most recent 150 entries
    }

    // Other end-of-turn processes (market, rumors, quests) will be called after this by GameEngine

    return state;
}