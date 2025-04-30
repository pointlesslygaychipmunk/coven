// src/items.ts
// Defines all game items (seeds, ingredients, potions, tools) and their base properties.
// This acts as the master database for item types.

import { ItemType, ItemCategory, Item, MarketItem } from "coven-shared";
import { INGREDIENTS, SEEDS } from "./ingredients.js";

// Master list of all potential items in the game
export const ITEMS: Item[] = [
  // == Ingredients (Data primarily from ingredients.ts) ==
  // Ensure the base Item type includes all properties used here (name, desc, value, etc.)
  ...INGREDIENTS.map(ing => ({
    id: ing.id,
    name: ing.name, // Inherited
    type: 'ingredient' as ItemType,
    category: ing.category,
    description: ing.description, // Inherited
    value: ing.value, // Inherited
    rarity: ing.rarity, // Inherited
    primaryProperty: ing.primaryProperty,
    seasonalBonus: ing.bestSeason,
  })),

  // == Seeds (Data primarily from ingredients.ts) ==
  // Ensure the base Item type includes all properties used here
   ...SEEDS.map(seed => ({
    id: seed.id, // Inherited
    name: seed.name, // Inherited
    type: 'seed' as ItemType,
    category: 'seed' as ItemCategory,
    description: seed.description, // Inherited
    value: seed.value, // Inherited
    rarity: seed.rarity, // Inherited
    // Note: plantSource is specific to SeedItem interface, not base Item
    // It's used internally in ingredients.ts but not needed for the generic ITEMS list
  })),

  // == Potions (Crafted Products) ==
  {
    id: "potion_radiant_mask", name: "Radiant Moon Mask", type: "potion", category: "mask",
    description: "A luxurious facial mask that brightens and rejuvenates skin, imbued with lunar energy.",
    value: 65, rarity: 'uncommon',
  },
  {
    id: "potion_moonglow", name: "Moon Glow Serum", type: "potion", category: "serum",
    description: "A luminous facial serum that gives skin a moonlit glow while firming the complexion.",
    value: 55, rarity: 'uncommon',
  },
   {
    id: "potion_ginseng", name: "Ginseng Infusion", type: "potion", category: "tonic",
    description: "A potent tonic that revitalizes skin with the grounding power of Ancient Ginseng.",
    value: 50, rarity: 'uncommon',
  },
  {
    id: "potion_cooling", name: "Cooling Tonic", type: "potion", category: "tonic",
    description: "A refreshing tonic that soothes and cools irritated or overheated skin.",
    value: 40, rarity: 'common',
   },
   {
    id: "potion_revival", name: "Spring Revival Tonic", type: "potion", category: "tonic",
    description: "A revitalizing spring tonic that awakens the skin after winter.",
    value: 48, rarity: 'uncommon', seasonalBonus: 'Spring',
  },
   {
    id: "potion_summer_glow", name: "Summer Glow Oil", type: "potion", category: "oil",
    description: "A radiant facial oil that gives skin a sun-kissed glow and protects from environmental stressors.",
    value: 58, rarity: 'uncommon', seasonalBonus: 'Summer',
  },
  {
    id: "potion_preservation", name: "Preservation Elixir", type: "potion", category: "elixir",
    description: "A potent elixir that preserves youthful skin and prevents damage.",
    value: 70, rarity: 'rare', seasonalBonus: 'Fall',
  },
   {
    id: "potion_dreamvision", name: "Dreamvision Potion", type: "potion", category: "potion",
    description: "A mystical potion that promotes clarity and vision while deeply hydrating the skin.",
    value: 80, rarity: 'rare', seasonalBonus: 'Winter',
  },

  // == Tools & Containers ==
  {
    id: "tool_clay_jar", name: "Clay Jar", type: "tool", category: "tool",
    description: "A simple clay jar, suitable for storing fermented mixtures.",
    value: 12, rarity: 'common',
  },
  {
    id: "tool_glass_vial", name: "Glass Vial", type: "tool", category: "tool",
    description: "A small glass vial, perfect for storing potent essences or serums.",
    value: 8, rarity: 'common',
   },
   {
    id: "tool_mortar_pestle", name: "Mortar and Pestle", type: "tool", category: "tool",
    description: "Essential for grinding herbs and roots to prepare them for brewing.",
    value: 20, rarity: 'common',
   },
   {
       id: "tool_distiller", name: "Basic Distiller", type: "tool", category: "tool",
       description: "A simple apparatus for distilling liquids and extracting essences.",
       value: 75, rarity: 'uncommon',
   },

   // == Ritual Items ==
   {
       id: "ritual_moonstone", name: "Moonstone Shard", type: "ritual_item", category: "crystal",
       description: "A shard pulsating with lunar energy, used in moon-related rituals.",
       value: 100, rarity: 'rare',
   },
   {
       id: "ritual_obsidian_bowl", name: "Obsidian Scrying Bowl", type: "ritual_item", category: "ritual_item",
       description: "A polished obsidian bowl used for scrying and enhancing intuition.",
       value: 150, rarity: 'rare',
   },
    {
       id: "ritual_eternal_flame", name: "Eternal Flame Essence", type: "ritual_item", category: "essence",
       description: "A captured spark of pure energy, used in powerful transformative rituals.",
       value: 250, rarity: 'legendary',
   },

   // == Special / Other ==
   {
       id: "misc_ruined_brewage", name: "Ruined Brewage", type: "ingredient", category: "herb",
       description: "A failed brewing attempt resulted in this murky, useless concoction.",
       value: 1, rarity: 'common',
   }
   // No need for mapping defaults if base Item definition requires category/rarity
].map(item => ({ ...item, category: item.category || 'misc', rarity: item.rarity || 'common' })) as Item[]; // Keep default mapping for safety


// Helper function to get full item data by its ID
export function getItemData(itemId: string): Item | undefined {
  return ITEMS.find(item => item.id === itemId);
}

// Generate initial market items from the master list
export function getInitialMarket(): MarketItem[] {
  // ... (implementation remains the same) ...
    const initialMarketIds = [ /* ... */ ];
    return ITEMS
    .filter(item => initialMarketIds.includes(item.id))
    .map(item => ({
      id: item.id, name: item.name || 'Unknown Item', type: item.type, category: item.category || 'misc',
      price: item.value || 10, basePrice: item.value || 10, description: item.description || "An item of intrigue.",
      rarity: item.rarity || 'common', imagePath: item.imagePath, seasonalBonus: item.seasonalBonus,
      priceHistory: [item.value || 10], lastPriceChange: 0,
      volatility: item.rarity === 'rare' ? 1.2 : (item.rarity === 'uncommon' ? 1.1 : 1.0),
      blackMarketOnly: false,
    })) as MarketItem[];
}