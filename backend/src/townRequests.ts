// src/townRequests.ts
// Generates town requests (orders from towns) based on season and needs.

// Use relative path import with .js extension
import { TownRequest, Season, GameState, Item } from "coven-shared";
import { ITEMS /*, getItemData */ } from "./items.js"; // getItemData is unused

let requestCounter = 0;

const townRequesters = [ /* ... unchanged ... */ ];
interface RequestTemplate { filter: (item: Item) => boolean; min: number; max: number; rewardMult: number; difficultyBoost?: number; }
const requestTemplates: Record<Season, RequestTemplate[]> = { /* ... unchanged ... */ };
function generateRequestDescription(requester: { name: string, roles: string[] }, item: string, quantity: number): string { /* ... unchanged ... */ }

export function generateTownRequests(state: GameState): TownRequest[] {
  const currentSeason = state.time.season; const templatesForSeason = requestTemplates[currentSeason] || [];
  const possibleItems = ITEMS; const requests: TownRequest[] = []; const numRequestsToGenerate = 1 + Math.floor(Math.random() * 3);
  const existingRequestItems = state.townRequests.map(r => r.item); // Param r implicitly any - FIXED
  for (let i = 0; i < numRequestsToGenerate && templatesForSeason.length > 0; i++) {
    const templateIndex = Math.floor(Math.random() * templatesForSeason.length); const template = templatesForSeason[templateIndex];
    const matchingItems = possibleItems.filter(template.filter); if (matchingItems.length === 0) continue;
    const availableItems = matchingItems.filter(item => !existingRequestItems.includes(item.name));
    const itemToRequest = availableItems.length > 0 ? availableItems[Math.floor(Math.random() * availableItems.length)] : matchingItems[Math.floor(Math.random() * matchingItems.length)];
    if (!itemToRequest || !itemToRequest.value) continue;
    const quantity = Math.floor(Math.random() * (template.max - template.min + 1)) + template.min; const baseItemValue = itemToRequest.value;
    let rewardMultiplier: number = template.rewardMult; if (itemToRequest.primaryProperty === 'soothing') rewardMultiplier *= 1.1;
    const rewardGold = Math.round(quantity * baseItemValue * rewardMultiplier * (1 + Math.random() * 0.2));
    const rewardInfluence = Math.max(1, Math.floor(quantity * (rewardMultiplier / 2)) + (itemToRequest.rarity === 'rare' ? 2 : (itemToRequest.rarity === 'uncommon' ? 1 : 0)));
    const suitableRequesters = townRequesters.filter(r => r.roles.includes('any') || r.roles.includes(itemToRequest.type) || r.roles.includes(itemToRequest.category) || (itemToRequest.rarity && itemToRequest.rarity !== 'common' && r.roles.some(role => role.includes('rare'))) || (itemToRequest.primaryProperty && r.roles.some(role => role.includes(itemToRequest.primaryProperty!))) );
    const requester = suitableRequesters.length > 0 ? suitableRequesters[Math.floor(Math.random() * suitableRequesters.length)] : townRequesters[Math.floor(Math.random() * townRequesters.length)];
    const description = generateRequestDescription(requester, itemToRequest.name, quantity);
    const difficulty = Math.min(5, Math.max(1, Math.round(rewardGold / 25) + (itemToRequest.rarity === 'rare' ? 1 : 0) + (template.difficultyBoost || 0) ));
    const newRequest: TownRequest = { id: `req-${++requestCounter}-${Date.now()}`, item: itemToRequest.name, quantity, rewardGold, rewardInfluence, requester: requester.name, description, difficulty, completed: false, };
    requests.push(newRequest); existingRequestItems.push(newRequest.item);
  }
  console.log(`[TownRequests] Generated ${requests.length} new requests for ${currentSeason}.`);
  return requests;
}