// src/items.ts
// Defines all game items (seeds, ingredients, potions, tools) and their base properties.
// This acts as the master database for item types.

// Use package name import
import { ItemType, ItemCategory, Item, MarketItem } from "coven-shared";
import { INGREDIENTS, SEEDS } from "./ingredients.js";

// Master list of all potential items in the game
export const ITEMS: Item[] = [
  // == Ingredients ==
  ...INGREDIENTS.map(ing => ({ ...ing, type: 'ingredient' as ItemType })),

  // == Seeds ==
   ...SEEDS.map(seed => ({ ...seed, type: 'seed' as ItemType, category: 'seed' as ItemCategory })),

  // == Potions ==
  { id: "potion_radiant_mask", name: "Radiant Moon Mask", type: "potion", category: "mask", description: "A luxurious facial mask...", value: 65, rarity: 'uncommon'},
  { id: "potion_moonglow", name: "Moon Glow Serum", type: "potion", category: "serum", description: "A luminous facial serum...", value: 55, rarity: 'uncommon'},
  { id: "potion_ginseng", name: "Ginseng Infusion", type: "potion", category: "tonic", description: "A potent tonic...", value: 50, rarity: 'uncommon'},
  { id: "potion_cooling", name: "Cooling Tonic", type: "potion", category: "tonic", description: "A refreshing tonic...", value: 40, rarity: 'common'},
  { id: "potion_revival", name: "Spring Revival Tonic", type: "potion", category: "tonic", description: "A revitalizing spring tonic...", value: 48, rarity: 'uncommon', seasonalBonus: 'Spring'},
  { id: "potion_summer_glow", name: "Summer Glow Oil", type: "potion", category: "oil", description: "A radiant facial oil...", value: 58, rarity: 'uncommon', seasonalBonus: 'Summer'},
  { id: "potion_preservation", name: "Preservation Elixir", type: "potion", category: "elixir", description: "A potent elixir...", value: 70, rarity: 'rare', seasonalBonus: 'Fall'},
  { id: "potion_dreamvision", name: "Dreamvision Potion", type: "potion", category: "potion", description: "A mystical potion...", value: 80, rarity: 'rare', seasonalBonus: 'Winter'},

  // == Tools & Containers ==
  { id: "tool_clay_jar", name: "Clay Jar", type: "tool", category: "tool", description: "A simple clay jar...", value: 12, rarity: 'common'},
  { id: "tool_glass_vial", name: "Glass Vial", type: "tool", category: "tool", description: "A small glass vial...", value: 8, rarity: 'common'},
  { id: "tool_mortar_pestle", name: "Mortar and Pestle", type: "tool", category: "tool", description: "Essential for grinding...", value: 20, rarity: 'common'},
  { id: "tool_distiller", name: "Basic Distiller", type: "tool", category: "tool", description: "A simple apparatus...", value: 75, rarity: 'uncommon'},

   // == Ritual Items ==
   { id: "ritual_moonstone", name: "Moonstone Shard", type: "ritual_item", category: "crystal", description: "A shard pulsating...", value: 100, rarity: 'rare'},
   { id: "ritual_obsidian_bowl", name: "Obsidian Scrying Bowl", type: "ritual_item", category: "ritual_item", description: "A polished obsidian bowl...", value: 150, rarity: 'rare'},
   { id: "ritual_eternal_flame", name: "Eternal Flame Essence", type: "ritual_item", category: "essence", description: "A captured spark...", value: 250, rarity: 'legendary'},

   // == Special / Other ==
   { id: "misc_ruined_brewage", name: "Ruined Brewage", type: "ingredient", category: "herb", description: "A failed brewing attempt...", value: 1, rarity: 'common'}

].map(item => ({ ...item, category: item.category || 'misc', rarity: item.rarity || 'common' })) as Item[];


// Helper function to get full item data by its ID
export function getItemData(itemId: string): Item | undefined {
  // Add explicit type for item parameter
  return ITEMS.find((item: Item) => item.id === itemId);
}

// Generate initial market items from the master list
export function getInitialMarket(): MarketItem[] {
  const initialMarketIds: string[] = [
    "seed_moonbud", "seed_glimmerroot", "seed_silverleaf", "seed_sunpetal",
    "ing_silverleaf", "ing_sweetshade",
    "tool_clay_jar", "tool_glass_vial", "tool_mortar_pestle"
  ];

  return ITEMS
    // Add explicit type for item parameter
    .filter((item: Item) => initialMarketIds.includes(item.id))
    // Add explicit type for item parameter
    .map((item: Item) => ({
      id: item.id, name: item.name || 'Unknown Item', type: item.type, category: item.category || 'misc',
      price: item.value || 10, basePrice: item.value || 10, description: item.description || "An item of intrigue.",
      rarity: item.rarity || 'common', imagePath: item.imagePath, seasonalBonus: item.seasonalBonus,
      priceHistory: [item.value || 10], lastPriceChange: 0,
      volatility: item.rarity === 'rare' ? 1.2 : (item.rarity === 'uncommon' ? 1.1 : 1.0),
      blackMarketOnly: false,
    })) as MarketItem[];
}