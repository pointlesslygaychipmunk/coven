import React, { useState } from 'react';
import './PackagingInventory.css';
import { 
  Material, 
  DesignStyle, 
  SpecialEffect, 
  Brand, 
  PackagingDesign,
  Product
} from 'coven-shared';

// Type definition to handle both frontend and backend packaging formats
type CompatibleDesign = PackagingDesign & {
  qualityScore?: number;
  colors?: {
    base?: string;
    accent?: string;
  };
  specialEffects?: string[];
  specialEffect?: SpecialEffect;
  brand?: Brand;
};
import PackagingDesigner from './PackagingDesigner';
import PackagedProduct from './PackagedProduct';

interface PackagingInventoryProps {
  playerInventory: {
    materials: Material[];
    designStyles: DesignStyle[];
    specialEffects: SpecialEffect[];
    brands: Brand[];
    designs: CompatibleDesign[];
  };
  products: Product[];
  playerCraftSkill: number;
  playerArtistrySkill: number;
  onDesignCreate: (design: PackagingDesign) => Promise<void>;
  onApplyToProduct: (design: PackagingDesign, product: Product) => Promise<void>;
}

const PackagingInventory: React.FC<PackagingInventoryProps> = ({
  playerInventory,
  products,
  playerCraftSkill,
  playerArtistrySkill,
  onDesignCreate,
  onApplyToProduct
}) => {
  // State
  const [showDesigner, setShowDesigner] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'materials' | 'designs' | 'products'>('materials');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Open designer
  const handleOpenDesigner = (product: Product | null = null) => {
    setSelectedProduct(product);
    setShowDesigner(true);
  };
  
  // Close designer
  const handleCloseDesigner = () => {
    setShowDesigner(false);
    setSelectedProduct(null);
  };
  
  // Filter inventory items by search query
  const filteredMaterials = playerInventory.materials.filter(material => 
    material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredDesignStyles = playerInventory.designStyles.filter(style => 
    style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    style.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredEffects = playerInventory.specialEffects.filter(effect => 
    effect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    effect.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredBrands = playerInventory.brands.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredDesigns = playerInventory.designs.filter(design => 
    design.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get packaged product (if exists)
  const getPackagedProduct = (product: Product) => {
    // First check if the product already has packaging
    if (product.packaging) {
      return product.packaging as CompatibleDesign;
    }
    
    // This is a simulation - in a real implementation, the packaging 
    // information would be stored with the product.
    // For now, we'll just return the first design in inventory that's suitable for this product
    if (playerInventory.designs.length === 0) {
      return null;
    }
    
    // Find compatible designs (for demo, all designs are compatible)
    const compatibleDesigns = playerInventory.designs.filter(design => {
      // For simplicity, we'll just check if design has a material
      return !!design.material;
    });
    
    return compatibleDesigns.length > 0 ? compatibleDesigns[0] : null;
  };
  
  // Render materials tab
  const renderMaterialsTab = () => {
    return (
      <div className="packaging-inventory-tab">
        <div className="resources-section">
          <h3>Packaging Materials</h3>
          <div className="materials-grid">
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map(material => (
                <div key={material.id} className="inventory-item material-item">
                  <div className="item-icon">{material.icon}</div>
                  <div className="item-details">
                    <div className="item-name">{material.name}</div>
                    <div className="item-description">{material.description}</div>
                    <div className="item-properties">
                      <span className="property">
                        <span className="property-label">Durability:</span> 
                        <span className="property-value">{material.durability}/10</span>
                      </span>
                      <span className="property">
                        <span className="property-label">Quality:</span> 
                        <span className="property-value">{material.qualityLevel}/10</span>
                      </span>
                    </div>
                  </div>
                  <div className="item-quantity">x{material.quantity || 1}</div>
                </div>
              ))
            ) : (
              <div className="no-items-message">
                No packaging materials found. Visit the Market to purchase materials.
              </div>
            )}
          </div>
        </div>
        
        <div className="resources-section">
          <h3>Design Styles</h3>
          <div className="design-styles-grid">
            {filteredDesignStyles.length > 0 ? (
              filteredDesignStyles.map(style => (
                <div key={style.id} className="inventory-item style-item">
                  <div className="item-icon">{style.icon}</div>
                  <div className="item-details">
                    <div className="item-name">{style.name}</div>
                    <div className="item-description">{style.description}</div>
                    <div className="item-properties">
                      <span className="property">
                        <span className="property-label">Complexity:</span> 
                        <span className="property-value">{style.complexityLevel}/10</span>
                      </span>
                      <span className="property">
                        <span className="property-label">Appeal:</span> 
                        <span className="property-value">{style.customerAppeal}/10</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-items-message">
                No design styles found. Visit the Atelier to learn new styles.
              </div>
            )}
          </div>
        </div>
        
        <div className="resources-section">
          <h3>Special Effects</h3>
          <div className="effects-grid">
            {filteredEffects.length > 0 ? (
              filteredEffects.map(effect => (
                <div key={effect.id} className="inventory-item effect-item">
                  <div className="item-icon">{effect.icon}</div>
                  <div className="item-details">
                    <div className="item-name">{effect.name}</div>
                    <div className="item-description">{effect.description}</div>
                    <div className="item-properties">
                      <span className="property">
                        <span className="property-label">Rarity:</span> 
                        <span className="property-value">{effect.rarity}/10</span>
                      </span>
                      <span className="property">
                        <span className="property-label">Power:</span> 
                        <span className="property-value">{effect.power}/10</span>
                      </span>
                    </div>
                  </div>
                  <div className="item-quantity">x{effect.quantity || 1}</div>
                </div>
              ))
            ) : (
              <div className="no-items-message">
                No special effects found. Learn magical effects in the Witch's Academy.
              </div>
            )}
          </div>
        </div>
        
        <div className="resources-section">
          <h3>Brands</h3>
          <div className="brands-grid">
            {filteredBrands.length > 0 ? (
              filteredBrands.map(brand => (
                <div key={brand.id} className="inventory-item brand-item">
                  <div className="item-icon">{brand.icon}</div>
                  <div className="item-details">
                    <div className="item-name">{brand.name}</div>
                    <div className="item-description">{brand.description}</div>
                    <div className="item-properties">
                      <span className="property">
                        <span className="property-label">Reputation:</span> 
                        <span className="property-value">{brand.reputation}/10</span>
                      </span>
                      <span className="property">
                        <span className="property-label">Recognition:</span> 
                        <span className="property-value">{brand.recognition}/10</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-items-message">
                No brands found. Develop your brand identity in the Atelier's Branding Workshop.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Render designs tab
  const renderDesignsTab = () => {
    // Get emoji for selected packaging type
    const getPackagingTypeEmoji = (type?: string): string => {
      if (!type) return '📦';
      
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
    
    // Format date string from timestamp
    const formatDate = (timestamp?: number): string => {
      if (!timestamp) return 'Unknown';
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    };
    
    return (
      <div className="packaging-inventory-tab">
        <div className="designs-header">
          <h3>Your Packaging Designs</h3>
          <button 
            className="create-design-button"
            onClick={() => handleOpenDesigner()}
          >
            Create New Design
          </button>
        </div>
        
        <div className="designs-grid">
          {filteredDesigns.length > 0 ? (
            filteredDesigns.map(design => (
              <div key={design.id} className="design-card">
                <div 
                  className="design-preview"
                  style={{
                    backgroundColor: design.colors?.base || '#f0f0f0',
                    borderColor: design.colors?.accent || '#cccccc',
                    color: design.colors?.accent || '#333333'
                  }}
                >
                  <div className="preview-icon">{design.material?.icon || '📦'}</div>
                  <div className="preview-style">{design.designStyle?.icon || '🎨'}</div>
                  {design.specialEffect && (
                    <div className="preview-effect">{design.specialEffect?.icon || '✨'}</div>
                  )}
                  {design.brand && (
                    <div className="preview-brand">{design.brand?.icon || '🏷️'}</div>
                  )}
                  {design.packagingType && (
                    <div className="preview-package-type" title={design.packagingType}>
                      {getPackagingTypeEmoji(design.packagingType)}
                    </div>
                  )}
                </div>
                
                <div className="design-info">
                  <div className="design-name">{design.name}</div>
                  
                  <div className="design-quality">
                    Quality: 
                    <span className={`quality-rating quality-${design.qualityScore < 20 ? 'basic' : 
                      design.qualityScore < 40 ? 'standard' : 
                      design.qualityScore < 60 ? 'quality' : 
                      design.qualityScore < 80 ? 'premium' : 'masterpiece'}`}
                    >
                      {design.qualityScore < 20 ? 'Basic' : 
                      design.qualityScore < 40 ? 'Standard' : 
                      design.qualityScore < 60 ? 'Quality' : 
                      design.qualityScore < 80 ? 'Premium' : 'Masterpiece'}
                    </span>
                  </div>
                  
                  <div className="design-components">
                    <div className="component">
                      <span className="component-label">Material:</span>
                      <span className="component-value">{design.material?.name || 'Unknown Material'}</span>
                    </div>
                    
                    <div className="component">
                      <span className="component-label">Style:</span>
                      <span className="component-value">{design.designStyle?.name || 'Design Style'}</span>
                    </div>
                    
                    {design.specialEffects && design.specialEffects.length > 0 && (
                      <div className="component">
                        <span className="component-label">Effect:</span>
                        <span className="component-value">{
                          typeof design.specialEffects[0] === 'string' 
                            ? design.specialEffects[0].charAt(0).toUpperCase() + design.specialEffects[0].slice(1)
                            : 'Special Effect'
                        }</span>
                      </div>
                    )}
                    
                    {/* Brand reference - will be added in future updates */}
                    
                    {design.packagingType && (
                      <div className="component">
                        <span className="component-label">Type:</span>
                        <span className="component-value">
                          {getPackagingTypeEmoji(design.packagingType)} {design.packagingType.charAt(0).toUpperCase() + design.packagingType.slice(1)}
                        </span>
                      </div>
                    )}
                    
                    {design.labelStyle && (
                      <div className="component">
                        <span className="component-label">Label:</span>
                        <span className="component-value">
                          {design.labelStyle.charAt(0).toUpperCase() + design.labelStyle.slice(1)}
                        </span>
                      </div>
                    )}
                    
                    {design.creationDate && (
                      <div className="component date-created">
                        <span className="component-label">Created:</span>
                        <span className="component-value">{formatDate(design.creationDate)}</span>
                      </div>
                    )}
                    
                    {design.collectorValue && design.collectorValue > 0 && (
                      <div className="component">
                        <span className="component-label">Collector Value:</span>
                        <span className="component-value positive">{design.collectorValue}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="design-actions">
                  <button 
                    className="apply-design-button"
                    onClick={() => {
                      if (products.length > 0) {
                        // Pass first product for simplicity - in a real implementation,
                        // we'd show a product selection modal
                        handleOpenDesigner(products[0]);
                      } else {
                        alert('No products available to apply design to.');
                      }
                    }}
                  >
                    Apply to Product
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-items-message">
              No packaging designs created yet. Click "Create New Design" to get started.
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render products tab
  const renderProductsTab = () => {
    return (
      <div className="packaging-inventory-tab">
        <h3>Products Available for Packaging</h3>
        
        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => {
              const packageDesign = getPackagedProduct(product);
              
              const productValueDisplay = () => {
                if (product.enhancedValue) {
                  const percentage = Math.round((product.enhancedValue / product.value) * 100 - 100);
                  return (
                    <div className="product-value">
                      Value: <span className="enhanced-value">{product.value} (+{percentage}%)</span>
                    </div>
                  );
                }
                return (
                  <div className="product-value">
                    Value: {product.value}
                  </div>
                );
              };
              
              return (
                <div key={product.id} className="product-card">
                  {packageDesign ? (
                    <>
                      <PackagedProduct 
                        product={product}
                        packaging={packageDesign}
                        showDetails={true}
                      />
                      
                      <div className="packaged-effects">
                        {product.packagingEffects && product.packagingEffects.length > 0 && (
                          <div className="effects-list">
                            <h4>Packaging Effects:</h4>
                            <ul>
                              {product.packagingEffects.slice(0, 2).map((effect, idx) => (
                                <li key={idx}>{effect}</li>
                              ))}
                              {product.packagingEffects.length > 2 && (
                                <li>...and {product.packagingEffects.length - 2} more effects</li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        <button 
                          className="repackage-button"
                          onClick={() => handleOpenDesigner(product)}
                        >
                          Redesign Package
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="unpackaged-product">
                      <div className="product-icon">{product.icon}</div>
                      <div className="product-name">{product.name}</div>
                      <div className="product-description">{product.description}</div>
                      {productValueDisplay()}
                      <div className="product-details">
                        <div className="detail-item">
                          <span className="detail-label">Type:</span>
                          <span className="detail-value">{product.type}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Rarity:</span>
                          <span className={`detail-value rarity-${product.rarity}`}>
                            {product.rarity.charAt(0).toUpperCase() + product.rarity.slice(1)}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="package-button"
                        onClick={() => handleOpenDesigner(product)}
                      >
                        Create Package
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="no-items-message">
              No products found. Create products in the Atelier or Brewing stations.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="packaging-inventory-container">
      <div className="inventory-header">
        <h2>Packaging Workshop</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="inventory-tabs">
        <button 
          className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          Materials & Resources
        </button>
        <button 
          className={`tab-button ${activeTab === 'designs' ? 'active' : ''}`}
          onClick={() => setActiveTab('designs')}
        >
          Your Designs
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Product Packaging
        </button>
      </div>
      
      <div className="inventory-content">
        {activeTab === 'materials' && renderMaterialsTab()}
        {activeTab === 'designs' && renderDesignsTab()}
        {activeTab === 'products' && renderProductsTab()}
      </div>
      
      {showDesigner && (
        <PackagingDesigner 
          playerInventory={{
            materials: playerInventory.materials,
            designStyles: playerInventory.designStyles,
            specialEffects: playerInventory.specialEffects,
            brands: playerInventory.brands
          }}
          onDesignCreate={onDesignCreate}
          onApplyToProduct={onApplyToProduct}
          playerCraftSkill={playerCraftSkill}
          playerArtistrySkill={playerArtistrySkill}
          onClose={handleCloseDesigner}
          selectedProduct={selectedProduct}
        />
      )}
    </div>
  );
};

export default PackagingInventory;