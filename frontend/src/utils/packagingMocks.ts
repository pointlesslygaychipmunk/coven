import { 
  ElementType, 
  AtelierSpecialization, 
  ItemType, 
  ItemCategory,
  Rarity,
  Material,
  DesignStyle,
  SpecialEffect,
  Brand,
  PackagingDesign,
  Product
} from 'coven-shared';

// Define packaging material types
export type PackagingMaterial = 
  'glass' | 
  'ceramic' | 
  'wood' | 
  'paper' | 
  'fabric' | 
  'metal' | 
  'crystal' | 
  'leather';

// Define design style types
export type DesignStyleType = 
  'minimalist' | 
  'ornate' | 
  'rustic' | 
  'elegant' | 
  'whimsical' | 
  'modern' | 
  'traditional' | 
  'mystical';

// Define packaging effect types  
export type PackagingEffect = 
  'preservation' | 
  'potency' | 
  'presentation' | 
  'protection' | 
  'enhancement' |
  'resonance' |
  'attraction' |
  'harmony';

// Define material quality types
export type MaterialQuality = 
  'crude' | 
  'common' | 
  'fine' | 
  'superior' | 
  'masterwork';

// Define packaging types
export type PackagingType = 
  'bottle' | 
  'jar' | 
  'pouch' | 
  'box' | 
  'envelope' | 
  'vial' | 
  'tin' | 
  'sachet';

// Define label style types
export type LabelStyle = 
  'printed' | 
  'handwritten' | 
  'engraved' | 
  'embossed' | 
  'stamped' | 
  'painted' | 
  'etched';

// Define design element types
export type DesignElement = 
  'symbol' | 
  'pattern' | 
  'illustration' | 
  'typography' | 
  'border' | 
  'wax seal' | 
  'embellishment';

// Backend Product Packaging type
export interface ProductPackaging {
  id: string;
  name: string;
  designName: string;
  creatorId: string;
  materialType: PackagingMaterial;
  materialQuality: MaterialQuality;
  packagingType: PackagingType;
  designStyle: DesignStyleType;
  labelStyle: LabelStyle;
  specialEffects: PackagingEffect[];
  colorScheme: string[];
  brandIdentity?: string;
  designElements?: DesignElement[];
  qualityScore?: number;
}

// Backend Brand Identity type
export interface BrandIdentity {
  id: string;
  name: string;
  description: string;
  tagline: string;
  colorPalette: string[];
  brandValues: string[];
  specialization: AtelierSpecialization;
  elementalAffinity: ElementType;
}

/**
 * Create a mock material instance
 */
export function createMockMaterial(
  id: string,
  name: string,
  materialType: PackagingMaterial,
  overrides: Partial<Material> = {}
): Material {
  return {
    id: id,
    name: name,
    description: overrides.description || `A ${name} packaging material`,
    durability: overrides.durability || Math.floor(Math.random() * 7) + 3,
    qualityLevel: overrides.qualityLevel || Math.floor(Math.random() * 7) + 3,
    specialProperty: overrides.specialProperty,
    quantity: overrides.quantity || 1,
    icon: overrides.icon || '📦',
    materialType: materialType,
    materialQuality: overrides.materialQuality || 'common',
    elementalAffinity: overrides.elementalAffinity,
    value: overrides.value || 50
  };
}

/**
 * Create a mock design style instance
 */
export function createMockDesignStyle(
  id: string,
  name: string,
  designStyle: DesignStyleType,
  overrides: Partial<DesignStyle> = {}
): DesignStyle {
  return {
    id: id,
    name: name,
    description: overrides.description || `A ${name} design style`,
    complexityLevel: overrides.complexityLevel || Math.floor(Math.random() * 7) + 3,
    customerAppeal: overrides.customerAppeal || Math.floor(Math.random() * 7) + 3,
    marketBonus: overrides.marketBonus,
    icon: overrides.icon || '🎨',
    designStyle: designStyle,
    elementalAffinity: overrides.elementalAffinity,
    specializationAffinity: overrides.specializationAffinity
  };
}

/**
 * Create a mock special effect instance
 */
export function createMockSpecialEffect(
  id: string,
  name: string,
  effectType: PackagingEffect,
  overrides: Partial<SpecialEffect> = {}
): SpecialEffect {
  return {
    id: id,
    name: name,
    description: overrides.description || `A ${name} special effect`,
    rarity: overrides.rarity || Math.floor(Math.random() * 7) + 3,
    power: overrides.power || Math.floor(Math.random() * 7) + 3,
    duration: overrides.duration,
    quantity: overrides.quantity || 1,
    icon: overrides.icon || '✨',
    effectType: effectType,
    potencyBonus: overrides.potencyBonus || 10,
    durabilityEffect: overrides.durabilityEffect || 5,
    specializationAffinity: overrides.specializationAffinity
  };
}

/**
 * Create a mock brand instance
 */
export function createMockBrand(
  id: string,
  name: string,
  overrides: Partial<Brand> = {}
): Brand {
  return {
    id: id,
    name: name,
    description: overrides.description || `The ${name} brand identity`,
    reputation: overrides.reputation || Math.floor(Math.random() * 7) + 3,
    recognition: overrides.recognition || Math.floor(Math.random() * 7) + 3,
    signature: overrides.signature,
    icon: overrides.icon || '🏷️',
    tagline: overrides.tagline || `${name} - Quality you can trust`,
    colorPalette: overrides.colorPalette || ['#8b6b3d', '#f9f3e6', '#3d5a8b'],
    brandValues: overrides.brandValues || ['Quality', 'Trust', 'Tradition'],
    specialization: overrides.specialization || 'Essence',
    elementalAffinity: overrides.elementalAffinity || 'Earth'
  };
}

/**
 * Create a mock packaging design instance
 */
export function createMockPackagingDesign(
  id: string,
  name: string,
  material: Material,
  designStyle: DesignStyle,
  overrides: Partial<PackagingDesign> = {}
): PackagingDesign {
  return {
    id: id,
    name: name,
    material: material,
    designStyle: designStyle,
    specialEffect: overrides.specialEffect || null,
    brand: overrides.brand || null,
    colors: overrides.colors || {
      base: '#8b6b3d',
      accent: '#f9f3e6'
    },
    qualityScore: overrides.qualityScore || 50,
    packagingType: overrides.packagingType || 'bottle',
    labelStyle: overrides.labelStyle || 'printed',
    designElements: overrides.designElements || [],
    specialEffects: overrides.specialEffects || [],
    lore: overrides.lore,
    seasonalTheme: overrides.seasonalTheme,
    collectorValue: overrides.collectorValue,
    creationDate: overrides.creationDate || Date.now()
  };
}

/**
 * Create a mock product instance
 */
export function createMockProduct(
  id: string,
  name: string,
  type: ItemType,
  category: ItemCategory,
  overrides: Partial<Product> = {}
): Product {
  return {
    id: id,
    name: name,
    description: overrides.description || `A ${name} product`,
    icon: overrides.icon || '🧪',
    type: type,
    category: category,
    value: overrides.value || 100,
    rarity: overrides.rarity || 'common',
    packaging: overrides.packaging,
    enhancedValue: overrides.enhancedValue,
    potencyBoost: overrides.potencyBoost,
    marketAppeal: overrides.marketAppeal,
    shelfLife: overrides.shelfLife,
    packagingEffects: overrides.packagingEffects
  };
}

/**
 * Convert a frontend PackagingDesign to a backend ProductPackaging format
 */
export function toBackendPackaging(
  design: PackagingDesign,
  creatorId: string = 'player1'
): ProductPackaging {
  // Extract material type
  let materialType: PackagingMaterial = 'glass'; // Default
  if (typeof design.material === 'string') {
    materialType = design.material as PackagingMaterial;
  } else if (design.material && typeof design.material === 'object') {
    materialType = (design.material as any).materialType as PackagingMaterial || 'glass';
  }
  
  // Extract design style
  let designStyleType: DesignStyleType = 'elegant'; // Default
  if (typeof design.designStyle === 'string') {
    designStyleType = design.designStyle as DesignStyleType;
  } else if (design.designStyle && typeof design.designStyle === 'object') {
    designStyleType = (design.designStyle as any).designStyle as DesignStyleType || 'elegant';
  }
  
  // Extract special effects
  let effectsArray: PackagingEffect[] = [];
  if (design.specialEffects && Array.isArray(design.specialEffects)) {
    effectsArray = design.specialEffects as PackagingEffect[];
  } else if (design.specialEffect && typeof design.specialEffect === 'object') {
    const effect = (design.specialEffect as any).effectType;
    if (effect) effectsArray.push(effect as PackagingEffect);
  }
  
  // Convert colors to color scheme
  const colorScheme = [
    design.colors?.base || '#8b6b3d',
    design.colors?.accent || '#f9f3e6'
  ];
  
  // Get brand identity if it exists
  let brandIdentity: string | undefined = undefined;
  if (design.brand && typeof design.brand === 'object') {
    brandIdentity = (design.brand as any).id;
  }
  
  return {
    id: design.id,
    name: design.name,
    designName: design.name, // Often the same
    creatorId: creatorId,
    materialType: materialType,
    materialQuality: 'fine', // Default
    packagingType: (design as any).packagingType || 'bottle',
    designStyle: designStyleType,
    labelStyle: (design as any).labelStyle || 'printed',
    specialEffects: effectsArray,
    colorScheme: colorScheme,
    brandIdentity: brandIdentity,
    designElements: (design as any).designElements || [],
    qualityScore: design.qualityScore || 50
  };
}

/**
 * Convert a backend ProductPackaging to a frontend PackagingDesign format
 */
export function toFrontendPackaging(
  packaging: ProductPackaging,
  materials: Material[] = [],
  designStyles: DesignStyle[] = [],
  effects: SpecialEffect[] = [],
  brands: Brand[] = []
): PackagingDesign {
  // Find or create material
  let material: Material;
  const foundMaterial = materials.find(m => 
    m.materialType === packaging.materialType && 
    m.materialQuality === packaging.materialQuality
  );
  
  if (foundMaterial) {
    material = foundMaterial;
  } else {
    material = createMockMaterial(
      `material_${Date.now()}`,
      `${packaging.materialQuality.charAt(0).toUpperCase() + packaging.materialQuality.slice(1)} ${packaging.materialType}`,
      packaging.materialType,
      { materialQuality: packaging.materialQuality }
    );
  }
  
  // Find or create design style
  let designStyle: DesignStyle;
  const foundStyle = designStyles.find(s => 
    s.designStyle === packaging.designStyle
  );
  
  if (foundStyle) {
    designStyle = foundStyle;
  } else {
    designStyle = createMockDesignStyle(
      `style_${Date.now()}`,
      `${packaging.designStyle.charAt(0).toUpperCase() + packaging.designStyle.slice(1)} Style`,
      packaging.designStyle
    );
  }
  
  // Find matching special effect(s)
  let specialEffect: SpecialEffect | null = null;
  if (packaging.specialEffects && packaging.specialEffects.length > 0) {
    const foundEffect = effects.find(e => 
      e.effectType === packaging.specialEffects[0]
    );
    
    if (foundEffect) {
      specialEffect = foundEffect;
    } else if (packaging.specialEffects[0]) {
      specialEffect = createMockSpecialEffect(
        `effect_${Date.now()}`,
        `${packaging.specialEffects[0].charAt(0).toUpperCase() + packaging.specialEffects[0].slice(1)} Effect`,
        packaging.specialEffects[0]
      );
    }
  }
  
  // Find matching brand
  let brand: Brand | null = null;
  if (packaging.brandIdentity) {
    const foundBrand = brands.find(b => 
      b.id === packaging.brandIdentity
    );
    
    if (foundBrand) {
      brand = foundBrand;
    }
  }
  
  // Convert color scheme to colors
  const colors = {
    base: packaging.colorScheme && packaging.colorScheme[0] ? packaging.colorScheme[0] : '#8b6b3d',
    accent: packaging.colorScheme && packaging.colorScheme[1] ? packaging.colorScheme[1] : '#f9f3e6'
  };
  
  // Create the frontend packaging design
  return {
    id: packaging.id,
    name: packaging.name,
    material: material,
    designStyle: designStyle,
    specialEffect: specialEffect,
    brand: brand,
    colors: colors,
    qualityScore: packaging.qualityScore || 50,
    packagingType: packaging.packagingType,
    labelStyle: packaging.labelStyle,
    designElements: packaging.designElements,
    specialEffects: packaging.specialEffects,
    creationDate: Date.now()
  };
}

/**
 * Apply a packaging design to a product
 */
export function applyPackagingDesignToProduct(
  product: Product, 
  design: PackagingDesign
): Product {
  // Create a new product with the design applied
  const enhancedProduct: Product = {
    ...product,
    id: `${product.id}_pkg_${Date.now()}`,
    packaging: design,
    
    // Calculate enhanced properties
    enhancedValue: calculateEnhancedValue(product.value, design),
    potencyBoost: calculatePotencyBoost(design),
    marketAppeal: calculateMarketAppeal(design),
    shelfLife: calculateShelfLife(design),
    packagingEffects: generatePackagingEffects(design)
  };
  
  return enhancedProduct;
}

/**
 * Calculate enhanced value based on packaging quality
 */
function calculateEnhancedValue(baseValue: number, design: PackagingDesign): number {
  // Calculate value multiplier based on packaging quality
  let multiplier = 1.0;
  
  // Add bonus for quality score
  multiplier += (design.qualityScore || 50) / 100;
  
  // Add bonus for brand reputation
  if (design.brand) {
    multiplier += (design.brand.reputation || 0) / 20;
  }
  
  // Add bonus for special effects
  if (design.specialEffect) {
    multiplier += 0.2;
  }
  
  // Calculate enhanced value
  return Math.round(baseValue * multiplier);
}

/**
 * Calculate potency boost provided by packaging
 */
function calculatePotencyBoost(design: PackagingDesign): number {
  let boost = 0;
  
  // Base boost from quality score
  boost += Math.floor((design.qualityScore || 50) / 10);
  
  // Add boost from special effect
  if (design.specialEffect) {
    boost += design.specialEffect.potencyBonus || 0;
  }
  
  return boost;
}

/**
 * Calculate market appeal of packaging
 */
function calculateMarketAppeal(design: PackagingDesign): number {
  let appeal = 50; // Base appeal
  
  // Add appeal from design style
  if (design.designStyle) {
    appeal += design.designStyle.customerAppeal || 0;
  }
  
  // Add appeal from brand recognition
  if (design.brand) {
    appeal += design.brand.recognition || 0;
  }
  
  // Cap appeal at 100
  return Math.min(100, appeal);
}

/**
 * Calculate shelf life based on packaging
 */
function calculateShelfLife(design: PackagingDesign): number {
  let shelfLife = 30; // Base shelf life in days
  
  // Add shelf life from material durability
  if (design.material) {
    shelfLife += (design.material.durability || 0) * 5;
  }
  
  // Add shelf life from preservation effect
  if (design.specialEffects && design.specialEffects.includes('preservation')) {
    shelfLife += 60; // 2 months extra
  }
  
  return shelfLife;
}

/**
 * Generate descriptive effects for packaging
 */
function generatePackagingEffects(design: PackagingDesign): string[] {
  const effects: string[] = [];
  
  // Add effect for material
  if (design.material) {
    const materialType = design.material.materialType || 'glass';
    switch (materialType) {
      case 'glass':
        effects.push('Clear visibility of contents');
        break;
      case 'ceramic':
        effects.push('Excellent temperature insulation');
        break;
      case 'wood':
        effects.push('Natural aroma enhancement');
        break;
      case 'paper':
        effects.push('Lightweight and recyclable');
        break;
      case 'fabric':
        effects.push('Breathable and flexible');
        break;
      case 'metal':
        effects.push('Superior durability and protection');
        break;
      case 'crystal':
        effects.push('Energetic resonance enhancement');
        break;
      case 'leather':
        effects.push('Weather-resistant and durable');
        break;
      default:
        effects.push('Standard packaging protection');
    }
  }
  
  // Add effect for design style
  if (design.designStyle) {
    const styleType = design.designStyle.designStyle || 'elegant';
    switch (styleType) {
      case 'minimalist':
        effects.push('Clean, modern appearance');
        break;
      case 'ornate':
        effects.push('Intricate detailing and craftsmanship');
        break;
      case 'rustic':
        effects.push('Authentic, handcrafted appeal');
        break;
      case 'elegant':
        effects.push('Sophisticated luxury appearance');
        break;
      case 'whimsical':
        effects.push('Playful, eye-catching design');
        break;
      case 'modern':
        effects.push('Contemporary, streamlined look');
        break;
      case 'traditional':
        effects.push('Time-honored, trusted design');
        break;
      case 'mystical':
        effects.push('Enigmatic, powerful presence');
        break;
      default:
        effects.push('Appealing visual design');
    }
  }
  
  // Add effect for special effects
  if (design.specialEffect) {
    const effectType = design.specialEffect.effectType || 'enhancement';
    switch (effectType) {
      case 'preservation':
        effects.push('Extended product shelf life');
        break;
      case 'potency':
        effects.push('Enhanced magical potency');
        break;
      case 'presentation':
        effects.push('Impressive market presentation');
        break;
      case 'protection':
        effects.push('Superior product protection');
        break;
      case 'enhancement':
        effects.push('Improved product efficacy');
        break;
      case 'resonance':
        effects.push('Magical energy amplification');
        break;
      case 'attraction':
        effects.push('Increased customer interest');
        break;
      case 'harmony':
        effects.push('Balanced ingredient interaction');
        break;
      default:
        effects.push('Special product enhancement');
    }
  }
  
  // Add effect for brand
  if (design.brand) {
    effects.push(`${design.brand.name} brand recognition`);
  }
  
  return effects;
}