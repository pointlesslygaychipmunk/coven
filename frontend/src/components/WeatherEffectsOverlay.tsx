import React, { useEffect, useState, useMemo, useRef } from 'react';
import './WeatherEffectsOverlay.css'; // Ensure this uses the new styles
// Import base WeatherFate and Season from shared
import { WeatherFate as BaseWeatherFate, Season } from 'coven-shared';

// Extend WeatherFate locally to include the new types for comparison
// Ideally, update this in coven-shared itself
type ExtendedWeatherFate = BaseWeatherFate | 'snowy' | 'magical'; // Added 'snowy' and 'magical'

type TimeOfDay = 'day' | 'night';
type Intensity = 'light' | 'medium' | 'heavy';

interface WeatherEffectsOverlayProps {
  weatherType: ExtendedWeatherFate; // Use the extended type
  intensity?: Intensity;
  timeOfDay?: TimeOfDay;
  season?: Season;
}

// Helper to generate random number in range
const random = (min: number, max: number) => Math.random() * (max - min) + min;

const WeatherEffectsOverlay: React.FC<WeatherEffectsOverlayProps> = ({
  weatherType,
  intensity = 'medium',
  timeOfDay = 'day',
  season = 'Spring'
}) => {
  const [thunderFlash, setThunderFlash] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for container dimensions

  // Memoize particle count calculation
  const particleCount = useMemo(() => {
    const baseCount = { light: 30, medium: 70, heavy: 150 }[intensity] || 70;
    let modifier = 1.0;

    if ((weatherType === 'rainy' || weatherType === 'stormy') && season === 'Spring') modifier = 1.2;
    if (weatherType === 'windy' && season === 'Fall') modifier = 1.3;
    if (weatherType === 'snowy' && season === 'Winter') modifier = 1.2;
    if ((weatherType === 'clear' || weatherType === 'normal') && timeOfDay === 'night') return 100; // Fixed star count

    return Math.max(10, Math.round(baseCount * modifier)); // Ensure minimum count
  }, [intensity, season, weatherType, timeOfDay]);

  // Generate particles - more detailed properties
  const particles = useMemo(() => {
    const newParticles: React.ReactNode[] = [];
    const type: ExtendedWeatherFate = weatherType; // Use extended type here

    for (let i = 0; i < particleCount; i++) {
      const delay = random(0, 5); // Wider delay range
      const duration = random(1, 3); // Base duration

      if (type === 'rainy' || type === 'stormy') {
        newParticles.push(
          <div key={`rain-${i}`} className="rain-drop" style={{
            left: `${random(-5, 105)}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${random(0.6, 1.3)}s` // Slightly varied fall speed
          }}/>
        );
      } else if (type === 'windy') {
        newParticles.push(
          <div key={`wind-${i}`} className="wind-particle" style={{
            top: `${random(0, 100)}%`,
            left: `${random(-20, 80)}%`, // Adjusted start
            opacity: random(0.1, 0.4), // More subtle
            animationDelay: `${delay}s`,
            animationDuration: `${duration + 1}s` // Longer duration
          }}/>
        );
      } else if ((type === 'clear' || type === 'normal') && timeOfDay === 'night') {
        const size = random(1, 2.5); // Pixel size variation
        newParticles.push(
          <div key={`star-${i}`} className="star" style={{
            top: `${random(0, 100)}%`, left: `${random(0, 100)}%`,
            width: `${size}px`, height: `${size}px`,
            animationDelay: `${random(0, 15)}s`,
            animationDuration: `${random(5, 15)}s`
          }}/>
        );
      } else if (type === 'snowy') { // Comparison is now valid with ExtendedWeatherFate
          const size = random(3, 6);
          newParticles.push(
              <div key={`snow-${i}`} className="snowflake" style={{
                  left: `${random(-10, 110)}%`,
                  width: `${size}px`, height: `${size}px`,
                  opacity: random(0.6, 1.0),
                  animationDelay: `${random(0, 10)}s`,
                  animationDuration: `${random(10, 18)}s`,
                  '--x-drift': `${random(-40, 40)}px` // CSS variable for drift
              } as React.CSSProperties}/>
          );
      } else if (type === 'dry' && season === 'Summer') {
           const size = random(1, 3);
           newParticles.push(
               <div key={`dust-${i}`} className="dust-particle" style={{
                   top: `${random(10, 90)}%`, // Allow higher/lower start
                   left: `${random(0, 100)}%`,
                   width: `${size}px`, height: `${size}px`,
                   opacity: random(0.1, 0.3), // Subtler dust
                   animationDelay: `${random(0, 12)}s`,
                   animationDuration: `${random(12, 25)}s`,
                   '--x-drift': `${random(-60, 60)}px`,
                   '--y-drift': `${random(-30, 30)}px`,
                   '--max-opacity': random(0.2, 0.4) // Random max opacity per particle
               } as React.CSSProperties}/>
           );
      } else if (type === 'magical') { // Comparison is now valid with ExtendedWeatherFate
           const size = random(3, 7); // Slightly larger magical particles
           newParticles.push(
               <div key={`magic-${i}`} className="mist-particle" style={{
                    top: `${random(0, 100)}%`,
                    left: `${random(0, 100)}%`,
                    width: `${size}px`, height: `${size}px`,
                    animationDelay: `${random(0, 10)}s`,
                    animationDuration: `${random(10, 20)}s`,
               } as React.CSSProperties}/>
           );
      }
    }
    return newParticles;
  }, [weatherType, timeOfDay, particleCount, season]); // Include season

  // Trigger thunder flashes
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (weatherType === 'stormy') {
      intervalId = setInterval(() => {
        if (Math.random() < 0.18) { // Slightly more frequent
          setThunderFlash(true);
          setTimeout(() => setThunderFlash(false), random(80, 200));
        }
      }, random(2000, 5000));
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
      setThunderFlash(false);
    };
  }, [weatherType]);

  // Determine the main CSS class for the overlay
  const overlayClass = `weather-overlay weather-${weatherType} intensity-${intensity} time-${timeOfDay} season-${season.toLowerCase()}`;

  return (
    <div ref={containerRef} className={overlayClass}>
      {/* Base time/season tint overlays */}
      <div className={`time-overlay time-${timeOfDay}`} />
      <div className={`seasonal-overlay season-${season.toLowerCase()}-overlay`} />

      {/* Weather-specific particle containers */}
      {(type => {
        switch (type) {
          case 'rainy':
          case 'stormy': return <div className="rain-container">{particles}</div>;
          case 'windy': return <div className="wind-container">{particles}</div>;
          case 'snowy': return <div className="snow-container">{particles}</div>;
          case 'clear':
          case 'normal': return timeOfDay === 'night' ? <div className="clear-night-overlay">{particles}</div> : null;
          case 'dry': return season === 'Summer' ? <div className="dust-container">{particles}</div> : null;
          case 'magical': return <div className="magical-mist-container">{particles}</div>;
          default: return null;
        }
      })(weatherType)}

      {/* Full screen overlays */}
      {weatherType === 'foggy' && <div className="fog-container" />}
      {(weatherType === 'cloudy' || weatherType === 'stormy') && <div className={`cloud-overlay ${weatherType === 'stormy' ? 'heavy' : ''}`} />}
      {weatherType === 'dry' && <div className="dry-overlay" />}
      {weatherType === 'magical' && <div className="magical-mist" />}

      {/* Thunder flash on top */}
      {thunderFlash && <div className="thunder-flash" />}
    </div>
  );
};

export default WeatherEffectsOverlay;