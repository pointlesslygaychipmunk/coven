// shared/src/packagingSystem.ts
import { 
  ElementType, 
  ItemCategory, 
  Rarity,
  AtelierSpecialization
} from './types.js';

/**
 * Material types for product packaging
 */
export type PackagingMaterial = 
  'glass' | 'pottery' | 'paper' | 'wood' | 'metal' | 
  'cloth' | 'crystal' | 'porcelain' | 'silk' | 'leather' |
  'bamboo' | 'stone' | 'shell' | 'ceramic' | 'parchment';

/**
 * Design styles for product packaging
 */
export type DesignStyle = 
  'minimalist' | 'elegant' | 'rustic' | 'mystical' | 'ornate' |
  'celestial' | 'botanical' | 'geometric' | 'vintage' | 'folk' |
  'alchemical' | 'artistic' | 'whimsical' | 'seasonal' | 'abstract';

/**
 * Label styles for product packaging
 */
export type LabelStyle = 
  'handwritten' | 'printed' | 'etched' | 'embossed' | 'stamped' |
  'inlaid' | 'burned' | 'painted' | 'calligraphy' | 'illustrated' |
  'wax-sealed' | 'engraved' | 'ribboned' | 'hidden' | 'glowing';

/**
 * Special effects for product packaging
 */
export type PackagingEffect = 
  'shimmer' | 'glow' | 'mist' | 'bubbling' | 'swirling' |
  'aura' | 'crystalline' | 'magnetic' | 'reflective' | 'iridescent' |
  'levitating' | 'frost' | 'heat-reactive' | 'aromatic' | 'musical' |
  'translucent' | 'changing' | 'shadowy' | 'prismatic' | 'layered';

/**
 * Material quality levels
 */
export type MaterialQuality = 'common' | 'fine' | 'excellent' | 'masterwork' | 'legendary';

/**
 * Packaging type based on container
 */
export type PackagingType = 
  'bottle' | 'jar' | 'pouch' | 'box' | 'tin' | 'vial' | 'sachet' |
  'envelope' | 'chest' | 'basket' | 'amphora' | 'gourd' | 'scroll' |
  'teacup' | 'flask' | 'pendant' | 'amulet' | 'locket' | 'case';

/**
 * Key design elements that can be included in packaging
 */
export type DesignElement = 
  'sigil' | 'motif' | 'pattern' | 'emblem' | 'seal' | 'symbol' |
  'icon' | 'crest' | 'trim' | 'illustration' | 'relief' | 'gem' |
  'charm' | 'tassel' | 'leaf' | 'flower' | 'crystal' | 'thread';

/**
 * Interface for a packaging component
 */
export interface PackagingComponent {
  id: string;
  name: string;
  description: string;
  type: 'material' | 'design' | 'label' | 'effect' | 'element';
  materialType?: PackagingMaterial;
  materialQuality?: MaterialQuality;
  designStyle?: DesignStyle;
  labelStyle?: LabelStyle;
  effectType?: PackagingEffect;
  designElement?: DesignElement;
  rarity: Rarity;
  value: number;
  elementalAffinity?: ElementType;
  unlockRequirements?: {
    atelierLevel: number;
    specialization?: AtelierSpecialization;
    materialsNeeded?: Array<{itemId: string, quantity: number}>;
    coinsNeeded?: number;
  };
  bonuses: {
    marketValue: number;
    potency: number;
    attractiveness: number;
    durability: number;
    prestige: number;
  };
  compatibleWith: ItemCategory[];
  imagePath: string;
}

/**
 * Interface for a completed product packaging design
 */
export interface ProductPackaging {
  id: string;
  name: string;
  designName: string; // Brand name + product line
  creatorId: string;
  material: PackagingMaterial | any;
  materialQuality: MaterialQuality | string;
  packagingType: PackagingType | string;
  designStyle: DesignStyle | string;
  labelStyle: LabelStyle | string;
  colorScheme: string[];
  specialEffects: PackagingEffect[] | string[];
  designElements?: DesignElement[] | string[];  // Making designElements optional
  componentIds?: string[]; // IDs of all component parts used
  signatureElement?: string; // Creator's signature element/motif
  rarity: Rarity | string;
  seasonalTheme?: string;
  elementalAffinity: ElementType;
  bonuses: {
    marketValue: number;
    potency: number;
    attractiveness: number;
    durability: number;
    prestige: number;
    specialProperty?: {
      type: string;
      value: number;
      description: string;
    };
  };
  lore: string; // Packaging story/history
  imagePath: string;
  isBestseller?: boolean;
  isSignatureLine?: boolean;
  creationDate: number;
  collectorValue: number;
  
  // Frontend compatibility properties
  colors?: {
    base: string;
    accent: string;
  };
  qualityScore?: number;
  specialEffect?: any;
  brand?: any;
}

/**
 * Interface for a brand identity
 */
export interface BrandIdentity {
  id: string;
  name: string;
  tagline: string;
  description: string;
  colorPalette: string[];
  brandValues: string[];
  specialization: AtelierSpecialization;
  reputation: number;
  
  // Fields that can be optional for frontend compatibility
  ownerId?: string;
  foundingDate?: number;
  logoPath?: string;
  signature?: {
    element: ElementType;
    designStyle: DesignStyle;
    motif: DesignElement | string;
    materialPreference: PackagingMaterial | string;
    specialEffect: PackagingEffect | string;
  } | string;
  aestheticKeywords?: string[];
  regularCustomers?: number;
  productLines?: Array<{
    name: string;
    description: string;
    itemCategory: ItemCategory;
    pricePoint: 'budget' | 'standard' | 'premium' | 'luxury';
    targetAudience: string;
  }>;
  marketingBonus?: number;
  brandLevelXp?: number;
  brandLevel?: number;
  achievements?: string[];
  
  // Additional properties for frontend compatibility
  recognition?: number;
  icon?: string;
  elementalAffinity?: ElementType;
}

/**
 * Material base types by rarity and properties
 */
export const MATERIAL_BASES: Record<PackagingMaterial, {
  baseValue: number;
  rarity: Rarity;
  durability: number;
  prestige: number;
  elementalAffinity: ElementType;
  description: string;
}> = {
  'glass': {
    baseValue: 20,
    rarity: 'common',
    durability: 60,
    prestige: 30,
    elementalAffinity: 'Water',
    description: 'Clear and elegant, perfect for displaying contents'
  },
  'pottery': {
    baseValue: 15,
    rarity: 'common',
    durability: 70,
    prestige: 25,
    elementalAffinity: 'Earth',
    description: 'Rustic and earthy, provides excellent insulation'
  },
  'paper': {
    baseValue: 10,
    rarity: 'common',
    durability: 40,
    prestige: 20,
    elementalAffinity: 'Air',
    description: 'Lightweight and customizable, perfect for dry goods'
  },
  'wood': {
    baseValue: 25,
    rarity: 'common',
    durability: 80,
    prestige: 40,
    elementalAffinity: 'Earth',
    description: 'Natural and warm, provides excellent protection'
  },
  'metal': {
    baseValue: 30,
    rarity: 'uncommon',
    durability: 90,
    prestige: 50,
    elementalAffinity: 'Fire',
    description: 'Sturdy and protective, suggests quality and permanence'
  },
  'cloth': {
    baseValue: 15,
    rarity: 'common',
    durability: 50,
    prestige: 25,
    elementalAffinity: 'Air',
    description: 'Soft and flexible, perfect for delicate items'
  },
  'crystal': {
    baseValue: 60,
    rarity: 'rare',
    durability: 50,
    prestige: 80,
    elementalAffinity: 'Spirit',
    description: 'Captures and enhances magical energies within'
  },
  'porcelain': {
    baseValue: 45,
    rarity: 'uncommon',
    durability: 65,
    prestige: 70,
    elementalAffinity: 'Water',
    description: 'Refined and elegant, suggests sophistication'
  },
  'silk': {
    baseValue: 50,
    rarity: 'uncommon',
    durability: 45,
    prestige: 75,
    elementalAffinity: 'Air',
    description: 'Luxurious and smooth, elevates any product'
  },
  'leather': {
    baseValue: 35,
    rarity: 'uncommon',
    durability: 85,
    prestige: 55,
    elementalAffinity: 'Earth',
    description: 'Durable and flexible, develops character with age'
  },
  'bamboo': {
    baseValue: 20,
    rarity: 'common',
    durability: 75,
    prestige: 45,
    elementalAffinity: 'Earth',
    description: 'Sustainable and lightweight, with natural patterns'
  },
  'stone': {
    baseValue: 40,
    rarity: 'uncommon',
    durability: 95,
    prestige: 60,
    elementalAffinity: 'Earth',
    description: 'Ancient and powerful, preserves contents indefinitely'
  },
  'shell': {
    baseValue: 55,
    rarity: 'rare',
    durability: 70,
    prestige: 65,
    elementalAffinity: 'Water',
    description: 'Naturally iridescent and unique, each piece one-of-a-kind'
  },
  'ceramic': {
    baseValue: 25,
    rarity: 'common',
    durability: 65,
    prestige: 35,
    elementalAffinity: 'Fire',
    description: 'Versatile and practical, takes colors and glazes beautifully'
  },
  'parchment': {
    baseValue: 30,
    rarity: 'uncommon',
    durability: 55,
    prestige: 50,
    elementalAffinity: 'Spirit',
    description: 'Ancient medium that harmonizes with magical inks'
  }
};

/**
 * Design styles with their associated bonuses and affinities
 */
export const DESIGN_STYLES: Record<DesignStyle, {
  marketingValue: number;
  specialization: AtelierSpecialization;
  elementalAffinity: ElementType;
  description: string;
}> = {
  'minimalist': {
    marketingValue: 25,
    specialization: 'Essence',
    elementalAffinity: 'Air',
    description: 'Clean lines and simple shapes emphasize product purity'
  },
  'elegant': {
    marketingValue: 45,
    specialization: 'Distillation',
    elementalAffinity: 'Water',
    description: 'Refined and sophisticated designs appeal to discerning customers'
  },
  'rustic': {
    marketingValue: 20,
    specialization: 'Fermentation',
    elementalAffinity: 'Earth',
    description: 'Homey and traditional, suggesting authentic methods'
  },
  'mystical': {
    marketingValue: 35,
    specialization: 'Crystallization',
    elementalAffinity: 'Spirit',
    description: 'Esoteric symbols and cosmic imagery suggest magical potency'
  },
  'ornate': {
    marketingValue: 40,
    specialization: 'Infusion',
    elementalAffinity: 'Water',
    description: 'Elaborate decoration with fine details shows craft mastery'
  },
  'celestial': {
    marketingValue: 50,
    specialization: 'Crystallization',
    elementalAffinity: 'Spirit',
    description: 'Star charts and lunar symbols connect to cosmic energies'
  },
  'botanical': {
    marketingValue: 30,
    specialization: 'Fermentation',
    elementalAffinity: 'Earth',
    description: 'Plant motifs and natural elements emphasize ingredients'
  },
  'geometric': {
    marketingValue: 35,
    specialization: 'Transmutation',
    elementalAffinity: 'Fire',
    description: 'Precise patterns and mathematical harmony suggest perfect formulation'
  },
  'vintage': {
    marketingValue: 40,
    specialization: 'Distillation',
    elementalAffinity: 'Water',
    description: 'Nostalgic styles that evoke time-tested traditions'
  },
  'folk': {
    marketingValue: 25,
    specialization: 'Fermentation',
    elementalAffinity: 'Earth',
    description: 'Traditional cultural patterns that tell a story'
  },
  'alchemical': {
    marketingValue: 45,
    specialization: 'Transmutation',
    elementalAffinity: 'Fire',
    description: 'Scientific diagrams and formulas suggest transformative effects'
  },
  'artistic': {
    marketingValue: 50,
    specialization: 'Infusion',
    elementalAffinity: 'Air',
    description: 'Expression through color and form, each package unique'
  },
  'whimsical': {
    marketingValue: 30,
    specialization: 'Infusion',
    elementalAffinity: 'Air',
    description: 'Playful and imaginative designs bring joy and surprise'
  },
  'seasonal': {
    marketingValue: 35,
    specialization: 'Essence',
    elementalAffinity: 'Earth',
    description: 'Designs that change with the seasons, always current'
  },
  'abstract': {
    marketingValue: 40,
    specialization: 'Essence',
    elementalAffinity: 'Spirit',
    description: 'Non-representational designs that evoke feelings rather than images'
  }
};

/**
 * Special effects and their associated bonuses
 */
export const SPECIAL_EFFECTS: Record<PackagingEffect, {
  potencyBonus: number;
  durabilityEffect: number;
  atelierSpecialization: AtelierSpecialization;
  rarity: Rarity;
  description: string;
}> = {
  'shimmer': {
    potencyBonus: 5,
    durabilityEffect: 0,
    atelierSpecialization: 'Crystallization',
    rarity: 'uncommon',
    description: 'Subtle glittering effect that catches the light'
  },
  'glow': {
    potencyBonus: 10,
    durabilityEffect: 0,
    atelierSpecialization: 'Essence',
    rarity: 'uncommon',
    description: 'Package softly illuminates, brighter when contents are potent'
  },
  'mist': {
    potencyBonus: 15,
    durabilityEffect: -5,
    atelierSpecialization: 'Distillation',
    rarity: 'rare',
    description: 'Gentle vapor surrounds the package, showing freshness'
  },
  'bubbling': {
    potencyBonus: 15,
    durabilityEffect: -10,
    atelierSpecialization: 'Fermentation',
    rarity: 'rare',
    description: 'Continuous effervescence shows active ingredients'
  },
  'swirling': {
    potencyBonus: 10,
    durabilityEffect: 0,
    atelierSpecialization: 'Infusion',
    rarity: 'uncommon',
    description: 'Contents move in gentle patterns when package is still'
  },
  'aura': {
    potencyBonus: 20,
    durabilityEffect: 0,
    atelierSpecialization: 'Essence',
    rarity: 'rare',
    description: 'Colored energy field surrounds package, visible to magical sight'
  },
  'crystalline': {
    potencyBonus: 25,
    durabilityEffect: 10,
    atelierSpecialization: 'Crystallization',
    rarity: 'rare',
    description: 'Crystal formations grow on package surface, indicating quality'
  },
  'magnetic': {
    potencyBonus: 15,
    durabilityEffect: 5,
    atelierSpecialization: 'Transmutation',
    rarity: 'uncommon',
    description: 'Package subtly attracts metals and can float momentarily'
  },
  'reflective': {
    potencyBonus: 5,
    durabilityEffect: 5,
    atelierSpecialization: 'Crystallization',
    rarity: 'common',
    description: 'Mirror-like surfaces reflect and amplify ambient magic'
  },
  'iridescent': {
    potencyBonus: 10,
    durabilityEffect: 0,
    atelierSpecialization: 'Crystallization',
    rarity: 'uncommon',
    description: 'Colors shift depending on viewing angle and light source'
  },
  'levitating': {
    potencyBonus: 30,
    durabilityEffect: -5,
    atelierSpecialization: 'Transmutation',
    rarity: 'legendary',
    description: 'Package hovers slightly above surfaces'
  },
  'frost': {
    potencyBonus: 20,
    durabilityEffect: 0,
    atelierSpecialization: 'Distillation',
    rarity: 'rare',
    description: 'Delicate frost patterns form regardless of temperature'
  },
  'heat-reactive': {
    potencyBonus: 15,
    durabilityEffect: 0,
    atelierSpecialization: 'Transmutation',
    rarity: 'rare',
    description: 'Colors or patterns change when warmed by touch'
  },
  'aromatic': {
    potencyBonus: 10,
    durabilityEffect: 0,
    atelierSpecialization: 'Infusion',
    rarity: 'uncommon',
    description: 'Package releases pleasant scent indicating contents'
  },
  'musical': {
    potencyBonus: 10,
    durabilityEffect: 0,
    atelierSpecialization: 'Infusion',
    rarity: 'rare',
    description: 'Soft tones play when package is opened or handled'
  },
  'translucent': {
    potencyBonus: 5,
    durabilityEffect: -5,
    atelierSpecialization: 'Distillation',
    rarity: 'common',
    description: 'Partially see-through with visible magical currents'
  },
  'changing': {
    potencyBonus: 25,
    durabilityEffect: 0,
    atelierSpecialization: 'Transmutation',
    rarity: 'rare',
    description: 'Design slowly transforms over time or with moon phases'
  },
  'shadowy': {
    potencyBonus: 15,
    durabilityEffect: 0,
    atelierSpecialization: 'Essence',
    rarity: 'rare',
    description: 'Shadows around package move independently, providing dramatic effect'
  },
  'prismatic': {
    potencyBonus: 20,
    durabilityEffect: 0,
    atelierSpecialization: 'Crystallization',
    rarity: 'rare',
    description: 'Splits light into rainbow patterns when illuminated'
  },
  'layered': {
    potencyBonus: 10,
    durabilityEffect: 10,
    atelierSpecialization: 'Infusion',
    rarity: 'uncommon',
    description: 'Multiple overlapping designs create depth and protection'
  }
};

/**
 * Calculate the total value and bonuses of a product packaging
 * @param packaging The product packaging to evaluate
 * @returns Object with calculated values and bonuses
 */
export function calculatePackagingValue(packaging: ProductPackaging): {
  totalValue: number;
  marketBonus: number;
  potencyBonus: number;
  rarityLevel: number;
  prestigeValue: number;
  specialEffectDescription: string;
} {
  // Base material value with type assertion for index
  const materialBase = MATERIAL_BASES[packaging.material as PackagingMaterial] || {
    baseValue: 20,
    rarity: 'common' as Rarity,
    durability: 60,
    prestige: 30,
    elementalAffinity: 'Water' as ElementType,
    description: 'Default material'
  };
  let totalValue = materialBase.baseValue;
  
  // Material quality multiplier with type assertion
  const qualityMultipliers = {
    'common': 1.0,
    'fine': 1.5,
    'excellent': 2.0,
    'masterwork': 3.0,
    'legendary': 5.0
  };
  const materialQuality = typeof packaging.materialQuality === 'string' ? 
    packaging.materialQuality as MaterialQuality : 'common';
  totalValue *= qualityMultipliers[materialQuality as keyof typeof qualityMultipliers] || 1.0;
  
  // Design style value with type assertion for index
  const designStyleKey = packaging.designStyle as DesignStyle;
  const designStyle = DESIGN_STYLES[designStyleKey] || {
    marketingValue: 30,
    specialization: 'Essence' as AtelierSpecialization,
    elementalAffinity: 'Air' as ElementType,
    description: 'Default design style'
  };
  totalValue += designStyle.marketingValue;
  
  // Special effects bonuses with type safety
  let potencyBonus = 0;
  let specialEffects: string[] = [];
  
  for (const effect of packaging.specialEffects) {
    const effectKey = effect as PackagingEffect;
    // Safely access the effect data with fallback
    const effectData = SPECIAL_EFFECTS[effectKey] || {
      potencyBonus: 5,
      durabilityEffect: 0,
      atelierSpecialization: 'Essence' as AtelierSpecialization,
      rarity: 'common' as Rarity,
      description: 'Default effect'
    };
    potencyBonus += effectData.potencyBonus;
    totalValue += effectData.potencyBonus * 5;
    specialEffects.push(effectData.description);
  }
  
  // Calculate rarity level based on components
  let rarityPoints = 0;
  if (materialBase.rarity === 'common') rarityPoints += 1;
  if (materialBase.rarity === 'uncommon') rarityPoints += 2;
  if (materialBase.rarity === 'rare') rarityPoints += 3;
  if (materialBase.rarity === 'legendary') rarityPoints += 5;
  
  // Check material quality with appropriate type handling
  const qualityValue = packaging.materialQuality as string;
  if (qualityValue === 'fine') rarityPoints += 1;
  if (qualityValue === 'excellent') rarityPoints += 2;
  if (qualityValue === 'masterwork') rarityPoints += 3;
  if (qualityValue === 'legendary') rarityPoints += 5;
  
  // Process special effects with type safety
  for (const effect of packaging.specialEffects) {
    const effectKey = effect as PackagingEffect;
    // Get effect data with fallback for type safety
    const effectData = SPECIAL_EFFECTS[effectKey] || {
      potencyBonus: 5,
      durabilityEffect: 0,
      atelierSpecialization: 'Essence' as AtelierSpecialization,
      rarity: 'common' as Rarity,
      description: 'Default effect'
    };
    
    if (effectData.rarity === 'uncommon') rarityPoints += 1;
    if (effectData.rarity === 'rare') rarityPoints += 2;
    if (effectData.rarity === 'legendary') rarityPoints += 4;
  }
  
  let rarityLevel = 1; // Common
  if (rarityPoints >= 4) rarityLevel = 2; // Uncommon
  if (rarityPoints >= 8) rarityLevel = 3; // Rare
  if (rarityPoints >= 12) rarityLevel = 4; // Epic
  if (rarityPoints >= 16) rarityLevel = 5; // Legendary
  
  // Calculate prestige value for branding
  const prestigeValue = 
    materialBase.prestige + 
    (designStyle.marketingValue / 2) + 
    (packaging.specialEffects.length * 10) +
    (packaging.designElements?.length ? packaging.designElements.length * 5 : 0) +
    ((packaging.isSignatureLine ? 50 : 0)) +
    (packaging.isBestseller ? 25 : 0);
  
  // Market bonus based on design
  const marketBonus = (totalValue * 0.1) + designStyle.marketingValue;
  
  // Compile special effects description
  const specialEffectDescription = specialEffects.length > 0 
    ? specialEffects.join('. ') 
    : 'No special effects.';
  
  return {
    totalValue,
    marketBonus,
    potencyBonus,
    rarityLevel,
    prestigeValue,
    specialEffectDescription
  };
}

/**
 * Generate a new unique packaging design
 * @param name Design name
 * @param creatorId Creator's player ID
 * @param material Material type
 * @param componentIds Component IDs used
 * @param specialization Creator's specialization
 * @returns A new product packaging design
 */
export function createPackagingDesign(
  name: string,
  creatorId: string,
  material: PackagingMaterial,
  materialQuality: MaterialQuality,
  packagingType: PackagingType,
  designStyle: DesignStyle,
  labelStyle: LabelStyle,
  colorScheme: string[],
  specialEffects: PackagingEffect[],
  designElements: DesignElement[],
  componentIds: string[],
  elementalAffinity: ElementType,
  specialization: AtelierSpecialization,
  lore: string = ''
): ProductPackaging {
  // Generate unique ID
  const id = `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  
  // Default values
  const bonuses: {
    marketValue: number,
    potency: number,
    attractiveness: number,
    durability: number,
    prestige: number,
    specialProperty?: {
      type: string;
      value: number;
      description: string;
    }
  } = {
    marketValue: 0,
    potency: 0,
    attractiveness: 0,
    durability: 0,
    prestige: 0
  };
  
  // Calculate base durability from material
  bonuses.durability = MATERIAL_BASES[material].durability;
  
  // Apply material quality factor
  const qualityFactors = {
    'common': 1.0,
    'fine': 1.2,
    'excellent': 1.5,
    'masterwork': 2.0,
    'legendary': 3.0
  };
  bonuses.durability *= qualityFactors[materialQuality];
  
  // Apply design style marketing value
  bonuses.marketValue = DESIGN_STYLES[designStyle].marketingValue;
  
  // Apply special effects bonuses
  for (const effect of specialEffects) {
    const effectData = SPECIAL_EFFECTS[effect];
    bonuses.potency += effectData.potencyBonus;
    bonuses.durability += effectData.durabilityEffect;
  }
  
  // Calculate attractiveness based on design elements and color scheme
  bonuses.attractiveness = 
    (colorScheme.length * 5) + 
    (designElements.length * 10) + 
    (DESIGN_STYLES[designStyle].marketingValue / 2);
  
  // Calculate prestige
  bonuses.prestige = 
    MATERIAL_BASES[material].prestige * qualityFactors[materialQuality] + 
    (specialEffects.length * 15);
  
  // Apply specialization bonus if design style matches creator's specialization
  if (DESIGN_STYLES[designStyle].specialization === specialization) {
    bonuses.marketValue += 15;
    bonuses.potency += 10;
  }
  
  // Apply elemental affinity bonus if materials and effects align
  if (MATERIAL_BASES[material].elementalAffinity === elementalAffinity) {
    bonuses.potency += 15;
  }
  
  // Special property based on specialization
  let specialProperty = undefined;
  
  switch (specialization) {
    case 'Essence':
      specialProperty = {
        type: 'purity',
        value: 20,
        description: 'Contents remain pure for longer periods'
      };
      break;
    case 'Fermentation':
      specialProperty = {
        type: 'preservation',
        value: 25,
        description: 'Contents continue to develop beneficial qualities over time'
      };
      break;
    case 'Distillation':
      specialProperty = {
        type: 'potency',
        value: 30,
        description: 'Contents become more concentrated and effective'
      };
      break;
    case 'Infusion':
      specialProperty = {
        type: 'harmony',
        value: 20,
        description: 'Ingredients maintain perfect balance'
      };
      break;
    case 'Crystallization':
      specialProperty = {
        type: 'clarity',
        value: 25,
        description: 'Magical effects become more refined and precise'
      };
      break;
    case 'Transmutation':
      specialProperty = {
        type: 'adaptation',
        value: 30,
        description: 'Contents adapt to user\'s needs'
      };
      break;
  }
  
  if (specialProperty) {
    bonuses.specialProperty = {
      type: specialProperty.type,
      value: specialProperty.value,
      description: specialProperty.description
    };
  }
  
  // Calculate collector value based on quality and uniqueness
  const collectorValue = 
    bonuses.prestige + 
    (specialEffects.length * 20) + 
    (qualityFactors[materialQuality] * 50);
  
  // Default rarity based on material quality
  let rarity: Rarity;
  if (materialQuality === 'legendary') rarity = 'legendary';
  else if (materialQuality === 'masterwork') rarity = 'rare';
  else if (materialQuality === 'excellent') rarity = 'uncommon';
  else if (materialQuality === 'fine') rarity = 'uncommon';
  else rarity = 'common';
  
  // Upgrade rarity if it has many special effects
  if (specialEffects.length >= 3 && rarity === 'common') rarity = 'uncommon';
  if (specialEffects.length >= 3 && rarity === 'uncommon') rarity = 'rare';
  
  // Create the packaging design
  return {
    id,
    name,
    designName: name, // Default to name but can be customized
    creatorId,
    material,
    materialQuality,
    packagingType,
    designStyle,
    labelStyle,
    colorScheme,
    specialEffects,
    designElements,
    componentIds,
    elementalAffinity,
    rarity,
    bonuses,
    lore: lore || `A ${designStyle} ${packagingType} made of ${materialQuality} ${material}.`,
    imagePath: `/assets/packaging/${packagingType}_${material}.png`, // Default path pattern
    creationDate: Date.now(),
    collectorValue
  };
}

/**
 * Create a new brand identity
 * @param name Brand name
 * @param ownerId Owner player ID
 * @param specialization Owner's atelier specialization
 * @returns A new brand identity
 */
export function createBrandIdentity(
  name: string,
  ownerId: string,
  tagline: string,
  specialization: AtelierSpecialization,
  element: ElementType,
  designStyle: DesignStyle | string,
  motif: DesignElement | string,
  materialPreference: PackagingMaterial | string,
  specialEffect: PackagingEffect | string
): BrandIdentity {
  // Generate unique ID
  const id = `brand_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  
  // Generate basic color palette based on element
  const colorPalettes: Record<ElementType, string[]> = {
    'Earth': ['#8B4513', '#556B2F', '#CD853F', '#F5DEB3', '#2E8B57'],
    'Water': ['#1E90FF', '#00BFFF', '#87CEEB', '#B0E0E6', '#4682B4'],
    'Fire': ['#FF4500', '#FF8C00', '#FFA07A', '#FFFF00', '#B22222'],
    'Air': ['#F0FFFF', '#E0FFFF', '#AFEEEE', '#ADD8E6', '#00FFFF'],
    'Spirit': ['#9370DB', '#9932CC', '#BA55D3', '#E6E6FA', '#8A2BE2']
  };
  
  // Convert designStyle to string if needed for aestheticKeywords
  const designStyleKey = typeof designStyle === 'string' ? designStyle : 
                       (designStyle as DesignStyle).toString();
  
  return {
    id,
    name,
    ownerId,
    tagline,
    description: `${name} specializes in crafting ${specialization.toLowerCase()} products with a ${designStyle} aesthetic.`,
    foundingDate: Date.now(),
    logoPath: `/assets/brands/${name.toLowerCase().replace(/\s+/g, '_')}.png`,
    colorPalette: colorPalettes[element],
    signature: {
      element,
      designStyle: designStyle as DesignStyle, // Force the type
      motif,
      materialPreference,
      specialEffect
    },
    specialization,
    reputation: 10, // Starting reputation
    brandValues: ['Quality', 'Craft', 'Authenticity'],
    aestheticKeywords: [designStyleKey, element.toLowerCase(), 'handcrafted'],
    regularCustomers: 1,
    productLines: [{
      name: `${name} Essentials`,
      description: 'Our flagship line of everyday products',
      itemCategory: 'potion', // Default category
      pricePoint: 'standard',
      targetAudience: 'General customers'
    }],
    marketingBonus: 5,
    brandLevelXp: 0,
    brandLevel: 1,
    achievements: []
  };
}

/**
 * Helper function to safely get effect data even if it's a string
 * @param effect The packaging effect to look up
 * @returns The effect data from SPECIAL_EFFECTS or a default
 */
function getSafeEffectData(effect: PackagingEffect | string) {
  const effectKey = effect as PackagingEffect;
  return SPECIAL_EFFECTS[effectKey] || {
    potencyBonus: 5,
    durabilityEffect: 0,
    atelierSpecialization: 'Essence' as AtelierSpecialization,
    rarity: 'common' as Rarity,
    description: 'Magical visual enhancement'
  };
}

/**
 * Apply packaging to a product to enhance its properties
 * @param productId Product ID to package
 * @param packaging Packaging design to use
 * @returns Object with enhancement results
 */
export function applyPackagingToProduct(
  productId: string,
  packaging: ProductPackaging
): {
  enhancedValue: number;
  potencyBoost: number;
  marketAppeal: number;
  shelfLife: number;
  collectorValue: number;
  newProductId: string;
  packagingEffects: string[];
} {
  // Calculate value and potency boosts from packaging
  const bonuses = packaging.bonuses || { marketValue: 50, potency: 25, attractiveness: 75, durability: 80, prestige: 60 };
  const valueBoost = bonuses.marketValue + (bonuses.attractiveness * 0.5);
  const potencyBoost = bonuses.potency;
  
  // Calculate market appeal with safe property access
  const marketAppeal = 
    bonuses.attractiveness + 
    bonuses.marketValue + 
    bonuses.prestige;
  
  // Calculate shelf life based on durability
  const shelfLife = bonuses.durability * 0.1;
  
  // Generate packaging effects descriptions with type safety
  const materialName = typeof packaging.material === 'string' ? 
                     packaging.material.charAt(0).toUpperCase() + packaging.material.slice(1) : 
                     'Standard';
  
  const packagingType = packaging.packagingType || 'container';
  const designStyle = packaging.designStyle || 'standard';
  
  const packagingEffects = [
    `${materialName} ${packagingType} enhances product presentation`,
    `${designStyle} styling appeals to discerning customers`
  ];
  
  // Add special effects descriptions with type safety
  if (packaging.specialEffects && Array.isArray(packaging.specialEffects)) {
    for (const effect of packaging.specialEffects) {
      const effectData = getSafeEffectData(effect);
      packagingEffects.push(effectData.description);
    }
  }
  
  // Add specialization-specific effect if applicable
  if (bonuses.specialProperty) {
    packagingEffects.push(bonuses.specialProperty.description);
  }
  
  // Generate new product ID with packaging
  const newProductId = `${productId}_pkg_${packaging.id.split('_')[1]}`;
  
  return {
    enhancedValue: valueBoost,
    potencyBoost,
    marketAppeal,
    shelfLife,
    collectorValue: packaging.collectorValue,
    newProductId,
    packagingEffects
  };
}

// ---- Frontend Adapters ----
import type { 
  Material as FrontendMaterial,
  DesignStyle as FrontendDesignStyle,
  SpecialEffect as FrontendSpecialEffect,
  Brand as FrontendBrand,
  PackagingDesign as FrontendPackagingDesign,
  Product as FrontendProduct
} from './types.js';

/**
 * Generate an emoji representation for a material type
 * @param material Material type
 * @returns Emoji representation
 */
function getMaterialEmoji(material: PackagingMaterial): string {
  const emojiMap: Record<PackagingMaterial, string> = {
    'glass': '🧪',
    'pottery': '🏺',
    'paper': '📜',
    'wood': '🪵',
    'metal': '🔩',
    'cloth': '🧵',
    'crystal': '💎',
    'porcelain': '🍶',
    'silk': '🧣',
    'leather': '👝',
    'bamboo': '🎋',
    'stone': '🪨',
    'shell': '🐚',
    'ceramic': '🏮',
    'parchment': '📃'
  };
  return emojiMap[material] || '📦';
}

/**
 * Generate an emoji representation for a design style
 * @param style Design style
 * @returns Emoji representation
 */
function getDesignStyleEmoji(style: DesignStyle): string {
  const emojiMap: Record<DesignStyle, string> = {
    'minimalist': '⬜',
    'elegant': '✨',
    'rustic': '🌿',
    'mystical': '🔮',
    'ornate': '🏵️',
    'celestial': '✨',
    'botanical': '🌱',
    'geometric': '🔷',
    'vintage': '🕰️',
    'folk': '🎭',
    'alchemical': '⚗️',
    'artistic': '🎨',
    'whimsical': '🎪',
    'seasonal': '🍂',
    'abstract': '🎯'
  };
  return emojiMap[style] || '🎨';
}

/**
 * Generate an emoji representation for a packaging effect
 * @param effect Special effect
 * @returns Emoji representation
 */
function getEffectEmoji(effect: PackagingEffect): string {
  const emojiMap: Record<PackagingEffect, string> = {
    'shimmer': '✨',
    'glow': '🌟',
    'mist': '💨',
    'bubbling': '🫧',
    'swirling': '🌀',
    'aura': '🌈',
    'crystalline': '💎',
    'magnetic': '🧲',
    'reflective': '🪞',
    'iridescent': '🔆',
    'levitating': '🪄',
    'frost': '❄️',
    'heat-reactive': '🔥',
    'aromatic': '🌸',
    'musical': '🎵',
    'translucent': '👁️',
    'changing': '🔄',
    'shadowy': '👥',
    'prismatic': '🌈',
    'layered': '📚'
  };
  return emojiMap[effect] || '✨';
}

/**
 * Convert a backend material to a frontend material
 * @param material Material properties from backend
 * @param materialType Material type
 * @param materialQuality Material quality
 * @returns Frontend Material object
 */
export function toFrontendMaterial(
  materialType: PackagingMaterial,
  materialQuality: MaterialQuality = 'common',
  quantity: number = 1
): FrontendMaterial {
  const materialBase = MATERIAL_BASES[materialType];
  const id = `mat_${materialType}_${Date.now().toString(36)}`;
  
  return {
    id,
    name: `${materialQuality.charAt(0).toUpperCase() + materialQuality.slice(1)} ${materialType.charAt(0).toUpperCase() + materialType.slice(1)}`,
    description: materialBase.description,
    durability: Math.min(10, Math.round(materialBase.durability / 10)),
    qualityLevel: Math.min(10, Math.round(materialBase.prestige / 10)),
    specialProperty: materialBase.description,
    quantity,
    icon: getMaterialEmoji(materialType),
    materialType,
    materialQuality,
    elementalAffinity: materialBase.elementalAffinity,
    value: materialBase.baseValue
  };
}

/**
 * Convert a backend design style to a frontend design style
 * @param designStyle Design style type from backend
 * @returns Frontend DesignStyle object
 */
export function toFrontendDesignStyle(designStyle: DesignStyle): FrontendDesignStyle {
  const styleData = DESIGN_STYLES[designStyle];
  const id = `style_${designStyle}_${Date.now().toString(36)}`;
  
  return {
    id,
    name: `${designStyle.charAt(0).toUpperCase() + designStyle.slice(1)} Style`,
    description: styleData.description,
    complexityLevel: Math.min(10, Math.round(styleData.marketingValue / 5)),
    customerAppeal: Math.min(10, Math.round(styleData.marketingValue / 5) + 2),
    marketBonus: `Increases market value by ${styleData.marketingValue}`,
    icon: getDesignStyleEmoji(designStyle),
    designStyle,
    elementalAffinity: styleData.elementalAffinity,
    specializationAffinity: styleData.specialization
  };
}

/**
 * Convert a backend special effect to a frontend special effect
 * @param effectType Special effect type from backend
 * @param quantity Optional quantity
 * @returns Frontend SpecialEffect object
 */
export function toFrontendSpecialEffect(
  effectType: PackagingEffect,
  quantity: number = 1
): FrontendSpecialEffect {
  const effectData = SPECIAL_EFFECTS[effectType];
  const id = `effect_${effectType}_${Date.now().toString(36)}`;
  
  return {
    id,
    name: `${effectType.charAt(0).toUpperCase() + effectType.slice(1)} Effect`,
    description: effectData.description,
    rarity: Math.min(10, (effectData.rarity === 'legendary' ? 10 : 
              effectData.rarity === 'rare' ? 8 : 
              effectData.rarity === 'uncommon' ? 5 : 3)),
    power: Math.min(10, Math.round(effectData.potencyBonus / 3)),
    duration: effectData.rarity === 'legendary' ? 'Permanent' : 
              effectData.rarity === 'rare' ? 'Long-lasting' : 
              effectData.rarity === 'uncommon' ? 'Medium' : 'Short',
    quantity,
    icon: getEffectEmoji(effectType),
    effectType,
    potencyBonus: effectData.potencyBonus,
    durabilityEffect: effectData.durabilityEffect,
    specializationAffinity: effectData.atelierSpecialization
  };
}

// Type guard to check if signature is an object with nested properties
function isSignatureObject(signature: any): 
  signature is { 
    element: ElementType, 
    designStyle: DesignStyle, 
    motif: string, 
    materialPreference: string, 
    specialEffect: string 
  } {
  return signature && 
         typeof signature === 'object' && 
         'element' in signature &&
         'designStyle' in signature &&
         'motif' in signature;
}

/**
 * Convert a backend brand identity to a frontend brand
 * @param brandId Brand ID
 * @param name Brand name
 * @param brand Brand data from backend
 * @returns Frontend Brand object
 */
export function toFrontendBrand(
  backendBrand: BrandIdentity
): FrontendBrand {
  // Handle either string or object for signature with type guard
  let signatureString = '';
  let elementalAffinity: ElementType = 'Earth';
  
  if (typeof backendBrand.signature === 'string') {
    signatureString = backendBrand.signature;
    // Default element if signature is just a string
    elementalAffinity = 'Earth';
  } else if (isSignatureObject(backendBrand.signature)) {
    signatureString = `${backendBrand.signature.motif} in ${backendBrand.signature.designStyle} style`;
    elementalAffinity = backendBrand.signature.element;
  }
  
  // Calculate recognition with a fallback for undefined regularCustomers
  const customersCount = backendBrand.regularCustomers || 1;
  const recognition = Math.min(10, Math.round(customersCount / 10) + 2);
  
  return {
    id: backendBrand.id,
    name: backendBrand.name,
    description: backendBrand.description,
    reputation: Math.min(10, Math.round(backendBrand.reputation / 10)),
    recognition: recognition,
    signature: signatureString,
    icon: '🏷️',
    tagline: backendBrand.tagline,
    colorPalette: backendBrand.colorPalette,
    brandValues: backendBrand.brandValues,
    specialization: backendBrand.specialization,
    elementalAffinity: elementalAffinity
  };
}

/**
 * Convert a backend product packaging to a frontend packaging design
 * @param packaging Product packaging from backend
 * @returns Frontend PackagingDesign object
 */
export function toFrontendPackagingDesign(
  packaging: ProductPackaging
): FrontendPackagingDesign {
  // Get material info with type safety
  const materialKey = packaging.material as PackagingMaterial;
  const materialBase = MATERIAL_BASES[materialKey] || {
    baseValue: 20,
    rarity: 'common' as Rarity,
    durability: 60,
    prestige: 30,
    elementalAffinity: 'Water' as ElementType,
    description: 'Default material'
  };
  
  // Create derived colors from material and style
  const colorBase = materialBase.elementalAffinity === 'Earth' ? '#8b6b3d' :
                   materialBase.elementalAffinity === 'Water' ? '#4a78c5' :
                   materialBase.elementalAffinity === 'Fire' ? '#c85a54' :
                   materialBase.elementalAffinity === 'Air' ? '#a2c5e8' : '#9c7abd';
  
  const colorAccent = materialBase.elementalAffinity === 'Earth' ? '#f9f3e6' :
                     materialBase.elementalAffinity === 'Water' ? '#d5e5f6' :
                     materialBase.elementalAffinity === 'Fire' ? '#fad7d5' :
                     materialBase.elementalAffinity === 'Air' ? '#f4f9fd' : '#e9d9f2';
  
  // Calculate quality score from bonuses with safe access
  const bonuses = packaging.bonuses || { marketValue: 50, potency: 25, attractiveness: 75, durability: 80, prestige: 60 };
  const qualityScore = Math.min(100, Math.round(
    (bonuses.marketValue + 
     bonuses.potency + 
     bonuses.attractiveness + 
     bonuses.durability / 2 + 
     bonuses.prestige) / 2
  ));
  
  // Create frontend material with type assertions
  const frontendMaterial = toFrontendMaterial(
    packaging.material as PackagingMaterial, 
    packaging.materialQuality as MaterialQuality
  );
  
  // Create frontend design style with type assertion
  const frontendDesignStyle = toFrontendDesignStyle(
    packaging.designStyle as DesignStyle
  );
  
  // Create frontend special effect (if any) with type safety
  let frontendSpecialEffect = null;
  if (packaging.specialEffects && packaging.specialEffects.length > 0) {
    const firstEffect = packaging.specialEffects[0] as PackagingEffect;
    frontendSpecialEffect = toFrontendSpecialEffect(firstEffect);
  }
  
  return {
    id: packaging.id,
    name: packaging.name,
    material: frontendMaterial,
    designStyle: frontendDesignStyle,
    specialEffect: frontendSpecialEffect,
    colors: {
      base: colorBase,
      accent: colorAccent
    },
    qualityScore,
    packagingType: packaging.packagingType,
    labelStyle: packaging.labelStyle,
    designElements: packaging.designElements,
    specialEffects: packaging.specialEffects,
    lore: packaging.lore,
    seasonalTheme: packaging.seasonalTheme,
    collectorValue: packaging.collectorValue,
    creationDate: packaging.creationDate
  };
}

/**
 * Convert a frontend packaging design to a backend product packaging
 * @param design Frontend packaging design
 * @param creatorId Creator's ID
 * @returns Backend ProductPackaging object
 */
export function toBackendPackaging(
  design: FrontendPackagingDesign,
  creatorId: string
): ProductPackaging {
  return createPackagingDesign(
    design.name,
    creatorId,
    design.material.materialType,
    design.material.materialQuality,
    design.packagingType || 'bottle',
    design.designStyle.designStyle,
    design.labelStyle || 'printed',
    design.colors ? [design.colors.base, design.colors.accent] : ['#8b6b3d', '#f9f3e6'],
    design.specialEffect ? [design.specialEffect.effectType] : [],
    design.designElements || ['motif'],
    [], // componentIds
    design.material.elementalAffinity || 'Earth',
    design.designStyle.specializationAffinity || 'Essence',
    design.lore || ''
  );
}

/**
 * Apply packaging design to a product
 * @param product Frontend product
 * @param design Frontend packaging design
 * @returns Enhanced product with packaging
 */
export function applyPackagingDesignToProduct(
  product: FrontendProduct, 
  design: FrontendPackagingDesign
): FrontendProduct {
  // Convert to backend types
  const backendPackaging = toBackendPackaging(design, 'player');
  
  // Apply packaging
  const enhancement = applyPackagingToProduct(product.id, backendPackaging);
  
  // Return enhanced product
  return {
    ...product,
    packaging: design,
    enhancedValue: enhancement.enhancedValue,
    potencyBoost: enhancement.potencyBoost,
    marketAppeal: enhancement.marketAppeal,
    shelfLife: enhancement.shelfLife,
    packagingEffects: enhancement.packagingEffects,
    id: enhancement.newProductId
  };
}

/**
 * Create a packaged product from a product and packaging design
 * @param product The base product to package
 * @param packaging The packaging design to apply
 * @returns A new packaged product with enhanced properties
 */
export function createPackagedProduct(
  product: FrontendProduct,
  packaging: ProductPackaging
): FrontendProduct {
  // Apply packaging to get enhancement values
  const enhancement = applyPackagingToProduct(product.id, packaging);
  
  // Convert packaging to frontend format
  const frontendPackaging = toFrontendPackagingDesign(packaging);
  
  // Create new product with packaging
  return {
    ...product,
    id: enhancement.newProductId,
    packaging: frontendPackaging,
    enhancedValue: enhancement.enhancedValue,
    potencyBoost: enhancement.potencyBoost,
    marketAppeal: enhancement.marketAppeal,
    shelfLife: enhancement.shelfLife,
    packagingEffects: enhancement.packagingEffects
  };
}