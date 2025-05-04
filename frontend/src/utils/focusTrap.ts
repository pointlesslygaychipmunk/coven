/**
 * Focus Trap Utility
 * 
 * This utility helps implement keyboard navigation by trapping focus within a container
 * element, which is crucial for modal dialogs and similar UI patterns for accessibility.
 */

/**
 * Creates a focus trap within the specified element
 * @param container - The DOM element to trap focus within
 * @param initialFocusSelector - Optional CSS selector for the element to focus initially
 * @returns An object with methods to activate and deactivate the focus trap
 */
export const createFocusTrap = (
  container: HTMLElement,
  initialFocusSelector?: string
) => {
  // Save the element that had focus before trapping
  let previouslyFocusedElement: HTMLElement | null = null;
  
  // Find all focusable elements within the container
  const getFocusableElements = () => {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled') && el.offsetWidth > 0 && el.offsetHeight > 0);
  };
  
  // Set up focus trap
  const activate = () => {
    // Store the currently focused element so we can restore it later
    previouslyFocusedElement = document.activeElement as HTMLElement;
    
    // Focus the first focusable element or the specified initial element
    const focusableElements = getFocusableElements();
    
    if (focusableElements.length === 0) return;
    
    if (initialFocusSelector) {
      const initialElement = container.querySelector<HTMLElement>(initialFocusSelector);
      if (initialElement && focusableElements.includes(initialElement)) {
        initialElement.focus();
      } else {
        focusableElements[0].focus();
      }
    } else {
      focusableElements[0].focus();
    }
    
    // Set up event listener
    document.addEventListener('keydown', handleKeyDown);
  };
  
  // Handle tab key navigation
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Handle Tab and Shift+Tab
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };
  
  // Clean up focus trap
  const deactivate = () => {
    document.removeEventListener('keydown', handleKeyDown);
    
    // Restore focus to the element that had it before the trap was activated
    if (previouslyFocusedElement && previouslyFocusedElement.focus) {
      previouslyFocusedElement.focus();
    }
  };
  
  return {
    activate,
    deactivate
  };
};

/**
 * React hook version of focus trap for functional components
 * @param containerRef - React ref to the container element
 * @param isActive - Whether the focus trap should be active
 * @param initialFocusSelector - Optional CSS selector for the element to focus initially
 */
export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean,
  initialFocusSelector?: string
) => {
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const trap = createFocusTrap(containerRef.current, initialFocusSelector);
    trap.activate();
    
    return () => {
      trap.deactivate();
    };
  }, [containerRef, isActive, initialFocusSelector]);
};

export default createFocusTrap;