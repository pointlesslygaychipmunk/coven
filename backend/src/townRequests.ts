// src/townRequests.ts
// Generates town requests (orders from towns) based on season and needs.

import { TownRequest, Season, GameState, Item, Rarity, ItemCategory } from "coven-shared"; // Import GameState
import { ITEMS, getItemData } from "./items.js"; // Access item database for validation, added getItemData

let requestCounter = 0;

// List of possible town requesters with associated roles/needs
const townRequesters = [
  { name: "Apothecary Elise", roles: ['potion', 'ingredient'] },
  { name: "Herbalist Jun", roles: ['herb', 'root', 'leaf'] },
  { name: "Mayor Thorne", roles: ['potion', 'rare_ingredient'] }, // Needs high value items
  { name: "Scholar Mei", roles: ['ingredient', 'crystal', 'essence'] }, // Needs research items
  { name: "Innkeeper Aldric", roles: ['fruit', 'herb', 'potion'] }, // Needs common supplies
  { name: "Healer Lyra", roles: ['soothing_potion', 'herb', 'flower'] }, // Needs healing items
  { name: "Merchant Karam", roles: ['any'] }, // Buys anything for resale
  { name: "Elder Witch Isolde", roles: ['ritual_item', 'rare_potion', 'rare_ingredient'] },
  { name: "Farmer Tomas", roles: ['seed', 'tool', 'basic_ingredient'] },
  { name: "Midwife Clara", roles: ['soothing_herb', 'tonic'] },
  { name: "Alchemist Gareth", roles: ['crystal', 'essence', 'rare_ingredient'] },
  { name: "Perfumer Dahlia", roles: ['flower', 'essence', 'oil'] }
];

// Define possible request templates, weighted by season and item type/category
// Structure: { itemFilter: (item) => boolean, minQty: number, maxQty: number, rewardMultiplier: number }
interface RequestTemplate {
    filter: (item: Item) => boolean;
    min: number;
    max: number;
    rewardMult: number;
    difficultyBoost?: number;
}
const requestTemplates: Record<Season, RequestTemplate[]> = {
  "Spring": [
    { filter: item => item.type === 'seed', min: 3, max: 8, rewardMult: 0.8 }, // High demand for seeds
    { filter: item => item.category === 'root' && item.rarity === 'common', min: 2, max: 5, rewardMult: 1.0 },
    { filter: item => item.name === 'Spring Root', min: 1, max: 3, rewardMult: 1.5, difficultyBoost: 1 }, // Specific seasonal item
    { filter: item => item.category === 'tonic' && item.rarity === 'uncommon', min: 1, max: 2, rewardMult: 1.2 }, // Revival tonics
  ],
  "Summer": [
    { filter: item => item.category === 'fruit', min: 3, max: 6, rewardMult: 0.9 },
    { filter: item => item.category === 'flower' && item.rarity !== 'rare', min: 2, max: 5, rewardMult: 1.0 },
    { filter: item => item.category === 'oil', min: 1, max: 2, rewardMult: 1.3, difficultyBoost: 1 }, // Protective oils
    { filter: item => item.name === 'Sunpetal', min: 2, max: 4, rewardMult: 1.1 },
  ],
  "Fall": [
    { filter: item => item.category === 'herb', min: 4, max: 8, rewardMult: 0.9 }, // Abundant herbs
    { filter: item => item.category === 'mushroom', min: 2, max: 6, rewardMult: 1.0 },
    { filter: item => item.category === 'root' && item.rarity !== 'common', min: 1, max: 3, rewardMult: 1.4, difficultyBoost: 1 }, // Valuable roots
    { filter: item => item.category === 'elixir', min: 1, max: 1, rewardMult: 1.6, difficultyBoost: 2 }, // Rare elixirs
  ],
  "Winter": [
    { filter: item => item.category === 'potion' && item.rarity === 'rare', min: 1, max: 1, rewardMult: 1.8, difficultyBoost: 2 }, // Need potent potions
    { filter: item => item.category === 'crystal', min: 1, max: 2, rewardMult: 1.3 },
    { filter: item => item.type === 'ingredient' && item.rarity === 'rare', min: 1, max: 2, rewardMult: 1.5, difficultyBoost: 1 },
    { filter: item => item.category === 'mask', min: 1, max: 2, rewardMult: 1.2 }, // Protective masks
  ]
};

// Generate potential request descriptions based on requester role
function generateRequestDescription(requester: { name: string, roles: string[] }, item: string, quantity: number): string {
  const role = requester.roles[Math.floor(Math.random() * requester.roles.length)]; // Pick a random role for flavor

  const templates = [
    `${requester.name} urgently needs ${quantity} ${item}(s) for a special order.`,
    `A client of ${requester.name} requires ${quantity} ${item}(s) for their unique needs.`,
    `${requester.name} is running low on ${item} and needs ${quantity} to restock.`,
    `For personal research, ${requester.name} is seeking ${quantity} high-quality ${item}(s).`,
    `${requester.name} will pay a fair price for ${quantity} ${item}(s) delivered promptly.`,
    `Can you supply ${requester.name} with ${quantity} ${item}(s)? They're preparing for the next ${role.includes('season') ? 'season' : 'festival'}.` // Contextual flavor
  ];

   // Simple context based on role
   if (role === 'potion' || role.includes('potion')) templates.push(`${requester.name} requires ${quantity} ${item}(s) for a complex new brew.`);
   if (role === 'herb' || role.includes('herb')) templates.push(`The ${item} harvest was poor; ${requester.name} needs ${quantity} more.`);
   if (role === 'ritual_item' || role.includes('rare')) templates.push(`${requester.name} seeks ${quantity} ${item}(s) for an upcoming ritual.`);

  return templates[Math.floor(Math.random() * templates.length)];
}

export function generateTownRequests(state: GameState): TownRequest[] { // Accept GameState
  const currentSeason = state.time.season;
  const templatesForSeason = requestTemplates[currentSeason] || [];
  const possibleItems = ITEMS; // Use the master item list
  const requests: TownRequest[] = [];

  // Determine how many requests to generate (e.g., 1-3, more if market is active?)
  const numRequestsToGenerate = 1 + Math.floor(Math.random() * 3); // 1 to 3 requests

  // Filter out items already heavily requested if too many requests exist
  const existingRequestItems = state.townRequests.map(r => r.item);

  for (let i = 0; i < numRequestsToGenerate && templatesForSeason.length > 0; i++) {
    // Select a template randomly
    const templateIndex = Math.floor(Math.random() * templatesForSeason.length);
    const template = templatesForSeason[templateIndex];

    // Find items matching the filter
    const matchingItems = possibleItems.filter(template.filter);
    if (matchingItems.length === 0) continue; // No items match this template

    // Select a specific item randomly from matching ones
    // Avoid items already heavily requested maybe?
    const availableItems = matchingItems.filter(item => !existingRequestItems.includes(item.name));
    const itemToRequest = availableItems.length > 0
        ? availableItems[Math.floor(Math.random() * availableItems.length)]
        : matchingItems[Math.floor(Math.random() * matchingItems.length)]; // Fallback if all are requested


    if (!itemToRequest || !itemToRequest.value) continue; // Skip if item has no base value

    // Generate quantity
    const quantity = Math.floor(Math.random() * (template.max - template.min + 1)) + template.min;

    // Calculate rewards based on item base value, quantity, and multiplier
    const baseItemValue = itemToRequest.value;
    // Adjust reward multiplier based on item properties if needed
    let rewardMultiplier: number;
    // Add primaryProperty to template definition if needed
    if (itemToRequest.primaryProperty) {
      rewardMultiplier = template.rewardMult * (itemToRequest.primaryProperty === 'soothing' ? 1.1 : 1.0); // Example based on Item with potential primaryProperty
    } else {
      rewardMultiplier = template.rewardMult;
    }

    const rewardGold = Math.round(quantity * baseItemValue * rewardMultiplier * (1 + Math.random() * 0.2)); // Add slight random bonus
    const rewardInfluence = Math.max(1, Math.floor(quantity * (rewardMultiplier / 2)) + (itemToRequest.rarity === 'rare' ? 2 : (itemToRequest.rarity === 'uncommon' ? 1 : 0))); // Influence based on quantity, value, rarity

    // Choose a requester whose role might fit the item type/category
     const suitableRequesters = townRequesters.filter(r =>
         r.roles.includes('any') ||
         r.roles.includes(itemToRequest.type) ||
         (itemToRequest.category && r.roles.includes(itemToRequest.category as string)) || // Cast category as string if needed
         (itemToRequest.rarity && itemToRequest.rarity !== 'common' && r.roles.some(role => role.includes('rare'))) || // Ensure rarity exists before check
         (itemToRequest.primaryProperty && r.roles.some(role => role.includes(itemToRequest.primaryProperty))) // Match primary property to role
     );
     const requester = suitableRequesters.length > 0
         ? suitableRequesters[Math.floor(Math.random() * suitableRequesters.length)]
         : townRequesters[Math.floor(Math.random() * townRequesters.length)]; // Fallback

    // Generate request description
    const description = generateRequestDescription(requester, itemToRequest.name, quantity);

     // Calculate difficulty (1-5) based on value, quantity, rarity, template boost
     const difficulty = Math.min(5, Math.max(1,
         Math.round(rewardGold / 25) + // Base difficulty on gold value
         (itemToRequest.rarity === 'rare' ? 1 : 0) + // Add 1 for rare
         (template.difficultyBoost || 0) // Add template boost
     ));

    // Create the request
    const newRequest: TownRequest = {
      id: `req-${++requestCounter}-${Date.now()}`, // More unique ID
      item: itemToRequest.name,
      quantity,
      rewardGold,
      rewardInfluence,
      requester: requester.name,
      description,
      difficulty, // Calculate difficulty rating
      completed: false,
      // Add expiry turn? Optional
      // expiryTurn: state.time.dayCount + 14 // Expires in 2 weeks (14 turns)
    };

    requests.push(newRequest);

    // Optional: Remove used template to avoid duplicates in this batch? Might be too restrictive.
    // templatesForSeason.splice(templateIndex, 1);
     existingRequestItems.push(newRequest.item); // Track added item to potentially reduce duplicates
  }

  console.log(`[TownRequests] Generated ${requests.length} new requests for ${currentSeason}.`);
  return requests;
}