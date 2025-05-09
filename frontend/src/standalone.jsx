// standalone.jsx - Create a standalone test for the workshop
import React from 'react';
import ReactDOM from 'react-dom/client';
import CombinedWorkshop90s from './components/CombinedWorkshop90s';
import './index.css';
import './components/pixelatedSierra.css';

// Mock data for the standalone workshop
const mockProps = {
  playerInventory: [
    {id: "1", baseId: "herb1", name: "Chamomile", type: "ingredient", category: "herb", quantity: 5, tarotCardId: "herb_chamomile", elementalPower: 50, moonAlignment: 60, seasonalPotency: 70, essenceCharge: 40, activeEffects: [], combosPotential: 60},
    {id: "2", baseId: "herb2", name: "Lavender", type: "ingredient", category: "herb", quantity: 3, tarotCardId: "herb_lavender", elementalPower: 55, moonAlignment: 65, seasonalPotency: 75, essenceCharge: 45, activeEffects: [], combosPotential: 65},
    {id: "3", baseId: "root1", name: "Ginseng", type: "ingredient", category: "root", quantity: 2, tarotCardId: "root_ginseng", elementalPower: 70, moonAlignment: 40, seasonalPotency: 60, essenceCharge: 80, activeEffects: [], combosPotential: 50}
  ],
  knownRecipes: [
    {id: "1", name: "Healing Tonic", type: "potion"},
    {id: "2", name: "Dream Essence", type: "potion"},
    {id: "3", name: "Charm of Protection", type: "charm"}
  ],
  lunarPhase: "Full Moon",
  playerLevel: 5,
  playerSpecialization: "Essence",
  playerCraftSkill: 7,
  playerArtistrySkill: 8,
  products: [
    {id: "product1", name: "Healing Tonic", description: "Restores vitality and health.", type: "potion", category: "potion", rarity: "common", value: 50, icon: "🧪", potencyBoost: 80},
    {id: "product2", name: "Lunar Essence", description: "Captures moonlight energy in liquid form.", type: "potion", category: "essence", rarity: "uncommon", value: 75, icon: "✨", potencyBoost: 85}
  ],
  packagingMaterials: [
    {id: "m1", name: "Glass", description: "Clear glass material for bottles.", materialType: "glass", icon: "🧪", durability: 7, qualityLevel: 8, quantity: 3, materialQuality: "fine", value: 25, elementalAffinity: "Water"},
    {id: "m2", name: "Wood", description: "Polished wooden material for boxes.", materialType: "wood", icon: "🪵", durability: 8, qualityLevel: 7, quantity: 2, materialQuality: "common", value: 15, elementalAffinity: "Earth"}
  ],
  designStyles: [
    {id: "d1", name: "Elegant", description: "A refined, sophisticated design style.", designStyle: "elegant", icon: "🎨", complexityLevel: 7, customerAppeal: 8, elementalAffinity: "Water", specializationAffinity: "Distillation"},
    {id: "d2", name: "Rustic", description: "A charming, natural design style.", designStyle: "rustic", icon: "🏡", complexityLevel: 5, customerAppeal: 7, elementalAffinity: "Earth", specializationAffinity: "Fermentation"}
  ],
  specialEffects: [
    {id: "e1", name: "Shimmer", description: "Adds a subtle shimmer effect.", effectType: "shimmer", icon: "✨", rarity: 6, power: 5, quantity: 2, potencyBonus: 10, durabilityEffect: 5, specializationAffinity: "Crystallization"}
  ],
  brands: [
    {id: "b1", name: "Moonlight Brews", description: "Your personal brand for magical potions.", icon: "🌙", reputation: 7, recognition: 6, tagline: "Brewing with celestial magic", colorPalette: ["#5d4e7b", "#8b7dac", "#e0d5f2"], brandValues: ["Quality", "Tradition", "Effectiveness"], specialization: "Essence", elementalAffinity: "Spirit"}
  ],
  packagingDesigns: [],
  onBrew: (ingredientIds, puzzleBonus, recipeId) => console.log('Brewing:', ingredientIds, puzzleBonus, recipeId),
  onCraftItem: (ingredientIds, resultItemId) => console.log('Crafting:', ingredientIds, resultItemId),
  onDesignCreate: (design) => { console.log('Design created:', design); return Promise.resolve(); },
  onApplyToProduct: (design, product) => { console.log('Design applied:', design, product); return Promise.resolve(); }
};

// Create the React root and render the workshop
export const renderStandaloneApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Error: Cannot find root element");
    return;
  }
  
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px',
        boxSizing: 'border-box',
        backgroundColor: '#e8d5b0'
      }}>
        <div style={{
          width: '1024px',
          height: '768px',
          border: '3px solid #8b6d45',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#f4eee2'
        }} className="pixelated">
          <CombinedWorkshop90s {...mockProps} />
        </div>
      </div>
    </React.StrictMode>
  );
};

// Auto-run if this is the main entry point
if (window.location.pathname.includes('standalone')) {
  document.addEventListener('DOMContentLoaded', renderStandaloneApp);
}