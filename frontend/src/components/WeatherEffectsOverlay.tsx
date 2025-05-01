import React, { useEffect, useState, useMemo, useRef } from 'react';
import './WeatherEffectsOverlay.css';
import { WeatherFate, Season } from 'coven-shared';

type TimeOfDay = 'day' | 'night';
type Intensity = 'light' | 'medium' | 'heavy';

interface WeatherEffectsOverlayProps {
  weatherType: WeatherFate;
  intensity?: Intensity;
  timeOfDay?: TimeOfDay;
  season?: Season;
}

const WeatherEffectsOverlay: React.FC<WeatherEffectsOverlayProps> = ({
  weatherType,
  intensity = 'medium',
  timeOfDay = 'day',
  season = 'Spring'
}) => {
  const [thunderFlash, setThunderFlash] = useState(false);
  const [magicalEvent, setMagicalEvent] = useState(false);
  // Remove unused state
  // const [spriteVariants, setSpriteVariants] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Determine if this is a special night (full moon, new moon)
  const isSpecialNight = timeOfDay === 'night' && (
    weatherType === 'normal' || weatherType === 'clear' || weatherType === 'foggy'
  );

  // Calculate particle counts based on weather and intensity
  const particleCounts = useMemo(() => {
    // Base counts for different particle types
    const counts = {
      rain: { light: 50, medium: 100, heavy: 200 }[intensity] || 100,
      wind: { light: 30, medium: 60, heavy: 100 }[intensity] || 60,
      stars: 120,
      fireflies: 25,
      dust: 40,
      snowflakes: { light: 50, medium: 100, heavy: 150 }[intensity] || 100,
      spirits: Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0, // Rare spirits
    };
    
    // Adjust based on season
    if (season === 'Spring') {
      counts.wind += 20;
      counts.fireflies += 10;
    } else if (season === 'Summer') {
      counts.fireflies += 30;
      counts.dust += 20;
    } else if (season === 'Fall') {
      counts.wind += 40;
      counts.dust += 10;
    } else if (season === 'Winter') {
      counts.wind += 10;
      counts.snowflakes += 50;
    }
    
    return counts;
  }, [intensity, season]);
  
  // We'll use seasonal variants directly in the component rather than storing in state
  // Generate sprite variants for whimsical effects
  useEffect(() => {
    
    // Instead of storing in state, we could use these variants directly in component logic
    // const variants = seasonalVariants[season] || ['sprite', 'twinkle', 'wisp'];
    // setSpriteVariants(variants);
  }, [season]);

  // Trigger thunder flashes for stormy weather
  useEffect(() => {
    let thunderInterval: NodeJS.Timeout | null = null;
    
    if (weatherType === 'stormy') {
      thunderInterval = setInterval(() => {
        if (Math.random() < 0.25) {
          setThunderFlash(true);
          setTimeout(() => setThunderFlash(false), 800);
        }
      }, 8000 + Math.random() * 12000); // Random interval between 8-20 seconds
    }
    
    return () => {
      if (thunderInterval) clearInterval(thunderInterval);
      setThunderFlash(false);
    };
  }, [weatherType]);
  
  // Trigger rare magical events
  useEffect(() => {
    // Only in special weather conditions and rarely
    const magicalCondition = 
      (weatherType === 'foggy' && timeOfDay === 'night') || 
      (weatherType === 'clear' && timeOfDay === 'night') ||
      (weatherType === 'windy' && season === 'Fall');
    
    if (magicalCondition && Math.random() < 0.15) {
      const timeout = setTimeout(() => {
        setMagicalEvent(true);
        setTimeout(() => setMagicalEvent(false), 15000); // Magical event lasts 15 seconds
      }, 5000 + Math.random() * 30000); // Random start between 5-35 seconds
      
      return () => clearTimeout(timeout);
    }
    
    return () => setMagicalEvent(false);
  }, [weatherType, timeOfDay, season]);

  // Generate rain particles
  const renderRainParticles = () => {
    const particles = [];
    const isWhimsical = Math.random() < 0.2; // 20% chance for whimsical rain
    
    for (let i = 0; i < particleCounts.rain; i++) {
      const left = `${Math.random() * 105 - 5}%`;
      const fallDuration = `${0.5 + Math.random() * 0.8}s`;
      const delay = `${Math.random() * 1.5}s`;
      const opacity = 0.7 + Math.random() * 0.3;
      
      particles.push(
        <div
          key={`rain-${i}`}
          className={`rain-drop ${isWhimsical ? 'whimsical' : ''}`}
          style={{
            left,
            '--fall-duration': fallDuration,
            animationDelay: delay,
            opacity
          } as React.CSSProperties}
        />
      );
    }
    
    return (
      <div className="rain-container">
        {particles}
      </div>
    );
  };

  // Generate wind particles
  const renderWindParticles = () => {
    const particles = [];
    const leaves = [];
    const useLeaves = (season === 'Fall' || season === 'Spring');
    const leafCount = season === 'Fall' ? 40 : 20;
    
    for (let i = 0; i < particleCounts.wind; i++) {
      const top = `${Math.random() * 100}%`;
      const duration = `${1 + Math.random() * 3}s`;
      const delay = `${Math.random() * 5}s`;
      
      particles.push(
        <div
          key={`wind-${i}`}
          className="wind-particle"
          style={{
            top,
            '--wind-duration': duration,
            animationDelay: delay,
          } as React.CSSProperties}
        />
      );
    }
    
    if (useLeaves) {
      for (let i = 0; i < leafCount; i++) {
        const top = `${Math.random() * 100}%`;
        const duration = `${5 + Math.random() * 8}s`;
        const delay = `${Math.random() * 10}s`;
        const scale = 0.6 + Math.random() * 0.8;
        
        leaves.push(
          <div
            key={`leaf-${i}`}
            className="wind-leaf"
            style={{
              top,
              '--leaf-duration': duration,
              animationDelay: delay,
              transform: `scale(${scale})`,
            } as React.CSSProperties}
          />
        );
      }
    }
    
    return (
      <div className="wind-container">
        {particles}
        {leaves}
      </div>
    );
  };

  // Generate star particles for night sky
  const renderStarParticles = () => {
    const stars = [];
    const hasMoon = Math.random() < 0.7; // 70% chance of visible moon
    
    for (let i = 0; i < particleCounts.stars; i++) {
      const top = `${Math.random() * 70}%`; // Keep stars in upper portion
      const left = `${Math.random() * 100}%`;
      const twinkleDuration = `${3 + Math.random() * 6}s`;
      const twinkleDelay = `${Math.random() * 10}s`;
      const isBig = Math.random() < 0.15; // 15% chance of bigger stars
      const isSparkle = Math.random() < 0.1; // 10% chance of sparkle effect
      
      stars.push(
        <div
          key={`star-${i}`}
          className={`star ${isBig ? 'big' : ''} ${isSparkle ? 'sparkle' : ''}`}
          style={{
            top,
            left,
            '--twinkle-duration': twinkleDuration,
            '--twinkle-delay': twinkleDelay,
          } as React.CSSProperties}
        />
      );
    }
    
    return (
      <div className="clear-night-overlay">
        {stars}
        {hasMoon && <div className="moon-glow" />}
      </div>
    );
  };

  // Generate dust particles
  const renderDustParticles = () => {
    const particles = [];
    
    for (let i = 0; i < particleCounts.dust; i++) {
      const top = `${Math.random() * 100}%`;
      const left = `${Math.random() * 100}%`;
      const duration = `${8 + Math.random() * 7}s`;
      const delay = `${Math.random() * 5}s`;
      const windX = (-50 + Math.random() * 100) + 'px';
      const windY = (-50 + Math.random() * 100) + 'px';
      
      particles.push(
        <div
          key={`dust-${i}`}
          className="dust-particle"
          style={{
            top,
            left,
            '--dust-duration': duration,
            '--wind-x': windX,
            '--wind-y': windY,
            animationDelay: delay,
          } as React.CSSProperties}
        />
      );
    }
    
    return (
      <div className="dry-overlay">
        {particles}
      </div>
    );
  };

  // Generate fog effect with layered mist
  const renderFogEffect = () => {
    return (
      <div className="fog-container">
        <div className="fog-layer"></div>
        <div className="fog-layer"></div>
        <div className="fog-layer"></div>
      </div>
    );
  };

  // Generate cloud overlay
  const renderCloudOverlay = () => {
    return <div className="cloud-overlay" />;
  };

  // Generate snowflakes for winter
  const renderSnowflakes = () => {
    const flakes = [];
    
    for (let i = 0; i < particleCounts.snowflakes; i++) {
      const left = `${Math.random() * 100}%`;
      const size = 3 + Math.random() * 6;
      const duration = `${7 + Math.random() * 10}s`;
      const delay = `${Math.random() * 10}s`;
      const driftX = (-30 + Math.random() * 60) + 'px';
      
      flakes.push(
        <div
          key={`snow-${i}`}
          className="snowflake"
          style={{
            left,
            width: `${size}px`,
            height: `${size}px`,
            '--snowfall-duration': duration,
            '--drift-x': driftX,
            animationDelay: delay,
          } as React.CSSProperties}
        />
      );
    }
    
    return (
      <div className="snow-container">
        {flakes}
      </div>
    );
  };

  // Generate fireflies for summer nights
  const renderFireflies = () => {
    if (timeOfDay !== 'night') return null;
    
    const fireflies = [];
    
    for (let i = 0; i < particleCounts.fireflies; i++) {
      const startX = `${Math.random() * 100}%`;
      const startY = `${Math.random() * 100}%`;
      const floatDuration = `${15 + Math.random() * 20}s`;
      const glowDuration = `${1 + Math.random() * 3}s`;
      const delay = `${Math.random() * 10}s`;
      const glowDelay = `${Math.random() * 3}s`;
      
      // Random movement pattern
      const x1 = (-100 + Math.random() * 200) + 'px';
      const y1 = (-100 + Math.random() * 200) + 'px';
      const x2 = (-100 + Math.random() * 200) + 'px';
      const y2 = (-100 + Math.random() * 200) + 'px';
      
      fireflies.push(
        <div
          key={`firefly-${i}`}
          className="firefly"
          style={{
            '--start-x': startX,
            '--start-y': startY,
            '--x1': x1,
            '--y1': y1,
            '--x2': x2,
            '--y2': y2,
            '--float-duration': floatDuration,
            '--glow-duration': glowDuration,
            animationDelay: `${delay}, ${glowDelay}`,
            left: startX,
            top: startY,
          } as React.CSSProperties}
        />
      );
    }
    
    return fireflies;
  };

  // Generate magical spirits
  const renderMagicalSpirits = () => {
    if (!magicalEvent && particleCounts.spirits === 0) return null;
    
    const spirits = [];
    const count = magicalEvent ? 5 : particleCounts.spirits;
    
    for (let i = 0; i < count; i++) {
      const startX = `${Math.random() * 100}%`;
      const startY = `${Math.random() * 100}%`;
      const endX = (-200 + Math.random() * 400) + 'px';
      const endY = (-200 + Math.random() * 400) + 'px';
      const duration = `${30 + Math.random() * 30}s`;
      const delay = `${Math.random() * 15}s`;
      const scale = 0.5 + Math.random() * 1.5;
      const opacity = 0.3 + Math.random() * 0.4;
      
      spirits.push(
        <div
          key={`spirit-${i}`}
          className="spirit-entity"
          style={{
            '--start-x': startX,
            '--start-y': startY,
            '--end-x': endX,
            '--end-y': endY,
            '--spirit-duration': duration,
            animationDelay: delay,
            left: startX,
            top: startY,
            transform: `scale(${scale})`,
            opacity,
          } as React.CSSProperties}
        />
      );
    }
    
    return spirits;
  };

  // Generate seasonal magical effects
  const renderSeasonalMagic = () => {
    // Only render during magical events or special nighttime conditions
    if (!magicalEvent && !isSpecialNight) return null;
    
    return (
      <>
        <div className="magical-mist" />
        <div className="magical-glow" />
      </>
    );
  };

  // Determine the main CSS class for the overlay
  const overlayClass = `weather-overlay ${weatherType} ${intensity} ${timeOfDay} ${season.toLowerCase()}`;

  return (
    <div className={overlayClass} ref={containerRef}>
      {/* Base time of day tint */}
      <div className={`time-overlay ${timeOfDay}`} />

      {/* Base seasonal tint */}
      <div className={`seasonal-overlay ${season.toLowerCase()}-overlay`} />

      {/* Weather-specific particle containers / effects */}
      {(weatherType === 'rainy' || weatherType === 'stormy') && renderRainParticles()}
      {(weatherType === 'windy' || weatherType === 'stormy') && renderWindParticles()}
      {(weatherType === 'normal' || weatherType === 'clear') && timeOfDay === 'night' && renderStarParticles()}
      {weatherType === 'foggy' && renderFogEffect()}
      {(weatherType === 'cloudy' || weatherType === 'stormy') && renderCloudOverlay()}
      {weatherType === 'dry' && renderDustParticles()}
      {season === 'Winter' && (weatherType === 'normal' || weatherType === 'cloudy') && renderSnowflakes()}
      
      {/* Special effects */}
      {renderFireflies()}
      {renderMagicalSpirits()}
      {renderSeasonalMagic()}
      
      {/* Thunder flash sits on top */}
      {thunderFlash && <div className="thunder-flash" />}
    </div>
  );
};

export default WeatherEffectsOverlay;