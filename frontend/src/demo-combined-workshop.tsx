import React from 'react';
import ReactDOM from 'react-dom/client';
import CombinedWorkshop90s from './components/CombinedWorkshop90s';
import './components/pixelatedSierra.css';
import { 
  ItemType, 
  ItemCategory, 
  MoonPhase, 
  AtelierSpecialization, 
  ElementType, 
  Rarity,
  PackagingDesign,
  Product
} from 'coven-shared';

// Demo standalone page for the combined workshop
const Demo = () => {
  // Demo data for workshop
  const mockData = {
    playerInventory: [
      {id: "1", baseId: "herb1", name: "Chamomile", type: "ingredient" as ItemType, category: "herb" as ItemCategory, quantity: 5, tarotCardId: "herb_chamomile", elementalPower: 50, moonAlignment: 60, seasonalPotency: 70, essenceCharge: 40, activeEffects: [], combosPotential: 60},
      {id: "2", baseId: "herb2", name: "Lavender", type: "ingredient" as ItemType, category: "herb" as ItemCategory, quantity: 3, tarotCardId: "herb_lavender", elementalPower: 55, moonAlignment: 65, seasonalPotency: 75, essenceCharge: 45, activeEffects: [], combosPotential: 65},
      {id: "3", baseId: "root1", name: "Ginseng", type: "ingredient" as ItemType, category: "root" as ItemCategory, quantity: 2, tarotCardId: "root_ginseng", elementalPower: 70, moonAlignment: 40, seasonalPotency: 60, essenceCharge: 80, activeEffects: [], combosPotential: 50}
    ],
    knownRecipes: [
      {id: "1", name: "Healing Tonic", type: "potion" as ItemType},
      {id: "2", name: "Dream Essence", type: "potion" as ItemType},
      {id: "3", name: "Charm of Protection", type: "charm" as ItemType}
    ],
    lunarPhase: "Full Moon" as MoonPhase,
    playerLevel: 5,
    playerSpecialization: "Essence" as AtelierSpecialization,
    playerCraftSkill: 7,
    playerArtistrySkill: 8,
    products: [
      {id: "product1", name: "Healing Tonic", description: "Restores vitality and health.", type: "potion" as ItemType, category: "potion" as ItemCategory, rarity: "common" as Rarity, value: 50, icon: "🧪", potencyBoost: 80},
      {id: "product2", name: "Lunar Essence", description: "Captures moonlight energy in liquid form.", type: "potion" as ItemType, category: "essence" as ItemCategory, rarity: "uncommon" as Rarity, value: 75, icon: "✨", potencyBoost: 85}
    ],
    packagingMaterials: [
      {id: "m1", name: "Glass", description: "Clear glass material for bottles.", materialType: "glass", icon: "🧪", durability: 7, qualityLevel: 8, quantity: 3, materialQuality: "fine", value: 25, elementalAffinity: "Water" as ElementType},
      {id: "m2", name: "Wood", description: "Polished wooden material for boxes.", materialType: "wood", icon: "🪵", durability: 8, qualityLevel: 7, quantity: 2, materialQuality: "common", value: 15, elementalAffinity: "Earth" as ElementType}
    ],
    designStyles: [
      {id: "d1", name: "Elegant", description: "A refined, sophisticated design style.", designStyle: "elegant", icon: "🎨", complexityLevel: 7, customerAppeal: 8, elementalAffinity: "Water" as ElementType, specializationAffinity: "Distillation" as AtelierSpecialization},
      {id: "d2", name: "Rustic", description: "A charming, natural design style.", designStyle: "rustic", icon: "🏡", complexityLevel: 5, customerAppeal: 7, elementalAffinity: "Earth" as ElementType, specializationAffinity: "Fermentation" as AtelierSpecialization}
    ],
    specialEffects: [
      {id: "e1", name: "Shimmer", description: "Adds a subtle shimmer effect.", effectType: "shimmer", icon: "✨", rarity: 6, power: 5, quantity: 2, potencyBonus: 10, durabilityEffect: 5, specializationAffinity: "Crystallization" as AtelierSpecialization}
    ],
    brands: [
      {id: "b1", name: "Moonlight Brews", description: "Your personal brand for magical potions.", icon: "🌙", reputation: 7, recognition: 6, tagline: "Brewing with celestial magic", colorPalette: ["#5d4e7b", "#8b7dac", "#e0d5f2"], brandValues: ["Quality", "Tradition", "Effectiveness"], specialization: "Essence" as AtelierSpecialization, elementalAffinity: "Spirit" as ElementType}
    ],
    packagingDesigns: [],
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