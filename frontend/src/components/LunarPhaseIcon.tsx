import React from 'react';
import './LunarPhaseIcon.css';
import { MoonPhase } from 'coven-shared'; // Import the shared type

interface LunarPhaseIconProps {
  phase: MoonPhase; // Use the shared type
  size?: number;
}
// Use const instead of export const if only used internally or exported elsewhere
const LunarPhaseIcon: React.FC<LunarPhaseIconProps> = ({
  phase,
  size = 40
}) => {
  const radius = size / 2;
  const cx = radius;
  const cy = radius;
  const strokeWidth = Math.max(1, size / 25); // Scale stroke width
  const effectiveRadius = radius - strokeWidth; // Adjust for stroke

  // Colors (Consider moving to CSS variables if theme needed)
  const darkColor = "#342f48"; // Dark part of the moon
  const lightColor = "#e2d9f3"; // Lit part of the moon
  const strokeColor = "#7a6c95"; // Outline color

  const renderMoonPhase = () => {
    switch (phase) {
      case 'New Moon':
        return (
          <circle cx={cx} cy={cy} r={effectiveRadius} fill={darkColor} stroke={strokeColor} strokeWidth={strokeWidth} />
        );

      case 'Waxing Crescent': {
        const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 1 ${cx},${cy + effectiveRadius} A ${effectiveRadius * 0.6},${effectiveRadius} 0 0 0 ${cx},${cy - effectiveRadius}`;
        return (
          <>
            <circle cx={cx} cy={cy} r={effectiveRadius} fill={darkColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={d} fill={lightColor} />
          </>
        );
      }

      case 'First Quarter': {
        const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 1 ${cx},${cy + effectiveRadius} L ${cx},${cy - effectiveRadius}`;
        return (
          <>
            <circle cx={cx} cy={cy} r={effectiveRadius} fill={darkColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={d} fill={lightColor} />
          </>
        );
      }

      case 'Waxing Gibbous': {
         const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 1 1 ${cx},${cy + effectiveRadius} A ${effectiveRadius * 0.6},${effectiveRadius} 0 0 0 ${cx},${cy - effectiveRadius}`;
        return (
           <>
             <circle cx={cx} cy={cy} r={effectiveRadius} fill={lightColor} stroke={strokeColor} strokeWidth={strokeWidth} />
             {/* Draw the dark sliver */}
              <path d={`M ${cx},${cy - effectiveRadius} A ${effectiveRadius * 0.6},${effectiveRadius} 0 0 1 ${cx},${cy + effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 0 ${cx},${cy - effectiveRadius}`} fill={darkColor} />
           </>
        );
      }


      case 'Full Moon':
        return (
          <circle cx={cx} cy={cy} r={effectiveRadius} fill={lightColor} stroke={strokeColor} strokeWidth={strokeWidth} />
        );

      case 'Waning Gibbous': {
         const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 1 0 ${cx},${cy + effectiveRadius} A ${effectiveRadius * 0.6},${effectiveRadius} 0 0 1 ${cx},${cy - effectiveRadius}`;
        return (
          <>
            <circle cx={cx} cy={cy} r={effectiveRadius} fill={lightColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Draw the dark sliver on the other side */}
             <path d={`M ${cx},${cy - effectiveRadius} A ${effectiveRadius * 0.6},${effectiveRadius} 0 0 0 ${cx},${cy + effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 1 ${cx},${cy - effectiveRadius}`} fill={darkColor} />
          </>
        );
      }

      case 'Last Quarter': {
        const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 0 ${cx},${cy + effectiveRadius} L ${cx},${cy - effectiveRadius}`;
        return (
          <>
            <circle cx={cx} cy={cy} r={effectiveRadius} fill={darkColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={d} fill={lightColor} />
          </>
        );
      }

      case 'Waning Crescent': {
        const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 0 ${cx},${cy + effectiveRadius} A ${effectiveRadius * 0.6},${effectiveRadius} 0 0 1 ${cx},${cy - effectiveRadius}`;
        return (
          <>
            <circle cx={cx} cy={cy} r={effectiveRadius} fill={darkColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={d} fill={lightColor} />
          </>
        );
      }

      default: // Default to Full Moon if phase name is unknown
        return (
          <circle cx={cx} cy={cy} r={effectiveRadius} fill={lightColor} stroke={strokeColor} strokeWidth={strokeWidth} />
        );
    }
  };

  return (
    <div className="lunar-phase-icon" style={{ width: size, height: size }} title={phase}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {renderMoonPhase()}
      </svg>
    </div>
  );
};

export default LunarPhaseIcon;