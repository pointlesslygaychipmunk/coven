// src/rumorEngine.ts
// Generates rumors each turn and adds them to the game state.
// Rumors affect market prices, item availability, and player decisions.

import { GameState, Rumor, Player } from "coven-shared"; // Removed unused Season, MoonPhase, MarketItem, Rarity
import { ITEMS } from "./items.js"; // Access item database

// Counter for unique rumor IDs
let rumorCount = 0;

// Placeholder for rumor-related quests if needed
export const RUMOR_QUESTS = []; // Define actual quests if used

// Rumor templates for different types of effects
// {item} will be replaced with an item name
// {season}, {moonPhase}, {weather} for contextual rumors
const rumorTemplates = {
  // Price increase rumors (Shortage)
  shortage: [
    "Whispers claim {item} is becoming scarce due to a poor harvest.",
    "A blight reported in the {season} fields might lead to a shortage of {item}.",
    "Travelers warn that caravans carrying {item} were waylaid by storms.",
    "The Elder Witch is hoarding {item}, driving up demand!",
    "Seems like everyone wants {item} after that article in 'Witch Weekly'."
  ],

  // Price decrease rumors (Surplus)
  surplus: [
    "Farmers rejoice! An unexpected bumper crop of {item} this {season}.",
    "A large shipment of {item} just arrived at the docks, flooding the market.",
    "Seems like {item} is going out of fashion. Prices are dropping.",
    "The Trading Guild found a new source for {item}, supply is high.",
    "Too much {item} was brewed last {moonPhase}, now they're selling cheap."
  ],

  // Quality-related rumors (Good Quality)
  quality_good: [
    "They say {item} harvested under the {moonPhase} moon is exceptionally potent.",
    "The unique {weather} this {season} resulted in unusually high-quality {item}.",
    "Alchemist Notes: Found a way to enhance {item} purity using sunlight.",
    "I heard {item} from the northern gardens is the best quality this year.",
    "The {season} rains seem to have blessed the {item} crop."
  ],

   // Quality-related rumors (Poor Quality)
   quality_bad: [
    "Beware! Much of the {item} circulating now is diluted or poorly harvested.",
    "The recent {weather} seems to have damaged the quality of {item}.",
    "That cheap {item} from the eastern trader? Utterly weak, avoid it.",
    "Heard the latest batch of {item} was harvested too early, lacking potency.",
    "A pest infestation has affected the quality of {item} this {season}."
   ],

  // Special item/event rumors
  special: [
    "Rumor has it a rare 'Moonpetal' variant of {item} only appears during {moonPhase}.",
    "A wandering merchant mentioned possessing a legendary {item}, but only trades at midnight.",
    "Keep an eye out for {item} glowing faintly during the {weather} - said to have unique power.",
    "An old prophecy hints that {item} found near the ancient stones this {season} holds secrets.",
    "Someone whispered about a 'Black Market' dealing in forbidden {item}..."
  ]
};

// Selects a random item name, potentially biased towards relevant/valuable items
function pickRandomItemName(state: GameState): string {
  // Filter for items actually present in the market or common ingredients/potions
  const availableMarketItems = state.market.map(item => item.name).filter(name => !!name); // Filter out undefined names
  const commonItems = ITEMS
      .filter(item => item.type === 'ingredient' || item.type === 'potion')
      .map(item => item.name);

  const potentialTargets = [...new Set([...availableMarketItems, ...commonItems])];

  if (potentialTargets.length === 0) return "local herbs"; // Fallback

  // Simple random selection for now, could add weighting later
  const idx = Math.floor(Math.random() * potentialTargets.length);
  return potentialTargets[idx];
}


// Generate a list of rumors for the current game turn
export function generateRumors(state: GameState): Rumor[] {
  const newRumors: Rumor[] = [];
  const chanceOfNewRumor = 0.35; // 35% chance each turn

  if (Math.random() < chanceOfNewRumor) {
    // Select a rumor type category
    const rumorCategories = Object.keys(rumorTemplates);
    const category = rumorCategories[Math.floor(Math.random() * rumorCategories.length)] as keyof typeof rumorTemplates;

    // Select a specific template
    const templates = rumorTemplates[category];
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Select an item to rumor about
    const itemName = pickRandomItemName(state);

    // Replace placeholders
    let content = template.replace('{item}', itemName);
    content = content.replace('{season}', state.time.season);
    content = content.replace('{moonPhase}', state.time.phaseName);
    content = content.replace('{weather}', state.time.weatherFate);

    // Determine price effect based on rumor category
    let priceEffect = 0;
    // let affectsQuality = false; // Removed as it was unused
    if (category === 'shortage') {
      priceEffect = 0.1 + Math.random() * 0.15; // +10% to +25%
    } else if (category === 'surplus') {
      priceEffect = - (0.1 + Math.random() * 0.15); // -10% to -25%
    } else if (category === 'quality_good') {
      priceEffect = 0.05 + Math.random() * 0.10; // +5% to +15% (quality perception)
      // affectsQuality = true;
    } else if (category === 'quality_bad') {
       priceEffect = - (0.05 + Math.random() * 0.10); // -5% to -15%
       // affectsQuality = true;
    } else if (category === 'special') {
        // Special rumors might not always have a direct price effect initially
        priceEffect = Math.random() < 0.5 ? (0.05 + Math.random() * 0.10) : 0;
    }

    // Create the new rumor
    const newRumor: Rumor = {
      id: `rumor-${++rumorCount}-${Date.now()}`, // More unique ID
      content: content,
      spread: 5 + Math.floor(Math.random() * 10), // Initial spread 5-15%
      affectedItem: itemName,
      priceEffect: priceEffect !== 0 ? priceEffect : undefined, // Only include if non-zero
      duration: 4 + Math.floor(Math.random() * 5), // Lasts 4-8 turns
      verified: false, // Starts unverified
      origin: generateRumorSource(),
      turnsActive: 0,
      // affectsQuality: affectsQuality // Removed as unused
    };

    newRumors.push(newRumor);
    console.log(`[RumorEngine] Generated rumor: ${newRumor.content} (Affects: ${itemName}, Effect: ${priceEffect?.toFixed(2)})`);
  }

  return newRumors;
}

// Generate a plausible source for the rumor
function generateRumorSource(): string {
  const sources = [
    "a travelling merchant", "the town apothecary", "village gossip", "a hushed conversation",
    "the elder witch", "the town crier", "a weary farmer", "a wandering bard",
    "your own familiar", "a cryptic dream", "a letter from afar", "market whispers",
    "an old fisherman", "the innkeeper", "a scholar's notes"
  ];
  return sources[Math.floor(Math.random() * sources.length)];
}

// Update spread and duration of existing rumors, remove faded ones
export function processRumorEffects(state: GameState): void {
  const rumorsToRemove: string[] = [];

  state.rumors.forEach((rumor: Rumor) => {
    // Increment active counter
    rumor.turnsActive = (rumor.turnsActive || 0) + 1;

    // Decay duration if it exists
    if (rumor.duration !== undefined && rumor.duration > 0) {
      rumor.duration--;
    }

    // Spread or fade based on duration and verification
    const baseSpreadChange = 10; // Base spread increase per turn
    const baseFadeRate = 25; // Base fade decrease per turn

    if (rumor.duration === undefined || rumor.duration > 0) {
      // Rumor is still active, increase spread
      let spreadIncrease = baseSpreadChange;
      if (rumor.verified) {
        spreadIncrease *= 1.5; // Verified rumors spread faster
      }
      rumor.spread = Math.min(100, (rumor.spread ?? 0) + Math.round(spreadIncrease)); // Handle undefined spread
    } else {
      // Rumor duration ended, start fading
      let fadeAmount = baseFadeRate;
      if (!rumor.verified) {
          fadeAmount *= 1.5; // Unverified rumors fade faster
      }
      rumor.spread = Math.max(0, (rumor.spread ?? 0) - Math.round(fadeAmount)); // Handle undefined spread
    }

    // Mark for removal if spread is 0
    if (rumor.spread <= 0) {
      rumorsToRemove.push(rumor.id);
    }

    // --- Apply Secondary Effects (Optional) ---
    // Example: Verified shortage rumors slightly decrease actual market supply over time
    if (rumor.verified && rumor.spread > 60 && rumor.affectedItem && rumor.priceEffect && rumor.priceEffect > 0.1) {
      if (state.marketData.supply[rumor.affectedItem]) {
        state.marketData.supply[rumor.affectedItem] = Math.max(
          5, state.marketData.supply[rumor.affectedItem] - 2 // Small decrease each turn
        );
      }
    }
    // Example: Verified surplus rumors slightly increase supply
     if (rumor.verified && rumor.spread > 60 && rumor.affectedItem && rumor.priceEffect && rumor.priceEffect < -0.1) {
         if (state.marketData.supply[rumor.affectedItem]) {
             state.marketData.supply[rumor.affectedItem] = Math.min(
                 95, state.marketData.supply[rumor.affectedItem] + 2 // Small increase
             );
         }
     }
  });

  // Remove rumors that have faded completely
  if (rumorsToRemove.length > 0) {
    state.rumors = state.rumors.filter((rumor: Rumor) => !rumorsToRemove.includes(rumor.id));
    console.log(`[RumorEngine] Removed ${rumorsToRemove.length} faded rumors.`);
  }
}

// Action: Player attempts to verify a rumor
export function verifyRumor(state: GameState, playerId: string, rumorId: string): boolean {
  const rumor = state.rumors.find((r: Rumor) => r.id === rumorId);
  if (!rumor || rumor.verified) return false; // Already verified or doesn't exist

  // Verification might depend on player skills (e.g., Trading, Herbalism) or specific actions
  // Simple example: 50% base chance + skill bonus
  const player = state.players.find(p => p.id === playerId);
  // Ensure player and skills exist before accessing
  const tradingSkill = player?.skills?.trading || 1;
  const verificationChance = 0.5 + (tradingSkill / 20); // 50% + up to 50% from skill

  if (Math.random() < verificationChance) {
      rumor.verified = true;
      // Verified rumors spread faster and might last a bit longer
      rumor.spread = Math.min(100, (rumor.spread ?? 0) + 15);
      if (rumor.duration !== undefined) {
          rumor.duration += 1;
      }
      console.log(`[RumorEngine] Player ${playerId} verified rumor ${rumorId}.`);
      // Add Journal Entry
      state.journal.push({ id: `jv-${Date.now()}`, turn: state.time.dayCount, date: state.time.phaseName + ", " + state.time.season + " Y" + state.time.year, text: `You verified the rumor: "${rumor.content}"`, category: 'market', importance: 3, readByPlayer: false });
      return true;
  } else {
       console.log(`[RumorEngine] Player ${playerId} failed to verify rumor ${rumorId}.`);
       // Add Journal Entry
       state.journal.push({ id: `jf-${Date.now()}`, turn: state.time.dayCount, date: state.time.phaseName + ", " + state.time.season + " Y" + state.time.year, text: `You couldn't confirm the truth of the rumor: "${rumor.content}"`, category: 'market', importance: 2, readByPlayer: false });
       return false;
  }
}

// Action: Player spreads a rumor
export function spreadRumor(state: GameState, player: Player, rumorId: string): boolean {
  // Removed find player as player object is passed directly

  const rumor = state.rumors.find((r: Rumor) => r.id === rumorId);
  if (!rumor) return false;

  // Spreading costs a small amount of reputation or has a chance based on skill
  if (player.reputation < 2) {
      state.journal.push({ id: `jsr-${Date.now()}`, turn: state.time.dayCount, date: state.time.phaseName + ", " + state.time.season + " Y" + state.time.year, text: `Your reputation isn't high enough to effectively spread rumors.`, category: 'market', importance: 1, readByPlayer: false });
      return false; // Not enough reputation
  }
  player.reputation -= 1; // Cost to spread

  // Player's trading skill affects how well they spread rumors
  const tradingBonus = (player.skills.trading || 1) / 10; // 0.1 to 1.0 bonus

  // Increase spread significantly when player actively spreads it
  const spreadIncrease = 20 + Math.round(tradingBonus * 15); // +20-35 spread
  rumor.spread = Math.min(100, (rumor.spread ?? 0) + spreadIncrease); // Handle undefined spread

  // Slightly extend duration
  if (rumor.duration !== undefined) {
    rumor.duration = Math.min(12, rumor.duration + 1); // Cap duration extension
  }

  console.log(`[RumorEngine] Player ${player.id} spread rumor ${rumorId}, spread increased to ${rumor.spread}.`);
   state.journal.push({ id: `js-${Date.now()}`, turn: state.time.dayCount, date: state.time.phaseName + ", " + state.time.season + " Y" + state.time.year, text: `You helped spread the rumor: "${rumor.content}"`, category: 'market', importance: 2, readByPlayer: false });

  return true;
}

// Action: Create a custom rumor (e.g., player action, quest reward)
export function createCustomRumor(
  state: GameState,
  content: string,
  itemName: string,
  priceEffect: number,
  origin: string = "your own whispers", // Default origin
  initialSpread: number = 15,
  duration: number = 5,
  verified: boolean = true // Custom rumors often start verified
): Rumor {
  const newRumor: Rumor = {
    id: `rumor-${++rumorCount}-${Date.now()}`,
    content: content,
    spread: initialSpread,
    affectedItem: itemName,
    priceEffect: priceEffect,
    duration: duration,
    verified: verified,
    origin: origin,
    turnsActive: 0
  };

  state.rumors.push(newRumor);
  console.log(`[RumorEngine] Created custom rumor: ${content}`);
   state.journal.push({ id: `jc-${Date.now()}`, turn: state.time.dayCount, date: state.time.phaseName + ", " + state.time.season + " Y" + state.time.year, text: `A new rumor started: "${content}"`, category: 'market', importance: 3, readByPlayer: false });
  return newRumor;
}