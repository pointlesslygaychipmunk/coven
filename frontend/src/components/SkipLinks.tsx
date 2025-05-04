import React from 'react';
import './SkipLinks.css';

interface SkipLink {
  id: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
}

/**
 * SkipLinks Component
 * 
 * Provides hidden links that become visible when focused, allowing keyboard users
 * to skip directly to main content areas without having to tab through navigation.
 * This is an essential accessibility feature for keyboard-only users.
 */
const SkipLinks: React.FC<SkipLinksProps> = ({ 
  links = [
    { id: 'main-content', label: 'Skip to main content' },
    { id: 'main-navigation', label: 'Skip to navigation' }
  ] 
}) => {
  return (
    <div className="skip-links-container">
      {links.map((link) => (
        <a 
          key={link.id}
          href={`#${link.id}`}
          className="skip-link"
          onClick={(e) => {
            // Handle click to make sure focus moves correctly
            const target = document.getElementById(link.id);
            if (target) {
              e.preventDefault();
              target.tabIndex = -1;
              target.focus();
              // Remove tabIndex after focus 
              setTimeout(() => {
                if (target.tabIndex === -1) {
                  target.removeAttribute('tabindex');
                }
              }, 1000);
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default SkipLinks;