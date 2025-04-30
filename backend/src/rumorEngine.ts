// src/rumorEngine.ts
// Generates rumors each turn and adds them to the game state.
// Rumors affect market prices, item availability, and player decisions.

// Use relative path import with .js extension
import { GameState, Rumor, Player } from "coven-shared";
import { ITEMS } from "./items.js";

let rumorCount = 0;
export const RUMOR_QUESTS = [];

const rumorTemplates = { /* ... templates remain the same ... */ };

function pickRandomItemName(state: GameState): string {
  const availableMarketItems = state.market.map(item => item.name).filter(name => !!name); // Param item implicitly any - FIXED
  const commonItems = ITEMS.filter(item => item.type === 'ingredient' || item.type === 'potion').map(item => item.name);
  const potentialTargets = [...new Set([...availableMarketItems, ...commonItems])];
  if (potentialTargets.length === 0) return "local herbs";
  const idx = Math.floor(Math.random() * potentialTargets.length);
  return potentialTargets[idx];
}

export function generateRumors(state: GameState): Rumor[] {
  const newRumors: Rumor[] = []; const chanceOfNewRumor = 0.35;
  if (Math.random() < chanceOfNewRumor) {
    const rumorCategories = Object.keys(rumorTemplates); const category = rumorCategories[Math.floor(Math.random() * rumorCategories.length)] as keyof typeof rumorTemplates;
    const templates = rumorTemplates[category]; const template = templates[Math.floor(Math.random() * templates.length)];
    const itemName = pickRandomItemName(state);
    let content = template.replace('{item}', itemName).replace('{season}', state.time.season).replace('{moonPhase}', state.time.phaseName).replace('{weather}', state.time.weatherFate);
    let priceEffect = 0;
    if (category === 'shortage') priceEffect = 0.1 + Math.random() * 0.15;
    else if (category === 'surplus') priceEffect = - (0.1 + Math.random() * 0.15);
    else if (category === 'quality_good') priceEffect = 0.05 + Math.random() * 0.10;
    else if (category === 'quality_bad') priceEffect = - (0.05 + Math.random() * 0.10);
    else if (category === 'special') priceEffect = Math.random() < 0.5 ? (0.05 + Math.random() * 0.10) : 0;
    const newRumor: Rumor = { id: `rumor-${++rumorCount}-${Date.now()}`, content: content, spread: 5 + Math.floor(Math.random() * 10), affectedItem: itemName, priceEffect: priceEffect !== 0 ? priceEffect : undefined, duration: 4 + Math.floor(Math.random() * 5), verified: false, origin: generateRumorSource(), turnsActive: 0 };
    newRumors.push(newRumor); console.log(`[RumorEngine] Generated rumor: ${newRumor.content}`);
  } return newRumors;
}

function generateRumorSource(): string { const sources = [ "a travelling merchant", "the town apothecary", "village gossip", "a hushed conversation", "the elder witch", "the town crier", "a weary farmer", "a wandering bard", "your own familiar", "a cryptic dream", "a letter from afar", "market whispers", "an old fisherman", "the innkeeper", "a scholar's notes" ]; return sources[Math.floor(Math.random() * sources.length)]; }

export function processRumorEffects(state: GameState): void {
  const rumorsToRemove: string[] = [];
  state.rumors.forEach((rumor: Rumor) => { // Explicitly type rumor
    rumor.turnsActive = (rumor.turnsActive || 0) + 1; if (rumor.duration !== undefined && rumor.duration > 0) rumor.duration--;
    const baseSpreadChange = 10; const baseFadeRate = 25;
    if (rumor.duration === undefined || rumor.duration > 0) { let spreadIncrease = baseSpreadChange; if (rumor.verified) spreadIncrease *= 1.5; rumor.spread = Math.min(100, (rumor.spread ?? 0) + Math.round(spreadIncrease)); }
    else { let fadeAmount = baseFadeRate; if (!rumor.verified) fadeAmount *= 1.5; rumor.spread = Math.max(0, (rumor.spread ?? 0) - Math.round(fadeAmount)); }
    if (rumor.spread <= 0) rumorsToRemove.push(rumor.id);
    if (rumor.verified && rumor.spread > 60 && rumor.affectedItem && rumor.priceEffect && rumor.priceEffect > 0.1) { if (state.marketData.supply[rumor.affectedItem]) state.marketData.supply[rumor.affectedItem] = Math.max(5, state.marketData.supply[rumor.affectedItem] - 2); }
    if (rumor.verified && rumor.spread > 60 && rumor.affectedItem && rumor.priceEffect && rumor.priceEffect < -0.1) { if (state.marketData.supply[rumor.affectedItem]) state.marketData.supply[rumor.affectedItem] = Math.min(95, state.marketData.supply[rumor.affectedItem] + 2); }
  });
  if (rumorsToRemove.length > 0) { state.rumors = state.rumors.filter((rumor: Rumor) => !rumorsToRemove.includes(rumor.id)); console.log(`[RumorEngine] Removed ${rumorsToRemove.length} faded rumors.`); } // Explicitly type rumor
}

export function verifyRumor(state: GameState, playerId: string, rumorId: string): boolean {
  const rumor = state.rumors.find((r: Rumor) => r.id === rumorId); if (!rumor || rumor.verified) return false; // Explicitly type r
  const player = state.players.find(p => p.id === playerId); const tradingSkill = player?.skills?.trading || 1; // Param p implicitly any - FIXED
  const verificationChance = 0.5 + (tradingSkill / 20);
  if (Math.random() < verificationChance) { rumor.verified = true; rumor.spread = Math.min(100, (rumor.spread ?? 0) + 15); if (rumor.duration !== undefined) rumor.duration += 1; console.log(`[RumorEngine] Player ${playerId} verified rumor ${rumorId}.`); state.journal.push({ id: `jv-${Date.now()}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: `You verified: "${rumor.content}"`, category: 'market', importance: 3, readByPlayer: false }); return true; }
  else { console.log(`[RumorEngine] Player ${playerId} failed verify rumor ${rumorId}.`); state.journal.push({ id: `jf-${Date.now()}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: `Couldn't confirm: "${rumor.content}"`, category: 'market', importance: 2, readByPlayer: false }); return false; }
}

export function spreadRumor(state: GameState, player: Player, rumorId: string): boolean {
  const rumor = state.rumors.find((r: Rumor) => r.id === rumorId); if (!rumor) return false; // Explicitly type r
  if (player.reputation < 2) { state.journal.push({ id: `jsr-${Date.now()}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: `Reputation too low to spread rumors.`, category: 'market', importance: 1, readByPlayer: false }); return false; }
  player.reputation -= 1; const tradingBonus = (player.skills.trading || 1) / 10; const spreadIncrease = 20 + Math.round(tradingBonus * 15); rumor.spread = Math.min(100, (rumor.spread ?? 0) + spreadIncrease);
  if (rumor.duration !== undefined) rumor.duration = Math.min(12, rumor.duration + 1); console.log(`[RumorEngine] Player ${player.id} spread rumor ${rumorId}`); state.journal.push({ id: `js-${Date.now()}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: `Helped spread: "${rumor.content}"`, category: 'market', importance: 2, readByPlayer: false }); return true;
}

export function createCustomRumor( state: GameState, content: string, itemName: string, priceEffect: number, origin: string = "your whispers", initialSpread: number = 15, duration: number = 5, verified: boolean = true ): Rumor {
  const newRumor: Rumor = { id: `rumor-${++rumorCount}-${Date.now()}`, content: content, spread: initialSpread, affectedItem: itemName, priceEffect: priceEffect, duration: duration, verified: verified, origin: origin, turnsActive: 0 };
  state.rumors.push(newRumor); console.log(`[RumorEngine] Created custom rumor: ${content}`); state.journal.push({ id: `jc-${Date.now()}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: `New rumor: "${content}"`, category: 'market', importance: 3, readByPlayer: false }); return newRumor;
}