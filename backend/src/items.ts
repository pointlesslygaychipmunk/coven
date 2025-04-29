// src/items.ts
// Defines all game items (seeds, ingredients, potions, tools) and their base properties.
// This acts as the master database for item types.

import { ItemType, ItemCategory, Item, Season } from "coven-shared";
import { INGREDIENTS, SEEDS } from "./ingredients.js"; // Import plant/seed data

// Master list of all potential items in the game
export const ITEMS: Item[] = [
  // == Ingredients (Data primarily from ingredients.ts) ==
  ...INGREDIENTS.map(ing => ({
    id: ing.id,
    name: ing.name,
    type: 'ingredient' as ItemType, // Explicitly type
    category: ing.category,
    description: ing.description,
    value: ing.value,
    rarity: ing.rarity,
    // imagePath: `/images/ingredients/${ing.id}.png` // Example path structure
  })),

  // == Seeds (Data primarily from ingredients.ts) ==
   ...SEEDS.map(seed => ({
    id: seed.id,
    name: seed.name,
    type: 'seed' as ItemType,
    category: 'seed' as ItemCategory,
    description: seed.description,
    value: seed.value,
    rarity: seed.rarity, // Seed rarity matches ingredient
    // imagePath: `/images/seeds/${seed.id}.png`
  })),

  // == Potions (Crafted Products) ==
  // Values should reflect ingredient cost + effort/rarity
  {
    id: "potion_radiant_mask", name: "Radiant Moon Mask", type: "potion", category: "mask",
    description: "A luxurious facial mask that brightens and rejuvenates skin, imbued with lunar energy.",
    value: 65, rarity: 'uncommon',
    // imagePath: '/images/potions/radiant_mask.png'
  },
  {
    id: "potion_moonglow", name: "Moon Glow Serum", type: "potion", category: "serum",
    description: "A luminous facial serum that gives skin a moonlit glow while firming the complexion.",
    value: 55, rarity: 'uncommon',
    // imagePath: '/images/potions/moonglow_serum.png'
  },
   {
    id: "potion_ginseng", name: "Ginseng Infusion", type: "potion", category: "tonic",
    description: "A potent tonic that revitalizes skin with the grounding power of Ancient Ginseng.",
    value: 50, rarity: 'uncommon',
     // imagePath: '/images/potions/ginseng_infusion.png'
  },
  {
    id: "potion_cooling", name: "Cooling Tonic", type: "potion", category: "tonic",
    description: "A refreshing tonic that soothes and cools irritated or overheated skin.",
    value: 40, rarity: 'common',
    // imagePath: '/images/potions/cooling_tonic.png'
   },
   {
    id: "potion_revival", name: "Spring Revival Tonic", type: "potion", category: "tonic",
    description: "A revitalizing spring tonic that awakens the skin after winter.",
    value: 48, rarity: 'uncommon', seasonalBonus: 'Spring', // Example seasonal bonus flag
     // imagePath: '/images/potions/spring_tonic.png'
  },
   {
    id: "potion_summer_glow", name: "Summer Glow Oil", type: "potion", category: "oil",
    description: "A radiant facial oil that gives skin a sun-kissed glow and protects from environmental stressors.",
    value: 58, rarity: 'uncommon', seasonalBonus: 'Summer',
     // imagePath: '/images/potions/summer_oil.png'
  },
  {
    id: "potion_preservation", name: "Preservation Elixir", type: "potion", category: "elixir",
    description: "A potent elixir that preserves youthful skin and prevents damage.",
    value: 70, rarity: 'rare', seasonalBonus: 'Fall',
     // imagePath: '/images/potions/preservation_elixir.png'
  },
   {
    id: "potion_dreamvision", name: "Dreamvision Potion", type: "potion", category: "potion", // More general potion type
    description: "A mystical potion that promotes clarity and vision while deeply hydrating the skin.",
    value: 80, rarity: 'rare', seasonalBonus: 'Winter',
     // imagePath: '/images/potions/dreamvision_potion.png'
  },
  // Add more advanced/complex potions here

  // == Tools & Containers ==
  {
    id: "tool_clay_jar", name: "Clay Jar", type: "tool", category: "tool",
    description: "A simple clay jar, suitable for storing fermented mixtures.",
    value: 12, rarity: 'common',
    // imagePath: '/images/tools/clay_jar.png'
  },
  {
    id: "tool_glass_vial", name: "Glass Vial", type: "tool", category: "tool",
    description: "A small glass vial, perfect for storing potent essences or serums.",
    value: 8, rarity: 'common',
    // imagePath: '/images/tools/glass_vial.png'
   },
   {
    id: "tool_mortar_pestle", name: "Mortar and Pestle", type: "tool", category: "tool",
    description: "Essential for grinding herbs and roots to prepare them for brewing.",
    value: 20, rarity: 'common',
    // imagePath: '/images/tools/mortar_pestle.png'
   },
   {
       id: "tool_distiller", name: "Basic Distiller", type: "tool", category: "tool",
       description: "A simple apparatus for distilling liquids and extracting essences.",
       value: 75, rarity: 'uncommon',
       // imagePath: '/images/tools/distiller.png'
   },

   // == Ritual Items (Often rewards or rare finds) ==
   {
       id: "ritual_moonstone", name: "Moonstone Shard", type: "ritual_item", category: "crystal",
       description: "A shard pulsating with lunar energy, used in moon-related rituals.",
       value: 100, rarity: 'rare',
       // imagePath: '/images/ritual/moonstone.png'
   },
   {
       id: "ritual_obsidian_bowl", name: "Obsidian Scrying Bowl", type: "ritual_item", category: "ritual_item",
       description: "A polished obsidian bowl used for scrying and enhancing intuition.",
       value: 150, rarity: 'rare',
       // imagePath: '/images/ritual/obsidian_bowl.png'
   },
    {
       id: "ritual_eternal_flame", name: "Eternal Flame Essence", type: "ritual_item", category: "essence",
       description: "A captured spark of pure energy, used in powerful transformative rituals.",
       value: 250, rarity: 'legendary',
       // imagePath: '/images/ritual/eternal_flame.png'
   },

   // == Special / Other ==
   {
       id: "misc_ruined_brewage", name: "Ruined Brewage", type: "ingredient", category: "herb", // Treat as a basic type for simplicity
       description: "A failed brewing attempt resulted in this murky, useless concoction.",
       value: 1, rarity: 'common', // Worth almost nothing
       // imagePath: '/images/misc/ruined_brewage.png'
   }
];

// Helper function to get full item data by its ID
export function getItemData(itemId: string): Item | undefined {
  return ITEMS.find(item => item.id === itemId);
}

// Generate initial market items from the master list
// Only includes items that should be available initially
export function getInitialMarket(): MarketItem[] {
  const initialMarketIds = [
    // Seeds
    "seed_moonbud", "seed_glimmerroot", "seed_silverleaf", "seed_sunpetal",
    // Some Basic Ingredients (low initial supply)
    "ing_silverleaf", "ing_sweetshade",
    // Basic Tools
    "tool_clay_jar", "tool_glass_vial", "tool_mortar_pestle"
  ];

  return ITEMS
    .filter(item => initialMarketIds.includes(item.id))
    .map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      category: item.category || 'misc', // Default category if missing
      price: item.value || 10, // Use base value as starting price
      basePrice: item.value || 10,
      description: item.description || "An item of intrigue.",
      rarity: item.rarity || 'common',
      imagePath: item.imagePath,
      // Initialize other market-specific fields if needed
      priceHistory: [item.value || 10],
      lastPriceChange: 0,
      volatility: item.rarity === 'rare' ? 1.2 : (item.rarity === 'uncommon' ? 1.1 : 1.0), // Rarity influences volatility
      blackMarketOnly: false, // None are black market initially
    }));
}

// Example function to generate item description if missing (can be expanded)
function generateItemDescription(item: Item): string {
   if (item.description) return item.description;

   switch (item.type) {
    case "seed":
      return `Seeds for growing ${item.name.replace(" Seed", "")}.`;
    case "ingredient":
      return `A key ingredient, ${item.name}, used in various concoctions.`;
    case "potion":
       return `A brewed potion: ${item.name}.`;
     case "tool":
       return `A useful tool: ${item.name}.`;
     default:
       return `An interesting item: ${item.name}.`;
   }
}