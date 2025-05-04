import React, { useState, useEffect, KeyboardEvent } from 'react';
import './GameNavigation.css';

interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
}

interface GameNavigationProps {
  items: NavigationItem[];
  activeItem: string;
  onSelect: (id: string) => void;
  orientation?: 'horizontal' | 'vertical';
  style?: 'tabs' | 'buttons' | 'icons';
}

const GameNavigation: React.FC<GameNavigationProps> = ({
  items,
  activeItem,
  onSelect,
  orientation = 'horizontal',
  style = 'tabs'
}) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    const isHorizontal = orientation === 'horizontal';
    
    // Handle arrow keys for navigation
    switch (e.key) {
      case isHorizontal ? 'ArrowRight' : 'ArrowDown':
        e.preventDefault();
        const nextIndex = (index + 1) % items.length;
        setFocusedIndex(nextIndex);
        document.getElementById(`nav-item-${items[nextIndex].id}`)?.focus();
        break;
        
      case isHorizontal ? 'ArrowLeft' : 'ArrowUp':
        e.preventDefault();
        const prevIndex = (index - 1 + items.length) % items.length;
        setFocusedIndex(prevIndex);
        document.getElementById(`nav-item-${items[prevIndex].id}`)?.focus();
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!items[index].disabled) {
          onSelect(items[index].id);
        }
        break;
        
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        document.getElementById(`nav-item-${items[0].id}`)?.focus();
        break;
        
      case 'End':
        e.preventDefault();
        const lastIndex = items.length - 1;
        setFocusedIndex(lastIndex);
        document.getElementById(`nav-item-${items[lastIndex].id}`)?.focus();
        break;
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      // Skip if user is typing in an input
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      
      // Check if key matches any shortcuts
      items.forEach((item) => {
        if (
          item.shortcut &&
          e.key.toLowerCase() === item.shortcut.toLowerCase() &&
          !item.disabled
        ) {
          onSelect(item.id);
        }
      });
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [items, onSelect]);

  // Handle click on navigation item
  const handleClick = (id: string, disabled: boolean = false) => {
    if (!disabled) {
      onSelect(id);
    }
  };

  return (
    <nav 
      className={`game-navigation ${orientation} ${style}`}
      role="navigation"
      aria-label="Game navigation"
    >
      <ul 
        className="navigation-list"
        role={style === 'tabs' ? 'tablist' : 'menu'}
      >
        {items.map((item, index) => (
          <li 
            key={item.id}
            className="navigation-item-wrapper"
          >
            <button
              id={`nav-item-${item.id}`}
              className={`navigation-item ${item.id === activeItem ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              onClick={() => handleClick(item.id, item.disabled)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
              role={style === 'tabs' ? 'tab' : 'menuitem'}
              aria-selected={style === 'tabs' ? item.id === activeItem : undefined}
              aria-current={style !== 'tabs' ? item.id === activeItem : undefined}
              aria-disabled={item.disabled}
              tabIndex={item.id === activeItem || (focusedIndex === -1 && index === 0) ? 0 : -1}
              title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
            >
              {item.icon && <span className="item-icon">{item.icon}</span>}
              <span className="item-label">{item.label}</span>
              {item.shortcut && <span className="item-shortcut">{item.shortcut}</span>}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default GameNavigation;