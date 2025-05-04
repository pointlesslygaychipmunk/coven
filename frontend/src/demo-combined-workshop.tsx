import React from 'react';
import ReactDOM from 'react-dom/client';
import CombinedWorkshop90s from './components/CombinedWorkshop90s';
import './components/pixelatedSierra.css';

// Demo standalone page for the combined workshop
const Demo = () => {
  // Import types for proper typing
  // Note: We're using direct imports with relative paths to ensure TypeScript compatibility
  import type { 
    MoonPhase, 
    AtelierSpecialization, 
    Material, 
    DesignStyle, 
    SpecialEffect, 
    Brand, 
    PackageType,
    ItemType,
    ItemCategory,
    Rarity,
    Product,
    PackagingDesign
  } from '../../shared/src/types';

  // Create some basic mock inventory items
  const mockInventory = [
    {
      id: "ingr_lavender_001",
      baseId: "ingr_lavender",
      name: "Lavender",
      type: "ingredient" as ItemType,
      category: "herb" as ItemCategory,
      quantity: 10,
      quality: 80,
      value: 15,
      rarity: "common" as Rarity,
      description: "Aromatic lavender with calming properties",
      tarotCardId: "tarot_lavender",
      elementalPower: 60,
      moonAlignment: 70,
      seasonalPotency: 80,
      essenceCharge: 50,
      activeEffects: [],
      combosPotential: 75
    },
    {
      id: "ingr_moonstone_002",
      baseId: "ingr_moonstone",
      name: "Moonstone",
      type: "ingredient" as ItemType,
      category: "crystal" as ItemCategory,
      quantity: 5,
      quality: 90,
      value: 45,
      rarity: "rare" as Rarity,
      description: "Luminous stone that resonates with lunar energy",
      tarotCardId: "tarot_moonstone",
      elementalPower: 85,
      moonAlignment: 95,
      seasonalPotency: 65,
      essenceCharge: 80,
      activeEffects: [],
      combosPotential: 90
    }
  ];

  // Create some basic recipes
  const mockRecipes = [
    {
      id: "recipe_calming_potion",
      name: "Calming Potion",
      category: "potion" as ItemCategory,
      description: "A soothing potion that calms the nerves",
      type: "potion" as ItemType
    },
    {
      id: "recipe_moonlight_charm",
      name: "Moonlight Charm",
      category: "charm" as ItemCategory,
      description: "A charm that glows with the power of moonlight",
      type: "charm" as ItemType
    }
  ];

  // Create some mock products
  const mockProducts = [
    {
      id: "prod_energy_potion_003",
      name: "Energy Potion",
      description: "Reinvigorates the spirit and body",
      icon: "🧪",
      type: "potion" as ItemType,
      category: "potion" as ItemCategory,
      value: 75,
      rarity: "uncommon" as Rarity,
      potencyBoost: 65
    }
  ];

  // Mock packaging materials
  const mockMaterials = [
    {
      id: "mat_glass_001",
      name: "Fine Glass",
      description: "Clear glass that showcases contents beautifully",
      durability: 6,
      qualityLevel: 7,
      icon: "🧪",
      materialType: "glass",
      materialQuality: "fine",
      elementalAffinity: "Water" as const,
      value: 30
    }
  ];

  // Mock design styles
  const mockDesignStyles = [
    {
      id: "style_mystical_001",
      name: "Mystical Style",
      description: "Esoteric symbols and cosmic imagery suggest magical potency",
      complexityLevel: 7,
      customerAppeal: 8,
      marketBonus: "Increases market value by 35",
      icon: "🔮",
      designStyle: "mystical",
      elementalAffinity: "Spirit" as const,
      specializationAffinity: "Crystallization" as AtelierSpecialization
    }
  ];

  // Mock special effects
  const mockEffects = [
    {
      id: "effect_glow_001",
      name: "Glow Effect",
      description: "Package softly illuminates, brighter when contents are potent",
      rarity: 7,
      power: 8,
      duration: "Medium",
      icon: "🌟",
      effectType: "glow",
      potencyBonus: 10,
      durabilityEffect: 0,
      specializationAffinity: "Essence" as AtelierSpecialization
    }
  ];

  // Mock brands
  const mockBrands = [
    {
      id: "brand_moonrays_001",
      name: "Moonrays Essentials",
      description: "Crafting ethereal products with celestial influence",
      reputation: 7,
      recognition: 6,
      signature: "Lunar motif in celestial style",
      icon: "🏷️",
      tagline: "Connected to the cosmos",
      colorPalette: ["#5b3e8f", "#372261", "#140f33", "#c4a5ff", "#ece9f5"],
      brandValues: ["Purity", "Celestial", "Harmony"],
      specialization: "Essence" as AtelierSpecialization,
      elementalAffinity: "Spirit" as const
    }
  ];

  const mockData = {
    playerInventory: mockInventory,
    knownRecipes: mockRecipes,
    lunarPhase: "Full Moon" as MoonPhase,
    playerLevel: 5,
    playerSpecialization: "Essence" as AtelierSpecialization,
    playerCraftSkill: 7,
    playerArtistrySkill: 8,
    products: mockProducts,
    packagingMaterials: mockMaterials,
    designStyles: mockDesignStyles,
    specialEffects: mockEffects,
    brands: mockBrands,
    packagingDesigns: [] as PackagingDesign[],
    onBrew: (ingredientIds: string[], puzzleBonus: number, recipeId?: string) => console.log('Brewing:', ingredientIds, puzzleBonus, recipeId),
    onCraftItem: (ingredientIds: string[], resultItemId: string) => console.log('Crafting:', ingredientIds, resultItemId),
    onDesignCreate: (design: PackagingDesign) => { console.log('Design created:', design); return Promise.resolve(); },
    onApplyToProduct: (design: PackagingDesign, product: Product) => { console.log('Design applied:', design, product); return Promise.resolve(); }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#e8d5b0',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '1024px',
        height: '768px',
        border: '3px outset #8b6d45',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
      }} className="pixelated">
        <CombinedWorkshop90s {...mockData} />
      </div>
    </div>
  );
};

// Create root element if it doesn't exist (for direct loading)
if (!document.getElementById('root')) {
  const rootDiv = document.createElement('div');
  rootDiv.id = 'root';
  document.body.appendChild(rootDiv);
}

// Render directly to the page
const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);
root.render(<Demo />);

export default Demo;