// src/marketEvents.ts
// Handles periodic market adjustments, including memory decay towards
// base prices, rumor impacts, and seasonal fluctuations.

// Use package name import
import { GameState, MarketItem, Season, MoonPhase, ItemCategory, ItemType, Rumor, Item } from "coven-shared"; // Add Rumor, Item back for explicit typing
import { getItemData } from "./items.js"; // Access base item data

const BASE_DEMAND = 50;
const BASE_SUPPLY = 50;
const PRICE_MEMORY_DECAY_RATE = 0.05;
const PRICE_MEMORY_GRACE_PERIOD = 3;
const VOLATILITY_MULTIPLIER_BASE = 0.05;
const INFLATION_RATE_PER_VOLUME = 0.00002;
const DEFLATION_RATE_LOW_VOLUME = 0.001;
const TRADING_VOLUME_THRESHOLD = 150;
const MINIMUM_PRICE_FACTOR = 0.2;
const MAX_PRICE_JUMP_FACTOR = 0.3;

// Helper to ensure market data exists
export function ensureMarketData(state: GameState, itemName: string) {
    if (state.marketData.demand[itemName] === undefined) state.marketData.demand[itemName] = BASE_DEMAND + Math.floor(Math.random() * 20) - 10;
    if (state.marketData.supply[itemName] === undefined) state.marketData.supply[itemName] = BASE_SUPPLY + Math.floor(Math.random() * 20) - 10;
}


// Adjust prices based on supply and demand
function adjustPricesBySupplyAndDemand(state: GameState): void {
  // Add explicit type for item parameter
  state.market.forEach((item: MarketItem) => {
    ensureMarketData(state, item.name);
    const demand = state.marketData.demand[item.name];
    const supply = state.marketData.supply[item.name];
    const pressure = Math.max(-1, Math.min(1, (demand - supply) / 100));
    const itemVolatility = item.volatility || 1.0;
    const maxChange = VOLATILITY_MULTIPLIER_BASE * itemVolatility;
    const priceChangePercent = pressure * maxChange;
    let newPrice = item.price * (1 + priceChangePercent);
    const maxPriceJump = item.price * MAX_PRICE_JUMP_FACTOR;
    newPrice = Math.max(item.price - maxPriceJump, Math.min(item.price + maxPriceJump, newPrice));
    const minimumPrice = Math.max(1, Math.round(item.basePrice * MINIMUM_PRICE_FACTOR));
    newPrice = Math.max(minimumPrice, Math.round(newPrice));
    if (newPrice !== item.price) {
        item.price = newPrice; item.lastPriceChange = state.time.dayCount;
        if (!item.priceHistory) item.priceHistory = []; item.priceHistory.push(item.price);
        if (item.priceHistory.length > 20) item.priceHistory.shift();
    }
  });
}

// Apply price memory
function applyPriceMemory(state: GameState): void {
  // Add explicit type for item parameter
  state.market.forEach((item: MarketItem) => {
    const base = item.basePrice; if (item.price === base || item.lastPriceChange === undefined) return;
    const daysSinceLastChange = state.time.dayCount - item.lastPriceChange;
    if (daysSinceLastChange > PRICE_MEMORY_GRACE_PERIOD) {
      const revertStrength = Math.min(0.3, PRICE_MEMORY_DECAY_RATE * (daysSinceLastChange - PRICE_MEMORY_GRACE_PERIOD));
      const difference = item.price - base;
      if (Math.abs(difference) > 1) {
         const adjustment = difference * revertStrength;
         const adjustmentRounded = adjustment > 0 ? Math.floor(adjustment) : Math.ceil(adjustment);
          if (adjustmentRounded !== 0) {
               item.price -= adjustmentRounded;
               const minimumPrice = Math.max(1, Math.round(item.basePrice * MINIMUM_PRICE_FACTOR));
               item.price = Math.max(minimumPrice, item.price);
          }
      }
       if (Math.abs(item.price - base) <= 1) item.price = base;
    }
  });
}

// Apply moon phase effects
function applyMoonPhaseEffects(state: GameState): void {
    const currentPhase = state.time.phaseName; const factors: string[] = [];
    // Define type explicitly for moonEffects variable
    const moonEffects: Partial<Record<MoonPhase, {
        priceEffects?: Partial<Record<ItemCategory | ItemType, number>>;
        availability?: 'add' | 'remove';
        items?: string[];
        generalEffect?: number;
    }>> = {
        "New Moon": { priceEffects: { "ritual_item": 1.15, "seed": 0.95, "mushroom": 1.1 }, availability: 'add', items: ["ing_nightcap"] },
        "Waxing Crescent": { priceEffects: { "seed": 1.15, "herb": 1.05 } },
        "First Quarter": { priceEffects: { "tool": 1.05, "fruit": 1.05 } },
        "Waxing Gibbous": { priceEffects: { "root": 1.1, "potion": 1.05 } },
        "Full Moon": { priceEffects: { "potion": 1.25, "flower": 1.1, "crystal": 1.1 }, availability: 'add', items: ["ritual_moonstone", "ing_sacred_lotus", "ing_moonbud"] },
        "Waning Gibbous": { priceEffects: { "ingredient": 1.05, "elixir": 1.05 } },
        "Last Quarter": { priceEffects: { "herb": 0.9, "talisman": 1.1 } },
        "Waning Crescent": { priceEffects: { "crystal": 0.9, "ingredient": 0.95 } }
    };
    const effect = moonEffects[currentPhase]; // Type inference should work here
    if (effect?.priceEffects) {
        // Add explicit type for item parameter
        state.market.forEach((item: MarketItem) => {
            // Non-null assertion okay due to check above
            const categoryMultiplier = effect.priceEffects![item.category] ?? 1.0;
            const typeMultiplier = effect.priceEffects![item.type] ?? 1.0;
            const multiplier = categoryMultiplier !== 1.0 ? categoryMultiplier : typeMultiplier;
            if (multiplier !== 1.0) {
                const oldPrice = item.price; item.price = Math.max(1, Math.round(item.price * multiplier));
                if (item.price !== oldPrice) { factors.push(`${item.name} price ${multiplier > 1.0 ? 'increased' : 'decreased'}.`); item.lastPriceChange = state.time.dayCount; }
            }
        });
    }
    const allMoonAffectedItemIds = new Set<string>(); Object.values(moonEffects).forEach(phaseEffect => { phaseEffect?.items?.forEach((id: string) => allMoonAffectedItemIds.add(id)); }); // Added type
    const itemsToAddThisPhase = new Set<string>(effect?.items ?? []);
    // Add explicit type for item parameter
    state.market = state.market.filter((item: MarketItem) => { if (allMoonAffectedItemIds.has(item.id) && !itemsToAddThisPhase.has(item.id)) { factors.push(`${item.name} unavailable.`); delete state.marketData.demand[item.name]; delete state.marketData.supply[item.name]; return false; } return true; });
    itemsToAddThisPhase.forEach(itemId => {
        // Add explicit type for item parameter
        if (!state.market.some((item: MarketItem) => item.id === itemId)) {
            const itemData = getItemData(itemId); if (itemData) {
                let startingPrice = itemData.value || 10; if (effect?.priceEffects) { const catMult = effect.priceEffects[itemData.category ?? 'misc'] ?? 1.0; const typeMult = effect.priceEffects[itemData.type] ?? 1.0; startingPrice = Math.round(startingPrice * (catMult !== 1.0 ? catMult : typeMult)); }
                const newItem: MarketItem = { id: itemData.id, name: itemData.name, type: itemData.type, category: itemData.category || 'misc', price: Math.max(1, startingPrice), basePrice: itemData.value || 10, description: itemData.description || "A phase-specific item.", rarity: itemData.rarity || 'uncommon', priceHistory: [Math.max(1, startingPrice)], lastPriceChange: state.time.dayCount };
                state.market.push(newItem); ensureMarketData(state, newItem.name); factors.push(`${newItem.name} available.`);
            }
        }
    });
}

// Apply seasonal effects
function applySeasonalEffects(state: GameState): void {
    const currentSeason = state.time.season; const factors: string[] = [];
    const seasonalPriceMods: Partial<Record<Season, Partial<Record<ItemCategory | ItemType, number>>>> = { /* ... definitions ... */ };
    const seasonalSupplyDemandMods: Partial<Record<Season, Partial<Record<ItemCategory | ItemType, { supply: number, demand: number }>>>> = { /* ... definitions ... */ };
    const priceEffects = seasonalPriceMods[currentSeason] ?? {}; const sdEffects = seasonalSupplyDemandMods[currentSeason] ?? {};
    // Add explicit type for item parameter
    state.market.forEach((item: MarketItem) => {
        const categoryPriceMod = priceEffects[item.category] ?? 1.0; const typePriceMod = priceEffects[item.type] ?? 1.0; const priceMultiplier = categoryPriceMod !== 1.0 ? categoryPriceMod : typePriceMod;
        if (priceMultiplier !== 1.0) { const oldPrice = item.price; item.price = Math.max(1, Math.round(item.price * priceMultiplier)); if (item.price !== oldPrice) { factors.push(`${item.name} price changed.`); item.lastPriceChange = state.time.dayCount; } }
        ensureMarketData(state, item.name); const categorySDMod = sdEffects[item.category]; const typeSDMod = sdEffects[item.type]; const sdMod = categorySDMod ?? typeSDMod;
        if (sdMod) { state.marketData.supply[item.name] = Math.max(5, Math.min(95, state.marketData.supply[item.name] + sdMod.supply)); state.marketData.demand[item.name] = Math.max(5, Math.min(95, state.marketData.demand[item.name] + sdMod.demand)); factors.push(`${item.name} S/D shifted.`); }
        if(item.seasonalBonus === currentSeason) { ensureMarketData(state, item.name); state.marketData.supply[item.name] = Math.min(95, state.marketData.supply[item.name] + 10); state.marketData.demand[item.name] = Math.min(95, state.marketData.demand[item.name] + 5); }
    });
}

// Apply rumor effects
function applyRumorEffects(state: GameState): void {
  // Add explicit type for rumor parameter
  const activeRumors = state.rumors.filter((rumor: Rumor) => (rumor.spread ?? 0) > 10 && rumor.affectedItem);
  const factors: string[] = [];
  // Add explicit type for rumor parameter
  activeRumors.forEach((rumor: Rumor) => {
    if (!rumor.affectedItem) return;
    // Add explicit type for item parameter
    const affectedMarketItems = state.market.filter((item: MarketItem) => item.name === rumor.affectedItem);
    if (affectedMarketItems.length === 0) return;
    const spreadFactor = (rumor.spread ?? 0) / 100;
    if (rumor.priceEffect !== undefined && rumor.priceEffect !== 0) {
      const effectStrength = spreadFactor * rumor.priceEffect;
      // Add explicit type for item parameter
      affectedMarketItems.forEach((item: MarketItem) => {
        const oldPrice = item.price; item.price = Math.max(1, Math.round(item.price * (1 + effectStrength)));
         if (item.price !== oldPrice) { factors.push(`Rumor changed ${item.name} price.`); item.lastPriceChange = state.time.dayCount; }
      });
    }
    ensureMarketData(state, rumor.affectedItem);
    if (rumor.priceEffect !== undefined) {
        const demandChange = (rumor.priceEffect > 0 ? 1 : -1) * spreadFactor * 20; const supplyChange = (rumor.priceEffect > 0 ? -1 : 1) * spreadFactor * 15;
        if(demandChange !== 0) state.marketData.demand[rumor.affectedItem] = Math.max(5, Math.min(95, (state.marketData.demand[rumor.affectedItem] ?? BASE_DEMAND) + demandChange));
        if(supplyChange !== 0) state.marketData.supply[rumor.affectedItem] = Math.max(5, Math.min(95, (state.marketData.supply[rumor.affectedItem] ?? BASE_SUPPLY) + supplyChange));
        if(demandChange !== 0 || supplyChange !== 0) factors.push(`Rumor adjusted ${rumor.affectedItem} S/D.`);
    }
  });
}

// Update black market prices
function updateBlackMarketPrices(state: GameState): void {
  if (!state.marketData.blackMarketUnlocked) return;
  // Add explicit type for item parameter
  state.market.forEach((item: MarketItem) => {
    if (!item.blackMarketOnly) return;
    const volatility = item.volatility ?? 1.5; const randomNoise = (Math.random() * 2 - 1) * 0.15 * volatility;
    const baseReversion = (item.basePrice - item.price) * 0.01; let newPrice = item.price * (1 + randomNoise) + baseReversion;
    const minimumPrice = Math.max(1, Math.round(item.basePrice * 0.1)); newPrice = Math.max(minimumPrice, Math.round(newPrice));
    if(newPrice !== item.price) {
        item.price = newPrice; item.lastPriceChange = state.time.dayCount;
         if (!item.priceHistory) item.priceHistory = []; item.priceHistory.push(item.price);
         if (item.priceHistory.length > 10) item.priceHistory.shift();
    }
  });
}

// Update global inflation
function updateInflation(state: GameState): void {
  const previousInflation = state.marketData.inflation; const tradingVolume = state.marketData.tradingVolume; let inflationChange = 0;
  if (tradingVolume > TRADING_VOLUME_THRESHOLD * 1.5) inflationChange = INFLATION_RATE_PER_VOLUME * (tradingVolume - TRADING_VOLUME_THRESHOLD);
  else if (tradingVolume < TRADING_VOLUME_THRESHOLD * 0.5) inflationChange = -DEFLATION_RATE_LOW_VOLUME;
  else inflationChange = (1.0 - previousInflation) * 0.01;
  let newInflation = previousInflation + inflationChange; newInflation = Math.min(1.5, Math.max(0.8, newInflation));
  if (Math.abs(newInflation - previousInflation) > 0.001) {
       state.marketData.inflation = newInflation;
       const basePriceAdjustmentFactor = (newInflation - previousInflation) * 0.1;
       // Add explicit type for item parameter
       state.market.forEach((item: MarketItem) => {
            if(!item.blackMarketOnly) { const oldBase = item.basePrice; item.basePrice = Math.max(1, Math.round(oldBase * (1 + basePriceAdjustmentFactor))); }
        });
        if (Math.abs(newInflation - 1.0) > 0.05) { state.journal.push({ id: `inf-${state.time.dayCount}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: `Market prices feel ${newInflation > 1.0 ? 'inflated' : 'deflated'} (${newInflation.toFixed(2)}).`, category: 'market', importance: 2, readByPlayer: false }); }
  }
  state.marketData.tradingVolume = 0;
}

// Main function to apply all market events for the turn
export function applyMarketEvents(state: GameState): void {
  applySeasonalEffects(state);
  applyMoonPhaseEffects(state);
  applyRumorEffects(state);
  applyPriceMemory(state);
  adjustPricesBySupplyAndDemand(state);
  updateBlackMarketPrices(state);
  updateInflation(state);
}