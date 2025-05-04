import React, { useState, useEffect } from 'react';
import './KeyboardShortcutsHelp.css';

interface ShortcutCategory {
  title: string;
  shortcuts: ShortcutItem[];
}

interface ShortcutItem {
  key: string;       // The key(s) to press
  description: string;
  context?: string;  // Optional context where this shortcut applies
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ShortcutCategory[];
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
  categories
}) => {
  const [activeCategory, setActiveCategory] = useState<number>(0);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return;
    
    const dialog = document.getElementById('shortcuts-dialog');
    if (!dialog) return;
    
    // Find all focusable elements
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Focus the first element when dialog opens
    firstElement?.focus();
    
    // Handle tab key navigation
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      // If shift+tab on first element, move to last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
      
      // If tab on last element, move to first element
      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };
    
    // Handle escape key to close dialog
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Close if clicking outside the dialog
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="keyboard-shortcuts-overlay" onClick={handleBackdropClick}>
      <div 
        id="shortcuts-dialog"
        className="keyboard-shortcuts-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="shortcuts-header">
          <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
          >
            ×
          </button>
        </div>
        
        <div className="shortcuts-content">
          <div className="shortcuts-categories">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`category-button ${index === activeCategory ? 'active' : ''}`}
                onClick={() => setActiveCategory(index)}
              >
                {category.title}
              </button>
            ))}
          </div>
          
          <div className="shortcuts-list">
            <h3>{categories[activeCategory].title}</h3>
            <dl className="shortcut-items">
              {categories[activeCategory].shortcuts.map((shortcut, index) => (
                <div key={index} className="shortcut-item">
                  <dt className="shortcut-key">
                    {shortcut.key.split('+').map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        {keyIndex > 0 && <span className="key-separator">+</span>}
                        <kbd>{key}</kbd>
                      </React.Fragment>
                    ))}
                  </dt>
                  <dd className="shortcut-description">
                    {shortcut.description}
                    {shortcut.context && (
                      <span className="shortcut-context">{shortcut.context}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        
        <div className="shortcuts-footer">
          <button className="shortcuts-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;