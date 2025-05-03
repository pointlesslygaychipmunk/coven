# New Coven: Tarot Card System

## Overview

The Tarot Card System is a unified object system in New Coven that represents all game objects (herbs, trees, ingredients, etc.) as tarot cards. This system creates a cohesive framework for object interactions based on cosmic associations, elements, and traditional Hanbang practices.

## Core Concepts

### 1. Tarot Card Type

Each item in the game is represented by a `TarotCard` type with properties that define its:

- **Identity**: Basic information like name, ID, category, and type
- **Visual Presentation**: Artwork path and frame type for UI rendering
- **Cosmic Associations**: Element affinity, moon phase affinity, and seasonal affinity
- **Gameplay Values**: Rank (power level), essence (mana value), and rarity
- **Game Mechanics**: Primary and secondary effects, plus combo relationships with other cards
- **Growth Properties**: For plantable cards (growth time, yield, soil preference)
- **Brewing Properties**: For ingredients used in brewing (potency, stability)
- **Market Properties**: Base value and price fluctuation characteristics
- **Lore**: Description and traditional Hanbang uses

### 2. Elements

The system is built around five elemental affinities:

- **Earth**: Represents stability, growth, and nurturing energy
- **Water**: Represents flow, adaptation, and purification
- **Fire**: Represents transformation, energy, and purification
- **Air**: Represents intellect, connection, and movement
- **Spirit**: Represents essence, consciousness, and magic

### 3. Tree-Mana System

Trees in the garden generate mana, creating a strategic resource management system:

- Different tree types produce different amounts of mana
- Mana generation is influenced by moon phases and seasons
- Players must balance garden space between mana-generating trees and ingredient-producing plants

### 4. Hanbang Brewing Methods

Four traditional Korean medicine methods are implemented:

- **Infusion (Water)**: Creating tonics and serums
- **Fermentation (Earth)**: Creating masks and treatments
- **Distillation (Fire)**: Extracting essential oils
- **Crystallization (Air)**: Creating charms and talismans

### 5. Card Combos and Synergies

Cards can be combined for enhanced effects:

- Cards have primary and secondary effects
- Certain combinations of cards create synergistic effects
- Combinations are influenced by elemental affinities, moon phases, and seasons

## Implementation Details

### Type Definitions (shared/src/types.ts)

The core type system defines the relationships and properties of all tarot cards.

```typescript
export type TarotCard = {
  // Identity
  id: string;                     // Unique identifier
  name: string;                   // Display name
  category: ItemCategory;         // Item category
  type: ItemType;                 // Item type classification
  
  // Visual Presentation
  artworkPath: string;            // Path to card artwork
  frameType: CardFrame;           // Visual frame style
  
  // Cosmic Associations
  element: ElementType;           // Earth, Water, Fire, Air, Spirit
  moonPhaseAffinity: MoonPhase;   // Which moon phase empowers this card
  seasonAffinity: Season;         // Which season empowers this card
  
  // Gameplay Values
  rank: number;                   // Power level (1-10)
  essence: number;                // Mana/energy value
  rarity: Rarity;                 // Rarity tier
  
  // Game Mechanics
  primaryEffect: CardEffect;      // Main effect when used
  secondaryEffect?: CardEffect;   // Optional secondary effect
  combos: ComboRef[];             // Cards this combos with
  
  // Growth Properties (for Garden)
  growthTime?: number;            // Time to mature if plantable
  yield?: number;                 // Amount harvested if plantable
  soilPreference?: SoilType;      // Preferred soil if plantable
  manaGeneration?: number;        // Mana generated per turn (for trees)
  
  // Brewing Properties
  potency?: number;               // Strength in brews (1-10)
  stability?: number;             // How stable in mixtures (1-10)
  
  // Market Properties
  baseValue: number;              // Base market value
  demandFluctuation: number;      // How much price varies (1-10)
  
  // Lore
  description: string;            // Card lore and description
  traditionUse: string;           // Historical use in Hanbang
};
```

### Card Database (shared/src/tarotCards.ts)

This file contains all tarot card definitions and helper functions to find, filter, and sort cards.

### Components

#### 1. HanbangBrewing (frontend/src/components/HanbangBrewing.tsx)

- Replaced separate brewing and atelier components
- Implements four Hanbang brewing methods
- Shows card compatibility and interactions
- Creates potions and skincare products based on tarot card properties

#### 2. Garden (frontend/src/components/Garden.tsx)

- Uses tarot cards instead of seeds for planting
- Implements the tree-mana system for resource generation
- Shows elemental affinities and environmental interactions
- Displays card properties and growth stages

#### 3. Market (frontend/src/components/Market.tsx)

- Enhanced to display tarot card information
- Shows elemental affinities and cosmic associations
- Supports buying and selling cards based on their properties

#### 4. TarotCollection (frontend/src/components/TarotCollection.tsx)

- A dedicated view to browse and examine all collected tarot cards
- Provides filtering by element, category, and other properties
- Shows detailed card information including combinations and effects
- Highlights cards that are empowered by current moon phase or season

## Gameplay Implications

### Strategic Depth

- **Garden Planning**: Players must balance between mana-producing trees and ingredient-producing plants
- **Brewing Strategy**: Selecting ingredients with complementary elements and cosmic affinities
- **Collection Management**: Gathering cards with synergistic combinations
- **Seasonal Planning**: Timing activities around moon phases and seasons for maximum effectiveness

### Economic System

- Card values fluctuate based on market demand
- Rarity affects base value and market behavior
- Brewing high-quality products requires strategic card combinations

### Aesthetic Integration

- All game elements share a consistent visual language through the tarot card system
- The 90s-inspired UI highlights card elements and properties
- Authentic Hanbang principles are integrated into the game mechanics

## Future Enhancements

1. **Card Rituals**: Special ceremonies using specific card combinations
2. **Card Transformations**: Allowing cards to evolve under certain conditions
3. **Card Trading**: Multiplayer exchange system for rare cards
4. **Seasonal Events**: Special cards available only during certain seasons or moon phases
5. **Card Quests**: Specific challenges to collect or use certain card combinations

## Technical Notes

- The tarot card system uses TypeScript's type system for strong type safety
- Components access card data through helper functions that handle lookups
- Mana generation calculations include environmental modifiers
- The UI renders different visual styles based on card elements