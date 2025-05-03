import {
  Plant,
  MoonPhase,
  ElementType,
  Season,
  SoilType
} from 'coven-shared';
import { DisplayPlant } from './frontendCompatibility';
import { calculateMutationChance } from './plantGrowthHelpers';
import { getElementalCompatibility } from './tarotCardHelpers';

/**
 * Interface representing a plant trait
 */
interface PlantTrait {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  type: 'visual' | 'growth' | 'yield' | 'potency' | 'essence' | 'resistance';
  effects: {
    growthModifier?: number;
    yieldModifier?: number;
    potencyModifier?: number;
    essenceModifier?: number;
    resistanceModifier?: number;
    otherModifiers?: Record<string, number>;
  };
  elementalAffinity?: ElementType;
  moonPhaseAffinity?: MoonPhase;
  seasonalAffinity?: Season;
  visualChange?: string;
  mutualExclusions?: string[]; // IDs of traits that cannot coexist with this trait
}

/**
 * Predefined plant traits that can be acquired through mutations
 */
export const PLANT_TRAITS: PlantTrait[] = [
  // Visual traits
  {
    id: 'luminescent',
    name: 'Luminescent',
    description: 'The plant softly glows in the dark, illuminating the garden with magical light.',
    rarity: 'uncommon',
    type: 'visual',
    effects: {
      essenceModifier: 1.2
    },
    elementalAffinity: 'Spirit',
    moonPhaseAffinity: 'Full Moon',
    visualChange: 'glow-effect'
  },
  {
    id: 'crystalline',
    name: 'Crystalline',
    description: 'Parts of the plant have transformed into crystal-like structures that refract light beautifully.',
    rarity: 'rare',
    type: 'visual',
    effects: {
      potencyModifier: 1.3,
      growthModifier: 0.8
    },
    elementalAffinity: 'Earth',
    moonPhaseAffinity: 'Waxing Gibbous',
    visualChange: 'crystal-effect'
  },
  {
    id: 'prismatic',
    name: 'Prismatic',
    description: 'The plant displays a vivid rainbow of colors that shift and change throughout the day.',
    rarity: 'rare',
    type: 'visual',
    effects: {
      essenceModifier: 1.4
    },
    elementalAffinity: 'Air',
    moonPhaseAffinity: 'Full Moon',
    visualChange: 'rainbow-effect'
  },
  
  // Growth traits
  {
    id: 'rapid_growth',
    name: 'Rapid Growth',
    description: 'The plant grows at an accelerated rate, reaching maturity much faster.',
    rarity: 'common',
    type: 'growth',
    effects: {
      growthModifier: 1.5,
      yieldModifier: 0.9
    },
    seasonalAffinity: 'Spring',
    mutualExclusions: ['slow_aging']
  },
  {
    id: 'slow_aging',
    name: 'Slow Aging',
    description: 'The plant ages very slowly, extending its mature phase significantly.',
    rarity: 'uncommon',
    type: 'growth',
    effects: {
      growthModifier: 0.7,
      yieldModifier: 1.2
    },
    moonPhaseAffinity: 'Waning Gibbous',
    mutualExclusions: ['rapid_growth']
  },
  {
    id: 'deep_roots',
    name: 'Deep Roots',
    description: 'The plant develops an extensive root system, improving nutrient absorption and stability.',
    rarity: 'common',
    type: 'growth',
    effects: {
      growthModifier: 1.2,
      resistanceModifier: 1.3
    },
    elementalAffinity: 'Earth'
  },
  
  // Yield traits
  {
    id: 'abundant_yield',
    name: 'Abundant Yield',
    description: 'The plant produces a significantly higher quantity of harvestable material.',
    rarity: 'uncommon',
    type: 'yield',
    effects: {
      yieldModifier: 1.5,
      potencyModifier: 0.9
    },
    seasonalAffinity: 'Summer',
    mutualExclusions: ['concentrated_essence']
  },
  {
    id: 'twin_fruit',
    name: 'Twin Fruit',
    description: 'The plant produces paired fruits or flowers, doubling its yield.',
    rarity: 'rare',
    type: 'yield',
    effects: {
      yieldModifier: 2.0,
      growthModifier: 0.8
    },
    moonPhaseAffinity: 'Waxing Crescent'
  },
  
  // Potency traits
  {
    id: 'concentrated_essence',
    name: 'Concentrated Essence',
    description: 'The plant\'s magical properties are highly concentrated, increasing potency.',
    rarity: 'uncommon',
    type: 'potency',
    effects: {
      potencyModifier: 1.4,
      yieldModifier: 0.8
    },
    elementalAffinity: 'Fire',
    mutualExclusions: ['abundant_yield']
  },
  {
    id: 'elemental_infusion',
    name: 'Elemental Infusion',
    description: 'The plant has absorbed pure elemental energy, greatly enhancing its magical properties.',
    rarity: 'rare',
    type: 'potency',
    effects: {
      potencyModifier: 1.6,
      essenceModifier: 1.3
    },
    elementalAffinity: 'Spirit'
  },
  
  // Essence traits
  {
    id: 'mana_conductor',
    name: 'Mana Conductor',
    description: 'The plant efficiently channels magical energy, making it valuable for magical crafting.',
    rarity: 'uncommon',
    type: 'essence',
    effects: {
      essenceModifier: 1.5
    },
    moonPhaseAffinity: 'Full Moon'
  },
  {
    id: 'lunar_resonance',
    name: 'Lunar Resonance',
    description: 'The plant has a strong connection to lunar cycles, changing properties with the phases of the moon.',
    rarity: 'rare',
    type: 'essence',
    effects: {
      essenceModifier: 1.3,
      otherModifiers: {
        'moonSensitivity': 2.0
      }
    },
    moonPhaseAffinity: 'New Moon'
  },
  
  // Resistance traits
  {
    id: 'drought_resistant',
    name: 'Drought Resistant',
    description: 'The plant can thrive with minimal water, making it resilient in dry conditions.',
    rarity: 'common',
    type: 'resistance',
    effects: {
      resistanceModifier: 1.3,
      otherModifiers: {
        'droughtResistance': 2.0
      }
    },
    elementalAffinity: 'Earth',
    seasonalAffinity: 'Summer'
  },
  {
    id: 'frost_resistant',
    name: 'Frost Resistant',
    description: 'The plant can withstand cold temperatures, allowing it to grow in winter.',
    rarity: 'common',
    type: 'resistance',
    effects: {
      resistanceModifier: 1.3,
      otherModifiers: {
        'coldResistance': 2.0
      }
    },
    elementalAffinity: 'Water',
    seasonalAffinity: 'Winter'
  },
  {
    id: 'adaptive',
    name: 'Adaptive',
    description: 'The plant can quickly adapt to changing conditions, making it versatile.',
    rarity: 'uncommon',
    type: 'resistance',
    effects: {
      resistanceModifier: 1.5,
      otherModifiers: {
        'adaptability': 1.5
      }
    },
    elementalAffinity: 'Air'
  },
  
  // Legendary traits
  {
    id: 'cosmic_connection',
    name: 'Cosmic Connection',
    description: 'The plant has a mysterious connection to celestial forces beyond understanding.',
    rarity: 'legendary',
    type: 'essence',
    effects: {
      essenceModifier: 2.0,
      potencyModifier: 1.5,
      growthModifier: 1.2
    },
    moonPhaseAffinity: 'Full Moon',
    visualChange: 'cosmic-effect'
  },
  {
    id: 'eternal_bloom',
    name: 'Eternal Bloom',
    description: 'The plant remains in perfect bloom indefinitely, never wilting or dying.',
    rarity: 'legendary',
    type: 'growth',
    effects: {
      yieldModifier: 1.5,
      potencyModifier: 1.5,
      otherModifiers: {
        'longevity': 10.0
      }
    },
    elementalAffinity: 'Spirit',
    visualChange: 'eternal-bloom-effect'
  }
];

/**
 * Generate a random mutation for a plant based on current conditions
 * @param plant Plant to mutate
 * @param moonPhase Current moon phase
 * @param season Current season
 * @param elementalInfluence Elemental influence in the garden
 * @param soilType Type of soil the plant is in
 * @returns Mutation trait ID or null if no mutation occurred
 */
export function generateRandomMutation(
  plant: Plant,
  moonPhase: MoonPhase,
  season: Season,
  elementalInfluence: ElementType,
  soilType: SoilType
): PlantTrait | null {
  // Filter out already acquired mutations
  const existingMutations = plant.mutations || [];
  const availableTraits = PLANT_TRAITS.filter(trait => 
    !existingMutations.includes(trait.id) && 
    !trait.mutualExclusions?.some(exclusion => existingMutations.includes(exclusion))
  );
  
  if (availableTraits.length === 0) return null;
  
  // Weight traits based on conditions
  const weightedTraits = availableTraits.map(trait => {
    let weight = 1.0;
    
    // Rarity weights
    const rarityWeights = {
      'common': 5.0,
      'uncommon': 3.0,
      'rare': 1.5,
      'legendary': 0.5
    };
    weight *= rarityWeights[trait.rarity];
    
    // Moon phase affinity
    if (trait.moonPhaseAffinity === moonPhase) {
      weight *= 3.0;
    } else if (
      (trait.moonPhaseAffinity === 'Full Moon' && moonPhase.includes('Gibbous')) ||
      (trait.moonPhaseAffinity === 'New Moon' && moonPhase.includes('Crescent'))
    ) {
      weight *= 1.5;
    }
    
    // Seasonal affinity
    if (trait.seasonalAffinity === season) {
      weight *= 2.5;
    } else if (
      (trait.seasonalAffinity === 'Spring' && season === 'Summer') ||
      (trait.seasonalAffinity === 'Summer' && season === 'Fall') ||
      (trait.seasonalAffinity === 'Fall' && season === 'Winter') ||
      (trait.seasonalAffinity === 'Winter' && season === 'Spring')
    ) {
      weight *= 1.3;
    }
    
    // Elemental affinity
    if (trait.elementalAffinity === elementalInfluence) {
      weight *= 2.0;
    } else if (trait.elementalAffinity) {
      const compatibility = getElementalCompatibility(trait.elementalAffinity, elementalInfluence);
      weight *= (compatibility.score > 0) ? 1.5 : 0.7;
    }
    
    // Soil type preferences for certain traits
    if (trait.id === 'deep_roots' && (soilType === 'loamy' || soilType === 'clay')) {
      weight *= 1.5;
    } else if (trait.id === 'drought_resistant' && soilType === 'sandy') {
      weight *= 2.0;
    } else if (trait.id === 'frost_resistant' && soilType === 'peaty') {
      weight *= 1.5;
    }
    
    return { trait, weight };
  });
  
  // If plant already has mutations, slightly favor same types of mutations
  if (existingMutations.length > 0) {
    const existingTraitTypes = new Set(
      existingMutations
        .map(id => PLANT_TRAITS.find(trait => trait.id === id)?.type)
        .filter(Boolean)
    );
    
    weightedTraits.forEach(weighted => {
      if (existingTraitTypes.has(weighted.trait.type)) {
        weighted.weight *= 1.3;
      }
    });
  }
  
  // Normalize weights into probabilities
  const totalWeight = weightedTraits.reduce((sum, { weight }) => sum + weight, 0);
  let remainingProbability = 1.0;
  
  const weightedProbabilities = weightedTraits.map(({ trait, weight }) => {
    const probability = weight / totalWeight;
    return { trait, probability };
  });
  
  // Randomly select a trait based on weighted probabilities
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const { trait, probability } of weightedProbabilities) {
    cumulativeProbability += probability;
    if (random <= cumulativeProbability) {
      return trait;
    }
  }
  
  // Fallback in case of rounding errors
  return weightedProbabilities[weightedProbabilities.length - 1].trait;
}

/**
 * Apply a mutation to a plant
 * @param plant Plant to mutate
 * @param mutation Mutation to apply
 * @returns Updated plant with the mutation
 */
export function applyMutation(plant: Plant, mutation: PlantTrait): Plant {
  if (!plant || !mutation) return plant;
  
  // Add mutation to the list
  const mutations = [...(plant.mutations || []), mutation.id];
  
  // Apply growth stage effects if needed
  let growthStage = plant.growthStage;
  if (mutation.type === 'growth' && mutation.effects.growthModifier && mutation.effects.growthModifier > 1.2) {
    // Accelerate growth for rapid growth mutations
    if (growthStage === 'seed') growthStage = 'sprout';
    else if (growthStage === 'sprout') growthStage = 'growing';
  }
  
  // Apply visual changes if applicable through specialTraits
  const specialTraits = [...(plant.specialTraits || [])];
  if (mutation.visualChange) {
    specialTraits.push(mutation.visualChange);
  }
  
  // Return the updated plant
  return {
    ...plant,
    mutations,
    growthStage,
    specialTraits
  };
}

/**
 * Attempt to create a mutation on a plant based on conditions
 * @param plant Plant to potentially mutate
 * @param gardenSlot Garden slot the plant is in
 * @param moonPhase Current moon phase
 * @param season Current season
 * @returns Updated plant (with mutation if one occurred) or null if no mutation
 */
export function attemptPlantMutation(
  plant: Plant,
  moonPhase: MoonPhase,
  season: Season,
  elementalInfluence: ElementType,
  soilType: SoilType,
  gardenSlotMana: number = 0
): { mutated: boolean; plant: Plant; mutation?: PlantTrait } {
  if (!plant) return { mutated: false, plant };
  
  // Calculate base mutation chance
  // Create a proper garden slot with all required fields
  const mockGardenSlot = { 
    id: 0, 
    plant: null, 
    fertility: 0, 
    moisture: 0, 
    soilType, 
    elementalInfluence, 
    manaCapacity: 100, 
    currentMana: gardenSlotMana, 
    manaFlowRate: 0, 
    isUnlocked: true, 
    plotAppearance: 'normal' as 'normal' | 'vibrant' | 'withered' | 'magical' | 'overgrown', // Type assertion for string literal
    sunlight: 70 // Add required sunlight property
  };
  
  const mutationChance = calculateMutationChance(plant, mockGardenSlot, moonPhase);
  
  // Random roll to see if mutation occurs
  if (Math.random() < mutationChance) {
    // Generate random mutation
    const mutation = generateRandomMutation(plant, moonPhase, season, elementalInfluence, soilType);
    
    if (mutation) {
      // Apply mutation to plant
      const mutatedPlant = applyMutation(plant, mutation);
      return { mutated: true, plant: mutatedPlant, mutation };
    }
  }
  
  // No mutation occurred
  return { mutated: false, plant };
}

/**
 * Cross-breed two plants to create a new variety
 * @param parent1 First parent plant
 * @param parent2 Second parent plant
 * @param moonPhase Current moon phase
 * @param season Current season
 * @returns New plant with inherited traits
 */
export function crossBreedPlants(
  parent1: Plant | DisplayPlant,
  parent2: Plant | DisplayPlant,
  moonPhase: MoonPhase,
  season: Season
): { 
  success: boolean; 
  newPlant?: Plant; 
  traitInheritance?: {
    fromParent1: string[];
    fromParent2: string[];
    newMutations: string[];
  };
  rarityTier: number;
  message: string;
} {
  if (!parent1 || !parent2) {
    return { 
      success: false, 
      rarityTier: 1,
      message: "Cross-breeding requires two valid parent plants." 
    };
  }
  
  // Check if parents are compatible
  const sameCategory = parent1.tarotCardId?.split('_')[0] === parent2.tarotCardId?.split('_')[0];
  const baseCompatibility = sameCategory ? 0.6 : 0.3;
  
  // Moon phase affects success rate
  const moonBonus = 
    moonPhase === 'Full Moon' ? 0.2 :
    moonPhase === 'New Moon' ? -0.1 : 0;
  
  // Final success probability
  const successProbability = Math.min(0.9, Math.max(0.1, baseCompatibility + moonBonus));
  
  // Random roll for success
  if (Math.random() > successProbability) {
    return {
      success: false,
      rarityTier: 1,
      message: "The cross-breeding attempt was unsuccessful. The plants were incompatible."
    };
  }
  
  // Create a new plant ID based on parents
  const newPlantId = `plant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  // Determine which parent's tarot card ID to inherit (base type)
  const inheritParent1Base = Math.random() < 0.5;
  const baseCardId = inheritParent1Base ? parent1.tarotCardId : parent2.tarotCardId;
  
  // Inherit mutations from both parents
  const parent1Mutations = parent1.mutations || [];
  const parent2Mutations = parent2.mutations || [];
  
  // Randomly select mutations to inherit (50% chance for each)
  const inheritedMutationsFromP1 = parent1Mutations.filter(() => Math.random() < 0.5);
  const inheritedMutationsFromP2 = parent2Mutations.filter(() => Math.random() < 0.5);
  
  // Check for and resolve mutation conflicts
  const combinedMutations = [...inheritedMutationsFromP1];
  
  // For each mutation from parent 2, check if it conflicts with already inherited mutations
  for (const mutation of inheritedMutationsFromP2) {
    const traitData = PLANT_TRAITS.find(trait => trait.id === mutation);
    if (!traitData) continue;
    
    // Check if this mutation conflicts with any already inherited mutations
    const hasConflict = combinedMutations.some(existingMutation => {
      const existingTraitData = PLANT_TRAITS.find(trait => trait.id === existingMutation);
      if (!existingTraitData) return false;
      
      // Check mutual exclusions
      return (existingTraitData.mutualExclusions?.includes(mutation) ||
              traitData.mutualExclusions?.includes(existingMutation));
    });
    
    // If no conflict, add the mutation
    if (!hasConflict) {
      combinedMutations.push(mutation);
    }
  }
  
  // Chance for a new random mutation (1 in 4 chance)
  let newRandomMutations: string[] = [];
  if (Math.random() < 0.25) {
    // Assume full moon for higher mutation chance during cross-breeding
    const mockElement: ElementType = 'Spirit';
    const mockSoil: SoilType = 'loamy';
    
    const mutation = generateRandomMutation(
      { 
        id: newPlantId, 
        tarotCardId: baseCardId || '', 
        growth: 0, 
        maxGrowth: 100, 
        health: 100, 
        watered: false, 
        age: 0, 
        mature: false, 
        moonBlessing: 50, 
        seasonalResonance: 50, 
        elementalHarmony: 50, 
        qualityModifier: 50, 
        growthStage: 'seed', 
        mutations: combinedMutations, 
        specialTraits: [] 
      },
      moonPhase,
      season,
      mockElement,
      mockSoil
    );
    
    if (mutation) {
      newRandomMutations.push(mutation.id);
      combinedMutations.push(mutation.id);
    }
  }
  
  // Calculate rarity tier based on mutations
  let rarityTier = 1; // Common
  const legendaryCount = combinedMutations.filter(id => 
    PLANT_TRAITS.find(trait => trait.id === id)?.rarity === 'legendary'
  ).length;
  
  const rareCount = combinedMutations.filter(id => 
    PLANT_TRAITS.find(trait => trait.id === id)?.rarity === 'rare'
  ).length;
  
  const uncommonCount = combinedMutations.filter(id => 
    PLANT_TRAITS.find(trait => trait.id === id)?.rarity === 'uncommon'
  ).length;
  
  if (legendaryCount > 0) {
    rarityTier = 4; // Legendary
  } else if (rareCount > 1 || (rareCount > 0 && uncommonCount > 1)) {
    rarityTier = 3; // Rare
  } else if (uncommonCount > 0 || combinedMutations.length > 2) {
    rarityTier = 2; // Uncommon
  }
  
  // Create trait inheritance record
  const traitInheritance = {
    fromParent1: inheritedMutationsFromP1,
    fromParent2: inheritedMutationsFromP2,
    newMutations: newRandomMutations
  };
  
  // Create the new plant
  const baseTypeParts = (baseCardId || '').split('_');
  const baseType = baseTypeParts[0] || 'herb';
  const baseName = baseTypeParts.slice(1).join('_') || 'unknown';
  
  // Create a name for the new variety
  let newVarietyName = '';
  if (inheritParent1Base) {
    newVarietyName = `${baseName.charAt(0).toUpperCase() + baseName.slice(1)} Hybrid`;
  } else {
    newVarietyName = `${baseName.charAt(0).toUpperCase() + baseName.slice(1)} Cross`;
  }
  
  // Add variant designation based on rarity
  if (rarityTier === 4) {
    newVarietyName = `Mythical ${newVarietyName}`;
  } else if (rarityTier === 3) {
    newVarietyName = `Rare ${newVarietyName}`;
  } else if (rarityTier === 2) {
    newVarietyName = `Unusual ${newVarietyName}`;
  }
  
  // Create the new tarot card ID
  const newTarotCardId = `${baseType}_${newVarietyName.toLowerCase().replace(/\s+/g, '_')}`;
  
  // Create the new plant object
  const newPlant: Plant = {
    id: newPlantId,
    tarotCardId: newTarotCardId,
    growth: 0,
    maxGrowth: 100,
    health: 100,
    watered: false,
    age: 0,
    mature: false,
    moonBlessing: (parent1.moonBlessing || 50 + parent2.moonBlessing || 50) / 2,
    seasonalResonance: (parent1.seasonalResonance || 50 + parent2.seasonalResonance || 50) / 2,
    elementalHarmony: (parent1.elementalHarmony || 50 + parent2.elementalHarmony || 50) / 2,
    qualityModifier: (parent1.qualityModifier || 50 + parent2.qualityModifier || 50) / 2,
    growthStage: 'seed',
    mutations: combinedMutations,
    specialTraits: []
  };
  
  // Success message
  let successMessage = `Successfully created a new ${newVarietyName} by cross-breeding.`;
  
  if (newRandomMutations.length > 0) {
    const mutationNames = newRandomMutations.map(id => 
      PLANT_TRAITS.find(trait => trait.id === id)?.name || id
    ).join(', ');
    successMessage += ` The new variety spontaneously developed ${mutationNames}.`;
  }
  
  return {
    success: true,
    newPlant,
    traitInheritance,
    rarityTier,
    message: successMessage
  };
}

/**
 * Get a description of a plant's mutations
 * @param plant Plant to describe
 * @returns Array of mutation descriptions
 */
export function getPlantMutationDescriptions(plant: Plant | DisplayPlant): { name: string; description: string; type: string; }[] {
  if (!plant || !plant.mutations || plant.mutations.length === 0) {
    return [];
  }
  
  return plant.mutations.map(mutationId => {
    const trait = PLANT_TRAITS.find(t => t.id === mutationId);
    if (!trait) {
      return { name: mutationId, description: 'Unknown mutation', type: 'unknown' };
    }
    
    return {
      name: trait.name,
      description: trait.description,
      type: trait.type
    };
  });
}

/**
 * Calculate the overall quality of a plant based on its mutations and properties
 * @param plant Plant to evaluate
 * @returns Quality score (0-100)
 */
export function calculatePlantQuality(plant: Plant | DisplayPlant): number {
  if (!plant) return 0;
  
  // Base quality starts at 50
  let quality = 50;
  
  // Add quality based on mutations
  if (plant.mutations && plant.mutations.length > 0) {
    const traits = plant.mutations.map(id => PLANT_TRAITS.find(trait => trait.id === id)).filter(Boolean);
    
    // Rarity bonuses
    const rarityBonus = {
      'common': 2,
      'uncommon': 5,
      'rare': 10,
      'legendary': 20
    };
    
    // Apply bonuses for each trait
    for (const trait of traits) {
      if (!trait) continue;
      quality += rarityBonus[trait.rarity] || 0;
      
      // Apply effect modifiers
      if (trait.effects.potencyModifier) {
        quality += (trait.effects.potencyModifier - 1) * 10;
      }
      
      if (trait.effects.essenceModifier) {
        quality += (trait.effects.essenceModifier - 1) * 10;
      }
    }
  }
  
  // Add quality based on plant attributes
  if ('moonBlessing' in plant && plant.moonBlessing) {
    quality += (plant.moonBlessing - 50) / 5;
  }
  
  if ('seasonalResonance' in plant && plant.seasonalResonance) {
    quality += (plant.seasonalResonance - 50) / 5;
  }
  
  if ('elementalHarmony' in plant && plant.elementalHarmony) {
    quality += (plant.elementalHarmony - 50) / 5;
  }
  
  if ('qualityModifier' in plant && plant.qualityModifier) {
    quality += (plant.qualityModifier - 50) / 2;
  }
  
  // Ensure quality is within valid range (0-100)
  return Math.max(0, Math.min(100, quality));
}