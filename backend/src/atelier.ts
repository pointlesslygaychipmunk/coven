// src/atelier.ts
// Define specialization options and their bonuses with expanded system for complexity, variability, and emergent gameplay

// Use package name import
import { AtelierSpecialization, ItemCategory, ItemType, Season, MoonPhase } from "coven-shared";
import type { Skills, InventoryItem } from "coven-shared";

// Full specialization details interface (can stay local to backend)
export interface AtelierSpecializationDetails {
  id: AtelierSpecialization;
  name: string;
  description: string;
  startBonus: string;
  passiveBonus: string;
  growthBonus: Partial<Skills>;
  unlockRequirement?: string;
  // Added advanced options for expanded system
  specialFocus?: ItemCategory[];        // Item categories the specialization favors
  seasonalStrength?: Season;            // Season when this specialization is at its strongest
  moonPhaseAlignment?: MoonPhase;       // Moon phase when this specialization gets additional bonuses
  upgradePaths?: AtelierUpgradePath[];  // Possible specialization upgrade paths
  subSpecializations?: AtelierSubSpecialization[]; // Sub-specializations for more customization
  uniqueAbilities?: string[];           // Special abilities unlocked at higher levels
  craftingSignature?: string;           // Unique signature effect that appears on crafted items
}

// Expanded system - Upgrade paths for specializations
export interface AtelierUpgradePath {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  bonusEffect: string;
  skillRequirements: Partial<Skills>;
  appliedBonuses: SpecializationBonusModifiers;
}

// Expanded system - Sub-specializations for more customization
export interface AtelierSubSpecialization {
  id: string;
  name: string;
  description: string;
  primaryBonus: string;
  secondaryEffect: string;
  requiredLevel: number;
  // Optional exclusive relationship with other sub-specializations
  exclusiveWith?: string[];
  // Optional synergy with other sub-specializations
  synergyWith?: string[];
  appliedBonuses: SpecializationBonusModifiers;
}

// Expanded system - Modifiers that get applied to bonuses
export interface SpecializationBonusModifiers {
  potencyMultiplier?: number;
  durationMultiplier?: number;
  yieldMultiplier?: number;
  qualityMultiplier?: number;
  rarityChanceBonus?: number;
  discoveryChanceBonus?: number;
  economyMultiplier?: number;
  seasonalMultiplier?: number;
  lunarMultiplier?: number;
  criticalSuccessChance?: number;
}

// Enhanced result type for specialization bonus calculations
export interface SpecializationBonusResult {
  bonusMultiplier: number;
  chanceForExtra?: number;
  criticalChance?: number;
  qualityBonus?: number;
  durationBonus?: number;
  lunarBonus?: number;
  seasonalBonus?: number;
  specialEffects?: string[];
  description: string;
}

// Track atelier experience and mastery
export interface AtelierMastery {
  level: number;
  experience: number;
  selectedSpecialization: AtelierSpecialization;
  activeSubSpecializations: string[];
  upgradePathId?: string;
  masteryBonuses: {
    [key: string]: number;
  };
  unlockedAbilities: string[];
}

// Expanded system - Define advanced item properties
export interface AtelierItemProperties {
  potency?: number;
  duration?: number;
  quality?: number;
  rarity?: string;
  lunarInfusion?: MoonPhase;
  seasonalAlignment?: Season;
  specialEffects?: string[];
  creationSignature?: string;
  unstableProperties?: boolean;
  expertiseRequirement?: number;
}

// Expanded system - Atelier crafting result for emergent gameplay
export interface AtelierCraftingResult {
  success: boolean;
  itemId: string;
  quantity: number;
  experience: number;
  criticalSuccess?: boolean;
  bonusEffects?: string[];
  discoveredRecipe?: boolean;
  qualityModifier?: number;
  itemProperties?: AtelierItemProperties;
  byproducts?: { itemId: string, quantity: number }[];
  specialInsight?: string;
}

// Define all atelier specializations with expanded detail
export const SPECIALIZATIONS: AtelierSpecializationDetails[] = [
  { 
    id: 'Essence', 
    name: 'Essence Atelier', 
    description: 'Specializes in serums and masks, focusing on extraction of pure essences and cosmetic applications.', 
    startBonus: 'Start with Ancient Ginseng and Sacred Lotus ingredients', 
    passiveBonus: '+15% potency for all mask and serum recipes', 
    growthBonus: { brewing: 0.3, herbalism: 0.2, astrology: 0.1 },
    specialFocus: ['mask', 'serum', 'flower', 'essence'],
    seasonalStrength: 'Summer',
    moonPhaseAlignment: 'Full Moon',
    craftingSignature: 'Items shimmer with subtle opalescence',
    upgradePaths: [
      {
        id: 'essence_purification',
        name: 'Essence Purification',
        description: 'Focus on creating exceptionally pure essences, improving potency at the cost of yield.',
        unlockLevel: 5,
        bonusEffect: '+25% potency on all essence extractions, but -10% yield',
        skillRequirements: { brewing: 5, herbalism: 3 },
        appliedBonuses: {
          potencyMultiplier: 1.25,
          yieldMultiplier: 0.9,
          qualityMultiplier: 1.15,
          criticalSuccessChance: 0.1
        }
      },
      {
        id: 'essence_amplification',
        name: 'Essence Amplification',
        description: 'Maximize yield from essences, allowing more products from the same ingredients.',
        unlockLevel: 5,
        bonusEffect: '+30% yield on essence extractions, with a chance for rare byproducts',
        skillRequirements: { brewing: 4, crafting: 4 },
        appliedBonuses: {
          potencyMultiplier: 1.1,
          yieldMultiplier: 1.3,
          discoveryChanceBonus: 0.15
        }
      }
    ],
    subSpecializations: [
      {
        id: 'floral_essence',
        name: 'Floral Essence Expert',
        description: 'Specialized knowledge of extracting and utilizing flower essences',
        primaryBonus: '+20% potency when working with flower-based ingredients',
        secondaryEffect: 'Chance to preserve rare floral properties during extraction',
        requiredLevel: 3,
        appliedBonuses: {
          potencyMultiplier: 1.2,
          rarityChanceBonus: 0.1,
          seasonalMultiplier: 1.15
        }
      },
      {
        id: 'root_essence',
        name: 'Root Essence Expert',
        description: 'Deep understanding of extracting powerful essences from roots and tubers',
        primaryBonus: '+25% duration for products using root essences',
        secondaryEffect: 'Root-based potions have increased shelf life',
        requiredLevel: 3,
        exclusiveWith: ['floral_essence'],
        appliedBonuses: {
          durationMultiplier: 1.25,
          qualityMultiplier: 1.1
        }
      },
      {
        id: 'ethereal_essence',
        name: 'Ethereal Essence Refiner',
        description: 'Ability to capture and refine subtle, intangible essences',
        primaryBonus: 'Can create ethereal-infused products during Full Moon',
        secondaryEffect: 'Products may contain unique, unpredictable beneficial effects',
        requiredLevel: 7,
        synergyWith: ['floral_essence', 'root_essence'],
        appliedBonuses: {
          lunarMultiplier: 1.3,
          criticalSuccessChance: 0.15,
          rarityChanceBonus: 0.2
        }
      }
    ],
    uniqueAbilities: [
      'Essence Sight - Reveal hidden properties of ingredients',
      'Essence Preservation - Preserve rare ingredient properties during extraction',
      'Ethereal Infusion - Infuse products with moonlight during a Full Moon'
    ]
  },
  { 
    id: 'Fermentation', 
    name: 'Fermentation Atelier', 
    description: 'Focuses on fermenting ingredients to transform and enhance their properties over time.', 
    startBonus: 'Start with Silverleaf Seeds and a Clay Jar', 
    passiveBonus: '+20% shelf life for all potions; ingredients improve in quality over time', 
    growthBonus: { brewing: 0.2, herbalism: 0.3, gardening: 0.1 },
    specialFocus: ['herb', 'potion', 'tonic'],
    seasonalStrength: 'Fall',
    moonPhaseAlignment: 'Waning Gibbous',
    craftingSignature: 'Items emit small bubbles when opened',
    upgradePaths: [
      {
        id: 'wild_fermentation',
        name: 'Wild Fermentation',
        description: 'Harness wild microorganisms for unpredictable but potentially amazing results.',
        unlockLevel: 5,
        bonusEffect: 'High variance in fermentation results, with chance for extraordinary outcomes',
        skillRequirements: { brewing: 4, herbalism: 5 },
        appliedBonuses: {
          potencyMultiplier: 1.15,
          criticalSuccessChance: 0.2,
          rarityChanceBonus: 0.15,
          qualityMultiplier: 0.9
        }
      },
      {
        id: 'precise_fermentation',
        name: 'Precise Fermentation',
        description: 'Control the fermentation process with scientific precision.',
        unlockLevel: 5,
        bonusEffect: 'Consistent, high-quality results with predictable properties',
        skillRequirements: { brewing: 5, crafting: 3 },
        appliedBonuses: {
          qualityMultiplier: 1.25,
          durationMultiplier: 1.2,
          criticalSuccessChance: 0.05
        }
      }
    ],
    subSpecializations: [
      {
        id: 'herbal_fermentation',
        name: 'Herbal Fermentation Master',
        description: 'Expert in fermenting herbs for maximum medicinal benefit',
        primaryBonus: '+25% potency for healing potion fermentations',
        secondaryEffect: 'Fermented herbs develop unique beneficial mutations',
        requiredLevel: 3,
        appliedBonuses: {
          potencyMultiplier: 1.25,
          durationMultiplier: 1.15,
          discoveryChanceBonus: 0.1
        }
      },
      {
        id: 'fruit_fermentation',
        name: 'Fruit Fermentation Expert',
        description: 'Specialized in fermenting fruits for flavor and magical properties',
        primaryBonus: 'Fermented fruit preparations have +30% increased value',
        secondaryEffect: 'Chance to produce spirit essences as byproducts',
        requiredLevel: 3,
        exclusiveWith: ['herbal_fermentation'],
        appliedBonuses: {
          economyMultiplier: 1.3,
          yieldMultiplier: 1.15
        }
      },
      {
        id: 'fungal_fermentation',
        name: 'Fungal Fermentation Adept',
        description: 'Harness the power of fungi in the fermentation process',
        primaryBonus: 'Can produce rare transformation effects in fermented potions',
        secondaryEffect: 'Fermentations complete 40% faster',
        requiredLevel: 6,
        synergyWith: ['herbal_fermentation'],
        appliedBonuses: {
          rarityChanceBonus: 0.2,
          criticalSuccessChance: 0.15,
          qualityMultiplier: 1.1
        }
      }
    ],
    uniqueAbilities: [
      'Time Acceleration - Accelerate fermentation processes',
      'Mother Culture - Create and maintain powerful fermentation starters',
      'Transmutation Ferment - Small chance to transmute ingredients during fermentation'
    ]
  },
  { 
    id: 'Distillation', 
    name: 'Distillation Atelier', 
    description: 'Extracts and concentrates essences through precise temperature control and fractional separation.', 
    startBonus: 'Start with Emberberry Seeds and Glass Vials', 
    passiveBonus: '+25% yield when creating potions (chance for extra product)', 
    growthBonus: { brewing: 0.3, crafting: 0.2, trading: 0.1 },
    specialFocus: ['potion', 'oil', 'elixir', 'fruit'],
    seasonalStrength: 'Winter',
    moonPhaseAlignment: 'Waxing Crescent',
    craftingSignature: 'Items have a subtle spiral pattern in the liquid',
    upgradePaths: [
      {
        id: 'fractional_distillation',
        name: 'Fractional Distillation',
        description: 'Master the art of separating components at different boiling points for purer products.',
        unlockLevel: 5,
        bonusEffect: '+35% quality for all distilled products with chance for pure essences',
        skillRequirements: { brewing: 5, crafting: 4 },
        appliedBonuses: {
          qualityMultiplier: 1.35,
          potencyMultiplier: 1.2,
          criticalSuccessChance: 0.1
        }
      },
      {
        id: 'rapid_distillation',
        name: 'Rapid Distillation',
        description: 'Optimize the distillation process for maximum yield and efficiency.',
        unlockLevel: 5,
        bonusEffect: 'Double yield with a chance for byproducts',
        skillRequirements: { brewing: 4, trading: 4 },
        appliedBonuses: {
          yieldMultiplier: 2.0,
          potencyMultiplier: 0.9,
          economyMultiplier: 1.2
        }
      }
    ],
    subSpecializations: [
      {
        id: 'alchemical_distillation',
        name: 'Alchemical Distillation Expert',
        description: 'Combine magical principles with distillation techniques',
        primaryBonus: '+30% potency for transformative potions',
        secondaryEffect: 'Chance to discover hidden properties in common ingredients',
        requiredLevel: 3,
        appliedBonuses: {
          potencyMultiplier: 1.3,
          discoveryChanceBonus: 0.15,
          rarityChanceBonus: 0.1
        }
      },
      {
        id: 'essential_oil_distillation',
        name: 'Essential Oil Master',
        description: 'Specialized in extracting concentrated essential oils',
        primaryBonus: '+50% yield when distilling oils',
        secondaryEffect: 'Oils have enhanced aromatherapeutic properties',
        requiredLevel: 3,
        exclusiveWith: ['alchemical_distillation'],
        appliedBonuses: {
          yieldMultiplier: 1.5,
          qualityMultiplier: 1.15,
          durationMultiplier: 1.2
        }
      },
      {
        id: 'crystal_distillation',
        name: 'Crystal Infusion Specialist',
        description: 'Incorporate crystal energy into the distillation process',
        primaryBonus: 'Distillations aligned with moon phases gain powerful properties',
        secondaryEffect: 'Products may crystallize rare magical compounds',
        requiredLevel: 6,
        synergyWith: ['alchemical_distillation'],
        appliedBonuses: {
          lunarMultiplier: 1.4,
          criticalSuccessChance: 0.15,
          rarityChanceBonus: 0.2
        }
      }
    ],
    uniqueAbilities: [
      'Essence Separation - Extract multiple essences from a single source',
      'Magical Condensation - Concentrate magical properties during distillation',
      'Elemental Infusion - Infuse distillations with elemental energies'
    ]
  },
  { 
    id: 'Infusion', 
    name: 'Infusion Atelier', 
    description: 'Focuses on gentle herbal infusions and teas, drawing out subtle properties without altering them.', 
    startBonus: 'Start with Sweetshade Seeds and Calming Tea Base', 
    passiveBonus: '+20% effectiveness for all tonic and elixir recipes', 
    growthBonus: { brewing: 0.2, astrology: 0.2, herbalism: 0.2 },
    specialFocus: ['tonic', 'elixir', 'herb', 'leaf'],
    seasonalStrength: 'Spring',
    moonPhaseAlignment: 'First Quarter',
    craftingSignature: 'Items have a gentle glow when used',
    upgradePaths: [
      {
        id: 'celestial_infusion',
        name: 'Celestial Infusion',
        description: 'Infuse products with cosmic energy based on astrological alignments.',
        unlockLevel: 5,
        bonusEffect: 'Infusions gain powerful effects based on current moon phase',
        skillRequirements: { brewing: 3, astrology: 5 },
        appliedBonuses: {
          lunarMultiplier: 1.5,
          potencyMultiplier: 1.15,
          rarityChanceBonus: 0.2
        }
      },
      {
        id: 'harmonic_infusion',
        name: 'Harmonic Infusion',
        description: 'Create perfectly balanced infusions with multiple harmonious ingredients.',
        unlockLevel: 5,
        bonusEffect: '+40% quality when using 3+ ingredients in a recipe',
        skillRequirements: { brewing: 4, herbalism: 4 },
        appliedBonuses: {
          qualityMultiplier: 1.4,
          durationMultiplier: 1.25,
          potencyMultiplier: 1.15
        }
      }
    ],
    subSpecializations: [
      {
        id: 'tea_master',
        name: 'Tea Master',
        description: 'Expert in the delicate art of tea infusion and blending',
        primaryBonus: '+35% effectiveness for calming and mental tonics',
        secondaryEffect: 'Teas can grant temporary skill bonuses',
        requiredLevel: 3,
        appliedBonuses: {
          potencyMultiplier: 1.35,
          durationMultiplier: 1.2,
          qualityMultiplier: 1.15
        }
      },
      {
        id: 'medicinal_infuser',
        name: 'Medicinal Infuser',
        description: 'Specialized in therapeutic and healing infusions',
        primaryBonus: '+30% potency for health-restoring elixirs',
        secondaryEffect: 'Infusions can cure minor ailments',
        requiredLevel: 3,
        exclusiveWith: ['tea_master'],
        appliedBonuses: {
          potencyMultiplier: 1.3,
          qualityMultiplier: 1.2,
          economyMultiplier: 1.15
        }
      },
      {
        id: 'dream_infuser',
        name: 'Dream Infuser',
        description: 'Craft infusions that affect dreams and perception',
        primaryBonus: 'Can create unique dream-affecting tonics',
        secondaryEffect: 'Chance to receive insight about rare recipes in dreams',
        requiredLevel: 6,
        synergyWith: ['tea_master'],
        appliedBonuses: {
          lunarMultiplier: 1.3,
          criticalSuccessChance: 0.2,
          discoveryChanceBonus: 0.25
        }
      }
    ],
    uniqueAbilities: [
      'Synergy Sensing - Detect powerful ingredient combinations',
      'Subtle Extraction - Extract properties without heat or distillation',
      'Dream Vision - Receive recipe insights through dreams'
    ]
  },
  // Adding two new specializations for expanded gameplay
  { 
    id: 'Crystallization', 
    name: 'Crystallization Atelier', 
    description: 'Specializes in solidifying magical essences into crystal form for jewelry, talismans, and charms.', 
    startBonus: 'Start with Quartz Dust and Shimmerflower Seeds',
    passiveBonus: '+25% potency for charm and talisman crafting',
    growthBonus: { crafting: 0.3, astrology: 0.2, herbalism: 0.1 },
    unlockRequirement: 'Complete the Crystal Mysteries ritual',
    specialFocus: ['charm', 'talisman', 'crystal', 'essence'],
    seasonalStrength: 'Winter',
    moonPhaseAlignment: 'Waxing Gibbous',
    craftingSignature: 'Items contain visible crystalline structures',
    upgradePaths: [
      {
        id: 'geometric_crystallization',
        name: 'Geometric Crystallization',
        description: 'Focus on precise geometric patterns for stable, consistent results.',
        unlockLevel: 5,
        bonusEffect: '+30% duration for all crystallized charms',
        skillRequirements: { crafting: 5, astrology: 3 },
        appliedBonuses: {
          durationMultiplier: 1.3,
          qualityMultiplier: 1.2,
          criticalSuccessChance: 0.1
        }
      },
      {
        id: 'fluid_crystallization',
        name: 'Fluid Crystallization',
        description: 'Create organic, flowing crystal structures with unique properties.',
        unlockLevel: 5,
        bonusEffect: 'Crystal charms have a chance for random beneficial effects',
        skillRequirements: { crafting: 4, brewing: 4 },
        appliedBonuses: {
          potencyMultiplier: 1.2,
          rarityChanceBonus: 0.25,
          criticalSuccessChance: 0.15
        }
      }
    ],
    subSpecializations: [
      {
        id: 'gem_infusion',
        name: 'Gem Infusion Expert',
        description: 'Infuse gemstones with magical properties',
        primaryBonus: '+40% potency when creating gem-based talismans',
        secondaryEffect: 'Can bind multiple effects to a single gemstone',
        requiredLevel: 3,
        appliedBonuses: {
          potencyMultiplier: 1.4,
          qualityMultiplier: 1.15,
          economyMultiplier: 1.2
        }
      },
      {
        id: 'resonant_crystallizer',
        name: 'Resonant Crystallizer',
        description: 'Create crystals that resonate with specific energies',
        primaryBonus: '+30% effectiveness for protection and warding charms',
        secondaryEffect: 'Crystals can store and amplify magical energy',
        requiredLevel: 3,
        exclusiveWith: ['gem_infusion'],
        appliedBonuses: {
          potencyMultiplier: 1.3,
          durationMultiplier: 1.25,
          lunarMultiplier: 1.15
        }
      }
    ],
    uniqueAbilities: [
      'Crystal Growth - Accelerate crystal formation',
      'Essence Binding - Permanently bind magical essence to crystals',
      'Resonance Tuning - Tune crystals to specific magical frequencies'
    ]
  },
  { 
    id: 'Transmutation', 
    name: 'Transmutation Atelier', 
    description: 'Focuses on transforming ingredients from one form to another, or combining unlike elements.', 
    startBonus: 'Start with Philosopher\'s Salt and a Transmutation Basin',
    passiveBonus: '+20% chance to discover new recipes when experimenting',
    growthBonus: { brewing: 0.3, astrology: 0.1, crafting: 0.2 },
    unlockRequirement: 'Achieve level 5 in Brewing skill',
    specialFocus: ['talisman', 'potion', 'essence', 'misc'],
    seasonalStrength: 'Spring',
    moonPhaseAlignment: 'New Moon',
    craftingSignature: 'Items slowly shift colors over time',
    upgradePaths: [
      {
        id: 'elemental_transmutation',
        name: 'Elemental Transmutation',
        description: 'Master the transformation of elemental properties within ingredients.',
        unlockLevel: 5,
        bonusEffect: 'Can transmute ingredients to have elemental properties',
        skillRequirements: { brewing: 5, astrology: 4 },
        appliedBonuses: {
          potencyMultiplier: 1.25,
          discoveryChanceBonus: 0.2,
          criticalSuccessChance: 0.15
        }
      },
      {
        id: 'alchemical_transmutation',
        name: 'Alchemical Transmutation',
        description: 'Focus on upgrading the quality and properties of ingredients.',
        unlockLevel: 5,
        bonusEffect: 'Chance to increase ingredient rarity during crafting',
        skillRequirements: { brewing: 4, crafting: 5 },
        appliedBonuses: {
          qualityMultiplier: 1.3,
          rarityChanceBonus: 0.3,
          economyMultiplier: 1.2
        }
      }
    ],
    subSpecializations: [
      {
        id: 'metal_transmuter',
        name: 'Metal Transmuter',
        description: 'Specialized in transmuting and enhancing metals',
        primaryBonus: 'Can create magical alloys with unique properties',
        secondaryEffect: 'Chance to enhance metal-based tools and ingredients',
        requiredLevel: 3,
        appliedBonuses: {
          qualityMultiplier: 1.3,
          rarityChanceBonus: 0.2,
          economyMultiplier: 1.25
        }
      },
      {
        id: 'essence_transmuter',
        name: 'Essence Transmuter',
        description: 'Transform the fundamental properties of magical essences',
        primaryBonus: '+35% potency when changing essence properties',
        secondaryEffect: 'Can combine incompatible essences successfully',
        requiredLevel: 3,
        exclusiveWith: ['metal_transmuter'],
        appliedBonuses: {
          potencyMultiplier: 1.35,
          criticalSuccessChance: 0.2,
          discoveryChanceBonus: 0.15
        }
      }
    ],
    uniqueAbilities: [
      'Matter Conversion - Transform one material into another',
      'Property Transfer - Move magical properties between items',
      'Essence Splicing - Combine the properties of multiple ingredients'
    ]
  }
];

// Extended function to get specialization-specific bonuses with more complexity
export function getSpecializationBonus(
  specialization: AtelierSpecialization | undefined,
  actionType: 'harvest' | 'brew' | 'grow' | 'sell' | 'craft' | 'research',
  itemType?: ItemType,
  itemCategory?: ItemCategory,
  moonPhase?: MoonPhase,
  season?: Season,
  atelierLevel: number = 1,
  activeUpgradePath?: string,
  activeSubSpecializations: string[] = []
): SpecializationBonusResult {
  const defaultResult: SpecializationBonusResult = { 
    bonusMultiplier: 1.0, 
    description: "No specialization bonus applicable" 
  };
  
  const spec = SPECIALIZATIONS.find(s => s.id === specialization);
  if (!spec) return defaultResult;

  // Initialize result with base bonuses
  let result: SpecializationBonusResult = { 
    bonusMultiplier: 1.0,
    chanceForExtra: 0,
    criticalChance: 0,
    qualityBonus: 0,
    durationBonus: 0,
    lunarBonus: 0,
    seasonalBonus: 0,
    specialEffects: [],
    description: ""
  };

  // Apply base specialization bonuses
  switch (actionType) {
    case 'harvest':
      if (specialization === 'Essence' && (itemCategory === 'flower' || itemCategory === 'root')) {
        result.bonusMultiplier = 1.1;
        result.description = "Essence Atelier: +10% harvest quality";
      } else if (specialization === 'Fermentation' && itemCategory === 'herb') {
        result.bonusMultiplier = 1.1;
        result.description = "Fermentation Atelier: +10% harvest quality";
      } else if (specialization === 'Distillation' && (itemCategory === 'fruit' || itemCategory === 'flower')) {
        result.bonusMultiplier = 1.1;
        result.description = "Distillation Atelier: +10% harvest quality";
      } else if (specialization === 'Infusion' && (itemCategory === 'herb' || itemCategory === 'leaf')) {
        result.bonusMultiplier = 1.15;
        result.description = "Infusion Atelier: +15% harvest quality";
      } else if (specialization === 'Crystallization' && itemCategory === 'crystal') {
        result.bonusMultiplier = 1.2;
        result.description = "Crystallization Atelier: +20% crystal harvest quality";
      } else if (specialization === 'Transmutation') {
        result.chanceForExtra = 0.1;
        result.description = "Transmutation Atelier: 10% chance for transmuted harvest";
      }
      break;

    case 'brew':
      if (specialization === 'Essence' && (itemCategory === 'mask' || itemCategory === 'serum')) {
        result.bonusMultiplier = 1.15;
        result.description = "Essence Atelier: +15% potency";
      } else if (specialization === 'Fermentation' && itemType === 'potion') {
        result.bonusMultiplier = 1.05;
        result.qualityBonus = 10;
        result.description = "Fermentation Atelier: +5% potency and +10% quality";
      } else if (specialization === 'Distillation' && itemType === 'potion') {
        result.chanceForExtra = 0.15;
        result.description = "Distillation Expertise: 15% chance for double yield";
      } else if (specialization === 'Infusion' && (itemCategory === 'tonic' || itemCategory === 'elixir')) {
        result.bonusMultiplier = 1.20;
        result.description = "Infusion Atelier: +20% effectiveness";
      } else if (specialization === 'Transmutation' && itemType === 'potion') {
        result.criticalChance = 0.15;
        result.description = "Transmutation Atelier: 15% chance for magical mutation";
      }
      break;

    case 'grow':
      if (specialization === 'Essence' && (itemCategory === 'flower' || itemCategory === 'root')) {
        result.bonusMultiplier = 1.1;
        result.description = "Essence Atelier: +10% growth speed";
      } else if (specialization === 'Fermentation' && itemCategory === 'herb') {
        result.bonusMultiplier = 1.1;
        result.description = "Fermentation Atelier: +10% growth speed";
      } else if (specialization === 'Distillation' && itemCategory === 'fruit') {
        result.bonusMultiplier = 1.15;
        result.description = "Distillation Atelier: +15% growth speed";
      } else if (specialization === 'Infusion' && (itemCategory === 'herb' || itemCategory === 'leaf')) {
        result.bonusMultiplier = 1.1;
        result.description = "Infusion Atelier: +10% growth speed";
      } else if (specialization === 'Crystallization' && itemCategory === 'crystal') {
        result.bonusMultiplier = 1.2;
        result.description = "Crystallization Atelier: +20% crystal growth speed";
      } else if (specialization === 'Transmutation') {
        result.criticalChance = 0.1;
        result.description = "Transmutation Atelier: 10% chance for plant mutation";
      }
      break;

    case 'sell':
      if (specialization === 'Essence' && (itemCategory === 'mask' || itemCategory === 'serum')) {
        result.bonusMultiplier = 1.15;
        result.description = "Essence Atelier: +15% sell value";
      } else if (specialization === 'Fermentation' && itemType === 'potion') {
        result.bonusMultiplier = 1.1;
        result.description = "Fermentation Atelier: +10% sell value for aged potions";
      } else if (specialization === 'Distillation' && itemType === 'ingredient') {
        result.bonusMultiplier = 1.05;
        result.description = "Distillation Atelier: +5% sell value for ingredients";
      } else if (specialization === 'Infusion' && (itemCategory === 'tonic' || itemCategory === 'elixir')) {
        result.bonusMultiplier = 1.15;
        result.description = "Infusion Atelier: +15% sell value for tonics and elixirs";
      } else if (specialization === 'Crystallization' && (itemCategory === 'charm' || itemCategory === 'talisman')) {
        result.bonusMultiplier = 1.2;
        result.description = "Crystallization Atelier: +20% sell value for charms and talismans";
      } else if (specialization === 'Transmutation' && itemType === 'essence') {
        result.bonusMultiplier = 1.25;
        result.description = "Transmutation Atelier: +25% sell value for essences";
      }
      break;

    case 'craft':
      if (specialization === 'Essence' && (itemCategory === 'mask' || itemCategory === 'serum')) {
        result.bonusMultiplier = 1.15;
        result.qualityBonus = 10;
        result.description = "Essence Atelier: +15% potency and +10% quality for masks/serums";
      } else if (specialization === 'Fermentation' && (itemType === 'potion' || itemType === 'tonic')) {
        result.durationBonus = 20;
        result.description = "Fermentation Atelier: +20% duration for potions/tonics";
      } else if (specialization === 'Distillation' && (itemType === 'oil' || itemType === 'elixir')) {
        result.bonusMultiplier = 1.2;
        result.chanceForExtra = 0.1;
        result.description = "Distillation Atelier: +20% potency and 10% extra yield chance";
      } else if (specialization === 'Infusion' && (itemCategory === 'tonic' || itemCategory === 'elixir')) {
        result.bonusMultiplier = 1.2;
        result.durationBonus = 15;
        result.description = "Infusion Atelier: +20% potency and +15% duration";
      } else if (specialization === 'Crystallization' && (itemCategory === 'charm' || itemCategory === 'talisman')) {
        result.bonusMultiplier = 1.25;
        result.durationBonus = 20;
        result.description = "Crystallization Atelier: +25% potency and +20% duration";
      } else if (specialization === 'Transmutation') {
        result.criticalChance = 0.2;
        result.qualityBonus = 15;
        result.description = "Transmutation Atelier: 20% critical success chance and +15% quality";
      }
      break;

    case 'research':
      if (specialization === 'Essence') {
        result.bonusMultiplier = 1.1;
        result.description = "Essence Atelier: +10% research efficiency";
      } else if (specialization === 'Fermentation') {
        result.bonusMultiplier = 1.1;
        result.description = "Fermentation Atelier: +10% research efficiency";
      } else if (specialization === 'Distillation') {
        result.bonusMultiplier = 1.1;
        result.description = "Distillation Atelier: +10% research efficiency";
      } else if (specialization === 'Infusion') {
        result.bonusMultiplier = 1.15;
        result.description = "Infusion Atelier: +15% research efficiency";
      } else if (specialization === 'Crystallization') {
        result.bonusMultiplier = 1.15;
        result.description = "Crystallization Atelier: +15% research efficiency";
      } else if (specialization === 'Transmutation') {
        result.bonusMultiplier = 1.2;
        result.description = "Transmutation Atelier: +20% research efficiency";
      }
      break;
  }

  // Apply lunar phase bonuses if applicable
  if (moonPhase && spec.moonPhaseAlignment === moonPhase) {
    result.lunarBonus = 15;
    result.bonusMultiplier *= 1.15;
    result.specialEffects?.push(`Lunar alignment bonus: +15% effectiveness during ${moonPhase}`);
  }

  // Apply seasonal bonuses if applicable
  if (season && spec.seasonalStrength === season) {
    result.seasonalBonus = 10;
    result.bonusMultiplier *= 1.1;
    result.specialEffects?.push(`Seasonal strength: +10% effectiveness during ${season}`);
  }

  // Apply level-based bonuses (higher level = better bonuses)
  const levelBonus = Math.min(atelierLevel * 0.02, 0.2); // Cap at 20% for level 10
  result.bonusMultiplier *= (1 + levelBonus);
  
  // Add upgrade path bonuses if active
  if (activeUpgradePath && spec.upgradePaths) {
    const upgradePath = spec.upgradePaths.find(path => path.id === activeUpgradePath);
    if (upgradePath && atelierLevel >= upgradePath.unlockLevel) {
      // Apply upgrade path bonuses
      const bonuses = upgradePath.appliedBonuses;
      
      if (bonuses.potencyMultiplier) {
        result.bonusMultiplier *= bonuses.potencyMultiplier;
      }
      if (bonuses.yieldMultiplier && result.chanceForExtra) {
        result.chanceForExtra *= bonuses.yieldMultiplier;
      } else if (bonuses.yieldMultiplier) {
        result.chanceForExtra = (bonuses.yieldMultiplier - 1) * 0.5; // Convert to chance
      }
      if (bonuses.qualityMultiplier) {
        result.qualityBonus = (result.qualityBonus || 0) + ((bonuses.qualityMultiplier - 1) * 100);
      }
      if (bonuses.durationMultiplier) {
        result.durationBonus = (result.durationBonus || 0) + ((bonuses.durationMultiplier - 1) * 100);
      }
      if (bonuses.criticalSuccessChance) {
        result.criticalChance = (result.criticalChance || 0) + bonuses.criticalSuccessChance;
      }
      if (bonuses.lunarMultiplier && moonPhase) {
        result.lunarBonus = (result.lunarBonus || 0) + ((bonuses.lunarMultiplier - 1) * 100);
      }
      if (bonuses.seasonalMultiplier && season) {
        result.seasonalBonus = (result.seasonalBonus || 0) + ((bonuses.seasonalMultiplier - 1) * 100);
      }
      
      result.specialEffects?.push(`${upgradePath.name}: ${upgradePath.bonusEffect}`);
    }
  }
  
  // Add sub-specialization bonuses if active
  if (activeSubSpecializations.length > 0 && spec.subSpecializations) {
    for (const subSpecId of activeSubSpecializations) {
      const subSpec = spec.subSpecializations.find(ss => ss.id === subSpecId);
      if (subSpec && atelierLevel >= subSpec.requiredLevel) {
        // Apply sub-specialization bonuses
        const bonuses = subSpec.appliedBonuses;
        
        if (bonuses.potencyMultiplier) {
          result.bonusMultiplier *= bonuses.potencyMultiplier;
        }
        if (bonuses.qualityMultiplier) {
          result.qualityBonus = (result.qualityBonus || 0) + ((bonuses.qualityMultiplier - 1) * 100);
        }
        if (bonuses.durationMultiplier) {
          result.durationBonus = (result.durationBonus || 0) + ((bonuses.durationMultiplier - 1) * 100);
        }
        if (bonuses.criticalSuccessChance) {
          result.criticalChance = (result.criticalChance || 0) + bonuses.criticalSuccessChance;
        }
        if (bonuses.rarityChanceBonus) {
          result.specialEffects?.push(`${bonuses.rarityChanceBonus * 100}% chance for rarity increase`);
        }
        if (bonuses.discoveryChanceBonus) {
          result.specialEffects?.push(`${bonuses.discoveryChanceBonus * 100}% increased discovery chance`);
        }
        
        result.specialEffects?.push(`${subSpec.name}: ${subSpec.primaryBonus}`);
      }
    }
  }
  
  // Check for synergies between sub-specializations
  if (activeSubSpecializations.length >= 2 && spec.subSpecializations) {
    for (const subSpecId of activeSubSpecializations) {
      const subSpec = spec.subSpecializations.find(ss => ss.id === subSpecId);
      if (subSpec?.synergyWith) {
        // Check if any synergy pairs are active
        const hasSynergy = subSpec.synergyWith.some(synId => activeSubSpecializations.includes(synId));
        if (hasSynergy) {
          result.bonusMultiplier *= 1.1; // 10% synergy bonus
          result.specialEffects?.push(`Sub-specialization synergy: +10% effectiveness`);
          break; // Only apply synergy bonus once
        }
      }
    }
  }

  // Finalize description if it's still empty
  if (!result.description) {
    result.description = `${spec.name}: Various bonuses applied`;
  }

  // Ensure bonuses are within reasonable limits
  result.bonusMultiplier = Math.min(result.bonusMultiplier, 3.0); // Cap at 300%
  result.chanceForExtra = Math.min(result.chanceForExtra || 0, 0.75); // Cap at 75%
  result.criticalChance = Math.min(result.criticalChance || 0, 0.5); // Cap at 50%
  
  return result;
}

// Calculate skill growth bonus with expanded system
export function getSkillGrowthBonus(
  specialization: AtelierSpecialization | undefined, 
  skill: keyof Skills,
  atelierLevel: number = 1,
  activeSubSpecializations: string[] = []
): number {
  if (!specialization) return 0;
  
  const spec = SPECIALIZATIONS.find(s => s.id === specialization);
  if (!spec) return 0;
  
  // Base growth bonus from specialization
  let bonus = spec.growthBonus?.[skill] || 0;
  
  // Level scaling (small bonus per level)
  const levelBonus = atelierLevel * 0.02; // 2% per level
  bonus += levelBonus;
  
  // Sub-specialization bonuses if applicable
  if (activeSubSpecializations.length > 0 && spec.subSpecializations) {
    // Check for sub-specializations that might boost this skill
    for (const subSpecId of activeSubSpecializations) {
      const subSpec = spec.subSpecializations.find(ss => ss.id === subSpecId);
      
      // Apply a small boost for relevant sub-specializations
      if (subSpec) {
        bonus += 0.05; // Small flat boost for having a sub-specialization
      }
    }
  }
  
  return bonus;
}

// Get full specialization details
export function getSpecialization(id: AtelierSpecialization): AtelierSpecializationDetails | undefined {
  return SPECIALIZATIONS.find(s => s.id === id);
}

// Get all available upgrade paths for a specialization
export function getUpgradePaths(
  specialization: AtelierSpecialization,
  atelierLevel: number = 1
): AtelierUpgradePath[] {
  const spec = SPECIALIZATIONS.find(s => s.id === specialization);
  if (!spec || !spec.upgradePaths) return [];
  
  // Filter paths by level requirement
  return spec.upgradePaths.filter(path => path.unlockLevel <= atelierLevel);
}

// Get all sub-specializations available for a specialization
export function getSubSpecializations(
  specialization: AtelierSpecialization,
  atelierLevel: number = 1,
  activeSubSpecializations: string[] = []
): AtelierSubSpecialization[] {
  const spec = SPECIALIZATIONS.find(s => s.id === specialization);
  if (!spec || !spec.subSpecializations) return [];
  
  // Filter by level requirement
  const availableSubs = spec.subSpecializations.filter(subSpec => 
    subSpec.requiredLevel <= atelierLevel
  );
  
  // Filter out those that are exclusive with already selected ones
  return availableSubs.filter(subSpec => {
    // If this subSpec is already active, include it
    if (activeSubSpecializations.includes(subSpec.id)) return true;
    
    // If it has exclusivity constraints, check them
    if (subSpec.exclusiveWith && subSpec.exclusiveWith.length > 0) {
      // Check if any of the exclusive options are already active
      const hasExclusiveConflict = subSpec.exclusiveWith.some(exId => 
        activeSubSpecializations.includes(exId)
      );
      
      // Include only if there's no conflict
      return !hasExclusiveConflict;
    }
    
    // No constraints, include it
    return true;
  });
}

// New function: Process crafting with complex modifiers
export function processCrafting(
  specialization: AtelierSpecialization | undefined,
  atelierLevel: number,
  ingredients: InventoryItem[],
  recipeId: string,
  upgradePathId?: string,
  activeSubSpecializations: string[] = [],
  currentMoonPhase?: MoonPhase,
  currentSeason?: Season
): AtelierCraftingResult {
  // Initialize default result
  const result: AtelierCraftingResult = {
    success: true,
    itemId: recipeId,
    quantity: 1,
    experience: 10 + (atelierLevel * 2), // Base XP + level scaling
    specialInsight: "Standard crafting completed."
  };
  
  // Get specialization bonuses
  // For now, assume we're crafting a potion (you would need to determine actual type/category)
  const itemType: ItemType = 'potion'; // Placeholder - would be determined by recipe
  const itemCategory: ItemCategory = 'potion'; // Placeholder - would be determined by recipe
  
  const bonus = getSpecializationBonus(
    specialization,
    'craft',
    itemType,
    itemCategory,
    currentMoonPhase,
    currentSeason,
    atelierLevel,
    upgradePathId,
    activeSubSpecializations
  );
  
  // Apply quality modifier based on bonuses
  result.qualityModifier = (bonus.qualityBonus || 0) / 100 + 1.0;
  
  // Calculate critical success chance
  const critChance = bonus.criticalChance || 0;
  const critRoll = Math.random();
  result.criticalSuccess = critRoll < critChance;
  
  // Apply critical success bonuses
  if (result.criticalSuccess) {
    result.quantity += 1; // Bonus item
    result.qualityModifier = (result.qualityModifier || 1) * 1.5; // 50% quality boost
    result.specialInsight = "Critical success! Bonus quality and quantity achieved.";
    
    // Add special effects based on specialization
    if (specialization === 'Essence') {
      result.bonusEffects = ["Essence Resonance: Item has enhanced potency"];
    } else if (specialization === 'Fermentation') {
      result.bonusEffects = ["Perfect Fermentation: Extended duration effect"];
    } else if (specialization === 'Distillation') {
      result.bonusEffects = ["Pure Distillation: Exceptional clarity and potency"];
    } else if (specialization === 'Infusion') {
      result.bonusEffects = ["Harmonious Infusion: Multiple effects resonate together"];
    } else if (specialization === 'Crystallization') {
      result.bonusEffects = ["Perfect Lattice: Crystal structure enhances magical conductivity"];
    } else if (specialization === 'Transmutation') {
      result.bonusEffects = ["Magical Mutation: Unexpected beneficial properties emerged"];
    }
  }
  
  // Calculate chance for extra yield
  if (bonus.chanceForExtra) {
    const extraRoll = Math.random();
    if (extraRoll < bonus.chanceForExtra) {
      result.quantity += 1;
      if (!result.bonusEffects) result.bonusEffects = [];
      result.bonusEffects.push("Process Efficiency: Extra yield obtained");
    }
  }
  
  // Apply specialization signature effects if high enough level
  if (atelierLevel >= 5 && specialization) {
    const spec = getSpecialization(specialization);
    if (spec?.craftingSignature) {
      if (!result.itemProperties) result.itemProperties = {};
      result.itemProperties.creationSignature = spec.craftingSignature;
    }
  }
  
  // Apply lunar and seasonal effects if applicable
  if (bonus.lunarBonus && bonus.lunarBonus > 0 && currentMoonPhase) {
    if (!result.itemProperties) result.itemProperties = {};
    result.itemProperties.lunarInfusion = currentMoonPhase;
    if (!result.bonusEffects) result.bonusEffects = [];
    result.bonusEffects.push(`Lunar Infusion: Enhanced during ${currentMoonPhase}`);
  }
  
  if (bonus.seasonalBonus && bonus.seasonalBonus > 0 && currentSeason) {
    if (!result.itemProperties) result.itemProperties = {};
    result.itemProperties.seasonalAlignment = currentSeason;
    if (!result.bonusEffects) result.bonusEffects = [];
    result.bonusEffects.push(`Seasonal Alignment: Attuned to ${currentSeason}`);
  }
  
  // Small chance for recipe discovery based on level and specialization
  const discoveryBaseChance = 0.05 + (atelierLevel * 0.01); // 5% + 1% per level
  const discoveryRoll = Math.random();
  
  // Higher chance for Transmutation specialization
  const discoveryBoost = specialization === 'Transmutation' ? 0.1 : 0;
  
  if (discoveryRoll < (discoveryBaseChance + discoveryBoost)) {
    result.discoveredRecipe = true;
    result.specialInsight = "Experimentation led to a new recipe discovery!";
  }
  
  // Add byproducts for certain specializations (5% chance)
  if (Math.random() < 0.05) {
    if (specialization === 'Distillation') {
      result.byproducts = [{ itemId: 'ing_refined_essence', quantity: 1 }];
    } else if (specialization === 'Fermentation') {
      result.byproducts = [{ itemId: 'ing_fermentation_culture', quantity: 1 }];
    } else if (specialization === 'Crystallization') {
      result.byproducts = [{ itemId: 'ing_crystal_dust', quantity: 1 }];
    }
  }
  
  return result;
}

// New function: Calculate experience needed for next level
export function getExperienceForNextLevel(currentLevel: number): number {
  // Exponential growth formula
  return Math.floor(100 * Math.pow(1.5, currentLevel - 1));
}

// New function: Check if player can adopt a sub-specialization
export function canAdoptSubSpecialization(
  specialization: AtelierSpecialization,
  subSpecId: string,
  atelierLevel: number,
  activeSubSpecializations: string[] = []
): { allowed: boolean, reason?: string } {
  const spec = SPECIALIZATIONS.find(s => s.id === specialization);
  if (!spec || !spec.subSpecializations) {
    return { allowed: false, reason: "Specialization does not exist or has no sub-specializations" };
  }
  
  // Find the requested sub-specialization
  const subSpec = spec.subSpecializations.find(ss => ss.id === subSpecId);
  if (!subSpec) {
    return { allowed: false, reason: "Sub-specialization does not exist" };
  }
  
  // Check level requirement
  if (atelierLevel < subSpec.requiredLevel) {
    return { 
      allowed: false, 
      reason: `Requires atelier level ${subSpec.requiredLevel} (current: ${atelierLevel})` 
    };
  }
  
  // Check exclusivity constraints
  if (subSpec.exclusiveWith && subSpec.exclusiveWith.length > 0) {
    // Check if any exclusive options are already active
    const conflictingSpecs = subSpec.exclusiveWith.filter(exId => 
      activeSubSpecializations.includes(exId)
    );
    
    if (conflictingSpecs.length > 0) {
      // Find the name of the conflicting specialization
      const conflictNames = conflictingSpecs.map(id => {
        const conflictSpec = spec.subSpecializations?.find(ss => ss.id === id);
        return conflictSpec?.name || id;
      });
      
      return { 
        allowed: false, 
        reason: `Exclusive with active sub-specialization: ${conflictNames.join(', ')}` 
      };
    }
  }
  
  // Check if already at maximum allowed sub-specializations (limit to 2)
  if (activeSubSpecializations.length >= 2 && !activeSubSpecializations.includes(subSpecId)) {
    return { 
      allowed: false, 
      reason: "Maximum number of sub-specializations already adopted (limit: 2)" 
    };
  }
  
  return { allowed: true };
}

// New function: Get unique abilities available based on level
export function getAvailableUniqueAbilities(
  specialization: AtelierSpecialization,
  atelierLevel: number
): string[] {
  const spec = SPECIALIZATIONS.find(s => s.id === specialization);
  if (!spec || !spec.uniqueAbilities) return [];
  
  // Unlock abilities based on level thresholds
  const abilities: string[] = [];
  
  if (atelierLevel >= 3 && spec.uniqueAbilities.length >= 1) {
    abilities.push(spec.uniqueAbilities[0]);
  }
  
  if (atelierLevel >= 6 && spec.uniqueAbilities.length >= 2) {
    abilities.push(spec.uniqueAbilities[1]);
  }
  
  if (atelierLevel >= 9 && spec.uniqueAbilities.length >= 3) {
    abilities.push(spec.uniqueAbilities[2]);
  }
  
  return abilities;
}