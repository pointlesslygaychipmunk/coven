import React from 'react';
import './pixelatedSierra.css';
import './CombinedWorkshop.css';

/**
 * A simplified workshop component that renders a Sierra-style UI
 * This component doesn't have any dependencies or type constraints
 */
const SimplifiedWorkshop: React.FC = () => {
  return (
    <div className="combined-workshop-container sierra-container pixelated">
      {/* Decorative corners */}
      <div className="corner-decoration top-left"></div>
      <div className="corner-decoration top-right"></div>
      <div className="corner-decoration bottom-left"></div>
      <div className="corner-decoration bottom-right"></div>
      
      {/* Workshop header */}
      <div className="workshop-header sierra-panel">
        <h2 className="workshop-title">Witch's Workshop</h2>
        
        <div className="workshop-tabs">
          <button className="tab-button active">
            Cauldron & Brewing
          </button>
          <button className="tab-button">
            Atelier & Crafting
          </button>
          <button className="tab-button">
            Packaging & Design
          </button>
        </div>
        
        <div className="workshop-phase">
          <div className="moon-display">
            <div className="moon-symbol">●</div>
            <span className="phase-name">Full Moon</span>
          </div>
        </div>
      </div>
      
      {/* Workshop content */}
      <div className="workshop-content">
        <div className="brewing-section">
          <h3>Brewing Cauldron</h3>
          <p>This is a simplified workshop interface with pixelated Sierra-style UI.</p>
          
          <div className="sierra-panel">
            <div style={{padding: '20px', textAlign: 'center'}}>
              <div style={{fontSize: '48px', marginBottom: '20px'}}>🧪</div>
              <p>The unified workshop combines brewing, atelier, and packaging functionality in one interface.</p>
              <p>This implementation uses the pixelated Sierra adventure game UI style.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedWorkshop;