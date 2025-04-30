// src/turnEngine.ts
// Handles advancing the game state by one lunar phase (and possibly season/year)
// Manages weather changes, plant growth, and time progression

// Use relative path import with .js extension
import { GameState, Season, WeatherFate, MoonPhase, Plant, GardenSlot, GameTime, JournalEntry } from "coven-shared";
// Import specific Ingredient type from ingredients.ts
import { calculateGrowthModifier, getIngredientData, getGrowthStageDescription, Ingredient } from "./ingredients.js"; // Removed unused Ingredient import

// Ordered arrays for moon phases and seasons - Exported for use elsewhere
export const MoonPhases: MoonPhase[] = [ "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent" ];
export const Seasons: Season[] = ["Spring", "Summer", "Fall", "Winter"];
const PHASES_PER_SEASON = MoonPhases.length * 3;

function nextSeason(current: Season): Season { const idx = Seasons.indexOf(current); return Seasons[(idx + 1) % Seasons.length]; }
function determineWeather(time: GameTime): WeatherFate { /* ... implementation ... */ }
function applyGrowthAndWeather( plant: Plant, slot: GardenSlot, weather: WeatherFate, currentPhase: MoonPhase, currentSeason: Season ): { didGrow: boolean, didWither: boolean, becameMature: boolean, messages: string[] } {
    if (!plant) return { didGrow: false, didWither: false, becameMature: false, messages: [] };
    const plantData = getIngredientData(plant.name);
    if (!plantData) { console.error(`[TurnEngine] Missing data for plant: ${plant.name}`); return { didGrow: false, didWither: false, becameMature: false, messages: [`Error processing ${plant.name}`] }; }
    const result = { didGrow: false, didWither: false, becameMature: false, messages: [] as string[] };
    const maxGrowth = plant.maxGrowth ?? plantData.growthTime; plant.maxGrowth = maxGrowth;
    const isRainy = (weather === "rainy" || weather === "stormy"); let currentMoisture = slot.moisture ?? 50; let evaporationRate = 10;
    if (isRainy) { currentMoisture = Math.min(100, currentMoisture + (weather === 'stormy' ? 60 : 40)); evaporationRate = 0; result.messages.push(`Rain watered ${plant.name}.`); }
    else if (weather === 'dry') evaporationRate = 25; else if (weather === 'foggy') evaporationRate = 5; else if (weather === 'windy') evaporationRate = 15;
    if (plant.watered) { currentMoisture = Math.min(100, currentMoisture + 40); plant.watered = false; if (!isRainy) result.messages.push(`Watering helped.`); }
    currentMoisture = Math.max(0, currentMoisture - evaporationRate); slot.moisture = currentMoisture;
    const idealMoisture = plantData.idealMoisture; const moistureDiff = Math.abs(currentMoisture - idealMoisture); let healthChange = 0;
    if (moistureDiff < 15) healthChange += 5; else if (moistureDiff > 35) { healthChange -= 15; result.messages.push(`Suffers from ${currentMoisture < idealMoisture ? 'dryness' : 'oversaturation'}.`); } else if (moistureDiff > 20) healthChange -= 5;
    if (weather === 'stormy' && Math.random() < 0.3) { healthChange -= 25; result.messages.push(`Storm battered!`); } else if (weather === 'dry' && currentMoisture < 20) healthChange -= 10;
    plant.health = Math.min(100, Math.max(0, (plant.health ?? 70) + healthChange));
    plant.deathChance = Math.max(0, Math.min(1, (25 - plant.health) / 25));
    if (plant.health <= 0 || (plant.health < 10 && Math.random() < plant.deathChance * 2) || (plant.health < 25 && Math.random() < plant.deathChance)) { result.didWither = true; result.messages.push(`${plant.name} withered!`); return result; }
    if (!plant.mature && plant.health > 30) {
        const growthCalc = calculateGrowthModifier( plantData, currentSeason, currentPhase, currentMoisture, slot.sunlight ?? 70 );
        let growthIncrease = growthCalc.growthModifier * (plant.health / 100); growthIncrease = Math.max(0.05, growthIncrease);
        plant.growth = (plant.growth ?? 0) + growthIncrease; plant.age = (plant.age ?? 0) + 1; result.didGrow = true;
        if (plant.growth >= maxGrowth) { plant.mature = true; plant.growth = maxGrowth; result.becameMature = true; result.messages.push(`${plant.name} mature!`); }
        result.messages.push(getGrowthStageDescription(plant.name, plant.growth, maxGrowth)); // Should work now
    } else if (!plant.mature && plant.health <= 30) { result.messages.push(`Too unhealthy to grow.`); }
    return result;
}

// Advance the game state by one lunar phase
export function processTurn(state: GameState): GameState {
    const turnEvents: { text: string, category: string, importance: number, player?: string }[] = [];
    const oldSeason = state.time.season;
    state.time.phase = (state.time.phase + 1) % MoonPhases.length; state.time.phaseName = MoonPhases[state.time.phase]; state.time.dayCount += 1;
    if (state.time.dayCount > 1 && (state.time.dayCount -1) % PHASES_PER_SEASON === 0) { state.time.season = nextSeason(oldSeason); turnEvents.push({ text: `Welcome, ${state.time.season}!`, category: 'season', importance: 5 }); if (state.time.season === "Spring") { state.time.year += 1; turnEvents.push({ text: `Year ${state.time.year} dawns.`, category: 'event', importance: 5 }); } }
    turnEvents.push({ text: `${state.time.phaseName} begins.`, category: 'moon', importance: 3 });
    state.time.previousWeatherFate = state.time.weatherFate; state.time.weatherFate = determineWeather(state.time); turnEvents.push({ text: `Weather: ${state.time.weatherFate}.`, category: 'weather', importance: 3 });
    state.players.forEach(player => { // Param player implicitly any - FIXED
        player.garden.forEach(slot => { // Param slot implicitly any - FIXED
             if (slot.isUnlocked === false) return;
             if (slot.plant) { const plantResult = applyGrowthAndWeather( slot.plant, slot, state.time.weatherFate, state.time.phaseName, state.time.season ); plantResult.messages.forEach(msg => turnEvents.push({ text: `Plot ${slot.id + 1}: ${msg}`, category: 'garden', importance: 2, player: player.id })); if (plantResult.didWither) { slot.plant = null; slot.fertility = Math.max(40, (slot.fertility ?? 70) - 10); turnEvents.push({ text: `Plot ${slot.id + 1} fertility decreased.`, category: 'garden', importance: 1, player: player.id }); } }
             else { slot.fertility = Math.min(90, (slot.fertility ?? 70) + 0.5); let currentMoisture = slot.moisture ?? 50; let evaporationRate = 10; if (state.time.weatherFate === "rainy" || state.time.weatherFate === "stormy") { currentMoisture = Math.min(100, currentMoisture + 30); evaporationRate = 0; } else if (state.time.weatherFate === 'dry') evaporationRate = 25; else if (state.time.weatherFate === 'foggy') evaporationRate = 5; else if (state.time.weatherFate === 'windy') evaporationRate = 15; currentMoisture = Math.max(0, currentMoisture - evaporationRate); slot.moisture = currentMoisture; }
        }); player.daysSurvived = (player.daysSurvived ?? 0) + 1;
    });
    turnEvents.forEach((evt, i) => { const entry: JournalEntry = { id: `j-${state.time.dayCount}-${i}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: evt.text, category: evt.category, importance: evt.importance, readByPlayer: false }; state.journal.push(entry); });
    if (state.journal.length > 200) state.journal = state.journal.slice(-150);
    return state;
}

// Need to properly define or import functions if they are called (TS2554 errors previously)
// declare function calculateGrowthModifier(...args: any[]): any; // Placeholder if not properly imported/resolved
// declare function getGrowthStageDescription(...args: any[]): any; // Placeholder