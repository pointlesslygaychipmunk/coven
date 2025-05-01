# Witch's Coven: 90s Fantasy Game UI

This folder contains an alternate UI for the Witch's Coven game, designed to mimic the look and feel of 90s fantasy PC games like Heroes of Might and Magic III, Quest for Glory, and others, combined with a Korean Hanbang aesthetic.

## Overview

The 90s UI version features:

- Fixed 1024x768 game window with non-responsive, non-mobile layout
- Skeuomorphic UI with borders, panels, and decorative elements
- Pixel-inspired backgrounds and textures
- Hand-drawn SVG patterns and decorations
- ASCII art and retro styling for interactive elements
- Color palette inspired by fantasy games and Korean herbal aesthetics

## Running the 90s UI

You can run the 90s UI version with:

```bash
node run-90s-ui.js
```

This script will temporarily modify your vite.config.ts to use the 90s UI entry point (`index90s.tsx`) and restore the original configuration when you exit.

## Components

The 90s UI implementation includes the following files:

- `MainGameFrame.tsx` & `MainGameFrame.css` - Main layout container
- `Garden90s.tsx` & `Garden90s.css` - Garden view in 90s style
- `Brewing90s.tsx` & `Brewing90s.css` - Brewing chamber in 90s style
- `App90s.tsx` - Entry component with mock data
- `index90s.tsx` - Entry point for 90s UI
- `loadingScreen.css` - Styled 90s loading screen

## Design Principles

The design follows these key principles:

1. **Fixed Layout** - Uses exact pixel dimensions, fixed panels, and non-responsive design to mimic old PC games
2. **Visual Hierarchy** - Clear separation between panels using borders, backgrounds, and shadows
3. **Ornamentation** - Decorative corners, frames, and borders to create a fantasy aesthetic
4. **Skeuomorphism** - Buttons with outset/inset states, textured backgrounds, and physical-looking UI elements
5. **Period-Appropriate Typography** - Serif fonts like Times New Roman, monospace fonts for data
6. **Color Symbolism** - Different areas use different color schemes (purple for brewing, green for garden)

## Implementation Details

### SVG Patterns

The UI extensively uses SVG patterns for backgrounds and decorative elements. These are embedded directly in the CSS using data URLs, making them highly portable and eliminating the need for external image files.

### ASCII Art Styling

Inspired by ASCII art from the era, the UI uses special styling for buttons, icons, and interactive elements to create a retro feel.

### CSS Variables

The design uses a consistent set of CSS variables to maintain color harmony and enable theming changes.

### Animation

The UI includes subtle animations for elements like brewing effects, whispers, and interactive feedback, while keeping the overall feel authentic to the era.

## Future Work

Future work could include:

- Implementing remaining screens (Atelier, Market, Journal)
- Adding more ASCII art decorative elements
- Implementing a fullscreen toggle for better immersion
- Adding CRT/scan-line filters as an optional effect
- Expanding color themes for different seasons