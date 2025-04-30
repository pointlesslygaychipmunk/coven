// src/townRequests.ts
// Generates town requests (orders from towns) based on season and needs.

// Use package name import
import { TownRequest, Season, GameState, Item } from "coven-shared";
import { ITEMS } from "./items.js";

let requestCounter = 0;

// Define type for requester objects
type TownRequester = { name: string; roles: string[] };

// List of possible town requesters
const townRequesters: TownRequester[] = [
  { name: "Apothecary Elise", roles: ['potion', 'ingredient'] }, { name: "Herbalist Jun", roles: ['herb', 'root', 'leaf'] }, { name: "Mayor Thorne", roles: ['potion', 'rare_ingredient'] }, { name: "Scholar Mei", roles: ['ingredient', 'crystal', 'essence'] }, { name: "Innkeeper Aldric", roles: ['fruit', 'herb', 'potion'] }, { name: "Healer Lyra", roles: ['soothing_potion', 'herb', 'flower'] }, { name: "Merchant Karam", roles: ['any'] }, { name: "Elder Witch Isolde", roles: ['ritual_item', 'rare_potion', 'rare_ingredient'] }, { name: "Farmer Tomas", roles: ['seed', 'tool', 'basic_ingredient'] }, { name: "Midwife Clara", roles: ['soothing_herb', 'tonic'] }, { name: "Alchemist Gareth", roles: ['crystal', 'essence', 'rare_ingredient'] }, { name: "Perfumer Dahlia", roles: ['flower', 'essence', 'oil'] }
];

// Define request template interface
interface RequestTemplate { filter: (item: Item) => boolean; min: number; max: number; rewardMult: number; difficultyBoost?: number; }

// Explicitly type requestTemplates
const requestTemplates: Record<Season, RequestTemplate[]> = {
  "Spring": [ { filter: (item: Item) => item.type === 'seed', min: 3, max: 8, rewardMult: 0.8 }, { filter: (item: Item) => item.category === 'root' && item.rarity === 'common', min: 2, max: 5, rewardMult: 1.0 }, { filter: (item: Item) => item.name === 'Spring Root', min: 1, max: 3, rewardMult: 1.5, difficultyBoost: 1 }, { filter: (item: Item) => item.category === 'tonic' && item.rarity === 'uncommon', min: 1, max: 2, rewardMult: 1.2 }, ],
  "Summer": [ { filter: (item: Item) => item.category === 'fruit', min: 3, max: 6, rewardMult: 0.9 }, { filter: (item: Item) => item.category === 'flower' && item.rarity !== 'rare', min: 2, max: 5, rewardMult: 1.0 }, { filter: (item: Item) => item.category === 'oil', min: 1, max: 2, rewardMult: 1.3, difficultyBoost: 1 }, { filter: (item: Item) => item.name === 'Sunpetal', min: 2, max: 4, rewardMult: 1.1 }, ],
  "Fall": [ { filter: (item: Item) => item.category === 'herb', min: 4, max: 8, rewardMult: 0.9 }, { filter: (item: Item) => item.category === 'mushroom', min: 2, max: 6, rewardMult: 1.0 }, { filter: (item: Item) => item.category === 'root' && item.rarity !== 'common', min: 1, max: 3, rewardMult: 1.4, difficultyBoost: 1 }, { filter: (item: Item) => item.category === 'elixir', min: 1, max: 1, rewardMult: 1.6, difficultyBoost: 2 }, ],
  "Winter": [ { filter: (item: Item) => item.category === 'potion' && item.rarity === 'rare', min: 1, max: 1, rewardMult: 1.8, difficultyBoost: 2 }, { filter: (item: Item) => item.category === 'crystal', min: 1, max: 2, rewardMult: 1.3 }, { filter: (item: Item) => item.type === 'ingredient' && item.rarity === 'rare', min: 1, max: 2, rewardMult: 1.5, difficultyBoost: 1 }, { filter: (item: Item) => item.category === 'mask', min: 1, max: 2, rewardMult: 1.2 }, ]
};

// Generate potential request descriptions
function generateRequestDescription(requester: TownRequester, item: string, quantity: number): string {
  const role = requester.roles[Math.floor(Math.random() * requester.roles.length)];
  const templates = [ `${requester.name} needs ${quantity} ${item}(s).`, `A client of ${requester.name} requires ${quantity} ${item}(s).`, `${requester.name} is running low on ${item}.`, `For research, ${requester.name} seeks ${quantity} ${item}(s).`, `${requester.name} offers fair price for ${quantity} ${item}(s).`, `Supply ${requester.name} with ${quantity} ${item}(s)?` ];
  if (role.includes('potion')) templates.push(`${requester.name} needs ${quantity} ${item}(s) for a brew.`);
  if (role.includes('herb')) templates.push(`Harvest poor; ${requester.name} needs ${quantity} ${item}(s).`);
  if (role.includes('ritual') || role.includes('rare')) templates.push(`${requester.name} seeks ${quantity} ${item}(s) for ritual.`);
  return templates[Math.floor(Math.random() * templates.length)];
}

export function generateTownRequests(state: GameState): TownRequest[] {
  const currentSeason = state.time.season; const templatesForSeason = requestTemplates[currentSeason as keyof typeof requestTemplates] || [];
  const possibleItems = ITEMS; const requests: TownRequest[] = []; const numRequestsToGenerate = 1 + Math.floor(Math.random() * 3);
  const existingRequestItems = state.townRequests.map((r: TownRequest) => r.item); // Added type
  for (let i = 0; i < numRequestsToGenerate && templatesForSeason.length > 0; i++) {
    const templateIndex = Math.floor(Math.random() * templatesForSeason.length); const template = templatesForSeason[templateIndex];
    const matchingItems = possibleItems.filter((item: Item) => template.filter(item)); if (matchingItems.length === 0) continue; // Added type
    const availableItems = matchingItems.filter((item: Item) => !existingRequestItems.includes(item.name)); // Added type
    const itemToRequest = availableItems.length > 0 ? availableItems[Math.floor(Math.random() * availableItems.length)] : matchingItems[Math.floor(Math.random() * matchingItems.length)];
    if (!itemToRequest || !itemToRequest.value) continue;
    const quantity = Math.floor(Math.random() * (template.max - template.min + 1)) + template.min; const baseItemValue = itemToRequest.value;
    let rewardMultiplier: number = template.rewardMult; if (itemToRequest.primaryProperty === 'soothing') rewardMultiplier *= 1.1;
    const rewardGold = Math.round(quantity * baseItemValue * rewardMultiplier * (1 + Math.random() * 0.2));
    const rewardInfluence = Math.max(1, Math.floor(quantity * (rewardMultiplier / 2)) + (itemToRequest.rarity === 'rare' ? 2 : (itemToRequest.rarity === 'uncommon' ? 1 : 0)));
    // Added explicit types to filter/some callbacks
    const suitableRequesters = townRequesters.filter((r: TownRequester) =>
        r.roles.includes('any') ||
        r.roles.includes(itemToRequest.type) ||
        r.roles.includes(itemToRequest.category) ||
        (itemToRequest.rarity && itemToRequest.rarity !== 'common' && r.roles.some((role: string) => role.includes('rare'))) ||
        (itemToRequest.primaryProperty && r.roles.some((role: string) => role.includes(itemToRequest.primaryProperty!)))
    );
    const requester = suitableRequesters.length > 0 ? suitableRequesters[Math.floor(Math.random() * suitableRequesters.length)] : townRequesters[Math.floor(Math.random() * townRequesters.length)];
    const description = generateRequestDescription(requester, itemToRequest.name, quantity);
    const difficulty = Math.min(5, Math.max(1, Math.round(rewardGold / 25) + (itemToRequest.rarity === 'rare' ? 1 : 0) + (template.difficultyBoost || 0) ));
    const newRequest: TownRequest = { id: `req-${++requestCounter}-${Date.now()}`, item: itemToRequest.name, quantity, rewardGold, rewardInfluence, requester: requester.name, description, difficulty, completed: false, };
    requests.push(newRequest); existingRequestItems.push(newRequest.item);
  }
  console.log(`[TownRequests] Generated ${requests.length} new requests for ${currentSeason}.`);
  return requests;
}