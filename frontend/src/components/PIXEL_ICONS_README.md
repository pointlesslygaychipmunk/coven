# Pixel Icons for Sierra-Style UI

This document describes the pixel art icons implementation for the Sierra-style UI in the Coven game.

## Overview

The pixel icons are SVG-based assets embedded directly in CSS to maintain the pixelated Sierra adventure game aesthetic. These icons are designed to be small (16x16 pixels) and use the same color scheme as the rest of the UI for consistency.

## Icon Descriptions

The following pixel art icons have been implemented:

1. **Mail Icon** (`pixel-icon-mail`): A pixelated envelope for the mail system.
2. **Chat Icon** (`pixel-icon-chat`): A speech bubble for the chat system.
3. **Garden Icon** (`pixel-icon-garden`): A plant for the garden location.
4. **Workshop Icon** (`pixel-icon-workshop`): A cauldron for the workshop location.
5. **Market Icon** (`pixel-icon-market`): A shop for the market location.
6. **Journal Icon** (`pixel-icon-journal`): A book for the journal location.
7. **Calendar Icon** (`pixel-icon-calendar`): A calendar for date-related UI elements.
8. **Clock Icon** (`pixel-icon-clock`): A clock for time-related UI elements.
9. **End Day Icon** (`pixel-icon-end-day`): A moon and stars for the end day action.

## Implementation

The icons are implemented using inline SVG in CSS to ensure they:
1. Scale properly with the pixelated aesthetic
2. Use the game's color scheme from CSS variables
3. Can be easily reused throughout the UI
4. Don't require external assets to be loaded

## Usage

To use these icons in your components:

1. Import the CSS file:
```jsx
import './pixelIcons.css';
```

2. Add the icon using its class name:
```jsx
<div className="pixel-icon pixel-icon-mail"></div>
```

3. For modified versions, you can use additional classes:
```jsx
// For a larger icon
<div className="pixel-icon pixel-icon-mail pixel-icon-large"></div>

// For a darker variant
<div className="pixel-icon pixel-icon-mail pixel-icon-dark"></div>

// For an icon with a notification indicator
<div className="pixel-icon pixel-icon-mail has-notification"></div>
```

## Styling

The icons can be easily styled through CSS. For example:

```css
/* Change the size */
.my-component .pixel-icon {
  width: 24px;
  height: 24px;
}

/* Apply a filter effect */
.my-component .pixel-icon {
  filter: brightness(1.5);
}

/* Change the position */
.my-component .pixel-icon {
  margin-right: 8px;
}
```

## Customization

To add new icons:

1. Design a 16x16 pixel art icon (ideally with the same color scheme)
2. Convert it to SVG format
3. Add a new class to `pixelIcons.css` following the existing pattern

Example:
```css
.pixel-icon-new-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">/* SVG content here */</svg>');
}
```

## Notes

- The icons use inline SVG rather than image files to reduce HTTP requests and maintain the pixelated aesthetic
- Color variables (like `%238b6d45`) are URL-encoded references to the game's color scheme
- The notification animation uses CSS keyframes for a pulsing effect