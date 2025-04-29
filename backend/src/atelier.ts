// src/atelier.ts
// Define specialization options and their bonuses

import { AtelierSpecialization, ItemCategory, ItemType, Season, MoonPhase } from "coven-shared";

// Full specialization details interface (can stay local to backend)
export interface AtelierSpecializationDetails {
  id: AtelierSpecialization; // Use the shared type
  name: string;
  description: string;
  startBonus: string; // e.g. description of bonus effect
  passiveBonus: string; // Ongoing effect
  growthBonus: {
    gardening?: number;
    brewing?: number;
    trading?: number;
    crafting?: number;
    herbalism?: number;
    astrology?: number;
  };
  unlockRequirement?: string; // If not available at start
}

// Define all atelier specializations
export const SPECIALIZATIONS: AtelierSpecializationDetails[] = [
  {
    id: 'Essence',
    name: 'Essence Atelier',
    description: 'A workshop centered around extracting and enhancing the essential properties of plants. Specializes in serums and masks.',
    startBonus: 'Start with Ancient Ginseng and Sacred Lotus ingredients',
    passiveBonus: '+15% potency for all mask and serum recipes',
    growthBonus: {
      brewing: 0.3,
      herbalism: 0.2,
      astrology: 0.1
    }
  },
  {
    id: 'Fermentation',
    name: 'Fermentation Atelier',
    description: 'A workshop filled with clay pots and wooden barrels for fermenting ingredients to enhance their properties.',
    startBonus: 'Start with Silverleaf Seeds and a Clay Jar',
    passiveBonus: '+20% shelf life for all potions; ingredients improve in quality over time',
    growthBonus: {
      brewing: 0.2,
      herbalism: 0.3,
      gardening: 0.1
    }
  },
  {
    id: 'Distillation',
    name: 'Distillation Atelier',
    description: 'A precise workshop with glass vessels and heating elements to extract and concentrate herbal essences.',
    startBonus: 'Start with Emberberry Seeds and Glass Vials',
    passiveBonus: '+25% yield when creating potions (chance for extra product)',
    growthBonus: {
      brewing: 0.3,
      crafting: 0.2,
      trading: 0.1
    }
  },
  {
    id: 'Infusion',
    name: 'Infusion Atelier',
    description: 'A cozy workshop focused on gentle herbal infusions and teas with medicinal properties.',
    startBonus: 'Start with Sweetshade Seeds and Calming Tea Base',
    passiveBonus: '+20% effectiveness for all tonic and elixir recipes',
    growthBonus: {
      brewing: 0.2,
      astrology: 0.2,
      herbalism: 0.2
    }
  }
];

// Type for specialization bonus result
export interface SpecializationBonusResult {
  bonusMultiplier: number; // e.g., 1.15 for +15%
  chanceForExtra?: number; // e.g., 0.25 for 25% chance
  description: string;
}

// Special function to get specialization-specific bonuses
export function getSpecializationBonus(
  specialization: AtelierSpecialization,
  actionType: 'harvest' | 'brew' | 'grow' | 'sell',
  itemType?: ItemType,
  itemCategory?: ItemCategory
): SpecializationBonusResult {
  // Default (no bonus)
  const defaultResult: SpecializationBonusResult = {
    bonusMultiplier: 1.0,
    description: "No specialization bonus applicable"
  };

  // Find the specialization details
  const spec = SPECIALIZATIONS.find(s => s.id === specialization);
  if (!spec) return defaultResult;

  // Apply bonuses based on action type and specialization
  switch (actionType) {
    case 'harvest':
      // Quality bonus during harvest
      if (specialization === 'Essence' && (itemCategory === 'flower' || itemCategory === 'root')) {
        return { bonusMultiplier: 1.15, description: "Essence Atelier bonus: +15% quality when harvesting flowers and roots" };
      }
      if (specialization === 'Fermentation' && itemCategory === 'herb') {
        return { bonusMultiplier: 1.1, description: "Fermentation Atelier bonus: +10% quality when harvesting herbs" };
      }
      if (specialization === 'Distillation' && (itemCategory === 'fruit' || itemCategory === 'flower')) {
        return { bonusMultiplier: 1.1, description: "Distillation Atelier bonus: +10% quality when harvesting fruits and flowers" };
      }
      if (specialization === 'Infusion' && (itemCategory === 'herb' || itemCategory === 'leaf')) {
        return { bonusMultiplier: 1.2, description: "Infusion Atelier bonus: +20% quality when harvesting herbs and leaves" };
      }
      break;

    case 'brew':
      // Potency/Effectiveness bonus or extra yield during brewing
      if (specialization === 'Essence' && (itemCategory === 'mask' || itemCategory === 'serum')) {
        return { bonusMultiplier: 1.15, description: "Essence Atelier bonus: +15% potency for masks and serums" }; // Affects quality/effect
      }
      if (specialization === 'Fermentation' && itemType === 'potion') {
        // Passive bonus is shelf life/aging, maybe slight quality bonus here
        return { bonusMultiplier: 1.05, description: "Fermentation Atelier bonus: +5% quality for potions" };
      }
      if (specialization === 'Distillation' && itemType === 'potion') {
        // Chance for extra yield
        return { bonusMultiplier: 1.0, chanceForExtra: 0.25, description: "Distillation Atelier bonus: 25% chance for double yield" };
      }
      if (specialization === 'Infusion' && (itemCategory === 'tonic' || itemCategory === 'elixir')) {
        return { bonusMultiplier: 1.20, description: "Infusion Atelier bonus: +20% effectiveness for tonics and elixirs" }; // Affects quality/effect
      }
      break;

    case 'grow':
      // Growth speed bonus
       if (specialization === 'Essence' && (itemCategory === 'flower' || itemCategory === 'root')) {
        return { bonusMultiplier: 1.1, description: "Essence Atelier bonus: +10% growth speed for flowers and roots" };
      }
      if (specialization === 'Fermentation' && itemCategory === 'herb') {
        return { bonusMultiplier: 1.1, description: "Fermentation Atelier bonus: +10% growth speed for herbs" };
      }
       if (specialization === 'Distillation' && itemCategory === 'fruit') {
        return { bonusMultiplier: 1.15, description: "Distillation Atelier bonus: +15% growth speed for fruits" };
      }
       if (specialization === 'Infusion' && (itemCategory === 'herb' || itemCategory === 'leaf')) {
        return { bonusMultiplier: 1.1, description: "Infusion Atelier bonus: +10% growth speed for herbs and leaves" };
      }
      break;

    case 'sell':
      // Sell price bonus
      if (specialization === 'Essence' && (itemCategory === 'mask' || itemCategory === 'serum')) {
        return { bonusMultiplier: 1.15, description: "Essence Atelier bonus: +15% sell value for masks and serums" };
      }
      if (specialization === 'Fermentation' && itemType === 'potion') {
         // Maybe aged potions sell better?
        return { bonusMultiplier: 1.1, description: "Fermentation Atelier bonus: +10% sell value for aged potions" }; // Needs aging logic
      }
      if (specialization === 'Distillation' && itemType === 'ingredient') {
        return { bonusMultiplier: 1.05, description: "Distillation Atelier bonus: +5% sell value for ingredients" };
      }
      if (specialization === 'Infusion' && (itemCategory === 'tonic' || itemCategory === 'elixir')) {
        return { bonusMultiplier: 1.15, description: "Infusion Atelier bonus: +15% sell value for tonics and elixirs" };
      }
      break;
  }

  return defaultResult;
}

// Get the skill growth bonus factor for an atelier specialization
export function getSkillGrowthBonus(specialization: AtelierSpecialization, skill: string): number {
  const spec = SPECIALIZATIONS.find(s => s.id === specialization);
  if (!spec || !spec.growthBonus || !(skill in spec.growthBonus)) {
    return 0; // No bonus
  }

  // Return the bonus value (e.g., 0.1 for +10%)
  return spec.growthBonus[skill as keyof typeof spec.growthBonus] || 0;
}

// Get atelier specialization details by ID
export function getSpecialization(id: AtelierSpecialization): AtelierSpecializationDetails | undefined {
  return SPECIALIZATIONS.find(s => s.id === id);
}