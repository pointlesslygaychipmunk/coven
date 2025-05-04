import React, { useState, useEffect } from 'react';
import './CombinedWorkshop.css';
import { 
  InventoryItem, 
  BasicRecipeInfo, 
  AtelierSpecialization, 
  MoonPhase, 
  ItemCategory,
  ItemType,
  Rarity,
  Product,
  Material,
  DesignStyle,
  SpecialEffect,
  Brand,
  PackagingDesign,
  PackageType
} from 'coven-shared';

// Import individual components
import Brewing from './Brewing';
import Atelier from './Atelier';
import PackagingInventory from './PackagingInventory';
import PackagingDesigner from './PackagingDesigner';
import PackagedProduct from './PackagedProduct';

// Define the workshop tabs
type WorkshopTab = 'brewing' | 'atelier' | 'packaging';

interface CombinedWorkshopProps {
  playerInventory: InventoryItem[];
  knownRecipes: BasicRecipeInfo[];
  lunarPhase: MoonPhase;
  playerLevel: number;
  playerSpecialization?: AtelierSpecialization;
  playerCraftSkill: number;
  playerArtistrySkill: number;
  products: Product[];
  packagingMaterials: Material[];
  designStyles: DesignStyle[];
  specialEffects: SpecialEffect[];
  brands: Brand[];
  packagingDesigns: PackageType[];
  onBrew: (ingredientIds: string[], puzzleBonus: number, recipeId?: string) => void;
  onCraftItem: (ingredientIds: string[], resultItemId: string) => void;
  onDesignCreate: (design: PackagingDesign) => Promise<void>;
  onApplyToProduct: (design: PackagingDesign, product: Product) => Promise<void>;
}

const CombinedWorkshop: React.FC<CombinedWorkshopProps> = ({
  playerInventory,
  knownRecipes,
  lunarPhase,
  playerLevel,
  playerSpecialization,
  playerCraftSkill,
  playerArtistrySkill,
  products,
  packagingMaterials,
  designStyles,
  specialEffects,
  brands,
  packagingDesigns,
  onBrew,
  onCraftItem,
  onDesignCreate,
  onApplyToProduct
}) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<WorkshopTab>('brewing');
  
  // State for recently created products (to facilitate workflow between sections)
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  
  // Handle tab change
  const handleTabChange = (tab: WorkshopTab) => {
    setActiveTab(tab);
  };
  
  // Handle brewing completion (create a new product and potentially move to packaging)
  const handleBrewComplete = (ingredientIds: string[], puzzleBonus: number, recipeId?: string) => {
    // Call the original brew handler
    onBrew(ingredientIds, puzzleBonus, recipeId);
    
    // Simulate creating a product (in a real implementation, this would come from the backend)
    const mockNewProduct: Product = {
      id: `product_${Date.now()}`,
      name: recipeId ? knownRecipes.find(r => r.id === recipeId)?.name || "Mystery Potion" : "Experimental Brew",
      description: "A freshly brewed potion awaiting packaging.",
      type: "potion",
      category: "potion",
      rarity: puzzleBonus > 30 ? "rare" : puzzleBonus > 15 ? "uncommon" : "common",
      value: 50 + puzzleBonus * 2,
      icon: "🧪",
      quality: 70 + puzzleBonus
    };
    
    // Add to recent products list
    setRecentProducts(prev => [mockNewProduct, ...prev].slice(0, 5));
    
    // Optionally, could auto-switch to packaging tab
    // setActiveTab('packaging');
  };
  
  // Handle crafting completion (create a new product and potentially move to packaging)
  const handleCraftComplete = (ingredientIds: string[], resultItemId: string) => {
    // Call the original craft handler
    onCraftItem(ingredientIds, resultItemId);
    
    // Simulate creating a product (in a real implementation, this would come from the backend)
    const mockNewProduct: Product = {
      id: `product_${Date.now()}`,
      name: resultItemId.includes('charm') ? "Magical Charm" : "Powerful Talisman",
      description: "A newly crafted magical item awaiting packaging.",
      type: resultItemId.includes('charm') ? "charm" : "talisman",
      category: resultItemId.includes('charm') ? "charm" : "talisman",
      rarity: resultItemId.includes('rare') ? "rare" : "uncommon",
      value: resultItemId.includes('rare') ? 120 : 75,
      icon: resultItemId.includes('charm') ? "🔮" : "🧿",
      quality: resultItemId.includes('rare') ? 85 : 70
    };
    
    // Add to recent products list
    setRecentProducts(prev => [mockNewProduct, ...prev].slice(0, 5));
    
    // Optionally, could auto-switch to packaging tab
    // setActiveTab('packaging');
  };
  
  // Render the header with tabs
  const renderHeader = () => {
    return (
      <div className="workshop-header sierra-panel">
        <h2 className="workshop-title">Witch's Workshop</h2>
        
        <div className="workshop-tabs">
          <button 
            className={`tab-button ${activeTab === 'brewing' ? 'active' : ''}`}
            onClick={() => handleTabChange('brewing')}
          >
            Cauldron & Brewing
          </button>
          <button 
            className={`tab-button ${activeTab === 'atelier' ? 'active' : ''}`}
            onClick={() => handleTabChange('atelier')}
          >
            Atelier & Crafting
          </button>
          <button 
            className={`tab-button ${activeTab === 'packaging' ? 'active' : ''}`}
            onClick={() => handleTabChange('packaging')}
          >
            Packaging & Design
          </button>
        </div>
        
        <div className="workshop-phase">
          <div className="moon-display">
            <div className="moon-symbol">
              {lunarPhase === "New Moon" ? "○" :
              lunarPhase === "Waxing Crescent" ? "◐" :
              lunarPhase === "First Quarter" ? "◑" :
              lunarPhase === "Waxing Gibbous" ? "◕" :
              lunarPhase === "Full Moon" ? "●" :
              lunarPhase === "Waning Gibbous" ? "◔" :
              lunarPhase === "Last Quarter" ? "◒" :
              lunarPhase === "Waning Crescent" ? "◓" : "○"}
            </div>
            <span className="phase-name">{lunarPhase}</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Render recent products panel (shows products that can be packaged)
  const renderRecentProducts = () => {
    if (recentProducts.length === 0) return null;
    
    return (
      <div className="recent-products-panel sierra-panel">
        <h3>Recently Created Items</h3>
        <div className="recent-products-list">
          {recentProducts.map(product => (
            <div key={product.id} className="recent-product">
              <div className="product-icon">{product.icon}</div>
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                <div className="product-type">{product.type.charAt(0).toUpperCase() + product.type.slice(1)}</div>
              </div>
              <button 
                className="package-now-button"
                onClick={() => {
                  setActiveTab('packaging');
                  // In a real implementation, you would highlight this product in the packaging tab
                }}
              >
                Package Now
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render the main content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'brewing':
        return (
          <div className="brewing-section">
            <Brewing
              playerInventory={playerInventory}
              knownRecipes={knownRecipes.filter(r => r.type === 'potion')}
              lunarPhase={lunarPhase}
              playerSpecialization={playerSpecialization}
              onBrew={handleBrewComplete}
            />
          </div>
        );
      case 'atelier':
        return (
          <div className="atelier-section">
            <Atelier
              playerItems={playerInventory}
              onCraftItem={handleCraftComplete}
              lunarPhase={lunarPhase}
              playerLevel={playerLevel}
              playerSpecialization={playerSpecialization}
              knownRecipes={knownRecipes.filter(r => r.type === 'charm' || r.type === 'talisman')}
            />
          </div>
        );
      case 'packaging':
        return (
          <div className="packaging-section">
            <PackagingInventory
              playerInventory={{
                materials: packagingMaterials,
                designStyles: designStyles,
                specialEffects: specialEffects,
                brands: brands,
                designs: packagingDesigns
              }}
              products={[...recentProducts, ...products]}
              playerCraftSkill={playerCraftSkill}
              playerArtistrySkill={playerArtistrySkill}
              onDesignCreate={onDesignCreate}
              onApplyToProduct={onApplyToProduct}
            />
          </div>
        );
      default:
        return <div>Select a workshop section</div>;
    }
  };

  return (
    <div className="combined-workshop-container sierra-container">
      {renderHeader()}
      
      <div className="workshop-content">
        {renderContent()}
      </div>
      
      {renderRecentProducts()}
    </div>
  );
};

export default CombinedWorkshop;