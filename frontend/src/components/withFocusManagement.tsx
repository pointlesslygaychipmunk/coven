import React, { useRef, useEffect } from 'react';

/**
 * Higher-Order Component for Focus Management
 * 
 * This HOC helps ensure proper focus management for accessibility by:
 * 1. Restoring focus to the previously focused element when a component unmounts
 * 2. Setting focus to the component itself or a specific child element when it mounts
 * 3. Trapping focus within the component if needed (e.g., for modals)
 * 
 * @param WrappedComponent - The component to enhance with focus management
 * @param options - Configuration options
 * @returns Enhanced component with focus management
 */
export const withFocusManagement = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    autoFocus?: boolean;          // Should focus be set automatically on mount?
    focusSelector?: string;       // CSS selector for the element to focus within the component
    trapFocus?: boolean;          // Should focus be trapped within the component?
    restoreFocus?: boolean;       // Should focus be restored when the component unmounts?
    ariaRole?: string;            // ARIA role for the container element
    ariaLabel?: string;           // ARIA label for the container element
  } = {}
) => {
  const {
    autoFocus = false,
    focusSelector = null,
    trapFocus = false,
    restoreFocus = true,
    ariaRole = undefined,
    ariaLabel = undefined
  } = options;
  
  const FocusManaged: React.FC<P> = (props) => {
    // Refs for DOM elements and state
    const containerRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    
    // Effect to handle focus when component mounts/unmounts
    useEffect(() => {
      // Save previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Set focus on mount if autoFocus is true
      if (autoFocus && containerRef.current) {
        if (focusSelector) {
          // Focus specific element if selector is provided
          const elementToFocus = containerRef.current.querySelector<HTMLElement>(focusSelector);
          if (elementToFocus) {
            elementToFocus.focus();
          }
        } else {
          // Focus container itself
          containerRef.current.tabIndex = -1;
          containerRef.current.focus();
          // Remove tabIndex after focus to avoid keyboard tab ordering issues
          setTimeout(() => {
            if (containerRef.current && containerRef.current.tabIndex === -1) {
              containerRef.current.removeAttribute('tabindex');
            }
          }, 100);
        }
      }
      
      // Set up focus trap if enabled
      if (trapFocus && containerRef.current) {
        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key !== 'Tab' || !containerRef.current) return;
          
          // Find all focusable elements in the container
          const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length === 0) return;
          
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          // Handle Shift+Tab and Tab at boundaries
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        };
        
        document.addEventListener('keydown', handleTabKey);
        
        // Clean up event listener
        return () => {
          document.removeEventListener('keydown', handleTabKey);
          
          // Restore focus when component unmounts
          if (restoreFocus && previousFocusRef.current && previousFocusRef.current.focus) {
            previousFocusRef.current.focus();
          }
        };
      }
      
      // Restore focus when component unmounts (if not trapping focus)
      return () => {
        if (restoreFocus && previousFocusRef.current && previousFocusRef.current.focus) {
          previousFocusRef.current.focus();
        }
      };
    }, []);
    
    return (
      <div 
        ref={containerRef}
        role={ariaRole}
        aria-label={ariaLabel}
        className="focus-managed-container"
      >
        <WrappedComponent {...props} focusContainerRef={containerRef} />
      </div>
    );
  };
  
  // Set display name for debugging
  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  FocusManaged.displayName = `withFocusManagement(${wrappedComponentName})`;
  
  return FocusManaged;
};

export default withFocusManagement;