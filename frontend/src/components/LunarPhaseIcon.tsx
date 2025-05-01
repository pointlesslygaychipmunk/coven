import React, { useState } from 'react'; // Import useState
import './LunarPhaseIcon.css';
import { MoonPhase } from 'coven-shared'; // Import the shared type

interface LunarPhaseIconProps {
  phase: MoonPhase; // Use the shared type
  size?: number;
  // showLabel prop removed as tooltip is now default hover behavior
}

const LunarPhaseIcon: React.FC<LunarPhaseIconProps> = ({
  phase,
  size = 40,
}) => {
  // Easter Egg State
  const [isHovering, setIsHovering] = useState(false);

  // Calculate dimensions
  const radius = size / 2;
  const cx = radius;
  const cy = radius;
  // Scale stroke width based on size, ensure minimum of 1
  const strokeWidth = Math.max(1, Math.floor(size / 25));
  const effectiveRadius = Math.max(1, radius - strokeWidth / 2); // Adjust for stroke center

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

  // Generate SVG paths for moon phases
  const renderMoonPhase = () => {
    switch (phase) {
      case 'New Moon':
        return <circle cx={cx} cy={cy} r={effectiveRadius} className="moon-dark" />;

      case 'Waxing Crescent': {
        const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 1 ${cx},${cy + effectiveRadius} A ${effectiveRadius * 0.7},${effectiveRadius} 0 0 0 ${cx},${cy - effectiveRadius} Z`;
        return (<> <circle cx={cx} cy={cy} r={effectiveRadius} className="moon-dark" /> <path d={d} className="moon-light" /> </>);
      }
      case 'First Quarter': {
         const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 1 ${cx},${cy + effectiveRadius} L ${cx},${cy - effectiveRadius} Z`;
        return (<> <circle cx={cx} cy={cy} r={effectiveRadius} className="moon-dark" /> <path d={d} className="moon-light" /> </>);
      }
      case 'Waxing Gibbous': {
        const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius * 0.7},${effectiveRadius} 0 0 1 ${cx},${cy + effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 0 ${cx},${cy - effectiveRadius} Z`;
        return (<> <circle cx={cx} cy={cy} r={effectiveRadius} className="moon-light" /> <path d={d} className="moon-dark" /> </>);
      }
      case 'Full Moon':
        return <circle cx={cx} cy={cy} r={effectiveRadius} className="moon-light" />;

      case 'Waning Gibbous': {
        const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius * 0.7},${effectiveRadius} 0 0 0 ${cx},${cy + effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 1 ${cx},${cy - effectiveRadius} Z`;
        return (<> <circle cx={cx} cy={cy} r={effectiveRadius} className="moon-light" /> <path d={d} className="moon-dark" /> </>);
      }
      case 'Last Quarter': {
         const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 0 ${cx},${cy + effectiveRadius} L ${cx},${cy - effectiveRadius} Z`;
        return (<> <circle cx={cx} cy={cy} r={effectiveRadius} className="moon-dark" /> <path d={d} className="moon-light" /> </>);
      }
      case 'Waning Crescent': {
        const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 0 ${cx},${cy + effectiveRadius} A ${effectiveRadius * 0.7},${effectiveRadius} 0 0 1 ${cx},${cy - effectiveRadius} Z`;
        return (<> <circle cx={cx} cy={cy} r={effectiveRadius} className="moon-dark" /> <path d={d} className="moon-light" /> </>);
      }
      default: // Fallback to Full Moon
        return <circle cx={cx} cy={cy} r={effectiveRadius} className="moon-light" />;
    }
  };

  // Create descriptive texts for moon phases (used in tooltip)
  const getMoonPhaseDescription = (): string => {
    switch (phase) {
      case 'New Moon': return 'Darkness reigns; ideal for beginnings.';
      case 'Waxing Crescent': return 'Intentions grow; potential stirs.';
      case 'First Quarter': return 'Decisions arise; energy builds.';
      case 'Waxing Gibbous': return 'Refinement needed; power nears peak.';
      case 'Full Moon': return 'Peak power; potent harvests & magic.';
      case 'Waning Gibbous': return 'Gratitude & release; share abundance.';
      case 'Last Quarter': return 'Reflection & letting go; balance sought.';
      case 'Waning Crescent': return 'Rest & surrender; prepare anew.';
      default: return 'A mysterious lunar phase.';
    }
  };

   // Easter Egg: Add pulsing class on hover only during Full Moon
   const fullMoonHoverClass = (phase === 'Full Moon' && isHovering) ? 'pulsing-glow' : '';

  return (
    <div
      className={`lunar-phase-icon ${getPhaseClass()} ${fullMoonHoverClass}`}
      style={{ width: size, height: size, ...styleVars }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      title="" // Clear default title, use custom tooltip
    >
      <div className="lunar-phase-container">
        {/* SVG Moon */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          {renderMoonPhase()}
        </svg>

        {/* Tooltip */}
        <div className="lunar-phase-tooltip">
          {phase}: {getMoonPhaseDescription()}
        </div>
      </div>
    </div>
  );
};

export default LunarPhaseIcon;