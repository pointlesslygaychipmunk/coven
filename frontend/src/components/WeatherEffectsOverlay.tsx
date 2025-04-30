import React, { useEffect, useState, useMemo } from 'react';
import './WeatherEffectsOverlay.css';
import { WeatherFate, Season } from 'coven-shared'; // Use shared types

type TimeOfDay = 'day' | 'night'; // Keep local or move to shared if needed globally
type Intensity = 'light' | 'medium' | 'heavy';

interface WeatherEffectsOverlayProps {
  weatherType: WeatherFate;
  intensity?: Intensity;
  timeOfDay?: TimeOfDay; // Make optional, default to day?
  season?: Season; // Make optional, default to Spring?
}

const WeatherEffectsOverlay: React.FC<WeatherEffectsOverlayProps> = ({
  weatherType,
  intensity = 'medium',
  timeOfDay = 'day', // Default to day
  season = 'Spring' // Default to Spring
}) => {
  const [thunderFlash, setThunderFlash] = useState(false);

  // Memoize particle count calculation
  const particleCount = useMemo(() => {
    const baseCount = { light: 25, medium: 60, heavy: 120 }[intensity] || 60;
    let modifier = 1.0;

    // Adjust count based on weather type and season for realism
    if ((weatherType === 'rainy' || weatherType === 'stormy') && season === 'Spring') modifier = 1.3;
    if ((weatherType === 'windy') && season === 'Fall') modifier = 1.4;
    if ((weatherType === 'foggy') && season === 'Fall') modifier = 1.2;
    if ((weatherType === 'normal' || weatherType === 'clear') && timeOfDay === 'night') return 100; // Fixed star count

    return Math.round(baseCount * modifier);
  }, [intensity, season, weatherType, timeOfDay]);

  // Generate particles based on weather type
  const particles = useMemo(() => {
    const newParticles: React.ReactNode[] = [];
    const type = weatherType; // Alias for clarity

    if (type === 'rainy' || type === 'stormy') {
      for (let i = 0; i < particleCount; i++) {
        newParticles.push(
          <div key={`rain-${i}`} className="rain-drop" style={{
            left: `${Math.random() * 105 - 5}%`, // Allow slight offscreen start
            animationDelay: `${Math.random() * 1.5}s`,
            animationDuration: `${0.6 + Math.random() * 0.5}s`
          }}/>
        );
      }
    } else if (type === 'windy') {
      for (let i = 0; i < particleCount; i++) {
        newParticles.push(
          <div key={`wind-${i}`} className="wind-particle" style={{
            top: `${Math.random() * 100}%`,
            opacity: 0.1 + Math.random() * 0.3,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${1.5 + Math.random() * 2.5}s`
          }}/>
        );
      }
    } else if ((type === 'clear' || type === 'normal') && timeOfDay === 'night') {
       for (let i = 0; i < particleCount; i++) { // Use particleCount for stars too
          const size = `${0.8 + Math.random() * 1.5}px`; // Slightly larger stars
          newParticles.push(
             <div key={`star-${i}`} className="star" style={{
                top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                width: size, height: size,
                animationDelay: `${Math.random() * 6}s`, // Longer delay variation
                animationDuration: `${3 + Math.random() * 4}s` // Longer duration variation
             }}/>
          );
       }
    }
    // Add Snow particles if needed
    // else if (type === 'snow') { ... }

    return newParticles;
  }, [weatherType, timeOfDay, particleCount]);

  // Trigger thunder flashes for stormy weather
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (weatherType === 'stormy') {
      intervalId = setInterval(() => {
        if (Math.random() < 0.15) { // 15% chance per interval
          setThunderFlash(true);
          setTimeout(() => setThunderFlash(false), 150); // Short flash duration
        }
      }, 3000 + Math.random() * 4000); // Random interval between 3-7 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      setThunderFlash(false); // Ensure flash is off on unmount/weather change
    };
  }, [weatherType]);

  // Determine the main CSS class for the overlay
  const overlayClass = `weather-overlay ${weatherType} ${intensity} ${timeOfDay}`;

  return (
    <div className={overlayClass}>
      {/* Base time of day tint */}
      <div className={`time-overlay ${timeOfDay}`} />

      {/* Base seasonal tint */}
      <div className={`seasonal-overlay ${season.toLowerCase()}-overlay`} />

      {/* Weather-specific particle containers / effects */}
      {(weatherType === 'rainy' || weatherType === 'stormy') && (
        <div className="rain-container">{particles}</div>
      )}
       {(weatherType === 'windy') && (
        <div className="wind-container">{particles}</div>
      )}
       {(weatherType === 'clear' || weatherType === 'normal') && timeOfDay === 'night' && (
        <div className="clear-night-overlay">{particles}</div>
      )}

      {/* Full screen overlays (fog, clouds, etc.) */}
      {weatherType === 'foggy' && <div className="fog-container" />}
      {weatherType === 'cloudy' && <div className="cloud-overlay" />}
       {(weatherType === 'stormy') && <div className="cloud-overlay heavy" />} {/* Heavier clouds for storm */}
       {weatherType === 'dry' && <div className="dry-overlay" />}
       {/* {weatherType === 'magical' && <div className="magical-mist" />} // Uncomment if needed */}

       {/* Thunder flash sits on top */}
       {thunderFlash && <div className="thunder-flash" />}
    </div>
  );
};

export default WeatherEffectsOverlay;