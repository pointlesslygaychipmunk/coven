// Enhanced Easter eggs and animations for Atelier90s component
// Sound effects for various interactions
export const SoundEffects = {
    // Standard UI sounds with authentic 90s feel
    select: 'data:audio/wav;base64,UklGRmQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABDMxlAQzMZQD00GUE+NRlCPjUZQz82GUQ/NhlFQDcZRkA3GUZANxlGQDcZRkA3GUZANxlFPzYZRD82GUM+NRlCPTQZQTwzGUA7MhhAOjEYQDkwGEE4MBdCOC8XQzguF0Q3LhdENS0XRTUsF0Y1LBdGNCsXRzQrF0cyKRdIMyoXSDIpF0kxKBdKMSgXSjEoF0oxKBdKMSgXSTEoF0kyKRdIMikXRzMqF0Y0KxdFNCwXRDUtF0M3LhdCOC8XQTgwF0A5MRhAOjIYQDszGEA8MxlAPTQZQT41GUIPuD1CDLc9Qwm2PUMJ',
    remove: 'data:audio/wav;base64,UklGRmQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABDMxlAQzMZQD00GUE+NRlCPjUZQz82GUQ/NhlFQDcZRkA3GUZANxlGQDcZRkA3GUZANxlFPzYZRD82GUM+NRlCPTQZQTwzGUA7MhhAOjEYQDkwGEE4MBdCOC8XQzguF0Q3LhdENS0XRTUsF0Y1LBdGNCsXRzQrF0cyKRdIMyoXSDIpF0kxKBdKMSgXSjEoF0oxKBdKMSgXSTEoF0kyKRdIMikXRzMqF0Y0KxdFNCwXRDUtF0M3LhdCOC8XQTgwF0A5MRhAOjIYQDszGEA8MxlAPTQZQT41GUIPuD1CDLc9Qwm2PUMJ',
    craft: 'data:audio/wav;base64,UklGRr4CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YZoCAAD/////////////////////////////////////////////l5eXWVlZWVlZl5eX////////MzMzAAAAAAAAMzMz////////MzMzr6+vr6+vMzMz//////5eXl1lZWVlZWZeXl////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////w==',
    click: 'data:audio/wav;base64,UklGRjwCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRQCAABPT09PT09PT09PT09QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBPT09PT09PT09PT09PT09PT09PT09PT09PT09KSkpCQkI6Ojo0NDQwMDAtLS0sLCwrKyspKSkoKCgnJycoKCgqKiotLS0yMjI5OTlBQUFKSkpSUlJYWFhdXV1hYWFkZGRmZmZnZ2doaGhnZ2dnZ2dmZmZkZGRiYmJeXl5ZWVlUVFROTk5ISEhCQkI8PDw2NjYyMjIvLy8tLS0rKysqKioqKiorKyssLCwuLi4xMTE1NTU5OTk+Pj5DQ0NISEhNTU1RUVFVVVVXV1daWlpbW1tcXFxcXFxcXFxbW1tZWVlXV1dVVVVSUlJPT09MTExISEhFRUVCQkI/Pz89PT08PDw7Ozs7Ozs7Ozs8PDw9PT0/Pz9AQEBDQ0NGRkZJSUlMTExPT09RUVFTU1NUVFRWVVVXV1dXV1dXV1dXV1dWVlZVVVVTU1NRUVFPTk5MTExKSkpHR0dFRUVDQ0NBQUFAQEBAQEBAQEBAQEBAQEBAQEFBQUJCQkNDQ0VFRUdHR0lJSUtLS01NTU9PT1FRUVJSUVNTU1RUVFRUVFRUVFNTU1JSUlFRUVBQUE5OTk1NTUtLS0pKSklJSUhISEhISEhISEhISEhISEhISUlJSUlJSUlJSUlJSkpKS0tLTExMTU1NTk5OT09PUFBQUFBQUE9PT09PT09PT09PT09PT09PT09PT09PT09OTk5OTk5OTk5OTk5OTk5OTk5OTk5PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PTw==',
    error: 'data:audio/wav;base64,UklGRiQEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAEAAAAAAD//wMACgARABYAEwAJAMP/X/8H//j+F/9m/93/YgDcAAsBAAHwAJ0APgDZ/2f/6f6B/jv+T/6L/vf+fv8LAG8AkQCVAIYAhAB9AHUAdgB+AI4AogCyAL4AyQDWAOYA+QANASkBRQFkAYgBpQHBAeABAAIgAkECZgKPArgC3gL/AiADQgNiA4MDnwO3A80D3QPvA/8DDAQWBBwEIAQhBCEEHgQYBBEEBwT8A/IDaQHJADYAkf8K//v+EP8w/2X/p//+/10AygBAAcABNgLXAioDNwG2/h/8GPpN+KT21fXl9Xf2v/eO+cr7Vv4XAT0D1wQuBmIHRAi0CNkIrwg8CMwHUgfPBi0G4AXUBTsGJAc7CEUJKQq0CvwKCQuOCqMJNQjiBlAF8AO0AosBigDz/7n/uP/l/ygAdADTAD0BwwFWAtQCUQPDA1EELgRyA3cCPQH6/77+ev1K/BD7+vnn+Nz33vbo9en0PPTD89vypfJA8vXxp/Fj8TTx6/CN8CTw5u+y747va++P78PvAPBJ8KHw//Fh8jDzO/SV9S33z/hx+gL8nf0a/9IA+QK7BK8G0wgRC00Nhw/aES0UfhbRGAwbIR0ZH+Ag2SFvIuYiJSORI7kjMyQrJMMjKyQnJMEjECN2Ir0h+CBpII4f0B7iHd8c1BvOGrEZhRhhF08WPxX8E4oSPhHUDygOUgx9CoQIqAa/BJ0CVQAl/ir8KPou+DH2OvRO8mzwju7G7MLqsejL5uHk9OI04WvfiN2S257ZttfM1frT/dEL0CfOns1bzdXNw87xz2zRN9NX1a7XLNrU3Jzfk+KZ5croU+vj7Y7wPvPn9XT4+vp9/fT/awJxBEcGXwgcCmwL8wwmDlIPDBCmEPwQ+xDgEH8Qzw/aDrUNJwyoCsMI7wbvBPICywCn/pT8g/pq+IP2mfTa8hnxfe/t7aTs/erS6e7oQ+jh5wfo/efQ5xzosujB6GvpFOoF6y/squ077RTu7u7l767wivFx8mTzYPRi9Vv2Yvdy+IP5k/qT+6D8mf2L/nT/SAAgAeoBvwKsA5gEfAVnBj4H6QeGCBAJXQmZCZ8JdgkFCW4IqQfKBuoFGAU7BGkDkwLVAfwA1ABgADIAwP80/6r+Lf7W/Zn9Z/0//R39DP0A/RX9K/1a/bP9Nf6k/hr/lP8YAJcAHAGvASIC1AJtAwIEsARiBfoFrQZLB/8HmAgnCbkJ7QnfCcUJiAkPCXsI0gdCB8QGPQbABUYFQAVjBUoFDQXwBOsExgSXBHQETQQcBPUD6QPUA8kDdQOR/0P9ZPol+Dn2tfSU8w7ypPDg7w/veu5Q7lDuQu5B7rnuPu/c76XwbvFR8lzzmfTp9VT3u/g7+sD7XP3//rUAaQIjBNwFiAcuCf0KvgxqDiQQgxHiElAUpBXmFhIYJhkkGvcalBskHA==',
    secret: 'data:audio/wav;base64,UklGRmIDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YT4DAAAAAAECAwQGBwkKDA0PEBITFRYYGRscHR8gIiMlJicoKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/v79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7+/v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPT0dDPzs3My8rJyMfGxcTDwsHAv768u7q5uLe2tbSzssA=',
    success: 'data:audio/wav;base64,UklGRuQBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YcABAAAAAAAA//8CAP//AAABAP///f8AAAEA//8AAAEA//8AAAIA/////wEA//8AAAEA//8AAAIA/////wIA/////wEA//8AAAEA//8BAAAA/v8AAAEA//8AAAEA//8BAAAA//8AAAEA//8AAAIA/////wEA//8AAAEA//8AAAIA/v///wIA/v///wIA/v///wIA/////wEA/////wIA/////wIA/////wEA//8AAAIA/////wIA/////wIA/////wEA//8AAAIA//8='
};
// Animation sequences for various elements
export const AnimationSequences = {
    // Classic DOS-style loading bar progress animation
    bootProgress: [
        '|------------|',
        '|#-----------|',
        '|##-----------|',
        '|###----------|',
        '|####---------|',
        '|#####--------|',
        '|######-------|',
        '|#######------|',
        '|########-----|',
        '|#########----|',
        '|##########---|',
        '|###########--|',
        '|############-|',
        '|#############|'
    ],
    // ASCII art for crafting animation
    craftingSequence: [
        `
     *
    ***
   *****
  *******
    | |
    \\_/
    `,
        `
      *
     ***
    *****
   *******
     | |
     \\_/
    `,
        `
       *
      ***
     *****
    *******
      | |
      \\_/
    `,
        `
        *
       ***
      *****
     *******
       | |
       \\_/
    `
    ],
    // ASCII bubbling effect
    bubbles: [
        `
     o
    
    
     O
      o
    `,
        `
      o
     O
    
      
     o
    `,
        `
     O
      o
     o
    
    
    `,
        `
    
     o
      O
     o
    
    `
    ]
};
// Secret codes that can be entered for different effects
export const SecretCodes = {
    // Konami Code - Up, Up, Down, Down, Left, Right, Left, Right, B, A
    konami: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
    // DOS Debug Mode - D, E, B, U, G
    debug: ['d', 'e', 'b', 'u', 'g'],
    // Rare Ingredients - R, A, R, E
    rare: ['r', 'a', 'r', 'e'],
    // Quality Boost - Q, 1, 0, 0
    quality: ['q', '1', '0', '0'],
    // Moon Phase Cycle - M, O, O, N
    moon: ['m', 'o', 'o', 'n']
};
// Secret message effects when codes are activated
export const SecretMessages = {
    konami: {
        message: "CHEAT ACTIVATED: DOUBLE CRAFT YIELD",
        color: "#00ff00",
        duration: 5000
    },
    debug: {
        message: "DEBUG MODE ACTIVE - INSPECT ELEMENT",
        color: "#ffff00",
        duration: 3000
    },
    rare: {
        message: "RARE INGREDIENTS DISCOVERED",
        color: "#ff00ff",
        duration: 4000
    },
    quality: {
        message: "QUALITY BOOST: ALL ITEMS 100%",
        color: "#00ffff",
        duration: 4000
    },
    moon: {
        message: "LUNAR CYCLE MANIPULATION ENABLED",
        color: "#aaaaff",
        duration: 3000
    }
};
// Screen effects for different actions
export const ScreenEffects = {
    // CRT flicker effect CSS
    crtFlicker: `
    animation: flicker 0.15s infinite;
    @keyframes flicker {
      0% { opacity: 1.0; }
      50% { opacity: 0.8; }
      100% { opacity: 1.0; }
    }
  `,
    // Glitch effect CSS
    glitchEffect: `
    animation: glitch 0.2s infinite;
    @keyframes glitch {
      0% { transform: translate(0); }
      20% { transform: translate(-2px, 2px); }
      40% { transform: translate(-2px, -2px); }
      60% { transform: translate(2px, 2px); }
      80% { transform: translate(2px, -2px); }
      100% { transform: translate(0); }
    }
  `,
    // Scan line effect
    scanLines: `
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.03) 50%,
      rgba(255, 255, 255, 0) 51%,
      rgba(255, 255, 255, 0.03) 100%
    );
    background-size: 100% 4px;
  `,
    // Screen static effect
    static: `
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c4zIKxAAAAZklEQVRIx+3RMRLAIAwDQBECNHNJxP4fs8LCDqjmdvl+soWI9JOkiZFEcVGykydRjJQe0gVQPIi0S6IkWR5RGkQxa7K9QnL7oQQUlwYUl8YGyxNQzI6i/ADE2bGKwwF3oWTjbt2bDRfQCH3W1AAAABB0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAASUVORK5CYII=');
    opacity: 0.05;
    pointer-events: none;
  `
};
// ASCII art for 90s-style decorations
export const AsciiArt = {
    cauldron: `
    _.-._
  .'     '.
 /  .-. ,_  \\
|  (o_)    |
 \\ '-'   _ /
  '.    ( )
    '._.'
  `,
    witch: `
     /\\
    /  \\
   |    |
  _|____|_
 (________)
  |      |
  |  ()  |
  |______|
  `,
    moon: `
     _.._
   .' .-. '.
  /  (o_)   \\
  |    |    |
  \\  '-'   /
   '.___.'
  `,
    star: `
      *
     /|\\
    /*|*\\
   / *** \\
      |
  `
};
// Classic DOS-style error messages
export const ErrorMessages = [
    "BAD COMMAND OR FILE NAME",
    "SYNTAX ERROR",
    "INSUFFICIENT MEMORY",
    "DEVICE NOT READY",
    "ILLEGAL FUNCTION CALL",
    "FILE NOT FOUND",
    "DISK FULL",
    "READ ERROR",
    "WRITE ERROR",
    "RUNTIME ERROR",
    "BUFFER OVERFLOW"
];
// Random tips that appear occasionally
export const RandomTips = [
    "TIP: Press the DEBUG key sequence to see hidden stats",
    "TIP: Full Moon phases increase the potency of Essence items",
    "TIP: Combining ingredients from the same season creates synergy",
    "TIP: Quality is affected by your specialization level",
    "TIP: Try unusual ingredient combinations to discover secret recipes",
    "TIP: There are several secret key combinations. Experiment!",
    "TIP: Certain moon phases align with specific specializations",
    "TIP: Higher level crafting unlocks rare property chances",
    "TIP: Click in the corners for hidden features",
    "TIP: Some ingredients only appear during certain seasons"
];
// Easter egg functions
export const checkCornerClicks = (corner, clickCount) => {
    // Different corners have different click thresholds for Easter eggs
    const thresholds = {
        topLeft: 3, // Classic 3-click corner
        topRight: 5, // 5 clicks for another Easter egg
        bottomLeft: 2, // Double-click corner
        bottomRight: 7 // Ultra secret corner (harder to trigger)
    };
    return clickCount >= thresholds[corner];
};
// Generate a "corrupted" flickering text for error effects
export const generateCorruptedText = (text) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:"<>?[]\\;\',./';
    let result = '';
    for (let i = 0; i < text.length; i++) {
        // 10% chance of corrupting each character
        if (Math.random() < 0.1) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        else {
            result += text.charAt(i);
        }
    }
    return result;
};
// Generate DOS-style boot text
export const generateBootText = (system, version) => {
    return [
        `LOADING ${system.toUpperCase()} ${version}...`,
        "CHECKING SYSTEM CONFIGURATION...",
        "INITIALIZING MEMORY STRUCTURES...",
        "LOADING CORE COMPONENTS...",
        "INITIALIZING GRAPHICS SUBSYSTEM...",
        "ESTABLISHING DATA CONNECTIONS...",
        "SYNCHRONIZING WITH EXTERNAL SYSTEMS...",
        "READY."
    ];
};
//# sourceMappingURL=Atelier90sEasterEggs.js.map