/**
 * Mocks for the packaging system to provide compatibility between frontend and backend
 */
// Import types from shared but rename them to avoid name conflicts
import { 
  Material as SharedMaterial,
  DesignStyle as SharedDesignStyle,
  SpecialEffect as SharedSpecialEffect,
  Brand as SharedBrand,
  PackagingDesign as SharedPackagingDesign,
  Product as SharedProduct,
  ElementType
} from 'coven-shared';

// Define types that might be missing from the shared module
export type PackagingMaterial = 
  'glass' | 'pottery' | 'paper' | 'wood' | 'metal' | 
  'cloth' | 'crystal' | 'porcelain' | 'silk' | 'leather' |
  'bamboo' | 'stone' | 'shell' | 'ceramic' | 'parchment';

export type BackendDesignStyle = 
  'minimalist' | 'elegant' | 'rustic' | 'mystical' | 'ornate' |
  'celestial' | 'botanical' | 'geometric' | 'vintage' | 'folk' |
  'alchemical' | 'artistic' | 'whimsical' | 'seasonal' | 'abstract';

export type MaterialQuality = 'common' | 'fine' | 'excellent' | 'masterwork' | 'legendary';

export type PackagingEffect = 
  'shimmer' | 'glow' | 'mist' | 'bubbling' | 'swirling' |
  'aura' | 'crystalline' | 'magnetic' | 'reflective' | 'iridescent' |
  'levitating' | 'frost' | 'heat-reactive' | 'aromatic' | 'musical' |
  'translucent' | 'changing' | 'shadowy' | 'prismatic' | 'layered';

export type LabelStyle = 
  'handwritten' | 'printed' | 'etched' | 'embossed' | 'stamped' |
  'inlaid' | 'burned' | 'painted' | 'calligraphy' | 'illustrated' |
  'wax-sealed' | 'engraved' | 'ribboned' | 'hidden' | 'glowing';

export type PackagingType = 
  'bottle' | 'jar' | 'pouch' | 'box' | 'tin' | 'vial' | 'sachet' |
  'envelope' | 'chest' | 'basket' | 'amphora' | 'gourd' | 'scroll' |
  'teacup' | 'flask' | 'pendant' | 'amulet' | 'locket' | 'case';

export type DesignElement = 
  'sigil' | 'motif' | 'pattern' | 'emblem' | 'seal' | 'symbol' |
  'icon' | 'crest' | 'trim' | 'illustration' | 'relief' | 'gem' |
  'charm' | 'tassel' | 'leaf' | 'flower' | 'crystal' | 'thread';

// Define backend types - using any for string properties that might cause type conflicts
export interface ProductPackaging {
  id: string;
  name: string;
  designName: string;
  creatorId: string;
  material: PackagingMaterial | any;
  materialQuality: MaterialQuality | string;
  packagingType: PackagingType | string;
  designStyle: any; // Use any for designStyle to avoid type conflicts
  labelStyle: LabelStyle | string;
  specialEffects: PackagingEffect[] | string[];
  colorScheme: string[];
  componentIds?: string[];
  designElements?: DesignElement[] | string[]; // Add designElements
  elementalAffinity: ElementType;
  bonuses: {
    marketValue: number;
    potency: number;
    attractiveness: number;
    durability: number;
    prestige: number;
  };
  rarity: string;
  lore: string;
  imagePath: string;
  creationDate: number;
  collectorValue: number;
}

// Define BrandIdentity for backend compatibility
export interface BackendBrand {
  id: string;
  name: string;
  ownerId?: string;
  tagline: string;
  description: string;
  foundingDate?: number;
  logoPath?: string;
  colorPalette: string[];
  signature?: {
    element: ElementType;
    designStyle: any; // Use any to avoid type conflicts
    motif: string;
    materialPreference: string;
    specialEffect: string;
  } | string;
  specialization: string;
  reputation: number;
  brandValues: string[];
  aestheticKeywords?: string[];
  regularCustomers?: number;
  marketingBonus?: number;
  brandLevelXp?: number;
  brandLevel?: number;
  achievements?: string[];
  
  // Added for frontend compatibility
  elementalAffinity?: ElementType;
}

// We already imported these above with renamed versions

/**
 * Create a material instance suitable for frontend components
 */
export function createMaterial(
  id: string,
  name: string,
  materialType: PackagingMaterial,
  materialQuality: MaterialQuality = 'common',
  overrides: Partial<SharedMaterial> = {}
): SharedMaterial {
  return {
    id,
    name,
    description: overrides.description || `A ${name} packaging material`,
    durability: overrides.durability || Math.floor(Math.random() * 7) + 3,
    qualityLevel: overrides.qualityLevel || Math.floor(Math.random() * 7) + 3,
    specialProperty: overrides.specialProperty,
    quantity: overrides.quantity || 1,
    icon: overrides.icon || '📦',
    materialType,
    materialQuality,
    elementalAffinity: overrides.elementalAffinity,
    value: overrides.value || 50
  };
}

/**
 * Create a design style suitable for frontend components
 */
export function createDesignStyle(
  id: string,
  name: string,
  designStyleType: string | BackendDesignStyle,
  overrides: Partial<SharedDesignStyle> = {}
): SharedDesignStyle {
  // DesignStyle must have a string property called designStyle, but not be a string itself
  // Force designStyleType to work with the SharedDesignStyle interface
  return {
    id,
    name,
    description: overrides.description || `A ${name} design style`,
    complexityLevel: overrides.complexityLevel || Math.floor(Math.random() * 7) + 3,
    customerAppeal: overrides.customerAppeal || Math.floor(Math.random() * 7) + 3,
    marketBonus: overrides.marketBonus,
    icon: overrides.icon || '🎨',
    designStyle: designStyleType as any,
    elementalAffinity: overrides.elementalAffinity,
    specializationAffinity: overrides.specializationAffinity
  };
}

/**
 * Create a special effect suitable for frontend components
 */
export function createSpecialEffect(
  id: string,
  name: string,
  effectType: PackagingEffect,
  overrides: Partial<SharedSpecialEffect> = {}
): SharedSpecialEffect {
  return {
    id,
    name,
    description: overrides.description || `A ${name} special effect`,
    rarity: overrides.rarity || Math.floor(Math.random() * 7) + 3,
    power: overrides.power || Math.floor(Math.random() * 7) + 3,
    duration: overrides.duration,
    quantity: overrides.quantity || 1,
    icon: overrides.icon || '✨',
    effectType,
    potencyBonus: overrides.potencyBonus || 10,
    durabilityEffect: overrides.durabilityEffect || 5,
    specializationAffinity: overrides.specializationAffinity
  };
}

/**
 * Create a brand instance compatible with the frontend
 */
export function createBrand(
  id: string,
  name: string,
  overrides: Partial<SharedBrand> = {}
): SharedBrand {
  return {
    id,
    name,
    description: overrides.description || `The ${name} brand`,
    tagline: overrides.tagline || `${name} - Quality you can trust`,
    colorPalette: overrides.colorPalette || ['#8b6b3d', '#f9f3e6', '#3d5a8b'],
    brandValues: overrides.brandValues || ['Quality', 'Trust', 'Tradition'],
    specialization: overrides.specialization || 'Essence',
    elementalAffinity: overrides.elementalAffinity || 'Earth',
    recognition: overrides.recognition || 5,
    reputation: overrides.reputation || 5,
    icon: overrides.icon || '🏷️',
    signature: overrides.signature
  };
}

/**
 * Convert a backend BrandIdentity to a frontend Brand
 */
export function convertBackendBrandToFrontend(
  brandIdentity: BackendBrand
): SharedBrand {
  // Create a type-safe frontend brand
  return {
    id: brandIdentity.id,
    name: brandIdentity.name,
    description: brandIdentity.description,
    tagline: brandIdentity.tagline,
    colorPalette: brandIdentity.colorPalette,
    brandValues: brandIdentity.brandValues,
    specialization: brandIdentity.specialization as any, // Type assertion for backend to frontend conversion
    elementalAffinity: brandIdentity.elementalAffinity || 'Earth',
    recognition: Math.min(10, Math.round(brandIdentity.reputation / 10) + 2),
    reputation: Math.min(10, Math.round(brandIdentity.reputation / 10)),
    icon: '🏷️',
    signature: typeof brandIdentity.signature === 'string' ? 
      brandIdentity.signature : 
      (brandIdentity.signature ? 
        `Brand signature style` : 'Signature style')
  };
}

/**
 * Convert a frontend Brand to a backend BrandIdentity
 */
export function convertFrontendBrandToBackend(
  brand: SharedBrand,
  ownerId: string = 'player1'
): BackendBrand {
  // Create a type-safe backend brand identity
  return {
    id: brand.id,
    name: brand.name,
    ownerId: ownerId,
    tagline: brand.tagline,
    description: brand.description,
    foundingDate: Date.now(),
    logoPath: `/assets/brands/${brand.name.toLowerCase().replace(/\s+/g, '_')}.png`,
    colorPalette: brand.colorPalette,
    signature: {
      element: brand.elementalAffinity as ElementType,
      designStyle: 'elegant' as BackendDesignStyle,
      motif: 'motif' as any, // Type assertion for frontend to backend conversion
      materialPreference: 'glass' as any, // Type assertion for frontend to backend conversion
      specialEffect: 'shimmer' as any // Type assertion for frontend to backend conversion
    },
    specialization: brand.specialization as any, // Type assertion for frontend to backend conversion
    reputation: brand.reputation ? brand.reputation * 10 : 50,
    brandValues: brand.brandValues,
    aestheticKeywords: ['handcrafted', 'quality'],
    regularCustomers: brand.recognition ? brand.recognition * 2 : 10,
    marketingBonus: 5,
    brandLevelXp: 0,
    brandLevel: 1,
    achievements: []
  };
}

/**
 * Create a packaging design suitable for frontend components
 */
export function createPackagingDesign(
  id: string,
  name: string,
  material: SharedMaterial,
  designStyle: SharedDesignStyle,
  overrides: Partial<SharedPackagingDesign> = {}
): any { // Return type changed to any for flexibility
  // Create a packaging design object with all required properties
  const design = {
    id,
    name,
    material,
    designStyle: designStyle as any, // Use type assertion to avoid type error
    specialEffect: overrides.specialEffect || null,
    brand: overrides.brand || null,
    colors: overrides.colors || {
      base: '#8b6b3d',
      accent: '#f9f3e6'
    },
    qualityScore: overrides.qualityScore || 50,
    creationDate: overrides.creationDate || Date.now(),
    packagingType: overrides.packagingType || 'bottle',
    labelStyle: overrides.labelStyle || 'printed',
    designElements: overrides.designElements || [],
    specialEffects: overrides.specialEffects || []
  };
  
  return design;
}

/**
 * Create a product with packaging
 */
export function createPackagedProduct(
  id: string,
  name: string,
  type: string,
  category: string,
  packaging: SharedPackagingDesign,
  overrides: Partial<SharedProduct> = {}
): SharedProduct {
  return {
    id,
    name,
    description: overrides.description || `A ${name} product`,
    icon: overrides.icon || '🧪',
    type: type as any,
    category: category as any,
    value: overrides.value || 100,
    rarity: overrides.rarity || 'common',
    packaging,
    enhancedValue: calculateEnhancedValue(overrides.value || 100, packaging),
    potencyBoost: calculatePotencyBoost(packaging),
    marketAppeal: calculateMarketAppeal(packaging),
    shelfLife: calculateShelfLife(packaging),
    packagingEffects: generatePackagingEffects(packaging)
  };
}

/**
 * Convert a frontend PackagingDesign to a backend ProductPackaging
 */
export function toBackendPackaging(
  design: SharedPackagingDesign,
  creatorId: string = 'player1'
): any {
  // Safely extract material type with null checks
  let materialType: PackagingMaterial = 'glass'; // Default
  if (design.material && typeof design.material === 'object') {
    // Try to get materialType from the object
    materialType = (design.material.materialType as string as PackagingMaterial) || 'glass';
  }
  
  // Safely extract material quality with null checks
  let materialQuality: MaterialQuality = 'fine'; // Default
  if (design.material && typeof design.material === 'object' && 'materialQuality' in design.material) {
    materialQuality = (design.material.materialQuality as string as MaterialQuality) || 'fine';
  }
  
  // Safely extract design style with null checks
  let designStyleType = 'elegant' as string; // Default design style
  
  if (design.designStyle) {
    if (typeof design.designStyle === 'object') {
      // Try to get designStyle from the object if it exists and is a string
      const designStyleObj = design.designStyle as Record<string, any>;
      if (designStyleObj && 'designStyle' in designStyleObj && 
          typeof designStyleObj.designStyle === 'string') {
        designStyleType = designStyleObj.designStyle;
      }
    } else if (typeof design.designStyle === 'string') {
      // If designStyle is directly a string
      designStyleType = design.designStyle;
    }
  }
  
  // Safely extract special effects with null checks
  let specialEffects: PackagingEffect[] = [];
  if (design.specialEffect && typeof design.specialEffect === 'object') {
    // Try to get effectType from the special effect
    const effectType = design.specialEffect.effectType as string;
    if (effectType) {
      specialEffects.push(effectType as PackagingEffect);
    }
  }
  
  // Use existing specialEffects array if available
  if (design.specialEffects && Array.isArray(design.specialEffects) && design.specialEffects.length > 0) {
    specialEffects = design.specialEffects as unknown as PackagingEffect[];
  }
  
  // Safely extract packaging type with null checks
  const packagingType = design.packagingType || 'bottle';
  
  // Safely extract label style with null checks
  const labelStyle = design.labelStyle || 'printed';
  
  // Safely extract design elements with null checks
  const designElements = design.designElements || ['motif'];
  
  // Extract colors with null safety
  const baseColor = design.colors?.base || '#8b6b3d';
  const accentColor = design.colors?.accent || '#f9f3e6';
  
  // Create the backend packaging object with complete type assertions
  const backendPackaging: ProductPackaging = {
    id: design.id,
    name: design.name,
    designName: design.name, // Often the same
    creatorId,
    material: materialType,
    materialQuality: materialQuality,
    packagingType: packagingType as PackagingType,
    designStyle: designStyleType,
    labelStyle: labelStyle as LabelStyle,
    specialEffects,
    colorScheme: [baseColor, accentColor],
    elementalAffinity: 'Earth' as ElementType, // Default element
    designElements: designElements as any, // Type assertion for compatibility
    rarity: 'uncommon',
    bonuses: {
      marketValue: 50,
      potency: 25,
      attractiveness: 75,
      durability: 80,
      prestige: 60
    },
    lore: '',
    imagePath: '',
    creationDate: design.creationDate || Date.now(),
    collectorValue: 100,
    componentIds: [] // Required property
  };
  
  return backendPackaging;
}

/**
 * Convert a backend ProductPackaging to a frontend PackagingDesign
 */
export function toFrontendPackaging(
  packaging: ProductPackaging,
  materials: SharedMaterial[] = [],
  designStyles: SharedDesignStyle[] = [],
  effects: SharedSpecialEffect[] = [],
  brands: SharedBrand[] = []
): any { // Changed return type to any for compatibility
  // Try to find or create a matching material
  let material: SharedMaterial;
  // Try to find by materialType string matching
  const matchedMaterial = materials.find(m => 
    (m.materialType as string) === packaging.material && 
    (m.materialQuality as string) === packaging.materialQuality
  );
  
  if (matchedMaterial) {
    material = matchedMaterial;
  } else {
    // Create a new material with the right properties
    // Force types to be compatible
    const safeMaterial = packaging.material as string as PackagingMaterial;
    // Convert materialQuality to a safe value
    const safeQuality = (
      packaging.materialQuality === 'common' || 
      packaging.materialQuality === 'fine' || 
      packaging.materialQuality === 'excellent' || 
      packaging.materialQuality === 'masterwork' || 
      packaging.materialQuality === 'legendary'
    ) ? packaging.materialQuality as MaterialQuality : 'common' as MaterialQuality;
    
    material = createMaterial(
      `material_${Date.now()}`,
      `${capitalizeFirst(packaging.materialQuality as string)} ${capitalizeFirst(packaging.material as string)}`,
      safeMaterial,
      safeQuality
    );
  }
  
  // Try to find or create a matching design style
  let designStyle: SharedDesignStyle;
  // Try to find by designStyle string matching
  const matchedStyle = designStyles.find(s => 
    (s.designStyle as string) === packaging.designStyle
  );
  
  if (matchedStyle) {
    designStyle = matchedStyle;
  } else {
    // Create a new design style with the right properties
    // Convert to a valid design style string - handle any type safely
    const designStyleText = typeof packaging.designStyle === 'string' ? 
      packaging.designStyle as string : 'elegant';
        
    const safeStyleName = capitalizeFirst(designStyleText);
    
    // Create with a valid BackendDesignStyle value
    designStyle = createDesignStyle(
      `style_${Date.now()}`,
      `${safeStyleName} Style`,
      designStyleText as BackendDesignStyle
    );
  }
  
  // Try to find or create a matching special effect
  let specialEffect: SharedSpecialEffect | null = null;
  if (packaging.specialEffects && packaging.specialEffects.length > 0) {
    const firstEffect = packaging.specialEffects[0];
    // Try to find by effectType string matching - convert to string for comparison
    const firstEffectStr = typeof firstEffect === 'string' ? firstEffect : 'shimmer';
    const matchedEffect = effects.find(e => 
      (e.effectType as string) === firstEffectStr
    );
    
    if (matchedEffect) {
      specialEffect = matchedEffect;
    } else {
      // Create a new special effect with the right properties
      // Force the effect to be type compatible
      const safeEffect = firstEffectStr as any as PackagingEffect;
      specialEffect = createSpecialEffect(
        `effect_${Date.now()}`,
        `${capitalizeFirst(firstEffectStr)} Effect`,
        safeEffect
      );
    }
  }
  
  // Get colors from color scheme with null safety
  const baseColor = packaging.colorScheme && packaging.colorScheme.length > 0 
    ? packaging.colorScheme[0] 
    : '#8b6b3d';
  
  const accentColor = packaging.colorScheme && packaging.colorScheme.length > 1 
    ? packaging.colorScheme[1] 
    : '#f9f3e6';
  
  // Create a complete frontend packaging design - using explicit any to avoid type issues
  const design: any = {
    id: packaging.id,
    name: packaging.name,
    material,
    designStyle: designStyle as any, // Type assertion to resolve type compatibility
    specialEffect,
    // Add frontend-specific properties
    colors: {
      base: baseColor,
      accent: accentColor
    },
    qualityScore: calculateQualityScore(packaging),
    // Add other properties required by the PackagingDesign interface
    creationDate: packaging.creationDate || Date.now(),
    packagingType: packaging.packagingType,
    labelStyle: packaging.labelStyle,
    specialEffects: packaging.specialEffects,
    designElements: packaging.designElements
  };
  
  return design;
}

/**
 * Apply a packaging design to a product
 */
export function applyPackagingToProduct(
  product: SharedProduct,
  design: SharedPackagingDesign
): SharedProduct {
  return {
    ...product,
    id: `${product.id}_pkg_${Date.now()}`,
    packaging: design,
    enhancedValue: calculateEnhancedValue(product.value, design),
    potencyBoost: calculatePotencyBoost(design),
    marketAppeal: calculateMarketAppeal(design),
    shelfLife: calculateShelfLife(design),
    packagingEffects: generatePackagingEffects(design)
  };
}

// Helper functions

/**
 * Calculate the quality score of a product packaging
 */
function calculateQualityScore(packaging: ProductPackaging): number {
  const bonuses = packaging.bonuses;
  return Math.min(100, Math.round(
    (bonuses.marketValue + bonuses.potency + bonuses.attractiveness + bonuses.durability / 2 + bonuses.prestige) / 2
  ));
}

/**
 * Calculate enhanced value based on packaging quality
 * Safe for use with both frontend and backend objects
 */
function calculateEnhancedValue(baseValue: number, design: any): number {
  let multiplier = 1.0;
  
  // Handle both frontend PackagingDesign and backend ProductPackaging
  const qualityScore = 
    typeof design.qualityScore === 'number' ? design.qualityScore : 
    (design.bonuses && typeof design.bonuses.marketValue === 'number') ? 
    Math.min(100, (design.bonuses.marketValue + 
               (design.bonuses.potency || 0) + 
               (design.bonuses.attractiveness || 0)) / 2) : 50;
  
  multiplier += qualityScore / 100;
  return Math.round(baseValue * multiplier);
}

/**
 * Calculate potency boost from packaging
 * Safe for use with both frontend and backend objects
 */
function calculatePotencyBoost(design: any): number {
  let boost = 0;
  
  // Handle quality score from either frontend or backend object
  const qualityScore = 
    typeof design.qualityScore === 'number' ? design.qualityScore : 
    (design.bonuses && typeof design.bonuses.potency === 'number') ? 
    design.bonuses.potency * 2 : 50;
  
  boost += Math.floor(qualityScore / 10);
  
  // Handle specialEffect from frontend object
  if (design.specialEffect && typeof design.specialEffect === 'object' && 
      typeof design.specialEffect.potencyBonus === 'number') {
    boost += design.specialEffect.potencyBonus;
  }
  
  // Handle specialEffects from backend object
  if (design.specialEffects && Array.isArray(design.specialEffects) && design.specialEffects.length > 0) {
    // This is a simplification - in a real app you'd look up the effect values
    boost += design.specialEffects.length * 5;
  }
  
  return boost;
}

/**
 * Calculate market appeal from packaging
 * Safe for use with both frontend and backend objects
 */
function calculateMarketAppeal(design: any): number {
  let appeal = 50; // Base appeal
  
  // Handle designStyle from frontend object
  if (design.designStyle && typeof design.designStyle === 'object' && 
      typeof design.designStyle.customerAppeal === 'number') {
    appeal += design.designStyle.customerAppeal;
  }
  
  // Handle bonuses from backend object
  if (design.bonuses && typeof design.bonuses.attractiveness === 'number') {
    appeal += design.bonuses.attractiveness / 2;
  }
  
  // Handle material from frontend object
  if (design.material && typeof design.material === 'object' && 
      typeof design.material.qualityLevel === 'number') {
    appeal += design.material.qualityLevel;
  }
  
  // Handle brand from frontend object
  if (design.brand && typeof design.brand === 'object') {
    appeal += 10;
  }
  
  return Math.min(100, appeal);
}

/**
 * Calculate shelf life from packaging
 * Safe for use with both frontend and backend objects
 */
function calculateShelfLife(design: any): number {
  let shelfLife = 30; // Base shelf life in days
  
  // Handle material from frontend object
  if (design.material && typeof design.material === 'object' && 
      typeof design.material.durability === 'number') {
    shelfLife += design.material.durability * 5;
  }
  
  // Handle bonuses from backend object
  if (design.bonuses && typeof design.bonuses.durability === 'number') {
    shelfLife += design.bonuses.durability / 5;
  }
  
  // Handle specialEffect from frontend object
  const hasPreservationEffect = 
    (design.specialEffect && 
     typeof design.specialEffect === 'object' && 
     design.specialEffect.effectType === 'preservation') ||
    (design.specialEffects && 
     Array.isArray(design.specialEffects) && 
     design.specialEffects.some((effect: any) => 
       typeof effect === 'string' ? effect === 'preservation' : 
       typeof effect === 'object' && effect.effectType === 'preservation'
     ));
  
  if (hasPreservationEffect) {
    shelfLife += 60; // 2 months extra
  }
  
  return shelfLife;
}

/**
 * Generate descriptive packaging effects
 * Safe for both frontend and backend objects
 */
function generatePackagingEffects(design: any): string[] {
  const effects: string[] = [];
  
  // Handle material effects from both frontend and backend formats
  let materialType: string | undefined;
  
  // Try to get materialType from frontend format
  if (design.material && typeof design.material === 'object' && design.material.materialType) {
    materialType = design.material.materialType as string;
  }
  // Try to get material from backend format
  else if (design.material && typeof design.material === 'string') {
    materialType = design.material;
  }
  
  if (materialType) {
    switch (materialType) {
      case 'glass':
        effects.push('Clear visibility of contents');
        break;
      case 'ceramic':
        effects.push('Excellent temperature insulation');
        break;
      case 'paper':
        effects.push('Lightweight and recyclable');
        break;
      case 'wood':
        effects.push('Natural and sustainable');
        break;
      case 'metal':
        effects.push('Durable protection and premium feel');
        break;
      case 'crystal':
        effects.push('Enhances magical properties');
        break;
      case 'porcelain':
        effects.push('Refined and pristine presentation');
        break;
      default:
        effects.push('Standard packaging protection');
    }
  }
  
  // Handle design style effects from both frontend and backend formats
  let designStyleType: string | undefined;
  
  // Try to get designStyle from frontend format
  if (design.designStyle && typeof design.designStyle === 'object' && design.designStyle.designStyle) {
    designStyleType = design.designStyle.designStyle as string;
  }
  // Try to get designStyle from backend format
  else if (design.designStyle && typeof design.designStyle === 'string') {
    designStyleType = design.designStyle;
  }
  
  if (designStyleType) {
    switch (designStyleType) {
      case 'minimalist':
        effects.push('Clean, modern appearance');
        break;
      case 'elegant':
        effects.push('Sophisticated luxury appearance');
        break;
      case 'vintage':
        effects.push('Classic, trusted appearance');
        break;
      case 'mystical':
        effects.push('Otherworldly, magical presence');
        break;
      case 'botanical':
        effects.push('Natural, plant-inspired design');
        break;
      case 'celestial':
        effects.push('Cosmic and star-themed look');
        break;
      default:
        effects.push('Appealing visual design');
    }
  }
  
  // Handle special effects from both frontend and backend formats
  // Check frontend specialEffect object
  if (design.specialEffect && typeof design.specialEffect === 'object' && design.specialEffect.effectType) {
    const effectType = design.specialEffect.effectType as string;
    addSpecialEffectDescription(effects, effectType);
  }
  
  // Check backend specialEffects array
  if (design.specialEffects && Array.isArray(design.specialEffects) && design.specialEffects.length > 0) {
    // Add description for first effect only to avoid clutter
    const firstEffect = design.specialEffects[0];
    const effectType = typeof firstEffect === 'string' ? firstEffect : 
                      typeof firstEffect === 'object' && firstEffect.effectType ? 
                      firstEffect.effectType : null;
    
    if (effectType) {
      addSpecialEffectDescription(effects, effectType);
    }
  }
  
  // Handle package type effects
  const packagingType = design.packagingType;
  if (packagingType) {
    switch (packagingType) {
      case 'bottle':
        effects.push('Liquid contents preserved perfectly');
        break;
      case 'jar':
        effects.push('Airtight seal maintains freshness');
        break;
      case 'pouch':
        effects.push('Portable and easy to use');
        break;
      case 'box':
        effects.push('Sturdy structure protects contents');
        break;
      case 'vial':
        effects.push('Concentrates potency of contents');
        break;
      default:
        // No additional effect added
        break;
    }
  }
  
  // Add brand effect if present (try both frontend and backend formats)
  // Frontend format with brand object
  if (design.brand && typeof design.brand === 'object' && design.brand.name) {
    effects.push(`${design.brand.name} quality guarantee`);
  }
  
  return effects;
}

// Helper function to add special effect description
function addSpecialEffectDescription(effects: string[], effectType: string): void {
  switch (effectType) {
    case 'shimmer':
      effects.push('Subtle glittering effect');
      break;
    case 'glow':
      effects.push('Enchanting luminescence');
      break;
    case 'swirling':
      effects.push('Mesmerizing swirling patterns');
      break;
    case 'aromatic':
      effects.push('Pleasant scent enhances experience');
      break;
    case 'bubbling':
      effects.push('Continuous effervescence shows active contents');
      break;
    case 'frost':
      effects.push('Delicate frost patterns form on surface');
      break;
    default:
      effects.push('Magical visual enhancement');
  }
}

/**
 * Capitalize the first letter of a string
 */
function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}