# Sierra Adventure Game Style UI Implementation

This document describes the implementation of a classic Sierra-style adventure game user interface for the Coven game.

## Overview

The Sierra adventure game UI is characterized by its pixelated, retro aesthetic used in classic games like King's Quest, Space Quest, and Leisure Suit Larry. Key features include:

- Pixelated graphics with sharp borders
- Parchment-like backgrounds
- Minimal animations that use frame-by-frame steps
- Simple rectangular buttons with pixel-art decorations
- Distinctive corner decorations
- High contrast interface elements
- Text windows with decorative borders
- Limited color palette

## Color Scheme

The UI uses a carefully selected color palette that mimics the Sierra color schemes:

```css
--sierra-bg: #e8d5b0;         /* Base parchment background */
--sierra-bg-dark: #d0b990;    /* Darker parchment for panels */
--sierra-bg-light: #f0e6d2;   /* Lighter parchment for input areas */
--sierra-bg-highlight: #fff7e0; /* Brightest parchment for highlights */
--sierra-bg-accent: #eac682;  /* Accent background */
--sierra-accent: #8b6d45;     /* Main accent/border color */
--sierra-accent-light: #c9a97d; /* Lighter accent color */
--sierra-text: #5a4930;       /* Main text color */
--sierra-text-highlight: #3a2910; /* Emphasized text */
--sierra-text-muted: #7d6b4e; /* De-emphasized text */
```

Different seasons have their own color variations:

```css
--sierra-spring-bg: #e8d8b0;
--sierra-spring-accent: #7d9153;
--sierra-summer-bg: #e6d5a5;
--sierra-summer-accent: #b06040;
--sierra-fall-bg: #e8cba0;
--sierra-fall-accent: #9c5a2d;
--sierra-winter-bg: #e0e0e8;
--sierra-winter-accent: #5c7b9c;
```

## Typography

The UI uses a pixel-art styled font for text:

```css
@font-face {
  font-family: 'PixelSierra';
  src: local('Times New Roman');
  font-weight: normal;
  font-style: normal;
  letter-spacing: 0.5px;
  -webkit-font-smoothing: none;
  font-smooth: never;
}
```

This creates a pixelated look while using the system's Times New Roman font, which closely resembles the fonts used in Sierra games.

## UI Elements

### Buttons

Buttons feature:
- Sharp corners with no rounded edges
- Two-tone borders
- Subtle "pressed" animations
- Hover effects
- Inner highlight borders

```css
.nav-button {
  background-color: var(--sierra-bg-light);
  border: 2px solid var(--sierra-accent);
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.3);
}

.nav-button::before {
  /* Inner highlight border */
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### Panels

Panels are styled with:
- Parchment backgrounds
- Thick borders
- Subtle pixel-art background patterns
- Corner decorations
- Header bars with distinct styling

```css
.game-panel {
  background-color: var(--sierra-bg-light);
  border: 3px solid var(--sierra-accent);
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
}

.panel-header {
  background-color: var(--sierra-accent);
  color: var(--sierra-bg-light);
}
```

### Pixel Art Icons

The UI uses embedded SVG-based pixel art icons for various interface elements:

- Mail icon
- Chat icon
- Garden icon
- Workshop icon
- Market icon
- Journal icon
- Calendar icon
- Clock icon
- End Day icon

These are defined in `pixelIcons.css` and can be used with the `.pixel-icon` class:

```html
<div class="pixel-icon pixel-icon-mail"></div>
```

## Decorative Elements

Decorative corner elements are used throughout the UI to create the classic Sierra look:

```css
.corner-decoration {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: transparent;
}

.corner-decoration.top-left {
  top: 0;
  left: 0;
  border-top: 3px solid var(--sierra-accent);
  border-left: 3px solid var(--sierra-accent);
}
```

## Animation

Animations are purposely limited and use step-based transitions to maintain the pixelated feel:

```css
@keyframes pixel-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.pixel-icon.has-notification::after {
  animation: pixel-pulse 1s infinite;
  animation-timing-function: steps(3, end);
}
```

## Implementation Files

The Sierra-style UI is implemented across several files:

- `pixelatedSierra.css` - Base styling for all Sierra UI elements
- `MainGameFrame.css` - Main game container and layout styling
- `pixelIcons.css` - Pixel art icons for the interface
- `MultiplayerMail.css` - Mail component styling
- `MultiplayerChat.css` - Chat component styling

## Usage

To apply the Sierra style to a component:

1. Add the class `pixelated` and `sierra-container` to the main element
2. Use corner decorations where appropriate
3. Follow the color palette
4. Maintain the pixelated aesthetics by using step animations and sharp corners

Example:
```html
<div className="pixelated sierra-container">
  <div className="corner-decoration top-left"></div>
  <div className="corner-decoration top-right"></div>
  <div className="corner-decoration bottom-left"></div>
  <div className="corner-decoration bottom-right"></div>
  
  <!-- Content here -->
</div>
```