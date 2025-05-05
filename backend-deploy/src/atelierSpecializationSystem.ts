import { Season, MoonPhase, ItemCategory, Skills } from "coven-shared";
import { CraftableProduct } from "./craftPointsSystem.js";

// Enhanced specialization system with strategic upgrade paths

// Main specialization types (extending the shared enum)
export enum EnhancedSpecialization {
  // Base specializations
  ESSENCE = "Essence",
  FERMENTATION = "Fermentation",
  DISTILLATION = "Distillation",
  INFUSION = "Infusion",
  CRYSTALLIZATION = "Crystallization",
  TRANSMUTATION = "Transmutation",
  
  // Advanced specializations (unlocked via mastery)
  CELESTIAL_ESSENCE = "CelestialEssence",
  TEMPORAL_FERMENTATION = "TemporalFermentation",
  ELEMENTAL_DISTILLATION = "ElementalDistillation",
  SOUL_INFUSION = "SoulInfusion",
  PRISMATIC_CRYSTALLIZATION = "PrismaticCrystallization",
  REALITY_TRANSMUTATION = "RealityTransmutation"
}

// Mastery levels that define progression in a specialization
export enum MasteryLevel {
  NOVICE = 1,       // Starting level
  APPRENTICE = 2,   // Basic techniques
  ADEPT = 3,        // Intermediate techniques
  EXPERT = 4,       // Advanced techniques
  MASTER = 5,       // Specialization mastery
  GRANDMASTER = 6,  // Ultimate mastery
  TRANSCENDENT = 7  // Beyond mastery (special unlock)
}

// Mastery benefits per level
export interface MasteryBenefits {
  qualityBonus: number;         // % bonus to product quality
  craftingSpeedBonus: number;   // % reduction in crafting time
  ingredientEfficiency: number; // % chance to preserve ingredients
  discoveryChance: number;      // % chance to discover new recipes
  yieldBonus: number;           // % bonus to production yield
  unlockSlots: number;          // Number of technique slots unlocked
}

// Specialization paths (branches within a specialization)
export interface SpecializationPath {
  id: string;
  name: string;
  description: string;
  requiredMastery: MasteryLevel;
  craftPointCost: number;
  benefits: {
    description: string;
    effect: Effect;
  }[];
  unlocksTechniques: string[];
  upgradesTo?: string; // Path it can evolve into
}

// Individual techniques that can be equipped
export interface Technique {
  id: string;
  name: string;
  description: string;
  requiredMastery: MasteryLevel;
  requiredPath?: string;
  craftPointCost: number;
  maxLevel: number;
  effects: Effect[];
  cooldown?: number; // In game minutes if active technique
  isPassive: boolean;
}

// Effect types for techniques and paths
export type Effect = 
  | { type: "qualityBonus", value: number }
  | { type: "categoryBonus", category: ItemCategory, value: number }
  | { type: "seasonalBonus", season: Season, value: number }
  | { type: "lunarBonus", phase: MoonPhase, value: number }
  | { type: "ingredientPreservation", chance: number }
  | { type: "criticalSuccess", chance: number, multiplier: number }
  | { type: "discoveryCatalyst", chance: number }
  | { type: "townAffinity", townId: string, value: number }
  | { type: "skillGrowth", skill: keyof Skills, value: number }
  | { type: "craftPointDiscount", value: number }
  | { type: "unlockRecipes", recipes: string[] }
  | { type: "activeTechnique", effect: string, value: number, duration: number }
  | { type: "uniqueProperty", property: string, description: string }
  | { type: "yieldBonus", value: number }
  | { type: "craftingSpeedBonus", value: number };

// Player's specialization status and progress
export interface SpecializationStatus {
  primary: EnhancedSpecialization;
  masteryLevel: MasteryLevel;
  masteryExperience: number;
  experienceToNextLevel: number;
  selectedPaths: string[];
  equippedTechniques: {
    id: string;
    level: number;
    cooldownRemaining?: number;
  }[];
  maxTechniqueSlots: number;
  availableTechniqueSlots: number;
}

// Constants for mastery progression
const MASTERY_LEVEL_EXPERIENCE: Record<MasteryLevel, number> = {
  [MasteryLevel.NOVICE]: 0,
  [MasteryLevel.APPRENTICE]: 1000,
  [MasteryLevel.ADEPT]: 3000,
  [MasteryLevel.EXPERT]: 7000,
  [MasteryLevel.MASTER]: 15000,
  [MasteryLevel.GRANDMASTER]: 30000,
  [MasteryLevel.TRANSCENDENT]: 60000
};

// Mastery benefits per level
const MASTERY_BENEFITS: Record<MasteryLevel, MasteryBenefits> = {
  [MasteryLevel.NOVICE]: {
    qualityBonus: 0,
    craftingSpeedBonus: 0,
    ingredientEfficiency: 0,
    discoveryChance: 0.05,
    yieldBonus: 0,
    unlockSlots: 1
  },
  [MasteryLevel.APPRENTICE]: {
    qualityBonus: 5,
    craftingSpeedBonus: 5,
    ingredientEfficiency: 0.05,
    discoveryChance: 0.1,
    yieldBonus: 5,
    unlockSlots: 2
  },
  [MasteryLevel.ADEPT]: {
    qualityBonus: 10,
    craftingSpeedBonus: 10,
    ingredientEfficiency: 0.1,
    discoveryChance: 0.15,
    yieldBonus: 10,
    unlockSlots: 3
  },
  [MasteryLevel.EXPERT]: {
    qualityBonus: 15,
    craftingSpeedBonus: 15,
    ingredientEfficiency: 0.15,
    discoveryChance: 0.2,
    yieldBonus: 15,
    unlockSlots: 4
  },
  [MasteryLevel.MASTER]: {
    qualityBonus: 20,
    craftingSpeedBonus: 20,
    ingredientEfficiency: 0.2,
    discoveryChance: 0.25,
    yieldBonus: 20,
    unlockSlots: 5
  },
  [MasteryLevel.GRANDMASTER]: {
    qualityBonus: 25,
    craftingSpeedBonus: 25,
    ingredientEfficiency: 0.25,
    discoveryChance: 0.3,
    yieldBonus: 25,
    unlockSlots: 6
  },
  [MasteryLevel.TRANSCENDENT]: {
    qualityBonus: 30,
    craftingSpeedBonus: 30,
    ingredientEfficiency: 0.3,
    discoveryChance: 0.4,
    yieldBonus: 30,
    unlockSlots: 7
  }
};

// Define specialization paths for each base specialization
export const SPECIALIZATION_PATHS: Record<EnhancedSpecialization, SpecializationPath[]> = {
  // ESSENCE SPECIALIZATION PATHS
  [EnhancedSpecialization.ESSENCE]: [
    {
      id: "essence_purification",
      name: "Essence Purification",
      description: "Focus on creating exceptionally pure essences, improving potency at the cost of yield.",
      requiredMastery: MasteryLevel.APPRENTICE,
      craftPointCost: 300,
      benefits: [
        {
          description: "Essence extractions gain +25% quality",
          effect: { type: "qualityBonus", value: 25 }
        },
        {
          description: "Products containing essence gain the 'Pure' property",
          effect: { type: "uniqueProperty", property: "pure", description: "This product has been purified to its essence, enhancing its primary effect." }
        }
      ],
      unlocksTechniques: ["essence_refinement", "purity_catalyst", "essence_resonance"],
      upgradesTo: "radiant_essence"
    },
    {
      id: "essence_amplification",
      name: "Essence Amplification",
      description: "Maximize yield from essences, allowing more products from the same ingredients.",
      requiredMastery: MasteryLevel.APPRENTICE,
      craftPointCost: 300,
      benefits: [
        {
          description: "30% chance to create additional essence during extraction",
          effect: { type: "yieldBonus", value: 30 }
        },
        {
          description: "Products gain enhanced potency under the Full Moon",
          effect: { type: "lunarBonus", phase: "Full Moon", value: 25 }
        }
      ],
      unlocksTechniques: ["essence_division", "potent_catalyst", "lunar_attunement"],
      upgradesTo: "resonant_amplification"
    },
    {
      id: "floral_essence",
      name: "Floral Essence Mastery",
      description: "Specialize in the extraction and utilization of flower essences for beautifying products.",
      requiredMastery: MasteryLevel.ADEPT,
      craftPointCost: 500,
      benefits: [
        {
          description: "Flower-based skincare products gain +30% quality",
          effect: { type: "categoryBonus", category: "flower", value: 30 }
        },
        {
          description: "Products gain the 'Radiant Bloom' property during Spring",
          effect: { type: "seasonalBonus", season: "Spring", value: 35 }
        }
      ],
      unlocksTechniques: ["petal_infusion", "floral_preservation", "bloom_catalyst"],
      upgradesTo: "ethereal_blossom"
    }
  ],
  
  // FERMENTATION SPECIALIZATION PATHS
  [EnhancedSpecialization.FERMENTATION]: [
    {
      id: "wild_fermentation",
      name: "Wild Fermentation",
      description: "Harness wild microorganisms for unpredictable but potentially amazing results.",
      requiredMastery: MasteryLevel.APPRENTICE,
      craftPointCost: 300,
      benefits: [
        {
          description: "20% chance of critical success with dramatic quality increase",
          effect: { type: "criticalSuccess", chance: 0.2, multiplier: 1.5 }
        },
        {
          description: "10% chance to discover new recipes during fermentation",
          effect: { type: "discoveryCatalyst", chance: 0.1 }
        }
      ],
      unlocksTechniques: ["wild_culture", "fermentation_catalyst", "microbial_harmony"],
      upgradesTo: "primal_fermentation"
    },
    {
      id: "precise_fermentation",
      name: "Precise Fermentation",
      description: "Control the fermentation process with scientific precision for consistent results.",
      requiredMastery: MasteryLevel.APPRENTICE,
      craftPointCost: 300,
      benefits: [
        {
          description: "All fermented products gain +20% quality",
          effect: { type: "qualityBonus", value: 20 }
        },
        {
          description: "Fermented products have 20% longer shelf life",
          effect: { type: "uniqueProperty", property: "preserved", description: "This product maintains its potency for a longer duration." }
        }
      ],
      unlocksTechniques: ["measured_timing", "temperature_control", "predictable_outcomes"],
      upgradesTo: "scientific_fermentation"
    },
    {
      id: "aging_mastery",
      name: "Aging Mastery",
      description: "Master the art of aging products to perfection, increasing their value over time.",
      requiredMastery: MasteryLevel.ADEPT,
      craftPointCost: 500,
      benefits: [
        {
          description: "Products gain value and potency as they age",
          effect: { type: "uniqueProperty", property: "time_enhanced", description: "This product improves with age, gaining potency over time." }
        },
        {
          description: "Products aged for more than 7 days gain +40% quality",
          effect: { type: "qualityBonus", value: 40 }
        }
      ],
      unlocksTechniques: ["perfect_timing", "vintage_creation", "maturation_catalyst"],
      upgradesTo: "temporal_enhancement"
    }
  ],
  
  // DISTILLATION SPECIALIZATION PATHS
  [EnhancedSpecialization.DISTILLATION]: [
    {
      id: "fractional_distillation",
      name: "Fractional Distillation",
      description: "Master the art of separating components at different boiling points for purer products.",
      requiredMastery: MasteryLevel.APPRENTICE,
      craftPointCost: 300,
      benefits: [
        {
          description: "Distilled products gain +35% quality",
          effect: { type: "qualityBonus", value: 35 }
        },
        {
          description: "Products gain the 'Refined' property",
          effect: { type: "uniqueProperty", property: "refined", description: "This product has been refined to exceptional purity, enhancing its core properties." }
        }
      ],
      unlocksTechniques: ["precise_separation", "vapor_control", "essence_extraction"],
      upgradesTo: "elemental_separation"
    },
    {
      id: "rapid_distillation",
      name: "Rapid Distillation",
      description: "Optimize the distillation process for maximum yield and efficiency.",
      requiredMastery: MasteryLevel.APPRENTICE,
      craftPointCost: 300,
      benefits: [
        {
          description: "100% increase in distillation yield",
          effect: { type: "yieldBonus", value: 100 }
        },
        {
          description: "40% reduction in crafting time",
          effect: { type: "craftingSpeedBonus", value: 40 }
        }
      ],
      unlocksTechniques: ["heat_acceleration", "efficient_recovery", "rapid_condensation"],
      upgradesTo: "efficiency_mastery"
    },
    {
      id: "aromatherapy_distillation",
      name: "Aromatherapy Distillation",
      description: "Specialize in extracting and preserving aromatic compounds for therapeutic benefit.",
      requiredMastery: MasteryLevel.ADEPT,
      craftPointCost: 500,
      benefits: [
        {
          description: "Aromatic products gain +30% quality and sensory effects",
          effect: { type: "uniqueProperty", property: "aromatic", description: "This product contains enhanced aromatic compounds that provide therapeutic benefits." }
        },
        {
          description: "Products created during Summer gain enhanced potency",
          effect: { type: "seasonalBonus", season: "Summer", value: 30 }
        }
      ],
      unlocksTechniques: ["aroma_preservation", "sensory_enhancement", "therapeutic_extraction"],
      upgradesTo: "vital_essence"
    }
  ],
  
  // INFUSION SPECIALIZATION PATHS
  [EnhancedSpecialization.INFUSION]: [
    {
      id: "celestial_infusion",
      name: "Celestial Infusion",
      description: "Infuse products with cosmic energy based on astrological alignments.",
      requiredMastery: MasteryLevel.APPRENTICE,
      craftPointCost: 300,
      benefits: [
        {
          description: "Products created during specific moon phases gain powerful bonuses",
          effect: { type: "lunarBonus", phase: "Full Moon", value: 50 }
        },
        {
          description: "Products gain the 'Celestial' property",
          effect: { type: "uniqueProperty", property: "celestial", description: "This product resonates with celestial energy, enhancing its effects based on lunar cycles." }
        }
      ],
      unlocksTechniques: ["lunar_timing", "stellar_infusion", "cosmic_harmony"],
      upgradesTo: "astral_mastery"
    },
    {
      id: "harmonic_infusion",
      name: "Harmonic Infusion",
      description: "Create perfectly balanced infusions with multiple harmonious ingredients.",
      requiredMastery: MasteryLevel.APPRENTICE,
      craftPointCost: 300,
      benefits: [
        {
          description: "+40% quality when using 3+ ingredients in a recipe",
          effect: { type: "qualityBonus", value: 40 }
        },
        {
          description: "15% chance to preserve ingredients during crafting",
          effect: { type: "ingredientPreservation", chance: 0.15 }
        }
      ],
      unlocksTechniques: ["ingredient_synergy", "balanced_elements", "harmonic_resonance"],
      upgradesTo: "symphony_of_elements"
    },
    {
      id: "therapeutic_infusion",
      name: "Therapeutic Infusion",
      description: "Specialize in creating infusions with enhanced healing and rejuvenating properties.",
      requiredMastery: MasteryLevel.ADEPT,
      craftPointCost: 500,
      benefits: [
        {
          description: "Healing and rejuvenating products gain +40% quality",
          effect: { type: "qualityBonus", value: 40 }
        },
        {
          description: "Products gain the 'Therapeutic' property",
          effect: { type: "uniqueProperty", property: "therapeutic", description: "This product provides enhanced healing and rejuvenating benefits." }
        }
      ],
      unlocksTechniques: ["healing_resonance", "vitality_enhancement", "rejuvenation_catalyst"],
      upgradesTo: "vital_restoration"
    }
  ],
  
  // CRYSTALLIZATION SPECIALIZATION PATHS
  [EnhancedSpecialization.CRYSTALLIZATION]: [
    {
      id: "geometric_crystallization",
      name: "Geometric Crystallization",
      description: "Focus on precise geometric patterns for stable, consistent results.",
      requiredMastery: MasteryLevel.APPRENTICE,
      craftPointCost: 300,
      benefits: [
        {
          description: "+30% duration for all crystallized products",
          effect: { type: "uniqueProperty", property: "structured", description: "This product has a stable geometric structure that extends its duration." }
        },
        {
          description: "Products gain enhanced potency during Winter",
          effect: { type: "seasonalBonus", season: "Winter", value: 35 }
        }
      ],
      unlocksTechniques: ["lattice_formation", "symmetry_control", "structural_perfection"],
      upgradesTo: "sacred_geometry"
    },
    {
      id: "fluid_crystallization",
      name: "Fluid Crystallization",
      description: "Create organic, flowing crystal structures with unique properties.",
      requiredMastery: MasteryLevel.APPRENTICE,
      craftPointCost: 300,
      benefits: [
        {
          description: "25% chance for random beneficial effects in crystallized products",
          effect: { type: "criticalSuccess", chance: 0.25, multiplier: 1.4 }
        },
        {
          description: "Products gain the 'Adaptive' property",
          effect: { type: "uniqueProperty", property: "adaptive", description: "This product's crystalline structure adapts to the user's needs, providing personalized benefits." }
        }
      ],
      unlocksTechniques: ["flowing_structure", "crystal_mutation", "adaptive_resonance"],
      upgradesTo: "living_crystal"
    },
    {
      id: "light_crystallization",
      name: "Light Crystallization",
      description: "Specialize in creating crystals that interact with and manipulate light energy.",
      requiredMastery: MasteryLevel.ADEPT,
      craftPointCost: 500,
      benefits: [
        {
          description: "Products gain the 'Luminous' property",
          effect: { type: "uniqueProperty", property: "luminous", description: "This product captures and emits light energy, providing illuminating and clarifying effects." }
        },
        {
          description: "+40% quality for brightening and clarifying products",
          effect: { type: "qualityBonus", value: 40 }
        }
      ],
      unlocksTechniques: ["light_capture", "radiance_infusion", "crystal_clarity"],
      upgradesTo: "prismatic_mastery"
    }
  ],
  
  // TRANSMUTATION SPECIALIZATION PATHS
  [EnhancedSpecialization.TRANSMUTATION]: [
    {
      id: "elemental_transmutation",
      name: "Elemental Transmutation",
      description: "Master the transformation of elemental properties within ingredients.",
      requiredMastery: MasteryLevel.APPRENTICE,
      craftPointCost: 300,
      benefits: [
        {
          description: "Can transmute ingredients to have elemental properties",
          effect: { type: "uniqueProperty", property: "elemental", description: "This product contains transmuted elements that provide enhanced effects based on its elemental affinity." }
        },
        {
          description: "20% chance for critical success during transmutation",
          effect: { type: "criticalSuccess", chance: 0.2, multiplier: 1.5 }
        }
      ],
      unlocksTechniques: ["element_shifting", "affinity_control", "elemental_catalyst"],
      upgradesTo: "primal_elements"
    },
    {
      id: "alchemical_transmutation",
      name: "Alchemical Transmutation",
      description: "Focus on upgrading the quality and properties of ingredients.",
      requiredMastery: MasteryLevel.APPRENTICE,
      craftPointCost: 300,
      benefits: [
        {
          description: "30% chance to increase ingredient rarity during crafting",
          effect: { type: "uniqueProperty", property: "enhanced", description: "This product contains ingredients that have been alchemically enhanced to a higher quality." }
        },
        {
          description: "+30% quality for all transmuted products",
          effect: { type: "qualityBonus", value: 30 }
        }
      ],
      unlocksTechniques: ["quality_transformation", "property_enhancement", "alchemical_catalyst"],
      upgradesTo: "philosophical_stone"
    },
    {
      id: "essence_transmutation",
      name: "Essence Transmutation",
      description: "Transform the fundamental properties of magical essences.",
      requiredMastery: MasteryLevel.ADEPT,
      craftPointCost: 500,
      benefits: [
        {
          description: "+35% potency when changing essence properties",
          effect: { type: "qualityBonus", value: 35 }
        },
        {
          description: "Products gain the 'Transmuted Essence' property",
          effect: { type: "uniqueProperty", property: "transmuted_essence", description: "This product contains essences that have been fundamentally transformed, granting unique and powerful effects." }
        }
      ],
      unlocksTechniques: ["essence_shift", "property_fusion", "fundamental_change"],
      upgradesTo: "essence_alchemy"
    }
  ],
  
  // Advanced specializations (simplified for brevity)
  [EnhancedSpecialization.CELESTIAL_ESSENCE]: [],
  [EnhancedSpecialization.TEMPORAL_FERMENTATION]: [],
  [EnhancedSpecialization.ELEMENTAL_DISTILLATION]: [],
  [EnhancedSpecialization.SOUL_INFUSION]: [],
  [EnhancedSpecialization.PRISMATIC_CRYSTALLIZATION]: [],
  [EnhancedSpecialization.REALITY_TRANSMUTATION]: []
};

// Define techniques for each specialization
export const TECHNIQUES: Technique[] = [
  // ESSENCE TECHNIQUES
  {
    id: "essence_refinement",
    name: "Essence Refinement",
    description: "Carefully refine extracted essences to improve their purity and potency.",
    requiredMastery: MasteryLevel.APPRENTICE,
    requiredPath: "essence_purification",
    craftPointCost: 150,
    maxLevel: 3,
    effects: [
      { type: "qualityBonus", value: 15 },
      { type: "categoryBonus", category: "essence", value: 10 }
    ],
    isPassive: true
  },
  {
    id: "purity_catalyst",
    name: "Purity Catalyst",
    description: "Add a catalyst during the extraction process to enhance purity.",
    requiredMastery: MasteryLevel.ADEPT,
    requiredPath: "essence_purification",
    craftPointCost: 250,
    maxLevel: 3,
    effects: [
      { type: "activeTechnique", effect: "quality", value: 50, duration: 300 }
    ],
    cooldown: 1440, // Once per day
    isPassive: false
  },
  {
    id: "essence_division",
    name: "Essence Division",
    description: "Split essence during extraction to create multiple usable portions.",
    requiredMastery: MasteryLevel.APPRENTICE,
    requiredPath: "essence_amplification",
    craftPointCost: 150,
    maxLevel: 3,
    effects: [
      { type: "yieldBonus", value: 20 }
    ],
    isPassive: true
  },
  
  // FERMENTATION TECHNIQUES
  {
    id: "wild_culture",
    name: "Wild Culture Cultivation",
    description: "Cultivate wild fermentation cultures for unpredictable but powerful results.",
    requiredMastery: MasteryLevel.APPRENTICE,
    requiredPath: "wild_fermentation",
    craftPointCost: 150,
    maxLevel: 3,
    effects: [
      { type: "criticalSuccess", chance: 0.15, multiplier: 1.4 },
      { type: "discoveryCatalyst", chance: 0.05 }
    ],
    isPassive: true
  },
  {
    id: "measured_timing",
    name: "Measured Timing",
    description: "Precisely time the fermentation process for consistent results.",
    requiredMastery: MasteryLevel.APPRENTICE,
    requiredPath: "precise_fermentation",
    craftPointCost: 150,
    maxLevel: 3,
    effects: [
      { type: "qualityBonus", value: 15 },
      { type: "craftingSpeedBonus", value: 10 }
    ],
    isPassive: true
  },
  
  // DISTILLATION TECHNIQUES
  {
    id: "precise_separation",
    name: "Precise Separation",
    description: "Precisely control temperatures to separate compounds perfectly.",
    requiredMastery: MasteryLevel.APPRENTICE,
    requiredPath: "fractional_distillation",
    craftPointCost: 150,
    maxLevel: 3,
    effects: [
      { type: "qualityBonus", value: 20 }
    ],
    isPassive: true
  },
  {
    id: "heat_acceleration",
    name: "Heat Acceleration",
    description: "Use carefully controlled high heat to speed up the distillation process.",
    requiredMastery: MasteryLevel.APPRENTICE,
    requiredPath: "rapid_distillation",
    craftPointCost: 150,
    maxLevel: 3,
    effects: [
      { type: "craftingSpeedBonus", value: 25 }
    ],
    isPassive: true
  },
  
  // INFUSION TECHNIQUES
  {
    id: "lunar_timing",
    name: "Lunar Timing",
    description: "Time infusions according to moon phases for enhanced results.",
    requiredMastery: MasteryLevel.APPRENTICE,
    requiredPath: "celestial_infusion",
    craftPointCost: 150,
    maxLevel: 3,
    effects: [
      { type: "lunarBonus", phase: "Full Moon", value: 25 },
      { type: "lunarBonus", phase: "New Moon", value: 25 }
    ],
    isPassive: true
  },
  {
    id: "ingredient_synergy",
    name: "Ingredient Synergy",
    description: "Identify and enhance synergistic properties between ingredients.",
    requiredMastery: MasteryLevel.APPRENTICE,
    requiredPath: "harmonic_infusion",
    craftPointCost: 150,
    maxLevel: 3,
    effects: [
      { type: "qualityBonus", value: 15 },
      { type: "ingredientPreservation", chance: 0.10 }
    ],
    isPassive: true
  },
  
  // CRYSTALLIZATION TECHNIQUES
  {
    id: "lattice_formation",
    name: "Lattice Formation",
    description: "Control crystal lattice formation for structured, high-quality results.",
    requiredMastery: MasteryLevel.APPRENTICE,
    requiredPath: "geometric_crystallization",
    craftPointCost: 150,
    maxLevel: 3,
    effects: [
      { type: "qualityBonus", value: 15 },
      { type: "seasonalBonus", season: "Winter", value: 10 }
    ],
    isPassive: true
  },
  {
    id: "flowing_structure",
    name: "Flowing Structure",
    description: "Create adaptive crystalline structures with flowing patterns.",
    requiredMastery: MasteryLevel.APPRENTICE,
    requiredPath: "fluid_crystallization",
    craftPointCost: 150,
    maxLevel: 3,
    effects: [
      { type: "criticalSuccess", chance: 0.15, multiplier: 1.3 }
    ],
    isPassive: true
  },
  
  // TRANSMUTATION TECHNIQUES
  {
    id: "element_shifting",
    name: "Element Shifting",
    description: "Transform the elemental properties of ingredients during crafting.",
    requiredMastery: MasteryLevel.APPRENTICE,
    requiredPath: "elemental_transmutation",
    craftPointCost: 150,
    maxLevel: 3,
    effects: [
      { type: "qualityBonus", value: 15 },
      { type: "discoveryCatalyst", chance: 0.05 }
    ],
    isPassive: true
  },
  {
    id: "quality_transformation",
    name: "Quality Transformation",
    description: "Transmute ingredients to enhance their inherent quality.",
    requiredMastery: MasteryLevel.APPRENTICE,
    requiredPath: "alchemical_transmutation",
    craftPointCost: 150,
    maxLevel: 3,
    effects: [
      { type: "qualityBonus", value: 20 }
    ],
    isPassive: true
  }
];

// Calculate mastery experience needed for next level
export function getExperienceForNextLevel(currentMastery: MasteryLevel): number {
  const nextLevel = (currentMastery as number) + 1 as MasteryLevel;
  if (!MASTERY_LEVEL_EXPERIENCE[nextLevel]) {
    return 0; // Already at max level
  }
  return MASTERY_LEVEL_EXPERIENCE[nextLevel] - MASTERY_LEVEL_EXPERIENCE[currentMastery];
}

// Get mastery benefits for a specific level
export function getMasteryBenefits(masteryLevel: MasteryLevel): MasteryBenefits {
  return MASTERY_BENEFITS[masteryLevel] || MASTERY_BENEFITS[MasteryLevel.NOVICE];
}

// Get all paths available to a player based on their specialization and mastery
export function getAvailablePaths(
  specialization: EnhancedSpecialization,
  masteryLevel: MasteryLevel
): SpecializationPath[] {
  const allPaths = SPECIALIZATION_PATHS[specialization] || [];
  return allPaths.filter(path => path.requiredMastery <= masteryLevel);
}

// Get all techniques available to a player
export function getAvailableTechniques(
  specialization: EnhancedSpecialization,
  masteryLevel: MasteryLevel,
  selectedPaths: string[]
): Technique[] {
  return TECHNIQUES.filter(technique => {
    // Check mastery requirement
    if (technique.requiredMastery > masteryLevel) return false;
    
    // Check if technique belongs to one of the selected paths
    if (technique.requiredPath && !selectedPaths.includes(technique.requiredPath)) {
      return false;
    }
    
    // Add additional logic for specialization-specific techniques
    const specPathIds = SPECIALIZATION_PATHS[specialization]
      .map(path => path.id);
    
    // If technique requires a path, check if it's from this specialization
    if (technique.requiredPath && !specPathIds.includes(technique.requiredPath)) {
      return false;
    }
    
    return true;
  });
}

// Calculate crafting bonus based on specialization, paths, and techniques
export function calculateCraftingBonuses(
  specialization: EnhancedSpecialization,
  masteryLevel: MasteryLevel,
  selectedPaths: string[],
  equippedTechniques: { id: string, level: number }[],
  currentSeason: Season,
  currentMoonPhase: MoonPhase,
  targetTownId?: string,
  productCategory?: ItemCategory
): {
  qualityBonus: number;
  yieldBonus: number;
  craftingSpeedBonus: number;
  ingredientPreservationChance: number;
  criticalSuccessChance: number;
  criticalSuccessMultiplier: number;
  discoveryChance: number;
  townAffinity: number;
  uniqueProperties: string[];
  descriptions: string[];
} {
  // Initialize result with mastery benefits
  const masteryBenefits = getMasteryBenefits(masteryLevel);
  
  const result = {
    qualityBonus: masteryBenefits.qualityBonus,
    yieldBonus: masteryBenefits.yieldBonus,
    craftingSpeedBonus: masteryBenefits.craftingSpeedBonus,
    ingredientPreservationChance: masteryBenefits.ingredientEfficiency,
    criticalSuccessChance: 0.05, // Base chance
    criticalSuccessMultiplier: 1.2, // Base multiplier
    discoveryChance: masteryBenefits.discoveryChance,
    townAffinity: 0,
    uniqueProperties: [] as string[],
    descriptions: [`Level ${masteryLevel} ${specialization} Master`] as string[]
  };
  
  // Add base specialization bonuses
  switch (specialization) {
    case EnhancedSpecialization.ESSENCE:
      result.qualityBonus += 10;
      result.descriptions.push("Essence Specialization: +10% Quality");
      break;
    case EnhancedSpecialization.FERMENTATION:
      result.yieldBonus += 15;
      result.descriptions.push("Fermentation Specialization: +15% Yield");
      break;
    case EnhancedSpecialization.DISTILLATION:
      result.craftingSpeedBonus += 15;
      result.descriptions.push("Distillation Specialization: +15% Crafting Speed");
      break;
    case EnhancedSpecialization.INFUSION:
      result.qualityBonus += 5;
      result.ingredientPreservationChance += 0.1;
      result.descriptions.push("Infusion Specialization: +5% Quality, +10% Ingredient Preservation");
      break;
    case EnhancedSpecialization.CRYSTALLIZATION:
      result.criticalSuccessChance += 0.05;
      result.criticalSuccessMultiplier += 0.1;
      result.descriptions.push("Crystallization Specialization: +5% Critical Chance, +10% Critical Multiplier");
      break;
    case EnhancedSpecialization.TRANSMUTATION:
      result.discoveryChance += 0.1;
      result.descriptions.push("Transmutation Specialization: +10% Discovery Chance");
      break;
  }
  
  // Add path bonuses
  for (const pathId of selectedPaths) {
    const path = SPECIALIZATION_PATHS[specialization]
      .find(p => p.id === pathId);
    
    if (!path) continue;
    
    // Add path name to descriptions
    result.descriptions.push(`${path.name} Path Active`);
    
    // Process path benefits
    for (const benefit of path.benefits) {
      const effect = benefit.effect;
      
      switch (effect.type) {
        case "qualityBonus":
          result.qualityBonus += effect.value;
          break;
        case "categoryBonus":
          if (productCategory === effect.category) {
            result.qualityBonus += effect.value;
            result.descriptions.push(`${effect.category} Focus: +${effect.value}% Quality`);
          }
          break;
        case "seasonalBonus":
          if (currentSeason === effect.season) {
            result.qualityBonus += effect.value;
            result.descriptions.push(`${effect.season} Affinity: +${effect.value}% Quality`);
          }
          break;
        case "lunarBonus":
          if (currentMoonPhase === effect.phase) {
            result.qualityBonus += effect.value;
            result.descriptions.push(`${effect.phase} Attunement: +${effect.value}% Quality`);
          }
          break;
        case "ingredientPreservation":
          result.ingredientPreservationChance += effect.chance;
          break;
        case "criticalSuccess":
          result.criticalSuccessChance += effect.chance;
          result.criticalSuccessMultiplier += effect.multiplier - 1; // Add the bonus part
          break;
        case "discoveryCatalyst":
          result.discoveryChance += effect.chance;
          break;
        case "townAffinity":
          if (targetTownId === effect.townId) {
            result.townAffinity += effect.value;
            result.descriptions.push(`${effect.townId} Affinity: +${effect.value}% Effectiveness`);
          }
          break;
        case "uniqueProperty":
          result.uniqueProperties.push(effect.property);
          result.descriptions.push(`Adds '${effect.property}' Property: ${effect.description}`);
          break;
      }
    }
  }
  
  // Add technique bonuses
  for (const equipped of equippedTechniques) {
    const technique = TECHNIQUES.find(t => t.id === equipped.id);
    if (!technique || !technique.isPassive) continue;
    
    // Add technique name to descriptions
    result.descriptions.push(`${technique.name} (Lv.${equipped.level}) Active`);
    
    // Calculate level multiplier (higher levels = more effective)
    const levelMultiplier = 0.7 + (equipped.level * 0.3); // Level 1 = 1.0x, Level 3 = 1.6x
    
    // Process technique effects
    for (const effect of technique.effects) {
      switch (effect.type) {
        case "qualityBonus":
          result.qualityBonus += effect.value * levelMultiplier;
          break;
        case "categoryBonus":
          if (productCategory === effect.category) {
            result.qualityBonus += effect.value * levelMultiplier;
          }
          break;
        case "seasonalBonus":
          if (currentSeason === effect.season) {
            result.qualityBonus += effect.value * levelMultiplier;
          }
          break;
        case "lunarBonus":
          if (currentMoonPhase === effect.phase) {
            result.qualityBonus += effect.value * levelMultiplier;
          }
          break;
        case "ingredientPreservation":
          result.ingredientPreservationChance += effect.chance * levelMultiplier;
          break;
        case "criticalSuccess":
          result.criticalSuccessChance += effect.chance * levelMultiplier;
          result.criticalSuccessMultiplier += (effect.multiplier - 1) * levelMultiplier;
          break;
        case "discoveryCatalyst":
          result.discoveryChance += effect.chance * levelMultiplier;
          break;
        case "townAffinity":
          if (targetTownId === effect.townId) {
            result.townAffinity += effect.value * levelMultiplier;
          }
          break;
      }
    }
  }
  
  // Round numerical values for cleaner UI
  result.qualityBonus = Math.round(result.qualityBonus);
  result.yieldBonus = Math.round(result.yieldBonus);
  result.craftingSpeedBonus = Math.round(result.craftingSpeedBonus);
  result.ingredientPreservationChance = Math.round(result.ingredientPreservationChance * 100) / 100;
  result.criticalSuccessChance = Math.min(0.75, Math.round(result.criticalSuccessChance * 100) / 100); // Cap at 75%
  result.criticalSuccessMultiplier = Math.round(result.criticalSuccessMultiplier * 100) / 100;
  result.discoveryChance = Math.min(0.5, Math.round(result.discoveryChance * 100) / 100); // Cap at 50%
  result.townAffinity = Math.round(result.townAffinity);
  
  return result;
}

// Apply technique during crafting (for active techniques)
export function applyActiveTechnique(
  techniqueId: string,
  techniqueLevel: number,
  _playerId: string // Unused parameter
): {
  success: boolean;
  activeDuration: number;
  effect: string;
  value: number;
  cooldownTime: number;
} {
  const technique = TECHNIQUES.find(t => t.id === techniqueId);
  if (!technique || technique.isPassive) {
    return { 
      success: false, 
      activeDuration: 0, 
      effect: "", 
      value: 0, 
      cooldownTime: 0 
    };
  }
  
  // Find active effect (first one for simplicity)
  const activeEffect = technique.effects.find(e => e.type === "activeTechnique");
  if (!activeEffect || activeEffect.type !== "activeTechnique") {
    return { 
      success: false, 
      activeDuration: 0, 
      effect: "", 
      value: 0, 
      cooldownTime: 0 
    };
  }
  
  // Calculate level multiplier (higher levels = more effective)
  const levelMultiplier = 0.7 + (techniqueLevel * 0.3); // Level 1 = 1.0x, Level 3 = 1.6x
  
  // Apply the active technique
  return {
    success: true,
    activeDuration: activeEffect.duration,
    effect: activeEffect.effect,
    value: activeEffect.value * levelMultiplier,
    cooldownTime: technique.cooldown || 0
  };
}

// Initialize a new player's specialization status
export function initializeSpecialization(specialization: EnhancedSpecialization): SpecializationStatus {
  return {
    primary: specialization,
    masteryLevel: MasteryLevel.NOVICE,
    masteryExperience: 0,
    experienceToNextLevel: getExperienceForNextLevel(MasteryLevel.NOVICE),
    selectedPaths: [],
    equippedTechniques: [],
    maxTechniqueSlots: MASTERY_BENEFITS[MasteryLevel.NOVICE].unlockSlots,
    availableTechniqueSlots: MASTERY_BENEFITS[MasteryLevel.NOVICE].unlockSlots
  };
}

// Add mastery experience after successful crafting
export function addMasteryExperience(
  status: SpecializationStatus,
  experienceAmount: number,
  productQuality: number
): SpecializationStatus {
  // Quality affects experience gain
  const qualityMultiplier = 0.5 + (productQuality / 100) * 1.0; // 0.5x to 1.5x
  
  // Calculate actual experience gain
  const actualExperience = Math.round(experienceAmount * qualityMultiplier);
  
  // Update experience
  const newExp = status.masteryExperience + actualExperience;
  const newStatus = { ...status, masteryExperience: newExp };
  
  // Check for level up
  const expForNextLevel = getExperienceForNextLevel(status.masteryLevel);
  if (expForNextLevel > 0 && newExp >= expForNextLevel) {
    // Level up!
    const newLevel = (status.masteryLevel as number) + 1 as MasteryLevel;
    newStatus.masteryLevel = newLevel;
    newStatus.masteryExperience = newExp - expForNextLevel;
    newStatus.experienceToNextLevel = getExperienceForNextLevel(newLevel);
    
    // Update technique slots
    const newBenefits = getMasteryBenefits(newLevel);
    newStatus.maxTechniqueSlots = newBenefits.unlockSlots;
    newStatus.availableTechniqueSlots = newBenefits.unlockSlots - status.equippedTechniques.length;
  } else {
    // No level up, just update experience to next level
    newStatus.experienceToNextLevel = expForNextLevel - newExp;
  }
  
  return newStatus;
}

// Unlock a specialization path (costs craft points)
export function unlockSpecializationPath(
  status: SpecializationStatus,
  pathId: string,
  craftPointsAvailable: number
): { success: boolean; newStatus: SpecializationStatus; craftPointsSpent: number; message: string } {
  // Find the path to unlock
  const path = SPECIALIZATION_PATHS[status.primary]
    .find(p => p.id === pathId);
  
  if (!path) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: "Path not found" 
    };
  }
  
  // Check if path is already unlocked
  if (status.selectedPaths.includes(pathId)) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: "Path already unlocked" 
    };
  }
  
  // Check mastery level requirement
  if (status.masteryLevel < path.requiredMastery) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: `Requires ${MasteryLevel[path.requiredMastery]} mastery` 
    };
  }
  
  // Check if player has enough craft points
  if (craftPointsAvailable < path.craftPointCost) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: `Not enough craft points (need ${path.craftPointCost})` 
    };
  }
  
  // Unlock the path
  const newStatus = {
    ...status,
    selectedPaths: [...status.selectedPaths, pathId]
  };
  
  return { 
    success: true, 
    newStatus, 
    craftPointsSpent: path.craftPointCost, 
    message: `Successfully unlocked ${path.name}!` 
  };
}

// Unlock and equip a technique (costs craft points)
export function unlockAndEquipTechnique(
  status: SpecializationStatus,
  techniqueId: string,
  craftPointsAvailable: number
): { success: boolean; newStatus: SpecializationStatus; craftPointsSpent: number; message: string } {
  // Find the technique to unlock
  const technique = TECHNIQUES.find(t => t.id === techniqueId);
  
  if (!technique) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: "Technique not found" 
    };
  }
  
  // Check if technique is already equipped
  if (status.equippedTechniques.some(t => t.id === techniqueId)) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: "Technique already equipped" 
    };
  }
  
  // Check mastery level requirement
  if (status.masteryLevel < technique.requiredMastery) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: `Requires ${MasteryLevel[technique.requiredMastery]} mastery` 
    };
  }
  
  // Check path requirement
  if (technique.requiredPath && !status.selectedPaths.includes(technique.requiredPath)) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: `Requires ${technique.requiredPath} path` 
    };
  }
  
  // Check if player has enough craft points
  if (craftPointsAvailable < technique.craftPointCost) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: `Not enough craft points (need ${technique.craftPointCost})` 
    };
  }
  
  // Check if player has available technique slots
  if (status.availableTechniqueSlots <= 0) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: "No available technique slots" 
    };
  }
  
  // Unlock and equip the technique
  const newStatus = {
    ...status,
    equippedTechniques: [...status.equippedTechniques, { id: techniqueId, level: 1 }],
    availableTechniqueSlots: status.availableTechniqueSlots - 1
  };
  
  return { 
    success: true, 
    newStatus, 
    craftPointsSpent: technique.craftPointCost, 
    message: `Successfully unlocked and equipped ${technique.name}!` 
  };
}

// Upgrade an equipped technique to a higher level
export function upgradeTechnique(
  status: SpecializationStatus,
  techniqueId: string,
  craftPointsAvailable: number
): { success: boolean; newStatus: SpecializationStatus; craftPointsSpent: number; message: string } {
  // Find the equipped technique
  const equippedIndex = status.equippedTechniques.findIndex(t => t.id === techniqueId);
  
  if (equippedIndex === -1) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: "Technique not equipped" 
    };
  }
  
  const equippedTechnique = status.equippedTechniques[equippedIndex];
  const technique = TECHNIQUES.find(t => t.id === techniqueId);
  
  if (!technique) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: "Technique not found" 
    };
  }
  
  // Check if technique is already at max level
  if (equippedTechnique.level >= technique.maxLevel) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: "Technique already at max level" 
    };
  }
  
  // Calculate upgrade cost (increases with level)
  const upgradeMultiplier = 0.75 + (equippedTechnique.level * 0.25);
  const upgradeCost = Math.round(technique.craftPointCost * upgradeMultiplier);
  
  // Check if player has enough craft points
  if (craftPointsAvailable < upgradeCost) {
    return { 
      success: false, 
      newStatus: status, 
      craftPointsSpent: 0, 
      message: `Not enough craft points (need ${upgradeCost})` 
    };
  }
  
  // Upgrade the technique
  const newEquippedTechniques = [...status.equippedTechniques];
  newEquippedTechniques[equippedIndex] = {
    ...equippedTechnique,
    level: equippedTechnique.level + 1
  };
  
  const newStatus = {
    ...status,
    equippedTechniques: newEquippedTechniques
  };
  
  return { 
    success: true, 
    newStatus, 
    craftPointsSpent: upgradeCost, 
    message: `Successfully upgraded ${technique.name} to level ${equippedTechnique.level + 1}!` 
  };
}

// Apply specialization bonuses to crafted product
export function applySpecializationBonusesToProduct(
  product: CraftableProduct,
  specialization: EnhancedSpecialization,
  masteryLevel: MasteryLevel,
  selectedPaths: string[],
  equippedTechniques: { id: string, level: number }[],
  currentSeason: Season,
  currentMoonPhase: MoonPhase,
  targetTownId?: string
): CraftableProduct {
  // Calculate all applicable bonuses
  const bonuses = calculateCraftingBonuses(
    specialization,
    masteryLevel,
    selectedPaths,
    equippedTechniques,
    currentSeason,
    currentMoonPhase,
    targetTownId,
    product.category as ItemCategory
  );
  
  // Apply quality bonus
  const newQuality = Math.min(100, Math.round(product.quality * (1 + bonuses.qualityBonus / 100)));
  
  // Apply unique properties
  const newProperties = [...product.specialProperties];
  for (const property of bonuses.uniqueProperties) {
    if (!newProperties.includes(property)) {
      newProperties.push(property);
    }
  }
  
  // Apply town affinities
  const newAffinities = [...product.townAffinities];
  if (targetTownId && bonuses.townAffinity > 0 && !newAffinities.includes(targetTownId)) {
    newAffinities.push(targetTownId);
  }
  
  // Return enhanced product
  return {
    ...product,
    quality: newQuality,
    specialProperties: newProperties,
    townAffinities: newAffinities
  };
}

// Select a specialization
export function selectSpecialization(
  _playerId: string, // Unused parameter
  specialization: EnhancedSpecialization
): SpecializationStatus {
  return initializeSpecialization(specialization);
}