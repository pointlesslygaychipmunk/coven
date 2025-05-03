import React, { useState, useEffect } from 'react';
import './PackagingDesigner.css';
import { 
  Material, 
  DesignStyle, 
  SpecialEffect,
  Brand,
  PackagingDesign,
  Product,
} from 'coven-shared';

// Define types that might be missing from the shared module
type PackagingType = 
  'bottle' | 'jar' | 'pouch' | 'box' | 'tin' | 'vial' | 'sachet' |
  'envelope' | 'chest' | 'basket' | 'amphora' | 'gourd' | 'scroll' |
  'teacup' | 'flask' | 'pendant' | 'amulet' | 'locket' | 'case';

type LabelStyle = 
  'handwritten' | 'printed' | 'etched' | 'embossed' | 'stamped' |
  'inlaid' | 'burned' | 'painted' | 'calligraphy' | 'illustrated' |
  'wax-sealed' | 'engraved' | 'ribboned' | 'hidden' | 'glowing';

// Import or mock packaging utility functions
// Since these might be missing, we'll create compatibility functions
function applyPackagingDesignToProduct(product: Product, design: PackagingDesign): Product {
  // Create a new product with the design applied
  return {
    ...product,
    id: `${product.id}_pkg_${Date.now()}`,
    // Make sure to include all required properties for PackageType
    packaging: {
      id: design.id || `design_${Date.now()}`,
      name: design.name || 'Package Design',
      // Ensure required properties are set properly
      colors: {
        base: design.colors?.base || '#8b6b3d',
        accent: design.colors?.accent || '#f9f3e6'
      },
      qualityScore: (design as any).qualityScore || 50,
      // Material and design style need name and icon
      material: {
        ...(design.material || {}),
        name: (design.material as any)?.name || 'Default Material',
        icon: (design.material as any)?.icon || '📦'
      },
      designStyle: {
        ...(design.designStyle || {}),
        name: (design.designStyle as any)?.name || 'Default Style',
        icon: (design.designStyle as any)?.icon || '🎨'
      },
      // Other properties
      specialEffect: design.specialEffect,
      specialEffects: design.specialEffects || [],
      packagingType: design.packagingType || 'bottle',
      labelStyle: design.labelStyle || 'printed'
    },
    // Enhanced product properties
    enhancedValue: product.value * 1.25, // 25% boost as a default
    potencyBoost: 10,
    marketAppeal: 50,
    shelfLife: 30,
    packagingEffects: ["Enhanced presentation", "Premium feel"]
  };
}

// Mock version of the backend packaging conversion
function toBackendPackaging(design: PackagingDesign, creatorId: string): any {
  return {
    id: design.id,
    name: design.name,
    // For material, use a string (like 'glass') if available, or fall back to material object
    material: typeof design.material === 'string' ? design.material :
      (design.material as any)?.materialType || 'glass',
    
    // For designStyle, use a string (like 'elegant') if available, or fall back to designStyle object
    designStyle: typeof design.designStyle === 'string' ? design.designStyle :
      (design.designStyle as any)?.designStyle || 'elegant',
    
    // Special effects handling
    specialEffects: design.specialEffect ? 
      [(design.specialEffect as any)?.effectType || 'shimmer'] : 
      (design.specialEffects || []),
    
    // Add other required properties
    materialQuality: 'fine',
    packagingType: design.packagingType || 'bottle',
    labelStyle: design.labelStyle || 'printed',
    colorScheme: [
      design.colors?.base || '#8b6b3d', 
      design.colors?.accent || '#f9f3e6'
    ],
    elementalAffinity: 'Earth',
    designElements: ['motif'],
    creatorId: creatorId,
    
    // Add bonuses
    bonuses: {
      marketValue: 50,
      potency: 25,
      attractiveness: 75,
      durability: 80,
      prestige: 60
    },
    
    // Add other required fields
    designName: design.name,
    rarity: 'uncommon',
    lore: '',
    imagePath: '',
    creationDate: Date.now()
  };
}

interface PackagingDesignerProps {
  playerInventory: {
    materials: Material[];
    designStyles: DesignStyle[];
    specialEffects: SpecialEffect[];
    brands: Brand[];
  };
  onDesignCreate: (design: PackagingDesign) => Promise<void>;
  onApplyToProduct: (design: PackagingDesign, product: Product) => Promise<void>;
  playerCraftSkill: number;
  playerArtistrySkill: number;
  onClose: () => void;
  selectedProduct?: Product | null;
}

const PackagingDesigner: React.FC<PackagingDesignerProps> = ({
  playerInventory,
  onDesignCreate,
  onApplyToProduct,
  playerCraftSkill,
  playerArtistrySkill,
  onClose,
  selectedProduct
}) => {
  // State for the packaging design being created
  const [designName, setDesignName] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedDesignStyle, setSelectedDesignStyle] = useState<DesignStyle | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<SpecialEffect | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [customColorBase, setCustomColorBase] = useState('#8b6b3d');
  const [customColorAccent, setCustomColorAccent] = useState('#f9f3e6');
  const [packagingType, setPackagingType] = useState<PackagingType>('bottle');
  const [labelStyle, setLabelStyle] = useState<LabelStyle>('printed');
  
  // UI states
  const [currentStep, setCurrentStep] = useState<'material' | 'design' | 'effect' | 'brand' | 'preview'>('material');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [designQuality, setDesignQuality] = useState(0);
  
  // Calculate design quality score based on selected components and player skills
  useEffect(() => {
    if (!selectedMaterial || !selectedDesignStyle) {
      setDesignQuality(0);
      return;
    }
    
    // Base quality from material and design
    let quality = (selectedMaterial.qualityLevel + selectedDesignStyle.complexityLevel) / 2;
    
    // Bonus from effect if present
    if (selectedEffect) {
      quality += selectedEffect.rarity * 0.5;
    }
    
    // Bonus from brand if present
    if (selectedBrand) {
      quality += selectedBrand.reputation * 0.2;
    }
    
    // Skill bonuses
    const skillBonus = (playerCraftSkill * 0.3) + (playerArtistrySkill * 0.3);
    quality += skillBonus;
    
    // Scale to 0-100
    quality = Math.min(100, Math.max(0, quality * 5));
    
    setDesignQuality(Math.round(quality));
  }, [
    selectedMaterial, 
    selectedDesignStyle, 
    selectedEffect, 
    selectedBrand,
    playerCraftSkill,
    playerArtistrySkill
  ]);

  // Handle material selection
  const handleMaterialSelect = (material: Material) => {
    setSelectedMaterial(material);
    setCurrentStep('design');
  };

  // Handle design style selection
  const handleDesignStyleSelect = (designStyle: DesignStyle) => {
    setSelectedDesignStyle(designStyle);
    setCurrentStep('effect');
  };

  // Handle special effect selection
  const handleEffectSelect = (effect: SpecialEffect | null) => {
    setSelectedEffect(effect);
    setCurrentStep('brand');
  };

  // Handle brand selection
  const handleBrandSelect = (brand: Brand | null) => {
    setSelectedBrand(brand);
    setCurrentStep('preview');
  };
  
  // Handle packaging type selection
  const handlePackagingTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPackagingType(e.target.value as PackagingType);
  };
  
  // Handle label style selection
  const handleLabelStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLabelStyle(e.target.value as LabelStyle);
  };

  // Handle design creation
  const handleCreateDesign = async () => {
    if (!selectedMaterial || !selectedDesignStyle) {
      setError('You must select a material and design style');
      return;
    }

    if (!designName.trim()) {
      setError('Please enter a name for your design');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create packaging design object
      const design: PackagingDesign & {
        colors: { base: string; accent: string };
        qualityScore: number;
        specialEffects: string[];
      } = {
        id: `design_${Date.now()}`,
        name: designName,
        material: selectedMaterial,
        designStyle: selectedDesignStyle,
        specialEffect: selectedEffect,
        brand: selectedBrand,
        colors: {
          base: customColorBase,
          accent: customColorAccent
        },
        qualityScore: designQuality,
        packagingType,
        labelStyle,
        specialEffects: selectedEffect && selectedEffect.effectType ? [selectedEffect.effectType] : [],
        creationDate: Date.now()
      };

      await onDesignCreate(design);
      setSuccess('Design created successfully!');

      // If a product was provided, apply the design
      if (selectedProduct) {
        // Use the helper function to apply packaging to product
        try {
          const enhancedProduct = applyPackagingDesignToProduct(selectedProduct, design);
          await onApplyToProduct(design, enhancedProduct);
          setSuccess('Design applied to product successfully!');
        } catch (error) {
          console.warn("Error applying design to product:", error);
          setError("Failed to apply design to product. Please try again.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the designer
  const handleReset = () => {
    setSelectedMaterial(null);
    setSelectedDesignStyle(null);
    setSelectedEffect(null);
    setSelectedBrand(null);
    setDesignName('');
    setCustomColorBase('#8b6b3d');
    setCustomColorAccent('#f9f3e6');
    setPackagingType('bottle');
    setLabelStyle('printed');
    setCurrentStep('material');
    setError(null);
    setSuccess(null);
  };
  
  // Get quality level text
  const getQualityText = () => {
    if (designQuality < 20) return 'Basic';
    if (designQuality < 40) return 'Standard';
    if (designQuality < 60) return 'Quality';
    if (designQuality < 80) return 'Premium';
    return 'Masterpiece';
  };

  // Render material selection
  const renderMaterialSelection = () => {
    return (
      <div className="packaging-selection-container">
        <h3>Select Packaging Material</h3>
        <p className="selection-instruction">Choose the base material for your packaging. Different materials offer varying durability, appearance, and special properties.</p>
        
        <div className="materials-grid">
          {playerInventory.materials.length > 0 ? (
            playerInventory.materials.map((material) => (
              <div 
                key={material.id}
                className={`material-card ${selectedMaterial?.id === material.id ? 'selected' : ''}`}
                onClick={() => handleMaterialSelect(material)}
              >
                <div className="material-icon">{material.icon}</div>
                <div className="material-details">
                  <div className="material-name">{material.name}</div>
                  <div className="material-description">{material.description}</div>
                  <div className="material-properties">
                    <span className="property">
                      <span className="property-label">Durability:</span> 
                      <span className="property-value">{material.durability}/10</span>
                    </span>
                    <span className="property">
                      <span className="property-label">Quality:</span> 
                      <span className="property-value">{material.qualityLevel}/10</span>
                    </span>
                  </div>
                  {material.specialProperty && (
                    <div className="special-property tooltip-container">
                      <span className="special-label">✨ Special Property</span>
                      <div className="trait-tooltip">
                        <p>{typeof material.specialProperty === 'string' ? material.specialProperty : 'Enhances product properties'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-items-message">
              No packaging materials in inventory. Visit the Market to purchase materials.
            </div>
          )}
        </div>
        
        <div className="selection-actions">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  };

  // Render design style selection
  const renderDesignStyleSelection = () => {
    return (
      <div className="packaging-selection-container">
        <h3>Select Design Style</h3>
        <p className="selection-instruction">Choose an artistic style for your packaging. The design style affects both appearance and customer appeal.</p>
        
        <div className="design-styles-grid">
          {playerInventory.designStyles.length > 0 ? (
            playerInventory.designStyles.map((style) => (
              <div 
                key={style.id}
                className={`design-style-card ${selectedDesignStyle?.id === style.id ? 'selected' : ''}`}
                onClick={() => handleDesignStyleSelect(style)}
              >
                <div className="design-style-icon">{style.icon}</div>
                <div className="design-style-details">
                  <div className="design-style-name">{style.name}</div>
                  <div className="design-style-description">{style.description}</div>
                  <div className="design-style-properties">
                    <span className="property">
                      <span className="property-label">Complexity:</span> 
                      <span className="property-value">{style.complexityLevel}/10</span>
                    </span>
                    <span className="property">
                      <span className="property-label">Appeal:</span> 
                      <span className="property-value">{style.customerAppeal}/10</span>
                    </span>
                  </div>
                  {style.marketBonus && (
                    <div className="market-bonus tooltip-container">
                      <span className="bonus-label">💰 Market Bonus</span>
                      <div className="trait-tooltip">
                        <p>{style.marketBonus}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-items-message">
              No design styles in inventory. Visit the Atelier to learn new styles.
            </div>
          )}
        </div>
        
        <div className="selection-actions">
          <button 
            className="secondary-button"
            onClick={() => setCurrentStep('material')}
          >
            Back
          </button>
          <button className="cancel-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  };

  // Render special effect selection
  const renderEffectSelection = () => {
    return (
      <div className="packaging-selection-container">
        <h3>Add Special Effect (Optional)</h3>
        <p className="selection-instruction">Enhance your packaging with a special magical effect. Special effects can significantly increase the value and appeal of your product.</p>
        
        <div className="effects-grid">
          <div 
            className={`effect-card ${selectedEffect === null ? 'selected' : ''}`}
            onClick={() => handleEffectSelect(null)}
          >
            <div className="effect-icon">❌</div>
            <div className="effect-details">
              <div className="effect-name">No Effect</div>
              <div className="effect-description">Continue without adding a special effect.</div>
            </div>
          </div>
          
          {playerInventory.specialEffects.length > 0 ? (
            playerInventory.specialEffects.map((effect) => (
              <div 
                key={effect.id}
                className={`effect-card ${selectedEffect?.id === effect.id ? 'selected' : ''}`}
                onClick={() => handleEffectSelect(effect)}
              >
                <div className="effect-icon">{effect.icon}</div>
                <div className="effect-details">
                  <div className="effect-name">{effect.name}</div>
                  <div className="effect-description">{effect.description}</div>
                  <div className="effect-properties">
                    <span className="property">
                      <span className="property-label">Rarity:</span> 
                      <span className="property-value">{effect.rarity}/10</span>
                    </span>
                    <span className="property">
                      <span className="property-label">Power:</span> 
                      <span className="property-value">{effect.power}/10</span>
                    </span>
                  </div>
                  {effect.duration && (
                    <div className="effect-duration">
                      <span className="duration-label">⏱️ Duration:</span> 
                      <span className="duration-value">{effect.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-items-message">
              No special effects in inventory. Learn magical effects in the Witch's Academy.
            </div>
          )}
        </div>
        
        <div className="selection-actions">
          <button 
            className="secondary-button"
            onClick={() => setCurrentStep('design')}
          >
            Back
          </button>
          <button className="cancel-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  };

  // Render brand selection
  const renderBrandSelection = () => {
    return (
      <div className="packaging-selection-container">
        <h3>Apply Brand (Optional)</h3>
        <p className="selection-instruction">Apply your brand identity to the packaging. Branding can increase your product's recognition and value.</p>
        
        <div className="brands-grid">
          <div 
            className={`brand-card ${selectedBrand === null ? 'selected' : ''}`}
            onClick={() => handleBrandSelect(null)}
          >
            <div className="brand-icon">❌</div>
            <div className="brand-details">
              <div className="brand-name">No Brand</div>
              <div className="brand-description">Continue without applying a brand.</div>
            </div>
          </div>
          
          {playerInventory.brands.length > 0 ? (
            playerInventory.brands.map((brand) => (
              <div 
                key={brand.id}
                className={`brand-card ${selectedBrand?.id === brand.id ? 'selected' : ''}`}
                onClick={() => handleBrandSelect(brand)}
              >
                <div className="brand-icon">{brand.icon || '🏷️'}</div>
                <div className="brand-details">
                  <div className="brand-name">{brand.name}</div>
                  <div className="brand-description">{brand.description}</div>
                  <div className="brand-properties">
                    <span className="property">
                      <span className="property-label">Reputation:</span> 
                      <span className="property-value">{brand.reputation}/10</span>
                    </span>
                    <span className="property">
                      <span className="property-label">Recognition:</span> 
                      <span className="property-value">{brand.recognition || 5}/10</span>
                    </span>
                  </div>
                  {brand.signature && (
                    <div className="brand-signature tooltip-container">
                      <span className="signature-label">✒️ Signature Element</span>
                      <div className="trait-tooltip">
                        <p>{typeof brand.signature === 'string' ? 
                            brand.signature : 'Unique brand signature element'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-items-message">
              No brands available. Develop your brand identity in the Atelier's Branding Workshop.
            </div>
          )}
        </div>
        
        <div className="selection-actions">
          <button 
            className="secondary-button"
            onClick={() => setCurrentStep('effect')}
          >
            Back
          </button>
          <button className="cancel-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  };

  // Render preview and color selection
  const renderPreview = () => {
    if (!selectedMaterial || !selectedDesignStyle) {
      return null;
    }
    
    // Packaging type options
    const packagingTypes: PackagingType[] = [
      'bottle', 'jar', 'pouch', 'box', 'tin', 'vial', 'sachet',
      'envelope', 'chest', 'basket', 'amphora', 'gourd', 'scroll',
      'teacup', 'flask', 'pendant', 'amulet', 'locket', 'case'
    ];
    
    // Label style options
    const labelStyles: LabelStyle[] = [
      'handwritten', 'printed', 'etched', 'embossed', 'stamped',
      'inlaid', 'burned', 'painted', 'calligraphy', 'illustrated',
      'wax-sealed', 'engraved', 'ribboned', 'hidden', 'glowing'
    ];
    
    // Get emoji for selected packaging type
    const getPackagingTypeEmoji = (type: PackagingType): string => {
      const emojiMap: Record<string, string> = {
        bottle: '🍶',
        jar: '🏺',
        pouch: '👝',
        box: '📦',
        tin: '🥫',
        vial: '🧪',
        sachet: '🧂',
        envelope: '✉️',
        chest: '🧰',
        basket: '🧺',
        amphora: '⚱️',
        gourd: '🎃',
        scroll: '📜',
        teacup: '☕',
        flask: '🧫',
        pendant: '📿',
        amulet: '🪬',
        locket: '📿',
        case: '💼'
      };
      return emojiMap[type] || '📦';
    };

    return (
      <div className="packaging-preview-container">
        <h3>Design Preview</h3>
        
        <div className="preview-section">
          <div 
            className="packaging-preview"
            style={{
              backgroundColor: customColorBase,
              borderColor: customColorAccent,
              color: customColorAccent
            }}
          >
            <div className="preview-material">{selectedMaterial.icon || '📦'}</div>
            <div className="preview-design">{selectedDesignStyle.icon || '🎨'}</div>
            {selectedEffect && (
              <div className="preview-effect">{selectedEffect.icon || '✨'}</div>
            )}
            {selectedBrand && (
              <div className="preview-brand">{selectedBrand?.icon || '🏷️'}</div>
            )}
            <div className="preview-package-type" title={packagingType}>
              {getPackagingTypeEmoji(packagingType)}
            </div>
          </div>
          
          <div className="design-details">
            <div className="name-input-container">
              <label htmlFor="design-name">Design Name:</label>
              <input
                id="design-name"
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                placeholder="Enter a name for your design..."
                className="design-name-input"
              />
            </div>
            
            <div className="packaging-options">
              <div className="option-selector">
                <label htmlFor="packaging-type">Packaging Type:</label>
                <select 
                  id="packaging-type" 
                  value={packagingType}
                  onChange={handlePackagingTypeChange}
                  className="select-input"
                >
                  {packagingTypes.map(type => (
                    <option key={type} value={type}>
                      {getPackagingTypeEmoji(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="option-selector">
                <label htmlFor="label-style">Label Style:</label>
                <select 
                  id="label-style" 
                  value={labelStyle}
                  onChange={handleLabelStyleChange}
                  className="select-input"
                >
                  {labelStyles.map(style => (
                    <option key={style} value={style}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="color-selection">
              <div className="color-picker">
                <label htmlFor="base-color">Base Color:</label>
                <input
                  id="base-color"
                  type="color"
                  value={customColorBase}
                  onChange={(e) => setCustomColorBase(e.target.value)}
                />
              </div>
              
              <div className="color-picker">
                <label htmlFor="accent-color">Accent Color:</label>
                <input
                  id="accent-color"
                  type="color"
                  value={customColorAccent}
                  onChange={(e) => setCustomColorAccent(e.target.value)}
                />
              </div>
            </div>
            
            <div className="quality-meter">
              <div className="meter-label">Quality Rating: {designQuality}% ({getQualityText()})</div>
              <div className="meter-bar">
                <div 
                  className={`meter-fill ${
                    designQuality < 20 ? 'basic' :
                    designQuality < 40 ? 'standard' :
                    designQuality < 60 ? 'quality' :
                    designQuality < 80 ? 'premium' : 'masterpiece'
                  }`}
                  style={{ width: `${designQuality}%` }}
                ></div>
              </div>
            </div>
            
            <div className="design-components">
              <div className="component-item">
                <span className="component-label">Material:</span>
                <span className="component-value">{selectedMaterial.name}</span>
              </div>
              
              <div className="component-item">
                <span className="component-label">Design Style:</span>
                <span className="component-value">{selectedDesignStyle.name}</span>
              </div>
              
              <div className="component-item">
                <span className="component-label">Special Effect:</span>
                <span className="component-value">{selectedEffect ? selectedEffect.name : 'None'}</span>
              </div>
              
              <div className="component-item">
                <span className="component-label">Brand:</span>
                <span className="component-value">{selectedBrand ? selectedBrand.name : 'None'}</span>
              </div>
              
              <div className="component-item">
                <span className="component-label">Package Type:</span>
                <span className="component-value">
                  {getPackagingTypeEmoji(packagingType)} {packagingType.charAt(0).toUpperCase() + packagingType.slice(1)}
                </span>
              </div>
              
              <div className="component-item">
                <span className="component-label">Label Style:</span>
                <span className="component-value">
                  {labelStyle.charAt(0).toUpperCase() + labelStyle.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="preview-actions">
          <button 
            className="secondary-button"
            onClick={() => setCurrentStep('brand')}
          >
            Back
          </button>
          
          <button
            className="reset-button"
            onClick={handleReset}
          >
            Start Over
          </button>
          
          <button
            className="primary-button"
            onClick={handleCreateDesign}
            disabled={isLoading || !designName.trim()}
          >
            {isLoading ? 'Creating...' : selectedProduct ? 'Create & Apply to Product' : 'Create Design'}
          </button>
        </div>
      </div>
    );
  };

  // Main render method
  return (
    <div className="packaging-designer-container">
      <div className="packaging-designer-overlay" onClick={onClose}></div>
      
      <div className="packaging-designer-modal">
        <div className="modal-header">
          <h2>Packaging Designer</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="designer-steps">
          <div className={`step ${currentStep === 'material' ? 'active' : ''} ${selectedMaterial ? 'completed' : ''}`}>1. Material</div>
          <div className={`step ${currentStep === 'design' ? 'active' : ''} ${selectedDesignStyle ? 'completed' : ''}`}>2. Design</div>
          <div className={`step ${currentStep === 'effect' ? 'active' : ''} ${currentStep === 'brand' || currentStep === 'preview' ? 'completed' : ''}`}>3. Effect</div>
          <div className={`step ${currentStep === 'brand' ? 'active' : ''} ${currentStep === 'preview' ? 'completed' : ''}`}>4. Brand</div>
          <div className={`step ${currentStep === 'preview' ? 'active' : ''}`}>5. Preview</div>
        </div>
        
        <div className="modal-content">
          {currentStep === 'material' && renderMaterialSelection()}
          {currentStep === 'design' && renderDesignStyleSelection()}
          {currentStep === 'effect' && renderEffectSelection()}
          {currentStep === 'brand' && renderBrandSelection()}
          {currentStep === 'preview' && renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default PackagingDesigner;