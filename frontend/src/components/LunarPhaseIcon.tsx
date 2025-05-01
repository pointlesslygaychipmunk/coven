import React from 'react';
import './LunarPhaseIcon.css';
import { MoonPhase } from 'coven-shared'; // Import the shared type

interface LunarPhaseIconProps {
  phase: MoonPhase; // Use the shared type
  size?: number;
  showLabel?: boolean;
}

const LunarPhaseIcon: React.FC<LunarPhaseIconProps> = ({
  phase,
  size = 40,
  showLabel = false
}) => {
  // Calculate dimensions
  const radius = size / 2;
  const cx = radius;
  const cy = radius;
  const strokeWidth = Math.max(1, size / 30); // Scale stroke width based on size
  const effectiveRadius = radius - strokeWidth; // Adjust for stroke
  
  // Set CSS variables for stroke width
  const styleVars = {
    '--stroke-width': `${strokeWidth}px`
  } as React.CSSProperties;

  // Get a CSS class based on the phase for special effects
  const getPhaseClass = (): string => {
    switch (phase) {
      case 'Full Moon': return 'fullmoon';
      case 'New Moon': return 'newmoon';
      default: return '';
    }
  };

  // Generate SVG for moon phase
  const renderMoonPhase = () => {
    switch (phase) {
      case 'New Moon':
        // Dark circle with subtle outline
        return (
          <circle 
            cx={cx} 
            cy={cy} 
            r={effectiveRadius} 
            className="moon-dark" 
          />
        );

      case 'Waxing Crescent': {
        // Dark circle with crescent of light on right side
        return (
          <>
            <circle 
              cx={cx} 
              cy={cy} 
              r={effectiveRadius} 
              className="moon-dark" 
            />
            <path 
              d={`M ${cx},${cy - effectiveRadius} 
                  A ${effectiveRadius},${effectiveRadius} 0 0 1 
                  ${cx},${cy + effectiveRadius} 
                  A ${effectiveRadius * 0.7},${effectiveRadius} 0 0 0 
                  ${cx},${cy - effectiveRadius}`} 
              className="moon-light" 
            />
          </>
        );
      }

      case 'First Quarter': {
        // Right half is light, left half is dark
        return (
          <>
            <circle 
              cx={cx} 
              cy={cy} 
              r={effectiveRadius} 
              className="moon-dark" 
            />
            <path 
              d={`M ${cx},${cy - effectiveRadius} 
                  A ${effectiveRadius},${effectiveRadius} 0 0 1 
                  ${cx},${cy + effectiveRadius} 
                  L ${cx},${cy - effectiveRadius}`} 
              className="moon-light" 
            />
          </>
        );
      }

      case 'Waxing Gibbous': {
        // Mostly light with dark crescent on left
        return (
          <>
            <circle 
              cx={cx} 
              cy={cy} 
              r={effectiveRadius} 
              className="moon-light" 
            />
            <path 
              d={`M ${cx},${cy - effectiveRadius} 
                  A ${effectiveRadius * 0.7},${effectiveRadius} 0 0 1 
                  ${cx},${cy + effectiveRadius} 
                  A ${effectiveRadius},${effectiveRadius} 0 0 0 
                  ${cx},${cy - effectiveRadius}`} 
              className="moon-dark" 
            />
          </>
        );
      }

      case 'Full Moon':
        // Fully light circle
        return (
          <circle 
            cx={cx} 
            cy={cy} 
            r={effectiveRadius} 
            className="moon-light" 
          />
        );

      case 'Waning Gibbous': {
        // Mostly light with dark crescent on right
        return (
          <>
            <circle 
              cx={cx} 
              cy={cy} 
              r={effectiveRadius} 
              className="moon-light" 
            />
            <path 
              d={`M ${cx},${cy - effectiveRadius} 
                  A ${effectiveRadius * 0.7},${effectiveRadius} 0 0 0 
                  ${cx},${cy + effectiveRadius} 
                  A ${effectiveRadius},${effectiveRadius} 0 0 1 
                  ${cx},${cy - effectiveRadius}`} 
              className="moon-dark" 
            />
          </>
        );
      }

      case 'Last Quarter': {
        // Left half is light, right half is dark
        return (
          <>
            <circle 
              cx={cx} 
              cy={cy} 
              r={effectiveRadius} 
              className="moon-dark" 
            />
            <path 
              d={`M ${cx},${cy - effectiveRadius} 
                  A ${effectiveRadius},${effectiveRadius} 0 0 0 
                  ${cx},${cy + effectiveRadius} 
                  L ${cx},${cy - effectiveRadius}`} 
              className="moon-light" 
            />
          </>
        );
      }

      case 'Waning Crescent': {
        // Dark circle with crescent of light on left side
        return (
          <>
            <circle 
              cx={cx} 
              cy={cy} 
              r={effectiveRadius} 
              className="moon-dark" 
            />
            <path 
              d={`M ${cx},${cy - effectiveRadius} 
                  A ${effectiveRadius},${effectiveRadius} 0 0 0 
                  ${cx},${cy + effectiveRadius} 
                  A ${effectiveRadius * 0.7},${effectiveRadius} 0 0 1 
                  ${cx},${cy - effectiveRadius}`} 
              className="moon-light" 
            />
          </>
        );
      }

      default: 
        // Default to Full Moon if phase name is unknown
        return (
          <circle 
            cx={cx} 
            cy={cy} 
            r={effectiveRadius} 
            className="moon-light" 
          />
        );
    }
  };

  // Create descriptive texts for moon phases
  const getMoonPhaseDescription = (): string => {
    switch (phase) {
      case 'New Moon': 
        return 'Dark and mysterious, a time for new beginnings';
      case 'Waxing Crescent': 
        return 'Growing in power, a time for intention setting';
      case 'First Quarter': 
        return 'At the crossroads, a time for decision making';
      case 'Waxing Gibbous': 
        return 'Almost complete, a time for refinement';
      case 'Full Moon': 
        return 'At its peak power, a time for completion and celebration';
      case 'Waning Gibbous': 
        return 'Slowly releasing, a time for gratitude';
      case 'Last Quarter': 
        return 'Letting go, a time for release and reflection';
      case 'Waning Crescent': 
        return 'Fading away, a time for rest and surrender';
      default:
        return 'A mysterious phase of the moon';
    }
  };

  return (
    <div 
      className={`lunar-phase-icon ${getPhaseClass()}`} 
      style={{ width: size, height: size, ...styleVars }}
      title={showLabel ? undefined : `${phase}: ${getMoonPhaseDescription()}`}
    >
      <div className="lunar-phase-container">
        {/* Background glow effect */}
        <div className="lunar-phase-glow"></div>
        
        {/* Stars background */}
        <div className="lunar-phase-stars"></div>
        
        {/* The actual moon SVG */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {renderMoonPhase()}
        </svg>
        
        {/* Shadow overlay for depth */}
        <div className="lunar-phase-shadow"></div>
        
        {/* Show tooltip if not showing label */}
        {!showLabel && (
          <div className="lunar-phase-tooltip">
            {phase}
          </div>
        )}
      </div>
    </div>
  );
};

export default LunarPhaseIcon;