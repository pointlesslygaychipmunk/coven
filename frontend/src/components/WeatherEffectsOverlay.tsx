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
  const [isMagicalEvent, setIsMagicalEvent] = useState(false); // Renamed state
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine if this is a special night (full moon, new moon for stars/magic)
  // Note: Moon phase isn't passed here, so we rely on weather/time for night effects
  const isSpecialNight = timeOfDay === 'night' && (weatherType === 'clear' || weatherType === 'normal' || weatherType === 'foggy');

  // Calculate particle counts based on weather and intensity
  const particleCounts = useMemo(() => {
    const baseCounts = {
      rain: { light: 40, medium: 80, heavy: 150 },
      wind: { light: 20, medium: 40, heavy: 70 },
      stars: 100,
      fireflies: 20,
      dust: 30,
      snowflakes: { light: 40, medium: 80, heavy: 130 },
      spirits: 3, // Base count for magical event spirits
      magic_glows: 15, // Base count for magical event glows
    };

    let counts = {
      rain: baseCounts.rain[intensity] || baseCounts.rain.medium,
      wind: baseCounts.wind[intensity] || baseCounts.wind.medium,
      stars: baseCounts.stars,
      fireflies: baseCounts.fireflies,
      dust: baseCounts.dust,
      snowflakes: baseCounts.snowflakes[intensity] || baseCounts.snowflakes.medium,
      spirits: baseCounts.spirits,
      magic_glows: baseCounts.magic_glows,
    };

    // Seasonal Adjustments
    if (season === 'Spring') { counts.rain = Math.round(counts.rain * 1.1); counts.wind += 10; }
    if (season === 'Summer') { counts.fireflies += 20; counts.dust += 15; counts.rain = Math.round(counts.rain * 0.8); }
    if (season === 'Fall') { counts.wind += 25; counts.dust += 5; }
    if (season === 'Winter') { counts.snowflakes = Math.round(counts.snowflakes * 1.2); counts.wind = Math.round(counts.wind * 0.7); }

    return counts;
  }, [intensity, season]);

  // Trigger thunder flashes for stormy weather
  useEffect(() => {
    let thunderInterval: NodeJS.Timeout | null = null;
    if (weatherType === 'stormy') {
      const flash = () => {
         setThunderFlash(true);
         // Reset flash after animation duration (1s in CSS)
         setTimeout(() => setThunderFlash(false), 1000);
         // Schedule next potential flash
         thunderInterval = setTimeout(flash, 6000 + Math.random() * 10000); // 6-16 seconds
      };
      // Initial delay before first flash
      thunderInterval = setTimeout(flash, 2000 + Math.random() * 5000);
    }
    return () => { if (thunderInterval) clearTimeout(thunderInterval); setThunderFlash(false); };
  }, [weatherType]);

  // Trigger rare magical events (Easter Egg)
  useEffect(() => {
     let eventTimeout: NodeJS.Timeout | null = null;
     let eventEndTimeout: NodeJS.Timeout | null = null;

     // Conditions for a magical event (e.g., foggy night, clear night, maybe specific season/weather combos)
     const canBeMagical = (weatherType === 'foggy' && timeOfDay === 'night') ||
                          (weatherType === 'clear' && timeOfDay === 'night') ||
                          (weatherType === 'windy' && season === 'Fall' && Math.random() < 0.3); // Less likely for windy fall

     if (canBeMagical && Math.random() < 0.10) { // 10% chance if conditions met
       const startDelay = 5000 + Math.random() * 25000; // Start after 5-30 seconds
       eventTimeout = setTimeout(() => {
         console.log("✨ Magical Event Triggered! ✨");
         setIsMagicalEvent(true);
         // Event lasts for 15 seconds
         eventEndTimeout = setTimeout(() => setIsMagicalEvent(false), 15000);
       }, startDelay);
     }

     // Cleanup timeouts on unmount or condition change
     return () => {
       if (eventTimeout) clearTimeout(eventTimeout);
       if (eventEndTimeout) clearTimeout(eventEndTimeout);
       setIsMagicalEvent(false); // Ensure it's off on cleanup
     };
   }, [weatherType, timeOfDay, season]); // Re-evaluate if these change


  // --- Render Functions for Particles ---

  const renderRainParticles = () => (
    <div className="rain-container">
      {Array.from({ length: particleCounts.rain }).map((_, i) => {
        const isWhimsical = Math.random() < 0.05; // 5% whimsical rain
        return (
            <div key={`rain-${i}`}
                 className={`rain-drop ${isWhimsical ? 'whimsical' : ''}`}
                 style={{
                    left: `${Math.random() * 105 - 5}%`, // Allow slight off-screen start
                    '--fall-duration': `${0.5 + Math.random() * 0.7}s`,
                    animationDelay: `${Math.random() * 1.2}s`,
                 } as React.CSSProperties} />
        );
      })}
    </div>
  );

  const renderWindParticles = () => (
    <div className="wind-container">
      {/* Wind Streaks */}
      {Array.from({ length: particleCounts.wind }).map((_, i) => (
        <div key={`wind-${i}`} className="wind-particle"
             style={{
                top: `${Math.random() * 100}%`,
                '--wind-duration': `${1 + Math.random() * 2.5}s`,
                animationDelay: `${Math.random() * 4}s`,
             } as React.CSSProperties} />
      ))}
      {/* Leaves (conditional) */}
      {(season === 'Fall' || season === 'Spring') && Array.from({ length: season === 'Fall' ? 30 : 15 }).map((_, i) => (
        <div key={`leaf-${i}`} className="wind-leaf"
             style={{
                top: `${Math.random() * 100}%`,
                '--leaf-duration': `${6 + Math.random() * 6}s`,
                animationDelay: `${Math.random() * 8}s`,
                transform: `scale(${0.7 + Math.random() * 0.6})`,
             } as React.CSSProperties} />
      ))}
    </div>
  );

  const renderStarParticles = () => (
    <div className="clear-night-overlay">
      {Array.from({ length: particleCounts.stars }).map((_, i) => {
          const isBig = Math.random() < 0.1;
          const isSparkle = Math.random() < 0.08;
          return (
              <div key={`star-${i}`} className={`star ${isBig ? 'big' : ''} ${isSparkle ? 'sparkle' : ''}`}
                   style={{
                      top: `${Math.random() * 65}%`, // Concentrate higher up
                      left: `${Math.random() * 100}%`,
                      '--twinkle-duration': `${4 + Math.random() * 5}s`,
                      '--twinkle-delay': `${Math.random() * 8}s`,
                   } as React.CSSProperties} />
          );
      })}
      {/* Optional Moon Glow for clear nights */}
      {isSpecialNight && <div className="moon-glow" />}
    </div>
  );

   const renderDustParticles = () => (
     <div className="dry-overlay">
       {Array.from({ length: particleCounts.dust }).map((_, i) => (
         <div key={`dust-${i}`} className="dust-particle"
              style={{
                 top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                 '--dust-duration': `${10 + Math.random() * 10}s`,
                 '--wind-x': `${-40 + Math.random() * 80}px`,
                 '--wind-y': `${-40 + Math.random() * 80}px`,
                 animationDelay: `${Math.random() * 8}s`,
              } as React.CSSProperties} />
       ))}
     </div>
   );

   const renderFogEffect = () => (
     <div className="fog-container">
       <div className="fog-layer"></div>
       <div className="fog-layer"></div>
       <div className="fog-layer"></div>
     </div>
   );

   const renderCloudOverlay = () => <div className="cloud-overlay" />;

   const renderSnowflakes = () => (
     <div className="snow-container">
       {Array.from({ length: particleCounts.snowflakes }).map((_, i) => (
         <div key={`snow-${i}`} className="snowflake"
              style={{
                 left: `${Math.random() * 100}%`,
                 width: `${3 + Math.random() * 4}px`, height: `${3 + Math.random() * 4}px`, // Size variation
                 '--snowfall-duration': `${8 + Math.random() * 8}s`,
                 '--drift-x': `${-25 + Math.random() * 50}px`,
                 animationDelay: `${Math.random() * 10}s`,
                 opacity: 0.6 + Math.random() * 0.4, // Opacity variation
              } as React.CSSProperties} />
       ))}
     </div>
   );

   const renderFireflies = () => (
     timeOfDay === 'night' && (season === 'Summer' || season === 'Spring') && // Common in warmer months
     <div className="firefly-container">
       {Array.from({ length: particleCounts.fireflies }).map((_, i) => (
         <div key={`firefly-${i}`} className="firefly"
              style={{
                 left: `${Math.random() * 100}%`, top: `${40 + Math.random() * 60}%`, // Tend to be lower
                 '--float-duration': `${15 + Math.random() * 15}s`,
                 '--glow-duration': `${1.5 + Math.random() * 2}s`,
                 '--x1': `${-80 + Math.random() * 160}px`, '--y1': `${-80 + Math.random() * 160}px`,
                 '--x2': `${-80 + Math.random() * 160}px`, '--y2': `${-80 + Math.random() * 160}px`,
                 animationDelay: `${Math.random() * 10}s, ${Math.random() * 2.5}s`,
              } as React.CSSProperties} />
       ))}
     </div>
   );

  // Render Magical Event Easter Egg effects
  const renderMagicalEvent = () => (
    isMagicalEvent && (
      <div className={`magical-event-overlay ${season.toLowerCase()}-magic`}>
        <div className="magical-mist"></div>
        {/* Glowing Particles */}
        {Array.from({ length: particleCounts.magic_glows }).map((_, i) => (
          <div key={`mglow-${i}`} className="magical-glow"
               style={{
                 top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                 animationDelay: `${Math.random() * 8}s`,
                 transform: `scale(${0.5 + Math.random() * 0.5})`
               }} />
        ))}
        {/* Spirit Entities */}
        {Array.from({ length: particleCounts.spirits }).map((_, i) => {
           const duration = 25 + Math.random() * 20;
           const delay = Math.random() * 10;
           const opacity = 0.3 + Math.random() * 0.3;
           return (
             <div key={`spirit-${i}`} className="spirit-entity"
                  style={{
                     left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                     '--spirit-duration': `${duration}s`,
                     '--end-x': `${-100 + Math.random() * 200}px`,
                     '--end-y': `${-100 + Math.random() * 200}px`,
                     '--spirit-opacity': opacity, // Pass opacity as CSS var
                     animationDelay: `${delay}s`,
                     transform: `scale(${0.6 + Math.random() * 0.6})`,
                  } as React.CSSProperties} />
           );
        })}
      </div>
    )
  );

  // Determine the main CSS class for the overlay
  const overlayClass = `weather-overlay ${weatherType} ${intensity} ${timeOfDay} ${season.toLowerCase()} ${isMagicalEvent ? 'magical' : ''}`;

  // Function to check if snowy conditions are present
  const shouldShowSnow = () => {
    return season === 'Winter' && (weatherType === 'normal' || weatherType === 'cloudy');
  };

  return (
    <div className={overlayClass} ref={containerRef}>
      {/* Base Overlays */}
      <div className={`time-overlay ${timeOfDay}`} />
      <div className={`seasonal-overlay ${season.toLowerCase()}-overlay`} />

      {/* Weather Effects */}
      {(weatherType === 'rainy' || weatherType === 'stormy') && renderRainParticles()}
      {(weatherType === 'windy' || weatherType === 'stormy' || season === 'Fall') && renderWindParticles()}
      {(weatherType === 'clear' || weatherType === 'normal') && timeOfDay === 'night' && renderStarParticles()}
      {weatherType === 'foggy' && renderFogEffect()}
      {(weatherType === 'cloudy' || weatherType === 'stormy') && renderCloudOverlay()}
      {weatherType === 'dry' && renderDustParticles()}
      {shouldShowSnow() && renderSnowflakes()} {/* Fixed snowy condition check */}

      {/* Ambient Effects */}
      {renderFireflies()}

      {/* Magical Event Effects */}
      {renderMagicalEvent()}

      {/* Thunder Flash */}
      {thunderFlash && <div className="thunder-flash" />}
    </div>
  );
};

export default WeatherEffectsOverlay;