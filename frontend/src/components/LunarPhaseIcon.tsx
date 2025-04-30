import React from 'react';
import './LunarPhaseIcon.css'; // Ensure this uses the new styles
import { MoonPhase } from 'coven-shared';

interface LunarPhaseIconProps {
  phase: MoonPhase;
  size?: number;
  className?: string; // Allow passing additional classes
}

const LunarPhaseIcon: React.FC<LunarPhaseIconProps> = ({
  phase,
  size = 40,
  className = '' // Default to empty string
}) => {
  const radius = size / 2;
  const cx = radius;
  const cy = radius;
  const strokeWidth = Math.max(1, size / 30); // Thinner stroke for style
  const effectiveRadius = radius - strokeWidth / 2; // Adjust for stroke

  // Define colors using CSS variables (fallback provided)
  const darkColor = "var(--lunar-dark, #342f48)";
  const lightColor = "var(--lunar-light, #e2d9f3)";
  const strokeColor = "var(--lunar-stroke, #7a6c95)";

  // Simplified phase logic focusing on path generation
  const renderMoonPhase = () => {
    let pathD = "";
    let baseCircleFill = darkColor; // Default to dark (New Moon)
    let pathFill = lightColor; // Default path fill is light

    switch (phase) {
      case 'Waxing Crescent':
        pathD = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 1 ${cx},${cy + effectiveRadius} A ${effectiveRadius * 0.6},${effectiveRadius} 0 0 0 ${cx},${cy - effectiveRadius} Z`;
        break;
      case 'First Quarter':
        // Draw right half light
        pathD = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 1 ${cx},${cy + effectiveRadius} L ${cx},${cy - effectiveRadius} Z`;
        break;
      case 'Waxing Gibbous':
        baseCircleFill = lightColor; // Base is light
        pathFill = darkColor; // Path is dark sliver
        // Draw dark sliver on the left
        pathD = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius * 0.6},${effectiveRadius} 0 0 1 ${cx},${cy + effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 0 ${cx},${cy - effectiveRadius} Z`;
        break;
      case 'Full Moon':
        baseCircleFill = lightColor; // Light
        break;
      case 'Waning Gibbous':
        baseCircleFill = lightColor; // Base is light
        pathFill = darkColor; // Path is dark sliver
        // Draw dark sliver on the right
        pathD = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius * 0.6},${effectiveRadius} 0 0 0 ${cx},${cy + effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 1 ${cx},${cy - effectiveRadius} Z`;
        break;
      case 'Last Quarter':
        // Draw left half light
        pathD = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 0 ${cx},${cy + effectiveRadius} L ${cx},${cy - effectiveRadius} Z`;
        break;
      case 'Waning Crescent':
        // Draw light sliver on the left
        pathD = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 0 ${cx},${cy + effectiveRadius} A ${effectiveRadius * 0.6},${effectiveRadius} 0 0 1 ${cx},${cy - effectiveRadius} Z`;
        break;
      case 'New Moon':
      default:
        // Base circle is already dark, no path needed
        break;
    }

    // Add a filter definition for reuse (could be moved to a global SVG defs file)
    // If placing globally, remove this defs section from here.
    const filterDef = (
        <filter id="moon-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" seed="1" numOctaves="2" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
    );

    return (
      <>
        <defs>{filterDef}</defs>
        {/* Base circle */}
        <circle
          cx={cx}
          cy={cy}
          r={effectiveRadius}
          fill={baseCircleFill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          filter="url(#moon-texture)"
        />
        {/* Phase-specific path */}
        {pathD && (
          <path
            d={pathD}
            fill={pathFill}
            filter="url(#moon-texture)"
          />
        )}
        {/* Optional: Add subtle crater details */}
        {/* <circle cx={cx * 0.7} cy={cy * 0.6} r={radius * 0.1} fill={baseCircleFill === lightColor ? darkColor : lightColor} opacity="0.1" filter="url(#moon-texture)" />
        <circle cx={cx * 1.2} cy={cy * 1.3} r={radius * 0.08} fill={baseCircleFill === lightColor ? darkColor : lightColor} opacity="0.08" filter="url(#moon-texture)" /> */}
      </>
    );
  };

  // Add phase name as a class for specific CSS targeting
  const phaseClassName = phase.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`lunar-phase-icon ${phaseClassName} ${className}`} style={{ width: size, height: size }} title={phase}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`${phase} icon`}>
        {renderMoonPhase()}
      </svg>
    </div>
  );
};

export default LunarPhaseIcon;