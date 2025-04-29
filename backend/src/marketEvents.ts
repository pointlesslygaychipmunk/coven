// src/marketEvents.ts
// Handles periodic market adjustments, including memory decay towards
// base prices, rumor impacts, and seasonal fluctuations.

import { GameState, MarketItem, Rumor, Season, MoonPhase, ItemCategory, ItemType } from "coven-shared";
import { getItemData } from "./items.js"; // Access base item data

const BASE_DEMAND = 50;
const BASE_SUPPLY = 50;
const PRICE_MEMORY_DECAY_RATE = 0.05; // 5% reversion per turn after grace period
const PRICE_MEMORY_GRACE_PERIOD = 3; // Days before price starts reverting
const VOLATILITY_MULTIPLIER_BASE = 0.05; // Max % change per turn from supply/demand
const INFLATION_RATE_PER_VOLUME = 0.00002; // Inflation increase per gold traded
const DEFLATION_RATE_LOW_VOLUME = 0.001; // Deflation per turn if volume is low
const TRADING_VOLUME_THRESHOLD = 150; // Gold threshold for inflation/deflation change
const MINIMUM_PRICE_FACTOR = 0.2; // Minimum price as a factor of basePrice (e.g., 20%)
const MAX_PRICE_JUMP_FACTOR = 0.3; // Max single-turn price change factor

// Helper to ensure market data (demand/supply) exists for an item
export function ensureMarketData(state: GameState, itemName: string) {
    if (state.marketData.demand[itemName] === undefined) {
        state.marketData.demand[itemName] = BASE_DEMAND + Math.floor(Math.random() * 20) - 10; // 40-60
    }
    if (state.marketData.supply[itemName] === undefined) {
        state.marketData.supply[itemName] = BASE_SUPPLY + Math.floor(Math.random() * 20) - 10; // 40-60
    }
}


// Adjust prices based on supply and demand
function adjustPricesBySupplyAndDemand(state: GameState): void {
  state.market.forEach(item => {
    ensureMarketData(state, item.name); // Ensure data exists
    const demand = state.marketData.demand[item.name];
    const supply = state.marketData.supply[item.name];

    // Calculate market pressure (-1.0 to 1.0, capped)
    const pressure = Math.max(-1, Math.min(1, (demand - supply) / 100));

    // Apply pressure-based price change
    const itemVolatility = item.volatility || 1.0;
    const maxChange = VOLATILITY_MULTIPLIER_BASE * itemVolatility;
    const priceChangePercent = pressure * maxChange;

    // Calculate new price
    let newPrice = item.price * (1 + priceChangePercent);

     // Prevent extreme jumps in one turn
     const maxPriceJump = item.price * MAX_PRICE_JUMP_FACTOR;
     newPrice = Math.max(item.price - maxPriceJump, Math.min(item.price + maxPriceJump, newPrice));

    // Ensure price doesn't go below minimum
    const minimumPrice = Math.max(1, Math.round(item.basePrice * MINIMUM_PRICE_FACTOR));
    newPrice = Math.max(minimumPrice, Math.round(newPrice)); // Round at the end

    if (newPrice !== item.price) {
        // console.log(`[Market] ${item.name} price change: ${item.price} -> ${newPrice} (Pressure: ${pressure.toFixed(2)})`);
        item.price = newPrice;
        item.lastPriceChange = state.time.dayCount;

        // Update price history
        if (!item.priceHistory) item.priceHistory = [];
        item.priceHistory.push(item.price);
        if (item.priceHistory.length > 20) item.priceHistory.shift();
    }
  });
}

// Apply price memory - prices gradually revert to base price over time
function applyPriceMemory(state: GameState): void {
  state.market.forEach(item => {
    const base = item.basePrice;
    if (item.price === base || item.lastPriceChange === undefined) return; // No change needed or never changed

    const daysSinceLastChange = state.time.dayCount - item.lastPriceChange;

    if (daysSinceLastChange > PRICE_MEMORY_GRACE_PERIOD) {
      const revertStrength = Math.min(0.3, PRICE_MEMORY_DECAY_RATE * (daysSinceLastChange - PRICE_MEMORY_GRACE_PERIOD));
      const difference = item.price - base;

      // Only adjust if the difference is significant enough to avoid rounding to 0
      if (Math.abs(difference) > 1) {
         const adjustment = difference * revertStrength;
         // Move towards base, but don't overshoot. Use ceil/floor to ensure movement.
         const adjustmentRounded = adjustment > 0 ? Math.floor(adjustment) : Math.ceil(adjustment);

          if (adjustmentRounded !== 0) {
               item.price -= adjustmentRounded;
               const minimumPrice = Math.max(1, Math.round(item.basePrice * MINIMUM_PRICE_FACTOR));
               item.price = Math.max(minimumPrice, item.price); // Ensure minimum price
               // console.log(`[Market] ${item.name} memory decay: -> ${item.price} (Base: ${base})`);
               // Don't update lastPriceChange here, memory isn't a market activity change
          }
      }
       // Snap to base if very close
       if (Math.abs(item.price - base) <= 1) {
            item.price = base;
       }
    }
  });
}

// Apply moon phase effects on market prices and item availability
function applyMoonPhaseEffects(state: GameState): void {
    const currentPhase = state.time.phaseName;
    const factors: string[] = []; // For logging/journal

    // Define moon phase effects (category/type, price multiplier, availability flag)
    // Added more specific effects based on vision
    const moonEffects: Partial<Record<MoonPhase, {
        priceEffects?: Partial<Record<ItemCategory | ItemType, number>>;
        availability?: 'add' | 'remove';
        items?: string[]; // Item IDs affected by availability
        generalEffect?: number; // General multiplier for all items? (Use sparingly)
    }>> = {
        "New Moon": {
            priceEffects: { "ritual_item": 1.15, "seed": 0.95, "mushroom": 1.1 }, // Rituals stronger, bad planting, good mushroom harvest?
            availability: 'add', items: ["ing_nightcap"]
        },
        "Waxing Crescent": {
            priceEffects: { "seed": 1.15, "herb": 1.05 } // Good planting, herbs growing
        },
        "First Quarter": {
            priceEffects: { "tool": 1.05, "fruit": 1.05 } // Crafting, fruits developing
        },
        "Waxing Gibbous": {
            priceEffects: { "root": 1.1, "potion": 1.05 } // Roots gathering energy, potions gaining potency
        },
        "Full Moon": {
            priceEffects: { "potion": 1.25, "flower": 1.1, "crystal": 1.1 }, // Potions peak, flowers bloom, crystals charged
            availability: 'add', items: ["ritual_moonstone", "ing_sacred_lotus", "ing_moonbud"] // Make Moonbud more common too
        },
        "Waning Gibbous": {
            priceEffects: { "ingredient": 1.05, "elixir": 1.05 } // Good general harvest, elixirs settling
        },
        "Last Quarter": {
            priceEffects: { "herb": 0.9, "talisman": 1.1 } // Herbs declining, good time for protective talismans?
        },
        "Waning Crescent": {
            priceEffects: { "crystal": 0.9, "ingredient": 0.95 } // Crystals discharging, ingredients losing potency
        }
    };

    // --- Apply Price Effects ---
    const effect = moonEffects[currentPhase];
    if (effect?.priceEffects) {
        state.market.forEach(item => {
            const categoryMultiplier = effect.priceEffects![item.category] ?? 1.0;
            const typeMultiplier = effect.priceEffects![item.type] ?? 1.0;
            // Prioritize category effect, then type effect if category doesn't match
            const multiplier = categoryMultiplier !== 1.0 ? categoryMultiplier : typeMultiplier;

            if (multiplier !== 1.0) {
                const oldPrice = item.price;
                item.price = Math.max(1, Math.round(item.price * multiplier));
                if (item.price !== oldPrice) {
                    factors.push(`${item.name} price ${multiplier > 1.0 ? 'increased' : 'decreased'} due to ${currentPhase}.`);
                    item.lastPriceChange = state.time.dayCount;
                }
            }
        });
    }

    // --- Handle Item Availability ---
    // Define all items potentially affected by moon phases
    const allMoonAffectedItemIds = new Set<string>();
    Object.values(moonEffects).forEach(phaseEffect => {
        phaseEffect?.items?.forEach(id => allMoonAffectedItemIds.add(id));
    });

    const itemsToAddThisPhase = new Set<string>(effect?.items ?? []);

    // Remove items not meant for this phase
    state.market = state.market.filter(item => {
        if (allMoonAffectedItemIds.has(item.id) && !itemsToAddThisPhase.has(item.id)) {
            factors.push(`${item.name} became unavailable as the ${currentPhase} begins.`);
            // Clear demand/supply? Optional, might recover when it returns
             delete state.marketData.demand[item.name];
             delete state.marketData.supply[item.name];
            return false; // Remove from market
        }
        return true; // Keep in market
    });

    // Add items specific to this phase if they aren't already there
    itemsToAddThisPhase.forEach(itemId => {
        if (!state.market.some(item => item.id === itemId)) {
            const itemData = getItemData(itemId);
            if (itemData) {
                // Determine starting price based on potential phase effect
                let startingPrice = itemData.value || 10;
                if (effect?.priceEffects) {
                     const categoryMultiplier = effect.priceEffects[itemData.category ?? ''] ?? 1.0;
                     const typeMultiplier = effect.priceEffects[itemData.type] ?? 1.0;
                     const multiplier = categoryMultiplier !== 1.0 ? categoryMultiplier : typeMultiplier;
                     startingPrice = Math.round(startingPrice * multiplier);
                }

                const newItem: MarketItem = {
                    id: itemData.id, name: itemData.name, type: itemData.type,
                    category: itemData.category || 'misc',
                    price: Math.max(1, startingPrice),
                    basePrice: itemData.value || 10,
                    description: itemData.description || "A phase-specific item.",
                    rarity: itemData.rarity || 'uncommon',
                    priceHistory: [Math.max(1, startingPrice)],
                    lastPriceChange: state.time.dayCount
                };
                state.market.push(newItem);
                ensureMarketData(state, newItem.name); // Init demand/supply
                factors.push(`${newItem.name} became available during the ${currentPhase}.`);
            }
        }
    });

    // Add journal entries if significant changes occurred
    // if (factors.length > 1) { // Avoid logging just one minor change maybe
    //     state.journal.push({ /* Add journal entry about moon effects */ });
    // }
}

// Apply seasonal effects (price, supply/demand)
function applySeasonalEffects(state: GameState): void {
    const currentSeason = state.time.season;
    const factors: string[] = [];

    const seasonalPriceMods: Partial<Record<Season, Partial<Record<ItemCategory | ItemType, number>>>> = {
        "Spring": { "seed": 1.25, "flower": 0.9, "tonic": 1.1 },
        "Summer": { "fruit": 0.85, "herb": 1.1, "oil": 1.15, "flower": 1.05 },
        "Fall":   { "root": 1.15, "mushroom": 0.8, "elixir": 1.1, "seed": 0.9 },
        "Winter": { "herb": 1.25, "crystal": 1.1, "mask": 1.2, "root": 1.05 }
    };
    const seasonalSupplyDemandMods: Partial<Record<Season, Partial<Record<ItemCategory | ItemType, { supply: number, demand: number }>>>> = {
         "Spring": { "seed": { supply: -15, demand: +20 }, "flower": { supply: +10, demand: 0 } },
         "Summer": { "fruit": { supply: +15, demand: +5 }, "herb": { supply: -10, demand: +5 } },
         "Fall":   { "root": { supply: +10, demand: +10 }, "mushroom": { supply: +20, demand: +5 } },
         "Winter": { "herb": { supply: -15, demand: +10 }, "potion": { supply: -5, demand: +15 } } // General potion demand up
    };


    const priceEffects = seasonalPriceMods[currentSeason] ?? {};
    const sdEffects = seasonalSupplyDemandMods[currentSeason] ?? {};

    state.market.forEach(item => {
        // Apply Price Mods
        const categoryPriceMod = priceEffects[item.category] ?? 1.0;
        const typePriceMod = priceEffects[item.type] ?? 1.0;
        const priceMultiplier = categoryPriceMod !== 1.0 ? categoryPriceMod : typePriceMod;
        if (priceMultiplier !== 1.0) {
            const oldPrice = item.price;
            item.price = Math.max(1, Math.round(item.price * priceMultiplier));
            if (item.price !== oldPrice) {
                 factors.push(`${item.name} price ${priceMultiplier > 1.0 ? 'increase' : 'decrease'} in ${currentSeason}.`);
                 item.lastPriceChange = state.time.dayCount;
            }
        }

        // Apply Supply/Demand Mods
        ensureMarketData(state, item.name);
        const categorySDMod = sdEffects[item.category];
        const typeSDMod = sdEffects[item.type];
        const sdMod = categorySDMod ?? typeSDMod;
        if (sdMod) {
             state.marketData.supply[item.name] = Math.max(5, Math.min(95, state.marketData.supply[item.name] + sdMod.supply));
             state.marketData.demand[item.name] = Math.max(5, Math.min(95, state.marketData.demand[item.name] + sdMod.demand));
             factors.push(`${item.name} supply/demand shifted in ${currentSeason}.`);
        }

         // Apply inherent seasonal bonus flag (makes item generally better/more available in its season)
         if(item.seasonalBonus === currentSeason) {
            ensureMarketData(state, item.name);
            state.marketData.supply[item.name] = Math.min(95, state.marketData.supply[item.name] + 10);
            state.marketData.demand[item.name] = Math.min(95, state.marketData.demand[item.name] + 5);
        }
    });

    // Log major changes
    // if (factors.length > 2) { state.journal.push({...}) }
}

// Apply effects of rumors on market prices and demand/supply
function applyRumorEffects(state: GameState): void {
  const activeRumors = state.rumors.filter(rumor => (rumor.spread ?? 0) > 10 && rumor.affectedItem); // Only apply rumors with some spread
  const factors: string[] = [];

  activeRumors.forEach(rumor => {
    if (!rumor.affectedItem) return;

    const affectedMarketItems = state.market.filter(item => item.name === rumor.affectedItem);
    if (affectedMarketItems.length === 0) return;

    const spreadFactor = (rumor.spread ?? 0) / 100; // 0.0 to 1.0

    // --- Price Effect ---
    if (rumor.priceEffect) {
      const effectStrength = spreadFactor * rumor.priceEffect;
      affectedMarketItems.forEach(item => {
        const oldPrice = item.price;
        item.price = Math.max(1, Math.round(item.price * (1 + effectStrength)));
         if (item.price !== oldPrice) {
             factors.push(`Rumor about ${item.name} (${rumor.spread?.toFixed(0)}% spread) ${effectStrength > 0 ? 'increased' : 'decreased'} price.`);
             item.lastPriceChange = state.time.dayCount;
         }
      });
    }

    // --- Demand/Supply Effect ---
    // Shortage rumors increase demand & decrease supply, Surplus do the opposite
    ensureMarketData(state, rumor.affectedItem);
    const demandChange = (rumor.priceEffect > 0 ? 1 : (rumor.priceEffect < 0 ? -1 : 0)) * spreadFactor * 20; // Max +/- 20 change
    const supplyChange = (rumor.priceEffect > 0 ? -1 : (rumor.priceEffect < 0 ? 1 : 0)) * spreadFactor * 15; // Max +/- 15 change

    if(demandChange !== 0) state.marketData.demand[rumor.affectedItem] = Math.max(5, Math.min(95, state.marketData.demand[rumor.affectedItem] + demandChange));
    if(supplyChange !== 0) state.marketData.supply[rumor.affectedItem] = Math.max(5, Math.min(95, state.marketData.supply[rumor.affectedItem] + supplyChange));

    if(demandChange !== 0 || supplyChange !== 0) {
        factors.push(`Rumor adjusted supply/demand for ${rumor.affectedItem}.`);
    }
  });

  // Log significant rumor impacts
  // if (factors.length > 0) { state.journal.push({...}) }
}

// Handle black market price updates (more volatile)
function updateBlackMarketPrices(state: GameState): void {
  if (!state.marketData.blackMarketUnlocked) return;

  state.market.forEach(item => {
    if (!item.blackMarketOnly) return;

    // Higher base volatility and less memory
    const volatility = item.volatility ?? 1.5; // BM items are more volatile by default
    const randomNoise = (Math.random() * 2 - 1) * 0.15 * volatility; // +/- 15% base noise * item volatility

    // Weak pull towards base price
    const baseReversion = (item.basePrice - item.price) * 0.01; // Only 1% pull

    let newPrice = item.price * (1 + randomNoise) + baseReversion;

    // Black market minimum can be lower
    const minimumPrice = Math.max(1, Math.round(item.basePrice * 0.1));
    newPrice = Math.max(minimumPrice, Math.round(newPrice));

    if(newPrice !== item.price) {
        // console.log(`[BlackMarket] ${item.name} price change: ${item.price} -> ${newPrice}`);
        item.price = newPrice;
        item.lastPriceChange = state.time.dayCount;
         if (!item.priceHistory) item.priceHistory = [];
         item.priceHistory.push(item.price);
         if (item.priceHistory.length > 10) item.priceHistory.shift();
    }
  });
}


// Adjust global inflation factor based on trading volume
function updateInflation(state: GameState): void {
  const previousInflation = state.marketData.inflation;
  const tradingVolume = state.marketData.tradingVolume;
  let inflationChange = 0;

  if (tradingVolume > TRADING_VOLUME_THRESHOLD * 1.5) { // Strong inflation if volume very high
    inflationChange = INFLATION_RATE_PER_VOLUME * (tradingVolume - TRADING_VOLUME_THRESHOLD);
  } else if (tradingVolume < TRADING_VOLUME_THRESHOLD * 0.5) { // Deflation if volume very low
    inflationChange = -DEFLATION_RATE_LOW_VOLUME;
  } else {
       // Tend towards 1.0 if volume is moderate
       inflationChange = (1.0 - previousInflation) * 0.01; // Weak pull back to 1.0
  }

  let newInflation = previousInflation + inflationChange;
  newInflation = Math.min(1.5, Math.max(0.8, newInflation)); // Clamp inflation 0.8 - 1.5

  if (Math.abs(newInflation - previousInflation) > 0.001) { // Only update if change is noticeable
       state.marketData.inflation = newInflation;

       // Apply gradual inflation adjustment to *base* prices
       const basePriceAdjustmentFactor = (newInflation - previousInflation) * 0.02; // Apply 2% of the change this turn
       state.market.forEach(item => {
           // Don't adjust black market base prices with global inflation? Or maybe less effect?
           if(!item.blackMarketOnly) {
               item.basePrice = Math.max(1, Math.round(item.basePrice * (1 + basePriceAdjustmentFactor)));
           }
       });
       state.journal.push({ id: `inf-${state.time.dayCount}`, turn: state.time.dayCount, date: `${state.time.phaseName}, ${state.time.season} Y${state.time.year}`, text: `Market prices feel ${newInflation > 1.05 ? 'inflated' : (newInflation < 0.95 ? 'deflated' : 'stable')} (${newInflation.toFixed(2)}).`, category: 'market', importance: 2, readByPlayer: false });
  }

  state.marketData.tradingVolume = 0; // Reset volume for next turn
}


// Main function to apply all market events for the turn
export function applyMarketEvents(state: GameState): void {
  // Order matters: Apply external factors first, then supply/demand, then memory.
  // 1. Apply seasonal effects (price mods, supply/demand shifts)
  applySeasonalEffects(state);
  // 2. Apply moon phase effects (price mods, availability)
  applyMoonPhaseEffects(state);
  // 3. Apply rumor effects (price mods, supply/demand shifts)
  applyRumorEffects(state);
  // 4. Apply price memory (reversion towards base price, happens before S/D pressure)
  applyPriceMemory(state);
  // 5. Apply supply and demand pressure based on current S/D levels
  adjustPricesBySupplyAndDemand(state);
  // 6. Update black market prices separately
  updateBlackMarketPrices(state);
  // 7. Update global inflation based on trading volume
  updateInflation(state);
}