import React from 'react';
import './BreadcrumbTrail.css';

interface BreadcrumbItem {
  id: string;
  label: string;
  path?: string; // Optional if you want to use it with react-router
  disabled?: boolean;
}

interface BreadcrumbTrailProps {
  items: BreadcrumbItem[];
  onNavigate: (id: string) => void;
  separator?: string;
  maxVisible?: number;
}

const BreadcrumbTrail: React.FC<BreadcrumbTrailProps> = ({
  items,
  onNavigate,
  separator = '›',
  maxVisible = 0 // 0 means show all
}) => {
  // Handle showing a limited number of items with ellipsis
  const visibleItems = React.useMemo(() => {
    if (maxVisible <= 0 || items.length <= maxVisible) {
      return items; // Show all items
    }
    
    // Always show first and last items, and add ellipsis
    if (maxVisible === 1) {
      return [items[0]]; // Show only the first item
    }
    
    if (maxVisible === 2) {
      return [items[0], items[items.length - 1]]; // Show first and last
    }
    
    if (maxVisible === 3) {
      return [
        items[0],
        { id: 'ellipsis', label: '...', disabled: true },
        items[items.length - 1]
      ];
    }
    
    // For maxVisible >= 4, show start, ellipsis, and end
    const ellipsisIndex = Math.floor(maxVisible / 2);
    return [
      ...items.slice(0, ellipsisIndex),
      { id: 'ellipsis', label: '...', disabled: true },
      ...items.slice(items.length - (maxVisible - ellipsisIndex - 1))
    ];
  }, [items, maxVisible]);

  return (
    <nav className="breadcrumb-trail" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {visibleItems.map((item, index) => (
          <li 
            key={item.id}
            className={`breadcrumb-item ${item.disabled ? 'disabled' : ''}`}
          >
            {index > 0 && (
              <span className="breadcrumb-separator" aria-hidden="true">
                {separator}
              </span>
            )}
            
            <button
              className="breadcrumb-link"
              onClick={() => !item.disabled && onNavigate(item.id)}
              disabled={item.disabled}
              aria-current={index === visibleItems.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbTrail;