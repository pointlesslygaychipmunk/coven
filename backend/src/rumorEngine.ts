// src/rumorEngine.ts
// Generates rumors each turn and adds them to the game state.
// Rumors affect market prices, item availability, and player decisions.

// Use package name import
import { GameState, Rumor, Player, JournalEntry, MarketItem } from "coven-shared";
import { ITEMS } from "./items.js";

let rumorCount = 0;
export const RUMOR_QUESTS = [];

// Type definition for rumor templates structure
type RumorTemplateCategory = 'shortage' | 'surplus' | 'quality_good' | 'quality_bad' | 'special';
const rumorTemplates: Record<RumorTemplateCategory, string[]> = {
  shortage: [ "Whispers claim {item} is scarce...", "Blight reported in {season} fields affecting {item}...", "Caravans carrying {item} waylaid...", "Elder Witch hoarding {item}!", "'Witch Weekly' caused run on {item}." ],
  surplus: [ "Bumper crop of {item} this {season}!", "Large shipment of {item} arrived.", "{item} going out of fashion, prices drop.", "Trading Guild found new source for {item}.", "Too much {item} brewed last {moonPhase}." ],
  quality_good: [ "{item} harvested under {moonPhase} exceptionally potent.", "{weather} resulted in high-quality {item}.", "Alchemist Note: Enhanced {item} purity.", "{item} from northern gardens is best.", "{season} rains blessed the {item} crop." ],
  quality_bad: [ "Beware! Circulating {item} is diluted.", "{weather} damaged {item} quality.", "Cheap {item} from eastern trader is weak.", "Latest batch of {item} harvested too early.", "Pest infestation affected {item} quality." ],
  special: [ "Rare 'Moonpetal' variant of {item} appears during {moonPhase}.", "Wandering merchant has legendary {item}...", "{item} glowing faintly during {weather}...", "Prophecy hints {item} near stones holds secrets.", "Whispers of 'Black Market' for forbidden {item}..." ]
};

// Selects a random item name
function pickRandomItemName(state: GameState): string {
  const availableMarketItems = state.market.map((item: MarketItem) => item.name).filter((name: unknown): name is string => !!name);
  const commonItems = ITEMS.filter(item => item.type === 'ingredient' || item.type === 'potion').map(item => item.name);
  const potentialTargets = [...new Set([...availableMarketItems, ...commonItems])];
  if (potentialTargets.length === 0) return "local herbs";
  return potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
}

// Generate a list of rumors
export function generateRumors(state: GameState): Rumor[] {
  const newRumors: Rumor[] = []; const chanceOfNewRumor = 0.35;
  if (Math.random() < chanceOfNewRumor) {
    const rumorCategories = Object.keys(rumorTemplates) as RumorTemplateCategory[];
    const category = rumorCategories[Math.floor(Math.random() * rumorCategories.length)];
    const templates: string[] = rumorTemplates[category]; // Explicitly type templates as string[]
    if (!templates || templates.length === 0) return newRumors; // Guard against empty template array
    const template: string = templates[Math.floor(Math.random() * templates.length)]; // template is now string
    const itemName = pickRandomItemName(state);
    // Replace should work now
    let content = template.replace('{item}', itemName).replace('{season}', state.time.season).replace('{moonPhase}', state.time.phaseName).replace('{weather}', state.time.weatherFate);
    let priceEffect = 0;
    if (category === 'shortage') priceEffect = 0.1 + Math.random() * 0.15;
    else if (category === 'surplus') priceEffect = - (0.1 + Math.random() * 0.15);
    else if (category === 'quality_good') priceEffect = 0.05 + Math.random() * 0.10;
    else if (category === 'quality_bad') priceEffect = - (0.05 + Math.random() * 0.10);
    else if (category === 'special') priceEffect = Math.random() < 0.5 ? (0.05 + Math.random() * 0.10) : 0;
    const newRumor: Rumor = { id: `rumor-${++rumorCount}-${Date.now()}`, content: content, spread: 5 + Math.floor(Math.random() * 10), affectedItem: itemName, priceEffect: priceEffect !== 0 ? priceEffect : undefined, duration: 4 + Math.floor(Math.random() * 5), verified: false, origin: generateRumorSource(), turnsActive: 0 };
    newRumors.push(newRumor); console.log(`[RumorEngine] Generated: ${newRumor.content}`);
  } return newRumors;
}

// Generate rumor source
function generateRumorSource(): string { const sources = [ "merchant", "apothecary", "gossip", "hushed tones", "elder witch", "town crier", "farmer", "bard", "familiar", "dream", "letter", "market whispers", "fisherman", "innkeeper", "notes" ]; return sources[Math.floor(Math.random() * sources.length)]; }

// Process rumor effects
export function processRumorEffects(state: GameState): void {
  const rumorsToRemove: string[] = [];
  state.rumors.forEach((rumor: Rumor) => {
    rumor.turnsActive = (rumor.turnsActive || 0) + 1; if (rumor.duration !== undefined && rumor.duration > 0) rumor.duration--;
    const baseSpreadChange = 10; const baseFadeRate = 25;
    if (rumor.duration === undefined || rumor.duration > 0) { let spreadIncrease = baseSpreadChange; if (rumor.verified) spreadIncrease *= 1.5; rumor.spread = Math.min(100, (rumor.spread ?? 0) + Math.round(spreadIncrease)); }
    else { let fadeAmount = baseFadeRate; if (!rumor.verified) fadeAmount *= 1.5; rumor.spread = Math.max(0, (rumor.spread ?? 0) - Math.round(fadeAmount)); }
    if (rumor.spread <= 0) rumorsToRemove.push(rumor.id);
    if (rumor.verified && rumor.spread > 60 && rumor.affectedItem && rumor.priceEffect && rumor.priceEffect > 0.1) { if (state.marketData.supply[rumor.affectedItem]) state.marketData.supply[rumor.affectedItem] = Math.max(5, state.marketData.supply[rumor.affectedItem] - 2); }
    if (rumor.verified && rumor.spread > 60 && rumor.affectedItem && rumor.priceEffect && rumor.priceEffect < -0.1) { if (state.marketData.supply[rumor.affectedItem]) state.marketData.supply[rumor.affectedItem] = Math.min(95, state.marketData.supply[rumor.affectedItem] + 2); }
  });
  if (rumorsToRemove.length > 0) { state.rumors = state.rumors.filter((rumor: Rumor) => !rumorsToRemove.includes(rumor.id)); console.log(`Removed ${rumorsToRemove.length} faded rumors.`); }
}

// Verify rumor
export function verifyRumor(state: GameState, playerId: string, rumorId: string): boolean {
  const rumor = state.rumors.find((r: Rumor) => r.id === rumorId); if (!rumor || rumor.verified) return false;
  const player = state.players.find((p: Player) => p.id === playerId); const tradingSkill = player?.skills?.trading || 1; // Added type
  const verificationChance = 0.5 + (tradingSkill / 20);
  if (Math.random() < verificationChance) { rumor.verified = true; rumor.spread = Math.min(100, (rumor.spread ?? 0) + 15); if (rumor.duration !== undefined) rumor.duration += 1; const entry: JournalEntry = { id: `jv-${Date.now()}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: `You verified: "${rumor.content}"`, category: 'market', importance: 3, readByPlayer: false }; state.journal.push(entry); return true; }
  else { const entry: JournalEntry = { id: `jf-${Date.now()}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: `Couldn't confirm: "${rumor.content}"`, category: 'market', importance: 2, readByPlayer: false }; state.journal.push(entry); return false; }
}

// Spread rumor
export function spreadRumor(state: GameState, player: Player, rumorId: string): boolean {
  const rumor = state.rumors.find((r: Rumor) => r.id === rumorId); if (!rumor) return false; // Added type
  if (player.reputation < 2) { const entry: JournalEntry = { id: `jsr-${Date.now()}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: `Reputation too low.`, category: 'market', importance: 1, readByPlayer: false }; state.journal.push(entry); return false; }
  player.reputation -= 1; const tradingBonus = (player.skills.trading || 1) / 10; const spreadIncrease = 20 + Math.round(tradingBonus * 15); rumor.spread = Math.min(100, (rumor.spread ?? 0) + spreadIncrease);
  if (rumor.duration !== undefined) rumor.duration = Math.min(12, rumor.duration + 1); const entry: JournalEntry = { id: `js-${Date.now()}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: `Helped spread: "${rumor.content}"`, category: 'market', importance: 2, readByPlayer: false }; state.journal.push(entry); return true;
}

// Create custom rumor
export function createCustomRumor( state: GameState, content: string, itemName: string, priceEffect: number, origin: string = "your whispers", initialSpread: number = 15, duration: number = 5, verified: boolean = true ): Rumor {
  const newRumor: Rumor = { id: `rumor-${++rumorCount}-${Date.now()}`, content: content, spread: initialSpread, affectedItem: itemName, priceEffect: priceEffect, duration: duration, verified: verified, origin: origin, turnsActive: 0 };
  state.rumors.push(newRumor); console.log(`Created custom rumor: ${content}`); const entry: JournalEntry = { id: `jc-${Date.now()}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: `New rumor: "${content}"`, category: 'market', importance: 3, readByPlayer: false }; state.journal.push(entry); return newRumor;
}