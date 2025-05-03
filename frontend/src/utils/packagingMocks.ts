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
  Product,
  PackagingType as SharedPackagingType,
  LabelStyle as SharedLabelStyle,
  PackageType
} from 'coven-shared';

// Import BrandIdentity from packagingSystem for backend compatibility
import { BrandIdentity } from '../../../shared/src/packagingSystem';

// Define shared/backend compatible types
type SharedPackagingMaterial = 
  'glass' | 'pottery' | 'paper' | 'wood' | 'metal' | 
  'cloth' | 'crystal' | 'porcelain' | 'silk' | 'leather' |
  'bamboo' | 'stone' | 'shell' | 'ceramic' | 'parchment';

type SharedDesignStyle = 
  'minimalist' | 'elegant' | 'rustic' | 'mystical' | 'ornate' |
  'celestial' | 'botanical' | 'geometric' | 'vintage' | 'folk' |
  'alchemical' | 'artistic' | 'whimsical' | 'seasonal' | 'abstract';

type SharedPackagingEffect = 
  'shimmer' | 'glow' | 'mist' | 'bubbling' | 'swirling' |
  'aura' | 'crystalline' | 'magnetic' | 'reflective' | 'iridescent' |
  'levitating' | 'frost' | 'heat-reactive' | 'aromatic' | 'musical' |
  'translucent' | 'changing' | 'shadowy' | 'prismatic' | 'layered';

type SharedMaterialQuality = 'common' | 'fine' | 'excellent' | 'masterwork' | 'legendary';

// Use the shared packaging material type with frontend adapter
export type PackagingMaterial = SharedPackagingMaterial | 'fabric';

// Use the shared design style type with frontend adapter
export type DesignStyleType = SharedDesignStyle | 'modern' | 'traditional';

// Use the shared packaging effect type with frontend adapter
export type PackagingEffect = SharedPackagingEffect | 'preservation' | 'potency' | 'presentation' | 'protection' | 'enhancement' | 'resonance' | 'attraction' | 'harmony';

// Use the shared material quality type
export type MaterialQuality = 'common' | 'fine' | 'excellent' | 'masterwork' | 'legendary';

// Use the shared packaging type with frontend adapter
export type PackagingType = SharedPackagingType;

// Use the shared label style with frontend adapter
export type LabelStyle = SharedLabelStyle;

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

// Backend Brand Identity type adapter (for compatibility)
export interface BackendBrand {
  id: string;
  name: string;
  description: string;
  tagline: string;
  colorPalette: string[];
  brandValues: string[];
  specialization: AtelierSpecialization;
  elementalAffinity?: ElementType;
  signature?: {
    element: ElementType;
    designStyle: string;
    motif: string;
    materialPreference: string;
    specialEffect: string;
  } | string;
  reputation?: number;
  
  // Required fields from shared.BrandIdentity that we can mock or default
  ownerId?: string;
  foundingDate?: number;
  logoPath?: string;
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
  // Convert materialType to SharedPackagingMaterial if possible
  const safeType: SharedPackagingMaterial = 
    (materialType === 'glass' || materialType === 'ceramic' || materialType === 'wood' || 
     materialType === 'paper' || materialType === 'metal' || materialType === 'crystal' || 
     materialType === 'leather' || materialType === 'pottery' || materialType === 'porcelain' || 
     materialType === 'silk' || materialType === 'bamboo' || materialType === 'stone' || 
     materialType === 'shell' || materialType === 'parchment') ? 
     materialType as SharedPackagingMaterial : 'glass';
  
  // Convert materialQuality to SharedMaterialQuality if possible
  const safeQuality: SharedMaterialQuality = 
    (overrides.materialQuality === 'common' || overrides.materialQuality === 'fine' || 
     overrides.materialQuality === 'excellent' || overrides.materialQuality === 'masterwork' || 
     overrides.materialQuality === 'legendary') ? 
     overrides.materialQuality as SharedMaterialQuality : 'common';
  
  return {
    id: id,
    name: name,
    description: overrides.description || `A ${name} packaging material`,
    durability: overrides.durability || Math.floor(Math.random() * 7) + 3,
    qualityLevel: overrides.qualityLevel || Math.floor(Math.random() * 7) + 3,
    specialProperty: overrides.specialProperty,
    quantity: overrides.quantity || 1,
    icon: overrides.icon || '📦',
    materialType: safeType,
    materialQuality: safeQuality,
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
  // Convert designStyle to SharedDesignStyle if possible
  const safeStyle: SharedDesignStyle = 
    (designStyle === 'minimalist' || designStyle === 'elegant' || designStyle === 'rustic' || 
     designStyle === 'mystical' || designStyle === 'ornate' || designStyle === 'celestial' || 
     designStyle === 'botanical' || designStyle === 'geometric' || designStyle === 'vintage' || 
     designStyle === 'folk' || designStyle === 'alchemical' || designStyle === 'artistic' || 
     designStyle === 'whimsical' || designStyle === 'seasonal' || designStyle === 'abstract') ? 
     designStyle as SharedDesignStyle : 'elegant';
  
  return {
    id: id,
    name: name,
    description: overrides.description || `A ${name} design style`,
    complexityLevel: overrides.complexityLevel || Math.floor(Math.random() * 7) + 3,
    customerAppeal: overrides.customerAppeal || Math.floor(Math.random() * 7) + 3,
    marketBonus: overrides.marketBonus,
    icon: overrides.icon || '🎨',
    designStyle: safeStyle,
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
  // Map frontend effect types to shared effect types where possible
  const getSharedEffectType = (effect: PackagingEffect): SharedPackagingEffect => {
    // Direct matches
    if (effect === 'shimmer' || effect === 'glow' || effect === 'mist' || 
        effect === 'bubbling' || effect === 'swirling' || effect === 'aura' || 
        effect === 'crystalline' || effect === 'magnetic' || effect === 'reflective' || 
        effect === 'iridescent' || effect === 'levitating' || effect === 'frost' || 
        effect === 'heat-reactive' || effect === 'aromatic' || effect === 'musical' || 
        effect === 'translucent' || effect === 'changing' || effect === 'shadowy' || 
        effect === 'prismatic' || effect === 'layered') {
      return effect as SharedPackagingEffect;
    }
    
    // Map frontend effect types to similar shared types
    switch (effect) {
      case 'preservation': return 'frost';
      case 'potency': return 'glow';
      case 'presentation': return 'shimmer';
      case 'protection': return 'crystalline';
      case 'enhancement': return 'aura';
      case 'resonance': return 'magnetic';
      case 'attraction': return 'iridescent';
      case 'harmony': return 'swirling';
      default: return 'shimmer';
    }
  };
  
  // Get compatible shared effect type
  const safeEffectType = getSharedEffectType(effectType);
  
  return {
    id: id,
    name: name,
    description: overrides.description || `A ${name} special effect`,
    rarity: overrides.rarity || Math.floor(Math.random() * 7) + 3,
    power: overrides.power || Math.floor(Math.random() * 7) + 3,
    duration: overrides.duration,
    quantity: overrides.quantity || 1,
    icon: overrides.icon || '✨',
    effectType: safeEffectType,
    potencyBonus: overrides.potencyBonus || 10,
    durabilityEffect: overrides.durabilityEffect || 5,
    specializationAffinity: overrides.specializationAffinity
  };
}

/**
 * Create a mock brand instance for frontend use
 */
export function createMockBrand(
  id: string,
  name: string,
  overrides: Partial<Brand> = {}
): Brand {
  // Create a frontend brand with just the needed fields
  const frontendBrand: Brand = {
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
  
  return frontendBrand;
}

/**
 * Create a mock backend brand for backend compatibility
 * This function directly returns a BrandIdentity object for backend use
 */
export function createMockBackendBrand(
  id: string,
  name: string,
  overrides: Partial<BrandIdentity> = {}
): BrandIdentity {
  // Create a backend brand with all required fields
  const brandIdentity: BrandIdentity = {
    id: id,
    name: name,
    description: overrides.description || `The ${name} brand identity`,
    tagline: overrides.tagline || `${name} - Quality you can trust`,
    colorPalette: overrides.colorPalette || ['#8b6b3d', '#f9f3e6', '#3d5a8b'],
    brandValues: overrides.brandValues || ['Quality', 'Trust', 'Tradition'],
    specialization: overrides.specialization || 'Essence',
    reputation: overrides.reputation || 50,
    
    // Optional fields with defaults
    ownerId: overrides.ownerId || 'player1',
    foundingDate: overrides.foundingDate || Date.now(),
    logoPath: overrides.logoPath || '/assets/brands/default.png',
    aestheticKeywords: overrides.aestheticKeywords || ['elegant', 'quality', 'natural'],
    regularCustomers: overrides.regularCustomers || 20,
    productLines: overrides.productLines || [{
      name: `${name} Essentials`,
      description: 'Our flagship product line',
      itemCategory: 'potion',
      pricePoint: 'standard',
      targetAudience: 'General customers'
    }],
    marketingBonus: overrides.marketingBonus || 5,
    brandLevelXp: overrides.brandLevelXp || 0,
    brandLevel: overrides.brandLevel || 1,
    achievements: overrides.achievements || [],
    
    // Frontend compatibility properties
    elementalAffinity: overrides.elementalAffinity || 'Earth',
    icon: overrides.icon || '🏷️',
    recognition: overrides.recognition || 7,
    
    // Signature field
    signature: overrides.signature || 'Signature style'
  };
  
  return brandIdentity;
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
  // Create a strictly typed PackagingDesign with correct fields
  const design: any = {
    id: id,
    name: name,
    material: material,
    // Force the design style to be compatible
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
  
  return design as PackagingDesign;
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
): any {
  // Extract material type
  let materialType: PackagingMaterial = 'glass'; // Default
  if (typeof design.material === 'string') {
    materialType = design.material as PackagingMaterial;
  } else if (design.material && typeof design.material === 'object') {
    materialType = (design.material as any).materialType as PackagingMaterial || 'glass';
  }
  
  // Extract design style as string
  let designStyleType = 'elegant' as string; // Default as plain string
  if (typeof design.designStyle === 'string') {
    designStyleType = design.designStyle;
  } else if (design.designStyle && typeof design.designStyle === 'object') {
    if ((design.designStyle as any).designStyle && typeof (design.designStyle as any).designStyle === 'string') {
      designStyleType = (design.designStyle as any).designStyle;
    }
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
  
  // Get a safe material quality value
  const safeMaterialQuality = 'fine' as SharedMaterialQuality; // Default to 'fine' which is in SharedMaterialQuality
  
  // Create a backend packaging object with all required properties
  const backendPackaging: any = {
    id: design.id,
    name: design.name,
    designName: design.name, // Often the same
    creatorId: creatorId,
    materialType: materialType,
    materialQuality: safeMaterialQuality,
    packagingType: (design as any).packagingType || 'bottle',
    designStyle: designStyleType,
    labelStyle: (design as any).labelStyle || 'printed',
    specialEffects: effectsArray,
    colorScheme: colorScheme,
    rarity: 'uncommon', // Added required property
    elementalAffinity: 'Earth', // Added required property
    bonuses: { // Added required property
      marketValue: 50,
      potency: 25,
      attractiveness: 75,
      durability: 80,
      prestige: 60
    },
    lore: '', // Added required property
    imagePath: '', // Added required property
    creationDate: Date.now(), // Added required property
    collectorValue: 100, // Added required property
    
    // Optional properties
    brandIdentity: brandIdentity,
    designElements: (design as any).designElements || [],
    qualityScore: design.qualityScore || 50
  };
  
  return backendPackaging;
}

/**
 * Helper function to convert a backend brand to a frontend brand with correct typing
 */
export function convertBackendBrandToFrontend(
  brandIdentity: BackendBrand
): Brand {
  // Create a frontend brand with the right properties
  const frontendBrand: Brand = {
    id: brandIdentity.id,
    name: brandIdentity.name,
    description: brandIdentity.description,
    tagline: brandIdentity.tagline,
    colorPalette: brandIdentity.colorPalette,
    brandValues: brandIdentity.brandValues,
    specialization: brandIdentity.specialization as any, // Type assertion
    elementalAffinity: brandIdentity.elementalAffinity || 'Earth',
    icon: '🏷️', // Frontend UI property
    recognition: Math.min(10, Math.round((brandIdentity.regularCustomers || 20) / 10) + 2),
    reputation: Math.min(10, Math.round((brandIdentity.reputation || 50) / 10)),
    signature: typeof brandIdentity.signature === 'string' ? 
      brandIdentity.signature : 
      brandIdentity.signature ? 
        `${brandIdentity.signature.motif} in ${brandIdentity.signature.designStyle} style` : 
        'Signature style'
  };
  
  return frontendBrand;
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
  const foundStyle = designStyles.find(s => {
    if (typeof s.designStyle === 'string' && typeof packaging.designStyle === 'string') {
      return s.designStyle === packaging.designStyle;
    }
    return false;
  });
  
  if (foundStyle) {
    designStyle = foundStyle;
  } else {
    // Convert the design style to string if needed
    const designStyleStr = (typeof packaging.designStyle === 'string') ? 
      packaging.designStyle as string : 'elegant';
    
    // Get a compatible design style type - use any assertion
    const safeDesignStyle = designStyleStr || 'elegant';
    
    // Force safeDesignStyle to be a valid DesignStyleType with any assertion
    const validDesignStyle = safeDesignStyle as any as DesignStyleType;
    
    designStyle = createMockDesignStyle(
      `style_${Date.now()}`,
      `${safeDesignStyle.charAt(0).toUpperCase() + safeDesignStyle.slice(1)} Style`,
      validDesignStyle
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
  // Safely convert packaging type
  const safePackagingType = 
    (packaging.packagingType === 'bottle' ||
     packaging.packagingType === 'jar' ||
     packaging.packagingType === 'pouch' ||
     packaging.packagingType === 'box' ||
     packaging.packagingType === 'tin' ||
     packaging.packagingType === 'vial' ||
     packaging.packagingType === 'sachet' ||
     packaging.packagingType === 'envelope' ||
     packaging.packagingType === 'chest' ||
     packaging.packagingType === 'basket' ||
     packaging.packagingType === 'amphora' ||
     packaging.packagingType === 'gourd' ||
     packaging.packagingType === 'scroll' ||
     packaging.packagingType === 'teacup' ||
     packaging.packagingType === 'flask' ||
     packaging.packagingType === 'pendant' ||
     packaging.packagingType === 'amulet' ||
     packaging.packagingType === 'locket' ||
     packaging.packagingType === 'case') ? 
    packaging.packagingType as SharedPackagingType : 'bottle';
  
  // Safely convert label style
  const safeLabelStyle = 
    (packaging.labelStyle === 'handwritten' ||
     packaging.labelStyle === 'printed' ||
     packaging.labelStyle === 'etched' ||
     packaging.labelStyle === 'embossed' ||
     packaging.labelStyle === 'stamped' ||
     packaging.labelStyle === 'inlaid' ||
     packaging.labelStyle === 'burned' ||
     packaging.labelStyle === 'painted' ||
     packaging.labelStyle === 'calligraphy' ||
     packaging.labelStyle === 'illustrated' ||
     packaging.labelStyle === 'wax-sealed' ||
     packaging.labelStyle === 'engraved' ||
     packaging.labelStyle === 'ribboned' ||
     packaging.labelStyle === 'hidden' ||
     packaging.labelStyle === 'glowing') ? 
    packaging.labelStyle as SharedLabelStyle : 'printed';
  
  // Convert special effects to shared format safely
  const safeSpecialEffects = Array.isArray(packaging.specialEffects) ? 
    packaging.specialEffects.map(effect => {
      if (typeof effect === 'string') {
        return effect;
      }
      return 'shimmer'; // Default effect
    }) : [];
  
  // Create result with any to bypass type checking during creation
  const result: any = {
    id: packaging.id,
    name: packaging.name,
    material: material,
    designStyle: (typeof designStyle.designStyle === 'string') ? 
                 designStyle.designStyle : 'elegant',
    specialEffect: specialEffect,
    brand: brand,
    colors: colors,
    qualityScore: packaging.qualityScore || 50,
    packagingType: safePackagingType,
    labelStyle: safeLabelStyle,
    specialEffects: safeSpecialEffects,
    creationDate: Date.now()
  };
  
  // Return the result as a PackagingDesign to satisfy the type
  return result as PackagingDesign;
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
  
  // Add appeal from design style - handle both object and string formats
  if (design.designStyle) {
    if (typeof design.designStyle === 'object' && design.designStyle && 'customerAppeal' in design.designStyle) {
      appeal += (design.designStyle as DesignStyle).customerAppeal || 5;
    } else if (typeof design.designStyle === 'string') {
      // Add a default value based on design style
      appeal += 5;
    } else {
      // Default case
      appeal += 5;
    }
  }
  
  // Add appeal from brand recognition
  if (design.brand) {
    if (typeof design.brand === 'object' && design.brand.recognition) {
      appeal += design.brand.recognition;
    } else {
      // Add default value
      appeal += 5;
    }
  }
  
  // Cap appeal at 100
  return Math.min(100, appeal);
}

/**
 * Calculate shelf life based on packaging
 */
function calculateShelfLife(design: PackagingDesign): number {
  let shelfLife = 30; // Base shelf life in days
  
  // Add shelf life from material durability - handle both object and string formats
  if (design.material) {
    if (typeof design.material === 'object' && design.material.durability) {
      shelfLife += design.material.durability * 5;
    } else if (typeof design.material === 'string') {
      // Add a default value
      shelfLife += 25; // 5 days * default durability of 5
    }
  }
  
  // Add shelf life from preservation or frost effect
  if (design.specialEffects) {
    // Check for preservation or frost effects which increase shelf life
    const hasPreservationEffect = Array.isArray(design.specialEffects) && 
      design.specialEffects.some(effect => {
        if (typeof effect === 'string') {
          return effect === 'frost' || effect === 'preservation';
        }
        return false;
      });
    
    if (hasPreservationEffect) {
      shelfLife += 60; // 2 months extra
    }
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
  
  // Add effect for design style - handle both object and string formats
  if (design.designStyle) {
    // Get the style type safely handling both string and object formats
    let styleType: string;
    
    if (typeof design.designStyle === 'string') {
      styleType = design.designStyle;
    } else if (design.designStyle && typeof design.designStyle === 'object') {
      // Safely access the designStyle property with checks and type assertions
      if (design.designStyle && 'designStyle' in design.designStyle && 
          typeof (design.designStyle as any).designStyle === 'string') {
        styleType = (design.designStyle as any).designStyle;
      } else {
        styleType = 'elegant'; // Default
      }
    } else {
      styleType = 'elegant'; // Default
    }
    
    // Add effect based on the style type
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
      case 'geometric':
        effects.push('Precise, mathematical patterns');
        break;
      case 'botanical':
        effects.push('Natural, plant-inspired elements');
        break;
      case 'celestial':
        effects.push('Star and cosmic patterns');
        break;
      case 'vintage':
        effects.push('Classic, nostalgic aesthetics');
        break;
      case 'folk':
        effects.push('Cultural, traditional art forms');
        break;
      case 'alchemical':
        effects.push('Scientific and symbolic markings');
        break;
      case 'artistic':
        effects.push('Creative, expressive design');
        break;
      case 'seasonal':
        effects.push('Time-specific thematic elements');
        break;
      case 'abstract':
        effects.push('Non-representational artistic forms');
        break;
      default:
        effects.push('Appealing visual design');
    }
  }
  
  // Add effect for special effects - handle both object and string formats
  if (design.specialEffect) {
    // Get the effect type safely handling both string and object formats
    let effectType: string;
    
    if (typeof design.specialEffect === 'string') {
      effectType = design.specialEffect;
    } else if (typeof design.specialEffect === 'object') {
      effectType = (typeof design.specialEffect.effectType === 'string') ? 
        design.specialEffect.effectType : 'enhancement';
    } else {
      effectType = 'enhancement'; // Default
    }
    
    // Add effect based on the effect type 
    // Handle both shared and custom effect types
    switch (effectType) {
      // Standard shared effects
      case 'shimmer': effects.push('Subtle glittering effect'); break;
      case 'glow': effects.push('Soft illumination of contents'); break;
      case 'mist': effects.push('Fresh vapor surrounding package'); break;
      case 'bubbling': effects.push('Active ingredient effects'); break;
      case 'swirling': effects.push('Gentle pattern movement'); break;
      case 'aura': effects.push('Magical energy field'); break;
      case 'crystalline': effects.push('Crystal formations on surface'); break;
      case 'magnetic': effects.push('Subtle magnetic pull'); break;
      case 'reflective': effects.push('Mirror-like surface effects'); break;
      case 'iridescent': effects.push('Color-shifting appearance'); break;
      case 'levitating': effects.push('Slight hovering effect'); break;
      case 'frost': effects.push('Delicate frost patterns'); break;
      case 'heat-reactive': effects.push('Temperature responsive design'); break;
      case 'aromatic': effects.push('Pleasant scent release'); break;
      case 'musical': effects.push('Soft tones when opened'); break;
      case 'translucent': effects.push('Partial transparency effects'); break;
      case 'changing': effects.push('Slowly transforming design'); break;
      case 'shadowy': effects.push('Moving shadow patterns'); break;
      case 'prismatic': effects.push('Rainbow light splitting'); break;
      case 'layered': effects.push('Multiple depth sensations'); break;
      
      // Custom frontend effects
      case 'preservation': effects.push('Extended product shelf life'); break;
      case 'potency': effects.push('Enhanced magical potency'); break;
      case 'presentation': effects.push('Impressive market presentation'); break;
      case 'protection': effects.push('Superior product protection'); break;
      case 'enhancement': effects.push('Improved product efficacy'); break;
      case 'resonance': effects.push('Magical energy amplification'); break;
      case 'attraction': effects.push('Increased customer interest'); break;
      case 'harmony': effects.push('Balanced ingredient interaction'); break;
      
      default: effects.push('Special product enhancement');
    }
  }
  
  // Add effect for brand
  if (design.brand) {
    effects.push(`${design.brand.name} brand recognition`);
  }
  
  return effects;
}