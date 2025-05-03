import { 
  Season, 
  MoonPhase, 
  WeatherFate, 
  ElementType,
  Plant,
  DisplayPlant
} from 'coven-shared';

/**
 * Weather effect interface defining how weather impacts various aspects of gardening
 */
interface WeatherEffect {
  moisture: number;       // Effect on soil moisture
  growth: number;         // Effect on plant growth
  health: number;         // Effect on plant health
  mana: number;           // Effect on mana generation
  description: string;    // Human-readable description
  icon: string;           // Icon for UI representation
  visualEffect: string;   // CSS class name for visual effect
}

/**
 * Detailed weather effects for all weather types
 */
export const WEATHER_EFFECTS: Record<WeatherFate, WeatherEffect> = {
  normal: {
    moisture: -5,
    growth: 1.0,
    health: 0,
    mana: 1.0,
    description: "Clear skies provide balanced growing conditions.",
    icon: "🌤️",
    visualEffect: "weather-normal"
  },
  clear: {
    moisture: -8,
    growth: 1.0,
    health: 0,
    mana: 1.1,
    description: "Clear, sunny conditions boost mana but dry out soil faster.",
    icon: "☀️",
    visualEffect: "weather-clear"
  },
  rainy: {
    moisture: 15,
    growth: 1.2,
    health: 1,
    mana: 0.9,
    description: "Rain increases growth but slightly reduces mana generation.",
    icon: "🌧️",
    visualEffect: "weather-rainy"
  },
  dry: {
    moisture: -20,
    growth: 0.8,
    health: -2,
    mana: 1.2,
    description: "Dry conditions stress plants but enhance mana concentration.",
    icon: "☀️",
    visualEffect: "weather-dry"
  },
  foggy: {
    moisture: 5,
    growth: 0.9,
    health: 0,
    mana: 1.3,
    description: "Fog preserves moisture and significantly enhances mana flow.",
    icon: "🌫️",
    visualEffect: "weather-foggy"
  },
  windy: {
    moisture: -15,
    growth: 0.9,
    health: -1,
    mana: 1.1,
    description: "Wind dries out plants but brings fresh elemental energies.",
    icon: "💨",
    visualEffect: "weather-windy"
  },
  stormy: {
    moisture: 25,
    growth: 0.7,
    health: -3,
    mana: 1.5,
    description: "Storms damage plants but bring powerful magical energies.",
    icon: "⛈️",
    visualEffect: "weather-stormy"
  },
  cloudy: {
    moisture: -3,
    growth: 0.95,
    health: 0,
    mana: 0.95,
    description: "Cloudy conditions provide moderate growing environment.",
    icon: "☁️",
    visualEffect: "weather-cloudy"
  }
};

/**
 * Moon phase effect interface defining how lunar phases impact various aspects of gardening
 */
interface MoonPhaseEffect {
  growth: number;         // Effect on plant growth
  harvest: number;        // Effect on harvested yield
  mutation: number;       // Effect on mutation chance
  mana: number;           // Effect on mana generation
  description: string;    // Human-readable description
  icon: string;           // Icon for UI representation
  visualEffect: string;   // CSS class name for visual effect
}

/**
 * Detailed moon phase effects for all lunar phases
 */
export const MOON_PHASE_EFFECTS: Record<MoonPhase, MoonPhaseEffect> = {
  "New Moon": {
    growth: 0.9,
    harvest: 0.8,
    mutation: 1.5,
    mana: 0.7,
    description: "The New Moon increases mutation chance but reduces growth and yield.",
    icon: "🌑",
    visualEffect: "moon-new"
  },
  "Waxing Crescent": {
    growth: 1.1,
    harvest: 0.9,
    mutation: 1.2,
    mana: 0.9,
    description: "The Waxing Crescent is good for starting new plant growth.",
    icon: "🌒",
    visualEffect: "moon-waxing-crescent"
  },
  "First Quarter": {
    growth: 1.2,
    harvest: 1.0,
    mutation: 1.0,
    mana: 1.0,
    description: "The First Quarter provides balanced conditions for growth.",
    icon: "🌓",
    visualEffect: "moon-first-quarter"
  },
  "Waxing Gibbous": {
    growth: 1.3,
    harvest: 1.1,
    mutation: 0.9,
    mana: 1.2,
    description: "The Waxing Gibbous accelerates plant growth and mana generation.",
    icon: "🌔",
    visualEffect: "moon-waxing-gibbous"
  },
  "Full Moon": {
    growth: 1.5,
    harvest: 1.5,
    mutation: 1.8,
    mana: 1.5,
    description: "The Full Moon maximizes growth, harvest yield, mutation chance, and mana.",
    icon: "🌕",
    visualEffect: "moon-full"
  },
  "Waning Gibbous": {
    growth: 1.2,
    harvest: 1.3,
    mutation: 0.9,
    mana: 1.3,
    description: "The Waning Gibbous is excellent for harvesting and mana collection.",
    icon: "🌖",
    visualEffect: "moon-waning-gibbous"
  },
  "Last Quarter": {
    growth: 1.0,
    harvest: 1.2,
    mutation: 0.8,
    mana: 1.1,
    description: "The Last Quarter is good for harvesting but growth slows.",
    icon: "🌗",
    visualEffect: "moon-last-quarter"
  },
  "Waning Crescent": {
    growth: 0.9,
    harvest: 1.0,
    mutation: 1.1,
    mana: 0.8,
    description: "The Waning Crescent is a time for endings, with slow growth but stable harvest.",
    icon: "🌘",
    visualEffect: "moon-waning-crescent"
  }
};

/**
 * Season effect interface defining how seasons impact various aspects of gardening
 */
interface SeasonEffect {
  generalGrowth: number;  // Base effect on all plants
  elements: Record<ElementType, number>; // Element-specific modifiers
  mana: number;           // Effect on mana generation
  mutation: number;       // Effect on mutation chance
  description: string;    // Human-readable description
  icon: string;           // Icon for UI representation
  visualEffect: string;   // CSS class name for visual effect
}

/**
 * Detailed season effects for all seasons
 */
export const SEASON_EFFECTS: Record<Season, SeasonEffect> = {
  "Spring": {
    generalGrowth: 1.3,
    elements: {
      "Earth": 1.5,
      "Water": 1.2,
      "Fire": 0.9,
      "Air": 1.1,
      "Spirit": 1.0
    },
    mana: 1.2,
    mutation: 1.3,
    description: "Spring is a time of renewal, favoring Earth and Water elements.",
    icon: "🌱",
    visualEffect: "season-spring"
  },
  "Summer": {
    generalGrowth: 1.2,
    elements: {
      "Earth": 1.0,
      "Water": 0.8,
      "Fire": 1.5,
      "Air": 1.2,
      "Spirit": 1.1
    },
    mana: 1.1,
    mutation: 1.0,
    description: "Summer heat favors Fire and Air elements.",
    icon: "☀️",
    visualEffect: "season-summer"
  },
  "Fall": {
    generalGrowth: 0.9,
    elements: {
      "Earth": 1.2,
      "Water": 1.0,
      "Fire": 1.0,
      "Air": 1.3,
      "Spirit": 1.2
    },
    mana: 1.3,
    mutation: 1.1,
    description: "Fall is harvest time, with Air and Spirit elements thriving.",
    icon: "🍂",
    visualEffect: "season-fall"
  },
  "Winter": {
    generalGrowth: 0.7,
    elements: {
      "Earth": 0.8,
      "Water": 1.4,
      "Fire": 0.7,
      "Air": 0.9,
      "Spirit": 1.5
    },
    mana: 1.4,
    mutation: 0.9,
    description: "Winter slows growth but enhances Water and Spirit elements and mana.",
    icon: "❄️",
    visualEffect: "season-winter"
  }
};

/**
 * Calculate the combined environmental effect on a plant
 * @param plant Plant to calculate effect for
 * @param season Current season
 * @param moonPhase Current moon phase 
 * @param weather Current weather
 * @returns Environmental effect multiplier
 */
export function calculateEnvironmentalEffect(
  plant: Plant | DisplayPlant,
  season: Season,
  moonPhase: MoonPhase,
  weather: WeatherFate
): { 
  growthMultiplier: number; 
  healthEffect: number;
  manaMultiplier: number;
  description: string;
} {
  // Get element from tarot card ID
  let element: ElementType = 'Earth'; // Default
  
  if ('tarotCardId' in plant && plant.tarotCardId) {
    if (plant.tarotCardId.includes('_')) {
      // Format is typically "category_name"
      const category = plant.tarotCardId.split('_')[0];
      
      // Map categories to likely elements
      const categoryToElement: Record<string, ElementType> = {
        'herb': 'Air',
        'flower': 'Water',
        'root': 'Earth',
        'tree': 'Earth',
        'mushroom': 'Spirit',
        'fire': 'Fire'
      };
      
      element = categoryToElement[category] || 'Earth';
    }
  }
  
  // Get each environmental effect
  const weatherEffect = WEATHER_EFFECTS[weather];
  const moonEffect = MOON_PHASE_EFFECTS[moonPhase];
  const seasonEffect = SEASON_EFFECTS[season];
  
  // Calculate growth multiplier
  let growthMultiplier = 1.0;
  growthMultiplier *= weatherEffect.growth;
  growthMultiplier *= moonEffect.growth;
  growthMultiplier *= seasonEffect.generalGrowth;
  growthMultiplier *= seasonEffect.elements[element];
  
  // Calculate health effect
  const healthEffect = weatherEffect.health;
  
  // Calculate mana multiplier
  let manaMultiplier = 1.0;
  manaMultiplier *= weatherEffect.mana;
  manaMultiplier *= moonEffect.mana;
  manaMultiplier *= seasonEffect.mana;
  
  // Create description
  let description = '';
  
  // Add most significant effect to description
  const significantEffects = [];
  
  if (weatherEffect.growth !== 1.0) {
    significantEffects.push(`${weather} weather ${weatherEffect.growth > 1.0 ? 'boosts' : 'slows'} growth`);
  }
  
  if (moonEffect.growth !== 1.0 || moonEffect.mana !== 1.0) {
    significantEffects.push(`${moonPhase} ${moonEffect.growth > 1.0 ? 'enhances growth' : moonEffect.mana > 1.0 ? 'increases mana' : 'weakens effects'}`);
  }
  
  if (seasonEffect.elements[element] !== 1.0) {
    significantEffects.push(`${element} plants ${seasonEffect.elements[element] > 1.0 ? 'thrive' : 'struggle'} in ${season}`);
  }
  
  description = significantEffects.join('. ');
  if (description === '') {
    description = 'Environmental conditions are neutral.';
  }
  
  return {
    growthMultiplier,
    healthEffect,
    manaMultiplier,
    description
  };
}

/**
 * Generate a weather forecast for upcoming phases
 * @param currentWeather Current weather
 * @param days Number of days to forecast
 * @returns Array of forecasted weather
 */
export function generateWeatherForecast(
  currentWeather: WeatherFate,
  days: number = 3
): { weather: WeatherFate; description: string; icon: string }[] {
  const forecast: { weather: WeatherFate; description: string; icon: string }[] = [];
  const allWeathers: WeatherFate[] = ['normal', 'clear', 'rainy', 'dry', 'foggy', 'windy', 'stormy', 'cloudy'];
  
  // Weather transition probabilities
  const transitions: Record<WeatherFate, Record<WeatherFate, number>> = {
    normal: { normal: 0.3, clear: 0.25, rainy: 0.1, dry: 0.1, foggy: 0.1, windy: 0.1, stormy: 0.0, cloudy: 0.05 },
    clear: { normal: 0.2, clear: 0.4, rainy: 0.05, dry: 0.2, foggy: 0.0, windy: 0.1, stormy: 0.0, cloudy: 0.05 },
    rainy: { normal: 0.2, clear: 0.05, rainy: 0.3, dry: 0.0, foggy: 0.1, windy: 0.1, stormy: 0.15, cloudy: 0.1 },
    dry: { normal: 0.15, clear: 0.3, rainy: 0.05, dry: 0.4, foggy: 0.0, windy: 0.1, stormy: 0.0, cloudy: 0.0 },
    foggy: { normal: 0.2, clear: 0.1, rainy: 0.15, dry: 0.0, foggy: 0.3, windy: 0.05, stormy: 0.05, cloudy: 0.15 },
    windy: { normal: 0.2, clear: 0.15, rainy: 0.1, dry: 0.1, foggy: 0.05, windy: 0.3, stormy: 0.05, cloudy: 0.05 },
    stormy: { normal: 0.1, clear: 0.0, rainy: 0.25, dry: 0.0, foggy: 0.1, windy: 0.15, stormy: 0.25, cloudy: 0.15 },
    cloudy: { normal: 0.15, clear: 0.1, rainy: 0.2, dry: 0.05, foggy: 0.1, windy: 0.1, stormy: 0.1, cloudy: 0.2 }
  };
  
  let nextWeather = currentWeather;
  
  for (let i = 0; i < days; i++) {
    // Determine next weather based on transition probabilities
    const rand = Math.random();
    let cumulativeProb = 0;
    let foundNext = false;
    
    for (const weather of allWeathers) {
      cumulativeProb += transitions[nextWeather][weather];
      if (rand < cumulativeProb && !foundNext) {
        nextWeather = weather;
        foundNext = true;
      }
    }
    
    // Add to forecast
    forecast.push({
      weather: nextWeather,
      description: WEATHER_EFFECTS[nextWeather].description,
      icon: WEATHER_EFFECTS[nextWeather].icon
    });
  }
  
  return forecast;
}

/**
 * Get the next moon phase in sequence
 * @param currentPhase Current moon phase
 * @returns Next moon phase
 */
export function getNextMoonPhase(currentPhase: MoonPhase): MoonPhase {
  const phases: MoonPhase[] = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent'
  ];
  
  const currentIndex = phases.indexOf(currentPhase);
  if (currentIndex === -1) return 'New Moon'; // Default if invalid
  
  const nextIndex = (currentIndex + 1) % phases.length;
  return phases[nextIndex];
}

/**
 * Get the next season in sequence
 * @param currentSeason Current season
 * @returns Next season
 */
export function getNextSeason(currentSeason: Season): Season {
  const seasons: Season[] = ['Spring', 'Summer', 'Fall', 'Winter'];
  
  const currentIndex = seasons.indexOf(currentSeason);
  if (currentIndex === -1) return 'Spring'; // Default if invalid
  
  const nextIndex = (currentIndex + 1) % seasons.length;
  return seasons[nextIndex];
}

/**
 * Get CSS class for current weather effect
 * @param weather Current weather
 * @returns CSS class name for weather effect
 */
export function getWeatherEffectClass(weather: WeatherFate): string {
  return WEATHER_EFFECTS[weather]?.visualEffect || 'weather-normal';
}

/**
 * Get CSS class for current moon phase effect
 * @param moonPhase Current moon phase
 * @returns CSS class name for moon phase effect
 */
export function getMoonPhaseEffectClass(moonPhase: MoonPhase): string {
  return MOON_PHASE_EFFECTS[moonPhase]?.visualEffect || 'moon-normal';
}

/**
 * Get CSS class for current seasonal effect
 * @param season Current season
 * @returns CSS class name for seasonal effect
 */
export function getSeasonEffectClass(season: Season): string {
  return SEASON_EFFECTS[season]?.visualEffect || 'season-normal';
}

/**
 * Calculate elemental affinity score between a plant and garden plot
 * @param plantElement Plant's elemental affinity
 * @param plotElement Garden plot's elemental influence
 * @returns Affinity score (-1 to 1)
 */
export function calculateElementalAffinity(
  plantElement: ElementType,
  plotElement: ElementType
): number {
  // Elemental affinities
  const affinities: Record<ElementType, Record<ElementType, number>> = {
    'Earth': { 'Earth': 0.8, 'Water': 1.0, 'Fire': -0.5, 'Air': 0.3, 'Spirit': 0.5 },
    'Water': { 'Earth': 1.0, 'Water': 0.8, 'Fire': -0.8, 'Air': 0.2, 'Spirit': 0.7 },
    'Fire': { 'Earth': -0.5, 'Water': -0.8, 'Fire': 0.8, 'Air': 1.0, 'Spirit': 0.6 },
    'Air': { 'Earth': 0.3, 'Water': 0.2, 'Fire': 1.0, 'Air': 0.8, 'Spirit': 0.9 },
    'Spirit': { 'Earth': 0.5, 'Water': 0.7, 'Fire': 0.6, 'Air': 0.9, 'Spirit': 1.0 }
  };
  
  return affinities[plantElement]?.[plotElement] ?? 0;
}

/**
 * Generate a description of the overall environmental conditions
 * @param season Current season
 * @param moonPhase Current moon phase
 * @param weather Current weather
 * @returns Human-readable description of conditions
 */
export function describeEnvironmentalConditions(
  season: Season,
  moonPhase: MoonPhase,
  weather: WeatherFate
): string {
  // Get the effects for each component
  const seasonEffect = SEASON_EFFECTS[season];
  const moonEffect = MOON_PHASE_EFFECTS[moonPhase];
  const weatherEffect = WEATHER_EFFECTS[weather];
  
  // Generate description
  let description = `${season} ${seasonEffect.icon} `;
  description += `with a ${moonPhase} ${moonEffect.icon} `;
  description += `and ${weather} weather ${weatherEffect.icon}. `;
  
  // Add specific seasonal effects
  description += seasonEffect.description + ' ';
  
  // Add specific lunar effects
  description += moonEffect.description + ' ';
  
  // Add specific weather effects
  description += weatherEffect.description;
  
  return description;
}