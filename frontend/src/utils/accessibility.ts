/**
 * Accessibility Utilities
 * 
 * This module provides helpers for improving accessibility throughout the application.
 */

/**
 * Checks if two colors have sufficient contrast as per WCAG guidelines
 * @param foreground - Foreground color (text) in hex format (e.g., "#ffffff")
 * @param background - Background color in hex format (e.g., "#000000")
 * @param level - WCAG level to check against ('AA' or 'AAA')
 * @returns Whether the contrast is sufficient
 */
export const hasEnoughContrast = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  // Calculate relative luminance for a RGB color
  const getLuminance = (hexColor: string): number => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;
    
    // Calculate linear RGB values
    const linearR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const linearG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const linearB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
    // Calculate luminance
    return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
  };
  
  // Get luminance for both colors
  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);
  
  // Calculate contrast ratio
  const contrastRatio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  
  // Check against WCAG levels
  if (level === 'AA') {
    return contrastRatio >= 4.5; // WCAG AA requires 4.5:1 for normal text
  } else {
    return contrastRatio >= 7.0; // WCAG AAA requires 7:1 for normal text
  }
};

/**
 * Announces a message to screen readers using ARIA live regions
 * @param message - Message to announce
 * @param priority - Announcement priority ('polite' or 'assertive')
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  // Look for existing announcer element or create a new one
  let announcer = document.getElementById('screen-reader-announcer');
  
  if (!announcer) {
    // Create the announcer element
    announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
  } else {
    // Update priority if needed
    announcer.setAttribute('aria-live', priority);
  }
  
  // Clear existing content (helps ensure announcement)
  announcer.textContent = '';
  
  // Set new content (timeout helps ensure the change is announced)
  setTimeout(() => {
    if (announcer) {
      announcer.textContent = message;
    }
  }, 50);
};

/**
 * Creates an ID for ARIA labeling that's guaranteed to be unique
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 */
export const createAriaId = (prefix: string = 'aria'): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Adds skip links to the page for keyboard navigation
 * This should be called once during app initialization
 */
export const addSkipLinks = (): void => {
  // Check if skip links already exist
  if (document.querySelector('.skip-link')) return;
  
  // Create skip to main content link
  const skipToMain = document.createElement('a');
  skipToMain.className = 'skip-link';
  skipToMain.href = '#main-content';
  skipToMain.textContent = 'Skip to main content';
  
  // Create skip to navigation link
  const skipToNav = document.createElement('a');
  skipToNav.className = 'skip-link';
  skipToNav.href = '#main-navigation';
  skipToNav.textContent = 'Skip to navigation';
  
  // Add links to the beginning of the body
  document.body.insertBefore(skipToNav, document.body.firstChild);
  document.body.insertBefore(skipToMain, document.body.firstChild);
  
  // Add IDs to the main content and navigation elements if they don't exist
  const mainContent = document.querySelector('main');
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
  }
  
  const mainNav = document.querySelector('nav');
  if (mainNav && !mainNav.id) {
    mainNav.id = 'main-navigation';
  }
};

/**
 * Check if an element is currently visible to the user
 * @param element - Element to check
 * @returns Whether the element is visible
 */
export const isElementVisible = (element: HTMLElement): boolean => {
  if (!element) return false;
  
  // Check CSS visibility
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  
  // Check if element has zero dimensions
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }
  
  return true;
};

/**
 * Check if the current environment supports reduced motion
 * (helps implement motion-sensitive accessibility features)
 * @returns Whether reduced motion is preferred
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export default {
  hasEnoughContrast,
  announceToScreenReader,
  createAriaId,
  addSkipLinks,
  isElementVisible,
  prefersReducedMotion
};