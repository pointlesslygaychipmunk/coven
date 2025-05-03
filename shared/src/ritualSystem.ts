// Ritual System - A tarot card-based ritual magic system

import { TarotCard, ElementType, MoonPhase, Season } from './types';

// Types of rituals available in the game
export type RitualType = 
  'growth' | 'harvest' | 'weather' | 'insight' | 
  'blessing' | 'transmutation' | 'harmony' | 'elemental';

// The effects a ritual can produce
export interface RitualEffect {
  type: string;
  power: number;
  description: string;
  elementBonus?: ElementType;
  moonPhaseBonus?: MoonPhase;
  seasonBonus?: Season;
}

// Structure for ritual card positions
export type CardPosition = 
  'center' | 
  'north' | 'east' | 'south' | 'west' | 
  'northeast' | 'southeast' | 'southwest' | 'northwest';

// Requirements for a ritual to be performed
export interface RitualRequirement {
  position: CardPosition;
  element?: ElementType;
  minimumRank?: number;
  specificCard?: string;
  category?: string;
  type?: string;
}

// Definition of a ritual
export interface Ritual {
  id: string;
  name: string;
  description: string;
  type: RitualType;
  manaCost: number;
  primaryElement: ElementType;
  secondaryElement?: ElementType;
  requirements: RitualRequirement[];
  effects: RitualEffect[];
  moonPhaseBonus?: MoonPhase;
  seasonBonus?: Season;
  unlockRequirement?: string;
}

// Evaluate a card's compatibility with a ritual position
export function evaluateCardForPosition(
  card: TarotCard,
  requirement: RitualRequirement
): number {
  let score = 0;
  
  // Element match is most important
  if (requirement.element && card.element === requirement.element) {
    score += 50;
  }
  
  // Rank requirement
  if (requirement.minimumRank && card.rank >= requirement.minimumRank) {
    score += 20;
  } else if (requirement.minimumRank && card.rank < requirement.minimumRank) {
    // Penalty for being below required rank
    score -= 30;
  }
  
  // Specific card match is perfect
  if (requirement.specificCard && card.id === requirement.specificCard) {
    score = 100; // Perfect match
    return score;
  }
  
  // Category match
  if (requirement.category && card.category === requirement.category) {
    score += 15;
  }
  
  // Type match
  if (requirement.type && card.type === requirement.type) {
    score += 15;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Calculate the overall ritual power based on card placements
export function calculateRitualPower(
  cards: Record<CardPosition, TarotCard | null>,
  ritual: Ritual,
  currentMoonPhase: MoonPhase,
  currentSeason: Season
): number {
  let totalPower = 0;
  let matchedPositions = 0;
  
  // Go through each ritual position
  ritual.requirements.forEach(req => {
    const card = cards[req.position];
    if (!card) return; // No card in this position
    
    const positionScore = evaluateCardForPosition(card, req);
    totalPower += positionScore;
    if (positionScore > 40) matchedPositions++; // Consider it a reasonable match
  });
  
  // Calculate average position score
  const positionAverage = ritual.requirements.length > 0 
    ? totalPower / ritual.requirements.length
    : 0;
  
  // Base power is the average position score (0-100)
  let ritualPower = positionAverage;
  
  // Bonuses for cosmic alignments
  if (ritual.moonPhaseBonus === currentMoonPhase) {
    ritualPower *= 1.5; // 50% bonus during aligned moon phase
  }
  
  if (ritual.seasonBonus === currentSeason) {
    ritualPower *= 1.3; // 30% bonus during aligned season
  }
  
  // Bonus for matching all positions reasonably well
  if (matchedPositions === ritual.requirements.length && ritual.requirements.length > 0) {
    ritualPower *= 1.2; // 20% bonus for having all positions filled appropriately
  }
  
  return ritualPower;
}

// Calculate chance of ritual success
export function calculateRitualSuccess(
  ritualPower: number, 
  skillLevel: number
): {
  successChance: number;
  potencyModifier: number;
} {
  // Base success chance scaled by ritual power and skill
  const baseSuccessChance = (ritualPower * 0.7) + (skillLevel * 3);
  
  // Clamp to reasonable values
  const successChance = Math.max(5, Math.min(95, baseSuccessChance));
  
  // How potent the effects will be if successful
  const potencyModifier = (ritualPower / 100) * (1 + (skillLevel * 0.1));
  
  return {
    successChance,
    potencyModifier: Math.max(0.1, Math.min(2, potencyModifier))
  };
}

// Available rituals in the game
export const rituals: Ritual[] = [
  // Growth Rituals
  {
    id: 'ritual-growth-garden',
    name: 'Garden Blessing',
    description: 'A ritual to bless your garden, enhancing growth and vitality of all plants.',
    type: 'growth',
    manaCost: 25,
    primaryElement: 'Earth',
    requirements: [
      { position: 'center', element: 'Earth', minimumRank: 4 },
      { position: 'north', element: 'Water' },
      { position: 'east', element: 'Fire' },
      { position: 'south', element: 'Earth' },
      { position: 'west', element: 'Air' }
    ],
    effects: [
      { type: 'growth', power: 20, description: 'Increases growth rate of all plants' },
      { type: 'health', power: 15, description: 'Increases health of all plants' }
    ],
    moonPhaseBonus: 'Full Moon',
    seasonBonus: 'Spring'
  },
  {
    id: 'ritual-growth-single',
    name: 'Essence Acceleration',
    description: 'Dramatically accelerate the growth of a single plant with concentrated essence.',
    type: 'growth',
    manaCost: 15,
    primaryElement: 'Earth',
    secondaryElement: 'Water',
    requirements: [
      { position: 'center', element: 'Earth', minimumRank: 3 },
      { position: 'north', element: 'Water' },
      { position: 'south', element: 'Earth' }
    ],
    effects: [
      { type: 'growth', power: 40, description: 'Dramatically increases growth rate of one plant' },
      { type: 'health', power: 20, description: 'Increases health of the plant' }
    ],
    moonPhaseBonus: 'Waxing Gibbous'
  },
  
  // Harvest Rituals
  {
    id: 'ritual-harvest-quality',
    name: 'Quality Infusion',
    description: 'Enhance the quality of all harvestable plants, yielding higher quality ingredients.',
    type: 'harvest',
    manaCost: 30,
    primaryElement: 'Earth',
    secondaryElement: 'Spirit',
    requirements: [
      { position: 'center', element: 'Spirit', minimumRank: 5 },
      { position: 'north', element: 'Earth' },
      { position: 'east', element: 'Earth' },
      { position: 'south', element: 'Earth' },
      { position: 'west', element: 'Earth' }
    ],
    effects: [
      { type: 'quality', power: 30, description: 'Increases quality of next harvest' },
      { type: 'yield', power: 15, description: 'Slightly increases yield of next harvest' }
    ],
    moonPhaseBonus: 'Full Moon',
    seasonBonus: 'Fall'
  },
  
  // Weather Rituals
  {
    id: 'ritual-weather-control',
    name: 'Weather Manipulation',
    description: 'Control tomorrow\'s weather by channeling elemental forces.',
    type: 'weather',
    manaCost: 40,
    primaryElement: 'Air',
    secondaryElement: 'Water',
    requirements: [
      { position: 'center', element: 'Air', minimumRank: 6 },
      { position: 'north', element: 'Water' },
      { position: 'east', element: 'Fire' },
      { position: 'south', element: 'Earth' },
      { position: 'west', element: 'Air' }
    ],
    effects: [
      { type: 'weather', power: 100, description: 'Set tomorrow\'s weather' }
    ],
    moonPhaseBonus: 'New Moon'
  },
  {
    id: 'ritual-rain-calling',
    name: 'Rain Calling',
    description: 'Call forth rain to nourish your garden and increase soil moisture.',
    type: 'weather',
    manaCost: 25,
    primaryElement: 'Water',
    requirements: [
      { position: 'center', element: 'Water', minimumRank: 4 },
      { position: 'north', element: 'Water' },
      { position: 'east', element: 'Water' },
      { position: 'west', element: 'Air' }
    ],
    effects: [
      { type: 'moisture', power: 50, description: 'Increases soil moisture across garden' },
      { type: 'weather', power: 70, description: 'Increases chance of rain tomorrow' }
    ],
    moonPhaseBonus: 'Waning Gibbous',
    seasonBonus: 'Spring'
  },
  
  // Insight Rituals
  {
    id: 'ritual-market-insight',
    name: 'Market Divination',
    description: 'Gain insight into future market prices and demands.',
    type: 'insight',
    manaCost: 20,
    primaryElement: 'Spirit',
    secondaryElement: 'Air',
    requirements: [
      { position: 'center', element: 'Spirit', minimumRank: 3 },
      { position: 'east', element: 'Air' },
      { position: 'west', element: 'Earth' }
    ],
    effects: [
      { type: 'marketInsight', power: 80, description: 'Reveals upcoming market price changes' }
    ],
    moonPhaseBonus: 'First Quarter'
  },
  
  // Blessing Rituals
  {
    id: 'ritual-soil-fertility',
    name: 'Soil Consecration',
    description: 'Consecrate your garden soil, enhancing its fertility for future plantings.',
    type: 'blessing',
    manaCost: 35,
    primaryElement: 'Earth',
    requirements: [
      { position: 'center', element: 'Earth', minimumRank: 5 },
      { position: 'north', element: 'Water' },
      { position: 'east', element: 'Fire' },
      { position: 'south', element: 'Earth' },
      { position: 'west', element: 'Spirit' }
    ],
    effects: [
      { type: 'fertility', power: 40, description: 'Increases soil fertility across garden' }
    ],
    moonPhaseBonus: 'Waxing Crescent',
    seasonBonus: 'Spring'
  },
  
  // Transmutation Rituals
  {
    id: 'ritual-essence-transmutation',
    name: 'Essence Transmutation',
    description: 'Transform a group of common ingredients into higher quality or rarer ones.',
    type: 'transmutation',
    manaCost: 45,
    primaryElement: 'Fire',
    secondaryElement: 'Spirit',
    requirements: [
      { position: 'center', element: 'Fire', minimumRank: 7 },
      { position: 'north', element: 'Spirit' },
      { position: 'east', element: 'Fire' },
      { position: 'south', element: 'Earth' },
      { position: 'west', element: 'Water' }
    ],
    effects: [
      { type: 'transmutation', power: 70, description: 'Transmutes selected ingredients into higher quality versions' }
    ],
    moonPhaseBonus: 'Full Moon',
    seasonBonus: 'Summer'
  },
  
  // Harmony Rituals
  {
    id: 'ritual-elemental-harmony',
    name: 'Elemental Harmony',
    description: 'Align all five elements in perfect balance to receive universal blessing on your endeavors.',
    type: 'harmony',
    manaCost: 60,
    primaryElement: 'Spirit',
    requirements: [
      { position: 'center', element: 'Spirit', minimumRank: 8 },
      { position: 'north', element: 'Water' },
      { position: 'east', element: 'Fire' },
      { position: 'south', element: 'Earth' },
      { position: 'west', element: 'Air' },
      { position: 'northeast', element: 'Spirit' }
    ],
    effects: [
      { type: 'harmony', power: 100, description: 'Provides universal blessing on all activities' },
      { type: 'mana', power: 50, description: 'Increases mana regeneration' }
    ],
    moonPhaseBonus: 'Full Moon'
  },
  
  // Elemental Rituals
  {
    id: 'ritual-fire-infusion',
    name: 'Fire Infusion',
    description: 'Infuse your brewing with the essence of fire, enhancing potency and transformative properties.',
    type: 'elemental',
    manaCost: 30,
    primaryElement: 'Fire',
    requirements: [
      { position: 'center', element: 'Fire', minimumRank: 5 },
      { position: 'east', element: 'Fire' },
      { position: 'west', element: 'Fire' }
    ],
    effects: [
      { type: 'brewing', power: 40, description: 'Enhances fire-aspected brewing' },
      { type: 'potency', power: 30, description: 'Increases potency of next fire brew' }
    ],
    elementBonus: 'Fire',
    moonPhaseBonus: 'Waxing Gibbous',
    seasonBonus: 'Summer'
  },
  {
    id: 'ritual-water-infusion',
    name: 'Water Infusion',
    description: 'Infuse your brewing with the essence of water, enhancing purification and flowing properties.',
    type: 'elemental',
    manaCost: 30,
    primaryElement: 'Water',
    requirements: [
      { position: 'center', element: 'Water', minimumRank: 5 },
      { position: 'north', element: 'Water' },
      { position: 'south', element: 'Water' }
    ],
    effects: [
      { type: 'brewing', power: 40, description: 'Enhances water-aspected brewing' },
      { type: 'stability', power: 30, description: 'Increases stability of next water brew' }
    ],
    elementBonus: 'Water',
    moonPhaseBonus: 'Full Moon',
    seasonBonus: 'Winter'
  },
  {
    id: 'ritual-earth-infusion',
    name: 'Earth Infusion',
    description: 'Infuse your brewing with the essence of earth, enhancing stability and nourishing properties.',
    type: 'elemental',
    manaCost: 30,
    primaryElement: 'Earth',
    requirements: [
      { position: 'center', element: 'Earth', minimumRank: 5 },
      { position: 'south', element: 'Earth' },
      { position: 'north', element: 'Earth' }
    ],
    effects: [
      { type: 'brewing', power: 40, description: 'Enhances earth-aspected brewing' },
      { type: 'quality', power: 30, description: 'Increases quality of next earth brew' }
    ],
    elementBonus: 'Earth',
    moonPhaseBonus: 'Last Quarter',
    seasonBonus: 'Fall'
  },
  {
    id: 'ritual-air-infusion',
    name: 'Air Infusion',
    description: 'Infuse your brewing with the essence of air, enhancing clarity and invigorating properties.',
    type: 'elemental',
    manaCost: 30,
    primaryElement: 'Air',
    requirements: [
      { position: 'center', element: 'Air', minimumRank: 5 },
      { position: 'west', element: 'Air' },
      { position: 'east', element: 'Air' }
    ],
    effects: [
      { type: 'brewing', power: 40, description: 'Enhances air-aspected brewing' },
      { type: 'essence', power: 30, description: 'Increases essence yield of next air brew' }
    ],
    elementBonus: 'Air',
    moonPhaseBonus: 'Waning Crescent',
    seasonBonus: 'Spring'
  },
  {
    id: 'ritual-spirit-infusion',
    name: 'Spirit Infusion',
    description: 'Infuse your brewing with the essence of spirit, enhancing magical and transcendent properties.',
    type: 'elemental',
    manaCost: 40,
    primaryElement: 'Spirit',
    requirements: [
      { position: 'center', element: 'Spirit', minimumRank: 6 },
      { position: 'northeast', element: 'Spirit' },
      { position: 'southwest', element: 'Spirit' }
    ],
    effects: [
      { type: 'brewing', power: 50, description: 'Enhances spirit-aspected brewing' },
      { type: 'effect', power: 40, description: 'Increases magical effect of next spirit brew' }
    ],
    elementBonus: 'Spirit',
    moonPhaseBonus: 'New Moon'
  }
];

// Helper to find a ritual by ID
export function findRitualById(id: string): Ritual | undefined {
  return rituals.find(ritual => ritual.id === id);
}

// Filter rituals by type
export function getRitualsByType(type: RitualType): Ritual[] {
  return rituals.filter(ritual => ritual.type === type);
}

// Filter rituals by primary element
export function getRitualsByElement(element: ElementType): Ritual[] {
  return rituals.filter(ritual => ritual.primaryElement === element);
}

// Get rituals that are empowered by current moon phase
export function getRitualsByMoonPhase(moonPhase: MoonPhase): Ritual[] {
  return rituals.filter(ritual => ritual.moonPhaseBonus === moonPhase);
}

// Apply ritual effects based on the ritual type
export function applyRitualEffects(
  ritual: Ritual,
  potencyModifier: number,
  targetId?: number
): any {
  // Base effects object
  const effects: Record<string, any> = {};
  
  // Apply each effect with the potency modifier
  ritual.effects.forEach(effect => {
    effects[effect.type] = Math.round(effect.power * potencyModifier);
  });
  
  // Add metadata
  effects.ritualId = ritual.id;
  effects.ritualType = ritual.type;
  effects.targetId = targetId;
  
  return effects;
}