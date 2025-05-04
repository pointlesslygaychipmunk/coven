import React from 'react';

interface AccessibleIconProps {
  icon: React.ReactNode;        // The icon component or element
  label: string;                // Accessible label for the icon
  className?: string;           // Optional class name for styling
  role?: string;                // Optional ARIA role
  focusable?: boolean;          // Whether the icon should be focusable
  onClick?: () => void;         // Optional click handler
  style?: React.CSSProperties;  // Optional style object
}

/**
 * AccessibleIcon Component
 * 
 * This component wraps icons to ensure they are properly accessible to screen readers.
 * It can be used with any icon system (Font Awesome, Material Icons, custom SVGs, etc.)
 */
const AccessibleIcon: React.FC<AccessibleIconProps> = ({
  icon,
  label,
  className = '',
  role = 'img',
  focusable = false,
  onClick,
  style,
}) => {
  // Determine if this icon is interactive
  const isInteractive = !!onClick;
  
  // Set appropriate role based on whether the icon is interactive
  const iconRole = isInteractive ? 'button' : role;
  
  // Set appropriate tabIndex
  const tabIndex = (isInteractive && focusable) ? 0 : -1;

  return (
    <span
      className={`accessible-icon ${className}`}
      role={iconRole}
      aria-label={label}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={(e) => {
        // Handle keyboard activation for interactive icons
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {/* Visually present the icon */}
      <span aria-hidden="true">{icon}</span>
      
      {/* Visually hidden text for screen readers */}
      <span className="sr-only">{label}</span>
    </span>
  );
};

/**
 * Standalone version that can be used for icons that are purely decorative
 * (should be hidden from screen readers)
 */
export const DecorativeIcon: React.FC<{
  icon: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ icon, className = '', style }) => {
  return (
    <span
      className={`decorative-icon ${className}`}
      aria-hidden="true"
      style={style}
    >
      {icon}
    </span>
  );
};

export default AccessibleIcon;