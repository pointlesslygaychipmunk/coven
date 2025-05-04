# Pixelated Sierra-Style UI for Witch's Coven

This folder contains a Sierra adventure game-inspired UI for Witch's Coven, designed to mimic the elegant aesthetics of classic Sierra games like Quest for Glory and King's Quest, enhanced with a touch of pixel art for garden elements and UI details.

## Overview

The pixelated Sierra-style UI features:

- **Elegant adventure game aesthetics** - Based on Sierra's classic painterly look
- **Pixel-perfect garden elements** - Garden plot icons and details with retro pixel art
- **Crisp, detailed UI frames** - Panels and windows with pixel-perfect corners and borders
- **Seasonal visual themes** - Color transitions with pixelated pattern backgrounds
- **Full-screen immersive gameplay** - Traditional adventure game layout with pixel art details

## Visual Design Approach

The UI combines two classic game aesthetics:

1. **Sierra's painterly backgrounds** - Elegant, hand-painted background styling
2. **Pixel art details** - Sharp, pixel-perfect UI elements for interactive components like:
   - Garden plots with ASCII/Unicode pixel art for plants
   - Buttons with pixel-perfect borders and highlights
   - Inventory slots with pixel grid patterns
   - Dialog boxes with pixelated corners and accents

## Components

The pixelated Sierra UI implementation includes:

- **pixelatedSierra.css** - Core UI styling with pixel-perfect details
- **pixelIcons.js** - Pixel art icons and garden plot representations
- **sierraPatterns.js** - Painterly backgrounds with pixel grid overlays
- **sierraManager.js** - Runtime management of Sierra UI elements

## Preview

A static preview showcasing the pixelated Sierra UI elements is available at:

```
/public/pixelated-sierra-preview.html
```

This page demonstrates all UI components in their proper Sierra adventure game style with pixel art details.

## Design Elements

### Garden Plots

The garden interface features detailed pixel art representations for different plants:

```
·✧·     ·✿·     ·❀·
✧✧✧     ✿✿✿     ❀❀❀
·✧·     ·✿·     ·|·

·✤·     ❦❦❦     ❧·❧
✤✤✤     ·❦·     ·❧·
✤·✤     ·|·     ·|·
```

Each plant has a unique pixel art representation that maintains the elegant Sierra aesthetic while adding retro pixel art charm to the garden interface.

### Pixel-Perfect UI

UI elements feature pixel-perfect styling:

- **Buttons**: Sharp edges with pixel-perfect highlights and shadows
- **Panels**: Inset borders with pixel grid patterns
- **Dialog boxes**: Decorative pixel corners and clear borders
- **Inventory slots**: Grid-based layout with pixelated insets

### Seasonal Themes

Each season has its own pixelated background pattern and color scheme:

- **Spring**: Fresh green with subtle pixel dot pattern
- **Summer**: Golden wheat with diagonal pixel lines
- **Fall**: Auburn with scattered pixel leaf pattern
- **Winter**: Cool blue with pixel snowflake accents

## Using the UI

To switch between seasonal themes:

```javascript
// Apply a seasonal theme
window.applySierraSeasonalTheme('summer');

// Available themes: 'spring', 'summer', 'fall', 'winter'
```

To convert a garden UI section to pixelated Sierra style:

```javascript
window.convertToSierraGarden(gardenElement);
```

## Credits

Created with inspiration from Sierra's classic adventure games, enhanced with pixel art details to bring the garden to life with retro charm while maintaining the elegant Sierra aesthetic.

---

✧ May your garden flourish under the enchanted moon ✧