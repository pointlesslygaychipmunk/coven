// src/atelier.ts
// Define specialization options and their bonuses

// Use package name import
import { AtelierSpecialization, ItemCategory, ItemType } from "coven-shared";
import type { Skills } from "coven-shared";

// Full specialization details interface (can stay local to backend)
export interface AtelierSpecializationDetails {
  id: AtelierSpecialization;
  name: string;
  description: string;
  startBonus: string;
  passiveBonus: string;
  growthBonus: Partial<Skills>;
  unlockRequirement?: string;
}

// Define all atelier specializations
export const SPECIALIZATIONS: AtelierSpecializationDetails[] = [
  { id: 'Essence', name: 'Essence Atelier', description: 'Specializes in serums and masks.', startBonus: 'Start with Ancient Ginseng and Sacred Lotus ingredients', passiveBonus: '+15% potency for all mask and serum recipes', growthBonus: { brewing: 0.3, herbalism: 0.2, astrology: 0.1 } },
  { id: 'Fermentation', name: 'Fermentation Atelier', description: 'Focuses on fermenting ingredients.', startBonus: 'Start with Silverleaf Seeds and a Clay Jar', passiveBonus: '+20% shelf life for all potions; ingredients improve in quality over time', growthBonus: { brewing: 0.2, herbalism: 0.3, gardening: 0.1 } },
  { id: 'Distillation', name: 'Distillation Atelier', description: 'Extracts and concentrates essences.', startBonus: 'Start with Emberberry Seeds and Glass Vials', passiveBonus: '+25% yield when creating potions (chance for extra product)', growthBonus: { brewing: 0.3, crafting: 0.2, trading: 0.1 } },
  { id: 'Infusion', name: 'Infusion Atelier', description: 'Focuses on gentle herbal infusions and teas.', startBonus: 'Start with Sweetshade Seeds and Calming Tea Base', passiveBonus: '+20% effectiveness for all tonic and elixir recipes', growthBonus: { brewing: 0.2, astrology: 0.2, herbalism: 0.2 } }
];

// Type for specialization bonus result
export interface SpecializationBonusResult {
  bonusMultiplier: number;
  chanceForExtra?: number;
  description: string;
}

// Special function to get specialization-specific bonuses
export function getSpecializationBonus(
  specialization: AtelierSpecialization | undefined,
  actionType: 'harvest' | 'brew' | 'grow' | 'sell',
  itemType?: ItemType,
  itemCategory?: ItemCategory
): SpecializationBonusResult {
  const defaultResult: SpecializationBonusResult = { bonusMultiplier: 1.0, description: "No specialization bonus applicable" };
  const spec = SPECIALIZATIONS.find(s => s.id === specialization);
  if (!spec) return defaultResult;

  switch (actionType) {
    case 'harvest':
      if (specialization === 'Essence' && (itemCategory === 'flower' || itemCategory === 'root')) return { bonusMultiplier: 1.1, description: "Essence Atelier: +10% harvest quality" };
      if (specialization === 'Fermentation' && itemCategory === 'herb') return { bonusMultiplier: 1.1, description: "Fermentation Atelier: +10% harvest quality" };
      if (specialization === 'Distillation' && (itemCategory === 'fruit' || itemCategory === 'flower')) return { bonusMultiplier: 1.1, description: "Distillation Atelier: +10% harvest quality" };
      if (specialization === 'Infusion' && (itemCategory === 'herb' || itemCategory === 'leaf')) return { bonusMultiplier: 1.15, description: "Infusion Atelier: +15% harvest quality" };
      break;
    case 'brew':
      if (specialization === 'Essence' && (itemCategory === 'mask' || itemCategory === 'serum')) return { bonusMultiplier: 1.15, description: "Essence Atelier: +15% potency" };
      if (specialization === 'Fermentation' && itemType === 'potion') return { bonusMultiplier: 1.05, description: "Fermentation Atelier: +5% quality" };
      if (specialization === 'Distillation' && itemType === 'potion') return { bonusMultiplier: 1.0, chanceForExtra: 0.15, description: "Distillation Expertise: 15% chance for double yield" };
      if (specialization === 'Infusion' && (itemCategory === 'tonic' || itemCategory === 'elixir')) return { bonusMultiplier: 1.20, description: "Infusion Atelier: +20% effectiveness" };
      break;
    case 'grow':
       if (specialization === 'Essence' && (itemCategory === 'flower' || itemCategory === 'root')) return { bonusMultiplier: 1.1, description: "Essence Atelier: +10% growth speed" };
       if (specialization === 'Fermentation' && itemCategory === 'herb') return { bonusMultiplier: 1.1, description: "Fermentation Atelier: +10% growth speed" };
       if (specialization === 'Distillation' && itemCategory === 'fruit') return { bonusMultiplier: 1.15, description: "Distillation Atelier: +15% growth speed" };
       if (specialization === 'Infusion' && (itemCategory === 'herb' || itemCategory === 'leaf')) return { bonusMultiplier: 1.1, description: "Infusion Atelier: +10% growth speed" };
      break;
    case 'sell':
      if (specialization === 'Essence' && (itemCategory === 'mask' || itemCategory === 'serum')) return { bonusMultiplier: 1.15, description: "Essence Atelier: +15% sell value" };
      if (specialization === 'Fermentation' && itemType === 'potion') return { bonusMultiplier: 1.1, description: "Fermentation Atelier: +10% sell value for aged potions" };
      if (specialization === 'Distillation' && itemType === 'ingredient') return { bonusMultiplier: 1.05, description: "Distillation Atelier: +5% sell value for ingredients" };
      if (specialization === 'Infusion' && (itemCategory === 'tonic' || itemCategory === 'elixir')) return { bonusMultiplier: 1.15, description: "Infusion Atelier: +15% sell value for tonics and elixirs" };
      break;
  }
  return defaultResult;
}

export function getSkillGrowthBonus(specialization: AtelierSpecialization | undefined, skill: keyof Skills): number {
  if (!specialization) return 0;
  const spec = SPECIALIZATIONS.find(s => s.id === specialization);
  return spec?.growthBonus?.[skill] || 0;
}

export function getSpecialization(id: AtelierSpecialization): AtelierSpecializationDetails | undefined {
  return SPECIALIZATIONS.find(s => s.id === id);
}