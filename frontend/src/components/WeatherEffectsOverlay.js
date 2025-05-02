import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo, useRef } from 'react';
import './WeatherEffectsOverlay.css';
const WeatherEffectsOverlay = ({ weatherType, intensity = 'medium', timeOfDay = 'day', season = 'Spring' }) => {
    const [thunderFlash, setThunderFlash] = useState(false);
    const [isMagicalEvent, setIsMagicalEvent] = useState(false); // Renamed state
    const containerRef = useRef(null);
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
        if (season === 'Spring') {
            counts.rain = Math.round(counts.rain * 1.1);
            counts.wind += 10;
        }
        if (season === 'Summer') {
            counts.fireflies += 20;
            counts.dust += 15;
            counts.rain = Math.round(counts.rain * 0.8);
        }
        if (season === 'Fall') {
            counts.wind += 25;
            counts.dust += 5;
        }
        if (season === 'Winter') {
            counts.snowflakes = Math.round(counts.snowflakes * 1.2);
            counts.wind = Math.round(counts.wind * 0.7);
        }
        return counts;
    }, [intensity, season]);
    // Trigger thunder flashes for stormy weather
    useEffect(() => {
        let thunderInterval = null;
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
        return () => { if (thunderInterval)
            clearTimeout(thunderInterval); setThunderFlash(false); };
    }, [weatherType]);
    // Trigger rare magical events (Easter Egg)
    useEffect(() => {
        let eventTimeout = null;
        let eventEndTimeout = null;
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
            if (eventTimeout)
                clearTimeout(eventTimeout);
            if (eventEndTimeout)
                clearTimeout(eventEndTimeout);
            setIsMagicalEvent(false); // Ensure it's off on cleanup
        };
    }, [weatherType, timeOfDay, season]); // Re-evaluate if these change
    // --- Render Functions for Particles ---
    const renderRainParticles = () => (_jsx("div", { className: "rain-container", children: Array.from({ length: particleCounts.rain }).map((_, i) => {
            const isWhimsical = Math.random() < 0.05; // 5% whimsical rain
            return (_jsx("div", { className: `rain-drop ${isWhimsical ? 'whimsical' : ''}`, style: {
                    left: `${Math.random() * 105 - 5}%`, // Allow slight off-screen start
                    '--fall-duration': `${0.5 + Math.random() * 0.7}s`,
                    animationDelay: `${Math.random() * 1.2}s`,
                } }, `rain-${i}`));
        }) }));
    const renderWindParticles = () => (_jsxs("div", { className: "wind-container", children: [Array.from({ length: particleCounts.wind }).map((_, i) => (_jsx("div", { className: "wind-particle", style: {
                    top: `${Math.random() * 100}%`,
                    '--wind-duration': `${1 + Math.random() * 2.5}s`,
                    animationDelay: `${Math.random() * 4}s`,
                } }, `wind-${i}`))), (season === 'Fall' || season === 'Spring') && Array.from({ length: season === 'Fall' ? 30 : 15 }).map((_, i) => (_jsx("div", { className: "wind-leaf", style: {
                    top: `${Math.random() * 100}%`,
                    '--leaf-duration': `${6 + Math.random() * 6}s`,
                    animationDelay: `${Math.random() * 8}s`,
                    transform: `scale(${0.7 + Math.random() * 0.6})`,
                } }, `leaf-${i}`)))] }));
    const renderStarParticles = () => (_jsxs("div", { className: "clear-night-overlay", children: [Array.from({ length: particleCounts.stars }).map((_, i) => {
                const isBig = Math.random() < 0.1;
                const isSparkle = Math.random() < 0.08;
                return (_jsx("div", { className: `star ${isBig ? 'big' : ''} ${isSparkle ? 'sparkle' : ''}`, style: {
                        top: `${Math.random() * 65}%`, // Concentrate higher up
                        left: `${Math.random() * 100}%`,
                        '--twinkle-duration': `${4 + Math.random() * 5}s`,
                        '--twinkle-delay': `${Math.random() * 8}s`,
                    } }, `star-${i}`));
            }), isSpecialNight] }));
    const renderDustParticles = () => (_jsx("div", { className: "dry-overlay", children: Array.from({ length: particleCounts.dust }).map((_, i) => (_jsx("div", { className: "dust-particle", style: {
                top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                '--dust-duration': `${10 + Math.random() * 10}s`,
                '--wind-x': `${-40 + Math.random() * 80}px`,
                '--wind-y': `${-40 + Math.random() * 80}px`,
                animationDelay: `${Math.random() * 8}s`,
            } }, `dust-${i}`))) }));
    const renderFogEffect = () => (_jsxs("div", { className: "fog-container", children: [_jsx("div", { className: "fog-layer" }), _jsx("div", { className: "fog-layer" }), _jsx("div", { className: "fog-layer" })] }));
    const renderCloudOverlay = () => _jsx("div", { className: "cloud-overlay" });
    const renderSnowflakes = () => (_jsx("div", { className: "snow-container", children: Array.from({ length: particleCounts.snowflakes }).map((_, i) => (_jsx("div", { className: "snowflake", style: {
                left: `${Math.random() * 100}%`,
                width: `${3 + Math.random() * 4}px`, height: `${3 + Math.random() * 4}px`, // Size variation
                '--snowfall-duration': `${8 + Math.random() * 8}s`,
                '--drift-x': `${-25 + Math.random() * 50}px`,
                animationDelay: `${Math.random() * 10}s`,
                opacity: 0.6 + Math.random() * 0.4, // Opacity variation
            } }, `snow-${i}`))) }));
    const renderFireflies = () => (timeOfDay === 'night' && (season === 'Summer' || season === 'Spring') && // Common in warmer months
        _jsx("div", { className: "firefly-container", children: Array.from({ length: particleCounts.fireflies }).map((_, i) => (_jsx("div", { className: "firefly", style: {
                    left: `${Math.random() * 100}%`, top: `${40 + Math.random() * 60}%`, // Tend to be lower
                    '--float-duration': `${15 + Math.random() * 15}s`,
                    '--glow-duration': `${1.5 + Math.random() * 2}s`,
                    '--x1': `${-80 + Math.random() * 160}px`, '--y1': `${-80 + Math.random() * 160}px`,
                    '--x2': `${-80 + Math.random() * 160}px`, '--y2': `${-80 + Math.random() * 160}px`,
                    animationDelay: `${Math.random() * 10}s, ${Math.random() * 2.5}s`,
                } }, `firefly-${i}`))) }));
    // Render Magical Event Easter Egg effects
    const renderMagicalEvent = () => (isMagicalEvent && (_jsxs("div", { className: `magical-event-overlay ${season.toLowerCase()}-magic`, children: [_jsx("div", { className: "magical-mist" }), Array.from({ length: particleCounts.magic_glows }).map((_, i) => (_jsx("div", { className: "magical-glow", style: {
                    top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 8}s`,
                    transform: `scale(${0.5 + Math.random() * 0.5})`
                } }, `mglow-${i}`))), Array.from({ length: particleCounts.spirits }).map((_, i) => {
                const duration = 25 + Math.random() * 20;
                const delay = Math.random() * 10;
                const opacity = 0.3 + Math.random() * 0.3;
                return (_jsx("div", { className: "spirit-entity", style: {
                        left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                        '--spirit-duration': `${duration}s`,
                        '--end-x': `${-100 + Math.random() * 200}px`,
                        '--end-y': `${-100 + Math.random() * 200}px`,
                        '--spirit-opacity': opacity, // Pass opacity as CSS var
                        animationDelay: `${delay}s`,
                        transform: `scale(${0.6 + Math.random() * 0.6})`,
                    } }, `spirit-${i}`));
            })] })));
    // Determine the main CSS class for the overlay
    const overlayClass = `weather-overlay ${weatherType} ${intensity} ${timeOfDay} ${season.toLowerCase()} ${isMagicalEvent ? 'magical' : ''}`;
    // Function to check if snowy conditions are present
    const shouldShowSnow = () => {
        return season === 'Winter' && (weatherType === 'normal' || weatherType === 'cloudy');
    };
    return (_jsxs("div", { className: overlayClass, ref: containerRef, children: [_jsx("div", { className: `time-overlay ${timeOfDay}` }), _jsx("div", { className: `seasonal-overlay ${season.toLowerCase()}-overlay` }), (weatherType === 'rainy' || weatherType === 'stormy') && renderRainParticles(), (weatherType === 'windy' || weatherType === 'stormy' || season === 'Fall') && renderWindParticles(), (weatherType === 'clear' || weatherType === 'normal') && timeOfDay === 'night' && renderStarParticles(), weatherType === 'foggy' && renderFogEffect(), (weatherType === 'cloudy' || weatherType === 'stormy') && renderCloudOverlay(), weatherType === 'dry' && renderDustParticles(), shouldShowSnow() && renderSnowflakes(), " ", renderFireflies(), renderMagicalEvent(), thunderFlash && _jsx("div", { className: "thunder-flash" })] }));
};
export default WeatherEffectsOverlay;
//# sourceMappingURL=WeatherEffectsOverlay.js.map