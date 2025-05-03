# Witch's Coven: Glow Brightly

A witch-themed gardening and brewing simulation game with rich, immersive 90s-inspired visuals.

## About The Game

In Witch's Coven: Glow Brightly, you play as a witch tending to your magical garden, brewing potions, and interacting with the townsfolk. The game features:

- **Magical Gardening**: Plant and nurture herbs with mystical properties
- **Potion Brewing**: Create concoctions with your harvested ingredients
- **90s Fantasy UI**: Immersive interface inspired by classic fantasy games like Heroes of Might and Magic and Quest for Glory
- **Seasonal Cycles**: Experience how the changing seasons affect your garden and brewing
- **Witch Specializations**: Progress and specialize your character's abilities

## 90s UI Experience

The game features an enhanced 90s UI aesthetic that brings the nostalgic feel of classic fantasy games:

- **Rich Visual Elements**: SVG patterns for backgrounds, decorative borders, and ornate frames
- **Pixelated Styling**: Authentic pixel-art inspired elements maintain the retro feel
- **ASCII/Unicode Art**: Character-based representations for plants and game elements
- **Seasonal Themes**: Visual changes based on the current season
- **CRT Effects**: Optional scanline overlay for an authentic DOS-era experience

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## UI Preview

A static preview of the 90s UI is available at:
`/public/enhanced-90s-ui.html`

This page showcases all the visual elements and components used throughout the game interface.

## Game Assets

The visual elements are contained in:

- `/public/gameAssets/svgPatterns.js` - SVG background patterns and decorative elements
- `/public/gameAssets/pixelArt.js` - ASCII/Unicode art representations for game elements
- `/public/gameAssets/90sUIStyles.css` - Enhanced styling for the 90s UI look

## Controls

- **Mouse**: Primary interaction method
- **Navigation Buttons**: Located at the bottom of the screen for moving between different areas
- **URL Parameters**:
  - `?modern=true` - Use modern UI instead of 90s UI
  - `?standalone=true` - Run in standalone test mode
  - `?minimal=true` - Run in minimal mode for debugging

## Technical Notes

- The 90s UI is the default interface
- Built with React and TypeScript
- Uses Vite for fast development experience

## Credits

Created with love for a magical gaming experience that harkens back to the golden era of fantasy PC games.

---

✨ May your garden flourish under the moon's gentle glow ✨