import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import './LunarPhaseIcon.css';
const LunarPhaseIcon = ({ phase, size = 40, showConstellation = true, }) => {
    // States for constellation and cosmic elements
    const [starElements, setStarElements] = useState([]);
    const [lineElements, setLineElements] = useState([]);
    const [cosmicSymbols, setCosmicSymbols] = useState([]);
    // Add pulsing class for full moon - no need for isHovering state
    const fullMoonPulseClass = phase === 'Full Moon' ? 'pulsing-glow' : '';
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
    };
    // Get a CSS class based on the phase for special effects
    const getPhaseClass = () => {
        switch (phase) {
            case 'Full Moon': return 'fullmoon';
            case 'New Moon': return 'newmoon';
            case 'Waxing Crescent':
            case 'First Quarter':
            case 'Waxing Gibbous':
                return 'waxing';
            case 'Waning Gibbous':
            case 'Last Quarter':
            case 'Waning Crescent':
                return 'waning';
            default: return '';
        }
    };
    // Generate cosmic symbols based on phase
    useEffect(() => {
        const symbols = [];
        const phaseClass = getPhaseClass();
        // Based on phase, add different Hanbang/Daoist inspired symbols
        if (phaseClass === 'waxing') {
            symbols.push(_jsx("div", { className: "cosmic-element waxing-element", children: "\u262F\uFE0E" }, "waxing"));
        }
        else if (phaseClass === 'waning') {
            symbols.push(_jsx("div", { className: "cosmic-element waning-element", children: "\u263D" }, "waning"));
        }
        else if (phaseClass === 'fullmoon') {
            symbols.push(_jsx("div", { className: "cosmic-element full-element", children: "\u2609" }, "full"));
        }
        else if (phaseClass === 'newmoon') {
            symbols.push(_jsx("div", { className: "cosmic-element new-element", children: "\u263E" }, "new"));
        }
        setCosmicSymbols(symbols);
    }, [phase]);
    // Generate constellation stars and lines when component mounts or size changes
    useEffect(() => {
        if (!showConstellation)
            return;
        // Generate stars
        const stars = [];
        const lines = [];
        const starPositions = [];
        // Generate 5-8 stars based on the moon phase
        const starCount = 5 + Math.floor(Math.random() * 4);
        for (let i = 0; i < starCount; i++) {
            // Create random positions around the moon (but not inside it)
            // Use angles to ensure stars are distributed around the circle
            const angle = (i / starCount) * 2 * Math.PI;
            // Distance from center (beyond moon radius but within wrapper)
            const distance = radius * (1.2 + Math.random() * 0.7);
            const x = cx + Math.cos(angle) * distance;
            const y = cy + Math.sin(angle) * distance;
            // Add some randomness to positions
            const jitterX = (Math.random() - 0.5) * radius * 0.3;
            const jitterY = (Math.random() - 0.5) * radius * 0.3;
            const finalX = x + jitterX;
            const finalY = y + jitterY;
            // Determine if this is a "bright" star (1 in 3 chance)
            const isBright = Math.random() < 0.3;
            // Store position for line creation
            starPositions.push({
                x: finalX,
                y: finalY,
                bright: isBright
            });
            // Create the star element
            stars.push(_jsx("div", { className: `constellation-star ${isBright ? 'bright' : ''}`, style: {
                    left: `${finalX / size * 100}%`,
                    top: `${finalY / size * 100}%`,
                    animationDelay: `${Math.random() * 4}s`
                } }, `star-${i}`));
        }
        // Now create lines between some of the stars
        // Connect approximately 60% of possible connections randomly
        const possibleLines = starPositions.length - 1;
        const linesToCreate = Math.ceil(possibleLines * 0.6);
        // Sort stars to create a somewhat coherent pattern
        // This creates a "path" through most stars
        const sortedStars = [...starPositions].sort((a, b) => a.x - b.x);
        // Create the selected lines
        for (let i = 0; i < Math.min(linesToCreate, sortedStars.length - 1); i++) {
            const star1 = sortedStars[i];
            const star2 = sortedStars[i + 1];
            // Calculate line attributes
            const length = Math.sqrt(Math.pow(star2.x - star1.x, 2) + Math.pow(star2.y - star1.y, 2));
            const angle = Math.atan2(star2.y - star1.y, star2.x - star1.x);
            lines.push(_jsx("div", { className: "constellation-line", style: {
                    left: `${star1.x / size * 100}%`,
                    top: `${star1.y / size * 100}%`,
                    width: `${length}px`,
                    transform: `rotate(${angle}rad)`,
                    opacity: 0.3 + Math.random() * 0.4,
                } }, `line-${i}`));
        }
        setStarElements(stars);
        setLineElements(lines);
    }, [size, showConstellation, phase, cx, cy, radius]);
    // Generate SVG paths for moon phases
    const renderMoonPhase = () => {
        switch (phase) {
            case 'New Moon':
                return _jsx("circle", { cx: cx, cy: cy, r: effectiveRadius, className: "moon-dark" });
            case 'Waxing Crescent': {
                const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 1 ${cx},${cy + effectiveRadius} A ${effectiveRadius * 0.7},${effectiveRadius} 0 0 0 ${cx},${cy - effectiveRadius} Z`;
                return (_jsxs(_Fragment, { children: [" ", _jsx("circle", { cx: cx, cy: cy, r: effectiveRadius, className: "moon-dark" }), " ", _jsx("path", { d: d, className: "moon-light" }), " "] }));
            }
            case 'First Quarter': {
                const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 1 ${cx},${cy + effectiveRadius} L ${cx},${cy - effectiveRadius} Z`;
                return (_jsxs(_Fragment, { children: [" ", _jsx("circle", { cx: cx, cy: cy, r: effectiveRadius, className: "moon-dark" }), " ", _jsx("path", { d: d, className: "moon-light" }), " "] }));
            }
            case 'Waxing Gibbous': {
                const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius * 0.7},${effectiveRadius} 0 0 1 ${cx},${cy + effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 0 ${cx},${cy - effectiveRadius} Z`;
                return (_jsxs(_Fragment, { children: [" ", _jsx("circle", { cx: cx, cy: cy, r: effectiveRadius, className: "moon-light" }), " ", _jsx("path", { d: d, className: "moon-dark" }), " "] }));
            }
            case 'Full Moon':
                return _jsx("circle", { cx: cx, cy: cy, r: effectiveRadius, className: "moon-light" });
            case 'Waning Gibbous': {
                const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius * 0.7},${effectiveRadius} 0 0 0 ${cx},${cy + effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 1 ${cx},${cy - effectiveRadius} Z`;
                return (_jsxs(_Fragment, { children: [" ", _jsx("circle", { cx: cx, cy: cy, r: effectiveRadius, className: "moon-light" }), " ", _jsx("path", { d: d, className: "moon-dark" }), " "] }));
            }
            case 'Last Quarter': {
                const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 0 ${cx},${cy + effectiveRadius} L ${cx},${cy - effectiveRadius} Z`;
                return (_jsxs(_Fragment, { children: [" ", _jsx("circle", { cx: cx, cy: cy, r: effectiveRadius, className: "moon-dark" }), " ", _jsx("path", { d: d, className: "moon-light" }), " "] }));
            }
            case 'Waning Crescent': {
                const d = `M ${cx},${cy - effectiveRadius} A ${effectiveRadius},${effectiveRadius} 0 0 0 ${cx},${cy + effectiveRadius} A ${effectiveRadius * 0.7},${effectiveRadius} 0 0 1 ${cx},${cy - effectiveRadius} Z`;
                return (_jsxs(_Fragment, { children: [" ", _jsx("circle", { cx: cx, cy: cy, r: effectiveRadius, className: "moon-dark" }), " ", _jsx("path", { d: d, className: "moon-light" }), " "] }));
            }
            default: // Fallback to Full Moon
                return _jsx("circle", { cx: cx, cy: cy, r: effectiveRadius, className: "moon-light" });
        }
    };
    // Create descriptive texts for moon phases (used in tooltip)
    const getMoonPhaseDescription = () => {
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
    // Get Hanbang-inspired description
    const getHanbangDescription = () => {
        switch (phase) {
            case 'New Moon': return 'Water Yin - For balancing energies, clearing paths';
            case 'Waxing Crescent': return 'Wood Yang - For growth & nurturing beginnings';
            case 'First Quarter': return 'Fire Yang - For strength & decision making';
            case 'Waxing Gibbous': return 'Earth Yang - For nurturing & building';
            case 'Full Moon': return 'Pure Yang - For completion & clarity';
            case 'Waning Gibbous': return 'Earth Yin - For harvesting & sharing';
            case 'Last Quarter': return 'Fire Yin - For transformation & release';
            case 'Waning Crescent': return 'Water Yin - For rest & introspection';
            default: return 'Balanced energies';
        }
    };
    // Create SVG filters for textures and glows
    const svgFilters = useMemo(() => (_jsx("svg", { width: "0", height: "0", style: { position: 'absolute' }, children: _jsxs("defs", { children: [_jsxs("filter", { id: "moonTexture", x: "-50%", y: "-50%", width: "200%", height: "200%", children: [_jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.65", numOctaves: "3", result: "noise" }), _jsx("feColorMatrix", { type: "saturate", values: "0" }), _jsx("feBlend", { in: "SourceGraphic", in2: "noise", mode: "multiply", result: "blend" }), _jsx("feComposite", { operator: "in", in: "blend", in2: "SourceGraphic" })] }), _jsxs("filter", { id: "moonGlow", x: "-50%", y: "-50%", width: "200%", height: "200%", children: [_jsx("feGaussianBlur", { in: "SourceAlpha", stdDeviation: "2", result: "blur" }), _jsx("feOffset", { in: "blur", dx: "0", dy: "0", result: "offsetBlur" }), _jsx("feFlood", { floodColor: "rgba(255,255,255,0.3)", result: "glowColor" }), _jsx("feComposite", { in: "glowColor", in2: "offsetBlur", operator: "in", result: "softGlow" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "softGlow" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] }), _jsxs("filter", { id: "fullMoonGlow", x: "-50%", y: "-50%", width: "200%", height: "200%", children: [_jsx("feGaussianBlur", { in: "SourceAlpha", stdDeviation: "3", result: "blur" }), _jsx("feOffset", { in: "blur", dx: "0", dy: "0", result: "offsetBlur" }), _jsx("feFlood", { floodColor: "rgba(228,219,238,0.5)", result: "glowColor" }), _jsx("feComposite", { in: "glowColor", in2: "offsetBlur", operator: "in", result: "softGlow" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "softGlow" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] })] }) })), []);
    return (_jsxs("div", { className: `lunar-phase-icon ${getPhaseClass()} ${fullMoonPulseClass}`, style: { width: size, height: size, ...styleVars }, title: "" // Clear default title, use custom tooltip
        , children: [svgFilters, _jsxs("div", { className: "lunar-phase-wrapper", children: [showConstellation && (_jsxs("div", { className: "constellation-background", children: [lineElements, starElements] })), _jsx("div", { className: "cosmic-elements", children: cosmicSymbols }), _jsx("div", { className: "lunar-phase-container", children: _jsx("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, "aria-hidden": "true", children: renderMoonPhase() }) }), _jsxs("div", { className: "lunar-phase-tooltip", children: [_jsx("div", { children: _jsx("strong", { children: phase }) }), _jsx("div", { children: getMoonPhaseDescription() }), _jsx("div", { style: { marginTop: "4px", fontSize: "11px", opacity: 0.9 }, children: getHanbangDescription() })] })] })] }));
};
export default LunarPhaseIcon;
//# sourceMappingURL=LunarPhaseIcon.js.map